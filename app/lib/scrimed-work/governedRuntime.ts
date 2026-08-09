import { createAuditHash, redactForTelemetry } from "./audit";
import type { DataClassification, RiskLevel, ToolCategory, WorkAgentRole } from "./types";

export const scrimedGovernedRuntimeVersion = "scrimed-governed-runtime-v1-2026-07-20";

export const scrimedGovernedRuntimeBoundary =
  "SCRIMED governed runtime is deny-by-default and metadata-only. It does not authorize live PHI, autonomous clinical care, payer submission, EHR writeback, production mutation, deployment, migration, or external distribution.";

export type AuthorizationStage = "read" | "propose" | "approve" | "execute" | "verify";
export type ExecutionEnvironment = "local" | "test" | "staging" | "production";
export type RuntimeDecision = "allow" | "deny" | "require_human_approval";

export type CapabilityManifest = {
  manifestId: string;
  actor: {
    actorId: string;
    actorType: "user" | "agent" | "service";
    role: string;
    authenticated: boolean;
  };
  tenantId: string;
  purpose: string;
  permittedTools: string[];
  permittedResources: string[];
  permittedDataClasses: DataClassification[];
  maximumRisk: RiskLevel;
  limits: {
    requestsPerMinute: number;
    maximumTokens: number;
    maximumDurationMs: number;
    maximumSpendUsd: number;
    maximumToolCalls: number;
  };
  prohibitedActions: string[];
  issuedAt: string;
  expiresAt: string;
  manifestHash: string;
};

export type CapabilityManifestInput = Omit<CapabilityManifest, "manifestHash">;

export type ExecutionGrant = {
  grantId: string;
  issuer: string;
  audience: string;
  subject: string;
  tenantId: string;
  purpose: string;
  scope: {
    tools: string[];
    resources: string[];
    dataClasses: DataClassification[];
    action: string;
    stage: Extract<AuthorizationStage, "execute">;
  };
  candidateFingerprint: string;
  sourceFingerprint: string;
  environment: ExecutionEnvironment;
  issuedAt: string;
  expiresAt: string;
  nonce: string;
  requiredApprovalReferences: string[];
  releaseAuthorityGranted: false;
  grantHash: string;
};

export type ExecutionGrantInput = Omit<ExecutionGrant, "grantHash" | "releaseAuthorityGranted">;

export type RuntimeBudgetUsage = {
  requestsThisMinute: number;
  tokens: number;
  durationMs: number;
  spendUsd: number;
  toolCalls: number;
};

export type GovernedExecutionRequest = {
  stage: AuthorizationStage;
  action: string;
  toolId: string;
  toolCategory: ToolCategory;
  resource: string;
  dataClassification: DataClassification;
  riskLevel: RiskLevel;
  tenantId: string;
  actorId: string;
  environment: ExecutionEnvironment;
  candidateFingerprint: string;
  sourceFingerprint: string;
  idempotencyKey: string | null;
  budgetUsage: RuntimeBudgetUsage;
  evidencePointers: string[];
  humanApprovalReferences: string[];
};

export type GovernedExecutionDecision = {
  decision: RuntimeDecision;
  reasonCodes: string[];
  stage: AuthorizationStage;
  policyVersion: typeof scrimedGovernedRuntimeVersion;
  manifestId: string;
  grantId: string | null;
  executionAuthorized: boolean;
  replayProtected: boolean;
  humanApprovalRequired: boolean;
  auditHash: string;
};

export type GovernedExecutionReceipt = {
  receiptId: string;
  tenantId: string;
  actorId: string;
  purpose: string;
  stage: AuthorizationStage;
  action: string;
  toolId: string;
  policyDecisionHash: string;
  inputDigest: string;
  outputDigest: string | null;
  evidencePointers: string[];
  costUsd: number;
  latencyMs: number;
  finalDisposition: "allowed" | "denied" | "awaiting-human" | "verified" | "failed";
  containsRawPhi: false;
  containsSecrets: false;
  correlationId: string;
  previousReceiptHash: string | null;
  createdAt: string;
  receiptHash: string;
};

export interface ReplayProtectionStore {
  has(nonce: string): boolean;
  record(nonce: string, expiresAt: string): void;
}

export function createInMemoryReplayProtectionStore(): ReplayProtectionStore {
  const entries = new Map<string, string>();
  return {
    has(nonce) {
      return entries.has(nonce);
    },
    record(nonce, expiresAt) {
      entries.set(nonce, expiresAt);
    }
  };
}

