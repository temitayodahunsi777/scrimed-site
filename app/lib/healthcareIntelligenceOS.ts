import { getAgentOSSummary } from "./agentOS";
import { getAtlasIntelligenceCoreSummary } from "./atlasIntelligenceCore";
import { getClinicalCareActivationSummary } from "./clinicalCareActivation";
import { getClinicalContextGatewaySummary } from "./clinicalContextGateway";
import { getClinicalDataGovernanceSummary } from "./clinicalDataGovernance";
import { getClinicalDataFabricSummary } from "./clinicalDataFabric";
import { getHealthRecordsSafetyExchangeSummary } from "./healthRecordsSafetyExchange";
import { getInteroperabilitySummary } from "./interoperabilityStandards";
import { getImagingWorkflowIntelligenceSummary } from "./imagingWorkflowIntelligence";
import { getProtectedPilotWorkspaceSummary } from "./protectedPilotWorkspace";
import { getScrimedClinicalBenchmarkSuiteSummary } from "./scrimedClinicalBenchmarkSuite";
import { getClinicalAgentSreSummary } from "./clinicalAgentSre";
import { getValueContractEvidenceSummary } from "./valueContractEvidence";
import { getScrimedP32ControlPlaneSummary } from "./scrimedP32ControlPlane";
import { priorAuthorizationFoundryBlueprint } from "./scrimed-work/foundry";
import { sampleOutcomeLearningControllers } from "./scrimed-work/learningLoop";
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

export type ClinicalWorkflowAutomationTrackStatus =
  | "synthetic-ready"
  | "design-contract"
  | "customer-sandbox-required"
  | "external-review-required"
  | "blocked-before-live";

