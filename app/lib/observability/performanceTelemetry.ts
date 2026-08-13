import type { ScrimedTelemetryEvent } from "./logger";

export type PerformanceTelemetrySummary = {
  requestCount: number;
  successfulCount: number;
  blockedCount: number;
  failedCount: number;
  p95LatencyMs: number | null;
  p99LatencyMs: number | null;
  errorRate: number;
  providerFailureRate: number;
};

function percentile(values: number[], fraction: number) {
  if (!values.length) return null;
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * fraction) - 1)];
}

export function summarizePerformanceTelemetry(events: ScrimedTelemetryEvent[]): PerformanceTelemetrySummary {
  const requestCount = events.length;
  const failed = events.filter((event) => event.status === "failed");
  const providerFailures = failed.filter((event) => event.errorCategory === "PROVIDER");

  return {
    requestCount,
    successfulCount: events.filter((event) => event.status === "success").length,
    blockedCount: events.filter((event) => event.status === "blocked").length,
    failedCount: failed.length,
    p95LatencyMs: percentile(events.map((event) => event.latencyMs), 0.95),
    p99LatencyMs: percentile(events.map((event) => event.latencyMs), 0.99),
    errorRate: requestCount ? failed.length / requestCount : 0,
    providerFailureRate: requestCount ? providerFailures.length / requestCount : 0
  };
}
