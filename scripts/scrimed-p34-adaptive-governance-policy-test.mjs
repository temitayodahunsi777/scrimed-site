#!/usr/bin/env node

import assert from "node:assert/strict";

import { createClinicalEvidenceHash } from "../app/lib/clinicalEvidenceControls.ts";
import {
  createP34CapabilityRegistry,
  createP34SyntheticContextEnvelope,
  createP34SyntheticDicomObject,
  createP34SyntheticGovernanceRecords,
  evaluateCapabilityAdmission,
  evaluateControlledToolAction,
  evaluateDicomDeidentification,
  evaluateFinOpsResilience,
  evaluatePublicClaimEvidence,
  evaluateTwoLoopQuality,
  getP34AdaptiveGovernanceSummary,
  getP34FeatureFlags,
  p34AdaptiveGovernanceVersion,
  p34BasicDicomDeidentificationProfile,
  p34SyntheticFallbackFootprint,
  p34SyntheticPrimaryFootprint,
  routeDeterministicFirstTask,
  selectP34Placement,
  validateGroundedClaims,
  verifyContemporaneousGovernanceChain
} from "../app/lib/scrimed-p34/index.ts";

const checks = [];
const hash = (value) => createClinicalEvidenceHash(value);

function check(id, assertion) {
  assertion();
  checks.push(id);
}

function admission(overrides = {}) {
  return {
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
    evaluatedAt: "2026-08-15T12:00:00.000Z",
    ...overrides
  };
}

function taskPolicy(overrides = {}) {
  return {
    policyId: "p34-policy-test",
    version: p34AdaptiveGovernanceVersion,
    taskClass: "validation",
    intendedUse: "validate synthetic metadata",
    riskTier: "moderate",
    dataClassification: "synthetic-no-phi",
    deterministicAlternatives: ["validation-rules", "human-escalation"],
    minimumConfidence: 0.9,
    minimumEvidenceCoverage: 0.9,
    permittedRouteIds: ["route-local-deterministic-v1"],
    permittedToolIds: ["validator"],
    reasoningBudget: "none",
    maximumLatencyMs: 2_000,
    maximumCostUsd: 0,
    approvalRequirement: "none-read-only",
    escalationOwner: "synthetic-owner",
    failClosed: true,
    ...overrides
  };
}

function technique(overrides = {}) {
  return {
    technique: "validation-rules",
    candidateId: "candidate-validator",
    available: true,
    confidence: 1,
    evidenceCoverage: 1,
    estimatedLatencyMs: 10,
    estimatedCostUsd: 0,
    routeId: "route-local-deterministic-v1",
    toolIds: ["validator"],
    ...overrides
  };
}

function controlledInput(overrides = {}) {
  const actorIdHash = hash("p34-policy-test-actor");
  const candidateHash = hash("p34-policy-test-candidate");
  const request = {
    actionId: "p34-policy-test-action",
    approvalNonce: "p34-policy-test-nonce",
    idempotencyKey: "p34-policy-test-idempotency",
    tenantId: "synthetic-tenant",
    actorIdHash,
    candidateHash,
    policyVersion: p34AdaptiveGovernanceVersion,
    toolId: "validator",
    actionClass: "write",
    argumentsHash: hash("p34-policy-test-arguments"),
    target: "synthetic-review-draft",
    environment: "local",
    mode: "dry-run",
    dataClassification: "synthetic-no-phi",
    networkDestinations: [],
    filesystemPaths: []
  };
  const approval = {
    approvalId: "p34-policy-test-approval",
    nonce: request.approvalNonce,
    idempotencyKey: request.idempotencyKey,
    approverIdHash: hash("p34-independent-approver"),
    actorIdHash,
    tenantId: request.tenantId,
    candidateHash,
    actionId: request.actionId,
    argumentsHash: request.argumentsHash,
    target: request.target,
    policyVersion: request.policyVersion,
    disposition: "approved",
    issuedAt: "2026-08-15T11:00:00.000Z",
    expiresAt: "2026-08-15T13:00:00.000Z"
  };
  return {
    stage: "propose",
    request,
    authorization: {
      tenantId: "synthetic-tenant",
      candidateHash,
      authorizedToolIds: ["validator"],
      allowedNetworkDestinations: [],
      allowedFilesystemRoots: [],
      expiresAt: "2026-08-15T13:00:00.000Z"
    },
    approval,
    discoveredToolIds: ["validator"],
    usedApprovalIds: [],
    now: "2026-08-15T12:00:00.000Z",
    interface: "internal",
    reversible: true,
    sandboxed: true,
    cancelled: false,
    turnCount: 1,
    maximumTurns: 4,
    ...overrides
  };
}

