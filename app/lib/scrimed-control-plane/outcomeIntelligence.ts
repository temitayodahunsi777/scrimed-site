import type { OutcomeMetric } from "./types";

const metricRows: Array<[OutcomeMetric["category"], string, string, OutcomeMetric["direction"]]> = [
  ["clinical", "readmissions", "rate", "decrease"],
  ["clinical", "length of stay", "days", "decrease"],
  ["clinical", "complications", "rate", "decrease"],
  ["clinical", "care-gap closure", "rate", "increase"],
  ["clinical", "escalation appropriateness", "rate", "increase"],
  ["financial", "denials", "rate", "decrease"],
  ["financial", "authorization time", "hours", "decrease"],
  ["financial", "collections", "currency", "increase"],
  ["financial", "revenue leakage", "currency", "decrease"],
  ["financial", "staff cost avoided", "currency", "increase"],
  ["operational", "documentation time", "minutes", "decrease"],
  ["operational", "scheduling capacity", "appointments", "increase"],
  ["operational", "referral completion", "rate", "increase"],
  ["operational", "workflow completion", "rate", "increase"],
  ["operational", "provider burden", "minutes", "decrease"],
  ["operational", "botsitting ratio", "ratio", "decrease"],
  ["patient", "comprehension", "validated score", "increase"],
  ["patient", "engagement", "rate", "increase"],
  ["patient", "accessibility", "validated score", "increase"],
  ["patient", "follow-up completion", "rate", "increase"]
];

export const outcomeMetricRegistry: OutcomeMetric[] = metricRows.map(([category, label, unit, direction]) => ({
  id: `${category}-${label.replaceAll(" ", "-")}`,
  category,
  label,
  unit,
  direction,
  baseline: null,
  postImplementation: null,
  evidenceStatus: "not-collected",
  syntheticOnly: true
}));

export type VerifiedIntelligenceYieldInput = {
  acceptedEvidenceBackedOutputs: number;
  modelCostUsd: number;
  retryCostUsd: number;
  reviewerBurdenUsd: number;
  correctionBurdenUsd: number;
  evidenceState: "synthetic" | "measured-review-required" | "approved-measured";
  evidenceReferences: string[];
};

export function calculateVerifiedIntelligenceYield(input: VerifiedIntelligenceYieldInput) {
  const numericInputs = [
    input.acceptedEvidenceBackedOutputs,
    input.modelCostUsd,
    input.retryCostUsd,
    input.reviewerBurdenUsd,
    input.correctionBurdenUsd
  ];
  if (numericInputs.some((value) => !Number.isFinite(value) || value < 0)) {
    throw new Error("Verified Intelligence Yield inputs must be finite and nonnegative.");
  }
  if (!Number.isInteger(input.acceptedEvidenceBackedOutputs)) {
    throw new Error("Accepted evidence-backed output count must be an integer.");
  }
  if (input.acceptedEvidenceBackedOutputs > 0 && input.evidenceReferences.length === 0) {
    throw new Error("Accepted outputs require evidence references.");
  }

  const totalCostUsd = input.modelCostUsd + input.retryCostUsd + input.reviewerBurdenUsd + input.correctionBurdenUsd;
  const yieldPerUsd = totalCostUsd > 0 ? input.acceptedEvidenceBackedOutputs / totalCostUsd : null;
  const costPerAcceptedOutputUsd = input.acceptedEvidenceBackedOutputs > 0
    ? totalCostUsd / input.acceptedEvidenceBackedOutputs
    : null;

  return {
    metric: "verified-intelligence-yield" as const,
    formula: "accepted evidence-backed output / (model cost + retry cost + reviewer burden + correction burden)",
    acceptedEvidenceBackedOutputs: input.acceptedEvidenceBackedOutputs,
    totalCostUsd,
    yieldPerUsd,
    costPerAcceptedOutputUsd,
    evidenceState: input.evidenceState,
    evidenceReferences: [...new Set(input.evidenceReferences)].sort(),
    productionOutcomeClaimAllowed: false as const,
    displayLabel:
      input.evidenceState === "synthetic"
        ? "SYNTHETIC MODEL - NOT AN OBSERVED CUSTOMER OUTCOME"
        : input.evidenceState === "measured-review-required"
          ? "MEASURED - INDEPENDENT REVIEW REQUIRED"
          : "APPROVED MEASUREMENT - SCOPE AND LIMITATIONS REQUIRED",
    boundary:
      "This metric measures accepted evidence-backed output economics. It cannot establish clinical benefit, causality, revenue, ROI, or production readiness."
  };
}

export function getOutcomeIntelligenceSummary() {
  return {
    service: "scrimed-outcome-value-intelligence",
    status: "baseline-first-no-fabricated-improvements",
    metrics: outcomeMetricRegistry,
    categories: ["clinical", "financial", "operational", "patient"],
    baselineRequiredBeforeComparison: true,
    postImplementationValuesPresent: false,
    verifiedIntelligenceYieldFormula: "accepted evidence-backed output / total measured model, retry, reviewer, and correction cost",
    healthcareValueReturned: ["evidence-backed time saved"],
    outcomesReviewWindow: "Review after an approved pilot reaches its pre-specified cohort and evidence threshold; 100-200 participants is planning guidance, not automatic authority.",
    boundary: "No outcome improvement is claimed until approved baseline, measurement, attribution, reviewer, and statistical evidence exist."
  };
}
