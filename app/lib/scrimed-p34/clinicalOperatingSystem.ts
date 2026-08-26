import { createClinicalEvidenceHash } from "../clinicalEvidenceControls";
import type {
  AgentSandboxDecision,
  AgentSandboxPolicy,
  AgentSandboxRequest,
  ApprovedPublicClaim,
  ApprovedPublicClaimDecision,
  AutonomyContractDecision,
  AutonomyContractRequest,
  AutonomyTier,
  BreakGlassDecision,
  BreakGlassRequest,
  ClinicalOperatingGovernanceRecord,
  ClinicalRetrievalCandidate,
  ClinicalRetrievalAuthorizationContext,
  ClinicalRetrievalDecision,
  ClinicalRetrievalRequest,
  ConsequentialActionClass,
  ExternalValidationDecision,
  ExternalValidationEvidence,
  MedicalCodingContract,
  MedicalCodingDecision,
  OpaqueTokenReceipt,
  OperationalInvocation,
  OperationalRecoveryDecision,
  OversightDriftDecision,
  OversightDriftMetrics,
  PatientTakeHomeDocument,
  PatientTakeHomeInput,
  PhiEgressDecision,
  PhiEgressRequest,
  PhiFieldRegistration,
  PhiFieldRegistry,
  PhiRegistryValidation,
  PhiSchemaField,
  ScopedAutonomyApproval,
  TokenResolutionGrant
} from "./types";

export const p34ClinicalOperatingSystemVersion =
  "scrimed-p34-clinical-operating-system-v1-2026-08-20";

export const p34ClinicalOperatingSystemBoundary =
  "SCRIMED p.34 Clinical Operating System controls synthetic and no-PHI governance evidence, autonomy, retrieval, sandboxing, validation, patient-education previews, coding drafts, operations recovery, and public claims. It does not authorize live PHI, clinical or billing decisions, external communication, EHR or payer writes, provider calls, production promotion, migration, deployment, customer activation, certification claims, or external distribution.";

const hashPattern = /^[0-9a-f]{64}$/i;
const idPattern = /^[A-Za-z0-9][A-Za-z0-9._:-]{2,159}$/;
const tierRank: Record<AutonomyTier, number> = { A0: 0, A1: 1, A2: 2, A3: 3 };
const externalActionClasses = new Set<ConsequentialActionClass>([
  "external-communication",
  "clinical-decision",
  "medication-or-order",
  "patient-result-release",
  "billing-submission",
  "payer-submission",
  "system-of-record-write",
  "destructive-action",
  "permission-change"
]);

function canonical(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort();
}

function isIso(value: string | null) {
  return value !== null && Number.isFinite(Date.parse(value));
}

function isHash(value: string | null) {
  return value !== null && hashPattern.test(value);
}

function isId(value: string) {
  return idPattern.test(value);
}

function bounded(value: number) {
  return Number.isFinite(value) && value >= 0 && value <= 1;
}

function withinRoot(path: string, root: string) {
  return root.startsWith("/") && path.startsWith("/") && !path.includes("..") &&
    (path === root || path.startsWith(`${root}/`));
}

function hasSensitiveText(value: unknown): boolean {
  if (typeof value === "string") {
    return /(?:\bpatient\s+name\b|\bmedical\s+record\b|\b(?:mrn|ssn|dob)\b|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|(?:sk|rk|pk)_[A-Za-z0-9_-]{12,}|-----BEGIN [A-Z ]+PRIVATE KEY-----)/i.test(value);
  }
  if (Array.isArray(value)) return value.some(hasSensitiveText);
  if (value && typeof value === "object") return Object.values(value).some(hasSensitiveText);
  return false;
}

function recordHash(type: string, payload: unknown) {
  return createClinicalEvidenceHash({ type, version: p34ClinicalOperatingSystemVersion, payload });
}

function approvalReasonCodes(
  request: AutonomyContractRequest,
  approval: ScopedAutonomyApproval
) {
  const reasons: string[] = [];
  if (approval.tenantId !== request.tenantId) reasons.push("APPROVAL_TENANT_MISMATCH");
  if (approval.actorIdHash !== request.actorIdHash) reasons.push("APPROVAL_ACTOR_MISMATCH");
  if (approval.approverIdHash === request.actorIdHash) reasons.push("SELF_APPROVAL_PROHIBITED");
  if (approval.actionId !== request.actionId || approval.actionClass !== request.actionClass) {
    reasons.push("APPROVAL_ACTION_SCOPE_MISMATCH");
  }
  if (approval.resourceId !== request.resourceId) reasons.push("APPROVAL_RESOURCE_MISMATCH");
  if (approval.payloadHash !== request.payloadHash) reasons.push("APPROVAL_PAYLOAD_MISMATCH");
  if (approval.idempotencyKey !== request.idempotencyKey) reasons.push("APPROVAL_IDEMPOTENCY_MISMATCH");
  if (approval.policyVersion !== request.policyVersion) reasons.push("APPROVAL_POLICY_MISMATCH");
  if (!approval.authorityScope.includes(request.actionClass)) reasons.push("APPROVAL_AUTHORITY_SCOPE_MISSING");
  if (!isHash(approval.approverIdHash) || !isHash(approval.evidenceHash)) {
    reasons.push("APPROVAL_EVIDENCE_INVALID");
  }
  if (!isIso(approval.issuedAt) || !isIso(approval.expiresAt)) {
    reasons.push("APPROVAL_TIME_INVALID");
  } else if (
    Date.parse(approval.issuedAt) > Date.parse(request.evaluatedAt) ||
    Date.parse(approval.expiresAt) <= Date.parse(request.evaluatedAt)
  ) {
    reasons.push("APPROVAL_STALE_OR_NOT_EFFECTIVE");
  }
  if (request.usedApprovalIds.includes(approval.approvalId)) reasons.push("APPROVAL_REPLAY_DETECTED");
  return reasons;
}

export function evaluateAutonomyContract(
  request: AutonomyContractRequest
): AutonomyContractDecision {
  const reasonCodes: string[] = [];
  if (!isId(request.tenantId) || !isId(request.actionId) || !isId(request.idempotencyKey)) {
    reasonCodes.push("AUTONOMY_IDENTIFIER_INVALID");
  }
  if (!isHash(request.actorIdHash) || !isHash(request.authenticatedIdentityHash) ||
      !isHash(request.accountableHumanIdHash) || !isHash(request.payloadHash)) {
    reasonCodes.push("AUTONOMY_IDENTITY_OR_PAYLOAD_INVALID");
  }
  if (!isIso(request.evaluatedAt)) reasonCodes.push("AUTONOMY_EVALUATION_TIME_INVALID");
  if (!request.task.trim() || !request.resourceId.trim() || !request.stoppingCondition.trim()) {
    reasonCodes.push("AUTONOMY_SCOPE_INCOMPLETE");
  }
  if (tierRank[request.requestedTier] > tierRank[request.maximumAuthorizedTier]) {
    reasonCodes.push("AUTONOMY_TIER_EXCEEDS_POLICY");
  }
  if (request.dataClassification === "phi-restricted") reasonCodes.push("LIVE_PHI_AUTONOMY_DISABLED");
  if (!request.syntheticOnly) reasonCodes.push("NON_SYNTHETIC_EXECUTION_DISABLED");
  if (request.requestedTier === "A3" &&
      (request.actionClass !== "reversible-internal-write" || !request.reversible)) {
    reasonCodes.push("A3_RESTRICTED_TO_AUTHORIZED_LOW_RISK_REVERSIBLE_ACTIONS");
  }
  if (externalActionClasses.has(request.actionClass) && tierRank[request.requestedTier] > 1) {
    reasonCodes.push("CONSEQUENTIAL_EXTERNAL_ACTION_DISABLED");
  }
  if (request.requestedTier === "A2" && !request.reversible) {
    reasonCodes.push("A2_REQUIRES_REVERSIBILITY");
  }

  const approvalRequired = tierRank[request.requestedTier] >= 2;
  let authorizationState: AutonomyContractDecision["authorizationState"] = approvalRequired
    ? "missing"
    : "not-required";
  const approvalConsumed = false;
  if (approvalRequired && request.approval) {
    const approvalReasons = approvalReasonCodes(request, request.approval);
    reasonCodes.push(...approvalReasons);
    authorizationState = approvalReasons.length ? "invalid" : "verification-required";
    if (approvalReasons.length === 0) {
      reasonCodes.push("TRUSTED_APPROVAL_STORE_AND_ATOMIC_CONSUMPTION_REQUIRED");
    }
  } else if (approvalRequired) {
    reasonCodes.push("EXACT_SCOPED_APPROVAL_REQUIRED");
  }

  const normalizedReasons = canonical(reasonCodes);
  const reviewOnlyReasons = new Set([
    "EXACT_SCOPED_APPROVAL_REQUIRED",
    "TRUSTED_APPROVAL_STORE_AND_ATOMIC_CONSUMPTION_REQUIRED"
  ]);
  const blocking = normalizedReasons.some((reason) => !reviewOnlyReasons.has(reason));
  const decision = blocking
    ? "BLOCK" as const
    : normalizedReasons.length
      ? "REQUIRE_HUMAN" as const
      : "ALLOW" as const;
  const executionAuthorized = false;
  const grantedTier = decision === "BLOCK"
    ? "A0" as const
    : decision === "REQUIRE_HUMAN"
      ? "A1" as const
      : request.requestedTier;

  return {
    decision,
    requestedTier: request.requestedTier,
    grantedTier,
    accountablePartyHash: request.accountableHumanIdHash,
    authorizationState,
    stoppingCondition: request.stoppingCondition,
    reasonCodes: normalizedReasons,
    executionAuthorized,
    externalWriteAuthorized: false,
    clinicalAuthorityGranted: false,
    approvalConsumed,
    decisionHash: recordHash("p34-autonomy-contract-decision", {
      request,
      decision,
      grantedTier,
      reasonCodes: normalizedReasons,
      executionAuthorized
    })
  };
}

