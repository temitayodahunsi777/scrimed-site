import { getCapitalVitalitySummary } from "./capitalVitality";
import { getCommercialStrategySummary } from "./commercialStrategy";
import { getMarketActivationSummary } from "./marketActivation";
import { getPublicMarketReadinessSummary } from "./publicMarketReadiness";
import { getSalesDealRoomSummary } from "./salesDealRoom";

export type GrowthPlayStatus =
  | "execute-now"
  | "package-next"
  | "protected-gated"
  | "external-review-required";

export type GrowthPlay = {
  name: string;
  status: GrowthPlayStatus;
  buyerSegment: string;
  primaryOffer: string;
  revenueMotion: string;
  commercialEvidence: string;
  proofRoutes: string[];
  owner: string;
  blockedBoundary: string;
  nextAction: string;
};

export type ConversionLane = {
  source: string;
  buyerTrigger: string;
  entryRoute: string;
  proofRoute: string;
  conversionEvent: string;
  followUp: string;
  disqualifiers: string[];
};

export type RevenueProofStep = {
  stage: string;
  commercialQuestion: string;
  answer: string;
  metric: string;
  proofRoutes: string[];
  status: "ready" | "measurement-required" | "protected-gated" | "external-review-required";
  retainedGate: string;
};

export type GrowthBottleneck = {
  name: string;
  status: "contained" | "operator-required" | "protected-gated" | "external-review-required";
  impact: string;
  workaround: string;
  graduationGate: string;
  owner: string;
};

export const growthEngineRoute = "/growth-engine";
export const growthEngineApiRoute = "/api/growth-engine";
export const growthEngineBriefRoute = "/api/growth-engine/brief";
export const growthEngineProofStackStatus = "commercial-growth-engine-active";
export const growthEngineBriefProofStackStatus =
  "commercial-growth-engine-brief-ready-no-revenue-guarantee";
export const growthEngineUpdatedAt = "2026-06-24";

export const growthEngineBoundary =
  "SCRIMED Commercial Growth Engine organizes buyer segments, sellable offers, revenue motions, proof routes, conversion actions, bottlenecks, and retained approval gates for synthetic evaluations, readiness assessments, and protected enterprise pilots. It is growth execution readiness only. It is not a customer revenue guarantee, investment advice, securities offering material, audited financial reporting, valuation assurance, legal advice, tax advice, reimbursement assurance, procurement approval, customer permission, security certification, regulatory approval, PHI processing approval, production connector approval, or live clinical care authorization.";

