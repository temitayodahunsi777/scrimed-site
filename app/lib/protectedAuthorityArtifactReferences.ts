import {
  protectedClinicalAuthorityArtifactIntakeAuthority,
  protectedClinicalAuthorityArtifactIntakeBoundary,
  protectedClinicalAuthorityArtifactIntakeStatus,
  type ProtectedClinicalAuthorityArtifactIntakeChecklist,
  type ProtectedClinicalAuthorityArtifactIntakeItem
} from "./protectedClinicalAuthorityArtifactIntake";
import {
  protectedClinicalAuthorityEvidenceRoomClinicalAuthority,
  protectedClinicalAuthorityEvidenceRoomDataBoundary,
  protectedClinicalAuthorityEvidenceRoomLegalAuthority,
  protectedClinicalAuthorityEvidenceRoomPhiAuthority,
  protectedClinicalAuthorityEvidenceRoomProductionAuthority,
  protectedClinicalAuthorityEvidenceRoomRegulatoryAuthority,
  protectedClinicalAuthorityEvidenceRoomReimbursementAuthority,
  protectedClinicalAuthorityEvidenceRoomSecurityCertification
} from "./protectedClinicalAuthorityEvidenceRoom";
import type { PilotWorkspaceRecord } from "./protectedPilotWorkspace";

export const protectedAuthorityArtifactReferenceStatus =
  "aal2-authority-artifact-reference-status-capture-no-artifact-storage";
export const protectedAuthorityArtifactReferencePacketStatus =
  "aal2-audited-authority-artifact-reference-status-packet-no-artifact-storage";
export const protectedAuthorityArtifactReferenceAttestation =
  "authority-artifact-reference-metadata-no-artifact-storage";
export const protectedAuthorityArtifactReferenceDataBoundary =
  "metadata-only-no-phi-no-artifact-storage";
export const protectedAuthorityArtifactReferenceAuthority =
  "external-authority-artifact-reference-status-not-approval";
export const protectedAuthorityArtifactReferenceStorageAuthority =
  "no-artifact-storage-no-sensitive-documents";
export const protectedAuthorityArtifactReferenceClinicalAuthority =
  "not-authorized-live-care";
export const protectedAuthorityArtifactReferenceBoundary =
  "Protected Authority Artifact References v1 records only sanitized metadata about externally retained authority artifacts. It stores no PHI, patient identifiers, payer member data, production credentials, URLs, signed artifacts, signature images, legal opinions, security reports, reimbursement determinations, regional approvals, clinical validation artifacts, certification evidence, source files, contracts, approvals, or uploaded documents. Reference status capture does not grant clinical, legal, privacy, reimbursement, security, regional, connector, production, procurement, distribution, or live-care authority.";

export type ProtectedAuthorityArtifactReferenceStatus =
  | "reference-needed"
  | "reference-recorded"
  | "review-pending"
  | "accepted-metadata-only"
  | "renewal-required"
  | "rejected-or-expired";

export type ProtectedAuthorityArtifactReferenceControl =
  | "intake-item-linked"
  | "external-system-identified"
  | "reference-id-recorded"
  | "reviewer-label-recorded"
  | "reviewer-role-recorded"
  | "validation-timestamp-recorded"
  | "expiration-date-recorded"
  | "renewal-alert-recorded"
  | "artifact-retained-externally"
  | "artifact-upload-disabled"
  | "phi-storage-disabled"
  | "human-review-required";

export const protectedAuthorityArtifactReferenceStatuses: Array<{
  id: ProtectedAuthorityArtifactReferenceStatus;
  label: string;
}> = [
  { id: "reference-needed", label: "Reference needed" },
  { id: "reference-recorded", label: "Reference recorded" },
  { id: "review-pending", label: "Review pending" },
  { id: "accepted-metadata-only", label: "Accepted metadata only" },
  { id: "renewal-required", label: "Renewal required" },
  { id: "rejected-or-expired", label: "Rejected or expired" }
] as const;

