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
  protectedEvidenceRoomProviderAdapterAuthority,
  protectedEvidenceRoomProviderAdapterReleaseAuthority,
  type ProtectedEvidenceRoomProviderAdapterRecord
} from "./protectedEvidenceRoomProviderAdapters";

export const protectedProviderSecurityReviewStatus =
  "aal2-provider-security-review-workbench-no-phi";
export const protectedProviderSecurityReviewPacketProofStackStatus =
  "aal2-audited-provider-security-review-packets-no-phi";
export const protectedProviderSecurityReviewAttestation =
  "provider-security-review-metadata-no-phi";
export const protectedProviderSecurityReviewDataBoundary =
  "synthetic-business-workflow-only";
export const protectedProviderSecurityReviewAuthority =
  "provider-security-review-readiness-not-security-approval";
export const protectedProviderSecurityReviewBaaDpaAuthority =
  "pre-production-baa-dpa-readiness-not-executed-agreement";
export const protectedProviderSecurityReviewStorageAuthority =
  "provider-security-review-metadata-only-no-credentials-phi-or-legal-artifacts";
export const protectedProviderSecurityReviewApprovalScope =
  "provider-security-review-readiness-only";
export const protectedProviderSecurityReviewBoundary =
  "Protected Provider Security Reviews record metadata-only readiness for externally retained security, privacy, BAA/DPA, credential-handling, incident-response, retention/residency, vendor-risk, and go-live rollback review. They do not store PHI, patient identifiers, payer member data, live clinical records, source documents, source contracts, secrets, credentials, URLs, access tokens, raw logs, raw log rows, IP addresses, device identifiers, recipient names, recipient email addresses, signed agreements, signed BAAs/DPAs, legal opinions, security questionnaire answers containing confidential details, SOC reports, penetration-test reports, audited financial statements, securities offering material, investment advice, accounting advice, tax advice, valuation assurance, revenue guarantee, reimbursement assurance, advertising claim substantiation, clinical validation, compliance certification, customer permission artifacts, public release approval, external distribution approval, production authorization, live integration approval, or live clinical execution approval.";

export type ProtectedProviderSecurityReviewDomain =
  | "security-architecture"
  | "privacy-impact"
  | "baa-dpa-readiness"
  | "credential-handling"
  | "incident-response"
  | "data-retention-residency"
  | "vendor-risk"
  | "go-live-rollback";

export type ProtectedProviderSecurityRiskTier =
  | "not-assessed"
  | "low"
  | "moderate"
  | "high";

export type ProtectedProviderSecurityReviewRecordStatus =
  | "provider-security-review-metadata-recorded"
  | "provider-security-review-ready-not-approval"
  | "blocked";

export type ProtectedProviderSecurityReviewControl =
  | "provider-adapter-contract-ready"
  | "security-owner-assigned"
  | "privacy-owner-assigned"
  | "baa-dpa-path-defined"
  | "phi-processing-disabled"
  | "credential-storage-disabled"
  | "signed-agreement-storage-disabled"
  | "incident-response-path-defined"
  | "retention-residency-path-defined"
  | "live-integration-disabled"
  | "rollback-plan-defined"
  | "human-approval-required";

export const protectedProviderSecurityReviewDomains: Array<{
  id: ProtectedProviderSecurityReviewDomain;
  label: string;
  requiredBoundary: string;
}> = [
  {
    id: "security-architecture",
    label: "Security architecture",
    requiredBoundary: "Architecture review remains externally retained and does not authorize production integration."
  },
  {
    id: "privacy-impact",
    label: "Privacy impact",
    requiredBoundary: "Privacy review remains metadata-only; no PHI or customer records are stored."
  },
  {
    id: "baa-dpa-readiness",
    label: "BAA/DPA readiness",
    requiredBoundary: "BAA/DPA pathing is tracked without storing signed agreements or legal opinions."
  },
  {
    id: "credential-handling",
    label: "Credential handling",
    requiredBoundary: "Production credentials, tokens, URLs, and secrets stay outside SCRIMED."
  },
  {
    id: "incident-response",
    label: "Incident response",
    requiredBoundary: "Incident runbooks are referenced as metadata and require buyer approval before go-live."
  },
  {
    id: "data-retention-residency",
    label: "Retention and residency",
    requiredBoundary: "Retention, residency, and deletion controls remain deployment-specific gates."
  },
  {
    id: "vendor-risk",
    label: "Vendor risk",
    requiredBoundary: "Vendor-risk artifacts are retained in qualified external systems."
  },
  {
    id: "go-live-rollback",
    label: "Go-live and rollback",
    requiredBoundary: "Go-live, rollback, and shutdown authority remain disabled until approved."
  }
] as const;

