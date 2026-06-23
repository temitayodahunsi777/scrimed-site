import {
  protectedMetricRollupClinicalAuthority,
  protectedMetricRollupDataBoundary,
  protectedMetricRollupFinancialAuthority,
  protectedMetricRollupSecuritiesAuthority
} from "./protectedMetricRollups";
import type { PilotWorkspaceRecord } from "./protectedPilotWorkspace";
import type { ProtectedBoardScorecardRecord } from "./protectedBoardScorecards";

export const protectedFinanceMethodologyStatus =
  "aal2-finance-methodology-gates-no-phi";
export const protectedFinanceMethodologyPacketProofStackStatus =
  "aal2-audited-finance-methodology-gate-packets-no-phi";
export const protectedFinanceMethodologyAttestation =
  "finance-external-use-gates-no-phi-readiness";
export const protectedFinanceMethodologyDataBoundary =
  protectedMetricRollupDataBoundary;
export const protectedFinanceMethodologyApprovalScope =
  "internal-board-readiness-only";
export const protectedFinanceMethodologyAuthority =
  "not-audited-financial-methodology";
export const protectedFinanceExternalUseAuthority =
  "external-use-blocked-until-qualified-approval";
export const protectedFinanceAdvertisingClaimsAuthority =
  "not-advertising-claim-substantiation";
export const protectedFinanceMethodologyBoundary =
  "Protected Finance Methodology Gates record no-PHI internal readiness attestations for cost-allocation and external-use controls. They do not store PHI, patient identifiers, payer member data, live clinical records, source contracts, secrets, credentials, audited financial statements, securities offering material, investment advice, accounting advice, tax advice, legal advice, valuation assurance, revenue guarantee, reimbursement assurance, clinical validation, compliance certification, advertising claim substantiation, production authorization, or live clinical execution approval.";

export type ProtectedFinanceMethodologyGateId =
  | "finance-cost-allocation"
  | "counsel-external-use"
  | "executive-release"
  | "privacy-security-review"
  | "clinical-governance-boundary"
  | "marketing-claims-substantiation"
  | "buyer-permission";

export type ProtectedFinanceMethodologyGateStatus =
  | "readiness-attested-no-phi"
  | "external-review-required-acknowledged"
  | "customer-specific-required-acknowledged"
  | "blocked-before-external-use-acknowledged"
  | "not-recorded";

export type ProtectedFinanceMethodologyInput = {
  gateId: ProtectedFinanceMethodologyGateId;
  boardScorecardId?: string;
  attestation: typeof protectedFinanceMethodologyAttestation;
  dataBoundary: typeof protectedFinanceMethodologyDataBoundary;
  reviewNote: string;
};

export type ProtectedFinanceMethodologyGateDefinition = {
  id: ProtectedFinanceMethodologyGateId;
  label: string;
  reviewerRole: string;
  defaultStatus: Exclude<ProtectedFinanceMethodologyGateStatus, "not-recorded">;
  valueLine: string;
  evidenceReferences: string[];
  retainedBlockers: string[];
  methodologyComponents: string[];
  externalUseRestrictions: string[];
  nextAction: string;
  boundary: string;
};

export type ProtectedFinanceMethodologyGateRecord = {
  id: string;
  tenantId: string;
  workspaceId: string;
  boardScorecardId: string | null;
  gateId: ProtectedFinanceMethodologyGateId;
  gateLabel: string;
  gateStatus: Exclude<ProtectedFinanceMethodologyGateStatus, "not-recorded">;
  approvalScope: typeof protectedFinanceMethodologyApprovalScope;
  reviewerRole: string;
  evidenceSnapshot: Record<string, unknown>;
  retainedBlockers: string[];
  methodologyComponents: string[];
  externalUseRestrictions: string[];
  attestation: typeof protectedFinanceMethodologyAttestation;
  reviewNote: string;
  dataBoundary: typeof protectedFinanceMethodologyDataBoundary;
  methodologyAuthority: typeof protectedFinanceMethodologyAuthority;
  externalUseAuthority: typeof protectedFinanceExternalUseAuthority;
  financialReportingAuthority: typeof protectedMetricRollupFinancialAuthority;
  securitiesAuthority: typeof protectedMetricRollupSecuritiesAuthority;
  advertisingClaimsAuthority: typeof protectedFinanceAdvertisingClaimsAuthority;
  clinicalExecutionAuthority: typeof protectedMetricRollupClinicalAuthority;
  signedBy: string;
  signedAt: string;
  createdAt: string;
  boundary: string;
};

