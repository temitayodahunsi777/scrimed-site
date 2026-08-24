import { createClinicalEvidenceHash } from "../clinicalEvidenceControls";

export type P34EgressChannel =
  | "model-prompt"
  | "agent-tool"
  | "http-egress"
  | "log"
  | "telemetry"
  | "connector"
  | "proof-packet"
  | "investor-artifact"
  | "public-api"
  | "api-response";
export type P34EgressDataClassification =
  | "public"
  | "synthetic-no-phi"
  | "metadata-no-phi"
  | "phi"
  | "secret"
  | "unknown";

export type P34EgressFirewallDecision = {
  decision: "ALLOW" | "REQUIRE_HUMAN" | "BLOCK";
  channel: P34EgressChannel;
  declaredDataClassification: P34EgressDataClassification;
  detectedClasses: Array<"phi" | "secret" | "credential" | "direct-identifier">;
  detectedPaths: string[];
  sanitizedPayload: unknown;
  inspectionComplete: boolean;
  rawSensitiveInputDetected: boolean;
  forwardingAuthorized: false;
  containsRawPhi: false;
  containsSecrets: false;
  reasonCodes: string[];
  decisionHash: string;
};

const blockedValuePatterns: Array<{
  classification: P34EgressFirewallDecision["detectedClasses"][number];
  pattern: RegExp;
}> = [
  { classification: "credential", pattern: /\bBearer\s+[A-Za-z0-9._~-]{12,}\b/i },
  { classification: "secret", pattern: /-----BEGIN [A-Z ]+PRIVATE KEY-----/ },
  { classification: "secret", pattern: /\b(?:sk|rk|pk)_[A-Za-z0-9_-]{12,}\b/i },
  { classification: "direct-identifier", pattern: /\b\d{3}-\d{2}-\d{4}\b/ },
  { classification: "direct-identifier", pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i },
  { classification: "phi", pattern: /\b(?:patient\s+name|medical\s+record|diagnosis|treatment)\s*[:=]/i },
  { classification: "phi", pattern: /\bMRN\s*[:#-]?\s*[A-Za-z0-9-]{4,}\b/i }
];
const sensitiveKeyPattern = /(?:patient.?name|medical.?record|mrn|ssn|date.?of.?birth|dob|email|phone|address|authorization|cookie|session|jwt|bearer|api.?key|client.?secret|service.?role|access.?token|refresh.?token|password|private.?key|secret)/i;
const secretKeyPattern = /(?:authorization|cookie|session|jwt|bearer|key|token|password|secret|service.?role)/i;
const idPattern = /^[A-Za-z0-9][A-Za-z0-9._:-]{2,159}$/;
const payloadKeyPattern = /^[A-Za-z_][A-Za-z0-9_.:-]{0,159}$/;
export const p34EgressChannels = [
  "model-prompt", "agent-tool", "http-egress", "log", "telemetry", "connector", "proof-packet",
  "investor-artifact", "public-api", "api-response"
] as const satisfies readonly P34EgressChannel[];
const channels = new Set<P34EgressChannel>(p34EgressChannels);
const dataClassifications = new Set<P34EgressDataClassification>([
  "public", "synthetic-no-phi", "metadata-no-phi", "phi", "secret", "unknown"
]);
const maximumDepth = 8;
const maximumEntries = 1_000;
const maximumArrayLength = 100;
const maximumObjectKeys = 100;
const maximumStringLength = 4_096;

function isBoundedIdentifier(value: unknown): value is string {
  return typeof value === "string" && idPattern.test(value);
}

function inspectString(value: string) {
  return blockedValuePatterns
    .filter((entry) => entry.pattern.test(value))
    .map((entry) => entry.classification);
}

type InspectionState = {
  findings: Array<{
    path: string;
    classification: P34EgressFirewallDecision["detectedClasses"][number];
  }>;
  reasonCodes: string[];
  seen: WeakSet<object>;
  entries: number;
};

function sanitize(value: unknown, path: string, state: InspectionState, depth = 0): unknown {
  state.entries += 1;
  if (state.entries > maximumEntries) {
    state.reasonCodes.push("PAYLOAD_ENTRY_LIMIT_EXCEEDED");
    return "[REDACTED]";
  }
  if (depth > maximumDepth) {
    state.reasonCodes.push("PAYLOAD_DEPTH_LIMIT_EXCEEDED");
    return "[REDACTED]";
  }
  if (typeof value === "string") {
    if (value.length > maximumStringLength) {
      state.reasonCodes.push("PAYLOAD_STRING_LIMIT_EXCEEDED");
      return "[REDACTED]";
    }
    const classifications = inspectString(value);
    for (const classification of classifications) state.findings.push({ path, classification });
    return classifications.length ? "[REDACTED]" : value;
  }
  if (value === null || typeof value === "number" || typeof value === "boolean") return value;
  if (Array.isArray(value)) {
    if (value.length > maximumArrayLength) {
      state.reasonCodes.push("PAYLOAD_ARRAY_LIMIT_EXCEEDED");
      return "[REDACTED]";
    }
    if (state.seen.has(value)) {
      state.reasonCodes.push("PAYLOAD_CYCLE_DETECTED");
      return "[REDACTED]";
    }
    state.seen.add(value);
    return value.map((item, index) => sanitize(item, `${path}[${index}]`, state, depth + 1));
  }
  if (value && typeof value === "object") {
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      state.reasonCodes.push("PAYLOAD_TYPE_UNSUPPORTED");
      return "[REDACTED]";
    }
    if (state.seen.has(value)) {
      state.reasonCodes.push("PAYLOAD_CYCLE_DETECTED");
      return "[REDACTED]";
    }
    state.seen.add(value);
    const entries = Object.entries(value);
    if (entries.length > maximumObjectKeys) {
      state.reasonCodes.push("PAYLOAD_OBJECT_LIMIT_EXCEEDED");
      return "[REDACTED]";
    }
    return Object.fromEntries(entries.map(([key, item], index) => {
      const safeKey = payloadKeyPattern.test(key) ? key : `redacted-key-${index}`;
      if (safeKey !== key) state.reasonCodes.push("PAYLOAD_KEY_INVALID");
      const itemPath = path ? `${path}.${safeKey}` : safeKey;
      if (sensitiveKeyPattern.test(key)) {
        state.findings.push({
          path: itemPath,
          classification: secretKeyPattern.test(key) ? "secret" : "phi"
        });
        return [safeKey, "[REDACTED]"];
      }
      return [safeKey, sanitize(item, itemPath, state, depth + 1)];
    }));
  }
  state.reasonCodes.push("PAYLOAD_TYPE_UNSUPPORTED");
  return "[REDACTED]";
}

export function evaluateP34EgressFirewall(input: {
  channel: P34EgressChannel;
  dataClassification: P34EgressDataClassification;
  payload: unknown;
  purpose: string;
  tenantId: string;
}): P34EgressFirewallDecision {
  const record = (input && typeof input === "object" ? input : {}) as Partial<typeof input>;
  const state: InspectionState = {
    findings: [],
    reasonCodes: [],
    seen: new WeakSet<object>(),
    entries: 0
  };
  if (record !== input) state.reasonCodes.push("EGRESS_INPUT_INVALID");
  const channelValid = channels.has(record.channel as P34EgressChannel);
  const classificationValid = dataClassifications.has(record.dataClassification as P34EgressDataClassification);
  const channel = channelValid ? record.channel as P34EgressChannel : "public-api";
  const declaredDataClassification = classificationValid ? record.dataClassification as P34EgressDataClassification : "unknown";
  if (!channelValid) state.reasonCodes.push("EGRESS_CHANNEL_INVALID");
  if (!classificationValid) state.reasonCodes.push("EGRESS_DATA_CLASSIFICATION_INVALID");
  if (!isBoundedIdentifier(record.purpose) || !isBoundedIdentifier(record.tenantId)) {
    state.reasonCodes.push("EGRESS_SCOPE_INVALID");
  }
  if (declaredDataClassification === "phi") state.reasonCodes.push("DECLARED_PHI_EGRESS_BLOCKED");
  if (declaredDataClassification === "secret") state.reasonCodes.push("DECLARED_SECRET_EGRESS_BLOCKED");
  if (declaredDataClassification === "unknown") state.reasonCodes.push("DATA_CLASSIFICATION_UNKNOWN");

  let inspectedPayload: unknown = "[REDACTED]";
  try {
    inspectedPayload = sanitize(record.payload, "payload", state);
  } catch {
    state.reasonCodes.push("PAYLOAD_INSPECTION_FAILED");
  }
  const inspectionFailure = state.reasonCodes.some((reason) =>
    reason.startsWith("PAYLOAD_") || reason.startsWith("EGRESS_") || reason.startsWith("DECLARED_") ||
    reason === "DATA_CLASSIFICATION_UNKNOWN"
  );
  const sanitizedPayload = inspectionFailure ? "[REDACTED]" : inspectedPayload;
  const declaredSensitiveClass = declaredDataClassification === "phi"
    ? "phi" as const
    : declaredDataClassification === "secret"
      ? "secret" as const
      : null;
  const detectedClasses = [...new Set([
    ...state.findings.map((finding) => finding.classification),
    ...(declaredSensitiveClass ? [declaredSensitiveClass] : [])
  ])].sort();
  const detectedPaths = [...new Set(state.findings.map(
    (finding) => `path-${createClinicalEvidenceHash(finding.path).slice(0, 16)}`
  ))].sort();
  const sanitizableChannel = channel === "log" || channel === "telemetry";
  if (state.findings.length) {
    state.reasonCodes.push(sanitizableChannel ? "SENSITIVE_FIELDS_REDACTED" : "SENSITIVE_EGRESS_BLOCKED");
  }
  const reasonCodes = [...new Set(state.reasonCodes)].sort();
  const decision = inspectionFailure
    ? "BLOCK" as const
    : state.findings.length
      ? sanitizableChannel ? "REQUIRE_HUMAN" as const : "BLOCK" as const
      : "ALLOW" as const;
  const payload = {
    channel,
    declaredDataClassification,
    purpose: isBoundedIdentifier(record.purpose) ? record.purpose : "invalid",
    tenantIdHash: createClinicalEvidenceHash(isBoundedIdentifier(record.tenantId) ? record.tenantId : "invalid"),
    sanitizedPayloadHash: createClinicalEvidenceHash(sanitizedPayload),
    detectedClasses,
    detectedPaths,
    decision,
    reasonCodes,
    inspectionComplete: !inspectionFailure,
    rawSensitiveInputDetected: state.findings.length > 0 || declaredSensitiveClass !== null
  };
  return {
    decision,
    channel,
    declaredDataClassification,
    detectedClasses,
    detectedPaths,
    sanitizedPayload,
    inspectionComplete: !inspectionFailure,
    rawSensitiveInputDetected: state.findings.length > 0 || declaredSensitiveClass !== null,
    forwardingAuthorized: false,
    containsRawPhi: false,
    containsSecrets: false,
    reasonCodes,
    decisionHash: createClinicalEvidenceHash({ type: "p34-egress-firewall", payload })
  };
}
