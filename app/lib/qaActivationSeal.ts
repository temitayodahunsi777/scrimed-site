import type { QaManualRunEvidencePacketRecord } from "./qaEvidenceLedger";
import {
  qaClaimGuardRoute,
  qaClaimGuardStatus
} from "./qaClaimGuard";
import {
  qaCompletionBridgeRoute,
  qaCompletionBridgeStatus
} from "./qaCompletionBridge";
import {
  qaLaunchKitRoute,
  qaLaunchKitStatus
} from "./qaLaunchKit";
import {
  deriveQaProofPromotionDecision,
  qaProofPromotionRoute,
  qaProofPromotionStatus
} from "./qaProofPromotion";

export type QaActivationSealDecisionState =
  | "unsealed-human-aal2-required"
  | "candidate-ready-protected-verification-required"
  | "sealed-for-buyer-diligence"
  | "blocked-boundary-violation";

export type QaActivationSealDecision = {
  state: QaActivationSealDecisionState;
  sealAllowed: boolean;
  buyerUseAllowed: boolean;
  packetCount: number;
  latestPacketHash: string;
  latestWorkflowRunId: string;
  missingEvidence: string[];
  requiredEvidence: string[];
  buyerSafeClaim: string;
  nextAction: string;
  boundary: string;
};

export type QaActivationSealRule = {
  rule: string;
  status: "required" | "hard-stop";
  evidenceRequired: string;
  passSignal: string;
  failClosedIf: string;
};

export type QaActivationSealCandidateEvaluation = {
  service: "scrimed-qa-activation-seal";
  status: typeof qaActivationSealStatus;
  decisionState: QaActivationSealDecisionState;
  sealAllowed: false;
  publicVerificationOnly: true;
  candidateComplete: boolean;
  matchedRisks: string[];
  missingEvidence: string[];
  requiredEvidence: string[];
  saferLanguage: string;
  nextAction: string;
  boundary: string;
};

export const qaActivationSealStatus = "manual-aal2-qa-activation-seal-ready";
export const qaActivationSealProofStackStatus =
  "manual-aal2-qa-activation-seal-no-secret-boundary-check";
export const qaActivationSealBriefProofStackStatus =
  "manual-aal2-qa-activation-seal-brief-retained-packet-required";

export const qaActivationSealRoute = "/qa-activation-seal";
export const qaActivationSealApiRoute = "/api/qa-evidence/activation-seal";
export const qaActivationSealBriefRoute = "/api/qa-evidence/activation-seal/brief";

export const qaActivationSealBoundary =
  "SCRIMED QA Activation Seal checks whether manual AAL2 synthetic QA evidence can be treated as buyer-diligence-ready. Public checks can validate no-secret candidate completeness only; actual sealing requires protected workspace packet visibility. This does not execute passkey ceremonies, store tokens, store PHI, replace counsel, certify security or compliance, authorize live clinical care, guarantee reimbursement, approve production connectors, or grant production clinical authority.";

const requiredEvidence = [
  "fresh human AAL2 workflow run",
  "explicit synthetic target",
  "Completion Bridge accepted no-secret candidate",
  "protected Manual QA Evidence packet SHA-256",
  "append-only packet audit event UUID",
  "workflow run ID and run URL",
  "temporary token deleted or rotated",
  "Proof Promotion ready-for-buyer-diligence decision",
  "Claim Guard current-state language check",
  "clinical, PHI, reimbursement, security-certification, connector, and production claims blocked"
];

const hardStopClaims = [
  "live clinical care authorized",
  "PHI processing authorized",
  "HIPAA certified",
  "HIPAA compliant",
  "SOC 2 certified",
  "security certified",
  "FDA cleared",
  "FDA approved",
  "reimbursement guaranteed",
  "production connector approved",
  "autonomous diagnosis authorized",
  "autonomous treatment authorized",
  "patient outreach authorized",
  "payer submission authorized"
];

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

