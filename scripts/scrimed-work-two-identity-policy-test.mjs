#!/usr/bin/env node

import assert from "node:assert/strict";
import {
  analyzeTwoIdentityAal2Tokens,
  formatTwoIdentityAal2Report
} from "./lib/two-identity-aal2-policy.mjs";

const nowMs = 1_800_000_000_000;
const nowSeconds = Math.floor(nowMs / 1000);

function segment(value) {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function token({ sub, sessionId, expiresIn = 3600 }) {
  return [
    segment({ alg: "RS256", typ: "JWT" }),
    segment({
      aal: "aal2",
      exp: nowSeconds + expiresIn,
      iat: nowSeconds,
      role: "authenticated",
      session_id: sessionId,
      sub
    }),
    "synthetic-signature-not-verified-locally"
  ].join(".");
}

const operatorToken = token({ sub: "operator-user", sessionId: "operator-session" });
const reviewerToken = token({ sub: "reviewer-user", sessionId: "reviewer-session" });
const valid = analyzeTwoIdentityAal2Tokens({
  operatorToken,
  reviewerToken,
  workspaceSlug: "atlas-synthetic-evaluation",
  nowMs
});

assert.equal(valid.ok, true);
assert.equal(valid.identitySeparationVerifiedLocally, true);

const report = formatTwoIdentityAal2Report(valid);
assert.equal(report.includes(operatorToken), false);
assert.equal(report.includes(reviewerToken), false);
assert.match(report, /identity_separation=verified-local-claims/);
assert.match(report, /signature_and_roles=verified-by-protected-api/);

const sameUser = analyzeTwoIdentityAal2Tokens({
  operatorToken,
  reviewerToken: token({ sub: "operator-user", sessionId: "different-session" }),
  workspaceSlug: "atlas-synthetic-evaluation",
  nowMs
});
assert.equal(sameUser.ok, false);
assert.ok(sameUser.errors.some((error) => error.includes("different authenticated users")));

const sameSession = analyzeTwoIdentityAal2Tokens({
  operatorToken,
  reviewerToken: token({ sub: "reviewer-user", sessionId: "operator-session" }),
  workspaceSlug: "atlas-synthetic-evaluation",
  nowMs
});
assert.equal(sameSession.ok, false);
assert.ok(sameSession.errors.some((error) => error.includes("different authenticated sessions")));

const missingReviewer = analyzeTwoIdentityAal2Tokens({
  operatorToken,
  reviewerToken: "",
  workspaceSlug: "atlas-synthetic-evaluation",
  nowMs
});
assert.equal(missingReviewer.ok, false);
assert.ok(missingReviewer.errors.some((error) => error.includes("Reviewer token")));

const expiredReviewer = analyzeTwoIdentityAal2Tokens({
  operatorToken,
  reviewerToken: token({ sub: "reviewer-user", sessionId: "reviewer-session", expiresIn: -1 }),
  workspaceSlug: "atlas-synthetic-evaluation",
  nowMs
});
assert.equal(expiredReviewer.ok, false);
assert.ok(expiredReviewer.errors.some((error) => error.includes("expired")));

console.log("pass SCRIMED Work two-identity AAL2 policy behavior");
