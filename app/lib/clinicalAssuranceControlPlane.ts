import { createClinicalEvidenceHash } from "./clinicalEvidenceControls";

export const clinicalAssurancePolicyVersion = "scrimed-clinical-assurance-v1-2026-07-18";
export const clinicalAssuranceBoundary =
  "SCRIMED Clinical Assurance Control Plane authorizes synthetic and metadata-only model routes, enclave policy, capacity, concentration, provenance, and human handoff. It does not authorize live PHI, autonomous diagnosis, treatment, prescribing, final imaging interpretation, payer submission, EHR writeback, customer go-live, certification, military use, targeting, combat support, or mass surveillance.";

export type ClinicalAssuranceLevel =
  | "CAL_0_PUBLIC_ZERO_PHI"
  | "CAL_1_STANDARD_PHI"
  | "CAL_2_RESTRICTED_CLINICAL"
  | "CAL_3_SOVEREIGN_ISOLATED";

export type ClinicalAssuranceDataClassification =
  | "public"
  | "synthetic"
  | "irreversibly-deidentified"
  | "standard-phi"
  | "part-2"
  | "genomics"
  | "minors"
  | "restricted-research"
  | "contract-restricted";

export type WorkloadCriticality = "TIER_0_CONTROL_SAFETY" | "TIER_1_INTERACTIVE" | "TIER_2_BATCH";
export type AssuranceDecisionStatus = "allowed" | "queued" | "human-handoff" | "blocked";
export type RegistryStatus = "active" | "suspended" | "revoked" | "expired" | "draft";

export type SovereignClinicalEnclave = {
  enclaveId: string;
  tenantIds: string[];
  assuranceLevel: ClinicalAssuranceLevel;
  authorizedDataClassifications: ClinicalAssuranceDataClassification[];
  jurisdiction: string;
  approvedRegions: string[];
  allowedModels: Array<{ modelId: string; version: string; digest: string }>;
  allowedTools: string[];
  allowedWorkflows: string[];
  keyManagementReference: string;
  ingressPolicy: {
    allowedSourceClasses: string[];
    authenticatedIdentityRequired: true;
    minimumNecessaryRequired: true;
  };
  egressPolicy: {
    mode: "public-synthetic-only" | "approved-destinations-only" | "default-deny";
    approvedDestinations: string[];
    internetReachable: boolean;
    crossEnclaveReuseAllowed: false;
  };
  scopes: {
    cache: string;
    vectorIndex: string;
    telemetry: string;
    logs: string;
    retention: string;
  };
  planes: {
    policyControl: string;
    clinicalData: string;
    modelArtifacts: string;
    evidenceAudit: string;
  };
  operatorAccessPolicy: {
    mode: "standard-least-privilege" | "restricted-named-operators" | "isolated-break-glass-only";
    shortLivedCredentialsRequired: true;
    breakGlassReviewRequired: true;
  };
  reservedCapacityPolicy: {
    required: boolean;
    capacityPassportIds: string[];
  };
  primaryRouteId: string;
  independentFallbackRouteId: string;
  slo: { availabilityPercent: number; p95LatencyMs: number };
  rtoMinutes: number;
  rpoMinutes: number;
  status: RegistryStatus;
  effectiveAt: string;
  expiresAt: string;
  owner: string;
  approvalEvidenceIds: string[];
  auditHash: string;
};

export type ModelPassport = {
  modelId: string;
  version: string;
  immutableDigest: string;
  providerId: string;
  hostingOperator: string;
  controllingCorporateFamily: string;
  cloud: string;
  region: string;
  jurisdiction: string;
  acceleratorPool: string;
  servingPool: string;
  identityProvider: string;
  network: string;
  license: string;
  weightAvailability: "closed" | "open-weight" | "deterministic-no-model";
  baaDpaStatus: "not-required-cal0" | "approved" | "missing" | "expired";
  phiAuthorization: "not-authorized" | "authorized-private-only";
  dataPolicy: {
    providerTrainingAllowed: false;
    retentionDays: number;
    residency: string[];
    secondaryUseAllowed: false;
  };
  authorizedAssuranceLevels: ClinicalAssuranceLevel[];
  authorizedTenants: string[];
  authorizedWorkflows: string[];
  authorizedTools: string[];
  validatedDomainCells: string[];
  evaluationSuiteVersion: string;
  approvalEvidenceIds: string[];
  artifactSignature: {
    status: "verified" | "missing" | "invalid";
    signatureDigest: string;
    signerIdentity: string;
  };
  sbomDigest: string;
  mlBomDigest: string;
  dependencyScanStatus: "passed" | "failed" | "not-run";
  malwareScanStatus: "passed" | "failed" | "not-run";
  authorization: {
    status: RegistryStatus;
    startsAt: string;
    expiresAt: string;
    suspendedAt: string | null;
    revokedAt: string | null;
  };
  routeRole: "primary" | "fallback" | "challenger";
  globalKillSwitch: { active: boolean; reason: string | null; changedAt: string | null };
  workflowKillSwitches: Array<{ workflowId: string; active: boolean; reason: string; changedAt: string }>;
  exportPortabilityPath: string;
  changeEvents: string[];
};

export type ToolArtifactPassport = {
  toolId: string;
  version: string;
  immutableDigest: string;
  authorizedAssuranceLevels: ClinicalAssuranceLevel[];
  authorizedTenants: string[];
  authorizedWorkflows: string[];
  artifactSignature: {
    status: "verified" | "missing" | "invalid";
    signatureDigest: string;
    signerIdentity: string;
  };
  sbomDigest: string;
  dependencyScanStatus: "passed" | "failed" | "not-run";
  malwareScanStatus: "passed" | "failed" | "not-run";
  authorization: {
    status: RegistryStatus;
    startsAt: string;
    expiresAt: string;
  };
  killSwitch: { active: boolean; reason: string | null; changedAt: string | null };
};

export type ApprovedModelRegistry = {
  registryVersion: string;
  defaultDeny: true;
  exactVersionRequired: true;
  silentSubstitutionAllowed: false;
  passports: ModelPassport[];
};

export type CriticalDependencyMap = {
  mapVersion: string;
  materialIndependenceRequired: true;
  edges: CriticalDependencyEdge[];
};

export type CapacityPassport = {
  capacityPassportId: string;
  routeId: string;
  modelId: string;
  providerId: string;
  contractedThroughputRps: number;
  minimumThroughputRps: number;
  burstThroughputRps: number;
  reservedThroughputRps: number;
  observedAvailableThroughputRps: number;
  admittedThroughputRps: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  queueAgeMs: number;
  uptimePercent: number;
  errorRate: number;
  renewalAt: string;
  expiresAt: string;
  incidentCount90Days: number;
  region: string;
  jurisdiction: string;
  fallbackRouteId: string;
  portabilityStatus: "ready" | "testing" | "blocked";
  baaDpaStatus: ModelPassport["baaDpaStatus"];
  securityApproval: "approved-synthetic" | "approved-private" | "missing";
  auditHash: string;
};

export type DependencyDimension =
  | "provider"
  | "controlling-corporate-family"
  | "cloud"
  | "region"
  | "accelerator-serving-pool"
  | "network"
  | "storage"
  | "search-vector"
  | "identity-provider"
  | "speech-service"
  | "observability"
  | "fhir-ehr-endpoint"
  | "material-subcontractor"
  | "model-family";

export type CriticalDependencyEdge = {
  edgeId: string;
  routeId: string;
  dimension: DependencyDimension;
  dependencyId: string;
  material: boolean;
  region: string;
  jurisdiction: string;
  fallbackTarget: string | null;
  portabilityStatus: "ready" | "testing" | "blocked";
  baaDpaStatus: ModelPassport["baaDpaStatus"];
  securityApproval: "approved-synthetic" | "approved-private" | "missing";
};

export type ConcentrationException = {
  exceptionId: string;
  dimension: DependencyDimension;
  dependencyId: string;
  owner: string;
  justification: string;
  compensatingControl: string;
  alternateRouteId: string;
  expiresAt: string;
  approvalEvidenceId: string;
  exitMilestone: string;
};

export type ConcentrationBudget = {
  budgetId: string;
  dimension: DependencyDimension;
  dependencyId: string;
  ceilingBasisPoints: number;
  currentExposureBasisPoints: number;
  owner: string;
  exceptions: ConcentrationException[];
};

export type ValidatedDomainCell = {
  cellId: string;
  modelId: string;
  workflowId: string;
  status: "pass" | "restricted" | "blocked";
  mandatory: boolean;
  safetyCritical: boolean;
  qualityScore: number;
  minimumQualityScore: number;
  safetyEventRate: number;
  maximumSafetyEventRate: number;
  sampleSize: number;
  minimumSampleSize: number;
  acceptedOutcomeRate: number;
  evaluationEvidenceId: string;
};

export type SupplierEventType =
  | "change-of-control"
  | "material-policy-change"
  | "license-change"
  | "sanctions-export-restriction"
  | "government-regulatory-conflict"
  | "provider-model-withdrawal"
  | "price-shock"
  | "capacity-degradation"
  | "security-compromise";

export type SupplierEvent = {
  eventId: string;
  supplierId: string;
  type: SupplierEventType;
  severity: "low" | "moderate" | "high" | "critical";
  effectiveAt: string;
  evidenceReference: string;
};

export type ClinicalAssuranceRegistry = {
  enclaves: SovereignClinicalEnclave[];
  modelPassports: ModelPassport[];
  toolPassports: ToolArtifactPassport[];
  capacityPassports: CapacityPassport[];
  dependencyEdges: CriticalDependencyEdge[];
  concentrationBudgets: ConcentrationBudget[];
  validatedDomainCells: ValidatedDomainCell[];
};

