import { createHash } from "node:crypto";
import {
  qaActivationSealRoute,
  qaActivationSealStatus
} from "./qaActivationSeal";
import {
  qaClaimGuardRoute,
  qaClaimGuardStatus
} from "./qaClaimGuard";
import {
  qaCompletionBridgeRoute,
  qaCompletionBridgeStatus
} from "./qaCompletionBridge";
import {
  qaManualRunEvidencePacketApiRoute,
  qaManualRunEvidencePersistenceApiRoute,
  type QaManualRunWorkflowKind
} from "./qaEvidenceLedger";
import { getQaLaunchKitSummary } from "./qaLaunchKit";
import {
  qaProofPromotionRoute,
  qaProofPromotionStatus
} from "./qaProofPromotion";
import { qaRunControlStatus, type QaRunControlEvidenceTemplate } from "./qaRunControl";

export type QaHumanRunPacketDecisionState =
  | "dispatch-template-ready"
  | "candidate-dispatch-ready-human-aal2-required"
  | "candidate-dispatch-rejected";

export type QaHumanRunPacketCandidateInput = {
  workflowKind?: QaManualRunWorkflowKind;
  operatorRole?: string;
  protectedWorkspaceSlug?: string;
  syntheticTargetId?: string;
  plannedExecutionWindow?: string;
  dispatchAttestation?: string;
  proofBlockedAttestation?: string;
  dataBoundary?: string;
};

export type QaHumanRunPacketControl = {
  control: string;
  state: "required-before-dispatch" | "required-after-run" | "hard-stop";
  owner: string;
  passSignal: string;
  failClosedIf: string;
};

export type QaHumanRunPacketWorkflow = {
  workflowKind: QaManualRunWorkflowKind;
  name: string;
  dispatchPath: string;
  dispatchInputs: Record<string, string | boolean>;
  temporarySecret: string;
  preflightCommandTemplate: string;
  smokeCommandTemplate: string;
  defaultSyntheticTarget: string;
  safeEvidenceTemplate: QaRunControlEvidenceTemplate;
  manualPacketRoute: string;
  completionBridgeRoute: string;
  protectedPersistenceRoute: string;
  activationSealRoute: string;
  proofPromotionRoute: string;
  claimGuardRoute: string;
  buyerDiligenceRoute: string;
  operatorSequence: string[];
  abortConditions: string[];
};

export const qaHumanRunPacketStatus = "manual-aal2-qa-human-run-packet-ready";
export const qaHumanRunPacketProofStackStatus =
  "manual-aal2-qa-human-run-packet-dispatch-ready";
export const qaHumanRunPacketBriefProofStackStatus =
  "manual-aal2-qa-human-run-packet-brief-no-proof-claim";

export const qaHumanRunPacketRoute = "/qa-human-run-packet";
export const qaHumanRunPacketApiRoute = "/api/qa-evidence/human-run-packet";
export const qaHumanRunPacketBriefRoute = "/api/qa-evidence/human-run-packet/brief";

export const qaHumanRunPacketBoundary =
  "SCRIMED QA Human Run Packet creates a no-secret dispatch packet for the approved human AAL2 synthetic QA run. It does not execute passkey ceremonies, mint or store tokens, persist packet hashes, process PHI, authorize live clinical care, certify security or compliance, guarantee reimbursement, approve production connectors, or claim retained authenticated QA proof before protected Manual QA Evidence is visible.";

export const qaHumanRunPacketAcceptedAttestations = {
  operatorRole: ["tenant-admin", "pilot-lead"],
  dispatchAttestation: "human-aal2-required-no-code-bypass",
  proofBlockedAttestation: "no-retained-proof-until-protected-packet-visible",
  dataBoundary: "synthetic-business-workflow-only"
};

const forbiddenKeys = [
  "accessToken",
  "access_token",
  "bearerToken",
  "bearer_token",
  "refreshToken",
  "refresh_token",
  "jwt",
  "secret",
  "password",
  "credential",
  "credentials",
  "phi",
  "patientId",
  "patient_id",
  "memberId",
  "member_id"
];

const blockedClaims = [
  "retained authenticated QA proof",
  "human AAL2 workflow completed",
  "live clinical care authorized",
  "PHI processing authorized",
  "HIPAA certified",
  "HIPAA compliant",
  "SOC 2 certified",
  "FDA cleared",
  "FDA approved",
  "reimbursement guaranteed",
  "production connector approved",
  "autonomous diagnosis authorized",
  "autonomous treatment authorized",
  "patient outreach authorized",
  "payer submission authorized"
];

