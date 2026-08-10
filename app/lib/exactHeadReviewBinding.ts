import { createClinicalEvidenceHash } from "./clinicalEvidenceControls";

export const exactHeadReviewBindingVersion =
  "scrimed-exact-head-review-binding-v4-2026-08-10";

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
  authorIdentityHashes: string[];
  requiredReviewerRoles: string[];
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
  approvalDigest: string;
};

export type ExactHeadVerifiedIdentityEvidence = {
  gateId: "exact-head-review";
  decision: "approved";
  reviewerIdentityHash: string;
  approvalDigest: string;
  issuer: string;
  keyId: string;
  verificationMethod: "ed25519-trusted-issuer";
  signatureFingerprint: string;
  payloadHash: string;
  approvedAt: string;
  approvalExpiresAt: string;
  attestationExpiresAt: string;
  verifiedAt: string;
  remoteCiEvidenceHash: string;
  specialistReviewerRoles: string[];
  specialistReviewerIdentityHashes: string[];
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
  | "exact-head-review-not-yet-effective"
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
const exactHeadReviewDispositions = new Set<ExactHeadReviewDisposition>([
  "APPROVE_EXACT_HEAD",
  "APPROVE_WITH_NONBLOCKING_NOTES",
  "REQUEST_CHANGES",
  "BLOCK"
]);
const approvingExactHeadReviewDispositions = new Set<ExactHeadReviewDisposition>([
  "APPROVE_EXACT_HEAD",
  "APPROVE_WITH_NONBLOCKING_NOTES"
]);

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
  surfaces: ExactHeadCriticalSurfaceFingerprints | unknown
) {
  if (!surfaces || typeof surfaces !== "object" || Array.isArray(surfaces)) {
    return false;
  }

  return [
    "securityCriticalFiles",
    "policyFiles",
    "migrationSet",
    "publicClaims",
    "deploymentConfiguration"
  ].every((key) => {
    const value = (surfaces as Record<string, unknown>)[key];
    return typeof value === "string" && sha256Pattern.test(value);
  });
}

function isExactHeadReviewDisposition(
  value: unknown
): value is ExactHeadReviewDisposition {
  return (
    typeof value === "string" &&
    exactHeadReviewDispositions.has(value as ExactHeadReviewDisposition)
  );
}

function hasValidVerifiedIdentityEvidence(
  evidence: ExactHeadVerifiedIdentityEvidence | null | undefined,
  approval: ExactHeadReviewApproval,
  candidate: ExactHeadReviewCandidate
) {
  if (!evidence || typeof evidence !== "object" || Array.isArray(evidence)) {
    return false;
  }

  const approvedAt = Date.parse(evidence.approvedAt);
  const approvalExpiresAt = Date.parse(evidence.approvalExpiresAt);
  const attestationExpiresAt = Date.parse(evidence.attestationExpiresAt);
  const verifiedAt = Date.parse(evidence.verifiedAt);
  const expectedRoles = [...candidate.requiredReviewerRoles].sort();
  const verifiedRoles = Array.isArray(evidence.specialistReviewerRoles)
    ? [...evidence.specialistReviewerRoles].sort()
    : [];

  return (
    evidence.gateId === "exact-head-review" &&
    evidence.decision === "approved" &&
    evidence.verificationMethod === "ed25519-trusted-issuer" &&
    typeof evidence.issuer === "string" &&
    Boolean(evidence.issuer.trim()) &&
    typeof evidence.keyId === "string" &&
    Boolean(evidence.keyId.trim()) &&
    sha256Pattern.test(evidence.reviewerIdentityHash) &&
    sha256Pattern.test(evidence.approvalDigest) &&
    sha256Pattern.test(evidence.signatureFingerprint) &&
    sha256Pattern.test(evidence.payloadHash) &&
    sha256Pattern.test(evidence.remoteCiEvidenceHash) &&
    verifiedRoles.length === expectedRoles.length &&
    verifiedRoles.every((role, index) => role === expectedRoles[index]) &&
    Array.isArray(evidence.specialistReviewerIdentityHashes) &&
    evidence.specialistReviewerIdentityHashes.length === expectedRoles.length &&
    evidence.specialistReviewerIdentityHashes.every((identityHash) =>
      sha256Pattern.test(identityHash)
    ) &&
    evidence.reviewerIdentityHash === approval.reviewerIdentityHash &&
    evidence.approvalDigest === approval.approvalDigest &&
    evidence.approvedAt === approval.issuedAt &&
    evidence.approvalExpiresAt === approval.expiresAt &&
    Number.isFinite(approvedAt) &&
    Number.isFinite(approvalExpiresAt) &&
    Number.isFinite(attestationExpiresAt) &&
    Number.isFinite(verifiedAt) &&
    approvedAt <= verifiedAt &&
    verifiedAt < approvalExpiresAt &&
    verifiedAt < attestationExpiresAt
  );
}

