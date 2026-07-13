export type OmegaAuditLens =
  | "architecture"
  | "technical-debt"
  | "performance"
  | "security"
  | "clinical-safety"
  | "accessibility"
  | "scalability"
  | "maintainability"
  | "reliability"
  | "user-experience"
  | "developer-experience"
  | "compliance";

export type OmegaProductStatus =
  | "implemented-surface"
  | "mapped-capability"
  | "protected-gated"
  | "future-roadmap";

export type OmegaProductCategory =
  | "operating-system"
  | "clinical-ai"
  | "patient-engagement"
  | "documentation"
  | "research"
  | "imaging"
  | "payer-rcm"
  | "operations"
  | "trust-governance"
  | "dashboard"
  | "education"
  | "platform";

export type OmegaClinicalRisk = "low" | "medium" | "high" | "critical";

export type OmegaAuditLensDefinition = {
  lens: OmegaAuditLens;
  question: string;
  minimumStandard: string;
  failClosedBoundary: string;
};

export type OmegaProductSeed = {
  slug: string;
  name: string;
  category: OmegaProductCategory;
  status: OmegaProductStatus;
  clinicalRisk: OmegaClinicalRisk;
  primaryBuyers: string[];
  currentSurfaces: string[];
  linkedRoutes: string[];
  linkedApis: string[];
  coreCapabilities: string[];
  aiAgents: string[];
  workflows: string[];
  dataBoundary: string;
  strongestAsset: string;
  biggestGap: string;
  nextActions: string[];
  hardStops: string[];
};

export type OmegaProductAuditFinding = {
  lens: OmegaAuditLens;
  status: "pass" | "controlled-gap" | "blocked-before-production";
  finding: string;
  requiredUpgrade: string;
  evidenceRoutes: string[];
  hardStops: string[];
};

export type OmegaProductAudit = OmegaProductSeed & {
  readinessScore: number;
  auditFindings: OmegaProductAuditFinding[];
};

export type OmegaImplementationLane = {
  slug: string;
  lane: string;
  priority: "p0" | "p1" | "p2";
  objective: string;
  appliesTo: string[];
  implementationPattern: string[];
  proofRoutes: string[];
  hardStops: string[];
};

export const omegaPlatformAuditRoute = "/omega-audit";
export const omegaPlatformAuditApiRoute = "/api/omega-audit";
export const omegaPlatformAuditBriefRoute = "/api/omega-audit/brief";
export const omegaPlatformAuditStatus = "omega-platform-audit-control-plane-active";
export const omegaPlatformAuditBriefStatus = "omega-platform-audit-brief-ready";
export const omegaPlatformAuditUpdatedAt = "2026-06-29";

export const omegaPlatformAuditBoundary =
  "SCRIMED Omega Platform Audit is a no-PHI, no-live-care, readiness-only engineering control plane for product discovery, audit findings, upgrade lanes, and proof routing. It does not authorize PHI processing, live clinical care, autonomous diagnosis, autonomous treatment, autonomous prescribing, autonomous billing, payer submission, EHR writeback, production connector activation, public API SLA, legal advice, accounting advice, tax advice, audited financial reporting, securities material, regulatory approval, HIPAA certification, SOC 2 certification, HITRUST certification, FDA clearance, ONC certification, security certification, accessibility certification, or buyer release.";

export const omegaAuditLenses: OmegaAuditLensDefinition[] = [
  {
    lens: "architecture",
    question: "Is the product modular, domain-bounded, and connected to shared SCRIMED trust, context, workflow, and evidence layers?",
    minimumStandard: "Owned module boundary, explicit routes, typed data contract, proof route, and no duplicate runtime.",
    failClosedBoundary: "No production workflow can launch from an undocumented or ownerless architecture surface."
  },
  {
    lens: "technical-debt",
    question: "Are gaps, duplicated concepts, missing owners, and temporary workarounds visible and scheduled for resolution?",
    minimumStandard: "Known debt has owner, severity, workaround, graduation gate, and test or smoke coverage.",
    failClosedBoundary: "Temporary controls cannot become informal approval."
  },
  {
    lens: "performance",
    question: "Does the product have a latency, batching, caching, queueing, and cost plan appropriate for its workflow?",
    minimumStandard: "Latency class, expected payload size, async path, cache policy, and degradation path are defined.",
    failClosedBoundary: "No unlimited usage, SLA, or trillion-scale claim without measured production evidence."
  },
  {
    lens: "security",
    question: "Does the product enforce least privilege, AAL2 where protected, audit logging, secret hygiene, and tool authorization?",
    minimumStandard: "RBAC/AAL2 boundary, token redaction, audit route, denied data classes, and incident owner are visible.",
    failClosedBoundary: "No protected action executes without authenticated, authorized, logged human authority."
  },
  {
    lens: "clinical-safety",
    question: "Does the product avoid autonomous clinical authority while retaining uncertainty, evidence, citations, and human review?",
    minimumStandard: "Clinical risk class, human signoff, refusal path, evidence source handling, and hard stops are defined.",
    failClosedBoundary: "No autonomous diagnosis, treatment, triage, prescribing, routing, or signed clinical documentation."
  },
  {
    lens: "accessibility",
    question: "Can the route be navigated, scanned, and reviewed without hidden critical actions or unsupported accessibility claims?",
    minimumStandard: "Primary route exists or has a planned route, copy is scannable, and certification claims remain blocked.",
    failClosedBoundary: "No WCAG, VPAT, or Section 508 claim without qualified review."
  },
  {
    lens: "scalability",
    question: "Does the product have a tenant, queue, worker, storage, cost, and multi-region readiness path?",
    minimumStandard: "Tenant boundary, async lane, storage class, scale owner, and rollout plan are documented.",
    failClosedBoundary: "No managed-service or public-scale commitment without staffing, monitoring, and rollback evidence."
  },
  {
    lens: "maintainability",
    question: "Is the product built from reusable SCRIMED primitives instead of one-off logic?",
    minimumStandard: "Uses shared route, summary, brief, proof, audit, and boundary patterns.",
    failClosedBoundary: "No new product may bypass shared TrustOS, AgentOS, QA, and boundary controls."
  },
  {
    lens: "reliability",
    question: "Does the product have fail-closed behavior, health checks, retry or fallback posture, and smoke coverage?",
    minimumStandard: "At least one deterministic contract check or documented smoke path exists before launch language expands.",
    failClosedBoundary: "No buyer proof claim without a passing smoke, retained evidence, or explicit limitation."
  },
  {
    lens: "user-experience",
    question: "Can the target buyer understand value, current boundary, next action, and proof path quickly?",
    minimumStandard: "Clear buyer, trigger, outcome, proof route, action, and boundary language.",
    failClosedBoundary: "No sales language may imply authority beyond the current gated state."
  },
  {
    lens: "developer-experience",
    question: "Can engineers test, extend, and verify the product without secrets or production data?",
    minimumStandard: "Typed source, no-secret fixtures, contract check, and local build compatibility.",
    failClosedBoundary: "No test fixture may contain PHI, secrets, production credentials, or live patient data."
  },
  {
    lens: "compliance",
    question: "Are legal, privacy, security, regulatory, billing, reimbursement, and regional claims bounded?",
    minimumStandard: "Blocked claims, approval gates, and qualified-review owners are visible.",
    failClosedBoundary: "No certification, regulatory, reimbursement, or legal conclusion is claimed by this software layer."
  }
];

