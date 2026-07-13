#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "app/lib/scrimedComputeFabric.ts",
  "app/lib/executionAttemptEnvelope.ts",
  "app/lib/executionAttemptDurableStore.ts",
  "app/api/scrimed-compute-fabric/route.ts",
  "app/api/scrimed-compute-fabric/brief/route.ts",
  "supabase/migrations/20260705164000_execution_attempt_compute_fabric_evidence_binding.sql",
  "docs/scrimed-compute-fabric.md",
  "docs/execution-attempt-envelope.md",
  "package.json",
  "scripts/scrimed-nonsecret-test-suite.mjs"
];

async function load(path) {
  return [path, await readFile(path, "utf8")];
}

function requireIncludes(path, text, expected) {
  if (!text.includes(expected)) {
    throw new Error(`${path} is missing required SCRIMED Compute Fabric text: ${expected}`);
  }
}

const files = Object.fromEntries(await Promise.all(requiredFiles.map(load)));
const fabric = files["app/lib/scrimedComputeFabric.ts"];
const executionEnvelope = files["app/lib/executionAttemptEnvelope.ts"];
const durableStore = files["app/lib/executionAttemptDurableStore.ts"];
const api = files["app/api/scrimed-compute-fabric/route.ts"];
const briefApi = files["app/api/scrimed-compute-fabric/brief/route.ts"];
const computeFabricMigration =
  files["supabase/migrations/20260705164000_execution_attempt_compute_fabric_evidence_binding.sql"];
const docs = files["docs/scrimed-compute-fabric.md"];
const executionDocs = files["docs/execution-attempt-envelope.md"];
const packageJson = files["package.json"];
const suite = files["scripts/scrimed-nonsecret-test-suite.mjs"];

for (const expected of [
  "SCRIMED_CLOUD",
  "CUSTOMER_VPC",
  "AIR_GAPPED",
  "EDGE_DEVICE",
  "FRONTIER_MODEL",
  "COMPACT_REASONING_MODEL",
  "MEDICAL_SPECIALIST_MODEL",
  "VISION_MODEL",
  "SPEECH_MODEL",
  "EMBEDDING_MODEL",
  "clinical_reasoning",
  "RCM",
  "intake",
  "coding",
  "documentation",
  "referral_routing",
  "research",
  "operations"
]) {
  requireIncludes("app/lib/scrimedComputeFabric.ts", fabric, expected);
}

for (const expected of [
  "gpt_class_frontier",
  "claude_class_frontier",
  "gemini_class_frontier",
  "pulsar_16b_compact_open_reasoning",
  "llama_mistral_qwen_glm_open",
  "biomed_specialist",
  "radiology_specialist",
  "pathology_specialist",
  "vLLM",
  "SGLang",
  "TensorRT-LLM",
  "NVIDIA NIM",
  "Triton Inference Server",
  "FlashInfer",
  "FP8 / NVFP4 optimized inference"
]) {
  requireIncludes("app/lib/scrimedComputeFabric.ts", fabric, expected);
}

for (const expected of [
  "selectedModel",
  "modelTier",
  "provider",
  "deploymentMode",
  "reason",
  "riskLevel",
  "phiPolicy",
  "requiresHumanReview",
  "fallbackModels",
  "estimatedCostClass",
  "estimatedLatencyClass",
  "auditTags"
]) {
  requireIncludes("app/lib/scrimedComputeFabric.ts", fabric, expected);
}

for (const expected of [
  "benchmarkModelForTask",
  "compareModels",
  "recordLatency",
  "recordCostClass",
  "recordQualityScore",
  "recordClinicalUtilityScore",
  "recordVerifiabilityScore",
  "recordCompletenessScore",
  "recordSourceQualityScore"
]) {
  requireIncludes("app/lib/scrimedComputeFabric.ts", fabric, expected);
}

for (const expected of [
  "clinical-high-risk-route",
  "rcm-route",
  "ambient-scribe-route",
  "air-gapped-route",
  "edge-device-route",
  "phi-heavy-route",
  "low-risk-operations-route",
  "buildFallbackModels",
  "scrimed_compute_model_selection",
  "human-review-required",
  "Confidence score is routing confidence, not proof of clinical correctness.",
  "no-autonomous-clinical-authority",
  "public-model-blocked-private-inference-required",
  "air-gapped-local-only",
  "edge-local-only"
]) {
  requireIncludes("app/lib/scrimedComputeFabric.ts", fabric, expected);
}