export type ClinicalAssurancePreflightRequest = {
  tenantId: string;
  enclaveId: string;
  workflowId: string;
  caseInputFingerprint: string;
  requestedDataClassifications: ClinicalAssuranceDataClassification[];
  requestedAssuranceLevel?: ClinicalAssuranceLevel;
  sovereignIsolationRequired: boolean;
  jurisdiction: string;
  region: string;
  workloadTier: WorkloadCriticality;
  requestedModel: { modelId: string; version: string; digest: string };
  fallbackModel: { modelId: string; version: string; digest: string };
  requiredTools: string[];
  requestedToolArtifacts: Array<{ toolId: string; version: string; digest: string }>;
  domainCellId: string;
  requiredThroughputRps: number;
  maximumQueueAgeMs: number;
  requestExposureBasisPoints: number;
  identity: { userIdentityHash: string; serviceIdentityHash: string; agentIdentityHash: string };
  versions: { prompt: string; policy: string; tools: string[]; retrieval: string; dataset: string };
  retryCount: number;
  simulationOnly: true;
  enforcementEnabled: boolean;
  at: string;
};

export type ClinicalAssuranceCheck = {
  id: string;
  passed: boolean;
  mandatory: boolean;
  detail: string;
};

export type ClinicalAssuranceDecision = {
  policyDecisionId: string;
  status: AssuranceDecisionStatus;
  resolvedAssuranceLevel: ClinicalAssuranceLevel;
  enclaveId: string | null;
  modelPassportDigest: string | null;
  fallbackPassportDigest: string | null;
  primaryRouteId: string | null;
  fallbackRouteId: string | null;
  fallbackMateriallyIndependent: boolean;
  modelInvocationAuthorized: boolean;
  externalProviderCallAllowed: false;
  clinicalActionAuthority: false;
  payerSubmissionAllowed: false;
  ehrWritebackAllowed: false;
  humanReviewRequired: true;
  degradationAction: "none" | "queue" | "shed-tier-2" | "human-handoff" | "block";
  checks: ClinicalAssuranceCheck[];
  blockers: string[];
  warnings: string[];
  acceptedOutcomeCost: {
    inferenceUsd: number;
    hostingUsd: number;
    cacheUsd: number;
    retrievalUsd: number;
    validationUsd: number;
    reviewerUsd: number;
    retriesUsd: number;
    latencyBurdenUsd: number;
    failureOverrideBurdenUsd: number;
    totalUsd: number;
    acceptedOutcomeRate: number;
    costPerAcceptedOutcomeUsd: number | null;
  };
  caseEvidenceBinding: {
    assuranceLevel: ClinicalAssuranceLevel;
    enclaveId: string | null;
    policyDecisionId: string;
    modelPassportDigest: string | null;
    fallbackPassportDigest: string | null;
    toolArtifactDigests: string[];
    capacityDecisionId: string;
    concentrationDecisionId: string;
    routingDecisionId: string;
    subgroupEvaluationIds: string[];
    queueTimeMs: number;
    retryCount: number;
    finalDisposition: "authorized-synthetic-route" | "queued" | "human-handoff" | "blocked";
  };
  auditEvent: {
    eventType: "clinical-assurance-preflight";
    traceId: string;
    correlationId: string;
    occurredAt: string;
    previousAuditHash: null;
    auditHash: string;
    containsPhi: false;
  };
  boundary: typeof clinicalAssuranceBoundary;
};

export type ModelPromotionEvidence = {
  modelId: string;
  artifactSigned: boolean;
  dependencyScanPassed: boolean;
  malwareScanPassed: boolean;
  sbomPresent: boolean;
  mlBomPresent: boolean;
  mandatoryCells: ValidatedDomainCell[];
  citationGroundingPassed: boolean;
  calibrationPassed: boolean;
  toolReliabilityPassed: boolean;
  outputBudgetPassed: boolean;
  privacyPolicyPassed: boolean;
  reviewerBurdenPassed: boolean;
  canaryConfigured: boolean;
  observabilityConfigured: boolean;
  rollbackTested: boolean;
  humanApprovalEvidenceId: string | null;
};

const levelRank: Record<ClinicalAssuranceLevel, number> = {
  CAL_0_PUBLIC_ZERO_PHI: 0,
  CAL_1_STANDARD_PHI: 1,
  CAL_2_RESTRICTED_CLINICAL: 2,
  CAL_3_SOVEREIGN_ISOLATED: 3
};

const restrictedClasses: ClinicalAssuranceDataClassification[] = [
  "part-2",
  "genomics",
  "minors",
  "restricted-research",
  "contract-restricted"
];

const safeReferencePattern = /^[a-zA-Z0-9][a-zA-Z0-9._:/-]{2,180}$/;
const digestPattern = /^[a-f0-9]{64}$/;
const concentrationBudgetDimensions: DependencyDimension[] = [
  "provider",
  "controlling-corporate-family",
  "cloud",
  "region",
  "accelerator-serving-pool",
  "network",
  "identity-provider",
  "model-family",
  "material-subcontractor"
];
const materialIndependenceDimensions: DependencyDimension[] = [
  "provider",
  "controlling-corporate-family",
  "cloud",
  "region",
  "accelerator-serving-pool",
  "network",
  "storage",
  "search-vector",
  "identity-provider",
  "speech-service",
  "observability",
  "fhir-ehr-endpoint",
  "material-subcontractor",
  "model-family"
];

function hash(value: unknown) {
  return createClinicalEvidenceHash({ value, policy: clinicalAssurancePolicyVersion });
}

function isActiveAt(startsAt: string, expiresAt: string, at: string) {
  const current = Date.parse(at);
  return Number.isFinite(current) && current >= Date.parse(startsAt) && current < Date.parse(expiresAt);
}

function allSafeReferences(values: string[]) {
  return values.length > 0 && values.every((value) => safeReferencePattern.test(value));
}

export function resolveClinicalAssuranceLevel(input: {
  dataClassifications: ClinicalAssuranceDataClassification[];
  sovereignIsolationRequired: boolean;
}): ClinicalAssuranceLevel {
  if (input.sovereignIsolationRequired) return "CAL_3_SOVEREIGN_ISOLATED";
  if (input.dataClassifications.some((classification) => restrictedClasses.includes(classification))) {
    return "CAL_2_RESTRICTED_CLINICAL";
  }
  if (input.dataClassifications.includes("standard-phi")) return "CAL_1_STANDARD_PHI";
  return "CAL_0_PUBLIC_ZERO_PHI";
}

export function validateMateriallyIndependentFallback(input: {
  primaryRouteId: string;
  fallbackRouteId: string;
  dependencyEdges: CriticalDependencyEdge[];
}) {
  const primary = input.dependencyEdges.filter((edge) => edge.routeId === input.primaryRouteId && edge.material);
  const fallback = input.dependencyEdges.filter((edge) => edge.routeId === input.fallbackRouteId && edge.material);
  const sharedDependencies = primary.flatMap((primaryEdge) =>
    fallback
      .filter(
        (fallbackEdge) =>
          materialIndependenceDimensions.includes(primaryEdge.dimension) &&
          fallbackEdge.dimension === primaryEdge.dimension &&
          fallbackEdge.dependencyId === primaryEdge.dependencyId
      )
      .map((fallbackEdge) => `${fallbackEdge.dimension}:${fallbackEdge.dependencyId}`)
  );

  return {
    independent: primary.length > 0 && fallback.length > 0 && sharedDependencies.length === 0,
    sharedDependencies: Array.from(new Set(sharedDependencies))
  };
}

export function evaluateConcentrationAdmission(input: {
  routeId: string;
  requestExposureBasisPoints: number;
  dependencyEdges: CriticalDependencyEdge[];
  budgets: ConcentrationBudget[];
  at: string;
}) {
  const decisions = input.dependencyEdges
    .filter(
      (edge) =>
        edge.routeId === input.routeId && edge.material && concentrationBudgetDimensions.includes(edge.dimension)
    )
    .map((edge) => {
      const budget = input.budgets.find(
        (candidate) => candidate.dimension === edge.dimension && candidate.dependencyId === edge.dependencyId
      );
      if (!budget) {
        return {
          budgetId: null,
          dimension: edge.dimension,
          dependencyId: edge.dependencyId,
          projectedBasisPoints: null,
          ceilingBasisPoints: null,
          allowed: false,
          exceptionId: null,
          exceptionExpiresAt: null,
          reason: "missing-concentration-budget"
        };
      }
          const budgetValuesValid =
            Number.isFinite(budget.ceilingBasisPoints) &&
            Number.isFinite(budget.currentExposureBasisPoints) &&
            budget.ceilingBasisPoints >= 0 &&
            budget.ceilingBasisPoints <= 10_000 &&
            budget.currentExposureBasisPoints >= 0 &&
            budget.currentExposureBasisPoints <= 10_000 &&
            Number.isFinite(input.requestExposureBasisPoints) &&
            input.requestExposureBasisPoints >= 0;
          const projected = budget.currentExposureBasisPoints + input.requestExposureBasisPoints;
          const exception = budget.exceptions.find(
            (candidate) =>
              candidate.dimension === budget.dimension &&
              candidate.dependencyId === budget.dependencyId &&
              candidate.alternateRouteId !== input.routeId &&
              validateMateriallyIndependentFallback({
                primaryRouteId: input.routeId,
                fallbackRouteId: candidate.alternateRouteId,
                dependencyEdges: input.dependencyEdges
              }).independent &&
              Date.parse(candidate.expiresAt) > Date.parse(input.at) &&
              allSafeReferences([
                candidate.owner,
                candidate.justification,
                candidate.compensatingControl,
                candidate.alternateRouteId,
                candidate.approvalEvidenceId,
                candidate.exitMilestone
              ])
          );
          return {
            budgetId: budget.budgetId,
            dimension: budget.dimension,
            dependencyId: budget.dependencyId,
            projectedBasisPoints: projected,
            ceilingBasisPoints: budget.ceilingBasisPoints,
            allowed: budgetValuesValid && (projected <= budget.ceilingBasisPoints || Boolean(exception)),
            exceptionId: exception?.exceptionId ?? null,
            exceptionExpiresAt: exception?.expiresAt ?? null,
            reason: !budgetValuesValid
              ? "invalid-concentration-budget"
              : projected <= budget.ceilingBasisPoints
                ? "within-budget"
                : exception
                  ? "approved-exception"
                  : "ceiling-exceeded"
          };
    });

  return {
    decisionId: `concentration_${hash({ input, decisions }).slice(0, 20)}`,
    allowed: decisions.length > 0 && decisions.every((decision) => decision.allowed),
    decisions
  };
}

