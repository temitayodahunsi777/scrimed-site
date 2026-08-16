import { createClinicalEvidenceHash } from "../clinicalEvidenceControls";
import {
  createDecisionEvidenceRecord,
  evaluateAgentActionPolicy,
  evaluateProviderFailover,
  evaluateQualityRatchet,
  verifyDecisionEvidenceChain
} from "../scrimed-p33/index";
import type {
  ContextDataClassification,
  DecisionEvidenceRecord,
  ProviderDependencyFootprint
} from "../scrimed-p33/index";
import type {
  AgentOperationView,
  CapabilityAdmissionDecision,
  CapabilityAdmissionRequest,
  CapabilityRegistry,
  ContemporaneousGovernanceRecord,
  ControlledToolActionDecision,
  ControlledToolActionInput,
  DeterministicTaskRouteDecision,
  FinOpsResilienceDecision,
  GovernanceActionDetails,
  P34DataClassification,
  P34FeatureFlags,
  P34RiskTier,
  PlacementCandidate,
  PlacementDecision,
  PilotObjective,
  PublicClaimDecision,
  PublicClaimEvidence,
  TaskBudget,
  TaskPolicy,
  TaskTechnique,
  TaskTechniqueCandidate,
  TaskUsage,
  TwoLoopEvaluationDecision,
  TwoLoopEvaluationInput
} from "./types";

export const p34AdaptiveGovernanceVersion =
  "scrimed-p34-adaptive-governance-v1-2026-08-15";

export const p34AdaptiveGovernanceBoundary =
  "SCRIMED p.34 provides synthetic/no-PHI policy evaluation, deterministic routing, capability admission, evidence, resilience, and operator visibility. It does not authorize external provider calls, live PHI, diagnosis, treatment, prescribing, patient messaging, payer submission, EHR or device mutation, production migration, deployment, customer activation, certification claims, or external distribution.";

const hashPattern = /^[0-9a-f]{64}$/i;
const idPattern = /^[A-Za-z0-9][A-Za-z0-9._:-]{2,159}$/;
const techniqueOrder: TaskTechnique[] = [
  "validation-rules",
  "deterministic-transformation",
  "graph-traversal",
  "optimization-conventional-ml",
  "retrieval-reranking",
  "generative-model",
  "human-escalation"
];
const riskRank = { low: 0, moderate: 1, high: 2, prohibited: 3 } as const;

function canonical(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort();
}

function assertId(value: string, label: string) {
  if (!idPattern.test(value)) throw new Error(`${label} must be a bounded identifier`);
}

function assertHash(value: string | null, label: string) {
  if (value !== null && !hashPattern.test(value)) throw new Error(`${label} must be a SHA-256 fingerprint`);
}

function assertIso(value: string, label: string) {
  if (!Number.isFinite(Date.parse(value))) throw new Error(`${label} must be an ISO timestamp`);
}

function boundedScore(value: number, label: string) {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new Error(`${label} must be between zero and one`);
  }
}

export function getP34FeatureFlags(env: NodeJS.ProcessEnv = process.env): P34FeatureFlags {
  const read = (name: string, defaultValue: boolean) => {
    const value = env[name];
    if (value === undefined) return defaultValue;
    return value.toLowerCase() === "true";
  };
  return {
    adaptiveGovernanceEnabled: read("SCRIMED_P34_ADAPTIVE_GOVERNANCE_ENABLED", true),
    deterministicRouterEnabled: read("SCRIMED_P34_DETERMINISTIC_ROUTER_ENABLED", true),
    contextProvenanceEnabled: read("SCRIMED_P34_CONTEXT_PROVENANCE_ENABLED", true),
    syntheticDicomPrivacyEnabled: read("SCRIMED_P34_SYNTHETIC_DICOM_PRIVACY_ENABLED", true),
    decisionLedgerEnabled: read("SCRIMED_P34_DECISION_LEDGER_ENABLED", true),
    twoLoopEvaluationEnabled: read("SCRIMED_P34_TWO_LOOP_EVALUATION_ENABLED", true),
    finOpsResilienceEnabled: read("SCRIMED_P34_FINOPS_RESILIENCE_ENABLED", true),
    hybridPlacementEnabled: read("SCRIMED_P34_HYBRID_PLACEMENT_ENABLED", true),
    externalProviderCallsEnabled: read("SCRIMED_P34_EXTERNAL_PROVIDER_CALLS_ENABLED", false),
    dicomExportEnabled: read("SCRIMED_P34_DICOM_EXPORT_ENABLED", false),
    livePhiEnabled: read("SCRIMED_P34_LIVE_PHI_ENABLED", false),
    consequentialExecutionEnabled: read("SCRIMED_P34_CONSEQUENTIAL_EXECUTION_ENABLED", false),
    productionPromotionEnabled: read("SCRIMED_P34_PRODUCTION_PROMOTION_ENABLED", false)
  };
}

export const p34FeatureFlagDefaults = {
  SCRIMED_P34_ADAPTIVE_GOVERNANCE_ENABLED: "true",
  SCRIMED_P34_DETERMINISTIC_ROUTER_ENABLED: "true",
  SCRIMED_P34_CONTEXT_PROVENANCE_ENABLED: "true",
  SCRIMED_P34_SYNTHETIC_DICOM_PRIVACY_ENABLED: "true",
  SCRIMED_P34_DECISION_LEDGER_ENABLED: "true",
  SCRIMED_P34_TWO_LOOP_EVALUATION_ENABLED: "true",
  SCRIMED_P34_FINOPS_RESILIENCE_ENABLED: "true",
  SCRIMED_P34_HYBRID_PLACEMENT_ENABLED: "true",
  SCRIMED_P34_EXTERNAL_PROVIDER_CALLS_ENABLED: "false",
  SCRIMED_P34_DICOM_EXPORT_ENABLED: "false",
  SCRIMED_P34_LIVE_PHI_ENABLED: "false",
  SCRIMED_P34_CONSEQUENTIAL_EXECUTION_ENABLED: "false",
  SCRIMED_P34_PRODUCTION_PROMOTION_ENABLED: "false"
} as const;

