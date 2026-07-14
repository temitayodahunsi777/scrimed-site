export type StrategicOutreachTarget = {
  id: "openai" | "nvidia" | "anthropic" | "microsoft";
  organization: string;
  targetType: "strategic-ecosystem";
  relationshipPath: string;
  officialProgram: string;
  officialSource: string;
  strategicFit: string;
  proofThesis: string;
  specificAsk: string;
  proofRoutes: string[];
  diligenceRequirements: string[];
  outreachStatus: "research-ready" | "packet-review-required";
  claimBoundary: string;
};

export type DiligenceManifestStatus =
  | "evidence-ready"
  | "qualified-review-required"
  | "external-evidence-required";

export type StrategicDiligenceManifestItem = {
  id: string;
  category:
    | "company"
    | "product"
    | "safety"
    | "security"
    | "commercial"
    | "finance"
    | "legal"
    | "clinical-regulatory";
  title: string;
  status: DiligenceManifestStatus;
  evidenceRoutes: string[];
  owner: string;
  nextEvidence: string;
  disclosureBoundary: string;
};

export type StrategicPitchSlide = {
  order: number;
  title: string;
  decisionQuestion: string;
  proofRoutes: string[];
  claimGuard: string;
};

export type StrategicOutreachStage = {
  order: number;
  stage: string;
  owner: string;
  exitEvidence: string;
  humanApprovalRequired: true;
};

export const strategicInvestorOutreachStatus =
  "strategic-investor-outreach-packets-research-ready-no-solicitation";
export const strategicInvestorOutreachUpdatedAt = "2026-07-13";
export const strategicInvestorOutreachBoundary =
  "SCRIMED Strategic Investor Outreach is an internal, evidence-based preparation layer. It does not imply that any named organization has reviewed, endorsed, partnered with, funded, accepted, or committed to SCRIMED. Official startup and partner programs are ecosystem paths, not assumed investment offers. External decks, financial claims, valuation language, customer proof, securities communications, and partnership terms require founder approval plus qualified legal, finance, accounting, customer-permission, and claim review as applicable.";

