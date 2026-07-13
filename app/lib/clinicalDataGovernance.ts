export type ClinicalGovernanceDataClass =
  | "public"
  | "metadata"
  | "aggregate"
  | "deidentified"
  | "limited-dataset"
  | "pii"
  | "phi"
  | "restricted-clinical"
  | "genomic"
  | "substance-use"
  | "behavioral-health";

export type ClinicalGovernancePurpose =
  | "platform-readiness"
  | "audit-preparation"
  | "internal-testing"
  | "customer-sandbox-review"
  | "treatment"
  | "payment"
  | "healthcare-operations"
  | "research"
  | "patient-access";

export type ClinicalGovernanceRequesterRole =
  | "public-visitor"
  | "internal-operator"
  | "tenant-admin"
  | "pilot-lead"
  | "reviewer"
  | "clinician"
  | "rcm-operator"
  | "compliance-officer"
  | "research-reviewer"
  | "service-agent";

export type ClinicalGovernanceAction =
  | "view-metadata"
  | "evaluate-policy"
  | "prepare-review-packet"
  | "semantic-context-request"
  | "deidentify"
  | "export"
  | "store"
  | "mutate-record"
  | "submit-transaction"
  | "patient-contact"
  | "connector-activation"
  | "model-inference-external"
  | "model-inference-private";

export type ClinicalGovernanceDestination =
  | "public-api"
  | "internal-control-plane"
  | "tenant-workspace"
  | "customer-controlled-environment"
  | "external-model-provider"
  | "system-of-record"
  | "payer-network"
  | "patient-channel"
  | "research-workspace";

export type ClinicalGovernanceConsentStatus =
  | "not-required-for-metadata"
  | "verified"
  | "missing"
  | "revoked"
  | "unknown";

export type ClinicalGovernanceReviewStatus =
  | "not-required"
  | "queued"
  | "approved"
  | "rejected"
  | "expired";

export type ClinicalGovernanceBaaDpaStatus =
  | "not-required-for-metadata"
  | "active"
  | "missing"
  | "expired"
  | "unknown";

export type ClinicalDataGovernanceRequest = {
  requesterRole: ClinicalGovernanceRequesterRole;
  purposeOfUse: ClinicalGovernancePurpose;
  dataClasses: ClinicalGovernanceDataClass[];
  action: ClinicalGovernanceAction;
  destination: ClinicalGovernanceDestination;
  consentStatus: ClinicalGovernanceConsentStatus;
  humanReviewStatus: ClinicalGovernanceReviewStatus;
  baaDpaStatus: ClinicalGovernanceBaaDpaStatus;
  tenantScoped: boolean;
  minimumNecessary: boolean;
  productionConnectorApproved: boolean;
  externalModelApproved: boolean;
  residencyRegion: string;
  sourceContractId?: string;
};

export type ClinicalDataGovernanceDecisionStatus =
  | "allowed"
  | "requires-human-review"
  | "blocked";

export type ClinicalDataGovernanceDecision = {
  status: ClinicalDataGovernanceDecisionStatus;
  statusCode: 200 | 202 | 403;
  policyVersion: typeof clinicalDataGovernancePolicyVersion;
  requestClassification: "metadata-only" | "deidentified-or-aggregate" | "live-data-risk";
  allowed: boolean;
  requiresHumanReview: boolean;
  blockers: string[];
  requiredControls: string[];
  satisfiedControls: string[];
  reviewRequirements: string[];
  retainedNoGoBoundaries: string[];
  rationale: string;
};

export type ClinicalDataGovernancePolicyRule = {
  id: string;
  name: string;
  appliesTo: string[];
  decision: ClinicalDataGovernanceDecisionStatus;
  control: string;
  blockedOrReviewBoundary: string;
};

export type ClinicalDataGovernanceValidationCheck = {
  id: string;
  passed: boolean;
  detail: string;
};

