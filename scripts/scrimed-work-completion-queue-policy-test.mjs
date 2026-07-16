#!/usr/bin/env node

import assert from "node:assert/strict";

import {
  isScrimedWorkCompletionOperator,
  parseScrimedWorkCompletionQueueLimit,
  parseScrimedWorkCompletionQueuePayload,
  scrimedWorkCompletionQueuePolicyVersion
} from "../app/lib/scrimed-work/completionQueue.ts";

assert.deepEqual(parseScrimedWorkCompletionQueueLimit(null), { ok: true, value: 25 });
assert.deepEqual(parseScrimedWorkCompletionQueueLimit("1"), { ok: true, value: 1 });
assert.deepEqual(parseScrimedWorkCompletionQueueLimit("50"), { ok: true, value: 50 });
assert.equal(parseScrimedWorkCompletionQueueLimit("0").ok, false);
assert.equal(parseScrimedWorkCompletionQueueLimit("51").ok, false);
assert.equal(parseScrimedWorkCompletionQueueLimit("2.5").ok, false);
assert.equal(parseScrimedWorkCompletionQueueLimit("all").ok, false);

assert.equal(isScrimedWorkCompletionOperator("tenant-admin", "admin"), true);
assert.equal(isScrimedWorkCompletionOperator("pilot-lead", "operator"), true);
assert.equal(isScrimedWorkCompletionOperator("reviewer", "reviewer"), false);
assert.equal(isScrimedWorkCompletionOperator("observer", "operator"), false);
assert.equal(isScrimedWorkCompletionOperator("tenant-admin", "reviewer"), false);

const validQueue = {
  items: [
    {
      sessionId: "work_session_completion_queue_fixture",
      artifactId: "artifact_completion_queue_fixture",
      artifactType: "executive-report",
      title: "Synthetic reviewed completion evidence",
      workspaceDomain: "operations",
      riskLevel: "moderate",
      sessionStatus: "verifying",
      reviewStatus: "reviewed",
      reviewDisposition: "approved_for_internal_use",
      verificationEligible: true,
      verificationPassRate: 100,
      reviewEvidenceBound: true,
      completionReady: true,
      reviewedAt: "2026-07-16T02:16:35.439Z",
      syntheticOnly: true,
      noPhi: true,
      humanReviewRequired: true,
      externalDistributionAllowed: false,
      payerSubmissionAllowed: false,
      ehrWritebackAllowed: false
    }
  ],
  count: 1,
  limit: 25,
  auditEventId: "22222222-2222-4222-8222-222222222222",
  policyVersion: scrimedWorkCompletionQueuePolicyVersion,
  workspaceSlug: "atlas-synthetic-evaluation",
  operatorRoleRequired: true,
  allowedMemberRoles: ["tenant-admin", "pilot-lead"],
  independentReviewRequired: true,
  verificationRequired: true,
  syntheticOnly: true,
  noPhi: true,
  externalDistributionAllowed: false,
  payerSubmissionAllowed: false,
  ehrWritebackAllowed: false,
  boundary: "Synthetic/no-PHI operator-only completion metadata with mandatory verification and auditability."
};

const parsed = parseScrimedWorkCompletionQueuePayload(validQueue);
assert.ok(parsed);
assert.equal(parsed.count, 1);
assert.equal(parsed.items[0].completionReady, true);

for (const unsafeQueue of [
  { ...validQueue, count: 2 },
  { ...validQueue, operatorRoleRequired: false },
  { ...validQueue, allowedMemberRoles: ["reviewer", "pilot-lead"] },
  { ...validQueue, independentReviewRequired: false },
  { ...validQueue, verificationRequired: false },
  { ...validQueue, noPhi: false },
  { ...validQueue, externalDistributionAllowed: true },
  { ...validQueue, payerSubmissionAllowed: true },
  { ...validQueue, ehrWritebackAllowed: true },
  {
    ...validQueue,
    items: [{ ...validQueue.items[0], sessionStatus: "completed" }]
  },
  {
    ...validQueue,
    items: [{ ...validQueue.items[0], reviewStatus: "human_review_required" }]
  },
  {
    ...validQueue,
    items: [{ ...validQueue.items[0], verificationEligible: false }]
  },
  {
    ...validQueue,
    items: [{ ...validQueue.items[0], verificationPassRate: 91 }]
  },
  {
    ...validQueue,
    items: [{ ...validQueue.items[0], reviewEvidenceBound: false }]
  },
  {
    ...validQueue,
    items: [{ ...validQueue.items[0], completionReady: false }]
  }
]) {
  assert.equal(parseScrimedWorkCompletionQueuePayload(unsafeQueue), null);
}

console.log("pass SCRIMED Work completion queue policy behavior");
