import { generateScrimedAuditHash } from "./scrimedIntelligencePlatform";

export type ScrimedComputeDeploymentMode =
  | "SCRIMED_CLOUD"
  | "CUSTOMER_VPC"
  | "AIR_GAPPED"
  | "EDGE_DEVICE";

export type ScrimedComputeModelTier =
  | "FRONTIER_MODEL"
  | "COMPACT_REASONING_MODEL"
  | "MEDICAL_SPECIALIST_MODEL"
  | "VISION_MODEL"
  | "SPEECH_MODEL"
  | "EMBEDDING_MODEL";

export type ScrimedComputeRiskLevel = "low" | "moderate" | "high" | "critical";

export type ScrimedComputePhiSensitivity = "none" | "metadata_only" | "phi_possible" | "phi_heavy";

export type ScrimedComputeLatencyRequirement = "subsecond" | "interactive" | "standard" | "batch";

export type ScrimedComputeCostSensitivity = "strict" | "balanced" | "premium_allowed";

export type ScrimedComputeReasoningDepth = "shallow" | "standard" | "deep" | "specialist";

export type ScrimedComputeModality = "text" | "voice" | "image" | "DICOM" | "FHIR" | "OCR";

export type ScrimedComputeTaskType =
  | "clinical_reasoning"
  | "RCM"
  | "intake"
  | "coding"
  | "documentation"
  | "referral_routing"
  | "research"
  | "operations";

export type ScrimedComputeProvider =
  | "gpt_class_frontier"
  | "claude_class_frontier"
  | "gemini_class_frontier"
  | "pulsar_16b_compact_open_reasoning"
  | "llama_mistral_qwen_glm_open"
  | "biomed_specialist"
  | "radiology_specialist"
  | "pathology_specialist"
  | "scrimed_private_vllm"
  | "scrimed_private_sglang"
  | "nvidia_nim"
  | "triton_inference_server"
  | "tensorrt_llm"
  | "flashinfer_runtime"
  | "synthetic_no_call";

export type ScrimedComputeCostClass = "LOW" | "MODERATE" | "HIGH" | "SPECIALIST";

export type ScrimedComputeLatencyClass = "REAL_TIME" | "INTERACTIVE" | "STANDARD" | "BATCH";

export type ScrimedComputePhiPolicy =
  | "no-phi-synthetic-routing-only"
  | "metadata-only-no-public-phi"
  | "private-inference-required"
  | "air-gapped-local-only"
  | "edge-local-only"
  | "public-model-blocked-private-inference-required";

export type ScrimedComputeRoutingRequest = {
  requestId: string;
  taskType: ScrimedComputeTaskType;
  modality: ScrimedComputeModality;
  riskLevel: ScrimedComputeRiskLevel;
  phiSensitivity: ScrimedComputePhiSensitivity;
  deploymentMode: ScrimedComputeDeploymentMode;
  latencyRequirement: ScrimedComputeLatencyRequirement;
  costSensitivity: ScrimedComputeCostSensitivity;
  reasoningDepth: ScrimedComputeReasoningDepth;
  requiresClinicalRecommendation?: boolean;
};

export type ScrimedComputeModelCandidate = {
  id: string;
  provider: ScrimedComputeProvider;
  modelTier: ScrimedComputeModelTier;
  supportedTaskTypes: ScrimedComputeTaskType[];
  supportedModalities: ScrimedComputeModality[];
  supportedDeploymentModes: ScrimedComputeDeploymentMode[];
  privacyPosture: "public-contract-required" | "private-vpc" | "air-gapped" | "edge-local" | "synthetic-only";
  readiness: "placeholder" | "lab-ready-metadata" | "requires-validation";
  nvidiaOpenModelReadiness: string[];
  estimatedCostClass: ScrimedComputeCostClass;
  estimatedLatencyClass: ScrimedComputeLatencyClass;
  safetyNotes: string[];
};

export type ScrimedComputeAuditEvent = {
  eventType: "scrimed_compute_model_selection";
  auditHash: string;
  requestId: string;
  selectedModel: string;
  provider: ScrimedComputeProvider;
  modelTier: ScrimedComputeModelTier;
  deploymentMode: ScrimedComputeDeploymentMode;
  reason: string;
  riskLevel: ScrimedComputeRiskLevel;
  phiPolicy: ScrimedComputePhiPolicy;
  requiresHumanReview: boolean;
  auditTags: string[];
  emittedAt: typeof scrimedComputeFabricUpdatedAt;
  syntheticOnly: true;
};

export type ScrimedComputeRoutingDecision = {
  selectedModel: string;
  modelTier: ScrimedComputeModelTier;
  provider: ScrimedComputeProvider;
  deploymentMode: ScrimedComputeDeploymentMode;
  reason: string;
  riskLevel: ScrimedComputeRiskLevel;
  phiPolicy: ScrimedComputePhiPolicy;
  requiresHumanReview: boolean;
  fallbackModels: string[];
  estimatedCostClass: ScrimedComputeCostClass;
  estimatedLatencyClass: ScrimedComputeLatencyClass;
  auditTags: string[];
  confidenceScore: number;
  correctnessEvidenceRequired: string[];
  uncertainty: {
    confidenceIsNotCorrectness: true;
    incompleteEvidence: boolean;
    uncertaintyReasons: string[];
  };
  blockedActions: string[];
  auditEvent: ScrimedComputeAuditEvent;
};

