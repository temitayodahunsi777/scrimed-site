import assert from "node:assert/strict";

import { createClinicalEvidenceHash } from "../app/lib/clinicalEvidenceControls.ts";
import {
  FixedTrustedClock,
  InMemorySyntheticAtomicApprovalStore,
  InMemorySyntheticExactCandidateReviewStore,
  compareP34TraceEvaluations,
  consumeAtomicApproval,
  createP34CausalTraceGraph,
  createP34ControlPlane2Summary,
  createP34TraceEvaluationRecord,
  createSyntheticApprovalSignature,
  createSyntheticApprovalVerifier,
  createSyntheticExactReviewSignature,
  createSyntheticExactReviewVerifier,
  createSyntheticP34EvidenceSignature,
  createSyntheticP34EvidenceVerifier,
  evaluateP34DynamicGovernance,
  evaluateP34EgressFirewall,
  evaluateP34EvidenceFreshness,
  evaluateP34EvidenceSet,
  evaluateP34GovernedAction,
  evaluateP34OversightSentinel,
  evaluateP34ReleaseTransition,
  evaluateTrustedTimeWindow,
  explainP34AcceptedOutput,
  getP34AdaptiveGovernanceSummary,
  p34EgressChannels,
  p34ControlPlane2Version,
  p34CausalTraceStages,
  revalidateP34GovernedActionImmediatelyBeforeEffect,
  verifyExactCandidateReview
} from "../app/lib/scrimed-p34/index.ts";

let passed = 0;
function check(name, run) {
  run();
  passed += 1;
}

const hash = (value) => createClinicalEvidenceHash(value);
const clock = new FixedTrustedClock("2026-08-21T04:00:00.000Z");
const candidateFingerprint = hash("p34-gap-closure-test-candidate");
const evidenceVerifierId = "p34-gap-closure-evidence-verifier";
const evidenceIssuerIdentityHash = hash("p34-gap-closure-evidence-issuer");
const evidenceVerificationContext = {
  usage: "synthetic-test-only",
  expectedValidationVersion: p34ControlPlane2Version,
  expectedIssuerIdentityHash: evidenceIssuerIdentityHash,
  verifier: createSyntheticP34EvidenceVerifier(evidenceVerifierId)
};

function evidence(evidenceType, overrides = {}) {
  const unsigned = {
    schemaVersion: "scrimed-p34-evidence-envelope-v2",
    evidenceId: `evidence-${evidenceType}`,
    evidenceType,
    sourceCandidate: candidateFingerprint,
    validationVersion: p34ControlPlane2Version,
    generatedAt: "2026-08-21T03:30:00.000Z",
    expiresAt: "2026-08-22T05:11:03.000Z",
    evidenceHash: hash(`evidence-${evidenceType}`),
    issuerIdentityHash: evidenceIssuerIdentityHash,
    trustClass: "synthetic-test-only",
    ...overrides
  };
  return {
    ...unsigned,
    signature: createSyntheticP34EvidenceSignature(unsigned, evidenceVerifierId)
  };
}

function declaration(overrides = {}) {
  return {
    schemaVersion: "scrimed-p34-governed-action-v2",
    actionId: "inspect-synthetic-evidence",
    resourceId: "synthetic-evidence",
    tenantId: "synthetic-tenant",
    actorIdHash: hash("p34-gap-closure-actor"),
    candidateFingerprint,
    policyVersion: p34ControlPlane2Version,
    autonomyClass: "A0",
    riskTier: "low",
    dataClassification: "synthetic-no-phi",
    allowedEnvironments: ["local-synthetic"],
    requiredEvidenceTypes: ["candidate-manifest", "validation-packet", "security-evidence"],
    requiredApproval: "none-read-only",
    allowedTools: ["evidence-reader"],
    allowedModels: ["deterministic-policy-engine-v1"],
    executionMaturity: "REVIEW_READY",
    rollbackClass: "not-required",
    externalSideEffectClass: "none",
    jurisdictionConstraints: ["local"],
    expiresAt: "2026-08-22T05:11:03.000Z",
    ...overrides
  };
}

function governedRequest(overrides = {}) {
  return {
    declaration: declaration(),
    environmentId: "local-synthetic",
    jurisdiction: "local",
    requestedToolIds: ["evidence-reader"],
    requestedModelIds: ["deterministic-policy-engine-v1"],
    evidence: [
      evidence("candidate-manifest"),
      evidence("validation-packet"),
      evidence("security-evidence")
    ],
    evidenceVerificationContext,
    killSwitchMode: "READ_ONLY",
    clock,
    ...overrides
  };
}

function approvalToken(overrides = {}) {
  const unsigned = {
    schemaVersion: "scrimed-p34-atomic-approval-v2",
    approvalId: "p34-gap-closure-approval",
    candidateFingerprint,
    actionId: "prepare-synthetic-receipt",
    resourceId: "synthetic-receipt",
    tenantId: "synthetic-tenant",
    environmentId: "local-synthetic",
    requesterClass: "synthetic-policy-runner",
    autonomyLevel: "A2",
    maturityLevel: "REVIEW_READY",
    issuedAt: "2026-08-21T03:45:00.000Z",
    expiresAt: "2026-08-21T04:15:00.000Z",
    permittedSideEffect: "reversible-synthetic-internal-write",
    nonce: "p34-gap-closure-nonce-001",
    approverIdentityHash: hash("p34-gap-closure-approval-owner"),
    policyDecisionHash: hash("p34-gap-closure-policy-decision"),
    ...overrides
  };
  return {
    ...unsigned,
    signature: createSyntheticApprovalSignature(unsigned, "p34-gap-closure-verifier")
  };
}

function consume(token, store = new InMemorySyntheticAtomicApprovalStore(), expectedOverrides = {}) {
  return consumeAtomicApproval({
    token,
    expected: {
      candidateFingerprint,
      actionId: "prepare-synthetic-receipt",
      resourceId: "synthetic-receipt",
      tenantId: "synthetic-tenant",
      environmentId: "local-synthetic",
      requesterClass: "synthetic-policy-runner",
      autonomyLevel: "A2",
      maturityLevel: "REVIEW_READY",
      permittedSideEffect: "reversible-synthetic-internal-write",
      approverIdentityHash: hash("p34-gap-closure-approval-owner"),
      policyDecisionHash: hash("p34-gap-closure-policy-decision"),
      ...expectedOverrides
    },
    clock,
    store,
    verifier: createSyntheticApprovalVerifier("p34-gap-closure-verifier")
  });
}

function exactReviewBinding(overrides = {}) {
  return {
    pullRequestNumber: 47,
    commitSha: "a".repeat(40),
    treeSha: "b".repeat(40),
    candidateFingerprint: hash("exact-review-candidate"),
    sourceFingerprint: hash("exact-review-source"),
    validationFingerprint: hash("exact-review-validation"),
    reviewPacketFingerprint: hash("exact-review-packet"),
    sbomFingerprint: hash("exact-review-sbom"),
    gatePacketFingerprint: hash("exact-review-gates"),
    ...overrides
  };
}

function exactReviewApproval(binding = exactReviewBinding(), overrides = {}) {
  const unsigned = {
    schemaVersion: "scrimed-p34-exact-candidate-review-v2",
    approvalId: "p34-exact-review-approval",
    binding,
    reviewerIdentityHash: hash("independent-reviewer"),
    authorIdentityHash: hash("candidate-author"),
    reviewerRole: "independent-technical-reviewer",
    decision: "APPROVED_FOR_MERGE_AUTHORIZATION_REVIEW",
    issuedAt: "2026-08-21T03:45:00.000Z",
    expiresAt: "2026-08-21T04:15:00.000Z",
    nonce: "p34-exact-review-nonce",
    ...overrides
  };
  return {
    ...unsigned,
    signature: createSyntheticExactReviewSignature(unsigned, "p34-exact-review-verifier")
  };
}

