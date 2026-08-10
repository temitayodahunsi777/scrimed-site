export type WorkspaceDomain =
  | "clinical"
  | "operations"
  | "executive"
  | "research"
  | "engineering"
  | "patient-access"
  | "revenue-cycle"
  | "trust-governance";

export type WorkSessionStatus =
  | "draft"
  | "planning"
  | "active"
  | "awaiting_approval"
  | "paused"
  | "verifying"
  | "completed"
  | "failed"
  | "cancelled"
  | "rolled_back";

export type WorkSessionTransitionAction =
  | "plan"
  | "run"
  | "pause"
  | "resume"
  | "approve"
  | "reject"
  | "complete"
  | "cancel"
  | "fail"
  | "rollback";

export type RiskLevel = "low" | "moderate" | "high" | "prohibited";

export type AutonomyLevel =
  | "observe"
  | "recommend"
  | "prepare"
  | "execute_with_approval"
  | "execute_preapproved";

export type ArtifactType =
  | "clinical-summary"
  | "patient-education"
  | "care-coordination-brief"
  | "prior-authorization-draft"
  | "appeal-letter-draft"
  | "research-brief"
  | "executive-report"
  | "payer-report"
  | "quality-report"
  | "board-brief"
  | "fhir-bundle-preview"
  | "workflow-runbook";

export type DataClassification =
  | "synthetic-no-phi"
  | "metadata-only"
  | "deidentified"
  | "phi-blocked"
  | "unknown";

export type ToolCategory =
  | "read-only"
  | "reversible-write"
  | "consequential-write"
  | "external-communication"
  | "clinical"
  | "financial"
  | "identity"
  | "scheduling";

export type ProviderRoutingClass =
  | "fast"
  | "balanced"
  | "reasoning"
  | "coding"
  | "vision"
  | "voice"
  | "embedding"
  | "reranking"
  | "local-private";

export type WorkAgentRole =
  | "coordinator"
  | "clinical-context"
  | "interoperability"
  | "patient-access"
  | "research"
  | "revenue-cycle"
  | "verification"
  | "safety-policy"
  | "artifact-writer"
  | "executive-brief"
  | "reviewer";

export type ContextSourceType =
  | "internal-document"
  | "policy-document"
  | "clinical-guideline"
  | "fhir-preview"
  | "research-citation"
  | "operational-record"
  | "payer-rule"
  | "scheduling-context"
  | "organization-ontology";

export type TrustTier = "source-of-record" | "reviewed-reference" | "synthetic-fixture" | "untrusted-input";

export type DefinitionOfDoneContract = {
  goal: string;
  allowedScope: string[];
  prohibitedActions: string[];
  requiredEvidence: string[];
  successCriteria: string[];
  stoppingConditions: string[];
  timeoutMs: number;
  maximumSteps: number;
  maximumToolCalls: number;
  maximumEstimatedCostUsd: number;
  humanApprovalRequired: boolean;
  rollbackPlan: string;
  verificationChecks: string[];
};

export type ActorIdentity = {
  actorId: string;
  displayName: string;
  role: "operator" | "reviewer" | "clinician-reviewer" | "admin" | "synthetic-system";
  tenantId: string;
};

export type PlannedStep = {
  stepId: string;
  title: string;
  assignedAgent: WorkAgentRole;
  dependsOn: string[];
  deadlineMs: number;
  status: "pending" | "running" | "blocked" | "completed" | "failed";
  requiresApproval: boolean;
  auditHash: string;
};

export type ToolCallRecord = {
  toolCallId: string;
  toolId: string;
  category: ToolCategory;
  status: "planned" | "blocked" | "approval_required" | "completed" | "failed";
  idempotencyKey: string;
  policyDecision: "allow" | "deny" | "require_human_approval";
  reason: string;
  auditHash: string;
};

export type EvidenceRecord = {
  evidenceId: string;
  sourceId: string;
  title: string;
  citation: string;
  trustTier: TrustTier;
  supports: string;
  dataClassification: DataClassification;
  auditHash: string;
};

export type ApprovalCheckpoint = {
  checkpointId: string;
  action: string;
  requiredRole: ActorIdentity["role"];
  status: "pending" | "approved" | "rejected" | "expired";
  scopedApprovalTokenStatus: "not-issued" | "issued-metadata-only" | "expired" | "blocked";
  reason: string;
  auditHash: string;
};

export type VerificationResult = {
  allPass: boolean;
  criteriaPassRate: number;
  failedCriteria: string[];
  warnings: string[];
  evidence: string[];
  recommendedAction: "complete" | "revise" | "pause_for_review" | "cancel" | "rollback";
  eligibleForCompletion: boolean;
};

