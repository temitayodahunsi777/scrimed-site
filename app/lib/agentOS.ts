import { agentWorkflows } from "./agentWorkflows";
import { workflowExecutions } from "./workflowExecutions";
import { getInteroperabilityConformanceEvaluationSummary } from "./interoperabilityConformanceEvaluations";

export type AgentOSStatus = "foundation-online" | "synthetic-runtime-ready" | "production-gated";
export type AgentRole = "planner" | "router" | "specialist" | "trustqa" | "governance";
export type MemoryLayerKind = "session" | "operational" | "knowledge";
export type ConnectorStatus = "available" | "planned" | "requires-baa" | "synthetic-only";
export type ExecutionMode = "synthetic-pilot" | "enterprise-assessment" | "production-request";
export type TaskPlanStatus = "synthetic-plan-created" | "requires-human-approval" | "denied-production-request";

export type AgentOSAgent = {
  slug: string;
  name: string;
  role: AgentRole;
  status: AgentOSStatus;
  owner: string;
  responsibility: string;
  inputs: string[];
  outputs: string[];
  approvalRequired: boolean;
  auditEvents: string[];
};

export type SpecialistService = {
  service: string;
  route: string;
  agentOwner: string;
  capability: string;
  workflowTypes: string[];
  governanceBoundary: string;
};

export type MemoryLayer = {
  kind: MemoryLayerKind;
  name: string;
  route: string;
  purpose: string;
  retention: string;
  accessPolicy: string;
  prohibitedData: string[];
  auditEvents: string[];
};

export type TrustQACheck = {
  check: string;
  status: "active" | "planned";
  purpose: string;
  failureAction: string;
};

export type HumanApprovalCheckpoint = {
  checkpoint: string;
  owner: string;
  trigger: string;
  requiredBefore: string;
};

export type AuditChannel = {
  channel: string;
  route: string;
  eventTypes: string[];
  capturePolicy: string;
  retentionPosture: string;
};

export type McpConnector = {
  name: string;
  status: ConnectorStatus;
  system: string;
  supportedWorkflows: string[];
  minimumControls: string[];
};

export type RbacRole = {
  role: string;
  scope: string;
  allowed: string[];
  denied: string[];
};

export type SandboxRuntime = {
  workflow: string;
  route: string;
  agent: string;
  isolation: string;
  memory: string[];
  tools: string[];
  audit: string[];
  boundary: string;
};

export type TaskExecutionTemplate = {
  slug: string;
  name: string;
  route: string;
  owner: string;
  executionMode: ExecutionMode[];
  plannerSteps: string[];
  routerRules: string[];
  specialistAgents: string[];
  humanApprovals: string[];
  trustChecks: string[];
  deniedCapabilities: string[];
};

export type ObservabilitySignal = {
  metric: string;
  route: string;
  purpose: string;
  escalation: string;
};

export type AgentOSTaskRequest = {
  taskType: string;
  organizationId?: string;
  requestedByRole?: string;
  mode: ExecutionMode;
  workflowTarget: string;
  objective: string;
  dataBoundaryAcknowledged: boolean;
  humanApprovalRequired?: boolean;
  context?: string;
};

export type AgentOSTaskPlan = {
  taskId: string;
  status: TaskPlanStatus;
  mode: ExecutionMode;
  template: TaskExecutionTemplate;
  plannerAgent: string;
  routerAgent: string;
  specialistAgents: string[];
  memoryLayers: string[];
  approvalCheckpoints: string[];
  trustQaChecks: string[];
  auditEvents: string[];
  deniedCapabilities: string[];
  boundary: string;
  createdAt: string;
};

export const agentOSBoundary =
  "SCRIMED AgentOS v1 orchestrates synthetic pilot and enterprise assessment workflows only. It does not autonomously diagnose, treat, submit payer transactions, contact patients, file clinical documentation, or execute live care operations.";