export type ProtectedFinanceMethodologyGateView = ProtectedFinanceMethodologyGateDefinition & {
  gateStatus: ProtectedFinanceMethodologyGateStatus;
  latestRecord: ProtectedFinanceMethodologyGateRecord | null;
};

export type ProtectedFinanceMethodologyWorkflow = {
  service: "scrimed-protected-finance-methodology-gates";
  status: typeof protectedFinanceMethodologyStatus;
  packetStatus: typeof protectedFinanceMethodologyPacketProofStackStatus;
  summary: {
    gateCount: number;
    recordedGateCount: number;
    missingGateCount: number;
    readinessAttestationCount: number;
    retainedBlockerCount: number;
    latestAttestationAt: string | null;
    boardScorecardCount: number;
    latestBoardScorecardAt: string | null;
  };
  financeMethodologyState:
    | "methodology-readiness-open"
    | "internal-board-readiness-attested";
  externalUseReleaseStatus:
    | "external-use-blocked-pending-gate-attestation"
    | "ready-for-qualified-external-review-not-release-authority";
  latestBoardScorecardState: ProtectedBoardScorecardRecord["scorecardState"] | "pending";
  financeAllocationStatus:
    | ProtectedBoardScorecardRecord["allocationProfileStatus"]
    | "finance-allocation-profile-pending";
  gates: ProtectedFinanceMethodologyGateView[];
  records: ProtectedFinanceMethodologyGateRecord[];
  safeWorkarounds: string[];
  unavailableSections: string[];
  boundary: string;
  updated: string;
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const forbiddenContentPatterns = [
  /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/,
  /sk-[A-Za-z0-9_-]{12,}/i,
  /sbp_[A-Za-z0-9_-]{12,}/i,
  /bearer\s+[A-Za-z0-9._-]+/i,
  /patient[ _-]?(id|identifier|mrn)/i,
  /member[ _-]?(id|identifier)/i,
  /medical record/i,
  /protected health information/i,
  /payer member/i,
  /diagnosis code/i,
  /social security/i,
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

export const protectedFinanceMethodologyGates: ProtectedFinanceMethodologyGateDefinition[] = [
  {
    id: "finance-cost-allocation",
    label: "Finance cost-allocation methodology",
    reviewerRole: "finance lead or founder acting as finance owner",
    defaultStatus: "readiness-attested-no-phi",
    valueLine:
      "Defines the no-PHI internal methodology gate for model cost, reviewer labor, implementation labor, support, infrastructure, and delivery allocation.",
    evidenceReferences: [
      "protected operator metrics",
      "metric rollup snapshots",
      "metric trend reviews",
      "board scorecards"
    ],
    retainedBlockers: [
      "Requires qualified finance/accounting review before audited reporting, margin reporting, external investor use, or customer value claims.",
      "Requires approved chart-of-accounts, revenue-recognition, cost allocation, and data-room policy before external release."
    ],
    methodologyComponents: [
      "model cost",
      "reviewer labor",
      "implementation labor",
      "infrastructure",
      "support and success",
      "delivery operations"
    ],
    externalUseRestrictions: [
      "No audited financial reporting.",
      "No valuation, margin, investment, accounting, tax, or securities claim."
    ],
    nextAction:
      "Have finance approve versioned cost allocation policy, source system mapping, review cadence, and external-use rules.",
    boundary:
      "Internal board-readiness only; not audited financial methodology or external financial authority."
  },
  {
    id: "counsel-external-use",
    label: "Counsel external-use review",
    reviewerRole: "qualified counsel",
    defaultStatus: "external-review-required-acknowledged",
    valueLine:
      "Separates internal operating proof from investor, fundraising, PR, advertising, public-market, and buyer-facing external-use materials.",
    evidenceReferences: ["public market readiness", "buyer diligence packets", "board scorecards"],
    retainedBlockers: [
      "Qualified counsel must review external-use context, disclaimers, audience, and distribution controls.",
      "No securities, investment, valuation, legal, or tax representation is created by this internal record."
    ],
    methodologyComponents: ["external-use policy", "claim registry", "distribution control"],
    externalUseRestrictions: [
      "No fundraising or securities material release.",
      "No public advertising claim release."
    ],
    nextAction:
      "Route any external board, investor, buyer, PR, marketing, or advertising material through qualified counsel before release.",
    boundary:
      "Acknowledges legal review requirement; does not create legal approval."
  },
  {
    id: "executive-release",
    label: "Executive release authority",
    reviewerRole: "founder or authorized executive",
    defaultStatus: "external-review-required-acknowledged",
    valueLine:
      "Ensures one accountable executive decision owner is identified before protected evidence leaves internal review.",
    evidenceReferences: ["audit log", "board scorecard packet", "buyer room packet"],
    retainedBlockers: [
      "External use remains blocked until finance, counsel, privacy, security, and customer-specific gates are satisfied.",
      "Executive release cannot override clinical, privacy, security, legal, or customer approval requirements."
    ],
    methodologyComponents: ["release owner", "release reason", "release audience"],
    externalUseRestrictions: [
      "No uncontrolled forwarding.",
      "No external buyer, investor, PR, or advertising use without completed gate stack."
    ],
    nextAction:
      "Assign a named executive release owner and require packet-level approval before external distribution.",
    boundary:
      "Internal executive readiness only; not production, clinical, or external approval."
  },
  {
    id: "privacy-security-review",
    label: "Privacy and security review",
    reviewerRole: "privacy/security owner",
    defaultStatus: "customer-specific-required-acknowledged",
    valueLine:
      "Confirms evidence remains metadata-only and flags customer-specific privacy, security, retention, access, and incident-response review before sharing.",
    evidenceReferences: ["protected workspace audit", "secure evidence vault readiness", "trust safety operations"],
    retainedBlockers: [
      "No PHI, member data, secrets, credentials, source contracts, or production records may be included.",
      "Customer-specific security, privacy, BAA/DPA, retention, and access-review controls remain required."
    ],
    methodologyComponents: ["data minimization", "retention control", "access review"],
    externalUseRestrictions: [
      "No sensitive buyer document storage.",
      "No PHI-enabled telemetry or customer data export."
    ],
    nextAction:
      "Complete privacy/security review and approved sharing channel before customer-specific external release.",
    boundary:
      "Acknowledges privacy/security review requirement; not HIPAA, SOC 2, or customer security certification."
  },
  {
    id: "clinical-governance-boundary",
    label: "Clinical governance boundary",
    reviewerRole: "clinical governance owner",
    defaultStatus: "blocked-before-external-use-acknowledged",
    valueLine:
      "Keeps finance and board evidence separate from clinical validation, patient outcome claims, diagnosis, treatment, and live-care execution.",
    evidenceReferences: ["clinical activation dossier", "clinical activation approvals", "TrustOS"],
    retainedBlockers: [
      "No autonomous diagnosis, treatment recommendation, patient outreach, payer submission, live clinical execution, or clinical outcome claim.",
      "Licensed clinical governance and customer go-live approval remain required for clinical production workflows."
    ],
    methodologyComponents: ["clinical claim boundary", "human review", "go-live blocker"],
    externalUseRestrictions: [
      "No clinical validation claim.",
      "No live-care authorization or patient-outcome claim."
    ],
    nextAction:
      "Keep clinical claims blocked until clinician-reviewed, customer-approved, and legally reviewed validation exists.",
    boundary:
      "Clinical governance boundary only; not clinical approval."
  },
  {
    id: "marketing-claims-substantiation",
    label: "Marketing claims substantiation",
    reviewerRole: "communications, counsel, and product owner",
    defaultStatus: "external-review-required-acknowledged",
    valueLine:
      "Separates internal proof and positioning from advertising, public relations, comparative, ROI, and performance claims.",
    evidenceReferences: ["competitive edge", "market activation", "public market readiness"],
    retainedBlockers: [
      "Claims require substantiation, approved wording, approved audience, and retained evidence before advertising or PR use.",
      "Do not use internal metrics as public performance, ROI, clinical, reimbursement, or compliance claims."
    ],
    methodologyComponents: ["claim register", "evidence mapping", "approved wording"],
    externalUseRestrictions: [
      "No advertising claim substantiation.",
      "No public ROI, outcome, reimbursement, or certification claim."
    ],
    nextAction:
      "Move each external claim through communications, counsel, product, and evidence-owner approval.",
    boundary:
      "Claim readiness acknowledgement only; not advertising substantiation."
  },
  {
    id: "buyer-permission",
    label: "Buyer permission and distribution control",
    reviewerRole: "customer owner and executive sponsor",
    defaultStatus: "customer-specific-required-acknowledged",
    valueLine:
      "Ensures customer-specific materials, logos, references, case studies, benchmarks, and deployment facts are not used without permission.",
    evidenceReferences: ["buyer room", "pilot deal room", "customer activation approvals"],
    retainedBlockers: [
      "Customer references, logos, contract details, benchmarks, case studies, and deployment facts require explicit permission.",
      "Buyer-specific results require approved data rights, baseline methodology, review, and distribution controls."
    ],
    methodologyComponents: ["customer permission", "reference controls", "data rights"],
    externalUseRestrictions: [
      "No customer logo or named reference.",
      "No customer-specific benchmark or case study without written permission."
    ],
    nextAction:
      "Record customer-specific permission and distribution scope before using buyer evidence externally.",
    boundary:
      "Buyer permission requirement only; not customer approval."
  }
];

function safeShortText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength + 1) : "";
}