export const protectedAuthorityArtifactReferenceRequiredControls: ProtectedAuthorityArtifactReferenceControl[] = [
  "intake-item-linked",
  "external-system-identified",
  "reference-id-recorded",
  "reviewer-label-recorded",
  "reviewer-role-recorded",
  "validation-timestamp-recorded",
  "expiration-date-recorded",
  "renewal-alert-recorded",
  "artifact-retained-externally",
  "artifact-upload-disabled",
  "phi-storage-disabled",
  "human-review-required"
];

export type ProtectedAuthorityArtifactReferenceInput = {
  artifactIntakeItemId: string;
  authorityKey: ProtectedClinicalAuthorityArtifactIntakeItem["authorityKey"];
  authorityLabel: string;
  ownerAssignmentId: string;
  ownerRole: string;
  ownerLabel: string;
  ownerSide: ProtectedClinicalAuthorityArtifactIntakeItem["ownerSide"];
  referenceStatus: ProtectedAuthorityArtifactReferenceStatus;
  externalSystemLabel: string;
  externalReferenceId: string;
  reviewerLabel: string;
  reviewerRole: string;
  validatedAt: string;
  expiresAt: string;
  renewalAlertAt: string;
  artifactRetainedExternally: true;
  artifactUploadDisabled: true;
  phiStorageDisabled: true;
  sensitiveArtifactStorageDisabled: true;
  authorityGranted: false;
  humanReviewRequired: true;
  attestation: typeof protectedAuthorityArtifactReferenceAttestation;
  dataBoundary: typeof protectedAuthorityArtifactReferenceDataBoundary;
  reviewNote: string;
};

export type ProtectedAuthorityArtifactReferenceRecord = {
  id: string;
  tenantId: string;
  workspaceId: string;
  artifactIntakeItemId: string;
  authorityKey: ProtectedClinicalAuthorityArtifactIntakeItem["authorityKey"];
  authorityLabel: string;
  ownerAssignmentId: string;
  ownerRole: string;
  ownerLabel: string;
  ownerSide: ProtectedClinicalAuthorityArtifactIntakeItem["ownerSide"];
  referenceStatus: ProtectedAuthorityArtifactReferenceStatus;
  externalSystemLabel: string;
  externalReferenceId: string;
  reviewerLabel: string;
  reviewerRole: string;
  validatedAt: string;
  expiresAt: string;
  renewalAlertAt: string;
  evidenceSnapshot: Record<string, unknown>;
  requiredReferenceControls: ProtectedAuthorityArtifactReferenceControl[];
  linkedReferenceControls: ProtectedAuthorityArtifactReferenceControl[];
  missingReferenceControls: ProtectedAuthorityArtifactReferenceControl[];
  retainedBlockers: string[];
  releaseRestrictions: string[];
  artifactRetainedExternally: boolean;
  artifactUploadDisabled: boolean;
  phiStorageDisabled: boolean;
  sensitiveArtifactStorageDisabled: boolean;
  authorityGranted: boolean;
  humanReviewRequired: boolean;
  attestation: typeof protectedAuthorityArtifactReferenceAttestation;
  reviewNote: string;
  dataBoundary: typeof protectedAuthorityArtifactReferenceDataBoundary;
  referenceAuthority: typeof protectedAuthorityArtifactReferenceAuthority;
  storageAuthority: typeof protectedAuthorityArtifactReferenceStorageAuthority;
  clinicalExecutionAuthority: typeof protectedAuthorityArtifactReferenceClinicalAuthority;
  recordedBy: string;
  recordedAt: string;
  createdAt: string;
  boundary: string;
};

