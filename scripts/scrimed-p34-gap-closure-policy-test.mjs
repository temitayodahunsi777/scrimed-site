import assert from "node:assert/strict";

import { createClinicalEvidenceHash } from "../app/lib/clinicalEvidenceControls.ts";
import {
  FixedTrustedClock,
  InMemorySyntheticAtomicApprovalStore,
  consumeAtomicApproval,
  createP34ControlPlane2Summary,
  createP34TraceEvaluationRecord,
  createSyntheticApprovalSignature,
  createSyntheticApprovalVerifier,
  evaluateP34EgressFirewall,
  evaluateP34EvidenceFreshness,
  evaluateP34EvidenceSet,
  evaluateP34GovernedAction,
  evaluateP34OversightSentinel,
  evaluateP34ReleaseTransition,
  evaluateTrustedTimeWindow,
  getP34AdaptiveGovernanceSummary,
  p34EgressChannels,
  p34ControlPlane2Version
} from "../app/lib/scrimed-p34/index.ts";

let passed = 0;
function check(name, run) {
  run();
  passed += 1;
}

const hash = (value) => createClinicalEvidenceHash(value);
const clock = new FixedTrustedClock("2026-08-21T04:00:00.000Z");
const candidateFingerprint = hash("p34-gap-closure-test-candidate");

function evidence(evidenceType, overrides = {}) {
  return {
    evidenceId: `evidence-${evidenceType}`,
    evidenceType,
    sourceCandidate: candidateFingerprint,
    validationVersion: p34ControlPlane2Version,
    generatedAt: "2026-08-21T03:30:00.000Z",
    expiresAt: "2026-08-22T05:11:03.000Z",
    evidenceHash: hash(`evidence-${evidenceType}`),
    ...overrides
  };
}

function declaration(overrides = {}) {
  return {
    schemaVersion: "scrimed-p34-governed-action-v2",
    actionId: "inspect-synthetic-evidence",
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
    killSwitchMode: "READ_ONLY",
    clock,
    ...overrides
  };
}

function approvalToken(overrides = {}) {
  const unsigned = {
    schemaVersion: "scrimed-p34-atomic-approval-v1",
    approvalId: "p34-gap-closure-approval",
    candidateFingerprint,
    actionId: "prepare-synthetic-receipt",
    tenantId: "synthetic-tenant",
    environmentId: "local-synthetic",
    requesterClass: "synthetic-policy-runner",
    issuedAt: "2026-08-21T03:45:00.000Z",
    expiresAt: "2026-08-21T04:15:00.000Z",
    permittedSideEffect: "reversible-synthetic-internal-write",
    nonce: "p34-gap-closure-nonce-001",
    approvalOwnerHash: hash("p34-gap-closure-approval-owner"),
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
      tenantId: "synthetic-tenant",
      environmentId: "local-synthetic",
      requesterClass: "synthetic-policy-runner",
      permittedSideEffect: "reversible-synthetic-internal-write",
      ...expectedOverrides
    },
    clock,
    store,
    verifier: createSyntheticApprovalVerifier("p34-gap-closure-verifier")
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
  assert.equal(evaluateP34EvidenceFreshness(evidence("gate-packet"), candidateFingerprint, clock).freshness, "fresh");
  const mismatch = evaluateP34EvidenceFreshness(evidence("gate-packet"), hash("other-candidate"), clock);
  assert.equal(mismatch.freshness, "candidate-mismatch");
  assert.ok(mismatch.requiredRegeneration.includes("validation-packet"));
});

check("expired-evidence-requires-regeneration", () => {
  const result = evaluateP34EvidenceFreshness(evidence("gate-packet", {
    expiresAt: "2026-08-21T03:59:59.000Z"
  }), candidateFingerprint, clock);
  assert.equal(result.decision, "BLOCK");
  assert.equal(result.freshness, "expired");
  assert.ok(result.requiredRegeneration.includes("gate-packet"));
});

check("missing-required-evidence-fails-set", () => {
  const result = evaluateP34EvidenceSet({
    evidence: [evidence("candidate-manifest")],
    requiredTypes: ["candidate-manifest", "validation-packet"],
    expectedCandidate: candidateFingerprint,
    clock
  });
  assert.equal(result.fresh, false);
  assert.deepEqual(result.missingTypes, ["validation-packet"]);
});

