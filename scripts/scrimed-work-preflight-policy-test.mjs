#!/usr/bin/env node

import { spawnSync } from "node:child_process";

function runPreflight(migrationsVerified) {
  const result = spawnSync(process.execPath, ["scripts/scrimed-work-durable-store-preflight.mjs"], {
    encoding: "utf8",
    env: {
      ...process.env,
      NEXT_PUBLIC_SUPABASE_URL: "https://synthetic-example.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "nonsecret-publishable-test-value",
      SCRIMED_PILOT_INTAKE_PERSISTENCE_TOKEN: "nonsecret-runtime-test-value",
      SCRIMED_WORK_PROTECTED_WRITES_ENABLED: "true",
      SCRIMED_WORK_DURABLE_STORE_ENABLED: "true",
      SCRIMED_WORK_MIGRATIONS_VERIFIED: migrationsVerified,
      SCRIMED_WORK_MIGRATION_EVIDENCE_ID: "supabase-work-advisor-20260716",
      SCRIMED_WORK_MIGRATION_SET_VERSION: "20260716184500",
      SCRIMED_WORK_REVIEW_QUEUE_APPROVAL_MIGRATION_VERIFIED: "true",
      SCRIMED_WORK_REVIEW_QUEUE_APPROVAL_MIGRATION_EVIDENCE_ID:
        "supabase-work-review-approval-20260715",
      SCRIMED_WORKSPACE_SLUG: "atlas-synthetic-evaluation",
      SCRIMED_BEARER_TOKEN: "not-a-real-token"
    }
  });

  if (result.status !== 0) {
    throw new Error(`SCRIMED Work preflight policy test could not run: ${result.stderr.trim()}`);
  }

  return JSON.parse(result.stdout);
}

function migrationEvidenceCheck(report) {
  return report.checks.find((item) => item.check === "env-scrimed_work_migrations_verified");
}

const falseReport = runPreflight("false");
const falseCheck = migrationEvidenceCheck(falseReport);

if (falseReport.environment.SCRIMED_WORK_MIGRATIONS_VERIFIED !== false || falseCheck?.passed !== false) {
  throw new Error("SCRIMED_WORK_MIGRATIONS_VERIFIED=false must remain fail-closed.");
}

const trueReport = runPreflight("true");
const trueCheck = migrationEvidenceCheck(trueReport);

if (trueReport.environment.SCRIMED_WORK_MIGRATIONS_VERIFIED !== true || trueCheck?.passed !== true) {
  throw new Error("SCRIMED_WORK_MIGRATIONS_VERIFIED=true should satisfy only the migration-evidence check.");
}

if (trueReport.status !== "operator-action-required") {
  throw new Error("Migration evidence must not bypass the independent AAL2 token requirement.");
}

if (
  trueReport.migrationSet.requiredVersion !== "20260716184500" ||
  trueReport.migrationSet.requiredCount !== 10 ||
  trueReport.migrationSet.configuredCurrent !== true
) {
  throw new Error("Preflight must bind migration evidence to the current ten-migration set.");
}

const staleVersionResult = spawnSync(
  process.execPath,
  ["scripts/scrimed-work-durable-store-preflight.mjs"],
  {
    encoding: "utf8",
    env: {
      ...process.env,
      NEXT_PUBLIC_SUPABASE_URL: "https://synthetic-example.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "nonsecret-publishable-test-value",
      SCRIMED_PILOT_INTAKE_PERSISTENCE_TOKEN: "nonsecret-runtime-test-value",
      SCRIMED_WORK_PROTECTED_WRITES_ENABLED: "true",
      SCRIMED_WORK_DURABLE_STORE_ENABLED: "true",
      SCRIMED_WORK_MIGRATIONS_VERIFIED: "true",
      SCRIMED_WORK_MIGRATION_EVIDENCE_ID: "supabase-work-advisor-20260716",
      SCRIMED_WORK_MIGRATION_SET_VERSION: "20260716030000",
      SCRIMED_WORK_REVIEW_QUEUE_APPROVAL_MIGRATION_VERIFIED: "true",
      SCRIMED_WORK_REVIEW_QUEUE_APPROVAL_MIGRATION_EVIDENCE_ID:
        "supabase-work-review-approval-20260715",
      SCRIMED_WORKSPACE_SLUG: "atlas-synthetic-evaluation",
      SCRIMED_BEARER_TOKEN: "not-a-real-token"
    }
  }
);

if (staleVersionResult.status !== 0) {
  throw new Error(`Stale migration-set preflight could not run: ${staleVersionResult.stderr.trim()}`);
}

const staleVersionReport = JSON.parse(staleVersionResult.stdout);
const staleVersionCheck = staleVersionReport.checks.find(
  (item) => item.check === "env-scrimed_work_migration_set_version"
);

if (
  staleVersionReport.environment.SCRIMED_WORK_MIGRATION_SET_VERSION !== false ||
  staleVersionReport.migrationSet.configuredCurrent !== false ||
  staleVersionCheck?.passed !== false
) {
  throw new Error("A stale migration-set version must remain fail-closed.");
}

console.log(
  "pass SCRIMED Work preflight policy test (false blocked, current set scoped, stale set blocked, AAL2 independent)"
);
