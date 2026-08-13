#!/usr/bin/env node

import {
  analyzeAal2BearerToken,
  aal2SignatureVerification,
  extractBearerTokenFromSessionJson,
  formatAal2TokenReport,
  isDurableStoreAuthorizedRole,
  redactSensitive
} from "./lib/aal2-token-policy.mjs";

function encodeSegment(value) {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function unsignedToken(claims) {
  return [
    encodeSegment({ alg: "none", typ: "JWT" }),
    encodeSegment(claims),
    "signature"
  ].join(".");
}

function assertPolicy(label, condition, result) {
  if (!condition) {
    throw new Error(`${label} failed: ${JSON.stringify(result)}`);
  }
}

const nowSeconds = 1_800_000_000;
const nowMs = nowSeconds * 1000;
const validClaims = {
  aal: "aal2",
  amr: [{ method: "totp", timestamp: nowSeconds }],
  exp: nowSeconds + 1800,
  iat: nowSeconds,
  role: "authenticated",
  session_id: "session_test_123",
  sub: "user_test_123"
};
const workspaceSlug = "atlas-synthetic-evaluation";
const validToken = unsignedToken(validClaims);

const missing = analyzeAal2BearerToken({
  bearerToken: "",
  workspaceSlug,
  nowMs
});
assertPolicy(
  "missing token rejected",
  !missing.ok && missing.errors.some((error) => error.includes("SCRIMED_BEARER_TOKEN")),
  missing
);

const invalid = analyzeAal2BearerToken({
  bearerToken: "not-a-jwt",
  workspaceSlug,
  nowMs
});
assertPolicy("invalid token rejected", !invalid.ok && invalid.errors.some((error) => error.includes("compact JWT")), invalid);

const aal1 = analyzeAal2BearerToken({
  bearerToken: unsignedToken({ ...validClaims, aal: "aal1" }),
  workspaceSlug,
  nowMs
});
assertPolicy("aal1 rejected", !aal1.ok && aal1.errors.some((error) => error.includes("aal=aal2")), aal1);

const expired = analyzeAal2BearerToken({
  bearerToken: unsignedToken({ ...validClaims, exp: nowSeconds - 1 }),
  workspaceSlug,
  nowMs
});
assertPolicy("expired token rejected", !expired.ok && expired.errors.some((error) => error.includes("expired")), expired);

const valid = analyzeAal2BearerToken({
  bearerToken: validToken,
  workspaceSlug,
  nowMs
});
assertPolicy("valid short-lived aal2 token accepted", valid.ok, valid);

assertPolicy("tenant-admin role allowed", isDurableStoreAuthorizedRole("tenant-admin"), null);
assertPolicy("pilot-lead role allowed", isDurableStoreAuthorizedRole("pilot-lead"), null);
assertPolicy("reviewer role allowed", isDurableStoreAuthorizedRole("reviewer"), null);
assertPolicy("observer role forbidden", !isDurableStoreAuthorizedRole("observer"), null);

const extracted = extractBearerTokenFromSessionJson(JSON.stringify({ currentSession: { access_token: validToken } }));
assertPolicy("session json token extracted", extracted === validToken, null);

const redacted = redactSensitive(`Authorization: Bearer ${validToken}`);
assertPolicy("token redacted", !redacted.includes(validToken) && redacted.includes("[REDACTED"), redacted);

const readableDiagnostic = redactSensitive("Bearer token must contain aal=aal2.");
assertPolicy("bearer diagnostic preserved", readableDiagnostic.includes("Bearer token"), readableDiagnostic);

const localReport = formatAal2TokenReport(valid);
assertPolicy(
  "local preflight does not claim signature verification",
  localReport.includes(`signature=${aal2SignatureVerification.localPreflight}`) &&
    !localReport.includes(`signature=${aal2SignatureVerification.protectedApi}`),
  localReport
);

const verifiedReport = formatAal2TokenReport(valid, {
  signatureVerification: aal2SignatureVerification.supabaseAuth
});
assertPolicy(
  "explicit Supabase verification is reported",
  verifiedReport.includes(`signature=${aal2SignatureVerification.supabaseAuth}`),
  verifiedReport
);

const secretValue = "sk_test_1234567890abcdef";
const secretDiagnostic = redactSensitive(`api_key=${secretValue}`);
assertPolicy(
  "named API key is redacted",
  !secretDiagnostic.includes(secretValue) && secretDiagnostic.includes("api_key=[REDACTED"),
  secretDiagnostic
);

console.log("pass SCRIMED AAL2 token policy self-test");