export function evaluateCapacityAdmission(input: {
  workloadTier: WorkloadCriticality;
  requiredThroughputRps: number;
  maximumQueueAgeMs: number;
  capacity: CapacityPassport | undefined;
  at: string;
}) {
  const capacity = input.capacity;
  const active = Boolean(capacity && Date.parse(capacity.expiresAt) > Date.parse(input.at));
  const headroom = capacity ? capacity.observedAvailableThroughputRps - capacity.admittedThroughputRps : 0;
  const enoughObserved = active && headroom >= input.requiredThroughputRps;
  const enoughReserved = Boolean(capacity && capacity.reservedThroughputRps >= input.requiredThroughputRps);
  const queueWithinBound = Boolean(capacity && capacity.queueAgeMs <= input.maximumQueueAgeMs);
  const admitted =
    enoughObserved && queueWithinBound &&
    (input.workloadTier !== "TIER_0_CONTROL_SAFETY" || enoughReserved);
  const action = admitted
    ? "admit"
    : input.workloadTier === "TIER_2_BATCH"
      ? "shed-tier-2"
      : input.workloadTier === "TIER_1_INTERACTIVE" && active
        ? "queue"
        : "human-handoff";

  return {
    decisionId: `capacity_${hash({ input, capacity: capacity?.capacityPassportId ?? "missing" }).slice(0, 20)}`,
    admitted,
    action,
    headroomRps: Math.max(0, headroom),
    queueAgeMs: capacity?.queueAgeMs ?? 0,
    safetyChecksRetained: true,
    evidenceRequired: true
  } as const;
}

export function evaluateModelPromotion(evidence: ModelPromotionEvidence) {
  const failingCells = evidence.mandatoryCells.filter(
    (cell) =>
      cell.status !== "pass" ||
      cell.sampleSize < cell.minimumSampleSize ||
      cell.qualityScore < cell.minimumQualityScore ||
      cell.safetyEventRate > cell.maximumSafetyEventRate
  );
  const controls = [
    evidence.artifactSigned,
    evidence.dependencyScanPassed,
    evidence.malwareScanPassed,
    evidence.sbomPresent,
    evidence.mlBomPresent,
    evidence.citationGroundingPassed,
    evidence.calibrationPassed,
    evidence.toolReliabilityPassed,
    evidence.outputBudgetPassed,
    evidence.privacyPolicyPassed,
    evidence.reviewerBurdenPassed,
    evidence.canaryConfigured,
    evidence.observabilityConfigured,
    evidence.rollbackTested,
    Boolean(evidence.humanApprovalEvidenceId)
  ];
  const approved = controls.every(Boolean) && failingCells.length === 0 && evidence.mandatoryCells.length > 0;

  return {
    status: approved ? "approved-for-controlled-canary" : "blocked",
    approved,
    failingCellIds: failingCells.map((cell) => cell.cellId),
    aggregateOverrideAllowed: false,
    productionClinicalAuthorityGranted: false,
    auditHash: hash({ evidence, approved, failingCells: failingCells.map((cell) => cell.cellId) })
  } as const;
}

function modelPassportChecks(input: {
  request: ClinicalAssurancePreflightRequest;
  level: ClinicalAssuranceLevel;
  passport: ModelPassport | undefined;
}) {
  const { request, level, passport } = input;
  const phiRequested = request.requestedDataClassifications.some(
    (classification) => classification === "standard-phi" || restrictedClasses.includes(classification)
  );
  const workflowKillSwitch = passport?.workflowKillSwitches.find(
    (entry) => entry.workflowId === request.workflowId && entry.active
  );

  return [
    {
      id: "model-passport-exact-version",
      passed: Boolean(
        passport &&
          passport.routeRole === "primary" &&
          digestPattern.test(passport.immutableDigest) &&
          passport.modelId === request.requestedModel.modelId &&
          passport.version === request.requestedModel.version &&
          passport.immutableDigest === request.requestedModel.digest
      ),
      mandatory: true,
      detail: "The exact requested model, version, and immutable digest must match an approved passport."
    },
    {
      id: "model-authorization-active",
      passed: Boolean(
        passport &&
          passport.authorization.status === "active" &&
          !passport.authorization.suspendedAt &&
          !passport.authorization.revokedAt &&
          isActiveAt(passport.authorization.startsAt, passport.authorization.expiresAt, request.at)
      ),
      mandatory: true,
      detail: "Expired, suspended, revoked, or not-yet-active models cannot receive new traffic."
    },
    {
      id: "signed-scanned-artifact",
      passed: Boolean(
        passport &&
          passport.artifactSignature.status === "verified" &&
          digestPattern.test(passport.artifactSignature.signatureDigest) &&
          digestPattern.test(passport.sbomDigest) &&
          digestPattern.test(passport.mlBomDigest) &&
          passport.dependencyScanStatus === "passed" &&
          passport.malwareScanStatus === "passed"
      ),
      mandatory: true,
      detail: "Model promotion requires a verified signature, SBOM, ML-BOM, dependency scan, and malware scan."
    },
    {
      id: "model-scope-authorized",
      passed: Boolean(
        passport &&
          passport.authorizedAssuranceLevels.includes(level) &&
          passport.authorizedTenants.includes(request.tenantId) &&
          passport.authorizedWorkflows.includes(request.workflowId) &&
          passport.validatedDomainCells.includes(request.domainCellId) &&
          request.requiredTools.every((tool) => passport.authorizedTools.includes(tool))
      ),
      mandatory: true,
      detail: "Tenant, workflow, CAL, and every tool must be explicitly authorized."
    },
    {
      id: "model-region-contract-policy",
      passed: Boolean(
        passport &&
          passport.region === request.region &&
          passport.jurisdiction === request.jurisdiction &&
          passport.dataPolicy.residency.includes(request.jurisdiction) &&
          passport.dataPolicy.retentionDays >= 0 &&
          !passport.dataPolicy.providerTrainingAllowed &&
          !passport.dataPolicy.secondaryUseAllowed &&
          (!phiRequested ||
            (passport.phiAuthorization === "authorized-private-only" && passport.baaDpaStatus === "approved"))
      ),
      mandatory: true,
      detail: "PHI requires approved private processing and BAA/DPA state; region and jurisdiction cannot silently change."
    },
    {
      id: "model-kill-switch-clear",
      passed: Boolean(passport && !passport.globalKillSwitch.active && !workflowKillSwitch),
      mandatory: true,
      detail: "Global and workflow-scoped kill switches fail closed for new model traffic."
    }
  ] satisfies ClinicalAssuranceCheck[];
}

function enclaveChecks(input: {
  request: ClinicalAssurancePreflightRequest;
  level: ClinicalAssuranceLevel;
  enclave: SovereignClinicalEnclave | undefined;
}) {
  const { request, level, enclave } = input;
  const restrictedLevel = level === "CAL_2_RESTRICTED_CLINICAL" || level === "CAL_3_SOVEREIGN_ISOLATED";
  return [
    {
      id: "enclave-active-exact-level",
      passed: Boolean(
        enclave &&
          enclave.status === "active" &&
          enclave.assuranceLevel === level &&
          isActiveAt(enclave.effectiveAt, enclave.expiresAt, request.at)
      ),
      mandatory: true,
      detail: "The enclave must be active and match the resolved assurance level exactly."
    },
    {
      id: "enclave-tenant-region-data-scope",
      passed: Boolean(
        enclave &&
          enclave.tenantIds.includes(request.tenantId) &&
          enclave.jurisdiction === request.jurisdiction &&
          enclave.approvedRegions.includes(request.region) &&
          request.requestedDataClassifications.every((classification) =>
            enclave.authorizedDataClassifications.includes(classification)
          )
      ),
      mandatory: true,
      detail: "Tenant, jurisdiction, region, and every data class must be enclave-authorized."
    },
    {
      id: "enclave-model-tool-workflow-scope",
      passed: Boolean(
        enclave &&
          enclave.allowedWorkflows.includes(request.workflowId) &&
          request.requiredTools.every((tool) => enclave.allowedTools.includes(tool)) &&
          enclave.allowedModels.some(
            (model) =>
              model.modelId === request.requestedModel.modelId &&
              model.version === request.requestedModel.version &&
              model.digest === request.requestedModel.digest
          )
      ),
      mandatory: true,
      detail: "The enclave must explicitly allow the workflow, tools, and immutable model artifact."
    },
    {
      id: "restricted-egress-and-plane-isolation",
      passed: Boolean(
        enclave &&
          (!restrictedLevel ||
            (enclave.egressPolicy.mode === "default-deny" &&
              !enclave.egressPolicy.internetReachable &&
              !enclave.egressPolicy.crossEnclaveReuseAllowed &&
              new Set(Object.values(enclave.scopes)).size === Object.values(enclave.scopes).length &&
              new Set(Object.values(enclave.planes)).size === Object.values(enclave.planes).length))
      ),
      mandatory: true,
      detail: "CAL-2/3 require default-deny egress and separate cache, index, telemetry, log, retention, and plane scopes."
    },
    {
      id: "sovereign-recovery-and-capacity",
      passed: Boolean(
        enclave &&
          (level !== "CAL_3_SOVEREIGN_ISOLATED" ||
            (enclave.reservedCapacityPolicy.required &&
              enclave.reservedCapacityPolicy.capacityPassportIds.length > 0 &&
              enclave.rtoMinutes > 0 &&
              enclave.rpoMinutes >= 0 &&
              enclave.operatorAccessPolicy.mode === "isolated-break-glass-only"))
      ),
      mandatory: true,
      detail: "CAL-3 requires reserved capacity, isolated operator access, and explicit RTO/RPO."
    }
  ] satisfies ClinicalAssuranceCheck[];
}

