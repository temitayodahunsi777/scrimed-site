export type ScrimedIntelligenceModuleId =
  | "clinical_intelligence"
  | "rcm"
  | "research"
  | "imaging"
  | "genomics"
  | "ambient_scribe"
  | "docutwin"
  | "care_explain"
  | "trialcore"
  | "trust_engine"
  | "education"
  | "operations";

export type ScrimedIntelligenceRiskLevel = "low" | "moderate" | "high" | "critical";

export type ScrimedIntelligenceDataClassification =
  | "synthetic_metadata"
  | "synthetic_clinical_fixture"
  | "public_reference_metadata"
  | "deidentified_allowed_later"
  | "live_phi_blocked";

export type ScrimedToolId =
  | "synthetic_context_loader"
  | "schema_validator"
  | "provenance_hasher"
  | "flight_recorder"
  | "memory_graph_query"
  | "fhir_r4_stub_export"
  | "csv_json_export"
  | "human_review_queue"
  | "external_model_call"
  | "ehr_writeback"
  | "payer_submission"
  | "patient_outreach"
  | "imaging_final_interpretation"
  | "prescribing_action"
  | "raw_connector_logger";

export type ScrimedIntelligenceRouteMetadata = {
  module: ScrimedIntelligenceModuleId;
  purpose: string;
  risk_level: ScrimedIntelligenceRiskLevel;
  data_classification: ScrimedIntelligenceDataClassification;
  allowed_tools: ScrimedToolId[];
  blocked_tools: ScrimedToolId[];
  human_review_required: boolean;
};

export type ScrimedClinicalMemoryNodeType =
  | "guideline"
  | "sop"
  | "research"
  | "patient_education"
  | "care_pathway"
  | "insurance_policy"
  | "drug"
  | "ontology"
  | "workflow";

export type ScrimedClinicalMemoryProvenance = {
  source_id: string;
  source_label: string;
  source_type: "synthetic_fixture" | "public_reference_metadata" | "internal_policy_metadata";
  synthetic: true;
  captured_at: typeof scrimedIntelligencePlatformUpdatedAt;
  steward: string;
};

export type ScrimedClinicalMemoryNode = {
  id: string;
  type: ScrimedClinicalMemoryNodeType;
  label: string;
  summary: string;
  data_classification: Exclude<ScrimedIntelligenceDataClassification, "live_phi_blocked">;
  provenance: ScrimedClinicalMemoryProvenance;
};

export type ScrimedClinicalMemoryEdge = {
  id: string;
  source_node_id: string;
  target_node_id: string;
  relationship:
    | "supports"
    | "requires_review"
    | "maps_to"
    | "references"
    | "constrains"
    | "educates"
    | "routes_to";
  confidence_score: number;
  provenance: ScrimedClinicalMemoryProvenance;
};

export type ScrimedProvenanceSource = {
  source_id: string;
  source_type: "memory_node" | "synthetic_fixture" | "policy_rule" | "evaluation_check";
  label: string;
  route?: string;
};

export type ScrimedAiOutputEnvelope = {
  output_id: string;
  module: ScrimedIntelligenceModuleId;
  output_type: "brief" | "route_decision" | "evaluation_result" | "synthetic_patient_export";
  synthetic_only: true;
  sources: ScrimedProvenanceSource[];
  confidence_score: number;
  uncertainty_reason: string;
  missing_evidence: string[];
  model_version: string;
  timestamp: typeof scrimedIntelligencePlatformUpdatedAt;
  human_validation_status: "not_reviewed" | "review_required" | "validated_for_demo_only";
  clinical_disclaimer: typeof scrimedIntelligenceClinicalDisclaimer;
  audit_hash: string;
};

export type ScrimedAiFlightRecord = {
  request_id: string;
  user_intent: string;
  retrieved_context_ids: string[];
  tool_calls: Array<{
    tool_id: ScrimedToolId;
    status: "allowed" | "blocked" | "human_review_required";
    latency_ms: number;
  }>;
  latency_ms: number;
  model_used: ScrimedModelProviderId;
  model_cost_estimate: number;
  safety_flags: string[];
  reviewer_notes: string;
  override_status: "none" | "blocked" | "human_review_required";
  synthetic_only: true;
  audit_hash: string;
};

export type ScrimedEvaluationCheckId =
  | "hallucination_guard"
  | "provenance_required"
  | "confidence_required"
  | "blocked_phi"
  | "blocked_autonomous_clinical_action"
  | "latency_budget_metadata"
  | "regression_eval_placeholder";

export type ScrimedEvaluationCheck = {
  id: ScrimedEvaluationCheckId;
  status: "pass" | "placeholder_pass";
  enforcement: "release_blocking" | "roadmap_placeholder";
  evidence: string;
  failure_mode: string;
};

export type ScrimedSyntheticPatient = {
  synthetic_patient_id: string;
  age_band: string;
  geography: "synthetic-urban" | "synthetic-rural" | "synthetic-suburban";
  vitals: {
    systolic_bp: number;
    diastolic_bp: number;
    heart_rate: number;
    bmi: number;
  };
  conditions: string[];
  medications: string[];
  encounters: Array<{
    encounter_id: string;
    encounter_type: "primary_care" | "specialty" | "urgent_care";
    synthetic_date: string;
    reason: string;
  }>;
  claims_stub: Array<{
    claim_id: string;
    status: "draft_stub" | "denied_stub" | "approved_stub";
    amount_usd: number;
  }>;
};

export type ScrimedSyntheticPatientStudio = {
  seed: string;
  generator: "deterministic-seeded-synthetic-only";
  cohort: ScrimedSyntheticPatient[];
  fhir_r4_bundle_stub: {
    resourceType: "Bundle";
    type: "collection";
    entry: Array<{
      fullUrl: string;
      resource: {
        resourceType: "Patient" | "Observation" | "Encounter" | "Claim";
        id: string;
        meta: {
          tag: Array<{ system: string; code: string; display: string }>;
        };
      };
    }>;
  };
  json_export: ScrimedSyntheticPatient[];
  csv_export: string;
};

export type ScrimedOutcomeKpiSchema = {
  clinical: {
    readmissions: number;
    los: number;
    complications: number;
  };
  financial: {
    denials: number;
    authorization_time: number;
    collections: number;
  };
  operational: {
    documentation_time: number;
    scheduling_capacity: number;
    provider_burden: number;
  };
  patient: {
    health_literacy: number;
    engagement: number;
    accessibility: number;
  };
};

export type ScrimedModelProviderId =
  | "openai"
  | "anthropic"
  | "gemini"
  | "local_open_weight"
  | "scrimed_internal";

export type ScrimedModelRoutingRequest = {
  task: string;
  cost: "low" | "standard" | "premium";
  latency: "interactive" | "standard" | "batch";
  privacy: "synthetic_only" | "deidentified_review" | "live_phi_blocked";
  accuracy_requirement: "standard" | "high" | "clinical_review_required";
  risk_level: ScrimedIntelligenceRiskLevel;
  deployment_region: "us" | "eu" | "global_review_required" | "on_prem_preview";
};

export type ScrimedModelRoutingDecision = {
  provider: ScrimedModelProviderId;
  fallback_provider: ScrimedModelProviderId;
  route_status: "synthetic_route_selected" | "blocked_phi" | "human_review_required";
  human_review_required: boolean;
  rationale: string;
  no_external_call_performed: true;
};

export type ScrimedUniversityTrack = {
  id: string;
  name: string;
  audience: string;
  status: "curriculum-ready-synthetic" | "planned";
  completion_artifact: string;
  disclaimer: string;
};

