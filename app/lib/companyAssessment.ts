import { getApprovalsReadinessSummary } from "./approvalsReadiness";
import { getBoundaryResolutionSummary } from "./boundaryResolution";
import { getCapitalVitalitySummary } from "./capitalVitality";
import { getClientOnboardingCommunicationsSummary } from "./clientOnboardingCommunications";
import { getCompetitiveDefenseSummary } from "./competitiveDefense";
import { getContinuousReviewAuditSummary } from "./continuousReviewAudit";
import { getEnterpriseBusinessOpsSummary } from "./enterpriseBusinessOperations";
import { getEnterpriseScalabilityOperationsSummary } from "./enterpriseScalabilityOperations";
import { getGlobalCertificationReadinessSummary } from "./globalCertificationReadiness";
import { getGrowthEngineSummary } from "./growthEngine";
import { getHealthRecordsSafetyExchangeSummary } from "./healthRecordsSafetyExchange";
import { getInvestorAudienceReadinessSummary } from "./investorAudienceReadiness";
import { getLaunchReadinessSummary } from "./launchReadinessOperations";
import { getLimitationsWorkaroundSummary } from "./limitationsWorkaroundOperations";
import { getNavigationAuditSummary } from "./navigationAudit";
import { getOperationalEfficiencySummary } from "./operationalEfficiency";
import { getPlatformPowerSummary } from "./platformPowerOperations";
import { getProductServicePortfolioSummary } from "./productServicePortfolio";
import { getPublicMarketReadinessSummary } from "./publicMarketReadiness";
import { getReleaseContinuitySummary } from "./releaseContinuity";
import { getServiceDeliverySummary } from "./serviceDelivery";
import { getServiceReliabilitySummary } from "./serviceReliability";

export type CompanyAssessmentDimensionStatus =
  | "strong"
  | "watch"
  | "upgrade-now"
  | "external-review-required"
  | "protected-gated";

export type CompanyAssessmentDimension = {
  name: string;
  status: CompanyAssessmentDimensionStatus;
  score: number;
  weight: number;
  owner: string;
  currentStrength: string;
  weakness: string;
  upgrade: string;
  evidenceSnapshot: string;
  evidenceRoutes: string[];
  retainedBoundary: string;
};

export type CompanyAssessmentWeakness = {
  name: string;
  severity: "critical" | "high" | "medium";
  currentImpact: string;
  reliefMove: string;
  owner: string;
  proofRoutes: string[];
  retainedBoundary: string;
};

export type CompanyAssessmentWorkstream = {
  name: string;
  horizon: "now" | "30-days" | "60-days" | "90-days";
  owner: string;
  objective: string;
  sequence: string[];
  proofRoutes: string[];
  successSignal: string;
  retainedBoundary: string;
};

export type CompanyAssessmentTeamLane = {
  team: string;
  mandate: string;
  requiredRoles: string[];
  operatingCadence: string;
  approvalStops: string[];
  proofRoutes: string[];
};

export type CompanyAuditFinding = {
  area: string;
  rating: "strength-to-amplify" | "gap-to-close" | "revenue-unlock" | "risk-to-control";
  strength: string;
  weakness: string;
  improvement: string;
  revenueImpact: string;
  competitiveSignal: string;
  proofRoutes: string[];
  retainedBoundary: string;
};

export type CompanyRevenueBuilder = {
  name: string;
  buyer: string;
  packageMotion: string;
  marginLever: string;
  conversionPath: string;
  proofRoutes: string[];
  retainedBoundary: string;
};

export type CompanyCompetitiveEdgeAmplifier = {
  name: string;
  marketPressure: string;
  scrimedEdge: string;
  makeApparentBy: string;
  buyerProof: string;
  proofRoutes: string[];
  retainedBoundary: string;
};

export type CompanyImprovementPriority = {
  name: string;
  priority: "P0" | "P1" | "P2";
  gap: string;
  unblockMove: string;
  owner: string;
  proofRoutes: string[];
  successSignal: string;
  retainedBoundary: string;
};

export type CompanyMissingCapabilityClosure = {
  slug: string;
  capability: string;
  severity: "critical" | "high" | "medium";
  whyItMatters: string;
  currentWorkaround: string;
  permanentBuild: string;
  owner: string;
  proofRoutes: string[];
  successMetric: string;
  blockedUntil: string;
  retainedBoundary: string;
};

export const companyAssessmentRoute = "/company-assessment";
export const companyAssessmentApiRoute = "/api/company-assessment";
export const companyAssessmentBriefRoute = "/api/company-assessment/brief";
export const companyAssessmentStatus = "company-operating-assessment-active";
export const companyAssessmentBriefStatus = "company-operating-assessment-brief-ready-no-advice";
export const companyAssessmentUpdatedAt = "2026-06-27";

export const companyAssessmentBoundary =
  "SCRIMED Company Assessment organizes company-wide product, service, revenue, margin, legal, accounting, tax, certification, security, interoperability, AI, launch, buyer, investor, and operating-readiness signals into one internal control plane. It is strategic and operational readiness material only. It is not legal advice, accounting advice, tax advice, audited financial reporting, valuation assurance, investment advice, securities offering material, solicitation, certification, security assurance, clinical validation, medical advice, PHI processing approval, production connector approval, customer permission, public launch approval, contractual SLA, revenue guarantee, profit-margin guarantee, reimbursement assurance, or live clinical care authorization.";

const companyAssessmentAuthority = {
  dataBoundary: "synthetic-business-and-metadata-only",
  legalAuthority: "qualified-review-required",
  accountingAuthority: "qualified-accounting-review-required",
  taxAuthority: "qualified-tax-review-required",
  financialAuthority: "not-audited-financial-report",
  investmentAdvice: "not-investment-advice",
  securitiesAuthority: "not-securities-offering-material",
  solicitationAuthority: "not-solicitation",
  valuationAuthority: "not-valuation-assurance",
  revenueAuthority: "not-revenue-guarantee",
  profitAuthority: "not-profit-margin-guarantee",
  reimbursementAuthority: "no-reimbursement-guarantee",
  phiAuthority: "not-authorized-production-phi",
  clinicalCareAuthority: "not-authorized-live-care",
  connectorAuthority: "not-production-connector-approved",
  securityCertification: "not-security-certified",
  launchApprovalAuthority: "human-launch-review-required",
  customerPermission: "not-customer-permission",
  aiAuthority: "no-live-autonomous-ai-authority"
};

function unique(values: string[]) {
  return Array.from(new Set(values));
}

function weightedScore(dimensions: CompanyAssessmentDimension[]) {
  const totalWeight = dimensions.reduce((total, dimension) => total + dimension.weight, 0);
  const score = dimensions.reduce(
    (total, dimension) => total + dimension.score * dimension.weight,
    0
  );

  return Math.round(score / totalWeight);
}

function readinessBand(score: number) {
  if (score >= 90) {
    return "enterprise-ready-with-retained-approval-gates";
  }

  if (score >= 82) {
    return "launch-and-investor-ready-with-controlled-hard-stops";
  }

  if (score >= 74) {
    return "commercially-promotable-with-watch-items";
  }

  return "needs-focused-remediation-before-expansion";
}

export const companyAssessmentHardStops = [
  "No PHI, patient identifiers, source medical records, payer member IDs, production credentials, or live endpoints in public or synthetic workflows.",
  "No public legal, privacy, regulatory, tax, accounting, securities, valuation, investment, donor, reimbursement, or certification conclusions without qualified review.",
  "No revenue, savings, ROI, uptime, trillion-scale, error-free AI, attack-proof, profit-margin, customer outcome, reimbursement, or public market-readiness guarantee.",
  "No live clinical care, diagnosis, treatment, triage, prescribing, patient outreach, EHR mutation, payer submission, or autonomous care routing.",
  "No production connector, health-system integration, EHR writeback, customer SSO, automated invitation, signed document storage, or external artifact storage until the protected approval chain exists.",
  "No customer-specific proof release without AAL2 workspace, reviewer signoff, release decision, recipient control, access-log path, and Claim Guard language.",
  "No buyer or investor deck expands beyond the current proof route, retained boundary, and approved no-authority language.",
  "No paid delivery begins without selected package, no-PHI intake, scope matrix, acceptance criteria, work-order template, owner, margin control, and hard stop list.",
  "No public quantum, autonomous remediation, managed SOC/MDR, production model-routing, accessibility-certification, security-certification, or API-SLA claim.",
  "No broad global operations claim without region-specific privacy, AI governance, cyber, procurement, residency, clinical, and qualified local review gates.",
  "No workaround graduates into authority until evidence, owner approval, external-review need, expiration cadence, and route-level proof are present.",
  "No enterprise proposal leaves without deal desk, counsel review, accounting/revenue-recognition triage, tax awareness, billing readiness, and contract authority.",
  "No scale commitment expands without capacity assumptions, tenant owner, queue/backpressure model, support tier, incident/change path, cost guardrail, and no-SLA boundary.",
  "No competitor comparison, privacy/security positioning, or infiltration-deterrence claim without source, proof route, no-copy boundary, and qualified review where needed."
];

export const companyAssessmentTeamLanes: CompanyAssessmentTeamLane[] = [
  {
    team: "Executive Operating Council",
    mandate: "Own whole-company prioritization, launch gates, investor posture, buyer commitments, and escalation decisions.",
    requiredRoles: ["Founder", "Product Console owner", "Release Steward", "Revenue Operations", "TrustOS lead"],
    operatingCadence: "Weekly company assessment review; daily launch or buyer-deadline standup when risk is active.",
    approvalStops: ["launch approval", "customer-specific proof release", "pricing exception", "public claim expansion"],
    proofRoutes: [companyAssessmentRoute, "/product", "/launch-readiness", "/qa-claim-guard"]
  },
  {
    team: "Legal, Privacy, And Security Review Bench",
    mandate: "Keep contracts, privacy, cyber, healthcare authority, data handling, competitor language, and certification claims inside qualified-review gates.",
    requiredRoles: ["Qualified counsel", "Privacy reviewer", "Security reviewer", "Clinical governance reviewer", "Claims governance"],
    operatingCadence: "Twice-weekly queue triage plus same-day review for public, buyer, investor, or protected proof releases.",
    approvalStops: ["PHI request", "BAA or DPA claim", "SOC 2/HITRUST/ISO claim", "FDA/ONC/clinical claim", "penetration-test request"],
    proofRoutes: ["/approvals-readiness", "/global-certification-readiness", "/competitive-defense", "/boundary-resolution"]
  },
  {
    team: "Finance, Accounting, Tax, And Deal Desk",
    mandate: "Control price floors, scope creep, revenue-recognition triage, billing readiness, margin protection, investment language, and capital-readiness evidence.",
    requiredRoles: ["Finance lead", "Qualified accountant", "Tax reviewer", "Deal desk owner", "Revenue operations"],
    operatingCadence: "Every enterprise proposal, renewal, investor packet, and service expansion passes through a margin and authority check.",
    approvalStops: ["revenue guarantee", "profit-margin guarantee", "valuation claim", "securities language", "unreviewed payment or tax term"],
    proofRoutes: ["/enterprise-business-ops", "/capital-vitality", "/growth-engine", "/public-market-readiness"]
  },
  {
    team: "Product, AI, Interoperability, And Delivery",
    mandate: "Build sellable offers, API/UI/AI power, health-record safety, service work orders, onboarding flows, evidence outputs, and protected delivery artifacts.",
    requiredRoles: ["Product lead", "AI platform lead", "Interoperability lead", "Delivery lead", "Customer operations"],
    operatingCadence: "Daily build queue; weekly offer, delivery, evidence, and technical boundary review.",
    approvalStops: ["production model routing", "live connector", "EHR writeback", "unscoped implementation", "PHI or live data dependency"],
    proofRoutes: ["/offerings", "/service-delivery", "/platform-power", "/health-records", "/client-onboarding"]
  },
  {
    team: "24/7 Review And Internal Research",
    mandate: "Operate agent-assisted review loops, accuracy sampling, evidence aging, claims guard, security drift, QA regression, incident learning, and internal future-research tracks.",
    requiredRoles: ["TrustOS", "QA", "Security", "Internal Research Team", "Release engineering"],
    operatingCadence: "Continuous agent-assisted monitoring with human review before production actions or external claims.",
    approvalStops: ["autonomous remediation", "public quantum claim", "managed SOC/MDR claim", "unreviewed incident learning", "unsupported accuracy statement"],
    proofRoutes: ["/continuous-review-audit", "/qa-evidence", "/service-reliability", "/operational-efficiency"]
  }
];

