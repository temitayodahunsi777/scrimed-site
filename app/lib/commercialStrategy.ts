export type PricingTierStatus = "public-preview" | "sellable-now" | "protected-pilot" | "enterprise-license" | "strategic";
export type SalesMotionPhase = "discover" | "evaluate" | "pilot" | "license" | "expand";
export type CommercialPriceCadence = "no-charge" | "one-time" | "annual" | "multi-year";
export type CommercialPricingAuthority =
  | "public-no-charge"
  | "non-binding-planning-range"
  | "human-approved-proposal-required";
export type CommercialEngagementGoal = "assessment" | "synthetic-pilot" | "protected-pilot";

export type CommercialPriceRange = {
  minimumUsd: number;
  maximumUsd: number;
  cadence: CommercialPriceCadence;
  customScope?: boolean;
};

export type ProductAccessRoute = {
  surface: string;
  route: string;
  buyerIntent: string;
  owner: string;
};

export type PricingTier = {
  name: string;
  status: PricingTierStatus;
  recommendedDisplayPrice: string;
  priceRange: CommercialPriceRange;
  pricingAuthority: CommercialPricingAuthority;
  proposalGate: string;
  buyer: string;
  entryCriteria: string[];
  includes: string[];
  successMetric: string;
  expansionPath: string;
  boundary: string;
  primaryAction: {
    label: string;
    href: string;
  };
};

export type SalesMotionStep = {
  phase: SalesMotionPhase;
  name: string;
  route: string;
  buyerAction: string;
  scrimedAction: string;
  qualificationGate: string;
  nextCommitment: string;
};

export type ValueMetric = {
  metric: string;
  whyItMatters: string;
  pricingUse: string;
  guardrail: string;
};

export type CommercialGuardrail = {
  guardrail: string;
  detail: string;
};

export type MarketPricingBenchmark = {
  segment: string;
  publicSignal: string;
  sourceName: string;
  sourceUrl: string;
  lastVerified: string;
  reviewDue: string;
  evidenceStatus: "first-party-public" | "public-research";
  comparisonBoundary: string;
  scrimedImplication: string;
};

export type MarketPricingEvidenceFreshness = "current" | "review-due" | "stale";

export type MarketPricingEvidenceItem = MarketPricingBenchmark & {
  freshness: MarketPricingEvidenceFreshness;
  daysUntilReview: number;
};

export type MarketPricingEvidenceReview = {
  asOfDate: string;
  status: "current" | "review-required";
  currentCount: number;
  reviewDueCount: number;
  staleCount: number;
  competitiveComparisonAllowed: boolean;
  humanReviewRequired: true;
  nextReviewDue: string;
  items: MarketPricingEvidenceItem[];
  decisionRule: string;
};

export type PricingAlignmentDecision = {
  lane: string;
  decision: string;
  rationale: string;
  marginProtection: string;
};

export type PremiumPricingPrinciple = {
  principle: string;
  policy: string;
  rationale: string;
  guardrail: string;
};

export type CommercialReadinessControl = {
  dimension: "value" | "competitive-evidence" | "global-positioning" | "safety" | "privacy" | "governance";
  status: "enforced-in-code" | "evidence-route-available" | "external-review-required";
  currentEvidence: string;
  decisionRule: string;
  proofRoute: string;
};

export type CompetitivePositioningPillar = {
  pillar: string;
  buyerValue: string;
  inspectableProof: string;
  proofRoute: string;
  blockedClaim: string;
};

export type GlobalCommercialProfile = {
  regionProfile: string;
  buyerFit: string;
  entryMotion: string;
  pricingPolicy: string;
  requiredLocalization: string[];
  retainedGates: string[];
  proofRoute: string;
};

export type CommercialValueScenarioInput = {
  engagementGoal: CommercialEngagementGoal;
  annualWorkflowVolume: number;
  baselineMinutesPerWorkflow: number;
  loadedHourlyCostUsd: number;
  eligibleCaptureRate: number;
  expectedEfficiencyRate: number;
  verifiedTaskRate: number;
  plannedSpendUsd: number;
};

export type CommercialValueScenario = {
  status: "value-hypothesis-supported-by-inputs" | "value-hypothesis-not-yet-supported-by-inputs";
  engagementGoal: CommercialEngagementGoal;
  annualManualCostBaselineUsd: number;
  estimatedVerifiedCapacityValueUsd: number;
  estimatedNetPlanningValueUsd: number;
  valueToCostRatio: number;
  estimatedBreakEvenMonths: number | null;
  estimatedVerifiedWorkflowCount: number;
  costPerVerifiedWorkflowUsd: number;
  pricingAuthority: "non-binding-planning-model";
  humanReviewRequired: true;
  assumptions: string[];
  blockedUses: string[];
};

export type CommercialScopeInput = {
  engagementGoal: CommercialEngagementGoal;
  workflowCount: number;
  siteCount: number;
  regionCount: number;
  protectedEnvironmentRequested: boolean;
};

export type CommercialScopeDecision = {
  status: "ready-for-human-scoping" | "scope-mismatch-requires-human-rescoping";
  recommendedTier: string;
  priceRange: CommercialPriceRange;
  reason: string;
  requiredGates: string[];
  bindingQuoteAuthorized: false;
  productionAuthorityGranted: false;
  humanReviewRequired: true;
};

export const commercialBoundary =
  "SCRIMED pricing is a pre-commercial, non-binding planning model for governed synthetic evaluations, readiness assessments, and protected enterprise pilot planning. Displayed ranges are not quotes, contracts, forecasts, or guarantees. Pricing does not imply live clinical execution, autonomous diagnosis, payer submission, EHR writeback, reimbursement outcomes, production medical-record processing, certification, deployment authorization, or customer go-live.";

