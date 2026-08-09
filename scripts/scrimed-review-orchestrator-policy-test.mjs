#!/usr/bin/env node

import assert from "node:assert/strict";
import {
  createAiReviewPacket,
  evaluateAiReviewSet,
  getScrimedReviewOrchestratorSummary,
  scrimedReviewLaneDefinitions,
  validateAiReviewPacket
} from "../app/lib/scrimed-work/reviewOrchestrator.ts";

const candidateFingerprint = "a".repeat(64);
const sourceFingerprint = "b".repeat(64);
const reviewedAt = "2026-08-01T12:00:00.000Z";
const expiresAt = "2026-08-15T12:00:00.000Z";
const evaluatedAt = "2026-08-02T12:00:00.000Z";

function buildPacket(laneId, overrides = {}) {
  const evidenceId = `${laneId}-evidence`;
  return createAiReviewPacket({
    packetId: `review-${laneId}`,
    laneId,
    candidateFingerprint,
    sourceFingerprint,
    reviewerId: `independent-${laneId}-reviewer`,
    reviewerType: "ai-assisted",
    implementationActorIds: ["implementation-agent"],
    modelProvider: "scrimed-offline-test-provider",
    modelId: "deterministic-review-fixture-v1",
    promptVersion: `review-${laneId}-prompt-v1`,
    reviewedAt,
    expiresAt,
    rubric: [
      {
        criterion: "Required control is evidenced",
        mandatory: true,
        result: "pass",
        evidenceIds: [evidenceId]
      }
    ],
    evidence: [
      {
        evidenceId,
        filePath: "app/lib/scrimed-work/reviewOrchestrator.ts",
        lineStart: 1,
        lineEnd: 10,
        testOrArtifactReference: "npm run test:scrimed-review-orchestrator"
      }
    ],
    findings: [],
    disposition: "AI REVIEW PASS",
    conditions: [],
    unresolvedRisks: [],
    humanApprovalClaimed: false,
    humanSignoffSatisfied: false,
    ...overrides
  });
}

const packets = scrimedReviewLaneDefinitions.map((lane) => buildPacket(lane.laneId));
const summary = getScrimedReviewOrchestratorSummary();
assert.equal(summary.laneCount, 12);
assert.equal(summary.selfReviewAllowed, false);
assert.equal(summary.humanApprovalImpersonationAllowed, false);

const completeSet = evaluateAiReviewSet({
  packets,
  candidateFingerprint,
  sourceFingerprint,
  evaluatedAt
});
assert.equal(completeSet.status, "ai-review-set-ready-for-accountable-human-signoff");
assert.equal(completeSet.humanApprovalSatisfied, false);
assert.equal(completeSet.productionAuthorityGranted, false);

assert.throws(
  () =>
    buildPacket("principal-engineering", {
      reviewerId: "implementation-agent"
    }),
  /independent/
);
assert.throws(
  () =>
    buildPacket("principal-engineering", {
      evidence: []
    }),
  /require evidence/
);
assert.throws(
  () =>
    buildPacket("principal-engineering", {
      humanApprovalClaimed: true
    }),
  /cannot impersonate/
);
assert.throws(
  () =>
    buildPacket("principal-engineering", {
      conditions: ["Resolve open issue"]
    }),
  /unconditional AI REVIEW PASS/
);
assert.throws(
  () =>
    buildPacket("principal-engineering", {
      findings: [
        {
          findingId: "critical-open",
          severity: "critical",
          title: "Unresolved critical finding",
          evidenceIds: ["principal-engineering-evidence"],
          state: "open",
          resolution: "Human escalation required"
        }
      ]
    }),
  /unconditional AI REVIEW PASS/
);

const expiredPacket = buildPacket("principal-engineering", {
  expiresAt: "2026-08-02T11:59:59.000Z"
});
assert.deepEqual(
  validateAiReviewPacket(expiredPacket, {
    candidateFingerprint,
    sourceFingerprint,
    evaluatedAt
  }).reasonCodes,
  ["review-expired"]
);

const tamperedPacket = { ...packets[0], packetHash: "f".repeat(64) };
assert.ok(
  validateAiReviewPacket(tamperedPacket, {
    candidateFingerprint,
    sourceFingerprint,
    evaluatedAt
  }).reasonCodes.includes("review-packet-hash-mismatch")
);
assert.ok(
  validateAiReviewPacket(packets[0], {
    candidateFingerprint,
    sourceFingerprint,
    modelProvider: "different-provider",
    modelId: "different-model",
    evaluatedAt
  }).reasonCodes.includes("model-id-mismatch")
);

const missingLane = evaluateAiReviewSet({
  packets: packets.slice(1),
  candidateFingerprint,
  sourceFingerprint,
  evaluatedAt
});
assert.equal(missingLane.status, "ai-review-set-blocked");
assert.ok(missingLane.reasonCodes.includes("required-review-lane-missing"));

const blockedDatabase = buildPacket("database", {
  packetId: "review-database-blocked",
  rubric: [
    {
      criterion: "Disposable migration evidence exists",
      mandatory: true,
      result: "fail",
      evidenceIds: ["database-evidence"]
    }
  ],
  disposition: "AI REVIEW BLOCKED",
  unresolvedRisks: ["Disposable database engine unavailable"]
});
const conflictingSet = evaluateAiReviewSet({
  packets: [...packets, blockedDatabase],
  candidateFingerprint,
  sourceFingerprint,
  evaluatedAt
});
assert.ok(conflictingSet.reasonCodes.includes("conflicting-review-dispositions"));
assert.ok(conflictingSet.reasonCodes.includes("duplicate-review-lane"));
assert.ok(conflictingSet.reasonCodes.includes("blocking-review-finding"));

const changedCandidate = evaluateAiReviewSet({
  packets,
  candidateFingerprint: "c".repeat(64),
  sourceFingerprint,
  evaluatedAt
});
assert.equal(changedCandidate.status, "ai-review-set-blocked");
assert.ok(
  changedCandidate.reasonCodes.some((reason) => reason.includes("candidate-fingerprint-mismatch"))
);

console.log(
  `pass SCRIMED independent review orchestrator (${summary.laneCount} lanes, self-review and approval impersonation denied)`
);