export function getCompanyAssessmentSummary() {
  const approvals = getApprovalsReadinessSummary();
  const boundaryResolution = getBoundaryResolutionSummary();
  const capitalVitality = getCapitalVitalitySummary();
  const clientOnboarding = getClientOnboardingCommunicationsSummary();
  const competitiveDefense = getCompetitiveDefenseSummary();
  const continuousReview = getContinuousReviewAuditSummary();
  const enterpriseBusinessOps = getEnterpriseBusinessOpsSummary();
  const enterpriseScalability = getEnterpriseScalabilityOperationsSummary();
  const globalCertification = getGlobalCertificationReadinessSummary();
  const growthEngine = getGrowthEngineSummary();
  const healthRecords = getHealthRecordsSafetyExchangeSummary();
  const investorAudience = getInvestorAudienceReadinessSummary();
  const launchReadiness = getLaunchReadinessSummary();
  const limitationsWorkarounds = getLimitationsWorkaroundSummary();
  const navigationAudit = getNavigationAuditSummary();
  const operationalEfficiency = getOperationalEfficiencySummary();
  const platformPower = getPlatformPowerSummary();
  const productServicePortfolio = getProductServicePortfolioSummary();
  const publicMarketReadiness = getPublicMarketReadinessSummary();
  const releaseContinuity = getReleaseContinuitySummary();
  const serviceDelivery = getServiceDeliverySummary();
  const serviceReliability = getServiceReliabilitySummary();

  const dimensions: CompanyAssessmentDimension[] = [
    {
      name: "Product and services portfolio",
      status: "strong",
      score: 88,
      weight: 10,
      owner: "Product Console, Revenue Operations, Deal Desk, and Delivery",
      currentStrength: "Sellable offers, packages, delivery playbooks, margin controls, proof routes, and blocked claims are packaged.",
      weakness: "Buyer conversations can still fragment if every opportunity is not forced into one offer, package, proof route, and retained boundary.",
      upgrade: "Use Offerings and Service Delivery as the only path from buyer interest into paid work.",
      evidenceSnapshot: `${productServicePortfolio.offerCount} offers, ${productServicePortfolio.packageCount} packages, ${productServicePortfolio.marginControlCount} margin controls, ${serviceDelivery.deliveryOfferCount} delivery offers, and ${serviceDelivery.workOrderTemplateCount} work-order templates.`,
      evidenceRoutes: [
        productServicePortfolio.route,
        productServicePortfolio.apiRoute,
        productServicePortfolio.briefRoute,
        serviceDelivery.route,
        serviceDelivery.apiRoute,
        serviceDelivery.briefRoute
      ],
      retainedBoundary: "Packaging readiness only; no contract, PHI, certification, revenue, profit, connector, reimbursement, or clinical authority."
    },
    {
      name: "Revenue, margins, and enterprise business operations",
      status: "strong",
      score: 86,
      weight: 10,
      owner: "Founder, Finance, Accounting, Tax, Deal Desk, Legal Ops, and Revenue Operations",
      currentStrength: "Revenue capabilities, margin controls, legal/accounting/tax roles, blocked claims, and deal-desk controls are explicit.",
      weakness: "Enterprise scale will strain margins unless every proposal is routed through price floor, scope, billing, revenue-recognition, and tax review.",
      upgrade: "Make Enterprise Business Ops the mandatory gate before pricing, proposal, investment packet, renewal, or service expansion release.",
      evidenceSnapshot: `${enterpriseBusinessOps.revenueCapabilityCount} revenue capabilities, ${enterpriseBusinessOps.marginControlCount} margin controls, ${enterpriseBusinessOps.teamRoleCount} team roles, ${enterpriseBusinessOps.profitLeverCount} profit levers, and ${enterpriseBusinessOps.blockedClaimCount} blocked business claims.`,
      evidenceRoutes: [
        enterpriseBusinessOps.route,
        enterpriseBusinessOps.apiRoute,
        enterpriseBusinessOps.briefRoute,
        capitalVitality.route,
        growthEngine.route,
        publicMarketReadiness.route
      ],
      retainedBoundary: "Business-readiness material only; no legal, accounting, tax, audited financial, securities, valuation, revenue, or profit guarantee."
    },
    {
      name: "Client onboarding, demos, pilots, and communications",
      status: "strong",
      score: 84,
      weight: 8,
      owner: "Revenue Operations, Sales Engineering, Customer Operations, TrustOps, Legal Ops, and Finance",
      currentStrength: "Buyer stages, templates, calendar-safe packets, presentation packets, handoffs, controls, and blocked content are mapped.",
      weakness: "Manual review remains necessary before email, calendar, deck, pilot, procurement, or follow-up content leaves the company.",
      upgrade: "Require a selected onboarding stage, human-reviewed template, no-PHI packet, owner, follow-up SLA, and claim guard for every buyer interaction.",
      evidenceSnapshot: `${clientOnboarding.stageCount} onboarding stages, ${clientOnboarding.templateCount} templates, ${clientOnboarding.presentationPacketCount} presentation packets, ${clientOnboarding.controlCount} controls, and ${clientOnboarding.handoffCount} handoffs.`,
      evidenceRoutes: [clientOnboarding.route, clientOnboarding.apiRoute, clientOnboarding.briefRoute, "/demos", "/pilot"],
      retainedBoundary: "Templates and routing only; no email send, calendar creation, contract approval, procurement approval, PHI, certification, or clinical authority."
    },
    {
      name: "Trust, approvals, certifications, and global readiness",
      status: "external-review-required",
      score: 78,
      weight: 10,
      owner: "Legal, Privacy, Security, Clinical Governance, AI Governance, Regional Counsel, and TrustOS",
      currentStrength: "Domestic and global approval tracks, certification gates, regional packs, and evidence roadmaps are visible before claims expand.",
      weakness: "SCRIMED is not yet certified or approved for regulated healthcare claims; external review and evidence rooms remain required.",
      upgrade: "Build metadata-only evidence rooms for HIPAA/BAA, SOC 2/ISO, FDA/CDS/SaMD, ONC/connectors, EU AI Act/GDPR, UK, Australia, and regional deployment packs.",
      evidenceSnapshot: `${approvals.trackCount} approval tracks, ${approvals.agentControlCount} approval agent controls, ${globalCertification.trackCount} certification tracks, ${globalCertification.gateCount} gates, ${globalCertification.regionalPackCount} regional packs, and ${globalCertification.requiredEvidenceCount} required evidence items.`,
      evidenceRoutes: [
        approvals.route,
        approvals.apiRoute,
        approvals.briefRoute,
        globalCertification.route,
        globalCertification.apiRoute,
        globalCertification.briefRoute
      ],
      retainedBoundary: "Preparedness only; no HIPAA, SOC 2, HITRUST, FDA, ONC, EU AI Act, GDPR, ISO, DTAC, MHRA, or regional approval claim."
    },
    {
      name: "AI, API, UI, agents, and platform power",
      status: "upgrade-now",
      score: 81,
      weight: 9,
      owner: "Platform Engineering, AI Platform, Product Console, AgentOS, TrustOS, Security, Finance, and Design Systems",
      currentStrength: "API contracts, role-based UI command paths, AI model-route readiness, agent approvals, eval loops, evidence retrieval, and cost controls are mapped.",
      weakness: "The platform cannot claim public API SLA, live autonomous AI, production model routing, accessibility certification, or trillion-scale equivalence.",
      upgrade: "Turn Platform Power into a contract-backed operating system with model-route register, eval/red-team queue, evidence map, accessibility checklist, and cost telemetry.",
      evidenceSnapshot: `${platformPower.pillarCount} pillars, ${platformPower.controlCount} controls, ${platformPower.workstreamCount} workstreams, ${platformPower.bottleneckCount} bottlenecks, and ${platformPower.hardStopCount} hard stops.`,
      evidenceRoutes: [platformPower.route, platformPower.apiRoute, platformPower.briefRoute, "/agents", "/evaluation", "/trust-os"],
      retainedBoundary: "Readiness only; no public API SLA, live autonomous AI, production model-routing approval, PHI, accessibility certification, security certification, or scale equivalence."
    },
    {
      name: "Health records, interoperability, and patient safety",
      status: "protected-gated",
      score: 79,
      weight: 9,
      owner: "Interoperability, Health Records Safety, TrustOS, Privacy, Security, and Clinical Governance",
      currentStrength: "No-PHI extraction, source attribution, safety checks, standards binding, boundary resolutions, and live-data workarounds are explicit.",
      weakness: "Live data exchange, EHR writeback, patient matching, payer submission, diagnosis, treatment, and patient outreach remain blocked.",
      upgrade: "Create customer-specific sandbox acceptance tests and source-attributed no-PHI evaluator packets before any live connector work.",
      evidenceSnapshot: `${healthRecords.capabilityCount} capabilities, ${healthRecords.extractionStageCount} extraction stages, ${healthRecords.safetyCheckCount} safety checks, ${healthRecords.boundaryResolutionCount} boundary resolutions, and ${healthRecords.workaroundCount} workarounds.`,
      evidenceRoutes: [
        healthRecords.route,
        healthRecords.apiRoute,
        healthRecords.briefRoute,
        healthRecords.extractRoute,
        "/interoperability",
        "/clinical-authority-readiness"
      ],
      retainedBoundary: "No PHI, no live records, no EHR authorization, no ONC certification, no payer submission, no diagnosis, no treatment, and no live-care authorization."
    },
    {
      name: "24/7 review, audit, innovation, and internal research",
      status: "strong",
      score: 85,
      weight: 8,
      owner: "TrustOS, QA, Security, Claims Governance, Release Engineering, and Internal Research Team",
      currentStrength: "Continuous review agents, loops, controls, innovation tracks, internal research assignments, evidence routes, and blocked claims are mapped.",
      weakness: "Human review remains mandatory before production remediation, public claims, security coverage language, or quantum positioning.",
      upgrade: "Promote continuous review into protected work queues for accuracy sampling, evidence source aging, claims guard review, security drift, regression review, and internal research gates.",
      evidenceSnapshot: `${continuousReview.agentCount} agents, ${continuousReview.loopCount} loops, ${continuousReview.controlCount} controls, ${continuousReview.innovationTrackCount} innovation tracks, and ${continuousReview.internalResearchAssignmentCount} internal research assignments.`,
      evidenceRoutes: [continuousReview.route, continuousReview.apiRoute, continuousReview.briefRoute, "/qa-evidence", "/service-reliability"],
      retainedBoundary: "Agent-assisted review only; no managed SOC/MDR, no autonomous production remediation, no public quantum claim, no certification, and no live-care authority."
    },
    {
      name: "Scalability, reliability, launch, and release operations",
      status: "watch",
      score: 82,
      weight: 9,
      owner: "Release Steward, Platform, Service Reliability, TrustOps, Customer Operations, Finance, and Legal Ops",
      currentStrength: "Launch gates, release continuity, service controls, enterprise scale domains, support boundaries, incident/change paths, and cost controls are visible.",
      weakness: "Enterprise traffic, buyer workspaces, support commitments, regional deployment, and reliability language must remain gated.",
      upgrade: "Attach capacity assumptions, tenant owners, queue/backpressure controls, support-tier review, cost thresholds, incident/change path, and no-SLA boundary to every expansion.",
      evidenceSnapshot: `${launchReadiness.launchTrackCount} launch tracks, ${releaseContinuity.gateCount} release gates, ${serviceReliability.controlCount} reliability controls, ${enterpriseScalability.domainCount} scale domains, ${enterpriseScalability.controlCount} scale controls, and ${enterpriseScalability.openBottleneckCount} open scale bottlenecks.`,
      evidenceRoutes: [
        launchReadiness.route,
        releaseContinuity.route,
        serviceReliability.route,
        enterpriseScalability.route,
        enterpriseScalability.apiRoute,
        enterpriseScalability.briefRoute
      ],
      retainedBoundary: "Readiness only; no contractual SLA, uptime guarantee, managed-service commitment, production support guarantee, PHI authority, or connector approval."
    },
    {
      name: "Competitive defense, security posture, and uniqueness",
      status: "strong",
      score: 87,
      weight: 8,
      owner: "Founder, Product Strategy, Legal Ops, Privacy, Security, TrustOS, and Release Steward",
      currentStrength: "Competitor threat profiles, strength-hardening tracks, legal/privacy/cyber controls, infiltration-deterrence layers, and external-review gates are explicit.",
      weakness: "Public competitor, privacy, cyber, and security language is high-risk unless source-backed and routed through qualified review.",
      upgrade: "Attach source, counter-position, proof route, no-copy boundary, and legal/privacy/cyber gate to every competitor or security claim.",
      evidenceSnapshot: `${competitiveDefense.competitorThreatProfileCount} threat profiles, ${competitiveDefense.strengthHardeningTrackCount} hardening tracks, ${competitiveDefense.legalPrivacyCyberControlCount} legal/privacy/cyber controls, ${competitiveDefense.infiltrationDeterrenceLayerCount} deterrence layers, and ${competitiveDefense.hardStopCount} hard stops.`,
      evidenceRoutes: [
        competitiveDefense.route,
        competitiveDefense.apiRoute,
        competitiveDefense.briefRoute,
        "/competitive-intelligence",
        "/trust-safety-operations"
      ],
      retainedBoundary: "Strategic readiness only; no legal advice, privacy approval, security certification, penetration-test authorization, partnership, protection guarantee, PHI, or live care."
    },
    {
      name: "Investor, clinic, partner, and capital readiness",
      status: "watch",
      score: 83,
      weight: 8,
      owner: "Founder, Capital Operations, Product Console, FaithCore, Legal Ops, Finance, and Claim Guard",
      currentStrength: "Weakness relief, competitive edge, audience packets, revenue capabilities, moat signals, investor milestones, and funding workstreams are mapped.",
      weakness: "Investor and clinic materials must avoid securities, solicitation, valuation, donor, tax, customer proof, reimbursement, PHI, clinical, certification, and revenue claims.",
      upgrade: "Route each audience through one packet, one proof route, one blocked-claim check, one qualified-review path, and one next move.",
      evidenceSnapshot: `${investorAudience.weaknessTrackCount} weakness relief tracks, ${investorAudience.competitiveEdgeSignalCount} edge signals, ${investorAudience.audiencePacketCount} audience packets, ${capitalVitality.revenueCapabilityCount} revenue capabilities, ${capitalVitality.moatSignalCount} moat signals, and ${capitalVitality.fundingWorkstreamCount} funding workstreams.`,
      evidenceRoutes: [
        investorAudience.route,
        investorAudience.apiRoute,
        investorAudience.briefRoute,
        capitalVitality.route,
        growthEngine.route,
        "/pilot-deal-room"
      ],
      retainedBoundary: "Readiness material only; no securities offer, solicitation, investment advice, valuation assurance, donor advice, tax advice, audited financials, or revenue guarantee."
    },
    {
      name: "Operational efficiency, limitations, boundaries, and workarounds",
      status: "strong",
      score: 86,
      weight: 8,
      owner: "Boundary Owners, Operational Efficiency, Product Console, TrustOS, Legal, Finance, Security, and Clinical Governance",
      currentStrength: "Cross-system gaps, inefficiencies, bottlenecks, workarounds, escalation owners, proof routes, hard stops, and boundary resolutions are centralized.",
      weakness: "Blocked requests can still become informal exceptions if the team does not route every issue through the workaround and boundary registers.",
      upgrade: "Every blocked action gets a safe packet, owner, proof route, expiration rule, escalation trigger, and graduation gate.",
      evidenceSnapshot: `${operationalEfficiency.recordCount} efficiency records, ${operationalEfficiency.sprintCount} resolution sprints, ${limitationsWorkarounds.trackCount} limitation tracks, ${limitationsWorkarounds.packetCount} workaround packets, and ${boundaryResolution.recordCount} boundary records.`,
      evidenceRoutes: [
        operationalEfficiency.route,
        operationalEfficiency.apiRoute,
        operationalEfficiency.briefRoute,
        limitationsWorkarounds.route,
        boundaryResolution.route
      ],
      retainedBoundary: "Operating control only; no approval, certification, PHI authority, clinical authority, release authority, or qualified-review waiver."
    },
    {
      name: "Navigation, proof access, and company clarity",
      status: "strong",
      score: 89,
      weight: 7,
      owner: "Product Console, Release Steward, TrustOS, Navigation, and Buyer Diligence",
      currentStrength: "Public route inventory, API route patterns, smoke coverage, navigation groups, role journeys, and limitation controls are visible.",
      weakness: "Navigation must stay ahead of the product surface as routes multiply, or buyers and operators will struggle to find the right action.",
      upgrade: "Keep Company Assessment, Product Console, Hub, Navigation Audit, Launch Readiness, Workarounds, and Service Delivery in the first decision path.",
      evidenceSnapshot: `${navigationAudit.sourceTotals.pageRouteCount} page routes, ${navigationAudit.sourceTotals.apiRoutePatternCount} API route patterns, ${navigationAudit.coverage.smokeCoveredHtmlRouteCount} smoke-covered HTML routes, ${navigationAudit.coverage.navigationGroupCount} navigation groups, and ${navigationAudit.coverage.roleJourneyCount} role journeys.`,
      evidenceRoutes: [navigationAudit.route, navigationAudit.apiRoute, navigationAudit.briefRoute, "/hub", "/product"],
      retainedBoundary: "Navigation and proof access only; route visibility does not prove protected execution, approval, certification, PHI authority, or clinical authority."
    }
  ];

  const overallScore = weightedScore(dimensions);
  const evidenceRoutes = unique([
    companyAssessmentRoute,
    companyAssessmentApiRoute,
    companyAssessmentBriefRoute,
    ...dimensions.flatMap((dimension) => dimension.evidenceRoutes)
  ]);
  const weaknessReliefQueue: CompanyAssessmentWeakness[] = [
    {
      name: "External approvals and certifications are readiness-only",
      severity: "critical",
      currentImpact: "SCRIMED can prepare evidence, but cannot claim HIPAA, SOC 2, HITRUST, FDA, ONC, EU, or global certification approval early.",
      reliefMove: "Move required evidence into metadata-only evidence rooms with accountable qualified-review owners and expiration cadence.",
      owner: "Legal, Privacy, Security, Clinical Governance, AI Governance, and Regional Counsel",
      proofRoutes: [approvals.route, globalCertification.route, boundaryResolution.route],
      retainedBoundary: "No certification or regulated approval claim."
    },
    {
      name: "Live clinical and PHI authority remain blocked",
      severity: "critical",
      currentImpact: "Health-record safety and interoperability are strong, but live care, PHI, EHR writeback, and payer submission require customer and qualified approvals.",
      reliefMove: "Use no-PHI synthetic extraction, customer sandbox acceptance tests, source-attribution checks, and protected clinical authority evidence rooms.",
      owner: "Clinical Governance, Privacy, Security, Interoperability, and Customer Authority Owners",
      proofRoutes: [healthRecords.route, "/clinical-authority-readiness", "/pilot-workspace/access"],
      retainedBoundary: "No PHI, no live data, no live care, no connector approval."
    },
    {
      name: "Revenue and margin claims need qualified business controls",
      severity: "high",
      currentImpact: "Enterprise buyers and investors will ask for ROI, savings, pricing, and margin language that can overrun current evidence.",
      reliefMove: "Gate every proposal through deal desk, margin model, finance/accounting/tax triage, Claim Guard, and protected proof release.",
      owner: "Finance, Accounting, Tax, Revenue Operations, Legal Ops, and Deal Desk",
      proofRoutes: [enterpriseBusinessOps.route, capitalVitality.route, "/qa-claim-guard"],
      retainedBoundary: "No revenue, ROI, savings, audited financial, valuation, tax, or profit-margin guarantee."
    },
    {
      name: "Buyer proof release is protected and human-gated",
      severity: "high",
      currentImpact: "SCRIMED has compelling proof paths, but customer-specific evidence cannot be shared casually.",
      reliefMove: "Require AAL2 workspace, release decision, reviewer signoff, recipient control, access-log path, and claim guard before external sharing.",
      owner: "Buyer Diligence, Release Steward, TrustOS, Legal Ops, and Customer Operations",
      proofRoutes: ["/qa-buyer-proof-release", "/buyer-release-control-run", "/pilot-workspace/access"],
      retainedBoundary: "No customer-specific release, customer permission, or external proof claim without protected approval chain."
    },
    {
      name: "Scale language must remain bounded",
      severity: "high",
      currentImpact: "Enterprise positioning can invite unsupported SLA, managed-service, support, region, or trillion-scale equivalence claims.",
      reliefMove: "Attach capacity assumptions, support tier, SLO readiness, incident/change path, region review, cost guardrails, and no-SLA boundaries to each expansion.",
      owner: "Platform, Service Reliability, Customer Operations, Finance, Legal Ops, and Tenant Governance",
      proofRoutes: [enterpriseScalability.route, serviceReliability.route, platformPower.route],
      retainedBoundary: "No SLA, uptime, managed-service, public API SLA, or scale-equivalence claim."
    },
    {
      name: "Autonomous AI and quantum positioning are internal-only",
      severity: "medium",
      currentImpact: "Future-facing research can strengthen differentiation, but public claims create regulatory, security, and accuracy risk.",
      reliefMove: "Keep quantum and advanced autonomous remediation inside internal research queues with promotion gates, evaluation evidence, and qualified review.",
      owner: "Internal Research Team, AI Platform, TrustOS, Security, and Claims Governance",
      proofRoutes: [continuousReview.route, platformPower.route, "/evaluation"],
      retainedBoundary: "No public quantum, autonomous-remediation, production model-routing, or live autonomous AI claim."
    },
    {
      name: "Communication and onboarding still require human send approval",
      severity: "medium",
      currentImpact: "Email, calendar, demo, deck, and pilot workflows are stronger, but external communication must stay controlled.",
      reliefMove: "Use calendar-safe packets, no-PHI templates, follow-up owners, and presentation Claim Guard before external use.",
      owner: "Revenue Operations, Sales Engineering, Customer Operations, Legal Ops, and Claim Guard",
      proofRoutes: [clientOnboarding.route, "/demos", "/qa-claim-guard"],
      retainedBoundary: "No automatic send, invite creation, contract approval, procurement approval, or sensitive artifact sharing."
    },
    {
      name: "Workarounds must not become informal authority",
      severity: "medium",
      currentImpact: "Workaround packets solve bottlenecks, but repeated exceptions can undermine auditability.",
      reliefMove: "Assign every workaround an owner, proof route, expiration, escalation trigger, and graduation gate.",
      owner: "Boundary Owners, Operational Efficiency, TrustOS, Legal, Finance, Security, and Clinical Governance",
      proofRoutes: [limitationsWorkarounds.route, operationalEfficiency.route, boundaryResolution.route],
      retainedBoundary: "No workaround waives retained gates, approvals, PHI authority, certification, or qualified review."
    }
  ];

  const missingCapabilityClosures: CompanyMissingCapabilityClosure[] = [
    {
      slug: "production-tenant-sso-and-invitation-activation",
      capability: "Production tenant, SSO, and invitation activation",
      severity: "critical",
      whyItMatters:
        "Enterprise buyers will eventually require customer-specific tenant provisioning, identity controls, invitation flows, retention rules, and support ownership before serious production evaluation.",
      currentWorkaround:
        "Use protected pilot workspace access, tenant lifecycle packets, AAL2 reviewer gates, and synthetic-only buyer rooms for evaluation without creating live customer infrastructure.",
      permanentBuild:
        "Implement signed customer tenant architecture, production SSO configuration, automated invite policy, retention/deletion controls, support owner routing, and customer authority evidence packets.",
      owner: "Platform, Security, Customer Operations, Legal Ops, and Release Steward",
      proofRoutes: ["/pilot-workspace/access", "/enterprise-scalability", "/service-delivery"],
      successMetric: "Every enterprise pilot has a tenant activation packet with owner, access model, support path, retention posture, and release gate.",
      blockedUntil:
        "Customer tenant architecture, SSO policy, invite authority, retention plan, and qualified security/privacy review are complete.",
      retainedBoundary:
        "Closure planning is not customer SSO approval, production tenancy, invite automation approval, PHI authority, or customer go-live approval."
    },
    {
      slug: "live-connector-authority-and-sandbox-acceptance",
      capability: "Live EHR, payer, HIE, imaging, device, and writeback connector authority",
      severity: "critical",
      whyItMatters:
        "Health systems and payers will ask how SCRIMED moves from synthetic proof into real workflows without unsafe data exchange or unapproved writeback.",
      currentWorkaround:
        "Route every integration ask through no-PHI extraction, standards mapping, connector questionnaires, synthetic fixture validation, and patient-safety acceptance criteria.",
      permanentBuild:
        "Build customer-approved sandbox acceptance kits, connector contract tests, BAA/DPA pathway references, security review evidence, writeback prohibition controls, and go-live approval artifacts.",
      owner: "Interoperability, Health Records Safety, Privacy, Security, Clinical Governance, and Customer Authority Owners",
      proofRoutes: [healthRecords.route, "/interoperability", "/clinical-production-readiness"],
      successMetric: "Every integration conversation resolves to a standards map, fixture set, safety checklist, authority gap, and customer approval dependency.",
      blockedUntil:
        "Customer authority, privacy/security review, connector acceptance, clinical governance, and live-data approvals are recorded.",
      retainedBoundary:
        "Connector closure is not PHI processing approval, production EHR/HIE/payer/device access, writeback approval, payer submission approval, or live-care authority."
    },
    {
      slug: "clinical-validation-and-regulated-claims-dossier",
      capability: "Clinical validation and regulated-claims dossier",
      severity: "critical",
      whyItMatters:
        "SCRIMED can sell operational intelligence now, but regulated clinical claims need evidence, intended-use classification, qualified review, and customer or regulator-specific approval.",
      currentWorkaround:
        "Keep offers positioned as no-PHI workflow intelligence, governance, documentation support, and evidence organization with explicit clinical authority hard stops.",
      permanentBuild:
        "Create intended-use dossiers, evaluation protocols, clinical reviewer matrices, external evidence references, regional classification records, and post-market monitoring plans where required.",
      owner: "Clinical Governance, Legal Ops, Regulatory Review, Product, TrustOS, and Claims Governance",
      proofRoutes: ["/clinical-production-readiness", "/clinical-authority-readiness", approvals.route],
      successMetric: "Every clinical-adjacent capability has intended use, blocked claims, reviewer owner, evidence class, and approval dependency.",
      blockedUntil:
        "Qualified clinical/regulatory/legal review and customer or regional approval evidence exist for the specific use.",
      retainedBoundary:
        "Dossier planning is not medical advice, clinical validation, FDA/ONC approval, regional approval, diagnosis, treatment, triage, or live clinical authority."
    },
    {
      slug: "external-security-compliance-and-vendor-risk-evidence",
      capability: "External security, compliance, and vendor-risk evidence",
      severity: "critical",
      whyItMatters:
        "Enterprise procurement will require proof beyond internal controls: security assessment, audit references, vendor risk answers, dependency hygiene, and incident posture.",
      currentWorkaround:
        "Use Trust Center, Competitive Defense, Service Reliability, Launch Readiness, protected provider security review readiness, and no-certification language.",
      permanentBuild:
        "Commission qualified security review, define SOC 2/ISO/HITRUST readiness evidence rooms, maintain vendor-risk packets, dependency audit cadence, vulnerability response, and incident evidence retention.",
      owner: "Security, Privacy, TrustOS, Legal Ops, Release Steward, and Vendor Risk Review",
      proofRoutes: [competitiveDefense.route, serviceReliability.route, globalCertification.route],
      successMetric: "Each procurement packet has current controls, missing external evidence, reviewer owner, review date, and prohibited certification language.",
      blockedUntil:
        "External security/compliance evidence and qualified reviewer attestations exist for the specific buyer claim.",
      retainedBoundary:
        "Security readiness is not SOC 2, HITRUST, ISO, HIPAA, penetration-test, attack-proof, procurement, or vendor-risk approval."
    },
    {
      slug: "buyer-proof-release-automation-with-human-control",
      capability: "Buyer proof release automation with human control",
      severity: "high",
      whyItMatters:
        "SCRIMED has strong proof assets, but buyer-specific proof can become risky if recipient, release decision, reviewer signoff, and claims language are not enforced.",
      currentWorkaround:
        "Use QA Buyer Proof Release, Buyer Release Control Runbook, AAL2 workspaces, release decisions, recipient controls, access-log reconciliation, and Claim Guard.",
      permanentBuild:
        "Add release-policy orchestration, recipient attestation workflows, packet versioning, expiry timers, reviewer dashboards, claim diffing, and evidence-room access-log reconciliation.",
      owner: "Buyer Diligence, TrustOS, Release Steward, Customer Operations, Legal Ops, and Claims Governance",
      proofRoutes: ["/qa-buyer-proof-release", "/buyer-release-control-run", "/pilot-workspace/access"],
      successMetric: "No buyer-specific packet can be referenced unless release chain, recipient control, claim guard, and audit evidence are complete.",
      blockedUntil:
        "AAL2 reviewer signoff, release decision, recipient control, access-log path, and approved current-state language are present.",
      retainedBoundary:
        "Release automation planning is not customer permission, public proof authority, distribution approval, legal approval, or production authorization."
    },
    {
      slug: "support-sla-incident-and-managed-service-readiness",
      capability: "Support, SLA, incident, and managed-service readiness",
      severity: "high",
      whyItMatters:
        "Larger customers will ask for support coverage, uptime, incident response, escalation, and managed service commitments before expanding scope.",
      currentWorkaround:
        "Keep support language readiness-only and route requests through Service Reliability, Enterprise Scalability, Operational Efficiency, and Launch Readiness.",
      permanentBuild:
        "Define support tiers, incident severities, on-call rotation, escalation SLAs, customer communication templates, post-incident review packets, cost guardrails, and contract-reviewed commitments.",
      owner: "Service Reliability, Customer Operations, Platform, Legal Ops, Finance, and Release Steward",
      proofRoutes: [serviceReliability.route, enterpriseScalability.route, launchReadiness.route],
      successMetric: "Every enterprise support request has a tier, cost model, incident path, communication owner, and contract-review boundary.",
      blockedUntil:
        "Support tier, funding model, incident process, staffing, contract terms, and legal review are approved.",
      retainedBoundary:
        "Support readiness is not contractual SLA, uptime guarantee, managed-service commitment, 24/7 SOC/MDR, or production support guarantee."
    },
    {
      slug: "evidence-vault-retention-deletion-and-artifact-governance",
      capability: "Evidence vault, retention, deletion, and artifact governance",
      severity: "high",
      whyItMatters:
        "Buyer diligence will become sensitive as proof packets, access logs, external references, release decisions, and procurement evidence grow.",
      currentWorkaround:
        "Use metadata-only references, protected packets, no raw artifact storage, no PHI, and explicit retained-source controls inside protected workspaces.",
      permanentBuild:
        "Design artifact classification, object storage policy, encryption/key ownership, deletion workflows, retention schedules, legal hold, audit export, and evidence vault access controls.",
      owner: "Security, Privacy, Legal Ops, Buyer Diligence, Platform, and Customer Operations",
      proofRoutes: ["/pilot-workspace/access", "/public-market-readiness", "/qa-buyer-proof-release"],
      successMetric: "Every evidence artifact class has retention rule, deletion rule, owner, access policy, and prohibited-content check.",
      blockedUntil:
        "Artifact governance, storage, retention, deletion, legal hold, and access controls are approved.",
      retainedBoundary:
        "Evidence vault planning is not sensitive-document storage approval, PHI storage, signed artifact storage, raw log storage, or legal-hold approval."
    },
    {
      slug: "model-evaluation-red-team-and-source-quality-benchmarking",
      capability: "Model evaluation, red-team, and source-quality benchmarking",
      severity: "high",
      whyItMatters:
        "AI credibility depends on repeatable evals, source attribution quality, refusal behavior, hallucination controls, escalation quality, and cost/latency tradeoffs.",
      currentWorkaround:
        "Use synthetic AgentOS evaluation, TrustOS controls, QA evidence, continuous review loops, and source-attribution checks before claims expand.",
      permanentBuild:
        "Build versioned eval suites, adversarial prompt tests, source-quality scorecards, model-route comparison, override sampling, reviewer calibration, and cost/latency telemetry.",
      owner: "AI Platform, TrustOS, QA, Clinical Governance, Product, and Finance",
      proofRoutes: ["/evaluation", continuousReview.route, platformPower.route],
      successMetric: "Every agent or model route has evaluation version, failure taxonomy, reviewer calibration, source-quality metric, and blocked claim list.",
      blockedUntil:
        "Evaluation protocol, reviewer threshold, source-quality score, model route owner, and escalation behavior are verified.",
      retainedBoundary:
        "Eval benchmarking is not clinical validation, model-safety certification, error-free AI proof, live autonomous AI authority, or production model-routing approval."
    },
    {
      slug: "crm-billing-accounting-and-revenue-operations-automation",
      capability: "CRM, billing, accounting, and revenue operations automation",
      severity: "medium",
      whyItMatters:
        "Revenue quality will degrade if attribution, proposal scope, billing triggers, collections, margin review, and revenue-recognition triage remain manual memory.",
      currentWorkaround:
        "Use Sales Operations, Attribution Analytics, Enterprise Business Ops, Deal Desk, Service Delivery work orders, and no-guarantee pricing boundaries.",
      permanentBuild:
        "Integrate CRM stage hygiene, quote-to-work-order handoff, invoice trigger tracking, collections queue, margin exception review, renewal forecasting, and accounting evidence packets.",
      owner: "Revenue Operations, Finance, Accounting, Tax, Deal Desk, Customer Operations, and Legal Ops",
      proofRoutes: [enterpriseBusinessOps.route, growthEngine.route, serviceDelivery.route],
      successMetric: "Every opportunity has source, stage, package, price floor, billing trigger, margin status, and blocked financial claims.",
      blockedUntil:
        "CRM, billing, revenue-recognition triage, tax review, and collections ownership are operationalized.",
      retainedBoundary:
        "Revenue operations automation is not audited financial reporting, accounting advice, tax advice, contract approval, revenue guarantee, or profit guarantee."
    },
    {
      slug: "investor-kpi-data-room-and-board-metrics-discipline",
      capability: "Investor KPI, data-room, and board metrics discipline",
      severity: "medium",
      whyItMatters:
        "Capital conversations need clear traction logic, current-safe metrics, proof inventory, limitations, and blocked claims without securities or valuation overreach.",
      currentWorkaround:
        "Use Investor Audience Readiness, Capital Vitality, Public Market Readiness, Company Assessment, and protected no-PHI metric packets.",
      permanentBuild:
        "Maintain investor data-room index, KPI definitions, cohort methodology, proof inventory, board scorecard cadence, finance methodology gates, and external-review log.",
      owner: "Founder, Capital Operations, Finance, Legal Ops, Product Console, and Claim Guard",
      proofRoutes: [investorAudience.route, capitalVitality.route, publicMarketReadiness.route],
      successMetric: "Every investor packet includes current safe metric definitions, proof source, limitation, external-review need, and prohibited claim list.",
      blockedUntil:
        "KPI methodology, finance review, evidence provenance, legal review, and audience-specific boundaries are complete.",
      retainedBoundary:
        "Investor data-room discipline is not securities material, solicitation, investment advice, valuation assurance, audited financial reporting, or revenue assurance."
    }
  ];

  const upgradeWorkstreams: CompanyAssessmentWorkstream[] = [
    {
      name: "Company command review",
      horizon: "now",
      owner: "Executive Operating Council",
      objective: "Use the company assessment as the daily source of truth before launch, buyer, investor, or service expansion decisions.",
      sequence: [
        "Review overall score and watch dimensions",
        "Pick one now-risk and one revenue unlock",
        "Assign owner and proof route",
        "Record blocked claims and retained boundaries"
      ],
      proofRoutes: [companyAssessmentRoute, "/hub", "/product", "/navigation"],
      successSignal: "Every major company decision references one route, one owner, one proof path, and one retained boundary.",
      retainedBoundary: "Operating guidance only; no launch, buyer, legal, financial, or clinical approval."
    },
    {
      name: "Approval and certification evidence room",
      horizon: "30-days",
      owner: "Legal, Privacy, Security, Clinical Governance, and Regional Counsel",
      objective: "Prepare domestic and global approval paths with metadata-only evidence references and qualified-review owners.",
      sequence: [
        "Prioritize HIPAA/BAA, SOC 2/ISO, FDA/CDS/SaMD, ONC/connectors, EU AI Act/GDPR, and regional packs",
        "Assign reviewer owner and evidence class",
        "Define expiration and renewal cadence",
        "Block public claims until review is complete"
      ],
      proofRoutes: [approvals.route, globalCertification.route, "/pilot-workspace/access"],
      successSignal: "Top approval tracks have evidence owner, artifact reference policy, review status, and blocked-claim language.",
      retainedBoundary: "Readiness only; no certification or regulatory approval."
    },
    {
      name: "Enterprise deal desk and margin lock",
      horizon: "now",
      owner: "Finance, Accounting, Tax, Legal Ops, Revenue Operations, and Deal Desk",
      objective: "Protect profit margin and enterprise credibility before every proposal, renewal, pilot, and investor packet.",
      sequence: [
        "Select package and scope",
        "Apply price floor and margin control",
        "Run accounting/revenue-recognition and tax triage",
        "Review legal, billing, and blocked claims"
      ],
      proofRoutes: [enterpriseBusinessOps.route, productServicePortfolio.route, serviceDelivery.route],
      successSignal: "No proposal leaves without scope, price-floor, billing, contract, margin, and blocked-claim review.",
      retainedBoundary: "No accounting, tax, legal, revenue, profit, securities, or valuation assurance."
    },
    {
      name: "Protected buyer proof release chain",
      horizon: "30-days",
      owner: "Buyer Diligence, TrustOS, Release Steward, Legal Ops, and Customer Operations",
      objective: "Make every customer-specific proof release traceable, recipient-controlled, and claim-guarded.",
      sequence: [
        "Use protected workspace",
        "Attach release decision",
        "Capture reviewer signoff",
        "Confirm recipient and access-log path",
        "Run Claim Guard"
      ],
      proofRoutes: ["/qa-buyer-proof-release", "/buyer-release-control-run", "/pilot-workspace/access"],
      successSignal: "Buyer proof packets have AAL2 release trail, reviewer signoff, and current-state buyer language.",
      retainedBoundary: "No customer permission, external distribution, or protected proof claim without approval chain."
    },
    {
      name: "Health-record sandbox and safety evaluator",
      horizon: "60-days",
      owner: "Interoperability, Health Records Safety, Privacy, Security, and Clinical Governance",
      objective: "Create customer-specific sandbox tests before live connector or health-system record work.",
      sequence: [
        "Choose standards and record types",
        "Create no-PHI test fixtures",
        "Run source attribution and patient-safety lint",
        "Route live-data gates to authority evidence room"
      ],
      proofRoutes: [healthRecords.route, healthRecords.extractRoute, "/interoperability", "/clinical-authority-readiness"],
      successSignal: "Every integration conversation has no-PHI fixtures, standards map, source-attribution test, and live-data approval list.",
      retainedBoundary: "No PHI, live connector, EHR writeback, payer submission, diagnosis, treatment, or care authorization."
    },
    {
      name: "24/7 review work queues",
      horizon: "30-days",
      owner: "TrustOS, QA, Security, Claims Governance, and Internal Research Team",
      objective: "Turn continuous-review design into accountable queues for accuracy, evidence, security, claims, incidents, and future research.",
      sequence: [
        "Create queue owners",
        "Define sampling cadence",
        "Log evidence aging and claim drift",
        "Route production-impact changes to human approval"
      ],
      proofRoutes: [continuousReview.route, "/qa-evidence", serviceReliability.route, operationalEfficiency.route],
      successSignal: "Accuracy sampling, source aging, claim guard, security drift, QA regression, and incident learning have owners and retained decisions.",
      retainedBoundary: "No managed SOC/MDR, autonomous production remediation, certification, or public quantum claim."
    },
    {
      name: "API, UI, AI platform hardening",
      horizon: "60-days",
      owner: "Platform Engineering, AI Platform, Product Console, Design Systems, Security, and Finance",
      objective: "Upgrade SCRIMED into a more contract-backed platform with stronger model, agent, UI, eval, and cost controls.",
      sequence: [
        "Formalize API contract register",
        "Prioritize role-based UI command paths",
        "Create model-route and agent approval registers",
        "Attach eval, red-team, retrieval, and cost telemetry"
      ],
      proofRoutes: [platformPower.route, "/agents", "/evaluation", "/trust-os"],
      successSignal: "Platform claims can point to contract, role, model, agent, eval, retrieval, and cost-control evidence.",
      retainedBoundary: "No public API SLA, accessibility certification, production model routing, live autonomous AI, PHI, or scale-equivalence claim."
    },
    {
      name: "Enterprise scale and service reliability package",
      horizon: "60-days",
      owner: "Platform, Service Reliability, Customer Operations, Finance, Legal Ops, and Tenant Governance",
      objective: "Make enterprise scalability sellable without unsupported uptime, support, region, or managed-service commitments.",
      sequence: [
        "Attach tenant owner and capacity assumptions",
        "Define queues and backpressure",
        "Add incident/change path",
        "Set support-tier and cost guardrails",
        "Document no-SLA boundary"
      ],
      proofRoutes: [enterpriseScalability.route, serviceReliability.route, releaseContinuity.route, launchReadiness.route],
      successSignal: "Scale conversations include SLO readiness, support model, incident/change route, region gate, and cost threshold.",
      retainedBoundary: "No contractual SLA, uptime guarantee, managed-service commitment, production support guarantee, PHI, or connector approval."
    },
    {
      name: "Investor and clinic packet discipline",
      horizon: "30-days",
      owner: "Founder, Capital Operations, Product Console, FaithCore, Legal Ops, Finance, and Claim Guard",
      objective: "Make every angel, strategic, private, faith-based clinic, payer, health-system, and partner conversation packet-driven.",
      sequence: [
        "Select audience packet",
        "Attach proof route and blocked claims",
        "Choose next move",
        "Route sensitive or financial language to qualified review"
      ],
      proofRoutes: [investorAudience.route, capitalVitality.route, growthEngine.route, "/pilot-deal-room"],
      successSignal: "Audience-specific materials stay current, proof-backed, and free of securities, valuation, donor, tax, customer, PHI, or revenue overclaims.",
      retainedBoundary: "No investment advice, securities material, solicitation, valuation, donor advice, tax advice, or revenue guarantee."
    },
    {
      name: "Navigation and public clarity release loop",
      horizon: "now",
      owner: "Product Console, Release Steward, Navigation, TrustOS, and Buyer Diligence",
      objective: "Keep SCRIMED easy to navigate as the operating surface grows.",
      sequence: [
        "Add high-value route to primary navigation",
        "Add role journey and limitation control",
        "Add smoke coverage",
        "Update README and project-status references"
      ],
      proofRoutes: [navigationAudit.route, companyAssessmentRoute, "/hub", "/product"],
      successSignal: "Company-critical routes remain discoverable from home, hub, product, command navigation, and smoke coverage.",
      retainedBoundary: "Navigation route visibility is not proof of protected execution, approval, PHI authority, or clinical authority."
    }
  ];

  const companyStrengths = [
    "SCRIMED now has a coherent operating-system structure: product console, hub, navigation audit, proof routes, service delivery, launch readiness, and release continuity.",
    "The product/service portfolio is packaged enough to sell assessments, readiness sprints, synthetic pilots, enterprise activation, operating-layer licensing, and retainers.",
    "Service delivery has scoped work orders, acceptance criteria, artifacts, buyer handoffs, margin protections, and hard stops.",
    "Revenue operations are stronger because deal desk, margin control, legal/accounting/tax review, billing readiness, and blocked business claims are explicit.",
    "Investor and audience readiness turns weakness relief into usable packets for angels, corporate strategics, private investors, faith-based clinics, health systems, payers, public-sector funders, and partners.",
    "Competitive defense is a differentiator because competitor pressure is translated into claims-safe product, legal, privacy, security, and infiltration-deterrence controls.",
    "24/7 review and innovation loops are designed with agent-assisted review and human-gated internal research boundaries.",
    "Health-record and interoperability work is safer because source attribution, standards mapping, no-PHI extraction, safety checks, and live-data blocks are explicit.",
    "Global approval and certification readiness is structurally prepared, even where external evidence is still required.",
    "Platform power has a realistic API/UI/AI upgrade path with model-route, agent-approval, eval, retrieval, and cost controls.",
    "Limitations and workaround operations prevent blocked requests from becoming informal, unowned exceptions.",
    "Navigation and smoke coverage make the growing company operating system easier to inspect, demo, audit, and improve."
  ];

  const companyAuditFindings: CompanyAuditFinding[] = [
    {
      area: "Commercial story clarity",
      rating: "strength-to-amplify",
      strength: "SCRIMED has a broad operating system with product, service, trust, evidence, and launch surfaces already connected.",
      weakness: "The surface area can feel too large if buyers do not immediately see the three purchase paths: assessment, synthetic pilot, and enterprise operating layer.",
      improvement: "Keep public copy, demos, pricing, and onboarding anchored to one buyer pain, one recommended package, one proof route, and one retained boundary.",
      revenueImpact: "Shortens buyer education time, reduces custom-scope drift, and turns navigation into conversion instead of exploration.",
      competitiveSignal:
        "Competitors tend to lead with simple outcomes such as ambient documentation relief, agentic automation, payer intelligence, or incumbent platform reach.",
      proofRoutes: [productServicePortfolio.route, "/pricing", clientOnboarding.route, "/demos"],
      retainedBoundary: "Commercial story clarity is not a signed quote, contract approval, procurement approval, ROI guarantee, or revenue guarantee."
    },
    {
      area: "No-PHI proof engine",
      rating: "revenue-unlock",
      strength: "Synthetic demos, pilot paths, health-record safety checks, evidence routes, and no-PHI hard stops let SCRIMED show value before protected data is authorized.",
      weakness: "Customer-specific proof and live clinical evidence still require protected AAL2 release, customer authority, and qualified review.",
      improvement: "Package synthetic benchmark snapshots, redacted workflow findings, and buyer-safe proof packets for every pilot and diligence motion.",
      revenueImpact: "Creates a lower-friction paid entry point and makes protected enterprise pilots easier to approve later.",
      competitiveSignal:
        "Market leaders win confidence by showing measurable workflow lift while keeping health-system risk low during evaluation.",
      proofRoutes: ["/pilot-demo-commercial-readiness", "/pilot-evidence", healthRecords.route, "/qa-buyer-proof-release"],
      retainedBoundary: "No-PHI proof is not PHI authority, clinical validation, live-care authorization, customer permission, or production connector approval."
    },
    {
      area: "Trust, boundaries, and buyer confidence",
      rating: "strength-to-amplify",
      strength: "TrustOS, Claim Guard, Boundary Resolution, Limitations Workarounds, and the Boundary Escalation Matrix make SCRIMED inspectable.",
      weakness: "Boundaries can sound like limitations unless they are positioned as safer purchasing, diligence, and implementation controls.",
      improvement: "Make trust language buyer-facing: proof before production risk, known hard stops, accountable escalation, and human-gated release.",
      revenueImpact: "Turns compliance caution into procurement confidence and reduces late-stage deal friction.",
      competitiveSignal:
        "Healthcare buyers increasingly compare AI vendors on governance, evidence, security posture, and human-control pathways, not only feature lists.",
      proofRoutes: [boundaryResolution.route, limitationsWorkarounds.route, "/trust-center", "/qa-claim-guard"],
      retainedBoundary: "Trust positioning is not compliance certification, legal advice, security assurance, attack-proof guarantee, or managed SOC/MDR coverage."
    },
    {
      area: "Enterprise business discipline",
      rating: "revenue-unlock",
      strength: "Deal desk, price floors, margin controls, billing readiness, revenue-recognition triage, tax awareness, and blocked claims are explicit.",
      weakness: "Enterprise opportunities can still erode margin if custom requests bypass package boundaries or qualified review.",
      improvement: "Require a deal desk pass before every proposal, renewal, strategic partnership, investor packet, and faith-based clinic package.",
      revenueImpact: "Protects gross margin, improves contract quality, and makes SCRIMED easier to finance or diligence.",
      competitiveSignal:
        "Enterprise health-tech buyers expect vendor maturity around contracts, billing, privacy, security, support, and executive accountability.",
      proofRoutes: [enterpriseBusinessOps.route, capitalVitality.route, growthEngine.route, serviceDelivery.route],
      retainedBoundary: "Business discipline is not accounting advice, tax advice, legal advice, audited financial reporting, securities material, or valuation assurance."
    },
    {
      area: "Interoperability and health-record readiness",
      rating: "gap-to-close",
      strength: "SCRIMED can map standards, extract synthetic records, preserve source attribution, and gate patient-safety risks before production work.",
      weakness: "Live EHR writeback, patient matching, payer submission, production connectors, and clinical data processing remain blocked.",
      improvement: "Add a buyer-ready sandbox simulator, connector readiness questionnaire, and patient-safety acceptance checklist to every integration conversation.",
      revenueImpact: "Creates paid interoperability readiness work before full integration authority exists.",
      competitiveSignal:
        "Incumbent EHR, RCM, and payer platforms can lean on existing integrations; SCRIMED must win by being safer, clearer, and faster to evaluate.",
      proofRoutes: [healthRecords.route, healthRecords.extractRoute, "/interoperability", "/clinical-production-readiness"],
      retainedBoundary: "Interoperability readiness is not production connectivity, EHR writeback approval, payer submission approval, PHI authority, or live clinical care."
    },
    {
      area: "Agentic review and future infrastructure",
      rating: "strength-to-amplify",
      strength: "Continuous review, audit loops, internal innovation tracks, and research assignments create a 24/7 improvement posture.",
      weakness: "Autonomous production remediation, public quantum claims, and live autonomous AI authority remain intentionally blocked.",
      improvement: "Make the external story about governed review loops while keeping quantum and advanced autonomy inside internal research gates.",
      revenueImpact: "Supports premium retainers and enterprise confidence without overclaiming future technology.",
      competitiveSignal:
        "Agentic healthcare platforms are pushing automation claims, so SCRIMED should differentiate with accountable human-gated agents and auditable loops.",
      proofRoutes: [continuousReview.route, platformPower.route, operationalEfficiency.route, "/evaluation"],
      retainedBoundary: "Agentic review is not live autonomous care, production remediation authority, public quantum capability, or model-routing approval."
    },
    {
      area: "Investor and strategic funding readiness",
      rating: "gap-to-close",
      strength: "Audience packets, capital vitality, moat signals, KPI posture, and funding workstreams are already mapped.",
      weakness: "Investor-facing materials still need audited financial boundaries, customer-evidence discipline, valuation controls, and tighter KPI packaging.",
      improvement: "Create a diligence-ready packet map with operating metrics, proof route inventory, current safe revenue motions, and blocked-claim language.",
      revenueImpact: "Improves capital conversations while protecting the company from securities, valuation, or revenue overclaims.",
      competitiveSignal:
        "Capital partners compare defensibility, proof velocity, compliance maturity, and market wedge clarity before funding healthcare AI companies.",
      proofRoutes: [investorAudience.route, capitalVitality.route, "/public-market-readiness", "/pilot-deal-room"],
      retainedBoundary: "Investor readiness is not investment advice, solicitation, securities material, valuation assurance, audited financial reporting, or revenue guarantee."
    },
    {
      area: "Cybersecurity, privacy, and infiltration deterrence",
      rating: "risk-to-control",
      strength: "Competitive Defense, Trust Center, Release Continuity, and protected workspaces define legal, privacy, cyber, and infiltration controls.",
      weakness: "Security language remains high-risk until certification, penetration testing, vendor risk, and customer-specific reviews are externally validated.",
      improvement: "Maintain a security-review roadmap with protected evidence references, dependency controls, release gates, and no-certification language.",
      revenueImpact: "Improves enterprise diligence pass rates and lowers late-stage security review surprises.",
      competitiveSignal:
        "Large incumbents and enterprise AI vendors can sell institutional trust; SCRIMED must show discipline, proof, and transparent retained limits.",
      proofRoutes: [competitiveDefense.route, "/trust-center", serviceReliability.route, releaseContinuity.route],
      retainedBoundary: "Cyber readiness is not security certification, penetration-test authorization, attack-proof assurance, or customer security approval."
    }
  ];

  const revenueBuilders: CompanyRevenueBuilder[] = [
    {
      name: "No-PHI workflow assessment",
      buyer: "Clinic, health-system department, payer operations team, or investor diligence owner",
      packageMotion: "Fixed-scope assessment that maps workflow pain, evidence gaps, buyer-safe value hypotheses, and retained clinical or data boundaries.",
      marginLever: "Template-led delivery, bounded interviews, synthetic-only artifacts, and clear change-order triggers.",
      conversionPath: "Assessment to synthetic pilot, protected enterprise pilot, or trust diligence package.",
      proofRoutes: [productServicePortfolio.route, serviceDelivery.route, clientOnboarding.route],
      retainedBoundary: "Assessment output is not clinical advice, ROI assurance, legal advice, procurement approval, or production authorization."
    },
    {
      name: "Synthetic pilot conversion engine",
      buyer: "Executive sponsor, innovation leader, operations owner, or faith-based clinic sponsor",
      packageMotion: "Time-boxed synthetic pilot with workflow scenario, source-attributed outputs, acceptance criteria, and buyer presentation packet.",
      marginLever: "Reusable pilot templates, acceptance gates, no-PHI fixtures, and package-based pricing boundaries.",
      conversionPath: "Synthetic pilot to protected proof workspace, annual operating-layer license, or managed review retainer.",
      proofRoutes: ["/pilot-demo-commercial-readiness", "/pilots", "/pilot-evidence", "/qa-buyer-proof-release"],
      retainedBoundary: "Synthetic pilot is not customer data processing, PHI authority, clinical validation, or live-care authorization."
    },
    {
      name: "Trust diligence fast pass",
      buyer: "Security, privacy, legal, compliance, procurement, or investor diligence team",
      packageMotion: "Evidence-room orientation with no-authority headers, blocked claims, review owners, protected proof paths, and risk register.",
      marginLever: "Repeatable due-diligence packet, standardized claims language, and clear escalation pricing for external review support.",
      conversionPath: "Diligence package to enterprise pilot, security review workbench, or readiness retainer.",
      proofRoutes: ["/trust-center", approvals.route, globalCertification.route, boundaryResolution.route],
      retainedBoundary: "Diligence support is not certification, legal advice, security assurance, BAA/DPA execution, or customer approval."
    },
    {
      name: "Interoperability readiness sprint",
      buyer: "Health-system integration owner, EHR program lead, payer data team, or clinical operations sponsor",
      packageMotion: "No-PHI standards map, sandbox test plan, source-attribution checklist, patient-safety acceptance criteria, and authority gap log.",
      marginLever: "Pre-integration readiness work that stays valuable before expensive production connector commitments.",
      conversionPath: "Readiness sprint to customer sandbox acceptance tests, protected connector diligence, or service-delivery work order.",
      proofRoutes: [healthRecords.route, "/interoperability", "/clinical-production-readiness", serviceDelivery.route],
      retainedBoundary: "Readiness sprint is not production connector approval, PHI processing, payer submission, EHR mutation, or live clinical care."
    },
    {
      name: "24/7 governed review retainer",
      buyer: "Enterprise operations, QA, compliance, clinical governance, or AI oversight leader",
      packageMotion: "Recurring review loop for evidence aging, claims drift, accuracy sampling, audit findings, issue triage, and innovation backlog.",
      marginLever: "Recurring revenue with queue-based scope, human approval gates, and bounded reporting cadence.",
      conversionPath: "Retainer to enterprise operating-layer license, TrustOS expansion, or platform hardening sprint.",
      proofRoutes: [continuousReview.route, operationalEfficiency.route, serviceReliability.route],
      retainedBoundary: "Review retainer is not managed SOC/MDR coverage, autonomous remediation, clinical review replacement, or certification."
    },
    {
      name: "Enterprise healthcare intelligence operating layer",
      buyer: "Health-system executive, payer operations leader, platform partner, or strategic corporate investor",
      packageMotion: "Operating-layer license around Product Console, TrustOS, Claim Guard, AgentOS review lanes, service work orders, and proof routing.",
      marginLever: "Higher-value annual platform packaging with professional services separated from license scope.",
      conversionPath: "Synthetic pilot to annual license, strategic partnership, or enterprise activation program.",
      proofRoutes: ["/product", platformPower.route, enterpriseScalability.route, enterpriseBusinessOps.route],
      retainedBoundary: "Operating-layer license is not EHR replacement, QHIN participation, production SLA, PHI authority, or live autonomous care."
    },
    {
      name: "Investor and clinic readiness package",
      buyer: "Angel investor, private investor, corporate strategic, faith-based clinic investor, or mission-led clinic sponsor",
      packageMotion: "Audience-specific packet with safe company narrative, proof routes, revenue motions, weakness relief, diligence boundaries, and next-step menu.",
      marginLever: "Reusable packets with qualified-review gates for securities, tax, donor, valuation, and customer-proof language.",
      conversionPath: "Readiness package to paid assessment, pilot sponsorship, diligence room, or strategic partnership exploration.",
      proofRoutes: [investorAudience.route, capitalVitality.route, growthEngine.route, "/market-activation"],
      retainedBoundary: "Readiness package is not securities material, solicitation, investment advice, donor advice, tax advice, valuation assurance, or revenue guarantee."
    },
    {
      name: "Launch and scale readiness package",
      buyer: "Founder, operator, enterprise sponsor, or customer success leader preparing a controlled launch",
      packageMotion: "Launch readiness, navigation, reliability, support-tier, incident/change, sandbox DNS, and boundary-control review.",
      marginLever: "Structured checklist delivery with clear phase gates before support or SLA commitments expand.",
      conversionPath: "Readiness package to release support retainer, enterprise scalability work order, or protected activation plan.",
      proofRoutes: [launchReadiness.route, enterpriseScalability.route, serviceReliability.route, "/navigation"],
      retainedBoundary: "Launch readiness is not public launch approval, contractual SLA, uptime guarantee, support guarantee, PHI authority, or customer go-live approval."
    }
  ];

  const competitiveEdgeAmplifiers: CompanyCompetitiveEdgeAmplifier[] = [
    {
      name: "Proof before production risk",
      marketPressure: "Ambient AI, automation, payer intelligence, and incumbent platforms all promise faster operational lift.",
      scrimedEdge: "SCRIMED can prove workflow value through no-PHI, synthetic, source-attributed, claim-guarded evidence before production data risk exists.",
      makeApparentBy: "Lead buyer pages with no-PHI demos, synthetic pilots, proof routes, hard stops, and the exact next purchase path.",
      buyerProof: "A buyer can inspect Product Console, demos, pilots, service delivery, and Claim Guard before live data is discussed.",
      proofRoutes: ["/product", "/demos", "/pilots", "/qa-claim-guard"],
      retainedBoundary: "Proof-before-risk messaging is not clinical validation, ROI assurance, customer authorization, or production authority."
    },
    {
      name: "Healthcare intelligence operating layer",
      marketPressure: "Point solutions often sell one lane such as documentation, intake, RCM, utilization management, or analytics.",
      scrimedEdge: "SCRIMED can position as the governed operating layer across evidence, workflows, trust, service delivery, AI agents, and health-record safety.",
      makeApparentBy: "Use the phrase healthcare intelligence operating layer consistently across Product, Company Assessment, Investor Readiness, and Enterprise Scalability.",
      buyerProof: "Company Assessment and Product Console connect revenue, trust, platform, health records, delivery, launch, and limitations in one inspectable map.",
      proofRoutes: [companyAssessmentRoute, "/product", platformPower.route, enterpriseScalability.route],
      retainedBoundary: "Operating-layer positioning is not EHR replacement, payer system replacement, QHIN authority, or live clinical authority."
    },
    {
      name: "TrustOS plus Claim Guard plus Boundary Matrix",
      marketPressure: "Enterprise healthcare buyers penalize AI vendors that cannot explain what is blocked, reviewed, or externally approved.",
      scrimedEdge: "SCRIMED turns safety, claims control, and boundary escalation into a visible product capability.",
      makeApparentBy: "Put trust proof near every commercial CTA so the boundary reads as a buying advantage.",
      buyerProof: "Limitations Workarounds, Boundary Resolution, Claim Guard, and Trust Center all describe owners, proof routes, and retained authority.",
      proofRoutes: [limitationsWorkarounds.route, boundaryResolution.route, "/trust-center", "/qa-claim-guard"],
      retainedBoundary: "TrustOS positioning is not legal advice, compliance certification, security certification, or attack-proof guarantee."
    },
    {
      name: "No-PHI evaluation path",
      marketPressure: "Health systems move slowly when vendor evaluation depends on PHI, production access, or complex contracting first.",
      scrimedEdge: "SCRIMED can sell valuable no-PHI assessments and synthetic pilots while preserving the approval path for later protected work.",
      makeApparentBy: "Make the no-PHI entry point obvious on homepage, demos, pilots, onboarding, and pricing surfaces.",
      buyerProof: "Pilot Demo Commercial Readiness and Health Records Safety Exchange show what can be done now without protected data.",
      proofRoutes: ["/pilot-demo-commercial-readiness", healthRecords.route, clientOnboarding.route, "/pricing"],
      retainedBoundary: "No-PHI evaluation path does not authorize PHI, production connectors, live records, patient matching, or care decisions."
    },
    {
      name: "Interoperability-aware without overclaiming integration",
      marketPressure: "Large EHR, RCM, and payer platforms can claim installed-base advantage and deeper production integrations.",
      scrimedEdge: "SCRIMED can win the pre-integration decision by being standards-aware, safety-gated, and clear about what is not yet approved.",
      makeApparentBy: "Package standards mapping, sandbox fixtures, patient-safety lint, and connector authority gaps as paid readiness work.",
      buyerProof: "Health Records and Interoperability surfaces show standards, extraction boundaries, safety checks, and live-data hard stops.",
      proofRoutes: [healthRecords.route, healthRecords.extractRoute, "/interoperability", "/clinical-production-readiness"],
      retainedBoundary: "Interoperability-aware messaging is not production integration, EHR writeback, payer submission, PHI authority, or certification."
    },
    {
      name: "Human-gated agents and continuous audit",
      marketPressure: "Agentic workflow vendors are pushing automation breadth and speed.",
      scrimedEdge: "SCRIMED can claim a safer agent posture: continuous review, audit loops, and human approval before external claims or production impact.",
      makeApparentBy: "Show the agent loop as review, evidence aging, claims drift, incident learning, and innovation triage, not uncontrolled automation.",
      buyerProof: "Continuous Review and Audit documents agent roles, loops, innovation tracks, controls, and no-authority language.",
      proofRoutes: [continuousReview.route, "/agents", "/evaluation", operationalEfficiency.route],
      retainedBoundary: "Human-gated agents are not autonomous clinical care, autonomous remediation, legal review replacement, or security monitoring guarantee."
    },
    {
      name: "Buyer-ready product plus services packaging",
      marketPressure: "Mature competitors reduce buying friction with clear product packages, implementation paths, and procurement-ready language.",
      scrimedEdge: "SCRIMED has both product surfaces and scoped services, allowing buyers to start small and expand without a vague custom project.",
      makeApparentBy: "Tie every CTA to a specific offer, price posture, work order, demo, pilot, or diligence packet.",
      buyerProof: "Offerings, Pricing, Service Delivery, Client Onboarding, and Product Console share the same routes and boundaries.",
      proofRoutes: [productServicePortfolio.route, "/pricing", serviceDelivery.route, clientOnboarding.route],
      retainedBoundary: "Packaging is not a signed quote, contract, procurement approval, revenue guarantee, or profit-margin guarantee."
    },
    {
      name: "Mission-aware clinic and enterprise path",
      marketPressure: "Most healthcare AI positioning is either enterprise-only or point-solution-only, leaving community and faith-based clinic sponsors underserved.",
      scrimedEdge: "SCRIMED can speak to enterprise buyers, investors, and mission-led clinics with the same trust, no-PHI, workflow, and diligence discipline.",
      makeApparentBy: "Create audience-specific paths that preserve donor, tax, clinical, privacy, and securities boundaries while showing practical clinic value.",
      buyerProof: "Investor Audience Readiness and Client Onboarding can route angels, private investors, faith-based clinics, and health systems into safe packets.",
      proofRoutes: [investorAudience.route, clientOnboarding.route, "/faithcore", growthEngine.route],
      retainedBoundary: "Mission-aware positioning is not religious endorsement, donor advice, tax advice, clinical authority, securities material, or reimbursement assurance."
    }
  ];

  const improvementPriorities: CompanyImprovementPriority[] = [
    {
      name: "Compress the buyer front door",
      priority: "P0",
      gap: "The product surface is powerful, but first-time buyers need a shorter path from pain to package to next action.",
      unblockMove: "Make assessment, synthetic pilot, and enterprise operating-layer license the dominant three-path CTA across public pages.",
      owner: "Product Console, Growth, Revenue Operations, and Client Onboarding",
      proofRoutes: ["/", productServicePortfolio.route, "/pricing", clientOnboarding.route],
      successSignal: "A buyer can choose the right path in under one page without reading the whole operating map.",
      retainedBoundary: "CTA clarity is not contract approval, signed quote, procurement approval, or revenue assurance."
    },
    {
      name: "Create a revenue proof ladder",
      priority: "P0",
      gap: "Revenue motions exist, but buyer and investor proof needs a cleaner ladder from current safe use to protected enterprise expansion.",
      unblockMove: "Link each revenue builder to accepted proof artifacts, package scope, price-floor control, and blocked claims.",
      owner: "Revenue Operations, Finance, Deal Desk, Product, and Claim Guard",
      proofRoutes: [growthEngine.route, capitalVitality.route, enterpriseBusinessOps.route],
      successSignal: "Every commercial conversation names one revenue builder, one proof artifact, and one retained financial boundary.",
      retainedBoundary: "Revenue proof ladder is not ROI assurance, audited financial reporting, securities material, valuation assurance, or revenue guarantee."
    },
    {
      name: "Promote trust as a buying advantage",
      priority: "P0",
      gap: "SCRIMED has strong boundaries, but the market-facing story must make those controls persuasive rather than defensive.",
      unblockMove: "Place proof-before-risk, Claim Guard, Boundary Matrix, and human-gated release language near commercial CTAs.",
      owner: "TrustOS, Product Marketing, Legal Ops, Security, and Buyer Diligence",
      proofRoutes: ["/trust-center", boundaryResolution.route, limitationsWorkarounds.route, "/qa-claim-guard"],
      successSignal: "Trust language directly supports demo booking, pilot conversion, procurement diligence, and investor confidence.",
      retainedBoundary: "Trust messaging is not certification, legal advice, security assurance, or attack-proof guarantee."
    },
    {
      name: "Package interoperability readiness",
      priority: "P1",
      gap: "Health-record safety is strong, but buyers need a concrete paid path before live connectors are authorized.",
      unblockMove: "Create a standards map, no-PHI fixture, connector questionnaire, and patient-safety acceptance template for every integration inquiry.",
      owner: "Interoperability, Health Records Safety, Clinical Governance, Privacy, and Security",
      proofRoutes: [healthRecords.route, "/interoperability", "/clinical-production-readiness"],
      successSignal: "Integration conversations convert into readiness sprints without implying production connector authority.",
      retainedBoundary: "Interoperability readiness is not PHI authority, EHR writeback approval, payer submission approval, or live-care authority."
    },
    {
      name: "Formalize the enterprise deal desk",
      priority: "P1",
      gap: "Enterprise business controls exist, but they should become mandatory before external proposals, pricing exceptions, or strategic partnerships.",
      unblockMove: "Add a deal-desk checklist with package, scope, price floor, margin, billing, contract, tax, accounting, and blocked-claim decisions.",
      owner: "Finance, Accounting, Tax, Legal Ops, Revenue Operations, and Deal Desk",
      proofRoutes: [enterpriseBusinessOps.route, serviceDelivery.route, "/pilot-deal-room"],
      successSignal: "No enterprise proposal leaves without margin, billing, legal, tax, accounting, and claims review.",
      retainedBoundary: "Deal desk readiness is not legal advice, accounting advice, tax advice, contract approval, or profit guarantee."
    },
    {
      name: "Strengthen protected proof evidence",
      priority: "P1",
      gap: "The public path is strong, but protected buyer proof still depends on human AAL2 execution and release decisions.",
      unblockMove: "Keep protected proof as a controlled release chain with reviewer signoff, recipient control, access logs, and current-state language.",
      owner: "TrustOS, Release Steward, Buyer Diligence, Customer Operations, and Legal Ops",
      proofRoutes: ["/qa-buyer-proof-release", "/buyer-release-control-run", "/pilot-workspace/access"],
      successSignal: "Buyer-specific evidence is shareable only through a traceable, approved, claim-guarded path.",
      retainedBoundary: "Protected proof readiness is not customer permission, production authorization, or public evidence release approval."
    },
    {
      name: "Convert continuous review into paid operations",
      priority: "P2",
      gap: "24/7 review and innovation loops are credible internally, but need a buyer-safe recurring service wrapper.",
      unblockMove: "Offer governed review retainers around evidence aging, claims drift, QA sampling, issue triage, and future research watchlists.",
      owner: "TrustOS, QA, Customer Operations, Internal Research Team, and Finance",
      proofRoutes: [continuousReview.route, operationalEfficiency.route, serviceReliability.route],
      successSignal: "Continuous review becomes a scoped recurring revenue motion without autonomous production authority.",
      retainedBoundary: "Review operations are not managed SOC/MDR, autonomous remediation, certification, or clinical review replacement."
    },
    {
      name: "Build the capital diligence room map",
      priority: "P2",
      gap: "Capital and audience readiness are mapped, but investor diligence needs clearer current-safe metrics, proof inventory, and blocked claims.",
      unblockMove: "Maintain an investor packet index for company narrative, revenue builders, moat signals, current limitations, KPI posture, and qualified-review needs.",
      owner: "Founder, Capital Operations, Finance, Legal Ops, Product Console, and Claim Guard",
      proofRoutes: [investorAudience.route, capitalVitality.route, "/public-market-readiness"],
      successSignal: "Investor conversations stay focused on evidence-backed current capabilities and clearly retained external-review boundaries.",
      retainedBoundary: "Capital diligence map is not securities material, solicitation, investment advice, valuation assurance, or audited financial reporting."
    }
  ];

  const prioritySequence = [
    "Use Company Assessment as the top-level command path before any launch, buyer, investor, service, or protected-proof decision.",
    "Keep Product Console and Offerings as the commercial source of truth.",
    "Send every buyer conversation through Client Onboarding, then Service Delivery or Pilot intake.",
    "Send every enterprise proposal through Enterprise Business Ops and Claim Guard.",
    "Send every regulated, clinical, PHI, certification, privacy, security, reimbursement, or global claim through Approvals, Global Certification, Clinical Authority, Health Records Safety, and Boundary Resolution.",
    "Send every blocked action through Limitations Workarounds and Operational Efficiency.",
    "Send every protected proof release through QA Buyer Proof Release, Buyer Release Control, and AAL2 workspace."
  ];

  return {
    service: "scrimed-company-operating-assessment",
    route: companyAssessmentRoute,
    apiRoute: companyAssessmentApiRoute,
    briefRoute: companyAssessmentBriefRoute,
    status: companyAssessmentStatus,
    briefStatus: companyAssessmentBriefStatus,
    updated: companyAssessmentUpdatedAt,
    boundary: companyAssessmentBoundary,
    authority: companyAssessmentAuthority,
    overallScore,
    readinessBand: readinessBand(overallScore),
    dimensionCount: dimensions.length,
    strongDimensionCount: dimensions.filter((dimension) => dimension.status === "strong").length,
    watchDimensionCount: dimensions.filter((dimension) => dimension.status === "watch").length,
    upgradeNowDimensionCount: dimensions.filter((dimension) => dimension.status === "upgrade-now").length,
    externalReviewDimensionCount: dimensions.filter(
      (dimension) => dimension.status === "external-review-required"
    ).length,
    protectedGatedDimensionCount: dimensions.filter(
      (dimension) => dimension.status === "protected-gated"
    ).length,
    evidenceRouteCount: evidenceRoutes.length,
    hardStopCount: companyAssessmentHardStops.length,
    teamLaneCount: companyAssessmentTeamLanes.length,
    weaknessCount: weaknessReliefQueue.length,
    criticalWeaknessCount: weaknessReliefQueue.filter((weakness) => weakness.severity === "critical").length,
    highWeaknessCount: weaknessReliefQueue.filter((weakness) => weakness.severity === "high").length,
    mediumWeaknessCount: weaknessReliefQueue.filter((weakness) => weakness.severity === "medium").length,
    missingCapabilityClosureCount: missingCapabilityClosures.length,
    criticalMissingCapabilityClosureCount: missingCapabilityClosures.filter(
      (capability) => capability.severity === "critical"
    ).length,
    highMissingCapabilityClosureCount: missingCapabilityClosures.filter(
      (capability) => capability.severity === "high"
    ).length,
    mediumMissingCapabilityClosureCount: missingCapabilityClosures.filter(
      (capability) => capability.severity === "medium"
    ).length,
    upgradeWorkstreamCount: upgradeWorkstreams.length,
    immediateWorkstreamCount: upgradeWorkstreams.filter((workstream) => workstream.horizon === "now").length,
    thirtyDayWorkstreamCount: upgradeWorkstreams.filter(
      (workstream) => workstream.horizon === "30-days"
    ).length,
    sixtyDayWorkstreamCount: upgradeWorkstreams.filter(
      (workstream) => workstream.horizon === "60-days"
    ).length,
    ninetyDayWorkstreamCount: upgradeWorkstreams.filter(
      (workstream) => workstream.horizon === "90-days"
    ).length,
    auditFindingCount: companyAuditFindings.length,
    auditStrengthToAmplifyCount: companyAuditFindings.filter(
      (finding) => finding.rating === "strength-to-amplify"
    ).length,
    auditRevenueUnlockCount: companyAuditFindings.filter(
      (finding) => finding.rating === "revenue-unlock"
    ).length,
    auditGapToCloseCount: companyAuditFindings.filter((finding) => finding.rating === "gap-to-close").length,
    revenueBuilderCount: revenueBuilders.length,
    competitiveEdgeAmplifierCount: competitiveEdgeAmplifiers.length,
    improvementPriorityCount: improvementPriorities.length,
    p0ImprovementPriorityCount: improvementPriorities.filter((priority) => priority.priority === "P0").length,
    p1ImprovementPriorityCount: improvementPriorities.filter((priority) => priority.priority === "P1").length,
    p2ImprovementPriorityCount: improvementPriorities.filter((priority) => priority.priority === "P2").length,
    sourceAlignment: {
      pageRouteCount: navigationAudit.sourceTotals.pageRouteCount,
      apiRoutePatternCount: navigationAudit.sourceTotals.apiRoutePatternCount,
      smokeCoveredHtmlRouteCount: navigationAudit.coverage.smokeCoveredHtmlRouteCount,
      launchTrackCount: launchReadiness.launchTrackCount,
      productOfferCount: productServicePortfolio.offerCount,
      serviceDeliveryOfferCount: serviceDelivery.deliveryOfferCount,
      revenueCapabilityCount: enterpriseBusinessOps.revenueCapabilityCount,
      marginControlCount: enterpriseBusinessOps.marginControlCount,
      platformPowerControlCount: platformPower.controlCount,
      healthRecordsCapabilityCount: healthRecords.capabilityCount,
      certificationTrackCount: globalCertification.trackCount,
      continuousReviewAgentCount: continuousReview.agentCount,
      limitationTrackCount: limitationsWorkarounds.trackCount,
      operationalEfficiencyRecordCount: operationalEfficiency.recordCount,
      competitiveDefenseThreatProfileCount: competitiveDefense.competitorThreatProfileCount,
      investorAudiencePacketCount: investorAudience.audiencePacketCount
    },
    recommendedCompanyPosture:
      "SCRIMED is commercially promotable for no-PHI operating-system assessments, synthetic pilots, service-delivery work orders, buyer diligence, and investor readiness, with strict retained gates for PHI, live clinical care, production connectors, regulated claims, certification, security assurance, customer-specific evidence release, audited financials, valuation, revenue, and profit-margin language.",
    nextCompanyMove:
      "Run the Company Assessment first, then route the decision to Product Console, Offerings, Service Delivery, Enterprise Business Ops, Platform Power, Health Records, Launch Readiness, Approvals, Global Certification, Continuous Review, Workarounds, or protected Buyer Proof Release based on the exact risk and buyer goal.",
    dimensions,
    companyStrengths,
    companyAuditFindings,
    revenueBuilders,
    competitiveEdgeAmplifiers,
    improvementPriorities,
    weaknessReliefQueue,
    missingCapabilityClosures,
    upgradeWorkstreams,
    companyAssessmentTeamLanes,
    hardStops: companyAssessmentHardStops,
    evidenceRoutes,
    prioritySequence,
    summaries: {
      approvals,
      boundaryResolution,
      capitalVitality,
      clientOnboarding,
      competitiveDefense,
      continuousReview,
      enterpriseBusinessOps,
      enterpriseScalability,
      globalCertification,
      growthEngine,
      healthRecords,
      investorAudience,
      launchReadiness,
      limitationsWorkarounds,
      navigationAudit,
      operationalEfficiency,
      platformPower,
      productServicePortfolio,
      publicMarketReadiness,
      releaseContinuity,
      serviceDelivery,
      serviceReliability
    }
  };
}

