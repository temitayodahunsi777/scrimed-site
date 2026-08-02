import { createClinicalEvidenceHash } from "../clinicalEvidenceControls";
import { redactForTelemetry } from "./audit";
import type { PolicyDecision } from "./p32Contracts";
import type { DataClassification, RiskLevel } from "./types";

export const scrimedP32GovernanceRecordsVersion =
  "scrimed-p32-governance-records-v2-2026-07-30";

export const scrimedP32GovernanceRecordsBoundary =
  "SCRIMED p.32 governance records are tenant-bound, digest-attributed, synthetic/no-PHI control-plane records. They do not grant clinical authority, expert determination, model admission, production execution, payer submission, EHR writeback, deployment, or customer activation.";

const sha256Pattern = /^[0-9a-f]{64}$/i;
const boundedIdentifierPattern = /^[A-Za-z0-9][A-Za-z0-9._:-]{2,159}$/;
const wildcardPattern = /(^|[.:/])(?:\*|all)(?:$|[.:/])|\.\*/i;

function canonical(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort();
}

function requireIdentifier(value: string, label: string) {
  if (!boundedIdentifierPattern.test(value)) {
    throw new Error(`${label} must be a bounded identifier`);
  }
}

function requireHash(value: string, label: string) {
  if (!sha256Pattern.test(value)) {
    throw new Error(`${label} must be a SHA-256 fingerprint`);
  }
}

function requireIsoTimestamp(value: string, label: string) {
  if (!Number.isFinite(Date.parse(value))) {
    throw new Error(`${label} must be an ISO timestamp`);
  }
}

function requireUnitInterval(value: number, label: string) {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new Error(`${label} must be in [0, 1]`);
  }
}

