import { createHash } from "crypto";
import {
  buildQaManualRunEvidencePacket,
  qaEvidenceLedgerBoundary,
  qaManualRunEvidenceContract,
  qaManualRunEvidencePacketApiRoute,
  qaManualRunEvidencePersistenceApiRoute,
  validateQaManualRunEvidenceInput,
  type QaManualRunEvidenceInput
} from "./qaEvidenceLedger";
import { getQaLaunchKitSummary, qaLaunchKitRoute } from "./qaLaunchKit";
import { getQaProofPromotionSummary, qaProofPromotionRoute } from "./qaProofPromotion";

export type QaCompletionBridgeDecisionState =
  | "waiting-for-human-aal2-run"
  | "candidate-validation-failed"
  | "ready-for-protected-persistence"
  | "retained-packet-required-for-buyer-proof";

export type QaCompletionBridgeCheckpoint = {
  checkpoint: string;
  state: "required-before-bridge" | "validated-by-bridge" | "protected-only" | "hard-stop";
  owner: string;
  evidenceRequired: string;
  passSignal: string;
  failClosedIf: string;
};

export type QaCompletionBridgeEvaluation = {
  service: "scrimed-qa-completion-bridge";
  status: typeof qaCompletionBridgeStatus;
  decisionState: QaCompletionBridgeDecisionState;
  promotionAllowed: false;
  candidateValid: boolean;
  packetPreviewSha256: string;
  packetPreviewMarkdown?: string;
  errors: string[];
  nextAction: string;
  safePersistenceRoute: string;
  proofPromotionRoute: string;
  boundary: string;
};

export const qaCompletionBridgeStatus = "manual-aal2-qa-completion-bridge-ready";
export const qaCompletionBridgeProofStackStatus =
  "manual-aal2-qa-completion-bridge-no-secret-pre-persistence";
export const qaCompletionBridgeBriefProofStackStatus =
  "manual-aal2-qa-completion-bridge-brief-no-retained-proof-claim";

export const qaCompletionBridgeRoute = "/qa-completion-bridge";
export const qaCompletionBridgeApiRoute = "/api/qa-evidence/completion-bridge";
export const qaCompletionBridgeBriefRoute = "/api/qa-evidence/completion-bridge/brief";

export const qaCompletionBridgeBoundary =
  "SCRIMED QA Completion Bridge validates no-secret candidate metadata after a human AAL2 synthetic QA run and before protected persistence. It does not execute passkey ceremonies, mint or store tokens, persist evidence, store PHI, authorize live clinical care, certify security or compliance, guarantee reimbursement, approve production connectors, or allow buyer proof promotion before protected packet hashes are visible.";

const completionCheckpoints: QaCompletionBridgeCheckpoint[] = [
  {
    checkpoint: "Human AAL2 workflow run",
    state: "required-before-bridge",
    owner: "Tenant-admin or pilot-lead operator",
    evidenceRequired: "One explicit synthetic workflow run ID, run URL, timestamp, target ID, created object UUID, and packet audit event UUID.",
    passSignal: "The candidate payload references exactly one completed human-run synthetic workflow.",
    failClosedIf: "The run did not happen, was scheduled/unattended, used a broad target, or references regulated data."
  },
  {
    checkpoint: "No-secret candidate validation",
    state: "validated-by-bridge",
    owner: "TrustOS and release engineering",
    evidenceRequired: "Safe metadata only, accepted attestations, valid GitHub run URL, ISO timestamp, and UUID evidence object IDs.",
    passSignal: "The public bridge returns ready-for-protected-persistence and a packet preview SHA-256.",
    failClosedIf: "The payload contains bearer/JWT-like material, PHI, payer member data, credentials, invalid attestations, or unsupported workflow kind."
  },
  {
    checkpoint: "Protected packet persistence",
    state: "protected-only",
    owner: "Tenant governance operator",
    evidenceRequired: "AAL2 protected workspace session and POST to the tenant-scoped manual QA evidence route.",
    passSignal: "The protected workspace returns a retained packet hash and append-only audit event.",
    failClosedIf: "The operator lacks AAL2 governance authorization or the protected write rejects the payload."
  },
  {
    checkpoint: "Proof Promotion decision",
    state: "hard-stop",
    owner: "Buyer diligence reviewer",
    evidenceRequired: "Visible retained packet SHA-256, workflow run ID, audit event reference, and blocked production claims.",
    passSignal: "Proof Promotion moves buyer language from activation-ready to retained no-secret QA evidence.",
    failClosedIf: "Buyer material claims authenticated proof before protected packet hash visibility."
  },
  {
    checkpoint: "Clinical and production authority",
    state: "hard-stop",
    owner: "Clinical, legal, privacy, security, reimbursement, and customer authority owners",
    evidenceRequired: "Separate signed customer/legal/security/privacy/clinical/regional/reimbursement/connector approvals.",
    passSignal: "Authority remains explicitly blocked unless external approvals exist.",
    failClosedIf: "Anyone treats QA completion evidence as PHI, live-care, payer, connector, security-certification, or reimbursement authorization."
  }
];

