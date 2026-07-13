import { createAuditHash, routeScrimedWorkModel } from "../scrimed-work";
import type { DataClassification, EffectiveCost, ProviderClass, RiskLevel } from "./types";

export type ModelPolicyProfile = "SOL_CLASS" | "TERRA_CLASS" | "LUNA_CLASS" | "BLOCKED";

export type ControlPlaneModelRouteInput = {
  taskType: string;
  complexity: "low" | "moderate" | "high";
  consequence: RiskLevel;
  dataClassification: DataClassification;
  requiredModality: "text" | "coding" | "vision" | "voice" | "embedding";
  residencyRequirement: "us" | "customer-region" | "local-only";
  latencyTargetMs: number;
  budgetUsd: number;
  tenantPolicy: string;
  verificationStrength: number;
  localPrivateRequired: boolean;
};

export function calculateEffectiveCost(input: {
  apiCostUsd: number;
  infrastructureCostUsd: number;
  humanReviewMinutes: number;
  humanHourlyCostUsd: number;
  retryCostUsd: number;
  fallbackCostUsd: number;
  expectedFailureProbability: number;
  expectedFailureImpactUsd: number;
  verifiedArtifactCount: number;
}): EffectiveCost {
  const humanReviewCostUsd = (Math.max(0, input.humanReviewMinutes) / 60) * Math.max(0, input.humanHourlyCostUsd);
  const expectedFailureCostUsd = Math.max(0, input.expectedFailureProbability) * Math.max(0, input.expectedFailureImpactUsd);
  const totalEffectiveCostUsd = [
    input.apiCostUsd,
    input.infrastructureCostUsd,
    humanReviewCostUsd,
    input.retryCostUsd,
    input.fallbackCostUsd,
    expectedFailureCostUsd
  ].reduce((sum, value) => sum + Math.max(0, value), 0);

  return {
    apiCostUsd: Math.max(0, input.apiCostUsd),
    infrastructureCostUsd: Math.max(0, input.infrastructureCostUsd),
    humanReviewCostUsd,
    retryCostUsd: Math.max(0, input.retryCostUsd),
    fallbackCostUsd: Math.max(0, input.fallbackCostUsd),
    expectedFailureCostUsd,
    totalEffectiveCostUsd,
    costPerVerifiedArtifactUsd: input.verifiedArtifactCount > 0 ? totalEffectiveCostUsd / input.verifiedArtifactCount : null
  };
}

function profileFor(input: ControlPlaneModelRouteInput): ModelPolicyProfile {
  if (input.consequence === "prohibited" || input.dataClassification === "phi-prohibited") return "BLOCKED";
  if (input.consequence === "high" || input.complexity === "high" || input.verificationStrength < 60) return "SOL_CLASS";
  if (input.complexity === "moderate" || input.consequence === "moderate") return "TERRA_CLASS";
  return "LUNA_CLASS";
}

function providerClassFor(profile: ModelPolicyProfile, localPrivateRequired: boolean): ProviderClass {
  if (profile === "BLOCKED") return "deterministic";
  if (localPrivateRequired) return "local-private";
  if (profile === "SOL_CLASS") return "frontier";
  if (profile === "TERRA_CLASS") return "balanced";
  return "fast";
}

export function routeControlPlaneModel(input: ControlPlaneModelRouteInput) {
  const policyProfile = profileFor(input);
  const blocked = policyProfile === "BLOCKED";
  const localPrivateRequired = input.localPrivateRequired || input.residencyRequirement === "local-only";
  const workDecision = routeScrimedWorkModel({
    taskType: input.taskType,
    risk: input.consequence,
    requiredCapability:
      localPrivateRequired ? "local-private" : input.requiredModality === "text" ? "balanced" : input.requiredModality,
    dataClassification:
      input.dataClassification === "phi-prohibited" || input.dataClassification === "restricted"
        ? "phi-blocked"
        : input.dataClassification === "deidentified-clinical"
          ? "deidentified"
          : "metadata-only",
    latencyTargetMs: input.latencyTargetMs,
    budgetUsd: input.budgetUsd,
    tenantPolicy: input.tenantPolicy,
    residencyRequirement: input.residencyRequirement,
    reasoningRequirement: input.complexity === "high" ? "high" : input.complexity === "moderate" ? "medium" : "low",
    qualityThreshold: Math.max(0.8, input.verificationStrength / 100),
    deploymentMode: localPrivateRequired ? "AIR_GAPPED" : "SCRIMED_CLOUD"
  });
  const effectiveCost = calculateEffectiveCost({
    apiCostUsd: 0,
    infrastructureCostUsd: 0,
    humanReviewMinutes: input.consequence === "high" ? 15 : 5,
    humanHourlyCostUsd: 0,
    retryCostUsd: 0,
    fallbackCostUsd: 0,
    expectedFailureProbability: input.verificationStrength < 80 ? 0.2 : 0.05,
    expectedFailureImpactUsd: 0,
    verifiedArtifactCount: 0
  });

  return {
    policyProfile,
    operatingRule: "Luna executes. Terra coordinates. Sol resolves.",
    providerClass: providerClassFor(policyProfile, localPrivateRequired),
    selectedProvider: blocked ? "none-policy-blocked" : workDecision.provider,
    selectedModelProfile: blocked ? "blocked-no-model-selected" : workDecision.selectedModel,
    routingReason: blocked
      ? "Policy blocked prohibited risk or PHI-prohibited data before model selection."
      : `${policyProfile} selected from complexity, consequence, verification strength, privacy, residency, latency, and budget. ${workDecision.reason}`,
    riskLevel: input.consequence,
    estimatedInputCostUsd: 0,
    estimatedOutputCostUsd: 0,
    estimatedLatencyClass: workDecision.estimatedLatencyClass,
    fallbackModels: blocked ? [] : workDecision.fallbackModels,
    phiEligibility: false,
    requiresHumanReview: input.consequence === "high" || input.dataClassification === "deidentified-clinical" || workDecision.requiresHumanReview,
    privacyDowngradeAllowed: false,
    providerCallsExecuted: false,
    effectiveCost,
    auditTags: [...workDecision.auditTags, `policy-profile:${policyProfile}`, "no-provider-call"],
    auditHash: createAuditHash({ input, policyProfile, provider: workDecision.provider, blocked })
  };
}

export const modelEfficiencyFrontier = [
  { workflow: "metadata classification", policyProfile: "LUNA_CLASS", qualityFloor: 80, effectiveCostStatus: "measure-in-pilot" },
  { workflow: "operational coordination", policyProfile: "TERRA_CLASS", qualityFloor: 88, effectiveCostStatus: "measure-in-pilot" },
  { workflow: "high-consequence synthesis", policyProfile: "SOL_CLASS", qualityFloor: 95, effectiveCostStatus: "human-review-cost-required" }
] as const;