function budget() {
  return {
    maximumInputTokens: 2_000,
    maximumCachedTokens: 1_000,
    maximumReasoningTokens: 500,
    maximumOutputTokens: 500,
    maximumCostUsd: 0.2,
    maximumLatencyMs: 2_000,
    maximumToolLatencyMs: 500,
    maximumRetries: 2,
    maximumFallbacks: 1,
    maximumTokenAmplification: 2
  };
}

function usage(overrides = {}) {
  return {
    inputTokens: 800,
    cachedTokens: 200,
    reasoningTokens: 100,
    outputTokens: 120,
    costUsd: 0.02,
    timeToFirstTokenMs: 100,
    endToEndLatencyMs: 500,
    toolLatencyMs: 50,
    retries: 0,
    fallbacks: 0,
    providerErrors: 0,
    rateLimitEvents: 0,
    completed: true,
    humanReviewMinutes: 2,
    avoidedWorkMinutes: 8,
    ...overrides
  };
}

function finOps(overrides = {}) {
  return evaluateFinOpsResilience({
    tenantId: "synthetic-tenant",
    taskId: "p34-task-policy-test",
    budget: budget(),
    usage: usage(),
    primary: p34SyntheticPrimaryFootprint,
    fallback: p34SyntheticFallbackFootprint,
    providerAvailable: true,
    networkAvailable: true,
    quotaAvailable: true,
    placementRequiresConnectivity: true,
    cacheNamespace: "approved-public-reference",
    ...overrides
  });
}

function evaluation(overrides = {}) {
  return evaluateTwoLoopQuality({
    evaluationId: "p34-evaluation-policy-test",
    datasetVersion: "p34-fixed-suite-v1",
    caseCount: 20,
    repeatedTrials: 3,
    baseline: { taskQuality: 0.9, severeErrorRate: 0, unauthorizedActionRate: 0, grounding: 0.9, costPerCompletedTaskUsd: 0.02, p95LatencyMs: 500 },
    challenger: { taskQuality: 0.92, severeErrorRate: 0, unauthorizedActionRate: 0, grounding: 0.92, costPerCompletedTaskUsd: 0.02, p95LatencyMs: 480 },
    variation: { taskQuality: 0.01, grounding: 0.01, latency: 10, cost: 0.001 },
    innerChecks: { safety: true, grounding: true, citation: true, extraction: true, toolSelection: true, completion: true },
    outerMetrics: { completionRate: 0.95, abandonmentRate: 0.05, humanCorrectionRate: 0.05, escalationRate: 0.05, repeatedPromptRate: 0.02, unsupportedAssertionRate: 0, toolFailureRate: 0, approvalDenialRate: 0, rawPhiStored: false },
    worstMaterialCellPassed: true,
    independentHumanReviewComplete: false,
    softRegressionApproved: false,
    rollbackReady: true,
    ...overrides
  });
}

const registry = createP34CapabilityRegistry();

check("unknown-model-denied", () => {
  const result = evaluateCapabilityAdmission(registry, admission({ routeId: "unknown-route" }));
  assert.equal(result.decision, "BLOCK");
  assert.ok(result.reasonCodes.includes("UNKNOWN_MODEL_OR_ROUTE_DENIED"));
});

