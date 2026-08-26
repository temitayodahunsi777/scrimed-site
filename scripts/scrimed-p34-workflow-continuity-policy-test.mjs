#!/usr/bin/env node

import assert from "node:assert/strict";

import { createClinicalEvidenceHash } from "../app/lib/clinicalEvidenceControls.ts";
import {
  buildWorkflowRoiDashboard,
  createP34CapabilityRegistry,
  createP34SyntheticActionHistory,
  createP34SyntheticContinuityAssessment,
  createP34SyntheticExpansionEvidence,
  createP34SyntheticPublicSectorProfile,
  createP34SyntheticWorkflowContract,
  evaluateCapabilityAdmission,
  evaluateContinuityOfCare,
  evaluateIsolatedChallenger,
  evaluatePublicSectorReadiness,
  evaluateTrustExpansion,
  p34AdaptiveGovernanceVersion,
  p34IsolatedChallengerProfiles,
  redactWorkflowTelemetry,
  selectWorkflowModelFitRoute,
  transitionActionMaturity,
  validateWorkflowContract,
  verifyActionMaturityChain
} from "../app/lib/scrimed-p34/index.ts";

const checks = [];
const hash = (value) => createClinicalEvidenceHash(value);
const evaluatedAt = "2026-08-19T12:00:00.000Z";

function check(id, assertion) {
  assertion();
  checks.push(id);
}

function modelFit(overrides = {}) {
  return {
    contract: createP34SyntheticWorkflowContract(),
    registry: createP34CapabilityRegistry(),
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
    evaluatedAt,
    ...overrides
  };
}

function approval({ candidateHash, payloadHash, approvalId = "p34-action-approval" }) {
  return {
    approvalId,
    nonce: "p34-action-approval-nonce",
    approverIdHash: hash("p34-independent-approver"),
    authority: "approve-synthetic-action",
    tenantId: "synthetic-tenant",
    workflowId: "p34-synthetic-context-validation",
    actionId: "p34-synthetic-review-action",
    candidateHash,
    payloadHash,
    issuedAt: "2026-08-19T11:00:00.000Z",
    expiresAt: "2026-08-19T13:00:00.000Z"
  };
}

function authorizedTransition(events, overrides = {}) {
  const candidateHash = hash("p34-workflow-candidate");
  const payloadHash = hash("p34-workflow-payload");
  const actorIdHash = hash("p34-workflow-actor");
  const authorization = approval({ candidateHash, payloadHash });
  return transitionActionMaturity({
    eventId: "p34-action-event-authorized",
    actionId: "p34-synthetic-review-action",
    workflowId: "p34-synthetic-context-validation",
    tenantId: "synthetic-tenant",
    fromState: "PENDING_APPROVAL",
    toState: "AUTHORIZED_EXECUTION",
    actorIdHash,
    authority: "execute-synthetic-review",
    inputHashes: [payloadHash],
    policyVersion: p34AdaptiveGovernanceVersion,
    occurredAt: evaluatedAt,
    resultHash: hash("p34-authorized-transition-result"),
    rollbackStatus: "ready",
    approval: authorization,
    candidateHash,
    payloadHash,
    idempotencyKey: "p34-action-idempotency-authorized",
    targetClass: "internal-metadata",
    executionMode: "synthetic-simulation",
    ...overrides
  }, events);
}

check("workflow-contract-validates-complete-evidence", () => {
  const decision = validateWorkflowContract(createP34SyntheticWorkflowContract(), evaluatedAt);
  assert.equal(decision.decision, "ALLOW");
  assert.equal(decision.contractValid, true);
  assert.equal(decision.executionAuthorized, false);
});

check("workflow-contract-rejects-missing-evidence", () => {
  const contract = createP34SyntheticWorkflowContract();
  contract.releaseEvidence = [];
  const decision = validateWorkflowContract(contract, evaluatedAt);
  assert.equal(decision.decision, "BLOCK");
  assert.ok(decision.reasonCodes.includes("RELEASE_EVIDENCE_REQUIRED"));
});