export const marketPricingBenchmarks: MarketPricingBenchmark[] = [
  {
    segment: "Self-serve clinical documentation",
    publicSignal:
      "Freed publicly starts its AI scribe at $39 per month; this is a narrow self-serve entry point, not an enterprise workflow-program comparison.",
    sourceName: "Freed official website",
    sourceUrl: "https://www.getfreed.ai/",
    lastVerified: "2026-08-01",
    reviewDue: "2026-10-30",
    evidenceStatus: "first-party-public",
    comparisonBoundary:
      "Public list price is a market signal only; plan scope, contractual terms, implementation, and measured outcomes are not assumed equivalent to SCRIMED.",
    scrimedImplication:
      "SCRIMED should not compete as a low-cost per-seat scribe; free demos are the entry point, while paid work is enterprise workflow, governance, interoperability, and proof packaging."
  },
  {
    segment: "Clinician and practice subscriptions",
    publicSignal:
      "Heidi publicly lists a free plan, a $110 per-user monthly Clinician plan, a $180 per-user monthly Practice plan billed annually, and sales-led enterprise options.",
    sourceName: "Heidi official pricing page",
    sourceUrl: "https://www.heidihealth.com/pricing",
    lastVerified: "2026-08-01",
    reviewDue: "2026-10-30",
    evidenceStatus: "first-party-public",
    comparisonBoundary:
      "Self-serve and team subscription prices are not evidence for enterprise implementation, security review, governance, or integration cost.",
    scrimedImplication:
      "Keep public proof friction low, but price multi-workflow evaluation, governance, and buyer-specific diligence as scoped enterprise work rather than a seat bundle."
  },
  {
    segment: "Enterprise clinical intelligence platforms",
    publicSignal:
      "Abridge presents an enterprise clinical-conversation platform with EHR-integrated workflows, linked evidence, governance controls, and a contact-sales motion; no public enterprise list price was observed.",
    sourceName: "Abridge official product page",
    sourceUrl: "https://www.abridge.com/product",
    lastVerified: "2026-08-01",
    reviewDue: "2026-10-30",
    evidenceStatus: "first-party-public",
    comparisonBoundary:
      "Product positioning is observable; customer economics, private contract terms, and clinical performance are not inferred.",
    scrimedImplication:
      "SCRIMED pilot pricing should scale by workflow family, governance burden, evidence depth, implementation complexity, and protected controls, with claims tied to SCRIMED's own proof."
  },
  {
    segment: "Healthcare interoperability infrastructure",
    publicSignal:
      "Redox uses a consultation-led enterprise motion and describes integration scope across EHRs, FHIR, HL7 v2, X12, cloud destinations, security, and managed implementation services.",
    sourceName: "Redox official website",
    sourceUrl: "https://redoxengine.com/",
    lastVerified: "2026-08-01",
    reviewDue: "2026-10-30",
    evidenceStatus: "first-party-public",
    comparisonBoundary:
      "SCRIMED does not inherit Redox connectivity, certifications, uptime, network reach, implementation timelines, or customer proof.",
    scrimedImplication:
      "Connector and production data-exchange work must remain outside standard demonstration and synthetic-pilot ranges until independently scoped, authorized, and priced."
  }
];

export const pricingAlignmentDecisions: PricingAlignmentDecision[] = [
  {
    lane: "Public demos",
    decision: "Keep free, no-PHI, no-account public demos and qualified standard guided demos.",
    rationale: "Market leaders reduce friction with trials or low-cost entry before enterprise review.",
    marginProtection: "Custom prep, questionnaires, buyer-specific proof packets, and diligence release work move into paid scope."
  },
  {
    lane: "Assessments",
    decision:
      "Start at $25K subject to a written scope and named human commercial approval.",
    rationale: "This stays approachable for early buyers without pricing SCRIMED like a commodity seat subscription.",
    marginProtection: "Cap workflow count, meetings, artifacts, and review cycles; discount only by reducing scope."
  },
  {
    lane: "Synthetic pilots",
    decision: "Use custom enterprise scope for synthetic pilots; a named commercial owner and finance reviewer must approve every nonbinding proposal.",
    rationale: "Enterprise pilots should be materially above individual scribe subscriptions while staying below production integration commitments.",
    marginProtection: "Separate custom packets, protected workspaces, integration planning, legal/security diligence, and implementation labor."
  },
  {
    lane: "Protected enterprise pilots",
    decision: "Keep protected pilots custom-scoped and unavailable until insurance, counsel, security/privacy, and deployment prerequisites are evidenced.",
    rationale: "Protected pilots carry security, privacy, tenant, evidence-room, support, and connector-readiness costs.",
    marginProtection: "Separate annual license, services, support, model usage, evidence-room release, connector work, and change orders."
  },
  {
    lane: "Enterprise operating license",
    decision: "Use $1.5M-$6M annual for initial enterprise layer and $6M-$12M+ for multi-department or multi-region expansion.",
    rationale: "This aligns with infrastructure-level value while giving buyers a believable expansion ladder after pilots prove value.",
    marginProtection: "Keep implementation, support, connector, usage, and continuous review retainers out of the base license unless explicitly priced."
  }
];

export const productAccessRoutes: ProductAccessRoute[] = [
  {
    surface: "Official Wix website",
    route: "https://www.scrimedsolutions.com",
    buyerIntent: "Brand discovery, credibility, founder story, high-level product education, and public contact capture.",
    owner: "SCRIMED marketing site"
  },
  {
    surface: "Vercel app subdomain",
    route: "https://app.scrimedsolutions.com",
    buyerIntent: "Product console, AgentOS evaluation, pilot intake, pricing, trust, workflows, and enterprise proof stack.",
    owner: "SCRIMED product platform"
  },
  {
    surface: "Product Console",
    route: "/product",
    buyerIntent: "Inspect sellable offers, workflow examples, proof stack, governance controls, and readiness brief.",
    owner: "Product and sales"
  },
  {
    surface: "Demo Center",
    route: "/demos",
    buyerIntent: "Inspect executable product demos, proof routes, outcome signals, governance boundaries, and production exclusions.",
    owner: "Sales engineering and product"
  },
  {
    surface: "Pilot Programs",
    route: "/pilots",
    buyerIntent: "Compare structured enterprise programs by duration, deliverables, inputs, metrics, gates, and engagement model.",
    owner: "Enterprise sales and delivery"
  },
  {
    surface: "Pilot Deal Room",
    route: "/pilot-deal-room",
    buyerIntent: "Understand how SCRIMED moves from public product proof to sales opportunity, Buyer Pilot Room, audited packet, and paid pilot.",
    owner: "Enterprise sales and product"
  },
  {
    surface: "AgentOS Evaluation Workspace",
    route: "/evaluation",
    buyerIntent: "Run a synthetic workflow packet through AgentOS and Atlas Trust Cards before a sales call.",
    owner: "Sales engineering"
  },
  {
    surface: "Pilot Intake",
    route: "/pilot",
    buyerIntent: "Request an assessment, synthetic pilot, governance audit, or automation blueprint.",
    owner: "Enterprise sales"
  }
];