function verifyReview(
  approval,
  expected = exactReviewBinding(),
  store = new InMemorySyntheticExactCandidateReviewStore()
) {
  return verifyExactCandidateReview({
    approval,
    expected,
    expectedAuthorIdentityHash: hash("candidate-author"),
    clock,
    store,
    verifier: createSyntheticExactReviewVerifier("p34-exact-review-verifier")
  });
}

check("trusted-clock-accepts-current-window", () => {
  assert.equal(evaluateTrustedTimeWindow({
    issuedAt: "2026-08-21T03:45:00.000Z",
    expiresAt: "2026-08-21T04:15:00.000Z"
  }, clock).valid, true);
});

for (const [name, issuedAt, expiresAt, reason] of [
  ["future-timestamp", "2026-08-21T04:02:00.000Z", "2026-08-21T04:15:00.000Z", "ISSUED_AT_IN_FUTURE"],
  ["expired-window", "2026-08-21T03:00:00.000Z", "2026-08-21T03:59:59.000Z", "TIME_WINDOW_EXPIRED"],
  ["malformed-timestamp", "tomorrow", "2026-08-21T04:15:00.000Z", "ISSUED_AT_INVALID"],
  ["impossible-date", "2026-02-30T03:45:00.000Z", "2026-08-21T04:15:00.000Z", "ISSUED_AT_INVALID"]
]) {
  check(`trusted-clock-rejects-${name}`, () => {
    const result = evaluateTrustedTimeWindow({ issuedAt, expiresAt }, clock);
    assert.equal(result.valid, false);
    assert.ok(result.reasonCodes.includes(reason));
  });
}

check("trusted-clock-enforces-maximum-age", () => {
  const result = evaluateTrustedTimeWindow({
    issuedAt: "2026-08-21T03:00:00.000Z",
    expiresAt: "2026-08-21T05:00:00.000Z",
    maximumAgeMs: 15 * 60 * 1000
  }, clock);
  assert.ok(result.reasonCodes.includes("ISSUED_AT_STALE"));
});

check("trusted-clock-rejects-overlong-replay-window", () => {
  const result = evaluateTrustedTimeWindow({
    issuedAt: "2026-08-21T03:45:00.000Z",
    expiresAt: "2026-08-21T05:00:00.000Z",
    maximumWindowMs: 30 * 60 * 1000
  }, clock);
  assert.equal(result.valid, false);
  assert.ok(result.reasonCodes.includes("TIME_WINDOW_TOO_LONG"));
});

check("trusted-clock-rejects-invalid-skew-policy", () => {
  const result = evaluateTrustedTimeWindow({
    issuedAt: "2026-08-21T04:02:00.000Z",
    expiresAt: "2026-08-21T04:15:00.000Z",
    maximumFutureSkewMs: Number.NaN
  }, clock);
  assert.equal(result.valid, false);
  assert.ok(result.reasonCodes.includes("MAXIMUM_FUTURE_SKEW_INVALID"));
});

check("trusted-clock-fails-closed-with-invalid-clock", () => {
  const result = evaluateTrustedTimeWindow({
    issuedAt: "2026-08-21T03:45:00.000Z",
    expiresAt: "2026-08-21T04:15:00.000Z"
  }, { source: "synthetic-test", now: () => new Date(Number.NaN) });
  assert.equal(result.valid, false);
  assert.ok(result.reasonCodes.includes("TRUSTED_CLOCK_INVALID"));
});

check("trusted-clock-fails-closed-when-source-getter-throws", () => {
  const result = evaluateTrustedTimeWindow({
    issuedAt: "2026-08-21T03:45:00.000Z",
    expiresAt: "2026-08-21T04:15:00.000Z"
  }, {
    get source() {
      throw new Error("synthetic source failure");
    },
    now: () => new Date("2026-08-21T04:00:00.000Z")
  });
  assert.equal(result.valid, false);
  assert.ok(result.reasonCodes.includes("TRUSTED_CLOCK_SOURCE_INVALID"));
});

check("trusted-clock-null-input-fails-closed", () => {
  const result = evaluateTrustedTimeWindow(null, clock);
  assert.equal(result.valid, false);
  assert.ok(result.reasonCodes.includes("TRUSTED_TIME_WINDOW_INPUT_INVALID"));
});

check("evidence-freshness-is-candidate-bound", () => {
  assert.equal(evaluateP34EvidenceFreshness(evidence("gate-packet"), candidateFingerprint, clock, evidenceVerificationContext).freshness, "fresh");
  const mismatch = evaluateP34EvidenceFreshness(evidence("gate-packet"), hash("other-candidate"), clock, evidenceVerificationContext);
  assert.equal(mismatch.freshness, "candidate-mismatch");
  assert.ok(mismatch.requiredRegeneration.includes("validation-packet"));
});

check("expired-evidence-requires-regeneration", () => {
  const result = evaluateP34EvidenceFreshness(evidence("gate-packet", {
    expiresAt: "2026-08-21T03:59:59.000Z"
  }), candidateFingerprint, clock, evidenceVerificationContext);
  assert.equal(result.decision, "BLOCK");
  assert.equal(result.freshness, "expired");
  assert.ok(result.requiredRegeneration.includes("gate-packet"));
});

check("missing-required-evidence-fails-set", () => {
  const result = evaluateP34EvidenceSet({
    evidence: [evidence("candidate-manifest")],
    requiredTypes: ["candidate-manifest", "validation-packet"],
    expectedCandidate: candidateFingerprint,
    clock,
    verificationContext: evidenceVerificationContext
  });
  assert.equal(result.fresh, false);
  assert.deepEqual(result.missingTypes, ["validation-packet"]);
});

check("invalid-evidence-type-fails-closed", () => {
  const result = evaluateP34EvidenceFreshness(evidence("unknown-evidence"), candidateFingerprint, clock, evidenceVerificationContext);
  assert.equal(result.decision, "BLOCK");
  assert.ok(result.reasonCodes.includes("EVIDENCE_TYPE_INVALID"));
});

check("invalid-evidence-record-fails-closed", () => {
  const result = evaluateP34EvidenceFreshness(null, candidateFingerprint, clock, evidenceVerificationContext);
  assert.equal(result.decision, "BLOCK");
  assert.ok(result.reasonCodes.includes("EVIDENCE_RECORD_INVALID"));
});

check("evidence-signature-binds-the-content-fingerprint", () => {
  const signed = evidence("validation-packet");
  const tampered = { ...signed, evidenceHash: hash("tampered-evidence") };
  const result = evaluateP34EvidenceFreshness(
    tampered,
    candidateFingerprint,
    clock,
    evidenceVerificationContext
  );
  assert.equal(result.decision, "BLOCK");
  assert.ok(result.reasonCodes.includes("EVIDENCE_SIGNATURE_INVALID"));
});