export type ScrimedIntelligenceGuardrailDecision = {
  action: string;
  status: "allowed" | "blocked" | "human_review_required";
  reason: string;
};

export type ScrimedIntelligenceHumanReviewStatus = "not_required" | "queued" | "completed";

export type ScrimedIntelligenceEvaluationOutputMetadata = {
  output_id: string;
  source_count: number;
  confidence_score: number;
  uncertainty_reason_present: boolean;
  missing_evidence_count: number;
  clinical_disclaimer_present: boolean;
  audit_hash_present: boolean;
  human_validation_status: ScrimedAiOutputEnvelope["human_validation_status"];
};

export type ScrimedIntelligenceEvaluationRequest = {
  request_id: string;
  module: ScrimedIntelligenceModuleId;
  action: string;
  data_classification: ScrimedIntelligenceDataClassification;
  requested_tools: ScrimedToolId[];
  output_metadata: ScrimedIntelligenceEvaluationOutputMetadata;
  model_request: ScrimedModelRoutingRequest;
  human_review_status: ScrimedIntelligenceHumanReviewStatus;
  synthetic_only: boolean;
};

export type ScrimedIntelligenceEvaluationDecisionStatus =
  | "allowed"
  | "human_review_required"
  | "blocked";

export type ScrimedIntelligenceEvaluationResult = {
  service: "scrimed-intelligence-platform-evaluator";
  route: typeof scrimedIntelligencePlatformEvaluateRoute;
  request_id: string;
  module: ScrimedIntelligenceModuleId;
  decision: ScrimedIntelligenceEvaluationDecisionStatus;
  status:
    | "evaluation-allowed"
    | "evaluation-human-review-required"
    | "evaluation-blocked";
  http_status: 200 | 202 | 403;
  passed_checks: string[];
  failed_checks: string[];
  safety_flags: string[];
  required_actions: string[];
  guardrail_decision: ScrimedIntelligenceGuardrailDecision;
  model_routing: ScrimedModelRoutingDecision;
  no_external_call_performed: true;
  no_phi_confirmed: boolean;
  synthetic_only: true;
  audit_hash: string;
  boundary: typeof scrimedIntelligencePlatformBoundary;
};

export type ScrimedIntelligenceEvaluationParseResult =
  | { ok: true; request: ScrimedIntelligenceEvaluationRequest }
  | { ok: false; reason: string; rejected_field?: string };

export type ScrimedIntelligencePlatformSummary = {
  service: "scrimed-intelligence-platform";
  status: typeof scrimedIntelligencePlatformStatus;
  route: typeof scrimedIntelligencePlatformRoute;
  apiRoute: typeof scrimedIntelligencePlatformApiRoute;
  briefRoute: typeof scrimedIntelligencePlatformBriefRoute;
  updated: typeof scrimedIntelligencePlatformUpdatedAt;
  noPhiConfirmed: true;
  syntheticOnly: true;
  productionApproval: false;
  intelligenceMesh: {
    moduleCount: number;
    highRiskModuleCount: number;
    modules: ScrimedIntelligenceRouteMetadata[];
  };
  clinicalMemoryGraph: {
    nodeCount: number;
    edgeCount: number;
    nodes: ScrimedClinicalMemoryNode[];
    edges: ScrimedClinicalMemoryEdge[];
  };
  provenanceConfidence: {
    output: ScrimedAiOutputEnvelope;
    requiredFields: string[];
  };
  flightRecorder: {
    recordCount: number;
    records: ScrimedAiFlightRecord[];
  };
  evaluationPipeline: {
    checkCount: number;
    releaseBlockingCount: number;
    checks: ScrimedEvaluationCheck[];
  };
  syntheticPatientStudio: ScrimedSyntheticPatientStudio;
  outcomeIntelligence: {
    schema: ScrimedOutcomeKpiSchema;
    dashboardSample: ScrimedOutcomeKpiSchema;
  };
  modelRouter: {
    providers: ScrimedModelProviderId[];
    decisions: ScrimedModelRoutingDecision[];
  };
  evaluationGate: {
    route: typeof scrimedIntelligencePlatformEvaluateRoute;
    sampleCount: number;
    sampleResults: ScrimedIntelligenceEvaluationResult[];
  };
  scrimedUniversity: {
    trackCount: number;
    tracks: ScrimedUniversityTrack[];
  };
  guardrails: {
    noGoBoundaries: string[];
    sampleDecisions: ScrimedIntelligenceGuardrailDecision[];
  };
  boundary: typeof scrimedIntelligencePlatformBoundary;
};

export const scrimedIntelligencePlatformStatus =
  "scrimed-intelligence-platform-active-synthetic-only";
export const scrimedIntelligencePlatformRoute = "/scrimed-intelligence-platform";
export const scrimedIntelligencePlatformApiRoute = "/api/scrimed-intelligence-platform";
export const scrimedIntelligencePlatformBriefRoute =
  "/api/scrimed-intelligence-platform/brief";
export const scrimedIntelligencePlatformEvaluateRoute =
  "/api/scrimed-intelligence-platform/evaluate";
export const scrimedIntelligencePlatformUpdatedAt = "2026-07-04";

export const scrimedIntelligenceClinicalDisclaimer =
  "Research/demo use only. Not for diagnosis, treatment, prescribing, imaging interpretation, payer submission, EHR writeback, patient outreach, or live patient care.";

export const scrimedIntelligencePlatformBoundary =
  "SCRIMED Intelligence Platform is synthetic-only, metadata-only infrastructure for governed healthcare AI orchestration. It does not process live PHI, log raw connector payloads, diagnose, treat, prescribe, make final imaging interpretations, submit payer transactions, write to EHRs, activate production customers, claim certification, or authorize customer go-live.";

export const scrimedIntelligenceNoGoBoundaries = [
  "no live PHI",
  "no raw connector payload logging",
  "no autonomous diagnosis",
  "no treatment or prescribing decisions",
  "no imaging interpretation as final medical decision",
  "no payer submission",
  "no EHR writeback",
  "no production customer activation",
  "no regulatory certification claims"
];

export const scrimedIntelligenceSafeTools: ScrimedToolId[] = [
  "synthetic_context_loader",
  "schema_validator",
  "provenance_hasher",
  "flight_recorder",
  "memory_graph_query",
  "fhir_r4_stub_export",
  "csv_json_export",
  "human_review_queue"
];

export const scrimedIntelligenceBlockedTools: ScrimedToolId[] = [
  "external_model_call",
  "ehr_writeback",
  "payer_submission",
  "patient_outreach",
  "imaging_final_interpretation",
  "prescribing_action",
  "raw_connector_logger"
];

export const scrimedIntelligenceMeshModules: ScrimedIntelligenceRouteMetadata[] = [
  moduleRoute("clinical_intelligence", "Synthetic clinical intelligence briefs with evidence, uncertainty, and reviewer gates.", "high", "synthetic_clinical_fixture"),
  moduleRoute("rcm", "Revenue cycle and denials intelligence with synthetic claims stubs only.", "moderate", "synthetic_metadata"),
  moduleRoute("research", "Research synthesis simulation with public-reference metadata and human review.", "moderate", "public_reference_metadata"),
  moduleRoute("imaging", "Imaging workflow metadata, routing, and QA gates without final medical interpretation.", "high", "synthetic_metadata"),
  moduleRoute("genomics", "Genomics knowledge graph metadata and research planning without patient-specific action.", "high", "synthetic_metadata"),
  moduleRoute("ambient_scribe", "Synthetic ambient note drafting metadata with clinician signoff required.", "high", "synthetic_clinical_fixture"),
  moduleRoute("docutwin", "Synthetic document intelligence with provenance and draft-only outputs.", "moderate", "synthetic_metadata"),
  moduleRoute("care_explain", "Patient education drafts with readability checks and clinical disclaimer.", "moderate", "synthetic_clinical_fixture"),
  moduleRoute("trialcore", "Clinical trial matching simulation with no enrollment or patient contact authority.", "high", "synthetic_clinical_fixture"),
  moduleRoute("trust_engine", "Trust, safety, provenance, and audit controls for module outputs.", "moderate", "synthetic_metadata"),
  moduleRoute("education", "SCRIMED University curriculum metadata and non-certification learning paths.", "low", "synthetic_metadata"),
  moduleRoute("operations", "Operational intelligence for staffing, scheduling, throughput, and burden KPIs.", "moderate", "synthetic_metadata")
];