export const pricingTiers: PricingTier[] = [
  {
    name: "Public Product Preview",
    status: "public-preview",
    recommendedDisplayPrice: "Free public access",
    priceRange: {
      minimumUsd: 0,
      maximumUsd: 0,
      cadence: "no-charge"
    },
    pricingAuthority: "public-no-charge",
    proposalGate: "No quote or contract is created; any buyer-specific work is separately scoped.",
    buyer: "Website visitors, investors, advisors, and early enterprise evaluators",
    entryCriteria: [
      "No account required",
      "No PHI or live data submitted",
      "Buyer is learning SCRIMED's product category and trust posture"
    ],
    includes: [
      "Product Console",
      "AgentOS Evaluation Workspace using synthetic examples",
      "Trust, workflow, pricing, and readiness surfaces",
      "Downloadable readiness brief"
    ],
    successMetric: "Qualified buyer moves from education to pilot intake.",
    expansionPath: "Synthetic Pilot Evaluation",
    boundary: "Public preview is a product education surface, not a live clinical system.",
    primaryAction: {
      label: "Open Product Console",
      href: "/product"
    }
  },
  {
    name: "Workflow Intelligence Assessment",
    status: "sellable-now",
    recommendedDisplayPrice:
      "Starting at $25K, subject to written agreement",
    priceRange: {
      minimumUsd: 25_000,
      maximumUsd: 25_000,
      cadence: "one-time"
    },
    pricingAuthority: "non-binding-planning-range",
    proposalGate: "Founder or delegated commercial owner and finance reviewer approve the exact scoped proposal.",
    buyer: "Hospitals, clinics, payers, and transformation teams validating workflow opportunity before a pilot",
    entryCriteria: [
      "Executive or operational sponsor identified",
      "One to three workflows selected",
      "Buyer can describe current process, constraints, and governance needs"
    ],
    includes: [
      "Workflow friction map",
      "AI readiness and governance review",
      "Interoperability target map",
      "AgentOS evaluation packet",
      "Executive findings call"
    ],
    successMetric: "Buyer approves pilot scope, value hypothesis, and governance gates.",
    expansionPath: "Synthetic Pilot Evaluation or AI Readiness + Governance Audit",
    boundary: "Assessment produces operational intelligence for human leaders; it is not clinical advice.",
    primaryAction: {
      label: "Book Assessment",
      href: "/pilot?offer=workflow-intelligence-assessment"
    }
  },
  {
    name: "Synthetic Pilot Evaluation",
    status: "sellable-now",
    recommendedDisplayPrice:
      "Custom enterprise scope; named human commercial and finance approval required",
    priceRange: {
      minimumUsd: 0,
      maximumUsd: 0,
      cadence: "one-time",
      customScope: true
    },
    pricingAuthority: "non-binding-planning-range",
    proposalGate: "Named sponsor, acceptance criteria, scope cap, commercial approval, and no-PHI boundary are required.",
    buyer: "Enterprise buyers who want to evaluate SCRIMED against synthetic workflows before live integration",
    entryCriteria: [
      "Named sponsor and review team",
      "Synthetic workflow packet approved",
      "Pilot outcome metrics selected",
      "No live PHI or production connector required"
    ],
    includes: [
      "AgentOS orchestration for selected workflows",
      "Atlas Trust Cards and evidence source mapping",
      "Synthetic workflow result packets",
      "Audit and observability report",
      "Production-readiness decision register"
    ],
    successMetric: "Buyer validates workflow value, trust posture, and protected-pilot business case.",
    expansionPath: "Protected Enterprise Pilot",
    boundary: "Synthetic data only; no diagnosis, treatment, payer submission, or patient outreach.",
    primaryAction: {
      label: "Request Pilot",
      href: "/pilot?offer=synthetic-pilot-evaluation"
    }
  },
  {
    name: "Protected Enterprise Pilot",
    status: "protected-pilot",
    recommendedDisplayPrice:
      "Custom scope only after insurance, counsel, security/privacy, and deployment prerequisites",
    priceRange: {
      minimumUsd: 0,
      maximumUsd: 0,
      cadence: "one-time",
      customScope: true
    },
    pricingAuthority: "human-approved-proposal-required",
    proposalGate:
      "Founder, finance, legal, security, privacy, and delivery owners review scope; production and PHI authority remain separate gates.",
    buyer: "Health systems, payers, public-sector programs, and enterprise operators preparing controlled deployment",
    entryCriteria: [
      "Security, privacy, compliance, and legal review underway",
      "BAA and data-boundary decisions defined",
      "Tenant identity and reviewer roles approved",
      "Workflow owner and success baseline confirmed"
    ],
    includes: [
      "Tenant-scoped pilot environment",
      "Role-based review workflows",
      "Connector implementation plan",
      "Durable audit design",
      "Operational outcomes report",
      "Enterprise license proposal"
    ],
    successMetric: "Buyer approves annual operating license, connector scope, and governed production plan.",
    expansionPath: "Enterprise Operating License",
    boundary: "Protected pilot still requires human review and approved controls before any live clinical workflow use.",
    primaryAction: {
      label: "Start Protected Pilot",
      href: "/pilot?offer=clinical-operations-automation-blueprint"
    }
  },
  {
    name: "Enterprise Operating License",
    status: "enterprise-license",
    recommendedDisplayPrice:
      "Initial annual operating layer $1.5M-$6M; multi-department or multi-region expansion $6M-$12M+",
    priceRange: {
      minimumUsd: 1_500_000,
      maximumUsd: 12_000_000,
      cadence: "annual"
    },
    pricingAuthority: "human-approved-proposal-required",
    proposalGate:
      "Validated pilot evidence plus founder, finance, legal, clinical, security, privacy, deployment, and customer authorization are required.",
    buyer: "Large hospitals, payers, government health agencies, and multi-site healthcare organizations",
    entryCriteria: [
      "Protected pilot validated",
      "Approved identity, audit, security, connector, and governance controls",
      "Annual budget owner identified",
      "Expansion workflows prioritized"
    ],
    includes: [
      "SCRIMED AgentOS and Atlas operating layer",
      "Workflow, agent, and connector packages",
      "TrustQA, audit, observability, and governance stack",
      "Enterprise support and implementation cadence",
      "Quarterly value and safety reviews"
    ],
    successMetric: "Multi-workflow expansion with measurable operational value and governed trust posture.",
    expansionPath: "Strategic Platform Partnership",
    boundary: "Production use requires signed controls, approved workflows, and human-review operating procedures.",
    primaryAction: {
      label: "Contact Enterprise Sales",
      href: "/pilot?offer=ai-readiness-governance-audit"
    }
  },
  {
    name: "Strategic Platform Partnership",
    status: "strategic",
    recommendedDisplayPrice: "Multi-year partnerships $8M-$25M+, sales-led, region-aware, and external-review-gated",
    priceRange: {
      minimumUsd: 8_000_000,
      maximumUsd: 25_000_000,
      cadence: "multi-year"
    },
    pricingAuthority: "human-approved-proposal-required",
    proposalGate:
      "Founder, board or delegated authority, finance, counsel, regional reviewers, and counterparties approve exact terms and evidence.",
    buyer: "Governments, national health systems, major payers, strategic hospital networks, and global partners",
    entryCriteria: [
      "Multi-organization mandate",
      "Long-term interoperability, governance, or transformation program",
      "Executive steering committee",
      "Regional compliance and deployment model defined"
    ],
    includes: [
      "Dedicated roadmap alignment",
      "Regional compliance and sovereignty planning",
      "Custom agent and connector strategy",
      "Executive governance reporting",
      "Strategic implementation support"
    ],
    successMetric: "SCRIMED becomes a governed healthcare intelligence infrastructure partner.",
    expansionPath: "Regional or ecosystem-level deployment",
    boundary: "Strategic work remains governed, auditable, human-reviewed, and regionally compliant.",
    primaryAction: {
      label: "Request Strategic Review",
      href: "/pilot?offer=ai-readiness-governance-audit"
    }
  }
];