function requireFiniteNonnegative(value: number, label: string) {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${label} must be finite and nonnegative`);
  }
}

function containsWildcard(values: string[]) {
  return values.some((value) => wildcardPattern.test(value.trim()));
}

export type ProjectedSchema = {
  schemaId: string;
  fields: string[];
  additionalProperties: false;
};

export type TaskScopedToolContract = {
  contractId: string;
  version: string;
  tenantId: string;
  actorId: string;
  workloadId: string;
  intendedPurpose: string;
  riskTier: RiskLevel;
  permittedResources: string[];
  permittedFields: string[];
  rowFilters: string[];
  permittedActions: string[];
  permittedDestinations: string[];
  declaredDataClasses: DataClassification[];
  minimumNecessaryJustification: string;
  projectedInputSchema: ProjectedSchema;
  projectedOutputSchema: ProjectedSchema;
  egressPolicy: {
    defaultDecision: "deny";
    allowedDestinations: string[];
  };
  budgets: {
    maximumInputTokens: number;
    maximumOutputTokens: number;
    maximumCostUsd: number;
    maximumDurationMs: number;
    maximumRetries: number;
    maximumConcurrency: number;
  };
  issuedAt: string;
  expiresAt: string;
  revocationState: "active" | "revoked";
  revokedAt: string | null;
  lazySchemaExpansionRequiresAuthorization: true;
  policyDigest: string;
  contractHash: string;
};

export type TaskScopedToolContractInput = Omit<
  TaskScopedToolContract,
  "contractHash" | "lazySchemaExpansionRequiresAuthorization"
>;

export function createTaskScopedToolContract(
  input: TaskScopedToolContractInput
): TaskScopedToolContract {
  for (const [label, value] of [
    ["contract id", input.contractId],
    ["tenant id", input.tenantId],
    ["actor id", input.actorId],
    ["workload id", input.workloadId],
    ["input schema id", input.projectedInputSchema.schemaId],
    ["output schema id", input.projectedOutputSchema.schemaId]
  ] as const) {
    requireIdentifier(value, label);
  }
  requireIsoTimestamp(input.issuedAt, "issuedAt");
  requireIsoTimestamp(input.expiresAt, "expiresAt");
  if (Date.parse(input.expiresAt) <= Date.parse(input.issuedAt)) {
    throw new Error("Task-scoped tool contract must expire after it is issued");
  }
  if (!input.intendedPurpose.trim() || input.minimumNecessaryJustification.trim().length < 12) {
    throw new Error("Task-scoped tool contract requires purpose and minimum-necessary justification");
  }

  const scopedCollections = [
    input.permittedResources,
    input.permittedFields,
    input.rowFilters,
    input.permittedActions,
    input.projectedInputSchema.fields,
    input.projectedOutputSchema.fields
  ];
  if (scopedCollections.some((values) => values.length === 0)) {
    throw new Error("Task-scoped tool contract requires explicit resource, field, row, action, and schema scopes");
  }
  if (scopedCollections.some(containsWildcard) || containsWildcard(input.permittedDestinations)) {
    throw new Error("Wildcard or unbounded tool scopes are prohibited");
  }
  if (
    input.projectedInputSchema.additionalProperties !== false ||
    input.projectedOutputSchema.additionalProperties !== false
  ) {
    throw new Error("Projected schemas must reject undeclared fields");
  }

  for (const [label, value] of [
    ["maximum input tokens", input.budgets.maximumInputTokens],
    ["maximum output tokens", input.budgets.maximumOutputTokens],
    ["maximum cost", input.budgets.maximumCostUsd],
    ["maximum duration", input.budgets.maximumDurationMs],
    ["maximum retries", input.budgets.maximumRetries],
    ["maximum concurrency", input.budgets.maximumConcurrency]
  ] as const) {
    requireFiniteNonnegative(value, label);
  }
  if (
    input.budgets.maximumRetries > 5 ||
    input.budgets.maximumConcurrency > 16 ||
    input.budgets.maximumDurationMs === 0
  ) {
    throw new Error("Task-scoped retry, concurrency, and duration budgets exceed the safe policy ceiling");
  }
  if (
    input.egressPolicy.defaultDecision !== "deny" ||
    input.egressPolicy.allowedDestinations.some(
      (destination) => !input.permittedDestinations.includes(destination)
    )
  ) {
    throw new Error("Egress must be deny-by-default and constrained to declared destinations");
  }
  if (!input.declaredDataClasses.length || input.declaredDataClasses.includes("unknown")) {
    throw new Error("Tool contracts require explicit, known data classifications");
  }
  if (input.revocationState === "revoked" && !input.revokedAt) {
    throw new Error("Revoked tool contracts require a revocation timestamp");
  }
  if (input.revokedAt) requireIsoTimestamp(input.revokedAt, "revokedAt");

  const payload = {
    ...input,
    permittedResources: canonical(input.permittedResources),
    permittedFields: canonical(input.permittedFields),
    rowFilters: canonical(input.rowFilters),
    permittedActions: canonical(input.permittedActions),
    permittedDestinations: canonical(input.permittedDestinations),
    declaredDataClasses: [...new Set(input.declaredDataClasses)].sort(),
    projectedInputSchema: {
      ...input.projectedInputSchema,
      fields: canonical(input.projectedInputSchema.fields)
    },
    projectedOutputSchema: {
      ...input.projectedOutputSchema,
      fields: canonical(input.projectedOutputSchema.fields)
    },
    egressPolicy: {
      defaultDecision: "deny" as const,
      allowedDestinations: canonical(input.egressPolicy.allowedDestinations)
    },
    lazySchemaExpansionRequiresAuthorization: true as const
  };
  return {
    ...payload,
    contractHash: createClinicalEvidenceHash({ type: "task-scoped-tool-contract", payload })
  };
}

export type ContextSourceSpan = {
  sourceFingerprint: string;
  sourceId: string;
  spanReference: string;
  provenanceReference: string;
  effectiveAt: string;
};

export type SourceSpan = ContextSourceSpan;

export type ContextCoverageManifest = {
  manifestId: string;
  tenantId: string;
  snapshotAt: string;
  effectiveAt: string;
  includedSourceIds: string[];
  excludedSourceIds: string[];
  missingSourceIds: string[];
  staleSourceIds: string[];
  inaccessibleSourceIds: string[];
  tenantPermissionFingerprint: string;
  sourcePermissionFingerprint: string;
  sourceSpans: ContextSourceSpan[];
  clinicalSpecialty: string;
  intendedUseProfile: string;
  retrievalVersion: string;
  rerankerVersion: string;
  generatorVersion: string;
  verifierVersion: string;
  contradictionStatus: "none" | "resolved" | "unresolved";
  freshnessStatus: "current" | "mixed" | "stale" | "unknown";
  clinicianModelSourceParity: "matched" | "partial" | "failed" | "not-assessed";
  decision: PolicyDecision;
  reasonCodes: string[];
  humanReviewRequired: boolean;
  manifestHash: string;
};

export type SummaryCoverageManifest = ContextCoverageManifest;

export type ContextCoverageManifestInput = Omit<
  ContextCoverageManifest,
  "decision" | "reasonCodes" | "humanReviewRequired" | "manifestHash"
>;

export function buildContextCoverageManifest(
  input: ContextCoverageManifestInput
): ContextCoverageManifest {
  requireIdentifier(input.manifestId, "context manifest id");
  requireIdentifier(input.tenantId, "context tenant id");
  requireHash(input.tenantPermissionFingerprint, "tenant permission");
  requireHash(input.sourcePermissionFingerprint, "source permission");
  requireIsoTimestamp(input.snapshotAt, "snapshotAt");
  requireIsoTimestamp(input.effectiveAt, "effectiveAt");
  input.sourceSpans.forEach((span) => {
    requireHash(span.sourceFingerprint, "source span");
    requireIsoTimestamp(span.effectiveAt, "source effectiveAt");
  });

  const includedSourceIds = canonical(input.includedSourceIds);
  const missingSourceIds = canonical(input.missingSourceIds);
  const staleSourceIds = canonical(input.staleSourceIds);
  const inaccessibleSourceIds = canonical(input.inaccessibleSourceIds);
  const reasonCodes: string[] = [];
  if (!includedSourceIds.length) reasonCodes.push("CONTEXT_HAS_NO_AUTHORIZED_SOURCES");
  if (missingSourceIds.length) reasonCodes.push("CONTEXT_REQUIRED_SOURCE_MISSING");
  if (staleSourceIds.length || input.freshnessStatus !== "current") {
    reasonCodes.push("CONTEXT_FRESHNESS_INSUFFICIENT");
  }
  if (inaccessibleSourceIds.length) reasonCodes.push("CLINICIAN_VISIBLE_SOURCE_INACCESSIBLE_TO_MODEL");
  if (input.contradictionStatus === "unresolved") reasonCodes.push("CONTEXT_CONTRADICTION_UNRESOLVED");
  if (input.clinicianModelSourceParity !== "matched") reasonCodes.push("CLINICIAN_MODEL_SOURCE_PARITY_INCOMPLETE");
  if (
    input.sourceSpans.some((span) => !includedSourceIds.includes(span.sourceId)) ||
    includedSourceIds.some((sourceId) => !input.sourceSpans.some((span) => span.sourceId === sourceId))
  ) {
    reasonCodes.push("CONTEXT_SOURCE_SPAN_COVERAGE_INCOMPLETE");
  }

  const hardBlock =
    !includedSourceIds.length || input.clinicianModelSourceParity === "failed";
  const decision: PolicyDecision = hardBlock
    ? "BLOCK"
    : reasonCodes.length
      ? "REQUIRE_HUMAN"
      : "ALLOW";
  const payload = {
    ...input,
    includedSourceIds,
    excludedSourceIds: canonical(input.excludedSourceIds),
    missingSourceIds,
    staleSourceIds,
    inaccessibleSourceIds,
    sourceSpans: [...input.sourceSpans].sort((left, right) =>
      `${left.sourceId}:${left.spanReference}`.localeCompare(
        `${right.sourceId}:${right.spanReference}`
      )
    ),
    decision,
    reasonCodes: canonical(reasonCodes),
    humanReviewRequired: decision !== "ALLOW"
  };
  return {
    ...payload,
    manifestHash: createClinicalEvidenceHash({ type: "context-coverage-manifest", payload })
  };
}

export type EvidenceClassification = "FACT" | "INFERENCE" | "HYPOTHESIS";
export type EvidenceClaimStatus =
  | "supported"
  | "disputed"
  | "stale"
  | "retracted"
  | "insufficient"
  | "review_required";

export type EvidenceSynthesisClaim = {
  claimId: string;
  classification: EvidenceClassification;
  statementDigest: string;
  sourceFingerprints: string[];
  quotedSpanReferences: string[];
  jurisdiction: string;
  effectiveAt: string;
  expiresAt: string | null;
  supportingEvidenceIds: string[];
  contradictoryEvidenceIds: string[];
  evidenceGrade: string;
  applicabilityLimits: string[];
  status: EvidenceClaimStatus;
  accountableReviewerIdentityHash: string | null;
  modelConfidenceIsProofOfCorrectness: false;
};

export type EvidenceSynthesisRecord = {
  recordId: string;
  tenantId: string;
  contextManifestHash: string;
  claims: EvidenceSynthesisClaim[];
  overallDecision: PolicyDecision;
  reasonCodes: string[];
  factsSeparatedFromInferencesAndHypotheses: true;
  contradictoryEvidencePreserved: true;
  humanReviewRequired: boolean;
  createdAt: string;
  recordHash: string;
};

export function buildEvidenceSynthesisRecord(input: Omit<EvidenceSynthesisRecord, "overallDecision" | "reasonCodes" | "factsSeparatedFromInferencesAndHypotheses" | "contradictoryEvidencePreserved" | "humanReviewRequired" | "recordHash">): EvidenceSynthesisRecord {
  requireIdentifier(input.recordId, "evidence synthesis record id");
  requireIdentifier(input.tenantId, "evidence synthesis tenant id");
  requireHash(input.contextManifestHash, "context manifest");
  requireIsoTimestamp(input.createdAt, "createdAt");
  if (!input.claims.length) throw new Error("Evidence synthesis requires at least one classified claim");

  const reasonCodes: string[] = [];
  input.claims.forEach((claim) => {
    requireIdentifier(claim.claimId, "evidence claim id");
    requireHash(claim.statementDigest, "claim statement");
    claim.sourceFingerprints.forEach((fingerprint) =>
      requireHash(fingerprint, "claim source")
    );
    requireIsoTimestamp(claim.effectiveAt, "claim effectiveAt");
    if (claim.expiresAt) requireIsoTimestamp(claim.expiresAt, "claim expiresAt");
    if (
      claim.classification === "FACT" &&
      (!claim.sourceFingerprints.length || !claim.quotedSpanReferences.length)
    ) {
      throw new Error("FACT claims require source fingerprints and quoted span references");
    }
    if (claim.modelConfidenceIsProofOfCorrectness !== false) {
      throw new Error("Model confidence cannot be represented as proof of correctness");
    }
    if (claim.contradictoryEvidenceIds.length && claim.status === "supported") {
      reasonCodes.push("CONTRADICTORY_EVIDENCE_REQUIRES_DISPUTED_STATUS");
    }
    if (["stale", "retracted", "insufficient", "review_required", "disputed"].includes(claim.status)) {
      reasonCodes.push(`CLAIM_${claim.status.toUpperCase()}`);
    }
    if (
      claim.status !== "supported" &&
      claim.accountableReviewerIdentityHash === null
    ) {
      reasonCodes.push("ACCOUNTABLE_REVIEWER_REQUIRED");
    }
  });

  const hasBlockingClaim = input.claims.some(
    (claim) => claim.status === "retracted" || claim.status === "insufficient"
  );
  const overallDecision: PolicyDecision = hasBlockingClaim
    ? "BLOCK"
    : reasonCodes.length
      ? "REQUIRE_HUMAN"
      : "ALLOW";
  const payload = {
    ...input,
    claims: [...input.claims].sort((left, right) =>
      left.claimId.localeCompare(right.claimId)
    ),
    overallDecision,
    reasonCodes: canonical(reasonCodes),
    factsSeparatedFromInferencesAndHypotheses: true as const,
    contradictoryEvidencePreserved: true as const,
    humanReviewRequired: overallDecision !== "ALLOW"
  };
  return {
    ...payload,
    recordHash: createClinicalEvidenceHash({ type: "evidence-synthesis-record", payload })
  };
}

export type EvidenceLedger = {
  ledgerId: string;
  tenantId: string;
  contextManifestHash: string;
  evidenceRecordHashes: string[];
  sourceFingerprints: string[];
  claimIds: string[];
  previousLedgerHash: string | null;
  createdAt: string;
  rawPhiStored: false;
  protectedChainOfThoughtStored: false;
  ledgerHash: string;
};

export function buildEvidenceLedger(
  input: Omit<
    EvidenceLedger,
    "rawPhiStored" | "protectedChainOfThoughtStored" | "ledgerHash"
  >
): EvidenceLedger {
  requireIdentifier(input.ledgerId, "evidence ledger id");
  requireIdentifier(input.tenantId, "evidence ledger tenant id");
  requireHash(input.contextManifestHash, "evidence context manifest");
  input.evidenceRecordHashes.forEach((hash) =>
    requireHash(hash, "evidence record")
  );
  input.sourceFingerprints.forEach((hash) => requireHash(hash, "evidence source"));
  if (input.previousLedgerHash) {
    requireHash(input.previousLedgerHash, "previous evidence ledger");
  }
  requireIsoTimestamp(input.createdAt, "evidence ledger createdAt");
  if (!input.evidenceRecordHashes.length || !input.sourceFingerprints.length) {
    throw new Error("Evidence ledger requires evidence records and source fingerprints");
  }
  const payload = {
    ...input,
    evidenceRecordHashes: canonical(input.evidenceRecordHashes),
    sourceFingerprints: canonical(input.sourceFingerprints),
    claimIds: canonical(input.claimIds),
    rawPhiStored: false as const,
    protectedChainOfThoughtStored: false as const
  };
  return {
    ...payload,
    ledgerHash: createClinicalEvidenceHash({ type: "evidence-ledger", payload })
  };
}

export type AgentRiskDimension = "low" | "moderate" | "high" | "prohibited";

export type AgentRiskProfile = {
  profileId: string;
  tenantId: string;
  agentId: string;
  assessedByActorId: string;
  dataSensitivity: AgentRiskDimension;
  autonomy: "read" | "draft" | "recommend" | "execute";
  clinicalCriticality: AgentRiskDimension;
  reversibility: "reversible" | "partially-reversible" | "irreversible";
  blastRadius: AgentRiskDimension;
  externalSideEffects: boolean;
  multiAgentInvolvement: boolean;
  calculatedRiskTier: RiskLevel;
  requiredControlTier: "TIER_0" | "TIER_1" | "TIER_2" | "TIER_3";
  independentAssessmentRequired: boolean;
  selfLoweringAllowed: false;
  selfApprovalAllowed: false;
  assessedAt: string;
  profileHash: string;
};

const dimensionScore: Record<AgentRiskDimension, number> = {
  low: 0,
  moderate: 1,
  high: 2,
  prohibited: 4
};

export function buildAgentRiskProfile(
  input: Omit<
    AgentRiskProfile,
    | "calculatedRiskTier"
    | "requiredControlTier"
    | "independentAssessmentRequired"
    | "selfLoweringAllowed"
    | "selfApprovalAllowed"
    | "profileHash"
  >
): AgentRiskProfile {
  requireIdentifier(input.profileId, "agent risk profile id");
  requireIdentifier(input.tenantId, "agent risk tenant id");
  requireIdentifier(input.agentId, "agent id");
  requireIdentifier(input.assessedByActorId, "risk assessor id");
  requireIsoTimestamp(input.assessedAt, "assessedAt");
  const score =
    dimensionScore[input.dataSensitivity] +
    dimensionScore[input.clinicalCriticality] +
    dimensionScore[input.blastRadius] +
    (input.autonomy === "execute" ? 2 : input.autonomy === "recommend" ? 1 : 0) +
    (input.reversibility === "irreversible" ? 2 : input.reversibility === "partially-reversible" ? 1 : 0) +
    (input.externalSideEffects ? 1 : 0) +
    (input.multiAgentInvolvement ? 1 : 0);
  const hasProhibitedDimension =
    input.dataSensitivity === "prohibited" ||
    input.clinicalCriticality === "prohibited" ||
    input.blastRadius === "prohibited";
  const calculatedRiskTier: RiskLevel = hasProhibitedDimension
    ? "prohibited"
    : score >= 7
      ? "high"
      : score >= 3
        ? "moderate"
        : "low";
  const requiredControlTier: AgentRiskProfile["requiredControlTier"] =
    calculatedRiskTier === "prohibited"
      ? "TIER_3"
      : calculatedRiskTier === "high"
        ? "TIER_3"
        : calculatedRiskTier === "moderate"
          ? "TIER_2"
          : input.autonomy === "read"
            ? "TIER_0"
            : "TIER_1";
  const independentAssessmentRequired =
    input.assessedByActorId === input.agentId ||
    calculatedRiskTier === "high" ||
    calculatedRiskTier === "prohibited";
  const payload = {
    ...input,
    calculatedRiskTier,
    requiredControlTier,
    independentAssessmentRequired,
    selfLoweringAllowed: false as const,
    selfApprovalAllowed: false as const
  };
  return {
    ...payload,
    profileHash: createClinicalEvidenceHash({ type: "agent-risk-profile", payload })
  };
}

export type AgentExecutionReceipt = {
  receiptId: string;
  tenantId: string;
  intentDigest: string;
  jobManifestHash: string;
  humanIdentityHash: string | null;
  agentIdentityHash: string;
  delegatedAuthorityHash: string;
  modelVersion: string;
  promptVersion: string;
  toolVersions: string[];
  schemaVersions: string[];
  artifactFingerprints: string[];
  policyVersion: string;
  sourceFingerprints: string[];
  redactedArgumentDigest: string;
  approvalReferences: string[];
  overrideReferences: string[];
  retries: number;
  costUsd: number;
  latencyMs: number;
  resultDigest: string | null;
  finalDisposition: "allowed" | "blocked" | "awaiting-human" | "verified" | "failed";
  causalTraceId: string;
  containsRawPhi: false;
  containsSecrets: false;
  createdAt: string;
  previousReceiptHash: string | null;
  receiptHash: string;
};

export function createAgentExecutionReceipt(
  input: Omit<AgentExecutionReceipt, "containsRawPhi" | "containsSecrets" | "receiptHash">
): AgentExecutionReceipt {
  for (const [label, value] of [
    ["intent", input.intentDigest],
    ["job manifest", input.jobManifestHash],
    ["agent identity", input.agentIdentityHash],
    ["delegated authority", input.delegatedAuthorityHash],
    ["argument", input.redactedArgumentDigest]
  ] as const) {
    requireHash(value, label);
  }
  if (input.resultDigest) requireHash(input.resultDigest, "result");
  input.sourceFingerprints.forEach((value) => requireHash(value, "source"));
  input.artifactFingerprints.forEach((value) => requireHash(value, "artifact"));
  requireIsoTimestamp(input.createdAt, "createdAt");
  requireFiniteNonnegative(input.retries, "retries");
  requireFiniteNonnegative(input.costUsd, "cost");
  requireFiniteNonnegative(input.latencyMs, "latency");
  const safe = redactForTelemetry(input) as typeof input;
  const payload = {
    ...safe,
    toolVersions: canonical(safe.toolVersions),
    schemaVersions: canonical(safe.schemaVersions),
    artifactFingerprints: canonical(safe.artifactFingerprints),
    sourceFingerprints: canonical(safe.sourceFingerprints),
    approvalReferences: canonical(safe.approvalReferences),
    overrideReferences: canonical(safe.overrideReferences),
    containsRawPhi: false as const,
    containsSecrets: false as const
  };
  return {
    ...payload,
    receiptHash: createClinicalEvidenceHash({ type: "agent-execution-receipt", payload })
  };
}

export type ClinicalResponseEvaluation = {
  evaluationId: string;
  responseDigest: string;
  rubricVersion: string;
  scores: {
    medicalAccuracy: number;
    evidenceFidelity: number;
    urgencyAndTriageBehavior: number;
    patientSafety: number;
    clarityAndEmpathy: number;
    appropriateEscalation: number;
    sourceCoverage: number;
  };
  unsupportedClaimCount: number;
  correctionBurden: number;
  subgroupResults: Array<{
    subgroupId: string;
    sampleSize: number;
    passed: boolean;
    severeErrorCount: number;
  }>;
  worstCellResults: Array<{
    cellId: string;
    material: boolean;
    passed: boolean;
    sampleSize: number;
    minimumSampleSize: number;
  }>;
  hardSafetyFailures: string[];
  evaluatorIdentityHashes: string[];
  llmJudgeUsed: boolean;
  qualifiedHumanEvaluatorCount: number;
  interRaterAgreement: number | null;
  minimumInterRaterAgreement: number;
  calibrationEvidenceReferences: string[];
  aggregateScore: number;
  decision: PolicyDecision;
  reasonCodes: string[];
  promotionEligible: boolean;
  evaluatedAt: string;
  evaluationHash: string;
};

export function evaluateClinicalResponse(
  input: Omit<
    ClinicalResponseEvaluation,
    "aggregateScore" | "decision" | "reasonCodes" | "promotionEligible" | "evaluationHash"
  >
): ClinicalResponseEvaluation {
  requireIdentifier(input.evaluationId, "clinical response evaluation id");
  requireHash(input.responseDigest, "response");
  requireIsoTimestamp(input.evaluatedAt, "evaluatedAt");
  Object.entries(input.scores).forEach(([label, value]) =>
    requireUnitInterval(value, label)
  );
  requireFiniteNonnegative(input.unsupportedClaimCount, "unsupported claim count");
  requireFiniteNonnegative(input.correctionBurden, "correction burden");
  requireUnitInterval(input.minimumInterRaterAgreement, "minimum inter-rater agreement");
  if (input.interRaterAgreement !== null) {
    requireUnitInterval(input.interRaterAgreement, "inter-rater agreement");
  }

  const reasonCodes: string[] = [];
  if (input.hardSafetyFailures.length) reasonCodes.push("HARD_SAFETY_FAILURE");
  if (input.worstCellResults.some((cell) => cell.material && !cell.passed)) {
    reasonCodes.push("WORST_MATERIAL_CELL_FAILED");
  }
  if (input.worstCellResults.some((cell) => cell.material && cell.sampleSize < cell.minimumSampleSize)) {
    reasonCodes.push("WORST_CELL_UNDERPOWERED");
  }
  if (input.subgroupResults.some((result) => !result.passed || result.severeErrorCount > 0)) {
    reasonCodes.push("SUBGROUP_SAFETY_OR_PERFORMANCE_FAILED");
  }
  if (input.unsupportedClaimCount > 0) reasonCodes.push("UNSUPPORTED_CLAIMS_PRESENT");
  if (input.scores.sourceCoverage < 0.9) reasonCodes.push("SOURCE_COVERAGE_BELOW_FLOOR");
  if (input.llmJudgeUsed && input.qualifiedHumanEvaluatorCount === 0) {
    reasonCodes.push("LLM_JUDGE_CANNOT_SOLELY_AUTHORIZE");
  }
  if (
    input.interRaterAgreement === null ||
    input.interRaterAgreement < input.minimumInterRaterAgreement
  ) {
    reasonCodes.push("EVALUATOR_CALIBRATION_INSUFFICIENT");
  }
  if (!input.calibrationEvidenceReferences.length) {
    reasonCodes.push("CALIBRATION_EVIDENCE_REQUIRED");
  }

  const values = Object.values(input.scores);
  const aggregateScore = values.reduce((sum, value) => sum + value, 0) / values.length;
  const hardBlock = reasonCodes.some((reason) =>
    [
      "HARD_SAFETY_FAILURE",
      "WORST_MATERIAL_CELL_FAILED",
      "SUBGROUP_SAFETY_OR_PERFORMANCE_FAILED"
    ].includes(reason)
  );
  const decision: PolicyDecision = hardBlock
    ? "BLOCK"
    : reasonCodes.length
      ? "REQUIRE_HUMAN"
      : "ALLOW";
  const payload = {
    ...input,
    hardSafetyFailures: canonical(input.hardSafetyFailures),
    evaluatorIdentityHashes: canonical(input.evaluatorIdentityHashes),
    calibrationEvidenceReferences: canonical(input.calibrationEvidenceReferences),
    aggregateScore,
    decision,
    reasonCodes: canonical(reasonCodes),
    promotionEligible: decision === "ALLOW"
  };
  return {
    ...payload,
    evaluationHash: createClinicalEvidenceHash({ type: "clinical-response-evaluation", payload })
  };
}

export type ExpertDeterminationSignature = {
  expertIdentityHash: string;
  qualificationEvidenceReference: string;
  signedAt: string;
  signatureDigest: string;
  verificationStatus: "unverified" | "verified-by-trusted-external-verifier";
};

export type DeidentificationRelease = {
  releaseId: string;
  tenantId: string;
  datasetFingerprint: string;
  transformationFingerprint: string;
  directIdentifiersRemoved: string[];
  proposedQuasiIdentifiers: string[];
  measuredRisk: {
    kAnonymity: number | null;
    lDiversity: number | null;
    tCloseness: number | null;
    smallCellCount: number;
    linkageRiskAssessment: string;
  };
  policyThresholdReference: string;
  intendedPopulation: string;
  threatModel: string;
  transformations: Array<{
    field: string;
    method: "suppression" | "generalization" | "replacement" | "removal";
  }>;
  utilityLoss: number;
  intendedUseLimitations: string[];
  requestedReleaseBasis: "synthetic-only" | "expert-determination";
  expertDeterminationSignature: ExpertDeterminationSignature | null;
  status:
    | "synthetic_only_not_for_release"
    | "blocked_external_expert_verification"
    | "approved_for_declared_purpose";
  deidentifiedByExpertDeterminationDeclared: boolean;
  reasonCodes: string[];
  evaluatedAt: string;
  releaseHash: string;
};

export type DeidentificationRiskAssessment = {
  assessmentId: string;
  tenantId: string;
  datasetFingerprint: string;
  rowCount: number;
  proposedQuasiIdentifiers: Array<{
    field: string;
    distinctValueCount: number;
    minimumEquivalenceClassSize: number;
  }>;
  sensitiveAttributeDiversity: Array<{
    field: string;
    minimumDistinctValuesPerEquivalenceClass: number;
  }>;
  populationDefinition: string;
  threatModel: string;
  releaseContext: string;
  transformations: Array<{
    field: string;
    method: "suppression" | "generalization" | "replacement" | "removal";
  }>;
  beforeTransformation: {
    kAnonymity: number | null;
    lDiversity: number | null;
    uniquenessRate: number;
  };
  afterTransformation: {
    kAnonymity: number | null;
    lDiversity: number | null;
    uniquenessRate: number;
  };
  utilityLoss: number;
  testOnly: boolean;
  expertDeterminationStatus:
    | "not-requested"
    | "external-expert-required"
    | "verified-by-trusted-external-verifier";
  legalSafetyDeclared: false;
  decision: PolicyDecision;
  reasonCodes: string[];
  evaluatedAt: string;
  assessmentHash: string;
};

export function evaluateDeidentificationRiskAssessment(
  input: Omit<
    DeidentificationRiskAssessment,
    "legalSafetyDeclared" | "decision" | "reasonCodes" | "assessmentHash"
  >
): DeidentificationRiskAssessment {
  requireIdentifier(input.assessmentId, "de-identification assessment id");
  requireIdentifier(input.tenantId, "de-identification assessment tenant id");
  requireHash(input.datasetFingerprint, "de-identification assessment dataset");
  requireIsoTimestamp(input.evaluatedAt, "de-identification assessment evaluatedAt");
  requireFiniteNonnegative(input.rowCount, "de-identification row count");
  requireUnitInterval(
    input.beforeTransformation.uniquenessRate,
    "before uniqueness rate"
  );
  requireUnitInterval(
    input.afterTransformation.uniquenessRate,
    "after uniqueness rate"
  );
  requireUnitInterval(input.utilityLoss, "de-identification utility loss");
  if (
    !input.populationDefinition.trim() ||
    !input.threatModel.trim() ||
    !input.releaseContext.trim() ||
    !input.proposedQuasiIdentifiers.length ||
    !input.transformations.length
  ) {
    throw new Error(
      "De-identification risk assessment requires population, threat, release context, quasi-identifiers, and transformations"
    );
  }
  input.proposedQuasiIdentifiers.forEach((entry) => {
    requireFiniteNonnegative(entry.distinctValueCount, "quasi-identifier count");
    requireFiniteNonnegative(
      entry.minimumEquivalenceClassSize,
      "equivalence class size"
    );
  });
  input.sensitiveAttributeDiversity.forEach((entry) =>
    requireFiniteNonnegative(
      entry.minimumDistinctValuesPerEquivalenceClass,
      "sensitive-attribute diversity"
    )
  );
  const reasonCodes: string[] = [];
  if (
    input.afterTransformation.kAnonymity === null ||
    input.afterTransformation.lDiversity === null
  ) {
    reasonCodes.push("DEIDENTIFICATION_RISK_METRICS_INCOMPLETE");
  }
  if (
    input.afterTransformation.uniquenessRate >=
    input.beforeTransformation.uniquenessRate
  ) {
    reasonCodes.push("DEIDENTIFICATION_UNIQUENESS_NOT_REDUCED");
  }
  if (input.expertDeterminationStatus !== "verified-by-trusted-external-verifier") {
    reasonCodes.push("QUALIFIED_EXTERNAL_EXPERT_DETERMINATION_REQUIRED");
  }
  if (input.testOnly) reasonCodes.push("TEST_ONLY_NOT_RELEASE_AUTHORITY");
  const decision: PolicyDecision =
    input.expertDeterminationStatus ===
      "verified-by-trusted-external-verifier" && !input.testOnly
      ? "REQUIRE_HUMAN"
      : "BLOCK";
  const payload = {
    ...input,
    proposedQuasiIdentifiers: [...input.proposedQuasiIdentifiers].sort(
      (left, right) => left.field.localeCompare(right.field)
    ),
    sensitiveAttributeDiversity: [
      ...input.sensitiveAttributeDiversity
    ].sort((left, right) => left.field.localeCompare(right.field)),
    transformations: [...input.transformations].sort((left, right) =>
      `${left.field}:${left.method}`.localeCompare(
        `${right.field}:${right.method}`
      )
    ),
    legalSafetyDeclared: false as const,
    decision,
    reasonCodes: canonical(reasonCodes)
  };
  return {
    ...payload,
    assessmentHash: createClinicalEvidenceHash({
      type: "deidentification-risk-assessment",
      payload
    })
  };
}

export function evaluateDeidentificationRelease(
  input: Omit<
    DeidentificationRelease,
    | "status"
    | "deidentifiedByExpertDeterminationDeclared"
    | "reasonCodes"
    | "releaseHash"
  >
): DeidentificationRelease {
  requireIdentifier(input.releaseId, "de-identification release id");
  requireIdentifier(input.tenantId, "de-identification tenant id");
  requireHash(input.datasetFingerprint, "dataset");
  requireHash(input.transformationFingerprint, "transformation");
  requireIsoTimestamp(input.evaluatedAt, "evaluatedAt");
  requireFiniteNonnegative(input.measuredRisk.smallCellCount, "small-cell count");
  requireUnitInterval(input.utilityLoss, "utility loss");
  if (
    !input.policyThresholdReference.trim() ||
    !input.intendedPopulation.trim() ||
    !input.threatModel.trim()
  ) {
    throw new Error("De-identification release requires an approved threshold reference, intended population, and threat model");
  }
  if (!input.intendedUseLimitations.length || !input.transformations.length) {
    throw new Error("De-identification release requires transformations and intended-use limitations");
  }

  const signature = input.expertDeterminationSignature;
  if (signature) {
    requireHash(signature.expertIdentityHash, "expert identity");
    requireHash(signature.signatureDigest, "expert signature");
    requireIsoTimestamp(signature.signedAt, "expert signedAt");
  }
  const externallyVerified =
    input.requestedReleaseBasis === "expert-determination" &&
    signature?.verificationStatus === "verified-by-trusted-external-verifier" &&
    Boolean(signature.qualificationEvidenceReference.trim());
  const reasonCodes =
    input.requestedReleaseBasis === "synthetic-only"
      ? ["SYNTHETIC_ONLY_NOT_A_DEIDENTIFICATION_RELEASE"]
      : externallyVerified
        ? ["EXTERNAL_EXPERT_DETERMINATION_VERIFIED_FOR_DECLARED_PURPOSE"]
        : ["QUALIFIED_EXTERNAL_EXPERT_SIGNATURE_REQUIRED"];
  const status =
    input.requestedReleaseBasis === "synthetic-only"
      ? ("synthetic_only_not_for_release" as const)
      : externallyVerified
        ? ("approved_for_declared_purpose" as const)
        : ("blocked_external_expert_verification" as const);
  const payload = {
    ...input,
    directIdentifiersRemoved: canonical(input.directIdentifiersRemoved),
    proposedQuasiIdentifiers: canonical(input.proposedQuasiIdentifiers),
    intendedUseLimitations: canonical(input.intendedUseLimitations),
    status,
    deidentifiedByExpertDeterminationDeclared: externallyVerified,
    reasonCodes
  };
  return {
    ...payload,
    releaseHash: createClinicalEvidenceHash({ type: "deidentification-release", payload })
  };
}

export type GovernedSkillRunbook = {
  runbookId: string;
  version: string;
  skillId: string;
  ownerIdentityHash: string;
  skillAgentIdentityHash: string;
  intendedJob: string;
  permittedTools: string[];
  permittedResources: string[];
  permittedDataClasses: DataClassification[];
  permittedDestinations: string[];
  limits: TaskScopedToolContract["budgets"];
  requiredCompetenceEvidence: string[];
  requiredEvidence: string[];
  signatureStatus: "unsigned" | "verified";
  issuedAt: string;
  expiresAt: string;
  revocationState: "active" | "revoked";
  dryRunEvidenceReference: string | null;
  rollbackPlan: string;
  maySelfGrantAuthority: false;
  admitted: boolean;
  reasonCodes: string[];
  runbookHash: string;
};

export function buildGovernedSkillRunbook(
  input: Omit<
    GovernedSkillRunbook,
    "maySelfGrantAuthority" | "admitted" | "reasonCodes" | "runbookHash"
  >
): GovernedSkillRunbook {
  requireIdentifier(input.runbookId, "skill runbook id");
  requireIdentifier(input.skillId, "skill id");
  requireHash(input.ownerIdentityHash, "skill owner");
  requireHash(input.skillAgentIdentityHash, "skill agent identity");
  requireIsoTimestamp(input.issuedAt, "issuedAt");
  requireIsoTimestamp(input.expiresAt, "expiresAt");
  if (
    input.ownerIdentityHash === input.skillAgentIdentityHash ||
    containsWildcard(input.permittedTools) ||
    containsWildcard(input.permittedResources)
  ) {
    throw new Error("Skills require independent ownership and bounded authority");
  }
  const reasonCodes: string[] = [];
  if (input.signatureStatus !== "verified") reasonCodes.push("SKILL_MANIFEST_UNSIGNED");
  if (input.revocationState !== "active") reasonCodes.push("SKILL_REVOKED");
  if (!input.dryRunEvidenceReference) reasonCodes.push("SKILL_DRY_RUN_REQUIRED");
  if (!input.requiredCompetenceEvidence.length) reasonCodes.push("SKILL_COMPETENCE_EVIDENCE_REQUIRED");
  if (!input.rollbackPlan.trim()) reasonCodes.push("SKILL_ROLLBACK_PLAN_REQUIRED");
  const payload = {
    ...input,
    permittedTools: canonical(input.permittedTools),
    permittedResources: canonical(input.permittedResources),
    permittedDataClasses: [...new Set(input.permittedDataClasses)].sort(),
    permittedDestinations: canonical(input.permittedDestinations),
    requiredCompetenceEvidence: canonical(input.requiredCompetenceEvidence),
    requiredEvidence: canonical(input.requiredEvidence),
    maySelfGrantAuthority: false as const,
    admitted: reasonCodes.length === 0,
    reasonCodes: canonical(reasonCodes)
  };
  return {
    ...payload,
    runbookHash: createClinicalEvidenceHash({ type: "governed-skill-runbook", payload })
  };
}

export type ModelChangeSet = {
  changeSetId: string;
  tenantId: string;
  fromModelArtifactHash: string;
  toModelArtifactHash: string;
  affectedTaskProfiles: string[];
  evaluationEvidenceReferences: string[];
  shadowRunEvidenceReference: string | null;
  canaryEvidenceReference: string | null;
  rollbackTargetHash: string;
  requestedByIdentityHash: string;
  approvedByIdentityHash: string | null;
  status: "candidate" | "review_required" | "approved_for_canary" | "rejected";
  automaticPromotionAllowed: false;
  liveClinicalActivationAllowed: false;
  reasonCodes: string[];
  createdAt: string;
  changeSetHash: string;
};

export function buildModelChangeSet(
  input: Omit<ModelChangeSet, "status" | "automaticPromotionAllowed" | "liveClinicalActivationAllowed" | "reasonCodes" | "changeSetHash">
): ModelChangeSet {
  requireIdentifier(input.changeSetId, "model change set id");
  requireHash(input.fromModelArtifactHash, "from model artifact");
  requireHash(input.toModelArtifactHash, "to model artifact");
  requireHash(input.rollbackTargetHash, "rollback target");
  requireHash(input.requestedByIdentityHash, "requester identity");
  if (input.approvedByIdentityHash) requireHash(input.approvedByIdentityHash, "approver identity");
  requireIsoTimestamp(input.createdAt, "createdAt");
  const reasonCodes: string[] = [];
  if (input.fromModelArtifactHash === input.toModelArtifactHash) reasonCodes.push("MODEL_ARTIFACT_UNCHANGED");
  if (!input.evaluationEvidenceReferences.length) reasonCodes.push("MODEL_REVALIDATION_REQUIRED");
  if (!input.shadowRunEvidenceReference) reasonCodes.push("MODEL_SHADOW_EVIDENCE_REQUIRED");
  if (!input.canaryEvidenceReference) reasonCodes.push("MODEL_CANARY_EVIDENCE_REQUIRED");
  if (!input.approvedByIdentityHash) reasonCodes.push("INDEPENDENT_MODEL_APPROVAL_REQUIRED");
  if (
    input.approvedByIdentityHash &&
    input.approvedByIdentityHash === input.requestedByIdentityHash
  ) {
    reasonCodes.push("MODEL_SELF_APPROVAL_PROHIBITED");
  }
  const status =
    reasonCodes.length === 0 ? ("approved_for_canary" as const) : ("review_required" as const);
  const payload = {
    ...input,
    affectedTaskProfiles: canonical(input.affectedTaskProfiles),
    evaluationEvidenceReferences: canonical(input.evaluationEvidenceReferences),
    status,
    automaticPromotionAllowed: false as const,
    liveClinicalActivationAllowed: false as const,
    reasonCodes: canonical(reasonCodes)
  };
  return {
    ...payload,
    changeSetHash: createClinicalEvidenceHash({ type: "model-change-set", payload })
  };
}

export type WorkloadPlacementDecision = {
  decisionId: string;
  tenantId: string;
  dataClassification: DataClassification;
  requiredResidency: string;
  selectedPlacement: string | null;
  selectedProviderId: string | null;
  phiEligible: boolean;
  residenceVerified: boolean;
  baaVerified: boolean;
  externalProcessingAllowed: boolean;
  decision: PolicyDecision;
  reasonCodes: string[];
  evaluatedAt: string;
  decisionHash: string;
};

export function buildWorkloadPlacementDecision(
  input: Omit<WorkloadPlacementDecision, "externalProcessingAllowed" | "decision" | "reasonCodes" | "decisionHash">
): WorkloadPlacementDecision {
  requireIdentifier(input.decisionId, "placement decision id");
  requireIdentifier(input.tenantId, "placement tenant id");
  requireIsoTimestamp(input.evaluatedAt, "evaluatedAt");
  const reasonCodes: string[] = [];
  if (!input.selectedPlacement || !input.selectedProviderId) reasonCodes.push("NO_PLACEMENT_AVAILABLE");
  if (!input.residenceVerified) reasonCodes.push("RESIDENCY_UNVERIFIED");
  if (input.dataClassification === "phi-blocked") reasonCodes.push("PHI_PROCESSING_BLOCKED");
  if (input.phiEligible && !input.baaVerified) reasonCodes.push("BAA_UNVERIFIED");
  const decision: PolicyDecision = reasonCodes.length ? "BLOCK" : "ALLOW";
  const payload = {
    ...input,
    externalProcessingAllowed:
      decision === "ALLOW" &&
      input.dataClassification !== "phi-blocked" &&
      input.residenceVerified &&
      (!input.phiEligible || input.baaVerified),
    decision,
    reasonCodes: canonical(reasonCodes)
  };
  return {
    ...payload,
    decisionHash: createClinicalEvidenceHash({ type: "workload-placement-decision", payload })
  };
}

export type ProtectionLevelAgreement = {
  agreementId: string;
  tenantId: string;
  dataClasses: DataClassification[];
  requiredControls: string[];
  prohibitedDestinations: string[];
  retentionPolicyReference: string;
  incidentResponseOwnerRole: string;
  effectiveAt: string;
  expiresAt: string;
  approvalReferences: string[];
  productionActivationAllowed: false;
  agreementHash: string;
};

export function buildProtectionLevelAgreement(
  input: Omit<ProtectionLevelAgreement, "productionActivationAllowed" | "agreementHash">
): ProtectionLevelAgreement {
  requireIdentifier(input.agreementId, "protection agreement id");
  requireIdentifier(input.tenantId, "protection tenant id");
  requireIsoTimestamp(input.effectiveAt, "effectiveAt");
  requireIsoTimestamp(input.expiresAt, "expiresAt");
  if (
    !input.requiredControls.length ||
    !input.retentionPolicyReference.trim() ||
    !input.incidentResponseOwnerRole.trim()
  ) {
    throw new Error("Protection agreement requires controls, retention, and incident ownership");
  }
  const payload = {
    ...input,
    dataClasses: [...new Set(input.dataClasses)].sort(),
    requiredControls: canonical(input.requiredControls),
    prohibitedDestinations: canonical(input.prohibitedDestinations),
    approvalReferences: canonical(input.approvalReferences),
    productionActivationAllowed: false as const
  };
  return {
    ...payload,
    agreementHash: createClinicalEvidenceHash({ type: "protection-level-agreement", payload })
  };
}

export type PostImplementationReview = {
  reviewId: string;
  workflowId: string;
  baselineEvidenceReference: string;
  observationWindow: string;
  validatedTaskCompletionRate: number;
  correctionRate: number;
  escalationRate: number;
  nearMissCount: number;
  costPerValidatedSuccessfulTaskUsd: number;
  accountableOwnerIdentityHash: string;
  evidenceStrength: "low" | "moderate" | "high";
  scaleThresholdMet: boolean;
  stopThresholdTriggered: boolean;
  decision: "continue-review" | "pause" | "rollback" | "eligible-for-scale-review";
  reviewedAt: string;
  reviewHash: string;
};

export function buildPostImplementationReview(
  input: Omit<PostImplementationReview, "decision" | "reviewHash">
): PostImplementationReview {
  requireIdentifier(input.reviewId, "post-implementation review id");
  requireIdentifier(input.workflowId, "workflow id");
  requireHash(input.accountableOwnerIdentityHash, "accountable owner identity");
  requireIsoTimestamp(input.reviewedAt, "reviewedAt");
  requireUnitInterval(input.validatedTaskCompletionRate, "task completion rate");
  requireUnitInterval(input.correctionRate, "correction rate");
  requireUnitInterval(input.escalationRate, "escalation rate");
  requireFiniteNonnegative(input.nearMissCount, "near-miss count");
  requireFiniteNonnegative(
    input.costPerValidatedSuccessfulTaskUsd,
    "cost per validated successful task"
  );
  const decision = input.stopThresholdTriggered
    ? ("rollback" as const)
    : input.scaleThresholdMet && input.evidenceStrength === "high"
      ? ("eligible-for-scale-review" as const)
      : ("continue-review" as const);
  const payload = { ...input, decision };
  return {
    ...payload,
    reviewHash: createClinicalEvidenceHash({ type: "post-implementation-review", payload })
  };
}

export type CorrectableClinicalOutput = {
  outputId: string;
  tenantId: string;
  generatedByAgentId: string;
  originalOutputDigest: string;
  contextManifestHash: string;
  evidenceRecordHash: string;
  modelVersion: string;
  toolVersions: string[];
  sourceFingerprints: string[];
  availableActions: ["accept", "edit", "reject", "reroute", "escalate"];
  status:
    | "draft"
    | "accepted"
    | "edited"
    | "rejected"
    | "rerouted"
    | "escalated";
  reviews: Array<{
    action: "accept" | "edit" | "reject" | "reroute" | "escalate";
    reviewerIdentityHash: string;
    reasonCode: string;
    correctionDigest: string | null;
    reviewedAt: string;
    reviewHash: string;
  }>;
  originalPreserved: true;
  correctionLearningState: "none" | "quarantined-review-required";
  productionSelfTrainingAllowed: false;
  createdAt: string;
  outputHash: string;
};

export function buildCorrectableClinicalOutput(
  input: Omit<
    CorrectableClinicalOutput,
    | "availableActions"
    | "status"
    | "reviews"
    | "originalPreserved"
    | "correctionLearningState"
    | "productionSelfTrainingAllowed"
    | "outputHash"
  >
): CorrectableClinicalOutput {
  requireIdentifier(input.outputId, "clinical output id");
  requireIdentifier(input.tenantId, "clinical output tenant id");
  requireIdentifier(input.generatedByAgentId, "generator agent id");
  requireHash(input.originalOutputDigest, "original output");
  requireHash(input.contextManifestHash, "context manifest");
  requireHash(input.evidenceRecordHash, "evidence record");
  input.sourceFingerprints.forEach((fingerprint) => requireHash(fingerprint, "source"));
  requireIsoTimestamp(input.createdAt, "createdAt");
  const availableActions: CorrectableClinicalOutput["availableActions"] = [
    "accept",
    "edit",
    "reject",
    "reroute",
    "escalate"
  ];
  const payload = {
    ...input,
    toolVersions: canonical(input.toolVersions),
    sourceFingerprints: canonical(input.sourceFingerprints),
    availableActions,
    status: "draft" as const,
    reviews: [],
    originalPreserved: true as const,
    correctionLearningState: "none" as const,
    productionSelfTrainingAllowed: false as const
  };
  return {
    ...payload,
    outputHash: createClinicalEvidenceHash({ type: "correctable-clinical-output", payload })
  };
}

export function recordCorrectableClinicalReview(
  output: CorrectableClinicalOutput,
  input: {
    action: "accept" | "edit" | "reject" | "reroute" | "escalate";
    reviewerIdentityHash: string;
    reviewerActorId: string;
    reasonCode: string;
    correctionDigest: string | null;
    reviewedAt: string;
  }
): CorrectableClinicalOutput {
  if (input.reviewerActorId === output.generatedByAgentId) {
    throw new Error("Generating agents cannot review or approve their own clinical output");
  }
  requireHash(input.reviewerIdentityHash, "reviewer identity");
  requireIsoTimestamp(input.reviewedAt, "reviewedAt");
  if (input.action === "edit" && !input.correctionDigest) {
    throw new Error("Edited clinical output requires a correction digest");
  }
  if (input.correctionDigest) requireHash(input.correctionDigest, "correction");
  const reviewWithoutHash = {
    action: input.action,
    reviewerIdentityHash: input.reviewerIdentityHash,
    reasonCode: input.reasonCode,
    correctionDigest: input.correctionDigest,
    reviewedAt: input.reviewedAt
  };
  const review = {
    ...reviewWithoutHash,
    reviewHash: createClinicalEvidenceHash({
      type: "correctable-clinical-review",
      outputId: output.outputId,
      originalOutputDigest: output.originalOutputDigest,
      review: reviewWithoutHash
    })
  };
  const payload = {
    ...output,
    status:
      input.action === "accept"
        ? ("accepted" as const)
        : input.action === "edit"
          ? ("edited" as const)
          : input.action === "reject"
            ? ("rejected" as const)
            : input.action === "reroute"
              ? ("rerouted" as const)
              : ("escalated" as const),
    reviews: [...output.reviews, review],
    correctionLearningState:
      input.action === "accept" ? ("none" as const) : ("quarantined-review-required" as const)
  };
  const withoutHash = { ...payload };
  delete (withoutHash as Partial<CorrectableClinicalOutput>).outputHash;
  return {
    ...withoutHash,
    outputHash: createClinicalEvidenceHash({ type: "correctable-clinical-output", payload: withoutHash })
  };
}

export type DecisionProvenanceRecord = {
  recordId: string;
  tenantId: string;
  workflowId: string;
  outputId: string;
  originalOutputDigest: string;
  contextManifestHash: string;
  evidenceLedgerHash: string;
  modelArtifactHash: string;
  modelConfigurationHash: string;
  promptVersion: string;
  toolVersions: string[];
  policyVersion: string;
  decision:
    | "accepted"
    | "edited"
    | "rejected"
    | "rerouted"
    | "escalated";
  reviewerIdentityHash: string;
  reviewerRole: string;
  reviewerCompetencyEvidence: string[];
  correctionDigest: string | null;
  reasonCode: string;
  downstreamConsumerIds: string[];
  downstreamActionDigests: string[];
  supersedesRecordHash: string | null;
  occurredAt: string;
  originalPreserved: true;
  productionSelfTrainingAllowed: false;
  provenanceHash: string;
};

export function buildDecisionProvenanceRecord(
  input: Omit<
    DecisionProvenanceRecord,
    "originalPreserved" | "productionSelfTrainingAllowed" | "provenanceHash"
  >
): DecisionProvenanceRecord {
  requireIdentifier(input.recordId, "decision provenance record id");
  requireIdentifier(input.tenantId, "decision provenance tenant id");
  requireIdentifier(input.workflowId, "decision provenance workflow id");
  requireIdentifier(input.outputId, "decision provenance output id");
  [
    input.originalOutputDigest,
    input.contextManifestHash,
    input.evidenceLedgerHash,
    input.modelArtifactHash,
    input.modelConfigurationHash,
    input.reviewerIdentityHash
  ].forEach((hash) => requireHash(hash, "decision provenance"));
  if (input.correctionDigest) requireHash(input.correctionDigest, "correction");
  if (input.supersedesRecordHash) {
    requireHash(input.supersedesRecordHash, "superseded decision provenance");
  }
  input.downstreamActionDigests.forEach((hash) =>
    requireHash(hash, "downstream action")
  );
  requireIsoTimestamp(input.occurredAt, "decision provenance occurredAt");
  if (
    !input.reviewerRole.trim() ||
    !input.reasonCode.trim() ||
    !input.reviewerCompetencyEvidence.length
  ) {
    throw new Error(
      "Decision provenance requires reviewer role, competency, and reason"
    );
  }
  if (input.decision === "edited" && !input.correctionDigest) {
    throw new Error("Edited decisions require a correction digest");
  }
  const payload = {
    ...input,
    toolVersions: canonical(input.toolVersions),
    reviewerCompetencyEvidence: canonical(
      input.reviewerCompetencyEvidence
    ),
    downstreamConsumerIds: canonical(input.downstreamConsumerIds),
    downstreamActionDigests: canonical(input.downstreamActionDigests),
    originalPreserved: true as const,
    productionSelfTrainingAllowed: false as const
  };
  return {
    ...payload,
    provenanceHash: createClinicalEvidenceHash({
      type: "decision-provenance-record",
      payload
    })
  };
}

export function getP32GovernanceRecordsSummary() {
  return {
    version: scrimedP32GovernanceRecordsVersion,
    records: [
      "TaskScopedToolContract",
      "ContextCoverageManifest",
      "SummaryCoverageManifest",
      "EvidenceSynthesisRecord",
      "EvidenceLedger",
      "AgentRiskProfile",
      "AgentExecutionReceipt",
      "ClinicalResponseEvaluation",
      "DeidentificationRiskAssessment",
      "DeidentificationRelease",
      "GovernedSkillRunbook",
      "ModelChangeSet",
      "WorkloadPlacementDecision",
      "ProtectionLevelAgreement",
      "PostImplementationReview",
      "CorrectableClinicalOutput",
      "DecisionProvenanceRecord"
    ],
    wildcardMutationAllowed: false,
    modelConfidenceProvesCorrectness: false,
    expertDeterminationCanSelfApprove: false,
    correctionsCanSelfTrain: false,
    boundary: scrimedP32GovernanceRecordsBoundary
  } as const;
}
