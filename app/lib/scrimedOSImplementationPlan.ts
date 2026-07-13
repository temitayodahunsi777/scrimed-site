export type ScrimedOSPhase =
  | "phase-0-safety-contract"
  | "phase-1-governance-backbone"
  | "phase-2-tool-runtime-plane"
  | "phase-3-clinical-data-workflows"
  | "phase-4-ops-intelligence"
  | "phase-5-deployment-platform"
  | "phase-6-outcome-learning";

export type ScrimedOSReadiness =
  | "architecture-ready"
  | "starter-build-ready"
  | "requires-protected-pilot"
  | "blocked-before-production";

export type ScrimedOSCapabilityDomain =
  | "eventing"
  | "identity"
  | "tooling"
  | "runtime"
  | "clinical-workflow"
  | "registry"
  | "interoperability"
  | "imaging"
  | "ops"
  | "observability"
  | "qa"
  | "learning"
  | "infrastructure"
  | "audit"
  | "security";

export type ScrimedOSCapability = {
  id: string;
  name: string;
  domain: ScrimedOSCapabilityDomain;
  phase: ScrimedOSPhase;
  readiness: ScrimedOSReadiness;
  objective: string;
  starterArchitecture: string[];
  interfaces: string[];
  events: string[];
  registriesTouched: string[];
  requiredControls: string[];
  humanGate: string;
  blockedAutonomy: string[];
  deliverables: string[];
  acceptanceCriteria: string[];
};

export type ScrimedOSAgentSpec = {
  name: string;
  purpose: string;
  identityScope: string;
  allowedTools: string[];
  deniedTools: string[];
  requiredEvidence: string[];
  humanEscalation: string;
  firstMilestone: string;
};

export type ScrimedOSRoadmapPhase = {
  phase: ScrimedOSPhase;
  label: string;
  objective: string;
  exitCriteria: string[];
  blockedUntil: string[];
};

export type ScrimedOSValidationCheck = {
  check: string;
  passed: boolean;
  detail: string;
};

export const scrimedOSImplementationPlanRoute = "/scrimed-os";
export const scrimedOSImplementationPlanApiRoute =
  "/api/scrimed-os/implementation-plan";
export const scrimedOSImplementationPlanStatus =
  "scrimed-os-implementation-plan-ready-no-phi";
export const scrimedOSImplementationPlanUpdatedAt = "2026-06-30";

export const scrimedOSOperatingBoundary =
  "SCRIMED OS implementation plan is a no-PHI, architecture-and-roadmap control. It does not authorize live PHI, autonomous diagnosis, treatment, prescribing, patient outreach, payer submission, EHR writeback, production connector use, Kubernetes mutation, remediation execution, clinical validation, certification, or customer go-live.";

export const scrimedOSArchitecturePrinciples = [
  "Event-driven by default.",
  "Zero-trust agent identity.",
  "Human-in-the-loop clinical decisions.",
  "No direct LLM-to-database access.",
  "Governed MCP middleware between AI and systems of record.",
  "Every agent has identity, permissions, version, trust score, audit log, and allowed tools.",
  "Every model output is evaluated, logged, and traceable.",
  "Every clinical recommendation-like draft includes confidence, source evidence, limitations, and escalation criteria.",
  "All infrastructure is reproducible through IaC.",
  "All workflows are observable, testable, versioned, and rollback-capable.",
  "Prefer orchestrating best frontier models over training proprietary healthcare models unless justified.",
  "Use CodeMode agents for structured reasoning, calculations, SQL generation, FHIR transformations, and workflow automation.",
  "Preserve document structure during RAG ingestion: pages, tables, labels, values, units, citations, images, and references."
];

export const scrimedOSRoadmap: ScrimedOSRoadmapPhase[] = [
  {
    phase: "phase-0-safety-contract",
    label: "Safety and architecture contract",
    objective:
      "Freeze the operating boundary, no-PHI posture, protected-action denials, and starter contracts before implementation expands.",
    exitCriteria: [
      "Central policy gate is referenced by sensitive APIs.",
      "NO-GO boundaries are visible in docs and APIs.",
      "No direct LLM-to-database access is encoded as an invariant.",
      "Starter registries and event names are versioned."
    ],
    blockedUntil: [
      "No customer PHI, production connector, or clinical action can enter this phase."
    ]
  },
  {
    phase: "phase-1-governance-backbone",
    label: "Governance backbone",
    objective:
      "Build the event mesh, identity registry, audit ledger, policy registry, and core agent/model/prompt/eval registries.",
    exitCriteria: [
      "Every agent and model route has an identity, owner, version, policy, and audit event.",
      "Event envelopes are deterministic and replayable.",
      "Registry changes require approval records."
    ],
    blockedUntil: [
      "Registry mutation APIs have RBAC, AAL2, audit, and rollback controls."
    ]
  },
  {
    phase: "phase-2-tool-runtime-plane",
    label: "Tool and runtime plane",
    objective:
      "Introduce Secure MCP Gateway, CodeMode Runtime, query validation middleware, and secure RAG/data ingestion.",
    exitCriteria: [
      "All tool calls require scoped identity and policy checks.",
      "CodeMode runs in sandboxed, time-limited, network-restricted execution.",
      "SQL and FHIR queries are validated before execution.",
      "RAG ingestion preserves document structure and evidence links."
    ],
    blockedUntil: [
      "No production system of record receives writes or unreviewed tool calls."
    ]
  },
  {
    phase: "phase-3-clinical-data-workflows",
    label: "Clinical and data workflows",
    objective:
      "Build the clinical orchestrator, FHIR validation, imaging integration, clinical QA, and safety sandbox.",
    exitCriteria: [
      "Clinical outputs carry evidence, confidence, limitations, and escalation criteria.",
      "FHIR validation rejects unsafe or profile-invalid payloads.",
      "Imaging is metadata/report-first and no-PHI until approved.",
      "Human review remains mandatory for protected clinical workflows."
    ],
    blockedUntil: [
      "Clinical governance approves reviewer roles, escalation criteria, and workflow-specific risk rubrics."
    ]
  },
  {
    phase: "phase-4-ops-intelligence",
    label: "Operations intelligence",
    objective:
      "Add configuration drift, AI cost intelligence, observability, and suggestion-only remediation loops.",
    exitCriteria: [
      "SLOs, traces, model costs, registry drift, and deployment drift are observable.",
      "Autonomous remediation creates reviewed proposals, not live mutations.",
      "Cost and provider anomaly events are routed to human owners."
    ],
    blockedUntil: [
      "No remediation action can mutate production without deployment approval pipeline signoff."
    ]
  },
  {
    phase: "phase-5-deployment-platform",
    label: "Deployment platform",
    objective:
      "Implement IaC, Kubernetes deployment contracts, canaries, approvals, rollback, and environment drift controls.",
    exitCriteria: [
      "Terraform or equivalent IaC can reproduce approved environments.",
      "Kubernetes manifests are signed, scanned, policy-checked, and rollback-ready.",
      "Deployment approval pipeline blocks unsafe releases."
    ],
    blockedUntil: [
      "Secrets, PHI stores, live connectors, and production clusters have separate approval tracks."
    ]
  },
  {
    phase: "phase-6-outcome-learning",
    label: "Outcome learning",
    objective:
      "Build continuous outcome learning with synthetic or approved de-identified feedback, reviewer labels, and regression gates.",
    exitCriteria: [
      "Outcome signals are consented, de-identified or approved, and evidence-linked.",
      "Learning updates create evaluation tasks, not automatic clinical behavior changes.",
      "Regression and bias checks pass before policy or prompt promotion."
    ],
    blockedUntil: [
      "No live patient outcome learning can run without legal, privacy, clinical, and customer approval."
    ]
  }
];

