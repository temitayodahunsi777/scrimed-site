#!/usr/bin/env node

import assert from "node:assert/strict";
import { createHmac } from "node:crypto";

import { getScrimedWorkCanaryAuthenticationMessage } from "../app/lib/scrimed-work/canaryAttestation.ts";
import { getScrimedWorkProductionHardeningGate } from "../app/lib/scrimed-work/productionHardening.ts";

const baseEnv = {
  NEXT_PUBLIC_SUPABASE_URL: "https://synthetic-example.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "nonsecret-publishable-test-value",
  SCRIMED_PILOT_INTAKE_PERSISTENCE_TOKEN: "nonsecret-runtime-test-value",
  SCRIMED_WORK_PROTECTED_WRITES_ENABLED: "true",
  SCRIMED_WORK_DURABLE_STORE_ENABLED: "true",
  SCRIMED_WORK_MIGRATIONS_VERIFIED: "true",
  SCRIMED_WORK_MIGRATION_EVIDENCE_ID: "supabase-work-advisor-20260716",
  SCRIMED_WORK_MIGRATION_SET_VERSION: "20260716184500",
  SCRIMED_WORK_REVIEW_QUEUE_APPROVAL_MIGRATION_VERIFIED: "true",
  SCRIMED_WORK_REVIEW_QUEUE_APPROVAL_MIGRATION_EVIDENCE_ID:
    "supabase-work-review-approval-20260715",
  SCRIMED_WORKSPACE_SLUG: "atlas-synthetic-evaluation",
  SCRIMED_CONSEQUENTIAL_ACTIONS_ENABLED: "false",
  VERCEL_GIT_COMMIT_SHA: "a".repeat(40)
};
const canaryEvidenceDigest = "c".repeat(64);
const canaryCompletedAt = "2026-07-14T00:00:00.000Z";
const canaryEvaluatedAt = "2026-07-14T01:00:00.000Z";
const canaryAuthenticationTag = createHmac(
  "sha256",
  baseEnv.SCRIMED_PILOT_INTAKE_PERSISTENCE_TOKEN
)
  .update(getScrimedWorkCanaryAuthenticationMessage({
    evidenceDigest: canaryEvidenceDigest,
    releaseSha: baseEnv.VERCEL_GIT_COMMIT_SHA,
    workspaceSlug: baseEnv.SCRIMED_WORKSPACE_SLUG,
    completedAt: canaryCompletedAt
  }))
  .digest("hex");
const authenticatedCanaryEvidenceId =
  `scrimed-work-canary-${canaryEvidenceDigest}.${canaryAuthenticationTag}`;

function gate(report, gateId) {
  const value = report.gates.find((item) => item.gateId === gateId);
  assert.ok(value, `missing ${gateId}`);
  return value;
}

const localRateLimitOnly = getScrimedWorkProductionHardeningGate(
  baseEnv,
  "2026-07-14T00:00:00.000Z"
);
assert.equal(localRateLimitOnly.mutationRateLimit.mode, "bounded-memory");
assert.equal(
  gate(localRateLimitOnly, "scrimed-work-distributed-mutation-rate-limit").status,
  "operator_required"
);
assert.equal(localRateLimitOnly.canRunStrictNonProductionSmoke, false);

const productionRateLimitMissing = getScrimedWorkProductionHardeningGate(
  {
    ...baseEnv,
    VERCEL_ENV: "production",
    SCRIMED_BEARER_TOKEN: "operator-token-test-value",
    SCRIMED_REVIEWER_BEARER_TOKEN: "reviewer-token-test-value"
  },
  "2026-07-14T00:00:00.000Z"
);
assert.equal(productionRateLimitMissing.mutationRateLimit.mode, "distributed-required");
assert.equal(productionRateLimitMissing.mutationRateLimit.readyForProtectedMutations, false);
assert.equal(productionRateLimitMissing.canRunStrictNonProductionSmoke, false);
assert.match(
  gate(productionRateLimitMissing, "scrimed-work-distributed-mutation-rate-limit").blocker ?? "",
  /distributed Upstash/i
);

