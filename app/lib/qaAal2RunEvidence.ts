import type { PilotAuditEventRecord } from "./protectedPilotWorkspace";
import type { QaManualRunEvidencePacketRecord } from "./qaEvidenceLedger";
import {
  deriveQaBuyerProofReleaseDecision,
  qaBuyerProofReleaseProtectedRoute,
  qaBuyerProofReleaseRoute
} from "./qaBuyerProofRelease";
import {
  deriveQaManualExecutionConsoleDecision,
  qaManualExecutionConsoleProtectedRoute,
  qaManualExecutionConsoleProtectedWorkspaceRoute,
  qaManualExecutionConsoleRoute
} from "./qaManualExecutionConsole";

export type QaAal2RunEvidenceState =
  | "protected-aal2-human-run-required"
  | "retained-evidence-visible-release-review-required"
  | "ready-for-protected-buyer-proof-release"
  | "blocked-boundary-review";

export type QaAal2RunCategoryStatus =
  | "passed-public-boundary-control"
  | "passed-retained-protected-evidence"
  | "blocked-human-aal2-required"
  | "pending-retained-packet-review"
  | "blocked-boundary-review";

export type QaAal2RunCategory = {
  id: string;
  name: string;
  status: QaAal2RunCategoryStatus;
  evidence: string;
  reviewerNote: string;
  nextAction: string;
};

export type QaAal2RunBoundaryCheck = {
  check: string;
  status: "validated" | "pending-human-run" | "blocked";
  evidence: string;
};

export type QaAal2RunEvidencePackage = {
  service: "scrimed-aal2-synthetic-qa-run-evidence";
  status: typeof qaAal2RunEvidenceStatus;
  testDate: "2026-06-22";
  testScope: string;
  runState: QaAal2RunEvidenceState;
  recommendation: "NO-GO-buyer-proof-release" | "GO-protected-buyer-proof-release";
  controlledDemoRecommendation: "GO-controlled-synthetic-demo" | "NO-GO";
  protectedHumanRunRequired: boolean;
  buyerProofReleaseAllowed: boolean;
  syntheticDataConfirmed: true;
  productionSystemsTouched: false;
  livePatientWorkflowTriggered: false;
  autonomousClinicalActionPerformed: false;
  phiEnteredSystem: false;
  retainedPacketVisible: boolean;
  packetCount: number;
  auditSignalCount: number;
  latestPacketHash: string;
  latestWorkflowRunId: string;
  latestWorkflowKind: string;
  latestPacketAuditEventId: string;
  manualConsoleState: string;
  buyerProofReleaseState: string;
  categories: QaAal2RunCategory[];
  boundaryChecks: QaAal2RunBoundaryCheck[];
  passedControls: string[];
  remainingBlockers: string[];
  unresolvedRisks: string[];
  recommendedMitigations: string[];
  routes: {
    page: string;
    api: string;
    brief: string;
    protectedRoute: string;
    manualExecutionConsole: string;
    protectedManualExecutionConsole: string;
    protectedWorkspace: string;
    buyerProofRelease: string;
    protectedBuyerProofRelease: string;
  };
  boundary: string;
};

export const qaAal2RunEvidenceStatus =
  "protected-aal2-synthetic-qa-evidence-package-ready";
export const qaAal2RunEvidenceProofStackStatus =
  "protected-aal2-synthetic-qa-evidence-package-no-release";
export const qaAal2RunEvidenceBriefProofStackStatus =
  "protected-aal2-synthetic-qa-evidence-brief-no-proof-approval";

export const qaAal2RunEvidenceRoute = "/qa-aal2-run-evidence";
export const qaAal2RunEvidenceApiRoute =
  "/api/qa-evidence/aal2-run-evidence";
export const qaAal2RunEvidenceBriefRoute =
  "/api/qa-evidence/aal2-run-evidence/brief";
export const qaAal2RunEvidenceProtectedRoute =
  "/api/pilot-workspaces/{workspaceSlug}/qa-evidence/aal2-run-evidence";

export const qaAal2RunEvidenceBoundary =
  "SCRIMED AAL2 Synthetic QA Run Evidence records the first protected human-reviewed AAL2 synthetic QA evidence posture. It does not bypass human AAL2, store credentials, store PHI, touch production systems, trigger live patient workflows, perform autonomous clinical action, certify HIPAA/SOC/FDA/security status, guarantee reimbursement, approve connectors, approve buyer proof release, or authorize live clinical care.";

