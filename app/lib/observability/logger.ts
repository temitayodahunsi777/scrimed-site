import { redactForTelemetry } from "../scrimed-work/audit";
import {
  toOperationalErrorCategory,
  type ScrimedErrorCategory,
  type ScrimedOperationalErrorCategory
} from "./errorTaxonomy";
import type { ScrimedRequestContext } from "./requestContext";
import { getScrimedBuildInfo } from "../release/vercelReleaseAssurance";

export type ScrimedTelemetryEvent = ScrimedRequestContext & {
  event: "request" | "agent-run" | "model-route" | "policy" | "dependency";
  modelRoute: string | null;
  riskTier: "low" | "moderate" | "high" | "prohibited" | null;
  latencyMs: number;
  status: "success" | "blocked" | "failed";
  errorCategory: ScrimedErrorCategory | null;
  operationalErrorCategory: ScrimedOperationalErrorCategory | null;
  costCategory: "none" | "low" | "medium" | "high" | "unknown";
  durationMs: number;
  environment: "development" | "test" | "preview" | "production" | "unknown";
  releaseFingerprint: string;
  timestamp: string;
  occurredAt: string;
};

export type TelemetrySink = (serializedEvent: string) => void;

export function createTelemetryEvent(
  input: Omit<
    ScrimedTelemetryEvent,
    | "occurredAt"
    | "timestamp"
    | "durationMs"
    | "environment"
    | "releaseFingerprint"
    | "operationalErrorCategory"
  >,
  occurredAt = new Date().toISOString()
): ScrimedTelemetryEvent {
  if (!Number.isFinite(input.latencyMs) || input.latencyMs < 0) {
    throw new Error("Telemetry latency must be finite and nonnegative.");
  }

  const build = getScrimedBuildInfo();
  return redactForTelemetry({
    ...input,
    operationalErrorCategory: toOperationalErrorCategory(input.errorCategory),
    durationMs: input.latencyMs,
    environment: build.environment,
    releaseFingerprint: build.releaseFingerprint,
    timestamp: occurredAt,
    occurredAt
  }) as ScrimedTelemetryEvent;
}

export function emitTelemetry(
  event: ScrimedTelemetryEvent,
  sink: TelemetrySink = (value) => console.info(value)
) {
  const serialized = JSON.stringify(redactForTelemetry(event));
  sink(serialized);
  return serialized;
}

export const scrimedTelemetryBoundary =
  "Structured metadata only: no raw prompts, payloads, clinical text, PHI, PII, credentials, cookies, tokens, or secrets.";
