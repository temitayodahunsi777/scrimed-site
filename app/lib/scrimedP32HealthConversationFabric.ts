import { createAuditHash } from "./scrimed-work/audit";
import { createClinicalEvidenceHash } from "./clinicalEvidenceControls";
import type { DataClassification } from "./scrimed-work/types";
import type { PolicyDecision } from "./scrimed-work/p32Contracts";

export const scrimedP32HealthConversationFabricVersion =
  "scrimed-p32-health-conversation-fabric-v1-2026-07-28";

export const scrimedP32HealthConversationFabricBoundary =
  "SCRIMED health conversations are tenant-isolated, purpose-bound, revocable, and role-specific. Patient copilots cannot use clinician tools or create clinical decisions. Clinician copilots produce reviewable drafts only. No live PHI, autonomous diagnosis, prescribing, order entry, payer submission, EHR writeback, or cross-domain memory reuse is authorized.";

export type DataPurpose =
  | "patient-education"
  | "patient-self-management-support"
  | "care-coordination"
  | "clinical-documentation-draft"
  | "clinical-evidence-review"
  | "research-review";

export type ApprovalState = "not-required" | "pending" | "approved" | "rejected" | "revoked" | "expired";

export type HealthAgentKind = "patient-copilot" | "clinician-copilot";

export type PatientCopilotPolicy = {
  policyId: string;
  agentKind: "patient-copilot";
  productIdentities: readonly ["MyVitals AI", "CareExplain"];
  allowedPurposes: DataPurpose[];
  allowedTools: string[];
  prohibitedTools: string[];
  allowedActionClasses: Array<"read" | "education-draft" | "navigation-draft">;
  clinicalDecisionAuthority: false;
  ehrMutationAuthority: false;
  policyHash: string;
};

export type ClinicianCopilotPolicy = {
  policyId: string;
  agentKind: "clinician-copilot";
  productIdentities: readonly ["Sanar AI", "Perfect Chart"];
  allowedPurposes: DataPurpose[];
  allowedTools: string[];
  prohibitedTools: string[];
  allowedActionClasses: Array<"read" | "clinical-draft" | "evidence-draft">;
  namedClinicianReviewRequired: true;
  clinicalDecisionAuthority: false;
  ehrMutationAuthority: false;
  policyHash: string;
};

export type HealthContextBoundary = {
  boundaryId: string;
  tenantId: string;
  healthContextId: string;
  memoryScope: "health-only";
  permittedDataClassifications: DataClassification[];
  nonHealthContextDefault: "deny";
  crossDomainGrantRequired: true;
  grantMustBePurposeBound: true;
  grantMustBeRevocable: true;
  healthDataMayFlowToUnrelatedContexts: false;
  minimumNecessaryScopeRequired: true;
  boundaryHash: string;
};

export type ContextGrant = {
  grantId: string;
  tenantId: string;
  subjectReferenceHash: string;
  sourceContextId: string;
  targetHealthContextId: string;
  purpose: DataPurpose;
  permittedDataClassifications: DataClassification[];
  permittedResourceReferences: string[];
  issuedByActorIdHash: string;
  issuedAt: string;
  expiresAt: string;
  revokedAt: string | null;
  revocationReason: string | null;
  state: Extract<ApprovalState, "approved" | "revoked" | "expired">;
  revocable: true;
  grantHash: string;
};

export type ActionPolicy = {
  actionPolicyId: string;
  actionClass:
    | "read"
    | "education-draft"
    | "navigation-draft"
    | "clinical-draft"
    | "evidence-draft"
    | "clinician-only"
    | "clinical-mutation"
    | "payer-mutation";
  requiredAgentKind: HealthAgentKind | "either";
  requiredPurpose: DataPurpose;
  requiredHumanRole: string | null;
  consequential: boolean;
  policyHash: string;
};