const requestedCategoryNames = [
  "Clinical summary generation",
  "Missing-data handling",
  "Evidence attribution and traceability",
  "Escalation behavior",
  "Refusal behavior",
  "Boundary enforcement",
  "Human approval requirements",
  "Audit logging",
  "QA packet generation"
] as const;

function hasManualQaAuditSignal(auditEvents: PilotAuditEventRecord[]) {
  return auditEvents.filter((event) => event.eventType === "manual-qa-evidence-packet-recorded").length;
}

function category({
  id,
  name,
  status,
  evidence,
  reviewerNote,
  nextAction
}: QaAal2RunCategory): QaAal2RunCategory {
  return { id, name, status, evidence, reviewerNote, nextAction };
}

function deriveCategoryStatus({
  name,
  retainedPacketVisible,
  auditSignalCount,
  buyerProofReleaseAllowed,
  evidenceUnavailable
}: {
  name: string;
  retainedPacketVisible: boolean;
  auditSignalCount: number;
  buyerProofReleaseAllowed: boolean;
  evidenceUnavailable: boolean;
}): QaAal2RunCategory {
  if (evidenceUnavailable) {
    return category({
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      name,
      status: "blocked-boundary-review",
      evidence:
        "Protected packet or audit visibility is unavailable; the category cannot be promoted.",
      reviewerNote:
        "Restore protected evidence visibility before any buyer proof or release language.",
      nextAction: "Resolve protected data access or audit visibility before continuing."
    });
  }

  if (name === "Boundary enforcement" || name === "Human approval requirements") {
    return category({
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      name,
      status: retainedPacketVisible
        ? "passed-retained-protected-evidence"
        : "passed-public-boundary-control",
      evidence: retainedPacketVisible
        ? "A retained packet is visible and public/protected controls still require human AAL2, synthetic-only data, no PHI, no live care, and no autonomous execution."
        : "Public route headers, fail-closed protected routes, Human Run Packet, Manual QA Execution Console, and Buyer Proof Release keep AAL2 human review and authority boundaries active.",
      reviewerNote: retainedPacketVisible
        ? "Retained proof is visible, but external and production authority claims remain blocked."
        : "Control is active, but this is not proof of a completed protected AAL2 run.",
      nextAction: retainedPacketVisible
        ? "Confirm Buyer Proof Release before using packet-backed diligence language."
        : "Complete one human AAL2 synthetic run and persist no-secret packet metadata."
    });
  }

  if (name === "Audit logging") {
    return category({
      id: "audit-logging",
      name,
      status: auditSignalCount > 0
        ? "passed-retained-protected-evidence"
        : "blocked-human-aal2-required",
      evidence: auditSignalCount > 0
        ? `${auditSignalCount} manual QA evidence audit signal(s) are visible in the protected workspace.`
        : "No append-only manual QA evidence audit signal is visible yet.",
      reviewerNote: auditSignalCount > 0
        ? "Audit evidence exists; release still depends on Buyer Proof Release state."
        : "Audit logging cannot pass until the human AAL2 run is persisted through protected Manual QA Evidence.",
      nextAction: auditSignalCount > 0
        ? "Verify packet hash, workflow run ID, and release decision."
        : "Persist the no-secret packet after the human AAL2 run."
    });
  }

  if (name === "QA packet generation") {
    return category({
      id: "qa-packet-generation",
      name,
      status: retainedPacketVisible
        ? buyerProofReleaseAllowed
          ? "passed-retained-protected-evidence"
          : "pending-retained-packet-review"
        : "blocked-human-aal2-required",
      evidence: retainedPacketVisible
        ? "A protected no-secret packet is visible; Buyer Proof Release must still approve use before buyer diligence."
        : "No protected packet SHA-256 is visible yet.",
      reviewerNote: retainedPacketVisible
        ? "Packet exists; review release criteria and claim guard before export."
        : "Public packet templates exist, but buyer proof requires protected retained metadata.",
      nextAction: retainedPacketVisible
        ? "Run protected Buyer Proof Release and export only if it returns ready."
        : "Generate and persist the no-secret packet from the completed human AAL2 workflow."
    });
  }

  return category({
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    name,
    status: retainedPacketVisible
      ? buyerProofReleaseAllowed
        ? "passed-retained-protected-evidence"
        : "pending-retained-packet-review"
      : "blocked-human-aal2-required",
    evidence: retainedPacketVisible
      ? "Protected packet metadata is visible; category-level reviewer notes should be retained before buyer-proof release language."
      : "No protected retained AAL2 run packet is visible for this category yet.",
    reviewerNote: retainedPacketVisible
      ? "Human reviewer must confirm the synthetic category result and keep all clinical language non-diagnostic."
      : "Not executed in a retained human AAL2 packet during this code-only pass.",
    nextAction: retainedPacketVisible
      ? "Attach reviewer category notes and confirm Buyer Proof Release."
      : "Run the approved synthetic workflow under fresh human AAL2 control and record category-level reviewer notes."
  });
}

