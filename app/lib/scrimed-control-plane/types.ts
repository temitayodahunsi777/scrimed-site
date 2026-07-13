export type WorkspaceDomain =
  | "clinical"
  | "patient-access"
  | "revenue-cycle"
  | "operations"
  | "research"
  | "executive"
  | "engineering"
  | "trust-governance"
  | "capital-intelligence";

export type RiskLevel = "low" | "moderate" | "high" | "prohibited";
export type AutonomyLevel = "observe" | "recommend" | "prepare" | "execute-with-approval" | "execute-preapproved";
export type WorkSessionStatus =
  | "draft"
  | "planning"
  | "active"
  | "awaiting-approval"
  | "verifying"
  | "paused"
  | "completed"
  | "failed"
  | "cancelled"
  | "rolled-back";
export type ProviderClass = "frontier" | "balanced" | "fast" | "specialist" | "local-private" | "deterministic";
export type DataClassification =
  | "public"
  | "internal"
  | "confidential"
  | "restricted"
  | "deidentified-clinical"
  | "phi-prohibited";
export type ToolRiskClass =
  | "read-only"
  | "reversible-write"
  | "consequential-write"
  | "external-communication"
  | "clinical"
  | "financial"
  | "identity"
  | "scheduling"
  | "data-export";
export type ArtifactType =
  | "clinical-summary"
  | "patient-education-draft"
  | "care-coordination-brief"
  | "prior-authorization-draft"
  | "appeal-letter-draft"
  | "research-brief"
  | "payer-analysis"
  | "executive-report"
  | "investor-memo"
  | "board-brief"
  | "financial-workbook-spec"
  | "presentation-spec"
  | "fhir-bundle-preview"
  | "workflow-runbook";

export type DefinitionOfDoneContract = {
  goal: string;
  allowedScope: string[];
  prohibitedActions: string[];
  requiredEvidence: string[];
  successCriteria: string[];
  stoppingConditions: string[];
  verificationChecks: string[];
  maximumSteps: number;
  maximumToolCalls: number;
  maximumEstimatedCostUsd: number;
  timeoutMs: number;
  humanApprovalRequired: boolean;
  rollbackPlan: string;
};

export type ControlPlaneAgentDefinition = {
  id: string;
  version: string;
  purpose: string;
  allowedDomains: WorkspaceDomain[];
  allowedSkills: string[];
  allowedTools: ToolRiskClass[];
  prohibitedTools: ToolRiskClass[];
  defaultModelClass: ProviderClass;
  riskCeiling: RiskLevel;
  requiresHumanReview: boolean;
  inputClassifications: DataClassification[];
  outputSchema: string;
  evaluationSuite: string;
  owner: string;
  maturityLevel: "lab" | "review-ready" | "protected-pilot";
  activationStatus: "enabled-read-only" | "enabled-prepare-only" | "disabled";
  auditHash: string;
};

export type SkillDefinition = {
  id: string;
  purpose: string;
  version: string;
  inputs: string[];
  outputs: string[];
  requiredPermissions: ToolRiskClass[];
  guardrails: string[];
  evaluationSuite: string;
  maturityLevel: "lab" | "review-ready" | "protected-pilot";
  enabled: boolean;
  nextAction: string;
};

export type WorkflowDefinition = {
  id: string;
  title: string;
  domain: WorkspaceDomain;
  trigger: string;
  definitionOfDone: DefinitionOfDoneContract;
  taskGraph: string[];
  participatingAgents: string[];
  requiredSkills: string[];
  contextRequirements: string[];
  approvalGates: string[];
  verificationChecks: string[];
  artifacts: ArtifactType[];
  rollbackPlan: string;
  telemetry: string[];
  externalActionsEnabled: false;
};

export type SemanticDefinition = {
  canonicalIdentifier: string;
  label: string;
  description: string;
  source: string;
  owner: string;
  version: string;
  effectiveDate: string;
  jurisdiction: string;
  calculationLogic: string | null;
  lineage: string[];
  accessPolicy: string;
  relatedFhirResources: string[];
};

export type ControlPlaneContextRecord = {
  id: string;
  tenantId: string;
  sourceType: string;
  sourceTitle: string;
  excerpt: string;
  citation: string;
  effectiveDate: string;
  expirationDate: string;
  trustTier: string;
  dataClassification: DataClassification;
  freshnessScore: number;
  lexicalScore: number;
  semanticScore: number;
  ontologyScore: number;
  graphScore: number;
  unifiedScore: number;
  sourceRisk: "low" | "moderate" | "high";
  promptInjectionFlags: string[];
  executableInstructionsAllowed: false;
  auditHash: string;
};

export type EffectiveCost = {
  apiCostUsd: number;
  infrastructureCostUsd: number;
  humanReviewCostUsd: number;
  retryCostUsd: number;
  fallbackCostUsd: number;
  expectedFailureCostUsd: number;
  totalEffectiveCostUsd: number;
  costPerVerifiedArtifactUsd: number | null;
};

export type TrustScore = {
  evidenceQuality: number;
  evidenceCoverage: number;
  sourceFreshness: number;
  policyCompliance: number;
  contextCompleteness: number;
  modelAgreement: number;
  citationCompleteness: number;
  hallucinationRisk: number;
  reversibility: number;
  humanReviewStatus: number;
  total: number;
};

export type ConsequenceBenchCase = {
  id: string;
  domain: string;
  task: string;
  expectedBoundary: string;
  rubric: string[];
  requiredEvidence: string[];
  humanReviewRequired: boolean;
  clinicalSeverity: number;
  financialExposure: number;
  privacyExposure: number;
  reversibility: number;
  affectedPopulationRisk: number;
  underrepresentationRisk: number;
  detectionDifficulty: number;
};

export type OutcomeMetric = {
  id: string;
  category: "clinical" | "financial" | "operational" | "patient";
  label: string;
  unit: string;
  direction: "increase" | "decrease" | "context-dependent";
  baseline: number | null;
  postImplementation: number | null;
  evidenceStatus: "not-collected" | "baseline-collected" | "review-required";
  syntheticOnly: true;
};