const productionRateLimitReady = getScrimedWorkProductionHardeningGate(
  {
    ...baseEnv,
    VERCEL_ENV: "production",
    SCRIMED_WORK_RATE_LIMIT_MODE: "bounded-memory",
    UPSTASH_REDIS_REST_URL: "https://synthetic-upstash.example",
    UPSTASH_REDIS_REST_TOKEN: "nonsecret-test-token",
    SCRIMED_BEARER_TOKEN: "operator-token-test-value",
    SCRIMED_REVIEWER_BEARER_TOKEN: "reviewer-token-test-value"
  },
  "2026-07-14T00:00:00.000Z"
);
assert.equal(productionRateLimitReady.mutationRateLimit.mode, "distributed-required");
assert.equal(productionRateLimitReady.mutationRateLimit.downgradePrevented, true);
assert.equal(productionRateLimitReady.mutationRateLimit.readyForProtectedMutations, true);
assert.equal(productionRateLimitReady.canRunStrictNonProductionSmoke, true);
assert.equal(
  gate(productionRateLimitReady, "scrimed-work-distributed-mutation-rate-limit").status,
  "evidence_ready"
);

const invalidRateLimitMode = getScrimedWorkProductionHardeningGate(
  {
    ...baseEnv,
    SCRIMED_WORK_RATE_LIMIT_MODE: "permissive"
  },
  "2026-07-14T00:00:00.000Z"
);
assert.equal(invalidRateLimitMode.status, "blocked");
assert.equal(
  gate(invalidRateLimitMode, "scrimed-work-distributed-mutation-rate-limit").status,
  "blocked"
);

const missingReviewApprovalMigration = getScrimedWorkProductionHardeningGate(
  {
    ...baseEnv,
    SCRIMED_WORK_REVIEW_QUEUE_APPROVAL_MIGRATION_VERIFIED: "false",
    SCRIMED_WORK_REVIEW_QUEUE_APPROVAL_MIGRATION_EVIDENCE_ID: ""
  },
  "2026-07-15T00:00:00.000Z"
);

assert.equal(
  gate(missingReviewApprovalMigration, "scrimed-work-migration-application").status,
  "operator_required"
);
assert.match(
  gate(missingReviewApprovalMigration, "scrimed-work-migration-application").blocker ?? "",
  /all ten ordered migrations/i
);

const staleMigrationSet = getScrimedWorkProductionHardeningGate(
  {
    ...baseEnv,
    SCRIMED_WORK_MIGRATION_SET_VERSION: "20260716030000",
    SCRIMED_BEARER_TOKEN: "operator-token-test-value",
    SCRIMED_REVIEWER_BEARER_TOKEN: "reviewer-token-test-value"
  },
  "2026-07-16T00:00:00.000Z"
);

assert.equal(staleMigrationSet.migrationSet.configuredCurrent, false);
assert.equal(staleMigrationSet.migrationSet.verified, false);
assert.equal(staleMigrationSet.canRunStrictNonProductionSmoke, false);
assert.equal(
  gate(staleMigrationSet, "scrimed-work-migration-application").status,
  "operator_required"
);
assert.match(
  gate(staleMigrationSet, "scrimed-work-migration-application").blocker ?? "",
  /20260716184500/
);

const missingReviewer = getScrimedWorkProductionHardeningGate(
  {
    ...baseEnv,
    SCRIMED_BEARER_TOKEN: "operator-token-test-value"
  },
  "2026-07-14T00:00:00.000Z"
);

assert.equal(missingReviewer.canRunStrictNonProductionSmoke, false);
assert.equal(missingReviewer.canaryEligible, false);
assert.equal(
  gate(missingReviewer, "scrimed-work-aal2-reviewer-session").status,
  "operator_required"
);
assert.match(
  gate(missingReviewer, "scrimed-work-aal2-reviewer-session").blocker ?? "",
  /separately enrolled human reviewer/i
);

const tokensReady = getScrimedWorkProductionHardeningGate(
  {
    ...baseEnv,
    SCRIMED_BEARER_TOKEN: "operator-token-test-value",
    SCRIMED_REVIEWER_BEARER_TOKEN: "reviewer-token-test-value"
  },
  "2026-07-14T00:00:00.000Z"
);