export const premiumPricingPrinciples: PremiumPricingPrinciple[] = [
  {
    principle: "Protect enterprise price integrity",
    policy: "Use starts-at floors and scoped enterprise ranges; do not publish low monthly plans for the operating layer.",
    rationale:
      "SCRIMED sells governed healthcare intelligence infrastructure, workflow transformation, trust controls, and enterprise proof, not a commodity chatbot seat.",
    guardrail: "Discount only by reducing scope, duration, services, integrations, or support commitments."
  },
  {
    principle: "Price against workflow value and governance scope",
    policy:
      "Anchor fees to workflows under governance, departments served, integrations, support level, security review, and proof-stack depth.",
    rationale:
      "Healthcare buyers pay for measurable operational intelligence, trusted controls, and deployment readiness across high-friction workflows.",
    guardrail: "Measured pilot outcomes are directional business evidence, not guaranteed clinical, payer, or reimbursement outcomes."
  },
  {
    principle: "Separate platform license from implementation services",
    policy:
      "Keep annual platform licensing distinct from assessment, pilot, connector, migration, security, training, and advisory work.",
    rationale:
      "This preserves SCRIMED's long-term platform margin while making complex enterprise delivery transparent to buyers.",
    guardrail: "Live connector, PHI, clinical, payer, or sovereign deployment work requires approved written scope and controls."
  },
  {
    principle: "Move qualified buyers toward multi-year commitments",
    policy:
      "Use paid assessments and synthetic pilots to validate scope, then convert protected pilots into annual or multi-year platform agreements.",
    rationale:
      "Enterprise healthcare transformation compounds through trust, workflow ownership, integrations, and institutional memory.",
    guardrail: "No customer should enter production use without legal, privacy, security, governance, and human-review approvals."
  }
];

export const salesMotion: SalesMotionStep[] = [
  {
    phase: "discover",
    name: "Website to Product",
    route: "https://www.scrimedsolutions.com -> https://app.scrimedsolutions.com/product",
    buyerAction: "Buyer learns the brand on Wix and clicks into the SCRIMED product app.",
    scrimedAction: "Route buyer to Product Console, Pricing, Evaluation, or Pilot Intake.",
    qualificationGate: "Buyer has healthcare workflow, governance, interoperability, or AI readiness need.",
    nextCommitment: "Run evaluation or submit pilot intake."
  },
  {
    phase: "evaluate",
    name: "Self-Guided Product Evaluation",
    route: "/evaluation",
    buyerAction: "Buyer inspects synthetic AgentOS/Atlas outputs without needing Vercel or an account.",
    scrimedAction: "Package product proof around task plans, Trust Cards, audit preview, and observability.",
    qualificationGate: "Buyer confirms one or more high-value workflows and a sponsor.",
    nextCommitment: "Paid assessment or synthetic pilot."
  },
  {
    phase: "pilot",
    name: "Paid Evaluation or Synthetic Pilot",
    route: "/pilot-deal-room",
    buyerAction: "Buyer reviews the Pilot Deal Room, requests scoped assessment or pilot, and acknowledges no-PHI boundary.",
    scrimedAction: "Qualify buyer, define scope, metrics, governance gates, decision criteria, and deal-room packet.",
    qualificationGate: "Sponsor, budget range, workflow owner, review team, and pilot success metrics exist.",
    nextCommitment: "Protected pilot or annual license proposal."
  },
  {
    phase: "license",
    name: "Protected Pilot to Enterprise License",
    route: "/pricing",
    buyerAction: "Buyer reviews implementation, security, compliance, and annual operating model.",
    scrimedAction: "Propose base platform license plus workflow, connector, agent, support, and usage scope.",
    qualificationGate: "BAA, identity, audit, connector, security, and human-review controls approved.",
    nextCommitment: "Annual enterprise agreement."
  },
  {
    phase: "expand",
    name: "Enterprise Expansion",
    route: "/observability",
    buyerAction: "Buyer expands from one workflow to multiple departments, regions, or organizations.",
    scrimedAction: "Use observability, trust metrics, and governance reporting to support expansion.",
    qualificationGate: "Measured value and safety posture remain strong under review.",
    nextCommitment: "Multi-year strategic partnership."
  }
];