export type ProtectedAuthorityArtifactReferenceWorkflow = {
  service: "scrimed-protected-authority-artifact-references";
  status: typeof protectedAuthorityArtifactReferenceStatus;
  packetStatus: typeof protectedAuthorityArtifactReferencePacketStatus;
  workspaceSlug: string;
  workspaceName: string;
  tenantName: string;
  summary: {
    intakeItemCount: number;
    referenceRecordCount: number;
    referencedItemCount: number;
    acceptedMetadataOnlyCount: number;
    reviewPendingCount: number;
    renewalRequiredCount: number;
    rejectedOrExpiredCount: number;
    missingReferenceItemCount: number;
    requiredReferenceControlCount: number;
    linkedReferenceControlCount: number;
    missingReferenceControlCount: number;
    externalSystemCount: number;
    latestReferenceAt: string | null;
  };
  referenceState:
    | "external-reference-capture-open"
    | "external-reference-metadata-recorded"
    | "reference-renewal-required"
    | "accepted-metadata-only-not-approval";
  authorityState: "blocked-before-qualified-external-approval";
  records: ProtectedAuthorityArtifactReferenceRecord[];
  intakeChecklist: ProtectedClinicalAuthorityArtifactIntakeChecklist;
  requiredReferenceControls: ProtectedAuthorityArtifactReferenceControl[];
  linkedReferenceControls: ProtectedAuthorityArtifactReferenceControl[];
  missingReferenceControls: ProtectedAuthorityArtifactReferenceControl[];
  statuses: typeof protectedAuthorityArtifactReferenceStatuses;
  authorities: {
    referenceAuthority: typeof protectedAuthorityArtifactReferenceAuthority;
    storageAuthority: typeof protectedAuthorityArtifactReferenceStorageAuthority;
    clinicalExecutionAuthority: typeof protectedAuthorityArtifactReferenceClinicalAuthority;
    artifactIntakeAuthority: typeof protectedClinicalAuthorityArtifactIntakeAuthority;
    artifactIntakeStatus: typeof protectedClinicalAuthorityArtifactIntakeStatus;
    dataBoundary: typeof protectedAuthorityArtifactReferenceDataBoundary;
    clinicalCareAuthority: typeof protectedClinicalAuthorityEvidenceRoomClinicalAuthority;
    phiAuthority: typeof protectedClinicalAuthorityEvidenceRoomPhiAuthority;
    legalAuthority: typeof protectedClinicalAuthorityEvidenceRoomLegalAuthority;
    regulatoryAuthority: typeof protectedClinicalAuthorityEvidenceRoomRegulatoryAuthority;
    reimbursementAuthority: typeof protectedClinicalAuthorityEvidenceRoomReimbursementAuthority;
    securityCertification: typeof protectedClinicalAuthorityEvidenceRoomSecurityCertification;
    productionAuthority: typeof protectedClinicalAuthorityEvidenceRoomProductionAuthority;
    evidenceRoomDataBoundary: typeof protectedClinicalAuthorityEvidenceRoomDataBoundary;
  };
  safeWorkarounds: string[];
  unavailableSections: string[];
  nextActions: string[];
  boundary: string;
  updated: string;
};

const safeMetadataTextPattern = /^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]*$/;

const forbiddenAuthorityReferencePatterns = [
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
  /signature/i,
  /legal opinion/i,
  /soc[ _-]?2[ _-]?(report|certified|certification|type)/i,
  /penetration[ _-]?test/i,
  /vulnerability[ _-]?report/i,
  /security questionnaire answer/i,
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
  /clinical approval/i,
  /legal approved/i,
  /production approved/i,
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

  return forbiddenAuthorityReferencePatterns.some((pattern) => pattern.test(candidate));
}

function parseIsoDate(value: string) {
  const time = new Date(value).getTime();

  return Number.isFinite(time) ? new Date(time).toISOString() : null;
}

function itemById(
  checklist: ProtectedClinicalAuthorityArtifactIntakeChecklist,
  itemId: string
) {
  return checklist.items.find((item) => item.id === itemId) ?? null;
}

