import { getAgentOSSummary } from "./agentOS";
import { getAtlasIntelligenceCoreSummary } from "./atlasIntelligenceCore";
import {
  getProtectedPilotWorkspaceSummary,
  previewPilotWorkspace,
  type PilotWorkspaceRecord
} from "./protectedPilotWorkspace";
import { getTrustOSSummary } from "./trustOS";

export type PersistentWorkspaceStatus =
  | "v1-ready"
  | "active-control"
  | "quality-process-replacement"
  | "external-approval-required"
  | "production-gated";

export type AgentWorkOrderState =
  | "drafted"
  | "planned"
  | "routed"
  | "sandboxed"
  | "trustqa-held"
  | "human-review"
  | "proof-ready"
  | "blocked"
  | "closed";

export type AgentWorkOrderType =
  | "rcm-denial-appeal-generation"
  | "clinical-trial-matching"
  | "pre-visit-chart-review"
  | "post-visit-care-plan-drafting"
  | "investor-outreach-tracking"
  | "security-scan"
  | "data-transformation-job";

export type WorkspaceCapability = {
  capability: string;
  status: PersistentWorkspaceStatus;
  implementation: string;
  proofRoute: string;
  productionGate: string;
};

export type WorkOrderTemplate = {
  type: AgentWorkOrderType;
  name: string;
  status: PersistentWorkspaceStatus;
  buyer: string;
  agentOwner: string;
  objective: string;
  stateMachine: AgentWorkOrderState[];
  memoryScopes: string[];
  toolScopes: string[];
  modelRouterPolicy: string;
  trustCardRequirement: string;
  reviewerCheckpoints: string[];
  auditEvents: string[];
  resumableState: string;
  deliverable: string;
  blockedActions: string[];
};

export type ModelRouterWorkspaceDecision = {
  workOrderType: AgentWorkOrderType;
  defaultProviderClass: string;
  fallbackProviderClass: string;
  phiSensitivity: "synthetic-only" | "metadata-only" | "phi-blocked";
  routingCriteria: string[];
  denialCondition: string;
};

export type WorkspaceAuditTimelineEvent = {
  event: string;
  status: PersistentWorkspaceStatus;
  actor: string;
  retainedEvidence: string;
};

export type WorkspaceReviewerCheckpoint = {
  checkpoint: string;
  requiredFor: string;
  reviewerRole: string;
  approvalEffect: string;
  denialEffect: string;
};

export type WorkspaceApiContract = {
  method: "GET" | "POST" | "PATCH" | "GET / POST" | "GET / PATCH" | "future";
  route: string;
  status: PersistentWorkspaceStatus;
  access: string;
  purpose: string;
};

export type LimitationResolution = {
  limitation: string;
  impact: string;
  resolutionStatus: PersistentWorkspaceStatus;
  replacementProcess: string;
  proofRoute: string;
  remainingGate: string;
};

export type AgentWorkspaceWorkOrderEventType =
  | "work-order-created"
  | "state-transitioned"
  | "reviewer-assigned"
  | "reviewer-disposition-recorded"
  | "retry-recorded"
  | "work-order-blocked"
  | "work-order-closed"
  | "proof-packet-downloaded";

export type AgentWorkspaceWorkOrderInput = {
  workOrderType: AgentWorkOrderType;
  objective: string;
  agentOwner: string;
  modelRouterPolicy: string;
  memoryScopes: string[];
  toolScopes: string[];
  reviewerCheckpoints: string[];
  blockedActions: string[];
  trustCard: Record<string, unknown>;
  pilotSessionId: string | null;
  trustOSDecisionId: string | null;
};

export type AgentWorkspaceWorkOrderTransitionInput = {
  nextState: AgentWorkOrderState;
  eventType: AgentWorkspaceWorkOrderEventType;
  eventMetadata: Record<string, unknown>;
  resultSummary: string;
  outcomeMetrics: Record<string, unknown>;
  failureReason: string;
  assignedReviewerId: string | null;
};

export type AgentWorkspaceWorkOrderRecord = {
  id: string;
  tenantId: string;
  workspaceId: string;
  pilotSessionId: string | null;
  trustOSDecisionId: string | null;
  workOrderType: AgentWorkOrderType;
  state: AgentWorkOrderState;
  objective: string;
  agentOwner: string;
  modelRouterPolicy: string;
  trustCard: Record<string, unknown>;
  memoryScopes: string[];
  toolScopes: string[];
  reviewerCheckpoints: string[];
  blockedActions: string[];
  resultSummary: string;
  outcomeMetrics: Record<string, unknown>;
  failureReason: string;
  retryCount: number;
  assignedReviewerId: string | null;
  createdBy: string;
  updatedBy: string;
  reviewedBy: string | null;
  closedBy: string | null;
  createdAt: string;
  updatedAt: string;
  reviewDueAt: string | null;
  reviewedAt: string | null;
  closedAt: string | null;
  boundary: string;
};

export type AgentWorkspaceWorkOrderEventRecord = {
  id: string;
  workspaceId: string;
  workOrderId: string;
  actorUserId: string;
  eventType: AgentWorkspaceWorkOrderEventType;
  priorState: AgentWorkOrderState | null;
  nextState: AgentWorkOrderState;
  eventMetadata: Record<string, unknown>;
  createdAt: string;
};

export type AgentWorkspaceGovernanceStatus =
  | "active"
  | "needs-review"
  | "blocked"
  | "proof-ready"
  | "closed";

export type AgentWorkspaceWorkOrderFilters = {
  state?: AgentWorkOrderState;
  workOrderType?: AgentWorkOrderType;
  assignedReviewerId?: string;
  minRetryCount?: number;
  governanceStatus?: AgentWorkspaceGovernanceStatus;
};

export type AgentWorkspaceWorkOrderDashboard = {
  totalWorkOrders: number;
  visibleWorkOrders: number;
  filteredOutWorkOrders: number;
  byState: Record<AgentWorkOrderState, number>;
  visibleByState: Record<AgentWorkOrderState, number>;
  byWorkOrderType: Record<AgentWorkOrderType, number>;
  visibleByWorkOrderType: Record<AgentWorkOrderType, number>;
  governance: Record<AgentWorkspaceGovernanceStatus, number>;
  visibleGovernance: Record<AgentWorkspaceGovernanceStatus, number>;
  reviewerQueue: {
    assigned: number;
    unassigned: number;
    reviewHeld: number;
  };
  retryQueue: {
    workOrdersWithRetries: number;
    maxRetryCount: number;
  };
  boundaryControls: string[];
};

export type AgentWorkspaceWorkOrderProofPacketInput = {
  workspace: PilotWorkspaceRecord;
  workOrder: AgentWorkspaceWorkOrderRecord;
  events: AgentWorkspaceWorkOrderEventRecord[];
  auditEventId: string;
  generatedAt: string;
  appBaseUrl: string;
};

type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; errors: string[] };

export const agentWorkOrderStates: AgentWorkOrderState[] = [
  "drafted",
  "planned",
  "routed",
  "sandboxed",
  "trustqa-held",
  "human-review",
  "proof-ready",
  "blocked",
  "closed"
];

