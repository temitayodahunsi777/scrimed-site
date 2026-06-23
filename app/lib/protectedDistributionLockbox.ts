import {
  protectedFinanceAdvertisingClaimsAuthority,
  protectedFinanceExternalUseAuthority
} from "./protectedFinanceMethodology";
import {
  protectedMetricRollupClinicalAuthority,
  protectedMetricRollupDataBoundary,
  protectedMetricRollupFinancialAuthority,
  protectedMetricRollupSecuritiesAuthority
} from "./protectedMetricRollups";
import {
  protectedNamedReviewerSignoffAuthority,
  protectedNamedReviewerSignoffBoundary,
  protectedNamedReviewerSignoffStatus,
  protectedRequiredReviewerRoles,
  protectedReviewerRoles,
  protectedReviewerSignoffReleaseAuthority,
  protectedReviewerSignoffStorageAuthority,
  type ProtectedNamedReviewerSignoffRecord,
  type ProtectedNamedReviewerSignoffWorkflow,
  type ProtectedReviewerRole
} from "./protectedNamedReviewerSignoffs";
import { protectedReleaseDecisionAuthority } from "./protectedReleaseDecisionWorkflow";
import type { PilotWorkspaceRecord } from "./protectedPilotWorkspace";

export const protectedDistributionLockboxStatus =
  "aal2-external-distribution-lockbox-disabled-no-phi";
export const protectedDistributionLockboxPacketProofStackStatus =
  "aal2-audited-distribution-lockbox-packets-no-phi";
export const protectedDistributionLockboxAttestation =
  "external-distribution-lockbox-metadata-no-phi";
export const protectedDistributionLockboxDataBoundary = protectedMetricRollupDataBoundary;
export const protectedDistributionLockboxAuthority =
  "distribution-lockbox-metadata-not-release-approval";
export const protectedDistributionLockboxReleaseAuthority =
  "external-distribution-disabled-pending-real-approval";
export const protectedDistributionLockboxStorageAuthority =
  "manifest-metadata-only-no-sensitive-artifacts";
export const protectedDistributionLockboxApprovalScope =
  "external-distribution-lockbox-review-readiness-only";
export const protectedDistributionLockboxBoundary =
  "Protected Distribution Lockbox records disabled-by-default no-PHI metadata for externally retained distribution approvals, customer permissions, counsel review, reviewer sign-offs, and artifact manifests. It does not store PHI, patient identifiers, payer member data, live clinical records, source contracts, secrets, credentials, signed BAAs/DPAs, signed approvals, legal opinions, audited financial statements, securities offering material, investment advice, accounting advice, tax advice, valuation assurance, revenue guarantee, reimbursement assurance, advertising claim substantiation, clinical validation, compliance certification, customer permission artifacts, public release approval, external distribution approval, production authorization, or live clinical execution approval.";

export type ProtectedDistributionAudience =
  | "buyer-diligence-room"
  | "investor-data-room"
  | "board-room"
  | "sales-collateral-channel"
  | "marketing-site-release"
  | "public-relations-channel"
  | "customer-case-study-channel";

export type ProtectedDistributionChannelControl =
  | "external-data-room"
  | "counsel-reviewed-room"
  | "procurement-portal"
  | "board-governance-room"
  | "marketing-release-queue"
  | "pr-release-queue"
  | "customer-permission-room";

export type ProtectedDistributionLockboxStatus =
  | "lockbox-metadata-recorded"
  | "reviewer-signoffs-linked"
  | "ready-for-external-distribution-lockbox-review-not-release-authority"
  | "blocked"
  | "not-recorded";

export type ProtectedDistributionLockboxInput = {
  signoffRecordIds: string[];
  distributionAudience: ProtectedDistributionAudience;
  distributionChannelControl: ProtectedDistributionChannelControl;
  manifestVersion: string;
  manifestTitle: string;
  artifactManifestLabel: string;
  artifactManifestLocator: string;
  customerPermissionReference: string;
  counselReviewReference: string;
  distributionWindowStart: string;
  distributionWindowEnd: string;
  recipientScope: string;
  revocationPlan: string;
  externalApprovalsRetained: true;
  distributionDisabled: true;
  attestation: typeof protectedDistributionLockboxAttestation;
  dataBoundary: typeof protectedDistributionLockboxDataBoundary;
  reviewNote: string;
};

