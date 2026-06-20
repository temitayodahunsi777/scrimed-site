import {
  protectedFinanceAdvertisingClaimsAuthority,
  protectedFinanceExternalUseAuthority
} from "./protectedFinanceMethodology";
import {
  protectedMetricRollupClinicalAuthority,
  protectedMetricRollupFinancialAuthority,
  protectedMetricRollupSecuritiesAuthority
} from "./protectedMetricRollups";
import type { PilotWorkspaceRecord } from "./protectedPilotWorkspace";
import type { ProtectedDistributionAudience } from "./protectedDistributionLockbox";
import {
  protectedEvidenceRoomAccessLogBoundary,
  protectedEvidenceRoomAccessLogReconciliationAuthority,
  protectedEvidenceRoomAccessLogReconciliationDataBoundary,
  protectedEvidenceRoomAccessLogReconciliationStatus,
  protectedEvidenceRoomAccessLogReleaseAuthority,
  protectedEvidenceRoomAccessLogStorageAuthority,
  type ProtectedEvidenceRoomAccessLogReconciliationRecord,
  type ProtectedEvidenceRoomAccessLogReconciliationWorkflow
} from "./protectedEvidenceRoomAccessLogReconciliation";

export const protectedEvidenceRoomProviderAdapterStatus =
  "aal2-evidence-room-provider-adapter-contracts-disabled-no-phi";
export const protectedEvidenceRoomProviderAdapterPacketProofStackStatus =
  "aal2-audited-evidence-room-provider-adapter-packets-no-phi";
export const protectedEvidenceRoomProviderAdapterAttestation =
  "evidence-room-provider-adapter-contract-metadata-no-phi";
export const protectedEvidenceRoomProviderAdapterDataBoundary =
  protectedEvidenceRoomAccessLogReconciliationDataBoundary;
export const protectedEvidenceRoomProviderAdapterAuthority =
  "provider-adapter-contract-metadata-not-integration-approval";
export const protectedEvidenceRoomProviderAdapterReleaseAuthority =
  "integration-disabled-pending-external-provider-contracting";
export const protectedEvidenceRoomProviderAdapterStorageAuthority =
  "provider-adapter-metadata-only-no-credentials-raw-logs-or-recipient-identifiers";
export const protectedEvidenceRoomProviderAdapterApprovalScope =
  "provider-adapter-contract-readiness-only";
export const protectedEvidenceRoomProviderAdapterBoundary =
  "Protected Evidence Room Provider Adapter Contracts record disabled-by-default no-PHI metadata for externally retained evidence-room provider contracts, adapter design references, and audit-log import stubs. They do not store PHI, patient identifiers, payer member data, live clinical records, source documents, source contracts, secrets, credentials, URLs, access tokens, raw access logs, raw log rows, IP addresses, device identifiers, recipient names, recipient email addresses, exact recipient lists, signed approvals, signed BAAs/DPAs, legal opinions, audited financial statements, securities offering material, investment advice, accounting advice, tax advice, valuation assurance, revenue guarantee, reimbursement assurance, advertising claim substantiation, clinical validation, compliance certification, customer permission artifacts, public release approval, external distribution approval, production authorization, live integration approval, or live clinical execution approval.";

export type ProtectedEvidenceRoomProviderClass =
  | "virtual-data-room"
  | "secure-object-storage"
  | "siem-log-export"
  | "governance-risk-compliance"
  | "identity-access-provider"
  | "evidence-room-platform";

export type ProtectedEvidenceRoomProviderIntegrationMode =
  | "contract-only"
  | "manual-export-review"
  | "metadata-api-planned"
  | "audit-log-forwarder-planned"
  | "evidence-room-webhook-planned";

export type ProtectedEvidenceRoomAuditLogImportFormat =
  | "csv-summary"
  | "jsonl-summary"
  | "siem-event-summary"
  | "access-review-report"
  | "api-metadata-summary";

export type ProtectedEvidenceRoomProviderRiskTier =
  | "not-assessed"
  | "low"
  | "moderate"
  | "high";

export type ProtectedEvidenceRoomProviderAdapterControl =
  | "provider-contract-reference-retained"
  | "access-log-reconciliation-linked"
  | "metadata-import-schema-defined"
  | "raw-log-import-disabled"
  | "no-recipient-identifiers-stored"
  | "no-provider-credentials-stored"
  | "no-url-or-token-storage"
  | "export-disabled";

export type ProtectedEvidenceRoomProviderAdapterContractStatus =
  | "provider-adapter-contract-metadata-recorded"
  | "access-log-reconciliation-linked"
  | "provider-adapter-contract-ready-not-integration-approval"
  | "blocked"
  | "not-recorded";

