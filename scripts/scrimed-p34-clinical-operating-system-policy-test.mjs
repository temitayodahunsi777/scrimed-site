import assert from "node:assert/strict";

import { createClinicalEvidenceHash } from "../app/lib/clinicalEvidenceControls.ts";
import {
  SyntheticTenantTokenVault,
  createClinicalOperatingGovernanceRecord,
  createP34ClinicalOperatingSystemSummary,
  createPhiFieldRegistry,
  evaluateAgentSandboxAdmission,
  evaluateApprovedPublicClaim,
  evaluateAutonomyContract,
  evaluateBreakGlassRequest,
  evaluateExternalClinicalValidation,
  evaluateMedicalCodingContract,
  evaluateOperationalRecovery,
  evaluateOversightDriftControl,
  evaluatePhiEgressBoundary,
  p34ClinicalOperatingSystemVersion,
  p34SyntheticPhiFieldRegistry,
  p34SyntheticSandboxPolicy,
  queryClinicalOperatingGovernance,
  renderPatientTakeHome,
  retrieveAuthorizedClinicalContext,
  validatePhiFieldRegistry,
  verifyClinicalOperatingGovernanceChain
} from "../app/lib/scrimed-p34/index.ts";
import { evaluateProviderFailover } from "../app/lib/scrimed-p33/continuousAssurance.ts";

let passed = 0;
function check(name, run) {
  run();
  passed += 1;
}

const hash = (value) => createClinicalEvidenceHash(value);
const evaluatedAt = "2026-08-20T12:00:00.000Z";
const actorIdHash = hash("p34-policy-actor");
const approverIdHash = hash("p34-policy-approver");
const identityHash = hash("p34-policy-identity");
const payloadHash = hash("p34-policy-payload");

function approval(overrides = {}) {
  return {
    approvalId: "p34-policy-approval",
    tenantId: "synthetic-tenant",
    actorIdHash,
    approverIdHash,
    actionId: "p34-policy-action",
    actionClass: "reversible-internal-write",
    resourceId: "synthetic-draft",
    payloadHash,
    idempotencyKey: "p34-policy-idempotency",
    policyVersion: p34ClinicalOperatingSystemVersion,
    authorityScope: ["reversible-internal-write"],
    issuedAt: "2026-08-20T11:55:00.000Z",
    expiresAt: "2026-08-20T12:10:00.000Z",
    evidenceHash: hash("p34-policy-approval-evidence"),
    ...overrides
  };
}

function autonomy(overrides = {}) {
  return evaluateAutonomyContract({
    tenantId: "synthetic-tenant",
    actorIdHash,
    authenticatedIdentityHash: identityHash,
    accountableHumanIdHash: approverIdHash,
    task: "prepare synthetic reversible draft",
    actionId: "p34-policy-action",
    actionClass: "reversible-internal-write",
    resourceId: "synthetic-draft",
    payloadHash,
    idempotencyKey: "p34-policy-idempotency",
    requestedTier: "A2",
    maximumAuthorizedTier: "A2",
    reversible: true,
    syntheticOnly: true,
    dataClassification: "synthetic-no-phi",
    policyVersion: p34ClinicalOperatingSystemVersion,
    stoppingCondition: "Stop after a verified synthetic receipt or any denial.",
    approval: approval(),
    usedApprovalIds: [],
    evaluatedAt,
    ...overrides
  });
}

check("exact-autonomy-approval-remains-review-only-without-trusted-consumption", () => {
  const result = autonomy();
  assert.equal(result.decision, "REQUIRE_HUMAN");
  assert.equal(result.grantedTier, "A1");
  assert.equal(result.authorizationState, "verification-required");
  assert.equal(result.approvalConsumed, false);
  assert.equal(result.executionAuthorized, false);
  assert.equal(result.externalWriteAuthorized, false);
  assert.equal(result.clinicalAuthorityGranted, false);
  assert.ok(result.reasonCodes.includes("TRUSTED_APPROVAL_STORE_AND_ATOMIC_CONSUMPTION_REQUIRED"));
});

check("missing-authority-fails-closed", () => {
  const result = autonomy({ approval: null });
  assert.equal(result.decision, "REQUIRE_HUMAN");
  assert.equal(result.executionAuthorized, false);
  assert.ok(result.reasonCodes.includes("EXACT_SCOPED_APPROVAL_REQUIRED"));
});

