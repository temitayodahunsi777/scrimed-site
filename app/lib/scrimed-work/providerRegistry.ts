import { createAuditHash } from "./audit";
import { createClinicalEvidenceHash } from "../clinicalEvidenceControls";
import type { DataClassification, ModelRouteDecision, ProviderRoutingClass, RiskLevel } from "./types";

export const scrimedProviderConformanceVersion =
  "scrimed-provider-conformance-v1-2026-07-28";

export type ScrimedWorkProvider = {
  providerId: string;
  modelId: string;
  label: string;
  routingClass: ProviderRoutingClass;
  capabilities: ProviderRoutingClass[];
  contextLimit: number;
  dataResidency: "us" | "customer-region" | "local-only" | "configurable";
  phiEligible: boolean;
  toolCalling: boolean;
  multimodal: boolean;
  structuredOutput: boolean;
  estimatedInputCostUsdPer1k: number;
  estimatedOutputCostUsdPer1k: number;
  observedLatencyMs: number;
  availability: "available" | "unavailable_missing_secret" | "disabled_by_policy" | "future_adapter";
  healthStatus: "healthy" | "degraded" | "unavailable";
  circuitState: "closed" | "open" | "half-open";
  artifactSignatureStatus: "verified-synthetic" | "verification-required";
  policyTags: string[];
};

export type ConfiguredModelFitAlias = {
  alias: "fast-economical" | "balanced" | "flagship";
  providerId: "bedrock-compatible";
  configuredModelId: string | null;
  configured: boolean;
  clinicalAuthorityGranted: false;
  requiresShadowEvaluation: true;
  requiredEvidence: string[];
};

export type ProviderCapability =
  | "json-mode"
  | "function-calling"
  | "streaming"
  | "bounded-retries"
  | "timeouts"
  | "rate-limits"
  | "context-window"
  | "vision"
  | "structured-failure";

export type ModelProviderProfile = {
  profileId: string;
  providerId: string;
  controllingOperator: string;
  capabilities: ProviderCapability[];
  residency: string[];
  retentionStatus: "unverified" | "documented-requires-review";
  zeroDataRetentionStatus: "unverified" | "documented-requires-review";
  baaStatus: "unverified" | "documented-requires-review";
  jurisdictionStatus: "unverified" | "documented-requires-review";
  featureFlag: string;
  enabled: boolean;
  profileHash: string;
};

export type ModelArtifactManifest = {
  manifestId: string;
  providerId: string;
  modelId: string;
  modelVersion: string;
  modelOrWeightDigest: string;
  tokenizerDigest: string;
  quantization: string;
  runtimeDigest: string;
  serializationContractDigest: string;
  toolContractDigest: string;
  createdAt: string;
  signatureStatus: "verified-synthetic" | "verification-required";
  manifestHash: string;
};

export type ProviderConformanceRun = {
  runId: string;
  providerId: string;
  modelId: string;
  artifactManifestHash: string;
  evaluatedAt: string;
  checks: Record<
    ProviderCapability,
    {
      status: "pass" | "fail" | "not-applicable";
      evidenceReference: string;
    }
  >;
  transportEquivalencePassed: boolean;
  safetyTierPreservedOnFailure: boolean;
  status: "pass" | "fail";
  failedCapabilities: ProviderCapability[];
  liveClinicalAuthorityGranted: false;
  runHash: string;
};

export type TaskEvaluationProfile = {
  evaluationProfileId: string;
  taskType: string;
  risk: RiskLevel;
  lane: "general-frontend" | "clinical";
  minimumCorrectness: number;
  minimumSafety: number;
  minimumCitationQuality: number;
  minimumHumanAcceptance: number;
  maximumLatencyMs: number;
  maximumCostPerValidatedTaskUsd: number;
  requiredConformanceCapabilities: ProviderCapability[];
  profileHash: string;
};

export type ModelPromotionDecision = {
  decisionId: string;
  modelId: string;
  artifactManifestHash: string;
  evaluationProfileId: string;
  decision: "shadow-only" | "canary-review-ready" | "blocked";
  reasonCodes: string[];
  regressionPassed: boolean;
  providerConformancePassed: boolean;
  canaryConfigured: boolean;
  rollbackReady: boolean;
  publicLeaderboardSufficient: false;
  automaticPromotionAllowed: false;
  clinicalAuthorityGranted: false;
  decisionHash: string;
};

