import {
  protectedFinanceAdvertisingClaimsAuthority,
  protectedFinanceExternalUseAuthority,
  protectedFinanceMethodologyAuthority,
  protectedFinanceMethodologyBoundary,
  protectedFinanceMethodologyGates,
  type ProtectedFinanceMethodologyGateRecord,
  type ProtectedFinanceMethodologyWorkflow
} from "./protectedFinanceMethodology";
import {
  protectedMetricRollupClinicalAuthority,
  protectedMetricRollupDataBoundary,
  protectedMetricRollupFinancialAuthority,
  protectedMetricRollupSecuritiesAuthority
} from "./protectedMetricRollups";
import type { PilotWorkspaceRecord } from "./protectedPilotWorkspace";

export const protectedExternalApprovalEvidenceStatus =
  "aal2-qualified-external-approval-evidence-links-no-phi";
export const protectedExternalApprovalEvidencePacketProofStackStatus =
  "aal2-audited-external-approval-evidence-link-packets-no-phi";
export const protectedExternalApprovalEvidenceAttestation =
  "external-approval-evidence-reference-no-phi";
export const protectedExternalApprovalEvidenceDataBoundary =
  protectedMetricRollupDataBoundary;
export const protectedExternalApprovalEvidenceAuthority =
  "metadata-reference-only-not-approval";
export const protectedExternalApprovalEvidenceStorageAuthority =
  "no-sensitive-document-storage";
export const protectedExternalApprovalEvidenceReleaseAuthority =
  "external-use-blocked-until-qualified-release-approval";
export const protectedExternalApprovalEvidenceApprovalScope =
  "external-evidence-reference-only";
export const protectedExternalApprovalEvidenceBoundary =
  "Protected External Approval Evidence Linkage records bounded no-PHI metadata references to approval artifacts retained in qualified external systems. It does not store PHI, patient identifiers, payer member data, live clinical records, source contracts, secrets, credentials, signed BAAs/DPAs, legal opinions, audited financial statements, securities offering material, investment advice, accounting advice, tax advice, valuation assurance, revenue guarantee, reimbursement assurance, clinical validation, compliance certification, advertising claim substantiation, customer permission artifacts, production authorization, or live clinical execution approval.";

export type ProtectedExternalApprovalEvidenceDomainId =
  | "finance-methodology-policy"
  | "counsel-external-use-review"
  | "executive-release-review"
  | "privacy-security-review"
  | "clinical-governance-boundary-review"
  | "marketing-claims-review"
  | "buyer-permission-review";

export type ProtectedExternalApprovalEvidenceSystem =
  | "counsel-data-room"
  | "finance-workbook"
  | "customer-procurement-portal"
  | "security-grc"
  | "board-materials"
  | "external-secure-channel";

export type ProtectedExternalApprovalEvidenceReferenceStatus =
  | "metadata-reference-recorded"
  | "external-review-required"
  | "customer-specific-required"
  | "release-blocked"
  | "not-recorded";

export type ProtectedExternalApprovalEvidenceInput = {
  domainId: ProtectedExternalApprovalEvidenceDomainId;
  financeGateRecordId?: string;
  externalReferenceLabel: string;
  externalSystem: ProtectedExternalApprovalEvidenceSystem;
  referenceLocator: string;
  referenceOwner: string;
  evidenceRetainedExternally: true;
  attestation: typeof protectedExternalApprovalEvidenceAttestation;
  dataBoundary: typeof protectedExternalApprovalEvidenceDataBoundary;
  reviewNote: string;
};

export type ProtectedExternalApprovalEvidenceDomainDefinition = {
  id: ProtectedExternalApprovalEvidenceDomainId;
  label: string;
  relatedFinanceGateId: ProtectedFinanceMethodologyGateRecord["gateId"];
  reviewerRole: string;
  defaultStatus: Exclude<ProtectedExternalApprovalEvidenceReferenceStatus, "not-recorded">;
  referencePurpose: string;
  acceptableExternalSystems: ProtectedExternalApprovalEvidenceSystem[];
  retainedBlockers: string[];
  releaseRestrictions: string[];
  safeWorkaround: string;
  boundary: string;
};

