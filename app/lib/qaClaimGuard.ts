import { qaCompletionBridgeRoute } from "./qaCompletionBridge";
import { qaEvidenceLedgerBoundary } from "./qaEvidenceLedger";
import { qaLaunchKitRoute } from "./qaLaunchKit";
import { qaProofPromotionRoute } from "./qaProofPromotion";

export type QaClaimGuardDecisionState =
  | "safe-current-claim"
  | "requires-retained-packet"
  | "blocked-authority-claim"
  | "needs-qualified-review";

export type QaClaimGuardEvaluation = {
  service: "scrimed-qa-claim-guard";
  status: typeof qaClaimGuardStatus;
  decisionState: QaClaimGuardDecisionState;
  allowedForCurrentBuyerUse: boolean;
  claim: string;
  matchedSignals: string[];
  requiredEvidence: string[];
  saferLanguage: string;
  nextAction: string;
  boundary: string;
};

export type QaClaimGuardRule = {
  rule: string;
  state: QaClaimGuardDecisionState;
  appliesWhen: string;
  requiredEvidence: string;
  saferLanguage: string;
};

export const qaClaimGuardStatus = "manual-aal2-qa-claim-guard-ready";
export const qaClaimGuardProofStackStatus =
  "manual-aal2-qa-claim-guard-no-overclaim";
export const qaClaimGuardBriefProofStackStatus =
  "manual-aal2-qa-claim-guard-brief-current-state-language";

export const qaClaimGuardRoute = "/qa-claim-guard";
export const qaClaimGuardApiRoute = "/api/qa-evidence/claim-guard";
export const qaClaimGuardBriefRoute = "/api/qa-evidence/claim-guard/brief";

export const qaClaimGuardBoundary =
  "SCRIMED QA Claim Guard classifies buyer, investor, sales, and operator language for current manual AAL2 QA posture. It does not create authenticated QA proof, persist evidence, replace counsel, certify security or compliance, authorize PHI processing, authorize live clinical care, guarantee reimbursement, approve production connectors, or approve public claims without retained evidence and qualified review.";

const safeCurrentClaims = [
  "SCRIMED has a no-secret operator-ready path for human AAL2 synthetic QA.",
  "SCRIMED public smoke verifies route health, fail-closed protected APIs, and synthetic-only boundaries.",
  "SCRIMED can validate no-secret candidate QA metadata before protected persistence.",
  "SCRIMED can keep buyer diligence in activation-ready posture until protected packet hashes are visible.",
  "SCRIMED blocks live clinical, PHI, reimbursement, security-certification, connector, and production authority claims."
];

const retainedPacketClaims = [
  "retained authenticated QA evidence",
  "retained manual AAL2 QA proof",
  "completed human AAL2 QA workflow",
  "protected packet hash is visible",
  "buyer diligence includes retained packet SHA-256",
  "authenticated QA packet retained"
];

const blockedAuthorityClaims = [
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
  "payer submission authorized",
  "patient outreach authorized",
  "clinical validation completed",
  "regional regulatory approval completed"
];

const reviewTriggers = [
  "customer case study",
  "press release",
  "advertising claim",
  "investor deck",
  "public website claim",
  "security questionnaire",
  "legal approval",
  "BAA",
  "production go-live",
  "clinical workflow"
];

const safeSignals = [
  "synthetic",
  "no-secret",
  "operator-ready",
  "activation-ready",
  "fail-closed",
  "candidate metadata",
  "protected persistence required",
  "proof promotion required",
  "human AAL2 required"
];