const sha256Pattern = /^[0-9a-f]{64}$/i;
const safeIdentifierPattern = /^[A-Za-z0-9][A-Za-z0-9._:-]{2,159}$/;
const riskOrder: Record<RiskLevel, number> = { low: 0, moderate: 1, high: 2, prohibited: 3 };
const consequentialCategories = new Set<ToolCategory>([
  "consequential-write",
  "external-communication",
  "clinical",
  "financial",
  "identity",
  "scheduling"
]);
const currentPolicyHardBlocks = [
  /\blive[- ]?phi\b/i,
  /\bdiagnos(?:e|is|tic)\b/i,
  /\btreat(?:ment|ing)?\b/i,
  /\bprescrib(?:e|ing)\b/i,
  /\btriage[- ]?disposition\b/i,
  /\bpayer[- ]?submission\b/i,
  /\behr[- ]?writeback\b/i,
  /\bproduction[- ]?(?:deploy|migration|mutation)\b/i,
  /\bexternal[- ]?distribution\b/i
];

function isIsoTimestamp(value: string) {
  return Number.isFinite(Date.parse(value));
}

function canonicalStrings(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort();
}

function manifestPayload(input: CapabilityManifestInput): CapabilityManifestInput {
  return {
    ...input,
    permittedTools: canonicalStrings(input.permittedTools),
    permittedResources: canonicalStrings(input.permittedResources),
    permittedDataClasses: [...new Set(input.permittedDataClasses)].sort(),
    prohibitedActions: canonicalStrings(input.prohibitedActions)
  };
}

export function createCapabilityManifest(input: CapabilityManifestInput): CapabilityManifest {
  const payload = manifestPayload(input);
  if (!safeIdentifierPattern.test(payload.manifestId) || !safeIdentifierPattern.test(payload.tenantId)) {
    throw new Error("Capability manifest requires bounded manifest and tenant identifiers");
  }
  if (!payload.actor.authenticated || !safeIdentifierPattern.test(payload.actor.actorId) || !payload.purpose.trim()) {
    throw new Error("Capability manifest requires an authenticated, attributable actor and purpose");
  }
  if (!isIsoTimestamp(payload.issuedAt) || !isIsoTimestamp(payload.expiresAt) || Date.parse(payload.expiresAt) <= Date.parse(payload.issuedAt)) {
    throw new Error("Capability manifest timestamps are invalid");
  }
  const limits = Object.values(payload.limits);
  if (limits.some((value) => !Number.isFinite(value) || value < 0)) {
    throw new Error("Capability manifest limits must be finite and nonnegative");
  }
  return { ...payload, manifestHash: createAuditHash({ type: "capability-manifest", payload }) };
}

function executionGrantPayload(input: ExecutionGrantInput) {
  return {
    ...input,
    scope: {
      ...input.scope,
      tools: canonicalStrings(input.scope.tools),
      resources: canonicalStrings(input.scope.resources),
      dataClasses: [...new Set(input.scope.dataClasses)].sort()
    },
    requiredApprovalReferences: canonicalStrings(input.requiredApprovalReferences),
    releaseAuthorityGranted: false as const
  };
}

export function createExecutionGrant(input: ExecutionGrantInput): ExecutionGrant {
  const payload = executionGrantPayload(input);
  if (![payload.grantId, payload.issuer, payload.audience, payload.subject, payload.tenantId, payload.nonce].every((value) => safeIdentifierPattern.test(value))) {
    throw new Error("Execution grant identifiers are invalid");
  }
  if (!sha256Pattern.test(payload.candidateFingerprint) || !sha256Pattern.test(payload.sourceFingerprint)) {
    throw new Error("Execution grant must bind exact candidate and source fingerprints");
  }
  if (!isIsoTimestamp(payload.issuedAt) || !isIsoTimestamp(payload.expiresAt) || Date.parse(payload.expiresAt) <= Date.parse(payload.issuedAt)) {
    throw new Error("Execution grant timestamps are invalid");
  }
  if (Date.parse(payload.expiresAt) - Date.parse(payload.issuedAt) > 60 * 60 * 1000) {
    throw new Error("Execution grant lifetime cannot exceed one hour");
  }
  if (!payload.requiredApprovalReferences.length) {
    throw new Error("Execution grant requires at least one approval reference");
  }
  return { ...payload, grantHash: createAuditHash({ type: "execution-grant", payload }) };
}

