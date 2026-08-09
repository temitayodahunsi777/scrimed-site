#!/usr/bin/env node

import assert from "node:assert/strict";

import {
  buildQuarantinedEvaluationCandidate,
  calculateCostPerVerifiedTask,
  compareHarnessExecution,
  createModelBOM,
  createTamperEvidentOperationalEvent,
  evaluateHarnessCandidate,
  executeBoundedValidationLoop,
  selectParetoHarnessCandidates
} from "../app/lib/scrimedP32ProductionHarness.ts";
import { careContextPolicyMatrix, evaluateCareContextPolicy } from "../app/lib/scrimedP32CarePolicy.ts";
import { evaluateResourceAdmission } from "../app/lib/scrimedP32ResourceAdmission.ts";
import {
  benchmarkClinicalSerialization,
  buildActionMeasureBinding,
  buildCanonicalLongitudinalFact,
  readTenantLongitudinalFacts,
  scoreLongitudinalDataQuality
} from "../app/lib/scrimedP32ClinicalDataViews.ts";
import { evaluateRcmVoiceWorkItem } from "../app/lib/scrimedP32RcmVoice.ts";
import {
  evaluateApplicationDisposition,
  evaluateVendorChangeEvent,
  recordExternalVendorClaimHypothesis
} from "../app/lib/scrimedP32ApplicationRationalization.ts";
import { normalizeModelExecutionOutput } from "../app/lib/scrimedP32WorkflowControls.ts";
import { routeScrimedWorkModel } from "../app/lib/scrimed-work/modelRouter.ts";

const evaluatedAt = "2026-07-20T12:00:00.000Z";
const passGate = (reasonCode) => ({
  status: "PASS",
  reasonCode,
  reason: "Synthetic deterministic evidence passed.",
  evidencePointers: [`evidence:${reasonCode.toLowerCase()}`],
  mandatory: true
});
const baseScorecard = {
  clinicalAccuracy: 0.97,
  p95LatencyMs: 900,
  costPerVerifiedTask: 0.4,
  reliability: 0.99,
  privacy: passGate("PRIVACY_PASS"),
  security: passGate("SECURITY_PASS"),
  composability: 0.95,
  throughput: 25,
  evidenceCoverage: 0.98,
  downstreamCorrectionRate: 0.01
};
const hardGates = {
  safety: passGate("SAFETY_PASS"),
  privacy: passGate("PRIVACY_PASS"),
  security: passGate("SECURITY_PASS"),
  provenance: passGate("PROVENANCE_PASS"),
  requiredEvidence: passGate("EVIDENCE_PASS")
};
const floors = {
  minimumClinicalAccuracy: 0.9,
  maximumP95LatencyMs: 2_000,
  maximumCostPerVerifiedTask: 1,
  minimumReliability: 0.95,
  minimumComposability: 0.8,
  minimumThroughput: 10,
  minimumEvidenceCoverage: 0.95,
  maximumDownstreamCorrectionRate: 0.05
};
const baseCandidate = {
  candidateId: "candidate-balanced",
  modelId: "synthetic-balanced",
  taskId: "synthetic-evidence-task",
  scorecard: baseScorecard,
  hardGates,
  deterministicValidatorPassed: true,
  domainRubricPassed: true,
  counterfactualChecksPassed: true,
  blindedHumanReview: "passed",
  llmJudgeSignal: "passed",
  highRisk: true,
  evidencePointers: ["evidence:synthetic-evaluation"]
};

assert.equal(evaluateHarnessCandidate(baseCandidate, floors).status, "PASS");
const cheapUnsafe = {
  ...baseCandidate,
  candidateId: "candidate-cheap-unsafe",
  scorecard: { ...baseScorecard, p95LatencyMs: 100, costPerVerifiedTask: 0.01 },
  hardGates: {
    ...hardGates,
    safety: { ...hardGates.safety, status: "FAIL", reasonCode: "SAFETY_EVENT" }
  }
};
const cheapUnsafeResult = evaluateHarnessCandidate(cheapUnsafe, floors);
assert.equal(cheapUnsafeResult.status, "FAIL");
assert.equal(cheapUnsafeResult.failedHardGates.includes("safety"), true);
assert.deepEqual(selectParetoHarnessCandidates([baseCandidate, cheapUnsafe], floors), [baseCandidate.candidateId]);