export const agentWorkOrderEventTypes: AgentWorkspaceWorkOrderEventType[] = [
  "work-order-created",
  "state-transitioned",
  "reviewer-assigned",
  "reviewer-disposition-recorded",
  "retry-recorded",
  "work-order-blocked",
  "work-order-closed",
  "proof-packet-downloaded"
];

export const agentWorkspaceGovernanceStatuses: AgentWorkspaceGovernanceStatus[] = [
  "active",
  "needs-review",
  "blocked",
  "proof-ready",
  "closed"
];

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const persistentAgentWorkspaceBoundary =
  "Persistent Agent Workspace v1 coordinates tenant-scoped synthetic work orders, saved state contracts, Trust Cards, audit timelines, reviewer checkpoints, and proof packets. It does not authorize live PHI ingestion, autonomous clinical decisions, payer submission, patient outreach, medical-record mutation, or production connector execution.";

export const workspaceCapabilities: WorkspaceCapability[] = [
  {
    capability: "Tenant-scoped workspace context",
    status: "active-control",
    implementation:
      "Builds on protected pilot workspaces, Supabase Auth, tenant memberships, and Postgres row-level security.",
    proofRoute: "/pilot-workspace",
    productionGate:
      "Customer SSO, reviewer authority, purpose-of-use, consent, and deployment-specific access review before PHI."
  },
  {
    capability: "Saved work-order state",
    status: "active-control",
    implementation:
      "Adds dedicated RLS-backed work-order and event tables with RPC-only protected mutation contracts for create, resume, transition, retry, review, and close states.",
    proofRoute: "/api/agent-workspaces/{workspaceSlug}/work-orders",
    productionGate:
      "Database migration, RLS verification, authenticated tenant smoke test, retention policy, and advisor review are required per environment."
  },
  {
    capability: "Isolated agent execution",
    status: "v1-ready",
    implementation:
      "Every work order is bound to a sandbox, memory scopes, tool scopes, denied actions, and human checkpoints.",
    proofRoute: "/agents",
    productionGate:
      "Live tools require scoped credentials, connector approvals, timeout/retry policy, and emergency shutdown controls."
  },
  {
    capability: "Model-router policy decisions",
    status: "v1-ready",
    implementation:
      "Work orders carry task-aware provider class, fallback, PHI sensitivity, latency, cost, and denial conditions.",
    proofRoute: "/trust-os",
    productionGate:
      "Provider contracts, BAA/DPA posture, regional rules, telemetry, budget limits, and rollback tests."
  },
  {
    capability: "Human approval checkpoints",
    status: "active-control",
    implementation:
      "Reviewer roles and dispositions are explicit before outputs can move from synthetic proof to buyer-facing evidence.",
    proofRoute: "/pilot-workspace",
    productionGate:
      "Licensed clinical, RCM, research, legal, or security reviewer authority must be approved per workflow."
  },
  {
    capability: "Downloadable proof packets",
    status: "active-control",
    implementation:
      "Workspace proof packets combine work-order plan, Trust Cards, reviewer checkpoints, audit timeline, blocked actions, limitations register, and explicit legal/privacy/security/safety boundaries.",
    proofRoute: "/api/agent-workspaces/{workspaceSlug}/work-orders/{workOrderId}/proof-packet",
    productionGate:
      "Production packets need customer branding, legal disclaimers, evidence retention policy, confidentiality controls, and legal/privacy/security review."
  }
];