export type ClinicalOperatingGovernanceRecordInput = Omit<
  ClinicalOperatingGovernanceRecord,
  "containsRawPhi" | "containsSecrets" | "hiddenChainOfThoughtStored" | "recordHash"
>;

export function createClinicalOperatingGovernanceRecord(
  input: ClinicalOperatingGovernanceRecordInput,
  existing: ClinicalOperatingGovernanceRecord[] = []
): ClinicalOperatingGovernanceRecord {
  for (const value of [input.recordId, input.ledgerId, input.tenantId, input.traceId, input.correlationId]) {
    if (!isId(value)) throw new Error("Clinical operating governance identifiers must be bounded");
  }
  for (const value of [
    input.caseReferenceHash,
    input.initiatingActorIdHash,
    input.authenticatedIdentityHash,
    input.accountableHumanIdHash,
    input.outcomeHash,
    input.supersededByRecordHash,
    input.replayOfRecordHash,
    input.rolledBackByRecordHash,
    input.previousRecordHash
  ]) {
    if (value !== null && !isHash(value)) {
      throw new Error("Clinical operating governance digests must be SHA-256 values");
    }
  }
  [...input.sourceHashes, ...input.approvals.map((approval) => approval.approvalHash)]
    .forEach((value) => {
      if (!isHash(value)) throw new Error("Governance evidence hashes must be SHA-256 values");
    });
  if (!isIso(input.occurredAt)) throw new Error("Governance records require an ISO timestamp");
  if (!input.task.trim() || !input.authorityScope.length || !input.constraintsApplied.length) {
    throw new Error("Governance records require task, authority, and constraints");
  }
  if (!isId(input.task) || !isId(input.proposedAction)) {
    throw new Error("Governance records require bounded operational codes instead of free text");
  }
  if (input.confidence !== null && !bounded(input.confidence)) {
    throw new Error("Governance confidence must be between zero and one");
  }
  if (sensitivePaths(input).length || hasSensitiveText(input)) {
    throw new Error("Governance records accept redacted operational evidence only");
  }
  if (existing.some((record) => record.recordId === input.recordId)) {
    throw new Error("Governance record identifiers are append-only");
  }
  const tenantLedger = existing.filter(
    (record) => record.tenantId === input.tenantId && record.ledgerId === input.ledgerId
  );
  if ((tenantLedger.at(-1)?.recordHash ?? null) !== input.previousRecordHash) {
    throw new Error("Governance record does not extend the current tenant ledger head");
  }
  const payload = {
    ...input,
    authorityScope: canonical(input.authorityScope),
    toolVersions: canonical(input.toolVersions),
    sourceHashes: canonical(input.sourceHashes),
    retrievalCitationIds: canonical(input.retrievalCitationIds),
    constraintsApplied: canonical(input.constraintsApplied),
    requestedToolIds: canonical(input.requestedToolIds),
    executedToolIds: canonical(input.executedToolIds),
    approvals: [...input.approvals]
      .map((approval) => ({ ...approval, authorityScope: canonical(approval.authorityScope) }))
      .sort((left, right) => left.approvalId.localeCompare(right.approvalId)),
    containsRawPhi: false as const,
    containsSecrets: false as const,
    hiddenChainOfThoughtStored: false as const
  };
  return {
    ...payload,
    recordHash: recordHash("p34-clinical-operating-governance-record", payload)
  };
}

export function verifyClinicalOperatingGovernanceChain(
  records: ClinicalOperatingGovernanceRecord[]
) {
  const failures: Array<{ recordId: string; reasonCode: string }> = [];
  const heads = new Map<string, string | null>();
  const seenIds = new Set<string>();
  for (const record of records) {
    const key = `${record.tenantId}:${record.ledgerId}`;
    if (seenIds.has(record.recordId)) {
      failures.push({ recordId: record.recordId, reasonCode: "DUPLICATE_GOVERNANCE_RECORD" });
    }
    seenIds.add(record.recordId);
    if ((heads.get(key) ?? null) !== record.previousRecordHash) {
      failures.push({ recordId: record.recordId, reasonCode: "GOVERNANCE_CHAIN_PREDECESSOR_MISMATCH" });
    }
    const { recordHash: actual, ...payload } = record;
    if (recordHash("p34-clinical-operating-governance-record", payload) !== actual) {
      failures.push({ recordId: record.recordId, reasonCode: "GOVERNANCE_RECORD_HASH_MISMATCH" });
    }
    if (record.containsRawPhi || record.containsSecrets || record.hiddenChainOfThoughtStored) {
      failures.push({ recordId: record.recordId, reasonCode: "PROHIBITED_GOVERNANCE_CONTENT" });
    }
    heads.set(key, record.recordHash);
  }
  return {
    valid: failures.length === 0,
    recordCount: records.length,
    failures,
    chainHash: recordHash(
      "p34-clinical-operating-governance-chain",
      [...heads.entries()].sort(([left], [right]) => left.localeCompare(right))
    )
  };
}

export function queryClinicalOperatingGovernance(
  records: ClinicalOperatingGovernanceRecord[],
  filter: {
    tenantId: string;
    caseReferenceHash?: string;
    actorIdHash?: string;
    traceId?: string;
    policyVersion?: string;
    modelId?: string;
    actionText?: string;
    from?: string;
    to?: string;
  }
) {
  return records.filter((record) =>
    record.tenantId === filter.tenantId &&
    (!filter.caseReferenceHash || record.caseReferenceHash === filter.caseReferenceHash) &&
    (!filter.actorIdHash || record.initiatingActorIdHash === filter.actorIdHash) &&
    (!filter.traceId || record.traceId === filter.traceId) &&
    (!filter.policyVersion || record.policyVersion === filter.policyVersion) &&
    (!filter.modelId || record.modelId === filter.modelId) &&
    (!filter.actionText || record.proposedAction.includes(filter.actionText)) &&
    (!filter.from || Date.parse(record.occurredAt) >= Date.parse(filter.from)) &&
    (!filter.to || Date.parse(record.occurredAt) <= Date.parse(filter.to))
  );
}

export function createPhiFieldRegistry(
  fields: PhiFieldRegistration[],
  registryId = "p34-phi-field-registry"
): PhiFieldRegistry {
  if (!isId(registryId) || !fields.length) throw new Error("PHI field registry requires identity and fields");
  const normalized = [...fields]
    .map((field) => ({ ...field, minimumNecessaryPurposes: canonical(field.minimumNecessaryPurposes) }))
    .sort((left, right) => left.fieldId.localeCompare(right.fieldId));
  return {
    registryId,
    version: p34ClinicalOperatingSystemVersion,
    fields: normalized,
    defaultUnknownFieldDecision: "BLOCK",
    registryHash: recordHash("p34-phi-field-registry", normalized)
  };
}

export function validatePhiFieldRegistry(
  registry: PhiFieldRegistry,
  schemaFields: PhiSchemaField[]
): PhiRegistryValidation {
  const registrations = new Map<string, PhiFieldRegistration[]>();
  for (const field of registry.fields) {
    const key = `${field.schemaId}:${field.fieldPath}`;
    registrations.set(key, [...(registrations.get(key) ?? []), field]);
  }
  const duplicateRegistrations = [...registrations.entries()]
    .filter(([, values]) => values.length > 1)
    .map(([key]) => key)
    .sort();
  const missingClassifications = schemaFields
    .filter((field) => field.sensitive && !registrations.has(`${field.schemaId}:${field.fieldPath}`))
    .map((field) => `${field.schemaId}:${field.fieldPath}`)
    .sort();
  const reasonCodes = [
    ...(missingClassifications.length ? ["SENSITIVE_FIELD_CLASSIFICATION_MISSING"] : []),
    ...(duplicateRegistrations.length ? ["PHI_FIELD_REGISTRATION_DUPLICATE"] : [])
  ];
  return {
    decision: reasonCodes.length ? "BLOCK" : "ALLOW",
    missingClassifications,
    duplicateRegistrations,
    startupAllowed: reasonCodes.length === 0,
    validationHash: recordHash("p34-phi-registry-validation", {
      registryHash: registry.registryHash,
      schemaFields,
      missingClassifications,
      duplicateRegistrations
    })
  };
}

type VaultEntry = {
  tenantId: string;
  fieldId: string;
  purpose: string;
  value: string;
  expiresAt: string;
};

export class SyntheticTenantTokenVault {
  readonly productionReady = false;
  readonly storesRawValuesInLogs = false;
  #entries = new Map<string, VaultEntry>();
  #resolutionGrants = new Map<string, TokenResolutionGrant>();
  #registry: PhiFieldRegistry;
  #vaultSalt: string;
  #clock: () => string;
  #trustedValidatorIdHashes: Set<string>;

  constructor(
    registry: PhiFieldRegistry,
    vaultSalt: string,
    options: { clock?: () => string; trustedValidatorIdHashes?: string[] } = {}
  ) {
    if (!vaultSalt.trim()) throw new Error("Synthetic token vault requires a nonempty in-memory salt");
    this.#registry = registry;
    this.#vaultSalt = vaultSalt;
    this.#clock = options.clock ?? (() => new Date().toISOString());
    this.#trustedValidatorIdHashes = new Set(options.trustedValidatorIdHashes ?? []);
  }