const defaultHardStops = [
  "PHI introduced",
  "live clinical care implied",
  "autonomous clinical decision requested",
  "production connector requested",
  "unsupported certification claim",
  "buyer release implied without approval"
];

export const omegaProductSeeds: OmegaProductSeed[] = [
  {
    slug: "scrimed-os",
    name: "SCRIMED OS",
    category: "operating-system",
    status: "implemented-surface",
    clinicalRisk: "high",
    primaryBuyers: ["enterprise executives", "clinical operations", "platform leaders"],
    currentSurfaces: ["Hub", "Product Console", "Production Architecture", "Healthcare Intelligence OS"],
    linkedRoutes: ["/hub", "/product", "/production-architecture", "/healthcare-intelligence-os"],
    linkedApis: ["/api/product/console", "/api/production-architecture", "/api/healthcare-intelligence-os"],
    coreCapabilities: ["operating map", "proof stack", "workflow controls", "agent governance"],
    aiAgents: ["orchestration agent", "trust agent", "release reviewer"],
    workflows: ["product-to-proof routing", "release readiness", "buyer diligence"],
    dataBoundary: "synthetic and metadata only until customer authority exists",
    strongestAsset: "Unified operating layer across AgentOS, Atlas, TrustOS, proof packets, and release controls.",
    biggestGap: "Needs one authoritative product registry that keeps every product in the same audit and upgrade loop.",
    nextActions: ["attach Omega audit to product console", "expand route smoke coverage", "add progressive delivery register"],
    hardStops: defaultHardStops
  },
  {
    slug: "sanar-ai",
    name: "Sanar AI",
    category: "clinical-ai",
    status: "mapped-capability",
    clinicalRisk: "critical",
    primaryBuyers: ["clinicians", "care teams", "clinical operations"],
    currentSurfaces: ["AgentOS references", "protected workspace agent ownership", "strategic intelligence"],
    linkedRoutes: ["/agents", "/pilot-workspace/access", "/strategic-intelligence"],
    linkedApis: ["/api/agent-os", "/api/pilot-workspaces"],
    coreCapabilities: ["clinical assistance planning", "care explanation routing", "human review queues"],
    aiAgents: ["Sanar AI agent", "clinical verifier", "trust reviewer"],
    workflows: ["draft clinical support", "safe escalation", "review-gated patient education"],
    dataBoundary: "no live patient data or direct care authority",
    strongestAsset: "Can plug into AgentOS and TrustOS as a review-gated clinical assistant lane.",
    biggestGap: "Needs specialty-specific eval packs and clinical governance signoff before protected activation.",
    nextActions: ["add Sanar specialty eval pack", "define refusal policy", "map clinician signoff workflow"],
    hardStops: defaultHardStops
  },
  {
    slug: "myvitals-ai",
    name: "MyVitals AI",
    category: "patient-engagement",
    status: "future-roadmap",
    clinicalRisk: "high",
    primaryBuyers: ["patients", "RPM teams", "population health leaders"],
    currentSurfaces: ["Healthcare Intelligence OS", "strategic product references"],
    linkedRoutes: ["/healthcare-intelligence-os", "/health-records", "/clinical-production-readiness"],
    linkedApis: ["/api/healthcare-intelligence-os", "/api/health-records"],
    coreCapabilities: ["vitals explanation drafts", "RPM readiness", "patient engagement analysis"],
    aiAgents: ["patient education agent", "clinical safety verifier", "engagement reviewer"],
    workflows: ["vitals trend explanation", "follow-up prompt draft", "RPM escalation planning"],
    dataBoundary: "synthetic vitals only until device, consent, clinical, and customer authority exist",
    strongestAsset: "Fits SCRIMED's patient engagement and population-health roadmap.",
    biggestGap: "No device ingestion, consent, escalation, or patient notification authority is implemented.",
    nextActions: ["create synthetic RPM fixture set", "define consent ledger", "design human escalation queue"],
    hardStops: defaultHardStops
  },
  {
    slug: "docutwin",
    name: "DocuTwin",
    category: "documentation",
    status: "implemented-surface",
    clinicalRisk: "high",
    primaryBuyers: ["clinicians", "CMIOs", "documentation leaders"],
    currentSurfaces: ["module page", "synthetic workflows", "fixtures", "execution results"],
    linkedRoutes: ["/modules/docutwin", "/workflows", "/synthetic/fixtures", "/workflows/results"],
    linkedApis: ["/api/workflows/executions", "/api/synthetic/fixtures", "/api/workflows/results"],
    coreCapabilities: ["draft note review", "source trace", "missing-data prompts", "clinician review"],
    aiAgents: ["DocuTwin agent", "documentation verifier", "source evidence agent"],
    workflows: ["draft note review", "structured note validation", "review disposition"],
    dataBoundary: "synthetic notes and no-PHI excerpts only",
    strongestAsset: "Existing module, fixtures, contracts, and result-validation surfaces.",
    biggestGap: "Needs ambient capture integration and specialty-specific note evals before clinical use.",
    nextActions: ["add documentation scorecards", "extend missing-data tests", "map clinician signoff states"],
    hardStops: defaultHardStops
  },
  {
    slug: "ambient-scribe",
    name: "Ambient Scribe",
    category: "documentation",
    status: "mapped-capability",
    clinicalRisk: "high",
    primaryBuyers: ["clinicians", "documentation teams", "ambulatory operators"],
    currentSurfaces: ["AgentOS evaluation", "Healthcare Intelligence OS", "competitive intelligence"],
    linkedRoutes: ["/evaluation", "/healthcare-intelligence-os", "/competitive-intelligence"],
    linkedApis: ["/api/agent-os/evaluation", "/api/healthcare-intelligence-os"],
    coreCapabilities: ["conversation topic tracking", "note scaffold", "coding support draft", "human signoff"],
    aiAgents: ["ambient documentation agent", "coding support agent", "clinical verifier"],
    workflows: ["conversation capture planning", "draft note generation", "follow-up plan draft"],
    dataBoundary: "synthetic conversations only; no live recording authority",
    strongestAsset: "Mapped beyond transcription into documentation, coding, prior auth, education, and follow-up planning.",
    biggestGap: "Needs audio consent, local speech, specialty templates, and signed-note authority gates.",
    nextActions: ["add ambient synthetic transcript evals", "define consent and retention controls", "add signoff state machine"],
    hardStops: defaultHardStops
  },
  {
    slug: "careexplain",
    name: "CareExplain",
    category: "patient-engagement",
    status: "mapped-capability",
    clinicalRisk: "high",
    primaryBuyers: ["care teams", "patient access", "patient education leaders"],
    currentSurfaces: ["protected workspace references", "Healthcare Intelligence OS"],
    linkedRoutes: ["/pilot-workspace/access", "/healthcare-intelligence-os", "/qa-claim-guard"],
    linkedApis: ["/api/pilot-workspaces", "/api/healthcare-intelligence-os"],
    coreCapabilities: ["patient education draft", "readability support", "source attribution", "human approval"],
    aiAgents: ["education agent", "readability verifier", "clinical reviewer"],
    workflows: ["education draft", "follow-up explanation", "reviewed message packet"],
    dataBoundary: "no PHI and no patient-specific advice",
    strongestAsset: "Pairs naturally with TrustOS and QA Claim Guard for safe explanatory drafts.",
    biggestGap: "Needs multilingual readability evals and patient-communication approval queues.",
    nextActions: ["add multilingual education scenarios", "add readability scorecards", "link to client onboarding drafts"],
    hardStops: defaultHardStops
  },
  {
    slug: "perfect-chart",
    name: "Perfect Chart",
    category: "documentation",
    status: "mapped-capability",
    clinicalRisk: "high",
    primaryBuyers: ["clinicians", "quality leaders", "revenue integrity"],
    currentSurfaces: ["protected workspace references", "health records safety exchange"],
    linkedRoutes: ["/health-records", "/workflows/results/validation", "/pilot-workspace/access"],
    linkedApis: ["/api/health-records", "/api/workflows/results/validation"],
    coreCapabilities: ["chart completeness checks", "missing evidence flags", "coding support draft"],
    aiAgents: ["chart quality agent", "coding verifier", "evidence agent"],
    workflows: ["chart gap detection", "missing documentation queue", "human review disposition"],
    dataBoundary: "synthetic chart metadata only",
    strongestAsset: "Strong alignment with source attribution, validation, and no-final-billing boundaries.",
    biggestGap: "Needs specialty chart-completeness benchmarks and EHR sandbox contracts.",
    nextActions: ["build synthetic chart gap suite", "define chart-signature hard stop", "map RCM reviewer handoff"],
    hardStops: defaultHardStops
  },
  {
    slug: "clinical-copilot",
    name: "Clinical Copilot",
    category: "clinical-ai",
    status: "implemented-surface",
    clinicalRisk: "critical",
    primaryBuyers: ["clinicians", "clinical governance", "health system leaders"],
    currentSurfaces: ["module page", "clinical authority readiness", "TrustOS"],
    linkedRoutes: ["/modules/clinical-copilot", "/clinical-authority-readiness", "/trust-os"],
    linkedApis: ["/api/clinical-authority-readiness", "/api/trust-os"],
    coreCapabilities: ["clinical draft support", "evidence attribution", "review escalation"],
    aiAgents: ["clinical copilot agent", "evidence verifier", "safety reviewer"],
    workflows: ["draft recommendation support", "evidence card review", "clinical escalation"],
    dataBoundary: "synthetic clinical scenarios only",
    strongestAsset: "Existing route plus strong clinical authority and TrustOS guardrails.",
    biggestGap: "Needs adversarial clinical robustness lab coverage before protected activation.",
    nextActions: ["add missing-data clinical evals", "add contradiction checks", "map specialty governance owners"],
    hardStops: defaultHardStops
  },
  {
    slug: "contact-center-ai",
    name: "Contact Center AI",
    category: "operations",
    status: "mapped-capability",
    clinicalRisk: "medium",
    primaryBuyers: ["patient access", "call center leaders", "operations executives"],
    currentSurfaces: ["client onboarding", "service delivery", "sales operations"],
    linkedRoutes: ["/client-onboarding", "/service-delivery", "/sales-operations"],
    linkedApis: ["/api/client-onboarding", "/api/service-delivery", "/api/sales-operations"],
    coreCapabilities: ["call intent classification", "draft follow-up", "scheduling handoff", "human approval"],
    aiAgents: ["contact center agent", "routing verifier", "communication reviewer"],
    workflows: ["call summary draft", "routing recommendation", "follow-up queue"],
    dataBoundary: "business workflow and synthetic contact data only",
    strongestAsset: "Strong fit with onboarding, scheduling, and human-reviewed communication packets.",
    biggestGap: "Needs telephony integration plan, consent controls, and escalation handling.",
    nextActions: ["define call transcript fixture policy", "add escalation queue", "map scheduling API gates"],
    hardStops: defaultHardStops
  },
  {
    slug: "patient-education",
    name: "Patient Education",
    category: "patient-engagement",
    status: "mapped-capability",
    clinicalRisk: "high",
    primaryBuyers: ["care teams", "patient experience", "population health"],
    currentSurfaces: ["CareExplain", "Healthcare Intelligence OS", "QA Claim Guard"],
    linkedRoutes: ["/healthcare-intelligence-os", "/qa-claim-guard", "/client-onboarding"],
    linkedApis: ["/api/healthcare-intelligence-os", "/api/qa-evidence/claim-guard"],
    coreCapabilities: ["plain-language draft", "source attribution", "review gate", "multilingual readiness"],
    aiAgents: ["education agent", "translation reviewer", "clinical verifier"],
    workflows: ["education draft", "readability review", "approved send packet"],
    dataBoundary: "general education and synthetic scenarios only",
    strongestAsset: "Can be safely sold as reviewed education drafting without patient-specific medical advice.",
    biggestGap: "Needs formal content review queue and multilingual clinical safety checks.",
    nextActions: ["add education content registry", "add multilingual scenarios", "add source citation verification"],
    hardStops: defaultHardStops
  },
  {
    slug: "trialcore",
    name: "TrialCore",
    category: "research",
    status: "implemented-surface",
    clinicalRisk: "high",
    primaryBuyers: ["research operations", "clinical trials", "academic medical centers"],
    currentSurfaces: ["module page", "synthetic workflow", "research pipeline references"],
    linkedRoutes: ["/modules/trialcore", "/workflows", "/synthetic"],
    linkedApis: ["/api/workflows/executions", "/api/synthetic/scenarios"],
    coreCapabilities: ["eligibility review queue", "evidence ranking", "human research review"],
    aiAgents: ["trial matching agent", "evidence grader", "research reviewer"],
    workflows: ["eligibility screen", "trial matching draft", "research review packet"],
    dataBoundary: "synthetic eligibility criteria only",
    strongestAsset: "Existing module and synthetic workflow coverage.",
    biggestGap: "Needs protocol ingestion governance and no-patient-outreach controls.",
    nextActions: ["add protocol source registry", "add contradiction detection", "map IRB/research governance handoff"],
    hardStops: defaultHardStops
  },
  {
    slug: "oncoid",
    name: "OncoID",
    category: "clinical-ai",
    status: "future-roadmap",
    clinicalRisk: "critical",
    primaryBuyers: ["oncology programs", "research teams", "precision medicine"],
    currentSurfaces: ["Healthcare Intelligence OS", "research and scientific agent references"],
    linkedRoutes: ["/healthcare-intelligence-os", "/clinical-production-readiness", "/global-certification-readiness"],
    linkedApis: ["/api/healthcare-intelligence-os", "/api/clinical-production-readiness"],
    coreCapabilities: ["oncology evidence organization", "trial matching draft", "genomics-aware review planning"],
    aiAgents: ["oncology agent", "genomics evidence agent", "clinical trials reviewer"],
    workflows: ["oncology evidence card", "trial eligibility draft", "human oncology review"],
    dataBoundary: "synthetic oncology cases only",
    strongestAsset: "Strategically strong for oncology, trials, and evidence-grade workflows.",
    biggestGap: "Requires qualified oncology governance, genomic privacy controls, and specialty evals.",
    nextActions: ["create oncology synthetic suite", "add evidence grading", "define genomics data boundary"],
    hardStops: defaultHardStops
  },
  {
    slug: "trust-engine",
    name: "Trust Engine",
    category: "trust-governance",
    status: "implemented-surface",
    clinicalRisk: "medium",
    primaryBuyers: ["security", "clinical governance", "procurement", "executives"],
    currentSurfaces: ["TrustOS", "Trust Center", "QA evidence"],
    linkedRoutes: ["/trust-os", "/trust-center", "/qa-evidence"],
    linkedApis: ["/api/trust-os", "/api/trust/cards", "/api/qa-evidence"],
    coreCapabilities: ["policy checks", "evidence cards", "audit events", "human review status"],
    aiAgents: ["trust agent", "policy verifier", "audit reviewer"],
    workflows: ["trust card generation", "claim guard review", "release proof review"],
    dataBoundary: "metadata, synthetic evidence, and no-secret references",
    strongestAsset: "Core differentiator tying evidence, confidence, risk, and review status together.",
    biggestGap: "Needs immutable external audit sink and tamper-evidence hardening.",
    nextActions: ["add immutable log adapter interface", "add trust score regression tests", "expand claim guard coverage"],
    hardStops: defaultHardStops
  },
  {
    slug: "trust-dashboard",
    name: "Trust Dashboard",
    category: "dashboard",
    status: "implemented-surface",
    clinicalRisk: "medium",
    primaryBuyers: ["procurement", "security", "clinical governance", "investors"],
    currentSurfaces: ["Trust Center", "trust pages", "protected workspace"],
    linkedRoutes: ["/trust-center", "/trust", "/pilot-workspace/access"],
    linkedApis: ["/api/trust-os", "/api/pilot-workspaces"],
    coreCapabilities: ["evidence review", "claims control", "readiness status"],
    aiAgents: ["trust reviewer", "evidence room agent", "claim guard"],
    workflows: ["procurement evidence review", "claim review", "buyer proof release"],
    dataBoundary: "metadata-only evidence references",
    strongestAsset: "Buyer-visible trust posture without overclaiming certification.",
    biggestGap: "Needs role-specific dashboard filters and protected evidence vault UX polish.",
    nextActions: ["add trust dashboard route grouping", "add procurement filter model", "add evidence expiration alerts"],
    hardStops: defaultHardStops
  },
  {
    slug: "clinical-intelligence-platform",
    name: "Clinical Intelligence Platform",
    category: "clinical-ai",
    status: "implemented-surface",
    clinicalRisk: "critical",
    primaryBuyers: ["CMIOs", "clinical operations", "quality leaders"],
    currentSurfaces: ["Healthcare Intelligence OS", "clinical production readiness", "clinical authority readiness"],
    linkedRoutes: ["/healthcare-intelligence-os", "/clinical-production-readiness", "/clinical-authority-readiness"],
    linkedApis: ["/api/healthcare-intelligence-os", "/api/clinical-production-readiness"],
    coreCapabilities: ["clinical context", "guideline retrieval planning", "risk and quality intelligence"],
    aiAgents: ["clinical orchestrator", "evidence agent", "safety verifier"],
    workflows: ["clinical summary draft", "handoff planning", "quality review"],
    dataBoundary: "synthetic clinical context only",
    strongestAsset: "Broad healthcare AI OS mapping with clinical safety boundaries.",
    biggestGap: "Needs continuous clinical robustness lab implementation and reviewer queue.",
    nextActions: ["add adversarial clinical eval route", "add reviewer queue contract", "connect source intelligence"],
    hardStops: defaultHardStops
  },
  {
    slug: "imaging-platform",
    name: "Imaging Platform",
    category: "imaging",
    status: "future-roadmap",
    clinicalRisk: "critical",
    primaryBuyers: ["radiology", "imaging operations", "research teams"],
    currentSurfaces: ["Healthcare Intelligence OS", "production architecture"],
    linkedRoutes: ["/healthcare-intelligence-os", "/production-architecture", "/clinical-production-readiness"],
    linkedApis: ["/api/healthcare-intelligence-os", "/api/production-architecture"],
    coreCapabilities: ["imaging workflow planning", "DICOM readiness", "edge/GPU roadmap"],
    aiAgents: ["radiology agent", "imaging verifier", "model deployment reviewer"],
    workflows: ["imaging triage planning", "segmentation workflow draft", "radiologist review queue"],
    dataBoundary: "synthetic imaging metadata only; no diagnostic inference",
    strongestAsset: "Can align MONAI, nnUNet, SwinUNETR, SegResNet, TensorRT, edge inference, and GPU scheduling in a governed roadmap.",
    biggestGap: "No imaging model runtime, DICOM image store, GPU scheduler, or radiologist validation is implemented.",
    nextActions: ["create imaging architecture contract", "add DICOM synthetic fixtures", "define GPU deployment gate"],
    hardStops: defaultHardStops
  },
  {
    slug: "referral-intelligence",
    name: "Referral Intelligence",
    category: "operations",
    status: "mapped-capability",
    clinicalRisk: "high",
    primaryBuyers: ["referral teams", "specialty access", "network operations"],
    currentSurfaces: ["pilot intake", "product console", "Healthcare Intelligence OS"],
    linkedRoutes: ["/pilot", "/product", "/healthcare-intelligence-os"],
    linkedApis: ["/api/pilot/intake", "/api/product/console"],
    coreCapabilities: ["referral intake", "missing information detection", "routing rationale", "leakage analysis"],
    aiAgents: ["referral agent", "network matching verifier", "access reviewer"],
    workflows: ["referral intake", "provider matching draft", "closed-loop feedback"],
    dataBoundary: "synthetic referral workqueues only",
    strongestAsset: "Clear commercial wedge for access operations and specialty routing.",
    biggestGap: "Needs deterministic ReferralOS workflow engine and wait-time model governance.",
    nextActions: ["add referral workflow contract", "add leakage dashboard model", "define scheduling approval gate"],
    hardStops: defaultHardStops
  },
  {
    slug: "prior-authorization",
    name: "Prior Authorization",
    category: "payer-rcm",
    status: "implemented-surface",
    clinicalRisk: "high",
    primaryBuyers: ["payer operations", "RCM", "access teams"],
    currentSurfaces: ["agent workflows", "interoperability", "health records"],
    linkedRoutes: ["/agents/prior-authorization-agent", "/interoperability", "/health-records"],
    linkedApis: ["/api/agents/workflows", "/api/interoperability/standards", "/api/health-records"],
    coreCapabilities: ["policy evidence", "missing documentation", "packet readiness", "human submission boundary"],
    aiAgents: ["prior authorization agent", "policy evidence agent", "payer reviewer"],
    workflows: ["prior auth packet draft", "coverage policy review", "human submission queue"],
    dataBoundary: "synthetic policy and record metadata only",
    strongestAsset: "Existing agent and standards readiness surfaces.",
    biggestGap: "Needs payer-specific policy source authority and transaction testing.",
    nextActions: ["add prior auth synthetic packet suite", "define payer policy registry", "add no-submission smoke"],
    hardStops: defaultHardStops
  },
  {
    slug: "revenue-cycle",
    name: "Revenue Cycle",
    category: "payer-rcm",
    status: "implemented-surface",
    clinicalRisk: "medium",
    primaryBuyers: ["RCM leaders", "revenue integrity", "finance"],
    currentSurfaces: ["Revenue Cycle Agent", "Enterprise Business Ops", "Growth Engine"],
    linkedRoutes: ["/agents/revenue-cycle-agent", "/enterprise-business-ops", "/growth-engine"],
    linkedApis: ["/api/agents/workflows", "/api/enterprise-business-ops"],
    coreCapabilities: ["denial root cause", "appeal draft", "documentation gap", "finance methodology gates"],
    aiAgents: ["revenue cycle agent", "coding support verifier", "finance reviewer"],
    workflows: ["denial analysis draft", "appeal packet draft", "human billing review"],
    dataBoundary: "synthetic billing and denial examples only",
    strongestAsset: "Strong buyer value with explicit no-final-billing and no-guarantee boundaries.",
    biggestGap: "Needs coding expert review queue and X12/payment workflow separation.",
    nextActions: ["add denial appeal evals", "define coding review status", "add reimbursement no-guarantee tests"],
    hardStops: defaultHardStops
  },
  {
    slug: "payer-intelligence",
    name: "Payer Intelligence",
    category: "payer-rcm",
    status: "mapped-capability",
    clinicalRisk: "medium",
    primaryBuyers: ["payers", "plans", "benefit operations"],
    currentSurfaces: ["PayerIQ references", "competitive intelligence", "health records safety exchange"],
    linkedRoutes: ["/competitive-intelligence", "/health-records", "/enterprise-business-ops"],
    linkedApis: ["/api/competitive-intelligence", "/api/health-records"],
    coreCapabilities: ["policy evidence", "member-experience planning", "appeals intelligence", "no-submission guard"],
    aiAgents: ["PayerIQ", "policy evidence agent", "appeals reviewer"],
    workflows: ["policy source review", "appeal evidence draft", "payer friction analysis"],
    dataBoundary: "synthetic payer policy and metadata only",
    strongestAsset: "Differentiated PayerIQ evidence engine opportunity.",
    biggestGap: "Needs policy-source registry and payer/trading-partner approval gates.",
    nextActions: ["create PayerIQ registry", "add policy freshness checks", "add RCM no-submission contract"],
    hardStops: defaultHardStops
  },
  {
    slug: "population-health",
    name: "Population Health",
    category: "clinical-ai",
    status: "mapped-capability",
    clinicalRisk: "high",
    primaryBuyers: ["population health", "quality", "value-based care"],
    currentSurfaces: ["Healthcare Intelligence OS", "population intelligence surfaces"],
    linkedRoutes: ["/healthcare-intelligence-os", "/health-records", "/clinical-production-readiness"],
    linkedApis: ["/api/healthcare-intelligence-os", "/api/health-records"],
    coreCapabilities: ["aggregate trends", "risk cohorts", "engagement planning", "quality signals"],
    aiAgents: ["population analyst", "equity reviewer", "clinical safety verifier"],
    workflows: ["cohort insight draft", "engagement planning", "quality review queue"],
    dataBoundary: "aggregate or synthetic only until approved data rights exist",
    strongestAsset: "Maps into buyer demand for quality, access, and value-based care operations.",
    biggestGap: "Needs privacy, equity, aggregation, consent, and outreach governance controls.",
    nextActions: ["add aggregate synthetic datasets", "define equity audit lens", "create outreach approval gate"],
    hardStops: defaultHardStops
  },
  {
    slug: "clinical-research",
    name: "Clinical Research",
    category: "research",
    status: "mapped-capability",
    clinicalRisk: "high",
    primaryBuyers: ["research administration", "sponsors", "academic medicine"],
    currentSurfaces: ["TrialCore", "Healthcare Intelligence OS", "global partner localization"],
    linkedRoutes: ["/modules/trialcore", "/healthcare-intelligence-os", "/global-reach"],
    linkedApis: ["/api/healthcare-intelligence-os", "/api/global-reach"],
    coreCapabilities: ["hypothesis workflow", "literature ranking", "trial matching draft", "human review"],
    aiAgents: ["research agent", "evidence grader", "clinical trials reviewer"],
    workflows: ["hypothesis to evidence", "guideline comparison", "human research review"],
    dataBoundary: "public literature and synthetic trial examples only",
    strongestAsset: "Can become a chained research pipeline with evidence ranking and contradiction detection.",
    biggestGap: "Needs official literature connectors, citation verification, and research governance queue.",
    nextActions: ["add research pipeline contract", "add citation verification tests", "define trial matching refusal rules"],
    hardStops: defaultHardStops
  },
  {
    slug: "provider-dashboard",
    name: "Provider Dashboard",
    category: "dashboard",
    status: "future-roadmap",
    clinicalRisk: "high",
    primaryBuyers: ["clinicians", "provider groups", "practice leaders"],
    currentSurfaces: ["Product Console", "Clinical Production Readiness"],
    linkedRoutes: ["/product", "/clinical-production-readiness", "/pilot-workspace/access"],
    linkedApis: ["/api/product/console", "/api/clinical-production-readiness"],
    coreCapabilities: ["workflow queue", "review tasks", "evidence cards", "signoff states"],
    aiAgents: ["provider workflow agent", "trust reviewer", "clinical verifier"],
    workflows: ["review queue", "draft approval", "escalation disposition"],
    dataBoundary: "synthetic provider workflows only",
    strongestAsset: "Can unify review-gated clinical and administrative tasks.",
    biggestGap: "Needs authenticated provider identity, task queues, and role-specific UI.",
    nextActions: ["design provider task model", "add role-based dashboard route", "connect human review queue"],
    hardStops: defaultHardStops
  },
  {
    slug: "executive-dashboard",
    name: "Executive Dashboard",
    category: "dashboard",
    status: "implemented-surface",
    clinicalRisk: "low",
    primaryBuyers: ["executives", "investors", "operations leaders"],
    currentSurfaces: ["Company Assessment", "Product Console", "Launch Readiness"],
    linkedRoutes: ["/company-assessment", "/product", "/launch-readiness"],
    linkedApis: ["/api/company-assessment", "/api/product/console", "/api/launch-readiness"],
    coreCapabilities: ["whole-company score", "proof routes", "risk summary", "next actions"],
    aiAgents: ["executive analyst", "proof reviewer", "release advisor"],
    workflows: ["company assessment", "investor packet", "launch go/no-go review"],
    dataBoundary: "business readiness metadata only",
    strongestAsset: "Already strong as a whole-company command view.",
    biggestGap: "Needs drill-down ownership, trend snapshots, and board-ready export controls.",
    nextActions: ["add trend snapshot ledger", "add board packet export", "map owner-level remediation"],
    hardStops: defaultHardStops
  },
  {
    slug: "admin-console",
    name: "Admin Console",
    category: "operations",
    status: "protected-gated",
    clinicalRisk: "medium",
    primaryBuyers: ["tenant admins", "operators", "security leads"],
    currentSurfaces: ["Protected workspace", "tenant access", "AAL2 smoke"],
    linkedRoutes: ["/pilot-workspace/access", "/qa-manual-execution-console", "/limitations-workarounds"],
    linkedApis: ["/api/pilot-workspaces", "/api/pilot-workspaces/[workspaceSlug]/tenant-access"],
    coreCapabilities: ["tenant access", "role review", "protected proof", "operator evidence"],
    aiAgents: ["admin reviewer", "access governance agent", "audit verifier"],
    workflows: ["tenant access review", "role assignment", "offboarding planning"],
    dataBoundary: "tenant metadata and no-secret evidence only",
    strongestAsset: "AAL2 tenant-admin path now has protected smoke proof.",
    biggestGap: "Needs full tenant-admin UX, invitation lifecycle, and access-review automation.",
    nextActions: ["add admin console route", "add invitation workflow", "add access review reminders"],
    hardStops: defaultHardStops
  },
  {
    slug: "patient-portal",
    name: "Patient Portal",
    category: "patient-engagement",
    status: "future-roadmap",
    clinicalRisk: "critical",
    primaryBuyers: ["patients", "care teams", "digital front door leaders"],
    currentSurfaces: ["Patient education and engagement references"],
    linkedRoutes: ["/healthcare-intelligence-os", "/client-onboarding", "/clinical-production-readiness"],
    linkedApis: ["/api/healthcare-intelligence-os", "/api/client-onboarding"],
    coreCapabilities: ["education", "follow-up drafts", "navigation support", "consent-aware interactions"],
    aiAgents: ["patient portal agent", "education verifier", "safety escalation agent"],
    workflows: ["education review", "appointment guidance draft", "follow-up plan explanation"],
    dataBoundary: "no patient account or PHI authority yet",
    strongestAsset: "Clear future digital front door value.",
    biggestGap: "Requires identity, consent, PHI authorization, accessibility review, and clinical escalation governance.",
    nextActions: ["define patient identity architecture", "add consent tracking model", "add accessibility audit plan"],
    hardStops: defaultHardStops
  },
  {
    slug: "scrimed-university",
    name: "SCRIMED University",
    category: "education",
    status: "mapped-capability",
    clinicalRisk: "low",
    primaryBuyers: ["internal teams", "partners", "customer operators"],
    currentSurfaces: ["global partner localization references", "docs", "service delivery"],
    linkedRoutes: ["/global-reach", "/service-delivery", "/client-onboarding"],
    linkedApis: ["/api/global-reach", "/api/service-delivery"],
    coreCapabilities: ["training paths", "operator enablement", "buyer onboarding", "governance education"],
    aiAgents: ["training agent", "content reviewer", "compliance reviewer"],
    workflows: ["training module draft", "operator checklist", "partner readiness packet"],
    dataBoundary: "training content and synthetic examples only",
    strongestAsset: "Can reduce onboarding friction and partner delivery variability.",
    biggestGap: "Needs curriculum registry, content review, and role-based learning paths.",
    nextActions: ["create curriculum map", "add training proof route", "define reviewer workflow"],
    hardStops: defaultHardStops
  },
  {
    slug: "atlas-platform",
    name: "Atlas Platform",
    category: "platform",
    status: "implemented-surface",
    clinicalRisk: "medium",
    primaryBuyers: ["health systems", "governments", "payers", "enterprise buyers"],
    currentSurfaces: ["Atlas", "Atlas Intelligence Core", "global reach"],
    linkedRoutes: ["/atlas", "/global-reach", "/deployment-profiles"],
    linkedApis: ["/api/atlas/intelligence-core", "/api/global-reach", "/api/deployment-profiles"],
    coreCapabilities: ["evidence layer", "Trust Cards", "document intelligence", "enterprise governance"],
    aiAgents: ["Atlas evidence agent", "governance agent", "deployment planner"],
    workflows: ["evidence mapping", "Trust Card generation", "deployment readiness"],
    dataBoundary: "synthetic documents and metadata-only references",
    strongestAsset: "One of SCRIMED's strongest enterprise differentiators.",
    biggestGap: "Needs external evidence-room connectors and regional deployment proofs.",
    nextActions: ["add evidence adapter registry", "add sovereign deployment checklist", "connect to Omega registry"],
    hardStops: defaultHardStops
  },
  {
    slug: "mobile-applications",
    name: "Mobile Applications",
    category: "platform",
    status: "future-roadmap",
    clinicalRisk: "high",
    primaryBuyers: ["clinicians", "patients", "field teams"],
    currentSurfaces: ["platform roadmap references"],
    linkedRoutes: ["/production-architecture", "/enterprise-scalability", "/clinical-production-readiness"],
    linkedApis: ["/api/production-architecture", "/api/enterprise-scalability"],
    coreCapabilities: ["offline review", "push-safe workflows", "edge cache", "human approvals"],
    aiAgents: ["mobile workflow agent", "offline sync verifier", "security reviewer"],
    workflows: ["offline task review", "mobile approval", "sync reconciliation"],
    dataBoundary: "no mobile PHI storage until device, MDM, encryption, and consent controls exist",
    strongestAsset: "Clear enterprise value for clinician mobility and patient engagement.",
    biggestGap: "No mobile codebase, offline sync model, device security plan, or app-store compliance path.",
    nextActions: ["define mobile architecture", "add offline data policy", "map push notification hard stops"],
    hardStops: defaultHardStops
  },
  {
    slug: "agent-marketplace",
    name: "Agent Marketplace",
    category: "platform",
    status: "mapped-capability",
    clinicalRisk: "medium",
    primaryBuyers: ["partners", "health systems", "developers"],
    currentSurfaces: ["operating context", "AgentOS", "governance packs"],
    linkedRoutes: ["/agents", "/governance-packs", "/production-architecture"],
    linkedApis: ["/api/agent-os", "/api/agent-workspace/governance-packs"],
    coreCapabilities: ["agent registry", "permission scopes", "governance packs", "human approval"],
    aiAgents: ["marketplace reviewer", "tool authorization verifier", "sandbox runner"],
    workflows: ["agent submission review", "permission approval", "governance pack release"],
    dataBoundary: "no third-party agent PHI access without explicit approval",
    strongestAsset: "AgentOS gives a credible foundation for governed healthcare agents.",
    biggestGap: "Needs MCP gateway, tool-level authorization, revocation, and partner review process.",
    nextActions: ["define marketplace submission schema", "add permission manifest", "add sandbox execution contract"],
    hardStops: defaultHardStops
  },
  {
    slug: "internal-operations-platform",
    name: "Internal Operations Platform",
    category: "operations",
    status: "implemented-surface",
    clinicalRisk: "low",
    primaryBuyers: ["internal operators", "release leads", "founder"],
    currentSurfaces: ["Operational Efficiency", "Service Reliability", "Limitations Workarounds"],
    linkedRoutes: ["/operational-efficiency", "/service-reliability", "/limitations-workarounds"],
    linkedApis: ["/api/operational-efficiency", "/api/service-reliability", "/api/limitations-workarounds"],
    coreCapabilities: ["bottleneck resolution", "reliability controls", "workaround ledger", "release evidence"],
    aiAgents: ["operations analyst", "reliability reviewer", "boundary resolver"],
    workflows: ["issue triage", "resolution sprint", "release checkpoint"],
    dataBoundary: "operational metadata only",
    strongestAsset: "Strong operational control plane already exists.",
    biggestGap: "Needs recurring automation, alerting, and dashboard trend retention.",
    nextActions: ["add operations score history", "define alert thresholds", "connect to release-control checklist"],
    hardStops: defaultHardStops
  }
];

