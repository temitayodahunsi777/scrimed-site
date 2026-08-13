#!/usr/bin/env node

import assert from "node:assert/strict";

import { designSystemComponentContracts } from "../app/lib/design-system/components.ts";
import { scrimedDesignTokens } from "../app/lib/design-system/tokens.ts";
import { createPublicSurfaceClaimRegistry } from "../app/lib/evidence/publicSurfaceClaimRegistry.ts";
import { createTelemetryEvent } from "../app/lib/observability/logger.ts";
import { summarizePerformanceTelemetry } from "../app/lib/observability/performanceTelemetry.ts";
import { createScrimedRequestContext } from "../app/lib/observability/requestContext.ts";
import { evaluateInternalErrorBudget } from "../app/lib/reliability/errorBudget.ts";
import { getScrimedReleaseReadiness } from "../app/lib/release/vercelReleaseAssurance.ts";
import { buildInvestorDemoRunOfShow } from "../app/lib/investorDemoRunOfShow.ts";
import { getProductConsoleApiSummary } from "../app/lib/productConsole.ts";
import {
  evaluateDistributionLockboxDecision
} from "../app/lib/proofPacketShareReadiness.ts";
import { createScrimedProofPacketCandidateBinding } from "../app/lib/scrimedProofPacketStudio.ts";
import {
  cancelAgentRun,
  checkpointAgentRun,
  createAgentRunControl,
  pauseAgentRun,
  resumeAgentRun
} from "../app/lib/scrimed-work/agentExecution.ts";
import {
  evaluateModelBenchmarkQualification,
  scrimedModelBenchmarkLanes
} from "../app/lib/scrimed-work/modelQualification.ts";
import { calculateVerifiedIntelligenceYield } from "../app/lib/scrimed-control-plane/outcomeIntelligence.ts";
import {
  scrimedPlatformGraphEdges,
  scrimedPlatformGraphNodes,
  validatePlatformGraphTopology
} from "../app/lib/scrimed-control-plane/platformGraph.ts";
import { evaluateTrustReadiness } from "../app/lib/scrimed-control-plane/trustReadiness.ts";

const safeEnv = {
  VERCEL_ENV: "preview",
  VERCEL_GIT_COMMIT_SHA: "a".repeat(40),
  SCRIMED_SYNTHETIC_ONLY: "true",
  SCRIMED_ALLOW_PHI: "false",
  SCRIMED_LIVE_CLINICAL_EXECUTION: "false",
  SCRIMED_PRODUCTION_EHR_CONNECTIONS: "false",
  SCRIMED_MEDICAL_DEVICE_CONNECTIONS: "false",
  SCRIMED_EMERGENCY_MONITORING: "false",
  SCRIMED_AUTONOMOUS_TREATMENT_ACTIONS: "false",
  SCRIMED_AUTONOMOUS_ELIGIBILITY_DECISIONS: "false",
  SCRIMED_AUTONOMOUS_PAYER_DECISIONS: "false",
  SCRIMED_FAITH_AFFECTS_CLINICAL_LOGIC: "false",
  SCRIMED_CONSEQUENTIAL_ACTIONS_ENABLED: "false",
  SCRIMED_EXTERNAL_PROVIDER_CALLS_ENABLED: "false",
  SCRIMED_AI_PROVIDER_CALLS_ENABLED: "false",
  SCRIMED_SCHEDULES_ENABLED: "false"
};
assert.equal(getScrimedReleaseReadiness(safeEnv).ok, true);
assert.equal(getScrimedReleaseReadiness({ ...safeEnv, SCRIMED_ALLOW_PHI: "true" }).ok, false);

const context = createScrimedRequestContext({
  route: "/api/workflows/4f7d5c86-2cb1-4ba0-a1bd-e87844410729?patient=forbidden",
  tenantId: "synthetic-tenant-a",
  workflowId: "workflow-a",
  agentRunId: "run-a",
  requestId: "request-secret-must-not-be-logged",
  traceId: "trace-secret-must-not-be-logged"
});
assert.equal(context.route, "/api/workflows/:id");
assert.notEqual(context.tenantHash, "synthetic-tenant-a");
assert.doesNotMatch(JSON.stringify(context), /secret-must-not-be-logged/);
const telemetry = createTelemetryEvent({ ...context, event: "request", modelRoute: null, riskTier: "low", latencyMs: 25, status: "success", errorCategory: null, costCategory: "none" });
const performance = summarizePerformanceTelemetry([telemetry]);
assert.equal(performance.errorRate, 0);
assert.equal(evaluateInternalErrorBudget({ telemetry: performance, serverFunctionFailureRate: 0, routeAvailability: 1, agentFailureRate: 0 }).status, "within-budget");