  tokenize(input: {
    tenantId: string;
    fieldId: string;
    value: string;
    purpose: string;
    issuedAt: string;
    expiresAt: string;
  }): OpaqueTokenReceipt {
    const field = this.#registry.fields.find((candidate) => candidate.fieldId === input.fieldId);
    if (!field || !field.reversibleTokenizationRequired) {
      throw new Error("Field is not registered for reversible tokenization");
    }
    if (!field.minimumNecessaryPurposes.includes(input.purpose)) {
      throw new Error("Tokenization purpose is not authorized for the registered field");
    }
    if (!isIso(input.issuedAt) || !isIso(input.expiresAt) ||
        Date.parse(input.expiresAt) <= Date.parse(input.issuedAt)) {
      throw new Error("Tokenization receipt requires a valid bounded lifetime");
    }
    const token = `scrimed_tok_${createClinicalEvidenceHash({
      tenantId: input.tenantId,
      fieldId: input.fieldId,
      purpose: input.purpose,
      value: input.value,
      issuedAt: input.issuedAt,
      salt: this.#vaultSalt
    }).slice(0, 40)}`;
    this.#entries.set(`${input.tenantId}:${token}`, {
      tenantId: input.tenantId,
      fieldId: input.fieldId,
      purpose: input.purpose,
      value: input.value,
      expiresAt: input.expiresAt
    });
    const payload = {
      token,
      tenantId: input.tenantId,
      fieldId: input.fieldId,
      purpose: input.purpose,
      issuedAt: input.issuedAt,
      expiresAt: input.expiresAt,
      reversible: true as const,
      containsPlaintext: false as const
    };
    return { ...payload, receiptHash: recordHash("p34-opaque-token-receipt", payload) };
  }

  issueReidentificationGrant(input: {
    grantId: string;
    tenantId: string;
    token: string;
    purpose: string;
    validatorIdHash: string;
    validationEvidenceHash: string;
    expiresAt: string;
  }): TokenResolutionGrant {
    const issuedAt = this.#clock();
    if (!isId(input.grantId) || !isIso(issuedAt) || !isIso(input.expiresAt) ||
        Date.parse(input.expiresAt) <= Date.parse(issuedAt)) {
      throw new Error("Re-identification grant requires a bounded identifier and trusted lifetime");
    }
    if (!this.#trustedValidatorIdHashes.has(input.validatorIdHash) || !isHash(input.validationEvidenceHash)) {
      throw new Error("Re-identification grant requires a trusted validator and evidence");
    }
    const entry = this.#entries.get(`${input.tenantId}:${input.token}`);
    if (!entry || entry.purpose !== input.purpose || Date.parse(entry.expiresAt) <= Date.parse(issuedAt) ||
        Date.parse(input.expiresAt) > Date.parse(entry.expiresAt)) {
      throw new Error("Token is unavailable, cross-tenant, expired, or outside purpose");
    }
    const key = `${input.tenantId}:${input.grantId}`;
    if (this.#resolutionGrants.has(key)) throw new Error("Re-identification grant identifiers are one-use");
    const payload = { ...input, issuedAt };
    const grant = { ...payload, grantHash: recordHash("p34-token-resolution-grant", payload) };
    this.#resolutionGrants.set(key, grant);
    return grant;
  }

  resolve(input: {
    tenantId: string;
    token: string;
    purpose: string;
    grant: TokenResolutionGrant;
  }) {
    const evaluatedAt = this.#clock();
    if (!isIso(evaluatedAt)) throw new Error("Trusted token-vault clock is invalid");
    const key = `${input.tenantId}:${input.grant.grantId}`;
    const storedGrant = this.#resolutionGrants.get(key);
    const { grantHash, ...grantPayload } = input.grant;
    if (!storedGrant || storedGrant.grantHash !== grantHash ||
        recordHash("p34-token-resolution-grant", grantPayload) !== grantHash ||
        input.grant.tenantId !== input.tenantId || input.grant.token !== input.token ||
        input.grant.purpose !== input.purpose || Date.parse(input.grant.expiresAt) <= Date.parse(evaluatedAt)) {
      throw new Error("Trusted one-use re-identification grant is required");
    }
    const entry = this.#entries.get(`${input.tenantId}:${input.token}`);
    if (!entry || entry.purpose !== input.purpose || Date.parse(entry.expiresAt) <= Date.parse(evaluatedAt)) {
      throw new Error("Token is unavailable, cross-tenant, expired, or outside purpose");
    }
    this.#resolutionGrants.delete(key);
    return entry.value;
  }

  revokeTenant(tenantId: string) {
    for (const [key, entry] of this.#entries) {
      if (entry.tenantId === tenantId) this.#entries.delete(key);
    }
    for (const [key, grant] of this.#resolutionGrants) {
      if (grant.tenantId === tenantId) this.#resolutionGrants.delete(key);
    }
  }
}

function sensitivePaths(value: unknown, path = "$"): string[] {
  if (!value || typeof value !== "object") return [];
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => sensitivePaths(item, `${path}[${index}]`));
  }
  const matches: string[] = [];
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    const next = `${path}.${key}`;
    if (/patient.?name|medical.?record|\bmrn\b|social.?security|\bssn\b|date.?of.?birth|\bdob\b|api.?key|access.?token|password|secret/i.test(key)) {
      matches.push(next);
    }
    if (typeof item === "string" && /(?:sk|rk|pk)_[A-Za-z0-9_-]{12,}|-----BEGIN [A-Z ]+PRIVATE KEY-----/.test(item)) {
      matches.push(next);
    }
    matches.push(...sensitivePaths(item, next));
  }
  return canonical(matches);
}

function valueAtFieldPath(value: unknown, fieldPath: string): unknown {
  return fieldPath.split(".").reduce<unknown>((current, segment) => {
    if (!current || typeof current !== "object" || Array.isArray(current)) return undefined;
    return (current as Record<string, unknown>)[segment];
  }, value);
}

export function evaluatePhiEgressBoundary(
  registry: PhiFieldRegistry,
  request: PhiEgressRequest
): PhiEgressDecision {
  const reasonCodes: string[] = [];
  const fieldById = new Map(registry.fields.map((field) => [field.fieldId, field]));
  const referencedFields = request.fieldIds
    .map((fieldId) => fieldById.get(fieldId))
    .filter((field): field is PhiFieldRegistration => Boolean(field));
  const rawRegisteredPaths = referencedFields
    .filter((field) => field.reversibleTokenizationRequired)
    .filter((field) => {
      const value = valueAtFieldPath(request.payload, field.fieldPath);
      return typeof value !== "string" || !/^scrimed_tok_[0-9a-f]{40}$/.test(value);
    })
    .map((field) => `$.${field.fieldPath}`);
  const detectedSensitivePaths = canonical([...sensitivePaths(request.payload), ...rawRegisteredPaths]);
  const evaluationTimeValid = isIso(request.evaluatedAt);
  if (!evaluationTimeValid) reasonCodes.push("EGRESS_EVALUATION_TIME_INVALID");
  if (!request.minimumNecessary) reasonCodes.push("MINIMUM_NECESSARY_NOT_ESTABLISHED");
  if (!request.consentVerified && request.dataClassification !== "public") {
    reasonCodes.push("CONSENT_OR_AUTHORITY_NOT_VERIFIED");
  }
  if (request.fieldIds.some((fieldId) => !fieldById.has(fieldId))) {
    reasonCodes.push("UNREGISTERED_SENSITIVE_FIELD");
  }
  if (new Set(request.fieldIds).size !== request.fieldIds.length) {
    reasonCodes.push("DUPLICATE_EGRESS_FIELD_ID");
  }
  if (referencedFields.some((field) => !field.minimumNecessaryPurposes.includes(request.purpose))) {
    reasonCodes.push("EGRESS_PURPOSE_NOT_AUTHORIZED_FOR_FIELD");
  }
  if (detectedSensitivePaths.length) reasonCodes.push("RAW_PHI_OR_SECRET_DETECTED_PRE_EGRESS");
  const requiredTokenFields = referencedFields.filter((field) => field.reversibleTokenizationRequired);
  const receiptsByField = new Map<string, OpaqueTokenReceipt[]>();
  for (const receipt of request.tokenReceipts) {
    receiptsByField.set(receipt.fieldId, [...(receiptsByField.get(receipt.fieldId) ?? []), receipt]);
  }
  if (requiredTokenFields.some((field) => (receiptsByField.get(field.fieldId) ?? []).length !== 1)) {
    reasonCodes.push("TOKEN_RECEIPT_REQUIRED_FOR_REGISTERED_FIELD");
  }
  const tokenRoundTripValid = request.tokenReceipts.length === requiredTokenFields.length &&
    request.tokenReceipts.every((receipt) => {
      const field = fieldById.get(receipt.fieldId);
      const { receiptHash, ...receiptPayload } = receipt;
      return Boolean(field?.reversibleTokenizationRequired) &&
        receipt.tenantId === request.tenantId &&
        receipt.purpose === request.purpose &&
        request.fieldIds.includes(receipt.fieldId) &&
        receipt.containsPlaintext === false &&
        /^scrimed_tok_[0-9a-f]{40}$/.test(receipt.token) &&
        isHash(receiptHash) &&
        recordHash("p34-opaque-token-receipt", receiptPayload) === receiptHash &&
        isIso(receipt.issuedAt) &&
        isIso(receipt.expiresAt) &&
        evaluationTimeValid &&
        Date.parse(receipt.issuedAt) <= Date.parse(request.evaluatedAt) &&
        Date.parse(receipt.expiresAt) > Date.parse(request.evaluatedAt) &&
        valueAtFieldPath(request.payload, field?.fieldPath ?? "") === receipt.token;
    });
  if (!tokenRoundTripValid) reasonCodes.push("TOKEN_ROUND_TRIP_VALIDATION_FAILED");
  if (request.tokenReceipts.length && !request.postResponseValidated) {
    reasonCodes.push("POST_RESPONSE_VALIDATION_REQUIRED");
  }
  if (request.dataClassification === "phi-restricted") {
    const route = request.providerRoute;
    if (!route || route.phiPermission !== "authorized-by-external-evidence") {
      reasonCodes.push("PHI_PROVIDER_NOT_ELIGIBLE");
    }
    if (!route?.phiProductPathEvidence.signedBaaRecorded ||
        !route.phiProductPathEvidence.coveredProductPaths.includes(request.productPath)) {
      reasonCodes.push("SIGNED_BAA_PRODUCT_PATH_EVIDENCE_REQUIRED");
    }
    reasonCodes.push("LIVE_PHI_ROUTE_DISABLED_IN_LOCAL_CANDIDATE");
  }
  const normalizedReasons = canonical(reasonCodes);
  const decision = normalizedReasons.length ? "BLOCK" as const : "ALLOW" as const;
  return {
    decision,
    reasonCodes: normalizedReasons,
    detectedSensitivePaths,
    tokenRoundTripValid,
    reidentificationAuthorized: decision === "ALLOW" && request.postResponseValidated && request.tokenReceipts.length > 0,
    providerCallAuthorized: false,
    containsRawPhi: false,
    decisionHash: recordHash("p34-phi-egress-decision", {
      registryHash: registry.registryHash,
      tenantId: request.tenantId,
      purpose: request.purpose,
      productPath: request.productPath,
      dataClassification: request.dataClassification,
      fieldIds: canonical(request.fieldIds),
      payloadHash: createClinicalEvidenceHash(request.payload),
      tokenReceiptHashes: canonical(request.tokenReceipts.map((receipt) => receipt.receiptHash)),
      providerRouteId: request.providerRoute?.routeId ?? null,
      detectedSensitivePaths,
      reasonCodes: normalizedReasons
    })
  };
}