export function createP34CapabilityRegistry(): CapabilityRegistry {
  const providers: CapabilityRegistry["providers"] = [
    {
      routeId: "route-local-deterministic-v1",
      providerId: "scrimed-local-runtime",
      modelId: "deterministic-policy-engine-v1",
      harnessId: "harness-local-deterministic-v1",
      artifactDigest: createClinicalEvidenceHash("scrimed-local-deterministic-artifact-v1"),
      verification: {
        status: "verified-local",
        source: "repository policy and regression tests",
        effectiveAt: "2026-08-15T00:00:00.000Z",
        revalidateAt: "2026-11-15T00:00:00.000Z"
      },
      inputModalities: ["structured", "text"],
      outputModalities: ["structured", "text"],
      toolCalling: false,
      structuredOutput: true,
      contextLimit: 32_000,
      outputLimit: 8_000,
      taskClasses: ["validation", "classification", "policy", "ranking", "transformation"],
      riskTiers: ["low", "moderate", "high"],
      dataClassifications: ["public", "synthetic-no-phi", "deidentified-approved"],
      phiPermission: "denied",
      baaEligibility: "not-applicable",
      regions: ["local"],
      executionEnvironmentIds: ["env-local-sandbox-v1"],
      latencyBudgetMs: 2_000,
      costBudgetUsd: 0,
      reasoningEfforts: ["none"],
      allowedToolIds: ["validator", "ranker", "hash-ledger"],
      allowedOperations: ["read", "propose"],
      approvalPolicy: "human-for-write",
      fallbackRouteId: null,
      enabled: true
    },
    {
      routeId: "route-configured-provider-evaluation-slot",
      providerId: "configured-provider-adapter",
      modelId: "configured-model-slot",
      harnessId: "harness-provider-neutral-v1",
      artifactDigest: createClinicalEvidenceHash("unverified-configured-provider-slot"),
      verification: {
        status: "unverified",
        source: null,
        effectiveAt: "2026-08-15T00:00:00.000Z",
        revalidateAt: "2026-08-16T00:00:00.000Z"
      },
      inputModalities: ["text", "structured", "image", "audio"],
      outputModalities: ["text", "structured", "tool-call"],
      toolCalling: true,
      structuredOutput: true,
      contextLimit: 0,
      outputLimit: 0,
      taskClasses: [],
      riskTiers: [],
      dataClassifications: [],
      phiPermission: "unverified",
      baaEligibility: "unverified",
      regions: [],
      executionEnvironmentIds: [],
      latencyBudgetMs: 0,
      costBudgetUsd: 0,
      reasoningEfforts: [],
      allowedToolIds: [],
      allowedOperations: [],
      approvalPolicy: "qualified-human",
      fallbackRouteId: null,
      enabled: false
    }
  ];
  const harnesses: CapabilityRegistry["harnesses"] = [
    {
      harnessId: "harness-local-deterministic-v1",
      version: "1",
      verified: true,
      transportModes: ["local-deterministic"],
      normalizesTextBlocks: true,
      validatesStructuredOutput: true,
      boundedRetries: 0,
      timeoutMs: 2_000,
      toolContractVersions: ["validator-v1", "ranker-v1", "hash-ledger-v1"],
      digest: createClinicalEvidenceHash("harness-local-deterministic-v1")
    },
    {
      harnessId: "harness-provider-neutral-v1",
      version: "1",
      verified: false,
      transportModes: ["non-streaming", "streaming"],
      normalizesTextBlocks: true,
      validatesStructuredOutput: true,
      boundedRetries: 2,
      timeoutMs: 20_000,
      toolContractVersions: [],
      digest: createClinicalEvidenceHash("harness-provider-neutral-unverified-v1")
    }
  ];
  const environments: CapabilityRegistry["environments"] = [
    {
      environmentId: "env-local-sandbox-v1",
      kind: "local",
      verification: {
        status: "verified-local",
        source: "repository sandbox policy tests",
        effectiveAt: "2026-08-15T00:00:00.000Z",
        revalidateAt: "2026-11-15T00:00:00.000Z"
      },
      regions: ["local"],
      dataClassifications: ["public", "synthetic-no-phi", "deidentified-approved"],
      networkDefault: "deny",
      allowedDestinations: [],
      tenantIsolation: true,
      auditability: "local-test-evidence",
      maximumMemoryBytes: 536_870_912,
      maximumDurationMs: 120_000
    },
    {
      environmentId: "env-approved-edge-slot",
      kind: "approved-edge",
      verification: {
        status: "unverified",
        source: null,
        effectiveAt: "2026-08-15T00:00:00.000Z",
        revalidateAt: "2026-08-16T00:00:00.000Z"
      },
      regions: [],
      dataClassifications: [],
      networkDefault: "deny",
      allowedDestinations: [],
      tenantIsolation: false,
      auditability: "external-evidence-required",
      maximumMemoryBytes: 0,
      maximumDurationMs: 0
    }
  ];
  return {
    registryVersion: p34AdaptiveGovernanceVersion,
    generatedFrom: "repository-config",
    providers,
    harnesses,
    environments,
    unknownCapabilityDecision: "deny",
    registryHash: createClinicalEvidenceHash({
      type: "p34-capability-registry",
      version: p34AdaptiveGovernanceVersion,
      providers,
      harnesses,
      environments
    })
  };
}

