import { getCommercialStrategySummary } from "./commercialStrategy";
import { getMarketActivationSummary } from "./marketActivation";
import { getNavigationAuditSummary } from "./navigationAudit";
import { getPublicMarketReadinessSummary } from "./publicMarketReadiness";
import { getSalesDealRoomSummary } from "./salesDealRoom";
import { getServiceReliabilitySummary } from "./serviceReliability";

export type RevenueCapabilityStatus =
  | "active"
  | "packaged"
  | "protected-gated"
  | "external-review-required";

export type RevenueCapability = {
  name: string;
  buyer: string;
  status: RevenueCapabilityStatus;
  revenueMotion: string;
  priceLogic: string;
  proofRoutes: string[];
  limitation: string;
  nextAction: string;
};

export type CompetitiveMoatSignal = {
  name: string;
  strength: "high" | "medium" | "watch";
  evidence: string;
  proofRoutes: string[];
  defendability: string;
  retainedBoundary: string;
};

export type InvestorReadinessMilestone = {
  name: string;
  status: "ready" | "in-progress" | "operator-required" | "external-review-required";
  investorQuestion: string;
  evidence: string;
  proofRoutes: string[];
  fundingImpact: string;
  retainedBoundary: string;
};

export type FundingVitalityWorkstream = {
  name: string;
  owner: string;
  status: "active" | "packaged" | "operator-required" | "external-review-required";
  capability: string;
  proof: string;
  limitation: string;
  nextAction: string;
};

export const capitalVitalityRoute = "/capital-vitality";
export const capitalVitalityApiRoute = "/api/capital-vitality";
export const capitalVitalityBriefRoute = "/api/capital-vitality/brief";
export const capitalVitalityProofStackStatus =
  "capital-vitality-revenue-funding-readiness-active";
export const capitalVitalityBriefProofStackStatus =
  "capital-vitality-brief-ready-no-securities-offer";
export const capitalVitalityUpdatedAt = "2026-06-24";

export const capitalVitalityBoundary =
  "SCRIMED Capital Vitality organizes revenue capabilities, competitive moat evidence, investor-readiness milestones, funding workstreams, and retained external-review gates. It strengthens commercial execution and diligence readiness, but it is not investment advice, securities offering material, audited financial reporting, valuation assurance, legal advice, tax advice, reimbursement assurance, customer revenue guarantee, security certification, regulatory approval, PHI processing approval, production connector approval, or live clinical care authorization.";