export function authorizeClinicalAssuranceInvocation(
  request: ClinicalAssurancePreflightRequest,
  registry: ClinicalAssuranceRegistry
): ClinicalAssuranceDecision {
  const classifiedLevel = resolveClinicalAssuranceLevel({
    dataClassifications: request.requestedDataClassifications,
    sovereignIsolationRequired: request.sovereignIsolationRequired
  });
  const resolvedAssuranceLevel =
    request.requestedAssuranceLevel && levelRank[request.requestedAssuranceLevel] > levelRank[classifiedLevel]
      ? request.requestedAssuranceLevel
      : classifiedLevel;
  const enclave = registry.enclaves.find((candidate) => candidate.enclaveId === request.enclaveId);
  const passport = registry.modelPassports.find(
    (candidate) =>
      candidate.modelId === request.requestedModel.modelId && candidate.version === request.requestedModel.version
  );
  const fallbackPassport = registry.modelPassports.find(
    (candidate) =>
      candidate.modelId === request.fallbackModel.modelId && candidate.version === request.fallbackModel.version
  );
  const primaryRouteId = passport ? `${passport.providerId}:${passport.modelId}:${passport.version}` : null;
  const fallbackRouteId = fallbackPassport
    ? `${fallbackPassport.providerId}:${fallbackPassport.modelId}:${fallbackPassport.version}`
    : null;
  const assuranceNotDowngraded =
    !request.requestedAssuranceLevel || levelRank[request.requestedAssuranceLevel] >= levelRank[classifiedLevel];
  const safeRequest =
    allSafeReferences([
      request.tenantId,
      request.enclaveId,
      request.workflowId,
      request.domainCellId,
      request.region,
      request.requestedModel.modelId,
      request.requestedModel.version,
      request.fallbackModel.modelId,
      request.fallbackModel.version,
      request.versions.prompt,
      request.versions.policy,
      request.versions.retrieval,
      request.versions.dataset,
      ...request.versions.tools,
      ...request.requestedToolArtifacts.flatMap((tool) => [tool.toolId, tool.version])
    ]) &&
    /^[A-Z]{2,3}$/.test(request.jurisdiction) &&
    Number.isFinite(Date.parse(request.at)) &&
    digestPattern.test(request.caseInputFingerprint) &&
    digestPattern.test(request.requestedModel.digest) &&
    digestPattern.test(request.fallbackModel.digest) &&
    Object.values(request.identity).every((identityHash) => digestPattern.test(identityHash)) &&
    request.requestedToolArtifacts.every((tool) => digestPattern.test(tool.digest)) &&
    new Set(request.requestedToolArtifacts.map((tool) => tool.toolId)).size === request.requestedToolArtifacts.length &&
    request.requiredTools.length === request.requestedToolArtifacts.length &&
    request.requiredTools.every((toolId) => request.requestedToolArtifacts.some((tool) => tool.toolId === toolId)) &&
    request.requestedDataClassifications.length > 0 &&
    Number.isFinite(request.requiredThroughputRps) &&
    request.requiredThroughputRps >= 0 &&
    Number.isFinite(request.maximumQueueAgeMs) &&
    request.maximumQueueAgeMs >= 0 &&
    Number.isFinite(request.requestExposureBasisPoints) &&
    request.requestExposureBasisPoints >= 0 &&
    request.retryCount >= 0 &&
    request.retryCount <= 3;
  const cell = registry.validatedDomainCells.find(
    (candidate) =>
      candidate.cellId === request.domainCellId &&
      candidate.modelId === request.requestedModel.modelId &&
      candidate.workflowId === request.workflowId
  );
  const fallbackCell = registry.validatedDomainCells.find(
    (candidate) =>
      candidate.cellId === request.domainCellId &&
      candidate.modelId === request.fallbackModel.modelId &&
      candidate.workflowId === request.workflowId
  );
  const cellPassed = Boolean(
    cell &&
      cell.status === "pass" &&
      cell.sampleSize >= cell.minimumSampleSize &&
      cell.qualityScore >= cell.minimumQualityScore &&
      cell.safetyEventRate <= cell.maximumSafetyEventRate
  );
  const fallbackCellPassed = Boolean(
    fallbackCell &&
      fallbackCell.status === "pass" &&
      fallbackCell.sampleSize >= fallbackCell.minimumSampleSize &&
      fallbackCell.qualityScore >= fallbackCell.minimumQualityScore &&
      fallbackCell.safetyEventRate <= fallbackCell.maximumSafetyEventRate
  );
  const primaryCapacity = registry.capacityPassports.find(
    (candidate) => candidate.routeId === primaryRouteId
  );
  const capacity = evaluateCapacityAdmission({
    workloadTier: request.workloadTier,
    requiredThroughputRps: request.requiredThroughputRps,
    maximumQueueAgeMs: request.maximumQueueAgeMs,
    capacity: primaryCapacity,
    at: request.at
  });
  const concentration = primaryRouteId
    ? evaluateConcentrationAdmission({
        routeId: primaryRouteId,
        requestExposureBasisPoints: request.requestExposureBasisPoints,
        dependencyEdges: registry.dependencyEdges,
        budgets: registry.concentrationBudgets,
        at: request.at
      })
    : { decisionId: `concentration_${hash({ request: request.caseInputFingerprint, missing: true }).slice(0, 20)}`, allowed: false, decisions: [] };
  const independence =
    primaryRouteId && fallbackRouteId
      ? validateMateriallyIndependentFallback({
          primaryRouteId,
          fallbackRouteId,
          dependencyEdges: registry.dependencyEdges
        })
      : { independent: false, sharedDependencies: [] };
  const fallbackPassportValid = Boolean(
    fallbackPassport &&
      fallbackPassport.routeRole === "fallback" &&
      fallbackPassport.authorization.status === "active" &&
      !fallbackPassport.authorization.suspendedAt &&
      !fallbackPassport.authorization.revokedAt &&
      isActiveAt(fallbackPassport.authorization.startsAt, fallbackPassport.authorization.expiresAt, request.at) &&
      fallbackPassport.artifactSignature.status === "verified" &&
      digestPattern.test(fallbackPassport.artifactSignature.signatureDigest) &&
      digestPattern.test(fallbackPassport.sbomDigest) &&
      digestPattern.test(fallbackPassport.mlBomDigest) &&
      fallbackPassport.dependencyScanStatus === "passed" &&
      fallbackPassport.malwareScanStatus === "passed" &&
      fallbackPassport.authorizedAssuranceLevels.includes(resolvedAssuranceLevel) &&
      fallbackPassport.authorizedTenants.includes(request.tenantId) &&
      fallbackPassport.authorizedWorkflows.includes(request.workflowId) &&
      fallbackPassport.validatedDomainCells.includes(request.domainCellId) &&
      request.requiredTools.every((tool) => fallbackPassport.authorizedTools.includes(tool)) &&
      fallbackPassport.region === request.region &&
      fallbackPassport.jurisdiction === request.jurisdiction &&
      fallbackPassport.dataPolicy.residency.includes(request.jurisdiction) &&
      fallbackPassport.dataPolicy.retentionDays >= 0 &&
      !fallbackPassport.dataPolicy.providerTrainingAllowed &&
      !fallbackPassport.dataPolicy.secondaryUseAllowed &&
      (resolvedAssuranceLevel === "CAL_0_PUBLIC_ZERO_PHI" ||
        (fallbackPassport.phiAuthorization === "authorized-private-only" &&
          fallbackPassport.baaDpaStatus === "approved")) &&
      fallbackPassport.immutableDigest === request.fallbackModel.digest &&
      enclave?.independentFallbackRouteId === fallbackRouteId &&
      enclave.allowedModels.some(
        (model) =>
          model.modelId === request.fallbackModel.modelId &&
          model.version === request.fallbackModel.version &&
          model.digest === request.fallbackModel.digest
      ) &&
      !fallbackPassport.globalKillSwitch.active &&
      !fallbackPassport.workflowKillSwitches.some(
        (entry) => entry.workflowId === request.workflowId && entry.active
      ) &&
      fallbackCellPassed
  );
  const toolArtifactChecks = request.requestedToolArtifacts.map((requestedTool) => {
    const passport = registry.toolPassports.find(
      (candidate) => candidate.toolId === requestedTool.toolId && candidate.version === requestedTool.version
    );
    const passed = Boolean(
      passport &&
        passport.immutableDigest === requestedTool.digest &&
        passport.authorization.status === "active" &&
        isActiveAt(passport.authorization.startsAt, passport.authorization.expiresAt, request.at) &&
        passport.authorizedAssuranceLevels.includes(resolvedAssuranceLevel) &&
        passport.authorizedTenants.includes(request.tenantId) &&
        passport.authorizedWorkflows.includes(request.workflowId) &&
        passport.artifactSignature.status === "verified" &&
        digestPattern.test(passport.artifactSignature.signatureDigest) &&
        digestPattern.test(passport.sbomDigest) &&
        passport.dependencyScanStatus === "passed" &&
        passport.malwareScanStatus === "passed" &&
        !passport.killSwitch.active
    );
    return { toolId: requestedTool.toolId, digest: requestedTool.digest, passed };
  });
  const checks: ClinicalAssuranceCheck[] = [
    {
      id: "request-schema-and-identity",
      passed: safeRequest,
      mandatory: true,
      detail: "Only bounded identifiers, version references, retry budgets, and synthetic metadata are accepted."
    },
    {
      id: "assurance-level-no-downgrade",
      passed: assuranceNotDowngraded,
      mandatory: true,
      detail: "A requested CAL cannot be lower than the level resolved from data and sovereignty requirements."
    },
    {
      id: "current-runtime-no-phi-boundary",
      passed:
        resolvedAssuranceLevel === "CAL_0_PUBLIC_ZERO_PHI" &&
        request.requestedDataClassifications.every((classification) =>
          classification === "public" ||
          classification === "synthetic" ||
          classification === "irreversibly-deidentified"
        ),
      mandatory: true,
      detail: "The current runtime authorizes CAL-0 public, synthetic, or irreversibly deidentified metadata only; CAL-1/2/3 remain architecture and policy evaluation states."
    },
    ...enclaveChecks({ request, level: resolvedAssuranceLevel, enclave }),
    ...modelPassportChecks({ request, level: resolvedAssuranceLevel, passport }),
    {
      id: "enclave-exact-route-binding",
      passed: Boolean(
        enclave &&
          primaryRouteId === enclave.primaryRouteId &&
          fallbackRouteId === enclave.independentFallbackRouteId
      ),
      mandatory: true,
      detail: "The selected primary and fallback routes must match the enclave's approved route identifiers exactly."
    },
    {
      id: "signed-authorized-tool-artifacts",
      passed: toolArtifactChecks.length > 0 && toolArtifactChecks.every((tool) => tool.passed),
      mandatory: true,
      detail: "Every tool must match an active, signed, scanned, exact-version Tool Passport authorized for the tenant, workflow, and CAL."
    },
    {
      id: "worst-cell-model-eligibility",
      passed: cellPassed,
      mandatory: true,
      detail: "The exact model must pass the requested material domain cell; aggregate quality cannot override it."
    },
    {
      id: "capacity-admission",
      passed: capacity.admitted,
      mandatory: request.workloadTier === "TIER_0_CONTROL_SAFETY",
      detail: "Admission uses tier-specific reserved/observed capacity and bounded queue age without weakening safety."
    },
    {
      id: "concentration-budget",
      passed: concentration.allowed,
      mandatory: true,
      detail: "New deployment is blocked when a material dependency exceeds its ceiling without a valid exception."
    },
    {
      id: "materially-independent-fallback",
      passed: independence.independent && fallbackPassportValid,
      mandatory: true,
      detail: "Fallback must be authorized, cell-validated, and independent across material upstream dependencies."
    }
  ];
  const mandatoryFailures = checks.filter((check) => check.mandatory && !check.passed);
  const nonCapacityFailures = mandatoryFailures.filter((check) => check.id !== "capacity-admission");
  let status: AssuranceDecisionStatus = "allowed";
  let degradationAction: ClinicalAssuranceDecision["degradationAction"] = "none";
  if (nonCapacityFailures.length > 0) {
    status = "blocked";
    degradationAction = "block";
  } else if (!capacity.admitted) {
    if (capacity.action === "queue") {
      status = "queued";
      degradationAction = "queue";
    } else if (capacity.action === "shed-tier-2") {
      status = "blocked";
      degradationAction = "shed-tier-2";
    } else {
      status = "human-handoff";
      degradationAction = "human-handoff";
    }
  }
  const policyDecisionId = `assurance_${hash({ request, checks, status }).slice(0, 24)}`;
  const routingDecisionId = `routing_${hash({ primaryRouteId, fallbackRouteId, status, cell: cell?.cellId }).slice(0, 20)}`;
  const acceptedOutcomeRate = cell?.acceptedOutcomeRate ?? 0;
  const retryCost = request.retryCount * 0.01;
  const cost = {
    inferenceUsd: 0,
    hostingUsd: 0.01,
    cacheUsd: 0.001,
    retrievalUsd: 0.004,
    validationUsd: 0.02,
    reviewerUsd: 0.25,
    retriesUsd: retryCost,
    latencyBurdenUsd: (primaryCapacity?.p95LatencyMs ?? 0) / 1_000_000,
    failureOverrideBurdenUsd: cell ? cell.safetyEventRate * 0.5 : 0.5,
    totalUsd: 0,
    acceptedOutcomeRate,
    costPerAcceptedOutcomeUsd: null as number | null
  };
  cost.totalUsd =
    cost.inferenceUsd +
    cost.hostingUsd +
    cost.cacheUsd +
    cost.retrievalUsd +
    cost.validationUsd +
    cost.reviewerUsd +
    cost.retriesUsd +
    cost.latencyBurdenUsd +
    cost.failureOverrideBurdenUsd;
  cost.costPerAcceptedOutcomeUsd = acceptedOutcomeRate > 0 ? cost.totalUsd / acceptedOutcomeRate : null;
  const traceId = `trace_${hash({ policyDecisionId, type: "trace" }).slice(0, 20)}`;
  const correlationId = `correlation_${hash({ request: request.caseInputFingerprint, type: "correlation" }).slice(0, 20)}`;
  const caseEvidenceBinding: ClinicalAssuranceDecision["caseEvidenceBinding"] = {
    assuranceLevel: resolvedAssuranceLevel,
    enclaveId: enclave?.enclaveId ?? null,
    policyDecisionId,
    modelPassportDigest: passport?.immutableDigest ?? null,
    fallbackPassportDigest: fallbackPassport?.immutableDigest ?? null,
    toolArtifactDigests: toolArtifactChecks.filter((tool) => tool.passed).map((tool) => tool.digest),
    capacityDecisionId: capacity.decisionId,
    concentrationDecisionId: concentration.decisionId,
    routingDecisionId,
    subgroupEvaluationIds: [cell?.evaluationEvidenceId, fallbackCell?.evaluationEvidenceId].filter(
      (value): value is string => Boolean(value)
    ),
    queueTimeMs: capacity.queueAgeMs,
    retryCount: request.retryCount,
    finalDisposition:
      status === "allowed"
        ? "authorized-synthetic-route"
        : status === "queued"
          ? "queued"
          : status === "human-handoff"
            ? "human-handoff"
            : "blocked"
  };
  const auditHash = hash({
    policyDecisionId,
    status,
    resolvedAssuranceLevel,
    enclaveId: enclave?.enclaveId ?? null,
    modelDigest: passport?.immutableDigest ?? null,
    fallbackDigest: fallbackPassport?.immutableDigest ?? null,
    toolArtifactDigests: caseEvidenceBinding.toolArtifactDigests,
    checks,
    caseEvidenceBinding
  });

  return {
    policyDecisionId,
    status,
    resolvedAssuranceLevel,
    enclaveId: enclave?.enclaveId ?? null,
    modelPassportDigest: passport?.immutableDigest ?? null,
    fallbackPassportDigest: fallbackPassport?.immutableDigest ?? null,
    primaryRouteId,
    fallbackRouteId,
    fallbackMateriallyIndependent: independence.independent,
    modelInvocationAuthorized: status === "allowed" && request.simulationOnly && request.enforcementEnabled,
    externalProviderCallAllowed: false,
    clinicalActionAuthority: false,
    payerSubmissionAllowed: false,
    ehrWritebackAllowed: false,
    humanReviewRequired: true,
    degradationAction,
    checks,
    blockers: mandatoryFailures.map((check) => check.id),
    warnings: [
      ...(!request.enforcementEnabled ? ["Control-plane enforcement is observe-only; model invocation remains disabled."] : []),
      ...independence.sharedDependencies.map((dependency) => `Fallback shares material dependency ${dependency}.`)
    ],
    acceptedOutcomeCost: cost,
    caseEvidenceBinding,
    auditEvent: {
      eventType: "clinical-assurance-preflight",
      traceId,
      correlationId,
      occurredAt: request.at,
      previousAuditHash: null,
      auditHash,
      containsPhi: false
    },
    boundary: clinicalAssuranceBoundary
  };
}

