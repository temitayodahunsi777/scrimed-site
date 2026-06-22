import {
  getQaProofPromotionSummary,
  qaProofPromotionRoute
} from "./qaProofPromotion";
import { getQaRunControlSummary } from "./qaRunControl";
import type { QaRunControlWorkflow } from "./qaRunControl";

export type QaLaunchKitPhaseState =
  | "prepare"
  | "execute-human-run"
  | "retain-evidence"
  | "promote-proof"
  | "hard-stop";

export type QaLaunchKitPhase = {
  phase: string;
  state: QaLaunchKitPhaseState;
  owner: string;
  operatorAction: string;
  passSignal: string;
  failClosedIf: string;
};

export type QaLaunchWorkflowPacket = {
  workflowKind: QaRunControlWorkflow["workflowKind"];
  name: string;
  dispatchPath: string;
  dispatchInputs: QaRunControlWorkflow["dispatchInputs"];
  temporarySecret: string;
  preflightCommandTemplate: string;
  smokeCommandTemplate: string;
  safeEvidenceTemplate: QaRunControlWorkflow["safeEvidenceTemplate"];
  evidencePacketRoute: string;
  protectedPersistenceRoute: string;
  proofPromotionRoute: string;
  postRunSafeCopyFields: string[];
  operatorSequence: string[];
  abortConditions: string[];
  buyerProofPromotionRule: string;
};

export const qaLaunchKitStatus = "manual-aal2-qa-launch-kit-ready";
export const qaLaunchKitProofStackStatus =
  "manual-aal2-qa-launch-kit-no-secret-human-handoff";
export const qaLaunchKitBriefProofStackStatus =
  "manual-aal2-qa-launch-kit-brief-no-token-storage";

export const qaLaunchKitRoute = "/qa-launch-kit";
export const qaLaunchKitApiRoute = "/api/qa-evidence/launch-kit";
export const qaLaunchKitBriefRoute = "/api/qa-evidence/launch-kit/brief";

export const qaLaunchKitBoundary =
  "SCRIMED Manual AAL2 QA Launch Kit packages the human-run workflow handoff for synthetic QA only. It does not execute passkey ceremonies, mint tokens, store credentials, store PHI, run unattended authenticated CI, certify security or compliance, authorize live clinical care, guarantee reimbursement, approve production connectors, or claim retained authenticated QA proof before protected no-secret packet hashes are visible.";

