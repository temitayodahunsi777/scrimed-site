import type { PerformanceTelemetrySummary } from "../observability/performanceTelemetry";

export type InternalReliabilityTarget = {
  id: "http-5xx" | "server-functions" | "p95-latency" | "p99-latency" | "route-availability" | "agent-failures" | "model-provider-failures";
  maximum?: number;
  minimum?: number;
  unit: "rate" | "milliseconds";
};

export const scrimedInternalReliabilityTargets: InternalReliabilityTarget[] = [
  { id: "http-5xx", maximum: 0.01, unit: "rate" },
  { id: "server-functions", maximum: 0.01, unit: "rate" },
  { id: "p95-latency", maximum: 2500, unit: "milliseconds" },
  { id: "p99-latency", maximum: 5000, unit: "milliseconds" },
  { id: "route-availability", minimum: 0.99, unit: "rate" },
  { id: "agent-failures", maximum: 0.02, unit: "rate" },
  { id: "model-provider-failures", maximum: 0.03, unit: "rate" }
];

export function evaluateInternalErrorBudget(input: {
  telemetry: PerformanceTelemetrySummary;
  serverFunctionFailureRate: number;
  routeAvailability: number;
  agentFailureRate: number;
}) {
  const observed: Record<InternalReliabilityTarget["id"], number | null> = {
    "http-5xx": input.telemetry.errorRate,
    "server-functions": input.serverFunctionFailureRate,
    "p95-latency": input.telemetry.p95LatencyMs,
    "p99-latency": input.telemetry.p99LatencyMs,
    "route-availability": input.routeAvailability,
    "agent-failures": input.agentFailureRate,
    "model-provider-failures": input.telemetry.providerFailureRate
  };
  const results = scrimedInternalReliabilityTargets.map((target) => {
    const value = observed[target.id];
    const passed = value !== null &&
      (target.maximum === undefined || value <= target.maximum) &&
      (target.minimum === undefined || value >= target.minimum);
    return { ...target, observed: value, status: passed ? ("pass" as const) : ("review" as const) };
  });

  return {
    status: results.every((result) => result.status === "pass") ? ("within-budget" as const) : ("review-required" as const),
    results,
    contractualSla: false as const,
    productionAuthorityGranted: false as const,
    boundary: "Internal engineering targets only; not a contractual SLA, availability guarantee, or production-readiness claim."
  };
}