export const omegaImplementationLanes: OmegaImplementationLane[] = [
  {
    slug: "clinical-robustness-lab",
    lane: "Clinical Robustness Lab",
    priority: "p0",
    objective:
      "Create adversarial, missing-data, conflicting-data, abbreviation, noisy-note, wrong-unit, multilingual, incomplete-record, temporal-inconsistency, and hallucination-risk evals for every clinical product.",
    appliesTo: ["Sanar AI", "Clinical Copilot", "DocuTwin", "Ambient Scribe", "CareExplain", "Perfect Chart", "TrialCore", "OncoID"],
    implementationPattern: ["synthetic fixtures", "evidence cards", "human review queues", "regression scorecards"],
    proofRoutes: ["/clinical-production-readiness", "/qa-evidence", "/healthcare-intelligence-os"],
    hardStops: ["clinical validation claimed", "diagnosis implied", "treatment implied", "reviewer missing"]
  },
  {
    slug: "agent-runtime-and-mcp-gateway",
    lane: "Agent Runtime and MCP Gateway",
    priority: "p0",
    objective:
      "Standardize agent identity, scoped permissions, tool manifests, OAuth/OIDC handoff, audit logs, revocation, replay traces, and human approval gates.",
    appliesTo: ["Agent Marketplace", "SCRIMED OS", "Admin Console", "Internal Operations Platform"],
    implementationPattern: ["agent registry", "tool registry", "permission manifest", "AAL2 protected execution", "audit event stream"],
    proofRoutes: ["/agents", "/agent-workspace", "/production-architecture", "/pilot-workspace/access"],
    hardStops: ["tool execution without permission", "unscoped token", "missing audit event", "AAL2 bypass"]
  },
  {
    slug: "private-edge-ai",
    lane: "Private and Edge AI Architecture",
    priority: "p1",
    objective:
      "Prepare hospital-deployable local inference, local speech, local vision, local imaging, FHIR gateway, private knowledge graph, offline mode, and no-PHI-egress controls.",
    appliesTo: ["Imaging Platform", "Ambient Scribe", "Mobile Applications", "Atlas Platform"],
    implementationPattern: ["edge gateway", "local model route", "FHIR facade", "offline sync ledger", "data residency policy"],
    proofRoutes: ["/deployment-profiles", "/enterprise-scalability", "/platform-power"],
    hardStops: ["PHI leaves environment without approval", "local model unapproved", "offline sync unencrypted"]
  },
  {
    slug: "payer-referral-revenue-engine",
    lane: "Payer, Referral, and Revenue Engine",
    priority: "p1",
    objective:
      "Convert prior auth, referral intelligence, payer intelligence, and revenue cycle into deterministic review-gated workflows with policy evidence, queue states, ROI measurement boundaries, and no-submission controls.",
    appliesTo: ["Prior Authorization", "Referral Intelligence", "Payer Intelligence", "Revenue Cycle"],
    implementationPattern: ["deterministic workflow contracts", "policy source registry", "review queues", "finance methodology gates"],
    proofRoutes: ["/health-records", "/interoperability", "/enterprise-business-ops", "/growth-engine"],
    hardStops: ["payer submission approved", "coverage guaranteed", "coding finalized", "reimbursement guaranteed"]
  },
  {
    slug: "observability-and-progressive-delivery",
    lane: "Observability and Progressive Delivery",
    priority: "p1",
    objective:
      "Attach traces, cost, latency, model route, confidence, reviewer outcome, hallucination risk, PHI exposure risk, feature flags, canaries, and rollback plans to product releases.",
    appliesTo: ["SCRIMED OS", "Trust Engine", "Clinical Intelligence Platform", "Internal Operations Platform"],
    implementationPattern: ["trace envelope", "feature flag registry", "canary scorecard", "rollback owner", "release health checks"],
    proofRoutes: ["/observability", "/release-continuity", "/launch-readiness", "/service-reliability"],
    hardStops: ["release without rollback", "unobserved protected action", "model route unlogged", "cost owner missing"]
  },
  {
    slug: "enterprise-iac-and-dr",
    lane: "Enterprise Infrastructure, IaC, and Disaster Recovery",
    priority: "p2",
    objective:
      "Move from app-level readiness into Docker, Kubernetes, Terraform, queue workers, Redis, object storage, backups, restore validation, SBOM, and disaster-recovery drills.",
    appliesTo: ["SCRIMED OS", "Atlas Platform", "Admin Console", "Internal Operations Platform"],
    implementationPattern: ["container contract", "worker pool", "IaC plan", "backup validation", "SBOM and dependency scan"],
    proofRoutes: ["/production-architecture", "/enterprise-scalability", "/global-certification-readiness"],
    hardStops: ["DR claimed without restore test", "SBOM missing", "secret in IaC", "multi-region claim without runbook"]
  }
];