export function evaluateCapabilityAdmission(
  registry: CapabilityRegistry,
  request: CapabilityAdmissionRequest
): CapabilityAdmissionDecision {
  assertIso(request.evaluatedAt, "capability evaluation time");
  const route = registry.providers.find((candidate) => candidate.routeId === request.routeId) ?? null;
  const reasonCodes: string[] = [];
  if (!route) reasonCodes.push("UNKNOWN_MODEL_OR_ROUTE_DENIED");
  if (request.riskTier === "prohibited") reasonCodes.push("PROHIBITED_RISK_TIER");
  if (request.dataClassification === "phi-restricted") reasonCodes.push("LIVE_PHI_NOT_AUTHORIZED");
  if (route) {
    if (!route.enabled) reasonCodes.push("CAPABILITY_DISABLED");
    if (!["verified-local", "verified-documentary"].includes(route.verification.status)) {
      reasonCodes.push("CAPABILITY_UNVERIFIED_OR_REVOKED");
    }
    if (Date.parse(route.verification.revalidateAt) <= Date.parse(request.evaluatedAt)) {
      reasonCodes.push("CAPABILITY_EXPIRED");
    }
    if (!route.taskClasses.includes(request.taskClass)) reasonCodes.push("TASK_CLASS_NOT_AUTHORIZED");
    if (request.riskTier !== "prohibited" && !route.riskTiers.includes(request.riskTier)) {
      reasonCodes.push("RISK_TIER_NOT_AUTHORIZED");
    }
    if (request.dataClassification !== "phi-restricted" && !route.dataClassifications.includes(request.dataClassification)) {
      reasonCodes.push("DATA_CLASS_NOT_AUTHORIZED");
    }
    if (!route.regions.includes(request.region)) reasonCodes.push("REGION_NOT_AUTHORIZED");
    if (!route.executionEnvironmentIds.includes(request.environmentId)) reasonCodes.push("ENVIRONMENT_NOT_AUTHORIZED");
    if (!route.inputModalities.includes(request.requiredInputModality)) reasonCodes.push("INPUT_MODALITY_UNSUPPORTED");
    if (!route.outputModalities.includes(request.requiredOutputModality)) reasonCodes.push("OUTPUT_MODALITY_UNSUPPORTED");
    if (request.requiredToolIds.some((toolId) => !route.allowedToolIds.includes(toolId))) {
      reasonCodes.push("TOOL_CAPABILITY_NOT_AUTHORIZED");
    }
    if (route.latencyBudgetMs > request.maximumLatencyMs) reasonCodes.push("LATENCY_BUDGET_EXCEEDED");
    if (route.costBudgetUsd > request.maximumCostUsd) reasonCodes.push("COST_BUDGET_EXCEEDED");
    if (route.providerId !== "scrimed-local-runtime") reasonCodes.push("EXTERNAL_PROVIDER_CALLS_DISABLED");
  }
  const normalizedReasons = canonical(reasonCodes);
  const decision = normalizedReasons.length ? "BLOCK" as const : "ALLOW" as const;
  return {
    decision,
    routeId: decision === "ALLOW" ? route?.routeId ?? null : null,
    reasonCodes: normalizedReasons,
    phiAuthorized: false,
    providerCallAuthorized: false,
    decisionHash: createClinicalEvidenceHash({
      type: "p34-capability-admission",
      version: p34AdaptiveGovernanceVersion,
      registryHash: registry.registryHash,
      request,
      reasonCodes: normalizedReasons
    })
  };
}

export function routeDeterministicFirstTask(input: {
  policy: TaskPolicy;
  candidates: TaskTechniqueCandidate[];
  registry: CapabilityRegistry;
  evaluatedAt: string;
  region: string;
  environmentId: string;
}): DeterministicTaskRouteDecision {
  const { policy } = input;
  assertId(policy.policyId, "task policy id");
  assertIso(input.evaluatedAt, "task routing evaluation time");
  boundedScore(policy.minimumConfidence, "minimum confidence");
  boundedScore(policy.minimumEvidenceCoverage, "minimum evidence coverage");
  const reasonCodes: string[] = [];
  if (policy.riskTier === "prohibited") reasonCodes.push("PROHIBITED_TASK");
  if (policy.dataClassification === "phi-restricted") reasonCodes.push("LIVE_PHI_ROUTE_BLOCKED");
  if (!policy.failClosed) reasonCodes.push("FAIL_CLOSED_POLICY_REQUIRED");
  const restrictedGenerativeTask = /clinical|identity|authoriz|consent|billing|irreversible|write/i.test(policy.taskClass);
  const evaluatedTechniques: TaskTechnique[] = [];
  let selected: TaskTechniqueCandidate | null = null;

  if (reasonCodes.length === 0) {
    for (const technique of techniqueOrder) {
      const candidates = input.candidates
        .filter((candidate) => candidate.technique === technique)
        .sort((left, right) =>
          right.confidence - left.confidence ||
          right.evidenceCoverage - left.evidenceCoverage ||
          left.estimatedCostUsd - right.estimatedCostUsd
        );
      if (candidates.length) evaluatedTechniques.push(technique);
      for (const candidate of candidates) {
        if (!candidate.available) continue;
        if (technique === "human-escalation") {
          selected = candidate;
          break;
        }
        if (candidate.confidence < policy.minimumConfidence || candidate.evidenceCoverage < policy.minimumEvidenceCoverage) continue;
        if (candidate.estimatedLatencyMs > policy.maximumLatencyMs || candidate.estimatedCostUsd > policy.maximumCostUsd) continue;
        if (candidate.toolIds.some((toolId) => !policy.permittedToolIds.includes(toolId))) continue;
        if (technique === "generative-model") {
          if (restrictedGenerativeTask) {
            reasonCodes.push("GENERATIVE_FALLTHROUGH_PROHIBITED_FOR_CONSEQUENTIAL_TASK");
            continue;
          }
          if (!candidate.routeId || !policy.permittedRouteIds.includes(candidate.routeId)) continue;
          const admission = evaluateCapabilityAdmission(input.registry, {
            routeId: candidate.routeId,
            taskClass: policy.taskClass,
            riskTier: policy.riskTier,
            dataClassification: policy.dataClassification,
            region: input.region,
            environmentId: input.environmentId,
            requiredInputModality: "text",
            requiredOutputModality: "structured",
            requiredToolIds: candidate.toolIds,
            maximumLatencyMs: policy.maximumLatencyMs,
            maximumCostUsd: policy.maximumCostUsd,
            evaluatedAt: input.evaluatedAt
          });
          if (admission.decision !== "ALLOW") {
            reasonCodes.push(...admission.reasonCodes.map((reason) => `MODEL_${reason}`));
            continue;
          }
        }
        selected = candidate;
        break;
      }
      if (selected) break;
    }
  }

  if (!selected) reasonCodes.push("NO_SAFE_SUFFICIENT_TECHNIQUE");
  const humanEscalationRequired = !selected || selected.technique === "human-escalation" || policy.approvalRequirement !== "none-read-only";
  const decision = reasonCodes.some((reason) => [
    "PROHIBITED_TASK",
    "LIVE_PHI_ROUTE_BLOCKED",
    "FAIL_CLOSED_POLICY_REQUIRED"
  ].includes(reason))
    ? "BLOCK" as const
    : humanEscalationRequired
      ? "REQUIRE_HUMAN" as const
      : "ALLOW" as const;
  const normalizedReasons = canonical(reasonCodes);
  return {
    decision,
    selectedTechnique: selected?.technique ?? null,
    selectedCandidateId: selected?.candidateId ?? null,
    selectedRouteId: selected?.routeId ?? null,
    reasonCodes: normalizedReasons,
    evaluatedTechniques,
    generativeFallbackAllowed: selected?.technique === "generative-model" && decision === "ALLOW",
    humanEscalationRequired,
    providerCallExecuted: false,
    decisionHash: createClinicalEvidenceHash({
      type: "p34-deterministic-first-route",
      version: p34AdaptiveGovernanceVersion,
      policy,
      candidates: input.candidates,
      selected,
      reasonCodes: normalizedReasons
    })
  };
}

