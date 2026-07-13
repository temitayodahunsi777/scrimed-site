import {
  buildScrimedDynamicContextManifest,
  validateScrimedDynamicContextManifest,
  scrimedDynamicContextInjectionApiRoute,
  scrimedDynamicContextInjectionSchemaVersion
} from "./scrimedDynamicContextInjection";
import { scrimedSafetyPolicyVersion } from "./scrimedSafetyGovernance";

export type StrategicExecutionStatus =
  | "synthetic-control-plane-ready"
  | "protected-pilot-prep"
  | "blocked-before-production";

export type StoredVectorLookupDomain =
  | "patient-matching"
  | "document-similarity"
  | "clinical-retrieval"
  | "payer-policy-lookup"
  | "recommendation-search";

export type StoredVectorLookupPlan = {
  domain: StoredVectorLookupDomain;
  currentAntiPattern: string;
  replacementPattern: string;
  internalRpcContract: string;
  latencyWin: string;
  safetyBoundary: string;
  migrationGate: string;
};

export type StoredVectorLookupBackendReadiness = {
  status: "migration-applied-live-db-verified";
  migration: string;
  storageBoundary: string;
  rpcContracts: string[];
  safetyControls: string[];
  pendingOperationalStep: string;
};

export type AiUsageLogField = {
  field: string;
  captureMode: "required" | "required-redacted" | "derived" | "future-approved";
  purpose: string;
};

export type HealthcareObservabilitySlice = {
  dimension: string;
  syntheticMetric: string;
  degradationSignal: string;
  reviewOwner: string;
  productionGate: string;
};

export type GovernedWorkflowOrchestrationLane = {
  lane: string;
  patientIntent: string;
  governedActions: string[];
  approvalGate: string;
  blockedAutomation: string[];
  speedControl: string;
};

export type InvestorIntelligenceTrack = {
  track: string;
  observedSignal: string;
  scrimedNarrativeUse: string;
  dataToTrack: string[];
  boundary: string;
};

export type InferenceEfficiencyBacklogItem = {
  item: string;
  target: string;
  trackedMetrics: string[];
  readinessState: StrategicExecutionStatus;
  boundary: string;
};

export type PrescriptionEngagementWorkflowStep = {
  step: string;
  trigger: string;
  safeOutput: string;
  humanGate: string;
  blockedAction: string;
};

export type MlflowStyleEvaluationLayer = {
  registry: string;
  purpose: string;
  requiredFields: string[];
  releaseGate: string;
};

export type StrategicExecutionValidationCheck = {
  check: string;
  passed: boolean;
  detail: string;
};

export const scrimedStrategicExecutionApiRoute =
  "/api/scrimed-build-roadmap/strategic-execution";
export const scrimedStrategicExecutionBriefRoute =
  "/api/scrimed-build-roadmap/strategic-execution/brief";
export const scrimedStrategicExecutionStatus =
  "scrimed-strategic-execution-layer-ready-no-phi";

export const scrimedStrategicMantra =
  "SCRIMED must be measurable, governed, observable, faster, cheaper, safer, and harder to copy.";

export const scrimedStrategicExecutionBoundary =
  "SCRIMED Strategic Execution Layer is a synthetic/no-PHI operating blueprint. It does not authorize live PHI, autonomous diagnosis, treatment, prescribing, patient outreach, payer submission, billing submission, EHR writeback, production connector use, investment advice, valuation claims, clinical validation claims, compliance claims, or customer go-live.";

export const storedVectorLookupBackendReadiness: StoredVectorLookupBackendReadiness = {
  status: "migration-applied-live-db-verified",
  migration: "supabase/migrations/20260630173000_scrimed_stored_vector_lookup_rpc.sql",
  storageBoundary:
    "Private-schema synthetic/no-PHI pgvector registry with deny-all RLS, no direct table grants, metadata-only lookup events, and no raw embedding return from search RPCs.",
  rpcContracts: [
    "register_scrimed_synthetic_stored_vector",
    "scrimed_match_stored_vector",
    "scrimed_search_similar_documents",
    "scrimed_search_clinical_evidence",
    "scrimed_search_payer_policy",
    "scrimed_search_recommendation_memory"
  ],
  safetyControls: [
    "AAL2 governance session required",
    "server runtime token required",
    "tenant-admin/pilot-lead registration only",
    "tenant-admin/pilot-lead/reviewer lookup only",
    "synthetic_only and no_phi_assertion enforced",
    "PHI/secret/prohibited-claim text guard",
    "human review required",
    "no live PHI, clinical care, payer submission, billing submission, outreach, or EHR writeback authority"
  ],
  pendingOperationalStep:
    "Run the authenticated stored-vector RPC smoke with a short-lived AAL2 tenant-admin or pilot-lead token after the app route is deployed and the protected server token is configured."
};