function scoreProduct(product: OmegaProductSeed) {
  const statusScore: Record<OmegaProductStatus, number> = {
    "implemented-surface": 72,
    "mapped-capability": 54,
    "protected-gated": 62,
    "future-roadmap": 34
  };
  const routeBonus = Math.min(product.linkedRoutes.length * 2, 8);
  const apiBonus = Math.min(product.linkedApis.length * 2, 6);
  const riskPenalty: Record<OmegaClinicalRisk, number> = {
    low: 0,
    medium: 4,
    high: 8,
    critical: 12
  };

  return Math.max(20, Math.min(88, statusScore[product.status] + routeBonus + apiBonus - riskPenalty[product.clinicalRisk]));
}

function findingStatus(product: OmegaProductSeed, lens: OmegaAuditLens): OmegaProductAuditFinding["status"] {
  if (product.status === "future-roadmap") return "blocked-before-production";
  if (product.status === "protected-gated") return lens === "security" || lens === "compliance" ? "controlled-gap" : "blocked-before-production";
  if (product.status === "mapped-capability") return "controlled-gap";
  if ((lens === "clinical-safety" || lens === "compliance") && ["high", "critical"].includes(product.clinicalRisk)) {
    return "controlled-gap";
  }
  return "pass";
}

function findingUpgrade(product: OmegaProductSeed, lens: OmegaAuditLens) {
  const action = product.nextActions[0] ?? "Assign owner and proof route";

  const upgrades: Record<OmegaAuditLens, string> = {
    architecture: `Confirm ${product.name} module boundary, owner, route contract, and shared AgentOS/TrustOS integration.`,
    "technical-debt": `Track ${product.biggestGap} through the limitations/workaround queue and graduate it with smoke evidence.`,
    performance: `Define latency class, cache policy, batching or async queue, and cost owner before scale claims expand.`,
    security: `Enforce least privilege, AAL2 for protected actions, token redaction, and audit events for ${product.name}.`,
    "clinical-safety": `Keep ${product.name} human-reviewed with evidence, uncertainty, refusal boundaries, and reviewer signoff before clinical use.`,
    accessibility: `Verify the buyer/operator route is discoverable, scannable, keyboard-reviewable, and free of certification claims.`,
    scalability: `Add tenant, queue, worker, storage, rollout, and rollback controls before enterprise activation.`,
    maintainability: `Keep ${product.name} on shared SCRIMED summary, brief, audit, route, and proof patterns.`,
    reliability: `Add deterministic contract checks and fail-closed behavior for ${product.name}; next action: ${action}.`,
    "user-experience": `Expose buyer, trigger, outcome, proof route, and current boundary in the first product surface.`,
    "developer-experience": `Keep typed source, no-secret fixtures, and local nonsecret tests for ${product.name}.`,
    compliance: `Route legal, privacy, security, billing, reimbursement, regional, and certification claims to qualified review.`
  };

  return upgrades[lens];
}

