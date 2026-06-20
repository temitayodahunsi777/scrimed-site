import {
  protectedDistributionLockboxAuthority,
  protectedDistributionLockboxBoundary,
  protectedDistributionLockboxDataBoundary,
  protectedDistributionLockboxReleaseAuthority,
  protectedDistributionLockboxStorageAuthority,
  type ProtectedDistributionAudience
} from "./protectedDistributionLockbox";
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
  protectedReleaseAuthorityAttestationAuthority,
  protectedReleaseAuthorityAttestationBoundary,
  protectedReleaseAuthorityAttestationStorageAuthority,
  protectedReleaseAuthorityAttestationStatus,
  protectedReleaseAuthorityReleaseAuthority,
  type ProtectedReleaseAuthorityAttestationRecord,
  type ProtectedReleaseAuthorityAttestationWorkflow
} from "./protectedReleaseAuthorityAttestations";
import { protectedReleaseDecisionAuthority } from "./protectedReleaseDecisionWorkflow";

export const protectedEvidenceRoomRecipientAttestationStatus =
  "aal2-evidence-room-recipient-attestations-disabled-no-phi";
export const protectedEvidenceRoomRecipientAttestationPacketProofStackStatus =
  "aal2-audited-evidence-room-recipient-attestation-packets-no-phi";
export const protectedEvidenceRoomRecipientAttestation =
  "evidence-room-recipient-attestation-metadata-no-phi";
export const protectedEvidenceRoomRecipientAttestationDataBoundary =
  protectedDistributionLockboxDataBoundary;
export const protectedEvidenceRoomRecipientAttestationAuthority =
  "recipient-attestation-metadata-not-release-approval";
export const protectedEvidenceRoomRecipientReleaseAuthority =
  "release-disabled-pending-external-recipient-authority";
export const protectedEvidenceRoomRecipientStorageAuthority =
  "recipient-metadata-only-no-recipient-lists-or-sensitive-artifacts";
export const protectedEvidenceRoomRecipientApprovalScope =
  "evidence-room-recipient-attestation-review-readiness-only";
export const protectedEvidenceRoomRecipientBoundary =
  "Protected Evidence Room Recipient Attestations record disabled-by-default no-PHI metadata for intended evidence-room recipient scope, access windows, packet references, and revocation posture. They do not store PHI, patient identifiers, payer member data, live clinical records, source contracts, secrets, credentials, exact recipient lists, recipient email addresses, signed approvals, signed BAAs/DPAs, legal opinions, audited financial statements, securities offering material, investment advice, accounting advice, tax advice, valuation assurance, revenue guarantee, reimbursement assurance, advertising claim substantiation, clinical validation, compliance certification, customer permission artifacts, public release approval, external distribution approval, production authorization, or live clinical execution approval.";

export type ProtectedEvidenceRoomRecipientSegment =
  | "named-buyer-reviewers"
  | "investor-diligence-reviewers"
  | "board-governance-reviewers"
  | "procurement-security-reviewers"
  | "implementation-sponsor-reviewers"
  | "marketing-pr-reviewers"
  | "customer-reference-reviewers";

export type ProtectedEvidenceRoomRevocationState =
  | "access-not-issued"
  | "revocation-ready"
  | "revoked";

export type ProtectedEvidenceRoomRecipientControl =
  | "recipient-segment-bounded"
  | "access-window-bounded"
  | "revocation-path-defined"
  | "no-recipient-list-stored"
  | "evidence-room-reference-external"
  | "packet-reference-external"
  | "release-authority-linked";