export type ProtectedDistributionLockboxRecord = {
  id: string;
  tenantId: string;
  workspaceId: string;
  distributionAudience: ProtectedDistributionAudience;
  distributionChannelControl: ProtectedDistributionChannelControl;
  lockboxStatus: Exclude<ProtectedDistributionLockboxStatus, "not-recorded">;
  approvalScope: typeof protectedDistributionLockboxApprovalScope;
  manifestVersion: string;
  manifestTitle: string;
  artifactManifestLabel: string;
  artifactManifestLocator: string;
  customerPermissionReference: string;
  counselReviewReference: string;
  distributionWindowStart: string;
  distributionWindowEnd: string;
  recipientScope: string;
  revocationPlan: string;
  signoffRecordIds: string[];
  evidenceSnapshot: Record<string, unknown>;
  requiredReviewerRoles: ProtectedReviewerRole[];
  linkedReviewerRoles: ProtectedReviewerRole[];
  missingReviewerRoles: ProtectedReviewerRole[];
  expiredSignoffRoles: ProtectedReviewerRole[];
  retainedBlockers: string[];
  releaseRestrictions: string[];
  externalApprovalsRetained: boolean;
  distributionDisabled: boolean;
  attestation: typeof protectedDistributionLockboxAttestation;
  reviewNote: string;
  dataBoundary: typeof protectedDistributionLockboxDataBoundary;
  lockboxAuthority: typeof protectedDistributionLockboxAuthority;
  releaseAuthority: typeof protectedDistributionLockboxReleaseAuthority;
  storageAuthority: typeof protectedDistributionLockboxStorageAuthority;
  signoffAuthority: typeof protectedNamedReviewerSignoffAuthority;
  signoffReleaseAuthority: typeof protectedReviewerSignoffReleaseAuthority;
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

export type ProtectedDistributionLockboxWorkflow = {
  service: "scrimed-protected-distribution-lockbox";
  status: typeof protectedDistributionLockboxStatus;
  packetStatus: typeof protectedDistributionLockboxPacketProofStackStatus;
  summary: {
    lockboxCount: number;
    readyForReviewCount: number;
    disabledCount: number;
    requiredReviewerRoleCount: number;
    linkedReviewerRoleCount: number;
    missingReviewerRoleCount: number;
    expiredSignoffCount: number;
    retainedBlockerCount: number;
    latestLockboxAt: string | null;
  };
  lockboxState:
    | "distribution-lockbox-open"
    | "distribution-lockbox-metadata-recorded"
    | "external-distribution-lockbox-review-ready-not-release-authority";
  distributionState:
    | "external-distribution-disabled"
    | "blocked-pending-signoffs-and-release-authority";
  requiredReviewerRoles: typeof protectedReviewerRoles;
  linkedReviewerRoles: ProtectedReviewerRole[];
  missingReviewerRoles: ProtectedReviewerRole[];
  expiredSignoffRoles: ProtectedReviewerRole[];
  records: ProtectedDistributionLockboxRecord[];
  signoffSnapshot: {
    service: ProtectedNamedReviewerSignoffWorkflow["service"] | "unavailable";
    status: typeof protectedNamedReviewerSignoffStatus | "unavailable";
    signoffState: ProtectedNamedReviewerSignoffWorkflow["signoffState"] | "unavailable";
    controlledDistributionReviewState:
      | ProtectedNamedReviewerSignoffWorkflow["controlledDistributionReviewState"]
      | "unavailable";
    readySignoffSetCount: number;
    linkedReviewerRoleCount: number;
    missingReviewerRoleCount: number;
    expiredCount: number;
    latestSignoffAt: string | null;
  };
  availableSignoffs: ProtectedNamedReviewerSignoffRecord[];
  authorities: {
    lockboxAuthority: typeof protectedDistributionLockboxAuthority;
    releaseAuthority: typeof protectedDistributionLockboxReleaseAuthority;
    storageAuthority: typeof protectedDistributionLockboxStorageAuthority;
    approvalScope: typeof protectedDistributionLockboxApprovalScope;
    signoffAuthority: typeof protectedNamedReviewerSignoffAuthority;
    signoffReleaseAuthority: typeof protectedReviewerSignoffReleaseAuthority;
    signoffStorageAuthority: typeof protectedReviewerSignoffStorageAuthority;
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
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const safeMetadataTextPattern = /^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]*$/;
const manifestVersionPattern = /^[A-Za-z0-9][A-Za-z0-9._:-]{1,39}$/;

const protectedDistributionAudiences: ProtectedDistributionAudience[] = [
  "buyer-diligence-room",
  "investor-data-room",
  "board-room",
  "sales-collateral-channel",
  "marketing-site-release",
  "public-relations-channel",
  "customer-case-study-channel"
];

const protectedDistributionChannelControls: ProtectedDistributionChannelControl[] = [
  "external-data-room",
  "counsel-reviewed-room",
  "procurement-portal",
  "board-governance-room",
  "marketing-release-queue",
  "pr-release-queue",
  "customer-permission-room"
];

const forbiddenLockboxPatterns = [
  /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/,
  /sk-[A-Za-z0-9_-]{12,}/i,
  /sbp_[A-Za-z0-9_-]{12,}/i,
  /bearer\s+[A-Za-z0-9._-]+/i,
  /token/i,
  /secret/i,
  /password/i,
  /api[ _-]?key/i,
  /access[ _-]?key/i,
  /https?:\/\//i,
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
  /approval authority/i,
  /external distribution approved/i,
  /distribution enabled/i
];

function safeShortText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength + 1) : "";
}

