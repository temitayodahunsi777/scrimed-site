import {
  cleanRoomCompetitivePlays,
  competitiveMarketIntelligenceBoundary,
  competitiveResearchSignals
} from "./competitiveMarketIntelligence";
import { generateScrimedAuditHash } from "./scrimedIntelligencePlatform";
import {
  scrimedEnterpriseAccelerationBoundary,
  scrimedPitchAssets,
  scrimedRevenueMotions
} from "./scrimedEnterpriseAcceleration";
import { scrimedSafetyPolicyVersion } from "./scrimedSafetyGovernance";

export type ScrimedMarketExecutionPriority = "immediate" | "near-term" | "strategic";

export type ScrimedMarketExecutionStage =
  | "research_signal"
  | "clean_room_translation"
  | "buyer_packaging"
  | "proof_artifact"
  | "privacy_legal_review"
  | "investor_narrative"
  | "revenue_activation";

export type ScrimedMarketExecutionLane = {
  slug: string;
  priority: ScrimedMarketExecutionPriority;
  sourcePattern: string;
  publicSources: string[];
  productSystem: string;
  targetAudience: string;
  salesMotion: string;
  revenueLever: string;
  investorNarrative: string;
  privacyLegalControl: string;
  publicRelationsPosition: string;
  proofArtifact: string;
  implementationSprint: string;
  stage: ScrimedMarketExecutionStage;
  humanReviewRequired: true;
  blockedActions: string[];
  retainedBoundary: string;
  auditHash: string;
};

export type ScrimedMarketExecutionScorecard = {
  marketSignalFreshness: number;
  cleanRoomDiscipline: number;
  buyerConversionReadiness: number;
  revenueActivationReadiness: number;
  investorNarrativeReadiness: number;
  privacyTrustReadiness: number;
  publicRelationsReadiness: number;
  productionReadiness: false;
};

export type ScrimedMarketExecutionRiskControl = {
  id: string;
  control: string;
  reason: string;
  enforcement: string;
  owner: string;
};

export const scrimedMarketExecutionApiRoute = "/api/scrimed-market-execution";
export const scrimedMarketExecutionBriefRoute = "/api/scrimed-market-execution/brief";
export const scrimedMarketExecutionPageRoute = "/scrimed-market-execution";
export const scrimedMarketExecutionStatus = "scrimed-market-execution-active-clean-room-no-phi";

export const scrimedMarketExecutionBoundary =
  "SCRIMED Market Execution Engine converts public, clean-room competitive research into original SCRIMED product packaging, proof artifacts, sales motions, revenue levers, privacy controls, public-relations language, and investor narratives. It does not copy competitor code, proprietary workflows, private APIs, pricing sheets, UI, branding, logos, datasets, model weights, customer proof, regulatory approvals, certification claims, or production integration claims.";

const blockedActions = [
  "No PHI or live patient data",
  "No autonomous diagnosis, treatment, prescribing, triage, or imaging interpretation",
  "No EHR writeback, payer submission, patient outreach, or billing submission",
  "No competitor proprietary copying, scraping, reverse engineering, or brand imitation",
  "No certification, customer go-live, reimbursement, revenue, valuation, or security assurance claim"
];

const sourceAudienceBySlug: Record<string, string> = {
  "proof-before-pilot-command": "hospital executives, MSOs, faith-based clinics, and investor reviewers",
  "trust-center-as-sales-asset": "enterprise security reviewers, compliance teams, procurement, and legal reviewers",
  "connector-trust-catalog": "implementation sponsors, interoperability partners, health IT leaders, and CTOs",
  "payer-policy-evidence-loop": "revenue-cycle leaders, payer operations, prior-auth teams, and appeals reviewers",
  "imaging-to-action-without-interpretation": "radiology operations, referral coordinators, service-line leaders, and safety reviewers",
  "audience-specific-revenue-packaging": "founder-led sales, channel partners, investors, clinics, and buyer champions"
};

const productSystemBySlug: Record<string, string> = {
  "proof-before-pilot-command": "Investor Command, Pilot Demo Commercial Readiness, Proof Packet Studio",
  "trust-center-as-sales-asset": "Trust Center, Cyber Defense, Security Diligence Evidence",
  "connector-trust-catalog": "Clinical Data Fabric, Interoperability, Patient Context Gateway",
  "payer-policy-evidence-loop": "Documentation-Before-Authorization, RCM, Prior Authorization",
  "imaging-to-action-without-interpretation": "Imaging workflow readiness, Referral Intelligence, Clinical Safety Queue",
  "audience-specific-revenue-packaging": "Offerings, Pricing, Guided Execution, Sales Operations"
};

