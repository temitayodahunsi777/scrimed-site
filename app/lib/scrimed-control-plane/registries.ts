import { createAuditHash } from "../scrimed-work";
import type {
  ControlPlaneAgentDefinition,
  DefinitionOfDoneContract,
  ProviderClass,
  SemanticDefinition,
  SkillDefinition,
  ToolRiskClass,
  WorkflowDefinition,
  WorkspaceDomain
} from "./types";

const blockedToolClasses: ToolRiskClass[] = [
  "consequential-write",
  "external-communication",
  "clinical",
  "financial",
  "identity",
  "scheduling",
  "data-export"
];

function agent(
  id: string,
  purpose: string,
  allowedDomains: WorkspaceDomain[],
  allowedSkills: string[],
  allowedTools: ToolRiskClass[],
  defaultModelClass: ProviderClass,
  riskCeiling: "low" | "moderate" | "high",
  owner: string
): ControlPlaneAgentDefinition {
  const definition: Omit<ControlPlaneAgentDefinition, "auditHash"> = {
    id,
    version: "1.0.0",
    purpose,
    allowedDomains,
    allowedSkills,
    allowedTools,
    prohibitedTools: blockedToolClasses.filter((tool) => !allowedTools.includes(tool)),
    defaultModelClass,
    riskCeiling,
    requiresHumanReview: riskCeiling !== "low" || allowedTools.some((tool) => tool !== "read-only"),
    inputClassifications: ["public", "internal", "deidentified-clinical"],
    outputSchema: `scrimed.control-plane.${id}.v1`,
    evaluationSuite: `consequence-bench:${id}`,
    owner,
    maturityLevel: riskCeiling === "high" ? "protected-pilot" : "review-ready",
    activationStatus: allowedTools.every((tool) => tool === "read-only") ? "enabled-read-only" : "enabled-prepare-only"
  };

  return { ...definition, auditHash: createAuditHash(definition) };
}

export const controlPlaneAgentRegistry: ControlPlaneAgentDefinition[] = [
  agent("coordinator", "Plans bounded work and coordinates specialist handoffs.", ["clinical", "operations", "research", "executive"], ["model-routing", "clinical-safety-review"], ["read-only", "reversible-write"], "balanced", "moderate", "Platform Engineering"),
  agent("clinical-context", "Retrieves cited synthetic clinical context without creating clinical authority.", ["clinical"], ["fhir-retrieval", "medical-nlp", "citation-validation"], ["read-only"], "specialist", "high", "Clinical Governance"),
  agent("interoperability", "Prepares FHIR, HL7, and DICOM metadata mappings and validations.", ["clinical", "engineering"], ["fhir-retrieval", "hl7-parsing", "dicom-metadata-parsing"], ["read-only", "reversible-write"], "specialist", "high", "Interoperability"),
  agent("research", "Builds source-grounded research briefs with contradiction and freshness checks.", ["research", "clinical"], ["research-retrieval", "citation-validation"], ["read-only", "reversible-write"], "frontier", "moderate", "Research Operations"),
  agent("evidence-validator", "Validates schema, citations, source consistency, and evidence freshness.", ["trust-governance", "clinical", "research"], ["citation-validation", "clinical-safety-review"], ["read-only"], "deterministic", "low", "Trust Engineering"),
  agent("clinical-safety", "Applies clinical red flags and routes high-risk output to qualified human review.", ["clinical", "trust-governance"], ["clinical-safety-review"], ["read-only"], "specialist", "high", "Clinical Safety"),
  agent("revenue-cycle", "Prepares prior-authorization and denial-analysis drafts without submission.", ["revenue-cycle"], ["payer-policy-analysis", "prior-authorization-preparation"], ["read-only", "reversible-write"], "balanced", "high", "RCM Governance"),
  agent("patient-access", "Prepares referral and scheduling workflow recommendations without outreach or booking.", ["patient-access", "operations"], ["scheduling-preparation", "patient-education"], ["read-only", "reversible-write"], "balanced", "high", "Patient Access"),
  agent("documentation", "Prepares structured documentation drafts for review.", ["clinical", "operations"], ["medical-nlp", "de-identification"], ["read-only", "reversible-write"], "balanced", "high", "Clinical Documentation"),
  agent("artifact-writer", "Creates cited Markdown and JSON artifacts from verified evidence.", ["clinical", "research", "executive", "revenue-cycle"], ["spreadsheet-specification", "presentation-specification", "citation-validation"], ["read-only", "reversible-write"], "balanced", "moderate", "Product Operations"),
  agent("executive-intelligence", "Prepares claims-safe executive and board briefs.", ["executive"], ["financial-analysis", "presentation-specification"], ["read-only", "reversible-write"], "frontier", "moderate", "Executive Operations"),
  agent("capital-intelligence", "Scores investor fit and prepares internal diligence drafts without outbound action.", ["capital-intelligence", "executive"], ["investor-research", "diligence-qa"], ["read-only", "reversible-write"], "frontier", "high", "CEO + Capital Strategy"),
  agent("infrastructure-observer", "Assesses provider capacity, residency, concentration, and fallback readiness.", ["engineering", "trust-governance"], ["model-routing"], ["read-only"], "deterministic", "moderate", "Platform Reliability"),
  agent("policy-reviewer", "Applies safety, privacy, authorization, and claims policies before completion.", ["trust-governance", "clinical", "executive", "capital-intelligence"], ["clinical-safety-review", "citation-validation"], ["read-only"], "deterministic", "high", "Trust + Compliance")
];

