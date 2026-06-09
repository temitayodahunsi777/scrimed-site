export type AgentWorkflowStatus = "foundation" | "staged" | "planned";

export type HumanReviewPolicy = {
  required: boolean;
  trigger: string;
  reviewer: string;
};

export type AgentWorkflow = {
  slug: string;
  name: string;
  route: string;
  status: AgentWorkflowStatus;
  domain: string;
  owner: string;
  objective: string;
  inputs: string[];
  outputs: string[];
  permissions: string[];
  auditEvents: string[];
  guardrails: string[];
  humanReview: HumanReviewPolicy;
  interoperabilityTargets: string[];
};

export const agentWorkflows: AgentWorkflow[] = [
  {
    slug: "prior-authorization-agent",
    name: "Prior Authorization Agent",
    route: "/agents/prior-authorization-agent",
    status: "planned",
    domain: "Payer operations",
    owner: "Revenue and access workflows",
    objective: "Prepare reviewable prior authorization packets from structured clinical, coverage, and policy context.",
    inputs: ["coverage policy", "clinical summary", "order request", "supporting documentation"],
    outputs: ["authorization packet draft", "missing-evidence list", "payer-ready rationale"],
    permissions: ["read synthetic clinical fixtures", "read contract metadata", "draft non-final authorization content"],
    auditEvents: ["packet drafted", "policy evidence cited", "human review requested", "submission approved"],
    guardrails: ["no autonomous payer submission", "no coverage guarantee", "source policy citation required"],
    humanReview: {
      required: true,
      trigger: "before any payer-facing packet is submitted",
      reviewer: "authorized revenue cycle or clinical operations reviewer"
    },
    interoperabilityTargets: ["FHIR", "claims/utilization", "payer policy APIs"]
  },
  {
    slug: "revenue-cycle-agent",
    name: "Revenue Cycle Agent",
    route: "/agents/revenue-cycle-agent",
    status: "planned",
    domain: "Revenue operations",
    owner: "Administrative automation",
    objective: "Identify documentation, coding, claim, and denial-workflow gaps without making final billing determinations.",
    inputs: ["claim metadata", "encounter summary", "denial reason", "coding policy"],
    outputs: ["workqueue recommendation", "documentation gap list", "appeal draft"],
    permissions: ["read operational fixtures", "draft appeal text", "surface coding-policy references"],
    auditEvents: ["claim analyzed", "gap detected", "appeal draft generated", "review disposition recorded"],
    guardrails: ["no final coding decision", "no autonomous claim submission", "no unsupported reimbursement claim"],
    humanReview: {
      required: true,
      trigger: "before coding, billing, appeal, or claim-submission action",
      reviewer: "certified coding, billing, or revenue cycle reviewer"
    },
    interoperabilityTargets: ["claims/utilization", "HL7", "EHR billing exports"]
  },
  {
    slug: "scheduling-agent",
    name: "Scheduling Agent",
    route: "/agents/scheduling-agent",
    status: "planned",
    domain: "Access operations",
    owner: "Care navigation",
    objective: "Coordinate scheduling options across clinical urgency, patient preference, eligibility, and operational capacity.",
    inputs: ["appointment request", "availability", "care pathway", "patient preference"],
    outputs: ["ranked scheduling options", "routing recommendation", "escalation reason"],
    permissions: ["read scheduling fixture", "rank appointment options", "prepare outreach draft"],
    auditEvents: ["options ranked", "constraint detected", "patient outreach drafted", "escalation created"],
    guardrails: ["no emergency triage replacement", "no autonomous appointment confirmation without configured consent"],
    humanReview: {
      required: true,
      trigger: "when urgency, eligibility, capacity, or consent is ambiguous",
      reviewer: "care navigator or scheduling operations reviewer"
    },
    interoperabilityTargets: ["EHR scheduling", "patient access systems", "FHIR"]
  },
  {
    slug: "trial-matching-agent",
    name: "Trial Matching Agent",
    route: "/agents/trial-matching-agent",
    status: "staged",
    domain: "Research operations",
    owner: "TrialCore",
    objective: "Map synthetic patient signals to trial eligibility questions and produce reviewable matching rationale.",
    inputs: ["trial criteria", "diagnosis signals", "biomarker signals", "prior therapy history"],
    outputs: ["candidate trial list", "eligibility rationale", "evidence-gap list"],
    permissions: ["read synthetic clinical fixtures", "compare structured eligibility criteria", "draft research-review rationale"],
    auditEvents: ["criteria evaluated", "evidence gap detected", "candidate match produced", "research review requested"],
    guardrails: ["no enrollment recommendation", "no treatment recommendation", "human research review required"],
    humanReview: {
      required: true,
      trigger: "before patient outreach, enrollment workflow, or clinical-trial recommendation",
      reviewer: "research coordinator or qualified clinician reviewer"
    },
    interoperabilityTargets: ["research platforms", "FHIR", "clinical trial registries"]
  },
  {
    slug: "documentation-agent",
    name: "Documentation Agent",
    route: "/agents/documentation-agent",
    status: "staged",
    domain: "Clinical documentation",
    owner: "DocuTwin",
    objective: "Produce reviewable clinical documentation drafts from structured context while preserving clinician authorship.",
    inputs: ["encounter context", "conversation summary", "clinical observations", "template requirements"],
    outputs: ["draft note", "missing-data prompts", "review checklist"],
    permissions: ["read synthetic note fixtures", "draft documentation", "highlight missing context"],
    auditEvents: ["draft generated", "missing data flagged", "clinician review requested", "final disposition recorded"],
    guardrails: ["draft-only output", "no final clinical note", "no uncited diagnosis insertion"],
    humanReview: {
      required: true,
      trigger: "before documentation becomes part of the record",
      reviewer: "licensed clinician or delegated clinical documentation reviewer"
    },
    interoperabilityTargets: ["EHR notes", "FHIR DocumentReference", "HL7"]
  },
  {
    slug: "compliance-agent",
    name: "Compliance Agent",
    route: "/agents/compliance-agent",
    status: "foundation",
    domain: "Governance",
    owner: "Trust infrastructure",
    objective: "Check workflows against privacy, security, auditability, and human-review requirements before expansion.",
    inputs: ["workflow definition", "permissions", "audit events", "risk classification"],
    outputs: ["compliance gap report", "required-control checklist", "governance review queue"],
    permissions: ["read workflow metadata", "evaluate controls", "create governance findings"],
    auditEvents: ["workflow reviewed", "control gap flagged", "approval requested", "exception recorded"],
    guardrails: ["no silent approval", "exception logging required", "least-privilege review required"],
    humanReview: {
      required: true,
      trigger: "before workflow promotion or control exception",
      reviewer: "compliance, security, or governance owner"
    },
    interoperabilityTargets: ["audit logs", "identity systems", "GRC systems"]
  },
  {
    slug: "interoperability-agent",
    name: "Interoperability Agent",
    route: "/agents/interoperability-agent",
    status: "staged",
    domain: "Data interoperability",
    owner: "Integration fabric",
    objective: "Map workflow needs to FHIR, HL7 v2, DICOM/DICOMweb, X12, IHE, pharmacy, device, terminology, and future healthcare connector contracts.",
    inputs: ["contract definition", "source schema", "target workflow", "synthetic fixture", "conformance test kit"],
    outputs: ["mapping plan", "contract gap list", "synthetic conformance evaluation", "connector readiness recommendation"],
    permissions: ["read integration contracts", "read synthetic fixtures", "execute deterministic conformance checks", "propose mappings"],
    auditEvents: ["contract mapped", "schema gap detected", "synthetic conformance evaluated", "live blockers retained", "review requested"],
    guardrails: ["no production data pull", "synthetic-first validation", "no certification claim", "schema drift flagged"],
    humanReview: {
      required: true,
      trigger: "before live connector implementation or schema promotion",
      reviewer: "integration architect or data governance owner"
    },
    interoperabilityTargets: ["FHIR", "HL7 v2", "DICOM/DICOMweb", "X12", "IHE profiles", "clinical terminology", "devices"]
  },
  {
    slug: "clinical-intelligence-agent",
    name: "Clinical Intelligence Agent",
    route: "/agents/clinical-intelligence-agent",
    status: "planned",
    domain: "Clinical intelligence",
    owner: "Clinical Copilot",
    objective: "Summarize clinical context and surface reviewable decision-support signals without replacing clinical judgment.",
    inputs: ["patient summary", "risk markers", "care pathway", "evidence reference"],
    outputs: ["context summary", "risk signal list", "clinician review prompts"],
    permissions: ["read synthetic clinical fixtures", "summarize context", "surface evidence-linked prompts"],
    auditEvents: ["summary generated", "risk signal surfaced", "review prompt created", "clinician disposition recorded"],
    guardrails: ["no diagnosis authority", "no treatment order", "emergency escalation language required when applicable"],
    humanReview: {
      required: true,
      trigger: "before clinical decision, order, diagnosis, or patient-facing guidance",
      reviewer: "licensed clinician"
    },
    interoperabilityTargets: ["EHR", "FHIR", "clinical decision support hooks"]
  },
  {
    slug: "research-agent",
    name: "Research Agent",
    route: "/agents/research-agent",
    status: "planned",
    domain: "Research intelligence",
    owner: "Research operations",
    objective: "Synthesize research context, evidence gaps, and cohort questions for human research teams.",
    inputs: ["research question", "cohort criteria", "literature summary", "data availability"],
    outputs: ["research brief", "cohort feasibility questions", "evidence gap summary"],
    permissions: ["read research fixtures", "summarize evidence", "draft research operations brief"],
    auditEvents: ["brief drafted", "evidence gap logged", "cohort question created", "review disposition recorded"],
    guardrails: ["no IRB bypass", "no unsupported clinical claim", "human research approval required"],
    humanReview: {
      required: true,
      trigger: "before study design, patient outreach, publication, or operational decision",
      reviewer: "research lead, IRB owner, or qualified clinician reviewer"
    },
    interoperabilityTargets: ["research platforms", "data warehouses", "clinical registries"]
  },
  {
    slug: "governance-agent",
    name: "Governance Agent",
    route: "/agents/governance-agent",
    status: "foundation",
    domain: "Trust governance",
    owner: "Watchtower",
    objective: "Track model, workflow, policy, risk, and quality-gate changes across SCRIMED operating surfaces.",
    inputs: ["quality gates", "readiness checks", "workflow registry", "audit events"],
    outputs: ["governance summary", "risk queue", "approval trace"],
    permissions: ["read operational metadata", "aggregate audit signals", "create governance queue items"],
    auditEvents: ["quality gate changed", "risk queued", "approval requested", "exception logged"],
    guardrails: ["immutable audit trail required", "material change review required", "no hidden policy exceptions"],
    humanReview: {
      required: true,
      trigger: "before governance exception, quality-gate downgrade, or workflow promotion",
      reviewer: "executive, security, compliance, or clinical governance owner"
    },
    interoperabilityTargets: ["audit logs", "quality systems", "GRC systems", "Watchtower"]
  },
  {
    slug: "supply-chain-agent",
    name: "Supply Chain Agent",
    route: "/agents/supply-chain-agent",
    status: "planned",
    domain: "Healthcare operations",
    owner: "Operational intelligence",
    objective: "Detect supply, inventory, vendor, and care-continuity risks before they affect patient operations.",
    inputs: ["inventory signal", "vendor status", "utilization trend", "care-critical item list"],
    outputs: ["risk alert", "substitution review queue", "procurement recommendation draft"],
    permissions: ["read operational fixtures", "detect inventory risk", "draft procurement review item"],
    auditEvents: ["risk detected", "substitution flagged", "review queue created", "resolution recorded"],
    guardrails: ["no autonomous procurement commitment", "clinical-critical substitution requires human review"],
    humanReview: {
      required: true,
      trigger: "before procurement action, substitution, or clinical-critical inventory decision",
      reviewer: "supply chain, clinical operations, or procurement owner"
    },
    interoperabilityTargets: ["ERP", "inventory systems", "supplier systems", "EHR utilization signals"]
  }
];

export function getAgentWorkflowBySlug(slug: string) {
  return agentWorkflows.find((workflow) => workflow.slug === slug);
}

export function getAgentWorkflowSummary() {
  return {
    service: "scrimed-agent-workflow-registry",
    status: "foundation-registry-online",
    count: agentWorkflows.length,
    foundation: agentWorkflows.filter((workflow) => workflow.status === "foundation").length,
    staged: agentWorkflows.filter((workflow) => workflow.status === "staged").length,
    planned: agentWorkflows.filter((workflow) => workflow.status === "planned").length,
    humanReviewRequired: agentWorkflows.filter((workflow) => workflow.humanReview.required).length,
    workflows: agentWorkflows,
    updated: "2026-06-09"
  };
}