export const growthPlays: GrowthPlay[] = [
  {
    name: "Founder-led assessment sprint",
    status: "execute-now",
    buyerSegment: "Health system operations, access, documentation, transformation, and revenue-cycle leaders",
    primaryOffer: "Workflow Intelligence Assessment",
    revenueMotion:
      "Convert warm executive conversations into paid fixed-scope assessments with one to three workflow targets.",
    commercialEvidence:
      "Pricing, market activation, product console, demos, pilot intake, and sales operations already support this motion.",
    proofRoutes: ["/pricing", "/product", "/demos", "/pilot", "/sales-operations"],
    owner: "Founder + enterprise sales",
    blockedBoundary: "No PHI, no live clinical execution, no savings guarantee, and no medical advice.",
    nextAction:
      "Run a weekly sponsor list, route qualified buyers to Pilot Intake, and package each call around one workflow pain plus one proof route."
  },
  {
    name: "Synthetic Atlas pilot pipeline",
    status: "execute-now",
    buyerSegment: "Enterprise sponsors ready to test governed workflow intelligence before integration",
    primaryOffer: "Synthetic Pilot Evaluation",
    revenueMotion:
      "Move qualified assessment or demo interest into a 45 to 90 day synthetic pilot with success metrics and proof packets.",
    commercialEvidence:
      "Capital Vitality, Pilot Programs, Pilot Deal Room, and AgentOS evaluation make the synthetic pilot inspectable.",
    proofRoutes: ["/capital-vitality", "/pilots", "/pilot-deal-room", "/evaluation"],
    owner: "Founder + sales engineering",
    blockedBoundary: "Synthetic-only evidence until buyer-specific approvals, security review, and governance gates are retained.",
    nextAction:
      "Use the Deal Room to frame pilot scope, review team, synthetic packet, decision metric, and protected workspace path."
  },
  {
    name: "AI governance audit wedge",
    status: "package-next",
    buyerSegment: "Compliance, legal, privacy, security, clinical governance, and innovation leaders",
    primaryOffer: "AI Readiness + Governance Audit",
    revenueMotion:
      "Sell governance readiness as a paid entry point for teams under pressure to control healthcare AI adoption.",
    commercialEvidence:
      "Approvals Readiness, Boundary Resolution, Claim Guard, Trust Center, and Service Reliability show operating discipline.",
    proofRoutes: ["/approvals-readiness", "/boundary-resolution", "/qa-claim-guard", "/trust-center"],
    owner: "Founder + trust operations",
    blockedBoundary:
      "Readiness audit is not HIPAA certification, SOC 2 certification, HITRUST certification, legal approval, or FDA clearance.",
    nextAction:
      "Create counsel-reviewable sales language and keep every certification or regulatory phrase behind external-review gates."
  },
  {
    name: "Protected buyer diligence upgrade",
    status: "protected-gated",
    buyerSegment: "Procurement, security, investor diligence, and executive buying committees",
    primaryOffer: "Protected Buyer Diligence Room",
    revenueMotion:
      "Attach paid diligence packaging to enterprise pilot pursuits once buyer-specific evidence needs are known.",
    commercialEvidence:
      "Buyer Release Control Runbook, protected workspace, evidence-room routing, and distribution lockbox readiness exist.",
    proofRoutes: ["/buyer-release-control-run", "/pilot-workspace/access", "/pilot-deal-room"],
    owner: "Buyer diligence + release steward",
    blockedBoundary:
      "External sharing stays blocked until release decisions, reviewer signoffs, recipient controls, access logs, and customer permission are retained.",
    nextAction:
      "Keep diligence packaging metadata-only until buyer-approved storage, access review, DLP, retention, and legal hold controls exist."
  },
  {
    name: "Public-sector and global partner program",
    status: "external-review-required",
    buyerSegment: "Government health systems, sovereign programs, public-sector buyers, and qualified channel partners",
    primaryOffer: "Strategic Platform Partnership",
    revenueMotion:
      "Use global buyer packs and deployment profiles to scope strategic programs before procurement or regional claims expand.",
    commercialEvidence:
      "Global Reach, Deployment Profiles, Market Activation, and Public Market Readiness encode the strategic partnership path.",
    proofRoutes: ["/global-reach", "/deployment-profiles", "/market-activation", "/public-market-readiness"],
    owner: "Founder + strategic partnerships + qualified reviewers",
    blockedBoundary:
      "No regional legal approval, public-sector procurement approval, data-residency approval, or government endorsement claim.",
    nextAction:
      "Pair every regional or public-sector conversation with qualified legal, privacy, security, procurement, and deployment review."
  },
  {
    name: "Revenue-cycle proof wedge",
    status: "package-next",
    buyerSegment: "Payer, provider, and revenue-cycle leaders with denial, authorization, and documentation friction",
    primaryOffer: "Revenue workflow synthetic pilot",
    revenueMotion:
      "Position denial-risk, missing-evidence, and policy-friction workflows as measurable synthetic pilots before buyer data exposure.",
    commercialEvidence:
      "Public Market KPI definitions, workflow result packets, pricing value metrics, and Atlas evidence routes support the wedge.",
    proofRoutes: ["/public-market-readiness", "/workflows/results", "/pricing", "/atlas"],
    owner: "Founder + product + sales engineering",
    blockedBoundary:
      "No final billing action, no payer submission, no reimbursement guarantee, and no audited financial impact claim.",
    nextAction:
      "Package a no-PHI demonstration around one denial or prior-authorization support workflow and one buyer-approved value metric."
  }
];