export type ClinicalWorkflowAutomationTrack = {
  slug: string;
  lane: string;
  status: ClinicalWorkflowAutomationTrackStatus;
  buyer: string;
  clinicalAwareness: string;
  automationScope: string;
  patientSafetyControls: string[];
  patientEngagementAnalysis: string[];
  interoperabilityBindings: string[];
  clinicianBurdenReduction: string[];
  operationsOptimization: string[];
  proofRoutes: string[];
  blockedActions: string[];
  requiredBeforeLive: string;
  retainedBoundary: string;
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
    components: ["SCRIMED Agent Runtime", "Clinical Knowledge Graph", "Validation and Trust Lab", "Health Records Safety Exchange"],
    currentEvidence: [
      "AgentOS v1 exposes planner, router, specialist registry, memory, RBAC, sandbox, audit, and TrustQA foundations.",
      "Atlas Intelligence Core exposes structural document intelligence, evidence contracts, Trust Cards, validation metrics, and governance registry.",
      "TrustOS exposes executable synthetic governance decisions, model-route profiles, clinical trace metadata, and human-review decisions.",
      "Health Records Safety Exchange exposes no-PHI extraction planning, patient-safety lint, source attribution, standards mapping, and retained live-data workarounds."
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
      "Persistent Agent Workspace v1 defines resumable work orders, model-router policy, audit timelines, reviewer checkpoints, limitation-resolution paths, and downloadable workspace proof packets.",
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
    name: "USCDI and TEFCA",
    role: "U.S. core data-class mapping and nationwide exchange governance context for record extraction, buyer data coverage, and future exchange readiness.",
    currentUse: "Health Records Safety Exchange and Interoperability registry readiness.",
    productionGate: "Customer-specific data-class mapping, participant/exchange authority, privacy/security review, purpose-of-use, consent, and audit approval."
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
  },
  {
    name: "CMS prior authorization APIs",
    role: "Payer, provider, and prior-authorization API readiness for coverage context, missing documentation, and human-reviewed evidence packets.",
    currentUse: "Health Records Safety Exchange payer/prior-authorization extraction planning.",
    productionGate: "Payer/trading-partner approval, API testing, coding review, legal/customer release authority, and no autonomous payer submission."
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

export const clinicalWorkflowAutomationTracks: ClinicalWorkflowAutomationTrack[] = [
  {
    slug: "pre-visit-chart-prep-gap-review",
    lane: "Pre-visit chart prep and gap review",
    status: "synthetic-ready",
    buyer: "Clinicians, care-team managers, and clinic operators",
    clinicalAwareness:
      "Organize known problems, medications, labs, preventive-care gaps, prior authorization context, and missing data into a review queue.",
    automationScope:
      "Draft-only visit agenda, missing-evidence checklist, and reviewer-ready preparation packet for synthetic or approved sandbox records.",
    patientSafetyControls: [
      "missing-data disclaimer",
      "source attribution required",
      "stale-result flag",
      "clinician-review required",
      "no diagnosis or treatment recommendation"
    ],
    patientEngagementAnalysis: [
      "access friction",
      "missed appointment context",
      "open follow-up need",
      "portal-readiness signal"
    ],
    interoperabilityBindings: ["FHIR Patient", "FHIR Encounter", "FHIR Observation", "FHIR Condition", "USCDI"],
    clinicianBurdenReduction: [
      "reduce manual chart hunting",
      "compress agenda preparation",
      "turn scattered evidence into a single review list"
    ],
    operationsOptimization: ["visit-readiness score", "missing-record queue", "care-team handoff queue"],
    proofRoutes: ["/healthcare-intelligence-os", "/health-records", "/clinical-care-activation"],
    blockedActions: ["live chart pull", "patient-specific triage", "clinical diagnosis", "treatment plan recommendation"],
    requiredBeforeLive:
      "Customer clinical scope, BAA/DPA where applicable, source-system connector approval, clinician rubric, and patient-context authorization.",
    retainedBoundary:
      "Pre-visit automation is preparation support only; SCRIMED does not provide medical advice, diagnosis, treatment, or live chart execution."
  },
  {
    slug: "documentation-draft-clerical-reduction",
    lane: "Documentation draft and clerical reduction",
    status: "design-contract",
    buyer: "Physicians, APPs, scribes, documentation leaders, and operations executives",
    clinicalAwareness:
      "Convert encounter context into draft note structure, open questions, source references, and missing documentation prompts.",
    automationScope:
      "Draft note scaffold, evidence trail, and coding-adjacent clarification queue without final note signing, EHR filing, or clinical authorship transfer.",
    patientSafetyControls: [
      "draft-only watermark",
      "clinician author remains responsible",
      "source/evidence trail",
      "hallucination and unsupported-claim check",
      "no autonomous note finalization"
    ],
    patientEngagementAnalysis: [
      "education-topic need",
      "follow-up clarity need",
      "language-access prompt",
      "instruction-comprehension risk"
    ],
    interoperabilityBindings: ["FHIR DocumentReference", "C-CDA", "LOINC document codes", "SNOMED CT"],
    clinicianBurdenReduction: [
      "reduce after-hours documentation backlog",
      "standardize note skeletons",
      "surface incomplete documentation before signoff"
    ],
    operationsOptimization: ["documentation turnaround time", "open clarification queue", "note quality review queue"],
    proofRoutes: ["/atlas", "/health-records", "/qa-claim-guard"],
    blockedActions: ["autonomous documentation finalization", "EHR filing", "clinical authorship transfer", "coding finalization"],
    requiredBeforeLive:
      "Customer documentation policy, licensed clinical review, EHR workflow authorization, audit retention, and clinician acceptance criteria.",
    retainedBoundary:
      "Documentation support remains draft-only and reviewer-gated until customer-approved clinical documentation controls exist."
  },
  {
    slug: "after-visit-follow-up-readiness",
    lane: "After-visit follow-up readiness",
    status: "customer-sandbox-required",
    buyer: "Care coordinators, population health teams, patient access, and ambulatory operations",
    clinicalAwareness:
      "Identify follow-up tasks, open referrals, lab/result review needs, education topics, and scheduling friction for human-owned workqueues.",
    automationScope:
      "Generate no-PHI workqueue plans, draft task categories, and escalation checklists; do not contact patients or route urgent care issues.",
    patientSafetyControls: [
      "urgent/emergency boundary",
      "human outreach approval",
      "patient instruction blocker",
      "task owner required",
      "closed-loop follow-up audit"
    ],
    patientEngagementAnalysis: [
      "follow-up completion risk",
      "transportation/access friction",
      "portal enrollment gap",
      "communication preference readiness"
    ],
    interoperabilityBindings: ["FHIR Task", "FHIR CarePlan", "FHIR CommunicationRequest", "USCDI"],
    clinicianBurdenReduction: [
      "reduce manual follow-up queue sorting",
      "convert care-plan fragments into worklists",
      "separate administrative follow-up from clinical escalation"
    ],
    operationsOptimization: ["follow-up backlog", "handoff completeness", "open-loop referral count"],
    proofRoutes: ["/clinical-care-activation", "/health-records", "/service-delivery"],
    blockedActions: ["patient outreach", "urgent triage", "clinical instruction", "care-plan mutation"],
    requiredBeforeLive:
      "Customer outreach policy, consent/communication governance, emergency escalation protocol, care-team ownership, and connector approval.",
    retainedBoundary:
      "SCRIMED may analyze engagement readiness and draft workqueues, but it does not contact patients or issue clinical instructions."
  },
  {
    slug: "referral-prior-auth-documentation-workbench",
    lane: "Referral, prior authorization, and documentation workbench",
    status: "synthetic-ready",
    buyer: "Referral teams, revenue-cycle leaders, prior authorization staff, and specialty access operators",
    clinicalAwareness:
      "Map order/referral context, payer policy evidence, missing documentation, deadlines, and human reviewer requirements.",
    automationScope:
      "Prepare evidence packet outlines, policy checklists, and status workqueues without payer submission, coverage determination, or claim guarantee.",
    patientSafetyControls: [
      "coverage-decision blocker",
      "payer-submission blocker",
      "policy source attribution",
      "human reviewer approval",
      "no reimbursement guarantee"
    ],
    patientEngagementAnalysis: [
      "authorization delay risk",
      "access bottleneck",
      "missing patient document request",
      "care access friction"
    ],
    interoperabilityBindings: ["FHIR Coverage", "FHIR Claim", "FHIR ServiceRequest", "X12 278", "CMS prior authorization APIs"],
    clinicianBurdenReduction: [
      "reduce manual policy lookup",
      "package missing documentation requests",
      "separate clerical payer tasks from clinician review"
    ],
    operationsOptimization: ["authorization cycle time", "missing documentation rate", "referral leakage signal"],
    proofRoutes: ["/health-records", "/interoperability", "/offerings"],
    blockedActions: ["payer submission", "coverage determination", "appeal filing", "reimbursement guarantee"],
    requiredBeforeLive:
      "Payer/trading-partner approval, customer policy source authority, coding review, legal review, and human submission workflow.",
    retainedBoundary:
      "Prior-authorization automation is evidence preparation only; SCRIMED does not submit claims or guarantee payment."
  },
  {
    slug: "medication-reconciliation-safety-review",
    lane: "Medication reconciliation safety review",
    status: "external-review-required",
    buyer: "Clinical pharmacists, primary-care teams, care managers, and quality leaders",
    clinicalAwareness:
      "Surface duplicate-medication context, missing medication history, reconciliation gaps, allergy references, and source discrepancies for qualified review.",
    automationScope:
      "Create safety-review prompts and discrepancy queues without medication advice, interaction claims, prescribing, or patient instructions.",
    patientSafetyControls: [
      "pharmacist/clinician review required",
      "medication-change blocker",
      "source discrepancy flag",
      "interaction-source governance required",
      "patient instruction blocker"
    ],
    patientEngagementAnalysis: [
      "adherence conversation need",
      "medication access friction",
      "pharmacy follow-up gap",
      "education support need"
    ],
    interoperabilityBindings: ["FHIR MedicationRequest", "FHIR MedicationStatement", "FHIR AllergyIntolerance", "RxNorm"],
    clinicianBurdenReduction: [
      "reduce medication list comparison work",
      "highlight missing reconciliation evidence",
      "route discrepancy queues to the right reviewer"
    ],
    operationsOptimization: ["med-rec completion queue", "high-risk discrepancy queue", "pharmacy-review load"],
    proofRoutes: ["/healthcare-intelligence-os", "/clinical-authority-readiness", "/qa-claim-guard"],
    blockedActions: ["medication change recommendation", "prescribing", "drug interaction claim", "patient instruction"],
    requiredBeforeLive:
      "Medication-source licensing, pharmacist/clinician validation, customer medication policy, EHR reconciliation workflow, and monitoring.",
    retainedBoundary:
      "Medication safety review is a qualified-review queue; SCRIMED does not prescribe, change medications, or instruct patients."
  },
  {
    slug: "care-gap-population-engagement-analysis",
    lane: "Care-gap and population engagement analysis",
    status: "design-contract",
    buyer: "Population health, quality, payer operations, and value-based care teams",
    clinicalAwareness:
      "Aggregate care gaps, quality-measure readiness, access friction, panel workload, and equity review signals for program planning.",
    automationScope:
      "Produce aggregate or synthetic engagement and workload dashboards, not patient-specific outreach lists or risk prediction.",
    patientSafetyControls: [
      "aggregation threshold",
      "equity review",
      "consent and purpose-of-use gate",
      "no patient-specific scoring",
      "anti-discrimination review"
    ],
    patientEngagementAnalysis: [
      "care-gap closure friction",
      "access equity signal",
      "message-channel readiness",
      "community resource need"
    ],
    interoperabilityBindings: ["FHIR MeasureReport", "FHIR Group", "USCDI", "TEFCA governance context"],
    clinicianBurdenReduction: [
      "reduce manual quality roster review",
      "separate outreach planning from clinical decision work",
      "prioritize operations bottlenecks before clinician escalation"
    ],
    operationsOptimization: ["care-gap backlog", "panel workload", "quality-measure readiness", "equity-review queue"],
    proofRoutes: ["/healthcare-intelligence-os", "/operational-efficiency", "/public-market-readiness"],
    blockedActions: ["patient-specific scoring", "automated outreach", "risk prediction claim", "quality outcome guarantee"],
    requiredBeforeLive:
      "Data rights, aggregation policy, equity/bias review, customer governance, measure-source review, and outreach policy.",
    retainedBoundary:
      "Population engagement analysis remains aggregate or synthetic until approved data rights and patient outreach governance exist."
  },
  {
    slug: "discharge-transition-workflow-optimization",
    lane: "Discharge transition workflow optimization",
    status: "customer-sandbox-required",
    buyer: "Hospitals, care-transition teams, case management, and post-acute coordinators",
    clinicalAwareness:
      "Map discharge tasks, pending results, medication reconciliation handoffs, referral status, post-acute needs, and readmission-risk review prompts.",
    automationScope:
      "Prepare transition checklist and handoff packet templates without discharge instructions, order entry, patient routing, or clinical risk scoring.",
    patientSafetyControls: [
      "pending-result flag",
      "handoff owner required",
      "no discharge instruction generation",
      "readmission-risk claim blocker",
      "post-acute referral authority gate"
    ],
    patientEngagementAnalysis: [
      "transport or post-acute barrier",
      "follow-up appointment friction",
      "caregiver support need",
      "home-instruction clarity risk"
    ],
    interoperabilityBindings: ["FHIR Encounter", "FHIR CarePlan", "FHIR Task", "HL7 v2 ADT", "C-CDA"],
    clinicianBurdenReduction: [
      "reduce discharge checklist assembly",
      "surface incomplete handoffs",
      "route administrative barriers before clinician escalation"
    ],
    operationsOptimization: ["transition-readiness queue", "pending-result handoff rate", "post-acute bottleneck map"],
    proofRoutes: ["/clinical-care-activation", "/interoperability", "/service-reliability"],
    blockedActions: ["discharge instruction generation", "order entry", "post-acute referral submission", "readmission prediction"],
    requiredBeforeLive:
      "Hospital discharge policy, clinical governance, ADT/feed approval, post-acute workflow authority, and incident escalation model.",
    retainedBoundary:
      "Transition workflow support is operational checklisting only; SCRIMED does not discharge patients or direct care."
  },
  {
    slug: "clinician-inbox-admin-triage",
    lane: "Clinician inbox and administrative triage",
    status: "synthetic-ready",
    buyer: "Clinicians, practice managers, access centers, and administrative operations leaders",
    clinicalAwareness:
      "Classify synthetic messages, refill/admin requests, paperwork tasks, scheduling blockers, and unclear clinical-intent signals into human-owned queues.",
    automationScope:
      "Draft routing labels, response templates, and clerical task groups without patient advice, refill approval, or clinical triage.",
    patientSafetyControls: [
      "clinical intent escalation",
      "urgent symptom blocker",
      "patient advice blocker",
      "human sender approval",
      "message source audit"
    ],
    patientEngagementAnalysis: [
      "message backlog",
      "common confusion topic",
      "access request pattern",
      "paperwork friction"
    ],
    interoperabilityBindings: ["FHIR Communication", "FHIR Task", "SMART App Launch", "AuditEvent"],
    clinicianBurdenReduction: [
      "reduce inbox sorting load",
      "separate clerical messages from clinical review",
      "prepare human-send response drafts"
    ],
    operationsOptimization: ["inbox backlog", "clerical deflection rate", "clinical escalation queue", "response-time variance"],
    proofRoutes: ["/client-onboarding", "/continuous-review-audit", "/qa-claim-guard"],
    blockedActions: ["patient medical advice", "refill approval", "urgent triage", "message sending without human approval"],
    requiredBeforeLive:
      "Customer messaging policy, identity and role gates, human-send workflow, emergency escalation boundary, and audit retention.",
    retainedBoundary:
      "Inbox support stays administrative and draft-only; SCRIMED does not send messages or triage patients autonomously."
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
  const clinicalCareActivation = getClinicalCareActivationSummary();
  const clinicalContextGateway = getClinicalContextGatewaySummary();
  const clinicalDataGovernance = getClinicalDataGovernanceSummary();
  const clinicalDataFabric = getClinicalDataFabricSummary();
  const healthRecordsSafetyExchange = getHealthRecordsSafetyExchangeSummary();
  const trustOS = getTrustOSSummary();
  const interoperability = getInteroperabilitySummary();
  const protectedWorkspace = getProtectedPilotWorkspaceSummary();
  const imagingWorkflowIntelligence = getImagingWorkflowIntelligenceSummary();
  const clinicalBenchmarkSuite = getScrimedClinicalBenchmarkSuiteSummary();
  const clinicalAgentSre = getClinicalAgentSreSummary();
  const valueContractEvidence = getValueContractEvidenceSummary();
  const p32ControlPlane = getScrimedP32ControlPlaneSummary();
  const clinicalWorkflowPatientSafetyControls = Array.from(
    new Set(clinicalWorkflowAutomationTracks.flatMap((track) => track.patientSafetyControls))
  );
  const clinicalWorkflowPatientEngagementSignals = Array.from(
    new Set(clinicalWorkflowAutomationTracks.flatMap((track) => track.patientEngagementAnalysis))
  );
  const clinicalWorkflowInteroperabilityBindings = Array.from(
    new Set(clinicalWorkflowAutomationTracks.flatMap((track) => track.interoperabilityBindings))
  );
  const clinicalWorkflowClinicianBurdenReducers = Array.from(
    new Set(clinicalWorkflowAutomationTracks.flatMap((track) => track.clinicianBurdenReduction))
  );
  const clinicalWorkflowOperationsOptimizers = Array.from(
    new Set(clinicalWorkflowAutomationTracks.flatMap((track) => track.operationsOptimization))
  );
  const clinicalWorkflowProofRoutes = Array.from(
    new Set(clinicalWorkflowAutomationTracks.flatMap((track) => track.proofRoutes))
  );
  const clinicalWorkflowBlockedActions = Array.from(
    new Set(clinicalWorkflowAutomationTracks.flatMap((track) => track.blockedActions))
  );

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
    clinicalDataFabric: {
      status: clinicalDataFabric.status,
      route: clinicalDataFabric.route,
      apiRoute: clinicalDataFabric.apiRoute,
      briefRoute: clinicalDataFabric.briefRoute,
      dataBoundary: clinicalDataFabric.dataBoundary,
      connectorAuthority: clinicalDataFabric.connectorAuthority,
      clinicalCareAuthority: clinicalDataFabric.clinicalCareAuthority,
      agentDataAuthority: clinicalDataFabric.agentDataAuthority,
      liveIngestionAuthority: clinicalDataFabric.liveIngestionAuthority,
      sourceContractCount: clinicalDataFabric.sourceContractCount,
      canonicalEntityCount: clinicalDataFabric.canonicalEntityCount,
      semanticMappingCount: clinicalDataFabric.semanticMappingCount,
      graphNodeCount: clinicalDataFabric.graphNodeCount,
      graphEdgeCount: clinicalDataFabric.graphEdgeCount,
      workflowEventCount: clinicalDataFabric.workflowEventCount,
      validationStatus: clinicalDataFabric.validation.status,
      blockedClaimCount: clinicalDataFabric.blockedClaims.length,
      boundary: clinicalDataFabric.boundary
    },
    clinicalDataGovernance: {
      status: clinicalDataGovernance.status,
      policyVersion: clinicalDataGovernance.policyVersion,
      route: clinicalDataGovernance.route,
      apiRoute: clinicalDataGovernance.apiRoute,
      briefRoute: clinicalDataGovernance.briefRoute,
      dataBoundary: clinicalDataGovernance.dataBoundary,
      clinicalCareAuthority: clinicalDataGovernance.clinicalCareAuthority,
      productionConnectorAuthority: clinicalDataGovernance.productionConnectorAuthority,
      recordMutationAuthority: clinicalDataGovernance.recordMutationAuthority,
      patientOutreachAuthority: clinicalDataGovernance.patientOutreachAuthority,
      payerSubmissionAuthority: clinicalDataGovernance.payerSubmissionAuthority,
      externalModelPhiAuthority: clinicalDataGovernance.externalModelPhiAuthority,
      supportedDataClassCount: clinicalDataGovernance.supportedDataClasses.length,
      supportedPurposeCount: clinicalDataGovernance.supportedPurposes.length,
      supportedRoleCount: clinicalDataGovernance.supportedRoles.length,
      supportedActionCount: clinicalDataGovernance.supportedActions.length,
      supportedDestinationCount: clinicalDataGovernance.supportedDestinations.length,
      policyRuleCount: clinicalDataGovernance.policyRules.length,
      baselineEvaluationCount: clinicalDataGovernance.baselineControlEvaluations.length,
      validationStatus: clinicalDataGovernance.validation.status,
      boundary: clinicalDataGovernance.boundary
    },
    clinicalContextGateway: {
      status: clinicalContextGateway.status,
      version: clinicalContextGateway.version,
      envelopeVersion: clinicalContextGateway.envelopeVersion,
      route: clinicalContextGateway.route,
      apiRoute: clinicalContextGateway.apiRoute,
      briefRoute: clinicalContextGateway.briefRoute,
      dataBoundary: clinicalContextGateway.dataBoundary,
      rawSchemaAccess: clinicalContextGateway.rawSchemaAccess,
      rawConnectorPayloadAccess: clinicalContextGateway.rawConnectorPayloadAccess,
      clinicalCareAuthority: clinicalContextGateway.clinicalCareAuthority,
      recordMutationAuthority: clinicalContextGateway.recordMutationAuthority,
      payerSubmissionAuthority: clinicalContextGateway.payerSubmissionAuthority,
      patientOutreachAuthority: clinicalContextGateway.patientOutreachAuthority,
      productionConnectorAuthority: clinicalContextGateway.productionConnectorAuthority,
      supportedScopeCount: clinicalContextGateway.supportedScopes.length,
      gatewayControlCount: clinicalContextGateway.gatewayControls.length,
      contextLensModes: clinicalContextGateway.contextLens.modes,
      contextLensLivePhiEnabled: clinicalContextGateway.contextLens.livePhiEnabled,
      unsupportedOrStaleContextAction:
        clinicalContextGateway.contextLens.unsupportedOrStaleContextAction,
      contextLensSourceAndReasonRequired:
        clinicalContextGateway.contextLens.sourceAndReasonRequired,
      clinicalSearchFabric: clinicalContextGateway.clinicalSearchFabric,
      sourceContractCount: clinicalContextGateway.sourceContractCount,
      baselineEvaluationCount: clinicalContextGateway.baselineEvaluationCount,
      validationStatus: clinicalContextGateway.validation.status,
      boundary: clinicalContextGateway.boundary
    },
    p31AppliedIntelligence: {
      contextLens: {
        modes: clinicalContextGateway.contextLens.modes,
        livePhiEnabled: clinicalContextGateway.contextLens.livePhiEnabled,
        unsupportedOrStaleAction: clinicalContextGateway.contextLens.unsupportedOrStaleContextAction,
        sourceAndReasonRequired: clinicalContextGateway.contextLens.sourceAndReasonRequired
      },
      imagingWorkflowIntelligence,
      domainBenchmarkCard: clinicalBenchmarkSuite.benchmarkCard,
      outcomeLearning: {
        controllerCount: sampleOutcomeLearningControllers.length,
        operatingMode: "synthetic-research-sandbox",
        onlineClinicalSelfModificationAllowed: false,
        controllers: sampleOutcomeLearningControllers
      },
      clinicianAgentFoundry: {
        blueprintId: priorAuthorizationFoundryBlueprint.blueprintId,
        templateName: priorAuthorizationFoundryBlueprint.definition.name,
        deploymentStatus: priorAuthorizationFoundryBlueprint.deploymentManifest.status,
        productionActivationAllowed: priorAuthorizationFoundryBlueprint.deploymentManifest.productionActivationAllowed,
        permissionCount: priorAuthorizationFoundryBlueprint.permissionsManifest.length,
        evaluationCaseCount: priorAuthorizationFoundryBlueprint.syntheticEvaluationSet.length,
        boundary: priorAuthorizationFoundryBlueprint.boundary
      },
      clinicalAgentSre,
      valueContractEvidence,
      boundary:
        "P31 applied intelligence is synthetic, metadata-only, review-gated, and non-authoritative. External imaging adapters, durable evidence storage, production adaptation, live PHI, EHR writeback, payer submission, clinical finalization, and customer activation remain disabled."
    },
    p32ControlPlane,
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
      agentWorkspaceRoute: "/agent-workspace",
      agentWorkspaceApiRoute: "/api/agent-workspace",
      agentWorkspaceProofPacketRoute: "/api/agent-workspace/proof-packet",
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
    clinicalWorkflowAutomation: {
      status: "clinical-workflow-automation-synthetic-and-review-gated",
      trackCount: clinicalWorkflowAutomationTracks.length,
      syntheticReadyTrackCount: clinicalWorkflowAutomationTracks.filter(
        (track) => track.status === "synthetic-ready"
      ).length,
      customerSandboxRequiredTrackCount: clinicalWorkflowAutomationTracks.filter(
        (track) => track.status === "customer-sandbox-required"
      ).length,
      externalReviewRequiredTrackCount: clinicalWorkflowAutomationTracks.filter(
        (track) => track.status === "external-review-required"
      ).length,
      patientSafetyControlCount: clinicalWorkflowPatientSafetyControls.length,
      patientEngagementAnalysisSignalCount: clinicalWorkflowPatientEngagementSignals.length,
      interoperabilityBindingCount: clinicalWorkflowInteroperabilityBindings.length,
      clinicianBurdenReductionMotionCount: clinicalWorkflowClinicianBurdenReducers.length,
      operationsOptimizationLeverCount: clinicalWorkflowOperationsOptimizers.length,
      proofRouteCount: clinicalWorkflowProofRoutes.length,
      blockedActionCount: clinicalWorkflowBlockedActions.length,
      tracks: clinicalWorkflowAutomationTracks,
      patientSafetyControls: clinicalWorkflowPatientSafetyControls,
      patientEngagementAnalysisSignals: clinicalWorkflowPatientEngagementSignals,
      interoperabilityBindings: clinicalWorkflowInteroperabilityBindings,
      clinicianBurdenReductionMotions: clinicalWorkflowClinicianBurdenReducers,
      operationsOptimizationLevers: clinicalWorkflowOperationsOptimizers,
      proofRoutes: clinicalWorkflowProofRoutes,
      blockedActions: clinicalWorkflowBlockedActions,
      clinicalCareActivationStatus: clinicalCareActivation.status,
      clinicalCareActivationReadinessScore: clinicalCareActivation.readinessScore,
      healthRecordsSafetyExchangeStatus: healthRecordsSafetyExchange.status,
      healthRecordsCapabilityCount: healthRecordsSafetyExchange.capabilityCount,
      healthRecordsPatientSafetyCheckCount: healthRecordsSafetyExchange.safetyCheckCount,
      boundary:
        "Clinical workflow automation is limited to synthetic, metadata-only, draft, queueing, readiness, and human-reviewed support until customer clinical scope, privacy/security/legal review, PHI authority, connector approval, clinical governance, monitoring, and go-live approval exist."
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
      "Phase 1A: route healthcare source planning through Clinical Data Fabric so agents use governed semantic concepts, provenance, and health-graph contracts instead of raw schemas or direct connector payloads.",
      "Phase 1B: evaluate every future healthcare context request through Clinical Data Governance before model routing, agent tool use, connector activation, record mutation, payer movement, or patient communication.",
      "Phase 2: use Persistent Agent Workspace v1 to harden protected workspaces into resumable agent work orders, then add production model-router and sovereign-deployment policy gates.",
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
    `- Clinical Data Fabric: ${summary.clinicalDataFabric.status}; ${summary.clinicalDataFabric.sourceContractCount} source contracts; ${summary.clinicalDataFabric.semanticMappingCount} semantic mappings; ${summary.clinicalDataFabric.graphEdgeCount} health-graph edge contracts.`,
    `- Clinical Context Gateway: ${summary.clinicalContextGateway.status}; ${summary.clinicalContextGateway.supportedScopeCount} context scopes; ${summary.clinicalContextGateway.gatewayControlCount} gateway controls; ${summary.clinicalContextGateway.baselineEvaluationCount} baseline evaluations.`,
    `- Validation and Trust Lab: ${summary.validationTrustLab.status}; ${summary.validationTrustLab.fields.length} required/controlled fields; ${summary.validationTrustLab.trustOSControlCount} TrustOS controls.`,
    "",
    "## Clinical Data Fabric",
    `- Route: ${summary.clinicalDataFabric.route}`,
    `- API: ${summary.clinicalDataFabric.apiRoute}`,
    `- Brief: ${summary.clinicalDataFabric.briefRoute}`,
    `- Data boundary: ${summary.clinicalDataFabric.dataBoundary}`,
    `- Connector authority: ${summary.clinicalDataFabric.connectorAuthority}`,
    `- Agent data authority: ${summary.clinicalDataFabric.agentDataAuthority}`,
    `- Live ingestion authority: ${summary.clinicalDataFabric.liveIngestionAuthority}`,
    `- Validation: ${summary.clinicalDataFabric.validationStatus}`,
    `- Boundary: ${summary.clinicalDataFabric.boundary}`,
    "",
    "## Clinical Data Governance",
    `- Status: ${summary.clinicalDataGovernance.status}`,
    `- Policy version: ${summary.clinicalDataGovernance.policyVersion}`,
    `- API: ${summary.clinicalDataGovernance.apiRoute}`,
    `- Brief: ${summary.clinicalDataGovernance.briefRoute}`,
    `- Data boundary: ${summary.clinicalDataGovernance.dataBoundary}`,
    `- Policy rules: ${summary.clinicalDataGovernance.policyRuleCount}`,
    `- Baseline evaluations: ${summary.clinicalDataGovernance.baselineEvaluationCount}`,
    `- Validation: ${summary.clinicalDataGovernance.validationStatus}`,
    `- Boundary: ${summary.clinicalDataGovernance.boundary}`,
    "",
    "## Clinical Context Gateway",
    `- Status: ${summary.clinicalContextGateway.status}`,
    `- Version: ${summary.clinicalContextGateway.version}`,
    `- Envelope version: ${summary.clinicalContextGateway.envelopeVersion}`,
    `- API: ${summary.clinicalContextGateway.apiRoute}`,
    `- Brief: ${summary.clinicalContextGateway.briefRoute}`,
    `- Data boundary: ${summary.clinicalContextGateway.dataBoundary}`,
    `- Raw schema access: ${summary.clinicalContextGateway.rawSchemaAccess}`,
    `- Raw connector payload access: ${summary.clinicalContextGateway.rawConnectorPayloadAccess}`,
    `- Gateway controls: ${summary.clinicalContextGateway.gatewayControlCount}`,
    `- Context Lens modes: ${summary.clinicalContextGateway.contextLensModes.join(", ")}`,
    `- Unsupported or stale context: ${summary.clinicalContextGateway.unsupportedOrStaleContextAction}`,
    `- Source and action reason required: ${summary.clinicalContextGateway.contextLensSourceAndReasonRequired}`,
    `- Baseline evaluations: ${summary.clinicalContextGateway.baselineEvaluationCount}`,
    `- Validation: ${summary.clinicalContextGateway.validationStatus}`,
    `- Boundary: ${summary.clinicalContextGateway.boundary}`,
    "",
    "## Clinical Workflow Automation",
    `- Status: ${summary.clinicalWorkflowAutomation.status}`,
    `- Tracks: ${summary.clinicalWorkflowAutomation.trackCount}`,
    `- Synthetic-ready tracks: ${summary.clinicalWorkflowAutomation.syntheticReadyTrackCount}`,
    `- Patient-safety controls: ${summary.clinicalWorkflowAutomation.patientSafetyControlCount}`,
    `- Patient-engagement analysis signals: ${summary.clinicalWorkflowAutomation.patientEngagementAnalysisSignalCount}`,
    `- Interoperability bindings: ${summary.clinicalWorkflowAutomation.interoperabilityBindingCount}`,
    `- Clinician burden-reduction motions: ${summary.clinicalWorkflowAutomation.clinicianBurdenReductionMotionCount}`,
    `- Operations optimization levers: ${summary.clinicalWorkflowAutomation.operationsOptimizationLeverCount}`,
    `- Boundary: ${summary.clinicalWorkflowAutomation.boundary}`,
    ...summary.clinicalWorkflowAutomation.tracks.map(
      (track) =>
        `- ${track.lane} (${track.status}): ${track.automationScope} Safety: ${track.patientSafetyControls.join(", ")} Burden reduction: ${track.clinicianBurdenReduction.join(", ")} Blocked: ${track.blockedActions.join(", ")}`
    ),
    "",
    "## Production Gates",
    ...summary.todoGates.map((gate) => `- ${gate}`),
    "",
    "## Routes",
    `- OS surface: ${summary.route}`,
    `- OS API: ${summary.apiRoute}`,
    `- Clinical Data Fabric: ${summary.clinicalDataFabric.route}`,
    `- Clinical Data Fabric API: ${summary.clinicalDataFabric.apiRoute}`,
    `- Clinical Data Fabric Brief: ${summary.clinicalDataFabric.briefRoute}`,
    `- Clinical Data Governance: ${summary.clinicalDataGovernance.route}`,
    `- Clinical Data Governance API: ${summary.clinicalDataGovernance.apiRoute}`,
    `- Clinical Data Governance Brief: ${summary.clinicalDataGovernance.briefRoute}`,
    `- Clinical Context Gateway: ${summary.clinicalContextGateway.route}`,
    `- Clinical Context Gateway API: ${summary.clinicalContextGateway.apiRoute}`,
    `- Clinical Context Gateway Brief: ${summary.clinicalContextGateway.briefRoute}`,
    `- Agent Runtime: ${summary.agentRuntime.route}`,
    `- Validation Trust Lab: ${summary.validationTrustLab.route}`,
    `- Protected Workspace: ${summary.persistentAgentWorkspace.route}`,
    `- Persistent Agent Workspace: ${summary.persistentAgentWorkspace.agentWorkspaceRoute}`,
    `- Persistent Agent Workspace API: ${summary.persistentAgentWorkspace.agentWorkspaceApiRoute}`,
    `- Persistent Agent Workspace Proof Packet: ${summary.persistentAgentWorkspace.agentWorkspaceProofPacketRoute}`
  ].join("\n");
}