export const protectedEvidenceRoomProviderClasses: Array<{
  id: ProtectedEvidenceRoomProviderClass;
  label: string;
  requiredBoundary: string;
}> = [
  {
    id: "virtual-data-room",
    label: "Virtual data room",
    requiredBoundary: "External diligence-room provider keeps raw access logs, users, files, and grants."
  },
  {
    id: "secure-object-storage",
    label: "Secure object storage",
    requiredBoundary: "External storage provider keeps source objects, access controls, and retention policy."
  },
  {
    id: "siem-log-export",
    label: "SIEM log export",
    requiredBoundary: "External security telemetry provider keeps raw event streams and alert evidence."
  },
  {
    id: "governance-risk-compliance",
    label: "Governance risk compliance",
    requiredBoundary: "External GRC provider keeps signed approvals, issue owners, and compliance artifacts."
  },
  {
    id: "identity-access-provider",
    label: "Identity access provider",
    requiredBoundary: "External identity system keeps accounts, groups, MFA posture, and revocation events."
  },
  {
    id: "evidence-room-platform",
    label: "Evidence room platform",
    requiredBoundary: "External evidence-room platform keeps room membership, packet access, and revocations."
  }
] as const;

export const protectedEvidenceRoomProviderIntegrationModes: Array<{
  id: ProtectedEvidenceRoomProviderIntegrationMode;
  label: string;
}> = [
  { id: "contract-only", label: "Contract only" },
  { id: "manual-export-review", label: "Manual export review" },
  { id: "metadata-api-planned", label: "Metadata API planned" },
  { id: "audit-log-forwarder-planned", label: "Audit-log forwarder planned" },
  { id: "evidence-room-webhook-planned", label: "Evidence-room webhook planned" }
] as const;

export const protectedEvidenceRoomAuditLogImportFormats: Array<{
  id: ProtectedEvidenceRoomAuditLogImportFormat;
  label: string;
}> = [
  { id: "csv-summary", label: "CSV summary" },
  { id: "jsonl-summary", label: "JSONL summary" },
  { id: "siem-event-summary", label: "SIEM event summary" },
  { id: "access-review-report", label: "Access review report" },
  { id: "api-metadata-summary", label: "API metadata summary" }
] as const;

export const protectedEvidenceRoomProviderAdapterRequiredControls: ProtectedEvidenceRoomProviderAdapterControl[] = [
  "provider-contract-reference-retained",
  "access-log-reconciliation-linked",
  "metadata-import-schema-defined",
  "raw-log-import-disabled",
  "no-recipient-identifiers-stored",
  "no-provider-credentials-stored",
  "no-url-or-token-storage",
  "export-disabled"
];

export type ProtectedEvidenceRoomProviderAdapterInput = {
  accessLogReconciliationRecordIds: string[];
  distributionAudience: ProtectedDistributionAudience;
  providerClass: ProtectedEvidenceRoomProviderClass;
  integrationMode: ProtectedEvidenceRoomProviderIntegrationMode;
  externalProviderLabel: string;
  adapterContractReferenceLabel: string;
  adapterContractReferenceLocator: string;
  auditLogImportStubLabel: string;
  auditLogImportStubLocator: string;
  supportedAuditLogFormat: ProtectedEvidenceRoomAuditLogImportFormat;
  verificationCadence: string;
  providerRiskTier: ProtectedEvidenceRoomProviderRiskTier;
  externalProviderAuthorityRetained: true;
  rawLogImportDisabled: true;
  credentialStorageDisabled: true;
  exportDisabled: true;
  attestation: typeof protectedEvidenceRoomProviderAdapterAttestation;
  dataBoundary: typeof protectedEvidenceRoomProviderAdapterDataBoundary;
  reviewNote: string;
};