function skill(id: string, purpose: string, permissions: ToolRiskClass[], guardrails: string[]): SkillDefinition {
  return {
    id,
    purpose,
    version: "1.0.0",
    inputs: ["validated metadata-only request", "tenant-scoped context references"],
    outputs: ["structured result", "evidence references", "audit metadata"],
    requiredPermissions: permissions,
    guardrails,
    evaluationSuite: `skill-eval:${id}`,
    maturityLevel: permissions.includes("reversible-write") ? "review-ready" : "protected-pilot",
    enabled: true,
    nextAction: "Expand deterministic regression cases before protected-pilot promotion."
  };
}

const commonSkillGuardrails = ["synthetic or de-identified input only", "human review for consequential use", "no external execution"];

export const controlPlaneSkillRegistry: SkillDefinition[] = [
  skill("fhir-retrieval", "Retrieve and validate read-only FHIR previews.", ["read-only"], [...commonSkillGuardrails, "no EHR writeback"]),
  skill("hl7-parsing", "Parse synthetic HL7 v2 message structure.", ["read-only"], commonSkillGuardrails),
  skill("dicom-metadata-parsing", "Inspect synthetic DICOM metadata without final image interpretation.", ["read-only"], [...commonSkillGuardrails, "no final imaging interpretation"]),
  skill("document-ocr", "Extract document structure for review.", ["read-only"], commonSkillGuardrails),
  skill("medical-nlp", "Normalize clinical language into reviewable structure.", ["read-only"], commonSkillGuardrails),
  skill("de-identification", "Detect and redact identifiers before downstream use.", ["read-only", "reversible-write"], [...commonSkillGuardrails, "fail closed on uncertain redaction"]),
  skill("citation-validation", "Check citation presence, consistency, and freshness.", ["read-only"], commonSkillGuardrails),
  skill("research-retrieval", "Retrieve source-attributed research context.", ["read-only"], commonSkillGuardrails),
  skill("payer-policy-analysis", "Compare documentation drafts with synthetic payer criteria.", ["read-only"], [...commonSkillGuardrails, "no coverage determination"]),
  skill("prior-authorization-preparation", "Prepare reviewable authorization packet metadata.", ["read-only", "reversible-write"], [...commonSkillGuardrails, "no payer submission"]),
  skill("scheduling-preparation", "Prepare scheduling options for human action.", ["read-only", "reversible-write"], [...commonSkillGuardrails, "no booking or outreach"]),
  skill("patient-education", "Draft plain-language education for clinician review.", ["read-only", "reversible-write"], [...commonSkillGuardrails, "not medical advice"]),
  skill("financial-analysis", "Prepare unaudited internal financial analysis metadata.", ["read-only"], [...commonSkillGuardrails, "not accounting, tax, valuation, or investment advice"]),
  skill("spreadsheet-specification", "Define workbook calculations and provenance without generating claims.", ["read-only", "reversible-write"], commonSkillGuardrails),
  skill("presentation-specification", "Define evidence-backed presentation content.", ["read-only", "reversible-write"], commonSkillGuardrails),
  skill("voice-session-handling", "Run consent-aware synthetic voice state transitions.", ["read-only"], [...commonSkillGuardrails, "no raw audio storage"]),
  skill("model-routing", "Select a policy-compliant configured provider profile.", ["read-only"], [...commonSkillGuardrails, "no silent privacy downgrade"]),
  skill("clinical-safety-review", "Detect unsupported clinical claims and require escalation.", ["read-only"], commonSkillGuardrails),
  skill("investor-research", "Score internal investor archetype fit.", ["read-only"], [...commonSkillGuardrails, "no investor contact"]),
  skill("diligence-qa", "Prepare claims-safe diligence answers for CEO review.", ["read-only", "reversible-write"], [...commonSkillGuardrails, "CEO approval required for outbound use"])
];

