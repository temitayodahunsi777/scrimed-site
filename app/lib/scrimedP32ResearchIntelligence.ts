import { createAuditHash } from "./scrimed-work/audit";

export const scrimedP32ResearchIntelligenceVersion =
  "scrimed-p32-research-intelligence-v1-2026-07-28";

export const scrimedP32ResearchIntelligenceBoundary =
  "SCRIMED TrialCore failure intelligence and biological retrieval operate on public, governed deidentified, or synthetic research metadata. Hypotheses remain distinct from facts, contradictory and missing evidence remain visible, and named independent human review is required for decision-grade output. No enrollment, diagnosis, treatment selection, patient matching, live-PHI training, or clinical action is authorized.";

export type EvidenceClassification =
  | "FACT"
  | "INFERENCE"
  | "HYPOTHESIS"
  | "CONTRADICTION"
  | "UNKNOWN";

export type EvidenceAtom = {
  evidenceId: string;
  classification: EvidenceClassification;
  statement: string;
  sourceType: "official-registry" | "peer-reviewed-publication" | "sponsor-public-disclosure" | "other-public-source";
  sourceIdentifier: string;
  sourceUrl: string;
  sourceVersion: string;
  sourceSpan: string;
  publicationDate: string;
  retrievedAt: string;
  provenanceHash: string;
};

export type RegistryVersionHistory = {
  registryId: string;
  versions: Array<{
    versionId: string;
    observedAt: string;
    status: string;
    eligibilityDigest: string;
    endpointDigest: string;
    enrollment: number | null;
    completionDate: string | null;
    sourceHash: string;
  }>;
  changes: Array<{
    fromVersion: string;
    toVersion: string;
    changedFields: string[];
    changeHash: string;
  }>;
  historyHash: string;
};

export type TrialEvidenceSnapshot = {
  snapshotId: string;
  trialReference: {
    nctId: string | null;
    sponsor: string | null;
    title: string | null;
  };
  officialRegistryEvidenceIds: string[];
  publicationEvidenceIds: string[];
  evidenceAtoms: EvidenceAtom[];
  registryHistory: RegistryVersionHistory | null;
  capturedAt: string;
  modelVersion: string;
  promptVersion: string;
  toolVersion: string;
  schemaVersion: typeof scrimedP32ResearchIntelligenceVersion;
  evidenceFingerprint: string;
};

export type FailureHypothesis = {
  hypothesisId: string;
  category:
    | "efficacy"
    | "safety"
    | "endpoint-design"
    | "statistical-power"
    | "recruitment"
    | "eligibility"
    | "operational-execution"
    | "manufacturing"
    | "regulatory-change"
    | "commercial-discontinuation";
  statement: string;
  supportingEvidenceIds: string[];
  contradictingEvidenceIds: string[];
  confidence: number;
  renderedAsEstablishedFact: false;
};

export type ContradictoryEvidence = {
  contradictionId: string;
  evidenceIds: string[];
  summary: string;
  resolutionState: "unresolved" | "human-reviewed";
};

export type AlternativeExplanation = {
  explanationId: string;
  statement: string;
  evidenceIds: string[];
  status: "plausible-unverified" | "not-supported" | "human-reviewed";
};

export type MissingEvidence = {
  missingEvidenceId: string;
  description: string;
  materiality: "low" | "moderate" | "high";
  consequence: "limits-confidence" | "requires-abstention" | "requires-human-review";
};

export type ConfidenceBasis = {
  confidence: number;
  factCount: number;
  inferenceCount: number;
  hypothesisCount: number;
  contradictionCount: number;
  unknownCount: number;
  limitations: string[];
};

export type AdversarialReview = {
  reviewId: string;
  reviewerComponentId: string;
  challengedHypothesisIds: string[];
  unsupportedClaimIds: string[];
  omittedContradictionIds: string[];
  challengeSummary: string;
  completedAt: string;
  reviewHash: string;
};

export type HumanReviewDecision = {
  decisionId: string;
  reviewerIdentityHash: string;
  reviewerRole: "named-clinical-research-reviewer" | "named-scientific-reviewer";
  reviewerComponentId: string;
  decision: "approved-for-internal-research-use" | "changes-required" | "rejected";
  decidedAt: string;
  conditions: string[];
  decisionHash: string;
};

