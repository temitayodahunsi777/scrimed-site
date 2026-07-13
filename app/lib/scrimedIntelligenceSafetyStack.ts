import { generateScrimedAuditHash } from "./scrimedIntelligencePlatform";

export type SentinelAgentRole =
  | "clinical_agent"
  | "rcm_agent"
  | "data_integration_agent"
  | "security_agent"
  | "compliance_agent"
  | "ops_agent"
  | "developer_agent";

export type SentinelPermission =
  | "read_synthetic_metadata"
  | "read_public_reference"
  | "write_local_wal_metadata"
  | "queue_human_review"
  | "run_schema_validation"
  | "run_deidentification_preview"
  | "route_model_metadata"
  | "execute_irreversible_action";

export type SentinelToolScope =
  | "synthetic_registry"
  | "policy_engine"
  | "flight_recorder"
  | "review_queue"
  | "schema_validator"
  | "deidentification_scanner"
  | "model_router"
  | "production_database"
  | "cloud_iam"
  | "payment_processor"
  | "external_messaging"
  | "ehr_connector"
  | "payer_gateway";

export type SentinelActionType =
  | "synthetic_metadata_read"
  | "schema_validation"
  | "clinical_output_review"
  | "database_deletion"
  | "schema_change"
  | "phi_export"
  | "credential_rotation"
  | "cloud_iam_change"
  | "production_deploy"
  | "payment_execution"
  | "encryption_key_generation"
  | "external_communication"
  | "ehr_writeback"
  | "payer_submission";

export type SentinelPolicyDecision = "allow" | "deny" | "human_approval_required" | "kill_switch_triggered";

export type SentinelKillSwitchTrigger =
  | "runaway_agent"
  | "abnormal_tool_calls"
  | "privilege_escalation_attempt"
  | "retry_storm"
  | "suspicious_access_pattern";

export type SentinelAgentIdentity = {
  agentId: string;
  role: SentinelAgentRole;
  version: string;
  owner: string;
  trustTier: "lab_only" | "review_ready" | "protected_operator_only";
  permissions: SentinelPermission[];
  allowedTools: SentinelToolScope[];
};

export type SentinelActionRequest = {
  requestId: string;
  agent: SentinelAgentIdentity;
  actionType: SentinelActionType;
  requestedTool: SentinelToolScope;
  dataClassification: "synthetic_metadata" | "public_reference" | "deidentified_preview" | "phi_blocked";
  humanApprovalTokenPresent: boolean;
  retryCount: number;
  abnormalPatternDetected: boolean;
};

export type SentinelActionEvaluationPayload = {
  requestId: string;
  agentId: string;
  actionType: SentinelActionType;
  requestedTool: SentinelToolScope;
  dataClassification: SentinelActionRequest["dataClassification"];
  humanApprovalTokenPresent?: boolean;
  retryCount?: number;
  abnormalPatternDetected?: boolean;
};

export type ParsedSentinelActionEvaluationRequest =
  | { ok: true; request: SentinelActionRequest }
  | { ok: false; reason: string; rejectedField?: string };

export type SentinelAuditEvent = {
  eventId: string;
  requestId: string;
  pipeline: [
    "identity",
    "policy_engine",
    "permission_check",
    "scoped_tool_access",
    "execution",
    "audit_log"
  ];
  decision: SentinelPolicyDecision;
  reason: string;
  agentId: string;
  actionType: SentinelActionType;
  requestedTool: SentinelToolScope;
  dataClassification: SentinelActionRequest["dataClassification"];
  humanApprovalRequired: boolean;
  killSwitchTriggers: SentinelKillSwitchTrigger[];
  timestamp: typeof scrimedIntelligenceSafetyStackUpdatedAt;
  auditHash: string;
};

export type AiFlightRecorderStep = {
  stepId: string;
  traceId: string;
  agentId: string;
  inputMetadata: string;
  outputMetadata: string;
  toolCall: SentinelToolScope;
  latencyMs: number;
  failure: string | null;
  retryCount: number;
  policyDecision: SentinelPolicyDecision;
  finalOutcome: "completed" | "blocked" | "queued_for_review";
  auditHash: string;
};

export type AiFlightRecorderWalRecord = {
  walId: string;
  traceId: string;
  durabilityMode: "local_write_ahead_log_then_sync";
  localPathPattern: ".scrimed-runtime/agent-wal/*.jsonl";
  syncStatus: "pending_network_sync" | "synced" | "review_only";
  redactionPolicy: "metadata_only_no_secret_no_phi";
  recordHash: string;
};

export type HumanEvaluationQueueItem = {
  queueId: string;
  traceId: string;
  reviewerRole: "clinician" | "security_reviewer" | "compliance_reviewer" | "data_engineer";
  status: "pending" | "pass" | "fail";
  notesRequired: boolean;
  failedTracePromotesToRegression: boolean;
};

export type SentinelReviewPacket = {
  packetId: string;
  traceId: string;
  sourceEventId: string;
  reviewerRole: HumanEvaluationQueueItem["reviewerRole"];
  decisionRequired: Exclude<SentinelPolicyDecision, "allow">;
  reviewPriority: "routine" | "urgent" | "critical";
  requiredEvidence: string[];
  missingEvidence: string[];
  regressionCandidate: boolean;
  protectedPersistence: "blocked_until_aal2_and_boundary_release";
  allowedDisposition: ["pass", "fail", "needs_more_evidence"];
  blockedDisposition: string[];
  nextHumanAction: string;
  packetHash: string;
};

export type SentinelRegressionManifestCase = {
  caseId: string;
  packetId: string;
  traceId: string;
  sourceEventId: string;
  datasetId: "sentinel-regression-synthetic-v1";
  sourceDecision: Exclude<SentinelPolicyDecision, "allow">;
  scenario: string;
  expectedPolicyDecision: Exclude<SentinelPolicyDecision, "allow">;
  requiredAssertions: string[];
  fixtureBoundary: "synthetic_metadata_only";
  promotionStatus: "candidate_pending_human_review";
  reviewerGate: HumanEvaluationQueueItem["reviewerRole"];
  blockedFrom: string[];
  manifestHash: string;
};

export type SentinelRegressionManifest = {
  manifestId: string;
  datasetId: "sentinel-regression-synthetic-v1";
  status: "candidate_manifest_ready_review_only";
  generatedAt: typeof scrimedIntelligenceSafetyStackUpdatedAt;
  protectedPersistence: "blocked_until_aal2_and_boundary_release";
  cases: SentinelRegressionManifestCase[];
  nonsecretOnly: true;
  noToolExecution: true;
  noExternalCalls: true;
  manifestHash: string;
};

export type SentinelRegressionPromotionDecision =
  | "blocked_pending_human_review"
  | "eligible_for_nonsecret_regression_metadata";

export type SentinelRegressionPromotionCase = {
  gateCaseId: string;
  caseId: string;
  packetId: string;
  traceId: string;
  expectedPolicyDecision: Exclude<SentinelPolicyDecision, "allow">;
  reviewerGate: HumanEvaluationQueueItem["reviewerRole"];
  reviewStatus: HumanEvaluationQueueItem["status"] | "pending";
  promotionDecision: SentinelRegressionPromotionDecision;
  requiredBeforePromotion: string[];
  blockedReasons: string[];
  allowedPromotionTarget: "nonsecret_pytest_regression_metadata";
  disallowedPromotionTargets: string[];
  gateHash: string;
};

export type SentinelRegressionPromotionGate = {
  gateId: string;
  manifestId: SentinelRegressionManifest["manifestId"];
  status: "promotion_gate_ready_review_only";
  evaluatedAt: typeof scrimedIntelligenceSafetyStackUpdatedAt;
  protectedPersistence: "blocked_until_aal2_and_boundary_release";
  caseDecisions: SentinelRegressionPromotionCase[];
  globalRequirements: string[];
  allowedNextStep: string;
  disallowedNextSteps: string[];
  noExecutionAuthority: true;
  gateHash: string;
};

export type SentinelRegressionDisposition = "pass" | "fail" | "needs_more_evidence";

export type SentinelRegressionDispositionPayload = {
  caseId: string;
  reviewerRole: HumanEvaluationQueueItem["reviewerRole"];
  disposition: SentinelRegressionDisposition;
  notesSummary: string;
  evidenceRefs?: string[];
};