export const workOrderTemplates: WorkOrderTemplate[] = [
  {
    type: "rcm-denial-appeal-generation",
    name: "RCM denial appeal generation",
    status: "v1-ready",
    buyer: "Revenue cycle, payer operations, and finance leadership",
    agentOwner: "PayerIQ + RCM Agent",
    objective:
      "Draft a reviewable denial appeal outline from synthetic claim context, payer policy evidence, missing documentation, and reviewer disposition.",
    stateMachine: ["drafted", "planned", "routed", "sandboxed", "trustqa-held", "human-review", "proof-ready"],
    memoryScopes: ["session", "operational", "knowledge"],
    toolScopes: ["policy evidence retrieval", "claims metadata parser", "appeal outline generator"],
    modelRouterPolicy: "metadata-only payer workflow; deny if live claim identifiers, member IDs, or PHI appear.",
    trustCardRequirement: "Policy source, confidence, missing evidence, reviewer status, and no-reimbursement-guarantee boundary.",
    reviewerCheckpoints: ["Payer or RCM review", "Governance review"],
    auditEvents: ["work order drafted", "policy evidence attached", "appeal outline generated", "review requested"],
    resumableState: "Resume from missing-evidence review, appeal-draft revision, or governance disposition.",
    deliverable: "Appeal draft outline, policy rationale, missing-evidence list, and proof packet.",
    blockedActions: ["final coding", "payer submission", "reimbursement guarantee", "coverage determination"]
  },
  {
    type: "clinical-trial-matching",
    name: "Clinical trial matching",
    status: "v1-ready",
    buyer: "Research operations, oncology programs, academic medical centers, and trial networks",
    agentOwner: "TrialCore",
    objective:
      "Create a reviewable eligibility work order with criteria trace, exclusion flags, missing evidence, and research-review queue.",
    stateMachine: ["drafted", "planned", "routed", "sandboxed", "trustqa-held", "human-review", "proof-ready"],
    memoryScopes: ["session", "knowledge"],
    toolScopes: ["criteria parser", "trial evidence registry", "eligibility gap detector"],
    modelRouterPolicy: "synthetic research workflow; deny patient outreach, enrollment claims, or treatment recommendation.",
    trustCardRequirement: "Trial source, eligibility criteria version, confidence, uncertainty, and research reviewer state.",
    reviewerCheckpoints: ["Research review", "Clinical review", "Governance review"],
    auditEvents: ["work order drafted", "criteria mapped", "evidence gaps attached", "research review requested"],
    resumableState: "Resume from missing criteria, exclusion review, or research disposition.",
    deliverable: "Eligibility trace, missing-evidence list, exclusion flags, and research proof packet.",
    blockedActions: ["patient outreach", "enrollment recommendation", "treatment recommendation", "live record ingestion"]
  },
  {
    type: "pre-visit-chart-review",
    name: "Pre-visit chart review",
    status: "production-gated",
    buyer: "Clinics, physician groups, care teams, and clinical operations",
    agentOwner: "Sanar AI + CareExplain",
    objective:
      "Prepare a synthetic chart-review work order with risk signals, missing data, agenda prompts, and clinician review boundary.",
    stateMachine: ["drafted", "planned", "routed", "sandboxed", "trustqa-held", "human-review", "proof-ready"],
    memoryScopes: ["session", "operational", "knowledge"],
    toolScopes: ["FHIR context mapper", "missing-data detector", "agenda prompt generator"],
    modelRouterPolicy: "PHI-blocked until BAA, consent, FHIR profile validation, and clinician governance are approved.",
    trustCardRequirement: "Source trace, confidence, missing context, guideline/source version, and clinician reviewer status.",
    reviewerCheckpoints: ["Clinical review", "Governance review"],
    auditEvents: ["work order drafted", "context mapped", "risk prompt held", "clinician review requested"],
    resumableState: "Resume from missing-data review, clinician clarification, or agenda revision.",
    deliverable: "Pre-visit review brief, missing-data prompts, and clinician-held Trust Card.",
    blockedActions: ["diagnosis", "treatment recommendation", "patient instruction", "medical-record mutation"]
  },
  {
    type: "post-visit-care-plan-drafting",
    name: "Post-visit care plan drafting",
    status: "production-gated",
    buyer: "Clinical teams, care coordination, and patient access operations",
    agentOwner: "CareExplain + Perfect Chart",
    objective:
      "Draft review-only follow-up and care-plan support from synthetic context while preserving clinician authorship.",
    stateMachine: ["drafted", "planned", "routed", "sandboxed", "trustqa-held", "human-review", "proof-ready"],
    memoryScopes: ["session", "operational"],
    toolScopes: ["care-plan outline generator", "follow-up task planner", "patient education draft support"],
    modelRouterPolicy: "PHI-blocked and clinician-held; deny autonomous patient instruction or order entry.",
    trustCardRequirement: "Clinician reviewer status, source trace, uncertainty, patient-facing boundary, and blocked actions.",
    reviewerCheckpoints: ["Clinical review", "Governance review"],
    auditEvents: ["care-plan draft opened", "education draft held", "follow-up tasks staged", "clinical review requested"],
    resumableState: "Resume from clinician revision, task clarification, or education review.",
    deliverable: "Draft care-plan support packet, follow-up queue outline, and reviewer checklist.",
    blockedActions: ["order entry", "patient outreach", "final care plan", "clinical advice without clinician review"]
  },
  {
    type: "investor-outreach-tracking",
    name: "Investor outreach tracking",
    status: "v1-ready",
    buyer: "Founder, executive leadership, investor relations, and strategic partnerships",
    agentOwner: "Investor Agent",
    objective:
      "Track investor outreach tasks, diligence artifacts, follow-up state, proof surfaces, and non-confidential messaging boundaries.",
    stateMachine: ["drafted", "planned", "routed", "sandboxed", "human-review", "proof-ready"],
    memoryScopes: ["session", "operational"],
    toolScopes: ["diligence brief builder", "follow-up tracker", "proof-route selector"],
    modelRouterPolicy: "business-contact and non-confidential company context only; deny PHI, secrets, and unsupported claims.",
    trustCardRequirement: "Claims register status, proof route, update timestamp, and reviewer status.",
    reviewerCheckpoints: ["Executive sponsor review", "Governance review"],
    auditEvents: ["outreach work order drafted", "claims checked", "proof routes attached", "follow-up state recorded"],
    resumableState: "Resume from next follow-up, diligence question, or proof packet export.",
    deliverable: "Investor follow-up tracker, diligence brief, claims-safe messaging packet.",
    blockedActions: ["financial misrepresentation", "unsupported medical claims", "PHI disclosure", "confidential buyer disclosure"]
  },
  {
    type: "security-scan",
    name: "Security scan",
    status: "quality-process-replacement",
    buyer: "Security, engineering, enterprise diligence, and compliance reviewers",
    agentOwner: "Governance Agent + Watchtower",
    objective:
      "Create a repeatable security-review work order that tracks headers, dependency posture, route boundaries, logs, and evidence gaps.",
    stateMachine: ["drafted", "planned", "routed", "sandboxed", "trustqa-held", "human-review", "proof-ready"],
    memoryScopes: ["operational", "knowledge"],
    toolScopes: ["quality gate runner", "runtime log review", "security-header inspector"],
    modelRouterPolicy: "no secrets in prompts; deny credential handling and production access tokens.",
    trustCardRequirement: "Evidence route, scan timestamp, severity, reviewer status, and remediation boundary.",
    reviewerCheckpoints: ["Security review", "Governance review"],
    auditEvents: ["scan work order opened", "quality gates run", "runtime logs reviewed", "security review requested"],
    resumableState: "Resume from failing gate, mitigation task, external assessor review, or verification pass.",
    deliverable: "Security evidence packet, blocker register, remediation queue, and verification timeline.",
    blockedActions: ["secrets capture", "credential rotation without owner", "claiming SOC 2/HIPAA certification", "destructive remediation"]
  },
  {
    type: "data-transformation-job",
    name: "Data transformation job",
    status: "production-gated",
    buyer: "Interoperability, analytics, implementation, and data platform teams",
    agentOwner: "Interoperability Agent + DocuTwin",
    objective:
      "Plan synthetic transformations across forms, tables, referrals, claims, FHIR resources, HL7 messages, and evidence packets.",
    stateMachine: ["drafted", "planned", "routed", "sandboxed", "trustqa-held", "human-review", "proof-ready"],
    memoryScopes: ["session", "operational", "knowledge"],
    toolScopes: ["schema mapper", "FHIR/HL7 validator", "fixture diff checker"],
    modelRouterPolicy: "synthetic fixture transformation only; deny production data movement without connector and privacy approval.",
    trustCardRequirement: "Source schema, target schema, validation status, fixture fingerprint, and reviewer status.",
    reviewerCheckpoints: ["Integration architect review", "Privacy review", "Governance review"],
    auditEvents: ["transformation work order drafted", "schema mapped", "fixture validated", "review requested"],
    resumableState: "Resume from schema gap, fixture diff, terminology mapping, or integration review.",
    deliverable: "Transformation map, fixture validation packet, schema gap list, and connector-readiness proof.",
    blockedActions: ["production data movement", "PHI export", "record mutation", "connector certification claim"]
  }
];

export const modelRouterWorkspaceDecisions: ModelRouterWorkspaceDecision[] = workOrderTemplates.map(
  (workOrder) => ({
    workOrderType: workOrder.type,
    defaultProviderClass:
      workOrder.status === "production-gated" ? "approved-healthcare-model-required" : "general-reasoning-model",
    fallbackProviderClass: "deny-or-human-review-queue",
    phiSensitivity: workOrder.status === "production-gated" ? "phi-blocked" : "synthetic-only",
    routingCriteria: [
      "task type",
      "workflow risk",
      "evidence requirements",
      "latency target",
      "cost budget",
      "context length",
      "provider availability",
      "PHI sensitivity"
    ],
    denialCondition: workOrder.modelRouterPolicy
  })
);

export const workspaceAuditTimeline: WorkspaceAuditTimelineEvent[] = [
  {
    event: "work-order-created",
    status: "v1-ready",
    actor: "Planner Agent",
    retainedEvidence: "work-order type, tenant workspace, objective, state, owner agent, denied actions"
  },
  {
    event: "agent-route-selected",
    status: "v1-ready",
    actor: "Router Agent",
    retainedEvidence: "agent owner, tool scopes, memory scopes, model-router decision, fallback policy"
  },
  {
    event: "trustqa-verification-held",
    status: "active-control",
    actor: "TrustQA",
    retainedEvidence: "Trust Card requirement, source attribution, confidence, uncertainty, safety boundary"
  },
  {
    event: "human-review-requested",
    status: "active-control",
    actor: "Governance Agent",
    retainedEvidence: "checkpoint, reviewer role, disposition options, escalation state"
  },
  {
    event: "proof-packet-exported",
    status: "active-control",
    actor: "Tenant reviewer",
    retainedEvidence: "synthetic-only proof packet, audit timeline, blocked actions, limitation-resolution register"
  }
];