function containsForbiddenContent(...values: string[]) {
  const candidate = values.join(" ");

  return forbiddenLockboxPatterns.some((pattern) => pattern.test(candidate));
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

function isSafeMetadata(value: string, minLength: number, maxLength: number) {
  return (
    value.length >= minLength &&
    value.length <= maxLength &&
    safeMetadataTextPattern.test(value)
  );
}

export function validateProtectedDistributionLockboxInput(value: unknown):
  | { ok: true; input: ProtectedDistributionLockboxInput }
  | { ok: false; errors: string[] } {
  const record = value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
  const signoffRecordIds = normalizeUuidArray(record.signoffRecordIds);
  const distributionAudience = safeShortText(record.distributionAudience, 80);
  const distributionChannelControl = safeShortText(record.distributionChannelControl, 80);
  const manifestVersion = safeShortText(record.manifestVersion, 40);
  const manifestTitle = safeShortText(record.manifestTitle, 140);
  const artifactManifestLabel = safeShortText(record.artifactManifestLabel, 120);
  const artifactManifestLocator = safeShortText(record.artifactManifestLocator, 140);
  const customerPermissionReference = safeShortText(record.customerPermissionReference, 140);
  const counselReviewReference = safeShortText(record.counselReviewReference, 140);
  const distributionWindowStart = normalizeIsoDate(
    safeShortText(record.distributionWindowStart, 80)
  );
  const distributionWindowEnd = normalizeIsoDate(safeShortText(record.distributionWindowEnd, 80));
  const recipientScope = safeShortText(record.recipientScope, 140);
  const revocationPlan = safeShortText(record.revocationPlan, 180);
  const externalApprovalsRetained = record.externalApprovalsRetained === true;
  const distributionDisabled = record.distributionDisabled === true;
  const attestation = safeShortText(record.attestation, 90);
  const dataBoundary = safeShortText(record.dataBoundary, 90);
  const reviewNote = safeShortText(record.reviewNote, 280);
  const errors: string[] = [];

  if (signoffRecordIds.invalid) {
    errors.push("Lockbox records require one to fourteen valid named reviewer sign-off record ids.");
  }

  if (!protectedDistributionAudiences.includes(distributionAudience as ProtectedDistributionAudience)) {
    errors.push("Distribution audience must be one of the approved lockbox audiences.");
  }

  if (
    !protectedDistributionChannelControls.includes(
      distributionChannelControl as ProtectedDistributionChannelControl
    )
  ) {
    errors.push("Distribution channel control must be one of the approved lockbox controls.");
  }

  if (!manifestVersionPattern.test(manifestVersion)) {
    errors.push("Manifest version must be a short versioned artifact label.");
  }

  if (!isSafeMetadata(manifestTitle, 6, 140)) {
    errors.push("Manifest title must be bounded no-PHI metadata.");
  }

  if (!isSafeMetadata(artifactManifestLabel, 4, 120)) {
    errors.push("Artifact manifest label must describe an externally retained manifest.");
  }

  if (!isSafeMetadata(artifactManifestLocator, 4, 140)) {
    errors.push("Artifact manifest locator must be a bounded external locator, not a URL or secret.");
  }

  if (!isSafeMetadata(customerPermissionReference, 4, 140)) {
    errors.push("Customer permission reference must be a bounded external reference label.");
  }

  if (!isSafeMetadata(counselReviewReference, 4, 140)) {
    errors.push("Counsel review reference must be a bounded external reference label.");
  }

  if (!distributionWindowStart || !distributionWindowEnd) {
    errors.push("Distribution window start and end must be valid dates or timestamps.");
  } else {
    const startTime = new Date(distributionWindowStart).getTime();
    const endTime = new Date(distributionWindowEnd).getTime();
    const now = Date.now();
    const maximum = now + 400 * 24 * 60 * 60 * 1000;

    if (startTime < now - 24 * 60 * 60 * 1000 || endTime <= startTime || endTime > maximum) {
      errors.push("Distribution window must start no earlier than yesterday and end within 400 days.");
    }
  }

  if (!isSafeMetadata(recipientScope, 4, 140)) {
    errors.push("Recipient scope must be bounded non-sensitive distribution metadata.");
  }

  if (!isSafeMetadata(revocationPlan, 8, 180)) {
    errors.push("Revocation plan must be bounded metadata and describe a revocation path.");
  }

  if (!externalApprovalsRetained) {
    errors.push("Lockbox metadata requires external approvals to be retained outside SCRIMED.");
  }

  if (!distributionDisabled) {
    errors.push("Current SCRIMED lockbox mode must remain distribution-disabled.");
  }

  if (attestation !== protectedDistributionLockboxAttestation) {
    errors.push("Distribution lockbox records require the fixed no-PHI metadata attestation.");
  }

  if (dataBoundary !== protectedDistributionLockboxDataBoundary) {
    errors.push("Distribution lockbox records require the synthetic business workflow data boundary.");
  }

  if (reviewNote.length > 280) {
    errors.push("Review note must stay under 280 characters.");
  }

  if (
    containsForbiddenContent(
      ...signoffRecordIds.values,
      distributionAudience,
      distributionChannelControl,
      manifestVersion,
      manifestTitle,
      artifactManifestLabel,
      artifactManifestLocator,
      customerPermissionReference,
      counselReviewReference,
      recipientScope,
      revocationPlan,
      reviewNote
    )
  ) {
    errors.push(
      "Distribution lockbox metadata cannot contain PHI, credentials, secrets, patient identifiers, payer member data, source contracts, signed documents, legal opinions, audited financial claims, securities claims, advertising substantiation, clinical validation, reimbursement guarantees, compliance certification, public release approval, distribution approval, enabled-distribution language, or live clinical execution claims."
    );
  }

  if (errors.length > 0 || !distributionWindowStart || !distributionWindowEnd) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    input: {
      signoffRecordIds: signoffRecordIds.values,
      distributionAudience: distributionAudience as ProtectedDistributionAudience,
      distributionChannelControl: distributionChannelControl as ProtectedDistributionChannelControl,
      manifestVersion,
      manifestTitle,
      artifactManifestLabel,
      artifactManifestLocator,
      customerPermissionReference,
      counselReviewReference,
      distributionWindowStart,
      distributionWindowEnd,
      recipientScope,
      revocationPlan,
      externalApprovalsRetained: true,
      distributionDisabled: true,
      attestation: protectedDistributionLockboxAttestation,
      dataBoundary: protectedDistributionLockboxDataBoundary,
      reviewNote
    }
  };
}