export const storedVectorLookupPlans: StoredVectorLookupPlan[] = [
  {
    domain: "patient-matching",
    currentAntiPattern:
      "get-then-search vector flow where a client pulls candidate vectors or serialized embeddings before similarity ranking.",
    replacementPattern:
      "internal stored-vector lookup search using a source_vector_id and tenant/workflow scope inside the database/RPC boundary.",
    internalRpcContract:
      "scrimed_match_stored_vector(source_vector_id, tenant_scope, workflow_scope, match_threshold, match_count)",
    latencyWin:
      "Reduces client round trips, embedding serialization, network transfer, and tail-latency variance.",
    safetyBoundary:
      "Synthetic/de-identified matching only; no live patient identity resolution or production patient matching authority.",
    migrationGate:
      "Requires pgvector index review, RLS/tenant predicate, audit event, no service-role browser exposure, and PHI approval before live use."
  },
  {
    domain: "document-similarity",
    currentAntiPattern:
      "download document vectors to app code, then rank or filter outside the evidence store.",
    replacementPattern:
      "store document embeddings with source, page, table, label, value, unit, and citation metadata; search by stored vector internally.",
    internalRpcContract:
      "scrimed_search_similar_documents(source_vector_id, tenant_scope, document_class, match_threshold, match_count)",
    latencyWin:
      "Keeps vector math close to the index and avoids large embedding payload serialization.",
    safetyBoundary:
      "No live chart documents; public, synthetic, or approved de-identified document evidence only.",
    migrationGate:
      "Requires source attribution, document retention policy, RAG poisoning checks, and reviewer-governed ingestion."
  },
  {
    domain: "clinical-retrieval",
    currentAntiPattern:
      "model-driven retrieval that asks an LLM to infer relevant context after broad client-side fetches.",
    replacementPattern:
      "retrieve evidence by stored-vector lookup plus deterministic filters for specialty, freshness, source type, guideline status, and risk level.",
    internalRpcContract:
      "scrimed_search_clinical_evidence(source_vector_id, specialty, evidence_class, freshness_window, match_count)",
    latencyWin:
      "Cuts prompt bloat and improves grounding by returning ranked evidence cards instead of raw context dumps.",
    safetyBoundary:
      "Research/demo only; not diagnosis, treatment, prescribing, or live patient care.",
    migrationGate:
      "Requires clinical evidence steward, freshness policy, citation verification, and qualified reviewer workflow."
    },
  {
    domain: "payer-policy-lookup",
    currentAntiPattern:
      "fetch payer policy text into app memory before similarity and checklist extraction.",
    replacementPattern:
      "internal stored-vector policy lookup scoped by payer, policy version, service line, criteria type, and document status.",
    internalRpcContract:
      "scrimed_search_payer_policy(source_vector_id, payer_scope, policy_version, criteria_scope, match_count)",
    latencyWin:
      "Reduces policy payload movement and keeps policy-version constraints deterministic before model synthesis.",
    safetyBoundary:
      "Recommendation-only; no prior authorization submission, appeal filing, coverage guarantee, or medical-necessity determination.",
    migrationGate:
      "Requires policy source ownership, versioning, reviewer signoff, and payer-action hard stops."
  },
  {
    domain: "recommendation-search",
    currentAntiPattern:
      "searching old recommendations by text snippets without outcome, reviewer, or workflow-state constraints.",
    replacementPattern:
      "stored-vector lookup over prior synthetic recommendations tied to outcome labels, reviewer disposition, workflow state, and blocked actions.",
    internalRpcContract:
      "scrimed_search_recommendation_memory(source_vector_id, workflow_type, reviewer_status, outcome_label, match_count)",
    latencyWin:
      "Improves reuse of validated patterns while keeping bad or unreviewed recommendations from being retrieved as precedent.",
    safetyBoundary:
      "No autonomous recommendation release; retrieved patterns are examples for human-reviewed synthetic workflow planning only.",
    migrationGate:
      "Requires decision-memory retention policy, reviewer outcome labels, and explicit exclusion of hidden chain-of-thought."
  }
];