export function handleSupplierEvent(event: SupplierEvent) {
  const criticalTypes: SupplierEventType[] = [
    "provider-model-withdrawal",
    "security-compromise",
    "sanctions-export-restriction",
    "government-regulatory-conflict"
  ];
  const action = criticalTypes.includes(event.type)
    ? "suspend-and-run-withdrawal-drill"
    : event.severity === "high" || event.type === "change-of-control" || event.type === "material-policy-change"
      ? "reauthorize-and-simulate-routing"
      : "risk-review";
  return {
    eventId: event.eventId,
    action,
    newTrafficAllowed: action === "risk-review",
    credentialRotationRequired: event.type === "security-compromise" || event.type === "provider-model-withdrawal",
    humanApprovalRequired: true,
    automaticProductionMutationAllowed: false,
    auditHash: hash({ event, action })
  } as const;
}

export function runSupplierWithdrawalDrill(input: {
  event: SupplierEvent;
  primaryRouteId: string;
  fallbackRouteId: string;
  dependencyEdges: CriticalDependencyEdge[];
  primaryAuditHash: string;
  recoveredAuditHash: string;
  declaredRtoMinutes: number;
  observedRecoveryMinutes: number;
  declaredRpoMinutes: number;
  observedDataLossMinutes: number;
}) {
  const independence = validateMateriallyIndependentFallback(input);
  const auditContinuity = Boolean(input.primaryAuditHash && input.recoveredAuditHash);
  const passed =
    independence.independent &&
    auditContinuity &&
    input.observedRecoveryMinutes <= input.declaredRtoMinutes &&
    input.observedDataLossMinutes <= input.declaredRpoMinutes;
  return {
    status: passed ? "drill-passed-review-required" : "drill-failed",
    primaryRevokedForNewTraffic: true,
    credentialAndKeyRotation: "required-manual-approved-procedure",
    exportedArtifactRestore: "verified-synthetic-fixture",
    queueTransfer: passed ? "validated" : "blocked",
    fallbackActivated: passed,
    fallbackMateriallyIndependent: independence.independent,
    auditContinuityPreserved: auditContinuity,
    rtoPassed: input.observedRecoveryMinutes <= input.declaredRtoMinutes,
    rpoPassed: input.observedDataLossMinutes <= input.declaredRpoMinutes,
    productionExecutionPerformed: false,
    humanApprovalRequired: true,
    auditHash: hash({ input, independence, passed })
  } as const;
}

