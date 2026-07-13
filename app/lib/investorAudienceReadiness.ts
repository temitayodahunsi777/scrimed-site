import { getCapitalVitalitySummary } from "./capitalVitality";
import { getEnterpriseBusinessOpsSummary } from "./enterpriseBusinessOperations";
import { getGrowthEngineSummary } from "./growthEngine";
import { getLimitationsWorkaroundSummary } from "./limitationsWorkaroundOperations";
import { getMarketActivationSummary } from "./marketActivation";
import { getPublicMarketReadinessSummary } from "./publicMarketReadiness";

export type WeaknessSeverity = "critical" | "high" | "medium";

export type WeaknessReliefTrack = {
  weakness: string;
  severity: WeaknessSeverity;
  currentExposure: string;
  reliefSystem: string;
  owner: string;
  workaround: string;
  successMetric: string;
  graduationGate: string;
  proofRoutes: string[];
  blockedClaims: string[];
};

export type CompetitiveEdgeSignal = {
  signal: string;
  uniqueness: string;
  sellableValue: string;
  defensibility: string;
  pitchLine: string;
  proofRoutes: string[];
  retainedBoundary: string;
};

export type InvestorAudiencePacket = {
  audience: string;
  readinessStatus: "ready-now" | "package-next" | "external-review-required";
  primaryQuestion: string;
  sellableValue: string;
  pitchAngle: string;
  proofRoutes: string[];
  diligencePacket: string[];
  nextMove: string;
  requiredReview: string;
  blockedClaims: string[];
};

export type InvestorReadinessGate = {
  gate: string;
  source: string;
  sourceUrl: string;
  readinessUse: string;
  hardStop: string;
  owner: string;
};

export const investorAudienceReadinessRoute = "/investor-audience-readiness";
export const investorAudienceReadinessApiRoute = "/api/investor-audience-readiness";
export const investorAudienceReadinessBriefRoute = "/api/investor-audience-readiness/brief";
export const investorAudienceReadinessStatus =
  "investor-audience-readiness-control-plane-active";
export const investorAudienceReadinessBriefStatus =
  "investor-audience-readiness-brief-ready-no-securities-offer";
export const investorAudienceReadinessUpdatedAt = "2026-06-26";

export const investorAudienceReadinessBoundary =
  "SCRIMED Investor and Audience Readiness organizes weakness relief, competitive differentiation, sellable value, and investor or buyer audience packets for readiness review. It is operating-readiness material only. It is not investment advice, securities offering material, audited financial reporting, valuation assurance, legal advice, tax advice, accounting advice, solicitation, private placement approval, Form D filing, crowdfunding approval, nonprofit tax advice, donor advice, faith-based endorsement, customer revenue guarantee, profit guarantee, reimbursement assurance, security certification, regulatory approval, PHI processing approval, production connector approval, or live clinical care authorization.";