export const strategicOutreachTargets: StrategicOutreachTarget[] = [
  {
    id: "openai",
    organization: "OpenAI",
    targetType: "strategic-ecosystem",
    relationshipPath: "Startup ecosystem and healthcare technology discovery",
    officialProgram: "OpenAI for Startups and OpenAI for Healthcare",
    officialSource: "https://openai.com/business/why-openai/startups/",
    strategicFit:
      "Governed, model-agnostic healthcare workflow orchestration can demonstrate how frontier reasoning is bounded by evidence, verification, human approval, and durable audit controls.",
    proofThesis:
      "SCRIMED is not a chatbot wrapper; it is a healthcare intelligence control plane that can route frontier models without assigning them autonomous clinical authority.",
    specificAsk:
      "Request a startup or healthcare ecosystem fit conversation, technical architecture feedback, and the correct path for future commercial or strategic engagement.",
    proofRoutes: [
      "/scrimed-work",
      "/clinical-robustness-lab",
      "/trust-os",
      "/documentation-before-authorization"
    ],
    diligenceRequirements: [
      "Provider-neutral architecture diagram",
      "Clinical safety and no-PHI boundary evidence",
      "Evaluation and verification results",
      "Measured pilot economics methodology"
    ],
    outreachStatus: "packet-review-required",
    claimBoundary:
      "Do not imply OpenAI investment, endorsement, healthcare validation, model exclusivity, or provider approval."
  },
  {
    id: "nvidia",
    organization: "NVIDIA",
    targetType: "strategic-ecosystem",
    relationshipPath: "NVIDIA Inception startup application and healthcare AI technical discovery",
    officialProgram: "NVIDIA Inception",
    officialSource: "https://www.nvidia.com/en-us/startups/",
    strategicFit:
      "SCRIMED's private and edge compute roadmap, imaging metadata layer, model benchmarking, and healthcare deployment profiles align with accelerated inference and governed hospital infrastructure needs.",
    proofThesis:
      "The strategic wedge is an auditable healthcare compute fabric spanning cloud, customer VPC, air-gapped, and edge deployment modes without claiming final imaging interpretation.",
    specificAsk:
      "Prepare an Inception application and request technical guidance on healthcare inference, edge deployment, benchmarking, and partner ecosystem fit.",
    proofRoutes: [
      "/enterprise-healthcare-infrastructure",
      "/scrimed-clinical-benchmark-suite",
      "/interoperability",
      "/investor-readiness"
    ],
    diligenceRequirements: [
      "Compute and deployment architecture",
      "Benchmark methodology",
      "Edge/private inference threat model",
      "GPU economics assumptions labeled as modeled"
    ],
    outreachStatus: "research-ready",
    claimBoundary:
      "Do not imply NVIDIA investment, Inception acceptance, hardware validation, medical-device capability, or production deployment approval."
  },
  {
    id: "anthropic",
    organization: "Anthropic",
    targetType: "strategic-ecosystem",
    relationshipPath: "Startup program and partner ecosystem discovery",
    officialProgram: "Anthropic Startup Program and Claude Partner Network",
    officialSource: "https://www.anthropic.com/startup-program-official-terms",
    strategicFit:
      "SCRIMED's governed MCP gateway, agent policy controls, prompt-injection defenses, verification-first orchestration, and long-running work sessions align with dependable enterprise agent deployment.",
    proofThesis:
      "SCRIMED can be a healthcare-specific proof point for controlled agentic work where retrieved content is untrusted and every consequential action is independently reviewed.",
    specificAsk:
      "Request program eligibility guidance, technical safety feedback, and the appropriate path for future partner or startup engagement.",
    proofRoutes: [
      "/scrimed-work",
      "/scrimed-agent-governance",
      "/scrimed-trustops",
      "/trust-center"
    ],
    diligenceRequirements: [
      "MCP and tool-permission architecture",
      "Agent evaluation and loop-guard evidence",
      "Prompt-injection threat controls",
      "Human approval and rollback evidence"
    ],
    outreachStatus: "packet-review-required",
    claimBoundary:
      "Do not imply Anthropic investment, program acceptance, partner status, model safety certification, or exclusive provider alignment."
  },
  {
    id: "microsoft",
    organization: "Microsoft",
    targetType: "strategic-ecosystem",
    relationshipPath: "Microsoft for Startups and healthcare partner discovery",
    officialProgram: "Microsoft for Startups",
    officialSource: "https://www.microsoft.com/en/startups/ai",
    strategicFit:
      "SCRIMED's enterprise identity, interoperability, governed deployment, buyer diligence, and health-system workflow architecture can map to future Azure-aligned pilots without creating a cloud dependency.",
    proofThesis:
      "The partnership story is enterprise healthcare workflow intelligence with tenant isolation, FHIR-ready context, security evidence, and staged deployment controls.",
    specificAsk:
      "Prepare a startup application and request architecture, marketplace, healthcare ecosystem, and enterprise go-to-market guidance.",
    proofRoutes: [
      "/interoperability",
      "/enterprise-healthcare-infrastructure",
      "/enterprise-business-ops",
      "/pilot-demo-commercial-readiness"
    ],
    diligenceRequirements: [
      "Enterprise deployment diagram",
      "Identity and tenant-isolation evidence",
      "Interoperability conformance roadmap",
      "Procurement and pilot activation plan"
    ],
    outreachStatus: "research-ready",
    claimBoundary:
      "Do not imply Microsoft investment, startup acceptance, Azure certification, marketplace approval, customer deployment, or procurement approval."
  }
];

