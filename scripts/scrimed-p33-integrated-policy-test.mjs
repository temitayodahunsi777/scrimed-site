#!/usr/bin/env node

import assert from "node:assert/strict";

import {
  applyEmergencyRevocation,
  authorizeContextView,
  buildContextArtifact,
  compressClinicalSignals,
  createDecisionEvidenceRecord,
  createDiscoverabilityFact,
  createSyntheticAgentTaskEnvelope,
  createSyntheticContextFixture,
  createSyntheticDecisionEvidenceFixture,
  evaluateAgenticChange,
  evaluateClinicalExtractionReleaseGate,
  evaluateClinicalTrajectory,
  evaluateLocalWorkerAdmission,
  evaluateOversightDrift,
  evaluatePilotProfile,
  evaluateRegulatoryLabelRequest,
  getP33FeatureFlags,
  getP33IntegratedSummary,
  getP33OpportunitySummary,
  p33OversightPolicy,
  p33SignalCompressionLabel,
  p33SyntheticRouteCandidates,
  p33SyntheticTrajectoryCase,
  routePortableAgentTask,
  scalarOffsetToUtf16,
  utf16OffsetToScalar,
  verifyDecisionEvidenceChain
} from "../app/lib/scrimed-p33/index.ts";
import { createClinicalEvidenceHash } from "../app/lib/clinicalEvidenceControls.ts";

const checks = [];

function check(id, assertion) {
  assertion();
  checks.push(id);
}

const fixture = createSyntheticContextFixture();
const validHash = createClinicalEvidenceHash("p33-test");

check("unicode-scalar-to-utf16-offset", () => {
  const value = "A🩺B";
  assert.equal(scalarOffsetToUtf16(value, 2), 3);
  assert.equal(utf16OffsetToScalar(value, 3), 2);
  assert.throws(() => utf16OffsetToScalar(value, 2), /surrogate pair/);
});

check("context-artifact-provenance-and-no-phi", () => {
  assert.equal(fixture.containsRawPhi, false);
  assert.ok(fixture.sourceSpans.every((span) => span.sourceHash.length === 64));
  assert.ok(fixture.facts.every((fact) => fact.sourceSpanIds.length > 0));
});

check("context-tenant-isolation", () => {
  const result = authorizeContextView(fixture, {
    grantId: "grant-cross-tenant",
    tenantId: "other-tenant",
    agentId: "perfect-chart",
    purpose: "synthetic-clinical-review",
    requestedSections: ["problems"],
    issuedAt: "2026-08-13T00:00:00.000Z",
    expiresAt: "2026-09-13T00:00:00.000Z",
    revokedAt: null
  }, "2026-08-13T01:00:00.000Z");
  assert.equal(result.decision, "BLOCK");
  assert.ok(result.reasonCodes.includes("CROSS_TENANT_CONTEXT_ACCESS_BLOCKED"));
  assert.equal(result.view, null);
});

check("revoked-context-grant", () => {
  const result = authorizeContextView(fixture, {
    grantId: "grant-revoked",
    tenantId: "synthetic-tenant",
    agentId: "perfect-chart",
    purpose: "synthetic-clinical-review",
    requestedSections: ["problems"],
    issuedAt: "2026-08-13T00:00:00.000Z",
    expiresAt: "2026-09-13T00:00:00.000Z",
    revokedAt: "2026-08-13T00:30:00.000Z"
  }, "2026-08-13T01:00:00.000Z");
  assert.equal(result.decision, "BLOCK");
  assert.ok(result.reasonCodes.includes("CONTEXT_GRANT_REVOKED"));
});

check("context-classification-fails-closed", () => {
  assert.throws(() => buildContextArtifact({
    artifactId: "ctx-invalid-public",
    tenantId: "synthetic-tenant",
    subjectReference: "subject",
    inputClassification: "public",
    deidentificationState: "approved-deidentified",
    documents: [],
    timeline: [],
    coreferences: [],
    conceptMappings: [],
    medicationProblemRelations: [],
    accessPolicy: fixture.accessPolicy,
    missingInformation: [],
    expiresAt: "2027-01-01T00:00:00.000Z",
    version: "1"
  }), /source document|synthetic/);
});

check("clinical-compression-declares-omissions", () => {
  const compression = compressClinicalSignals(fixture, {
    compressionId: "compression-test",
    purpose: "synthetic-clinical-review",
    maximumFacts: 2
  });
  assert.equal(compression.replacesSourceRecord, false);
  assert.equal(compression.humanReviewRequired, true);
  assert.ok(compression.omittedSectionIds.length > 0);
  assert.ok(compression.sourceSpanIds.length > 0);
});

