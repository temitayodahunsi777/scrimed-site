import { createClinicalEvidenceHash } from "../clinicalEvidenceControls";
import { getP34PreviewAcceptanceSummary } from "../release/previewAcceptance";
import { getScrimedBuildInfo } from "../release/vercelReleaseAssurance";
import { p34ExactHeadBaseline, p34ExactHeadBoundary } from "./exactHeadBaseline";
import { deriveExactHeadReviewState } from "./exactHeadReviewState";
import { getP34AdaptiveGovernanceSummary } from "./index";

export const p34ReviewReadinessVersion = "scrimed-p34-review-readiness-v2-2026-08-28";
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

function reviewEvidenceFreshness(reviewedAt: string | undefined, expiresAt: string | undefined, now: Date) {
  const reviewedAtMs = Date.parse(reviewedAt ?? "");
  const expiresAtMs = Date.parse(expiresAt ?? "");
  const nowMs = now.getTime();
  if (!Number.isFinite(reviewedAtMs) || !Number.isFinite(expiresAtMs) || !Number.isFinite(nowMs)) {
    return { status: "NOT_PRESENT" as const, reviewedAt: null, expiresAt: null };
  }
  const normalizedReviewedAt = new Date(reviewedAtMs).toISOString();
  const normalizedExpiresAt = new Date(expiresAtMs).toISOString();
  const temporallyValid = reviewedAtMs <= nowMs + 5 * 60_000
    && expiresAtMs > nowMs
    && expiresAtMs > reviewedAtMs
    && expiresAtMs - reviewedAtMs <= 30 * 24 * 60 * 60_000;
  return {
    status: temporallyValid ? ("CURRENT" as const) : ("EXPIRED" as const),
    reviewedAt: normalizedReviewedAt,
    expiresAt: normalizedExpiresAt
  };
}

function normalizedTimestamp(value: string | undefined | null, fallback: string) {
  const candidate = value?.trim() ?? "";
  return Number.isFinite(Date.parse(candidate)) ? new Date(candidate).toISOString() : fallback;
}

export type P34TrustedExternalReviewReceipt = {
  status: "PASS" | "CHANGES_REQUESTED";
  trustClass: "trusted-external";
  pullRequestNumber: number;
  commitSha: string;
  treeSha: string;
  candidateFingerprint: string;
  sourceFingerprint: string;
  validationFingerprint: string;
  reviewPacketFingerprint: string;
  gatePacketFingerprint: string;
  sbomFingerprint: string;
  previewDeploymentId: string | null;
  reviewerIdentityHash: string;
  receiptHash: string;
  reviewedAt: string;
  expiresAt: string;
  signatureVerified: true;
  approvalConsumed: true;
};

