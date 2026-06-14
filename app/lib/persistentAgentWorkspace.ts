import { getAgentOSSummary } from "./agentOS";
import { getAtlasIntelligenceCoreSummary } from "./atlasIntelligenceCore";
import { getProtectedPilotWorkspaceSummary, previewPilotWorkspace } from "./protectedPilotWorkspace";
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
  | "blocked";

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
  method: "GET" | "POST" | "GET / POST" | "future";
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
    status: "v1-ready",
    implementation:
      "Defines resumable work-order state machines that map to durable synthetic sessions, TrustOS decisions, and audit events.",
    proofRoute: "/api/agent-workspace",
    productionGate:
      "Dedicated production work-order tables require migration review, RLS testing, retention policy, and Data API exposure review."
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
      "Workspace proof packets combine work-order plan, Trust Cards, reviewer checkpoints, audit timeline, blocked actions, and limitations register.",
    proofRoute: "/api/agent-workspace/proof-packet",
    productionGate:
      "Production packets need customer branding, legal disclaimers, evidence retention policy, and confidentiality controls."
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
    method: "future",
    route: "/api/agent-workspaces/{workspaceSlug}/work-orders",
    status: "production-gated",
    access: "Future AAL2 tenant workspace role + dedicated RLS work-order table",
    purpose:
      "Create, resume, assign, retry, and close long-running work orders after migration, RLS, retention, and Data API exposure review."
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
    limitation: "Dedicated long-running work-order persistence tables are not added in this release.",
    impact: "Work-order creation/resume uses typed contracts plus existing durable protected pilot sessions and ledgers, not a new mutation surface.",
    resolutionStatus: "quality-process-replacement",
    replacementProcess:
      "Map work orders to existing RLS-backed sessions, TrustOS ledger, audit events, and proof packets until dedicated schema is reviewed.",
    proofRoute: "/api/agent-workspace",
    remainingGate: "Migration design, RLS policies, Data API exposure grants, retention, indexes, and advisor review."
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
      "After enterprise pilot usage validates the work-order contract, add dedicated RLS-backed work-order persistence tables and protected mutation APIs for create, resume, retry, assign, review, and close actions.",
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
