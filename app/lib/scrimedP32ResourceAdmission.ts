import { createClinicalEvidenceHash } from "./clinicalEvidenceControls";

export const scrimedP32ResourceAdmissionVersion = "scrimed-p32-resource-admission-v1-2026-07-20";

export const scrimedP32ResourceAdmissionBoundary =
  "Resource admission evaluates synthetic and metadata-only execution fitness. It does not invoke a model, authorize live PHI, weaken privacy or residency policy, or silently change clinical behavior.";

export type RuntimeState = "NORMAL" | "CONSTRAINED" | "DEGRADED" | "SAFE_REFUSAL";

export type DeviceProfile = {
  memoryBytes: number;
  sharedMemory: boolean;
  accelerators: string[];
  bandwidthClass: string;
  thermalClass: "nominal" | "constrained" | "hot";
  powerClass: string;
  supportedPrecisions: string[];
  privacyZone: "public" | "tenant-private" | "sovereign-local";
};

export type TaskExecutionBudget = {
  maximumCostUsd: number;
  maximumLatencyMs: number;
  maximumRetries: number;
  maximumToolCalls: number;
  maximumContextTokens: number;
  maximumMemoryBytes: number;
  maximumKvCacheBytes: number;
};

export type ModelResourceProfile = {
  modelId: string;
  deployment: "local" | "remote";
  minimumResidentMemoryBytes: number;
  peakResidentMemoryBytes: number;
  estimatedKvCacheBytes: number;
  estimatedCostUsd: number;
  estimatedLatencyMs: number;
  contextTokens: number;
  requiredAccelerators: string[];
  precision: string;
  quantized: boolean;
  zeroCopySupported: boolean;
  expectedQuality: number;
};

export type ResourceAdmissionRequest = {
  requestId: string;
  tenantId: string;
  taskId: string;
  dataClassification: "public-reference" | "synthetic-no-phi" | "deidentified-approved" | "phi";
  riskLevel: "low" | "moderate" | "high" | "prohibited";
  device: DeviceProfile;
  budget: TaskExecutionBudget;
  primary: ModelResourceProfile;
  fallbacks: ModelResourceProfile[];
  retryCount: number;
  toolCallCount: number;
  policy: {
    localProcessingApproved: boolean;
    remoteProcessingRequested: boolean;
    livePhiProcessingAuthorized: boolean;
    consentConfirmed: boolean;
    baaApproved: boolean;
    residencyApproved: boolean;
    providerCapabilityApproved: boolean;
  };
  failureSignal?: "none" | "oom" | "thermal" | "accelerator-unavailable" | "timeout" | "memory-pressure";
  correlationId: string;
};

export type ResourceAdmissionDecision = {
  requestId: string;
  tenantId: string;
  taskId: string;
  state: RuntimeState;
  selectedModelId: string | null;
  admissionAllowed: boolean;
  modelExecutionAuthorized: false;
  localRouteSelected: boolean;
  remoteEscalationEligibleForSeparatePreflight: boolean;
  contextDistillationRequired: boolean;
  kvCacheBudgetBytes: number;
  reasonCodes: string[];
  safeAction: "admit-synthetic-preflight" | "use-bounded-fallback" | "human-handoff" | "refuse";
  metrics: {
    projectedPeakResidentMemoryBytes: number;
    projectedDataCopiesPerTask: number;
    projectedKvCacheBytes: number;
    projectedCostUsd: number;
    projectedLatencyMs: number;
    qualityDeltaFromPrimary: number;
    energyEstimateWh: null;
  };
  correlationId: string;
  auditHash: string;
};

function validNonnegative(value: number) {
  return Number.isFinite(value) && value >= 0;
}

