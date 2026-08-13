import { createHash, randomUUID } from "node:crypto";

export type ScrimedRequestContext = {
  requestId: string;
  traceId: string;
  tenantHash: string | null;
  workflowId: string | null;
  agentRunId: string | null;
  route: string;
};

function hashIdentifier(value: string) {
  return createHash("sha256").update(`scrimed-telemetry:${value}`).digest("hex").slice(0, 20);
}

function correlationId(value: string | undefined, prefix: "req" | "trace") {
  const supplied = value?.trim();
  return supplied
    ? `${prefix}_external_${hashIdentifier(supplied)}`
    : `${prefix}_${randomUUID()}`;
}

function safeRoute(value: string) {
  const pathname = value.split("?", 1)[0] || "/";
  return pathname
    .replace(/\b[0-9a-f]{8}-[0-9a-f-]{27,}\b/gi, ":id")
    .replace(/\b[0-9a-f]{32,64}\b/gi, ":hash")
    .slice(0, 240);
}

export function createScrimedRequestContext(input: {
  route: string;
  tenantId?: string | null;
  workflowId?: string | null;
  agentRunId?: string | null;
  requestId?: string;
  traceId?: string;
}): ScrimedRequestContext {
  const requestId = correlationId(input.requestId, "req");
  const traceId = correlationId(input.traceId, "trace");

  return {
    requestId: requestId.slice(0, 96),
    traceId: traceId.slice(0, 96),
    tenantHash: input.tenantId ? hashIdentifier(input.tenantId) : null,
    workflowId: input.workflowId ? hashIdentifier(input.workflowId) : null,
    agentRunId: input.agentRunId ? hashIdentifier(input.agentRunId) : null,
    route: safeRoute(input.route)
  };
}
