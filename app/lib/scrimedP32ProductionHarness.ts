import { createClinicalEvidenceHash } from "./clinicalEvidenceControls";
import { redactForTelemetry } from "./scrimed-work/audit";

export const scrimedP32ProductionHarnessVersion = "scrimed-p32-production-harness-v1-2026-07-20";

export const scrimedP32ProductionHarnessBoundary =
  "The SCRIMED production harness evaluates synthetic, deidentified-approved, public-reference, or metadata-only executions. It does not authorize live PHI, autonomous clinical care, payer submission, EHR writeback, production deployment, certification claims, or customer go-live.";

export type HarnessGateStatus = "PASS" | "FAIL" | "REVIEW_REQUIRED" | "NOT_APPLICABLE";

export type GateResult = {
  status: HarnessGateStatus;
  reasonCode: string;
  reason: string;
  evidencePointers: string[];
  mandatory: boolean;
};

export type HarnessScorecard = {
  clinicalAccuracy: number;
  p95LatencyMs: number;
  costPerVerifiedTask: number | null;
  reliability: number;
  privacy: GateResult;
  security: GateResult;
  composability: number;
  throughput: number;
  evidenceCoverage: number;
  downstreamCorrectionRate: number;
};

export type HarnessHardGates = {
  safety: GateResult;
  privacy: GateResult;
  security: GateResult;
  provenance: GateResult;
  requiredEvidence: GateResult;
};

export type HarnessFloors = {
  minimumClinicalAccuracy: number;
  maximumP95LatencyMs: number;
  maximumCostPerVerifiedTask: number;
  minimumReliability: number;
  minimumComposability: number;
  minimumThroughput: number;
  minimumEvidenceCoverage: number;
  maximumDownstreamCorrectionRate: number;
};

export type HarnessCandidate = {
  candidateId: string;
  modelId: string;
  taskId: string;
  scorecard: HarnessScorecard;
  hardGates: HarnessHardGates;
  deterministicValidatorPassed: boolean;
  domainRubricPassed: boolean;
  counterfactualChecksPassed: boolean;
  blindedHumanReview: "not-required" | "pending" | "passed" | "failed";
  llmJudgeSignal: "not-used" | "passed" | "failed" | "unavailable";
  highRisk: boolean;
  evidencePointers: string[];
};

export type HarnessEvaluation = {
  candidateId: string;
  status: HarnessGateStatus;
  reasonCodes: string[];
  failedHardGates: Array<keyof HarnessHardGates>;
  reviewRequiredGates: Array<keyof HarnessHardGates>;
  failedFloors: string[];
  paretoEligible: boolean;
  releaseEligible: boolean;
  llmJudgeAuthoritative: false;
  humanReviewRequired: boolean;
  auditHash: string;
};

export type VerifiedTaskCostInput = {
  inferenceUsd: number;
  retrievalUsd: number;
  infrastructureUsd: number;
  validationUsd: number;
  retryUsd: number;
  reviewerUsd: number;
  latencyBurdenUsd: number;
  correctionFailureUsd: number;
  verifiedSuccessfulTasks: number;
};

function finiteNonnegative(value: number) {
  return Number.isFinite(value) && value >= 0;
}

function unitInterval(value: number) {
  return Number.isFinite(value) && value >= 0 && value <= 1;
}

export function calculateCostPerVerifiedTask(input: VerifiedTaskCostInput) {
  const components = [
    input.inferenceUsd,
    input.retrievalUsd,
    input.infrastructureUsd,
    input.validationUsd,
    input.retryUsd,
    input.reviewerUsd,
    input.latencyBurdenUsd,
    input.correctionFailureUsd
  ];
  if (components.some((value) => !finiteNonnegative(value)) || !Number.isInteger(input.verifiedSuccessfulTasks) || input.verifiedSuccessfulTasks < 0) {
    throw new Error("Verified-task cost inputs must be finite, nonnegative, and use an integer successful-task count");
  }
  const totalCostUsd = Number(components.reduce((total, value) => total + value, 0).toFixed(6));
  return {
    totalCostUsd,
    costPerVerifiedTaskUsd: input.verifiedSuccessfulTasks > 0
      ? Number((totalCostUsd / input.verifiedSuccessfulTasks).toFixed(6))
      : null
  };
}