export type ActionAuthorization = {
  authorizationId: string;
  tenantId: string;
  agentKind: HealthAgentKind;
  toolId: string;
  decision: PolicyDecision;
  reasonCodes: string[];
  contextGrantId: string | null;
  humanReviewRequired: boolean;
  actionExecutionAllowed: boolean;
  ehrWritebackAllowed: false;
  payerSubmissionAllowed: false;
  diagnosisAuthorityGranted: false;
  prescribingAuthorityGranted: false;
  evaluatedAt: string;
  auditHash: string;
};

export type SharedEncounterFact = {
  factId: string;
  summary: string;
  sourceReference: string;
  sourceTimestamp: string;
  provenanceHash: string;
  approvalState: Extract<ApprovalState, "pending" | "approved" | "rejected">;
};

export type SharedEncounterApproval = {
  approvalId: string;
  reviewerIdentityHash: string;
  reviewerRole: "named-clinician" | "patient-or-authorized-representative";
  decision: Extract<ApprovalState, "approved" | "rejected">;
  decidedAt: string;
  approvalHash: string;
};

export type SharedEncounterBrief = {
  briefId: string;
  tenantId: string;
  subjectReferenceHash: string;
  encounterReferenceHash: string;
  approvedFacts: SharedEncounterFact[];
  unresolvedQuestions: string[];
  patientGoals: string[];
  clinicianReviewedActions: string[];
  approvals: SharedEncounterApproval[];
  status: "draft" | "awaiting-approval" | "approved-for-internal-handoff" | "blocked";
  internalHandoffAllowed: boolean;
  recordWritebackAllowed: false;
  createdAt: string;
  updatedAt: string;
  briefHash: string;
};

export type ConversationHandoff = {
  handoffId: string;
  tenantId: string;
  fromAgent: HealthAgentKind;
  toAgent: HealthAgentKind;
  purpose: DataPurpose;
  sharedBriefId: string;
  contextGrantId: string;
  approvalState: ApprovalState;
  transferredReferenceHashes: string[];
  rawConversationTransferred: false;
  rawPhiRecordedInAudit: false;
  createdAt: string;
  auditHash: string;
};

const safeReferencePattern = /^[A-Za-z0-9][A-Za-z0-9._:/-]{2,159}$/;
const hashPattern = /^[0-9a-f]{64}$/i;
const prohibitedClinicalToolPattern =
  /(?:diagnos|prescrib|medical-order|ehr-write|payer-submit|treatment-select|patient-disposition)/i;

function canonical(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort();
}

function validIso(value: string) {
  return Number.isFinite(Date.parse(value));
}

function assertSafeMetadataReference(value: string, label: string) {
  if (!safeReferencePattern.test(value) || /(?:token|secret|password|bearer|cookie)/i.test(value)) {
    throw new Error(`${label} must be a bounded metadata reference`);
  }
}

export function buildPatientCopilotPolicy(): PatientCopilotPolicy {
  const base = {
    policyId: "patient-copilot-policy-v1",
    agentKind: "patient-copilot" as const,
    productIdentities: ["MyVitals AI", "CareExplain"] as const,
    allowedPurposes: ["patient-education", "patient-self-management-support", "care-coordination"] as DataPurpose[],
    allowedTools: ["care-explain.education-draft", "myvitals.synthetic-signal-read", "patient-navigation.read"],
    prohibitedTools: [
      "clinical-diagnosis",
      "clinical-prescribing",
      "medical-order",
      "ehr-writeback",
      "payer-submission"
    ],
    allowedActionClasses: ["read", "education-draft", "navigation-draft"] as PatientCopilotPolicy["allowedActionClasses"],
    clinicalDecisionAuthority: false as const,
    ehrMutationAuthority: false as const
  };
  return { ...base, policyHash: createAuditHash({ type: "patient-copilot-policy", base }) };
}

