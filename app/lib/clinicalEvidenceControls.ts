export const clinicalEvidenceControlsVersion =
  "scrimed-clinical-evidence-controls-v1-2026-07-17";

export const clinicalEvidenceControlsBoundary =
  "SCRIMED Clinical Evidence Controls operate on synthetic, public, deidentified, or metadata-only inputs. They support context review, descriptive evidence capture, and release evaluation; they do not authorize live PHI, autonomous clinical care, diagnosis, treatment, prescribing, final imaging interpretation, payer submission, EHR writeback, causal claims, certification claims, or customer go-live.";

export type ClinicalContextLensMode = "public-evidence" | "clinical-context";
export type ClinicalContextLensDataClass =
  | "public"
  | "metadata"
  | "synthetic-deidentified"
  | "phi";

export type ClinicalContextLensSource = {
  id: string;
  title: string;
  uri: string;
  tenantScope: string;
  trustTier: "authoritative" | "reviewed" | "unverified";
  effectiveAt: string;
  expiresAt: string | null;
  provenanceHash: string;
};

export type ClinicalContextLensInput = {
  mode: ClinicalContextLensMode;
  tenantId: string | null;
  taskType: string;
  dataClassification: ClinicalContextLensDataClass;
  authenticated: boolean;
  tenantScoped: boolean;
  minimumNecessary: boolean;
  consentVerified: boolean;
  humanReviewRequired: boolean;
  patientFit: "not-assessed" | "synthetic-fit" | "not-applicable";
  relevantHistory: string[];
  sources: ClinicalContextLensSource[];
  missingData: string[];
  confidenceScore: number;
  calibrationStatus: "not-evaluated" | "synthetic-calibrated" | "insufficient-evidence";
  contraindications: string[];
  policyConstraints: string[];
  proposedNextAction: string;
};

export type ClinicalContextLensResult = {
  status: "context-ready" | "review-required" | "abstained" | "blocked";
  mode: ClinicalContextLensMode;
  taskType: string;
  patientFit: ClinicalContextLensInput["patientFit"];
  relevantHistory: string[];
  sources: ClinicalContextLensSource[];
  freshness: {
    evaluatedAt: string;
    staleSourceIds: string[];
    expiredSourceIds: string[];
    allCurrent: boolean;
  };
  missingData: string[];
  confidenceScore: number;
  calibrationStatus: ClinicalContextLensInput["calibrationStatus"];
  contraindications: string[];
  policyConstraints: string[];
  nextAction: string | null;
  actionReason: string;
  humanReviewRequired: boolean;
  abstentionReasons: string[];
  actionAuthority: "decision-support-only";
  containsPhi: false;
  auditHash: string;
  boundary: typeof clinicalEvidenceControlsBoundary;
};

export type ContextPacketRequest = {
  tenantId: string | null;
  subjectReference: {
    kind: "synthetic-patient" | "workflow-subject" | "public-topic";
    reference: string;
  } | null;
  encounterOrWorkflowReference: string;
  requestingActor: {
    actorId: string;
    role: string;
    purposeOfUse: string;
  };
  operatingMode: ClinicalContextLensMode;
  lensInput: ClinicalContextLensInput;
  supportingEvidence: string[];
  contradictoryEvidenceSourceIds: string[];
  versions: {
    model: string;
    prompt: string;
    tools: string[];
    policy: string;
    retrieval: string;
  };
  correlationId: string;
  traceId: string;
};

export type ContextPacket = {
  schemaVersion: typeof clinicalEvidenceControlsVersion;
  tenantId: string | null;
  subjectReferenceHash: string | null;
  encounterOrWorkflowReference: string;
  requestingActor: ContextPacketRequest["requestingActor"];
  operatingMode: ClinicalContextLensMode;
  relevantHistory: string[];
  patientFit: ClinicalContextLensInput["patientFit"];
  supportingEvidence: string[];
  sources: ClinicalContextLensSource[];
  provenance: Array<{ sourceId: string; provenanceHash: string }>;
  freshness: ClinicalContextLensResult["freshness"];
  missingData: string[];
  confidenceScore: number;
  calibrationStatus: ClinicalContextLensInput["calibrationStatus"];
  contraindications: string[];
  policyConstraints: string[];
  recommendedNextAction: string | null;
  requiredReviewLevel: "none" | "qualified-human-review" | "clinical-authority-review";
  abstentionReason: string | null;
  versions: ContextPacketRequest["versions"];
  correlationId: string;
  traceId: string;
  actionAuthority: "decision-support-only";
  containsPhi: false;
  auditHash: string;
  boundary: typeof clinicalEvidenceControlsBoundary;
};

export const clinicalContextIsolationPolicy = {
  policyVersion: clinicalEvidenceControlsVersion,
  modes: {
    publicEvidence: {
      mode: "public-evidence" as const,
      allowedDataClasses: ["public"] as const,
      externalResearchAllowed: true,
      phiAllowed: false,
      patientSpecificActionAllowed: false
    },
    clinicalContext: {
      mode: "clinical-context" as const,
      allowedDataClasses: ["metadata", "synthetic-deidentified"] as const,
      authenticated: true,
      tenantScoped: true,
      minimumNecessary: true,
      consentVerified: true,
      humanReviewRequired: true,
      livePhiEnabled: false
    }
  },
  retrievedContentIsInstructions: false,
  unsupportedOrStaleContextAction: "abstain-or-require-review" as const,
  boundary: clinicalEvidenceControlsBoundary
} as const;

export type CaseEvidenceOutcome = {
  metricId: string;
  category: "clinical" | "operational" | "financial" | "patient-reported";
  baselineValue: number | null;
  observedValue: number | null;
  unit: string;
  observedAt: string;
  sourceRef: string;
  interpretation: "descriptive-only";
};