const blockedClaims = [
  "human AAL2 workflow executed by this bridge",
  "token, credential, or bearer material stored as evidence",
  "protected packet persisted by the public bridge",
  "buyer proof promoted before retained packet hash visibility",
  "PHI or payer member data processed",
  "live clinical care authorized",
  "security or compliance certification completed",
  "reimbursement outcome guaranteed",
  "production connector approved",
  "autonomous diagnosis or treatment authorized"
];

const safeFieldExamples = [
  "workflowKind",
  "workflowRunId",
  "workflowRunUrl",
  "executedAt",
  "baseUrl",
  "intakeId or workspaceSlug",
  "createdSessionId or authority reference UUID",
  "packetAuditEventId",
  "qaOutcome=pass",
  "operatorAttestation=no-secrets-no-phi-aal2-human-run",
  "tokenDisposalAttestation=temporary-token-deleted-or-rotated",
  "dataBoundary=synthetic-business-workflow-only"
];

function packetHash(markdown: string) {
  return createHash("sha256").update(markdown).digest("hex");
}

function markdownItems(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

export function evaluateQaCompletionBridgeCandidate(value: unknown): QaCompletionBridgeEvaluation {
  const validation = validateQaManualRunEvidenceInput(value);

  if (!validation.ok) {
    return {
      service: "scrimed-qa-completion-bridge",
      status: qaCompletionBridgeStatus,
      decisionState: "candidate-validation-failed",
      promotionAllowed: false,
      candidateValid: false,
      packetPreviewSha256: "not-generated",
      errors: validation.errors,
      nextAction:
        "Fix the no-secret metadata only after the human AAL2 workflow has completed; do not paste tokens, PHI, credentials, approvals, or regulated identifiers.",
      safePersistenceRoute: qaManualRunEvidencePersistenceApiRoute,
      proofPromotionRoute: qaProofPromotionRoute,
      boundary: qaCompletionBridgeBoundary
    };
  }

  const packetPreviewMarkdown = buildQaManualRunEvidencePacket(validation.input);

  return {
    service: "scrimed-qa-completion-bridge",
    status: qaCompletionBridgeStatus,
    decisionState: "ready-for-protected-persistence",
    promotionAllowed: false,
    candidateValid: true,
    packetPreviewSha256: packetHash(packetPreviewMarkdown),
    packetPreviewMarkdown,
    errors: [],
    nextAction:
      "Persist this same no-secret metadata through the protected workspace Manual QA Evidence route under an AAL2 tenant governance session, then verify Proof Promotion before Buyer Diligence export.",
    safePersistenceRoute: qaManualRunEvidencePersistenceApiRoute,
    proofPromotionRoute: qaProofPromotionRoute,
    boundary: qaCompletionBridgeBoundary
  };
}

export function getQaCompletionBridgeSummary() {
  const launchKit = getQaLaunchKitSummary();
  const proofPromotion = getQaProofPromotionSummary();

  return {
    service: "scrimed-qa-completion-bridge",
    route: qaCompletionBridgeRoute,
    apiRoute: qaCompletionBridgeApiRoute,
    briefRoute: qaCompletionBridgeBriefRoute,
    status: qaCompletionBridgeStatus,
    proofStackStatus: qaCompletionBridgeProofStackStatus,
    briefProofStackStatus: qaCompletionBridgeBriefProofStackStatus,
    boundary: qaCompletionBridgeBoundary,
    completionDecisionState: "waiting-for-human-aal2-run" as QaCompletionBridgeDecisionState,
    buyerClaimStatus: "completion-bridge-ready-not-retained-authenticated-proof",
    launchKitRoute: qaLaunchKitRoute,
    humanRunPacketRoute: "/qa-human-run-packet",
    launchKitStatus: launchKit.status,
    proofPromotionRoute: qaProofPromotionRoute,
    proofPromotionState: proofPromotion.promotionDecisionState,
    manualPacketRoute: qaManualRunEvidencePacketApiRoute,
    protectedPersistenceRoute: qaManualRunEvidencePersistenceApiRoute,
    contractStatus: qaManualRunEvidenceContract.status,
    checkpointCount: completionCheckpoints.length,
    hardStopCount: completionCheckpoints.filter((checkpoint) => checkpoint.state === "hard-stop").length,
    safeFieldCount: safeFieldExamples.length,
    blockedClaimCount: blockedClaims.length,
    supportedWorkflowKinds: qaManualRunEvidenceContract.supportedWorkflowKinds,
    requiredFields: qaManualRunEvidenceContract.requiredFields,
    acceptedAttestations: qaManualRunEvidenceContract.acceptedAttestations,
    checkpoints: completionCheckpoints,
    safeFieldExamples,
    blockedClaims,
    bridgeRules: [
      "Allowed now: validate a no-secret candidate packet after a human AAL2 synthetic run.",
      "Allowed now: generate a packet preview hash for operator comparison before protected persistence.",
      "Not allowed here: persist evidence, store tokens, claim retained proof, or promote buyer diligence.",
      "Required next: use the protected AAL2 workspace persistence route, then Proof Promotion."
    ],
    nextRecommendedBuildStep:
      "After the approved operator uses /qa-human-run-packet and completes one synthetic workflow, run the no-secret metadata through QA Completion Bridge, persist it through the protected Manual QA Evidence route, then confirm Claim Guard, Activation Seal, and Proof Promotion before exporting Buyer Diligence.",
    updated: "2026-06-22"
  };
}

export function buildQaCompletionBridgeBrief() {
  const summary = getQaCompletionBridgeSummary();

  return [
    "# SCRIMED QA Completion Bridge Brief",
    "",
    `Status: ${summary.status}`,
    `Decision state: ${summary.completionDecisionState}`,
    `Buyer claim status: ${summary.buyerClaimStatus}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "## Routes",
    `- Launch Kit: ${summary.launchKitRoute}`,
    `- Human Run Packet: ${summary.humanRunPacketRoute}`,
    `- Completion Bridge: ${summary.route}`,
    `- Completion Bridge API: ${summary.apiRoute}`,
    `- Manual packet route: ${summary.manualPacketRoute}`,
    `- Protected persistence route: ${summary.protectedPersistenceRoute}`,
    `- Proof Promotion: ${summary.proofPromotionRoute}`,
    "",
    "## Bridge Rules",
    markdownItems(summary.bridgeRules),
    "",
    "## Checkpoints",
    ...summary.checkpoints.map(
      (checkpoint) =>
        `- ${checkpoint.checkpoint} (${checkpoint.state}): ${checkpoint.evidenceRequired} Pass: ${checkpoint.passSignal} Fail closed if: ${checkpoint.failClosedIf}`
    ),
    "",
    "## Safe Field Examples",
    markdownItems(summary.safeFieldExamples),
    "",
    "## Blocked Claims",
    markdownItems(summary.blockedClaims),
    "",
    "## Next Recommended Build Step",
    summary.nextRecommendedBuildStep,
    "",
    "## Ledger Boundary",
    qaEvidenceLedgerBoundary
  ].join("\n");
}

export function sampleQaCompletionBridgePayload(workflowKind: QaManualRunEvidenceInput["workflowKind"]) {
  const isAuthorityReference = workflowKind === "authority-reference-qa";

  return {
    workflowKind: workflowKind ?? "sales-demo-session-qa",
    workflowRunId: "1234567890",
    workflowRunUrl: "https://github.com/temitayodahunsi777/scrimed-site/actions/runs/1234567890",
    executedAt: new Date().toISOString(),
    baseUrl: "https://app.scrimedsolutions.com",
    intakeId: isAuthorityReference ? "atlas-synthetic-evaluation" : "synthetic-intake-001",
    createdSessionId: "11111111-1111-4111-8111-111111111111",
    packetAuditEventId: "22222222-2222-4222-8222-222222222222",
    evidenceTargetLabel: isAuthorityReference ? "Workspace target" : "Target intake ID",
    evidenceObjectLabel: isAuthorityReference ? "Created authority reference ID" : "Created session ID",
    packetAuditEventLabel: isAuthorityReference
      ? "Authority packet audit event ID"
      : "Packet audit event ID",
    evidenceRoute: isAuthorityReference
      ? "/api/pilot-workspaces/{workspaceSlug}/authority-artifact-references"
      : "/api/sales-operations/qa/buyer-demo-sessions",
    packetRoute: isAuthorityReference
      ? "/api/pilot-workspaces/{workspaceSlug}/authority-artifact-references/packet"
      : "/api/sales-operations/opportunities/{intakeId}/demo-sessions/{sessionId}/packet",
    operatorRunbook: isAuthorityReference
      ? "/docs/protected-authority-artifact-references.md"
      : "/docs/operator-token-rotation.md",
    qaOutcome: "pass",
    operatorAttestation: "no-secrets-no-phi-aal2-human-run",
    tokenDisposalAttestation: "temporary-token-deleted-or-rotated",
    dataBoundary: "synthetic-business-workflow-only"
  } satisfies QaManualRunEvidenceInput;
}