assert.deepEqual(calculateCostPerVerifiedTask({
  inferenceUsd: 1,
  retrievalUsd: 1,
  infrastructureUsd: 1,
  validationUsd: 1,
  retryUsd: 1,
  reviewerUsd: 1,
  latencyBurdenUsd: 1,
  correctionFailureUsd: 1,
  verifiedSuccessfulTasks: 4
}), { totalCostUsd: 8, costPerVerifiedTaskUsd: 2 });
assert.equal(calculateCostPerVerifiedTask({
  inferenceUsd: 1,
  retrievalUsd: 0,
  infrastructureUsd: 0,
  validationUsd: 0,
  retryUsd: 0,
  reviewerUsd: 0,
  latencyBurdenUsd: 0,
  correctionFailureUsd: 0,
  verifiedSuccessfulTasks: 0
}).costPerVerifiedTaskUsd, null);
assert.equal(compareHarnessExecution({
  taskId: "task-compare",
  withHarness: baseScorecard,
  withoutHarness: { ...baseScorecard, costPerVerifiedTask: 0.7, evidenceCoverage: 0.7, downstreamCorrectionRate: 0.08 }
}).costPerVerifiedTaskDeltaUsd, -0.3);

const streaming = normalizeModelExecutionOutput([
  { type: "text", text: "Review prepared." },
  { type: "tool_call", callId: "call-1", toolName: "evidence.read", arguments: { sourceId: "source-1" } },
  { type: "citation", sourceId: "source-1", locator: "section-1" },
  { type: "structured", structuredResponse: { status: "review-required" } }
]);
const nonStreaming = normalizeModelExecutionOutput({
  content: [{ type: "text", text: "Review prepared." }],
  toolCalls: [{ callId: "call-1", toolName: "evidence.read", arguments: { sourceId: "source-1" } }],
  citations: [{ sourceId: "source-1", locator: "section-1" }],
  structuredResponse: { status: "review-required" }
});
assert.deepEqual(nonStreaming, streaming);
assert.equal(normalizeModelExecutionOutput([{ type: "tool_call", callId: "missing-name", arguments: {} }]).valid, false);

let executionCount = 0;
const exhausted = executeBoundedValidationLoop({
  maximumAttempts: 3,
  execute: () => ({ value: ++executionCount }),
  deterministicValidate: () => false,
  domainRubricValidate: () => false
});
assert.equal(exhausted.status, "FAIL");
assert.equal(exhausted.exhausted, true);
assert.equal(exhausted.attempts.length, 3);
const judgeUnavailableStillSecondary = executeBoundedValidationLoop({
  maximumAttempts: 2,
  execute: () => ({ valid: true }),
  deterministicValidate: (output) => output.valid,
  domainRubricValidate: (output) => output.valid,
  secondaryLlmJudge: () => { throw new Error("judge unavailable"); }
});
assert.equal(judgeUnavailableStillSecondary.status, "PASS");
assert.equal(judgeUnavailableStillSecondary.attempts[0].llmJudgeSignal, "unavailable");

