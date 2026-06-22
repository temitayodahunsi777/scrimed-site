import {
  getQaEvidenceLedger,
  qaManualRunEvidencePacketApiRoute,
  qaManualRunEvidencePersistenceApiRoute,
  type QaManualRunWorkflowKind
} from "./qaEvidenceLedger";
import { getQaExecutionReadinessSummary } from "./qaExecutionReadiness";

export type QaRunControlGateState =
  | "required-before-run"
  | "required-during-run"
  | "required-after-run"
  | "hard-stop";

export type QaRunControlGate = {
  gate: string;
  state: QaRunControlGateState;
  owner: string;
  passSignal: string;
  failSignal: string;
  boundary: string;
};

export type QaRunControlEvidenceTemplate = {
  workflowKind: QaManualRunWorkflowKind;
  workflowRunId: string;
  workflowRunUrl: string;
  executedAt: string;
  baseUrl: string;
  intakeId: string;
  createdSessionId: string;
  packetAuditEventId: string;
  qaOutcome: "pass";
  operatorAttestation: "no-secrets-no-phi-aal2-human-run";
  tokenDisposalAttestation: "temporary-token-deleted-or-rotated";
  dataBoundary: "synthetic-business-workflow-only";
};

export type QaRunControlWorkflow = {
  workflowKind: QaManualRunWorkflowKind;
  name: string;
  state: "ready-for-operator-control-human-aal2-required";
  dispatchPath: string;
  dispatchInputs: Record<string, string | boolean>;
  temporarySecret: string;
  preflightCommandTemplate: string;
  smokeCommandTemplate: string;
  safeEvidenceTemplate: QaRunControlEvidenceTemplate;
  evidencePacketRoute: string;
  protectedPersistenceRoute: string;
  buyerProofPromotionRule: string;
  abortConditions: string[];
  acceptedEvidenceFields: string[];
  forbiddenEvidence: string[];
  operatorSequence: string[];
};

export const qaRunControlStatus = "manual-aal2-qa-run-control-ready";
export const qaRunControlProofStackStatus =
  "manual-aal2-qa-run-control-no-secret-operator-brief";
export const qaRunControlBriefProofStackStatus =
  "manual-aal2-qa-run-control-brief-no-auth-claim";

export const qaRunControlRoute = "/qa-run-control";
export const qaRunControlApiRoute = "/api/qa-evidence/run-control";
export const qaRunControlBriefRoute = "/api/qa-evidence/run-control/brief";

export const qaRunControlBoundary =
  "SCRIMED Manual AAL2 QA Run Control creates a no-secret operator mission-control layer for human-run synthetic QA. It does not execute AAL2 ceremonies, mint tokens, store credentials, run unattended authenticated CI, process PHI, authorize clinical care, certify security or compliance, guarantee reimbursement, approve production connectors, or claim retained authenticated proof before protected no-secret evidence is persisted.";

const forbiddenEvidence = [
  "bearer tokens",
  "refresh tokens",
  "passwords",
  "API keys",
  "JWT strings",
  "PHI",
  "patient identifiers",
  "payer member identifiers",
  "artifact URLs",
  "signed approvals",
  "legal opinions",
  "security reports",
  "reimbursement determinations",
  "source contracts",
  "production credentials",
  "clinical records"
];

const sharedAbortConditions = [
  "No fresh human AAL2 session is available.",
  "The target is not synthetic or metadata-only.",
  "The token preflight fails or the token lifetime is too long.",
  "The workflow requires a long-lived or committed credential.",
  "Any evidence field contains a token, credential, PHI, patient identifier, payer member identifier, artifact URL, legal approval, security report, reimbursement determination, or production clinical record.",
  "The operator cannot delete or rotate the temporary secret after the run.",
  "Buyer Diligence is requested before no-secret evidence metadata is retained."
];

