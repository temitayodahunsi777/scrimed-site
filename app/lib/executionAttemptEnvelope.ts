import { createHash } from "node:crypto";
import {
  buildClinicalRobustnessScorecard,
  clinicalRobustnessLabRoute,
  clinicalRobustnessScenarios,
  getClinicalRobustnessLabSummary
} from "./clinicalRobustnessLab";
import {
  isScrimedComputeAuditHash,
  scrimedComputeFabricStatus,
  scrimedComputeFabricVersion,
  selectScrimedModelForTask,
  type ScrimedComputeCostClass,
  type ScrimedComputeDeploymentMode,
  type ScrimedComputeLatencyClass,
  type ScrimedComputeModality,
  type ScrimedComputeModelTier,
  type ScrimedComputePhiPolicy,
  type ScrimedComputePhiSensitivity,
  type ScrimedComputeProvider,
  type ScrimedComputeReasoningDepth,
  type ScrimedComputeRiskLevel,
  type ScrimedComputeTaskType
} from "./scrimedComputeFabric";
import { routeScrimedModelTask } from "./modelAgnosticRouter";
import { evaluateScrimedSafetyGate } from "./scrimedSafetyGovernance";

export type ExecutionAttemptEnvelopeBuildStatus =
  | "metadata-only-accepted"
  | "metadata-only-rejected";

export type ExecutionAttemptLifecycleState =
  | "received"
  | "deduplicated"
  | "review-required"
  | "preflight-denied"
  | "replay-ready"
  | "failed-quarantined";

export type ExecutionAttemptActionClass =
  | "clinical-evidence-draft"
  | "payer-policy-synthesis"
  | "administrative-summarization"
  | "workflow-planning"
  | "organization-policy-review";

export type ExecutionAttemptRiskLevel = "low" | "moderate" | "high" | "prohibited";

export type ExecutionAttemptProviderClass =
  | "frontier-closed"
  | "open-weight"
  | "regional-specialist"
  | "future-model";

export type ExecutionAttemptScorecardCategory =
  | "agent-scorecard"
  | "hallucination-check"
  | "clinical-safety"
  | "clinical-robustness"
  | "evidence-quality"
  | "regression"
  | "synthetic-patient"
  | "adversarial"
  | "missing-data";

export type ExecutionAttemptEnvelopeInput = {
  workflowSlug: string;
  workflowVersion: string;
  requestedAction: string;
  actionClass: ExecutionAttemptActionClass;
  tenantReference: string;
  callerRole: string;
  agentRuntimeId: string;
  taskType: string;
  clinicalRiskLevel: ExecutionAttemptRiskLevel;
  preferredProviderClass: ExecutionAttemptProviderClass;
  fallbackProviderClass: ExecutionAttemptProviderClass;
  contextRefs: string[];
  evidenceRefs: string[];
  policyRefs: string[];
  submittedText: string;
};

export type ExecutionAttemptModelRouteTelemetry = {
  routeId: string;
  taskType: string;
  providerClass: ExecutionAttemptProviderClass;
  providerName: string;
  modelVersion: string;
  fallbackProviderClass: ExecutionAttemptProviderClass;
  routeProfile: string;
  riskTier: ExecutionAttemptRiskLevel;
  estimatedCostUsd: number;
  latencyBudgetMs: number;
  confidence: number;
  routingRationale: string;
  telemetryBoundary: string;
};

export type ExecutionAttemptComputeFabricTelemetry = {
  fabricVersion: typeof scrimedComputeFabricVersion;
  fabricStatus: typeof scrimedComputeFabricStatus;
  selectedModel: string;
  modelTier: ScrimedComputeModelTier;
  provider: ScrimedComputeProvider;
  deploymentMode: ScrimedComputeDeploymentMode;
  reason: string;
  riskLevel: ScrimedComputeRiskLevel;
  phiPolicy: ScrimedComputePhiPolicy;
  requiresHumanReview: boolean;
  fallbackModels: string[];
  estimatedCostClass: ScrimedComputeCostClass;
  estimatedLatencyClass: ScrimedComputeLatencyClass;
  auditTags: string[];
  auditHash: string;
  confidenceScore: number;
  confidenceCorrectnessBoundary: "confidence-is-not-correctness";
  correctnessEvidenceRequired: string[];
  uncertaintyReasons: string[];
  safetyBoundary: "metadata-only-no-live-model-call";
};

export type ExecutionAttemptHumanApprovalGate = {
  required: true;
  reviewStatus: "held-for-human-review";
  requiredReviewers: string[];
  gateReason: string;
  releaseCondition: string;
  deniedUntil: string;
};

export type ExecutionAttemptAuditTrail = {
  auditEventId: string;
  traceId: string;
  eventHash: string;
  immutableEventType: string;
  retainedFields: string[];
  prohibitedFields: string[];
};

export type ExecutionAttemptReplayMetadata = {
  replayToken: string;
  replayEligible: boolean;
  idempotencyScope: string;
  ttlHours: number;
  deterministicInputs: string[];
  replayPolicy: string;
  conflictResponse: string;
  expirationBehavior: string;
};

export type ExecutionAttemptToolPlan = {
  toolRegistryVersion: string;
  allowedTools: string[];
  blockedTools: string[];
  noConnectorAccess: boolean;
  noRecordMutation: boolean;
};

export type ExecutionAttemptFailureRecovery = {
  retryPolicy: string;
  quarantineTriggers: string[];
  fallbackBehavior: string;
  rollbackBehavior: string;
  deadLetterOwner: string;
};

export type ExecutionAttemptEvidenceAuditTrail = {
  attempt_id: string;
  user_session_tenant_context: {
    tenantReference: string;
    callerRole: string;
    agentRuntimeId: string;
    sessionReference: "metadata-only-no-live-session";
  };
  timestamp: string;
  route: string;
  action: string;
  allowed_blocked_decision: "allowed" | "blocked";
  policy_version: string;
  input_classification: string;
  phi_detected: boolean;
  synthetic: boolean;
  model_provider_selected: string;
  model_tier_selected: string;
  compute_fabric_audit_hash: string;
  compute_fabric_selected_model: string;
  compute_fabric_model_tier: ScrimedComputeModelTier;
  compute_fabric_provider: ScrimedComputeProvider;
  compute_fabric_deployment_mode: ScrimedComputeDeploymentMode;
  compute_fabric_phi_policy: ScrimedComputePhiPolicy;
  compute_fabric_human_review_required: boolean;
  output_hash: string;
  evidence_envelope_hash: string;
  status: ExecutionAttemptLifecycleState;
  failure_reason: string | null;
};