export type ProtectedEvidenceRoomProviderAdapterRecord = {
  id: string;
  tenantId: string;
  workspaceId: string;
  distributionAudience: ProtectedDistributionAudience;
  providerClass: ProtectedEvidenceRoomProviderClass;
  providerClassLabel: string;
  integrationMode: ProtectedEvidenceRoomProviderIntegrationMode;
  integrationModeLabel: string;
  adapterStatus: Exclude<ProtectedEvidenceRoomProviderAdapterContractStatus, "not-recorded">;
  approvalScope: typeof protectedEvidenceRoomProviderAdapterApprovalScope;
  externalProviderLabel: string;
  adapterContractReferenceLabel: string;
  adapterContractReferenceLocator: string;
  auditLogImportStubLabel: string;
  auditLogImportStubLocator: string;
  supportedAuditLogFormat: ProtectedEvidenceRoomAuditLogImportFormat;
  verificationCadence: string;
  providerRiskTier: ProtectedEvidenceRoomProviderRiskTier;
  accessLogReconciliationRecordIds: string[];
  evidenceSnapshot: Record<string, unknown>;
  requiredProviderControls: ProtectedEvidenceRoomProviderAdapterControl[];
  linkedProviderControls: ProtectedEvidenceRoomProviderAdapterControl[];
  missingProviderControls: ProtectedEvidenceRoomProviderAdapterControl[];
  retainedBlockers: string[];
  releaseRestrictions: string[];
  externalProviderAuthorityRetained: boolean;
  rawLogImportDisabled: boolean;
  credentialStorageDisabled: boolean;
  exportDisabled: boolean;
  attestation: typeof protectedEvidenceRoomProviderAdapterAttestation;
  reviewNote: string;
  dataBoundary: typeof protectedEvidenceRoomProviderAdapterDataBoundary;
  providerAdapterAuthority: typeof protectedEvidenceRoomProviderAdapterAuthority;
  releaseAuthority: typeof protectedEvidenceRoomProviderAdapterReleaseAuthority;
  storageAuthority: typeof protectedEvidenceRoomProviderAdapterStorageAuthority;
  accessLogReconciliationAuthority: typeof protectedEvidenceRoomAccessLogReconciliationAuthority;
  accessLogReleaseAuthority: typeof protectedEvidenceRoomAccessLogReleaseAuthority;
  accessLogStorageAuthority: typeof protectedEvidenceRoomAccessLogStorageAuthority;
  financialReportingAuthority: typeof protectedMetricRollupFinancialAuthority;
  securitiesAuthority: typeof protectedMetricRollupSecuritiesAuthority;
  advertisingClaimsAuthority: typeof protectedFinanceAdvertisingClaimsAuthority;
  clinicalExecutionAuthority: typeof protectedMetricRollupClinicalAuthority;
  recordedBy: string;
  recordedAt: string;
  createdAt: string;
  boundary: string;
};

export type ProtectedEvidenceRoomProviderAdapterWorkflow = {
  service: "scrimed-protected-evidence-room-provider-adapters";
  status: typeof protectedEvidenceRoomProviderAdapterStatus;
  packetStatus: typeof protectedEvidenceRoomProviderAdapterPacketProofStackStatus;
  summary: {
    adapterCount: number;
    readyForReviewCount: number;
    exportDisabledCount: number;
    rawLogImportDisabledCount: number;
    credentialStorageDisabledCount: number;
    requiredProviderControlCount: number;
    linkedProviderControlCount: number;
    missingProviderControlCount: number;
    readyAccessLogReconciliationCount: number;
    retainedBlockerCount: number;
    providerRiskReviewCount: number;
    latestAdapterAt: string | null;
  };
  adapterState:
    | "provider-adapter-contract-open"
    | "provider-adapter-contract-metadata-recorded"
    | "provider-adapter-contract-review-ready-not-integration-approval";
  integrationState: "integration-disabled" | "blocked-pending-provider-contract";
  requiredProviderControls: ProtectedEvidenceRoomProviderAdapterControl[];
  linkedProviderControls: ProtectedEvidenceRoomProviderAdapterControl[];
  missingProviderControls: ProtectedEvidenceRoomProviderAdapterControl[];
  records: ProtectedEvidenceRoomProviderAdapterRecord[];
  availableAccessLogReconciliations: ProtectedEvidenceRoomAccessLogReconciliationRecord[];
  accessLogSnapshot: {
    service: ProtectedEvidenceRoomAccessLogReconciliationWorkflow["service"] | "unavailable";
    status: typeof protectedEvidenceRoomAccessLogReconciliationStatus | "unavailable";
    reconciliationState: ProtectedEvidenceRoomAccessLogReconciliationWorkflow["reconciliationState"] | "unavailable";
    exportState: ProtectedEvidenceRoomAccessLogReconciliationWorkflow["exportState"] | "unavailable";
    readyForReviewCount: number;
    latestReconciliationAt: string | null;
  };
  providerClasses: typeof protectedEvidenceRoomProviderClasses;
  integrationModes: typeof protectedEvidenceRoomProviderIntegrationModes;
  auditLogImportFormats: typeof protectedEvidenceRoomAuditLogImportFormats;
  authorities: {
    providerAdapterAuthority: typeof protectedEvidenceRoomProviderAdapterAuthority;
    releaseAuthority: typeof protectedEvidenceRoomProviderAdapterReleaseAuthority;
    storageAuthority: typeof protectedEvidenceRoomProviderAdapterStorageAuthority;
    approvalScope: typeof protectedEvidenceRoomProviderAdapterApprovalScope;
    accessLogReconciliationAuthority: typeof protectedEvidenceRoomAccessLogReconciliationAuthority;
    accessLogReleaseAuthority: typeof protectedEvidenceRoomAccessLogReleaseAuthority;
    accessLogStorageAuthority: typeof protectedEvidenceRoomAccessLogStorageAuthority;
    financeExternalUseAuthority: typeof protectedFinanceExternalUseAuthority;
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

const protectedDistributionAudiences: ProtectedDistributionAudience[] = [
  "buyer-diligence-room",
  "investor-data-room",
  "board-room",
  "sales-collateral-channel",
  "marketing-site-release",
  "public-relations-channel",
  "customer-case-study-channel"
];

const providerRiskTiers: ProtectedEvidenceRoomProviderRiskTier[] = [
  "not-assessed",
  "low",
  "moderate",
  "high"
];

const forbiddenProviderAdapterPatterns = [
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
  /recipient[ _-]?name/i,
  /recipient[ _-]?email/i,
  /recipient[ _-]?list/i,
  /contact[ _-]?list/i,
  /patient[ _-]?(id|identifier|mrn)/i,
  /member[ _-]?(id|identifier)/i,
  /medical record/i,
  /protected health information/i,
  /payer member/i,
  /diagnosis code/i,
  /social security/i,
  /source contract/i,
  /signed[ _-]?(baa|dpa|contract|agreement|document|approval)/i,
  /legal opinion/i,
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
  /soc[ _-]?2[ _-]?certified/i,
  /autonomous diagnosis/i,
  /treatment recommendation/i,
  /live clinical execution/i,
  /public release approved/i,
  /external distribution approved/i,
  /release approved/i,
  /export approved/i,
  /integration approved/i,
  /live integration/i,
  /release enabled/i,
  /export enabled/i
];

function safeShortText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength + 1) : "";
}