export const scrimedClinicalMemoryNodes: ScrimedClinicalMemoryNode[] = [
  memoryNode("guideline-handoff-safety", "guideline", "Handoff safety guideline metadata", "Synthetic guideline reference for safe handoffs and escalation criteria."),
  memoryNode("sop-human-review", "sop", "Human review SOP", "Internal policy metadata requiring review before high-risk clinical, payer, or connector actions."),
  memoryNode("research-evidence-ranking", "research", "Evidence ranking method", "Research metadata for grading sources, contradictions, recency, and missing evidence."),
  memoryNode("education-medication-literacy", "patient_education", "Medication literacy education", "Synthetic patient education scaffold requiring clinician review before use."),
  memoryNode("care-pathway-diabetes", "care_pathway", "Diabetes care pathway", "Synthetic care pathway metadata for follow-up planning and escalation simulation."),
  memoryNode("insurance-policy-prior-auth", "insurance_policy", "Prior authorization policy metadata", "Synthetic payer policy scaffold for packet drafting without submission."),
  memoryNode("drug-metformin", "drug", "Metformin drug concept metadata", "Synthetic drug concept node for education and interaction review scaffolds."),
  memoryNode("ontology-loinc-vitals", "ontology", "LOINC vitals ontology metadata", "Synthetic terminology mapping node for vitals observations."),
  memoryNode("workflow-rcm-denials", "workflow", "RCM denials workflow", "Synthetic workflow node for denial triage and reviewer routing.")
];

export const scrimedClinicalMemoryEdges: ScrimedClinicalMemoryEdge[] = [
  memoryEdge("edge-human-review-clinical", "sop-human-review", "guideline-handoff-safety", "constrains", 0.94),
  memoryEdge("edge-guideline-carepath", "guideline-handoff-safety", "care-pathway-diabetes", "supports", 0.86),
  memoryEdge("edge-education-drug", "education-medication-literacy", "drug-metformin", "educates", 0.82),
  memoryEdge("edge-ontology-vitals", "ontology-loinc-vitals", "care-pathway-diabetes", "maps_to", 0.88),
  memoryEdge("edge-policy-workflow", "insurance-policy-prior-auth", "workflow-rcm-denials", "routes_to", 0.8),
  memoryEdge("edge-research-guideline", "research-evidence-ranking", "guideline-handoff-safety", "references", 0.84)
];

export const scrimedEvaluationChecks: ScrimedEvaluationCheck[] = [
  {
    id: "hallucination_guard",
    status: "pass",
    enforcement: "release_blocking",
    evidence: "Every sample output includes sources, uncertainty, missing evidence, and clinical disclaimer.",
    failure_mode: "Output asserts unsupported clinical, payer, or operational facts."
  },
  {
    id: "provenance_required",
    status: "pass",
    enforcement: "release_blocking",
    evidence: "AI output envelope requires non-empty sources and deterministic audit_hash.",
    failure_mode: "Output lacks source attribution."
  },
  {
    id: "confidence_required",
    status: "pass",
    enforcement: "release_blocking",
    evidence: "AI output envelope requires confidence_score from 0 to 1 and uncertainty_reason.",
    failure_mode: "Output omits confidence or uncertainty."
  },
  {
    id: "blocked_phi",
    status: "pass",
    enforcement: "release_blocking",
    evidence: "Guardrail evaluator blocks live PHI and raw connector payload logging.",
    failure_mode: "Live PHI enters model, graph, flight record, or test fixture."
  },
  {
    id: "blocked_autonomous_clinical_action",
    status: "pass",
    enforcement: "release_blocking",
    evidence: "Diagnosis, treatment, prescribing, imaging final interpretation, outreach, payer submission, and EHR writeback are blocked.",
    failure_mode: "High-risk action proceeds without human review or block."
  },
  {
    id: "latency_budget_metadata",
    status: "pass",
    enforcement: "release_blocking",
    evidence: "Flight recorder fixture includes latency_ms and tool-call latency metadata.",
    failure_mode: "Trace omits latency budget metadata."
  },
  {
    id: "regression_eval_placeholder",
    status: "placeholder_pass",
    enforcement: "roadmap_placeholder",
    evidence: "Placeholder preserves CI contract until reviewer-calibrated regression datasets are added.",
    failure_mode: "Regression suite removed or left untracked."
  }
];

export const scrimedUniversityTracks: ScrimedUniversityTrack[] = [
  universityTrack("foundations", "Foundations", "All SCRIMED users"),
  universityTrack("clinical-ai", "Clinical AI", "Clinicians and clinical operations leaders"),
  universityTrack("responsible-ai", "Responsible AI", "Governance, legal, security, and product teams"),
  universityTrack("fhir", "FHIR", "Interoperability teams"),
  universityTrack("hl7", "HL7", "Interface and integration teams"),
  universityTrack("medical-imaging-ai", "Medical Imaging AI", "Imaging operations and radiology review teams"),
  universityTrack("rcm-ai", "RCM AI", "Revenue cycle teams"),
  universityTrack("governance", "Governance", "Compliance and oversight teams"),
  universityTrack("implementation", "Implementation", "Deployment and customer success teams"),
  universityTrack("research", "Research", "Research operations teams"),
  universityTrack("executive-leadership", "Executive Leadership", "Executives and board stakeholders"),
  universityTrack("developer-certification", "Developer Certification", "Developers and integration builders"),
  universityTrack("partner-certification", "Partner Certification", "Implementation partners"),
  universityTrack("hospital-certification", "Hospital Certification", "Hospital pilot leadership")
];

export const outcomeKpiSchema: ScrimedOutcomeKpiSchema = {
  clinical: {
    readmissions: 0,
    los: 0,
    complications: 0
  },
  financial: {
    denials: 0,
    authorization_time: 0,
    collections: 0
  },
  operational: {
    documentation_time: 0,
    scheduling_capacity: 0,
    provider_burden: 0
  },
  patient: {
    health_literacy: 0,
    engagement: 0,
    accessibility: 0
  }
};

export const outcomeDashboardSample: ScrimedOutcomeKpiSchema = {
  clinical: {
    readmissions: 12.5,
    los: 4.2,
    complications: 2.1
  },
  financial: {
    denials: 8.4,
    authorization_time: 36,
    collections: 91.3
  },
  operational: {
    documentation_time: 18,
    scheduling_capacity: 72,
    provider_burden: 41
  },
  patient: {
    health_literacy: 76,
    engagement: 64,
    accessibility: 82
  }
};

export const scrimedModelProviders: ScrimedModelProviderId[] = [
  "openai",
  "anthropic",
  "gemini",
  "local_open_weight",
  "scrimed_internal"
];