export const conversionLanes: ConversionLane[] = [
  {
    source: "Founder network and direct executive outreach",
    buyerTrigger: "Visible operational pain, AI governance pressure, or transformation mandate",
    entryRoute: "/product",
    proofRoute: "/pilot-deal-room",
    conversionEvent: "Pilot Intake submitted with named sponsor and workflow scope",
    followUp: "Route to Sales Operations and schedule assessment or synthetic-pilot scoping.",
    disqualifiers: ["Requires PHI in first call", "Wants autonomous clinical decisions", "No executive or operational sponsor"]
  },
  {
    source: "Product-led proof review",
    buyerTrigger: "Buyer inspects demos, pricing, Trust Center, and proof routes before contacting SCRIMED",
    entryRoute: "/demos",
    proofRoute: "/pricing",
    conversionEvent: "Buyer asks for pilot pricing, workflow evidence, or governance packet",
    followUp: "Send assessment/pilot framing with no-PHI boundary and buyer-specific questions.",
    disqualifiers: ["Requests unsupported compliance claims", "Needs immediate production connector"]
  },
  {
    source: "Governance and security review",
    buyerTrigger: "AI risk, vendor diligence, BAA/DPA planning, claims control, or board scrutiny",
    entryRoute: "/trust-center",
    proofRoute: "/approvals-readiness",
    conversionEvent: "Buyer asks for governance audit, evidence room, or protected pilot controls",
    followUp: "Offer AI Readiness + Governance Audit and map required external-review domains.",
    disqualifiers: ["Wants certification without external audit", "Rejects human-review or no-PHI boundaries"]
  },
  {
    source: "Investor, board, and advisor diligence",
    buyerTrigger: "Category, moat, unit economics, customer proof, or growth strategy review",
    entryRoute: "/capital-vitality",
    proofRoute: "/growth-engine",
    conversionEvent: "Reviewer asks for operating cadence, proof ladder, or commercial priorities",
    followUp: "Share readiness-only brief and route securities, valuation, legal, or tax questions to qualified advisors.",
    disqualifiers: ["Requests investment advice", "Requests fundraising materials without counsel review"]
  }
];

export const revenueProofLadder: RevenueProofStep[] = [
  {
    stage: "Public proof",
    commercialQuestion: "Can the buyer understand what SCRIMED is and why it is different?",
    answer: "Use Product Console, Healthcare Intelligence OS, demos, Trust Center, and Capital Vitality.",
    metric: "Qualified buyer moves to intake or executive review.",
    proofRoutes: ["/product", "/healthcare-intelligence-os", "/demos", "/trust-center", "/capital-vitality"],
    status: "ready",
    retainedGate: "No public customer, clinical, revenue, securities, or certification overclaim."
  },
  {
    stage: "Paid assessment",
    commercialQuestion: "Can SCRIMED sell a bounded first engagement without live data exposure?",
    answer: "Use Workflow Intelligence Assessment with no-PHI scope, buyer baseline questions, and governance review.",
    metric: "Assessment sponsor, workflow scope, and decision criteria retained.",
    proofRoutes: ["/pricing", "/pilot", "/sales-operations"],
    status: "ready",
    retainedGate: "No PHI, no medical advice, no guaranteed savings."
  },
  {
    stage: "Synthetic pilot",
    commercialQuestion: "Can SCRIMED prove workflow value through governed synthetic evidence?",
    answer: "Use Synthetic Atlas Pilot, AgentOS evaluation, workflow results, QA proof, and Deal Room packaging.",
    metric: "Synthetic work packet complete with reviewable outcome, Trust Card, and buyer decision route.",
    proofRoutes: ["/pilots", "/evaluation", "/workflows/results", "/qa-evidence", "/pilot-deal-room"],
    status: "measurement-required",
    retainedGate: "Buyer-approved metrics before external value claims."
  },
  {
    stage: "Protected enterprise pilot",
    commercialQuestion: "Can the buyer safely move from synthetic proof into controlled protected evaluation?",
    answer:
      "Use protected workspace, release-control chain, authority readiness, provider security review, and procurement evidence routing.",
    metric: "Protected workspace and no-PHI packet controls active with retained AAL2 operator proof.",
    proofRoutes: ["/pilot-workspace/access", "/buyer-release-control-run", "/clinical-authority-readiness"],
    status: "protected-gated",
    retainedGate: "AAL2, external approvals, buyer permission, legal/privacy/security gates, and no-PHI evidence rules."
  },
  {
    stage: "Enterprise license",
    commercialQuestion: "Can SCRIMED expand into annual operating value after protected validation?",
    answer: "Use deployment profiles, public-market KPI discipline, finance methodology gates, and board scorecards.",
    metric: "Buyer-approved operating value, security posture, implementation scope, and license owner.",
    proofRoutes: ["/deployment-profiles", "/public-market-readiness", "/pilot-workspace/access"],
    status: "external-review-required",
    retainedGate: "Customer contracts, security review, legal approval, connector approval, and production authority."
  }
];

