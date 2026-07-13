import { getQaAal2SmokeReadinessPacket } from "./qaAal2RunEvidence";
import { getReleaseEvidenceLedgerSummary } from "./releaseEvidenceLedger";
import { getReleaseEvidencePromotionSummary } from "./releaseEvidencePromotion";

export type DiligenceReleaseGateState =
  | "go-no-secret-buyer-diligence"
  | "review-required"
  | "no-go";

export type DiligenceReleaseGateCard = {
  id: string;
  label: string;
  state: DiligenceReleaseGateState;
  evidence: string;
  route: string;
  nextAction: string;
  safetyBoundary: string;
};

export type DiligenceReleaseGateSummary = {
  service: "scrimed-diligence-release-gate";
  status: typeof diligenceReleaseGateStatus;
  route: typeof diligenceReleaseGateRoute;
  apiRoute: typeof diligenceReleaseGateApiRoute;
  briefRoute: typeof diligenceReleaseGateBriefRoute;
  generatedAt: "static-no-secret-diligence-release-gate";
  noPhiConfirmed: true;
  tokenMaterialCaptured: false;
  productionApproval: false;
  buyerDiligenceGate: "go-no-secret-metadata-with-release-steward-review";
  protectedAal2Gate: "no-go-until-human-aal2-retained-packet";
  publicDistributionGate: "no-go-until-qualified-review";
  productionReleaseGate: "no-go-not-release-approval";
  clinicalProductionGate: "no-go-not-authorized-live-care";
  gateCount: number;
  goCount: number;
  reviewRequiredCount: number;
  noGoCount: number;
  cards: DiligenceReleaseGateCard[];
  allowedClaims: string[];
  blockedClaims: string[];
  requiredNextActions: string[];
  boundary: typeof diligenceReleaseGateBoundary;
};

export const diligenceReleaseGateStatus =
  "diligence-release-gate-active-no-production-approval";
export const diligenceReleaseGateRoute =
  "/release-continuity#diligence-release-gate";
export const diligenceReleaseGateApiRoute =
  "/api/release-continuity/diligence-gate";
export const diligenceReleaseGateBriefRoute =
  "/api/release-continuity/diligence-gate/brief";

export const diligenceReleaseGateBoundary =
  "SCRIMED Diligence Release Gate summarizes no-secret buyer diligence readiness while preserving NO-GO boundaries for protected AAL2 proof, public distribution, production release, PHI processing, certification, and live clinical care.";

const allowedClaims = [
  "SCRIMED has no-secret synthetic buyer diligence evidence metadata available for review.",
  "SCRIMED separates shareable release metadata from protected AAL2 proof blockers.",
  "SCRIMED keeps public distribution, production approval, PHI authority, certification, and live clinical care externally gated."
];

const blockedClaims = [
  "production release approved",
  "public distribution approved",
  "strict AAL2 proof retained",
  "PHI processing authorized",
  "live clinical care authorized",
  "security or compliance certified",
  "production connector approved",
  "customer go-live approved",
  "clinical validation completed"
];

function gateCard(input: DiligenceReleaseGateCard): DiligenceReleaseGateCard {
  return input;
}