check("workflow-contract-rejects-stale-evidence", () => {
  const contract = createP34SyntheticWorkflowContract();
  contract.releaseEvidence[0].expiresAt = "2026-08-18T00:00:00.000Z";
  const decision = validateWorkflowContract(contract, evaluatedAt);
  assert.equal(decision.decision, "BLOCK");
  assert.equal(decision.evidenceFreshness, "stale");
});

check("workflow-contract-rejects-missing-owner", () => {
  const contract = createP34SyntheticWorkflowContract();
  contract.namedOwner = "";
  assert.ok(validateWorkflowContract(contract, evaluatedAt).reasonCodes.includes("NAMED_OWNER_REQUIRED"));
});

check("workflow-contract-blocks-phi", () => {
  const contract = createP34SyntheticWorkflowContract();
  contract.dataClassification = "phi-restricted";
  assert.ok(validateWorkflowContract(contract, evaluatedAt).reasonCodes.includes("LIVE_PHI_WORKFLOW_DISABLED"));
});

check("model-fit-selects-local-evidence-not-public-rank", () => {
  const input = modelFit();
  input.registry.providers[0].publicBenchmarkRank = 999;
  const decision = selectWorkflowModelFitRoute(input);
  assert.equal(decision.selectedRouteId, "route-local-deterministic-v1");
  assert.equal(decision.publicBenchmarkRankUsed, false);
  assert.equal(decision.providerCallExecuted, false);
});

check("model-fit-rejects-public-rank-only", () => {
  const input = modelFit();
  input.registry.providers = [input.registry.providers[1]];
  input.registry.providers[0].publicBenchmarkRank = 1;
  const decision = selectWorkflowModelFitRoute(input);
  assert.equal(decision.decision, "BLOCK");
  assert.equal(decision.selectedRouteId, null);
});

check("model-fit-requires-soft-constraint-justification", () => {
  const input = modelFit({ preferredMaximumLatencyMs: 1 });
  assert.equal(selectWorkflowModelFitRoute(input).decision, "BLOCK");
  input.degradationJustificationByRoute = { "route-local-deterministic-v1": "Controlled synthetic latency exception for local evaluation." };
  const justified = selectWorkflowModelFitRoute(input);
  assert.equal(justified.decision, "ALLOW");
  assert.equal(justified.softConstraintJustifications.length, 1);
});

check("model-fit-provider-failure-fails-closed", () => {
  const input = modelFit();
  input.registry.providers[0].operationalStatus = "unavailable";
  const decision = selectWorkflowModelFitRoute(input);
  assert.equal(decision.decision, "BLOCK");
  assert.ok(decision.rejectedRoutes[0].reasonCodes.includes("PROVIDER_NOT_HEALTHY"));
});

check("ineligible-phi-route-fails-closed", () => {
  const registry = createP34CapabilityRegistry();
  const decision = evaluateCapabilityAdmission(registry, {
    routeId: "route-local-deterministic-v1",
    taskClass: "validation",
    riskTier: "high",
    dataClassification: "phi-restricted",
    region: "local",
    environmentId: "env-local-sandbox-v1",
    requiredInputModality: "structured",
    requiredOutputModality: "structured",
    requiredToolIds: ["validator"],
    productPath: "scrimed-p34-phi-path",
    requiredCompatibility: ["fhir"],
    maximumLatencyMs: 2_000,
    maximumCostUsd: 1,
    evaluatedAt
  });
  assert.equal(decision.decision, "BLOCK");
  assert.equal(decision.phiAuthorized, false);
  assert.ok(decision.reasonCodes.includes("SIGNED_BAA_EVIDENCE_REQUIRED"));
});

const candidateHash = hash("p34-workflow-candidate");
const payloadHash = hash("p34-workflow-payload");
const pendingEvents = createP34SyntheticActionHistory(candidateHash, payloadHash);

