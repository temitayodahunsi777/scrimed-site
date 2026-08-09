#!/usr/bin/env node

import assert from "node:assert/strict";

import {
  createExactHeadApprovalDigest,
  evaluateExactHeadReviewBinding
} from "../app/lib/exactHeadReviewBinding.ts";

const hash = (value) => value.repeat(64);
const surfaces = {
  securityCriticalFiles: hash("1"),
  policyFiles: hash("2"),
  migrationSet: hash("3"),
  publicClaims: hash("4"),
  deploymentConfiguration: hash("5")
};
const candidate = {
  commitSha: "a".repeat(40),
  candidateFingerprint: hash("a"),
  sourceFingerprint: hash("b"),
  validationFingerprint: hash("c"),
  reviewPacketFingerprint: hash("d"),
  sbomFingerprint: hash("e"),
  criticalSurfaces: surfaces,
  authorIdentityHash: hash("f")
};
const approvalBase = {
  approvalId: "approval-exact-head-001",
  replayNonce: "nonce-exact-head-001",
  commitSha: candidate.commitSha,
  candidateFingerprint: candidate.candidateFingerprint,
  sourceFingerprint: candidate.sourceFingerprint,
  validationFingerprint: candidate.validationFingerprint,
  reviewPacketFingerprint: candidate.reviewPacketFingerprint,
  sbomFingerprint: candidate.sbomFingerprint,
  criticalSurfaces: surfaces,
  reviewerIdentityHash: hash("0"),
  disposition: "APPROVE_EXACT_HEAD",
  evidenceIds: [
    "operating-mode",
    "migration-review",
    "public-claims",
    "sbom",
    "secret-scan",
    "ci"
  ],
  issuedAt: "2026-08-09T22:00:00.000Z",
  expiresAt: "2026-08-10T22:00:00.000Z",
  trustedIdentityEvidenceVerified: true
};
const approval = {
  ...approvalBase,
  approvalDigest: createExactHeadApprovalDigest(approvalBase)
};
const evaluatedAt = "2026-08-09T23:00:00.000Z";

assert.equal(
  evaluateExactHeadReviewBinding({ candidate, approval, evaluatedAt }).status,
  "APPROVED_EXACT_HEAD"
);
assert.equal(
  evaluateExactHeadReviewBinding({ candidate, approval: null, evaluatedAt }).status,
  "REVIEW_REQUIRED"
);

function assertRejected(mutator, reasonCode) {
  const mutated = structuredClone(approval);
  mutator(mutated);
  const result = evaluateExactHeadReviewBinding({ candidate, approval: mutated, evaluatedAt });
  assert.equal(result.approved, false);
  assert.ok(result.reasonCodes.includes(reasonCode), `${reasonCode} was not emitted`);
}

assertRejected((value) => {
  value.commitSha = "b".repeat(40);
}, "exact-head-review-stale");
assertRejected((value) => {
  value.candidateFingerprint = hash("9");
}, "exact-head-review-stale");
assertRejected((value) => {
  value.sourceFingerprint = hash("8");
}, "exact-head-review-stale");
assertRejected((value) => {
  value.reviewPacketFingerprint = hash("7");
}, "exact-head-review-stale");
assertRejected((value) => {
  value.criticalSurfaces.policyFiles = hash("6");
}, "exact-head-review-critical-surface-stale");
assertRejected((value) => {
  value.reviewerIdentityHash = candidate.authorIdentityHash;
  value.approvalDigest = createExactHeadApprovalDigest({
    ...value,
    approvalDigest: undefined
  });
}, "exact-head-review-self-review-rejected");
assertRejected((value) => {
  value.evidenceIds = value.evidenceIds.filter((id) => id !== "sbom");
}, "exact-head-review-evidence-incomplete");

const replay = evaluateExactHeadReviewBinding({
  candidate,
  approval,
  consumedApprovalIds: new Set([approval.replayNonce]),
  evaluatedAt
});
assert.ok(replay.reasonCodes.includes("exact-head-review-replay-rejected"));

const untrusted = {
  ...approvalBase,
  trustedIdentityEvidenceVerified: false
};
const untrustedResult = evaluateExactHeadReviewBinding({
  candidate,
  approval: {
    ...untrusted,
    approvalDigest: createExactHeadApprovalDigest(untrusted)
  },
  evaluatedAt
});
assert.ok(untrustedResult.reasonCodes.includes("exact-head-review-untrusted-identity"));
assert.equal(untrustedResult.releaseAuthorityGranted, false);

console.log(
  "pass exact-head review binding tests (SHA, candidate, source, critical surfaces, packet, replay, evidence, trust, and separation of duties)"
);