export type CaseEvidenceRuntimeAuthorization = {
  assuranceLevel:
    | "CAL_0_PUBLIC_ZERO_PHI"
    | "CAL_1_STANDARD_PHI"
    | "CAL_2_RESTRICTED_CLINICAL"
    | "CAL_3_SOVEREIGN_ISOLATED";
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

export type CaseEvidenceInput = {
  tenantId: string;
  siteId: string;
  syntheticCaseId: string;
  workflowCaseId: string;
  workflowId: string;
  cohortDefinition: string;
  eligibilityCriteria: string[];
  baselineComparator: string;
  intervention: {
    label: string;
    startedAt: string;
    completedAt: string | null;
  };
  eventTimestamps: {
    eligibleAt: string;
    baselineObservedAt: string;
    interventionStartedAt: string;
    dispositionedAt: string;
  };
  sourceLineage: string[];
  versions: {
    model: string;
    prompt: string;
    tools: string[];
    policy: string;
  };
  clinicianAction: "awaiting-review" | "accepted" | "modified" | "overrode" | "not-applicable";
  overrideReasonCode: string | null;
  workflowDisposition: "prepared-for-review" | "accepted-for-internal-use" | "changes-requested" | "blocked";
  outcomes: CaseEvidenceOutcome[];
  patientReportedOutcomes: CaseEvidenceOutcome[];
  safetyEventCodes: string[];
  missingness: string[];
  confounders: string[];
  siteAttributes: string[];
  subgroupAttributes: string[];
  latencyMs: number;
  utilizationCount: number;
  adoptionStatus: "not-measured" | "offered" | "accepted" | "modified" | "rejected";
  costPerAcceptedOutcomeUsd: number | null;
  traceId: string;
  correlationId: string;
  governance: {
    consentStatus: "not-applicable-synthetic" | "verified" | "missing";
    duaStatus: "not-applicable-single-tenant" | "verified" | "missing";
    aggregationAuthorization: "single-tenant-only" | "explicit-approved" | "not-authorized";
    purposeOfUse: string;
  };
  runtimeAuthorization?: CaseEvidenceRuntimeAuthorization;
  analysisPlanStatus: "draft" | "approved-for-synthetic-analysis";
  trustQaStatus: "not-reviewed" | "review-required" | "approved-for-internal-synthetic-use";
  humanReviewRequired: true;
  syntheticOnly: true;
  noPhi: true;
};

export type CaseEvidencePacket = {
  schemaVersion: typeof clinicalEvidenceControlsVersion;
  tenantIdHash: string;
  siteIdHash: string;
  caseIdHash: string;
  workflowCaseIdHash: string;
  workflowId: string;
  cohortDefinition: string;
  eligibilityCriteria: string[];
  baselineComparator: string;
  intervention: CaseEvidenceInput["intervention"];
  eventTimestamps: CaseEvidenceInput["eventTimestamps"];
  sourceLineage: string[];
  versions: CaseEvidenceInput["versions"];
  clinicianAction: CaseEvidenceInput["clinicianAction"];
  overrideReasonCode: string | null;
  workflowDisposition: CaseEvidenceInput["workflowDisposition"];
  outcomes: CaseEvidenceOutcome[];
  patientReportedOutcomes: CaseEvidenceOutcome[];
  safetyEventCodes: string[];
  missingness: string[];
  confounders: string[];
  siteAttributes: string[];
  subgroupAttributes: string[];
  latencyMs: number;
  utilizationCount: number;
  adoptionStatus: CaseEvidenceInput["adoptionStatus"];
  costPerAcceptedOutcomeUsd: number | null;
  traceId: string;
  correlationId: string;
  governance: CaseEvidenceInput["governance"];
  runtimeAuthorization: CaseEvidenceRuntimeAuthorization | null;
  analysisPlanStatus: CaseEvidenceInput["analysisPlanStatus"];
  trustQaStatus: CaseEvidenceInput["trustQaStatus"];
  humanReviewRequired: true;
  causalClaimAllowed: false;
  externalDistributionAllowed: false;
  syntheticOnly: true;
  noPhi: true;
  generatedAt: string;
  completeness: CaseEvidenceCompleteness;
  evidencePacketHash: string;
  boundary: typeof clinicalEvidenceControlsBoundary;
};

export type CaseEvidenceCompleteness = {
  requiredSectionCount: number;
  completeSectionCount: number;
  completenessPercent: number;
  missingSections: string[];
  complete: boolean;
};

export type CaseEvidenceEvent = {
  eventId: string;
  eventType: "case-evidence-recorded";
  sequence: number;
  tenantIdHash: string;
  packetHash: string;
  previousEventHash: string | null;
  occurredAt: string;
  eventHash: string;
  packet: CaseEvidencePacket;
};

export type CaseEvidenceAppendResult = {
  status: "appended" | "duplicate";
  event: CaseEvidenceEvent;
};

export type DomainStressMetric =
  | "rank-correlation"
  | "calibration-error"
  | "selective-accuracy"
  | "precision"
  | "recall"
  | "f1"
  | "extraction-accuracy"
  | "citation-completeness"
  | "grounding-accuracy"
  | "abstention-performance"
  | "override-rate"
  | "safety-event-rate"
  | "accepted-outcome-rate"
  | "latency"
  | "cost-per-accepted-outcome"
  | "time-per-accepted-outcome";

export type DomainStressCell = {
  cellId: string;
  task: string;
  diseaseSubtype: string;
  patientSubgroup: string;
  site: string;
  modality: string;
  language: string;
  workflowState: string;
  riskLevel: "low" | "moderate" | "high";
  metric: DomainStressMetric;
  direction: "higher-is-better" | "lower-is-better";
  value: number;
  threshold: number;
  sampleSize: number;
  minimumSampleSize: number;
  evidenceComplete: boolean;
  humanReviewComplete: boolean;
  material: boolean;
};

export type DomainStressCellDecision = DomainStressCell & {
  passedThreshold: boolean;
  sparse: boolean;
  status: "pass" | "human-review" | "restricted" | "blocked";
  reasons: string[];
};

export type WorstCellReleaseGate = {
  policyVersion: typeof clinicalEvidenceControlsVersion;
  releaseBasis: "worst-material-cell";
  decision: "synthetic-evaluation-ready" | "restricted" | "blocked";
  eligibleForClinicalAuthority: false;
  globalAverageMayOverride: false;
  worstMaterialCell: DomainStressCellDecision | null;
  cells: DomainStressCellDecision[];
  summary: {
    total: number;
    material: number;
    passing: number;
    sparse: number;
    requiringReview: number;
    blocked: number;
  };
  requiredActions: string[];
  auditHash: string;
  boundary: typeof clinicalEvidenceControlsBoundary;
};

const sha256Constants = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
  0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
  0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
  0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
  0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
  0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
] as const;

