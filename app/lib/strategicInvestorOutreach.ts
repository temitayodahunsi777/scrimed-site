import { getDemoPilotProgramSummary } from "./demoPilotPrograms";
import type { PolicyDecision } from "./scrimed-work/p32Contracts";

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

export type StrategicInvestorTargetId = StrategicOutreachTarget["id"];

export type StrategicMeetingAgendaItem = {
  minute: number;
  topic: string;
  decision: string;
};

export type StrategicMeetingDemoStep = {
  order: number;
  route: string;
  show: string;
  prove: string;
  boundary: string;
};

export type StrategicMeetingQuestion = {
  question: string;
  evidenceAnswer: string;
  proofRoutes: string[];
  disclosureBoundary: string;
};

export type StrategicInvestorMeetingProfile = {
  targetId: StrategicInvestorTargetId;
  organization: string;
  packetStatus: "internal-meeting-preparation-ready-external-release-review-required";
  evidenceAsOf: string;
  engagementLane: string;
  fundingPathStatus: "no-public-direct-investment-application-verified";
  firstMeetingObjective: string;
  firstMeetingNonGoal: string;
  openingNarrative: string;
  currentOfficialSignals: Array<{
    signal: string;
    officialSource: string;
    scrimedImplication: string;
  }>;
  agenda: StrategicMeetingAgendaItem[];
  demoSequence: StrategicMeetingDemoStep[];
  diligenceQuestions: StrategicMeetingQuestion[];
  specificAsk: string;
  mutualNextStep: string;
  releaseRequirements: string[];
  forbiddenClaims: string[];
  externalReleaseAuthorized: false;
};

export type StrategicFundingReadinessControl = {
  id: string;
  title: string;
  status: "evidence-ready" | "qualified-review-required" | "external-evidence-required";
  owner: string;
  requiredEvidence: string;
  blocksFundraisingRelease: boolean;
  completionRule: string;
};

export type InvestorEngagementAction =
  | "prepare-internal-materials"
  | "public-discovery-conversation"
  | "share-public-demo-links"
  | "submit-startup-program-application"
  | "share-investor-deck"
  | "open-diligence-room"
  | "securities-solicitation";

export type InvestorEngagementEvidence = {
  evidenceClass: "synthetic-readiness-preview" | "verified-operator-evidence";
  publicClaimsGuardPassed: boolean;
  publicMaterialsOnly: boolean;
  founderApprovalRecorded: boolean;
  cleanCandidate: boolean;
  namedReviewerApprovalRecorded: boolean;
  candidateFingerprint: string | null;
  sourceFingerprint: string | null;
  reviewPacketFingerprint: string | null;
  investorDeckFingerprint: string | null;
  investorDeckFounderApproved: boolean;
  investorDeckCounselApproved: boolean;
  investorDeckFinanceApproved: boolean;
  releaseStewardApprovalRecorded: boolean;
  customerEvidenceIncluded: boolean;
  customerEvidencePermissionRecorded: boolean;
  securitiesCounselApprovalRecorded: boolean;
};

export type InvestorEngagementDecision = {
  action: InvestorEngagementAction;
  decision: PolicyDecision;
  readiness:
    | "internal-preparation-ready"
    | "public-discovery-ready-human-controlled"
    | "candidate-review-required"
    | "qualified-review-required";
  reasonCodes: string[];
  allowedAssets: string[];
  blockedAssets: string[];
  humanApprovalRequired: boolean;
  externalActionExecuted: false;
  candidateBinding: {
    required: boolean;
    verified: boolean;
    candidateFingerprint: string | null;
    sourceFingerprint: string | null;
    reviewPacketFingerprint: string | null;
    investorDeckFingerprint: string | null;
  };
  retainedBoundaries: string[];
};

export const strategicInvestorOutreachStatus =
  "strategic-investor-outreach-packets-research-ready-no-solicitation";
export const strategicInvestorOutreachUpdatedAt = "2026-07-30";
export const strategicInvestorOutreachBoundary =
  "SCRIMED Strategic Investor Outreach is an internal, evidence-based preparation layer. It does not imply that any named organization has reviewed, endorsed, partnered with, funded, accepted, or committed to SCRIMED. Official startup and partner programs are ecosystem paths, not assumed investment offers. External decks, financial claims, valuation language, customer proof, securities communications, and partnership terms require founder approval plus qualified legal, finance, accounting, customer-permission, and claim review as applicable.";