export function evaluateControlledToolAction(
  input: ControlledToolActionInput
): ControlledToolActionDecision {
  const base = evaluateAgentActionPolicy({
    request: input.request,
    authorization: input.authorization,
    approval: input.approval,
    discoveredToolIds: input.discoveredToolIds,
    usedApprovalIds: input.usedApprovalIds,
    now: input.now
  });
  const reasonCodes = [...base.reasonCodes];
  if (input.cancelled) reasonCodes.push("ACTION_CANCELLED");
  if (input.turnCount > input.maximumTurns) reasonCodes.push("TURN_BUDGET_EXHAUSTED");
  if (input.stage === "execute") reasonCodes.push("P34_EXECUTION_DISABLED");
  if (input.interface === "browser" && (!input.sandboxed || !input.reversible)) {
    reasonCodes.push("BROWSER_ACTION_MUST_BE_REVERSIBLE_AND_SANDBOXED");
  }
  if (["discover", "read"].includes(input.stage) && input.request.actionClass !== "read") {
    reasonCodes.push("CAPABILITY_STAGE_MISMATCH");
  }
  if (input.stage === "propose" && input.request.mode === "execute") {
    reasonCodes.push("PROPOSAL_STAGE_CANNOT_EXECUTE");
  }
  const normalizedReasons = canonical(reasonCodes);
  const hardBlock = base.decision === "BLOCK" || normalizedReasons.some((reason) => [
    "ACTION_CANCELLED",
    "TURN_BUDGET_EXHAUSTED",
    "P34_EXECUTION_DISABLED",
    "BROWSER_ACTION_MUST_BE_REVERSIBLE_AND_SANDBOXED",
    "CAPABILITY_STAGE_MISMATCH",
    "PROPOSAL_STAGE_CANNOT_EXECUTE"
  ].includes(reason));
  const decision = hardBlock
    ? "BLOCK" as const
    : base.decision === "REQUIRE_HUMAN" || input.stage === "approve"
      ? "REQUIRE_HUMAN" as const
      : "ALLOW" as const;
  return {
    decision,
    stage: input.stage,
    reasonCodes: normalizedReasons,
    approvalBound: Boolean(input.approval) && !normalizedReasons.some((reason) => reason.startsWith("APPROVAL_")),
    cancellationObserved: input.cancelled,
    executionAuthorized: false,
    servicePolicyReceiptHash: createClinicalEvidenceHash({
      type: "p34-controlled-tool-action",
      version: p34AdaptiveGovernanceVersion,
      baseReceipt: base.policyReceiptHash,
      input,
      decision,
      reasonCodes: normalizedReasons
    })
  };
}

export type ContemporaneousGovernanceInput = {
  recordId: string;
  ledgerId: string;
  tenantId: string;
  traceId: string;
  correlationId: string;
  actorIdHash: string;
  accountableHumanAuthorityHash: string | null;
  authorizedScope: string[];
  intendedUse: string;
  policyVersion: string;
  regulatoryLabelVersion: string;
  providerId: string;
  modelId: string;
  harnessId: string;
  promptVersion: string;
  toolVersions: string[];
  buildIdentity: string;
  dataClassification: Exclude<P34DataClassification, "phi-restricted">;
  consentState: "not-required-synthetic" | "verified";
  evidenceReferences: string[];
  sourceHashes: string[];
  inputHash: string;
  outputHash: string | null;
  approvalState: "not-required" | "pending" | "approved" | "rejected";
  reviewerRole: string | null;
  occurredAt: string;
  affectedObjectIds: string[];
  reversible: boolean;
  details: GovernanceActionDetails;
};

function p33Classification(value: ContemporaneousGovernanceInput["dataClassification"]): ContextDataClassification {
  return value;
}

