import {
  protectedFinanceAdvertisingClaimsAuthority
} from "./protectedFinanceMethodology";
import {
  protectedMetricRollupClinicalAuthority,
  protectedMetricRollupFinancialAuthority,
  protectedMetricRollupSecuritiesAuthority
} from "./protectedMetricRollups";
import type { PilotWorkspaceRecord } from "./protectedPilotWorkspace";
import {
  protectedProviderSecurityReviewAuthority,
  protectedProviderSecurityReviewBaaDpaAuthority,
  protectedProviderSecurityReviewStorageAuthority,
  type ProtectedProviderSecurityReviewRecord
} from "./protectedProviderSecurityReviews";

export const protectedProcurementEvidenceRegistryStatus =
  "aal2-procurement-evidence-registry-no-sensitive-artifacts";
export const protectedProcurementEvidenceRegistryPacketProofStackStatus =
  "aal2-audited-procurement-evidence-registry-packets-no-sensitive-artifacts";
export const protectedProcurementEvidenceRegistryAttestation =
  "procurement-evidence-routing-metadata-no-sensitive-artifacts";
export const protectedProcurementEvidenceRegistryDataBoundary =
  "synthetic-business-workflow-only";
export const protectedProcurementEvidenceRegistryAuthority =
  "procurement-evidence-routing-readiness-not-procurement-approval";
export const protectedProcurementEvidenceRegistryStorageAuthority =
  "procurement-routing-metadata-only-no-questionnaires-reports-credentials-or-phi";
export const protectedProcurementEvidenceRegistryApprovalScope =
  "procurement-evidence-routing-readiness-only";
export const protectedProcurementEvidenceRegistryBoundary =
  "Protected Procurement Evidence Registry records metadata-only routing for security questionnaires, privacy questionnaires, legal procurement, vendor risk, technical diligence, commercial procurement, data governance, and implementation readiness. It does not store PHI, patient identifiers, payer member data, live clinical records, source documents, source contracts, secrets, credentials, URLs, access tokens, confidential questionnaire answers, SOC reports, penetration-test reports, vulnerability reports, signed agreements, signed BAAs/DPAs, legal opinions, customer permission artifacts, public release approval, external distribution approval, production authorization, procurement approval, compliance certification, reimbursement assurance, advertising substantiation, or live clinical execution approval.";

export type ProtectedProcurementBuyerAudience =
  | "provider-health-system"
  | "payer-plan"
  | "government-public-health"
  | "life-sciences-research"
  | "employer-benefits"
  | "global-channel-partner"
  | "investor-board-review";

export type ProtectedProcurementDomain =
  | "security-questionnaire"
  | "privacy-questionnaire"
  | "legal-procurement"
  | "vendor-risk"
  | "technical-diligence"
  | "commercial-procurement"
  | "data-governance"
  | "implementation-readiness";

export type ProtectedProcurementEvidenceClass =
  | "questionnaire-response-routing"
  | "security-assurance-routing"
  | "privacy-dpa-routing"
  | "contracting-routing"
  | "architecture-evidence-routing"
  | "operations-runbook-routing"
  | "pricing-commercial-routing"
  | "implementation-plan-routing";

export type ProtectedProcurementRiskTier =
  | "not-assessed"
  | "low"
  | "moderate"
  | "high";

export type ProtectedProcurementEvidenceRegistryRecordStatus =
  | "procurement-evidence-metadata-recorded"
  | "procurement-evidence-routing-ready-not-approval"
  | "blocked";

export type ProtectedProcurementEvidenceRegistryControl =
  | "provider-security-review-ready"
  | "target-audience-defined"
  | "procurement-owner-assigned"
  | "buyer-segment-defined"
  | "external-system-identified"
  | "security-questionnaire-retained-externally"
  | "soc-report-retained-externally"
  | "pentest-report-retained-externally"
  | "signed-legal-artifacts-retained-externally"
  | "credential-storage-disabled"
  | "phi-processing-disabled"
  | "confidential-answer-storage-disabled"
  | "human-approval-required"
  | "external-distribution-disabled";