check("stale-approval-is-rejected", () => {
  const result = autonomy({ approval: approval({ expiresAt: "2026-08-20T11:59:00.000Z" }) });
  assert.equal(result.decision, "BLOCK");
  assert.ok(result.reasonCodes.includes("APPROVAL_STALE_OR_NOT_EFFECTIVE"));
});

check("payload-mismatched-approval-is-rejected", () => {
  const result = autonomy({ approval: approval({ payloadHash: hash("different-payload") }) });
  assert.equal(result.decision, "BLOCK");
  assert.ok(result.reasonCodes.includes("APPROVAL_PAYLOAD_MISMATCH"));
});

check("approval-replay-is-rejected", () => {
  const result = autonomy({ usedApprovalIds: [approval().approvalId] });
  assert.equal(result.decision, "BLOCK");
  assert.ok(result.reasonCodes.includes("APPROVAL_REPLAY_DETECTED"));
});

check("consequential-write-cannot-elevate-to-a3", () => {
  const result = autonomy({
    actionClass: "system-of-record-write",
    requestedTier: "A3",
    maximumAuthorizedTier: "A3",
    approval: approval({ actionClass: "system-of-record-write", authorityScope: ["system-of-record-write"] })
  });
  assert.equal(result.decision, "BLOCK");
  assert.ok(result.reasonCodes.includes("CONSEQUENTIAL_EXTERNAL_ACTION_DISABLED"));
  assert.equal(result.executionAuthorized, false);
});

check("unregistered-sensitive-field-prevents-startup", () => {
  const result = validatePhiFieldRegistry(p34SyntheticPhiFieldRegistry, [
    { schemaId: "clinical-context", fieldPath: "subjectReference", sensitive: true },
    { schemaId: "clinical-context", fieldPath: "unregisteredSensitiveValue", sensitive: true }
  ]);
  assert.equal(result.startupAllowed, false);
  assert.ok(result.missingClassifications.includes("clinical-context:unregisteredSensitiveValue"));
});

check("duplicate-phi-registration-prevents-startup", () => {
  const field = p34SyntheticPhiFieldRegistry.fields[0];
  const registry = createPhiFieldRegistry([field, { ...field, fieldId: `${field.fieldId}.duplicate` }]);
  const result = validatePhiFieldRegistry(registry, [
    { schemaId: field.schemaId, fieldPath: field.fieldPath, sensitive: true }
  ]);
  assert.equal(result.decision, "BLOCK");
  assert.equal(result.duplicateRegistrations.length, 1);
});

check("raw-phi-and-secret-cannot-cross-egress", () => {
  const result = evaluatePhiEgressBoundary(p34SyntheticPhiFieldRegistry, {
    tenantId: "synthetic-tenant",
    purpose: "synthetic-context-review",
    productPath: "p34-test",
    dataClassification: "synthetic-no-phi",
    fieldIds: ["clinical-context.subject-reference"],
    payload: { patientName: "Synthetic Person", apiKey: "sk_fake_boundary_test_123456" },
    tokenReceipts: [],
    providerRoute: null,
    minimumNecessary: true,
    consentVerified: true,
    postResponseValidated: true,
    evaluatedAt
  });
  assert.equal(result.decision, "BLOCK");
  assert.ok(result.reasonCodes.includes("RAW_PHI_OR_SECRET_DETECTED_PRE_EGRESS"));
  assert.equal(result.providerCallAuthorized, false);
});

check("registered-direct-identifier-requires-a-valid-token-receipt", () => {
  const result = evaluatePhiEgressBoundary(p34SyntheticPhiFieldRegistry, {
    tenantId: "synthetic-tenant",
    purpose: "synthetic-context-review",
    productPath: "p34-test",
    dataClassification: "synthetic-no-phi",
    fieldIds: ["clinical-context.subject-reference"],
    payload: { subjectReference: "plain-synthetic-identifier" },
    tokenReceipts: [],
    providerRoute: null,
    minimumNecessary: true,
    consentVerified: true,
    postResponseValidated: true,
    evaluatedAt
  });
  assert.equal(result.decision, "BLOCK");
  assert.equal(result.tokenRoundTripValid, false);
  assert.ok(result.reasonCodes.includes("TOKEN_RECEIPT_REQUIRED_FOR_REGISTERED_FIELD"));
  assert.ok(result.reasonCodes.includes("RAW_PHI_OR_SECRET_DETECTED_PRE_EGRESS"));
});

