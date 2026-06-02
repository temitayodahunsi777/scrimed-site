export type PricingTierStatus = "public-preview" | "sellable-now" | "protected-pilot" | "enterprise-license" | "strategic";
export type SalesMotionPhase = "discover" | "evaluate" | "pilot" | "license" | "expand";

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

export const commercialBoundary =
  "SCRIMED pricing and sales motions currently sell governed synthetic evaluations, readiness assessments, and protected enterprise pilots. Pricing does not imply live clinical execution, autonomous diagnosis, payer submission, reimbursement guarantees, or production medical-record processing.";

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
    recommendedDisplayPrice: "Recommended range: $15k-$35k fixed fee",
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
    recommendedDisplayPrice: "Recommended range: $35k-$95k for 30-90 days",
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
    recommendedDisplayPrice: "Recommended range: $150k-$400k for 90-180 days",
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
    recommendedDisplayPrice: "Annual license: custom, recommended floor $300k+",
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
    recommendedDisplayPrice: "Custom multi-year partnership",
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
    route: "/pilot",
    buyerAction: "Buyer requests scoped assessment or pilot and acknowledges no-PHI boundary.",
    scrimedAction: "Qualify buyer, define scope, metrics, governance gates, and decision criteria.",
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

export function getCommercialStrategySummary() {
  return {
    service: "scrimed-commercial-strategy",
    route: "/pricing",
    apiRoute: "/api/commercial/pricing",
    status: "pricing-and-sales-motion-ready",
    recommendedModel:
      "Hybrid enterprise model: free public preview, paid assessment, paid synthetic pilot, protected enterprise pilot, annual platform license, and custom strategic partnerships.",
    recommendedAppDomain: "app.scrimedsolutions.com",
    boundary: commercialBoundary,
    productAccessRoutes,
    pricingTiers,
    salesMotion,
    valueMetrics,
    commercialGuardrails,
    updated: "2026-06-02"
  };
}