function modelFits(request: ResourceAdmissionRequest, model: ModelResourceProfile) {
  const usableMemory = Math.min(request.device.memoryBytes, request.budget.maximumMemoryBytes);
  const contextFits = model.contextTokens <= request.budget.maximumContextTokens;
  const kvFits = model.estimatedKvCacheBytes <= request.budget.maximumKvCacheBytes;
  const memoryFits = model.peakResidentMemoryBytes + model.estimatedKvCacheBytes <= Math.floor(usableMemory * 0.85);
  const acceleratorFits = model.requiredAccelerators.every((accelerator) => request.device.accelerators.includes(accelerator));
  const precisionFits = request.device.supportedPrecisions.includes(model.precision);
  const costFits = model.estimatedCostUsd <= request.budget.maximumCostUsd;
  const latencyFits = model.estimatedLatencyMs <= request.budget.maximumLatencyMs;
  const localPolicyFits = model.deployment !== "local" || request.policy.localProcessingApproved;
  const remotePolicyFits = model.deployment !== "remote" || (
    request.policy.remoteProcessingRequested &&
    request.policy.providerCapabilityApproved &&
    request.policy.residencyApproved &&
    request.dataClassification !== "phi"
  );
  return {
    fits: contextFits && kvFits && memoryFits && acceleratorFits && precisionFits && costFits && latencyFits && localPolicyFits && remotePolicyFits,
    contextFits,
    kvFits,
    memoryFits,
    acceleratorFits,
    precisionFits,
    costFits,
    latencyFits,
    localPolicyFits,
    remotePolicyFits
  };
}