const syntheticPrimaryRouteId = "synthetic-fallback:scrimed-synthetic-no-call:2026-07-18";
const syntheticFallbackRouteId = "independent-local-rules:scrimed-independent-policy-handoff:2026-07-18";
const syntheticPrimaryDigest = hash({ model: "scrimed-synthetic-no-call", version: "2026-07-18" });
const syntheticFallbackDigest = hash({ model: "scrimed-independent-policy-handoff", version: "2026-07-18" });

function buildSyntheticToolPassport(toolId: string): ToolArtifactPassport {
  const version = "2026-07-18";
  return {
    toolId,
    version,
    immutableDigest: hash({ toolId, version }),
    authorizedAssuranceLevels: ["CAL_0_PUBLIC_ZERO_PHI"],
    authorizedTenants: ["synthetic-tenant"],
    authorizedWorkflows: ["documentation-before-authorization"],
    artifactSignature: {
      status: "verified",
      signatureDigest: hash({ signature: toolId, version }),
      signerIdentity: "scrimed-release-governance"
    },
    sbomDigest: hash({ sbom: toolId, version }),
    dependencyScanStatus: "passed",
    malwareScanStatus: "passed",
    authorization: {
      status: "active",
      startsAt: "2026-07-18T00:00:00.000Z",
      expiresAt: "2027-07-18T00:00:00.000Z"
    },
    killSwitch: { active: false, reason: null, changedAt: null }
  };
}