check("expired-capability-denied", () => {
  const expired = structuredClone(registry);
  expired.providers[0].verification.revalidateAt = "2026-08-15T11:59:59.000Z";
  const result = evaluateCapabilityAdmission(expired, admission());
  assert.equal(result.decision, "BLOCK");
  assert.ok(result.reasonCodes.includes("CAPABILITY_EXPIRED"));
});

check("prohibited-data-class-denied", () => {
  const result = evaluateCapabilityAdmission(registry, admission({ dataClassification: "phi-restricted" }));
  assert.equal(result.decision, "BLOCK");
  assert.equal(result.phiAuthorized, false);
});

check("unverified-provider-slot-denied", () => {
  const result = evaluateCapabilityAdmission(registry, admission({
    routeId: "route-configured-provider-evaluation-slot",
    region: "us",
    environmentId: "env-approved-edge-slot"
  }));
  assert.equal(result.decision, "BLOCK");
  assert.ok(result.reasonCodes.includes("CAPABILITY_UNVERIFIED_OR_REVOKED"));
});

check("deterministic-route-selected-when-sufficient", () => {
  const result = routeDeterministicFirstTask({
    policy: taskPolicy(),
    candidates: [technique(), technique({ technique: "generative-model", candidateId: "candidate-generation", available: true })],
    registry,
    evaluatedAt: "2026-08-15T12:00:00.000Z",
    region: "local",
    environmentId: "env-local-sandbox-v1"
  });
  assert.equal(result.decision, "ALLOW");
  assert.equal(result.selectedTechnique, "validation-rules");
  assert.equal(result.providerCallExecuted, false);
});

check("consequential-generative-fallthrough-blocked", () => {
  const result = routeDeterministicFirstTask({
    policy: taskPolicy({ taskClass: "clinical-authorization-write", approvalRequirement: "qualified-human" }),
    candidates: [technique({ technique: "generative-model", candidateId: "candidate-generation" })],
    registry,
    evaluatedAt: "2026-08-15T12:00:00.000Z",
    region: "local",
    environmentId: "env-local-sandbox-v1"
  });
  assert.equal(result.decision, "REQUIRE_HUMAN");
  assert.equal(result.selectedTechnique, null);
  assert.ok(result.reasonCodes.includes("GENERATIVE_FALLTHROUGH_PROHIBITED_FOR_CONSEQUENTIAL_TASK"));
});

check("stale-approval-rejected", () => {
  const base = controlledInput();
  const result = evaluateControlledToolAction({
    ...base,
    approval: { ...base.approval, expiresAt: "2026-08-15T11:30:00.000Z" }
  });
  assert.equal(result.decision, "BLOCK");
  assert.ok(result.reasonCodes.includes("APPROVAL_EXPIRED"));
});

check("payload-mismatched-approval-rejected", () => {
  const base = controlledInput();
  const result = evaluateControlledToolAction({
    ...base,
    approval: { ...base.approval, argumentsHash: hash("different-arguments") }
  });
  assert.equal(result.decision, "BLOCK");
  assert.ok(result.reasonCodes.includes("APPROVAL_ARGUMENTS_MISMATCH"));
});

check("cross-tenant-approval-rejected", () => {
  const base = controlledInput();
  const result = evaluateControlledToolAction({
    ...base,
    approval: { ...base.approval, tenantId: "different-tenant" }
  });
  assert.equal(result.decision, "BLOCK");
  assert.ok(result.reasonCodes.includes("APPROVAL_TENANT_MISMATCH"));
});

check("replayed-approval-rejected", () => {
  const base = controlledInput();
  const result = evaluateControlledToolAction({ ...base, usedApprovalIds: [base.approval.approvalId] });
  assert.equal(result.decision, "BLOCK");
  assert.ok(result.reasonCodes.includes("APPROVAL_REPLAY_DETECTED"));
});

check("unapproved-write-rejected", () => {
  const result = evaluateControlledToolAction({ ...controlledInput(), approval: null });
  assert.equal(result.decision, "REQUIRE_HUMAN");
  assert.equal(result.executionAuthorized, false);
});