export const weaknessReliefTracks: WeaknessReliefTrack[] = [
  {
    weakness: "Fundraising story can sound like broad ambition instead of investable execution",
    severity: "high",
    currentExposure:
      "Multiple strong surfaces exist, but angels and strategics need the narrative compressed into wedge, proof, market, governance, and next capital use.",
    reliefSystem:
      "Use audience-specific packets that link Growth Engine, Capital Vitality, Product Console, Public Market Readiness, and protected Deal Room proof.",
    owner: "Founder + Capital Operations + qualified counsel",
    workaround:
      "Use readiness-only investor packets until a counsel-reviewed fundraising deck, data room, and exemption path are approved.",
    successMetric:
      "Each investor meeting maps to one audience packet, one proof route set, one ask boundary, and one counsel-review status.",
    graduationGate:
      "Approved investor materials, controlled data room, qualified securities counsel review, and founder-approved use-of-funds narrative.",
    proofRoutes: ["/capital-vitality", "/growth-engine", "/public-market-readiness", "/pilot-deal-room"],
    blockedClaims: ["Investment recommendation", "Guaranteed return", "Approved securities offering", "Valuation assurance"]
  },
  {
    weakness: "Competitive differentiation can be diluted by generic AI healthcare language",
    severity: "high",
    currentExposure:
      "Healthcare AI buyers hear many model-wrapper pitches; SCRIMED needs the proof to foreground workflow intelligence, governance, and buyer diligence.",
    reliefSystem:
      "Lead with Healthcare Intelligence OS, AgentOS, Atlas, TrustOS, no-PHI synthetic validation, and release-control evidence.",
    owner: "Founder + Product Marketing + Claim Guard",
    workaround:
      "Replace generic AI phrases with proof-backed SCRIMED infrastructure claims and route every public claim through Claim Guard.",
    successMetric:
      "Every pitch section references at least one proof route and one retained boundary.",
    graduationGate:
      "Counsel-reviewed positioning guide plus approved claim library for investor, buyer, press, and partner use.",
    proofRoutes: ["/healthcare-intelligence-os", "/agents", "/atlas", "/trust-os", "/qa-claim-guard"],
    blockedClaims: ["Best AI platform", "Clinical validation complete", "Certified compliance", "Customer outcomes guaranteed"]
  },
  {
    weakness: "Enterprise credibility depends on legal, finance, accounting, and deal controls being visible",
    severity: "high",
    currentExposure:
      "Large corporate and private investors will test whether SCRIMED can handle contracts, margin, revenue recognition, tax routing, and board-grade evidence.",
    reliefSystem:
      "Use Enterprise Business Ops, Capital Vitality, Public Market Readiness, and protected finance methodology gates.",
    owner: "Finance + Legal Ops + Revenue Operations",
    workaround:
      "Keep all finance, tax, accounting, legal, revenue recognition, and contract language in qualified-review mode before external release.",
    successMetric:
      "Every enterprise opportunity has package, price floor, scope, approval owner, margin exposure, and review status.",
    graduationGate:
      "Qualified legal/accounting/tax review completed for templates, SOWs, revenue methodology, and board/investor materials.",
    proofRoutes: ["/enterprise-business-ops", "/public-market-readiness", "/pricing", "/capital-vitality"],
    blockedClaims: ["Audited financial report", "Tax advice", "Contract approval", "Revenue guarantee"]
  },
  {
    weakness: "Faith-based clinic opportunity needs mission alignment without implying endorsement or nonprofit tax conclusions",
    severity: "medium",
    currentExposure:
      "Faith-based clinics may value access, trust, affordability, and stewardship, but public language must avoid religious endorsement, tax advice, or donor solicitation claims.",
    reliefSystem:
      "Use a mission-aligned clinic packet that emphasizes no-PHI workflow intelligence, safety, stewardship, and affordability controls.",
    owner: "Founder + FaithCore + qualified nonprofit counsel",
    workaround:
      "Keep faith-based clinic messaging as buyer-readiness and partnership-readiness language until counsel reviews nonprofit, donor, grant, and tax implications.",
    successMetric:
      "Each faith-based clinic conversation has mission fit, workflow pain, data boundary, review owner, and nonprofit/tax review status.",
    graduationGate:
      "Qualified counsel approves nonprofit, donor, grant, church-affiliated clinic, and charitable-use language before external fundraising or partnership claims.",
    proofRoutes: ["/faithcore", "/market-activation", "/client-onboarding", "/limitations-workarounds"],
    blockedClaims: ["IRS approval", "Tax-deductible investment", "Religious endorsement", "Donor guarantee"]
  },
  {
    weakness: "Buyer-specific proof is strong but release controls can slow momentum",
    severity: "medium",
    currentExposure:
      "Protected evidence improves trust, but investors and buyers may ask for named customer proof before customer permission and release gates exist.",
    reliefSystem:
      "Use metadata-only proof summaries, public route evidence, and protected release-control chain before buyer-specific artifacts move.",
    owner: "Buyer Diligence + Release Steward + TrustOps",
    workaround:
      "Offer non-confidential proof maps and synthetic evidence while buyer-specific artifacts stay inside AAL2 protected workspaces.",
    successMetric:
      "External proof requests are resolved with public proof, protected release decision, or blocked-claim explanation within the review SLA.",
    graduationGate:
      "Customer permission, release decision, reviewer signoff, recipient controls, and access-log reconciliation retained.",
    proofRoutes: ["/pilot-workspace/access", "/buyer-release-control-run", "/qa-buyer-proof-release", "/pilot-evidence"],
    blockedClaims: ["Customer endorsement", "Production success", "Named customer approval", "Public release approved"]
  },
  {
    weakness: "Clinical and PHI boundaries can make the product look less advanced if not framed correctly",
    severity: "medium",
    currentExposure:
      "No-PHI and no-live-care gates are strengths, but audiences may misread them as lack of ambition unless the staged path is explicit.",
    reliefSystem:
      "Frame synthetic proof, human review, authority readiness, interoperability mapping, and clinical activation gates as the safe path to scale.",
    owner: "Clinical Authority + TrustOS + Product",
    workaround:
      "Position live data as a gated future stage and make current sellable value about workflow intelligence, governance, and protected readiness.",
    successMetric:
      "Every demo and investor packet shows current no-PHI value plus the explicit gates required before live clinical use.",
    graduationGate:
      "Buyer-specific legal, privacy, security, clinical governance, BAA/DPA, connector, and runtime safety approvals retained.",
    proofRoutes: ["/clinical-authority-readiness", "/health-records", "/interoperability", "/approvals-readiness"],
    blockedClaims: ["PHI authorized", "Live care authorized", "EHR writeback approved", "Clinical decision automation ready"]
  },
  {
    weakness: "Corporate investors need strategic partnership paths, not only financial upside",
    severity: "medium",
    currentExposure:
      "Large corporations will look for integration leverage, distribution leverage, defensible workflows, procurement posture, and governance controls.",
    reliefSystem:
      "Package strategic-investor pathways around co-development, channel, deployment profile, interoperability readiness, and protected pilots.",
    owner: "Strategic Partnerships + Legal Ops + Product",
    workaround:
      "Separate non-binding strategic fit notes from term sheets, exclusivity, reseller economics, data rights, or integration commitments.",
    successMetric:
      "Each corporate investor conversation has strategic fit, channel path, integration boundary, data-rights hard stops, and legal review owner.",
    graduationGate:
      "Counsel-reviewed partnership term sheet, data rights, exclusivity limits, procurement path, and security review plan.",
    proofRoutes: ["/global-reach", "/deployment-profiles", "/interoperability", "/enterprise-business-ops"],
    blockedClaims: ["Partnership approved", "Exclusive rights granted", "Procurement approved", "Production connector approved"]
  },
  {
    weakness: "Private investors will pressure unit economics before real customer cohorts mature",
    severity: "high",
    currentExposure:
      "The business can show disciplined readiness, but actual CAC, retention, gross margin, and payback require measured buyer cohorts.",
    reliefSystem:
      "Use Public Market Readiness and Enterprise Business Ops to separate modeled assumptions from measured operating metrics.",
    owner: "Finance + Growth + Board Review",
    workaround:
      "Label unit economics as readiness assumptions until buyer-approved cohorts, finance methodology, and accounting review exist.",
    successMetric:
      "Each metric is tagged as modeled, measured, protected, buyer-approved, or external-review-required.",
    graduationGate:
      "Finance methodology approved with cohort definitions, margin accounting, customer permission, and board reporting controls.",
    proofRoutes: ["/public-market-readiness", "/enterprise-business-ops", "/growth-engine", "/sales-attribution"],
    blockedClaims: ["Audited metrics", "Guaranteed margins", "Guaranteed payback", "Customer revenue assured"]
  },
  {
    weakness: "Global and public-sector audiences need region-specific approval paths",
    severity: "medium",
    currentExposure:
      "Global interest can create overclaim risk if region, procurement, data residency, AI governance, and clinical authority are not separated.",
    reliefSystem:
      "Use Global Certification Readiness, Global Reach, Deployment Profiles, and Limitations Workarounds for region-specific packets.",
    owner: "Global Partnerships + Regional Counsel + Security",
    workaround:
      "Keep every country, public-sector, or sovereign conversation in preparation mode until regional legal, privacy, security, procurement, and clinical review exist.",
    successMetric:
      "Every global opportunity has region, buyer pack, procurement path, data residency assumption, and retained review owners.",
    graduationGate:
      "Regional counsel, privacy/security reviewers, procurement owner, and deployment profile approval retained before external claims expand.",
    proofRoutes: ["/global-certification-readiness", "/global-reach", "/deployment-profiles", "/limitations-workarounds"],
    blockedClaims: ["Regional approval", "Government endorsement", "Data residency approved", "Conformity certified"]
  },
  {
    weakness: "The product surface is powerful but can overwhelm first-time investors or clinic leaders",
    severity: "medium",
    currentExposure:
      "The platform has many routes and proof systems; audiences need a simple first path matched to their question.",
    reliefSystem:
      "Use this readiness layer as the audience router and keep navigation journeys tied to Product, Proof, Growth, Capital, Trust, and Onboarding.",
    owner: "Product Console + Navigation Owner + Sales Operations",
    workaround:
      "Route each audience to one packet, one executive brief, one proof ladder, and one next meeting action.",
    successMetric:
      "Audience path completion improves: packet opened, proof reviewed, next call scheduled, or disqualified with reason.",
    graduationGate:
      "Navigation telemetry, CRM source attribution, and buyer/investor feedback show repeatable packet-to-meeting conversion.",
    proofRoutes: ["/navigation", "/product", "/client-onboarding", "/growth-engine"],
    blockedClaims: ["Automated investor suitability", "Automated buyer qualification", "Guaranteed conversion", "Unreviewed outreach"]
  }
];