export const syntheticClinicalAssuranceRegistry: ClinicalAssuranceRegistry = {
  enclaves: [
    {
      enclaveId: "enclave-atlas-cal0-synthetic",
      tenantIds: ["synthetic-tenant"],
      assuranceLevel: "CAL_0_PUBLIC_ZERO_PHI",
      authorizedDataClassifications: ["public", "synthetic", "irreversibly-deidentified"],
      jurisdiction: "US",
      approvedRegions: ["us-synthetic-1"],
      allowedModels: [
        { modelId: "scrimed-synthetic-no-call", version: "2026-07-18", digest: syntheticPrimaryDigest },
        {
          modelId: "scrimed-independent-policy-handoff",
          version: "2026-07-18",
          digest: syntheticFallbackDigest
        }
      ],
      allowedTools: ["documentation-gap-evaluator", "review-packet-builder", "context-lens"],
      allowedWorkflows: ["documentation-before-authorization"],
      keyManagementReference: "kms-ref-synthetic-no-key-material",
      ingressPolicy: {
        allowedSourceClasses: ["registered-synthetic-fixture", "reviewed-public-policy-metadata"],
        authenticatedIdentityRequired: true,
        minimumNecessaryRequired: true
      },
      egressPolicy: {
        mode: "public-synthetic-only",
        approvedDestinations: ["internal-review-queue"],
        internetReachable: false,
        crossEnclaveReuseAllowed: false
      },
      scopes: {
        cache: "atlas-cal0-cache",
        vectorIndex: "atlas-cal0-index",
        telemetry: "atlas-cal0-telemetry",
        logs: "atlas-cal0-logs",
        retention: "atlas-cal0-retention"
      },
      planes: {
        policyControl: "atlas-cal0-policy-plane",
        clinicalData: "atlas-cal0-synthetic-data-plane",
        modelArtifacts: "atlas-cal0-artifact-plane",
        evidenceAudit: "atlas-cal0-evidence-plane"
      },
      operatorAccessPolicy: {
        mode: "standard-least-privilege",
        shortLivedCredentialsRequired: true,
        breakGlassReviewRequired: true
      },
      reservedCapacityPolicy: {
        required: false,
        capacityPassportIds: ["capacity-synthetic-primary", "capacity-independent-fallback"]
      },
      primaryRouteId: syntheticPrimaryRouteId,
      independentFallbackRouteId: syntheticFallbackRouteId,
      slo: { availabilityPercent: 99.9, p95LatencyMs: 750 },
      rtoMinutes: 15,
      rpoMinutes: 0,
      status: "active",
      effectiveAt: "2026-07-18T00:00:00.000Z",
      expiresAt: "2027-07-18T00:00:00.000Z",
      owner: "scrimed-trust-governance",
      approvalEvidenceIds: ["approval-synthetic-cal0-control-plane"],
      auditHash: hash({ enclave: "enclave-atlas-cal0-synthetic" })
    }
  ],
  modelPassports: [
    {
      modelId: "scrimed-synthetic-no-call",
      version: "2026-07-18",
      immutableDigest: syntheticPrimaryDigest,
      providerId: "synthetic-fallback",
      hostingOperator: "scrimed-local-synthetic-runtime",
      controllingCorporateFamily: "scrimed-solutions",
      cloud: "scrimed-local-runtime",
      region: "us-synthetic-1",
      jurisdiction: "US",
      acceleratorPool: "cpu-synthetic-primary",
      servingPool: "scrimed-deterministic-primary",
      identityProvider: "scrimed-synthetic-identity",
      network: "scrimed-local-network",
      license: "internal-synthetic-evaluation",
      weightAvailability: "deterministic-no-model",
      baaDpaStatus: "not-required-cal0",
      phiAuthorization: "not-authorized",
      dataPolicy: {
        providerTrainingAllowed: false,
        retentionDays: 30,
        residency: ["US"],
        secondaryUseAllowed: false
      },
      authorizedAssuranceLevels: ["CAL_0_PUBLIC_ZERO_PHI"],
      authorizedTenants: ["synthetic-tenant"],
      authorizedWorkflows: ["documentation-before-authorization"],
      authorizedTools: ["documentation-gap-evaluator", "review-packet-builder", "context-lens"],
      validatedDomainCells: ["payeriq-synthetic-documentation-gap"],
      evaluationSuiteVersion: "scrimed-p31-workstreams-v1",
      approvalEvidenceIds: ["eval-payeriq-primary-cal0"],
      artifactSignature: {
        status: "verified",
        signatureDigest: hash({ artifact: "scrimed-synthetic-no-call" }),
        signerIdentity: "scrimed-release-governance"
      },
      sbomDigest: hash({ sbom: "scrimed-synthetic-runtime" }),
      mlBomDigest: hash({ mlBom: "no-model-deterministic-rules" }),
      dependencyScanStatus: "passed",
      malwareScanStatus: "passed",
      authorization: {
        status: "active",
        startsAt: "2026-07-18T00:00:00.000Z",
        expiresAt: "2027-07-18T00:00:00.000Z",
        suspendedAt: null,
        revokedAt: null
      },
      routeRole: "primary",
      globalKillSwitch: { active: false, reason: null, changedAt: null },
      workflowKillSwitches: [],
      exportPortabilityPath: "signed-json-registry-export",
      changeEvents: []
    },
    {
      modelId: "scrimed-independent-policy-handoff",
      version: "2026-07-18",
      immutableDigest: syntheticFallbackDigest,
      providerId: "independent-local-rules",
      hostingOperator: "customer-controlled-offline-review-runtime",
      controllingCorporateFamily: "customer-controlled-operations",
      cloud: "customer-local-runtime",
      region: "us-synthetic-1",
      jurisdiction: "US",
      acceleratorPool: "cpu-offline-fallback",
      servingPool: "customer-review-handoff",
      identityProvider: "customer-controlled-identity",
      network: "customer-isolated-network",
      license: "portable-deterministic-review-handoff",
      weightAvailability: "deterministic-no-model",
      baaDpaStatus: "not-required-cal0",
      phiAuthorization: "not-authorized",
      dataPolicy: {
        providerTrainingAllowed: false,
        retentionDays: 0,
        residency: ["US"],
        secondaryUseAllowed: false
      },
      authorizedAssuranceLevels: ["CAL_0_PUBLIC_ZERO_PHI"],
      authorizedTenants: ["synthetic-tenant"],
      authorizedWorkflows: ["documentation-before-authorization"],
      authorizedTools: ["documentation-gap-evaluator", "review-packet-builder", "context-lens"],
      validatedDomainCells: ["payeriq-synthetic-documentation-gap"],
      evaluationSuiteVersion: "scrimed-p31-workstreams-v1",
      approvalEvidenceIds: ["eval-payeriq-fallback-cal0"],
      artifactSignature: {
        status: "verified",
        signatureDigest: hash({ artifact: "scrimed-independent-policy-handoff" }),
        signerIdentity: "customer-controlled-release-governance"
      },
      sbomDigest: hash({ sbom: "independent-review-handoff" }),
      mlBomDigest: hash({ mlBom: "no-model-independent-rules" }),
      dependencyScanStatus: "passed",
      malwareScanStatus: "passed",
      authorization: {
        status: "active",
        startsAt: "2026-07-18T00:00:00.000Z",
        expiresAt: "2027-07-18T00:00:00.000Z",
        suspendedAt: null,
        revokedAt: null
      },
      routeRole: "fallback",
      globalKillSwitch: { active: false, reason: null, changedAt: null },
      workflowKillSwitches: [],
      exportPortabilityPath: "offline-signed-registry-export",
      changeEvents: []
    }
  ],
  toolPassports: [
    buildSyntheticToolPassport("documentation-gap-evaluator"),
    buildSyntheticToolPassport("review-packet-builder"),
    buildSyntheticToolPassport("context-lens")
  ],
  capacityPassports: [
    {
      capacityPassportId: "capacity-synthetic-primary",
      routeId: syntheticPrimaryRouteId,
      modelId: "scrimed-synthetic-no-call",
      providerId: "synthetic-fallback",
      contractedThroughputRps: 100,
      minimumThroughputRps: 20,
      burstThroughputRps: 150,
      reservedThroughputRps: 25,
      observedAvailableThroughputRps: 80,
      admittedThroughputRps: 10,
      p95LatencyMs: 50,
      p99LatencyMs: 100,
      queueAgeMs: 0,
      uptimePercent: 99.99,
      errorRate: 0,
      renewalAt: "2027-01-18T00:00:00.000Z",
      expiresAt: "2027-07-18T00:00:00.000Z",
      incidentCount90Days: 0,
      region: "us-synthetic-1",
      jurisdiction: "US",
      fallbackRouteId: syntheticFallbackRouteId,
      portabilityStatus: "ready",
      baaDpaStatus: "not-required-cal0",
      securityApproval: "approved-synthetic",
      auditHash: hash({ capacity: "capacity-synthetic-primary" })
    },
    {
      capacityPassportId: "capacity-independent-fallback",
      routeId: syntheticFallbackRouteId,
      modelId: "scrimed-independent-policy-handoff",
      providerId: "independent-local-rules",
      contractedThroughputRps: 50,
      minimumThroughputRps: 10,
      burstThroughputRps: 75,
      reservedThroughputRps: 10,
      observedAvailableThroughputRps: 40,
      admittedThroughputRps: 0,
      p95LatencyMs: 100,
      p99LatencyMs: 200,
      queueAgeMs: 0,
      uptimePercent: 99.9,
      errorRate: 0,
      renewalAt: "2027-01-18T00:00:00.000Z",
      expiresAt: "2027-07-18T00:00:00.000Z",
      incidentCount90Days: 0,
      region: "us-synthetic-1",
      jurisdiction: "US",
      fallbackRouteId: "human-review-queue",
      portabilityStatus: "ready",
      baaDpaStatus: "not-required-cal0",
      securityApproval: "approved-synthetic",
      auditHash: hash({ capacity: "capacity-independent-fallback" })
    }
  ],
  dependencyEdges: [
    [syntheticPrimaryRouteId, "provider", "synthetic-fallback"],
    [syntheticPrimaryRouteId, "controlling-corporate-family", "scrimed-solutions"],
    [syntheticPrimaryRouteId, "cloud", "scrimed-local-runtime"],
    [syntheticPrimaryRouteId, "region", "us-synthetic-primary"],
    [syntheticPrimaryRouteId, "accelerator-serving-pool", "cpu-synthetic-primary"],
    [syntheticPrimaryRouteId, "network", "scrimed-local-network"],
    [syntheticPrimaryRouteId, "identity-provider", "scrimed-synthetic-identity"],
    [syntheticPrimaryRouteId, "storage", "scrimed-synthetic-storage"],
    [syntheticPrimaryRouteId, "search-vector", "scrimed-synthetic-index"],
    [syntheticPrimaryRouteId, "observability", "scrimed-synthetic-observability"],
    [syntheticPrimaryRouteId, "model-family", "scrimed-deterministic-rules"],
    [syntheticPrimaryRouteId, "material-subcontractor", "none-scrimed-operated"],
    [syntheticFallbackRouteId, "provider", "independent-local-rules"],
    [syntheticFallbackRouteId, "controlling-corporate-family", "customer-controlled-operations"],
    [syntheticFallbackRouteId, "cloud", "customer-local-runtime"],
    [syntheticFallbackRouteId, "region", "us-synthetic-fallback"],
    [syntheticFallbackRouteId, "accelerator-serving-pool", "cpu-offline-fallback"],
    [syntheticFallbackRouteId, "network", "customer-isolated-network"],
    [syntheticFallbackRouteId, "identity-provider", "customer-controlled-identity"],
    [syntheticFallbackRouteId, "storage", "customer-offline-storage"],
    [syntheticFallbackRouteId, "search-vector", "customer-offline-index"],
    [syntheticFallbackRouteId, "observability", "customer-offline-observability"],
    [syntheticFallbackRouteId, "model-family", "customer-deterministic-handoff"],
    [syntheticFallbackRouteId, "material-subcontractor", "none-customer-operated"]
  ].map(([routeId, dimension, dependencyId], index) => ({
    edgeId: `dependency-${index + 1}`,
    routeId,
    dimension: dimension as DependencyDimension,
    dependencyId,
    material: true,
    region: "US",
    jurisdiction: "US",
    fallbackTarget: routeId === syntheticPrimaryRouteId ? syntheticFallbackRouteId : "human-review-queue",
    portabilityStatus: "ready" as const,
    baaDpaStatus: "not-required-cal0" as const,
    securityApproval: "approved-synthetic" as const
  })),
  concentrationBudgets: [
    {
      budgetId: "budget-synthetic-provider",
      dimension: "provider",
      dependencyId: "synthetic-fallback",
      ceilingBasisPoints: 8000,
      currentExposureBasisPoints: 3000,
      owner: "scrimed-platform-reliability",
      exceptions: []
    },
    {
      budgetId: "budget-scrimed-family",
      dimension: "controlling-corporate-family",
      dependencyId: "scrimed-solutions",
      ceilingBasisPoints: 7000,
      currentExposureBasisPoints: 2500,
      owner: "scrimed-platform-reliability",
      exceptions: []
    },
    {
      budgetId: "budget-primary-cloud",
      dimension: "cloud",
      dependencyId: "scrimed-local-runtime",
      ceilingBasisPoints: 7000,
      currentExposureBasisPoints: 2500,
      owner: "scrimed-platform-reliability",
      exceptions: []
    },
    {
      budgetId: "budget-primary-region",
      dimension: "region",
      dependencyId: "us-synthetic-primary",
      ceilingBasisPoints: 7000,
      currentExposureBasisPoints: 2500,
      owner: "scrimed-platform-reliability",
      exceptions: []
    },
    {
      budgetId: "budget-primary-accelerator",
      dimension: "accelerator-serving-pool",
      dependencyId: "cpu-synthetic-primary",
      ceilingBasisPoints: 7000,
      currentExposureBasisPoints: 2500,
      owner: "scrimed-platform-reliability",
      exceptions: []
    },
    {
      budgetId: "budget-primary-network",
      dimension: "network",
      dependencyId: "scrimed-local-network",
      ceilingBasisPoints: 7000,
      currentExposureBasisPoints: 2500,
      owner: "scrimed-platform-reliability",
      exceptions: []
    },
    {
      budgetId: "budget-primary-identity",
      dimension: "identity-provider",
      dependencyId: "scrimed-synthetic-identity",
      ceilingBasisPoints: 7000,
      currentExposureBasisPoints: 2500,
      owner: "scrimed-platform-reliability",
      exceptions: []
    },
    {
      budgetId: "budget-primary-model-family",
      dimension: "model-family",
      dependencyId: "scrimed-deterministic-rules",
      ceilingBasisPoints: 7000,
      currentExposureBasisPoints: 2500,
      owner: "scrimed-platform-reliability",
      exceptions: []
    },
    {
      budgetId: "budget-primary-subcontractor",
      dimension: "material-subcontractor",
      dependencyId: "none-scrimed-operated",
      ceilingBasisPoints: 7000,
      currentExposureBasisPoints: 2500,
      owner: "scrimed-platform-reliability",
      exceptions: []
    }
  ],
  validatedDomainCells: [
    {
      cellId: "payeriq-synthetic-documentation-gap",
      modelId: "scrimed-synthetic-no-call",
      workflowId: "documentation-before-authorization",
      status: "pass",
      mandatory: true,
      safetyCritical: true,
      qualityScore: 1,
      minimumQualityScore: 0.95,
      safetyEventRate: 0,
      maximumSafetyEventRate: 0,
      sampleSize: 120,
      minimumSampleSize: 40,
      acceptedOutcomeRate: 0.9,
      evaluationEvidenceId: "eval-payeriq-primary-cal0"
    },
    {
      cellId: "payeriq-synthetic-documentation-gap",
      modelId: "scrimed-independent-policy-handoff",
      workflowId: "documentation-before-authorization",
      status: "pass",
      mandatory: true,
      safetyCritical: true,
      qualityScore: 1,
      minimumQualityScore: 0.95,
      safetyEventRate: 0,
      maximumSafetyEventRate: 0,
      sampleSize: 120,
      minimumSampleSize: 40,
      acceptedOutcomeRate: 0.85,
      evaluationEvidenceId: "eval-payeriq-fallback-cal0"
    }
  ]
};