const sealRules: QaActivationSealRule[] = [
  {
    rule: "Protected packet required",
    status: "hard-stop",
    evidenceRequired: "A retained packet SHA-256 visible from protected Manual QA Evidence.",
    passSignal: "Protected workspace packet list contains the packet hash.",
    failClosedIf: "Only a public preview hash or operator assertion is available."
  },
  {
    rule: "Audit event required",
    status: "hard-stop",
    evidenceRequired: "Append-only packet audit event UUID from the protected workspace.",
    passSignal: "Audit event and packet metadata reference the same manual QA run.",
    failClosedIf: "The audit event is missing, synthetic target is ambiguous, or IDs do not match."
  },
  {
    rule: "No secrets or PHI",
    status: "hard-stop",
    evidenceRequired: "Only workflow ID, run URL, timestamp, target ID, safe object UUID, packet hash, and audit UUID.",
    passSignal: "No token, credential, PHI, payer member data, source contract, URL artifact, report, or approval document is present.",
    failClosedIf: "Any field contains secret-like, PHI-like, credential-like, or regulated identifiers."
  },
  {
    rule: "Proof Promotion decision required",
    status: "required",
    evidenceRequired: "Proof Promotion state ready-for-buyer-diligence.",
    passSignal: "Promotion allows only retained packet metadata and keeps production claims blocked.",
    failClosedIf: "Proof Promotion is pending, under review, or not visible."
  },
  {
    rule: "Claim Guard required",
    status: "required",
    evidenceRequired: "Claim Guard confirms current language does not overclaim retained proof or production authority.",
    passSignal: "Buyer language stays bounded to synthetic QA evidence and retained packet metadata.",
    failClosedIf: "Language implies legal approval, certification, live clinical care, PHI authority, reimbursement certainty, or connector approval."
  },
  {
    rule: "Human AAL2 provenance required",
    status: "required",
    evidenceRequired: "Operator attestation no-secrets-no-phi-aal2-human-run and token disposal attestation temporary-token-deleted-or-rotated.",
    passSignal: "The run was deliberate, human initiated, scoped, synthetic, and the temporary token was removed.",
    failClosedIf: "The workflow was unattended, scheduled, broad-targeted, or token disposal is not attested."
  },
  {
    rule: "Clinical and production authority blocked",
    status: "hard-stop",
    evidenceRequired: "Separate external approvals for clinical, legal, privacy, security, reimbursement, regional, connector, and customer go-live authority.",
    passSignal: "Activation Seal remains limited to buyer diligence for governed synthetic QA.",
    failClosedIf: "Anyone treats QA evidence as clinical, PHI, payer, reimbursement, certification, connector, or production authorization."
  }
];

function lowerText(value: unknown) {
  return JSON.stringify(value ?? "").toLowerCase();
}

function hasForbiddenKey(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;

  const keys = Object.keys(value as Record<string, unknown>);

  return keys.some((key) => forbiddenKeys.includes(key));
}

function matchHardStops(value: unknown) {
  const text = lowerText(value);

  return hardStopClaims.filter((claim) => text.includes(claim.toLowerCase()));
}

function hasSecretLikeContent(value: unknown) {
  const text = JSON.stringify(value ?? "");

  return [
    /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/,
    /Bearer\s+[A-Za-z0-9._-]+/i,
    /sk-[A-Za-z0-9_-]{12,}/,
    /sbp_[A-Za-z0-9_-]{12,}/,
    /patient\s*(id|identifier|mrn)/i,
    /member\s*(id|identifier)/i
  ].some((pattern) => pattern.test(text));
}

function readString(record: Record<string, unknown>, key: string) {
  const value = record[key];

  return typeof value === "string" ? value.trim() : "";
}

function missingCandidateEvidence(value: unknown) {
  const record = value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
  const missing: string[] = [];

  const requiredFields = [
    "workflowRunId",
    "workflowRunUrl",
    "packetSha256",
    "packetAuditEventId",
    "protectedWorkspaceSlug",
    "proofPromotionState",
    "claimDecisionState",
    "operatorAttestation",
    "tokenDisposalAttestation",
    "dataBoundary"
  ];

  for (const field of requiredFields) {
    if (!readString(record, field)) missing.push(field);
  }

  if (readString(record, "proofPromotionState") !== "ready-for-buyer-diligence") {
    missing.push("proofPromotionState=ready-for-buyer-diligence");
  }

  if (!["safe-current-claim", "requires-retained-packet"].includes(readString(record, "claimDecisionState"))) {
    missing.push("claimDecisionState=safe-current-claim-or-requires-retained-packet");
  }

  if (readString(record, "operatorAttestation") !== "no-secrets-no-phi-aal2-human-run") {
    missing.push("operatorAttestation=no-secrets-no-phi-aal2-human-run");
  }

  if (readString(record, "tokenDisposalAttestation") !== "temporary-token-deleted-or-rotated") {
    missing.push("tokenDisposalAttestation=temporary-token-deleted-or-rotated");
  }

  if (readString(record, "dataBoundary") !== "synthetic-business-workflow-only") {
    missing.push("dataBoundary=synthetic-business-workflow-only");
  }

  if (!/^[a-f0-9]{64}$/i.test(readString(record, "packetSha256"))) {
    missing.push("packetSha256 valid SHA-256");
  }

  if (!/^[0-9]{6,32}$/.test(readString(record, "workflowRunId"))) {
    missing.push("workflowRunId numeric GitHub run ID");
  }

  if (!/^https:\/\/github\.com\/temitayodahunsi777\/scrimed-site\/actions\/runs\/[0-9]+$/.test(readString(record, "workflowRunUrl"))) {
    missing.push("workflowRunUrl SCRIMED GitHub Actions run URL");
  }

  return Array.from(new Set(missing));
}