export const revenueCapabilities: RevenueCapability[] = [
  {
    name: "Synthetic Atlas Pilot",
    buyer: "Health systems, payers, public-sector health teams, and enterprise innovation sponsors",
    status: "packaged",
    revenueMotion: "30 to 90 day governed synthetic pilot with executive findings and production-readiness gates.",
    priceLogic:
      "Packaged as a premium fixed-fee pilot before any protected enterprise or production-license commitment.",
    proofRoutes: ["/product", "/pilot-deal-room", "/pilots", "/pricing"],
    limitation:
      "Pilot evidence remains synthetic or protected-evaluation only until buyer-specific live controls are approved.",
    nextAction: "Use the Deal Room and Pilot Intake to qualify sponsor, workflow scope, review team, and success metrics."
  },
  {
    name: "Workflow Intelligence Assessment",
    buyer: "Clinical operations, access, revenue cycle, documentation, and transformation leaders",
    status: "active",
    revenueMotion:
      "Short paid assessment that maps workflow friction, AI readiness, governance gaps, and pilot candidates.",
    priceLogic: "Fixed-scope assessment with clear upgrade path into Synthetic Atlas Pilot.",
    proofRoutes: ["/pricing", "/product", "/pilot", "/sales-operations"],
    limitation:
      "Findings are operational intelligence for human leaders, not medical, legal, reimbursement, or accounting advice.",
    nextAction: "Keep assessment outputs tied to proof routes, governance gates, and buyer-approved baselines."
  },
  {
    name: "AI Readiness + Governance Audit",
    buyer: "Compliance, security, legal, clinical governance, innovation, and executive sponsors",
    status: "packaged",
    revenueMotion:
      "Readiness engagement for claims control, privacy posture, auditability, role controls, runtime safety, and approval gates.",
    priceLogic: "Assessment fee that can expand into protected pilot controls and enterprise diligence work.",
    proofRoutes: ["/approvals-readiness", "/boundary-resolution", "/clinical-authority-readiness", "/trust-center"],
    limitation:
      "Readiness audit does not certify HIPAA, SOC 2, HITRUST, FDA, ONC, security posture, or legal compliance.",
    nextAction: "Route any certification, regulatory, or legal claim through qualified external reviewers."
  },
  {
    name: "Clinical Operations Automation Blueprint",
    buyer: "Hospitals, clinics, payers, and public-sector health programs planning phased automation",
    status: "packaged",
    revenueMotion:
      "Blueprint package for agent responsibilities, connector plan, review queues, safety controls, and staged deployment path.",
    priceLogic: "Strategy and implementation-planning package that precedes protected pilot or enterprise license.",
    proofRoutes: ["/agents", "/workflows", "/healthcare-intelligence-os", "/interoperability"],
    limitation:
      "Blueprint remains review-only and does not authorize live clinical workflow execution or production connectors.",
    nextAction: "Translate each automation candidate into blocked actions, human checkpoints, and audit evidence."
  },
  {
    name: "Protected Buyer Diligence Rooms",
    buyer: "Enterprise buyers, procurement, security reviewers, investor diligence teams, and executive sponsors",
    status: "protected-gated",
    revenueMotion:
      "Paid buyer-specific diligence packaging with proof packets, release controls, and metadata-only evidence routing.",
    priceLogic:
      "Bundled into enterprise pilot/procurement motion; future premium service when release authority is retained.",
    proofRoutes: ["/pilot-workspace/access", "/buyer-release-control-run", "/pilot-deal-room"],
    limitation:
      "External sharing remains blocked until release decisions, reviewer signoffs, recipient controls, and access-log reconciliation are retained.",
    nextAction: "Complete the protected release-control chain before any buyer-specific external distribution."
  },
  {
    name: "TrustOps Incident And Claims Control",
    buyer: "Enterprise risk, legal, security, marketing, buyer diligence, and operator teams",
    status: "active",
    revenueMotion:
      "Trust, safety, claims, and incident-readiness support for enterprise AI operations and buyer confidence.",
    priceLogic: "Packaged as governance support attached to pilots and enterprise readiness work.",
    proofRoutes: ["/trust-safety-operations", "/qa-claim-guard", "/claims", "/trust-center"],
    limitation:
      "Operating model does not create managed 24/7 coverage, legal approval, public-claim approval, or certification by itself.",
    nextAction: "Keep buyer, investor, PR, advertising, and operator claims routed through Claim Guard before publication."
  },
  {
    name: "Deployment Profile Advisory",
    buyer: "Security-sensitive hospitals, governments, sovereign programs, and infrastructure partners",
    status: "external-review-required",
    revenueMotion:
      "Advisory package for managed cloud, private cloud, hospital-controlled, sovereign, and edge deployment readiness.",
    priceLogic: "Premium planning motion that can expand into strategic platform partnership after legal/security review.",
    proofRoutes: ["/deployment-profiles", "/global-reach", "/market-activation", "/interoperability"],
    limitation:
      "Deployment profiles do not grant regional approval, data-residency approval, security certification, or procurement acceptance.",
    nextAction: "Attach qualified regional legal, privacy, security, and procurement review before external claims expand."
  },
  {
    name: "Interoperability Conformance Readiness",
    buyer: "IT, interoperability, EHR, payer, research, and device-integration reviewers",
    status: "protected-gated",
    revenueMotion:
      "Conformance-readiness engagement around standards mapping, fixtures, synthetic tests, and live connector prerequisites.",
    priceLogic: "Technical diligence package that supports pilots and future implementation scope.",
    proofRoutes: ["/interoperability", "/interoperability/evaluations", "/integrations", "/synthetic/validation"],
    limitation:
      "Synthetic conformance evidence is not live connector certification, trading-partner acceptance, or production data exchange authority.",
    nextAction: "Keep live connector claims blocked until buyer, legal, security, privacy, and partner approvals exist."
  }
];

