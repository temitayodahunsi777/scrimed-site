import {
  protectedExternalApprovalEvidenceAuthority,
  protectedExternalApprovalEvidenceBoundary,
  protectedExternalApprovalEvidenceDomains,
  protectedExternalApprovalEvidenceReleaseAuthority,
  protectedExternalApprovalEvidenceStorageAuthority,
  type ProtectedExternalApprovalEvidenceDomainId,
  type ProtectedExternalApprovalEvidenceWorkflow
} from "./protectedExternalApprovalEvidence";
import {
  protectedFinanceAdvertisingClaimsAuthority,
  protectedFinanceExternalUseAuthority,
  protectedFinanceMethodologyAuthority
} from "./protectedFinanceMethodology";
import {
  protectedMetricRollupClinicalAuthority,
  protectedMetricRollupDataBoundary,
  protectedMetricRollupFinancialAuthority,
  protectedMetricRollupSecuritiesAuthority
} from "./protectedMetricRollups";
import type { PilotWorkspaceRecord } from "./protectedPilotWorkspace";

export const protectedReleaseDecisionWorkflowStatus =
  "aal2-qualified-release-decision-workflow-no-phi";
export const protectedReleaseDecisionPacketProofStackStatus =
  "aal2-audited-release-decision-claim-registry-packets-no-phi";
export const protectedReleaseDecisionAttestation =
  "release-decision-claim-registry-no-phi";
export const protectedReleaseDecisionDataBoundary = protectedMetricRollupDataBoundary;
export const protectedClaimRegistryAuthority =
  "versioned-claim-registry-not-claim-approval";
export const protectedReleaseDecisionAuthority =
  "qualified-release-review-not-public-release";
export const protectedDistributionAuthority =
  "distribution-blocked-until-qualified-release-approval";
export const protectedReleaseDecisionApprovalScope =
  "release-review-readiness-only";
export const protectedReleaseDecisionBoundary =
  "Protected Release Decision Workflow records bounded no-PHI release-review readiness decisions for versioned claim registry entries. It does not store PHI, patient identifiers, payer member data, live clinical records, source contracts, secrets, credentials, signed BAAs/DPAs, legal opinions, audited financial statements, securities offering material, investment advice, accounting advice, tax advice, valuation assurance, revenue guarantee, reimbursement assurance, advertising claim substantiation, clinical validation, compliance certification, customer permission artifacts, public release approval, production authorization, or live clinical execution approval.";

export type ProtectedReleaseAudience =
  | "internal-board"
  | "buyer-diligence"
  | "investor-data-room"
  | "public-relations"
  | "marketing-site"
  | "sales-collateral"
  | "customer-case-study";

export type ProtectedClaimCategory =
  | "workflow-efficiency"
  | "governance"
  | "security-privacy"
  | "interoperability"
  | "financial-operating"
  | "clinical-boundary"
  | "customer-proof";

export type ProtectedReleaseDecisionStatus =
  | "draft-review-required"
  | "claim-registry-versioned"
  | "external-evidence-linked"
  | "ready-for-qualified-release-review-not-release-authority"
  | "blocked"
  | "not-recorded";

export type ProtectedReleaseDecisionInput = {
  releaseAudience: ProtectedReleaseAudience;
  claimCategory: ProtectedClaimCategory;
  claimVersion: string;
  claimText: string;
  distributionChannel: string;
  externalApprovalEvidenceRecordIds: string[];
  attestation: typeof protectedReleaseDecisionAttestation;
  dataBoundary: typeof protectedReleaseDecisionDataBoundary;
  reviewNote: string;
};