export function evaluateBreakGlassRequest(request: BreakGlassRequest): BreakGlassDecision {
  const reasonCodes: string[] = [];
  if (!isId(request.requestId) || !isId(request.tenantId)) reasonCodes.push("BREAK_GLASS_IDENTIFIER_INVALID");
  if (!isHash(request.actorIdHash) || !isHash(request.incidentReferenceHash)) {
    reasonCodes.push("BREAK_GLASS_IDENTITY_OR_INCIDENT_INVALID");
  }
  if (!request.approverIdHash || !isHash(request.approverIdHash) || request.approverIdHash === request.actorIdHash) {
    reasonCodes.push("INDEPENDENT_BREAK_GLASS_APPROVER_REQUIRED");
  }
  if (!request.reasonCode.trim() || !request.requestedScope.length) reasonCodes.push("BREAK_GLASS_SCOPE_OR_REASON_REQUIRED");
  if (!isIso(request.issuedAt) || !isIso(request.expiresAt) ||
      Date.parse(request.expiresAt) <= Date.parse(request.issuedAt) ||
      Date.parse(request.expiresAt) - Date.parse(request.issuedAt) > 60 * 60 * 1000) {
    reasonCodes.push("BREAK_GLASS_LIFETIME_INVALID");
  }
  if (!isHash(request.auditEventHash)) reasonCodes.push("BREAK_GLASS_AUDIT_EVENT_REQUIRED");
  const normalizedReasons = canonical(reasonCodes);
  return {
    decision: normalizedReasons.length ? "BLOCK" : "REQUIRE_HUMAN",
    reasonCodes: normalizedReasons,
    grantedScope: normalizedReasons.length ? [] : canonical(request.requestedScope),
    timeLimited: normalizedReasons.length === 0,
    mandatoryReviewRequired: true,
    clinicalAuthorityGranted: false,
    decisionHash: recordHash("p34-break-glass-decision", { request, reasonCodes: normalizedReasons })
  };
}

function normalizedDomain(value: string) {
  try {
    return new URL(value.includes("://") ? value : `https://${value}`).hostname.toLowerCase();
  } catch {
    return "";
  }
}

export function evaluateAgentSandboxAdmission(
  policy: AgentSandboxPolicy,
  request: AgentSandboxRequest,
  evaluatedAt: string
): AgentSandboxDecision {
  const reasonCodes: string[] = [];
  if (request.tenantId !== policy.tenantId) reasonCodes.push("SANDBOX_TENANT_MISMATCH");
  if (!isId(request.runId)) reasonCodes.push("SANDBOX_RUN_ID_INVALID");
  if (!withinRoot(request.workspacePath, policy.workspaceRoot)) reasonCodes.push("SANDBOX_WORKSPACE_OUTSIDE_ROOT");
  if (request.filesystemPaths.some((path) => !policy.allowedFilesystemRoots.some((root) => withinRoot(path, root)))) {
    reasonCodes.push("SANDBOX_FILESYSTEM_SCOPE_DENIED");
  }
  const allowedDomains = new Set(policy.allowedNetworkDomains.map((domain) => domain.toLowerCase()));
  const requestedDomains = request.networkDestinations.map(normalizedDomain);
  if (requestedDomains.some((domain) => !domain || !allowedDomains.has(domain))) {
    reasonCodes.push("SANDBOX_EGRESS_NOT_ALLOWLISTED");
  }
  if (request.networkDestinations.some((value) => /(?:^|\.)localhost$|127\.0\.0\.1|0\.0\.0\.0|169\.254\.|\[?::1\]?|proxy|dns:/i.test(value))) {
    reasonCodes.push("SANDBOX_EGRESS_ESCAPE_ATTEMPT");
  }
  if (request.requestedMounts.length) reasonCodes.push("ARBITRARY_SANDBOX_MOUNT_DENIED");
  if (request.hostCredentialsRequested || policy.hostCredentialInheritance) reasonCodes.push("HOST_CREDENTIAL_INHERITANCE_DENIED");
  if (request.privilegeEscalationRequested) reasonCodes.push("PRIVILEGE_ESCALATION_DENIED");
  if (request.requestedCpuMillis > policy.maximumCpuMillis) reasonCodes.push("SANDBOX_CPU_LIMIT_EXCEEDED");
  if (request.requestedMemoryBytes > policy.maximumMemoryBytes) reasonCodes.push("SANDBOX_MEMORY_LIMIT_EXCEEDED");
  if (request.requestedDiskBytes > policy.maximumDiskBytes) reasonCodes.push("SANDBOX_DISK_LIMIT_EXCEEDED");
  if (request.requestedProcesses > policy.maximumProcesses) reasonCodes.push("SANDBOX_PROCESS_LIMIT_EXCEEDED");
  if (request.requestedToolCalls > policy.maximumToolCalls) reasonCodes.push("SANDBOX_TOOL_LIMIT_EXCEEDED");
  if (request.requestedWallClockMs > policy.maximumWallClockMs) reasonCodes.push("SANDBOX_WALL_CLOCK_LIMIT_EXCEEDED");
  if (!request.cleanupVerified) reasonCodes.push("SANDBOX_CLEANUP_NOT_VERIFIED");
  for (const handle of request.secretHandles) {
    if (handle.tenantId !== request.tenantId || handle.allowedRuntimeId !== request.runId ||
        !isIso(handle.expiresAt) || Date.parse(handle.expiresAt) <= Date.parse(evaluatedAt) ||
        handle.plaintextExposedToModel !== false) {
      reasonCodes.push("OPAQUE_SECRET_HANDLE_SCOPE_INVALID");
    }
  }
  const policyReasons = canonical(reasonCodes);
  const policyCompliant = policyReasons.length === 0;
  const normalizedReasons = policyCompliant
    ? ["RUNTIME_CANONICAL_CONTAINMENT_AND_OPEN_TIME_VERIFICATION_REQUIRED"]
    : policyReasons;
  return {
    decision: policyCompliant ? "REQUIRE_HUMAN" : "BLOCK",
    reasonCodes: normalizedReasons,
    policyCompliant,
    isolatedWorkspaceAuthorized: false,
    runtimeContainmentVerified: false,
    networkDestinationsAllowed: [],
    cleanupRequired: true,
    externalSandboxActivated: false,
    decisionHash: recordHash("p34-agent-sandbox-decision", {
      policy,
      request: {
        ...request,
        secretHandles: request.secretHandles.map((handle) => ({ ...handle }))
      },
      evaluatedAt,
      reasonCodes: normalizedReasons
    })
  };
}

function authorityWeight(value: ClinicalRetrievalCandidate["sourceAuthority"]) {
  return value === "authoritative" ? 1 : value === "reviewed" ? 0.6 : 0.1;
}

function queryTokens(value: string) {
  return new Set(value.toLowerCase().split(/[^a-z0-9]+/).filter((token) => token.length > 1));
}

