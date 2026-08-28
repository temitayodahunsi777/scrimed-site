import { createClinicalEvidenceHash } from "../clinicalEvidenceControls";
import { getP34PreviewAcceptanceSummary } from "../release/previewAcceptance";
import { getScrimedBuildInfo } from "../release/vercelReleaseAssurance";
import { p34ExactHeadBaseline, p34ExactHeadBoundary } from "./exactHeadBaseline";
import { getP34AdaptiveGovernanceSummary } from "./index";

export const p34ReviewReadinessVersion = "scrimed-p34-review-readiness-v1-2026-08-25";
export const p34ReviewReadinessRoute = "/api/scrimed-control-plane/review-readiness";

const gitShaPattern = /^[0-9a-f]{40}$/i;
const sha256Pattern = /^[0-9a-f]{64}$/i;
const reviewerPattern = /^[A-Za-z0-9][A-Za-z0-9._-]{1,79}$/;

function normalizedGitSha(value: string | undefined | null) {
  const normalized = value?.trim().toLowerCase() ?? "";
  return gitShaPattern.test(normalized) ? normalized : null;
}

function normalizedSha256(value: string | undefined | null) {
  const normalized = value?.trim().toLowerCase() ?? "";
  return sha256Pattern.test(normalized) ? normalized : null;
}

function reviewEvidenceFreshness(expiresAt: string | undefined) {
  if (!expiresAt || Number.isNaN(Date.parse(expiresAt))) {
    return { status: "NOT_PRESENT" as const, expiresAt: null };
  }
  const normalized = new Date(expiresAt).toISOString();
  return {
    status: Date.parse(normalized) > Date.now() ? ("CURRENT" as const) : ("EXPIRED" as const),
    expiresAt: normalized
  };
}

function normalizedTimestamp(value: string | undefined | null, fallback: string) {
  const candidate = value?.trim() ?? "";
  return Number.isFinite(Date.parse(candidate)) ? new Date(candidate).toISOString() : fallback;
}