export type ProtectedReleaseDecisionRecord = {
  id: string;
  tenantId: string;
  workspaceId: string;
  releaseAudience: ProtectedReleaseAudience;
  claimCategory: ProtectedClaimCategory;
  claimVersion: string;
  claimText: string;
  decisionStatus: Exclude<ProtectedReleaseDecisionStatus, "not-recorded">;
  approvalScope: typeof protectedReleaseDecisionApprovalScope;
  distributionChannel: string;
  externalApprovalEvidenceRecordIds: string[];
  evidenceSnapshot: Record<string, unknown>;
  requiredApprovalDomains: ProtectedExternalApprovalEvidenceDomainId[];
  linkedApprovalDomains: ProtectedExternalApprovalEvidenceDomainId[];
  missingApprovalDomains: ProtectedExternalApprovalEvidenceDomainId[];
  retainedBlockers: string[];
  releaseRestrictions: string[];
  attestation: typeof protectedReleaseDecisionAttestation;
  reviewNote: string;
  dataBoundary: typeof protectedReleaseDecisionDataBoundary;
  claimRegistryAuthority: typeof protectedClaimRegistryAuthority;
  releaseDecisionAuthority: typeof protectedReleaseDecisionAuthority;
  distributionAuthority: typeof protectedDistributionAuthority;
  financialReportingAuthority: typeof protectedMetricRollupFinancialAuthority;
  securitiesAuthority: typeof protectedMetricRollupSecuritiesAuthority;
  advertisingClaimsAuthority: typeof protectedFinanceAdvertisingClaimsAuthority;
  clinicalExecutionAuthority: typeof protectedMetricRollupClinicalAuthority;
  recordedBy: string;
  recordedAt: string;
  createdAt: string;
  boundary: string;
};

export type ProtectedReleaseAudienceDefinition = {
  id: ProtectedReleaseAudience;
  label: string;
  releasePurpose: string;
  requiredDistributionControl: string;
  boundary: string;
};

export type ProtectedClaimCategoryDefinition = {
  id: ProtectedClaimCategory;
  label: string;
  claimPurpose: string;
  requiredApprovalDomains: ProtectedExternalApprovalEvidenceDomainId[];
  prohibitedClaims: string[];
  boundary: string;
};