for (const expected of [
  "SCRIMED_AI_PROVIDER_CALLS_ENABLED",
  "SCRIMED_PRIVATE_INFERENCE_MODE",
  "SCRIMED_PUBLIC_MODEL_PHI_ALLOWED",
  "SCRIMED_EDGE_AI_ENABLED",
  "SCRIMED_NVIDIA_RUNTIME_ENABLED",
  "synthetic-routing-only-no-live-model-calls",
  "no live PHI",
  "no autonomous diagnosis",
  "no autonomous treatment recommendations",
  "no prescribing",
  "no final imaging interpretation",
  "no payer submission",
  "no EHR writeback"
]) {
  requireIncludes("app/lib/scrimedComputeFabric.ts", fabric, expected);
}

for (const expected of [
  "getScrimedComputeFabricSummary",
  "X-SCRIMED-Compute-Fabric",
  "X-SCRIMED-Model-Calls",
  "not-enabled",
  "synthetic-and-metadata-only"
]) {
  requireIncludes("app/api/scrimed-compute-fabric/route.ts", api, expected);
}

for (const expected of [
  "buildScrimedComputeFabricBrief",
  "text/markdown",
  "scrimed-compute-fabric.md",
  "X-SCRIMED-Compute-Fabric"
]) {
  requireIncludes("app/api/scrimed-compute-fabric/brief/route.ts", briefApi, expected);
}

for (const expected of [
  "Architecture Overview",
  "Model Routing Matrix",
  "Deployment Modes",
  "Safety Boundaries",
  "Durable Evidence Binding",
  "scrimed-intel-[0-9a-f]{8}",
  "NVIDIA/Open-Model Roadmap",
  "Edge Appliance Roadmap",
  "Benchmarking Strategy",
  "Confidence is not correctness",
  "Production use remains blocked"
]) {
  requireIncludes("docs/scrimed-compute-fabric.md", docs, expected);
}

for (const expected of [
  "ExecutionAttemptComputeFabricTelemetry",
  "computeFabricTelemetry",
  "computeFabricTelemetryForInput",
  "isScrimedComputeAuditHash",
  "selectScrimedModelForTask",
  "compute_fabric_audit_hash",
  "compute_fabric_selected_model",
  "compute_fabric_model_tier",
  "compute_fabric_provider",
  "compute_fabric_deployment_mode",
  "compute_fabric_phi_policy",
  "compute_fabric_human_review_required",
  "execution-attempt-compute-fabric-binding",
  "compute-fabric-evidence-audit-bound",
  "confidence-is-not-correctness",
  "metadata-only-no-live-model-call",
  "computeFabricTelemetryCount",
  "computeFabricHumanReviewRequiredCount",
  "computeFabricModelTierCount",
  "computeFabricPhiPolicyCount"
]) {
  requireIncludes("app/lib/executionAttemptEnvelope.ts", executionEnvelope, expected);
}

for (const expected of [
  "compute-fabric-evidence-binding-covered",
  "computeFabricSelectedModel",
  "computeFabricModelTier",
  "computeFabricPhiPolicy",
  "computeFabricAuditHash"
]) {
  requireIncludes("app/lib/executionAttemptDurableStore.ts", durableStore, expected);
}

for (const expected of [
  "compute_fabric_telemetry",
  "compute_fabric_audit_hash",
  "compute_fabric_selected_model",
  "compute_fabric_model_tier",
  "compute_fabric_provider",
  "compute_fabric_deployment_mode",
  "compute_fabric_phi_policy",
  "compute_fabric_human_review_required",
  "compute_fabric_fallback_models",
  "require_execution_attempt_compute_fabric",
  "populate_execution_attempt_compute_fabric_columns",
  "execution-attempt-compute-fabric-human-review-required",
  "execution-attempt-compute-fabric-evidence-binding-mismatch",
  "execution_attempts_compute_fabric_audit_hash_idx",
  "^scrimed-intel-[0-9a-f]{8}$"
]) {
  requireIncludes(
    "supabase/migrations/20260705164000_execution_attempt_compute_fabric_evidence_binding.sql",
    computeFabricMigration,
    expected
  );
}

for (const expected of [
  "SCRIMED Compute Fabric telemetry",
  "20260705164000_execution_attempt_compute_fabric_evidence_binding.sql",
  "compute_fabric_audit_hash",
  "compute_fabric_selected_model",
  "No Compute Fabric routing decision can become clinical authority",
  "Extend durable-store schema/RPC evidence projections"
]) {
  requireIncludes("docs/execution-attempt-envelope.md", executionDocs, expected);
}

requireIncludes(
  "package.json",
  packageJson,
  "\"smoke:scrimed-compute-fabric\": \"node scripts/scrimed-compute-fabric-contract-check.mjs\""
);

requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  suite,
  "scripts/scrimed-compute-fabric-contract-check.mjs"
);

console.log("pass SCRIMED Compute Fabric contract check");