export type RollbackReceipt = {
  rollbackReceiptId: string;
  modelId: string;
  fromArtifactManifestHash: string;
  toArtifactManifestHash: string;
  reasonCode: string;
  operatorIdentityHash: string;
  occurredAt: string;
  queueContinuityVerified: boolean;
  evidenceContinuityVerified: boolean;
  productionMutationExecuted: false;
  receiptHash: string;
};

export type RoutingDecision = ModelRouteDecision;

export const scrimedWorkProviderRegistry: ScrimedWorkProvider[] = [
  {
    providerId: "synthetic-fallback",
    modelId: "scrimed-synthetic-no-call",
    label: "SCRIMED synthetic no-call provider",
    routingClass: "balanced",
    capabilities: ["fast", "balanced", "reasoning", "coding", "embedding", "reranking"],
    contextLimit: 32_000,
    dataResidency: "us",
    phiEligible: false,
    toolCalling: false,
    multimodal: false,
    structuredOutput: true,
    estimatedInputCostUsdPer1k: 0,
    estimatedOutputCostUsdPer1k: 0,
    observedLatencyMs: 50,
    availability: "available",
    healthStatus: "healthy",
    circuitState: "closed",
    artifactSignatureStatus: "verified-synthetic",
    policyTags: ["no-external-call", "no-secret-required", "synthetic-only"]
  },
  {
    providerId: "independent-local-rules",
    modelId: "scrimed-independent-policy-handoff",
    label: "SCRIMED independent deterministic handoff route",
    routingClass: "balanced",
    capabilities: ["fast", "balanced", "reasoning"],
    contextLimit: 16_000,
    dataResidency: "local-only",
    phiEligible: false,
    toolCalling: false,
    multimodal: false,
    structuredOutput: true,
    estimatedInputCostUsdPer1k: 0,
    estimatedOutputCostUsdPer1k: 0,
    observedLatencyMs: 30,
    availability: "available",
    healthStatus: "healthy",
    circuitState: "closed",
    artifactSignatureStatus: "verified-synthetic",
    policyTags: [
      "materially-independent-synthetic-fallback",
      "no-external-call",
      "no-secret-required",
      "human-handoff-only"
    ]
  },
  {
    providerId: "openai-compatible",
    modelId: "configured-openai-compatible-model",
    label: "OpenAI-compatible adapter",
    routingClass: "reasoning",
    capabilities: ["fast", "balanced", "reasoning", "coding", "vision", "voice", "embedding"],
    contextLimit: 128_000,
    dataResidency: "configurable",
    phiEligible: false,
    toolCalling: true,
    multimodal: true,
    structuredOutput: true,
    estimatedInputCostUsdPer1k: 0.005,
    estimatedOutputCostUsdPer1k: 0.02,
    observedLatencyMs: 2_500,
    availability: process.env.SCRIMED_OPENAI_COMPATIBLE_API_KEY ? "disabled_by_policy" : "unavailable_missing_secret",
    healthStatus: "unavailable",
    circuitState: "open",
    artifactSignatureStatus: "verification-required",
    policyTags: ["requires-contract-review", "requires-privacy-review", "provider-calls-disabled-by-default"]
  },
  {
    providerId: "anthropic-compatible",
    modelId: "configured-anthropic-compatible-model",
    label: "Anthropic-compatible adapter",
    routingClass: "reasoning",
    capabilities: ["balanced", "reasoning", "coding"],
    contextLimit: 200_000,
    dataResidency: "configurable",
    phiEligible: false,
    toolCalling: true,
    multimodal: false,
    structuredOutput: true,
    estimatedInputCostUsdPer1k: 0.006,
    estimatedOutputCostUsdPer1k: 0.025,
    observedLatencyMs: 3_000,
    availability: process.env.SCRIMED_ANTHROPIC_COMPATIBLE_API_KEY ? "disabled_by_policy" : "unavailable_missing_secret",
    healthStatus: "unavailable",
    circuitState: "open",
    artifactSignatureStatus: "verification-required",
    policyTags: ["requires-contract-review", "requires-privacy-review", "provider-calls-disabled-by-default"]
  },
  {
    providerId: "local-private",
    modelId: "customer-approved-local-private-model",
    label: "Local/private model adapter",
    routingClass: "local-private",
    capabilities: ["fast", "balanced", "reasoning", "vision", "voice", "embedding", "reranking", "local-private"],
    contextLimit: 64_000,
    dataResidency: "local-only",
    phiEligible: true,
    toolCalling: true,
    multimodal: true,
    structuredOutput: true,
    estimatedInputCostUsdPer1k: 0.001,
    estimatedOutputCostUsdPer1k: 0.002,
    observedLatencyMs: 1_800,
    availability: "future_adapter",
    healthStatus: "unavailable",
    circuitState: "open",
    artifactSignatureStatus: "verification-required",
    policyTags: ["private-inference-roadmap", "customer-vpc-or-edge", "requires-local-deployment"]
  }
];