export const competitiveMoatSignals: CompetitiveMoatSignal[] = [
  {
    name: "Healthcare Intelligence OS category position",
    strength: "high",
    evidence:
      "SCRIMED combines AgentOS, Atlas Intelligence Core, TrustOS, workflows, interoperability, and buyer diligence into one healthcare operations layer.",
    proofRoutes: ["/healthcare-intelligence-os", "/product", "/agents", "/atlas"],
    defendability:
      "The moat is domain workflow orchestration plus trust evidence, not general model access.",
    retainedBoundary: "Architecture proof is not production authorization or clinical validation."
  },
  {
    name: "TrustOS and Claim Guard discipline",
    strength: "high",
    evidence:
      "Policy evaluation, claim control, blocked authority language, and no-authority headers are embedded across high-risk routes.",
    proofRoutes: ["/trust-os", "/qa-claim-guard", "/claims", "/api/product/console"],
    defendability: "Healthcare buyers need governed explainability, boundaries, and audit posture before automation scale.",
    retainedBoundary: "Trust controls are readiness evidence, not legal advice or compliance certification."
  },
  {
    name: "Atlas evidence and Trust Cards",
    strength: "high",
    evidence:
      "Evidence routes, Trust Cards, source intelligence, and workflow result packets create inspectable support for buyer review.",
    proofRoutes: ["/atlas", "/trust", "/source-intelligence", "/workflows/results"],
    defendability: "Evidence-backed workflow outputs are harder to copy than a model wrapper.",
    retainedBoundary: "Evidence organization does not guarantee clinical outcome, reimbursement, or customer revenue."
  },
  {
    name: "Protected buyer release-control chain",
    strength: "high",
    evidence:
      "Buyer release decisions, reviewer signoffs, disabled distribution lockbox controls, recipient controls, and access-log reconciliation are staged before external sharing.",
    proofRoutes: ["/buyer-release-control-run", "/pilot-workspace/access", "/qa-buyer-proof-release"],
    defendability: "Enterprise diligence friction becomes a managed product capability.",
    retainedBoundary: "Release-control readiness is not release approval or customer permission."
  },
  {
    name: "Service Reliability fault/control map",
    strength: "medium",
    evidence:
      "Product/service controls, fault classes, efficiency improvements, open gates, and owners are inspectable before claims expand.",
    proofRoutes: ["/service-reliability", "/navigation", "/release-continuity"],
    defendability: "Operational maturity compounds as every new surface inherits route, smoke, and boundary checks.",
    retainedBoundary: "Reliability hardening is not security certification or approval authority."
  },
  {
    name: "Public route and smoke discipline",
    strength: "medium",
    evidence:
      "Navigation Audit ties page inventory, API pattern count, route groups, smoke coverage, and protected fail-closed behavior together.",
    proofRoutes: ["/navigation", "/api/navigation-audit", "/api/navigation-audit/brief"],
    defendability: "Route-count controls reduce drift as the product surface grows.",
    retainedBoundary: "Route control does not prove protected happy-path execution."
  },
  {
    name: "Public Market KPI and protected board metric ladder",
    strength: "medium",
    evidence:
      "KPI definitions, unit-economics packages, protected operator metrics, board scorecards, and finance methodology gates are mapped.",
    proofRoutes: ["/public-market-readiness", "/api/public-market-readiness", "/pilot-workspace/access"],
    defendability: "Operating metrics connect product usage, workflow value, and governance proof for diligence.",
    retainedBoundary: "KPI readiness is not audited financial reporting, valuation assurance, or securities material."
  },
  {
    name: "Interoperability-first synthetic validation",
    strength: "medium",
    evidence:
      "Standards registry, fixture validation, conformance evaluations, and synthetic workflow validation are visible before live integration.",
    proofRoutes: ["/interoperability", "/interoperability/evaluations", "/integrations/fixture-validation"],
    defendability: "Healthcare integration readiness is encoded as a repeatable evidence system.",
    retainedBoundary: "Synthetic validation does not approve live connectors or PHI ingestion."
  },
  {
    name: "Commercial packaging and sales operations linkage",
    strength: "watch",
    evidence:
      "Pricing tiers, pilot programs, Deal Room, Sales Operations, attribution, and buyer workspaces are connected.",
    proofRoutes: ["/pricing", "/pilot-deal-room", "/sales-operations", "/attribution-analytics"],
    defendability: "Revenue operations become inspectable and tied to proof instead of ad hoc founder selling.",
    retainedBoundary: "Sales packaging does not guarantee conversion, revenue, customer permission, or procurement approval."
  }
];