export const medLogStyleUsageFields: AiUsageLogField[] = [
  { field: "usage_event_id", captureMode: "required", purpose: "Unique event for every model or agent use." },
  { field: "workflow_trace_id", captureMode: "required", purpose: "Link multi-step agent workflows over time." },
  { field: "input_hash", captureMode: "required-redacted", purpose: "Represent input without storing raw PHI, secrets, or credentials." },
  { field: "input_classification", captureMode: "required", purpose: "Record synthetic, metadata-only, de-identified, or blocked input state." },
  { field: "model_provider_and_version", captureMode: "required", purpose: "Track provider, model, adapter, fallback, and registry alias." },
  { field: "output_hash", captureMode: "required-redacted", purpose: "Represent output without unsafe raw capture." },
  { field: "action_taken", captureMode: "required", purpose: "Record draft, recommendation-only, review-queued, blocked, or released state." },
  { field: "user_feedback", captureMode: "required", purpose: "Capture reviewer acceptance, rejection, edit, override, or escalation." },
  { field: "downstream_outcome", captureMode: "derived", purpose: "Attach later outcome labels such as resolved, delayed, denied, escalated, or corrected." },
  { field: "fairness_slice", captureMode: "derived", purpose: "Monitor performance by approved demographic, geography, payer, setting, and workflow slices." },
  { field: "context_effects", captureMode: "derived", purpose: "Track weather/context effects, time-of-day, queue load, and facility operations drift." },
  { field: "clinician_behavior_change", captureMode: "future-approved", purpose: "Measure adoption and override patterns after governance approval." }
];

export const healthcareAiObservabilitySlices: HealthcareObservabilitySlice[] = [
  {
    dimension: "age",
    syntheticMetric: "accuracy_by_age_band",
    degradationSignal: "silent degradation for pediatric, adult, or older-adult synthetic cohorts",
    reviewOwner: "Clinical QA Engine",
    productionGate: "Requires approved demographic data handling and fairness review before live use."
  },
  {
    dimension: "sex",
    syntheticMetric: "accuracy_by_recorded_sex_fixture",
    degradationSignal: "performance delta across synthetic sex-stratified cases",
    reviewOwner: "Clinical Robustness Lab",
    productionGate: "Requires privacy review, bias review, and customer data-use approval."
  },
  {
    dimension: "geography",
    syntheticMetric: "accuracy_by_region_and_service_area",
    degradationSignal: "regional policy, access, or resource mismatch",
    reviewOwner: "Operations Optimization",
    productionGate: "Requires data residency and region-specific governance."
  },
  {
    dimension: "setting",
    syntheticMetric: "accuracy_by_site_of_care",
    degradationSignal: "ambulatory, inpatient, ED, imaging, or call-center workflow drift",
    reviewOwner: "Workflow Orchestrator",
    productionGate: "Requires customer workflow mapping and safety review."
  },
  {
    dimension: "time of day",
    syntheticMetric: "accuracy_by_shift_window",
    degradationSignal: "night/weekend or shift-change reliability drop",
    reviewOwner: "Observability Platform",
    productionGate: "Requires staffing context approval and alert runbooks."
  },
  {
    dimension: "payer",
    syntheticMetric: "accuracy_by_payer_policy_fixture",
    degradationSignal: "payer-rule drift, stale policy, or prior-auth criteria mismatch",
    reviewOwner: "Payer Intelligence",
    productionGate: "Requires policy source contract, version control, and RCM review."
  },
  {
    dimension: "diagnosis",
    syntheticMetric: "accuracy_by_synthetic_condition_family",
    degradationSignal: "condition-specific hallucination or missing-data sensitivity",
    reviewOwner: "ClinicalBench",
    productionGate: "No live diagnosis support without clinical validation and intended-use review."
  },
  {
    dimension: "workflow type",
    syntheticMetric: "accuracy_by_workflow_lane",
    degradationSignal: "silent degradation in scheduling, intake, referral, auth, RCM, support, or documentation workflows",
    reviewOwner: "TrustOps",
    productionGate: "Requires workflow-specific acceptance criteria and human review."
  }
];

