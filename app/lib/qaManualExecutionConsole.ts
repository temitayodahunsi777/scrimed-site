import type { PilotAuditEventRecord } from "./protectedPilotWorkspace";
import type {
  QaManualRunEvidencePacketRecord,
  QaManualRunWorkflowKind
} from "./qaEvidenceLedger";
import {
  deriveQaBuyerProofReleaseDecision,
  qaBuyerProofReleaseRoute,
  qaBuyerProofReleaseStatus
} from "./qaBuyerProofRelease";
import { getQaHumanRunPacketSummary } from "./qaHumanRunPacket";

export type QaManualExecutionConsoleState =
  | "operator-aal2-run-required"
  | "retained-evidence-visible-release-review-required"
  | "ready-for-buyer-proof-release"
  | "blocked-boundary-review";

export type QaManualExecutionConsoleStage = {
  id: string;
  name: string;
  status: "passed" | "blocked" | "review";
  owner: string;
  evidence: string;
  action: string;
};

export type QaManualExecutionConsoleWorkflow = {
  workflowKind: QaManualRunWorkflowKind;
  name: string;
  dispatchPath: string;
  defaultSyntheticTarget: string;
  temporarySecret: string;
  preflightCommandTemplate: string;
  smokeCommandTemplate: string;
  safeEvidenceFields: string[];
  protectedPersistenceRoute: string;
  buyerProofReleaseRoute: string;
  abortConditions: string[];
};

export type QaManualExecutionConsoleDecision = {
  state: QaManualExecutionConsoleState;
  protectedExecutionRequired: boolean;
  manualRunRequired: boolean;
  retainedPacketVisible: boolean;
  buyerProofReleaseReady: boolean;
  packetCount: number;
  auditSignalCount: number;
  latestPacketHash: string;
  latestWorkflowRunId: string;
  latestWorkflowKind: string;
  latestPacketAuditEventId: string;
  releaseDecisionState: string;
  stages: QaManualExecutionConsoleStage[];
  nextAction: string;
  buyerSafeClaim: string;
  blockedAuthorityClaims: string[];
  hardStops: string[];
  boundary: string;
};

export const qaManualExecutionConsoleStatus =
  "manual-aal2-qa-execution-console-ready";
export const qaManualExecutionConsoleProofStackStatus =
  "manual-aal2-qa-execution-console-protected-operator-control";
export const qaManualExecutionConsoleBriefProofStackStatus =
  "manual-aal2-qa-execution-console-brief-no-auth-claim";

export const qaManualExecutionConsoleRoute = "/qa-manual-execution-console";
export const qaManualExecutionConsoleApiRoute =
  "/api/qa-evidence/manual-execution-console";
export const qaManualExecutionConsoleBriefRoute =
  "/api/qa-evidence/manual-execution-console/brief";
export const qaManualExecutionConsoleProtectedRoute =
  "/api/pilot-workspaces/{workspaceSlug}/qa-evidence/manual-execution-console";
export const qaManualExecutionConsoleProtectedWorkspaceRoute =
  "/pilot-workspace/access#manual-qa-execution-console";

export const qaManualExecutionConsoleBoundary =
  "SCRIMED Manual QA Execution Console coordinates human AAL2 synthetic QA execution, retained no-secret evidence capture, and Buyer Proof Release checks. It does not execute passkey ceremonies, mint or store tokens, store PHI, run unattended authenticated CI, certify security or compliance, authorize live clinical care, guarantee reimbursement, approve production connectors, or create public release authority.";

const hardStops = [
  "No fresh human AAL2 tenant governance session is available.",
  "The operator cannot identify one explicit synthetic target.",
  "The workflow is scheduled, unattended, or does not require the authenticated path.",
  "The preflight token check fails or a long-lived credential is requested.",
  "Any candidate evidence includes bearer tokens, refresh tokens, API keys, passwords, PHI, patient identifiers, payer member identifiers, clinical records, legal opinions, security reports, artifact URLs, reimbursement determinations, or production credentials.",
  "Temporary token material was not deleted or rotated after the run.",
  "Protected Manual QA Evidence cannot show a packet SHA-256 and append-only audit event.",
  "Buyer Diligence or public language claims retained proof, live clinical care authority, PHI authority, certification, reimbursement certainty, connector approval, or production authorization before protected release."
];