const claims = createPublicSurfaceClaimRegistry([
  { id: "synthetic-demo", surfaceType: "demo", locator: "/demos", claim: "Synthetic workflow demonstration", requestedStatus: "SYNTHETIC" },
  { id: "unsupported-verified", surfaceType: "investor-deck", locator: "slide-2", claim: "Customer outcome", requestedStatus: "VERIFIED" },
  { id: "prohibited", surfaceType: "seo-metadata", locator: "/", claim: "SCRIMED is clinically proven", requestedStatus: "QUALIFIED" }
], "2026-08-12T00:00:00.000Z");
assert.equal(claims.counts.SYNTHETIC, 1);
assert.equal(claims.counts.MISSING_EVIDENCE, 1);
assert.equal(claims.counts.PROHIBITED, 1);
assert.equal(claims.publicReleaseEligible, false);

assert.equal(scrimedDesignTokens.accessibility.minimumTouchTargetPx, 44);
assert.equal(designSystemComponentContracts.length, 18);
assert.equal(designSystemComponentContracts.every((component) => component.figmaNodeId === null), true);
assert.equal(buildInvestorDemoRunOfShow("diligence-walkthrough").durationSeconds, 1800);
const productConsoleApiSummary = getProductConsoleApiSummary();
assert.equal(productConsoleApiSummary.payloadProfile, "compact-api-v1");
assert.ok(Buffer.byteLength(JSON.stringify(productConsoleApiSummary)) < 1_000_000);
assert.equal(getProductConsoleApiSummary(), productConsoleApiSummary);
assert.equal(productConsoleApiSummary.companyAssessmentSummary.detailAvailableAt, "/api/company-assessment");

const trust = evaluateTrustReadiness({
  capabilityId: "model-compute-gateway",
  environment: "test",
  dataClassification: "internal",
  providerClass: "deterministic",
  toolClass: "read-only",
  jurisdiction: "synthetic-internal-global",
  evidenceReferences: ["model passport", "task evaluation", "route rationale", "fallback compatibility", "effective cost"],
  approvalReferences: [],
  reviewFresh: true,
  candidateBound: true,
  rollbackAvailable: true,
  externalDistributionRequested: false,
  assurance: { productionSafety: true, phiBoundaryVerified: true, modelQualified: true, agentSafetyVerified: true, evidenceComplete: true, securityVerified: false, migrationsReady: true, publicClaimsClear: true, aal2Verified: true, externalOperatorActionsComplete: true }
});
assert.equal(trust.decision, "BLOCK");
assert.ok(trust.blockedReasonCodes.includes("SECURITY_GATE_FAILED"));

const graphWithCycle = validatePlatformGraphTopology(scrimedPlatformGraphNodes, [
  ...scrimedPlatformGraphEdges,
  { id: "synthetic-cycle-a", from: "capability:model-compute-gateway", to: "capability:trust-evidence-control", relation: "depends_on", reason: "Synthetic cycle test", auditHash: "test" },
  { id: "synthetic-cycle-b", from: "capability:trust-evidence-control", to: "capability:model-compute-gateway", relation: "depends_on", reason: "Synthetic cycle test", auditHash: "test" }
]);
assert.equal(graphWithCycle.valid, false);
assert.ok(graphWithCycle.failures.some((failure) => failure.startsWith("forbidden-dependency-cycle:")));