const baseCareRequest = {
  requestId: "care-request-1",
  tenantId: "tenant-alpha",
  actor: { actorId: "actor-alpha", role: "clinician", authenticated: true },
  context: "ambulatory_self_service",
  taskRisk: "low",
  requestedAction: "show approved public education",
  requestedCapabilities: ["education"],
  patientFacing: false,
  currentClinicalContextAvailable: false,
  contextFreshnessMinutes: null,
  evidencePointers: ["public-education:evidence-1"],
  identityCertain: true,
  contradictoryEvidence: false,
  redFlagDetected: false,
  worseningSymptomsReported: false,
  clinicianConfirmation: false,
  signedHumanAuthorization: false,
  correlationId: "correlation-care-1"
};
assert.equal(evaluateCareContextPolicy(baseCareRequest).decision, "ALLOW");
const capabilityElevation = evaluateCareContextPolicy({
  ...baseCareRequest,
  requestedCapabilities: ["education", "diagnosis"],
  requestedAction: "diagnose"
});
assert.equal(capabilityElevation.decision, "BLOCK");
assert.equal(capabilityElevation.deniedCapabilities.includes("diagnosis"), true);
assert.equal(capabilityElevation.reasonCodes.includes("CAPABILITY_ELEVATION_DENIED"), true);
const acuteCritical = evaluateCareContextPolicy({
  ...baseCareRequest,
  context: "acute_critical",
  taskRisk: "high",
  requestedAction: "prepare an evidence alert",
  requestedCapabilities: ["alert-preparation"],
  patientFacing: false,
  currentClinicalContextAvailable: true,
  contextFreshnessMinutes: 2,
  clinicianConfirmation: true,
  signedHumanAuthorization: false
});
assert.equal(acuteCritical.decision, "BLOCK");
assert.equal(acuteCritical.reasonCodes.includes("ACUTE_CRITICAL_FAIL_CLOSED"), true);
const contradictoryCare = evaluateCareContextPolicy({ ...baseCareRequest, contradictoryEvidence: true });
assert.equal(contradictoryCare.decision, "REQUIRE_HUMAN");
assert.equal(contradictoryCare.reasonCodes.includes("CONTRADICTORY_EVIDENCE_ESCALATION"), true);
for (const cell of careContextPolicyMatrix) {
  const result = evaluateCareContextPolicy({
    ...baseCareRequest,
    requestId: `matrix-${cell.context}-${cell.taskRisk}`,
    context: cell.context,
    taskRisk: cell.taskRisk,
    requestedCapabilities: cell.context.startsWith("acute") ? ["evidence-summary"] : ["education"],
    currentClinicalContextAvailable: cell.context.startsWith("acute"),
    contextFreshnessMinutes: cell.context.startsWith("acute") ? 1 : null,
    clinicianConfirmation: cell.context === "acute_clinician",
    signedHumanAuthorization: false
  });
  if (cell.taskRisk === "prohibited" || cell.context === "acute_critical") assert.equal(result.decision, "BLOCK");
  if (cell.taskRisk === "high" && cell.context !== "acute_critical") assert.notEqual(result.decision, "ALLOW");
  assert.equal(result.executionAuthorityGranted, false);
}

const gib = 1024 ** 3;
const device = {
  memoryBytes: 8 * gib,
  sharedMemory: true,
  accelerators: ["cpu"],
  bandwidthClass: "standard",
  thermalClass: "nominal",
  powerClass: "plugged-in",
  supportedPrecisions: ["int8", "fp16"],
  privacyZone: "tenant-private"
};
const budget = {
  maximumCostUsd: 1,
  maximumLatencyMs: 5_000,
  maximumRetries: 2,
  maximumToolCalls: 4,
  maximumContextTokens: 32_000,
  maximumMemoryBytes: 8 * gib,
  maximumKvCacheBytes: 1 * gib
};
const primaryResource = {
  modelId: "large-local-model",
  deployment: "local",
  minimumResidentMemoryBytes: 8 * gib,
  peakResidentMemoryBytes: 9 * gib,
  estimatedKvCacheBytes: 1 * gib,
  estimatedCostUsd: 0.4,
  estimatedLatencyMs: 2_000,
  contextTokens: 32_000,
  requiredAccelerators: ["cpu"],
  precision: "fp16",
  quantized: false,
  zeroCopySupported: true,
  expectedQuality: 0.95
};
const compactResource = {
  ...primaryResource,
  modelId: "compact-quantized-local-model",
  minimumResidentMemoryBytes: 2 * gib,
  peakResidentMemoryBytes: 3 * gib,
  estimatedKvCacheBytes: 0.25 * gib,
  estimatedCostUsd: 0.1,
  estimatedLatencyMs: 800,
  contextTokens: 16_000,
  precision: "int8",
  quantized: true,
  expectedQuality: 0.9
};
const admissionBase = {
  requestId: "admission-1",
  tenantId: "tenant-alpha",
  taskId: "synthetic-administrative-task",
  dataClassification: "synthetic-no-phi",
  riskLevel: "low",
  device,
  budget,
  primary: primaryResource,
  fallbacks: [compactResource],
  retryCount: 0,
  toolCallCount: 0,
  policy: {
    localProcessingApproved: true,
    remoteProcessingRequested: false,
    livePhiProcessingAuthorized: false,
    consentConfirmed: false,
    baaApproved: false,
    residencyApproved: true,
    providerCapabilityApproved: false
  },
  failureSignal: "memory-pressure",
  correlationId: "correlation-admission-1"
};
const constrained = evaluateResourceAdmission(admissionBase);
assert.equal(constrained.state, "CONSTRAINED");
assert.equal(constrained.selectedModelId, compactResource.modelId);
assert.equal(constrained.modelExecutionAuthorized, false);
const refused = evaluateResourceAdmission({ ...admissionBase, fallbacks: [] });
assert.equal(refused.state, "SAFE_REFUSAL");
assert.equal(refused.admissionAllowed, false);
const remotePhi = evaluateResourceAdmission({
  ...admissionBase,
  dataClassification: "phi",
  primary: { ...compactResource, modelId: "remote-model", deployment: "remote" },
  fallbacks: [],
  failureSignal: "none",
  policy: { ...admissionBase.policy, remoteProcessingRequested: true, providerCapabilityApproved: true }
});
assert.equal(remotePhi.state, "SAFE_REFUSAL");
assert.equal(remotePhi.reasonCodes.includes("LIVE_PHI_AUTHORITY_MISSING"), true);
assert.equal(remotePhi.reasonCodes.includes("REMOTE_PHI_ROUTE_DISABLED_CURRENT_POLICY"), true);