function moduleRoute(
  module: ScrimedIntelligenceModuleId,
  purpose: string,
  risk_level: ScrimedIntelligenceRiskLevel,
  data_classification: ScrimedIntelligenceDataClassification
): ScrimedIntelligenceRouteMetadata {
  return {
    module,
    purpose,
    risk_level,
    data_classification,
    allowed_tools: scrimedIntelligenceSafeTools,
    blocked_tools: scrimedIntelligenceBlockedTools,
    human_review_required: risk_level === "high" || risk_level === "critical"
  };
}

function provenance(source_id: string, source_label: string): ScrimedClinicalMemoryProvenance {
  return {
    source_id,
    source_label,
    source_type: "synthetic_fixture",
    synthetic: true,
    captured_at: scrimedIntelligencePlatformUpdatedAt,
    steward: "SCRIMED Trust Engine"
  };
}

function memoryNode(
  id: string,
  type: ScrimedClinicalMemoryNodeType,
  label: string,
  summary: string
): ScrimedClinicalMemoryNode {
  return {
    id,
    type,
    label,
    summary,
    data_classification: type === "research" ? "public_reference_metadata" : "synthetic_metadata",
    provenance: provenance(`source-${id}`, label)
  };
}

function memoryEdge(
  id: string,
  source_node_id: string,
  target_node_id: string,
  relationship: ScrimedClinicalMemoryEdge["relationship"],
  confidence_score: number
): ScrimedClinicalMemoryEdge {
  return {
    id,
    source_node_id,
    target_node_id,
    relationship,
    confidence_score,
    provenance: provenance(`source-${id}`, `${source_node_id} ${relationship} ${target_node_id}`)
  };
}

function universityTrack(id: string, name: string, audience: string): ScrimedUniversityTrack {
  return {
    id,
    name,
    audience,
    status: "curriculum-ready-synthetic",
    completion_artifact: "metadata-only learning completion record; not regulatory certification",
    disclaimer:
      "SCRIMED University tracks are educational readiness materials only and do not grant legal, clinical, security, regulatory, partner, or hospital certification."
  };
}

function stableSerialize(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((item) => stableSerialize(item)).join(",")}]`;

  return `{${Object.entries(value as Record<string, unknown>)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, item]) => `${JSON.stringify(key)}:${stableSerialize(item)}`)
    .join(",")}}`;
}

export function generateScrimedAuditHash(payload: unknown) {
  const serialized = stableSerialize(payload);
  let hash = 0x811c9dc5;

  for (let index = 0; index < serialized.length; index += 1) {
    hash ^= serialized.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return `scrimed-intel-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

export function createScrimedAiOutputEnvelope(input: {
  output_id: string;
  module: ScrimedIntelligenceModuleId;
  output_type: ScrimedAiOutputEnvelope["output_type"];
  sources: ScrimedProvenanceSource[];
  confidence_score: number;
  uncertainty_reason: string;
  missing_evidence: string[];
  model_version: string;
  human_validation_status: ScrimedAiOutputEnvelope["human_validation_status"];
}): ScrimedAiOutputEnvelope {
  const hashPayload = {
    output_id: input.output_id,
    module: input.module,
    output_type: input.output_type,
    sources: input.sources.map((source) => source.source_id),
    confidence_score: input.confidence_score,
    missing_evidence: input.missing_evidence,
    model_version: input.model_version,
    timestamp: scrimedIntelligencePlatformUpdatedAt
  };

  return {
    ...input,
    synthetic_only: true,
    timestamp: scrimedIntelligencePlatformUpdatedAt,
    clinical_disclaimer: scrimedIntelligenceClinicalDisclaimer,
    audit_hash: generateScrimedAuditHash(hashPayload)
  };
}

export function evaluateScrimedIntelligenceAction(action: string): ScrimedIntelligenceGuardrailDecision {
  const normalized = action.toLowerCase();

  if (/\b(live phi|raw connector|diagnose|treat|prescribe|payer submission|ehr writeback|customer go-live|production activation|regulatory certification)\b/.test(normalized)) {
    return {
      action,
      status: "blocked",
      reason:
        "Action crosses SCRIMED NO-GO boundaries for PHI, autonomous clinical authority, system-of-record mutation, production activation, or certification claims."
    };
  }

  if (/\b(clinical|imaging|genomics|trial|patient education|prior auth)\b/.test(normalized)) {
    return {
      action,
      status: "human_review_required",
      reason: "High-risk healthcare context requires qualified human review before any operational use."
    };
  }

  return {
    action,
    status: "allowed",
    reason: "Synthetic metadata-only action remains inside the SCRIMED demo and diligence boundary."
  };
}

export function routeScrimedIntelligenceModel(
  request: ScrimedModelRoutingRequest
): ScrimedModelRoutingDecision {
  if (request.privacy === "live_phi_blocked") {
    return {
      provider: "scrimed_internal",
      fallback_provider: "local_open_weight",
      route_status: "blocked_phi",
      human_review_required: true,
      rationale: "Live PHI routing is blocked until approved privacy, security, tenant, BAA/DPA, and connector controls exist.",
      no_external_call_performed: true
    };
  }

  if (
    request.risk_level === "high" ||
    request.risk_level === "critical" ||
    request.accuracy_requirement === "clinical_review_required"
  ) {
    return {
      provider: "scrimed_internal",
      fallback_provider: "local_open_weight",
      route_status: "human_review_required",
      human_review_required: true,
      rationale: "High-risk clinical or healthcare context can be prepared as synthetic metadata only and must route to human review.",
      no_external_call_performed: true
    };
  }

  if (request.privacy === "synthetic_only" && request.cost === "low") {
    return {
      provider: "local_open_weight",
      fallback_provider: "scrimed_internal",
      route_status: "synthetic_route_selected",
      human_review_required: false,
      rationale: "Low-cost synthetic metadata route selects local/open-weight readiness path with no external provider call.",
      no_external_call_performed: true
    };
  }

  return {
    provider: "scrimed_internal",
    fallback_provider: "local_open_weight",
    route_status: "synthetic_route_selected",
    human_review_required: false,
    rationale: "Provider-neutral synthetic route uses SCRIMED internal orchestration metadata until external providers are approved.",
    no_external_call_performed: true
  };
}

