export type OperatingModel = {
  name: string;
  route: string;
  audience: string;
  role: string;
  boundary: string;
};

export type OperatingContext = {
  company: string;
  founder: string;
  slogan: string;
  mission: string;
  longTermVision: string;
  principles: string[];
  qualityStandard: string[];
  engineeringPhilosophy: string[];
  aiFormula: string;
  strategicDirections: string[];
  ecosystemComponents: string[];
  interoperabilityTargets: string[];
  securityControls: string[];
  agentRequirements: string[];
  globalPriorityRegions: string[];
  operatingModels: OperatingModel[];
  decisionFramework: string[];
  ultimateObjective: string;
  updated: string;
};

export const operatingContext: OperatingContext = {
  company: "SCRIMED SOLUTIONS",
  founder: "Temitayo Dahunsi",
  slogan: "Solving For A Better Tomorrow.",
  mission:
    "Improve healthcare worldwide through intelligent, trustworthy, scalable, secure, and interoperable AI systems that create measurable value for patients, clinicians, health systems, payers, governments, researchers, and underserved populations.",
  longTermVision:
    "Build the world's leading healthcare intelligence ecosystem and healthcare operating system, connecting workflows, AI agents, interoperability, clinical intelligence, education, governance, and transformation.",
  principles: [
    "Prioritize patient outcomes.",
    "Empower clinicians rather than replace them.",
    "Prioritize trust, safety, transparency, and explainability.",
    "Choose long-term quality over short-term speed.",
    "Build connectors and interoperability instead of silos.",
    "Favor scalable architecture over temporary solutions.",
    "Measure impact instead of optimizing for hype."
  ],
  qualityStandard: [
    "secure",
    "scalable",
    "maintainable",
    "interoperable",
    "compliant",
    "explainable",
    "trustworthy",
    "user-friendly",
    "future-proof",
    "clinically useful"
  ],
  engineeringPhilosophy: [
    "modular architecture",
    "API-first architecture",
    "MCP-compatible architecture",
    "agent-native architecture",
    "event-driven architecture",
    "cloud-agnostic deployment",
    "sovereign-cloud readiness",
    "human-in-the-loop controls",
    "auditability layers",
    "security-by-design",
    "compliance-by-design"
  ],
  aiFormula:
    "Human Expertise + AI Intelligence + Trust Layer + Workflow Integration = Superior Outcomes",
  strategicDirections: [
    "Healthcare Operating System",
    "Human-Agent Clinical Execution Platform",
    "Healthcare Intelligence Layer",
    "Trust and Governance Infrastructure",
    "Healthcare Agent Marketplace",
    "Healthcare Data and Interoperability Fabric",
    "Global Healthcare Education Platform",
    "Clinical Intelligence Platform",
    "Healthcare Transformation Platform",
    "Global Healthcare Infrastructure Layer"
  ],
  ecosystemComponents: [
    "SCRIMED OS",
    "SCRIMED Atlas",
    "FaithCore",
    "Sanar AI",
    "MyVitals AI",
    "DocuTwin",
    "CareExplain",
    "Ambient Scribe",
    "Co-Pilot Intake",
    "Perfect Chart",
    "TrialCore",
    "Onco-ID",
    "Trust Engine",
    "Agent Commander",
    "SCRIMED University",
    "Atlas Trust Systems Stack",
    "Healthcare Agent Marketplace",
    "Human-Agent Clinical Execution System"
  ],
  interoperabilityTargets: [
    "EHRs",
    "payers",
    "hospitals",
    "clinics",
    "governments",
    "public health systems",
    "wearables",
    "medical devices",
    "research platforms",
    "data warehouses",
    "clinical systems",
    "FHIR ecosystems",
    "HL7 ecosystems",
    "future healthcare standards"
  ],
  securityControls: [
    "Zero Trust",
    "least privilege",
    "role-based access control",
    "audit logging",
    "encryption",
    "monitoring",
    "governance controls",
    "identity management",
    "secure-by-default design"
  ],
  agentRequirements: [
    "governed",
    "auditable",
    "explainable",
    "secure",
    "observable",
    "human-supervised",
    "role-scoped",
    "interoperable"
  ],
  globalPriorityRegions: [
    "United States",
    "UAE",
    "Saudi Arabia",
    "Kuwait",
    "Nigeria",
    "Kenya",
    "Rwanda",
    "Ghana",
    "Europe"
  ],
  operatingModels: [
    {
      name: "SCRIMED Atlas",
      route: "/atlas",
      audience: "Hospitals, governments, payers, and enterprise healthcare organizations.",
      role:
        "Faith-neutral, compliance-centered operating model for governance, trust, ROI, interoperability, and agentic workflows.",
      boundary:
        "Enterprise Atlas surfaces must remain procurement-ready, compliance-focused, and institutionally neutral."
    },
    {
      name: "FaithCore",
      route: "/faithcore",
      audience: "Patients, communities, care teams, and organizations that opt into spiritually aligned support.",
      role:
        "Spiritually aligned trust and encouragement layer that supports dignity, hope, ethical governance, and whole-person care.",
      boundary:
        "FaithCore must never replace clinical judgment, medical guidance, emergency care, consent, or professional standards."
    }
  ],
  decisionFramework: [
    "Does this improve healthcare outcomes?",
    "Does this improve patient experience?",
    "Does this improve clinician experience?",
    "Does this improve trust?",
    "Does this improve interoperability?",
    "Does this improve scalability?",
    "Does this improve efficiency?",
    "Does this improve security?",
    "Does this strengthen the SCRIMED ecosystem?",
    "Is this best-in-class?"
  ],
  ultimateObjective:
    "Build the most trusted healthcare intelligence company in the world and improve healthcare globally through excellence, integrity, safety, interoperability, scalability, and long-term thinking.",
  updated: "2026-05-29"
};

export function getOperatingContextSummary() {
  return {
    service: "scrimed-operating-context",
    company: operatingContext.company,
    slogan: operatingContext.slogan,
    mission: operatingContext.mission,
    longTermVision: operatingContext.longTermVision,
    operatingModels: operatingContext.operatingModels,
    principles: operatingContext.principles,
    qualityStandard: operatingContext.qualityStandard,
    interoperabilityTargets: operatingContext.interoperabilityTargets,
    decisionFramework: operatingContext.decisionFramework,
    updated: operatingContext.updated
  };
}