export const agentOSControlPlane: AgentOSAgent[] = [
  {
    slug: "planner-agent",
    name: "Planner Agent",
    role: "planner",
    status: "synthetic-runtime-ready",
    owner: "AgentOS control plane",
    responsibility:
      "Translate enterprise objectives into bounded workflow plans with memory scope, evidence needs, approvals, and measurable outcomes.",
    inputs: ["buyer objective", "workflow target", "governance requirements", "synthetic fixture context"],
    outputs: ["task plan", "approval graph", "evidence request", "measurement plan"],
    approvalRequired: true,
    auditEvents: ["plan created", "scope constrained", "approval graph attached", "denied capabilities recorded"]
  },
  {
    slug: "router-agent",
    name: "Router Agent",
    role: "router",
    status: "synthetic-runtime-ready",
    owner: "AgentOS control plane",
    responsibility:
      "Route tasks to specialist agents by workflow type, risk level, evidence requirement, and connector boundary.",
    inputs: ["task plan", "agent registry", "RBAC role", "sandbox policy"],
    outputs: ["agent assignment", "sandbox selection", "handoff trace", "blocked action list"],
    approvalRequired: true,
    auditEvents: ["agent routed", "sandbox selected", "permission evaluated", "handoff trace recorded"]
  },
  {
    slug: "trustqa-agent",
    name: "TrustQA Verification Agent",
    role: "trustqa",
    status: "foundation-online",
    owner: "Watchtower trust layer",
    responsibility:
      "Verify outputs against boundary, evidence, confidence, safety, source attribution, and human-review policy before release.",
    inputs: ["agent output", "trust card", "evidence bundle", "audit trace"],
    outputs: ["verification state", "trust card disposition", "escalation reason", "release recommendation"],
    approvalRequired: true,
    auditEvents: ["TrustQA check run", "confidence evaluated", "source attribution checked", "release blocked or approved"]
  },
  {
    slug: "governance-agent",
    name: "Governance Agent",
    role: "governance",
    status: "foundation-online",
    owner: "Atlas Trust Systems Stack",
    responsibility:
      "Maintain AI asset inventory, policy trace, exception logs, approval records, and shadow AI detection signals.",
    inputs: ["asset registry", "model registry", "prompt registry", "connector registry", "audit events"],
    outputs: ["governance finding", "risk queue", "exception record", "asset disposition"],
    approvalRequired: true,
    auditEvents: ["asset registered", "shadow AI signal detected", "exception requested", "governance review completed"]
  }
];

export const specialistServiceRegistry: SpecialistService[] = [
  {
    service: "Sanar AI",
    route: "/agents/clinical-intelligence-agent",
    agentOwner: "Clinical Intelligence Agent",
    capability: "Clinical context summarization and review prompts for synthetic or approved assessment workflows.",
    workflowTypes: ["care-gap-detection", "patient-onboarding", "chronic-care-monitoring"],
    governanceBoundary: "No diagnosis, treatment order, or patient-facing guidance without licensed clinician review."
  },
  {
    service: "DocuTwin",
    route: "/agents/documentation-agent",
    agentOwner: "Documentation Agent",
    capability: "Draft-only documentation review with source trace, missing context, and clinician review state.",
    workflowTypes: ["ambient-documentation", "documentation-quality-review"],
    governanceBoundary: "No final note, EHR filing, or clinical claim insertion without clinician approval."
  },
  {
    service: "CareExplain",
    route: "/trust",
    agentOwner: "TrustQA Verification Agent",
    capability: "Evidence-backed explanation, provenance, confidence, and source attribution for recommendations.",
    workflowTypes: ["patient-education-review", "recommendation-explanation", "trust-card-generation"],
    governanceBoundary: "Explanations are review support, not clinical advice or patient instruction."
  },
  {
    service: "Ambient Scribe",
    route: "/agents/documentation-agent",
    agentOwner: "Documentation Agent",
    capability: "Conversation-to-draft-note workflows with review queues and no final-signature capability.",
    workflowTypes: ["ambient-documentation", "source-trace-review"],
    governanceBoundary: "Draft-only; no medical-record update without authorized human review."
  },
  {
    service: "TrialCore",
    route: "/agents/trial-matching-agent",
    agentOwner: "Trial Matching Agent",
    capability: "Eligibility queue support with criteria trace, missing evidence, and research review requirements.",
    workflowTypes: ["trial-matching", "research-operations"],
    governanceBoundary: "No enrollment recommendation, outreach, or treatment recommendation without research review."
  },
  {
    service: "PayerIQ",
    route: "/agents/prior-authorization-agent",
    agentOwner: "Prior Authorization Agent",
    capability: "Policy-aware prior authorization and claims workqueue support with payer-facing actions blocked.",
    workflowTypes: ["prior-authorization", "claims-review", "rcm-denial-risk"],
    governanceBoundary: "No payer submission, coverage guarantee, final coding, or billing action without qualified review."
  }
];