export const scrimedDisabledModelEvaluationProfiles = [
  {
    profileId: "kimi-class-open-evaluation-profile",
    modelFamily: "Kimi-class",
    status: "disabled-evaluation-only",
    requiredLane: "general-frontend-and-separate-clinical-evaluation",
    publicLeaderboardPromotionAllowed: false,
    clinicalAuthorityGranted: false
  },
  {
    profileId: "nemotron-class-open-evaluation-profile",
    modelFamily: "Nemotron-class",
    status: "disabled-evaluation-only",
    requiredLane: "general-frontend-and-separate-clinical-evaluation",
    publicLeaderboardPromotionAllowed: false,
    clinicalAuthorityGranted: false
  }
] as const;

const providerHashPattern = /^[0-9a-f]{64}$/i;

function providerUnitInterval(value: number) {
  return Number.isFinite(value) && value >= 0 && value <= 1;
}

function providerCanonical<T extends string>(values: T[]) {
  return [...new Set(values)].sort();
}

export function createModelProviderProfile(
  input: Omit<ModelProviderProfile, "enabled" | "profileHash">,
  env: NodeJS.ProcessEnv = process.env
): ModelProviderProfile {
  const base = {
    ...input,
    capabilities: providerCanonical(input.capabilities),
    residency: providerCanonical(input.residency),
    enabled: env[input.featureFlag] === "true"
  };
  return { ...base, profileHash: createAuditHash({ type: "model-provider-profile", base }) };
}

export function createModelArtifactManifest(
  input: Omit<ModelArtifactManifest, "manifestHash">
): ModelArtifactManifest {
  for (const [label, value] of [
    ["model or weight", input.modelOrWeightDigest],
    ["tokenizer", input.tokenizerDigest],
    ["runtime", input.runtimeDigest],
    ["serialization contract", input.serializationContractDigest],
    ["tool contract", input.toolContractDigest]
  ] as const) {
    if (!providerHashPattern.test(value)) throw new Error(`${label} fingerprint must be SHA-256`);
  }
  if (!Number.isFinite(Date.parse(input.createdAt))) {
    throw new Error("Model artifact manifest timestamp is invalid");
  }
  const base = { ...input };
  return { ...base, manifestHash: createClinicalEvidenceHash({ type: "model-artifact-manifest", base }) };
}

export function evaluateProviderConformanceRun(
  input: Omit<
    ProviderConformanceRun,
    "status" | "failedCapabilities" | "liveClinicalAuthorityGranted" | "runHash"
  >
): ProviderConformanceRun {
  if (!providerHashPattern.test(input.artifactManifestHash) || !Number.isFinite(Date.parse(input.evaluatedAt))) {
    throw new Error("Provider conformance run requires exact artifact provenance and time");
  }
  const failedCapabilities = (Object.entries(input.checks) as Array<
    [ProviderCapability, ProviderConformanceRun["checks"][ProviderCapability]]
  >)
    .filter(([, check]) => check.status === "fail" || !check.evidenceReference.trim())
    .map(([capability]) => capability)
    .sort();
  if (!input.transportEquivalencePassed) failedCapabilities.push("streaming");
  if (!input.safetyTierPreservedOnFailure) failedCapabilities.push("structured-failure");
  const uniqueFailures = providerCanonical(failedCapabilities);
  const base = {
    ...input,
    status: uniqueFailures.length ? ("fail" as const) : ("pass" as const),
    failedCapabilities: uniqueFailures,
    liveClinicalAuthorityGranted: false as const
  };
  return { ...base, runHash: createAuditHash({ type: "provider-conformance-run", base }) };
}

