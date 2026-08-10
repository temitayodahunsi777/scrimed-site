import { createAuditHash, redactForTelemetry } from "./audit";
import type { DataClassification, RiskLevel } from "./types";

export const scrimedAgentExecutionVersion = "scrimed-agent-execution-v2-2026-07-29";

export const scrimedAgentExecutionBoundary =
  "SCRIMED agent execution is ephemeral, tenant-isolated, default-deny, identity-bound, lease-scoped, PHI-redacted, and emergency-revocable. Experimental snapshots and forks are synthetic-only. No ambient credentials, unverified egress, self-escalation, self-approval, production policy mutation, or autonomous clinical authority is permitted.";

export type WorkloadIdentity = {
  identityId: string;
  tenantId: string;
  agentId: string;
  parentIdentityId: string | null;
  audience: "scrimed-agent-runtime";
  mtlsBindingHash: string;
  issuedAt: string;
  expiresAt: string;
  credentialMode: "short-lived-task-bound";
  identityHash: string;
};

export type AgentEnvironmentSpec = {
  environmentId: string;
  tenantId: string;
  purpose: string;
  dataClassification: DataClassification;
  syntheticOnly: true;
  ephemeral: true;
  networkEgressDefault: "deny";
  allowedDestinations: Array<{ destination: string; purpose: string }>;
  ambientCredentialsAllowed: false;
  limits: {
    cpuMillis: number;
    memoryBytes: number;
    wallTimeMs: number;
    maximumToolCalls: number;
    maximumTokens: number;
    maximumSpendUsd: number;
  };
  snapshotPolicy: "disabled" | "encrypted-synthetic-only";
  environmentHash: string;
};

export type CapabilityLease = {
  leaseId: string;
  identityId: string;
  tenantId: string;
  purpose: string;
  permittedTools: string[];
  permittedDestinations: string[];
  permittedDataClassifications: DataClassification[];
  maximumRisk: RiskLevel;
  issuedAt: string;
  expiresAt: string;
  parentLeaseId: string | null;
  state: "active" | "revoked" | "expired";
  leaseHash: string;
};

export type SnapshotManifest = {
  snapshotId: string;
  environmentId: string;
  tenantId: string;
  encrypted: true;
  encryptionKeyReferenceHash: string;
  stateArtifactDigests: string[];
  createdAt: string;
  expiresAt: string;
  containsSecrets: false;
  containsTokens: false;
  containsRawPhi: false;
  resumableInSyntheticModeOnly: true;
  manifestHash: string;
};

export type ForkGrant = {
  forkGrantId: string;
  parentEnvironmentId: string;
  childEnvironmentId: string;
  parentIdentityId: string;
  childIdentityId: string;
  parentLeaseId: string;
  childLeaseId: string;
  freshCredentialsRequired: true;
  parentTokenReuseAllowed: false;
  childPrivilegeSubsetVerified: boolean;
  issuedAt: string;
  expiresAt: string;
  grantHash: string;
};

export type ModelAccessPolicy = {
  policyId: string;
  allowedProviderIds: string[];
  allowedModelIds: string[];
  requiredDataResidency: string;
  maximumRisk: RiskLevel;
  directProviderAccessAllowed: false;
  centralRouterRequired: true;
  silentFallbackAllowed: false;
  policyHash: string;
};

export type ArtifactFingerprint = {
  artifactId: string;
  sha256: string;
  signatureStatus: "verified-synthetic" | "verification-required";
  signerReference: string | null;
  contentType: string;
  createdAt: string;
  fingerprintHash: string;
};

export type EmergencyRevocation = {
  revocationId: string;
  scope: "global" | "tenant" | "environment" | "identity" | "lease";
  targetId: string;
  reasonCode:
    | "operator-stop"
    | "runaway-agent"
    | "abnormal-tool-use"
    | "privilege-escalation"
    | "retry-storm"
    | "suspicious-access";
  activatedAt: string;
  activatedByIdentityHash: string;
  blocksNewActions: true;
  revokesActiveLeases: true;
  revocationHash: string;
};