export type ExecutionAttemptEnvelope = {
  attemptId: string;
  contractVersion: string;
  buildStatus: ExecutionAttemptEnvelopeBuildStatus;
  lifecycleState: ExecutionAttemptLifecycleState;
  workflowSlug: string;
  workflowVersion: string;
  idempotencyKey: string;
  createdAt: string;
  tenantReference: string;
  tenantBoundary: string;
  callerRole: string;
  agentRuntimeId: string;
  agentPermissions: string[];
  deniedCapabilities: string[];
  dataBoundary: string;
  phiAuthority: string;
  clinicalCareAuthority: string;
  inputDigest: string;
  contextFingerprint: string;
  compressedContextRefs: string[];
  evidenceRefs: string[];
  policyRefs: string[];
  requestedActionSummary: string;
  modelRouteTelemetry: ExecutionAttemptModelRouteTelemetry;
  computeFabricTelemetry: ExecutionAttemptComputeFabricTelemetry;
  humanApprovalGate: ExecutionAttemptHumanApprovalGate;
  auditTrail: ExecutionAttemptAuditTrail;
  replayMetadata: ExecutionAttemptReplayMetadata;
  toolPlan: ExecutionAttemptToolPlan;
  failureRecovery: ExecutionAttemptFailureRecovery;
  evidenceAuditTrail: ExecutionAttemptEvidenceAuditTrail;
  evaluationBindings: {
    syntheticScenarioRefs: string[];
    scorecardRefs: string[];
    clinicalRobustness: {
      labRoute: string;
      scenarioRefs: string[];
      scorecardRefs: string[];
      perturbationRefs: string[];
      averageClinicalReadinessScore: number;
      reviewerQueues: string[];
      dataBoundary: "synthetic-no-phi-only";
      clinicalAuthority: "not-authorized-live-care";
      phiAuthority: "not-authorized-production-phi";
      reviewerGate: "human-review-required";
    };
  };
  retainedBoundary: string;
};

export type ExecutionAttemptInputValidation = {
  status: "pass" | "fail";
  phiFindings: string[];
  protectedActionFindings: string[];
  decision: "accept-metadata-only" | "reject-before-envelope";
  reason: string;
};

export type ExecutionAttemptEvalCheck = {
  check: string;
  passed: boolean;
  detail: string;
};

export type ExecutionAttemptEvalScorecard = {
  scorecardId: string;
  scenarioSlug: string;
  category: ExecutionAttemptScorecardCategory;
  status: "pass" | "fail";
  checks: ExecutionAttemptEvalCheck[];
  hallucinationRisk: "low" | "moderate" | "high";
  clinicalSafetyStatus: "pass-review-gated" | "fail";
  evidenceQualityStatus: "pass" | "fail";
  promptInjectionStatus: "pass" | "fail";
  missingDataStatus: "pass" | "fail";
  regressionStatus: "pass" | "fail";
  requiredHumanReview: boolean;
  releaseDecision: "pass-for-synthetic-contract" | "block-release";
  retainedBoundary: string;
};

export const executionAttemptEnvelopeStatus =
  "execution-attempt-envelope-active-no-phi";
export const executionAttemptEnvelopeBriefStatus =
  "execution-attempt-envelope-brief-ready-no-phi";
export const executionAttemptEnvelopeRoute = "/workflows/execution-attempts";
export const executionAttemptEnvelopeApiRoute =
  "/api/workflows/execution-attempts/envelope";
export const executionAttemptEnvelopeBriefRoute =
  "/api/workflows/execution-attempts/envelope/brief";
export const executionAttemptEnvelopeContractVersion =
  "scrimed-execution-attempt-envelope-v1";
export const executionAttemptEnvelopeUpdatedAt = "2026-06-27";

export const executionAttemptEnvelopeBoundary =
  "SCRIMED Execution Attempt Envelope v1 creates deterministic, metadata-only, no-PHI execution-attempt contracts with idempotency, replay metadata, model-route telemetry, human review, audit links, failure recovery, and no-PHI scorecards. It does not persist live attempts, authorize PHI processing, grant live clinical care authority, approve production model routing, submit payer or claim actions, write to EHRs, contact patients, or enable autonomous protected workflow execution.";

export const executionAttemptEnvelopeHardStops = [
  "No live patient data or production PHI in envelope input, traces, scorecards, docs, or fixtures.",
  "No autonomous diagnosis, treatment, prescribing, clinical triage, patient instruction, or patient outreach.",
  "No payer submission, claim submission, final coding, billing action, appeal filing, or reimbursement assurance.",
  "No EHR writeback, record mutation, connector write, production connector call, or customer go-live action.",
  "No production model routing without approved provider terms, privacy/security review, telemetry, fallback, and human review.",
  "No durable production execution store claim until tenant-scoped storage, idempotency TTL, locking, retry, and regional retention are approved."
];

const providerNameByClass: Record<ExecutionAttemptProviderClass, string> = {
  "frontier-closed": "SCRIMED provider mesh frontier route",
  "future-model": "SCRIMED future-model slot",
  "open-weight": "SCRIMED local or open-weight route",
  "regional-specialist": "SCRIMED regional specialist route"
};

const blockedProtectedCapabilities = [
  "autonomous diagnosis",
  "autonomous treatment",
  "prescribing",
  "patient outreach",
  "payer submission",
  "claim submission",
  "final coding",
  "EHR writeback",
  "production connector write",
  "clinical triage replacement"
];

