import { getAgentOSSummary } from "./agentOS";
import { getAtlasIntelligenceCoreSummary } from "./atlasIntelligenceCore";
import { getInteroperabilitySummary } from "./interoperabilityStandards";
import { getProtectedPilotWorkspaceSummary } from "./protectedPilotWorkspace";
import { getTrustOSSummary } from "./trustOS";

export type IntelligencePhaseId = "phase-1" | "phase-2" | "phase-3" | "phase-4";

export type IntelligenceBuildStatus =
  | "foundation-online"
  | "foundation-contract"
  | "production-gated"
  | "planned"
  | "external-review-required";

export type HealthcareIntelligencePhase = {
  id: IntelligencePhaseId;
  name: string;
  status: IntelligenceBuildStatus;
  objective: string;
  components: string[];
  currentEvidence: string[];
  productionGates: string[];
};

export type ClinicalKnowledgeGraphStandard = {
  name: string;
  role: string;
  currentUse: string;
  productionGate: string;
};

export type ClinicalKnowledgeGraphNode = {
  kind: string;
  purpose: string;
  standardBindings: string[];
};

export type ClinicalKnowledgeGraphRelationship = {
  relationship: string;
  purpose: string;
  reviewBoundary: string;
};

export type ValidationTrustLabField = {
  field: string;
  required: boolean;
  status: IntelligenceBuildStatus;
  purpose: string;
  validationBoundary: string;
};

export type AgentRuntimeCapability = {
  capability: string;
  status: IntelligenceBuildStatus;
  evidence: string;
  productionGate: string;
};

export type MultiModelProviderProfile = {
  provider: string;
  status: IntelligenceBuildStatus;
  routingUse: string;
  requiredControls: string[];
};

export type SovereignDeploymentProfile = {
  mode: string;
  status: IntelligenceBuildStatus;
  supportedNeed: string;
  requiredControls: string[];
};

export type ClinicalJourneyWorkflow = {
  stage: "before-visit" | "during-visit" | "after-visit";
  workflow: string;
  currentMode: "synthetic-demo" | "design-contract" | "production-gated";
  boundary: string;
};

export type RiskHorizonFocus = {
  focus: string;
  status: IntelligenceBuildStatus;
  safeStartingPoint: string;
  productionGate: string;
};

export type PopulationIntelligenceSurface = {
  buyer: string;
  dashboard: string;
  status: IntelligenceBuildStatus;
  metrics: string[];
  boundary: string;
};

export const healthcareIntelligenceBoundary =
  "SCRIMED is currently a governed synthetic pilot and enterprise evaluation operating layer. It does not ingest live PHI, autonomously diagnose, autonomously treat, submit claims, route patients, or execute production clinical workflows.";