const dispatchControls: QaHumanRunPacketControl[] = [
  {
    control: "Approved human operator",
    state: "required-before-dispatch",
    owner: "Tenant-admin or pilot-lead",
    passSignal: "The operator role is tenant-admin or pilot-lead and the AAL2 browser session is fresh.",
    failClosedIf: "The session is stale, shared, non-AAL2, or the role is not allowed."
  },
  {
    control: "Single synthetic target",
    state: "required-before-dispatch",
    owner: "Workflow owner",
    passSignal: "The packet names one synthetic target and one workspace slug before the run.",
    failClosedIf: "The target is broad, production-linked, patient-linked, payer-member-linked, or ambiguous."
  },
  {
    control: "Manual workflow only",
    state: "required-before-dispatch",
    owner: "Release engineering",
    passSignal: "The selected workflow remains manual and requires require_authenticated_path=true.",
    failClosedIf: "The workflow is scheduled, unattended, or allows the authenticated path to be optional."
  },
  {
    control: "No-secret evidence fields",
    state: "required-after-run",
    owner: "TrustOS reviewer",
    passSignal: "Only workflow ID, run URL, timestamp, safe object UUIDs, packet hash, and audit UUID are copied.",
    failClosedIf: "Tokens, credentials, PHI, payer member data, legal artifacts, reports, contracts, or clinical records appear."
  },
  {
    control: "Protected packet visibility",
    state: "hard-stop",
    owner: "Tenant governance operator",
    passSignal: "Protected Manual QA Evidence shows packet SHA-256 and append-only audit event visibility.",
    failClosedIf: "Only a public packet preview, operator assertion, screenshot, or chat statement exists."
  },
  {
    control: "Proof and claim gates",
    state: "hard-stop",
    owner: "Buyer diligence and claims governance",
    passSignal: "Completion Bridge, Activation Seal, Proof Promotion, Claim Guard, and Buyer Proof Release all preserve the retained-packet boundary.",
    failClosedIf: "Any buyer, investor, sales, PR, or operator language claims retained proof or production authority too early."
  },
  {
    control: "Clinical authority blocked",
    state: "hard-stop",
    owner: "Clinical, legal, privacy, security, compliance, and customer authority owners",
    passSignal: "The packet remains a governed synthetic QA dispatch artifact only.",
    failClosedIf: "The packet is used as clinical care, PHI, payer submission, reimbursement, certification, connector, or regional approval."
  }
];

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function hasForbiddenKey(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;

  if (Array.isArray(value)) {
    return value.some((item) => hasForbiddenKey(item));
  }

  return Object.entries(value).some(([key, nested]) => {
    const normalized = key.trim();
    return forbiddenKeys.includes(normalized) || hasForbiddenKey(nested);
  });
}

function hasForbiddenContent(value: unknown) {
  const text = JSON.stringify(value ?? "");

  return [
    /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/,
    /Bearer\s+(eyJ[A-Za-z0-9._-]+|[A-Za-z0-9._-]{20,})/i,
    /sk-[A-Za-z0-9_-]{12,}/,
    /sbp_[A-Za-z0-9_-]{12,}/,
    /patient\s*(id|identifier|mrn)/i,
    /member\s*(id|identifier)/i,
    /medical\s*record/i,
    /production\s*(patient|clinical|payer)/i
  ].some((pattern) => pattern.test(text));
}

function matchBlockedClaims(value: unknown) {
  const text = JSON.stringify(value ?? "").toLowerCase();
  return blockedClaims.filter((claim) => text.includes(claim.toLowerCase()));
}

function safeSlug(value: string) {
  return /^[a-z0-9][a-z0-9-]{2,62}$/.test(value);
}

function safeTarget(value: string) {
  return /^[a-zA-Z0-9][a-zA-Z0-9:_-]{2,96}$/.test(value);
}

function safeWindow(value: string) {
  return /^[a-zA-Z0-9:._+\-\s]{4,96}$/.test(value);
}

