import { createClinicalEvidenceHash } from "./clinicalEvidenceControls";
import type { CanonicalClinicalEntity, ClinicalDataFabricSourceKind } from "./clinicalDataFabric";

export const scrimedP32ClinicalDataViewsVersion = "scrimed-p32-clinical-data-views-v1-2026-07-20";

export const scrimedP32ClinicalDataViewsBoundary =
  "Clinical data views extend the SCRIMED Clinical Data Fabric with synthetic, no-PHI derived model-input views. Original structured sources remain systems of record; derived narratives never become authoritative records or authorize clinical, payer, or EHR action.";

export type ClinicalSourceChannel =
  | ClinicalDataFabricSourceKind
  | "sftp"
  | "payer-export"
  | "manual-document";

export type ClinicalControlStatus = "controlled" | "partially-controlled" | "uncontrolled" | "unknown";

export type CanonicalLongitudinalFact = {
  factId: string;
  tenantId: string;
  syntheticSubjectId: string;
  entity: CanonicalClinicalEntity;
  conceptCode: string;
  conceptSystem: string;
  source: {
    sourceId: string;
    channel: ClinicalSourceChannel;
    systemOfRecord: true;
    recordPointerHash: string;
    sourceDigest: string;
    sourceTimestamp: string;
    receivedAt: string;
  };
  transformation: {
    version: string;
    transformedAt: string;
    derived: true;
    confidence: number;
  };
  clinicalState: {
    severity: "mild" | "moderate" | "severe" | "critical" | "unknown";
    duration: string;
    temporalCourse: "new" | "improving" | "stable" | "worsening" | "resolved" | "unknown";
    controlStatus: ClinicalControlStatus;
    uncertainty: string[];
    measurements: Array<{ name: string; value: number; unit: string; observedAt: string }>;
  };
  syntheticOnly: true;
  noPhiConfirmed: true;
  provenanceHash: string;
};

export type LongitudinalDataQuality = {
  completeness: number;
  freshness: number;
  contradictionFree: number;
  unitIntegrity: number;
  duplicateFree: number;
  patientMatchConfidence: number;
  overall: number;
  issues: string[];
  humanReviewRequired: boolean;
  auditHash: string;
};

export type SerializationStrategy = "raw-structured" | "compact-structured" | "clinical-narrative";

export type SerializationBenchmark = {
  strategy: SerializationStrategy;
  payload: string;
  estimatedTokens: number;
  sourceLinkCoverage: number;
  temporalCoverage: number;
  measurementCoverage: number;
  safetyScore: number;
  estimatedLatencyClass: "fast" | "balanced" | "slow";
  estimatedCostClass: "low" | "medium" | "high";
  authoritativeRecord: false;
  auditHash: string;
};

export type ClinicalComplexityAssessment = {
  level: "simple" | "complex" | "high-risk-complex";
  materialFactCount: number;
  measurementCount: number;
  uncertaintyCount: number;
  severeOrCriticalFactCount: number;
  temporalChangeCount: number;
  reasonCodes: string[];
  prohibitedStrategies: SerializationStrategy[];
  humanReviewRequired: boolean;
  auditHash: string;
};

export type SafeSerializationSelection = {
  status: "SELECTED" | "SAFE_REFUSAL";
  selected: SerializationBenchmark | null;
  assessment: ClinicalComplexityAssessment;
  reasonCodes: string[];
  truncationAllowed: false;
  humanReviewRequired: boolean;
  auditHash: string;
};

export type ActionMeasureBinding = {
  measureId: string;
  measureFamily: "UDS" | "HEDIS" | "preventive-care" | "referral" | "no-show" | "social-needs" | "value-based-care";
  sourceFactIds: string[];
  workflowOwner: string;
  status: "draft" | "review-required" | "approved-internal-synthetic";
  externalSubmissionAllowed: false;
  clinicalActionAuthority: false;
  provenanceHash: string;
};

const directIdentifierPattern = /\b(?:\d{3}-\d{2}-\d{4}|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|(?:access|bearer|service[_ -]?role)[_ -]?(?:token|key)\s*[:=])\b/i;

function unitInterval(value: number) {
  return Number.isFinite(value) && value >= 0 && value <= 1;
}