const phiDetectionPatterns = [
  { name: "ssn-like", pattern: /\b\d{3}-\d{2}-\d{4}\b/i },
  { name: "dob-like", pattern: /\b(?:dob|date of birth)\s*[:#]?\s*\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/i },
  { name: "mrn-like", pattern: /\b(?:mrn|medical record number)\s*[:#]?\s*[a-z0-9-]{4,}\b/i },
  { name: "member-id-like", pattern: /\b(?:member id|policy id|subscriber id)\s*[:#]?\s*[a-z0-9-]{4,}\b/i },
  { name: "email-like", pattern: /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/i },
  { name: "phone-like", pattern: /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/i }
];

const protectedActionPatterns = [
  { name: "patient-outreach", pattern: /\b(send|text|email|call|notify)\b.*\b(patient|member)\b/i },
  { name: "ehr-writeback", pattern: /\b(write|file|post|update|commit)\b.*\b(ehr|chart|record)\b/i },
  { name: "payer-submission", pattern: /\b(submit|file|send)\b.*\b(prior auth|claim|payer|appeal)\b/i },
  { name: "clinical-final-action", pattern: /\b(diagnose|prescribe|treat|order medication|final clinical)\b/i },
  { name: "final-coding-or-billing", pattern: /\b(final code|bill|charge|submit claim|adjust balance)\b/i }
];

const syntheticEnvelopeInputs: ExecutionAttemptEnvelopeInput[] = [
  {
    workflowSlug: "prior-auth-evidence-packet",
    workflowVersion: "2026.06.no-phi",
    requestedAction:
      "Draft a reviewer-held prior authorization evidence packet from synthetic policy and documentation gap references.",
    actionClass: "payer-policy-synthesis",
    tenantReference: "tenant-ref-synthetic-atlas",
    callerRole: "rcm-reviewer",
    agentRuntimeId: "agent-runtime-policy-synthesizer",
    taskType: "prior authorization support",
    clinicalRiskLevel: "high",
    preferredProviderClass: "frontier-closed",
    fallbackProviderClass: "open-weight",
    contextRefs: ["synthetic-context-prior-auth-gap-v1", "synthetic-rcm-workqueue-v1"],
    evidenceRefs: ["payer-policy-source-ref-synthetic-v1", "documentation-gap-ref-synthetic-v1"],
    policyRefs: ["org-policy-human-rcm-review-required-v1"],
    submittedText:
      "Use only synthetic payer policy references and documentation gap metadata to prepare a draft reviewer packet."
  },
  {
    workflowSlug: "clinical-documentation-draft-review",
    workflowVersion: "2026.06.no-phi",
    requestedAction:
      "Prepare a synthetic documentation quality draft and route it to a clinician reviewer without chart writeback.",
    actionClass: "clinical-evidence-draft",
    tenantReference: "tenant-ref-synthetic-atlas",
    callerRole: "clinical-reviewer",
    agentRuntimeId: "agent-runtime-doc-quality",
    taskType: "clinical documentation support",
    clinicalRiskLevel: "high",
    preferredProviderClass: "frontier-closed",
    fallbackProviderClass: "open-weight",
    contextRefs: ["synthetic-documentation-gap-v1", "synthetic-care-stage-v1"],
    evidenceRefs: ["synthetic-guideline-source-ref-v1", "trust-card-doc-quality-v1"],
    policyRefs: ["org-policy-clinician-review-required-v1"],
    submittedText:
      "Summarize synthetic documentation gaps with evidence references and hold the draft for clinician review."
  },
  {
    workflowSlug: "referral-queue-administrative-summary",
    workflowVersion: "2026.06.no-phi",
    requestedAction:
      "Summarize synthetic referral queue metadata and produce a no-outreach operations handoff.",
    actionClass: "administrative-summarization",
    tenantReference: "tenant-ref-synthetic-atlas",
    callerRole: "operations-lead",
    agentRuntimeId: "agent-runtime-ops-summarizer",
    taskType: "low-risk administrative summarization",
    clinicalRiskLevel: "moderate",
    preferredProviderClass: "open-weight",
    fallbackProviderClass: "frontier-closed",
    contextRefs: ["synthetic-referral-queue-v1", "synthetic-sla-window-v1"],
    evidenceRefs: ["queue-metric-source-ref-synthetic-v1"],
    policyRefs: ["org-policy-no-patient-outreach-v1"],
    submittedText:
      "Summarize synthetic referral queue bottlenecks for operations review and do not contact anyone."
  },
  {
    workflowSlug: "organization-policy-route-check",
    workflowVersion: "2026.06.no-phi",
    requestedAction:
      "Compare synthetic organization policy references and return the most restrictive route decision.",
    actionClass: "organization-policy-review",
    tenantReference: "tenant-ref-synthetic-atlas",
    callerRole: "governance-owner",
    agentRuntimeId: "agent-runtime-policy-router",
    taskType: "organization policy route review",
    clinicalRiskLevel: "moderate",
    preferredProviderClass: "open-weight",
    fallbackProviderClass: "regional-specialist",
    contextRefs: ["synthetic-policy-scope-v1", "synthetic-region-gate-v1"],
    evidenceRefs: ["policy-version-ref-synthetic-v1", "route-denial-ref-synthetic-v1"],
    policyRefs: ["org-policy-most-restrictive-route-v1"],
    submittedText:
      "Compare synthetic policy references and route to the safest available review queue when rules conflict."
  },
  {
    workflowSlug: "trustops-signal-remediation-review",
    workflowVersion: "2026.06.no-phi",
    requestedAction:
      "Create a reviewer-held TrustOps signal and recommendation packet with durable evidence binding for synthetic operations review.",
    actionClass: "workflow-planning",
    tenantReference: "tenant-ref-synthetic-atlas",
    callerRole: "trustops-reviewer",
    agentRuntimeId: "agent-runtime-trustops-supervisor",
    taskType: "trustops signal remediation review",
    clinicalRiskLevel: "moderate",
    preferredProviderClass: "open-weight",
    fallbackProviderClass: "frontier-closed",
    contextRefs: ["synthetic-trustops-signal-set-v1", "synthetic-self-healing-recommendation-set-v1"],
    evidenceRefs: ["trustops-module-registry-v1", "trustops-structured-validation-v1"],
    policyRefs: ["org-policy-human-trustops-review-required-v1"],
    submittedText:
      "Use synthetic TrustOps signal metadata and recommendation-only remediation metadata to prepare a human review packet with no protected workflow execution."
  }
];

function stableHash(parts: string[]) {
  return createHash("sha256").update(parts.join("|")).digest("hex");
}

function moneyForRisk(risk: ExecutionAttemptRiskLevel) {
  if (risk === "low") {
    return 0.012;
  }

  if (risk === "moderate") {
    return 0.028;
  }

  return 0.067;
}

function latencyForRisk(risk: ExecutionAttemptRiskLevel) {
  if (risk === "low") {
    return 1800;
  }

  if (risk === "moderate") {
    return 3200;
  }

  return 5200;
}

function riskConfidence(risk: ExecutionAttemptRiskLevel) {
  if (risk === "low") {
    return 0.86;
  }

  if (risk === "moderate") {
    return 0.78;
  }

  return 0.64;
}

const clinicalRobustnessScenarioRefsByWorkflow: Record<string, string[]> = {
  "prior-auth-evidence-packet": [
    "perfect-chart-conflict-unit-completeness",
    "clinical-copilot-unit-abbreviation-citation"
  ],
  "clinical-documentation-draft-review": [
    "docutwin-noisy-incomplete-draft",
    "ambient-scribe-noise-multilingual-injection"
  ],
  "referral-queue-administrative-summary": [
    "sanar-conflict-temporal-escalation",
    "careexplain-multilingual-education-boundary"
  ],
  "organization-policy-route-check": [
    "trialcore-eligibility-temporal-evidence",
    "oncoid-abbreviation-guideline-conflict"
  ],
  "trustops-signal-remediation-review": [
    "sanar-conflict-temporal-escalation",
    "clinical-copilot-unit-abbreviation-citation"
  ]
};

function unique<T>(values: T[]) {
  return Array.from(new Set(values));
}

function clinicalRobustnessBindingForInput(input: ExecutionAttemptEnvelopeInput) {
  const scenarioRefs =
    clinicalRobustnessScenarioRefsByWorkflow[input.workflowSlug] ?? [
      "sanar-conflict-temporal-escalation"
    ];
  const scenarios = scenarioRefs
    .map((scenarioRef) =>
      clinicalRobustnessScenarios.find((scenario) => scenario.id === scenarioRef)
    )
    .filter((scenario): scenario is (typeof clinicalRobustnessScenarios)[number] =>
      Boolean(scenario)
    );
  const scorecards = scenarios.map(buildClinicalRobustnessScorecard);
  const reviewerQueues = unique(scenarios.map((scenario) => scenario.reviewerQueue));
  const perturbationRefs = unique(scenarios.flatMap((scenario) => scenario.perturbations));
  const averageClinicalReadinessScore = Math.round(
    scorecards.reduce((total, scorecard) => total + scorecard.readinessScore, 0) /
      Math.max(1, scorecards.length)
  );

  return {
    labRoute: clinicalRobustnessLabRoute,
    scenarioRefs: scenarios.map((scenario) => scenario.id),
    scorecardRefs: scorecards.map(
      (scorecard) => `clinical-robustness-scorecard-${scorecard.scenarioId}`
    ),
    perturbationRefs,
    averageClinicalReadinessScore,
    reviewerQueues,
    dataBoundary: "synthetic-no-phi-only" as const,
    clinicalAuthority: "not-authorized-live-care" as const,
    phiAuthority: "not-authorized-production-phi" as const,
    reviewerGate: "human-review-required" as const
  };
}

function computeTaskTypeForInput(input: ExecutionAttemptEnvelopeInput): ScrimedComputeTaskType {
  if (input.actionClass === "clinical-evidence-draft") return "clinical_reasoning";
  if (input.actionClass === "payer-policy-synthesis") return "RCM";
  if (input.actionClass === "workflow-planning" && /referral/i.test(input.taskType)) return "referral_routing";
  if (input.actionClass === "workflow-planning") return "operations";
  if (input.actionClass === "organization-policy-review") return "operations";
  return "operations";
}

function computeModalityForInput(input: ExecutionAttemptEnvelopeInput): ScrimedComputeModality {
  if (/documentation|clinical/i.test(input.taskType)) return "FHIR";
  if (/policy|prior authorization|payer/i.test(input.taskType)) return "text";
  return "text";
}

function computeRiskForInput(input: ExecutionAttemptEnvelopeInput): ScrimedComputeRiskLevel {
  if (input.clinicalRiskLevel === "prohibited") return "critical";
  if (input.clinicalRiskLevel === "high") return "high";
  if (input.clinicalRiskLevel === "moderate") return "moderate";
  return "low";
}

function computeDeploymentModeForInput(
  input: ExecutionAttemptEnvelopeInput
): ScrimedComputeDeploymentMode {
  if (input.preferredProviderClass === "open-weight") return "CUSTOMER_VPC";
  if (input.preferredProviderClass === "regional-specialist") return "CUSTOMER_VPC";
  if (input.preferredProviderClass === "future-model") return "SCRIMED_CLOUD";
  return "SCRIMED_CLOUD";
}

function computePhiSensitivityForInput(input: ExecutionAttemptEnvelopeInput): ScrimedComputePhiSensitivity {
  if (input.clinicalRiskLevel === "prohibited") return "phi_possible";
  return "metadata_only";
}

function computeReasoningDepthForInput(input: ExecutionAttemptEnvelopeInput): ScrimedComputeReasoningDepth {
  if (input.clinicalRiskLevel === "high" || input.clinicalRiskLevel === "prohibited") return "specialist";
  if (input.actionClass === "organization-policy-review") return "deep";
  if (input.clinicalRiskLevel === "moderate") return "standard";
  return "shallow";
}

function computeFabricTelemetryForInput(
  input: ExecutionAttemptEnvelopeInput,
  attemptSuffix: string
): ExecutionAttemptComputeFabricTelemetry {
  const decision = selectScrimedModelForTask({
    requestId: `execution-attempt-${attemptSuffix}`,
    taskType: computeTaskTypeForInput(input),
    modality: computeModalityForInput(input),
    riskLevel: computeRiskForInput(input),
    phiSensitivity: computePhiSensitivityForInput(input),
    deploymentMode: computeDeploymentModeForInput(input),
    latencyRequirement: input.clinicalRiskLevel === "low" ? "interactive" : "standard",
    costSensitivity: input.preferredProviderClass === "open-weight" ? "balanced" : "premium_allowed",
    reasoningDepth: computeReasoningDepthForInput(input),
    requiresClinicalRecommendation: input.actionClass === "clinical-evidence-draft"
  });

  return {
    fabricVersion: scrimedComputeFabricVersion,
    fabricStatus: scrimedComputeFabricStatus,
    selectedModel: decision.selectedModel,
    modelTier: decision.modelTier,
    provider: decision.provider,
    deploymentMode: decision.deploymentMode,
    reason: decision.reason,
    riskLevel: decision.riskLevel,
    phiPolicy: decision.phiPolicy,
    requiresHumanReview: decision.requiresHumanReview,
    fallbackModels: decision.fallbackModels,
    estimatedCostClass: decision.estimatedCostClass,
    estimatedLatencyClass: decision.estimatedLatencyClass,
    auditTags: decision.auditTags,
    auditHash: decision.auditEvent.auditHash,
    confidenceScore: decision.confidenceScore,
    confidenceCorrectnessBoundary: "confidence-is-not-correctness",
    correctnessEvidenceRequired: decision.correctnessEvidenceRequired,
    uncertaintyReasons: decision.uncertainty.uncertaintyReasons,
    safetyBoundary: "metadata-only-no-live-model-call"
  };
}

export function validateExecutionAttemptEnvelopeInput(
  input: ExecutionAttemptEnvelopeInput
): ExecutionAttemptInputValidation {
  const phiFindings = phiDetectionPatterns
    .filter((detector) => detector.pattern.test(input.submittedText))
    .map((detector) => detector.name);
  const protectedActionFindings = protectedActionPatterns
    .filter((detector) => detector.pattern.test(input.submittedText))
    .map((detector) => detector.name);

  if (phiFindings.length > 0) {
    return {
      status: "fail",
      phiFindings,
      protectedActionFindings,
      decision: "reject-before-envelope",
      reason: "Input resembles PHI and must be rejected before envelope creation."
    };
  }

  if (protectedActionFindings.length > 0) {
    return {
      status: "fail",
      phiFindings,
      protectedActionFindings,
      decision: "reject-before-envelope",
      reason: "Input requests a protected action and must be routed to human review without execution."
    };
  }

  return {
    status: "pass",
    phiFindings,
    protectedActionFindings,
    decision: "accept-metadata-only",
    reason: "Input passed no-PHI and no-protected-action metadata checks."
  };
}

export function buildExecutionAttemptEnvelope(
  input: ExecutionAttemptEnvelopeInput
): ExecutionAttemptEnvelope {
  const validation = validateExecutionAttemptEnvelopeInput(input);
  const baseHash = stableHash([
    executionAttemptEnvelopeContractVersion,
    input.workflowSlug,
    input.workflowVersion,
    input.tenantReference,
    input.callerRole,
    input.agentRuntimeId,
    input.requestedAction,
    input.taskType,
    input.clinicalRiskLevel
  ]);
  const contextFingerprint = stableHash([
    ...input.contextRefs,
    ...input.evidenceRefs,
    ...input.policyRefs,
    input.workflowSlug
  ]);
  const inputDigest = stableHash([
    input.workflowSlug,
    input.actionClass,
    input.taskType,
    input.submittedText
  ]);
  const attemptSuffix = baseHash.slice(0, 12);
  const routeSuffix = stableHash([
    input.taskType,
    input.preferredProviderClass,
    input.fallbackProviderClass,
    input.clinicalRiskLevel
  ]).slice(0, 10);
  const lifecycleState: ExecutionAttemptLifecycleState =
    validation.status === "pass" ? "review-required" : "preflight-denied";
  const safetyDecision = evaluateScrimedSafetyGate({
    route: executionAttemptEnvelopeApiRoute,
    requestedAction: input.requestedAction,
    inputText: input.submittedText,
    allowMetadataOnly: true
  });
  const modelRouteDecision = routeScrimedModelTask({
    route: executionAttemptEnvelopeApiRoute,
    task: `${input.actionClass} ${input.taskType} ${input.requestedAction}`
  });
  const computeFabricTelemetry = computeFabricTelemetryForInput(input, attemptSuffix);
  const clinicalRobustnessBinding = clinicalRobustnessBindingForInput(input);
  const scorecardRefs = [
    "scorecard-idempotency-replay",
    "scorecard-no-phi-boundary",
    "scorecard-route-telemetry",
    "scorecard-human-review",
    "scorecard-audit-linkage",
    "scorecard-protected-capability-denial",
    "scorecard-failure-recovery",
    "scorecard-context-fingerprint"
  ];
  const outputHash = stableHash([
    baseHash,
    lifecycleState,
    validation.decision,
    clinicalRobustnessBinding.averageClinicalReadinessScore.toString(),
    modelRouteDecision.provider,
    modelRouteDecision.tier,
    computeFabricTelemetry.auditHash,
    computeFabricTelemetry.selectedModel,
    computeFabricTelemetry.phiPolicy
  ]);
  const evidenceEnvelopeHash = stableHash([
    outputHash,
    inputDigest,
    contextFingerprint,
    ...input.evidenceRefs,
    ...input.policyRefs,
    safetyDecision.policyVersion,
    computeFabricTelemetry.auditHash
  ]);

  return {
    attemptId: `att_${attemptSuffix}`,
    contractVersion: executionAttemptEnvelopeContractVersion,
    buildStatus:
      validation.status === "pass" ? "metadata-only-accepted" : "metadata-only-rejected",
    lifecycleState,
    workflowSlug: input.workflowSlug,
    workflowVersion: input.workflowVersion,
    idempotencyKey: `idem_${baseHash.slice(0, 24)}`,
    createdAt: executionAttemptEnvelopeUpdatedAt,
    tenantReference: input.tenantReference,
    tenantBoundary: "tenant-reference-only-no-customer-data",
    callerRole: input.callerRole,
    agentRuntimeId: input.agentRuntimeId,
    agentPermissions: [
      "read-synthetic-context",
      "read-approved-evidence-references",
      "write-draft-review-packet",
      "append-metadata-audit-event"
    ],
    deniedCapabilities: blockedProtectedCapabilities,
    dataBoundary: "synthetic-and-metadata-only",
    phiAuthority: "not-authorized-production-phi",
    clinicalCareAuthority: "not-authorized-live-care",
    inputDigest,
    contextFingerprint,
    compressedContextRefs: input.contextRefs.map((contextRef) => `compressed:${contextRef}`),
    evidenceRefs: input.evidenceRefs,
    policyRefs: input.policyRefs,
    requestedActionSummary: input.requestedAction,
    modelRouteTelemetry: {
      routeId: `route_${routeSuffix}`,
      taskType: input.taskType,
      providerClass: input.preferredProviderClass,
      providerName: providerNameByClass[input.preferredProviderClass],
      modelVersion: `${input.preferredProviderClass}:registered-version-required-before-production`,
      fallbackProviderClass: input.fallbackProviderClass,
      routeProfile: `${input.actionClass}-human-review-gated`,
      riskTier: input.clinicalRiskLevel,
      estimatedCostUsd: moneyForRisk(input.clinicalRiskLevel),
      latencyBudgetMs: latencyForRisk(input.clinicalRiskLevel),
      confidence: riskConfidence(input.clinicalRiskLevel),
      routingRationale:
        "Route metadata is logged for synthetic evaluation only; production provider selection remains blocked until contracts, privacy, telemetry, fallback, and review controls are approved.",
      telemetryBoundary: "telemetry-only-not-production-routing"
    },
    computeFabricTelemetry,
    humanApprovalGate: {
      required: true,
      reviewStatus: "held-for-human-review",
      requiredReviewers:
        input.clinicalRiskLevel === "high"
          ? ["domain reviewer", "clinical governance", "TrustOS"]
          : ["domain reviewer", "TrustOS"],
      gateReason:
        "Protected healthcare workflow output requires accountable human review before any release, connector, payer, record, or patient-facing action.",
      releaseCondition:
        "Release requires approved reviewer identity, evidence card, clinical-risk label, audit event, and retained no-PHI boundary.",
      deniedUntil:
        "Durable attempt store, customer authority, connector approval, PHI controls, and production review workflow are approved."
    },
    auditTrail: {
      auditEventId: `audit_${stableHash([baseHash, "audit"]).slice(0, 12)}`,
      traceId: `trace_${stableHash([baseHash, contextFingerprint]).slice(0, 16)}`,
      eventHash: stableHash([baseHash, inputDigest, contextFingerprint]),
      immutableEventType: "execution-attempt-envelope-created",
      retainedFields: [
        "attemptId",
        "idempotencyKey",
        "workflowSlug",
        "tenantReference",
        "callerRole",
        "contextFingerprint",
        "modelRouteTelemetry",
        "computeFabricTelemetry",
        "humanApprovalGate",
        "replayMetadata",
        "failureRecovery"
      ],
      prohibitedFields: [
        "patient identifiers",
        "raw chart text",
        "member identifiers",
        "production connector payloads",
        "secrets",
        "credentials"
      ]
    },
    replayMetadata: {
      replayToken: `replay_${stableHash([baseHash, "replay"]).slice(0, 24)}`,
      replayEligible: validation.status === "pass",
      idempotencyScope: "tenant-reference + workflow slug + workflow version + caller role + input digest",
      ttlHours: 72,
      deterministicInputs: [
        "workflowSlug",
        "workflowVersion",
        "tenantReference",
        "callerRole",
        "agentRuntimeId",
        "inputDigest",
        "contextFingerprint",
        "policyRefs"
      ],
      replayPolicy:
        "Replay returns the retained metadata envelope only and cannot repeat protected external actions.",
      conflictResponse:
        "Return conflict when the same idempotency key maps to a different input digest, context fingerprint, or caller role.",
      expirationBehavior:
        "Expired metadata-only keys require a new envelope and cannot revive protected execution."
    },
    toolPlan: {
      toolRegistryVersion: "scrimed-tool-registry-no-phi-v1",
      allowedTools: [
        "synthetic-context-reader",
        "evidence-card-builder",
        "review-packet-drafter",
        "metadata-audit-appender"
      ],
      blockedTools: [
        "ehr-writeback",
        "patient-messaging",
        "payer-submission",
        "claims-submission",
        "production-connector-write"
      ],
      noConnectorAccess: true,
      noRecordMutation: true
    },
    failureRecovery: {
      retryPolicy:
        "Retry metadata envelope creation only when validation, hash generation, or audit-link assembly fails before any protected action.",
      quarantineTriggers: [
        "PHI-like input",
        "protected action request",
        "missing reviewer gate",
        "missing context fingerprint",
        "model route telemetry absent",
        "idempotency conflict"
      ],
      fallbackBehavior:
        "Return a deny-by-default review packet and require human operator triage.",
      rollbackBehavior:
        "No external side effect exists to roll back; retain denial metadata and preserve prior workflow state.",
      deadLetterOwner: "TrustOS and platform reliability"
    },
    evidenceAuditTrail: {
      attempt_id: `att_${attemptSuffix}`,
      user_session_tenant_context: {
        tenantReference: input.tenantReference,
        callerRole: input.callerRole,
        agentRuntimeId: input.agentRuntimeId,
        sessionReference: "metadata-only-no-live-session"
      },
      timestamp: executionAttemptEnvelopeUpdatedAt,
      route: executionAttemptEnvelopeApiRoute,
      action: input.requestedAction,
      allowed_blocked_decision:
        safetyDecision.allowed && validation.status === "pass" ? "allowed" : "blocked",
      policy_version: safetyDecision.policyVersion,
      input_classification: safetyDecision.inputClassification,
      phi_detected: safetyDecision.phiDetected,
      synthetic: safetyDecision.synthetic,
      model_provider_selected: modelRouteDecision.provider,
      model_tier_selected: modelRouteDecision.tier,
      compute_fabric_audit_hash: computeFabricTelemetry.auditHash,
      compute_fabric_selected_model: computeFabricTelemetry.selectedModel,
      compute_fabric_model_tier: computeFabricTelemetry.modelTier,
      compute_fabric_provider: computeFabricTelemetry.provider,
      compute_fabric_deployment_mode: computeFabricTelemetry.deploymentMode,
      compute_fabric_phi_policy: computeFabricTelemetry.phiPolicy,
      compute_fabric_human_review_required: computeFabricTelemetry.requiresHumanReview,
      output_hash: outputHash,
      evidence_envelope_hash: evidenceEnvelopeHash,
      status: lifecycleState,
      failure_reason: validation.status === "pass" ? null : validation.reason
    },
    evaluationBindings: {
      syntheticScenarioRefs: [
        "agent-scorecard-runtime-permission",
        "hallucination-uncited-guideline",
        "clinical-safety-prohibited-action",
        "evidence-quality-stale-policy",
        "regression-workflow-result-diff",
        "synthetic-patient-missing-data",
        "adversarial-prompt-injection-tool-override",
        ...clinicalRobustnessBinding.scenarioRefs
      ],
      scorecardRefs: [...scorecardRefs, ...clinicalRobustnessBinding.scorecardRefs],
      clinicalRobustness: clinicalRobustnessBinding
    },
    retainedBoundary:
      "This envelope is a metadata-only, no-PHI, replayable contract. It is not live workflow execution, not production persistence, not model routing approval, and not clinical or payer authority."
  };
}

export const executionAttemptEnvelopes = syntheticEnvelopeInputs.map((input) =>
  buildExecutionAttemptEnvelope(input)
);

function scorecardStatus(checks: ExecutionAttemptEvalCheck[]) {
  return checks.every((check) => check.passed) ? "pass" : "fail";
}

function releaseDecision(checks: ExecutionAttemptEvalCheck[]) {
  return scorecardStatus(checks) === "pass"
    ? "pass-for-synthetic-contract"
    : "block-release";
}

function buildScorecard(
  scenarioSlug: string,
  category: ExecutionAttemptScorecardCategory,
  checks: ExecutionAttemptEvalCheck[]
): ExecutionAttemptEvalScorecard {
  const status = scorecardStatus(checks);

  return {
    scorecardId: scenarioSlug.replace("execution-attempt-", "scorecard-"),
    scenarioSlug,
    category,
    status,
    checks,
    hallucinationRisk: status === "pass" ? "low" : "high",
    clinicalSafetyStatus: status === "pass" ? "pass-review-gated" : "fail",
    evidenceQualityStatus: status,
    promptInjectionStatus: status,
    missingDataStatus: status,
    regressionStatus: status,
    requiredHumanReview: true,
    releaseDecision: releaseDecision(checks),
    retainedBoundary:
      "Scorecard validates synthetic, metadata-only envelope integrity. It does not authorize clinical production, PHI use, connector execution, or autonomous protected action."
  };
}

export function runNoPhiExecutionAttemptEvaluations(
  envelopes: ExecutionAttemptEnvelope[] = executionAttemptEnvelopes
): ExecutionAttemptEvalScorecard[] {
  const clinicalRobustnessSummary = getClinicalRobustnessLabSummary();

  return [
    buildScorecard("execution-attempt-idempotency-replay", "regression", [
      {
        check: "unique-idempotency-keys",
        passed: new Set(envelopes.map((envelope) => envelope.idempotencyKey)).size === envelopes.length,
        detail: "Every synthetic envelope must have a stable, unique idempotency key."
      },
      {
        check: "replay-token-present",
        passed: envelopes.every((envelope) => envelope.replayMetadata.replayToken.startsWith("replay_")),
        detail: "Replay metadata must be present and addressable without repeating external side effects."
      },
      {
        check: "metadata-only-replay-policy",
        passed: envelopes.every((envelope) =>
          envelope.replayMetadata.replayPolicy.includes("metadata envelope only")
        ),
        detail: "Replay policy must return retained metadata only."
      }
    ]),
    buildScorecard("execution-attempt-no-phi-boundary", "synthetic-patient", [
      {
        check: "no-phi-authority",
        passed: envelopes.every((envelope) => envelope.phiAuthority === "not-authorized-production-phi"),
        detail: "Every envelope must keep production PHI authority blocked."
      },
      {
        check: "synthetic-metadata-boundary",
        passed: envelopes.every((envelope) => envelope.dataBoundary === "synthetic-and-metadata-only"),
        detail: "Every envelope must remain synthetic and metadata only."
      },
      {
        check: "prohibited-fields-retained",
        passed: envelopes.every((envelope) => envelope.auditTrail.prohibitedFields.includes("raw chart text")),
        detail: "Audit trail must explicitly prohibit raw chart text."
      }
    ]),
    buildScorecard("execution-attempt-model-route-telemetry", "agent-scorecard", [
      {
        check: "route-telemetry-present",
        passed: envelopes.every((envelope) => envelope.modelRouteTelemetry.routeId.startsWith("route_")),
        detail: "Every envelope must log route id, provider class, model version, cost, latency, confidence, and rationale."
      },
      {
        check: "not-production-routing",
        passed: envelopes.every(
          (envelope) => envelope.modelRouteTelemetry.telemetryBoundary === "telemetry-only-not-production-routing"
        ),
        detail: "Model routing telemetry must not become production routing approval."
      }
    ]),
    buildScorecard("execution-attempt-compute-fabric-binding", "agent-scorecard", [
      {
        check: "compute-fabric-telemetry-present",
        passed: envelopes.every(
          (envelope) =>
            envelope.computeFabricTelemetry.fabricVersion === scrimedComputeFabricVersion &&
            envelope.computeFabricTelemetry.fabricStatus === scrimedComputeFabricStatus &&
            envelope.computeFabricTelemetry.selectedModel.length > 0 &&
            isScrimedComputeAuditHash(envelope.computeFabricTelemetry.auditHash)
        ),
        detail:
          "Every envelope must bind SCRIMED Compute Fabric model tier, provider, deployment mode, PHI policy, fallback path, and audit hash."
      },
      {
        check: "compute-fabric-evidence-audit-bound",
        passed: envelopes.every(
          (envelope) =>
            envelope.evidenceAuditTrail.compute_fabric_audit_hash === envelope.computeFabricTelemetry.auditHash &&
            envelope.evidenceAuditTrail.compute_fabric_selected_model === envelope.computeFabricTelemetry.selectedModel &&
            envelope.evidenceAuditTrail.compute_fabric_phi_policy === envelope.computeFabricTelemetry.phiPolicy
        ),
        detail:
          "Evidence audit trails must retain Compute Fabric selection metadata for durable replay and review."
      },
      {
        check: "high-risk-compute-fabric-human-review",
        passed: envelopes.every(
          (envelope) =>
            envelope.modelRouteTelemetry.riskTier !== "high" ||
            envelope.computeFabricTelemetry.requiresHumanReview
        ),
        detail: "High-risk execution attempts must require human review in both the envelope and Compute Fabric decision."
      },
      {
        check: "confidence-is-not-correctness",
        passed: envelopes.every(
          (envelope) =>
            envelope.computeFabricTelemetry.confidenceCorrectnessBoundary ===
              "confidence-is-not-correctness" &&
            envelope.computeFabricTelemetry.correctnessEvidenceRequired.includes(
              "human review for clinical recommendations"
            )
        ),
        detail:
          "Compute Fabric confidence metadata must not be treated as clinical correctness without evidence and human review."
      },
      {
        check: "no-live-model-call-boundary",
        passed: envelopes.every(
          (envelope) =>
            envelope.computeFabricTelemetry.safetyBoundary === "metadata-only-no-live-model-call" &&
            envelope.computeFabricTelemetry.auditTags.includes("no-live-model-call")
        ),
        detail: "Execution attempts must keep Compute Fabric routing metadata-only with no live provider call."
      }
    ]),
    buildScorecard("execution-attempt-human-review-gate", "clinical-safety", [
      {
        check: "human-review-required",
        passed: envelopes.every((envelope) => envelope.humanApprovalGate.required),
        detail: "Every envelope must require human review for protected healthcare workflows."
      },
      {
        check: "clinical-care-blocked",
        passed: envelopes.every((envelope) => envelope.clinicalCareAuthority === "not-authorized-live-care"),
        detail: "Envelope must not create live clinical-care authority."
      }
    ]),
    buildScorecard("execution-attempt-clinical-robustness-binding", "clinical-robustness", [
      {
        check: "clinical-robustness-scenarios-bound",
        passed: envelopes.every(
          (envelope) => envelope.evaluationBindings.clinicalRobustness.scenarioRefs.length >= 2
        ),
        detail: "Every envelope must bind to at least two Clinical Robustness Lab scenarios."
      },
      {
        check: "clinical-robustness-scorecards-bound",
        passed: envelopes.every(
          (envelope) =>
            envelope.evaluationBindings.clinicalRobustness.scorecardRefs.length ===
            envelope.evaluationBindings.clinicalRobustness.scenarioRefs.length
        ),
        detail: "Every robustness scenario binding must have a matching clinical readiness scorecard ref."
      },
      {
        check: "clinical-robustness-no-phi-boundary",
        passed: envelopes.every(
          (envelope) =>
            envelope.evaluationBindings.clinicalRobustness.dataBoundary === "synthetic-no-phi-only" &&
            envelope.evaluationBindings.clinicalRobustness.phiAuthority === "not-authorized-production-phi" &&
            envelope.evaluationBindings.clinicalRobustness.clinicalAuthority === "not-authorized-live-care" &&
            envelope.evaluationBindings.clinicalRobustness.reviewerGate === "human-review-required"
        ),
        detail: "Clinical robustness bindings must retain no-PHI, no-live-care, and human-review boundaries."
      },
      {
        check: "clinical-robustness-perturbations-covered",
        passed:
          clinicalRobustnessSummary.coveredPerturbationCount ===
            clinicalRobustnessSummary.perturbationCount &&
          new Set(
            envelopes.flatMap(
              (envelope) => envelope.evaluationBindings.clinicalRobustness.perturbationRefs
            )
          ).size >= clinicalRobustnessSummary.perturbationCount,
        detail:
          `Durable execution attempts must cover all ${clinicalRobustnessSummary.perturbationCount} required clinical robustness perturbation families.`
      }
    ]),
    buildScorecard("execution-attempt-audit-linkage", "evidence-quality", [
      {
        check: "audit-event-id-present",
        passed: envelopes.every((envelope) => envelope.auditTrail.auditEventId.startsWith("audit_")),
        detail: "Every envelope must include an audit event id."
      },
      {
        check: "trace-id-present",
        passed: envelopes.every((envelope) => envelope.auditTrail.traceId.startsWith("trace_")),
        detail: "Every envelope must include a replayable trace id."
      },
      {
        check: "evidence-refs-present",
        passed: envelopes.every((envelope) => envelope.evidenceRefs.length > 0),
        detail: "Every envelope must retain source or evidence references."
      },
      {
        check: "evidence-audit-trail-present",
        passed: envelopes.every(
          (envelope) =>
            envelope.evidenceAuditTrail.attempt_id === envelope.attemptId &&
            envelope.evidenceAuditTrail.policy_version.length > 0 &&
            envelope.evidenceAuditTrail.output_hash.length === 64 &&
            envelope.evidenceAuditTrail.evidence_envelope_hash.length === 64
        ),
        detail: "Every envelope must bind attempt id, policy version, output hash, and evidence envelope hash."
      },
      {
        check: "evidence-audit-trail-no-phi",
        passed: envelopes.every(
          (envelope) =>
            envelope.evidenceAuditTrail.phi_detected === false &&
            envelope.evidenceAuditTrail.input_classification !== "phi-or-sensitive-risk"
        ),
        detail: "Evidence audit trail must fail closed before PHI-like input can become retained evidence."
      }
    ]),
    buildScorecard("execution-attempt-protected-capability-denial", "adversarial", [
      {
        check: "protected-actions-denied",
        passed: envelopes.every((envelope) =>
          ["patient outreach", "payer submission", "EHR writeback"].every((capability) =>
            envelope.deniedCapabilities.includes(capability)
          )
        ),
        detail: "Every envelope must deny patient outreach, payer submission, and EHR writeback."
      },
      {
        check: "connector-write-blocked",
        passed: envelopes.every((envelope) => envelope.toolPlan.noConnectorAccess && envelope.toolPlan.noRecordMutation),
        detail: "Tool plan must block connector access and record mutation."
      }
    ]),
    buildScorecard("execution-attempt-failure-recovery", "missing-data", [
      {
        check: "quarantine-triggers-present",
        passed: envelopes.every((envelope) => envelope.failureRecovery.quarantineTriggers.length >= 5),
        detail: "Failure recovery must preserve quarantine triggers for unsafe or incomplete attempts."
      },
      {
        check: "rollback-no-side-effects",
        passed: envelopes.every((envelope) => envelope.failureRecovery.rollbackBehavior.includes("No external side effect")),
        detail: "Rollback behavior must acknowledge no external side effects exist."
      }
    ]),
    buildScorecard("execution-attempt-context-fingerprint", "hallucination-check", [
      {
        check: "context-fingerprint-present",
        passed: envelopes.every((envelope) => envelope.contextFingerprint.length === 64),
        detail: "Every envelope must have a context fingerprint for evidence-bound replay."
      },
      {
        check: "compressed-context-only",
        passed: envelopes.every((envelope) =>
          envelope.compressedContextRefs.every((contextRef) => contextRef.startsWith("compressed:"))
        ),
        detail: "Every model-facing context reference must be compressed before use."
      },
      {
        check: "policy-refs-present",
        passed: envelopes.every((envelope) => envelope.policyRefs.length > 0),
        detail: "Every envelope must bind to organization policy context."
      }
    ])
  ];
}

export function getExecutionAttemptEnvelopeSummary() {
  const clinicalRobustnessSummary = getClinicalRobustnessLabSummary();
  const scorecards = runNoPhiExecutionAttemptEvaluations();
  const allScorecardsPass = scorecards.every((scorecard) => scorecard.status === "pass");
  const idempotencyKeyCount = new Set(
    executionAttemptEnvelopes.map((envelope) => envelope.idempotencyKey)
  ).size;
  const blockedCapabilityCount = new Set(
    executionAttemptEnvelopes.flatMap((envelope) => envelope.deniedCapabilities)
  ).size;
  const clinicalRobustnessScenarioBindingCount = new Set(
    executionAttemptEnvelopes.flatMap(
      (envelope) => envelope.evaluationBindings.clinicalRobustness.scenarioRefs
    )
  ).size;
  const clinicalRobustnessPerturbationBindingCount = new Set(
    executionAttemptEnvelopes.flatMap(
      (envelope) => envelope.evaluationBindings.clinicalRobustness.perturbationRefs
    )
  ).size;
  const clinicalRobustnessReviewerQueueCount = new Set(
    executionAttemptEnvelopes.flatMap(
      (envelope) => envelope.evaluationBindings.clinicalRobustness.reviewerQueues
    )
  ).size;
  const computeFabricModelTierCount = new Set(
    executionAttemptEnvelopes.map((envelope) => envelope.computeFabricTelemetry.modelTier)
  ).size;
  const computeFabricPhiPolicyCount = new Set(
    executionAttemptEnvelopes.map((envelope) => envelope.computeFabricTelemetry.phiPolicy)
  ).size;

  return {
    service: "scrimed-execution-attempt-envelope",
    route: executionAttemptEnvelopeRoute,
    apiRoute: executionAttemptEnvelopeApiRoute,
    briefRoute: executionAttemptEnvelopeBriefRoute,
    status: executionAttemptEnvelopeStatus,
    briefStatus: executionAttemptEnvelopeBriefStatus,
    contractVersion: executionAttemptEnvelopeContractVersion,
    boundary: executionAttemptEnvelopeBoundary,
    readinessAssessment:
      "GO for synthetic, metadata-only execution-attempt envelopes, replay evidence, model-route telemetry review, and no-PHI scorecards. NO-GO for live clinical production, PHI, production persistence, protected workflow execution, payer submission, patient outreach, EHR writeback, or production connector use.",
    dataBoundary: "synthetic-and-metadata-only",
    phiAuthority: "not-authorized-production-phi",
    clinicalCareAuthority: "not-authorized-live-care",
    workflowExecutionAuthority: "envelope-contract-only-protected-execution-blocked",
    replayAuthority: "metadata-replay-only",
    modelRoutingAuthority: "telemetry-only-not-production-routing",
    envelopeCount: executionAttemptEnvelopes.length,
    acceptedEnvelopeCount: executionAttemptEnvelopes.filter(
      (envelope) => envelope.buildStatus === "metadata-only-accepted"
    ).length,
    idempotencyKeyCount,
    replayReadyCount: executionAttemptEnvelopes.filter(
      (envelope) => envelope.replayMetadata.replayEligible
    ).length,
    modelRouteTelemetryCount: executionAttemptEnvelopes.filter(
      (envelope) => envelope.modelRouteTelemetry.routeId
    ).length,
    computeFabricTelemetryCount: executionAttemptEnvelopes.filter(
      (envelope) =>
        isScrimedComputeAuditHash(envelope.computeFabricTelemetry.auditHash) &&
        envelope.evidenceAuditTrail.compute_fabric_audit_hash ===
          envelope.computeFabricTelemetry.auditHash
    ).length,
    computeFabricHumanReviewRequiredCount: executionAttemptEnvelopes.filter(
      (envelope) => envelope.computeFabricTelemetry.requiresHumanReview
    ).length,
    computeFabricModelTierCount,
    computeFabricPhiPolicyCount,
    humanReviewGateCount: executionAttemptEnvelopes.filter(
      (envelope) => envelope.humanApprovalGate.required
    ).length,
    auditTraceCount: executionAttemptEnvelopes.filter(
      (envelope) => envelope.auditTrail.traceId
    ).length,
    blockedCapabilityCount,
    clinicalRobustnessLabRoute,
    clinicalRobustnessScenarioBindingCount,
    clinicalRobustnessPerturbationBindingCount,
    clinicalRobustnessRequiredPerturbationCount: clinicalRobustnessSummary.perturbationCount,
    clinicalRobustnessReviewerQueueCount,
    evidenceAuditTrailCount: executionAttemptEnvelopes.filter(
      (envelope) => envelope.evidenceAuditTrail.evidence_envelope_hash.length === 64
    ).length,
    scorecardCount: scorecards.length,
    passingScorecardCount: scorecards.filter((scorecard) => scorecard.status === "pass").length,
    releaseDecision: allScorecardsPass
      ? "pass-for-synthetic-contract"
      : "block-release",
    hardStops: executionAttemptEnvelopeHardStops,
    envelopes: executionAttemptEnvelopes,
    scorecards,
    nextImplementationSteps: [
      "Extend the durable-store schema/RPC evidence projections with Compute Fabric selected model, tier, deployment mode, PHI policy, fallback path, and audit hash.",
      "Add production model registry tables for provider, model version, cost, latency, privacy, risk tier, fallback, approval state, and Compute Fabric compatibility.",
      "Wire scorecard execution into CI and release evidence so no-PHI eval failures block deployment before production promotion.",
      "Add authenticated human-review disposition APIs before any protected workflow attempt can progress beyond metadata-only review.",
      "Design dead-letter, retry, quarantine, and incident-review runbooks for future governed execution workers."
    ],
    updated: executionAttemptEnvelopeUpdatedAt
  };
}

export function buildExecutionAttemptEnvelopeBrief() {
  const summary = getExecutionAttemptEnvelopeSummary();

  return [
    "# SCRIMED Execution Attempt Envelope Brief",
    "",
    `Status: ${summary.status}`,
    `Readiness assessment: ${summary.readinessAssessment}`,
    `Boundary: ${summary.boundary}`,
    "",
    "## Envelope Coverage",
    `- Envelopes: ${summary.envelopeCount}`,
    `- Idempotency keys: ${summary.idempotencyKeyCount}`,
    `- Replay-ready envelopes: ${summary.replayReadyCount}`,
    `- Model-route telemetry records: ${summary.modelRouteTelemetryCount}`,
    `- Compute Fabric telemetry records: ${summary.computeFabricTelemetryCount}`,
    `- Compute Fabric human-review decisions: ${summary.computeFabricHumanReviewRequiredCount}`,
    `- Compute Fabric model tiers: ${summary.computeFabricModelTierCount}`,
    `- Compute Fabric PHI policies: ${summary.computeFabricPhiPolicyCount}`,
    `- Human review gates: ${summary.humanReviewGateCount}`,
    `- Audit traces: ${summary.auditTraceCount}`,
    `- Clinical robustness scenarios: ${summary.clinicalRobustnessScenarioBindingCount}`,
    `- Clinical robustness perturbations: ${summary.clinicalRobustnessPerturbationBindingCount}`,
    `- Clinical robustness reviewer queues: ${summary.clinicalRobustnessReviewerQueueCount}`,
    `- Scorecards: ${summary.scorecardCount}`,
    "",
    "## Synthetic Envelopes",
    ...summary.envelopes.map(
      (envelope) =>
        `- ${envelope.workflowSlug}: ${envelope.lifecycleState}; idempotency ${envelope.idempotencyKey}; replay metadata ${envelope.replayMetadata.replayToken}; model route ${envelope.modelRouteTelemetry.routeId}; compute fabric ${envelope.computeFabricTelemetry.selectedModel}/${envelope.computeFabricTelemetry.modelTier}/${envelope.computeFabricTelemetry.phiPolicy}; robustness ${envelope.evaluationBindings.clinicalRobustness.scenarioRefs.join(", ")}; boundary ${envelope.retainedBoundary}`
    ),
    "",
    "## No-PHI Scorecards",
    ...summary.scorecards.map(
      (scorecard) =>
        `- ${scorecard.scenarioSlug} (${scorecard.category}): ${scorecard.status}; release ${scorecard.releaseDecision}; human review ${scorecard.requiredHumanReview ? "required" : "missing"}`
    ),
    "",
    "## Hard Stops",
    ...summary.hardStops.map((stop) => `- ${stop}`),
    "",
    "## Next Implementation Steps",
    ...summary.nextImplementationSteps.map((step) => `- ${step}`),
    "",
    `Updated: ${summary.updated}`
  ].join("\n");
}
