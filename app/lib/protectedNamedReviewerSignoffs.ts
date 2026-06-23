import {
  protectedReleaseDecisionAuthority,
  protectedReleaseDecisionBoundary,
  protectedReleaseDecisionWorkflowStatus,
  type ProtectedReleaseDecisionRecord,
  type ProtectedReleaseDecisionWorkflow
} from "./protectedReleaseDecisionWorkflow";
import {
  protectedMetricRollupClinicalAuthority,
  protectedMetricRollupDataBoundary,
  protectedMetricRollupFinancialAuthority,
  protectedMetricRollupSecuritiesAuthority
} from "./protectedMetricRollups";
import {
  protectedFinanceAdvertisingClaimsAuthority,
  protectedFinanceExternalUseAuthority
} from "./protectedFinanceMethodology";
import type { PilotWorkspaceRecord } from "./protectedPilotWorkspace";

export const protectedNamedReviewerSignoffStatus =
  "aal2-named-reviewer-signoff-metadata-no-phi";
export const protectedNamedReviewerSignoffPacketProofStackStatus =
  "aal2-audited-named-reviewer-signoff-packets-no-phi";
export const protectedNamedReviewerSignoffAttestation =
  "named-reviewer-signoff-metadata-no-phi";
export const protectedNamedReviewerSignoffDataBoundary = protectedMetricRollupDataBoundary;
export const protectedNamedReviewerSignoffAuthority =
  "named-reviewer-metadata-not-approval";
export const protectedReviewerSignoffReleaseAuthority =
  "controlled-distribution-review-not-release-authority";
export const protectedReviewerSignoffStorageAuthority =
  "no-sensitive-signature-document-storage";
export const protectedReviewerSignoffApprovalScope =
  "controlled-distribution-review-readiness-only";
export const protectedNamedReviewerSignoffBoundary =
  "Protected Named Reviewer Sign-Off Packets record bounded no-PHI metadata references to externally retained reviewer sign-offs for claim versions and distribution scopes. They do not store PHI, patient identifiers, payer member data, live clinical records, source contracts, secrets, credentials, signed BAAs/DPAs, legal opinions, audited financial statements, securities offering material, investment advice, accounting advice, tax advice, valuation assurance, revenue guarantee, reimbursement assurance, advertising claim substantiation, clinical validation, compliance certification, customer permission artifacts, public release approval, production authorization, or live clinical execution approval.";

export const protectedReviewerRoles = [
  {
    id: "finance-reviewer",
    label: "Finance reviewer",
    domain: "finance-methodology-policy",
    requiredScope:
      "Cost, KPI, margin, operating metric, and unit-economics language is externally reviewed."
  },
  {
    id: "qualified-counsel",
    label: "Qualified counsel",
    domain: "counsel-external-use-review",
    requiredScope:
      "Legal, distribution, securities, customer-reference, and advertising-risk language is externally reviewed."
  },
  {
    id: "executive-sponsor",
    label: "Executive sponsor",
    domain: "executive-release-review",
    requiredScope:
      "SCRIMED executive owner reviews audience, channel, timing, and business use before controlled review."
  },
  {
    id: "privacy-security-owner",
    label: "Privacy and security owner",
    domain: "privacy-security-review",
    requiredScope:
      "Privacy, security, no-PHI, credential, access-control, and data-handling boundaries are externally retained."
  },
  {
    id: "clinical-governance-owner",
    label: "Clinical governance owner",
    domain: "clinical-governance-boundary-review",
    requiredScope:
      "Clinical boundary, non-diagnostic language, human review, and live-care blockers are reviewed."
  },
  {
    id: "marketing-claims-owner",
    label: "Marketing claims owner",
    domain: "marketing-claims-review",
    requiredScope:
      "Marketing, PR, sales, website, and value-proposition claims are versioned and reviewed."
  },
  {
    id: "buyer-permission-owner",
    label: "Buyer permission owner",
    domain: "buyer-permission-review",
    requiredScope:
      "Customer proof, logos, case-study language, benchmark references, and buyer permission gates are reviewed."
  }
] as const;