const noLiveClinicalGate =
  "Human owner review is required; this capability cannot create diagnosis, treatment, prescribing, outreach, payer, EHR, or production connector authority.";

const noDirectDatabaseControl =
  "LLM output cannot execute direct SQL or direct system-of-record queries; all access must pass through validation middleware, MCP policy, scoped identity, and audit.";

export const scrimedOSCapabilities: ScrimedOSCapability[] = [
  {
    id: "event-mesh",
    name: "SCRIMED Event Mesh",
    domain: "eventing",
    phase: "phase-1-governance-backbone",
    readiness: "starter-build-ready",
    objective:
      "Create the append-only event backbone for agent runs, registry changes, workflow state, model routing, evaluations, approvals, and audit evidence.",
    starterArchitecture: [
      "Typed event envelope with eventId, tenantRef, actor, subject, schemaVersion, causationId, correlationId, traceId, policyVersion, and payloadHash.",
      "Topic families for agent.*, registry.*, workflow.*, model.*, eval.*, audit.*, deployment.*, cost.*, drift.*, and safety.*.",
      "Outbox pattern first; broker integration later through Kafka, NATS, Redis Streams, or cloud-native event bus."
    ],
    interfaces: ["publishEvent(envelope)", "subscribe(topic, consumer)", "replay(correlationId)", "deadLetter(eventId)"],
    events: ["event.mesh.event.accepted", "event.mesh.event.replayed", "event.mesh.dead_letter.created"],
    registriesTouched: ["policy-registry", "evaluation-registry"],
    requiredControls: ["schema validation", "idempotency", "tenant boundary", "immutable hash", "dead-letter owner"],
    humanGate: "Human review required before event replay can trigger any protected workflow.",
    blockedAutonomy: ["protected side effects from replay", "cross-tenant event reuse", "PHI-bearing public events"],
    deliverables: ["Event schema", "topic map", "outbox table contract", "dead-letter runbook"],
    acceptanceCriteria: ["All sensitive actions emit events", "Replay is metadata-only by default", "Dead-letter path is owner-routed"]
  },
  {
    id: "agent-identity-registry",
    name: "Agent Identity Registry",
    domain: "identity",
    phase: "phase-1-governance-backbone",
    readiness: "starter-build-ready",
    objective:
      "Give every agent persistent identity, owner, version, trust score, scopes, allowed tools, denied tools, and audit history.",
    starterArchitecture: [
      "Agent identity record keyed by agentId and version.",
      "Scoped token exchange for each run, with short TTL and tool-specific claims.",
      "Trust score derived from eval outcomes, incidents, reviewer outcomes, and policy violations."
    ],
    interfaces: ["registerAgent()", "issueAgentRunIdentity()", "revokeAgentIdentity()", "getAgentTrustScore()"],
    events: ["agent.identity.registered", "agent.identity.versioned", "agent.identity.revoked", "agent.identity.trust_score.updated"],
    registriesTouched: ["agent-registry", "policy-registry", "evaluation-registry"],
    requiredControls: ["least privilege", "AAL2 operator approval", "version pinning", "revocation", "audit trail"],
    humanGate: "Security owner approval required for new protected-tool scopes.",
    blockedAutonomy: ["anonymous agent runs", "unversioned tools", "self-granted permissions"],
    deliverables: ["Identity schema", "scope matrix", "revocation API", "trust score rubric"],
    acceptanceCriteria: ["No agent can run without identity", "Every tool call checks agent identity", "Revocation blocks future run tokens"]
  },
  {
    id: "secure-mcp-gateway",
    name: "Secure MCP Gateway",
    domain: "tooling",
    phase: "phase-2-tool-runtime-plane",
    readiness: "requires-protected-pilot",
    objective:
      "Place governed MCP middleware between agents and systems of record, with OAuth, scoped tokens, tool-level authorization, and audit.",
    starterArchitecture: [
      "Gateway validates user, tenant, agent identity, tool scope, policy, and approval state before tool execution.",
      "MCP server adapters remain read-only and synthetic until approved.",
      "Tool calls emit request, decision, execution, result-hash, and denial events."
    ],
    interfaces: ["listTools(identity)", "authorizeToolCall()", "executeTool()", "revokeToolGrant()"],
    events: ["mcp.tool.requested", "mcp.tool.authorized", "mcp.tool.denied", "mcp.tool.result_recorded"],
    registriesTouched: ["agent-registry", "policy-registry", "zero-trust-audit-ledger"],
    requiredControls: ["OAuth/OIDC", "scoped tokens", "tool allowlist", "revocation", "prompt-injection filter", "result redaction"],
    humanGate: "Human approval required for protected tools, connector writes, patient-facing actions, and payer actions.",
    blockedAutonomy: ["unpermissioned tools", "EHR writeback", "payer submission", "patient outreach"],
    deliverables: ["MCP gateway contract", "tool authorization middleware", "tool audit events", "revocation path"],
    acceptanceCriteria: ["No tool executes without explicit permission", "Denied calls are audited", "Protected tools default to blocked"]
  },
  {
    id: "codemode-runtime",
    name: "CodeMode Runtime for agents",
    domain: "runtime",
    phase: "phase-2-tool-runtime-plane",
    readiness: "requires-protected-pilot",
    objective:
      "Run structured reasoning, calculations, SQL generation, FHIR transformations, validation, and workflow automation inside sandboxed CodeMode sessions.",
    starterArchitecture: [
      "Ephemeral runtime with no secrets by default, CPU/time/memory limits, network deny by default, and artifact hashing.",
      "Generated SQL/FHIR transformations are proposals until validation middleware and human approval pass.",
      "Runtime outputs are stored as evidence artifacts, not direct mutations."
    ],
    interfaces: ["createCodeRun()", "validateArtifact()", "approveArtifact()", "discardRun()"],
    events: ["codemode.run.started", "codemode.artifact.created", "codemode.artifact.validated", "codemode.run.quarantined"],
    registriesTouched: ["agent-registry", "prompt-registry", "evaluation-registry", "zero-trust-audit-ledger"],
    requiredControls: ["sandbox isolation", "no secret injection", "artifact hash", "malware scan placeholder", "human approval"],
    humanGate: "Human owner approval required before generated code, SQL, or FHIR transforms affect any workflow.",
    blockedAutonomy: ["direct database execution", "network egress by default", "secret access", "production mutation"],
    deliverables: ["Sandbox policy", "artifact schema", "validation hooks", "quarantine runbook"],
    acceptanceCriteria: ["CodeMode can generate but not execute system-of-record changes", "Artifacts are hashed", "Unsafe runs quarantine"]
  },
  {
    id: "clinical-workflow-orchestrator",
    name: "Clinical Workflow Orchestrator",
    domain: "clinical-workflow",
    phase: "phase-3-clinical-data-workflows",
    readiness: "requires-protected-pilot",
    objective:
      "Coordinate deterministic clinical workflows across intake, evidence, FHIR validation, QA, review queues, and safe handoff states.",
    starterArchitecture: [
      "State-machine workflows with explicit states, owners, timers, rollback, and review gates.",
      "LLMs summarize, draft, classify, and explain; deterministic services own state transition and side-effect decisions.",
      "Every clinical recommendation-like draft carries evidence, confidence, limitations, and escalation criteria."
    ],
    interfaces: ["startWorkflow()", "advanceState()", "requestReview()", "rollbackWorkflow()"],
    events: ["clinical.workflow.started", "clinical.workflow.review_required", "clinical.workflow.blocked", "clinical.workflow.rollback_requested"],
    registriesTouched: ["policy-registry", "evaluation-registry", "zero-trust-audit-ledger"],
    requiredControls: ["state machine", "human clinical review", "evidence cards", "rollback", "no live-care authority"],
    humanGate: noLiveClinicalGate,
    blockedAutonomy: ["diagnosis", "treatment", "prescribing", "triage replacement", "patient instructions"],
    deliverables: ["Workflow DSL", "clinical state map", "review queue contract", "rollback runbook"],
    acceptanceCriteria: ["Protected states require human review", "No LLM controls state transitions alone", "Rollback is defined"]
  },
  {
    id: "agent-registry",
    name: "Agent Registry",
    domain: "registry",
    phase: "phase-1-governance-backbone",
    readiness: "starter-build-ready",
    objective:
      "Maintain approved agent definitions, versions, scopes, owners, eval requirements, tool policies, and deployment status.",
    starterArchitecture: ["Typed registry with draft, review, approved, deprecated, and revoked states.", "Agent version is pinned per workflow.", "Promotion requires evaluation and policy approval."],
    interfaces: ["registerAgentVersion()", "approveAgentVersion()", "deprecateAgentVersion()", "listApprovedAgents()"],
    events: ["registry.agent.created", "registry.agent.approved", "registry.agent.deprecated"],
    registriesTouched: ["policy-registry", "evaluation-registry"],
    requiredControls: ["owner approval", "version pinning", "tool scope validation", "eval gate"],
    humanGate: "Platform and domain owner approval required before agent promotion.",
    blockedAutonomy: ["self-promotion", "unapproved tools", "unreviewed clinical agent release"],
    deliverables: ["Agent registry schema", "approval workflow", "agent version API"],
    acceptanceCriteria: ["Every agent has owner/version/scopes", "Promotion requires eval status", "Deprecated agents cannot be routed"]
  },
  {
    id: "prompt-registry",
    name: "Prompt Registry",
    domain: "registry",
    phase: "phase-1-governance-backbone",
    readiness: "starter-build-ready",
    objective:
      "Version prompts, system instructions, few-shot examples, safety clauses, expected outputs, owners, and eval bindings.",
    starterArchitecture: ["Prompt templates are immutable by version.", "Clinical prompts require safety boundary and output schema.", "Few-shot examples store reviewer, source, risk, and outcome metadata."],
    interfaces: ["registerPrompt()", "promotePrompt()", "rollbackPrompt()", "bindPromptEval()"],
    events: ["registry.prompt.created", "registry.prompt.promoted", "registry.prompt.rollback"],
    registriesTouched: ["evaluation-registry", "policy-registry"],
    requiredControls: ["template validation", "injection checks", "reviewer signoff", "rollback"],
    humanGate: "Prompt promotion requires domain owner review for clinical, payer, or security workflows.",
    blockedAutonomy: ["silent prompt edits", "unreviewed clinical prompts", "prompt bypassing policy"],
    deliverables: ["Prompt schema", "promotion workflow", "rollback workflow", "few-shot metadata model"],
    acceptanceCriteria: ["Every prompt call logs prompt version", "Rollback is one step", "Clinical prompts include refusal boundaries"]
  },
  {
    id: "policy-registry",
    name: "Policy Registry",
    domain: "registry",
    phase: "phase-1-governance-backbone",
    readiness: "starter-build-ready",
    objective:
      "Centralize safety, PHI, tool, model, workflow, data-residency, cost, and deployment policies with versioned decisions.",
    starterArchitecture: ["Policy decisions emit allow, deny, review-required, or quarantine.", "Most restrictive policy wins.", "Policies are tied to route, tenant, agent, model, and workflow context."],
    interfaces: ["evaluatePolicy()", "registerPolicy()", "promotePolicy()", "explainDecision()"],
    events: ["registry.policy.created", "policy.decision.allowed", "policy.decision.denied", "policy.decision.review_required"],
    registriesTouched: ["agent-registry", "model-registry", "zero-trust-audit-ledger"],
    requiredControls: ["versioning", "decision logging", "least privilege", "most restrictive rule", "appeal path"],
    humanGate: "Policy changes require security, clinical, or operations owner approval based on scope.",
    blockedAutonomy: ["policy self-modification", "unlogged allow decisions", "policy bypass"],
    deliverables: ["Policy schema", "decision engine contract", "explainability format"],
    acceptanceCriteria: ["Every sensitive route has policy decision", "Policy version is logged", "Deny by default is preserved"]
  },
  {
    id: "model-registry",
    name: "Model Registry",
    domain: "registry",
    phase: "phase-1-governance-backbone",
    readiness: "starter-build-ready",
    objective:
      "Track providers, model versions, tasks, risk tiers, cost, latency, quality, data policy, fallback, and approval state.",
    starterArchitecture: ["Provider-neutral adapter records for OpenAI, Anthropic, Google, NVIDIA/Nemotron, Azure, AWS, open models, and local/edge models.", "Model routes are selected by task, privacy, risk, quality, cost, and latency.", "External calls are disabled until approved."],
    interfaces: ["registerModel()", "approveModelRoute()", "selectModelRoute()", "rollbackModelVersion()"],
    events: ["registry.model.created", "model.route.selected", "model.route.blocked", "model.version.rollback"],
    registriesTouched: ["policy-registry", "evaluation-registry", "zero-trust-audit-ledger"],
    requiredControls: ["provider contract", "data-use policy", "cost guardrail", "fallback", "eval baseline"],
    humanGate: "Model approval requires privacy, security, and domain owner review.",
    blockedAutonomy: ["unlogged external model calls", "PHI routing without approval", "single-provider hard dependency"],
    deliverables: ["Model registry schema", "routing policy", "cost metadata", "fallback matrix"],
    acceptanceCriteria: ["Every model call logs version/cost/latency", "Fallback is defined", "Provider calls default disabled"]
  },
  {
    id: "evaluation-registry",
    name: "Evaluation Registry",
    domain: "registry",
    phase: "phase-1-governance-backbone",
    readiness: "starter-build-ready",
    objective:
      "Store evaluation datasets, synthetic scenarios, reviewer labels, scorecards, regression checks, adversarial cases, and release gates.",
    starterArchitecture: ["Eval suites bind to agent, prompt, model, workflow, and policy versions.", "Clinical readiness scores are domain-specific, not leaderboard scores.", "Failures create release blocks and review tasks."],
    interfaces: ["registerEvalSuite()", "runEval()", "recordReviewerOutcome()", "blockReleaseOnFailure()"],
    events: ["registry.eval.created", "eval.run.started", "eval.run.completed", "eval.release_block.created"],
    registriesTouched: ["agent-registry", "prompt-registry", "model-registry", "policy-registry"],
    requiredControls: ["no PHI fixtures", "regression threshold", "human reviewer labels", "bias checks", "drift checks"],
    humanGate: "Clinical-risk eval changes require clinical governance review.",
    blockedAutonomy: ["leaderboard-only approval", "unreviewed clinical eval promotion", "PHI in fixtures"],
    deliverables: ["Eval registry schema", "scorecard format", "release gate contract"],
    acceptanceCriteria: ["Every protected workflow has eval suite", "Failures block promotion", "Reviewer outcomes are retained"]
  },
  {
    id: "fhir-validation-agent",
    name: "FHIR Validation Agent",
    domain: "interoperability",
    phase: "phase-3-clinical-data-workflows",
    readiness: "requires-protected-pilot",
    objective:
      "Validate FHIR resources, profiles, terminology, references, consent, purpose-of-use, and transformation safety before workflow use.",
    starterArchitecture: ["FHIR validator is deterministic with agent-assisted explanation.", "CodeMode may propose FHIR transformations but cannot execute writes.", "Invalid resources create review tasks."],
    interfaces: ["validateFhirResource()", "explainFhirError()", "proposeFhirTransform()", "createInteroperabilityReview()"],
    events: ["fhir.validation.requested", "fhir.validation.passed", "fhir.validation.failed", "fhir.transform.proposed"],
    registriesTouched: ["policy-registry", "evaluation-registry", "zero-trust-audit-ledger"],
    requiredControls: ["FHIR profile validation", "terminology validation", "consent/purpose check", noDirectDatabaseControl],
    humanGate: "Interoperability owner review required before production FHIR transforms or connector activation.",
    blockedAutonomy: ["FHIR writeback", "profile bypass", "terminology guessing", "live patient mutation"],
    deliverables: ["FHIR validation service contract", "profile registry binding", "error explanation format"],
    acceptanceCriteria: ["Invalid FHIR fails closed", "Transform proposals are review-gated", "FHIR events are audited"]
  },
  {
    id: "imaging-integration-layer",
    name: "Imaging Integration Layer",
    domain: "imaging",
    phase: "phase-3-clinical-data-workflows",
    readiness: "blocked-before-production",
    objective:
      "Prepare DICOM/DICOMweb/PACS, imaging reports, metadata, AI imaging inference, and reviewer workflows without enabling live imaging authority.",
    starterArchitecture: ["Report and metadata first; pixel data disabled until approved.", "Adapters for DICOMweb, PACS, MONAI/nnUNet/SwinUNETR/SegResNet evaluation, and GPU scheduling are contract-only.", "Imaging AI outputs require radiology or specialist review."],
    interfaces: ["validateDicomMetadata()", "ingestSyntheticImagingReport()", "queueImagingReview()", "recordImagingEvidence()"],
    events: ["imaging.metadata.validated", "imaging.report.ingested", "imaging.review.required", "imaging.inference.blocked"],
    registriesTouched: ["model-registry", "policy-registry", "evaluation-registry"],
    requiredControls: ["DICOM tag minimization", "no pixel PHI by default", "specialist review", "GPU job policy", "model card"],
    humanGate: "Radiology or domain specialist review required before any imaging interpretation is released.",
    blockedAutonomy: ["diagnostic imaging interpretation", "PACS writeback", "pixel data ingestion without approval", "unreviewed inference"],
    deliverables: ["Imaging adapter contract", "DICOM metadata validator", "inference review queue", "GPU scheduling plan"],
    acceptanceCriteria: ["Imaging pixel flow blocked by default", "Reports are source-attributed", "Inference cannot bypass specialist review"]
  },
  {
    id: "configuration-drift-agent",
    name: "Configuration Drift Agent",
    domain: "ops",
    phase: "phase-4-ops-intelligence",
    readiness: "starter-build-ready",
    objective:
      "Detect drift across policies, registries, environment variables, IaC, Kubernetes manifests, deployment settings, and security headers.",
    starterArchitecture: ["Read-only drift snapshots compare desired state to observed state.", "Drift findings create review tasks and deployment blocks.", "Secrets are redacted before evidence storage."],
    interfaces: ["captureConfigSnapshot()", "compareDesiredState()", "openDriftReview()", "blockUnsafeDeployment()"],
    events: ["drift.snapshot.created", "drift.detected", "drift.review_required", "drift.deployment_blocked"],
    registriesTouched: ["policy-registry", "zero-trust-audit-ledger"],
    requiredControls: ["read-only collection", "secret redaction", "severity scoring", "owner routing"],
    humanGate: "Platform owner approval required before drift remediation applies.",
    blockedAutonomy: ["automatic production config changes", "secret logging", "unreviewed policy mutation"],
    deliverables: ["Drift snapshot schema", "severity rubric", "review workflow"],
    acceptanceCriteria: ["Drift creates auditable findings", "Secrets are redacted", "Unsafe drift blocks deployment"]
  },
  {
    id: "ai-cost-intelligence-agent",
    name: "AI Cost Intelligence Agent",
    domain: "ops",
    phase: "phase-4-ops-intelligence",
    readiness: "starter-build-ready",
    objective:
      "Track model/tool cost, token use, latency, provider usage, budget thresholds, anomaly detection, and cost-aware routing recommendations.",
    starterArchitecture: ["Cost telemetry is attached to model routes and tool calls.", "Budget thresholds create warnings, denials, and review tasks.", "Provider calls remain kill-switch controlled."],
    interfaces: ["recordUsage()", "evaluateBudget()", "forecastCost()", "recommendRouteChange()"],
    events: ["cost.usage.recorded", "cost.threshold.warning", "cost.threshold.blocked", "cost.route_recommendation.created"],
    registriesTouched: ["model-registry", "policy-registry", "zero-trust-audit-ledger"],
    requiredControls: ["provider kill switch", "budget thresholds", "tenant quotas", "safe error messages", "usage anomaly detection"],
    humanGate: "Finance/platform owner approval required before budget or provider-route changes.",
    blockedAutonomy: ["uncapped provider calls", "silent provider changes", "budget bypass"],
    deliverables: ["Cost event schema", "budget policy", "usage dashboard contract"],
    acceptanceCriteria: ["Cost logged per model route", "Thresholds fail closed", "Anomalies are owner-routed"]
  },
  {
    id: "observability-platform",
    name: "Observability Platform",
    domain: "observability",
    phase: "phase-4-ops-intelligence",
    readiness: "starter-build-ready",
    objective:
      "Trace requests, events, agents, model calls, tool calls, policy decisions, evaluations, workflows, costs, and safety escalations.",
    starterArchitecture: ["OpenTelemetry-compatible trace model.", "No PHI in logs; retained artifacts use hashes and references.", "Dashboards cover latency, errors, cost, drift, eval failure, reviewer queues, and safety blocks."],
    interfaces: ["recordTrace()", "recordMetric()", "recordLogEvent()", "openIncident()"],
    events: ["observability.trace.recorded", "observability.metric.recorded", "observability.alert.opened"],
    registriesTouched: ["zero-trust-audit-ledger", "evaluation-registry"],
    requiredControls: ["PHI redaction", "trace correlation", "SLOs", "alert routing", "retention policy"],
    humanGate: "Incident owner review required for safety or production-impacting alerts.",
    blockedAutonomy: ["PHI log retention", "unreviewed alert suppression", "blind production changes"],
    deliverables: ["Trace schema", "metrics taxonomy", "dashboard map", "alert policy"],
    acceptanceCriteria: ["Every agent run has trace id", "Model/tool calls are correlated", "PHI is not logged"]
  },
  {
    id: "autonomous-remediation-agent",
    name: "Autonomous Remediation Agent",
    domain: "ops",
    phase: "phase-4-ops-intelligence",
    readiness: "blocked-before-production",
    objective:
      "Generate remediation proposals for drift, failed deployments, cost spikes, degraded SLOs, and eval regressions while keeping execution human-approved.",
    starterArchitecture: ["Suggestion-only by default.", "Remediation plans cite evidence, blast radius, rollback, and approval owner.", "Execution integrates later with deployment approval pipeline."],
    interfaces: ["draftRemediationPlan()", "estimateBlastRadius()", "requestApproval()", "recordRemediationOutcome()"],
    events: ["remediation.plan.created", "remediation.approval_requested", "remediation.execution_blocked", "remediation.outcome.recorded"],
    registriesTouched: ["policy-registry", "zero-trust-audit-ledger", "evaluation-registry"],
    requiredControls: ["human approval", "blast-radius analysis", "rollback plan", "change window", "no autonomous production mutation"],
    humanGate: "Deployment owner approval required before any remediation executes.",
    blockedAutonomy: ["self-healing production mutation", "security policy changes", "clinical workflow changes"],
    deliverables: ["Remediation plan schema", "approval packet", "rollback checklist"],
    acceptanceCriteria: ["Plans are evidence-linked", "Execution is blocked by default", "Rollback is mandatory"]
  },
  {
    id: "clinical-qa-engine",
    name: "Clinical QA Engine",
    domain: "qa",
    phase: "phase-3-clinical-data-workflows",
    readiness: "requires-protected-pilot",
    objective:
      "Evaluate clinical drafts for evidence quality, hallucination, missing data, bias, guideline grounding, safety boundaries, and reviewer requirements.",
    starterArchitecture: ["Clinical QA runs after every clinical-like draft.", "QA results include score, findings, evidence gaps, risk level, and release decision.", "High-risk or failed QA creates human review tasks."],
    interfaces: ["runClinicalQA()", "scoreClinicalDraft()", "createReviewTask()", "recordReviewerDisposition()"],
    events: ["clinical.qa.started", "clinical.qa.failed", "clinical.qa.passed_review_gated", "clinical.qa.review_required"],
    registriesTouched: ["evaluation-registry", "policy-registry", "zero-trust-audit-ledger"],
    requiredControls: ["citation checks", "missing-data checks", "bias checks", "human review", "clinical risk rubric"],
    humanGate: noLiveClinicalGate,
    blockedAutonomy: ["final clinical decision", "patient advice", "uncited medical claims", "review bypass"],
    deliverables: ["QA scorecard", "risk rubric", "review disposition schema"],
    acceptanceCriteria: ["Clinical-like drafts always get QA", "Failed QA blocks release", "Reviewer outcome is recorded"]
  },
  {
    id: "continuous-outcome-learning-engine",
    name: "Continuous Outcome Learning Engine",
    domain: "learning",
    phase: "phase-6-outcome-learning",
    readiness: "blocked-before-production",
    objective:
      "Learn from approved outcomes, reviewer labels, incidents, eval regressions, and workflow results without automatic clinical behavior changes.",
    starterArchitecture: ["Outcome signals are synthetic, de-identified, or explicitly approved.", "Learning creates eval updates, policy proposals, and prompt/model review tasks.", "No production behavior changes without release gates."],
    interfaces: ["recordOutcomeSignal()", "detectOutcomePattern()", "proposeEvalUpdate()", "requestPolicyOrPromptReview()"],
    events: ["outcome.signal.recorded", "outcome.pattern.detected", "outcome.eval_update.proposed", "outcome.learning_blocked"],
    registriesTouched: ["evaluation-registry", "prompt-registry", "policy-registry", "model-registry"],
    requiredControls: ["consent/data-use approval", "de-identification", "bias monitoring", "human review", "release gates"],
    humanGate: "Clinical governance approval required before outcome-derived changes affect workflows.",
    blockedAutonomy: ["automatic clinical learning", "PHI outcome ingestion without approval", "unreviewed prompt/model promotion"],
    deliverables: ["Outcome schema", "learning proposal workflow", "regression rerun policy"],
    acceptanceCriteria: ["Learning is proposal-only", "Outcome data is approved", "Regression gates run before promotion"]
  },
  {
    id: "infrastructure-as-code-engine",
    name: "Infrastructure-as-Code Engine",
    domain: "infrastructure",
    phase: "phase-5-deployment-platform",
    readiness: "requires-protected-pilot",
    objective:
      "Make SCRIMED environments reproducible through IaC with policy checks, secrets separation, state locking, drift detection, and rollback.",
    starterArchitecture: ["Terraform/OpenTofu module boundaries for app, database, cache, storage, queues, observability, and network.", "IaC plans are scanned and approved before apply.", "State is locked and environment-specific."],
    interfaces: ["planInfrastructure()", "scanIaCPlan()", "approveIaCChange()", "applyIaCChange()"],
    events: ["iac.plan.created", "iac.plan.scanned", "iac.approval_required", "iac.apply.blocked"],
    registriesTouched: ["policy-registry", "zero-trust-audit-ledger"],
    requiredControls: ["state locking", "secret separation", "policy-as-code", "approval", "rollback"],
    humanGate: "Infrastructure owner approval required before apply.",
    blockedAutonomy: ["unapproved apply", "secret hardcoding", "production drift mutation"],
    deliverables: ["IaC module map", "policy checks", "approval pipeline", "rollback plan"],
    acceptanceCriteria: ["IaC plans are reproducible", "Apply is approval-gated", "Secrets are not in source"]
  },
  {
    id: "kubernetes-deployment-engine",
    name: "Kubernetes Deployment Engine",
    domain: "infrastructure",
    phase: "phase-5-deployment-platform",
    readiness: "blocked-before-production",
    objective:
      "Prepare Kubernetes deployment, canary, rollback, policy, runtime security, GPU scheduling, and service health contracts.",
    starterArchitecture: ["Helm/Kustomize manifests generated from approved IaC outputs.", "Admission policy, image scanning, SBOM, resource limits, and network policy are mandatory.", "Canary and rollback are tied to observability and deployment approval."],
    interfaces: ["renderManifests()", "scanImage()", "runCanary()", "rollbackDeployment()"],
    events: ["k8s.manifest.rendered", "k8s.image.scanned", "k8s.canary.started", "k8s.rollback.requested"],
    registriesTouched: ["policy-registry", "model-registry", "zero-trust-audit-ledger"],
    requiredControls: ["image signing", "SBOM", "resource limits", "network policy", "admission control", "rollback"],
    humanGate: "Deployment owner approval required before cluster mutation.",
    blockedAutonomy: ["unapproved cluster mutation", "unsigned images", "unbounded GPU jobs", "PHI workload without approval"],
    deliverables: ["Kubernetes manifest contract", "canary policy", "rollback runbook", "GPU scheduling policy"],
    acceptanceCriteria: ["Manifests scan clean", "Canary gates exist", "Rollback is tested before production"]
  },
  {
    id: "zero-trust-audit-ledger",
    name: "Zero-Trust Audit Ledger",
    domain: "audit",
    phase: "phase-1-governance-backbone",
    readiness: "starter-build-ready",
    objective:
      "Create immutable, tamper-evident audit evidence for identity, policy, model, tool, workflow, evaluation, deployment, and review actions.",
    starterArchitecture: ["Append-only event records with hash chaining and retention policy.", "Ledger stores metadata and hashes, not raw PHI.", "Tamper checks run during release and incident review."],
    interfaces: ["appendAuditEvent()", "verifyAuditChain()", "exportAuditPacket()", "quarantineAuditGap()"],
    events: ["audit.event.appended", "audit.chain.verified", "audit.gap.detected", "audit.packet.exported"],
    registriesTouched: ["policy-registry", "agent-registry", "model-registry", "evaluation-registry"],
    requiredControls: ["append-only", "hash chain", "tenant boundary", "retention", "export redaction"],
    humanGate: "Compliance/security owner review required for audit gaps or export packets.",
    blockedAutonomy: ["audit deletion", "raw PHI audit payloads", "unaudited protected action"],
    deliverables: ["Ledger schema", "hash-chain verifier", "audit export packet", "tamper detection check"],
    acceptanceCriteria: ["Sensitive actions append audit events", "Hash chain verifies", "Audit exports are redacted"]
  },
  {
    id: "sql-fhir-query-validation-middleware",
    name: "SQL/FHIR Query Validation Middleware",
    domain: "security",
    phase: "phase-2-tool-runtime-plane",
    readiness: "requires-protected-pilot",
    objective:
      "Validate generated SQL, FHIR search, and transformation requests before any database or system-of-record access.",
    starterArchitecture: ["LLMs may draft queries but cannot execute them.", "Middleware parses, classifies, policy-checks, bounds, and explains queries.", "Only approved service accounts can run validated read paths."],
    interfaces: ["validateSql()", "validateFhirSearch()", "explainQueryRisk()", "denyUnsafeQuery()"],
    events: ["query.validation.requested", "query.validation.passed", "query.validation.denied", "query.validation.review_required"],
    registriesTouched: ["policy-registry", "zero-trust-audit-ledger"],
    requiredControls: [noDirectDatabaseControl, "parameterization", "read/write classification", "row/tenant policy", "rate limit"],
    humanGate: "Data owner approval required before high-risk queries or any write-like operation.",
    blockedAutonomy: ["direct SQL execution", "cross-tenant query", "write query", "PHI extraction without approval"],
    deliverables: ["Query parser contract", "risk classifier", "denylist/allowlist policy", "explainability output"],
    acceptanceCriteria: ["Unsafe query fails closed", "Generated queries are proposals", "Tenant boundaries are enforced"]
  },
  {
    id: "deployment-approval-pipeline",
    name: "Deployment Approval Pipeline",
    domain: "infrastructure",
    phase: "phase-5-deployment-platform",
    readiness: "starter-build-ready",
    objective:
      "Gate deployments through tests, security scans, evals, drift checks, human approvals, canaries, blast-radius controls, and rollback.",
    starterArchitecture: ["Release candidate collects build, lint, typecheck, tests, smokes, SBOM, vulnerability scan, eval status, and risk approvals.", "Protected releases require named owner signoff.", "Canary and rollback are first-class."],
    interfaces: ["createReleaseCandidate()", "evaluateReleaseGate()", "approveDeployment()", "rollbackRelease()"],
    events: ["deployment.candidate.created", "deployment.gate.failed", "deployment.approved", "deployment.rollback.started"],
    registriesTouched: ["policy-registry", "evaluation-registry", "zero-trust-audit-ledger"],
    requiredControls: ["CI checks", "secret scanning", "SBOM", "eval gates", "manual approval", "rollback"],
    humanGate: "Release owner approval required before protected environment promotion.",
    blockedAutonomy: ["unapproved production deploy", "failed eval promotion", "missing rollback"],
    deliverables: ["Release evidence schema", "approval workflow", "canary policy", "rollback runbook"],
    acceptanceCriteria: ["Failed gates block deploy", "Approvals are audited", "Rollback path is tested"]
  },
  {
    id: "secure-rag-data-ingestion-pipeline",
    name: "Secure RAG/Data Ingestion Pipeline",
    domain: "security",
    phase: "phase-2-tool-runtime-plane",
    readiness: "requires-protected-pilot",
    objective:
      "Ingest documents and data for retrieval while preserving structure, provenance, citations, redaction, malware checks, and policy boundaries.",
    starterArchitecture: ["Document parser preserves pages, tables, labels, values, units, citations, images, and references.", "Chunks store source spans and evidence hashes.", "Prompt-injection, PHI, and poisoning checks run before indexing."],
    interfaces: ["ingestDocument()", "extractStructure()", "redactSensitiveData()", "indexEvidenceChunk()", "verifyCitation()"],
    events: ["rag.ingestion.started", "rag.structure.extracted", "rag.redaction.applied", "rag.indexing.blocked"],
    registriesTouched: ["policy-registry", "evaluation-registry", "zero-trust-audit-ledger"],
    requiredControls: ["PHI detection", "malware scan placeholder", "prompt-injection detection", "source provenance", "citation verification"],
    humanGate: "Data owner approval required before indexing customer or clinical corpora.",
    blockedAutonomy: ["unapproved PHI indexing", "structure-stripping ingestion", "citationless retrieval", "RAG poisoning"],
    deliverables: ["Ingestion schema", "structure-preserving extractor contract", "redaction pipeline", "citation verifier"],
    acceptanceCriteria: ["Structure is preserved", "Untrusted instructions are flagged", "Indexing is blocked on PHI/policy violations"]
  },
  {
    id: "human-in-the-loop-clinical-safety-sandbox",
    name: "Human-in-the-loop Clinical Safety Sandbox",
    domain: "clinical-workflow",
    phase: "phase-3-clinical-data-workflows",
    readiness: "starter-build-ready",
    objective:
      "Create a sandbox where clinical workflows, agents, prompts, models, FHIR transforms, and QA findings can be reviewed before any protected use.",
    starterArchitecture: ["Synthetic/no-PHI cases only by default.", "Reviewer queues capture decisions, uncertainty, escalation criteria, and blocked actions.", "Sandbox outcomes feed evaluation registry, not live care."],
    interfaces: ["createSandboxCase()", "requestClinicalReview()", "recordReviewerDecision()", "promoteSandboxFindingToEval()"],
    events: ["sandbox.case.created", "sandbox.review.requested", "sandbox.decision.recorded", "sandbox.finding.promoted_to_eval"],
    registriesTouched: ["evaluation-registry", "policy-registry", "agent-registry", "prompt-registry"],
    requiredControls: ["no-PHI fixtures", "reviewer identity", "clinical risk label", "evidence card", "escalation criteria"],
    humanGate: noLiveClinicalGate,
    blockedAutonomy: ["live patient care", "diagnosis", "treatment", "prescribing", "patient outreach"],
    deliverables: ["Sandbox case schema", "review queue", "decision packet", "eval promotion path"],
    acceptanceCriteria: ["Review required for clinical-like output", "Sandbox cannot contact patients or write records", "Findings feed eval registry"]
  }
];