const gates: QaRunControlGate[] = [
  {
    gate: "Fresh human AAL2 session",
    state: "required-before-run",
    owner: "Tenant-admin or pilot-lead operator",
    passSignal: "Operator confirms AAL2 session and scoped role in the protected workspace.",
    failSignal: "No AAL2 session, stale session, ambiguous role, or shared account.",
    boundary: "AAL2 confirms operator context only; it is not clinical, legal, security, or reimbursement authority."
  },
  {
    gate: "Synthetic target selected",
    state: "required-before-run",
    owner: "Workflow owner",
    passSignal: "Exactly one synthetic intake ID or workspace slug is selected before dispatch.",
    failSignal: "Target is missing, broad, production-linked, or contains regulated data.",
    boundary: "Targets must remain synthetic business workflow metadata."
  },
  {
    gate: "Short-lived token preflight",
    state: "required-before-run",
    owner: "Release engineering",
    passSignal: "Preflight passes with AAL2, session_id, expiry, and minimum remaining lifetime checks.",
    failSignal: "Weak token shape, missing AAL2, missing session, expired token, or excessive lifetime.",
    boundary: "Preflight is not signature verification; protected APIs remain the authority."
  },
  {
    gate: "Manual workflow dispatch",
    state: "required-during-run",
    owner: "Human operator",
    passSignal: "Manual GitHub workflow passes against the explicit synthetic target.",
    failSignal: "Workflow is scheduled, target is implicit, or authenticated path is optional.",
    boundary: "Passing smoke proves only the synthetic protected route under review-gated conditions."
  },
  {
    gate: "Secret disposal",
    state: "required-after-run",
    owner: "Security owner and human operator",
    passSignal: "Temporary masked secret is deleted or rotated immediately after completion.",
    failSignal: "Token remains in GitHub, Vercel, source, docs, logs, packets, screenshots, or chat.",
    boundary: "The token is never evidence and must not be retained."
  },
  {
    gate: "No-secret packet persistence",
    state: "required-after-run",
    owner: "Tenant governance operator",
    passSignal: "Only safe metadata is persisted through the protected Manual QA Evidence route.",
    failSignal: "Packet contains secrets, PHI, approvals, reports, clinical records, or unsupported identifiers.",
    boundary: "Retained proof is limited to synthetic workflow metadata and packet hash."
  },
  {
    gate: "Buyer proof promotion",
    state: "hard-stop",
    owner: "Sales engineering and trust reviewer",
    passSignal: "Buyer Diligence is exported after packet hash and audit event are visible.",
    failSignal: "Buyer material claims authenticated proof before no-secret metadata is persisted.",
    boundary: "Buyer proof can reference retained QA evidence only after protected persistence."
  }
];

function commandTemplates(workflowKind: QaManualRunWorkflowKind, preflightScript: string, smokeScript: string) {
  if (workflowKind === "authority-reference-qa") {
    return {
      preflight:
        "SCRIMED_REQUIRE_AUTHORITY_REFERENCE_QA=1 SCRIMED_WORKSPACE_SLUG=<synthetic-workspace-slug> SCRIMED_BEARER_TOKEN=<short-lived-aal2-token> node " +
        preflightScript,
      smoke:
        "SCRIMED_REQUIRE_AUTHORITY_REFERENCE_QA=1 SCRIMED_BASE_URL=https://app.scrimedsolutions.com SCRIMED_WORKSPACE_SLUG=<synthetic-workspace-slug> SCRIMED_BEARER_TOKEN=<short-lived-aal2-token> node " +
        smokeScript
    };
  }

  return {
    preflight:
      "SCRIMED_REQUIRE_SALES_QA=1 SCRIMED_SALES_QA_INTAKE_ID=<synthetic-intake-id> SCRIMED_SALES_QA_BEARER_TOKEN=<short-lived-aal2-token> node " +
      preflightScript,
    smoke:
      "SCRIMED_REQUIRE_SALES_QA=1 SCRIMED_BASE_URL=https://app.scrimedsolutions.com SCRIMED_SALES_QA_INTAKE_ID=<synthetic-intake-id> SCRIMED_SALES_QA_BEARER_TOKEN=<short-lived-aal2-token> node " +
      smokeScript
  };
}