export type ProtectedReleaseDecisionWorkflow = {
  service: "scrimed-protected-release-decision-workflow";
  status: typeof protectedReleaseDecisionWorkflowStatus;
  packetStatus: typeof protectedReleaseDecisionPacketProofStackStatus;
  summary: {
    decisionCount: number;
    readyForReviewCount: number;
    blockedCount: number;
    requiredDomainCount: number;
    linkedDomainCount: number;
    missingDomainCount: number;
    retainedBlockerCount: number;
    latestDecisionAt: string | null;
  };
  claimRegistryState:
    | "claim-registry-open"
    | "claim-registry-versioned"
    | "release-review-ready-not-release-authority";
  releaseDecisionState:
    | "release-blocked-pending-external-evidence"
    | "qualified-release-review-ready-not-public-release";
  requiredApprovalDomains: ProtectedExternalApprovalEvidenceDomainId[];
  linkedApprovalDomains: ProtectedExternalApprovalEvidenceDomainId[];
  missingApprovalDomains: ProtectedExternalApprovalEvidenceDomainId[];
  audiences: ProtectedReleaseAudienceDefinition[];
  claimCategories: ProtectedClaimCategoryDefinition[];
  records: ProtectedReleaseDecisionRecord[];
  externalEvidenceSnapshot: {
    service: ProtectedExternalApprovalEvidenceWorkflow["service"] | "unavailable";
    evidenceLinkageState: ProtectedExternalApprovalEvidenceWorkflow["evidenceLinkageState"] | "unavailable";
    releaseReadinessStatus:
      | ProtectedExternalApprovalEvidenceWorkflow["releaseReadinessStatus"]
      | "unavailable";
    recordedDomainCount: number;
    missingDomainCount: number;
    latestReferenceAt: string | null;
  };
  authorities: {
    claimRegistryAuthority: typeof protectedClaimRegistryAuthority;
    releaseDecisionAuthority: typeof protectedReleaseDecisionAuthority;
    distributionAuthority: typeof protectedDistributionAuthority;
    evidenceAuthority: typeof protectedExternalApprovalEvidenceAuthority;
    evidenceStorageAuthority: typeof protectedExternalApprovalEvidenceStorageAuthority;
    externalEvidenceReleaseAuthority: typeof protectedExternalApprovalEvidenceReleaseAuthority;
    financeMethodologyAuthority: typeof protectedFinanceMethodologyAuthority;
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
const safeClaimTextPattern = /^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]*$/;
const claimVersionPattern = /^[A-Za-z0-9][A-Za-z0-9._:-]{1,39}$/;

const forbiddenClaimPatterns = [
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
  /public release approved/i
];

export const protectedReleaseDecisionRequiredDomains =
  protectedExternalApprovalEvidenceDomains.map((domain) => domain.id);

export const protectedReleaseAudiences: ProtectedReleaseAudienceDefinition[] = [
  {
    id: "internal-board",
    label: "Internal board",
    releasePurpose: "Internal operating review for governance, unit economics, readiness, and risk decisions.",
    requiredDistributionControl: "Board-controlled channel with no public forwarding.",
    boundary: "Internal review only; not investor solicitation or public release."
  },
  {
    id: "buyer-diligence",
    label: "Buyer diligence",
    releasePurpose: "Controlled enterprise buyer review of synthetic pilot evidence and readiness posture.",
    requiredDistributionControl: "Buyer-approved data room or procurement channel.",
    boundary: "No customer-specific claim, PHI, source contract, or live-care authorization."
  },
  {
    id: "investor-data-room",
    label: "Investor data room",
    releasePurpose: "Investor diligence review of public-market discipline, operating metrics, and boundaries.",
    requiredDistributionControl: "Counsel-reviewed data room with securities controls.",
    boundary: "Not securities offering material, investment advice, or valuation assurance."
  },
  {
    id: "public-relations",
    label: "Public relations",
    releasePurpose: "External communications review for company positioning and non-sensitive announcements.",
    requiredDistributionControl: "Counsel, executive, privacy, and claims-reviewed PR channel.",
    boundary: "No clinical, financial, security-certification, customer, or outcome claim without approval."
  },
  {
    id: "marketing-site",
    label: "Marketing site",
    releasePurpose: "Approved website language for product positioning and buyer education.",
    requiredDistributionControl: "Versioned claim registry and approved site release workflow.",
    boundary: "No unsupported ROI, compliance, reimbursement, or clinical performance claim."
  },
  {
    id: "sales-collateral",
    label: "Sales collateral",
    releasePurpose: "Buyer-facing sales material for governed synthetic pilots and enterprise assessment offers.",
    requiredDistributionControl: "Versioned collateral stored in approved buyer channel.",
    boundary: "No guarantee, final pricing commitment, customer reference, or public proof claim."
  },
  {
    id: "customer-case-study",
    label: "Customer case study",
    releasePurpose: "Customer-specific story only after explicit buyer permission and claims review.",
    requiredDistributionControl: "Customer-approved permission artifact retained externally.",
    boundary: "No logo, benchmark, deployment fact, or named reference without written permission."
  }
];

export const protectedClaimCategories: ProtectedClaimCategoryDefinition[] = [
  {
    id: "workflow-efficiency",
    label: "Workflow efficiency",
    claimPurpose: "Describe synthetic workflow friction, time-saved signals, and operational review value.",
    requiredApprovalDomains: protectedReleaseDecisionRequiredDomains,
    prohibitedClaims: ["guaranteed savings", "audited ROI", "live outcome improvement"],
    boundary: "Efficiency claims require buyer-pilot measurement and qualified claims review before external use."
  },
  {
    id: "governance",
    label: "Governance",
    claimPurpose: "Describe auditability, human review, TrustOS controls, and release gates.",
    requiredApprovalDomains: protectedReleaseDecisionRequiredDomains,
    prohibitedClaims: ["legal approval", "certified compliance", "public release approval"],
    boundary: "Governance claims remain readiness evidence, not legal advice or certification."
  },
  {
    id: "security-privacy",
    label: "Security and privacy",
    claimPurpose: "Describe privacy-by-design posture, no-PHI pilots, RLS, AAL2, and audit controls.",
    requiredApprovalDomains: protectedReleaseDecisionRequiredDomains,
    prohibitedClaims: ["HIPAA compliant", "SOC 2 certified", "customer security approval"],
    boundary: "Security and privacy claims require qualified security review and approved language."
  },
  {
    id: "interoperability",
    label: "Interoperability",
    claimPurpose: "Describe FHIR, HL7, DICOM, claims, and workflow connector readiness.",
    requiredApprovalDomains: protectedReleaseDecisionRequiredDomains,
    prohibitedClaims: ["certified connector", "production EHR integration", "partner approval"],
    boundary: "Interoperability claims are synthetic-readiness claims until live connector approvals exist."
  },
  {
    id: "financial-operating",
    label: "Financial operating",
    claimPurpose: "Describe internal KPI discipline, cost controls, and protected operating metric evidence.",
    requiredApprovalDomains: protectedReleaseDecisionRequiredDomains,
    prohibitedClaims: ["audited financials", "margin guarantee", "securities offering material"],
    boundary: "Financial operating claims remain internal diligence preparation unless externally approved."
  },
  {
    id: "clinical-boundary",
    label: "Clinical boundary",
    claimPurpose: "Describe non-diagnostic, human-reviewed, synthetic pilot clinical safety boundaries.",
    requiredApprovalDomains: protectedReleaseDecisionRequiredDomains,
    prohibitedClaims: ["clinical validation", "treatment recommendation", "live clinical execution"],
    boundary: "Clinical claims require licensed clinical review and remain non-diagnostic until approved."
  },
  {
    id: "customer-proof",
    label: "Customer proof",
    claimPurpose: "Describe buyer proof ladder and permission-gated customer evidence controls.",
    requiredApprovalDomains: protectedReleaseDecisionRequiredDomains,
    prohibitedClaims: ["named customer reference", "case study approval", "deployment fact"],
    boundary: "Customer proof claims require explicit buyer permission retained outside SCRIMED."
  }
];

function safeShortText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength + 1) : "";
}