assert.equal(tokensReady.canRunStrictNonProductionSmoke, true);
assert.equal(tokensReady.canaryEligible, true);
assert.equal(gate(tokensReady, "scrimed-work-canary-release").status, "operator_required");
assert.equal(JSON.stringify(tokensReady).includes("operator-token-test-value"), false);
assert.equal(JSON.stringify(tokensReady).includes("reviewer-token-test-value"), false);

const malformedEvidence = getScrimedWorkProductionHardeningGate(
  {
    ...baseEnv,
    SCRIMED_WORK_TWO_IDENTITY_CANARY_VERIFIED: "true",
    SCRIMED_WORK_TWO_IDENTITY_CANARY_EVIDENCE_ID: "bad",
    SCRIMED_WORK_TWO_IDENTITY_CANARY_RELEASE_SHA: "a".repeat(40),
    SCRIMED_WORK_TWO_IDENTITY_CANARY_COMPLETED_AT: canaryCompletedAt
  },
  "2026-07-14T00:00:00.000Z"
);

assert.equal(gate(malformedEvidence, "scrimed-work-canary-release").status, "operator_required");

const missingCompletionTimestamp = getScrimedWorkProductionHardeningGate(
  {
    ...baseEnv,
    SCRIMED_WORK_TWO_IDENTITY_CANARY_VERIFIED: "true",
    SCRIMED_WORK_TWO_IDENTITY_CANARY_EVIDENCE_ID: authenticatedCanaryEvidenceId,
    SCRIMED_WORK_TWO_IDENTITY_CANARY_RELEASE_SHA: "a".repeat(40)
  },
  canaryEvaluatedAt
);

assert.equal(missingCompletionTimestamp.releaseBinding.fresh, false);
assert.match(
  gate(missingCompletionTimestamp, "scrimed-work-canary-release").blocker ?? "",
  /completion timestamp/i
);

const forgedEvidence = getScrimedWorkProductionHardeningGate(
  {
    ...baseEnv,
    SCRIMED_WORK_TWO_IDENTITY_CANARY_VERIFIED: "true",
    SCRIMED_WORK_TWO_IDENTITY_CANARY_EVIDENCE_ID:
      `scrimed-work-canary-${"c".repeat(64)}.${"d".repeat(64)}`,
    SCRIMED_WORK_TWO_IDENTITY_CANARY_RELEASE_SHA: "a".repeat(40),
    SCRIMED_WORK_TWO_IDENTITY_CANARY_COMPLETED_AT: canaryCompletedAt
  },
  "2026-07-14T00:00:00.000Z"
);

assert.equal(forgedEvidence.releaseBinding.evidenceIdFormatValid, true);
assert.equal(forgedEvidence.releaseBinding.evidenceIdAuthenticated, false);
assert.equal(gate(forgedEvidence, "scrimed-work-canary-release").status, "operator_required");
assert.match(
  gate(forgedEvidence, "scrimed-work-canary-release").blocker ?? "",
  /not authenticated/i
);

const verifiedEvidence = getScrimedWorkProductionHardeningGate(
  {
    ...baseEnv,
    SCRIMED_WORK_TWO_IDENTITY_CANARY_VERIFIED: "true",
    SCRIMED_WORK_TWO_IDENTITY_CANARY_EVIDENCE_ID: authenticatedCanaryEvidenceId,
    SCRIMED_WORK_TWO_IDENTITY_CANARY_RELEASE_SHA: "a".repeat(40),
    SCRIMED_WORK_TWO_IDENTITY_CANARY_COMPLETED_AT: canaryCompletedAt
  },
  canaryEvaluatedAt
);