const scrimedIntelligenceModules = scrimedIntelligenceMeshModules.map((module) => module.module);
const scrimedIntelligenceDataClassifications: ScrimedIntelligenceDataClassification[] = [
  "synthetic_metadata",
  "synthetic_clinical_fixture",
  "public_reference_metadata",
  "deidentified_allowed_later",
  "live_phi_blocked"
];
const scrimedIntelligenceRiskLevels: ScrimedIntelligenceRiskLevel[] = [
  "low",
  "moderate",
  "high",
  "critical"
];
const scrimedIntelligenceHumanReviewStatuses: ScrimedIntelligenceHumanReviewStatus[] = [
  "not_required",
  "queued",
  "completed"
];
const scrimedOutputHumanValidationStatuses: ScrimedAiOutputEnvelope["human_validation_status"][] = [
  "not_reviewed",
  "review_required",
  "validated_for_demo_only"
];
const scrimedModelCosts: ScrimedModelRoutingRequest["cost"][] = ["low", "standard", "premium"];
const scrimedModelLatencies: ScrimedModelRoutingRequest["latency"][] = ["interactive", "standard", "batch"];
const scrimedModelPrivacyModes: ScrimedModelRoutingRequest["privacy"][] = [
  "synthetic_only",
  "deidentified_review",
  "live_phi_blocked"
];
const scrimedModelAccuracyRequirements: ScrimedModelRoutingRequest["accuracy_requirement"][] = [
  "standard",
  "high",
  "clinical_review_required"
];
const scrimedModelDeploymentRegions: ScrimedModelRoutingRequest["deployment_region"][] = [
  "us",
  "eu",
  "global_review_required",
  "on_prem_preview"
];
const scrimedAllTools: ScrimedToolId[] = [
  ...scrimedIntelligenceSafeTools,
  ...scrimedIntelligenceBlockedTools
];
const disallowedEvaluationFieldNames = new Set([
  "authorization",
  "bearer",
  "clinical_note",
  "dateofbirth",
  "dob",
  "email",
  "mrn",
  "note",
  "notetext",
  "patientname",
  "payload",
  "phone",
  "raw",
  "rawnote",
  "rawtext",
  "secret",
  "ssn",
  "token"
]);
const tokenLikeValuePattern =
  /\b(?:Bearer\s+)?[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stringInList<T extends string>(value: unknown, values: readonly T[]): value is T {
  return typeof value === "string" && values.includes(value as T);
}

function findDisallowedEvaluationField(value: unknown): string | null {
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findDisallowedEvaluationField(item);
      if (found) return found;
    }

    return null;
  }

  if (!isRecord(value)) return null;

  for (const [key, item] of Object.entries(value)) {
    const normalizedKey = key.replace(/[_-\s]/g, "").toLowerCase();
    if (disallowedEvaluationFieldNames.has(normalizedKey)) return key;

    const found = findDisallowedEvaluationField(item);
    if (found) return found;
  }

  return null;
}

function containsTokenLikeValue(value: unknown): boolean {
  if (typeof value === "string") return tokenLikeValuePattern.test(value);
  if (Array.isArray(value)) return value.some((item) => containsTokenLikeValue(item));
  if (isRecord(value)) return Object.values(value).some((item) => containsTokenLikeValue(item));
  return false;
}

export function parseScrimedIntelligenceEvaluationRequest(
  value: unknown
): ScrimedIntelligenceEvaluationParseResult {
  const rejectedField = findDisallowedEvaluationField(value);
  if (rejectedField) {
    return {
      ok: false,
      reason:
        "Evaluation requests accept metadata only. Raw clinical notes, identifiers, payloads, secrets, tokens, and contact fields are rejected.",
      rejected_field: rejectedField
    };
  }

  if (containsTokenLikeValue(value)) {
    return {
      ok: false,
      reason: "Evaluation request contains a token-like value and was rejected before processing."
    };
  }

  if (!isRecord(value)) {
    return { ok: false, reason: "Request body must be an object." };
  }

  const output = value.output_metadata;
  const modelRequest = value.model_request;

  if (!isRecord(output)) {
    return { ok: false, reason: "output_metadata is required." };
  }

  if (!isRecord(modelRequest)) {
    return { ok: false, reason: "model_request is required." };
  }

  if (typeof value.request_id !== "string" || value.request_id.length < 6) {
    return { ok: false, reason: "request_id must be a stable nonsecret string." };
  }

  if (!stringInList(value.module, scrimedIntelligenceModules)) {
    return { ok: false, reason: "module is not registered in the SCRIMED Intelligence Mesh." };
  }

  if (typeof value.action !== "string" || value.action.length < 3) {
    return { ok: false, reason: "action must be a metadata-only action description." };
  }

  if (!stringInList(value.data_classification, scrimedIntelligenceDataClassifications)) {
    return { ok: false, reason: "data_classification is not supported." };
  }

  if (!Array.isArray(value.requested_tools)) {
    return { ok: false, reason: "requested_tools must be an array." };
  }

  if (!value.requested_tools.every((tool) => stringInList(tool, scrimedAllTools))) {
    return { ok: false, reason: "requested_tools contains an unknown tool." };
  }

  if (!stringInList(value.human_review_status, scrimedIntelligenceHumanReviewStatuses)) {
    return { ok: false, reason: "human_review_status is not supported." };
  }

  if (typeof value.synthetic_only !== "boolean") {
    return { ok: false, reason: "synthetic_only must be boolean." };
  }

  if (typeof output.output_id !== "string" || output.output_id.length < 6) {
    return { ok: false, reason: "output_metadata.output_id must be provided." };
  }

  if (typeof output.source_count !== "number" || !Number.isFinite(output.source_count)) {
    return { ok: false, reason: "output_metadata.source_count must be numeric." };
  }

  if (typeof output.confidence_score !== "number" || !Number.isFinite(output.confidence_score)) {
    return { ok: false, reason: "output_metadata.confidence_score must be numeric." };
  }

  for (const field of [
    "uncertainty_reason_present",
    "clinical_disclaimer_present",
    "audit_hash_present"
  ]) {
    if (typeof output[field] !== "boolean") {
      return { ok: false, reason: `output_metadata.${field} must be boolean.` };
    }
  }

  if (
    typeof output.missing_evidence_count !== "number" ||
    !Number.isFinite(output.missing_evidence_count)
  ) {
    return { ok: false, reason: "output_metadata.missing_evidence_count must be numeric." };
  }

  if (!stringInList(output.human_validation_status, scrimedOutputHumanValidationStatuses)) {
    return { ok: false, reason: "output_metadata.human_validation_status is not supported." };
  }

  if (typeof modelRequest.task !== "string" || modelRequest.task.length < 3) {
    return { ok: false, reason: "model_request.task must be provided." };
  }

  if (!stringInList(modelRequest.cost, scrimedModelCosts)) {
    return { ok: false, reason: "model_request.cost is not supported." };
  }

  if (!stringInList(modelRequest.latency, scrimedModelLatencies)) {
    return { ok: false, reason: "model_request.latency is not supported." };
  }

  if (!stringInList(modelRequest.privacy, scrimedModelPrivacyModes)) {
    return { ok: false, reason: "model_request.privacy is not supported." };
  }

  if (!stringInList(modelRequest.accuracy_requirement, scrimedModelAccuracyRequirements)) {
    return { ok: false, reason: "model_request.accuracy_requirement is not supported." };
  }

  if (!stringInList(modelRequest.risk_level, scrimedIntelligenceRiskLevels)) {
    return { ok: false, reason: "model_request.risk_level is not supported." };
  }

  if (!stringInList(modelRequest.deployment_region, scrimedModelDeploymentRegions)) {
    return { ok: false, reason: "model_request.deployment_region is not supported." };
  }

  return {
    ok: true,
    request: {
      request_id: value.request_id,
      module: value.module,
      action: value.action,
      data_classification: value.data_classification,
      requested_tools: value.requested_tools,
      output_metadata: {
        output_id: output.output_id,
        source_count: output.source_count,
        confidence_score: output.confidence_score,
        uncertainty_reason_present: output.uncertainty_reason_present as boolean,
        missing_evidence_count: output.missing_evidence_count,
        clinical_disclaimer_present: output.clinical_disclaimer_present as boolean,
        audit_hash_present: output.audit_hash_present as boolean,
        human_validation_status: output.human_validation_status
      },
      model_request: {
        task: modelRequest.task,
        cost: modelRequest.cost,
        latency: modelRequest.latency,
        privacy: modelRequest.privacy,
        accuracy_requirement: modelRequest.accuracy_requirement,
        risk_level: modelRequest.risk_level,
        deployment_region: modelRequest.deployment_region
      },
      human_review_status: value.human_review_status,
      synthetic_only: value.synthetic_only
    }
  };
}