export const healthcareIntelligencePhases: HealthcareIntelligencePhase[] = [
  {
    id: "phase-1",
    name: "Agent Runtime, Clinical Knowledge Graph, Validation and Trust Lab",
    status: "foundation-contract",
    objective:
      "Make SCRIMED's orchestration, evidence, knowledge, and validation contracts first-class before any live execution.",
    components: ["SCRIMED Agent Runtime", "Clinical Knowledge Graph", "Validation and Trust Lab"],
    currentEvidence: [
      "AgentOS v1 exposes planner, router, specialist registry, memory, RBAC, sandbox, audit, and TrustQA foundations.",
      "Atlas Intelligence Core exposes structural document intelligence, evidence contracts, Trust Cards, validation metrics, and governance registry.",
      "TrustOS exposes executable synthetic governance decisions, model-route profiles, clinical trace metadata, and human-review decisions."
    ],
    productionGates: [
      "Licensed clinician validation before clinical scoring is used in care settings.",
      "Regulatory intended-use review before clinical decision-support claims.",
      "Tenant identity, consent, BAA/legal path, durable audit, and approved connector controls before PHI."
    ]
  },
  {
    id: "phase-2",
    name: "Persistent Workspace, Multi-Model Router, Sovereign Deployment",
    status: "foundation-contract",
    objective:
      "Enable resumable enterprise workspaces, vendor-neutral AI routing, and deployment profiles for controlled customer environments.",
    components: ["Persistent Agent Workspace", "Multi-Model Router", "Sovereign Deployment Mode"],
    currentEvidence: [
      "Protected Pilot Workspaces provide tenant-authenticated synthetic sessions, append-only audits, TrustOS governance packets, and proof downloads.",
      "TrustOS model-route profiles define cost, latency, safety, context, fallback, and production-vendor gates.",
      "Interoperability and deployment readiness registers keep live connectors blocked until customer-specific controls are approved."
    ],
    productionGates: [
      "Durable workspace state, idempotency, replay, retries, and failure quarantine for production tasks.",
      "Provider BAAs, regional processing rules, PHI sensitivity policy, fallback testing, and rollback controls.",
      "Private cloud, hospital-controlled, government, or edge deployment validation where customer data cannot leave the environment."
    ]
  },
  {
    id: "phase-3",
    name: "Clinical Intelligence OS, Risk Horizon Engine, Population Intelligence",
    status: "planned",
    objective:
      "Build care-journey, preventive-risk, and population intelligence surfaces after trust, evidence, and governance are verified.",
    components: ["Clinical Intelligence OS", "Risk Horizon Engine", "Population Intelligence Layer"],
    currentEvidence: [
      "Synthetic workflows already cover care navigation, documentation review, trial screening, prior authorization support, and denial-risk review concepts.",
      "Evidence metrics define buyer-measurable outcomes such as time saved, friction reduced, documentation quality, revenue leakage, and access bottlenecks."
    ],
    productionGates: [
      "Clinical validation studies, buyer baseline measurement, data-quality analysis, and clinician governance approval.",
      "No risk prediction, diagnosis, treatment, or patient instruction without authorized human review."
    ]
  },
  {
    id: "phase-4",
    name: "Project Ark Healthcare Intelligence Fabric",
    status: "planned",
    objective:
      "Unify interoperable healthcare intelligence across organizations, regions, workflows, models, and governance systems.",
    components: ["Project Ark Healthcare Intelligence Fabric"],
    currentEvidence: [
      "SCRIMED now has routeable foundations for product proof, AgentOS, Atlas, TrustOS, interoperability, demos, pilots, and protected workspaces."
    ],
    productionGates: [
      "Enterprise architecture review, sovereign deployment approvals, formal security program, external clinical/regulatory review, and customer deployment evidence."
    ]
  }
];

export const clinicalKnowledgeGraphStandards: ClinicalKnowledgeGraphStandard[] = [
  {
    name: "FHIR R4 and US Core",
    role: "Resource model for patient context, observations, conditions, medications, procedures, encounters, claims-adjacent context, and care plans.",
    currentUse: "Interoperability control plane and synthetic conformance evaluations.",
    productionGate: "Customer-specific FHIR profile validation, SMART authorization, consent, purpose-of-use, audit, and partner acceptance."
  },
  {
    name: "HL7 v2",
    role: "Event and message patterns for ADT, orders, results, scheduling, and legacy hospital interoperability.",
    currentUse: "Standards registry and future connector contract boundary.",
    productionGate: "Interface-engine mapping, message validation, monitoring, reconciliation, and hospital integration testing."
  },
  {
    name: "DICOM and DICOMweb",
    role: "Imaging study, series, metadata, and retrieval patterns for radiology and imaging intelligence workflows.",
    currentUse: "Synthetic DICOMweb conformance planning and interoperability registry.",
    productionGate: "PACS/VNA authorization, de-identification policy, imaging viewer controls, and radiology governance review."
  },
  {
    name: "SNOMED CT",
    role: "Clinical concept terminology for diagnoses, findings, procedures, body structures, and care concepts.",
    currentUse: "Knowledge-graph binding contract.",
    productionGate: "Terminology license, version governance, mapping quality, and clinician terminology review."
  },
  {
    name: "ICD-10 and ICD-11",
    role: "Diagnosis and classification systems for clinical, reporting, quality, and global deployment context.",
    currentUse: "Knowledge-graph binding contract for claims-aware and population workflows.",
    productionGate: "Coding compliance review and jurisdiction-specific coding/version governance."
  },
  {
    name: "LOINC",
    role: "Laboratory and clinical observation codes for longitudinal labs, vitals, and measurement context.",
    currentUse: "Knowledge-graph binding contract for risk, care-gap, and evidence workflows.",
    productionGate: "Lab feed mapping, unit normalization, abnormal-flag validation, and data-quality controls."
  },
  {
    name: "RxNorm",
    role: "Medication normalization for ingredients, clinical drugs, dose forms, and medication-safety context.",
    currentUse: "Knowledge-graph binding contract for medication and risk-horizon workflows.",
    productionGate: "Medication reconciliation policy, formulary integration, interaction-source governance, and pharmacist/clinician review where applicable."
  },
  {
    name: "CPT, HCPCS, X12, NCPDP, and IHE profiles",
    role: "Procedure, billing, payer, pharmacy, claims, and cross-enterprise document exchange context.",
    currentUse: "Interoperability and reimbursement-awareness planning.",
    productionGate: "Payer policy review, coding/billing expert review, transaction testing, and no-guarantee reimbursement controls."
  }
];