function containsForbiddenContent(...values: string[]) {
  const candidate = values.join(" ");

  return forbiddenProviderAdapterPatterns.some((pattern) => pattern.test(candidate));
}

function isSafeMetadata(value: string, minLength: number, maxLength: number) {
  return (
    value.length >= minLength &&
    value.length <= maxLength &&
    safeMetadataTextPattern.test(value)
  );
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
      values.length > 14 ||
      values.length !== value.length ||
      values.some((item) => !uuidPattern.test(item))
  };
}

function getProviderClass(value: string) {
  return protectedEvidenceRoomProviderClasses.find((provider) => provider.id === value) ?? null;
}

function getIntegrationMode(value: string) {
  return protectedEvidenceRoomProviderIntegrationModes.find((mode) => mode.id === value) ?? null;
}

function getAuditLogImportFormat(value: string) {
  return protectedEvidenceRoomAuditLogImportFormats.find((format) => format.id === value) ?? null;
}

export function validateProtectedEvidenceRoomProviderAdapterInput(value: unknown):
  | { ok: true; input: ProtectedEvidenceRoomProviderAdapterInput }
  | { ok: false; errors: string[] } {
  const record = value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
  const accessLogReconciliationRecordIds = normalizeUuidArray(
    record.accessLogReconciliationRecordIds
  );
  const distributionAudience = safeShortText(record.distributionAudience, 80);
  const providerClass = safeShortText(record.providerClass, 80);
  const integrationMode = safeShortText(record.integrationMode, 80);
  const externalProviderLabel = safeShortText(record.externalProviderLabel, 140);
  const adapterContractReferenceLabel = safeShortText(
    record.adapterContractReferenceLabel,
    140
  );
  const adapterContractReferenceLocator = safeShortText(
    record.adapterContractReferenceLocator,
    140
  );
  const auditLogImportStubLabel = safeShortText(record.auditLogImportStubLabel, 140);
  const auditLogImportStubLocator = safeShortText(record.auditLogImportStubLocator, 140);
  const supportedAuditLogFormat = safeShortText(record.supportedAuditLogFormat, 80);
  const verificationCadence = safeShortText(record.verificationCadence, 120);
  const providerRiskTier = safeShortText(record.providerRiskTier, 80);
  const externalProviderAuthorityRetained = record.externalProviderAuthorityRetained === true;
  const rawLogImportDisabled = record.rawLogImportDisabled === true;
  const credentialStorageDisabled = record.credentialStorageDisabled === true;
  const exportDisabled = record.exportDisabled === true;
  const attestation = safeShortText(record.attestation, 120);
  const dataBoundary = safeShortText(record.dataBoundary, 90);
  const reviewNote = safeShortText(record.reviewNote, 280);
  const provider = getProviderClass(providerClass);
  const mode = getIntegrationMode(integrationMode);
  const format = getAuditLogImportFormat(supportedAuditLogFormat);
  const errors: string[] = [];

  if (accessLogReconciliationRecordIds.invalid) {
    errors.push("Provider adapter contracts require one to fourteen valid access-log reconciliation record ids.");
  }

  if (!protectedDistributionAudiences.includes(distributionAudience as ProtectedDistributionAudience)) {
    errors.push("Distribution audience must match an approved evidence-room audience.");
  }

  if (!provider) {
    errors.push("Provider class must be one of the approved evidence-room provider classes.");
  }

  if (!mode) {
    errors.push("Integration mode must be one of the approved disabled provider adapter modes.");
  }

  if (!format) {
    errors.push("Audit-log import format must be a supported metadata-only summary format.");
  }

  if (!providerRiskTiers.includes(providerRiskTier as ProtectedEvidenceRoomProviderRiskTier)) {
    errors.push("Provider risk tier must be not-assessed, low, moderate, or high.");
  }

  if (!isSafeMetadata(externalProviderLabel, 4, 140)) {
    errors.push("External provider label must be bounded non-sensitive metadata.");
  }

  if (!isSafeMetadata(adapterContractReferenceLabel, 4, 140)) {
    errors.push("Adapter contract reference label must be bounded no-PHI metadata.");
  }

  if (!isSafeMetadata(adapterContractReferenceLocator, 4, 140)) {
    errors.push("Adapter contract reference locator must be a bounded external locator.");
  }

  if (!isSafeMetadata(auditLogImportStubLabel, 4, 140)) {
    errors.push("Audit-log import stub label must be bounded metadata.");
  }

  if (!isSafeMetadata(auditLogImportStubLocator, 4, 140)) {
    errors.push("Audit-log import stub locator must be a bounded external locator.");
  }

  if (!isSafeMetadata(verificationCadence, 4, 120)) {
    errors.push("Verification cadence must be bounded metadata.");
  }

  if (!externalProviderAuthorityRetained) {
    errors.push("Provider adapter contracts require external provider authority to be retained outside SCRIMED.");
  }

  if (!rawLogImportDisabled) {
    errors.push("Raw evidence-room access-log import must remain disabled.");
  }

  if (!credentialStorageDisabled) {
    errors.push("Provider credentials and secrets must not be stored in SCRIMED.");
  }

  if (!exportDisabled) {
    errors.push("Current SCRIMED provider adapter mode must remain export-disabled.");
  }

  if (attestation !== protectedEvidenceRoomProviderAdapterAttestation) {
    errors.push("Provider adapter contracts require the fixed no-PHI metadata attestation.");
  }

  if (dataBoundary !== protectedEvidenceRoomProviderAdapterDataBoundary) {
    errors.push("Provider adapter contracts require the synthetic business workflow data boundary.");
  }

  if (reviewNote.length > 280) {
    errors.push("Review note must stay under 280 characters.");
  }

  if (
    containsForbiddenContent(
      ...accessLogReconciliationRecordIds.values,
      distributionAudience,
      providerClass,
      integrationMode,
      externalProviderLabel,
      adapterContractReferenceLabel,
      adapterContractReferenceLocator,
      auditLogImportStubLabel,
      auditLogImportStubLocator,
      supportedAuditLogFormat,
      verificationCadence,
      providerRiskTier,
      reviewNote
    )
  ) {
    errors.push(
      "Provider adapter metadata cannot contain PHI, credentials, secrets, URLs, tokens, raw logs, IP addresses, device identifiers, recipient names, recipient emails, recipient lists, patient identifiers, payer member data, source contracts, signed documents, legal opinions, audited financial claims, securities claims, advertising substantiation, clinical validation, reimbursement guarantees, compliance certification, public release approval, distribution approval, integration approval, enabled-export language, or live clinical execution claims."
    );
  }

  if (errors.length > 0 || !provider || !mode || !format) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    input: {
      accessLogReconciliationRecordIds: accessLogReconciliationRecordIds.values,
      distributionAudience: distributionAudience as ProtectedDistributionAudience,
      providerClass: provider.id,
      integrationMode: mode.id,
      externalProviderLabel,
      adapterContractReferenceLabel,
      adapterContractReferenceLocator,
      auditLogImportStubLabel,
      auditLogImportStubLocator,
      supportedAuditLogFormat: format.id,
      verificationCadence,
      providerRiskTier: providerRiskTier as ProtectedEvidenceRoomProviderRiskTier,
      externalProviderAuthorityRetained: true,
      rawLogImportDisabled: true,
      credentialStorageDisabled: true,
      exportDisabled: true,
      attestation: protectedEvidenceRoomProviderAdapterAttestation,
      dataBoundary: protectedEvidenceRoomProviderAdapterDataBoundary,
      reviewNote
    }
  };
}