export type ScrimedComputeBenchmarkMetricName =
  | "latency"
  | "cost_class"
  | "quality_score"
  | "clinical_utility_score"
  | "verifiability_score"
  | "completeness_score"
  | "source_quality_score";

export type ScrimedComputeBenchmarkRecord = {
  benchmarkId: string;
  modelId: string;
  taskType: ScrimedComputeTaskType;
  modality: ScrimedComputeModality;
  deploymentMode: ScrimedComputeDeploymentMode;
  metrics: Record<ScrimedComputeBenchmarkMetricName, number | string>;
  safetyBoundary: string;
  humanReviewRequired: boolean;
  syntheticOnly: true;
  auditHash: string;
};

export type ScrimedComputeBenchmarkComparison = {
  comparisonId: string;
  preferredModelId: string;
  comparedModelIds: string[];
  reason: string;
  requiresHumanReview: boolean;
  auditHash: string;
};

export const scrimedComputeFabricVersion = "scrimed-compute-fabric-v2026-07-05";
export const scrimedComputeFabricUpdatedAt = "2026-07-05T00:00:00.000Z";
export const scrimedComputeFabricStatus = "synthetic-routing-only-no-live-model-calls";
export const scrimedComputeAuditHashPattern = /^scrimed-intel-[0-9a-f]{8}$/;

export function isScrimedComputeAuditHash(value: string) {
  return scrimedComputeAuditHashPattern.test(value);
}

export const scrimedComputeEnvironmentDefaults = {
  SCRIMED_AI_PROVIDER_CALLS_ENABLED: "false",
  SCRIMED_PRIVATE_INFERENCE_MODE: "metadata-only",
  SCRIMED_PUBLIC_MODEL_PHI_ALLOWED: "false",
  SCRIMED_EDGE_AI_ENABLED: "metadata-only",
  SCRIMED_NVIDIA_RUNTIME_ENABLED: "metadata-only"
} as const;

export const scrimedComputeNoGoBoundaries = [
  "no live PHI",
  "no autonomous diagnosis",
  "no autonomous treatment recommendations",
  "no prescribing",
  "no final imaging interpretation",
  "no payer submission",
  "no EHR writeback",
  "no production customer activation",
  "no regulatory certification claims",
  "no public-model PHI transfer unless explicitly approved through compliance and contract controls"
] as const;