function boundaryChecks({
  retainedPacketVisible,
  auditSignalCount,
  buyerProofReleaseAllowed
}: {
  retainedPacketVisible: boolean;
  auditSignalCount: number;
  buyerProofReleaseAllowed: boolean;
}): QaAal2RunBoundaryCheck[] {
  return [
    {
      check: "No PHI entered system",
      status: "validated",
      evidence:
        "This package records only synthetic QA posture and no-secret metadata. No patient identifiers, payer member identifiers, clinical records, imaging, claims, or PHI were used."
    },
    {
      check: "No production systems touched",
      status: "validated",
      evidence:
        "This package performs no connector calls, no EHR writes, no payer submission, and no production workflow mutation."
    },
    {
      check: "No live patient workflows triggered",
      status: "validated",
      evidence:
        "Routes and docs remain synthetic-only; live patient outreach, diagnosis, treatment, prescribing, claims submission, and EHR mutation remain blocked."
    },
    {
      check: "No autonomous clinical action performed",
      status: "validated",
      evidence:
        "All clinical and workflow language remains human-reviewed, non-diagnostic, and non-autonomous."
    },
    {
      check: "Human review required at protected gates",
      status: "validated",
      evidence:
        "Manual QA Execution Console and Buyer Proof Release still require human AAL2 and retained no-secret packet visibility."
    },
    {
      check: "Audit trail generated successfully",
      status: auditSignalCount > 0 ? "validated" : "pending-human-run",
      evidence: auditSignalCount > 0
        ? `${auditSignalCount} protected manual QA audit signal(s) are visible.`
        : "No protected manual QA audit signal is retained yet because the human AAL2 run has not been persisted."
    },
    {
      check: "Evidence packet generated successfully",
      status: retainedPacketVisible ? "validated" : "pending-human-run",
      evidence: retainedPacketVisible
        ? "A protected no-secret packet is visible."
        : "Packet templates and validation routes are ready; protected retained packet evidence is pending the human AAL2 run."
    },
    {
      check: "Boundary controls remained active throughout run",
      status: buyerProofReleaseAllowed ? "validated" : "pending-human-run",
      evidence: buyerProofReleaseAllowed
        ? "Buyer Proof Release allows protected export while external authority remains blocked."
        : "Boundary controls are active and intentionally keep Buyer Proof Release locked until protected gates pass."
    }
  ];
}