export const protectedProcurementBuyerAudiences: Array<{
  id: ProtectedProcurementBuyerAudience;
  label: string;
  targetNeed: string;
}> = [
  {
    id: "provider-health-system",
    label: "Provider and health system",
    targetNeed: "Security, privacy, workflow, integration, and implementation evidence for clinical operations buyers."
  },
  {
    id: "payer-plan",
    label: "Payer and plan",
    targetNeed: "Vendor-risk, claims workflow, member-data boundary, and value-based care diligence evidence."
  },
  {
    id: "government-public-health",
    label: "Government and public health",
    targetNeed: "Sovereign deployment, audit, privacy, accessibility, procurement, and public-trust readiness evidence."
  },
  {
    id: "life-sciences-research",
    label: "Life sciences and research",
    targetNeed: "Research operations, protocol, evidence provenance, privacy, and trial workflow diligence evidence."
  },
  {
    id: "employer-benefits",
    label: "Employer benefits",
    targetNeed: "Population health, privacy, vendor-risk, cost-driver, and benefit operations evidence."
  },
  {
    id: "global-channel-partner",
    label: "Global channel partner",
    targetNeed: "Reseller, systems integrator, regional compliance, localization, and implementation readiness evidence."
  },
  {
    id: "investor-board-review",
    label: "Investor and board review",
    targetNeed: "Competitive edge, governance, commercial posture, public-market discipline, and proof-stack evidence."
  }
] as const;

export const protectedProcurementDomains: Array<{
  id: ProtectedProcurementDomain;
  label: string;
  requiredBoundary: string;
}> = [
  {
    id: "security-questionnaire",
    label: "Security questionnaire",
    requiredBoundary: "Questionnaire answers are prepared and retained externally; SCRIMED stores routing metadata only."
  },
  {
    id: "privacy-questionnaire",
    label: "Privacy questionnaire",
    requiredBoundary: "Privacy responses remain externally reviewed and do not authorize PHI processing."
  },
  {
    id: "legal-procurement",
    label: "Legal procurement",
    requiredBoundary: "Signed agreements, legal opinions, and contract terms remain outside SCRIMED."
  },
  {
    id: "vendor-risk",
    label: "Vendor risk",
    requiredBoundary: "Vendor-risk evidence is routed to approved external systems without storing confidential artifacts."
  },
  {
    id: "technical-diligence",
    label: "Technical diligence",
    requiredBoundary: "Architecture and integration evidence remains pre-production and does not enable live access."
  },
  {
    id: "commercial-procurement",
    label: "Commercial procurement",
    requiredBoundary: "Pricing and commercial posture are not legal, accounting, tax, or securities advice."
  },
  {
    id: "data-governance",
    label: "Data governance",
    requiredBoundary: "Data governance routing remains metadata-only and excludes PHI, credentials, and source records."
  },
  {
    id: "implementation-readiness",
    label: "Implementation readiness",
    requiredBoundary: "Implementation evidence stays gated before production authorization and live clinical execution."
  }
] as const;

export const protectedProcurementEvidenceClasses: Array<{
  id: ProtectedProcurementEvidenceClass;
  label: string;
}> = [
  { id: "questionnaire-response-routing", label: "Questionnaire response routing" },
  { id: "security-assurance-routing", label: "Security assurance routing" },
  { id: "privacy-dpa-routing", label: "Privacy and DPA routing" },
  { id: "contracting-routing", label: "Contracting routing" },
  { id: "architecture-evidence-routing", label: "Architecture evidence routing" },
  { id: "operations-runbook-routing", label: "Operations runbook routing" },
  { id: "pricing-commercial-routing", label: "Pricing and commercial routing" },
  { id: "implementation-plan-routing", label: "Implementation plan routing" }
] as const;

export const protectedProcurementRiskTiers: Array<{
  id: ProtectedProcurementRiskTier;
  label: string;
}> = [
  { id: "not-assessed", label: "Not assessed" },
  { id: "low", label: "Low" },
  { id: "moderate", label: "Moderate" },
  { id: "high", label: "High" }
] as const;

export const protectedProcurementEvidenceRegistryRequiredControls: ProtectedProcurementEvidenceRegistryControl[] = [
  "provider-security-review-ready",
  "target-audience-defined",
  "procurement-owner-assigned",
  "buyer-segment-defined",
  "external-system-identified",
  "security-questionnaire-retained-externally",
  "soc-report-retained-externally",
  "pentest-report-retained-externally",
  "signed-legal-artifacts-retained-externally",
  "credential-storage-disabled",
  "phi-processing-disabled",
  "confidential-answer-storage-disabled",
  "human-approval-required",
  "external-distribution-disabled"
];

