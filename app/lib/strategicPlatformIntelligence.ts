import { getCompetitiveMarketIntelligenceSummary } from "./competitiveMarketIntelligence";

export type StrategicPlatformSource = {
  name: string;
  url: string;
  observedPattern: string;
  scrimedInterpretation: string;
};

export type StrategicPlatformPattern = {
  slug: string;
  title: string;
  priority: "near-term" | "mid-term" | "platform";
  sourceNames: string[];
  productThesis: string;
  scrimedImplementation: string;
  routes: string[];
  agents: string[];
  interoperabilityStandards: string[];
  governanceControls: string[];
  proofMetrics: string[];
  blockedClaims: string[];
  nextBuildStep: string;
};

export type StrategicPlatformRoadmapItem = {
  phase: string;
  objective: string;
  codedFoundation: string;
  nextBuild: string;
};

export type StrategicExecutionBet = {
  slug: string;
  name: string;
  horizon: "now" | "30-days" | "60-days" | "90-days";
  thesis: string;
  buildMotion: string;
  sellMotion: string;
  proofMetric: string;
  stopCondition: string;
  owners: string[];
  proofRoutes: string[];
  retainedBoundary: string;
};

export type StrategicDecisionGate = {
  slug: string;
  gate: string;
  trigger: string;
  decisionOwner: string;
  requiredEvidence: string[];
  allowIf: string;
  blockIf: string;
  proofRoutes: string[];
  retainedBoundary: string;
};

export type StrategicExecutionCommand = {
  slug: string;
  lane: string;
  horizon: "this-week" | "30-days" | "60-days" | "90-days";
  priority: "critical" | "high" | "sequenced";
  objective: string;
  executionMove: string;
  commercialOutcome: string;
  operatingCadence: string;
  owners: string[];
  proofRoutes: string[];
  requiredProof: string[];
  dependencies: string[];
  decisionGateSlugs: string[];
  blockedExpansion: string[];
  revenueMotion: string;
  successMetric: string;
  nextAction: string;
  retainedBoundary: string;
};

export type StrategicExecutionScorecard = {
  commandSlug: string;
  commandLane: string;
  scoreState: "active" | "watch" | "sequenced" | "blocked";
  evidenceState: "proof-ready" | "proof-building" | "external-review-required";
  strategicSignal: string;
  currentProof: string[];
  missingProof: string[];
  leadingIndicator: string;
  laggingIndicator: string;
  nextCheckpoint: string;
  escalationPath: string;
  promotionCriteria: string[];
  demotionTriggers: string[];
  retainedBoundary: string;
};

export const strategicPlatformSources: StrategicPlatformSource[] = [
  {
    name: "NVIDIA Inception",
    url: "https://www.nvidia.com/en-us/startups/",
    observedPattern:
      "Startup acceleration combines technical training, developer tooling, cloud or partner offers, market reach, and investor ecosystem access.",
    scrimedInterpretation:
      "SCRIMED should maintain a partner and investor-readiness lane that turns product proof into ecosystem leverage without overstating commercial maturity."
  },
  {
    name: "NVIDIA Healthcare and Life Sciences",
    url: "https://www.nvidia.com/en-us/industries/healthcare-life-sciences/",
    observedPattern:
      "Healthcare AI platforms span agents, imaging, medical devices, genomics, digital health, edge runtimes, and infrastructure for the full AI lifecycle.",
    scrimedInterpretation:
      "SCRIMED should treat Atlas and AgentOS as an AI-factory readiness layer: runtime routing, evidence, edge/sovereign deployment planning, and healthcare-specific workflow controls."
  },
  {
    name: "Epic",
    url: "https://www.epic.com",
    observedPattern:
      "Healthcare software differentiates through patient-centered records, interoperability, operational efficiency, and measurable workflow outcomes.",
    scrimedInterpretation:
      "SCRIMED should sit beside EHRs as a governed intelligence and workflow layer, with FHIR/HL7/DICOM/X12 proof and no live writeback during synthetic pilots."
  },
  {
    name: "AWS Health Care",
    url: "https://awshealthcare.co",
    observedPattern:
      "This source is a Dubai medical equipment supplier, not Amazon Web Services; it highlights equipment categories, quality posture, and regional healthcare supply pathways.",
    scrimedInterpretation:
      "SCRIMED should prepare a device, imaging, lab, and facility-equipment interoperability pathway for Middle East and global pilots while clearly separating supplier context from cloud strategy."
  },
  {
    name: "Microsoft Copilot",
    url: "https://copilot.microsoft.com",
    observedPattern:
      "Copilot presents an assistant-style interaction model centered on user-directed prompts and responses.",
    scrimedInterpretation:
      "SCRIMED should keep agent experiences human-directed, role-aware, and review-gated rather than presenting autonomous clinical authority."
  },
  {
    name: "OpenAI Developers",
    url: "https://developers.openai.com",
    observedPattern:
      "Developer platform surfaces APIs, agents, evals, guardrails, multimodal capabilities, realtime audio, demos, and MCP-based app extension patterns.",
    scrimedInterpretation:
      "SCRIMED should expose modular APIs, model-router abstraction, eval loops, guardrail surfaces, and MCP-compatible connectors for enterprise adoption."
  },
  {
    name: "NVIDIA Technical Blog",
    url: "https://developer.nvidia.com/blog/",
    observedPattern:
      "Recent technical themes include AI factory operations, adaptive inference, accelerated genomics, reusable robotics workflows, simulation, and edge deployment.",
    scrimedInterpretation:
      "SCRIMED should measure throughput, latency, cost, evidence quality, and deployment portability across synthetic workflows before promoting any production execution."
  }
];