function stableSerialize(value: unknown): string {
  if (value === undefined) return "undefined";
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableSerialize).join(",")}]`;

  return `{${Object.entries(value as Record<string, unknown>)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, item]) => `${JSON.stringify(key)}:${stableSerialize(item)}`)
    .join(",")}}`;
}

function rotateRight(value: number, amount: number) {
  return (value >>> amount) | (value << (32 - amount));
}

export function createClinicalEvidenceHash(value: unknown) {
  const bytes = new TextEncoder().encode(stableSerialize(value));
  const bitLength = bytes.length * 8;
  const paddedLength = Math.ceil((bytes.length + 9) / 64) * 64;
  const padded = new Uint8Array(paddedLength);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(paddedLength - 8, Math.floor(bitLength / 0x100000000), false);
  view.setUint32(paddedLength - 4, bitLength >>> 0, false);

  const state = new Uint32Array([
    0x6a09e667,
    0xbb67ae85,
    0x3c6ef372,
    0xa54ff53a,
    0x510e527f,
    0x9b05688c,
    0x1f83d9ab,
    0x5be0cd19
  ]);
  const words = new Uint32Array(64);

  for (let offset = 0; offset < paddedLength; offset += 64) {
    for (let index = 0; index < 16; index += 1) {
      words[index] = view.getUint32(offset + index * 4, false);
    }
    for (let index = 16; index < 64; index += 1) {
      const left = words[index - 15];
      const right = words[index - 2];
      const sigma0 = rotateRight(left, 7) ^ rotateRight(left, 18) ^ (left >>> 3);
      const sigma1 = rotateRight(right, 17) ^ rotateRight(right, 19) ^ (right >>> 10);
      words[index] = (words[index - 16] + sigma0 + words[index - 7] + sigma1) >>> 0;
    }

    let [a, b, c, d, e, f, g, h] = state;
    for (let index = 0; index < 64; index += 1) {
      const sum1 = rotateRight(e, 6) ^ rotateRight(e, 11) ^ rotateRight(e, 25);
      const choose = (e & f) ^ (~e & g);
      const temporary1 = (h + sum1 + choose + sha256Constants[index] + words[index]) >>> 0;
      const sum0 = rotateRight(a, 2) ^ rotateRight(a, 13) ^ rotateRight(a, 22);
      const majority = (a & b) ^ (a & c) ^ (b & c);
      const temporary2 = (sum0 + majority) >>> 0;
      h = g;
      g = f;
      f = e;
      e = (d + temporary1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temporary1 + temporary2) >>> 0;
    }

    state[0] = (state[0] + a) >>> 0;
    state[1] = (state[1] + b) >>> 0;
    state[2] = (state[2] + c) >>> 0;
    state[3] = (state[3] + d) >>> 0;
    state[4] = (state[4] + e) >>> 0;
    state[5] = (state[5] + f) >>> 0;
    state[6] = (state[6] + g) >>> 0;
    state[7] = (state[7] + h) >>> 0;
  }

  return Array.from(state, (word) => word.toString(16).padStart(8, "0")).join("");
}

function hash(value: unknown) {
  return createClinicalEvidenceHash(value);
}

function isIsoTimestamp(value: string) {
  return Number.isFinite(Date.parse(value));
}

function isSafeReference(value: string) {
  return /^[a-z0-9][a-z0-9._:/-]{2,180}$/i.test(value) && !/bearer|token|secret|password/i.test(value);
}

const prohibitedSensitiveValuePatterns = [
  /\bbearer\s+[a-z0-9._~-]+/i,
  /\beyJ[a-z0-9_-]+\.[a-z0-9_-]+\.[a-z0-9_-]+\b/i,
  /\b(?:secret|password|access[_ -]?token|service[_ -]?role[_ -]?key)\s*[:=]/i,
  /\b\d{3}-\d{2}-\d{4}\b/,
  /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/i,
  /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/,
  /\b(?:mrn|medical record number|member id|subscriber id|policy id|patient name|date of birth|dob)\s*[:#=]/i
];

function containsProhibitedSensitiveValue(value: unknown) {
  const serialized = JSON.stringify(value ?? "");
  return prohibitedSensitiveValuePatterns.some((pattern) => pattern.test(serialized));
}

function contextSourceIsCurrent(source: ClinicalContextLensSource, evaluatedAt: string) {
  const effective = Date.parse(source.effectiveAt);
  const expires = source.expiresAt ? Date.parse(source.expiresAt) : Number.POSITIVE_INFINITY;
  const evaluated = Date.parse(evaluatedAt);
  const expirationValid = source.expiresAt === null || Number.isFinite(expires);
  return Number.isFinite(effective) && expirationValid && effective <= evaluated && expires >= evaluated;
}

export function evaluateClinicalContextLens(
  input: ClinicalContextLensInput,
  evaluatedAt = new Date().toISOString()
): ClinicalContextLensResult {
  const blockers: string[] = [];
  const abstentionReasons: string[] = [];

  if (!isIsoTimestamp(evaluatedAt)) blockers.push("evaluation timestamp is invalid");
  if (containsProhibitedSensitiveValue(input)) {
    blockers.push("Context Lens input contains prohibited PHI or credential-like material");
  }
  if (input.dataClassification === "phi") blockers.push("live PHI is disabled in the current Context Lens");
  if (input.mode === "public-evidence" && input.tenantId !== null) {
    blockers.push("Public Evidence mode cannot bind a clinical tenant");
  }
  if (input.mode === "public-evidence" && input.dataClassification !== "public") {
    blockers.push("Public Evidence mode accepts public sources only");
  }
  if (input.mode === "public-evidence" && input.sources.some((source) => source.tenantScope !== "public")) {
    blockers.push("Public Evidence mode accepts public-bound sources only");
  }
  if (
    input.mode === "clinical-context" &&
    (!input.tenantId ||
      !isSafeReference(input.tenantId) ||
      !input.authenticated ||
      !input.tenantScoped ||
      !input.minimumNecessary ||
      !input.consentVerified)
  ) {
    blockers.push("Clinical Context mode requires authenticated, consented, minimum-necessary tenant scope");
  }
  if (
    input.mode === "clinical-context" &&
    input.tenantId &&
    input.sources.some((source) => source.tenantScope !== input.tenantId)
  ) {
    blockers.push("Clinical Context sources do not match the requesting tenant");
  }
  if (input.mode === "clinical-context" && !input.humanReviewRequired) {
    blockers.push("Clinical Context mode cannot disable human review");
  }
  if (input.sources.length === 0) abstentionReasons.push("no supporting sources");
  if (input.sources.some((source) => source.trustTier === "unverified")) {
    abstentionReasons.push("one or more sources are unverified");
  }
  if (
    input.sources.some(
      (source) => !isSafeReference(source.uri) || !/^[a-f0-9]{64}$/i.test(source.provenanceHash)
    )
  ) {
    blockers.push("source URI or provenance hash is invalid");
  }
  if (input.confidenceScore < 0 || input.confidenceScore > 1) blockers.push("confidence score must be between 0 and 1");
  if (input.confidenceScore < 0.65) abstentionReasons.push("confidence is below the review threshold");
  if (input.calibrationStatus === "insufficient-evidence") {
    abstentionReasons.push("calibration evidence is insufficient");
  }

  const staleSourceIds = input.sources
    .filter((source) => Date.parse(source.effectiveAt) > Date.parse(evaluatedAt))
    .map((source) => source.id);
  const expiredSourceIds = input.sources
    .filter((source) => source.expiresAt && Date.parse(source.expiresAt) < Date.parse(evaluatedAt))
    .map((source) => source.id);
  if (input.sources.some((source) => !contextSourceIsCurrent(source, evaluatedAt))) {
    abstentionReasons.push("supporting context is stale, expired, or not yet effective");
  }

  const status: ClinicalContextLensResult["status"] = blockers.length
    ? "blocked"
    : abstentionReasons.length
      ? "abstained"
      : input.missingData.length > 0 || input.mode === "clinical-context"
        ? "review-required"
        : "context-ready";
  const nextAction = status === "blocked" || status === "abstained" ? null : input.proposedNextAction;
  const actionReason = status === "blocked"
    ? blockers.join("; ")
    : status === "abstained"
      ? abstentionReasons.join("; ")
      : "Current supporting sources, policy constraints, and missing-data state permit decision-support review only.";
  const auditInput = {
    version: clinicalEvidenceControlsVersion,
    status,
    mode: input.mode,
    taskType: input.taskType,
    sourceIds: input.sources.map((source) => source.id),
    sourceHashes: input.sources.map((source) => source.provenanceHash),
    missingData: input.missingData,
    confidenceScore: input.confidenceScore,
    evaluatedAt,
    blockers,
    abstentionReasons
  };

  return {
    status,
    mode: input.mode,
    taskType: input.taskType,
    patientFit: input.patientFit,
    relevantHistory: input.relevantHistory,
    sources: input.sources,
    freshness: {
      evaluatedAt,
      staleSourceIds,
      expiredSourceIds,
      allCurrent: staleSourceIds.length === 0 && expiredSourceIds.length === 0
    },
    missingData: input.missingData,
    confidenceScore: input.confidenceScore,
    calibrationStatus: input.calibrationStatus,
    contraindications: input.contraindications,
    policyConstraints: input.policyConstraints,
    nextAction,
    actionReason,
    humanReviewRequired: input.mode === "clinical-context" || input.humanReviewRequired,
    abstentionReasons: [...blockers, ...abstentionReasons],
    actionAuthority: "decision-support-only",
    containsPhi: false,
    auditHash: hash(auditInput),
    boundary: clinicalEvidenceControlsBoundary
  };
}

export function buildContextPacket(
  input: ContextPacketRequest,
  evaluatedAt = new Date().toISOString()
): ContextPacket {
  const contractErrors: string[] = [];
  if (input.operatingMode !== input.lensInput.mode) {
    contractErrors.push("operating mode must match the Context Lens mode");
  }
  if (input.tenantId !== input.lensInput.tenantId) {
    contractErrors.push("ContextPacket tenant must match the Context Lens tenant");
  }
  if (!isSafeReference(input.encounterOrWorkflowReference)) {
    contractErrors.push("encounter or workflow reference is invalid");
  }
  if (
    !isSafeReference(input.requestingActor.actorId) ||
    !isSafeReference(input.requestingActor.role) ||
    !isSafeReference(input.requestingActor.purposeOfUse)
  ) {
    contractErrors.push("requesting actor metadata is invalid");
  }
  if (!isSafeReference(input.correlationId) || !isSafeReference(input.traceId)) {
    contractErrors.push("correlation and trace identifiers must be safe metadata references");
  }
  if (input.operatingMode === "public-evidence") {
    if (input.tenantId !== null) contractErrors.push("Public Evidence mode cannot bind a clinical tenant");
    if (input.subjectReference?.kind !== "public-topic" && input.subjectReference !== null) {
      contractErrors.push("Public Evidence mode cannot bind a patient or workflow subject");
    }
  } else {
    if (!input.tenantId || !isSafeReference(input.tenantId)) {
      contractErrors.push("Clinical Context mode requires a valid tenant scope");
    }
    if (!input.subjectReference || input.subjectReference.kind === "public-topic") {
      contractErrors.push("Clinical Context mode requires a synthetic patient or workflow subject");
    }
  }
  if (input.subjectReference && !isSafeReference(input.subjectReference.reference)) {
    contractErrors.push("subject reference is invalid");
  }
  if (!input.supportingEvidence.every(isSafeReference)) {
    contractErrors.push("supporting evidence contains an unsafe reference");
  }
  if (!input.contradictoryEvidenceSourceIds.every(isSafeReference)) {
    contractErrors.push("contradictory evidence contains an unsafe reference");
  }
  if (contractErrors.length > 0) {
    throw new Error(`Invalid ContextPacket request: ${contractErrors.join("; ")}`);
  }

  const lens = evaluateClinicalContextLens(input.lensInput, evaluatedAt);
  const contradictions = input.contradictoryEvidenceSourceIds;
  const abstentionReasons = [
    ...lens.abstentionReasons,
    ...(contradictions.length > 0 ? ["supporting sources contain unresolved contradictions"] : [])
  ];
  const recommendedNextAction =
    lens.status === "blocked" || lens.status === "abstained" || contradictions.length > 0
      ? null
      : lens.nextAction;
  const requiredReviewLevel: ContextPacket["requiredReviewLevel"] =
    input.operatingMode === "clinical-context"
      ? "clinical-authority-review"
      : abstentionReasons.length > 0 || lens.humanReviewRequired
        ? "qualified-human-review"
        : "none";
  const subjectReferenceHash = input.subjectReference
    ? hash({ kind: input.subjectReference.kind, reference: input.subjectReference.reference })
    : null;
  const auditInput = {
    schemaVersion: clinicalEvidenceControlsVersion,
    tenantId: input.tenantId,
    subjectReferenceHash,
    encounterOrWorkflowReference: input.encounterOrWorkflowReference,
    actorId: input.requestingActor.actorId,
    role: input.requestingActor.role,
    purposeOfUse: input.requestingActor.purposeOfUse,
    operatingMode: input.operatingMode,
    sourceIds: lens.sources.map((source) => source.id),
    supportingEvidence: input.supportingEvidence,
    contradictions,
    recommendedNextAction,
    requiredReviewLevel,
    versions: input.versions,
    correlationId: input.correlationId,
    traceId: input.traceId,
    evaluatedAt
  };

  return {
    schemaVersion: clinicalEvidenceControlsVersion,
    tenantId: input.tenantId,
    subjectReferenceHash,
    encounterOrWorkflowReference: input.encounterOrWorkflowReference,
    requestingActor: input.requestingActor,
    operatingMode: input.operatingMode,
    relevantHistory: lens.relevantHistory,
    patientFit: lens.patientFit,
    supportingEvidence: input.supportingEvidence,
    sources: lens.sources,
    provenance: lens.sources.map((source) => ({
      sourceId: source.id,
      provenanceHash: source.provenanceHash
    })),
    freshness: lens.freshness,
    missingData: lens.missingData,
    confidenceScore: lens.confidenceScore,
    calibrationStatus: lens.calibrationStatus,
    contraindications: lens.contraindications,
    policyConstraints: lens.policyConstraints,
    recommendedNextAction,
    requiredReviewLevel,
    abstentionReason: abstentionReasons.length > 0 ? abstentionReasons.join("; ") : null,
    versions: input.versions,
    correlationId: input.correlationId,
    traceId: input.traceId,
    actionAuthority: "decision-support-only",
    containsPhi: false,
    auditHash: hash(auditInput),
    boundary: clinicalEvidenceControlsBoundary
  };
}

function validateCaseEvidenceInput(input: CaseEvidenceInput) {
  const errors: string[] = [];
  if (containsProhibitedSensitiveValue(input)) {
    errors.push("case evidence contains prohibited PHI or credential-like material");
  }
  if (!isSafeReference(input.tenantId) || !isSafeReference(input.siteId)) {
    errors.push("tenantId and siteId must be safe scoped identifiers");
  }
  if (!/^synthetic-[a-z0-9-]{3,80}$/.test(input.syntheticCaseId)) {
    errors.push("syntheticCaseId must be a bounded synthetic identifier");
  }
  if (!isSafeReference(input.workflowCaseId) || !isSafeReference(input.workflowId)) {
    errors.push("workflow identifiers are invalid");
  }
  if (!input.syntheticOnly || !input.noPhi) errors.push("case evidence must be synthetic and no-PHI");
  if (!input.humanReviewRequired) errors.push("case evidence must require human review");
  if (input.sourceLineage.length === 0 || !input.sourceLineage.every(isSafeReference)) {
    errors.push("source lineage must contain safe references");
  }
  if (!isIsoTimestamp(input.intervention.startedAt)) errors.push("intervention start timestamp is invalid");
  if (input.intervention.completedAt && !isIsoTimestamp(input.intervention.completedAt)) {
    errors.push("intervention completion timestamp is invalid");
  }
  if (input.outcomes.some((outcome) => !isIsoTimestamp(outcome.observedAt) || !isSafeReference(outcome.sourceRef))) {
    errors.push("outcome timestamps and source references must be valid");
  }
  if (
    Object.values(input.eventTimestamps).some((timestamp) => !isIsoTimestamp(timestamp)) ||
    !isSafeReference(input.traceId) ||
    !isSafeReference(input.correlationId)
  ) {
    errors.push("event, trace, or correlation metadata is invalid");
  }
  if (!Number.isFinite(input.latencyMs) || input.latencyMs < 0 || !Number.isInteger(input.utilizationCount) || input.utilizationCount < 0) {
    errors.push("latency and utilization values must be non-negative");
  }
  if (input.costPerAcceptedOutcomeUsd !== null && (!Number.isFinite(input.costPerAcceptedOutcomeUsd) || input.costPerAcceptedOutcomeUsd < 0)) {
    errors.push("cost per accepted outcome must be null or non-negative");
  }
  if (!isSafeReference(input.governance.purposeOfUse)) {
    errors.push("governance purpose of use is invalid");
  }
  if (input.runtimeAuthorization) {
    const runtimeReferences = [
      input.runtimeAuthorization.policyDecisionId,
      input.runtimeAuthorization.capacityDecisionId,
      input.runtimeAuthorization.concentrationDecisionId,
      input.runtimeAuthorization.routingDecisionId,
      ...input.runtimeAuthorization.subgroupEvaluationIds,
      ...input.runtimeAuthorization.toolArtifactDigests,
      ...(input.runtimeAuthorization.enclaveId ? [input.runtimeAuthorization.enclaveId] : []),
      ...(input.runtimeAuthorization.modelPassportDigest ? [input.runtimeAuthorization.modelPassportDigest] : []),
      ...(input.runtimeAuthorization.fallbackPassportDigest ? [input.runtimeAuthorization.fallbackPassportDigest] : [])
    ];
    if (!runtimeReferences.every(isSafeReference)) {
      errors.push("runtime authorization references are invalid");
    }
    if (
      !Number.isFinite(input.runtimeAuthorization.queueTimeMs) ||
      input.runtimeAuthorization.queueTimeMs < 0 ||
      !Number.isInteger(input.runtimeAuthorization.retryCount) ||
      input.runtimeAuthorization.retryCount < 0
    ) {
      errors.push("runtime authorization queue and retry metadata must be non-negative");
    }
  }
  return errors;
}

export function evaluateCaseEvidenceCompleteness(input: CaseEvidenceInput): CaseEvidenceCompleteness {
  const checks: Array<[string, boolean]> = [
    ["tenant-and-site", Boolean(input.tenantId && input.siteId)],
    ["workflow-and-case", Boolean(input.workflowId && input.workflowCaseId && input.syntheticCaseId)],
    ["cohort-and-eligibility", Boolean(input.cohortDefinition && input.eligibilityCriteria.length)],
    ["baseline-and-intervention", Boolean(input.baselineComparator && input.intervention.label)],
    ["event-timestamps", Object.values(input.eventTimestamps).every(isIsoTimestamp)],
    ["source-lineage", input.sourceLineage.length > 0],
    ["version-lineage", Boolean(input.versions.model && input.versions.prompt && input.versions.policy && input.versions.tools.length)],
    ["clinician-and-disposition", Boolean(input.clinicianAction && input.workflowDisposition)],
    ["outcomes", input.outcomes.length + input.patientReportedOutcomes.length > 0],
    ["safety-and-missingness", Array.isArray(input.safetyEventCodes) && Array.isArray(input.missingness)],
    ["confounders-and-subgroups", Boolean(input.confounders.length && input.siteAttributes.length && input.subgroupAttributes.length)],
    ["latency-utilization-adoption-cost", Number.isFinite(input.latencyMs) && Number.isInteger(input.utilizationCount)],
    ["trace-lineage", Boolean(input.traceId && input.correlationId)],
    ["governance", Boolean(input.governance.purposeOfUse && input.governance.aggregationAuthorization)],
    ["analysis-and-trust-qa", Boolean(input.analysisPlanStatus && input.trustQaStatus)]
  ];
  const missingSections = checks.filter(([, complete]) => !complete).map(([name]) => name);
  const completeSectionCount = checks.length - missingSections.length;

  return {
    requiredSectionCount: checks.length,
    completeSectionCount,
    completenessPercent: Math.round((completeSectionCount / checks.length) * 100),
    missingSections,
    complete: missingSections.length === 0
  };
}

export function buildCaseEvidencePacket(
  input: CaseEvidenceInput,
  generatedAt = new Date().toISOString()
): CaseEvidencePacket {
  const errors = validateCaseEvidenceInput(input);
  if (errors.length > 0 || !isIsoTimestamp(generatedAt)) {
    throw new Error(`Invalid synthetic case evidence input: ${[...errors, ...(!isIsoTimestamp(generatedAt) ? ["generatedAt is invalid"] : [])].join("; ")}`);
  }

  const caseIdHash = hash({
    version: clinicalEvidenceControlsVersion,
    syntheticCaseId: input.syntheticCaseId,
    workflowId: input.workflowId
  });
  const completeness = evaluateCaseEvidenceCompleteness(input);
  if (!completeness.complete) {
    throw new Error(`Invalid synthetic case evidence input: incomplete sections ${completeness.missingSections.join(", ")}`);
  }
  const packetWithoutHash: Omit<CaseEvidencePacket, "evidencePacketHash"> = {
    schemaVersion: clinicalEvidenceControlsVersion,
    tenantIdHash: hash({ tenantId: input.tenantId }),
    siteIdHash: hash({ tenantId: input.tenantId, siteId: input.siteId }),
    caseIdHash,
    workflowCaseIdHash: hash({ tenantId: input.tenantId, workflowCaseId: input.workflowCaseId }),
    workflowId: input.workflowId,
    cohortDefinition: input.cohortDefinition,
    eligibilityCriteria: input.eligibilityCriteria,
    baselineComparator: input.baselineComparator,
    intervention: input.intervention,
    eventTimestamps: input.eventTimestamps,
    sourceLineage: input.sourceLineage,
    versions: input.versions,
    clinicianAction: input.clinicianAction,
    overrideReasonCode: input.overrideReasonCode,
    workflowDisposition: input.workflowDisposition,
    outcomes: input.outcomes,
    patientReportedOutcomes: input.patientReportedOutcomes,
    safetyEventCodes: input.safetyEventCodes,
    missingness: input.missingness,
    confounders: input.confounders,
    siteAttributes: input.siteAttributes,
    subgroupAttributes: input.subgroupAttributes,
    latencyMs: input.latencyMs,
    utilizationCount: input.utilizationCount,
    adoptionStatus: input.adoptionStatus,
    costPerAcceptedOutcomeUsd: input.costPerAcceptedOutcomeUsd,
    traceId: input.traceId,
    correlationId: input.correlationId,
    governance: input.governance,
    runtimeAuthorization: input.runtimeAuthorization ?? null,
    analysisPlanStatus: input.analysisPlanStatus,
    trustQaStatus: input.trustQaStatus,
    humanReviewRequired: true as const,
    causalClaimAllowed: false as const,
    externalDistributionAllowed: false as const,
    syntheticOnly: true as const,
    noPhi: true as const,
    generatedAt,
    completeness,
    boundary: clinicalEvidenceControlsBoundary
  };

  return {
    ...packetWithoutHash,
    evidencePacketHash: hash(packetWithoutHash)
  };
}

export function buildCaseEvidenceEvent(
  packet: CaseEvidencePacket,
  input: { sequence?: number; previousEventHash?: string | null; occurredAt?: string } = {}
): CaseEvidenceEvent {
  if (!verifyCaseEvidencePacketIntegrity(packet)) {
    throw new Error("CaseEvidence packet integrity or safety verification failed");
  }
  const sequence = input.sequence ?? 1;
  const previousEventHash = input.previousEventHash ?? null;
  const occurredAt = input.occurredAt ?? packet.generatedAt;
  if (!Number.isInteger(sequence) || sequence < 1 || !isIsoTimestamp(occurredAt)) {
    throw new Error("Invalid CaseEvidence event sequence or timestamp");
  }
  if (previousEventHash !== null && !/^[a-f0-9]{64}$/i.test(previousEventHash)) {
    throw new Error("Invalid CaseEvidence previous event hash");
  }
  const eventWithoutHash = {
    eventId: `case-evidence-${packet.evidencePacketHash.slice(0, 24)}`,
    eventType: "case-evidence-recorded" as const,
    sequence,
    tenantIdHash: packet.tenantIdHash,
    packetHash: packet.evidencePacketHash,
    previousEventHash,
    occurredAt
  };

  return {
    ...eventWithoutHash,
    eventHash: hash(eventWithoutHash),
    packet
  };
}

export function verifyCaseEvidencePacketIntegrity(packet: CaseEvidencePacket) {
  const { evidencePacketHash, ...packetWithoutHash } = packet;
  const semanticSafetyValid =
    /^[a-f0-9]{64}$/i.test(evidencePacketHash) &&
    [packet.tenantIdHash, packet.siteIdHash, packet.caseIdHash, packet.workflowCaseIdHash].every((value) =>
      /^[a-f0-9]{64}$/i.test(value)
    ) &&
    packet.syntheticOnly === true &&
    packet.noPhi === true &&
    packet.humanReviewRequired === true &&
    packet.causalClaimAllowed === false &&
    packet.externalDistributionAllowed === false &&
    packet.completeness.complete === true &&
    packet.completeness.completenessPercent === 100 &&
    packet.sourceLineage.length > 0 &&
    packet.sourceLineage.every(isSafeReference) &&
    isSafeReference(packet.traceId) &&
    isSafeReference(packet.correlationId) &&
    !containsProhibitedSensitiveValue(packet);
  return semanticSafetyValid && hash(packetWithoutHash) === evidencePacketHash;
}

export class InMemoryCaseEvidenceEventStore {
  private readonly eventsByTenant = new Map<string, CaseEvidenceEvent[]>();

  append(packet: CaseEvidencePacket): CaseEvidenceAppendResult {
    if (!verifyCaseEvidencePacketIntegrity(packet)) {
      throw new Error("CaseEvidence packet integrity verification failed");
    }
    const existing = this.eventsByTenant.get(packet.tenantIdHash) ?? [];
    const duplicate = existing.find((event) => event.packetHash === packet.evidencePacketHash);
    if (duplicate) return { status: "duplicate", event: duplicate };

    const previous = existing.at(-1) ?? null;
    const event = buildCaseEvidenceEvent(packet, {
      sequence: existing.length + 1,
      previousEventHash: previous?.eventHash ?? null,
      occurredAt: packet.generatedAt
    });
    this.eventsByTenant.set(packet.tenantIdHash, [...existing, event]);
    return { status: "appended", event };
  }

  listForTenant(requestingTenantIdHash: string): readonly CaseEvidenceEvent[] {
    return [...(this.eventsByTenant.get(requestingTenantIdHash) ?? [])];
  }
}

export function evaluateCaseEvidenceAggregation(packets: CaseEvidencePacket[]) {
  const tenantHashes = new Set(packets.map((packet) => packet.tenantIdHash));
  const crossTenant = tenantHashes.size > 1;
  const integrityComplete = packets.every(verifyCaseEvidencePacketIntegrity);
  const baseGovernanceComplete = packets.every(
    (packet) =>
      packet.governance.consentStatus !== "missing" &&
      packet.governance.duaStatus !== "missing"
  );
  const aggregationScopeAuthorized = packets.every((packet) =>
    crossTenant
      ? packet.governance.aggregationAuthorization === "explicit-approved"
      : packet.governance.aggregationAuthorization === "single-tenant-only" ||
        packet.governance.aggregationAuthorization === "explicit-approved"
  );
  const governanceComplete = baseGovernanceComplete && aggregationScopeAuthorized;
  const allowed = packets.length > 0 && integrityComplete && governanceComplete;

  return {
    allowed,
    scope: crossTenant ? "cross-tenant" as const : "single-tenant" as const,
    analysisAuthority: allowed ? "internal-descriptive-analysis-only" as const : "blocked" as const,
    causalClaimAllowed: false as const,
    externalDistributionAllowed: false as const,
    reason: allowed
      ? "Consent, DUA, aggregation, and tenant-scope controls permit internal descriptive analysis only."
      : "Aggregation is blocked because tenant, consent, DUA, or governance authority is missing.",
    auditHash: hash({
      packetHashes: packets.map((packet) => packet.evidencePacketHash),
      crossTenant,
      integrityComplete,
      governanceComplete,
      allowed
    })
  };
}

export function exportCaseEvidenceForAnalysis(packet: CaseEvidencePacket) {
  if (!verifyCaseEvidencePacketIntegrity(packet)) {
    throw new Error("CaseEvidence packet is not eligible for analysis-ready export");
  }

  return {
    schemaVersion: packet.schemaVersion,
    tenantIdHash: packet.tenantIdHash,
    siteIdHash: packet.siteIdHash,
    caseIdHash: packet.caseIdHash,
    workflowCaseIdHash: packet.workflowCaseIdHash,
    workflowId: packet.workflowId,
    cohortDefinition: packet.cohortDefinition,
    eligibilityCriteria: packet.eligibilityCriteria,
    baselineComparator: packet.baselineComparator,
    intervention: packet.intervention,
    eventTimestamps: packet.eventTimestamps,
    versions: packet.versions,
    clinicianAction: packet.clinicianAction,
    workflowDisposition: packet.workflowDisposition,
    outcomeRows: [...packet.outcomes, ...packet.patientReportedOutcomes],
    safetyEventCodes: packet.safetyEventCodes,
    missingness: packet.missingness,
    confounders: packet.confounders,
    siteAttributes: packet.siteAttributes,
    subgroupAttributes: packet.subgroupAttributes,
    latencyMs: packet.latencyMs,
    utilizationCount: packet.utilizationCount,
    adoptionStatus: packet.adoptionStatus,
    costPerAcceptedOutcomeUsd: packet.costPerAcceptedOutcomeUsd,
    traceId: packet.traceId,
    correlationId: packet.correlationId,
    interpretation: "descriptive-only" as const,
    causalClaimAllowed: false as const,
    externalDistributionAllowed: false as const,
    evidencePacketHash: packet.evidencePacketHash
  };
}

function assessStressCell(cell: DomainStressCell): DomainStressCellDecision {
  const passedThreshold = cell.direction === "higher-is-better"
    ? cell.value >= cell.threshold
    : cell.value <= cell.threshold;
  const sparse = cell.sampleSize < cell.minimumSampleSize;
  const reasons: string[] = [];
  if (!passedThreshold) reasons.push("metric threshold failed");
  if (sparse) reasons.push("material cell is under-sampled");
  if (!cell.evidenceComplete) reasons.push("evidence is incomplete");
  if (cell.riskLevel === "high" && !cell.humanReviewComplete) {
    reasons.push("high-risk cell lacks completed human review");
  }

  const status: DomainStressCellDecision["status"] = !cell.material
    ? "pass"
    : !passedThreshold || !cell.evidenceComplete
      ? "blocked"
      : sparse
        ? "restricted"
        : cell.riskLevel === "high" && !cell.humanReviewComplete
          ? "human-review"
          : "pass";

  return { ...cell, passedThreshold, sparse, status, reasons };
}

const stressSeverity: Record<DomainStressCellDecision["status"], number> = {
  pass: 0,
  "human-review": 1,
  restricted: 2,
  blocked: 3
};

export function evaluateWorstCellReleaseGate(cells: DomainStressCell[]): WorstCellReleaseGate {
  const decisions = cells.map(assessStressCell);
  const materialCells = decisions.filter((cell) => cell.material);
  const worstMaterialCell = [...materialCells].sort((left, right) => {
    const severityDelta = stressSeverity[right.status] - stressSeverity[left.status];
    if (severityDelta !== 0) return severityDelta;
    const leftMargin = left.direction === "higher-is-better"
      ? left.value - left.threshold
      : left.threshold - left.value;
    const rightMargin = right.direction === "higher-is-better"
      ? right.value - right.threshold
      : right.threshold - right.value;
    return leftMargin - rightMargin || left.cellId.localeCompare(right.cellId);
  })[0] ?? null;
  const hasBlocked = materialCells.length === 0 || materialCells.some((cell) => cell.status === "blocked");
  const hasRestricted = materialCells.some((cell) => cell.status === "restricted" || cell.status === "human-review");
  const decision: WorstCellReleaseGate["decision"] = hasBlocked
    ? "blocked"
    : hasRestricted
      ? "restricted"
      : "synthetic-evaluation-ready";
  const requiredActions = Array.from(new Set([
    ...(materialCells.length === 0
      ? ["Block release until at least one material domain cell has complete evaluation evidence."]
      : []),
    ...materialCells.flatMap((cell) => {
    if (cell.status === "blocked") return [`Block release for ${cell.cellId}; correct evidence or performance and retest.`];
    if (cell.status === "restricted") return [`Restrict ${cell.cellId}; collect additional samples and retain uncertainty labeling.`];
    if (cell.status === "human-review") return [`Complete qualified human review for ${cell.cellId}.`];
    return [];
    })
  ]));
  const summary = {
    total: decisions.length,
    material: materialCells.length,
    passing: materialCells.filter((cell) => cell.status === "pass").length,
    sparse: materialCells.filter((cell) => cell.sparse).length,
    requiringReview: materialCells.filter((cell) => cell.status === "human-review").length,
    blocked: materialCells.filter((cell) => cell.status === "blocked").length
  };
  const auditInput = {
    policyVersion: clinicalEvidenceControlsVersion,
    decision,
    worstMaterialCellId: worstMaterialCell?.cellId ?? null,
    cellDecisions: decisions.map((cell) => ({
      cellId: cell.cellId,
      status: cell.status,
      value: cell.value,
      threshold: cell.threshold,
      sampleSize: cell.sampleSize
    }))
  };

  return {
    policyVersion: clinicalEvidenceControlsVersion,
    releaseBasis: "worst-material-cell",
    decision,
    eligibleForClinicalAuthority: false,
    globalAverageMayOverride: false,
    worstMaterialCell,
    cells: decisions,
    summary,
    requiredActions,
    auditHash: hash(auditInput),
    boundary: clinicalEvidenceControlsBoundary
  };
}