const qaClaimGuardRules: QaClaimGuardRule[] = [
  {
    rule: "Current-state language only",
    state: "safe-current-claim",
    appliesWhen:
      "The claim describes synthetic, no-secret, activation-ready, fail-closed, or human-required workflow readiness.",
    requiredEvidence: "QA Evidence Ledger, Launch Kit, Human Run Packet, Completion Bridge, public smoke, and fail-closed route checks.",
    saferLanguage:
      "SCRIMED has a governed no-secret synthetic QA readiness path with human AAL2 gates still explicit."
  },
  {
    rule: "Retained packet language requires packet hash",
    state: "requires-retained-packet",
    appliesWhen:
      "The claim says authenticated QA evidence is retained, completed, packet-backed, or buyer-diligence-ready.",
    requiredEvidence: "Protected Manual QA Evidence packet SHA-256, audit event ID, workflow run ID, and Proof Promotion ready state.",
    saferLanguage:
      "SCRIMED has an activation-ready path; retained authenticated QA proof will be referenced only after protected packet hash visibility."
  },
  {
    rule: "Clinical and production authority remain blocked",
    state: "blocked-authority-claim",
    appliesWhen:
      "The claim implies live care, PHI processing, security/compliance certification, FDA approval, reimbursement certainty, production connector approval, payer submission, patient outreach, or autonomous clinical action.",
    requiredEvidence:
      "Separate signed customer, legal, privacy, security, clinical, regional, reimbursement, connector, and production approvals.",
    saferLanguage:
      "SCRIMED is currently positioned for governed synthetic pilots and enterprise evaluation; production clinical authority remains separately gated."
  },
  {
    rule: "External-use claims need qualified review",
    state: "needs-qualified-review",
    appliesWhen:
      "The claim is for public website, PR, advertising, investor materials, case studies, legal documents, security questionnaires, or production go-live.",
    requiredEvidence: "Qualified legal, privacy, security, clinical, marketing, finance, or customer approval depending on audience.",
    saferLanguage:
      "Use internal diligence language until the required external-use approval packet is retained."
  }
];

function normalizeClaim(value: unknown) {
  if (!value || typeof value !== "object") return "";

  const record = value as Record<string, unknown>;
  const claim = record.claim;

  return typeof claim === "string" ? claim.trim() : "";
}

function matchesAny(claim: string, patterns: string[]) {
  const lowerClaim = claim.toLowerCase();

  return patterns.filter((pattern) => lowerClaim.includes(pattern.toLowerCase()));
}

export function evaluateQaClaim(value: unknown): QaClaimGuardEvaluation {
  const claim = normalizeClaim(value);

  if (!claim) {
    return {
      service: "scrimed-qa-claim-guard",
      status: qaClaimGuardStatus,
      decisionState: "needs-qualified-review",
      allowedForCurrentBuyerUse: false,
      claim: "",
      matchedSignals: [],
      requiredEvidence: [
        "A bounded no-secret claim string",
        "Audience and distribution context before external use"
      ],
      saferLanguage:
        "SCRIMED has a governed synthetic QA readiness path; external claims require qualified review.",
      nextAction: "Submit a bounded claim with audience context and avoid secrets, PHI, credentials, or approvals.",
      boundary: qaClaimGuardBoundary
    };
  }

  const authorityMatches = matchesAny(claim, blockedAuthorityClaims);

  if (authorityMatches.length > 0) {
    return {
      service: "scrimed-qa-claim-guard",
      status: qaClaimGuardStatus,
      decisionState: "blocked-authority-claim",
      allowedForCurrentBuyerUse: false,
      claim,
      matchedSignals: authorityMatches,
      requiredEvidence: [
        "Signed external authority approval",
        "Clinical, legal, privacy, security, reimbursement, connector, and customer-specific review as applicable"
      ],
      saferLanguage:
        "SCRIMED remains sellable as a governed synthetic pilot and enterprise evaluation product while live-care, PHI, reimbursement, security-certification, connector, and production authority remain gated.",
      nextAction: "Route this claim to the Boundary Resolution Register and qualified reviewers before any external use.",
      boundary: qaClaimGuardBoundary
    };
  }

  const retainedPacketMatches = matchesAny(claim, retainedPacketClaims);

  if (retainedPacketMatches.length > 0) {
    return {
      service: "scrimed-qa-claim-guard",
      status: qaClaimGuardStatus,
      decisionState: "requires-retained-packet",
      allowedForCurrentBuyerUse: false,
      claim,
      matchedSignals: retainedPacketMatches,
      requiredEvidence: [
        "Protected Manual QA Evidence packet SHA-256",
        "Append-only audit event ID",
        "Workflow run ID and run URL",
        "Proof Promotion ready-for-buyer-diligence state"
      ],
      saferLanguage:
        "SCRIMED has an activation-ready no-secret human AAL2 QA path; retained authenticated QA proof will be referenced only after protected packet hash visibility.",
      nextAction:
        "Complete Launch Kit, validate dispatch through Human Run Packet, validate through Completion Bridge, persist protected metadata, then confirm Proof Promotion before using this claim.",
      boundary: qaClaimGuardBoundary
    };
  }

  const reviewMatches = matchesAny(claim, reviewTriggers);

  if (reviewMatches.length > 0) {
    return {
      service: "scrimed-qa-claim-guard",
      status: qaClaimGuardStatus,
      decisionState: "needs-qualified-review",
      allowedForCurrentBuyerUse: false,
      claim,
      matchedSignals: reviewMatches,
      requiredEvidence: [
        "Qualified reviewer approval",
        "Audience-specific release decision packet",
        "No-PHI, no-secret evidence source"
      ],
      saferLanguage:
        "Use internal diligence language until release authority, counsel, privacy/security, marketing, finance, and customer permissions are retained as applicable.",
      nextAction: "Route through protected release decision and external approval evidence controls before distribution.",
      boundary: qaClaimGuardBoundary
    };
  }

  const safeMatches = matchesAny(claim, safeSignals);

  return {
    service: "scrimed-qa-claim-guard",
    status: qaClaimGuardStatus,
    decisionState: safeMatches.length > 0 ? "safe-current-claim" : "needs-qualified-review",
    allowedForCurrentBuyerUse: safeMatches.length > 0,
    claim,
    matchedSignals: safeMatches,
    requiredEvidence: safeMatches.length > 0
      ? ["QA Evidence Ledger", "Launch Kit", "Human Run Packet", "Completion Bridge", "Proof Promotion boundary"]
      : ["Qualified reviewer approval", "Specific evidence source mapping"],
    saferLanguage: safeMatches.length > 0
      ? claim
      : "SCRIMED has a governed synthetic QA readiness path; qualify the claim before external use.",
    nextAction: safeMatches.length > 0
      ? "Keep this language bounded to current synthetic QA readiness and do not imply retained proof or production authority."
      : "Add evidence source, audience, and reviewer context before using this claim.",
    boundary: qaClaimGuardBoundary
  };
}