check("browser-irreversible-action-rejected", () => {
  const result = evaluateControlledToolAction({
    ...controlledInput(),
    stage: "execute",
    interface: "browser",
    reversible: false,
    sandboxed: false
  });
  assert.equal(result.decision, "BLOCK");
  assert.ok(result.reasonCodes.includes("BROWSER_ACTION_MUST_BE_REVERSIBLE_AND_SANDBOXED"));
  assert.equal(result.executionAuthorized, false);
});

check("cancelled-action-stops", () => {
  const result = evaluateControlledToolAction({ ...controlledInput(), cancelled: true });
  assert.equal(result.decision, "BLOCK");
  assert.equal(result.cancellationObserved, true);
});

check("turn-budget-exhaustion-stops", () => {
  const result = evaluateControlledToolAction({ ...controlledInput(), turnCount: 5, maximumTurns: 4 });
  assert.equal(result.decision, "BLOCK");
  assert.ok(result.reasonCodes.includes("TURN_BUDGET_EXHAUSTED"));
});

const context = createP34SyntheticContextEnvelope();

check("context-provenance-retained", () => {
  assert.ok(context.chunks.every((chunk) => chunk.headingPath.length && chunk.sourceSpanIds.length));
  assert.ok(context.chunks.every((chunk) => chunk.boundingBox?.page === 1));
  assert.equal(context.containsRawPhi, false);
});

check("conflicting-facts-preserved", () => {
  assert.deepEqual(context.conflictGroupIds, ["synthetic-signal-course"]);
  assert.equal(context.generationDecision, "REQUIRE_HUMAN");
});

check("missing-citations-rejected", () => {
  const result = validateGroundedClaims(context, [{ claimId: "claim-missing", statementHash: hash("claim"), citedSourceSpanIds: [] }]);
  assert.equal(result.decision, "BLOCK");
  assert.deepEqual(result.unsupportedClaimIds, ["claim-missing"]);
});

check("fabricated-references-rejected", () => {
  const result = validateGroundedClaims(context, [{ claimId: "claim-fabricated", statementHash: hash("claim"), citedSourceSpanIds: ["span-does-not-exist"] }]);
  assert.equal(result.decision, "BLOCK");
  assert.deepEqual(result.fabricatedReferenceIds, ["span-does-not-exist"]);
});

check("dicom-private-tag-detected-and-redacted", () => {
  const result = evaluateDicomDeidentification({ object: createP34SyntheticDicomObject(), profile: p34BasicDicomDeidentificationProfile, operatorIdHash: hash("dicom-operator"), evaluatedAt: "2026-08-15T12:00:00.000Z" });
  assert.deepEqual(result.detectedPrivateTags, ["(0019,1001)"]);
  assert.equal(result.disposition, "review-ready");
  assert.equal(result.exportAuthorized, false);
  assert.ok(result.afterManifestHash);
});

check("burned-in-pixel-uncertainty-quarantined", () => {
  const object = createP34SyntheticDicomObject({ pixelDataPresent: true, burnedInAnnotation: "UNKNOWN" });
  const result = evaluateDicomDeidentification({ object, profile: p34BasicDicomDeidentificationProfile, operatorIdHash: hash("dicom-operator"), evaluatedAt: "2026-08-15T12:00:00.000Z" });
  assert.equal(result.disposition, "quarantined");
  assert.equal(result.pixelDisposition, "quarantined-uncertain");
  assert.equal(result.afterManifestHash, null);
});

check("malformed-dicom-fails-closed", () => {
  const object = createP34SyntheticDicomObject({ malformed: true });
  const result = evaluateDicomDeidentification({ object, profile: p34BasicDicomDeidentificationProfile, operatorIdHash: hash("dicom-operator"), evaluatedAt: "2026-08-15T12:00:00.000Z" });
  assert.equal(result.decision, "BLOCK");
  assert.equal(result.disposition, "blocked");
});