export type ProtectedProcurementEvidenceRegistryInput = {
  providerSecurityReviewRecordIds: string[];
  targetAudience: ProtectedProcurementBuyerAudience;
  procurementDomain: ProtectedProcurementDomain;
  evidenceClass: ProtectedProcurementEvidenceClass;
  procurementOwnerLabel: string;
  buyerSegmentLabel: string;
  externalSystemLabel: string;
  evidenceRoutingLabel: string;
  evidenceRoutingLocator: string;
  responseCadence: string;
  procurementRiskTier: ProtectedProcurementRiskTier;
  securityQuestionnaireRetainedExternally: true;
  socReportRetainedExternally: true;
  pentestReportRetainedExternally: true;
  signedLegalArtifactsRetainedExternally: true;
  credentialStorageDisabled: true;
  phiProcessingDisabled: true;
  confidentialAnswerStorageDisabled: true;
  humanApprovalRequired: true;
  externalDistributionDisabled: true;
  attestation: typeof protectedProcurementEvidenceRegistryAttestation;
  dataBoundary: typeof protectedProcurementEvidenceRegistryDataBoundary;
  reviewNote: string;
};

export type ProtectedProcurementEvidenceRegistryRecord = {
  id: string;
  tenantId: string;
  workspaceId: string;
  targetAudience: ProtectedProcurementBuyerAudience;
  targetAudienceLabel: string;
  procurementDomain: ProtectedProcurementDomain;
  procurementDomainLabel: string;
  evidenceClass: ProtectedProcurementEvidenceClass;
  evidenceClassLabel: string;
  registryStatus: ProtectedProcurementEvidenceRegistryRecordStatus;
  approvalScope: typeof protectedProcurementEvidenceRegistryApprovalScope;
  providerSecurityReviewRecordIds: string[];
  procurementOwnerLabel: string;
  buyerSegmentLabel: string;
  externalSystemLabel: string;
  evidenceRoutingLabel: string;
  evidenceRoutingLocator: string;
  responseCadence: string;
  procurementRiskTier: ProtectedProcurementRiskTier;
  evidenceSnapshot: Record<string, unknown>;
  requiredProcurementControls: ProtectedProcurementEvidenceRegistryControl[];
  linkedProcurementControls: ProtectedProcurementEvidenceRegistryControl[];
  missingProcurementControls: ProtectedProcurementEvidenceRegistryControl[];
  retainedBlockers: string[];
  releaseRestrictions: string[];
  securityQuestionnaireRetainedExternally: boolean;
  socReportRetainedExternally: boolean;
  pentestReportRetainedExternally: boolean;
  signedLegalArtifactsRetainedExternally: boolean;
  credentialStorageDisabled: boolean;
  phiProcessingDisabled: boolean;
  confidentialAnswerStorageDisabled: boolean;
  humanApprovalRequired: boolean;
  externalDistributionDisabled: boolean;
  attestation: typeof protectedProcurementEvidenceRegistryAttestation;
  reviewNote: string;
  dataBoundary: typeof protectedProcurementEvidenceRegistryDataBoundary;
  procurementEvidenceRegistryAuthority: typeof protectedProcurementEvidenceRegistryAuthority;
  providerSecurityReviewAuthority: typeof protectedProviderSecurityReviewAuthority;
  providerSecurityReviewBaaDpaAuthority: typeof protectedProviderSecurityReviewBaaDpaAuthority;
  providerSecurityReviewStorageAuthority: typeof protectedProviderSecurityReviewStorageAuthority;
  storageAuthority: typeof protectedProcurementEvidenceRegistryStorageAuthority;
  financialReportingAuthority: typeof protectedMetricRollupFinancialAuthority;
  securitiesAuthority: typeof protectedMetricRollupSecuritiesAuthority;
  advertisingClaimsAuthority: typeof protectedFinanceAdvertisingClaimsAuthority;
  clinicalExecutionAuthority: typeof protectedMetricRollupClinicalAuthority;
  recordedBy: string;
  recordedAt: string;
  createdAt: string;
  boundary: string;
};