export const growthBottlenecks: GrowthBottleneck[] = [
  {
    name: "Founder-led selling is still the fastest path",
    status: "operator-required",
    impact: "SCRIMED has proof depth, but early enterprise conversion still needs direct founder narrative and qualification.",
    workaround: "Run weekly target-account review, use Pilot Intake for every qualified call, and keep proof routes attached to each follow-up.",
    graduationGate: "Repeatable source-to-pilot conversion cohorts in Attribution Analytics.",
    owner: "Founder + sales operations"
  },
  {
    name: "Buyer proof cannot outrun retained approvals",
    status: "protected-gated",
    impact: "The strongest enterprise proof is protected and cannot be shared publicly without release controls.",
    workaround:
      "Use metadata-only public summaries and route buyer-specific artifacts through protected release-control and distribution lockbox gates.",
    graduationGate: "Release decisions, reviewer signoffs, recipient controls, and customer permission retained.",
    owner: "Release steward + buyer diligence"
  },
  {
    name: "Revenue impact claims require buyer baselines",
    status: "contained",
    impact: "Revenue-cycle value is compelling, but unsupported revenue claims can create legal, reimbursement, or investor risk.",
    workaround:
      "Frame revenue impact as buyer-reviewed operational signal until protected buyer methodology and finance review exist.",
    graduationGate: "Buyer-approved baseline, finance methodology gate, and counsel-reviewed external-use language.",
    owner: "Founder + finance reviewers"
  },
  {
    name: "Fundraising and investor materials need counsel review",
    status: "external-review-required",
    impact: "Capital readiness can be mistaken for offering material or investment advice.",
    workaround:
      "Keep public routes readiness-only and route fundraising decks, valuation, securities language, tax, and legal questions through qualified counsel.",
    graduationGate: "Approved investor materials, controlled data-room process, and qualified securities counsel review.",
    owner: "Founder + qualified counsel"
  }
];

function unique(values: string[]) {
  return Array.from(new Set(values));
}

export function getGrowthEngineSummary() {
  const capitalVitalitySummary = getCapitalVitalitySummary();
  const commercialStrategySummary = getCommercialStrategySummary();
  const marketActivationSummary = getMarketActivationSummary();
  const publicMarketReadinessSummary = getPublicMarketReadinessSummary();
  const salesDealRoomSummary = getSalesDealRoomSummary();
  const allProofRoutes = unique([
    ...growthPlays.flatMap((play) => play.proofRoutes),
    ...conversionLanes.flatMap((lane) => [lane.entryRoute, lane.proofRoute]),
    ...revenueProofLadder.flatMap((step) => step.proofRoutes)
  ]);

  return {
    service: "scrimed-commercial-growth-engine",
    route: growthEngineRoute,
    apiRoute: growthEngineApiRoute,
    briefRoute: growthEngineBriefRoute,
    status: growthEngineProofStackStatus,
    briefStatus: growthEngineBriefProofStackStatus,
    boundary: growthEngineBoundary,
    growthPlayCount: growthPlays.length,
    executeNowPlayCount: growthPlays.filter((play) => play.status === "execute-now").length,
    packageNextPlayCount: growthPlays.filter((play) => play.status === "package-next").length,
    protectedGatedPlayCount: growthPlays.filter((play) => play.status === "protected-gated").length,
    externalReviewPlayCount: growthPlays.filter((play) => play.status === "external-review-required").length,
    conversionLaneCount: conversionLanes.length,
    proofLadderStepCount: revenueProofLadder.length,
    growthBottleneckCount: growthBottlenecks.length,
    operatorRequiredBottleneckCount: growthBottlenecks.filter(
      (bottleneck) => bottleneck.status === "operator-required"
    ).length,
    protectedGatedBottleneckCount: growthBottlenecks.filter(
      (bottleneck) => bottleneck.status === "protected-gated"
    ).length,
    externalReviewBottleneckCount: growthBottlenecks.filter(
      (bottleneck) => bottleneck.status === "external-review-required"
    ).length,
    proofRouteCount: allProofRoutes.length,
    allProofRoutes,
    sourceCounts: {
      pricingTierCount: commercialStrategySummary.pricingTiers.length,
      salesMotionStepCount: commercialStrategySummary.salesMotion.length,
      valueMetricCount: commercialStrategySummary.valueMetrics.length,
      revenueStreamCount: marketActivationSummary.revenueStreamCount,
      targetAudienceCount: marketActivationSummary.targetAudienceCount,
      capitalRevenueCapabilityCount: capitalVitalitySummary.revenueCapabilityCount,
      moatSignalCount: capitalVitalitySummary.moatSignalCount,
      investorMilestoneCount: capitalVitalitySummary.investorMilestoneCount,
      fundingWorkstreamCount: capitalVitalitySummary.fundingWorkstreamCount,
      publicMarketMetricCount: publicMarketReadinessSummary.metricCount,
      publicMarketCustomerProofStageCount: publicMarketReadinessSummary.customerProofStageCount,
      dealRoomStageCount: salesDealRoomSummary.stages.length
    },
    authority: {
      dataBoundary: "synthetic-only",
      revenueAuthority: "not-revenue-guarantee",
      investmentAdvice: "not-investment-advice",
      securitiesAuthority: "not-securities-offering-material",
      financialAuthority: "not-audited-financial-report",
      valuationAuthority: "not-valuation-assurance",
      approvalAuthority: "external-review-required",
      phiAuthority: "not-authorized-production-phi",
      clinicalCareAuthority: "not-authorized-live-care",
      securityCertification: "not-security-certified"
    },
    nextGrowthMove:
      "Run founder-led assessment and synthetic-pilot outreach from /growth-engine, attach each conversation to one proof route, keep buyer-specific evidence protected, and route revenue, securities, legal, tax, valuation, reimbursement, PHI, security, connector, and live-care claims through retained external gates.",
    growthPlays,
    conversionLanes,
    revenueProofLadder,
    growthBottlenecks,
    capitalVitalitySummary,
    marketActivationSummary,
    commercialStrategySummary,
    publicMarketReadinessSummary,
    salesDealRoomSummary,
    updated: growthEngineUpdatedAt
  };
}