check("invalid-evidence-type-fails-closed", () => {
  const result = evaluateP34EvidenceFreshness(evidence("unknown-evidence"), candidateFingerprint, clock);
  assert.equal(result.decision, "BLOCK");
  assert.ok(result.reasonCodes.includes("EVIDENCE_TYPE_INVALID"));
});

check("invalid-evidence-record-fails-closed", () => {
  const result = evaluateP34EvidenceFreshness(null, candidateFingerprint, clock);
  assert.equal(result.decision, "BLOCK");
  assert.ok(result.reasonCodes.includes("EVIDENCE_RECORD_INVALID"));
});

check("empty-required-evidence-contract-fails-closed", () => {
  const result = evaluateP34EvidenceSet({ evidence: [], requiredTypes: [], expectedCandidate: candidateFingerprint, clock });
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
  ["tenant-change", { tenantId: "other-tenant" }, "APPROVAL_TENANT_MISMATCH"],
  ["environment-change", { environmentId: "preview" }, "APPROVAL_ENVIRONMENT_MISMATCH"],
  ["requester-change", { requesterClass: "different-requester" }, "APPROVAL_REQUESTER_CLASS_MISMATCH"],
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
      tenantId: "synthetic-tenant",
      environmentId: "local-synthetic",
      requesterClass: "synthetic-policy-runner",
      permittedSideEffect: "reversible-synthetic-internal-write"
    },
    clock
  });
  assert.equal(result.decision, "BLOCK");
  assert.equal(result.approvalConsumed, false);
  assert.ok(result.reasonCodes.includes("APPROVAL_VERIFIER_INVALID"));
  assert.ok(result.reasonCodes.includes("APPROVAL_TRUST_CLASS_INVALID"));
});

check("read-only-a0-action-is-safe-and-nonexecuting", () => {
  const result = evaluateP34GovernedAction(governedRequest());
  assert.equal(result.decision, "ALLOW");
  assert.equal(result.executionAuthorized, false);
  assert.equal(result.a3Available, false);
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
    unexpectedNetworkTargets: [],
    tenantLeakageDetected: true,
    approvalReplayDetected: true,
    unauthorizedDistributionAttempt: false
  });
  assert.equal(result.recommendedMode, "HALTED");
  assert.equal(result.executionAuthorityGranted, false);
  assert.equal(result.incidents.length, 2);
});

check("oversight-sentinel-fails-closed-on-invalid-counters", () => {
  const result = evaluateP34OversightSentinel({
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
    unexpectedNetworkTargets: [],
    tenantLeakageDetected: false,
    approvalReplayDetected: false,
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
    unexpectedNetworkTargets: [],
    tenantLeakageDetected: false,
    approvalReplayDetected: false,
    unauthorizedDistributionAttempt: false,
    secret: "synthetic-must-not-enter-evidence"
  });
  assert.equal(JSON.stringify(withExtraField).includes("synthetic-must-not-enter-evidence"), false);
});

const oversightDetectorCases = [
  ["PRIVILEGE_DRIFT", { privilegeDrift: true }],
  ["MATURITY_DRIFT", { maturityDrift: true }],
  ["EVIDENCE_EXPIRED", { evidenceExpired: true }],
  ["RETRY_BUDGET_EXCEEDED", { retryCount: 3 }],
  ["DELEGATION_DEPTH_EXCEEDED", { delegationDepth: 4 }],
  ["BUDGET_EXCEEDED", { budgetUsedRatio: 1.01 }],
  ["MODEL_SUBSTITUTION", { modelSubstitution: true }],
  ["POLICY_MUTATION", { policyMutation: true }],
  ["UNEXPECTED_NETWORK_TARGET", { unexpectedNetworkTargets: ["unexpected.example"] }],
  ["TENANT_LEAKAGE", { tenantLeakageDetected: true }],
  ["APPROVAL_REPLAY", { approvalReplayDetected: true }],
  ["UNAUTHORIZED_DISTRIBUTION", { unauthorizedDistributionAttempt: true }]
];
const oversightBaseInput = {
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
  unexpectedNetworkTargets: [],
  tenantLeakageDetected: false,
  approvalReplayDetected: false,
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

check("integrated-control-plane-summary-remains-review-only", () => {
  const summary = createP34ControlPlane2Summary();
  assert.equal(summary.killSwitchMode, "READ_ONLY");
  assert.equal(summary.release.resultingState, "EXACT_REVIEW_REQUIRED");
  assert.equal(summary.governedWritesExecuted, false);
  assert.equal(summary.productionAuthorityGranted, false);
  assert.equal(summary.oversightDetectorCoverage.length, 12);
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