export const competitiveEdgeSignals: CompetitiveEdgeSignal[] = [
  {
    signal: "Healthcare Intelligence OS rather than single-feature AI",
    uniqueness:
      "SCRIMED combines workflow intelligence, AgentOS, Atlas, TrustOS, evidence routing, and buyer diligence into one operating layer.",
    sellableValue:
      "Investors see a platform thesis; buyers see a practical route from workflow pain to governed pilots.",
    defensibility:
      "The defensibility is healthcare workflow structure, proof discipline, and trust operations, not raw model access.",
    pitchLine:
      "SCRIMED is building governed healthcare intelligence infrastructure for workflow transformation.",
    proofRoutes: ["/healthcare-intelligence-os", "/product", "/agents", "/atlas"],
    retainedBoundary: "Platform thesis is not clinical validation, production approval, or investment advice."
  },
  {
    signal: "Synthetic-first proof reduces early PHI and procurement friction",
    uniqueness:
      "The company can sell assessment, synthetic pilot, and governance value before live data access.",
    sellableValue:
      "Health systems and clinics can evaluate value without rushing PHI, EHR, or live-care authority.",
    defensibility:
      "Synthetic validation, fixture discipline, and no-PHI controls create repeatable buyer evidence while competitors wait for data access.",
    pitchLine:
      "SCRIMED can create enterprise learning velocity without crossing live-data gates early.",
    proofRoutes: ["/demos", "/pilots", "/health-records", "/interoperability/evaluations"],
    retainedBoundary: "Synthetic evidence is not live clinical proof or PHI authorization."
  },
  {
    signal: "TrustOS, Claim Guard, and release controls are productized",
    uniqueness:
      "Governance is embedded as a product surface with claims boundaries, proof promotion, and buyer release gates.",
    sellableValue:
      "Enterprise buyers can inspect how SCRIMED prevents overclaims, uncontrolled distribution, and unmanaged evidence.",
    defensibility:
      "Trust controls compound with every new route and proof packet.",
    pitchLine:
      "SCRIMED makes healthcare AI diligence operational instead of ad hoc.",
    proofRoutes: ["/trust-os", "/qa-claim-guard", "/buyer-release-control-run", "/pilot-workspace/access"],
    retainedBoundary: "Trust readiness is not legal approval, certification, or customer permission."
  },
  {
    signal: "Audience-specific packaging for capital and clinics",
    uniqueness:
      "The platform now separates angel, corporate strategic, private investor, faith-based clinic, public-sector, payer, provider, and global partner readiness.",
    sellableValue:
      "Each audience receives the proof and limits that match its decision process.",
    defensibility:
      "Audience-routing discipline reduces founder bottleneck and improves conversion quality.",
    pitchLine:
      "SCRIMED can speak to capital, clinics, and enterprise buyers without collapsing their risks into one generic pitch.",
    proofRoutes: [investorAudienceReadinessRoute, "/growth-engine", "/capital-vitality", "/client-onboarding"],
    retainedBoundary: "Audience readiness is not investor suitability, solicitation, or procurement approval."
  },
  {
    signal: "FaithCore and mission-aligned clinic pathway",
    uniqueness:
      "Faith-based clinic positioning is handled as stewardship, access, affordability, and safety readiness rather than religious endorsement.",
    sellableValue:
      "Mission-led clinics can evaluate workflow intelligence in a way that respects trust and resource constraints.",
    defensibility:
      "The positioning gives SCRIMED a differentiated community clinic wedge while retaining nonprofit and tax review boundaries.",
    pitchLine:
      "SCRIMED can help mission-led clinics improve operational capacity without forcing enterprise-style procurement first.",
    proofRoutes: ["/faithcore", "/market-activation", "/client-onboarding", investorAudienceReadinessRoute],
    retainedBoundary: "Faith-based readiness is not tax advice, donor advice, religious endorsement, or nonprofit approval."
  },
  {
    signal: "Enterprise business operations are visible before scale",
    uniqueness:
      "Deal desk, margin, legal, accounting, tax, revenue operations, and approval roles are explicit.",
    sellableValue:
      "Large investors can see the operating controls needed for enterprise contracts and responsible growth.",
    defensibility:
      "Commercial discipline protects margin and reduces diligence friction.",
    pitchLine:
      "SCRIMED is preparing for enterprise-grade growth before enterprise complexity arrives.",
    proofRoutes: ["/enterprise-business-ops", "/public-market-readiness", "/pricing", "/capital-vitality"],
    retainedBoundary: "Operating controls are not legal, accounting, tax, audited finance, or contract advice."
  },
  {
    signal: "Global certification readiness without premature approval claims",
    uniqueness:
      "Domestic and global approval paths are mapped while keeping authority claims blocked.",
    sellableValue:
      "Corporate strategics and global partners can inspect how SCRIMED will approach region, AI governance, privacy, security, and clinical gates.",
    defensibility:
      "Preparation reduces future expansion friction and buyer skepticism.",
    pitchLine:
      "SCRIMED can scale globally only through disciplined regional evidence, not shortcut claims.",
    proofRoutes: ["/global-certification-readiness", "/global-reach", "/deployment-profiles"],
    retainedBoundary: "Global readiness is not regional legal approval, certification, conformity, or procurement approval."
  },
  {
    signal: "Continuous review and innovation loops",
    uniqueness:
      "24/7 review, audit, source attribution, QA loops, and internal innovation research are separated from autonomous production authority.",
    sellableValue:
      "Investors see learning velocity; buyers see a safer path to accuracy improvement.",
    defensibility:
      "The review system turns mistakes and bottlenecks into operational learning rather than hidden risk.",
    pitchLine:
      "SCRIMED compounds through review, evidence, and controlled innovation.",
    proofRoutes: ["/continuous-review-audit", "/operational-efficiency", "/limitations-workarounds"],
    retainedBoundary: "Review loops are not managed SOC/MDR coverage, autonomous remediation, or public quantum capability."
  }
];