export const protectedEvidenceRoomRecipientSegments: Array<{
  id: ProtectedEvidenceRoomRecipientSegment;
  label: string;
  requiredScope: string;
}> = [
  {
    id: "named-buyer-reviewers",
    label: "Named buyer reviewers",
    requiredScope: "Buyer diligence recipients are represented only as bounded reviewer-scope metadata."
  },
  {
    id: "investor-diligence-reviewers",
    label: "Investor diligence reviewers",
    requiredScope: "Investor room recipients are represented only as diligence-role metadata."
  },
  {
    id: "board-governance-reviewers",
    label: "Board governance reviewers",
    requiredScope: "Board evidence-room recipients remain internal governance metadata only."
  },
  {
    id: "procurement-security-reviewers",
    label: "Procurement and security reviewers",
    requiredScope: "Procurement, privacy, and security reviewers remain scoped external-review metadata."
  },
  {
    id: "implementation-sponsor-reviewers",
    label: "Implementation sponsor reviewers",
    requiredScope: "Implementation sponsor access is bounded to pilot planning and non-production review."
  },
  {
    id: "marketing-pr-reviewers",
    label: "Marketing and PR reviewers",
    requiredScope: "Marketing and PR reviewers remain pre-release review metadata, not publication approval."
  },
  {
    id: "customer-reference-reviewers",
    label: "Customer reference reviewers",
    requiredScope: "Customer-reference reviewers require external customer permission and remain metadata only."
  }
] as const;

export const protectedEvidenceRoomRecipientRequiredControls: ProtectedEvidenceRoomRecipientControl[] = [
  "recipient-segment-bounded",
  "access-window-bounded",
  "revocation-path-defined",
  "no-recipient-list-stored",
  "evidence-room-reference-external",
  "packet-reference-external",
  "release-authority-linked"
];

export type ProtectedEvidenceRoomRecipientAttestationStatus =
  | "recipient-attestation-metadata-recorded"
  | "release-authority-linked"
  | "recipient-metadata-complete-not-export-approval"
  | "blocked"
  | "not-recorded";

export type ProtectedEvidenceRoomRecipientAttestationInput = {
  releaseAuthorityAttestationRecordIds: string[];
  distributionAudience: ProtectedDistributionAudience;
  recipientSegment: ProtectedEvidenceRoomRecipientSegment;
  recipientScopeLabel: string;
  evidenceRoomReferenceLabel: string;
  evidenceRoomReferenceLocator: string;
  packetReferenceLabel: string;
  packetReferenceLocator: string;
  accessWindowStart: string;
  accessWindowEnd: string;
  revocationState: ProtectedEvidenceRoomRevocationState;
  revocationTrigger: string;
  externalRecipientAuthorityRetained: true;
  exportDisabled: true;
  attestation: typeof protectedEvidenceRoomRecipientAttestation;
  dataBoundary: typeof protectedEvidenceRoomRecipientAttestationDataBoundary;
  reviewNote: string;
};