export type ClinicalDataGovernanceSummary = {
  service: "scrimed-clinical-data-governance";
  status: typeof clinicalDataGovernanceStatus;
  policyVersion: typeof clinicalDataGovernancePolicyVersion;
  route: typeof clinicalDataGovernanceRoute;
  apiRoute: typeof clinicalDataGovernanceApiRoute;
  briefRoute: typeof clinicalDataGovernanceBriefRoute;
  updated: "2026-07-03";
  dataBoundary: "metadata-and-policy-only-no-live-phi";
  clinicalCareAuthority: "not-authorized-live-care";
  productionConnectorAuthority: "not-production-connector-approved";
  recordMutationAuthority: "not-authorized";
  patientOutreachAuthority: "not-authorized";
  payerSubmissionAuthority: "not-authorized";
  externalModelPhiAuthority: "not-authorized";
  supportedDataClasses: ClinicalGovernanceDataClass[];
  supportedPurposes: ClinicalGovernancePurpose[];
  supportedRoles: ClinicalGovernanceRequesterRole[];
  supportedActions: ClinicalGovernanceAction[];
  supportedDestinations: ClinicalGovernanceDestination[];
  policyRules: ClinicalDataGovernancePolicyRule[];
  baselineControlEvaluations: Array<{
    id: string;
    decision: ClinicalDataGovernanceDecision;
  }>;
  validation: {
    status: "passed" | "failed";
    checks: ClinicalDataGovernanceValidationCheck[];
  };
  boundary: typeof clinicalDataGovernanceBoundary;
};

export const clinicalDataGovernanceStatus =
  "clinical-data-governance-policy-engine-ready-no-phi";
export const clinicalDataGovernancePolicyVersion =
  "scrimed-clinical-data-governance-v2026-07-03";
export const clinicalDataGovernanceRoute =
  "/healthcare-intelligence-os#clinical-data-governance";
export const clinicalDataGovernanceApiRoute = "/api/clinical-data-governance";
export const clinicalDataGovernanceBriefRoute =
  "/api/clinical-data-governance/brief";

export const clinicalDataGovernanceBoundary =
  "SCRIMED Clinical Data Governance evaluates metadata-only policy requests for purpose of use, role, data class, consent, tenant scope, minimum necessary access, destination, human review, residency, and contract readiness. It does not ingest live records, store PHI, approve production connectors, mutate records, submit payer transactions, contact patients, authorize external model PHI processing, diagnose, treat, prescribe, or approve customer go-live.";

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