check("high-trust-aal2-evidence-requires-authenticated-external-proof-and-short-window", () => {
  const result = evaluateP34EvidenceFreshness(evidence("aal2", {
    generatedAt: "2020-01-01T00:00:00.000Z",
    expiresAt: "2099-01-01T00:00:00.000Z"
  }), candidateFingerprint, clock, evidenceVerificationContext);
  assert.equal(result.decision, "BLOCK");
  assert.ok(result.reasonCodes.includes("EVIDENCE_TRUSTED_EXTERNAL_REQUIRED"));
  assert.ok(result.reasonCodes.includes("EVIDENCE_TIME_WINDOW_TOO_LONG"));
  assert.ok(result.reasonCodes.includes("EVIDENCE_ISSUED_AT_STALE"));
});

check("trusted-external-evidence-cannot-use-a-synthetic-clock", () => {
  const signed = evidence("aal2", {
    trustClass: "trusted-external",
    generatedAt: "2026-08-21T03:55:00.000Z",
    expiresAt: "2026-08-21T04:10:00.000Z"
  });
  const result = evaluateP34EvidenceFreshness(signed, candidateFingerprint, clock, {
    usage: "release-gate",
    expectedValidationVersion: p34ControlPlane2Version,
    expectedIssuerIdentityHash: evidenceIssuerIdentityHash,
    verifier: {
      verifierId: "trusted-external-evidence-verifier",
      trustClass: "trusted-external",
      verify: () => ({
        valid: true,
        authenticatedIssuerIdentityHash: evidenceIssuerIdentityHash
      })
    }
  });
  assert.equal(result.decision, "BLOCK");
  assert.equal(result.releaseGateEligible, false);
  assert.ok(result.reasonCodes.includes("EVIDENCE_SERVER_RUNTIME_CLOCK_REQUIRED"));
});

check("evidence-validation-version-must-match-the-current-policy", () => {
  const result = evaluateP34EvidenceFreshness(
    evidence("security-evidence", { validationVersion: "stale-validation-version" }),
    candidateFingerprint,
    clock,
    evidenceVerificationContext
  );
  assert.equal(result.decision, "BLOCK");
  assert.ok(result.reasonCodes.includes("EVIDENCE_VALIDATION_VERSION_MISMATCH"));
});

check("evidence-envelope-rejects-undeclared-fields", () => {
  const signed = evidence("gate-packet");
  const result = evaluateP34EvidenceFreshness(
    { ...signed, untrustedMetadata: "must-not-change-replay-identity" },
    candidateFingerprint,
    clock,
    evidenceVerificationContext
  );
  assert.equal(result.decision, "BLOCK");
  assert.ok(result.reasonCodes.includes("EVIDENCE_FIELDS_INVALID"));
});

check("empty-required-evidence-contract-fails-closed", () => {
  const result = evaluateP34EvidenceSet({ evidence: [], requiredTypes: [], expectedCandidate: candidateFingerprint, clock, verificationContext: evidenceVerificationContext });
  assert.equal(result.decision, "BLOCK");
  assert.ok(result.reasonCodes.includes("REQUIRED_EVIDENCE_TYPES_INVALID"));
});

check("null-evidence-set-fails-closed", () => {
  const result = evaluateP34EvidenceSet(null);
  assert.equal(result.decision, "BLOCK");
  assert.ok(result.reasonCodes.includes("EVIDENCE_SET_INPUT_INVALID"));
});

check("atomic-approval-consumes-once-without-authority", () => {
  const store = new InMemorySyntheticAtomicApprovalStore();
  const token = approvalToken();
  const first = consume(token, store);
  const second = consume(token, store);
  assert.equal(first.structurallyVerified, true);
  assert.equal(first.approvalConsumed, true);
  assert.equal(first.executionAuthorized, false);
  assert.equal(second.decision, "BLOCK");
  assert.ok(second.reasonCodes.includes("APPROVAL_REPLAY_DETECTED"));
});

check("integrated-summary-labels-approval-as-nondurable-synthetic-self-test", () => {
  const summary = getP34AdaptiveGovernanceSummary();
  assert.equal(summary.atomicApproval.evidenceClassification, "synthetic-in-process-self-test");
  assert.equal(summary.atomicApproval.replayAttemptBlocked, true);
  assert.equal(summary.atomicApproval.persistentReplayProtectionAvailable, false);
  assert.equal(summary.atomicApproval.exactCandidateApprovalVerified, false);
  assert.equal(summary.atomicApproval.executionAuthorized, false);
});

for (const [name, tokenOverrides, reason] of [
  ["candidate-change", { candidateFingerprint: hash("changed-candidate") }, "APPROVAL_CANDIDATE_MISMATCH"],
  ["action-change", { actionId: "different-action" }, "APPROVAL_ACTION_MISMATCH"],
  ["resource-change", { resourceId: "different-resource" }, "APPROVAL_RESOURCE_MISMATCH"],
  ["tenant-change", { tenantId: "other-tenant" }, "APPROVAL_TENANT_MISMATCH"],
  ["environment-change", { environmentId: "preview" }, "APPROVAL_ENVIRONMENT_MISMATCH"],
  ["requester-change", { requesterClass: "different-requester" }, "APPROVAL_REQUESTER_CLASS_MISMATCH"],
  ["autonomy-change", { autonomyLevel: "A3" }, "APPROVAL_AUTONOMY_MISMATCH"],
  ["maturity-change", { maturityLevel: "PILOT_READY" }, "APPROVAL_MATURITY_MISMATCH"],
  ["approver-change", { approverIdentityHash: hash("different-approver") }, "APPROVAL_APPROVER_MISMATCH"],
  ["policy-change", { policyDecisionHash: hash("different-policy") }, "APPROVAL_POLICY_DECISION_MISMATCH"],
  ["side-effect-expansion", { permittedSideEffect: "production-mutation" }, "APPROVAL_SIDE_EFFECT_MISMATCH"],
  ["expired-approval", { expiresAt: "2026-08-21T03:59:59.000Z" }, "APPROVAL_TIME_WINDOW_EXPIRED"]
]) {
  check(`atomic-approval-rejects-${name}`, () => {
    const result = consume(approvalToken(tokenOverrides));
    assert.equal(result.decision, "BLOCK");
    assert.ok(result.reasonCodes.includes(reason));
  });
}

check("atomic-approval-rejects-invalid-signature", () => {
  const token = { ...approvalToken(), signature: "f".repeat(64) };
  const result = consume(token);
  assert.ok(result.reasonCodes.includes("APPROVAL_SIGNATURE_INVALID"));
});

check("atomic-approval-rejects-invalid-schema", () => {
  const result = consume(approvalToken({ schemaVersion: "scrimed-p34-atomic-approval-v0" }));
  assert.equal(result.decision, "BLOCK");
  assert.ok(result.reasonCodes.includes("APPROVAL_SCHEMA_VERSION_INVALID"));
});

check("atomic-approval-store-failure-is-structured", () => {
  const result = consume(approvalToken(), {
    trustClass: "synthetic-test-only",
    consume() {
      throw new Error("synthetic store failure");
    }
  });
  assert.equal(result.decision, "BLOCK");
  assert.ok(result.reasonCodes.includes("APPROVAL_STORE_FAILURE"));
});

check("atomic-approval-invalid-record-fails-closed", () => {
  const result = consume(null);
  assert.equal(result.decision, "BLOCK");
  assert.ok(result.reasonCodes.includes("APPROVAL_RECORD_INVALID"));
});

check("atomic-approval-null-input-fails-closed", () => {
  const result = consumeAtomicApproval(null);
  assert.equal(result.decision, "BLOCK");
  assert.equal(result.executionAuthorized, false);
  assert.ok(result.reasonCodes.includes("APPROVAL_RECORD_INVALID"));
});