export const valueMetrics: ValueMetric[] = [
  {
    metric: "Workflows under governance",
    whyItMatters: "Healthcare buyers buy workflow transformation, not generic AI usage.",
    pricingUse: "Primary enterprise package metric for pilots and annual licenses.",
    guardrail: "Workflow expansion requires approved human-review and audit controls."
  },
  {
    metric: "Agent and service modules enabled",
    whyItMatters: "Sanar AI, DocuTwin, CareExplain, Ambient Scribe, TrialCore, PayerIQ, and future services carry different value and risk.",
    pricingUse: "Module add-ons and tier expansion.",
    guardrail: "No module implies autonomous diagnosis, treatment, payer submission, or patient outreach."
  },
  {
    metric: "Connector and integration scope",
    whyItMatters: "EHR, payer, CRM, knowledge, and analytics connectors drive implementation cost and enterprise value.",
    pricingUse: "Implementation and annual support scope.",
    guardrail: "Live connectors require BAA, tenant identity, audit, security, and approval controls."
  },
  {
    metric: "Evaluation and task volume",
    whyItMatters: "AI-heavy usage should scale with actual activity without surprising buyers.",
    pricingUse: "Usage band or credit pool after pilot validation.",
    guardrail: "Usage pricing should be capped or contracted to preserve buyer trust."
  },
  {
    metric: "Organizations, regions, and departments",
    whyItMatters: "SCRIMED can expand from department workflow to enterprise operating layer.",
    pricingUse: "Enterprise and strategic partnership expansion.",
    guardrail: "Regional compliance, data residency, language, and governance needs must be explicit."
  }
];

export const commercialGuardrails: CommercialGuardrail[] = [
  {
    guardrail: "Do not publish low consumer-style pricing",
    detail:
      "SCRIMED is an enterprise healthcare operating layer. Public pricing should show package ranges or 'starts at' for evaluations, with enterprise pilots handled by sales."
  },
  {
    guardrail: "Sell outcomes as measured pilot signals",
    detail:
      "Use time saved, workflow friction, denial risk, access bottlenecks, documentation quality, and trust completeness as pilot metrics, not unsupported clinical claims."
  },
  {
    guardrail: "Separate public preview from paid pilots",
    detail:
      "Website visitors can inspect the product, but paid assessments and pilots require sponsor, workflow scope, governance needs, and no-PHI acknowledgement."
  },
  {
    guardrail: "Keep medical-device and clinical claims out of sales copy",
    detail:
      "SCRIMED should present as governed operational intelligence until clinical, regulatory, and production execution controls are explicitly approved."
  },
  {
    guardrail: "Use enterprise sales with sales engineering",
    detail:
      "Healthcare buyers need security, compliance, workflow, interoperability, ROI, and trust review before annual license commitment."
  }
];

export const competitivePositioningPillars: CompetitivePositioningPillar[] = [
  {
    pillar: "Governed workflow proof",
    buyerValue:
      "Evaluate a bounded healthcare workflow with policy decisions, review checkpoints, evidence, and outcome definitions before protected implementation.",
    inspectableProof: "Synthetic workflow packets, Trust Cards, audit metadata, and explicit blocked actions.",
    proofRoute: "/evaluation",
    blockedClaim: "No production performance, clinical superiority, or customer outcome is inferred from synthetic proof."
  },
  {
    pillar: "Model-independent control plane",
    buyerValue:
      "Route work by measured task fitness, privacy, latency, cost, and risk without making a single model vendor the product strategy.",
    inspectableProof: "Provider-neutral model registry, route reasons, fallback rules, and no-eligible-model abstention.",
    proofRoute: "/scrimed-compute-fabric",
    blockedClaim: "No provider availability, BAA coverage, residency approval, or model validation is assumed."
  },
  {
    pillar: "Evidence and verification first",
    buyerValue:
      "Make source provenance, uncertainty, human validation, failed checks, and release constraints visible to reviewers.",
    inspectableProof: "Atlas evidence packets, verification gates, benchmark cards, and review queues.",
    proofRoute: "/trust-os",
    blockedClaim: "Governance controls are not a certification, clinical validation, or legal compliance conclusion."
  },
  {
    pillar: "Interoperability readiness without writeback risk",
    buyerValue:
      "Scope FHIR, HL7, DICOM, X12, RIS, HIS, PACS, identity, network, and connector prerequisites before live integration.",
    inspectableProof: "Synthetic conformance fixtures, connector contracts, and minimum-necessary data boundaries.",
    proofRoute: "/interoperability",
    blockedClaim: "No live connector, EHR writeback, payer submission, or exchange participation is authorized."
  },
  {
    pillar: "Workflow breadth with shared governance",
    buyerValue:
      "Apply one oversight model across clinical support, documentation, patient access, research, revenue cycle, and operations.",
    inspectableProof: "Agent registry, tool scopes, approval policies, flight recorder, and outcome taxonomy.",
    proofRoute: "/scrimed-work",
    blockedClaim: "Workflow breadth does not grant autonomous clinical, financial, or external communication authority."
  },
  {
    pillar: "Optional FaithCore separation",
    buyerValue:
      "Offer a user-selected faith-aligned experience where appropriate without changing enterprise clinical logic or access decisions.",
    inspectableProof: "Dedicated FaithCore route, opt-in language, and a faith-neutral Atlas enterprise default.",
    proofRoute: "/faithcore",
    blockedClaim: "FaithCore never influences diagnosis, treatment, eligibility, prioritization, or access to care."
  }
];

