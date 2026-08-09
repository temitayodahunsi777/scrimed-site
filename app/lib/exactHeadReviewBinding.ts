import { createClinicalEvidenceHash } from "./clinicalEvidenceControls";

export const exactHeadReviewBindingVersion =
  "scrimed-exact-head-review-binding-v1-2026-08-09";

export type ExactHeadCriticalSurfaceFingerprints = {
  securityCriticalFiles: string;
  policyFiles: string;
  migrationSet: string;
  publicClaims: string;
  deploymentConfiguration: string;
};

export type ExactHeadReviewCandidate = {
  commitSha: string;
  candidateFingerprint: string;
  sourceFingerprint: string;
  validationFingerprint: string;
  reviewPacketFingerprint: string;
  sbomFingerprint: string;
  criticalSurfaces: ExactHeadCriticalSurfaceFingerprints;
  authorIdentityHash: string;
};

export type ExactHeadReviewDisposition =
  | "APPROVE_EXACT_HEAD"
  | "APPROVE_WITH_NONBLOCKING_NOTES"
  | "REQUEST_CHANGES"
  | "BLOCK";

export type ExactHeadReviewApproval = {
  approvalId: string;
  replayNonce: string;
  commitSha: string;
  candidateFingerprint: string;
  sourceFingerprint: string;
  validationFingerprint: string;
  reviewPacketFingerprint: string;
  sbomFingerprint: string;
  criticalSurfaces: ExactHeadCriticalSurfaceFingerprints;
  reviewerIdentityHash: string;
  disposition: ExactHeadReviewDisposition;
  evidenceIds: string[];
  issuedAt: string;
  expiresAt: string;
  trustedIdentityEvidenceVerified: boolean;
  approvalDigest: string;
};

export type ExactHeadReviewReasonCode =
  | "exact-head-review-approved"
  | "exact-head-review-missing"
  | "exact-head-review-candidate-invalid"
  | "exact-head-review-approval-invalid"
  | "exact-head-review-stale"
  | "exact-head-review-critical-surface-stale"
  | "exact-head-review-replay-rejected"
  | "exact-head-review-self-review-rejected"
  | "exact-head-review-evidence-incomplete"
  | "exact-head-review-untrusted-identity"
  | "exact-head-review-expired"
  | "exact-head-review-digest-mismatch"
  | "exact-head-review-disposition-blocks";

export type ExactHeadReviewResult = {
  status: "APPROVED_EXACT_HEAD" | "REVIEW_REQUIRED" | "BLOCKED";
  approved: boolean;
  reasonCodes: ExactHeadReviewReasonCode[];
  approvalId: string | null;
  approvedCommitSha: string | null;
  releaseAuthorityGranted: false;
  evaluatedAt: string;
  evaluationHash: string;
};

const sha256Pattern = /^[0-9a-f]{64}$/;
const commitPattern = /^[0-9a-f]{40}$/;
const requiredEvidenceIds = [
  "ci",
  "secret-scan",
  "sbom",
  "public-claims",
  "migration-review",
  "operating-mode"
] as const;

function approvalDigestPayload(
  approval: Omit<ExactHeadReviewApproval, "approvalDigest">
) {
  return {
    version: exactHeadReviewBindingVersion,
    ...approval,
    evidenceIds: [...new Set(approval.evidenceIds)].sort()
  };
}

export function createExactHeadApprovalDigest(
  approval: Omit<ExactHeadReviewApproval, "approvalDigest">
) {
  return createClinicalEvidenceHash(approvalDigestPayload(approval));
}

function hasValidCriticalSurfaces(
  surfaces: ExactHeadCriticalSurfaceFingerprints
) {
  return Object.values(surfaces).every((value) => sha256Pattern.test(value));
}

function hasValidCandidate(candidate: ExactHeadReviewCandidate) {
  return (
    commitPattern.test(candidate.commitSha) &&
    [
      candidate.candidateFingerprint,
      candidate.sourceFingerprint,
      candidate.validationFingerprint,
      candidate.reviewPacketFingerprint,
      candidate.sbomFingerprint,
      candidate.authorIdentityHash
    ].every((value) => sha256Pattern.test(value)) &&
    hasValidCriticalSurfaces(candidate.criticalSurfaces)
  );
}

function buildResult(
  input: Omit<ExactHeadReviewResult, "releaseAuthorityGranted" | "evaluationHash">
): ExactHeadReviewResult {
  const result = {
    ...input,
    releaseAuthorityGranted: false as const
  };

  return {
    ...result,
    evaluationHash: createClinicalEvidenceHash({
      version: exactHeadReviewBindingVersion,
      ...result
    })
  };
}