export const clinicalKnowledgeGraphNodes: ClinicalKnowledgeGraphNode[] = [
  {
    kind: "patient-context",
    purpose: "Represent approved synthetic or tenant-authorized patient context without storing unrestricted clinical free text by default.",
    standardBindings: ["FHIR Patient", "FHIR Encounter", "FHIR Observation", "FHIR Condition"]
  },
  {
    kind: "diagnosis-or-condition",
    purpose: "Bind reviewable clinical concepts to terminology and evidence without creating autonomous diagnosis authority.",
    standardBindings: ["FHIR Condition", "SNOMED CT", "ICD-10", "ICD-11"]
  },
  {
    kind: "medication",
    purpose: "Normalize medication context for reviewable safety, adherence, and care-plan workflows.",
    standardBindings: ["FHIR MedicationRequest", "FHIR MedicationStatement", "RxNorm"]
  },
  {
    kind: "lab-or-vital",
    purpose: "Track longitudinal observation context, units, reference ranges, and missing-data signals.",
    standardBindings: ["FHIR Observation", "LOINC", "ISO/IEEE 11073"]
  },
  {
    kind: "imaging",
    purpose: "Represent imaging studies and metadata for imaging workflow context without autonomous imaging interpretation.",
    standardBindings: ["DICOM", "DICOMweb", "FHIR ImagingStudy"]
  },
  {
    kind: "procedure-or-service",
    purpose: "Connect procedures, authorization needs, documentation requirements, and claims-aware context.",
    standardBindings: ["FHIR Procedure", "CPT", "HCPCS", "SNOMED CT"]
  },
  {
    kind: "guideline-policy-or-evidence",
    purpose: "Attach evidence provenance, guideline versions, policy documents, validation timestamps, and source attribution.",
    standardBindings: ["Atlas Evidence Layer", "Trust Card", "Policy source registry"]
  },
  {
    kind: "trial-or-research-protocol",
    purpose: "Support reviewable TrialCore matching, eligibility evidence, missing criteria, and research operations workflows.",
    standardBindings: ["FHIR ResearchStudy", "FHIR ResearchSubject", "ClinicalTrials.gov-style metadata"]
  },
  {
    kind: "payer-claim-or-authorization",
    purpose: "Support revenue, prior authorization, denial risk, and reimbursement-awareness workflows under human review.",
    standardBindings: ["X12", "FHIR Claim", "FHIR Coverage", "Da Vinci-aligned patterns where applicable"]
  },
  {
    kind: "care-plan-or-outcome",
    purpose: "Represent approved care-plan context, follow-up tasks, quality measures, and outcome signals after governance review.",
    standardBindings: ["FHIR CarePlan", "FHIR Goal", "FHIR Task", "FHIR MeasureReport"]
  }
];