export type ParsedSentinelRegressionDispositionPreviewRequest =
  | { ok: true; payload: Required<SentinelRegressionDispositionPayload> }
  | { ok: false; reason: string; rejectedField?: string };

export type SentinelRegressionDispositionPreview = {
  previewId: string;
  caseId: string;
  reviewerRole: HumanEvaluationQueueItem["reviewerRole"];
  disposition: SentinelRegressionDisposition;
  notesSummaryHash: string;
  evidenceRefCount: number;
  acceptedForPreview: true;
  promotionDecisionAfterDisposition: SentinelRegressionPromotionDecision;
  wouldPromoteTo: "nonsecret_pytest_regression_metadata" | "none";
  blockedReasons: string[];
  noPersistencePerformed: true;
  protectedPersistence: "blocked_until_aal2_and_boundary_release";
  noExecutionAuthority: true;
  previewHash: string;
};

export type ClinicalCorrectnessEnvelope = {
  outputId: string;
  agentId: string;
  capabilityClaim: string;
  correctnessNotGuaranteed: true;
  confidence: number;
  evidenceQuality: "low" | "moderate" | "high";
  sourceQuality: "synthetic" | "public_reference" | "validated_internal_policy";
  uncertainty: string[];
  groundedness: "directly_grounded" | "partly_inferred" | "unsupported_blocked";
  clinicalRedFlags: string[];
  clinicianInLoopRequired: boolean;
  modelCardId: string;
  auditHash: string;
};

export type ClinicalAgentModelCard = {
  modelCardId: string;
  agentId: string;
  intendedUse: string;
  blockedUse: string[];
  evaluationMetadata: {
    datasetScope: "synthetic_only";
    physicianReviewRequiredBeforeClinicalUse: true;
    knownLimitations: string[];
    minimumEvidenceRequired: string[];
  };
};

export type HealthcareDataAdapterKind =
  | "FHIR"
  | "HL7_V2"
  | "CDA_CCDA"
  | "DICOM_METADATA"
  | "CSV"
  | "JSONL"
  | "SCANNED_DOCUMENT_OCR"
  | "FREE_TEXT_CLINICAL_NOTES";

export type HealthcareDataAdapter = {
  adapterId: string;
  kind: HealthcareDataAdapterKind;
  inputBoundary: "synthetic_or_deidentified_only";
  outputRepresentation: "canonical_semantic_metadata";
  rawPayloadLogging: "blocked";
  validationRequired: string[];
  provenanceRequired: true;
};

export type LocalDeidentificationScaffold = {
  supportedInputs: HealthcareDataAdapterKind[];
  phiDetection: string[];
  scannedDocumentRedaction: "coordinate_level_redaction_required";
  multilingualIdentifiers: string[];
  executionTargets: ["browser", "mac", "iphone", "edge_device"];
  externalTransferDefault: "blocked_until_authorized";
};

export type DocLangStructure = {
  representation: "DocLang-style";
  preserves: [
    "structure",
    "layout",
    "semantics",
    "tables",
    "images",
    "geometry",
    "labels",
    "values",
    "units",
    "citations"
  ];
  geometryModel: "page_block_line_token_coordinates";
  auditRequirement: "source_coordinates_required_for_redaction_and_citation";
};

export type OutcomeTrackingEntity = {
  outcomeId: string;
  category: "patient" | "workflow" | "financial" | "clinical" | "operational";
  metric:
    | "patient_outcomes"
    | "workflow_outcomes"
    | "documentation_time_saved"
    | "denial_reduction"
    | "readmission_reduction"
    | "referral_completion"
    | "follow_up_completion"
    | "medication_availability"
    | "patient_comprehension";
  reviewAfterPilotPatients: "100-200";
  vanityMetricReplacement: string;
  evidenceSource: "synthetic_pilot_metadata";
};

export type AgentOrchestrationState = {
  sessionId: string;
  agentId: string;
  currentPlan: string[];
  toolHistory: SentinelToolScope[];
  state: "planning" | "executing_metadata_only" | "blocked" | "waiting_for_human";
  remainingSteps: string[];
  budget: {
    maxToolCalls: number;
    maxRetries: number;
    maxEstimatedCostClass: "LOW" | "MODERATE" | "HIGH";
  };
  riskLevel: "low" | "moderate" | "high" | "critical";
  sharedGuardrails: string[];
  humanInLoopApprovals: string[];
};

export type SafetyModelRoute = {
  routeId: string;
  modelFamily: "frontier" | "open_weight" | "local" | "small_efficient" | "quantized" | "reasoning";
  decisionBasis: ["cost", "latency", "privacy", "task_risk"];
  allowedFor: string[];
  blockedFor: string[];
  humanReviewRequired: boolean;
};

export type CompliancePolicyScaffold = {
  policyId: string;
  framework:
    | "HIPAA"
    | "GDPR"
    | "EU_AI_ACT"
    | "FDA_SAMD_READINESS"
    | "AUDITABILITY"
    | "MODEL_RISK_MANAGEMENT"
    | "DATA_RETENTION"
    | "CONSENT"
    | "PRIVACY"
    | "CLINICAL_SAFETY";
  currentStatus: "scaffolded_not_certified" | "policy_defined" | "external_review_required";
  controls: string[];
};

export type EmotionalAiSafeguard = {
  safeguardId: string;
  rule:
    | "no_simulated_dependency"
    | "no_false_relationship_claims"
    | "clear_ai_disclosure"
    | "crisis_escalation_hooks"
    | "minor_safety_protections"
    | "no_sensitive_history_training_without_opt_in";
  enforcement: "blocked" | "human_review_required" | "disclosure_required";
};

export const scrimedIntelligenceSafetyStackUpdatedAt = "2026-07-06T00:00:00.000Z";
export const scrimedIntelligenceSafetyStackStatus =
  "scrimed-intelligence-safety-stack-sentinel-ready-synthetic-only";
export const scrimedIntelligenceSafetyStackApiRoute = "/api/scrimed-intelligence-safety-stack";
export const scrimedIntelligenceSafetyStackBriefRoute = "/api/scrimed-intelligence-safety-stack/brief";
export const projectSentinelName = "Project SENTINEL";

export const scrimedIntelligenceSafetyBoundary =
  "SCRIMED Intelligence & Safety Stack is a synthetic and metadata-only governance layer. It does not process live PHI, execute autonomous clinical care, diagnose, treat, prescribe, submit payer transactions, write to EHRs, rotate real credentials, change cloud IAM, execute payments, deploy production, send external communications, claim certification, or approve customer go-live.";

export const sentinelIrreversibleActions: SentinelActionType[] = [
  "database_deletion",
  "schema_change",
  "phi_export",
  "credential_rotation",
  "cloud_iam_change",
  "production_deploy",
  "payment_execution",
  "encryption_key_generation",
  "external_communication",
  "ehr_writeback",
  "payer_submission"
];

export const sentinelActionTypes: SentinelActionType[] = [
  "synthetic_metadata_read",
  "schema_validation",
  "clinical_output_review",
  ...sentinelIrreversibleActions
];

export const sentinelToolScopes: SentinelToolScope[] = [
  "synthetic_registry",
  "policy_engine",
  "flight_recorder",
  "review_queue",
  "schema_validator",
  "deidentification_scanner",
  "model_router",
  "production_database",
  "cloud_iam",
  "payment_processor",
  "external_messaging",
  "ehr_connector",
  "payer_gateway"
];

export const sentinelDataClassifications: SentinelActionRequest["dataClassification"][] = [
  "synthetic_metadata",
  "public_reference",
  "deidentified_preview",
  "phi_blocked"
];

export const sentinelKillSwitchTriggers: SentinelKillSwitchTrigger[] = [
  "runaway_agent",
  "abnormal_tool_calls",
  "privilege_escalation_attempt",
  "retry_storm",
  "suspicious_access_pattern"
];

export const sentinelRegressionDispositionValues: SentinelRegressionDisposition[] = [
  "pass",
  "fail",
  "needs_more_evidence"
];

export const sentinelReviewerRoles: HumanEvaluationQueueItem["reviewerRole"][] = [
  "clinician",
  "security_reviewer",
  "compliance_reviewer",
  "data_engineer"
];