export type ProtectedExternalApprovalEvidenceRecord = {
  id: string;
  tenantId: string;
  workspaceId: string;
  financeGateRecordId: string | null;
  domainId: ProtectedExternalApprovalEvidenceDomainId;
  domainLabel: string;
  referenceStatus: Exclude<ProtectedExternalApprovalEvidenceReferenceStatus, "not-recorded">;
  approvalScope: typeof protectedExternalApprovalEvidenceApprovalScope;
  externalReferenceLabel: string;
  externalSystem: ProtectedExternalApprovalEvidenceSystem;
  referenceLocator: string;
  referenceOwner: string;
  evidenceRetainedExternally: true;
  evidenceSnapshot: Record<string, unknown>;
  retainedBlockers: string[];
  releaseRestrictions: string[];
  attestation: typeof protectedExternalApprovalEvidenceAttestation;
  reviewNote: string;
  dataBoundary: typeof protectedExternalApprovalEvidenceDataBoundary;
  evidenceAuthority: typeof protectedExternalApprovalEvidenceAuthority;
  storageAuthority: typeof protectedExternalApprovalEvidenceStorageAuthority;
  releaseAuthority: typeof protectedExternalApprovalEvidenceReleaseAuthority;
  financialReportingAuthority: typeof protectedMetricRollupFinancialAuthority;
  securitiesAuthority: typeof protectedMetricRollupSecuritiesAuthority;
  advertisingClaimsAuthority: typeof protectedFinanceAdvertisingClaimsAuthority;
  clinicalExecutionAuthority: typeof protectedMetricRollupClinicalAuthority;
  recordedBy: string;
  recordedAt: string;
  createdAt: string;
  boundary: string;
};

export type ProtectedExternalApprovalEvidenceDomainView =
  ProtectedExternalApprovalEvidenceDomainDefinition & {
    referenceStatus: ProtectedExternalApprovalEvidenceReferenceStatus;
    latestRecord: ProtectedExternalApprovalEvidenceRecord | null;
    linkedFinanceGateRecord: ProtectedFinanceMethodologyGateRecord | null;
  };