export type TrialFailureInvestigation = {
  investigationId: string;
  tenantId: string;
  producerComponentIds: string[];
  producerIdentityHashes: string[];
  snapshot: TrialEvidenceSnapshot;
  hypotheses: FailureHypothesis[];
  contradictions: ContradictoryEvidence[];
  alternativeExplanations: AlternativeExplanation[];
  missingEvidence: MissingEvidence[];
  confidenceBasis: ConfidenceBasis;
  adversarialReview: AdversarialReview;
  humanReview: HumanReviewDecision | null;
  status: "research-draft" | "awaiting-human-review" | "approved-internal-research" | "blocked";
  decisionGradeOutputAllowed: boolean;
  externalClaimAllowed: false;
  enrollmentActionAllowed: false;
  clinicalActionAllowed: false;
  auditHash: string;
};

export type AuthenticatedHumanReviewContext = {
  authenticatedIdentityHash: string;
  authenticatedComponentId: string;
  actorType: "human";
  assuranceLevel: "aal2";
  verifiedAt: string;
  authenticationEvidenceHash: string;
};

export interface ClinicalTrialsGovReadAdapter {
  readonly adapterId: string;
  readonly mode: "read-only";
  readonly externalCallsEnabled: boolean;
  getRegistrySnapshot(reference: string): Promise<TrialEvidenceSnapshot>;
}

export interface PubMedReadAdapter {
  readonly adapterId: string;
  readonly mode: "read-only";
  readonly externalCallsEnabled: boolean;
  getEvidenceAtoms(query: string): Promise<EvidenceAtom[]>;
}

export type ExpressionSignature = {
  signatureId: string;
  datasetAccession: string;
  studyId: string;
  sampleIdHash: string;
  organism: string;
  tissue: string;
  diseaseContext: string;
  assay: string;
  platform: string;
  laboratory: string;
  featureValues: Record<string, number>;
  sourceHash: string;
};

export type BiologicalDatasetManifest = {
  manifestId: string;
  sourceAccession: string;
  governance: "public" | "approved-deidentified";
  organism: string;
  tissues: string[];
  diseaseContexts: string[];
  assays: string[];
  platforms: string[];
  laboratories: string[];
  demographicMetadata: string[];
  containsLivePhi: false;
  manifestHash: string;
};

export type PreprocessingManifest = {
  preprocessingId: string;
  datasetAccession: string;
  steps: string[];
  normalizationMethod: string;
  sourceCodeFingerprint: string;
  createdAt: string;
  manifestHash: string;
};

export type BatchCorrectionManifest = {
  correctionId: string;
  datasetAccession: string;
  batchVariables: string[];
  method: string;
  preCorrectionDiagnosticsHash: string;
  postCorrectionDiagnosticsHash: string;
  humanReviewRequired: true;
  manifestHash: string;
};

export interface BiologicalEmbeddingProvider {
  readonly providerId: string;
  readonly modelVersion: string;
  readonly biologicalEmbedding: true;
  readonly textualEmbedding: false;
  readonly clinicalProductionEnabled: false;
  embed(signature: ExpressionSignature): number[];
}

export type SimilarityQuery = {
  queryId: string;
  querySignature: ExpressionSignature;
  candidateSignatures: ExpressionSignature[];
  maximumResults: number;
  metric: "cosine";
  researchPurpose: string;
  clinicalActionRequested: false;
};

export type SimilarityResult = {
  queryId: string;
  results: Array<{
    signatureId: string;
    datasetAccession: string;
    studyId: string;
    score: number;
  }>;
  providerId: string;
  providerVersion: string;
  relationshipType: "biological-similarity-research-hypothesis";
  clinicalActionAllowed: false;
  auditHash: string;
};

export type BiologicalHypothesis = {
  hypothesisId: string;
  statement: string;
  sourceSimilarityResultHash: string;
  status: "research-hypothesis";
  uncertainty: string[];
  diagnosisAuthorityGranted: false;
  treatmentSelectionAllowed: false;
  patientMatchingAllowed: false;
  hypothesisHash: string;
};

export type BiologicalValidationRun = {
  validationRunId: string;
  providerId: string;
  providerVersion: string;
  trainingStudyIds: string[];
  evaluationStudyIds: string[];
  trainingLaboratories: string[];
  evaluationLaboratories: string[];
  trainingPlatforms: string[];
  evaluationPlatforms: string[];
  splitUnit: "study" | "sample";
  negativeControlCount: number;
  knownPositiveCount: number;
  uncertaintyReported: boolean;
  status: "pass" | "fail";
  reasonCodes: string[];
  clinicalPromotionAllowed: false;
  auditHash: string;
};