export const sentinelAgents: SentinelAgentIdentity[] = [
  {
    agentId: "sentinel-security-supervisor",
    role: "security_agent",
    version: "sentinel-v1",
    owner: "Security Engineering",
    trustTier: "protected_operator_only",
    permissions: [
      "read_synthetic_metadata",
      "write_local_wal_metadata",
      "queue_human_review",
      "run_schema_validation"
    ],
    allowedTools: ["synthetic_registry", "policy_engine", "flight_recorder", "review_queue", "schema_validator"]
  },
  {
    agentId: "clinical-safety-reviewer",
    role: "clinical_agent",
    version: "clinical-safety-v1",
    owner: "Clinical Safety",
    trustTier: "review_ready",
    permissions: ["read_synthetic_metadata", "read_public_reference", "queue_human_review", "route_model_metadata"],
    allowedTools: ["synthetic_registry", "policy_engine", "flight_recorder", "review_queue", "model_router"]
  },
  {
    agentId: "fhir-data-integration-reviewer",
    role: "data_integration_agent",
    version: "data-infra-v1",
    owner: "Interoperability",
    trustTier: "lab_only",
    permissions: [
      "read_synthetic_metadata",
      "run_schema_validation",
      "run_deidentification_preview",
      "write_local_wal_metadata"
    ],
    allowedTools: ["synthetic_registry", "schema_validator", "deidentification_scanner", "flight_recorder"]
  }
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function hasTokenLikeKey(value: unknown): boolean {
  if (!isRecord(value)) return false;

  return Object.keys(value).some((key) => /(token|secret|credential|password|api.?key|bearer)/i.test(key));
}

function hasPhiOrSecretLikeText(value: string): boolean {
  return /(\b\d{3}-\d{2}-\d{4}\b|\bMRN[:#\s-]|\bDOB\b|\b\d{1,2}\/\d{1,2}\/\d{2,4}\b|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|bearer\s+|sk-[A-Za-z0-9_-]{16,})/i.test(
    value
  );
}

function stringField(payload: Record<string, unknown>, field: keyof SentinelActionEvaluationPayload) {
  const value = payload[field];
  return typeof value === "string" ? value : null;
}

export function parseSentinelActionEvaluationRequest(
  payload: unknown
): ParsedSentinelActionEvaluationRequest {
  if (!isRecord(payload)) {
    return { ok: false, reason: "Sentinel evaluation payload must be a JSON object." };
  }

  if (hasTokenLikeKey(payload)) {
    return {
      ok: false,
      reason: "Sentinel evaluation rejects token-like or secret-like fields.",
      rejectedField: "token-like-field"
    };
  }

  const requestId = stringField(payload, "requestId");
  const agentId = stringField(payload, "agentId");
  const actionType = stringField(payload, "actionType");
  const requestedTool = stringField(payload, "requestedTool");
  const dataClassification = stringField(payload, "dataClassification");

  if (!requestId) return { ok: false, reason: "requestId is required.", rejectedField: "requestId" };
  if (!agentId) return { ok: false, reason: "agentId is required.", rejectedField: "agentId" };
  if (!actionType) return { ok: false, reason: "actionType is required.", rejectedField: "actionType" };
  if (!requestedTool) return { ok: false, reason: "requestedTool is required.", rejectedField: "requestedTool" };
  if (!dataClassification) {
    return { ok: false, reason: "dataClassification is required.", rejectedField: "dataClassification" };
  }

  const agent = sentinelAgents.find((candidate) => candidate.agentId === agentId);
  if (!agent) return { ok: false, reason: "Unknown Sentinel agent identity.", rejectedField: "agentId" };
  if (!sentinelActionTypes.includes(actionType as SentinelActionType)) {
    return { ok: false, reason: "Unknown or unsupported Sentinel action type.", rejectedField: "actionType" };
  }
  if (!sentinelToolScopes.includes(requestedTool as SentinelToolScope)) {
    return { ok: false, reason: "Unknown or unsupported Sentinel tool scope.", rejectedField: "requestedTool" };
  }
  if (!sentinelDataClassifications.includes(dataClassification as SentinelActionRequest["dataClassification"])) {
    return {
      ok: false,
      reason: "Unknown or unsupported Sentinel data classification.",
      rejectedField: "dataClassification"
    };
  }

  const retryCount = Number.isInteger(payload.retryCount) ? Number(payload.retryCount) : 0;
  if (retryCount < 0 || retryCount > 50) {
    return { ok: false, reason: "retryCount must be an integer from 0 to 50.", rejectedField: "retryCount" };
  }

  return {
    ok: true,
    request: {
      requestId,
      agent,
      actionType: actionType as SentinelActionType,
      requestedTool: requestedTool as SentinelToolScope,
      dataClassification: dataClassification as SentinelActionRequest["dataClassification"],
      humanApprovalTokenPresent: payload.humanApprovalTokenPresent === true,
      retryCount,
      abnormalPatternDetected: payload.abnormalPatternDetected === true
    }
  };
}

export function evaluateSentinelAgentAction(request: SentinelActionRequest): SentinelAuditEvent {
  const killSwitchTriggers: SentinelKillSwitchTrigger[] = [];

  if (request.retryCount > 3) killSwitchTriggers.push("retry_storm");
  if (request.abnormalPatternDetected) killSwitchTriggers.push("suspicious_access_pattern");
  if (!request.agent.allowedTools.includes(request.requestedTool)) {
    killSwitchTriggers.push("privilege_escalation_attempt");
  }
  if (request.requestedTool === "production_database" || request.requestedTool === "cloud_iam") {
    killSwitchTriggers.push("abnormal_tool_calls");
  }

  const irreversible = sentinelIrreversibleActions.includes(request.actionType);
  const allowedPermission =
    request.agent.permissions.includes("execute_irreversible_action") ||
    (!irreversible && request.agent.permissions.includes("read_synthetic_metadata"));
  const toolAllowed = request.agent.allowedTools.includes(request.requestedTool);
  const phiBlocked = request.dataClassification === "phi_blocked";
  const humanApprovalRequired = irreversible || phiBlocked;
  const decision: SentinelPolicyDecision =
    killSwitchTriggers.length > 0
      ? "kill_switch_triggered"
      : humanApprovalRequired && !request.humanApprovalTokenPresent
        ? "human_approval_required"
        : allowedPermission && toolAllowed && !phiBlocked
          ? "allow"
          : "deny";
  const reason =
    decision === "allow"
      ? "Identity, policy, permission, scoped tool access, execution boundary, and audit logging all passed for metadata-only use."
      : decision === "human_approval_required"
        ? "Irreversible or sensitive action requires explicit human approval and remains blocked until approved."
        : decision === "kill_switch_triggered"
          ? "Sentinel kill switch stopped abnormal, runaway, retry, or privilege-escalation behavior."
          : "Deny-by-default policy blocked the action because permission, tool scope, or data boundary was insufficient.";

  return {
    eventId: `sentinel-audit-${request.requestId}`,
    requestId: request.requestId,
    pipeline: [
      "identity",
      "policy_engine",
      "permission_check",
      "scoped_tool_access",
      "execution",
      "audit_log"
    ],
    decision,
    reason,
    agentId: request.agent.agentId,
    actionType: request.actionType,
    requestedTool: request.requestedTool,
    dataClassification: request.dataClassification,
    humanApprovalRequired,
    killSwitchTriggers,
    timestamp: scrimedIntelligenceSafetyStackUpdatedAt,
    auditHash: generateScrimedAuditHash({
      requestId: request.requestId,
      agentId: request.agent.agentId,
      actionType: request.actionType,
      requestedTool: request.requestedTool,
      decision,
      killSwitchTriggers
    })
  };
}

const sentinelSampleRequests: SentinelActionRequest[] = [
  {
    requestId: "sentinel-allow-synthetic-read",
    agent: sentinelAgents[0],
    actionType: "synthetic_metadata_read",
    requestedTool: "synthetic_registry",
    dataClassification: "synthetic_metadata",
    humanApprovalTokenPresent: false,
    retryCount: 0,
    abnormalPatternDetected: false
  },
  {
    requestId: "sentinel-human-approval-production-deploy",
    agent: sentinelAgents[0],
    actionType: "production_deploy",
    requestedTool: "synthetic_registry",
    dataClassification: "synthetic_metadata",
    humanApprovalTokenPresent: false,
    retryCount: 0,
    abnormalPatternDetected: false
  },
  {
    requestId: "sentinel-kill-switch-cloud-iam",
    agent: sentinelAgents[2],
    actionType: "cloud_iam_change",
    requestedTool: "cloud_iam",
    dataClassification: "synthetic_metadata",
    humanApprovalTokenPresent: true,
    retryCount: 5,
    abnormalPatternDetected: true
  }
];

export const sentinelAuditEvents = sentinelSampleRequests.map(evaluateSentinelAgentAction);

export const sentinelEvaluationRoute = `${scrimedIntelligenceSafetyStackApiRoute}/evaluate`;
export const sentinelRegressionDispositionPreviewRoute = `${scrimedIntelligenceSafetyStackApiRoute}/regression-disposition-preview`;

export function getSentinelEvaluationSamples() {
  return sentinelSampleRequests.map((request) => ({
    requestId: request.requestId,
    agentId: request.agent.agentId,
    actionType: request.actionType,
    requestedTool: request.requestedTool,
    dataClassification: request.dataClassification,
    humanApprovalTokenPresent: request.humanApprovalTokenPresent,
    retryCount: request.retryCount,
    abnormalPatternDetected: request.abnormalPatternDetected
  })) satisfies SentinelActionEvaluationPayload[];
}

export const aiFlightRecorderSteps: AiFlightRecorderStep[] = sentinelAuditEvents.map((event, index) => ({
  stepId: `flight-step-${index + 1}`,
  traceId: `flight-trace-${event.requestId}`,
  agentId: event.agentId,
  inputMetadata: "metadata-only synthetic action request",
  outputMetadata: event.reason,
  toolCall: event.requestedTool,
  latencyMs: 18 + index * 11,
  failure: event.decision === "allow" ? null : event.reason,
  retryCount: index === 2 ? 5 : 0,
  policyDecision: event.decision,
  finalOutcome: event.decision === "allow" ? "completed" : "queued_for_review",
  auditHash: event.auditHash
}));

export const aiFlightRecorderWalRecords: AiFlightRecorderWalRecord[] = aiFlightRecorderSteps.map((step) => ({
  walId: `wal-${step.traceId}`,
  traceId: step.traceId,
  durabilityMode: "local_write_ahead_log_then_sync",
  localPathPattern: ".scrimed-runtime/agent-wal/*.jsonl",
  syncStatus: step.finalOutcome === "completed" ? "review_only" : "pending_network_sync",
  redactionPolicy: "metadata_only_no_secret_no_phi",
  recordHash: generateScrimedAuditHash({
    traceId: step.traceId,
    policyDecision: step.policyDecision,
    finalOutcome: step.finalOutcome
  })
}));

export const humanEvaluationQueue: HumanEvaluationQueueItem[] = [
  {
    queueId: "review-clinical-correctness-001",
    traceId: "flight-trace-sentinel-human-approval-production-deploy",
    reviewerRole: "security_reviewer",
    status: "pending",
    notesRequired: true,
    failedTracePromotesToRegression: true
  },
  {
    queueId: "review-kill-switch-001",
    traceId: "flight-trace-sentinel-kill-switch-cloud-iam",
    reviewerRole: "compliance_reviewer",
    status: "pending",
    notesRequired: true,
    failedTracePromotesToRegression: true
  }
];

function reviewPriorityForEvent(event: SentinelAuditEvent): SentinelReviewPacket["reviewPriority"] {
  if (event.killSwitchTriggers.length > 0) return "critical";
  if (event.actionType === "phi_export" || event.dataClassification === "phi_blocked") return "critical";
  if (event.humanApprovalRequired) return "urgent";

  return "routine";
}

function requiredEvidenceForEvent(event: SentinelAuditEvent) {
  const requiredEvidence = ["source audit event", "flight recorder step", "reviewer notes"];

  if (event.humanApprovalRequired) {
    requiredEvidence.push("explicit human approval disposition");
  }

  if (event.killSwitchTriggers.length > 0) {
    requiredEvidence.push("kill-switch investigation notes", "root-cause classification");
  }

  if (event.actionType === "production_deploy" || event.actionType === "cloud_iam_change") {
    requiredEvidence.push("change ticket", "rollback plan");
  }

  return requiredEvidence;
}

export function buildSentinelReviewPackets(): SentinelReviewPacket[] {
  return sentinelAuditEvents
    .filter((event) => event.decision !== "allow")
    .map((event) => {
      const queueItem = humanEvaluationQueue.find((item) => item.traceId === `flight-trace-${event.requestId}`);
      const requiredEvidence = requiredEvidenceForEvent(event);
      const missingEvidence = requiredEvidence.filter((evidence) =>
        ["explicit human approval disposition", "kill-switch investigation notes", "root-cause classification"].includes(evidence)
      );
      const packetId = `sentinel-review-packet-${event.requestId}`;

      return {
        packetId,
        traceId: `flight-trace-${event.requestId}`,
        sourceEventId: event.eventId,
        reviewerRole: queueItem?.reviewerRole ?? "security_reviewer",
        decisionRequired: event.decision as Exclude<SentinelPolicyDecision, "allow">,
        reviewPriority: reviewPriorityForEvent(event),
        requiredEvidence,
        missingEvidence,
        regressionCandidate: Boolean(queueItem?.failedTracePromotesToRegression) || event.killSwitchTriggers.length > 0,
        protectedPersistence: "blocked_until_aal2_and_boundary_release",
        allowedDisposition: ["pass", "fail", "needs_more_evidence"],
        blockedDisposition: [
          "execute production action",
          "bypass human approval",
          "persist protected evidence without AAL2",
          "send external communication",
          "store secrets or PHI"
        ],
        nextHumanAction:
          event.killSwitchTriggers.length > 0
            ? "Review kill-switch evidence, classify root cause, and promote the trace into the regression dataset if confirmed."
            : "Collect human approval disposition and reviewer notes before any future protected operator workflow.",
        packetHash: generateScrimedAuditHash({
          packetId,
          sourceEventId: event.eventId,
          decision: event.decision,
          actionType: event.actionType,
          requestedTool: event.requestedTool,
          killSwitchTriggers: event.killSwitchTriggers
        })
      };
    });
}

export function buildSentinelRegressionManifest(): SentinelRegressionManifest {
  const cases = buildSentinelReviewPackets()
    .filter((packet) => packet.regressionCandidate)
    .map((packet): SentinelRegressionManifestCase => {
      const event = sentinelAuditEvents.find((candidate) => candidate.eventId === packet.sourceEventId);
      const sourceDecision = packet.decisionRequired;
      const requiredAssertions = [
        `policy decision remains ${sourceDecision}`,
        "no tool execution performed",
        "no external call performed",
        "no PHI or secret fixture allowed",
        "audit hash remains deterministic"
      ];

      if (event?.humanApprovalRequired) {
        requiredAssertions.push("human approval remains required before protected operator workflow");
      }

      if (event?.killSwitchTriggers.length) {
        requiredAssertions.push("kill-switch trigger remains active until reviewed");
      }

      return {
        caseId: `sentinel-regression-case-${packet.packetId}`,
        packetId: packet.packetId,
        traceId: packet.traceId,
        sourceEventId: packet.sourceEventId,
        datasetId: "sentinel-regression-synthetic-v1",
        sourceDecision,
        scenario: `Replay ${packet.traceId} as a metadata-only regression case for ${sourceDecision}.`,
        expectedPolicyDecision: sourceDecision,
        requiredAssertions,
        fixtureBoundary: "synthetic_metadata_only",
        promotionStatus: "candidate_pending_human_review",
        reviewerGate: packet.reviewerRole,
        blockedFrom: [
          "production execution",
          "protected persistence without AAL2",
          "PHI fixtures",
          "secret fixtures",
          "external communications",
          "autonomous clinical or payer action"
        ],
        manifestHash: generateScrimedAuditHash({
          caseId: `sentinel-regression-case-${packet.packetId}`,
          traceId: packet.traceId,
          sourceDecision,
          requiredAssertions
        })
      };
    });

  return {
    manifestId: "sentinel-regression-manifest-synthetic-v1",
    datasetId: "sentinel-regression-synthetic-v1",
    status: "candidate_manifest_ready_review_only",
    generatedAt: scrimedIntelligenceSafetyStackUpdatedAt,
    protectedPersistence: "blocked_until_aal2_and_boundary_release",
    cases,
    nonsecretOnly: true,
    noToolExecution: true,
    noExternalCalls: true,
    manifestHash: generateScrimedAuditHash({
      manifestId: "sentinel-regression-manifest-synthetic-v1",
      caseIds: cases.map((item) => item.caseId),
      status: "candidate_manifest_ready_review_only"
    })
  };
}

export function buildSentinelRegressionPromotionGate(): SentinelRegressionPromotionGate {
  const manifest = buildSentinelRegressionManifest();
  const caseDecisions = manifest.cases.map((item): SentinelRegressionPromotionCase => {
    const reviewItem = humanEvaluationQueue.find((candidate) => candidate.traceId === item.traceId);
    const reviewStatus = reviewItem?.status ?? "pending";
    const blockedReasons =
      reviewStatus === "pass"
        ? []
        : ["human reviewer has not passed this failed trace as a regression candidate"];
    const promotionDecision: SentinelRegressionPromotionDecision =
      blockedReasons.length === 0
        ? "eligible_for_nonsecret_regression_metadata"
        : "blocked_pending_human_review";
    const gateCaseId = `sentinel-regression-promotion-${item.caseId}`;

    return {
      gateCaseId,
      caseId: item.caseId,
      packetId: item.packetId,
      traceId: item.traceId,
      expectedPolicyDecision: item.expectedPolicyDecision,
      reviewerGate: item.reviewerGate,
      reviewStatus,
      promotionDecision,
      requiredBeforePromotion: [
        "human reviewer pass disposition",
        "reviewer notes retained as metadata",
        "nonsecret fixture check",
        "PHI fixture check",
        "policy assertion check",
        "deterministic audit hash check"
      ],
      blockedReasons,
      allowedPromotionTarget: "nonsecret_pytest_regression_metadata",
      disallowedPromotionTargets: [
        "production execution",
        "clinical authority",
        "payer submission",
        "EHR writeback",
        "protected evidence persistence without AAL2",
        "external communication",
        "secret or PHI fixture"
      ],
      gateHash: generateScrimedAuditHash({
        gateCaseId,
        caseId: item.caseId,
        reviewStatus,
        promotionDecision,
        expectedPolicyDecision: item.expectedPolicyDecision
      })
    };
  });

  return {
    gateId: "sentinel-regression-promotion-gate-v1",
    manifestId: manifest.manifestId,
    status: "promotion_gate_ready_review_only",
    evaluatedAt: scrimedIntelligenceSafetyStackUpdatedAt,
    protectedPersistence: "blocked_until_aal2_and_boundary_release",
    caseDecisions,
    globalRequirements: [
      "reviewer pass disposition before nonsecret regression promotion",
      "no PHI and no secret fixtures",
      "no tool execution and no external calls",
      "expected policy decision must remain blocked or human-review-required",
      "protected persistence requires fresh AAL2, tenant role, RLS, and boundary-release approval"
    ],
    allowedNextStep:
      "After reviewer pass, materialize only nonsecret pytest regression metadata from the manifest case.",
    disallowedNextSteps: [
      "execute the original agent action",
      "treat the regression case as clinical authority",
      "submit payer or EHR transactions",
      "persist protected evidence without AAL2 and boundary-release approval",
      "include PHI, secrets, connector payloads, or bearer tokens in fixtures"
    ],
    noExecutionAuthority: true,
    gateHash: generateScrimedAuditHash({
      gateId: "sentinel-regression-promotion-gate-v1",
      manifestId: manifest.manifestId,
      caseIds: caseDecisions.map((item) => item.caseId),
      status: "promotion_gate_ready_review_only"
    })
  };
}

export function parseSentinelRegressionDispositionPreviewRequest(
  payload: unknown
): ParsedSentinelRegressionDispositionPreviewRequest {
  if (!isRecord(payload)) {
    return { ok: false, reason: "Sentinel regression disposition preview payload must be a JSON object." };
  }

  if (hasTokenLikeKey(payload)) {
    return {
      ok: false,
      reason: "Sentinel regression disposition preview rejects token-like or secret-like fields.",
      rejectedField: "token-like-field"
    };
  }

  const caseId = typeof payload.caseId === "string" ? payload.caseId : null;
  const reviewerRole = typeof payload.reviewerRole === "string" ? payload.reviewerRole : null;
  const disposition = typeof payload.disposition === "string" ? payload.disposition : null;
  const notesSummary = typeof payload.notesSummary === "string" ? payload.notesSummary : null;

  if (!caseId) return { ok: false, reason: "caseId is required.", rejectedField: "caseId" };
  if (!reviewerRole) return { ok: false, reason: "reviewerRole is required.", rejectedField: "reviewerRole" };
  if (!disposition) return { ok: false, reason: "disposition is required.", rejectedField: "disposition" };
  if (!notesSummary) return { ok: false, reason: "notesSummary is required.", rejectedField: "notesSummary" };

  const gate = buildSentinelRegressionPromotionGate();
  const gateCase = gate.caseDecisions.find((item) => item.caseId === caseId);
  if (!gateCase) return { ok: false, reason: "Unknown Sentinel regression case id.", rejectedField: "caseId" };
  if (!sentinelReviewerRoles.includes(reviewerRole as HumanEvaluationQueueItem["reviewerRole"])) {
    return { ok: false, reason: "Unknown Sentinel reviewer role.", rejectedField: "reviewerRole" };
  }
  if (reviewerRole !== gateCase.reviewerGate) {
    return { ok: false, reason: "Reviewer role does not match the case reviewer gate.", rejectedField: "reviewerRole" };
  }
  if (!sentinelRegressionDispositionValues.includes(disposition as SentinelRegressionDisposition)) {
    return { ok: false, reason: "Unsupported Sentinel regression disposition.", rejectedField: "disposition" };
  }
  if (notesSummary.length < 12 || notesSummary.length > 280) {
    return {
      ok: false,
      reason: "notesSummary must be 12 to 280 characters of nonsecret metadata.",
      rejectedField: "notesSummary"
    };
  }
  if (hasPhiOrSecretLikeText(notesSummary)) {
    return {
      ok: false,
      reason: "notesSummary appears to contain PHI-like or secret-like content.",
      rejectedField: "notesSummary"
    };
  }

  const evidenceRefs = Array.isArray(payload.evidenceRefs) ? payload.evidenceRefs : [];
  if (evidenceRefs.length > 6 || !evidenceRefs.every((item) => typeof item === "string" && item.length <= 120)) {
    return {
      ok: false,
      reason: "evidenceRefs must be an array of up to six short metadata reference strings.",
      rejectedField: "evidenceRefs"
    };
  }
  if (evidenceRefs.some(hasPhiOrSecretLikeText)) {
    return {
      ok: false,
      reason: "evidenceRefs appear to contain PHI-like or secret-like content.",
      rejectedField: "evidenceRefs"
    };
  }

  return {
    ok: true,
    payload: {
      caseId,
      reviewerRole: reviewerRole as HumanEvaluationQueueItem["reviewerRole"],
      disposition: disposition as SentinelRegressionDisposition,
      notesSummary,
      evidenceRefs
    }
  };
}

export function buildSentinelRegressionDispositionPreview(
  payload: Required<SentinelRegressionDispositionPayload>
): SentinelRegressionDispositionPreview {
  const promotionDecisionAfterDisposition: SentinelRegressionPromotionDecision =
    payload.disposition === "pass"
      ? "eligible_for_nonsecret_regression_metadata"
      : "blocked_pending_human_review";
  const blockedReasons =
    payload.disposition === "pass"
      ? []
      : [
          payload.disposition === "fail"
            ? "reviewer failed this regression candidate"
            : "reviewer requested more evidence before promotion"
        ];
  const previewId = `sentinel-regression-disposition-preview-${payload.caseId}`;
  const notesSummaryHash = generateScrimedAuditHash({
    previewId,
    notesSummary: payload.notesSummary,
    evidenceRefs: payload.evidenceRefs
  });

  return {
    previewId,
    caseId: payload.caseId,
    reviewerRole: payload.reviewerRole,
    disposition: payload.disposition,
    notesSummaryHash,
    evidenceRefCount: payload.evidenceRefs.length,
    acceptedForPreview: true,
    promotionDecisionAfterDisposition,
    wouldPromoteTo:
      promotionDecisionAfterDisposition === "eligible_for_nonsecret_regression_metadata"
        ? "nonsecret_pytest_regression_metadata"
        : "none",
    blockedReasons,
    noPersistencePerformed: true,
    protectedPersistence: "blocked_until_aal2_and_boundary_release",
    noExecutionAuthority: true,
    previewHash: generateScrimedAuditHash({
      previewId,
      caseId: payload.caseId,
      reviewerRole: payload.reviewerRole,
      disposition: payload.disposition,
      promotionDecisionAfterDisposition,
      evidenceRefCount: payload.evidenceRefs.length
    })
  };
}

export function getSentinelRegressionDispositionPreviewSamples(): SentinelRegressionDispositionPayload[] {
  return buildSentinelRegressionPromotionGate().caseDecisions.map((item) => ({
    caseId: item.caseId,
    reviewerRole: item.reviewerGate,
    disposition: "needs_more_evidence",
    notesSummary: "Synthetic metadata review requires root-cause notes before promotion.",
    evidenceRefs: [item.gateCaseId, item.traceId]
  }));
}

export const aiEvaluationDatasets = [
  {
    datasetId: "sentinel-regression-synthetic-v1",
    source: "failed flight traces promoted by reviewers",
    pytestPath: "evals/pytest/test_scrimed_intelligence_safety_stack.py",
    scope: "policy decisions, PHI blocking, irreversible action approval, kill-switch behavior"
  }
];

export const clinicalModelCards: ClinicalAgentModelCard[] = [
  {
    modelCardId: "clinical-safety-reviewer-card-v1",
    agentId: "clinical-safety-reviewer",
    intendedUse: "Synthetic clinical-output safety review, evidence-quality scoring, and clinician review routing.",
    blockedUse: ["diagnosis", "treatment", "prescribing", "emergency triage", "final imaging interpretation"],
    evaluationMetadata: {
      datasetScope: "synthetic_only",
      physicianReviewRequiredBeforeClinicalUse: true,
      knownLimitations: [
        "Capability demonstrations are not correctness guarantees.",
        "Synthetic evidence does not establish clinical validation.",
        "Human clinicians remain final authority for any future clinical workflow."
      ],
      minimumEvidenceRequired: ["source attribution", "confidence", "uncertainty", "evidence quality", "human review status"]
    }
  }
];

export const clinicalCorrectnessEnvelopes: ClinicalCorrectnessEnvelope[] = [
  {
    outputId: "clinical-correctness-envelope-001",
    agentId: "clinical-safety-reviewer",
    capabilityClaim: "Can pre-screen synthetic clinical text for evidence gaps and unsafe unsupported recommendations.",
    correctnessNotGuaranteed: true,
    confidence: 0.74,
    evidenceQuality: "moderate",
    sourceQuality: "synthetic",
    uncertainty: ["No live patient context", "No clinician adjudication", "No prospective validation"],
    groundedness: "partly_inferred",
    clinicalRedFlags: ["unsupported recommendation", "missing citation", "high-risk clinical output"],
    clinicianInLoopRequired: true,
    modelCardId: "clinical-safety-reviewer-card-v1",
    auditHash: generateScrimedAuditHash("clinical-correctness-envelope-001")
  }
];

export const healthcareDataAdapters: HealthcareDataAdapter[] = [
  "FHIR",
  "HL7_V2",
  "CDA_CCDA",
  "DICOM_METADATA",
  "CSV",
  "JSONL",
  "SCANNED_DOCUMENT_OCR",
  "FREE_TEXT_CLINICAL_NOTES"
].map((kind) => ({
  adapterId: `adapter-${kind.toLowerCase().replaceAll("_", "-")}`,
  kind: kind as HealthcareDataAdapterKind,
  inputBoundary: "synthetic_or_deidentified_only",
  outputRepresentation: "canonical_semantic_metadata",
  rawPayloadLogging: "blocked",
  validationRequired: ["schema validation", "PHI scan", "provenance binding", "audit hash"],
  provenanceRequired: true
}));

export const localDeidentificationScaffold: LocalDeidentificationScaffold = {
  supportedInputs: healthcareDataAdapters.map((adapter) => adapter.kind),
  phiDetection: [
    "names",
    "dates",
    "addresses",
    "phone numbers",
    "emails",
    "MRNs",
    "member IDs",
    "faces",
    "barcodes",
    "document coordinates",
    "multilingual identifiers"
  ],
  scannedDocumentRedaction: "coordinate_level_redaction_required",
  multilingualIdentifiers: ["English", "Spanish", "French", "Yoruba", "Arabic"],
  executionTargets: ["browser", "mac", "iphone", "edge_device"],
  externalTransferDefault: "blocked_until_authorized"
};

export const docLangStructure: DocLangStructure = {
  representation: "DocLang-style",
  preserves: [
    "structure",
    "layout",
    "semantics",
    "tables",
    "images",
    "geometry",
    "labels",
    "values",
    "units",
    "citations"
  ],
  geometryModel: "page_block_line_token_coordinates",
  auditRequirement: "source_coordinates_required_for_redaction_and_citation"
};

export const outcomeTrackingEntities: OutcomeTrackingEntity[] = [
  {
    outcomeId: "outcome-documentation-time-saved",
    category: "workflow",
    metric: "documentation_time_saved",
    reviewAfterPilotPatients: "100-200",
    vanityMetricReplacement: "minutes saved per signed human-reviewed workflow",
    evidenceSource: "synthetic_pilot_metadata"
  },
  {
    outcomeId: "outcome-denial-reduction",
    category: "financial",
    metric: "denial_reduction",
    reviewAfterPilotPatients: "100-200",
    vanityMetricReplacement: "avoidable denial rate after documentation completeness review",
    evidenceSource: "synthetic_pilot_metadata"
  },
  {
    outcomeId: "outcome-readmission-reduction",
    category: "clinical",
    metric: "readmission_reduction",
    reviewAfterPilotPatients: "100-200",
    vanityMetricReplacement: "human-reviewed care-transition gap closure rate",
    evidenceSource: "synthetic_pilot_metadata"
  },
  {
    outcomeId: "outcome-referral-completion",
    category: "patient",
    metric: "referral_completion",
    reviewAfterPilotPatients: "100-200",
    vanityMetricReplacement: "closed-loop referral completion with documented owner",
    evidenceSource: "synthetic_pilot_metadata"
  },
  {
    outcomeId: "outcome-medication-availability",
    category: "operational",
    metric: "medication_availability",
    reviewAfterPilotPatients: "100-200",
    vanityMetricReplacement: "availability issue routed to human medication support owner",
    evidenceSource: "synthetic_pilot_metadata"
  },
  {
    outcomeId: "outcome-patient-comprehension",
    category: "patient",
    metric: "patient_comprehension",
    reviewAfterPilotPatients: "100-200",
    vanityMetricReplacement: "teach-back comprehension checkpoint completion",
    evidenceSource: "synthetic_pilot_metadata"
  }
];

export const agentOrchestrationStates: AgentOrchestrationState[] = [
  {
    sessionId: "shared-session-synthetic-pilot-001",
    agentId: "clinical-safety-reviewer",
    currentPlan: ["load synthetic metadata", "validate sources", "score evidence quality", "queue clinician review"],
    toolHistory: ["synthetic_registry", "policy_engine", "flight_recorder", "review_queue"],
    state: "waiting_for_human",
    remainingSteps: ["reviewer pass/fail", "promote failed trace to regression dataset"],
    budget: {
      maxToolCalls: 8,
      maxRetries: 2,
      maxEstimatedCostClass: "LOW"
    },
    riskLevel: "high",
    sharedGuardrails: ["no PHI", "no diagnosis", "no treatment", "no EHR writeback", "no payer submission"],
    humanInLoopApprovals: ["clinician review", "security review for protected operations"]
  }
];

export const safetyModelRoutes: SafetyModelRoute[] = [
  {
    routeId: "frontier-high-risk-review",
    modelFamily: "frontier",
    decisionBasis: ["cost", "latency", "privacy", "task_risk"],
    allowedFor: ["synthetic high-risk reasoning review", "evidence synthesis after policy gate"],
    blockedFor: ["live PHI without contract approval", "autonomous clinical authority"],
    humanReviewRequired: true
  },
  {
    routeId: "local-privacy-first",
    modelFamily: "local",
    decisionBasis: ["cost", "latency", "privacy", "task_risk"],
    allowedFor: ["on-device de-identification preview", "metadata classification", "edge inference planning"],
    blockedFor: ["final diagnosis", "prescribing", "payer submission"],
    humanReviewRequired: true
  },
  {
    routeId: "small-efficient-ops",
    modelFamily: "small_efficient",
    decisionBasis: ["cost", "latency", "privacy", "task_risk"],
    allowedFor: ["low-risk operations summarization", "routing metadata", "workflow state explanation"],
    blockedFor: ["high-risk clinical recommendations", "credential operations"],
    humanReviewRequired: false
  },
  {
    routeId: "quantized-edge-reasoning",
    modelFamily: "quantized",
    decisionBasis: ["cost", "latency", "privacy", "task_risk"],
    allowedFor: ["air-gapped metadata triage", "offline synthetic evaluation"],
    blockedFor: ["clinical authority", "PHI export", "external communication"],
    humanReviewRequired: true
  }
];

export const compliancePolicyScaffolds: CompliancePolicyScaffold[] = [
  {
    policyId: "policy-hipaa",
    framework: "HIPAA",
    currentStatus: "external_review_required",
    controls: ["minimum necessary", "PHI access gate", "BAA before live PHI", "audit trail"]
  },
  {
    policyId: "policy-gdpr",
    framework: "GDPR",
    currentStatus: "policy_defined",
    controls: ["data minimization", "purpose limitation", "data subject rights", "residency review"]
  },
  {
    policyId: "policy-eu-ai-act",
    framework: "EU_AI_ACT",
    currentStatus: "scaffolded_not_certified",
    controls: ["risk classification", "human oversight", "logging", "transparency"]
  },
  {
    policyId: "policy-fda-samd-readiness",
    framework: "FDA_SAMD_READINESS",
    currentStatus: "external_review_required",
    controls: ["intended use", "clinical risk analysis", "validation plan", "change control"]
  },
  {
    policyId: "policy-model-risk",
    framework: "MODEL_RISK_MANAGEMENT",
    currentStatus: "policy_defined",
    controls: ["model card", "evaluation registry", "drift monitoring", "rollback criteria"]
  },
  {
    policyId: "policy-clinical-safety",
    framework: "CLINICAL_SAFETY",
    currentStatus: "external_review_required",
    controls: ["clinician review", "red flags", "escalation", "no autonomous clinical authority"]
  }
];

export const emotionalAiSafeguards: EmotionalAiSafeguard[] = [
  { safeguardId: "emotional-ai-no-dependency", rule: "no_simulated_dependency", enforcement: "blocked" },
  { safeguardId: "emotional-ai-no-false-relationship", rule: "no_false_relationship_claims", enforcement: "blocked" },
  { safeguardId: "emotional-ai-disclosure", rule: "clear_ai_disclosure", enforcement: "disclosure_required" },
  { safeguardId: "emotional-ai-crisis", rule: "crisis_escalation_hooks", enforcement: "human_review_required" },
  { safeguardId: "emotional-ai-minors", rule: "minor_safety_protections", enforcement: "human_review_required" },
  {
    safeguardId: "emotional-ai-training-opt-in",
    rule: "no_sensitive_history_training_without_opt_in",
    enforcement: "blocked"
  }
];

export function validateScrimedIntelligenceSafetyStack() {
  const reviewPackets = buildSentinelReviewPackets();
  const regressionManifest = buildSentinelRegressionManifest();
  const promotionGate = buildSentinelRegressionPromotionGate();
  const dispositionPreviewSamples = getSentinelRegressionDispositionPreviewSamples();
  const checks = [
    {
      check: "sentinel-deny-by-default",
      passed:
        sentinelAuditEvents.some((event) => event.decision === "human_approval_required") &&
        sentinelAuditEvents.some((event) => event.decision === "kill_switch_triggered"),
      detail: "Sentinel blocks irreversible actions without approval and triggers kill switches for suspicious access."
    },
    {
      check: "all-agent-actions-are-audited",
      passed: sentinelAuditEvents.every(
        (event) =>
          event.pipeline.join(">") ===
            "identity>policy_engine>permission_check>scoped_tool_access>execution>audit_log" &&
          event.auditHash.startsWith("scrimed-intel-")
      ),
      detail: "Every sample action passes through identity, policy, permission, scoped tool access, execution, and audit log."
    },
    {
      check: "flight-recorder-has-local-wal",
      passed: aiFlightRecorderWalRecords.every(
        (record) =>
          record.durabilityMode === "local_write_ahead_log_then_sync" &&
          record.redactionPolicy === "metadata_only_no_secret_no_phi"
      ),
      detail: "Flight recorder records are designed for metadata-only local write-ahead logs and later sync."
    },
    {
      check: "clinical-correctness-is-not-capability",
      passed: clinicalCorrectnessEnvelopes.every(
        (envelope) => envelope.correctnessNotGuaranteed && envelope.clinicianInLoopRequired
      ),
      detail: "Clinical outputs separate capability from correctness and route high-risk material to clinicians."
    },
    {
      check: "data-adapters-block-raw-payload-logging",
      passed: healthcareDataAdapters.every((adapter) => adapter.rawPayloadLogging === "blocked"),
      detail: "FHIR, HL7 v2, CDA/C-CDA, DICOM metadata, CSV, JSONL, OCR, and notes adapters block raw payload logs."
    },
    {
      check: "outcomes-review-after-100-200-patients",
      passed: outcomeTrackingEntities.every((outcome) => outcome.reviewAfterPilotPatients === "100-200"),
      detail: "Outcome tracking prioritizes pilot review after the first 100-200 patients rather than vanity metrics."
    },
    {
      check: "orchestration-exposes-plan-state-budget-risk",
      passed: agentOrchestrationStates.every(
        (state) =>
          state.currentPlan.length > 0 &&
          state.toolHistory.length > 0 &&
          state.remainingSteps.length > 0 &&
          state.budget.maxToolCalls > 0 &&
          state.riskLevel.length > 0
      ),
      detail: "Agents expose current plan, tool history, state, remaining steps, budget, and risk level."
    },
    {
      check: "compliance-and-emotional-ai-guardrails-present",
      passed:
        compliancePolicyScaffolds.length >= 6 &&
        emotionalAiSafeguards.some((safeguard) => safeguard.rule === "no_simulated_dependency") &&
        emotionalAiSafeguards.some((safeguard) => safeguard.rule === "clear_ai_disclosure"),
      detail: "Compliance scaffolds and anthropomorphic AI safeguards are present."
    },
    {
      check: "sentinel-review-packets-cover-blocked-events",
      passed:
        reviewPackets.length === sentinelAuditEvents.filter((event) => event.decision !== "allow").length &&
        reviewPackets.every((packet) => packet.protectedPersistence === "blocked_until_aal2_and_boundary_release"),
      detail: "Every blocked or review-required Sentinel event has a read-only review packet with protected persistence blocked."
    },
    {
      check: "sentinel-review-packets-cannot-dispose-to-execution",
      passed: reviewPackets.every(
        (packet) =>
          packet.blockedDisposition.includes("execute production action") &&
          packet.blockedDisposition.includes("store secrets or PHI")
      ),
      detail: "Review packets allow pass/fail/needs-more-evidence only; they cannot execute production actions or store PHI."
    },
    {
      check: "sentinel-regression-manifest-covers-candidates",
      passed:
        regressionManifest.cases.length === reviewPackets.filter((packet) => packet.regressionCandidate).length &&
        regressionManifest.cases.every((item) => item.datasetId === "sentinel-regression-synthetic-v1"),
      detail: "Every review packet flagged as a regression candidate appears in the synthetic Sentinel regression manifest."
    },
    {
      check: "sentinel-regression-manifest-is-nonsecret-review-only",
      passed:
        regressionManifest.nonsecretOnly &&
        regressionManifest.noToolExecution &&
        regressionManifest.noExternalCalls &&
        regressionManifest.cases.every(
          (item) =>
            item.fixtureBoundary === "synthetic_metadata_only" &&
            item.promotionStatus === "candidate_pending_human_review" &&
            item.blockedFrom.includes("PHI fixtures") &&
            item.blockedFrom.includes("secret fixtures") &&
            item.blockedFrom.includes("autonomous clinical or payer action")
        ),
      detail: "Regression candidates are nonsecret, metadata-only, human-review-gated, and blocked from clinical or payer execution."
    },
    {
      check: "sentinel-regression-promotion-gate-blocks-unreviewed-cases",
      passed: promotionGate.caseDecisions.every(
        (item) =>
          item.reviewStatus === "pass" ||
          item.promotionDecision === "blocked_pending_human_review"
      ),
      detail: "Regression cases cannot be promoted until a human reviewer passes the failed trace."
    },
    {
      check: "sentinel-regression-promotion-gate-has-no-execution-authority",
      passed:
        promotionGate.noExecutionAuthority &&
        promotionGate.caseDecisions.every(
          (item) =>
            item.allowedPromotionTarget === "nonsecret_pytest_regression_metadata" &&
            item.disallowedPromotionTargets.includes("clinical authority") &&
            item.disallowedPromotionTargets.includes("payer submission") &&
            item.disallowedPromotionTargets.includes("EHR writeback") &&
            item.disallowedPromotionTargets.includes("secret or PHI fixture")
        ),
      detail: "Promotion decisions can only produce nonsecret regression metadata and never authorize clinical, payer, EHR, or PHI-impacting actions."
    },
    {
      check: "sentinel-regression-disposition-preview-is-nonpersistent",
      passed: dispositionPreviewSamples.every((sample) => {
        const parsed = parseSentinelRegressionDispositionPreviewRequest(sample);
        return (
          parsed.ok &&
          buildSentinelRegressionDispositionPreview(parsed.payload).noPersistencePerformed &&
          buildSentinelRegressionDispositionPreview(parsed.payload).noExecutionAuthority
        );
      }),
      detail: "Reviewer disposition previews validate metadata only and do not persist decisions or grant execution authority."
    },
    {
      check: "sentinel-regression-disposition-preview-rejects-secrets-and-phi",
      passed:
        !parseSentinelRegressionDispositionPreviewRequest({
          ...dispositionPreviewSamples[0],
          bearerToken: "redacted"
        }).ok &&
        !parseSentinelRegressionDispositionPreviewRequest({
          ...dispositionPreviewSamples[0],
          notesSummary: "Synthetic note with DOB 01/01/1970 should be rejected."
        }).ok,
      detail: "Disposition previews reject token-like fields and PHI-like notes before any regression promotion preview."
    }
  ];

  return {
    status: checks.every((check) => check.passed) ? "pass" : "fail",
    checks
  };
}

export function getScrimedIntelligenceSafetyStackSummary() {
  const validation = validateScrimedIntelligenceSafetyStack();
  const reviewPackets = buildSentinelReviewPackets();
  const regressionManifest = buildSentinelRegressionManifest();
  const regressionPromotionGate = buildSentinelRegressionPromotionGate();
  const dispositionPreviewSamples = getSentinelRegressionDispositionPreviewSamples();

  return {
    service: "scrimed-intelligence-safety-stack",
    status: scrimedIntelligenceSafetyStackStatus,
    updatedAt: scrimedIntelligenceSafetyStackUpdatedAt,
    apiRoute: scrimedIntelligenceSafetyStackApiRoute,
    briefRoute: scrimedIntelligenceSafetyStackBriefRoute,
    evaluateRoute: sentinelEvaluationRoute,
    dispositionPreviewRoute: sentinelRegressionDispositionPreviewRoute,
    boundary: scrimedIntelligenceSafetyBoundary,
    sentinel: {
      name: projectSentinelName,
      agents: sentinelAgents,
      irreversibleActions: sentinelIrreversibleActions,
      killSwitchTriggers: sentinelKillSwitchTriggers,
      auditEvents: sentinelAuditEvents,
      evaluationSamples: getSentinelEvaluationSamples(),
      reviewPackets,
      reviewPacketCount: reviewPackets.length,
      regressionCandidateCount: reviewPackets.filter((packet) => packet.regressionCandidate).length,
      regressionManifest,
      regressionManifestCaseCount: regressionManifest.cases.length,
      regressionPromotionGate,
      regressionPromotionBlockedCount: regressionPromotionGate.caseDecisions.filter(
        (item) => item.promotionDecision !== "eligible_for_nonsecret_regression_metadata"
      ).length,
      dispositionPreviewSamples,
      dispositionPreviewSampleCount: dispositionPreviewSamples.length,
      denyByDefault: true
    },
    flightRecorder: {
      steps: aiFlightRecorderSteps,
      walRecords: aiFlightRecorderWalRecords,
      reviewQueue: humanEvaluationQueue,
      evaluationDatasets: aiEvaluationDatasets
    },
    clinicalSafety: {
      correctnessEnvelopes: clinicalCorrectnessEnvelopes,
      modelCards: clinicalModelCards,
      clinicianInLoopRequired: true
    },
    dataInfrastructure: {
      adapters: healthcareDataAdapters,
      localDeidentificationScaffold,
      docLangStructure
    },
    outcomes: {
      trackingEntities: outcomeTrackingEntities,
      reviewWorkflow: "Run outcomes review after first 100-200 patients per approved pilot.",
      dashboardPriority: "patient, workflow, clinical, financial, and operational outcomes over token or click vanity metrics"
    },
    orchestration: {
      states: agentOrchestrationStates,
      modelRoutes: safetyModelRoutes,
      sharedSessions: true,
      humanInLoopApprovals: true
    },
    governance: {
      policies: compliancePolicyScaffolds,
      emotionalAiSafeguards,
      certificationClaimsBlocked: true
    },
    validation,
    recommendedNextBuildStep:
      "Persist Sentinel audit events to the protected durable store only after the same AAL2, tenant-role, RLS, and boundary-release approvals used by other protected SCRIMED operator flows are fresh."
  };
}

export function buildScrimedIntelligenceSafetyStackBrief() {
  const summary = getScrimedIntelligenceSafetyStackSummary();

  return [
    "# SCRIMED Intelligence & Safety Stack",
    "",
    `Status: ${summary.status}`,
    `API: ${summary.apiRoute}`,
    `Evaluator: ${summary.evaluateRoute}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "## Project SENTINEL",
    ...summary.sentinel.auditEvents.map(
      (event) =>
        `- ${event.requestId}: ${event.decision}; action ${event.actionType}; tool ${event.requestedTool}; hash ${event.auditHash}`
    ),
    "",
    "## Sentinel Review Packets",
    ...summary.sentinel.reviewPackets.map(
      (packet) =>
        `- ${packet.packetId}: ${packet.decisionRequired}; priority ${packet.reviewPriority}; missing ${packet.missingEvidence.join(", ") || "none"}; hash ${packet.packetHash}`
    ),
    "",
    "## Sentinel Regression Manifest",
    `- Manifest: ${summary.sentinel.regressionManifest.manifestId}.`,
    `- Status: ${summary.sentinel.regressionManifest.status}.`,
    `- Cases: ${summary.sentinel.regressionManifestCaseCount}.`,
    "- Scope: synthetic metadata only; no PHI, no secrets, no tool execution, no external calls, and no autonomous clinical or payer action.",
    "",
    "## Sentinel Regression Promotion Gate",
    `- Gate: ${summary.sentinel.regressionPromotionGate.gateId}.`,
    `- Status: ${summary.sentinel.regressionPromotionGate.status}.`,
    `- Blocked cases: ${summary.sentinel.regressionPromotionBlockedCount}.`,
    `- Allowed target: ${summary.sentinel.regressionPromotionGate.caseDecisions[0]?.allowedPromotionTarget ?? "none"}.`,
    "- No execution authority: true.",
    "",
    "## Sentinel Regression Disposition Preview",
    `- Route: ${summary.dispositionPreviewRoute}.`,
    `- Samples: ${summary.sentinel.dispositionPreviewSampleCount}.`,
    "- Purpose: validate reviewer disposition metadata without persistence, PHI, secrets, tool execution, external calls, or production authority.",
    "",
    "## AI Flight Recorder",
    ...summary.flightRecorder.steps.map(
      (step) =>
        `- ${step.traceId}: ${step.policyDecision}; outcome ${step.finalOutcome}; latency ${step.latencyMs}ms; hash ${step.auditHash}`
    ),
    "",
    "## Clinical Safety",
    ...summary.clinicalSafety.correctnessEnvelopes.map(
      (envelope) =>
        `- ${envelope.outputId}: confidence ${envelope.confidence}; evidence ${envelope.evidenceQuality}; groundedness ${envelope.groundedness}; clinician review ${envelope.clinicianInLoopRequired}`
    ),
    "",
    "## Data Infrastructure",
    ...summary.dataInfrastructure.adapters.map(
      (adapter) => `- ${adapter.kind}: ${adapter.outputRepresentation}; raw payload logging ${adapter.rawPayloadLogging}`
    ),
    "",
    "## Outcomes",
    ...summary.outcomes.trackingEntities.map(
      (outcome) => `- ${outcome.metric}: review after ${outcome.reviewAfterPilotPatients} patients; ${outcome.vanityMetricReplacement}`
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