export function createContemporaneousGovernanceRecord(
  input: ContemporaneousGovernanceInput,
  existingRecords: ContemporaneousGovernanceRecord[] = []
): ContemporaneousGovernanceRecord {
  assertHash(input.actorIdHash, "governance actor");
  assertHash(input.accountableHumanAuthorityHash, "governance human authority");
  assertHash(input.inputHash, "governance input");
  assertHash(input.outputHash, "governance output");
  input.sourceHashes.forEach((hash) => assertHash(hash, "governance source"));
  input.details.evidenceHashes.forEach((hash) => assertHash(hash, "governance evidence"));
  input.details.approvalHashes.forEach((hash) => assertHash(hash, "governance approval"));
  assertHash(input.details.routingDecisionHash, "governance route");
  const detailsHash = createClinicalEvidenceHash({
    type: "p34-governance-action-details",
    version: p34AdaptiveGovernanceVersion,
    details: input.details,
    resultOutputHash: input.outputHash
  });
  const previousRecordHash = existingRecords.at(-1)?.evidenceRecord.recordHash ?? null;
  const evidenceRecord = createDecisionEvidenceRecord({
    recordId: input.recordId,
    ledgerId: input.ledgerId,
    tenantId: input.tenantId,
    traceId: input.traceId,
    correlationId: input.correlationId,
    actorIdHash: input.actorIdHash,
    accountableHumanAuthorityHash: input.accountableHumanAuthorityHash,
    authorizedScope: input.authorizedScope,
    intendedUse: input.intendedUse,
    policyVersion: input.policyVersion,
    regulatoryLabelVersion: input.regulatoryLabelVersion,
    modelIdentity: input.modelId,
    providerIdentity: input.providerId,
    harnessIdentity: input.harnessId,
    promptVersion: input.promptVersion,
    toolVersions: input.toolVersions,
    buildIdentity: input.buildIdentity,
    dataClassification: p33Classification(input.dataClassification),
    consentState: input.consentState,
    evidenceReferences: input.evidenceReferences,
    sourceHashes: input.sourceHashes,
    inputHash: input.inputHash,
    outputHash: detailsHash,
    constraintsApplied: [
      "no-raw-phi",
      "no-secrets",
      "no-hidden-chain-of-thought",
      "human-authority-retained"
    ],
    approvalState: input.approvalState,
    reviewerRole: input.reviewerRole,
    outcome: input.details.resultStatus,
    affectedObjectIds: input.affectedObjectIds,
    reversible: input.reversible,
    replayRecipe: {
      fixtureIds: ["p34-synthetic-governance-fixture"],
      policyVersion: input.policyVersion,
      modelProfileId: `${input.providerId}:${input.modelId}`,
      toolContractIds: input.toolVersions
    },
    occurredAt: input.occurredAt,
    previousRecordHash
  }, existingRecords.map((record) => record.evidenceRecord));
  const outcome = input.details.resultStatus === "verified" || input.details.resultStatus === "allowed"
    ? "0" as const
    : input.details.resultStatus === "review-required"
      ? "4" as const
      : input.details.resultStatus === "blocked"
        ? "8" as const
        : "12" as const;
  return {
    evidenceRecord,
    details: input.details,
    resultOutputHash: input.outputHash,
    detailsHash,
    fhirAuditEventPreview: {
      resourceType: "AuditEvent",
      id: input.recordId,
      recorded: input.occurredAt,
      action: input.details.actionStage === "read" ? "R" : input.details.actionStage === "execute" ? "E" : "C",
      outcome,
      agent: [{ who: { identifier: { value: input.actorIdHash } }, requestor: true }],
      entity: input.affectedObjectIds.map((value) => ({ what: { identifier: { value } } }))
    },
    fhirProvenancePreview: {
      resourceType: "Provenance",
      id: `provenance-${input.recordId}`,
      recorded: input.occurredAt,
      target: input.affectedObjectIds.map((value) => ({ identifier: { value } })),
      entity: input.details.evidenceHashes.map((value) => ({
        role: "source" as const,
        what: { identifier: { value } }
      }))
    }
  };
}

export function verifyContemporaneousGovernanceChain(records: ContemporaneousGovernanceRecord[]) {
  const base = verifyDecisionEvidenceChain(records.map((record) => record.evidenceRecord));
  const detailFailures = records.flatMap((record) => {
    const expected = createClinicalEvidenceHash({
      type: "p34-governance-action-details",
      version: p34AdaptiveGovernanceVersion,
      details: record.details,
      resultOutputHash: record.resultOutputHash
    });
    return expected === record.detailsHash && record.evidenceRecord.outputHash === record.detailsHash
      ? []
      : [{ recordId: record.evidenceRecord.recordId, reason: "P34_DETAILS_HASH_MISMATCH" }];
  });
  return {
    valid: base.valid && detailFailures.length === 0,
    recordCount: records.length,
    failures: [...base.failures, ...detailFailures],
    chainHash: createClinicalEvidenceHash({
      type: "p34-governance-chain",
      version: p34AdaptiveGovernanceVersion,
      baseChainHash: base.chainHash,
      detailHashes: records.map((record) => record.detailsHash)
    })
  };
}