export function createTaskEvaluationProfile(
  input: Omit<TaskEvaluationProfile, "profileHash">
): TaskEvaluationProfile {
  for (const [label, value] of [
    ["minimum correctness", input.minimumCorrectness],
    ["minimum safety", input.minimumSafety],
    ["minimum citation quality", input.minimumCitationQuality],
    ["minimum human acceptance", input.minimumHumanAcceptance]
  ] as const) {
    if (!providerUnitInterval(value)) throw new Error(`${label} must be in [0, 1]`);
  }
  if (
    !Number.isFinite(input.maximumLatencyMs) ||
    input.maximumLatencyMs <= 0 ||
    !Number.isFinite(input.maximumCostPerValidatedTaskUsd) ||
    input.maximumCostPerValidatedTaskUsd < 0
  ) {
    throw new Error("Task evaluation latency and cost limits are invalid");
  }
  const base = {
    ...input,
    requiredConformanceCapabilities: providerCanonical(input.requiredConformanceCapabilities)
  };
  return { ...base, profileHash: createAuditHash({ type: "task-evaluation-profile", base }) };
}

export function evaluateModelPromotion(input: {
  decisionId: string;
  artifact: ModelArtifactManifest;
  conformance: ProviderConformanceRun;
  evaluationProfile: TaskEvaluationProfile;
  measured: {
    correctness: number;
    safety: number;
    citationQuality: number;
    humanAcceptance: number;
    latencyMs: number;
    costPerValidatedTaskUsd: number;
  };
  regressionPassed: boolean;
  canaryConfigured: boolean;
  rollbackReady: boolean;
  promotionBasis: "measured-task-fitness" | "public-leaderboard";
}): ModelPromotionDecision {
  const reasons: string[] = [];
  const measuredScores = [
    input.measured.correctness,
    input.measured.safety,
    input.measured.citationQuality,
    input.measured.humanAcceptance
  ];
  if (
    measuredScores.some((value) => !providerUnitInterval(value)) ||
    !Number.isFinite(input.measured.latencyMs) ||
    input.measured.latencyMs < 0 ||
    !Number.isFinite(input.measured.costPerValidatedTaskUsd) ||
    input.measured.costPerValidatedTaskUsd < 0
  ) {
    reasons.push("INVALID_MEASURED_EVALUATION");
  }
  if (input.promotionBasis === "public-leaderboard") reasons.push("PUBLIC_LEADERBOARD_CANNOT_PROMOTE");
  if (
    input.conformance.status !== "pass" ||
    input.conformance.modelId !== input.artifact.modelId ||
    input.conformance.artifactManifestHash !== input.artifact.manifestHash
  ) reasons.push("PROVIDER_CONFORMANCE_REQUIRED");
  if (!input.regressionPassed) reasons.push("REGRESSION_EVALUATION_FAILED");
  if (input.measured.correctness < input.evaluationProfile.minimumCorrectness) reasons.push("CORRECTNESS_FLOOR_FAILED");
  if (input.measured.safety < input.evaluationProfile.minimumSafety) reasons.push("SAFETY_FLOOR_FAILED");
  if (input.measured.citationQuality < input.evaluationProfile.minimumCitationQuality) reasons.push("CITATION_FLOOR_FAILED");
  if (input.measured.humanAcceptance < input.evaluationProfile.minimumHumanAcceptance) reasons.push("HUMAN_ACCEPTANCE_FLOOR_FAILED");
  if (input.measured.latencyMs > input.evaluationProfile.maximumLatencyMs) reasons.push("LATENCY_BUDGET_FAILED");
  if (input.measured.costPerValidatedTaskUsd > input.evaluationProfile.maximumCostPerValidatedTaskUsd) {
    reasons.push("VALIDATED_TASK_COST_BUDGET_FAILED");
  }
  const requiredChecksPass = input.evaluationProfile.requiredConformanceCapabilities.every(
    (capability) => input.conformance.checks[capability].status === "pass"
  );
  if (!requiredChecksPass) reasons.push("TASK_REQUIRED_CONFORMANCE_FAILED");
  const metricsPass = reasons.length === 0;
  const canaryReady = metricsPass && input.canaryConfigured && input.rollbackReady;
  if (metricsPass && !input.canaryConfigured) reasons.push("CANARY_CONFIGURATION_REQUIRED");
  if (metricsPass && !input.rollbackReady) reasons.push("ROLLBACK_READINESS_REQUIRED");
  const decision: ModelPromotionDecision["decision"] = reasons.length
    ? metricsPass
      ? "shadow-only"
      : "blocked"
    : canaryReady
      ? "canary-review-ready"
      : "shadow-only";
  const base = {
    decisionId: input.decisionId,
    modelId: input.artifact.modelId,
    artifactManifestHash: input.artifact.manifestHash,
    evaluationProfileId: input.evaluationProfile.evaluationProfileId,
    decision,
    reasonCodes: reasons.length ? providerCanonical(reasons) : ["MEASURED_TASK_FITNESS_PASSED"],
    regressionPassed: input.regressionPassed,
    providerConformancePassed: input.conformance.status === "pass",
    canaryConfigured: input.canaryConfigured,
    rollbackReady: input.rollbackReady,
    publicLeaderboardSufficient: false as const,
    automaticPromotionAllowed: false as const,
    clinicalAuthorityGranted: false as const
  };
  return { ...base, decisionHash: createAuditHash({ type: "model-promotion-decision", base }) };
}