check("atomic-approval-missing-verifier-and-store-fails-closed", () => {
  const result = consumeAtomicApproval({
    token: approvalToken(),
    expected: {
      candidateFingerprint,
      actionId: "prepare-synthetic-receipt",
      resourceId: "synthetic-receipt",
      tenantId: "synthetic-tenant",
      environmentId: "local-synthetic",
      requesterClass: "synthetic-policy-runner",
      autonomyLevel: "A2",
      maturityLevel: "REVIEW_READY",
      permittedSideEffect: "reversible-synthetic-internal-write",
      approverIdentityHash: hash("p34-gap-closure-approval-owner"),
      policyDecisionHash: hash("p34-gap-closure-policy-decision")
    },
    clock
  });
  assert.equal(result.decision, "BLOCK");
  assert.equal(result.approvalConsumed, false);
  assert.ok(result.reasonCodes.includes("APPROVAL_VERIFIER_INVALID"));
  assert.ok(result.reasonCodes.includes("APPROVAL_TRUST_CLASS_INVALID"));
});

check("trusted-external-atomic-approval-cannot-use-a-synthetic-clock", () => {
  const token = approvalToken();
  const result = consumeAtomicApproval({
    token,
    expected: {
      candidateFingerprint,
      actionId: "prepare-synthetic-receipt",
      resourceId: "synthetic-receipt",
      tenantId: "synthetic-tenant",
      environmentId: "local-synthetic",
      requesterClass: "synthetic-policy-runner",
      autonomyLevel: "A2",
      maturityLevel: "REVIEW_READY",
      permittedSideEffect: "reversible-synthetic-internal-write",
      approverIdentityHash: hash("p34-gap-closure-approval-owner"),
      policyDecisionHash: hash("p34-gap-closure-policy-decision")
    },
    clock,
    store: { trustClass: "trusted-external", consume: () => true },
    verifier: {
      verifierId: "trusted-external-approval-verifier",
      trustClass: "trusted-external",
      verify: () => true
    }
  });
  assert.equal(result.decision, "BLOCK");
  assert.ok(result.reasonCodes.includes("APPROVAL_SERVER_RUNTIME_CLOCK_REQUIRED"));
});

check("exact-candidate-review-structural-test-cannot-self-satisfy-review", () => {
  const binding = exactReviewBinding();
  const result = verifyReview(exactReviewApproval(binding), binding);
  assert.equal(result.status, "EXACT_REVIEW_REQUIRED");
  assert.equal(result.structurallyVerified, true);
  assert.equal(result.exactCandidateReviewed, false);
  assert.equal(result.mergeAuthorized, false);
  assert.equal(result.deploymentAuthorized, false);
});

for (const [name, expectedOverrides, reason] of [
  ["stale-sha", { commitSha: "c".repeat(40) }, "EXACT_REVIEW_COMMIT_MISMATCH"],
  ["wrong-tree", { treeSha: "d".repeat(40) }, "EXACT_REVIEW_TREE_MISMATCH"],
  ["wrong-candidate", { candidateFingerprint: hash("other-candidate") }, "EXACT_REVIEW_CANDIDATE_MISMATCH"],
  ["stale-packet", { reviewPacketFingerprint: hash("other-review-packet") }, "EXACT_REVIEW_REVIEW_PACKET_MISMATCH"],
  ["modified-sbom", { sbomFingerprint: hash("other-sbom") }, "EXACT_REVIEW_SBOM_MISMATCH"]
]) {
  check(`exact-candidate-review-rejects-${name}`, () => {
    const binding = exactReviewBinding();
    const result = verifyReview(exactReviewApproval(binding), exactReviewBinding(expectedOverrides));
    assert.equal(result.status, "FAIL");
    assert.ok(result.reasonCodes.includes(reason));
  });
}

check("exact-candidate-review-rejects-approval-replay", () => {
  const binding = exactReviewBinding();
  const approval = exactReviewApproval(binding);
  const store = new InMemorySyntheticExactCandidateReviewStore();
  assert.equal(verifyReview(approval, binding, store).approvalConsumed, true);
  const replay = verifyReview(approval, binding, store);
  assert.equal(replay.status, "FAIL");
  assert.ok(replay.reasonCodes.includes("EXACT_REVIEW_APPROVAL_REPLAYED"));
});

check("exact-candidate-review-rejects-self-review", () => {
  const identity = hash("same-reviewer-and-author");
  const binding = exactReviewBinding();
  const result = verifyReview(exactReviewApproval(binding, {
    reviewerIdentityHash: identity,
    authorIdentityHash: identity
  }), binding);
  assert.equal(result.status, "FAIL");
  assert.ok(result.reasonCodes.includes("EXACT_REVIEW_SELF_REVIEW_PROHIBITED"));
});

check("exact-candidate-review-rejects-case-variant-self-review", () => {
  const identity = hash("same-reviewer-case-variant");
  const binding = exactReviewBinding();
  const result = verifyReview(exactReviewApproval(binding, {
    reviewerIdentityHash: identity.toUpperCase(),
    authorIdentityHash: identity
  }), binding);
  assert.equal(result.status, "FAIL");
  assert.ok(result.reasonCodes.includes("EXACT_REVIEW_SELF_REVIEW_PROHIBITED"));
});

check("exact-candidate-review-rejects-unknown-expected-fields-before-replay-consumption", () => {
  const binding = exactReviewBinding();
  const approval = exactReviewApproval(binding);
  const store = new InMemorySyntheticExactCandidateReviewStore();
  assert.equal(verifyReview(approval, binding, store).approvalConsumed, true);
  const result = verifyReview(approval, { ...binding, ignoredReplaySalt: "different" }, store);
  assert.equal(result.status, "FAIL");
  assert.equal(result.approvalConsumed, false);
  assert.ok(result.reasonCodes.includes("EXPECTED_BINDING_FIELDS_INVALID"));
});

check("exact-candidate-review-binds-the-author-to-authoritative-context", () => {
  const binding = exactReviewBinding();
  const approval = exactReviewApproval(binding);
  const result = verifyExactCandidateReview({
    approval,
    expected: binding,
    expectedAuthorIdentityHash: hash("different-author"),
    clock,
    store: new InMemorySyntheticExactCandidateReviewStore(),
    verifier: createSyntheticExactReviewVerifier("p34-exact-review-verifier")
  });
  assert.equal(result.status, "FAIL");
  assert.ok(result.reasonCodes.includes("EXACT_REVIEW_AUTHOR_IDENTITY_MISMATCH"));
});

check("exact-candidate-review-binds-claimed-reviewer-to-authenticated-signer", () => {
  const binding = exactReviewBinding();
  const approval = exactReviewApproval(binding);
  const result = verifyExactCandidateReview({
    approval,
    expected: binding,
    expectedAuthorIdentityHash: approval.authorIdentityHash,
    clock,
    store: { trustClass: "trusted-external", consume: () => true },
    verifier: {
      verifierId: "trusted-external-review-verifier",
      trustClass: "trusted-external",
      verify: () => ({
        valid: true,
        authenticatedSignerIdentityHash: hash("different-authenticated-reviewer"),
        authenticatedSignerRole: "independent-technical-reviewer"
      })
    }
  });
  assert.equal(result.status, "FAIL");
  assert.ok(result.reasonCodes.includes("EXACT_REVIEW_AUTHENTICATED_SIGNER_MISMATCH"));
});