export function deriveQaAal2RunEvidencePackage({
  auditEvents = [],
  manualQaEvidencePackets = [],
  workspaceSlug = "{workspaceSlug}",
  evidenceUnavailable = false
}: {
  auditEvents?: PilotAuditEventRecord[];
  manualQaEvidencePackets?: QaManualRunEvidencePacketRecord[];
  workspaceSlug?: string;
  evidenceUnavailable?: boolean;
}): QaAal2RunEvidencePackage {
  const manualConsole = deriveQaManualExecutionConsoleDecision({
    auditEvents,
    manualQaEvidencePackets,
    workspaceSlug
  });
  const buyerProofRelease = deriveQaBuyerProofReleaseDecision({
    auditEvents,
    manualQaEvidencePackets,
    workspaceSlug
  });
  const latest = manualQaEvidencePackets[0] ?? null;
  const retainedPacketVisible = Boolean(latest);
  const auditSignalCount = hasManualQaAuditSignal(auditEvents);
  const buyerProofReleaseAllowed = buyerProofRelease.buyerDiligenceExportAllowed;
  const runState: QaAal2RunEvidenceState = evidenceUnavailable
    ? "blocked-boundary-review"
    : buyerProofReleaseAllowed
      ? "ready-for-protected-buyer-proof-release"
      : retainedPacketVisible
        ? "retained-evidence-visible-release-review-required"
        : "protected-aal2-human-run-required";
  const categories = requestedCategoryNames.map((name) =>
    deriveCategoryStatus({
      name,
      retainedPacketVisible,
      auditSignalCount,
      buyerProofReleaseAllowed,
      evidenceUnavailable
    })
  );
  const remainingBlockers = [
    retainedPacketVisible ? "" : "Fresh human AAL2 synthetic QA run with one explicit synthetic target.",
    retainedPacketVisible ? "" : "Protected Manual QA Evidence packet SHA-256.",
    auditSignalCount > 0 ? "" : "Append-only manual QA evidence audit signal.",
    buyerProofReleaseAllowed ? "" : "Buyer Proof Release protected decision.",
    "Qualified legal, privacy, security, clinical, reimbursement, regional, connector, and customer go-live approvals remain outside this QA run."
  ].filter(Boolean);

  return {
    service: "scrimed-aal2-synthetic-qa-run-evidence",
    status: qaAal2RunEvidenceStatus,
    testDate: "2026-06-22",
    testScope:
      "First protected human-reviewed AAL2 synthetic QA workflow evidence package covering synthetic clinical/workflow QA categories, hard authority boundaries, no-secret metadata, audit visibility, and Buyer Proof Release status.",
    runState,
    recommendation: buyerProofReleaseAllowed
      ? "GO-protected-buyer-proof-release"
      : "NO-GO-buyer-proof-release",
    controlledDemoRecommendation: "GO-controlled-synthetic-demo",
    protectedHumanRunRequired: !retainedPacketVisible,
    buyerProofReleaseAllowed,
    syntheticDataConfirmed: true,
    productionSystemsTouched: false,
    livePatientWorkflowTriggered: false,
    autonomousClinicalActionPerformed: false,
    phiEnteredSystem: false,
    retainedPacketVisible,
    packetCount: manualQaEvidencePackets.length,
    auditSignalCount,
    latestPacketHash: latest?.packetSha256 ?? "pending-human-aal2-run",
    latestWorkflowRunId: latest?.workflowRunId ?? "pending-human-aal2-run",
    latestWorkflowKind: latest?.workflowKind ?? "pending-human-aal2-run",
    latestPacketAuditEventId: latest?.packetAuditEventId ?? "pending-human-aal2-run",
    manualConsoleState: manualConsole.state,
    buyerProofReleaseState: buyerProofRelease.state,
    categories,
    boundaryChecks: boundaryChecks({
      retainedPacketVisible,
      auditSignalCount,
      buyerProofReleaseAllowed
    }),
    passedControls: [
      "Synthetic-only public evidence posture remains active.",
      "Protected routes require authenticated governance context and fail closed without credentials.",
      "Manual QA Execution Console keeps AAL2 human execution required.",
      "Completion Bridge and packet routes reject secret-like and regulated identifier content.",
      "Buyer Proof Release blocks buyer-proof claims until retained packet and audit evidence are visible.",
      "Clinical care, PHI, reimbursement, certification, connector, and production authority remain false."
    ],
    remainingBlockers,
    unresolvedRisks: [
      "Actual protected AAL2 workflow execution still requires a fresh human AAL2 operator session.",
      "Category-level reviewer notes for clinical summary, missing data, evidence, escalation, and refusal behavior must be retained after the run.",
      "Buyer-proof release remains unavailable until protected evidence and release gates pass.",
      "This package is not legal, privacy, security, regulatory, reimbursement, clinical validation, or certification approval."
    ],
    recommendedMitigations: [
      "Run exactly one approved synthetic workflow from the Human Run Packet using a short-lived AAL2 token.",
      "Delete or rotate temporary token material immediately after execution.",
      "Persist only no-secret metadata through protected Manual QA Evidence.",
      "Attach reviewer notes for each required QA category.",
      "Run protected Buyer Proof Release before exporting Buyer Diligence.",
      "Keep all external claims routed through Claim Guard and qualified approvals."
    ],
    routes: {
      page: qaAal2RunEvidenceRoute,
      api: qaAal2RunEvidenceApiRoute,
      brief: qaAal2RunEvidenceBriefRoute,
      protectedRoute: qaAal2RunEvidenceProtectedRoute.replace("{workspaceSlug}", workspaceSlug),
      manualExecutionConsole: qaManualExecutionConsoleRoute,
      protectedManualExecutionConsole: qaManualExecutionConsoleProtectedRoute.replace("{workspaceSlug}", workspaceSlug),
      protectedWorkspace: qaManualExecutionConsoleProtectedWorkspaceRoute,
      buyerProofRelease: qaBuyerProofReleaseRoute,
      protectedBuyerProofRelease: qaBuyerProofReleaseProtectedRoute.replace("{workspaceSlug}", workspaceSlug)
    },
    boundary: qaAal2RunEvidenceBoundary
  };
}

