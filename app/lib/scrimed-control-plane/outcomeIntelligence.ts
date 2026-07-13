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

export function getOutcomeIntelligenceSummary() {
  return {
    service: "scrimed-outcome-value-intelligence",
    status: "baseline-first-no-fabricated-improvements",
    metrics: outcomeMetricRegistry,
    categories: ["clinical", "financial", "operational", "patient"],
    baselineRequiredBeforeComparison: true,
    postImplementationValuesPresent: false,
    outcomesReviewWindow: "Review after an approved pilot reaches its pre-specified cohort and evidence threshold; 100-200 participants is planning guidance, not automatic authority.",
    boundary: "No outcome improvement is claimed until approved baseline, measurement, attribution, reviewer, and statistical evidence exist."
  };
}
