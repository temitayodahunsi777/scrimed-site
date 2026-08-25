import { createClinicalEvidenceHash } from "../clinicalEvidenceControls";
import { getSyntheticPilotReadinessSummary } from "../commercial/syntheticPilotReadiness";
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
import {
  buildWorkflowRoiDashboard,
  createP34SyntheticActionHistory,
  createP34SyntheticContinuityAssessment,
  createP34SyntheticExpansionEvidence,
  createP34SyntheticPublicSectorProfile,
  createP34SyntheticWorkflowContract,
  evaluateIsolatedChallenger,
  evaluatePublicSectorReadiness,
  evaluateTrustExpansion,
  p34IsolatedChallengerProfiles,
  p34WorkflowContinuityBoundary,
  p34WorkflowContinuityVersion,
  selectWorkflowModelFitRoute,
  validateWorkflowContract,
  verifyActionMaturityChain
} from "./workflowContinuity";
import {
  createP34ClinicalOperatingSystemSummary,
  p34ClinicalOperatingSystemBoundary
} from "./clinicalOperatingSystem";
import {
  consumeAtomicApproval,
  createSyntheticApprovalSignature,
  createSyntheticApprovalVerifier,
  InMemorySyntheticAtomicApprovalStore,
  type AtomicApprovalToken
} from "./atomicApproval";
import {
  createP34ControlPlane2Summary,
  p34ControlPlane2Boundary
} from "./controlPlane2";
import { evaluateP34EgressFirewall, p34EgressChannels } from "./egressFirewall";
import { FixedTrustedClock } from "./trustedClock";
import {
  createSyntheticExactReviewSignature,
  createSyntheticExactReviewVerifier,
  InMemorySyntheticExactCandidateReviewStore,
  verifyExactCandidateReview,
  type P34ExactCandidateReviewApproval,
  type P34ExactCandidateBinding
} from "./exactCandidateReview";
import type { P34GateRecord, P34GateStatus, TaskPolicy } from "./types";

export * from "./types";
export * from "./adaptiveGovernance";
export * from "./contextProvenance";
export * from "./dicomPrivacy";
export * from "./workflowContinuity";
export * from "./clinicalOperatingSystem";
export * from "./atomicApproval";
export * from "./controlPlane2";
export * from "./egressFirewall";
export * from "./evidenceExpiry";
export * from "./trustedClock";
export * from "./exactCandidateReview";

export const p34IntegratedRoute = "/scrimed-p34";
export const p34IntegratedApiRoute = "/api/scrimed-control-plane/p34";
export const p34IntegratedBriefRoute = "/api/scrimed-control-plane/p34/brief";
export const p34IntegratedVersion = "scrimed-p34-integrated-v7-2026-08-25";