export function evaluateResourceAdmission(request: ResourceAdmissionRequest): ResourceAdmissionDecision {
  const reasonCodes: string[] = [];
  const numericBudgetValues = Object.values(request.budget);
  const modelNumericValues = [request.device.memoryBytes, request.primary.peakResidentMemoryBytes, request.primary.estimatedKvCacheBytes];
  if (numericBudgetValues.some((value) => !validNonnegative(value)) || modelNumericValues.some((value) => !validNonnegative(value))) {
    reasonCodes.push("INVALID_RESOURCE_METADATA");
  }
  if (request.riskLevel === "prohibited") reasonCodes.push("PROHIBITED_TASK");
  if (request.retryCount > request.budget.maximumRetries) reasonCodes.push("RETRY_BUDGET_EXHAUSTED");
  if (request.toolCallCount > request.budget.maximumToolCalls) reasonCodes.push("TOOL_CALL_BUDGET_EXHAUSTED");
  if (request.dataClassification === "phi") {
    if (!request.policy.livePhiProcessingAuthorized) reasonCodes.push("LIVE_PHI_AUTHORITY_MISSING");
    if (!request.policy.consentConfirmed) reasonCodes.push("CONSENT_REQUIRED");
    if (!request.policy.baaApproved) reasonCodes.push("BAA_SCOPE_REQUIRED");
    if (!request.policy.residencyApproved) reasonCodes.push("RESIDENCY_APPROVAL_REQUIRED");
    if (request.policy.remoteProcessingRequested) reasonCodes.push("REMOTE_PHI_ROUTE_DISABLED_CURRENT_POLICY");
  }
  if (request.device.thermalClass === "hot" || request.failureSignal === "thermal") reasonCodes.push("THERMAL_LIMIT");
  if (request.failureSignal === "oom" || request.failureSignal === "memory-pressure") reasonCodes.push("MEMORY_PRESSURE");
  if (request.failureSignal === "accelerator-unavailable") reasonCodes.push("ACCELERATOR_UNAVAILABLE");
  if (request.failureSignal === "timeout") reasonCodes.push("TIMEOUT_SIGNAL");

  const hardPolicyBlocked = reasonCodes.some((code) => [
    "INVALID_RESOURCE_METADATA",
    "PROHIBITED_TASK",
    "LIVE_PHI_AUTHORITY_MISSING",
    "CONSENT_REQUIRED",
    "BAA_SCOPE_REQUIRED",
    "RESIDENCY_APPROVAL_REQUIRED",
    "REMOTE_PHI_ROUTE_DISABLED_CURRENT_POLICY"
  ].includes(code));
  const primaryFit = modelFits(request, request.primary);
  const resourceFailure = request.failureSignal && request.failureSignal !== "none";
  const candidateModels = [request.primary, ...request.fallbacks]
    .filter((model, index) => index > 0 || !resourceFailure)
    .map((model) => ({ model, fit: modelFits(request, model) }))
    .filter(({ fit }) => fit.fits)
    .sort((left, right) => {
      if (left.model.expectedQuality !== right.model.expectedQuality) return right.model.expectedQuality - left.model.expectedQuality;
      if (left.model.estimatedCostUsd !== right.model.estimatedCostUsd) return left.model.estimatedCostUsd - right.model.estimatedCostUsd;
      return left.model.modelId.localeCompare(right.model.modelId);
    });
  const selected = hardPolicyBlocked ? null : candidateModels[0]?.model ?? null;

  if (!primaryFit.contextFits) reasonCodes.push("CONTEXT_DISTILLATION_REQUIRED");
  if (!primaryFit.kvFits) reasonCodes.push("KV_CACHE_BUDGET_EXCEEDED");
  if (!primaryFit.memoryFits) reasonCodes.push("PRIMARY_MEMORY_BUDGET_EXCEEDED");
  if (!primaryFit.acceleratorFits) reasonCodes.push("PRIMARY_ACCELERATOR_UNAVAILABLE");
  if (!primaryFit.precisionFits) reasonCodes.push("PRIMARY_PRECISION_UNSUPPORTED");
  if (!primaryFit.costFits) reasonCodes.push("PRIMARY_COST_BUDGET_EXCEEDED");
  if (!primaryFit.latencyFits) reasonCodes.push("PRIMARY_LATENCY_BUDGET_EXCEEDED");
  if (!selected) reasonCodes.push("NO_RESOURCE_SAFE_ROUTE");

  const selectedIsPrimary = selected?.modelId === request.primary.modelId;
  const state: RuntimeState = !selected
    ? "SAFE_REFUSAL"
    : selectedIsPrimary && reasonCodes.length === 0
      ? "NORMAL"
      : selected.deployment === "remote"
        ? "DEGRADED"
        : "CONSTRAINED";
  const safeAction: ResourceAdmissionDecision["safeAction"] = state === "SAFE_REFUSAL"
    ? "refuse"
    : state === "NORMAL"
      ? "admit-synthetic-preflight"
      : selected?.deployment === "remote"
        ? "human-handoff"
        : "use-bounded-fallback";
  const projected = selected ?? request.primary;
  const withoutHash = {
    requestId: request.requestId,
    tenantId: request.tenantId,
    taskId: request.taskId,
    state,
    selectedModelId: selected?.modelId ?? null,
    admissionAllowed: Boolean(selected) && !hardPolicyBlocked,
    modelExecutionAuthorized: false as const,
    localRouteSelected: selected?.deployment === "local",
    remoteEscalationEligibleForSeparatePreflight: Boolean(selected?.deployment === "remote") && request.dataClassification !== "phi",
    contextDistillationRequired: reasonCodes.includes("CONTEXT_DISTILLATION_REQUIRED"),
    kvCacheBudgetBytes: request.budget.maximumKvCacheBytes,
    reasonCodes: reasonCodes.length ? [...new Set(reasonCodes)] : ["RESOURCE_AND_POLICY_PREFLIGHT_PASSED"],
    safeAction,
    metrics: {
      projectedPeakResidentMemoryBytes: projected.peakResidentMemoryBytes,
      projectedDataCopiesPerTask: request.device.sharedMemory && projected.zeroCopySupported ? 0 : 1,
      projectedKvCacheBytes: projected.estimatedKvCacheBytes,
      projectedCostUsd: projected.estimatedCostUsd,
      projectedLatencyMs: projected.estimatedLatencyMs,
      qualityDeltaFromPrimary: Number((projected.expectedQuality - request.primary.expectedQuality).toFixed(6)),
      energyEstimateWh: null
    },
    correlationId: request.correlationId
  };
  return { ...withoutHash, auditHash: createClinicalEvidenceHash({ request, decision: withoutHash }) };
}