function containsForbiddenContent(...values: string[]) {
  const candidate = values.join(" ");

  return forbiddenClaimPatterns.some((pattern) => pattern.test(candidate));
}

function getReleaseAudience(value: string) {
  return protectedReleaseAudiences.find((audience) => audience.id === value) ?? null;
}

function getClaimCategory(value: string) {
  return protectedClaimCategories.find((category) => category.id === value) ?? null;
}

function uniqueUuidArray(value: unknown) {
  const source = Array.isArray(value) ? value : [];

  return Array.from(
    new Set(source.filter((item): item is string => typeof item === "string" && uuidPattern.test(item)))
  );
}

export function validateProtectedReleaseDecisionInput(value: unknown):
  | { ok: true; input: ProtectedReleaseDecisionInput }
  | { ok: false; errors: string[] } {
  const record = value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
  const releaseAudience = safeShortText(record.releaseAudience, 80);
  const claimCategory = safeShortText(record.claimCategory, 80);
  const claimVersion = safeShortText(record.claimVersion, 40);
  const claimText = safeShortText(record.claimText, 220);
  const distributionChannel = safeShortText(record.distributionChannel, 120);
  const externalApprovalEvidenceRecordIds = uniqueUuidArray(
    record.externalApprovalEvidenceRecordIds
  ).slice(0, 8);
  const attestation = safeShortText(record.attestation, 90);
  const dataBoundary = safeShortText(record.dataBoundary, 90);
  const reviewNote = safeShortText(record.reviewNote, 280);
  const audience = getReleaseAudience(releaseAudience);
  const category = getClaimCategory(claimCategory);
  const errors: string[] = [];

  if (!audience) {
    errors.push("Release audience must be an approved bounded distribution audience.");
  }

  if (!category) {
    errors.push("Claim category must be an approved claim registry category.");
  }

  if (!claimVersionPattern.test(claimVersion)) {
    errors.push("Claim version must be a short versioned registry label.");
  }

  if (
    claimText.length < 12 ||
    claimText.length > 220 ||
    !safeClaimTextPattern.test(claimText)
  ) {
    errors.push("Claim text must be bounded, non-sensitive, and safe for review.");
  }

  if (
    distributionChannel.length < 3 ||
    distributionChannel.length > 120 ||
    !safeClaimTextPattern.test(distributionChannel)
  ) {
    errors.push("Distribution channel must be a bounded non-secret channel label.");
  }

  if (
    Array.isArray(record.externalApprovalEvidenceRecordIds) &&
    record.externalApprovalEvidenceRecordIds.length !== externalApprovalEvidenceRecordIds.length
  ) {
    errors.push("External approval evidence record ids must be valid protected evidence ids.");
  }

  if (externalApprovalEvidenceRecordIds.length > 7) {
    errors.push("Release decisions can reference at most seven current approval evidence records.");
  }

  if (attestation !== protectedReleaseDecisionAttestation) {
    errors.push("Release decisions require the fixed no-PHI claim registry attestation.");
  }

  if (dataBoundary !== protectedReleaseDecisionDataBoundary) {
    errors.push("Release decisions require the synthetic business workflow data boundary.");
  }

  if (reviewNote.length > 280) {
    errors.push("Review note must stay under 280 characters.");
  }

  if (
    containsForbiddenContent(
      releaseAudience,
      claimCategory,
      claimVersion,
      claimText,
      distributionChannel,
      reviewNote
    )
  ) {
    errors.push(
      "Release decision metadata cannot contain PHI, credentials, secrets, patient identifiers, payer member data, source contracts, signed BAAs/DPAs, legal opinions, audited financial claims, securities claims, advertising substantiation, clinical validation, reimbursement guarantees, compliance certification, public release approval, or live clinical execution claims."
    );
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    input: {
      releaseAudience: releaseAudience as ProtectedReleaseAudience,
      claimCategory: claimCategory as ProtectedClaimCategory,
      claimVersion,
      claimText,
      distributionChannel,
      externalApprovalEvidenceRecordIds,
      attestation: protectedReleaseDecisionAttestation,
      dataBoundary: protectedReleaseDecisionDataBoundary,
      reviewNote
    }
  };
}