export const governedWorkflowOrchestrationLanes: GovernedWorkflowOrchestrationLane[] = [
  {
    lane: "scheduling",
    patientIntent: "I need an appointment or follow-up.",
    governedActions: ["intake completeness check", "capacity-aware option draft", "manual scheduler queue"],
    approvalGate: "care navigator or scheduling operations review before confirmation or outreach",
    blockedAutomation: ["autonomous appointment confirmation", "emergency triage replacement", "patient outreach without consent"],
    speedControl: "prepare ranked options and missing-information packet before human action"
  },
  {
    lane: "intake",
    patientIntent: "I need help getting into the right care path.",
    governedActions: ["synthetic intent classification", "missing-document checklist", "service-line routing recommendation"],
    approvalGate: "patient access review before routing or patient-facing communication",
    blockedAutomation: ["clinical triage", "patient-specific care instruction", "live record mutation"],
    speedControl: "front-load structured intake gaps and owner routing"
  },
  {
    lane: "referrals",
    patientIntent: "My referral needs to move forward.",
    governedActions: ["referral packet readiness", "provider-match readiness", "leakage/delay signal", "closed-loop status packet"],
    approvalGate: "referral coordinator review before scheduling, outreach, or acceptance",
    blockedAutomation: ["autonomous referral acceptance", "patient outreach", "clinical urgency determination"],
    speedControl: "surface delay reasons and next-owner queue"
  },
  {
    lane: "authorizations",
    patientIntent: "My ordered service needs authorization.",
    governedActions: ["policy evidence lookup", "missing-document packet", "review-only prior-auth draft"],
    approvalGate: "RCM or clinical operations reviewer before payer-facing action",
    blockedAutomation: ["payer submission", "coverage guarantee", "medical-necessity determination"],
    speedControl: "reduce packet-prep time while preserving manual verification"
  },
  {
    lane: "RCM",
    patientIntent: "My bill, claim, or denial needs resolution.",
    governedActions: ["denial root-cause signal", "documentation gap packet", "appeal outline draft"],
    approvalGate: "coding, billing, or revenue-cycle reviewer before claim or appeal action",
    blockedAutomation: ["final coding", "billing submission", "appeal filing", "reimbursement guarantee"],
    speedControl: "prioritize workqueues and evidence gaps"
  },
  {
    lane: "outreach",
    patientIntent: "I need education, reminders, or support.",
    governedActions: ["education draft", "adherence-support draft", "manual outreach queue"],
    approvalGate: "authorized human review plus consent before any communication",
    blockedAutomation: ["autonomous patient messaging", "medical advice", "medication change instruction"],
    speedControl: "prepare reviewed drafts immediately after approved trigger"
  },
  {
    lane: "support",
    patientIntent: "I need help navigating the system.",
    governedActions: ["support intent summary", "handoff packet", "owner recommendation"],
    approvalGate: "support or care navigation owner before external action",
    blockedAutomation: ["benefit guarantee", "clinical advice", "identity-dependent action"],
    speedControl: "route to the right owner with context and boundaries"
  }
];

export const investorIntelligenceTracks: InvestorIntelligenceTrack[] = [
  {
    track: "startup verticals",
    observedSignal: "Track ambient documentation, RCM, prior auth, patient access, imaging, research, data infrastructure, and compliance AI categories.",
    scrimedNarrativeUse: "Position SCRIMED as a healthcare intelligence operating system that spans multiple high-value workflow lanes.",
    dataToTrack: ["vertical", "buyer persona", "workflow ROI claim", "regulatory boundary", "integration depth"],
    boundary: "Market intelligence only; not investment advice, valuation assurance, or securities material."
  },
  {
    track: "valuations and raise sizes",
    observedSignal: "Track public funding ranges, stage, geography, lead investor type, traction claims, and diligence artifacts.",
    scrimedNarrativeUse: "Sharpen investor narrative around category breadth, governance depth, and defensibility.",
    dataToTrack: ["stage", "raise size", "valuation range when public", "investor type", "proof assets"],
    boundary: "Requires externally sourced, dated, citeable data before investor-facing use."
  },
  {
    track: "team composition",
    observedSignal: "Track clinical, AI, enterprise sales, security, regulatory, and implementation talent patterns in strong healthcare AI companies.",
    scrimedNarrativeUse: "Guide SCRIMED hiring and advisor roadmap for enterprise diligence.",
    dataToTrack: ["clinical leadership", "AI infrastructure", "security/compliance", "sales/implementation", "scientific advisors"],
    boundary: "Workforce planning only; not HR, legal, compensation, or employment advice."
  },
  {
    track: "best pitch patterns",
    observedSignal: "Track pitches that show measurable workflow impact, governance, integrations, distribution, and credible no-go boundaries.",
    scrimedNarrativeUse: "Make SCRIMED's pitch measurable, governed, observable, faster, cheaper, safer, and harder to copy.",
    dataToTrack: ["headline", "proof metric", "buyer pain", "moat", "safety posture", "commercial motion"],
    boundary: "No unsupported competitor claims or copied positioning."
  },
  {
    track: "market gaps",
    observedSignal: "Identify gaps in cross-workflow orchestration, AI observability, safety governance, private deployment, and outcomes learning.",
    scrimedNarrativeUse: "Frame SCRIMED as the missing operating layer across point solutions.",
    dataToTrack: ["gap", "buyer urgency", "current workaround", "integration blocker", "proof needed"],
    boundary: "Strategic planning only; requires dated evidence before public use."
  }
];