export type ProtectedReviewerRole = (typeof protectedReviewerRoles)[number]["id"];

export type ProtectedNamedReviewerSignoffStatus =
  | "signoff-metadata-recorded"
  | "release-decision-linked"
  | "all-domain-signoff-metadata-complete-not-release-authority"
  | "blocked"
  | "not-recorded";

export type ProtectedNamedReviewerSignoffInput = {
  reviewerRole: ProtectedReviewerRole;
  releaseDecisionId?: string;
  reviewerDisplayName: string;
  reviewerOrganization: string;
  signoffReferenceLabel: string;
  signoffReferenceLocator: string;
  artifactScope: string;
  approvedClaimVersion: string;
  distributionScope: string;
  expiresAt: string;
  externalSignoffRetained: true;
  attestation: typeof protectedNamedReviewerSignoffAttestation;
  dataBoundary: typeof protectedNamedReviewerSignoffDataBoundary;
  reviewNote: string;
};

export type ProtectedNamedReviewerSignoffRecord = {
  id: string;
  tenantId: string;
  workspaceId: string;
  releaseDecisionId: string | null;
  reviewerRole: ProtectedReviewerRole;
  reviewerRoleLabel: string;
  signoffStatus: Exclude<ProtectedNamedReviewerSignoffStatus, "not-recorded">;
  approvalScope: typeof protectedReviewerSignoffApprovalScope;
  reviewerDisplayName: string;
  reviewerOrganization: string;
  signoffReferenceLabel: string;
  signoffReferenceLocator: string;
  artifactScope: string;
  approvedClaimVersion: string;
  distributionScope: string;
  expiresAt: string;
  externalSignoffRetained: boolean;
  evidenceSnapshot: Record<string, unknown>;
  requiredReviewerRoles: ProtectedReviewerRole[];
  linkedReviewerRoles: ProtectedReviewerRole[];
  missingReviewerRoles: ProtectedReviewerRole[];
  retainedBlockers: string[];
  releaseRestrictions: string[];
  attestation: typeof protectedNamedReviewerSignoffAttestation;
  reviewNote: string;
  dataBoundary: typeof protectedNamedReviewerSignoffDataBoundary;
  signoffAuthority: typeof protectedNamedReviewerSignoffAuthority;
  releaseAuthority: typeof protectedReviewerSignoffReleaseAuthority;
  storageAuthority: typeof protectedReviewerSignoffStorageAuthority;
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

export type ProtectedNamedReviewerSignoffWorkflow = {
  service: "scrimed-protected-named-reviewer-signoffs";
  status: typeof protectedNamedReviewerSignoffStatus;
  packetStatus: typeof protectedNamedReviewerSignoffPacketProofStackStatus;
  summary: {
    signoffCount: number;
    requiredReviewerRoleCount: number;
    linkedReviewerRoleCount: number;
    missingReviewerRoleCount: number;
    readyReleaseDecisionCount: number;
    readySignoffSetCount: number;
    expiringSoonCount: number;
    expiredCount: number;
    retainedBlockerCount: number;
    latestSignoffAt: string | null;
  };
  signoffState:
    | "named-signoff-open"
    | "partial-signoff-metadata-recorded"
    | "all-required-signoff-metadata-recorded-not-release-authority";
  controlledDistributionReviewState:
    | "blocked-pending-release-decision-and-signoffs"
    | "ready-for-controlled-distribution-review-not-release-authority";
  requiredReviewerRoles: typeof protectedReviewerRoles;
  linkedReviewerRoles: ProtectedReviewerRole[];
  missingReviewerRoles: ProtectedReviewerRole[];
  expiringSoonRoles: ProtectedReviewerRole[];
  expiredRoles: ProtectedReviewerRole[];
  records: ProtectedNamedReviewerSignoffRecord[];
  readyReleaseDecisions: ProtectedReleaseDecisionRecord[];
  latestReadyReleaseDecision: ProtectedReleaseDecisionRecord | null;
  releaseDecisionSnapshot: {
    service: ProtectedReleaseDecisionWorkflow["service"] | "unavailable";
    status: typeof protectedReleaseDecisionWorkflowStatus | "unavailable";
    claimRegistryState: ProtectedReleaseDecisionWorkflow["claimRegistryState"] | "unavailable";
    releaseDecisionState: ProtectedReleaseDecisionWorkflow["releaseDecisionState"] | "unavailable";
    readyForReviewCount: number;
    latestDecisionAt: string | null;
  };
  authorities: {
    signoffAuthority: typeof protectedNamedReviewerSignoffAuthority;
    releaseAuthority: typeof protectedReviewerSignoffReleaseAuthority;
    storageAuthority: typeof protectedReviewerSignoffStorageAuthority;
    approvalScope: typeof protectedReviewerSignoffApprovalScope;
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
const claimVersionPattern = /^[A-Za-z0-9][A-Za-z0-9._:-]{1,39}$/;

const forbiddenSignoffPatterns = [
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
  /signed[ _-]?(baa|dpa|contract|agreement|document)/i,
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
  /external distribution approved/i
];

export const protectedRequiredReviewerRoles = protectedReviewerRoles.map((role) => role.id);

function safeShortText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength + 1) : "";
}

function containsForbiddenContent(...values: string[]) {
  const candidate = values.join(" ");

  return forbiddenSignoffPatterns.some((pattern) => pattern.test(candidate));
}

function getReviewerRole(value: string) {
  return protectedReviewerRoles.find((role) => role.id === value) ?? null;
}

function normalizeOptionalReleaseDecisionId(value: unknown) {
  const candidate = safeShortText(value, 80);

  if (!candidate) return undefined;

  return uuidPattern.test(candidate) ? candidate : "invalid";
}

function normalizeExpiresAt(value: string) {
  const time = new Date(value).getTime();

  return Number.isFinite(time) ? new Date(time).toISOString() : null;
}

export function validateProtectedNamedReviewerSignoffInput(value: unknown):
  | { ok: true; input: ProtectedNamedReviewerSignoffInput }
  | { ok: false; errors: string[] } {
  const record = value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
  const reviewerRole = safeShortText(record.reviewerRole, 80);
  const releaseDecisionId = normalizeOptionalReleaseDecisionId(record.releaseDecisionId);
  const reviewerDisplayName = safeShortText(record.reviewerDisplayName, 80);
  const reviewerOrganization = safeShortText(record.reviewerOrganization, 100);
  const signoffReferenceLabel = safeShortText(record.signoffReferenceLabel, 120);
  const signoffReferenceLocator = safeShortText(record.signoffReferenceLocator, 140);
  const artifactScope = safeShortText(record.artifactScope, 160);
  const approvedClaimVersion = safeShortText(record.approvedClaimVersion, 40);
  const distributionScope = safeShortText(record.distributionScope, 140);
  const expiresAt = normalizeExpiresAt(safeShortText(record.expiresAt, 80));
  const externalSignoffRetained = record.externalSignoffRetained === true;
  const attestation = safeShortText(record.attestation, 90);
  const dataBoundary = safeShortText(record.dataBoundary, 90);
  const reviewNote = safeShortText(record.reviewNote, 280);
  const role = getReviewerRole(reviewerRole);
  const errors: string[] = [];

  if (!role) {
    errors.push("Reviewer role must be one of the approved distribution-readiness reviewer roles.");
  }

  if (releaseDecisionId === "invalid") {
    errors.push("Release decision id must be a valid protected release decision id when supplied.");
  }

  if (
    reviewerDisplayName.length < 3 ||
    reviewerDisplayName.length > 80 ||
    !safeMetadataTextPattern.test(reviewerDisplayName)
  ) {
    errors.push("Reviewer display name must be a bounded metadata label, not contact details.");
  }

  if (
    reviewerOrganization.length < 3 ||
    reviewerOrganization.length > 100 ||
    !safeMetadataTextPattern.test(reviewerOrganization)
  ) {
    errors.push("Reviewer organization must be a bounded non-sensitive organization label.");
  }

  if (
    signoffReferenceLabel.length < 4 ||
    signoffReferenceLabel.length > 120 ||
    !safeMetadataTextPattern.test(signoffReferenceLabel)
  ) {
    errors.push("Sign-off reference label must describe an external retained artifact without storing it.");
  }

  if (
    signoffReferenceLocator.length < 4 ||
    signoffReferenceLocator.length > 140 ||
    !safeMetadataTextPattern.test(signoffReferenceLocator)
  ) {
    errors.push("Sign-off reference locator must be a bounded external system locator, not a URL or secret.");
  }

  if (
    artifactScope.length < 6 ||
    artifactScope.length > 160 ||
    !safeMetadataTextPattern.test(artifactScope)
  ) {
    errors.push("Artifact scope must be a bounded description of what was reviewed.");
  }

  if (!claimVersionPattern.test(approvedClaimVersion)) {
    errors.push("Approved claim version must be a short versioned claim registry label.");
  }

  if (
    distributionScope.length < 4 ||
    distributionScope.length > 140 ||
    !safeMetadataTextPattern.test(distributionScope)
  ) {
    errors.push("Distribution scope must be a bounded non-secret scope label.");
  }

  if (!expiresAt) {
    errors.push("Expiration date must be a valid timestamp or date.");
  } else {
    const expiresTime = new Date(expiresAt).getTime();
    const now = Date.now();
    const maximum = now + 400 * 24 * 60 * 60 * 1000;

    if (expiresTime <= now + 24 * 60 * 60 * 1000 || expiresTime > maximum) {
      errors.push("Expiration date must be more than one day away and within 400 days.");
    }
  }

  if (!externalSignoffRetained) {
    errors.push("Named reviewer sign-offs require external retention outside SCRIMED.");
  }

  if (attestation !== protectedNamedReviewerSignoffAttestation) {
    errors.push("Named reviewer sign-offs require the fixed no-PHI metadata attestation.");
  }

  if (dataBoundary !== protectedNamedReviewerSignoffDataBoundary) {
    errors.push("Named reviewer sign-offs require the synthetic business workflow data boundary.");
  }

  if (reviewNote.length > 280) {
    errors.push("Review note must stay under 280 characters.");
  }

  if (
    containsForbiddenContent(
      reviewerRole,
      releaseDecisionId ?? "",
      reviewerDisplayName,
      reviewerOrganization,
      signoffReferenceLabel,
      signoffReferenceLocator,
      artifactScope,
      approvedClaimVersion,
      distributionScope,
      reviewNote
    )
  ) {
    errors.push(
      "Named reviewer sign-off metadata cannot contain PHI, credentials, secrets, patient identifiers, payer member data, source contracts, signed documents, legal opinions, audited financial claims, securities claims, advertising substantiation, clinical validation, reimbursement guarantees, compliance certification, public release approval, distribution approval, or live clinical execution claims."
    );
  }

  if (errors.length > 0 || !expiresAt || !role) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    input: {
      reviewerRole: role.id,
      releaseDecisionId: releaseDecisionId && releaseDecisionId !== "invalid" ? releaseDecisionId : undefined,
      reviewerDisplayName,
      reviewerOrganization,
      signoffReferenceLabel,
      signoffReferenceLocator,
      artifactScope,
      approvedClaimVersion,
      distributionScope,
      expiresAt,
      externalSignoffRetained: true,
      attestation: protectedNamedReviewerSignoffAttestation,
      dataBoundary: protectedNamedReviewerSignoffDataBoundary,
      reviewNote
    }
  };
}