export function deriveProtectedReleaseDecisionWorkflow({
  externalWorkflow,
  records,
  unavailableSections = []
}: {
  externalWorkflow: ProtectedExternalApprovalEvidenceWorkflow | null;
  records: ProtectedReleaseDecisionRecord[];
  unavailableSections?: string[];
}): ProtectedReleaseDecisionWorkflow {
  const linkedApprovalDomains = externalWorkflow
    ? protectedReleaseDecisionRequiredDomains.filter((domainId) =>
        externalWorkflow.domains.some((domain) => domain.id === domainId && domain.latestRecord)
      )
    : [];
  const missingApprovalDomains = protectedReleaseDecisionRequiredDomains.filter(
    (domainId) => !linkedApprovalDomains.includes(domainId)
  );
  const readyForReviewCount = records.filter(
    (record) =>
      record.decisionStatus === "ready-for-qualified-release-review-not-release-authority"
  ).length;
  const blockedCount = records.filter(
    (record) => record.decisionStatus === "blocked" || record.missingApprovalDomains.length > 0
  ).length;
  const retainedBlockerCount = records.reduce(
    (total, record) => total + record.retainedBlockers.length,
    0
  );
  const latestDecision = records[0] ?? null;
  const allApprovalDomainsLinked = missingApprovalDomains.length === 0;

  return {
    service: "scrimed-protected-release-decision-workflow",
    status: protectedReleaseDecisionWorkflowStatus,
    packetStatus: protectedReleaseDecisionPacketProofStackStatus,
    summary: {
      decisionCount: records.length,
      readyForReviewCount,
      blockedCount,
      requiredDomainCount: protectedReleaseDecisionRequiredDomains.length,
      linkedDomainCount: linkedApprovalDomains.length,
      missingDomainCount: missingApprovalDomains.length,
      retainedBlockerCount,
      latestDecisionAt: latestDecision?.recordedAt ?? null
    },
    claimRegistryState: readyForReviewCount > 0
      ? "release-review-ready-not-release-authority"
      : records.length > 0
        ? "claim-registry-versioned"
        : "claim-registry-open",
    releaseDecisionState: allApprovalDomainsLinked && readyForReviewCount > 0
      ? "qualified-release-review-ready-not-public-release"
      : "release-blocked-pending-external-evidence",
    requiredApprovalDomains: protectedReleaseDecisionRequiredDomains,
    linkedApprovalDomains,
    missingApprovalDomains,
    audiences: protectedReleaseAudiences,
    claimCategories: protectedClaimCategories,
    records,
    externalEvidenceSnapshot: {
      service: externalWorkflow?.service ?? "unavailable",
      evidenceLinkageState: externalWorkflow?.evidenceLinkageState ?? "unavailable",
      releaseReadinessStatus: externalWorkflow?.releaseReadinessStatus ?? "unavailable",
      recordedDomainCount: externalWorkflow?.summary.recordedDomainCount ?? 0,
      missingDomainCount:
        externalWorkflow?.summary.missingDomainCount ?? protectedReleaseDecisionRequiredDomains.length,
      latestReferenceAt: externalWorkflow?.summary.latestReferenceAt ?? null
    },
    authorities: {
      claimRegistryAuthority: protectedClaimRegistryAuthority,
      releaseDecisionAuthority: protectedReleaseDecisionAuthority,
      distributionAuthority: protectedDistributionAuthority,
      evidenceAuthority: protectedExternalApprovalEvidenceAuthority,
      evidenceStorageAuthority: protectedExternalApprovalEvidenceStorageAuthority,
      externalEvidenceReleaseAuthority: protectedExternalApprovalEvidenceReleaseAuthority,
      financeMethodologyAuthority: protectedFinanceMethodologyAuthority,
      financeExternalUseAuthority: protectedFinanceExternalUseAuthority,
      financialReportingAuthority: protectedMetricRollupFinancialAuthority,
      securitiesAuthority: protectedMetricRollupSecuritiesAuthority,
      advertisingClaimsAuthority: protectedFinanceAdvertisingClaimsAuthority,
      clinicalExecutionAuthority: protectedMetricRollupClinicalAuthority
    },
    safeWorkarounds: [
      "Use versioned claim language in SCRIMED while retaining legal, finance, clinical, security, marketing, and customer approval artifacts in qualified external systems.",
      "Treat ready-for-qualified-release-review as an internal release-control state only, not public release approval.",
      "Route buyer, investor, PR, site, collateral, and case-study release decisions through external approval references before distribution.",
      "If a domain is missing, keep the claim draft internal and share only synthetic, boundary-preserving diligence packets."
    ],
    unavailableSections,
    boundary: `${protectedReleaseDecisionBoundary} ${protectedExternalApprovalEvidenceBoundary}`,
    updated: "2026-06-20"
  };
}

