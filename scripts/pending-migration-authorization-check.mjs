#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const args = new Set(process.argv.slice(2));
const allowedArgs = new Set(["--json", "--self-test", "--strict"]);
const unknownArgs = [...args].filter((arg) => !allowedArgs.has(arg));
if (unknownArgs.length > 0) {
  throw new Error(`Unsupported pending-migration option: ${unknownArgs.join(", ")}`);
}

const manifestPath = "config/pending-migration-authorization.json";

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function removeFunctionBodies(sql) {
  return sql.replace(/\$\$[\s\S]*?\$\$/g, "$$FUNCTION_BODY_REDACTED$$");
}

function analyzeMigration(entry, sql) {
  const applyTimeSql = removeFunctionBodies(sql);
  const actualSha256 = sha256(sql);
  const applyTimeDataMutationDetected =
    /\b(?:insert\s+into|update\s+[a-z0-9_."]+\s+set|delete\s+from|truncate\s+(?:table\s+)?[a-z0-9_."]+)\b/i.test(
      applyTimeSql
    );
  const destructiveSchemaMutationDetected =
    /\b(?:drop\s+(?:table|schema)|alter\s+table\s+[a-z0-9_."]+\s+drop\s+column)\b/i.test(
      applyTimeSql
    );
  const hasPrivateLedger = /create\s+table\s+if\s+not\s+exists\s+private\./i.test(sql);
  const hasRls = /enable\s+row\s+level\s+security/i.test(sql);
  const hasPrivilegeRestriction = /revoke\s+all/i.test(sql);
  const hasAppendOnlyControl = /before\s+update\s+or\s+delete/i.test(sql);
  const hasCompositeTenantBinding =
    /foreign\s+key\s*\(\s*workspace_id\s*,\s*tenant_id\s*\)[\s\S]*?references\s+public\.pilot_workspaces\s*\(\s*id\s*,\s*tenant_id\s*\)/i.test(
      sql
    );

  return {
    ...entry,
    actualSha256,
    checksumMatches: actualSha256 === entry.sha256,
    applyTimeDataMutationDetected,
    destructiveSchemaMutationDetected,
    hasPrivateLedger,
    hasRls,
    hasPrivilegeRestriction,
    hasAppendOnlyControl,
    hasCompositeTenantBinding,
    staticReviewPassed:
      actualSha256 === entry.sha256
      && !applyTimeDataMutationDetected
      && !destructiveSchemaMutationDetected
      && hasPrivateLedger
      && hasRls
      && hasPrivilegeRestriction
      && hasAppendOnlyControl
      && hasCompositeTenantBinding
  };
}

async function buildReport() {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const migrations = [];
  for (const entry of manifest.migrations) {
    migrations.push(analyzeMigration(entry, await readFile(entry.path, "utf8")));
  }

  const paths = migrations.map((migration) => migration.path);
  const orderingValid = paths.every((path, index) => index === 0 || paths[index - 1] < path);
  const allStaticReviewsPassed =
    orderingValid
    && migrations.length === 3
    && migrations.every((migration) => migration.staticReviewPassed);
  const reportWithoutHash = {
    service: "scrimed-pending-migration-authorization",
    manifestVersion: manifest.version,
    productionObservation: manifest.productionObservation,
    orderingValid,
    allStaticReviewsPassed,
    disposableDatabaseDryRunPassed: false,
    productionApplicationAuthorized: false,
    migrations,
    decision: allStaticReviewsPassed
      ? "READY_FOR_DISPOSABLE_DRY_RUN_AUTHORIZATION"
      : "NEEDS_REVISION",
    boundary:
      "READY means static source review is complete for the next isolated dry-run gate. It does not authorize a production migration."
  };

  return {
    ...reportWithoutHash,
    packetFingerprint: sha256(JSON.stringify(reportWithoutHash))
  };
}

if (args.has("--self-test")) {
  const safeSql = `
    create table if not exists private.synthetic_ledger (
      tenant_id uuid not null,
      workspace_id uuid not null,
      foreign key (workspace_id, tenant_id)
        references public.pilot_workspaces(id, tenant_id)
    );
    alter table private.synthetic_ledger enable row level security;
    revoke all on private.synthetic_ledger from public;
    create trigger synthetic_immutable before update or delete on private.synthetic_ledger
      for each row execute function private.reject_mutation();
  `;
  const unsafeSql = `${safeSql}\ninsert into private.synthetic_ledger values (null, null);`;
  const safeEntry = { path: "synthetic.sql", sha256: sha256(safeSql), status: "READY" };
  if (!analyzeMigration(safeEntry, safeSql).staticReviewPassed) {
    throw new Error("Safe pending-migration fixture did not pass.");
  }
  if (analyzeMigration({ ...safeEntry, sha256: sha256(unsafeSql) }, unsafeSql).staticReviewPassed) {
    throw new Error("Apply-time data mutation fixture did not fail.");
  }
  console.log("pass SCRIMED pending-migration authorization self-test");
  process.exit(0);
}

const report = await buildReport();
if (args.has("--json")) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(
    `${report.allStaticReviewsPassed ? "pass" : "blocked"} SCRIMED pending migrations: ${report.decision}`
  );
  console.log(
    `ordering=${report.orderingValid} migrations=${report.migrations.length} packet=${report.packetFingerprint.slice(0, 16)}`
  );
  for (const migration of report.migrations) {
    console.log(
      `${migration.status} ${migration.name} checksum=${migration.actualSha256.slice(0, 16)} static_review=${migration.staticReviewPassed}`
    );
  }
  console.log("disposable_database_dry_run=false production_application_authorized=false");
  console.log(report.boundary);
}

if (args.has("--strict") && !report.allStaticReviewsPassed) {
  process.exitCode = 1;
}