function isExpired(record: ProtectedNamedReviewerSignoffRecord, now = Date.now()) {
  const expiresTime = new Date(record.expiresAt).getTime();

  return !Number.isFinite(expiresTime) || expiresTime <= now;
}

function isExpiringSoon(record: ProtectedNamedReviewerSignoffRecord, now = Date.now()) {
  const expiresTime = new Date(record.expiresAt).getTime();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;

  return Number.isFinite(expiresTime) && expiresTime > now && expiresTime <= now + thirtyDays;
}

export function deriveProtectedNamedReviewerSignoffWorkflow({
  records,
  releaseWorkflow,
  unavailableSections = []
}: {
  records: ProtectedNamedReviewerSignoffRecord[];
  releaseWorkflow: ProtectedReleaseDecisionWorkflow | null;
  unavailableSections?: string[];
}): ProtectedNamedReviewerSignoffWorkflow {
  const now = Date.now();
  const activeRecords = records.filter((record) => record.externalSignoffRetained && !isExpired(record, now));
  const linkedReviewerRoles = protectedRequiredReviewerRoles.filter((role) =>
    activeRecords.some((record) => record.reviewerRole === role)
  );
  const missingReviewerRoles = protectedRequiredReviewerRoles.filter(
    (role) => !linkedReviewerRoles.includes(role)
  );
  const expiringSoonRecords = activeRecords.filter((record) => isExpiringSoon(record, now));
  const expiredRecords = records.filter((record) => isExpired(record, now));
  const expiringSoonRoles = Array.from(new Set(expiringSoonRecords.map((record) => record.reviewerRole)));
  const expiredRoles = Array.from(new Set(expiredRecords.map((record) => record.reviewerRole)));
  const readyReleaseDecisions = releaseWorkflow
    ? releaseWorkflow.records.filter(
        (record) =>
          record.decisionStatus === "ready-for-qualified-release-review-not-release-authority"
      )
    : [];
  const allRequiredRolesLinked = missingReviewerRoles.length === 0;
  const readyForControlledDistributionReview =
    allRequiredRolesLinked && readyReleaseDecisions.length > 0 && expiredRecords.length === 0;
  const retainedBlockerCount = records.reduce(
    (total, record) => total + record.retainedBlockers.length,
    0
  );
  const latestSignoff = records[0] ?? null;

  return {
    service: "scrimed-protected-named-reviewer-signoffs",
    status: protectedNamedReviewerSignoffStatus,
    packetStatus: protectedNamedReviewerSignoffPacketProofStackStatus,
    summary: {
      signoffCount: records.length,
      requiredReviewerRoleCount: protectedReviewerRoles.length,
      linkedReviewerRoleCount: linkedReviewerRoles.length,
      missingReviewerRoleCount: missingReviewerRoles.length,
      readyReleaseDecisionCount: readyReleaseDecisions.length,
      readySignoffSetCount: readyForControlledDistributionReview ? 1 : 0,
      expiringSoonCount: expiringSoonRecords.length,
      expiredCount: expiredRecords.length,
      retainedBlockerCount,
      latestSignoffAt: latestSignoff?.recordedAt ?? null
    },
    signoffState: readyForControlledDistributionReview
      ? "all-required-signoff-metadata-recorded-not-release-authority"
      : records.length > 0
        ? "partial-signoff-metadata-recorded"
        : "named-signoff-open",
    controlledDistributionReviewState: readyForControlledDistributionReview
      ? "ready-for-controlled-distribution-review-not-release-authority"
      : "blocked-pending-release-decision-and-signoffs",
    requiredReviewerRoles: protectedReviewerRoles,
    linkedReviewerRoles,
    missingReviewerRoles,
    expiringSoonRoles,
    expiredRoles,
    records,
    readyReleaseDecisions,
    latestReadyReleaseDecision: readyReleaseDecisions[0] ?? null,
    releaseDecisionSnapshot: {
      service: releaseWorkflow?.service ?? "unavailable",
      status: releaseWorkflow?.status ?? "unavailable",
      claimRegistryState: releaseWorkflow?.claimRegistryState ?? "unavailable",
      releaseDecisionState: releaseWorkflow?.releaseDecisionState ?? "unavailable",
      readyForReviewCount: releaseWorkflow?.summary.readyForReviewCount ?? 0,
      latestDecisionAt: releaseWorkflow?.summary.latestDecisionAt ?? null
    },
    authorities: {
      signoffAuthority: protectedNamedReviewerSignoffAuthority,
      releaseAuthority: protectedReviewerSignoffReleaseAuthority,
      storageAuthority: protectedReviewerSignoffStorageAuthority,
      approvalScope: protectedReviewerSignoffApprovalScope,
      releaseDecisionAuthority: protectedReleaseDecisionAuthority,
      financeExternalUseAuthority: protectedFinanceExternalUseAuthority,
      financialReportingAuthority: protectedMetricRollupFinancialAuthority,
      securitiesAuthority: protectedMetricRollupSecuritiesAuthority,
      advertisingClaimsAuthority: protectedFinanceAdvertisingClaimsAuthority,
      clinicalExecutionAuthority: protectedMetricRollupClinicalAuthority
    },
    safeWorkarounds: [
      "Retain named reviewer approvals, signatures, legal opinions, customer permissions, and source artifacts in approved external systems; SCRIMED stores metadata references only.",
      "Use controlled distribution review readiness as an operator signal, not public release approval or legal authority.",
      "When any reviewer role is missing, expired, or not tied to the current claim version, keep the artifact internal and share only bounded synthetic diligence packets.",
      "Refresh sign-off metadata before distribution windows expire and re-run release decisions when claim wording changes."
    ],
    unavailableSections,
    boundary: `${protectedNamedReviewerSignoffBoundary} ${protectedReleaseDecisionBoundary}`,
    updated: "2026-06-20"
  };
}