const prohibitedActions = [
  "live PHI processing",
  "diagnosis, treatment, or prescribing",
  "EHR writeback",
  "payer or claim submission",
  "external communication without approval"
];

function workflow(
  id: string,
  title: string,
  domain: WorkspaceDomain,
  agents: string[],
  skills: string[],
  artifacts: WorkflowDefinition["artifacts"]
): WorkflowDefinition {
  const definitionOfDone: DefinitionOfDoneContract = {
    goal: `Prepare a verified ${title.toLowerCase()} artifact for human review.`,
    allowedScope: ["synthetic metadata", "draft preparation", "evidence validation"],
    prohibitedActions,
    requiredEvidence: ["source citation", "policy decision", "verification result"],
    successCriteria: ["schema valid", "citations present", "human review queued"],
    stoppingConditions: ["missing evidence", "policy denial", "budget exceeded", "objective drift", "loop detected"],
    verificationChecks: ["schema", "citations", "PHI", "policy", "scope", "rollback", "human approval"],
    maximumSteps: 8,
    maximumToolCalls: 12,
    maximumEstimatedCostUsd: 1,
    timeoutMs: 180_000,
    humanApprovalRequired: true,
    rollbackPlan: "Cancel draft, restore the last metadata checkpoint, and preserve immutable audit evidence."
  };

  return {
    id,
    title,
    domain,
    trigger: "explicit authorized operator request",
    definitionOfDone,
    taskGraph: ["policy preflight", "context retrieval", "specialist preparation", "verification", "human gate"],
    participatingAgents: ["coordinator", ...agents, "evidence-validator", "policy-reviewer"],
    requiredSkills: skills,
    contextRequirements: ["tenant scope", "trusted sources", "freshness metadata", "citations"],
    approvalGates: ["pre-execution policy", "artifact review", "external-use approval"],
    verificationChecks: definitionOfDone.verificationChecks,
    artifacts,
    rollbackPlan: definitionOfDone.rollbackPlan,
    telemetry: ["latency", "effective cost", "verification pass rate", "human review minutes", "cancellation"],
    externalActionsEnabled: false
  };
}

export const controlPlaneWorkflowRegistry: WorkflowDefinition[] = [
  workflow("patient-intake-preparation", "Patient Intake Preparation", "patient-access", ["patient-access", "documentation"], ["medical-nlp", "de-identification"], ["care-coordination-brief"]),
  workflow("referral-coordination", "Referral Coordination", "patient-access", ["patient-access", "clinical-context"], ["scheduling-preparation", "fhir-retrieval"], ["care-coordination-brief"]),
  workflow("prior-authorization-preparation", "Prior Authorization Preparation", "revenue-cycle", ["revenue-cycle", "clinical-context"], ["payer-policy-analysis", "prior-authorization-preparation"], ["prior-authorization-draft"]),
  workflow("denial-analysis", "Denial Analysis", "revenue-cycle", ["revenue-cycle"], ["payer-policy-analysis", "citation-validation"], ["appeal-letter-draft", "payer-analysis"]),
  workflow("clinical-documentation-preparation", "Clinical Documentation Preparation", "clinical", ["documentation", "clinical-safety"], ["medical-nlp", "clinical-safety-review"], ["clinical-summary"]),
  workflow("patient-education-drafting", "Patient Education Drafting", "clinical", ["clinical-context", "artifact-writer"], ["patient-education", "citation-validation"], ["patient-education-draft"]),
  workflow("research-brief-generation", "Research Brief Generation", "research", ["research", "artifact-writer"], ["research-retrieval", "citation-validation"], ["research-brief"]),
  workflow("executive-reporting", "Executive Reporting", "executive", ["executive-intelligence", "artifact-writer"], ["financial-analysis", "presentation-specification"], ["executive-report", "board-brief"]),
  workflow("investor-diligence-preparation", "Investor Diligence Preparation", "capital-intelligence", ["capital-intelligence", "executive-intelligence"], ["investor-research", "diligence-qa"], ["investor-memo", "presentation-spec"])
];