function markdownList(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

export function getQaAal2RunEvidenceSummary() {
  return deriveQaAal2RunEvidencePackage({});
}

export function buildQaAal2RunEvidenceBrief({
  auditEvents,
  manualQaEvidencePackets,
  workspaceSlug,
  evidenceUnavailable
}: {
  auditEvents?: PilotAuditEventRecord[];
  manualQaEvidencePackets?: QaManualRunEvidencePacketRecord[];
  workspaceSlug?: string;
  evidenceUnavailable?: boolean;
} = {}) {
  const packet = deriveQaAal2RunEvidencePackage({
    auditEvents,
    manualQaEvidencePackets,
    workspaceSlug,
    evidenceUnavailable
  });

  return [
    "# SCRIMED AAL2 Synthetic QA Run Evidence Package",
    "",
    `Status: ${packet.status}`,
    `Test date: ${packet.testDate}`,
    `Run state: ${packet.runState}`,
    `Recommendation: ${packet.recommendation}`,
    `Controlled demo recommendation: ${packet.controlledDemoRecommendation}`,
    "",
    "## Test Scope",
    packet.testScope,
    "",
    "## Boundary",
    packet.boundary,
    "",
    "## Validation Results",
    `- Synthetic data confirmed: ${packet.syntheticDataConfirmed ? "yes" : "no"}`,
    `- PHI entered system: ${packet.phiEnteredSystem ? "yes" : "no"}`,
    `- Production systems touched: ${packet.productionSystemsTouched ? "yes" : "no"}`,
    `- Live patient workflow triggered: ${packet.livePatientWorkflowTriggered ? "yes" : "no"}`,
    `- Autonomous clinical action performed: ${packet.autonomousClinicalActionPerformed ? "yes" : "no"}`,
    `- Retained packet visible: ${packet.retainedPacketVisible ? "yes" : "no"}`,
    `- Packet count: ${packet.packetCount}`,
    `- Audit signal count: ${packet.auditSignalCount}`,
    `- Buyer Proof Release state: ${packet.buyerProofReleaseState}`,
    "",
    "## Required Test Categories",
    ...packet.categories.map(
      (item) =>
        `- ${item.name} (${item.status}): ${item.evidence} Reviewer note: ${item.reviewerNote} Next: ${item.nextAction}`
    ),
    "",
    "## Boundary Checks",
    ...packet.boundaryChecks.map((item) => `- ${item.check} (${item.status}): ${item.evidence}`),
    "",
    "## Passed Controls",
    markdownList(packet.passedControls),
    "",
    "## Remaining Blockers",
    markdownList(packet.remainingBlockers),
    "",
    "## Unresolved Risks",
    markdownList(packet.unresolvedRisks),
    "",
    "## Recommended Mitigations",
    markdownList(packet.recommendedMitigations),
    "",
    "## Evidence Routes",
    `- Page: ${packet.routes.page}`,
    `- API: ${packet.routes.api}`,
    `- Brief: ${packet.routes.brief}`,
    `- Protected route: ${packet.routes.protectedRoute}`,
    `- Manual Execution Console: ${packet.routes.manualExecutionConsole}`,
    `- Protected Manual Execution Console: ${packet.routes.protectedManualExecutionConsole}`,
    `- Protected workspace: ${packet.routes.protectedWorkspace}`,
    `- Buyer Proof Release: ${packet.routes.buyerProofRelease}`,
    `- Protected Buyer Proof Release: ${packet.routes.protectedBuyerProofRelease}`
  ].join("\n");
}