function isSignoffExpired(record: ProtectedNamedReviewerSignoffRecord, now = Date.now()) {
  const expiresTime = new Date(record.expiresAt).getTime();

  return !Number.isFinite(expiresTime) || expiresTime <= now;
}

export function deriveProtectedDistributionLockboxWorkflow({
  records,
  signoffWorkflow,
  unavailableSections = []
}: {
  records: ProtectedDistributionLockboxRecord[];
  signoffWorkflow: ProtectedNamedReviewerSignoffWorkflow | null;
  unavailableSections?: string[];
}): ProtectedDistributionLockboxWorkflow {
  const now = Date.now();
  const availableSignoffs = signoffWorkflow
    ? signoffWorkflow.records.filter(
        (record) => record.externalSignoffRetained && !isSignoffExpired(record, now)
      )
    : [];
  const linkedReviewerRoles = signoffWorkflow?.linkedReviewerRoles ?? [];
  const missingReviewerRoles = signoffWorkflow?.missingReviewerRoles ?? protectedRequiredReviewerRoles;
  const expiredSignoffRoles = signoffWorkflow?.expiredRoles ?? [];
  const readyRecords = records.filter(
    (record) =>
      record.distributionDisabled &&
      record.externalApprovalsRetained &&
      record.lockboxStatus === "ready-for-external-distribution-lockbox-review-not-release-authority" &&
      record.missingReviewerRoles.length === 0 &&
      record.expiredSignoffRoles.length === 0
  );
  const disabledCount = records.filter((record) => record.distributionDisabled).length;
  const retainedBlockerCount = records.reduce(
    (total, record) => total + record.retainedBlockers.length,
    0
  );
  const latestLockbox = records[0] ?? null;
  const signoffReady =
    signoffWorkflow?.controlledDistributionReviewState ===
    "ready-for-controlled-distribution-review-not-release-authority";
  const readyForReview = readyRecords.length > 0 && signoffReady;

  return {
    service: "scrimed-protected-distribution-lockbox",
    status: protectedDistributionLockboxStatus,
    packetStatus: protectedDistributionLockboxPacketProofStackStatus,
    summary: {
      lockboxCount: records.length,
      readyForReviewCount: readyForReview ? readyRecords.length : 0,
      disabledCount,
      requiredReviewerRoleCount: protectedReviewerRoles.length,
      linkedReviewerRoleCount: linkedReviewerRoles.length,
      missingReviewerRoleCount: missingReviewerRoles.length,
      expiredSignoffCount: expiredSignoffRoles.length,
      retainedBlockerCount,
      latestLockboxAt: latestLockbox?.recordedAt ?? null
    },
    lockboxState: readyForReview
      ? "external-distribution-lockbox-review-ready-not-release-authority"
      : records.length > 0
        ? "distribution-lockbox-metadata-recorded"
        : "distribution-lockbox-open",
    distributionState: "external-distribution-disabled",
    requiredReviewerRoles: protectedReviewerRoles,
    linkedReviewerRoles,
    missingReviewerRoles,
    expiredSignoffRoles,
    records,
    signoffSnapshot: {
      service: signoffWorkflow?.service ?? "unavailable",
      status: signoffWorkflow?.status ?? "unavailable",
      signoffState: signoffWorkflow?.signoffState ?? "unavailable",
      controlledDistributionReviewState:
        signoffWorkflow?.controlledDistributionReviewState ?? "unavailable",
      readySignoffSetCount: signoffWorkflow?.summary.readySignoffSetCount ?? 0,
      linkedReviewerRoleCount: signoffWorkflow?.summary.linkedReviewerRoleCount ?? 0,
      missingReviewerRoleCount: signoffWorkflow?.summary.missingReviewerRoleCount ?? 0,
      expiredCount: signoffWorkflow?.summary.expiredCount ?? 0,
      latestSignoffAt: signoffWorkflow?.summary.latestSignoffAt ?? null
    },
    availableSignoffs,
    authorities: {
      lockboxAuthority: protectedDistributionLockboxAuthority,
      releaseAuthority: protectedDistributionLockboxReleaseAuthority,
      storageAuthority: protectedDistributionLockboxStorageAuthority,
      approvalScope: protectedDistributionLockboxApprovalScope,
      signoffAuthority: protectedNamedReviewerSignoffAuthority,
      signoffReleaseAuthority: protectedReviewerSignoffReleaseAuthority,
      signoffStorageAuthority: protectedReviewerSignoffStorageAuthority,
      releaseDecisionAuthority: protectedReleaseDecisionAuthority,
      financeExternalUseAuthority: protectedFinanceExternalUseAuthority,
      financialReportingAuthority: protectedMetricRollupFinancialAuthority,
      securitiesAuthority: protectedMetricRollupSecuritiesAuthority,
      advertisingClaimsAuthority: protectedFinanceAdvertisingClaimsAuthority,
      clinicalExecutionAuthority: protectedMetricRollupClinicalAuthority
    },
    safeWorkarounds: [
      "Keep actual artifacts, signatures, legal opinions, customer permissions, recipient lists, and distribution approvals in qualified external systems; SCRIMED stores no-PHI metadata references only.",
      "Use lockbox readiness as an internal operator control, not authorization to publicly release, sell with unreviewed claims, disclose customer proof, or execute live clinical workflows.",
      "Keep distribution disabled when reviewer roles are missing, sign-offs expire, claim versions change, customer permissions are absent, or counsel review is not retained externally.",
      "Regenerate buyer, investor, sales, marketing, PR, and case-study packets from approved internal sources only after the external distribution scope is re-reviewed."
    ],
    unavailableSections,
    boundary: `${protectedDistributionLockboxBoundary} ${protectedNamedReviewerSignoffBoundary}`,
    updated: "2026-06-20"
  };
}