export function buildCompanyAssessmentBrief() {
  const summary = getCompanyAssessmentSummary();

  return [
    "# SCRIMED Company Operating Assessment Brief",
    "",
    `Status: ${summary.status}`,
    `Updated: ${summary.updated}`,
    `Overall readiness score: ${summary.overallScore}`,
    `Readiness band: ${summary.readinessBand}`,
    `Dimensions: ${summary.dimensionCount}`,
    `Upgrade workstreams: ${summary.upgradeWorkstreamCount}`,
    `Weakness relief items: ${summary.weaknessCount}`,
    `Missing capability closures: ${summary.missingCapabilityClosureCount}`,
    `Whole-company audit findings: ${summary.auditFindingCount}`,
    `Revenue builders: ${summary.revenueBuilderCount}`,
    `Competitive edge amplifiers: ${summary.competitiveEdgeAmplifierCount}`,
    `Improvement priorities: ${summary.improvementPriorityCount}`,
    `Hard stops: ${summary.hardStopCount}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "This brief is not legal advice, accounting advice, tax advice, audited financial reporting, investment advice, securities offering material, solicitation, valuation assurance, certification, security assurance, clinical validation, PHI processing approval, production connector approval, customer permission, public launch approval, contractual SLA, revenue guarantee, profit-margin guarantee, reimbursement assurance, or live clinical care authorization.",
    "",
    "## Company Posture",
    summary.recommendedCompanyPosture,
    "",
    "## Dimensions",
    ...summary.dimensions.map(
      (dimension) =>
        `- ${dimension.name} (${dimension.status}, ${dimension.score}/100): ${dimension.upgrade} Evidence: ${dimension.evidenceSnapshot} Boundary: ${dimension.retainedBoundary}`
    ),
    "",
    "## Strengths",
    ...summary.companyStrengths.map((strength) => `- ${strength}`),
    "",
    "## Whole-Company Audit Findings",
    ...summary.companyAuditFindings.map(
      (finding) =>
        `- ${finding.area} (${finding.rating}): Strength: ${finding.strength} Weakness: ${finding.weakness} Improvement: ${finding.improvement} Revenue impact: ${finding.revenueImpact} Competitive signal: ${finding.competitiveSignal} Boundary: ${finding.retainedBoundary}`
    ),
    "",
    "## Revenue Builders",
    ...summary.revenueBuilders.map(
      (builder) =>
        `- ${builder.name}: Buyer: ${builder.buyer}. Package: ${builder.packageMotion} Margin lever: ${builder.marginLever} Conversion: ${builder.conversionPath} Boundary: ${builder.retainedBoundary}`
    ),
    "",
    "## Competitive Edge Amplifiers",
    ...summary.competitiveEdgeAmplifiers.map(
      (edge) =>
        `- ${edge.name}: Market pressure: ${edge.marketPressure} SCRIMED edge: ${edge.scrimedEdge} Make apparent by: ${edge.makeApparentBy} Buyer proof: ${edge.buyerProof} Boundary: ${edge.retainedBoundary}`
    ),
    "",
    "## Improvement Priorities",
    ...summary.improvementPriorities.map(
      (priority) =>
        `- ${priority.name} (${priority.priority}): Gap: ${priority.gap} Move: ${priority.unblockMove} Owner: ${priority.owner}. Success: ${priority.successSignal} Boundary: ${priority.retainedBoundary}`
    ),
    "",
    "## Weakness Relief Queue",
    ...summary.weaknessReliefQueue.map(
      (weakness) =>
        `- ${weakness.name} (${weakness.severity}): ${weakness.reliefMove} Owner: ${weakness.owner}. Boundary: ${weakness.retainedBoundary}`
    ),
    "",
    "## Missing Capability Closure Register",
    ...summary.missingCapabilityClosures.map(
      (capability) =>
        `- ${capability.capability} (${capability.severity}): Missing impact: ${capability.whyItMatters} Current workaround: ${capability.currentWorkaround} Permanent build: ${capability.permanentBuild} Owner: ${capability.owner}. Success: ${capability.successMetric} Blocked until: ${capability.blockedUntil} Boundary: ${capability.retainedBoundary}`
    ),
    "",
    "## Upgrade Workstreams",
    ...summary.upgradeWorkstreams.map(
      (workstream) =>
        `- ${workstream.name} (${workstream.horizon}): ${workstream.objective} Success: ${workstream.successSignal}`
    ),
    "",
    "## Team Lanes",
    ...summary.companyAssessmentTeamLanes.map(
      (lane) =>
        `- ${lane.team}: ${lane.mandate} Cadence: ${lane.operatingCadence}. Stops: ${lane.approvalStops.join(", ")}`
    ),
    "",
    "## Hard Stops",
    ...summary.hardStops.map((hardStop) => `- ${hardStop}`),
    "",
    "## Priority Sequence",
    ...summary.prioritySequence.map((step) => `- ${step}`),
    "",
    "## Evidence Routes",
    ...summary.evidenceRoutes.map((route) => `- ${route}`)
  ].join("\n");
}