export const strategicPlatformPatterns: StrategicPlatformPattern[] = [
  {
    slug: "healthcare-ai-factory-readiness",
    title: "Healthcare AI Factory Readiness",
    priority: "platform",
    sourceNames: ["NVIDIA Healthcare and Life Sciences", "NVIDIA Technical Blog"],
    productThesis:
      "Healthcare buyers need a governed operating layer that can run agents, evidence retrieval, model routing, and workflow validation across cloud, private cloud, edge, and sovereign settings.",
    scrimedImplementation:
      "Extend AgentOS, Atlas Intelligence Core, observability, and persistent workspaces into a deployment-readiness register for cost, latency, safety, evidence provenance, and portability.",
    routes: ["/agents", "/atlas", "/observability", "/agent-workspace", "/healthcare-intelligence-os"],
    agents: ["Agent Commander", "DocuTwin", "CareExplain", "Ambient Scribe", "PayerIQ"],
    interoperabilityStandards: ["FHIR", "HL7 v2", "DICOM/DICOMweb", "X12", "C-CDA", "LOINC", "SNOMED CT"],
    governanceControls: [
      "model-router policy",
      "human-review checkpoint",
      "synthetic-only workload",
      "runtime safety gate",
      "sovereign deployment review"
    ],
    proofMetrics: ["latency", "cost-per-work-order", "override rate", "escalation rate", "evidence completeness"],
    blockedClaims: ["production authorized", "HIPAA certified", "autonomous clinical execution"],
    nextBuildStep:
      "Connect deployment-profile fixtures to buyer intake, protected workspace activation metadata, and synthetic throughput metrics."
  },
  {
    slug: "patient-centered-interoperability-layer",
    title: "Patient-Centered Interoperability Layer",
    priority: "near-term",
    sourceNames: ["Epic"],
    productThesis:
      "The winning healthcare intelligence layer must improve fragmented workflows without displacing the clinical record of truth.",
    scrimedImplementation:
      "Keep SCRIMED as a sidecar intelligence fabric that reads synthetic fixtures, validates interoperability contracts, and blocks EHR writeback until customer-approved production connectors exist.",
    routes: ["/interoperability", "/integrations", "/workflows/contracts", "/pilot-evidence"],
    agents: ["Interoperability Agent", "Clinical Intelligence Agent", "Documentation Agent"],
    interoperabilityStandards: ["FHIR R4/R5", "SMART on FHIR", "HL7 v2", "DICOMweb", "X12", "CPT/HCPCS"],
    governanceControls: [
      "connector contract",
      "fixture validation",
      "no-live-writeback gate",
      "audit trail",
      "licensed reviewer escalation"
    ],
    proofMetrics: ["fixture pass rate", "mapping completeness", "source attribution coverage", "workflow friction reduced"],
    blockedClaims: ["EHR-certified integration", "live patient sync", "clinical decision authorization"],
    nextBuildStep:
      "Promote interoperability conformance outputs into buyer proof packets and protected workspace activation evidence."
  },
  {
    slug: "evidence-backed-agent-workforce",
    title: "Evidence-Backed Agent Workforce",
    priority: "near-term",
    sourceNames: ["OpenAI Developers", "NVIDIA Healthcare and Life Sciences", "Microsoft Copilot"],
    productThesis:
      "Enterprise healthcare agents must be specialized, tool-aware, observable, and easy for humans to direct and review.",
    scrimedImplementation:
      "Use AgentOS and TrustOS as the shared orchestration, verification, audit, and human-approval layer for Sanar AI, DocuTwin, CareExplain, Ambient Scribe, TrialCore, and PayerIQ.",
    routes: ["/agents", "/trust", "/audit", "/memory", "/workflows", "/agent-workspace"],
    agents: ["Sanar AI", "DocuTwin", "CareExplain", "Ambient Scribe", "TrialCore", "PayerIQ"],
    interoperabilityStandards: ["MCP", "FHIR", "HL7", "LOINC", "RxNorm", "ICD-10", "ICD-11"],
    governanceControls: [
      "TrustQA score",
      "source attribution",
      "reviewer status",
      "model/provider log",
      "prompt/tool audit"
    ],
    proofMetrics: ["trust score", "completion rate", "review time", "rework rate", "citation coverage"],
    blockedClaims: ["clinician replacement", "autonomous diagnosis", "unreviewed treatment plan"],
    nextBuildStep:
      "Add multi-model provider profiles and fallback simulation to AgentOS task records."
  },
  {
    slug: "device-edge-and-facility-integration-pathway",
    title: "Device, Edge, and Facility Integration Pathway",
    priority: "mid-term",
    sourceNames: ["AWS Health Care", "NVIDIA Healthcare and Life Sciences"],
    productThesis:
      "Global healthcare intelligence must eventually connect operational data from imaging, labs, devices, facility systems, and regional equipment ecosystems.",
    scrimedImplementation:
      "Add a device-readiness pathway for DICOM imaging, lab equipment, patient-monitor data, medical gas/facility signals, and supplier/vendor context using synthetic connector fixtures first.",
    routes: ["/integrations", "/interoperability", "/synthetic/fixtures", "/observability"],
    agents: ["Imaging Agent", "Interoperability Agent", "Operations Agent", "Supply Chain Agent"],
    interoperabilityStandards: ["DICOM", "DICOMweb", "HL7 v2 ORU", "FHIR Device", "IEEE 11073", "IHE"],
    governanceControls: [
      "synthetic device fixture only",
      "vendor-source attribution",
      "edge deployment review",
      "facility safety exclusion",
      "no device command execution"
    ],
    proofMetrics: ["device fixture coverage", "data-quality issues surfaced", "mapping accuracy", "review escalations"],
    blockedClaims: ["medical device control", "diagnostic imaging interpretation", "facility automation authorized"],
    nextBuildStep:
      "Create synthetic device and imaging fixture scenarios for monitor, lab, DICOM, and facility-equipment workflows."
  },
  {
    slug: "outcome-proof-and-commercial-channel",
    title: "Outcome Proof and Commercial Channel",
    priority: "mid-term",
    sourceNames: ["Epic", "NVIDIA Inception", "NVIDIA Technical Blog"],
    productThesis:
      "A trillion-dollar healthcare infrastructure company compounds through measurable outcomes, trusted references, partner access, and investor-ready proof surfaces.",
    scrimedImplementation:
      "Use Sales Operations, Pilot Evidence, Governance Packs, and Investor Agent proof to track buyer outcomes, partner readiness, pricing fit, and activation gates.",
    routes: ["/sales-operations", "/pilot-evidence", "/governance-packs", "/pricing", "/product"],
    agents: ["Investor Agent", "Revenue Integrity Agent", "Governance Agent", "Operations Agent"],
    interoperabilityStandards: ["FHIR", "X12", "HL7", "CMS reporting concepts"],
    governanceControls: [
      "approved claims register",
      "non-binding proposal",
      "proof-packet audit",
      "pricing boundary",
      "external approval tracker"
    ],
    proofMetrics: ["time saved", "denial-risk surfaced", "revenue leakage identified", "conversion stage", "sales cycle risk"],
    blockedClaims: ["guaranteed savings", "guaranteed reimbursement", "customer-certified compliance"],
    nextBuildStep:
      "Connect activation governance ledger events to sales opportunities and investor proof packets."
  }
];

export const strategicPlatformRoadmap: StrategicPlatformRoadmapItem[] = [
  {
    phase: "Phase 1",
    objective: "Turn source-informed strategy into inspectable product architecture.",
    codedFoundation: "Strategic intelligence summary, API, page, and product console proof link.",
    nextBuild: "Tie strategic patterns to deployment-profile fixtures and protected workspace evidence."
  },
  {
    phase: "Phase 2",
    objective: "Operationalize AI factory and interoperability readiness.",
    codedFoundation: "AgentOS, Atlas Intelligence Core, interoperability conformance, observability, and governance packs.",
    nextBuild: "Connect cloud/private/edge/sovereign deployment profiles with buyer intake, workspace activation, and proof-packet evidence."
  },
  {
    phase: "Phase 3",
    objective: "Advance device, imaging, payer, and EHR-sidecar pilots.",
    codedFoundation: "Integration fixtures, DICOM/FHIR/HL7/X12 standards registry, and protected pilot workspaces.",
    nextBuild: "Create device and facility integration demo fixtures with no live control or diagnostic claims."
  }
];

