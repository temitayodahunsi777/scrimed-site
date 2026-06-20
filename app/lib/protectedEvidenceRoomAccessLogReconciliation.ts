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
import {
  protectedEvidenceRoomRecipientAttestationAuthority,
  protectedEvidenceRoomRecipientAttestationDataBoundary,
  protectedEvidenceRoomRecipientBoundary,
  protectedEvidenceRoomRecipientReleaseAuthority,
  protectedEvidenceRoomRecipientStorageAuthority,
  protectedEvidenceRoomRecipientAttestationStatus,
  type ProtectedEvidenceRoomRecipientAttestationRecord,
  type ProtectedEvidenceRoomRecipientAttestationWorkflow
} from "./protectedEvidenceRoomRecipientAttestations";
import type { ProtectedDistributionAudience } from "./protectedDistributionLockbox";

export const protectedEvidenceRoomAccessLogReconciliationStatus =
  "aal2-evidence-room-access-log-reconciliation-disabled-no-phi";
export const protectedEvidenceRoomAccessLogReconciliationPacketProofStackStatus =
  "aal2-audited-evidence-room-access-log-reconciliation-packets-no-phi";
export const protectedEvidenceRoomAccessLogReconciliation =
  "evidence-room-access-log-reconciliation-metadata-no-phi";
export const protectedEvidenceRoomAccessLogReconciliationDataBoundary =
  protectedEvidenceRoomRecipientAttestationDataBoundary;
export const protectedEvidenceRoomAccessLogReconciliationAuthority =
  "access-log-reconciliation-metadata-not-export-approval";
export const protectedEvidenceRoomAccessLogReleaseAuthority =
  "export-disabled-pending-external-access-log-reconciliation";
export const protectedEvidenceRoomAccessLogStorageAuthority =
  "access-log-metadata-only-no-recipient-identifiers-or-sensitive-artifacts";
export const protectedEvidenceRoomAccessLogApprovalScope =
  "evidence-room-access-log-reconciliation-review-readiness-only";
export const protectedEvidenceRoomAccessLogBoundary =
  "Protected Evidence Room Access Log Reconciliation records disabled-by-default no-PHI metadata for externally retained evidence-room access-log references, reconciliation windows, event-count summaries, anomaly posture, and revocation review. It does not store PHI, patient identifiers, payer member data, live clinical records, source documents, source contracts, secrets, credentials, URLs, access tokens, access logs, raw log rows, IP addresses, device identifiers, recipient names, recipient email addresses, exact recipient lists, signed approvals, signed BAAs/DPAs, legal opinions, audited financial statements, securities offering material, investment advice, accounting advice, tax advice, valuation assurance, revenue guarantee, reimbursement assurance, advertising claim substantiation, clinical validation, compliance certification, customer permission artifacts, public release approval, external distribution approval, production authorization, or live clinical execution approval.";

export type ProtectedEvidenceRoomAccessLogReconciliationScope =
  | "pre-release-access-log-review"
  | "post-recipient-window-review"
  | "revocation-exercise-review"
  | "anomaly-escalation-review"
  | "buyer-diligence-room-review"
  | "investor-diligence-room-review";

export type ProtectedEvidenceRoomAccessLogAnomalyState =
  | "none-observed"
  | "needs-review"
  | "revocation-triggered"
  | "log-unavailable";

export type ProtectedEvidenceRoomAccessLogRevocationExerciseState =
  | "not-issued"
  | "not-required"
  | "ready"
  | "exercised";

export type ProtectedEvidenceRoomAccessLogControl =
  | "external-log-reference-retained"
  | "recipient-attestation-linked"
  | "access-window-reconciled"
  | "revocation-events-reviewed"
  | "no-recipient-identifiers-stored"
  | "anomaly-escalation-defined"
  | "export-disabled";