function linesForDistributionLockbox(record: ProtectedDistributionLockboxRecord) {
  return [
    `### ${record.manifestVersion} - ${record.distributionAudience}`,
    `- Lockbox status: ${record.lockboxStatus}`,
    `- Distribution state: ${record.distributionDisabled ? "external-distribution-disabled" : "blocked"}`,
    `- Channel control: ${record.distributionChannelControl}`,
    `- Manifest title: ${record.manifestTitle}`,
    `- Artifact manifest label: ${record.artifactManifestLabel}`,
    `- Artifact manifest locator: ${record.artifactManifestLocator}`,
    `- Customer permission reference: ${record.customerPermissionReference}`,
    `- Counsel review reference: ${record.counselReviewReference}`,
    `- Distribution window: ${record.distributionWindowStart} to ${record.distributionWindowEnd}`,
    `- Recipient scope: ${record.recipientScope}`,
    `- Revocation plan: ${record.revocationPlan}`,
    `- External approvals retained: ${record.externalApprovalsRetained ? "yes" : "no"}`,
    `- Approval scope: ${record.approvalScope}`,
    `- Lockbox authority: ${record.lockboxAuthority}`,
    `- Release authority: ${record.releaseAuthority}`,
    `- Storage authority: ${record.storageAuthority}`,
    `- Review note: ${record.reviewNote || "none"}`,
    `- Recorded at: ${record.recordedAt}`,
    `- Boundary: ${record.boundary}`,
    "- Sign-off record ids:",
    ...record.signoffRecordIds.map((id) => `  - ${id}`),
    "- Missing reviewer roles:",
    ...(record.missingReviewerRoles.length
      ? record.missingReviewerRoles.map((role) => `  - ${role}`)
      : ["  - none"]),
    "- Expired sign-off roles:",
    ...(record.expiredSignoffRoles.length
      ? record.expiredSignoffRoles.map((role) => `  - ${role}`)
      : ["  - none"]),
    "- Retained blockers:",
    ...record.retainedBlockers.map((blocker) => `  - ${blocker}`),
    "- Release restrictions:",
    ...record.releaseRestrictions.map((restriction) => `  - ${restriction}`)
  ];
}