export const scrimedOSAgentBacklog: ScrimedOSAgentSpec[] = [
  {
    name: "Clinical Intake Agent",
    purpose:
      "Collect synthetic or approved intake context, classify missing evidence, and create reviewer-ready intake packets.",
    identityScope: "clinical-intake:read-synthetic-context:write-review-packet",
    allowedTools: ["synthetic-context-reader", "evidence-card-builder", "review-queue-writer"],
    deniedTools: ["ehr-writeback", "patient-messaging", "diagnosis-finalizer"],
    requiredEvidence: ["source references", "missing-data checklist", "risk label", "reviewer queue"],
    humanEscalation: "Escalate any clinical ambiguity, PHI-like input, or protected action to clinical review.",
    firstMilestone: "Synthetic intake packet with evidence, limitations, confidence, and escalation criteria."
  },
  {
    name: "FHIR Validation Agent",
    purpose:
      "Explain deterministic FHIR validation results, propose safe transformations, and route invalid resources to interoperability review.",
    identityScope: "fhir-validation:read-fixture:write-validation-report",
    allowedTools: ["fhir-profile-validator", "terminology-checker", "validation-report-writer"],
    deniedTools: ["fhir-writeback", "production-ehr-search", "patient-merge"],
    requiredEvidence: ["resource type", "profile", "terminology result", "validation errors"],
    humanEscalation: "Escalate profile conflicts, live connector requests, or write-like operations to interoperability owner.",
    firstMilestone: "No-PHI FHIR validation report with errors, severity, and remediation proposal."
  },
  {
    name: "Imaging Integration Agent",
    purpose:
      "Validate synthetic imaging metadata/report evidence and route imaging tasks to specialist review without diagnostic authority.",
    identityScope: "imaging-integration:read-synthetic-report:write-review-packet",
    allowedTools: ["dicom-metadata-validator", "imaging-report-parser", "specialist-review-queue"],
    deniedTools: ["pacs-writeback", "diagnostic-finalizer", "pixel-data-ingestion"],
    requiredEvidence: ["modality", "report source", "comparison status", "specialist review requirement"],
    humanEscalation: "Escalate all interpretation-like findings to radiology or domain specialist review.",
    firstMilestone: "Synthetic imaging metadata and report validation packet."
  },
  {
    name: "Clinical QA Agent",
    purpose:
      "Score clinical-like drafts for evidence, hallucination, missing-data, guideline, bias, freshness, and reviewer-gate quality.",
    identityScope: "clinical-qa:read-draft:write-scorecard",
    allowedTools: ["clinical-robustness-scorecard", "citation-checker", "risk-rubric-evaluator"],
    deniedTools: ["clinical-finalizer", "patient-facing-publisher", "orders"],
    requiredEvidence: ["citations", "limitations", "confidence", "review status", "clinical risk level"],
    humanEscalation: "Escalate any failed or high-risk scorecard to clinical governance review.",
    firstMilestone: "Clinical QA scorecard bound to execution-attempt evidence."
  },
  {
    name: "Patient Engagement Agent",
    purpose:
      "Draft general education and engagement materials for review while blocking outreach and patient-specific advice.",
    identityScope: "patient-engagement:read-approved-education:write-draft",
    allowedTools: ["approved-education-library", "plain-language-checker", "review-queue-writer"],
    deniedTools: ["patient-messaging", "treatment-advice", "appointment-scheduler"],
    requiredEvidence: ["general education label", "source references", "language level", "reviewer signoff state"],
    humanEscalation: "Escalate patient-specific context, outreach requests, or treatment language to qualified human review.",
    firstMilestone: "Reviewed, general-education draft with no outreach authority."
  },
  {
    name: "Configuration Drift Agent",
    purpose:
      "Compare desired and observed platform configuration, redact secrets, and create owner-routed drift findings.",
    identityScope: "config-drift:read-metadata:write-drift-finding",
    allowedTools: ["config-snapshot-reader", "drift-diff-engine", "owner-router"],
    deniedTools: ["secret-reader", "production-mutator", "policy-editor"],
    requiredEvidence: ["desired state hash", "observed state hash", "severity", "owner"],
    humanEscalation: "Escalate high-severity drift to platform owner and deployment pipeline.",
    firstMilestone: "Read-only drift report with deployment block recommendation."
  },
  {
    name: "AI Cost Intelligence Agent",
    purpose:
      "Monitor model/tool usage, detect cost anomalies, and recommend budget-safe routing changes.",
    identityScope: "ai-cost:read-usage:write-cost-recommendation",
    allowedTools: ["usage-meter", "budget-policy-evaluator", "cost-dashboard-writer"],
    deniedTools: ["provider-route-mutator", "budget-overrider", "secret-reader"],
    requiredEvidence: ["model route", "tokens", "estimated cost", "tenant quota", "threshold decision"],
    humanEscalation: "Escalate threshold breaches to finance/platform owner.",
    firstMilestone: "Cost anomaly event and route recommendation packet."
  },
  {
    name: "Autonomous Remediation Agent",
    purpose:
      "Draft evidence-linked remediation plans while leaving execution blocked until human approval.",
    identityScope: "remediation:read-incident:write-plan",
    allowedTools: ["incident-reader", "blast-radius-estimator", "rollback-plan-builder"],
    deniedTools: ["production-mutator", "cluster-admin", "policy-editor"],
    requiredEvidence: ["incident trace", "blast radius", "rollback", "approval owner"],
    humanEscalation: "Escalate all execution requests to deployment approval pipeline.",
    firstMilestone: "Suggestion-only remediation packet with blocked execution state."
  }
];

