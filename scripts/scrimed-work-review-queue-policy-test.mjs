#!/usr/bin/env node

import assert from "node:assert/strict";

import {
  parseScrimedWorkReviewQueueLimit,
  parseScrimedWorkReviewQueuePayload,
  scrimedWorkReviewQueuePolicyVersion
} from "../app/lib/scrimed-work/reviewQueue.ts";

assert.deepEqual(parseScrimedWorkReviewQueueLimit(null), { ok: true, value: 25 });
assert.deepEqual(parseScrimedWorkReviewQueueLimit("1"), { ok: true, value: 1 });
assert.deepEqual(parseScrimedWorkReviewQueueLimit("50"), { ok: true, value: 50 });
assert.equal(parseScrimedWorkReviewQueueLimit("0").ok, false);
assert.equal(parseScrimedWorkReviewQueueLimit("51").ok, false);
assert.equal(parseScrimedWorkReviewQueueLimit("2.5").ok, false);
assert.equal(parseScrimedWorkReviewQueueLimit("all").ok, false);

const validQueue = {
  items: [
    {
      sessionId: "work_session_review_queue_fixture",
      artifactId: "artifact_review_queue_fixture",
      artifactType: "executive-report",
      title: "Synthetic executive evidence brief",
      workspaceDomain: "executive",
      riskLevel: "moderate",
      sessionStatus: "verifying",
      reviewStatus: "human_review_required",
      approvalsReady: true,
      verificationReportedEligible: false,
      creatorIdentityHash: `scrimed-actor-${"a".repeat(64)}`,
      createdAt: "2026-07-14T12:00:00.000Z",
      syntheticOnly: true,
      noPhi: true,
      humanReviewRequired: true,
      externalDistributionAllowed: false,
      payerSubmissionAllowed: false
    }
  ],
  count: 1,
  limit: 25,
  auditEventId: "11111111-1111-4111-8111-111111111111",
  policyVersion: scrimedWorkReviewQueuePolicyVersion,
  workspaceSlug: "atlas-synthetic-evaluation",
  reviewerRoleRequired: true,
  separationOfDutiesEnforced: true,
  syntheticOnly: true,
  noPhi: true,
  externalDistributionAllowed: false,
  payerSubmissionAllowed: false,
  boundary: "Synthetic/no-PHI reviewer-only metadata boundary with auditability and no consequential authority."
};

const parsed = parseScrimedWorkReviewQueuePayload(validQueue);
assert.ok(parsed);
assert.equal(parsed.count, 1);
assert.equal(parsed.items[0].approvalsReady, true);

for (const unsafeQueue of [
  { ...validQueue, count: 2 },
  { ...validQueue, reviewerRoleRequired: false },
  { ...validQueue, separationOfDutiesEnforced: false },
  { ...validQueue, noPhi: false },
  { ...validQueue, externalDistributionAllowed: true },
  { ...validQueue, payerSubmissionAllowed: true },
  {
    ...validQueue,
    items: [{ ...validQueue.items[0], creatorIdentityHash: "raw-user-id" }]
  },
  {
    ...validQueue,
    items: [{ ...validQueue.items[0], sessionStatus: "active" }]
  },
  {
    ...validQueue,
    items: [{ ...validQueue.items[0], noPhi: false }]
  }
]) {
  assert.equal(parseScrimedWorkReviewQueuePayload(unsafeQueue), null);
}

console.log("pass SCRIMED Work reviewer queue policy behavior");