export const workspaceReviewerCheckpoints: WorkspaceReviewerCheckpoint[] = [
  {
    checkpoint: "Clinical review",
    requiredFor: "Any chart, care-plan, documentation, risk, education, or patient-facing draft.",
    reviewerRole: "Licensed clinician or approved delegated clinical reviewer",
    approvalEffect: "Allows synthetic proof packet release or customer-reviewed draft progression.",
    denialEffect: "Keeps the work order held and records evidence gap, unsafe claim, or review reason."
  },
  {
    checkpoint: "Payer or RCM review",
    requiredFor: "Prior authorization, claims, denial appeal, coding, and reimbursement-adjacent work.",
    reviewerRole: "Qualified RCM, payer operations, or coding reviewer",
    approvalEffect: "Allows review-only packet progression without payer submission.",
    denialEffect: "Blocks submission-like actions and records missing policy or documentation evidence."
  },
  {
    checkpoint: "Research review",
    requiredFor: "Trial matching, protocol screening, cohort review, and research operations.",
    reviewerRole: "Research operations reviewer, investigator delegate, or clinical research lead",
    approvalEffect: "Allows eligibility evidence packet release for research review.",
    denialEffect: "Blocks outreach, enrollment language, and unsupported eligibility claims."
  },
  {
    checkpoint: "Security and privacy review",
    requiredFor: "Workspace persistence, data transformation, model routing, connector use, and protected data handling.",
    reviewerRole: "Security, privacy, legal, or compliance owner",
    approvalEffect: "Allows the next gated pilot step within approved data boundary.",
    denialEffect: "Blocks production data movement and records remediation tasks."
  },
  {
    checkpoint: "Executive sponsor review",
    requiredFor: "Commercial, investor, partnership, or enterprise expansion decisions.",
    reviewerRole: "Founder, executive sponsor, or authorized business owner",
    approvalEffect: "Allows business-facing packet release with controlled claims.",
    denialEffect: "Blocks public or buyer-facing release until claims and scope are corrected."
  }
];

export const workspaceApiContracts: WorkspaceApiContract[] = [
  {
    method: "GET",
    route: "/agent-workspace",
    status: "v1-ready",
    access: "Public product evidence surface",
    purpose: "Inspect Persistent Agent Workspace v1 work orders, state machine, limitations resolution, and proof routes."
  },
  {
    method: "GET",
    route: "/api/agent-workspace",
    status: "v1-ready",
    access: "Public synthetic product API",
    purpose: "Return the typed workspace summary for investor, buyer, and internal product diligence."
  },
  {
    method: "GET",
    route: "/api/agent-workspace/brief",
    status: "v1-ready",
    access: "Public synthetic product API",
    purpose: "Download the workspace architecture and limitation-resolution brief."
  },
  {
    method: "GET",
    route: "/api/agent-workspace/proof-packet",
    status: "v1-ready",
    access: "Public synthetic product API",
    purpose: "Download a preview proof packet for a deterministic synthetic Persistent Agent Workspace."
  },
  {
    method: "GET / POST",
    route: "/api/pilot-workspaces/{workspaceSlug}/sessions",
    status: "active-control",
    access: "AAL2 bearer token + authorized tenant role + rate limit",
    purpose: "Persist synthetic evaluation sessions that can anchor workspace work-order evidence."
  },
  {
    method: "GET / POST",
    route: "/api/pilot-workspaces/{workspaceSlug}/trustos-decisions",
    status: "active-control",
    access: "AAL2 bearer token + authorized tenant role + rate limit",
    purpose: "Commit TrustOS decisions and model-route governance evidence to the tenant ledger."
  },
  {
    method: "GET / POST",
    route: "/api/agent-workspaces/{workspaceSlug}/work-orders",
    status: "active-control",
    access: "GET: bearer token + workspace membership. POST: AAL2 bearer token + authorized tenant role + rate limit.",
    purpose:
      "List, filter, summarize, and create persistent synthetic work orders through dedicated RLS-backed tables and RPC-only mutations."
  },
  {
    method: "GET / PATCH",
    route: "/api/agent-workspaces/{workspaceSlug}/work-orders/{workOrderId}",
    status: "active-control",
    access: "GET: bearer token + workspace membership. PATCH: AAL2 bearer token + authorized tenant role + rate limit.",
    purpose:
      "Inspect a work order with its event trail or transition state for review, retry, assignment, proof readiness, blocking, or closure."
  },
  {
    method: "GET",
    route: "/api/agent-workspaces/{workspaceSlug}/work-orders/{workOrderId}/proof-packet",
    status: "active-control",
    access: "AAL2 bearer token + authorized tenant role + rate limit + append-only audit event before release.",
    purpose:
      "Download an audited Markdown proof packet for one persistent synthetic work order with Trust Card, event trail, reviewer checkpoints, blocked actions, and safety boundaries."
  }
];

export const limitationResolutionRegister: LimitationResolution[] = [
  {
    limitation: "Live PHI ingestion is not enabled.",
    impact: "SCRIMED cannot yet process real patient records inside production workflows.",
    resolutionStatus: "quality-process-replacement",
    replacementProcess:
      "Use synthetic fixtures, no-PHI buyer intake, protected pilot sessions, TrustOS decisions, and metadata-only evidence packets.",
    proofRoute: "/pilot-evidence",
    remainingGate: "BAA/DPA, privacy notice, consent, retention, security review, and customer authorization."
  },
  {
    limitation: "Autonomous clinical decisions remain prohibited.",
    impact: "SCRIMED cannot diagnose, treat, instruct patients, or replace clinician judgment.",
    resolutionStatus: "active-control",
    replacementProcess:
      "Every clinical-adjacent work order is held behind TrustQA, Clinical Guardian, reviewer checkpoints, blocked actions, and proof packet boundaries.",
    proofRoute: "/trust-os",
    remainingGate: "Licensed clinician validation and regulatory intended-use review before clinical decision-support claims."
  },
  {
    limitation: "Clinical correctness and safety scores are not externally validated.",
    impact: "Validation fields cannot be marketed as clinical-performance claims.",
    resolutionStatus: "external-approval-required",
    replacementProcess:
      "Expose completeness, source attribution, evidence trail, confidence, reviewer status, and audit fields while marking clinical scoring as clinician-validation required.",
    proofRoute: "/healthcare-intelligence-os",
    remainingGate: "Clinician rubric, validation study, data-quality review, and governance sign-off."
  },
  {
    limitation: "Dedicated long-running work-order persistence requires per-environment migration verification.",
    impact: "Work-order creation and resume must fail closed until each deployment has the dedicated RLS tables, RPCs, and grants applied.",
    resolutionStatus: "active-control",
    replacementProcess:
      "Use dedicated agent workspace work-order tables, append-only work-order events, explicit authenticated grants, and RPC-only mutations with route-level AAL2 and rate-limit checks.",
    proofRoute: "/api/agent-workspaces/{workspaceSlug}/work-orders",
    remainingGate: "Apply migration, verify RLS with an authenticated tenant, run database advisors, and approve retention/legal-hold policy."
  },
  {
    limitation: "Production model routing across vendors is not active.",
    impact: "SCRIMED should not route PHI or regulated tasks to unapproved providers.",
    resolutionStatus: "quality-process-replacement",
    replacementProcess:
      "Attach provider-class, fallback, PHI sensitivity, denial conditions, and human escalation to every work-order template.",
    proofRoute: "/agent-workspace",
    remainingGate: "Vendor contracts, BAA/DPA path, regional rules, telemetry, cost limits, and rollback tests."
  },
  {
    limitation: "Live EHR, payer, imaging, and device connectors remain blocked.",
    impact: "SCRIMED cannot mutate production records, submit payer transactions, or ingest live images/devices.",
    resolutionStatus: "active-control",
    replacementProcess:
      "Use interoperability standards registry, synthetic conformance kits, fixture validation, and connector-readiness gates.",
    proofRoute: "/interoperability/evaluations",
    remainingGate: "Customer connector approval, security review, consent, audit, monitoring, and partner acceptance."
  },
  {
    limitation: "Sovereign deployment is not implemented.",
    impact: "Some hospitals, governments, and regions may require private, on-prem, or sovereign deployments before live data.",
    resolutionStatus: "external-approval-required",
    replacementProcess:
      "Define managed cloud, private cloud, hospital-controlled, government/sovereign, and edge/on-prem profiles with required controls.",
    proofRoute: "/healthcare-intelligence-os",
    remainingGate: "Customer architecture review, regional compliance mapping, private networking, and local audit design."
  },
  {
    limitation: "Legal, HIPAA, SOC 2, regulatory, and reimbursement claims require external review.",
    impact: "SCRIMED cannot truthfully claim certification, clearance, compliance, reimbursement, or production readiness without evidence.",
    resolutionStatus: "external-approval-required",
    replacementProcess:
      "Keep claims register, Trust Center, diligence brief, prohibited-claims controls, and buyer-facing boundary language active.",
    proofRoute: "/trust-center",
    remainingGate: "Qualified counsel, security assessor, privacy owner, regulatory reviewer, and payer/reimbursement expert review."
  }
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function optionalString(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function optionalUuid(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return typeof value === "string" && uuidPattern.test(value) ? value : "__invalid_uuid__";
}

function stringArray(value: unknown, fallback: string[]) {
  if (value === undefined || value === null) {
    return fallback;
  }

  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || !item.trim())) {
    return ["__invalid_array__"];
  }

  return value.map((item) => item.trim()).slice(0, 24);
}

