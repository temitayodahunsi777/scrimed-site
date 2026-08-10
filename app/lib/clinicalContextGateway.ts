import { createHash } from "node:crypto";
import type {
  CanonicalClinicalEntity,
  ClinicalDataFabricSourceContract,
  ClinicalSemanticMapping
} from "./clinicalDataFabric";
import { getClinicalDataFabricSummary } from "./clinicalDataFabric";
import type {
  ClinicalDataGovernanceDecision,
  ClinicalDataGovernanceRequest,
  ClinicalGovernanceBaaDpaStatus,
  ClinicalGovernanceConsentStatus,
  ClinicalGovernanceDataClass,
  ClinicalGovernanceDestination,
  ClinicalGovernancePurpose,
  ClinicalGovernanceRequesterRole,
  ClinicalGovernanceReviewStatus
} from "./clinicalDataGovernance";
import {
  clinicalDataGovernancePolicyVersion,
  evaluateClinicalDataGovernanceRequest
} from "./clinicalDataGovernance";
import {
  clinicalContextIsolationPolicy,
  evaluateClinicalContextLens,
  type ClinicalContextLensResult
} from "./clinicalEvidenceControls";
import {
  clinicalSearchFabricBoundary,
  clinicalSearchFabricVersion
} from "./clinicalSearchFabric";

export type ClinicalContextGatewayScope =
  | "patient-context-summary"
  | "clinical-workflow-context"
  | "payer-rcm-context"
  | "imaging-metadata-context"
  | "medication-context"
  | "research-evidence-context"
  | "population-health-context"
  | "operations-context"
  | "source-contract-review";

export type ClinicalContextGatewayRequest = {
  requesterRole: ClinicalGovernanceRequesterRole;
  purposeOfUse: ClinicalGovernancePurpose;
  sourceContractId: string;
  requestedContextScope: ClinicalContextGatewayScope;
  requestedConcepts: CanonicalClinicalEntity[];
  dataClasses: ClinicalGovernanceDataClass[];
  destination: ClinicalGovernanceDestination;
  consentStatus: ClinicalGovernanceConsentStatus;
  humanReviewStatus: ClinicalGovernanceReviewStatus;
  baaDpaStatus: ClinicalGovernanceBaaDpaStatus;
  tenantScoped: boolean;
  minimumNecessary: boolean;
  productionConnectorApproved: boolean;
  externalModelApproved: boolean;
  residencyRegion: string;
  traceId?: string;
};

export type ClinicalContextGatewayDecisionStatus =
  | "semantic-context-ready"
  | "review-required"
  | "blocked";

export type ClinicalContextGatewaySemanticConcept = {
  entity: CanonicalClinicalEntity;
  standardBindings: string[];
  requiredProvenance: string[];
  confidenceInputs: string[];
  limitations: string[];
};

export type ClinicalContextGatewayEnvelope = {
  envelopeVersion: typeof clinicalContextGatewayEnvelopeVersion;
  deliveryMode: "semantic-contract-only";
  sourceContractId: string;
  sourceKind: ClinicalDataFabricSourceContract["kind"];
  requestedContextScope: ClinicalContextGatewayScope;
  requestedConcepts: CanonicalClinicalEntity[];
  allowedSemanticConcepts: ClinicalContextGatewaySemanticConcept[];
  evidenceRequirements: string[];
  blockedRawAccess: string[];
  downstreamAgentInstructions: string[];
  containsPhi: false;
  includesRawSourcePayload: false;
  includesRawDatabaseSchema: false;
  includesCredentials: false;
};

export type ClinicalContextGatewayAuditEnvelope = {
  gatewayVersion: typeof clinicalContextGatewayVersion;
  governancePolicyVersion: typeof clinicalDataGovernancePolicyVersion;
  traceId: string;
  sourceContractId: string;
  route: typeof clinicalContextGatewayApiRoute;
  action: "semantic-context-request";
  decision: ClinicalContextGatewayDecisionStatus;
  governanceDecision: ClinicalDataGovernanceDecision["status"];
  inputClassification: ClinicalDataGovernanceDecision["requestClassification"];
  phiDetected: false;
  syntheticOnly: true;
  rawAccessBlocked: true;
  humanReviewRequired: boolean;
  requestHash: string;
  envelopeHash: string | null;
};