check("phi-route-without-baa-and-product-path-is-rejected", () => {
  const result = evaluatePhiEgressBoundary(p34SyntheticPhiFieldRegistry, {
    tenantId: "synthetic-tenant",
    purpose: "synthetic-context-review",
    productPath: "uncovered-product",
    dataClassification: "phi-restricted",
    fieldIds: ["clinical-context.subject-reference"],
    payload: { subjectReference: "scrimed_tok_0123456789abcdef0123456789abcdef01234567" },
    tokenReceipts: [],
    providerRoute: null,
    minimumNecessary: true,
    consentVerified: true,
    postResponseValidated: true,
    evaluatedAt
  });
  assert.equal(result.decision, "BLOCK");
  assert.ok(result.reasonCodes.includes("PHI_PROVIDER_NOT_ELIGIBLE"));
  assert.ok(result.reasonCodes.includes("SIGNED_BAA_PRODUCT_PATH_EVIDENCE_REQUIRED"));
  assert.ok(result.reasonCodes.includes("LIVE_PHI_ROUTE_DISABLED_IN_LOCAL_CANDIDATE"));
});

check("tenant-token-vault-round-trips-only-after-validation", () => {
  const validatorIdHash = hash("trusted-response-validator");
  const vault = new SyntheticTenantTokenVault(p34SyntheticPhiFieldRegistry, "synthetic-test-salt", {
    clock: () => evaluatedAt,
    trustedValidatorIdHashes: [validatorIdHash]
  });
  const receipt = vault.tokenize({
    tenantId: "synthetic-tenant",
    fieldId: "clinical-context.subject-reference",
    value: "synthetic-subject-reference",
    purpose: "synthetic-context-review",
    issuedAt: evaluatedAt,
    expiresAt: "2026-08-20T13:00:00.000Z"
  });
  assert.equal(receipt.containsPlaintext, false);
  const grant = vault.issueReidentificationGrant({
    grantId: "synthetic-one-use-resolution",
    tenantId: "synthetic-tenant",
    token: receipt.token,
    purpose: "synthetic-context-review",
    validatorIdHash,
    validationEvidenceHash: hash("validated-response"),
    expiresAt: "2026-08-20T12:05:00.000Z"
  });
  assert.equal(vault.resolve({
    tenantId: "synthetic-tenant",
    token: receipt.token,
    purpose: "synthetic-context-review",
    grant
  }), "synthetic-subject-reference");
  assert.throws(() => vault.resolve({
    tenantId: "synthetic-tenant",
    token: receipt.token,
    purpose: "synthetic-context-review",
    grant
  }), /one-use/);
});

check("token-vault-rejects-untrusted-validator-and-caller-time-bypass", () => {
  const vault = new SyntheticTenantTokenVault(p34SyntheticPhiFieldRegistry, "synthetic-test-salt", {
    clock: () => evaluatedAt,
    trustedValidatorIdHashes: [hash("trusted-validator")]
  });
  const receipt = vault.tokenize({
    tenantId: "synthetic-tenant",
    fieldId: "clinical-context.subject-reference",
    value: "synthetic-subject-reference",
    purpose: "synthetic-context-review",
    issuedAt: evaluatedAt,
    expiresAt: "2026-08-20T13:00:00.000Z"
  });
  assert.throws(() => vault.issueReidentificationGrant({
    grantId: "untrusted-resolution",
    tenantId: "synthetic-tenant",
    token: receipt.token,
    purpose: "synthetic-context-review",
    validatorIdHash: hash("untrusted-validator"),
    validationEvidenceHash: hash("claimed-validation"),
    expiresAt: "2026-08-20T12:05:00.000Z"
  }), /trusted validator/);
});

