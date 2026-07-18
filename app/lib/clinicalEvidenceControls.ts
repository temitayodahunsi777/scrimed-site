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
  trustTier: "authoritative" | "reviewed" | "unverified";
  effectiveAt: string;
  expiresAt: string | null;
  provenanceHash: string;
};

export type ClinicalContextLensInput = {
  mode: ClinicalContextLensMode;
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

export type CaseEvidenceInput = {
  syntheticCaseId: string;
  workflowId: string;
  cohortDefinition: string;
  eligibilityCriteria: string[];
  baselineComparator: string;
  intervention: {
    label: string;
    startedAt: string;
    completedAt: string | null;
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
  outcomes: CaseEvidenceOutcome[];
  safetyEventCodes: string[];
  missingness: string[];
  confounders: string[];
  siteAttributes: string[];
  subgroupAttributes: string[];
  analysisPlanStatus: "draft" | "approved-for-synthetic-analysis";
  trustQaStatus: "not-reviewed" | "review-required" | "approved-for-internal-synthetic-use";
  humanReviewRequired: true;
  syntheticOnly: true;
  noPhi: true;
};

export type CaseEvidencePacket = {
  schemaVersion: typeof clinicalEvidenceControlsVersion;
  caseIdHash: string;
  workflowId: string;
  cohortDefinition: string;
  eligibilityCriteria: string[];
  baselineComparator: string;
  intervention: CaseEvidenceInput["intervention"];
  sourceLineage: string[];
  versions: CaseEvidenceInput["versions"];
  clinicianAction: CaseEvidenceInput["clinicianAction"];
  overrideReasonCode: string | null;
  outcomes: CaseEvidenceOutcome[];
  safetyEventCodes: string[];
  missingness: string[];
  confounders: string[];
  siteAttributes: string[];
  subgroupAttributes: string[];
  analysisPlanStatus: CaseEvidenceInput["analysisPlanStatus"];
  trustQaStatus: CaseEvidenceInput["trustQaStatus"];
  humanReviewRequired: true;
  causalClaimAllowed: false;
  externalDistributionAllowed: false;
  syntheticOnly: true;
  noPhi: true;
  generatedAt: string;
  evidencePacketHash: string;
  boundary: typeof clinicalEvidenceControlsBoundary;
};

export type DomainStressMetric =
  | "rank-correlation"
  | "calibration-error"
  | "selective-accuracy"
  | "precision"
  | "recall"
  | "citation-completeness"
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
  if (input.dataClassification === "phi") blockers.push("live PHI is disabled in the current Context Lens");
  if (input.mode === "public-evidence" && input.dataClassification !== "public") {
    blockers.push("Public Evidence mode accepts public sources only");
  }
  if (
    input.mode === "clinical-context" &&
    (!input.authenticated || !input.tenantScoped || !input.minimumNecessary || !input.consentVerified)
  ) {
    blockers.push("Clinical Context mode requires authenticated, consented, minimum-necessary tenant scope");
  }
  if (input.mode === "clinical-context" && !input.humanReviewRequired) {
    blockers.push("Clinical Context mode cannot disable human review");
  }
  if (input.sources.length === 0) abstentionReasons.push("no supporting sources");
  if (input.sources.some((source) => source.trustTier === "unverified")) {
    abstentionReasons.push("one or more sources are unverified");
  }
  if (input.sources.some((source) => !isSafeReference(source.uri) || source.provenanceHash.length !== 64)) {
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

function validateCaseEvidenceInput(input: CaseEvidenceInput) {
  const errors: string[] = [];
  if (!/^synthetic-[a-z0-9-]{3,80}$/.test(input.syntheticCaseId)) {
    errors.push("syntheticCaseId must be a bounded synthetic identifier");
  }
  if (!isSafeReference(input.workflowId)) errors.push("workflowId is invalid");
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
  return errors;
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
  const packetWithoutHash: Omit<CaseEvidencePacket, "evidencePacketHash"> = {
    schemaVersion: clinicalEvidenceControlsVersion,
    caseIdHash,
    workflowId: input.workflowId,
    cohortDefinition: input.cohortDefinition,
    eligibilityCriteria: input.eligibilityCriteria,
    baselineComparator: input.baselineComparator,
    intervention: input.intervention,
    sourceLineage: input.sourceLineage,
    versions: input.versions,
    clinicianAction: input.clinicianAction,
    overrideReasonCode: input.overrideReasonCode,
    outcomes: input.outcomes,
    safetyEventCodes: input.safetyEventCodes,
    missingness: input.missingness,
    confounders: input.confounders,
    siteAttributes: input.siteAttributes,
    subgroupAttributes: input.subgroupAttributes,
    analysisPlanStatus: input.analysisPlanStatus,
    trustQaStatus: input.trustQaStatus,
    humanReviewRequired: true as const,
    causalClaimAllowed: false as const,
    externalDistributionAllowed: false as const,
    syntheticOnly: true as const,
    noPhi: true as const,
    generatedAt,
    boundary: clinicalEvidenceControlsBoundary
  };

  return {
    ...packetWithoutHash,
    evidencePacketHash: hash(packetWithoutHash)
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
  const hasBlocked = materialCells.some((cell) => cell.status === "blocked");
  const hasRestricted = materialCells.some((cell) => cell.status === "restricted" || cell.status === "human-review");
  const decision: WorstCellReleaseGate["decision"] = hasBlocked
    ? "blocked"
    : hasRestricted
      ? "restricted"
      : "synthetic-evaluation-ready";
  const requiredActions = Array.from(new Set(materialCells.flatMap((cell) => {
    if (cell.status === "blocked") return [`Block release for ${cell.cellId}; correct evidence or performance and retest.`];
    if (cell.status === "restricted") return [`Restrict ${cell.cellId}; collect additional samples and retain uncertainty labeling.`];
    if (cell.status === "human-review") return [`Complete qualified human review for ${cell.cellId}.`];
    return [];
  })));
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
