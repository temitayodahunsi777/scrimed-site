import type { ModelRouteDecision, RiskLevel } from "./types";

export const scrimedP32ContractVersion = "scrimed-p32-contracts-v2-2026-07-30";

export const scrimedP32Boundary =
  "SCRIMED p.32 operates on public, synthetic, deidentified, or metadata-only inputs. It does not authorize live PHI, autonomous diagnosis or treatment, trial enrollment, patient outreach, payer submission, EHR writeback, production migration, certification claims, or customer go-live.";

export type PolicyDecision = "ALLOW" | "REQUIRE_HUMAN" | "BLOCK";

export type P32InputClassification =
  | "public-reference"
  | "synthetic-no-phi"
  | "deidentified-approved"
  | "metadata-only"
  | "phi-prohibited";

export type ConsequentialAttribution = {
  tenantId: string;
  actor: {
    actorId: string;
    actorType: "user" | "agent" | "service";
    role: string;
    authenticated: boolean;
  };
  purpose: string;
  workflowId: string;
  inputClassification: P32InputClassification;
  model: {
    providerId: string;
    modelId: string;
    version: string;
  };
  evidenceSourceIds: string[];
  policyVersion: string;
  decision: PolicyDecision;
  humanApprovalRequired: boolean;
  occurredAt: string;
  correlationId: string;
  idempotencyKey: string;
};

export type EvidenceSource = {
  sourceId: string;
  tenantId: string;
  sourceType: "guideline" | "regulator" | "peer-reviewed" | "institutional-policy" | "public-reference";
  title: string;
  canonicalUrl: string;
  publicationDate: string;
  effectiveDate: string;
  expiresAt: string | null;
  jurisdiction: string;
  version: string;
  evidenceGrade: "high" | "moderate" | "low" | "ungraded";
  trustTier: "authoritative" | "reviewed" | "unverified";
  contentRights: "public-link-and-summary" | "licensed-institutional" | "retrieval-prohibited";
  provenanceHash: string;
  retrievedAt: string;
  passages: Array<{
    passageId: string;
    text: string;
    passageHash: string;
  }>;
};

export type EvidenceClaim = {
  claimId: string;
  statement: string;
  material: boolean;
  citedPassageIds: string[];
  supportStatus: "supported" | "conflicted" | "unsupported";
  confidence: number;
  uncertainty: string[];
};

export type SearchRequest = {
  requestId: string;
  tenantId: string;
  actorId: string;
  actorRole: string;
  purpose: string;
  workflowId: string;
  mode: "public-evidence" | "clinical-context";
  inputClassification: P32InputClassification;
  question: string;
  queryTerms: string[];
  approvedSourceTypes: EvidenceSource["sourceType"][];
  approvedJurisdictions: string[];
  maximumSources: number;
  maximumQueries: number;
  cachePolicy: "no-cache" | "approved-public-reference-only";
  requiredFreshnessDays: number;
  riskLevel: RiskLevel;
  correlationId: string;
  idempotencyKey: string;
};

export type SearchResult = {
  requestId: string;
  tenantId: string;
  status: "answered" | "requires-human-review" | "abstained" | "retrieval-failed";
  retrievalStatus: "completed" | "failed";
  rankedSourceIds: string[];
  claims: EvidenceClaim[];
  conflicts: Array<{
    topic: string;
    sourceIds: string[];
    summary: string;
  }>;
  missingEvidence: string[];
  freshnessWarnings: string[];
  route: ModelRouteDecision;
  metrics: {
    citationFaithfulness: number;
    sourceCoverage: number;
    safetyWeightedAccuracy: number;
    latencyMs: number;
    totalSystemCostUsd: number;
    humanReviewCostUsd: number;
    accepted: boolean;
    costPerAcceptedAnswerUsd: number | null;
  };
  policyDecision: PolicyDecision;
  humanReviewRequired: boolean;
  auditHash: string;
  boundary: typeof scrimedP32Boundary;
};

export type IncidentFailureClass =
  | "data-input"
  | "model"
  | "retrieval"
  | "integration"
  | "interface"
  | "configuration"
  | "policy"
  | "exceptional-case";