const blockedAuthorityClaims = [
  "human AAL2 proof has been completed without protected retained packet visibility",
  "SCRIMED is authorized for live clinical care",
  "SCRIMED can process production PHI",
  "SCRIMED is HIPAA certified, SOC 2 certified, FDA cleared, or legally approved",
  "SCRIMED guarantees reimbursement, payer approval, or claim submission authority",
  "SCRIMED can autonomously diagnose, treat, contact patients, or execute clinical care",
  "SCRIMED production EHR, FHIR, payer, imaging, or device connectors are approved"
];

function hasManualQaAuditSignal(auditEvents: PilotAuditEventRecord[]) {
  return auditEvents.filter((event) => event.eventType === "manual-qa-evidence-packet-recorded").length;
}

function stage(
  id: string,
  name: string,
  passed: boolean,
  owner: string,
  evidence: string,
  action: string,
  review = false
): QaManualExecutionConsoleStage {
  return {
    id,
    name,
    status: passed ? "passed" : review ? "review" : "blocked",
    owner,
    evidence,
    action
  };
}

function safeEvidenceFields(workflow: ReturnType<typeof getQaHumanRunPacketSummary>["workflows"][number]) {
  return [
    "workflowKind",
    "workflowRunId",
    "workflowRunUrl",
    "executedAt",
    "baseUrl",
    workflow.workflowKind === "authority-reference-qa"
      ? "workspace slug as synthetic target"
      : "synthetic sales opportunity intake ID",
    workflow.workflowKind === "authority-reference-qa"
      ? "created authority reference UUID"
      : "created demo session UUID",
    workflow.workflowKind === "authority-reference-qa"
      ? "authority reference packet audit event UUID"
      : "demo session packet audit event UUID",
    "qaOutcome=pass",
    "operatorAttestation=no-secrets-no-phi-aal2-human-run",
    "tokenDisposalAttestation=temporary-token-deleted-or-rotated",
    "dataBoundary=synthetic-business-workflow-only",
    "packetSha256 after protected persistence"
  ];
}

function workflows(): QaManualExecutionConsoleWorkflow[] {
  const humanRunPacket = getQaHumanRunPacketSummary();

  return humanRunPacket.workflows.map((workflow) => ({
    workflowKind: workflow.workflowKind,
    name: workflow.name,
    dispatchPath: workflow.dispatchPath,
    defaultSyntheticTarget: workflow.defaultSyntheticTarget,
    temporarySecret: workflow.temporarySecret,
    preflightCommandTemplate: workflow.preflightCommandTemplate,
    smokeCommandTemplate: workflow.smokeCommandTemplate,
    safeEvidenceFields: safeEvidenceFields(workflow),
    protectedPersistenceRoute: workflow.protectedPersistenceRoute,
    buyerProofReleaseRoute: qaBuyerProofReleaseRoute,
    abortConditions: workflow.abortConditions
  }));
}