export const protectedEvidenceRoomAccessLogReconciliationScopes: Array<{
  id: ProtectedEvidenceRoomAccessLogReconciliationScope;
  label: string;
  requiredScope: string;
}> = [
  {
    id: "pre-release-access-log-review",
    label: "Pre-release access-log review",
    requiredScope: "Review intended evidence-room access before any external export or release."
  },
  {
    id: "post-recipient-window-review",
    label: "Post-recipient window review",
    requiredScope: "Review externally retained access-log coverage after a recipient window closes."
  },
  {
    id: "revocation-exercise-review",
    label: "Revocation exercise review",
    requiredScope: "Record metadata that a revocation path is ready or has been exercised externally."
  },
  {
    id: "anomaly-escalation-review",
    label: "Anomaly escalation review",
    requiredScope: "Record metadata-only escalation posture when external access logs need review."
  },
  {
    id: "buyer-diligence-room-review",
    label: "Buyer diligence room review",
    requiredScope: "Reconcile buyer diligence room access using external log references only."
  },
  {
    id: "investor-diligence-room-review",
    label: "Investor diligence room review",
    requiredScope: "Reconcile investor diligence room access without storing investor identifiers."
  }
] as const;

export const protectedEvidenceRoomAccessLogRequiredControls: ProtectedEvidenceRoomAccessLogControl[] = [
  "external-log-reference-retained",
  "recipient-attestation-linked",
  "access-window-reconciled",
  "revocation-events-reviewed",
  "no-recipient-identifiers-stored",
  "anomaly-escalation-defined",
  "export-disabled"
];

export type ProtectedEvidenceRoomAccessLogReconciliationStatus =
  | "access-log-reconciliation-metadata-recorded"
  | "recipient-attestation-linked"
  | "access-log-reconciliation-complete-not-export-approval"
  | "blocked"
  | "not-recorded";

export type ProtectedEvidenceRoomAccessLogReconciliationInput = {
  recipientAttestationRecordIds: string[];
  distributionAudience: ProtectedDistributionAudience;
  reconciliationScope: ProtectedEvidenceRoomAccessLogReconciliationScope;
  externalLogSystemLabel: string;
  accessLogReferenceLabel: string;
  accessLogReferenceLocator: string;
  reconciliationWindowStart: string;
  reconciliationWindowEnd: string;
  observedAccessEventCount: number;
  expectedRecipientSegmentCount: number;
  anomalyState: ProtectedEvidenceRoomAccessLogAnomalyState;
  revocationExerciseState: ProtectedEvidenceRoomAccessLogRevocationExerciseState;
  anomalyEscalationPath: string;
  externalLogAuthorityRetained: true;
  exportDisabled: true;
  attestation: typeof protectedEvidenceRoomAccessLogReconciliation;
  dataBoundary: typeof protectedEvidenceRoomAccessLogReconciliationDataBoundary;
  reviewNote: string;
};

export type ProtectedEvidenceRoomAccessLogReconciliationRecord = {
  id: string;
  tenantId: string;
  workspaceId: string;
  distributionAudience: ProtectedDistributionAudience;
  reconciliationScope: ProtectedEvidenceRoomAccessLogReconciliationScope;
  reconciliationScopeLabel: string;
  reconciliationStatus: Exclude<ProtectedEvidenceRoomAccessLogReconciliationStatus, "not-recorded">;
  approvalScope: typeof protectedEvidenceRoomAccessLogApprovalScope;
  externalLogSystemLabel: string;
  accessLogReferenceLabel: string;
  accessLogReferenceLocator: string;
  reconciliationWindowStart: string;
  reconciliationWindowEnd: string;
  observedAccessEventCount: number;
  expectedRecipientSegmentCount: number;
  anomalyState: ProtectedEvidenceRoomAccessLogAnomalyState;
  revocationExerciseState: ProtectedEvidenceRoomAccessLogRevocationExerciseState;
  anomalyEscalationPath: string;
  recipientAttestationRecordIds: string[];
  evidenceSnapshot: Record<string, unknown>;
  requiredAccessLogControls: ProtectedEvidenceRoomAccessLogControl[];
  linkedAccessLogControls: ProtectedEvidenceRoomAccessLogControl[];
  missingAccessLogControls: ProtectedEvidenceRoomAccessLogControl[];
  retainedBlockers: string[];
  releaseRestrictions: string[];
  externalLogAuthorityRetained: boolean;
  exportDisabled: boolean;
  attestation: typeof protectedEvidenceRoomAccessLogReconciliation;
  reviewNote: string;
  dataBoundary: typeof protectedEvidenceRoomAccessLogReconciliationDataBoundary;
  accessLogReconciliationAuthority: typeof protectedEvidenceRoomAccessLogReconciliationAuthority;
  releaseAuthority: typeof protectedEvidenceRoomAccessLogReleaseAuthority;
  storageAuthority: typeof protectedEvidenceRoomAccessLogStorageAuthority;
  recipientAttestationAuthority: typeof protectedEvidenceRoomRecipientAttestationAuthority;
  recipientReleaseAuthority: typeof protectedEvidenceRoomRecipientReleaseAuthority;
  recipientStorageAuthority: typeof protectedEvidenceRoomRecipientStorageAuthority;
  financialReportingAuthority: typeof protectedMetricRollupFinancialAuthority;
  securitiesAuthority: typeof protectedMetricRollupSecuritiesAuthority;
  advertisingClaimsAuthority: typeof protectedFinanceAdvertisingClaimsAuthority;
  clinicalExecutionAuthority: typeof protectedMetricRollupClinicalAuthority;
  recordedBy: string;
  recordedAt: string;
  createdAt: string;
  boundary: string;
};

