import type { ValueTelemetry, WorkSession } from "./types";

export function calculateValueTelemetry(input: Partial<ValueTelemetry>): ValueTelemetry {
  const estimatedManualMinutes = Math.max(input.estimatedManualMinutes ?? 1, 1);
  const artifactCount = Math.max(input.artifactCount ?? 0, 0);
  const estimatedModelCostUsd = input.estimatedModelCostUsd ?? 0;
  const humanReviewMinutes = input.humanReviewMinutes ?? 0;
  const estimatedTimeSavedMinutes = input.estimatedTimeSavedMinutes ?? 0;
  const verificationFailures = input.verificationFailures ?? 0;
  const approvalCount = input.approvalCount ?? 0;

  return {
    sessionDurationMinutes: input.sessionDurationMinutes ?? 0,
    steps: input.steps ?? 0,
    toolCalls: input.toolCalls ?? 0,
    retries: input.retries ?? 0,
    verificationFailures,
    humanReviewMinutes,
    estimatedManualMinutes,
    estimatedTimeSavedMinutes,
    estimatedModelCostUsd,
    latencyMs: input.latencyMs ?? 0,
    artifactCount,
    approvalCount,
    rollbackCount: input.rollbackCount ?? 0,
    cancellationCount: input.cancellationCount ?? 0,
    contextHitRate: input.contextHitRate ?? 0,
    unsupportedClaimRate: input.unsupportedClaimRate ?? 0,
    loopDetectionRate: input.loopDetectionRate ?? 0,
    providerFallbackRate: input.providerFallbackRate ?? 0,
    botsittingRatio: humanReviewMinutes / estimatedManualMinutes,
    netTimeSavedMinutes: Math.max(0, estimatedTimeSavedMinutes - humanReviewMinutes),
    costPerVerifiedArtifact: artifactCount > 0 ? estimatedModelCostUsd / artifactCount : estimatedModelCostUsd,
    percentageCompletedWithoutCorrection: verificationFailures === 0 ? 100 : 0,
    percentageRequiringEscalation: approvalCount > 0 ? 100 : 0,
    verificationFirstPassRate: verificationFailures === 0 ? 100 : 50
  };
}

export function summarizeSessionValue(session: WorkSession) {
  return {
    sessionId: session.id,
    domain: session.workspaceDomain,
    botsittingRatio: session.valueTelemetry.botsittingRatio,
    netTimeSavedMinutes: session.valueTelemetry.netTimeSavedMinutes,
    costPerVerifiedArtifact: session.valueTelemetry.costPerVerifiedArtifact,
    verificationFirstPassRate: session.valueTelemetry.verificationFirstPassRate,
    privacyBoundary: "No raw prompts, PHI, tokens, or sensitive document text in telemetry."
  };
}
