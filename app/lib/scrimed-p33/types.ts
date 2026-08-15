import type { PolicyDecision } from "../scrimed-work/p32Contracts";
import type { RiskLevel } from "../scrimed-work/types";

export type P33GateStatus = "PASS" | "OPERATOR_REQUIRED" | "BLOCKED" | "FAIL";

export type ContextDataClassification =
  | "public"
  | "synthetic-no-phi"
  | "deidentified-approved"
  | "phi-prohibited";

export type ContextSourceKind =
  | "fhir"
  | "clinical-note"
  | "radiology-report"
  | "discharge-summary"
  | "structured-document"
  | "unstructured-document";

export type SourceSpan = {
  sourceId: string;
  sourceHash: string;
  startScalar: number;
  endScalar: number;
  startUtf16: number;
  endUtf16: number;
  quotedText: string;
  sectionId: string;
  page: number | null;
};

export type TemporalEvent = {
  eventId: string;
  occurredAt: string;
  precision: "instant" | "day" | "month" | "unknown";
  conceptIds: string[];
  sourceSpanIds: string[];
  uncertainty: string[];
};

export type CoreferenceRelation = {
  relationId: string;
  mention: string;
  resolvedEntityId: string;
  confidence: number;
  sourceSpanId: string;
};

export type ClinicalConceptMapping = {
  mappingId: string;
  factId: string;
  localLabel: string;
  canonicalSystem: "FHIR" | "SNOMED_CT" | "LOINC" | "RXNORM" | "ICD_10_CM" | "LOCAL";
  canonicalCode: string;
  display: string;
  confidence: number;
  terminologySnapshotId: string;
  licenseState: "public" | "caller-supplied-restricted" | "unavailable";
};

export type MedicationProblemRelation = {
  relationId: string;
  medicationFactId: string;
  problemFactId: string;
  relation: "treats" | "contraindicated-with" | "monitor-for" | "uncertain";
  confidence: number;
  evidenceSpanIds: string[];
};

export type ContextFact = {
  factId: string;
  sectionId: string;
  noteType: ContextSourceKind;
  statement: string;
  normalizedStatement: string;
  conceptIds: string[];
  sourceSpanIds: string[];
  significance: "routine" | "important" | "critical-review";
  confidence: number;
  uncertainty: string[];
  contradictionGroupId: string | null;
};

export type ContextAccessPolicy = {
  policyVersion: string;
  tenantId: string;
  authorizedAgentIds: string[];
  allowedPurposes: string[];
  allowedSections: string[];
  minimumNecessary: true;
  consentState: "not-required-synthetic" | "verified" | "revoked" | "missing";
  expiresAt: string;
  revocable: true;
};

export type ContextArtifact = {
  artifactId: string;
  schemaVersion: string;
  tenantId: string;
  subjectReferenceHash: string;
  inputClassification: Exclude<ContextDataClassification, "phi-prohibited">;
  deidentificationState: "synthetic" | "approved-deidentified";
  sourceDocuments: Array<{
    sourceId: string;
    kind: ContextSourceKind;
    noteType: string;
    contentHash: string;
    effectiveAt: string;
    version: string;
  }>;
  sourceSpans: Array<SourceSpan & { spanId: string }>;
  facts: ContextFact[];
  timeline: TemporalEvent[];
  coreferences: CoreferenceRelation[];
  conceptMappings: ClinicalConceptMapping[];
  medicationProblemRelations: MedicationProblemRelation[];
  accessPolicy: ContextAccessPolicy;
  contradictions: string[];
  missingInformation: string[];
  expiresAt: string;
  version: string;
  containsRawPhi: false;
  deterministicInvalidationKey: string;
  integrityHash: string;
};

export type ContextViewGrant = {
  grantId: string;
  tenantId: string;
  agentId: string;
  purpose: string;
  requestedSections: string[];
  issuedAt: string;
  expiresAt: string;
  revokedAt: string | null;
};

export type ClinicalSignalCompression = {
  compressionId: string;
  contextArtifactHash: string;
  tenantId: string;
  purpose: string;
  summaryFacts: ContextFact[];
  timeline: TemporalEvent[];
  medicationDoseWarnings: string[];
  contradictions: string[];
  missingInformation: string[];
  omittedSectionIds: string[];
  sourceSpanIds: string[];
  compressionRatio: number;
  decisionSupportOnly: true;
  replacesSourceRecord: false;
  humanReviewRequired: true;
  integrityHash: string;
};