export const inferenceEfficiencyBacklog: InferenceEfficiencyBacklogItem[] = [
  {
    item: "speculative decoding",
    target: "Reduce latency for low-risk synthetic drafting tasks.",
    trackedMetrics: ["latency_ms", "accepted_token_rate", "quality_delta", "cost_per_token"],
    readinessState: "protected-pilot-prep",
    boundary: "No production model runtime change without model registry, eval, rollback, and provider approval."
  },
  {
    item: "block drafting",
    target: "Draft structured sections in parallel for briefs, packets, and workflow summaries.",
    trackedMetrics: ["throughput", "schema_fidelity", "review_edit_rate", "tail_latency_ms"],
    readinessState: "synthetic-control-plane-ready",
    boundary: "Synthetic documents only; no final clinical, payer, or legal output."
  },
  {
    item: "batching",
    target: "Batch low-risk classification and extraction tasks to reduce per-request overhead.",
    trackedMetrics: ["batch_size", "queue_time_ms", "cost_per_workflow", "failure_rate"],
    readinessState: "synthetic-control-plane-ready",
    boundary: "No batching of PHI or time-critical clinical workflows until approved."
  },
  {
    item: "semantic caching",
    target: "Reuse validated synthetic results and evidence cards when context is materially equivalent.",
    trackedMetrics: ["cache_hit_rate", "staleness", "review_override_rate", "cost_saved"],
    readinessState: "synthetic-control-plane-ready",
    boundary: "Never cache PHI, secrets, hidden chain-of-thought, or unreviewed clinical outputs."
  },
  {
    item: "vLLM/TensorRT-style runtime readiness",
    target: "Prepare private/edge deployment pathways for high-throughput local inference.",
    trackedMetrics: ["tokens_per_second", "gpu_utilization", "p95_latency", "quality_score"],
    readinessState: "protected-pilot-prep",
    boundary: "Runtime readiness only; no live PHI inference without private deployment approval."
  }
];

export const prescriptionEngagementWorkflow: PrescriptionEngagementWorkflowStep[] = [
  {
    step: "prescription-event-detected",
    trigger: "Synthetic or future approved prescription-written event.",
    safeOutput: "Medication education packet draft with source references and plain-language questions for clinician/pharmacist review.",
    humanGate: "licensed clinician or pharmacist review before patient-facing use",
    blockedAction: "No autonomous prescription, medication change, pharmacy action, or patient message."
  },
  {
    step: "adherence-barrier-screen",
    trigger: "Post-prescription support workflow opens.",
    safeOutput: "Reviewable barrier checklist for cost, access, pharmacy pickup, language, and understanding.",
    humanGate: "care team or pharmacy support review before outreach",
    blockedAction: "No autonomous adherence counseling or benefit guarantee."
  },
  {
    step: "education-and-followup-draft",
    trigger: "Human-approved engagement path selected.",
    safeOutput: "Draft education and follow-up plan for review, with uncertainty and escalation language.",
    humanGate: "authorized reviewer plus consent before communication",
    blockedAction: "No direct patient outreach, medical advice, or care-plan change."
  },
  {
    step: "closed-loop-receipt-check",
    trigger: "Future approved pharmacy or patient-access status returns.",
    safeOutput: "Task for manual verification when prescription receipt, pickup, or understanding is uncertain.",
    humanGate: "care team review before any action",
    blockedAction: "No production pharmacy verification or patient contact without approved connector and consent."
  }
];

