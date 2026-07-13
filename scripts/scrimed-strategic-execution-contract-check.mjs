#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "app/lib/scrimedStrategicExecutionLayer.ts",
  "app/lib/agentOS.ts",
  "app/lib/scrimedDynamicContextInjection.ts",
  "app/api/scrimed-build-roadmap/strategic-execution/route.ts",
  "app/api/scrimed-build-roadmap/strategic-execution/brief/route.ts",
  "app/api/observability/route.ts",
  "app/scrimed-build-roadmap/page.tsx",
  "docs/scrimed-build-roadmap.md",
  "package.json",
  "scripts/scrimed-nonsecret-test-suite.mjs"
];

async function load(path) {
  return [path, await readFile(path, "utf8")];
}

function requireIncludes(path, text, expected) {
  if (!text.includes(expected)) {
    throw new Error(`${path} is missing required SCRIMED strategic-execution text: ${expected}`);
  }
}

const files = Object.fromEntries(await Promise.all(requiredFiles.map(load)));
const source = files["app/lib/scrimedStrategicExecutionLayer.ts"];
const agentOS = files["app/lib/agentOS.ts"];
const contextInjection = files["app/lib/scrimedDynamicContextInjection.ts"];
const api = files["app/api/scrimed-build-roadmap/strategic-execution/route.ts"];
const brief = files["app/api/scrimed-build-roadmap/strategic-execution/brief/route.ts"];
const observability = files["app/api/observability/route.ts"];
const page = files["app/scrimed-build-roadmap/page.tsx"];
const docs = files["docs/scrimed-build-roadmap.md"];
const packageJson = files["package.json"];
const suite = files["scripts/scrimed-nonsecret-test-suite.mjs"];

for (const expected of [
  "scrimed-strategic-execution-layer",
  "measurable, governed, observable, faster, cheaper, safer, and harder to copy",
  "buildAgentRuntimeContextBridge",
  "context-manifest-required-before-agent-run",
  "Workflow Planner must consume the context manifest",
  "Agent Runtime must bind manifest hash",
  "stored-vector lookup",
  "patient-matching",
  "document-similarity",
  "clinical-retrieval",
  "payer-policy-lookup",
  "recommendation-search",
  "scrimed_match_stored_vector(source_vector_id",
  "scrimed_search_similar_documents(source_vector_id",
  "scrimed_search_clinical_evidence(source_vector_id",
  "scrimed_search_payer_policy(source_vector_id",
  "scrimed_search_recommendation_memory(source_vector_id",
  "stored-vector-lookup-covers-five-domains",
  "usage_event_id",
  "workflow_trace_id",
  "input_hash",
  "model_provider_and_version",
  "output_hash",
  "action_taken",
  "user_feedback",
  "downstream_outcome",
  "fairness_slice",
  "context_effects",
  "clinician_behavior_change",
  "medlog-usage-fields-cover-input-model-output-action-feedback-outcome",
  "age",
  "sex",
  "geography",
  "setting",
  "time of day",
  "payer",
  "diagnosis",
  "workflow type",
  "healthcare-observability-covers-required-slices",
  "scheduling",
  "intake",
  "referrals",
  "authorizations",
  "RCM",
  "outreach",
  "support",
  "agentic-workflow-orchestration-human-gated",
  "startup verticals",
  "valuations and raise sizes",
  "team composition",
  "best pitch patterns",
  "market gaps",
  "investor-intelligence-report-tracks-market-signals-with-boundaries",
  "speculative decoding",
  "block drafting",
  "batching",
  "semantic caching",
  "vLLM/TensorRT-style runtime readiness",
  "cost_per_token",
  "inference-efficiency-backlog-tracks-cost-latency-throughput-quality",
  "prescription-event-detected",
  "adherence-barrier-screen",
  "education-and-followup-draft",
  "closed-loop-receipt-check",
  "prescription-engagement-review-gated-no-outreach",
  "prompt-registry-production-aliases",
  "trace-registry-with-sme-ground-truth",
  "custom-judge-and-deterministic-scorer-registry",
  "rag-evaluation-registry",
  "model-comparison-registry",
  "mlflow-style-evaluation-layer-present",
  "buildScrimedStrategicExecutionBrief"
]) {
  requireIncludes("app/lib/scrimedStrategicExecutionLayer.ts", source, expected);
}

for (const expected of [
  "buildAgentRuntimeContextBridge",
  "preRunContextManifest",
  "manifestHash",
  "selectedModuleIds",
  "validatorIds",
  "activeTaskReminderIds",
  "omittedContextIds",
  "failClosed",
  "agentRuntimeContextBridge"
]) {
  requireIncludes("app/lib/agentOS.ts", agentOS, expected);
}

for (const expected of [
  "pre-agent-run",
  "none-context-manifest-does-not-grant-permissions",
  "metadata-rationale-summary-not-hidden-chain-of-thought"
]) {
  requireIncludes("app/lib/scrimedDynamicContextInjection.ts", contextInjection, expected);
}

for (const expected of [
  "getScrimedStrategicExecutionLayerSummary",
  "evaluateScrimedSafetyGate",
  "X-SCRIMED-Strategic-Execution",
  "synthetic-no-phi-only"
]) {
  requireIncludes("app/api/scrimed-build-roadmap/strategic-execution/route.ts", api, expected);
}

for (const expected of [
  "buildScrimedStrategicExecutionBrief",
  "scrimed-strategic-execution-layer.md",
  "text/markdown"
]) {
  requireIncludes("app/api/scrimed-build-roadmap/strategic-execution/brief/route.ts", brief, expected);
}

for (const expected of [
  "healthcareAiObservabilitySlices",
  "medLogStyleUsageFields",
  "inferenceEfficiencyBacklog",
  "mlflowStyleEvaluationLayers"
]) {
  requireIncludes("app/api/observability/route.ts", observability, expected);
}

for (const expected of [
  "Strategic Execution",
  "Strategic Execution Layer",
  "stored-vector lookup",
  "Agent Runtime context bridge",
  "MedLog-style fields",
  "MLflow-style registries",
  "Prescription engagement workflow remains review-gated"
]) {
  requireIncludes("app/scrimed-build-roadmap/page.tsx", page, expected);
}

for (const expected of [
  "/api/scrimed-build-roadmap/strategic-execution",
  "Strategic Execution Layer",
  "Stored-vector lookup search",
  "MedLog-style AI usage logging",
  "Healthcare AI observability",
  "Agentic workflow orchestration",
  "AI Healthcare Investor Intelligence report",
  "Inference efficiency backlog",
  "Prescription engagement workflow",
  "MLflow-style evaluation layer",
  "not investment advice",
  "does not authorize live PHI"
]) {
  requireIncludes("docs/scrimed-build-roadmap.md", docs, expected);
}

requireIncludes(
  "package.json",
  packageJson,
  "\"smoke:scrimed-strategic-execution\": \"node scripts/scrimed-strategic-execution-contract-check.mjs\""
);

requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  suite,
  "scripts/scrimed-strategic-execution-contract-check.mjs"
);

console.log("pass SCRIMED strategic execution contract check");