const supportedActions: ClinicalGovernanceAction[] = [
  "view-metadata",
  "evaluate-policy",
  "prepare-review-packet",
  "semantic-context-request",
  "deidentify",
  "export",
  "store",
  "mutate-record",
  "submit-transaction",
  "patient-contact",
  "connector-activation",
  "model-inference-external",
  "model-inference-private"
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

const sensitiveDataClasses: ClinicalGovernanceDataClass[] = [
  "limited-dataset",
  "pii",
  "phi",
  "restricted-clinical",
  "genomic",
  "substance-use",
  "behavioral-health"
];

const liveDataRiskClasses: ClinicalGovernanceDataClass[] = [
  "pii",
  "phi",
  "restricted-clinical",
  "genomic",
  "substance-use",
  "behavioral-health"
];

const noGoBoundaries = [
  "live PHI processing is not authorized",
  "production connector activation is not authorized",
  "record mutation is not authorized",
  "payer submission is not authorized",
  "patient outreach is not authorized",
  "external model PHI processing is not authorized",
  "autonomous diagnosis is not authorized",
  "autonomous treatment is not authorized",
  "autonomous prescribing is not authorized",
  "customer go-live approval is not authorized"
];

const policyRules: ClinicalDataGovernancePolicyRule[] = [
  {
    id: "public-api-no-sensitive-data",
    name: "Public APIs only expose public, metadata, aggregate, or deidentified control-plane data",
    appliesTo: ["public-api", "pii", "phi", "restricted-clinical", "genomic", "substance-use", "behavioral-health"],
    decision: "blocked",
    control: "Block sensitive or live-data classes from public API destinations.",
    blockedOrReviewBoundary: "Public routes must not expose patient-identifying, restricted clinical, genomic, or sensitive category data."
  },
  {
    id: "live-phi-not-enabled",
    name: "Live PHI and direct patient-identifying data remain disabled",
    appliesTo: ["pii", "phi", "restricted-clinical"],
    decision: "blocked",
    control: "Reject live-data risk classes under the current product authority.",
    blockedOrReviewBoundary: "Future customer environments require formal data authority, tenant controls, legal review, and clinical governance."
  },
  {
    id: "minimum-necessary-required",
    name: "Minimum necessary access is mandatory",
    appliesTo: ["all non-public requests"],
    decision: "blocked",
    control: "Reject requests that do not affirm minimum necessary access.",
    blockedOrReviewBoundary: "Healthcare context requests must be narrowed before evaluation."
  },
  {
    id: "tenant-scope-required",
    name: "Tenant scope is mandatory for non-public healthcare context",
    appliesTo: ["metadata", "aggregate", "deidentified", "limited-dataset", "pii", "phi"],
    decision: "blocked",
    control: "Reject requests without tenant boundary where healthcare context is involved.",
    blockedOrReviewBoundary: "Cross-tenant context is not allowed."
  },
  {
    id: "external-model-no-phi",
    name: "External model providers cannot receive PHI under current authority",
    appliesTo: ["external-model-provider", "pii", "phi", "restricted-clinical", "genomic"],
    decision: "blocked",
    control: "Reject external model processing for live-data risk classes.",
    blockedOrReviewBoundary: "External model routing requires approved data boundary, contract path, residency, monitoring, and rollback."
  },
  {
    id: "human-review-for-deidentified-or-limited-data",
    name: "Deidentified and limited-dataset workflows require human review before release",
    appliesTo: ["deidentified", "limited-dataset", "prepare-review-packet", "research"],
    decision: "requires-human-review",
    control: "Queue release or research workflows for qualified review.",
    blockedOrReviewBoundary: "Review approval does not create live-care, outreach, payer, or record-mutation authority."
  },
  {
    id: "record-mutation-disabled",
    name: "Record mutation remains disabled",
    appliesTo: ["mutate-record", "system-of-record"],
    decision: "blocked",
    control: "Reject EHR, chart, order, and record mutation actions.",
    blockedOrReviewBoundary: "System-of-record writes require customer go-live approval and connector validation."
  },
  {
    id: "payer-submission-disabled",
    name: "Payer transaction submission remains disabled",
    appliesTo: ["submit-transaction", "payer-network"],
    decision: "blocked",
    control: "Reject claim, prior authorization, appeal, and payer transaction submission actions.",
    blockedOrReviewBoundary: "Payer workflows stay evidence-preparation and human-reviewed only."
  },
  {
    id: "patient-contact-disabled",
    name: "Patient contact remains disabled",
    appliesTo: ["patient-contact", "patient-channel"],
    decision: "blocked",
    control: "Reject patient messaging, email, text, phone, portal, or outreach actions.",
    blockedOrReviewBoundary: "Patient communication requires approved customer policy, consent, identity, and human send control."
  },
  {
    id: "connector-activation-disabled",
    name: "Production connector activation remains disabled",
    appliesTo: ["connector-activation", "productionConnectorApproved=false"],
    decision: "blocked",
    control: "Reject connector activation until external approval and customer authority exist.",
    blockedOrReviewBoundary: "Connector readiness evidence does not equal activation authority."
  },
  {
    id: "autonomous-clinical-authority-disabled",
    name: "Autonomous clinical authority remains disabled",
    appliesTo: ["diagnosis", "treatment", "prescribing", "clinical authority"],
    decision: "blocked",
    control: "Reject attempts to convert governance decisions into autonomous diagnosis, treatment, prescribing, triage, or care authority.",
    blockedOrReviewBoundary: "Autonomous diagnosis, autonomous treatment, and autonomous prescribing are not authorized."
  },
  {
    id: "customer-go-live-disabled",
    name: "Customer go-live approval remains disabled",
    appliesTo: ["go-live", "customer launch", "production approval"],
    decision: "blocked",
    control: "Reject customer go-live approval claims from policy evaluation output.",
    blockedOrReviewBoundary: "Customer go-live approval requires qualified external review, customer authority, and release governance."
  }
];

function includesAny<T>(values: T[], candidates: T[]) {
  return values.some((value) => candidates.includes(value));
}

function unique(values: string[]) {
  return Array.from(new Set(values));
}

function classifyRequest(request: ClinicalDataGovernanceRequest): ClinicalDataGovernanceDecision["requestClassification"] {
  if (includesAny(request.dataClasses, liveDataRiskClasses)) {
    return "live-data-risk";
  }

  if (request.dataClasses.includes("deidentified") || request.dataClasses.includes("limited-dataset")) {
    return "deidentified-or-aggregate";
  }

  return "metadata-only";
}

export function evaluateClinicalDataGovernanceRequest(
  request: ClinicalDataGovernanceRequest
): ClinicalDataGovernanceDecision {
  const blockers: string[] = [];
  const reviewRequirements: string[] = [];
  const satisfiedControls: string[] = [];
  const requiredControls = [
    "tenant scope",
    "minimum necessary",
    "purpose of use",
    "data class classification",
    "consent policy",
    "human review state",
    "data residency",
    "contract readiness",
    "destination policy",
    "no autonomous clinical authority"
  ];

  const classification = classifyRequest(request);
  const hasSensitiveData = includesAny(request.dataClasses, sensitiveDataClasses);
  const hasLiveDataRisk = includesAny(request.dataClasses, liveDataRiskClasses);
  const publicSafeClasses = request.dataClasses.every((dataClass) =>
    ["public", "metadata", "aggregate", "deidentified"].includes(dataClass)
  );

  if (request.tenantScoped) {
    satisfiedControls.push("tenant scope");
  } else if (!request.dataClasses.every((dataClass) => dataClass === "public")) {
    blockers.push("tenant scope is required for healthcare context");
  }

  if (request.minimumNecessary) {
    satisfiedControls.push("minimum necessary");
  } else if (!request.dataClasses.every((dataClass) => dataClass === "public")) {
    blockers.push("minimum necessary access is required");
  }

  satisfiedControls.push("purpose of use", "data class classification", "no autonomous clinical authority");

  if (request.destination === "public-api" && !publicSafeClasses) {
    blockers.push("public API destination cannot receive sensitive or live-data-risk classes");
  }

  if (hasLiveDataRisk) {
    blockers.push("live-data-risk classes are not authorized in the current SCRIMED platform boundary");
  }

  if (
    hasSensitiveData &&
    ["missing", "revoked", "unknown"].includes(request.consentStatus)
  ) {
    blockers.push(`consent policy is ${request.consentStatus}`);
  } else {
    satisfiedControls.push("consent policy");
  }

  if (
    hasSensitiveData &&
    ["missing", "expired", "unknown"].includes(request.baaDpaStatus)
  ) {
    blockers.push(`contract readiness is ${request.baaDpaStatus}`);
  } else {
    satisfiedControls.push("contract readiness");
  }

  if (request.residencyRegion.trim().length < 2 || request.residencyRegion.toLowerCase() === "unknown") {
    if (hasSensitiveData || request.destination !== "public-api") {
      reviewRequirements.push("data residency must be confirmed before release or customer-environment use");
    }
  } else {
    satisfiedControls.push("data residency");
  }

  if (
    request.action === "mutate-record" ||
    request.destination === "system-of-record"
  ) {
    blockers.push("record mutation and system-of-record writes are not authorized");
  }

  if (
    request.action === "submit-transaction" ||
    request.destination === "payer-network"
  ) {
    blockers.push("payer transaction submission is not authorized");
  }

  if (
    request.action === "patient-contact" ||
    request.destination === "patient-channel"
  ) {
    blockers.push("patient contact is not authorized");
  }

  if (request.action === "connector-activation" || request.productionConnectorApproved) {
    blockers.push("production connector activation is not authorized from this control plane");
  }

  if (
    request.destination === "external-model-provider" &&
    (hasSensitiveData || !request.externalModelApproved)
  ) {
    blockers.push("external model provider route is not authorized for this request");
  }

  if (
    request.action === "model-inference-external" &&
    (hasSensitiveData || !request.externalModelApproved)
  ) {
    blockers.push("external model inference is not authorized for this request");
  }

  if (
    request.action === "prepare-review-packet" ||
    request.dataClasses.includes("deidentified") ||
    request.dataClasses.includes("limited-dataset") ||
    request.purposeOfUse === "research" ||
    request.purposeOfUse === "customer-sandbox-review"
  ) {
    if (request.humanReviewStatus !== "approved") {
      reviewRequirements.push("qualified human review is required before release");
    } else {
      satisfiedControls.push("human review state");
    }
  } else if (request.humanReviewStatus === "not-required") {
    satisfiedControls.push("human review state");
  } else if (["rejected", "expired"].includes(request.humanReviewStatus)) {
    blockers.push(`human review state is ${request.humanReviewStatus}`);
  } else {
    reviewRequirements.push("human review state must be approved or explicitly not required");
  }

  if (
    request.action === "semantic-context-request" &&
    request.destination !== "internal-control-plane" &&
    request.destination !== "tenant-workspace" &&
    request.destination !== "customer-controlled-environment"
  ) {
    blockers.push("semantic context requests must stay inside governed control-plane or tenant boundaries");
  }

  if (
    request.action === "deidentify" &&
    !["compliance-officer", "reviewer", "tenant-admin"].includes(request.requesterRole)
  ) {
    reviewRequirements.push("deidentification requires compliance, reviewer, or tenant-admin ownership");
  }

  satisfiedControls.push("destination policy");

  const dedupedBlockers = unique(blockers);
  const dedupedReviewRequirements = unique(reviewRequirements);

  if (dedupedBlockers.length > 0) {
    return {
      status: "blocked",
      statusCode: 403,
      policyVersion: clinicalDataGovernancePolicyVersion,
      requestClassification: classification,
      allowed: false,
      requiresHumanReview: false,
      blockers: dedupedBlockers,
      requiredControls,
      satisfiedControls: unique(satisfiedControls),
      reviewRequirements: dedupedReviewRequirements,
      retainedNoGoBoundaries: noGoBoundaries,
      rationale:
        "Request is blocked by SCRIMED Clinical Data Governance because it crosses current data, connector, destination, consent, or action authority."
    };
  }

  if (dedupedReviewRequirements.length > 0) {
    return {
      status: "requires-human-review",
      statusCode: 202,
      policyVersion: clinicalDataGovernancePolicyVersion,
      requestClassification: classification,
      allowed: false,
      requiresHumanReview: true,
      blockers: [],
      requiredControls,
      satisfiedControls: unique(satisfiedControls),
      reviewRequirements: dedupedReviewRequirements,
      retainedNoGoBoundaries: noGoBoundaries,
      rationale:
        "Request remains inside metadata or deidentified governance boundaries but requires qualified human review before release or customer-environment use."
    };
  }

  return {
    status: "allowed",
    statusCode: 200,
    policyVersion: clinicalDataGovernancePolicyVersion,
    requestClassification: classification,
    allowed: true,
    requiresHumanReview: false,
    blockers: [],
    requiredControls,
    satisfiedControls: unique(satisfiedControls),
    reviewRequirements: [],
    retainedNoGoBoundaries: noGoBoundaries,
    rationale:
      "Request stays inside SCRIMED's metadata-only, minimum-necessary, tenant-scoped, no-live-PHI governance boundary."
  };
}

const baselineRequests: Array<{ id: string; request: ClinicalDataGovernanceRequest }> = [
  {
    id: "public-metadata-readiness",
    request: {
      requesterRole: "public-visitor",
      purposeOfUse: "platform-readiness",
      dataClasses: ["metadata"],
      action: "view-metadata",
      destination: "public-api",
      consentStatus: "not-required-for-metadata",
      humanReviewStatus: "not-required",
      baaDpaStatus: "not-required-for-metadata",
      tenantScoped: true,
      minimumNecessary: true,
      productionConnectorApproved: false,
      externalModelApproved: false,
      residencyRegion: "US"
    }
  },
  {
    id: "phi-to-external-model",
    request: {
      requesterRole: "service-agent",
      purposeOfUse: "healthcare-operations",
      dataClasses: ["phi"],
      action: "model-inference-external",
      destination: "external-model-provider",
      consentStatus: "unknown",
      humanReviewStatus: "queued",
      baaDpaStatus: "unknown",
      tenantScoped: true,
      minimumNecessary: true,
      productionConnectorApproved: false,
      externalModelApproved: false,
      residencyRegion: "unknown"
    }
  },
  {
    id: "deidentified-review-packet",
    request: {
      requesterRole: "reviewer",
      purposeOfUse: "customer-sandbox-review",
      dataClasses: ["deidentified"],
      action: "prepare-review-packet",
      destination: "tenant-workspace",
      consentStatus: "not-required-for-metadata",
      humanReviewStatus: "queued",
      baaDpaStatus: "not-required-for-metadata",
      tenantScoped: true,
      minimumNecessary: true,
      productionConnectorApproved: false,
      externalModelApproved: false,
      residencyRegion: "US"
    }
  },
  {
    id: "ehr-mutation-request",
    request: {
      requesterRole: "clinician",
      purposeOfUse: "treatment",
      dataClasses: ["metadata"],
      action: "mutate-record",
      destination: "system-of-record",
      consentStatus: "verified",
      humanReviewStatus: "approved",
      baaDpaStatus: "active",
      tenantScoped: true,
      minimumNecessary: true,
      productionConnectorApproved: false,
      externalModelApproved: false,
      residencyRegion: "US"
    }
  },
  {
    id: "internal-semantic-context",
    request: {
      requesterRole: "internal-operator",
      purposeOfUse: "audit-preparation",
      dataClasses: ["metadata"],
      action: "semantic-context-request",
      destination: "internal-control-plane",
      consentStatus: "not-required-for-metadata",
      humanReviewStatus: "not-required",
      baaDpaStatus: "not-required-for-metadata",
      tenantScoped: true,
      minimumNecessary: true,
      productionConnectorApproved: false,
      externalModelApproved: false,
      residencyRegion: "US"
    }
  }
];

const dataClassSet = new Set(supportedDataClasses);
const purposeSet = new Set(supportedPurposes);
const roleSet = new Set(supportedRoles);
const actionSet = new Set(supportedActions);
const destinationSet = new Set(supportedDestinations);
const consentSet = new Set<ClinicalGovernanceConsentStatus>([
  "not-required-for-metadata",
  "verified",
  "missing",
  "revoked",
  "unknown"
]);
const reviewSet = new Set<ClinicalGovernanceReviewStatus>([
  "not-required",
  "queued",
  "approved",
  "rejected",
  "expired"
]);
const baaDpaSet = new Set<ClinicalGovernanceBaaDpaStatus>([
  "not-required-for-metadata",
  "active",
  "missing",
  "expired",
  "unknown"
]);

export function isClinicalDataGovernanceRequest(value: unknown): value is ClinicalDataGovernanceRequest {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<ClinicalDataGovernanceRequest>;

  return (
    typeof candidate.requesterRole === "string" &&
    roleSet.has(candidate.requesterRole as ClinicalGovernanceRequesterRole) &&
    typeof candidate.purposeOfUse === "string" &&
    purposeSet.has(candidate.purposeOfUse as ClinicalGovernancePurpose) &&
    Array.isArray(candidate.dataClasses) &&
    candidate.dataClasses.length > 0 &&
    candidate.dataClasses.every((dataClass) => typeof dataClass === "string" && dataClassSet.has(dataClass as ClinicalGovernanceDataClass)) &&
    typeof candidate.action === "string" &&
    actionSet.has(candidate.action as ClinicalGovernanceAction) &&
    typeof candidate.destination === "string" &&
    destinationSet.has(candidate.destination as ClinicalGovernanceDestination) &&
    typeof candidate.consentStatus === "string" &&
    consentSet.has(candidate.consentStatus as ClinicalGovernanceConsentStatus) &&
    typeof candidate.humanReviewStatus === "string" &&
    reviewSet.has(candidate.humanReviewStatus as ClinicalGovernanceReviewStatus) &&
    typeof candidate.baaDpaStatus === "string" &&
    baaDpaSet.has(candidate.baaDpaStatus as ClinicalGovernanceBaaDpaStatus) &&
    typeof candidate.tenantScoped === "boolean" &&
    typeof candidate.minimumNecessary === "boolean" &&
    typeof candidate.productionConnectorApproved === "boolean" &&
    typeof candidate.externalModelApproved === "boolean" &&
    typeof candidate.residencyRegion === "string" &&
    (candidate.sourceContractId === undefined || typeof candidate.sourceContractId === "string")
  );
}

function validateClinicalDataGovernance(): ClinicalDataGovernanceValidationCheck[] {
  const evaluations = baselineRequests.map(({ request }) => evaluateClinicalDataGovernanceRequest(request));
  const policyText = policyRules
    .flatMap((rule) => [rule.id, rule.name, rule.control, rule.blockedOrReviewBoundary, ...rule.appliesTo])
    .join(" ")
    .toLowerCase();
  const noGoCoverageTokens = [
    "live phi",
    "connector",
    "record mutation",
    "payer",
    "patient",
    "external model",
    "autonomous diagnosis",
    "autonomous treatment",
    "autonomous prescribing",
    "go-live"
  ];

  return [
    {
      id: "policy-rules-cover-no-go-boundaries",
      passed: noGoCoverageTokens.every((token) => policyText.includes(token)),
      detail: "Policy rules must retain live data, connector, record mutation, payer, patient outreach, external model, clinical authority, and go-live boundaries."
    },
    {
      id: "live-data-risk-blocked",
      passed: evaluations.some((decision) => decision.status === "blocked" && decision.requestClassification === "live-data-risk"),
      detail: "Baseline live-data-risk request must be blocked."
    },
    {
      id: "record-mutation-blocked",
      passed: evaluateClinicalDataGovernanceRequest(baselineRequests[3].request).blockers.some((blocker) =>
        blocker.includes("record mutation")
      ),
      detail: "Record mutation requests must be blocked."
    },
    {
      id: "deidentified-release-reviewed",
      passed: evaluateClinicalDataGovernanceRequest(baselineRequests[2].request).status === "requires-human-review",
      detail: "Deidentified release or customer review packets must require human review unless already approved."
    },
    {
      id: "metadata-policy-allowed",
      passed: evaluateClinicalDataGovernanceRequest(baselineRequests[0].request).status === "allowed",
      detail: "Metadata-only, minimum-necessary public readiness requests can be allowed."
    }
  ];
}

export function getClinicalDataGovernanceSummary(): ClinicalDataGovernanceSummary {
  const validationChecks = validateClinicalDataGovernance();

  return {
    service: "scrimed-clinical-data-governance",
    status: clinicalDataGovernanceStatus,
    policyVersion: clinicalDataGovernancePolicyVersion,
    route: clinicalDataGovernanceRoute,
    apiRoute: clinicalDataGovernanceApiRoute,
    briefRoute: clinicalDataGovernanceBriefRoute,
    updated: "2026-07-03",
    dataBoundary: "metadata-and-policy-only-no-live-phi",
    clinicalCareAuthority: "not-authorized-live-care",
    productionConnectorAuthority: "not-production-connector-approved",
    recordMutationAuthority: "not-authorized",
    patientOutreachAuthority: "not-authorized",
    payerSubmissionAuthority: "not-authorized",
    externalModelPhiAuthority: "not-authorized",
    supportedDataClasses,
    supportedPurposes,
    supportedRoles,
    supportedActions,
    supportedDestinations,
    policyRules,
    baselineControlEvaluations: baselineRequests.map(({ id, request }) => ({
      id,
      decision: evaluateClinicalDataGovernanceRequest(request)
    })),
    validation: {
      status: validationChecks.every((check) => check.passed) ? "passed" : "failed",
      checks: validationChecks
    },
    boundary: clinicalDataGovernanceBoundary
  };
}

export function buildClinicalDataGovernanceBrief() {
  const summary = getClinicalDataGovernanceSummary();

  return [
    "# SCRIMED Clinical Data Governance",
    "",
    `Status: ${summary.status}`,
    `Policy version: ${summary.policyVersion}`,
    `Data boundary: ${summary.dataBoundary}`,
    `Clinical care authority: ${summary.clinicalCareAuthority}`,
    `Production connector authority: ${summary.productionConnectorAuthority}`,
    `Record mutation authority: ${summary.recordMutationAuthority}`,
    `Patient outreach authority: ${summary.patientOutreachAuthority}`,
    `Payer submission authority: ${summary.payerSubmissionAuthority}`,
    `External model PHI authority: ${summary.externalModelPhiAuthority}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "## Required Policy Inputs",
    "- requesterRole",
    "- purposeOfUse",
    "- dataClasses",
    "- action",
    "- destination",
    "- consentStatus",
    "- humanReviewStatus",
    "- baaDpaStatus",
    "- tenantScoped",
    "- minimumNecessary",
    "- productionConnectorApproved",
    "- externalModelApproved",
    "- residencyRegion",
    "",
    "## Policy Rules",
    ...summary.policyRules.map(
      (rule) => `- ${rule.id}: ${rule.decision}; ${rule.control} Boundary: ${rule.blockedOrReviewBoundary}`
    ),
    "",
    "## Baseline Control Evaluations",
    ...summary.baselineControlEvaluations.map(
      (evaluation) =>
        `- ${evaluation.id}: ${evaluation.decision.status}; classification ${evaluation.decision.requestClassification}; blockers ${evaluation.decision.blockers.join(", ") || "none"}; review ${evaluation.decision.reviewRequirements.join(", ") || "none"}`
    ),
    "",
    "## Validation",
    ...summary.validation.checks.map((check) => `- ${check.id}: ${check.passed ? "pass" : "fail"} - ${check.detail}`),
    "",
    "## Retained No-Go Boundaries",
    ...noGoBoundaries.map((boundary) => `- ${boundary}`)
  ].join("\n");
}
