import { createClinicalEvidenceHash } from "../clinicalEvidenceControls";

export const scrimedReviewConfidenceVersion =
  "scrimed-review-confidence-v1-2026-08-01";

export type ReviewConfidenceInput = {
  testCoverage: number;
  testPassRate: number;
  criticalPathCoverage: number;
  independentReviewLaneCount: number;
  unresolvedCriticalFindings: number;
  sourceEvidenceConsistent: boolean;
  staleEvidence: boolean;
  publicClaimsPassed: boolean;
  secretScanPassed: boolean;
  sbomPassed: boolean;
  migrationStatus: "not-applicable" | "static-ready" | "dry-run-passed" | "failed";
  operatingModeControlsPassed: boolean;
  authorizationControlsPassed: boolean;
  reproducible: boolean;
  worktreeClean: boolean;
};

function bounded(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export function calculateReviewConfidence(input: ReviewConfidenceInput) {
  const reasons: string[] = [];
  const blockingDefects: string[] = [];
  let score = Math.round(
    bounded(input.testCoverage) * 12 +
      bounded(input.testPassRate) * 18 +
      bounded(input.criticalPathCoverage) * 15 +
      Math.min(input.independentReviewLaneCount, 12) / 12 * 15 +
      (input.sourceEvidenceConsistent ? 8 : 0) +
      (!input.staleEvidence ? 5 : 0) +
      (input.publicClaimsPassed ? 5 : 0) +
      (input.secretScanPassed ? 5 : 0) +
      (input.sbomPassed ? 3 : 0) +
      (input.operatingModeControlsPassed ? 5 : 0) +
      (input.authorizationControlsPassed ? 5 : 0) +
      (input.reproducible ? 2 : 0) +
      (input.worktreeClean ? 2 : 0)
  );

  if (input.unresolvedCriticalFindings > 0) blockingDefects.push("UNRESOLVED_CRITICAL_FINDINGS");
  if (!input.sourceEvidenceConsistent) blockingDefects.push("SOURCE_EVIDENCE_INCONSISTENT");
  if (input.staleEvidence) blockingDefects.push("STALE_EVIDENCE");
  if (!input.publicClaimsPassed) blockingDefects.push("PUBLIC_CLAIMS_FAILED");
  if (!input.secretScanPassed) blockingDefects.push("SECRET_SCAN_FAILED");
  if (!input.operatingModeControlsPassed) blockingDefects.push("OPERATING_MODE_CONTROLS_FAILED");
  if (!input.authorizationControlsPassed) blockingDefects.push("AUTHORIZATION_CONTROLS_FAILED");
  if (input.migrationStatus === "failed") blockingDefects.push("MIGRATION_VALIDATION_FAILED");
  if (!input.worktreeClean) reasons.push("WORKTREE_NOT_IMMUTABLE");
  if (input.migrationStatus === "static-ready") reasons.push("MIGRATION_DRY_RUN_OUTSTANDING");

  if (blockingDefects.length) score = Math.min(score, 39);
  if (!input.worktreeClean) score = Math.min(score, 79);
  const confidence = score >= 90 ? "VERY_HIGH" : score >= 75 ? "HIGH" : score >= 50 ? "MODERATE" : "LOW";
  const permittedReviewTier = blockingDefects.length
    ? "NONE"
    : input.worktreeClean && score >= 80
      ? "TIER_1_FOUNDER_INTERIM_ACCEPTANCE"
      : "TIER_0_AUTOMATED_ACTIVITY";
  const payload = {
    score,
    confidence,
    reasons,
    blockingDefects,
    scopeLimitation:
      "Confidence supports Tier 0 activity and may support Tier 1 founder acceptance. It never satisfies targeted professional review or production authorization.",
    permittedReviewTier,
    legallyRequiredApprovalOverridden: false as const,
    productionAuthorityGranted: false as const
  };
  return {
    ...payload,
    confidenceFingerprint: createClinicalEvidenceHash({
      version: scrimedReviewConfidenceVersion,
      input,
      payload
    })
  };
}