export function evaluateTwoLoopQuality(
  input: TwoLoopEvaluationInput
): TwoLoopEvaluationDecision {
  assertId(input.evaluationId, "evaluation id");
  if (!Number.isInteger(input.caseCount) || input.caseCount < 1) throw new Error("Evaluation requires cases");
  if (!Number.isInteger(input.repeatedTrials) || input.repeatedTrials < 1) throw new Error("Evaluation requires trials");
  Object.entries(input.outerMetrics)
    .filter(([key]) => key !== "rawPhiStored")
    .forEach(([key, value]) => boundedScore(value as number, `outer ${key}`));
  const reasonCodes: string[] = [];
  const innerLoopPassed = Object.values(input.innerChecks).every(Boolean);
  if (!innerLoopPassed) reasonCodes.push("INNER_LOOP_REGRESSION");
  if (input.outerMetrics.rawPhiStored) reasonCodes.push("RAW_PHI_ANALYTICS_PROHIBITED");
  if (input.outerMetrics.unsupportedAssertionRate > 0.01) reasonCodes.push("UNSUPPORTED_ASSERTION_RATE_EXCEEDED");
  if (input.outerMetrics.toolFailureRate > 0.02) reasonCodes.push("TOOL_FAILURE_RATE_EXCEEDED");
  if (input.outerMetrics.humanCorrectionRate > 0.1) reasonCodes.push("HUMAN_CORRECTION_RATE_REVIEW");
  if (!input.rollbackReady) reasonCodes.push("ROLLBACK_NOT_READY");
  const ratchet = evaluateQualityRatchet({
    baseline: input.baseline,
    challenger: input.challenger,
    hardFloors: {
      safety: input.innerChecks.safety && !input.outerMetrics.rawPhiStored,
      authorization: true,
      privacy: !input.outerMetrics.rawPhiStored,
      clinical: input.innerChecks.safety,
      provenance: input.innerChecks.grounding && input.innerChecks.citation
    },
    worstMaterialCellPassed: input.worstMaterialCellPassed,
    taskLevelEvidenceComplete: innerLoopPassed,
    softRegressionApproved: input.softRegressionApproved,
    independentHumanReviewComplete: input.independentHumanReviewComplete
  });
  reasonCodes.push(...ratchet.reasonCodes);
  const outerLoopPassed = !reasonCodes.some((reason) => [
    "RAW_PHI_ANALYTICS_PROHIBITED",
    "UNSUPPORTED_ASSERTION_RATE_EXCEEDED",
    "TOOL_FAILURE_RATE_EXCEEDED",
    "ROLLBACK_NOT_READY"
  ].includes(reason));
  const blocking = ratchet.decision === "BLOCK" || !innerLoopPassed || !outerLoopPassed;
  const normalizedReasons = canonical(reasonCodes);
  const decision = blocking
    ? "BLOCK" as const
    : !input.independentHumanReviewComplete || normalizedReasons.length
      ? "REQUIRE_HUMAN" as const
      : "ALLOW" as const;
  const confidenceIntervalRecorded = input.repeatedTrials > 1 && Object.values(input.variation).every(Number.isFinite);
  return {
    decision,
    reasonCodes: normalizedReasons,
    innerLoopPassed,
    outerLoopPassed,
    qualityRatchetHash: ratchet.decisionHash,
    confidenceIntervalRecorded,
    automaticPromotionAllowed: false,
    promotionEligibleForHumanReview: decision !== "BLOCK" && input.rollbackReady,
    rollbackImmediate: input.rollbackReady,
    decisionHash: createClinicalEvidenceHash({
      type: "p34-two-loop-evaluation",
      version: p34AdaptiveGovernanceVersion,
      input,
      ratchet,
      reasonCodes: normalizedReasons
    })
  };
}

export function evaluateFinOpsResilience(input: {
  tenantId: string;
  taskId: string;
  budget: TaskBudget;
  usage: TaskUsage;
  primary: ProviderDependencyFootprint;
  fallback: ProviderDependencyFootprint | null;
  providerAvailable: boolean;
  networkAvailable: boolean;
  quotaAvailable: boolean;
  placementRequiresConnectivity: boolean;
  cacheNamespace: string;
}): FinOpsResilienceDecision {
  assertId(input.tenantId, "FinOps tenant");
  assertId(input.taskId, "FinOps task");
  const { budget, usage } = input;
  const reasonCodes: string[] = [];
  const tokenAmplification = (usage.reasoningTokens + usage.outputTokens) /
    Math.max(usage.inputTokens - usage.cachedTokens, 1);
  if (usage.inputTokens > budget.maximumInputTokens) reasonCodes.push("INPUT_TOKEN_BUDGET_EXHAUSTED");
  if (usage.cachedTokens > budget.maximumCachedTokens) reasonCodes.push("CACHE_TOKEN_BUDGET_EXHAUSTED");
  if (usage.reasoningTokens > budget.maximumReasoningTokens) reasonCodes.push("REASONING_TOKEN_BUDGET_EXHAUSTED");
  if (usage.outputTokens > budget.maximumOutputTokens) reasonCodes.push("OUTPUT_TOKEN_BUDGET_EXHAUSTED");
  if (usage.costUsd > budget.maximumCostUsd) reasonCodes.push("COST_BUDGET_EXHAUSTED");
  if (usage.endToEndLatencyMs > budget.maximumLatencyMs) reasonCodes.push("LATENCY_BUDGET_EXHAUSTED");
  if (usage.toolLatencyMs > budget.maximumToolLatencyMs) reasonCodes.push("TOOL_LATENCY_BUDGET_EXHAUSTED");
  if (usage.retries > budget.maximumRetries) reasonCodes.push("RETRY_BUDGET_EXHAUSTED");
  if (usage.fallbacks > budget.maximumFallbacks) reasonCodes.push("FALLBACK_BUDGET_EXHAUSTED");
  if (tokenAmplification > budget.maximumTokenAmplification) reasonCodes.push("TOKEN_AMPLIFICATION_CIRCUIT_OPEN");
  if (!input.providerAvailable) reasonCodes.push("PRIMARY_PROVIDER_UNAVAILABLE");
  if (!input.quotaAvailable) reasonCodes.push("PROVIDER_QUOTA_EXHAUSTED");
  if (!input.networkAvailable && input.placementRequiresConnectivity) reasonCodes.push("NETWORK_UNAVAILABLE_SAFE_REFUSAL");
  if (usage.providerErrors >= 3 || usage.rateLimitEvents >= 3) reasonCodes.push("PROVIDER_CIRCUIT_OPEN");

  let selectedFallbackRouteId: string | null = null;
  const providerFailure = reasonCodes.some((reason) => [
    "PRIMARY_PROVIDER_UNAVAILABLE",
    "PROVIDER_QUOTA_EXHAUSTED",
    "PROVIDER_CIRCUIT_OPEN"
  ].includes(reason));
  if (providerFailure && input.fallback) {
    const failover = evaluateProviderFailover(input.primary, input.fallback);
    if (failover.decision === "ALLOW") {
      selectedFallbackRouteId = failover.fallbackProviderId;
    } else {
      reasonCodes.push(...failover.reasonCodes);
    }
  } else if (providerFailure) {
    reasonCodes.push("NO_POLICY_COMPATIBLE_FALLBACK");
  }
  const hardBudgetFailure = reasonCodes.some((reason) =>
    reason.endsWith("BUDGET_EXHAUSTED") ||
    reason === "TOKEN_AMPLIFICATION_CIRCUIT_OPEN" ||
    reason === "NETWORK_UNAVAILABLE_SAFE_REFUSAL" ||
    reason === "NO_POLICY_COMPATIBLE_FALLBACK" ||
    reason === "FALLBACK_NOT_MATERIALLY_INDEPENDENT"
  );
  const runtimeState = hardBudgetFailure
    ? "SAFE_REFUSAL" as const
    : selectedFallbackRouteId
      ? "DEGRADED" as const
      : reasonCodes.length
        ? "CONSTRAINED" as const
        : "NORMAL" as const;
  const decision = runtimeState === "SAFE_REFUSAL"
    ? "BLOCK" as const
    : runtimeState === "DEGRADED" || runtimeState === "CONSTRAINED"
      ? "REQUIRE_HUMAN" as const
      : "ALLOW" as const;
  const normalizedReasons = canonical(reasonCodes);
  return {
    decision,
    runtimeState,
    reasonCodes: normalizedReasons,
    selectedFallbackRouteId,
    costPerCompletedTaskUsd: usage.completed ? usage.costUsd : null,
    cacheHitRatio: usage.inputTokens > 0 ? Math.min(1, usage.cachedTokens / usage.inputTokens) : 0,
    tenantSafeCacheKey: createClinicalEvidenceHash({
      tenantId: input.tenantId,
      namespace: input.cacheNamespace,
      taskId: input.taskId
    }),
    circuitBreakerState: reasonCodes.some((reason) => reason.includes("CIRCUIT_OPEN")) ? "open" : "closed",
    providerCallExecuted: false,
    decisionHash: createClinicalEvidenceHash({
      type: "p34-finops-resilience",
      version: p34AdaptiveGovernanceVersion,
      input,
      runtimeState,
      reasonCodes: normalizedReasons,
      selectedFallbackRouteId
    })
  };
}