export const memoryFabric: MemoryLayer[] = [
  {
    kind: "session",
    name: "Session Memory",
    route: "/memory#session",
    purpose: "Short-lived task context for a single synthetic pilot request, workflow review, or assessment session.",
    retention: "Ephemeral by default; production retention requires tenant policy and audit approval.",
    accessPolicy: "Scoped to assigned agent, reviewer, and tenant role.",
    prohibitedData: ["PHI", "patient identifiers", "live clinical records", "payer member identifiers"],
    auditEvents: ["session memory opened", "session memory summarized", "session memory cleared"]
  },
  {
    kind: "operational",
    name: "Operational Memory",
    route: "/memory#operational",
    purpose: "Workflow state, routing decisions, approval dispositions, exception reasons, and synthetic pilot outcomes.",
    retention: "Durable only for synthetic pilot evidence and approved enterprise assessment records.",
    accessPolicy: "Tenant-scoped operators, governance owners, and approved reviewers.",
    prohibitedData: ["unapproved patient data", "raw chart text", "unredacted claims payloads"],
    auditEvents: ["workflow state recorded", "approval disposition stored", "exception reason linked"]
  },
  {
    kind: "knowledge",
    name: "Knowledge Memory",
    route: "/memory#knowledge",
    purpose: "Guidelines, protocols, policies, publications, connector contracts, and governance source references.",
    retention: "Versioned with validation timestamp, source owner, and retirement policy.",
    accessPolicy: "Read-only for agents; write access requires knowledge steward and TrustQA verification.",
    prohibitedData: ["uncited clinical claims", "unversioned policy excerpts", "unapproved local protocols"],
    auditEvents: ["source registered", "source version validated", "source retired"]
  }
];

export const trustQaVerificationLayer: TrustQACheck[] = [
  {
    check: "Boundary verification",
    status: "active",
    purpose: "Confirm an output stays within synthetic pilot or enterprise assessment scope.",
    failureAction: "Block release and create governance review item."
  },
  {
    check: "Evidence attribution",
    status: "active",
    purpose: "Require cited source, source type, version, validation timestamp, and confidence score.",
    failureAction: "Return to planner with evidence-gap status."
  },
  {
    check: "Human approval checkpoint",
    status: "active",
    purpose: "Confirm reviewer role and checkpoint before external, clinical, payer, or patient-facing use.",
    failureAction: "Hold in review queue."
  },
  {
    check: "Prompt-injection and unsafe-tool review",
    status: "planned",
    purpose: "Detect attempts to override boundary, hidden instructions, connector limits, or approval policy.",
    failureAction: "Quarantine task and record security event."
  }
];