function validateScorecard(scorecard: HarnessScorecard) {
  const intervalMetrics = [
    scorecard.clinicalAccuracy,
    scorecard.reliability,
    scorecard.composability,
    scorecard.evidenceCoverage,
    scorecard.downstreamCorrectionRate
  ];
  return intervalMetrics.every(unitInterval) &&
    finiteNonnegative(scorecard.p95LatencyMs) &&
    finiteNonnegative(scorecard.throughput) &&
    (scorecard.costPerVerifiedTask === null || finiteNonnegative(scorecard.costPerVerifiedTask));
}

export function evaluateHarnessCandidate(candidate: HarnessCandidate, floors: HarnessFloors): HarnessEvaluation {
  const gateEntries = Object.entries(candidate.hardGates) as Array<[keyof HarnessHardGates, GateResult]>;
  const failedHardGates = gateEntries
    .filter(([, gate]) => gate.mandatory && gate.status === "FAIL")
    .map(([name]) => name);
  const reviewRequiredGates = gateEntries
    .filter(([, gate]) => gate.mandatory && gate.status === "REVIEW_REQUIRED")
    .map(([name]) => name);
  const failedFloors: string[] = [];

  if (!validateScorecard(candidate.scorecard)) failedFloors.push("INVALID_SCORECARD_METADATA");
  if (candidate.scorecard.clinicalAccuracy < floors.minimumClinicalAccuracy) failedFloors.push("CLINICAL_ACCURACY_BELOW_FLOOR");
  if (candidate.scorecard.p95LatencyMs > floors.maximumP95LatencyMs) failedFloors.push("P95_LATENCY_ABOVE_CEILING");
  if (candidate.scorecard.costPerVerifiedTask === null) failedFloors.push("NO_VERIFIED_SUCCESSFUL_TASK");
  else if (candidate.scorecard.costPerVerifiedTask > floors.maximumCostPerVerifiedTask) failedFloors.push("VERIFIED_TASK_COST_ABOVE_CEILING");
  if (candidate.scorecard.reliability < floors.minimumReliability) failedFloors.push("RELIABILITY_BELOW_FLOOR");
  if (candidate.scorecard.composability < floors.minimumComposability) failedFloors.push("COMPOSABILITY_BELOW_FLOOR");
  if (candidate.scorecard.throughput < floors.minimumThroughput) failedFloors.push("THROUGHPUT_BELOW_FLOOR");
  if (candidate.scorecard.evidenceCoverage < floors.minimumEvidenceCoverage) failedFloors.push("EVIDENCE_COVERAGE_BELOW_FLOOR");
  if (candidate.scorecard.downstreamCorrectionRate > floors.maximumDownstreamCorrectionRate) failedFloors.push("CORRECTION_RATE_ABOVE_CEILING");
  if (!candidate.deterministicValidatorPassed) failedFloors.push("DETERMINISTIC_VALIDATION_FAILED");
  if (!candidate.domainRubricPassed) failedFloors.push("DOMAIN_RUBRIC_FAILED");
  if (!candidate.counterfactualChecksPassed) failedFloors.push("COUNTERFACTUAL_CHECK_FAILED");
  if (candidate.highRisk && candidate.blindedHumanReview !== "passed") failedFloors.push("BLINDED_HUMAN_REVIEW_REQUIRED");

  const status: HarnessGateStatus = failedHardGates.length || failedFloors.length
    ? "FAIL"
    : reviewRequiredGates.length || candidate.blindedHumanReview === "pending"
      ? "REVIEW_REQUIRED"
      : "PASS";
  const reasonCodes = [
    ...failedHardGates.map((gate) => `HARD_GATE_${gate.toUpperCase()}_FAILED`),
    ...reviewRequiredGates.map((gate) => `HARD_GATE_${gate.toUpperCase()}_REVIEW_REQUIRED`),
    ...failedFloors,
    ...(candidate.llmJudgeSignal === "failed" ? ["SECONDARY_LLM_JUDGE_FAILED"] : []),
    ...(candidate.llmJudgeSignal === "unavailable" ? ["SECONDARY_LLM_JUDGE_UNAVAILABLE"] : []),
    ...(status === "PASS" ? ["MANDATORY_GATES_AND_FLOORS_PASSED"] : [])
  ];
  const withoutHash = {
    candidateId: candidate.candidateId,
    status,
    reasonCodes,
    failedHardGates,
    reviewRequiredGates,
    failedFloors,
    paretoEligible: status === "PASS",
    releaseEligible: status === "PASS",
    llmJudgeAuthoritative: false as const,
    humanReviewRequired: candidate.highRisk || status !== "PASS"
  };
  return { ...withoutHash, auditHash: createClinicalEvidenceHash({ candidate, floors, result: withoutHash }) };
}