export function isAgentWorkOrderType(value: unknown): value is AgentWorkOrderType {
  return typeof value === "string" && workOrderTemplates.some((template) => template.type === value);
}

export function isAgentWorkOrderState(value: unknown): value is AgentWorkOrderState {
  return typeof value === "string" && agentWorkOrderStates.includes(value as AgentWorkOrderState);
}

export function isAgentWorkOrderEventType(value: unknown): value is AgentWorkspaceWorkOrderEventType {
  return typeof value === "string" && agentWorkOrderEventTypes.includes(value as AgentWorkspaceWorkOrderEventType);
}

export function isAgentWorkspaceGovernanceStatus(value: unknown): value is AgentWorkspaceGovernanceStatus {
  return (
    typeof value === "string" &&
    agentWorkspaceGovernanceStatuses.includes(value as AgentWorkspaceGovernanceStatus)
  );
}

export function getWorkOrderTemplate(workOrderType: AgentWorkOrderType) {
  return workOrderTemplates.find((template) => template.type === workOrderType) ?? workOrderTemplates[0];
}

export function getAgentWorkspaceGovernanceStatus(
  workOrder: AgentWorkspaceWorkOrderRecord
): AgentWorkspaceGovernanceStatus {
  if (workOrder.state === "blocked") {
    return "blocked";
  }

  if (workOrder.state === "proof-ready") {
    return "proof-ready";
  }

  if (workOrder.state === "closed") {
    return "closed";
  }

  if (workOrder.state === "trustqa-held" || workOrder.state === "human-review") {
    return "needs-review";
  }

  return "active";
}

export function parseAgentWorkspaceWorkOrderFilters(
  searchParams: URLSearchParams
): ValidationResult<AgentWorkspaceWorkOrderFilters> {
  const errors: string[] = [];
  const filters: AgentWorkspaceWorkOrderFilters = {};
  const state = searchParams.get("state");
  const workOrderType = searchParams.get("workOrderType") ?? searchParams.get("type");
  const assignedReviewerId = searchParams.get("assignedReviewerId") ?? searchParams.get("reviewerId");
  const minRetryCount = searchParams.get("minRetryCount");
  const governanceStatus = searchParams.get("governanceStatus");

  if (state) {
    if (isAgentWorkOrderState(state)) {
      filters.state = state;
    } else {
      errors.push("state must match a supported work-order state");
    }
  }

  if (workOrderType) {
    if (isAgentWorkOrderType(workOrderType)) {
      filters.workOrderType = workOrderType;
    } else {
      errors.push("workOrderType must match a supported work-order template");
    }
  }

  if (assignedReviewerId) {
    if (assignedReviewerId === "unassigned" || uuidPattern.test(assignedReviewerId)) {
      filters.assignedReviewerId = assignedReviewerId;
    } else {
      errors.push("assignedReviewerId must be a valid UUID or unassigned");
    }
  }

  if (minRetryCount) {
    const parsed = Number.parseInt(minRetryCount, 10);

    if (!/^\d+$/.test(minRetryCount) || parsed < 0 || parsed > 10) {
      errors.push("minRetryCount must be an integer between 0 and 10");
    } else {
      filters.minRetryCount = parsed;
    }
  }

  if (governanceStatus) {
    if (isAgentWorkspaceGovernanceStatus(governanceStatus)) {
      filters.governanceStatus = governanceStatus;
    } else {
      errors.push("governanceStatus must match active, needs-review, blocked, proof-ready, or closed");
    }
  }

  return errors.length > 0 ? { ok: false, errors } : { ok: true, value: filters };
}

export function filterAgentWorkspaceWorkOrders(
  workOrders: AgentWorkspaceWorkOrderRecord[],
  filters: AgentWorkspaceWorkOrderFilters
) {
  return workOrders.filter((workOrder) => {
    if (filters.state && workOrder.state !== filters.state) {
      return false;
    }

    if (filters.workOrderType && workOrder.workOrderType !== filters.workOrderType) {
      return false;
    }

    if (filters.assignedReviewerId) {
      if (filters.assignedReviewerId === "unassigned" && workOrder.assignedReviewerId) {
        return false;
      }

      if (filters.assignedReviewerId !== "unassigned" && workOrder.assignedReviewerId !== filters.assignedReviewerId) {
        return false;
      }
    }

    if (filters.minRetryCount !== undefined && workOrder.retryCount < filters.minRetryCount) {
      return false;
    }

    if (
      filters.governanceStatus &&
      getAgentWorkspaceGovernanceStatus(workOrder) !== filters.governanceStatus
    ) {
      return false;
    }

    return true;
  });
}

function emptyStateCounts() {
  return Object.fromEntries(agentWorkOrderStates.map((state) => [state, 0])) as Record<
    AgentWorkOrderState,
    number
  >;
}

function emptyTypeCounts() {
  return Object.fromEntries(workOrderTemplates.map((template) => [template.type, 0])) as Record<
    AgentWorkOrderType,
    number
  >;
}