export type ProtectedExternalApprovalEvidenceWorkflow = {
  service: "scrimed-protected-external-approval-evidence-links";
  status: typeof protectedExternalApprovalEvidenceStatus;
  packetStatus: typeof protectedExternalApprovalEvidencePacketProofStackStatus;
  summary: {
    domainCount: number;
    recordedDomainCount: number;
    missingDomainCount: number;
    retainedBlockerCount: number;
    latestReferenceAt: string | null;
    financeGateCount: number;
    linkedFinanceGateRecordCount: number;
  };
  evidenceLinkageState:
    | "external-approval-linkage-open"
    | "metadata-reference-linkage-started"
    | "all-domain-metadata-references-recorded";
  releaseReadinessStatus:
    | "external-use-blocked-pending-qualified-approval-references"
    | "ready-for-qualified-release-review-not-release-authority";
  financeWorkflowState: ProtectedFinanceMethodologyWorkflow["externalUseReleaseStatus"] | "unavailable";
  domains: ProtectedExternalApprovalEvidenceDomainView[];
  records: ProtectedExternalApprovalEvidenceRecord[];
  financeWorkflowSnapshot: {
    status: typeof protectedFinanceMethodologyAuthority;
    externalUseAuthority: typeof protectedFinanceExternalUseAuthority;
    recordedGateCount: number;
    missingGateCount: number;
  };
  safeWorkarounds: string[];
  unavailableSections: string[];
  boundary: string;
  updated: string;
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const safeTextPattern = /^[A-Za-z0-9][A-Za-z0-9 ._:/#-]*$/;

const forbiddenReferencePatterns = [
  /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/,
  /sk-[A-Za-z0-9_-]{12,}/i,
  /sbp_[A-Za-z0-9_-]{12,}/i,
  /bearer\s+[A-Za-z0-9._-]+/i,
  /token/i,
  /secret/i,
  /password/i,
  /api[ _-]?key/i,
  /access[ _-]?key/i,
  /https?:\/\/\S*[?=]\S*/i,
  /patient[ _-]?(id|identifier|mrn)/i,
  /member[ _-]?(id|identifier)/i,
  /medical record/i,
  /protected health information/i,
  /payer member/i,
  /diagnosis code/i,
  /social security/i,
  /source contract/i,
  /signed[ _-]?(baa|dpa|contract|agreement)/i,
  /legal opinion/i,
  /audited financial/i,
  /investment recommendation/i,
  /securities offering/i,
  /valuation guarantee/i,
  /revenue guarantee/i,
  /reimbursement guarantee/i,
  /advertising substantiation/i,
  /clinical validation/i,
  /compliance certification/i
];

export const protectedExternalApprovalEvidenceDomains: ProtectedExternalApprovalEvidenceDomainDefinition[] = [
  {
    id: "finance-methodology-policy",
    label: "Finance methodology policy reference",
    relatedFinanceGateId: "finance-cost-allocation",
    reviewerRole: "finance lead or qualified accounting reviewer",
    defaultStatus: "metadata-reference-recorded",
    referencePurpose:
      "Link the internally recorded finance methodology gate to an externally retained cost-allocation policy or review register.",
    acceptableExternalSystems: ["finance-workbook", "board-materials", "external-secure-channel"],
    retainedBlockers: [
      "The external artifact must remain outside SCRIMED until sensitive document storage is formally approved.",
      "This metadata record is not audited financial reporting, margin reporting, valuation assurance, accounting advice, or tax advice."
    ],
    releaseRestrictions: [
      "No investor or buyer financial claims may rely on this reference without qualified finance/accounting approval.",
      "No source workbook, contract, audited financial statement, or securities material may be stored in SCRIMED."
    ],
    safeWorkaround:
      "Use an external finance workbook or board data room as the source of truth and record only the non-secret locator here.",
    boundary: "Metadata reference only; not finance approval."
  },
  {
    id: "counsel-external-use-review",
    label: "Counsel external-use review reference",
    relatedFinanceGateId: "counsel-external-use",
    reviewerRole: "qualified counsel",
    defaultStatus: "metadata-reference-recorded",
    referencePurpose:
      "Link external counsel review evidence for investor, buyer, PR, marketing, advertising, board, or public-market distribution controls.",
    acceptableExternalSystems: ["counsel-data-room", "external-secure-channel", "board-materials"],
    retainedBlockers: [
      "The actual legal opinion, privileged communication, or counsel work product must not be stored in SCRIMED.",
      "This metadata record does not create legal approval, securities approval, fundraising authority, or public release authority."
    ],
    releaseRestrictions: [
      "No securities, investment, legal, tax, valuation, PR, or advertising material release is authorized by this record.",
      "External-use scope must be approved in the external review system."
    ],
    safeWorkaround:
      "Keep privileged review evidence in counsel-controlled channels and record only an approved non-secret locator.",
    boundary: "Counsel reference only; not legal advice or approval."
  },
  {
    id: "executive-release-review",
    label: "Executive release review reference",
    relatedFinanceGateId: "executive-release",
    reviewerRole: "founder or authorized executive",
    defaultStatus: "metadata-reference-recorded",
    referencePurpose:
      "Link the accountable executive release review that confirms scope, audience, and retained blockers before external use.",
    acceptableExternalSystems: ["board-materials", "external-secure-channel"],
    retainedBlockers: [
      "Executive release cannot override finance, counsel, privacy, security, clinical governance, communications, or customer-specific approvals.",
      "This record does not authorize uncontrolled forwarding, public distribution, production deployment, or clinical execution."
    ],
    releaseRestrictions: [
      "No external distribution is authorized until every qualified approval reference is represented and reviewed.",
      "No customer-specific material may be released without customer permission."
    ],
    safeWorkaround:
      "Use a board-materials release log or external secure channel to retain the actual approval artifact.",
    boundary: "Executive reference only; not release authority."
  },
  {
    id: "privacy-security-review",
    label: "Privacy and security review reference",
    relatedFinanceGateId: "privacy-security-review",
    reviewerRole: "privacy/security owner",
    defaultStatus: "metadata-reference-recorded",
    referencePurpose:
      "Link privacy, security, retention, access-review, and approved-channel evidence without storing sensitive documents.",
    acceptableExternalSystems: ["security-grc", "customer-procurement-portal", "external-secure-channel"],
    retainedBlockers: [
      "No PHI, payer member data, source contracts, secrets, credentials, signed BAA/DPA, or production security evidence may be stored here.",
      "This record is not HIPAA compliance certification, SOC 2 certification, customer security approval, or DPA/BAA approval."
    ],
    releaseRestrictions: [
      "Customer-specific sharing requires approved privacy/security channel and access review.",
      "Production credentials, PHI access, and customer contracts remain blocked."
    ],
    safeWorkaround:
      "Retain security artifacts in a GRC portal or customer procurement portal and record only a bounded reference.",
    boundary: "Privacy/security reference only; not certification."
  },
  {
    id: "clinical-governance-boundary-review",
    label: "Clinical governance boundary reference",
    relatedFinanceGateId: "clinical-governance-boundary",
    reviewerRole: "clinical governance owner",
    defaultStatus: "metadata-reference-recorded",
    referencePurpose:
      "Link the external or licensed clinical-governance review that keeps claims, workflows, and demos inside non-diagnostic boundaries.",
    acceptableExternalSystems: ["external-secure-channel", "board-materials", "customer-procurement-portal"],
    retainedBlockers: [
      "No clinical validation, patient outcome claim, diagnosis, treatment, payer submission, or live clinical execution is authorized.",
      "Licensed clinical review and customer go-live approval remain required before clinical production workflows."
    ],
    releaseRestrictions: [
      "No autonomous clinical decisioning, patient outreach, medical-record mutation, or payer submission.",
      "No clinical performance or outcome claim without approved validation and legal review."
    ],
    safeWorkaround:
      "Reference external clinical governance review evidence while keeping SCRIMED in synthetic, human-reviewed pilot mode.",
    boundary: "Clinical governance reference only; not clinical approval."
  },
  {
    id: "marketing-claims-review",
    label: "Marketing claims review reference",
    relatedFinanceGateId: "marketing-claims-substantiation",
    reviewerRole: "communications, counsel, and product owner",
    defaultStatus: "metadata-reference-recorded",
    referencePurpose:
      "Link approved-claim wording, substantiation workflow, and audience controls retained outside SCRIMED.",
    acceptableExternalSystems: ["counsel-data-room", "board-materials", "external-secure-channel"],
    retainedBlockers: [
      "This record is not advertising substantiation, public ROI proof, comparative claim approval, reimbursement assurance, or compliance certification.",
      "Actual claim files, customer names, source contracts, and sensitive substantiation artifacts must remain externally retained."
    ],
    releaseRestrictions: [
      "No public performance, clinical, ROI, reimbursement, security, or certification claims are authorized by this metadata.",
      "Claim wording must be approved in the external system before use."
    ],
    safeWorkaround:
      "Use an externally versioned claim register and record only the non-secret version locator here.",
    boundary: "Claims review reference only; not advertising substantiation."
  },
  {
    id: "buyer-permission-review",
    label: "Buyer permission review reference",
    relatedFinanceGateId: "buyer-permission",
    reviewerRole: "customer owner and executive sponsor",
    defaultStatus: "metadata-reference-recorded",
    referencePurpose:
      "Link customer-specific permission, referenceability, distribution-scope, or procurement approval retained outside SCRIMED.",
    acceptableExternalSystems: ["customer-procurement-portal", "external-secure-channel", "counsel-data-room"],
    retainedBlockers: [
      "No customer logo, named reference, contract detail, case study, benchmark, or deployment fact may be used without written permission.",
      "This record does not store or create the customer permission artifact."
    ],
    releaseRestrictions: [
      "No named buyer reference, customer-specific result, benchmark, logo, or case study release is authorized by this metadata.",
      "Customer-specific data rights and distribution controls must be approved externally."
    ],
    safeWorkaround:
      "Use the buyer procurement portal or external secure channel as the retained approval source and record a short non-secret locator.",
    boundary: "Buyer permission reference only; not customer approval."
  }
];

function safeShortText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength + 1) : "";
}

