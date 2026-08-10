import { createAuditHash } from "./scrimed-work/audit";

export const scrimedP32OncologyIntelligenceVersion =
  "scrimed-p32-oncology-intelligence-v1-2026-07-28";

export const scrimedP32OncologyIntelligenceBoundary =
  "SCRIMED Onco-ID MRD intelligence preserves assay-specific units, versions, specimen context, and provenance. It supports clinician-reviewed evidence summaries and coverage preparation only. It does not order tests, combine noncomparable assays, diagnose, interpret MRD autonomously, select treatment, escalate care, submit payer requests, or write to clinical records.";

export type MRDTestProfile = {
  testProfileId: string;
  name: string;
  tumorTypes: string[];
  analyte: string;
  methodology: string;
  intendedUse: string;
  laboratory: string;
  regulatoryStatus: "unverified" | "research-use" | "documented-status-requires-review";
  reimbursementEvidenceIds: string[];
  profileHash: string;
};

export type MRDAssayVersion = {
  assayVersionId: string;
  testProfileId: string;
  version: string;
  limitOfDetection: number;
  limitOfDetectionUnit: string;
  reportingUnit: string;
  effectiveAt: string;
  retiredAt: string | null;
  assayFingerprint: string;
};

export type SpecimenProfile = {
  specimenProfileId: string;
  specimenType: string;
  collectionTiming: string;
  processingMethod: string;
  sourceReferenceHash: string;
  collectedAt: string;
  provenanceHash: string;
};

export type AssayComparabilityDecision = {
  decisionId: string;
  leftAssayVersionId: string;
  rightAssayVersionId: string;
  status: "validated-comparable" | "not-comparable" | "insufficient-evidence";
  allowedTransform: string | null;
  evidenceIds: string[];
  reviewerIdentityHash: string;
  reviewedAt: string;
  decisionHash: string;
};

export type LongitudinalMRDObservation = {
  observationId: string;
  assayVersionId: string;
  specimenProfileId: string;
  observedAt: string;
  value: number;
  unit: string;
  qualifier: "detected" | "not-detected" | "indeterminate";
  sourceReferenceHash: string;
  provenanceHash: string;
};

export type CoverageEvidence = {
  evidenceId: string;
  payerPolicyReference: string;
  policyVersion: string;
  effectiveAt: string;
  supportsPreparationOnly: true;
  coverageDeterminationAllowed: false;
  payerSubmissionAllowed: false;
  provenanceHash: string;
};

export type MRDClinicalReview = {
  reviewId: string;
  tenantId: string;
  clinicianIdentityHash: string;
  observationIds: string[];
  evidenceSummary: string;
  missingEvidence: string[];
  reviewState: "pending" | "reviewed-for-internal-evidence-support";
  reviewedAt: string | null;
  autonomousInterpretationAllowed: false;
  testOrderingAllowed: false;
  diagnosisAuthorityGranted: false;
  treatmentSelectionAllowed: false;
  payerSubmissionAllowed: false;
  ehrWritebackAllowed: false;
  reviewHash: string;
};

export type MRDTrendReview = {
  status: "reviewable" | "blocked-incompatible-assays";
  observations: LongitudinalMRDObservation[];
  assayVersionIds: string[];
  comparabilityDecisionIds: string[];
  preservedOriginalUnits: true;
  normalizedTrendProduced: boolean;
  reasonCodes: string[];
  humanReviewRequired: true;
  clinicalInterpretationAllowed: false;
  auditHash: string;
};

const hashPattern = /^[0-9a-f]{64}$/i;

function validIso(value: string) {
  return Number.isFinite(Date.parse(value));
}

function requireHash(value: string, label: string) {
  if (!hashPattern.test(value)) throw new Error(`${label} must be a SHA-256 digest`);
}

function canonical(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort();
}

export function isMrdIntelligenceEnabled(env: NodeJS.ProcessEnv = process.env) {
  return env.SCRIMED_MRD_INTELLIGENCE_ENABLED === "true";
}

export function createMrdTestProfile(
  input: Omit<MRDTestProfile, "profileHash">
): MRDTestProfile {
  if (!input.name.trim() || !input.tumorTypes.length || !input.methodology.trim() || !input.intendedUse.trim()) {
    throw new Error("MRD test profile requires tumor type, methodology, and intended use");
  }
  const base = {
    ...input,
    tumorTypes: canonical(input.tumorTypes),
    reimbursementEvidenceIds: canonical(input.reimbursementEvidenceIds)
  };
  return { ...base, profileHash: createAuditHash({ type: "mrd-test-profile", base }) };
}

export function createMrdAssayVersion(
  input: Omit<MRDAssayVersion, "assayFingerprint">
): MRDAssayVersion {
  if (
    !Number.isFinite(input.limitOfDetection) ||
    input.limitOfDetection < 0 ||
    !input.reportingUnit.trim() ||
    !validIso(input.effectiveAt) ||
    (input.retiredAt !== null && !validIso(input.retiredAt))
  ) {
    throw new Error("MRD assay version metadata is invalid");
  }
  const base = { ...input };
  return { ...base, assayFingerprint: createAuditHash({ type: "mrd-assay-version", base }) };
}

export function createSpecimenProfile(
  input: Omit<SpecimenProfile, "provenanceHash">
): SpecimenProfile {
  requireHash(input.sourceReferenceHash, "specimen source reference");
  if (!validIso(input.collectedAt)) throw new Error("Specimen timestamp is invalid");
  const base = { ...input };
  return { ...base, provenanceHash: createAuditHash({ type: "mrd-specimen-profile", base }) };
}