export type IncidentEvidenceBundle = {
  bundleVersion: typeof scrimedP32ContractVersion;
  incidentId: string;
  tenantId: string;
  accessScope: "restricted-incident-review";
  legalHoldStatus: "not-required" | "watch" | "recommended" | "active";
  model: {
    providerId: string;
    modelId: string;
    version: string;
    configurationHash: string;
  };
  promptTemplateVersion: string;
  retrievedEvidenceIds: string[];
  toolEvents: Array<{
    eventId: string;
    toolId: string;
    resultReference: string;
    status: "succeeded" | "failed" | "blocked";
    occurredAt: string;
  }>;
  inputProvenanceIds: string[];
  policyVersion: string;
  thresholdVersion: string;
  outputGeneratedHash: string;
  outputDisplayedHash: string | null;
  workflowStage: string;
  userEvents: Array<{
    eventId: string;
    actorIdHash: string;
    action: string;
    approvalStatus: "not-required" | "pending" | "approved" | "rejected";
    occurredAt: string;
  }>;
  serviceEvents: Array<{
    eventId: string;
    serviceId: string;
    status: string;
    latencyMs: number;
    occurredAt: string;
  }>;
  failureClasses: IncidentFailureClass[];
  contributingFactors: string[];
  liabilityDeterminationAllowed: false;
  counterfactuals: Array<{
    comparator: "corrected-input" | "prior-model" | "alternate-model" | "no-ai-workflow";
    evidenceReference: string;
    resultHash: string;
  }>;
  remediation: Array<{
    action: "rollback" | "threshold-change" | "data-correction" | "retraining-review" | "ux-change" | "disclosure-review" | "revalidation";
    status: "proposed" | "approved" | "completed" | "rejected";
    owner: string;
    evidenceReference: string;
  }>;
  correlationId: string;
  createdAt: string;
  previousBundleHash: string | null;
  bundleHash: string;
};

export type BenchmarkCard = {
  benchmarkId: string;
  owner: string;
  version: string;
  originPlatform: "general-purpose-chat" | "specialist-tool" | "local-institutional-workflow" | "reciprocal-mixed";
  sourcePopulation: string;
  specialties: string[];
  timeRange: { startsAt: string; endsAt: string };
  taskDistribution: Array<{ lane: string; caseCount: number }>;
  samplingMethod: string;
  inclusionCriteria: string[];
  exclusionCriteria: string[];
  deidentificationMethod: string;
  contaminationRisk: "low" | "moderate" | "high" | "unknown";
  modelAccess: Array<{ modelId: string; accessedAt: string; settingsHash: string }>;
  raters: {
    count: number;
    credentials: string[];
    specialties: string[];
    blinded: boolean;
    adjudication: string;
    interRaterReliability: number | null;
  };
  refusalHandling: string;
  missingDataHandling: string;
  confidenceIntervals: string;
  fundingAndConflicts: string[];
  externalValidityLimitations: string[];
  temporalHoldout: boolean;
  externalSiteValidation: boolean;
  universalWinnerClaimAllowed: false;
  promotionThresholds: {
    safety: number;
    correctness: number;
    citationQuality: number;
    abstention: number;
    maximumLatencyMs: number;
    maximumAcceptedAnswerCostUsd: number;
    humanAcceptance: number;
  };
  auditHash: string;
};

export type IntentEnvelope = {
  intentId: string;
  tenantId: string;
  statedGoal: string;
  actor: { actorId: string; role: string; authenticated: boolean };
  setting: "clinical" | "administrative" | "research" | "public-education";
  urgency: "routine" | "time-sensitive" | "urgent-human-escalation";
  explicitConstraints: string[];
  verifiedFacts: string[];
  proposedInferences: string[];
  missingCriticalInformation: string[];
  contradictions: string[];
  confidence: number;
  requestedAction: string;
  evidenceRequirements: string[];
  proposedWorkflow: string;
  requiredApproval: "none" | "operator" | "clinician" | "compliance";
  policyDecision: PolicyDecision;
  interpretedIntentConfirmationRequired: boolean;
  auditHash: string;
};

export type AttentionLevel = "BACKGROUND" | "INBOX" | "INTERRUPTIVE" | "HARD_STOP";

export type AttentionEvent = {
  eventId: string;
  tenantId: string;
  workflowId: string;
  level: AttentionLevel;
  actionableRecommendation: string;
  evidenceSourceIds: string[];
  severity: "low" | "moderate" | "high" | "critical";
  confidence: number;
  ownerRole: string;
  expiresAt: string;
  deduplicationKey: string;
  escalationPolicy: string;
  cooldownSeconds: number;
  suppressionAllowed: boolean;
  humanReviewRequired: boolean;
  auditHash: string;
};