export const humanApprovalCheckpoints: HumanApprovalCheckpoint[] = [
  {
    checkpoint: "Clinical review",
    owner: "Licensed clinician or delegated clinical reviewer",
    trigger: "Any output that may inform clinical judgment, care pathway review, or documentation finalization.",
    requiredBefore: "Clinical decision, diagnosis, order entry, note signature, or patient-facing guidance."
  },
  {
    checkpoint: "Payer or RCM review",
    owner: "Revenue cycle, payer operations, or certified coding reviewer",
    trigger: "Any authorization packet, claim review, appeal draft, or denial-risk workflow.",
    requiredBefore: "Payer submission, appeal submission, billing action, or coding disposition."
  },
  {
    checkpoint: "Governance review",
    owner: "Security, compliance, privacy, or AI governance lead",
    trigger: "New model, prompt, tool, connector, exception, or knowledge source.",
    requiredBefore: "Production promotion, live connector enablement, or policy exception."
  },
  {
    checkpoint: "Executive sponsor review",
    owner: "Buyer sponsor or SCRIMED enterprise owner",
    trigger: "Pilot scope, deployment phase change, ROI claim, or contract-ready assessment.",
    requiredBefore: "Commercial handoff, protected pilot launch, or production planning."
  }
];

export const auditChannels: AuditChannel[] = [
  {
    channel: "Agent plan audit",
    route: "/audit#agent-plan",
    eventTypes: ["plan created", "route selected", "specialist assigned", "blocked capability recorded"],
    capturePolicy: "Metadata-only for synthetic pilots; no raw PHI or live clinical payload capture.",
    retentionPosture: "Durable synthetic evidence and enterprise assessment trace."
  },
  {
    channel: "TrustQA audit",
    route: "/audit#trustqa",
    eventTypes: ["evidence checked", "confidence scored", "source attributed", "output held"],
    capturePolicy: "Capture source IDs, validation timestamps, reviewer disposition, and blocked reasons.",
    retentionPosture: "Versioned and reviewable by tenant governance."
  },
  {
    channel: "Human approval audit",
    route: "/audit#approvals",
    eventTypes: ["approval requested", "approval granted", "approval denied", "override recorded"],
    capturePolicy: "Record reviewer role, checkpoint, timestamp, scope, and disposition.",
    retentionPosture: "Durable enterprise audit record when tenant retention is configured."
  }
];

export const mcpConnectorFramework: McpConnector[] = [
  {
    name: "Interoperability conformance connector framework",
    status: "synthetic-only",
    system: "FHIR, SMART App Launch, HL7 v2, DICOM/DICOMweb, X12, IHE, and terminology ecosystems",
    supportedWorkflows: ["standards-profile-selection", "synthetic-conformance-evaluation", "connector-readiness-review"],
    minimumControls: ["synthetic-only fixture", "contract binding", "evidence artifacts", "live blocker retention", "integration architect review"]
  },
  {
    name: "EHR connector framework",
    status: "planned",
    system: "Epic, Cerner, athenahealth, and other EHR/FHIR ecosystems",
    supportedWorkflows: ["referral-intake", "documentation-review", "care-gap-detection"],
    minimumControls: ["BAA review", "FHIR scope approval", "tenant identity", "audit logging", "human review"]
  },
  {
    name: "Payer connector framework",
    status: "planned",
    system: "payer APIs, policy repositories, prior authorization APIs, claims systems",
    supportedWorkflows: ["prior-authorization", "claims-review", "rcm-denial-risk"],
    minimumControls: ["payer contract", "policy versioning", "submission block", "RCM reviewer approval"]
  },
  {
    name: "Knowledge connector framework",
    status: "available",
    system: "guidelines, protocols, policies, publications, buyer knowledge repositories",
    supportedWorkflows: ["evidence-retrieval", "trust-card-generation", "governance-review"],
    minimumControls: ["source owner", "version metadata", "validation timestamp", "TrustQA verification"]
  },
  {
    name: "CRM connector framework",
    status: "available",
    system: "HubSpot, Wix automation, Zapier/Make, secure CRM webhook",
    supportedWorkflows: ["pilot-intake", "enterprise-assessment", "buyer-follow-up"],
    minimumControls: ["business-contact only", "no PHI", "consent", "audit event", "secure webhook token"]
  }
];