export function selectP34Placement(input: {
  dataClassification: P34DataClassification;
  riskTier: P34RiskTier;
  requiredRegion: string;
  maximumLatencyMs: number;
  networkAvailable: boolean;
  candidates: PlacementCandidate[];
}): PlacementDecision {
  const reasonCodes: string[] = [];
  if (input.dataClassification === "phi-restricted") reasonCodes.push("LIVE_PHI_PLACEMENT_NOT_AUTHORIZED");
  if (input.riskTier === "prohibited") reasonCodes.push("PROHIBITED_RISK_PLACEMENT");
  const eligible = reasonCodes.length
    ? []
    : input.candidates
      .filter((candidate) =>
        candidate.qualified &&
        candidate.region === input.requiredRegion &&
        candidate.permittedDataClassifications.includes(input.dataClassification as Exclude<P34DataClassification, "phi-restricted">) &&
        riskRank[candidate.maximumRiskTier] >= riskRank[input.riskTier] &&
        candidate.latencyMs <= input.maximumLatencyMs &&
        candidate.auditabilityVerified &&
        candidate.modelCapabilityVerified &&
        (!candidate.connectivityRequired || input.networkAvailable) &&
        candidate.contractualEligibility === "verified-local"
      )
      .sort((left, right) => {
        const kindOrder = ["local", "approved-edge", "private-cloud", "approved-managed-cloud"];
        return kindOrder.indexOf(left.kind) - kindOrder.indexOf(right.kind) || left.latencyMs - right.latencyMs;
      });
  const selected = eligible[0] ?? null;
  if (!selected) reasonCodes.push("NO_AUTHORIZED_PLACEMENT");
  const normalizedReasons = canonical(reasonCodes);
  return {
    decision: selected ? "ALLOW" : "BLOCK",
    selectedPlacementId: selected?.placementId ?? null,
    reasonCodes: normalizedReasons,
    phiRouteAuthorized: false,
    unsafeAutonomousFallbackAllowed: false,
    decisionHash: createClinicalEvidenceHash({
      type: "p34-placement-decision",
      version: p34AdaptiveGovernanceVersion,
      input,
      selected,
      reasonCodes: normalizedReasons
    })
  };
}

export function evaluatePublicClaimEvidence(
  claim: PublicClaimEvidence,
  evaluatedAt: string
): PublicClaimDecision {
  assertIso(evaluatedAt, "claim evaluation time");
  const reasonCodes: string[] = [];
  if (claim.sourceKind !== "primary" || !claim.sourceUrl) reasonCodes.push("PRIMARY_EVIDENCE_REQUIRED");
  if (!claim.retrievedAt || !Number.isFinite(Date.parse(claim.retrievedAt))) reasonCodes.push("RETRIEVAL_DATE_REQUIRED");
  if (!claim.expiresAt || Date.parse(claim.expiresAt) <= Date.parse(evaluatedAt)) reasonCodes.push("CLAIM_EVIDENCE_EXPIRED");
  if (!claim.ownerRole.trim()) reasonCodes.push("CLAIM_OWNER_REQUIRED");
  if (!claim.approvedWording?.trim()) reasonCodes.push("APPROVED_WORDING_REQUIRED");
  if (/\b(?:compliant|certified|cleared|approved|eliminates|deterministic)\b/i.test(claim.claim) && !claim.legalApprovalRecorded) {
    reasonCodes.push("ABSOLUTE_CLAIM_REQUIRES_LEGAL_APPROVAL");
  }
  const normalizedReasons = canonical(reasonCodes);
  return {
    decision: normalizedReasons.length ? "BLOCK" : "REQUIRE_HUMAN",
    reasonCodes: normalizedReasons,
    publicationAuthorized: false,
    claimHash: createClinicalEvidenceHash({
      type: "p34-public-claim-decision",
      version: p34AdaptiveGovernanceVersion,
      claim,
      evaluatedAt,
      reasonCodes: normalizedReasons
    })
  };
}