check("unsupported-transfer-syntax-fails-closed", () => {
  const object = createP34SyntheticDicomObject({ transferSyntaxUid: "9.9.9" });
  const result = evaluateDicomDeidentification({ object, profile: p34BasicDicomDeidentificationProfile, operatorIdHash: hash("dicom-operator"), evaluatedAt: "2026-08-15T12:00:00.000Z" });
  assert.equal(result.decision, "BLOCK");
  assert.ok(result.reasonCodes.includes("UNSUPPORTED_TRANSFER_SYNTAX"));
});

check("governance-ledger-tamper-detected", () => {
  const records = createP34SyntheticGovernanceRecords(hash("route"), context.envelopeHash);
  assert.equal(verifyContemporaneousGovernanceChain(records).valid, true);
  const tampered = structuredClone(records);
  tampered[0].details.proposedAction = "tampered-action";
  assert.equal(verifyContemporaneousGovernanceChain(tampered).valid, false);
});

check("governance-ledger-binds-result-output", () => {
  const records = createP34SyntheticGovernanceRecords(hash("route"), context.envelopeHash);
  assert.match(records[0].resultOutputHash, /^[0-9a-f]{64}$/);
  const tampered = structuredClone(records);
  tampered[0].resultOutputHash = hash("substituted-result-output");
  assert.equal(verifyContemporaneousGovernanceChain(tampered).valid, false);
});

check("governance-ledger-is-phi-safe", () => {
  const records = createP34SyntheticGovernanceRecords(hash("route"), context.envelopeHash);
  assert.ok(records.every((record) => record.evidenceRecord.containsRawPhi === false));
  assert.ok(records.every((record) => record.evidenceRecord.containsSecrets === false));
  assert.ok(records.every((record) => record.evidenceRecord.hiddenChainOfThoughtStored === false));
});

check("provider-outage-uses-independent-fallback-only", () => {
  const result = finOps({ providerAvailable: false });
  assert.equal(result.runtimeState, "DEGRADED");
  assert.equal(result.selectedFallbackRouteId, "synthetic-fallback-route");
  assert.equal(result.providerCallExecuted, false);
});

check("correlated-fallback-rejected", () => {
  const result = finOps({
    providerAvailable: false,
    fallback: { ...p34SyntheticFallbackFootprint, cloud: p34SyntheticPrimaryFootprint.cloud }
  });
  assert.equal(result.runtimeState, "SAFE_REFUSAL");
  assert.equal(result.selectedFallbackRouteId, null);
});

check("network-loss-safe-refusal", () => {
  const result = finOps({ networkAvailable: false });
  assert.equal(result.decision, "BLOCK");
  assert.equal(result.runtimeState, "SAFE_REFUSAL");
});

check("quota-exhaustion-without-fallback-safe-refusal", () => {
  const result = finOps({ quotaAvailable: false, fallback: null });
  assert.equal(result.runtimeState, "SAFE_REFUSAL");
  assert.ok(result.reasonCodes.includes("NO_POLICY_COMPATIBLE_FALLBACK"));
});

check("budget-exhaustion-safe-refusal", () => {
  const result = finOps({ usage: usage({ costUsd: 1 }) });
  assert.equal(result.runtimeState, "SAFE_REFUSAL");
  assert.ok(result.reasonCodes.includes("COST_BUDGET_EXHAUSTED"));
});

check("token-amplification-circuit-breaker", () => {
  const result = finOps({ usage: usage({ inputTokens: 100, cachedTokens: 90, reasoningTokens: 200, outputTokens: 200 }) });
  assert.equal(result.circuitBreakerState, "open");
  assert.equal(result.runtimeState, "SAFE_REFUSAL");
});

check("cache-isolation-is-tenant-bound", () => {
  const first = finOps({ tenantId: "synthetic-tenant-a" });
  const second = finOps({ tenantId: "synthetic-tenant-b" });
  assert.notEqual(first.tenantSafeCacheKey, second.tenantSafeCacheKey);
});

