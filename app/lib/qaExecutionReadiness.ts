import { getBoundaryResolutionSummary } from "./boundaryResolution";
import { getQaEvidenceActivationPlan, getQaEvidenceLedger } from "./qaEvidenceLedger";

export type QaExecutionGateState =
  | "ready"
  | "human-required"
  | "blocked-until-run"
  | "post-run-required";

export type QaExecutionStage = {
  stage: string;
  state: QaExecutionGateState;
  owner: string;
  operatorAction: string;
  evidenceAccepted: string[];
  evidenceRejected: string[];
  productionBoundary: string;
};

export type QaExecutionWorkflowReadiness = {
  workflowKind: string;
  name: string;
  state: "ready-for-human-aal2-run-not-executed";
  dispatchPath: string;
  preflightScript: string;
  smokeScript: string;
  targetInput: string;
  temporarySecret: string;
  protectedRoutes: string[];
  safeEvidenceFields: string[];
  hardStops: string[];
  retainedEvidenceRequired: string[];
  buyerProofImpact: string;
  boundary: string;
  nextAction: string;
};

export const qaExecutionReadinessStatus =
  "manual-aal2-qa-execution-readiness-ready";
export const qaExecutionReadinessProofStackStatus =
  "manual-aal2-qa-execution-go-no-go-no-secret";
export const qaExecutionReadinessBriefProofStackStatus =
  "manual-aal2-qa-execution-brief-no-proof-claim";

export const qaExecutionReadinessRoute = "/qa-execution-readiness";
export const qaExecutionReadinessApiRoute = "/api/qa-evidence/execution-readiness";
export const qaExecutionReadinessBriefRoute =
  "/api/qa-evidence/execution-readiness/brief";

export const qaExecutionReadinessBoundary =
  "SCRIMED Manual AAL2 QA Execution Readiness coordinates human-run authenticated synthetic QA. It does not mint bearer tokens, execute passkey ceremonies, store secrets, run unattended authenticated CI, process PHI, authorize clinical care, certify compliance, grant reimbursement certainty, approve production connectors, or claim authenticated proof before retained no-secret evidence exists.";

const rejectedEvidence = [
  "bearer tokens",
  "refresh tokens",
  "passwords",
  "API keys",
  "PHI",
  "patient identifiers",
  "payer member identifiers",
  "artifact URLs",
  "signed approvals",
  "legal opinions",
  "security reports",
  "reimbursement determinations",
  "production credentials",
  "clinical records"
];