export const rbacPermissions: RbacRole[] = [
  {
    role: "Enterprise Admin",
    scope: "Tenant configuration, pilot scope, users, connectors, and governance controls.",
    allowed: ["manage tenant settings", "configure synthetic workflows", "assign reviewers", "view audit summaries"],
    denied: ["bypass TrustQA", "submit live clinical actions without production controls", "delete immutable audit traces"]
  },
  {
    role: "Clinical Reviewer",
    scope: "Clinical review queues, documentation drafts, care-gap prompts, and evidence-linked recommendations.",
    allowed: ["review clinical outputs", "approve or reject draft recommendations", "request evidence clarification"],
    denied: ["configure connectors", "change governance policy", "approve payer submissions outside assigned workflow"]
  },
  {
    role: "RCM Reviewer",
    scope: "Prior authorization, denial-risk, claims, appeal drafts, and payer policy evidence.",
    allowed: ["review payer packets", "approve RCM drafts", "request missing evidence"],
    denied: ["finalize clinical diagnosis", "override clinical review", "submit payer transactions without approval"]
  },
  {
    role: "Agent Runtime Service",
    scope: "Scoped agent execution inside sandboxed synthetic or approved tenant workflows.",
    allowed: ["read assigned memory", "write audit events", "generate review-only outputs"],
    denied: ["read unrelated tenant memory", "perform autonomous live actions", "modify RBAC policy"]
  }
];

export const sandboxRuntimes: SandboxRuntime[] = [
  {
    workflow: "Interoperability conformance evaluation",
    route: "/interoperability/evaluations",
    agent: "Interoperability Agent",
    isolation: "Per-test-kit sandbox with synthetic fixtures, standards references, connector contracts, deterministic checks, and live-blocker retention.",
    memory: ["session", "operational", "knowledge"],
    tools: ["contract reader", "fixture validator", "conformance check runner", "evidence packet builder"],
    audit: ["test kit opened", "synthetic checks executed", "evidence artifacts linked", "live blockers retained"],
    boundary: "No live connector execution, certification claim, partner acceptance claim, or production healthcare data exchange."
  },
  {
    workflow: "Prior authorization support",
    route: "/workflows/contracts",
    agent: "Prior Authorization Agent",
    isolation: "Per-task sandbox with synthetic policy, packet draft files, scoped memory, and review-only tools.",
    memory: ["session", "operational", "knowledge"],
    tools: ["policy evidence retrieval", "packet draft builder", "missing-evidence detector"],
    audit: ["task opened", "policy cited", "packet drafted", "human review requested"],
    boundary: "No payer submission, coverage guarantee, or medical-necessity determination."
  },
  {
    workflow: "Referral intake automation",
    route: "/workflows",
    agent: "Scheduling Agent",
    isolation: "Referral-specific sandbox with routing rules, missing-information checklist, and escalation policy.",
    memory: ["session", "operational"],
    tools: ["referral parser", "routing constraint map", "review queue generator"],
    audit: ["referral structured", "gap detected", "routing recommendation drafted", "escalation created"],
    boundary: "No autonomous referral acceptance, clinical triage replacement, or patient outreach."
  },
  {
    workflow: "Claims and denial risk review",
    route: "/workflows",
    agent: "Revenue Cycle Agent",
    isolation: "RCM sandbox with claim metadata fixtures, policy references, and reviewer disposition state.",
    memory: ["session", "operational", "knowledge"],
    tools: ["denial-risk detector", "appeal outline builder", "documentation gap mapper"],
    audit: ["claim reviewed", "risk signal surfaced", "appeal draft prepared", "review disposition recorded"],
    boundary: "No final billing, coding, claim submission, or reimbursement guarantee."
  },
  {
    workflow: "Ambient documentation review",
    route: "/workflows/docutwin-draft-note-review",
    agent: "Documentation Agent",
    isolation: "Documentation sandbox with draft-only note files, source trace, and signature-disabled output.",
    memory: ["session", "operational"],
    tools: ["draft note builder", "source trace mapper", "missing context prompt generator"],
    audit: ["draft generated", "source trace attached", "review checklist created", "signature blocked"],
    boundary: "No final note, record filing, diagnosis insertion, or clinician-signature replacement."
  }
];