export function deriveQaManualExecutionConsoleDecision({
  auditEvents = [],
  manualQaEvidencePackets = [],
  workspaceSlug = "{workspaceSlug}"
}: {
  auditEvents?: PilotAuditEventRecord[];
  manualQaEvidencePackets?: QaManualRunEvidencePacketRecord[];
  workspaceSlug?: string;
}): QaManualExecutionConsoleDecision {
  const latest = manualQaEvidencePackets[0] ?? null;
  const retainedPacketVisible = Boolean(latest);
  const auditSignalCount = hasManualQaAuditSignal(auditEvents);
  const releaseDecision = deriveQaBuyerProofReleaseDecision({
    auditEvents,
    manualQaEvidencePackets,
    workspaceSlug
  });
  const buyerProofReleaseReady = releaseDecision.buyerDiligenceExportAllowed;
  const state: QaManualExecutionConsoleState = buyerProofReleaseReady
    ? "ready-for-buyer-proof-release"
    : retainedPacketVisible
      ? "retained-evidence-visible-release-review-required"
      : auditSignalCount > 0
        ? "blocked-boundary-review"
        : "operator-aal2-run-required";
  const stages = [
    stage(
      "aal2-operator",
      "Fresh human AAL2 operator session",
      retainedPacketVisible,
      "Tenant-admin or pilot-lead",
      retainedPacketVisible
        ? "A retained packet is visible, which implies protected tenant-governed persistence occurred."
        : "No retained packet is visible yet; the operator must complete the protected browser session and manual workflow.",
      "Open the protected workspace with a fresh AAL2 session before dispatch."
    ),
    stage(
      "manual-dispatch",
      "Manual workflow dispatched against one synthetic target",
      retainedPacketVisible,
      "Release engineering and human operator",
      latest
        ? `Workflow ${latest.workflowKind} run ${latest.workflowRunId} is retained.`
        : "The console has no retained workflow run ID yet.",
      "Use the Human Run Packet command template and one explicit synthetic target."
    ),
    stage(
      "secret-disposal",
      "Temporary secret deleted or rotated",
      retainedPacketVisible,
      "Security owner and operator",
      latest
        ? `Token disposal attestation: ${latest.tokenDisposalAttestation}.`
        : "No token-disposal attestation is retained yet.",
      "Delete or rotate temporary token material before packet persistence."
    ),
    stage(
      "safe-metadata",
      "No-secret metadata captured",
      retainedPacketVisible,
      "TrustOS reviewer",
      latest
        ? `Packet ${latest.packetSha256} contains synthetic metadata for ${latest.intakeId}.`
        : "No packet hash is visible yet.",
      "Persist only safe IDs, timestamps, run URL, packet audit UUID, and fixed attestations."
    ),
    stage(
      "append-only-audit",
      "Append-only audit signal visible",
      auditSignalCount > 0,
      "Tenant governance",
      auditSignalCount > 0
        ? `${auditSignalCount} manual QA evidence audit signal(s) are visible.`
        : "No manual QA evidence audit signal is visible.",
      "Refresh protected audit events after packet persistence."
    ),
    stage(
      "buyer-proof-release",
      "Buyer Proof Release passed",
      buyerProofReleaseReady,
      "Buyer diligence and claims governance",
      `Buyer Proof Release state: ${releaseDecision.state}.`,
      releaseDecision.nextAction,
      retainedPacketVisible && !buyerProofReleaseReady
    )
  ];

  return {
    state,
    protectedExecutionRequired: !buyerProofReleaseReady,
    manualRunRequired: !retainedPacketVisible,
    retainedPacketVisible,
    buyerProofReleaseReady,
    packetCount: manualQaEvidencePackets.length,
    auditSignalCount,
    latestPacketHash: latest?.packetSha256 ?? "pending",
    latestWorkflowRunId: latest?.workflowRunId ?? "pending",
    latestWorkflowKind: latest?.workflowKind ?? "pending",
    latestPacketAuditEventId: latest?.packetAuditEventId ?? "pending",
    releaseDecisionState: releaseDecision.state,
    stages,
    nextAction: buyerProofReleaseReady
      ? "Export Buyer Diligence from the protected workspace using only no-secret packet metadata, packet SHA-256, audit event references, and bounded claims."
      : retainedPacketVisible
        ? "Resolve the remaining Buyer Proof Release criteria before exporting packet-backed buyer proof."
        : "Complete one approved human AAL2 synthetic workflow, delete or rotate the temporary token, persist no-secret metadata, then rerun this protected console.",
    buyerSafeClaim: buyerProofReleaseReady
      ? "SCRIMED protected buyer diligence may reference retained no-secret manual AAL2 synthetic QA metadata for this workspace."
      : "SCRIMED has a protected manual QA execution console, but packet-backed buyer proof remains locked until retained evidence and Buyer Proof Release pass.",
    blockedAuthorityClaims,
    hardStops,
    boundary: qaManualExecutionConsoleBoundary
  };
}