export function verifyExecutionGrant(input: {
  grant: ExecutionGrant;
  manifest: CapabilityManifest;
  request: GovernedExecutionRequest;
  evaluatedAt: string;
  replayStore: ReplayProtectionStore;
  consumeNonce?: boolean;
}) {
  const { grant, manifest, request } = input;
  const { grantHash, ...grantPayload } = grant;
  const reasons: string[] = [];
  if (createAuditHash({ type: "execution-grant", payload: grantPayload }) !== grantHash) reasons.push("GRANT_INTEGRITY_INVALID");
  if (grant.subject !== manifest.actor.actorId || grant.audience !== "scrimed-governed-runtime") reasons.push("GRANT_SUBJECT_OR_AUDIENCE_MISMATCH");
  if (grant.tenantId !== request.tenantId || grant.tenantId !== manifest.tenantId) reasons.push("GRANT_TENANT_MISMATCH");
  if (grant.environment !== request.environment) reasons.push("GRANT_ENVIRONMENT_MISMATCH");
  if (grant.candidateFingerprint !== request.candidateFingerprint || grant.sourceFingerprint !== request.sourceFingerprint) reasons.push("GRANT_CANDIDATE_MISMATCH");
  if (grant.scope.action !== request.action || !grant.scope.tools.includes(request.toolId) || !grant.scope.resources.includes(request.resource)) reasons.push("GRANT_SCOPE_MISMATCH");
  if (!grant.scope.dataClasses.includes(request.dataClassification)) reasons.push("GRANT_DATA_CLASS_MISMATCH");
  if (!isIsoTimestamp(input.evaluatedAt) || Date.parse(grant.issuedAt) > Date.parse(input.evaluatedAt) || Date.parse(grant.expiresAt) <= Date.parse(input.evaluatedAt)) reasons.push("GRANT_EXPIRED_OR_NOT_YET_VALID");
  if (input.replayStore.has(grant.nonce)) reasons.push("GRANT_REPLAY_DETECTED");
  const valid = reasons.length === 0;
  if (valid && input.consumeNonce !== false) input.replayStore.record(grant.nonce, grant.expiresAt);
  return { valid, reasons, replayProtected: valid && input.consumeNonce !== false };
}

function budgetsExceeded(manifest: CapabilityManifest, usage: RuntimeBudgetUsage) {
  const reasons: string[] = [];
  if (usage.requestsThisMinute > manifest.limits.requestsPerMinute) reasons.push("REQUEST_RATE_LIMIT_EXCEEDED");
  if (usage.tokens > manifest.limits.maximumTokens) reasons.push("TOKEN_LIMIT_EXCEEDED");
  if (usage.durationMs > manifest.limits.maximumDurationMs) reasons.push("TIME_LIMIT_EXCEEDED");
  if (usage.spendUsd > manifest.limits.maximumSpendUsd) reasons.push("SPEND_LIMIT_EXCEEDED");
  if (usage.toolCalls > manifest.limits.maximumToolCalls) reasons.push("TOOL_CALL_LIMIT_EXCEEDED");
  return reasons;
}