function hasValidCandidate(candidate: ExactHeadReviewCandidate) {
  const authorIdentityHashes = candidate.authorIdentityHashes;
  const requiredReviewerRoles = candidate.requiredReviewerRoles;
  return (
    commitPattern.test(candidate.commitSha) &&
    [
      candidate.candidateFingerprint,
      candidate.sourceFingerprint,
      candidate.validationFingerprint,
      candidate.reviewPacketFingerprint,
      candidate.sbomFingerprint
    ].every((value) => sha256Pattern.test(value)) &&
    Array.isArray(authorIdentityHashes) &&
    authorIdentityHashes.length > 0 &&
    new Set(authorIdentityHashes).size === authorIdentityHashes.length &&
    authorIdentityHashes.every((value) => sha256Pattern.test(value)) &&
    Array.isArray(requiredReviewerRoles) &&
    requiredReviewerRoles.length > 0 &&
    new Set(requiredReviewerRoles).size === requiredReviewerRoles.length &&
    requiredReviewerRoles.every(
      (value) => typeof value === "string" && Boolean(value.trim())
    ) &&
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
  verifiedIdentityEvidence?: ExactHeadVerifiedIdentityEvidence | null;
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

  const dispositionValid = isExactHeadReviewDisposition(approval.disposition);
  const approvalStructurallyValid =
    typeof approval.approvalId === "string" &&
    Boolean(approval.approvalId.trim()) &&
    typeof approval.replayNonce === "string" &&
    Boolean(approval.replayNonce.trim()) &&
    typeof approval.commitSha === "string" &&
    typeof approval.reviewerIdentityHash === "string" &&
    Array.isArray(approval.evidenceIds) &&
    approval.evidenceIds.every((value) => typeof value === "string") &&
    typeof approval.approvalDigest === "string";
  const approvalFieldsValid =
    approvalStructurallyValid &&
    commitPattern.test(approval.commitSha) &&
    sha256Pattern.test(approval.reviewerIdentityHash) &&
    hasValidCriticalSurfaces(approval.criticalSurfaces) &&
    dispositionValid &&
    Number.isFinite(issuedAt) &&
    Number.isFinite(expiresAt) &&
    Number.isFinite(evaluatedAtMs) &&
    expiresAt > issuedAt;

  if (!approvalFieldsValid) {
    reasons.push("exact-head-review-approval-invalid");
  }
  const authorIdentityHashes = new Set(input.candidate.authorIdentityHashes);
  if (
    authorIdentityHashes.has(approval.reviewerIdentityHash) ||
    input.verifiedIdentityEvidence?.specialistReviewerIdentityHashes?.some(
      (identityHash) => authorIdentityHashes.has(identityHash)
    )
  ) {
    reasons.push("exact-head-review-self-review-rejected");
  }
  if (consumedApprovalIds.has(approval.approvalId) || consumedApprovalIds.has(approval.replayNonce)) {
    reasons.push("exact-head-review-replay-rejected");
  }
  if (
    !hasValidVerifiedIdentityEvidence(
      input.verifiedIdentityEvidence,
      approval,
      input.candidate
    )
  ) {
    reasons.push("exact-head-review-untrusted-identity");
  }
  if (Number.isFinite(expiresAt) && Number.isFinite(evaluatedAtMs) && expiresAt <= evaluatedAtMs) {
    reasons.push("exact-head-review-expired");
  }
  if (Number.isFinite(issuedAt) && Number.isFinite(evaluatedAtMs) && issuedAt > evaluatedAtMs) {
    reasons.push("exact-head-review-not-yet-effective");
  }
  if (
    dispositionValid &&
    !approvingExactHeadReviewDispositions.has(approval.disposition)
  ) {
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

  const criticalSurfacesMatch =
    hasValidCriticalSurfaces(approval.criticalSurfaces) &&
    Object.entries(input.candidate.criticalSurfaces).every(
      ([key, value]) =>
        approval.criticalSurfaces[
          key as keyof ExactHeadCriticalSurfaceFingerprints
        ] === value
    );
  if (!criticalSurfacesMatch) {
    reasons.push("exact-head-review-critical-surface-stale");
  }

  const evidenceIds = new Set(
    Array.isArray(approval.evidenceIds) ? approval.evidenceIds : []
  );
  if (requiredEvidenceIds.some((evidenceId) => !evidenceIds.has(evidenceId))) {
    reasons.push("exact-head-review-evidence-incomplete");
  }

  if (approvalFieldsValid) {
    const expectedDigest = createExactHeadApprovalDigest(
      approvalWithoutDigest as Omit<ExactHeadReviewApproval, "approvalDigest">
    );
    if (approval.approvalDigest !== expectedDigest) {
      reasons.push("exact-head-review-digest-mismatch");
    }
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