export function evaluateScrimedIntelligenceRequest(
  request: ScrimedIntelligenceEvaluationRequest
): ScrimedIntelligenceEvaluationResult {
  const moduleMetadata = scrimedIntelligenceMeshModules.find(
    (module) => module.module === request.module
  );
  const passedChecks: string[] = [];
  const failedChecks: string[] = [];
  const safetyFlags = ["metadata_only", "no_external_call_performed"];
  const requiredActions: string[] = [];
  const guardrailDecision = evaluateScrimedIntelligenceAction(request.action);
  const modelRouting = routeScrimedIntelligenceModel(request.model_request);
  const blockedToolRequests = request.requested_tools.filter((tool) =>
    scrimedIntelligenceBlockedTools.includes(tool)
  );

  if (request.synthetic_only) passedChecks.push("synthetic_only_attested");
  else failedChecks.push("synthetic_only_required");

  if (request.data_classification === "live_phi_blocked") failedChecks.push("live_phi_blocked");
  else passedChecks.push("no_live_phi_classification");

  if (blockedToolRequests.length > 0) failedChecks.push("blocked_tool_requested");
  else passedChecks.push("tool_scope_allowed");

  if (request.output_metadata.source_count > 0) passedChecks.push("provenance_required");
  else failedChecks.push("provenance_required");

  if (
    request.output_metadata.confidence_score >= 0 &&
    request.output_metadata.confidence_score <= 1
  ) {
    passedChecks.push("confidence_required");
  } else {
    failedChecks.push("confidence_required");
  }

  if (request.output_metadata.uncertainty_reason_present) passedChecks.push("uncertainty_required");
  else failedChecks.push("uncertainty_required");

  if (request.output_metadata.clinical_disclaimer_present) {
    passedChecks.push("clinical_disclaimer_required");
  } else {
    failedChecks.push("clinical_disclaimer_required");
  }

  if (request.output_metadata.audit_hash_present) passedChecks.push("audit_hash_required");
  else failedChecks.push("audit_hash_required");

  if (guardrailDecision.status === "blocked") failedChecks.push("action_boundary_blocked");
  else passedChecks.push("action_boundary_checked");

  if (modelRouting.route_status === "blocked_phi") failedChecks.push("model_phi_route_blocked");
  else passedChecks.push("model_route_checked");

  if (blockedToolRequests.length > 0) {
    requiredActions.push(`Remove blocked tools: ${blockedToolRequests.join(", ")}`);
  }

  if (request.data_classification === "live_phi_blocked") {
    safetyFlags.push("phi_blocked");
    requiredActions.push("Remove live PHI and route through approved privacy/security/customer gates.");
  }

  if (moduleMetadata?.human_review_required || modelRouting.human_review_required) {
    safetyFlags.push("human_review_required");
    if (request.human_review_status !== "completed") {
      requiredActions.push("Queue qualified human review before operational use.");
    }
  }

  if (guardrailDecision.status === "human_review_required") {
    safetyFlags.push("action_requires_human_review");
  }

  const blocked = failedChecks.length > 0;
  const reviewRequired =
    !blocked &&
    (moduleMetadata?.human_review_required ||
      modelRouting.human_review_required ||
      guardrailDecision.status === "human_review_required" ||
      request.output_metadata.human_validation_status === "review_required") &&
    request.human_review_status !== "completed";
  const decision: ScrimedIntelligenceEvaluationDecisionStatus = blocked
    ? "blocked"
    : reviewRequired
      ? "human_review_required"
      : "allowed";

  const hashPayload = {
    request_id: request.request_id,
    module: request.module,
    action: request.action,
    data_classification: request.data_classification,
    requested_tools: request.requested_tools,
    output_id: request.output_metadata.output_id,
    failedChecks,
    decision,
    model_route_status: modelRouting.route_status
  };

  return {
    service: "scrimed-intelligence-platform-evaluator",
    route: scrimedIntelligencePlatformEvaluateRoute,
    request_id: request.request_id,
    module: request.module,
    decision,
    status:
      decision === "blocked"
        ? "evaluation-blocked"
        : decision === "human_review_required"
          ? "evaluation-human-review-required"
          : "evaluation-allowed",
    http_status: decision === "blocked" ? 403 : decision === "human_review_required" ? 202 : 200,
    passed_checks: passedChecks,
    failed_checks: failedChecks,
    safety_flags: safetyFlags,
    required_actions: requiredActions,
    guardrail_decision: guardrailDecision,
    model_routing: modelRouting,
    no_external_call_performed: true,
    no_phi_confirmed: request.data_classification !== "live_phi_blocked",
    synthetic_only: true,
    audit_hash: generateScrimedAuditHash(hashPayload),
    boundary: scrimedIntelligencePlatformBoundary
  };
}

export function getScrimedIntelligenceEvaluationSamples(): ScrimedIntelligenceEvaluationRequest[] {
  return [
    {
      request_id: "intel-eval-synthetic-allowed-001",
      module: "operations",
      action: "synthetic operations metadata summary",
      data_classification: "synthetic_metadata",
      requested_tools: ["synthetic_context_loader", "schema_validator", "provenance_hasher"],
      output_metadata: {
        output_id: "intel-eval-output-allowed-001",
        source_count: 2,
        confidence_score: 0.82,
        uncertainty_reason_present: true,
        missing_evidence_count: 1,
        clinical_disclaimer_present: true,
        audit_hash_present: true,
        human_validation_status: "validated_for_demo_only"
      },
      model_request: {
        task: "synthetic operational summary",
        cost: "low",
        latency: "interactive",
        privacy: "synthetic_only",
        accuracy_requirement: "standard",
        risk_level: "low",
        deployment_region: "us"
      },
      human_review_status: "not_required",
      synthetic_only: true
    },
    {
      request_id: "intel-eval-review-queued-001",
      module: "clinical_intelligence",
      action: "clinical education draft",
      data_classification: "synthetic_clinical_fixture",
      requested_tools: ["synthetic_context_loader", "schema_validator", "human_review_queue"],
      output_metadata: {
        output_id: "intel-eval-output-review-001",
        source_count: 2,
        confidence_score: 0.76,
        uncertainty_reason_present: true,
        missing_evidence_count: 4,
        clinical_disclaimer_present: true,
        audit_hash_present: true,
        human_validation_status: "review_required"
      },
      model_request: {
        task: "clinical education draft",
        cost: "standard",
        latency: "standard",
        privacy: "synthetic_only",
        accuracy_requirement: "clinical_review_required",
        risk_level: "high",
        deployment_region: "us"
      },
      human_review_status: "queued",
      synthetic_only: true
    },
    {
      request_id: "intel-eval-blocked-phi-001",
      module: "clinical_intelligence",
      action: "diagnose live patient and write to EHR",
      data_classification: "live_phi_blocked",
      requested_tools: ["external_model_call", "ehr_writeback"],
      output_metadata: {
        output_id: "intel-eval-output-blocked-001",
        source_count: 0,
        confidence_score: 1.4,
        uncertainty_reason_present: false,
        missing_evidence_count: 0,
        clinical_disclaimer_present: false,
        audit_hash_present: false,
        human_validation_status: "not_reviewed"
      },
      model_request: {
        task: "live PHI request",
        cost: "premium",
        latency: "batch",
        privacy: "live_phi_blocked",
        accuracy_requirement: "clinical_review_required",
        risk_level: "critical",
        deployment_region: "global_review_required"
      },
      human_review_status: "queued",
      synthetic_only: false
    }
  ];
}

function seededNumber(seed: string, salt: number) {
  let value = 2166136261;
  const input = `${seed}:${salt}`;

  for (let index = 0; index < input.length; index += 1) {
    value ^= input.charCodeAt(index);
    value = Math.imul(value, 16777619);
  }

  return (value >>> 0) / 4294967295;
}