check("quality-regression-rejected", () => {
  const result = evaluation({ challenger: { taskQuality: 0.8, severeErrorRate: 0.01, unauthorizedActionRate: 0, grounding: 0.8, costPerCompletedTaskUsd: 0.01, p95LatencyMs: 400 } });
  assert.equal(result.decision, "BLOCK");
  assert.equal(result.automaticPromotionAllowed, false);
});

check("safety-floor-cannot-be-waived", () => {
  const result = evaluation({
    innerChecks: { safety: false, grounding: true, citation: true, extraction: true, toolSelection: true, completion: true },
    independentHumanReviewComplete: true,
    softRegressionApproved: true
  });
  assert.equal(result.decision, "BLOCK");
  assert.ok(result.reasonCodes.includes("HARD_FLOOR_SAFETY_FAILED"));
});

check("raw-phi-telemetry-rejected", () => {
  const result = evaluation({
    outerMetrics: { completionRate: 0.95, abandonmentRate: 0.05, humanCorrectionRate: 0.05, escalationRate: 0.05, repeatedPromptRate: 0.02, unsupportedAssertionRate: 0, toolFailureRate: 0, approvalDenialRate: 0, rawPhiStored: true }
  });
  assert.equal(result.decision, "BLOCK");
  assert.ok(result.reasonCodes.includes("RAW_PHI_ANALYTICS_PROHIBITED"));
});

check("offline-placement-survives-network-loss", () => {
  const result = selectP34Placement({
    dataClassification: "synthetic-no-phi",
    riskTier: "moderate",
    requiredRegion: "local",
    maximumLatencyMs: 100,
    networkAvailable: false,
    candidates: [{ placementId: "local", kind: "local", qualified: true, region: "local", permittedDataClassifications: ["synthetic-no-phi"], maximumRiskTier: "high", latencyMs: 10, connectivityRequired: false, contractualEligibility: "verified-local", auditabilityVerified: true, modelCapabilityVerified: true }]
  });
  assert.equal(result.decision, "ALLOW");
  assert.equal(result.selectedPlacementId, "local");
});

check("phi-placement-denied", () => {
  const result = selectP34Placement({ dataClassification: "phi-restricted", riskTier: "moderate", requiredRegion: "local", maximumLatencyMs: 100, networkAvailable: true, candidates: [] });
  assert.equal(result.decision, "BLOCK");
  assert.equal(result.phiRouteAuthorized, false);
});

check("unsupported-public-claim-fails-closed", () => {
  const result = evaluatePublicClaimEvidence({ claimId: "claim-social", claim: "Unverified product claim", category: "performance", sourceUrl: null, sourceKind: "social-signal", retrievedAt: null, ownerRole: "claims-owner", expiresAt: null, approvedWording: null, legalApprovalRecorded: false }, "2026-08-15T12:00:00.000Z");
  assert.equal(result.decision, "BLOCK");
  assert.equal(result.publicationAuthorized, false);
});

check("high-risk-feature-flags-default-off", () => {
  const flags = getP34FeatureFlags({});
  assert.equal(flags.externalProviderCallsEnabled, false);
  assert.equal(flags.dicomExportEnabled, false);
  assert.equal(flags.livePhiEnabled, false);
  assert.equal(flags.consequentialExecutionEnabled, false);
  assert.equal(flags.productionPromotionEnabled, false);
});

check("integrated-summary-retains-boundaries", () => {
  const summary = getP34AdaptiveGovernanceSummary();
  assert.equal(summary.gateCounts.FAIL, 0);
  assert.equal(summary.phiProcessed, false);
  assert.equal(summary.externalProviderCallsExecuted, false);
  assert.equal(summary.deploymentAuthorized, false);
  assert.equal(summary.customerActivationAuthorized, false);
  assert.match(summary.summaryHash, /^[0-9a-f]{64}$/);
});

console.log(`pass SCRIMED p.34 adaptive governance policy tests (${checks.length}/${checks.length})`);