export function retrieveAuthorizedClinicalContext(
  request: ClinicalRetrievalRequest,
  candidates: ClinicalRetrievalCandidate[],
  authorization: ClinicalRetrievalAuthorizationContext
): ClinicalRetrievalDecision {
  const reasonCodes: string[] = [];
  if (!isId(request.tenantId) || !request.purpose.trim() || !request.query.trim()) {
    reasonCodes.push("RETRIEVAL_REQUEST_INVALID");
  }
  if (!isIso(request.evaluatedAt) || request.maximumResults < 1 || request.minimumEvidenceCount < 1 ||
      !bounded(request.minimumRerankScore)) {
    reasonCodes.push("RETRIEVAL_POLICY_INVALID");
  }
  if (!isHash(authorization.authenticatedActorIdHash) || !isHash(authorization.authorizationEvidenceHash) ||
      !isIso(authorization.evaluatedAt)) {
    reasonCodes.push("RETRIEVAL_AUTHORIZATION_EVIDENCE_INVALID");
  }
  if (request.tenantId !== authorization.authenticatedTenantId) {
    reasonCodes.push("RETRIEVAL_AUTHENTICATED_TENANT_MISMATCH");
  }
  if (!authorization.authorizedPurposes.includes(request.purpose)) {
    reasonCodes.push("RETRIEVAL_PURPOSE_NOT_AUTHORIZED");
  }
  if (request.authorizedDataClassifications.some(
    (classification) => !authorization.authorizedDataClassifications.includes(classification)
  )) {
    reasonCodes.push("RETRIEVAL_DATA_CLASSIFICATION_NOT_AUTHORIZED");
  }
  if (request.evaluatedAt !== authorization.evaluatedAt) {
    reasonCodes.push("RETRIEVAL_TRUSTED_TIME_MISMATCH");
  }
  const authorizationValid = !reasonCodes.some((reason) => reason.startsWith("RETRIEVAL_AUTH")) &&
    !reasonCodes.includes("RETRIEVAL_PURPOSE_NOT_AUTHORIZED") &&
    !reasonCodes.includes("RETRIEVAL_DATA_CLASSIFICATION_NOT_AUTHORIZED") &&
    !reasonCodes.includes("RETRIEVAL_TRUSTED_TIME_MISMATCH");

  const tenantAuthorized = authorizationValid ? candidates.filter((candidate) =>
    candidate.tenantId === request.tenantId &&
    request.authorizedDataClassifications.includes(candidate.dataClassification) &&
    candidate.authorizedPurposes.includes(request.purpose)
  ) : [];
  const staleCandidateIds = tenantAuthorized
    .filter((candidate) => !isIso(candidate.effectiveAt) || !isIso(candidate.expiresAt) ||
      Date.parse(candidate.effectiveAt) > Date.parse(authorization.evaluatedAt) ||
      Date.parse(candidate.expiresAt) <= Date.parse(authorization.evaluatedAt))
    .map((candidate) => candidate.candidateId)
    .sort();
  const current = tenantAuthorized.filter((candidate) => !staleCandidateIds.includes(candidate.candidateId));
  const query = request.query.toLowerCase().trim();
  const aliasMatches = current.filter((candidate) =>
    candidate.aliases.some((alias) => alias.toLowerCase() === query || query.includes(alias.toLowerCase()))
  );
  const aliasEntityIds = canonical(aliasMatches.map((candidate) => candidate.canonicalEntityId));
  const ambiguousEntityIds = request.canonicalEntityId === null && aliasEntityIds.length > 1
    ? aliasEntityIds
    : [];
  if (ambiguousEntityIds.length) reasonCodes.push("AMBIGUOUS_CLINICAL_ENTITY");

  const tokens = queryTokens(request.query);
  const relevant = current.filter((candidate) => {
    if (request.canonicalEntityId && candidate.canonicalEntityId !== request.canonicalEntityId) return false;
    if (ambiguousEntityIds.length) return false;
    const candidateTokens = queryTokens([candidate.canonicalEntityId, ...candidate.aliases, ...candidate.hierarchyPath].join(" "));
    return request.canonicalEntityId === candidate.canonicalEntityId || [...tokens].some((token) => candidateTokens.has(token));
  });
  const ranked = relevant
    .filter((candidate) => candidate.rerankScore >= request.minimumRerankScore && candidate.sourceSpanIds.length > 0)
    .sort((left, right) =>
      (right.rerankScore + authorityWeight(right.sourceAuthority)) -
      (left.rerankScore + authorityWeight(left.sourceAuthority)) ||
      left.candidateId.localeCompare(right.candidateId)
    )
    .slice(0, request.maximumResults);
  if (ranked.length < request.minimumEvidenceCount) reasonCodes.push("EVIDENCE_SUFFICIENCY_NOT_MET");
  if (relevant.some((candidate) => candidate.sourceSpanIds.length === 0)) reasonCodes.push("SOURCE_SPAN_REQUIRED");
  const conflictingGroupIds = canonical(
    ranked.map((candidate) => candidate.contradictionGroupId).filter((value): value is string => Boolean(value))
  );
  if (conflictingGroupIds.length) reasonCodes.push("CONFLICTING_SOURCES_REQUIRE_REVIEW");
  const citationCoverage = ranked.length
    ? ranked.filter((candidate) => candidate.sourceSpanIds.length > 0).length / ranked.length
    : 0;
  const normalizedReasons = canonical(reasonCodes);
  const hardBlock = normalizedReasons.some((reason) => [
    "RETRIEVAL_REQUEST_INVALID",
    "RETRIEVAL_POLICY_INVALID",
    "RETRIEVAL_AUTHORIZATION_EVIDENCE_INVALID",
    "RETRIEVAL_AUTHENTICATED_TENANT_MISMATCH",
    "RETRIEVAL_PURPOSE_NOT_AUTHORIZED",
    "RETRIEVAL_DATA_CLASSIFICATION_NOT_AUTHORIZED",
    "RETRIEVAL_TRUSTED_TIME_MISMATCH",
    "AMBIGUOUS_CLINICAL_ENTITY",
    "EVIDENCE_SUFFICIENCY_NOT_MET",
    "SOURCE_SPAN_REQUIRED"
  ].includes(reason));
  const decision = hardBlock
    ? "BLOCK" as const
    : normalizedReasons.length
      ? "REQUIRE_HUMAN" as const
      : "ALLOW" as const;
  return {
    decision,
    resultIds: ranked.map((candidate) => candidate.candidateId),
    reasonCodes: normalizedReasons,
    ambiguousEntityIds,
    staleCandidateIds,
    conflictingGroupIds,
    citationCoverage,
    abstained: hardBlock,
    tenantFilterAppliedBeforeRanking: true,
    decisionHash: recordHash("p34-clinical-retrieval-decision", {
      request,
      authorization,
      consideredCandidateIds: current.map((candidate) => candidate.candidateId).sort(),
      resultIds: ranked.map((candidate) => candidate.candidateId),
      staleCandidateIds,
      conflictingGroupIds,
      reasonCodes: normalizedReasons
    })
  };
}

export function evaluateExternalClinicalValidation(
  evidence: ExternalValidationEvidence,
  evaluatedAt: string
): ExternalValidationDecision {
  const reasonCodes: string[] = [];
  const metrics = Object.values(evidence.metrics).filter((value): value is number => value !== null);
  if (metrics.some((value) => !bounded(value))) reasonCodes.push("EXTERNAL_VALIDATION_METRIC_INVALID");
  if (evidence.internalOnly) reasonCodes.push("INTERNAL_VALIDATION_INSUFFICIENT");
  if (new Set(evidence.siteIds).size < 2) reasonCodes.push("MULTISITE_EXTERNAL_VALIDATION_REQUIRED");
  if (!evidence.healthSystemIds.length || !evidence.acquisitionSystemIds.length) {
    reasonCodes.push("HEALTH_SYSTEM_AND_ACQUISITION_VARIATION_REQUIRED");
  }
  if (!evidence.cohortIds.length || !evidence.demographicSubgroups.length ||
      !evidence.workflowSettings.length || !evidence.timePeriods.length) {
    reasonCodes.push("EXTERNAL_VALIDATION_COVERAGE_INCOMPLETE");
  }
  if (!evidence.distributionShiftEvaluated) reasonCodes.push("DISTRIBUTION_SHIFT_NOT_EVALUATED");
  if (!evidence.subgroupWorstCellPassed) reasonCodes.push("WORST_CELL_VALIDATION_FAILED");
  if (evidence.metrics.missingCriticalStepRate > 0 || evidence.metrics.downstreamHarmProxyRate > 0) {
    reasonCodes.push("CLINICAL_SAFETY_FLOOR_FAILED");
  }
  if (evidence.metrics.calibrationError > 0.1 || evidence.metrics.unsupportedExtraRate > 0.02) {
    reasonCodes.push("CLINICAL_QUALITY_FLOOR_FAILED");
  }
  const evidenceFresh = isIso(evidence.recordedAt) && isIso(evidence.expiresAt) &&
    Date.parse(evidence.recordedAt) <= Date.parse(evaluatedAt) &&
    Date.parse(evidence.expiresAt) > Date.parse(evaluatedAt);
  if (!evidenceFresh) reasonCodes.push("EXTERNAL_VALIDATION_EVIDENCE_STALE");
  if (!evidence.namedReviewerApprovalHashes.length ||
      evidence.namedReviewerApprovalHashes.some((hash) => !isHash(hash))) {
    reasonCodes.push("NAMED_EXTERNAL_VALIDATION_REVIEW_REQUIRED");
  }
  const normalizedReasons = canonical(reasonCodes);
  return {
    decision: normalizedReasons.length ? "BLOCK" : "REQUIRE_HUMAN",
    reasonCodes: normalizedReasons,
    evidenceFresh,
    externallyValidated: normalizedReasons.length === 0,
    clinicalProductionEligible: false,
    decisionHash: recordHash("p34-external-validation-decision", {
      evidence,
      evaluatedAt,
      reasonCodes: normalizedReasons
    })
  };
}

export function evaluateOversightDriftControl(
  metrics: OversightDriftMetrics
): OversightDriftDecision {
  const reasonCodes: string[] = [];
  if (!Number.isInteger(metrics.totalActions) || metrics.totalActions < 1 ||
      [metrics.reviewedActions, metrics.overrides, metrics.corrections, metrics.errors, metrics.silentAcceptances]
        .some((value) => !Number.isInteger(value) || value < 0 || value > metrics.totalActions)) {
    reasonCodes.push("OVERSIGHT_METRICS_INVALID");
  }
  if (!bounded(metrics.riskCohortCoverage) || !bounded(metrics.requestedReviewRate) ||
      !bounded(metrics.approvedReviewRate) || metrics.medianReviewLatencyMs < 0) {
    reasonCodes.push("OVERSIGHT_RATE_OR_LATENCY_INVALID");
  }
  const reviewedActionPercentage = metrics.totalActions > 0
    ? metrics.reviewedActions / metrics.totalActions
    : 0;
  const errorRate = metrics.totalActions > 0 ? metrics.errors / metrics.totalActions : 0;
  const silentAcceptanceRate = metrics.totalActions > 0
    ? metrics.silentAcceptances / metrics.totalActions
    : 0;
  if (reviewedActionPercentage < metrics.approvedReviewRate) reasonCodes.push("REVIEW_RATE_BELOW_APPROVED_FLOOR");
  if (metrics.riskCohortCoverage < 1) reasonCodes.push("RISK_COHORT_SAMPLING_INCOMPLETE");
  const reductionRequested = metrics.requestedReviewRate < metrics.approvedReviewRate;
  if (reductionRequested && !isHash(metrics.oversightReductionApprovalHash)) {
    reasonCodes.push("OVERSIGHT_REDUCTION_REQUIRES_EXPLICIT_APPROVAL");
  }
  if (metrics.errors > 0) reasonCodes.push("ERROR_VOLUME_REQUIRES_REVIEW");
  if (metrics.silentAcceptances > 0) reasonCodes.push("SILENT_ACCEPTANCE_REQUIRES_REVIEW");
  const normalizedReasons = canonical(reasonCodes);
  const hardBlock = normalizedReasons.some((reason) => [
    "OVERSIGHT_METRICS_INVALID",
    "OVERSIGHT_RATE_OR_LATENCY_INVALID",
    "REVIEW_RATE_BELOW_APPROVED_FLOOR",
    "RISK_COHORT_SAMPLING_INCOMPLETE",
    "OVERSIGHT_REDUCTION_REQUIRES_EXPLICIT_APPROVAL"
  ].includes(reason));
  return {
    decision: hardBlock ? "BLOCK" : normalizedReasons.length ? "REQUIRE_HUMAN" : "ALLOW",
    reasonCodes: normalizedReasons,
    reviewedActionPercentage,
    errorRate,
    errorVolume: metrics.errors,
    silentAcceptanceRate,
    oversightReductionAuthorized: reductionRequested && isHash(metrics.oversightReductionApprovalHash) && !hardBlock,
    decisionHash: recordHash("p34-oversight-drift-decision", { metrics, reasonCodes: normalizedReasons })
  };
}