export type ProtectedProcurementEvidenceRegistryWorkflow = {
  service: "scrimed-protected-procurement-evidence-registry";
  status: typeof protectedProcurementEvidenceRegistryStatus;
  packetStatus: typeof protectedProcurementEvidenceRegistryPacketProofStackStatus;
  summary: {
    registryCount: number;
    readyRegistryCount: number;
    blockedRegistryCount: number;
    availableProviderSecurityReviewCount: number;
    targetAudienceCount: number;
    requiredProcurementControlCount: number;
    linkedProcurementControlCount: number;
    missingProcurementControlCount: number;
    retainedBlockerCount: number;
    latestRegistryAt: string | null;
  };
  registryState:
    | "procurement-evidence-routing-open"
    | "procurement-evidence-metadata-recorded"
    | "procurement-evidence-routing-ready-not-approval";
  externalDistributionState: "distribution-disabled";
  legalState: "procurement-routing-readiness-only-not-approval";
  requiredProcurementControls: ProtectedProcurementEvidenceRegistryControl[];
  linkedProcurementControls: ProtectedProcurementEvidenceRegistryControl[];
  missingProcurementControls: ProtectedProcurementEvidenceRegistryControl[];
  records: ProtectedProcurementEvidenceRegistryRecord[];
  availableProviderSecurityReviews: ProtectedProviderSecurityReviewRecord[];
  buyerAudiences: typeof protectedProcurementBuyerAudiences;
  procurementDomains: typeof protectedProcurementDomains;
  evidenceClasses: typeof protectedProcurementEvidenceClasses;
  riskTiers: typeof protectedProcurementRiskTiers;
  authorities: {
    procurementEvidenceRegistryAuthority: typeof protectedProcurementEvidenceRegistryAuthority;
    storageAuthority: typeof protectedProcurementEvidenceRegistryStorageAuthority;
    providerSecurityReviewAuthority: typeof protectedProviderSecurityReviewAuthority;
    providerSecurityReviewBaaDpaAuthority: typeof protectedProviderSecurityReviewBaaDpaAuthority;
    providerSecurityReviewStorageAuthority: typeof protectedProviderSecurityReviewStorageAuthority;
    financialReportingAuthority: typeof protectedMetricRollupFinancialAuthority;
    securitiesAuthority: typeof protectedMetricRollupSecuritiesAuthority;
    advertisingClaimsAuthority: typeof protectedFinanceAdvertisingClaimsAuthority;
    clinicalExecutionAuthority: typeof protectedMetricRollupClinicalAuthority;
  };
  targetAudienceExpansion: string[];
  competitiveEdges: string[];
  safeWorkarounds: string[];
  unavailableSections: string[];
  boundary: string;
  updated: string;
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const safeMetadataTextPattern = /^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]*$/;

const forbiddenProcurementEvidencePatterns = [
  /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/,
  /sk-[A-Za-z0-9_-]{12,}/i,
  /sbp_[A-Za-z0-9_-]{12,}/i,
  /bearer\s+[A-Za-z0-9._-]+/i,
  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
  /token/i,
  /secret/i,
  /password/i,
  /api[ _-]?key/i,
  /access[ _-]?key/i,
  /client[ _-]?secret/i,
  /oauth/i,
  /https?:\/\//i,
  /ip address/i,
  /device[ _-]?id/i,
  /raw[ _-]?log/i,
  /log row/i,
  /patient[ _-]?(id|identifier|mrn)/i,
  /member[ _-]?(id|identifier)/i,
  /medical record/i,
  /protected health information/i,
  /payer member/i,
  /diagnosis code/i,
  /social security/i,
  /source (contract|document|record|file)/i,
  /signed[ _-]?(baa|dpa|contract|agreement|document|approval)/i,
  /legal opinion/i,
  /soc[ _-]?2[ _-]?(report|certified|certification|type)/i,
  /penetration[ _-]?test/i,
  /vulnerability[ _-]?report/i,
  /security questionnaire answer/i,
  /questionnaire response/i,
  /confidential answer/i,
  /audited financial/i,
  /investment recommendation/i,
  /securities offering/i,
  /valuation guarantee/i,
  /revenue guarantee/i,
  /reimbursement guarantee/i,
  /guaranteed savings/i,
  /guaranteed outcome/i,
  /advertising substantiation/i,
  /clinical validation/i,
  /compliance certification/i,
  /fda[ _-]?cleared/i,
  /hipaa[ _-]?(compliant|certified)/i,
  /autonomous diagnosis/i,
  /treatment recommendation/i,
  /live clinical execution/i,
  /public release approved/i,
  /external distribution approved/i,
  /release approved/i,
  /export approved/i,
  /integration approved/i,
  /security approved/i,
  /privacy approved/i,
  /procurement approved/i,
  /baa executed/i,
  /dpa executed/i,
  /live integration/i,
  /distribution enabled/i,
  /release enabled/i,
  /export enabled/i
];

function safeShortText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength + 1) : "";
}

function isSafeMetadata(value: string, minLength: number, maxLength: number) {
  return (
    value.length >= minLength &&
    value.length <= maxLength &&
    safeMetadataTextPattern.test(value)
  );
}

function containsForbiddenContent(...values: string[]) {
  const candidate = values.join(" ");

  return forbiddenProcurementEvidencePatterns.some((pattern) => pattern.test(candidate));
}

function normalizeUuidArray(value: unknown) {
  if (!Array.isArray(value)) {
    return { values: [] as string[], invalid: true };
  }

  const values = Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );

  return {
    values,
    invalid:
      values.length === 0 ||
      values.length > 10 ||
      values.length !== value.length ||
      values.some((item) => !uuidPattern.test(item))
  };
}

function getTargetAudience(value: string) {
  return protectedProcurementBuyerAudiences.find((audience) => audience.id === value) ?? null;
}

