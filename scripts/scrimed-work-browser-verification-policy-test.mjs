#!/usr/bin/env node

import assert from "node:assert/strict";
import {
  buildScrimedWorkBrowserVerificationPayload,
  classifyScrimedWorkBrowserResponse,
  isScrimedWorkBrowserVerificationComplete,
  scrimedWorkBrowserVerificationBoundary,
  scrimedWorkBrowserVerificationChecks
} from "../app/lib/scrimed-work/browserVerification.ts";

const payload = buildScrimedWorkBrowserVerificationPayload("atlas-synthetic-evaluation", "fixture123456");
const serialized = JSON.stringify(payload);

assert.equal(payload.workspaceDomain, "operations");
assert.equal(payload.riskLevel, "moderate");
assert.equal(payload.requestedAutonomy, "recommend");
assert.equal(payload.definitionOfDone.humanApprovalRequired, true);
assert.equal(payload.definitionOfDone.maximumEstimatedCostUsd, 0);
assert.ok(payload.definitionOfDone.prohibitedActions.includes("live PHI"));
assert.ok(payload.definitionOfDone.prohibitedActions.includes("payer submission"));
assert.ok(payload.definitionOfDone.prohibitedActions.includes("EHR writeback"));
assert.ok(!/patient[_ -]?(name|email|phone|address)|member[_ -]?id/i.test(serialized));

assert.equal(scrimedWorkBrowserVerificationChecks.length, 9);
assert.equal(scrimedWorkBrowserVerificationChecks.at(1)?.id, "unauthenticated-fail-closed");
assert.equal(scrimedWorkBrowserVerificationChecks.at(-1)?.id, "cancellation-cleanup");
assert.match(scrimedWorkBrowserVerificationBoundary, /without exporting its bearer token/i);

assert.equal(classifyScrimedWorkBrowserResponse({ actualStatus: 401, expectedStatuses: [401] }), "pass");
assert.equal(
  classifyScrimedWorkBrowserResponse({ actualStatus: 503, expectedStatuses: [401], blockedStatuses: [503] }),
  "blocked"
);
assert.equal(classifyScrimedWorkBrowserResponse({ actualStatus: 200, expectedStatuses: [401] }), "fail");

assert.equal(
  isScrimedWorkBrowserVerificationComplete(scrimedWorkBrowserVerificationChecks.map(() => ({ status: "pass" }))),
  true
);
assert.equal(
  isScrimedWorkBrowserVerificationComplete(
    scrimedWorkBrowserVerificationChecks.map((_, index) => ({ status: index === 8 ? "blocked" : "pass" }))
  ),
  false
);

console.log("pass SCRIMED Work browser verification policy test (bounded, fail-closed, tokenless, cleanup required)");