export function validateProtectedAuthorityArtifactReferenceInput(
  value: unknown,
  checklist: ProtectedClinicalAuthorityArtifactIntakeChecklist
):
  | { ok: true; input: ProtectedAuthorityArtifactReferenceInput }
  | { ok: false; errors: string[] } {
  const record = value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
  const artifactIntakeItemId = safeShortText(record.artifactIntakeItemId, 140);
  const selectedItem = itemById(checklist, artifactIntakeItemId);
  const referenceStatus = safeShortText(record.referenceStatus, 80);
  const externalSystemLabel = safeShortText(record.externalSystemLabel, 140);
  const externalReferenceId = safeShortText(record.externalReferenceId, 160);
  const reviewerLabel = safeShortText(record.reviewerLabel, 140);
  const reviewerRole = safeShortText(record.reviewerRole, 140);
  const validatedAt = parseIsoDate(safeShortText(record.validatedAt, 60));
  const expiresAt = parseIsoDate(safeShortText(record.expiresAt, 60));
  const renewalAlertAt = parseIsoDate(safeShortText(record.renewalAlertAt, 60));
  const artifactRetainedExternally = record.artifactRetainedExternally === true;
  const artifactUploadDisabled = record.artifactUploadDisabled === true;
  const phiStorageDisabled = record.phiStorageDisabled === true;
  const sensitiveArtifactStorageDisabled =
    record.sensitiveArtifactStorageDisabled === true;
  const authorityGranted = record.authorityGranted === false;
  const humanReviewRequired = record.humanReviewRequired === true;
  const attestation = safeShortText(record.attestation, 120);
  const dataBoundary = safeShortText(record.dataBoundary, 90);
  const reviewNote = safeShortText(record.reviewNote, 300);
  const errors: string[] = [];

  if (!selectedItem) {
    errors.push("Artifact intake item must match the protected checklist for this workspace.");
  }

  if (
    !protectedAuthorityArtifactReferenceStatuses.some(
      (status) => status.id === referenceStatus
    )
  ) {
    errors.push("Reference status must be an approved authority artifact reference state.");
  }

  if (!isSafeMetadata(externalSystemLabel, 4, 140)) {
    errors.push("External system label must be bounded metadata and cannot include a URL or secret.");
  }

  if (!isSafeMetadata(externalReferenceId, 4, 160)) {
    errors.push("External reference ID must be bounded metadata and cannot include a URL, secret, or artifact content.");
  }

  if (!isSafeMetadata(reviewerLabel, 4, 140)) {
    errors.push("Reviewer label must be bounded metadata.");
  }

  if (!isSafeMetadata(reviewerRole, 4, 140)) {
    errors.push("Reviewer role must be bounded metadata.");
  }

  if (!validatedAt) {
    errors.push("Validated-at timestamp is required and must be a valid ISO date.");
  }

  if (!expiresAt) {
    errors.push("Expiration timestamp is required and must be a valid ISO date.");
  }

  if (!renewalAlertAt) {
    errors.push("Renewal-alert timestamp is required and must be a valid ISO date.");
  }

  if (validatedAt && expiresAt && new Date(expiresAt).getTime() <= new Date(validatedAt).getTime()) {
    errors.push("Expiration timestamp must be after the validation timestamp.");
  }

  if (
    validatedAt &&
    expiresAt &&
    renewalAlertAt &&
    (new Date(renewalAlertAt).getTime() < new Date(validatedAt).getTime() ||
      new Date(renewalAlertAt).getTime() > new Date(expiresAt).getTime())
  ) {
    errors.push("Renewal-alert timestamp must fall between validation and expiration.");
  }

  if (!artifactRetainedExternally) {
    errors.push("Authority artifacts must remain in an external system of record.");
  }

  if (!artifactUploadDisabled || !phiStorageDisabled || !sensitiveArtifactStorageDisabled) {
    errors.push("Artifact upload, PHI storage, and sensitive artifact storage must remain disabled.");
  }

  if (!authorityGranted) {
    errors.push("Reference metadata must not grant authority.");
  }

  if (!humanReviewRequired) {
    errors.push("Human review is required for authority artifact references.");
  }

  if (attestation !== protectedAuthorityArtifactReferenceAttestation) {
    errors.push("Authority artifact references require the fixed metadata-only attestation.");
  }

  if (dataBoundary !== protectedAuthorityArtifactReferenceDataBoundary) {
    errors.push("Authority artifact references require the no-PHI, no-artifact-storage data boundary.");
  }

  if (reviewNote.length > 300) {
    errors.push("Review note must stay under 300 characters.");
  }

  if (
    containsForbiddenContent(
      artifactIntakeItemId,
      referenceStatus,
      externalSystemLabel,
      externalReferenceId,
      reviewerLabel,
      reviewerRole,
      reviewNote
    )
  ) {
    errors.push(
      "Authority artifact reference metadata cannot contain PHI, credentials, secrets, URLs, tokens, raw logs, patient identifiers, payer member data, source documents, signed artifacts, signatures, legal opinions, security reports, certification evidence, reimbursement guarantees, clinical validation, approval claims, enabled-release language, or live clinical execution claims."
    );
  }

  if (errors.length > 0 || !selectedItem || !validatedAt || !expiresAt || !renewalAlertAt) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    input: {
      artifactIntakeItemId: selectedItem.id,
      authorityKey: selectedItem.authorityKey,
      authorityLabel: selectedItem.authorityName,
      ownerAssignmentId: selectedItem.ownerAssignmentId,
      ownerRole: selectedItem.ownerRole,
      ownerLabel: selectedItem.ownerLabel,
      ownerSide: selectedItem.ownerSide,
      referenceStatus: referenceStatus as ProtectedAuthorityArtifactReferenceStatus,
      externalSystemLabel,
      externalReferenceId,
      reviewerLabel,
      reviewerRole,
      validatedAt,
      expiresAt,
      renewalAlertAt,
      artifactRetainedExternally: true,
      artifactUploadDisabled: true,
      phiStorageDisabled: true,
      sensitiveArtifactStorageDisabled: true,
      authorityGranted: false,
      humanReviewRequired: true,
      attestation: protectedAuthorityArtifactReferenceAttestation,
      dataBoundary: protectedAuthorityArtifactReferenceDataBoundary,
      reviewNote
    }
  };
}