export const syntheticPayerIqAssuranceRequest: ClinicalAssurancePreflightRequest = {
  tenantId: "synthetic-tenant",
  enclaveId: "enclave-atlas-cal0-synthetic",
  workflowId: "documentation-before-authorization",
  caseInputFingerprint: hash({ case: "synthetic-payeriq-case-fingerprint" }),
  requestedDataClassifications: ["synthetic"],
  requestedAssuranceLevel: "CAL_0_PUBLIC_ZERO_PHI",
  sovereignIsolationRequired: false,
  jurisdiction: "US",
  region: "us-synthetic-1",
  workloadTier: "TIER_1_INTERACTIVE",
  requestedModel: {
    modelId: "scrimed-synthetic-no-call",
    version: "2026-07-18",
    digest: syntheticPrimaryDigest
  },
  fallbackModel: {
    modelId: "scrimed-independent-policy-handoff",
    version: "2026-07-18",
    digest: syntheticFallbackDigest
  },
  requiredTools: ["documentation-gap-evaluator", "review-packet-builder", "context-lens"],
  requestedToolArtifacts: syntheticClinicalAssuranceRegistry.toolPassports.map((tool) => ({
    toolId: tool.toolId,
    version: tool.version,
    digest: tool.immutableDigest
  })),
  domainCellId: "payeriq-synthetic-documentation-gap",
  requiredThroughputRps: 1,
  maximumQueueAgeMs: 1_000,
  requestExposureBasisPoints: 25,
  identity: {
    userIdentityHash: hash({ identity: "synthetic-rcm-reviewer" }),
    serviceIdentityHash: hash({ identity: "payeriq-service" }),
    agentIdentityHash: hash({ identity: "payeriq-workflow-agent" })
  },
  versions: {
    prompt: "not-used-enumerated-schema",
    policy: clinicalAssurancePolicyVersion,
    tools: ["documentation-gap-evaluator-v1", "review-packet-builder-v1", "context-lens-v1"],
    retrieval: "enumerated-synthetic-evidence-v1",
    dataset: "payeriq-synthetic-fixtures-v1"
  },
  retryCount: 0,
  simulationOnly: true,
  enforcementEnabled: false,
  at: "2026-07-18T12:00:00.000Z"
};

export function getApprovedModelRegistry(
  registry: ClinicalAssuranceRegistry = syntheticClinicalAssuranceRegistry
): ApprovedModelRegistry {
  return {
    registryVersion: clinicalAssurancePolicyVersion,
    defaultDeny: true,
    exactVersionRequired: true,
    silentSubstitutionAllowed: false,
    passports: registry.modelPassports
  };
}

export function getCriticalDependencyMap(
  registry: ClinicalAssuranceRegistry = syntheticClinicalAssuranceRegistry
): CriticalDependencyMap {
  return {
    mapVersion: clinicalAssurancePolicyVersion,
    materialIndependenceRequired: true,
    edges: registry.dependencyEdges
  };
}

export type ClinicalAssuranceScenarioId =
  | "payeriq-synthetic-preflight"
  | "cal2-public-egress-block"
  | "global-kill-switch"
  | "capacity-scarcity"
  | "shared-fallback-dependency"
  | "concentration-ceiling"
  | "supplier-withdrawal";

export const clinicalAssuranceScenarioIds: ClinicalAssuranceScenarioId[] = [
  "payeriq-synthetic-preflight",
  "cal2-public-egress-block",
  "global-kill-switch",
  "capacity-scarcity",
  "shared-fallback-dependency",
  "concentration-ceiling",
  "supplier-withdrawal"
];

function cloneSyntheticRegistry(): ClinicalAssuranceRegistry {
  return JSON.parse(JSON.stringify(syntheticClinicalAssuranceRegistry)) as ClinicalAssuranceRegistry;
}

export function runClinicalAssuranceScenario(scenario: ClinicalAssuranceScenarioId) {
  const registry = cloneSyntheticRegistry();
  const request: ClinicalAssurancePreflightRequest = {
    ...syntheticPayerIqAssuranceRequest,
    enforcementEnabled: true
  };

  if (scenario === "cal2-public-egress-block") {
    request.requestedDataClassifications = ["part-2"];
    request.requestedAssuranceLevel = "CAL_2_RESTRICTED_CLINICAL";
    registry.enclaves[0] = {
      ...registry.enclaves[0],
      assuranceLevel: "CAL_2_RESTRICTED_CLINICAL",
      authorizedDataClassifications: ["part-2"],
      egressPolicy: {
        ...registry.enclaves[0].egressPolicy,
        mode: "default-deny",
        internetReachable: true
      }
    };
  }

  if (scenario === "global-kill-switch") {
    registry.modelPassports[0] = {
      ...registry.modelPassports[0],
      globalKillSwitch: {
        active: true,
        reason: "synthetic-security-drill",
        changedAt: request.at
      }
    };
  }

  if (scenario === "capacity-scarcity") {
    registry.capacityPassports[0] = {
      ...registry.capacityPassports[0],
      observedAvailableThroughputRps: registry.capacityPassports[0].admittedThroughputRps,
      queueAgeMs: 250
    };
  }

  if (scenario === "shared-fallback-dependency") {
    const fallbackProviderEdge = registry.dependencyEdges.find(
      (edge) => edge.routeId === registry.enclaves[0].independentFallbackRouteId && edge.dimension === "provider"
    );
    if (fallbackProviderEdge) fallbackProviderEdge.dependencyId = "synthetic-fallback";
  }

  if (scenario === "concentration-ceiling") {
    registry.concentrationBudgets[0] = {
      ...registry.concentrationBudgets[0],
      currentExposureBasisPoints: registry.concentrationBudgets[0].ceilingBasisPoints - 1
    };
  }

  if (scenario === "supplier-withdrawal") {
    const primary = registry.modelPassports[0];
    const fallback = registry.modelPassports[1];
    return {
      scenario,
      type: "supplier-withdrawal-drill" as const,
      result: runSupplierWithdrawalDrill({
        event: {
          eventId: "supplier-withdrawal-synthetic-drill",
          supplierId: primary.providerId,
          type: "provider-model-withdrawal",
          severity: "critical",
          effectiveAt: request.at,
          evidenceReference: "supplier-event-synthetic-evidence"
        },
        primaryRouteId: registry.enclaves[0].primaryRouteId,
        fallbackRouteId: registry.enclaves[0].independentFallbackRouteId,
        dependencyEdges: registry.dependencyEdges,
        primaryAuditHash: primary.immutableDigest,
        recoveredAuditHash: fallback.immutableDigest,
        declaredRtoMinutes: registry.enclaves[0].rtoMinutes,
        observedRecoveryMinutes: 10,
        declaredRpoMinutes: registry.enclaves[0].rpoMinutes,
        observedDataLossMinutes: 0
      }),
      syntheticOnly: true,
      noPhi: true,
      externalActionTaken: false,
      boundary: clinicalAssuranceBoundary
    };
  }

  return {
    scenario,
    type: "preflight-decision" as const,
    result: authorizeClinicalAssuranceInvocation(request, registry),
    syntheticOnly: true,
    noPhi: true,
    externalActionTaken: false,
    boundary: clinicalAssuranceBoundary
  };
}

export function getClinicalAssuranceControlPlaneSummary() {
  const verticalSliceDecision = authorizeClinicalAssuranceInvocation(
    syntheticPayerIqAssuranceRequest,
    syntheticClinicalAssuranceRegistry
  );
  return {
    service: "scrimed-clinical-assurance-control-plane",
    status: "synthetic-control-plane-ready-enforcement-disabled",
    policyVersion: clinicalAssurancePolicyVersion,
    assuranceLevels: Object.keys(levelRank) as ClinicalAssuranceLevel[],
    registry: {
      enclaveCount: syntheticClinicalAssuranceRegistry.enclaves.length,
      modelPassportCount: syntheticClinicalAssuranceRegistry.modelPassports.length,
      toolPassportCount: syntheticClinicalAssuranceRegistry.toolPassports.length,
      capacityPassportCount: syntheticClinicalAssuranceRegistry.capacityPassports.length,
      dependencyEdgeCount: syntheticClinicalAssuranceRegistry.dependencyEdges.length,
      concentrationBudgetCount: syntheticClinicalAssuranceRegistry.concentrationBudgets.length,
      validatedCellCount: syntheticClinicalAssuranceRegistry.validatedDomainCells.length
    },
    approvedModelRegistry: getApprovedModelRegistry(),
    criticalDependencyMap: getCriticalDependencyMap(),
    verticalSlice: {
      workflow: "documentation-before-authorization",
      decision: verticalSliceDecision,
      syntheticOnly: true,
      noPhi: true
    },
    controls: [
      "exact model passport and signed artifact",
      "CAL and sovereign enclave resolution",
      "global and workflow kill switches",
      "worst-cell eligibility",
      "capacity admission and bounded degradation",
      "provider and corporate-family concentration ceilings",
      "materially independent fallback",
      "CaseEvidence and immutable audit binding",
      "human review and safe handoff"
    ],
    scenarios: clinicalAssuranceScenarioIds.map((scenario) => ({
      scenario,
      endpoint: "/api/clinical-assurance-control-plane",
      method: "POST",
      syntheticOnly: true
    })),
    externalProviderCallsEnabled: false,
    durableWritesEnabled: false,
    productionClinicalAuthority: false,
    boundary: clinicalAssuranceBoundary
  };
}

export function buildClinicalAssuranceControlPlaneBrief() {
  const summary = getClinicalAssuranceControlPlaneSummary();
  const decision = summary.verticalSlice.decision;

  return [
    "# SCRIMED Clinical Assurance Control Plane",
    "",
    `Status: ${summary.status}`,
    `Policy: ${summary.policyVersion}`,
    `PayerIQ synthetic preflight: ${decision.status}`,
    `Model invocation authorized: ${decision.modelInvocationAuthorized ? "yes" : "no; enforcement remains disabled"}`,
    "",
    "## Governed Runtime",
    ...summary.controls.map((control) => `- ${control}`),
    "",
    "## Safety",
    "- The dashboard and scenario runner use metadata-only synthetic fixtures.",
    "- CAL does not represent an external certification or government impact level.",
    "- No raw PHI, provider call, payer submission, EHR writeback, or autonomous clinical action is authorized.",
    "- Human review, evidence, exact version binding, cancellation, and safe handoff remain mandatory.",
    "",
    "## Boundary",
    summary.boundary
  ].join("\n");
}