export function buildCanonicalLongitudinalFact(
  input: Omit<CanonicalLongitudinalFact, "provenanceHash">
): CanonicalLongitudinalFact {
  if (!input.syntheticSubjectId.startsWith("synthetic-") || !input.syntheticOnly || !input.noPhiConfirmed) {
    throw new Error("Longitudinal clinical fixtures must be explicitly synthetic and no-PHI");
  }
  if (!input.tenantId || !input.factId || !input.source.sourceId || !input.source.sourceDigest || !input.source.recordPointerHash) {
    throw new Error("Longitudinal facts require tenant, fact, source, digest, and record-pointer attribution");
  }
  if (!unitInterval(input.transformation.confidence)) throw new Error("Transformation confidence must be between zero and one");
  if (directIdentifierPattern.test(JSON.stringify(input))) throw new Error("Longitudinal fact contains prohibited identifier or credential-like text");
  if (input.clinicalState.measurements.some((measurement) => !measurement.name || !measurement.unit || !Number.isFinite(measurement.value))) {
    throw new Error("Clinical measurements require a name, finite value, and unit");
  }
  return { ...input, provenanceHash: createClinicalEvidenceHash({ version: scrimedP32ClinicalDataViewsVersion, input }) };
}

export function readTenantLongitudinalFacts(tenantId: string, facts: CanonicalLongitudinalFact[]) {
  if (!tenantId || facts.some((fact) => fact.tenantId !== tenantId)) {
    throw new Error("Cross-tenant longitudinal fact access is denied");
  }
  return [...facts].sort((left, right) => left.factId.localeCompare(right.factId));
}

export function scoreLongitudinalDataQuality(input: {
  facts: CanonicalLongitudinalFact[];
  evaluatedAt: string;
  maximumFreshnessDays: number;
  contradictoryFactPairs: Array<[string, string]>;
  duplicateFactIds: string[];
  patientMatchConfidence: number;
}): LongitudinalDataQuality {
  if (!input.facts.length || !Number.isFinite(Date.parse(input.evaluatedAt)) || input.maximumFreshnessDays < 0) {
    throw new Error("Data-quality scoring requires facts, an evaluation timestamp, and a nonnegative freshness limit");
  }
  const now = Date.parse(input.evaluatedAt);
  const stale = input.facts.filter((fact) => now - Date.parse(fact.source.sourceTimestamp) > input.maximumFreshnessDays * 86_400_000);
  const missingCore = input.facts.filter((fact) => !fact.conceptCode || !fact.conceptSystem || !fact.clinicalState.duration);
  const missingUnits = input.facts.flatMap((fact) => fact.clinicalState.measurements.filter((measurement) => !measurement.unit));
  const uncertaintyCount = input.facts.reduce((count, fact) => count + fact.clinicalState.uncertainty.length, 0);
  const completeness = Math.max(0, 1 - ((missingCore.length + uncertaintyCount * 0.25) / input.facts.length));
  const freshness = Math.max(0, 1 - stale.length / input.facts.length);
  const contradictionFree = Math.max(0, 1 - input.contradictoryFactPairs.length / input.facts.length);
  const unitIntegrity = missingUnits.length ? 0 : 1;
  const duplicateFree = Math.max(0, 1 - input.duplicateFactIds.length / input.facts.length);
  const patientMatchConfidence = Math.max(0, Math.min(1, input.patientMatchConfidence));
  const overall = Number((
    completeness * 0.2 +
    freshness * 0.2 +
    contradictionFree * 0.2 +
    unitIntegrity * 0.15 +
    duplicateFree * 0.1 +
    patientMatchConfidence * 0.15
  ).toFixed(6));
  const issues = [
    ...(missingCore.length ? ["INCOMPLETE_CANONICAL_FACTS"] : []),
    ...(stale.length ? ["STALE_SOURCE_FACTS"] : []),
    ...(input.contradictoryFactPairs.length ? ["CONTRADICTORY_FACTS"] : []),
    ...(missingUnits.length ? ["MISSING_MEASUREMENT_UNITS"] : []),
    ...(input.duplicateFactIds.length ? ["DUPLICATE_FACTS"] : []),
    ...(patientMatchConfidence < 0.95 ? ["PATIENT_MATCH_REVIEW_REQUIRED"] : [])
  ];
  const withoutHash = {
    completeness: Number(completeness.toFixed(6)),
    freshness: Number(freshness.toFixed(6)),
    contradictionFree: Number(contradictionFree.toFixed(6)),
    unitIntegrity,
    duplicateFree: Number(duplicateFree.toFixed(6)),
    patientMatchConfidence,
    overall,
    issues,
    humanReviewRequired: issues.length > 0
  };
  return { ...withoutHash, auditHash: createClinicalEvidenceHash({ input, score: withoutHash }) };
}