function getProcurementDomain(value: string) {
  return protectedProcurementDomains.find((domain) => domain.id === value) ?? null;
}

function getEvidenceClass(value: string) {
  return protectedProcurementEvidenceClasses.find((evidenceClass) => evidenceClass.id === value) ?? null;
}

export function validateProtectedProcurementEvidenceRegistryInput(value: unknown):
  | { ok: true; input: ProtectedProcurementEvidenceRegistryInput }
  | { ok: false; errors: string[] } {
  const record = value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
  const providerSecurityReviewRecordIds = normalizeUuidArray(
    record.providerSecurityReviewRecordIds
  );
  const targetAudience = safeShortText(record.targetAudience, 80);
  const procurementDomain = safeShortText(record.procurementDomain, 80);
  const evidenceClass = safeShortText(record.evidenceClass, 80);
  const procurementOwnerLabel = safeShortText(record.procurementOwnerLabel, 140);
  const buyerSegmentLabel = safeShortText(record.buyerSegmentLabel, 140);
  const externalSystemLabel = safeShortText(record.externalSystemLabel, 140);
  const evidenceRoutingLabel = safeShortText(record.evidenceRoutingLabel, 140);
  const evidenceRoutingLocator = safeShortText(record.evidenceRoutingLocator, 160);
  const responseCadence = safeShortText(record.responseCadence, 120);
  const procurementRiskTier = safeShortText(record.procurementRiskTier, 80);
  const securityQuestionnaireRetainedExternally =
    record.securityQuestionnaireRetainedExternally === true;
  const socReportRetainedExternally = record.socReportRetainedExternally === true;
  const pentestReportRetainedExternally = record.pentestReportRetainedExternally === true;
  const signedLegalArtifactsRetainedExternally =
    record.signedLegalArtifactsRetainedExternally === true;
  const credentialStorageDisabled = record.credentialStorageDisabled === true;
  const phiProcessingDisabled = record.phiProcessingDisabled === true;
  const confidentialAnswerStorageDisabled =
    record.confidentialAnswerStorageDisabled === true;
  const humanApprovalRequired = record.humanApprovalRequired === true;
  const externalDistributionDisabled = record.externalDistributionDisabled === true;
  const attestation = safeShortText(record.attestation, 120);
  const dataBoundary = safeShortText(record.dataBoundary, 90);
  const reviewNote = safeShortText(record.reviewNote, 300);
  const audience = getTargetAudience(targetAudience);
  const domain = getProcurementDomain(procurementDomain);
  const classRecord = getEvidenceClass(evidenceClass);
  const errors: string[] = [];

  if (providerSecurityReviewRecordIds.invalid) {
    errors.push("Procurement evidence registry requires one to ten valid provider security review record ids.");
  }

  if (!audience) {
    errors.push("Target audience must be an approved SCRIMED buyer audience.");
  }

  if (!domain) {
    errors.push("Procurement domain must be an approved diligence domain.");
  }

  if (!classRecord) {
    errors.push("Evidence class must be an approved procurement evidence class.");
  }

  if (!protectedProcurementRiskTiers.some((tier) => tier.id === procurementRiskTier)) {
    errors.push("Procurement risk tier must be not-assessed, low, moderate, or high.");
  }

  if (!isSafeMetadata(procurementOwnerLabel, 4, 140)) {
    errors.push("Procurement owner label must be bounded no-sensitive-artifact metadata.");
  }

  if (!isSafeMetadata(buyerSegmentLabel, 4, 140)) {
    errors.push("Buyer segment label must be bounded no-sensitive-artifact metadata.");
  }

  if (!isSafeMetadata(externalSystemLabel, 4, 140)) {
    errors.push("External system label must be bounded no-sensitive-artifact metadata.");
  }

  if (!isSafeMetadata(evidenceRoutingLabel, 4, 140)) {
    errors.push("Evidence routing label must be bounded no-sensitive-artifact metadata.");
  }

  if (!isSafeMetadata(evidenceRoutingLocator, 4, 160)) {
    errors.push("Evidence routing locator must be bounded no-sensitive-artifact metadata and cannot be a URL.");
  }

  if (!isSafeMetadata(responseCadence, 4, 120)) {
    errors.push("Response cadence must be bounded no-sensitive-artifact metadata.");
  }

  if (!securityQuestionnaireRetainedExternally) {
    errors.push("Security questionnaire materials must be retained outside SCRIMED.");
  }

  if (!socReportRetainedExternally) {
    errors.push("SOC reports must be retained outside SCRIMED.");
  }

  if (!pentestReportRetainedExternally) {
    errors.push("Penetration-test reports must be retained outside SCRIMED.");
  }

  if (!signedLegalArtifactsRetainedExternally) {
    errors.push("Signed legal artifacts must be retained outside SCRIMED.");
  }

  if (!credentialStorageDisabled) {
    errors.push("Credential storage must remain disabled in the procurement registry.");
  }

  if (!phiProcessingDisabled) {
    errors.push("PHI processing must remain disabled in the procurement registry.");
  }

  if (!confidentialAnswerStorageDisabled) {
    errors.push("Confidential questionnaire answer storage must remain disabled.");
  }

  if (!humanApprovalRequired) {
    errors.push("Human approval checkpoints are required before procurement or production activation.");
  }

  if (!externalDistributionDisabled) {
    errors.push("External distribution must remain disabled until approved outside this registry.");
  }

  if (attestation !== protectedProcurementEvidenceRegistryAttestation) {
    errors.push("Procurement evidence registry requires the fixed metadata-only attestation.");
  }

  if (dataBoundary !== protectedProcurementEvidenceRegistryDataBoundary) {
    errors.push("Procurement evidence registry requires the synthetic business workflow data boundary.");
  }

  if (reviewNote.length > 300) {
    errors.push("Review note must stay under 300 characters.");
  }

  if (
    containsForbiddenContent(
      ...providerSecurityReviewRecordIds.values,
      targetAudience,
      procurementDomain,
      evidenceClass,
      procurementOwnerLabel,
      buyerSegmentLabel,
      externalSystemLabel,
      evidenceRoutingLabel,
      evidenceRoutingLocator,
      responseCadence,
      procurementRiskTier,
      reviewNote
    )
  ) {
    errors.push(
      "Procurement evidence registry metadata cannot contain PHI, credentials, secrets, URLs, tokens, raw logs, IP addresses, device identifiers, patient identifiers, payer member data, source documents, signed agreements, signed BAAs/DPAs, legal opinions, SOC reports, penetration-test reports, vulnerability reports, security questionnaire answers, confidential answers, audited financial claims, securities claims, advertising substantiation, clinical validation, reimbursement guarantees, compliance certification, procurement approval, enabled-export language, or live clinical execution claims."
    );
  }

  if (errors.length > 0 || !audience || !domain || !classRecord) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    input: {
      providerSecurityReviewRecordIds: providerSecurityReviewRecordIds.values,
      targetAudience: audience.id,
      procurementDomain: domain.id,
      evidenceClass: classRecord.id,
      procurementOwnerLabel,
      buyerSegmentLabel,
      externalSystemLabel,
      evidenceRoutingLabel,
      evidenceRoutingLocator,
      responseCadence,
      procurementRiskTier: procurementRiskTier as ProtectedProcurementRiskTier,
      securityQuestionnaireRetainedExternally: true,
      socReportRetainedExternally: true,
      pentestReportRetainedExternally: true,
      signedLegalArtifactsRetainedExternally: true,
      credentialStorageDisabled: true,
      phiProcessingDisabled: true,
      confidentialAnswerStorageDisabled: true,
      humanApprovalRequired: true,
      externalDistributionDisabled: true,
      attestation: protectedProcurementEvidenceRegistryAttestation,
      dataBoundary: protectedProcurementEvidenceRegistryDataBoundary,
      reviewNote
    }
  };
}