function isActiveReference(record: ProtectedAuthorityArtifactReferenceRecord) {
  return (
    record.artifactRetainedExternally &&
    record.artifactUploadDisabled &&
    record.phiStorageDisabled &&
    record.sensitiveArtifactStorageDisabled &&
    record.authorityGranted === false &&
    record.humanReviewRequired &&
    record.missingReferenceControls.length === 0 &&
    record.referenceStatus === "accepted-metadata-only"
  );
}

export function deriveProtectedAuthorityArtifactReferenceWorkflow({
  checklist,
  records,
  unavailableSections = [],
  workspace
}: {
  checklist: ProtectedClinicalAuthorityArtifactIntakeChecklist;
  records: ProtectedAuthorityArtifactReferenceRecord[];
  unavailableSections?: string[];
  workspace: PilotWorkspaceRecord;
}): ProtectedAuthorityArtifactReferenceWorkflow {
  const activeRecords = records.filter(
    (record) =>
      record.artifactRetainedExternally &&
      record.artifactUploadDisabled &&
      record.phiStorageDisabled &&
      record.sensitiveArtifactStorageDisabled &&
      record.authorityGranted === false &&
      record.humanReviewRequired
  );
  const linkedReferenceControls = protectedAuthorityArtifactReferenceRequiredControls.filter(
    (control) => activeRecords.some((record) => record.linkedReferenceControls.includes(control))
  );
  const missingReferenceControls = protectedAuthorityArtifactReferenceRequiredControls.filter(
    (control) => !linkedReferenceControls.includes(control)
  );
  const referencedItemIds = new Set(activeRecords.map((record) => record.artifactIntakeItemId));
  const acceptedRecords = activeRecords.filter(isActiveReference);
  const renewalRequiredCount = activeRecords.filter(
    (record) => record.referenceStatus === "renewal-required"
  ).length;
  const rejectedOrExpiredCount = activeRecords.filter(
    (record) => record.referenceStatus === "rejected-or-expired"
  ).length;
  const latestReference = records[0] ?? null;

  return {
    service: "scrimed-protected-authority-artifact-references",
    status: protectedAuthorityArtifactReferenceStatus,
    packetStatus: protectedAuthorityArtifactReferencePacketStatus,
    workspaceSlug: workspace.slug,
    workspaceName: workspace.name,
    tenantName: workspace.tenantName,
    summary: {
      intakeItemCount: checklist.items.length,
      referenceRecordCount: records.length,
      referencedItemCount: referencedItemIds.size,
      acceptedMetadataOnlyCount: acceptedRecords.length,
      reviewPendingCount: activeRecords.filter((record) => record.referenceStatus === "review-pending").length,
      renewalRequiredCount,
      rejectedOrExpiredCount,
      missingReferenceItemCount: Math.max(checklist.items.length - referencedItemIds.size, 0),
      requiredReferenceControlCount: protectedAuthorityArtifactReferenceRequiredControls.length,
      linkedReferenceControlCount: linkedReferenceControls.length,
      missingReferenceControlCount: missingReferenceControls.length,
      externalSystemCount: new Set(records.map((record) => record.externalSystemLabel)).size,
      latestReferenceAt: latestReference?.recordedAt ?? null
    },
    referenceState:
      renewalRequiredCount > 0 || rejectedOrExpiredCount > 0
        ? "reference-renewal-required"
        : acceptedRecords.length > 0
          ? "accepted-metadata-only-not-approval"
          : records.length > 0
            ? "external-reference-metadata-recorded"
            : "external-reference-capture-open",
    authorityState: "blocked-before-qualified-external-approval",
    records,
    intakeChecklist: checklist,
    requiredReferenceControls: protectedAuthorityArtifactReferenceRequiredControls,
    linkedReferenceControls,
    missingReferenceControls,
    statuses: protectedAuthorityArtifactReferenceStatuses,
    authorities: {
      referenceAuthority: protectedAuthorityArtifactReferenceAuthority,
      storageAuthority: protectedAuthorityArtifactReferenceStorageAuthority,
      clinicalExecutionAuthority: protectedAuthorityArtifactReferenceClinicalAuthority,
      artifactIntakeAuthority: protectedClinicalAuthorityArtifactIntakeAuthority,
      artifactIntakeStatus: protectedClinicalAuthorityArtifactIntakeStatus,
      dataBoundary: protectedAuthorityArtifactReferenceDataBoundary,
      clinicalCareAuthority: protectedClinicalAuthorityEvidenceRoomClinicalAuthority,
      phiAuthority: protectedClinicalAuthorityEvidenceRoomPhiAuthority,
      legalAuthority: protectedClinicalAuthorityEvidenceRoomLegalAuthority,
      regulatoryAuthority: protectedClinicalAuthorityEvidenceRoomRegulatoryAuthority,
      reimbursementAuthority: protectedClinicalAuthorityEvidenceRoomReimbursementAuthority,
      securityCertification: protectedClinicalAuthorityEvidenceRoomSecurityCertification,
      productionAuthority: protectedClinicalAuthorityEvidenceRoomProductionAuthority,
      evidenceRoomDataBoundary: protectedClinicalAuthorityEvidenceRoomDataBoundary
    },
    safeWorkarounds: [
      "Record only external system labels and non-secret reference IDs; keep artifacts, URLs, documents, signatures, reports, contracts, credentials, PHI, and approvals outside SCRIMED.",
      "Use accepted metadata-only status as buyer readiness evidence, not legal approval, security approval, reimbursement certainty, clinical validation, production authorization, or live-care authority.",
      "Escalate expired, rejected, ambiguous, regional, payer, connector, clinical-use, or PHI-scope references to qualified reviewers before any go-live planning.",
      "When a buyer needs the artifact, route them to a customer-controlled diligence room, counsel file, GRC system, security portal, or qualified external repository."
    ],
    unavailableSections,
    nextActions: [
      "Record metadata-only references for each clinical authority artifact intake item.",
      "Resolve missing reference controls before any buyer packet is positioned as production readiness.",
      "Renew or reject stale references instead of relying on expired metadata.",
      "Keep live clinical care, PHI processing, legal approval, reimbursement, security certification, connector activation, production authorization, and public distribution blocked until external authority exists."
    ],
    boundary: `${protectedAuthorityArtifactReferenceBoundary} ${protectedClinicalAuthorityArtifactIntakeBoundary} ${checklist.boundary}`,
    updated: "2026-06-21"
  };
}