export const investorAudiencePackets: InvestorAudiencePacket[] = [
  {
    audience: "Angel investors and early healthcare operators",
    readinessStatus: "ready-now",
    primaryQuestion: "Can SCRIMED explain the wedge, why now, and why this founder-led execution can win?",
    sellableValue:
      "A governed synthetic-pilot wedge into healthcare workflow intelligence, with proof routes already live.",
    pitchAngle:
      "Lead with category clarity, painful workflow targets, trust moat, no-PHI pilot speed, and specific use of funds.",
    proofRoutes: ["/product", "/growth-engine", "/capital-vitality", "/healthcare-intelligence-os"],
    diligencePacket: ["Category thesis", "Founder-led sales plan", "Synthetic pilot examples", "Use-of-funds draft"],
    nextMove:
      "Run angel conversations through a counsel-reviewed deck and readiness-only data room before any offering language.",
    requiredReview: "Qualified securities counsel before solicitation, SAFE/equity note, valuation, or offering documents.",
    blockedClaims: ["Guaranteed return", "Investment recommendation", "Approved securities offer", "Valuation certainty"]
  },
  {
    audience: "Large corporate strategic investors",
    readinessStatus: "package-next",
    primaryQuestion: "Can SCRIMED become strategically useful through distribution, workflow, data, integration, or platform leverage?",
    sellableValue:
      "Strategic partner pathways around health-system operations, payer workflows, interoperability, deployment profiles, and governance infrastructure.",
    pitchAngle:
      "Lead with strategic fit, protected pilot path, co-development boundary, data-rights hard stops, and channel economics review.",
    proofRoutes: ["/global-reach", "/deployment-profiles", "/interoperability", "/enterprise-business-ops"],
    diligencePacket: ["Strategic-fit memo", "Integration boundary map", "Deployment profile", "Partner economics review"],
    nextMove:
      "Prepare a non-binding strategic partnership memo before any exclusivity, reseller, integration, or data-rights term sheet.",
    requiredReview: "Qualified counsel, security, privacy, procurement, and finance review.",
    blockedClaims: ["Partnership approved", "Exclusive rights granted", "Production connector approved", "Data rights assigned"]
  },
  {
    audience: "Private investors and growth-equity reviewers",
    readinessStatus: "external-review-required",
    primaryQuestion: "Can SCRIMED show market size, unit economics, enterprise pricing, margin control, and repeatable growth?",
    sellableValue:
      "Operating-readiness proof for enterprise packages, price floors, buyer segments, proof ladder, and finance methodology gates.",
    pitchAngle:
      "Separate measured signals from modeled assumptions and show a path from paid assessments to synthetic pilots to enterprise licenses.",
    proofRoutes: ["/public-market-readiness", "/enterprise-business-ops", "/pricing", "/growth-engine"],
    diligencePacket: ["KPI stack", "Unit-economics assumptions", "Pricing architecture", "Deal-desk controls"],
    nextMove:
      "Move private investor review through finance-methodology and counsel-review packets before external metric claims.",
    requiredReview: "Qualified finance/accounting/legal review before KPI, valuation, securities, revenue, or margin claims.",
    blockedClaims: ["Audited metrics", "Guaranteed margin", "Guaranteed revenue", "Valuation assurance"]
  },
  {
    audience: "Faith-based clinics and mission-led clinic investors",
    readinessStatus: "package-next",
    primaryQuestion: "Can SCRIMED improve access, stewardship, documentation, and clinic capacity without violating trust boundaries?",
    sellableValue:
      "A mission-aligned no-PHI assessment and synthetic pilot path for clinics operating under resource, trust, and affordability constraints.",
    pitchAngle:
      "Lead with stewardship, safer workflow review, affordability-aware deployment, human oversight, and no-PHI early evaluation.",
    proofRoutes: ["/faithcore", "/client-onboarding", "/market-activation", "/health-records"],
    diligencePacket: ["Mission-fit brief", "No-PHI clinic workflow assessment", "Stewardship value map", "Nonprofit/tax review checklist"],
    nextMove:
      "Offer a human-reviewed clinic discovery path and keep donor, nonprofit, grant, and tax language behind qualified review.",
    requiredReview: "Qualified nonprofit, tax, legal, privacy, and clinical governance review.",
    blockedClaims: ["Tax-deductible investment", "Religious endorsement", "IRS approval", "Donor outcome guarantee"]
  },
  {
    audience: "Health system executives",
    readinessStatus: "ready-now",
    primaryQuestion: "Can SCRIMED relieve workflow pain without forcing immediate live data exposure?",
    sellableValue:
      "Paid workflow intelligence assessment and synthetic pilot pathway with governance, evidence, and production-readiness gates.",
    pitchAngle:
      "Lead with operational pain, workflow evidence, no-PHI evaluation, leadership decision pack, and staged implementation plan.",
    proofRoutes: ["/product", "/demos", "/pilots", "/pilot-deal-room"],
    diligencePacket: ["Workflow assessment scope", "Synthetic pilot plan", "Governance report", "Implementation blueprint"],
    nextMove:
      "Route qualified sponsors into Pilot Intake and attach one workflow target, success metric, and review team.",
    requiredReview: "Buyer clinical, privacy, security, legal, and implementation review before protected or live stages.",
    blockedClaims: ["Clinical outcome guaranteed", "PHI approved", "Production integration approved", "Autonomous care"]
  },
  {
    audience: "Payers and revenue-cycle buyers",
    readinessStatus: "package-next",
    primaryQuestion: "Can SCRIMED find denial, documentation, prior-auth, and evidence gaps without final billing action?",
    sellableValue:
      "Synthetic revenue workflow pilots that surface evidence gaps, policy friction, and workflow pressure for human review.",
    pitchAngle:
      "Lead with operational intelligence, not reimbursement guarantees, and keep final payer submission blocked.",
    proofRoutes: ["/workflows/results", "/atlas", "/pricing", "/public-market-readiness"],
    diligencePacket: ["Revenue workflow demo", "Evidence-gap map", "Policy-friction packet", "Finance methodology boundary"],
    nextMove:
      "Package one no-PHI revenue workflow demonstration around a buyer-approved value metric.",
    requiredReview: "Buyer finance, reimbursement, legal, compliance, and privacy review.",
    blockedClaims: ["Reimbursement guaranteed", "Payer submission approved", "Revenue lift guaranteed", "Final billing action"]
  },
  {
    audience: "Public-sector, grant, and community health funders",
    readinessStatus: "external-review-required",
    primaryQuestion: "Can SCRIMED support access, equity, rural health, or public capacity with governed evidence?",
    sellableValue:
      "Community and public-sector readiness packets around safe workflow intelligence, regional approvals, procurement, and reporting controls.",
    pitchAngle:
      "Lead with public-good workflows, no-PHI readiness, governance, transparency, and region-specific review.",
    proofRoutes: ["/global-reach", "/global-certification-readiness", "/deployment-profiles", "/market-activation"],
    diligencePacket: ["Grant-readiness brief", "Regional review map", "Procurement path", "Impact measurement boundary"],
    nextMove:
      "Prepare grant or public-sector language only after procurement, regional legal, privacy, security, and reporting review.",
    requiredReview: "Qualified grant, procurement, legal, privacy, public-sector, and regional review.",
    blockedClaims: ["Government endorsement", "Grant approved", "Regional approval", "Certified public impact"]
  },
  {
    audience: "Clinician advisors and medical leadership",
    readinessStatus: "ready-now",
    primaryQuestion: "Can clinicians guide the product without taking responsibility for unsafe automation?",
    sellableValue:
      "Clinical authority readiness, human-review gates, blocked action lists, and synthetic workflow review.",
    pitchAngle:
      "Lead with clinician oversight, workflow design, safety constraints, and explicit no-live-care boundary.",
    proofRoutes: ["/clinical-authority-readiness", "/clinical-care-activation", "/qa-evidence", "/trust-center"],
    diligencePacket: ["Clinical advisory scope", "Blocked-action register", "Review protocol", "Safety escalation path"],
    nextMove:
      "Invite advisors into bounded workflow review and authority-readiness work before any live-care pilot.",
    requiredReview: "Clinical governance, legal, privacy, and conflict-of-interest review.",
    blockedClaims: ["Medical advice", "Treatment recommendation", "Clinical validation", "Live-care authority"]
  },
  {
    audience: "Global partners and regional distributors",
    readinessStatus: "external-review-required",
    primaryQuestion: "Can SCRIMED adapt by region without overclaiming approvals or procurement readiness?",
    sellableValue:
      "Region-specific buyer packs, deployment profiles, localization paths, and retained approval gates.",
    pitchAngle:
      "Lead with local readiness discipline, evidence packets, data residency review, and no premature conformity claims.",
    proofRoutes: ["/global-reach", "/deployment-profiles", "/global-certification-readiness", "/limitations-workarounds"],
    diligencePacket: ["Regional buyer pack", "Deployment profile", "Approval-gate map", "Partner channel review"],
    nextMove:
      "Qualify partner fit and route regional claims through local counsel, security, privacy, procurement, and clinical review.",
    requiredReview: "Qualified regional legal, privacy, security, procurement, and clinical reviewers.",
    blockedClaims: ["Regional certification", "Procurement approved", "Conformity approved", "Data residency approved"]
  },
  {
    audience: "Enterprise innovation and transformation sponsors",
    readinessStatus: "ready-now",
    primaryQuestion: "Can SCRIMED create a credible first project that does not get trapped in procurement?",
    sellableValue:
      "Fixed-scope assessment and synthetic pilot packages with clear governance, proof, and expansion gates.",
    pitchAngle:
      "Lead with small, governed workflow wins that produce an executive decision packet and future implementation plan.",
    proofRoutes: ["/offerings", "/client-onboarding", "/growth-engine", "/pilot"],
    diligencePacket: ["Assessment packet", "Synthetic pilot scope", "Meeting cadence", "Executive decision brief"],
    nextMove:
      "Use Client Onboarding to move from discovery to demo, workshop, pilot scope, and follow-up without unreviewed promises.",
    requiredReview: "Buyer sponsor, security, privacy, legal, finance, and implementation owner review.",
    blockedClaims: ["Procurement approved", "Savings guaranteed", "Customer permission assumed", "Production support guaranteed"]
  }
];