const hashPattern = /^[0-9a-f]{64}$/i;
const safeTextPattern = /^[\x20-\x7E\n\r\t]*$/;

function validIso(value: string) {
  return Number.isFinite(Date.parse(value));
}

function unitInterval(value: number) {
  return Number.isFinite(value) && value >= 0 && value <= 1;
}

function canonical(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort();
}

function assertSafeResearchText(value: string, label: string) {
  if (!value.trim() || !safeTextPattern.test(value) || /(?:bearer|token|secret|password)\s*[:=]/i.test(value)) {
    throw new Error(`${label} must be nonsecret research metadata`);
  }
}

export function isTrialFailureIntelligenceEnabled(env: NodeJS.ProcessEnv = process.env) {
  return env.SCRIMED_TRIAL_FAILURE_INTELLIGENCE_ENABLED === "true";
}

export function isBiologicalSignatureRetrievalEnabled(env: NodeJS.ProcessEnv = process.env) {
  return env.SCRIMED_BIOLOGICAL_SIGNATURE_RETRIEVAL_ENABLED === "true";
}

export function buildRegistryVersionHistory(
  input: Omit<RegistryVersionHistory, "changes" | "historyHash">
): RegistryVersionHistory {
  const versions = [...input.versions].sort((left, right) => left.observedAt.localeCompare(right.observedAt));
  if (!versions.length || versions.some((version) => !validIso(version.observedAt) || !hashPattern.test(version.sourceHash))) {
    throw new Error("Registry history requires source-identified, time-ordered versions");
  }
  const changes = versions.slice(1).map((version, index) => {
    const prior = versions[index];
    const changedFields = [
      prior.status !== version.status ? "status" : null,
      prior.eligibilityDigest !== version.eligibilityDigest ? "eligibility" : null,
      prior.endpointDigest !== version.endpointDigest ? "endpoints" : null,
      prior.enrollment !== version.enrollment ? "enrollment" : null,
      prior.completionDate !== version.completionDate ? "completionDate" : null
    ].filter((value): value is string => Boolean(value));
    return {
      fromVersion: prior.versionId,
      toVersion: version.versionId,
      changedFields,
      changeHash: createAuditHash({
        type: "trial-registry-change",
        from: prior.versionId,
        to: version.versionId,
        changedFields
      })
    };
  });
  const base = { ...input, versions, changes };
  return { ...base, historyHash: createAuditHash({ type: "trial-registry-history", base }) };
}

export function buildTrialEvidenceSnapshot(
  input: Omit<TrialEvidenceSnapshot, "schemaVersion" | "evidenceFingerprint">
): TrialEvidenceSnapshot {
  if (!input.trialReference.nctId && !input.trialReference.sponsor && !input.trialReference.title) {
    throw new Error("Trial evidence snapshot requires an NCT identifier, sponsor, or title");
  }
  if (input.trialReference.nctId && !/^NCT\d{8}$/i.test(input.trialReference.nctId)) {
    throw new Error("NCT identifier must use the NCT######## format");
  }
  if (!input.officialRegistryEvidenceIds.length) {
    throw new Error("Trial failure intelligence requires official registry evidence first");
  }
  for (const atom of input.evidenceAtoms) {
    assertSafeResearchText(atom.statement, "evidence statement");
    assertSafeResearchText(atom.sourceSpan, "evidence source span");
    if (
      !validIso(atom.publicationDate) ||
      !validIso(atom.retrievedAt) ||
      !hashPattern.test(atom.provenanceHash)
    ) {
      throw new Error("Evidence atoms require dates and provenance");
    }
  }
  if (!validIso(input.capturedAt)) throw new Error("Trial evidence capture timestamp is invalid");
  const base = {
    ...input,
    officialRegistryEvidenceIds: canonical(input.officialRegistryEvidenceIds),
    publicationEvidenceIds: canonical(input.publicationEvidenceIds),
    evidenceAtoms: [...input.evidenceAtoms].sort((left, right) => left.evidenceId.localeCompare(right.evidenceId)),
    schemaVersion: scrimedP32ResearchIntelligenceVersion as typeof scrimedP32ResearchIntelligenceVersion
  };
  return { ...base, evidenceFingerprint: createAuditHash({ type: "trial-evidence-snapshot", base }) };
}