export const clinicalKnowledgeGraphRelationships: ClinicalKnowledgeGraphRelationship[] = [
  {
    relationship: "patient-context-has-condition",
    purpose: "Connect approved patient context to reviewable condition concepts.",
    reviewBoundary: "No autonomous diagnosis or condition creation without authorized human review."
  },
  {
    relationship: "condition-supported-by-evidence",
    purpose: "Attach guideline, protocol, publication, policy, or structured source evidence.",
    reviewBoundary: "Evidence links support review and explanation; they do not create medical orders or final determinations."
  },
  {
    relationship: "medication-associated-with-safety-signal",
    purpose: "Surface medication-safety or reconciliation signals for reviewable workflows.",
    reviewBoundary: "No medication change, stop, start, or patient instruction without licensed clinician review."
  },
  {
    relationship: "observation-indicates-review-need",
    purpose: "Identify missing, abnormal, stale, or trend-relevant observations for human review.",
    reviewBoundary: "Risk signals are not diagnostic claims and require validated clinical governance before care use."
  },
  {
    relationship: "workflow-generates-trust-card",
    purpose: "Attach confidence, source, provenance, validation timestamp, and reviewer state to every recommendation-like output.",
    reviewBoundary: "Trust Cards support transparency and escalation; they do not authorize autonomous execution."
  },
  {
    relationship: "claim-or-authorization-requires-policy-evidence",
    purpose: "Connect payer workflows to reviewable policy evidence, missing documentation, and human approval state.",
    reviewBoundary: "No final billing, payer submission, reimbursement guarantee, or coverage determination."
  }
];

export const validationTrustLabContract: ValidationTrustLabField[] = [
  {
    field: "clinicalCorrectnessScore",
    required: true,
    status: "external-review-required",
    purpose: "Measure whether an AI output aligns with approved clinical facts, guidelines, and workflow intent.",
    validationBoundary:
      "TODO: define and validate scoring rubric with licensed clinicians before use in clinical environments."
  },
  {
    field: "completenessScore",
    required: true,
    status: "foundation-contract",
    purpose: "Check whether required context, missing evidence, review owner, and blocked actions are present.",
    validationBoundary: "Current use is synthetic fixture and proof-packet evaluation only."
  },
  {
    field: "safetyScore",
    required: true,
    status: "external-review-required",
    purpose: "Evaluate escalation, prohibited action, uncertainty, privacy, and harm-prevention controls.",
    validationBoundary:
      "TODO: align with clinical safety, security, privacy, legal, and regulatory review before production use."
  },
  {
    field: "confidenceScore",
    required: true,
    status: "foundation-contract",
    purpose: "Express model, evidence, and workflow confidence with uncertainty preserved.",
    validationBoundary: "Confidence never replaces authorized human review."
  },
  {
    field: "sourceAttribution",
    required: true,
    status: "foundation-online",
    purpose: "Identify evidence source, guideline, protocol, policy, or fixture source used by the output.",
    validationBoundary: "External source currency and clinical appropriateness require governance review."
  },
  {
    field: "evidenceTrail",
    required: true,
    status: "foundation-online",
    purpose: "Preserve the trace from input context to source evidence, Trust Card, reviewer state, and audit event.",
    validationBoundary: "Trace capture is metadata-first and must avoid PHI until approved storage exists."
  },
  {
    field: "guidelineReferences",
    required: true,
    status: "foundation-contract",
    purpose: "Attach guideline or policy versions and validation timestamps where applicable.",
    validationBoundary: "Guideline selection, licensing, and update cadence need clinical governance approval."
  },
  {
    field: "modelProviderUsed",
    required: true,
    status: "foundation-contract",
    purpose: "Record provider, model route, fallback state, latency, and cost basis for auditability.",
    validationBoundary: "PHI sensitivity, BAA, regional, and rollback controls are required before production routing."
  },
  {
    field: "reviewerStatus",
    required: true,
    status: "foundation-online",
    purpose: "Show whether the output is draft, pending review, approved for synthetic use, escalated, or denied.",
    validationBoundary: "Reviewer approval is not a substitute for licensed clinical responsibility."
  },
  {
    field: "auditLog",
    required: true,
    status: "foundation-online",
    purpose: "Retain event metadata for governance, replay, diligence, and incident review.",
    validationBoundary: "Durable production audit storage requires retention, access, encryption, and incident-response approval."
  }
];