export type ProtectedEvidenceRoomAccessLogReconciliationWorkflow = {
  service: "scrimed-protected-evidence-room-access-log-reconciliation";
  status: typeof protectedEvidenceRoomAccessLogReconciliationStatus;
  packetStatus: typeof protectedEvidenceRoomAccessLogReconciliationPacketProofStackStatus;
  summary: {
    reconciliationCount: number;
    readyForReviewCount: number;
    exportDisabledCount: number;
    requiredAccessLogControlCount: number;
    linkedAccessLogControlCount: number;
    missingAccessLogControlCount: number;
    readyRecipientAttestationCount: number;
    retainedBlockerCount: number;
    anomalyNeedsReviewCount: number;
    latestReconciliationAt: string | null;
  };
  reconciliationState:
    | "access-log-reconciliation-open"
    | "access-log-reconciliation-metadata-recorded"
    | "access-log-reconciliation-review-ready-not-export-approval";
  exportState: "export-disabled" | "blocked-pending-access-log-reconciliation";
  requiredAccessLogControls: ProtectedEvidenceRoomAccessLogControl[];
  linkedAccessLogControls: ProtectedEvidenceRoomAccessLogControl[];
  missingAccessLogControls: ProtectedEvidenceRoomAccessLogControl[];
  records: ProtectedEvidenceRoomAccessLogReconciliationRecord[];
  availableRecipientAttestations: ProtectedEvidenceRoomRecipientAttestationRecord[];
  recipientSnapshot: {
    service: ProtectedEvidenceRoomRecipientAttestationWorkflow["service"] | "unavailable";
    status: typeof protectedEvidenceRoomRecipientAttestationStatus | "unavailable";
    recipientState: ProtectedEvidenceRoomRecipientAttestationWorkflow["recipientState"] | "unavailable";
    exportState: ProtectedEvidenceRoomRecipientAttestationWorkflow["exportState"] | "unavailable";
    readyForReviewCount: number;
    latestAttestationAt: string | null;
  };
  reconciliationScopes: typeof protectedEvidenceRoomAccessLogReconciliationScopes;
  authorities: {
    accessLogReconciliationAuthority: typeof protectedEvidenceRoomAccessLogReconciliationAuthority;
    releaseAuthority: typeof protectedEvidenceRoomAccessLogReleaseAuthority;
    storageAuthority: typeof protectedEvidenceRoomAccessLogStorageAuthority;
    approvalScope: typeof protectedEvidenceRoomAccessLogApprovalScope;
    recipientAttestationAuthority: typeof protectedEvidenceRoomRecipientAttestationAuthority;
    recipientReleaseAuthority: typeof protectedEvidenceRoomRecipientReleaseAuthority;
    recipientStorageAuthority: typeof protectedEvidenceRoomRecipientStorageAuthority;
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

const anomalyStates: ProtectedEvidenceRoomAccessLogAnomalyState[] = [
  "none-observed",
  "needs-review",
  "revocation-triggered",
  "log-unavailable"
];

const revocationExerciseStates: ProtectedEvidenceRoomAccessLogRevocationExerciseState[] = [
  "not-issued",
  "not-required",
  "ready",
  "exercised"
];

const forbiddenAccessLogPatterns = [
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
  /release enabled/i,
  /export enabled/i
];

function safeShortText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength + 1) : "";
}