export function evaluateExactHeadReviewBinding(input: {
  candidate: ExactHeadReviewCandidate;
  approval?: ExactHeadReviewApproval | null;
  consumedApprovalIds?: ReadonlySet<string>;
  evaluatedAt?: string;
}): ExactHeadReviewResult {
  const evaluatedAt = input.evaluatedAt ?? new Date().toISOString();
  const consumedApprovalIds = input.consumedApprovalIds ?? new Set<string>();
  const approval = input.approval;

  if (!hasValidCandidate(input.candidate)) {
    return buildResult({
      status: "BLOCKED",
      approved: false,
      reasonCodes: ["exact-head-review-candidate-invalid"],
      approvalId: null,
      approvedCommitSha: null,
      evaluatedAt
    });
  }

  if (!approval) {
    return buildResult({
      status: "REVIEW_REQUIRED",
      approved: false,
      reasonCodes: ["exact-head-review-missing"],
      approvalId: null,
      approvedCommitSha: null,
      evaluatedAt
    });
  }

  const reasons: ExactHeadReviewReasonCode[] = [];
  const issuedAt = Date.parse(approval.issuedAt);
  const expiresAt = Date.parse(approval.expiresAt);
  const evaluatedAtMs = Date.parse(evaluatedAt);
  const approvalWithoutDigest = { ...approval };
  delete (approvalWithoutDigest as Partial<ExactHeadReviewApproval>).approvalDigest;

  if (
    !approval.approvalId.trim() ||
    !approval.replayNonce.trim() ||
    !commitPattern.test(approval.commitSha) ||
    !sha256Pattern.test(approval.reviewerIdentityHash) ||
    !hasValidCriticalSurfaces(approval.criticalSurfaces) ||
    !Number.isFinite(issuedAt) ||
    !Number.isFinite(expiresAt) ||
    !Number.isFinite(evaluatedAtMs) ||
    expiresAt <= issuedAt
  ) {
    reasons.push("exact-head-review-approval-invalid");
  }
  if (approval.reviewerIdentityHash === input.candidate.authorIdentityHash) {
    reasons.push("exact-head-review-self-review-rejected");
  }
  if (consumedApprovalIds.has(approval.approvalId) || consumedApprovalIds.has(approval.replayNonce)) {
    reasons.push("exact-head-review-replay-rejected");
  }
  if (!approval.trustedIdentityEvidenceVerified) {
    reasons.push("exact-head-review-untrusted-identity");
  }
  if (Number.isFinite(expiresAt) && Number.isFinite(evaluatedAtMs) && expiresAt <= evaluatedAtMs) {
    reasons.push("exact-head-review-expired");
  }
  if (approval.disposition === "REQUEST_CHANGES" || approval.disposition === "BLOCK") {
    reasons.push("exact-head-review-disposition-blocks");
  }

  const exactFieldsMatch =
    approval.commitSha === input.candidate.commitSha &&
    approval.candidateFingerprint === input.candidate.candidateFingerprint &&
    approval.sourceFingerprint === input.candidate.sourceFingerprint &&
    approval.validationFingerprint === input.candidate.validationFingerprint &&
    approval.reviewPacketFingerprint === input.candidate.reviewPacketFingerprint &&
    approval.sbomFingerprint === input.candidate.sbomFingerprint;
  if (!exactFieldsMatch) reasons.push("exact-head-review-stale");

  const criticalSurfacesMatch = Object.entries(input.candidate.criticalSurfaces).every(
    ([key, value]) =>
      approval.criticalSurfaces[key as keyof ExactHeadCriticalSurfaceFingerprints] === value
  );
  if (!criticalSurfacesMatch) {
    reasons.push("exact-head-review-critical-surface-stale");
  }

  const evidenceIds = new Set(approval.evidenceIds);
  if (requiredEvidenceIds.some((evidenceId) => !evidenceIds.has(evidenceId))) {
    reasons.push("exact-head-review-evidence-incomplete");
  }

  const expectedDigest = createExactHeadApprovalDigest(
    approvalWithoutDigest as Omit<ExactHeadReviewApproval, "approvalDigest">
  );
  if (approval.approvalDigest !== expectedDigest) {
    reasons.push("exact-head-review-digest-mismatch");
  }

  const uniqueReasons = [...new Set(reasons)];
  if (uniqueReasons.length > 0) {
    return buildResult({
      status: "BLOCKED",
      approved: false,
      reasonCodes: uniqueReasons,
      approvalId: approval.approvalId,
      approvedCommitSha: null,
      evaluatedAt
    });
  }

  return buildResult({
    status: "APPROVED_EXACT_HEAD",
    approved: true,
    reasonCodes: ["exact-head-review-approved"],
    approvalId: approval.approvalId,
    approvedCommitSha: approval.commitSha,
    evaluatedAt
  });
}