export function buildGrowthEngineBrief() {
  const summary = getGrowthEngineSummary();

  return [
    "# SCRIMED Commercial Growth Engine Brief",
    "",
    `Status: ${summary.status}`,
    `Growth plays: ${summary.growthPlayCount}`,
    `Execute-now plays: ${summary.executeNowPlayCount}`,
    `Conversion lanes: ${summary.conversionLaneCount}`,
    `Revenue proof steps: ${summary.proofLadderStepCount}`,
    `Growth bottlenecks: ${summary.growthBottleneckCount}`,
    `Proof routes: ${summary.proofRouteCount}`,
    `Revenue authority: ${summary.authority.revenueAuthority}`,
    `Securities authority: ${summary.authority.securitiesAuthority}`,
    `Investment advice: ${summary.authority.investmentAdvice}`,
    `PHI authority: ${summary.authority.phiAuthority}`,
    `Clinical care authority: ${summary.authority.clinicalCareAuthority}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "This brief is not a revenue guarantee, investment advice, securities offering material, audited financial report, valuation assurance, legal advice, tax advice, reimbursement assurance, procurement approval, customer permission, security certification, regulatory approval, PHI processing approval, production connector approval, or live clinical care authorization.",
    "",
    "## Growth Plays",
    ...summary.growthPlays.map(
      (play) =>
        `- ${play.name} (${play.status}): ${play.primaryOffer} for ${play.buyerSegment}. Next: ${play.nextAction} Boundary: ${play.blockedBoundary}`
    ),
    "",
    "## Conversion Lanes",
    ...summary.conversionLanes.map(
      (lane) =>
        `- ${lane.source}: ${lane.buyerTrigger}. Entry: ${lane.entryRoute}. Proof: ${lane.proofRoute}. Conversion: ${lane.conversionEvent}.`
    ),
    "",
    "## Revenue Proof Ladder",
    ...summary.revenueProofLadder.map(
      (step) =>
        `- ${step.stage} (${step.status}): ${step.commercialQuestion} Metric: ${step.metric}. Gate: ${step.retainedGate}`
    ),
    "",
    "## Bottlenecks",
    ...summary.growthBottlenecks.map(
      (bottleneck) =>
        `- ${bottleneck.name} (${bottleneck.status}): ${bottleneck.impact} Workaround: ${bottleneck.workaround} Gate: ${bottleneck.graduationGate}`
    ),
    "",
    "## Next Growth Move",
    summary.nextGrowthMove
  ].join("\n");
}
