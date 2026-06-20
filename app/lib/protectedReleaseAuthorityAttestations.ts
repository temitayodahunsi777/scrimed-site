import {
  protectedDistributionLockboxAuthority,
  protectedDistributionLockboxBoundary,
  protectedDistributionLockboxDataBoundary,
  protectedDistributionLockboxReleaseAuthority,
  protectedDistributionLockboxStatus,
  protectedDistributionLockboxStorageAuthority,
  type ProtectedDistributionAudience,
  type ProtectedDistributionLockboxRecord,
  type ProtectedDistributionLockboxWorkflow
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
import { protectedReleaseDecisionAuthority } from "./protectedReleaseDecisionWorkflow";

export const protectedReleaseAuthorityAttestationStatus =
  "aal2-external-release-authority-attestations-disabled-no-phi";
export const protectedReleaseAuthorityAttestationPacketProofStackStatus =
  "aal2-audited-release-authority-attestation-packets-no-phi";
export const protectedReleaseAuthorityAttestationAttestation =
  "external-release-authority-attestation-metadata-no-phi";
export const protectedReleaseAuthorityAttestationDataBoundary =
  protectedDistributionLockboxDataBoundary;
export const protectedReleaseAuthorityAttestationAuthority =
  "external-release-authority-reference-not-approval";
export const protectedReleaseAuthorityReleaseAuthority =
  "release-disabled-pending-executed-external-authority";
export const protectedReleaseAuthorityAttestationStorageAuthority =
  "authority-metadata-only-no-sensitive-documents";
export const protectedReleaseAuthorityAttestationApprovalScope =
  "release-authority-attestation-review-readiness-only";
export const protectedReleaseAuthorityAttestationBoundary =
  "Protected Release Authority Attestations record disabled-by-default no-PHI metadata references to externally retained counsel, customer permission, executive, privacy/security, finance, clinical-governance, and marketing-claims release authority. They do not store PHI, patient identifiers, payer member data, live clinical records, source contracts, secrets, credentials, signed approvals, signed BAAs/DPAs, legal opinions, audited financial statements, securities offering material, investment advice, accounting advice, tax advice, valuation assurance, revenue guarantee, reimbursement assurance, advertising claim substantiation, clinical validation, compliance certification, customer permission artifacts, public release approval, external distribution approval, production authorization, or live clinical execution approval.";

export type ProtectedReleaseAuthorityDomain =
  | "qualified-counsel"
  | "customer-permission-owner"
  | "executive-sponsor"
  | "privacy-security-owner"
  | "finance-owner"
  | "clinical-governance-owner"
  | "marketing-claims-owner";

export const protectedReleaseAuthorityDomains: Array<{
  id: ProtectedReleaseAuthorityDomain;
  label: string;
  requiredScope: string;
}> = [
  {
    id: "qualified-counsel",
    label: "Qualified counsel",
    requiredScope: "Counsel-reviewed distribution scope, release wording, and channel controls retained externally."
  },
  {
    id: "customer-permission-owner",
    label: "Customer permission owner",
    requiredScope: "Customer proof, logo, reference, case-study, or benchmark permission retained externally."
  },
  {
    id: "executive-sponsor",
    label: "Executive sponsor",
    requiredScope: "Executive release owner confirms business purpose, recipient scope, and revocation posture."
  },
  {
    id: "privacy-security-owner",
    label: "Privacy and security owner",
    requiredScope: "Privacy, security, no-PHI, credential, and recipient-control review retained externally."
  },
  {
    id: "finance-owner",
    label: "Finance owner",
    requiredScope: "Finance owner confirms no audited financial reporting, guarantee, or securities use."
  },
  {
    id: "clinical-governance-owner",
    label: "Clinical governance owner",
    requiredScope: "Clinical boundary, non-diagnostic language, and no live-care authority reviewed."
  },
  {
    id: "marketing-claims-owner",
    label: "Marketing claims owner",
    requiredScope: "Marketing, sales, PR, and advertising claim wording retained externally."
  }
] as const;

export const protectedRequiredReleaseAuthorityDomains =
  protectedReleaseAuthorityDomains.map((domain) => domain.id);

export type ProtectedReleaseAuthorityAttestationStatus =
  | "release-authority-metadata-recorded"
  | "distribution-lockbox-linked"
  | "all-release-authority-metadata-complete-not-release-approval"
  | "blocked"
  | "not-recorded";

export type ProtectedReleaseAuthorityAttestationInput = {
  lockboxRecordIds: string[];
  authorityDomain: ProtectedReleaseAuthorityDomain;
  distributionAudience: ProtectedDistributionAudience;
  releaseAuthorityReferenceLabel: string;
  releaseAuthorityReferenceLocator: string;
  authorityOwnerLabel: string;
  attestedManifestVersion: string;
  authorityWindowStart: string;
  authorityWindowEnd: string;
  releaseScope: string;
  revocationTrigger: string;
  externalAuthorityRetained: true;
  releaseDisabled: true;
  attestation: typeof protectedReleaseAuthorityAttestationAttestation;
  dataBoundary: typeof protectedReleaseAuthorityAttestationDataBoundary;
  reviewNote: string;
};

export type ProtectedReleaseAuthorityAttestationRecord = {
  id: string;
  tenantId: string;
  workspaceId: string;
  authorityDomain: ProtectedReleaseAuthorityDomain;
  authorityDomainLabel: string;
  attestationStatus: Exclude<ProtectedReleaseAuthorityAttestationStatus, "not-recorded">;
  approvalScope: typeof protectedReleaseAuthorityAttestationApprovalScope;
  distributionAudience: ProtectedDistributionAudience;
  releaseAuthorityReferenceLabel: string;
  releaseAuthorityReferenceLocator: string;
  authorityOwnerLabel: string;
  attestedManifestVersion: string;
  authorityWindowStart: string;
  authorityWindowEnd: string;
  releaseScope: string;
  revocationTrigger: string;
  lockboxRecordIds: string[];
  evidenceSnapshot: Record<string, unknown>;
  requiredAuthorityDomains: ProtectedReleaseAuthorityDomain[];
  linkedAuthorityDomains: ProtectedReleaseAuthorityDomain[];
  missingAuthorityDomains: ProtectedReleaseAuthorityDomain[];
  retainedBlockers: string[];
  releaseRestrictions: string[];
  externalAuthorityRetained: boolean;
  releaseDisabled: boolean;
  attestation: typeof protectedReleaseAuthorityAttestationAttestation;
  reviewNote: string;
  dataBoundary: typeof protectedReleaseAuthorityAttestationDataBoundary;
  attestationAuthority: typeof protectedReleaseAuthorityAttestationAuthority;
  releaseAuthority: typeof protectedReleaseAuthorityReleaseAuthority;
  storageAuthority: typeof protectedReleaseAuthorityAttestationStorageAuthority;
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

export type ProtectedReleaseAuthorityAttestationWorkflow = {
  service: "scrimed-protected-release-authority-attestations";
  status: typeof protectedReleaseAuthorityAttestationStatus;
  packetStatus: typeof protectedReleaseAuthorityAttestationPacketProofStackStatus;
  summary: {
    attestationCount: number;
    readyForReviewCount: number;
    releaseDisabledCount: number;
    requiredAuthorityDomainCount: number;
    linkedAuthorityDomainCount: number;
    missingAuthorityDomainCount: number;
    readyLockboxCount: number;
    retainedBlockerCount: number;
    latestAttestationAt: string | null;
  };
  authorityState:
    | "release-authority-open"
    | "release-authority-metadata-recorded"
    | "release-authority-review-ready-not-release-approval";
  releaseState:
    | "release-disabled"
    | "blocked-pending-lockbox-and-authority";
  requiredAuthorityDomains: typeof protectedReleaseAuthorityDomains;
  linkedAuthorityDomains: ProtectedReleaseAuthorityDomain[];
  missingAuthorityDomains: ProtectedReleaseAuthorityDomain[];
  records: ProtectedReleaseAuthorityAttestationRecord[];
  availableLockboxes: ProtectedDistributionLockboxRecord[];
  lockboxSnapshot: {
    service: ProtectedDistributionLockboxWorkflow["service"] | "unavailable";
    status: typeof protectedDistributionLockboxStatus | "unavailable";
    lockboxState: ProtectedDistributionLockboxWorkflow["lockboxState"] | "unavailable";
    distributionState: ProtectedDistributionLockboxWorkflow["distributionState"] | "unavailable";
    readyForReviewCount: number;
    latestLockboxAt: string | null;
  };
  authorities: {
    attestationAuthority: typeof protectedReleaseAuthorityAttestationAuthority;
    releaseAuthority: typeof protectedReleaseAuthorityReleaseAuthority;
    storageAuthority: typeof protectedReleaseAuthorityAttestationStorageAuthority;
    approvalScope: typeof protectedReleaseAuthorityAttestationApprovalScope;
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
const manifestVersionPattern = /^[A-Za-z0-9][A-Za-z0-9._:-]{1,39}$/;

const forbiddenReleaseAuthorityPatterns = [
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
  /external distribution approved/i,
  /release approved/i,
  /release enabled/i
];

function safeShortText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength + 1) : "";
}

function containsForbiddenContent(...values: string[]) {
  const candidate = values.join(" ");

  return forbiddenReleaseAuthorityPatterns.some((pattern) => pattern.test(candidate));
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

function getAuthorityDomain(value: string) {
  return protectedReleaseAuthorityDomains.find((domain) => domain.id === value) ?? null;
}

export function validateProtectedReleaseAuthorityAttestationInput(value: unknown):
  | { ok: true; input: ProtectedReleaseAuthorityAttestationInput }
  | { ok: false; errors: string[] } {
  const record = value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
  const lockboxRecordIds = normalizeUuidArray(record.lockboxRecordIds);
  const authorityDomain = safeShortText(record.authorityDomain, 80);
  const distributionAudience = safeShortText(record.distributionAudience, 80);
  const releaseAuthorityReferenceLabel = safeShortText(record.releaseAuthorityReferenceLabel, 140);
  const releaseAuthorityReferenceLocator = safeShortText(record.releaseAuthorityReferenceLocator, 140);
  const authorityOwnerLabel = safeShortText(record.authorityOwnerLabel, 100);
  const attestedManifestVersion = safeShortText(record.attestedManifestVersion, 40);
  const authorityWindowStart = normalizeIsoDate(safeShortText(record.authorityWindowStart, 80));
  const authorityWindowEnd = normalizeIsoDate(safeShortText(record.authorityWindowEnd, 80));
  const releaseScope = safeShortText(record.releaseScope, 160);
  const revocationTrigger = safeShortText(record.revocationTrigger, 180);
  const externalAuthorityRetained = record.externalAuthorityRetained === true;
  const releaseDisabled = record.releaseDisabled === true;
  const attestation = safeShortText(record.attestation, 100);
  const dataBoundary = safeShortText(record.dataBoundary, 90);
  const reviewNote = safeShortText(record.reviewNote, 280);
  const domain = getAuthorityDomain(authorityDomain);
  const errors: string[] = [];

  if (lockboxRecordIds.invalid) {
    errors.push("Release authority attestations require one to fourteen valid distribution lockbox record ids.");
  }

  if (!domain) {
    errors.push("Authority domain must be one of the approved release-authority domains.");
  }

  if (
    ![
      "buyer-diligence-room",
      "investor-data-room",
      "board-room",
      "sales-collateral-channel",
      "marketing-site-release",
      "public-relations-channel",
      "customer-case-study-channel"
    ].includes(distributionAudience)
  ) {
    errors.push("Distribution audience must match an approved lockbox audience.");
  }

  if (!isSafeMetadata(releaseAuthorityReferenceLabel, 4, 140)) {
    errors.push("Release authority reference label must be bounded no-PHI metadata.");
  }

  if (!isSafeMetadata(releaseAuthorityReferenceLocator, 4, 140)) {
    errors.push("Release authority reference locator must be a bounded external locator.");
  }

  if (!isSafeMetadata(authorityOwnerLabel, 3, 100)) {
    errors.push("Authority owner label must be bounded non-sensitive metadata.");
  }

  if (!manifestVersionPattern.test(attestedManifestVersion)) {
    errors.push("Attested manifest version must be a short versioned label.");
  }

  if (!authorityWindowStart || !authorityWindowEnd) {
    errors.push("Authority window start and end must be valid dates or timestamps.");
  } else {
    const startTime = new Date(authorityWindowStart).getTime();
    const endTime = new Date(authorityWindowEnd).getTime();
    const now = Date.now();
    const maximum = now + 400 * 24 * 60 * 60 * 1000;

    if (startTime < now - 24 * 60 * 60 * 1000 || endTime <= startTime || endTime > maximum) {
      errors.push("Authority window must start no earlier than yesterday and end within 400 days.");
    }
  }

  if (!isSafeMetadata(releaseScope, 6, 160)) {
    errors.push("Release scope must be bounded no-PHI metadata.");
  }

  if (!isSafeMetadata(revocationTrigger, 8, 180)) {
    errors.push("Revocation trigger must describe a bounded rollback/re-review condition.");
  }

  if (!externalAuthorityRetained) {
    errors.push("Release authority metadata requires external authority to be retained outside SCRIMED.");
  }

  if (!releaseDisabled) {
    errors.push("Current SCRIMED release authority mode must remain release-disabled.");
  }

  if (attestation !== protectedReleaseAuthorityAttestationAttestation) {
    errors.push("Release authority attestations require the fixed no-PHI metadata attestation.");
  }

  if (dataBoundary !== protectedReleaseAuthorityAttestationDataBoundary) {
    errors.push("Release authority attestations require the synthetic business workflow data boundary.");
  }

  if (reviewNote.length > 280) {
    errors.push("Review note must stay under 280 characters.");
  }

  if (
    containsForbiddenContent(
      ...lockboxRecordIds.values,
      authorityDomain,
      distributionAudience,
      releaseAuthorityReferenceLabel,
      releaseAuthorityReferenceLocator,
      authorityOwnerLabel,
      attestedManifestVersion,
      releaseScope,
      revocationTrigger,
      reviewNote
    )
  ) {
    errors.push(
      "Release authority metadata cannot contain PHI, credentials, secrets, patient identifiers, payer member data, source contracts, signed documents, legal opinions, audited financial claims, securities claims, advertising substantiation, clinical validation, reimbursement guarantees, compliance certification, public release approval, distribution approval, enabled-release language, or live clinical execution claims."
    );
  }

  if (errors.length > 0 || !authorityWindowStart || !authorityWindowEnd || !domain) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    input: {
      lockboxRecordIds: lockboxRecordIds.values,
      authorityDomain: domain.id,
      distributionAudience: distributionAudience as ProtectedDistributionAudience,
      releaseAuthorityReferenceLabel,
      releaseAuthorityReferenceLocator,
      authorityOwnerLabel,
      attestedManifestVersion,
      authorityWindowStart,
      authorityWindowEnd,
      releaseScope,
      revocationTrigger,
      externalAuthorityRetained: true,
      releaseDisabled: true,
      attestation: protectedReleaseAuthorityAttestationAttestation,
      dataBoundary: protectedReleaseAuthorityAttestationDataBoundary,
      reviewNote
    }
  };
}

export function deriveProtectedReleaseAuthorityAttestationWorkflow({
  lockboxWorkflow,
  records,
  unavailableSections = []
}: {
  lockboxWorkflow: ProtectedDistributionLockboxWorkflow | null;
  records: ProtectedReleaseAuthorityAttestationRecord[];
  unavailableSections?: string[];
}): ProtectedReleaseAuthorityAttestationWorkflow {
  const availableLockboxes = lockboxWorkflow
    ? lockboxWorkflow.records.filter(
        (record) =>
          record.distributionDisabled &&
          record.externalApprovalsRetained &&
          record.lockboxStatus === "ready-for-external-distribution-lockbox-review-not-release-authority"
      )
    : [];
  const activeRecords = records.filter(
    (record) => record.externalAuthorityRetained && record.releaseDisabled
  );
  const linkedAuthorityDomains = protectedRequiredReleaseAuthorityDomains.filter((domain) =>
    activeRecords.some((record) => record.authorityDomain === domain)
  );
  const missingAuthorityDomains = protectedRequiredReleaseAuthorityDomains.filter(
    (domain) => !linkedAuthorityDomains.includes(domain)
  );
  const readyRecords = activeRecords.filter(
    (record) =>
      record.attestationStatus === "all-release-authority-metadata-complete-not-release-approval" &&
      record.missingAuthorityDomains.length === 0
  );
  const retainedBlockerCount = records.reduce(
    (total, record) => total + record.retainedBlockers.length,
    0
  );
  const latestAttestation = records[0] ?? null;
  const readyForReview = readyRecords.length > 0 && availableLockboxes.length > 0;

  return {
    service: "scrimed-protected-release-authority-attestations",
    status: protectedReleaseAuthorityAttestationStatus,
    packetStatus: protectedReleaseAuthorityAttestationPacketProofStackStatus,
    summary: {
      attestationCount: records.length,
      readyForReviewCount: readyForReview ? readyRecords.length : 0,
      releaseDisabledCount: records.filter((record) => record.releaseDisabled).length,
      requiredAuthorityDomainCount: protectedReleaseAuthorityDomains.length,
      linkedAuthorityDomainCount: linkedAuthorityDomains.length,
      missingAuthorityDomainCount: missingAuthorityDomains.length,
      readyLockboxCount: availableLockboxes.length,
      retainedBlockerCount,
      latestAttestationAt: latestAttestation?.recordedAt ?? null
    },
    authorityState: readyForReview
      ? "release-authority-review-ready-not-release-approval"
      : records.length > 0
        ? "release-authority-metadata-recorded"
        : "release-authority-open",
    releaseState: "release-disabled",
    requiredAuthorityDomains: protectedReleaseAuthorityDomains,
    linkedAuthorityDomains,
    missingAuthorityDomains,
    records,
    availableLockboxes,
    lockboxSnapshot: {
      service: lockboxWorkflow?.service ?? "unavailable",
      status: lockboxWorkflow?.status ?? "unavailable",
      lockboxState: lockboxWorkflow?.lockboxState ?? "unavailable",
      distributionState: lockboxWorkflow?.distributionState ?? "unavailable",
      readyForReviewCount: lockboxWorkflow?.summary.readyForReviewCount ?? 0,
      latestLockboxAt: lockboxWorkflow?.summary.latestLockboxAt ?? null
    },
    authorities: {
      attestationAuthority: protectedReleaseAuthorityAttestationAuthority,
      releaseAuthority: protectedReleaseAuthorityReleaseAuthority,
      storageAuthority: protectedReleaseAuthorityAttestationStorageAuthority,
      approvalScope: protectedReleaseAuthorityAttestationApprovalScope,
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
      "Retain actual release approvals, signatures, legal opinions, customer permissions, recipient lists, and authority artifacts in approved external systems; SCRIMED stores metadata references only.",
      "Use release-authority readiness as an internal diligence control, not authorization to distribute, advertise, report financials, use customer proof, or execute clinical workflows.",
      "Keep release disabled when any authority domain is missing, lockbox metadata is not ready, release scope changes, customer permission expires, or counsel review is not externally retained.",
      "Re-run lockbox, release decision, and named reviewer workflows when claim wording, audience, recipient scope, channel control, or artifact manifest version changes."
    ],
    unavailableSections,
    boundary: `${protectedReleaseAuthorityAttestationBoundary} ${protectedDistributionLockboxBoundary}`,
    updated: "2026-06-20"
  };
}

function linesForReleaseAuthorityAttestation(record: ProtectedReleaseAuthorityAttestationRecord) {
  return [
    `### ${record.authorityDomainLabel} - ${record.attestedManifestVersion}`,
    `- Attestation status: ${record.attestationStatus}`,
    `- Distribution audience: ${record.distributionAudience}`,
    `- Release scope: ${record.releaseScope}`,
    `- Authority owner label: ${record.authorityOwnerLabel}`,
    `- External reference label: ${record.releaseAuthorityReferenceLabel}`,
    `- External reference locator: ${record.releaseAuthorityReferenceLocator}`,
    `- Authority window: ${record.authorityWindowStart} to ${record.authorityWindowEnd}`,
    `- Revocation trigger: ${record.revocationTrigger}`,
    `- External authority retained: ${record.externalAuthorityRetained ? "yes" : "no"}`,
    `- Release disabled: ${record.releaseDisabled ? "yes" : "no"}`,
    `- Approval scope: ${record.approvalScope}`,
    `- Attestation authority: ${record.attestationAuthority}`,
    `- Release authority: ${record.releaseAuthority}`,
    `- Storage authority: ${record.storageAuthority}`,
    `- Review note: ${record.reviewNote || "none"}`,
    `- Recorded at: ${record.recordedAt}`,
    `- Boundary: ${record.boundary}`,
    "- Lockbox record ids:",
    ...record.lockboxRecordIds.map((id) => `  - ${id}`),
    "- Missing authority domains:",
    ...(record.missingAuthorityDomains.length
      ? record.missingAuthorityDomains.map((domain) => `  - ${domain}`)
      : ["  - none"]),
    "- Retained blockers:",
    ...record.retainedBlockers.map((blocker) => `  - ${blocker}`),
    "- Release restrictions:",
    ...record.releaseRestrictions.map((restriction) => `  - ${restriction}`)
  ];
}

export function buildProtectedReleaseAuthorityAttestationPacket({
  actorUserId,
  auditEventId,
  generatedAt,
  workflow,
  workspace
}: {
  actorUserId: string;
  auditEventId?: string | null;
  generatedAt: string;
  workflow: ProtectedReleaseAuthorityAttestationWorkflow;
  workspace: PilotWorkspaceRecord;
}) {
  return [
    "# SCRIMED Protected Release Authority Attestation Packet",
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
    `Attestation authority: ${workflow.authorities.attestationAuthority}`,
    `Release authority: ${workflow.authorities.releaseAuthority}`,
    `Storage authority: ${workflow.authorities.storageAuthority}`,
    `Approval scope: ${workflow.authorities.approvalScope}`,
    `Lockbox authority: ${workflow.authorities.lockboxAuthority}`,
    `Lockbox release authority: ${workflow.authorities.lockboxReleaseAuthority}`,
    `Release decision authority: ${workflow.authorities.releaseDecisionAuthority}`,
    `Finance external-use authority: ${workflow.authorities.financeExternalUseAuthority}`,
    `Financial reporting authority: ${workflow.authorities.financialReportingAuthority}`,
    `Securities authority: ${workflow.authorities.securitiesAuthority}`,
    `Advertising claims authority: ${workflow.authorities.advertisingClaimsAuthority}`,
    `Clinical execution authority: ${workflow.authorities.clinicalExecutionAuthority}`,
    "",
    "## Summary",
    `- Authority state: ${workflow.authorityState}`,
    `- Release state: ${workflow.releaseState}`,
    `- Attestations: ${workflow.summary.attestationCount}`,
    `- Ready for review: ${workflow.summary.readyForReviewCount}`,
    `- Release-disabled records: ${workflow.summary.releaseDisabledCount}`,
    `- Required authority domains: ${workflow.summary.requiredAuthorityDomainCount}`,
    `- Linked authority domains: ${workflow.summary.linkedAuthorityDomainCount}`,
    `- Missing authority domains: ${workflow.summary.missingAuthorityDomainCount}`,
    `- Ready lockboxes: ${workflow.summary.readyLockboxCount}`,
    `- Retained blockers: ${workflow.summary.retainedBlockerCount}`,
    `- Latest attestation: ${workflow.summary.latestAttestationAt ?? "not recorded"}`,
    "",
    "## Lockbox Snapshot",
    `- Lockbox service: ${workflow.lockboxSnapshot.service}`,
    `- Lockbox status: ${workflow.lockboxSnapshot.status}`,
    `- Lockbox state: ${workflow.lockboxSnapshot.lockboxState}`,
    `- Distribution state: ${workflow.lockboxSnapshot.distributionState}`,
    `- Ready lockboxes: ${workflow.lockboxSnapshot.readyForReviewCount}`,
    `- Latest lockbox: ${workflow.lockboxSnapshot.latestLockboxAt ?? "not recorded"}`,
    "",
    "## Required Authority Domains",
    ...workflow.requiredAuthorityDomains.map(
      (domain) => `- ${domain.id}: ${domain.label} - ${domain.requiredScope}`
    ),
    "",
    "## Missing Authority Domains",
    ...(workflow.missingAuthorityDomains.length
      ? workflow.missingAuthorityDomains.map((domain) => `- ${domain}`)
      : ["- None recorded."]),
    "",
    "## Attestation Records",
    ...(workflow.records.length
      ? workflow.records.flatMap(linesForReleaseAuthorityAttestation)
      : ["- No protected release authority metadata recorded."]),
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
    "- Release remains disabled by design in the current SCRIMED pilot boundary.",
    "- Release authority metadata is not public release approval, external distribution approval, legal approval, audited financial reporting, advertising substantiation, customer permission, compliance certification, production authorization, clinical validation, reimbursement assurance, or live clinical execution authority.",
    "- Actual signed approvals, legal opinions, customer permissions, recipient lists, and distribution artifacts must be retained externally and independently reviewed before any release decision.",
    "",
    `Updated: ${workflow.updated}`
  ].join("\n");
}