export const agentRuntimeCapabilities: AgentRuntimeCapability[] = [
  {
    capability: "Shared memory fabric",
    status: "foundation-online",
    evidence: "AgentOS defines session, operational, and knowledge memory with retention, RBAC, and prohibited-data boundaries.",
    productionGate: "Durable tenant memory, deletion, residency, consent, and PHI minimization approval."
  },
  {
    capability: "Shared permissions",
    status: "foundation-online",
    evidence: "AgentOS defines role permissions for admins, clinicians, RCM reviewers, and runtime services.",
    productionGate: "Customer IdP, tenant roles, patient-context authorization, and break-glass policy."
  },
  {
    capability: "Shared audit logs",
    status: "foundation-online",
    evidence: "AgentOS, TrustOS, workflow denial, and protected workspace layers expose auditable metadata events.",
    productionGate: "Immutable durable storage, access review, retention, legal hold, alerting, and incident response."
  },
  {
    capability: "Task decomposition and tool selection",
    status: "foundation-online",
    evidence: "Planner, Router, Specialist, TrustQA, and Governance agents produce synthetic task plans and denied production requests.",
    productionGate: "Approved tool registry, credential scopes, retries, timeout policy, sandbox isolation, and live connector gates."
  },
  {
    capability: "Cost and latency tracking",
    status: "foundation-contract",
    evidence: "TrustOS model-route and observability contracts expose cost, latency, trust, override, and escalation signals.",
    productionGate: "Provider telemetry, budget limits, tenant reporting, alerting, and fallback runbooks."
  }
];

export const multiModelProviderProfiles: MultiModelProviderProfile[] = [
  {
    provider: "OpenAI",
    status: "foundation-contract",
    routingUse: "General reasoning, agent planning, structured extraction, and governed workflow support where policy allows.",
    requiredControls: ["BAA or approved data boundary", "model logging policy", "PHI sensitivity routing", "fallback test"]
  },
  {
    provider: "Anthropic",
    status: "planned",
    routingUse: "Long-context review, safety-sensitive drafting, and policy-heavy evidence summarization after vendor approval.",
    requiredControls: ["vendor review", "regional policy", "cost and latency benchmark", "output validation"]
  },
  {
    provider: "Google Gemini",
    status: "planned",
    routingUse: "Multimodal and long-context tasks where customer deployment, privacy, and accuracy controls support use.",
    requiredControls: ["vendor review", "multimodal safety review", "data residency assessment", "fallback route"]
  },
  {
    provider: "Open-weight and local models",
    status: "planned",
    routingUse: "Private-cloud, edge, sovereign, and low-data-movement deployments where local inference is required.",
    requiredControls: ["model evaluation", "security hardening", "update process", "clinical validation"]
  },
  {
    provider: "Future healthcare-specific models",
    status: "planned",
    routingUse: "Specialized clinical, imaging, payer, or research workflows after regulatory and customer governance review.",
    requiredControls: ["intended-use review", "clinical validation", "source governance", "monitoring and rollback"]
  }
];

export const sovereignDeploymentProfiles: SovereignDeploymentProfile[] = [
  {
    mode: "SCRIMED-managed cloud",
    status: "foundation-contract",
    supportedNeed: "Fastest synthetic pilot and enterprise evaluation path through Vercel-hosted product surfaces.",
    requiredControls: ["environment isolation", "secrets management", "audit retention", "security monitoring"]
  },
  {
    mode: "Private cloud",
    status: "planned",
    supportedNeed: "Health-system or payer-controlled cloud deployment with customer network, identity, and data controls.",
    requiredControls: ["customer IdP", "private networking", "regional storage", "observability export"]
  },
  {
    mode: "Hospital-controlled environment",
    status: "planned",
    supportedNeed: "Clinical workflows where live data must stay inside the customer's controlled environment.",
    requiredControls: ["on-prem connector boundary", "local audit", "least-privilege service auth", "downtime procedures"]
  },
  {
    mode: "Government or sovereign cloud",
    status: "planned",
    supportedNeed: "Jurisdiction-specific residency, procurement, security, and sovereignty requirements.",
    requiredControls: ["regional compliance mapping", "sovereign identity", "approved model route", "local incident response"]
  },
  {
    mode: "Edge or on-prem",
    status: "planned",
    supportedNeed: "Low-latency, low-connectivity, or no-data-egress environments.",
    requiredControls: ["local inference", "patching process", "secure sync", "hardware and physical security"]
  }
];