function containsForbiddenContent(...values: string[]) {
  const candidate = values.join(" ");

  return forbiddenReferencePatterns.some((pattern) => pattern.test(candidate));
}

function isSafeReferenceText(value: string, maxLength: number) {
  return value.length > 0 && value.length <= maxLength && safeTextPattern.test(value);
}

export function getProtectedExternalApprovalEvidenceDomain(
  domainId: string
): ProtectedExternalApprovalEvidenceDomainDefinition | null {
  return protectedExternalApprovalEvidenceDomains.find((domain) => domain.id === domainId) ?? null;
}

export function validateProtectedExternalApprovalEvidenceInput(value: unknown):
  | { ok: true; input: ProtectedExternalApprovalEvidenceInput }
  | { ok: false; errors: string[] } {
  const record = value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
  const domainId = safeShortText(record.domainId, 90);
  const financeGateRecordId = safeShortText(record.financeGateRecordId, 90);
  const externalReferenceLabel = safeShortText(record.externalReferenceLabel, 120);
  const externalSystem = safeShortText(record.externalSystem, 60);
  const referenceLocator = safeShortText(record.referenceLocator, 160);
  const referenceOwner = safeShortText(record.referenceOwner, 80);
  const evidenceRetainedExternally = record.evidenceRetainedExternally;
  const attestation = safeShortText(record.attestation, 90);
  const dataBoundary = safeShortText(record.dataBoundary, 90);
  const reviewNote = safeShortText(record.reviewNote, 280);
  const domain = getProtectedExternalApprovalEvidenceDomain(domainId);
  const errors: string[] = [];

  if (!domain) {
    errors.push("External approval evidence domain must be an approved no-PHI metadata domain.");
  }

  if (financeGateRecordId && !uuidPattern.test(financeGateRecordId)) {
    errors.push("Finance methodology gate record id must be a valid protected gate id.");
  }

  if (!isSafeReferenceText(externalReferenceLabel, 120)) {
    errors.push("External reference label must be bounded non-secret metadata.");
  }

  if (!domain?.acceptableExternalSystems.includes(externalSystem as ProtectedExternalApprovalEvidenceSystem)) {
    errors.push("External system must be approved for the selected evidence domain.");
  }

  if (!isSafeReferenceText(referenceLocator, 160)) {
    errors.push("Reference locator must be a short non-secret external locator.");
  }

  if (!isSafeReferenceText(referenceOwner, 80)) {
    errors.push("Reference owner must be bounded non-secret metadata.");
  }

  if (evidenceRetainedExternally !== true) {
    errors.push("External approval evidence must be retained outside SCRIMED.");
  }

  if (attestation !== protectedExternalApprovalEvidenceAttestation) {
    errors.push("External approval evidence references require the fixed no-PHI metadata attestation.");
  }

  if (dataBoundary !== protectedExternalApprovalEvidenceDataBoundary) {
    errors.push("External approval evidence references require the synthetic business workflow data boundary.");
  }

  if (reviewNote.length > 280) {
    errors.push("Review note must stay under 280 characters.");
  }

  if (
    containsForbiddenContent(
      externalReferenceLabel,
      referenceLocator,
      referenceOwner,
      reviewNote,
      financeGateRecordId
    )
  ) {
    errors.push(
      "External approval evidence metadata cannot contain PHI, credentials, secrets, patient identifiers, payer member data, source contracts, signed BAAs/DPAs, legal opinions, audited financial claims, securities claims, advertising substantiation, clinical validation, reimbursement guarantees, or compliance certification."
    );
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    input: {
      domainId: domainId as ProtectedExternalApprovalEvidenceDomainId,
      financeGateRecordId: financeGateRecordId || undefined,
      externalReferenceLabel,
      externalSystem: externalSystem as ProtectedExternalApprovalEvidenceSystem,
      referenceLocator,
      referenceOwner,
      evidenceRetainedExternally: true,
      attestation: protectedExternalApprovalEvidenceAttestation,
      dataBoundary: protectedExternalApprovalEvidenceDataBoundary,
      reviewNote
    }
  };
}

