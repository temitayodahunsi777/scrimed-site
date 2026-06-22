import type { PilotAuditEventRecord } from "./protectedPilotWorkspace";
import type { QaManualRunEvidencePacketRecord } from "./qaEvidenceLedger";

export type QaProofPromotionState =
  | "pending-retained-packet"
  | "review-audit-signal-without-visible-packet"
  | "ready-for-buyer-diligence";

export type QaProofPromotionDecision = {
  state: QaProofPromotionState;
  promotionAllowed: boolean;
  packetCount: number;
  auditSignalCount: number;
  latestPacketHash: string;
  latestWorkflowRunId: string;
  latestWorkflowKind: string;
  latestCreatedAt: string;
  buyerSafeClaim: string;
  buyerProofLanguage: string;
  nextAction: string;
  blockedClaims: string[];
  requiredEvidence: string[];
};

export type QaProofPromotionRule = {
  rule: string;
  status: "active" | "hard-stop";
  beforePromotion: string;
  afterPromotion: string;
  boundary: string;
};

export const qaProofPromotionStatus = "manual-aal2-qa-proof-promotion-gate-ready";
export const qaProofPromotionProofStackStatus =
  "retained-manual-qa-proof-promotion-gate-no-secret";
export const qaProofPromotionBriefProofStackStatus =
  "manual-qa-proof-promotion-brief-retained-packet-required";

export const qaProofPromotionRoute = "/qa-proof-promotion";
export const qaProofPromotionApiRoute = "/api/qa-evidence/proof-promotion";
export const qaProofPromotionBriefRoute = "/api/qa-evidence/proof-promotion/brief";
export const qaProofPromotionProtectedPersistenceRoute =
  "/api/pilot-workspaces/{workspaceSlug}/qa-evidence/manual-run-packets";

export const qaProofPromotionBoundary =
  "SCRIMED Manual QA Proof Promotion decides when retained no-secret human AAL2 QA packet metadata can be referenced in buyer diligence. It does not execute AAL2 workflows, store tokens, store PHI, certify security or compliance, authorize live clinical care, guarantee reimbursement, approve production connectors, or allow authenticated-proof claims before a protected packet hash is visible.";

const blockedClaims = [
  "authenticated QA completed without a retained protected packet hash",
  "bearer token retained as evidence",
  "PHI processed or validated",
  "live clinical care authorized",
  "security certification completed",
  "compliance certification completed",
  "reimbursement outcome guaranteed",
  "production connector approved",
  "autonomous diagnosis or treatment authorized"
];

const requiredEvidence = [
  "workflow kind",
  "workflow run ID",
  "workflow run URL",
  "execution timestamp",
  "synthetic target ID",
  "created safe object UUID",
  "packet audit event UUID",
  "token disposal attestation",
  "packet SHA-256",
  "protected workspace audit visibility"
];

export const qaProofPromotionRules: QaProofPromotionRule[] = [
  {
    rule: "Retained packet hash required",
    status: "hard-stop",
    beforePromotion: "Describe the workflow as activation-ready or operator-ready only.",
    afterPromotion: "Reference the retained packet hash and workflow run ID in buyer diligence.",
    boundary: "No hash means no retained authenticated QA proof claim."
  },
  {
    rule: "No-secret evidence only",
    status: "hard-stop",
    beforePromotion: "Reject bearer tokens, refresh tokens, credentials, PHI, payer data, artifacts, URLs, legal opinions, and security reports.",
    afterPromotion: "Use only safe metadata fields and the packet SHA-256.",
    boundary: "The token itself is never evidence."
  },
  {
    rule: "Human AAL2 provenance required",
    status: "active",
    beforePromotion: "Use Run Control and Manual QA Evidence capture under a fresh human AAL2 session.",
    afterPromotion: "State that the packet records a human-run synthetic QA workflow.",
    boundary: "AAL2 provenance is not clinical, legal, reimbursement, or production authorization."
  },
  {
    rule: "Buyer Diligence export after persistence",
    status: "active",
    beforePromotion: "Keep Buyer Diligence language in pending activation posture.",
    afterPromotion: "Allow Buyer Diligence to include retained packet count, run ID, packet hash, and audit event reference.",
    boundary: "Buyer proof is limited to governed synthetic QA evidence."
  },
  {
    rule: "Clinical and production claims remain blocked",
    status: "hard-stop",
    beforePromotion: "Do not imply live care, PHI processing, payer submission, or connector approval.",
    afterPromotion: "Continue blocking live clinical, PHI, payer, reimbursement, security-certification, and production-launch claims.",
    boundary: "Retained QA proof improves diligence; it does not unlock production clinical execution."
  }
];

function hasManualQaAuditSignal(auditEvents: PilotAuditEventRecord[]) {
  return auditEvents.filter((event) => event.eventType === "manual-qa-evidence-packet-recorded").length;
}