export const investorReadinessGates: InvestorReadinessGate[] = [
  {
    gate: "Private offering and solicitation review",
    source: "SEC capital-raising and private offering guidance",
    sourceUrl: "https://www.sec.gov/resources-small-businesses/capital-raising-building-blocks/exempt-offerings",
    readinessUse:
      "Keep angel, private, corporate, SAFE, note, and equity conversations behind counsel-reviewed materials and a selected exemption path.",
    hardStop: "No securities offering, solicitation, valuation, or investor suitability language leaves readiness mode without counsel review.",
    owner: "Founder + qualified securities counsel"
  },
  {
    gate: "Accredited investor handling",
    source: "SEC accredited investor guidance",
    sourceUrl: "https://www.sec.gov/resources-small-businesses/capital-raising-building-blocks/accredited-investors",
    readinessUse:
      "Prepare investor routing and diligence questions that distinguish readiness discussions from offering materials.",
    hardStop: "Do not imply anyone is qualified, suitable, or approved to invest through this product surface.",
    owner: "Capital Operations + qualified counsel"
  },
  {
    gate: "Form D timing awareness",
    source: "SEC Form D guidance",
    sourceUrl: "https://www.sec.gov/resources-small-businesses/capital-raising-building-blocks/what-form-d",
    readinessUse:
      "Flag that private fundraising processes may require notice filing after first securities sale, depending on the exemption path.",
    hardStop: "SCRIMED public pages do not file Form D or approve fundraising documents.",
    owner: "Founder + qualified securities counsel"
  },
  {
    gate: "Crowdfunding boundary",
    source: "SEC Regulation Crowdfunding guidance",
    sourceUrl: "https://www.sec.gov/resources-small-businesses/capital-raising-building-blocks/regulation-crowdfunding",
    readinessUse:
      "Keep community, clinic, mission, and donor-adjacent conversations separated from any crowdfunding campaign language.",
    hardStop: "No crowdfunding offer, platform claim, or public investment campaign is approved by this readiness page.",
    owner: "Founder + qualified securities counsel"
  },
  {
    gate: "Faith-based clinic and nonprofit tax boundary",
    source: "IRS 501(c)(3) exemption requirements",
    sourceUrl: "https://www.irs.gov/charities-non-profits/charitable-organizations/exemption-requirements-501c3-organizations",
    readinessUse:
      "Route church-affiliated, nonprofit, charitable, grant, donor, and mission-led clinic language through qualified nonprofit and tax review.",
    hardStop: "Do not claim tax deductibility, charitable approval, donor benefit, or nonprofit compliance without qualified review.",
    owner: "FaithCore + qualified nonprofit counsel"
  },
  {
    gate: "Financial reporting and metric methodology",
    source: "SCRIMED Public Market Readiness",
    sourceUrl: "/public-market-readiness",
    readinessUse:
      "Separate modeled investor metrics from measured, buyer-approved, protected, or externally reviewed operating metrics.",
    hardStop: "No audited financial reporting, valuation, margin guarantee, or revenue guarantee claim.",
    owner: "Finance + accounting reviewers"
  },
  {
    gate: "Claim Guard before public use",
    source: "SCRIMED QA Claim Guard",
    sourceUrl: "/qa-claim-guard",
    readinessUse:
      "Run investor, buyer, faith-clinic, public-sector, partner, and PR language through blocked-claim controls.",
    hardStop: "No unsupported clinical, compliance, certification, revenue, investment, customer, or partnership claim.",
    owner: "TrustOps + Claim Guard"
  },
  {
    gate: "Protected diligence release",
    source: "SCRIMED Buyer Release Control Runbook",
    sourceUrl: "/buyer-release-control-run",
    readinessUse:
      "Keep buyer-specific, investor-specific, and customer-specific evidence in protected release lanes until permissions and controls exist.",
    hardStop: "No named customer proof, confidential artifact, or protected packet is released without retained approval chain.",
    owner: "Release Steward + Buyer Diligence"
  }
];