function isReadyAccessLogRecord(record: ProtectedEvidenceRoomAccessLogReconciliationRecord) {
  return (
    record.externalLogAuthorityRetained &&
    record.exportDisabled &&
    record.reconciliationStatus === "access-log-reconciliation-complete-not-export-approval" &&
    record.missingAccessLogControls.length === 0 &&
    record.anomalyState === "none-observed"
  );
}

export function deriveProtectedEvidenceRoomProviderAdapterWorkflow({
  accessLogWorkflow,
  records,
  unavailableSections = []
}: {
  accessLogWorkflow: ProtectedEvidenceRoomAccessLogReconciliationWorkflow | null;
  records: ProtectedEvidenceRoomProviderAdapterRecord[];
  unavailableSections?: string[];
}): ProtectedEvidenceRoomProviderAdapterWorkflow {
  const availableAccessLogReconciliations = accessLogWorkflow
    ? accessLogWorkflow.records.filter(isReadyAccessLogRecord)
    : [];
  const activeRecords = records.filter(
    (record) =>
      record.externalProviderAuthorityRetained &&
      record.rawLogImportDisabled &&
      record.credentialStorageDisabled &&
      record.exportDisabled
  );
  const linkedProviderControls = protectedEvidenceRoomProviderAdapterRequiredControls.filter(
    (control) => activeRecords.some((record) => record.linkedProviderControls.includes(control))
  );
  const missingProviderControls = protectedEvidenceRoomProviderAdapterRequiredControls.filter(
    (control) => !linkedProviderControls.includes(control)
  );
  const readyRecords = activeRecords.filter(
    (record) =>
      record.adapterStatus === "provider-adapter-contract-ready-not-integration-approval" &&
      record.missingProviderControls.length === 0
  );
  const retainedBlockerCount = records.reduce(
    (total, record) => total + record.retainedBlockers.length,
    0
  );
  const providerRiskReviewCount = records.filter(
    (record) => record.providerRiskTier === "moderate" || record.providerRiskTier === "high"
  ).length;
  const latestAdapter = records[0] ?? null;
  const readyForReview = readyRecords.length > 0 && availableAccessLogReconciliations.length > 0;

  return {
    service: "scrimed-protected-evidence-room-provider-adapters",
    status: protectedEvidenceRoomProviderAdapterStatus,
    packetStatus: protectedEvidenceRoomProviderAdapterPacketProofStackStatus,
    summary: {
      adapterCount: records.length,
      readyForReviewCount: readyForReview ? readyRecords.length : 0,
      exportDisabledCount: records.filter((record) => record.exportDisabled).length,
      rawLogImportDisabledCount: records.filter((record) => record.rawLogImportDisabled).length,
      credentialStorageDisabledCount: records.filter((record) => record.credentialStorageDisabled).length,
      requiredProviderControlCount: protectedEvidenceRoomProviderAdapterRequiredControls.length,
      linkedProviderControlCount: linkedProviderControls.length,
      missingProviderControlCount: missingProviderControls.length,
      readyAccessLogReconciliationCount: availableAccessLogReconciliations.length,
      retainedBlockerCount,
      providerRiskReviewCount,
      latestAdapterAt: latestAdapter?.recordedAt ?? null
    },
    adapterState: readyForReview
      ? "provider-adapter-contract-review-ready-not-integration-approval"
      : records.length > 0
        ? "provider-adapter-contract-metadata-recorded"
        : "provider-adapter-contract-open",
    integrationState: "integration-disabled",
    requiredProviderControls: protectedEvidenceRoomProviderAdapterRequiredControls,
    linkedProviderControls,
    missingProviderControls,
    records,
    availableAccessLogReconciliations,
    accessLogSnapshot: {
      service: accessLogWorkflow?.service ?? "unavailable",
      status: accessLogWorkflow?.status ?? "unavailable",
      reconciliationState: accessLogWorkflow?.reconciliationState ?? "unavailable",
      exportState: accessLogWorkflow?.exportState ?? "unavailable",
      readyForReviewCount: accessLogWorkflow?.summary.readyForReviewCount ?? 0,
      latestReconciliationAt: accessLogWorkflow?.summary.latestReconciliationAt ?? null
    },
    providerClasses: protectedEvidenceRoomProviderClasses,
    integrationModes: protectedEvidenceRoomProviderIntegrationModes,
    auditLogImportFormats: protectedEvidenceRoomAuditLogImportFormats,
    authorities: {
      providerAdapterAuthority: protectedEvidenceRoomProviderAdapterAuthority,
      releaseAuthority: protectedEvidenceRoomProviderAdapterReleaseAuthority,
      storageAuthority: protectedEvidenceRoomProviderAdapterStorageAuthority,
      approvalScope: protectedEvidenceRoomProviderAdapterApprovalScope,
      accessLogReconciliationAuthority: protectedEvidenceRoomAccessLogReconciliationAuthority,
      accessLogReleaseAuthority: protectedEvidenceRoomAccessLogReleaseAuthority,
      accessLogStorageAuthority: protectedEvidenceRoomAccessLogStorageAuthority,
      financeExternalUseAuthority: protectedFinanceExternalUseAuthority,
      financialReportingAuthority: protectedMetricRollupFinancialAuthority,
      securitiesAuthority: protectedMetricRollupSecuritiesAuthority,
      advertisingClaimsAuthority: protectedFinanceAdvertisingClaimsAuthority,
      clinicalExecutionAuthority: protectedMetricRollupClinicalAuthority
    },
    safeWorkarounds: [
      "Keep raw access logs, user lists, recipient identifiers, provider credentials, access grants, revocation evidence, legal reviews, and signed provider artifacts in qualified external systems; SCRIMED stores adapter contract metadata only.",
      "Use provider adapter contracts as integration-readiness evidence, not authorization to connect a live provider, import raw logs, distribute evidence, advertise claims, publish proof, report audited financials, or execute clinical workflows.",
      "Keep integration disabled when provider contracting is incomplete, risk tier is unresolved, access-log reconciliation changes, provider evidence-room locator changes, customer permission expires, security review changes, or counsel review changes.",
      "Route any real provider integration through security review, privacy review, BAA/DPA review where applicable, production credential handling, observability, incident response, and customer authorization before activation."
    ],
    unavailableSections,
    boundary: `${protectedEvidenceRoomProviderAdapterBoundary} ${protectedEvidenceRoomAccessLogBoundary}`,
    updated: "2026-06-20"
  };
}