export function getP34ReviewReadinessSummary(env: NodeJS.ProcessEnv = process.env) {
  const build = getScrimedBuildInfo(env);
  const p34 = getP34AdaptiveGovernanceSummary();
  const previewAcceptance = getP34PreviewAcceptanceSummary(env);
  const exactHead = normalizedGitSha(build.commitSha);
  const requestedHead = normalizedGitSha(
    env.SCRIMED_P34_REVIEW_REQUESTED_HEAD_SHA ?? p34ExactHeadBaseline.commitSha
  );
  const approvedHead = normalizedGitSha(env.SCRIMED_P34_REVIEW_APPROVED_HEAD_SHA);
  const reviewerIdentity = reviewerPattern.test(env.SCRIMED_P34_REVIEWER_ID?.trim() ?? "")
    ? env.SCRIMED_P34_REVIEWER_ID!.trim()
    : null;
  const candidate = normalizedSha256(build.candidateFingerprint);
  const freshness = reviewEvidenceFreshness(env.SCRIMED_P34_REVIEW_EXPIRES_AT);
  const requestedAt = normalizedTimestamp(
    env.SCRIMED_P34_REVIEW_REQUESTED_AT,
    p34ExactHeadBaseline.reviewRequest.requestedAt
  );
  const requestAgeHours = Math.max(0, Number(((Date.now() - Date.parse(requestedAt)) / 3_600_000).toFixed(1)));
  const reviewRequested = Boolean(requestedHead);
  const reviewRequestCurrent = Boolean(exactHead && requestedHead && exactHead === requestedHead);
  const independentReviewRecorded = Boolean(
    exactHead &&
      approvedHead &&
      exactHead === approvedHead &&
      reviewerIdentity &&
      freshness.status === "CURRENT"
  );
  const reviewState = independentReviewRecorded
    ? "HUMAN_REVIEW_EVIDENCE_PRESENT_REQUIRES_EXTERNAL_VERIFICATION"
    : reviewRequested && !exactHead
      ? "EXACT_REVIEW_REQUESTED_RUNTIME_UNBOUND"
      : reviewRequested && !reviewRequestCurrent
      ? "STALE_REVIEW_REQUEST"
      : reviewRequestCurrent
        ? "EXACT_REVIEW_REQUESTED"
        : "EXACT_REVIEW_REQUIRED";

  const summary = {
    service: "scrimed-p34-review-readiness",
    version: p34ReviewReadinessVersion,
    route: p34ReviewReadinessRoute,
    candidate: {
      fingerprint: candidate,
      commitSha: exactHead,
      treeSha: normalizedGitSha(env.SCRIMED_P34_TREE_SHA),
      sourceFingerprint: normalizedSha256(env.SCRIMED_P34_SOURCE_SHA256),
      validationFingerprint: normalizedSha256(env.SCRIMED_P34_VALIDATION_SHA256),
      reviewPacketFingerprint: normalizedSha256(env.SCRIMED_P34_REVIEW_PACKET_SHA256),
      gatePacketFingerprint: normalizedSha256(env.SCRIMED_P34_GATE_PACKET_SHA256),
      sbomFingerprint: normalizedSha256(env.SCRIMED_P34_SBOM_SHA256),
      runtimeBindingStatus: build.candidateFingerprintVerificationStatus
    },
    frozenReviewTarget: {
      commitSha: p34ExactHeadBaseline.commitSha,
      treeSha: p34ExactHeadBaseline.treeSha,
      candidateFingerprint: p34ExactHeadBaseline.candidateFingerprint,
      sourceFingerprint: p34ExactHeadBaseline.sourceFingerprint,
      validationFingerprint: p34ExactHeadBaseline.validationFingerprint,
      reviewPacketFingerprint: p34ExactHeadBaseline.reviewPacketFingerprint,
      gatePacketFingerprint: p34ExactHeadBaseline.gatePacketFingerprint,
      sbomFingerprint: p34ExactHeadBaseline.sbomFingerprint,
      reviewRequestEvidence: p34ExactHeadBaseline.reviewRequest.evidenceUrl,
      previewDeploymentId: p34ExactHeadBaseline.preview.deploymentId,
      runtimeMatchesTarget: exactHead === p34ExactHeadBaseline.commitSha
    },
    pullRequest: {
      repository: "temitayodahunsi777/scrimed-site",
      number: 39,
      stateExpected: "OPEN_DRAFT_UNMERGED",
      mergeAuthorityGranted: false as const
    },
    automatedEvidence: {
      p34Status: p34.status,
      passedGates: p34.gateCounts.PASS,
      failedGates: p34.gateCounts.FAIL,
      blockedGates: p34.gateCounts.BLOCKED,
      operatorRequiredGates: p34.gateCounts.OPERATOR_REQUIRED,
      nodeMajor: build.nodeMajor,
      runtimeCompatibility: build.runtimeCompatibilityStatus,
      releaseFingerprint: build.releaseFingerprint
    },
    review: {
      requested: reviewRequested,
      requestedHead,
      requestedAt,
      requestAgeHours,
      requestCurrent: reviewRequestCurrent,
      reviewerIdentity,
      approvedHead,
      evidenceFreshness: freshness.status,
      evidenceExpiresAt: freshness.expiresAt,
      state: reviewState,
      independentlyVerifiedByRuntime: false as const
    },
    scope: {
      authoritativePrInventoryObserved: 286,
      authoritativeGapClosureBaselineObserved: 33,
      currentMappedFileCount: 314,
      currentDirectLineageFileCount: 89,
      currentUnexpectedFileCount: 0,
      currentMapHash: "84e8c41fea5662b81e6fcabde4643e0295cb09913e4ccb3beaf79927c427d720",
      mapArtifact: "artifacts/review/p39-review-map.json",
      mapDocument: "docs/review/P39_REVIEW_MAP.md",
      classificationRequired: true as const,
      unexpectedFilesAllowed: false as const
    },
    previewAcceptance,
    operatorActions: [
      { id: "independent-review", owner: "independent-technical-reviewer", state: reviewState },
      { id: "aal2", owner: "authorized-preview-operator", state: "OPERATOR_ACTION_REQUIRED" },
      { id: "supabase-leaked-password-protection", owner: "supabase-project-owner", state: "OPERATOR_ACTION_REQUIRED" },
      { id: "preview-acceptance", owner: "release-steward", state: "OPERATOR_ACTION_REQUIRED" }
    ],
    mergeAuthority: {
      granted: false as const,
      reason: "Independent review, merge authorization, and production authorization are separate external gates."
    },
    productionAuthorityGranted: false as const,
    boundary:
      `Read-only operational metadata. ${p34ExactHeadBoundary} Runtime environment declarations are not accepted as independent approval, signature verification, merge authority, deployment authority, PHI authority, clinical authority, or customer activation.`
  };

  return {
    ...summary,
    readinessHash: createClinicalEvidenceHash({
      ...summary,
      review: { ...summary.review, reviewerIdentity: reviewerIdentity ? "present" : null }
    })
  };
}