export type ClinicalExtractionReleaseGateInput = {
  extractionId: string;
  contextArtifactHash: string;
  provenanceComplete: boolean;
  evidenceComplete: boolean;
  policyVersion: string | null;
  terminologyAuthorization: "authorized" | "caller-supplied-required" | "missing";
  safetyChecksPassed: boolean;
  qualifiedReviewerIdHash: string | null;
  reviewDecision: "approved" | "rejected" | "pending";
  contradictionsResolved: boolean;
  containsUnsupportedClinicalClaim: boolean;
};

export type ClinicalExtractionReleaseGateResult = {
  decision: PolicyDecision;
  status: "release-ready-for-declared-synthetic-purpose" | "review-required" | "blocked";
  reasonCodes: string[];
  exportAuthority: "synthetic-preview-only" | "none";
  clinicalRecordAuthority: false;
  payerSubmissionAuthority: false;
  integrityHash: string;
};

export type DecisionEvidenceRecord = {
  recordId: string;
  ledgerId: string;
  tenantId: string;
  traceId: string;
  correlationId: string;
  actorIdHash: string;
  accountableHumanAuthorityHash: string | null;
  authorizedScope: string[];
  intendedUse: string;
  policyVersion: string;
  regulatoryLabelVersion: string;
  modelIdentity: string;
  providerIdentity: string;
  harnessIdentity: string;
  promptVersion: string;
  toolVersions: string[];
  buildIdentity: string;
  dataClassification: ContextDataClassification;
  consentState: ContextAccessPolicy["consentState"];
  evidenceReferences: string[];
  sourceHashes: string[];
  inputHash: string;
  outputHash: string | null;
  constraintsApplied: string[];
  approvalState: "not-required" | "pending" | "approved" | "rejected";
  reviewerRole: string | null;
  outcome: "allowed" | "blocked" | "review-required" | "failed" | "verified";
  affectedObjectIds: string[];
  reversible: boolean;
  replayRecipe: {
    fixtureIds: string[];
    policyVersion: string;
    modelProfileId: string;
    toolContractIds: string[];
  };
  occurredAt: string;
  previousRecordHash: string | null;
  containsRawPhi: false;
  containsSecrets: false;
  hiddenChainOfThoughtStored: false;
  recordHash: string;
};

export type RegulatoryLabelTwin = {
  labelId: string;
  version: string;
  productModule: string;
  intendedUse: string[];
  excludedUses: string[];
  jurisdiction: string;
  authorizedRoles: string[];
  requiredHumanReviewRoles: string[];
  permittedClaimIds: string[];
  supportingEvidenceIds: string[];
  allowedDataClasses: ContextDataClassification[];
  riskLevel: RiskLevel;
  requiredValidations: string[];
  requiredReleaseGates: string[];
  effectiveAt: string;
  expiresAt: string;
  supersedesLabelHash: string | null;
  labelHash: string;
};

export type OversightPolicy = {
  policyId: string;
  version: string;
  fixedSentinelCohortIds: string[];
  reviewRates: Record<"low" | "moderate" | "high" | "prohibited", number>;
  maximumErrorBudget: number;
  minimumReviewRateCanFallWithAccuracyAlone: false;
};

export type OversightObservation = {
  cohortId: string;
  riskLevel: RiskLevel;
  observedReviewRate: number;
  approvedReviewRate: number;
  errorRate: number;
  automationBiasSignals: number;
  workflowExpansionDetected: boolean;
  falseReassuranceSignals: number;
  lowFrequencyHarmSignals: number;
};

export type OversightDriftResult = {
  decision: PolicyDecision;
  reasonCodes: string[];
  missingSentinelCohortIds: string[];
  automaticOversightReductionAllowed: false;
  integrityHash: string;
};

export type AgenticChangeKind = "code" | "policy" | "prompt" | "schema" | "model" | "tool" | "workflow";

export type AgenticChangeProposal = {
  changeId: string;
  tenantId: string;
  proposerId: string;
  proposerType: "human" | "agent";
  changeKind: AgenticChangeKind;
  affectedPaths: string[];
  affectedModules: string[];
  dataClasses: ContextDataClassification[];
  requestedEnvironment: "local" | "test" | "preview" | "production";
  requestedActions: string[];
  testEvidenceIds: string[];
  rollbackPlan: string;
};

export type AgenticChangeDecision = {
  riskTier: RiskLevel;
  decision: PolicyDecision;
  reasonCodes: string[];
  requiredTests: string[];
  requiredReviewerRoles: string[];
  protectedPathMatches: string[];
  impact: Record<"clinical" | "privacy" | "security" | "regulatory" | "financial" | "operational", string>;
  selfApprovalAllowed: false;
  postMergeMonitoring: string[];
  reviewPacketHash: string;
};