const publicRelationsPositionBySlug: Record<string, string> = {
  "proof-before-pilot-command":
    "SCRIMED can publicly emphasize proof-before-risk: buyers see governance, evidence, and synthetic workflow value before production authority.",
  "trust-center-as-sales-asset":
    "SCRIMED can speak plainly about security readiness, evidence organization, and review workflows while avoiding certification claims.",
  "connector-trust-catalog":
    "SCRIMED can position interoperability as governed readiness and conformance preparation, not live connector approval.",
  "payer-policy-evidence-loop":
    "SCRIMED can highlight documentation completeness and policy-risk visibility without promising reimbursement or submitting payer packets.",
  "imaging-to-action-without-interpretation":
    "SCRIMED can describe imaging operations coordination and follow-up workflow support without claiming final medical interpretation.",
  "audience-specific-revenue-packaging":
    "SCRIMED can make every audience path concrete: problem, proof route, offer, next action, and retained boundary."
};

function executionHash(slug: string, stage: ScrimedMarketExecutionStage) {
  return generateScrimedAuditHash({
    slug,
    stage,
    policyVersion: scrimedSafetyPolicyVersion,
    boundary: scrimedMarketExecutionBoundary
  });
}

export const scrimedMarketExecutionScorecard: ScrimedMarketExecutionScorecard = {
  marketSignalFreshness: 88,
  cleanRoomDiscipline: 96,
  buyerConversionReadiness: 89,
  revenueActivationReadiness: 86,
  investorNarrativeReadiness: 90,
  privacyTrustReadiness: 91,
  publicRelationsReadiness: 84,
  productionReadiness: false
};

export const scrimedMarketExecutionRiskControls: ScrimedMarketExecutionRiskControl[] = [
  {
    id: "clean-room-source-discipline",
    control: "Only public source patterns may enter SCRIMED strategy, and every translation must become original SCRIMED language.",
    reason: "Protects SCRIMED from proprietary copying, brand confusion, and trade-secret contamination.",
    enforcement: "Contract check blocks forbidden claims and requires legal extraction language.",
    owner: "Strategy + Legal Review"
  },
  {
    id: "proof-before-claim",
    control: "Sales, investor, and PR messages must point to SCRIMED proof routes or explicitly state readiness-only scope.",
    reason: "Raises investor and buyer confidence without making unsupported certification, ROI, validation, or go-live claims.",
    enforcement: "Market execution lanes bind each message to a proof artifact and retained boundary.",
    owner: "Founder + Product Marketing"
  },
  {
    id: "human-review-for-sensitive-actions",
    control: "Any clinical, payer, legal, finance, security, or external communication motion requires human review.",
    reason: "Keeps SCRIMED's current posture as governed decision support and business readiness.",
    enforcement: "Every lane has humanReviewRequired=true and blocked action coverage.",
    owner: "Trust Safety + Operations"
  },
  {
    id: "privacy-first-market-motion",
    control: "No route may request or display PHI, live patient data, secrets, raw connector payloads, or competitor private material.",
    reason: "Preserves synthetic/no-PHI buyer proof and diligence posture.",
    enforcement: "Safety headers, smoke coverage, and documentation boundaries.",
    owner: "Security + Compliance"
  }
];

export const scrimedMarketExecutionLanes: ScrimedMarketExecutionLane[] = cleanRoomCompetitivePlays.map((play) => {
  const stage: ScrimedMarketExecutionStage =
    play.priority === "immediate"
      ? "revenue_activation"
      : play.priority === "near-term"
        ? "buyer_packaging"
        : "investor_narrative";

  return {
    slug: play.slug,
    priority: play.priority,
    sourcePattern: play.marketPattern,
    publicSources: play.publicSources,
    productSystem: productSystemBySlug[play.slug] ?? play.productSystemsToUpgrade.join(", "),
    targetAudience: sourceAudienceBySlug[play.slug] ?? "healthcare buyer, investor, reviewer, or implementation sponsor",
    salesMotion: play.salesPitchUpgrade,
    revenueLever: play.revenueMotion,
    investorNarrative: play.investorConfidenceSignal,
    privacyLegalControl: play.privacyAndTrustControl,
    publicRelationsPosition:
      publicRelationsPositionBySlug[play.slug] ??
      "SCRIMED can communicate governed healthcare intelligence readiness with clear retained boundaries.",
    proofArtifact: play.proofMetric,
    implementationSprint: play.nextBuildAction,
    stage,
    humanReviewRequired: true,
    blockedActions,
    retainedBoundary: play.retainedBoundary,
    auditHash: executionHash(play.slug, stage)
  };
});