export const taskExecutionEngine: TaskExecutionTemplate[] = [
  {
    slug: "interoperability-conformance-assessment",
    name: "Interoperability Conformance Assessment",
    route: "/interoperability/evaluations",
    owner: "Interoperability Agent",
    executionMode: ["enterprise-assessment", "synthetic-pilot"],
    plannerSteps: ["select test kit", "bind connector contract", "execute synthetic checks", "retain live blockers"],
    routerRules: ["route to Interoperability Agent", "attach TrustQA", "block certification claim", "require integration architect review"],
    specialistAgents: ["Interoperability Agent", "Governance Agent", "TrustQA Verification Agent"],
    humanApprovals: ["Governance review", "Executive sponsor review"],
    trustChecks: ["Boundary verification", "Evidence attribution", "Human approval checkpoint"],
    deniedCapabilities: ["live connector execution", "certification claim", "production healthcare data exchange"]
  },
  {
    slug: "enterprise-workflow-assessment",
    name: "Enterprise Workflow Assessment",
    route: "/workflows",
    owner: "Planner Agent",
    executionMode: ["enterprise-assessment", "synthetic-pilot"],
    plannerSteps: ["classify workflow", "map value signal", "attach governance requirements", "select evidence needs"],
    routerRules: ["route by workflow target", "enforce RBAC role", "select sandbox", "attach TrustQA"],
    specialistAgents: ["Interoperability Agent", "Governance Agent", "TrustQA Verification Agent"],
    humanApprovals: ["Executive sponsor review", "Governance review"],
    trustChecks: ["Boundary verification", "Evidence attribution", "Human approval checkpoint"],
    deniedCapabilities: ["live connector execution", "patient outreach", "payer submission"]
  },
  {
    slug: "prior-authorization-packet-plan",
    name: "Prior Authorization Packet Plan",
    route: "/agents/prior-authorization-agent",
    owner: "Prior Authorization Agent",
    executionMode: ["synthetic-pilot", "enterprise-assessment"],
    plannerSteps: ["identify payer policy source", "map missing evidence", "draft review packet", "attach reviewer checkpoint"],
    routerRules: ["route to PayerIQ", "require RCM reviewer", "block payer submission", "attach policy trust card"],
    specialistAgents: ["Prior Authorization Agent", "Revenue Cycle Agent", "TrustQA Verification Agent"],
    humanApprovals: ["Payer or RCM review", "Governance review"],
    trustChecks: ["Evidence attribution", "Boundary verification", "Human approval checkpoint"],
    deniedCapabilities: ["coverage guarantee", "medical necessity determination", "autonomous payer submission"]
  },
  {
    slug: "documentation-review-plan",
    name: "Documentation Review Plan",
    route: "/agents/documentation-agent",
    owner: "DocuTwin",
    executionMode: ["synthetic-pilot", "enterprise-assessment"],
    plannerSteps: ["parse encounter context", "create draft-only outline", "attach source trace", "require clinician review"],
    routerRules: ["route to DocuTwin", "block final note", "require clinician reviewer", "attach documentation trust card"],
    specialistAgents: ["Documentation Agent", "Clinical Intelligence Agent", "TrustQA Verification Agent"],
    humanApprovals: ["Clinical review", "Governance review"],
    trustChecks: ["Boundary verification", "Evidence attribution", "Human approval checkpoint"],
    deniedCapabilities: ["final note signature", "EHR filing", "autonomous diagnosis insertion"]
  },
  {
    slug: "access-monitoring-plan",
    name: "ACCESS-Aligned Monitoring Plan",
    route: "/atlas",
    owner: "Sanar AI",
    executionMode: ["enterprise-assessment", "synthetic-pilot"],
    plannerSteps: ["map chronic-care track", "identify wearable/telehealth signal", "define outcome reporting", "attach clinician-guided review"],
    routerRules: ["route to Sanar AI", "require clinical reviewer", "require evidence timestamp", "block reimbursement claim"],
    specialistAgents: ["Clinical Intelligence Agent", "Interoperability Agent", "Governance Agent"],
    humanApprovals: ["Clinical review", "Executive sponsor review", "Governance review"],
    trustChecks: ["Evidence attribution", "Boundary verification", "Human approval checkpoint"],
    deniedCapabilities: ["reimbursement guarantee", "autonomous patient monitoring", "clinical outcome claim"]
  }
];