export type ClinicalContextGatewayEvaluation = {
  status: ClinicalContextGatewayDecisionStatus;
  statusCode: 200 | 202 | 403;
  allowed: boolean;
  requiresHumanReview: boolean;
  sourceContract: Pick<
    ClinicalDataFabricSourceContract,
    "id" | "kind" | "name" | "standards" | "canonicalEntities"
  > | null;
  governanceDecision: ClinicalDataGovernanceDecision;
  blockers: string[];
  reviewRequirements: string[];
  contextEnvelope: ClinicalContextGatewayEnvelope | null;
  reviewPacket: {
    sourceContractId: string;
    requestedContextScope: ClinicalContextGatewayScope;
    requestedConcepts: CanonicalClinicalEntity[];
    reason: string;
    requiredReviewers: string[];
    retainedBoundaries: string[];
  } | null;
  contextLens: ClinicalContextLensResult | null;
  auditEnvelope: ClinicalContextGatewayAuditEnvelope;
  rationale: string;
};

export type ClinicalContextGatewayValidationCheck = {
  id: string;
  passed: boolean;
  detail: string;
};

export type ClinicalContextGatewaySummary = {
  service: "scrimed-clinical-context-gateway";
  status: typeof clinicalContextGatewayStatus;
  version: typeof clinicalContextGatewayVersion;
  envelopeVersion: typeof clinicalContextGatewayEnvelopeVersion;
  route: typeof clinicalContextGatewayRoute;
  apiRoute: typeof clinicalContextGatewayApiRoute;
  briefRoute: typeof clinicalContextGatewayBriefRoute;
  updated: "2026-07-03";
  dataBoundary: "governed-semantic-context-only-no-live-phi";
  rawSchemaAccess: "blocked";
  rawConnectorPayloadAccess: "blocked";
  clinicalCareAuthority: "not-authorized-live-care";
  recordMutationAuthority: "not-authorized";
  payerSubmissionAuthority: "not-authorized";
  patientOutreachAuthority: "not-authorized";
  productionConnectorAuthority: "not-production-connector-approved";
  supportedScopes: ClinicalContextGatewayScope[];
  gatewayControls: string[];
  contextLens: {
    modes: Array<"public-evidence" | "clinical-context">;
    livePhiEnabled: false;
    unsupportedOrStaleContextAction: "abstain-or-require-review";
    sourceAndReasonRequired: true;
  };
  clinicalSearchFabric: {
    version: typeof clinicalSearchFabricVersion;
    pipeline: string[];
    externalCrawlerEnabled: false;
    patientSpecificCacheEnabled: false;
    conflictAction: "present-conflict-and-require-review";
    retrievalFailureIsNoEvidence: false;
    optimizationTarget: "cost-per-clinically-accepted-answer";
    boundary: typeof clinicalSearchFabricBoundary;
  };
  sourceContractCount: number;
  baselineEvaluationCount: number;
  baselineEvaluations: Array<{ id: string; decision: ClinicalContextGatewayEvaluation }>;
  validation: {
    status: "passed" | "failed";
    checks: ClinicalContextGatewayValidationCheck[];
  };
  boundary: typeof clinicalContextGatewayBoundary;
};

export const clinicalContextGatewayStatus =
  "clinical-context-gateway-ready-no-phi";
export const clinicalContextGatewayVersion =
  "scrimed-clinical-context-gateway-v2026-07-03";
export const clinicalContextGatewayEnvelopeVersion =
  "scrimed-context-envelope-v1";
export const clinicalContextGatewayRoute =
  "/healthcare-intelligence-os#clinical-context-gateway";
export const clinicalContextGatewayApiRoute = "/api/clinical-context-gateway";
export const clinicalContextGatewayBriefRoute =
  "/api/clinical-context-gateway/brief";

export const clinicalContextGatewayBoundary =
  "SCRIMED Clinical Context Gateway converts authorized metadata-only requests into governed semantic context envelopes for agents. It does not accept raw patient records, expose raw database schemas, expose raw connector payloads, store PHI, activate production connectors, mutate records, submit payer transactions, contact patients, diagnose, treat, prescribe, interpret imaging, or approve customer go-live.";

const supportedScopes: ClinicalContextGatewayScope[] = [
  "patient-context-summary",
  "clinical-workflow-context",
  "payer-rcm-context",
  "imaging-metadata-context",
  "medication-context",
  "research-evidence-context",
  "population-health-context",
  "operations-context",
  "source-contract-review"
];

const supportedDataClasses: ClinicalGovernanceDataClass[] = [
  "public",
  "metadata",
  "aggregate",
  "deidentified",
  "limited-dataset",
  "pii",
  "phi",
  "restricted-clinical",
  "genomic",
  "substance-use",
  "behavioral-health"
];

const supportedPurposes: ClinicalGovernancePurpose[] = [
  "platform-readiness",
  "audit-preparation",
  "internal-testing",
  "customer-sandbox-review",
  "treatment",
  "payment",
  "healthcare-operations",
  "research",
  "patient-access"
];