function linesForNamedReviewerSignoff(record: ProtectedNamedReviewerSignoffRecord) {
  return [
    `### ${record.reviewerRoleLabel} - ${record.approvedClaimVersion}`,
    `- Sign-off status: ${record.signoffStatus}`,
    `- Release decision id: ${record.releaseDecisionId ?? "not linked"}`,
    `- Reviewer display name: ${record.reviewerDisplayName}`,
    `- Reviewer organization: ${record.reviewerOrganization}`,
    `- External reference label: ${record.signoffReferenceLabel}`,
    `- External reference locator: ${record.signoffReferenceLocator}`,
    `- Artifact scope: ${record.artifactScope}`,
    `- Distribution scope: ${record.distributionScope}`,
    `- Expires at: ${record.expiresAt}`,
    `- External sign-off retained: ${record.externalSignoffRetained ? "yes" : "no"}`,
    `- Approval scope: ${record.approvalScope}`,
    `- Sign-off authority: ${record.signoffAuthority}`,
    `- Release authority: ${record.releaseAuthority}`,
    `- Storage authority: ${record.storageAuthority}`,
    `- Review note: ${record.reviewNote || "none"}`,
    `- Recorded at: ${record.recordedAt}`,
    `- Boundary: ${record.boundary}`,
    "- Missing reviewer roles:",
    ...record.missingReviewerRoles.map((role) => `  - ${role}`),
    "- Retained blockers:",
    ...record.retainedBlockers.map((blocker) => `  - ${blocker}`),
    "- Release restrictions:",
    ...record.releaseRestrictions.map((restriction) => `  - ${restriction}`)
  ];
}