export const scrimedComputeModelCandidates: ScrimedComputeModelCandidate[] = [
  {
    id: "gpt-class-frontier-synthetic-slot",
    provider: "gpt_class_frontier",
    modelTier: "FRONTIER_MODEL",
    supportedTaskTypes: ["clinical_reasoning", "research", "coding", "documentation"],
    supportedModalities: ["text", "FHIR"],
    supportedDeploymentModes: ["SCRIMED_CLOUD", "CUSTOMER_VPC"],
    privacyPosture: "public-contract-required",
    readiness: "placeholder",
    nvidiaOpenModelReadiness: ["not-local", "contract-and-privacy-review-required"],
    estimatedCostClass: "HIGH",
    estimatedLatencyClass: "STANDARD",
    safetyNotes: ["frontier synthesis slot", "no PHI by default", "human review required for clinical outputs"]
  },
  {
    id: "claude-class-frontier-synthetic-slot",
    provider: "claude_class_frontier",
    modelTier: "FRONTIER_MODEL",
    supportedTaskTypes: ["clinical_reasoning", "research", "operations"],
    supportedModalities: ["text", "FHIR"],
    supportedDeploymentModes: ["SCRIMED_CLOUD", "CUSTOMER_VPC"],
    privacyPosture: "public-contract-required",
    readiness: "placeholder",
    nvidiaOpenModelReadiness: ["not-local", "contract-and-privacy-review-required"],
    estimatedCostClass: "HIGH",
    estimatedLatencyClass: "STANDARD",
    safetyNotes: ["frontier reasoning slot", "public PHI blocked by default"]
  },
  {
    id: "gemini-class-frontier-synthetic-slot",
    provider: "gemini_class_frontier",
    modelTier: "FRONTIER_MODEL",
    supportedTaskTypes: ["clinical_reasoning", "research", "operations"],
    supportedModalities: ["text", "image", "FHIR"],
    supportedDeploymentModes: ["SCRIMED_CLOUD", "CUSTOMER_VPC"],
    privacyPosture: "public-contract-required",
    readiness: "placeholder",
    nvidiaOpenModelReadiness: ["not-local", "contract-and-privacy-review-required"],
    estimatedCostClass: "HIGH",
    estimatedLatencyClass: "STANDARD",
    safetyNotes: ["multimodal frontier slot", "image outputs cannot be final medical interpretation"]
  },
  {
    id: "pulsar-16b-compact-reasoning-synthetic-slot",
    provider: "pulsar_16b_compact_open_reasoning",
    modelTier: "COMPACT_REASONING_MODEL",
    supportedTaskTypes: ["RCM", "intake", "documentation", "referral_routing", "operations"],
    supportedModalities: ["text", "FHIR"],
    supportedDeploymentModes: ["SCRIMED_CLOUD", "CUSTOMER_VPC", "AIR_GAPPED", "EDGE_DEVICE"],
    privacyPosture: "private-vpc",
    readiness: "requires-validation",
    nvidiaOpenModelReadiness: ["vLLM", "SGLang", "TensorRT-LLM", "NVIDIA NIM"],
    estimatedCostClass: "LOW",
    estimatedLatencyClass: "INTERACTIVE",
    safetyNotes: ["administrative workflow slot", "not a clinical authority"]
  },
  {
    id: "llama-mistral-qwen-glm-open-routing-slot",
    provider: "llama_mistral_qwen_glm_open",
    modelTier: "COMPACT_REASONING_MODEL",
    supportedTaskTypes: ["RCM", "intake", "operations", "referral_routing", "research"],
    supportedModalities: ["text", "FHIR"],
    supportedDeploymentModes: ["CUSTOMER_VPC", "AIR_GAPPED", "EDGE_DEVICE"],
    privacyPosture: "air-gapped",
    readiness: "requires-validation",
    nvidiaOpenModelReadiness: ["vLLM", "SGLang", "TensorRT-LLM", "Triton Inference Server", "FlashInfer"],
    estimatedCostClass: "LOW",
    estimatedLatencyClass: "INTERACTIVE",
    safetyNotes: ["open-weight local option", "license and benchmark review required"]
  },
  {
    id: "biomed-specialist-synthetic-slot",
    provider: "biomed_specialist",
    modelTier: "MEDICAL_SPECIALIST_MODEL",
    supportedTaskTypes: ["clinical_reasoning", "research", "coding", "documentation"],
    supportedModalities: ["text", "FHIR"],
    supportedDeploymentModes: ["CUSTOMER_VPC", "AIR_GAPPED"],
    privacyPosture: "air-gapped",
    readiness: "requires-validation",
    nvidiaOpenModelReadiness: ["vLLM", "NVIDIA NIM", "TensorRT-LLM"],
    estimatedCostClass: "SPECIALIST",
    estimatedLatencyClass: "STANDARD",
    safetyNotes: ["validated medical specialist slot", "clinical recommendations require human review"]
  },
  {
    id: "radiology-specialist-dicom-synthetic-slot",
    provider: "radiology_specialist",
    modelTier: "VISION_MODEL",
    supportedTaskTypes: ["clinical_reasoning", "research", "operations"],
    supportedModalities: ["DICOM", "image", "OCR"],
    supportedDeploymentModes: ["CUSTOMER_VPC", "AIR_GAPPED", "EDGE_DEVICE"],
    privacyPosture: "edge-local",
    readiness: "requires-validation",
    nvidiaOpenModelReadiness: ["Triton Inference Server", "TensorRT-LLM", "NVIDIA NIM", "FP8 / NVFP4 optimized inference"],
    estimatedCostClass: "SPECIALIST",
    estimatedLatencyClass: "INTERACTIVE",
    safetyNotes: ["imaging assist slot only", "not final medical interpretation"]
  },
  {
    id: "pathology-specialist-vision-synthetic-slot",
    provider: "pathology_specialist",
    modelTier: "VISION_MODEL",
    supportedTaskTypes: ["clinical_reasoning", "research"],
    supportedModalities: ["image", "OCR"],
    supportedDeploymentModes: ["CUSTOMER_VPC", "AIR_GAPPED", "EDGE_DEVICE"],
    privacyPosture: "edge-local",
    readiness: "requires-validation",
    nvidiaOpenModelReadiness: ["Triton Inference Server", "TensorRT-LLM", "FlashInfer", "FP8 / NVFP4 optimized inference"],
    estimatedCostClass: "SPECIALIST",
    estimatedLatencyClass: "STANDARD",
    safetyNotes: ["pathology assist slot only", "human pathologist remains final authority"]
  },
  {
    id: "private-vllm-medical-runtime-slot",
    provider: "scrimed_private_vllm",
    modelTier: "MEDICAL_SPECIALIST_MODEL",
    supportedTaskTypes: ["clinical_reasoning", "research", "documentation", "coding"],
    supportedModalities: ["text", "FHIR"],
    supportedDeploymentModes: ["CUSTOMER_VPC", "AIR_GAPPED"],
    privacyPosture: "air-gapped",
    readiness: "lab-ready-metadata",
    nvidiaOpenModelReadiness: ["vLLM", "GPU scheduling", "private inference mode"],
    estimatedCostClass: "MODERATE",
    estimatedLatencyClass: "STANDARD",
    safetyNotes: ["private inference preferred for PHI-heavy workflows"]
  },
  {
    id: "private-sglang-compact-runtime-slot",
    provider: "scrimed_private_sglang",
    modelTier: "COMPACT_REASONING_MODEL",
    supportedTaskTypes: ["RCM", "intake", "operations", "referral_routing"],
    supportedModalities: ["text", "FHIR"],
    supportedDeploymentModes: ["CUSTOMER_VPC", "AIR_GAPPED", "EDGE_DEVICE"],
    privacyPosture: "air-gapped",
    readiness: "lab-ready-metadata",
    nvidiaOpenModelReadiness: ["SGLang", "request batching", "semantic caching"],
    estimatedCostClass: "LOW",
    estimatedLatencyClass: "INTERACTIVE",
    safetyNotes: ["administrative private runtime slot"]
  },
  {
    id: "nvidia-nim-edge-medical-runtime-slot",
    provider: "nvidia_nim",
    modelTier: "VISION_MODEL",
    supportedTaskTypes: ["clinical_reasoning", "documentation", "operations"],
    supportedModalities: ["DICOM", "image", "OCR", "text"],
    supportedDeploymentModes: ["CUSTOMER_VPC", "AIR_GAPPED", "EDGE_DEVICE"],
    privacyPosture: "edge-local",
    readiness: "placeholder",
    nvidiaOpenModelReadiness: ["NVIDIA NIM", "Triton Inference Server", "TensorRT-LLM"],
    estimatedCostClass: "SPECIALIST",
    estimatedLatencyClass: "REAL_TIME",
    safetyNotes: ["NVIDIA/Open-weight model readiness", "local imaging and OCR assist only"]
  },
  {
    id: "triton-tensorrt-llm-edge-runtime-slot",
    provider: "triton_inference_server",
    modelTier: "VISION_MODEL",
    supportedTaskTypes: ["operations", "documentation", "clinical_reasoning"],
    supportedModalities: ["DICOM", "image", "OCR"],
    supportedDeploymentModes: ["AIR_GAPPED", "EDGE_DEVICE"],
    privacyPosture: "edge-local",
    readiness: "placeholder",
    nvidiaOpenModelReadiness: ["Triton Inference Server", "TensorRT-LLM", "FP8 / NVFP4 optimized inference"],
    estimatedCostClass: "MODERATE",
    estimatedLatencyClass: "REAL_TIME",
    safetyNotes: ["edge AI deployment support", "no final diagnosis"]
  },
  {
    id: "flashinfer-fp8-nvfp4-throughput-slot",
    provider: "flashinfer_runtime",
    modelTier: "EMBEDDING_MODEL",
    supportedTaskTypes: ["operations", "research", "intake", "RCM"],
    supportedModalities: ["text", "FHIR", "OCR"],
    supportedDeploymentModes: ["CUSTOMER_VPC", "AIR_GAPPED", "EDGE_DEVICE"],
    privacyPosture: "edge-local",
    readiness: "placeholder",
    nvidiaOpenModelReadiness: ["FlashInfer", "FP8 / NVFP4 optimized inference", "batching"],
    estimatedCostClass: "LOW",
    estimatedLatencyClass: "REAL_TIME",
    safetyNotes: ["retrieval and indexing throughput slot"]
  },
  {
    id: "ambient-speech-synthetic-slot",
    provider: "synthetic_no_call",
    modelTier: "SPEECH_MODEL",
    supportedTaskTypes: ["documentation", "intake"],
    supportedModalities: ["voice"],
    supportedDeploymentModes: ["SCRIMED_CLOUD", "CUSTOMER_VPC", "AIR_GAPPED", "EDGE_DEVICE"],
    privacyPosture: "synthetic-only",
    readiness: "lab-ready-metadata",
    nvidiaOpenModelReadiness: ["local speech roadmap", "edge device roadmap"],
    estimatedCostClass: "MODERATE",
    estimatedLatencyClass: "REAL_TIME",
    safetyNotes: ["ambient scribe slot", "draft-only with clinician signoff"]
  },
  {
    id: "retrieval-embedding-synthetic-slot",
    provider: "synthetic_no_call",
    modelTier: "EMBEDDING_MODEL",
    supportedTaskTypes: ["research", "operations", "RCM", "referral_routing", "intake"],
    supportedModalities: ["text", "FHIR", "OCR"],
    supportedDeploymentModes: ["SCRIMED_CLOUD", "CUSTOMER_VPC", "AIR_GAPPED", "EDGE_DEVICE"],
    privacyPosture: "synthetic-only",
    readiness: "lab-ready-metadata",
    nvidiaOpenModelReadiness: ["vector caching", "pre-indexed intelligence", "local embeddings"],
    estimatedCostClass: "LOW",
    estimatedLatencyClass: "REAL_TIME",
    safetyNotes: ["retrieval-only slot", "no autonomous action"]
  }
];