export const protectedProviderSecurityRiskTiers: Array<{
  id: ProtectedProviderSecurityRiskTier;
  label: string;
}> = [
  { id: "not-assessed", label: "Not assessed" },
  { id: "low", label: "Low" },
  { id: "moderate", label: "Moderate" },
  { id: "high", label: "High" }
] as const;

export const protectedProviderSecurityReviewRequiredControls: ProtectedProviderSecurityReviewControl[] = [
  "provider-adapter-contract-ready",
  "security-owner-assigned",
  "privacy-owner-assigned",
  "baa-dpa-path-defined",
  "phi-processing-disabled",
  "credential-storage-disabled",
  "signed-agreement-storage-disabled",
  "incident-response-path-defined",
  "retention-residency-path-defined",
  "live-integration-disabled",
  "rollback-plan-defined",
  "human-approval-required"
];

export type ProtectedProviderSecurityReviewInput = {
  providerAdapterRecordIds: string[];
  reviewDomain: ProtectedProviderSecurityReviewDomain;
  securityOwnerLabel: string;
  privacyOwnerLabel: string;
  agreementPathLabel: string;
  incidentResponsePathLabel: string;
  retentionResidencyPathLabel: string;
  rollbackPlanLabel: string;
  reviewCadence: string;
  providerSecurityRisk: ProtectedProviderSecurityRiskTier;
  externalSecurityReviewRetained: true;
  phiProcessingDisabled: true;
  credentialStorageDisabled: true;
  signedAgreementStorageDisabled: true;
  liveIntegrationDisabled: true;
  humanApprovalRequired: true;
  attestation: typeof protectedProviderSecurityReviewAttestation;
  dataBoundary: typeof protectedProviderSecurityReviewDataBoundary;
  reviewNote: string;
};

export type ProtectedProviderSecurityReviewRecord = {
  id: string;
  tenantId: string;
  workspaceId: string;
  reviewDomain: ProtectedProviderSecurityReviewDomain;
  reviewDomainLabel: string;
  reviewStatus: ProtectedProviderSecurityReviewRecordStatus;
  approvalScope: typeof protectedProviderSecurityReviewApprovalScope;
  providerAdapterRecordIds: string[];
  securityOwnerLabel: string;
  privacyOwnerLabel: string;
  agreementPathLabel: string;
  incidentResponsePathLabel: string;
  retentionResidencyPathLabel: string;
  rollbackPlanLabel: string;
  reviewCadence: string;
  providerSecurityRisk: ProtectedProviderSecurityRiskTier;
  evidenceSnapshot: Record<string, unknown>;
  requiredSecurityControls: ProtectedProviderSecurityReviewControl[];
  linkedSecurityControls: ProtectedProviderSecurityReviewControl[];
  missingSecurityControls: ProtectedProviderSecurityReviewControl[];
  retainedBlockers: string[];
  releaseRestrictions: string[];
  externalSecurityReviewRetained: boolean;
  phiProcessingDisabled: boolean;
  credentialStorageDisabled: boolean;
  signedAgreementStorageDisabled: boolean;
  liveIntegrationDisabled: boolean;
  humanApprovalRequired: boolean;
  attestation: typeof protectedProviderSecurityReviewAttestation;
  reviewNote: string;
  dataBoundary: typeof protectedProviderSecurityReviewDataBoundary;
  providerSecurityReviewAuthority: typeof protectedProviderSecurityReviewAuthority;
  baaDpaAuthority: typeof protectedProviderSecurityReviewBaaDpaAuthority;
  storageAuthority: typeof protectedProviderSecurityReviewStorageAuthority;
  providerAdapterAuthority: typeof protectedEvidenceRoomProviderAdapterAuthority;
  providerAdapterReleaseAuthority: typeof protectedEvidenceRoomProviderAdapterReleaseAuthority;
  financialReportingAuthority: typeof protectedMetricRollupFinancialAuthority;
  securitiesAuthority: typeof protectedMetricRollupSecuritiesAuthority;
  advertisingClaimsAuthority: typeof protectedFinanceAdvertisingClaimsAuthority;
  clinicalExecutionAuthority: typeof protectedMetricRollupClinicalAuthority;
  recordedBy: string;
  recordedAt: string;
  createdAt: string;
  boundary: string;
};