export function deriveQaProofPromotionDecision({
  auditEvents = [],
  manualQaEvidencePackets = [],
  workspaceSlug = "{workspaceSlug}"
}: {
  auditEvents?: PilotAuditEventRecord[];
  manualQaEvidencePackets?: QaManualRunEvidencePacketRecord[];
  workspaceSlug?: string;
}): QaProofPromotionDecision {
  const latest = manualQaEvidencePackets[0] ?? null;
  const auditSignalCount = hasManualQaAuditSignal(auditEvents);

  if (latest) {
    return {
      state: "ready-for-buyer-diligence",
      promotionAllowed: true,
      packetCount: manualQaEvidencePackets.length,
      auditSignalCount,
      latestPacketHash: latest.packetSha256,
      latestWorkflowRunId: latest.workflowRunId,
      latestWorkflowKind: latest.workflowKind ?? "sales-demo-session-qa",
      latestCreatedAt: latest.createdAt,
      buyerSafeClaim:
        "SCRIMED has retained no-secret manual AAL2 synthetic QA evidence metadata in the protected workspace.",
      buyerProofLanguage:
        `Retained manual QA evidence is visible for workspace ${workspaceSlug}: workflow ${latest.workflowRunId}, packet hash ${latest.packetSha256}.`,
      nextAction:
        "Export Buyer Diligence and include only the workflow run ID, packet hash, audit event reference, data boundary, and blocked production claims.",
      blockedClaims,
      requiredEvidence
    };
  }

  if (auditSignalCount > 0) {
    return {
      state: "review-audit-signal-without-visible-packet",
      promotionAllowed: false,
      packetCount: 0,
      auditSignalCount,
      latestPacketHash: "not-visible",
      latestWorkflowRunId: "not-visible",
      latestWorkflowKind: "not-visible",
      latestCreatedAt: "not-visible",
      buyerSafeClaim:
        "A manual QA audit signal exists, but retained packet metadata must be visible before buyer proof promotion.",
      buyerProofLanguage:
        "Manual QA evidence remains under review because the protected packet hash is not visible to this evidence surface.",
      nextAction:
        "Refresh Manual QA Evidence, verify packet visibility, then export Buyer Diligence only after the packet hash appears.",
      blockedClaims,
      requiredEvidence
    };
  }

  return {
    state: "pending-retained-packet",
    promotionAllowed: false,
    packetCount: 0,
    auditSignalCount,
    latestPacketHash: "pending",
    latestWorkflowRunId: "pending",
    latestWorkflowKind: "pending",
    latestCreatedAt: "pending",
    buyerSafeClaim:
      "SCRIMED has an operator-ready manual AAL2 QA path, but retained authenticated QA proof is still pending.",
    buyerProofLanguage:
      "Buyer-facing proof may reference activation readiness, Run Control, and fail-closed checks, but not retained authenticated QA proof.",
    nextAction:
      "Use /qa-run-control, complete one human AAL2 synthetic QA workflow, persist the no-secret packet, then promote after packet hash visibility.",
    blockedClaims,
    requiredEvidence
  };
}

function markdownItems(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

function ruleLines(rules: QaProofPromotionRule[]) {
  return rules
    .map(
      (rule) =>
        `- ${rule.rule} (${rule.status}): before ${rule.beforePromotion} After ${rule.afterPromotion} Boundary: ${rule.boundary}`
    )
    .join("\n");
}

export function getQaProofPromotionSummary() {
  const decision = deriveQaProofPromotionDecision({});

  return {
    service: "scrimed-manual-qa-proof-promotion",
    route: qaProofPromotionRoute,
    apiRoute: qaProofPromotionApiRoute,
    briefRoute: qaProofPromotionBriefRoute,
    status: qaProofPromotionStatus,
    proofStackStatus: qaProofPromotionProofStackStatus,
    briefProofStackStatus: qaProofPromotionBriefProofStackStatus,
    boundary: qaProofPromotionBoundary,
    decision,
    promotionDecisionState: decision.state,
    promotionAllowed: decision.promotionAllowed,
    sourceLedgerStatus: "qa-evidence-ledger-active",
    sourceRunControlStatus: "manual-aal2-qa-run-control-ready",
    protectedPersistenceRoute: qaProofPromotionProtectedPersistenceRoute,
    ruleCount: qaProofPromotionRules.length,
    hardStopRuleCount: qaProofPromotionRules.filter((rule) => rule.status === "hard-stop").length,
    requiredEvidence,
    blockedClaims,
    rules: qaProofPromotionRules,
    claimRules: [
      "Allowed now: SCRIMED can explain exactly when manual AAL2 QA evidence may be promoted into buyer diligence.",
      "Allowed now: SCRIMED can keep buyer proof in activation-ready posture until packet hashes are retained.",
      "Allowed after retained packet: SCRIMED can cite no-secret workflow run metadata and packet SHA-256 for a synthetic QA workflow.",
      "Never allowed from this gate alone: live clinical care, PHI processing, payer submission, production connector approval, security certification, reimbursement certainty, or autonomous clinical action."
    ],
    nextRecommendedBuildStep:
      "Run one human AAL2 workflow from /qa-run-control, persist the no-secret packet, then let Buyer Pilot Room export reference the retained packet hash through this promotion gate.",
    updated: "2026-06-21"
  };
}

export function buildQaProofPromotionBrief() {
  const summary = getQaProofPromotionSummary();

  return [
    "# SCRIMED Manual QA Proof Promotion Brief",
    "",
    `Status: ${summary.status}`,
    `Promotion state: ${summary.promotionDecisionState}`,
    `Promotion allowed: ${summary.promotionAllowed ? "yes" : "no"}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "## Current Decision",
    `- Buyer-safe claim: ${summary.decision.buyerSafeClaim}`,
    `- Buyer proof language: ${summary.decision.buyerProofLanguage}`,
    `- Next action: ${summary.decision.nextAction}`,
    "",
    "## Promotion Rules",
    ruleLines(summary.rules),
    "",
    "## Required Evidence",
    markdownItems(summary.requiredEvidence),
    "",
    "## Blocked Claims",
    markdownItems(summary.blockedClaims),
    "",
    "## Claim Rules",
    markdownItems(summary.claimRules),
    "",
    "## Next Recommended Build Step",
    summary.nextRecommendedBuildStep
  ].join("\n");
}
