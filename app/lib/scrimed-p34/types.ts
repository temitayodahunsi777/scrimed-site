import type { PolicyDecision } from "../scrimed-work/p32Contracts";
import type {
  AgentActionApproval,
  AgentActionAuthorization,
  AgentActionPolicyRequest,
  ContextArtifact,
  ContextDataClassification,
  DecisionEvidenceRecord,
  ProviderDependencyFootprint,
  QualityRatchetScore
} from "../scrimed-p33/types";

export type P34GateStatus = "PASS" | "OPERATOR_REQUIRED" | "BLOCKED" | "FAIL";
export type P34RiskTier = "low" | "moderate" | "high" | "prohibited";
export type P34DataClassification =
  | "public"
  | "synthetic-no-phi"
  | "deidentified-approved"
  | "phi-restricted";

export type CapabilityVerification = {
  status: "verified-local" | "verified-documentary" | "unverified" | "expired" | "revoked";
  source: string | null;
  effectiveAt: string;
  revalidateAt: string;
};

export type ProviderCapabilityEntry = {
  routeId: string;
  providerId: string;
  modelId: string;
  harnessId: string;
  artifactDigest: string;
  verification: CapabilityVerification;
  inputModalities: Array<"text" | "structured" | "image" | "audio" | "embedding">;
  outputModalities: Array<"text" | "structured" | "tool-call" | "embedding">;
  toolCalling: boolean;
  structuredOutput: boolean;
  contextLimit: number;
  outputLimit: number;
  taskClasses: string[];
  riskTiers: Exclude<P34RiskTier, "prohibited">[];
  dataClassifications: Exclude<P34DataClassification, "phi-restricted">[];
  phiPermission: "denied" | "unverified" | "authorized-by-external-evidence";
  baaEligibility: "not-applicable" | "unverified" | "documented";
  regions: string[];
  executionEnvironmentIds: string[];
  latencyBudgetMs: number;
  costBudgetUsd: number;
  reasoningEfforts: Array<"none" | "low" | "standard" | "high">;
  allowedToolIds: string[];
  allowedOperations: Array<"read" | "propose" | "execute-with-approval">;
  approvalPolicy: "none-read-only" | "human-for-write" | "qualified-human";
  fallbackRouteId: string | null;
  deploymentLocation: "local" | "approved-edge" | "private-cloud" | "managed-cloud" | "unverified";
  dataResidency: {
    jurisdictions: string[];
    regions: string[];
    verified: boolean;
  };
  phiProductPathEvidence: {
    signedBaaRecorded: boolean;
    baaEvidenceHash: string | null;
    coveredProductPaths: string[];
    expiresAt: string | null;
  };
  licensing: {
    licenseId: string | null;
    commercialUsePermitted: boolean;
    openWeight: boolean;
    restrictions: string[];
    evidenceSource: string | null;
  };
  interoperability: {
    ehr: "supported" | "unsupported" | "unverified";
    fhir: "supported" | "unsupported" | "unverified";
    dicom: "supported" | "unsupported" | "unverified";
  };
  localEvaluation: {
    status: "verified-local" | "unverified" | "expired";
    overallScore: number;
    taskSuccessRate: number;
    criticalErrorRate: number;
    p95LatencyMs: number;
    costPerCompletedWorkflowUsd: number;
    reliability: number;
    evidenceDate: string | null;
    evidenceSource: string | null;
    expiresAt: string | null;
  };
  publicBenchmarkRank: number | null;
  operationalStatus: "healthy" | "degraded" | "unavailable" | "unverified";
  enabled: boolean;
};

export type HarnessCapabilityEntry = {
  harnessId: string;
  version: string;
  verified: boolean;
  transportModes: Array<"non-streaming" | "streaming" | "local-deterministic">;
  normalizesTextBlocks: boolean;
  validatesStructuredOutput: boolean;
  boundedRetries: number;
  timeoutMs: number;
  toolContractVersions: string[];
  digest: string;
};

export type ExecutionEnvironmentProfile = {
  environmentId: string;
  kind: "local" | "approved-edge" | "private-cloud" | "approved-managed-cloud";
  verification: CapabilityVerification;
  regions: string[];
  dataClassifications: Exclude<P34DataClassification, "phi-restricted">[];
  networkDefault: "deny";
  allowedDestinations: string[];
  tenantIsolation: boolean;
  auditability: "local-test-evidence" | "external-evidence-required";
  maximumMemoryBytes: number;
  maximumDurationMs: number;
};

export type CapabilityRegistry = {
  registryVersion: string;
  generatedFrom: "repository-config";
  providers: ProviderCapabilityEntry[];
  harnesses: HarnessCapabilityEntry[];
  environments: ExecutionEnvironmentProfile[];
  unknownCapabilityDecision: "deny";
  registryHash: string;
};

export type CapabilityAdmissionRequest = {
  routeId: string;
  taskClass: string;
  riskTier: P34RiskTier;
  dataClassification: P34DataClassification;
  region: string;
  environmentId: string;
  requiredInputModality: ProviderCapabilityEntry["inputModalities"][number];
  requiredOutputModality: ProviderCapabilityEntry["outputModalities"][number];
  requiredToolIds: string[];
  productPath: string;
  requiredCompatibility: Array<"ehr" | "fhir" | "dicom">;
  maximumLatencyMs: number;
  maximumCostUsd: number;
  evaluatedAt: string;
};

export type CapabilityAdmissionDecision = {
  decision: PolicyDecision;
  routeId: string | null;
  reasonCodes: string[];
  localEvaluationScore: number | null;
  routeEvidenceFresh: boolean;
  phiAuthorized: false;
  providerCallAuthorized: false;
  decisionHash: string;
};