export type ProtectedProviderSecurityReviewWorkflow = {
  service: "scrimed-protected-provider-security-reviews";
  status: typeof protectedProviderSecurityReviewStatus;
  packetStatus: typeof protectedProviderSecurityReviewPacketProofStackStatus;
  summary: {
    reviewCount: number;
    readyForReviewCount: number;
    blockedReviewCount: number;
    availableProviderAdapterCount: number;
    requiredSecurityControlCount: number;
    linkedSecurityControlCount: number;
    missingSecurityControlCount: number;
    retainedBlockerCount: number;
    latestReviewAt: string | null;
  };
  reviewState:
    | "provider-security-review-open"
    | "provider-security-review-metadata-recorded"
    | "provider-security-review-ready-not-approval";
  integrationState: "integration-disabled";
  legalState: "baa-dpa-readiness-only-not-executed-agreement";
  requiredSecurityControls: ProtectedProviderSecurityReviewControl[];
  linkedSecurityControls: ProtectedProviderSecurityReviewControl[];
  missingSecurityControls: ProtectedProviderSecurityReviewControl[];
  records: ProtectedProviderSecurityReviewRecord[];
  availableProviderAdapters: ProtectedEvidenceRoomProviderAdapterRecord[];
  reviewDomains: typeof protectedProviderSecurityReviewDomains;
  riskTiers: typeof protectedProviderSecurityRiskTiers;
  authorities: {
    providerSecurityReviewAuthority: typeof protectedProviderSecurityReviewAuthority;
    baaDpaAuthority: typeof protectedProviderSecurityReviewBaaDpaAuthority;
    storageAuthority: typeof protectedProviderSecurityReviewStorageAuthority;
    providerAdapterAuthority: typeof protectedEvidenceRoomProviderAdapterAuthority;
    providerAdapterReleaseAuthority: typeof protectedEvidenceRoomProviderAdapterReleaseAuthority;
    financialReportingAuthority: typeof protectedMetricRollupFinancialAuthority;
    securitiesAuthority: typeof protectedMetricRollupSecuritiesAuthority;
    advertisingClaimsAuthority: typeof protectedFinanceAdvertisingClaimsAuthority;
    clinicalExecutionAuthority: typeof protectedMetricRollupClinicalAuthority;
  };
  safeWorkarounds: string[];
  unavailableSections: string[];
  boundary: string;
  updated: string;
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i;
const safeMetadataTextPattern = /^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]*$/;