export function deriveQaActivationSealDecision({
  manualQaEvidencePackets = [],
  workspaceSlug = "{workspaceSlug}"
}: {
  manualQaEvidencePackets?: QaManualRunEvidencePacketRecord[];
  workspaceSlug?: string;
}): QaActivationSealDecision {
  const proofPromotion = deriveQaProofPromotionDecision({
    manualQaEvidencePackets,
    workspaceSlug
  });
  const latest = manualQaEvidencePackets[0] ?? null;

  if (latest && proofPromotion.promotionAllowed) {
    return {
      state: "sealed-for-buyer-diligence",
      sealAllowed: true,
      buyerUseAllowed: true,
      packetCount: manualQaEvidencePackets.length,
      latestPacketHash: latest.packetSha256,
      latestWorkflowRunId: latest.workflowRunId,
      missingEvidence: [],
      requiredEvidence,
      buyerSafeClaim:
        "SCRIMED has a protected no-secret manual AAL2 synthetic QA packet visible for buyer diligence.",
      nextAction:
        "Use only retained packet hash, workflow run ID, audit event reference, and blocked production-claim language in Buyer Diligence.",
      boundary: qaActivationSealBoundary
    };
  }

  return {
    state: "unsealed-human-aal2-required",
    sealAllowed: false,
    buyerUseAllowed: false,
    packetCount: manualQaEvidencePackets.length,
    latestPacketHash: latest?.packetSha256 ?? "pending",
    latestWorkflowRunId: latest?.workflowRunId ?? "pending",
    missingEvidence: [
      "protected packet SHA-256 visibility",
      "Proof Promotion ready-for-buyer-diligence decision",
      "final Claim Guard check for buyer language"
    ],
    requiredEvidence,
    buyerSafeClaim:
      "SCRIMED has a no-secret activation path, but the QA Activation Seal remains unsealed until protected packet evidence is visible.",
    nextAction:
      "Complete Launch Kit, validate through Completion Bridge, persist protected no-secret metadata, confirm Proof Promotion, then run Claim Guard before buyer use.",
    boundary: qaActivationSealBoundary
  };
}

export function evaluateQaActivationSealCandidate(value: unknown): QaActivationSealCandidateEvaluation {
  const risks = [
    ...matchHardStops(value),
    ...(hasForbiddenKey(value) ? ["forbidden secret-or-regulated key"] : []),
    ...(hasSecretLikeContent(value) ? ["secret-like or regulated identifier content"] : [])
  ];

  if (risks.length > 0) {
    return {
      service: "scrimed-qa-activation-seal",
      status: qaActivationSealStatus,
      decisionState: "blocked-boundary-violation",
      sealAllowed: false,
      publicVerificationOnly: true,
      candidateComplete: false,
      matchedRisks: risks,
      missingEvidence: requiredEvidence,
      requiredEvidence,
      saferLanguage:
        "SCRIMED remains in governed synthetic pilot and enterprise evaluation posture; clinical, PHI, reimbursement, certification, connector, and production authority claims remain separately gated.",
      nextAction:
        "Remove unsafe content and route the claim or packet through Boundary Resolution, Claim Guard, and qualified reviewers before any use.",
      boundary: qaActivationSealBoundary
    };
  }

  const missingEvidence = missingCandidateEvidence(value);

  if (missingEvidence.length > 0) {
    return {
      service: "scrimed-qa-activation-seal",
      status: qaActivationSealStatus,
      decisionState: "unsealed-human-aal2-required",
      sealAllowed: false,
      publicVerificationOnly: true,
      candidateComplete: false,
      matchedRisks: [],
      missingEvidence,
      requiredEvidence,
      saferLanguage:
        "SCRIMED has a no-secret activation path; retained proof language remains blocked until protected packet visibility and promotion checks are complete.",
      nextAction:
        "Complete the human AAL2 run, Completion Bridge validation, protected persistence, Proof Promotion, and Claim Guard before buyer use.",
      boundary: qaActivationSealBoundary
    };
  }

  return {
    service: "scrimed-qa-activation-seal",
    status: qaActivationSealStatus,
    decisionState: "candidate-ready-protected-verification-required",
    sealAllowed: false,
    publicVerificationOnly: true,
    candidateComplete: true,
    matchedRisks: [],
    missingEvidence: ["protected workspace server-side packet visibility check"],
    requiredEvidence,
    saferLanguage:
      "The no-secret candidate appears complete, but SCRIMED should not call it sealed until the protected workspace verifies packet visibility.",
    nextAction:
      "Verify this same metadata inside the protected workspace, confirm Proof Promotion, then use only retained packet metadata in buyer diligence.",
    boundary: qaActivationSealBoundary
  };
}