export function buildProtectedDistributionLockboxPacket({
  actorUserId,
  auditEventId,
  generatedAt,
  workflow,
  workspace
}: {
  actorUserId: string;
  auditEventId?: string | null;
  generatedAt: string;
  workflow: ProtectedDistributionLockboxWorkflow;
  workspace: PilotWorkspaceRecord;
}) {
  return [
    "# SCRIMED Protected Distribution Lockbox Packet",
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
    `Lockbox authority: ${workflow.authorities.lockboxAuthority}`,
    `Release authority: ${workflow.authorities.releaseAuthority}`,
    `Storage authority: ${workflow.authorities.storageAuthority}`,
    `Approval scope: ${workflow.authorities.approvalScope}`,
    `Sign-off authority: ${workflow.authorities.signoffAuthority}`,
    `Sign-off release authority: ${workflow.authorities.signoffReleaseAuthority}`,
    `Sign-off storage authority: ${workflow.authorities.signoffStorageAuthority}`,
    `Release decision authority: ${workflow.authorities.releaseDecisionAuthority}`,
    `Finance external-use authority: ${workflow.authorities.financeExternalUseAuthority}`,
    `Financial reporting authority: ${workflow.authorities.financialReportingAuthority}`,
    `Securities authority: ${workflow.authorities.securitiesAuthority}`,
    `Advertising claims authority: ${workflow.authorities.advertisingClaimsAuthority}`,
    `Clinical execution authority: ${workflow.authorities.clinicalExecutionAuthority}`,
    "",
    "## Summary",
    `- Lockbox state: ${workflow.lockboxState}`,
    `- Distribution state: ${workflow.distributionState}`,
    `- Lockbox records: ${workflow.summary.lockboxCount}`,
    `- Ready for lockbox review: ${workflow.summary.readyForReviewCount}`,
    `- Disabled records: ${workflow.summary.disabledCount}`,
    `- Required reviewer roles: ${workflow.summary.requiredReviewerRoleCount}`,
    `- Linked reviewer roles: ${workflow.summary.linkedReviewerRoleCount}`,
    `- Missing reviewer roles: ${workflow.summary.missingReviewerRoleCount}`,
    `- Expired sign-off roles: ${workflow.summary.expiredSignoffCount}`,
    `- Retained blockers: ${workflow.summary.retainedBlockerCount}`,
    `- Latest lockbox: ${workflow.summary.latestLockboxAt ?? "not recorded"}`,
    "",
    "## Named Reviewer Snapshot",
    `- Sign-off service: ${workflow.signoffSnapshot.service}`,
    `- Sign-off status: ${workflow.signoffSnapshot.status}`,
    `- Sign-off state: ${workflow.signoffSnapshot.signoffState}`,
    `- Controlled distribution review: ${workflow.signoffSnapshot.controlledDistributionReviewState}`,
    `- Ready sign-off sets: ${workflow.signoffSnapshot.readySignoffSetCount}`,
    `- Linked reviewer roles: ${workflow.signoffSnapshot.linkedReviewerRoleCount}`,
    `- Missing reviewer roles: ${workflow.signoffSnapshot.missingReviewerRoleCount}`,
    `- Expired sign-offs: ${workflow.signoffSnapshot.expiredCount}`,
    `- Latest sign-off: ${workflow.signoffSnapshot.latestSignoffAt ?? "not recorded"}`,
    "",
    "## Required Reviewer Roles",
    ...workflow.requiredReviewerRoles.map(
      (role) => `- ${role.id}: ${role.label} (${role.domain}) - ${role.requiredScope}`
    ),
    "",
    "## Missing Reviewer Roles",
    ...(workflow.missingReviewerRoles.length
      ? workflow.missingReviewerRoles.map((role) => `- ${role}`)
      : ["- None recorded."]),
    "",
    "## Lockbox Records",
    ...(workflow.records.length
      ? workflow.records.flatMap(linesForDistributionLockbox)
      : ["- No protected distribution lockbox metadata recorded."]),
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
    "- Distribution remains disabled by design in the current SCRIMED pilot boundary.",
    "- Lockbox metadata is not public release approval, external distribution approval, legal approval, audited financial reporting, advertising substantiation, customer permission, compliance certification, production authorization, clinical validation, reimbursement assurance, or live clinical execution authority.",
    "- Actual artifacts, signatures, approvals, recipient lists, customer permissions, and counsel-reviewed scopes must be retained externally and independently reviewed before any distribution decision.",
    "- Expired, missing, claim-version-mismatched, or externally unretained reviewer metadata must block distribution and trigger re-review.",
    "",
    `Updated: ${workflow.updated}`
  ].join("\n");
}