const forbiddenSecurityReviewPatterns = [
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
  /soc[ _-]?2[ _-]?(report|certified|certification)/i,
  /penetration[ _-]?test/i,
  /vulnerability[ _-]?report/i,
  /security questionnaire answer/i,
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
  /baa executed/i,
  /dpa executed/i,
  /live integration/i,
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

  return forbiddenSecurityReviewPatterns.some((pattern) => pattern.test(candidate));
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

function getReviewDomain(value: string) {
  return protectedProviderSecurityReviewDomains.find((domain) => domain.id === value) ?? null;
}

export function validateProtectedProviderSecurityReviewInput(value: unknown):
  | { ok: true; input: ProtectedProviderSecurityReviewInput }
  | { ok: false; errors: string[] } {
  const record = value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
  const providerAdapterRecordIds = normalizeUuidArray(record.providerAdapterRecordIds);
  const reviewDomain = safeShortText(record.reviewDomain, 80);
  const securityOwnerLabel = safeShortText(record.securityOwnerLabel, 140);
  const privacyOwnerLabel = safeShortText(record.privacyOwnerLabel, 140);
  const agreementPathLabel = safeShortText(record.agreementPathLabel, 140);
  const incidentResponsePathLabel = safeShortText(record.incidentResponsePathLabel, 140);
  const retentionResidencyPathLabel = safeShortText(record.retentionResidencyPathLabel, 140);
  const rollbackPlanLabel = safeShortText(record.rollbackPlanLabel, 140);
  const reviewCadence = safeShortText(record.reviewCadence, 120);
  const providerSecurityRisk = safeShortText(record.providerSecurityRisk, 80);
  const externalSecurityReviewRetained = record.externalSecurityReviewRetained === true;
  const phiProcessingDisabled = record.phiProcessingDisabled === true;
  const credentialStorageDisabled = record.credentialStorageDisabled === true;
  const signedAgreementStorageDisabled = record.signedAgreementStorageDisabled === true;
  const liveIntegrationDisabled = record.liveIntegrationDisabled === true;
  const humanApprovalRequired = record.humanApprovalRequired === true;
  const attestation = safeShortText(record.attestation, 120);
  const dataBoundary = safeShortText(record.dataBoundary, 90);
  const reviewNote = safeShortText(record.reviewNote, 300);
  const domain = getReviewDomain(reviewDomain);
  const errors: string[] = [];

  if (providerAdapterRecordIds.invalid) {
    errors.push("Provider security review requires one to ten valid provider adapter record ids.");
  }

  if (!domain) {
    errors.push("Provider security review domain must be an approved review domain.");
  }

  if (!protectedProviderSecurityRiskTiers.some((tier) => tier.id === providerSecurityRisk)) {
    errors.push("Provider security risk must be not-assessed, low, moderate, or high.");
  }

  if (!isSafeMetadata(securityOwnerLabel, 4, 140)) {
    errors.push("Security owner label must be bounded no-PHI metadata.");
  }

  if (!isSafeMetadata(privacyOwnerLabel, 4, 140)) {
    errors.push("Privacy owner label must be bounded no-PHI metadata.");
  }

  if (!isSafeMetadata(agreementPathLabel, 4, 140)) {
    errors.push("Agreement path label must be bounded no-PHI metadata.");
  }

  if (!isSafeMetadata(incidentResponsePathLabel, 4, 140)) {
    errors.push("Incident response path label must be bounded no-PHI metadata.");
  }

  if (!isSafeMetadata(retentionResidencyPathLabel, 4, 140)) {
    errors.push("Retention and residency path label must be bounded no-PHI metadata.");
  }

  if (!isSafeMetadata(rollbackPlanLabel, 4, 140)) {
    errors.push("Rollback plan label must be bounded no-PHI metadata.");
  }

  if (!isSafeMetadata(reviewCadence, 4, 120)) {
    errors.push("Review cadence must be bounded no-PHI metadata.");
  }

  if (!externalSecurityReviewRetained) {
    errors.push("Security review artifacts must be retained outside SCRIMED.");
  }

  if (!phiProcessingDisabled) {
    errors.push("PHI processing must remain disabled in this review workbench.");
  }

  if (!credentialStorageDisabled) {
    errors.push("Credential storage must remain disabled in this review workbench.");
  }

  if (!signedAgreementStorageDisabled) {
    errors.push("Signed agreement storage must remain disabled in this review workbench.");
  }

  if (!liveIntegrationDisabled) {
    errors.push("Live integration must remain disabled in this review workbench.");
  }

  if (!humanApprovalRequired) {
    errors.push("Human approval checkpoints are required before any production activation.");
  }

  if (attestation !== protectedProviderSecurityReviewAttestation) {
    errors.push("Provider security review requires the fixed no-PHI metadata attestation.");
  }

  if (dataBoundary !== protectedProviderSecurityReviewDataBoundary) {
    errors.push("Provider security review requires the synthetic business workflow data boundary.");
  }

  if (reviewNote.length > 300) {
    errors.push("Review note must stay under 300 characters.");
  }

  if (
    containsForbiddenContent(
      ...providerAdapterRecordIds.values,
      reviewDomain,
      securityOwnerLabel,
      privacyOwnerLabel,
      agreementPathLabel,
      incidentResponsePathLabel,
      retentionResidencyPathLabel,
      rollbackPlanLabel,
      reviewCadence,
      providerSecurityRisk,
      reviewNote
    )
  ) {
    errors.push(
      "Provider security review metadata cannot contain PHI, credentials, secrets, URLs, tokens, raw logs, IP addresses, device identifiers, patient identifiers, payer member data, source documents, signed agreements, signed BAAs/DPAs, legal opinions, SOC reports, penetration-test reports, security questionnaire answers, audited financial claims, securities claims, advertising substantiation, clinical validation, reimbursement guarantees, compliance certification, security approval, privacy approval, executed-agreement claims, enabled-export language, or live clinical execution claims."
    );
  }

  if (errors.length > 0 || !domain) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    input: {
      providerAdapterRecordIds: providerAdapterRecordIds.values,
      reviewDomain: domain.id,
      securityOwnerLabel,
      privacyOwnerLabel,
      agreementPathLabel,
      incidentResponsePathLabel,
      retentionResidencyPathLabel,
      rollbackPlanLabel,
      reviewCadence,
      providerSecurityRisk: providerSecurityRisk as ProtectedProviderSecurityRiskTier,
      externalSecurityReviewRetained: true,
      phiProcessingDisabled: true,
      credentialStorageDisabled: true,
      signedAgreementStorageDisabled: true,
      liveIntegrationDisabled: true,
      humanApprovalRequired: true,
      attestation: protectedProviderSecurityReviewAttestation,
      dataBoundary: protectedProviderSecurityReviewDataBoundary,
      reviewNote
    }
  };
}

