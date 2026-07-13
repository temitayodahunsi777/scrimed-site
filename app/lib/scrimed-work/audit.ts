import { generateScrimedAuditHash } from "../scrimedIntelligencePlatform";
import type { WorkApiEnvelope, WorkApiErrorEnvelope } from "./types";

export const scrimedWorkPolicyVersion = "scrimed-work-policy-v2026-07-09";
export const scrimedWorkAuditBoundary =
  "metadata-only-no-phi-no-secrets-no-raw-prompts-no-raw-connector-payloads";

export type ScrimedWorkAuditEvent = {
  eventId: string;
  sessionId: string;
  action: string;
  actorId: string;
  tenantId: string;
  policyVersion: typeof scrimedWorkPolicyVersion;
  decision: "allow" | "deny" | "require_human_approval" | "fail_closed";
  reason: string;
  timestamp: string;
  traceId: string;
  auditHash: string;
};

export function nowIso() {
  return "2026-07-09T00:00:00.000Z";
}

export function createTraceId(seed: string) {
  return `trace_${generateScrimedAuditHash({ seed, policy: scrimedWorkPolicyVersion }).slice(0, 18)}`;
}

export function createRequestId(seed: string) {
  return `req_${generateScrimedAuditHash({ seed, boundary: scrimedWorkAuditBoundary }).slice(0, 18)}`;
}

export function createAuditHash(payload: Record<string, unknown>) {
  return generateScrimedAuditHash({
    ...payload,
    policyVersion: scrimedWorkPolicyVersion,
    boundary: scrimedWorkAuditBoundary
  });
}

export function createAuditEvent(input: Omit<ScrimedWorkAuditEvent, "policyVersion" | "timestamp" | "auditHash">): ScrimedWorkAuditEvent {
  const timestamp = nowIso();

  return {
    ...input,
    policyVersion: scrimedWorkPolicyVersion,
    timestamp,
    auditHash: createAuditHash({ ...input, timestamp })
  };
}

export function envelope<T>(data: T, seed: string): WorkApiEnvelope<T> {
  return {
    ok: true,
    data,
    meta: {
      requestId: createRequestId(seed),
      traceId: createTraceId(seed),
      timestamp: nowIso()
    }
  };
}

export function errorEnvelope(
  code: string,
  message: string,
  seed: string,
  retryable = false
): WorkApiErrorEnvelope {
  return {
    ok: false,
    error: {
      code,
      message,
      retryable
    },
    meta: {
      requestId: createRequestId(seed),
      traceId: createTraceId(seed),
      timestamp: nowIso()
    }
  };
}

export function redactForTelemetry(value: unknown): unknown {
  if (typeof value === "string") {
    return value
      .replace(/\bBearer\s+[A-Za-z0-9._-]+\b/g, "Bearer [REDACTED]")
      .replace(/\bsk-[A-Za-z0-9_-]+\b/g, "[REDACTED_API_KEY]")
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, "[REDACTED_IDENTIFIER]")
      .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[REDACTED_EMAIL]");
  }

  if (Array.isArray(value)) return value.map(redactForTelemetry);

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => {
        if (/token|secret|password|credential|authorization|cookie/i.test(key)) {
          return [key, "[REDACTED]"];
        }

        return [key, redactForTelemetry(entry)];
      })
    );
  }

  return value;
}