const createdAt = "2026-08-12T00:00:00.000Z";
const runInput = { tenantId: "synthetic-tenant", environmentId: "synthetic-environment", identityId: "synthetic-agent", leaseId: "synthetic-lease", objectiveDigest: "b".repeat(64), limits: { runtimeMs: 1000, toolCalls: 2, retries: 1, costUsd: 1, nonprogressSteps: 2 }, createdAt };
const run = createAgentRunControl(runInput);
assert.equal(createAgentRunControl(runInput).runId, run.runId);
const checkpointed = checkpointAgentRun(run, { stateDigest: "c".repeat(64), summary: "Synthetic workflow checkpoint", usage: { runtimeMs: 10, toolCalls: 1, retries: 0, costUsd: 0.1, nonprogressSteps: 0 }, createdAt: "2026-08-12T00:00:01.000Z" });
const paused = pauseAgentRun(checkpointed, "2026-08-12T00:00:02.000Z");
assert.equal(resumeAgentRun(paused, "2026-08-12T00:00:03.000Z").status, "running");
assert.equal(cancelAgentRun(paused, "2026-08-12T00:00:04.000Z").status, "cancelled");
const exhausted = checkpointAgentRun(run, { stateDigest: "d".repeat(64), summary: "Synthetic budget checkpoint", usage: { runtimeMs: 10, toolCalls: 3, retries: 0, costUsd: 0.1, nonprogressSteps: 0 }, createdAt: "2026-08-12T00:00:01.000Z" });
assert.equal(exhausted.failureCategory, "tool-budget-exhausted");

const benchmarkResults = scrimedModelBenchmarkLanes.map((lane) => ({ laneId: lane.id, benchmarkVersion: lane.version, score: 1, sampleCount: lane.minimumSampleCount, severeErrorCount: 0, evidenceHash: "e".repeat(64) }));
const qualified = evaluateModelBenchmarkQualification({ modelId: "synthetic-model-v1", exactModelArtifactHash: "f".repeat(64), results: benchmarkResults, humanReviewReferences: scrimedModelBenchmarkLanes.filter((lane) => lane.humanReviewRequired).map((lane) => `review-${lane.id}`), environmentActivationRequested: false });
assert.equal(qualified.decision, "QUALIFIED_FOR_SYNTHETIC_EVALUATION");
assert.equal(evaluateModelBenchmarkQualification({ modelId: "synthetic-model-v1", exactModelArtifactHash: "f".repeat(64), results: benchmarkResults, humanReviewReferences: [], environmentActivationRequested: true }).decision, "BLOCKED");

const yieldMetric = calculateVerifiedIntelligenceYield({ acceptedEvidenceBackedOutputs: 2, modelCostUsd: 1, retryCostUsd: 0.25, reviewerBurdenUsd: 0.5, correctionBurdenUsd: 0.25, evidenceState: "synthetic", evidenceReferences: ["synthetic-eval-1"] });
assert.equal(yieldMetric.costPerAcceptedOutputUsd, 1);
assert.match(yieldMetric.displayLabel, /SYNTHETIC/);

const binding = createScrimedProofPacketCandidateBinding({ packetId: "investor-platform-packet", exactCandidateSha: "1".repeat(64), sourceFingerprint: "2".repeat(64), evidenceFingerprint: "3".repeat(64), recipientClass: "investor", intendedPurpose: "Synthetic investor diligence review", evidenceInventory: ["candidate manifest"], claimInventory: [{ claimId: "synthetic-platform-capability", status: "SYNTHETIC", evidenceReference: "candidate manifest" }], expiresAt: "2026-08-13T00:00:00.000Z", approvalsRequired: ["founder approval"], exactArtifactHashes: { "candidate manifest": "4".repeat(64) } }, createdAt);
assert.equal(binding.packetType, "investor_pitch_packet");
assert.equal(binding.claimInventory.length, 1);
const lockboxInput = { packetFingerprint: binding.packetFingerprint, expectedPacketFingerprint: binding.packetFingerprint, artifactFingerprint: "5".repeat(64), expectedArtifactFingerprint: "5".repeat(64), candidateFingerprint: "1".repeat(64), expectedCandidateFingerprint: "1".repeat(64), recipientClassConfirmed: true, aal2Verified: true, requiredApprovalIds: ["founder"], verifiedApprovalIds: ["founder"], expiresAt: "2026-08-13T00:00:00.000Z", evaluatedAt: createdAt, publicClaimsState: "CLEAR" };
assert.equal(evaluateDistributionLockboxDecision(lockboxInput).decision, "READY_FOR_AUTHORIZATION");
assert.equal(evaluateDistributionLockboxDecision({ ...lockboxInput, explicitDistributionAuthorizationReference: "authorization:synthetic-test-only", explicitDistributionAuthorizationVerified: false }).decision, "NOT_AUTHORIZED");

console.log("pass SCRIMED enterprise gap-closure policy tests (release, telemetry, claims, design, demo, trust, graph, agents, models, value, proof, and distribution controls)");