function isReadyProviderAdapter(record: ProtectedEvidenceRoomProviderAdapterRecord) {
  return (
    record.adapterStatus === "provider-adapter-contract-ready-not-integration-approval" &&
    record.missingProviderControls.length === 0 &&
    record.externalProviderAuthorityRetained &&
    record.rawLogImportDisabled &&
    record.credentialStorageDisabled &&
    record.exportDisabled &&
    (record.providerRiskTier === "low" || record.providerRiskTier === "moderate")
  );
}

export function deriveProtectedProviderSecurityReviewWorkflow({
  providerAdapterRecords,
  records,
  unavailableSections = []
}: {
  providerAdapterRecords: ProtectedEvidenceRoomProviderAdapterRecord[];
  records: ProtectedProviderSecurityReviewRecord[];
  unavailableSections?: string[];
}): ProtectedProviderSecurityReviewWorkflow {
  const availableProviderAdapters = providerAdapterRecords.filter(isReadyProviderAdapter);
  const activeRecords = records.filter(
    (record) =>
      record.externalSecurityReviewRetained &&
      record.phiProcessingDisabled &&
      record.credentialStorageDisabled &&
      record.signedAgreementStorageDisabled &&
      record.liveIntegrationDisabled &&
      record.humanApprovalRequired
  );
  const linkedSecurityControls = protectedProviderSecurityReviewRequiredControls.filter(
    (control) => activeRecords.some((record) => record.linkedSecurityControls.includes(control))
  );
  const missingSecurityControls = protectedProviderSecurityReviewRequiredControls.filter(
    (control) => !linkedSecurityControls.includes(control)
  );
  const readyRecords = activeRecords.filter(
    (record) =>
      record.reviewStatus === "provider-security-review-ready-not-approval" &&
      record.missingSecurityControls.length === 0
  );
  const retainedBlockerCount = records.reduce(
    (total, record) => total + record.retainedBlockers.length,
    0
  );
  const latestReview = records[0] ?? null;
  const readyForReview = readyRecords.length > 0 && availableProviderAdapters.length > 0;

  return {
    service: "scrimed-protected-provider-security-reviews",
    status: protectedProviderSecurityReviewStatus,
    packetStatus: protectedProviderSecurityReviewPacketProofStackStatus,
    summary: {
      reviewCount: records.length,
      readyForReviewCount: readyForReview ? readyRecords.length : 0,
      blockedReviewCount: records.filter((record) => record.reviewStatus === "blocked").length,
      availableProviderAdapterCount: availableProviderAdapters.length,
      requiredSecurityControlCount: protectedProviderSecurityReviewRequiredControls.length,
      linkedSecurityControlCount: linkedSecurityControls.length,
      missingSecurityControlCount: missingSecurityControls.length,
      retainedBlockerCount,
      latestReviewAt: latestReview?.recordedAt ?? null
    },
    reviewState: readyForReview
      ? "provider-security-review-ready-not-approval"
      : records.length > 0
        ? "provider-security-review-metadata-recorded"
        : "provider-security-review-open",
    integrationState: "integration-disabled",
    legalState: "baa-dpa-readiness-only-not-executed-agreement",
    requiredSecurityControls: protectedProviderSecurityReviewRequiredControls,
    linkedSecurityControls,
    missingSecurityControls,
    records,
    availableProviderAdapters,
    reviewDomains: protectedProviderSecurityReviewDomains,
    riskTiers: protectedProviderSecurityRiskTiers,
    authorities: {
      providerSecurityReviewAuthority: protectedProviderSecurityReviewAuthority,
      baaDpaAuthority: protectedProviderSecurityReviewBaaDpaAuthority,
      storageAuthority: protectedProviderSecurityReviewStorageAuthority,
      providerAdapterAuthority: protectedEvidenceRoomProviderAdapterAuthority,
      providerAdapterReleaseAuthority: protectedEvidenceRoomProviderAdapterReleaseAuthority,
      financialReportingAuthority: protectedMetricRollupFinancialAuthority,
      securitiesAuthority: protectedMetricRollupSecuritiesAuthority,
      advertisingClaimsAuthority: protectedFinanceAdvertisingClaimsAuthority,
      clinicalExecutionAuthority: protectedMetricRollupClinicalAuthority
    },
    safeWorkarounds: [
      "Keep signed BAAs, DPAs, SOC reports, penetration-test reports, security questionnaires, legal opinions, raw logs, credentials, URLs, tokens, source contracts, and production runbooks in qualified external systems; SCRIMED stores review metadata only.",
      "Use provider security reviews as pre-production readiness evidence, not security approval, legal approval, compliance certification, customer authorization, live integration approval, or live clinical execution authority.",
      "Keep live integration disabled when provider risk is unresolved, a BAA/DPA path is incomplete, security ownership changes, privacy ownership changes, credential handling changes, retention/residency is unapproved, incident response is missing, or rollback authority is undefined.",
      "Route any production connector through customer security review, privacy review, BAA/DPA execution where applicable, credential-vault design, monitoring, incident response, rollback drills, and named human approval before activation."
    ],
    unavailableSections,
    boundary: protectedProviderSecurityReviewBoundary,
    updated: "2026-06-20"
  };
}