function emptyGovernanceCounts() {
  return Object.fromEntries(agentWorkspaceGovernanceStatuses.map((status) => [status, 0])) as Record<
    AgentWorkspaceGovernanceStatus,
    number
  >;
}

function countWorkOrders(workOrders: AgentWorkspaceWorkOrderRecord[]) {
  const byState = emptyStateCounts();
  const byWorkOrderType = emptyTypeCounts();
  const governance = emptyGovernanceCounts();

  for (const workOrder of workOrders) {
    byState[workOrder.state] += 1;
    byWorkOrderType[workOrder.workOrderType] += 1;
    governance[getAgentWorkspaceGovernanceStatus(workOrder)] += 1;
  }

  return { byState, byWorkOrderType, governance };
}

export function summarizeAgentWorkspaceWorkOrderDashboard(
  allWorkOrders: AgentWorkspaceWorkOrderRecord[],
  visibleWorkOrders: AgentWorkspaceWorkOrderRecord[] = allWorkOrders
): AgentWorkspaceWorkOrderDashboard {
  const allCounts = countWorkOrders(allWorkOrders);
  const visibleCounts = countWorkOrders(visibleWorkOrders);

  return {
    totalWorkOrders: allWorkOrders.length,
    visibleWorkOrders: visibleWorkOrders.length,
    filteredOutWorkOrders: allWorkOrders.length - visibleWorkOrders.length,
    byState: allCounts.byState,
    visibleByState: visibleCounts.byState,
    byWorkOrderType: allCounts.byWorkOrderType,
    visibleByWorkOrderType: visibleCounts.byWorkOrderType,
    governance: allCounts.governance,
    visibleGovernance: visibleCounts.governance,
    reviewerQueue: {
      assigned: visibleWorkOrders.filter((workOrder) => Boolean(workOrder.assignedReviewerId)).length,
      unassigned: visibleWorkOrders.filter((workOrder) => !workOrder.assignedReviewerId).length,
      reviewHeld: visibleWorkOrders.filter(
        (workOrder) => getAgentWorkspaceGovernanceStatus(workOrder) === "needs-review"
      ).length
    },
    retryQueue: {
      workOrdersWithRetries: visibleWorkOrders.filter((workOrder) => workOrder.retryCount > 0).length,
      maxRetryCount: visibleWorkOrders.reduce(
        (maxRetryCount, workOrder) => Math.max(maxRetryCount, workOrder.retryCount),
        0
      )
    },
    boundaryControls: [
      "Synthetic and metadata-only work orders",
      "No live PHI ingestion",
      "No autonomous diagnosis, treatment, payer submission, patient outreach, or record mutation",
      "Human review required before buyer-facing release",
      "AAL2 governance required for protected mutations and proof-packet downloads"
    ]
  };
}

function defaultTrustCard(template: WorkOrderTemplate) {
  return {
    requirement: template.trustCardRequirement,
    validationStatus: "human-review-required",
    sourceAttribution: "SCRIMED governed synthetic work-order template",
    confidence: "not-clinically-validated",
    updated: "2026-06-14",
    syntheticOnly: true
  };
}

export function validateAgentWorkspaceWorkOrderPayload(
  payload: unknown
): ValidationResult<AgentWorkspaceWorkOrderInput> {
  const errors: string[] = [];

  if (!isRecord(payload)) {
    return { ok: false, errors: ["payload must be a JSON object"] };
  }

  if (!isAgentWorkOrderType(payload.workOrderType)) {
    return { ok: false, errors: ["workOrderType must match a supported SCRIMED work-order template"] };
  }

  const template = getWorkOrderTemplate(payload.workOrderType);
  const objective = optionalString(payload.objective, template.objective);
  const agentOwner = optionalString(payload.agentOwner, template.agentOwner);
  const modelRouterPolicy = optionalString(payload.modelRouterPolicy, template.modelRouterPolicy);
  const memoryScopes = stringArray(payload.memoryScopes, template.memoryScopes);
  const toolScopes = stringArray(payload.toolScopes, template.toolScopes);
  const reviewerCheckpoints = stringArray(payload.reviewerCheckpoints, template.reviewerCheckpoints);
  const blockedActions = stringArray(payload.blockedActions, template.blockedActions);
  const pilotSessionId = optionalUuid(payload.pilotSessionId);
  const trustOSDecisionId = optionalUuid(payload.trustOSDecisionId);
  const trustCard = isRecord(payload.trustCard) ? payload.trustCard : defaultTrustCard(template);

  if (objective.length < 20 || objective.length > 2000) {
    errors.push("objective must be between 20 and 2000 characters");
  }

  if (agentOwner.length < 2 || agentOwner.length > 180) {
    errors.push("agentOwner must be between 2 and 180 characters");
  }

  if (modelRouterPolicy.length < 20 || modelRouterPolicy.length > 2000) {
    errors.push("modelRouterPolicy must be between 20 and 2000 characters");
  }

  if (memoryScopes.includes("__invalid_array__")) {
    errors.push("memoryScopes must be an array of non-empty strings");
  }

  if (toolScopes.includes("__invalid_array__")) {
    errors.push("toolScopes must be an array of non-empty strings");
  }

  if (reviewerCheckpoints.includes("__invalid_array__")) {
    errors.push("reviewerCheckpoints must be an array of non-empty strings");
  }

  if (blockedActions.includes("__invalid_array__")) {
    errors.push("blockedActions must be an array of non-empty strings");
  }

  if (pilotSessionId === "__invalid_uuid__") {
    errors.push("pilotSessionId must be a valid UUID when provided");
  }

  if (trustOSDecisionId === "__invalid_uuid__") {
    errors.push("trustOSDecisionId must be a valid UUID when provided");
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      workOrderType: template.type,
      objective,
      agentOwner,
      modelRouterPolicy,
      memoryScopes,
      toolScopes,
      reviewerCheckpoints,
      blockedActions,
      trustCard,
      pilotSessionId: pilotSessionId === "__invalid_uuid__" ? null : pilotSessionId,
      trustOSDecisionId: trustOSDecisionId === "__invalid_uuid__" ? null : trustOSDecisionId
    }
  };
}

function defaultEventTypeForState(state: AgentWorkOrderState): AgentWorkspaceWorkOrderEventType {
  if (state === "blocked") {
    return "work-order-blocked";
  }

  if (state === "closed") {
    return "work-order-closed";
  }

  if (state === "human-review") {
    return "reviewer-assigned";
  }

  if (state === "proof-ready") {
    return "reviewer-disposition-recorded";
  }

  return "state-transitioned";
}