export const investorReadinessMilestones: InvestorReadinessMilestone[] = [
  {
    name: "Category narrative packaged",
    status: "ready",
    investorQuestion: "What is SCRIMED building that is bigger than a feature?",
    evidence: "Healthcare Intelligence OS, public product console, and public-market thesis are live.",
    proofRoutes: ["/healthcare-intelligence-os", "/product", "/public-market-readiness"],
    fundingImpact: "Improves narrative clarity and makes the company easier to diligence.",
    retainedBoundary: "Narrative is operating posture, not an investment recommendation."
  },
  {
    name: "Revenue streams mapped",
    status: "ready",
    investorQuestion: "How can SCRIMED make money before production clinical authority?",
    evidence: "Assessments, synthetic pilots, governance audits, blueprints, diligence rooms, and advisory work are packaged.",
    proofRoutes: ["/capital-vitality", "/pricing", "/market-activation"],
    fundingImpact: "Shows near-term non-PHI, synthetic, and review-only revenue paths.",
    retainedBoundary: "Revenue capability is not a sales forecast, audited result, or customer commitment."
  },
  {
    name: "Proof stack deployed",
    status: "ready",
    investorQuestion: "Is the product real, inspectable, and deployed?",
    evidence: "Homepage, Hub, Product Console, Deal Room, APIs, briefs, smoke coverage, and production deployment exist.",
    proofRoutes: ["/", "/hub", "/product", "/pilot-deal-room"],
    fundingImpact: "Reduces demo risk and gives reviewers direct inspection paths.",
    retainedBoundary: "Public proof stack does not prove protected customer production execution."
  },
  {
    name: "Unit economics framework",
    status: "in-progress",
    investorQuestion: "Can SCRIMED measure cost, margin, and value by offer?",
    evidence: "Public Market Readiness defines cost-per-workflow, gross margin by offer, protected operator metrics, and finance methodology gates.",
    proofRoutes: ["/public-market-readiness", "/pilot-workspace/access"],
    fundingImpact: "Creates the operating skeleton for future board and investor reporting.",
    retainedBoundary: "Framework is not audited financial reporting, accounting advice, tax advice, or valuation assurance."
  },
  {
    name: "Claims and approvals controls",
    status: "ready",
    investorQuestion: "Can SCRIMED grow without overclaiming regulated authority?",
    evidence: "Approvals Readiness, Boundary Resolution, Clinical Authority Readiness, and Claim Guard are active.",
    proofRoutes: ["/approvals-readiness", "/boundary-resolution", "/clinical-authority-readiness", "/qa-claim-guard"],
    fundingImpact: "Improves credibility with regulated buyers and risk-aware investors.",
    retainedBoundary: "Controls do not replace counsel, security assessors, regulators, or buyer approvers."
  },
  {
    name: "Protected AAL2 proof retained",
    status: "operator-required",
    investorQuestion: "Can SCRIMED prove authenticated protected workflows without leaking secrets?",
    evidence: "Protected Manual QA Evidence and Buyer Proof Release exist, with browser AAL2 session requirements.",
    proofRoutes: ["/qa-aal2-run-evidence", "/qa-manual-execution-console", "/pilot-workspace/access"],
    fundingImpact: "Creates a path from public demo proof into protected diligence proof.",
    retainedBoundary: "Protected happy-path proof requires approved human AAL2 operation and no token retention."
  },
  {
    name: "Funding data room sequence",
    status: "external-review-required",
    investorQuestion: "Which documents can be shared externally and under what authority?",
    evidence: "Buyer release-control chain can be repurposed as a funding-review release-control checklist.",
    proofRoutes: ["/buyer-release-control-run", "/pilot-workspace/access", "/qa-buyer-proof-release"],
    fundingImpact: "Clarifies how investor materials move through review without uncontrolled distribution.",
    retainedBoundary: "Funding materials require counsel and do not become securities offering material by default."
  },
  {
    name: "Security and compliance evidence path",
    status: "external-review-required",
    investorQuestion: "What must happen before enterprise production trust claims?",
    evidence: "Provider security review readiness, procurement evidence routing, and Approvals Readiness tracks are mapped.",
    proofRoutes: ["/approvals-readiness", "/pilot-workspace/access", "/trust-center"],
    fundingImpact: "Shows a credible path toward enterprise-grade assurance without premature claims.",
    retainedBoundary: "Security posture is not SOC 2, HITRUST, HIPAA, pentest, or BAA execution."
  }
];