export function renderPatientTakeHome(input: PatientTakeHomeInput): PatientTakeHomeDocument {
  const reasonCodes: string[] = [];
  if (!isId(input.documentId) || !isId(input.tenantId) || !isIso(input.generatedAt)) {
    reasonCodes.push("PATIENT_TAKE_HOME_IDENTITY_INVALID");
  }
  if (!isIso(input.preferences.effectiveAt) || !isIso(input.preferences.expiresAt) ||
      Date.parse(input.preferences.expiresAt) <= Date.parse(input.generatedAt)) {
    reasonCodes.push("PATIENT_DELIVERY_PREFERENCES_STALE");
  }
  if (!input.sourceFacts.length) reasonCodes.push("PATIENT_EDUCATION_SOURCE_REQUIRED");
  if (input.sourceFacts.some((fact) => !fact.approvedForEducation || !fact.sourceSpanIds.length)) {
    reasonCodes.push("PATIENT_EDUCATION_FACT_NOT_APPROVED_OR_GROUNDED");
  }
  if (input.preferences.channel === "caregiver-proxy" &&
      (!isHash(input.preferences.proxyIdHash) || !isHash(input.preferences.proxyAuthorizationHash))) {
    reasonCodes.push("CAREGIVER_PROXY_AUTHORIZATION_REQUIRED");
  }
  const reviewRequired = input.preferences.clinicianReviewRequired ||
    input.preferences.sensitiveResultRestriction === "clinician-release-only";
  if (reviewRequired && (
    input.clinicianReview.decision !== "approved" ||
    !isHash(input.clinicianReview.reviewerIdHash) ||
    !isIso(input.clinicianReview.reviewedAt)
  )) {
    reasonCodes.push("CLINICIAN_REVIEW_REQUIRED_BEFORE_DELIVERY");
  }
  const normalizedReasons = canonical(reasonCodes);
  const hardBlock = normalizedReasons.some((reason) => reason !== "CLINICIAN_REVIEW_REQUIRED_BEFORE_DELIVERY");
  const decision = hardBlock
    ? "BLOCK" as const
    : normalizedReasons.length
      ? "REQUIRE_HUMAN" as const
      : "ALLOW" as const;
  const sections = input.sourceFacts
    .filter((fact) => fact.approvedForEducation && fact.sourceSpanIds.length)
    .map((fact) => ({
      heading: `Approved information ${fact.factId}`,
      body: fact.approvedText,
      sourceSpanIds: canonical(fact.sourceSpanIds)
    }));
  const payload = {
    title: "Patient Take-Home",
    sections,
    channel: input.preferences.channel,
    language: input.preferences.language,
    accessibility: canonical(input.preferences.accessibility),
    disclaimer: "Educational information only. It is not a diagnosis, treatment plan, emergency service, or replacement for qualified clinician judgment."
  };
  return {
    decision,
    ...payload,
    reasonCodes: normalizedReasons,
    deliveryAuthorized: false,
    containsDiagnosisOrAdvice: false,
    documentHash: recordHash("p34-patient-take-home", {
      documentId: input.documentId,
      sourceFactHashes: input.sourceFacts.map((fact) => createClinicalEvidenceHash(fact)),
      preferences: input.preferences,
      clinicianReview: input.clinicianReview,
      payload,
      decision,
      reasonCodes: normalizedReasons
    })
  };
}

export function evaluateMedicalCodingContract(
  contract: MedicalCodingContract,
  evaluatedAt: string
): MedicalCodingDecision {
  const reasonCodes: string[] = [];
  if (!isId(contract.contractId) || !isId(contract.capabilityId) || !contract.ruleSetOwner.trim()) {
    reasonCodes.push("CODING_CONTRACT_IDENTITY_INCOMPLETE");
  }
  if (!contract.specialtyCoverage.length || !contract.ruleVersion.trim() || !contract.rollbackPath.length) {
    reasonCodes.push("CODING_CONTRACT_SCOPE_INCOMPLETE");
  }
  if (!contract.evidenceHashes.length || contract.evidenceHashes.some((hash) => !isHash(hash))) {
    reasonCodes.push("CODING_EVIDENCE_REQUIRED");
  }
  if (!isIso(contract.effectiveAt) || !isIso(contract.expiresAt) ||
      Date.parse(contract.effectiveAt) > Date.parse(evaluatedAt) ||
      Date.parse(contract.expiresAt) <= Date.parse(evaluatedAt)) {
    reasonCodes.push("CODING_CONTRACT_STALE");
  }
  if (contract.mode === "autonomous") reasonCodes.push("AUTONOMOUS_CODING_AND_BILLING_DISABLED");
  if (!contract.humanReviewRequired) reasonCodes.push("CODING_HUMAN_REVIEW_REQUIRED");
  if (contract.billingReleaseAuthorityHash !== null) reasonCodes.push("BILLING_RELEASE_AUTHORITY_NOT_ACCEPTED_IN_LOCAL_CANDIDATE");
  const normalizedReasons = canonical(reasonCodes);
  const hardBlock = normalizedReasons.some((reason) => [
    "CODING_CONTRACT_IDENTITY_INCOMPLETE",
    "CODING_CONTRACT_SCOPE_INCOMPLETE",
    "CODING_EVIDENCE_REQUIRED",
    "CODING_CONTRACT_STALE",
    "AUTONOMOUS_CODING_AND_BILLING_DISABLED",
    "CODING_HUMAN_REVIEW_REQUIRED",
    "BILLING_RELEASE_AUTHORITY_NOT_ACCEPTED_IN_LOCAL_CANDIDATE"
  ].includes(reason));
  return {
    decision: hardBlock ? "BLOCK" : "REQUIRE_HUMAN",
    effectiveMode: contract.mode === "computer-assisted" ? "computer-assisted" : "assisted",
    reasonCodes: normalizedReasons,
    draftAuthorized: !hardBlock,
    billingSubmissionAuthorized: false,
    decisionHash: recordHash("p34-medical-coding-decision", { contract, evaluatedAt, reasonCodes: normalizedReasons })
  };
}

export function evaluateOperationalRecovery(
  invocation: OperationalInvocation,
  existing: OperationalInvocation[] = []
): OperationalRecoveryDecision {
  const reasonCodes: string[] = [];
  if (!isId(invocation.invocationId) || !isId(invocation.tenantId) || !isId(invocation.idempotencyKey)) {
    reasonCodes.push("INVOCATION_IDENTITY_INVALID");
  }
  if (existing.some((item) =>
    item.tenantId === invocation.tenantId &&
    item.idempotencyKey === invocation.idempotencyKey &&
    item.invocationId !== invocation.invocationId
  )) {
    reasonCodes.push("IDEMPOTENCY_KEY_REPLAYED_FOR_DIFFERENT_INVOCATION");
  }
  if (invocation.attempt < 1 || invocation.maximumAttempts < 1 || invocation.attempt > invocation.maximumAttempts) {
    reasonCodes.push("RETRY_BUDGET_EXHAUSTED");
  }
  if (invocation.suspended) reasonCodes.push("INVOCATION_SUSPENDED");
  if (invocation.failureClass === "policy") reasonCodes.push("POLICY_FAILURE_NOT_RETRYABLE");
  if (invocation.failureClass === "permanent") reasonCodes.push("PERMANENT_FAILURE_NOT_RETRYABLE");
  if (invocation.failureClass === "unknown") reasonCodes.push("UNKNOWN_FAILURE_REQUIRES_REVIEW");
  if (invocation.failureClass === "transient" && !invocation.checkpointVerified) {
    reasonCodes.push("CHECKPOINT_VERIFICATION_REQUIRED_FOR_RETRY");
  }
  const retryAllowed = invocation.failureClass === "transient" &&
    invocation.attempt < invocation.maximumAttempts &&
    invocation.checkpointVerified &&
    !invocation.suspended &&
    !reasonCodes.some((reason) => reason.includes("IDEMPOTENCY"));
  const deadLetterRequired = !retryAllowed && invocation.state !== "completed" && invocation.failureClass !== null;
  const nextState: OperationalInvocation["state"] = invocation.suspended
    ? "suspended"
    : invocation.state === "completed"
      ? "completed"
      : retryAllowed
        ? "retrying"
        : "dead-letter";
  const normalizedReasons = canonical(reasonCodes);
  return {
    decision: nextState === "completed" ? "ALLOW" : retryAllowed ? "REQUIRE_HUMAN" : "BLOCK",
    nextState,
    retryAllowed,
    idempotencyPreserved: !normalizedReasons.includes("IDEMPOTENCY_KEY_REPLAYED_FOR_DIFFERENT_INVOCATION"),
    deadLetterRequired,
    reasonCodes: normalizedReasons,
    decisionHash: recordHash("p34-operational-recovery-decision", {
      invocation,
      existingInvocationIds: existing.map((item) => item.invocationId).sort(),
      nextState,
      reasonCodes: normalizedReasons
    })
  };
}