export type AgentTaskEnvelope = {
  envelopeId: string;
  tenantId: string;
  actorId: string;
  taskClass: string;
  riskLevel: RiskLevel;
  requiredCapabilities: string[];
  toolSchemaIds: string[];
  filesystemRoots: string[];
  networkDestinations: string[];
  dataLocality: "local-only" | "approved-region" | "public-anywhere";
  dataClassification: ContextDataClassification;
  approvalPolicy: "none" | "operator" | "qualified-human";
  reasoningDepth: "low" | "standard" | "high";
  budgets: {
    maximumDurationMs: number;
    maximumInputTokens: number;
    maximumOutputTokens: number;
    maximumCostUsd: number;
    maximumCpuMs: number;
    maximumMemoryBytes: number;
    maximumTurns: number;
  };
  evidenceRequirements: string[];
  citationRequired: boolean;
};

export type AgentResultEnvelope = {
  envelopeId: string;
  routeId: string | null;
  status: "completed" | "review-required" | "blocked" | "safe-refusal" | "cancelled";
  resultHash: string | null;
  safetyFlags: string[];
  missingInformation: string[];
  evidenceReferences: string[];
  humanReviewRequired: boolean;
  routingRationale: string[];
  providerCallExecuted: false;
};

export type AgentRouteCandidate = {
  routeId: string;
  providerId: string;
  modelId: string;
  harnessId: string;
  qualifiedCapabilities: string[];
  qualifiedRiskCeiling: Exclude<RiskLevel, "prohibited">;
  locality: AgentTaskEnvelope["dataLocality"][];
  toolReliability: number;
  groundedness: number;
  taskFit: number;
  latencyMs: number;
  estimatedTaskCostUsd: number;
  cacheEligible: boolean;
  available: boolean;
  featureEnabled: boolean;
  externalEvidenceVerified: boolean;
};

export type LocalWorkerAdmission = {
  decision: PolicyDecision;
  reasonCodes: string[];
  sandboxRequired: true;
  networkDefault: "deny";
  approvedFilesystemRoots: string[];
  approvedToolIds: string[];
  resourceLimitsEnforced: boolean;
  killSwitchArmed: boolean;
  confidentialComputeCapability: "not-present" | "declared-unverified" | "attested";
  providerCallExecuted: false;
  admissionHash: string;
};

export type ClinicalTrajectoryCase = {
  caseId: string;
  tenantId: string;
  syntheticOnly: true;
  cutoffAt: string;
  availableEvidenceIds: string[];
  expectedRequiredSteps: string[];
  contraindicatedSteps: string[];
  heldOutTrajectoryHash: string;
};

export type ClinicalTrajectoryEvaluation = {
  evaluationId: string;
  caseId: string;
  semanticMatch: number;
  requiredStepSpecificity: number;
  groundedness: number;
  missingCriticalSteps: string[];
  hallucinatedAdditions: string[];
  contraindicatedSuggestions: string[];
  toolCallValidity: number;
  completionRate: number;
  turnCount: number;
  latencyMs: { p50: number; p95: number };
  tokenVolume: number;
  estimatedCostUsd: number;
  cacheHitRate: number;
  humanReviewDisposition: "pending" | "accepted-for-regression" | "rejected";
  promotionEligible: false;
  decision: PolicyDecision;
  evaluationHash: string;
};

export type OpportunityPriority = "P0" | "P1" | "P2";

export type OpportunityModule = {
  moduleId: string;
  title: string;
  priority: OpportunityPriority;
  featureFlag: string;
  enabledByDefault: boolean;
  workflow: string[];
  evidenceRequirements: string[];
  operationalKpis: string[];
  whyInvestorsCare: string;
  boundary: string;
  humanReviewRequired: boolean;
  externalActionsEnabled: false;
};

export type PilotProfileId =
  | "NON_PHI_CONTROLLED_PILOT"
  | "PHI_CAPABLE_PILOT"
  | "LINUX_LOCAL_AGENT_PILOT";

export type PilotProfileEvaluation = {
  profileId: PilotProfileId;
  status: P33GateStatus;
  reasonCodes: string[];
  requiredEvidence: string[];
  bypassAllowed: false;
  livePhiAllowed: false;
  liveClinicalOperationAllowed: false;
  integrityHash: string;
};