export function buildClinicianCopilotPolicy(): ClinicianCopilotPolicy {
  const base = {
    policyId: "clinician-copilot-policy-v1",
    agentKind: "clinician-copilot" as const,
    productIdentities: ["Sanar AI", "Perfect Chart"] as const,
    allowedPurposes: [
      "care-coordination",
      "clinical-documentation-draft",
      "clinical-evidence-review",
      "research-review"
    ] as DataPurpose[],
    allowedTools: ["clinical-context.read", "evidence-summary.draft", "perfect-chart.documentation-draft"],
    prohibitedTools: [
      "clinical-diagnosis-finalize",
      "clinical-prescribing",
      "medical-order",
      "ehr-writeback",
      "payer-submission"
    ],
    allowedActionClasses: ["read", "clinical-draft", "evidence-draft"] as ClinicianCopilotPolicy["allowedActionClasses"],
    namedClinicianReviewRequired: true as const,
    clinicalDecisionAuthority: false as const,
    ehrMutationAuthority: false as const
  };
  return { ...base, policyHash: createAuditHash({ type: "clinician-copilot-policy", base }) };
}

export function createHealthContextBoundary(
  input: Omit<HealthContextBoundary, "memoryScope" | "nonHealthContextDefault" | "crossDomainGrantRequired" | "grantMustBePurposeBound" | "grantMustBeRevocable" | "healthDataMayFlowToUnrelatedContexts" | "minimumNecessaryScopeRequired" | "boundaryHash">
): HealthContextBoundary {
  assertSafeMetadataReference(input.boundaryId, "boundaryId");
  assertSafeMetadataReference(input.tenantId, "tenantId");
  assertSafeMetadataReference(input.healthContextId, "healthContextId");
  if (
    input.permittedDataClassifications.some(
      (classification) => classification === "phi-blocked" || classification === "unknown"
    )
  ) {
    throw new Error("Current no-PHI health context cannot admit blocked or unknown classifications");
  }
  const base = {
    ...input,
    permittedDataClassifications: [...new Set(input.permittedDataClassifications)].sort(),
    memoryScope: "health-only" as const,
    nonHealthContextDefault: "deny" as const,
    crossDomainGrantRequired: true as const,
    grantMustBePurposeBound: true as const,
    grantMustBeRevocable: true as const,
    healthDataMayFlowToUnrelatedContexts: false as const,
    minimumNecessaryScopeRequired: true as const
  };
  return { ...base, boundaryHash: createAuditHash({ type: "health-context-boundary", base }) };
}

export function createContextGrant(
  input: Omit<ContextGrant, "revokedAt" | "revocationReason" | "state" | "revocable" | "grantHash">
): ContextGrant {
  for (const [label, value] of [
    ["grantId", input.grantId],
    ["tenantId", input.tenantId],
    ["sourceContextId", input.sourceContextId],
    ["targetHealthContextId", input.targetHealthContextId]
  ] as const) {
    assertSafeMetadataReference(value, label);
  }
  if (!hashPattern.test(input.subjectReferenceHash) || !hashPattern.test(input.issuedByActorIdHash)) {
    throw new Error("Context grants require hashed subject and issuer references");
  }
  if (!validIso(input.issuedAt) || !validIso(input.expiresAt) || Date.parse(input.expiresAt) <= Date.parse(input.issuedAt)) {
    throw new Error("Context grant timestamps are invalid");
  }
  if (!input.permittedResourceReferences.length) {
    throw new Error("Context grants must be minimum-necessary and name at least one permitted resource");
  }
  input.permittedResourceReferences.forEach((value) => assertSafeMetadataReference(value, "permitted resource"));
  if (
    input.permittedDataClassifications.some(
      (classification) => classification === "phi-blocked" || classification === "unknown"
    )
  ) {
    throw new Error("Current context grants cannot authorize PHI or unknown data");
  }
  const base = {
    ...input,
    permittedDataClassifications: [...new Set(input.permittedDataClassifications)].sort(),
    permittedResourceReferences: canonical(input.permittedResourceReferences),
    revokedAt: null,
    revocationReason: null,
    state: "approved" as const,
    revocable: true as const
  };
  return { ...base, grantHash: createAuditHash({ type: "context-grant", base }) };
}