const routeWithoutAdmission = routeScrimedWorkModel({
  taskType: "synthetic bounded extraction",
  risk: "low",
  requiredCapability: "balanced",
  dataClassification: "synthetic-no-phi",
  latencyTargetMs: 3_000,
  budgetUsd: 1,
  tenantPolicy: "no PHI",
  reasoningRequirement: "low",
  qualityThreshold: 0.8
});
assert.equal(routeWithoutAdmission.routingStatus, "selected");
assert.equal(routeWithoutAdmission.runtimeState, "NORMAL");
const routeResourceRefusal = routeScrimedWorkModel({
  taskType: "synthetic bounded extraction",
  risk: "low",
  requiredCapability: "balanced",
  dataClassification: "synthetic-no-phi",
  latencyTargetMs: 3_000,
  budgetUsd: 1,
  tenantPolicy: "no PHI",
  reasoningRequirement: "low",
  qualityThreshold: 0.8,
  resourceAdmission: { state: "SAFE_REFUSAL", allowedModelIds: [], auditHash: refused.auditHash }
});
assert.equal(routeResourceRefusal.routingStatus, "blocked-by-policy");
assert.equal(routeResourceRefusal.runtimeState, "SAFE_REFUSAL");

const fact = buildCanonicalLongitudinalFact({
  factId: "fact-1",
  tenantId: "tenant-alpha",
  syntheticSubjectId: "synthetic-subject-1",
  entity: "observation",
  conceptCode: "synthetic-bp",
  conceptSystem: "SCRIMED-SYNTHETIC",
  source: {
    sourceId: "source-fhir-1",
    channel: "fhir",
    systemOfRecord: true,
    recordPointerHash: "a".repeat(64),
    sourceDigest: "b".repeat(64),
    sourceTimestamp: "2026-07-19T12:00:00.000Z",
    receivedAt: "2026-07-19T12:01:00.000Z"
  },
  transformation: { version: "canonical-v1", transformedAt: evaluatedAt, derived: true, confidence: 0.99 },
  clinicalState: {
    severity: "unknown",
    duration: "single synthetic observation",
    temporalCourse: "stable",
    controlStatus: "unknown",
    uncertainty: [],
    measurements: [{ name: "synthetic systolic", value: 120, unit: "mm[Hg]", observedAt: "2026-07-19T12:00:00.000Z" }]
  },
  syntheticOnly: true,
  noPhiConfirmed: true
});
const serializations = benchmarkClinicalSerialization([fact]);
assert.equal(serializations.every((entry) => entry.sourceLinkCoverage === 1 && entry.temporalCoverage === 1 && entry.measurementCoverage === 1), true);
assert.equal(serializations.every((entry) => entry.authoritativeRecord === false), true);
assert.throws(() => readTenantLongitudinalFacts("tenant-beta", [fact]), /Cross-tenant/);
const quality = scoreLongitudinalDataQuality({
  facts: [fact],
  evaluatedAt,
  maximumFreshnessDays: 30,
  contradictoryFactPairs: [["fact-1", "fact-2"]],
  duplicateFactIds: [],
  patientMatchConfidence: 0.99
});
assert.equal(quality.humanReviewRequired, true);
assert.equal(quality.issues.includes("CONTRADICTORY_FACTS"), true);
const measure = buildActionMeasureBinding({
  measureId: "synthetic-preventive-measure",
  measureFamily: "preventive-care",
  sourceFactIds: [fact.factId],
  workflowOwner: "quality-operations-owner",
  status: "review-required"
});
assert.equal(measure.externalSubmissionAllowed, false);

