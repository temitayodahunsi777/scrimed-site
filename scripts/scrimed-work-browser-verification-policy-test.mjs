#!/usr/bin/env node

import assert from "node:assert/strict";
import {
  buildScrimedWorkBrowserVerificationPayload,
  classifyScrimedWorkBrowserResponse,
  isScrimedWorkBrowserVerificationComplete,
  scrimedWorkBrowserVerificationBoundary,
  scrimedWorkBrowserVerificationChecks
} from "../app/lib/scrimed-work/browserVerification.ts";
import { scrimedWorkDurableStoreRpcFailure } from "../app/lib/scrimed-work/durableStore.ts";
import {
  buildScrimedWorkSessionId,
  scrimedWorkSessionIdPattern
} from "../app/lib/scrimed-work/sessionIdentifier.ts";

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

const firstSessionId = buildScrimedWorkSessionId("scrimed-intel-0123abcd", "scrimed-intel-4567ef89");
const replaySessionId = buildScrimedWorkSessionId("scrimed-intel-0123abcd", "scrimed-intel-4567ef89");
const distinctSessionId = buildScrimedWorkSessionId("scrimed-intel-0123abcd", "scrimed-intel-4567ef80");

assert.match(firstSessionId, scrimedWorkSessionIdPattern);
assert.equal(firstSessionId, "work_session_0123abcd4567ef89");
assert.equal(replaySessionId, firstSessionId);
assert.notEqual(distinctSessionId, firstSessionId);
assert.throws(() => buildScrimedWorkSessionId("scrimed-intel-invalid", "scrimed-intel-4567ef89"));

assert.equal(
  scrimedWorkDurableStoreRpcFailure(
    {
      message: 'new row for relation "scrimed_work_sessions" violates check constraint "scrimed_work_sessions_session_id_check"',
      details: "Failing row contains tenant-scoped synthetic metadata."
    },
    "fallback"
  ).code,
  "scrimed-work-invalid-record-shape"
);
assert.equal(
  scrimedWorkDurableStoreRpcFailure({ message: "governance-workspace-or-role-denied" }, "fallback").code,
  "scrimed-work-role-denied"
);

assert.equal(scrimedWorkBrowserVerificationChecks.length, 11);
assert.equal(scrimedWorkBrowserVerificationChecks.at(1)?.id, "unauthenticated-fail-closed");
assert.ok(scrimedWorkBrowserVerificationChecks.some((check) => check.id === "durable-read" && check.mutation === false));
assert.ok(scrimedWorkBrowserVerificationChecks.some((check) => check.id === "verification-evidence" && check.mutation === false));
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
    scrimedWorkBrowserVerificationChecks.map((_, index) => ({ status: index === 10 ? "blocked" : "pass" }))
  ),
  false
);

console.log("pass SCRIMED Work browser verification policy test (bounded, fail-closed, tokenless, cleanup required)");