check("trusted-external-exact-review-cannot-use-a-synthetic-clock", () => {
  const binding = exactReviewBinding();
  const approval = exactReviewApproval(binding);
  const result = verifyExactCandidateReview({
    approval,
    expected: binding,
    expectedAuthorIdentityHash: approval.authorIdentityHash,
    clock,
    store: { trustClass: "trusted-external", consume: () => true },
    verifier: {
      verifierId: "trusted-external-review-verifier",
      trustClass: "trusted-external",
      verify: () => ({
        valid: true,
        authenticatedSignerIdentityHash: approval.reviewerIdentityHash,
        authenticatedSignerRole: "independent-technical-reviewer"
      })
    }
  });
  assert.equal(result.status, "FAIL");
  assert.equal(result.exactCandidateReviewed, false);
  assert.ok(result.reasonCodes.includes("EXACT_REVIEW_SERVER_RUNTIME_CLOCK_REQUIRED"));
});

check("exact-candidate-review-rejects-unsigned-approval", () => {
  const binding = exactReviewBinding();
  const result = verifyReview({ ...exactReviewApproval(binding), signature: "0".repeat(64) }, binding);
  assert.equal(result.status, "FAIL");
  assert.ok(result.reasonCodes.includes("EXACT_REVIEW_SIGNATURE_INVALID"));
});

check("read-only-a0-action-is-safe-and-nonexecuting", () => {
  const result = evaluateP34GovernedAction(governedRequest());
  assert.equal(result.decision, "ALLOW");
  assert.equal(result.executionAuthorized, false);
  assert.equal(result.a3Available, false);
});

function dynamicGovernanceInput(overrides = {}) {
  return {
    actionId: "inspect-synthetic-evidence",
    actorIdentityHash: hash("dynamic-governance-actor"),
    tenantId: "synthetic-tenant",
    environmentId: "local-synthetic",
    autonomyTier: "A0",
    actionMaturity: "REVIEW_READY",
    evidenceFresh: true,
    dataClassification: "synthetic-no-phi",
    jurisdiction: "local",
    modelQualified: true,
    toolQualified: true,
    approvalState: "not-required",
    deploymentState: "local-synthetic",
    riskTier: "low",
    externalSideEffectClass: "none",
    ...overrides
  };
}

check("adaptive-governance-2-permits-bounded-read-only-evidence", () => {
  const result = evaluateP34DynamicGovernance(dynamicGovernanceInput());
  assert.equal(result.status, "PERMITTED");
  assert.deepEqual(result.reasonCodes, []);
  assert.equal(result.executionAuthorized, false);
});

for (const [name, overrides, status, reason] of [
  ["stale-evidence", { evidenceFresh: false }, "OPERATOR_ACTION_REQUIRED", "EVIDENCE_STALE_OR_MISSING"],
  ["unqualified-model", { modelQualified: false }, "TARGETED_SPECIALIST_REVIEW_REQUIRED", "MODEL_QUALIFICATION_REQUIRED"],
  ["unqualified-tool", { toolQualified: false }, "TARGETED_SPECIALIST_REVIEW_REQUIRED", "TOOL_QUALIFICATION_REQUIRED"],
  ["a2-review", { autonomyTier: "A2", approvalState: "trusted-valid" }, "PERMITTED_WITH_REVIEW", "A2_NAMED_REVIEW_REQUIRED"],
  ["phi", { dataClassification: "phi-restricted" }, "PROHIBITED", "LIVE_PHI_DISABLED"],
  ["production", { deploymentState: "production" }, "PROHIBITED", "PRODUCTION_AUTHORIZATION_REQUIRED"],
  ["approval-replay", { approvalState: "replayed" }, "PROHIBITED", "APPROVAL_REPLAY_DETECTED"]
]) {
  check(`adaptive-governance-2-classifies-${name}`, () => {
    const result = evaluateP34DynamicGovernance(dynamicGovernanceInput(overrides));
    assert.equal(result.status, status);
    assert.ok(result.reasonCodes.includes(reason));
    assert.equal(result.executionAuthorized, false);
  });
}

check("runtime-revalidation-binds-candidate-tenant-resource-and-time", () => {
  const request = governedRequest();
  const initialDecision = evaluateP34GovernedAction(request);
  const result = revalidateP34GovernedActionImmediatelyBeforeEffect({
    immediateRequest: request,
    expectedCandidateFingerprint: request.declaration.candidateFingerprint,
    expectedEnvironmentId: request.environmentId,
    expectedTenantId: request.declaration.tenantId,
    expectedActionId: request.declaration.actionId,
    expectedResourceId: request.declaration.resourceId,
    expectedAutonomyClass: request.declaration.autonomyClass,
    expectedMaturity: request.declaration.executionMaturity,
    expectedInitialDecisionHash: initialDecision.decisionHash,
    initialDecision,
    atomicApprovalReceipt: null,
    clock
  });
  assert.equal(result.preflightValid, true);
  assert.equal(result.decision, "ALLOW");
  assert.equal(result.executionAuthorized, false);
});

check("runtime-revalidation-rejects-toctou-resource-change", () => {
  const request = governedRequest();
  const initialDecision = evaluateP34GovernedAction(request);
  const changedRequest = governedRequest({
    declaration: { ...request.declaration, resourceId: "changed-resource" }
  });
  const result = revalidateP34GovernedActionImmediatelyBeforeEffect({
    immediateRequest: changedRequest,
    expectedCandidateFingerprint: request.declaration.candidateFingerprint,
    expectedEnvironmentId: request.environmentId,
    expectedTenantId: request.declaration.tenantId,
    expectedActionId: request.declaration.actionId,
    expectedResourceId: request.declaration.resourceId,
    expectedAutonomyClass: request.declaration.autonomyClass,
    expectedMaturity: request.declaration.executionMaturity,
    expectedInitialDecisionHash: initialDecision.decisionHash,
    initialDecision,
    clock
  });
  assert.equal(result.decision, "BLOCK");
  assert.ok(result.reasonCodes.includes("TOCTOU_RESOURCE_CHANGED"));
});

check("runtime-revalidation-rejects-policy-change-during-use", () => {
  const request = governedRequest();
  const initialDecision = evaluateP34GovernedAction(request);
  const staleRequest = governedRequest({
    evidence: [
      evidence("candidate-manifest", { expiresAt: "2026-08-21T03:59:59.000Z" }),
      evidence("validation-packet"),
      evidence("security-evidence")
    ]
  });
  const result = revalidateP34GovernedActionImmediatelyBeforeEffect({
    immediateRequest: staleRequest,
    expectedCandidateFingerprint: request.declaration.candidateFingerprint,
    expectedEnvironmentId: request.environmentId,
    expectedTenantId: request.declaration.tenantId,
    expectedActionId: request.declaration.actionId,
    expectedResourceId: request.declaration.resourceId,
    expectedAutonomyClass: request.declaration.autonomyClass,
    expectedMaturity: request.declaration.executionMaturity,
    expectedInitialDecisionHash: initialDecision.decisionHash,
    initialDecision,
    immediateDecision: initialDecision,
    clock
  });
  assert.equal(result.decision, "BLOCK");
  assert.ok(result.reasonCodes.includes("IMMEDIATE_PREFLIGHT_NOT_PERMITTED"));
});

check("null-governed-action-fails-closed", () => {
  const result = evaluateP34GovernedAction(null);
  assert.equal(result.decision, "BLOCK");
  assert.equal(result.executionAuthorized, false);
  assert.ok(result.reasonCodes.includes("ACTION_REQUEST_INVALID"));
});

