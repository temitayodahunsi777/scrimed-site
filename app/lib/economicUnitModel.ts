import { createClinicalEvidenceHash } from "./clinicalEvidenceControls";

export const economicUnitModelVersion =
  "scrimed-economic-unit-model-v1-2026-08-09";

export type EconomicEvidenceTag =
  | "VERIFIED"
  | "ESTIMATED"
  | "SIMULATED"
  | "UNAVAILABLE";

export type EconomicUnitScenario = {
  scenarioId: string;
  evidenceTag: EconomicEvidenceTag;
  attemptedTasks: number;
  verifiedSuccessfulTasks: number;
  inferenceCostUsd: number;
  infrastructureCostUsd: number;
  reviewCostUsd: number;
  implementationCostUsd: number;
  supportCostUsd: number;
  retryCostUsd: number;
  correctionCostUsd: number;
  workflowValuePerVerifiedTaskUsd: number | null;
  contractedRevenuePerVerifiedTaskUsd: number | null;
};

function validMoney(value: number | null) {
  return value === null || (Number.isFinite(value) && value >= 0);
}

export function calculateEconomicUnitModel(input: EconomicUnitScenario) {
  if (
    input.attemptedTasks <= 0 ||
    input.verifiedSuccessfulTasks < 0 ||
    input.verifiedSuccessfulTasks > input.attemptedTasks ||
    ![
      input.inferenceCostUsd,
      input.infrastructureCostUsd,
      input.reviewCostUsd,
      input.implementationCostUsd,
      input.supportCostUsd,
      input.retryCostUsd,
      input.correctionCostUsd,
      input.workflowValuePerVerifiedTaskUsd,
      input.contractedRevenuePerVerifiedTaskUsd
    ].every(validMoney)
  ) {
    throw new Error("economic-unit-scenario-invalid");
  }

  const totalCostUsd =
    input.inferenceCostUsd +
    input.infrastructureCostUsd +
    input.reviewCostUsd +
    input.implementationCostUsd +
    input.supportCostUsd +
    input.retryCostUsd +
    input.correctionCostUsd;
  const costPerVerifiedTaskUsd =
    input.verifiedSuccessfulTasks > 0
      ? totalCostUsd / input.verifiedSuccessfulTasks
      : null;
  const verifiedIntelligenceYield =
    input.verifiedSuccessfulTasks / input.attemptedTasks;
  const totalWorkflowValueUsd =
    input.workflowValuePerVerifiedTaskUsd === null
      ? null
      : input.workflowValuePerVerifiedTaskUsd * input.verifiedSuccessfulTasks;
  const grossMarginEstimate =
    input.contractedRevenuePerVerifiedTaskUsd === null ||
    costPerVerifiedTaskUsd === null ||
    input.contractedRevenuePerVerifiedTaskUsd === 0
      ? null
      : (input.contractedRevenuePerVerifiedTaskUsd - costPerVerifiedTaskUsd) /
        input.contractedRevenuePerVerifiedTaskUsd;
  const result = {
    scenarioId: input.scenarioId,
    evidenceTag: input.evidenceTag,
    totalCostUsd,
    costPerVerifiedTaskUsd,
    verifiedIntelligenceYield,
    totalWorkflowValueUsd,
    grossMarginEstimate,
    paybackPeriodMonths: null,
    productionMetric: false as const,
    boundary:
      "Scenario output is not audited revenue, margin, savings, ROI, valuation, or a commercial commitment. Null values remain unavailable rather than being invented."
  };

  return {
    ...result,
    evidenceHash: createClinicalEvidenceHash({
      version: economicUnitModelVersion,
      input,
      ...result
    })
  };
}

export type CapitalEfficiencyBudget = {
  dailyCapUsd: number;
  monthlyCapUsd: number;
  taskCapUsd: number;
  providerConcentrationCap: number;
};

export function evaluateCapitalEfficiencyBudget(input: {
  budget: CapitalEfficiencyBudget;
  currentDailySpendUsd: number;
  currentMonthlySpendUsd: number;
  proposedTaskCostUsd: number;
  providerConcentration: number;
}) {
  const reasonCodes = [
    input.currentDailySpendUsd + input.proposedTaskCostUsd > input.budget.dailyCapUsd &&
      "capital-daily-cap-exceeded",
    input.currentMonthlySpendUsd + input.proposedTaskCostUsd > input.budget.monthlyCapUsd &&
      "capital-monthly-cap-exceeded",
    input.proposedTaskCostUsd > input.budget.taskCapUsd &&
      "capital-task-cap-exceeded",
    input.providerConcentration > input.budget.providerConcentrationCap &&
      "capital-provider-concentration-exceeded"
  ].filter((reason): reason is string => Boolean(reason));

  return {
    decision: reasonCodes.length > 0 ? ("HARD_STOP" as const) : ("ALLOW" as const),
    reasonCodes,
    approvalRequired: reasonCodes.length > 0,
    externalSpendExecuted: false as const
  };
}