check("valid-token-receipt-round-trip-passes-the-local-egress-policy", () => {
  const vault = new SyntheticTenantTokenVault(p34SyntheticPhiFieldRegistry, "synthetic-egress-salt", {
    clock: () => evaluatedAt
  });
  const receipt = vault.tokenize({
    tenantId: "synthetic-tenant",
    fieldId: "clinical-context.subject-reference",
    value: "synthetic-subject-reference",
    purpose: "synthetic-context-review",
    issuedAt: evaluatedAt,
    expiresAt: "2026-08-20T13:00:00.000Z"
  });
  const result = evaluatePhiEgressBoundary(p34SyntheticPhiFieldRegistry, {
    tenantId: "synthetic-tenant",
    purpose: "synthetic-context-review",
    productPath: "p34-test",
    dataClassification: "synthetic-no-phi",
    fieldIds: [receipt.fieldId],
    payload: { subjectReference: receipt.token },
    tokenReceipts: [receipt],
    providerRoute: null,
    minimumNecessary: true,
    consentVerified: true,
    postResponseValidated: true,
    evaluatedAt
  });
  assert.equal(result.decision, "ALLOW");
  assert.equal(result.tokenRoundTripValid, true);
  assert.equal(result.providerCallAuthorized, false);
});

check("break-glass-without-independent-approver-and-audit-is-blocked", () => {
  const result = evaluateBreakGlassRequest({
    requestId: "p34-break-glass-test",
    tenantId: "synthetic-tenant",
    actorIdHash,
    approverIdHash: null,
    reasonCode: "test-only",
    incidentReferenceHash: hash("incident"),
    requestedScope: ["read-synthetic-metadata"],
    issuedAt: evaluatedAt,
    expiresAt: "2026-08-20T12:30:00.000Z",
    auditEventHash: null
  });
  assert.equal(result.decision, "BLOCK");
  assert.equal(result.clinicalAuthorityGranted, false);
});

function sandbox(overrides = {}) {
  return evaluateAgentSandboxAdmission(p34SyntheticSandboxPolicy, {
    tenantId: "synthetic-tenant",
    runId: "p34-policy-sandbox-run",
    workspacePath: "/sandbox/synthetic-tenant",
    filesystemPaths: ["/sandbox/synthetic-tenant/work/input.json"],
    networkDestinations: [],
    requestedMounts: [],
    requestedCpuMillis: 200,
    requestedMemoryBytes: 1024,
    requestedDiskBytes: 1024,
    requestedProcesses: 1,
    requestedToolCalls: 1,
    requestedWallClockMs: 100,
    secretHandles: [],
    hostCredentialsRequested: false,
    privilegeEscalationRequested: false,
    cleanupVerified: true,
    ...overrides
  }, evaluatedAt);
}

check("sandbox-policy-never-claims-runtime-containment-without-open-time-proof", () => {
  const result = sandbox();
  assert.equal(result.decision, "REQUIRE_HUMAN");
  assert.equal(result.policyCompliant, true);
  assert.equal(result.isolatedWorkspaceAuthorized, false);
  assert.equal(result.runtimeContainmentVerified, false);
  assert.ok(result.reasonCodes.includes("RUNTIME_CANONICAL_CONTAINMENT_AND_OPEN_TIME_VERIFICATION_REQUIRED"));
});

check("sandbox-default-deny-blocks-direct-egress", () => {
  const result = sandbox({ networkDestinations: ["https://example.com"] });
  assert.equal(result.decision, "BLOCK");
  assert.ok(result.reasonCodes.includes("SANDBOX_EGRESS_NOT_ALLOWLISTED"));
});

check("sandbox-blocks-dns-proxy-and-loopback-escape", () => {
  for (const destination of ["dns:example.com", "http://127.0.0.1", "https://proxy.invalid"]) {
    const result = sandbox({ networkDestinations: [destination] });
    assert.equal(result.decision, "BLOCK");
    assert.ok(result.reasonCodes.includes("SANDBOX_EGRESS_ESCAPE_ATTEMPT"));
  }
});

check("sandbox-blocks-host-credentials-and-privilege-escalation", () => {
  const result = sandbox({ hostCredentialsRequested: true, privilegeEscalationRequested: true });
  assert.equal(result.decision, "BLOCK");
  assert.ok(result.reasonCodes.includes("HOST_CREDENTIAL_INHERITANCE_DENIED"));
  assert.ok(result.reasonCodes.includes("PRIVILEGE_ESCALATION_DENIED"));
});