function linesForSecurityReview(record: ProtectedProviderSecurityReviewRecord) {
  return [
    `### ${record.reviewDomainLabel}`,
    `- Review status: ${record.reviewStatus}`,
    `- Provider security risk: ${record.providerSecurityRisk}`,
    `- Security owner label: ${record.securityOwnerLabel}`,
    `- Privacy owner label: ${record.privacyOwnerLabel}`,
    `- Agreement path label: ${record.agreementPathLabel}`,
    `- Incident response path: ${record.incidentResponsePathLabel}`,
    `- Retention and residency path: ${record.retentionResidencyPathLabel}`,
    `- Rollback plan label: ${record.rollbackPlanLabel}`,
    `- Review cadence: ${record.reviewCadence}`,
    `- External security review retained: ${record.externalSecurityReviewRetained ? "yes" : "no"}`,
    `- PHI processing disabled: ${record.phiProcessingDisabled ? "yes" : "no"}`,
    `- Credential storage disabled: ${record.credentialStorageDisabled ? "yes" : "no"}`,
    `- Signed agreement storage disabled: ${record.signedAgreementStorageDisabled ? "yes" : "no"}`,
    `- Live integration disabled: ${record.liveIntegrationDisabled ? "yes" : "no"}`,
    `- Human approval required: ${record.humanApprovalRequired ? "yes" : "no"}`,
    `- Provider security authority: ${record.providerSecurityReviewAuthority}`,
    `- BAA/DPA authority: ${record.baaDpaAuthority}`,
    `- Storage authority: ${record.storageAuthority}`,
    `- Review note: ${record.reviewNote || "none"}`,
    `- Recorded at: ${record.recordedAt}`,
    `- Boundary: ${record.boundary}`,
    "- Provider adapter record ids:",
    ...record.providerAdapterRecordIds.map((id) => `  - ${id}`),
    "- Missing security controls:",
    ...(record.missingSecurityControls.length
      ? record.missingSecurityControls.map((control) => `  - ${control}`)
      : ["  - none"]),
    "- Retained blockers:",
    ...record.retainedBlockers.map((blocker) => `  - ${blocker}`),
    "- Release restrictions:",
    ...record.releaseRestrictions.map((restriction) => `  - ${restriction}`)
  ];
}