export const strategicDiligenceManifest: StrategicDiligenceManifestItem[] = [
  {
    id: "company-narrative",
    category: "company",
    title: "One-company narrative and strategic wedge",
    status: "evidence-ready",
    evidenceRoutes: ["/investor-readiness", "/healthcare-intelligence-os", "/product"],
    owner: "Founder + Product Strategy",
    nextEvidence: "Approve a concise category thesis and one primary entry workflow for every meeting.",
    disclosureBoundary: "No trillion-dollar valuation, market leadership, or guaranteed-growth claim."
  },
  {
    id: "product-proof",
    category: "product",
    title: "Working product, PayerIQ workflow, and governed work control plane",
    status: "evidence-ready",
    evidenceRoutes: ["/documentation-before-authorization", "/scrimed-work", "/demos"],
    owner: "Product + Engineering",
    nextEvidence: "Retain deterministic smoke, build, and durable lifecycle evidence for each outreach packet.",
    disclosureBoundary: "Synthetic/no-PHI product evidence is not live clinical or payer production proof."
  },
  {
    id: "safety-governance",
    category: "safety",
    title: "Clinical boundaries, human review, verification, and rollback",
    status: "evidence-ready",
    evidenceRoutes: ["/trust-os", "/clinical-robustness-lab", "/risk-register"],
    owner: "Clinical Safety + TrustOps",
    nextEvidence: "Attach current NO-GO boundaries and the approval-path matrix to the diligence room.",
    disclosureBoundary: "No autonomous diagnosis, treatment, prescribing, imaging interpretation, or live-care authority."
  },
  {
    id: "security-assurance",
    category: "security",
    title: "AAL2, RBAC, tenant isolation, immutable evidence, and secure SDLC",
    status: "external-evidence-required",
    evidenceRoutes: ["/trust-center", "/pilot-workspace/access", "/buyer-release-control-run"],
    owner: "Security + Platform",
    nextEvidence: "Complete independent penetration testing, evidence review, incident exercises, and approved control-owner attestations.",
    disclosureBoundary: "Security readiness is not SOC 2, HIPAA certification, penetration-test assurance, or zero-risk status."
  },
  {
    id: "commercial-proof",
    category: "commercial",
    title: "Pilot offer, ICP, pricing logic, sales motion, and measured outcome plan",
    status: "qualified-review-required",
    evidenceRoutes: ["/pilot-demo-commercial-readiness", "/pricing", "/growth-engine"],
    owner: "Revenue + Finance",
    nextEvidence: "Replace modeled assumptions with permissioned cohort metrics and a finance-reviewed measurement methodology.",
    disclosureBoundary: "No customer, revenue, savings, reimbursement, conversion, or margin guarantee."
  },
  {
    id: "financial-package",
    category: "finance",
    title: "Use of funds, runway, unit economics, cap table, and scenario model",
    status: "qualified-review-required",
    evidenceRoutes: ["/capital-vitality", "/public-market-readiness", "/enterprise-business-ops"],
    owner: "Founder + qualified Finance/Accounting",
    nextEvidence: "Prepare a reconciled model, source assumptions, cap table, and board-approved use-of-funds plan.",
    disclosureBoundary: "No audited-financial, valuation, return, revenue, or profitability assurance."
  },
  {
    id: "legal-fundraising",
    category: "legal",
    title: "Entity, IP, securities path, privacy terms, and investor disclosures",
    status: "qualified-review-required",
    evidenceRoutes: ["/enterprise-business-ops", "/approvals-readiness"],
    owner: "Founder + qualified Counsel",
    nextEvidence: "Complete entity/IP review and approve the offering exemption, deck legends, data-room access, and outreach language.",
    disclosureBoundary: "This registry is not legal advice, an offer to sell securities, or solicitation."
  },
  {
    id: "clinical-regulatory-path",
    category: "clinical-regulatory",
    title: "Intended use, clinical validation, privacy, interoperability, and regulatory path",
    status: "external-evidence-required",
    evidenceRoutes: ["/clinical-authority-readiness", "/clinical-production-readiness", "/interoperability"],
    owner: "Clinical Governance + Privacy + Regulatory Counsel",
    nextEvidence: "Approve intended-use boundaries and execute the required validation, privacy, security, interoperability, and regulatory workstream before claims expand.",
    disclosureBoundary: "No FDA clearance, HIPAA certification, clinical validation, production connector approval, or customer go-live claim."
  }
];