export const strategicExecutionBets: StrategicExecutionBet[] = [
  {
    slug: "buyer-conversion-compression",
    name: "Buyer Conversion Compression",
    horizon: "now",
    thesis:
      "SCRIMED wins faster when every visitor can move from problem to package to no-PHI proof without reading the whole operating map.",
    buildMotion:
      "Keep homepage, Product Console, Offerings, Pricing, Demos, Pilots, Client Onboarding, and Company Assessment aligned around assessment, synthetic pilot, protected enterprise pilot, license, and retainer paths.",
    sellMotion:
      "Use one buyer pain, one recommended package, one proof route, one price posture, and one retained boundary in every demo or discovery call.",
    proofMetric: "Demo-to-pilot path selected before custom scope expands.",
    stopCondition: "Buyer cannot identify the next package or asks for custom work before no-PHI intake is complete.",
    owners: ["Product Console", "Revenue Operations", "Client Onboarding", "Deal Desk"],
    proofRoutes: ["/product", "/offerings", "/pricing", "/client-onboarding", "/pilot-demo-commercial-readiness"],
    retainedBoundary: "Conversion compression is not a signed quote, contract, procurement approval, ROI guarantee, or revenue guarantee."
  },
  {
    slug: "proof-before-production-risk",
    name: "Proof Before Production Risk",
    horizon: "now",
    thesis:
      "The safest strategic wedge is to show operational value with synthetic, source-attributed, no-PHI proof before protected data or live clinical authority enters scope.",
    buildMotion:
      "Turn synthetic demos, pilot evidence, Claim Guard, health-record safety checks, and protected proof release into a repeatable no-PHI evaluation ladder.",
    sellMotion:
      "Lead with no-PHI workflow assessment, synthetic pilot, trust diligence, and protected enterprise pilot as sequential buyer decisions.",
    proofMetric: "Synthetic proof packet exists before protected proof or integration conversation expands.",
    stopCondition: "Buyer requests PHI, live records, production credentials, writeback, or customer-specific proof without approval chain.",
    owners: ["TrustOS", "Pilot Evidence", "Health Records Safety", "Buyer Diligence"],
    proofRoutes: ["/demos", "/pilots", "/pilot-evidence", "/health-records", "/qa-buyer-proof-release"],
    retainedBoundary: "No-PHI proof is not PHI authority, clinical validation, customer permission, production connector approval, or live-care authorization."
  },
  {
    slug: "trust-as-procurement-advantage",
    name: "Trust As Procurement Advantage",
    horizon: "now",
    thesis:
      "SCRIMED should make governance, limitations, claim controls, and boundary escalation feel like reasons to buy, not reasons to hesitate.",
    buildMotion:
      "Surface TrustOS, Claim Guard, Boundary Resolution, Limitations Workarounds, Continuous Review, and Operational Efficiency near buyer CTAs and diligence paths.",
    sellMotion:
      "Position visible hard stops, human review, protected release, and no-overclaim language as procurement confidence accelerators.",
    proofMetric: "Every buyer-facing offer points to a trust, claim, boundary, or review proof route.",
    stopCondition: "Copy implies certification, security assurance, live clinical authority, public SLA, revenue guarantee, or autonomous remediation.",
    owners: ["TrustOS", "Legal Ops", "Security", "Claims Governance"],
    proofRoutes: ["/trust-center", "/qa-claim-guard", "/boundary-resolution", "/limitations-workarounds", "/continuous-review-audit"],
    retainedBoundary: "Trust positioning is not legal advice, certification, security assurance, managed SOC/MDR coverage, or attack-proof guarantee."
  },
  {
    slug: "interoperability-sidecar-wedge",
    name: "Interoperability Sidecar Wedge",
    horizon: "30-days",
    thesis:
      "SCRIMED can compete beside EHR, payer, and RCM incumbents by being the safer sidecar for source-attributed workflow intelligence.",
    buildMotion:
      "Package standards maps, no-PHI fixtures, synthetic extraction, patient-safety lint, connector questionnaires, and live-data gate lists into a readiness sprint.",
    sellMotion:
      "Sell interoperability readiness before production integration, especially to health-system, payer, and clinic operators who need clarity before vendor risk review.",
    proofMetric: "Standards map and no-PHI fixture set exist before any live connector conversation.",
    stopCondition: "Integration discussion requires live PHI, patient matching, payer submission, EHR writeback, or device/facility control.",
    owners: ["Interoperability", "Health Records Safety", "Clinical Governance", "Privacy"],
    proofRoutes: ["/interoperability", "/health-records", "/clinical-production-readiness", "/clinical-authority-readiness"],
    retainedBoundary: "Interoperability wedge is not production integration, PHI authority, EHR writeback approval, payer submission approval, or clinical authority."
  },
  {
    slug: "enterprise-operating-layer-license",
    name: "Enterprise Operating-Layer License",
    horizon: "60-days",
    thesis:
      "The long-term value is not a single workflow demo; it is a governed healthcare intelligence operating layer with APIs, agents, evidence, service delivery, and trust controls.",
    buildMotion:
      "Align Platform Power, Enterprise Scalability, Service Delivery, Product Console, AgentOS, TrustOS, and Operational Efficiency into an annual license plus services motion.",
    sellMotion:
      "Convert successful assessment or synthetic pilot buyers into operating-layer license, implementation work order, and governed review retainer.",
    proofMetric: "Buyer can inspect API/UI/AI controls, scale boundaries, service work orders, and trust gates before license proposal.",
    stopCondition: "Buyer requires public API SLA, managed-service commitment, production model routing, PHI, or unsupported scale equivalence.",
    owners: ["Platform", "Product Console", "Service Delivery", "Enterprise Scalability", "Finance"],
    proofRoutes: ["/platform-power", "/enterprise-scalability", "/service-delivery", "/operational-efficiency", "/agents"],
    retainedBoundary: "Operating-layer licensing is not EHR replacement, public API SLA, production hosting approval, PHI authority, or live autonomous AI."
  },
  {
    slug: "capital-and-partner-proof-room",
    name: "Capital And Partner Proof Room",
    horizon: "60-days",
    thesis:
      "Investors and strategic partners need a disciplined evidence room that shows traction logic without securities, valuation, customer, or revenue overclaims.",
    buildMotion:
      "Connect Company Assessment, Capital Vitality, Investor Audience Readiness, Growth Engine, Public Market Readiness, and protected proof rooms into one diligence packet map.",
    sellMotion:
      "Use audience-specific packets for angels, private investors, corporate strategics, faith-based clinic sponsors, payers, health systems, and public-sector partners.",
    proofMetric: "Each audience packet includes current capability, proof route, revenue motion, blocked claims, and qualified-review needs.",
    stopCondition: "Packet implies securities offering, solicitation, valuation assurance, audited financials, customer proof, reimbursement certainty, or revenue guarantee.",
    owners: ["Founder", "Capital Operations", "Finance", "Legal Ops", "Claim Guard"],
    proofRoutes: ["/company-assessment", "/capital-vitality", "/investor-audience-readiness", "/growth-engine", "/public-market-readiness"],
    retainedBoundary: "Capital proof is not investment advice, solicitation, securities material, valuation assurance, audited financial reporting, or revenue guarantee."
  },
  {
    slug: "global-approval-runway",
    name: "Global Approval Runway",
    horizon: "90-days",
    thesis:
      "Global growth requires pre-structured evidence, regional review gates, privacy/AI/cyber readiness, and certification preparation before market claims expand.",
    buildMotion:
      "Route global buyer asks through Global Certification Readiness, Approvals Readiness, Global Reach, Competitive Defense, Health Records, and Clinical Production Readiness.",
    sellMotion:
      "Offer region-specific readiness planning and no-PHI evaluation while blocking approval, certification, residency, public-sector, reimbursement, or live-care claims.",
    proofMetric: "Each target region has a readiness pack with reviewer owner, evidence class, blocked claims, and next action.",
    stopCondition: "Public language suggests regional regulatory approval, certification, public procurement approval, data residency approval, or clinical deployment authority.",
    owners: ["Global Readiness", "Legal Ops", "Privacy", "Security", "Clinical Governance"],
    proofRoutes: ["/global-certification-readiness", "/approvals-readiness", "/global-reach", "/competitive-defense", "/clinical-production-readiness"],
    retainedBoundary: "Global runway is not legal advice, certification, regional approval, procurement approval, PHI authority, or live clinical deployment."
  },
  {
    slug: "clinical-production-gate-discipline",
    name: "Clinical Production Gate Discipline",
    horizon: "90-days",
    thesis:
      "SCRIMED should keep selling current no-PHI capabilities while making the path to clinical production explicit, incomplete, and owner-driven.",
    buildMotion:
      "Keep Clinical Production Readiness, Clinical Authority Readiness, Health Records, protected workspaces, QA gates, and approval ladders synchronized.",
    sellMotion:
      "Use current safe offers for revenue while openly showing what remains before PHI, live care, connectors, regulated clinical claims, or customer go-live.",
    proofMetric: "Clinical production readiness tasks have owners, missing evidence, dependencies, current safe use, and retained boundary.",
    stopCondition: "Any external artifact implies clinical production readiness, FDA/ONC certification, HIPAA assurance, PHI processing, customer go-live, or live-care authority.",
    owners: ["Clinical Governance", "Privacy", "Security", "Product", "Release Steward"],
    proofRoutes: ["/clinical-production-readiness", "/clinical-authority-readiness", "/health-records", "/approvals-readiness", "/pilot-workspace/access"],
    retainedBoundary: "Clinical gate discipline is not legal advice, regulatory approval, HIPAA assurance, connector approval, PHI authority, or live-care authorization."
  }
];