export function getQaClaimGuardSummary() {
  return {
    service: "scrimed-qa-claim-guard",
    route: qaClaimGuardRoute,
    apiRoute: qaClaimGuardApiRoute,
    briefRoute: qaClaimGuardBriefRoute,
    status: qaClaimGuardStatus,
    proofStackStatus: qaClaimGuardProofStackStatus,
    briefProofStackStatus: qaClaimGuardBriefProofStackStatus,
    boundary: qaClaimGuardBoundary,
    buyerClaimPosture: "activation-ready-until-retained-packet-proof",
    launchKitRoute: qaLaunchKitRoute,
    completionBridgeRoute: qaCompletionBridgeRoute,
    proofPromotionRoute: qaProofPromotionRoute,
    ruleCount: qaClaimGuardRules.length,
    safeCurrentClaimCount: safeCurrentClaims.length,
    retainedPacketClaimCount: retainedPacketClaims.length,
    blockedAuthorityClaimCount: blockedAuthorityClaims.length,
    reviewTriggerCount: reviewTriggers.length,
    rules: qaClaimGuardRules,
    safeCurrentClaims,
    retainedPacketClaims,
    blockedAuthorityClaims,
    reviewTriggers,
    defaultSafeClaim:
      "SCRIMED has a governed no-secret synthetic QA readiness path with human AAL2 gates, Completion Bridge validation, protected persistence, and Proof Promotion boundaries.",
    nextRecommendedBuildStep:
      "Use QA Claim Guard for every buyer, investor, sales, PR, and operator claim until the first protected manual QA packet hash is retained and Proof Promotion permits packet-backed language.",
    updated: "2026-06-22"
  };
}

function markdownItems(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

export function buildQaClaimGuardBrief() {
  const summary = getQaClaimGuardSummary();

  return [
    "# SCRIMED QA Claim Guard Brief",
    "",
    `Status: ${summary.status}`,
    `Buyer claim posture: ${summary.buyerClaimPosture}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "## Safe Current Claims",
    markdownItems(summary.safeCurrentClaims),
    "",
    "## Claims Requiring Retained Packet Evidence",
    markdownItems(summary.retainedPacketClaims),
    "",
    "## Blocked Authority Claims",
    markdownItems(summary.blockedAuthorityClaims),
    "",
    "## Review Triggers",
    markdownItems(summary.reviewTriggers),
    "",
    "## Rules",
    ...summary.rules.map(
      (rule) =>
        `- ${rule.rule} (${rule.state}): ${rule.appliesWhen} Required evidence: ${rule.requiredEvidence} Safer language: ${rule.saferLanguage}`
    ),
    "",
    "## Routes",
    `- Launch Kit: ${summary.launchKitRoute}`,
    `- Completion Bridge: ${summary.completionBridgeRoute}`,
    `- Proof Promotion: ${summary.proofPromotionRoute}`,
    "",
    "## Next Recommended Build Step",
    summary.nextRecommendedBuildStep,
    "",
    "## Ledger Boundary",
    qaEvidenceLedgerBoundary
  ].join("\n");
}