export function selectParetoHarnessCandidates(candidates: HarnessCandidate[], floors: HarnessFloors) {
  const passed = candidates.filter((candidate) => evaluateHarnessCandidate(candidate, floors).status === "PASS");
  return passed.filter((candidate) => !passed.some((other) => {
    if (other.candidateId === candidate.candidateId) return false;
    const noWorse =
      other.scorecard.clinicalAccuracy >= candidate.scorecard.clinicalAccuracy &&
      other.scorecard.reliability >= candidate.scorecard.reliability &&
      other.scorecard.evidenceCoverage >= candidate.scorecard.evidenceCoverage &&
      other.scorecard.p95LatencyMs <= candidate.scorecard.p95LatencyMs &&
      (other.scorecard.costPerVerifiedTask ?? Number.POSITIVE_INFINITY) <=
        (candidate.scorecard.costPerVerifiedTask ?? Number.POSITIVE_INFINITY) &&
      other.scorecard.downstreamCorrectionRate <= candidate.scorecard.downstreamCorrectionRate;
    const strictlyBetter =
      other.scorecard.clinicalAccuracy > candidate.scorecard.clinicalAccuracy ||
      other.scorecard.reliability > candidate.scorecard.reliability ||
      other.scorecard.evidenceCoverage > candidate.scorecard.evidenceCoverage ||
      other.scorecard.p95LatencyMs < candidate.scorecard.p95LatencyMs ||
      (other.scorecard.costPerVerifiedTask ?? Number.POSITIVE_INFINITY) <
        (candidate.scorecard.costPerVerifiedTask ?? Number.POSITIVE_INFINITY) ||
      other.scorecard.downstreamCorrectionRate < candidate.scorecard.downstreamCorrectionRate;
    return noWorse && strictlyBetter;
  })).map((candidate) => candidate.candidateId).sort();
}

export function compareHarnessExecution(input: {
  taskId: string;
  withHarness: HarnessScorecard;
  withoutHarness: HarnessScorecard;
}) {
  const costDelta = input.withHarness.costPerVerifiedTask === null || input.withoutHarness.costPerVerifiedTask === null
    ? null
    : Number((input.withHarness.costPerVerifiedTask - input.withoutHarness.costPerVerifiedTask).toFixed(6));
  const result = {
    taskId: input.taskId,
    clinicalAccuracyDelta: Number((input.withHarness.clinicalAccuracy - input.withoutHarness.clinicalAccuracy).toFixed(6)),
    p95LatencyDeltaMs: input.withHarness.p95LatencyMs - input.withoutHarness.p95LatencyMs,
    costPerVerifiedTaskDeltaUsd: costDelta,
    reliabilityDelta: Number((input.withHarness.reliability - input.withoutHarness.reliability).toFixed(6)),
    evidenceCoverageDelta: Number((input.withHarness.evidenceCoverage - input.withoutHarness.evidenceCoverage).toFixed(6)),
    downstreamCorrectionRateDelta: Number((input.withHarness.downstreamCorrectionRate - input.withoutHarness.downstreamCorrectionRate).toFixed(6))
  };
  return { ...result, auditHash: createClinicalEvidenceHash(result) };
}

export type ValidationAttempt<T> = {
  attempt: number;
  output: T | null;
  deterministicPassed: boolean;
  domainRubricPassed: boolean;
  llmJudgeSignal: "not-used" | "passed" | "failed" | "unavailable";
  failureReason: string | null;
};

export function executeBoundedValidationLoop<T>(input: {
  maximumAttempts: number;
  execute: (attempt: number) => T;
  deterministicValidate: (output: T) => boolean;
  domainRubricValidate: (output: T) => boolean;
  secondaryLlmJudge?: (output: T) => boolean;
}) {
  if (!Number.isInteger(input.maximumAttempts) || input.maximumAttempts < 1 || input.maximumAttempts > 5) {
    throw new Error("Validation attempts must be an integer between one and five");
  }
  const attempts: ValidationAttempt<T>[] = [];
  for (let attempt = 1; attempt <= input.maximumAttempts; attempt += 1) {
    try {
      const output = input.execute(attempt);
      const deterministicPassed = input.deterministicValidate(output);
      const domainRubricPassed = input.domainRubricValidate(output);
      let llmJudgeSignal: ValidationAttempt<T>["llmJudgeSignal"] = "not-used";
      if (input.secondaryLlmJudge) {
        try {
          llmJudgeSignal = input.secondaryLlmJudge(output) ? "passed" : "failed";
        } catch {
          llmJudgeSignal = "unavailable";
        }
      }
      attempts.push({
        attempt,
        output,
        deterministicPassed,
        domainRubricPassed,
        llmJudgeSignal,
        failureReason: deterministicPassed && domainRubricPassed ? null : "deterministic-or-domain-validation-failed"
      });
      if (deterministicPassed && domainRubricPassed) {
        return { status: "PASS" as const, attempts, exhausted: false, output };
      }
    } catch (error) {
      attempts.push({
        attempt,
        output: null,
        deterministicPassed: false,
        domainRubricPassed: false,
        llmJudgeSignal: "unavailable",
        failureReason: error instanceof Error ? error.message : "execution-failed"
      });
    }
  }
  return { status: "FAIL" as const, attempts, exhausted: true, output: null };
}