export type ProtectedEvidenceRoomRecipientAttestationRecord = {
  id: string;
  tenantId: string;
  workspaceId: string;
  distributionAudience: ProtectedDistributionAudience;
  recipientSegment: ProtectedEvidenceRoomRecipientSegment;
  recipientSegmentLabel: string;
  attestationStatus: Exclude<ProtectedEvidenceRoomRecipientAttestationStatus, "not-recorded">;
  approvalScope: typeof protectedEvidenceRoomRecipientApprovalScope;
  recipientScopeLabel: string;
  evidenceRoomReferenceLabel: string;
  evidenceRoomReferenceLocator: string;
  packetReferenceLabel: string;
  packetReferenceLocator: string;
  accessWindowStart: string;
  accessWindowEnd: string;
  revocationState: ProtectedEvidenceRoomRevocationState;
  revocationTrigger: string;
  releaseAuthorityAttestationRecordIds: string[];
  evidenceSnapshot: Record<string, unknown>;
  requiredRecipientControls: ProtectedEvidenceRoomRecipientControl[];
  linkedRecipientControls: ProtectedEvidenceRoomRecipientControl[];
  missingRecipientControls: ProtectedEvidenceRoomRecipientControl[];
  retainedBlockers: string[];
  releaseRestrictions: string[];
  externalRecipientAuthorityRetained: boolean;
  exportDisabled: boolean;
  attestation: typeof protectedEvidenceRoomRecipientAttestation;
  reviewNote: string;
  dataBoundary: typeof protectedEvidenceRoomRecipientAttestationDataBoundary;
  recipientAttestationAuthority: typeof protectedEvidenceRoomRecipientAttestationAuthority;
  releaseAuthority: typeof protectedEvidenceRoomRecipientReleaseAuthority;
  storageAuthority: typeof protectedEvidenceRoomRecipientStorageAuthority;
  releaseAuthorityAttestationAuthority: typeof protectedReleaseAuthorityAttestationAuthority;
  releaseAuthorityReleaseAuthority: typeof protectedReleaseAuthorityReleaseAuthority;
  releaseAuthorityStorageAuthority: typeof protectedReleaseAuthorityAttestationStorageAuthority;
  lockboxAuthority: typeof protectedDistributionLockboxAuthority;
  lockboxReleaseAuthority: typeof protectedDistributionLockboxReleaseAuthority;
  lockboxStorageAuthority: typeof protectedDistributionLockboxStorageAuthority;
  releaseDecisionAuthority: typeof protectedReleaseDecisionAuthority;
  financialReportingAuthority: typeof protectedMetricRollupFinancialAuthority;
  securitiesAuthority: typeof protectedMetricRollupSecuritiesAuthority;
  advertisingClaimsAuthority: typeof protectedFinanceAdvertisingClaimsAuthority;
  clinicalExecutionAuthority: typeof protectedMetricRollupClinicalAuthority;
  recordedBy: string;
  recordedAt: string;
  createdAt: string;
  boundary: string;
};