export const fundingVitalityWorkstreams: FundingVitalityWorkstream[] = [
  {
    name: "Investor narrative brief",
    owner: "Founder + Product Console",
    status: "packaged",
    capability: "Use Capital Vitality brief as the top-level investor and board diligence summary.",
    proof: "/api/capital-vitality/brief",
    limitation: "Brief is not securities offering material or investment advice.",
    nextAction: "Review with counsel before using in fundraising or investor solicitation."
  },
  {
    name: "Pilot conversion proof",
    owner: "Sales operations + Buyer Diligence",
    status: "active",
    capability: "Tie Deal Room, pricing, pilot intake, sales operations, and attribution analytics into one conversion path.",
    proof: "/pilot-deal-room, /pricing, /sales-operations, /attribution-analytics",
    limitation: "Conversion proof is operating evidence, not customer revenue guarantee.",
    nextAction: "Keep every opportunity source, buyer segment, offer, and next action tagged."
  },
  {
    name: "Unit economics and board metrics",
    owner: "Finance + protected operator metrics owner",
    status: "operator-required",
    capability: "Collect no-PHI operator metrics, board scorecards, rollups, and methodology gates in protected workspaces.",
    proof: "/public-market-readiness and /pilot-workspace/access",
    limitation: "Protected metrics are not audited financial statements.",
    nextAction: "Use AAL2 protected capture for real operating metrics and preserve methodology notes."
  },
  {
    name: "Security and compliance review packet",
    owner: "Security + legal + qualified external reviewers",
    status: "external-review-required",
    capability: "Package provider security reviews, procurement evidence routing, and approval tracks.",
    proof: "/approvals-readiness and /pilot-workspace/access",
    limitation: "Readiness packet is not security certification or legal approval.",
    nextAction: "Retain qualified reviewers before enterprise assurance language expands."
  },
  {
    name: "Customer reference and public proof permission",
    owner: "Buyer Diligence + Release Steward + counsel",
    status: "external-review-required",
    capability: "Use release-control chain before any customer-specific evidence, logo, case study, or testimonial is shared.",
    proof: "/buyer-release-control-run",
    limitation: "No public customer proof is allowed without explicit approval and retained release evidence.",
    nextAction: "Keep distribution lockbox disabled until reviewer signoffs and recipient/access controls exist."
  },
  {
    name: "Offer packaging and pricing discipline",
    owner: "Enterprise sales + product",
    status: "active",
    capability: "Keep assessments, pilots, governance audits, blueprints, protected pilots, and strategic partnerships packaged.",
    proof: "/pricing",
    limitation: "Pricing is non-binding and does not imply production authority or procurement acceptance.",
    nextAction: "Use fixed scopes and clear upgrade paths to protect margin and reduce buyer ambiguity."
  },
  {
    name: "Competitive edge proof refresh",
    owner: "Founder + market activation + source intelligence",
    status: "active",
    capability: "Maintain moat signals as proof-backed operating claims rather than broad market assertions.",
    proof: "/competitive-edge, /source-intelligence, /market-activation",
    limitation: "Competitive positioning cannot imply third-party endorsement, partnership, certification, or guaranteed outcomes.",
    nextAction: "Refresh proof routes when product capabilities or external review posture changes."
  },
  {
    name: "Legal and securities review",
    owner: "Founder + qualified counsel",
    status: "external-review-required",
    capability: "Separate operating readiness from fundraising solicitation, securities material, valuation, and investor advice.",
    proof: "/capital-vitality and /public-market-readiness",
    limitation: "SCRIMED cannot self-authorize investment materials or securities offering language.",
    nextAction: "Run any investor solicitation, SAFE/equity note, valuation, or offering deck through counsel."
  }
];