function linesForReleaseDecision(record: ProtectedReleaseDecisionRecord) {
  return [
    `### ${record.claimVersion} - ${record.claimCategory}`,
    `- Release audience: ${record.releaseAudience}`,
    `- Decision status: ${record.decisionStatus}`,
    `- Approval scope: ${record.approvalScope}`,
    `- Distribution channel: ${record.distributionChannel}`,
    `- Claim text: ${record.claimText}`,
    `- Linked approval domains: ${record.linkedApprovalDomains.join(", ") || "none"}`,
    `- Missing approval domains: ${record.missingApprovalDomains.join(", ") || "none"}`,
    `- External approval evidence records: ${record.externalApprovalEvidenceRecordIds.join(", ") || "none"}`,
    `- Claim registry authority: ${record.claimRegistryAuthority}`,
    `- Release decision authority: ${record.releaseDecisionAuthority}`,
    `- Distribution authority: ${record.distributionAuthority}`,
    `- Review note: ${record.reviewNote || "none"}`,
    `- Recorded at: ${record.recordedAt}`,
    `- Boundary: ${record.boundary}`,
    "- Retained blockers:",
    ...record.retainedBlockers.map((blocker) => `  - ${blocker}`),
    "- Release restrictions:",
    ...record.releaseRestrictions.map((restriction) => `  - ${restriction}`)
  ];
}