export function deriveProtectedExternalApprovalEvidenceWorkflow({
  financeWorkflow,
  financeGateRecords,
  records,
  unavailableSections = []
}: {
  financeWorkflow: ProtectedFinanceMethodologyWorkflow | null;
  financeGateRecords: ProtectedFinanceMethodologyGateRecord[];
  records: ProtectedExternalApprovalEvidenceRecord[];
  unavailableSections?: string[];
}): ProtectedExternalApprovalEvidenceWorkflow {
  const distinctRecordedDomainIds = new Set(records.map((record) => record.domainId));
  const latestRecord = records[0] ?? null;
  const domains = protectedExternalApprovalEvidenceDomains.map((domain) => {
    const latestDomainRecord = records.find((record) => record.domainId === domain.id) ?? null;
    const referenceStatus: ProtectedExternalApprovalEvidenceReferenceStatus =
      latestDomainRecord?.referenceStatus ?? "not-recorded";
    const linkedFinanceGateRecord =
      financeGateRecords.find(
        (gate) =>
          gate.id === latestDomainRecord?.financeGateRecordId ||
          gate.gateId === domain.relatedFinanceGateId
      ) ?? null;

    return {
      ...domain,
      referenceStatus,
      latestRecord: latestDomainRecord,
      linkedFinanceGateRecord
    };
  });
  const retainedBlockerCount = domains.reduce(
    (total, domain) => total + domain.retainedBlockers.length,
    0
  );
  const allDomainsRecorded =
    distinctRecordedDomainIds.size === protectedExternalApprovalEvidenceDomains.length;
  const linkageStarted = records.length > 0;

  return {
    service: "scrimed-protected-external-approval-evidence-links",
    status: protectedExternalApprovalEvidenceStatus,
    packetStatus: protectedExternalApprovalEvidencePacketProofStackStatus,
    summary: {
      domainCount: protectedExternalApprovalEvidenceDomains.length,
      recordedDomainCount: distinctRecordedDomainIds.size,
      missingDomainCount:
        protectedExternalApprovalEvidenceDomains.length - distinctRecordedDomainIds.size,
      retainedBlockerCount,
      latestReferenceAt: latestRecord?.recordedAt ?? null,
      financeGateCount: financeGateRecords.length,
      linkedFinanceGateRecordCount: domains.filter((domain) => domain.linkedFinanceGateRecord).length
    },
    evidenceLinkageState: allDomainsRecorded
      ? "all-domain-metadata-references-recorded"
      : linkageStarted
        ? "metadata-reference-linkage-started"
        : "external-approval-linkage-open",
    releaseReadinessStatus: allDomainsRecorded
      ? "ready-for-qualified-release-review-not-release-authority"
      : "external-use-blocked-pending-qualified-approval-references",
    financeWorkflowState: financeWorkflow?.externalUseReleaseStatus ?? "unavailable",
    domains,
    records,
    financeWorkflowSnapshot: {
      status: protectedFinanceMethodologyAuthority,
      externalUseAuthority: protectedFinanceExternalUseAuthority,
      recordedGateCount: financeWorkflow?.summary.recordedGateCount ?? financeGateRecords.length,
      missingGateCount:
        financeWorkflow?.summary.missingGateCount ??
        Math.max(protectedFinanceMethodologyGates.length - financeGateRecords.length, 0)
    },
    safeWorkarounds: [
      "Retain legal, finance, security, customer, and claims artifacts in qualified external systems while SCRIMED records only non-secret metadata references.",
      "Use this linkage layer to prove disciplined release readiness without storing sensitive approval artifacts, PHI, source contracts, credentials, or securities materials.",
      "Keep every external release blocked until finance, counsel, privacy, security, clinical governance, communications, executive, and customer-specific reviewers approve the actual retained artifact."
    ],
    unavailableSections,
    boundary: `${protectedExternalApprovalEvidenceBoundary} ${protectedFinanceMethodologyBoundary}`,
    updated: "2026-06-20"
  };
}