function retrievalCandidate(overrides = {}) {
  return {
    candidateId: "p34-retrieval-test-a",
    tenantId: "synthetic-tenant",
    canonicalEntityId: "concept:alpha",
    aliases: ["shared clinical alias", "alpha"],
    hierarchyPath: ["clinical", "alpha"],
    sourceAuthority: "authoritative",
    sourceSpanIds: ["span-alpha"],
    effectiveAt: "2026-08-01T00:00:00.000Z",
    expiresAt: "2027-08-01T00:00:00.000Z",
    lexicalScore: 1,
    semanticScore: 1,
    rerankScore: 1,
    contradictionGroupId: null,
    dataClassification: "synthetic-no-phi",
    authorizedPurposes: ["synthetic-context-review"],
    contentHash: hash("alpha"),
    ...overrides
  };
}

function retrieval(candidates, overrides = {}, authorizationOverrides = {}) {
  return retrieveAuthorizedClinicalContext({
    tenantId: "synthetic-tenant",
    purpose: "synthetic-context-review",
    query: "shared clinical alias",
    canonicalEntityId: "concept:alpha",
    authorizedDataClassifications: ["synthetic-no-phi"],
    maximumResults: 4,
    minimumEvidenceCount: 1,
    minimumRerankScore: 0.8,
    evaluatedAt,
    ...overrides
  }, candidates, {
    authenticatedTenantId: "synthetic-tenant",
    authenticatedActorIdHash: identityHash,
    authorizedPurposes: ["synthetic-context-review"],
    authorizedDataClassifications: ["synthetic-no-phi"],
    authorizationEvidenceHash: hash("retrieval-authorization"),
    evaluatedAt,
    ...authorizationOverrides
  });
}

check("wrong-tenant-retrieval-is-denied-before-ranking", () => {
  const result = retrieval([
    retrievalCandidate({ candidateId: "wrong-tenant", tenantId: "other-tenant" })
  ]);
  assert.equal(result.decision, "BLOCK");
  assert.deepEqual(result.resultIds, []);
  assert.equal(result.tenantFilterAppliedBeforeRanking, true);
});

check("requester-selected-tenant-cannot-exceed-authenticated-scope", () => {
  const result = retrieval([
    retrievalCandidate({ candidateId: "other-tenant-result", tenantId: "other-tenant" })
  ], { tenantId: "other-tenant" });
  assert.equal(result.decision, "BLOCK");
  assert.deepEqual(result.resultIds, []);
  assert.ok(result.reasonCodes.includes("RETRIEVAL_AUTHENTICATED_TENANT_MISMATCH"));
});

check("stale-retrieval-evidence-causes-abstention", () => {
  const result = retrieval([
    retrievalCandidate({ expiresAt: "2026-08-19T00:00:00.000Z" })
  ]);
  assert.equal(result.decision, "BLOCK");
  assert.equal(result.abstained, true);
  assert.deepEqual(result.staleCandidateIds, ["p34-retrieval-test-a"]);
});

check("similarly-named-entities-cause-ambiguity-abstention", () => {
  const result = retrieval([
    retrievalCandidate(),
    retrievalCandidate({ candidateId: "p34-retrieval-test-b", canonicalEntityId: "concept:beta", contentHash: hash("beta") })
  ], { canonicalEntityId: null });
  assert.equal(result.decision, "BLOCK");
  assert.equal(result.abstained, true);
  assert.deepEqual(result.ambiguousEntityIds, ["concept:alpha", "concept:beta"]);
});

check("conflicting-sources-require-human-review", () => {
  const result = retrieval([
    retrievalCandidate({ contradictionGroupId: "conflict-alpha" })
  ]);
  assert.equal(result.decision, "REQUIRE_HUMAN");
  assert.deepEqual(result.conflictingGroupIds, ["conflict-alpha"]);
});