export const observabilitySignals: ObservabilitySignal[] = [
  {
    metric: "Task throughput",
    route: "/observability#throughput",
    purpose: "Track plan creation, routed tasks, sandbox runs, held outputs, and completed reviews.",
    escalation: "Escalate if workflow queues exceed buyer SLA or review aging threshold."
  },
  {
    metric: "Override rate",
    route: "/observability#overrides",
    purpose: "Measure how often humans reject, modify, or override agent outputs.",
    escalation: "Escalate to TrustQA when override rate rises above pilot threshold."
  },
  {
    metric: "Escalation rate",
    route: "/observability#escalations",
    purpose: "Track safety, evidence, policy, RBAC, and ambiguity escalations.",
    escalation: "Escalate to governance when recurring issue category appears."
  },
  {
    metric: "Trust metrics",
    route: "/observability#trust",
    purpose: "Measure confidence distribution, citation completeness, validation freshness, and release blocks.",
    escalation: "Block promotion when trust-card completeness falls below threshold."
  },
  {
    metric: "Revenue and access impact",
    route: "/observability#impact",
    purpose: "Track time saved, denial-risk signals, revenue leakage surfaced, access bottlenecks, and documentation quality signals.",
    escalation: "Escalate to executive review before any ROI claim leaves pilot context."
  }
];

export const hipaaReadyArchitectureControls = [
  "Tenant isolation",
  "Least-privilege RBAC",
  "Business Associate Agreement readiness",
  "Encryption in transit and at rest",
  "Immutable audit trail",
  "Human approval checkpoints",
  "No PHI in synthetic pilots",
  "Prompt-injection and tool-abuse monitoring",
  "Incident response and emergency shutdown policy",
  "Regional retention and data-residency planning"
];

const restrictedDataPatterns = [
  /\b(ssn|social security)\b/i,
  /\b(mrn|medical record number)\b/i,
  /\b(date of birth|dob)\b/i,
  /\b(patient name|patient identifier|member id|insurance id|policy number)\b/i,
  /\b(live chart|clinical record|progress note|lab result)\b/i
];

function hasRestrictedHealthData(value: string) {
  return restrictedDataPatterns.some((pattern) => pattern.test(value));
}

function safeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function validateAgentOSTaskPayload(payload: unknown) {
  const errors: string[] = [];

  if (!payload || typeof payload !== "object") {
    return {
      valid: false,
      errors: ["Payload must be a JSON object."]
    };
  }

  const body = payload as Record<string, unknown>;
  const taskType = safeString(body.taskType);
  const mode = safeString(body.mode) as ExecutionMode;
  const workflowTarget = safeString(body.workflowTarget);
  const objective = safeString(body.objective);
  const context = safeString(body.context);
  const dataBoundaryAcknowledged = body.dataBoundaryAcknowledged === true;
  const fullPayloadText = JSON.stringify(body);

  if (!taskExecutionEngine.some((template) => template.slug === taskType)) {
    errors.push("taskType must match a supported AgentOS task template.");
  }

  if (!["synthetic-pilot", "enterprise-assessment", "production-request"].includes(mode)) {
    errors.push("mode must be synthetic-pilot, enterprise-assessment, or production-request.");
  }

  if (workflowTarget.length < 3) {
    errors.push("workflowTarget is required.");
  }

  if (objective.length < 12) {
    errors.push("objective must describe the operational goal.");
  }

  if (!dataBoundaryAcknowledged) {
    errors.push("dataBoundaryAcknowledged must be true.");
  }

  if (hasRestrictedHealthData(fullPayloadText)) {
    errors.push("Payload appears to include restricted health data or patient-level identifiers.");
  }

  return {
    valid: errors.length === 0,
    errors,
    submission: {
      taskType,
      organizationId: safeString(body.organizationId),
      requestedByRole: safeString(body.requestedByRole),
      mode,
      workflowTarget,
      objective,
      dataBoundaryAcknowledged,
      humanApprovalRequired: body.humanApprovalRequired !== false,
      context
    } satisfies AgentOSTaskRequest
  };
}

export function buildAgentOSTaskPlan(request: AgentOSTaskRequest): AgentOSTaskPlan {
  const template =
    taskExecutionEngine.find((candidate) => candidate.slug === request.taskType) ?? taskExecutionEngine[0];
  const productionRequested = request.mode === "production-request";
  const now = new Date().toISOString();

  return {
    taskId: `SCRIMED-AGENTOS-${now.replace(/[-:.TZ]/g, "").slice(0, 14)}`,
    status: productionRequested ? "denied-production-request" : "synthetic-plan-created",
    mode: request.mode,
    template,
    plannerAgent: "Planner Agent",
    routerAgent: "Router Agent",
    specialistAgents: template.specialistAgents,
    memoryLayers: memoryFabric.map((layer) => layer.name),
    approvalCheckpoints: template.humanApprovals,
    trustQaChecks: template.trustChecks,
    auditEvents: [
      "task request received",
      "boundary evaluated",
      "planner graph created",
      "router assignment drafted",
      productionRequested ? "production request denied" : "synthetic task plan created"
    ],
    deniedCapabilities: [
      ...template.deniedCapabilities,
      "autonomous diagnosis",
      "autonomous treatment",
      "live patient outreach"
    ],
    boundary: productionRequested
      ? "Production execution is denied in AgentOS v1 until tenant identity, live connector, durable audit, privacy, BAA, and human operating controls are approved."
      : agentOSBoundary,
    createdAt: now
  };
}

export function getAgentOSSummary() {
  const foundationAgents = agentOSControlPlane.filter((agent) => agent.status === "foundation-online").length;
  const syntheticReadyAgents = agentOSControlPlane.filter((agent) => agent.status === "synthetic-runtime-ready").length;
  const interoperabilityConformance = getInteroperabilityConformanceEvaluationSummary();

  return {
    service: "scrimed-agentos-v1",
    route: "/agents",
    apiRoute: "/api/agent-os",
    taskApiRoute: "/api/agent-os/tasks",
    status: "synthetic-agent-platform-ready",
    boundary: agentOSBoundary,
    controlPlane: agentOSControlPlane,
    foundationAgents,
    syntheticReadyAgents,
    specialistServices: specialistServiceRegistry,
    specialistAgentRegistry: agentWorkflows,
    workflowExecutionRegistry: workflowExecutions,
    memoryFabric,
    trustQaVerificationLayer,
    humanApprovalCheckpoints,
    auditChannels,
    mcpConnectorFramework,
    rbacPermissions,
    sandboxRuntimes,
    taskExecutionEngine,
    observabilitySignals,
    hipaaReadyArchitectureControls,
    interoperabilityConformance,
    exposedRoutes: ["/agents", "/evaluation", "/workflows", "/memory", "/audit", "/trust", "/trust-os", "/observability", "/interoperability", "/interoperability/evaluations"],
    updated: "2026-06-09"
  };
}
