import { createClinicalEvidenceHash } from "./clinicalEvidenceControls";

export const clinicalAgentSreVersion = "scrimed-clinical-agent-sre-v1-2026-07-17";
export const clinicalAgentSreBoundary =
  "SCRIMED Clinical Agent SRE evaluates synthetic, metadata-only reliability controls. It does not prove production availability, authorize live PHI, expose chain-of-thought, activate regional failover, or grant clinical, connector, payer, or EHR authority.";

export type ClinicalAgentSreSnapshot = {
  workloadId: string;
  tenantId: string;
  traceId: string;
  workloadIsolation: boolean;
  tenantIsolation: boolean;
  signedModelArtifact: boolean;
  signedToolArtifacts: boolean;
  leastPrivilegeCredentialScope: boolean;
  queueDepth: number;
  queueCapacity: number;
  queueAgeMs: number;
  timeoutMs: number;
  retryCount: number;
  maximumRetries: number;
  circuitState: "closed" | "open" | "half-open";
  failoverMode: "not-configured" | "configured-disabled" | "synthetic-tested";
  latencySamplesMs: number[];
  requestCount: number;
  successCount: number;
  errorCount: number;
  acceptedOutcomeCount: number;
  totalEstimatedCostUsd: number;
  overrideCount: number;
  abstentionCount: number;
  safetyEventCount: number;
  worstCellStatus: "pass" | "restricted" | "blocked";
  evidenceCompletenessPercent: number;
  modelVersion: string;
  promptVersion: string;
  policyVersion: string;
  toolVersions: string[];
  telemetry: Record<string, string | number | boolean | null>;
  syntheticOnly: true;
  noPhi: true;
};

function percentile(values: number[], quantile: number) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * quantile) - 1)];
}

function containsSensitiveTelemetry(value: unknown, key = ""): boolean {
  const normalizedKey = key.toLowerCase();
  if (/patient|name|email|phone|address|dob|birth|mrn|ssn|token|secret|password|bearer|authorization|raw.?prompt|chain.?of.?thought/.test(normalizedKey)) {
    return true;
  }
  if (typeof value === "string" && /bearer\s+[a-z0-9._-]+|sk-[a-z0-9_-]+|\b\d{3}-\d{2}-\d{4}\b/i.test(value)) {
    return true;
  }
  if (Array.isArray(value)) return value.some((item) => containsSensitiveTelemetry(item, key));
  if (value && typeof value === "object") {
    return Object.entries(value).some(([entryKey, entryValue]) => containsSensitiveTelemetry(entryValue, entryKey));
  }
  return false;
}

export function validatePhiSafeAgentTelemetry(telemetry: Record<string, unknown>) {
  const safe = !containsSensitiveTelemetry(telemetry);
  return {
    safe,
    decision: safe ? "allow-metadata-telemetry" as const : "block-and-redact" as const,
    reason: safe
      ? "Telemetry contains operational metadata only."
      : "Telemetry contains a prohibited PHI, credential, raw-prompt, or chain-of-thought field or value."
  };
}