const launchPhases: QaLaunchKitPhase[] = [
  {
    phase: "Confirm human AAL2 session",
    state: "prepare",
    owner: "Tenant-admin or pilot-lead operator",
    operatorAction:
      "Sign in through the protected pilot workspace and confirm the browser session is fresh, scoped, and AAL2-capable.",
    passSignal: "The operator has an approved tenant role and current AAL2 browser session.",
    failClosedIf: "The session is stale, shared, missing AAL2, or scoped to the wrong tenant."
  },
  {
    phase: "Select exactly one synthetic target",
    state: "prepare",
    owner: "Workflow owner",
    operatorAction:
      "Choose one synthetic sales intake ID or one synthetic protected workspace slug before dispatch.",
    passSignal: "The target is explicit, synthetic, and contains no PHI, payer member data, or production data.",
    failClosedIf: "The target is missing, broad, production-linked, or contains regulated data."
  },
  {
    phase: "Create temporary masked workflow secret",
    state: "prepare",
    owner: "Security owner and operator",
    operatorAction:
      "Place the short-lived AAL2 token only in the manual GitHub Actions secret required for the selected workflow.",
    passSignal: "The token is short-lived, masked, workflow-specific, and never pasted into source, docs, chat, or packets.",
    failClosedIf: "The token is long-lived, copied into evidence, or stored anywhere outside the temporary secret path."
  },
  {
    phase: "Run preflight and dispatch",
    state: "execute-human-run",
    owner: "Release engineering",
    operatorAction:
      "Run the workflow-specific preflight, then dispatch the manual workflow with require_authenticated_path=true.",
    passSignal: "Preflight passes and the manual workflow completes against the explicit synthetic target.",
    failClosedIf: "Preflight fails, authenticated path is optional, the target changes, or the workflow is scheduled."
  },
  {
    phase: "Copy safe metadata only",
    state: "retain-evidence",
    owner: "TrustOS and tenant governance",
    operatorAction:
      "Copy only the workflow run ID, run URL, execution timestamp, synthetic target ID, created safe object UUID, and packet audit event UUID.",
    passSignal: "No token, credential, PHI, artifact URL, source contract, clinical record, or approval artifact enters SCRIMED evidence.",
    failClosedIf: "Any evidence field contains secret-like material or regulated identifiers."
  },
  {
    phase: "Delete or rotate temporary secret",
    state: "retain-evidence",
    owner: "Security owner and operator",
    operatorAction:
      "Delete or rotate the temporary GitHub Actions secret immediately after the workflow completes.",
    passSignal: "Secret disposal attestation is true before packet generation or persistence.",
    failClosedIf: "The temporary token remains available after the run."
  },
  {
    phase: "Persist no-secret packet",
    state: "retain-evidence",
    owner: "Tenant governance operator",
    operatorAction:
      "Generate the no-secret packet, then persist the same metadata through the protected Manual QA Evidence panel.",
    passSignal: "The protected workspace shows packet SHA-256 and append-only audit visibility.",
    failClosedIf: "Packet persistence is attempted without AAL2 tenant governance authorization."
  },
  {
    phase: "Check Proof Promotion",
    state: "promote-proof",
    owner: "Sales engineering and trust reviewer",
    operatorAction:
      "Open Proof Promotion and confirm buyer-diligence-ready status before citing retained authenticated QA evidence.",
    passSignal: "Proof Promotion allows only retained packet metadata and blocked production claims remain visible.",
    failClosedIf: "Buyer material references retained authenticated QA proof before packet hash visibility."
  },
  {
    phase: "Keep production authority blocked",
    state: "hard-stop",
    owner: "Clinical, legal, security, privacy, and compliance owners",
    operatorAction:
      "Keep live clinical care, PHI, payer submission, production connector, reimbursement, security-certification, and compliance claims blocked.",
    passSignal: "Buyer proof remains limited to governed synthetic QA evidence.",
    failClosedIf: "Any stakeholder attempts to convert retained QA proof into live-care or production authorization."
  }
];

const blockedClaims = [
  "human AAL2 workflow completed by code",
  "bearer token retained as evidence",
  "authenticated QA proof retained before packet hash visibility",
  "PHI processed or validated",
  "live clinical care authorized",
  "security certification completed",
  "compliance certification completed",
  "reimbursement outcome guaranteed",
  "production connector approved",
  "autonomous diagnosis or treatment authorized"
];

function launchWorkflow(workflow: QaRunControlWorkflow): QaLaunchWorkflowPacket {
  return {
    workflowKind: workflow.workflowKind,
    name: workflow.name,
    dispatchPath: workflow.dispatchPath,
    dispatchInputs: workflow.dispatchInputs,
    temporarySecret: workflow.temporarySecret,
    preflightCommandTemplate: workflow.preflightCommandTemplate,
    smokeCommandTemplate: workflow.smokeCommandTemplate,
    safeEvidenceTemplate: workflow.safeEvidenceTemplate,
    evidencePacketRoute: workflow.evidencePacketRoute,
    protectedPersistenceRoute: workflow.protectedPersistenceRoute,
    proofPromotionRoute: qaProofPromotionRoute,
    postRunSafeCopyFields: [
      "workflowKind",
      "workflowRunId",
      "workflowRunUrl",
      "executedAt",
      "baseUrl",
      "intakeId or workspaceSlug",
      "createdSessionId or created authority reference UUID",
      "packetAuditEventId",
      "qaOutcome=pass",
      "operatorAttestation=no-secrets-no-phi-aal2-human-run",
      "tokenDisposalAttestation=temporary-token-deleted-or-rotated",
      "dataBoundary=synthetic-business-workflow-only"
    ],
    operatorSequence: workflow.operatorSequence,
    abortConditions: workflow.abortConditions,
    buyerProofPromotionRule: workflow.buyerProofPromotionRule
  };
}