function unique<T>(values: T[]) {
  return Array.from(new Set(values));
}

export function validateScrimedOSImplementationPlan(): {
  status: "pass" | "fail";
  checks: ScrimedOSValidationCheck[];
} {
  const capabilityIds = new Set(scrimedOSCapabilities.map((capability) => capability.id));
  const requiredCapabilities = [
    "event-mesh",
    "agent-identity-registry",
    "secure-mcp-gateway",
    "codemode-runtime",
    "clinical-workflow-orchestrator",
    "agent-registry",
    "prompt-registry",
    "policy-registry",
    "model-registry",
    "evaluation-registry",
    "fhir-validation-agent",
    "imaging-integration-layer",
    "configuration-drift-agent",
    "ai-cost-intelligence-agent",
    "observability-platform",
    "autonomous-remediation-agent",
    "clinical-qa-engine",
    "continuous-outcome-learning-engine",
    "infrastructure-as-code-engine",
    "kubernetes-deployment-engine",
    "zero-trust-audit-ledger",
    "sql-fhir-query-validation-middleware",
    "deployment-approval-pipeline",
    "secure-rag-data-ingestion-pipeline",
    "human-in-the-loop-clinical-safety-sandbox"
  ];
  const registries = scrimedOSCapabilities.filter((capability) => capability.domain === "registry");
  const checks: ScrimedOSValidationCheck[] = [
    {
      check: "all-requested-capabilities-mapped",
      passed:
        requiredCapabilities.length === 25 &&
        requiredCapabilities.every((capabilityId) => capabilityIds.has(capabilityId)),
      detail: "All 25 requested SCRIMED OS capabilities must be represented in the roadmap."
    },
    {
      check: "event-driven-by-default",
      passed: scrimedOSCapabilities.every((capability) => capability.events.length > 0),
      detail: "Every capability must emit at least one auditable event."
    },
    {
      check: "zero-trust-agent-identity",
      passed:
        capabilityIds.has("agent-identity-registry") &&
        scrimedOSCapabilities.some((capability) =>
          capability.requiredControls.some((control) => control.toLowerCase().includes("least privilege"))
        ),
      detail: "Agent identity, least privilege, revocation, scopes, and trust scores are first-class."
    },
    {
      check: "no-direct-llm-database-access",
      passed:
        scrimedOSArchitecturePrinciples.includes("No direct LLM-to-database access.") &&
        scrimedOSCapabilities.some((capability) =>
          capability.requiredControls.some((control) => control.includes("LLM output cannot execute direct SQL"))
        ),
      detail: "Generated SQL/FHIR queries must pass validation middleware before access."
    },
    {
      check: "registries-covered",
      passed:
        registries.length >= 5 &&
        ["agent-registry", "prompt-registry", "policy-registry", "model-registry", "evaluation-registry"].every(
          (capabilityId) => capabilityIds.has(capabilityId)
        ),
      detail: "Agent, prompt, policy, model, and evaluation registries are explicit."
    },
    {
      check: "human-in-the-loop-clinical-safety",
      passed:
        capabilityIds.has("human-in-the-loop-clinical-safety-sandbox") &&
        scrimedOSCapabilities
          .filter((capability) => capability.domain === "clinical-workflow" || capability.domain === "qa")
          .every((capability) => capability.humanGate.toLowerCase().includes("human")),
      detail: "Clinical-like outputs remain review-gated and cannot become autonomous care."
    },
    {
      check: "secure-rag-preserves-structure",
      passed: scrimedOSCapabilities
        .find((capability) => capability.id === "secure-rag-data-ingestion-pipeline")
        ?.starterArchitecture.join(" ").includes("pages, tables, labels, values, units, citations, images, and references") ?? false,
      detail: "RAG ingestion must preserve document structure and provenance."
    },
    {
      check: "agent-backlog-includes-patient-safety-surface",
      passed: scrimedOSAgentBacklog.some((agent) => agent.name === "Patient Engagement Agent"),
      detail: "The truncated Patient agent request is safely modeled as review-gated patient engagement with no outreach authority."
    },
    {
      check: "production-mutation-blocked",
      passed: scrimedOSCapabilities.every((capability) => capability.blockedAutonomy.length > 0),
      detail: "Every capability names blocked autonomous behavior before production approval."
    }
  ];

  return {
    status: checks.every((check) => check.passed) ? "pass" : "fail",
    checks
  };
}