export function evaluateGovernedExecution(input: {
  manifest: CapabilityManifest;
  request: GovernedExecutionRequest;
  evaluatedAt: string;
  grant?: ExecutionGrant;
  replayStore?: ReplayProtectionStore;
}): GovernedExecutionDecision {
  const { manifest, request } = input;
  const reasons: string[] = [];
  const manifestPayloadForHash = { ...manifest };
  delete (manifestPayloadForHash as Partial<CapabilityManifest>).manifestHash;
  if (createAuditHash({ type: "capability-manifest", payload: manifestPayloadForHash }) !== manifest.manifestHash) reasons.push("MANIFEST_INTEGRITY_INVALID");
  if (Date.parse(manifest.issuedAt) > Date.parse(input.evaluatedAt) || Date.parse(manifest.expiresAt) <= Date.parse(input.evaluatedAt)) reasons.push("MANIFEST_EXPIRED_OR_NOT_YET_VALID");
  if (!manifest.actor.authenticated || manifest.actor.actorId !== request.actorId) reasons.push("ACTOR_NOT_AUTHORIZED");
  if (manifest.tenantId !== request.tenantId) reasons.push("CROSS_TENANT_ACCESS_DENIED");
  if (!manifest.permittedTools.includes(request.toolId)) reasons.push("TOOL_NOT_PERMITTED");
  if (!manifest.permittedResources.includes(request.resource)) reasons.push("RESOURCE_NOT_PERMITTED");
  if (!manifest.permittedDataClasses.includes(request.dataClassification)) reasons.push("DATA_CLASS_NOT_PERMITTED");
  if (riskOrder[request.riskLevel] > riskOrder[manifest.maximumRisk]) reasons.push("RISK_EXCEEDS_MANIFEST");
  if (manifest.prohibitedActions.includes(request.action)) reasons.push("ACTION_PROHIBITED_BY_MANIFEST");
  if (currentPolicyHardBlocks.some((pattern) => pattern.test(request.action)) || request.dataClassification === "phi-blocked") reasons.push("CURRENT_POLICY_HARD_BLOCK");
  if (request.stage === "execute" && !request.idempotencyKey) reasons.push("IDEMPOTENCY_KEY_REQUIRED");
  reasons.push(...budgetsExceeded(manifest, request.budgetUsage));

  let grantId: string | null = null;
  let replayProtected = false;
  if (request.stage === "execute") {
    if (!input.grant) reasons.push("EXECUTION_GRANT_REQUIRED");
    else {
      grantId = input.grant.grantId;
      const grantResult = verifyExecutionGrant({
        grant: input.grant,
        manifest,
        request,
        evaluatedAt: input.evaluatedAt,
        replayStore: input.replayStore ?? createInMemoryReplayProtectionStore()
      });
      reasons.push(...grantResult.reasons);
      replayProtected = grantResult.replayProtected;
      const missingApprovals = input.grant.requiredApprovalReferences.filter(
        (reference) => !request.humanApprovalReferences.includes(reference)
      );
      if (missingApprovals.length) reasons.push("REQUIRED_APPROVAL_REFERENCE_MISSING");
    }
  }

  const hardDenied = reasons.length > 0 || request.riskLevel === "prohibited";
  const humanApprovalRequired = request.stage === "approve" || consequentialCategories.has(request.toolCategory);
  const decision: RuntimeDecision = hardDenied
    ? "deny"
    : humanApprovalRequired && request.stage !== "execute"
      ? "require_human_approval"
      : "allow";
  const executionAuthorized = decision === "allow" && request.stage === "execute" && replayProtected;
  const withoutHash = {
    decision,
    reasonCodes: reasons.length ? [...new Set(reasons)].sort() : [decision === "allow" ? "POLICY_ALLOW" : "HUMAN_APPROVAL_REQUIRED"],
    stage: request.stage,
    policyVersion: scrimedGovernedRuntimeVersion as typeof scrimedGovernedRuntimeVersion,
    manifestId: manifest.manifestId,
    grantId,
    executionAuthorized,
    replayProtected,
    humanApprovalRequired
  };
  return { ...withoutHash, auditHash: createAuditHash({ request, decision: withoutHash }) };
}

export function createGovernedExecutionReceipt(input: Omit<GovernedExecutionReceipt, "containsRawPhi" | "containsSecrets" | "receiptHash">): GovernedExecutionReceipt {
  if (!sha256Pattern.test(input.inputDigest) || (input.outputDigest !== null && !sha256Pattern.test(input.outputDigest))) {
    throw new Error("Governed execution receipts require digest-only input and output attribution");
  }
  const safe = redactForTelemetry(input) as typeof input;
  const payload = {
    ...safe,
    evidencePointers: canonicalStrings(safe.evidencePointers),
    containsRawPhi: false as const,
    containsSecrets: false as const
  };
  return { ...payload, receiptHash: createAuditHash({ type: "governed-execution-receipt", payload }) };
}

export function createSyntheticCapabilityManifest(input: {
  agentRole: WorkAgentRole;
  tenantId: string;
  actorId: string;
  permittedTools: string[];
  permittedResources: string[];
  issuedAt: string;
  expiresAt: string;
}) {
  return createCapabilityManifest({
    manifestId: `manifest-${input.agentRole}`,
    actor: { actorId: input.actorId, actorType: "agent", role: input.agentRole, authenticated: true },
    tenantId: input.tenantId,
    purpose: "synthetic governed work planning",
    permittedTools: input.permittedTools,
    permittedResources: input.permittedResources,
    permittedDataClasses: ["synthetic-no-phi", "metadata-only", "deidentified"],
    maximumRisk: "moderate",
    limits: {
      requestsPerMinute: 30,
      maximumTokens: 20_000,
      maximumDurationMs: 120_000,
      maximumSpendUsd: 5,
      maximumToolCalls: 10
    },
    prohibitedActions: [
      "live-phi-processing",
      "autonomous-diagnosis",
      "autonomous-treatment",
      "prescribing",
      "payer-submission",
      "ehr-writeback",
      "production-deploy"
    ],
    issuedAt: input.issuedAt,
    expiresAt: input.expiresAt
  });
}