function markdownItems(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

export function getQaActivationSealSummary() {
  const decision = deriveQaActivationSealDecision({});

  return {
    service: "scrimed-qa-activation-seal",
    route: qaActivationSealRoute,
    apiRoute: qaActivationSealApiRoute,
    briefRoute: qaActivationSealBriefRoute,
    status: qaActivationSealStatus,
    proofStackStatus: qaActivationSealProofStackStatus,
    briefProofStackStatus: qaActivationSealBriefProofStackStatus,
    boundary: qaActivationSealBoundary,
    decision,
    decisionState: decision.state,
    sealAllowed: decision.sealAllowed,
    buyerUseAllowed: decision.buyerUseAllowed,
    launchKitRoute: qaLaunchKitRoute,
    launchKitStatus: qaLaunchKitStatus,
    completionBridgeRoute: qaCompletionBridgeRoute,
    completionBridgeStatus: qaCompletionBridgeStatus,
    claimGuardRoute: qaClaimGuardRoute,
    claimGuardStatus: qaClaimGuardStatus,
    proofPromotionRoute: qaProofPromotionRoute,
    proofPromotionStatus: qaProofPromotionStatus,
    requiredEvidence,
    requiredEvidenceCount: requiredEvidence.length,
    ruleCount: sealRules.length,
    hardStopRuleCount: sealRules.filter((rule) => rule.status === "hard-stop").length,
    hardStopClaims,
    hardStopClaimCount: hardStopClaims.length,
    rules: sealRules,
    buyerSafeCurrentLanguage:
      "SCRIMED has an activation-ready no-secret human AAL2 synthetic QA path; the QA Activation Seal remains unsealed until protected packet evidence is visible.",
    nextRecommendedBuildStep:
      "Use QA Activation Seal after protected Manual QA Evidence persistence to confirm packet visibility, Proof Promotion readiness, Claim Guard language, and blocked production authority before Buyer Diligence export.",
    updated: "2026-06-22"
  };
}

export function buildQaActivationSealBrief() {
  const summary = getQaActivationSealSummary();

  return [
    "# SCRIMED QA Activation Seal Brief",
    "",
    `Status: ${summary.status}`,
    `Decision state: ${summary.decisionState}`,
    `Seal allowed: ${summary.sealAllowed ? "yes" : "no"}`,
    `Buyer use allowed: ${summary.buyerUseAllowed ? "yes" : "no"}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "## Current Decision",
    `- Buyer-safe claim: ${summary.decision.buyerSafeClaim}`,
    `- Next action: ${summary.decision.nextAction}`,
    "",
    "## Required Evidence",
    markdownItems(summary.requiredEvidence),
    "",
    "## Rules",
    ...summary.rules.map(
      (rule) =>
        `- ${rule.rule} (${rule.status}): ${rule.evidenceRequired} Pass: ${rule.passSignal} Fail closed if: ${rule.failClosedIf}`
    ),
    "",
    "## Hard-Stop Claims",
    markdownItems(summary.hardStopClaims),
    "",
    "## Routes",
    `- Launch Kit: ${summary.launchKitRoute}`,
    `- Completion Bridge: ${summary.completionBridgeRoute}`,
    `- Claim Guard: ${summary.claimGuardRoute}`,
    `- Proof Promotion: ${summary.proofPromotionRoute}`,
    "",
    "## Next Recommended Build Step",
    summary.nextRecommendedBuildStep
  ].join("\n");
}
