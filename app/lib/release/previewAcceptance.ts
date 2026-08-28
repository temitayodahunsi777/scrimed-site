import { createClinicalEvidenceHash } from "../clinicalEvidenceControls";
import { getScrimedBuildInfo } from "./vercelReleaseAssurance";
import { p34ExactHeadBaseline } from "../scrimed-p34/exactHeadBaseline";

export const previewAcceptanceVersion =
  "scrimed-p34-preview-acceptance-v1-2026-08-27";

export type PreviewAcceptanceInput = {
  deploymentId: string;
  deploymentUrl: string;
  commitSha: string;
  treeSha: string;
  candidateFingerprint: string;
  environment: "preview" | "production" | "development" | "test" | "unknown";
  nodeMajor: number | null;
  healthPassed: boolean;
  readinessPassed: boolean;
  browserSmokePassed: boolean;
  apiSmokePassed: boolean;
  safetyBoundariesPassed: boolean;
  protectedWritesObserved: boolean;
  productionAliases: string[];
  acceptedBy: string | null;
  acceptedAt: string | null;
};

export type PreviewAcceptanceExpected = {
  deploymentId: string;
  deploymentUrl: string;
  commitSha: string;
  treeSha: string;
  candidateFingerprint: string;
};

const gitShaPattern = /^[0-9a-f]{40}$/i;
const sha256Pattern = /^[0-9a-f]{64}$/i;
const deploymentPattern = /^dpl_[A-Za-z0-9]{8,80}$/;
const actorPattern = /^[A-Za-z0-9][A-Za-z0-9._-]{1,79}$/;

export function evaluatePreviewAcceptance(
  input: PreviewAcceptanceInput,
  expected: PreviewAcceptanceExpected,
  now: Date = new Date()
) {
  const reasonCodes: string[] = [];
  let normalizedDeploymentUrl: string | null = null;
  try {
    const parsed = new URL(input.deploymentUrl);
    normalizedDeploymentUrl = parsed.protocol === "https:"
      && !parsed.username
      && !parsed.password
      && parsed.pathname === "/"
      && !parsed.search
      && !parsed.hash
      ? parsed.origin
      : null;
  } catch {
    // The deterministic URL checks below preserve the failure reason.
  }
  if (!deploymentPattern.test(input.deploymentId)) reasonCodes.push("VALID_DEPLOYMENT_ID_REQUIRED");
  if (input.deploymentId !== expected.deploymentId) reasonCodes.push("DEPLOYMENT_ID_MISMATCH");
  if (!normalizedDeploymentUrl) reasonCodes.push("VALID_PREVIEW_URL_REQUIRED");
  if (normalizedDeploymentUrl !== expected.deploymentUrl) reasonCodes.push("DEPLOYMENT_URL_MISMATCH");
  if (!gitShaPattern.test(input.commitSha) || input.commitSha !== expected.commitSha) reasonCodes.push("COMMIT_MISMATCH");
  if (!gitShaPattern.test(input.treeSha) || input.treeSha !== expected.treeSha) reasonCodes.push("TREE_MISMATCH");
  if (!sha256Pattern.test(input.candidateFingerprint) || input.candidateFingerprint !== expected.candidateFingerprint) {
    reasonCodes.push("CANDIDATE_MISMATCH");
  }
  if (input.environment !== "preview") reasonCodes.push("NONPRODUCTION_PREVIEW_REQUIRED");
  if (input.nodeMajor !== 24) reasonCodes.push("NODE24_REQUIRED");
  if (!input.healthPassed) reasonCodes.push("HEALTH_CHECK_REQUIRED");
  if (!input.readinessPassed) reasonCodes.push("READINESS_CHECK_REQUIRED");
  if (!input.browserSmokePassed) reasonCodes.push("BROWSER_SMOKE_REQUIRED");
  if (!input.apiSmokePassed) reasonCodes.push("API_SMOKE_REQUIRED");
  if (!input.safetyBoundariesPassed) reasonCodes.push("SAFETY_BOUNDARY_CHECK_REQUIRED");
  if (input.protectedWritesObserved) reasonCodes.push("UNEXPECTED_PROTECTED_WRITE");
  if (input.productionAliases.length > 0) reasonCodes.push("PRODUCTION_ALIAS_ATTACHED");
  if (!actorPattern.test(input.acceptedBy ?? "")) reasonCodes.push("ATTRIBUTABLE_RELEASE_STEWARD_REQUIRED");
  const acceptedAt = Date.parse(input.acceptedAt ?? "");
  const nowMs = now.getTime();
  if (!Number.isFinite(acceptedAt) || !Number.isFinite(nowMs)) {
    reasonCodes.push("VALID_ACCEPTANCE_TIMESTAMP_REQUIRED");
  } else {
    if (acceptedAt > nowMs + 5 * 60_000) reasonCodes.push("FUTURE_ACCEPTANCE_EVIDENCE");
    if (nowMs - acceptedAt > 24 * 60 * 60_000) reasonCodes.push("STALE_ACCEPTANCE_EVIDENCE");
  }

  const accepted = reasonCodes.length === 0;
  const receipt = {
    version: previewAcceptanceVersion,
    status: accepted ? "NONPRODUCTION_PREVIEW_ACCEPTED" as const : "OPERATOR_ACTION_REQUIRED" as const,
    accepted,
    deploymentId: input.deploymentId,
    deploymentUrl: input.deploymentUrl,
    commitSha: input.commitSha,
    treeSha: input.treeSha,
    candidateFingerprint: input.candidateFingerprint,
    environment: input.environment,
    nodeMajor: input.nodeMajor,
    acceptedBy: input.acceptedBy,
    acceptedAt: input.acceptedAt,
    checks: {
      healthPassed: input.healthPassed,
      readinessPassed: input.readinessPassed,
      browserSmokePassed: input.browserSmokePassed,
      apiSmokePassed: input.apiSmokePassed,
      safetyBoundariesPassed: input.safetyBoundariesPassed,
      protectedWritesAbsent: !input.protectedWritesObserved,
      productionAliasAbsent: input.productionAliases.length === 0
    },
    reasonCodes: [...new Set(reasonCodes)].sort(),
    mergeAuthorized: false as const,
    productionAuthorized: false as const,
    customerGoLiveAuthorized: false as const
  };
  return {
    ...receipt,
    receiptHash: createClinicalEvidenceHash({ version: previewAcceptanceVersion, receipt })
  };
}