export type ConnectorPolicy = {
  policyId: string;
  providerId: string;
  governingTermsUrl: string;
  governingTermsVersion: string;
  lastReviewedAt: string;
  officialApiRequired: boolean;
  agentUsePermission: "allowed-scoped" | "human-only" | "prohibited" | "review-required";
  permittedCapabilities: string[];
  readScopes: string[];
  writeScopes: string[];
  credentialMethod: "delegated-oauth" | "service-identity" | "none";
  dataRights: string[];
  rateLimitPerMinute: number;
  automationRestrictions: string[];
  humanApprovalRequiredForWrites: boolean;
  aiDisclosureRequired: boolean;
  trainingUseAllowed: false;
  termsChangeState: "current" | "material-change-review" | "expired-review";
  killSwitchActive: boolean;
  reviewedTermsHash: string;
};

export type TrialCandidateReview = {
  reviewId: string;
  tenantId: string;
  protocolId: string;
  protocolVersion: string;
  syntheticSubjectId: string;
  preliminaryEligibility: "possible" | "unlikely" | "insufficient-information";
  matchedCriteria: string[];
  unmatchedCriteria: string[];
  missingCriteria: string[];
  consentStatus: "not-requested" | "documented-synthetic";
  coordinatorConfirmation: "pending" | "confirmed-synthetic-review";
  randomizationSystem: "external-authorized-only";
  enrollmentAllowed: false;
  randomizationAllowed: false;
  investigationalInterventionProven: false;
  policyDecision: PolicyDecision;
  humanReviewRequired: true;
  auditHash: string;
};

export type ICPProfile = {
  profileId: string;
  sourceMaterialIds: string[];
  proposedSegments: string[];
  buyerRoles: string[];
  supportedUseCases: string[];
  geographies: string[];
  evidenceRequirements: string[];
  valuePropositions: string[];
  organizationalFitSignals: string[];
  prohibitedSignals: string[];
  approvalStatus: "draft" | "approved-for-manual-prospecting" | "rejected";
  automaticOutreachAllowed: false;
  sensitiveProfilingAllowed: false;
  optOutRequired: true;
  provenanceHash: string;
};

export type OutcomeEvent = {
  outcomeEventId: string;
  tenantId: string;
  workflowId: string;
  outcomeType: "clinical" | "operational" | "financial" | "patient" | "research";
  metricId: string;
  observedValue: number;
  unit: string;
  acceptedByHuman: boolean;
  inferenceCostUsd: number;
  retrievalCostUsd: number;
  infrastructureCostUsd: number;
  retryCostUsd: number;
  humanReviewCostUsd: number;
  latencyBurdenCostUsd: number;
  failureOverrideCostUsd: number;
  totalCostUsd: number;
  costPerAcceptedOutcomeUsd: number | null;
  observedAt: string;
  evidenceReference: string;
};

export type ApprovalEvidence = {
  approvalId: string;
  gateId: string;
  reviewerId: string;
  reviewerRole: string;
  identityAssurance: "aal2-protected-workspace" | "qualified-external-reference";
  tenantScopeHash: string;
  decision: "approved" | "rejected";
  sourceCommit: string;
  sourceTreeFingerprint: string;
  artifactFingerprint: string;
  validationEvidenceFingerprint: string;
  reviewPacketFingerprint: string | null;
  evidencePointer: string;
  approvedAt: string;
  expiresAt: string;
  releaseAuthorityGranted: false;
  decisionHash: string;
};

export type ReleaseGateResult = {
  gateId: string;
  description: string;
  ownerRole: string;
  classification: "AUTOMATED" | "EXTERNAL";
  phase: "candidate-review" | "pre-deployment" | "post-deployment" | "customer-go-live";
  requiredEvidence: string[];
  expectedFingerprints: {
    sourceCommit: string;
    sourceTree: string;
    artifact: string;
    validationEvidence: string;
    reviewPacket: string;
  };
  status: "PASS" | "FAIL" | "BLOCKED" | "OPERATOR_REQUIRED" | "NOT_APPLICABLE";
  reason: string;
  expiresAt: string | null;
  reviewerId: string | null;
  evaluatedAt: string;
  evidencePointer: string | null;
  operatorAction: null | {
    responsibleRole: string;
    exactAction: string;
    candidateFingerprints: {
      sourceCommit: string;
      sourceTree: string;
      artifact: string;
      validationEvidence: string;
    };
    commandOrForm: string;
    expiresAt: string;
    consequenceOfRejection: string;
    verificationProcedure: string;
  };
  releaseAuthorityGranted: false;
  auditHash: string;
};