function linesForDomain(domain: ProtectedExternalApprovalEvidenceDomainView) {
  const latest = domain.latestRecord;

  return [
    `### ${domain.label}`,
    `- Domain ID: ${domain.id}`,
    `- Reference status: ${domain.referenceStatus}`,
    `- Reviewer role: ${domain.reviewerRole}`,
    `- Related finance gate: ${domain.relatedFinanceGateId}`,
    `- Linked finance gate record: ${domain.linkedFinanceGateRecord?.id ?? "not linked"}`,
    `- Latest external reference: ${latest ? `${latest.externalReferenceLabel} (${latest.externalSystem})` : "not recorded"}`,
    `- Reference locator: ${latest?.referenceLocator ?? "not recorded"}`,
    `- Reference owner: ${latest?.referenceOwner ?? "not recorded"}`,
    `- Latest recorded at: ${latest?.recordedAt ?? "not recorded"}`,
    `- Boundary: ${domain.boundary}`,
    "- Retained blockers:",
    ...domain.retainedBlockers.map((blocker) => `  - ${blocker}`),
    "- Release restrictions:",
    ...domain.releaseRestrictions.map((restriction) => `  - ${restriction}`),
    `- Safe workaround: ${domain.safeWorkaround}`
  ];
}

export function buildProtectedExternalApprovalEvidencePacket({
  actorUserId,
  auditEventId,
  generatedAt,
  workflow,
  workspace
}: {
  actorUserId: string;
  auditEventId?: string | null;
  generatedAt: string;
  workflow: ProtectedExternalApprovalEvidenceWorkflow;
  workspace: PilotWorkspaceRecord;
}) {
  return [
    "# SCRIMED Protected External Approval Evidence Linkage Packet",
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
    `Evidence authority: ${protectedExternalApprovalEvidenceAuthority}`,
    `Storage authority: ${protectedExternalApprovalEvidenceStorageAuthority}`,
    `Release authority: ${protectedExternalApprovalEvidenceReleaseAuthority}`,
    `Finance methodology authority: ${protectedFinanceMethodologyAuthority}`,
    `Finance external-use authority: ${protectedFinanceExternalUseAuthority}`,
    `Financial reporting authority: ${protectedMetricRollupFinancialAuthority}`,
    `Securities authority: ${protectedMetricRollupSecuritiesAuthority}`,
    `Advertising claims authority: ${protectedFinanceAdvertisingClaimsAuthority}`,
    `Clinical execution authority: ${protectedMetricRollupClinicalAuthority}`,
    "",
    "## Summary",
    `- Evidence linkage state: ${workflow.evidenceLinkageState}`,
    `- Release readiness status: ${workflow.releaseReadinessStatus}`,
    `- Domains recorded: ${workflow.summary.recordedDomainCount}/${workflow.summary.domainCount}`,
    `- Missing domains: ${workflow.summary.missingDomainCount}`,
    `- Linked finance gate records: ${workflow.summary.linkedFinanceGateRecordCount}`,
    `- Finance gates recorded: ${workflow.financeWorkflowSnapshot.recordedGateCount}`,
    `- Finance gates missing: ${workflow.financeWorkflowSnapshot.missingGateCount}`,
    `- Retained blockers: ${workflow.summary.retainedBlockerCount}`,
    `- Latest reference: ${workflow.summary.latestReferenceAt ?? "not recorded"}`,
    "",
    "## Evidence Domains",
    ...workflow.domains.flatMap(linesForDomain),
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
    "- Qualified reviewers must approve the externally retained artifacts before any release.",
    "- This packet is a metadata linkage packet only. It is not a legal opinion, audited financial report, advertising claim substantiation, customer permission artifact, clinical validation, reimbursement assurance, compliance certification, production authorization, or live clinical execution authority.",
    "- Keep SCRIMED in synthetic, human-reviewed protected-pilot mode until each external approval artifact is reviewed, retained, and authorized through the correct customer and legal channels.",
    "",
    `Updated: ${workflow.updated}`
  ].join("\n");
}