check("clinical-extraction-release-fails-closed", () => {
  const result = evaluateClinicalExtractionReleaseGate({
    extractionId: "extraction-blocked",
    contextArtifactHash: fixture.integrityHash,
    provenanceComplete: false,
    evidenceComplete: true,
    policyVersion: null,
    terminologyAuthorization: "missing",
    safetyChecksPassed: false,
    qualifiedReviewerIdHash: null,
    reviewDecision: "pending",
    contradictionsResolved: false,
    containsUnsupportedClinicalClaim: true
  });
  assert.equal(result.decision, "BLOCK");
  assert.equal(result.exportAuthority, "none");
  assert.equal(result.clinicalRecordAuthority, false);
});

check("decision-ledger-valid-and-tamper-evident", () => {
  const records = createSyntheticDecisionEvidenceFixture();
  assert.equal(verifyDecisionEvidenceChain(records).valid, true);
  const tampered = records.map((record, index) => index === 1 ? { ...record, intendedUse: "tampered" } : record);
  assert.equal(verifyDecisionEvidenceChain(tampered).valid, false);
});

check("decision-ledger-append-only", () => {
  const records = createSyntheticDecisionEvidenceFixture();
  assert.throws(() => createDecisionEvidenceRecord({
    ...records[1],
    recordId: records[0].recordId,
    recordHash: undefined
  }, records), /cannot be reused/);
});

check("regulatory-label-conflict-blocked", () => {
  const result = evaluateRegulatoryLabelRequest(p33SignalCompressionLabel, {
    actorRole: "synthetic-operator",
    requestedUse: "autonomous diagnosis",
    requestedClaimIds: [],
    dataClassification: "synthetic-no-phi",
    validationEvidenceIds: [],
    passedReleaseGateIds: [],
    evaluatedAt: "2026-08-13T12:00:00.000Z"
  });
  assert.equal(result.decision, "BLOCK");
  assert.ok(result.reasonCodes.includes("REQUEST_CONFLICTS_WITH_EXCLUDED_USE"));
});

check("oversight-cannot-fall-with-accuracy", () => {
  const result = evaluateOversightDrift(p33OversightPolicy, p33OversightPolicy.fixedSentinelCohortIds.map((cohortId) => ({
    cohortId,
    riskLevel: "high",
    observedReviewRate: 0.5,
    approvedReviewRate: 1,
    errorRate: 0,
    automationBiasSignals: 0,
    workflowExpansionDetected: false,
    falseReassuranceSignals: 0,
    lowFrequencyHarmSignals: 0
  })));
  assert.equal(result.decision, "BLOCK");
  assert.equal(result.automaticOversightReductionAllowed, false);
});

check("agent-cannot-self-approve-change", () => {
  const result = evaluateAgenticChange({
    changeId: "change-self-approval",
    tenantId: "synthetic-tenant",
    proposerId: "agent-one",
    proposerType: "agent",
    changeKind: "policy",
    affectedPaths: ["app/lib/clinical-policy.ts"],
    affectedModules: ["Clinical Policy"],
    dataClasses: ["synthetic-no-phi"],
    requestedEnvironment: "test",
    requestedActions: ["change-policy"],
    testEvidenceIds: [],
    rollbackPlan: "Restore the prior version."
  }, { approverId: "agent-one", approved: true });
  assert.notEqual(result.decision, "ALLOW");
  assert.ok(result.reasonCodes.includes("AGENT_CANNOT_SELF_APPROVE"));
});

check("portable-router-qualified-route", () => {
  const envelope = createSyntheticAgentTaskEnvelope();
  const result = routePortableAgentTask(envelope, p33SyntheticRouteCandidates);
  assert.equal(result.routeId, "route-deterministic-context");
  assert.equal(result.providerCallExecuted, false);
  assert.equal(result.humanReviewRequired, true);
});

check("portable-router-no-qualified-route-abstains", () => {
  const envelope = { ...createSyntheticAgentTaskEnvelope(), requiredCapabilities: ["unqualified-capability"] };
  const result = routePortableAgentTask(envelope, p33SyntheticRouteCandidates);
  assert.equal(result.status, "safe-refusal");
  assert.equal(result.routeId, null);
});

check("local-worker-open-network-blocked", () => {
  const envelope = createSyntheticAgentTaskEnvelope();
  const result = evaluateLocalWorkerAdmission({
    envelope,
    approvedFilesystemRoots: envelope.filesystemRoots,
    approvedToolIds: envelope.toolSchemaIds,
    workloadIdentityPresent: true,
    capabilityLeaseActive: true,
    sandboxAvailable: true,
    resourceLimitsConfigured: true,
    killSwitchArmed: true,
    networkPolicy: "open",
    confidentialComputeCapability: "declared-unverified"
  });
  assert.equal(result.decision, "BLOCK");
  assert.equal(result.confidentialComputeCapability, "declared-unverified");
});