function countRevenueCapabilities(status: RevenueCapabilityStatus) {
  return revenueCapabilities.filter((capability) => capability.status === status).length;
}

function unique(values: string[]) {
  return Array.from(new Set(values));
}

export function getCapitalVitalitySummary() {
  const commercialStrategy = getCommercialStrategySummary();
  const marketActivation = getMarketActivationSummary();
  const publicMarketReadiness = getPublicMarketReadinessSummary();
  const salesDealRoom = getSalesDealRoomSummary();
  const serviceReliability = getServiceReliabilitySummary();
  const navigationAudit = getNavigationAuditSummary();
  const highMoatSignalCount = competitiveMoatSignals.filter(
    (signal) => signal.strength === "high"
  ).length;
  const readyInvestorMilestoneCount = investorReadinessMilestones.filter(
    (milestone) => milestone.status === "ready"
  ).length;
  const externalReviewMilestoneCount = investorReadinessMilestones.filter(
    (milestone) => milestone.status === "external-review-required"
  ).length;
  const operatorRequiredMilestoneCount = investorReadinessMilestones.filter(
    (milestone) => milestone.status === "operator-required"
  ).length;
  const activeFundingWorkstreamCount = fundingVitalityWorkstreams.filter(
    (workstream) => workstream.status === "active"
  ).length;
  const externalReviewWorkstreamCount = fundingVitalityWorkstreams.filter(
    (workstream) => workstream.status === "external-review-required"
  ).length;
  const proofRoutes = unique([
    ...revenueCapabilities.flatMap((capability) => capability.proofRoutes),
    ...competitiveMoatSignals.flatMap((signal) => signal.proofRoutes),
    ...investorReadinessMilestones.flatMap((milestone) => milestone.proofRoutes),
    ...fundingVitalityWorkstreams.flatMap((workstream) =>
      workstream.proof.split(",").map((route) => route.trim())
    )
  ]);

  return {
    service: "scrimed-capital-vitality",
    route: capitalVitalityRoute,
    apiRoute: capitalVitalityApiRoute,
    briefRoute: capitalVitalityBriefRoute,
    status: capitalVitalityProofStackStatus,
    briefStatus: capitalVitalityBriefProofStackStatus,
    fundingVitalityPosture: "investor-ready-readiness-materials-no-securities-offer",
    boundary: capitalVitalityBoundary,
    authority: {
      dataBoundary: "synthetic-only",
      financialAuthority: "not-audited-financial-report",
      securitiesAuthority: "not-securities-offering-material",
      investmentAdvice: "not-investment-advice",
      valuationAuthority: "not-valuation-assurance",
      reimbursementAuthority: "no-reimbursement-guarantee",
      approvalAuthority: "external-review-required",
      clinicalCareAuthority: "not-authorized-live-care",
      phiAuthority: "not-authorized-production-phi",
      securityCertification: "not-security-certified"
    },
    sourceAlignment: {
      pageRouteCount: navigationAudit.sourceTotals.pageRouteCount,
      apiRoutePatternCount: navigationAudit.sourceTotals.apiRoutePatternCount,
      smokeCoveredHtmlRouteCount: navigationAudit.coverage.smokeCoveredHtmlRouteCount,
      commercialPricingStatus: commercialStrategy.status,
      marketActivationStatus: marketActivation.status,
      publicMarketReadinessStatus: publicMarketReadiness.status,
      salesDealRoomStatus: salesDealRoom.status,
      serviceReliabilityStatus: serviceReliability.status
    },
    revenueCapabilityCount: revenueCapabilities.length,
    activeRevenueCapabilityCount: countRevenueCapabilities("active"),
    packagedRevenueCapabilityCount: countRevenueCapabilities("packaged"),
    protectedGatedRevenueCapabilityCount: countRevenueCapabilities("protected-gated"),
    externalReviewRevenueCapabilityCount: countRevenueCapabilities("external-review-required"),
    moatSignalCount: competitiveMoatSignals.length,
    highMoatSignalCount,
    investorMilestoneCount: investorReadinessMilestones.length,
    readyInvestorMilestoneCount,
    externalReviewMilestoneCount,
    operatorRequiredMilestoneCount,
    fundingWorkstreamCount: fundingVitalityWorkstreams.length,
    activeFundingWorkstreamCount,
    externalReviewWorkstreamCount,
    retainedExternalReviewCount: externalReviewMilestoneCount + externalReviewWorkstreamCount,
    proofRouteCount: proofRoutes.length,
    revenueCapabilities,
    competitiveMoatSignals,
    investorReadinessMilestones,
    fundingVitalityWorkstreams,
    proofRoutes,
    nextCapitalMove:
      "Use Capital Vitality as the executive growth lane: sell packaged synthetic and governance offers now, keep protected buyer/funding proof gated through AAL2 and release controls, refresh moat evidence before claims expand, and route any fundraising, valuation, securities, legal, reimbursement, security, PHI, or live-care claim through qualified external review.",
    updated: capitalVitalityUpdatedAt
  };
}