const semanticRows: Array<[string, string, string[]]> = [
  ["patient", "Person receiving care", ["Patient"]],
  ["encounter", "Healthcare interaction", ["Encounter"]],
  ["provider", "Qualified care professional", ["Practitioner", "PractitionerRole"]],
  ["organization", "Healthcare organization or tenant", ["Organization"]],
  ["observation", "Measured or asserted clinical observation", ["Observation"]],
  ["condition", "Source-attributed health condition concept", ["Condition"]],
  ["medication", "Medication concept without prescribing authority", ["Medication", "MedicationRequest"]],
  ["procedure", "Performed or proposed procedure concept", ["Procedure"]],
  ["care-plan", "Human-governed care plan", ["CarePlan"]],
  ["referral", "Request for coordinated service", ["ServiceRequest", "Task"]],
  ["appointment", "Scheduling intent or booking record", ["Appointment"]],
  ["claim", "Financial claim abstraction", ["Claim"]],
  ["denial", "Payer denial event", ["ClaimResponse"]],
  ["prior-authorization", "Coverage review workflow", ["Claim", "Task"]],
  ["consent", "Documented permission boundary", ["Consent"]],
  ["provenance", "Source and transformation lineage", ["Provenance"]],
  ["care-gap", "Evidence-backed gap against an approved measure", ["MeasureReport", "DetectedIssue"]],
  ["quality-measure", "Versioned quality calculation definition", ["Measure", "MeasureReport"]],
  ["risk", "Scoped risk estimate with source and limitations", ["RiskAssessment"]],
  ["revenue-leakage", "Operationally attributable unrealized revenue", ["Claim", "Account"]]
];

export const controlPlaneSemanticRegistry: SemanticDefinition[] = semanticRows.map(([id, description, resources]) => ({
  canonicalIdentifier: `scrimed.semantic.${id}`,
  label: id.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join(" "),
  description,
  source: "SCRIMED governed semantic registry",
  owner: "Clinical Data Governance",
  version: "1.0.0",
  effectiveDate: "2026-07-11",
  jurisdiction: "configuration-required",
  calculationLogic: ["care-gap", "quality-measure", "risk", "revenue-leakage"].includes(id)
    ? "Versioned customer-approved calculation required before production use."
    : null,
  lineage: ["SCRIMED control-plane ontology", "FHIR R4 mapping preview"],
  accessPolicy: "tenant-scoped metadata only; retrieved content remains untrusted data",
  relatedFhirResources: resources
}));

export const controlPlaneProviderPolicyProfiles = [
  { id: "deterministic", providerClass: "deterministic", adapter: "scrimed-synthetic-no-call", availability: "available-no-secret", phiEligible: false },
  { id: "openai-compatible", providerClass: "frontier", adapter: "configured-openai-compatible", availability: "configuration-required", phiEligible: false },
  { id: "anthropic-compatible", providerClass: "frontier", adapter: "configured-anthropic-compatible", availability: "configuration-required", phiEligible: false },
  { id: "google-compatible", providerClass: "frontier", adapter: "configured-google-compatible", availability: "future-adapter", phiEligible: false },
  { id: "meta-compatible", providerClass: "balanced", adapter: "configured-meta-compatible", availability: "future-adapter", phiEligible: false },
  { id: "local-open-weight", providerClass: "local-private", adapter: "customer-approved-private-runtime", availability: "deployment-required", phiEligible: false }
] as const;