export function buildProtectedReleaseDecisionPacket({
  actorUserId,
  auditEventId,
  generatedAt,
  workflow,
  workspace
}: {
  actorUserId: string;
  auditEventId?: string | null;
  generatedAt: string;
  workflow: ProtectedReleaseDecisionWorkflow;
  workspace: PilotWorkspaceRecord;
}) {
  return [
    "# SCRIMED Protected Release Decision Claim Registry Packet",
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
    `Claim registry authority: ${workflow.authorities.claimRegistryAuthority}`,
    `Release decision authority: ${workflow.authorities.releaseDecisionAuthority}`,
    `Distribution authority: ${workflow.authorities.distributionAuthority}`,
    `Evidence authority: ${workflow.authorities.evidenceAuthority}`,
    `Evidence storage authority: ${workflow.authorities.evidenceStorageAuthority}`,
    `External evidence release authority: ${workflow.authorities.externalEvidenceReleaseAuthority}`,
    `Finance methodology authority: ${workflow.authorities.financeMethodologyAuthority}`,
    `Finance external-use authority: ${workflow.authorities.financeExternalUseAuthority}`,
    `Financial reporting authority: ${workflow.authorities.financialReportingAuthority}`,
    `Securities authority: ${workflow.authorities.securitiesAuthority}`,
    `Advertising claims authority: ${workflow.authorities.advertisingClaimsAuthority}`,
    `Clinical execution authority: ${workflow.authorities.clinicalExecutionAuthority}`,
    "",
    "## Summary",
    `- Claim registry state: ${workflow.claimRegistryState}`,
    `- Release decision state: ${workflow.releaseDecisionState}`,
    `- Release decisions: ${workflow.summary.decisionCount}`,
    `- Ready for qualified review: ${workflow.summary.readyForReviewCount}`,
    `- Blocked decisions: ${workflow.summary.blockedCount}`,
    `- Required approval domains: ${workflow.summary.requiredDomainCount}`,
    `- Linked approval domains: ${workflow.summary.linkedDomainCount}`,
    `- Missing approval domains: ${workflow.summary.missingDomainCount}`,
    `- Latest decision: ${workflow.summary.latestDecisionAt ?? "not recorded"}`,
    "",
    "## External Evidence Snapshot",
    `- External evidence service: ${workflow.externalEvidenceSnapshot.service}`,
    `- Evidence linkage state: ${workflow.externalEvidenceSnapshot.evidenceLinkageState}`,
    `- Evidence release readiness: ${workflow.externalEvidenceSnapshot.releaseReadinessStatus}`,
    `- Domains recorded: ${workflow.externalEvidenceSnapshot.recordedDomainCount}`,
    `- Domains missing: ${workflow.externalEvidenceSnapshot.missingDomainCount}`,
    `- Latest reference: ${workflow.externalEvidenceSnapshot.latestReferenceAt ?? "not recorded"}`,
    "",
    "## Release Decisions",
    ...(workflow.records.length
      ? workflow.records.flatMap(linesForReleaseDecision)
      : ["- No release decisions recorded."]),
    "",
    "## Required Approval Domains",
    ...workflow.requiredApprovalDomains.map((domainId) => `- ${domainId}`),
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
    "- Qualified reviewers must approve externally retained artifacts and exact claim wording before any distribution.",
    "- Ready-for-qualified-release-review is not public release approval, legal approval, audited financial reporting, advertising substantiation, customer permission, clinical validation, reimbursement assurance, compliance certification, production authorization, or live clinical execution authority.",
    "- Customer-specific, investor, PR, marketing-site, sales-collateral, and case-study usage must remain blocked until the relevant external approval references are complete.",
    "",
    `Updated: ${workflow.updated}`
  ].join("\n");
}