function hashPacket(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function workflowDefaultTarget(workflowKind: QaManualRunWorkflowKind) {
  return workflowKind === "authority-reference-qa"
    ? "atlas-synthetic-evaluation"
    : "synthetic-sales-opportunity-intake-id";
}

function buildOperatorSequence(workflow: QaHumanRunPacketWorkflow) {
  return [
    "Open /pilot-workspace/access in a fresh browser session and verify AAL2 posture.",
    `Confirm protected workspace slug ${workflow.defaultSyntheticTarget === "atlas-synthetic-evaluation" ? "atlas-synthetic-evaluation" : "{workspaceSlug}"}.`,
    "Create only the temporary masked workflow secret for the selected run.",
    "Run the preflight command before dispatching the authenticated workflow.",
    "Dispatch the manual workflow with require_authenticated_path=true and one explicit synthetic target.",
    "Copy only the safe metadata fields from the completed run.",
    "Delete or rotate the temporary secret before generating or persisting evidence.",
    `Validate no-secret metadata through ${qaCompletionBridgeRoute}.`,
    `Generate the Markdown packet through ${qaManualRunEvidencePacketApiRoute}.`,
    `Persist only accepted metadata through ${qaManualRunEvidencePersistenceApiRoute}.`,
    `Confirm ${qaActivationSealRoute}, ${qaProofPromotionRoute}, and ${qaClaimGuardRoute}.`,
    "Export Buyer Diligence only after protected packet SHA-256 and audit visibility exist."
  ];
}

function buildWorkflowPackets(): QaHumanRunPacketWorkflow[] {
  const launchKit = getQaLaunchKitSummary();

  return launchKit.workflows.map((workflow) => {
    const workflowKind = workflow.workflowKind;
    const defaultSyntheticTarget = workflowDefaultTarget(workflowKind);
    const packet: QaHumanRunPacketWorkflow = {
      workflowKind,
      name: workflow.name,
      dispatchPath: workflow.dispatchPath,
      dispatchInputs: workflow.dispatchInputs,
      temporarySecret: workflow.temporarySecret,
      preflightCommandTemplate: workflow.preflightCommandTemplate,
      smokeCommandTemplate: workflow.smokeCommandTemplate,
      defaultSyntheticTarget,
      safeEvidenceTemplate: workflow.safeEvidenceTemplate,
      manualPacketRoute: qaManualRunEvidencePacketApiRoute,
      completionBridgeRoute: qaCompletionBridgeRoute,
      protectedPersistenceRoute: qaManualRunEvidencePersistenceApiRoute,
      activationSealRoute: qaActivationSealRoute,
      proofPromotionRoute: qaProofPromotionRoute,
      claimGuardRoute: qaClaimGuardRoute,
      buyerDiligenceRoute: "/pilot-workspace/access#buyer-room",
      operatorSequence: [],
      abortConditions: workflow.abortConditions
    };

    packet.operatorSequence = buildOperatorSequence(packet);

    return packet;
  });
}

function markdownList(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

function workflowMarkdown(workflows: QaHumanRunPacketWorkflow[]) {
  return workflows.flatMap((workflow) => [
    `## ${workflow.name}`,
    `- Workflow kind: ${workflow.workflowKind}`,
    `- Dispatch path: ${workflow.dispatchPath}`,
    `- Temporary secret: ${workflow.temporarySecret}`,
    `- Default synthetic target: ${workflow.defaultSyntheticTarget}`,
    `- Completion Bridge: ${workflow.completionBridgeRoute}`,
    `- Manual packet route: ${workflow.manualPacketRoute}`,
    `- Protected persistence: ${workflow.protectedPersistenceRoute}`,
    `- Activation Seal: ${workflow.activationSealRoute}`,
    `- Proof Promotion: ${workflow.proofPromotionRoute}`,
    `- Claim Guard: ${workflow.claimGuardRoute}`,
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

export function getQaHumanRunPacketSummary() {
  const launchKit = getQaLaunchKitSummary();
  const workflows = buildWorkflowPackets();
  const postRunRoutes = [
    qaCompletionBridgeRoute,
    qaManualRunEvidencePacketApiRoute,
    qaManualRunEvidencePersistenceApiRoute,
    qaActivationSealRoute,
    qaProofPromotionRoute,
    qaClaimGuardRoute,
    "/pilot-workspace/access#buyer-room"
  ];
  const safeFieldCount = new Set(
    workflows.flatMap((workflow) => Object.keys(workflow.safeEvidenceTemplate))
  ).size;

  return {
    service: "scrimed-qa-human-run-packet",
    route: qaHumanRunPacketRoute,
    apiRoute: qaHumanRunPacketApiRoute,
    briefRoute: qaHumanRunPacketBriefRoute,
    status: qaHumanRunPacketStatus,
    proofStackStatus: qaHumanRunPacketProofStackStatus,
    briefProofStackStatus: qaHumanRunPacketBriefProofStackStatus,
    boundary: qaHumanRunPacketBoundary,
    decisionState: "dispatch-template-ready" as const,
    executionAllowedByCode: false,
    humanAal2Required: true,
    proofClaimAllowed: false,
    buyerUseAllowed: false,
    sourceLaunchKitStatus: launchKit.status,
    sourceRunControlStatus: qaRunControlStatus,
    sourceCompletionBridgeStatus: qaCompletionBridgeStatus,
    sourceActivationSealStatus: qaActivationSealStatus,
    sourceProofPromotionStatus: qaProofPromotionStatus,
    sourceClaimGuardStatus: qaClaimGuardStatus,
    workflowCount: workflows.length,
    controlCount: dispatchControls.length,
    hardStopControlCount: dispatchControls.filter((control) => control.state === "hard-stop").length,
    requiredAttestationCount: Object.keys(qaHumanRunPacketAcceptedAttestations).length,
    safeFieldCount,
    postRunRouteCount: postRunRoutes.length,
    blockedClaimCount: blockedClaims.length,
    acceptedAttestations: qaHumanRunPacketAcceptedAttestations,
    controls: dispatchControls,
    workflows,
    postRunRoutes,
    blockedClaims,
    dispatchRules: [
      "Allowed now: generate a no-secret dispatch packet for an approved operator.",
      "Allowed now: predefine the exact workflow, target, command templates, safe fields, and post-run checks.",
      "Not allowed here: execute passkey/AAL2 ceremonies, mint tokens, store credentials, or persist evidence.",
      "Not allowed yet: claim retained authenticated QA proof, buyer-ready proof, clinical authority, PHI authority, reimbursement certainty, certification, or production connector approval."
    ],
    nextRecommendedBuildStep:
      "Have an approved tenant-admin or pilot-lead operator use this packet for exactly one synthetic AAL2 workflow, validate the no-secret result through Completion Bridge, persist it through protected Manual QA Evidence, then confirm Activation Seal, Proof Promotion, Claim Guard, and Buyer Proof Release before Buyer Diligence export.",
    updated: "2026-06-22"
  };
}

export function evaluateQaHumanRunPacketCandidate(value: unknown) {
  const summary = getQaHumanRunPacketSummary();
  const record = value && typeof value === "object" && !Array.isArray(value)
    ? value as QaHumanRunPacketCandidateInput
    : {};
  const workflowKind = record.workflowKind ?? "sales-demo-session-qa";
  const operatorRole = cleanText(record.operatorRole);
  const protectedWorkspaceSlug = cleanText(record.protectedWorkspaceSlug);
  const syntheticTargetId = cleanText(record.syntheticTargetId);
  const plannedExecutionWindow = cleanText(record.plannedExecutionWindow);
  const dispatchAttestation = cleanText(record.dispatchAttestation);
  const proofBlockedAttestation = cleanText(record.proofBlockedAttestation);
  const dataBoundary = cleanText(record.dataBoundary);
  const errors: string[] = [];
  const matchedBlockedClaims = matchBlockedClaims(value);

  if (!summary.workflows.some((workflow) => workflow.workflowKind === workflowKind)) {
    errors.push("workflowKind must be sales-demo-session-qa or authority-reference-qa.");
  }

  if (!qaHumanRunPacketAcceptedAttestations.operatorRole.includes(operatorRole)) {
    errors.push("operatorRole must be tenant-admin or pilot-lead.");
  }

  if (!safeSlug(protectedWorkspaceSlug)) {
    errors.push("protectedWorkspaceSlug must be a lowercase synthetic workspace slug.");
  }

  if (!safeTarget(syntheticTargetId)) {
    errors.push("syntheticTargetId must be bounded synthetic metadata.");
  }

  if (!safeWindow(plannedExecutionWindow)) {
    errors.push("plannedExecutionWindow must be bounded no-secret text or ISO-like metadata.");
  }

  if (dispatchAttestation !== qaHumanRunPacketAcceptedAttestations.dispatchAttestation) {
    errors.push(`dispatchAttestation must equal ${qaHumanRunPacketAcceptedAttestations.dispatchAttestation}.`);
  }

  if (proofBlockedAttestation !== qaHumanRunPacketAcceptedAttestations.proofBlockedAttestation) {
    errors.push(`proofBlockedAttestation must equal ${qaHumanRunPacketAcceptedAttestations.proofBlockedAttestation}.`);
  }

  if (dataBoundary !== qaHumanRunPacketAcceptedAttestations.dataBoundary) {
    errors.push(`dataBoundary must equal ${qaHumanRunPacketAcceptedAttestations.dataBoundary}.`);
  }

  if (hasForbiddenKey(value)) {
    errors.push("Candidate dispatch packet must not include token, credential, PHI, patient, or payer member keys.");
  }

  if (hasForbiddenContent(value)) {
    errors.push("Candidate dispatch packet contains secret-like, PHI-like, or production clinical content.");
  }

  if (matchedBlockedClaims.length > 0) {
    errors.push(`Candidate dispatch packet contains blocked claim language: ${matchedBlockedClaims.join(", ")}.`);
  }

  if (errors.length > 0) {
    return {
      service: "scrimed-qa-human-run-packet",
      status: qaHumanRunPacketStatus,
      decisionState: "candidate-dispatch-rejected" as const,
      executionAllowedByCode: false,
      humanAal2Required: true,
      proofClaimAllowed: false,
      buyerUseAllowed: false,
      errors,
      boundary: qaHumanRunPacketBoundary,
      saferLanguage:
        "SCRIMED has a no-secret human AAL2 dispatch packet for governed synthetic QA. Retained authenticated proof remains blocked until protected packet visibility.",
      nextAction:
        "Remove secrets, PHI, production identifiers, and authority claims; then submit only bounded synthetic dispatch metadata."
    };
  }

  const workflow = summary.workflows.find((item) => item.workflowKind === workflowKind) ?? summary.workflows[0];
  const candidate = {
    workflowKind,
    operatorRole,
    protectedWorkspaceSlug,
    syntheticTargetId,
    plannedExecutionWindow,
    dispatchAttestation,
    proofBlockedAttestation,
    dataBoundary
  };
  const dispatchDigest = hashPacket({
    candidate,
    workflowName: workflow.name,
    dispatchPath: workflow.dispatchPath,
    proofBoundary: summary.boundary
  });

  return {
    service: "scrimed-qa-human-run-packet",
    status: qaHumanRunPacketStatus,
    decisionState: "candidate-dispatch-ready-human-aal2-required" as const,
    executionAllowedByCode: false,
    humanAal2Required: true,
    proofClaimAllowed: false,
    buyerUseAllowed: false,
    dispatchDigest,
    candidate,
    workflow,
    requiredPostRunRoutes: summary.postRunRoutes,
    blockedClaims,
    boundary: qaHumanRunPacketBoundary,
    nextAction:
      "Use this dispatch packet only inside the approved human AAL2 run. After completion, validate no-secret metadata through Completion Bridge and persist through protected Manual QA Evidence."
  };
}

export function buildQaHumanRunPacketBrief() {
  const summary = getQaHumanRunPacketSummary();

  return [
    "# SCRIMED QA Human Run Packet",
    "",
    `Status: ${summary.status}`,
    `Decision state: ${summary.decisionState}`,
    `Execution allowed by code: ${summary.executionAllowedByCode ? "yes" : "no"}`,
    `Human AAL2 required: ${summary.humanAal2Required ? "yes" : "no"}`,
    `Proof claim allowed: ${summary.proofClaimAllowed ? "yes" : "no"}`,
    `Buyer use allowed: ${summary.buyerUseAllowed ? "yes" : "no"}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "## Dispatch Rules",
    markdownList(summary.dispatchRules),
    "",
    "## Accepted Attestations",
    `- Operator roles: ${summary.acceptedAttestations.operatorRole.join(", ")}`,
    `- Dispatch: ${summary.acceptedAttestations.dispatchAttestation}`,
    `- Proof blocked: ${summary.acceptedAttestations.proofBlockedAttestation}`,
    `- Data boundary: ${summary.acceptedAttestations.dataBoundary}`,
    "",
    "## Controls",
    ...summary.controls.map(
      (control) =>
        `- ${control.control} (${control.state}): owner ${control.owner}. Pass: ${control.passSignal} Fail closed if: ${control.failClosedIf}`
    ),
    "",
    ...workflowMarkdown(summary.workflows),
    "## Post-Run Routes",
    markdownList(summary.postRunRoutes),
    "",
    "## Blocked Claims",
    markdownList(summary.blockedClaims),
    "",
    "## Next Recommended Build Step",
    summary.nextRecommendedBuildStep
  ].join("\n");
}
