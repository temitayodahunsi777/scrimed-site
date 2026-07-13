import { generateScrimedAuditHash } from "./scrimedIntelligencePlatform";
import { scrimedSafetyPolicyVersion } from "./scrimedSafetyGovernance";

export type ScrimedLLMOpsTrace = {
  traceId: string;
  agentId: string;
  modelId: string;
  latencyMs: number;
  costEstimateUsd: number;
  tokenEstimate: number;
  safetyEventCount: number;
  policyDecision: "allow" | "deny" | "require_review";
  benchmarkStatus: "not_run" | "pass" | "caution" | "blocked";
  rollbackReadiness: "ready" | "needs_review" | "not_ready";
  productionReadiness: false;
  traceHash: string;
};

export const scrimedLLMOpsObservabilityApiRoute = "/api/scrimed-llmops-observability";
export const scrimedLLMOpsObservabilityBriefRoute = "/api/scrimed-llmops-observability/brief";
export const scrimedLLMOpsObservabilityStatus = "scrimed-llmops-observability-active-synthetic-no-phi";
export const scrimedLLMOpsObservabilityBoundary =
  "SCRIMED LLMOps Observability records synthetic/no-PHI trace metadata only. It does not store raw PHI, raw connector payloads, credentials, live patient data, clinical authority, production readiness claims, or customer go-live approval.";

const scrimedLLMOpsTraceFixtures: Array<Omit<ScrimedLLMOpsTrace, "traceHash">> = [
  {
    traceId: "trace-synthetic-agent-governance-001",
    agentId: "sentinel-supervisor",
    modelId: "synthetic-policy-model",
    latencyMs: 118,
    costEstimateUsd: 0.001,
    tokenEstimate: 620,
    safetyEventCount: 1,
    policyDecision: "require_review",
    benchmarkStatus: "caution",
    rollbackReadiness: "ready",
    productionReadiness: false
  },
  {
    traceId: "trace-synthetic-retrieval-001",
    agentId: "hybrid-retrieval-router",
    modelId: "synthetic-ranking-engine",
    latencyMs: 74,
    costEstimateUsd: 0,
    tokenEstimate: 0,
    safetyEventCount: 0,
    policyDecision: "allow",
    benchmarkStatus: "pass",
    rollbackReadiness: "ready",
    productionReadiness: false
  }
];

export const scrimedLLMOpsTraces: ScrimedLLMOpsTrace[] = scrimedLLMOpsTraceFixtures.map((trace) => ({
  ...trace,
  traceHash: generateScrimedAuditHash({
    ...trace,
    safetyPolicyVersion: scrimedSafetyPolicyVersion
  })
}));

export function getScrimedLLMOpsObservabilitySummary() {
  return {
    service: "scrimed-llmops-observability",
    status: scrimedLLMOpsObservabilityStatus,
    apiRoute: scrimedLLMOpsObservabilityApiRoute,
    briefRoute: scrimedLLMOpsObservabilityBriefRoute,
    boundary: scrimedLLMOpsObservabilityBoundary,
    traceCount: scrimedLLMOpsTraces.length,
    productionReadiness: false,
    traces: scrimedLLMOpsTraces,
    aggregate: {
      totalTokenEstimate: scrimedLLMOpsTraces.reduce((total, trace) => total + trace.tokenEstimate, 0),
      totalCostEstimateUsd: Number(
        scrimedLLMOpsTraces.reduce((total, trace) => total + trace.costEstimateUsd, 0).toFixed(4)
      ),
      safetyEventCount: scrimedLLMOpsTraces.reduce((total, trace) => total + trace.safetyEventCount, 0),
      rollbackReadyCount: scrimedLLMOpsTraces.filter((trace) => trace.rollbackReadiness === "ready").length
    },
    noPhiConfirmed: true
  };
}

export function buildScrimedLLMOpsObservabilityBrief() {
  const summary = getScrimedLLMOpsObservabilitySummary();

  return [
    "# SCRIMED LLMOps Observability Layer",
    "",
    summary.boundary,
    "",
    "## Trace Fields",
    "- trace id",
    "- agent id",
    "- model id",
    "- latency",
    "- cost estimate",
    "- token estimate",
    "- safety event count",
    "- policy decision",
    "- benchmark status",
    "- rollback readiness",
    "- production readiness false by default",
    "",
    "## Synthetic Traces",
    ...summary.traces.map(
      (trace) =>
        `- ${trace.traceId}: agent=${trace.agentId}; model=${trace.modelId}; policy=${trace.policyDecision}; benchmark=${trace.benchmarkStatus}; production_ready=${trace.productionReadiness}`
    )
  ].join("\n");
}