function markdownItems(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

function workflowMarkdown(items: QaManualExecutionConsoleWorkflow[]) {
  return items.flatMap((workflow) => [
    `## ${workflow.name}`,
    `- Workflow kind: ${workflow.workflowKind}`,
    `- Dispatch path: ${workflow.dispatchPath}`,
    `- Default synthetic target: ${workflow.defaultSyntheticTarget}`,
    `- Temporary secret: ${workflow.temporarySecret}`,
    `- Protected persistence route: ${workflow.protectedPersistenceRoute}`,
    `- Buyer Proof Release: ${workflow.buyerProofReleaseRoute}`,
    "",
    "Preflight command template:",
    "```bash",
    workflow.preflightCommandTemplate,
    "```",
    "",
    "Smoke command template:",
    "```bash",
    workflow.smokeCommandTemplate,
    "```",
    "",
    "Safe evidence fields:",
    markdownItems(workflow.safeEvidenceFields),
    "",
    "Abort conditions:",
    markdownItems(workflow.abortConditions),
    ""
  ]);
}

export function getQaManualExecutionConsoleSummary() {
  const decision = deriveQaManualExecutionConsoleDecision({});
  const workflowItems = workflows();

  return {
    service: "scrimed-manual-aal2-qa-execution-console",
    route: qaManualExecutionConsoleRoute,
    apiRoute: qaManualExecutionConsoleApiRoute,
    briefRoute: qaManualExecutionConsoleBriefRoute,
    protectedRoute: qaManualExecutionConsoleProtectedRoute,
    protectedWorkspaceRoute: qaManualExecutionConsoleProtectedWorkspaceRoute,
    status: qaManualExecutionConsoleStatus,
    proofStackStatus: qaManualExecutionConsoleProofStackStatus,
    briefProofStackStatus: qaManualExecutionConsoleBriefProofStackStatus,
    sourceBuyerProofReleaseStatus: qaBuyerProofReleaseStatus,
    boundary: qaManualExecutionConsoleBoundary,
    decision,
    consoleState: decision.state,
    workflowCount: workflowItems.length,
    stageCount: decision.stages.length,
    hardStopCount: hardStops.length,
    blockedAuthorityClaimCount: blockedAuthorityClaims.length,
    workflows: workflowItems,
    hardStops,
    blockedAuthorityClaims,
    buyerSafeCurrentLanguage:
      "SCRIMED has a protected operator console for human AAL2 synthetic QA execution, but no buyer proof or production authority exists until retained no-secret packet evidence and Buyer Proof Release pass.",
    nextRecommendedBuildStep:
      "Use the protected Manual QA Execution Console during the first human AAL2 run, persist the safe packet, then refresh Buyer Proof Release and Buyer Diligence export.",
    updated: "2026-06-22"
  };
}

export function buildQaManualExecutionConsoleBrief() {
  const summary = getQaManualExecutionConsoleSummary();

  return [
    "# SCRIMED Manual QA Execution Console Brief",
    "",
    `Status: ${summary.status}`,
    `Console state: ${summary.consoleState}`,
    `Protected route: ${summary.protectedRoute}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "## Current Decision",
    `- Buyer-safe claim: ${summary.decision.buyerSafeClaim}`,
    `- Next action: ${summary.decision.nextAction}`,
    "",
    "## Console Stages",
    ...summary.decision.stages.map(
      (item) => `- ${item.name} (${item.status}): ${item.evidence} Next: ${item.action}`
    ),
    "",
    "## Workflows",
    ...workflowMarkdown(summary.workflows),
    "## Hard Stops",
    markdownItems(summary.hardStops),
    "",
    "## Blocked Authority Claims",
    markdownItems(summary.blockedAuthorityClaims),
    "",
    "## Routes",
    `- Public page: ${summary.route}`,
    `- Public API: ${summary.apiRoute}`,
    `- Brief: ${summary.briefRoute}`,
    `- Protected console: ${summary.protectedRoute}`,
    `- Protected workspace anchor: ${summary.protectedWorkspaceRoute}`,
    `- Buyer Proof Release: ${qaBuyerProofReleaseRoute}`,
    "",
    "## Next Recommended Build Step",
    summary.nextRecommendedBuildStep
  ].join("\n");
}