const executionStages: QaExecutionStage[] = [
  {
    stage: "1. Human AAL2 session",
    state: "human-required",
    owner: "SCRIMED tenant-admin or pilot-lead operator",
    operatorAction:
      "Open the protected workspace in a fresh browser session and confirm AAL2 governance before minting any short-lived token.",
    evidenceAccepted: ["operator role", "workspace slug", "AAL2 session timestamp"],
    evidenceRejected: rejectedEvidence,
    productionBoundary:
      "This confirms operator context only; it is not clinical, legal, security, reimbursement, or production authorization."
  },
  {
    stage: "2. Explicit synthetic target",
    state: "ready",
    owner: "Release engineering and buyer-workflow owner",
    operatorAction:
      "Select exactly one synthetic Sales Operations intake ID or protected workspace slug before dispatch.",
    evidenceAccepted: ["workflow kind", "intake ID or workspace slug", "base URL"],
    evidenceRejected: rejectedEvidence,
    productionBoundary:
      "Targets must remain synthetic or no-PHI metadata-only. No patient, payer member, EHR, source contract, or production connector target is allowed."
  },
  {
    stage: "3. Token preflight",
    state: "human-required",
    owner: "Release engineering",
    operatorAction:
      "Run the workflow preflight so weak token shape, expiry, missing AAL2, missing session, or wrong target fails before authenticated requests.",
    evidenceAccepted: ["preflight pass/fail", "token lifetime policy status", "target confirmation"],
    evidenceRejected: rejectedEvidence,
    productionBoundary:
      "Preflight is only a local safety gate. Protected SCRIMED APIs and Supabase Auth remain the verification authority."
  },
  {
    stage: "4. Authenticated smoke",
    state: "blocked-until-run",
    owner: "Human operator",
    operatorAction:
      "Dispatch the manual workflow and allow it to create only synthetic/no-PHI metadata under the short-lived AAL2 session.",
    evidenceAccepted: ["workflow run ID", "workflow run URL", "created synthetic object ID", "packet audit event ID"],
    evidenceRejected: rejectedEvidence,
    productionBoundary:
      "A passing authenticated smoke proves the synthetic protected route only. It does not authorize live care or PHI workflows."
  },
  {
    stage: "5. Secret disposal",
    state: "post-run-required",
    owner: "Human operator and security owner",
    operatorAction:
      "Delete or rotate the temporary masked GitHub secret immediately after workflow completion.",
    evidenceAccepted: ["token disposal attestation", "temporary secret name", "disposal timestamp"],
    evidenceRejected: rejectedEvidence,
    productionBoundary:
      "The token itself is never evidence and must never be copied into SCRIMED, source control, docs, logs, packets, or runtime configuration."
  },
  {
    stage: "6. No-secret packet and protected persistence",
    state: "post-run-required",
    owner: "Tenant governance operator",
    operatorAction:
      "Generate the no-secret manual QA packet, persist safe metadata through the protected workspace, and verify packet hash visibility.",
    evidenceAccepted: ["packet SHA-256", "append-only audit event", "safe metadata fields", "operator attestations"],
    evidenceRejected: rejectedEvidence,
    productionBoundary:
      "Persistence requires AAL2 tenant authorization and stores only synthetic business workflow metadata."
  },
  {
    stage: "7. Buyer diligence export",
    state: "post-run-required",
    owner: "Sales engineering and trust reviewer",
    operatorAction:
      "Export Buyer Diligence only after retained packet hashes and audit evidence are visible.",
    evidenceAccepted: ["Buyer Diligence export timestamp", "manual QA packet hash", "audit trail reference"],
    evidenceRejected: rejectedEvidence,
    productionBoundary:
      "Buyer export can claim retained manual QA evidence only after safe metadata is persisted."
  }
];

function workflowReadiness() {
  const plan = getQaEvidenceActivationPlan();

  return plan.workflows.map(
    (workflow): QaExecutionWorkflowReadiness => ({
      workflowKind: workflow.workflowKind,
      name: workflow.name,
      state: "ready-for-human-aal2-run-not-executed",
      dispatchPath: workflow.workflowPath,
      preflightScript: workflow.preflightScript,
      smokeScript: workflow.smokeScript,
      targetInput: workflow.targetInput,
      temporarySecret: workflow.requiredSecretName,
      protectedRoutes: workflow.protectedRoutes,
      safeEvidenceFields: workflow.safeEvidenceFields,
      hardStops: workflow.prohibitedInputs,
      retainedEvidenceRequired: [
        "workflow run ID",
        "workflow run URL",
        "execution timestamp",
        "created safe object ID",
        "packet audit event ID",
        "token disposal attestation",
        "packet SHA-256 after protected persistence"
      ],
      buyerProofImpact: workflow.buyerDiligenceImpact,
      boundary: workflow.currentBoundary,
      nextAction: workflow.nextAction
    })
  );
}