function dispatchInputs(workflowKind: QaManualRunWorkflowKind): Record<string, string | boolean> {
  if (workflowKind === "authority-reference-qa") {
    return {
      base_url: "https://app.scrimedsolutions.com",
      workspace_slug: "atlas-synthetic-evaluation",
      require_authenticated_path: true
    };
  }

  return {
    base_url: "https://app.scrimedsolutions.com",
    intake_id: "<synthetic-sales-opportunity-intake-id>",
    require_authenticated_path: true
  };
}

function evidenceTemplate(workflowKind: QaManualRunWorkflowKind): QaRunControlEvidenceTemplate {
  const isAuthorityReference = workflowKind === "authority-reference-qa";

  return {
    workflowKind,
    workflowRunId: "<numeric-github-actions-run-id>",
    workflowRunUrl:
      "https://github.com/temitayodahunsi777/scrimed-site/actions/runs/<numeric-github-actions-run-id>",
    executedAt: "<iso-8601-run-timestamp>",
    baseUrl: "https://app.scrimedsolutions.com",
    intakeId: isAuthorityReference
      ? "atlas-synthetic-evaluation"
      : "<synthetic-sales-opportunity-intake-id>",
    createdSessionId: isAuthorityReference
      ? "<created-authority-reference-uuid>"
      : "<created-demo-session-uuid>",
    packetAuditEventId: isAuthorityReference
      ? "<authority-reference-packet-audit-event-uuid>"
      : "<demo-session-packet-audit-event-uuid>",
    qaOutcome: "pass",
    operatorAttestation: "no-secrets-no-phi-aal2-human-run",
    tokenDisposalAttestation: "temporary-token-deleted-or-rotated",
    dataBoundary: "synthetic-business-workflow-only"
  };
}

function operatorSequence(workflowKind: QaManualRunWorkflowKind) {
  const targetStep =
    workflowKind === "authority-reference-qa"
      ? "Use the protected synthetic workspace slug as the explicit target."
      : "Use one explicit synthetic Sales Operations intake ID as the target.";

  return [
    "Open the protected workspace in a fresh browser session and confirm AAL2 posture.",
    targetStep,
    "Create a temporary masked GitHub Actions secret for the short-lived AAL2 token.",
    "Dispatch the manual workflow with require_authenticated_path=true.",
    "Verify preflight passed before the authenticated smoke runs.",
    "Copy only the workflow run ID, run URL, created safe object ID, packet audit event ID, and timestamp.",
    "Delete or rotate the temporary secret immediately after the workflow completes.",
    "Persist the safe metadata through /pilot-workspace/access -> Manual QA Evidence.",
    "Export Buyer Diligence only after the packet hash and audit event are visible."
  ];
}

function buildWorkflowControls(): QaRunControlWorkflow[] {
  const readiness = getQaExecutionReadinessSummary();

  return readiness.dispatchWorkflows.map((workflow) => {
    const workflowKind = workflow.workflowKind as QaManualRunWorkflowKind;
    const commands = commandTemplates(workflowKind, workflow.preflightScript, workflow.smokeScript);

    return {
      workflowKind,
      name: workflow.name,
      state: "ready-for-operator-control-human-aal2-required",
      dispatchPath: workflow.dispatchPath,
      dispatchInputs: dispatchInputs(workflowKind),
      temporarySecret: workflow.temporarySecret,
      preflightCommandTemplate: commands.preflight,
      smokeCommandTemplate: commands.smoke,
      safeEvidenceTemplate: evidenceTemplate(workflowKind),
      evidencePacketRoute: qaManualRunEvidencePacketApiRoute,
      protectedPersistenceRoute: qaManualRunEvidencePersistenceApiRoute,
      buyerProofPromotionRule:
        "Do not promote this workflow into Buyer Diligence until the protected workspace shows a retained packet SHA-256 and append-only audit event.",
      abortConditions: sharedAbortConditions,
      acceptedEvidenceFields: workflow.retainedEvidenceRequired,
      forbiddenEvidence,
      operatorSequence: operatorSequence(workflowKind)
    };
  });
}