export function createAdversarialReview(
  input: Omit<AdversarialReview, "reviewHash">
): AdversarialReview {
  if (!validIso(input.completedAt)) throw new Error("Adversarial review timestamp is invalid");
  const base = {
    ...input,
    challengedHypothesisIds: canonical(input.challengedHypothesisIds),
    unsupportedClaimIds: canonical(input.unsupportedClaimIds),
    omittedContradictionIds: canonical(input.omittedContradictionIds)
  };
  return { ...base, reviewHash: createAuditHash({ type: "trial-adversarial-review", base }) };
}

export function buildTrialFailureInvestigation(
  input: Omit<
    TrialFailureInvestigation,
    | "humanReview"
    | "status"
    | "decisionGradeOutputAllowed"
    | "externalClaimAllowed"
    | "enrollmentActionAllowed"
    | "clinicalActionAllowed"
    | "auditHash"
  >
): TrialFailureInvestigation {
  if (
    !input.producerComponentIds.length ||
    !input.producerIdentityHashes.length ||
    input.producerIdentityHashes.some((identity) => !hashPattern.test(identity))
  ) {
    throw new Error("Trial investigation requires attributable producer identities and components");
  }
  const evidenceById = new Map(input.snapshot.evidenceAtoms.map((atom) => [atom.evidenceId, atom]));
  const contradictionIds = input.snapshot.evidenceAtoms
    .filter((atom) => atom.classification === "CONTRADICTION")
    .map((atom) => atom.evidenceId);
  const representedContradictionEvidenceIds = new Set(input.contradictions.flatMap((entry) => entry.evidenceIds));
  const omittedContradictions = contradictionIds.filter((id) => !representedContradictionEvidenceIds.has(id));
  if (omittedContradictions.length || input.adversarialReview.omittedContradictionIds.length) {
    throw new Error("Contradictory evidence cannot be silently omitted");
  }
  for (const hypothesis of input.hypotheses) {
    if (!unitInterval(hypothesis.confidence) || hypothesis.renderedAsEstablishedFact !== false) {
      throw new Error("Trial hypotheses require calibrated confidence and cannot render as fact");
    }
    const referenced = [...hypothesis.supportingEvidenceIds, ...hypothesis.contradictingEvidenceIds];
    if (referenced.some((id) => !evidenceById.has(id))) {
      throw new Error("Trial hypotheses may reference only captured evidence");
    }
  }
  const atoms = input.snapshot.evidenceAtoms;
  const confidenceBasis: ConfidenceBasis = {
    ...input.confidenceBasis,
    factCount: atoms.filter((atom) => atom.classification === "FACT").length,
    inferenceCount: atoms.filter((atom) => atom.classification === "INFERENCE").length,
    hypothesisCount: atoms.filter((atom) => atom.classification === "HYPOTHESIS").length,
    contradictionCount: contradictionIds.length,
    unknownCount: atoms.filter((atom) => atom.classification === "UNKNOWN").length
  };
  if (!unitInterval(confidenceBasis.confidence)) throw new Error("Trial confidence must be in [0, 1]");
  const highMissing = input.missingEvidence.some((entry) => entry.consequence === "requires-abstention");
  const base = {
    ...input,
    producerComponentIds: canonical(input.producerComponentIds),
    producerIdentityHashes: canonical(input.producerIdentityHashes),
    confidenceBasis,
    humanReview: null,
    status: highMissing ? ("blocked" as const) : ("awaiting-human-review" as const),
    decisionGradeOutputAllowed: false,
    externalClaimAllowed: false as const,
    enrollmentActionAllowed: false as const,
    clinicalActionAllowed: false as const
  };
  return { ...base, auditHash: createAuditHash({ type: "trial-failure-investigation", base }) };
}