export const strategicDecisionGates: StrategicDecisionGate[] = [
  {
    slug: "no-phi-proof-gate",
    gate: "No-PHI proof gate",
    trigger: "Buyer asks for data, record extraction, pilot proof, diligence material, or workflow evaluation.",
    decisionOwner: "TrustOS + Health Records Safety",
    requiredEvidence: ["synthetic fixture", "source attribution", "no-PHI intake", "blocked live-data claim"],
    allowIf: "Proof can be produced with synthetic or metadata-only material and current-state language.",
    blockIf: "PHI, identifiers, production credentials, live endpoints, or patient-impacting action is required.",
    proofRoutes: ["/health-records", "/pilot-evidence", "/qa-claim-guard"],
    retainedBoundary: "No-PHI proof gate does not authorize PHI, production connectors, or clinical action."
  },
  {
    slug: "buyer-proof-release-gate",
    gate: "Protected buyer proof release gate",
    trigger: "Customer-specific proof, protected packet, diligence export, or buyer room material is requested.",
    decisionOwner: "Buyer Diligence + Release Steward",
    requiredEvidence: ["AAL2 workspace", "reviewer signoff", "release decision", "recipient control", "Claim Guard language"],
    allowIf: "Release chain is complete and external language is claim-guarded.",
    blockIf: "Recipient, release authority, reviewer signoff, access log, or current-state boundary is missing.",
    proofRoutes: ["/qa-buyer-proof-release", "/buyer-release-control-run", "/pilot-workspace/access"],
    retainedBoundary: "Buyer proof release gate does not create customer permission or public proof authority."
  },
  {
    slug: "deal-desk-margin-gate",
    gate: "Deal desk and margin gate",
    trigger: "Proposal, paid pilot, renewal, discount, strategic partnership, enterprise license, or custom work request appears.",
    decisionOwner: "Finance + Deal Desk + Legal Ops",
    requiredEvidence: ["package", "scope", "price floor", "billing trigger", "margin review", "blocked claims"],
    allowIf: "Scope, margin, billing, contract authority, and no-guarantee language are reviewed.",
    blockIf: "Unpriced custom work, unsupported ROI/revenue language, payment-term uncertainty, or tax/accounting exception exists.",
    proofRoutes: ["/enterprise-business-ops", "/service-delivery", "/capital-vitality"],
    retainedBoundary: "Deal desk gate is not legal, accounting, tax, audit, securities, valuation, revenue, or profit assurance."
  },
  {
    slug: "clinical-production-gate",
    gate: "Clinical production and connector gate",
    trigger: "PHI, live clinical care, EHR/HIE/payer connector, patient matching, payer submission, writeback, or regulated clinical claim is requested.",
    decisionOwner: "Clinical Governance + Privacy + Security + Regional Counsel",
    requiredEvidence: ["clinical production task status", "qualified review", "customer authority", "security/privacy gate", "connector acceptance"],
    allowIf: "All required clinical production tasks, approvals, and customer authority are complete.",
    blockIf: "Any PHI, live-care, connector, certification, regional, or customer go-live evidence is missing.",
    proofRoutes: ["/clinical-production-readiness", "/clinical-authority-readiness", "/approvals-readiness", "/health-records"],
    retainedBoundary: "Clinical production gate is not approval, certification, PHI authority, connector approval, or live-care authorization."
  },
  {
    slug: "platform-scale-sla-gate",
    gate: "Platform scale and SLA gate",
    trigger: "Public API, production model routing, support tier, uptime, regional deployment, managed service, or scale-equivalence language is proposed.",
    decisionOwner: "Platform + Enterprise Scalability + Legal Ops",
    requiredEvidence: ["capacity assumption", "queue/backpressure plan", "incident path", "support tier", "cost guardrail", "contract review"],
    allowIf: "Language remains readiness-only or exact commitments are contract-reviewed and funded.",
    blockIf: "Public API SLA, uptime guarantee, managed service, data residency, or trillion-scale parity is implied without authority.",
    proofRoutes: ["/platform-power", "/enterprise-scalability", "/service-reliability", "/operational-efficiency"],
    retainedBoundary: "Scale gate is not public API SLA, uptime guarantee, hosting approval, managed-service commitment, or scale-equivalence proof."
  },
  {
    slug: "public-claims-and-investor-gate",
    gate: "Public claims and investor gate",
    trigger: "Website copy, sales deck, investor packet, market comparison, press language, or audience packet is updated.",
    decisionOwner: "Claim Guard + Legal Ops + Capital Operations",
    requiredEvidence: ["source route", "current capability", "blocked claims", "qualified review need", "approved no-authority text"],
    allowIf: "Language stays current-state, evidence-backed, and no-authority bounded.",
    blockIf: "Copy implies securities material, solicitation, valuation, audited financials, certification, customer proof, ROI, revenue, or legal conclusion.",
    proofRoutes: ["/qa-claim-guard", "/investor-audience-readiness", "/company-assessment", "/competitive-defense"],
    retainedBoundary: "Claims gate is not legal advice, securities material, investment advice, valuation assurance, audited financial reporting, or certification."
  }
];