export function evaluateClinicalAgentSre(snapshot: ClinicalAgentSreSnapshot) {
  const blockers: string[] = [];
  const warnings: string[] = [];
  if (!snapshot.syntheticOnly || !snapshot.noPhi) blockers.push("runtime snapshot must be synthetic and no-PHI");
  if (!snapshot.workloadIsolation) blockers.push("workload isolation is not proven");
  if (!snapshot.tenantIsolation) blockers.push("tenant isolation is not proven");
  if (!snapshot.signedModelArtifact || !snapshot.signedToolArtifacts) blockers.push("model or tool artifact signature is missing");
  if (!snapshot.leastPrivilegeCredentialScope) blockers.push("least-privilege credential scope is not proven");
  if (snapshot.queueDepth > snapshot.queueCapacity) blockers.push("queue capacity is exceeded");
  if (snapshot.retryCount > snapshot.maximumRetries || snapshot.maximumRetries > 3) blockers.push("retry budget is exceeded or unbounded");
  if (snapshot.circuitState === "open") blockers.push("circuit breaker is open");
  if (snapshot.worstCellStatus === "blocked") blockers.push("worst material domain cell is blocked");
  if (snapshot.evidenceCompletenessPercent < 100) blockers.push("evidence packet is incomplete");
  if (!validatePhiSafeAgentTelemetry(snapshot.telemetry).safe) blockers.push("telemetry is not PHI/secret safe");
  if (snapshot.failoverMode !== "synthetic-tested") warnings.push("failover has not been tested in a synthetic recovery exercise");
  if (snapshot.queueAgeMs > snapshot.timeoutMs) warnings.push("queue age exceeds the workload timeout");
  if (snapshot.worstCellStatus === "restricted") warnings.push("worst material domain cell requires restricted use");

  const p50LatencyMs = percentile(snapshot.latencySamplesMs, 0.5);
  const p95LatencyMs = percentile(snapshot.latencySamplesMs, 0.95);
  const p99LatencyMs = percentile(snapshot.latencySamplesMs, 0.99);
  const availability = snapshot.requestCount > 0 ? snapshot.successCount / snapshot.requestCount : 0;
  const errorRate = snapshot.requestCount > 0 ? snapshot.errorCount / snapshot.requestCount : 0;
  const retryRate = snapshot.requestCount > 0 ? snapshot.retryCount / snapshot.requestCount : 0;
  const overrideRate = snapshot.requestCount > 0 ? snapshot.overrideCount / snapshot.requestCount : 0;
  const abstentionRate = snapshot.requestCount > 0 ? snapshot.abstentionCount / snapshot.requestCount : 0;
  const costPerAcceptedOutcome = snapshot.acceptedOutcomeCount > 0
    ? snapshot.totalEstimatedCostUsd / snapshot.acceptedOutcomeCount
    : null;
  const status = blockers.length ? "blocked" as const : warnings.length ? "restricted" as const : "synthetic-sre-ready" as const;

  return {
    status,
    releaseAuthority: "not-granted" as const,
    workloadId: snapshot.workloadId,
    tenantIdHash: createClinicalEvidenceHash({ tenantId: snapshot.tenantId }),
    traceId: snapshot.traceId,
    serviceLevels: {
      availability,
      p50LatencyMs,
      p95LatencyMs,
      p99LatencyMs,
      queueAgeMs: snapshot.queueAgeMs,
      errorRate,
      retryRate,
      costPerAcceptedOutcome,
      overrideRate,
      abstentionRate,
      safetyEventCount: snapshot.safetyEventCount,
      worstCellStatus: snapshot.worstCellStatus,
      evidenceCompletenessPercent: snapshot.evidenceCompletenessPercent
    },
    controls: {
      workloadIsolation: snapshot.workloadIsolation,
      tenantIsolation: snapshot.tenantIsolation,
      signedArtifacts: snapshot.signedModelArtifact && snapshot.signedToolArtifacts,
      leastPrivilege: snapshot.leastPrivilegeCredentialScope,
      backpressureWithinCapacity: snapshot.queueDepth <= snapshot.queueCapacity,
      boundedRetries: snapshot.retryCount <= snapshot.maximumRetries && snapshot.maximumRetries <= 3,
      circuitClosed: snapshot.circuitState === "closed",
      failoverSyntheticTested: snapshot.failoverMode === "synthetic-tested",
      phiSafeTelemetry: validatePhiSafeAgentTelemetry(snapshot.telemetry).safe,
      protectedChainOfThoughtStored: false as const
    },
    versions: {
      model: snapshot.modelVersion,
      prompt: snapshot.promptVersion,
      policy: snapshot.policyVersion,
      tools: snapshot.toolVersions
    },
    blockers,
    warnings,
    auditHash: createClinicalEvidenceHash({
      version: clinicalAgentSreVersion,
      workloadId: snapshot.workloadId,
      tenantId: snapshot.tenantId,
      traceId: snapshot.traceId,
      blockers,
      warnings,
      p50LatencyMs,
      p95LatencyMs,
      p99LatencyMs
    }),
    boundary: clinicalAgentSreBoundary
  };
}

export const syntheticClinicalAgentSreSnapshot: ClinicalAgentSreSnapshot = {
  workloadId: "synthetic-payeriq-review-workload",
  tenantId: "synthetic-tenant",
  traceId: "trace-synthetic-payeriq-sre",
  workloadIsolation: true,
  tenantIsolation: true,
  signedModelArtifact: true,
  signedToolArtifacts: true,
  leastPrivilegeCredentialScope: true,
  queueDepth: 2,
  queueCapacity: 100,
  queueAgeMs: 150,
  timeoutMs: 5_000,
  retryCount: 1,
  maximumRetries: 2,
  circuitState: "closed",
  failoverMode: "synthetic-tested",
  latencySamplesMs: [320, 410, 460, 520, 610, 750, 900, 1_100, 1_350, 1_700],
  requestCount: 10,
  successCount: 9,
  errorCount: 1,
  acceptedOutcomeCount: 8,
  totalEstimatedCostUsd: 2.4,
  overrideCount: 1,
  abstentionCount: 1,
  safetyEventCount: 0,
  worstCellStatus: "pass",
  evidenceCompletenessPercent: 100,
  modelVersion: "not-used-deterministic-rules",
  promptVersion: "not-used-enumerated-schema",
  policyVersion: "documentation-before-authorization-synthetic-v1",
  toolVersions: ["documentation-gap-evaluator-v1", "context-lens-v1"],
  telemetry: {
    route: "documentation-before-authorization",
    policyDecision: "human-review-required",
    providerCalls: 0,
    syntheticOnly: true
  },
  syntheticOnly: true,
  noPhi: true
};

export function getClinicalAgentSreSummary() {
  return {
    service: "scrimed-clinical-agent-sre",
    version: clinicalAgentSreVersion,
    status: "synthetic-sre-controls-active",
    evaluation: evaluateClinicalAgentSre(syntheticClinicalAgentSreSnapshot),
    boundary: clinicalAgentSreBoundary
  };
}