function isClinicalTask(request: ScrimedComputeRoutingRequest) {
  return (
    request.taskType === "clinical_reasoning" ||
    request.requiresClinicalRecommendation === true ||
    request.modality === "DICOM" ||
    request.riskLevel === "high" ||
    request.riskLevel === "critical"
  );
}

function requiresPrivateInference(request: ScrimedComputeRoutingRequest) {
  return (
    request.deploymentMode === "AIR_GAPPED" ||
    request.deploymentMode === "EDGE_DEVICE" ||
    request.phiSensitivity === "phi_heavy" ||
    request.phiSensitivity === "phi_possible"
  );
}

function phiPolicyForRequest(request: ScrimedComputeRoutingRequest): ScrimedComputePhiPolicy {
  if (request.deploymentMode === "AIR_GAPPED") return "air-gapped-local-only";
  if (request.deploymentMode === "EDGE_DEVICE") return "edge-local-only";
  if (request.phiSensitivity === "phi_heavy") return "private-inference-required";
  if (request.phiSensitivity === "phi_possible") return "public-model-blocked-private-inference-required";
  if (request.phiSensitivity === "metadata_only") return "metadata-only-no-public-phi";
  return "no-phi-synthetic-routing-only";
}

function targetTierForRequest(request: ScrimedComputeRoutingRequest): ScrimedComputeModelTier {
  if (request.modality === "voice") return "SPEECH_MODEL";
  if (request.modality === "DICOM" || request.modality === "image" || request.modality === "OCR") return "VISION_MODEL";
  if (request.taskType === "research" && request.reasoningDepth === "shallow") return "EMBEDDING_MODEL";
  if (isClinicalTask(request)) {
    return requiresPrivateInference(request) ? "MEDICAL_SPECIALIST_MODEL" : "FRONTIER_MODEL";
  }
  if (request.taskType === "operations" && request.reasoningDepth === "shallow") return "COMPACT_REASONING_MODEL";
  if (request.taskType === "RCM" || request.taskType === "intake" || request.taskType === "referral_routing") {
    return "COMPACT_REASONING_MODEL";
  }
  if (request.taskType === "documentation") return "COMPACT_REASONING_MODEL";
  return "COMPACT_REASONING_MODEL";
}