function markdownList(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

function workflowBrief(workflows: QaRunControlWorkflow[]) {
  return workflows.flatMap((workflow) => [
    `## ${workflow.name}`,
    `- Workflow kind: ${workflow.workflowKind}`,
    `- State: ${workflow.state}`,
    `- Dispatch path: ${workflow.dispatchPath}`,
    `- Temporary secret: ${workflow.temporarySecret}`,
    `- Evidence packet route: ${workflow.evidencePacketRoute}`,
    `- Protected persistence route: ${workflow.protectedPersistenceRoute}`,
    `- Buyer proof rule: ${workflow.buyerProofPromotionRule}`,
    "",
    "Dispatch inputs:",
    "```json",
    JSON.stringify(workflow.dispatchInputs, null, 2),
    "```",
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
    "Safe evidence template:",
    "```json",
    JSON.stringify(workflow.safeEvidenceTemplate, null, 2),
    "```",
    "",
    "Operator sequence:",
    ...workflow.operatorSequence.map((step, index) => `${index + 1}. ${step}`),
    "",
    "Abort conditions:",
    markdownList(workflow.abortConditions),
    ""
  ]);
}

export function getQaRunControlSummary() {
  const ledger = getQaEvidenceLedger();
  const readiness = getQaExecutionReadinessSummary();
  const workflows = buildWorkflowControls();
  const uniqueRejectedEvidence = new Set(workflows.flatMap((workflow) => workflow.forbiddenEvidence));

  return {
    service: "scrimed-manual-aal2-qa-run-control",
    route: qaRunControlRoute,
    apiRoute: qaRunControlApiRoute,
    briefRoute: qaRunControlBriefRoute,
    status: qaRunControlStatus,
    proofStackStatus: qaRunControlProofStackStatus,
    briefProofStackStatus: qaRunControlBriefProofStackStatus,
    boundary: qaRunControlBoundary,
    executionDecision: "operator-control-ready-human-aal2-required",
    buyerClaimStatus: "operator-brief-ready-not-retained-authenticated-proof",
    sourceReadinessStatus: readiness.status,
    sourceLedgerStatus: ledger.status,
    workflowCount: workflows.length,
    gateCount: gates.length,
    hardStopGateCount: gates.filter((gate) => gate.state === "hard-stop").length,
    forbiddenEvidenceCount: uniqueRejectedEvidence.size,
    commandTemplateCount: workflows.length * 2,
    evidenceTemplateCount: workflows.length,
    gates,
    workflows,
    operatorBriefRoutes: [qaRunControlBriefRoute, readiness.briefRoute, ledger.activationPlan.briefRoute],
    claimRules: [
      "Allowed now: SCRIMED has operator-ready AAL2 QA run-control briefs and workflow-specific safe evidence templates.",
      "Allowed now: SCRIMED can tell an operator exactly what to run, what to copy, what to reject, and when buyer proof can be promoted.",
      "Not allowed yet: SCRIMED has retained authenticated AAL2 QA proof for these workflows.",
      "Not allowed yet: SCRIMED is authorized for live clinical care, PHI processing, payer submission, production connectors, security certification, reimbursement certainty, or regional clinical deployment."
    ],
    nextRecommendedBuildStep:
      "Use this run-control layer, then /qa-human-run-packet, during the first human AAL2 run; persist the no-secret evidence packet through the protected workspace, then update Buyer Diligence only after packet hash visibility is verified.",
    updated: "2026-06-21"
  };
}

export function buildQaRunControlBrief() {
  const summary = getQaRunControlSummary();

  return [
    "# SCRIMED Manual AAL2 QA Run Control Brief",
    "",
    `Status: ${summary.status}`,
    `Execution decision: ${summary.executionDecision}`,
    `Buyer claim status: ${summary.buyerClaimStatus}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "## Claim Rules",
    markdownList(summary.claimRules),
    "",
    "## Gates",
    ...summary.gates.map(
      (gate) =>
        `- ${gate.gate} (${gate.state}): pass when ${gate.passSignal} Fail when ${gate.failSignal} Boundary: ${gate.boundary}`
    ),
    "",
    ...workflowBrief(summary.workflows),
    "## Next Recommended Build Step",
    summary.nextRecommendedBuildStep
  ].join("\n");
}