check("integrated-summary-does-not-present-fixture-as-exact-candidate-evidence", () => {
  const summary = getP34AdaptiveGovernanceSummary();
  assert.equal(summary.controlPlane2.evidenceContext.classification, "synthetic-fixture-only");
  assert.equal(summary.controlPlane2.evidenceContext.exactCandidateEvidenceVerified, false);
  assert.equal(summary.controlPlane2.evidenceContext.releaseEvidenceAuthorityGranted, false);
  assert.equal(summary.controlPlane2.action.releaseStateCeiling, "EXACT_REVIEW_REQUIRED");
});

check("a0-and-a1-cannot-mutate", () => {
  for (const autonomyClass of ["A0", "A1"]) {
    const result = evaluateP34GovernedAction(governedRequest({
      killSwitchMode: "NORMAL",
      declaration: declaration({ autonomyClass, externalSideEffectClass: "reversible-synthetic-internal" })
    }));
    assert.ok(result.reasonCodes.includes("A0_A1_CANNOT_MUTATE"));
    assert.equal(result.executionAuthorized, false);
  }
});

check("a2-remains-named-review-only", () => {
  const result = evaluateP34GovernedAction(governedRequest({
    killSwitchMode: "NORMAL",
    declaration: declaration({
      autonomyClass: "A2",
      requiredApproval: "named-human",
      rollbackClass: "reversible",
      externalSideEffectClass: "reversible-synthetic-internal"
    })
  }));
  assert.equal(result.decision, "REQUIRE_HUMAN");
  assert.equal(result.executionAuthorized, false);
});

check("a3-is-unavailable", () => {
  const result = evaluateP34GovernedAction(governedRequest({
    killSwitchMode: "NORMAL",
    declaration: declaration({ autonomyClass: "A3" })
  }));
  assert.equal(result.decision, "BLOCK");
  assert.ok(result.reasonCodes.includes("A3_UNAVAILABLE_IN_CURRENT_CANDIDATE"));
});

for (const mode of ["RESTRICTED", "READ_ONLY", "HALTED"]) {
  check(`kill-switch-${mode.toLowerCase()}-blocks-bounded-write`, () => {
    const result = evaluateP34GovernedAction(governedRequest({
      killSwitchMode: mode,
      declaration: declaration({ autonomyClass: "A2", externalSideEffectClass: "reversible-synthetic-internal" })
    }));
    assert.equal(result.decision, "BLOCK");
    assert.equal(result.executionAuthorized, false);
  });
}

check("halted-kill-switch-blocks-read-only-actions", () => {
  const result = evaluateP34GovernedAction(governedRequest({ killSwitchMode: "HALTED" }));
  assert.equal(result.decision, "BLOCK");
  assert.ok(result.reasonCodes.includes("KILL_SWITCH_HALTED"));
});

check("malformed-runtime-enums-fail-closed", () => {
  const result = evaluateP34GovernedAction(governedRequest({
    killSwitchMode: "INVALID_MODE",
    declaration: declaration({
      autonomyClass: "A9",
      riskTier: "unknown-risk",
      dataClassification: "unknown-data",
      requiredApproval: "unknown-approval",
      executionMaturity: "UNKNOWN_MATURITY",
      rollbackClass: "unknown-rollback",
      externalSideEffectClass: "unknown-side-effect"
    })
  }));
  assert.equal(result.decision, "BLOCK");
  assert.ok(result.reasonCodes.includes("ACTION_DECLARATION_ENUM_INVALID"));
  assert.ok(result.reasonCodes.includes("KILL_SWITCH_MODE_INVALID"));
});

check("numeric-runtime-identifiers-fail-closed", () => {
  const result = evaluateP34GovernedAction(governedRequest({
    declaration: declaration({ actionId: 123456 })
  }));
  assert.equal(result.decision, "BLOCK");
  assert.ok(result.reasonCodes.includes("ACTION_DECLARATION_IDENTIFIER_INVALID"));
});

check("declared-human-approval-cannot-return-allow", () => {
  const result = evaluateP34GovernedAction(governedRequest({
    killSwitchMode: "NORMAL",
    declaration: declaration({ requiredApproval: "named-human" })
  }));
  assert.equal(result.decision, "REQUIRE_HUMAN");
  assert.ok(result.reasonCodes.includes("DECLARED_APPROVAL_REQUIRED"));
});

check("missing-and-stale-action-evidence-fail-closed", () => {
  const missing = evaluateP34GovernedAction(governedRequest({ evidence: [evidence("candidate-manifest")] }));
  assert.equal(missing.decision, "BLOCK");
  const stale = evaluateP34GovernedAction(governedRequest({
    evidence: [
      evidence("candidate-manifest", { expiresAt: "2026-08-21T03:59:59.000Z" }),
      evidence("validation-packet"),
      evidence("security-evidence")
    ]
  }));
  assert.equal(stale.decision, "BLOCK");
  assert.ok(stale.errorCodes.includes("EVIDENCE_EXPIRED"));
});

check("environment-tool-model-and-jurisdiction-escalation-deny", () => {
  const result = evaluateP34GovernedAction(governedRequest({
    environmentId: "production",
    jurisdiction: "outside-policy",
    requestedToolIds: ["shell"],
    requestedModelIds: ["unverified-model"]
  }));
  assert.equal(result.decision, "BLOCK");
  assert.ok(result.reasonCodes.includes("ENVIRONMENT_NOT_ALLOWED"));
  assert.ok(result.reasonCodes.includes("TOOL_NOT_ALLOWED"));
  assert.ok(result.reasonCodes.includes("MODEL_NOT_ALLOWED"));
  assert.ok(result.reasonCodes.includes("JURISDICTION_NOT_ALLOWED"));
});

check("maturity-cannot-outpace-evidence", () => {
  const result = evaluateP34GovernedAction(governedRequest({
    declaration: declaration({ executionMaturity: "PILOT_READY" })
  }));
  assert.ok(result.reasonCodes.includes("MATURITY_EXCEEDS_CURRENT_EVIDENCE"));
});

check("release-state-skip-and-unreviewed-promotion-deny", () => {
  const result = evaluateP34ReleaseTransition({
    currentState: "EXACT_REVIEW_REQUIRED",
    requestedState: "PREVIEW_READY",
    exactReviewEvidencePresent: false,
    externalAuthorizationPresent: false
  });
  assert.equal(result.accepted, false);
  assert.equal(result.resultingState, "EXACT_REVIEW_REQUIRED");
});

check("unbound-review-booleans-cannot-exceed-current-candidate-ceiling", () => {
  const result = evaluateP34ReleaseTransition({
    currentState: "EXACT_REVIEW_REQUIRED",
    requestedState: "REVIEWED",
    exactReviewEvidencePresent: true,
    externalAuthorizationPresent: true
  });
  assert.equal(result.accepted, false);
  assert.ok(result.reasonCodes.includes("CURRENT_CANDIDATE_RELEASE_CEILING"));
});

check("invalid-release-state-fails-closed", () => {
  const result = evaluateP34ReleaseTransition({
    currentState: "UNTRUSTED_STATE",
    requestedState: "REVIEWED",
    exactReviewEvidencePresent: true,
    externalAuthorizationPresent: true
  });
  assert.equal(result.accepted, false);
  assert.equal(result.resultingState, "DEVELOPMENT");
  assert.ok(result.reasonCodes.includes("RELEASE_STATE_INVALID"));
});

check("null-release-transition-fails-closed", () => {
  const result = evaluateP34ReleaseTransition(null);
  assert.equal(result.accepted, false);
  assert.equal(result.resultingState, "DEVELOPMENT");
  assert.ok(result.reasonCodes.includes("RELEASE_TRANSITION_INPUT_INVALID"));
});