function containsForbiddenContent(...values: string[]) {
  const candidate = values.join(" ");

  return forbiddenContentPatterns.some((pattern) => pattern.test(candidate));
}

export function getProtectedFinanceMethodologyGate(
  gateId: string
): ProtectedFinanceMethodologyGateDefinition | null {
  return protectedFinanceMethodologyGates.find((gate) => gate.id === gateId) ?? null;
}

export function validateProtectedFinanceMethodologyInput(value: unknown):
  | { ok: true; input: ProtectedFinanceMethodologyInput }
  | { ok: false; errors: string[] } {
  const record = value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
  const gateId = safeShortText(record.gateId, 80);
  const boardScorecardId = safeShortText(record.boardScorecardId, 80);
  const attestation = safeShortText(record.attestation, 90);
  const dataBoundary = safeShortText(record.dataBoundary, 90);
  const reviewNote = safeShortText(record.reviewNote, 280);
  const errors: string[] = [];

  if (!getProtectedFinanceMethodologyGate(gateId)) {
    errors.push("Finance methodology gate id must be an approved no-PHI gate.");
  }

  if (boardScorecardId && !uuidPattern.test(boardScorecardId)) {
    errors.push("Board scorecard id must be a valid protected board scorecard id.");
  }

  if (attestation !== protectedFinanceMethodologyAttestation) {
    errors.push("Finance methodology gates require the fixed no-PHI external-use attestation.");
  }

  if (dataBoundary !== protectedFinanceMethodologyDataBoundary) {
    errors.push("Finance methodology gates require the synthetic business workflow data boundary.");
  }

  if (reviewNote.length > 280) {
    errors.push("Review note must stay under 280 characters.");
  }

  if (containsForbiddenContent(reviewNote, boardScorecardId)) {
    errors.push(
      "Finance methodology gate metadata cannot contain PHI, credentials, patient identifiers, payer member data, audited financial claims, securities claims, clinical validation, advertising substantiation, reimbursement guarantees, or compliance certification."
    );
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    input: {
      gateId: gateId as ProtectedFinanceMethodologyGateId,
      boardScorecardId: boardScorecardId || undefined,
      attestation: protectedFinanceMethodologyAttestation,
      dataBoundary: protectedFinanceMethodologyDataBoundary,
      reviewNote
    }
  };
}