export type ProtectedEvidenceRoomRecipientAttestationWorkflow = {
  service: "scrimed-protected-evidence-room-recipient-attestations";
  status: typeof protectedEvidenceRoomRecipientAttestationStatus;
  packetStatus: typeof protectedEvidenceRoomRecipientAttestationPacketProofStackStatus;
  summary: {
    attestationCount: number;
    readyForReviewCount: number;
    exportDisabledCount: number;
    requiredRecipientControlCount: number;
    linkedRecipientControlCount: number;
    missingRecipientControlCount: number;
    readyReleaseAuthorityAttestationCount: number;
    retainedBlockerCount: number;
    latestAttestationAt: string | null;
  };
  recipientState:
    | "recipient-attestation-open"
    | "recipient-metadata-recorded"
    | "recipient-attestation-review-ready-not-release-approval";
  exportState: "export-disabled" | "blocked-pending-recipient-and-release-authority";
  requiredRecipientControls: ProtectedEvidenceRoomRecipientControl[];
  linkedRecipientControls: ProtectedEvidenceRoomRecipientControl[];
  missingRecipientControls: ProtectedEvidenceRoomRecipientControl[];
  records: ProtectedEvidenceRoomRecipientAttestationRecord[];
  availableReleaseAuthorityAttestations: ProtectedReleaseAuthorityAttestationRecord[];
  releaseAuthoritySnapshot: {
    service: ProtectedReleaseAuthorityAttestationWorkflow["service"] | "unavailable";
    status: typeof protectedReleaseAuthorityAttestationStatus | "unavailable";
    authorityState: ProtectedReleaseAuthorityAttestationWorkflow["authorityState"] | "unavailable";
    releaseState: ProtectedReleaseAuthorityAttestationWorkflow["releaseState"] | "unavailable";
    readyForReviewCount: number;
    latestAttestationAt: string | null;
  };
  recipientSegments: typeof protectedEvidenceRoomRecipientSegments;
  authorities: {
    recipientAttestationAuthority: typeof protectedEvidenceRoomRecipientAttestationAuthority;
    releaseAuthority: typeof protectedEvidenceRoomRecipientReleaseAuthority;
    storageAuthority: typeof protectedEvidenceRoomRecipientStorageAuthority;
    approvalScope: typeof protectedEvidenceRoomRecipientApprovalScope;
    releaseAuthorityAttestationAuthority: typeof protectedReleaseAuthorityAttestationAuthority;
    releaseAuthorityReleaseAuthority: typeof protectedReleaseAuthorityReleaseAuthority;
    releaseAuthorityStorageAuthority: typeof protectedReleaseAuthorityAttestationStorageAuthority;
    lockboxAuthority: typeof protectedDistributionLockboxAuthority;
    lockboxReleaseAuthority: typeof protectedDistributionLockboxReleaseAuthority;
    lockboxStorageAuthority: typeof protectedDistributionLockboxStorageAuthority;
    releaseDecisionAuthority: typeof protectedReleaseDecisionAuthority;
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

const revocationStates: ProtectedEvidenceRoomRevocationState[] = [
  "access-not-issued",
  "revocation-ready",
  "revoked"
];

const forbiddenRecipientAttestationPatterns = [
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
  /email/i,
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

  return forbiddenRecipientAttestationPatterns.some((pattern) => pattern.test(candidate));
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

function getRecipientSegment(value: string) {
  return protectedEvidenceRoomRecipientSegments.find((segment) => segment.id === value) ?? null;
}

export function validateProtectedEvidenceRoomRecipientAttestationInput(value: unknown):
  | { ok: true; input: ProtectedEvidenceRoomRecipientAttestationInput }
  | { ok: false; errors: string[] } {
  const record = value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
  const releaseAuthorityAttestationRecordIds = normalizeUuidArray(
    record.releaseAuthorityAttestationRecordIds
  );
  const distributionAudience = safeShortText(record.distributionAudience, 80);
  const recipientSegment = safeShortText(record.recipientSegment, 80);
  const recipientScopeLabel = safeShortText(record.recipientScopeLabel, 140);
  const evidenceRoomReferenceLabel = safeShortText(record.evidenceRoomReferenceLabel, 140);
  const evidenceRoomReferenceLocator = safeShortText(record.evidenceRoomReferenceLocator, 140);
  const packetReferenceLabel = safeShortText(record.packetReferenceLabel, 140);
  const packetReferenceLocator = safeShortText(record.packetReferenceLocator, 140);
  const accessWindowStart = normalizeIsoDate(safeShortText(record.accessWindowStart, 80));
  const accessWindowEnd = normalizeIsoDate(safeShortText(record.accessWindowEnd, 80));
  const revocationState = safeShortText(record.revocationState, 80);
  const revocationTrigger = safeShortText(record.revocationTrigger, 180);
  const externalRecipientAuthorityRetained = record.externalRecipientAuthorityRetained === true;
  const exportDisabled = record.exportDisabled === true;
  const attestation = safeShortText(record.attestation, 100);
  const dataBoundary = safeShortText(record.dataBoundary, 90);
  const reviewNote = safeShortText(record.reviewNote, 280);
  const segment = getRecipientSegment(recipientSegment);
  const errors: string[] = [];

  if (releaseAuthorityAttestationRecordIds.invalid) {
    errors.push("Recipient attestations require one to fourteen valid release authority attestation record ids.");
  }

  if (!protectedDistributionAudiences.includes(distributionAudience as ProtectedDistributionAudience)) {
    errors.push("Distribution audience must match an approved release-authority audience.");
  }

  if (!segment) {
    errors.push("Recipient segment must be one of the approved evidence-room recipient segments.");
  }

  if (!isSafeMetadata(recipientScopeLabel, 4, 140)) {
    errors.push("Recipient scope label must be bounded non-sensitive metadata.");
  }

  if (!isSafeMetadata(evidenceRoomReferenceLabel, 4, 140)) {
    errors.push("Evidence-room reference label must be bounded no-PHI metadata.");
  }

  if (!isSafeMetadata(evidenceRoomReferenceLocator, 4, 140)) {
    errors.push("Evidence-room reference locator must be a bounded external locator.");
  }

  if (!isSafeMetadata(packetReferenceLabel, 4, 140)) {
    errors.push("Packet reference label must be bounded no-PHI metadata.");
  }

  if (!isSafeMetadata(packetReferenceLocator, 4, 140)) {
    errors.push("Packet reference locator must be a bounded external locator.");
  }

  if (!accessWindowStart || !accessWindowEnd) {
    errors.push("Access window start and end must be valid dates or timestamps.");
  } else {
    const startTime = new Date(accessWindowStart).getTime();
    const endTime = new Date(accessWindowEnd).getTime();
    const now = Date.now();
    const maximum = now + 180 * 24 * 60 * 60 * 1000;

    if (startTime < now - 24 * 60 * 60 * 1000 || endTime <= startTime || endTime > maximum) {
      errors.push("Access window must start no earlier than yesterday and end within 180 days.");
    }
  }

  if (!revocationStates.includes(revocationState as ProtectedEvidenceRoomRevocationState)) {
    errors.push("Revocation state must be access-not-issued, revocation-ready, or revoked.");
  }

  if (!isSafeMetadata(revocationTrigger, 8, 180)) {
    errors.push("Revocation trigger must describe a bounded rollback/re-review condition.");
  }

  if (!externalRecipientAuthorityRetained) {
    errors.push("Recipient metadata requires external recipient authority to be retained outside SCRIMED.");
  }

  if (!exportDisabled) {
    errors.push("Current SCRIMED evidence-room recipient mode must remain export-disabled.");
  }

  if (attestation !== protectedEvidenceRoomRecipientAttestation) {
    errors.push("Recipient attestations require the fixed no-PHI metadata attestation.");
  }

  if (dataBoundary !== protectedEvidenceRoomRecipientAttestationDataBoundary) {
    errors.push("Recipient attestations require the synthetic business workflow data boundary.");
  }

  if (reviewNote.length > 280) {
    errors.push("Review note must stay under 280 characters.");
  }

  if (
    containsForbiddenContent(
      ...releaseAuthorityAttestationRecordIds.values,
      distributionAudience,
      recipientSegment,
      recipientScopeLabel,
      evidenceRoomReferenceLabel,
      evidenceRoomReferenceLocator,
      packetReferenceLabel,
      packetReferenceLocator,
      revocationState,
      revocationTrigger,
      reviewNote
    )
  ) {
    errors.push(
      "Recipient attestation metadata cannot contain PHI, credentials, secrets, patient identifiers, payer member data, source contracts, exact recipient lists, recipient emails, signed documents, legal opinions, audited financial claims, securities claims, advertising substantiation, clinical validation, reimbursement guarantees, compliance certification, public release approval, distribution approval, enabled-export language, or live clinical execution claims."
    );
  }

  if (errors.length > 0 || !accessWindowStart || !accessWindowEnd || !segment) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    input: {
      releaseAuthorityAttestationRecordIds: releaseAuthorityAttestationRecordIds.values,
      distributionAudience: distributionAudience as ProtectedDistributionAudience,
      recipientSegment: segment.id,
      recipientScopeLabel,
      evidenceRoomReferenceLabel,
      evidenceRoomReferenceLocator,
      packetReferenceLabel,
      packetReferenceLocator,
      accessWindowStart,
      accessWindowEnd,
      revocationState: revocationState as ProtectedEvidenceRoomRevocationState,
      revocationTrigger,
      externalRecipientAuthorityRetained: true,
      exportDisabled: true,
      attestation: protectedEvidenceRoomRecipientAttestation,
      dataBoundary: protectedEvidenceRoomRecipientAttestationDataBoundary,
      reviewNote
    }
  };
}

export function deriveProtectedEvidenceRoomRecipientAttestationWorkflow({
  records,
  releaseAuthorityWorkflow,
  unavailableSections = []
}: {
  records: ProtectedEvidenceRoomRecipientAttestationRecord[];
  releaseAuthorityWorkflow: ProtectedReleaseAuthorityAttestationWorkflow | null;
  unavailableSections?: string[];
}): ProtectedEvidenceRoomRecipientAttestationWorkflow {
  const availableReleaseAuthorityAttestations = releaseAuthorityWorkflow
    ? releaseAuthorityWorkflow.records.filter(
        (record) =>
          record.externalAuthorityRetained &&
          record.releaseDisabled &&
          record.attestationStatus === "all-release-authority-metadata-complete-not-release-approval" &&
          record.missingAuthorityDomains.length === 0
      )
    : [];
  const activeRecords = records.filter(
    (record) => record.externalRecipientAuthorityRetained && record.exportDisabled
  );
  const linkedRecipientControls = protectedEvidenceRoomRecipientRequiredControls.filter((control) =>
    activeRecords.some((record) => record.linkedRecipientControls.includes(control))
  );
  const missingRecipientControls = protectedEvidenceRoomRecipientRequiredControls.filter(
    (control) => !linkedRecipientControls.includes(control)
  );
  const readyRecords = activeRecords.filter(
    (record) =>
      record.attestationStatus === "recipient-metadata-complete-not-export-approval" &&
      record.missingRecipientControls.length === 0
  );
  const retainedBlockerCount = records.reduce(
    (total, record) => total + record.retainedBlockers.length,
    0
  );
  const latestAttestation = records[0] ?? null;
  const readyForReview = readyRecords.length > 0 && availableReleaseAuthorityAttestations.length > 0;

  return {
    service: "scrimed-protected-evidence-room-recipient-attestations",
    status: protectedEvidenceRoomRecipientAttestationStatus,
    packetStatus: protectedEvidenceRoomRecipientAttestationPacketProofStackStatus,
    summary: {
      attestationCount: records.length,
      readyForReviewCount: readyForReview ? readyRecords.length : 0,
      exportDisabledCount: records.filter((record) => record.exportDisabled).length,
      requiredRecipientControlCount: protectedEvidenceRoomRecipientRequiredControls.length,
      linkedRecipientControlCount: linkedRecipientControls.length,
      missingRecipientControlCount: missingRecipientControls.length,
      readyReleaseAuthorityAttestationCount: availableReleaseAuthorityAttestations.length,
      retainedBlockerCount,
      latestAttestationAt: latestAttestation?.recordedAt ?? null
    },
    recipientState: readyForReview
      ? "recipient-attestation-review-ready-not-release-approval"
      : records.length > 0
        ? "recipient-metadata-recorded"
        : "recipient-attestation-open",
    exportState: "export-disabled",
    requiredRecipientControls: protectedEvidenceRoomRecipientRequiredControls,
    linkedRecipientControls,
    missingRecipientControls,
    records,
    availableReleaseAuthorityAttestations,
    releaseAuthoritySnapshot: {
      service: releaseAuthorityWorkflow?.service ?? "unavailable",
      status: releaseAuthorityWorkflow?.status ?? "unavailable",
      authorityState: releaseAuthorityWorkflow?.authorityState ?? "unavailable",
      releaseState: releaseAuthorityWorkflow?.releaseState ?? "unavailable",
      readyForReviewCount: releaseAuthorityWorkflow?.summary.readyForReviewCount ?? 0,
      latestAttestationAt: releaseAuthorityWorkflow?.summary.latestAttestationAt ?? null
    },
    recipientSegments: protectedEvidenceRoomRecipientSegments,
    authorities: {
      recipientAttestationAuthority: protectedEvidenceRoomRecipientAttestationAuthority,
      releaseAuthority: protectedEvidenceRoomRecipientReleaseAuthority,
      storageAuthority: protectedEvidenceRoomRecipientStorageAuthority,
      approvalScope: protectedEvidenceRoomRecipientApprovalScope,
      releaseAuthorityAttestationAuthority: protectedReleaseAuthorityAttestationAuthority,
      releaseAuthorityReleaseAuthority: protectedReleaseAuthorityReleaseAuthority,
      releaseAuthorityStorageAuthority: protectedReleaseAuthorityAttestationStorageAuthority,
      lockboxAuthority: protectedDistributionLockboxAuthority,
      lockboxReleaseAuthority: protectedDistributionLockboxReleaseAuthority,
      lockboxStorageAuthority: protectedDistributionLockboxStorageAuthority,
      releaseDecisionAuthority: protectedReleaseDecisionAuthority,
      financeExternalUseAuthority: protectedFinanceExternalUseAuthority,
      financialReportingAuthority: protectedMetricRollupFinancialAuthority,
      securitiesAuthority: protectedMetricRollupSecuritiesAuthority,
      advertisingClaimsAuthority: protectedFinanceAdvertisingClaimsAuthority,
      clinicalExecutionAuthority: protectedMetricRollupClinicalAuthority
    },
    safeWorkarounds: [
      "Retain exact recipient lists, emails, access grants, approval artifacts, signatures, customer permissions, and legal reviews in qualified external evidence-room systems; SCRIMED stores no-PHI metadata references only.",
      "Use recipient attestations as internal release-readiness evidence, not authorization to distribute, advertise, publish, report financials, share customer proof, or execute clinical workflows.",
      "Keep export disabled when release authority is incomplete, recipient segment changes, access window expires, revocation path changes, counsel review changes, customer permission expires, or exact recipient access is not externally controlled.",
      "Re-run release authority, distribution lockbox, named reviewer sign-off, and release decision workflows when packet content, audience, evidence-room locator, recipient scope, or revocation posture changes."
    ],
    unavailableSections,
    boundary: `${protectedEvidenceRoomRecipientBoundary} ${protectedReleaseAuthorityAttestationBoundary} ${protectedDistributionLockboxBoundary}`,
    updated: "2026-06-20"
  };
}

function linesForRecipientAttestation(
  record: ProtectedEvidenceRoomRecipientAttestationRecord
) {
  return [
    `### ${record.recipientSegmentLabel} - ${record.packetReferenceLabel}`,
    `- Attestation status: ${record.attestationStatus}`,
    `- Distribution audience: ${record.distributionAudience}`,
    `- Recipient scope label: ${record.recipientScopeLabel}`,
    `- Evidence-room reference label: ${record.evidenceRoomReferenceLabel}`,
    `- Evidence-room reference locator: ${record.evidenceRoomReferenceLocator}`,
    `- Packet reference locator: ${record.packetReferenceLocator}`,
    `- Access window: ${record.accessWindowStart} to ${record.accessWindowEnd}`,
    `- Revocation state: ${record.revocationState}`,
    `- Revocation trigger: ${record.revocationTrigger}`,
    `- External recipient authority retained: ${record.externalRecipientAuthorityRetained ? "yes" : "no"}`,
    `- Export disabled: ${record.exportDisabled ? "yes" : "no"}`,
    `- Approval scope: ${record.approvalScope}`,
    `- Recipient attestation authority: ${record.recipientAttestationAuthority}`,
    `- Release authority: ${record.releaseAuthority}`,
    `- Storage authority: ${record.storageAuthority}`,
    `- Review note: ${record.reviewNote || "none"}`,
    `- Recorded at: ${record.recordedAt}`,
    `- Boundary: ${record.boundary}`,
    "- Release authority attestation record ids:",
    ...record.releaseAuthorityAttestationRecordIds.map((id) => `  - ${id}`),
    "- Missing recipient controls:",
    ...(record.missingRecipientControls.length
      ? record.missingRecipientControls.map((control) => `  - ${control}`)
      : ["  - none"]),
    "- Retained blockers:",
    ...record.retainedBlockers.map((blocker) => `  - ${blocker}`),
    "- Release restrictions:",
    ...record.releaseRestrictions.map((restriction) => `  - ${restriction}`)
  ];
}

export function buildProtectedEvidenceRoomRecipientAttestationPacket({
  actorUserId,
  auditEventId,
  generatedAt,
  workflow,
  workspace
}: {
  actorUserId: string;
  auditEventId?: string | null;
  generatedAt: string;
  workflow: ProtectedEvidenceRoomRecipientAttestationWorkflow;
  workspace: PilotWorkspaceRecord;
}) {
  return [
    "# SCRIMED Protected Evidence Room Recipient Attestation Packet",
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
    `Recipient attestation authority: ${workflow.authorities.recipientAttestationAuthority}`,
    `Release authority: ${workflow.authorities.releaseAuthority}`,
    `Storage authority: ${workflow.authorities.storageAuthority}`,
    `Approval scope: ${workflow.authorities.approvalScope}`,
    `Release authority attestation authority: ${workflow.authorities.releaseAuthorityAttestationAuthority}`,
    `Release authority release authority: ${workflow.authorities.releaseAuthorityReleaseAuthority}`,
    `Distribution lockbox authority: ${workflow.authorities.lockboxAuthority}`,
    `Release decision authority: ${workflow.authorities.releaseDecisionAuthority}`,
    `Finance external-use authority: ${workflow.authorities.financeExternalUseAuthority}`,
    `Financial reporting authority: ${workflow.authorities.financialReportingAuthority}`,
    `Securities authority: ${workflow.authorities.securitiesAuthority}`,
    `Advertising claims authority: ${workflow.authorities.advertisingClaimsAuthority}`,
    `Clinical execution authority: ${workflow.authorities.clinicalExecutionAuthority}`,
    "",
    "## Summary",
    `- Recipient state: ${workflow.recipientState}`,
    `- Export state: ${workflow.exportState}`,
    `- Recipient attestations: ${workflow.summary.attestationCount}`,
    `- Ready for review: ${workflow.summary.readyForReviewCount}`,
    `- Export-disabled records: ${workflow.summary.exportDisabledCount}`,
    `- Required recipient controls: ${workflow.summary.requiredRecipientControlCount}`,
    `- Linked recipient controls: ${workflow.summary.linkedRecipientControlCount}`,
    `- Missing recipient controls: ${workflow.summary.missingRecipientControlCount}`,
    `- Ready release authority attestations: ${workflow.summary.readyReleaseAuthorityAttestationCount}`,
    `- Retained blockers: ${workflow.summary.retainedBlockerCount}`,
    `- Latest attestation: ${workflow.summary.latestAttestationAt ?? "not recorded"}`,
    "",
    "## Release Authority Snapshot",
    `- Release authority service: ${workflow.releaseAuthoritySnapshot.service}`,
    `- Release authority status: ${workflow.releaseAuthoritySnapshot.status}`,
    `- Authority state: ${workflow.releaseAuthoritySnapshot.authorityState}`,
    `- Release state: ${workflow.releaseAuthoritySnapshot.releaseState}`,
    `- Ready authority attestations: ${workflow.releaseAuthoritySnapshot.readyForReviewCount}`,
    `- Latest authority attestation: ${workflow.releaseAuthoritySnapshot.latestAttestationAt ?? "not recorded"}`,
    "",
    "## Recipient Segments",
    ...workflow.recipientSegments.map(
      (segment) => `- ${segment.id}: ${segment.label} - ${segment.requiredScope}`
    ),
    "",
    "## Missing Recipient Controls",
    ...(workflow.missingRecipientControls.length
      ? workflow.missingRecipientControls.map((control) => `- ${control}`)
      : ["- None recorded."]),
    "",
    "## Recipient Attestation Records",
    ...(workflow.records.length
      ? workflow.records.flatMap(linesForRecipientAttestation)
      : ["- No protected evidence-room recipient attestation metadata recorded."]),
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
    "- Recipient attestation metadata is not public release approval, external distribution approval, legal approval, audited financial reporting, advertising substantiation, customer permission, compliance certification, production authorization, clinical validation, reimbursement assurance, or live clinical execution authority.",
    "- Exact recipient lists, recipient emails, access grants, signed approvals, legal opinions, customer permissions, and distribution artifacts must be retained externally and independently reviewed before any release decision.",
    "",
    `Updated: ${workflow.updated}`
  ].join("\n");
}