function formatDate(value: string | null | undefined) {
  if (!value) return "pending";

  const time = new Date(value).getTime();

  return Number.isFinite(time) ? new Date(time).toISOString() : "pending";
}

export function buildProtectedAuthorityArtifactReferencePacket({
  actorUserId,
  auditEventId,
  generatedAt,
  workflow,
  workspace
}: {
  actorUserId: string;
  auditEventId: string;
  generatedAt: string;
  workflow: ProtectedAuthorityArtifactReferenceWorkflow;
  workspace: PilotWorkspaceRecord;
}) {
  const records = workflow.records.length
    ? workflow.records
        .map(
          (record) =>
            `- ${record.authorityLabel}: ${record.referenceStatus} (${record.externalSystemLabel}, reviewer ${record.reviewerRole}, expires ${formatDate(record.expiresAt)})`
        )
        .join("\n")
    : "- No authority artifact reference metadata recorded yet.";
  const missingControls = workflow.missingReferenceControls.length
    ? workflow.missingReferenceControls.map((control) => `- ${control}`).join("\n")
    : "- none";
  const workarounds = workflow.safeWorkarounds
    .map((workaround) => `- ${workaround}`)
    .join("\n");
  const nextActions = workflow.nextActions.map((action) => `- ${action}`).join("\n");

  return `# SCRIMED Protected Authority Artifact References Packet

Generated: ${generatedAt}
Workspace: ${workspace.name} (${workspace.slug})
Actor: ${actorUserId}
Audit Event: ${auditEventId}

## Boundary
${workflow.boundary}

## Authority
- Reference authority: ${workflow.authorities.referenceAuthority}
- Storage authority: ${workflow.authorities.storageAuthority}
- Clinical execution authority: ${workflow.authorities.clinicalExecutionAuthority}
- Artifact intake authority: ${workflow.authorities.artifactIntakeAuthority}
- Artifact intake status: ${workflow.authorities.artifactIntakeStatus}
- Clinical care authority: ${workflow.authorities.clinicalCareAuthority}
- PHI authority: ${workflow.authorities.phiAuthority}
- Legal authority: ${workflow.authorities.legalAuthority}
- Regulatory authority: ${workflow.authorities.regulatoryAuthority}
- Reimbursement authority: ${workflow.authorities.reimbursementAuthority}
- Security certification: ${workflow.authorities.securityCertification}
- Production authority: ${workflow.authorities.productionAuthority}
- Data boundary: ${workflow.authorities.dataBoundary}

## Summary
- Status: ${workflow.status}
- Packet status: ${workflow.packetStatus}
- Reference state: ${workflow.referenceState}
- Authority state: ${workflow.authorityState}
- Intake items: ${workflow.summary.intakeItemCount}
- Reference records: ${workflow.summary.referenceRecordCount}
- Referenced items: ${workflow.summary.referencedItemCount}
- Accepted metadata-only references: ${workflow.summary.acceptedMetadataOnlyCount}
- Review pending: ${workflow.summary.reviewPendingCount}
- Renewal required: ${workflow.summary.renewalRequiredCount}
- Rejected or expired: ${workflow.summary.rejectedOrExpiredCount}
- Missing reference items: ${workflow.summary.missingReferenceItemCount}
- Required controls: ${workflow.summary.requiredReferenceControlCount}
- Linked controls: ${workflow.summary.linkedReferenceControlCount}
- Missing controls: ${workflow.summary.missingReferenceControlCount}
- External systems represented: ${workflow.summary.externalSystemCount}
- Latest reference: ${formatDate(workflow.summary.latestReferenceAt)}

## Records
${records}

## Missing Controls
${missingControls}

## Next Actions
${nextActions}

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