check("action-history-is-tamper-evident", () => {
  assert.equal(verifyActionMaturityChain(pendingEvents).valid, true);
  const tampered = structuredClone(pendingEvents);
  tampered[1].authority = "substituted-authority";
  assert.equal(verifyActionMaturityChain(tampered).valid, false);
});

check("unauthorized-system-write-blocked", () => {
  const result = authorizedTransition(pendingEvents, { targetClass: "ehr", executionMode: "external" });
  assert.equal(result.decision, "BLOCK");
  assert.equal(result.externalWriteAuthorized, false);
  assert.ok(result.reasonCodes.includes("EXTERNAL_SYSTEM_OF_RECORD_WRITE_DISABLED"));
});

check("approval-candidate-mismatch-blocked", () => {
  const actorIdHash = hash("p34-workflow-actor");
  const badApproval = approval({ actorIdHash, candidateHash: hash("different-candidate"), payloadHash });
  delete badApproval.actorIdHash;
  const result = authorizedTransition(pendingEvents, { approval: badApproval });
  assert.ok(result.reasonCodes.includes("ACTION_APPROVAL_CANDIDATE_MISMATCH"));
});

check("approval-replay-blocked", () => {
  const replayHistory = structuredClone(pendingEvents);
  replayHistory[1].approvalId = "p34-action-approval";
  const result = authorizedTransition(replayHistory);
  assert.ok(result.reasonCodes.includes("ACTION_APPROVAL_REPLAY_DETECTED"));
});

check("duplicate-execution-attempt-blocked", () => {
  const result = authorizedTransition(pendingEvents, { idempotencyKey: pendingEvents[0].idempotencyKey });
  assert.ok(result.reasonCodes.includes("DUPLICATE_EXECUTION_ATTEMPT"));
});

check("authorized-synthetic-action-can-roll-back", () => {
  const authorized = authorizedTransition(pendingEvents);
  assert.equal(authorized.transitionAccepted, true);
  assert.equal(authorized.externalWriteAuthorized, false);
  const history = [...pendingEvents, authorized.event];
  const reversed = transitionActionMaturity({
    eventId: "p34-action-event-reversed",
    actionId: "p34-synthetic-review-action",
    workflowId: "p34-synthetic-context-validation",
    tenantId: "synthetic-tenant",
    fromState: "AUTHORIZED_EXECUTION",
    toState: "FAILED_OR_REVERSED",
    actorIdHash: hash("p34-workflow-actor"),
    authority: "rollback-synthetic-review",
    inputHashes: [payloadHash],
    policyVersion: p34AdaptiveGovernanceVersion,
    occurredAt: "2026-08-19T12:01:00.000Z",
    resultHash: hash("p34-rollback-result"),
    rollbackStatus: "completed",
    approval: null,
    candidateHash,
    payloadHash,
    idempotencyKey: "p34-action-idempotency-reversed",
    targetClass: "internal-metadata",
    executionMode: "synthetic-simulation"
  }, history);
  assert.equal(reversed.transitionAccepted, true);
  assert.equal(reversed.event.rollbackStatus, "completed");
  assert.equal(verifyActionMaturityChain([...history, reversed.event]).valid, true);
});

check("trust-expansion-requires-named-approvals", () => {
  const decision = evaluateTrustExpansion(createP34SyntheticExpansionEvidence(), evaluatedAt);
  assert.equal(decision.decision, "REQUIRE_HUMAN");
  assert.equal(decision.thresholdsPassed, true);
  assert.equal(decision.namedApprovalsComplete, false);
  assert.equal(decision.expansionAuthorized, false);
});

check("trust-expansion-stale-evidence-blocks", () => {
  const evidence = createP34SyntheticExpansionEvidence();
  evidence.evidenceExpiresAt = "2026-08-18T00:00:00.000Z";
  assert.equal(evaluateTrustExpansion(evidence, evaluatedAt).decision, "BLOCK");
});