function containsForbiddenContent(...values: string[]) {
  const candidate = values.join(" ");

  return forbiddenAccessLogPatterns.some((pattern) => pattern.test(candidate));
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

function normalizeIsoDate(value: string) {
  const time = new Date(value).getTime();

  return Number.isFinite(time) ? new Date(time).toISOString() : null;
}

function normalizeInteger(value: unknown, min: number, max: number) {
  return typeof value === "number" && Number.isInteger(value) && value >= min && value <= max
    ? value
    : null;
}

function getReconciliationScope(value: string) {
  return (
    protectedEvidenceRoomAccessLogReconciliationScopes.find((scope) => scope.id === value) ?? null
  );
}

export function validateProtectedEvidenceRoomAccessLogReconciliationInput(value: unknown):
  | { ok: true; input: ProtectedEvidenceRoomAccessLogReconciliationInput }
  | { ok: false; errors: string[] } {
  const record = value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
  const recipientAttestationRecordIds = normalizeUuidArray(record.recipientAttestationRecordIds);
  const distributionAudience = safeShortText(record.distributionAudience, 80);
  const reconciliationScope = safeShortText(record.reconciliationScope, 80);
  const externalLogSystemLabel = safeShortText(record.externalLogSystemLabel, 140);
  const accessLogReferenceLabel = safeShortText(record.accessLogReferenceLabel, 140);
  const accessLogReferenceLocator = safeShortText(record.accessLogReferenceLocator, 140);
  const reconciliationWindowStart = normalizeIsoDate(
    safeShortText(record.reconciliationWindowStart, 80)
  );
  const reconciliationWindowEnd = normalizeIsoDate(
    safeShortText(record.reconciliationWindowEnd, 80)
  );
  const observedAccessEventCount = normalizeInteger(record.observedAccessEventCount, 0, 1000000);
  const expectedRecipientSegmentCount = normalizeInteger(
    record.expectedRecipientSegmentCount,
    1,
    1000
  );
  const anomalyState = safeShortText(record.anomalyState, 80);
  const revocationExerciseState = safeShortText(record.revocationExerciseState, 80);
  const anomalyEscalationPath = safeShortText(record.anomalyEscalationPath, 180);
  const externalLogAuthorityRetained = record.externalLogAuthorityRetained === true;
  const exportDisabled = record.exportDisabled === true;
  const attestation = safeShortText(record.attestation, 100);
  const dataBoundary = safeShortText(record.dataBoundary, 90);
  const reviewNote = safeShortText(record.reviewNote, 280);
  const scope = getReconciliationScope(reconciliationScope);
  const errors: string[] = [];

  if (recipientAttestationRecordIds.invalid) {
    errors.push("Access-log reconciliation requires one to fourteen valid recipient attestation record ids.");
  }

  if (!protectedDistributionAudiences.includes(distributionAudience as ProtectedDistributionAudience)) {
    errors.push("Distribution audience must match an approved recipient attestation audience.");
  }

  if (!scope) {
    errors.push("Reconciliation scope must be one of the approved evidence-room access-log scopes.");
  }

  if (!isSafeMetadata(externalLogSystemLabel, 4, 140)) {
    errors.push("External log system label must be bounded non-sensitive metadata.");
  }

  if (!isSafeMetadata(accessLogReferenceLabel, 4, 140)) {
    errors.push("Access-log reference label must be bounded no-PHI metadata.");
  }

  if (!isSafeMetadata(accessLogReferenceLocator, 4, 140)) {
    errors.push("Access-log reference locator must be a bounded external locator.");
  }

  if (!reconciliationWindowStart || !reconciliationWindowEnd) {
    errors.push("Reconciliation window start and end must be valid dates or timestamps.");
  } else {
    const startTime = new Date(reconciliationWindowStart).getTime();
    const endTime = new Date(reconciliationWindowEnd).getTime();
    const now = Date.now();
    const earliest = now - 365 * 24 * 60 * 60 * 1000;
    const latest = now + 24 * 60 * 60 * 1000;

    if (startTime < earliest || endTime <= startTime || endTime > latest) {
      errors.push("Reconciliation window must be within the past year and end no later than tomorrow.");
    }
  }

  if (observedAccessEventCount === null) {
    errors.push("Observed access event count must be an integer between zero and one million.");
  }

  if (expectedRecipientSegmentCount === null) {
    errors.push("Expected recipient segment count must be an integer between one and one thousand.");
  }

  if (!anomalyStates.includes(anomalyState as ProtectedEvidenceRoomAccessLogAnomalyState)) {
    errors.push("Anomaly state must be none-observed, needs-review, revocation-triggered, or log-unavailable.");
  }

  if (
    !revocationExerciseStates.includes(
      revocationExerciseState as ProtectedEvidenceRoomAccessLogRevocationExerciseState
    )
  ) {
    errors.push("Revocation exercise state must be not-issued, not-required, ready, or exercised.");
  }

  if (!isSafeMetadata(anomalyEscalationPath, 8, 180)) {
    errors.push("Anomaly escalation path must describe a bounded review or revocation path.");
  }

  if (!externalLogAuthorityRetained) {
    errors.push("Access-log reconciliation requires external log authority to be retained outside SCRIMED.");
  }

  if (!exportDisabled) {
    errors.push("Current SCRIMED access-log reconciliation mode must remain export-disabled.");
  }

  if (attestation !== protectedEvidenceRoomAccessLogReconciliation) {
    errors.push("Access-log reconciliation requires the fixed no-PHI metadata attestation.");
  }

  if (dataBoundary !== protectedEvidenceRoomAccessLogReconciliationDataBoundary) {
    errors.push("Access-log reconciliation requires the synthetic business workflow data boundary.");
  }

  if (reviewNote.length > 280) {
    errors.push("Review note must stay under 280 characters.");
  }

  if (
    containsForbiddenContent(
      ...recipientAttestationRecordIds.values,
      distributionAudience,
      reconciliationScope,
      externalLogSystemLabel,
      accessLogReferenceLabel,
      accessLogReferenceLocator,
      anomalyState,
      revocationExerciseState,
      anomalyEscalationPath,
      reviewNote
    )
  ) {
    errors.push(
      "Access-log reconciliation metadata cannot contain PHI, credentials, secrets, URLs, raw logs, IP addresses, device identifiers, recipient names, recipient emails, recipient lists, patient identifiers, payer member data, source contracts, signed documents, legal opinions, audited financial claims, securities claims, advertising substantiation, clinical validation, reimbursement guarantees, compliance certification, public release approval, distribution approval, enabled-export language, or live clinical execution claims."
    );
  }

  if (
    errors.length > 0 ||
    !reconciliationWindowStart ||
    !reconciliationWindowEnd ||
    !scope ||
    observedAccessEventCount === null ||
    expectedRecipientSegmentCount === null
  ) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    input: {
      recipientAttestationRecordIds: recipientAttestationRecordIds.values,
      distributionAudience: distributionAudience as ProtectedDistributionAudience,
      reconciliationScope: scope.id,
      externalLogSystemLabel,
      accessLogReferenceLabel,
      accessLogReferenceLocator,
      reconciliationWindowStart,
      reconciliationWindowEnd,
      observedAccessEventCount,
      expectedRecipientSegmentCount,
      anomalyState: anomalyState as ProtectedEvidenceRoomAccessLogAnomalyState,
      revocationExerciseState:
        revocationExerciseState as ProtectedEvidenceRoomAccessLogRevocationExerciseState,
      anomalyEscalationPath,
      externalLogAuthorityRetained: true,
      exportDisabled: true,
      attestation: protectedEvidenceRoomAccessLogReconciliation,
      dataBoundary: protectedEvidenceRoomAccessLogReconciliationDataBoundary,
      reviewNote
    }
  };
}