export const mlflowStyleEvaluationLayers: MlflowStyleEvaluationLayer[] = [
  {
    registry: "prompt-registry-production-aliases",
    purpose: "Version prompts, owners, task classes, deployment aliases, safety notes, and rollback targets.",
    requiredFields: ["prompt_id", "version", "alias", "owner", "task_class", "approved_data_boundary", "rollback_version"],
    releaseGate: "Alias cannot become production-facing without eval pass, reviewer signoff, and safety policy approval."
  },
  {
    registry: "trace-registry-with-sme-ground-truth",
    purpose: "Link model/agent traces to SME expectations, reviewer outcome, workflow state, and downstream outcome.",
    requiredFields: ["trace_id", "workflow_trace_id", "sme_expected_output", "reviewer_disposition", "outcome_label"],
    releaseGate: "Trace must exclude PHI/secrets and include SME expectation before regression use."
  },
  {
    registry: "custom-judge-and-deterministic-scorer-registry",
    purpose: "Combine judges with deterministic schema, evidence, citation, policy, and operational-accuracy scorers.",
    requiredFields: ["judge_id", "deterministic_scorers", "rubric", "failure_action", "human_review_required"],
    releaseGate: "Model self-verification is never sufficient for release."
  },
  {
    registry: "rag-evaluation-registry",
    purpose: "Evaluate retrieval precision, citation support, source freshness, contradiction handling, and context leakage.",
    requiredFields: ["retrieval_set_id", "source_ids", "citation_support_score", "freshness_score", "leakage_flag"],
    releaseGate: "RAG output blocks when evidence is stale, unsupported, contradictory, or unsafe."
  },
  {
    registry: "model-comparison-registry",
    purpose: "Compare models by quality, latency, cost, token use, reviewer override rate, and safety escalations.",
    requiredFields: ["model_id", "prompt_alias", "cost_per_token", "latency_ms", "quality_score", "override_rate"],
    releaseGate: "Promotion requires better or equal safety, quality, and cost posture with rollback support."
  }
];

export function buildAgentRuntimeContextBridge() {
  const manifest = buildScrimedDynamicContextManifest({
    requestedAction:
      "synthetic agent runtime workflow planner pre-run packet with patient intent orchestration, vector lookup readiness, AI usage logging, healthcare observability, MLflow-style evaluation, and human approval gates",
    cadence: "pre-agent-run",
    taskReminderVersion: 2
  });
  const manifestValidation = validateScrimedDynamicContextManifest(manifest);

  return {
    service: "scrimed-agent-runtime-context-bridge",
    status:
      manifest.status === "ready-for-synthetic-agent-run" &&
      manifestValidation.status === "pass"
        ? "pre-run-packet-required"
        : "blocked-before-agent-run",
    requiredForEverySyntheticAgentRun: true,
    workflowPlannerContract:
      "Workflow Planner must consume the context manifest before choosing agents, tools, retrieval, model route, workflow steps, or approval gates.",
    agentRuntimeContract:
      "Agent Runtime must bind manifest hash, selected modules, validators, task reminders, omitted context, and safety decision into each agent run trace.",
    contextManifestRoute: scrimedDynamicContextInjectionApiRoute,
    contextManifestSchema: scrimedDynamicContextInjectionSchemaVersion,
    manifestHash: manifest.audit.manifestHash,
    selectedModuleIds: manifest.selectedModules.map((module) => module.id),
    validatorIds: manifest.validators.map((validator) => validator.id),
    activeTaskReminderIds: manifest.activeTaskReminders.map((reminder) => reminder.id),
    omittedContextIds: manifest.omittedContext.map((item) => item.id),
    safetyDecision: manifest.safetyDecision.status,
    safetyPolicyVersion: scrimedSafetyPolicyVersion,
    manifestValidation,
    failClosed:
      "Block agent planning when context manifest is missing, invalid, policy-blocked, PHI-bearing, secret-bearing, or missing human-review validators."
  };
}