export function revokeContextGrant(
  grant: ContextGrant,
  input: { revokedAt: string; reason: string }
): ContextGrant {
  if (!validIso(input.revokedAt) || Date.parse(input.revokedAt) < Date.parse(grant.issuedAt)) {
    throw new Error("Context grant revocation timestamp is invalid");
  }
  if (!input.reason.trim()) throw new Error("Context grant revocation requires a reason");
  const base = {
    ...grant,
    revokedAt: input.revokedAt,
    revocationReason: input.reason.trim(),
    state: "revoked" as const
  };
  delete (base as Partial<ContextGrant>).grantHash;
  return { ...base, grantHash: createAuditHash({ type: "context-grant", base }) };
}

export function createActionPolicy(
  input: Omit<ActionPolicy, "policyHash">
): ActionPolicy {
  assertSafeMetadataReference(input.actionPolicyId, "actionPolicyId");
  const base = { ...input };
  return { ...base, policyHash: createAuditHash({ type: "health-action-policy", base }) };
}

export function authorizeHealthAction(input: {
  authorizationId: string;
  boundary: HealthContextBoundary;
  agentPolicy: PatientCopilotPolicy | ClinicianCopilotPolicy;
  actionPolicy: ActionPolicy;
  tenantId: string;
  sourceContext: "health" | "non-health";
  toolId: string;
  resourceReference: string;
  dataClassification: DataClassification;
  purpose: DataPurpose;
  contextGrant?: ContextGrant;
  evaluatedAt: string;
}): ActionAuthorization {
  const reasons: string[] = [];
  assertSafeMetadataReference(input.authorizationId, "authorizationId");
  assertSafeMetadataReference(input.resourceReference, "resourceReference");
  if (!validIso(input.evaluatedAt)) throw new Error("Action authorization requires a valid evaluation timestamp");
  if (input.tenantId !== input.boundary.tenantId) reasons.push("CROSS_TENANT_CONTEXT_DENIED");
  if (!input.agentPolicy.allowedPurposes.includes(input.purpose) || input.actionPolicy.requiredPurpose !== input.purpose) {
    reasons.push("PURPOSE_NOT_AUTHORIZED");
  }
  if (!input.boundary.permittedDataClassifications.includes(input.dataClassification)) {
    reasons.push("DATA_CLASS_NOT_AUTHORIZED");
  }
  if (input.agentPolicy.prohibitedTools.includes(input.toolId) || prohibitedClinicalToolPattern.test(input.toolId)) {
    reasons.push("PROHIBITED_CLINICAL_OR_MUTATION_TOOL");
  }
  if (!input.agentPolicy.allowedTools.includes(input.toolId)) reasons.push("TOOL_NOT_AUTHORIZED");
  if (
    input.actionPolicy.requiredAgentKind !== "either" &&
    input.actionPolicy.requiredAgentKind !== input.agentPolicy.agentKind
  ) {
    reasons.push("ROLE_BOUNDARY_VIOLATION");
  }
  if (
    input.agentPolicy.agentKind === "patient-copilot" &&
    !input.agentPolicy.allowedActionClasses.includes(
      input.actionPolicy.actionClass as PatientCopilotPolicy["allowedActionClasses"][number]
    )
  ) {
    reasons.push("PATIENT_AGENT_CLINICIAN_ACTION_DENIED");
  }
  if (input.actionPolicy.actionClass === "clinical-mutation" || input.actionPolicy.actionClass === "payer-mutation") {
    reasons.push("CONSEQUENTIAL_MUTATION_BLOCKED");
  }

  let contextGrantId: string | null = null;
  if (input.sourceContext === "non-health") {
    const grant = input.contextGrant;
    if (!grant) reasons.push("EXPLICIT_CROSS_DOMAIN_GRANT_REQUIRED");
    else {
      contextGrantId = grant.grantId;
      if (grant.tenantId !== input.tenantId || grant.targetHealthContextId !== input.boundary.healthContextId) {
        reasons.push("CONTEXT_GRANT_SCOPE_MISMATCH");
      }
      if (grant.purpose !== input.purpose) reasons.push("CONTEXT_GRANT_PURPOSE_MISMATCH");
      if (!grant.permittedDataClassifications.includes(input.dataClassification)) {
        reasons.push("CONTEXT_GRANT_DATA_CLASS_MISMATCH");
      }
      if (!grant.permittedResourceReferences.includes(input.resourceReference)) {
        reasons.push("CONTEXT_GRANT_RESOURCE_MISMATCH");
      }
      if (grant.state !== "approved" || grant.revokedAt || Date.parse(grant.expiresAt) <= Date.parse(input.evaluatedAt)) {
        reasons.push("CONTEXT_GRANT_INACTIVE");
      }
    }
  }

  const blocked = reasons.length > 0;
  const reviewRequired =
    !blocked &&
    (input.agentPolicy.agentKind === "clinician-copilot" ||
      input.actionPolicy.consequential ||
      input.actionPolicy.requiredHumanRole !== null);
  const decision: PolicyDecision = blocked ? "BLOCK" : reviewRequired ? "REQUIRE_HUMAN" : "ALLOW";
  const base = {
    authorizationId: input.authorizationId,
    tenantId: input.tenantId,
    agentKind: input.agentPolicy.agentKind,
    toolId: input.toolId,
    decision,
    reasonCodes: reasons.length
      ? [...new Set(reasons)].sort()
      : [reviewRequired ? "NAMED_HUMAN_REVIEW_REQUIRED" : "BOUNDED_HEALTH_ACTION_ALLOWED"],
    contextGrantId,
    humanReviewRequired: decision !== "ALLOW",
    actionExecutionAllowed: decision === "ALLOW",
    ehrWritebackAllowed: false as const,
    payerSubmissionAllowed: false as const,
    diagnosisAuthorityGranted: false as const,
    prescribingAuthorityGranted: false as const,
    evaluatedAt: input.evaluatedAt
  };
  return { ...base, auditHash: createAuditHash({ type: "health-action-authorization", input, decision: base }) };
}

