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
  maximumLatencyMs: number;
  maximumCostUsd: number;
  evaluatedAt: string;
};

export type CapabilityAdmissionDecision = {
  decision: PolicyDecision;
  routeId: string | null;
  reasonCodes: string[];
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

export type P34FeatureFlags = {
  adaptiveGovernanceEnabled: boolean;
  deterministicRouterEnabled: boolean;
  contextProvenanceEnabled: boolean;
  syntheticDicomPrivacyEnabled: boolean;
  decisionLedgerEnabled: boolean;
  twoLoopEvaluationEnabled: boolean;
  finOpsResilienceEnabled: boolean;
  hybridPlacementEnabled: boolean;
  externalProviderCallsEnabled: boolean;
  dicomExportEnabled: boolean;
  livePhiEnabled: boolean;
  consequentialExecutionEnabled: boolean;
  productionPromotionEnabled: boolean;
};

export type P34ProviderFootprint = ProviderDependencyFootprint;
export type P34SourceClassification = ContextDataClassification;