export function buildCapitalVitalityBrief() {
  const summary = getCapitalVitalitySummary();

  return [
    "# SCRIMED Capital Vitality Brief",
    "",
    `Status: ${summary.status}`,
    `Funding posture: ${summary.fundingVitalityPosture}`,
    `Revenue capabilities: ${summary.revenueCapabilityCount}`,
    `Packaged revenue capabilities: ${summary.packagedRevenueCapabilityCount}`,
    `Protected-gated revenue capabilities: ${summary.protectedGatedRevenueCapabilityCount}`,
    `Competitive moat signals: ${summary.moatSignalCount}`,
    `High-strength moat signals: ${summary.highMoatSignalCount}`,
    `Investor milestones: ${summary.investorMilestoneCount}`,
    `Ready investor milestones: ${summary.readyInvestorMilestoneCount}`,
    `Funding workstreams: ${summary.fundingWorkstreamCount}`,
    `External review gates: ${summary.retainedExternalReviewCount}`,
    `Proof routes: ${summary.proofRouteCount}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "This brief is not investment advice, securities offering material, audited financial reporting, accounting advice, tax advice, legal advice, valuation assurance, reimbursement assurance, customer revenue guarantee, security certification, regulatory approval, PHI processing approval, production connector approval, or live clinical care authorization.",
    "",
    "## Revenue Capabilities",
    ...summary.revenueCapabilities.map(
      (capability) =>
        `- ${capability.name} (${capability.status}): ${capability.revenueMotion} Buyer: ${capability.buyer} Price logic: ${capability.priceLogic} Proof: ${capability.proofRoutes.join(", ")} Limitation: ${capability.limitation}`
    ),
    "",
    "## Competitive Moat Signals",
    ...summary.competitiveMoatSignals.map(
      (signal) =>
        `- ${signal.name} (${signal.strength}): ${signal.evidence} Defendability: ${signal.defendability} Proof: ${signal.proofRoutes.join(", ")} Boundary: ${signal.retainedBoundary}`
    ),
    "",
    "## Investor Readiness Milestones",
    ...summary.investorReadinessMilestones.map(
      (milestone) =>
        `- ${milestone.name} (${milestone.status}): ${milestone.investorQuestion} Evidence: ${milestone.evidence} Funding impact: ${milestone.fundingImpact} Boundary: ${milestone.retainedBoundary}`
    ),
    "",
    "## Funding Vitality Workstreams",
    ...summary.fundingVitalityWorkstreams.map(
      (workstream) =>
        `- ${workstream.name} (${workstream.status}): ${workstream.capability} Owner: ${workstream.owner} Proof: ${workstream.proof} Limitation: ${workstream.limitation} Next: ${workstream.nextAction}`
    ),
    "",
    "## Next Capital Move",
    summary.nextCapitalMove,
    "",
    `Updated: ${summary.updated}`
  ].join("\n");
}