export function buildSharedEncounterBrief(
  input: Omit<SharedEncounterBrief, "status" | "internalHandoffAllowed" | "recordWritebackAllowed" | "briefHash">
): SharedEncounterBrief {
  if (!hashPattern.test(input.subjectReferenceHash) || !hashPattern.test(input.encounterReferenceHash)) {
    throw new Error("Shared encounter briefs require hashed subject and encounter references");
  }
  if (!validIso(input.createdAt) || !validIso(input.updatedAt)) {
    throw new Error("Shared encounter brief timestamps are invalid");
  }
  if (
    input.approvedFacts.some(
      (fact) =>
        !fact.sourceReference ||
        !validIso(fact.sourceTimestamp) ||
        !hashPattern.test(fact.provenanceHash)
    )
  ) {
    throw new Error("Shared encounter facts require source provenance and timestamps");
  }
  const hasRejectedFact = input.approvedFacts.some((fact) => fact.approvalState === "rejected");
  const base = {
    ...input,
    status: hasRejectedFact ? ("blocked" as const) : ("awaiting-approval" as const),
    internalHandoffAllowed: false,
    recordWritebackAllowed: false as const
  };
  return { ...base, briefHash: createAuditHash({ type: "shared-encounter-brief", base }) };
}

export function approveSharedEncounterBrief(
  brief: SharedEncounterBrief,
  approval: Omit<SharedEncounterApproval, "approvalHash">
): SharedEncounterBrief {
  if (!hashPattern.test(approval.reviewerIdentityHash) || !validIso(approval.decidedAt)) {
    throw new Error("Shared encounter approvals require a hashed named reviewer and timestamp");
  }
  const approvalBase = { ...approval };
  const recorded: SharedEncounterApproval = {
    ...approvalBase,
    approvalHash: createAuditHash({ type: "shared-encounter-approval", briefId: brief.briefId, approval: approvalBase })
  };
  const approvals = [...brief.approvals.filter((entry) => entry.approvalId !== recorded.approvalId), recorded];
  const namedClinicianApproved = approvals.some(
    (entry) => entry.reviewerRole === "named-clinician" && entry.decision === "approved"
  );
  const rejected = approvals.some((entry) => entry.decision === "rejected");
  const factsApproved = brief.approvedFacts.length > 0 && brief.approvedFacts.every((fact) => fact.approvalState === "approved");
  const base = {
    ...brief,
    approvals,
    status: rejected
      ? ("blocked" as const)
      : namedClinicianApproved && factsApproved
        ? ("approved-for-internal-handoff" as const)
        : ("awaiting-approval" as const),
    internalHandoffAllowed: !rejected && namedClinicianApproved && factsApproved,
    recordWritebackAllowed: false as const,
    updatedAt: approval.decidedAt
  };
  delete (base as Partial<SharedEncounterBrief>).briefHash;
  return { ...base, briefHash: createAuditHash({ type: "shared-encounter-brief", base }) };
}