export function getP34PreviewAcceptanceSummary(env: NodeJS.ProcessEnv = process.env) {
  const build = getScrimedBuildInfo(env);
  const runtimeMatchesFrozenTarget = build.commitSha === p34ExactHeadBaseline.commitSha
    && build.candidateFingerprint === p34ExactHeadBaseline.candidateFingerprint;
  const status = runtimeMatchesFrozenTarget && build.environment === "preview"
    ? "READY_FOR_RELEASE_STEWARD_ACCEPTANCE"
    : "OPERATOR_ACTION_REQUIRED";
  const summary = {
    service: "scrimed-p34-preview-acceptance",
    version: previewAcceptanceVersion,
    status,
    previewReady: p34ExactHeadBaseline.preview.state === "READY",
    previewAccepted: false as const,
    runtimeMatchesFrozenTarget,
    deploymentId: p34ExactHeadBaseline.preview.deploymentId,
    deploymentUrl: p34ExactHeadBaseline.preview.deploymentUrl,
    expectedCommitSha: p34ExactHeadBaseline.commitSha,
    expectedTreeSha: p34ExactHeadBaseline.treeSha,
    expectedCandidateFingerprint: p34ExactHeadBaseline.candidateFingerprint,
    currentRuntimeCommitSha: build.commitSha,
    currentRuntimeCandidateFingerprint: build.candidateFingerprint,
    nodeMajor: build.nodeMajor,
    productionAliasAttached: false as const,
    mergeAuthorized: false as const,
    productionAuthorized: false as const,
    customerGoLiveAuthorized: false as const,
    operatorAction:
      "Run exact-target browser and API smoke, inspect safety boundaries and protected-write evidence, then record a named release-steward acceptance receipt for the exact deployment.",
    boundary:
      "Preview readiness and acceptance are nonproduction evidence only. This runtime never self-accepts and grants no merge, deployment, migration, PHI, clinical, payer, EHR/device, customer, certification, or external-distribution authority."
  };
  return {
    ...summary,
    summaryHash: createClinicalEvidenceHash(summary)
  };
}