function estimatedTokens(payload: string) {
  return Math.max(1, Math.ceil(payload.length / 4));
}

function buildPayload(strategy: SerializationStrategy, facts: CanonicalLongitudinalFact[]) {
  if (strategy === "raw-structured") return JSON.stringify(facts);
  if (strategy === "compact-structured") {
    return JSON.stringify(facts.map((fact) => ({
      id: fact.factId,
      source: fact.source.sourceId,
      code: `${fact.conceptSystem}|${fact.conceptCode}`,
      at: fact.source.sourceTimestamp,
      state: fact.clinicalState,
      confidence: fact.transformation.confidence,
      provenance: fact.provenanceHash
    })));
  }
  return facts.map((fact) => {
    const measurements = fact.clinicalState.measurements
      .map((measurement) => `${measurement.name}=${measurement.value} ${measurement.unit} at ${measurement.observedAt}`)
      .join("; ");
    return [
      `[${fact.factId}; source=${fact.source.sourceId}; provenance=${fact.provenanceHash}]`,
      `${fact.entity} ${fact.conceptSystem}|${fact.conceptCode}`,
      `source-time=${fact.source.sourceTimestamp}`,
      `severity=${fact.clinicalState.severity}`,
      `course=${fact.clinicalState.temporalCourse}`,
      `control=${fact.clinicalState.controlStatus}`,
      `duration=${fact.clinicalState.duration}`,
      measurements ? `measurements=${measurements}` : "measurements=none",
      fact.clinicalState.uncertainty.length ? `uncertainty=${fact.clinicalState.uncertainty.join(";")}` : "uncertainty=none"
    ].join(" | ");
  }).join("\n");
}

export function benchmarkClinicalSerialization(facts: CanonicalLongitudinalFact[]): SerializationBenchmark[] {
  if (!facts.length) throw new Error("Serialization benchmarking requires at least one canonical fact");
  const strategies: SerializationStrategy[] = ["raw-structured", "compact-structured", "clinical-narrative"];
  return strategies.map((strategy) => {
    const payload = buildPayload(strategy, facts);
    const sourceLinkCoverage = facts.every((fact) => payload.includes(fact.source.sourceId)) ? 1 : 0;
    const temporalCoverage = facts.every((fact) => payload.includes(fact.source.sourceTimestamp) || strategy === "raw-structured") ? 1 : 0;
    const measurementFacts = facts.filter((fact) => fact.clinicalState.measurements.length > 0);
    const measurementCoverage = measurementFacts.length === 0 || measurementFacts.every((fact) =>
      fact.clinicalState.measurements.every((measurement) => payload.includes(String(measurement.value)) && payload.includes(measurement.unit))
    ) ? 1 : 0;
    const safetyScore = Number(((sourceLinkCoverage + temporalCoverage + measurementCoverage) / 3).toFixed(6));
    const tokenCount = estimatedTokens(payload);
    const withoutHash = {
      strategy,
      payload,
      estimatedTokens: tokenCount,
      sourceLinkCoverage,
      temporalCoverage,
      measurementCoverage,
      safetyScore,
      estimatedLatencyClass: tokenCount < 500 ? "fast" as const : tokenCount < 2_000 ? "balanced" as const : "slow" as const,
      estimatedCostClass: tokenCount < 500 ? "low" as const : tokenCount < 2_000 ? "medium" as const : "high" as const,
      authoritativeRecord: false as const
    };
    return { ...withoutHash, auditHash: createClinicalEvidenceHash(withoutHash) };
  });
}