export function buildProtectedNamedReviewerSignoffPacket({
  actorUserId,
  auditEventId,
  generatedAt,
  workflow,
  workspace
}: {
  actorUserId: string;
  auditEventId?: string | null;
  generatedAt: string;
  workflow: ProtectedNamedReviewerSignoffWorkflow;
  workspace: PilotWorkspaceRecord;
}) {
  return [
    "# SCRIMED Protected Named Reviewer Sign-Off Packet",
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
    `Sign-off authority: ${workflow.authorities.signoffAuthority}`,
    `Release authority: ${workflow.authorities.releaseAuthority}`,
    `Storage authority: ${workflow.authorities.storageAuthority}`,
    `Approval scope: ${workflow.authorities.approvalScope}`,
    `Release decision authority: ${workflow.authorities.releaseDecisionAuthority}`,
    `Finance external-use authority: ${workflow.authorities.financeExternalUseAuthority}`,
    `Financial reporting authority: ${workflow.authorities.financialReportingAuthority}`,
    `Securities authority: ${workflow.authorities.securitiesAuthority}`,
    `Advertising claims authority: ${workflow.authorities.advertisingClaimsAuthority}`,
    `Clinical execution authority: ${workflow.authorities.clinicalExecutionAuthority}`,
    "",
    "## Summary",
    `- Sign-off state: ${workflow.signoffState}`,
    `- Controlled distribution review: ${workflow.controlledDistributionReviewState}`,
    `- Sign-offs: ${workflow.summary.signoffCount}`,
    `- Required reviewer roles: ${workflow.summary.requiredReviewerRoleCount}`,
    `- Linked reviewer roles: ${workflow.summary.linkedReviewerRoleCount}`,
    `- Missing reviewer roles: ${workflow.summary.missingReviewerRoleCount}`,
    `- Ready release decisions: ${workflow.summary.readyReleaseDecisionCount}`,
    `- Complete metadata sets: ${workflow.summary.readySignoffSetCount}`,
    `- Expiring soon: ${workflow.summary.expiringSoonCount}`,
    `- Expired: ${workflow.summary.expiredCount}`,
    `- Latest sign-off: ${workflow.summary.latestSignoffAt ?? "not recorded"}`,
    "",
    "## Release Decision Snapshot",
    `- Release workflow service: ${workflow.releaseDecisionSnapshot.service}`,
    `- Release workflow status: ${workflow.releaseDecisionSnapshot.status}`,
    `- Claim registry state: ${workflow.releaseDecisionSnapshot.claimRegistryState}`,
    `- Release decision state: ${workflow.releaseDecisionSnapshot.releaseDecisionState}`,
    `- Ready decisions: ${workflow.releaseDecisionSnapshot.readyForReviewCount}`,
    `- Latest decision: ${workflow.releaseDecisionSnapshot.latestDecisionAt ?? "not recorded"}`,
    "",
    "## Required Reviewer Roles",
    ...workflow.requiredReviewerRoles.map(
      (role) =>
        `- ${role.id}: ${role.label} (${role.domain}) - ${role.requiredScope}`
    ),
    "",
    "## Missing Reviewer Roles",
    ...(workflow.missingReviewerRoles.length
      ? workflow.missingReviewerRoles.map((role) => `- ${role}`)
      : ["- None recorded."]),
    "",
    "## Sign-Off Records",
    ...(workflow.records.length
      ? workflow.records.flatMap(linesForNamedReviewerSignoff)
      : ["- No named reviewer sign-off metadata recorded."]),
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
    "- Controlled distribution review readiness is not public release approval, legal approval, audited financial reporting, advertising substantiation, customer permission, compliance certification, production authorization, clinical validation, reimbursement assurance, or live clinical execution authority.",
    "- Exact artifacts, signatures, approvals, and customer permissions must remain externally retained and independently reviewed before distribution.",
    "- Expired, missing, or claim-version-mismatched reviewer metadata must block distribution and trigger re-review.",
    "",
    `Updated: ${workflow.updated}`
  ].join("\n");
}