export function deriveProtectedEvidenceRoomAccessLogReconciliationWorkflow({
  records,
  recipientWorkflow,
  unavailableSections = []
}: {
  records: ProtectedEvidenceRoomAccessLogReconciliationRecord[];
  recipientWorkflow: ProtectedEvidenceRoomRecipientAttestationWorkflow | null;
  unavailableSections?: string[];
}): ProtectedEvidenceRoomAccessLogReconciliationWorkflow {
  const availableRecipientAttestations = recipientWorkflow
    ? recipientWorkflow.records.filter(
        (record) =>
          record.externalRecipientAuthorityRetained &&
          record.exportDisabled &&
          record.attestationStatus === "recipient-metadata-complete-not-export-approval" &&
          record.missingRecipientControls.length === 0
      )
    : [];
  const activeRecords = records.filter(
    (record) => record.externalLogAuthorityRetained && record.exportDisabled
  );
  const linkedAccessLogControls = protectedEvidenceRoomAccessLogRequiredControls.filter((control) =>
    activeRecords.some((record) => record.linkedAccessLogControls.includes(control))
  );
  const missingAccessLogControls = protectedEvidenceRoomAccessLogRequiredControls.filter(
    (control) => !linkedAccessLogControls.includes(control)
  );
  const readyRecords = activeRecords.filter(
    (record) =>
      record.reconciliationStatus === "access-log-reconciliation-complete-not-export-approval" &&
      record.missingAccessLogControls.length === 0
  );
  const retainedBlockerCount = records.reduce(
    (total, record) => total + record.retainedBlockers.length,
    0
  );
  const anomalyNeedsReviewCount = records.filter(
    (record) => record.anomalyState === "needs-review" || record.anomalyState === "revocation-triggered"
  ).length;
  const latestReconciliation = records[0] ?? null;
  const readyForReview = readyRecords.length > 0 && availableRecipientAttestations.length > 0;

  return {
    service: "scrimed-protected-evidence-room-access-log-reconciliation",
    status: protectedEvidenceRoomAccessLogReconciliationStatus,
    packetStatus: protectedEvidenceRoomAccessLogReconciliationPacketProofStackStatus,
    summary: {
      reconciliationCount: records.length,
      readyForReviewCount: readyForReview ? readyRecords.length : 0,
      exportDisabledCount: records.filter((record) => record.exportDisabled).length,
      requiredAccessLogControlCount: protectedEvidenceRoomAccessLogRequiredControls.length,
      linkedAccessLogControlCount: linkedAccessLogControls.length,
      missingAccessLogControlCount: missingAccessLogControls.length,
      readyRecipientAttestationCount: availableRecipientAttestations.length,
      retainedBlockerCount,
      anomalyNeedsReviewCount,
      latestReconciliationAt: latestReconciliation?.recordedAt ?? null
    },
    reconciliationState: readyForReview
      ? "access-log-reconciliation-review-ready-not-export-approval"
      : records.length > 0
        ? "access-log-reconciliation-metadata-recorded"
        : "access-log-reconciliation-open",
    exportState: "export-disabled",
    requiredAccessLogControls: protectedEvidenceRoomAccessLogRequiredControls,
    linkedAccessLogControls,
    missingAccessLogControls,
    records,
    availableRecipientAttestations,
    recipientSnapshot: {
      service: recipientWorkflow?.service ?? "unavailable",
      status: recipientWorkflow?.status ?? "unavailable",
      recipientState: recipientWorkflow?.recipientState ?? "unavailable",
      exportState: recipientWorkflow?.exportState ?? "unavailable",
      readyForReviewCount: recipientWorkflow?.summary.readyForReviewCount ?? 0,
      latestAttestationAt: recipientWorkflow?.summary.latestAttestationAt ?? null
    },
    reconciliationScopes: protectedEvidenceRoomAccessLogReconciliationScopes,
    authorities: {
      accessLogReconciliationAuthority: protectedEvidenceRoomAccessLogReconciliationAuthority,
      releaseAuthority: protectedEvidenceRoomAccessLogReleaseAuthority,
      storageAuthority: protectedEvidenceRoomAccessLogStorageAuthority,
      approvalScope: protectedEvidenceRoomAccessLogApprovalScope,
      recipientAttestationAuthority: protectedEvidenceRoomRecipientAttestationAuthority,
      recipientReleaseAuthority: protectedEvidenceRoomRecipientReleaseAuthority,
      recipientStorageAuthority: protectedEvidenceRoomRecipientStorageAuthority,
      financeExternalUseAuthority: protectedFinanceExternalUseAuthority,
      financialReportingAuthority: protectedMetricRollupFinancialAuthority,
      securitiesAuthority: protectedMetricRollupSecuritiesAuthority,
      advertisingClaimsAuthority: protectedFinanceAdvertisingClaimsAuthority,
      clinicalExecutionAuthority: protectedMetricRollupClinicalAuthority
    },
    safeWorkarounds: [
      "Retain raw evidence-room access logs, recipient identifiers, IP addresses, device metadata, access grants, access revocations, legal reviews, and permission artifacts in qualified external evidence-room systems; SCRIMED stores no-PHI reconciliation metadata references only.",
      "Use access-log reconciliation as internal release-readiness evidence, not authorization to distribute, advertise, publish, report financials, share customer proof, or execute clinical workflows.",
      "Keep export disabled when external logs are unavailable, anomaly review is unresolved, revocation evidence is missing, access windows change, recipient scope changes, customer permission expires, counsel review changes, or external evidence-room controls cannot be independently verified.",
      "Re-run recipient attestations, release authority, distribution lockbox, named reviewer sign-off, and release decision workflows when recipient scope, access windows, packet content, evidence-room locator, anomaly posture, or revocation posture changes."
    ],
    unavailableSections,
    boundary: `${protectedEvidenceRoomAccessLogBoundary} ${protectedEvidenceRoomRecipientBoundary}`,
    updated: "2026-06-20"
  };
}