function deploymentCompatible(candidate: ScrimedComputeModelCandidate, request: ScrimedComputeRoutingRequest) {
  if (!candidate.supportedDeploymentModes.includes(request.deploymentMode)) return false;
  if (request.deploymentMode === "AIR_GAPPED") {
    return candidate.privacyPosture === "air-gapped" || candidate.privacyPosture === "edge-local";
  }
  if (request.deploymentMode === "EDGE_DEVICE") {
    return candidate.privacyPosture === "edge-local" || candidate.privacyPosture === "synthetic-only";
  }
  if (request.phiSensitivity === "phi_heavy" || request.phiSensitivity === "phi_possible") {
    return candidate.privacyPosture !== "public-contract-required";
  }
  return true;
}

function scoreCandidate(candidate: ScrimedComputeModelCandidate, request: ScrimedComputeRoutingRequest) {
  const targetTier = targetTierForRequest(request);
  let score = 0;
  if (candidate.modelTier === targetTier) score += 50;
  if (candidate.supportedTaskTypes.includes(request.taskType)) score += 20;
  if (candidate.supportedModalities.includes(request.modality)) score += 20;
  if (deploymentCompatible(candidate, request)) score += 15;
  if (candidate.readiness === "lab-ready-metadata") score += 5;
  if (request.costSensitivity === "strict" && candidate.estimatedCostClass === "LOW") score += 10;
  if (request.latencyRequirement === "subsecond" && candidate.estimatedLatencyClass === "REAL_TIME") score += 10;
  if (isClinicalTask(request) && candidate.modelTier === "MEDICAL_SPECIALIST_MODEL") score += requiresPrivateInference(request) ? 20 : 5;
  if (isClinicalTask(request) && candidate.modelTier === "FRONTIER_MODEL" && !requiresPrivateInference(request)) score += 15;
  return score;
}

function candidatePoolForRequest(request: ScrimedComputeRoutingRequest) {
  const targetTier = targetTierForRequest(request);
  const compatible = scrimedComputeModelCandidates.filter((candidate) => {
    return (
      deploymentCompatible(candidate, request) &&
      candidate.supportedTaskTypes.includes(request.taskType) &&
      candidate.supportedModalities.includes(request.modality)
    );
  });

  const tierMatched = compatible.filter((candidate) => candidate.modelTier === targetTier);
  return tierMatched.length > 0 ? tierMatched : compatible;
}

function selectCandidate(request: ScrimedComputeRoutingRequest) {
  const pool = candidatePoolForRequest(request);
  const fallbackPool = pool.length > 0 ? pool : scrimedComputeModelCandidates;
  return [...fallbackPool].sort((left, right) => scoreCandidate(right, request) - scoreCandidate(left, request))[0];
}

function costClassForSelection(candidate: ScrimedComputeModelCandidate, request: ScrimedComputeRoutingRequest) {
  if (request.costSensitivity === "strict" && candidate.estimatedCostClass === "HIGH") return "MODERATE";
  return candidate.estimatedCostClass;
}

function latencyClassForSelection(candidate: ScrimedComputeModelCandidate, request: ScrimedComputeRoutingRequest) {
  if (request.latencyRequirement === "subsecond" && candidate.estimatedLatencyClass !== "REAL_TIME") return "INTERACTIVE";
  return candidate.estimatedLatencyClass;
}

function buildFallbackModels(request: ScrimedComputeRoutingRequest, selectedId: string) {
  return candidatePoolForRequest(request)
    .filter((candidate) => candidate.id !== selectedId)
    .sort((left, right) => scoreCandidate(right, request) - scoreCandidate(left, request))
    .slice(0, 3)
    .map((candidate) => candidate.id);
}