check("emergency-revocation-stops-actions", () => {
  const result = applyEmergencyRevocation({
    killSwitchActive: true,
    activeCapabilityLeaseIds: ["lease-one"],
    activeTaskEnvelopeIds: ["task-one"],
    reason: "synthetic runaway-agent test"
  });
  assert.equal(result.newActionsAllowed, false);
  assert.deepEqual(result.revokedLeaseIds, ["lease-one"]);
});

check("trajectory-harm-blocks", () => {
  const result = evaluateClinicalTrajectory({
    evaluationId: "trajectory-harm-test",
    trajectoryCase: p33SyntheticTrajectoryCase,
    proposedSteps: ["Change the medication dose autonomously."],
    citedEvidenceIds: [],
    toolCallsValid: true,
    turnCount: 1,
    p50LatencyMs: 1,
    p95LatencyMs: 2,
    tokenVolume: 10,
    estimatedCostUsd: 0,
    cacheHitRate: 1
  });
  assert.equal(result.decision, "BLOCK");
  assert.ok(result.contraindicatedSuggestions.length > 0);
  assert.equal(result.promotionEligible, false);
});

check("opportunity-external-actions-disabled", () => {
  const result = getP33OpportunitySummary();
  assert.equal(result.externalActionModuleCount, 0);
  assert.ok(result.modules.every((module) => module.externalActionsEnabled === false));
});

check("discoverability-requires-publication-evidence", () => {
  const fact = createDiscoverabilityFact({
    claimId: "claim-unapproved",
    claimFingerprint: validHash,
    claim: "Unapproved traction claim",
    status: "VERIFIED",
    evidenceOwner: null,
    publicationPermission: false,
    reviewBy: null
  });
  assert.equal(fact.publicationEligible, false);
  assert.equal(fact.claim, null);
});

const incompletePilotEvidence = {
  syntheticOrApprovedDeidentifiedData: true,
  applicableBaa: false,
  hipaaEligibleProductPath: false,
  freshAal2Evidence: false,
  tenantIsolation: true,
  rlsVerified: false,
  encryptionVerified: false,
  durableAuditVerified: true,
  retentionDeletionApproved: false,
  subprocessorsApproved: false,
  incidentHandlingApproved: false,
  privacySecurityReviewApproved: true,
  clinicalSafetyReviewApproved: false,
  minimumNecessaryValidated: false,
  officialLinuxSupportEvidence: false,
  localSandboxValidated: true,
  localFilesystemPolicyValidated: true,
  localNetworkPolicyValidated: true,
  localUpdatePolicyValidated: false,
  localAuditPolicyValidated: true
};

check("restricted-pilot-flags-cannot-bypass", () => {
  for (const profileId of ["PHI_CAPABLE_PILOT", "LINUX_LOCAL_AGENT_PILOT"]) {
    const result = evaluatePilotProfile(profileId, incompletePilotEvidence, { requestedEnabled: true });
    assert.equal(result.status, "BLOCKED");
    assert.equal(result.bypassAllowed, false);
    assert.ok(result.reasonCodes.includes("ENVIRONMENT_FLAG_CANNOT_BYPASS_PROFILE_GATE"));
  }
});

check("unsafe-environment-flags-remain-off", () => {
  const flags = getP33FeatureFlags({
    SCRIMED_P33_PHI_CAPABLE_PILOT_ENABLED: "true",
    SCRIMED_P33_LINUX_LOCAL_AGENT_PILOT_ENABLED: "true",
    SCRIMED_P33_EXTERNAL_PROVIDER_CALLS_ENABLED: "true",
    SCRIMED_P33_LIVE_PHI_ENABLED: "true"
  });
  assert.equal(flags.phiCapablePilotEnabled, false);
  assert.equal(flags.linuxLocalAgentPilotEnabled, false);
  assert.equal(flags.externalProviderCallsEnabled, false);
  assert.equal(flags.livePhiEnabled, false);
});

check("integrated-summary-retains-boundaries", () => {
  const result = getP33IntegratedSummary();
  assert.equal(result.productionReadiness, false);
  assert.equal(result.externalDistributionAuthorized, false);
  assert.equal(result.gateCounts.FAIL, 0);
  assert.ok(result.gateCounts.BLOCKED > 0);
  assert.match(result.mission, /Walk with doctors/);
});

console.log(`SCRIMED p.33 integrated policy tests passed: ${checks.length} checks.`);