function linesForAccessLogReconciliation(
  record: ProtectedEvidenceRoomAccessLogReconciliationRecord
) {
  return [
    `### ${record.reconciliationScopeLabel} - ${record.accessLogReferenceLabel}`,
    `- Reconciliation status: ${record.reconciliationStatus}`,
    `- Distribution audience: ${record.distributionAudience}`,
    `- External log system label: ${record.externalLogSystemLabel}`,
    `- Access-log reference locator: ${record.accessLogReferenceLocator}`,
    `- Reconciliation window: ${record.reconciliationWindowStart} to ${record.reconciliationWindowEnd}`,
    `- Observed access event count: ${record.observedAccessEventCount}`,
    `- Expected recipient segment count: ${record.expectedRecipientSegmentCount}`,
    `- Anomaly state: ${record.anomalyState}`,
    `- Revocation exercise state: ${record.revocationExerciseState}`,
    `- Anomaly escalation path: ${record.anomalyEscalationPath}`,
    `- External log authority retained: ${record.externalLogAuthorityRetained ? "yes" : "no"}`,
    `- Export disabled: ${record.exportDisabled ? "yes" : "no"}`,
    `- Approval scope: ${record.approvalScope}`,
    `- Access-log reconciliation authority: ${record.accessLogReconciliationAuthority}`,
    `- Release authority: ${record.releaseAuthority}`,
    `- Storage authority: ${record.storageAuthority}`,
    `- Review note: ${record.reviewNote || "none"}`,
    `- Recorded at: ${record.recordedAt}`,
    `- Boundary: ${record.boundary}`,
    "- Recipient attestation record ids:",
    ...record.recipientAttestationRecordIds.map((id) => `  - ${id}`),
    "- Missing access-log controls:",
    ...(record.missingAccessLogControls.length
      ? record.missingAccessLogControls.map((control) => `  - ${control}`)
      : ["  - none"]),
    "- Retained blockers:",
    ...record.retainedBlockers.map((blocker) => `  - ${blocker}`),
    "- Release restrictions:",
    ...record.releaseRestrictions.map((restriction) => `  - ${restriction}`)
  ];
}