function linesForProviderAdapter(record: ProtectedEvidenceRoomProviderAdapterRecord) {
  return [
    `### ${record.providerClassLabel} - ${record.externalProviderLabel}`,
    `- Adapter status: ${record.adapterStatus}`,
    `- Distribution audience: ${record.distributionAudience}`,
    `- Integration mode: ${record.integrationModeLabel}`,
    `- Adapter contract reference: ${record.adapterContractReferenceLabel}`,
    `- Adapter contract locator: ${record.adapterContractReferenceLocator}`,
    `- Audit-log import stub: ${record.auditLogImportStubLabel}`,
    `- Audit-log import stub locator: ${record.auditLogImportStubLocator}`,
    `- Supported audit-log format: ${record.supportedAuditLogFormat}`,
    `- Verification cadence: ${record.verificationCadence}`,
    `- Provider risk tier: ${record.providerRiskTier}`,
    `- External provider authority retained: ${record.externalProviderAuthorityRetained ? "yes" : "no"}`,
    `- Raw log import disabled: ${record.rawLogImportDisabled ? "yes" : "no"}`,
    `- Credential storage disabled: ${record.credentialStorageDisabled ? "yes" : "no"}`,
    `- Export disabled: ${record.exportDisabled ? "yes" : "no"}`,
    `- Approval scope: ${record.approvalScope}`,
    `- Provider adapter authority: ${record.providerAdapterAuthority}`,
    `- Release authority: ${record.releaseAuthority}`,
    `- Storage authority: ${record.storageAuthority}`,
    `- Review note: ${record.reviewNote || "none"}`,
    `- Recorded at: ${record.recordedAt}`,
    `- Boundary: ${record.boundary}`,
    "- Access-log reconciliation record ids:",
    ...record.accessLogReconciliationRecordIds.map((id) => `  - ${id}`),
    "- Missing provider controls:",
    ...(record.missingProviderControls.length
      ? record.missingProviderControls.map((control) => `  - ${control}`)
      : ["  - none"]),
    "- Retained blockers:",
    ...record.retainedBlockers.map((blocker) => `  - ${blocker}`),
    "- Release restrictions:",
    ...record.releaseRestrictions.map((restriction) => `  - ${restriction}`)
  ];
}