export const clinicalJourneyWorkflows: ClinicalJourneyWorkflow[] = [
  {
    stage: "before-visit",
    workflow: "Pre-visit chart review, missing-data detection, risk signal summary, and agenda drafting.",
    currentMode: "design-contract",
    boundary: "Draft operational support only; no diagnosis, treatment recommendation, or patient instruction."
  },
  {
    stage: "during-visit",
    workflow: "Ambient listening support, topic tracking, note scaffolding, and patient education draft support.",
    currentMode: "design-contract",
    boundary: "Clinician remains author and reviewer; no autonomous documentation finalization or advice."
  },
  {
    stage: "after-visit",
    workflow: "Draft documentation, coding support, care-plan drafting, follow-up queueing, payer and RCM support.",
    currentMode: "synthetic-demo",
    boundary: "No EHR filing, final coding, claim submission, patient outreach, or order entry without authorized review."
  }
];

export const riskHorizonFocusAreas: RiskHorizonFocus[] = [
  {
    focus: "Heart failure",
    status: "planned",
    safeStartingPoint: "Surface missing-data, trend, medication, encounter, and follow-up review prompts in synthetic examples.",
    productionGate: "Validated clinical model, cardiology governance, data-quality review, and escalation protocol."
  },
  {
    focus: "Diabetes",
    status: "planned",
    safeStartingPoint: "Map A1c, medication, care-gap, monitoring, and access signals to reviewable workflow prompts.",
    productionGate: "Endocrinology/primary-care review, evidence versioning, and patient-communication governance."
  },
  {
    focus: "Chronic kidney disease",
    status: "planned",
    safeStartingPoint: "Map labs, medication safety, referral gaps, and follow-up context into human-reviewed risk workqueues.",
    productionGate: "Nephrology validation, unit normalization, lab-feed governance, and care-team escalation."
  },
  {
    focus: "Stroke",
    status: "planned",
    safeStartingPoint: "Expose prevention and follow-up workflow gaps for review without acute triage claims.",
    productionGate: "Neurology governance, emergency-care boundary, and time-sensitive escalation policy."
  },
  {
    focus: "Cancer risk",
    status: "planned",
    safeStartingPoint: "Support Onco-ID and screening-gap review with evidence, uncertainty, and no diagnosis claim.",
    productionGate: "Oncology governance, guideline versioning, screening policy review, and equity analysis."
  },
  {
    focus: "Medication safety",
    status: "planned",
    safeStartingPoint: "Flag medication reconciliation, duplicate therapy, and evidence-gap prompts for qualified review.",
    productionGate: "Pharmacist/clinician validation, source licensing, interaction policy, and EHR reconciliation workflow."
  }
];

export const populationIntelligenceSurfaces: PopulationIntelligenceSurface[] = [
  {
    buyer: "Provider organizations",
    dashboard: "Care gaps, access bottlenecks, quality measures, utilization, outcomes, and care-team workload.",
    status: "planned",
    metrics: ["care gaps", "utilization", "quality measures", "access delays", "outcomes"],
    boundary: "No live population scoring until data rights, quality, equity, and clinical governance are approved."
  },
  {
    buyer: "Payers",
    dashboard: "Risk stratification, denials, utilization, cost drivers, HEDIS, Star Ratings, and value-based care readiness.",
    status: "planned",
    metrics: ["risk tiers", "denial signals", "cost drivers", "HEDIS readiness", "Star Ratings readiness"],
    boundary: "No coverage determination, payment decision, or member outreach without payer governance and human review."
  },
  {
    buyer: "Employers",
    dashboard: "Population trends, access friction, benefit-navigation opportunities, and de-identified outcome signals.",
    status: "planned",
    metrics: ["aggregate access", "avoidable utilization", "benefit friction", "condition program opportunity"],
    boundary: "Must use approved aggregation, privacy, consent, de-identification, and anti-discrimination controls."
  },
  {
    buyer: "Governments and public health",
    dashboard: "Program performance, access equity, regional burden, resource allocation, and policy evidence.",
    status: "planned",
    metrics: ["regional access", "quality gaps", "program performance", "resource demand", "equity signals"],
    boundary: "Requires public-sector procurement, privacy, residency, model transparency, and policy review."
  }
];

