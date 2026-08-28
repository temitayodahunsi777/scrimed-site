import { createClinicalEvidenceHash } from "../clinicalEvidenceControls";

export const pilotCostGovernorVersion =
  "scrimed-p34-pilot-cost-governor-v1-2026-08-27";

export type PilotCostLimits = {
  maxInferenceCostUsd: number;
  maxToolCostUsd: number;
  maxRetries: number;
  maxRuntimeMinutes: number;
  maxTotalBudgetUsd: number;
  warningThresholdPercent: number;
};

export type PilotCostUsage = {
  inferenceCostUsd: number;
  toolCostUsd: number;
  infrastructureCostUsd: number;
  reviewCostUsd: number;
  retries: number;
  runtimeMinutes: number;
};

export function evaluatePilotCostGovernor(limits: PilotCostLimits, usage: PilotCostUsage) {
  const reasons: string[] = [];
  const monetaryLimits = [
    limits.maxInferenceCostUsd,
    limits.maxToolCostUsd,
    limits.maxTotalBudgetUsd
  ];
  const monetaryUsage = [
    usage.inferenceCostUsd,
    usage.toolCostUsd,
    usage.infrastructureCostUsd,
    usage.reviewCostUsd
  ];
  if (monetaryLimits.some((value) => !Number.isFinite(value) || value <= 0)) {
    reasons.push("INVALID_MONETARY_LIMIT");
  }
  if (monetaryUsage.some((value) => !Number.isFinite(value) || value < 0)) {
    reasons.push("INVALID_MONETARY_USAGE");
  }
  if (!Number.isInteger(limits.maxRetries) || limits.maxRetries < 0) reasons.push("INVALID_RETRY_LIMIT");
  if (!Number.isFinite(limits.maxRuntimeMinutes) || limits.maxRuntimeMinutes <= 0) reasons.push("INVALID_RUNTIME_LIMIT");
  if (!Number.isFinite(limits.warningThresholdPercent) || limits.warningThresholdPercent < 1 || limits.warningThresholdPercent > 100) {
    reasons.push("INVALID_WARNING_THRESHOLD");
  }
  if (!Number.isInteger(usage.retries) || usage.retries < 0) reasons.push("INVALID_RETRY_USAGE");
  if (!Number.isFinite(usage.runtimeMinutes) || usage.runtimeMinutes < 0) reasons.push("INVALID_RUNTIME_USAGE");

  const totalSpendUsd = monetaryUsage.every((value) => Number.isFinite(value) && value >= 0)
    ? Number(monetaryUsage.reduce((sum, value) => sum + value, 0).toFixed(2))
    : null;
  if (usage.inferenceCostUsd > limits.maxInferenceCostUsd) reasons.push("INFERENCE_COST_LIMIT_EXCEEDED");
  if (usage.toolCostUsd > limits.maxToolCostUsd) reasons.push("TOOL_COST_LIMIT_EXCEEDED");
  if (usage.retries > limits.maxRetries) reasons.push("RETRY_LIMIT_EXCEEDED");
  if (usage.runtimeMinutes > limits.maxRuntimeMinutes) reasons.push("RUNTIME_LIMIT_EXCEEDED");
  if (totalSpendUsd !== null && totalSpendUsd > limits.maxTotalBudgetUsd) reasons.push("TOTAL_BUDGET_EXCEEDED");

  const invalidOrExceeded = reasons.length > 0;
  const budgetUtilizationPercent = totalSpendUsd !== null && limits.maxTotalBudgetUsd > 0
    ? Number(((totalSpendUsd / limits.maxTotalBudgetUsd) * 100).toFixed(1))
    : null;
  const warning = !invalidOrExceeded
    && budgetUtilizationPercent !== null
    && budgetUtilizationPercent >= limits.warningThresholdPercent;
  const status = invalidOrExceeded ? "STOP" as const : warning ? "WARN" as const : "ALLOW" as const;
  const decision = {
    status,
    executionAllowed: status !== "STOP",
    safeStopRequired: status === "STOP",
    totalSpendUsd,
    budgetUtilizationPercent,
    reasonCodes: [...new Set(reasons)].sort(),
    productionAuthorityGranted: false as const
  };
  return {
    ...decision,
    decisionHash: createClinicalEvidenceHash({
      version: pilotCostGovernorVersion,
      limits,
      usage,
      decision
    })
  };
}

export type PilotMarginScenarioInput = {
  proposedPriceUsd: number;
  modelSpendUsd: number;
  engineeringEffortUsd: number;
  reviewBurdenUsd: number;
  infrastructureUsd: number;
  customerSupportUsd: number;
};

function calculateMargin(input: PilotMarginScenarioInput, costMultiplier = 1) {
  const baseCost = input.modelSpendUsd
    + input.engineeringEffortUsd
    + input.reviewBurdenUsd
    + input.infrastructureUsd
    + input.customerSupportUsd;
  const deliveryCostUsd = Number((baseCost * costMultiplier).toFixed(2));
  const grossMarginUsd = Number((input.proposedPriceUsd - deliveryCostUsd).toFixed(2));
  const grossMarginPercent = input.proposedPriceUsd > 0
    ? Number(((grossMarginUsd / input.proposedPriceUsd) * 100).toFixed(1))
    : null;
  return { deliveryCostUsd, grossMarginUsd, grossMarginPercent };
}

export function calculatePilotMarginScenario(input: PilotMarginScenarioInput) {
  const values = Object.values(input);
  const valid = values.every((value) => Number.isFinite(value) && value >= 0)
    && input.proposedPriceUsd > 0;
  if (!valid) {
    return {
      status: "INVALID_INPUT" as const,
      classification: "ESTIMATED" as const,
      bindingQuoteAuthorized: false as const,
      result: null,
      sensitivity: [],
      scenarioHash: createClinicalEvidenceHash({ version: pilotCostGovernorVersion, input, valid })
    };
  }

  const result = calculateMargin(input);
  const sensitivity = [0.8, 1, 1.2, 1.5].map((costMultiplier) => ({
    costMultiplier,
    ...calculateMargin(input, costMultiplier)
  }));
  const deliveryBurden = result.deliveryCostUsd / input.proposedPriceUsd;
  const payload = {
    status: "ESTIMATED_SCENARIO" as const,
    classification: "ESTIMATED" as const,
    bindingQuoteAuthorized: false as const,
    result: {
      ...result,
      breakEvenPriceUsd: result.deliveryCostUsd,
      deliveryBurden: deliveryBurden <= 0.55 ? "LOW" as const : deliveryBurden <= 0.8 ? "MODERATE" as const : "HIGH" as const
    },
    sensitivity,
    boundary: "Internal scenario only. Price, discount, margin, delivery, contract, and revenue commitments require named human commercial and finance approval."
  };
  return {
    ...payload,
    scenarioHash: createClinicalEvidenceHash({ version: pilotCostGovernorVersion, input, payload })
  };
}