export function evaluateApprovedPublicClaim(
  claim: ApprovedPublicClaim,
  evaluatedAt: string
): ApprovedPublicClaimDecision {
  const reasonCodes: string[] = [];
  if (!isId(claim.claimId) || !claim.ownerRole.trim() || !claim.approvedWording.trim()) {
    reasonCodes.push("CLAIM_IDENTITY_OR_WORDING_MISSING");
  }
  if (!claim.primaryEvidence.length || claim.primaryEvidence.some((source) =>
    !source.sourceId.trim() || !/^https:\/\//.test(source.sourceUrl) || !isHash(source.evidenceHash))) {
    reasonCodes.push("PRIMARY_CLAIM_EVIDENCE_REQUIRED");
  }
  if (!claim.scope.trim() || !claim.limitations.length || !claim.targetAudience.trim() || !claim.channel.trim()) {
    reasonCodes.push("CLAIM_SCOPE_LIMITATIONS_AND_AUDIENCE_REQUIRED");
  }
  if (!claim.approvalHashes.length || claim.approvalHashes.some((hash) => !isHash(hash))) {
    reasonCodes.push("CLAIM_APPROVAL_REQUIRED");
  }
  if (!isIso(claim.approvedAt) || !isIso(claim.expiresAt) || !isIso(claim.revalidateAt) ||
      Date.parse(claim.approvedAt) > Date.parse(evaluatedAt) ||
      Date.parse(claim.expiresAt) <= Date.parse(evaluatedAt) ||
      Date.parse(claim.revalidateAt) <= Date.parse(evaluatedAt)) {
    reasonCodes.push("CLAIM_EVIDENCE_EXPIRED_OR_REVALIDATION_DUE");
  }
  if (/\b(?:HIPAA compliant|FDA (?:approved|cleared)|FedRAMP authorized|SOC 2 certified|clinically proven)\b/i.test(claim.approvedWording)) {
    reasonCodes.push("PROHIBITED_UNVERIFIED_COMPLIANCE_OR_CLINICAL_CLAIM");
  }
  const structuralReasons = canonical(reasonCodes);
  const structurallyValid = structuralReasons.length === 0;
  const normalizedReasons = structurallyValid
    ? ["TRUSTED_CLAIM_EVIDENCE_AND_PUBLICATION_APPROVAL_REQUIRED"]
    : structuralReasons;
  return {
    decision: structurallyValid ? "REQUIRE_HUMAN" : "BLOCK",
    reasonCodes: normalizedReasons,
    structurallyValid,
    publicationAuthorized: false,
    claimHash: recordHash("p34-approved-public-claim-decision", {
      claim,
      evaluatedAt,
      reasonCodes: normalizedReasons
    })
  };
}

export const p34SyntheticPhiFieldRegistry = createPhiFieldRegistry([
  {
    fieldId: "clinical-context.subject-reference",
    schemaId: "clinical-context",
    fieldPath: "subjectReference",
    classification: "direct-identifier",
    dataType: "string",
    reversibleTokenizationRequired: true,
    minimumNecessaryPurposes: ["synthetic-context-review"],
    retentionClass: "ephemeral",
    ownerRole: "privacy-security-owner"
  },
  {
    fieldId: "provider-config.credential-handle",
    schemaId: "provider-config",
    fieldPath: "credentialHandle",
    classification: "secret",
    dataType: "string",
    reversibleTokenizationRequired: false,
    minimumNecessaryPurposes: ["runtime-secret-injection"],
    retentionClass: "none",
    ownerRole: "platform-security-owner"
  },
  {
    fieldId: "clinical-context.source-hash",
    schemaId: "clinical-context",
    fieldPath: "sourceHash",
    classification: "non-sensitive",
    dataType: "string",
    reversibleTokenizationRequired: false,
    minimumNecessaryPurposes: ["synthetic-context-review"],
    retentionClass: "operational",
    ownerRole: "data-governance-owner"
  }
]);

export const p34SyntheticSandboxPolicy: AgentSandboxPolicy = {
  policyId: "p34-local-synthetic-sandbox",
  version: p34ClinicalOperatingSystemVersion,
  tenantId: "synthetic-tenant",
  workspaceRoot: "/sandbox/synthetic-tenant",
  allowedFilesystemRoots: ["/sandbox/synthetic-tenant/work"],
  allowedNetworkDomains: [],
  networkDefault: "deny",
  maximumCpuMillis: 2_000,
  maximumMemoryBytes: 256 * 1024 * 1024,
  maximumDiskBytes: 64 * 1024 * 1024,
  maximumProcesses: 4,
  maximumToolCalls: 8,
  maximumWallClockMs: 10_000,
  immutableBaseImageDigest: createClinicalEvidenceHash("p34-local-synthetic-base-image"),
  disposableWritableLayer: true,
  hostCredentialInheritance: false
};

export function createP34ClinicalOperatingSystemSummary() {
  const evaluatedAt = "2026-08-20T12:00:00.000Z";
  const actorIdHash = createClinicalEvidenceHash("p34-synthetic-clinical-os-actor");
  const identityHash = createClinicalEvidenceHash("p34-synthetic-authenticated-identity");
  const humanIdHash = createClinicalEvidenceHash("p34-synthetic-accountable-human");
  const payloadHash = createClinicalEvidenceHash("p34-synthetic-reversible-payload");
  const approval: ScopedAutonomyApproval = {
    approvalId: "p34-synthetic-autonomy-approval",
    tenantId: "synthetic-tenant",
    actorIdHash,
    approverIdHash: humanIdHash,
    actionId: "p34-synthetic-reversible-action",
    actionClass: "reversible-internal-write",
    resourceId: "synthetic-review-draft",
    payloadHash,
    idempotencyKey: "p34-synthetic-autonomy-idempotency",
    policyVersion: p34ClinicalOperatingSystemVersion,
    authorityScope: ["reversible-internal-write"],
    issuedAt: "2026-08-20T11:55:00.000Z",
    expiresAt: "2026-08-20T12:10:00.000Z",
    evidenceHash: createClinicalEvidenceHash("p34-synthetic-autonomy-approval-evidence")
  };
  const autonomy = evaluateAutonomyContract({
    tenantId: "synthetic-tenant",
    actorIdHash,
    authenticatedIdentityHash: identityHash,
    accountableHumanIdHash: humanIdHash,
    task: "prepare-synthetic-review-draft",
    actionId: "p34-synthetic-reversible-action",
    actionClass: "reversible-internal-write",
    resourceId: "synthetic-review-draft",
    payloadHash,
    idempotencyKey: "p34-synthetic-autonomy-idempotency",
    requestedTier: "A2",
    maximumAuthorizedTier: "A2",
    reversible: true,
    syntheticOnly: true,
    dataClassification: "synthetic-no-phi",
    policyVersion: p34ClinicalOperatingSystemVersion,
    stoppingCondition: "Stop after the synthetic draft receipt is verified or any policy check fails.",
    approval,
    usedApprovalIds: [],
    evaluatedAt
  });

  const governanceRecord = createClinicalOperatingGovernanceRecord({
    recordId: "p34-clinical-os-record-001",
    ledgerId: "p34-clinical-os-ledger",
    tenantId: "synthetic-tenant",
    caseReferenceHash: createClinicalEvidenceHash("p34-synthetic-case-reference"),
    traceId: "trace-p34-clinical-os-001",
    correlationId: "correlation-p34-clinical-os-001",
    occurredAt: evaluatedAt,
    task: "prepare-synthetic-review-draft",
    autonomyTier: autonomy.grantedTier,
    initiatingActorIdHash: actorIdHash,
    authenticatedIdentityHash: identityHash,
    accountableHumanIdHash: humanIdHash,
    authorityScope: approval.authorityScope,
    providerId: "scrimed-local-runtime",
    modelId: "deterministic-policy-engine-v1",
    modelVersion: "v1",
    harnessVersion: "harness-local-deterministic-v1",
    promptVersion: "not-applicable-deterministic",
    policyVersion: p34ClinicalOperatingSystemVersion,
    toolVersions: ["validator-v1", "hash-ledger-v1"],
    sourceHashes: [createClinicalEvidenceHash("p34-synthetic-source")],
    retrievalCitationIds: ["span-p34-synthetic-001"],
    constraintsApplied: ["no-live-phi", "no-external-write", "synthetic-only"],
    requestedToolIds: ["validator", "hash-ledger"],
    executedToolIds: ["validator", "hash-ledger"],
    approvals: [{
      approvalId: approval.approvalId,
      approverIdHash: approval.approverIdHash,
      authorityScope: approval.authorityScope,
      approvedAt: approval.issuedAt,
      expiresAt: approval.expiresAt,
      approvalHash: approval.evidenceHash
    }],
    proposedAction: "prepare-synthetic-review-receipt",
    disposition: "review-required",
    outcomeHash: createClinicalEvidenceHash("p34-synthetic-outcome"),
    confidence: 1,
    calibration: "not-applicable",
    supersededByRecordHash: null,
    replayOfRecordHash: null,
    rolledBackByRecordHash: null,
    previousRecordHash: null
  });
  const governance = {
    records: [governanceRecord],
    verification: verifyClinicalOperatingGovernanceChain([governanceRecord])
  };

  const phiRegistryValidation = validatePhiFieldRegistry(p34SyntheticPhiFieldRegistry, [
    { schemaId: "clinical-context", fieldPath: "subjectReference", sensitive: true },
    { schemaId: "provider-config", fieldPath: "credentialHandle", sensitive: true },
    { schemaId: "clinical-context", fieldPath: "sourceHash", sensitive: false }
  ]);
  const phiEgress = evaluatePhiEgressBoundary(p34SyntheticPhiFieldRegistry, {
    tenantId: "synthetic-tenant",
    purpose: "synthetic-context-review",
    productPath: "scrimed-p34-clinical-os",
    dataClassification: "synthetic-no-phi",
    fieldIds: ["clinical-context.source-hash"],
    payload: { sourceHash: createClinicalEvidenceHash("p34-synthetic-source") },
    tokenReceipts: [],
    providerRoute: null,
    minimumNecessary: true,
    consentVerified: true,
    postResponseValidated: true,
    evaluatedAt
  });
  const breakGlass = evaluateBreakGlassRequest({
    requestId: "p34-break-glass-not-authorized",
    tenantId: "synthetic-tenant",
    actorIdHash,
    approverIdHash: null,
    reasonCode: "none-local-candidate",
    incidentReferenceHash: createClinicalEvidenceHash("p34-no-live-incident"),
    requestedScope: ["read-synthetic-metadata"],
    issuedAt: evaluatedAt,
    expiresAt: "2026-08-20T12:15:00.000Z",
    auditEventHash: null
  });
  const sandbox = evaluateAgentSandboxAdmission(p34SyntheticSandboxPolicy, {
    tenantId: "synthetic-tenant",
    runId: "p34-synthetic-run-001",
    workspacePath: "/sandbox/synthetic-tenant",
    filesystemPaths: ["/sandbox/synthetic-tenant/work/input.json"],
    networkDestinations: [],
    requestedMounts: [],
    requestedCpuMillis: 500,
    requestedMemoryBytes: 64 * 1024 * 1024,
    requestedDiskBytes: 4 * 1024 * 1024,
    requestedProcesses: 1,
    requestedToolCalls: 2,
    requestedWallClockMs: 2_000,
    secretHandles: [],
    hostCredentialsRequested: false,
    privilegeEscalationRequested: false,
    cleanupVerified: true
  }, evaluatedAt);

  const retrievalCandidates: ClinicalRetrievalCandidate[] = [
    {
      candidateId: "p34-retrieval-current-authoritative",
      tenantId: "synthetic-tenant",
      canonicalEntityId: "concept:synthetic-follow-up",
      aliases: ["synthetic follow-up", "follow-up"],
      hierarchyPath: ["workflow", "care-coordination", "follow-up"],
      sourceAuthority: "authoritative",
      sourceSpanIds: ["span-p34-synthetic-001"],
      effectiveAt: "2026-08-01T00:00:00.000Z",
      expiresAt: "2027-08-01T00:00:00.000Z",
      lexicalScore: 1,
      semanticScore: 0.96,
      rerankScore: 0.98,
      contradictionGroupId: null,
      dataClassification: "synthetic-no-phi",
      authorizedPurposes: ["synthetic-context-review"],
      contentHash: createClinicalEvidenceHash("p34-authoritative-retrieval-content")
    },
    {
      candidateId: "p34-retrieval-wrong-tenant",
      tenantId: "other-synthetic-tenant",
      canonicalEntityId: "concept:synthetic-follow-up",
      aliases: ["synthetic follow-up"],
      hierarchyPath: ["workflow", "follow-up"],
      sourceAuthority: "authoritative",
      sourceSpanIds: ["span-other-tenant"],
      effectiveAt: "2026-08-01T00:00:00.000Z",
      expiresAt: "2027-08-01T00:00:00.000Z",
      lexicalScore: 1,
      semanticScore: 1,
      rerankScore: 1,
      contradictionGroupId: null,
      dataClassification: "synthetic-no-phi",
      authorizedPurposes: ["synthetic-context-review"],
      contentHash: createClinicalEvidenceHash("p34-wrong-tenant-content")
    }
  ];
  const retrieval = retrieveAuthorizedClinicalContext({
    tenantId: "synthetic-tenant",
    purpose: "synthetic-context-review",
    query: "synthetic follow-up",
    canonicalEntityId: "concept:synthetic-follow-up",
    authorizedDataClassifications: ["synthetic-no-phi"],
    maximumResults: 4,
    minimumEvidenceCount: 1,
    minimumRerankScore: 0.8,
    evaluatedAt
  }, retrievalCandidates, {
    authenticatedTenantId: "synthetic-tenant",
    authenticatedActorIdHash: identityHash,
    authorizedPurposes: ["synthetic-context-review"],
    authorizedDataClassifications: ["synthetic-no-phi"],
    authorizationEvidenceHash: createClinicalEvidenceHash("p34-synthetic-retrieval-authorization"),
    evaluatedAt
  });

  const externalValidation = evaluateExternalClinicalValidation({
    validationId: "p34-internal-validation-only",
    capabilityId: "p34-patient-take-home-preview",
    internalOnly: true,
    siteIds: ["synthetic-site-a"],
    healthSystemIds: ["synthetic-system-a"],
    acquisitionSystemIds: ["synthetic-input-system"],
    cohortIds: ["synthetic-cohort"],
    demographicSubgroups: ["synthetic-subgroup"],
    workflowSettings: ["synthetic-review"],
    timePeriods: ["synthetic-period"],
    distributionShiftEvaluated: false,
    metrics: {
      discrimination: null,
      sensitivity: null,
      specificity: null,
      calibrationError: 0.02,
      abstentionRate: 0.1,
      missingCriticalStepRate: 0,
      unsupportedExtraRate: 0,
      clinicianOverrideRate: 0.05,
      downstreamHarmProxyRate: 0
    },
    subgroupWorstCellPassed: true,
    evidenceHash: createClinicalEvidenceHash("p34-internal-validation-evidence"),
    recordedAt: "2026-08-20T10:00:00.000Z",
    expiresAt: "2027-02-20T10:00:00.000Z",
    namedReviewerApprovalHashes: []
  }, evaluatedAt);
  const oversight = evaluateOversightDriftControl({
    totalActions: 20,
    reviewedActions: 20,
    overrides: 1,
    corrections: 1,
    errors: 0,
    silentAcceptances: 0,
    medianReviewLatencyMs: 800,
    riskCohortCoverage: 1,
    requestedReviewRate: 1,
    approvedReviewRate: 1,
    oversightReductionApprovalHash: null
  });
  const patientTakeHome = renderPatientTakeHome({
    documentId: "p34-patient-take-home-preview",
    tenantId: "synthetic-tenant",
    sourceFacts: [{
      factId: "synthetic-fact-001",
      approvedText: "A care-team follow-up item remains available for clinician review.",
      sourceSpanIds: ["span-p34-synthetic-001"],
      approvedForEducation: true
    }],
    preferences: {
      preferenceId: "p34-synthetic-patient-preferences",
      channel: "portal",
      timing: "clinician-directed",
      language: "en",
      accessibility: ["plain-language"],
      proxyIdHash: null,
      proxyAuthorizationHash: null,
      clinicianReviewRequired: true,
      sensitiveResultRestriction: "approved-education-only",
      effectiveAt: "2026-08-01T00:00:00.000Z",
      expiresAt: "2027-08-01T00:00:00.000Z"
    },
    clinicianReview: { reviewerIdHash: null, decision: "pending", reviewedAt: null },
    generatedAt: evaluatedAt
  });
  const coding = evaluateMedicalCodingContract({
    contractId: "p34-assisted-coding-contract",
    capabilityId: "p34-coding-draft-preview",
    mode: "assisted",
    specialtyCoverage: ["synthetic-general-documentation"],
    humanReviewRequired: true,
    auditRequired: true,
    ruleSetOwner: "coding-governance-owner",
    ruleVersion: "synthetic-rules-v1",
    evidenceHashes: [createClinicalEvidenceHash("p34-synthetic-coding-evidence")],
    effectiveAt: "2026-08-01T00:00:00.000Z",
    expiresAt: "2027-02-01T00:00:00.000Z",
    rollbackPath: ["discard draft", "retain source evidence"],
    billingReleaseAuthorityHash: null
  }, evaluatedAt);
  const operations = evaluateOperationalRecovery({
    invocationId: "p34-synthetic-invocation",
    tenantId: "synthetic-tenant",
    traceId: "trace-p34-clinical-os-001",
    idempotencyKey: "p34-synthetic-invocation-idempotency",
    attempt: 1,
    maximumAttempts: 2,
    failureClass: "transient",
    state: "ready",
    checkpointHash: createClinicalEvidenceHash("p34-synthetic-checkpoint"),
    checkpointVerified: true,
    suspended: false,
    costUsd: 0,
    latencyMs: 15,
    containsRawPhi: false,
    containsSecrets: false
  });
  const claims = evaluateApprovedPublicClaim({
    claimId: "p34-synthetic-boundary-claim",
    category: "security",
    ownerRole: "claims-governance-owner",
    approvedWording: "The p.34 local demonstration keeps external provider calls disabled by default.",
    primaryEvidence: [{
      sourceId: "p34-repository-policy",
      sourceUrl: "https://www.scrimedsolutions.com/validation-and-evidence",
      evidenceHash: createClinicalEvidenceHash("p34-local-feature-flag-evidence")
    }],
    scope: "local synthetic demonstration candidate",
    limitations: ["not a certification", "not evidence of a production deployment"],
    approvalHashes: [createClinicalEvidenceHash("p34-synthetic-claims-review")],
    approvedAt: "2026-08-20T11:00:00.000Z",
    expiresAt: "2027-02-20T11:00:00.000Z",
    targetAudience: "internal technical reviewer",
    channel: "p34 operator console",
    revalidateAt: "2026-11-20T11:00:00.000Z"
  }, evaluatedAt);

  const payload = {
    version: p34ClinicalOperatingSystemVersion,
    boundary: p34ClinicalOperatingSystemBoundary,
    autonomy,
    governance,
    phi: {
      registry: p34SyntheticPhiFieldRegistry,
      startupValidation: phiRegistryValidation,
      egress: phiEgress,
      breakGlass
    },
    sandbox,
    retrieval,
    externalValidation,
    oversight,
    patientTakeHome,
    coding,
    operations,
    claims,
    externalProviderCallsExecuted: false,
    phiProcessed: false,
    clinicalActionAuthorized: false,
    billingSubmissionAuthorized: false,
    migrationExecuted: false,
    deploymentAuthorized: false
  };
  return {
    ...payload,
    summaryHash: recordHash("p34-clinical-operating-system-summary", payload)
  };
}
