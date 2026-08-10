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
  authorIdentities: [
    { identityProvider: "git-commit-author", identityHash: hash("f") },
    { identityProvider: "github", identityHash: hash("8") }
  ],
  authorIdentityHashes: [hash("f"), hash("8")],
  requiredReviewerRoles: ["Principal engineer", "Security reviewer"]
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
  expiresAt: "2026-08-10T22:00:00.000Z"
};
const approval = {
  ...approvalBase,
  approvalDigest: createExactHeadApprovalDigest(approvalBase)
};
const evaluatedAt = "2026-08-09T23:00:00.000Z";

function refreshDigest(value) {
  const payload = { ...value };
  delete payload.approvalDigest;
  value.approvalDigest = createExactHeadApprovalDigest(payload);
}

function verifiedIdentityFor(value) {
  return {
    gateId: "exact-head-review",
    decision: "approved",
    reviewerIdentityHash: value.reviewerIdentityHash,
    approvalDigest: value.approvalDigest,
    issuer: "scrimed-qualified-review-test-issuer",
    keyId: "scrimed-qualified-review-test-key",
    verificationMethod: "ed25519-trusted-issuer",
    signatureFingerprint: hash("6"),
    payloadHash: hash("7"),
    approvedAt: value.issuedAt,
    approvalExpiresAt: value.expiresAt,
    attestationExpiresAt: "2026-08-09T23:55:00.000Z",
    verifiedAt: evaluatedAt,
    remoteCiEvidenceHash: hash("9"),
    specialistReviewerRoles: [...candidate.requiredReviewerRoles],
    specialistReviewerIdentityHashes: [hash("0"), hash("7")]
  };
}

assert.equal(
  evaluateExactHeadReviewBinding({
    candidate,
    approval,
    verifiedIdentityEvidence: verifiedIdentityFor(approval),
    evaluatedAt
  }).status,
  "APPROVED_EXACT_HEAD"
);
assert.equal(
  evaluateExactHeadReviewBinding({ candidate, approval: null, evaluatedAt }).status,
  "REVIEW_REQUIRED"
);

const approvalWithNotesBase = {
  ...approvalBase,
  approvalId: "approval-exact-head-notes-001",
  replayNonce: "nonce-exact-head-notes-001",
  disposition: "APPROVE_WITH_NONBLOCKING_NOTES"
};
const approvalWithNotes = {
  ...approvalWithNotesBase,
  approvalDigest: createExactHeadApprovalDigest(approvalWithNotesBase)
};
assert.equal(
  evaluateExactHeadReviewBinding({
    candidate,
    approval: approvalWithNotes,
    verifiedIdentityEvidence: verifiedIdentityFor(approvalWithNotes),
    evaluatedAt
  }).status,
  "APPROVED_EXACT_HEAD"
);

function assertRejected(mutator, reasonCode) {
  const mutated = structuredClone(approval);
  mutator(mutated);
  const result = evaluateExactHeadReviewBinding({
    candidate,
    approval: mutated,
    verifiedIdentityEvidence: verifiedIdentityFor(approval),
    evaluatedAt
  });
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
  value.reviewerIdentityHash = candidate.authorIdentityHashes[1];
  refreshDigest(value);
}, "exact-head-review-self-review-rejected");

const specialistSelfReview = evaluateExactHeadReviewBinding({
  candidate,
  approval,
  verifiedIdentityEvidence: {
    ...verifiedIdentityFor(approval),
    specialistReviewerIdentityHashes: [hash("0"), candidate.authorIdentityHashes[0]]
  },
  evaluatedAt
});
assert.ok(
  specialistSelfReview.reasonCodes.includes("exact-head-review-self-review-rejected")
);
assertRejected((value) => {
  value.evidenceIds = value.evidenceIds.filter((id) => id !== "sbom");
}, "exact-head-review-evidence-incomplete");
assertRejected((value) => {
  value.disposition = "NOT_A_REAL_DISPOSITION";
  refreshDigest(value);
}, "exact-head-review-approval-invalid");
assertRejected((value) => {
  value.issuedAt = "2026-08-10T00:00:00.000Z";
  value.expiresAt = "2026-08-11T00:00:00.000Z";
  refreshDigest(value);
}, "exact-head-review-not-yet-effective");
assertRejected((value) => {
  value.disposition = "REQUEST_CHANGES";
  refreshDigest(value);
}, "exact-head-review-disposition-blocks");
assertRejected((value) => {
  value.approvalId = 42;
  value.evidenceIds = null;
  value.criticalSurfaces = null;
}, "exact-head-review-approval-invalid");

const replay = evaluateExactHeadReviewBinding({
  candidate,
  approval,
  verifiedIdentityEvidence: verifiedIdentityFor(approval),
  consumedApprovalIds: new Set([approval.replayNonce]),
  evaluatedAt
});
assert.ok(replay.reasonCodes.includes("exact-head-review-replay-rejected"));

const untrusted = { ...approval, trustedIdentityEvidenceVerified: true };
refreshDigest(untrusted);
const untrustedResult = evaluateExactHeadReviewBinding({
  candidate,
  approval: untrusted,
  evaluatedAt
});
assert.ok(untrustedResult.reasonCodes.includes("exact-head-review-untrusted-identity"));
assert.equal(untrustedResult.releaseAuthorityGranted, false);

const mismatchedIdentity = evaluateExactHeadReviewBinding({
  candidate,
  approval,
  verifiedIdentityEvidence: {
    ...verifiedIdentityFor(approval),
    approvalDigest: hash("8")
  },
  evaluatedAt
});
assert.ok(
  mismatchedIdentity.reasonCodes.includes("exact-head-review-untrusted-identity")
);

console.log(
  "pass exact-head review binding tests (SHA, candidate, source, critical surfaces, multi-author separation, disposition allowlist, effective time, replay, and signed-identity binding)"
);