export function getScrimedOSImplementationPlanSummary() {
  const validation = validateScrimedOSImplementationPlan();
  const capabilitiesByPhase = scrimedOSRoadmap.map((phase) => ({
    ...phase,
    capabilities: scrimedOSCapabilities.filter((capability) => capability.phase === phase.phase)
  }));
  const domains = unique(scrimedOSCapabilities.map((capability) => capability.domain));

  return {
    service: "scrimed-os-implementation-plan",
    route: scrimedOSImplementationPlanRoute,
    apiRoute: scrimedOSImplementationPlanApiRoute,
    status: scrimedOSImplementationPlanStatus,
    updated: scrimedOSImplementationPlanUpdatedAt,
    boundary: scrimedOSOperatingBoundary,
    strategy:
      "SCRIMED should operate as a Healthcare Intelligence Operating System that securely orchestrates frontier models, agents, clinical workflows, FHIR/EHR data, imaging systems, memory, governance, auditability, outcome tracking, and enterprise deployment.",
    currentGoScope:
      "GO for no-PHI architecture planning, synthetic workflow design, registry contracts, event contracts, and investor/buyer technical diligence.",
    noGoScope:
      "NO-GO for live PHI, autonomous clinical care, direct LLM database access, patient outreach, payer submission, EHR writeback, production connector use, cluster mutation, clinical validation, certification, or customer go-live.",
    principles: scrimedOSArchitecturePrinciples,
    roadmap: scrimedOSRoadmap,
    capabilities: scrimedOSCapabilities,
    capabilitiesByPhase,
    agentsToBuild: scrimedOSAgentBacklog,
    capabilityCount: scrimedOSCapabilities.length,
    phaseCount: scrimedOSRoadmap.length,
    domainCount: domains.length,
    agentCount: scrimedOSAgentBacklog.length,
    registryCapabilityCount: scrimedOSCapabilities.filter((capability) => capability.domain === "registry").length,
    eventCount: unique(scrimedOSCapabilities.flatMap((capability) => capability.events)).length,
    validation,
    starterRepositoryLayout: [
      "app/lib/scrimedOSImplementationPlan.ts for typed architecture contracts.",
      "app/api/scrimed-os/implementation-plan/route.ts for machine-readable roadmap.",
      "app/scrimed-os/page.tsx for executive, engineering, and investor review.",
      "packages/event-mesh for future event envelope, outbox, broker adapters, and replay.",
      "packages/agent-runtime for identity, scopes, CodeMode, MCP gateway clients, and traces.",
      "packages/registries for agent, prompt, policy, model, and evaluation registry schemas.",
      "packages/clinical-workflows for deterministic orchestrator, FHIR validation, imaging contracts, and clinical QA.",
      "infra/ for IaC, Kubernetes, policy-as-code, canary, and rollback templates."
    ],
    nextImplementationStep:
      "Build the Event Mesh plus Agent Identity Registry first, then bind Secure MCP Gateway and CodeMode Runtime to those identities before any clinical workflow or data connector receives tool access."
  };
}