function validation(overrides = {}) {
  return evaluateExternalClinicalValidation({
    validationId: "p34-validation-test",
    capabilityId: "p34-capability-test",
    internalOnly: false,
    siteIds: ["site-a", "site-b"],
    healthSystemIds: ["system-a", "system-b"],
    acquisitionSystemIds: ["device-a", "device-b"],
    cohortIds: ["cohort-a"],
    demographicSubgroups: ["subgroup-a", "subgroup-b"],
    workflowSettings: ["workflow-a", "workflow-b"],
    timePeriods: ["period-a", "period-b"],
    distributionShiftEvaluated: true,
    metrics: {
      discrimination: 0.9,
      sensitivity: 0.9,
      specificity: 0.9,
      calibrationError: 0.02,
      abstentionRate: 0.1,
      missingCriticalStepRate: 0,
      unsupportedExtraRate: 0,
      clinicianOverrideRate: 0.1,
      downstreamHarmProxyRate: 0
    },
    subgroupWorstCellPassed: true,
    evidenceHash: hash("validation-evidence"),
    recordedAt: "2026-08-20T11:00:00.000Z",
    expiresAt: "2027-02-20T11:00:00.000Z",
    namedReviewerApprovalHashes: [hash("external-validation-review")],
    ...overrides
  }, evaluatedAt);
}

check("internal-only-validation-cannot-pass-external-gate", () => {
  const result = validation({ internalOnly: true });
  assert.equal(result.decision, "BLOCK");
  assert.ok(result.reasonCodes.includes("INTERNAL_VALIDATION_INSUFFICIENT"));
  assert.equal(result.clinicalProductionEligible, false);
});

check("worst-cell-failure-blocks-external-validation", () => {
  const result = validation({ subgroupWorstCellPassed: false });
  assert.equal(result.decision, "BLOCK");
  assert.ok(result.reasonCodes.includes("WORST_CELL_VALIDATION_FAILED"));
});

check("external-validation-never-self-authorizes-clinical-production", () => {
  const result = validation();
  assert.equal(result.decision, "REQUIRE_HUMAN");
  assert.equal(result.externallyValidated, true);
  assert.equal(result.clinicalProductionEligible, false);
});

check("oversight-cannot-decline-without-explicit-approval", () => {
  const result = evaluateOversightDriftControl({
    totalActions: 100,
    reviewedActions: 100,
    overrides: 1,
    corrections: 1,
    errors: 0,
    silentAcceptances: 0,
    medianReviewLatencyMs: 500,
    riskCohortCoverage: 1,
    requestedReviewRate: 0.5,
    approvedReviewRate: 1,
    oversightReductionApprovalHash: null
  });
  assert.equal(result.decision, "BLOCK");
  assert.equal(result.oversightReductionAuthorized, false);
});

function takeHome(overrides = {}) {
  const base = {
    documentId: "p34-take-home-test",
    tenantId: "synthetic-tenant",
    sourceFacts: [{
      factId: "fact-a",
      approvedText: "A synthetic follow-up item is available for review.",
      sourceSpanIds: ["span-a"],
      approvedForEducation: true
    }],
    preferences: {
      preferenceId: "preferences-a",
      channel: "portal",
      timing: "clinician-directed",
      language: "en",
      accessibility: ["plain-language"],
      proxyIdHash: null,
      proxyAuthorizationHash: null,
      clinicianReviewRequired: true,
      sensitiveResultRestriction: "approved-education-only",
      effectiveAt: "2026-08-01T00:00:00.000Z",
      expiresAt: "2027-08-01T00:00:00.000Z"
    },
    clinicianReview: { reviewerIdHash: null, decision: "pending", reviewedAt: null },
    generatedAt: evaluatedAt
  };
  return renderPatientTakeHome({ ...base, ...overrides });
}

check("patient-delivery-preferences-and-clinician-review-are-enforced", () => {
  const result = takeHome();
  assert.equal(result.decision, "REQUIRE_HUMAN");
  assert.equal(result.deliveryAuthorized, false);
  assert.ok(result.reasonCodes.includes("CLINICIAN_REVIEW_REQUIRED_BEFORE_DELIVERY"));
});

check("patient-take-home-rejects-unsupported-facts", () => {
  const result = takeHome({
    sourceFacts: [{ factId: "unsupported", approvedText: "Unsupported", sourceSpanIds: [], approvedForEducation: false }]
  });
  assert.equal(result.decision, "BLOCK");
  assert.equal(result.containsDiagnosisOrAdvice, false);
});