export type WorkArtifact = {
  artifactId: string;
  sessionId: string;
  type: ArtifactType;
  title: string;
  content: string;
  markdown: string;
  json: Record<string, unknown>;
  sourceCitations: string[];
  verification: VerificationResult;
  reviewStatus: "draft" | "human_review_required" | "reviewed" | "blocked";
  createdBy: WorkAgentRole;
  createdAt: string;
  exportMetadata: {
    exportable: boolean;
    exportRequiresHumanReview: boolean;
    noPhiConfirmed: boolean;
  };
  reviewMetadata?: {
    disposition: "approved_for_internal_use" | "changes_requested" | "rejected";
    reasonCode:
      | "evidence_and_boundaries_confirmed"
      | "missing_required_evidence"
      | "scope_or_policy_conflict"
      | "unsafe_or_unsupported_claim"
      | "revision_required";
    reviewerIdentityHash: string;
    decisionHash: string;
    reviewedAt: string;
    externalDistributionAllowed: false;
    payerSubmissionAllowed: false;
  };
};

export type ValueTelemetry = {
  sessionDurationMinutes: number;
  steps: number;
  toolCalls: number;
  retries: number;
  verificationFailures: number;
  humanReviewMinutes: number;
  estimatedManualMinutes: number;
  estimatedTimeSavedMinutes: number;
  estimatedModelCostUsd: number;
  latencyMs: number;
  artifactCount: number;
  approvalCount: number;
  rollbackCount: number;
  cancellationCount: number;
  contextHitRate: number;
  unsupportedClaimRate: number;
  loopDetectionRate: number;
  providerFallbackRate: number;
  botsittingRatio: number;
  netTimeSavedMinutes: number;
  costPerVerifiedArtifact: number;
  percentageCompletedWithoutCorrection: number;
  percentageRequiringEscalation: number;
  verificationFirstPassRate: number;
};

export type StatusHistoryRecord = {
  status: WorkSessionStatus;
  at: string;
  reason: string;
  auditHash: string;
  action?: WorkSessionTransitionAction;
  fromStatus?: WorkSessionStatus;
  lifecycleDecisionHash?: string;
};

export type CancellationState = {
  cancellable: boolean;
  cancelledAt: string | null;
  cancellationReason: string | null;
  cancellationPropagated: boolean;
};

export type RollbackMetadata = {
  rollbackAvailable: boolean;
  rollbackPlan: string;
  lastCheckpointId: string;
  rollbackTested: boolean;
};

export type ModelRouteDecision = {
  routingStatus: "selected" | "abstained-no-eligible-model" | "blocked-by-policy";
  selectedModel: string;
  modelTier: ProviderRoutingClass;
  provider: string;
  deploymentMode: "SCRIMED_CLOUD" | "CUSTOMER_VPC" | "AIR_GAPPED" | "EDGE_DEVICE";
  reason: string;
  riskLevel: RiskLevel;
  phiPolicy: "no-phi" | "phi-blocked" | "local-private-required" | "approved-provider-required";
  requiresHumanReview: boolean;
  fallbackModels: string[];
  estimatedCostClass: "low" | "medium" | "high";
  estimatedLatencyClass: "fast" | "balanced" | "slow";
  validatedCellIds: string[];
  totalEstimatedCostUsd: number;
  estimatedCostPerAcceptedOutcomeUsd: number | null;
  fallbackPolicy: {
    maximumFallbacks: number;
    privacyDowngradeAllowed: false;
    silentFallbackAllowed: false;
  };
  runtimeState: "NORMAL" | "CONSTRAINED" | "DEGRADED" | "SAFE_REFUSAL";
  resourceAdmissionHash: string | null;
  auditTags: string[];
};

export type WorkSession = {
  id: string;
  tenantId: string;
  organizationScope: string;
  workspaceDomain: WorkspaceDomain;
  title: string;
  objective: string;
  actor: ActorIdentity;
  inputClassification: DataClassification;
  riskLevel: RiskLevel;
  requestedAutonomy: AutonomyLevel;
  approvedAutonomy: AutonomyLevel;
  definitionOfDone: DefinitionOfDoneContract;
  sourceContextReferences: string[];
  selectedModel: ModelRouteDecision;
  plannedSteps: PlannedStep[];
  toolCalls: ToolCallRecord[];
  evidence: EvidenceRecord[];
  approvalCheckpoints: ApprovalCheckpoint[];
  artifacts: WorkArtifact[];
  valueTelemetry: ValueTelemetry;
  statusHistory: StatusHistoryRecord[];
  cancellationState: CancellationState;
  rollbackMetadata: RollbackMetadata;
  createdAt: string;
  updatedAt: string;
};

export type WorkApiEnvelope<T> = {
  ok: true;
  data: T;
  meta: {
    requestId: string;
    traceId: string;
    timestamp: string;
  };
};

export type WorkApiErrorEnvelope = {
  ok: false;
  error: {
    code: string;
    message: string;
    retryable: boolean;
  };
  meta: {
    requestId: string;
    traceId: string;
    timestamp: string;
  };
};
