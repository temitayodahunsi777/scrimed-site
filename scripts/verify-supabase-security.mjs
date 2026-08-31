#!/usr/bin/env node

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const selfTest = process.argv.includes("--self-test");
const strict = process.argv.includes("--strict");
const json = process.argv.includes("--json");

const hash = (value) => createHash("sha256").update(String(value)).digest("hex");

export function inspectProtectedMigrationSql(sql, source = "synthetic.sql") {
  const normalized = sql.replace(/--.*$/gm, " ").replace(/\s+/g, " ").toLowerCase();
  const tables = [...normalized.matchAll(/create table if not exists (private\.[a-z0-9_]+)/g)].map((match) => match[1]);
  const findings = [];

  for (const table of tables) {
    if (!normalized.includes(`alter table ${table} enable row level security`)) {
      findings.push(`RLS_NOT_ENABLED:${table}`);
    }
    const revokePattern = new RegExp(`revoke all on(?: table)? ${table.replace(".", "\\.")}[^;]*from[^;]*(?:public|anon)`, "i");
    if (!revokePattern.test(normalized)) findings.push(`PUBLIC_REVOKE_MISSING:${table}`);
  }

  const securityDefinerCount = (normalized.match(/security definer/g) ?? []).length;
  const safeSearchPathCount = (normalized.match(/set search_path = ''/g) ?? []).length;
  if (securityDefinerCount > safeSearchPathCount) findings.push("SECURITY_DEFINER_SEARCH_PATH_UNSAFE");
  if (/grant\s+(?:all|insert|update|delete)\s+on[^;]+\s+to\s+(?:public|anon)/i.test(normalized)) {
    findings.push("PUBLIC_WRITE_GRANT_DETECTED");
  }

  return {
    source,
    tables,
    securityDefinerCount,
    safeSearchPathCount,
    findings,
    passed: findings.length === 0,
    sqlFingerprint: hash(sql)
  };
}

export function inspectClientSecretExposure(files) {
  const findings = [];
  for (const file of files) {
    if (!/\.(?:ts|tsx|js|jsx|mjs)$/.test(file.path)) continue;
    if (/SUPABASE_SERVICE_ROLE|service_role\s*[:=]/i.test(file.content)) {
      findings.push(`SERVICE_ROLE_REFERENCE:${file.path}`);
    }
    if (/NEXT_PUBLIC_[A-Z0-9_]*(?:SERVICE|SECRET|PRIVATE|ADMIN)[A-Z0-9_]*/.test(file.content)) {
      findings.push(`PUBLIC_SECRET_ENV_REFERENCE:${file.path}`);
    }
  }
  return findings;
}

const directlyExecuted = path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url);

if (directlyExecuted && selfTest) {
  const safe = inspectProtectedMigrationSql(`
    create table if not exists private.records (id uuid primary key);
    alter table private.records enable row level security;
    revoke all on table private.records from public, anon, authenticated;
    create function private.safe() returns void language plpgsql security definer set search_path = '' as $$ begin end $$;
  `);
  assert.equal(safe.passed, true);
  assert.ok(inspectProtectedMigrationSql("create table if not exists private.records (id uuid);").findings.includes("RLS_NOT_ENABLED:private.records"));
  assert.ok(inspectClientSecretExposure([{ path: "app/client.ts", content: "const key = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY" }]).length > 0);
  console.log("pass SCRIMED Supabase security verifier self-test");
  process.exit(0);
}

if (directlyExecuted) {
  const authorization = JSON.parse(await readFile("config/pending-migration-authorization.json", "utf8"));
  const migrationReports = [];
  for (const migration of authorization.migrations) {
    migrationReports.push(inspectProtectedMigrationSql(await readFile(migration.path, "utf8"), migration.path));
  }

  const appFiles = [];
  async function collect(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const filePath = `${directory}/${entry.name}`;
      if (entry.isDirectory()) await collect(filePath);
      else if (/\.(?:ts|tsx|js|jsx|mjs)$/.test(entry.name)) {
        appFiles.push({ path: filePath, content: await readFile(filePath, "utf8") });
      }
    }
  }
  await collect("app");
  const clientSecretFindings = inspectClientSecretExposure(
    appFiles.filter((file) => /"use client"|'use client'/.test(file.content))
  );
  const findings = [...migrationReports.flatMap((report) => report.findings), ...clientSecretFindings];
  const report = {
    service: "scrimed-supabase-repository-security-assurance",
    status: findings.length ? "BLOCKED" : "PASS",
    projectReference: "yxacqdfeyojrjghpwike",
    repositoryControlsPassed: findings.length === 0,
    securityAdvisorWarning: "AUTH_LEAKED_PASSWORD_PROTECTION_OPEN",
    passwordlessProtectedAccess: "COMPENSATING_CONTROL_ACTIVE",
    leakedPasswordProtection: "DEFERRED_PLATFORM_CONTROL",
    passwordAuthSemanticStatus: "DEFERRED_HARDENING_FOR_PASSWORD_AUTH",
    passwordAuthWithoutVerifiedLeakedPasswordProtection: "DENY",
    productionDatabaseMutationPerformed: false,
    migrations: migrationReports,
    clientSecretFindings,
    findings,
    boundary: "Static repository assurance plus the current passwordless policy classification. The advisor warning remains open; live Auth drift, runtime RLS behavior, and production migration state require fresh operator evidence. Production and PHI authority remain denied."
  };
  const output = { ...report, evidenceFingerprint: hash(JSON.stringify(report)) };
  if (json) console.log(JSON.stringify(output, null, 2));
  else console.log(`${output.status === "PASS" ? "pass" : "blocked"} SCRIMED Supabase repository security assurance (${migrationReports.length} pending migrations, ${findings.length} findings, leaked-password warning retained)`);
  if (strict && findings.length) process.exitCode = 1;
}