function buildReason(request: ScrimedComputeRoutingRequest, candidate: ScrimedComputeModelCandidate) {
  const reasons = [
    `${candidate.modelTier} selected for ${request.taskType}`,
    `${request.deploymentMode} deployment mode`,
    `${request.modality} modality`,
    `${request.riskLevel} clinical risk`,
    `${phiPolicyForRequest(request)} PHI policy`
  ];

  if (isClinicalTask(request)) reasons.push("clinical outputs require human review and cannot become autonomous authority");
  if (requiresPrivateInference(request)) reasons.push("private inference mode preferred before any external provider use");
  if (request.deploymentMode === "EDGE_DEVICE") reasons.push("edge AI deployment support favors local/edge runtimes");
  return reasons.join("; ");
}

function buildAuditTags(request: ScrimedComputeRoutingRequest, candidate: ScrimedComputeModelCandidate) {
  return [
    "scrimed-compute-fabric",
    scrimedComputeFabricVersion,
    `task:${request.taskType}`,
    `modality:${request.modality}`,
    `risk:${request.riskLevel}`,
    `deployment:${request.deploymentMode}`,
    `tier:${candidate.modelTier}`,
    `provider:${candidate.provider}`,
    `phi-policy:${phiPolicyForRequest(request)}`,
    isClinicalTask(request) ? "human-review-required" : "human-review-not-required-for-metadata-only",
    "no-live-model-call",
    "no-autonomous-clinical-authority"
  ];
}

export function selectScrimedModelForTask(request: ScrimedComputeRoutingRequest): ScrimedComputeRoutingDecision {
  const candidate = selectCandidate(request);
  const phiPolicy = phiPolicyForRequest(request);
  const requiresHumanReview = isClinicalTask(request) || request.phiSensitivity === "phi_heavy";
  const fallbackModels = buildFallbackModels(request, candidate.id);
  const reason = buildReason(request, candidate);
  const auditTags = buildAuditTags(request, candidate);
  const uncertaintyReasons = [
    "Confidence score is routing confidence, not proof of clinical correctness.",
    "Clinical correctness requires evidence review, external validation, and human signoff.",
    "Benchmark scores are synthetic metadata until a governed validation dataset is approved."
  ];
  const auditHash = generateScrimedAuditHash({
    request,
    selectedModel: candidate.id,
    modelTier: candidate.modelTier,
    provider: candidate.provider,
    phiPolicy,
    requiresHumanReview,
    version: scrimedComputeFabricVersion
  });
  const auditEvent: ScrimedComputeAuditEvent = {
    eventType: "scrimed_compute_model_selection",
    auditHash,
    requestId: request.requestId,
    selectedModel: candidate.id,
    provider: candidate.provider,
    modelTier: candidate.modelTier,
    deploymentMode: request.deploymentMode,
    reason,
    riskLevel: request.riskLevel,
    phiPolicy,
    requiresHumanReview,
    auditTags,
    emittedAt: scrimedComputeFabricUpdatedAt,
    syntheticOnly: true
  };

  return {
    selectedModel: candidate.id,
    modelTier: candidate.modelTier,
    provider: candidate.provider,
    deploymentMode: request.deploymentMode,
    reason,
    riskLevel: request.riskLevel,
    phiPolicy,
    requiresHumanReview,
    fallbackModels,
    estimatedCostClass: costClassForSelection(candidate, request),
    estimatedLatencyClass: latencyClassForSelection(candidate, request),
    auditTags,
    confidenceScore: requiresHumanReview ? 0.74 : 0.86,
    correctnessEvidenceRequired: [
      "schema validation",
      "source attribution",
      "benchmarkModelForTask",
      "compareModels",
      "human review for clinical recommendations"
    ],
    uncertainty: {
      confidenceIsNotCorrectness: true,
      incompleteEvidence: true,
      uncertaintyReasons
    },
    blockedActions: [...scrimedComputeNoGoBoundaries],
    auditEvent
  };
}

export function recordLatency(modelId: string, latencyMs: number) {
  const latencyClass: ScrimedComputeLatencyClass =
    latencyMs <= 750 ? "REAL_TIME" : latencyMs <= 3000 ? "INTERACTIVE" : latencyMs <= 10000 ? "STANDARD" : "BATCH";
  return { modelId, metric: "latency" as const, latencyMs, latencyClass };
}

export function recordCostClass(modelId: string, costClass: ScrimedComputeCostClass) {
  return { modelId, metric: "cost_class" as const, costClass };
}

export function recordQualityScore(modelId: string, score: number) {
  return { modelId, metric: "quality_score" as const, score };
}

export function recordClinicalUtilityScore(modelId: string, score: number) {
  return { modelId, metric: "clinical_utility_score" as const, score };
}

export function recordVerifiabilityScore(modelId: string, score: number) {
  return { modelId, metric: "verifiability_score" as const, score };
}

export function recordCompletenessScore(modelId: string, score: number) {
  return { modelId, metric: "completeness_score" as const, score };
}

export function recordSourceQualityScore(modelId: string, score: number) {
  return { modelId, metric: "source_quality_score" as const, score };
}