export function validateScrimedStrategicExecutionLayer() {
  const bridge = buildAgentRuntimeContextBridge();
  const checks: StrategicExecutionValidationCheck[] = [
    {
      check: "context-manifest-required-before-agent-run",
      passed:
        bridge.requiredForEverySyntheticAgentRun &&
        bridge.status === "pre-run-packet-required" &&
        bridge.manifestValidation.status === "pass",
      detail: "Agent Runtime and Workflow Planner must receive a valid context manifest before any synthetic agent run."
    },
    {
      check: "stored-vector-lookup-covers-five-domains",
      passed:
        storedVectorLookupPlans.length === 5 &&
        storedVectorLookupPlans.every((plan) => plan.replacementPattern.includes("stored-vector lookup")) &&
        storedVectorLookupPlans.every((plan) => plan.internalRpcContract.includes("source_vector_id")),
      detail: "Patient matching, document similarity, clinical retrieval, payer-policy lookup, and recommendation search must use internal stored-vector lookup contracts."
    },
    {
      check: "stored-vector-lookup-backend-migration-applied",
      passed:
        storedVectorLookupBackendReadiness.status === "migration-applied-live-db-verified" &&
        storedVectorLookupBackendReadiness.rpcContracts.includes("scrimed_match_stored_vector") &&
        storedVectorLookupBackendReadiness.rpcContracts.includes("scrimed_search_recommendation_memory") &&
        storedVectorLookupBackendReadiness.safetyControls.some((control) => control.includes("AAL2")),
      detail: "Stored-vector lookup has a migration-backed RPC contract with tenant-scoped AAL2 controls applied in the linked live database."
    },
    {
      check: "medlog-usage-fields-cover-input-model-output-action-feedback-outcome",
      passed:
        ["input_hash", "model_provider_and_version", "output_hash", "action_taken", "user_feedback", "downstream_outcome"].every((field) =>
          medLogStyleUsageFields.some((item) => item.field === field)
        ),
      detail: "Every model/agent use must be traceable across input, model, output, action, feedback, and downstream outcome."
    },
    {
      check: "healthcare-observability-covers-required-slices",
      passed:
        ["age", "sex", "geography", "setting", "time of day", "payer", "diagnosis", "workflow type"].every((dimension) =>
          healthcareAiObservabilitySlices.some((slice) => slice.dimension === dimension)
        ),
      detail: "Observability must monitor accuracy and silent degradation across healthcare slices."
    },
    {
      check: "agentic-workflow-orchestration-human-gated",
      passed:
        governedWorkflowOrchestrationLanes.length >= 7 &&
        governedWorkflowOrchestrationLanes.every((lane) => lane.approvalGate.length > 0 && lane.blockedAutomation.length > 0),
      detail: "Patient intent to action lanes must preserve approval gates and blocked automation."
    },
    {
      check: "investor-intelligence-report-tracks-market-signals-with-boundaries",
      passed:
        investorIntelligenceTracks.length >= 5 &&
        investorIntelligenceTracks.every((track) => track.boundary.includes("not investment advice") || track.boundary.includes("Requires externally sourced")),
      detail: "Investor intelligence must track market signals without becoming investment advice or unsupported valuation material."
    },
    {
      check: "inference-efficiency-backlog-tracks-cost-latency-throughput-quality",
      passed:
        inferenceEfficiencyBacklog.length >= 5 &&
        inferenceEfficiencyBacklog.some((item) => item.item === "speculative decoding") &&
        inferenceEfficiencyBacklog.some((item) => item.item === "vLLM/TensorRT-style runtime readiness") &&
        inferenceEfficiencyBacklog.some((item) => item.trackedMetrics.includes("cost_per_token")),
      detail: "Inference optimization backlog must track cost, latency, throughput, and quality."
    },
    {
      check: "prescription-engagement-review-gated-no-outreach",
      passed:
        prescriptionEngagementWorkflow.length >= 4 &&
        prescriptionEngagementWorkflow.every((step) => step.humanGate.length > 0 && step.blockedAction.includes("No")),
      detail: "Prescription engagement must create education/adherence drafts only and block autonomous outreach or medication action."
    },
    {
      check: "mlflow-style-evaluation-layer-present",
      passed:
        mlflowStyleEvaluationLayers.length >= 5 &&
        mlflowStyleEvaluationLayers.some((layer) => layer.registry === "prompt-registry-production-aliases") &&
        mlflowStyleEvaluationLayers.some((layer) => layer.registry === "trace-registry-with-sme-ground-truth") &&
        mlflowStyleEvaluationLayers.some((layer) => layer.registry === "rag-evaluation-registry"),
      detail: "Evaluation layer must include prompt aliases, SME-ground-truth traces, judges/scorers, RAG eval, and model comparison."
    },
    {
      check: "strategic-mantra-enforced",
      passed: scrimedStrategicMantra.includes("measurable, governed, observable, faster, cheaper, safer, and harder to copy"),
      detail: "Strategic mantra must remain explicit in the control surface."
    }
  ];

  return {
    status: checks.every((check) => check.passed) ? "pass" : "fail",
    checks
  };
}