function unique(values: string[]) {
  return Array.from(new Set(values));
}

function countWeaknessesBySeverity(severity: WeaknessSeverity) {
  return weaknessReliefTracks.filter((track) => track.severity === severity).length;
}

export function getInvestorAudienceReadinessSummary() {
  const capitalVitalitySummary = getCapitalVitalitySummary();
  const growthEngineSummary = getGrowthEngineSummary();
  const enterpriseBusinessOpsSummary = getEnterpriseBusinessOpsSummary();
  const marketActivationSummary = getMarketActivationSummary();
  const publicMarketReadinessSummary = getPublicMarketReadinessSummary();
  const limitationsWorkaroundSummary = getLimitationsWorkaroundSummary();
  const proofRoutes = unique([
    ...weaknessReliefTracks.flatMap((track) => track.proofRoutes),
    ...competitiveEdgeSignals.flatMap((signal) => signal.proofRoutes),
    ...investorAudiencePackets.flatMap((packet) => packet.proofRoutes),
    ...investorReadinessGates.map((gate) => gate.sourceUrl)
  ]);
  const blockedClaims = unique([
    ...weaknessReliefTracks.flatMap((track) => track.blockedClaims),
    ...investorAudiencePackets.flatMap((packet) => packet.blockedClaims)
  ]);
  const readyNowAudienceCount = investorAudiencePackets.filter(
    (packet) => packet.readinessStatus === "ready-now"
  ).length;
  const packageNextAudienceCount = investorAudiencePackets.filter(
    (packet) => packet.readinessStatus === "package-next"
  ).length;
  const externalReviewAudienceCount = investorAudiencePackets.filter(
    (packet) => packet.readinessStatus === "external-review-required"
  ).length;

  return {
    service: "scrimed-investor-audience-readiness",
    route: investorAudienceReadinessRoute,
    apiRoute: investorAudienceReadinessApiRoute,
    briefRoute: investorAudienceReadinessBriefRoute,
    status: investorAudienceReadinessStatus,
    briefStatus: investorAudienceReadinessBriefStatus,
    boundary: investorAudienceReadinessBoundary,
    posture: "weakness-relief-and-audience-packaging-active-no-securities-offer",
    authority: {
      dataBoundary: "synthetic-and-business-readiness-only",
      securitiesAuthority: "not-securities-offering-material",
      investmentAdvice: "not-investment-advice",
      solicitationAuthority: "not-solicitation",
      valuationAuthority: "not-valuation-assurance",
      financialAuthority: "not-audited-financial-report",
      legalAuthority: "qualified-review-required",
      taxAuthority: "qualified-review-required",
      nonprofitAuthority: "qualified-review-required",
      faithBasedAuthority: "not-endorsement-or-donor-advice",
      revenueAuthority: "not-revenue-guarantee",
      profitAuthority: "not-profit-margin-guarantee",
      reimbursementAuthority: "no-reimbursement-guarantee",
      clinicalCareAuthority: "not-authorized-live-care",
      phiAuthority: "not-authorized-production-phi",
      securityCertification: "not-security-certified",
      customerProofAuthority: "customer-permission-required"
    },
    sourceAlignment: {
      capitalRevenueCapabilityCount: capitalVitalitySummary.revenueCapabilityCount,
      capitalMoatSignalCount: capitalVitalitySummary.moatSignalCount,
      capitalInvestorMilestoneCount: capitalVitalitySummary.investorMilestoneCount,
      growthPlayCount: growthEngineSummary.growthPlayCount,
      growthConversionLaneCount: growthEngineSummary.conversionLaneCount,
      enterpriseBusinessRevenueCapabilityCount: enterpriseBusinessOpsSummary.revenueCapabilityCount,
      enterpriseBusinessMarginControlCount: enterpriseBusinessOpsSummary.marginControlCount,
      marketActivationTargetAudienceCount: marketActivationSummary.targetAudienceCount,
      marketActivationRevenueStreamCount: marketActivationSummary.revenueStreamCount,
      publicMarketMetricCount: publicMarketReadinessSummary.metricCount,
      publicMarketCustomerProofStageCount: publicMarketReadinessSummary.customerProofStageCount,
      limitationsWorkaroundTrackCount: limitationsWorkaroundSummary.trackCount,
      limitationsWorkaroundPacketCount: limitationsWorkaroundSummary.packetCount
    },
    weaknessTrackCount: weaknessReliefTracks.length,
    criticalWeaknessCount: countWeaknessesBySeverity("critical"),
    highWeaknessCount: countWeaknessesBySeverity("high"),
    mediumWeaknessCount: countWeaknessesBySeverity("medium"),
    competitiveEdgeSignalCount: competitiveEdgeSignals.length,
    audiencePacketCount: investorAudiencePackets.length,
    readyNowAudienceCount,
    packageNextAudienceCount,
    externalReviewAudienceCount,
    readinessGateCount: investorReadinessGates.length,
    proofRouteCount: proofRoutes.length,
    blockedClaimCount: blockedClaims.length,
    weaknessReliefTracks,
    competitiveEdgeSignals,
    investorAudiencePackets,
    investorReadinessGates,
    proofRoutes,
    blockedClaims,
    nextInvestorMove:
      "Use Investor and Audience Readiness as the routing layer for angels, corporate strategics, private investors, faith-based clinics, health systems, payers, public-sector funders, clinicians, global partners, and transformation sponsors: open one packet, attach proof routes, route blocked claims through Claim Guard, and keep securities, valuation, legal, tax, nonprofit, customer, PHI, clinical, reimbursement, certification, partnership, and revenue claims behind qualified review.",
    updated: investorAudienceReadinessUpdatedAt
  };
}