export function recordTrialHumanReview(
  investigation: TrialFailureInvestigation,
  decision: Omit<HumanReviewDecision, "decisionHash">,
  reviewerContext: AuthenticatedHumanReviewContext
): TrialFailureInvestigation {
  if (
    decision.reviewerComponentId === investigation.adversarialReview.reviewerComponentId ||
    investigation.producerComponentIds.includes(decision.reviewerComponentId) ||
    investigation.producerIdentityHashes.includes(decision.reviewerIdentityHash)
  ) {
    throw new Error("Trial judge or hypothesis component cannot approve its own conclusion");
  }
  if (
    reviewerContext.actorType !== "human" ||
    reviewerContext.assuranceLevel !== "aal2" ||
    reviewerContext.authenticatedIdentityHash !== decision.reviewerIdentityHash ||
    reviewerContext.authenticatedComponentId !== decision.reviewerComponentId ||
    !hashPattern.test(reviewerContext.authenticationEvidenceHash) ||
    !validIso(reviewerContext.verifiedAt) ||
    !hashPattern.test(decision.reviewerIdentityHash) ||
    !validIso(decision.decidedAt) ||
    Date.parse(reviewerContext.verifiedAt) > Date.parse(decision.decidedAt)
  ) {
    throw new Error("Trial review requires a named hashed reviewer identity and timestamp");
  }
  const decisionBase = { ...decision, conditions: canonical(decision.conditions) };
  const humanReview = {
    ...decisionBase,
    decisionHash: createAuditHash({ type: "trial-human-review", investigationId: investigation.investigationId, decision: decisionBase })
  };
  const approved = decision.decision === "approved-for-internal-research-use" && investigation.status !== "blocked";
  const base = {
    ...investigation,
    humanReview,
    status: approved
      ? ("approved-internal-research" as const)
      : decision.decision === "changes-required"
        ? ("awaiting-human-review" as const)
        : ("blocked" as const),
    decisionGradeOutputAllowed: approved,
    externalClaimAllowed: false as const,
    enrollmentActionAllowed: false as const,
    clinicalActionAllowed: false as const
  };
  delete (base as Partial<TrialFailureInvestigation>).auditHash;
  return { ...base, auditHash: createAuditHash({ type: "trial-failure-investigation", base }) };
}

function stringSeed(value: string) {
  return [...value].reduce((total, character, index) => total + character.charCodeAt(0) * (index + 1), 0);
}

const maximumBiologicalCandidates = 2_000;
const maximumBiologicalFeaturesPerSignature = 20_000;
const maximumBiologicalResults = 100;

function assertBoundedExpressionSignature(signature: ExpressionSignature) {
  const features = Object.entries(signature.featureValues);
  if (features.length > maximumBiologicalFeaturesPerSignature) {
    throw new Error("Biological expression signature exceeds the feature budget");
  }
  if (features.some(([feature, value]) => !feature.trim() || !Number.isFinite(value))) {
    throw new Error("Biological expression signatures require finite, named features");
  }
  if (!hashPattern.test(signature.sampleIdHash) || !hashPattern.test(signature.sourceHash)) {
    throw new Error("Biological expression signatures require hashed sample and source provenance");
  }
}

export class DeterministicBiologicalEmbeddingProvider implements BiologicalEmbeddingProvider {
  readonly providerId = "scrimed-deterministic-biological-test-provider";
  readonly modelVersion = "deterministic-research-fixture-v1";
  readonly biologicalEmbedding = true as const;
  readonly textualEmbedding = false as const;
  readonly clinicalProductionEnabled = false as const;

  embed(signature: ExpressionSignature) {
    assertBoundedExpressionSignature(signature);
    const ordered = Object.entries(signature.featureValues).sort(([left], [right]) => left.localeCompare(right));
    const vector = [0, 0, 0, 0, 0, 0, 0, 0];
    ordered.forEach(([feature, value], index) => {
      const slot = (stringSeed(feature) + index) % vector.length;
      vector[slot] += Number.isFinite(value) ? value : 0;
    });
    const magnitude = Math.sqrt(vector.reduce((total, value) => total + value * value, 0)) || 1;
    return vector.map((value) => value / magnitude);
  }
}

function cosine(left: number[], right: number[]) {
  const length = Math.min(left.length, right.length);
  let dot = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;
  for (let index = 0; index < length; index += 1) {
    dot += left[index] * right[index];
    leftMagnitude += left[index] * left[index];
    rightMagnitude += right[index] * right[index];
  }
  const denominator = Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude);
  return denominator ? dot / denominator : 0;
}

export function queryBiologicalSimilarity(
  provider: BiologicalEmbeddingProvider,
  query: SimilarityQuery
): SimilarityResult {
  if (
    query.clinicalActionRequested !== false ||
    !Number.isSafeInteger(query.maximumResults) ||
    query.maximumResults < 1 ||
    query.maximumResults > maximumBiologicalResults ||
    query.candidateSignatures.length > maximumBiologicalCandidates
  ) {
    throw new Error("Biological similarity is research-only and requires a bounded result count");
  }
  assertBoundedExpressionSignature(query.querySignature);
  query.candidateSignatures.forEach(assertBoundedExpressionSignature);
  const queryVector = provider.embed(query.querySignature);
  const results = query.candidateSignatures
    .map((candidate) => ({
      signatureId: candidate.signatureId,
      datasetAccession: candidate.datasetAccession,
      studyId: candidate.studyId,
      score: cosine(queryVector, provider.embed(candidate))
    }))
    .sort((left, right) => right.score - left.score || left.signatureId.localeCompare(right.signatureId))
    .slice(0, query.maximumResults);
  const base = {
    queryId: query.queryId,
    results,
    providerId: provider.providerId,
    providerVersion: provider.modelVersion,
    relationshipType: "biological-similarity-research-hypothesis" as const,
    clinicalActionAllowed: false as const
  };
  return { ...base, auditHash: createAuditHash({ type: "biological-similarity-result", base }) };
}