export function getScrimedMarketExecutionSummary() {
  const immediateLanes = scrimedMarketExecutionLanes.filter((lane) => lane.priority === "immediate");
  const nearTermLanes = scrimedMarketExecutionLanes.filter((lane) => lane.priority === "near-term");
  const strategicLanes = scrimedMarketExecutionLanes.filter((lane) => lane.priority === "strategic");
  const proofArtifacts = Array.from(new Set(scrimedMarketExecutionLanes.map((lane) => lane.proofArtifact)));
  const productSystems = Array.from(new Set(scrimedMarketExecutionLanes.map((lane) => lane.productSystem)));
  const publicSources = Array.from(new Set(scrimedMarketExecutionLanes.flatMap((lane) => lane.publicSources)));

  return {
    service: "scrimed-market-execution",
    status: scrimedMarketExecutionStatus,
    apiRoute: scrimedMarketExecutionApiRoute,
    briefRoute: scrimedMarketExecutionBriefRoute,
    pageRoute: scrimedMarketExecutionPageRoute,
    boundary: scrimedMarketExecutionBoundary,
    competitiveBoundary: competitiveMarketIntelligenceBoundary,
    accelerationBoundary: scrimedEnterpriseAccelerationBoundary,
    scorecard: scrimedMarketExecutionScorecard,
    lanes: scrimedMarketExecutionLanes,
    riskControls: scrimedMarketExecutionRiskControls,
    competitorSignalCount: competitiveResearchSignals.length,
    cleanRoomPlayCount: cleanRoomCompetitivePlays.length,
    immediateLaneCount: immediateLanes.length,
    nearTermLaneCount: nearTermLanes.length,
    strategicLaneCount: strategicLanes.length,
    proofArtifacts,
    productSystems,
    publicSources,
    revenueMotions: scrimedRevenueMotions,
    pitchAssets: scrimedPitchAssets,
    blockedActions,
    recommendedNextBuildStep:
      "Use the Market Execution Engine as the source of truth for buyer demo scripts, investor pitch proof routes, privacy-safe PR language, and revenue motion prioritization.",
    productionReadiness: false,
    noPhiConfirmed: true,
    humanReviewRequired: true
  };
}

export function buildScrimedMarketExecutionBrief() {
  const summary = getScrimedMarketExecutionSummary();

  return [
    "# SCRIMED Market Execution Engine",
    "",
    summary.boundary,
    "",
    "## Scorecard",
    `- Market signal freshness: ${summary.scorecard.marketSignalFreshness}`,
    `- Clean-room discipline: ${summary.scorecard.cleanRoomDiscipline}`,
    `- Buyer conversion readiness: ${summary.scorecard.buyerConversionReadiness}`,
    `- Revenue activation readiness: ${summary.scorecard.revenueActivationReadiness}`,
    `- Investor narrative readiness: ${summary.scorecard.investorNarrativeReadiness}`,
    `- Privacy trust readiness: ${summary.scorecard.privacyTrustReadiness}`,
    `- Public relations readiness: ${summary.scorecard.publicRelationsReadiness}`,
    `- Production readiness: ${summary.scorecard.productionReadiness}`,
    "",
    "## Execution Lanes",
    ...summary.lanes.map(
      (lane) =>
        `- ${lane.slug}: priority=${lane.priority}; audience=${lane.targetAudience}; proof=${lane.proofArtifact}; next=${lane.implementationSprint}`
    ),
    "",
    "## Risk Controls",
    ...summary.riskControls.map((control) => `- ${control.control}: ${control.enforcement}`),
    "",
    "## Blocked Actions",
    ...summary.blockedActions.map((action) => `- ${action}`),
    "",
    "## Next Build Step",
    summary.recommendedNextBuildStep,
    "",
    "This is synthetic/business-metadata execution support only. It does not authorize PHI, autonomous clinical care, payer submission, EHR writeback, certification claims, production connector approval, customer go-live, or competitor proprietary copying."
  ].join("\n");
}