check("oversight-sentinel-halts-on-tenant-leak-and-replay", () => {
  const result = evaluateP34OversightSentinel({
    autonomyEscalation: false,
    privilegeDrift: false,
    maturityDrift: false,
    evidenceExpired: false,
    retryCount: 1,
    maximumRetries: 2,
    delegationDepth: 1,
    maximumDelegationDepth: 3,
    budgetUsedRatio: 0.1,
    modelSubstitution: false,
    policyMutation: false,
    routeDivergence: false,
    unexpectedNetworkTargets: [],
    tenantLeakageDetected: true,
    approvalReplayDetected: true,
    egressFirewallTriggered: false,
    anomalousToolEscalation: false,
    unauthorizedDistributionAttempt: false
  });
  assert.equal(result.recommendedMode, "HALTED");
  assert.equal(result.executionAuthorityGranted, false);
  assert.equal(result.incidents.length, 2);
});

check("oversight-sentinel-fails-closed-on-invalid-counters", () => {
  const result = evaluateP34OversightSentinel({
    autonomyEscalation: false,
    privilegeDrift: false,
    maturityDrift: false,
    evidenceExpired: false,
    retryCount: Number.NaN,
    maximumRetries: 2,
    delegationDepth: 1,
    maximumDelegationDepth: 3,
    budgetUsedRatio: 0.1,
    modelSubstitution: false,
    policyMutation: false,
    routeDivergence: false,
    unexpectedNetworkTargets: [],
    tenantLeakageDetected: false,
    approvalReplayDetected: false,
    egressFirewallTriggered: false,
    anomalousToolEscalation: false,
    unauthorizedDistributionAttempt: false
  });
  assert.equal(result.recommendedMode, "HALTED");
  assert.ok(result.incidents.some((incident) => incident.signal === "SENTINEL_INPUT_INVALID"));
});

check("null-oversight-input-halts-without-echoing-extra-fields", () => {
  const result = evaluateP34OversightSentinel(null);
  assert.equal(result.recommendedMode, "HALTED");
  assert.ok(result.incidents.some((incident) => incident.signal === "SENTINEL_INPUT_INVALID"));
  const withExtraField = evaluateP34OversightSentinel({
    autonomyEscalation: false,
    privilegeDrift: false,
    maturityDrift: false,
    evidenceExpired: false,
    retryCount: 0,
    maximumRetries: 2,
    delegationDepth: 0,
    maximumDelegationDepth: 2,
    budgetUsedRatio: 0,
    modelSubstitution: false,
    policyMutation: false,
    routeDivergence: false,
    unexpectedNetworkTargets: [],
    tenantLeakageDetected: false,
    approvalReplayDetected: false,
    egressFirewallTriggered: false,
    anomalousToolEscalation: false,
    unauthorizedDistributionAttempt: false,
    secret: "synthetic-must-not-enter-evidence"
  });
  assert.equal(JSON.stringify(withExtraField).includes("synthetic-must-not-enter-evidence"), false);
});

const oversightDetectorCases = [
  ["AUTONOMY_ESCALATION", { autonomyEscalation: true }],
  ["PRIVILEGE_DRIFT", { privilegeDrift: true }],
  ["MATURITY_DRIFT", { maturityDrift: true }],
  ["EVIDENCE_EXPIRED", { evidenceExpired: true }],
  ["RETRY_BUDGET_EXCEEDED", { retryCount: 3 }],
  ["DELEGATION_DEPTH_EXCEEDED", { delegationDepth: 4 }],
  ["BUDGET_EXCEEDED", { budgetUsedRatio: 1.01 }],
  ["MODEL_SUBSTITUTION", { modelSubstitution: true }],
  ["POLICY_DRIFT", { policyMutation: true }],
  ["ROUTE_DIVERGENCE", { routeDivergence: true }],
  ["UNEXPECTED_NETWORK_TARGET", { unexpectedNetworkTargets: ["unexpected.example"] }],
  ["TENANT_LEAKAGE", { tenantLeakageDetected: true }],
  ["APPROVAL_REPLAY", { approvalReplayDetected: true }],
  ["EGRESS_FIREWALL_TRIGGER", { egressFirewallTriggered: true }],
  ["ANOMALOUS_TOOL_ESCALATION", { anomalousToolEscalation: true }],
  ["UNAUTHORIZED_DISTRIBUTION", { unauthorizedDistributionAttempt: true }]
];
const oversightBaseInput = {
  autonomyEscalation: false,
  privilegeDrift: false,
  maturityDrift: false,
  evidenceExpired: false,
  retryCount: 0,
  maximumRetries: 2,
  delegationDepth: 1,
  maximumDelegationDepth: 3,
  budgetUsedRatio: 0.1,
  modelSubstitution: false,
  policyMutation: false,
  routeDivergence: false,
  unexpectedNetworkTargets: [],
  tenantLeakageDetected: false,
  approvalReplayDetected: false,
  egressFirewallTriggered: false,
  anomalousToolEscalation: false,
  unauthorizedDistributionAttempt: false
};
for (const [signal, overrides] of oversightDetectorCases) {
  check(`oversight-sentinel-detects-${signal.toLowerCase()}`, () => {
    const result = evaluateP34OversightSentinel({ ...oversightBaseInput, ...overrides });
    assert.ok(result.incidents.some((incident) => incident.signal === signal));
    assert.equal(result.executionAuthorityGranted, false);
  });
}

check("egress-firewall-blocks-secret-on-external-channel", () => {
  const result = evaluateP34EgressFirewall({
    channel: "model-prompt",
    dataClassification: "synthetic-no-phi",
    tenantId: "synthetic-tenant",
    purpose: "adversarial-test",
    payload: { authorization: "Bearer synthetic_example_token_123456789" }
  });
  assert.equal(result.decision, "BLOCK");
  assert.equal(result.forwardingAuthorized, false);
  assert.equal(result.sanitizedPayload.authorization, "[REDACTED]");
  assert.equal(JSON.stringify(result).includes("synthetic_example_token"), false);
});

for (const channel of p34EgressChannels) {
  check(`egress-firewall-covers-${channel}`, () => {
    const result = evaluateP34EgressFirewall({
      channel,
      dataClassification: "synthetic-no-phi",
      tenantId: "synthetic-tenant",
      purpose: "channel-coverage-test",
      payload: { authorization: "Bearer synthetic_example_token_123456789" }
    });
    assert.equal(result.decision, channel === "log" || channel === "telemetry" ? "REQUIRE_HUMAN" : "BLOCK");
    assert.ok(result.detectedClasses.includes("secret"));
    assert.equal(result.forwardingAuthorized, false);
    assert.equal(result.containsRawPhi, false);
    assert.equal(result.containsSecrets, false);
  });
}

check("null-egress-input-fails-closed-and-redacted", () => {
  const result = evaluateP34EgressFirewall(null);
  assert.equal(result.decision, "BLOCK");
  assert.equal(result.sanitizedPayload, "[REDACTED]");
  assert.ok(result.reasonCodes.includes("EGRESS_INPUT_INVALID"));
});

check("egress-firewall-redacts-telemetry-without-forward-authority", () => {
  const result = evaluateP34EgressFirewall({
    channel: "telemetry",
    dataClassification: "synthetic-no-phi",
    tenantId: "synthetic-tenant",
    purpose: "adversarial-test",
    payload: { patientName: "Synthetic Test Person", requestId: "request-safe" }
  });
  assert.equal(result.decision, "REQUIRE_HUMAN");
  assert.equal(result.sanitizedPayload.patientName, "[REDACTED]");
  assert.equal(result.containsRawPhi, false);
});