function choose<T>(seed: string, salt: number, values: T[]): T {
  return values[Math.floor(seededNumber(seed, salt) * values.length) % values.length];
}

export function generateSyntheticCohort(seed = "scrimed-synthetic-cohort-v1", count = 3): ScrimedSyntheticPatient[] {
  const conditions = ["type 2 diabetes", "hypertension", "asthma", "heart failure", "chronic kidney disease"];
  const medications = ["metformin", "lisinopril", "albuterol", "furosemide", "atorvastatin"];
  const reasons = ["follow-up", "medication review", "care gap review", "authorization packet review"];

  return Array.from({ length: count }, (_, index) => {
    const patientSeed = `${seed}-${index + 1}`;
    const selectedConditions = [
      choose(patientSeed, 1, conditions),
      choose(patientSeed, 2, conditions)
    ].filter((value, valueIndex, array) => array.indexOf(value) === valueIndex);
    const selectedMedications = [
      choose(patientSeed, 3, medications),
      choose(patientSeed, 4, medications)
    ].filter((value, valueIndex, array) => array.indexOf(value) === valueIndex);

    return {
      synthetic_patient_id: `synthetic-patient-${index + 1}`,
      age_band: choose(patientSeed, 5, ["18-34", "35-49", "50-64", "65-79"]),
      geography: choose(patientSeed, 6, ["synthetic-urban", "synthetic-rural", "synthetic-suburban"]),
      vitals: {
        systolic_bp: 110 + Math.floor(seededNumber(patientSeed, 7) * 45),
        diastolic_bp: 68 + Math.floor(seededNumber(patientSeed, 8) * 24),
        heart_rate: 62 + Math.floor(seededNumber(patientSeed, 9) * 36),
        bmi: Number((22 + seededNumber(patientSeed, 10) * 14).toFixed(1))
      },
      conditions: selectedConditions,
      medications: selectedMedications,
      encounters: [
        {
          encounter_id: `synthetic-encounter-${index + 1}-1`,
          encounter_type: choose(patientSeed, 11, ["primary_care", "specialty", "urgent_care"]),
          synthetic_date: `2026-0${(index % 3) + 1}-15`,
          reason: choose(patientSeed, 12, reasons)
        }
      ],
      claims_stub: [
        {
          claim_id: `synthetic-claim-${index + 1}-1`,
          status: choose(patientSeed, 13, ["draft_stub", "denied_stub", "approved_stub"]),
          amount_usd: 100 + Math.floor(seededNumber(patientSeed, 14) * 900)
        }
      ]
    };
  });
}

export function buildSyntheticPatientStudio(): ScrimedSyntheticPatientStudio {
  const seed = "scrimed-synthetic-cohort-v1";
  const cohort = generateSyntheticCohort(seed, 3);

  return {
    seed,
    generator: "deterministic-seeded-synthetic-only",
    cohort,
    fhir_r4_bundle_stub: {
      resourceType: "Bundle",
      type: "collection",
      entry: cohort.flatMap((patient) => [
        {
          fullUrl: `urn:uuid:${patient.synthetic_patient_id}`,
          resource: {
            resourceType: "Patient" as const,
            id: patient.synthetic_patient_id,
            meta: {
              tag: [{ system: "https://scrimed.example/synthetic", code: "synthetic-only", display: "Synthetic only" }]
            }
          }
        },
        {
          fullUrl: `urn:uuid:${patient.synthetic_patient_id}-vitals`,
          resource: {
            resourceType: "Observation" as const,
            id: `${patient.synthetic_patient_id}-vitals`,
            meta: {
              tag: [{ system: "https://scrimed.example/synthetic", code: "synthetic-only", display: "Synthetic only" }]
            }
          }
        },
        {
          fullUrl: `urn:uuid:${patient.encounters[0].encounter_id}`,
          resource: {
            resourceType: "Encounter" as const,
            id: patient.encounters[0].encounter_id,
            meta: {
              tag: [{ system: "https://scrimed.example/synthetic", code: "synthetic-only", display: "Synthetic only" }]
            }
          }
        },
        {
          fullUrl: `urn:uuid:${patient.claims_stub[0].claim_id}`,
          resource: {
            resourceType: "Claim" as const,
            id: patient.claims_stub[0].claim_id,
            meta: {
              tag: [{ system: "https://scrimed.example/synthetic", code: "synthetic-only", display: "Synthetic only" }]
            }
          }
        }
      ])
    },
    json_export: cohort,
    csv_export: [
      "synthetic_patient_id,age_band,geography,systolic_bp,diastolic_bp,heart_rate,bmi,conditions,medications",
      ...cohort.map((patient) =>
        [
          patient.synthetic_patient_id,
          patient.age_band,
          patient.geography,
          patient.vitals.systolic_bp,
          patient.vitals.diastolic_bp,
          patient.vitals.heart_rate,
          patient.vitals.bmi,
          patient.conditions.join("|"),
          patient.medications.join("|")
        ].join(",")
      )
    ].join("\n")
  };
}

export function createFlightRecord(): ScrimedAiFlightRecord {
  const base = {
    request_id: "flight-synthetic-clinical-001",
    user_intent: "Generate synthetic clinical intelligence brief with provenance and human-review gate.",
    retrieved_context_ids: ["guideline-handoff-safety", "sop-human-review", "care-pathway-diabetes"],
    tool_calls: [
      { tool_id: "synthetic_context_loader" as const, status: "allowed" as const, latency_ms: 12 },
      { tool_id: "schema_validator" as const, status: "allowed" as const, latency_ms: 8 },
      { tool_id: "human_review_queue" as const, status: "human_review_required" as const, latency_ms: 5 }
    ],
    latency_ms: 25,
    model_used: "scrimed_internal" as const,
    model_cost_estimate: 0,
    safety_flags: ["synthetic_only", "human_review_required", "no_phi"],
    reviewer_notes: "Synthetic fixture requires reviewer validation before any operational use.",
    override_status: "human_review_required" as const,
    synthetic_only: true as const
  };

  return {
    ...base,
    audit_hash: generateScrimedAuditHash(base)
  };
}

export function getScrimedIntelligenceSampleOutput(): ScrimedAiOutputEnvelope {
  return createScrimedAiOutputEnvelope({
    output_id: "intel-output-synthetic-001",
    module: "clinical_intelligence",
    output_type: "brief",
    sources: [
      {
        source_id: "guideline-handoff-safety",
        source_type: "memory_node",
        label: "Handoff safety guideline metadata",
        route: scrimedIntelligencePlatformApiRoute
      },
      {
        source_id: "sop-human-review",
        source_type: "policy_rule",
        label: "Human review SOP",
        route: scrimedIntelligencePlatformApiRoute
      }
    ],
    confidence_score: 0.78,
    uncertainty_reason:
      "Synthetic context is incomplete and cannot represent live clinical conditions, patient preferences, current guideline updates, or organization-specific policy.",
    missing_evidence: [
      "qualified clinician validation",
      "organization policy approval",
      "current guideline review",
      "live patient context intentionally absent"
    ],
    model_version: "scrimed-internal-synthetic-router-v1",
    human_validation_status: "review_required"
  });
}