export type QuarantinedEvaluationCandidate = {
  candidateId: string;
  sourceFindingId: string;
  source: "production-failure" | "user-correction" | "monitor-finding";
  inputFingerprint: string;
  expectedBehaviorReference: string;
  deidentified: boolean;
  reviewerApproved: boolean;
  containsRawPhi: false;
  status: "quarantined" | "eligible-for-offline-evaluation" | "rejected";
  rejectionReasons: string[];
  auditHash: string;
};

export function buildQuarantinedEvaluationCandidate(input: Omit<QuarantinedEvaluationCandidate, "status" | "rejectionReasons" | "auditHash" | "containsRawPhi"> & {
  containsRawPhi: boolean;
}): QuarantinedEvaluationCandidate {
  const rejectionReasons = [
    ...(input.containsRawPhi ? ["RAW_PHI_PROHIBITED"] : []),
    ...(!input.deidentified ? ["DEIDENTIFICATION_REQUIRED"] : []),
    ...(!input.reviewerApproved ? ["REVIEWER_APPROVAL_REQUIRED"] : [])
  ];
  const status = rejectionReasons.length
    ? "rejected" as const
    : "eligible-for-offline-evaluation" as const;
  const withoutHash = {
    candidateId: input.candidateId,
    sourceFindingId: input.sourceFindingId,
    source: input.source,
    inputFingerprint: input.inputFingerprint,
    expectedBehaviorReference: input.expectedBehaviorReference,
    deidentified: input.deidentified,
    reviewerApproved: input.reviewerApproved,
    containsRawPhi: false as const,
    status,
    rejectionReasons
  };
  return { ...withoutHash, auditHash: createClinicalEvidenceHash(withoutHash) };
}

export type ModelBOM = {
  bomVersion: typeof scrimedP32ProductionHarnessVersion;
  artifactId: string;
  tenantId: string;
  workflowId: string;
  model: { providerId: string; modelId: string; version: string; configurationHash: string };
  policyVersion: string;
  promptTemplateVersion: string;
  retrievalSourceIds: string[];
  toolVersions: Array<{ toolId: string; version: string; digest: string }>;
  serializationStrategy: "raw-structured" | "compact-structured" | "clinical-narrative" | "not-applicable";
  runtimeConfigurationHash: string;
  correlationId: string;
  createdAt: string;
  bomHash: string;
};

export function createModelBOM(input: Omit<ModelBOM, "bomVersion" | "bomHash">): ModelBOM {
  const safe = redactForTelemetry(input) as Omit<ModelBOM, "bomVersion" | "bomHash">;
  const payload = { bomVersion: scrimedP32ProductionHarnessVersion as typeof scrimedP32ProductionHarnessVersion, ...safe };
  return { ...payload, bomHash: createClinicalEvidenceHash(payload) };
}

export type TamperEvidentOperationalEvent = {
  eventId: string;
  tenantId: string;
  workflowId: string;
  eventType: "model-call" | "tool-call" | "policy-decision" | "evidence" | "writeback-proposal" | "monitor-finding";
  correlationId: string;
  summary: unknown;
  occurredAt: string;
  previousEventHash: string | null;
  eventHash: string;
};

export function createTamperEvidentOperationalEvent(
  input: Omit<TamperEvidentOperationalEvent, "summary" | "eventHash"> & { summary: unknown }
): TamperEvidentOperationalEvent {
  const safeSummary = redactForTelemetry(input.summary);
  const payload = { ...input, summary: safeSummary };
  return { ...payload, eventHash: createClinicalEvidenceHash(payload) };
}