check("autonomous-coding-and-billing-remain-blocked", () => {
  const result = evaluateMedicalCodingContract({
    contractId: "p34-coding-test",
    capabilityId: "p34-coding-capability",
    mode: "autonomous",
    specialtyCoverage: ["synthetic-specialty"],
    humanReviewRequired: false,
    auditRequired: true,
    ruleSetOwner: "coding-owner",
    ruleVersion: "v1",
    evidenceHashes: [hash("coding-evidence")],
    effectiveAt: "2026-08-01T00:00:00.000Z",
    expiresAt: "2027-02-01T00:00:00.000Z",
    rollbackPath: ["discard draft"],
    billingReleaseAuthorityHash: null
  }, evaluatedAt);
  assert.equal(result.decision, "BLOCK");
  assert.equal(result.billingSubmissionAuthorized, false);
});

function invocation(overrides = {}) {
  return {
    invocationId: "p34-invocation-test",
    tenantId: "synthetic-tenant",
    traceId: "trace-p34-invocation-test",
    idempotencyKey: "p34-invocation-idempotency",
    attempt: 1,
    maximumAttempts: 2,
    failureClass: "transient",
    state: "ready",
    checkpointHash: hash("checkpoint"),
    checkpointVerified: true,
    suspended: false,
    costUsd: 0,
    latencyMs: 10,
    containsRawPhi: false,
    containsSecrets: false,
    ...overrides
  };
}

check("bounded-retry-preserves-idempotency", () => {
  const result = evaluateOperationalRecovery(invocation());
  assert.equal(result.retryAllowed, true);
  assert.equal(result.nextState, "retrying");
  assert.equal(result.idempotencyPreserved, true);
});

check("retry-exhaustion-enters-dead-letter", () => {
  const result = evaluateOperationalRecovery(invocation({ attempt: 2, maximumAttempts: 2 }));
  assert.equal(result.retryAllowed, false);
  assert.equal(result.nextState, "dead-letter");
});

check("duplicate-idempotency-across-invocations-is-blocked", () => {
  const current = invocation();
  const existing = invocation({ invocationId: "p34-other-invocation" });
  const result = evaluateOperationalRecovery(current, [existing]);
  assert.equal(result.decision, "BLOCK");
  assert.equal(result.idempotencyPreserved, false);
});

check("tampered-governance-record-is-detected", () => {
  const summary = createP34ClinicalOperatingSystemSummary();
  const tampered = structuredClone(summary.governance.records);
  tampered[0].proposedAction = "tampered-action";
  assert.equal(verifyClinicalOperatingGovernanceChain(tampered).valid, false);
});

check("governance-retrieval-is-tenant-and-filter-scoped", () => {
  const summary = createP34ClinicalOperatingSystemSummary();
  const record = summary.governance.records[0];
  assert.equal(queryClinicalOperatingGovernance(summary.governance.records, {
      tenantId: "synthetic-tenant",
      traceId: record.traceId,
      actionText: "synthetic-review"
  }).length, 1);
  assert.equal(queryClinicalOperatingGovernance(summary.governance.records, {
    tenantId: "other-tenant"
  }).length, 0);
});

check("governance-record-rejects-sensitive-free-text", () => {
  const summary = createP34ClinicalOperatingSystemSummary();
  const first = summary.governance.records[0];
  const { recordHash: _recordHash, containsRawPhi: _containsRawPhi, containsSecrets: _containsSecrets, hiddenChainOfThoughtStored: _hidden, ...input } = first;
  assert.match(_recordHash, /^[0-9a-f]{64}$/);
  assert.equal(_containsRawPhi, false);
  assert.equal(_containsSecrets, false);
  assert.equal(_hidden, false);
  assert.throws(() => createClinicalOperatingGovernanceRecord({
    ...input,
    recordId: "p34-sensitive-governance-record",
    proposedAction: "sk_sensitive_validation_marker_123456",
    previousRecordHash: first.recordHash
  }, [first]), /redacted operational evidence/);
});

check("governance-record-append-rejects-wrong-head", () => {
  const summary = createP34ClinicalOperatingSystemSummary();
  const first = summary.governance.records[0];
  const { recordHash: _recordHash, containsRawPhi: _containsRawPhi, containsSecrets: _containsSecrets, hiddenChainOfThoughtStored: _hidden, ...input } = first;
  assert.match(_recordHash, /^[0-9a-f]{64}$/);
  assert.equal(_containsRawPhi, false);
  assert.equal(_containsSecrets, false);
  assert.equal(_hidden, false);
  assert.throws(() => createClinicalOperatingGovernanceRecord({
    ...input,
    recordId: "p34-clinical-os-record-002",
    previousRecordHash: hash("wrong-head")
  }, [first]), /ledger head/);
});