export function buildProtectedEvidenceRoomAccessLogReconciliationPacket({
  actorUserId,
  auditEventId,
  generatedAt,
  workflow,
  workspace
}: {
  actorUserId: string;
  auditEventId?: string | null;
  generatedAt: string;
  workflow: ProtectedEvidenceRoomAccessLogReconciliationWorkflow;
  workspace: PilotWorkspaceRecord;
}) {
  return [
    "# SCRIMED Protected Evidence Room Access Log Reconciliation Packet",
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
    `Access-log reconciliation authority: ${workflow.authorities.accessLogReconciliationAuthority}`,
    `Release authority: ${workflow.authorities.releaseAuthority}`,
    `Storage authority: ${workflow.authorities.storageAuthority}`,
    `Approval scope: ${workflow.authorities.approvalScope}`,
    `Recipient attestation authority: ${workflow.authorities.recipientAttestationAuthority}`,
    `Recipient release authority: ${workflow.authorities.recipientReleaseAuthority}`,
    `Finance external-use authority: ${workflow.authorities.financeExternalUseAuthority}`,
    `Financial reporting authority: ${workflow.authorities.financialReportingAuthority}`,
    `Securities authority: ${workflow.authorities.securitiesAuthority}`,
    `Advertising claims authority: ${workflow.authorities.advertisingClaimsAuthority}`,
    `Clinical execution authority: ${workflow.authorities.clinicalExecutionAuthority}`,
    "",
    "## Summary",
    `- Reconciliation state: ${workflow.reconciliationState}`,
    `- Export state: ${workflow.exportState}`,
    `- Reconciliations: ${workflow.summary.reconciliationCount}`,
    `- Ready for review: ${workflow.summary.readyForReviewCount}`,
    `- Export-disabled records: ${workflow.summary.exportDisabledCount}`,
    `- Required access-log controls: ${workflow.summary.requiredAccessLogControlCount}`,
    `- Linked access-log controls: ${workflow.summary.linkedAccessLogControlCount}`,
    `- Missing access-log controls: ${workflow.summary.missingAccessLogControlCount}`,
    `- Ready recipient attestations: ${workflow.summary.readyRecipientAttestationCount}`,
    `- Anomaly records needing review: ${workflow.summary.anomalyNeedsReviewCount}`,
    `- Retained blockers: ${workflow.summary.retainedBlockerCount}`,
    `- Latest reconciliation: ${workflow.summary.latestReconciliationAt ?? "not recorded"}`,
    "",
    "## Recipient Attestation Snapshot",
    `- Recipient service: ${workflow.recipientSnapshot.service}`,
    `- Recipient status: ${workflow.recipientSnapshot.status}`,
    `- Recipient state: ${workflow.recipientSnapshot.recipientState}`,
    `- Recipient export state: ${workflow.recipientSnapshot.exportState}`,
    `- Ready recipient attestations: ${workflow.recipientSnapshot.readyForReviewCount}`,
    `- Latest recipient attestation: ${workflow.recipientSnapshot.latestAttestationAt ?? "not recorded"}`,
    "",
    "## Reconciliation Scopes",
    ...workflow.reconciliationScopes.map(
      (scope) => `- ${scope.id}: ${scope.label} - ${scope.requiredScope}`
    ),
    "",
    "## Missing Access-Log Controls",
    ...(workflow.missingAccessLogControls.length
      ? workflow.missingAccessLogControls.map((control) => `- ${control}`)
      : ["- None recorded."]),
    "",
    "## Access Log Reconciliation Records",
    ...(workflow.records.length
      ? workflow.records.flatMap(linesForAccessLogReconciliation)
      : ["- No protected evidence-room access-log reconciliation metadata recorded."]),
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
    "- Evidence-room export remains disabled by design in the current SCRIMED pilot boundary.",
    "- Access-log reconciliation metadata is not public release approval, external distribution approval, legal approval, audited financial reporting, advertising substantiation, customer permission, compliance certification, production authorization, clinical validation, reimbursement assurance, or live clinical execution authority.",
    "- Raw access logs, recipient identifiers, IP addresses, device identifiers, access grants, revocation records, signed approvals, legal opinions, customer permissions, and distribution artifacts must be retained externally and independently reviewed before any release decision.",
    "",
    `Updated: ${workflow.updated}`
  ].join("\n");
}