export type TaskTechnique =
  | "validation-rules"
  | "deterministic-transformation"
  | "graph-traversal"
  | "optimization-conventional-ml"
  | "retrieval-reranking"
  | "generative-model"
  | "human-escalation";

export type TaskPolicy = {
  policyId: string;
  version: string;
  taskClass: string;
  intendedUse: string;
  riskTier: P34RiskTier;
  dataClassification: P34DataClassification;
  deterministicAlternatives: TaskTechnique[];
  minimumConfidence: number;
  minimumEvidenceCoverage: number;
  permittedRouteIds: string[];
  permittedToolIds: string[];
  reasoningBudget: "none" | "low" | "standard" | "high";
  maximumLatencyMs: number;
  maximumCostUsd: number;
  approvalRequirement: "none-read-only" | "human" | "qualified-human";
  escalationOwner: string;
  failClosed: true;
};

export type TaskTechniqueCandidate = {
  technique: TaskTechnique;
  candidateId: string;
  available: boolean;
  confidence: number;
  evidenceCoverage: number;
  estimatedLatencyMs: number;
  estimatedCostUsd: number;
  routeId: string | null;
  toolIds: string[];
};

export type DeterministicTaskRouteDecision = {
  decision: PolicyDecision;
  selectedTechnique: TaskTechnique | null;
  selectedCandidateId: string | null;
  selectedRouteId: string | null;
  reasonCodes: string[];
  evaluatedTechniques: TaskTechnique[];
  generativeFallbackAllowed: boolean;
  humanEscalationRequired: boolean;
  providerCallExecuted: false;
  decisionHash: string;
};

