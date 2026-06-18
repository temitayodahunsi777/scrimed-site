#!/usr/bin/env node

import { analyzeSalesDemoSessionQaToken } from "./lib/sales-demo-session-qa-token-policy.mjs";

function encodeSegment(value) {
  return Buffer.from(JSON.stringify(value), "utf8")
    .toString("base64url");
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
    throw new Error(`${label} failed: ${JSON.stringify(result.errors)}`);
  }
}

const nowSeconds = 1_800_000_000;
const nowMs = nowSeconds * 1000;
const validClaims = {
  aal: "aal2",
  exp: nowSeconds + 1800,
  iat: nowSeconds,
  role: "authenticated",
  session_id: "session_test_123",
  sub: "user_test_123"
};

const valid = analyzeSalesDemoSessionQaToken({
  bearerToken: unsignedToken(validClaims),
  intakeId: "intake-test-123",
  nowMs
});
assertPolicy("valid short-lived aal2 token", valid.ok, valid);

const aal1 = analyzeSalesDemoSessionQaToken({
  bearerToken: unsignedToken({ ...validClaims, aal: "aal1" }),
  intakeId: "intake-test-123",
  nowMs
});
assertPolicy("aal1 rejected", !aal1.ok && aal1.errors.some((error) => error.includes("aal=aal2")), aal1);

const longLived = analyzeSalesDemoSessionQaToken({
  bearerToken: unsignedToken({ ...validClaims, exp: nowSeconds + 7200 }),
  intakeId: "intake-test-123",
  nowMs
});
assertPolicy(
  "long-lived token rejected",
  !longLived.ok && longLived.errors.some((error) => error.includes("too long")),
  longLived
);

const missingIat = analyzeSalesDemoSessionQaToken({
  bearerToken: unsignedToken({ ...validClaims, iat: undefined }),
  intakeId: "intake-test-123",
  nowMs
});
assertPolicy(
  "missing iat rejected",
  !missingIat.ok && missingIat.errors.some((error) => error.includes("iat")),
  missingIat
);

const missingTarget = analyzeSalesDemoSessionQaToken({
  bearerToken: unsignedToken(validClaims),
  intakeId: "",
  nowMs
});
assertPolicy(
  "missing intake target rejected",
  !missingTarget.ok && missingTarget.errors.some((error) => error.includes("SCRIMED_SALES_QA_INTAKE_ID")),
  missingTarget
);

console.log("pass sales demo session QA token policy self-test");