export function benchmarkModelForTask(
  modelId: string,
  request: ScrimedComputeRoutingRequest
): ScrimedComputeBenchmarkRecord {
  const decision = selectScrimedModelForTask(request);
  const candidate =
    scrimedComputeModelCandidates.find((model) => model.id === modelId) ??
    scrimedComputeModelCandidates.find((model) => model.id === decision.selectedModel) ??
    scrimedComputeModelCandidates[0];
  const clinicalPenalty = isClinicalTask(request) ? 0.08 : 0;
  const privacyBoost = requiresPrivateInference(request) && candidate.privacyPosture !== "public-contract-required" ? 0.05 : 0;
  const qualityScore = Math.min(0.95, 0.82 + privacyBoost - clinicalPenalty);
  const record: Omit<ScrimedComputeBenchmarkRecord, "auditHash"> = {
    benchmarkId: `${request.requestId}:${modelId}:benchmark`,
    modelId,
    taskType: request.taskType,
    modality: request.modality,
    deploymentMode: request.deploymentMode,
    metrics: {
      latency: recordLatency(modelId, candidate.estimatedLatencyClass === "REAL_TIME" ? 420 : 2800).latencyMs,
      cost_class: candidate.estimatedCostClass,
      quality_score: recordQualityScore(modelId, qualityScore).score,
      clinical_utility_score: recordClinicalUtilityScore(modelId, isClinicalTask(request) ? 0.72 : 0.8).score,
      verifiability_score: recordVerifiabilityScore(modelId, 0.84).score,
      completeness_score: recordCompletenessScore(modelId, 0.81).score,
      source_quality_score: recordSourceQualityScore(modelId, 0.83).score
    },
    safetyBoundary:
      "Synthetic benchmark scaffold only. Scores are routing-readiness metadata, not clinical validation or production approval.",
    humanReviewRequired: decision.requiresHumanReview,
    syntheticOnly: true
  };
  return {
    ...record,
    auditHash: generateScrimedAuditHash({ record, version: scrimedComputeFabricVersion })
  };
}

export function compareModels(records: ScrimedComputeBenchmarkRecord[]): ScrimedComputeBenchmarkComparison {
  const ranked = [...records].sort((left, right) => {
    const rightScore =
      Number(right.metrics.quality_score) +
      Number(right.metrics.verifiability_score) +
      Number(right.metrics.completeness_score) +
      Number(right.metrics.source_quality_score);
    const leftScore =
      Number(left.metrics.quality_score) +
      Number(left.metrics.verifiability_score) +
      Number(left.metrics.completeness_score) +
      Number(left.metrics.source_quality_score);
    return rightScore - leftScore;
  });
  const preferred = ranked[0];
  const base = {
    comparisonId: preferred ? `${preferred.benchmarkId}:comparison` : "empty-comparison",
    preferredModelId: preferred?.modelId ?? "none",
    comparedModelIds: ranked.map((record) => record.modelId),
    reason:
      "Preferred model is selected from synthetic quality, verifiability, completeness, source-quality, cost, latency, privacy, and human-review metadata.",
    requiresHumanReview: records.some((record) => record.humanReviewRequired)
  };
  return {
    ...base,
    auditHash: generateScrimedAuditHash({ base, version: scrimedComputeFabricVersion })
  };
}

export const scrimedComputeSampleRequests: ScrimedComputeRoutingRequest[] = [
  {
    requestId: "clinical-high-risk-route",
    taskType: "clinical_reasoning",
    modality: "FHIR",
    riskLevel: "high",
    phiSensitivity: "metadata_only",
    deploymentMode: "SCRIMED_CLOUD",
    latencyRequirement: "standard",
    costSensitivity: "premium_allowed",
    reasoningDepth: "specialist",
    requiresClinicalRecommendation: true
  },
  {
    requestId: "rcm-route",
    taskType: "RCM",
    modality: "text",
    riskLevel: "moderate",
    phiSensitivity: "metadata_only",
    deploymentMode: "CUSTOMER_VPC",
    latencyRequirement: "interactive",
    costSensitivity: "balanced",
    reasoningDepth: "standard"
  },
  {
    requestId: "ambient-scribe-route",
    taskType: "documentation",
    modality: "voice",
    riskLevel: "moderate",
    phiSensitivity: "phi_possible",
    deploymentMode: "EDGE_DEVICE",
    latencyRequirement: "subsecond",
    costSensitivity: "balanced",
    reasoningDepth: "standard"
  },
  {
    requestId: "air-gapped-route",
    taskType: "clinical_reasoning",
    modality: "text",
    riskLevel: "critical",
    phiSensitivity: "phi_heavy",
    deploymentMode: "AIR_GAPPED",
    latencyRequirement: "standard",
    costSensitivity: "balanced",
    reasoningDepth: "specialist",
    requiresClinicalRecommendation: true
  },
  {
    requestId: "edge-device-route",
    taskType: "operations",
    modality: "OCR",
    riskLevel: "low",
    phiSensitivity: "metadata_only",
    deploymentMode: "EDGE_DEVICE",
    latencyRequirement: "subsecond",
    costSensitivity: "strict",
    reasoningDepth: "shallow"
  },
  {
    requestId: "phi-heavy-route",
    taskType: "documentation",
    modality: "FHIR",
    riskLevel: "high",
    phiSensitivity: "phi_heavy",
    deploymentMode: "CUSTOMER_VPC",
    latencyRequirement: "standard",
    costSensitivity: "balanced",
    reasoningDepth: "deep",
    requiresClinicalRecommendation: true
  },
  {
    requestId: "low-risk-operations-route",
    taskType: "operations",
    modality: "text",
    riskLevel: "low",
    phiSensitivity: "none",
    deploymentMode: "SCRIMED_CLOUD",
    latencyRequirement: "interactive",
    costSensitivity: "strict",
    reasoningDepth: "shallow"
  }
];