check("trust-expansion-threshold-miss-blocks", () => {
  const evidence = createP34SyntheticExpansionEvidence();
  evidence.observed.criticalErrorRate = 0.01;
  const decision = evaluateTrustExpansion(evidence, evaluatedAt);
  assert.equal(decision.decision, "BLOCK");
  assert.ok(decision.reasonCodes.includes("CRITICAL_ERROR_THRESHOLD_EXCEEDED"));
});

check("continuity-transfer-stays-visible-without-causal-claim", () => {
  const assessment = createP34SyntheticContinuityAssessment();
  assert.equal(assessment.transferCount, 1);
  assert.ok(assessment.providerTransitionRiskSignals.includes("CARE_TEAM_TRANSFER_REVIEW"));
  assert.equal(assessment.containsRawPhi, false);
  assert.equal(assessment.causalClaimAuthorized, false);
  assert.equal(assessment.therapeuticClaimAuthorized, false);
});

check("continuity-unresolved-interruption-queues-review", () => {
  const tenantId = "synthetic-tenant";
  const subjectReferenceHash = hash("p34-continuity-subject");
  const teamHash = hash("p34-continuity-team");
  const assessment = evaluateContinuityOfCare({
    tenantId,
    evaluatedAt,
    relationships: [{ relationshipId: "relationship-1", tenantId, subjectReferenceHash, careTeamReferenceHash: teamHash, ownerRole: "care-owner", startedAt: "2026-08-01T00:00:00.000Z", endedAt: null }],
    events: [{ eventId: "interruption-1", tenantId, subjectReferenceHash, type: "interruption", occurredAt: "2026-08-10T00:00:00.000Z", fromCareTeamReferenceHash: teamHash, toCareTeamReferenceHash: null, reasonCode: "follow-up-gap", sourceEvidenceHash: hash("p34-continuity-interruption-evidence") }]
  });
  assert.equal(assessment.unresolvedInterruptionCount, 1);
  assert.equal(assessment.followUpWorkQueue[0].priority, "elevated");
});

check("continuity-cross-tenant-event-blocked", () => {
  const assessment = createP34SyntheticContinuityAssessment();
  const tenantId = "synthetic-tenant";
  const subjectReferenceHash = hash("subject");
  const result = evaluateContinuityOfCare({
    tenantId,
    evaluatedAt,
    relationships: [{ relationshipId: "relationship-1", tenantId, subjectReferenceHash, careTeamReferenceHash: hash("team"), ownerRole: "owner", startedAt: "2026-08-01T00:00:00.000Z", endedAt: null }],
    events: [{ eventId: "event-1", tenantId: "other-tenant", subjectReferenceHash, type: "transfer", occurredAt: evaluatedAt, fromCareTeamReferenceHash: null, toCareTeamReferenceHash: null, reasonCode: "test", sourceEvidenceHash: assessment.assessmentHash }]
  });
  assert.equal(result.decision, "BLOCK");
});

check("public-sector-evidence-does-not-create-claims", () => {
  const decision = evaluatePublicSectorReadiness(createP34SyntheticPublicSectorProfile(), evaluatedAt);
  assert.equal(decision.decision, "BLOCK");
  assert.equal(decision.complianceClaimAuthorized, false);
  assert.equal(decision.purchasingEligibilityClaimAuthorized, false);
});

check("challenger-vendor-input-remains-unverified", () => {
  const profile = p34IsolatedChallengerProfiles[0];
  const decision = evaluateIsolatedChallenger(profile, {
    runId: "challenger-run-unverified",
    challengerId: profile.challengerId,
    taskProfileId: "bounded-code-evaluation",
    fixtureSetHash: hash("challenger-fixtures"),
    harnessHash: hash("challenger-harness"),
    seed: 34,
    evaluatedAt,
    isolatedEnvironmentId: "env-local-sandbox-v1",
    dataClassification: "synthetic-no-phi",
    providerCallExecuted: false,
    metrics: { quality: 0, instructionFollowing: 0, toolAccuracy: 0, p95LatencyMs: 0, costPerCompletedWorkflowUsd: 0, reliability: 0 },
    licenseEvidenceHash: null,
    infrastructureEvidenceHash: null,
    locallyReproduced: false,
    namedApprovalRecorded: false
  });
  assert.equal(decision.decision, "BLOCK");
  assert.equal(decision.productionPromotionAuthorized, false);
  assert.equal(decision.phiAuthorized, false);
});