function isReadyProviderSecurityReview(record: ProtectedProviderSecurityReviewRecord) {
  return (
    record.reviewStatus === "provider-security-review-ready-not-approval" &&
    record.missingSecurityControls.length === 0 &&
    record.externalSecurityReviewRetained &&
    record.phiProcessingDisabled &&
    record.credentialStorageDisabled &&
    record.signedAgreementStorageDisabled &&
    record.liveIntegrationDisabled &&
    record.humanApprovalRequired &&
    (record.providerSecurityRisk === "low" || record.providerSecurityRisk === "moderate")
  );
}

export function deriveProtectedProcurementEvidenceRegistryWorkflow({
  providerSecurityReviewRecords,
  records,
  unavailableSections = []
}: {
  providerSecurityReviewRecords: ProtectedProviderSecurityReviewRecord[];
  records: ProtectedProcurementEvidenceRegistryRecord[];
  unavailableSections?: string[];
}): ProtectedProcurementEvidenceRegistryWorkflow {
  const availableProviderSecurityReviews = providerSecurityReviewRecords.filter(
    isReadyProviderSecurityReview
  );
  const activeRecords = records.filter(
    (record) =>
      record.securityQuestionnaireRetainedExternally &&
      record.socReportRetainedExternally &&
      record.pentestReportRetainedExternally &&
      record.signedLegalArtifactsRetainedExternally &&
      record.credentialStorageDisabled &&
      record.phiProcessingDisabled &&
      record.confidentialAnswerStorageDisabled &&
      record.humanApprovalRequired &&
      record.externalDistributionDisabled
  );
  const linkedProcurementControls = protectedProcurementEvidenceRegistryRequiredControls.filter(
    (control) => activeRecords.some((record) => record.linkedProcurementControls.includes(control))
  );
  const missingProcurementControls = protectedProcurementEvidenceRegistryRequiredControls.filter(
    (control) => !linkedProcurementControls.includes(control)
  );
  const readyRecords = activeRecords.filter(
    (record) =>
      record.registryStatus === "procurement-evidence-routing-ready-not-approval" &&
      record.missingProcurementControls.length === 0
  );
  const retainedBlockerCount = records.reduce(
    (total, record) => total + record.retainedBlockers.length,
    0
  );
  const targetAudienceCount = new Set(records.map((record) => record.targetAudience)).size;
  const latestRegistry = records[0] ?? null;
  const readyForRouting = readyRecords.length > 0 && availableProviderSecurityReviews.length > 0;

  return {
    service: "scrimed-protected-procurement-evidence-registry",
    status: protectedProcurementEvidenceRegistryStatus,
    packetStatus: protectedProcurementEvidenceRegistryPacketProofStackStatus,
    summary: {
      registryCount: records.length,
      readyRegistryCount: readyForRouting ? readyRecords.length : 0,
      blockedRegistryCount: records.filter((record) => record.registryStatus === "blocked").length,
      availableProviderSecurityReviewCount: availableProviderSecurityReviews.length,
      targetAudienceCount,
      requiredProcurementControlCount: protectedProcurementEvidenceRegistryRequiredControls.length,
      linkedProcurementControlCount: linkedProcurementControls.length,
      missingProcurementControlCount: missingProcurementControls.length,
      retainedBlockerCount,
      latestRegistryAt: latestRegistry?.recordedAt ?? null
    },
    registryState: readyForRouting
      ? "procurement-evidence-routing-ready-not-approval"
      : records.length > 0
        ? "procurement-evidence-metadata-recorded"
        : "procurement-evidence-routing-open",
    externalDistributionState: "distribution-disabled",
    legalState: "procurement-routing-readiness-only-not-approval",
    requiredProcurementControls: protectedProcurementEvidenceRegistryRequiredControls,
    linkedProcurementControls,
    missingProcurementControls,
    records,
    availableProviderSecurityReviews,
    buyerAudiences: protectedProcurementBuyerAudiences,
    procurementDomains: protectedProcurementDomains,
    evidenceClasses: protectedProcurementEvidenceClasses,
    riskTiers: protectedProcurementRiskTiers,
    authorities: {
      procurementEvidenceRegistryAuthority: protectedProcurementEvidenceRegistryAuthority,
      storageAuthority: protectedProcurementEvidenceRegistryStorageAuthority,
      providerSecurityReviewAuthority: protectedProviderSecurityReviewAuthority,
      providerSecurityReviewBaaDpaAuthority: protectedProviderSecurityReviewBaaDpaAuthority,
      providerSecurityReviewStorageAuthority: protectedProviderSecurityReviewStorageAuthority,
      financialReportingAuthority: protectedMetricRollupFinancialAuthority,
      securitiesAuthority: protectedMetricRollupSecuritiesAuthority,
      advertisingClaimsAuthority: protectedFinanceAdvertisingClaimsAuthority,
      clinicalExecutionAuthority: protectedMetricRollupClinicalAuthority
    },
    targetAudienceExpansion: [
      "Provider and health-system CIO, CMIO, CNIO, security, privacy, procurement, revenue-cycle, and transformation stakeholders.",
      "Payer, plan, value-based care, claims operations, vendor-risk, and member-experience buyers.",
      "Government, public-health, sovereign-cloud, regional deployment, accessibility, and public-trust procurement teams.",
      "Life-sciences, research operations, clinical trial, evidence-generation, and compliance teams.",
      "Global channel partners, systems integrators, implementation partners, and investor or board reviewers."
    ],
    competitiveEdges: [
      "Metadata-only procurement routing reduces diligence friction without becoming a risky repository for confidential artifacts.",
      "Provider security review prerequisites connect buyer procurement to governed adapter, privacy, BAA/DPA, incident-response, retention, and rollback gates.",
      "AAL2 tenant isolation, write-before-release audit events, and no-PHI boundaries create enterprise buyer confidence before live clinical use.",
      "Target-audience classification turns generic diligence into buyer-specific evidence paths for providers, payers, governments, research, employers, partners, and investors."
    ],
    safeWorkarounds: [
      "Keep security questionnaires, SOC reports, penetration-test reports, signed agreements, legal opinions, confidential answers, source contracts, credentials, URLs, and PHI in qualified external systems; SCRIMED stores routing metadata only.",
      "Use procurement evidence registry entries as buyer readiness evidence, not procurement approval, legal approval, security approval, compliance certification, public release approval, customer authorization, production authorization, or live clinical execution authority.",
      "When sensitive artifacts are required, route the buyer to the external evidence room, customer VDR, counsel workflow, or security portal and record only a non-secret routing label in SCRIMED.",
      "Block procurement routing when provider security review is missing, risk is high or unassessed, external artifact retention is not confirmed, or human approval checkpoints are absent."
    ],
    unavailableSections,
    boundary: protectedProcurementEvidenceRegistryBoundary,
    updated: "2026-06-20"
  };
}