export const strategicOutreachTargets: StrategicOutreachTarget[] = [
  {
    id: "openai",
    organization: "OpenAI",
    targetType: "strategic-ecosystem",
    relationshipPath: "Startup ecosystem first, followed by healthcare technical discovery when evidence fit is established",
    officialProgram: "OpenAI for Startups",
    officialSource: "https://openai.com/startups",
    strategicFit:
      "Governed, model-agnostic healthcare workflow orchestration can demonstrate how frontier reasoning is bounded by evidence, verification, human approval, and durable audit controls.",
    proofThesis:
      "SCRIMED is not a chatbot wrapper; it is a healthcare intelligence control plane that can route frontier models without assigning them autonomous clinical authority.",
    specificAsk:
      "Request startup-community access, a healthcare technical-fit conversation, architecture feedback, and the correct permissioned path for future commercial or strategic engagement. Do not lead with an unsupported direct-investment request.",
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

const strategicMeetingAgenda: StrategicMeetingAgendaItem[] = [
  { minute: 0, topic: "Context and decision goal", decision: "Confirm why this meeting is relevant and what a useful next step would be." },
  { minute: 3, topic: "Healthcare workflow wedge", decision: "Establish the bounded workflow problem and the first buyer." },
  { minute: 8, topic: "Governed product proof", decision: "Show working no-PHI workflow, evidence, verification, and human review controls." },
  { minute: 17, topic: "Architecture and strategic fit", decision: "Test where the target's platform, ecosystem, or expertise creates mutual leverage." },
  { minute: 24, topic: "Diligence gaps and milestones", decision: "State what is proven, what is modeled, and what external evidence remains." },
  { minute: 28, topic: "Specific ask and owner", decision: "Agree one permissioned follow-up, evidence owner, and target date." }
];

const strategicMeetingDemoSequence: StrategicMeetingDemoStep[] = [
  {
    order: 1,
    route: "/documentation-before-authorization",
    show: "A bounded documentation-before-authorization workflow that detects evidence gaps before a human-reviewed draft.",
    prove: "SCRIMED begins with a measurable administrative workflow instead of an unbounded assistant.",
    boundary: "No payer submission, medical-necessity determination, reimbursement assurance, or live member data."
  },
  {
    order: 2,
    route: "/scrimed-work",
    show: "Definition-of-done, scoped agents, model routing, approval checkpoints, verification, and artifact evidence.",
    prove: "The product is an orchestration and governance control plane rather than a single-model chat surface.",
    boundary: "Synthetic/no-PHI execution only; consequential actions remain disabled."
  },
  {
    order: 3,
    route: "/clinical-assurance-control-plane",
    show: "Model passports, clinical assurance levels, kill switches, worst-cell evaluation, and independent fallback rules.",
    prove: "Provider flexibility cannot silently weaken privacy, evidence, or safety requirements.",
    boundary: "Internal readiness controls are not external certification, clinical validation, or live-PHI authority."
  },
  {
    order: 4,
    route: "/investor-readiness",
    show: "The diligence snapshot, retained NO-GO boundaries, evidence inventory, and remaining approval path.",
    prove: "SCRIMED reports limitations explicitly instead of converting a demo into an unsupported production claim.",
    boundary: "Diligence readiness is not customer proof, audited financial reporting, or fundraising approval."
  }
];

const strategicDiligenceQuestions: StrategicMeetingQuestion[] = [
  {
    question: "What is the narrow entry wedge?",
    evidenceAnswer:
      "Documentation-before-authorization is the initial bounded workflow: detect missing evidence, assemble a review packet, and preserve human ownership before any payer action.",
    proofRoutes: ["/documentation-before-authorization", "/pricing"],
    disclosureBoundary: "No payer submission, approval-rate claim, savings guarantee, or production customer claim."
  },
  {
    question: "What is defensible beyond model access?",
    evidenceAnswer:
      "The defensible layer is workflow structure, policy-aware context, evidence lineage, reviewer decisions, evaluation history, interoperability contracts, and cost-per-accepted-outcome routing.",
    proofRoutes: ["/scrimed-work", "/trust-os", "/interoperability"],
    disclosureBoundary: "Do not claim exclusive data, patent protection, network effects, or proprietary customer outcomes without evidence."
  },
  {
    question: "What works today?",
    evidenceAnswer:
      "No-PHI workflows, typed control planes, protected reviewer lifecycles, deterministic policy tests, public smoke coverage, and production builds are inspectable now.",
    proofRoutes: ["/investor-readiness", "/demos", "/clinical-robustness-lab"],
    disclosureBoundary: "Working synthetic proof is not live clinical validation, production connector approval, certification, or customer go-live."
  },
  {
    question: "How will capital change the risk profile?",
    evidenceAnswer:
      "Capital is intended to convert modeled readiness into permissioned pilot evidence, independent security assurance, clinical and regulatory review, enterprise integrations, and repeatable distribution.",
    proofRoutes: ["/capital-vitality", "/approvals-readiness"],
    disclosureBoundary: "Amounts, runway, instrument, valuation, dilution, and milestone commitments require founder, finance, accounting, and counsel approval."
  }
];

const defaultReleaseRequirements = [
  "Founder approves the company-specific thesis, meeting objective, and exact ask.",
  "Qualified counsel approves securities posture, deck legends, outreach language, and data-room access.",
  "Finance or accounting owner reconciles the use-of-funds model, runway, unit economics, and source assumptions.",
  "Release steward binds the packet to an immutable revision and approves every protected evidence reference.",
  "Customer, clinical, security, regulatory, and outcome claims remain omitted unless permissioned evidence and the named approval exist."
];

export const strategicInvestorMeetingProfiles: StrategicInvestorMeetingProfile[] = [
  {
    targetId: "openai",
    organization: "OpenAI",
    packetStatus: "internal-meeting-preparation-ready-external-release-review-required",
    evidenceAsOf: "2026-07-18",
    engagementLane: "OpenAI for Startups community, followed by a healthcare technical-fit conversation and a permissioned strategic introduction",
    fundingPathStatus: "no-public-direct-investment-application-verified",
    firstMeetingObjective:
      "Earn technical and healthcare ecosystem interest by showing a governed workflow operating layer that can productively use frontier intelligence without granting autonomous clinical authority.",
    firstMeetingNonGoal:
      "Do not treat the first conversation as a cold direct-investment solicitation or imply access to OpenAI Startup Fund, OpenAI healthcare customers, endorsements, or partnership authority.",
    openingNarrative:
      "SCRIMED is building a healthcare intelligence operating system for work that must be evidence-backed, reviewable, and reversible. Our first wedge is documentation-before-authorization: we detect missing evidence and prepare a governed draft before any human-owned payer action. Underneath it is a model-agnostic control plane for context, agent permissions, verification, clinical assurance, durable audit, and cost per accepted outcome. Today the proof is synthetic and no-PHI by design. We are seeking technical feedback, healthcare ecosystem fit, and the right permissioned path to convert this foundation into measured enterprise pilots.",
    currentOfficialSignals: [
      {
        signal: "OpenAI for Startups emphasizes builder resources, technical sessions, community, and VC-network benefits rather than a general direct-investment application.",
        officialSource: "https://openai.com/startups",
        scrimedImplication: "Lead with a technically credible build and a focused request for ecosystem access; keep any financing discussion separate and permissioned."
      },
      {
        signal: "OpenAI for Healthcare emphasizes secure enterprise AI, administrative-work reduction, and custom healthcare solutions.",
        officialSource: "https://openai.com/index/openai-for-healthcare/",
        scrimedImplication: "Demonstrate complementary workflow governance, evidence, interoperability, and human-review infrastructure rather than a generic healthcare assistant."
      },
      {
        signal: "OpenAI's healthcare implementation materials condition PHI use on the applicable agreement, eligible services, approved configuration, and customer controls.",
        officialSource: "https://help.openai.com/en/articles/20001069-hipaa-eligible-products-and-functionality",
        scrimedImplication: "Keep the meeting demo no-PHI and describe any future OpenAI PHI route as unavailable until contract, configuration, policy, and tenant approvals are retained."
      }
    ],
    agenda: strategicMeetingAgenda,
    demoSequence: strategicMeetingDemoSequence,
    diligenceQuestions: strategicDiligenceQuestions,
    specificAsk:
      "Connect SCRIMED with the appropriate startup and healthcare technical team for architecture feedback, evaluation guidance, and a defined path to a permissioned pilot or strategic diligence conversation if the evidence meets the bar.",
    mutualNextStep:
      "Agree a 45-minute technical review with one OpenAI healthcare or startup ecosystem owner, SCRIMED's founder, and SCRIMED's platform/safety owner; send only the counsel-approved no-PHI architecture and evidence packet in advance.",
    releaseRequirements: defaultReleaseRequirements,
    forbiddenClaims: [
      "OpenAI is investing in SCRIMED",
      "SCRIMED is an OpenAI partner",
      "OpenAI has validated SCRIMED",
      "Any HIPAA certification claim",
      "SCRIMED may process PHI through OpenAI today",
      "SCRIMED provides autonomous clinical care"
    ],
    externalReleaseAuthorized: false
  },
  {
    targetId: "nvidia",
    organization: "NVIDIA",
    packetStatus: "internal-meeting-preparation-ready-external-release-review-required",
    evidenceAsOf: "2026-07-18",
    engagementLane: "NVIDIA Inception application and healthcare, edge, private-inference, and benchmarking technical discovery",
    fundingPathStatus: "no-public-direct-investment-application-verified",
    firstMeetingObjective: "Validate SCRIMED's fit for Inception and identify a bounded healthcare compute, edge, or model-evaluation collaboration path.",
    firstMeetingNonGoal: "Do not imply Inception acceptance, NVIDIA investment, hardware validation, medical-device status, or a production deployment relationship.",
    openingNarrative:
      "SCRIMED is building a governed healthcare compute and workflow layer that routes frontier, open-weight, private, and edge models by evidence, risk, privacy, latency, and cost per accepted outcome. Our no-PHI product proof shows how healthcare work can use accelerated inference without granting models final clinical authority. We are seeking Inception fit, technical guidance on private and edge deployment, and a measurable benchmark collaboration path.",
    currentOfficialSignals: [
      {
        signal: "NVIDIA Inception is a free startup program providing technical, ecosystem, and growth resources without requiring current NVIDIA GPU use.",
        officialSource: "https://www.nvidia.com/en-us/startups/",
        scrimedImplication: "Apply with a working website, technical architecture, benchmark plan, and precise accelerated-computing use cases."
      }
    ],
    agenda: strategicMeetingAgenda,
    demoSequence: strategicMeetingDemoSequence,
    diligenceQuestions: strategicDiligenceQuestions,
    specificAsk: "Confirm Inception eligibility and identify technical reviewers for healthcare inference, private deployment, edge runtime, and benchmark methodology.",
    mutualNextStep: "Submit a reviewed Inception application and schedule one architecture review around a synthetic benchmark workload.",
    releaseRequirements: defaultReleaseRequirements,
    forbiddenClaims: ["NVIDIA is investing in SCRIMED", "SCRIMED is an NVIDIA partner", "NVIDIA has validated SCRIMED", "SCRIMED is a medical device"],
    externalReleaseAuthorized: false
  },
  {
    targetId: "anthropic",
    organization: "Anthropic",
    packetStatus: "internal-meeting-preparation-ready-external-release-review-required",
    evidenceAsOf: "2026-07-18",
    engagementLane: "Startup and partner ecosystem discovery centered on governed MCP, tool safety, and long-running agent reliability",
    fundingPathStatus: "no-public-direct-investment-application-verified",
    firstMeetingObjective: "Test technical fit around controlled agentic healthcare work, prompt-injection resistance, MCP authorization, and independent verification.",
    firstMeetingNonGoal: "Do not imply startup-program acceptance, Anthropic investment, partner status, exclusive provider alignment, or model safety certification.",
    openingNarrative:
      "SCRIMED is a healthcare-specific agent control plane for work where retrieved content is untrusted, tools are permissioned, and no model can certify its own result. We combine scoped identities, MCP-style tool authorization, evidence-bound artifacts, human approval, loop guards, and durable review. We are seeking technical safety feedback and the correct startup or partner path for a bounded synthetic evaluation.",
    currentOfficialSignals: [
      {
        signal: "Anthropic publishes startup-program terms and partner pathways for eligible organizations.",
        officialSource: "https://www.anthropic.com/startup-program-official-terms",
        scrimedImplication: "Use the official eligibility path and lead with governed MCP and agent-safety evidence rather than assumed partnership access."
      }
    ],
    agenda: strategicMeetingAgenda,
    demoSequence: strategicMeetingDemoSequence,
    diligenceQuestions: strategicDiligenceQuestions,
    specificAsk: "Request startup-program eligibility guidance and a technical safety review of SCRIMED's governed tool and verification architecture.",
    mutualNextStep: "Run a synthetic agent-safety benchmark review with named owners and no external tool writes.",
    releaseRequirements: defaultReleaseRequirements,
    forbiddenClaims: ["Anthropic is investing in SCRIMED", "SCRIMED is an Anthropic partner", "Anthropic has validated SCRIMED", "Claude is clinically authorized by SCRIMED"],
    externalReleaseAuthorized: false
  },
  {
    targetId: "microsoft",
    organization: "Microsoft",
    packetStatus: "internal-meeting-preparation-ready-external-release-review-required",
    evidenceAsOf: "2026-07-18",
    engagementLane: "Microsoft for Startups and healthcare ecosystem discovery around identity, interoperability, governed deployment, and enterprise distribution",
    fundingPathStatus: "no-public-direct-investment-application-verified",
    firstMeetingObjective: "Validate startup-program and healthcare ecosystem fit for a model-agnostic, enterprise-governed workflow platform.",
    firstMeetingNonGoal: "Do not imply Microsoft investment, startup acceptance, Azure certification, marketplace approval, or customer procurement authority.",
    openingNarrative:
      "SCRIMED turns fragmented healthcare work into governed, evidence-backed sessions with explicit identity, tenant isolation, interoperability context, review gates, and rollback. The platform is model- and cloud-agnostic, while preserving a clear future path for approved enterprise infrastructure. We are seeking startup-program guidance and a healthcare architecture discussion focused on identity, FHIR-ready workflows, deployment controls, and enterprise go-to-market.",
    currentOfficialSignals: [
      {
        signal: "Microsoft for Startups provides technical and business enablement through eligibility-based programs and regional accelerators.",
        officialSource: "https://www.microsoft.com/en/startups/ai",
        scrimedImplication: "Present a working technical product, enterprise deployment map, and precise Azure-compatible roadmap without creating cloud lock-in claims."
      }
    ],
    agenda: strategicMeetingAgenda,
    demoSequence: strategicMeetingDemoSequence,
    diligenceQuestions: strategicDiligenceQuestions,
    specificAsk: "Confirm startup-program eligibility and identify healthcare architecture, marketplace-readiness, and enterprise go-to-market owners for a bounded review.",
    mutualNextStep: "Complete an architecture review and agree the evidence needed for a synthetic health-system pilot pathway.",
    releaseRequirements: defaultReleaseRequirements,
    forbiddenClaims: ["Microsoft is investing in SCRIMED", "SCRIMED is a Microsoft partner", "SCRIMED is Azure certified", "SCRIMED is marketplace approved"],
    externalReleaseAuthorized: false
  }
];

export const strategicFundingReadinessControls: StrategicFundingReadinessControl[] = [
  {
    id: "category-and-wedge",
    title: "Category thesis, entry wedge, and strategic fit",
    status: "evidence-ready",
    owner: "Founder + Product Strategy",
    requiredEvidence: "One-sentence category, one bounded workflow wedge, target-specific fit, and working no-PHI proof routes.",
    blocksFundraisingRelease: false,
    completionRule: "Founder approves one narrative and removes unsupported market-leadership language."
  },
  {
    id: "product-and-technical-proof",
    title: "Working product and technical diligence",
    status: "evidence-ready",
    owner: "Product + Engineering",
    requiredEvidence: "Current build, deterministic tests, architecture, model-routing rationale, review lifecycle, and evidence artifacts.",
    blocksFundraisingRelease: false,
    completionRule: "Every demo claim links to an inspectable route or retained test result."
  },
  {
    id: "safety-and-boundaries",
    title: "Clinical safety, privacy, and claims boundary",
    status: "evidence-ready",
    owner: "Clinical Safety + TrustOps",
    requiredEvidence: "NO-GO boundaries, human review, fail-closed controls, no-PHI demo posture, and approval-path registry.",
    blocksFundraisingRelease: false,
    completionRule: "Claim Guard approves every clinical, privacy, security, interoperability, and production statement."
  },
  {
    id: "financial-model",
    title: "Reconciled financial model and capital plan",
    status: "qualified-review-required",
    owner: "Founder + qualified Finance/Accounting",
    requiredEvidence: "Historical actuals, assumptions, use of funds, runway, hiring plan, unit economics, scenarios, and source notes.",
    blocksFundraisingRelease: true,
    completionRule: "Finance owner signs the model version used in the deck and data room."
  },
  {
    id: "securities-and-entity",
    title: "Entity, IP, cap table, and securities path",
    status: "qualified-review-required",
    owner: "Founder + qualified Counsel",
    requiredEvidence: "Entity records, IP assignments, cap table, option or equity records, fundraising exemption, legends, and outreach rules.",
    blocksFundraisingRelease: true,
    completionRule: "Counsel approves the intended audience, instrument, process, legends, and controlled data-room terms."
  },
  {
    id: "customer-and-outcome-proof",
    title: "Permissioned customer, pilot, and outcome evidence",
    status: "external-evidence-required",
    owner: "Pilot Operations + Customer Sponsor + Analytics",
    requiredEvidence: "Customer permission, cohort definition, baseline, measured results, limitations, reviewer signoff, and claim scope.",
    blocksFundraisingRelease: true,
    completionRule: "Only approved measured evidence enters the external deck; synthetic or modeled evidence remains labeled."
  },
  {
    id: "independent-assurance",
    title: "Independent security, clinical, and regulatory assurance",
    status: "external-evidence-required",
    owner: "Security + Clinical Governance + Privacy/Regulatory Counsel",
    requiredEvidence: "Independent security testing, risk review, intended-use analysis, validation plan, and control-owner attestations.",
    blocksFundraisingRelease: true,
    completionRule: "External evidence is attached without converting readiness into certification or clearance claims."
  },
  {
    id: "immutable-release-provenance",
    title: "Immutable packet provenance and release authorization",
    status: "qualified-review-required",
    owner: "Release Steward + Founder",
    requiredEvidence: "Clean immutable revision, packet hash, source manifest, protected-artifact approvals, recipient scope, and access controls.",
    blocksFundraisingRelease: true,
    completionRule: "The released deck, brief, financial model, and diligence manifest resolve to the same approved revision."
  }
];

const publicDiscoveryActions = new Set<InvestorEngagementAction>([
  "public-discovery-conversation",
  "share-public-demo-links",
  "submit-startup-program-application"
]);

const candidateBoundActions = new Set<InvestorEngagementAction>([
  "share-investor-deck",
  "open-diligence-room",
  "securities-solicitation"
]);

const retainedInvestorBoundaries = [
  "No PHI, secrets, raw connector payloads, protected customer evidence, or security-sensitive internals.",
  "No investment, endorsement, partnership, customer, certification, clinical-validation, or production-readiness implication.",
  "No external communication, application submission, deck distribution, data-room access, or securities activity without the required human authority.",
  "Candidate review, legal review, finance review, clinical boundaries, and production NO-GO controls remain independent gates."
];

function isSha256(value: string | null) {
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
}

export function evaluateInvestorEngagementAction(
  action: InvestorEngagementAction,
  evidence: InvestorEngagementEvidence
): InvestorEngagementDecision {
  const candidateBindingRequired = candidateBoundActions.has(action);
  const candidateBindingVerified =
    evidence.evidenceClass === "verified-operator-evidence" &&
    evidence.cleanCandidate &&
    evidence.namedReviewerApprovalRecorded &&
    isSha256(evidence.candidateFingerprint) &&
    isSha256(evidence.sourceFingerprint) &&
    isSha256(evidence.reviewPacketFingerprint);
  const deckBindingVerified =
    isSha256(evidence.investorDeckFingerprint) &&
    evidence.investorDeckFounderApproved &&
    evidence.investorDeckCounselApproved &&
    evidence.investorDeckFinanceApproved &&
    evidence.releaseStewardApprovalRecorded;
  const reasonCodes: string[] = [];

  if (action === "prepare-internal-materials") {
    return {
      action,
      decision: "ALLOW",
      readiness: "internal-preparation-ready",
      reasonCodes: ["INTERNAL_PREPARATION_ONLY", "NO_EXTERNAL_ACTION"],
      allowedAssets: [
        "Internal target research",
        "Internal meeting notes",
        "Synthetic demo rehearsal",
        "Draft milestone and use-of-funds questions"
      ],
      blockedAssets: [
        "Externally released investor deck",
        "Controlled diligence room",
        "Securities terms",
        "Protected customer evidence"
      ],
      humanApprovalRequired: false,
      externalActionExecuted: false,
      candidateBinding: {
        required: false,
        verified: false,
        candidateFingerprint: evidence.candidateFingerprint,
        sourceFingerprint: evidence.sourceFingerprint,
        reviewPacketFingerprint: evidence.reviewPacketFingerprint,
        investorDeckFingerprint: evidence.investorDeckFingerprint
      },
      retainedBoundaries: retainedInvestorBoundaries
    };
  }

  if (!evidence.publicClaimsGuardPassed) {
    reasonCodes.push("PUBLIC_CLAIMS_GUARD_REQUIRED");
  }

  if (publicDiscoveryActions.has(action) && !evidence.publicMaterialsOnly) {
    reasonCodes.push("PUBLIC_MATERIALS_ONLY_REQUIRED");
  }

  if (
    action === "submit-startup-program-application" &&
    !evidence.founderApprovalRecorded
  ) {
    reasonCodes.push("FOUNDER_APPLICATION_APPROVAL_REQUIRED");
  }

  if (candidateBindingRequired && !candidateBindingVerified) {
    reasonCodes.push("CLEAN_CANDIDATE_AND_NAMED_REVIEW_REQUIRED");
  }

  if (candidateBindingRequired && !deckBindingVerified) {
    reasonCodes.push("FINGERPRINT_BOUND_DECK_APPROVALS_REQUIRED");
  }

  if (
    candidateBindingRequired &&
    evidence.customerEvidenceIncluded &&
    !evidence.customerEvidencePermissionRecorded
  ) {
    reasonCodes.push("CUSTOMER_EVIDENCE_PERMISSION_REQUIRED");
  }

  if (
    action === "securities-solicitation" &&
    !evidence.securitiesCounselApprovalRecorded
  ) {
    reasonCodes.push("SECURITIES_COUNSEL_APPROVAL_REQUIRED");
  }

  const hardBlocked =
    reasonCodes.includes("PUBLIC_CLAIMS_GUARD_REQUIRED") ||
    reasonCodes.includes("PUBLIC_MATERIALS_ONLY_REQUIRED") ||
    reasonCodes.includes("CLEAN_CANDIDATE_AND_NAMED_REVIEW_REQUIRED") ||
    reasonCodes.includes("FINGERPRINT_BOUND_DECK_APPROVALS_REQUIRED") ||
    reasonCodes.includes("CUSTOMER_EVIDENCE_PERMISSION_REQUIRED") ||
    reasonCodes.includes("SECURITIES_COUNSEL_APPROVAL_REQUIRED");
  const decision: PolicyDecision = hardBlocked ? "BLOCK" : "REQUIRE_HUMAN";
  const readiness = hardBlocked
    ? reasonCodes.includes("CLEAN_CANDIDATE_AND_NAMED_REVIEW_REQUIRED")
      ? "candidate-review-required"
      : "qualified-review-required"
    : publicDiscoveryActions.has(action)
      ? "public-discovery-ready-human-controlled"
      : "qualified-review-required";

  if (!hardBlocked) {
    reasonCodes.push(
      publicDiscoveryActions.has(action)
        ? "HUMAN_CONTROLLED_PUBLIC_DISCOVERY"
        : "EXTERNAL_RELEASE_REQUIRES_SCOPED_HUMAN_ACTION"
    );
  }

  return {
    action,
    decision,
    readiness,
    reasonCodes,
    allowedAssets:
      decision === "BLOCK"
        ? []
        : publicDiscoveryActions.has(action)
          ? [
              "Published SCRIMED demo routes",
              "Published SCRIMED pilot routes",
              "Published trust and safety boundaries",
              "Human-reviewed non-confidential meeting agenda"
            ]
          : [
              "Exact fingerprint-bound investor deck",
              "Exact fingerprint-bound diligence manifest",
              "Permissioned evidence approved for the named recipient"
            ],
    blockedAssets: [
      "PHI or patient data",
      "Secrets or credentials",
      "Unreviewed financial or valuation claims",
      "Unpermissioned customer evidence",
      "Unreviewed source or security-sensitive artifacts",
      "Production, clinical-validation, certification, or partnership claims"
    ],
    humanApprovalRequired: true,
    externalActionExecuted: false,
    candidateBinding: {
      required: candidateBindingRequired,
      verified: candidateBindingVerified && deckBindingVerified,
      candidateFingerprint: evidence.candidateFingerprint,
      sourceFingerprint: evidence.sourceFingerprint,
      reviewPacketFingerprint: evidence.reviewPacketFingerprint,
      investorDeckFingerprint: evidence.investorDeckFingerprint
    },
    retainedBoundaries: retainedInvestorBoundaries
  };
}

export function getParallelFundingTrack() {
  const demoPilotSummary = getDemoPilotProgramSummary();
  const previewEvidence: InvestorEngagementEvidence = {
    evidenceClass: "synthetic-readiness-preview",
    publicClaimsGuardPassed: true,
    publicMaterialsOnly: true,
    founderApprovalRecorded: false,
    cleanCandidate: false,
    namedReviewerApprovalRecorded: false,
    candidateFingerprint: null,
    sourceFingerprint: null,
    reviewPacketFingerprint: null,
    investorDeckFingerprint: null,
    investorDeckFounderApproved: false,
    investorDeckCounselApproved: false,
    investorDeckFinanceApproved: false,
    releaseStewardApprovalRecorded: false,
    customerEvidenceIncluded: false,
    customerEvidencePermissionRecorded: false,
    securitiesCounselApprovalRecorded: false
  };

  return {
    status: "parallel-pre-fundraise-and-candidate-review",
    evidenceClass: previewEvidence.evidenceClass,
    boundary:
      "This deterministic preview demonstrates policy behavior. It is not current approval evidence and must be reevaluated with exact operator-supplied fingerprints before any external release.",
    commercialProof: {
      status: demoPilotSummary.status,
      executableDemoCount: demoPilotSummary.executableDemos,
      pilotCount: demoPilotSummary.pilotCount,
      sellableSyntheticPilotCount: demoPilotSummary.sellableNow,
      protectedPilotCount: demoPilotSummary.protectedPilots,
      proofRoutes: [
        demoPilotSummary.demoRoute,
        demoPilotSummary.pilotRoute,
        "/pilot-demo-commercial-readiness"
      ],
      retainedBoundary: demoPilotSummary.boundary
    },
    decisions: [
      evaluateInvestorEngagementAction("prepare-internal-materials", previewEvidence),
      evaluateInvestorEngagementAction("public-discovery-conversation", previewEvidence),
      evaluateInvestorEngagementAction("share-public-demo-links", previewEvidence),
      evaluateInvestorEngagementAction("submit-startup-program-application", previewEvidence),
      evaluateInvestorEngagementAction("share-investor-deck", previewEvidence),
      evaluateInvestorEngagementAction("open-diligence-room", previewEvidence)
    ],
    controls: {
      candidateReviewContinues: true,
      publicDiscoveryMustRemainHumanControlled: true,
      externalOutreachSent: false,
      startupApplicationSubmitted: false,
      investorDeckReleased: false,
      diligenceRoomOpened: false,
      securitiesSolicitationAuthorized: false
    },
    sequence: [
      "Continue clean-candidate preparation and named independent review.",
      "Prepare target research, meeting agendas, and synthetic demo rehearsals internally.",
      "Permit a named human to conduct public-safe discovery using published routes after rerunning Claim Guard.",
      "Block deck distribution and diligence until clean candidate, named review, deck approvals, and exact fingerprints exist.",
      "Keep any securities process behind founder and qualified-counsel authorization."
    ]
  };
}

export function getStrategicInvestorMeetingProfile(targetId: string) {
  return strategicInvestorMeetingProfiles.find((profile) => profile.targetId === targetId) ?? null;
}

export function buildStrategicInvestorMeetingBrief(targetId: string) {
  const profile = getStrategicInvestorMeetingProfile(targetId);

  if (!profile) {
    return null;
  }

  const target = strategicOutreachTargets.find((candidate) => candidate.id === profile.targetId);

  return [
    `# SCRIMED ${profile.organization} Meeting Preparation Brief`,
    "",
    `Status: ${profile.packetStatus}`,
    `Evidence current as of: ${profile.evidenceAsOf}`,
    `Engagement lane: ${profile.engagementLane}`,
    `Funding path: ${profile.fundingPathStatus}`,
    "",
    "## Objective",
    profile.firstMeetingObjective,
    "",
    "## Non-Goal",
    profile.firstMeetingNonGoal,
    "",
    "## Opening Narrative",
    profile.openingNarrative,
    "",
    "## Verified Strategic Signals",
    ...profile.currentOfficialSignals.map(
      (signal) => `- ${signal.signal} Source: ${signal.officialSource} SCRIMED implication: ${signal.scrimedImplication}`
    ),
    "",
    "## Thirty-Minute Agenda",
    ...profile.agenda.map((item) => `- Minute ${item.minute}: ${item.topic}. Decision: ${item.decision}`),
    "",
    "## Demo Sequence",
    ...profile.demoSequence.map(
      (step) => `${step.order}. ${step.route}: ${step.show} Proof: ${step.prove} Boundary: ${step.boundary}`
    ),
    "",
    "## Diligence Questions",
    ...profile.diligenceQuestions.map(
      (item) => `- ${item.question} ${item.evidenceAnswer} Proof: ${item.proofRoutes.join(", ")} Boundary: ${item.disclosureBoundary}`
    ),
    "",
    "## Specific Ask",
    profile.specificAsk,
    "",
    "## Mutual Next Step",
    profile.mutualNextStep,
    "",
    "## Release Requirements",
    ...profile.releaseRequirements.map((requirement) => `- ${requirement}`),
    "",
    "## Forbidden Claims",
    ...profile.forbiddenClaims.map((claim) => `- ${claim}`),
    "",
    "## Presentation Architecture",
    ...strategicPitchOutline.map(
      (slide) => `${slide.order}. ${slide.title}: ${slide.decisionQuestion} Proof: ${slide.proofRoutes.join(", ")} Guard: ${slide.claimGuard}`
    ),
    "",
    "## Official Program Path",
    target ? `${target.officialProgram}: ${target.officialSource}` : "No target path found.",
    "",
    "External release authorized: no",
    "No outreach has been sent. No investment, endorsement, partnership, customer relationship, clinical validation, certification, or production approval is implied."
  ].join("\n");
}

export function getStrategicInvestorOutreachSummary() {
  const parallelFundingTrack = getParallelFundingTrack();
  const statusCounts = strategicDiligenceManifest.reduce(
    (counts, item) => ({ ...counts, [item.status]: counts[item.status] + 1 }),
    {
      "evidence-ready": 0,
      "qualified-review-required": 0,
      "external-evidence-required": 0
    } satisfies Record<DiligenceManifestStatus, number>
  );
  const fundingStatusCounts = strategicFundingReadinessControls.reduce(
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
    meetingPacketCount: strategicInvestorMeetingProfiles.length,
    fundingControlCount: strategicFundingReadinessControls.length,
    fundingEvidenceReadyCount: fundingStatusCounts["evidence-ready"],
    fundingReleaseBlockerCount: strategicFundingReadinessControls.filter(
      (control) => control.blocksFundraisingRelease
    ).length,
    targets: strategicOutreachTargets,
    diligenceManifest: strategicDiligenceManifest,
    pitchOutline: strategicPitchOutline,
    outreachStages: strategicOutreachStages,
    meetingProfiles: strategicInvestorMeetingProfiles,
    fundingReadinessControls: strategicFundingReadinessControls,
    parallelFundingTrack,
    meetingPacketRoute: "/api/investor-audience-readiness/meeting-packet",
    meetingPreparationReady: true,
    externalFundraisingReleaseAuthorized: false,
    externalOutreachSent: false,
    investmentOrPartnershipImplied: false
  };
}
