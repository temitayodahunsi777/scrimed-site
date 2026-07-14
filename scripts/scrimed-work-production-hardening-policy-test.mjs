#!/usr/bin/env node

import assert from "node:assert/strict";

import { getScrimedWorkProductionHardeningGate } from "../app/lib/scrimed-work/productionHardening.ts";

const baseEnv = {
  NEXT_PUBLIC_SUPABASE_URL: "https://synthetic-example.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "nonsecret-publishable-test-value",
  SCRIMED_PILOT_INTAKE_PERSISTENCE_TOKEN: "nonsecret-runtime-test-value",
  SCRIMED_WORK_PROTECTED_WRITES_ENABLED: "true",
  SCRIMED_WORK_DURABLE_STORE_ENABLED: "true",
  SCRIMED_WORK_MIGRATIONS_VERIFIED: "true",
  SCRIMED_WORK_MIGRATION_EVIDENCE_ID: "supabase-work-advisor-20260714",
  SCRIMED_WORKSPACE_SLUG: "atlas-synthetic-evaluation",
  SCRIMED_CONSEQUENTIAL_ACTIONS_ENABLED: "false"
};

function gate(report, gateId) {
  const value = report.gates.find((item) => item.gateId === gateId);
  assert.ok(value, `missing ${gateId}`);
  return value;
}

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
    SCRIMED_WORK_TWO_IDENTITY_CANARY_EVIDENCE_ID: "bad"
  },
  "2026-07-14T00:00:00.000Z"
);

assert.equal(gate(malformedEvidence, "scrimed-work-canary-release").status, "operator_required");

const verifiedEvidence = getScrimedWorkProductionHardeningGate(
  {
    ...baseEnv,
    SCRIMED_WORK_TWO_IDENTITY_CANARY_VERIFIED: "true",
    SCRIMED_WORK_TWO_IDENTITY_CANARY_EVIDENCE_ID: "scrimed-work-canary-20260714-a1b2c3d4"
  },
  "2026-07-14T00:00:00.000Z"
);

assert.equal(gate(verifiedEvidence, "scrimed-work-aal2-operator-session").status, "evidence_ready");
assert.equal(gate(verifiedEvidence, "scrimed-work-aal2-reviewer-session").status, "evidence_ready");
assert.equal(gate(verifiedEvidence, "scrimed-work-canary-release").status, "evidence_ready");
assert.equal(verifiedEvidence.canRunStrictNonProductionSmoke, false);
assert.equal(verifiedEvidence.canaryEligible, false);
assert.ok(
  verifiedEvidence.strictSmokeCommands.includes("npm run smoke:scrimed-work:two-identity:strict")
);

console.log(
  "pass SCRIMED Work production-hardening policy (two identities required, evidence bound, tokens redacted)"
);