export const strategicExecutionCommands: StrategicExecutionCommand[] = [
  {
    slug: "customer-facing-conversion-command",
    lane: "Customer-Facing Conversion",
    horizon: "this-week",
    priority: "critical",
    objective:
      "Turn qualified site traffic into a selected no-PHI assessment, demo, pilot, pricing path, or buyer conversation without forcing prospects through the full operating map.",
    executionMove:
      "Keep homepage, Product Console, Market Intelligence, Offerings, Pricing, Client Onboarding, and Pilot Demo Commercial Readiness aligned around one recommended buyer path per audience.",
    commercialOutcome:
      "Shorter path from interest to paid readiness assessment, synthetic pilot, or protected enterprise pilot.",
    operatingCadence:
      "Daily CTA and copy review during launch pushes; weekly proof-route review before investor, buyer, or clinic outreach.",
    owners: ["Founder", "Product marketing", "Revenue operations", "Client onboarding"],
    proofRoutes: ["/product", "/competitive-intelligence", "/offerings", "/pricing", "/client-onboarding"],
    requiredProof: [
      "audience-specific sales message",
      "recommended package",
      "price band or price posture",
      "proof route",
      "retained boundary"
    ],
    dependencies: [
      "competitive target-audience strategy",
      "pilot demo commercial readiness",
      "client onboarding communications",
      "claim guard review"
    ],
    decisionGateSlugs: ["public-claims-and-investor-gate", "deal-desk-margin-gate"],
    blockedExpansion: [
      "custom scope before no-PHI intake",
      "ROI guarantee",
      "signed quote language",
      "customer-proof claim"
    ],
    revenueMotion:
      "Convert visitors into paid assessment, demo workshop, synthetic pilot, or enterprise readiness sprint.",
    successMetric: "Every qualified buyer path resolves to one next action, one package, one proof route, and one boundary.",
    nextAction:
      "Review top CTAs and buyer packets weekly against the competitive target-audience strategy and Pilot Demo Commercial Readiness price bands.",
    retainedBoundary:
      "Conversion command is not a contract, procurement approval, legal advice, ROI guarantee, revenue guarantee, or customer permission."
  },
  {
    slug: "no-phi-proof-engine-command",
    lane: "No-PHI Proof Engine",
    horizon: "this-week",
    priority: "critical",
    objective:
      "Make proof-before-production the default execution path for every buyer, investor, clinic, and partner conversation.",
    executionMove:
      "Route demos, synthetic scenarios, health-record extraction planning, QA evidence, and buyer proof release into one no-PHI proof ladder.",
    commercialOutcome:
      "Buyers can purchase useful evaluation work now while clinical production, PHI, and connector authority remain explicitly gated.",
    operatingCadence:
      "Run proof-ladder checks before every pilot proposal, demo recap, diligence packet, and protected workspace promotion.",
    owners: ["TrustOS", "QA evidence", "Health records safety", "Pilot evidence", "Release steward"],
    proofRoutes: ["/demos", "/pilot-evidence", "/health-records", "/qa-evidence", "/qa-buyer-proof-release"],
    requiredProof: [
      "synthetic fixture",
      "source attribution",
      "human-review checkpoint",
      "blocked live-data claim",
      "proof-packet route"
    ],
    dependencies: [
      "clinical production readiness",
      "health records safety exchange",
      "QA claim guard",
      "buyer release control"
    ],
    decisionGateSlugs: ["no-phi-proof-gate", "buyer-proof-release-gate", "clinical-production-gate"],
    blockedExpansion: [
      "PHI upload",
      "patient identifier intake",
      "production credentials",
      "EHR writeback",
      "payer submission"
    ],
    revenueMotion:
      "Package no-PHI proof work as paid readiness assessment, synthetic pilot, trust diligence, and protected pilot setup.",
    successMetric: "Every external proof artifact declares synthetic/no-PHI status before value, metric, or roadmap language.",
    nextAction:
      "Attach a no-PHI proof ladder checklist to each demo-to-pilot packet and Product Readiness Brief section.",
    retainedBoundary:
      "No-PHI proof command does not authorize PHI processing, clinical validation, customer proof release, production connectors, or live care."
  },
  {
    slug: "deal-desk-margin-command",
    lane: "Deal Desk and Margin",
    horizon: "30-days",
    priority: "critical",
    objective:
      "Protect profit margin and enterprise credibility before proposals, pricing exceptions, custom service work, or strategic partnership conversations expand.",
    executionMove:
      "Require Enterprise Business Ops, Service Delivery, Growth Engine, Capital Vitality, and pricing paths before proposal release or custom work expansion.",
    commercialOutcome:
      "Fewer underpriced pilots, clearer enterprise terms, stronger cash discipline, and cleaner investor diligence.",
    operatingCadence:
      "Deal desk pass before every proposal; weekly margin exception review; monthly revenue-recognition and billing-readiness review.",
    owners: ["Deal desk", "Finance", "Legal operations", "Service delivery", "Founder"],
    proofRoutes: ["/enterprise-business-ops", "/service-delivery", "/growth-engine", "/capital-vitality", "/pricing"],
    requiredProof: [
      "package scope",
      "price floor",
      "acceptance criteria",
      "billing trigger",
      "margin review",
      "blocked claims"
    ],
    dependencies: [
      "product and services portfolio",
      "client onboarding",
      "enterprise scalability",
      "legal/accounting/tax qualified review when needed"
    ],
    decisionGateSlugs: ["deal-desk-margin-gate", "platform-scale-sla-gate", "public-claims-and-investor-gate"],
    blockedExpansion: [
      "unpriced custom work",
      "unsupported discounting",
      "profit guarantee",
      "reimbursement guarantee",
      "managed-service commitment"
    ],
    revenueMotion:
      "Move from founder-led custom work to packaged assessments, pilots, readiness sprints, operating-layer licenses, and retained governance services.",
    successMetric: "Every external proposal has scope, price posture, acceptance criteria, margin boundary, and blocked claims.",
    nextAction:
      "Make deal desk review mandatory in every pilot, enterprise, investor-sponsored clinic, and strategic partner packet.",
    retainedBoundary:
      "Deal desk command is not legal advice, tax advice, accounting advice, audited financial reporting, contract approval, revenue assurance, or profit assurance."
  },
  {
    slug: "buyer-proof-release-command",
    lane: "Buyer Proof Release",
    horizon: "30-days",
    priority: "high",
    objective:
      "Convert synthetic and protected proof into controlled buyer-diligence assets without leaking customer proof, confidential artifacts, PHI, or unapproved claims.",
    executionMove:
      "Use protected workspaces, QA Buyer Proof Release, Buyer Release Control, reviewer signoffs, lockbox controls, and evidence-room routing before external sharing.",
    commercialOutcome:
      "Higher enterprise trust with safer diligence sharing, cleaner procurement responses, and fewer approval surprises.",
    operatingCadence:
      "Release-control review before each buyer diligence packet; weekly open-blocker review for protected evidence assets.",
    owners: ["Release steward", "Buyer diligence", "Legal operations", "Security", "Customer sponsor"],
    proofRoutes: ["/pilot-workspace/access", "/qa-buyer-proof-release", "/buyer-release-control-run", "/trust-center"],
    requiredProof: [
      "AAL2 workspace",
      "release decision",
      "reviewer signoff",
      "recipient control",
      "claim-guarded language",
      "access-log reconciliation path"
    ],
    dependencies: [
      "customer permission reference",
      "external approval evidence",
      "provider security review metadata",
      "protected procurement evidence registry"
    ],
    decisionGateSlugs: ["buyer-proof-release-gate", "public-claims-and-investor-gate"],
    blockedExpansion: [
      "public customer proof",
      "unapproved export",
      "signed approval storage",
      "recipient list storage",
      "confidential artifact upload"
    ],
    revenueMotion:
      "Use controlled diligence as an enterprise sales accelerator after paid pilot setup or protected buyer-room activation.",
    successMetric: "Every buyer-specific proof asset has release status, reviewer owner, recipient boundary, and blocked export posture.",
    nextAction:
      "Require Buyer Release Control metadata before referencing protected proof in sales, investor, or strategic partner conversations.",
    retainedBoundary:
      "Buyer proof release command is not customer permission, public release approval, legal approval, security certification, PHI authority, or clinical authority."
  },
  {
    slug: "interoperability-health-records-command",
    lane: "Interoperability and Health Records",
    horizon: "30-days",
    priority: "high",
    objective:
      "Make interoperability a sellable sidecar readiness sprint while keeping production EHR, HIE, payer, imaging, and device authority blocked.",
    executionMove:
      "Package standards maps, synthetic fixture validation, health-record extraction planning, connector trust labels, safety checks, and live-use blockers.",
    commercialOutcome:
      "Health systems, payers, clinics, and technical reviewers can buy integration readiness before live connector risk enters scope.",
    operatingCadence:
      "Connector readiness review per buyer opportunity; monthly standards-map refresh; live-use blocker review before any technical claim expands.",
    owners: ["Interoperability", "Health records safety", "Security", "Clinical governance", "Implementation lead"],
    proofRoutes: ["/interoperability", "/integrations", "/health-records", "/platform-power", "/clinical-production-readiness"],
    requiredProof: [
      "standards map",
      "synthetic fixture",
      "safety check",
      "connector status label",
      "live-use blocker"
    ],
    dependencies: [
      "customer connector approval",
      "BAA/DPA readiness",
      "privacy/security review",
      "clinical authority readiness"
    ],
    decisionGateSlugs: ["no-phi-proof-gate", "clinical-production-gate", "platform-scale-sla-gate"],
    blockedExpansion: [
      "certified EHR integration",
      "live patient sync",
      "patient matching",
      "payer submission",
      "device command execution"
    ],
    revenueMotion:
      "Sell interoperability readiness sprint, health-record extraction planning, and technical buyer diligence as paid services.",
    successMetric: "Every connector conversation has a visible synthetic-ready, contract-ready, protected-gated, or blocked-live-use label.",
    nextAction:
      "Promote connector trust labels into pilot and technical sales packets for FHIR, HL7, X12, DICOM, SMART, MCP, and health-record extraction.",
    retainedBoundary:
      "Interoperability command is not production connector approval, PHI authority, EHR writeback approval, payer submission approval, device control, or clinical authority."
  },
  {
    slug: "enterprise-operating-layer-command",
    lane: "Enterprise Operating Layer",
    horizon: "60-days",
    priority: "high",
    objective:
      "Turn SCRIMED from a collection of readiness pages into an inspectable healthcare intelligence operating-layer license plus services motion.",
    executionMove:
      "Align Platform Power, Enterprise Scalability, Service Delivery, AgentOS, Atlas, TrustOS, Operational Efficiency, and Product Console into one license-ready packet.",
    commercialOutcome:
      "Creates a higher-margin enterprise path after assessments and pilots prove buyer value.",
    operatingCadence:
      "Biweekly platform readiness review; monthly enterprise package review; proposal gate before annual license language.",
    owners: ["Platform", "Product", "Enterprise scalability", "Service delivery", "Finance"],
    proofRoutes: ["/platform-power", "/enterprise-scalability", "/service-delivery", "/agents", "/trust-os", "/product"],
    requiredProof: [
      "API/UI/AI controls",
      "scale boundaries",
      "service work order",
      "support boundary",
      "cost guardrail",
      "human approval gate"
    ],
    dependencies: [
      "SLO/SLA readiness",
      "support model",
      "runtime observability",
      "model routing approval",
      "production tenancy strategy"
    ],
    decisionGateSlugs: ["platform-scale-sla-gate", "deal-desk-margin-gate", "clinical-production-gate"],
    blockedExpansion: [
      "public API SLA",
      "managed-service coverage",
      "production model routing",
      "trillion-scale equivalence",
      "PHI processing"
    ],
    revenueMotion:
      "Annual platform license plus implementation work orders, governance retainer, and paid scale-readiness reviews.",
    successMetric: "Enterprise buyer can inspect license scope, platform controls, service work, support boundary, and blocked claims before proposal.",
    nextAction:
      "Create a license-readiness packet that maps Product Console proof counts to operating-layer license scope and service-delivery work orders.",
    retainedBoundary:
      "Enterprise operating-layer command is not EHR replacement, public API SLA, managed-service commitment, production model-routing approval, PHI authority, or live autonomous AI."
  },
  {
    slug: "capital-partner-diligence-command",
    lane: "Capital and Partner Diligence",
    horizon: "60-days",
    priority: "high",
    objective:
      "Prepare investor, clinic sponsor, corporate strategic, payer, health-system, and partner conversations with evidence-rich packets that do not become securities or valuation materials.",
    executionMove:
      "Connect Company Assessment, Investor Audience Readiness, Capital Vitality, Growth Engine, Competitive Intelligence, Public Market Readiness, and protected evidence rooms.",
    commercialOutcome:
      "More credible fundraising, sponsorship, strategic-partner, and enterprise conversations without unsafe financial or customer claims.",
    operatingCadence:
      "Packet review before every capital or strategic conversation; monthly moat and milestone refresh; claim-guard pass before deck release.",
    owners: ["Founder", "Capital operations", "Finance", "Legal operations", "Product strategy"],
    proofRoutes: [
      "/company-assessment",
      "/investor-audience-readiness",
      "/capital-vitality",
      "/growth-engine",
      "/public-market-readiness",
      "/competitive-intelligence"
    ],
    requiredProof: [
      "current capability",
      "moat evidence",
      "revenue motion",
      "milestone",
      "blocked claims",
      "qualified-review need"
    ],
    dependencies: [
      "audience-specific packet",
      "deal desk review",
      "finance methodology",
      "public-market claim controls"
    ],
    decisionGateSlugs: ["public-claims-and-investor-gate", "deal-desk-margin-gate", "buyer-proof-release-gate"],
    blockedExpansion: [
      "securities offering",
      "solicitation",
      "valuation assurance",
      "audited financials",
      "acquisition implication",
      "customer revenue guarantee"
    ],
    revenueMotion:
      "Use readiness packets to convert interest into assessments, pilot sponsorships, strategic exploration, and enterprise partner diligence.",
    successMetric: "Each audience packet separates approved proof, readiness work, open gaps, blocked claims, and next investable milestone.",
    nextAction:
      "Refresh investor and strategic packets after every deployed capability release with claim-guarded proof and no-securities boundaries.",
    retainedBoundary:
      "Capital and partner diligence command is not investment advice, securities material, solicitation, valuation assurance, audited financial reporting, tax advice, or revenue guarantee."
  },
  {
    slug: "clinical-global-approval-command",
    lane: "Clinical and Global Approval Runway",
    horizon: "90-days",
    priority: "sequenced",
    objective:
      "Keep domestic and global production readiness explicit while SCRIMED monetizes current no-PHI capabilities and builds evidence for future approval work.",
    executionMove:
      "Synchronize Clinical Production Readiness, Clinical Authority Readiness, Approvals Readiness, Global Certification Readiness, Global Reach, Health Records, and Continuous Review.",
    commercialOutcome:
      "Credible global and clinical conversations without claiming approval before external review, customer authority, or certification evidence exists.",
    operatingCadence:
      "Monthly clinical/global readiness review; region-specific packet review before external outreach; immediate Claim Guard escalation for approval language.",
    owners: ["Clinical governance", "Privacy", "Security", "Regional counsel", "Global readiness"],
    proofRoutes: [
      "/clinical-production-readiness",
      "/clinical-authority-readiness",
      "/approvals-readiness",
      "/global-certification-readiness",
      "/global-reach",
      "/continuous-review-audit"
    ],
    requiredProof: [
      "clinical production task status",
      "approval track",
      "regional evidence class",
      "external reviewer owner",
      "blocked public claim"
    ],
    dependencies: [
      "qualified legal/regulatory review",
      "security certification roadmap",
      "customer authority",
      "regional privacy review",
      "clinical validation plan"
    ],
    decisionGateSlugs: ["clinical-production-gate", "public-claims-and-investor-gate", "no-phi-proof-gate"],
    blockedExpansion: [
      "FDA clearance",
      "ONC certification",
      "HIPAA assurance",
      "EU AI Act conformity",
      "GDPR assurance",
      "live clinical deployment"
    ],
    revenueMotion:
      "Sell readiness planning, no-PHI evaluation, certification preparation, and regional partner discovery while production approval remains gated.",
    successMetric: "Every clinical or global opportunity has a region/use-case pack, approval blocker list, reviewer owner, and safe current offer.",
    nextAction:
      "Use clinical/global readiness reviews to prioritize which approval packets deserve qualified external counsel or auditor engagement first.",
    retainedBoundary:
      "Clinical/global approval command is not legal advice, regulatory approval, HIPAA assurance, certification, regional approval, PHI authority, or live clinical care."
  }
];