const supportedRoles: ClinicalGovernanceRequesterRole[] = [
  "public-visitor",
  "internal-operator",
  "tenant-admin",
  "pilot-lead",
  "reviewer",
  "clinician",
  "rcm-operator",
  "compliance-officer",
  "research-reviewer",
  "service-agent"
];

const supportedDestinations: ClinicalGovernanceDestination[] = [
  "public-api",
  "internal-control-plane",
  "tenant-workspace",
  "customer-controlled-environment",
  "external-model-provider",
  "system-of-record",
  "payer-network",
  "patient-channel",
  "research-workspace"
];

const supportedConsentStatuses: ClinicalGovernanceConsentStatus[] = [
  "not-required-for-metadata",
  "verified",
  "missing",
  "revoked",
  "unknown"
];

const supportedReviewStatuses: ClinicalGovernanceReviewStatus[] = [
  "not-required",
  "queued",
  "approved",
  "rejected",
  "expired"
];

const supportedBaaDpaStatuses: ClinicalGovernanceBaaDpaStatus[] = [
  "not-required-for-metadata",
  "active",
  "missing",
  "expired",
  "unknown"
];

const gatewayControls = [
  "strict metadata-only request schema",
  "source contract allowlist",
  "semantic concept allowlist",
  "Clinical Data Governance policy decision",
  "minimum necessary access",
  "tenant scope required",
  "no raw database schema exposure",
  "no raw connector payload exposure",
  "no credential exposure",
  "context envelope hashing",
  "audit envelope generation",
  "human review for deidentified, limited, research, or customer release paths",
  "blocked autonomous clinical, payer, outreach, and record-mutation actions"
];

const blockedRawAccess = [
  "raw database schema",
  "raw connector payload",
  "source-system credentials",
  "live patient identifiers",
  "free-text patient notes",
  "DICOM pixel data",
  "EHR writeback channel",
  "payer submission channel",
  "patient communication channel"
];

const downstreamAgentInstructions = [
  "Use only the semantic concepts listed in this envelope.",
  "Preserve provenance, evidence requirements, confidence inputs, and limitations in every output.",
  "Escalate missing, conflicting, low-confidence, clinical, payer, outreach, or record-mutation implications to human review.",
  "Do not infer diagnosis, treatment, prescribing, imaging interpretation, payer submission, patient outreach, or EHR writeback authority.",
  "Do not request raw source schemas, raw connector payloads, credentials, or unrestricted queries."
];

const allowedKeys = new Set([
  "requesterRole",
  "purposeOfUse",
  "sourceContractId",
  "requestedContextScope",
  "requestedConcepts",
  "dataClasses",
  "destination",
  "consentStatus",
  "humanReviewStatus",
  "baaDpaStatus",
  "tenantScoped",
  "minimumNecessary",
  "productionConnectorApproved",
  "externalModelApproved",
  "residencyRegion",
  "traceId"
]);