export const globalCommercialProfiles: GlobalCommercialProfile[] = [
  {
    regionProfile: "United States health systems and payers",
    buyerFit: "Enterprise workflow, governance, interoperability, access, documentation, and revenue-cycle evaluation.",
    entryMotion: "No-PHI workflow assessment followed by a synthetic pilot with named operational and review owners.",
    pricingPolicy:
      "Use USD planning ranges; separate implementation, connector, security, legal, and protected-environment work from the base scope.",
    requiredLocalization: [
      "state and federal legal review",
      "buyer security and privacy review",
      "payer and EHR contract review",
      "accessible English and buyer-approved language support"
    ],
    retainedGates: ["BAA and data-use authority", "clinical signoff", "production deployment", "payer and EHR actions"],
    proofRoute: "/pilot-demo-commercial-readiness"
  },
  {
    regionProfile: "United Kingdom and European Economic Area",
    buyerFit: "Evidence-led evaluation, public-sector diligence, multilingual workflows, and privacy-sensitive deployment planning.",
    entryMotion: "Synthetic evaluation and localized governance workshop before any protected data or clinical workflow discussion.",
    pricingPolicy:
      "Keep public ranges in USD as planning references; quote currency, taxes, procurement terms, hosting, and residency only after qualified review.",
    requiredLocalization: [
      "country-specific privacy counsel",
      "AI and medical-software intended-use review",
      "data residency and subprocessors",
      "public procurement and accessibility"
    ],
    retainedGates: ["regional legal approval", "data residency", "clinical safety review", "customer deployment authorization"],
    proofRoute: "/global-enterprise-command"
  },
  {
    regionProfile: "Gulf Cooperation Council strategic programs",
    buyerFit: "Sovereignty planning, Arabic and English workflows, health-system modernization, and governed partner evaluation.",
    entryMotion: "Executive no-PHI briefing, local partner qualification, and synthetic interoperability proof.",
    pricingPolicy:
      "Price regional programs by governed workflow scope, localization, sovereign architecture review, implementation, and support; require human-approved proposals.",
    requiredLocalization: [
      "country-specific counsel",
      "Arabic clinical and business review",
      "hosting and sovereignty requirements",
      "authorized channel and procurement structure"
    ],
    retainedGates: ["government procurement", "regional clinical approval", "local hosting authority", "partner authorization"],
    proofRoute: "/global-reach"
  },
  {
    regionProfile: "Resource-constrained and mission-oriented care organizations",
    buyerFit: "Focused workflow assessments, access improvement, documentation burden, education, and local-first readiness.",
    entryMotion: "One no-PHI workflow with a reduced scope, explicit owner, measurable baseline, and optional FaithCore pathway.",
    pricingPolicy:
      "Use the mission-clinic access range only by reducing scope and services; do not weaken safety, privacy, evidence, or review controls.",
    requiredLocalization: [
      "local workflow ownership",
      "language and accessibility",
      "connectivity and device constraints",
      "local legal, clinical, and community review"
    ],
    retainedGates: ["live patient data", "clinical authority", "external funding commitment", "production activation"],
    proofRoute: "/healthcare-value-realization"
  }
];

export const commercialReadinessControls: CommercialReadinessControl[] = [
  {
    dimension: "value",
    status: "evidence-route-available",
    currentEvidence:
      "Synthetic value metrics and a buyer-input planning model calculate cost per verified workflow without presenting an ROI guarantee.",
    decisionRule: "No value claim becomes sales collateral until its baseline, method, owner, and review evidence are recorded.",
    proofRoute: "/healthcare-value-realization"
  },
  {
    dimension: "competitive-evidence",
    status: "evidence-route-available",
    currentEvidence: "Market signals are tied to dated first-party public URLs and explicit comparison boundaries.",
    decisionRule: "Competitor claims inform strategy only; they do not establish SCRIMED performance, parity, or superiority.",
    proofRoute: "/competitive-intelligence"
  },
  {
    dimension: "global-positioning",
    status: "external-review-required",
    currentEvidence: "Regional buyer paths, localization needs, and retained authority gates are mapped for synthetic outreach.",
    decisionRule: "Country-specific pricing, legal, privacy, clinical, procurement, tax, and hosting claims require qualified review.",
    proofRoute: "/global-enterprise-command"
  },
  {
    dimension: "safety",
    status: "enforced-in-code",
    currentEvidence: "Clinical care, diagnosis, treatment, payer submission, EHR writeback, and customer activation remain blocked.",
    decisionRule: "Commercial scope cannot compensate for or bypass a failed safety gate.",
    proofRoute: "/clinical-authority-readiness"
  },
  {
    dimension: "privacy",
    status: "enforced-in-code",
    currentEvidence: "Public pricing and planning use synthetic or business metadata only and do not collect patient information.",
    decisionRule: "Protected data requires separate identity, tenant, purpose, legal, security, privacy, and retention authority.",
    proofRoute: "/trust-center"
  },
  {
    dimension: "governance",
    status: "enforced-in-code",
    currentEvidence: "Pricing ranges are non-binding, proposal approval is human-controlled, and API authority headers fail closed.",
    decisionRule: "Only a named authorized commercial owner may issue a quote, contract, discount, or external commitment.",
    proofRoute: "/scrimed-agent-governance"
  }
];

const tierNameByEngagementGoal: Record<CommercialEngagementGoal, string> = {
  assessment: "Workflow Intelligence Assessment",
  "synthetic-pilot": "Synthetic Pilot Evaluation",
  "protected-pilot": "Protected Enterprise Pilot"
};

function requireFiniteRange(name: string, value: number, minimum: number, maximum: number) {
  if (!Number.isFinite(value) || value < minimum || value > maximum) {
    throw new Error(`${name} must be a finite number between ${minimum} and ${maximum}.`);
  }

  return value;
}