export const strategicExecutionScorecards: StrategicExecutionScorecard[] = [
  {
    commandSlug: "customer-facing-conversion-command",
    commandLane: "Customer-Facing Conversion",
    scoreState: "active",
    evidenceState: "proof-ready",
    strategicSignal:
      "Public routes already expose buyer pathways, competitive audience strategy, offerings, pricing, onboarding, and pilot-commercial readiness.",
    currentProof: [
      "/product",
      "/competitive-intelligence",
      "/offerings",
      "/pricing",
      "/client-onboarding",
      "/pilot-demo-commercial-readiness"
    ],
    missingProof: [
      "weekly CTA review artifact",
      "buyer-path analytics export",
      "deal-source conversion cohort"
    ],
    leadingIndicator:
      "Qualified visitor can identify a next package, proof route, and boundary without a custom discovery detour.",
    laggingIndicator:
      "Paid assessment, demo workshop, synthetic pilot, or enterprise readiness sprint is selected before custom scope expands.",
    nextCheckpoint:
      "Review homepage, Product Console, Competitive Intelligence, Offerings, Pricing, and Client Onboarding copy against the target-audience strategy.",
    escalationPath:
      "Product marketing -> Claim Guard -> Deal Desk when a CTA implies ROI, customer proof, quote, or procurement authority.",
    promotionCriteria: [
      "each target audience has one recommended offer path",
      "price posture or band is visible",
      "CTA routes to no-PHI intake or onboarding",
      "blocked claims are visible before proposal language"
    ],
    demotionTriggers: [
      "custom scope is requested before no-PHI intake",
      "buyer cannot identify next step",
      "CTA implies signed quote",
      "ROI or customer-proof language appears without review"
    ],
    retainedBoundary:
      "Conversion scorecard is not a signed quote, contract, procurement approval, customer permission, ROI guarantee, or revenue guarantee."
  },
  {
    commandSlug: "no-phi-proof-engine-command",
    commandLane: "No-PHI Proof Engine",
    scoreState: "active",
    evidenceState: "proof-ready",
    strategicSignal:
      "Demos, pilot evidence, health-record safety, QA evidence, and proof-release controls already keep no-PHI proof ahead of production requests.",
    currentProof: ["/demos", "/pilot-evidence", "/health-records", "/qa-evidence", "/qa-buyer-proof-release"],
    missingProof: [
      "buyer-specific no-PHI proof ladder checklist",
      "demo-to-pilot proof-packet template",
      "approved proof-language registry for each demo"
    ],
    leadingIndicator:
      "Every proof request is classified as synthetic, metadata-only, protected, or blocked before artifacts are shared.",
    laggingIndicator:
      "External proof packets retain no-PHI status, source attribution, human review, and blocked live-data claims.",
    nextCheckpoint:
      "Attach the no-PHI proof ladder to every demo recap, pilot proposal, diligence packet, and protected workspace promotion.",
    escalationPath:
      "TrustOS -> Health Records Safety -> Clinical Production Readiness when a buyer asks for PHI, identifiers, credentials, writeback, or payer submission.",
    promotionCriteria: [
      "synthetic fixture exists",
      "source attribution exists",
      "human-review checkpoint is named",
      "live-data blocker is declared"
    ],
    demotionTriggers: [
      "PHI upload requested",
      "patient identifier intake appears",
      "production credentials requested",
      "EHR writeback or payer submission enters scope"
    ],
    retainedBoundary:
      "No-PHI proof scorecard does not authorize PHI processing, customer proof release, clinical validation, production connectors, or live clinical care."
  },
  {
    commandSlug: "deal-desk-margin-command",
    commandLane: "Deal Desk and Margin",
    scoreState: "watch",
    evidenceState: "proof-building",
    strategicSignal:
      "Enterprise Business Ops, Service Delivery, Growth Engine, Capital Vitality, and pricing are coded, but proposal release should become mandatory-gated.",
    currentProof: ["/enterprise-business-ops", "/service-delivery", "/growth-engine", "/capital-vitality", "/pricing"],
    missingProof: [
      "mandatory deal desk release checkbox",
      "proposal-level margin snapshot",
      "revenue-recognition triage note"
    ],
    leadingIndicator:
      "Every opportunity has package scope, price posture, acceptance criteria, billing trigger, and blocked claims before proposal release.",
    laggingIndicator:
      "Discounts, custom work, and strategic partnerships keep approved margin and external-review posture.",
    nextCheckpoint:
      "Add deal-desk review to every pilot, enterprise, investor-sponsored clinic, and strategic partner packet before proposal language expands.",
    escalationPath:
      "Revenue operations -> Finance -> Legal operations -> Founder when scope, margin, or contract authority is incomplete.",
    promotionCriteria: [
      "price floor retained",
      "scope and acceptance criteria defined",
      "billing trigger documented",
      "profit and reimbursement guarantees blocked"
    ],
    demotionTriggers: [
      "unpriced custom work appears",
      "discount lacks margin review",
      "payment terms are unclear",
      "proposal implies profit, revenue, or reimbursement guarantee"
    ],
    retainedBoundary:
      "Deal desk scorecard is not legal advice, accounting advice, tax advice, audited financial reporting, contract approval, revenue assurance, or profit assurance."
  },
  {
    commandSlug: "buyer-proof-release-command",
    commandLane: "Buyer Proof Release",
    scoreState: "watch",
    evidenceState: "proof-building",
    strategicSignal:
      "Protected release controls exist, but external buyer proof should remain controlled until release authority, recipient, and reviewer records are complete.",
    currentProof: ["/pilot-workspace/access", "/qa-buyer-proof-release", "/buyer-release-control-run", "/trust-center"],
    missingProof: [
      "buyer-specific release authority reference",
      "recipient-control attestation",
      "buyer proof release approval packet"
    ],
    leadingIndicator:
      "Every buyer-specific proof request has release state, reviewer owner, recipient boundary, and export posture before sharing.",
    laggingIndicator:
      "Enterprise diligence packets move faster without public customer-proof, confidential artifact, or PHI leakage.",
    nextCheckpoint:
      "Require Buyer Release Control metadata before protected proof is referenced in sales, investor, or strategic partner materials.",
    escalationPath:
      "Release steward -> Legal operations -> Security -> Customer sponsor when proof is customer-specific or externally distributable.",
    promotionCriteria: [
      "AAL2 workspace exists",
      "release decision recorded",
      "reviewer signoff linked",
      "recipient control and claim guard complete"
    ],
    demotionTriggers: [
      "public customer proof requested",
      "unapproved export requested",
      "signed approval storage requested",
      "recipient list or confidential artifact would enter product storage"
    ],
    retainedBoundary:
      "Buyer proof scorecard is not customer permission, public release approval, legal approval, security certification, PHI authority, or clinical authority."
  },
  {
    commandSlug: "interoperability-health-records-command",
    commandLane: "Interoperability and Health Records",
    scoreState: "active",
    evidenceState: "proof-ready",
    strategicSignal:
      "Standards maps, fixtures, health-record extraction planning, platform-power controls, and clinical production blockers are visible enough to sell readiness safely.",
    currentProof: ["/interoperability", "/integrations", "/health-records", "/platform-power", "/clinical-production-readiness"],
    missingProof: [
      "buyer-facing connector trust catalog",
      "technical-sales readiness packet",
      "connector status label on pilot packets"
    ],
    leadingIndicator:
      "Connector discussions use synthetic-ready, contract-ready, protected-gated, or blocked-live-use status labels.",
    laggingIndicator:
      "Technical buyers purchase integration readiness before live connector, PHI, EHR writeback, or payer submission scope expands.",
    nextCheckpoint:
      "Promote connector trust labels into pilot and technical sales packets for FHIR, HL7, X12, DICOM, SMART, MCP, and extraction planning.",
    escalationPath:
      "Interoperability -> Health Records Safety -> Privacy/Security -> Clinical Governance when a live-data or production connector request appears.",
    promotionCriteria: [
      "standards map exists",
      "synthetic fixture exists",
      "safety check exists",
      "live-use blocker is visible"
    ],
    demotionTriggers: [
      "certified EHR integration is implied",
      "live patient sync requested",
      "patient matching enters scope",
      "payer submission or device command execution appears"
    ],
    retainedBoundary:
      "Interoperability scorecard is not production connector approval, PHI authority, EHR writeback approval, payer submission approval, device control, or clinical authority."
  },
  {
    commandSlug: "enterprise-operating-layer-command",
    commandLane: "Enterprise Operating Layer",
    scoreState: "sequenced",
    evidenceState: "proof-building",
    strategicSignal:
      "Platform Power, Enterprise Scalability, Service Delivery, agents, TrustOS, and Product Console exist, but annual license packaging needs a readiness packet.",
    currentProof: ["/platform-power", "/enterprise-scalability", "/service-delivery", "/agents", "/trust-os", "/product"],
    missingProof: [
      "operating-layer license-readiness packet",
      "support model assumptions",
      "production tenancy and SLO language gate"
    ],
    leadingIndicator:
      "Enterprise buyers can inspect license scope, service work, platform controls, support boundary, and blocked claims before proposal.",
    laggingIndicator:
      "Assessment and pilot buyers convert into annual license, implementation work order, governance retainer, or scale-readiness review.",
    nextCheckpoint:
      "Create a license-readiness packet mapping Product Console proof counts to operating-layer scope, service work orders, and support boundaries.",
    escalationPath:
      "Platform -> Enterprise Scalability -> Service Delivery -> Finance/Legal when annual license or managed-service language appears.",
    promotionCriteria: [
      "API/UI/AI controls visible",
      "scale boundary visible",
      "service work order visible",
      "support and cost guardrails visible"
    ],
    demotionTriggers: [
      "public API SLA implied",
      "managed-service coverage implied",
      "production model routing implied",
      "PHI processing or scale-equivalence proof claimed"
    ],
    retainedBoundary:
      "Enterprise scorecard is not EHR replacement, public API SLA, managed-service commitment, production model-routing approval, PHI authority, or live autonomous AI."
  },
  {
    commandSlug: "capital-partner-diligence-command",
    commandLane: "Capital and Partner Diligence",
    scoreState: "watch",
    evidenceState: "proof-building",
    strategicSignal:
      "Company Assessment, Investor Audience Readiness, Capital Vitality, Growth Engine, Public Market Readiness, and Competitive Intelligence exist, but packets need release discipline.",
    currentProof: [
      "/company-assessment",
      "/investor-audience-readiness",
      "/capital-vitality",
      "/growth-engine",
      "/public-market-readiness",
      "/competitive-intelligence"
    ],
    missingProof: [
      "current investor packet version",
      "claim-guarded moat evidence index",
      "qualified finance/legal review note for sensitive materials"
    ],
    leadingIndicator:
      "Each capital or partner packet separates approved proof, readiness work, open gaps, blocked claims, and next investable milestone.",
    laggingIndicator:
      "Investor, clinic sponsor, corporate strategic, payer, health-system, and partner conversations convert into diligence next steps without securities drift.",
    nextCheckpoint:
      "Refresh investor and strategic packets after each deployed capability release with claim-guarded proof and no-securities boundaries.",
    escalationPath:
      "Founder -> Capital operations -> Finance -> Legal operations -> Claim Guard when investment, valuation, customer, or revenue language expands.",
    promotionCriteria: [
      "current capability documented",
      "moat evidence linked",
      "revenue motion bounded",
      "blocked claims and qualified-review needs visible"
    ],
    demotionTriggers: [
      "securities offering implied",
      "valuation assurance implied",
      "audited financials implied",
      "acquisition interest or customer revenue guarantee implied"
    ],
    retainedBoundary:
      "Capital scorecard is not investment advice, securities material, solicitation, valuation assurance, audited financial reporting, tax advice, or revenue guarantee."
  },
  {
    commandSlug: "clinical-global-approval-command",
    commandLane: "Clinical and Global Approval Runway",
    scoreState: "sequenced",
    evidenceState: "external-review-required",
    strategicSignal:
      "Clinical Production Readiness, Clinical Authority, Approvals, Global Certification, Global Reach, and Continuous Review are structured, but production/global claims require qualified review.",
    currentProof: [
      "/clinical-production-readiness",
      "/clinical-authority-readiness",
      "/approvals-readiness",
      "/global-certification-readiness",
      "/global-reach",
      "/continuous-review-audit"
    ],
    missingProof: [
      "qualified legal/regulatory review",
      "external security/certification evidence",
      "customer authority and clinical validation plan"
    ],
    leadingIndicator:
      "Every clinical or global opportunity has a region/use-case pack, approval blockers, reviewer owner, and safe current offer.",
    laggingIndicator:
      "SCRIMED monetizes readiness planning and no-PHI evaluation without claiming clinical or regional production approval early.",
    nextCheckpoint:
      "Prioritize which approval packets deserve qualified external counsel, auditor, security, or clinical-governance engagement first.",
    escalationPath:
      "Clinical Governance -> Privacy/Security -> Regional Counsel -> Founder when approval, certification, PHI, or live-care language appears.",
    promotionCriteria: [
      "clinical production task status is current",
      "approval track is defined",
      "regional evidence class is defined",
      "external reviewer owner is named"
    ],
    demotionTriggers: [
      "FDA clearance implied",
      "HIPAA assurance implied",
      "EU AI Act or GDPR assurance implied",
      "live clinical deployment implied"
    ],
    retainedBoundary:
      "Clinical/global scorecard is not legal advice, regulatory approval, HIPAA assurance, certification, regional approval, PHI authority, or live clinical care."
  }
];