check("egress-firewall-blocks-unknown-classification-without-returning-raw-input", () => {
  const result = evaluateP34EgressFirewall({
    channel: "model-prompt",
    dataClassification: "unknown",
    tenantId: "synthetic-tenant",
    purpose: "adversarial-test",
    payload: { note: "MRN: SYNTHETIC-123456" }
  });
  assert.equal(result.decision, "BLOCK");
  assert.equal(result.sanitizedPayload, "[REDACTED]");
  assert.equal(JSON.stringify(result).includes("SYNTHETIC-123456"), false);
  assert.ok(result.reasonCodes.includes("DATA_CLASSIFICATION_UNKNOWN"));
});

check("egress-firewall-blocks-declared-phi-and-reports-sensitive-input", () => {
  const result = evaluateP34EgressFirewall({
    channel: "telemetry",
    dataClassification: "phi",
    tenantId: "synthetic-tenant",
    purpose: "adversarial-test",
    payload: { note: "opaque content" }
  });
  assert.equal(result.decision, "BLOCK");
  assert.equal(result.rawSensitiveInputDetected, true);
  assert.equal(result.sanitizedPayload, "[REDACTED]");
  assert.ok(result.detectedClasses.includes("phi"));
});

check("egress-firewall-blocks-cyclic-payload", () => {
  const payload = { requestId: "request-safe" };
  payload.self = payload;
  const result = evaluateP34EgressFirewall({
    channel: "telemetry",
    dataClassification: "synthetic-no-phi",
    tenantId: "synthetic-tenant",
    purpose: "adversarial-test",
    payload
  });
  assert.equal(result.decision, "BLOCK");
  assert.equal(result.sanitizedPayload, "[REDACTED]");
  assert.ok(result.reasonCodes.includes("PAYLOAD_CYCLE_DETECTED"));
});

check("trace-to-eval-retains-only-fingerprints", () => {
  const record = createP34TraceEvaluationRecord({
    traceId: "trace-gap-closure",
    actionId: "inspect-synthetic-evidence",
    tenantId: "synthetic-tenant",
    modelId: "deterministic-policy-engine-v1",
    promptVersion: "not-applicable-deterministic",
    toolIds: ["evidence-reader"],
    evidenceHashes: [hash("trace-evidence")],
    resultHash: hash("trace-result"),
    evaluationHash: hash("trace-evaluation"),
    reviewerCorrectionHash: null,
    accepted: true,
    latencyMs: 4,
    costUsd: 0
  });
  assert.equal(record.traceId, "trace-gap-closure");
  assert.equal(record.actionId, "inspect-synthetic-evidence");
  assert.equal(record.tenantId, "synthetic-tenant");
  assert.equal(record.modelId, "deterministic-policy-engine-v1");
  assert.equal(record.promptVersion, "not-applicable-deterministic");
  assert.deepEqual(record.toolIds, ["evidence-reader"]);
  assert.deepEqual(record.evidenceHashes, [hash("trace-evidence")]);
  assert.equal(record.resultHash, hash("trace-result"));
  assert.equal(record.evaluationHash, hash("trace-evaluation"));
  assert.equal(record.reviewerCorrectionHash, null);
  assert.equal(record.accepted, true);
  assert.equal(record.latencyMs, 4);
  assert.equal(record.costUsd, 0);
  assert.equal(record.containsRawPhi, false);
  assert.equal(record.hiddenChainOfThoughtStored, false);
  assert.throws(() => createP34TraceEvaluationRecord({ ...record, resultHash: "not-a-hash" }));
  assert.throws(() => createP34TraceEvaluationRecord({ ...record, modelId: "patientName=Synthetic Test" }));
  assert.throws(() => createP34TraceEvaluationRecord({ ...record, latencyMs: Number.NaN }));
});

check("null-trace-input-fails-with-a-controlled-validation-error", () => {
  assert.throws(
    () => createP34TraceEvaluationRecord(null),
    /bounded nonempty evidence set/
  );
});

check("causal-trace-explains-accepted-output-with-immutable-references", () => {
  const artifacts = Object.fromEntries(p34CausalTraceStages.map((stage) => [stage, hash(`causal-${stage}`)]));
  const graph = createP34CausalTraceGraph({
    traceId: "trace-causal-acceptance",
    tenantId: "synthetic-tenant",
    artifacts,
    accepted: true
  });
  const explanation = explainP34AcceptedOutput(graph);
  assert.equal(graph.nodes.length, p34CausalTraceStages.length);
  assert.equal(graph.nodes[0].parentReference, null);
  assert.equal(graph.nodes[1].parentReference, graph.nodes[0].immutableReference);
  assert.equal(explanation.explainable, true);
  assert.equal(graph.containsRawPhi, false);
  assert.equal(graph.hiddenChainOfThoughtStored, false);
});

check("causal-trace-comparison-identifies-changed-evaluation-stage", () => {
  const firstArtifacts = Object.fromEntries(p34CausalTraceStages.map((stage) => [stage, hash(`first-${stage}`)]));
  const secondArtifacts = { ...firstArtifacts, evaluation: hash("second-evaluation") };
  const first = createP34CausalTraceGraph({
    traceId: "trace-causal-first",
    tenantId: "synthetic-tenant",
    artifacts: firstArtifacts,
    accepted: true
  });
  const second = createP34CausalTraceGraph({
    traceId: "trace-causal-second",
    tenantId: "synthetic-tenant",
    artifacts: secondArtifacts,
    accepted: true
  });
  const comparison = compareP34TraceEvaluations(first, second);
  assert.deepEqual(comparison.changedStages, ["evaluation"]);
  assert.equal(comparison.acceptanceChanged, false);
});

check("causal-trace-rejects-missing-artifact-evidence", () => {
  const artifacts = Object.fromEntries(p34CausalTraceStages.map((stage) => [stage, hash(`causal-${stage}`)]));
  delete artifacts.policy;
  assert.throws(() => createP34CausalTraceGraph({
    traceId: "trace-causal-invalid",
    tenantId: "synthetic-tenant",
    artifacts,
    accepted: false
  }), /requires a SHA-256 artifact/);
});

check("integrated-control-plane-summary-remains-review-only", () => {
  const summary = createP34ControlPlane2Summary();
  assert.equal(summary.killSwitchMode, "READ_ONLY");
  assert.equal(summary.release.resultingState, "EXACT_REVIEW_REQUIRED");
  assert.equal(summary.governedWritesExecuted, false);
  assert.equal(summary.productionAuthorityGranted, false);
  assert.equal(summary.dynamicGovernance.status, "PERMITTED");
  assert.equal(summary.runtimeRevalidation.preflightValid, true);
  assert.equal(summary.acceptedOutputExplanation.explainable, true);
  assert.equal(summary.oversightDetectorCoverage.length, 16);
  assert.ok(summary.oversightDetectorCoverage.every((item) => item.detected));
});

check("integrated-control-plane-summary-reports-trusted-halted-mode", () => {
  const summary = createP34ControlPlane2Summary({ SCRIMED_P34_KILL_SWITCH_MODE: "HALTED" });
  assert.equal(summary.killSwitchMode, "HALTED");
  assert.equal(summary.action.decision, "BLOCK");
  assert.ok(summary.action.reasonCodes.includes("KILL_SWITCH_HALTED"));
  assert.equal(summary.governedWritesExecuted, false);
});

console.log(`pass SCRIMED p.34 gap-closure policy tests (${passed}/${passed})`);