function requireFiniteIntegerRange(name: string, value: number, minimum: number, maximum: number) {
  const boundedValue = requireFiniteRange(name, value, minimum, maximum);

  if (!Number.isSafeInteger(boundedValue)) {
    throw new Error(`${name} must be a whole number between ${minimum} and ${maximum}.`);
  }

  return boundedValue;
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

function parseIsoCalendarDate(value: string, label: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${label} must use YYYY-MM-DD format.`);
  }

  const timestamp = Date.parse(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== value) {
    throw new Error(`${label} must be a valid calendar date.`);
  }

  return timestamp;
}

function currentIsoCalendarDate() {
  return new Date().toISOString().slice(0, 10);
}

export function assessMarketPricingEvidence(
  asOfDate = currentIsoCalendarDate(),
  benchmarks: ReadonlyArray<MarketPricingBenchmark> = marketPricingBenchmarks
): MarketPricingEvidenceReview {
  const asOfTimestamp = parseIsoCalendarDate(asOfDate, "asOfDate");
  const millisecondsPerDay = 24 * 60 * 60 * 1_000;
  const items = benchmarks.map((benchmark) => {
    const lastVerifiedTimestamp = parseIsoCalendarDate(
      benchmark.lastVerified,
      `${benchmark.segment}.lastVerified`
    );
    const reviewDueTimestamp = parseIsoCalendarDate(benchmark.reviewDue, `${benchmark.segment}.reviewDue`);

    if (reviewDueTimestamp < lastVerifiedTimestamp) {
      throw new Error(`${benchmark.segment}.reviewDue cannot precede lastVerified.`);
    }

    const daysUntilReview = Math.ceil((reviewDueTimestamp - asOfTimestamp) / millisecondsPerDay);
    const freshness: MarketPricingEvidenceFreshness =
      daysUntilReview < 0 ? "stale" : daysUntilReview <= 14 ? "review-due" : "current";

    return {
      ...benchmark,
      freshness,
      daysUntilReview
    };
  });
  const currentCount = items.filter((item) => item.freshness === "current").length;
  const reviewDueCount = items.filter((item) => item.freshness === "review-due").length;
  const staleCount = items.filter((item) => item.freshness === "stale").length;
  const nextReviewDue = items
    .map((item) => item.reviewDue)
    .sort((left, right) => left.localeCompare(right))[0] ?? asOfDate;

  return {
    asOfDate,
    status: staleCount === 0 ? "current" : "review-required",
    currentCount,
    reviewDueCount,
    staleCount,
    competitiveComparisonAllowed: staleCount === 0,
    humanReviewRequired: true,
    nextReviewDue,
    items,
    decisionRule:
      "Stale first-party market evidence cannot be used in buyer-facing comparisons or pricing justification until a human owner reverifies the source and updates the evidence date."
  };
}

export function getCommercialPlanningTier(goal: CommercialEngagementGoal) {
  const tier = pricingTiers.find((candidate) => candidate.name === tierNameByEngagementGoal[goal]);

  if (!tier) {
    throw new Error(`No commercial planning tier is configured for ${goal}.`);
  }

  return tier;
}

export function calculateCommercialValueScenario(
  input: CommercialValueScenarioInput
): CommercialValueScenario {
  const annualWorkflowVolume = requireFiniteIntegerRange(
    "annualWorkflowVolume",
    input.annualWorkflowVolume,
    1,
    10_000_000
  );
  const baselineMinutesPerWorkflow = requireFiniteRange(
    "baselineMinutesPerWorkflow",
    input.baselineMinutesPerWorkflow,
    1,
    480
  );
  const loadedHourlyCostUsd = requireFiniteRange(
    "loadedHourlyCostUsd",
    input.loadedHourlyCostUsd,
    1,
    2_000
  );
  const eligibleCaptureRate = requireFiniteRange("eligibleCaptureRate", input.eligibleCaptureRate, 0, 1);
  const expectedEfficiencyRate = requireFiniteRange("expectedEfficiencyRate", input.expectedEfficiencyRate, 0, 1);
  const verifiedTaskRate = requireFiniteRange("verifiedTaskRate", input.verifiedTaskRate, 0, 1);
  const plannedSpendUsd = requireFiniteRange("plannedSpendUsd", input.plannedSpendUsd, 0, 100_000_000);

  getCommercialPlanningTier(input.engagementGoal);

  const annualManualCostBaselineUsd =
    annualWorkflowVolume * (baselineMinutesPerWorkflow / 60) * loadedHourlyCostUsd;
  const estimatedVerifiedWorkflowCount = annualWorkflowVolume * eligibleCaptureRate * verifiedTaskRate;
  const estimatedVerifiedCapacityValueUsd =
    annualManualCostBaselineUsd * eligibleCaptureRate * expectedEfficiencyRate * verifiedTaskRate;
  const estimatedNetPlanningValueUsd = estimatedVerifiedCapacityValueUsd - plannedSpendUsd;
  const valueToCostRatio = plannedSpendUsd > 0 ? estimatedVerifiedCapacityValueUsd / plannedSpendUsd : 0;
  const estimatedBreakEvenMonths =
    estimatedVerifiedCapacityValueUsd > 0 && plannedSpendUsd > 0
      ? plannedSpendUsd / (estimatedVerifiedCapacityValueUsd / 12)
      : null;
  const costPerVerifiedWorkflowUsd =
    estimatedVerifiedWorkflowCount > 0 ? plannedSpendUsd / estimatedVerifiedWorkflowCount : plannedSpendUsd;

  return {
    status:
      estimatedVerifiedCapacityValueUsd >= plannedSpendUsd
        ? "value-hypothesis-supported-by-inputs"
        : "value-hypothesis-not-yet-supported-by-inputs",
    engagementGoal: input.engagementGoal,
    annualManualCostBaselineUsd: roundCurrency(annualManualCostBaselineUsd),
    estimatedVerifiedCapacityValueUsd: roundCurrency(estimatedVerifiedCapacityValueUsd),
    estimatedNetPlanningValueUsd: roundCurrency(estimatedNetPlanningValueUsd),
    valueToCostRatio: Math.round(valueToCostRatio * 100) / 100,
    estimatedBreakEvenMonths:
      estimatedBreakEvenMonths === null ? null : Math.round(estimatedBreakEvenMonths * 10) / 10,
    estimatedVerifiedWorkflowCount: Math.round(estimatedVerifiedWorkflowCount),
    costPerVerifiedWorkflowUsd: roundCurrency(costPerVerifiedWorkflowUsd),
    pricingAuthority: "non-binding-planning-model",
    humanReviewRequired: true,
    assumptions: [
      "All inputs are buyer-provided planning assumptions and have not been independently validated.",
      "Capacity value is not cash savings, revenue, staffing reduction, reimbursement, or audited ROI.",
      "Verified task rate must be measured against agreed acceptance criteria during a governed pilot.",
      "Implementation, integration, security, legal, support, taxes, and change-management costs may be separate."
    ],
    blockedUses: [
      "binding quote or contract",
      "revenue, profit, ROI, reimbursement, or valuation guarantee",
      "staffing reduction decision",
      "clinical, payer, EHR, deployment, or customer activation authority"
    ]
  };
}

export function buildCommercialScopeDecision(input: CommercialScopeInput): CommercialScopeDecision {
  const workflowCount = requireFiniteIntegerRange("workflowCount", input.workflowCount, 1, 100);
  const siteCount = requireFiniteIntegerRange("siteCount", input.siteCount, 1, 1_000);
  const regionCount = requireFiniteIntegerRange("regionCount", input.regionCount, 1, 50);
  const tier = getCommercialPlanningTier(input.engagementGoal);
  const scopeMismatch =
    (input.protectedEnvironmentRequested && input.engagementGoal !== "protected-pilot") ||
    (input.engagementGoal === "assessment" && (workflowCount > 3 || siteCount > 3 || regionCount > 1));

  const requiredGates = [
    "named commercial owner",
    "buyer sponsor and workflow owner",
    "written acceptance criteria",
    "no-PHI intake boundary",
    "human-approved scope and pricing"
  ];

  if (input.protectedEnvironmentRequested || input.engagementGoal === "protected-pilot") {
    requiredGates.push(
      "security and privacy review",
      "legal and data-use review",
      "identity, tenant, audit, retention, and rollback design",
      "separate production and PHI authorization"
    );
  }

  if (regionCount > 1) {
    requiredGates.push("regional counsel, residency, localization, tax, and procurement review");
  }

  return {
    status: scopeMismatch ? "scope-mismatch-requires-human-rescoping" : "ready-for-human-scoping",
    recommendedTier: tier.name,
    priceRange: tier.priceRange,
    reason: scopeMismatch
      ? "Requested scope exceeds the selected planning lane or introduces protected-environment requirements. A human owner must rescope it."
      : `${tier.name} matches the selected engagement goal; exact scope, price, terms, and authority still require human approval.`,
    requiredGates,
    bindingQuoteAuthorized: false,
    productionAuthorityGranted: false,
    humanReviewRequired: true
  };
}

export function getCommercialStrategySummary(asOfDate = currentIsoCalendarDate()) {
  const marketEvidenceReview = assessMarketPricingEvidence(asOfDate);
  const sampleValueScenario = calculateCommercialValueScenario({
    engagementGoal: "synthetic-pilot",
    annualWorkflowVolume: 50_000,
    baselineMinutesPerWorkflow: 25,
    loadedHourlyCostUsd: 75,
    eligibleCaptureRate: 0.8,
    expectedEfficiencyRate: 0.3,
    verifiedTaskRate: 0.8,
    plannedSpendUsd: 237_500
  });

  return {
    service: "scrimed-commercial-strategy",
    route: "/pricing",
    apiRoute: "/api/commercial/pricing",
    status: "commercial-planning-model-active-pre-commercial",
    recommendedModel:
      "Hybrid enterprise model: free public preview, paid assessment, paid synthetic pilot, protected enterprise pilot, annual platform license, and custom strategic partnerships.",
    recommendedAppDomain: "app.scrimedsolutions.com",
    boundary: commercialBoundary,
    authority: {
      pricingAuthority: "non-binding-planning-ranges",
      quoteAuthority: "named-human-commercial-owner-required",
      contractAuthority: "not-granted",
      revenueAuthority: "not-revenue-guarantee",
      roiAuthority: "not-roi-guarantee",
      phiAuthority: "not-authorized-production-phi",
      clinicalCareAuthority: "not-authorized-live-care",
      payerAuthority: "not-authorized",
      ehrWritebackAuthority: "not-authorized",
      productionAuthority: "not-production-authorized",
      customerActivationAuthority: "not-customer-go-live-approval"
    },
    productAccessRoutes,
    pricingTiers,
    premiumPricingPrinciples,
    salesMotion,
    valueMetrics,
    commercialGuardrails,
    marketPricingBenchmarks: marketEvidenceReview.items,
    marketEvidenceReview,
    pricingAlignmentDecisions,
    competitivePositioningPillars,
    globalCommercialProfiles,
    commercialReadinessControls,
    valuePlanner: {
      status: "browser-only-no-data-persistence",
      supportedGoals: Object.keys(tierNameByEngagementGoal) as CommercialEngagementGoal[],
      model: "buyer-input-capacity-value-hypothesis",
      pricingAuthority: "non-binding-planning-model",
      humanReviewRequired: true,
      sampleScenario: sampleValueScenario
    },
    sourceCounts: {
      pricingTierCount: pricingTiers.length,
      marketBenchmarkCount: marketPricingBenchmarks.length,
      currentMarketBenchmarkCount: marketEvidenceReview.currentCount,
      staleMarketBenchmarkCount: marketEvidenceReview.staleCount,
      competitivePillarCount: competitivePositioningPillars.length,
      globalProfileCount: globalCommercialProfiles.length,
      readinessControlCount: commercialReadinessControls.length
    },
    updated: "2026-08-01"
  };
}
