import { createClinicalEvidenceHash } from "../clinicalEvidenceControls";

export const pilotCostGovernorVersion =
  "scrimed-p34-pilot-cost-governor-v2-2026-08-28";

export type PilotCostLimits = {
  maxInferenceCostUsd: number;
  maxToolCostUsd: number;
  maxModelCalls: number;
  maxToolCalls: number;
  maxRetries: number;
  maxRuntimeMinutes: number;
  maxAgentDepth: number;
  maxEvidenceStorageBytes: number;
  maxTotalBudgetUsd: number;
  warningThresholdPercent: number;
};

export type PilotCostUsage = {
  inferenceCostUsd: number;
  toolCostUsd: number;
  infrastructureCostUsd: number;
  reviewCostUsd: number;
  correctionCostUsd: number;
  modelCalls: number;
  toolCalls: number;
  retries: number;
  runtimeMinutes: number;
  agentDepth: number;
  evidenceStorageBytes: number;
  reviewerMinutes: number;
  acceptedUsefulOutputs: number;
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
    usage.reviewCostUsd,
    usage.correctionCostUsd
  ];
  if (monetaryLimits.some((value) => !Number.isFinite(value) || value <= 0)) {
    reasons.push("INVALID_MONETARY_LIMIT");
  }
  if (monetaryUsage.some((value) => !Number.isFinite(value) || value < 0)) {
    reasons.push("INVALID_MONETARY_USAGE");
  }
  if (!Number.isInteger(limits.maxRetries) || limits.maxRetries < 0) reasons.push("INVALID_RETRY_LIMIT");
  if (!Number.isFinite(limits.maxRuntimeMinutes) || limits.maxRuntimeMinutes <= 0) reasons.push("INVALID_RUNTIME_LIMIT");
  for (const [value, reason] of [
    [limits.maxModelCalls, "INVALID_MODEL_CALL_LIMIT"],
    [limits.maxToolCalls, "INVALID_TOOL_CALL_LIMIT"],
    [limits.maxAgentDepth, "INVALID_AGENT_DEPTH_LIMIT"],
    [limits.maxEvidenceStorageBytes, "INVALID_EVIDENCE_STORAGE_LIMIT"]
  ] as const) {
    if (!Number.isInteger(value) || value < 1) reasons.push(reason);
  }
  if (!Number.isFinite(limits.warningThresholdPercent) || limits.warningThresholdPercent < 1 || limits.warningThresholdPercent > 100) {
    reasons.push("INVALID_WARNING_THRESHOLD");
  }
  if (!Number.isInteger(usage.retries) || usage.retries < 0) reasons.push("INVALID_RETRY_USAGE");
  if (!Number.isFinite(usage.runtimeMinutes) || usage.runtimeMinutes < 0) reasons.push("INVALID_RUNTIME_USAGE");
  for (const [value, reason] of [
    [usage.modelCalls, "INVALID_MODEL_CALL_USAGE"],
    [usage.toolCalls, "INVALID_TOOL_CALL_USAGE"],
    [usage.agentDepth, "INVALID_AGENT_DEPTH_USAGE"],
    [usage.evidenceStorageBytes, "INVALID_EVIDENCE_STORAGE_USAGE"],
    [usage.reviewerMinutes, "INVALID_REVIEWER_MINUTES"],
    [usage.acceptedUsefulOutputs, "INVALID_ACCEPTED_OUTPUT_COUNT"]
  ] as const) {
    if (!Number.isInteger(value) || value < 0) reasons.push(reason);
  }

  const totalSpendUsd = monetaryUsage.every((value) => Number.isFinite(value) && value >= 0)
    ? Number(monetaryUsage.reduce((sum, value) => sum + value, 0).toFixed(2))
    : null;
  if (usage.inferenceCostUsd > limits.maxInferenceCostUsd) reasons.push("INFERENCE_COST_LIMIT_EXCEEDED");
  if (usage.toolCostUsd > limits.maxToolCostUsd) reasons.push("TOOL_COST_LIMIT_EXCEEDED");
  if (usage.modelCalls > limits.maxModelCalls) reasons.push("MODEL_CALL_LIMIT_EXCEEDED");
  if (usage.toolCalls > limits.maxToolCalls) reasons.push("TOOL_CALL_LIMIT_EXCEEDED");
  if (usage.retries > limits.maxRetries) reasons.push("RETRY_LIMIT_EXCEEDED");
  if (usage.runtimeMinutes > limits.maxRuntimeMinutes) reasons.push("RUNTIME_LIMIT_EXCEEDED");
  if (usage.agentDepth > limits.maxAgentDepth) reasons.push("AGENT_DEPTH_LIMIT_EXCEEDED");
  if (usage.evidenceStorageBytes > limits.maxEvidenceStorageBytes) reasons.push("EVIDENCE_STORAGE_LIMIT_EXCEEDED");
  if (totalSpendUsd !== null && totalSpendUsd > limits.maxTotalBudgetUsd) reasons.push("TOTAL_BUDGET_EXCEEDED");

  const invalidOrExceeded = reasons.length > 0;
  const budgetUtilizationPercent = totalSpendUsd !== null && limits.maxTotalBudgetUsd > 0
    ? Number(((totalSpendUsd / limits.maxTotalBudgetUsd) * 100).toFixed(1))
    : null;
  const warning = !invalidOrExceeded
    && budgetUtilizationPercent !== null
    && budgetUtilizationPercent >= limits.warningThresholdPercent;
  const status = invalidOrExceeded ? "STOP_SAFELY" as const : warning ? "WARN" as const : "ALLOW" as const;
  const decision = {
    status,
    executionAllowed: status !== "STOP_SAFELY",
    safeStopRequired: status === "STOP_SAFELY",
    totalSpendUsd,
    budgetUtilizationPercent,
    verifiedIntelligenceYield: totalSpendUsd && usage.acceptedUsefulOutputs > 0
      ? Number((usage.acceptedUsefulOutputs / totalSpendUsd).toFixed(6))
      : 0,
    verifiedIntelligenceYieldUnit: "accepted-useful-outputs-per-usd" as const,
    valueClassification: "SIMULATED" as const,
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

const zeroPilotCostUsage = (): PilotCostUsage => ({
  inferenceCostUsd: 0,
  toolCostUsd: 0,
  infrastructureCostUsd: 0,
  reviewCostUsd: 0,
  correctionCostUsd: 0,
  modelCalls: 0,
  toolCalls: 0,
  retries: 0,
  runtimeMinutes: 0,
  agentDepth: 0,
  evidenceStorageBytes: 0,
  reviewerMinutes: 0,
  acceptedUsefulOutputs: 0
});

function combinePilotCostUsage(current: PilotCostUsage, requested: PilotCostUsage): PilotCostUsage {
  return {
    inferenceCostUsd: current.inferenceCostUsd + requested.inferenceCostUsd,
    toolCostUsd: current.toolCostUsd + requested.toolCostUsd,
    infrastructureCostUsd: current.infrastructureCostUsd + requested.infrastructureCostUsd,
    reviewCostUsd: current.reviewCostUsd + requested.reviewCostUsd,
    correctionCostUsd: current.correctionCostUsd + requested.correctionCostUsd,
    modelCalls: current.modelCalls + requested.modelCalls,
    toolCalls: current.toolCalls + requested.toolCalls,
    retries: current.retries + requested.retries,
    runtimeMinutes: current.runtimeMinutes + requested.runtimeMinutes,
    agentDepth: Math.max(current.agentDepth, requested.agentDepth),
    evidenceStorageBytes: current.evidenceStorageBytes + requested.evidenceStorageBytes,
    reviewerMinutes: current.reviewerMinutes + requested.reviewerMinutes,
    acceptedUsefulOutputs: current.acceptedUsefulOutputs + requested.acceptedUsefulOutputs
  };
}

export class InMemorySyntheticPilotBudgetLedger {
  #usage = zeroPilotCostUsage();

  reserve(limits: PilotCostLimits, requested: PilotCostUsage) {
    const proposedUsage = combinePilotCostUsage(this.#usage, requested);
    const decision = evaluatePilotCostGovernor(limits, proposedUsage);
    if (decision.executionAllowed) this.#usage = proposedUsage;
    return {
      ...decision,
      reservationApplied: decision.executionAllowed,
      usageAfterReservation: decision.executionAllowed ? { ...this.#usage } : { ...this.#usage },
      productionAuthorityGranted: false as const
    };
  }

  snapshot() {
    return { ...this.#usage };
  }
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
