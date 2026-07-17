#!/usr/bin/env node

import assert from "node:assert/strict";

import {
  getScrimedWorkMigrationSetStatus,
  isScrimedWorkMigrationSetVerified,
  SCRIMED_WORK_REQUIRED_MIGRATIONS,
  SCRIMED_WORK_REQUIRED_MIGRATION_SET_VERSION
} from "../app/lib/scrimed-work/migrationSet.ts";

const currentEnv = {
  SCRIMED_WORK_MIGRATIONS_VERIFIED: "true",
  SCRIMED_WORK_MIGRATION_EVIDENCE_ID: "supabase-work-advisor-20260716",
  SCRIMED_WORK_MIGRATION_SET_VERSION: "20260716184500",
  SCRIMED_WORK_REVIEW_QUEUE_APPROVAL_MIGRATION_VERIFIED: "true",
  SCRIMED_WORK_REVIEW_QUEUE_APPROVAL_MIGRATION_EVIDENCE_ID:
    "supabase-work-review-approval-20260715"
};

const current = getScrimedWorkMigrationSetStatus(currentEnv);
assert.equal(SCRIMED_WORK_REQUIRED_MIGRATION_SET_VERSION, "20260716184500");
assert.equal(SCRIMED_WORK_REQUIRED_MIGRATIONS.length, 10);
assert.deepEqual(current, {
  requiredVersion: "20260716184500",
  requiredCount: 10,
  configuredCurrent: true,
  primaryEvidenceBound: true,
  reviewApprovalEvidenceBound: true,
  verified: true
});
assert.equal(isScrimedWorkMigrationSetVerified(currentEnv), true);

for (const overrides of [
  { SCRIMED_WORK_MIGRATIONS_VERIFIED: "false" },
  { SCRIMED_WORK_MIGRATION_EVIDENCE_ID: "" },
  { SCRIMED_WORK_MIGRATION_EVIDENCE_ID: "bad" },
  { SCRIMED_WORK_MIGRATION_SET_VERSION: "20260716030000" },
  { SCRIMED_WORK_MIGRATION_SET_VERSION: "" },
  { SCRIMED_WORK_REVIEW_QUEUE_APPROVAL_MIGRATION_VERIFIED: "false" },
  { SCRIMED_WORK_REVIEW_QUEUE_APPROVAL_MIGRATION_EVIDENCE_ID: "" }
]) {
  assert.equal(
    isScrimedWorkMigrationSetVerified({ ...currentEnv, ...overrides }),
    false,
    `migration set should fail closed for ${JSON.stringify(overrides)}`
  );
}

assert.equal(
  JSON.stringify(current).includes("supabase-work-advisor-20260716"),
  false
);

console.log(
  "pass SCRIMED Work migration-set policy (ten required, stale or incomplete evidence blocked, identifiers omitted)"
);