export type AdmissionDecision = {
  decisionId: string;
  environmentId: string;
  identityId: string;
  leaseId: string;
  decision: "allow" | "deny";
  reasonCodes: string[];
  networkAccessGranted: boolean;
  toolExecutionGranted: boolean;
  modelAccessGranted: boolean;
  emergencyStopActive: boolean;
  evaluatedAt: string;
  auditHash: string;
};

export type AgentTraceEventType =
  | "intent"
  | "plan"
  | "model"
  | "retrieval"
  | "tool"
  | "approval"
  | "mutation"
  | "result"
  | "retry"
  | "cost";

export type AgentTraceEvent = {
  eventId: string;
  parentEventId: string | null;
  type: AgentTraceEventType;
  status: "planned" | "allowed" | "blocked" | "completed" | "failed";
  summary: string;
  metadata: Record<string, unknown>;
  occurredAt: string;
  eventHash: string;
};

export type AgentTrace = {
  traceId: string;
  tenantId: string;
  environmentId: string;
  identityId: string;
  correlationId: string;
  events: AgentTraceEvent[];
  completeCausalReconstruction: boolean;
  rawPhiRecorded: false;
  protectedChainOfThoughtStored: false;
  totalLatencyMs: number;
  totalCostUsd: number;
  traceHash: string;
};

export type RunReceipt = {
  receiptId: string;
  traceId: string;
  tenantId: string;
  environmentId: string;
  identityId: string;
  leaseId: string;
  inputDigest: string;
  outputDigest: string | null;
  selectedToolIds: string[];
  policyDecisionHashes: string[];
  evidenceReferences: string[];
  finalDisposition: "completed" | "blocked" | "failed" | "emergency-stopped";
  costUsd: number;
  latencyMs: number;
  containsSecrets: false;
  containsRawPhi: false;
  createdAt: string;
  receiptHash: string;
};