export function buildProtectedFinanceMethodologyEvidenceSnapshot({
  gate,
  scorecards,
  records
}: {
  gate: ProtectedFinanceMethodologyGateDefinition;
  scorecards: ProtectedBoardScorecardRecord[];
  records: ProtectedFinanceMethodologyGateRecord[];
}) {
  const latestScorecard = scorecards[0] ?? null;

  return {
    gateId: gate.id,
    gateLabel: gate.label,
    evidenceReferences: gate.evidenceReferences,
    boardScorecardCount: scorecards.length,
    latestBoardScorecardId: latestScorecard?.id ?? null,
    latestBoardScorecardAt: latestScorecard?.createdAt ?? null,
    latestBoardScorecardState: latestScorecard?.scorecardState ?? "pending",
    recordedGateCount: new Set(records.map((record) => record.gateId)).size,
    financialReportingAuthority: protectedMetricRollupFinancialAuthority,
    securitiesAuthority: protectedMetricRollupSecuritiesAuthority,
    advertisingClaimsAuthority: protectedFinanceAdvertisingClaimsAuthority,
    clinicalExecutionAuthority: protectedMetricRollupClinicalAuthority,
    externalUseAuthority: protectedFinanceExternalUseAuthority
  };
}

export function deriveProtectedFinanceMethodologyWorkflow({
  records,
  scorecards,
  unavailableSections = []
}: {
  records: ProtectedFinanceMethodologyGateRecord[];
  scorecards: ProtectedBoardScorecardRecord[];
  unavailableSections?: string[];
}): ProtectedFinanceMethodologyWorkflow {
  const distinctRecordedGateIds = new Set(records.map((record) => record.gateId));
  const latestRecord = records[0] ?? null;
  const latestScorecard = scorecards[0] ?? null;
  const gates = protectedFinanceMethodologyGates.map((gate) => {
    const latestGateRecord = records.find((record) => record.gateId === gate.id) ?? null;
    const gateStatus: ProtectedFinanceMethodologyGateStatus =
      latestGateRecord?.gateStatus ?? "not-recorded";

    return {
      ...gate,
      gateStatus,
      latestRecord: latestGateRecord
    };
  });
  const readinessAttestationCount = records.filter(
    (record) => record.gateStatus === "readiness-attested-no-phi"
  ).length;
  const retainedBlockerCount = gates.reduce(
    (total, gate) => total + gate.retainedBlockers.length,
    0
  );
  const allGatesRecorded = distinctRecordedGateIds.size === protectedFinanceMethodologyGates.length;

  return {
    service: "scrimed-protected-finance-methodology-gates",
    status: protectedFinanceMethodologyStatus,
    packetStatus: protectedFinanceMethodologyPacketProofStackStatus,
    summary: {
      gateCount: protectedFinanceMethodologyGates.length,
      recordedGateCount: distinctRecordedGateIds.size,
      missingGateCount: protectedFinanceMethodologyGates.length - distinctRecordedGateIds.size,
      readinessAttestationCount,
      retainedBlockerCount,
      latestAttestationAt: latestRecord?.signedAt ?? null,
      boardScorecardCount: scorecards.length,
      latestBoardScorecardAt: latestScorecard?.createdAt ?? null
    },
    financeMethodologyState: distinctRecordedGateIds.has("finance-cost-allocation")
      ? "internal-board-readiness-attested"
      : "methodology-readiness-open",
    externalUseReleaseStatus: allGatesRecorded
      ? "ready-for-qualified-external-review-not-release-authority"
      : "external-use-blocked-pending-gate-attestation",
    latestBoardScorecardState: latestScorecard?.scorecardState ?? "pending",
    financeAllocationStatus:
      latestScorecard?.allocationProfileStatus ?? "finance-allocation-profile-pending",
    gates,
    records,
    safeWorkarounds: [
      "Use protected board scorecards internally while qualified finance, counsel, privacy, security, clinical governance, communications, and customer-specific approval gates remain open.",
      "Route external investor, buyer, PR, marketing, advertising, and board materials through an approved external data-room or counsel-reviewed process until SCRIMED can retain signed approvals.",
      "Use no-PHI packet metadata and external signed evidence references instead of storing sensitive buyer documents, contracts, PHI, audited financials, or securities materials in SCRIMED."
    ],
    unavailableSections,
    boundary: protectedFinanceMethodologyBoundary,
    updated: "2026-06-19"
  };
}