export const p34PilotObjectives: PilotObjective[] = [
  { objectiveId: "p34-objective-turnaround", metric: "turnaround-time", baseline: 60, target: 45, unit: "synthetic-minutes", ownerRole: "pilot-operations-owner", externalApprovalRequired: true },
  { objectiveId: "p34-objective-abandonment", metric: "abandonment", baseline: 0.2, target: 0.15, unit: "synthetic-rate", ownerRole: "pilot-operations-owner", externalApprovalRequired: true },
  { objectiveId: "p34-objective-duplicates", metric: "duplicate-records", baseline: 8, target: 4, unit: "synthetic-count", ownerRole: "data-quality-owner", externalApprovalRequired: true },
  { objectiveId: "p34-objective-context", metric: "context-retrieval", baseline: 12, target: 7, unit: "synthetic-minutes", ownerRole: "clinical-workflow-owner", externalApprovalRequired: true },
  { objectiveId: "p34-objective-correction", metric: "correction-burden", baseline: 0.25, target: 0.18, unit: "synthetic-rate", ownerRole: "quality-owner", externalApprovalRequired: true },
  { objectiveId: "p34-objective-safety", metric: "safety-quality", baseline: 0.98, target: 0.98, unit: "hard-floor", ownerRole: "clinical-safety-owner", externalApprovalRequired: true }
];

export function createP34SyntheticGovernanceRecords(
  routingDecisionHash: string,
  evidenceHash: string
): ContemporaneousGovernanceRecord[] {
  const actorIdHash = createClinicalEvidenceHash("p34-synthetic-agent");
  const details: GovernanceActionDetails = {
    parentEventId: null,
    delegatedAuthority: ["read-synthetic-metadata", "prepare-review-draft"],
    pseudonymousCaseReference: createClinicalEvidenceHash("p34-synthetic-case"),
    taskClass: "synthetic-workflow-context",
    riskTier: "moderate",
    evidenceHashes: [evidenceHash],
    routingDecisionHash,
    approvalHashes: [],
    actionStage: "propose",
    proposedAction: "prepare synthetic evidence review",
    resultStatus: "review-required",
    exceptionCodes: [],
    escalationStatus: "pending"
  };
  const first = createContemporaneousGovernanceRecord({
    recordId: "p34-governance-event-001",
    ledgerId: "p34-governance-ledger-synthetic",
    tenantId: "synthetic-tenant",
    traceId: "p34-trace-synthetic-001",
    correlationId: "p34-correlation-synthetic-001",
    actorIdHash,
    accountableHumanAuthorityHash: null,
    authorizedScope: ["read-synthetic-metadata", "prepare-review-draft"],
    intendedUse: "synthetic workflow evaluation",
    policyVersion: p34AdaptiveGovernanceVersion,
    regulatoryLabelVersion: "p33-label-signal-compression-v1",
    providerId: "scrimed-local-runtime",
    modelId: "deterministic-policy-engine-v1",
    harnessId: "harness-local-deterministic-v1",
    promptVersion: "not-applicable-deterministic",
    toolVersions: ["validator-v1", "hash-ledger-v1"],
    buildIdentity: "local-p34-candidate-unbound-until-release-evidence",
    dataClassification: "synthetic-no-phi",
    consentState: "not-required-synthetic",
    evidenceReferences: ["p34-synthetic-context"],
    sourceHashes: [evidenceHash],
    inputHash: createClinicalEvidenceHash("p34-synthetic-governance-input"),
    outputHash: createClinicalEvidenceHash("p34-synthetic-governance-output"),
    approvalState: "pending",
    reviewerRole: null,
    occurredAt: "2026-08-15T12:10:00.000Z",
    affectedObjectIds: ["p34-context-synthetic-001"],
    reversible: true,
    details
  });
  return [first];
}

export function createP34SyntheticOperation(
  routeDecision: DeterministicTaskRouteDecision,
  finOps: FinOpsResilienceDecision
): AgentOperationView {
  return {
    operationId: "p34-operation-synthetic-001",
    task: "Validate and rank a synthetic workflow context packet",
    workflow: "synthetic-context-review",
    responsibleHumanOwner: "pilot-operations-owner",
    providerId: "scrimed-local-runtime",
    modelId: "deterministic-policy-engine-v1",
    riskTier: "moderate",
    state: routeDecision.decision === "BLOCK" ? "blocked" : "awaiting-review",
    evidenceCompleteness: 1,
    approvalState: "pending",
    taskCompleted: false,
    exceptionRate: finOps.reasonCodes.length ? 1 : 0,
    escalationRate: routeDecision.humanEscalationRequired ? 1 : 0,
    humanReviewRate: 1,
    latencyMs: 210,
    costPerCompletedTaskUsd: finOps.costPerCompletedTaskUsd,
    rollbackState: "ready",
    syntheticOnly: true
  };
}

export const p34SyntheticPrimaryFootprint: ProviderDependencyFootprint = {
  providerId: "synthetic-primary-route",
  controllingCorporateFamily: "synthetic-family-a",
  cloud: "synthetic-cloud-a",
  region: "synthetic-region-a",
  acceleratorPool: "synthetic-pool-a",
  identityProvider: "synthetic-idp-a",
  network: "synthetic-network-a",
  safetyTier: 3,
  privacyTier: 3,
  jurisdiction: "synthetic-jurisdiction-b",
  eligible: true
};

export const p34SyntheticFallbackFootprint: ProviderDependencyFootprint = {
  providerId: "synthetic-fallback-route",
  controllingCorporateFamily: "synthetic-family-b",
  cloud: "synthetic-cloud-b",
  region: "synthetic-region-b",
  acceleratorPool: "synthetic-pool-b",
  identityProvider: "synthetic-idp-b",
  network: "synthetic-network-b",
  safetyTier: 3,
  privacyTier: 3,
  jurisdiction: "synthetic-us",
  eligible: true
};

export function cloneGovernanceEvidenceRecord(
  record: ContemporaneousGovernanceRecord
): DecisionEvidenceRecord {
  return structuredClone(record.evidenceRecord);
}