export function createAssayComparabilityDecision(
  input: Omit<AssayComparabilityDecision, "decisionHash">
): AssayComparabilityDecision {
  if (input.leftAssayVersionId === input.rightAssayVersionId) {
    throw new Error("Comparability decision is unnecessary for identical assay versions");
  }
  requireHash(input.reviewerIdentityHash, "comparability reviewer identity");
  if (!validIso(input.reviewedAt) || !input.evidenceIds.length) {
    throw new Error("Assay comparability requires named review, evidence, and time");
  }
  if (input.status === "validated-comparable" && !input.allowedTransform?.trim()) {
    throw new Error("Validated assay comparability requires a documented transform");
  }
  const base = { ...input, evidenceIds: canonical(input.evidenceIds) };
  return { ...base, decisionHash: createAuditHash({ type: "mrd-assay-comparability", base }) };
}

export function buildLongitudinalMrdTrend(input: {
  observations: LongitudinalMRDObservation[];
  assayVersions: MRDAssayVersion[];
  comparabilityDecisions: AssayComparabilityDecision[];
}): MRDTrendReview {
  if (!input.observations.length) throw new Error("MRD trend review requires observations");
  const assayById = new Map(input.assayVersions.map((assay) => [assay.assayVersionId, assay]));
  for (const observation of input.observations) {
    if (!assayById.has(observation.assayVersionId)) throw new Error("MRD observation references an unknown assay");
    requireHash(observation.sourceReferenceHash, "observation source reference");
    requireHash(observation.provenanceHash, "observation provenance");
    if (!validIso(observation.observedAt) || !Number.isFinite(observation.value)) {
      throw new Error("MRD observation metadata is invalid");
    }
    const assay = assayById.get(observation.assayVersionId)!;
    if (observation.unit !== assay.reportingUnit) {
      throw new Error("MRD observation must preserve its assay-specific reporting unit");
    }
  }
  const assayVersionIds = canonical(input.observations.map((observation) => observation.assayVersionId));
  const pairKeys = new Set(
    input.comparabilityDecisions
      .filter((decision) => decision.status === "validated-comparable")
      .flatMap((decision) => [
        `${decision.leftAssayVersionId}:${decision.rightAssayVersionId}`,
        `${decision.rightAssayVersionId}:${decision.leftAssayVersionId}`
      ])
  );
  const missingComparablePairs: string[] = [];
  for (let left = 0; left < assayVersionIds.length; left += 1) {
    for (let right = left + 1; right < assayVersionIds.length; right += 1) {
      if (!pairKeys.has(`${assayVersionIds[left]}:${assayVersionIds[right]}`)) {
        missingComparablePairs.push(`${assayVersionIds[left]}:${assayVersionIds[right]}`);
      }
    }
  }
  const blocked = missingComparablePairs.length > 0;
  const base = {
    status: blocked ? ("blocked-incompatible-assays" as const) : ("reviewable" as const),
    observations: [...input.observations].sort((left, right) => left.observedAt.localeCompare(right.observedAt)),
    assayVersionIds,
    comparabilityDecisionIds: canonical(input.comparabilityDecisions.map((decision) => decision.decisionId)),
    preservedOriginalUnits: true as const,
    normalizedTrendProduced: false,
    reasonCodes: blocked
      ? ["ASSAY_COMPARABILITY_REQUIRED", ...missingComparablePairs.map((pair) => `INCOMPATIBLE:${pair}`)]
      : assayVersionIds.length > 1
        ? ["ASSAY_COMPARABILITY_DOCUMENTED", "NORMALIZED_VALUE_TRANSFORM_REQUIRES_SEPARATE_VALIDATION"]
        : ["ASSAY_PROVENANCE_AND_COMPARABILITY_PRESERVED"],
    humanReviewRequired: true as const,
    clinicalInterpretationAllowed: false as const
  };
  return { ...base, auditHash: createAuditHash({ type: "mrd-trend-review", base }) };
}

export function buildMrdClinicalReview(
  input: Omit<
    MRDClinicalReview,
    | "autonomousInterpretationAllowed"
    | "testOrderingAllowed"
    | "diagnosisAuthorityGranted"
    | "treatmentSelectionAllowed"
    | "payerSubmissionAllowed"
    | "ehrWritebackAllowed"
    | "reviewHash"
  >
): MRDClinicalReview {
  requireHash(input.clinicianIdentityHash, "clinician identity");
  if (input.reviewState === "reviewed-for-internal-evidence-support" && !input.reviewedAt) {
    throw new Error("Reviewed MRD evidence requires a review timestamp");
  }
  const base = {
    ...input,
    observationIds: canonical(input.observationIds),
    missingEvidence: canonical(input.missingEvidence),
    autonomousInterpretationAllowed: false as const,
    testOrderingAllowed: false as const,
    diagnosisAuthorityGranted: false as const,
    treatmentSelectionAllowed: false as const,
    payerSubmissionAllowed: false as const,
    ehrWritebackAllowed: false as const
  };
  return { ...base, reviewHash: createAuditHash({ type: "mrd-clinical-review", base }) };
}

export function getOncologyIntelligenceSummary(env: NodeJS.ProcessEnv = process.env) {
  return {
    version: scrimedP32OncologyIntelligenceVersion,
    enabled: isMrdIntelligenceEnabled(env),
    mode: "synthetic-clinician-reviewed-evidence-support",
    assaySpecificUnitsPreserved: true,
    comparabilityRequired: true,
    autonomousInterpretationAllowed: false,
    treatmentSelectionAllowed: false,
    payerSubmissionAllowed: false,
    boundary: scrimedP32OncologyIntelligenceBoundary
  } as const;
}