function linesForGate(gate: ProtectedFinanceMethodologyGateView) {
  const latest = gate.latestRecord;

  return [
    `### ${gate.label}`,
    `- Gate ID: ${gate.id}`,
    `- Status: ${gate.gateStatus}`,
    `- Reviewer role: ${gate.reviewerRole}`,
    `- Value line: ${gate.valueLine}`,
    `- Latest record: ${latest ? `${latest.id} at ${latest.signedAt}` : "not recorded"}`,
    `- Latest note: ${latest?.reviewNote || "none"}`,
    `- Boundary: ${gate.boundary}`,
    "- Retained blockers:",
    ...gate.retainedBlockers.map((blocker) => `  - ${blocker}`),
    "- Methodology components:",
    ...gate.methodologyComponents.map((component) => `  - ${component}`),
    "- External-use restrictions:",
    ...gate.externalUseRestrictions.map((restriction) => `  - ${restriction}`),
    `- Next action: ${gate.nextAction}`
  ];
}

export function buildProtectedFinanceMethodologyPacket({
  actorUserId,
  auditEventId,
  generatedAt,
  workflow,
  workspace
}: {
  actorUserId: string;
  auditEventId?: string | null;
  generatedAt: string;
  workflow: ProtectedFinanceMethodologyWorkflow;
  workspace: PilotWorkspaceRecord;
}) {
  return [
    "# SCRIMED Protected Finance Methodology Gates Packet",
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
    `Methodology authority: ${protectedFinanceMethodologyAuthority}`,
    `External-use authority: ${protectedFinanceExternalUseAuthority}`,
    `Financial reporting authority: ${protectedMetricRollupFinancialAuthority}`,
    `Securities authority: ${protectedMetricRollupSecuritiesAuthority}`,
    `Advertising claims authority: ${protectedFinanceAdvertisingClaimsAuthority}`,
    `Clinical execution authority: ${protectedMetricRollupClinicalAuthority}`,
    "",
    "## Summary",
    `- Finance methodology state: ${workflow.financeMethodologyState}`,
    `- External-use release status: ${workflow.externalUseReleaseStatus}`,
    `- Gates recorded: ${workflow.summary.recordedGateCount}/${workflow.summary.gateCount}`,
    `- Missing gates: ${workflow.summary.missingGateCount}`,
    `- Readiness attestations: ${workflow.summary.readinessAttestationCount}`,
    `- Retained blockers: ${workflow.summary.retainedBlockerCount}`,
    `- Board scorecards available: ${workflow.summary.boardScorecardCount}`,
    `- Latest board scorecard state: ${workflow.latestBoardScorecardState}`,
    `- Finance allocation status: ${workflow.financeAllocationStatus}`,
    "",
    "## Gates",
    ...workflow.gates.flatMap(linesForGate),
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
    "- Qualified finance/accounting review is required before audited reporting, gross margin reporting, external investor diligence use, or customer value claims.",
    "- Qualified counsel review is required before securities, fundraising, PR, advertising, marketing, buyer, board, or public-market use.",
    "- Privacy, security, clinical governance, communications, executive, and customer-specific approval gates remain required before external distribution.",
    "",
    `Updated: ${workflow.updated}`
  ].join("\n");
}