export type DocumentBoundingBox = {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ContextHierarchyAnnotation = {
  factId: string;
  headingPath: string[];
  tableHeaders: string[];
  boundingBox: DocumentBoundingBox | null;
};

export type ProvenanceContextChunk = {
  chunkId: string;
  sourceId: string;
  factId: string;
  headingPath: string[];
  repeatedTableHeaders: string[];
  sourceSpanIds: string[];
  boundingBox: DocumentBoundingBox | null;
  tokenEstimate: number;
  confidence: number;
  freshness: "current" | "stale" | "expired";
  contradictionGroupId: string | null;
  contentHash: string;
};

export type HealthcareContextEnvelope = {
  envelopeId: string;
  tenantId: string;
  purpose: string;
  artifact: ContextArtifact;
  chunks: ProvenanceContextChunk[];
  conflictGroupIds: string[];
  missingEvidence: string[];
  generationDecision: PolicyDecision;
  fhirProvenancePreview: {
    resourceType: "Provenance";
    id: string;
    recorded: string;
    target: Array<{ reference: string }>;
    entity: Array<{ role: "source"; what: { identifier: { value: string } } }>;
    extension: Array<{ url: string; valueString: string }>;
  };
  containsRawPhi: false;
  envelopeHash: string;
};

export type GroundedClaim = {
  claimId: string;
  statementHash: string;
  citedSourceSpanIds: string[];
};

export type GroundedClaimValidation = {
  decision: PolicyDecision;
  unsupportedClaimIds: string[];
  fabricatedReferenceIds: string[];
  validationHash: string;
};

export type DicomMetadataElement = {
  tag: string;
  vr: string;
  value: string;
  clinicalAttribute: boolean;
};

export type SyntheticDicomObject = {
  objectId: string;
  tenantId: string;
  transferSyntaxUid: string;
  sourceBytesHash: string;
  metadata: DicomMetadataElement[];
  pixelDataPresent: boolean;
  burnedInAnnotation: "NO" | "YES" | "UNKNOWN";
  malformed: boolean;
  syntheticOnly: true;
  containsRawPhi: false;
};

export type DicomDeidentificationProfile = {
  profileId: string;
  version: string;
  supportedTransferSyntaxUids: string[];
  retainedClinicalTags: string[];
  removedIdentifierTags: string[];
  removeAllPrivateTags: true;
  requirePixelReviewWhenUncertain: true;
  humanApprovalBeforeExport: true;
  effectiveAt: string;
};

export type DicomPrivacyManifest = {
  manifestId: string;
  objectId: string;
  sourceBytesHash: string;
  sourceUnmodified: true;
  profileId: string;
  profileVersion: string;
  operatorIdHash: string;
  evaluatedAt: string;
  detectedPrivateTags: string[];
  removedTagHashes: string[];
  retainedTagHashes: string[];
  pixelDisposition: "not-present" | "reviewed-no-annotation" | "quarantined-uncertain";
  disposition: "review-ready" | "quarantined" | "blocked";
  decision: PolicyDecision;
  reasonCodes: string[];
  exportAuthorized: false;
  researchUseAuthorized: false;
  beforeManifestHash: string;
  afterManifestHash: string | null;
  manifestHash: string;
};

export type AgentCapabilityStage = "discover" | "read" | "propose" | "approve" | "execute";

export type ControlledToolActionInput = {
  stage: AgentCapabilityStage;
  request: AgentActionPolicyRequest;
  authorization: AgentActionAuthorization;
  approval: AgentActionApproval | null;
  discoveredToolIds: string[];
  usedApprovalIds: string[];
  now: string;
  interface: "api" | "browser" | "filesystem" | "internal";
  reversible: boolean;
  sandboxed: boolean;
  cancelled: boolean;
  turnCount: number;
  maximumTurns: number;
};

export type ControlledToolActionDecision = {
  decision: PolicyDecision;
  stage: AgentCapabilityStage;
  reasonCodes: string[];
  approvalBound: boolean;
  cancellationObserved: boolean;
  executionAuthorized: false;
  servicePolicyReceiptHash: string;
};

export type GovernanceActionDetails = {
  parentEventId: string | null;
  delegatedAuthority: string[];
  pseudonymousCaseReference: string | null;
  taskClass: string;
  riskTier: P34RiskTier;
  evidenceHashes: string[];
  routingDecisionHash: string;
  approvalHashes: string[];
  actionStage: AgentCapabilityStage;
  proposedAction: string;
  resultStatus: "allowed" | "blocked" | "review-required" | "failed" | "verified";
  exceptionCodes: string[];
  escalationStatus: "none" | "pending" | "completed";
};

export type ContemporaneousGovernanceRecord = {
  evidenceRecord: DecisionEvidenceRecord;
  details: GovernanceActionDetails;
  resultOutputHash: string | null;
  detailsHash: string;
  fhirAuditEventPreview: {
    resourceType: "AuditEvent";
    id: string;
    recorded: string;
    action: "R" | "C" | "U" | "D" | "E";
    outcome: "0" | "4" | "8" | "12";
    agent: Array<{ who: { identifier: { value: string } }; requestor: boolean }>;
    entity: Array<{ what: { identifier: { value: string } } }>;
  };
  fhirProvenancePreview: {
    resourceType: "Provenance";
    id: string;
    recorded: string;
    target: Array<{ identifier: { value: string } }>;
    entity: Array<{ role: "source"; what: { identifier: { value: string } } }>;
  };
};

export type TwoLoopEvaluationInput = {
  evaluationId: string;
  datasetVersion: string;
  caseCount: number;
  repeatedTrials: number;
  baseline: QualityRatchetScore;
  challenger: QualityRatchetScore;
  variation: Record<"taskQuality" | "grounding" | "latency" | "cost", number>;
  innerChecks: Record<"safety" | "grounding" | "citation" | "extraction" | "toolSelection" | "completion", boolean>;
  outerMetrics: {
    completionRate: number;
    abandonmentRate: number;
    humanCorrectionRate: number;
    escalationRate: number;
    repeatedPromptRate: number;
    unsupportedAssertionRate: number;
    toolFailureRate: number;
    approvalDenialRate: number;
    rawPhiStored: boolean;
  };
  worstMaterialCellPassed: boolean;
  independentHumanReviewComplete: boolean;
  softRegressionApproved: boolean;
  rollbackReady: boolean;
};

export type TwoLoopEvaluationDecision = {
  decision: PolicyDecision;
  reasonCodes: string[];
  innerLoopPassed: boolean;
  outerLoopPassed: boolean;
  qualityRatchetHash: string;
  confidenceIntervalRecorded: boolean;
  automaticPromotionAllowed: false;
  promotionEligibleForHumanReview: boolean;
  rollbackImmediate: boolean;
  decisionHash: string;
};

export type TaskBudget = {
  maximumInputTokens: number;
  maximumCachedTokens: number;
  maximumReasoningTokens: number;
  maximumOutputTokens: number;
  maximumCostUsd: number;
  maximumLatencyMs: number;
  maximumToolLatencyMs: number;
  maximumRetries: number;
  maximumFallbacks: number;
  maximumTokenAmplification: number;
};

export type TaskUsage = {
  inputTokens: number;
  cachedTokens: number;
  reasoningTokens: number;
  outputTokens: number;
  costUsd: number;
  timeToFirstTokenMs: number;
  endToEndLatencyMs: number;
  toolLatencyMs: number;
  retries: number;
  fallbacks: number;
  providerErrors: number;
  rateLimitEvents: number;
  completed: boolean;
  humanReviewMinutes: number;
  avoidedWorkMinutes: number;
};

export type FinOpsResilienceDecision = {
  decision: PolicyDecision;
  runtimeState: "NORMAL" | "CONSTRAINED" | "DEGRADED" | "SAFE_REFUSAL";
  reasonCodes: string[];
  selectedFallbackRouteId: string | null;
  costPerCompletedTaskUsd: number | null;
  cacheHitRatio: number;
  tenantSafeCacheKey: string;
  circuitBreakerState: "closed" | "open";
  providerCallExecuted: false;
  decisionHash: string;
};

export type PlacementCandidate = {
  placementId: string;
  kind: ExecutionEnvironmentProfile["kind"];
  qualified: boolean;
  region: string;
  permittedDataClassifications: Exclude<P34DataClassification, "phi-restricted">[];
  maximumRiskTier: Exclude<P34RiskTier, "prohibited">;
  latencyMs: number;
  connectivityRequired: boolean;
  contractualEligibility: "verified-local" | "external-evidence-required";
  auditabilityVerified: boolean;
  modelCapabilityVerified: boolean;
};

export type PlacementDecision = {
  decision: PolicyDecision;
  selectedPlacementId: string | null;
  reasonCodes: string[];
  phiRouteAuthorized: false;
  unsafeAutonomousFallbackAllowed: false;
  decisionHash: string;
};

export type AgentOperationView = {
  operationId: string;
  task: string;
  workflow: string;
  responsibleHumanOwner: string;
  providerId: string;
  modelId: string;
  riskTier: P34RiskTier;
  state: "planning" | "shadow" | "awaiting-review" | "blocked" | "completed-synthetic";
  evidenceCompleteness: number;
  approvalState: "not-required" | "pending" | "approved" | "rejected";
  taskCompleted: boolean;
  exceptionRate: number;
  escalationRate: number;
  humanReviewRate: number;
  latencyMs: number;
  costPerCompletedTaskUsd: number | null;
  rollbackState: "ready" | "not-tested" | "blocked";
  syntheticOnly: true;
};

export type PilotObjective = {
  objectiveId: string;
  metric: "turnaround-time" | "abandonment" | "duplicate-records" | "context-retrieval" | "correction-burden" | "safety-quality";
  baseline: number;
  target: number;
  unit: string;
  ownerRole: string;
  externalApprovalRequired: boolean;
};

export type PublicClaimEvidence = {
  claimId: string;
  claim: string;
  category: "market" | "funding" | "benchmark" | "performance" | "regulatory" | "medical-device" | "security" | "partnership";
  sourceUrl: string | null;
  sourceKind: "primary" | "secondary" | "social-signal" | "missing";
  retrievedAt: string | null;
  ownerRole: string;
  expiresAt: string | null;
  approvedWording: string | null;
  legalApprovalRecorded: boolean;
};

export type PublicClaimDecision = {
  decision: PolicyDecision;
  reasonCodes: string[];
  publicationAuthorized: false;
  claimHash: string;
};

export type P34GateRecord = {
  gateId: string;
  status: P34GateStatus;
  ownerRole: string;
  description: string;
  evidence: string[];
  reasonCodes: string[];
  candidateBound: boolean;
  externalActionRequired: boolean;
  gateHash: string;
};

export type WorkflowMetricDefinition = {
  metricId: string;
  label: string;
  unit: string;
  direction: "increase" | "decrease" | "maintain";
  threshold: number;
};

export type WorkflowReleaseEvidence = {
  evidenceId: string;
  evidenceType: "baseline" | "safety" | "quality" | "privacy" | "security" | "rollback";
  evidenceHash: string;
  source: string;
  status: "verified-local" | "verified-documentary" | "pending" | "rejected";
  recordedAt: string;
  expiresAt: string;
};

export type WorkflowContract = {
  schemaVersion: "scrimed-workflow-contract-v1";
  workflowId: string;
  intendedUse: string;
  namedOwner: string;
  targetUser: string;
  baselineMeasurement: {
    metricId: string;
    value: number;
    unit: string;
    measuredAt: string;
    evidenceHash: string;
  };
  outcomeKpis: WorkflowMetricDefinition[];
  safetyKpis: WorkflowMetricDefinition[];
  dataSources: Array<{
    sourceId: string;
    sourceType: "repository-fixture" | "public-reference" | "approved-deidentified" | "fhir" | "dicom" | "ehr";
    required: boolean;
    evidenceHash: string;
  }>;
  dataClassification: P34DataClassification;
  dataLocality: {
    jurisdiction: string;
    region: string;
    environmentId: string;
  };
  requiredAuthority: string[];
  approvalPolicy: {
    requiredRoles: string[];
    exactPayloadBinding: true;
    approvalTtlMinutes: number;
  };
  rollbackPolicy: {
    ownerRole: string;
    rollbackSteps: string[];
    maximumRecoveryMinutes: number;
    testedEvidenceHash: string;
  };
  riskClass: P34RiskTier;
  clinicalReviewRequired: boolean;
  releaseEvidence: WorkflowReleaseEvidence[];
  effectiveAt: string;
  expiresAt: string;
};

export type WorkflowContractDecision = {
  decision: PolicyDecision;
  contractValid: boolean;
  executionEligibleForPolicyEvaluation: boolean;
  executionAuthorized: false;
  reasonCodes: string[];
  evidenceFreshness: "fresh" | "stale" | "missing";
  contractHash: string;
};

export type WorkflowModelFitDecision = {
  decision: PolicyDecision;
  selectedRouteId: string | null;
  selectedTechnique: TaskTechnique | null;
  eligibleRouteIds: string[];
  rejectedRoutes: Array<{ routeId: string; reasonCodes: string[] }>;
  routeReasons: string[];
  softConstraintJustifications: string[];
  publicBenchmarkRankUsed: false;
  providerCallExecuted: false;
  decisionHash: string;
};

export type ActionMaturityState =
  | "ANSWER_ONLY"
  | "RECOMMENDATION"
  | "DRAFT_ACTION"
  | "PENDING_APPROVAL"
  | "AUTHORIZED_EXECUTION"
  | "VERIFIED_OUTCOME"
  | "FAILED_OR_REVERSED";

export type ActionAuthorityEvidence = {
  approvalId: string;
  nonce: string;
  approverIdHash: string;
  authority: string;
  tenantId: string;
  workflowId: string;
  actionId: string;
  candidateHash: string;
  payloadHash: string;
  issuedAt: string;
  expiresAt: string;
};

export type ActionMaturityEvent = {
  eventId: string;
  actionId: string;
  workflowId: string;
  tenantId: string;
  previousState: ActionMaturityState | null;
  nextState: ActionMaturityState;
  actorIdHash: string;
  authority: string;
  inputHashes: string[];
  policyVersion: string;
  occurredAt: string;
  resultHash: string | null;
  rollbackStatus: "not-required" | "ready" | "pending" | "completed" | "failed";
  approvalId: string | null;
  idempotencyKey: string;
  previousEventHash: string | null;
  containsRawPhi: false;
  containsSecrets: false;
  eventHash: string;
};

export type ActionMaturityTransitionInput = {
  eventId: string;
  actionId: string;
  workflowId: string;
  tenantId: string;
  fromState: ActionMaturityState | null;
  toState: ActionMaturityState;
  actorIdHash: string;
  authority: string;
  inputHashes: string[];
  policyVersion: string;
  occurredAt: string;
  resultHash: string | null;
  rollbackStatus: ActionMaturityEvent["rollbackStatus"];
  approval: ActionAuthorityEvidence | null;
  candidateHash: string;
  payloadHash: string;
  idempotencyKey: string;
  targetClass: "internal-metadata" | "clinical-system-of-record" | "payer-system" | "ehr" | "other-system-of-record";
  executionMode: "dry-run" | "synthetic-simulation" | "external";
};

export type ActionMaturityTransitionDecision = {
  decision: PolicyDecision;
  transitionAccepted: boolean;
  reasonCodes: string[];
  event: ActionMaturityEvent | null;
  externalWriteAuthorized: false;
  approvalConsumed: boolean;
  decisionHash: string;
};

export type PilotExpansionEvidence = {
  expansionId: string;
  workflowId: string;
  cohort: { description: string; size: number; syntheticOnly: true };
  pilotStartedAt: string;
  pilotEndedAt: string;
  evidenceRecordedAt: string;
  evidenceExpiresAt: string;
  thresholds: {
    minimumTaskCompletionRate: number;
    minimumVerifiedOutcomeRate: number;
    maximumCriticalErrorRate: number;
    maximumOverrideRate: number;
    maximumRollbackRate: number;
    maximumReviewMinutesPerWorkflow: number;
    maximumAbandonmentRate: number;
    maximumP95LatencyMs: number;
    maximumCostPerCompletedWorkflowUsd: number;
  };
  observed: {
    taskCompletionRate: number;
    verifiedOutcomeRate: number;
    criticalErrorRate: number;
    overrideRate: number;
    rollbackRate: number;
    reviewMinutesPerWorkflow: number;
    abandonmentRate: number;
    p95LatencyMs: number;
    costPerCompletedWorkflowUsd: number;
  };
  approvals: Array<{
    role: "clinical" | "privacy-security" | "operational";
    approverIdHash: string;
    status: "approved" | "pending" | "rejected";
    evidenceHash: string;
    expiresAt: string;
  }>;
  evidenceHashes: string[];
};

export type TrustExpansionDecision = {
  decision: PolicyDecision;
  reasonCodes: string[];
  thresholdsPassed: boolean;
  evidenceFresh: boolean;
  namedApprovalsComplete: boolean;
  eligibleForExpansionReview: boolean;
  expansionAuthorized: false;
  decisionHash: string;
};

export type CareTeamRelationshipPeriod = {
  relationshipId: string;
  tenantId: string;
  subjectReferenceHash: string;
  careTeamReferenceHash: string;
  ownerRole: string;
  startedAt: string;
  endedAt: string | null;
};

export type ContinuityEvent = {
  eventId: string;
  tenantId: string;
  subjectReferenceHash: string;
  type: "relationship-start" | "transfer" | "interruption" | "reconnect" | "follow-up-created" | "follow-up-completed";
  occurredAt: string;
  fromCareTeamReferenceHash: string | null;
  toCareTeamReferenceHash: string | null;
  reasonCode: string;
  sourceEvidenceHash: string;
};

export type ContinuityAssessment = {
  decision: PolicyDecision;
  continuityDurationDays: number;
  transferCount: number;
  interruptionCount: number;
  reconnectCount: number;
  unresolvedInterruptionCount: number;
  providerTransitionRiskSignals: string[];
  followUpWorkQueue: Array<{
    workItemId: string;
    ownerRole: string;
    reasonCode: string;
    priority: "routine" | "elevated";
    humanReviewRequired: true;
  }>;
  segmentedKpis: Array<{
    segmentHash: string;
    relationshipDays: number;
    transfers: number;
    interruptions: number;
    reconnects: number;
  }>;
  containsRawPhi: false;
  causalClaimAuthorized: false;
  therapeuticClaimAuthorized: false;
  assessmentHash: string;
};

export type PublicSectorReadinessEvidenceProfile = {
  profileId: string;
  evidenceOwner: string;
  recordedAt: string;
  expiresAt: string;
  securityControls: WorkflowReleaseEvidence[];
  dataResidencyEvidence: WorkflowReleaseEvidence[];
  auditabilityEvidence: WorkflowReleaseEvidence[];
  accessibilityEvidence: WorkflowReleaseEvidence[];
  procurementArtifacts: WorkflowReleaseEvidence[];
  contractVehicleReferences: WorkflowReleaseEvidence[];
  status: "research" | "evidence-collection" | "review-ready" | "approved-documentary";
};

export type PublicSectorReadinessDecision = {
  decision: PolicyDecision;
  reasonCodes: string[];
  evidenceFresh: boolean;
  documentaryCoverage: number;
  readyForProcurementReview: boolean;
  complianceClaimAuthorized: false;
  purchasingEligibilityClaimAuthorized: false;
  decisionHash: string;
};

export type ChallengerModelProfile = {
  challengerId: string;
  modelReference: string;
  sourceClassification: "unverified-research-input" | "locally-reproduced";
  supportedTaskCandidates: string[];
  modalities: Array<"text" | "structured" | "image" | "tool-call">;
  licenseStatus: "unverified" | "reviewed";
  infrastructureRequirements: string[];
  isolatedNonPhiOnly: true;
  phiPermitted: false;
  productionRegistered: false;
  providerCallsEnabled: false;
  enabled: false;
};

export type ChallengerEvaluationRun = {
  runId: string;
  challengerId: string;
  taskProfileId: string;
  fixtureSetHash: string;
  harnessHash: string;
  seed: number;
  evaluatedAt: string;
  isolatedEnvironmentId: string;
  dataClassification: "public" | "synthetic-no-phi";
  providerCallExecuted: false;
  metrics: {
    quality: number;
    instructionFollowing: number;
    toolAccuracy: number;
    p95LatencyMs: number;
    costPerCompletedWorkflowUsd: number;
    reliability: number;
  };
  licenseEvidenceHash: string | null;
  infrastructureEvidenceHash: string | null;
  locallyReproduced: boolean;
  namedApprovalRecorded: boolean;
};

export type ChallengerEvaluationDecision = {
  decision: PolicyDecision;
  reasonCodes: string[];
  locallyReproducedEvidenceAccepted: boolean;
  eligibleForNamedReview: boolean;
  productionPromotionAuthorized: false;
  phiAuthorized: false;
  decisionHash: string;
};

export type WorkflowRoiDashboard = {
  schemaVersion: "scrimed-workflow-roi-v1";
  askingVersusDoing: { asking: number; doing: number; total: number };
  verifiedOutcomes: number;
  failedOrRolledBackActions: number;
  humanReviewMinutes: number;
  continuity: {
    relationshipDays: number;
    transfers: number;
    interruptions: number;
    reconnects: number;
  };
  costPerCompletedWorkflowUsd: number | null;
  providerDistribution: Array<{ providerId: string; modelId: string; workflowCount: number }>;
  routingRationale: string[];
  evidenceFreshness: "fresh" | "stale" | "missing";
  expansionGateStatus: PolicyDecision;
  containsRawPhi: false;
  dashboardHash: string;
};

export type P34FeatureFlags = {
  adaptiveGovernanceEnabled: boolean;
  clinicalOperatingSystemEnabled: boolean;
  autonomyContractEnabled: boolean;
  phiBoundaryEnabled: boolean;
  sandboxPolicyEnabled: boolean;
  externalValidationEnabled: boolean;
  patientTakeHomePreviewEnabled: boolean;
  medicalCodingDraftEnabled: boolean;
  deterministicRouterEnabled: boolean;
  contextProvenanceEnabled: boolean;
  syntheticDicomPrivacyEnabled: boolean;
  decisionLedgerEnabled: boolean;
  twoLoopEvaluationEnabled: boolean;
  finOpsResilienceEnabled: boolean;
  hybridPlacementEnabled: boolean;
  workflowContractsEnabled: boolean;
  continuityMetricsEnabled: boolean;
  challengerEvaluationEnabled: boolean;
  trustExpansionEnabled: boolean;
  publicSectorClaimsEnabled: boolean;
  externalProviderCallsEnabled: boolean;
  dicomExportEnabled: boolean;
  livePhiEnabled: boolean;
  consequentialExecutionEnabled: boolean;
  productionPromotionEnabled: boolean;
};

export type AutonomyTier = "A0" | "A1" | "A2" | "A3";

export type ConsequentialActionClass =
  | "information-display"
  | "draft-recommendation"
  | "reversible-internal-write"
  | "external-communication"
  | "clinical-decision"
  | "medication-or-order"
  | "patient-result-release"
  | "billing-submission"
  | "payer-submission"
  | "system-of-record-write"
  | "destructive-action"
  | "permission-change";

export type ScopedAutonomyApproval = {
  approvalId: string;
  tenantId: string;
  actorIdHash: string;
  approverIdHash: string;
  actionId: string;
  actionClass: ConsequentialActionClass;
  resourceId: string;
  payloadHash: string;
  idempotencyKey: string;
  policyVersion: string;
  authorityScope: string[];
  issuedAt: string;
  expiresAt: string;
  evidenceHash: string;
};

export type AutonomyContractRequest = {
  tenantId: string;
  actorIdHash: string;
  authenticatedIdentityHash: string;
  accountableHumanIdHash: string | null;
  task: string;
  actionId: string;
  actionClass: ConsequentialActionClass;
  resourceId: string;
  payloadHash: string;
  idempotencyKey: string;
  requestedTier: AutonomyTier;
  maximumAuthorizedTier: AutonomyTier;
  reversible: boolean;
  syntheticOnly: boolean;
  dataClassification: P34DataClassification;
  policyVersion: string;
  stoppingCondition: string;
  approval: ScopedAutonomyApproval | null;
  usedApprovalIds: string[];
  evaluatedAt: string;
};

export type AutonomyContractDecision = {
  decision: PolicyDecision;
  requestedTier: AutonomyTier;
  grantedTier: AutonomyTier;
  accountablePartyHash: string | null;
  authorizationState: "not-required" | "missing" | "verification-required" | "invalid";
  stoppingCondition: string;
  reasonCodes: string[];
  executionAuthorized: boolean;
  externalWriteAuthorized: false;
  clinicalAuthorityGranted: false;
  approvalConsumed: boolean;
  decisionHash: string;
};

export type ClinicalOperatingGovernanceRecord = {
  recordId: string;
  ledgerId: string;
  tenantId: string;
  caseReferenceHash: string | null;
  traceId: string;
  correlationId: string;
  occurredAt: string;
  task: string;
  autonomyTier: AutonomyTier;
  initiatingActorIdHash: string;
  authenticatedIdentityHash: string;
  accountableHumanIdHash: string | null;
  authorityScope: string[];
  providerId: string;
  modelId: string;
  modelVersion: string;
  harnessVersion: string;
  promptVersion: string;
  policyVersion: string;
  toolVersions: string[];
  sourceHashes: string[];
  retrievalCitationIds: string[];
  constraintsApplied: string[];
  requestedToolIds: string[];
  executedToolIds: string[];
  approvals: Array<{
    approvalId: string;
    approverIdHash: string;
    authorityScope: string[];
    approvedAt: string;
    expiresAt: string;
    approvalHash: string;
  }>;
  proposedAction: string;
  disposition: "allowed" | "blocked" | "review-required" | "failed" | "verified";
  outcomeHash: string | null;
  confidence: number | null;
  calibration: "not-applicable" | "uncalibrated" | "calibrated" | "insufficient-evidence";
  supersededByRecordHash: string | null;
  replayOfRecordHash: string | null;
  rolledBackByRecordHash: string | null;
  previousRecordHash: string | null;
  containsRawPhi: false;
  containsSecrets: false;
  hiddenChainOfThoughtStored: false;
  recordHash: string;
};

export type PhiFieldRegistration = {
  fieldId: string;
  schemaId: string;
  fieldPath: string;
  classification: "direct-identifier" | "quasi-identifier" | "clinical-sensitive" | "secret" | "non-sensitive";
  dataType: "string" | "number" | "date" | "object" | "array" | "boolean";
  reversibleTokenizationRequired: boolean;
  minimumNecessaryPurposes: string[];
  retentionClass: "ephemeral" | "operational" | "regulated" | "none";
  ownerRole: string;
};

export type PhiFieldRegistry = {
  registryId: string;
  version: string;
  fields: PhiFieldRegistration[];
  defaultUnknownFieldDecision: "BLOCK";
  registryHash: string;
};

export type PhiSchemaField = {
  schemaId: string;
  fieldPath: string;
  sensitive: boolean;
};

export type PhiRegistryValidation = {
  decision: PolicyDecision;
  missingClassifications: string[];
  duplicateRegistrations: string[];
  startupAllowed: boolean;
  validationHash: string;
};

export type OpaqueTokenReceipt = {
  token: string;
  tenantId: string;
  fieldId: string;
  purpose: string;
  issuedAt: string;
  expiresAt: string;
  reversible: true;
  containsPlaintext: false;
  receiptHash: string;
};

export type TokenResolutionGrant = {
  grantId: string;
  tenantId: string;
  token: string;
  purpose: string;
  validatorIdHash: string;
  validationEvidenceHash: string;
  issuedAt: string;
  expiresAt: string;
  grantHash: string;
};

export type SecretHandle = {
  handleId: string;
  secretClass: "provider-credential" | "connector-credential" | "encryption-key";
  tenantId: string;
  allowedRuntimeId: string;
  allowedPurpose: string;
  expiresAt: string;
  plaintextExposedToModel: false;
};

export type PhiEgressRequest = {
  tenantId: string;
  purpose: string;
  productPath: string;
  dataClassification: P34DataClassification;
  fieldIds: string[];
  payload: unknown;
  tokenReceipts: OpaqueTokenReceipt[];
  providerRoute: ProviderCapabilityEntry | null;
  minimumNecessary: boolean;
  consentVerified: boolean;
  postResponseValidated: boolean;
  evaluatedAt: string;
};

export type PhiEgressDecision = {
  decision: PolicyDecision;
  reasonCodes: string[];
  detectedSensitivePaths: string[];
  tokenRoundTripValid: boolean;
  reidentificationAuthorized: boolean;
  providerCallAuthorized: boolean;
  containsRawPhi: false;
  decisionHash: string;
};

export type BreakGlassRequest = {
  requestId: string;
  tenantId: string;
  actorIdHash: string;
  approverIdHash: string | null;
  reasonCode: string;
  incidentReferenceHash: string;
  requestedScope: string[];
  issuedAt: string;
  expiresAt: string;
  auditEventHash: string | null;
};

export type BreakGlassDecision = {
  decision: PolicyDecision;
  reasonCodes: string[];
  grantedScope: string[];
  timeLimited: boolean;
  mandatoryReviewRequired: true;
  clinicalAuthorityGranted: false;
  decisionHash: string;
};

export type AgentSandboxPolicy = {
  policyId: string;
  version: string;
  tenantId: string;
  workspaceRoot: string;
  allowedFilesystemRoots: string[];
  allowedNetworkDomains: string[];
  networkDefault: "deny";
  maximumCpuMillis: number;
  maximumMemoryBytes: number;
  maximumDiskBytes: number;
  maximumProcesses: number;
  maximumToolCalls: number;
  maximumWallClockMs: number;
  immutableBaseImageDigest: string;
  disposableWritableLayer: true;
  hostCredentialInheritance: false;
};

export type AgentSandboxRequest = {
  tenantId: string;
  runId: string;
  workspacePath: string;
  filesystemPaths: string[];
  networkDestinations: string[];
  requestedMounts: string[];
  requestedCpuMillis: number;
  requestedMemoryBytes: number;
  requestedDiskBytes: number;
  requestedProcesses: number;
  requestedToolCalls: number;
  requestedWallClockMs: number;
  secretHandles: SecretHandle[];
  hostCredentialsRequested: boolean;
  privilegeEscalationRequested: boolean;
  cleanupVerified: boolean;
};

export type AgentSandboxDecision = {
  decision: PolicyDecision;
  reasonCodes: string[];
  policyCompliant: boolean;
  isolatedWorkspaceAuthorized: boolean;
  runtimeContainmentVerified: false;
  networkDestinationsAllowed: string[];
  cleanupRequired: true;
  externalSandboxActivated: false;
  decisionHash: string;
};

export type ClinicalEntityAlias = {
  canonicalEntityId: string;
  alias: string;
  aliasKind: "official" | "common" | "abbreviation" | "legacy";
  terminologyVersion: string;
};

export type ClinicalRetrievalCandidate = {
  candidateId: string;
  tenantId: string;
  canonicalEntityId: string;
  aliases: string[];
  hierarchyPath: string[];
  sourceAuthority: "authoritative" | "reviewed" | "unverified";
  sourceSpanIds: string[];
  effectiveAt: string;
  expiresAt: string;
  lexicalScore: number;
  semanticScore: number;
  rerankScore: number;
  contradictionGroupId: string | null;
  dataClassification: P34DataClassification;
  authorizedPurposes: string[];
  contentHash: string;
};

export type ClinicalRetrievalRequest = {
  tenantId: string;
  purpose: string;
  query: string;
  canonicalEntityId: string | null;
  authorizedDataClassifications: P34DataClassification[];
  maximumResults: number;
  minimumEvidenceCount: number;
  minimumRerankScore: number;
  evaluatedAt: string;
};

export type ClinicalRetrievalAuthorizationContext = {
  authenticatedTenantId: string;
  authenticatedActorIdHash: string;
  authorizedPurposes: string[];
  authorizedDataClassifications: P34DataClassification[];
  authorizationEvidenceHash: string;
  evaluatedAt: string;
};

export type ClinicalRetrievalDecision = {
  decision: PolicyDecision;
  resultIds: string[];
  reasonCodes: string[];
  ambiguousEntityIds: string[];
  staleCandidateIds: string[];
  conflictingGroupIds: string[];
  citationCoverage: number;
  abstained: boolean;
  tenantFilterAppliedBeforeRanking: true;
  decisionHash: string;
};

export type ExternalValidationEvidence = {
  validationId: string;
  capabilityId: string;
  internalOnly: boolean;
  siteIds: string[];
  healthSystemIds: string[];
  acquisitionSystemIds: string[];
  cohortIds: string[];
  demographicSubgroups: string[];
  workflowSettings: string[];
  timePeriods: string[];
  distributionShiftEvaluated: boolean;
  metrics: {
    discrimination: number | null;
    sensitivity: number | null;
    specificity: number | null;
    calibrationError: number;
    abstentionRate: number;
    missingCriticalStepRate: number;
    unsupportedExtraRate: number;
    clinicianOverrideRate: number;
    downstreamHarmProxyRate: number;
  };
  subgroupWorstCellPassed: boolean;
  evidenceHash: string;
  recordedAt: string;
  expiresAt: string;
  namedReviewerApprovalHashes: string[];
};

export type ExternalValidationDecision = {
  decision: PolicyDecision;
  reasonCodes: string[];
  evidenceFresh: boolean;
  externallyValidated: boolean;
  clinicalProductionEligible: false;
  decisionHash: string;
};

export type OversightDriftMetrics = {
  totalActions: number;
  reviewedActions: number;
  overrides: number;
  corrections: number;
  errors: number;
  silentAcceptances: number;
  medianReviewLatencyMs: number;
  riskCohortCoverage: number;
  requestedReviewRate: number;
  approvedReviewRate: number;
  oversightReductionApprovalHash: string | null;
};

export type OversightDriftDecision = {
  decision: PolicyDecision;
  reasonCodes: string[];
  reviewedActionPercentage: number;
  errorRate: number;
  errorVolume: number;
  silentAcceptanceRate: number;
  oversightReductionAuthorized: boolean;
  decisionHash: string;
};

export type PatientCommunicationPreferences = {
  preferenceId: string;
  channel: "portal" | "print" | "email-draft" | "caregiver-proxy";
  timing: "immediate-after-review" | "scheduled" | "clinician-directed";
  language: string;
  accessibility: string[];
  proxyIdHash: string | null;
  proxyAuthorizationHash: string | null;
  clinicianReviewRequired: boolean;
  sensitiveResultRestriction: "clinician-release-only" | "approved-education-only";
  effectiveAt: string;
  expiresAt: string;
};

export type PatientTakeHomeInput = {
  documentId: string;
  tenantId: string;
  sourceFacts: Array<{
    factId: string;
    approvedText: string;
    sourceSpanIds: string[];
    approvedForEducation: boolean;
  }>;
  preferences: PatientCommunicationPreferences;
  clinicianReview: {
    reviewerIdHash: string | null;
    decision: "approved" | "rejected" | "pending";
    reviewedAt: string | null;
  };
  generatedAt: string;
};

export type PatientTakeHomeDocument = {
  decision: PolicyDecision;
  title: string;
  sections: Array<{ heading: string; body: string; sourceSpanIds: string[] }>;
  channel: PatientCommunicationPreferences["channel"];
  language: string;
  accessibility: string[];
  disclaimer: string;
  reasonCodes: string[];
  deliveryAuthorized: boolean;
  containsDiagnosisOrAdvice: false;
  documentHash: string;
};

export type MedicalCodingMode = "assisted" | "computer-assisted" | "autonomous";

export type MedicalCodingContract = {
  contractId: string;
  capabilityId: string;
  mode: MedicalCodingMode;
  specialtyCoverage: string[];
  humanReviewRequired: boolean;
  auditRequired: true;
  ruleSetOwner: string;
  ruleVersion: string;
  evidenceHashes: string[];
  effectiveAt: string;
  expiresAt: string;
  rollbackPath: string[];
  billingReleaseAuthorityHash: string | null;
};

export type MedicalCodingDecision = {
  decision: PolicyDecision;
  effectiveMode: "assisted" | "computer-assisted";
  reasonCodes: string[];
  draftAuthorized: boolean;
  billingSubmissionAuthorized: false;
  decisionHash: string;
};

export type OperationalInvocation = {
  invocationId: string;
  tenantId: string;
  traceId: string;
  idempotencyKey: string;
  attempt: number;
  maximumAttempts: number;
  failureClass: "transient" | "permanent" | "policy" | "unknown" | null;
  state: "ready" | "retrying" | "dead-letter" | "suspended" | "completed";
  checkpointHash: string | null;
  checkpointVerified: boolean;
  suspended: boolean;
  costUsd: number;
  latencyMs: number;
  containsRawPhi: false;
  containsSecrets: false;
};

export type OperationalRecoveryDecision = {
  decision: PolicyDecision;
  nextState: OperationalInvocation["state"];
  retryAllowed: boolean;
  idempotencyPreserved: boolean;
  deadLetterRequired: boolean;
  reasonCodes: string[];
  decisionHash: string;
};

export type ApprovedPublicClaim = {
  claimId: string;
  category: "clinical" | "security" | "performance" | "interoperability" | "customer" | "regulatory" | "savings";
  ownerRole: string;
  approvedWording: string;
  primaryEvidence: Array<{ sourceId: string; sourceUrl: string; evidenceHash: string }>;
  scope: string;
  limitations: string[];
  approvalHashes: string[];
  approvedAt: string;
  expiresAt: string;
  targetAudience: string;
  channel: string;
  revalidateAt: string;
};

export type ApprovedPublicClaimDecision = {
  decision: PolicyDecision;
  reasonCodes: string[];
  structurallyValid: boolean;
  publicationAuthorized: false;
  claimHash: string;
};

export type P34ProviderFootprint = ProviderDependencyFootprint;
export type P34SourceClassification = ContextDataClassification;