function formatDate(value: string | null | undefined) {
  if (!value) return "pending";

  const time = new Date(value).getTime();

  return Number.isFinite(time) ? new Date(time).toISOString() : "pending";
}

export function buildProtectedProcurementEvidenceRegistryPacket({
  actorUserId,
  auditEventId,
  generatedAt,
  workflow,
  workspace
}: {
  actorUserId: string;
  auditEventId: string;
  generatedAt: string;
  workflow: ProtectedProcurementEvidenceRegistryWorkflow;
  workspace: PilotWorkspaceRecord;
}) {
  const records = workflow.records.length
    ? workflow.records
        .map(
          (record) => `- ${record.targetAudienceLabel} / ${record.procurementDomainLabel}: ${record.registryStatus} (${record.evidenceClassLabel}, risk ${record.procurementRiskTier}, recorded ${formatDate(record.recordedAt)})`
        )
        .join("\n")
    : "- No protected procurement evidence routing metadata recorded yet.";
  const audiences = workflow.targetAudienceExpansion
    .map((audience) => `- ${audience}`)
    .join("\n");
  const edges = workflow.competitiveEdges.map((edge) => `- ${edge}`).join("\n");
  const workarounds = workflow.safeWorkarounds
    .map((workaround) => `- ${workaround}`)
    .join("\n");
  const missingControls = workflow.missingProcurementControls.length
    ? workflow.missingProcurementControls.map((control) => `- ${control}`).join("\n")
    : "- none";

  return `# SCRIMED Protected Procurement Evidence Registry Packet

Generated: ${generatedAt}
Workspace: ${workspace.name} (${workspace.slug})
Actor: ${actorUserId}
Audit Event: ${auditEventId}

## Boundary
${workflow.boundary}

## Authority
- Registry authority: ${workflow.authorities.procurementEvidenceRegistryAuthority}
- Storage authority: ${workflow.authorities.storageAuthority}
- Provider security review authority: ${workflow.authorities.providerSecurityReviewAuthority}
- BAA/DPA authority: ${workflow.authorities.providerSecurityReviewBaaDpaAuthority}
- Financial reporting authority: ${workflow.authorities.financialReportingAuthority}
- Securities authority: ${workflow.authorities.securitiesAuthority}
- Advertising claims authority: ${workflow.authorities.advertisingClaimsAuthority}
- Clinical execution authority: ${workflow.authorities.clinicalExecutionAuthority}
- External distribution: ${workflow.externalDistributionState}
- Legal state: ${workflow.legalState}

## Summary
- Status: ${workflow.status}
- Packet status: ${workflow.packetStatus}
- Registry state: ${workflow.registryState}
- Registry records: ${workflow.summary.registryCount}
- Ready routing records: ${workflow.summary.readyRegistryCount}
- Blocked routing records: ${workflow.summary.blockedRegistryCount}
- Available provider security reviews: ${workflow.summary.availableProviderSecurityReviewCount}
- Target audiences represented: ${workflow.summary.targetAudienceCount}
- Required procurement controls: ${workflow.summary.requiredProcurementControlCount}
- Linked procurement controls: ${workflow.summary.linkedProcurementControlCount}
- Missing procurement controls: ${workflow.summary.missingProcurementControlCount}
- Latest registry record: ${formatDate(workflow.summary.latestRegistryAt)}

## Records
${records}

## Missing Controls
${missingControls}

## Target Audience Expansion
${audiences}

## Competitive Edge
${edges}

## Safe Workarounds
${workarounds}

## Unavailable Sections
${
  workflow.unavailableSections.length
    ? workflow.unavailableSections.map((section) => `- ${section}`).join("\n")
    : "- none"
}
`;
}