export function validateAgentWorkspaceTransitionPayload(
  payload: unknown
): ValidationResult<AgentWorkspaceWorkOrderTransitionInput> {
  const errors: string[] = [];

  if (!isRecord(payload)) {
    return { ok: false, errors: ["payload must be a JSON object"] };
  }

  if (!isAgentWorkOrderState(payload.nextState)) {
    return { ok: false, errors: ["nextState must match a supported work-order state"] };
  }

  const eventType =
    payload.eventType === undefined
      ? defaultEventTypeForState(payload.nextState)
      : isAgentWorkOrderEventType(payload.eventType)
        ? payload.eventType
        : null;
  const eventMetadata = isRecord(payload.eventMetadata) ? payload.eventMetadata : {};
  const resultSummary = optionalString(payload.resultSummary);
  const outcomeMetrics = isRecord(payload.outcomeMetrics) ? payload.outcomeMetrics : {};
  const failureReason = optionalString(payload.failureReason);
  const assignedReviewerId = optionalUuid(payload.assignedReviewerId);

  if (!eventType) {
    errors.push("eventType must match a supported work-order event type");
  }

  if (resultSummary.length > 4000) {
    errors.push("resultSummary must be 4000 characters or fewer");
  }

  if (failureReason.length > 2000) {
    errors.push("failureReason must be 2000 characters or fewer");
  }

  if (payload.nextState === "blocked" && !failureReason) {
    errors.push("failureReason is required when nextState is blocked");
  }

  if (assignedReviewerId === "__invalid_uuid__") {
    errors.push("assignedReviewerId must be a valid UUID when provided");
  }

  if (errors.length > 0 || !eventType) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      nextState: payload.nextState,
      eventType,
      eventMetadata,
      resultSummary,
      outcomeMetrics,
      failureReason,
      assignedReviewerId: assignedReviewerId === "__invalid_uuid__" ? null : assignedReviewerId
    }
  };
}

export function getPersistentAgentWorkspaceSummary() {
  const protectedWorkspace = getProtectedPilotWorkspaceSummary();
  const agentOS = getAgentOSSummary();
  const trustOS = getTrustOSSummary();
  const atlas = getAtlasIntelligenceCoreSummary();
  const activeLimitations = limitationResolutionRegister.filter(
    (limitation) => limitation.resolutionStatus === "active-control"
  ).length;
  const qualityReplacements = limitationResolutionRegister.filter(
    (limitation) => limitation.resolutionStatus === "quality-process-replacement"
  ).length;
  const externalApprovals = limitationResolutionRegister.filter(
    (limitation) => limitation.resolutionStatus === "external-approval-required"
  ).length;

  return {
    service: "scrimed-persistent-agent-workspace-v1",
    route: "/agent-workspace",
    apiRoute: "/api/agent-workspace",
    briefRoute: "/api/agent-workspace/brief",
    proofPacketRoute: "/api/agent-workspace/proof-packet",
    workOrderMutationRoute: "/api/agent-workspaces/{workspaceSlug}/work-orders",
    workOrderDetailRoute: "/api/agent-workspaces/{workspaceSlug}/work-orders/{workOrderId}",
    workOrderProofPacketRoute:
      "/api/agent-workspaces/{workspaceSlug}/work-orders/{workOrderId}/proof-packet",
    workOrderDashboardFilters: [
      "state",
      "workOrderType",
      "assignedReviewerId",
      "minRetryCount",
      "governanceStatus"
    ],
    status: "persistent-agent-workspace-v1-ready",
    boundary: persistentAgentWorkspaceBoundary,
    foundation: {
      protectedWorkspaceStatus: protectedWorkspace.status,
      protectedWorkspaceRoute: protectedWorkspace.route,
      agentOSStatus: agentOS.status,
      agentOSRoute: agentOS.route,
      trustOSStatus: trustOS.status,
      trustOSRoute: trustOS.route,
      atlasStatus: atlas.status,
      atlasRoute: atlas.route,
      tenantIsolation: protectedWorkspace.infrastructure.tenantIsolation,
      durableStore: protectedWorkspace.infrastructure.durableStore,
      rateLimit: protectedWorkspace.infrastructure.rateLimit
    },
    previewWorkspace: previewPilotWorkspace,
    capabilityCount: workspaceCapabilities.length,
    workOrderCount: workOrderTemplates.length,
    workOrderStateCount: agentWorkOrderStates.length,
    workOrderEventTypeCount: agentWorkOrderEventTypes.length,
    modelRouterDecisionCount: modelRouterWorkspaceDecisions.length,
    reviewerCheckpointCount: workspaceReviewerCheckpoints.length,
    auditTimelineEventCount: workspaceAuditTimeline.length,
    limitationCount: limitationResolutionRegister.length,
    activeLimitations,
    qualityReplacements,
    externalApprovals,
    capabilities: workspaceCapabilities,
    workOrders: workOrderTemplates,
    modelRouterDecisions: modelRouterWorkspaceDecisions,
    auditTimeline: workspaceAuditTimeline,
    reviewerCheckpoints: workspaceReviewerCheckpoints,
    apiContracts: workspaceApiContracts,
    limitationResolutionRegister,
    resolvedPosition:
      "No known limitation is left vague: each is either controlled by an active boundary, replaced with a safer synthetic quality process, or marked as an external approval gate that cannot be honestly resolved in code alone.",
    nextImplementationStep:
      "Add governed work-order create and transition controls to the tenant dashboard, then implement retention/legal-hold controls, incident export, and authenticated end-to-end pilot scripts.",
    updated: "2026-06-14"
  };
}