function markdownItems(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

function workflowMarkdown(workflows: QaLaunchWorkflowPacket[]) {
  return workflows.flatMap((workflow) => [
    `## ${workflow.name}`,
    `- Workflow kind: ${workflow.workflowKind}`,
    `- Dispatch path: ${workflow.dispatchPath}`,
    `- Temporary secret: ${workflow.temporarySecret}`,
    `- Evidence packet route: ${workflow.evidencePacketRoute}`,
    `- Protected persistence route: ${workflow.protectedPersistenceRoute}`,
    `- Proof promotion route: ${workflow.proofPromotionRoute}`,
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
    "Safe copy fields:",
    markdownItems(workflow.postRunSafeCopyFields),
    "",
    "Abort conditions:",
    markdownItems(workflow.abortConditions),
    ""
  ]);
}

export function getQaLaunchKitSummary() {
  const runControl = getQaRunControlSummary();
  const proofPromotion = getQaProofPromotionSummary();
  const workflows = runControl.workflows.map(launchWorkflow);
  const uniqueSafeFields = new Set(workflows.flatMap((workflow) => workflow.postRunSafeCopyFields));

  return {
    service: "scrimed-manual-aal2-qa-launch-kit",
    route: qaLaunchKitRoute,
    apiRoute: qaLaunchKitApiRoute,
    briefRoute: qaLaunchKitBriefRoute,
    status: qaLaunchKitStatus,
    proofStackStatus: qaLaunchKitProofStackStatus,
    briefProofStackStatus: qaLaunchKitBriefProofStackStatus,
    boundary: qaLaunchKitBoundary,
    launchDecision: "ready-for-human-launch-not-code-execution",
    buyerClaimStatus: "operator-handoff-ready-not-retained-authenticated-proof",
    sourceRunControlStatus: runControl.status,
    sourceProofPromotionStatus: proofPromotion.status,
    proofPromotionState: proofPromotion.promotionDecisionState,
    workflowCount: workflows.length,
    phaseCount: launchPhases.length,
    hardStopPhaseCount: launchPhases.filter((phase) => phase.state === "hard-stop").length,
    safeCopyFieldCount: uniqueSafeFields.size,
    blockedClaimCount: blockedClaims.length,
    phases: launchPhases,
    workflows,
    blockedClaims,
    launchRules: [
      "Allowed now: SCRIMED can hand an approved operator an exact no-secret launch packet.",
      "Allowed now: SCRIMED can predefine dispatch inputs, command templates, safe evidence fields, abort conditions, and post-run promotion checks.",
      "Not allowed yet: SCRIMED has completed the human AAL2 run or retained authenticated QA proof.",
      "Never allowed from this launch kit: clinical care authority, PHI processing authority, payer submission authority, security certification, reimbursement certainty, production connector approval, or autonomous clinical action."
    ],
    nextRecommendedBuildStep:
      "Have an approved tenant-admin operator use /qa-human-run-packet to dispatch exactly one workflow with a fresh short-lived AAL2 token, persist only the no-secret packet metadata, then verify Claim Guard, Activation Seal, and Proof Promotion before exporting Buyer Diligence.",
    updated: "2026-06-22"
  };
}

export function buildQaLaunchKitBrief() {
  const summary = getQaLaunchKitSummary();

  return [
    "# SCRIMED Manual AAL2 QA Launch Kit",
    "",
    `Status: ${summary.status}`,
    `Launch decision: ${summary.launchDecision}`,
    `Buyer claim status: ${summary.buyerClaimStatus}`,
    `Proof promotion state: ${summary.proofPromotionState}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "## Launch Rules",
    markdownItems(summary.launchRules),
    "",
    "## Launch Phases",
    ...summary.phases.map(
      (phase) =>
        `- ${phase.phase} (${phase.state}): ${phase.operatorAction} Pass: ${phase.passSignal} Fail closed if: ${phase.failClosedIf}`
    ),
    "",
    ...workflowMarkdown(summary.workflows),
    "## Blocked Claims",
    markdownItems(summary.blockedClaims),
    "",
    "## Next Recommended Build Step",
    summary.nextRecommendedBuildStep
  ].join("\n");
}