function markdownItems(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

function workflowLines(workflows: QaExecutionWorkflowReadiness[]) {
  return workflows
    .map(
      (workflow) =>
        `- ${workflow.name} (${workflow.workflowKind}): state ${workflow.state}; dispatch ${workflow.dispatchPath}; target ${workflow.targetInput}; temporary secret ${workflow.temporarySecret}; next ${workflow.nextAction}`
    )
    .join("\n");
}

function stageLines(stages: QaExecutionStage[]) {
  return stages
    .map(
      (stage) =>
        `- ${stage.stage} (${stage.state}): ${stage.operatorAction} Accepted evidence: ${stage.evidenceAccepted.join(", ")}.`
    )
    .join("\n");
}

export function getQaExecutionReadinessSummary() {
  const ledger = getQaEvidenceLedger();
  const activationPlan = getQaEvidenceActivationPlan();
  const boundaryResolution = getBoundaryResolutionSummary();
  const workflows = workflowReadiness();
  const readyStages = executionStages.filter((stage) => stage.state === "ready").length;
  const humanRequiredStages = executionStages.filter((stage) => stage.state === "human-required").length;
  const postRunStages = executionStages.filter((stage) => stage.state === "post-run-required").length;

  return {
    service: "scrimed-manual-aal2-qa-execution-readiness",
    route: qaExecutionReadinessRoute,
    apiRoute: qaExecutionReadinessApiRoute,
    briefRoute: qaExecutionReadinessBriefRoute,
    status: qaExecutionReadinessStatus,
    proofStackStatus: qaExecutionReadinessProofStackStatus,
    briefProofStackStatus: qaExecutionReadinessBriefProofStackStatus,
    boundary: qaExecutionReadinessBoundary,
    executionDecision: "ready-for-human-run-not-code-bypass",
    buyerClaimStatus: "activation-ready-not-retained-authenticated-proof",
    workflowCount: workflows.length,
    stageCount: executionStages.length,
    readyStages,
    humanRequiredStages,
    postRunStages,
    remainingManualGateCount: ledger.manualGates,
    boundaryHumanAal2RequiredCount: boundaryResolution.humanAal2RequiredCount,
    activationPlanStatus: activationPlan.status,
    manualRunPacketStatus: ledger.manualRunEvidenceCapture.status,
    protectedPersistenceStatus: ledger.manualRunEvidencePersistence.status,
    dispatchWorkflows: workflows,
    executionStages,
    hardStopRules: [
      "Do not run authenticated QA without a fresh human AAL2 session.",
      "Do not store long-lived tokens in GitHub, Vercel, source, docs, packets, logs, or runtime config.",
      "Do not target PHI, payer member data, medical records, source contracts, production connectors, or live patient workflows.",
      "Do not claim authenticated QA evidence until no-secret packet metadata is persisted and visible in Buyer Pilot Room.",
      "Do not use this readiness layer as legal, security, clinical, reimbursement, or production authorization."
    ],
    claimRules: [
      "Allowed now: SCRIMED has a controlled human-run AAL2 QA execution path.",
      "Allowed now: SCRIMED has no-secret packet generation and protected persistence contracts.",
      "Allowed now: public smoke verifies fail-closed protected routes and activation readiness.",
      "Not allowed yet: SCRIMED has retained authenticated AAL2 QA proof for these workflows.",
      "Not allowed yet: SCRIMED is authorized for live clinical care, PHI processing, payer submission, production connectors, security certification, or reimbursement certainty."
    ],
    buyerDiligenceSequence: [
      activationPlan.briefRoute,
      "/qa-run-control",
      ledger.manualRunEvidenceCapture.route,
      ledger.manualRunEvidenceCapture.protectedPersistenceRoute,
      "/pilot-workspace/access#buyer-pilot-room",
      "/api/pilot-workspaces/{workspaceSlug}/buyer-room/packet"
    ],
    nextRecommendedBuildStep:
      "Open /qa-run-control, run one workflow with its no-secret operator brief and a fresh human AAL2 token, delete or rotate the temporary secret, persist only safe metadata, then export Buyer Diligence after the packet hash appears.",
    updated: "2026-06-21"
  };
}

export function buildQaExecutionReadinessBrief() {
  const summary = getQaExecutionReadinessSummary();

  return [
    "# SCRIMED Manual AAL2 QA Execution Readiness Brief",
    "",
    `Status: ${summary.status}`,
    `Execution decision: ${summary.executionDecision}`,
    `Buyer claim status: ${summary.buyerClaimStatus}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "## Hard Stop Rules",
    markdownItems(summary.hardStopRules),
    "",
    "## Claim Rules",
    markdownItems(summary.claimRules),
    "",
    "## Execution Stages",
    stageLines(summary.executionStages),
    "",
    "## Dispatch Workflows",
    workflowLines(summary.dispatchWorkflows),
    "",
    "## Buyer Diligence Sequence",
    markdownItems(summary.buyerDiligenceSequence),
    "",
    "## Next Recommended Build Step",
    summary.nextRecommendedBuildStep
  ].join("\n");
}
