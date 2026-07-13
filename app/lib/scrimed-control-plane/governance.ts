import { createAuditHash, verifyScrimedWorkResult } from "../scrimed-work";
import type { TrustScore } from "./types";
import type { WorkSession } from "../scrimed-work";

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function calculateTrustScore(input: Omit<TrustScore, "total">): TrustScore {
  const total =
    input.evidenceQuality * 0.16 +
    input.evidenceCoverage * 0.14 +
    input.sourceFreshness * 0.1 +
    input.policyCompliance * 0.16 +
    input.contextCompleteness * 0.1 +
    input.modelAgreement * 0.08 +
    input.citationCompleteness * 0.1 +
    (100 - input.hallucinationRisk) * 0.08 +
    input.reversibility * 0.04 +
    input.humanReviewStatus * 0.04;

  return { ...input, total: clamp(total) };
}

export function verifyControlPlaneSession(session: WorkSession) {
  const base = verifyScrimedWorkResult({ session });
  const approved = session.approvalCheckpoints.some((checkpoint) => checkpoint.status === "approved");
  const citationCompleteness = session.evidence.length === 0 ? 0 : 100;
  const evidenceCoverage = Math.min(100, (session.evidence.length / Math.max(session.definitionOfDone.requiredEvidence.length, 1)) * 100);
  const trustScore = calculateTrustScore({
    evidenceQuality: session.evidence.every((item) => item.trustTier !== "untrusted-input") ? 85 : 35,
    evidenceCoverage,
    sourceFreshness: 85,
    policyCompliance: base.failedCriteria.some((item) => item.includes("policy")) ? 0 : 100,
    contextCompleteness: session.sourceContextReferences.length > 0 ? 85 : 0,
    modelAgreement: 50,
    citationCompleteness,
    hallucinationRisk: session.evidence.length > 0 ? 25 : 90,
    reversibility: session.rollbackMetadata.rollbackAvailable ? 100 : 0,
    humanReviewStatus: approved ? 100 : session.riskLevel === "high" ? 0 : 50
  });
  const mandatoryChecksPassed = base.allPass && trustScore.policyCompliance === 100 && trustScore.citationCompleteness === 100;

  return {
    allPass: mandatoryChecksPassed,
    mandatoryChecksPassed,
    passRate: base.criteriaPassRate,
    failedChecks: base.failedCriteria,
    warnings: base.warnings,
    evidence: base.evidence,
    trustScore,
    recommendedAction: mandatoryChecksPassed ? "eligible-for-human-confirmed-completion" : base.recommendedAction,
    eligibleForCompletion: mandatoryChecksPassed,
    agentNarrativeAcceptedAsProof: false,
    auditHash: createAuditHash({ sessionId: session.id, base, trustScore, mandatoryChecksPassed })
  };
}

export function evaluateArtifactStaleness(input: {
  artifactId: string;
  referencedVersions: Record<string, string>;
  currentVersions: Record<string, string>;
  calculationsChanged: boolean;
}) {
  const staleSources = Object.entries(input.referencedVersions)
    .filter(([sourceId, version]) => input.currentVersions[sourceId] !== version)
    .map(([sourceId]) => sourceId);
  const stale = staleSources.length > 0 || input.calculationsChanged;

  return {
    artifactId: input.artifactId,
    stale,
    staleSources,
    calculationsChanged: input.calculationsChanged,
    externalUseAllowed: false,
    recommendedAction: stale ? "rebuild-reverify-and-obtain-human-review" : "retain-current-review-status",
    auditHash: createAuditHash({ ...input, staleSources, stale })
  };
}