check("unsupported-or-expired-public-claim-is-blocked", () => {
  const result = evaluateApprovedPublicClaim({
    claimId: "p34-unsupported-claim",
    category: "regulatory",
    ownerRole: "claims-owner",
    approvedWording: "SCRIMED is HIPAA compliant.",
    primaryEvidence: [],
    scope: "public",
    limitations: [],
    approvalHashes: [],
    approvedAt: "2026-08-01T00:00:00.000Z",
    expiresAt: "2026-08-19T00:00:00.000Z",
    targetAudience: "public",
    channel: "website",
    revalidateAt: "2026-08-19T00:00:00.000Z"
  }, evaluatedAt);
  assert.equal(result.decision, "BLOCK");
  assert.equal(result.publicationAuthorized, false);
  assert.ok(result.reasonCodes.includes("PROHIBITED_UNVERIFIED_COMPLIANCE_OR_CLINICAL_CLAIM"));
});

check("well-formed-public-claim-remains-human-gated-without-trusted-publication-authority", () => {
  const result = evaluateApprovedPublicClaim({
    claimId: "p34-structurally-valid-claim",
    category: "performance",
    ownerRole: "claims-owner",
    approvedWording: "A bounded synthetic control was demonstrated locally.",
    primaryEvidence: [{ sourceId: "source-a", sourceUrl: "https://example.invalid/evidence", evidenceHash: hash("claim-evidence") }],
    scope: "local synthetic evidence only",
    limitations: ["No external validation"],
    approvalHashes: [hash("claimed-approval")],
    approvedAt: "2026-08-20T11:00:00.000Z",
    expiresAt: "2027-02-20T11:00:00.000Z",
    targetAudience: "internal reviewer",
    channel: "internal console",
    revalidateAt: "2026-11-20T11:00:00.000Z"
  }, evaluatedAt);
  assert.equal(result.structurallyValid, true);
  assert.equal(result.decision, "REQUIRE_HUMAN");
  assert.equal(result.publicationAuthorized, false);
  assert.ok(result.reasonCodes.includes("TRUSTED_CLAIM_EVIDENCE_AND_PUBLICATION_APPROVAL_REQUIRED"));
});

check("fallback-cannot-weaken-privacy-or-safety", () => {
  const result = evaluateProviderFailover({
    providerId: "primary",
    controllingCorporateFamily: "family-a",
    cloud: "cloud-a",
    region: "region-a",
    acceleratorPool: "pool-a",
    identityProvider: "idp-a",
    network: "network-a",
    safetyTier: 3,
    privacyTier: 3,
    jurisdiction: "jurisdiction-a",
    eligible: true
  }, {
    providerId: "fallback",
    controllingCorporateFamily: "family-b",
    cloud: "cloud-b",
    region: "region-b",
    acceleratorPool: "pool-b",
    identityProvider: "idp-b",
    network: "network-b",
    safetyTier: 2,
    privacyTier: 2,
    jurisdiction: "jurisdiction-b",
    eligible: true
  });
  assert.equal(result.decision, "BLOCK");
  assert.ok(result.reasonCodes.includes("FALLBACK_SAFETY_TIER_DOWNGRADE"));
  assert.ok(result.reasonCodes.includes("FALLBACK_PRIVACY_TIER_DOWNGRADE"));
});

check("integrated-summary-retains-all-no-go-boundaries", () => {
  const summary = createP34ClinicalOperatingSystemSummary();
  assert.equal(summary.phiProcessed, false);
  assert.equal(summary.externalProviderCallsExecuted, false);
  assert.equal(summary.clinicalActionAuthorized, false);
  assert.equal(summary.billingSubmissionAuthorized, false);
  assert.equal(summary.migrationExecuted, false);
  assert.equal(summary.deploymentAuthorized, false);
  assert.equal(summary.governance.verification.valid, true);
});

console.log(`pass SCRIMED p.34 clinical operating system policy tests (${passed}/${passed})`);