export function getStrategicPlatformIntelligenceSummary() {
  const competitiveMarketIntelligence = getCompetitiveMarketIntelligenceSummary();
  const standards = Array.from(
    new Set(strategicPlatformPatterns.flatMap((pattern) => pattern.interoperabilityStandards))
  );
  const agents = Array.from(new Set(strategicPlatformPatterns.flatMap((pattern) => pattern.agents)));
  const routes = Array.from(new Set(strategicPlatformPatterns.flatMap((pattern) => pattern.routes)));
  const commandProofRoutes = Array.from(
    new Set(strategicExecutionCommands.flatMap((command) => command.proofRoutes))
  );
  const commandBlockedExpansions = Array.from(
    new Set(strategicExecutionCommands.flatMap((command) => command.blockedExpansion))
  );
  const commandDecisionGateSlugs = Array.from(
    new Set(strategicExecutionCommands.flatMap((command) => command.decisionGateSlugs))
  );
  const scorecardCurrentProofRoutes = Array.from(
    new Set(strategicExecutionScorecards.flatMap((scorecard) => scorecard.currentProof))
  );
  const scorecardMissingProof = Array.from(
    new Set(strategicExecutionScorecards.flatMap((scorecard) => scorecard.missingProof))
  );
  const scorecardPromotionCriteria = Array.from(
    new Set(strategicExecutionScorecards.flatMap((scorecard) => scorecard.promotionCriteria))
  );
  const scorecardDemotionTriggers = Array.from(
    new Set(strategicExecutionScorecards.flatMap((scorecard) => scorecard.demotionTriggers))
  );

  return {
    service: "scrimed-strategic-platform-intelligence",
    status: "source-informed-strategy-coded",
    route: "/strategic-intelligence",
    apiRoute: "/api/strategic-intelligence",
    reviewedAt: "2026-06-27",
    boundary:
      "This layer translates public strategy signals into SCRIMED product architecture. It does not copy third-party products, assert partnerships, certify compliance, or authorize live clinical execution.",
    sourceCount: strategicPlatformSources.length,
    patternCount: strategicPlatformPatterns.length,
    roadmapCount: strategicPlatformRoadmap.length,
    executionBetCount: strategicExecutionBets.length,
    executeNowBetCount: strategicExecutionBets.filter((bet) => bet.horizon === "now").length,
    thirtyDayBetCount: strategicExecutionBets.filter((bet) => bet.horizon === "30-days").length,
    sixtyDayBetCount: strategicExecutionBets.filter((bet) => bet.horizon === "60-days").length,
    ninetyDayBetCount: strategicExecutionBets.filter((bet) => bet.horizon === "90-days").length,
    decisionGateCount: strategicDecisionGates.length,
    executionCommandCount: strategicExecutionCommands.length,
    criticalExecutionCommandCount: strategicExecutionCommands.filter(
      (command) => command.priority === "critical"
    ).length,
    thisWeekExecutionCommandCount: strategicExecutionCommands.filter(
      (command) => command.horizon === "this-week"
    ).length,
    thirtyDayExecutionCommandCount: strategicExecutionCommands.filter(
      (command) => command.horizon === "30-days"
    ).length,
    sixtyDayExecutionCommandCount: strategicExecutionCommands.filter(
      (command) => command.horizon === "60-days"
    ).length,
    ninetyDayExecutionCommandCount: strategicExecutionCommands.filter(
      (command) => command.horizon === "90-days"
    ).length,
    executionCommandProofRouteCount: commandProofRoutes.length,
    executionCommandBlockedExpansionCount: commandBlockedExpansions.length,
    executionCommandDecisionGateCount: commandDecisionGateSlugs.length,
    executionScorecardCount: strategicExecutionScorecards.length,
    activeExecutionScorecardCount: strategicExecutionScorecards.filter(
      (scorecard) => scorecard.scoreState === "active"
    ).length,
    watchExecutionScorecardCount: strategicExecutionScorecards.filter(
      (scorecard) => scorecard.scoreState === "watch"
    ).length,
    sequencedExecutionScorecardCount: strategicExecutionScorecards.filter(
      (scorecard) => scorecard.scoreState === "sequenced"
    ).length,
    proofReadyExecutionScorecardCount: strategicExecutionScorecards.filter(
      (scorecard) => scorecard.evidenceState === "proof-ready"
    ).length,
    proofBuildingExecutionScorecardCount: strategicExecutionScorecards.filter(
      (scorecard) => scorecard.evidenceState === "proof-building"
    ).length,
    externalReviewExecutionScorecardCount: strategicExecutionScorecards.filter(
      (scorecard) => scorecard.evidenceState === "external-review-required"
    ).length,
    executionScorecardCurrentProofRouteCount: scorecardCurrentProofRoutes.length,
    executionScorecardMissingProofCount: scorecardMissingProof.length,
    executionScorecardPromotionCriterionCount: scorecardPromotionCriteria.length,
    executionScorecardDemotionTriggerCount: scorecardDemotionTriggers.length,
    competitiveMarketIntelligenceStatus: competitiveMarketIntelligence.status,
    competitiveMarketIntelligenceRoute: competitiveMarketIntelligence.route,
    competitiveMarketIntelligenceApiRoute: competitiveMarketIntelligence.apiRoute,
    competitorSourceCount: competitiveMarketIntelligence.sourceCount,
    competitorBuildPatternCount: competitiveMarketIntelligence.patternCount,
    competitorInitiativeCount: competitiveMarketIntelligence.initiativeCount,
    competitorProofMetricCount: competitiveMarketIntelligence.proofMetricCount,
    competitorBlockedClaimCount: competitiveMarketIntelligence.blockedClaimCount,
    standards,
    agents,
    routes,
    sources: strategicPlatformSources,
    patterns: strategicPlatformPatterns,
    roadmap: strategicPlatformRoadmap,
    executionBets: strategicExecutionBets,
    decisionGates: strategicDecisionGates,
    executionCommands: strategicExecutionCommands,
    executionCommandProofRoutes: commandProofRoutes,
    executionCommandBlockedExpansions: commandBlockedExpansions,
    executionCommandDecisionGateSlugs: commandDecisionGateSlugs,
    executionScorecards: strategicExecutionScorecards,
    executionScorecardCurrentProofRoutes: scorecardCurrentProofRoutes,
    executionScorecardMissingProof: scorecardMissingProof,
    executionScorecardPromotionCriteria: scorecardPromotionCriteria,
    executionScorecardDemotionTriggers: scorecardDemotionTriggers,
    competitiveMarketIntelligence,
    recommendedStrategicSequence:
      "Run the now bets first: buyer conversion compression, proof before production risk, and trust as procurement advantage. Then execute the customer-facing conversion command and no-PHI proof engine this week, deal desk, buyer proof release, and interoperability commands within 30 days, enterprise operating-layer and capital diligence commands within 60 days, and clinical/global approval runway within 90 days only when their decision gates are satisfied.",
    nextBuildStep:
      "Use the Strategic Execution Command Plan and Scorecards as the operating queue: run critical this-week commands first, require deal desk and proof-release discipline for 30-day expansion, package operating-layer and capital diligence motions within 60 days, and keep clinical/global approval work sequenced behind qualified review until evidence state improves."
  };
}

