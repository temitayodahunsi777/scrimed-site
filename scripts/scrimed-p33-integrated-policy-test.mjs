#!/usr/bin/env node

import assert from "node:assert/strict";

import {
  applyEmergencyRevocation,
  authorizeContextView,
  buildContextArtifact,
  compressClinicalSignals,
  createContinuousAssuranceDecisionRecord,
  createDecisionEvidenceRecord,
  createDiscoverabilityFact,
  createSyntheticAgentTaskEnvelope,
  createSyntheticContextFixture,
  createSyntheticDecisionEvidenceFixture,
  evaluateAgenticChange,
  evaluateAgentActionPolicy,
  evaluateClinicalExtractionReleaseGate,
  evaluateClinicalTrajectory,
  evaluateLocalWorkerAdmission,
  evaluateOversightDrift,
  evaluatePilotProfile,
  evaluatePilotValueContract,
  evaluateProviderFailover,
  evaluateProviderPortability,
  evaluateProviderResilienceDrill,
  evaluateQualityRatchet,
  evaluateRegulatoryLabelRequest,
  evaluateStrategicAssuranceGates,
  evaluateShadowPilotRehearsal,
  getP33ContinuousAssuranceSummary,
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
  verifyContinuousAssuranceDecisionChain,
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

const continuousCandidateHash = createClinicalEvidenceHash("continuous-candidate");
const continuousActorHash = createClinicalEvidenceHash("continuous-actor");
const continuousArgumentsHash = createClinicalEvidenceHash("continuous-arguments");
const continuousRequest = {
  actionId: "action-continuous-test",
  approvalNonce: "nonce-continuous-test",
  idempotencyKey: "idempotency-continuous-test",
  tenantId: "synthetic-tenant",
  actorIdHash: continuousActorHash,
  candidateHash: continuousCandidateHash,
  policyVersion: "policy-continuous-test-v1",
  toolId: "synthetic-review-write",
  actionClass: "write",
  argumentsHash: continuousArgumentsHash,
  target: "synthetic-review-queue",
  environment: "preview",
  mode: "shadow",
  dataClassification: "synthetic-no-phi",
  networkDestinations: [],
  filesystemPaths: ["/workspace/synthetic/output.json"]
};
const continuousAuthorization = {
  tenantId: "synthetic-tenant",
  candidateHash: continuousCandidateHash,
  authorizedToolIds: ["synthetic-review-write"],
  allowedNetworkDestinations: [],
  allowedFilesystemRoots: ["/workspace/synthetic"],
  expiresAt: "2026-08-16T00:00:00.000Z"
};

check("agent-policy-requires-exact-human-approval", () => {
  const pending = evaluateAgentActionPolicy({
    request: continuousRequest,
    authorization: continuousAuthorization,
    approval: null,
    discoveredToolIds: ["synthetic-review-write"],
    usedApprovalIds: [],
    now: "2026-08-15T00:00:00.000Z"
  });
  assert.equal(pending.decision, "REQUIRE_HUMAN");
  assert.equal(pending.discoveryGrantsAuthority, false);
  assert.equal(pending.externalExecutionAuthorized, false);

  const stale = evaluateAgentActionPolicy({
    request: continuousRequest,
    authorization: continuousAuthorization,
    approval: {
      approvalId: "approval-stale-candidate",
      nonce: continuousRequest.approvalNonce,
      idempotencyKey: continuousRequest.idempotencyKey,
      approverIdHash: createClinicalEvidenceHash("independent-reviewer"),
      actorIdHash: continuousActorHash,
      tenantId: "synthetic-tenant",
      candidateHash: createClinicalEvidenceHash("different-candidate"),
      actionId: continuousRequest.actionId,
      argumentsHash: continuousArgumentsHash,
      target: continuousRequest.target,
      policyVersion: continuousRequest.policyVersion,
      disposition: "approved",
      issuedAt: "2026-08-14T00:00:00.000Z",
      expiresAt: "2026-08-16T00:00:00.000Z"
    },
    discoveredToolIds: ["synthetic-review-write"],
    usedApprovalIds: [],
    now: "2026-08-15T00:00:00.000Z"
  });
  assert.equal(stale.decision, "BLOCK");
  assert.ok(stale.reasonCodes.includes("APPROVAL_CANDIDATE_MISMATCH"));

  const approvalId = "approval-replayed";
  const replayed = evaluateAgentActionPolicy({
    request: continuousRequest,
    authorization: continuousAuthorization,
    approval: {
      approvalId,
      nonce: continuousRequest.approvalNonce,
      idempotencyKey: continuousRequest.idempotencyKey,
      approverIdHash: createClinicalEvidenceHash("independent-reviewer"),
      actorIdHash: continuousActorHash,
      tenantId: continuousRequest.tenantId,
      candidateHash: continuousCandidateHash,
      actionId: continuousRequest.actionId,
      argumentsHash: continuousArgumentsHash,
      target: continuousRequest.target,
      policyVersion: continuousRequest.policyVersion,
      disposition: "approved",
      issuedAt: "2026-08-14T00:00:00.000Z",
      expiresAt: "2026-08-16T00:00:00.000Z"
    },
    discoveredToolIds: ["synthetic-review-write"],
    usedApprovalIds: [approvalId],
    now: "2026-08-15T00:00:00.000Z"
  });
  assert.equal(replayed.decision, "BLOCK");
  assert.ok(replayed.reasonCodes.includes("APPROVAL_REPLAY_DETECTED"));
});

check("agent-policy-blocks-cross-tenant-and-production", () => {
  const result = evaluateAgentActionPolicy({
    request: { ...continuousRequest, environment: "production", mode: "execute" },
    authorization: { ...continuousAuthorization, tenantId: "other-tenant" },
    approval: null,
    discoveredToolIds: ["synthetic-review-write"],
    usedApprovalIds: [],
    now: "2026-08-15T00:00:00.000Z"
  });
  assert.equal(result.decision, "BLOCK");
  assert.ok(result.reasonCodes.includes("AUTHORIZATION_TENANT_MISMATCH"));
  assert.ok(result.reasonCodes.includes("PRODUCTION_TARGET_PROHIBITED"));
  assert.ok(result.reasonCodes.includes("CONSEQUENTIAL_EXECUTION_DISABLED_IN_LOCAL_CANDIDATE"));
});

check("provider-failover-must-be-materially-independent", () => {
  const primary = {
    providerId: "provider-a",
    controllingCorporateFamily: "family-a",
    cloud: "cloud-shared",
    region: "region-a",
    acceleratorPool: "pool-a",
    identityProvider: "identity-a",
    network: "network-a",
    safetyTier: 3,
    privacyTier: 3,
    jurisdiction: "jurisdiction-a",
    eligible: true
  };
  const result = evaluateProviderFailover(primary, {
    ...primary,
    providerId: "provider-b",
    controllingCorporateFamily: "family-b"
  });
  assert.equal(result.decision, "BLOCK");
  assert.ok(result.sharedMaterialDependencies.includes("cloud"));
  assert.equal(result.silentDowngradeAllowed, false);
});

check("resilience-and-portability-fail-closed", () => {
  const independent = evaluateProviderFailover({
    providerId: "provider-primary",
    controllingCorporateFamily: "family-primary",
    cloud: "cloud-primary",
    region: "region-primary",
    acceleratorPool: "pool-primary",
    identityProvider: "identity-primary",
    network: "network-primary",
    safetyTier: 3,
    privacyTier: 3,
    jurisdiction: "jurisdiction-primary",
    eligible: true
  }, {
    providerId: "provider-fallback",
    controllingCorporateFamily: "family-fallback",
    cloud: "cloud-fallback",
    region: "region-fallback",
    acceleratorPool: "pool-fallback",
    identityProvider: "identity-fallback",
    network: "network-fallback",
    safetyTier: 3,
    privacyTier: 3,
    jurisdiction: "jurisdiction-fallback",
    eligible: true
  });
  const drill = evaluateProviderResilienceDrill({
    failoverDecision: independent,
    primaryFailureDetected: true,
    circuitOpened: false,
    retryCount: 1,
    maximumRetries: 2,
    fallbackCompleted: true,
    auditContinuityPreserved: true
  });
  assert.equal(drill.status, "BLOCKED");
  assert.ok(drill.reasonCodes.includes("CIRCUIT_BREAKER_DID_NOT_OPEN"));

  const portability = evaluateProviderPortability({
    adapterContractVersion: "adapter-contract-v1",
    configurationExportHash: validHash,
    failoverDecision: independent,
    exitRunbookId: "exit-runbook-v1",
    proprietaryCredentialMaterialIncluded: true
  });
  assert.equal(portability.status, "BLOCKED");
  assert.ok(portability.reasonCodes.includes("EXPORT_CONTAINS_CREDENTIAL_MATERIAL"));
});

check("quality-ratchet-hard-floor-cannot-be-averaged-away", () => {
  const result = evaluateQualityRatchet({
    baseline: { taskQuality: 0.8, severeErrorRate: 0, unauthorizedActionRate: 0, grounding: 0.9, costPerCompletedTaskUsd: 1, p95LatencyMs: 1_000 },
    challenger: { taskQuality: 0.99, severeErrorRate: 0, unauthorizedActionRate: 0, grounding: 1, costPerCompletedTaskUsd: 0.1, p95LatencyMs: 100 },
    hardFloors: { safety: false, authorization: true, privacy: true, clinical: true, provenance: true },
    worstMaterialCellPassed: true,
    taskLevelEvidenceComplete: true,
    softRegressionApproved: false,
    independentHumanReviewComplete: true
  });
  assert.equal(result.decision, "BLOCK");
  assert.equal(result.automaticPromotionAllowed, false);
  assert.ok(result.reasonCodes.includes("HARD_FLOOR_SAFETY_FAILED"));
});

check("strategic-gates-reject-stale-candidate-evidence", () => {
  const signal = (evidenceId, candidateHash = continuousCandidateHash) => ({
    evidenceId,
    present: true,
    artifactHash: createClinicalEvidenceHash(`artifact-${evidenceId}`),
    candidateHash,
    issuedAt: "2026-08-15T00:00:00.000Z",
    expiresAt: "2026-08-16T00:00:00.000Z"
  });
  const result = evaluateStrategicAssuranceGates({
    candidateHash: continuousCandidateHash,
    evaluatedAt: "2026-08-15T01:00:00.000Z",
    evidence: {
      G21: { operatorApprovalComplete: true, signals: [signal("qualified-primary-route"), signal("materially-independent-fallback"), signal("circuit-breaker-recovery-test")] },
      G22: { operatorApprovalComplete: true, signals: [signal("complete-value-contract"), signal("baseline-and-comparator"), signal("named-owner-approval")] },
      G23: { operatorApprovalComplete: true, signals: [signal("shadow-rehearsal"), signal("adoption-training-plan"), signal("stop-and-rollback-rules"), signal("named-pilot-owner-approval")] },
      G24: { operatorApprovalComplete: true, signals: [signal("exact-source-manifest", createClinicalEvidenceHash("stale")), signal("fresh-validation-packet"), signal("candidate-bound-reviewer-attestation")] },
      G25: { operatorApprovalComplete: true, signals: [signal("provider-neutral-adapter-contract"), signal("configuration-export-path"), signal("independent-route-test"), signal("exit-runbook")] }
    }
  });
  assert.deepEqual(result.map((gate) => gate.gateId), ["G21", "G22", "G23", "G24", "G25"]);
  assert.equal(result.find((gate) => gate.gateId === "G24")?.status, "BLOCKED");
  assert.ok(result.find((gate) => gate.gateId === "G24")?.reasonCodes.some((reason) => reason.startsWith("STALE_")));
});

check("continuous-assurance-ledger-is-tamper-evident-and-no-phi", () => {
  const input = {
    eventId: "assurance-policy-test-001",
    occurredAt: "2026-08-15T00:00:00.000Z",
    tenantId: "synthetic-tenant",
    workspaceId: "workspace-policy-test",
    operatingMode: "synthetic-development",
    actorType: "agent",
    actorIdentityHash: continuousActorHash,
    authority: ["read-synthetic"],
    authorizedScope: ["synthetic-fixture"],
    policyVersion: "policy-continuous-test-v1",
    inputClassifications: ["synthetic-no-phi"],
    model: { providerId: "synthetic", modelId: "deterministic", harnessId: "policy", version: "1", reasoningEffort: "low" },
    promptConfigHash: createClinicalEvidenceHash("prompt"),
    toolSchemaHashes: [createClinicalEvidenceHash("tool")],
    retrievedSources: [{ sourceId: "source-test", sourceHash: createClinicalEvidenceHash("source"), page: 1, span: "section:test" }],
    proposedToolCalls: [],
    executedToolCalls: [],
    executionScope: { filesystemRoots: [], networkDestinations: [], sandboxId: "sandbox-test" },
    approval: { approvalId: null, disposition: "not-required", reviewerIdHash: null },
    outputHash: createClinicalEvidenceHash("output"),
    finalDisposition: "verified",
    safetyChecks: ["no-phi"],
    reviewerOverrides: [],
    rollbackOrCompensation: ["discard-output"],
    metrics: { latencyMs: 1, inputTokens: 0, outputTokens: 0, costUsd: 0, cacheHit: true },
    retentionPolicy: { policyId: "retention-test", expiresAt: "2026-09-15T00:00:00.000Z", legalHold: false },
    previousRecordHash: null
  };
  const record = createContinuousAssuranceDecisionRecord(input);
  assert.equal(verifyContinuousAssuranceDecisionChain([record]).valid, true);
  assert.equal(verifyContinuousAssuranceDecisionChain([{ ...record, policyVersion: "tampered" }]).valid, false);
  assert.throws(() => createContinuousAssuranceDecisionRecord({ ...input, inputClassifications: ["phi-prohibited"] }), /PHI-prohibited/);
});

check("value-contract-and-readiness-retain-operator-gates", () => {
  const valueDecision = evaluatePilotValueContract({
    contractId: "value-test",
    tenantId: "synthetic-tenant",
    workflow: "Synthetic workflow",
    baseline: "Synthetic baseline",
    comparator: "Synthetic comparator",
    intendedUser: "Pilot operator",
    businessOwnerRole: "business-owner",
    clinicalOwnerRole: null,
    measurementWindow: "One rehearsal",
    successThresholds: ["verified completion"],
    safetyStopThresholds: ["unauthorized action"],
    rollbackCriteria: ["hard-floor failure"],
    costAndCapacityMetrics: ["cost per completed task"],
    adoptionAndTrainingPlan: ["operator walkthrough"],
    affectedSystems: ["synthetic preview"],
    exitAndExportPlan: ["export evidence"],
    approvedByActorHashes: []
  });
  assert.equal(valueDecision.status, "OPERATOR_REQUIRED");

  const rehearsal = evaluateShadowPilotRehearsal({
    syntheticOnly: true,
    externalActionsExecuted: false,
    policyDecision: evaluateAgentActionPolicy({
      request: continuousRequest,
      authorization: continuousAuthorization,
      approval: null,
      discoveredToolIds: ["synthetic-review-write"],
      usedApprovalIds: [],
      now: "2026-08-15T00:00:00.000Z"
    }),
    valueContractStatus: valueDecision.status,
    stopRulesConfigured: true,
    rollbackTested: true,
    trainingSteps: ["operator walkthrough"],
    namedPilotOwnerApproved: false
  });
  assert.equal(rehearsal.technicalStatus, "PASS");
  assert.equal(rehearsal.status, "OPERATOR_REQUIRED");
  assert.equal(rehearsal.externalActionsExecuted, false);

  const summary = getP33ContinuousAssuranceSummary();
  const local = summary.readinessProfiles.find((profile) => profile.profileId === "LOCAL_TECHNICAL_CANDIDATE");
  const phi = summary.readinessProfiles.find((profile) => profile.profileId === "PHI_CAPABLE_PILOT");
  assert.equal(local?.status, "PASS");
  assert.equal(phi?.status, "BLOCKED");
  assert.equal(phi?.livePhiAllowed, false);
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