export function buildScrimedOSImplementationPlanBrief() {
  const summary = getScrimedOSImplementationPlanSummary();

  return [
    "# SCRIMED OS Implementation Plan",
    "",
    `Status: ${summary.status}`,
    `Updated: ${summary.updated}`,
    "",
    "## Strategy",
    summary.strategy,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "## GO / NO-GO",
    `- ${summary.currentGoScope}`,
    `- ${summary.noGoScope}`,
    "",
    "## Architecture Principles",
    ...summary.principles.map((principle) => `- ${principle}`),
    "",
    "## Roadmap",
    ...summary.roadmap.map(
      (phase) => `- ${phase.label}: ${phase.objective} Exit: ${phase.exitCriteria.join("; ")}`
    ),
    "",
    "## Capabilities",
    ...summary.capabilities.map(
      (capability) =>
        `- ${capability.name}: ${capability.phase}; ${capability.readiness}; ${capability.objective}`
    ),
    "",
    "## Agents To Build",
    ...summary.agentsToBuild.map(
      (agent) => `- ${agent.name}: ${agent.purpose} First milestone: ${agent.firstMilestone}`
    ),
    "",
    "## Starter Repository Layout",
    ...summary.starterRepositoryLayout.map((item) => `- ${item}`),
    "",
    "## Validation",
    ...summary.validation.checks.map((check) => `- ${check.passed ? "PASS" : "FAIL"} ${check.check}: ${check.detail}`),
    "",
    "## Next Implementation Step",
    summary.nextImplementationStep,
    ""
  ].join("\n");
}