export function createConversationHandoff(
  input: Omit<
    ConversationHandoff,
    | "sharedBriefId"
    | "contextGrantId"
    | "approvalState"
    | "rawConversationTransferred"
    | "rawPhiRecordedInAudit"
    | "auditHash"
  > & {
    brief: SharedEncounterBrief;
    contextGrant: ContextGrant;
  }
): ConversationHandoff {
  if (
    input.brief.tenantId !== input.tenantId ||
    input.contextGrant.tenantId !== input.tenantId ||
    input.contextGrant.subjectReferenceHash !== input.brief.subjectReferenceHash
  ) {
    throw new Error("Conversation handoff tenant and subject bindings are invalid");
  }
  if (
    input.brief.status !== "approved-for-internal-handoff" ||
    !input.brief.internalHandoffAllowed
  ) {
    throw new Error("Conversation handoff requires an approved shared encounter brief");
  }
  if (
    input.contextGrant.state !== "approved" ||
    input.contextGrant.revokedAt !== null ||
    input.contextGrant.purpose !== input.purpose ||
    !validIso(input.createdAt) ||
    Date.parse(input.createdAt) < Date.parse(input.contextGrant.issuedAt) ||
    Date.parse(input.createdAt) >= Date.parse(input.contextGrant.expiresAt)
  ) {
    throw new Error("Conversation handoff requires an approved, purpose-bound context grant");
  }
  if (input.fromAgent === input.toAgent) {
    throw new Error("Conversation handoff requires distinct agent identities");
  }
  if (!input.transferredReferenceHashes.length || input.transferredReferenceHashes.some((value) => !hashPattern.test(value))) {
    throw new Error("Conversation handoff must transfer digest references only");
  }
  if (!input.transferredReferenceHashes.includes(createClinicalEvidenceHash(input.brief))) {
    throw new Error("Conversation handoff must bind the approved shared brief fingerprint");
  }
  const { brief, contextGrant, ...handoff } = input;
  const base = {
    ...handoff,
    sharedBriefId: brief.briefId,
    contextGrantId: contextGrant.grantId,
    approvalState: "approved" as const,
    transferredReferenceHashes: canonical(input.transferredReferenceHashes),
    rawConversationTransferred: false as const,
    rawPhiRecordedInAudit: false as const
  };
  return { ...base, auditHash: createAuditHash({ type: "conversation-handoff", base }) };
}

export function getHealthConversationFabricSummary() {
  return {
    version: scrimedP32HealthConversationFabricVersion,
    patientToolbelt: buildPatientCopilotPolicy().productIdentities,
    clinicianToolbelt: buildClinicianCopilotPolicy().productIdentities,
    crossDomainDefault: "deny",
    explicitRevocableGrantRequired: true,
    namedClinicianReviewRequired: true,
    ehrWritebackAllowed: false,
    payerSubmissionAllowed: false,
    autonomousClinicalAuthority: false,
    boundary: scrimedP32HealthConversationFabricBoundary
  } as const;
}