function hashJson(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function includesEveryString<T extends string>(values: unknown, allowedValues: readonly T[]): values is T[] {
  return (
    Array.isArray(values) &&
    values.length > 0 &&
    values.every((value) => typeof value === "string" && allowedValues.includes(value as T))
  );
}

function findSourceContract(sourceContractId: string) {
  return getClinicalDataFabricSummary().sourceContracts.find(
    (source) => source.id === sourceContractId
  ) ?? null;
}

function toGovernanceRequest(
  request: ClinicalContextGatewayRequest
): ClinicalDataGovernanceRequest {
  return {
    requesterRole: request.requesterRole,
    purposeOfUse: request.purposeOfUse,
    dataClasses: request.dataClasses,
    action: "semantic-context-request",
    destination: request.destination,
    consentStatus: request.consentStatus,
    humanReviewStatus: request.humanReviewStatus,
    baaDpaStatus: request.baaDpaStatus,
    tenantScoped: request.tenantScoped,
    minimumNecessary: request.minimumNecessary,
    productionConnectorApproved: request.productionConnectorApproved,
    externalModelApproved: request.externalModelApproved,
    residencyRegion: request.residencyRegion,
    sourceContractId: request.sourceContractId
  };
}

function getSemanticMappingsForConcepts(
  requestedConcepts: CanonicalClinicalEntity[]
): ClinicalSemanticMapping[] {
  const summary = getClinicalDataFabricSummary();
  return summary.semanticMappings.filter((mapping) =>
    requestedConcepts.includes(mapping.entity)
  );
}

function buildSemanticConcepts(
  requestedConcepts: CanonicalClinicalEntity[]
): ClinicalContextGatewaySemanticConcept[] {
  const summary = getClinicalDataFabricSummary();
  const mappings = getSemanticMappingsForConcepts(requestedConcepts);

  return requestedConcepts.map((entity) => {
    const mapping = mappings.find((candidate) => candidate.entity === entity);
    const nodeContract = summary.healthGraphNodeContracts.find((node) => node.entity === entity);

    return {
      entity,
      standardBindings: mapping?.primaryStandards ?? nodeContract?.requiredGovernanceTags ?? [],
      requiredProvenance: mapping?.requiredProvenance ?? nodeContract?.requiredProvenanceFields ?? [],
      confidenceInputs: mapping?.confidenceInputs ?? ["source trust", "recency", "review state", "provenance completeness"],
      limitations: [
        ...(mapping?.blockedAutonomy ?? nodeContract?.blockedUses ?? []),
        "semantic context only",
        "human review before clinical, payer, patient-facing, or record-impacting use"
      ]
    };
  });
}

function buildContextEnvelope(
  request: ClinicalContextGatewayRequest,
  sourceContract: ClinicalDataFabricSourceContract
): ClinicalContextGatewayEnvelope {
  return {
    envelopeVersion: clinicalContextGatewayEnvelopeVersion,
    deliveryMode: "semantic-contract-only",
    sourceContractId: sourceContract.id,
    sourceKind: sourceContract.kind,
    requestedContextScope: request.requestedContextScope,
    requestedConcepts: request.requestedConcepts,
    allowedSemanticConcepts: buildSemanticConcepts(request.requestedConcepts),
    evidenceRequirements: [
      ...sourceContract.requiredProfileEvidence,
      ...sourceContract.provenanceRequirements,
      "gateway audit envelope",
      "governance policy decision",
      "human review state"
    ],
    blockedRawAccess,
    downstreamAgentInstructions,
    containsPhi: false,
    includesRawSourcePayload: false,
    includesRawDatabaseSchema: false,
    includesCredentials: false
  };
}

function buildContextLens(
  request: ClinicalContextGatewayRequest,
  sourceContract: ClinicalDataFabricSourceContract
) {
  const publicEvidence = request.dataClasses.every((dataClass) => dataClass === "public");
  const sourceHash = hashJson({
    id: sourceContract.id,
    standards: sourceContract.standards,
    provenanceRequirements: sourceContract.provenanceRequirements
  });

  return evaluateClinicalContextLens(
    {
      mode: publicEvidence ? "public-evidence" : "clinical-context",
      tenantId: publicEvidence ? null : "synthetic-tenant-scope",
      taskType: request.requestedContextScope,
      dataClassification: publicEvidence ? "public" : "metadata",
      authenticated: request.requesterRole !== "public-visitor",
      tenantScoped: request.tenantScoped,
      minimumNecessary: request.minimumNecessary,
      consentVerified: ["verified", "not-required-for-metadata"].includes(request.consentStatus),
      humanReviewRequired: !publicEvidence,
      patientFit: publicEvidence ? "not-applicable" : "not-assessed",
      relevantHistory: request.requestedConcepts.map((concept) => `semantic-concept:${concept}`),
      sources: [
        {
          id: sourceContract.id,
          title: sourceContract.name,
          uri: `source-contract:${sourceContract.id}`,
          tenantScope: publicEvidence ? "public" : "synthetic-tenant-scope",
          trustTier: "reviewed",
          effectiveAt: "2026-07-17T00:00:00.000Z",
          expiresAt: null,
          provenanceHash: sourceHash
        }
      ],
      missingData: sourceContract.provenanceRequirements.map(
        (requirement) => `verify-at-runtime:${requirement}`
      ),
      confidenceScore: 0.8,
      calibrationStatus: "not-evaluated",
      contraindications: [],
      policyConstraints: sourceContract.blockedActions,
      proposedNextAction: "Review the semantic context envelope and source provenance with the assigned human reviewer."
    },
    "2026-07-17T12:00:00.000Z"
  );
}

function buildAuditEnvelope(input: {
  request: ClinicalContextGatewayRequest;
  status: ClinicalContextGatewayDecisionStatus;
  governanceDecision: ClinicalDataGovernanceDecision;
  envelope: ClinicalContextGatewayEnvelope | null;
}): ClinicalContextGatewayAuditEnvelope {
  return {
    gatewayVersion: clinicalContextGatewayVersion,
    governancePolicyVersion: clinicalDataGovernancePolicyVersion,
    traceId: input.request.traceId?.trim() || `context-${hashJson(input.request).slice(0, 16)}`,
    sourceContractId: input.request.sourceContractId,
    route: clinicalContextGatewayApiRoute,
    action: "semantic-context-request",
    decision: input.status,
    governanceDecision: input.governanceDecision.status,
    inputClassification: input.governanceDecision.requestClassification,
    phiDetected: false,
    syntheticOnly: true,
    rawAccessBlocked: true,
    humanReviewRequired: input.status === "review-required",
    requestHash: hashJson(input.request),
    envelopeHash: input.envelope ? hashJson(input.envelope) : null
  };
}

export function isClinicalContextGatewayRequest(value: unknown): value is ClinicalContextGatewayRequest {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<ClinicalContextGatewayRequest>;
  const keys = Object.keys(candidate);
  const fabric = getClinicalDataFabricSummary();
  const conceptSet = new Set(fabric.healthGraphNodeContracts.map((node) => node.entity));

  return (
    keys.length > 0 &&
    keys.every((key) => allowedKeys.has(key)) &&
    typeof candidate.requesterRole === "string" &&
    supportedRoles.includes(candidate.requesterRole as ClinicalGovernanceRequesterRole) &&
    typeof candidate.purposeOfUse === "string" &&
    supportedPurposes.includes(candidate.purposeOfUse as ClinicalGovernancePurpose) &&
    typeof candidate.sourceContractId === "string" &&
    candidate.sourceContractId.trim().length > 0 &&
    typeof candidate.requestedContextScope === "string" &&
    supportedScopes.includes(candidate.requestedContextScope as ClinicalContextGatewayScope) &&
    includesEveryString(candidate.requestedConcepts, Array.from(conceptSet)) &&
    includesEveryString(candidate.dataClasses, supportedDataClasses) &&
    typeof candidate.destination === "string" &&
    supportedDestinations.includes(candidate.destination as ClinicalGovernanceDestination) &&
    typeof candidate.consentStatus === "string" &&
    supportedConsentStatuses.includes(candidate.consentStatus as ClinicalGovernanceConsentStatus) &&
    typeof candidate.humanReviewStatus === "string" &&
    supportedReviewStatuses.includes(candidate.humanReviewStatus as ClinicalGovernanceReviewStatus) &&
    typeof candidate.baaDpaStatus === "string" &&
    supportedBaaDpaStatuses.includes(candidate.baaDpaStatus as ClinicalGovernanceBaaDpaStatus) &&
    typeof candidate.tenantScoped === "boolean" &&
    typeof candidate.minimumNecessary === "boolean" &&
    typeof candidate.productionConnectorApproved === "boolean" &&
    typeof candidate.externalModelApproved === "boolean" &&
    typeof candidate.residencyRegion === "string" &&
    (candidate.traceId === undefined || typeof candidate.traceId === "string")
  );
}

export function evaluateClinicalContextGatewayRequest(
  request: ClinicalContextGatewayRequest
): ClinicalContextGatewayEvaluation {
  const sourceContract = findSourceContract(request.sourceContractId);
  const governanceDecision = evaluateClinicalDataGovernanceRequest(toGovernanceRequest(request));
  const blockers: string[] = [];
  const reviewRequirements = [...governanceDecision.reviewRequirements];

  if (!sourceContract) {
    blockers.push("source contract is not registered in SCRIMED Clinical Data Fabric");
  }

  if (sourceContract) {
    const unsupportedConcepts = request.requestedConcepts.filter(
      (concept) => !sourceContract.canonicalEntities.includes(concept)
    );

    if (unsupportedConcepts.length > 0) {
      blockers.push(
        `requested concepts are not supported by source contract: ${unsupportedConcepts.join(", ")}`
      );
    }
  }

  if (governanceDecision.status === "blocked") {
    blockers.push(...governanceDecision.blockers);
  }

  if (blockers.length > 0) {
    const auditEnvelope = buildAuditEnvelope({
      request,
      status: "blocked",
      governanceDecision,
      envelope: null
    });

    return {
      status: "blocked",
      statusCode: 403,
      allowed: false,
      requiresHumanReview: false,
      sourceContract: sourceContract
        ? {
            id: sourceContract.id,
            kind: sourceContract.kind,
            name: sourceContract.name,
            standards: sourceContract.standards,
            canonicalEntities: sourceContract.canonicalEntities
          }
        : null,
      governanceDecision,
      blockers: Array.from(new Set(blockers)),
      reviewRequirements,
      contextEnvelope: null,
      reviewPacket: null,
      contextLens: null,
      auditEnvelope,
      rationale:
        "Context request is blocked before any semantic envelope is delivered because it violates source, governance, destination, data class, or authority boundaries."
    };
  }

  if (governanceDecision.status === "requires-human-review") {
    const auditEnvelope = buildAuditEnvelope({
      request,
      status: "review-required",
      governanceDecision,
      envelope: null
    });

    return {
      status: "review-required",
      statusCode: 202,
      allowed: false,
      requiresHumanReview: true,
      sourceContract: sourceContract
        ? {
            id: sourceContract.id,
            kind: sourceContract.kind,
            name: sourceContract.name,
            standards: sourceContract.standards,
            canonicalEntities: sourceContract.canonicalEntities
          }
        : null,
      governanceDecision,
      blockers: [],
      reviewRequirements,
      contextEnvelope: null,
      reviewPacket: {
        sourceContractId: request.sourceContractId,
        requestedContextScope: request.requestedContextScope,
        requestedConcepts: request.requestedConcepts,
        reason: governanceDecision.rationale,
        requiredReviewers: ["clinical data steward", "privacy/security reviewer", "workflow owner"],
        retainedBoundaries: governanceDecision.retainedNoGoBoundaries
      },
      contextLens: null,
      auditEnvelope,
      rationale:
        "Context request is policy-contained but needs qualified human review before semantic context is released or used for customer-facing work."
    };
  }

  const contextEnvelope = buildContextEnvelope(request, sourceContract as ClinicalDataFabricSourceContract);
  const contextLens = buildContextLens(
    request,
    sourceContract as ClinicalDataFabricSourceContract
  );
  const auditEnvelope = buildAuditEnvelope({
    request,
    status: "semantic-context-ready",
    governanceDecision,
    envelope: contextEnvelope
  });

  return {
    status: "semantic-context-ready",
    statusCode: 200,
    allowed: true,
    requiresHumanReview: false,
    sourceContract: sourceContract
      ? {
          id: sourceContract.id,
          kind: sourceContract.kind,
          name: sourceContract.name,
          standards: sourceContract.standards,
          canonicalEntities: sourceContract.canonicalEntities
        }
      : null,
    governanceDecision,
    blockers: [],
    reviewRequirements: [],
    contextEnvelope,
    reviewPacket: null,
    contextLens,
    auditEnvelope,
    rationale:
      "Context request stays inside SCRIMED's metadata-only semantic gateway. The returned envelope contains governance, provenance, confidence, and blocked-use instructions only."
  };
}

const baselineGatewayRequests: Array<{ id: string; request: ClinicalContextGatewayRequest }> = [
  {
    id: "internal-fhir-metadata-context",
    request: {
      requesterRole: "internal-operator",
      purposeOfUse: "audit-preparation",
      sourceContractId: "fhir-r4-us-core",
      requestedContextScope: "patient-context-summary",
      requestedConcepts: ["patient", "encounter", "condition", "observation"],
      dataClasses: ["metadata"],
      destination: "internal-control-plane",
      consentStatus: "not-required-for-metadata",
      humanReviewStatus: "not-required",
      baaDpaStatus: "not-required-for-metadata",
      tenantScoped: true,
      minimumNecessary: true,
      productionConnectorApproved: false,
      externalModelApproved: false,
      residencyRegion: "US",
      traceId: "baseline-internal-fhir-metadata-context"
    }
  },
  {
    id: "deidentified-document-review-context",
    request: {
      requesterRole: "reviewer",
      purposeOfUse: "customer-sandbox-review",
      sourceContractId: "clinical-documents-notes",
      requestedContextScope: "clinical-workflow-context",
      requestedConcepts: ["document", "condition", "medication"],
      dataClasses: ["deidentified"],
      destination: "tenant-workspace",
      consentStatus: "not-required-for-metadata",
      humanReviewStatus: "queued",
      baaDpaStatus: "not-required-for-metadata",
      tenantScoped: true,
      minimumNecessary: true,
      productionConnectorApproved: false,
      externalModelApproved: false,
      residencyRegion: "US",
      traceId: "baseline-deidentified-document-review-context"
    }
  },
  {
    id: "phi-external-model-context",
    request: {
      requesterRole: "service-agent",
      purposeOfUse: "healthcare-operations",
      sourceContractId: "fhir-r4-us-core",
      requestedContextScope: "clinical-workflow-context",
      requestedConcepts: ["patient", "condition"],
      dataClasses: ["phi"],
      destination: "external-model-provider",
      consentStatus: "unknown",
      humanReviewStatus: "queued",
      baaDpaStatus: "unknown",
      tenantScoped: true,
      minimumNecessary: true,
      productionConnectorApproved: false,
      externalModelApproved: false,
      residencyRegion: "unknown",
      traceId: "baseline-phi-external-model-context"
    }
  },
  {
    id: "payer-network-context-block",
    request: {
      requesterRole: "rcm-operator",
      purposeOfUse: "payment",
      sourceContractId: "x12-claims-utilization",
      requestedContextScope: "payer-rcm-context",
      requestedConcepts: ["claim", "coverage", "procedure"],
      dataClasses: ["metadata"],
      destination: "payer-network",
      consentStatus: "not-required-for-metadata",
      humanReviewStatus: "approved",
      baaDpaStatus: "not-required-for-metadata",
      tenantScoped: true,
      minimumNecessary: true,
      productionConnectorApproved: false,
      externalModelApproved: false,
      residencyRegion: "US",
      traceId: "baseline-payer-network-context-block"
    }
  },
  {
    id: "unknown-source-contract",
    request: {
      requesterRole: "internal-operator",
      purposeOfUse: "audit-preparation",
      sourceContractId: "unregistered-source",
      requestedContextScope: "source-contract-review",
      requestedConcepts: ["document"],
      dataClasses: ["metadata"],
      destination: "internal-control-plane",
      consentStatus: "not-required-for-metadata",
      humanReviewStatus: "not-required",
      baaDpaStatus: "not-required-for-metadata",
      tenantScoped: true,
      minimumNecessary: true,
      productionConnectorApproved: false,
      externalModelApproved: false,
      residencyRegion: "US",
      traceId: "baseline-unknown-source-contract"
    }
  }
];

function validateClinicalContextGateway(
  baselineEvaluations: Array<{ id: string; decision: ClinicalContextGatewayEvaluation }>
): ClinicalContextGatewayValidationCheck[] {
  const allowed = baselineEvaluations.some(
    (evaluation) => evaluation.id === "internal-fhir-metadata-context" && evaluation.decision.status === "semantic-context-ready"
  );
  const reviewRequired = baselineEvaluations.some(
    (evaluation) => evaluation.id === "deidentified-document-review-context" && evaluation.decision.status === "review-required"
  );
  const blocked = baselineEvaluations.filter((evaluation) => evaluation.decision.status === "blocked").length >= 2;
  const allowedEnvelopeSafe = baselineEvaluations
    .filter((evaluation) => evaluation.decision.contextEnvelope)
    .every((evaluation) => {
      const envelope = evaluation.decision.contextEnvelope;

      return (
        envelope !== null &&
        envelope.containsPhi === false &&
        envelope.includesRawDatabaseSchema === false &&
        envelope.includesRawSourcePayload === false &&
        envelope.includesCredentials === false &&
        envelope.blockedRawAccess.length >= 5
      );
    });
  const auditComplete = baselineEvaluations.every(
    (evaluation) =>
      evaluation.decision.auditEnvelope.rawAccessBlocked &&
      evaluation.decision.auditEnvelope.requestHash.length === 64 &&
      (evaluation.decision.status !== "semantic-context-ready" ||
        evaluation.decision.auditEnvelope.envelopeHash?.length === 64)
  );
  const sourceContractsGoverned = getClinicalDataFabricSummary().sourceContracts.every(
    (source) =>
      source.agentAccessPolicy.toLowerCase().includes("semantic concepts") &&
      source.blockedActions.length >= 4 &&
      source.activationRequirements.length >= 4
  );

  return [
    {
      id: "allowed-metadata-context-covered",
      passed: allowed,
      detail: "Metadata-only FHIR semantic context must produce a governed context envelope."
    },
    {
      id: "human-review-context-covered",
      passed: reviewRequired,
      detail: "Deidentified/customer-review context must queue a review packet instead of delivering context automatically."
    },
    {
      id: "blocked-context-covered",
      passed: blocked,
      detail: "Unsafe destination, live-data, and unregistered-source requests must block before context delivery."
    },
    {
      id: "semantic-envelope-excludes-raw-access",
      passed: allowedEnvelopeSafe,
      detail: "Allowed envelopes must exclude PHI, raw source payloads, raw schemas, and credentials."
    },
    {
      id: "audit-envelope-complete",
      passed: auditComplete,
      detail: "Every gateway decision must emit request hashes, envelope hashes where applicable, policy version, trace id, and raw-access blockers."
    },
    {
      id: "source-contracts-enforce-agent-boundary",
      passed: sourceContractsGoverned,
      detail: "Clinical Data Fabric source contracts must restrict agent access to governed semantic concepts and retain blocked actions."
    }
  ];
}

export function getClinicalContextGatewaySummary(): ClinicalContextGatewaySummary {
  const baselineEvaluations = baselineGatewayRequests.map(({ id, request }) => ({
    id,
    decision: evaluateClinicalContextGatewayRequest(request)
  }));
  const validationChecks = validateClinicalContextGateway(baselineEvaluations);

  return {
    service: "scrimed-clinical-context-gateway",
    status: clinicalContextGatewayStatus,
    version: clinicalContextGatewayVersion,
    envelopeVersion: clinicalContextGatewayEnvelopeVersion,
    route: clinicalContextGatewayRoute,
    apiRoute: clinicalContextGatewayApiRoute,
    briefRoute: clinicalContextGatewayBriefRoute,
    updated: "2026-07-03",
    dataBoundary: "governed-semantic-context-only-no-live-phi",
    rawSchemaAccess: "blocked",
    rawConnectorPayloadAccess: "blocked",
    clinicalCareAuthority: "not-authorized-live-care",
    recordMutationAuthority: "not-authorized",
    payerSubmissionAuthority: "not-authorized",
    patientOutreachAuthority: "not-authorized",
    productionConnectorAuthority: "not-production-connector-approved",
    supportedScopes,
    gatewayControls,
    contextLens: {
      modes: ["public-evidence", "clinical-context"],
      livePhiEnabled: clinicalContextIsolationPolicy.modes.clinicalContext.livePhiEnabled,
      unsupportedOrStaleContextAction: clinicalContextIsolationPolicy.unsupportedOrStaleContextAction,
      sourceAndReasonRequired: true
    },
    clinicalSearchFabric: {
      version: clinicalSearchFabricVersion,
      pipeline: [
        "clinical-intent-classification",
        "bounded-query-expansion",
        "approved-source-selection",
        "rights-aware-retrieval",
        "evidence-ranking",
        "claim-citation-validation",
        "conflict-and-uncertainty-presentation",
        "accepted-answer-cost-measurement"
      ],
      externalCrawlerEnabled: false,
      patientSpecificCacheEnabled: false,
      conflictAction: "present-conflict-and-require-review",
      retrievalFailureIsNoEvidence: false,
      optimizationTarget: "cost-per-clinically-accepted-answer",
      boundary: clinicalSearchFabricBoundary
    },
    sourceContractCount: getClinicalDataFabricSummary().sourceContractCount,
    baselineEvaluationCount: baselineEvaluations.length,
    baselineEvaluations,
    validation: {
      status: validationChecks.every((check) => check.passed) ? "passed" : "failed",
      checks: validationChecks
    },
    boundary: clinicalContextGatewayBoundary
  };
}

export function buildClinicalContextGatewayBrief() {
  const summary = getClinicalContextGatewaySummary();

  return [
    "# SCRIMED Clinical Context Gateway",
    "",
    `Status: ${summary.status}`,
    `Version: ${summary.version}`,
    `Envelope version: ${summary.envelopeVersion}`,
    `Updated: ${summary.updated}`,
    `Data boundary: ${summary.dataBoundary}`,
    `Clinical care authority: ${summary.clinicalCareAuthority}`,
    `Production connector authority: ${summary.productionConnectorAuthority}`,
    `Raw schema access: ${summary.rawSchemaAccess}`,
    `Raw connector payload access: ${summary.rawConnectorPayloadAccess}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "## Gateway Controls",
    ...summary.gatewayControls.map((control) => `- ${control}`),
    "",
    "## Clinical Search Fabric",
    `- Version: ${summary.clinicalSearchFabric.version}`,
    `- Optimization target: ${summary.clinicalSearchFabric.optimizationTarget}`,
    `- Conflict action: ${summary.clinicalSearchFabric.conflictAction}`,
    `- External crawler enabled: ${summary.clinicalSearchFabric.externalCrawlerEnabled}`,
    `- Patient-specific cache enabled: ${summary.clinicalSearchFabric.patientSpecificCacheEnabled}`,
    "",
    "## Context Lens",
    `- Modes: ${summary.contextLens.modes.join(", ")}`,
    `- Live PHI enabled: ${summary.contextLens.livePhiEnabled}`,
    `- Unsupported or stale context: ${summary.contextLens.unsupportedOrStaleContextAction}`,
    "- Every proposed next action requires a supporting source and action reason.",
    "",
    "## Supported Context Scopes",
    ...summary.supportedScopes.map((scope) => `- ${scope}`),
    "",
    "## Baseline Evaluations",
    ...summary.baselineEvaluations.map(
      (evaluation) =>
        `- ${evaluation.id}: ${evaluation.decision.status}; governance ${evaluation.decision.governanceDecision.status}; review ${evaluation.decision.requiresHumanReview ? "required" : "not required"}; blockers ${evaluation.decision.blockers.join(", ") || "none"}`
    ),
    "",
    "## Validation",
    ...summary.validation.checks.map((check) => `- ${check.id}: ${check.passed ? "pass" : "fail"} - ${check.detail}`),
    "",
    "## Routes",
    `- OS anchor: ${summary.route}`,
    `- API: ${summary.apiRoute}`,
    `- Brief: ${summary.briefRoute}`
  ].join("\n");
}