export function buildStrategicPlatformIntelligenceBrief() {
  const summary = getStrategicPlatformIntelligenceSummary();

  return [
    "# SCRIMED Strategic Platform Intelligence Brief",
    "",
    `Status: ${summary.status}`,
    `Reviewed: ${summary.reviewedAt}`,
    `Boundary: ${summary.boundary}`,
    `Execution bets: ${summary.executionBetCount}`,
    `Decision gates: ${summary.decisionGateCount}`,
    `Execution commands: ${summary.executionCommandCount}`,
    `Critical commands: ${summary.criticalExecutionCommandCount}`,
    `Execution scorecards: ${summary.executionScorecardCount}`,
    `Proof-ready scorecards: ${summary.proofReadyExecutionScorecardCount}`,
    "",
    "## Recommended Strategic Sequence",
    summary.recommendedStrategicSequence,
    "",
    "## Strategic Execution Command Plan",
    ...summary.executionCommands.map(
      (command) =>
        `- ${command.lane} (${command.horizon}, ${command.priority}): ${command.objective} Move: ${command.executionMove} Revenue: ${command.revenueMotion} Metric: ${command.successMetric} Blocked expansion: ${command.blockedExpansion.join(", ")} Boundary: ${command.retainedBoundary}`
    ),
    "",
    "## Strategic Execution Scorecards",
    ...summary.executionScorecards.map(
      (scorecard) =>
        `- ${scorecard.commandLane} (${scorecard.scoreState}, ${scorecard.evidenceState}): ${scorecard.strategicSignal} Leading: ${scorecard.leadingIndicator} Lagging: ${scorecard.laggingIndicator} Missing proof: ${scorecard.missingProof.join(", ")} Escalation: ${scorecard.escalationPath} Boundary: ${scorecard.retainedBoundary}`
    ),
    "",
    "## Source-Informed Patterns",
    ...summary.patterns.flatMap((pattern) => [
      `- ${pattern.title}: ${pattern.productThesis}`,
      `  Implementation: ${pattern.scrimedImplementation}`,
      `  Next build: ${pattern.nextBuildStep}`
    ]),
    "",
    "## Roadmap",
    ...summary.roadmap.map((item) => `- ${item.phase}: ${item.objective} -> ${item.nextBuild}`),
    "",
    "## Strategic Execution Bets",
    ...summary.executionBets.map(
      (bet) =>
        `- ${bet.name} (${bet.horizon}): ${bet.thesis} Build: ${bet.buildMotion} Sell: ${bet.sellMotion} Metric: ${bet.proofMetric} Stop: ${bet.stopCondition} Boundary: ${bet.retainedBoundary}`
    ),
    "",
    "## Strategic Decision Gates",
    ...summary.decisionGates.map(
      (gate) =>
        `- ${gate.gate}: Trigger: ${gate.trigger} Owner: ${gate.decisionOwner}. Allow: ${gate.allowIf} Block: ${gate.blockIf} Boundary: ${gate.retainedBoundary}`
    ),
    "",
    "## Sources",
    ...summary.sources.map((source) => `- ${source.name}: ${source.url}`)
  ].join("\n");
}