export function buildProtectedEvidenceRoomProviderAdapterPacket({
  actorUserId,
  auditEventId,
  generatedAt,
  workflow,
  workspace
}: {
  actorUserId: string;
  auditEventId?: string | null;
  generatedAt: string;
  workflow: ProtectedEvidenceRoomProviderAdapterWorkflow;
  workspace: PilotWorkspaceRecord;
}) {
  return [
    "# SCRIMED Protected Evidence Room Provider Adapter Contract Packet",
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
    `Provider adapter authority: ${workflow.authorities.providerAdapterAuthority}`,
    `Release authority: ${workflow.authorities.releaseAuthority}`,
    `Storage authority: ${workflow.authorities.storageAuthority}`,
    `Approval scope: ${workflow.authorities.approvalScope}`,
    `Access-log reconciliation authority: ${workflow.authorities.accessLogReconciliationAuthority}`,
    `Access-log release authority: ${workflow.authorities.accessLogReleaseAuthority}`,
    `Finance external-use authority: ${workflow.authorities.financeExternalUseAuthority}`,
    `Financial reporting authority: ${workflow.authorities.financialReportingAuthority}`,
    `Securities authority: ${workflow.authorities.securitiesAuthority}`,
    `Advertising claims authority: ${workflow.authorities.advertisingClaimsAuthority}`,
    `Clinical execution authority: ${workflow.authorities.clinicalExecutionAuthority}`,
    "",
    "## Summary",
    `- Adapter state: ${workflow.adapterState}`,
    `- Integration state: ${workflow.integrationState}`,
    `- Provider adapters: ${workflow.summary.adapterCount}`,
    `- Ready for review: ${workflow.summary.readyForReviewCount}`,
    `- Export-disabled records: ${workflow.summary.exportDisabledCount}`,
    `- Raw-log import disabled records: ${workflow.summary.rawLogImportDisabledCount}`,
    `- Credential-storage disabled records: ${workflow.summary.credentialStorageDisabledCount}`,
    `- Required provider controls: ${workflow.summary.requiredProviderControlCount}`,
    `- Linked provider controls: ${workflow.summary.linkedProviderControlCount}`,
    `- Missing provider controls: ${workflow.summary.missingProviderControlCount}`,
    `- Ready access-log reconciliations: ${workflow.summary.readyAccessLogReconciliationCount}`,
    `- Provider risk reviews: ${workflow.summary.providerRiskReviewCount}`,
    `- Retained blockers: ${workflow.summary.retainedBlockerCount}`,
    `- Latest adapter: ${workflow.summary.latestAdapterAt ?? "not recorded"}`,
    "",
    "## Access-Log Reconciliation Snapshot",
    `- Access-log service: ${workflow.accessLogSnapshot.service}`,
    `- Access-log status: ${workflow.accessLogSnapshot.status}`,
    `- Reconciliation state: ${workflow.accessLogSnapshot.reconciliationState}`,
    `- Access-log export state: ${workflow.accessLogSnapshot.exportState}`,
    `- Ready access-log reconciliations: ${workflow.accessLogSnapshot.readyForReviewCount}`,
    `- Latest reconciliation: ${workflow.accessLogSnapshot.latestReconciliationAt ?? "not recorded"}`,
    "",
    "## Provider Classes",
    ...workflow.providerClasses.map(
      (provider) => `- ${provider.id}: ${provider.label} - ${provider.requiredBoundary}`
    ),
    "",
    "## Integration Modes",
    ...workflow.integrationModes.map((mode) => `- ${mode.id}: ${mode.label}`),
    "",
    "## Missing Provider Controls",
    ...(workflow.missingProviderControls.length
      ? workflow.missingProviderControls.map((control) => `- ${control}`)
      : ["- None recorded."]),
    "",
    "## Provider Adapter Records",
    ...(workflow.records.length
      ? workflow.records.flatMap(linesForProviderAdapter)
      : ["- No protected evidence-room provider adapter metadata recorded."]),
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
    "- Evidence-room provider integrations remain disabled by design in the current SCRIMED pilot boundary.",
    "- Provider adapter metadata is not public release approval, external distribution approval, legal approval, audited financial reporting, advertising substantiation, customer permission, compliance certification, production authorization, clinical validation, reimbursement assurance, live integration approval, or live clinical execution authority.",
    "- Raw access logs, provider credentials, URLs, tokens, recipient identifiers, access grants, revocation records, signed approvals, legal opinions, customer permissions, and distribution artifacts must be retained externally and independently reviewed before any integration or release decision.",
    "",
    `Updated: ${workflow.updated}`
  ].join("\n");
}
