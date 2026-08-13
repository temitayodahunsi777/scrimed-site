import { redactForTelemetry } from "../scrimed-work/audit";
import type { ScrimedErrorCategory } from "./errorTaxonomy";
import type { ScrimedRequestContext } from "./requestContext";

export type ScrimedTelemetryEvent = ScrimedRequestContext & {
  event: "request" | "agent-run" | "model-route" | "policy" | "dependency";
  modelRoute: string | null;
  riskTier: "low" | "moderate" | "high" | "prohibited" | null;
  latencyMs: number;
  status: "success" | "blocked" | "failed";
  errorCategory: ScrimedErrorCategory | null;
  costCategory: "none" | "low" | "medium" | "high" | "unknown";
  occurredAt: string;
};

export type TelemetrySink = (serializedEvent: string) => void;

export function createTelemetryEvent(
  input: Omit<ScrimedTelemetryEvent, "occurredAt">,
  occurredAt = new Date().toISOString()
): ScrimedTelemetryEvent {
  if (!Number.isFinite(input.latencyMs) || input.latencyMs < 0) {
    throw new Error("Telemetry latency must be finite and nonnegative.");
  }

  return redactForTelemetry({ ...input, occurredAt }) as ScrimedTelemetryEvent;
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
