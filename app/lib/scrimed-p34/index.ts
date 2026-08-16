import { createClinicalEvidenceHash } from "../clinicalEvidenceControls";
import {
  createP34CapabilityRegistry,
  createP34SyntheticGovernanceRecords,
  createP34SyntheticOperation,
  evaluateCapabilityAdmission,
  evaluateControlledToolAction,
  evaluateFinOpsResilience,
  evaluatePublicClaimEvidence,
  evaluateTwoLoopQuality,
  getP34FeatureFlags,
  p34AdaptiveGovernanceBoundary,
  p34AdaptiveGovernanceVersion,
  p34FeatureFlagDefaults,
  p34PilotObjectives,
  p34SyntheticFallbackFootprint,
  p34SyntheticPrimaryFootprint,
  routeDeterministicFirstTask,
  selectP34Placement,
  verifyContemporaneousGovernanceChain
} from "./adaptiveGovernance";
import {
  createP34SyntheticContextEnvelope,
  p34ContextProvenanceBoundary,
  validateGroundedClaims
} from "./contextProvenance";
import {
  createP34SyntheticDicomObject,
  evaluateDicomDeidentification,
  p34BasicDicomDeidentificationProfile,
  p34DicomPrivacyBoundary
} from "./dicomPrivacy";
import type { P34GateRecord, P34GateStatus, TaskPolicy } from "./types";

export * from "./types";
export * from "./adaptiveGovernance";
export * from "./contextProvenance";
export * from "./dicomPrivacy";

export const p34IntegratedRoute = "/scrimed-p34";
export const p34IntegratedApiRoute = "/api/scrimed-control-plane/p34";
export const p34IntegratedBriefRoute = "/api/scrimed-control-plane/p34/brief";
export const p34IntegratedVersion = "scrimed-p34-integrated-v1-2026-08-15";

export const p34IntegratedBoundary =
  "SCRIMED p.34 is an adaptive, auditable, vendor-neutral synthetic/no-PHI control-plane candidate. It retains human authority and does not authorize live clinical care, PHI, diagnosis, treatment, prescribing, patient messaging, payer submission, EHR/device mutation, external provider calls, production migration, deployment, customer activation, certification claims, or external distribution.";

function gate(input: Omit<P34GateRecord, "gateHash">): P34GateRecord {
  return {
    ...input,
    gateHash: createClinicalEvidenceHash({
      type: "p34-gate-record",
      version: p34IntegratedVersion,
      input
    })
  };
}