export function getDiligenceReleaseGateSummary(): DiligenceReleaseGateSummary {
  const aal2Readiness = getQaAal2SmokeReadinessPacket();
  const ledger = getReleaseEvidenceLedgerSummary();
  const promotion = getReleaseEvidencePromotionSummary();

  const cards = [
    gateCard({
      id: "no-secret-release-evidence",
      label: "No-secret release evidence",
      state: ledger.passedNoSecretCount >= 5 ? "go-no-secret-buyer-diligence" : "review-required",
      evidence:
        `${ledger.passedNoSecretCount}/${ledger.entryCount} release ledger entries are passed no-secret metadata.`,
      route: ledger.apiRoute,
      nextAction:
        "Attach command names, statuses, routes, evidence hashes, safe-use labels, and blocked claims to buyer diligence packets only.",
      safetyBoundary: ledger.boundary
    }),
    gateCard({
      id: "promotion-queue-shareability",
      label: "Promotion queue shareability",
      state: promotion.shareableNoSecretCount > 0 ? "go-no-secret-buyer-diligence" : "review-required",
      evidence:
        `${promotion.shareableNoSecretCount}/${promotion.queueCount} promotion entries are metadata-safe buyer-diligence candidates.`,
      route: promotion.apiRoute,
      nextAction:
        "Use the promotion queue to separate shareable metadata from protected operator proof and qualified-review blockers.",
      safetyBoundary: promotion.boundary
    }),
    gateCard({
      id: "strict-aal2-proof",
      label: "Strict AAL2 proof",
      state: aal2Readiness.strictAttemptReady ? "review-required" : "no-go",
      evidence:
        `Strict protected smoke ready: ${aal2Readiness.strictAttemptReady}; human run required: ${aal2Readiness.protectedHumanRunRequired}.`,
      route: aal2Readiness.routes.api,
      nextAction:
        "Run strict protected smoke only after a fresh authorized human AAL2 token and target feature flag exist, then retain no-secret packet metadata.",
      safetyBoundary: aal2Readiness.boundary
    }),
    gateCard({
      id: "external-approval-claims",
      label: "External approval claims",
      state: "no-go",
      evidence:
        `${promotion.externalReviewRequiredCount} promotion entries require qualified external review before claim expansion.`,
      route: promotion.apiRoute,
      nextAction:
        "Route legal, privacy, security, clinical, reimbursement, regional, certification, connector, and customer go-live claims through qualified review.",
      safetyBoundary:
        "External approval claims cannot be created by release evidence, smoke tests, internal summaries, or model output."
    }),
    gateCard({
      id: "production-and-clinical-authority",
      label: "Production and clinical authority",
      state: "no-go",
      evidence:
        "Release gate retains not-release-approval, not-authorized-production-phi, and not-authorized-live-care authority.",
      route: "/api/release-continuity",
      nextAction:
        "Keep live PHI, live clinical care, payer submission, patient outreach, EHR writeback, and production connector use blocked.",
      safetyBoundary: diligenceReleaseGateBoundary
    })
  ];
  const goCount = cards.filter((card) => card.state === "go-no-secret-buyer-diligence").length;
  const reviewRequiredCount = cards.filter((card) => card.state === "review-required").length;
  const noGoCount = cards.filter((card) => card.state === "no-go").length;

  return {
    service: "scrimed-diligence-release-gate",
    status: diligenceReleaseGateStatus,
    route: diligenceReleaseGateRoute,
    apiRoute: diligenceReleaseGateApiRoute,
    briefRoute: diligenceReleaseGateBriefRoute,
    generatedAt: "static-no-secret-diligence-release-gate",
    noPhiConfirmed: true,
    tokenMaterialCaptured: false,
    productionApproval: false,
    buyerDiligenceGate: "go-no-secret-metadata-with-release-steward-review",
    protectedAal2Gate: "no-go-until-human-aal2-retained-packet",
    publicDistributionGate: "no-go-until-qualified-review",
    productionReleaseGate: "no-go-not-release-approval",
    clinicalProductionGate: "no-go-not-authorized-live-care",
    gateCount: cards.length,
    goCount,
    reviewRequiredCount,
    noGoCount,
    cards,
    allowedClaims,
    blockedClaims,
    requiredNextActions: [
      "Attach only no-secret release ledger and promotion queue metadata to buyer diligence.",
      "Retain strict AAL2 proof only after a human operator run creates protected no-secret packet metadata.",
      "Run Claim Guard before any public language expands beyond current-state readiness.",
      "Route legal, privacy, security, clinical, reimbursement, regional, certification, connector, and customer go-live claims to qualified review."
    ],
    boundary: diligenceReleaseGateBoundary
  };
}

export function buildDiligenceReleaseGateBrief() {
  const summary = getDiligenceReleaseGateSummary();

  return [
    "# SCRIMED Diligence Release Gate",
    "",
    `Status: ${summary.status}`,
    `Generated: ${summary.generatedAt}`,
    `Buyer diligence gate: ${summary.buyerDiligenceGate}`,
    `Protected AAL2 gate: ${summary.protectedAal2Gate}`,
    `Public distribution gate: ${summary.publicDistributionGate}`,
    `Production release gate: ${summary.productionReleaseGate}`,
    `Clinical production gate: ${summary.clinicalProductionGate}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "## Gate Cards",
    ...summary.cards.map(
      (card) =>
        `- ${card.label} (${card.state}): ${card.evidence} Route: ${card.route}. Next: ${card.nextAction}`
    ),
    "",
    "## Allowed Claims",
    ...summary.allowedClaims.map((claim) => `- ${claim}`),
    "",
    "## Blocked Claims",
    ...summary.blockedClaims.map((claim) => `- ${claim}`),
    "",
    "## Required Next Actions",
    ...summary.requiredNextActions.map((action) => `- ${action}`)
  ].join("\n");
}