export function getP34ReviewReadinessSummary(
  env: NodeJS.ProcessEnv = process.env,
  trustedReviewReceipt: P34TrustedExternalReviewReceipt | null = null,
  now: Date = new Date()
) {
  const build = getScrimedBuildInfo(env);
  const p34 = getP34AdaptiveGovernanceSummary();
  const previewAcceptance = getP34PreviewAcceptanceSummary(env);
  const exactHead = normalizedGitSha(build.commitSha);
  const requestedHead = normalizedGitSha(env.SCRIMED_P34_REVIEW_REQUESTED_HEAD_SHA);
  const approvedHead = normalizedGitSha(trustedReviewReceipt?.commitSha);
  const exactTree = normalizedGitSha(env.SCRIMED_P34_TREE_SHA);
  const sourceFingerprint = normalizedSha256(env.SCRIMED_P34_SOURCE_SHA256);
  const validationFingerprint = normalizedSha256(env.SCRIMED_P34_VALIDATION_SHA256);
  const reviewPacketFingerprint = normalizedSha256(env.SCRIMED_P34_REVIEW_PACKET_SHA256);
  const gatePacketFingerprint = normalizedSha256(env.SCRIMED_P34_GATE_PACKET_SHA256);
  const sbomFingerprint = normalizedSha256(env.SCRIMED_P34_SBOM_SHA256);
  const reviewerIdentity = reviewerPattern.test(env.SCRIMED_P34_REVIEWER_ID?.trim() ?? "")
    ? env.SCRIMED_P34_REVIEWER_ID!.trim()
    : null;
  const candidate = normalizedSha256(build.candidateFingerprint);
  const freshness = reviewEvidenceFreshness(
    trustedReviewReceipt?.reviewedAt,
    trustedReviewReceipt?.expiresAt,
    now
  );
  const requestedAt = normalizedTimestamp(
    env.SCRIMED_P34_REVIEW_REQUESTED_AT,
    p34ExactHeadBaseline.reviewRequest.requestedAt
  );
  const requestAgeHours = Math.max(0, Number(((now.getTime() - Date.parse(requestedAt)) / 3_600_000).toFixed(1)));
  const reviewRequested = Boolean(requestedHead);
  const reviewRequestCurrent = Boolean(exactHead && requestedHead && exactHead === requestedHead);
  const currentPrNumber = Number.parseInt(env.SCRIMED_P34_PR_NUMBER ?? "", 10);
  const currentPrUrl = env.SCRIMED_P34_PR_URL?.trim() ?? null;
  const currentPreviewDeploymentId = env.SCRIMED_P34_PREVIEW_DEPLOYMENT_ID?.trim() || null;
  const trustedReceiptValid = Boolean(
    exactHead &&
      approvedHead &&
      exactHead === approvedHead &&
      exactTree &&
      normalizedGitSha(trustedReviewReceipt?.treeSha) === exactTree &&
      candidate &&
      normalizedSha256(trustedReviewReceipt?.candidateFingerprint) === candidate &&
      sourceFingerprint &&
      normalizedSha256(trustedReviewReceipt?.sourceFingerprint) === sourceFingerprint &&
      validationFingerprint &&
      normalizedSha256(trustedReviewReceipt?.validationFingerprint) === validationFingerprint &&
      reviewPacketFingerprint &&
      normalizedSha256(trustedReviewReceipt?.reviewPacketFingerprint) === reviewPacketFingerprint &&
      gatePacketFingerprint &&
      normalizedSha256(trustedReviewReceipt?.gatePacketFingerprint) === gatePacketFingerprint &&
      sbomFingerprint &&
      normalizedSha256(trustedReviewReceipt?.sbomFingerprint) === sbomFingerprint &&
      Number.isInteger(currentPrNumber) &&
      currentPrNumber > 0 &&
      trustedReviewReceipt?.pullRequestNumber === currentPrNumber &&
      (trustedReviewReceipt?.previewDeploymentId ?? null) === currentPreviewDeploymentId &&
      trustedReviewReceipt?.trustClass === "trusted-external" &&
      trustedReviewReceipt.signatureVerified === true &&
      trustedReviewReceipt.approvalConsumed === true &&
      sha256Pattern.test(trustedReviewReceipt.reviewerIdentityHash) &&
      sha256Pattern.test(trustedReviewReceipt.receiptHash) &&
      freshness.status === "CURRENT"
  );
  const reviewState = deriveExactHeadReviewState({
    currentHeadSha: exactHead,
    requestedHeadSha: requestedHead,
    requestAcknowledged: reviewRequestCurrent && (
      env.SCRIMED_P34_REVIEW_REQUEST_ACKNOWLEDGED === "true"
      || (Number.isInteger(currentPrNumber) && currentPrNumber > 0)
    ),
    disposition: trustedReviewReceipt?.status === "PASS"
      ? "APPROVED"
      : trustedReviewReceipt?.status === "CHANGES_REQUESTED"
        ? "CHANGES_REQUESTED"
        : "NONE",
    dispositionHeadSha: approvedHead,
    trustedExternalReceiptValid: trustedReceiptValid
  });
  const currentPr = Number.isInteger(currentPrNumber) && currentPrNumber > 0
    ? {
        number: currentPrNumber,
        url: currentPrUrl && /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/pull\/\d+$/.test(currentPrUrl)
          ? currentPrUrl
          : null,
        state: "OPEN_REVIEW_REQUIRED" as const
      }
    : null;

  const summary = {
    service: "scrimed-p34-review-readiness",
    version: p34ReviewReadinessVersion,
    route: p34ReviewReadinessRoute,
    candidate: {
      fingerprint: candidate,
      commitSha: exactHead,
      treeSha: exactTree,
      sourceFingerprint,
      validationFingerprint,
      reviewPacketFingerprint,
      gatePacketFingerprint,
      sbomFingerprint,
      runtimeBindingStatus: build.candidateFingerprintVerificationStatus
    },
    predecessorReviewTarget: {
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
    predecessorPullRequest: {
      repository: "temitayodahunsi777/scrimed-site",
      number: 39,
      stateExpected: "OPEN_DRAFT_UNMERGED",
      mergeAuthorityGranted: false as const
    },
    currentPullRequest: currentPr,
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
      trustedExternalReceiptPresent: trustedReceiptValid,
      evidenceFreshness: freshness.status,
      evidenceReviewedAt: freshness.reviewedAt,
      evidenceExpiresAt: freshness.expiresAt,
      state: reviewState,
      independentlyVerifiedByRuntime: trustedReceiptValid
    },
    scope: {
      mapArtifact: "artifacts/review/p34-integration-map.json",
      mapDocument: "docs/review/P34_INTEGRATION_MAP.md",
      currentCandidateManifest: "artifacts/release/scrimed-p34-release-manifest.json",
      classificationRequired: true as const,
      unexpectedFilesAllowed: false as const
    },
    previewAcceptance,
    operatorActions: [
      { id: "publish-follow-on-pr", owner: "release-steward", state: currentPr ? "PASS" : "OPERATOR_ACTION_REQUIRED" },
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
