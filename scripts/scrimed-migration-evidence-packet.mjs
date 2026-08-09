#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";

const args = new Set(process.argv.slice(2));
const allowed = new Set(["--json", "--self-test"]);
const unknown = [...args].filter((arg) => !allowed.has(arg));
if (unknown.length) throw new Error(`Unsupported migration-packet option: ${unknown.join(", ")}`);

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function canonicalHash(value) {
  return sha256(JSON.stringify(value));
}

function analyzeSql(path, sql) {
  const normalized = sql.replace(/--.*$/gm, "").replace(/\s+/g, " ").trim();
  return {
    path,
    sqlHash: sha256(sql),
    statementFingerprint: sha256(normalized),
    destructiveOperationDetected: /\b(?:drop\s+(?:table|schema)|truncate\s+table)\b/i.test(normalized),
    rowLevelSecurityReferenced: /\benable\s+row\s+level\s+security\b/i.test(normalized),
    explicitPrivilegeChange: /\b(?:grant|revoke)\b/i.test(normalized),
    forwardRecoveryRequired: !/\bdown\s+migration\b/i.test(sql)
  };
}

async function buildPacket() {
  const names = (await readdir("supabase/migrations"))
    .filter((name) => /^\d+_[A-Za-z0-9_]+\.sql$/.test(name))
    .sort();
  const migrations = [];
  for (const name of names) {
    const path = `supabase/migrations/${name}`;
    migrations.push(analyzeSql(path, await readFile(path, "utf8")));
  }
  const migrationSetFingerprint = canonicalHash(migrations.map(({ path, sqlHash }) => ({ path, sqlHash })));
  const packetWithoutHash = {
    service: "scrimed-migration-evidence-packet",
    status: "STATIC_VALIDATION_COMPLETE_DISPOSABLE_DATABASE_REQUIRED",
    migrationCount: migrations.length,
    migrationSetFingerprint,
    migrations,
    staticValidationPassed: migrations.length > 0 && migrations.every((migration) => /^[0-9a-f]{64}$/.test(migration.sqlHash)),
    disposableDatabaseDryRunPassed: false,
    forwardMigrationPassed: false,
    rollbackOrForwardRecoveryVerified: false,
    rowCountInvariantsVerified: false,
    lockingDowntimeReviewed: false,
    phiLogExposureReviewed: false,
    databaseOwnerApprovalRecorded: false,
    productionMigrationAuthorized: false,
    nextAction: "Run this exact migration set against an isolated disposable database, capture invariant and recovery evidence, then obtain database-owner approval bound to the candidate and migration fingerprints."
  };
  return { ...packetWithoutHash, packetHash: canonicalHash(packetWithoutHash) };
}

if (args.has("--self-test")) {
  const safe = analyzeSql("synthetic.sql", "create table synthetic_example(id uuid); alter table synthetic_example enable row level security;");
  const unsafe = analyzeSql("synthetic.sql", "drop table synthetic_example;");
  if (safe.destructiveOperationDetected || !safe.rowLevelSecurityReferenced || !unsafe.destructiveOperationDetected) {
    throw new Error("Migration evidence analyzer self-test failed");
  }
  console.log("pass SCRIMED migration evidence analyzer self-test");
  process.exit(0);
}

const packet = await buildPacket();
if (!packet.staticValidationPassed) throw new Error("SCRIMED migration static validation failed");
if (args.has("--json")) console.log(JSON.stringify(packet, null, 2));
else {
  console.log(`report SCRIMED migration evidence: ${packet.status}`);
  console.log(`migrations=${packet.migrationCount} migration_set=${packet.migrationSetFingerprint.slice(0, 16)} packet=${packet.packetHash.slice(0, 16)}`);
  console.log("dry_run_passed=false database_owner_approval=false production_migration_authorized=false");
}