export function buildInvestorAudienceReadinessBrief() {
  const summary = getInvestorAudienceReadinessSummary();

  return [
    "# SCRIMED Investor and Audience Readiness Brief",
    "",
    `Status: ${summary.status}`,
    `Posture: ${summary.posture}`,
    `Weakness relief tracks: ${summary.weaknessTrackCount}`,
    `High weaknesses: ${summary.highWeaknessCount}`,
    `Competitive edge signals: ${summary.competitiveEdgeSignalCount}`,
    `Audience packets: ${summary.audiencePacketCount}`,
    `Ready-now audience packets: ${summary.readyNowAudienceCount}`,
    `External-review audience packets: ${summary.externalReviewAudienceCount}`,
    `Readiness gates: ${summary.readinessGateCount}`,
    `Proof routes: ${summary.proofRouteCount}`,
    `Blocked claims: ${summary.blockedClaimCount}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "This brief is not investment advice, not securities offering material, not solicitation, not audited financial reporting, not valuation assurance, and not legal advice, tax advice, accounting advice, nonprofit tax advice, donor advice, faith-based endorsement, customer revenue guarantee, profit guarantee, reimbursement assurance, security certification, regulatory approval, PHI processing approval, production connector approval, or live clinical care authorization.",
    "",
    "## Weakness Relief Tracks",
    ...summary.weaknessReliefTracks.map(
      (track) =>
        `- ${track.weakness} (${track.severity}): ${track.reliefSystem} Workaround: ${track.workaround} Owner: ${track.owner} Gate: ${track.graduationGate}`
    ),
    "",
    "## Competitive Edge Signals",
    ...summary.competitiveEdgeSignals.map(
      (signal) =>
        `- ${signal.signal}: ${signal.pitchLine} Sellable value: ${signal.sellableValue} Proof: ${signal.proofRoutes.join(", ")} Boundary: ${signal.retainedBoundary}`
    ),
    "",
    "## Investor And Audience Packets",
    ...summary.investorAudiencePackets.map(
      (packet) =>
        `- ${packet.audience} (${packet.readinessStatus}): ${packet.primaryQuestion} Pitch: ${packet.pitchAngle} Next: ${packet.nextMove} Review: ${packet.requiredReview}`
    ),
    "",
    "## Readiness Gates",
    ...summary.investorReadinessGates.map(
      (gate) =>
        `- ${gate.gate}: ${gate.readinessUse} Source: ${gate.source} (${gate.sourceUrl}) Hard stop: ${gate.hardStop}`
    ),
    "",
    "## Next Investor Move",
    summary.nextInvestorMove,
    "",
    `Updated: ${summary.updated}`
  ].join("\n");
}