export function getP34AdaptiveGovernanceSummary() {
  const registry = createP34CapabilityRegistry();
  const capabilityAdmission = evaluateCapabilityAdmission(registry, {
    routeId: "route-local-deterministic-v1",
    taskClass: "validation",
    riskTier: "moderate",
    dataClassification: "synthetic-no-phi",
    region: "local",
    environmentId: "env-local-sandbox-v1",
    requiredInputModality: "structured",
    requiredOutputModality: "structured",
    requiredToolIds: ["validator"],
    maximumLatencyMs: 2_000,
    maximumCostUsd: 0,
    evaluatedAt: "2026-08-15T12:00:00.000Z"
  });
  const taskPolicy: TaskPolicy = {
    policyId: "p34-policy-synthetic-validation",
    version: p34AdaptiveGovernanceVersion,
    taskClass: "validation",
    intendedUse: "validate synthetic workflow metadata",
    riskTier: "moderate",
    dataClassification: "synthetic-no-phi",
    deterministicAlternatives: ["validation-rules", "deterministic-transformation", "human-escalation"],
    minimumConfidence: 0.9,
    minimumEvidenceCoverage: 0.95,
    permittedRouteIds: ["route-local-deterministic-v1"],
    permittedToolIds: ["validator", "hash-ledger"],
    reasoningBudget: "none",
    maximumLatencyMs: 2_000,
    maximumCostUsd: 0,
    approvalRequirement: "none-read-only",
    escalationOwner: "pilot-operations-owner",
    failClosed: true
  };
  const taskRoute = routeDeterministicFirstTask({
    policy: taskPolicy,
    registry,
    evaluatedAt: "2026-08-15T12:00:00.000Z",
    region: "local",
    environmentId: "env-local-sandbox-v1",
    candidates: [
      {
        technique: "validation-rules",
        candidateId: "candidate-schema-policy-validator",
        available: true,
        confidence: 1,
        evidenceCoverage: 1,
        estimatedLatencyMs: 8,
        estimatedCostUsd: 0,
        routeId: "route-local-deterministic-v1",
        toolIds: ["validator"]
      },
      {
        technique: "generative-model",
        candidateId: "candidate-unverified-provider-slot",
        available: false,
        confidence: 0,
        evidenceCoverage: 0,
        estimatedLatencyMs: 0,
        estimatedCostUsd: 0,
        routeId: "route-configured-provider-evaluation-slot",
        toolIds: []
      },
      {
        technique: "human-escalation",
        candidateId: "candidate-human-escalation",
        available: true,
        confidence: 1,
        evidenceCoverage: 1,
        estimatedLatencyMs: 0,
        estimatedCostUsd: 0,
        routeId: null,
        toolIds: []
      }
    ]
  });
  const context = createP34SyntheticContextEnvelope();
  const claimValidation = validateGroundedClaims(context, context.artifact.facts.map((fact) => ({
    claimId: `claim-${fact.factId}`,
    statementHash: createClinicalEvidenceHash(fact.statement),
    citedSourceSpanIds: fact.sourceSpanIds
  })));
  const dicomPrivacy = evaluateDicomDeidentification({
    object: createP34SyntheticDicomObject(),
    profile: p34BasicDicomDeidentificationProfile,
    operatorIdHash: createClinicalEvidenceHash("p34-synthetic-dicom-operator"),
    evaluatedAt: "2026-08-15T12:00:00.000Z"
  });
  const actorIdHash = createClinicalEvidenceHash("p34-synthetic-agent");
  const candidateHash = createClinicalEvidenceHash("p34-local-candidate-unbound");
  const controlledAction = evaluateControlledToolAction({
    stage: "read",
    request: {
      actionId: "p34-read-synthetic-registry",
      approvalNonce: "p34-read-nonce-001",
      idempotencyKey: "p34-read-idempotency-001",
      tenantId: "synthetic-tenant",
      actorIdHash,
      candidateHash,
      policyVersion: p34AdaptiveGovernanceVersion,
      toolId: "validator",
      actionClass: "read",
      argumentsHash: createClinicalEvidenceHash("read-synthetic-registry"),
      target: "synthetic-registry",
      environment: "local",
      mode: "dry-run",
      dataClassification: "synthetic-no-phi",
      networkDestinations: [],
      filesystemPaths: []
    },
    authorization: {
      tenantId: "synthetic-tenant",
      candidateHash,
      authorizedToolIds: ["validator"],
      allowedNetworkDestinations: [],
      allowedFilesystemRoots: [],
      expiresAt: "2026-08-16T12:00:00.000Z"
    },
    approval: null,
    discoveredToolIds: ["validator"],
    usedApprovalIds: [],
    now: "2026-08-15T12:00:00.000Z",
    interface: "internal",
    reversible: true,
    sandboxed: true,
    cancelled: false,
    turnCount: 1,
    maximumTurns: 4
  });
  const evaluation = evaluateTwoLoopQuality({
    evaluationId: "p34-eval-synthetic-001",
    datasetVersion: "p34-synthetic-fixed-suite-v1",
    caseCount: 24,
    repeatedTrials: 3,
    baseline: {
      taskQuality: 0.94,
      severeErrorRate: 0,
      unauthorizedActionRate: 0,
      grounding: 0.96,
      costPerCompletedTaskUsd: 0,
      p95LatencyMs: 250
    },
    challenger: {
      taskQuality: 0.95,
      severeErrorRate: 0,
      unauthorizedActionRate: 0,
      grounding: 0.97,
      costPerCompletedTaskUsd: 0,
      p95LatencyMs: 240
    },
    variation: { taskQuality: 0.01, grounding: 0.01, latency: 12, cost: 0 },
    innerChecks: { safety: true, grounding: true, citation: true, extraction: true, toolSelection: true, completion: true },
    outerMetrics: {
      completionRate: 0.96,
      abandonmentRate: 0.04,
      humanCorrectionRate: 0.05,
      escalationRate: 0.08,
      repeatedPromptRate: 0.03,
      unsupportedAssertionRate: 0,
      toolFailureRate: 0,
      approvalDenialRate: 0.02,
      rawPhiStored: false
    },
    worstMaterialCellPassed: true,
    independentHumanReviewComplete: false,
    softRegressionApproved: false,
    rollbackReady: true
  });
  const finOps = evaluateFinOpsResilience({
    tenantId: "synthetic-tenant",
    taskId: "p34-task-synthetic-001",
    budget: {
      maximumInputTokens: 4_000,
      maximumCachedTokens: 2_000,
      maximumReasoningTokens: 1_000,
      maximumOutputTokens: 1_000,
      maximumCostUsd: 0.1,
      maximumLatencyMs: 2_000,
      maximumToolLatencyMs: 500,
      maximumRetries: 2,
      maximumFallbacks: 1,
      maximumTokenAmplification: 2
    },
    usage: {
      inputTokens: 800,
      cachedTokens: 300,
      reasoningTokens: 0,
      outputTokens: 120,
      costUsd: 0,
      timeToFirstTokenMs: 0,
      endToEndLatencyMs: 210,
      toolLatencyMs: 18,
      retries: 0,
      fallbacks: 0,
      providerErrors: 0,
      rateLimitEvents: 0,
      completed: true,
      humanReviewMinutes: 4,
      avoidedWorkMinutes: 12
    },
    primary: p34SyntheticPrimaryFootprint,
    fallback: p34SyntheticFallbackFootprint,
    providerAvailable: true,
    networkAvailable: true,
    quotaAvailable: true,
    placementRequiresConnectivity: false,
    cacheNamespace: "synthetic-reference-only"
  });
  const placement = selectP34Placement({
    dataClassification: "synthetic-no-phi",
    riskTier: "moderate",
    requiredRegion: "local",
    maximumLatencyMs: 1_000,
    networkAvailable: false,
    candidates: [
      {
        placementId: "placement-local-sandbox-v1",
        kind: "local",
        qualified: true,
        region: "local",
        permittedDataClassifications: ["public", "synthetic-no-phi", "deidentified-approved"],
        maximumRiskTier: "high",
        latencyMs: 20,
        connectivityRequired: false,
        contractualEligibility: "verified-local",
        auditabilityVerified: true,
        modelCapabilityVerified: true
      }
    ]
  });
  const records = createP34SyntheticGovernanceRecords(taskRoute.decisionHash, context.envelopeHash);
  const governanceVerification = verifyContemporaneousGovernanceChain(records);
  const publicClaimDecision = evaluatePublicClaimEvidence({
    claimId: "p34-unverified-market-signal",
    claim: "Unverified market signal must remain internal.",
    category: "market",
    sourceUrl: null,
    sourceKind: "social-signal",
    retrievedAt: null,
    ownerRole: "claims-owner",
    expiresAt: null,
    approvedWording: null,
    legalApprovalRecorded: false
  }, "2026-08-15T12:00:00.000Z");
  const operation = createP34SyntheticOperation(taskRoute, finOps);
  const featureFlags = getP34FeatureFlags();

  const gateMatrix: P34GateRecord[] = [
    gate({ gateId: "P34-01", status: capabilityAdmission.decision === "ALLOW" ? "PASS" : "FAIL", ownerRole: "principal-engineer", description: "Provider-neutral capability registry denies unknown, unverified, expired, and unauthorized routes.", evidence: [registry.registryHash, capabilityAdmission.decisionHash], reasonCodes: capabilityAdmission.reasonCodes, candidateBound: false, externalActionRequired: false }),
    gate({ gateId: "P34-02", status: taskRoute.selectedTechnique === "validation-rules" ? "PASS" : "FAIL", ownerRole: "principal-engineer", description: "Deterministic-first router chooses the safest sufficient technique.", evidence: [taskRoute.decisionHash], reasonCodes: taskRoute.reasonCodes, candidateBound: false, externalActionRequired: false }),
    gate({ gateId: "P34-03", status: context.conflictGroupIds.length > 0 && claimValidation.decision !== "BLOCK" ? "PASS" : "FAIL", ownerRole: "clinical-safety-owner", description: "Context provenance retains source hierarchy, citations, freshness, and conflicting facts.", evidence: [context.envelopeHash, claimValidation.validationHash], reasonCodes: ["SYNTHETIC_FIXTURE_ONLY"], candidateBound: false, externalActionRequired: false }),
    gate({ gateId: "P34-04", status: dicomPrivacy.disposition === "review-ready" && dicomPrivacy.exportAuthorized === false ? "PASS" : "FAIL", ownerRole: "privacy-security-owner", description: "Synthetic DICOM privacy adapter removes configured identifiers and private tags while retaining export review.", evidence: [dicomPrivacy.manifestHash], reasonCodes: dicomPrivacy.reasonCodes, candidateBound: false, externalActionRequired: false }),
    gate({ gateId: "P34-05", status: governanceVerification.valid ? "PASS" : "FAIL", ownerRole: "security-governance-owner", description: "Contemporaneous governance evidence remains append-only and tamper-evident.", evidence: [governanceVerification.chainHash], reasonCodes: governanceVerification.failures.map((failure) => failure.reason), candidateBound: false, externalActionRequired: false }),
    gate({ gateId: "P34-06", status: evaluation.decision === "REQUIRE_HUMAN" && evaluation.automaticPromotionAllowed === false ? "PASS" : "FAIL", ownerRole: "evaluation-owner", description: "Two-loop quality ratchet preserves hard floors and independent promotion review.", evidence: [evaluation.decisionHash], reasonCodes: evaluation.reasonCodes, candidateBound: false, externalActionRequired: false }),
    gate({ gateId: "P34-07", status: finOps.runtimeState === "NORMAL" && placement.selectedPlacementId !== null ? "PASS" : "FAIL", ownerRole: "platform-operations-owner", description: "FinOps, resilience, cache isolation, and placement controls pass the synthetic fixture.", evidence: [finOps.decisionHash, placement.decisionHash], reasonCodes: [...finOps.reasonCodes, ...placement.reasonCodes], candidateBound: false, externalActionRequired: false }),
    gate({ gateId: "P34-08", status: "OPERATOR_REQUIRED", ownerRole: "independent-technical-reviewer", description: "A named reviewer must approve the exact local commit and evidence fingerprints.", evidence: ["exact candidate review packet after local commit"], reasonCodes: ["NAMED_REVIEW_PENDING"], candidateBound: true, externalActionRequired: true }),
    gate({ gateId: "P34-09", status: "BLOCKED", ownerRole: "privacy-security-clinical-owners", description: "PHI-capable and clinical pilots require documentary, technical, legal, clinical, and security authorization.", evidence: ["no qualifying external evidence in local candidate"], reasonCodes: ["LIVE_PHI_DISABLED", "CLINICAL_AUTHORITY_ABSENT"], candidateBound: true, externalActionRequired: true }),
    gate({ gateId: "P34-10", status: "BLOCKED", ownerRole: "release-owner", description: "Production deployment, migration, external distribution, and customer activation remain prohibited.", evidence: ["release authorization absent"], reasonCodes: ["PRODUCTION_AUTHORITY_ABSENT", "CUSTOMER_ACTIVATION_AUTHORITY_ABSENT"], candidateBound: true, externalActionRequired: true })
  ];
  const statuses: P34GateStatus[] = ["PASS", "OPERATOR_REQUIRED", "BLOCKED", "FAIL"];
  const gateCounts = Object.fromEntries(statuses.map((status) => [
    status,
    gateMatrix.filter((item) => item.status === status).length
  ])) as Record<P34GateStatus, number>;
  const payload = {
    service: "scrimed-p34-adaptive-governance" as const,
    version: p34IntegratedVersion,
    status: gateCounts.FAIL > 0 ? "local-validation-failed" : "local-synthetic-candidate-review-required",
    mission: "Optimize cost per safe, clinically accepted outcome with deterministic-first, vendor-neutral, contemporaneously governed execution.",
    boundary: p34IntegratedBoundary,
    componentBoundaries: [p34AdaptiveGovernanceBoundary, p34ContextProvenanceBoundary, p34DicomPrivacyBoundary],
    route: p34IntegratedRoute,
    apiRoute: p34IntegratedApiRoute,
    briefRoute: p34IntegratedBriefRoute,
    featureFlags,
    featureFlagDefaults: p34FeatureFlagDefaults,
    registry,
    capabilityAdmission,
    taskPolicy,
    taskRoute,
    context,
    claimValidation,
    dicomPrivacy,
    controlledAction,
    governance: { records, verification: governanceVerification },
    evaluation,
    finOps,
    placement,
    operations: [operation],
    pilotObjectives: p34PilotObjectives,
    publicClaimDecision,
    gateMatrix,
    gateCounts,
    externalProviderCallsExecuted: false,
    phiProcessed: false,
    clinicalActionAuthorized: false,
    migrationExecuted: false,
    deploymentAuthorized: false,
    customerActivationAuthorized: false,
    externalDistributionAuthorized: false
  };
  return {
    ...payload,
    summaryHash: createClinicalEvidenceHash({
      type: "p34-integrated-summary",
      version: p34IntegratedVersion,
      payload
    })
  };
}