function markdownItems(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

function workOrderLines(workOrders: WorkOrderTemplate[]) {
  return workOrders
    .map(
      (workOrder) =>
        `- ${workOrder.name} (${workOrder.status}): ${workOrder.objective} Blocked actions: ${workOrder.blockedActions.join(", ")}.`
    )
    .join("\n");
}

function limitationLines(limitations: LimitationResolution[]) {
  return limitations
    .map(
      (limitation) =>
        `- ${limitation.limitation} Status: ${limitation.resolutionStatus}. Replacement: ${limitation.replacementProcess} Remaining gate: ${limitation.remainingGate}`
    )
    .join("\n");
}

export function buildPersistentAgentWorkspaceBrief() {
  const summary = getPersistentAgentWorkspaceSummary();

  return [
    "# SCRIMED Persistent Agent Workspace v1 Brief",
    "",
    `Status: ${summary.status}`,
    `Boundary: ${summary.boundary}`,
    "",
    "## Foundation",
    `- Protected workspace: ${summary.foundation.protectedWorkspaceStatus} (${summary.foundation.protectedWorkspaceRoute})`,
    `- AgentOS: ${summary.foundation.agentOSStatus} (${summary.foundation.agentOSRoute})`,
    `- TrustOS: ${summary.foundation.trustOSStatus} (${summary.foundation.trustOSRoute})`,
    `- Atlas: ${summary.foundation.atlasStatus} (${summary.foundation.atlasRoute})`,
    `- Tenant isolation: ${summary.foundation.tenantIsolation.provider} - ${summary.foundation.tenantIsolation.control}`,
    `- Durable store: ${summary.foundation.durableStore.provider} - ${summary.foundation.durableStore.control}`,
    `- Work-order mutation route: ${summary.workOrderMutationRoute}`,
    `- Work-order detail route: ${summary.workOrderDetailRoute}`,
    `- Work-order proof-packet route: ${summary.workOrderProofPacketRoute}`,
    `- Work-order dashboard filters: ${summary.workOrderDashboardFilters.join(", ")}`,
    `- Work-order states: ${summary.workOrderStateCount}`,
    `- Work-order event types: ${summary.workOrderEventTypeCount}`,
    "",
    "## Workspace Capabilities",
    ...summary.capabilities.map(
      (capability) =>
        `- ${capability.capability} (${capability.status}): ${capability.implementation} Gate: ${capability.productionGate}`
    ),
    "",
    "## Work Orders",
    workOrderLines(summary.workOrders),
    "",
    "## Reviewer Checkpoints",
    ...summary.reviewerCheckpoints.map(
      (checkpoint) =>
        `- ${checkpoint.checkpoint}: ${checkpoint.requiredFor} Reviewer: ${checkpoint.reviewerRole}. Denial: ${checkpoint.denialEffect}`
    ),
    "",
    "## Known Limitations Resolution",
    summary.resolvedPosition,
    limitationLines(summary.limitationResolutionRegister),
    "",
    "## API Contracts",
    ...summary.apiContracts.map(
      (contract) => `- ${contract.method} ${contract.route} (${contract.status}): ${contract.purpose}`
    ),
    "",
    "## Next Implementation Step",
    summary.nextImplementationStep
  ].join("\n");
}

export function buildPersistentAgentWorkspaceProofPacket() {
  const summary = getPersistentAgentWorkspaceSummary();
  const previewWorkOrder = summary.workOrders[0];

  return [
    "# SCRIMED Persistent Agent Workspace Proof Packet",
    "",
    "## Workspace",
    `- Tenant: ${summary.previewWorkspace.tenantName}`,
    `- Workspace: ${summary.previewWorkspace.name}`,
    `- Workspace slug: ${summary.previewWorkspace.slug}`,
    `- Workspace status: ${summary.previewWorkspace.status}`,
    `- Product route: ${summary.route}`,
    "",
    "## Preview Work Order",
    `- Name: ${previewWorkOrder.name}`,
    `- Type: ${previewWorkOrder.type}`,
    `- Status: ${previewWorkOrder.status}`,
    `- Agent owner: ${previewWorkOrder.agentOwner}`,
    `- Objective: ${previewWorkOrder.objective}`,
    `- Resumable state: ${previewWorkOrder.resumableState}`,
    `- Deliverable: ${previewWorkOrder.deliverable}`,
    "",
    "## State Machine",
    markdownItems(previewWorkOrder.stateMachine),
    "",
    "## Model Router Policy",
    previewWorkOrder.modelRouterPolicy,
    "",
    "## Trust Card Requirement",
    previewWorkOrder.trustCardRequirement,
    "",
    "## Reviewer Checkpoints",
    markdownItems(previewWorkOrder.reviewerCheckpoints),
    "",
    "## Audit Timeline",
    ...summary.auditTimeline.map(
      (event) => `- ${event.event} (${event.status}) by ${event.actor}: ${event.retainedEvidence}`
    ),
    "",
    "## Blocked Actions",
    markdownItems(previewWorkOrder.blockedActions),
    "",
    "## Known Limitations Resolution",
    limitationLines(summary.limitationResolutionRegister),
    "",
    "## Product Boundary",
    summary.boundary,
    "",
    "This proof packet is a deterministic synthetic workspace packet. It is not clinical advice, a legal opinion, a compliance certification, a reimbursement guarantee, or production authorization."
  ].join("\n");
}

function markdownJson(value: unknown) {
  return `\`\`\`json\n${JSON.stringify(value, null, 2).replace(/```/g, "` ` `")}\n\`\`\``;
}

function workOrderEventLines(events: AgentWorkspaceWorkOrderEventRecord[]) {
  const sortedEvents = [...events].sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  if (sortedEvents.length === 0) {
    return "- No work-order events are visible for this tenant member.";
  }

  return sortedEvents
    .map(
      (event) =>
        `- ${event.createdAt}: ${event.eventType} by ${event.actorUserId}; ${event.priorState ?? "none"} -> ${event.nextState}`
    )
    .join("\n");
}

export function buildAgentWorkspaceWorkOrderProofPacket({
  workspace,
  workOrder,
  events,
  auditEventId,
  generatedAt,
  appBaseUrl
}: AgentWorkspaceWorkOrderProofPacketInput) {
  const template = getWorkOrderTemplate(workOrder.workOrderType);
  const productRoute = `${appBaseUrl.replace(/\/$/, "")}/agent-workspace`;
  const governanceStatus = getAgentWorkspaceGovernanceStatus(workOrder);

  return [
    "# SCRIMED Agent Workspace Work-Order Proof Packet",
    "",
    "## Packet Control",
    `- Generated: ${generatedAt}`,
    `- Audit event ID: ${auditEventId}`,
    "- Packet type: tenant-authenticated synthetic work-order proof",
    "- Data boundary: synthetic-only and metadata-only",
    `- Product route: ${productRoute}`,
    "",
    "## Tenant Workspace",
    `- Tenant: ${workspace.tenantName}`,
    `- Workspace: ${workspace.name}`,
    `- Workspace slug: ${workspace.slug}`,
    `- Workspace status: ${workspace.status}`,
    "",
    "## Work Order",
    `- Work-order ID: ${workOrder.id}`,
    `- Type: ${workOrder.workOrderType}`,
    `- Template: ${template.name}`,
    `- Current state: ${workOrder.state}`,
    `- Governance status: ${governanceStatus}`,
    `- Agent owner: ${workOrder.agentOwner}`,
    `- Assigned reviewer: ${workOrder.assignedReviewerId ?? "unassigned"}`,
    `- Retry count: ${workOrder.retryCount}`,
    `- Created: ${workOrder.createdAt}`,
    `- Updated: ${workOrder.updatedAt}`,
    "",
    "## Objective",
    workOrder.objective,
    "",
    "## Memory Scopes",
    markdownItems(workOrder.memoryScopes),
    "",
    "## Tool Scopes",
    markdownItems(workOrder.toolScopes),
    "",
    "## Model Router Policy",
    workOrder.modelRouterPolicy,
    "",
    "## Trust Card",
    markdownJson(workOrder.trustCard),
    "",
    "## Reviewer Checkpoints",
    markdownItems(workOrder.reviewerCheckpoints),
    "",
    "## Blocked Actions",
    markdownItems(workOrder.blockedActions),
    "",
    "## Result Summary",
    workOrder.resultSummary || "No result summary has been released.",
    "",
    "## Outcome Metrics",
    markdownJson(workOrder.outcomeMetrics),
    "",
    "## Failure Or Blocker",
    workOrder.failureReason || "No blocker has been recorded.",
    "",
    "## Event Trail",
    workOrderEventLines(events),
    "",
    "## Legal, Privacy, Security, And Safety Boundary",
    "- This packet is a governed synthetic pilot artifact only.",
    "- Do not enter PHI, live patient records, member IDs, payer credentials, secrets, or production connector credentials into this workflow.",
    "- This packet is not medical advice, clinical decision support authorization, diagnosis, treatment guidance, patient instruction, payer submission, reimbursement guarantee, legal advice, or regulatory advice.",
    "- This packet is not evidence of HIPAA compliance, SOC 2 certification, FDA clearance, payer approval, reimbursement eligibility, or production readiness.",
    "- Live clinical, payer, imaging, device, EHR, or patient-facing use requires signed customer authorization, BAA/DPA path where applicable, privacy review, security review, clinical governance, legal review, retention policy, incident response, and deployment approval.",
    "- When uncertainty, missing evidence, or unsafe scope appears, SCRIMED must escalate to an authorized human reviewer rather than guess or execute autonomously.",
    "",
    "## Product Boundary",
    workOrder.boundary,
    "",
    persistentAgentWorkspaceBoundary
  ].join("\n");
}