export function getScrimedIntelligencePlatformSummary(): ScrimedIntelligencePlatformSummary {
  const syntheticPatientStudio = buildSyntheticPatientStudio();
  const sampleOutput = getScrimedIntelligenceSampleOutput();
  const flightRecord = createFlightRecord();
  const evaluationSamples = getScrimedIntelligenceEvaluationSamples();
  const modelDecisions = [
    routeScrimedIntelligenceModel({
      task: "synthetic operational summary",
      cost: "low",
      latency: "interactive",
      privacy: "synthetic_only",
      accuracy_requirement: "standard",
      risk_level: "low",
      deployment_region: "us"
    }),
    routeScrimedIntelligenceModel({
      task: "clinical review summary",
      cost: "standard",
      latency: "standard",
      privacy: "synthetic_only",
      accuracy_requirement: "clinical_review_required",
      risk_level: "high",
      deployment_region: "us"
    }),
    routeScrimedIntelligenceModel({
      task: "live PHI request",
      cost: "premium",
      latency: "batch",
      privacy: "live_phi_blocked",
      accuracy_requirement: "clinical_review_required",
      risk_level: "critical",
      deployment_region: "global_review_required"
    })
  ];

  return {
    service: "scrimed-intelligence-platform",
    status: scrimedIntelligencePlatformStatus,
    route: scrimedIntelligencePlatformRoute,
    apiRoute: scrimedIntelligencePlatformApiRoute,
    briefRoute: scrimedIntelligencePlatformBriefRoute,
    updated: scrimedIntelligencePlatformUpdatedAt,
    noPhiConfirmed: true,
    syntheticOnly: true,
    productionApproval: false,
    intelligenceMesh: {
      moduleCount: scrimedIntelligenceMeshModules.length,
      highRiskModuleCount: scrimedIntelligenceMeshModules.filter((module) => module.risk_level === "high").length,
      modules: scrimedIntelligenceMeshModules
    },
    clinicalMemoryGraph: {
      nodeCount: scrimedClinicalMemoryNodes.length,
      edgeCount: scrimedClinicalMemoryEdges.length,
      nodes: scrimedClinicalMemoryNodes,
      edges: scrimedClinicalMemoryEdges
    },
    provenanceConfidence: {
      output: sampleOutput,
      requiredFields: [
        "sources",
        "confidence_score",
        "uncertainty_reason",
        "missing_evidence",
        "model_version",
        "timestamp",
        "human_validation_status",
        "clinical_disclaimer",
        "audit_hash"
      ]
    },
    flightRecorder: {
      recordCount: 1,
      records: [flightRecord]
    },
    evaluationPipeline: {
      checkCount: scrimedEvaluationChecks.length,
      releaseBlockingCount: scrimedEvaluationChecks.filter((check) => check.enforcement === "release_blocking").length,
      checks: scrimedEvaluationChecks
    },
    syntheticPatientStudio,
    outcomeIntelligence: {
      schema: outcomeKpiSchema,
      dashboardSample: outcomeDashboardSample
    },
    modelRouter: {
      providers: scrimedModelProviders,
      decisions: modelDecisions
    },
    evaluationGate: {
      route: scrimedIntelligencePlatformEvaluateRoute,
      sampleCount: evaluationSamples.length,
      sampleResults: evaluationSamples.map((sample) => evaluateScrimedIntelligenceRequest(sample))
    },
    scrimedUniversity: {
      trackCount: scrimedUniversityTracks.length,
      tracks: scrimedUniversityTracks
    },
    guardrails: {
      noGoBoundaries: scrimedIntelligenceNoGoBoundaries,
      sampleDecisions: [
        evaluateScrimedIntelligenceAction("synthetic operations metadata summary"),
        evaluateScrimedIntelligenceAction("clinical education draft"),
        evaluateScrimedIntelligenceAction("diagnose live patient and write to EHR")
      ]
    },
    boundary: scrimedIntelligencePlatformBoundary
  };
}

export function buildScrimedIntelligencePlatformBrief() {
  const summary = getScrimedIntelligencePlatformSummary();

  return [
    "# SCRIMED Intelligence Platform",
    "",
    `Status: ${summary.status}`,
    `Updated: ${summary.updated}`,
    `Synthetic only: ${summary.syntheticOnly}`,
    `No PHI confirmed: ${summary.noPhiConfirmed}`,
    `Production approval: ${summary.productionApproval}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "## Intelligence Mesh",
    `- Modules: ${summary.intelligenceMesh.moduleCount}`,
    `- High-risk modules: ${summary.intelligenceMesh.highRiskModuleCount}`,
    ...summary.intelligenceMesh.modules.map(
      (module) =>
        `- ${module.module}: ${module.risk_level}; data=${module.data_classification}; review=${module.human_review_required}`
    ),
    "",
    "## Clinical Memory Graph",
    `- Nodes: ${summary.clinicalMemoryGraph.nodeCount}`,
    `- Edges: ${summary.clinicalMemoryGraph.edgeCount}`,
    ...summary.clinicalMemoryGraph.nodes.map((node) => `- ${node.id}: ${node.type}; ${node.label}`),
    "",
    "## Provenance And Confidence",
    `- Output: ${summary.provenanceConfidence.output.output_id}`,
    `- Confidence: ${summary.provenanceConfidence.output.confidence_score}`,
    `- Audit hash: ${summary.provenanceConfidence.output.audit_hash}`,
    `- Human validation: ${summary.provenanceConfidence.output.human_validation_status}`,
    `- Disclaimer: ${summary.provenanceConfidence.output.clinical_disclaimer}`,
    "",
    "## AI Flight Recorder",
    `- Records: ${summary.flightRecorder.recordCount}`,
    ...summary.flightRecorder.records.map(
      (record) =>
        `- ${record.request_id}: ${record.override_status}; latency=${record.latency_ms}; model=${record.model_used}; hash=${record.audit_hash}`
    ),
    "",
    "## Evaluation Pipeline",
    ...summary.evaluationPipeline.checks.map(
      (check) => `- ${check.id}: ${check.status}; enforcement=${check.enforcement}`
    ),
    "",
    "## Evaluation Gate",
    `- Route: ${summary.evaluationGate.route}`,
    ...summary.evaluationGate.sampleResults.map(
      (result) =>
        `- ${result.request_id}: ${result.decision}; status=${result.status}; http=${result.http_status}; hash=${result.audit_hash}`
    ),
    "",
    "## Synthetic Patient Studio",
    `- Seed: ${summary.syntheticPatientStudio.seed}`,
    `- Cohort size: ${summary.syntheticPatientStudio.cohort.length}`,
    `- FHIR entries: ${summary.syntheticPatientStudio.fhir_r4_bundle_stub.entry.length}`,
    "",
    "## Outcome Intelligence",
    `- Clinical KPIs: ${Object.keys(summary.outcomeIntelligence.schema.clinical).join(", ")}`,
    `- Financial KPIs: ${Object.keys(summary.outcomeIntelligence.schema.financial).join(", ")}`,
    `- Operational KPIs: ${Object.keys(summary.outcomeIntelligence.schema.operational).join(", ")}`,
    `- Patient KPIs: ${Object.keys(summary.outcomeIntelligence.schema.patient).join(", ")}`,
    "",
    "## Provider-neutral Model Router",
    `- Providers: ${summary.modelRouter.providers.join(", ")}`,
    ...summary.modelRouter.decisions.map(
      (decision) =>
        `- ${decision.provider}: ${decision.route_status}; human_review_required=${decision.human_review_required}; no_external_call=${decision.no_external_call_performed}`
    ),
    "",
    "## SCRIMED University",
    `- Tracks: ${summary.scrimedUniversity.trackCount}`,
    ...summary.scrimedUniversity.tracks.map((track) => `- ${track.name}: ${track.status}`),
    "",
    "## NO-GO Boundaries",
    ...summary.guardrails.noGoBoundaries.map((boundary) => `- ${boundary}`)
  ].join("\n");
}