export function getScrimedStrategicExecutionLayerSummary() {
  const agentRuntimeContextBridge = buildAgentRuntimeContextBridge();
  const validation = validateScrimedStrategicExecutionLayer();

  return {
    service: "scrimed-strategic-execution-layer",
    status: scrimedStrategicExecutionStatus,
    apiRoute: scrimedStrategicExecutionApiRoute,
    briefRoute: scrimedStrategicExecutionBriefRoute,
    mantra: scrimedStrategicMantra,
    boundary: scrimedStrategicExecutionBoundary,
    agentRuntimeContextBridge,
    storedVectorLookupBackendReadiness,
    storedVectorLookupPlans,
    medLogStyleUsageFields,
    healthcareAiObservabilitySlices,
    governedWorkflowOrchestrationLanes,
    investorIntelligenceTracks,
    inferenceEfficiencyBacklog,
    prescriptionEngagementWorkflow,
    mlflowStyleEvaluationLayers,
    validation,
    recommendedNextBuildStep:
      "Attach the agent-runtime context bridge to the AgentOS task POST response and then add protected durable usage-log persistence after no-PHI/AAL2 storage approval."
  };
}

export function buildScrimedStrategicExecutionBrief() {
  const summary = getScrimedStrategicExecutionLayerSummary();

  return [
    "# SCRIMED Strategic Execution Layer",
    "",
    `Status: ${summary.status}`,
    `API: ${summary.apiRoute}`,
    "",
    "## Mantra",
    summary.mantra,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "## Agent Runtime Context Bridge",
    `- Required: ${summary.agentRuntimeContextBridge.requiredForEverySyntheticAgentRun}`,
    `- Status: ${summary.agentRuntimeContextBridge.status}`,
    `- Manifest hash: ${summary.agentRuntimeContextBridge.manifestHash}`,
    `- Fail closed: ${summary.agentRuntimeContextBridge.failClosed}`,
    "",
    "## Stored-Vector Lookup Search",
    `Backend: ${summary.storedVectorLookupBackendReadiness.status}`,
    `Migration: ${summary.storedVectorLookupBackendReadiness.migration}`,
    `Storage boundary: ${summary.storedVectorLookupBackendReadiness.storageBoundary}`,
    ...summary.storedVectorLookupPlans.map(
      (plan) => `- ${plan.domain}: ${plan.internalRpcContract}; ${plan.latencyWin}`
    ),
    "",
    "## MedLog-Style AI Usage Logging",
    ...summary.medLogStyleUsageFields.map(
      (field) => `- ${field.field}: ${field.captureMode}; ${field.purpose}`
    ),
    "",
    "## Healthcare AI Observability",
    ...summary.healthcareAiObservabilitySlices.map(
      (slice) => `- ${slice.dimension}: ${slice.syntheticMetric}; ${slice.degradationSignal}`
    ),
    "",
    "## Governed Workflow Orchestration",
    ...summary.governedWorkflowOrchestrationLanes.map(
      (lane) => `- ${lane.lane}: ${lane.patientIntent}; gate ${lane.approvalGate}`
    ),
    "",
    "## Investor Intelligence",
    ...summary.investorIntelligenceTracks.map(
      (track) => `- ${track.track}: ${track.scrimedNarrativeUse}`
    ),
    "",
    "## Inference Efficiency",
    ...summary.inferenceEfficiencyBacklog.map(
      (item) => `- ${item.item}: ${item.target}; metrics ${item.trackedMetrics.join(", ")}`
    ),
    "",
    "## Prescription Engagement",
    ...summary.prescriptionEngagementWorkflow.map(
      (step) => `- ${step.step}: ${step.safeOutput}; gate ${step.humanGate}`
    ),
    "",
    "## MLflow-Style Evaluation",
    ...summary.mlflowStyleEvaluationLayers.map(
      (layer) => `- ${layer.registry}: ${layer.releaseGate}`
    ),
    "",
    "## Validation",
    ...summary.validation.checks.map(
      (check) => `- ${check.passed ? "PASS" : "FAIL"} ${check.check}: ${check.detail}`
    ),
    "",
    "## Next Build Step",
    summary.recommendedNextBuildStep,
    ""
  ].join("\n");
}