export function createRollbackReceipt(
  input: Omit<RollbackReceipt, "productionMutationExecuted" | "receiptHash">
): RollbackReceipt {
  for (const value of [
    input.fromArtifactManifestHash,
    input.toArtifactManifestHash,
    input.operatorIdentityHash
  ]) {
    if (!providerHashPattern.test(value)) throw new Error("Rollback receipt requires hashed provenance");
  }
  const base = { ...input, productionMutationExecuted: false as const };
  return { ...base, receiptHash: createAuditHash({ type: "model-rollback-receipt", base }) };
}

export function getConfiguredModelFitAliases(env: NodeJS.ProcessEnv = process.env): ConfiguredModelFitAlias[] {
  return [
    { alias: "fast-economical", configuredModelId: env.SCRIMED_BEDROCK_LUNA_MODEL_ID ?? null },
    { alias: "balanced", configuredModelId: env.SCRIMED_BEDROCK_TERRA_MODEL_ID ?? null },
    { alias: "flagship", configuredModelId: env.SCRIMED_BEDROCK_SOL_MODEL_ID ?? null }
  ].map((entry) => ({
    alias: entry.alias as ConfiguredModelFitAlias["alias"],
    providerId: "bedrock-compatible" as const,
    configuredModelId: entry.configuredModelId,
    configured: Boolean(entry.configuredModelId),
    clinicalAuthorityGranted: false as const,
    requiresShadowEvaluation: true as const,
    requiredEvidence: [
      "provider and service-scope approval",
      "BAA/DPA and retention review before any PHI eligibility",
      "region and data-residency review",
      "workflow-specific shadow benchmark",
      "worst-cell and abstention gate",
      "cost per accepted outcome",
      "human review and rollback readiness"
    ]
  }));
}

export function selectProviderCandidates(input: {
  requiredCapability: ProviderRoutingClass;
  dataClassification: DataClassification;
  residencyRequirement?: "us" | "customer-region" | "local-only";
  providerHealth?: Record<string, ScrimedWorkProvider["healthStatus"]>;
  blockedProviderIds?: string[];
}) {
  return scrimedWorkProviderRegistry.filter((provider) => {
    const capabilityOk = provider.capabilities.includes(input.requiredCapability);
    const residencyOk =
      !input.residencyRequirement ||
      provider.dataResidency === input.residencyRequirement ||
      provider.dataResidency === "configurable";
    const phiOk = input.dataClassification !== "phi-blocked" || provider.phiEligible;

    const effectiveHealth = input.providerHealth?.[provider.providerId] ?? provider.healthStatus;
    const circuitOk = provider.circuitState === "closed" && effectiveHealth !== "unavailable";
    const providerAllowed = !input.blockedProviderIds?.includes(provider.providerId);

    return capabilityOk && residencyOk && phiOk && circuitOk && providerAllowed;
  });
}
