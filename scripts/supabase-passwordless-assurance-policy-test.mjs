#!/usr/bin/env node

import assert from "node:assert/strict";
import {
  currentSupabasePasswordlessEvidence,
  evaluateSupabasePasswordlessAssurance
} from "../app/lib/release/supabasePasswordlessAssurance.ts";

const currentTime = new Date("2026-08-31T16:00:00.000Z");
const current = evaluateSupabasePasswordlessAssurance(
  currentSupabasePasswordlessEvidence,
  currentTime
);
assert.equal(current.currentLaneState, "COMPENSATING_CONTROL_ACTIVE");
assert.equal(current.platformControlState, "DEFERRED_PLATFORM_CONTROL");
assert.equal(current.semanticStatus, "DEFERRED_HARDENING_FOR_PASSWORD_AUTH");
assert.equal(current.protectedSyntheticPasswordlessAuth, "ALLOW_PASSWORDLESS_SYNTHETIC_NO_PHI");
assert.equal(current.protectedProductionAuth, "DENY");
assert.equal(current.productionAuthorityGranted, false);
assert.equal(current.phiAuthorityGranted, false);
assert.equal(current.passwordAuthWithoutVerifiedLeakProtectionDenied, false);

const unprotectedPasswordAuth = evaluateSupabasePasswordlessAssurance({
  ...currentSupabasePasswordlessEvidence,
  applicationPasswordAuthEnabled: true,
  leakedPasswordProtection: "UNVERIFIED"
}, currentTime);
assert.equal(unprotectedPasswordAuth.currentLaneState, "BLOCKED_TECHNICAL");
assert.equal(unprotectedPasswordAuth.protectedSyntheticPasswordlessAuth, "DENY");
assert.equal(unprotectedPasswordAuth.protectedProductionAuth, "DENY");
assert.equal(unprotectedPasswordAuth.passwordAuthWithoutVerifiedLeakProtectionDenied, true);
assert.ok(unprotectedPasswordAuth.reasonCodes.includes(
  "PASSWORD_AUTH_REQUIRES_VERIFIED_LEAKED_PASSWORD_PROTECTION"
));

const verifiedPasswordControl = evaluateSupabasePasswordlessAssurance({
  ...currentSupabasePasswordlessEvidence,
  applicationPasswordAuthEnabled: true,
  leakedPasswordProtection: "VERIFIED",
  planClass: "PRO_OR_HIGHER"
}, currentTime);
assert.equal(verifiedPasswordControl.currentLaneState, "COMPENSATING_CONTROL_ACTIVE");
assert.equal(verifiedPasswordControl.platformControlState, "PASS");
assert.equal(verifiedPasswordControl.protectedProductionAuth, "DENY");

for (const unsafeEvidence of [
  { ...currentSupabasePasswordlessEvidence, protectedOperationsRequireAal2: false },
  { ...currentSupabasePasswordlessEvidence, otpAndSignInRateLimitsConfigured: false },
  { ...currentSupabasePasswordlessEvidence, serverSideAuthorizationRequired: false },
  { ...currentSupabasePasswordlessEvidence, shouldCreateUser: true },
  { ...currentSupabasePasswordlessEvidence, publicSignupEnabled: true }
]) {
  const decision = evaluateSupabasePasswordlessAssurance(unsafeEvidence, currentTime);
  assert.equal(decision.currentLaneState, "BLOCKED_TECHNICAL");
  assert.equal(decision.protectedSyntheticPasswordlessAuth, "DENY");
  assert.equal(decision.protectedProductionAuth, "DENY");
}

const stale = evaluateSupabasePasswordlessAssurance(
  currentSupabasePasswordlessEvidence,
  new Date("2026-10-01T00:00:00.000Z")
);
assert.equal(stale.currentLaneState, "OPERATOR_ACTION_REQUIRED");
assert.equal(stale.protectedSyntheticPasswordlessAuth, "DENY");
assert.ok(stale.reasonCodes.includes("SUPABASE_AUTH_EVIDENCE_STALE_OR_INVALID"));

const repeated = evaluateSupabasePasswordlessAssurance(
  currentSupabasePasswordlessEvidence,
  currentTime
);
assert.equal(repeated.decisionHash, current.decisionHash);
assert.equal(JSON.stringify(current).includes("service_role"), false);
assert.equal(JSON.stringify(current).includes("AAL2_TEST_TOKEN"), false);

console.log("pass SCRIMED Supabase passwordless assurance policy (12 fail-closed cases)");
