import { evaluateCostApiGuardrail } from "../costApiGuardrails";
import { evaluateScrimedSafetyGate } from "../scrimedSafetyGovernance";
import { createAuditHash } from "./audit";
import { selectProviderCandidates } from "./providerRegistry";
import type {
  DataClassification,
  ModelRouteDecision,
  ProviderRoutingClass,
  RiskLevel
} from "./types";

export type ScrimedWorkModelRouteInput = {
  taskType: string;
  risk: RiskLevel;
  requiredCapability: ProviderRoutingClass;
  dataClassification: DataClassification;
  latencyTargetMs: number;
  budgetUsd: number;
  tenantPolicy: string;
  residencyRequirement?: "us" | "customer-region" | "local-only";
  reasoningRequirement: "low" | "medium" | "high";
  qualityThreshold: number;
  deploymentMode?: ModelRouteDecision["deploymentMode"];
};

function chooseCapability(input: ScrimedWorkModelRouteInput): ProviderRoutingClass {
  if (input.dataClassification === "phi-blocked" || input.residencyRequirement === "local-only") return "local-private";
  if (input.requiredCapability === "coding") return "coding";
  if (input.requiredCapability === "vision") return "vision";
  if (input.requiredCapability === "voice") return "voice";
  if (input.reasoningRequirement === "high" || input.risk === "high") return "reasoning";
  if (input.latencyTargetMs < 1_500 || input.budgetUsd < 0.03) return "fast";
  return input.requiredCapability;
}

function costClass(cost: number): "low" | "medium" | "high" {
  if (cost <= 0.03) return "low";
  if (cost <= 0.12) return "medium";
  return "high";
}

function latencyClass(latencyMs: number): "fast" | "balanced" | "slow" {
  if (latencyMs <= 1_500) return "fast";
  if (latencyMs <= 4_000) return "balanced";
  return "slow";
}

export function routeScrimedWorkModel(input: ScrimedWorkModelRouteInput): ModelRouteDecision {
  const capability = chooseCapability(input);
  const safety = evaluateScrimedSafetyGate({
    route: "/api/scrimed-work/route-model",
    requestedAction: `${input.taskType} ${input.tenantPolicy}`,
    inputText: input.taskType,
    allowMetadataOnly: true
  });
  const candidates = selectProviderCandidates({
    requiredCapability: capability,
    dataClassification: input.dataClassification,
    residencyRequirement: input.residencyRequirement
  });
  const policyCompliantCandidates = candidates.filter((candidate) => {
    if (candidate.providerId !== "synthetic-fallback" && candidate.availability !== "available") return false;
    if (input.dataClassification === "phi-blocked" && !candidate.phiEligible) return false;
    return true;
  });
  const selected = policyCompliantCandidates[0] ?? candidates.find((candidate) => candidate.providerId === "synthetic-fallback") ?? candidates[0];
  const projectedCost = (selected?.estimatedInputCostUsdPer1k ?? 0) + (selected?.estimatedOutputCostUsdPer1k ?? 0);
  const cost = evaluateCostApiGuardrail({
    route: "/api/scrimed-work/route-model",
    projectedCostUsd: projectedCost,
    externalProviderCallRequested: selected?.providerId !== "synthetic-fallback"
  });
  const blocked = !safety.allowed || !cost.allowed || input.risk === "prohibited";
  const deploymentMode =
    input.deploymentMode ??
    (input.residencyRequirement === "local-only" ? "AIR_GAPPED" : "SCRIMED_CLOUD");

  return {
    selectedModel: blocked ? "blocked-no-model-selected" : selected?.modelId ?? "scrimed-synthetic-no-call",
    modelTier: capability,
    provider: blocked ? "none-policy-blocked" : selected?.providerId ?? "synthetic-fallback",
    deploymentMode,
    reason: blocked
      ? "Routing is blocked because safety, cost, risk, provider, or residency policy cannot be satisfied."
      : "Selected the strongest policy-compliant provider that preserves privacy, residency, budget, and task capability requirements.",
    riskLevel: input.risk,
    phiPolicy:
      input.dataClassification === "phi-blocked"
        ? "phi-blocked"
        : capability === "local-private"
          ? "local-private-required"
          : "no-phi",
    requiresHumanReview: input.risk === "high" || input.dataClassification !== "synthetic-no-phi",
    fallbackModels: ["scrimed-synthetic-no-call", "customer-approved-local-private-model"],
    estimatedCostClass: costClass(projectedCost),
    estimatedLatencyClass: latencyClass(selected?.observedLatencyMs ?? 50),
    auditTags: [
      `safety:${safety.status}`,
      `cost:${cost.status}`,
      `capability:${capability}`,
      `provider:${selected?.providerId ?? "none"}`,
      `audit:${createAuditHash({ input, selected: selected?.providerId ?? "none" }).slice(0, 12)}`
    ]
  };
}

export const sampleModelRouteInputs: ScrimedWorkModelRouteInput[] = [
  {
    taskType: "clinical context summary for synthetic care coordination brief",
    risk: "high",
    requiredCapability: "reasoning",
    dataClassification: "synthetic-no-phi",
    latencyTargetMs: 5_000,
    budgetUsd: 0.1,
    tenantPolicy: "human review required",
    reasoningRequirement: "high",
    qualityThreshold: 0.9
  },
  {
    taskType: "executive operating report",
    risk: "moderate",
    requiredCapability: "balanced",
    dataClassification: "metadata-only",
    latencyTargetMs: 3_000,
    budgetUsd: 0.05,
    tenantPolicy: "no secrets no PHI",
    reasoningRequirement: "medium",
    qualityThreshold: 0.8
  },
  {
    taskType: "air-gapped synthetic FHIR preview",
    risk: "high",
    requiredCapability: "local-private",
    dataClassification: "deidentified",
    latencyTargetMs: 6_000,
    budgetUsd: 0.05,
    tenantPolicy: "local private only",
    residencyRequirement: "local-only",
    reasoningRequirement: "high",
    qualityThreshold: 0.9,
    deploymentMode: "AIR_GAPPED"
  }
];