check("locally-reproduced-challenger-still-needs-named-review", () => {
  const profile = p34IsolatedChallengerProfiles[0];
  const decision = evaluateIsolatedChallenger(profile, {
    runId: "challenger-run-local",
    challengerId: profile.challengerId,
    taskProfileId: "bounded-code-evaluation",
    fixtureSetHash: hash("challenger-fixtures"),
    harnessHash: hash("challenger-harness"),
    seed: 34,
    evaluatedAt,
    isolatedEnvironmentId: "env-local-sandbox-v1",
    dataClassification: "synthetic-no-phi",
    providerCallExecuted: false,
    metrics: { quality: 0.95, instructionFollowing: 0.95, toolAccuracy: 0.98, p95LatencyMs: 500, costPerCompletedWorkflowUsd: 0.1, reliability: 0.99 },
    licenseEvidenceHash: hash("challenger-license-evidence"),
    infrastructureEvidenceHash: hash("challenger-infrastructure-evidence"),
    locallyReproduced: true,
    namedApprovalRecorded: false
  });
  assert.equal(decision.decision, "REQUIRE_HUMAN");
  assert.equal(decision.eligibleForNamedReview, true);
  assert.equal(decision.productionPromotionAuthorized, false);
});

check("telemetry-redacts-sensitive-fields", () => {
  const redacted = redactWorkflowTelemetry({
    traceId: "trace-safe",
    patientName: "Synthetic Example",
    promptContent: "sensitive synthetic payload",
    nested: { accessToken: "fake-token", metric: 1 },
    genericValue: "synthetic@example.com"
  });
  assert.equal(redacted.patientName, "[REDACTED]");
  assert.equal(redacted.promptContent, "[REDACTED]");
  assert.equal(redacted.nested.accessToken, "[REDACTED]");
  assert.equal(redacted.nested.metric, 1);
  assert.equal(redacted.genericValue, "[REDACTED]");
  assert.equal(redacted.traceId, "trace-safe");
});

check("roi-dashboard-is-phi-safe-and-outcome-based", () => {
  const continuity = createP34SyntheticContinuityAssessment();
  const expansion = evaluateTrustExpansion(createP34SyntheticExpansionEvidence(), evaluatedAt);
  const dashboard = buildWorkflowRoiDashboard({
    actionEvents: pendingEvents,
    operations: [{ operationId: "operation-1", task: "Synthetic review", workflow: "synthetic-workflow", responsibleHumanOwner: "owner", providerId: "scrimed-local-runtime", modelId: "deterministic-policy-engine-v1", riskTier: "moderate", state: "awaiting-review", evidenceCompleteness: 1, approvalState: "pending", taskCompleted: false, exceptionRate: 0, escalationRate: 1, humanReviewRate: 1, latencyMs: 10, costPerCompletedTaskUsd: 0, rollbackState: "ready", syntheticOnly: true }],
    continuity,
    routingDecisions: [selectWorkflowModelFitRoute(modelFit())],
    expansion,
    humanReviewMinutes: 4,
    completedWorkflowCostsUsd: [0.1, 0.2],
    evidenceFreshness: "fresh"
  });
  assert.deepEqual(dashboard.askingVersusDoing, { asking: 2, doing: 2, total: 4 });
  assert.equal(dashboard.costPerCompletedWorkflowUsd, 0.15000000000000002);
  assert.equal(dashboard.containsRawPhi, false);
  assert.match(dashboard.dashboardHash, /^[0-9a-f]{64}$/);
});

console.log(`pass SCRIMED p.34 workflow, model-fit, action, and continuity policy tests (${checks.length}/${checks.length})`);