assert.equal(gate(verifiedEvidence, "scrimed-work-aal2-operator-session").status, "evidence_ready");
assert.equal(gate(verifiedEvidence, "scrimed-work-aal2-reviewer-session").status, "evidence_ready");
assert.equal(gate(verifiedEvidence, "scrimed-work-canary-release").status, "evidence_ready");
assert.deepEqual(verifiedEvidence.releaseBinding, {
  currentReleaseShaFingerprint: "a".repeat(12),
  canaryReleaseShaFingerprint: "a".repeat(12),
  evidenceIdFormatValid: true,
  evidenceIdAuthenticated: true,
  workspaceSlug: "atlas-synthetic-evaluation",
  workspaceBound: true,
  completedAt: canaryCompletedAt,
  ageHours: 1,
  maxAgeHours: 72,
  fresh: true,
  matched: true
});
assert.deepEqual(verifiedEvidence.migrationSet, {
  requiredVersion: "20260716184500",
  requiredCount: 10,
  configuredCurrent: true,
  verified: true
});
assert.equal(verifiedEvidence.canRunStrictNonProductionSmoke, false);
assert.equal(verifiedEvidence.canaryEligible, false);
assert.ok(
  verifiedEvidence.strictSmokeCommands.includes("npm run smoke:scrimed-work:two-identity:strict")
);

const staleReleaseEvidence = getScrimedWorkProductionHardeningGate(
  {
    ...baseEnv,
    SCRIMED_WORK_TWO_IDENTITY_CANARY_VERIFIED: "true",
    SCRIMED_WORK_TWO_IDENTITY_CANARY_EVIDENCE_ID: authenticatedCanaryEvidenceId,
    SCRIMED_WORK_TWO_IDENTITY_CANARY_RELEASE_SHA: "b".repeat(40),
    SCRIMED_WORK_TWO_IDENTITY_CANARY_COMPLETED_AT: canaryCompletedAt
  },
  canaryEvaluatedAt
);

assert.equal(gate(staleReleaseEvidence, "scrimed-work-canary-release").status, "operator_required");
assert.match(
  gate(staleReleaseEvidence, "scrimed-work-canary-release").blocker ?? "",
  /exact current release sha/i
);
assert.equal(staleReleaseEvidence.releaseBinding.evidenceIdFormatValid, true);
assert.equal(staleReleaseEvidence.releaseBinding.evidenceIdAuthenticated, false);
assert.equal(staleReleaseEvidence.releaseBinding.matched, false);

const staleCompletionEvidence = getScrimedWorkProductionHardeningGate(
  {
    ...baseEnv,
    SCRIMED_WORK_TWO_IDENTITY_CANARY_VERIFIED: "true",
    SCRIMED_WORK_TWO_IDENTITY_CANARY_EVIDENCE_ID: authenticatedCanaryEvidenceId,
    SCRIMED_WORK_TWO_IDENTITY_CANARY_RELEASE_SHA: "a".repeat(40),
    SCRIMED_WORK_TWO_IDENTITY_CANARY_COMPLETED_AT: canaryCompletedAt
  },
  "2026-07-17T00:00:00.001Z"
);

assert.equal(staleCompletionEvidence.releaseBinding.evidenceIdAuthenticated, true);
assert.equal(staleCompletionEvidence.releaseBinding.fresh, false);
assert.equal(gate(staleCompletionEvidence, "scrimed-work-canary-release").status, "operator_required");
assert.match(
  gate(staleCompletionEvidence, "scrimed-work-canary-release").blocker ?? "",
  /freshness window/i
);

const crossWorkspaceEvidence = getScrimedWorkProductionHardeningGate(
  {
    ...baseEnv,
    SCRIMED_WORKSPACE_SLUG: "northstar-synthetic-evaluation",
    SCRIMED_WORK_TWO_IDENTITY_CANARY_VERIFIED: "true",
    SCRIMED_WORK_TWO_IDENTITY_CANARY_EVIDENCE_ID: authenticatedCanaryEvidenceId,
    SCRIMED_WORK_TWO_IDENTITY_CANARY_RELEASE_SHA: "a".repeat(40),
    SCRIMED_WORK_TWO_IDENTITY_CANARY_COMPLETED_AT: canaryCompletedAt
  },
  canaryEvaluatedAt
);

assert.equal(crossWorkspaceEvidence.releaseBinding.evidenceIdAuthenticated, false);
assert.equal(crossWorkspaceEvidence.releaseBinding.workspaceBound, false);
assert.equal(gate(crossWorkspaceEvidence, "scrimed-work-canary-release").status, "operator_required");

console.log(
  "pass SCRIMED Work production-hardening policy (two identities required, evidence release-bound, tokens redacted)"
);
