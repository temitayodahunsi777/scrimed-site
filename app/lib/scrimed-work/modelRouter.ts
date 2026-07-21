import { evaluateCostApiGuardrail } from "../costApiGuardrails";
import { evaluateScrimedSafetyGate } from "../scrimedSafetyGovernance";
import { createAuditHash } from "./audit";
import { selectProviderCandidates, type ScrimedWorkProvider } from "./providerRegistry";
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
  domainCellId?: string;
  validatedDomainCells?: Array<{
    cellId: string;
    modelId: string;
    status: "pass" | "restricted" | "blocked";
    qualityScore: number;
    acceptedOutcomeRate: number;
    sampleSize: number;
    minimumSampleSize: number;
  }>;
  costComponents?: Partial<{
    retrievalUsd: number;
    cacheUsd: number;
    hostingUsd: number;
    reservedCapacityUsd: number;
    observabilityUsd: number;
    validationUsd: number;
    maintenanceUsd: number;
    retriesUsd: number;
    humanReviewUsd: number;
  }>;
  maximumFallbacks?: number;
  eligibleModelIds?: string[];
  blockedModelIds?: string[];
  blockedProviderIds?: string[];
  providerHealth?: Record<string, ScrimedWorkProvider["healthStatus"]>;
  workflowAcceptanceByModel?: Record<string, number>;
  minimumHumanAcceptance?: number;
  resourceAdmission?: {
    state: ModelRouteDecision["runtimeState"];
    allowedModelIds: string[];
    auditHash: string;
  };
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
  const classificationBlocked =
    input.dataClassification === "phi-blocked" || input.dataClassification === "unknown";
  const invalidRouteInput =
    !Number.isFinite(input.latencyTargetMs) ||
    input.latencyTargetMs <= 0 ||
    !Number.isFinite(input.budgetUsd) ||
    input.budgetUsd < 0 ||
    !Number.isFinite(input.qualityThreshold) ||
    input.qualityThreshold < 0 ||
    input.qualityThreshold > 1;
  const safety = evaluateScrimedSafetyGate({
    route: "/api/scrimed-work/route-model",
    requestedAction: `${input.taskType} ${input.tenantPolicy}`,
    inputText: input.taskType,
    allowMetadataOnly: true
  });
  const candidates = selectProviderCandidates({
    requiredCapability: capability,
    dataClassification: input.dataClassification,
    residencyRequirement: input.residencyRequirement,
    providerHealth: input.providerHealth,
    blockedProviderIds: input.blockedProviderIds
  });
  const policyCompliantCandidates = candidates.filter((candidate) => {
    if (candidate.providerId !== "synthetic-fallback" && candidate.availability !== "available") return false;
    if (input.dataClassification === "phi-blocked" && !candidate.phiEligible) return false;
    if (input.eligibleModelIds && !input.eligibleModelIds.includes(candidate.modelId)) return false;
    if (input.blockedModelIds?.includes(candidate.modelId)) return false;
    if (input.resourceAdmission && !input.resourceAdmission.allowedModelIds.includes(candidate.modelId)) return false;
    if (
      input.minimumHumanAcceptance !== undefined &&
      (input.workflowAcceptanceByModel?.[candidate.modelId] ?? 0) < input.minimumHumanAcceptance
    ) return false;
    return true;
  });
  const domainCells = input.validatedDomainCells ?? [];
  const cellRequired = input.risk === "high" && Boolean(input.domainCellId);
  const modelEligibleForCell = (modelId: string) => {
    if (!input.domainCellId) return input.risk !== "high" || domainCells.length === 0;
    const cell = domainCells.find((candidate) => candidate.cellId === input.domainCellId && candidate.modelId === modelId);
    return Boolean(
      cell &&
      cell.status === "pass" &&
      cell.qualityScore >= input.qualityThreshold &&
      cell.sampleSize >= cell.minimumSampleSize
    );
  };
  const eligibleCandidates = policyCompliantCandidates.filter((candidate) => modelEligibleForCell(candidate.modelId));
  const selected = eligibleCandidates[0];
  const projectedCost = (selected?.estimatedInputCostUsdPer1k ?? 0) + (selected?.estimatedOutputCostUsdPer1k ?? 0);
  const components = input.costComponents ?? {};
  const totalEstimatedCostUsd = [
    projectedCost,
    components.retrievalUsd,
    components.cacheUsd,
    components.hostingUsd,
    components.reservedCapacityUsd,
    components.observabilityUsd,
    components.validationUsd,
    components.maintenanceUsd,
    components.retriesUsd,
    components.humanReviewUsd
  ].reduce<number>((total, value) => total + Math.max(0, value ?? 0), 0);
  const routeBudgetExceeded = totalEstimatedCostUsd > input.budgetUsd;
  const externalProviderCallRequested = Boolean(
    selected && !selected.policyTags.includes("no-external-call")
  );
  const cost = evaluateCostApiGuardrail({
    route: "/api/scrimed-work/route-model",
    projectedCostUsd: projectedCost,
    externalProviderCallRequested
  });
  const policyBlocked =
    !safety.allowed ||
    !cost.allowed ||
    classificationBlocked ||
    invalidRouteInput ||
    routeBudgetExceeded ||
    input.resourceAdmission?.state === "SAFE_REFUSAL" ||
    input.risk === "prohibited";
  const noEligibleModel = !policyBlocked && (!selected || (cellRequired && !modelEligibleForCell(selected.modelId)));
  const blocked = policyBlocked || noEligibleModel;
  const deploymentMode =
    input.deploymentMode ??
    (input.residencyRequirement === "local-only" ? "AIR_GAPPED" : "SCRIMED_CLOUD");

  const selectedCell = input.domainCellId
    ? domainCells.find((cell) => cell.cellId === input.domainCellId && cell.modelId === selected?.modelId)
    : undefined;
  const acceptedOutcomeRate = selectedCell?.acceptedOutcomeRate ?? 0;
  const maximumFallbacks = Math.min(2, Math.max(0, input.maximumFallbacks ?? 1));
  const fallbackModels = eligibleCandidates
    .filter((candidate) => candidate.modelId !== selected?.modelId)
    .slice(0, maximumFallbacks)
    .map((candidate) => candidate.modelId);
  const routingStatus: ModelRouteDecision["routingStatus"] = policyBlocked
    ? "blocked-by-policy"
    : noEligibleModel
      ? "abstained-no-eligible-model"
      : "selected";

  return {
    routingStatus,
    selectedModel: blocked ? "blocked-no-model-selected" : selected.modelId,
    modelTier: capability,
    provider: blocked ? (noEligibleModel ? "none-no-eligible-model" : "none-policy-blocked") : selected.providerId,
    deploymentMode,
    reason: policyBlocked
      ? classificationBlocked
        ? "Routing is blocked because detected or unclassified PHI risk cannot enter the current no-PHI model runtime."
        : invalidRouteInput
          ? "Routing is blocked because latency, budget, or quality policy metadata is invalid."
          : routeBudgetExceeded
            ? "Routing is blocked because total accepted-outcome cost components exceed the request budget."
            : "Routing is blocked because safety, cost, risk, provider, or residency policy cannot be satisfied."
      : noEligibleModel
        ? "No model has validated eligibility for the requested domain cell, risk, quality, privacy, residency, and availability constraints; SCRIMED abstained."
      : "Selected the strongest policy-compliant provider that preserves privacy, residency, budget, and task capability requirements.",
    riskLevel: input.risk,
    phiPolicy:
      input.dataClassification === "phi-blocked"
        ? "phi-blocked"
        : capability === "local-private"
          ? "local-private-required"
          : "no-phi",
    requiresHumanReview: blocked || input.risk === "high" || input.dataClassification !== "synthetic-no-phi",
    fallbackModels,
    estimatedCostClass: costClass(totalEstimatedCostUsd),
    estimatedLatencyClass: latencyClass(selected?.observedLatencyMs ?? 50),
    validatedCellIds: selectedCell ? [selectedCell.cellId] : [],
    totalEstimatedCostUsd,
    estimatedCostPerAcceptedOutcomeUsd: acceptedOutcomeRate > 0 ? totalEstimatedCostUsd / acceptedOutcomeRate : null,
    fallbackPolicy: {
      maximumFallbacks,
      privacyDowngradeAllowed: false,
      silentFallbackAllowed: false
    },
    runtimeState: input.resourceAdmission?.state ?? "NORMAL",
    resourceAdmissionHash: input.resourceAdmission?.auditHash ?? null,
    auditTags: [
      `safety:${safety.status}`,
      `cost:${cost.status}`,
      `capability:${capability}`,
      `provider:${selected?.providerId ?? "none"}`,
      `routing:${routingStatus}`,
      `classification:${input.dataClassification}`,
      `request-budget:${input.budgetUsd}`,
      `budget-exceeded:${routeBudgetExceeded}`,
      `cell:${input.domainCellId ?? "not-specified"}`,
      `validated:${selectedCell ? "true" : "false"}`,
      `fallback-budget:${maximumFallbacks}`,
      `passport-eligible:${input.eligibleModelIds?.join(",") ?? "registry-default"}`,
      `passport-blocked:${input.blockedModelIds?.join(",") ?? "none"}`,
      `provider-blocked:${input.blockedProviderIds?.join(",") ?? "none"}`,
      `provider-health-overrides:${Object.keys(input.providerHealth ?? {}).sort().join(",") || "none"}`,
      `workflow-acceptance-threshold:${input.minimumHumanAcceptance ?? "not-required"}`,
      `runtime-state:${input.resourceAdmission?.state ?? "NORMAL"}`,
      `resource-admission:${input.resourceAdmission?.auditHash ?? "not-supplied"}`,
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
    qualityThreshold: 0.9,
    domainCellId: "synthetic-care-coordination-en-review",
    validatedDomainCells: [
      {
        cellId: "synthetic-care-coordination-en-review",
        modelId: "scrimed-synthetic-no-call",
        status: "pass",
        qualityScore: 0.95,
        acceptedOutcomeRate: 0.9,
        sampleSize: 100,
        minimumSampleSize: 40
      }
    ],
    costComponents: { validationUsd: 0.02, humanReviewUsd: 0.25 },
    maximumFallbacks: 1
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