const hashPattern = /^[0-9a-f]{64}$/i;
const safeIdentifierPattern = /^[A-Za-z0-9][A-Za-z0-9._:/-]{2,159}$/;
const riskOrder: Record<RiskLevel, number> = { low: 0, moderate: 1, high: 2, prohibited: 3 };
const sensitivePattern =
  /(?:\b\d{3}-\d{2}-\d{4}\b|\bMRN\s*[:#=-]?\s*[A-Za-z0-9-]{4,32}\b|(?:\+?1[\s.-]?)?(?:\(\d{3}\)|\d{3})[\s.-]\d{3}[\s.-]\d{4}\b|\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b|bearer\s+[A-Za-z0-9._-]+|(?:token|secret|password|credential)\s*[:=])/i;

function validIso(value: string) {
  return Number.isFinite(Date.parse(value));
}

function canonical(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort();
}

function subset<T>(child: T[], parent: T[]) {
  return child.every((entry) => parent.includes(entry));
}

function assertSafeIdentifier(value: string, label: string) {
  if (!safeIdentifierPattern.test(value) || sensitivePattern.test(value)) {
    throw new Error(`${label} must be a bounded metadata identifier`);
  }
}

export function createWorkloadIdentity(
  input: Omit<WorkloadIdentity, "audience" | "credentialMode" | "identityHash">
): WorkloadIdentity {
  for (const [label, value] of [
    ["identityId", input.identityId],
    ["tenantId", input.tenantId],
    ["agentId", input.agentId]
  ] as const) assertSafeIdentifier(value, label);
  if (input.parentIdentityId) assertSafeIdentifier(input.parentIdentityId, "parentIdentityId");
  if (!hashPattern.test(input.mtlsBindingHash)) throw new Error("Workload identity requires a cryptographic service binding");
  if (!validIso(input.issuedAt) || !validIso(input.expiresAt) || Date.parse(input.expiresAt) <= Date.parse(input.issuedAt)) {
    throw new Error("Workload identity timestamps are invalid");
  }
  if (Date.parse(input.expiresAt) - Date.parse(input.issuedAt) > 60 * 60 * 1000) {
    throw new Error("Workload identity lifetime cannot exceed one hour");
  }
  const base = {
    ...input,
    audience: "scrimed-agent-runtime" as const,
    credentialMode: "short-lived-task-bound" as const
  };
  return { ...base, identityHash: createAuditHash({ type: "workload-identity", base }) };
}

export function createAgentEnvironmentSpec(
  input: Omit<AgentEnvironmentSpec, "syntheticOnly" | "ephemeral" | "networkEgressDefault" | "ambientCredentialsAllowed" | "environmentHash">
): AgentEnvironmentSpec {
  assertSafeIdentifier(input.environmentId, "environmentId");
  assertSafeIdentifier(input.tenantId, "tenantId");
  if (input.dataClassification === "phi-blocked" || input.dataClassification === "unknown") {
    throw new Error("Current contained environments are synthetic and cannot admit PHI or unknown data");
  }
  for (const value of Object.values(input.limits)) {
    if (!Number.isFinite(value) || value < 0) throw new Error("Agent environment limits must be finite and nonnegative");
  }
  input.allowedDestinations.forEach((entry) => {
    if (!entry.destination.trim() || !entry.purpose.trim()) throw new Error("Egress allowlist entries require destination and purpose");
  });
  const base = {
    ...input,
    allowedDestinations: [...input.allowedDestinations].sort((left, right) =>
      `${left.destination}:${left.purpose}`.localeCompare(`${right.destination}:${right.purpose}`)
    ),
    syntheticOnly: true as const,
    ephemeral: true as const,
    networkEgressDefault: "deny" as const,
    ambientCredentialsAllowed: false as const
  };
  return { ...base, environmentHash: createAuditHash({ type: "agent-environment", base }) };
}

export function createCapabilityLease(
  input: Omit<CapabilityLease, "state" | "leaseHash">,
  parent?: CapabilityLease
): CapabilityLease {
  for (const [label, value] of [
    ["leaseId", input.leaseId],
    ["identityId", input.identityId],
    ["tenantId", input.tenantId]
  ] as const) assertSafeIdentifier(value, label);
  if (!validIso(input.issuedAt) || !validIso(input.expiresAt) || Date.parse(input.expiresAt) <= Date.parse(input.issuedAt)) {
    throw new Error("Capability lease timestamps are invalid");
  }
  if (parent) {
    if (input.tenantId !== parent.tenantId || input.parentLeaseId !== parent.leaseId) {
      throw new Error("Child capability lease must bind its parent and tenant");
    }
    if (
      !subset(input.permittedTools, parent.permittedTools) ||
      !subset(input.permittedDestinations, parent.permittedDestinations) ||
      !subset(input.permittedDataClassifications, parent.permittedDataClassifications) ||
      riskOrder[input.maximumRisk] > riskOrder[parent.maximumRisk] ||
      Date.parse(input.expiresAt) > Date.parse(parent.expiresAt)
    ) {
      throw new Error("Child capability lease cannot exceed parent privileges");
    }
  }
  const base = {
    ...input,
    permittedTools: canonical(input.permittedTools),
    permittedDestinations: canonical(input.permittedDestinations),
    permittedDataClassifications: [...new Set(input.permittedDataClassifications)].sort(),
    state: "active" as const
  };
  return { ...base, leaseHash: createAuditHash({ type: "capability-lease", base }) };
}

export function createSnapshotManifest(
  input: Omit<
    SnapshotManifest,
    "encrypted" | "containsSecrets" | "containsTokens" | "containsRawPhi" | "resumableInSyntheticModeOnly" | "manifestHash"
  >
): SnapshotManifest {
  if (!hashPattern.test(input.encryptionKeyReferenceHash)) {
    throw new Error("Snapshot requires an opaque encryption-key reference hash");
  }
  if (!input.stateArtifactDigests.length || input.stateArtifactDigests.some((digest) => !hashPattern.test(digest))) {
    throw new Error("Snapshot state must contain content-addressed digests only");
  }
  if (!validIso(input.createdAt) || !validIso(input.expiresAt) || Date.parse(input.expiresAt) <= Date.parse(input.createdAt)) {
    throw new Error("Snapshot timestamps are invalid");
  }
  if (Date.parse(input.expiresAt) - Date.parse(input.createdAt) > 24 * 60 * 60 * 1000) {
    throw new Error("Synthetic snapshot TTL cannot exceed 24 hours");
  }
  const base = {
    ...input,
    stateArtifactDigests: canonical(input.stateArtifactDigests),
    encrypted: true as const,
    containsSecrets: false as const,
    containsTokens: false as const,
    containsRawPhi: false as const,
    resumableInSyntheticModeOnly: true as const
  };
  return { ...base, manifestHash: createAuditHash({ type: "snapshot-manifest", base }) };
}

export function createForkGrant(input: {
  forkGrantId: string;
  parentEnvironment: AgentEnvironmentSpec;
  childEnvironment: AgentEnvironmentSpec;
  parentIdentity: WorkloadIdentity;
  childIdentity: WorkloadIdentity;
  parentLease: CapabilityLease;
  childLease: CapabilityLease;
  issuedAt: string;
  expiresAt: string;
}): ForkGrant {
  if (
    !validIso(input.issuedAt) ||
    !validIso(input.expiresAt) ||
    Date.parse(input.expiresAt) <= Date.parse(input.issuedAt)
  ) {
    throw new Error("Fork grant timestamps are invalid");
  }
  if (
    input.parentIdentity.identityId === input.childIdentity.identityId ||
    input.parentIdentity.mtlsBindingHash === input.childIdentity.mtlsBindingHash
  ) {
    throw new Error("Forked environments require a unique identity and fresh credentials");
  }
  if (
    input.childIdentity.parentIdentityId !== input.parentIdentity.identityId ||
    input.childLease.parentLeaseId !== input.parentLease.leaseId ||
    input.parentEnvironment.tenantId !== input.childEnvironment.tenantId ||
    input.parentEnvironment.tenantId !== input.parentIdentity.tenantId ||
    input.parentEnvironment.tenantId !== input.childIdentity.tenantId ||
    input.parentEnvironment.tenantId !== input.parentLease.tenantId ||
    input.parentEnvironment.tenantId !== input.childLease.tenantId ||
    input.parentLease.identityId !== input.parentIdentity.identityId ||
    input.childLease.identityId !== input.childIdentity.identityId
  ) {
    throw new Error("Fork lineage is invalid");
  }
  const issuedAt = Date.parse(input.issuedAt);
  const expiresAt = Date.parse(input.expiresAt);
  if (
    input.parentLease.state !== "active" ||
    input.childLease.state !== "active" ||
    issuedAt < Date.parse(input.parentIdentity.issuedAt) ||
    issuedAt < Date.parse(input.childIdentity.issuedAt) ||
    issuedAt < Date.parse(input.parentLease.issuedAt) ||
    issuedAt < Date.parse(input.childLease.issuedAt) ||
    expiresAt > Date.parse(input.parentIdentity.expiresAt) ||
    expiresAt > Date.parse(input.childIdentity.expiresAt) ||
    expiresAt > Date.parse(input.parentLease.expiresAt) ||
    expiresAt > Date.parse(input.childLease.expiresAt)
  ) {
    throw new Error("Fork grant requires active identity and lease lineage for its full lifetime");
  }
  const childSubset =
    subset(input.childLease.permittedTools, input.parentLease.permittedTools) &&
    subset(input.childLease.permittedDestinations, input.parentLease.permittedDestinations) &&
    subset(input.childLease.permittedDataClassifications, input.parentLease.permittedDataClassifications) &&
    riskOrder[input.childLease.maximumRisk] <= riskOrder[input.parentLease.maximumRisk];
  if (!childSubset) throw new Error("Forked child privileges cannot exceed parent privileges");
  const base = {
    forkGrantId: input.forkGrantId,
    parentEnvironmentId: input.parentEnvironment.environmentId,
    childEnvironmentId: input.childEnvironment.environmentId,
    parentIdentityId: input.parentIdentity.identityId,
    childIdentityId: input.childIdentity.identityId,
    parentLeaseId: input.parentLease.leaseId,
    childLeaseId: input.childLease.leaseId,
    freshCredentialsRequired: true as const,
    parentTokenReuseAllowed: false as const,
    childPrivilegeSubsetVerified: true,
    issuedAt: input.issuedAt,
    expiresAt: input.expiresAt
  };
  return { ...base, grantHash: createAuditHash({ type: "fork-grant", base }) };
}

export function createModelAccessPolicy(
  input: Omit<ModelAccessPolicy, "directProviderAccessAllowed" | "centralRouterRequired" | "silentFallbackAllowed" | "policyHash">
): ModelAccessPolicy {
  const base = {
    ...input,
    allowedProviderIds: canonical(input.allowedProviderIds),
    allowedModelIds: canonical(input.allowedModelIds),
    directProviderAccessAllowed: false as const,
    centralRouterRequired: true as const,
    silentFallbackAllowed: false as const
  };
  return { ...base, policyHash: createAuditHash({ type: "model-access-policy", base }) };
}

export function createArtifactFingerprint(
  input: Omit<ArtifactFingerprint, "fingerprintHash">
): ArtifactFingerprint {
  if (!hashPattern.test(input.sha256) || !validIso(input.createdAt)) {
    throw new Error("Artifact fingerprints require SHA-256 identity and a valid timestamp");
  }
  const base = { ...input };
  return { ...base, fingerprintHash: createAuditHash({ type: "artifact-fingerprint", base }) };
}

export function activateEmergencyRevocation(
  input: Omit<EmergencyRevocation, "blocksNewActions" | "revokesActiveLeases" | "revocationHash">
): EmergencyRevocation {
  if (!hashPattern.test(input.activatedByIdentityHash) || !validIso(input.activatedAt)) {
    throw new Error("Emergency revocation requires attributable identity and time");
  }
  const base = {
    ...input,
    blocksNewActions: true as const,
    revokesActiveLeases: true as const
  };
  return { ...base, revocationHash: createAuditHash({ type: "emergency-revocation", base }) };
}

function revocationApplies(
  revocation: EmergencyRevocation,
  input: { environment: AgentEnvironmentSpec; identity: WorkloadIdentity; lease: CapabilityLease }
) {
  return (
    revocation.scope === "global" ||
    (revocation.scope === "tenant" && revocation.targetId === input.environment.tenantId) ||
    (revocation.scope === "environment" && revocation.targetId === input.environment.environmentId) ||
    (revocation.scope === "identity" && revocation.targetId === input.identity.identityId) ||
    (revocation.scope === "lease" && revocation.targetId === input.lease.leaseId)
  );
}

export function evaluateAgentAdmission(input: {
  decisionId: string;
  environment: AgentEnvironmentSpec;
  identity: WorkloadIdentity;
  lease: CapabilityLease;
  modelPolicy: ModelAccessPolicy;
  requestedTool: string;
  requestedDestination: string | null;
  requestedDestinationPurpose: string | null;
  dataClassification: DataClassification;
  risk: RiskLevel;
  evaluatedAt: string;
  emergencyRevocations?: EmergencyRevocation[];
}): AdmissionDecision {
  const reasons: string[] = [];
  const emergencyStopActive = (input.emergencyRevocations ?? []).some((revocation) =>
    revocationApplies(revocation, input)
  );
  if (emergencyStopActive) reasons.push("EMERGENCY_STOP_ACTIVE");
  if (
    input.environment.tenantId !== input.identity.tenantId ||
    input.environment.tenantId !== input.lease.tenantId
  ) reasons.push("TENANT_ISOLATION_VIOLATION");
  if (input.identity.identityId !== input.lease.identityId) reasons.push("LEASE_IDENTITY_MISMATCH");
  if (input.environment.dataClassification !== input.dataClassification) {
    reasons.push("ENVIRONMENT_DATA_CLASS_MISMATCH");
  }
  if (input.dataClassification === "phi-blocked" || input.dataClassification === "unknown") {
    reasons.push("UNSUPPORTED_DATA_CLASSIFICATION");
  }
  if (
    !validIso(input.evaluatedAt) ||
    Date.parse(input.identity.expiresAt) <= Date.parse(input.evaluatedAt) ||
    Date.parse(input.lease.expiresAt) <= Date.parse(input.evaluatedAt) ||
    input.lease.state !== "active"
  ) reasons.push("IDENTITY_OR_LEASE_EXPIRED");
  if (!input.lease.permittedTools.includes(input.requestedTool)) reasons.push("TOOL_NOT_LEASED");
  if (!input.lease.permittedDataClassifications.includes(input.dataClassification)) {
    reasons.push("DATA_CLASS_NOT_LEASED");
  }
  if (riskOrder[input.risk] > riskOrder[input.lease.maximumRisk]) reasons.push("RISK_EXCEEDS_LEASE");
  if (input.requestedDestination) {
    const environmentAllows = input.environment.allowedDestinations.some(
      (entry) =>
        entry.destination === input.requestedDestination &&
        entry.purpose === input.requestedDestinationPurpose
    );
    if (!environmentAllows || !input.lease.permittedDestinations.includes(input.requestedDestination)) {
      reasons.push("UNVERIFIED_EGRESS_DENIED");
    }
  }
  if (input.modelPolicy.directProviderAccessAllowed !== false || !input.modelPolicy.centralRouterRequired) {
    reasons.push("CENTRAL_MODEL_ROUTER_REQUIRED");
  }
  const denied = reasons.length > 0;
  const base = {
    decisionId: input.decisionId,
    environmentId: input.environment.environmentId,
    identityId: input.identity.identityId,
    leaseId: input.lease.leaseId,
    decision: denied ? ("deny" as const) : ("allow" as const),
    reasonCodes: denied ? [...new Set(reasons)].sort() : ["CONTAINED_EXECUTION_ADMITTED"],
    networkAccessGranted: !denied && input.requestedDestination !== null,
    toolExecutionGranted: !denied,
    modelAccessGranted: !denied,
    emergencyStopActive,
    evaluatedAt: input.evaluatedAt
  };
  return { ...base, auditHash: createAuditHash({ type: "agent-admission", request: input, decision: base }) };
}

export function createAgentTrace(
  input: Omit<AgentTrace, "completeCausalReconstruction" | "rawPhiRecorded" | "protectedChainOfThoughtStored" | "traceHash">
): AgentTrace {
  const safeEvents = input.events.map((event) => {
    if (!validIso(event.occurredAt) || sensitivePattern.test(event.summary)) {
      throw new Error("Agent trace events must be PHI-safe metadata with valid timestamps");
    }
    const metadata = redactForTelemetry(event.metadata) as Record<string, unknown>;
    const base = { ...event, metadata };
    delete (base as Partial<AgentTraceEvent>).eventHash;
    return { ...base, eventHash: createAuditHash({ type: "agent-trace-event", base }) };
  });
  const eventTypes = new Set(safeEvents.map((event) => event.type));
  const completeCausalReconstruction = [
    "intent",
    "plan",
    "model",
    "retrieval",
    "tool",
    "approval",
    "mutation",
    "result",
    "cost"
  ].every((type) => eventTypes.has(type as AgentTraceEventType));
  const base = {
    ...input,
    events: safeEvents,
    completeCausalReconstruction,
    rawPhiRecorded: false as const,
    protectedChainOfThoughtStored: false as const
  };
  return { ...base, traceHash: createAuditHash({ type: "agent-trace", base }) };
}

export function createRunReceipt(
  input: Omit<RunReceipt, "containsSecrets" | "containsRawPhi" | "receiptHash">
): RunReceipt {
  if (!hashPattern.test(input.inputDigest) || (input.outputDigest && !hashPattern.test(input.outputDigest))) {
    throw new Error("Run receipts require digest-only inputs and outputs");
  }
  const base = {
    ...input,
    selectedToolIds: canonical(input.selectedToolIds),
    policyDecisionHashes: canonical(input.policyDecisionHashes),
    evidenceReferences: canonical(input.evidenceReferences),
    containsSecrets: false as const,
    containsRawPhi: false as const
  };
  return { ...base, receiptHash: createAuditHash({ type: "agent-run-receipt", base }) };
}

export function getAgentExecutionSummary() {
  return {
    version: scrimedAgentExecutionVersion,
    isolation: "ephemeral-tenant-isolated",
    egress: "default-deny-purpose-allowlist",
    credentials: "short-lived-task-bound-no-ambient-credentials",
    snapshots: "encrypted-synthetic-only-strict-ttl",
    forks: "fresh-identity-fresh-credentials-subset-privileges",
    telemetry: "causal-otel-compatible-phi-redacted",
    emergencyStop: "blocks-new-actions-and-revokes-leases",
    productionExecutionAuthority: false,
    boundary: scrimedAgentExecutionBoundary
  } as const;
}