const baseVoiceWorkItem = {
  workItemId: "voice-item-1",
  tenantId: "tenant-alpha",
  actor: { actorId: "operator-alpha", role: "revenue-cycle-operator", authenticated: true },
  payerId: "synthetic-payer",
  useCase: "claim-status",
  scriptId: "status-retrieval-script-v1",
  identityFactorsVerified: 2,
  authorizationVerified: true,
  consentConfigurationVerified: true,
  syntheticOnly: true,
  noPhiConfirmed: true,
  transcript: "The synthetic claim status could not be confirmed.",
  structuredOutcome: {
    statusCode: "PENDING",
    statusLabel: "Pending synthetic review",
    referenceHash: "c".repeat(64),
    confidence: 0.6,
    ambiguous: true,
    contradictory: false
  },
  attempt: 1,
  proposedWritebackRequested: true,
  idempotencyKey: "voice-writeback-1",
  correlationId: "correlation-voice-1"
};
const ambiguousVoice = evaluateRcmVoiceWorkItem({
  workItem: baseVoiceWorkItem,
  env: { SCRIMED_P32_RCM_VOICE_ENABLED: "true" }
});
assert.equal(ambiguousVoice.decision, "REQUIRE_HUMAN");
assert.equal(ambiguousVoice.states.includes("human-exception-queue"), true);
assert.equal(ambiguousVoice.proposedWriteback, null);
assert.equal(ambiguousVoice.writebackExecuted, false);
assert.equal(ambiguousVoice.externalCallExecuted, false);
const prohibitedVoice = evaluateRcmVoiceWorkItem({
  workItem: { ...baseVoiceWorkItem, useCase: "appeal" },
  env: { SCRIMED_P32_RCM_VOICE_ENABLED: "true" }
});
assert.equal(prohibitedVoice.decision, "BLOCK");
const clearVoice = evaluateRcmVoiceWorkItem({
  workItem: {
    ...baseVoiceWorkItem,
    transcript: "The synthetic claim status is pending review.",
    structuredOutcome: { ...baseVoiceWorkItem.structuredOutcome, confidence: 0.99, ambiguous: false },
    proposedWritebackRequested: true
  },
  env: { SCRIMED_P32_RCM_VOICE_ENABLED: "true" }
});
assert.equal(clearVoice.decision, "REQUIRE_HUMAN");
assert.equal(clearVoice.proposedWriteback?.humanApprovalRequired, true);
assert.equal(clearVoice.writebackExecuted, false);