export function buildBiologicalHypothesis(
  input: Omit<
    BiologicalHypothesis,
    "status" | "diagnosisAuthorityGranted" | "treatmentSelectionAllowed" | "patientMatchingAllowed" | "hypothesisHash"
  >
): BiologicalHypothesis {
  if (!hashPattern.test(input.sourceSimilarityResultHash) || !input.uncertainty.length) {
    throw new Error("Biological hypotheses require source provenance and explicit uncertainty");
  }
  const base = {
    ...input,
    status: "research-hypothesis" as const,
    diagnosisAuthorityGranted: false as const,
    treatmentSelectionAllowed: false as const,
    patientMatchingAllowed: false as const
  };
  return { ...base, hypothesisHash: createAuditHash({ type: "biological-hypothesis", base }) };
}

export function evaluateBiologicalValidationRun(
  input: Omit<BiologicalValidationRun, "status" | "reasonCodes" | "clinicalPromotionAllowed" | "auditHash">
): BiologicalValidationRun {
  const reasons: string[] = [];
  const trainingStudyIds = canonical(input.trainingStudyIds.map((study) => study.toLowerCase()));
  const evaluationStudyIds = canonical(input.evaluationStudyIds.map((study) => study.toLowerCase()));
  const studyOverlap = trainingStudyIds.filter((study) => evaluationStudyIds.includes(study));
  if (input.splitUnit !== "study" || studyOverlap.length) reasons.push("STUDY_LEVEL_LEAKAGE_DETECTED");
  if (!input.evaluationLaboratories.some((lab) => !input.trainingLaboratories.includes(lab))) {
    reasons.push("CROSS_LABORATORY_VALIDATION_REQUIRED");
  }
  if (!input.evaluationPlatforms.some((platform) => !input.trainingPlatforms.includes(platform))) {
    reasons.push("CROSS_PLATFORM_VALIDATION_REQUIRED");
  }
  if (input.negativeControlCount < 1) reasons.push("NEGATIVE_CONTROLS_REQUIRED");
  if (input.knownPositiveCount < 1) reasons.push("KNOWN_POSITIVE_RELATIONSHIPS_REQUIRED");
  if (!input.uncertaintyReported) reasons.push("UNCERTAINTY_REPORTING_REQUIRED");
  const base = {
    ...input,
    trainingStudyIds,
    evaluationStudyIds,
    trainingLaboratories: canonical(input.trainingLaboratories),
    evaluationLaboratories: canonical(input.evaluationLaboratories),
    trainingPlatforms: canonical(input.trainingPlatforms),
    evaluationPlatforms: canonical(input.evaluationPlatforms),
    status: reasons.length ? ("fail" as const) : ("pass" as const),
    reasonCodes: reasons.length ? reasons.sort() : ["RESEARCH_VALIDATION_GATES_PASSED"],
    clinicalPromotionAllowed: false as const
  };
  return { ...base, auditHash: createAuditHash({ type: "biological-validation-run", base }) };
}

export function getResearchIntelligenceSummary(env: NodeJS.ProcessEnv = process.env) {
  return {
    version: scrimedP32ResearchIntelligenceVersion,
    trialFailureIntelligenceEnabled: isTrialFailureIntelligenceEnabled(env),
    externalRegistryAdaptersEnabled: false,
    biologicalSignatureRetrievalEnabled: isBiologicalSignatureRetrievalEnabled(env),
    deterministicBiologicalTestProvider: true,
    evidenceClassifications: ["FACT", "INFERENCE", "HYPOTHESIS", "CONTRADICTION", "UNKNOWN"],
    namedIndependentReviewRequired: true,
    enrollmentAllowed: false,
    clinicalActionAllowed: false,
    boundary: scrimedP32ResearchIntelligenceBoundary
  } as const;
}