export const healthcareIntelligenceTodoGates = [
  "TODO: approve licensed clinician validation rubrics before clinical correctness or safety scores are used in care delivery.",
  "TODO: complete regulatory intended-use review before public claims imply clinical decision support, diagnosis, treatment, or device functionality.",
  "TODO: approve BAA/DPA, privacy notices, retention schedules, and customer data boundaries before PHI or confidential clinical data.",
  "TODO: approve durable audit storage, tenant memory retention, deletion, residency, legal-hold, and access-review policies before production workspace persistence.",
  "TODO: approve model provider contracts, PHI routing policy, regional processing rules, monitoring, and fallback runbooks before production model routing.",
  "TODO: approve sovereign deployment architecture before customer data is required to stay in a private, government, hospital, edge, or on-prem environment."
];

export function getHealthcareIntelligenceOSSummary() {
  const agentOS = getAgentOSSummary();
  const atlas = getAtlasIntelligenceCoreSummary();
  const trustOS = getTrustOSSummary();
  const interoperability = getInteroperabilitySummary();
  const protectedWorkspace = getProtectedPilotWorkspaceSummary();

  return {
    service: "scrimed-healthcare-intelligence-os",
    route: "/healthcare-intelligence-os",
    apiRoute: "/api/healthcare-intelligence-os",
    status: "healthcare-intelligence-os-foundation",
    boundary: healthcareIntelligenceBoundary,
    currentStack: {
      framework: "Next.js App Router with typed server components and route handlers",
      database: "Supabase Auth, Supabase Postgres, and Postgres row-level security for protected pilot workspaces",
      auth: "Supabase Auth bearer-token verification for tenant-admin protected pilot operations",
      rateLimit: "Upstash Redis rate limiting with bounded in-process fallback for protected mutations",
      deployment: "Vercel-hosted SCRIMED product app connected from the official Wix website",
      dataPosture: "Synthetic-only public product, demo, pilot, and evidence surfaces; live PHI remains blocked"
    },
    architecture: healthcareIntelligencePhases,
    agentRuntime: {
      status: agentOS.status,
      route: agentOS.route,
      apiRoute: agentOS.apiRoute,
      controlPlaneCount: agentOS.controlPlane.length,
      specialistServiceCount: agentOS.specialistServices.length,
      workflowExecutionCount: agentOS.workflowExecutionRegistry.length,
      capabilities: agentRuntimeCapabilities
    },
    clinicalKnowledgeGraph: {
      status: "foundation-contract" as IntelligenceBuildStatus,
      standards: clinicalKnowledgeGraphStandards,
      nodeTypes: clinicalKnowledgeGraphNodes,
      relationshipTypes: clinicalKnowledgeGraphRelationships,
      poweredProducts: ["TrialCore", "Onco-ID", "CareExplain", "MyVitals AI", "Population Intelligence", "Clinical Decision Support"],
      boundary:
        "Current graph work is a typed foundation and synthetic contract. Live clinical graph ingestion requires customer authorization, PHI controls, terminology governance, and clinical validation."
    },
    validationTrustLab: {
      status: trustOS.status,
      route: trustOS.route,
      apiRoute: trustOS.apiRoute,
      atlasEvidenceRoute: atlas.route,
      fields: validationTrustLabContract,
      trustOSControlCount: trustOS.components.length,
      atlasTrustCardCount: atlas.trustCards.length,
      boundary:
        "Validation fields attach evidence, uncertainty, review state, model route, and audit metadata. They do not authorize autonomous clinical decisions."
    },
    persistentAgentWorkspace: {
      status: protectedWorkspace.status,
      route: protectedWorkspace.route,
      durableStore: protectedWorkspace.infrastructure.durableStore.provider,
      tenantIsolation: protectedWorkspace.infrastructure.tenantIsolation.provider,
      capabilities: protectedWorkspace.capabilities,
      exampleWorkflows: [
        "RCM denial appeal generation",
        "clinical trial matching",
        "pre-visit chart review",
        "post-visit care plan drafting",
        "investor outreach tracking",
        "security scans",
        "data transformation jobs"
      ],
      boundary: protectedWorkspace.boundary
    },
    multiModelRouter: {
      status: "foundation-contract" as IntelligenceBuildStatus,
      route: "/trust-os",
      policyInputs: [
        "task type",
        "cost",
        "latency",
        "safety",
        "context length",
        "availability",
        "regulatory constraints",
        "PHI sensitivity"
      ],
      providers: multiModelProviderProfiles,
      fallbackLogic:
        "Route denies or escalates when a provider is unavailable, unapproved for the data boundary, too costly, too slow, or below trust threshold."
    },
    sovereignDeployment: {
      status: "planned" as IntelligenceBuildStatus,
      profiles: sovereignDeploymentProfiles,
      boundary: "SCRIMED must not assume clinical data can leave a customer-controlled environment."
    },
    clinicalIntelligenceOS: {
      status: "planned" as IntelligenceBuildStatus,
      workflows: clinicalJourneyWorkflows,
      boundary:
        "Care-journey workflows are draft, review, and operational-support concepts until approved clinical, privacy, and production controls exist."
    },
    riskHorizonEngine: {
      status: "planned" as IntelligenceBuildStatus,
      focusAreas: riskHorizonFocusAreas,
      boundary:
        "Risk-horizon work starts with missing-data and review prompts; predictive or diagnostic claims require validated clinical governance."
    },
    populationIntelligenceLayer: {
      status: "planned" as IntelligenceBuildStatus,
      surfaces: populationIntelligenceSurfaces,
      boundary:
        "Population intelligence requires approved data rights, privacy, equity, aggregation, quality, and customer governance controls."
    },
    interoperabilityFoundation: {
      status: interoperability.status,
      route: "/interoperability",
      standardCount: interoperability.standardCount,
      activeControls: interoperability.activeControls,
      requiredBeforeLive: interoperability.requiredBeforeLive,
      boundary: interoperability.boundary
    },
    implementationPlan: [
      "Phase 1: keep AgentOS, Atlas, and TrustOS as the primary foundation; expose Clinical Knowledge Graph and Validation Trust Lab contracts without live clinical claims.",
      "Phase 2: harden protected workspaces into resumable agent workspaces, then add production model-router and sovereign-deployment policy gates.",
      "Phase 3: build care-journey, risk-horizon, and population surfaces only after validation, data-quality, privacy, and clinician-governance controls mature.",
      "Phase 4: combine the operating layers into Project Ark Healthcare Intelligence Fabric after enterprise deployment evidence exists."
    ],
    todoGates: healthcareIntelligenceTodoGates,
    updated: "2026-06-14"
  };
}