export function buildProtectedProviderSecurityReviewPacket({
  actorUserId,
  auditEventId,
  generatedAt,
  workflow,
  workspace
}: {
  actorUserId: string;
  auditEventId?: string | null;
  generatedAt: string;
  workflow: ProtectedProviderSecurityReviewWorkflow;
  workspace: PilotWorkspaceRecord;
}) {
  return [
    "# SCRIMED Protected Provider Security Review Packet",
    "",
    `Workspace: ${workspace.name} (${workspace.slug})`,
    `Generated: ${generatedAt}`,
    `Generated by: ${actorUserId}`,
    `Packet audit event: ${auditEventId ?? "pending"}`,
    `Proof stack: ${workflow.packetStatus}`,
    "",
    "## Boundary",
    workflow.boundary,
    "",
    "## Authorities",
    `Provider security review authority: ${workflow.authorities.providerSecurityReviewAuthority}`,
    `BAA/DPA authority: ${workflow.authorities.baaDpaAuthority}`,
    `Storage authority: ${workflow.authorities.storageAuthority}`,
    `Provider adapter authority: ${workflow.authorities.providerAdapterAuthority}`,
    `Provider adapter release authority: ${workflow.authorities.providerAdapterReleaseAuthority}`,
    `Financial reporting authority: ${workflow.authorities.financialReportingAuthority}`,
    `Securities authority: ${workflow.authorities.securitiesAuthority}`,
    `Advertising claims authority: ${workflow.authorities.advertisingClaimsAuthority}`,
    `Clinical execution authority: ${workflow.authorities.clinicalExecutionAuthority}`,
    "",
    "## Summary",
    `- Review state: ${workflow.reviewState}`,
    `- Integration state: ${workflow.integrationState}`,
    `- Legal state: ${workflow.legalState}`,
    `- Provider security reviews: ${workflow.summary.reviewCount}`,
    `- Ready for review: ${workflow.summary.readyForReviewCount}`,
    `- Blocked reviews: ${workflow.summary.blockedReviewCount}`,
    `- Available provider adapters: ${workflow.summary.availableProviderAdapterCount}`,
    `- Required security controls: ${workflow.summary.requiredSecurityControlCount}`,
    `- Linked security controls: ${workflow.summary.linkedSecurityControlCount}`,
    `- Missing security controls: ${workflow.summary.missingSecurityControlCount}`,
    `- Retained blockers: ${workflow.summary.retainedBlockerCount}`,
    `- Latest review: ${workflow.summary.latestReviewAt ?? "not recorded"}`,
    "",
    "## Review Domains",
    ...workflow.reviewDomains.map(
      (domain) => `- ${domain.id}: ${domain.label} - ${domain.requiredBoundary}`
    ),
    "",
    "## Available Provider Adapters",
    ...(workflow.availableProviderAdapters.length
      ? workflow.availableProviderAdapters.map(
          (adapter) =>
            `- ${adapter.id}: ${adapter.providerClassLabel} / ${adapter.externalProviderLabel} / ${adapter.providerRiskTier}`
        )
      : ["- No ready provider adapters recorded."]),
    "",
    "## Missing Security Controls",
    ...(workflow.missingSecurityControls.length
      ? workflow.missingSecurityControls.map((control) => `- ${control}`)
      : ["- None recorded."]),
    "",
    "## Security Review Records",
    ...(workflow.records.length
      ? workflow.records.flatMap(linesForSecurityReview)
      : ["- No protected provider security review metadata recorded."]),
    "",
    "## Safe Workarounds",
    ...workflow.safeWorkarounds.map((workaround) => `- ${workaround}`),
    "",
    "## Unavailable Sections",
    ...(workflow.unavailableSections.length
      ? workflow.unavailableSections.map((section) => `- ${section}`)
      : ["- None recorded."]),
    "",
    "## Required Next Review",
    "- Provider security reviews remain metadata-only and do not approve security, privacy, legal, production, reimbursement, clinical, public release, external distribution, or live integration decisions.",
    "- Signed BAAs, DPAs, SOC reports, penetration-test reports, security questionnaires, legal opinions, customer approvals, production credential material, and confidential provider documents must remain in qualified external systems.",
    "- Production connector activation requires customer authorization, executed agreement path where applicable, credential-vault approval, monitoring, incident response, rollback drills, and named human approval.",
    "",
    `Updated: ${workflow.updated}`
  ].join("\n");
}
