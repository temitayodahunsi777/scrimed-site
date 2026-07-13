import { generateScrimedAuditHash } from "./scrimedIntelligencePlatform";
import { scrimedSafetyPolicyVersion } from "./scrimedSafetyGovernance";

export type ScrimedReasoningConfidence = "low" | "medium" | "high";
export type ScrimedReasoningSafetyStatus = "pass" | "caution" | "blocked";

export type ScrimedReasoningStabilityCase = {
  caseId: string;
  taskFamily: string;
  outputText: string;
  retryCount: number;
  evidenceCount: number;
  hasClinicalClaim: boolean;
  hasUncertaintyStatement: boolean;
};

export type ScrimedReasoningStabilityResult = {
  doomLoopDetected: boolean;
  repeatedSpanDetected: boolean;
  selfConsistencyCheck: "stable" | "inconsistent" | "insufficient_samples";
  clinicalHallucinationRisk: "low" | "medium" | "high";
  retryRecommendation: "do_not_retry" | "retry_with_more_evidence" | "escalate_to_human_review" | "terminate_run";
  confidenceCategory: ScrimedReasoningConfidence;
  safetyStatus: ScrimedReasoningSafetyStatus;
  auditHash: string;
};

export const scrimedReasoningStabilityApiRoute = "/api/scrimed-reasoning-stability";
export const scrimedReasoningStabilityBriefRoute = "/api/scrimed-reasoning-stability/brief";
export const scrimedReasoningStabilityStatus = "scrimed-reasoning-stability-active-synthetic-no-phi";
export const scrimedReasoningStabilityBoundary =
  "SCRIMED Reasoning Stability is a synthetic/no-PHI evaluation layer for model output quality. It detects loop, repetition, consistency, and hallucination-risk metadata only; it does not validate clinical truth, diagnose, treat, prescribe, or authorize live-care use.";

export const sampleReasoningStabilityCase: ScrimedReasoningStabilityCase = {
  caseId: "synthetic-reasoning-stability-001",
  taskFamily: "clinical-documentation-review",
  outputText:
    "The synthetic note appears incomplete because no source citation is attached. More evidence is required before any reviewer-facing conclusion. More evidence is required before any reviewer-facing conclusion.",
  retryCount: 2,
  evidenceCount: 0,
  hasClinicalClaim: true,
  hasUncertaintyStatement: true
};

function hasRepeatedSpan(text: string) {
  const normalized = text.toLowerCase().replace(/\s+/g, " ").trim();
  const sentences = normalized.split(/[.!?]+/).map((sentence) => sentence.trim()).filter(Boolean);

  return sentences.some((sentence, index) => sentence.length > 24 && sentences.indexOf(sentence) !== index);
}

function hasDoomLoop(input: ScrimedReasoningStabilityCase) {
  return input.retryCount >= 3 || /\b(retry|again|cannot proceed|loop)\b.*\b(retry|again|cannot proceed|loop)\b/i.test(input.outputText);
}

export function evaluateScrimedReasoningStability(
  input: ScrimedReasoningStabilityCase = sampleReasoningStabilityCase
): ScrimedReasoningStabilityResult {
  const doomLoopDetected = hasDoomLoop(input);
  const repeatedSpanDetected = hasRepeatedSpan(input.outputText);
  const clinicalHallucinationRisk =
    input.hasClinicalClaim && input.evidenceCount === 0
      ? "high"
      : input.hasClinicalClaim && input.evidenceCount < 2
        ? "medium"
        : "low";
  const selfConsistencyCheck = repeatedSpanDetected
    ? "inconsistent"
    : input.retryCount === 0
      ? "insufficient_samples"
      : "stable";
  const safetyStatus: ScrimedReasoningSafetyStatus =
    doomLoopDetected || clinicalHallucinationRisk === "high"
      ? "blocked"
      : repeatedSpanDetected || clinicalHallucinationRisk === "medium"
        ? "caution"
        : "pass";
  const retryRecommendation =
    safetyStatus === "blocked"
      ? doomLoopDetected
        ? "terminate_run"
        : "escalate_to_human_review"
      : safetyStatus === "caution"
        ? "retry_with_more_evidence"
        : "do_not_retry";
  const confidenceCategory: ScrimedReasoningConfidence =
    safetyStatus === "pass" && input.evidenceCount >= 2
      ? "high"
      : safetyStatus === "blocked"
        ? "low"
        : "medium";

  return {
    doomLoopDetected,
    repeatedSpanDetected,
    selfConsistencyCheck,
    clinicalHallucinationRisk,
    retryRecommendation,
    confidenceCategory,
    safetyStatus,
    auditHash: generateScrimedAuditHash({
      input,
      doomLoopDetected,
      repeatedSpanDetected,
      clinicalHallucinationRisk,
      safetyPolicyVersion: scrimedSafetyPolicyVersion
    })
  };
}

export function getScrimedReasoningStabilitySummary() {
  return {
    service: "scrimed-reasoning-stability",
    status: scrimedReasoningStabilityStatus,
    apiRoute: scrimedReasoningStabilityApiRoute,
    briefRoute: scrimedReasoningStabilityBriefRoute,
    boundary: scrimedReasoningStabilityBoundary,
    detectors: [
      "doom-loop detector",
      "repeated-token/span detector",
      "self-consistency check",
      "clinical hallucination risk placeholder",
      "retry recommendation",
      "output confidence category",
      "safety status"
    ],
    sampleCase: sampleReasoningStabilityCase,
    sampleResult: evaluateScrimedReasoningStability(),
    productionReadiness: false,
    noPhiConfirmed: true
  };
}

export function buildScrimedReasoningStabilityBrief() {
  const summary = getScrimedReasoningStabilitySummary();

  return [
    "# SCRIMED Reasoning Stability Layer",
    "",
    summary.boundary,
    "",
    "## Detectors",
    ...summary.detectors.map((detector) => `- ${detector}`),
    "",
    "## Sample Result",
    `- Safety status: ${summary.sampleResult.safetyStatus}`,
    `- Confidence: ${summary.sampleResult.confidenceCategory}`,
    `- Retry recommendation: ${summary.sampleResult.retryRecommendation}`,
    `- Clinical hallucination risk: ${summary.sampleResult.clinicalHallucinationRisk}`,
    `- Audit hash: ${summary.sampleResult.auditHash}`,
    "",
    "The layer supports evaluation and escalation only. It does not create clinical authority."
  ].join("\n");
}