export function getScrimedComputeFabricSummary() {
  const decisions = scrimedComputeSampleRequests.map(selectScrimedModelForTask);
  const benchmarkRecords = decisions.slice(0, 4).map((decision, index) =>
    benchmarkModelForTask(decision.selectedModel, scrimedComputeSampleRequests[index])
  );

  return {
    service: "scrimed-compute-fabric",
    version: scrimedComputeFabricVersion,
    updatedAt: scrimedComputeFabricUpdatedAt,
    status: scrimedComputeFabricStatus,
    environmentDefaults: scrimedComputeEnvironmentDefaults,
    deploymentModes: ["SCRIMED_CLOUD", "CUSTOMER_VPC", "AIR_GAPPED", "EDGE_DEVICE"] as ScrimedComputeDeploymentMode[],
    modelTiers: [
      "FRONTIER_MODEL",
      "COMPACT_REASONING_MODEL",
      "MEDICAL_SPECIALIST_MODEL",
      "VISION_MODEL",
      "SPEECH_MODEL",
      "EMBEDDING_MODEL"
    ] as ScrimedComputeModelTier[],
    providers: scrimedComputeModelCandidates,
    routingDecisions: decisions,
    benchmarking: {
      records: benchmarkRecords,
      comparison: compareModels(benchmarkRecords),
      functions: [
        "benchmarkModelForTask",
        "compareModels",
        "recordLatency",
        "recordCostClass",
        "recordQualityScore",
        "recordClinicalUtilityScore",
        "recordVerifiabilityScore",
        "recordCompletenessScore",
        "recordSourceQualityScore"
      ]
    },
    privateInferenceMode:
      "Air-gapped and PHI-heavy workflows prefer local/private models. Public-model PHI transfer is blocked unless explicitly approved through compliance, contracts, tenant policy, and technical controls.",
    edgeAiDeploymentSupport:
      "EDGE_DEVICE routes favor local speech, OCR, DICOM, embedding, NIM, Triton, TensorRT-LLM, FlashInfer, FP8, and NVFP4-ready runtime slots.",
    confidenceCorrectnessBoundary:
      "Confidence is a routing signal, not proof of correctness. Correctness requires evidence, benchmarks, validation, and human review.",
    noGoBoundaries: scrimedComputeNoGoBoundaries,
    safetyBoundary:
      "Metadata-only synthetic routing foundation. No paid APIs, live model calls, PHI transfer, diagnosis, treatment, prescribing, final imaging interpretation, payer submission, EHR writeback, or customer go-live."
  };
}

export function buildScrimedComputeFabricBrief() {
  const summary = getScrimedComputeFabricSummary();
  return [
    "# SCRIMED Compute Fabric",
    "",
    `Status: ${summary.status}`,
    `Version: ${summary.version}`,
    "",
    "## Architecture",
    "SCRIMED Compute Fabric is a metadata-only, healthcare-safe model routing and benchmarking foundation for SCRIMED Cloud, Customer VPC, air-gapped, and edge-device deployments.",
    "",
    "## Deployment Modes",
    ...summary.deploymentModes.map((mode) => `- ${mode}`),
    "",
    "## Model Tiers",
    ...summary.modelTiers.map((tier) => `- ${tier}`),
    "",
    "## Routing Matrix",
    ...summary.routingDecisions.map(
      (decision) =>
        `- ${decision.auditEvent.requestId}: ${decision.selectedModel} (${decision.modelTier}, ${decision.provider}) -> ${decision.phiPolicy}; human review=${decision.requiresHumanReview}; cost=${decision.estimatedCostClass}; latency=${decision.estimatedLatencyClass}`
    ),
    "",
    "## NVIDIA/Open-Model Roadmap",
    "- vLLM, SGLang, TensorRT-LLM, NVIDIA NIM, Triton Inference Server, FlashInfer, FP8 / NVFP4 optimized inference.",
    "- Pulsar 16B / compact open reasoning models and Llama / Mistral / Qwen / GLM-class open models remain gated by benchmark, license, privacy, and clinical safety review.",
    "",
    "## Benchmarking Strategy",
    ...summary.benchmarking.functions.map((fn) => `- ${fn}`),
    "",
    "## Safety Boundaries",
    ...summary.noGoBoundaries.map((boundary) => `- ${boundary}`),
    "",
    summary.confidenceCorrectnessBoundary
  ].join("\n");
}