export function buildHealthcareIntelligenceOSBrief() {
  const summary = getHealthcareIntelligenceOSSummary();

  return [
    "# SCRIMED Healthcare Intelligence OS Brief",
    "",
    `Status: ${summary.status}`,
    `Boundary: ${summary.boundary}`,
    "",
    "## Current Architecture",
    `- Framework: ${summary.currentStack.framework}`,
    `- Database: ${summary.currentStack.database}`,
    `- Auth: ${summary.currentStack.auth}`,
    `- Rate limit: ${summary.currentStack.rateLimit}`,
    `- Deployment: ${summary.currentStack.deployment}`,
    `- Data posture: ${summary.currentStack.dataPosture}`,
    "",
    "## Phase Plan",
    ...summary.architecture.map(
      (phase) => `- ${phase.id}: ${phase.name} (${phase.status}) - ${phase.objective}`
    ),
    "",
    "## Phase 1 Foundation",
    `- Agent Runtime: ${summary.agentRuntime.status}; ${summary.agentRuntime.controlPlaneCount} control-plane components; ${summary.agentRuntime.specialistServiceCount} specialist services.`,
    `- Clinical Knowledge Graph: ${summary.clinicalKnowledgeGraph.status}; ${summary.clinicalKnowledgeGraph.standards.length} standard families; ${summary.clinicalKnowledgeGraph.nodeTypes.length} node types.`,
    `- Validation and Trust Lab: ${summary.validationTrustLab.status}; ${summary.validationTrustLab.fields.length} required/controlled fields; ${summary.validationTrustLab.trustOSControlCount} TrustOS controls.`,
    "",
    "## Production Gates",
    ...summary.todoGates.map((gate) => `- ${gate}`),
    "",
    "## Routes",
    `- OS surface: ${summary.route}`,
    `- OS API: ${summary.apiRoute}`,
    `- Agent Runtime: ${summary.agentRuntime.route}`,
    `- Validation Trust Lab: ${summary.validationTrustLab.route}`,
    `- Protected Workspace: ${summary.persistentAgentWorkspace.route}`
  ].join("\n");
}