export function buildP34AdaptiveGovernanceBrief() {
  const summary = getP34AdaptiveGovernanceSummary();
  return [
    "# SCRIMED p.34 Adaptive Governance",
    "",
    `Status: ${summary.status}`,
    `Version: ${summary.version}`,
    "",
    "## Mission",
    summary.mission,
    "",
    "## Technical Evidence",
    `- Capability registry: ${summary.registry.providers.length} routes; admission ${summary.capabilityAdmission.decision}`,
    `- Deterministic route: ${summary.taskRoute.selectedTechnique ?? "safe refusal"}`,
    `- Context: ${summary.context.chunks.length} provenance chunks; ${summary.context.conflictGroupIds.length} retained conflict groups`,
    `- DICOM privacy: ${summary.dicomPrivacy.disposition}; export authorized ${summary.dicomPrivacy.exportAuthorized}`,
    `- Governance chain: ${summary.governance.verification.valid}; ${summary.governance.verification.recordCount} records`,
    `- Evaluation: ${summary.evaluation.decision}; automatic promotion ${summary.evaluation.automaticPromotionAllowed}`,
    `- Runtime: ${summary.finOps.runtimeState}; cost per completed synthetic task ${summary.finOps.costPerCompletedTaskUsd}`,
    `- Placement: ${summary.placement.selectedPlacementId ?? "safe refusal"}`,
    "",
    "## Gates",
    ...summary.gateMatrix.map((gateRecord) => `- ${gateRecord.gateId}: ${gateRecord.status} — ${gateRecord.description}`),
    "",
    "## Boundary",
    summary.boundary,
    "",
    `Summary SHA-256: ${summary.summaryHash}`
  ].join("\n");
}