export function assessClinicalSerializationComplexity(
  facts: CanonicalLongitudinalFact[]
): ClinicalComplexityAssessment {
  if (!facts.length) throw new Error("Clinical complexity assessment requires canonical facts");
  const measurementCount = facts.reduce(
    (total, fact) => total + fact.clinicalState.measurements.length,
    0
  );
  const uncertaintyCount = facts.reduce(
    (total, fact) => total + fact.clinicalState.uncertainty.length,
    0
  );
  const severeOrCriticalFactCount = facts.filter((fact) =>
    ["severe", "critical"].includes(fact.clinicalState.severity)
  ).length;
  const temporalChangeCount = facts.filter((fact) =>
    ["new", "improving", "worsening", "resolved"].includes(
      fact.clinicalState.temporalCourse
    )
  ).length;
  const reasonCodes = [
    ...(facts.length >= 8 ? ["MANY_LONGITUDINAL_FACTS"] : []),
    ...(measurementCount >= 8 ? ["MEASUREMENT_DENSE"] : []),
    ...(uncertaintyCount > 0 ? ["CLINICAL_UNCERTAINTY_PRESENT"] : []),
    ...(severeOrCriticalFactCount > 0 ? ["SEVERE_OR_CRITICAL_STATE_PRESENT"] : []),
    ...(temporalChangeCount >= 3 ? ["TEMPORAL_CHANGE_DENSE"] : [])
  ];
  const highRisk = severeOrCriticalFactCount > 0 || uncertaintyCount >= 3;
  const complex = highRisk || reasonCodes.length >= 2;
  const level = highRisk
    ? "high-risk-complex" as const
    : complex
      ? "complex" as const
      : "simple" as const;
  const prohibitedStrategies: SerializationStrategy[] = highRisk
    ? ["compact-structured", "clinical-narrative"]
    : complex
      ? ["clinical-narrative"]
      : [];
  const withoutHash = {
    level,
    materialFactCount: facts.length,
    measurementCount,
    uncertaintyCount,
    severeOrCriticalFactCount,
    temporalChangeCount,
    reasonCodes: reasonCodes.length ? reasonCodes : ["BOUNDED_SIMPLE_CONTEXT"],
    prohibitedStrategies,
    humanReviewRequired: complex
  };
  return {
    ...withoutHash,
    auditHash: createClinicalEvidenceHash({
      version: scrimedP32ClinicalDataViewsVersion,
      facts: facts.map((fact) => fact.provenanceHash),
      result: withoutHash
    })
  };
}

export function selectSafeClinicalSerialization(input: {
  facts: CanonicalLongitudinalFact[];
  maximumContextTokens: number;
  validatedStrategies: SerializationStrategy[];
}): SafeSerializationSelection {
  if (!Number.isInteger(input.maximumContextTokens) || input.maximumContextTokens < 1) {
    throw new Error("Safe clinical serialization requires a positive integer context budget");
  }
  const assessment = assessClinicalSerializationComplexity(input.facts);
  const benchmarks = benchmarkClinicalSerialization(input.facts);
  const validated = new Set(input.validatedStrategies);
  const preference: SerializationStrategy[] = [
    "raw-structured",
    "compact-structured",
    "clinical-narrative"
  ];
  const eligible = preference
    .map((strategy) => benchmarks.find((benchmark) => benchmark.strategy === strategy))
    .filter((benchmark): benchmark is SerializationBenchmark => Boolean(benchmark))
    .filter((benchmark) => validated.has(benchmark.strategy))
    .filter((benchmark) => !assessment.prohibitedStrategies.includes(benchmark.strategy))
    .filter((benchmark) => benchmark.safetyScore === 1)
    .filter((benchmark) => benchmark.estimatedTokens <= input.maximumContextTokens);
  const selected = eligible[0] ?? null;
  const reasonCodes = selected
    ? ["VALIDATED_COMPLETE_SERIALIZATION_SELECTED"]
    : [
        "NO_VALIDATED_COMPLETE_SERIALIZATION_FITS_CONTEXT",
        ...(assessment.level !== "simple" ? ["COMPLEX_CONTEXT_CANNOT_BE_TRUNCATED"] : [])
      ];
  const withoutHash = {
    status: selected ? "SELECTED" as const : "SAFE_REFUSAL" as const,
    selected,
    assessment,
    reasonCodes,
    truncationAllowed: false as const,
    humanReviewRequired: assessment.humanReviewRequired || !selected
  };
  return {
    ...withoutHash,
    auditHash: createClinicalEvidenceHash({
      facts: input.facts.map((fact) => fact.provenanceHash),
      maximumContextTokens: input.maximumContextTokens,
      validatedStrategies: [...validated].sort(),
      result: withoutHash
    })
  };
}

export function buildActionMeasureBinding(input: Omit<ActionMeasureBinding, "provenanceHash" | "externalSubmissionAllowed" | "clinicalActionAuthority">): ActionMeasureBinding {
  if (!input.measureId || !input.workflowOwner || input.sourceFactIds.length === 0) {
    throw new Error("Action measures require an identifier, accountable workflow owner, and source facts");
  }
  const withoutHash = {
    ...input,
    externalSubmissionAllowed: false as const,
    clinicalActionAuthority: false as const
  };
  return { ...withoutHash, provenanceHash: createClinicalEvidenceHash(withoutHash) };
}