function buildProductAuditFindings(product: OmegaProductSeed): OmegaProductAuditFinding[] {
  return omegaAuditLenses.map((definition) => ({
    lens: definition.lens,
    status: findingStatus(product, definition.lens),
    finding:
      `${product.name}: ${definition.question} Current signal: ${product.strongestAsset}`,
    requiredUpgrade: findingUpgrade(product, definition.lens),
    evidenceRoutes: product.linkedRoutes.length ? product.linkedRoutes : [omegaPlatformAuditRoute],
    hardStops: product.hardStops
  }));
}

function unique(values: string[]) {
  return Array.from(new Set(values));
}

function markdownItems(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

export function getOmegaPlatformAuditSummary() {
  const products: OmegaProductAudit[] = omegaProductSeeds.map((product) => ({
    ...product,
    readinessScore: scoreProduct(product),
    auditFindings: buildProductAuditFindings(product)
  }));

  const allFindings = products.flatMap((product) => product.auditFindings);
  const blockedFindingCount = allFindings.filter((finding) => finding.status === "blocked-before-production").length;
  const controlledGapFindingCount = allFindings.filter((finding) => finding.status === "controlled-gap").length;
  const passFindingCount = allFindings.filter((finding) => finding.status === "pass").length;
  const highRiskProducts = products.filter((product) => ["high", "critical"].includes(product.clinicalRisk));
  const implementedProducts = products.filter((product) => product.status === "implemented-surface");
  const futureProducts = products.filter((product) => product.status === "future-roadmap");
  const proofRoutes = unique([
    ...products.flatMap((product) => product.linkedRoutes),
    ...products.flatMap((product) => product.linkedApis),
    ...omegaImplementationLanes.flatMap((lane) => lane.proofRoutes),
    omegaPlatformAuditRoute,
    omegaPlatformAuditApiRoute,
    omegaPlatformAuditBriefRoute
  ]);
  const hardStops = unique([
    ...products.flatMap((product) => product.hardStops),
    ...omegaImplementationLanes.flatMap((lane) => lane.hardStops)
  ]);

  return {
    service: "scrimed-omega-platform-audit",
    route: omegaPlatformAuditRoute,
    apiRoute: omegaPlatformAuditApiRoute,
    briefRoute: omegaPlatformAuditBriefRoute,
    status: omegaPlatformAuditStatus,
    briefStatus: omegaPlatformAuditBriefStatus,
    updated: omegaPlatformAuditUpdatedAt,
    boundary: omegaPlatformAuditBoundary,
    authority: {
      auditAuthority: "readiness-control-only",
      dataBoundary: "synthetic-metadata-and-no-secret-only",
      phiAuthority: "not-authorized-production-phi",
      clinicalCareAuthority: "not-authorized-live-care",
      billingAuthority: "not-authorized-final-billing-or-payer-submission",
      connectorAuthority: "not-production-connector-approved",
      certificationAuthority: "not-certified-readiness-only",
      securityCertification: "not-security-certified",
      releaseAuthority: "not-buyer-release-approval"
    },
    productCount: products.length,
    auditLensCount: omegaAuditLenses.length,
    totalAuditCheckCount: products.length * omegaAuditLenses.length,
    passFindingCount,
    controlledGapFindingCount,
    blockedFindingCount,
    highRiskProductCount: highRiskProducts.length,
    implementedProductCount: implementedProducts.length,
    futureProductCount: futureProducts.length,
    implementationLaneCount: omegaImplementationLanes.length,
    proofRouteCount: proofRoutes.length,
    hardStopCount: hardStops.length,
    averageReadinessScore:
      Math.round(products.reduce((sum, product) => sum + product.readinessScore, 0) / products.length),
    products,
    auditLenses: omegaAuditLenses,
    implementationLanes: omegaImplementationLanes,
    proofRoutes,
    hardStops,
    discoveredSurfaces: {
      products: products.map((product) => product.name),
      modules: ["AgentOS", "Atlas Intelligence Core", "TrustOS", "Healthcare Intelligence OS", "Workflow Engine", "Health Records Safety Exchange", "Interoperability Registry", "Protected Pilot Workspace"],
      services: ["Product Console", "Service Delivery", "Launch Readiness", "Client Onboarding", "Enterprise Business Ops", "Enterprise Scalability", "Operational Efficiency", "Release Continuity"],
      apis: proofRoutes.filter((route) => route.startsWith("/api/")),
      agents: unique(products.flatMap((product) => product.aiAgents)),
      workflows: unique(products.flatMap((product) => product.workflows)),
      uis: proofRoutes.filter((route) => !route.startsWith("/api/")),
      backendProcesses: ["AAL2 durable-store smoke", "nonsecret test suite", "public production smoke", "contract checks", "protected workspace audit", "release checkpoint"],
      infrastructure: ["Next.js App Router", "Vercel production deployment", "Supabase Auth and Postgres", "Upstash Redis posture", "AAL2 protected routes", "synthetic fixture contracts"]
    },
    nextHighestImpactStep:
      "Implement the Clinical Robustness Lab route and contract checks, then connect Sanar AI, Clinical Copilot, DocuTwin, Ambient Scribe, CareExplain, Perfect Chart, TrialCore, and OncoID to adversarial synthetic clinical evals with human reviewer queues."
  };
}

export function buildOmegaPlatformAuditBrief() {
  const summary = getOmegaPlatformAuditSummary();

  return [
    "# SCRIMED Omega Platform Audit Brief",
    "",
    `Status: ${summary.status}`,
    `Updated: ${summary.updated}`,
    `Products audited: ${summary.productCount}`,
    `Audit lenses: ${summary.auditLensCount}`,
    `Total checks: ${summary.totalAuditCheckCount}`,
    `Average readiness score: ${summary.averageReadinessScore}`,
    `Controlled gaps: ${summary.controlledGapFindingCount}`,
    `Blocked before production: ${summary.blockedFindingCount}`,
    "",
    "## Operating Boundary",
    summary.boundary,
    "",
    "## Authority",
    `- Audit authority: ${summary.authority.auditAuthority}`,
    `- Data boundary: ${summary.authority.dataBoundary}`,
    `- PHI authority: ${summary.authority.phiAuthority}`,
    `- Clinical care authority: ${summary.authority.clinicalCareAuthority}`,
    `- Billing authority: ${summary.authority.billingAuthority}`,
    `- Connector authority: ${summary.authority.connectorAuthority}`,
    `- Certification authority: ${summary.authority.certificationAuthority}`,
    `- Security certification: ${summary.authority.securityCertification}`,
    `- Release authority: ${summary.authority.releaseAuthority}`,
    "",
    "## Audit Lenses",
    ...summary.auditLenses.map(
      (lens) =>
        `- ${lens.lens}: ${lens.question} Minimum standard: ${lens.minimumStandard} Fail-closed boundary: ${lens.failClosedBoundary}`
    ),
    "",
    "## Product Coverage",
    ...summary.products.map(
      (product) =>
        `- ${product.name} (${product.status}, ${product.category}, risk ${product.clinicalRisk}, score ${product.readinessScore}): ${product.strongestAsset} Gap: ${product.biggestGap} Next: ${product.nextActions.join("; ")} Routes: ${product.linkedRoutes.join(", ")}`
    ),
    "",
    "## Implementation Lanes",
    ...summary.implementationLanes.map(
      (lane) =>
        `- ${lane.lane} (${lane.priority}): ${lane.objective} Applies to: ${lane.appliesTo.join(", ")} Pattern: ${lane.implementationPattern.join(", ")}`
    ),
    "",
    "## Hard Stops",
    markdownItems(summary.hardStops),
    "",
    "## Next Highest Impact Step",
    summary.nextHighestImpactStep,
    ""
  ].join("\n");
}