const application = {
  applicationId: "application-legacy-1",
  tenantId: "tenant-alpha",
  owner: "clinical-app-owner",
  workflows: ["clinical-document-review"],
  userEvidence: {
    activeUsers30Days: 2,
    workflowExecutions30Days: 5,
    lastObservedAt: evaluatedAt,
    telemetryCoverage: 0.99,
    sourceReference: "telemetry:application-legacy-1"
  },
  dataClasses: ["synthetic"],
  interfaces: [{ interfaceId: "fhir-read", standard: "FHIR R4", direction: "inbound", criticality: "high", replacementValidated: false }],
  dependencies: ["identity-provider"],
  annualCost: 10_000,
  cyberRisk: "high",
  clinicalCriticality: "critical",
  evidenceOfValue: ["evidence:workflow-usage"],
  portability: {
    exportAvailable: true,
    exportFormat: "JSON",
    exportTested: false,
    vendorIndependentRecoveryTested: false,
    estimatedTransitionDays: 90,
    evidenceReference: "portability:application-legacy-1"
  },
  requestedDisposition: "retire"
};
const retirement = evaluateApplicationDisposition({
  application,
  retirementEvidence: {
    exportComplete: false,
    retentionPlanApproved: false,
    exportHashVerified: false,
    replacementValidated: false,
    rollbackTested: false,
    downtimePlanApproved: false,
    recoveryTested: false,
    legalReviewComplete: false,
    securityReviewComplete: false,
    clinicalOwnerApprovalComplete: false,
    workflowOwnerApprovalComplete: false,
    evidencePointers: []
  }
});
assert.equal(retirement.decision, "BLOCK");
assert.equal(retirement.retirementExecuted, false);
assert.equal(retirement.reasonCodes.includes("RETIREMENT_EXPORT_COMPLETE_REQUIRED"), true);
const vendorChange = evaluateVendorChangeEvent({
  eventId: "vendor-change-1",
  vendorId: "vendor-alpha",
  type: "terms-of-service-change",
  material: true,
  detectedAt: evaluatedAt,
  evidenceReference: "vendor-evidence:terms-v2",
  reviewed: false,
  approved: false,
  portabilityRouteId: null,
  affectedWorkflows: ["clinical-document-review"]
});
assert.equal(vendorChange.decision, "BLOCK");
assert.equal(vendorChange.newDeploymentsAllowed, false);
assert.equal(vendorChange.writesFrozen, true);
assert.equal(recordExternalVendorClaimHypothesis({
  hypothesisId: "hypothesis-1",
  vendorId: "vendor-alpha",
  claim: "External vendor-reported improvement",
  sourceReference: "public-reference:vendor-case-study",
  sourceKind: "vendor-case-study",
  requiredScrimedEvidence: ["reproducible workflow evaluation"]
}).eligibleForClinicalOrCommercialClaim, false);

const rejectedFixture = buildQuarantinedEvaluationCandidate({
  candidateId: "fixture-rejected",
  sourceFindingId: "monitor-finding-1",
  source: "monitor-finding",
  inputFingerprint: "d".repeat(64),
  expectedBehaviorReference: "expected:policy-refusal",
  deidentified: false,
  reviewerApproved: false,
  containsRawPhi: true
});
assert.equal(rejectedFixture.status, "rejected");
const approvedFixture = buildQuarantinedEvaluationCandidate({
  ...rejectedFixture,
  candidateId: "fixture-approved",
  deidentified: true,
  reviewerApproved: true,
  containsRawPhi: false
});
assert.equal(approvedFixture.status, "eligible-for-offline-evaluation");

const bom = createModelBOM({
  artifactId: "artifact-1",
  tenantId: "tenant-alpha",
  workflowId: "synthetic-evidence-task",
  model: { providerId: "synthetic", modelId: "synthetic-no-call", version: "1", configurationHash: "e".repeat(64) },
  policyVersion: "policy-v1",
  promptTemplateVersion: "prompt-v1",
  retrievalSourceIds: ["source-1"],
  toolVersions: [{ toolId: "evidence-read", version: "1", digest: "f".repeat(64) }],
  serializationStrategy: "compact-structured",
  runtimeConfigurationHash: "1".repeat(64),
  correlationId: "correlation-bom-1",
  createdAt: evaluatedAt
});
assert.match(bom.bomHash, /^[a-f0-9]{64}$/);
const audit = createTamperEvidentOperationalEvent({
  eventId: "audit-1",
  tenantId: "tenant-alpha",
  workflowId: "synthetic-evidence-task",
  eventType: "monitor-finding",
  correlationId: "correlation-audit-1",
  summary: { authorization: "Bearer unsafe-token", email: "person@example.com", secret: "do-not-store", finding: "retry storm" },
  occurredAt: evaluatedAt,
  previousEventHash: null
});
assert.equal(JSON.stringify(audit).includes("unsafe-token"), false);
assert.equal(JSON.stringify(audit).includes("person@example.com"), false);
assert.equal(JSON.stringify(audit).includes("do-not-store"), false);
assert.match(audit.eventHash, /^[a-f0-9]{64}$/);

console.log("pass SCRIMED p.32 execution harness and guarded workflow policy tests");