export const p34IntegratedBoundary =
  "SCRIMED p.34 is an adaptive, auditable, vendor-neutral synthetic/no-PHI clinical operating-system candidate with bounded workflow and autonomy contracts, model-fit routing, action maturity, tenant-first retrieval, PHI and sandbox controls, trusted evidence expiry, atomic approval verification, a global kill switch, external-validation gates, patient-education previews, continuity metrics, and evidence-gated expansion. It retains human authority and does not authorize live clinical care, PHI, diagnosis, treatment, prescribing, patient messaging, billing or payer submission, EHR/device mutation, external provider calls, production migration, deployment, customer activation, certification claims, public-sector eligibility claims, or external distribution.";

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
  const clinicalOperatingSystem = createP34ClinicalOperatingSystemSummary();
  const controlPlane2 = createP34ControlPlane2Summary();
  const syntheticPilotReadiness = getSyntheticPilotReadinessSummary();
  const atomicApprovalStore = new InMemorySyntheticAtomicApprovalStore();
  const atomicApprovalVerifierId = "p34-synthetic-atomic-verifier";
  const atomicApprovalUnsigned: Omit<AtomicApprovalToken, "signature"> = {
    schemaVersion: "scrimed-p34-atomic-approval-v2",
    approvalId: "p34-synthetic-atomic-approval",
    candidateFingerprint: controlPlane2.declaration.candidateFingerprint,
    actionId: "prepare-synthetic-internal-receipt",
    resourceId: "synthetic-internal-receipt",
    tenantId: "synthetic-tenant",
    environmentId: "local-synthetic",
    requesterClass: "synthetic-policy-runner",
    autonomyLevel: "A2",
    maturityLevel: "REVIEW_READY",
    issuedAt: "2026-08-21T03:45:00.000Z",
    expiresAt: "2026-08-21T04:15:00.000Z",
    permittedSideEffect: "reversible-synthetic-internal-write",
    nonce: "p34-synthetic-nonce-001",
    approverIdentityHash: createClinicalEvidenceHash("p34-synthetic-atomic-approval-owner"),
    policyDecisionHash: controlPlane2.action.decisionHash
  };
  const atomicApprovalToken: AtomicApprovalToken = {
    ...atomicApprovalUnsigned,
    signature: createSyntheticApprovalSignature(atomicApprovalUnsigned, atomicApprovalVerifierId)
  };
  const atomicApprovalFirstAttempt = consumeAtomicApproval({
    token: atomicApprovalToken,
    expected: {
      candidateFingerprint: atomicApprovalToken.candidateFingerprint,
      actionId: atomicApprovalToken.actionId,
      resourceId: atomicApprovalToken.resourceId,
      tenantId: atomicApprovalToken.tenantId,
      environmentId: atomicApprovalToken.environmentId,
      requesterClass: atomicApprovalToken.requesterClass,
      autonomyLevel: atomicApprovalToken.autonomyLevel,
      maturityLevel: atomicApprovalToken.maturityLevel,
      permittedSideEffect: atomicApprovalToken.permittedSideEffect,
      approverIdentityHash: atomicApprovalToken.approverIdentityHash,
      policyDecisionHash: atomicApprovalToken.policyDecisionHash
    },
    clock: new FixedTrustedClock("2026-08-21T04:00:00.000Z"),
    store: atomicApprovalStore,
    verifier: createSyntheticApprovalVerifier(atomicApprovalVerifierId)
  });
  const atomicApprovalReplayAttempt = consumeAtomicApproval({
    token: atomicApprovalToken,
    expected: {
      candidateFingerprint: atomicApprovalToken.candidateFingerprint,
      actionId: atomicApprovalToken.actionId,
      resourceId: atomicApprovalToken.resourceId,
      tenantId: atomicApprovalToken.tenantId,
      environmentId: atomicApprovalToken.environmentId,
      requesterClass: atomicApprovalToken.requesterClass,
      autonomyLevel: atomicApprovalToken.autonomyLevel,
      maturityLevel: atomicApprovalToken.maturityLevel,
      permittedSideEffect: atomicApprovalToken.permittedSideEffect,
      approverIdentityHash: atomicApprovalToken.approverIdentityHash,
      policyDecisionHash: atomicApprovalToken.policyDecisionHash
    },
    clock: new FixedTrustedClock("2026-08-21T04:00:00.000Z"),
    store: atomicApprovalStore,
    verifier: createSyntheticApprovalVerifier(atomicApprovalVerifierId)
  });
  const atomicApproval = {
    ...atomicApprovalFirstAttempt,
    evidenceClassification: "synthetic-in-process-self-test" as const,
    replayAttemptBlocked: atomicApprovalReplayAttempt.decision === "BLOCK" &&
      atomicApprovalReplayAttempt.reasonCodes.includes("APPROVAL_REPLAY_DETECTED"),
    replayAttemptReceiptHash: atomicApprovalReplayAttempt.receiptHash,
    persistentReplayProtectionAvailable: false as const,
    exactCandidateApprovalVerified: false as const,
    durableTrustedStoreRequiredForExecution: true as const
  };
  const exactReviewBinding: P34ExactCandidateBinding = {
    pullRequestNumber: 1,
    commitSha: createClinicalEvidenceHash("p34-synthetic-review-commit").slice(0, 40),
    treeSha: createClinicalEvidenceHash("p34-synthetic-review-tree").slice(0, 40),
    candidateFingerprint: createClinicalEvidenceHash("p34-synthetic-review-candidate"),
    sourceFingerprint: createClinicalEvidenceHash("p34-synthetic-review-source"),
    validationFingerprint: createClinicalEvidenceHash("p34-synthetic-review-validation"),
    reviewPacketFingerprint: createClinicalEvidenceHash("p34-synthetic-review-packet"),
    sbomFingerprint: createClinicalEvidenceHash("p34-synthetic-review-sbom"),
    gatePacketFingerprint: createClinicalEvidenceHash("p34-synthetic-review-gates")
  };
  const exactReviewVerifierId = "p34-synthetic-exact-review-verifier";
  const exactReviewUnsigned: Omit<P34ExactCandidateReviewApproval, "signature"> = {
    schemaVersion: "scrimed-p34-exact-candidate-review-v2",
    approvalId: "p34-synthetic-exact-review",
    binding: exactReviewBinding,
    reviewerIdentityHash: createClinicalEvidenceHash("p34-independent-synthetic-reviewer"),
    authorIdentityHash: createClinicalEvidenceHash("p34-synthetic-author"),
    reviewerRole: "independent-technical-reviewer",
    decision: "APPROVED_FOR_MERGE_AUTHORIZATION_REVIEW",
    issuedAt: "2026-08-21T03:45:00.000Z",
    expiresAt: "2026-08-21T04:15:00.000Z",
    nonce: "p34-synthetic-exact-review-nonce"
  };
  const exactReviewApproval: P34ExactCandidateReviewApproval = {
    ...exactReviewUnsigned,
    signature: createSyntheticExactReviewSignature(exactReviewUnsigned, exactReviewVerifierId)
  };
  const exactCandidateReviewDecision = verifyExactCandidateReview({
    approval: exactReviewApproval,
    expected: exactReviewBinding,
    expectedAuthorIdentityHash: exactReviewUnsigned.authorIdentityHash,
    clock: new FixedTrustedClock("2026-08-21T04:00:00.000Z"),
    store: new InMemorySyntheticExactCandidateReviewStore(),
    verifier: createSyntheticExactReviewVerifier(exactReviewVerifierId)
  });
  const exactCandidateReview = {
    ...exactCandidateReviewDecision,
    evidenceClassification: "synthetic-structural-self-test" as const,
    exactRemoteHeadVerified: false as const,
    independentHumanReviewVerified: false as const,
    externalTrustedStoreRequired: true as const
  };
  const egressFirewall = evaluateP34EgressFirewall({
    channel: "telemetry",
    dataClassification: "synthetic-no-phi",
    tenantId: "synthetic-tenant",
    purpose: "p34-safe-operational-observability",
    payload: {
      requestId: "p34-synthetic-request",
      workflowId: "p34-synthetic-workflow",
      actionId: controlPlane2.declaration.actionId,
      policyResult: controlPlane2.action.decision,
      releaseFingerprint: controlPlane2.declaration.candidateFingerprint
    }
  });
  const egressChannelCoverage = p34EgressChannels.map((channel) => {
    const result = evaluateP34EgressFirewall({
      channel,
      dataClassification: "synthetic-no-phi",
      tenantId: "synthetic-tenant",
      purpose: "p34-channel-coverage",
      payload: { authorization: "Bearer synthetic_example_token_123456789" }
    });
    const expectedDecision = channel === "log" || channel === "telemetry"
      ? "REQUIRE_HUMAN"
      : "BLOCK";
    return {
      channel,
      decision: result.decision,
      detectedClasses: result.detectedClasses,
      reasonCodes: result.reasonCodes,
      forwardingAuthorized: result.forwardingAuthorized,
      containsRawPhi: result.containsRawPhi,
      containsSecrets: result.containsSecrets,
      passed: result.decision === expectedDecision &&
        result.detectedClasses.includes("secret") &&
        !result.forwardingAuthorized &&
        !result.containsRawPhi &&
        !result.containsSecrets,
      decisionHash: result.decisionHash
    };
  });
  const workflowContract = createP34SyntheticWorkflowContract();
  const workflowContractDecision = validateWorkflowContract(workflowContract, "2026-08-19T12:00:00.000Z");
  const workflowModelFit = selectWorkflowModelFitRoute({
    contract: workflowContract,
    registry,
    taskClass: "validation",
    productPath: "scrimed-p34-synthetic-evaluation",
    requiredInputModality: "structured",
    requiredOutputModality: "structured",
    requiredCompatibility: [],
    requiredToolIds: ["validator"],
    requiredContextTokens: 8_000,
    minimumQuality: 0.95,
    minimumReliability: 0.99,
    preferredMaximumLatencyMs: 100,
    preferredMaximumCostUsd: 0.01,
    deterministicSufficient: true,
    degradationJustificationByRoute: {},
    evaluatedAt: "2026-08-19T12:00:00.000Z"
  });
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
    productPath: "scrimed-p34-synthetic-evaluation",
    requiredCompatibility: [],
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
  const actionEvents = createP34SyntheticActionHistory(candidateHash, context.envelopeHash);
  const actionMaturityVerification = verifyActionMaturityChain(actionEvents);
  const trustExpansion = evaluateTrustExpansion(
    createP34SyntheticExpansionEvidence(),
    "2026-08-19T12:00:00.000Z"
  );
  const continuity = createP34SyntheticContinuityAssessment();
  const publicSectorReadiness = evaluatePublicSectorReadiness(
    createP34SyntheticPublicSectorProfile(),
    "2026-08-19T12:00:00.000Z"
  );
  const challengerEvaluation = evaluateIsolatedChallenger(
    p34IsolatedChallengerProfiles[0],
    {
      runId: "p34-challenger-evaluation-not-executed",
      challengerId: p34IsolatedChallengerProfiles[0].challengerId,
      taskProfileId: "bounded-code-evaluation",
      fixtureSetHash: createClinicalEvidenceHash("p34-challenger-fixture-set"),
      harnessHash: createClinicalEvidenceHash("p34-challenger-harness"),
      seed: 34,
      evaluatedAt: "2026-08-19T12:00:00.000Z",
      isolatedEnvironmentId: "env-local-sandbox-v1",
      dataClassification: "synthetic-no-phi",
      providerCallExecuted: false,
      metrics: {
        quality: 0,
        instructionFollowing: 0,
        toolAccuracy: 0,
        p95LatencyMs: 0,
        costPerCompletedWorkflowUsd: 0,
        reliability: 0
      },
      licenseEvidenceHash: null,
      infrastructureEvidenceHash: null,
      locallyReproduced: false,
      namedApprovalRecorded: false
    }
  );
  const roiDashboard = buildWorkflowRoiDashboard({
    actionEvents,
    operations: [operation],
    continuity,
    routingDecisions: [workflowModelFit],
    expansion: trustExpansion,
    humanReviewMinutes: 4,
    completedWorkflowCostsUsd: [0],
    evidenceFreshness: workflowContractDecision.evidenceFreshness
  });
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
    gate({ gateId: "P34-10", status: "BLOCKED", ownerRole: "release-owner", description: "Production deployment, migration, external distribution, and customer activation remain prohibited.", evidence: ["release authorization absent"], reasonCodes: ["PRODUCTION_AUTHORITY_ABSENT", "CUSTOMER_ACTIVATION_AUTHORITY_ABSENT"], candidateBound: true, externalActionRequired: true }),
    gate({ gateId: "P34-11", status: workflowContractDecision.contractValid ? "PASS" : "FAIL", ownerRole: "workflow-owner", description: "Versioned workflow contract binds intended use, owner, metrics, data, authority, rollback, and fresh release evidence.", evidence: [workflowContractDecision.contractHash], reasonCodes: workflowContractDecision.reasonCodes, candidateBound: false, externalActionRequired: false }),
    gate({ gateId: "P34-12", status: workflowModelFit.selectedRouteId === "route-local-deterministic-v1" && workflowModelFit.publicBenchmarkRankUsed === false ? "PASS" : "FAIL", ownerRole: "model-governance-owner", description: "Model-fit routing selects only eligible locally evaluated routes and never routes from public rank alone.", evidence: [workflowModelFit.decisionHash], reasonCodes: workflowModelFit.routeReasons, candidateBound: false, externalActionRequired: false }),
    gate({ gateId: "P34-13", status: actionMaturityVerification.valid && actionEvents.at(-1)?.nextState === "PENDING_APPROVAL" ? "PASS" : "FAIL", ownerRole: "action-governance-owner", description: "Action maturity remains approval-pending with immutable actor, authority, input, policy, result, and rollback evidence.", evidence: [actionMaturityVerification.chainHash], reasonCodes: actionMaturityVerification.failures.map((failure) => failure.reasonCode), candidateBound: false, externalActionRequired: false }),
    gate({ gateId: "P34-14", status: "OPERATOR_REQUIRED", ownerRole: "clinical-privacy-security-operational-owners", description: "Pilot expansion requires fresh threshold evidence and named clinical, privacy/security, and operational approval.", evidence: [trustExpansion.decisionHash], reasonCodes: trustExpansion.reasonCodes, candidateBound: true, externalActionRequired: true }),
    gate({ gateId: "P34-15", status: continuity.containsRawPhi === false && continuity.causalClaimAuthorized === false && continuity.therapeuticClaimAuthorized === false ? "PASS" : "FAIL", ownerRole: "care-continuity-research-owner", description: "Continuity is measured as a non-PHI operational and research metric with human-reviewed transition work queues.", evidence: [continuity.assessmentHash], reasonCodes: continuity.providerTransitionRiskSignals, candidateBound: false, externalActionRequired: false }),
    gate({ gateId: "P34-16", status: "BLOCKED", ownerRole: "public-sector-readiness-owner", description: "Public-sector claims require fresh documentary security, residency, auditability, accessibility, procurement, and contract-vehicle evidence.", evidence: [publicSectorReadiness.decisionHash], reasonCodes: publicSectorReadiness.reasonCodes, candidateBound: true, externalActionRequired: true }),
    gate({ gateId: "P34-17", status: "BLOCKED", ownerRole: "model-governance-owner", description: "Named challenger references remain isolated, disabled, non-PHI research inputs until locally reproduced and independently approved.", evidence: [challengerEvaluation.decisionHash], reasonCodes: challengerEvaluation.reasonCodes, candidateBound: true, externalActionRequired: true }),
    gate({ gateId: "P34-18", status: roiDashboard.containsRawPhi === false && /^[0-9a-f]{64}$/.test(roiDashboard.dashboardHash) ? "PASS" : "FAIL", ownerRole: "value-telemetry-owner", description: "ROI telemetry exposes asking versus doing, verified outcomes, failures, review burden, continuity, cost, routing, and evidence freshness without PHI.", evidence: [roiDashboard.dashboardHash], reasonCodes: [], candidateBound: false, externalActionRequired: false }),
    gate({ gateId: "P34-19", status: clinicalOperatingSystem.autonomy.decision === "REQUIRE_HUMAN" && clinicalOperatingSystem.autonomy.authorizationState === "verification-required" && !clinicalOperatingSystem.autonomy.approvalConsumed && !clinicalOperatingSystem.autonomy.executionAuthorized ? "PASS" : "FAIL", ownerRole: "autonomy-policy-owner", description: "A0-A3 autonomy validates exact approval scope but cannot execute until a trusted approval store atomically verifies and consumes the approval.", evidence: [clinicalOperatingSystem.autonomy.decisionHash], reasonCodes: clinicalOperatingSystem.autonomy.reasonCodes, candidateBound: false, externalActionRequired: false }),
    gate({ gateId: "P34-20", status: clinicalOperatingSystem.phi.startupValidation.startupAllowed && clinicalOperatingSystem.phi.egress.decision === "ALLOW" && clinicalOperatingSystem.phi.egress.providerCallAuthorized === false ? "PASS" : "FAIL", ownerRole: "privacy-security-owner", description: "Sensitive schema fields are classified before startup and no raw PHI, secret, or unauthorized provider route crosses egress.", evidence: [clinicalOperatingSystem.phi.startupValidation.validationHash, clinicalOperatingSystem.phi.egress.decisionHash], reasonCodes: [...clinicalOperatingSystem.phi.startupValidation.missingClassifications, ...clinicalOperatingSystem.phi.egress.reasonCodes], candidateBound: false, externalActionRequired: false }),
    gate({ gateId: "P34-21", status: clinicalOperatingSystem.sandbox.policyCompliant && clinicalOperatingSystem.sandbox.decision === "REQUIRE_HUMAN" && !clinicalOperatingSystem.sandbox.isolatedWorkspaceAuthorized && clinicalOperatingSystem.sandbox.externalSandboxActivated === false ? "PASS" : "FAIL", ownerRole: "platform-security-owner", description: "Provider-neutral sandbox policy validates tenant, egress, resources, credentials, and cleanup while runtime containment remains unauthorized until canonical open-time verification exists.", evidence: [clinicalOperatingSystem.sandbox.decisionHash], reasonCodes: clinicalOperatingSystem.sandbox.reasonCodes, candidateBound: false, externalActionRequired: false }),
    gate({ gateId: "P34-22", status: clinicalOperatingSystem.retrieval.decision === "ALLOW" && clinicalOperatingSystem.retrieval.tenantFilterAppliedBeforeRanking ? "PASS" : "FAIL", ownerRole: "clinical-context-owner", description: "Clinical context retrieval filters tenant and purpose before ranking, preserves citations and freshness, and abstains on ambiguity or insufficient evidence.", evidence: [clinicalOperatingSystem.retrieval.decisionHash], reasonCodes: clinicalOperatingSystem.retrieval.reasonCodes, candidateBound: false, externalActionRequired: false }),
    gate({ gateId: "P34-23", status: "BLOCKED", ownerRole: "external-clinical-validation-owner", description: "Clinical production eligibility requires fresh, named, multisite external validation; internal synthetic evidence cannot satisfy this gate.", evidence: [clinicalOperatingSystem.externalValidation.decisionHash], reasonCodes: clinicalOperatingSystem.externalValidation.reasonCodes, candidateBound: true, externalActionRequired: true }),
    gate({ gateId: "P34-24", status: clinicalOperatingSystem.oversight.decision === "ALLOW" && clinicalOperatingSystem.oversight.oversightReductionAuthorized === false ? "PASS" : "FAIL", ownerRole: "clinical-safety-owner", description: "Oversight drift tracks review, corrections, absolute error volume, silent acceptance, latency, and cohort coverage without automatic review reduction.", evidence: [clinicalOperatingSystem.oversight.decisionHash], reasonCodes: clinicalOperatingSystem.oversight.reasonCodes, candidateBound: false, externalActionRequired: false }),
    gate({ gateId: "P34-25", status: clinicalOperatingSystem.patientTakeHome.decision === "REQUIRE_HUMAN" && clinicalOperatingSystem.patientTakeHome.deliveryAuthorized === false ? "PASS" : "FAIL", ownerRole: "patient-communication-owner", description: "Patient Take-Home previews use approved cited facts, preferences, accessibility, proxy rules, and clinician review while delivery remains disabled.", evidence: [clinicalOperatingSystem.patientTakeHome.documentHash], reasonCodes: clinicalOperatingSystem.patientTakeHome.reasonCodes, candidateBound: false, externalActionRequired: false }),
    gate({ gateId: "P34-26", status: clinicalOperatingSystem.coding.draftAuthorized && clinicalOperatingSystem.coding.billingSubmissionAuthorized === false ? "PASS" : "FAIL", ownerRole: "coding-governance-owner", description: "Medical coding defaults to assisted, evidence-bound drafting with human review and no billing release authority.", evidence: [clinicalOperatingSystem.coding.decisionHash], reasonCodes: clinicalOperatingSystem.coding.reasonCodes, candidateBound: false, externalActionRequired: false }),
    gate({ gateId: "P34-27", status: clinicalOperatingSystem.operations.retryAllowed && clinicalOperatingSystem.operations.idempotencyPreserved ? "PASS" : "FAIL", ownerRole: "clinical-agent-sre-owner", description: "Operational recovery classifies bounded retries, verifies checkpoints, preserves idempotency, and routes terminal failures to recovery evidence.", evidence: [clinicalOperatingSystem.operations.decisionHash], reasonCodes: clinicalOperatingSystem.operations.reasonCodes, candidateBound: false, externalActionRequired: false }),
    gate({ gateId: "P34-28", status: clinicalOperatingSystem.claims.structurallyValid && clinicalOperatingSystem.claims.decision === "REQUIRE_HUMAN" && !clinicalOperatingSystem.claims.publicationAuthorized ? "PASS" : "FAIL", ownerRole: "claims-governance-owner", description: "Machine-readable claims validate structure and evidence metadata but cannot publish without trusted evidence lookup and named publication approval.", evidence: [clinicalOperatingSystem.claims.claimHash], reasonCodes: clinicalOperatingSystem.claims.reasonCodes, candidateBound: false, externalActionRequired: false }),
    gate({ gateId: "P34-29", status: controlPlane2.action.evidenceFresh && controlPlane2.evidenceContext.classification === "synthetic-fixture-only" && !controlPlane2.evidenceContext.exactCandidateEvidenceVerified && controlPlane2.action.releaseStateCeiling === "EXACT_REVIEW_REQUIRED" ? "PASS" : "FAIL", ownerRole: "release-evidence-owner", description: "A fixed-clock synthetic fixture proves fail-closed expiry behavior; it is not exact-candidate evidence and cannot advance release state.", evidence: [controlPlane2.action.decisionHash], reasonCodes: [...controlPlane2.action.reasonCodes, "SYNTHETIC_FIXTURE_ONLY", "EXACT_CANDIDATE_EVIDENCE_UNVERIFIED"], candidateBound: false, externalActionRequired: false }),
    gate({ gateId: "P34-30", status: atomicApproval.structurallyVerified && atomicApproval.approvalConsumed && atomicApproval.replayAttemptBlocked && !atomicApproval.persistentReplayProtectionAvailable && !atomicApproval.executionAuthorized ? "PASS" : "FAIL", ownerRole: "approval-policy-owner", description: "An in-process synthetic self-test proves one-store replay rejection; durable cross-request replay protection and execution authority remain unavailable.", evidence: [atomicApproval.receiptHash, atomicApproval.replayAttemptReceiptHash], reasonCodes: [...atomicApproval.reasonCodes, "SYNTHETIC_IN_PROCESS_SELF_TEST", "DURABLE_APPROVAL_STORE_REQUIRED"], candidateBound: false, externalActionRequired: false }),
    gate({ gateId: "P34-31", status: egressFirewall.decision === "ALLOW" && !egressFirewall.forwardingAuthorized && !egressFirewall.containsRawPhi && !egressFirewall.containsSecrets && egressChannelCoverage.every((item) => item.passed) ? "PASS" : "FAIL", ownerRole: "privacy-security-owner", description: "The shared egress firewall scans every declared model, agent, telemetry, connector, proof, investor, and public channel without granting outbound authority.", evidence: [egressFirewall.decisionHash, ...egressChannelCoverage.map((item) => item.decisionHash)], reasonCodes: [...egressFirewall.reasonCodes, ...egressChannelCoverage.filter((item) => !item.passed).map((item) => `EGRESS_CHANNEL_COVERAGE_FAILED:${item.channel}`)], candidateBound: false, externalActionRequired: false }),
    gate({ gateId: "P34-32", status: ["NORMAL", "RESTRICTED", "READ_ONLY", "HALTED"].includes(controlPlane2.killSwitchMode) && !controlPlane2.governedWritesExecuted && !controlPlane2.action.a3Available ? "PASS" : "FAIL", ownerRole: "runtime-safety-owner", description: "The global kill switch defaults to read-only, reports the trusted server mode, and never grants governed writes or A3 authority.", evidence: [controlPlane2.summaryHash], reasonCodes: controlPlane2.action.reasonCodes.filter((reason) => reason.startsWith("KILL_SWITCH_")), candidateBound: false, externalActionRequired: false }),
    gate({ gateId: "P34-33", status: controlPlane2.oversight.incidents.length === 0 && !controlPlane2.oversight.executionAuthorityGranted && controlPlane2.oversightDetectorCoverage.length === 16 && controlPlane2.oversightDetectorCoverage.every((item) => item.detected && !item.executionAuthorityGranted) ? "PASS" : "FAIL", ownerRole: "oversight-sentinel-owner", description: "Oversight Sentinel 3.0 exercises autonomy, privilege, maturity, evidence, retry, delegation, budget, model, policy, route, egress, tool, network, tenant, approval, and distribution anomaly detectors without gaining execution authority.", evidence: [controlPlane2.oversight.sentinelHash, ...controlPlane2.oversightDetectorCoverage.map((item) => item.sentinelHash)], reasonCodes: controlPlane2.oversightDetectorCoverage.filter((item) => !item.detected).map((item) => `SENTINEL_DETECTOR_COVERAGE_FAILED:${item.signal}`), candidateBound: false, externalActionRequired: false }),
    gate({ gateId: "P34-34", status: Boolean(controlPlane2.trace.traceId && controlPlane2.trace.actionId && controlPlane2.trace.tenantId && controlPlane2.trace.modelId && controlPlane2.trace.promptVersion) && controlPlane2.trace.toolIds.length > 0 && controlPlane2.trace.evidenceHashes.length > 0 && [controlPlane2.trace.resultHash, controlPlane2.trace.evaluationHash, controlPlane2.trace.traceEvaluationHash].every((value) => /^[0-9a-f]{64}$/.test(value)) && controlPlane2.trace.latencyMs >= 0 && controlPlane2.trace.costUsd >= 0 && !controlPlane2.trace.containsRawPhi && !controlPlane2.trace.containsSecrets && !controlPlane2.trace.hiddenChainOfThoughtStored ? "PASS" : "FAIL", ownerRole: "evaluation-observability-owner", description: "Trace-to-eval retains every bounded model, prompt, tool, evidence, result, evaluation, correction, acceptance, latency, and cost linkage without PHI, secrets, or hidden reasoning.", evidence: [controlPlane2.trace.traceEvaluationHash], reasonCodes: [], candidateBound: false, externalActionRequired: false }),
    gate({ gateId: "P34-35", status: exactCandidateReview.structurallyVerified && exactCandidateReview.status === "EXACT_REVIEW_REQUIRED" && !exactCandidateReview.exactCandidateReviewed && !exactCandidateReview.mergeAuthorized && !exactCandidateReview.deploymentAuthorized ? "PASS" : "FAIL", ownerRole: "independent-technical-reviewer", description: "Exact-head review binding covers PR, commit, tree, candidate, source, validation, review, SBOM, and gate fingerprints; synthetic evidence cannot satisfy the independent-review gate.", evidence: [exactCandidateReview.bindingHash, exactCandidateReview.receiptHash], reasonCodes: exactCandidateReview.reasonCodes, candidateBound: false, externalActionRequired: false }),
    gate({ gateId: "P34-36", status: controlPlane2.dynamicGovernance.status === "PERMITTED" && !controlPlane2.dynamicGovernance.executionAuthorized ? "PASS" : "FAIL", ownerRole: "governance-policy-owner", description: "Adaptive Governance 2.0 returns deterministic reason-coded states across actor, tenant, environment, autonomy, maturity, evidence, data, jurisdiction, model, tool, approval, deployment, risk, and side-effect inputs.", evidence: [controlPlane2.dynamicGovernance.decisionHash], reasonCodes: controlPlane2.dynamicGovernance.reasonCodes, candidateBound: false, externalActionRequired: false }),
    gate({ gateId: "P34-37", status: controlPlane2.runtimeRevalidation.preflightValid && controlPlane2.runtimeRevalidation.decision === "ALLOW" && !controlPlane2.runtimeRevalidation.executionAuthorized && !controlPlane2.runtimeRevalidation.externalSideEffectAuthorized ? "PASS" : "FAIL", ownerRole: "runtime-safety-owner", description: "Immediate runtime revalidation binds candidate, tenant, action, resource, autonomy, maturity, policy decision, and trusted execution time while retaining the no-write ceiling.", evidence: [controlPlane2.runtimeRevalidation.decisionHash], reasonCodes: controlPlane2.runtimeRevalidation.reasonCodes, candidateBound: false, externalActionRequired: false }),
    gate({ gateId: "P34-38", status: controlPlane2.acceptedOutputExplanation.explainable && controlPlane2.causalTrace.nodes.length === 11 && !controlPlane2.causalTrace.containsRawPhi && !controlPlane2.causalTrace.hiddenChainOfThoughtStored ? "PASS" : "FAIL", ownerRole: "evaluation-observability-owner", description: "The immutable causal graph links request through accepted result and supports acceptance and evaluation-delta queries using evidence references rather than hidden reasoning.", evidence: [controlPlane2.causalTrace.graphHash, controlPlane2.acceptedOutputExplanation.explanationHash], reasonCodes: controlPlane2.acceptedOutputExplanation.reasonCodes, candidateBound: false, externalActionRequired: false }),
    gate({ gateId: "P34-39", status: syntheticPilotReadiness.status === "READY" && syntheticPilotReadiness.package.noPhi && syntheticPilotReadiness.package.nonclinical && syntheticPilotReadiness.package.nonproduction && syntheticPilotReadiness.budgetDecision.status === "PASS" && !syntheticPilotReadiness.evidencePack.productionAuthorityGranted && syntheticPilotReadiness.commercialReadiness.customerActivation === "BLOCKED" ? "PASS" : "FAIL", ownerRole: "synthetic-pilot-owner", description: "The bounded synthetic pilot package is evidence-linked, budget-controlled, no-PHI, nonclinical, nonproduction, and unable to activate a customer.", evidence: [syntheticPilotReadiness.readiness.decisionHash, syntheticPilotReadiness.budgetDecision.receiptHash, syntheticPilotReadiness.evidencePack.evidenceHash], reasonCodes: [...syntheticPilotReadiness.readiness.hardStops, ...syntheticPilotReadiness.budgetDecision.exceeded], candidateBound: false, externalActionRequired: false }),
    gate({ gateId: "P34-40", status: syntheticPilotReadiness.commercialPosture.assessment.price === "Starting at $25K, subject to written agreement" && syntheticPilotReadiness.commercialPosture.syntheticPilot.price === "Custom enterprise scope" && syntheticPilotReadiness.commercialPosture.protectedPilot.authority === "blocked-before-external-prerequisites" && !syntheticPilotReadiness.evidencePack.bindingQuoteAuthorized && !syntheticPilotReadiness.commercialHandoff.contractAuthorized ? "PASS" : "FAIL", ownerRole: "commercial-governance-owner", description: "Commercial posture exposes a safe assessment starting point while custom and protected pilots remain human-scoped, nonbinding, and prerequisite-gated.", evidence: [syntheticPilotReadiness.evidencePack.evidenceHash, syntheticPilotReadiness.commercialHandoff.handoffHash], reasonCodes: [], candidateBound: false, externalActionRequired: false })
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
    mission: "Optimize cost per safe, clinically accepted workflow outcome with deterministic-first, vendor-neutral, contemporaneously governed execution, bounded autonomy, and continuity evidence.",
    boundary: p34IntegratedBoundary,
    componentBoundaries: [p34AdaptiveGovernanceBoundary, p34ContextProvenanceBoundary, p34DicomPrivacyBoundary, p34WorkflowContinuityBoundary, p34ClinicalOperatingSystemBoundary, p34ControlPlane2Boundary],
    route: p34IntegratedRoute,
    apiRoute: p34IntegratedApiRoute,
    briefRoute: p34IntegratedBriefRoute,
    featureFlags,
    featureFlagDefaults: p34FeatureFlagDefaults,
    registry,
    workflowContract,
    workflowContractDecision,
    workflowModelFit,
    capabilityAdmission,
    taskPolicy,
    taskRoute,
    context,
    claimValidation,
    dicomPrivacy,
    controlledAction,
    governance: { records, verification: governanceVerification },
    actionMaturity: { events: actionEvents, verification: actionMaturityVerification },
    evaluation,
    finOps,
    placement,
    operations: [operation],
    trustExpansion,
    continuity,
    publicSectorReadiness,
    challengerHarness: {
      version: p34WorkflowContinuityVersion,
      profiles: p34IsolatedChallengerProfiles,
      evaluation: challengerEvaluation,
      enabled: featureFlags.challengerEvaluationEnabled
    },
    roiDashboard,
    syntheticPilotReadiness,
    clinicalOperatingSystem,
    controlPlane2,
    atomicApproval,
    exactCandidateReview,
    egressFirewall,
    egressChannelCoverage,
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
    `- Workflow contract: ${summary.workflowContractDecision.decision}; evidence ${summary.workflowContractDecision.evidenceFreshness}`,
    `- Model fit: ${summary.workflowModelFit.selectedRouteId ?? "safe refusal"}; public rank used ${summary.workflowModelFit.publicBenchmarkRankUsed}`,
    `- Deterministic route: ${summary.taskRoute.selectedTechnique ?? "safe refusal"}`,
    `- Context: ${summary.context.chunks.length} provenance chunks; ${summary.context.conflictGroupIds.length} retained conflict groups`,
    `- DICOM privacy: ${summary.dicomPrivacy.disposition}; export authorized ${summary.dicomPrivacy.exportAuthorized}`,
    `- Governance chain: ${summary.governance.verification.valid}; ${summary.governance.verification.recordCount} records`,
    `- Action maturity: ${summary.actionMaturity.events.at(-1)?.nextState ?? "none"}; chain ${summary.actionMaturity.verification.valid}`,
    `- Evaluation: ${summary.evaluation.decision}; automatic promotion ${summary.evaluation.automaticPromotionAllowed}`,
    `- Runtime: ${summary.finOps.runtimeState}; cost per completed synthetic task ${summary.finOps.costPerCompletedTaskUsd}`,
    `- Placement: ${summary.placement.selectedPlacementId ?? "safe refusal"}`,
    `- Continuity: ${summary.continuity.continuityDurationDays} days; ${summary.continuity.transferCount} transfers; causal claims ${summary.continuity.causalClaimAuthorized}`,
    `- Expansion: ${summary.trustExpansion.decision}; authorized ${summary.trustExpansion.expansionAuthorized}`,
    `- Public sector: ${summary.publicSectorReadiness.decision}; compliance claims ${summary.publicSectorReadiness.complianceClaimAuthorized}`,
    `- Challengers: ${summary.challengerHarness.profiles.length} disabled research profiles; promotion ${summary.challengerHarness.evaluation.productionPromotionAuthorized}`,
    `- ROI: asking ${summary.roiDashboard.askingVersusDoing.asking}; doing ${summary.roiDashboard.askingVersusDoing.doing}; cost per completed workflow ${summary.roiDashboard.costPerCompletedWorkflowUsd}`,
    `- Autonomy: requested ${summary.clinicalOperatingSystem.autonomy.requestedTier}; granted ${summary.clinicalOperatingSystem.autonomy.grantedTier}; authorization ${summary.clinicalOperatingSystem.autonomy.authorizationState}`,
    `- PHI boundary: startup ${summary.clinicalOperatingSystem.phi.startupValidation.decision}; egress ${summary.clinicalOperatingSystem.phi.egress.decision}; provider calls ${summary.clinicalOperatingSystem.phi.egress.providerCallAuthorized}`,
    `- Sandbox: ${summary.clinicalOperatingSystem.sandbox.decision}; external vendor activated ${summary.clinicalOperatingSystem.sandbox.externalSandboxActivated}`,
    `- Retrieval: ${summary.clinicalOperatingSystem.retrieval.decision}; citation coverage ${summary.clinicalOperatingSystem.retrieval.citationCoverage}`,
    `- External validation: ${summary.clinicalOperatingSystem.externalValidation.decision}; clinical production eligible ${summary.clinicalOperatingSystem.externalValidation.clinicalProductionEligible}`,
    `- Patient Take-Home: ${summary.clinicalOperatingSystem.patientTakeHome.decision}; delivery ${summary.clinicalOperatingSystem.patientTakeHome.deliveryAuthorized}`,
    `- Medical coding: ${summary.clinicalOperatingSystem.coding.effectiveMode}; billing submission ${summary.clinicalOperatingSystem.coding.billingSubmissionAuthorized}`,
    `- Control Plane 2.0: ${summary.controlPlane2.action.decision}; ${summary.controlPlane2.evidenceContext.classification}; exact evidence ${summary.controlPlane2.evidenceContext.exactCandidateEvidenceVerified}; release ${summary.controlPlane2.release.resultingState}`,
    `- Atomic approval: ${summary.atomicApproval.evidenceClassification}; first consumption ${summary.atomicApproval.approvalConsumed}; replay blocked ${summary.atomicApproval.replayAttemptBlocked}; durable store ${summary.atomicApproval.persistentReplayProtectionAvailable}; execution ${summary.atomicApproval.executionAuthorized}`,
    `- Shared egress firewall: ${summary.egressFirewall.decision}; forwarding ${summary.egressFirewall.forwardingAuthorized}`,
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