export const strategicPitchOutline: StrategicPitchSlide[] = [
  { order: 1, title: "SCRIMED", decisionQuestion: "Why healthcare needs an intelligence operating system instead of another chatbot", proofRoutes: ["/healthcare-intelligence-os"], claimGuard: "State the category thesis, not market leadership." },
  { order: 2, title: "The workflow problem", decisionQuestion: "Where clinical and administrative work loses time, evidence, and continuity", proofRoutes: ["/documentation-before-authorization"], claimGuard: "Use sourced market context; do not fabricate buyer pain or outcomes." },
  { order: 3, title: "The entry wedge", decisionQuestion: "Why documentation-before-authorization is a measurable, bounded starting point", proofRoutes: ["/documentation-before-authorization", "/pricing"], claimGuard: "Draft and review only; no payer submission authority." },
  { order: 4, title: "The product", decisionQuestion: "How SCRIMED turns registered evidence into governed work artifacts", proofRoutes: ["/scrimed-work", "/product"], claimGuard: "Demonstrate synthetic/no-PHI behavior only." },
  { order: 5, title: "Architecture", decisionQuestion: "How models, agents, context, tools, verification, and approvals remain separable", proofRoutes: ["/scrimed-work", "/interoperability"], claimGuard: "Do not claim unavailable provider or connector integrations." },
  { order: 6, title: "Trust and safety", decisionQuestion: "Why consequential actions fail closed", proofRoutes: ["/trust-os", "/risk-register"], claimGuard: "Readiness controls are not certification or clinical validation." },
  { order: 7, title: "Proof", decisionQuestion: "What works now and what remains gated", proofRoutes: ["/investor-readiness", "/clinical-robustness-lab"], claimGuard: "Separate synthetic evidence, protected evidence, modeled metrics, and measured results." },
  { order: 8, title: "Market and buyer", decisionQuestion: "Who buys first, why, and through which pilot", proofRoutes: ["/market-activation", "/pilot-demo-commercial-readiness"], claimGuard: "No unsupported TAM, customer, pipeline, or conversion claim." },
  { order: 9, title: "Business model", decisionQuestion: "How pricing captures workflow value while protecting margin", proofRoutes: ["/pricing", "/enterprise-business-ops"], claimGuard: "Label assumptions; no revenue or profitability guarantee." },
  { order: 10, title: "Defensibility", decisionQuestion: "How healthcare workflow structure, evidence, governance, and outcome learning compound", proofRoutes: ["/trust-os", "/scrimed-work"], claimGuard: "Do not claim patent, exclusivity, or proprietary-data rights without evidence." },
  { order: 11, title: "Milestones and capital", decisionQuestion: "What the next capital tranche de-risks", proofRoutes: ["/capital-vitality", "/approvals-readiness"], claimGuard: "Use counsel- and finance-reviewed use-of-funds language." },
  { order: 12, title: "Strategic fit", decisionQuestion: "Why this organization is the right ecosystem or strategic counterpart", proofRoutes: ["/investor-audience-readiness"], claimGuard: "Make a specific ask without implying endorsement, partnership, or investment." }
];

export const strategicOutreachStages: StrategicOutreachStage[] = [
  { order: 1, stage: "Evidence-room gap review", owner: "Founder + Diligence Owner", exitEvidence: "Every manifest item has an owner, source, status, and disclosure boundary.", humanApprovalRequired: true },
  { order: 2, stage: "Company-specific packet", owner: "Founder + Product Marketing", exitEvidence: "One thesis, one ask, four to six proof routes, and named blocked claims are approved.", humanApprovalRequired: true },
  { order: 3, stage: "Legal and finance review", owner: "Qualified Counsel + Finance/Accounting", exitEvidence: "Deck legends, securities path, financial model, and external claims are approved for intended use.", humanApprovalRequired: true },
  { order: 4, stage: "Warm-introduction mapping", owner: "Founder + Strategic Partnerships", exitEvidence: "A permissioned introducer or official program path is selected with no automated outreach.", humanApprovalRequired: true },
  { order: 5, stage: "Meeting and technical diligence", owner: "Founder + Product + Security", exitEvidence: "Questions, evidence requests, owners, and follow-up dates are recorded without sharing protected material prematurely.", humanApprovalRequired: true },
  { order: 6, stage: "Learning-loop update", owner: "Founder + TrustOps", exitEvidence: "Feedback changes a reviewed artifact, test, narrative, or milestone; no autonomous public update.", humanApprovalRequired: true }
];

export function getStrategicInvestorOutreachSummary() {
  const statusCounts = strategicDiligenceManifest.reduce(
    (counts, item) => ({ ...counts, [item.status]: counts[item.status] + 1 }),
    {
      "evidence-ready": 0,
      "qualified-review-required": 0,
      "external-evidence-required": 0
    } satisfies Record<DiligenceManifestStatus, number>
  );

  return {
    status: strategicInvestorOutreachStatus,
    updated: strategicInvestorOutreachUpdatedAt,
    boundary: strategicInvestorOutreachBoundary,
    targetCount: strategicOutreachTargets.length,
    diligenceItemCount: strategicDiligenceManifest.length,
    evidenceReadyCount: statusCounts["evidence-ready"],
    qualifiedReviewRequiredCount: statusCounts["qualified-review-required"],
    externalEvidenceRequiredCount: statusCounts["external-evidence-required"],
    pitchSlideCount: strategicPitchOutline.length,
    outreachStageCount: strategicOutreachStages.length,
    targets: strategicOutreachTargets,
    diligenceManifest: strategicDiligenceManifest,
    pitchOutline: strategicPitchOutline,
    outreachStages: strategicOutreachStages,
    externalOutreachSent: false,
    investmentOrPartnershipImplied: false
  };
}
