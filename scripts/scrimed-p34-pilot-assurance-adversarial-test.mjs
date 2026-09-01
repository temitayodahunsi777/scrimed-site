#!/usr/bin/env node

import assert from "node:assert/strict";
import { createClinicalEvidenceHash } from "../app/lib/clinicalEvidenceControls.ts";
import {
  createPilotManifest,
  syntheticPilotControlContract
} from "../app/lib/commercial/pilotManifest.ts";
import {
  buildPilotEvidenceLedger,
  buildPilotProposalFingerprint,
  InMemorySyntheticPilotLifecycleLeaseStore,
  transitionPilotLifecycleAtomically,
  verifyPilotEvidenceLedger
} from "../app/lib/commercial/pilotOperatingSystem.ts";
import { getPilotTemplate } from "../app/lib/commercial/pilotTemplateRegistry.ts";
import { InMemorySyntheticPilotBudgetLedger } from "../app/lib/economics/pilotCostGovernor.ts";
import {
  consumeAtomicApproval,
  createSyntheticApprovalSignature,
  createSyntheticApprovalVerifier,
  InMemorySyntheticAtomicApprovalStore
} from "../app/lib/scrimed-p34/atomicApproval.ts";
import { evaluateP34EgressFirewall } from "../app/lib/scrimed-p34/egressFirewall.ts";
import { deriveExactHeadReviewState } from "../app/lib/scrimed-p34/exactHeadReviewState.ts";
import { FixedTrustedClock } from "../app/lib/scrimed-p34/trustedClock.ts";
import { evaluatePreviewAcceptance } from "../app/lib/release/previewAcceptance.ts";

let passed = 0;
function check(name, run) {
  run();
  passed += 1;
  console.log(`pass ${name}`);
}

const candidateReference = "a".repeat(64);
const template = getPilotTemplate("enterprise-ai-governance");
assert.ok(template);
const scope = "Evaluate one bounded synthetic governance workflow with retained human control and deterministic evidence.";
const scopeFingerprint = createClinicalEvidenceHash({
  templateId: template.templateId,
  scope,
  exclusions: [...template.exclusions].sort()
});
const input = {
  pilotId: "synthetic-adversarial-pilot",
  prospectAlias: "prospect-adversarial-001",
  templateId: template.templateId,
  scope,
  environment: "synthetic-nonproduction",
  dataSourceClassification: ["SYNTHETIC"],
  datasetVersion: "synthetic-dataset-v1",
  scenarioVersion: "synthetic-scenario-v1",
  candidateReference,
  modelPolicyVersion: "model-policy-v1",
  agentPolicyVersion: "agent-policy-v1",
  toolPolicyVersion: "tool-policy-v1",
  evidencePolicyVersion: "evidence-policy-v1",
  costCeilingUsd: 100,
  runtimeCeilingMinutes: 60,
  retryCeiling: 2,
  modelCallCeiling: 10,
  toolCallCeiling: 20,
  agentDepthCeiling: 3,
  evidenceStorageCeilingBytes: 1_000_000,
  durationDays: 30,
  startsAt: "2026-08-28T00:00:00.000Z",
  endsAt: "2026-09-27T00:00:00.000Z",
  successCriteria: [{ metricId: "evidence-coverage", label: "Evidence coverage", unit: "percent", direction: "at-least", baseline: 40, target: 90, mandatory: true, evidenceSourceId: "synthetic-eval-v1" }],
  exclusions: template.exclusions,
  commercialAuthorityState: "NO_BINDING_AUTHORITY",
  protectedPilotExpansionState: "PROTECTED_PILOT_NOT_AUTHORIZED",
  approvalState: "APPROVED_FOR_SYNTHETIC_EXECUTION",
  approvalEvidence: {
    approverId: "synthetic-approver",
    approvedAt: "2026-08-28T01:00:00.000Z",
    expiresAt: "2026-09-27T01:00:00.000Z",
    candidateReference,
    scopeFingerprint
  },
  controlContract: syntheticPilotControlContract
};
const manifestDecision = createPilotManifest(input, new Date("2026-08-28T02:00:00.000Z"));
assert.ok(manifestDecision.manifest);

check("malformed-manifest-fuzz-fails-closed-without-throwing", () => {
  const mutationValues = [null, undefined, {}, [], "../../escape", Number.NaN, Number.POSITIVE_INFINITY, false];
  const keys = Object.keys(input);
  for (let index = 0; index < 160; index += 1) {
    const key = keys[index % keys.length];
    const malformed = { ...input, [key]: mutationValues[index % mutationValues.length] };
    const decision = createPilotManifest(malformed, new Date("2026-08-28T02:00:00.000Z"));
    assert.ok(new Set(["BLOCKED", "READY_FOR_SYNTHETIC_EXECUTION", "HUMAN_SCOPE_REVIEW_REQUIRED"]).has(decision.status));
    assert.equal(decision.productionAuthorityGranted, false);
  }
  const nullDecision = createPilotManifest(null, new Date("invalid"));
  assert.equal(nullDecision.status, "BLOCKED");
});

check("non-synthetic-data-classification-is-ineligible", () => {
  const decision = createPilotManifest({ ...input, dataSourceClassification: ["PUBLIC"] }, new Date("2026-08-28T02:00:00.000Z"));
  assert.equal(decision.status, "BLOCKED");
  assert.ok(decision.reasonCodes.includes("SYNTHETIC_DATA_CLASSIFICATION_REQUIRED"));
});

check("success-criteria-require-enumerated-direction-and-explicit-mandatory-state", () => {
  for (const invalidCriterion of [
    { ...input.successCriteria[0], direction: "sideways" },
    { ...input.successCriteria[0], mandatory: undefined },
    { ...input.successCriteria[0], mandatory: "true" }
  ]) {
    const decision = createPilotManifest(
      { ...input, successCriteria: [invalidCriterion] },
      new Date("2026-08-28T02:00:00.000Z")
    );
    assert.equal(decision.status, "BLOCKED");
    assert.ok(decision.reasonCodes.includes("OBJECTIVE_SUCCESS_CRITERIA_REQUIRED"));
  }
});

check("atomic-lifecycle-lease-blocks-double-spend", () => {
  const store = new InMemorySyntheticPilotLifecycleLeaseStore();
  const request = {
    manifest: manifestDecision.manifest,
    currentState: "DRAFT",
    requestedState: "DISCOVERY",
    actorId: "synthetic-operator",
    idempotencyKey: "atomic-transition-001",
    consumedIdempotencyKeys: [],
    evidenceIds: ["pilot-manifest"],
    timestamp: "2026-08-28T03:00:00.000Z"
  };
  const first = transitionPilotLifecycleAtomically(request, store);
  const second = transitionPilotLifecycleAtomically(request, store);
  assert.equal(first.allowed, true);
  assert.equal(second.allowed, false);
  assert.ok(second.reasonCodes.includes("DUPLICATE_EXECUTION_BLOCKED"));
});

check("concurrent-budget-reservations-stop-before-overrun", () => {
  const ledger = new InMemorySyntheticPilotBudgetLedger();
  const limits = {
    maxInferenceCostUsd: 100,
    maxToolCostUsd: 50,
    maxModelCalls: 10,
    maxToolCalls: 20,
    maxRetries: 2,
    maxRuntimeMinutes: 60,
    maxAgentDepth: 3,
    maxEvidenceStorageBytes: 1_000_000,
    maxTotalBudgetUsd: 100,
    warningThresholdPercent: 80
  };
  const reservation = {
    inferenceCostUsd: 60,
    toolCostUsd: 0,
    infrastructureCostUsd: 0,
    reviewCostUsd: 0,
    correctionCostUsd: 0,
    modelCalls: 1,
    toolCalls: 1,
    retries: 0,
    runtimeMinutes: 10,
    agentDepth: 1,
    evidenceStorageBytes: 100,
    reviewerMinutes: 0,
    acceptedUsefulOutputs: 1
  };
  assert.equal(ledger.reserve(limits, reservation).reservationApplied, true);
  const blocked = ledger.reserve(limits, reservation);
  assert.equal(blocked.status, "STOP_SAFELY");
  assert.equal(blocked.reservationApplied, false);
  assert.equal(ledger.snapshot().inferenceCostUsd, 60);
});

check("negative-budget-reservation-deltas-cannot-release-consumed-capacity", () => {
  const ledger = new InMemorySyntheticPilotBudgetLedger();
  const limits = {
    maxInferenceCostUsd: 100,
    maxToolCostUsd: 50,
    maxModelCalls: 10,
    maxToolCalls: 20,
    maxRetries: 2,
    maxRuntimeMinutes: 60,
    maxAgentDepth: 3,
    maxEvidenceStorageBytes: 1_000_000,
    maxTotalBudgetUsd: 100,
    warningThresholdPercent: 80
  };
  const reservation = {
    inferenceCostUsd: 90,
    toolCostUsd: 0,
    infrastructureCostUsd: 0,
    reviewCostUsd: 0,
    correctionCostUsd: 0,
    modelCalls: 1,
    toolCalls: 1,
    retries: 0,
    runtimeMinutes: 10,
    agentDepth: 1,
    evidenceStorageBytes: 100,
    reviewerMinutes: 0,
    acceptedUsefulOutputs: 1
  };
  assert.equal(ledger.reserve(limits, reservation).reservationApplied, true);
  const negative = ledger.reserve(limits, { ...reservation, inferenceCostUsd: -90 });
  assert.equal(negative.reservationApplied, false);
  assert.ok(negative.reasonCodes.includes("INVALID_MONETARY_USAGE"));
  assert.equal(ledger.snapshot().inferenceCostUsd, 90);
  assert.equal(ledger.reserve(limits, reservation).reservationApplied, false);
  assert.equal(ledger.snapshot().inferenceCostUsd, 90);
});

check("tampered-evidence-ledger-is-rejected", () => {
  const kinds = ["pilot", "scenario", "workflow", "model", "agent", "tool", "policy", "output", "evaluation", "correction", "accepted-result", "value-estimate"];
  const ledger = buildPilotEvidenceLedger({
    manifest: manifestDecision.manifest,
    references: kinds.map((kind, index) => ({ kind, referenceId: `synthetic-ref-${index + 1}`, evidenceClassification: "SYNTHETIC" }))
  });
  assert.equal(verifyPilotEvidenceLedger(ledger).valid, true);
  const tampered = { ...ledger, links: ledger.links.map((link, index) => index === 5 ? { ...link, referenceId: "tampered" } : link) };
  const verification = verifyPilotEvidenceLedger(tampered);
  assert.equal(verification.valid, false);
  assert.ok(verification.reasonCodes.includes("LEDGER_LINK_HASH_INVALID"));

  const truncated = { ...ledger, links: ledger.links.slice(0, -1) };
  const truncatedVerification = verifyPilotEvidenceLedger(truncated);
  assert.equal(truncatedVerification.valid, false);
  assert.ok(truncatedVerification.reasonCodes.includes("MISSING_LEDGER_LINK:value-estimate"));
  assert.ok(truncatedVerification.reasonCodes.includes("LEDGER_STATUS_INVALID"));

  const hashTampered = { ...ledger, ledgerHash: "0".repeat(64) };
  const hashVerification = verifyPilotEvidenceLedger(hashTampered);
  assert.equal(hashVerification.valid, false);
  assert.ok(hashVerification.reasonCodes.includes("LEDGER_HASH_INVALID"));

  const statusTampered = { ...ledger, status: "INCOMPLETE_BLOCKED" };
  const statusVerification = verifyPilotEvidenceLedger(statusTampered);
  assert.equal(statusVerification.valid, false);
  assert.ok(statusVerification.reasonCodes.includes("LEDGER_STATUS_INVALID"));
});

check("proposal-expiry-and-authority-fail-closed", () => {
  const proposal = buildPilotProposalFingerprint({
    proposalId: "proposal-adversarial-001",
    prospectAlias: "prospect-adversarial-001",
    version: "v1",
    scope,
    pricingScenario: { proposedPriceUsd: 25_000 },
    artifactFingerprint: "b".repeat(64),
    candidateReference,
    expiresAt: "2026-08-27T00:00:00.000Z",
    approvalStatus: "APPROVED_FOR_DELIVERY"
  }, new Date("2026-08-28T00:00:00.000Z"));
  assert.equal(proposal.validExpiry, false);
  assert.equal(proposal.structurallyValid, false);
  assert.equal(proposal.contractAuthorized, false);
  assert.equal(proposal.deliveryDateCommitmentAuthorized, false);
  assert.equal(proposal.protectedPilotAuthorized, false);
});

check("approval-spoof-replay-and-service-failure-fail-closed", () => {
  const verifierId = "synthetic-verifier-v1";
  const unsigned = {
    schemaVersion: "scrimed-p34-atomic-approval-v2",
    approvalId: "approval-adversarial-001",
    candidateFingerprint: "c".repeat(64),
    actionId: "synthetic-action-001",
    resourceId: "synthetic-resource-001",
    tenantId: "synthetic-tenant-001",
    environmentId: "synthetic-environment-001",
    requesterClass: "synthetic-operator",
    autonomyLevel: "A2",
    maturityLevel: "SYNTHETIC_VALIDATED",
    issuedAt: "2026-08-28T01:50:00.000Z",
    expiresAt: "2026-08-28T02:30:00.000Z",
    permittedSideEffect: "reversible-synthetic-internal-write",
    nonce: "nonce-adversarial-001",
    approverIdentityHash: "d".repeat(64),
    policyDecisionHash: "e".repeat(64)
  };
  const token = { ...unsigned, signature: createSyntheticApprovalSignature(unsigned, verifierId) };
  const expected = {
    candidateFingerprint: unsigned.candidateFingerprint,
    actionId: unsigned.actionId,
    resourceId: unsigned.resourceId,
    tenantId: unsigned.tenantId,
    environmentId: unsigned.environmentId,
    requesterClass: unsigned.requesterClass,
    autonomyLevel: unsigned.autonomyLevel,
    maturityLevel: unsigned.maturityLevel,
    permittedSideEffect: unsigned.permittedSideEffect,
    approverIdentityHash: unsigned.approverIdentityHash,
    policyDecisionHash: unsigned.policyDecisionHash
  };
  const clock = new FixedTrustedClock("2026-08-28T02:00:00.000Z");
  const verifier = createSyntheticApprovalVerifier(verifierId);
  const store = new InMemorySyntheticAtomicApprovalStore();

  const candidateSpoof = consumeAtomicApproval({
    token,
    expected: { ...expected, candidateFingerprint: "f".repeat(64) },
    clock,
    verifier,
    store: new InMemorySyntheticAtomicApprovalStore()
  });
  assert.ok(candidateSpoof.reasonCodes.includes("APPROVAL_CANDIDATE_MISMATCH"));
  assert.equal(candidateSpoof.executionAuthorized, false);

  const first = consumeAtomicApproval({ token, expected, clock, verifier, store });
  const replay = consumeAtomicApproval({ token, expected, clock, verifier, store });
  assert.equal(first.approvalConsumed, true);
  assert.equal(first.executionAuthorized, false);
  assert.ok(replay.reasonCodes.includes("APPROVAL_REPLAY_DETECTED"));

  const storeFailure = consumeAtomicApproval({
    token,
    expected,
    clock,
    verifier,
    store: { trustClass: "synthetic-test-only", consume() { throw new Error("synthetic outage"); } }
  });
  assert.ok(storeFailure.reasonCodes.includes("APPROVAL_STORE_FAILURE"));
  assert.equal(storeFailure.executionAuthorized, false);

  const verifierFailure = consumeAtomicApproval({
    token,
    expected,
    clock,
    verifier: { verifierId, trustClass: "synthetic-test-only", verify() { throw new Error("synthetic outage"); } },
    store: new InMemorySyntheticAtomicApprovalStore()
  });
  assert.ok(verifierFailure.reasonCodes.includes("APPROVAL_VERIFIER_FAILURE"));
  assert.equal(verifierFailure.executionAuthorized, false);
});

check("candidate-substitution-and-review-fuzz-never-false-green", () => {
  const current = "1".repeat(40);
  assert.equal(deriveExactHeadReviewState({
    currentHeadSha: current,
    requestedHeadSha: current,
    requestAcknowledged: true,
    disposition: "APPROVED",
    dispositionHeadSha: "2".repeat(40),
    trustedExternalReceiptValid: true
  }), "STALE");

  const malformed = [null, "", "not-a-sha", "0".repeat(39), "g".repeat(40), "../candidate"];
  for (let index = 0; index < 240; index += 1) {
    const value = malformed[index % malformed.length];
    const state = deriveExactHeadReviewState({
      currentHeadSha: value,
      requestedHeadSha: malformed[(index + 1) % malformed.length],
      requestAcknowledged: index % 2 === 0,
      disposition: index % 3 === 0 ? "APPROVED" : "NONE",
      dispositionHeadSha: malformed[(index + 2) % malformed.length],
      trustedExternalReceiptValid: true
    });
    assert.notEqual(state, "APPROVED_EXACT_HEAD");
  }
});

check("phi-secret-egress-is-redacted-and-never-forwarded", () => {
  const decision = evaluateP34EgressFirewall({
    channel: "telemetry",
    dataClassification: "public-synthetic",
    payload: {
      patientName: "Synthetic Person",
      accessToken: "synthetic-secret-marker",
      safeMetric: 1
    },
    purpose: "synthetic-assurance",
    tenantId: "synthetic-tenant-001"
  });
  assert.equal(decision.decision, "BLOCK");
  assert.equal(decision.forwardingAuthorized, false);
  assert.equal(decision.containsRawPhi, false);
  assert.equal(decision.containsSecrets, false);
  assert.equal(JSON.stringify(decision.sanitizedPayload).includes("Synthetic Person"), false);
  assert.equal(JSON.stringify(decision.sanitizedPayload).includes("synthetic-secret-marker"), false);
});

check("preview-production-escalation-is-rejected", () => {
  const expected = {
    deploymentId: "dpl_1234567890ab",
    deploymentUrl: "https://scrimed-synthetic-preview.vercel.app",
    commitSha: "3".repeat(40),
    treeSha: "4".repeat(40),
    candidateFingerprint: "5".repeat(64),
    sourceFingerprint: "6".repeat(64),
    routeInventoryFingerprint: "7".repeat(64),
    renderInventoryFingerprint: "8".repeat(64)
  };
  const result = evaluatePreviewAcceptance({
    ...expected,
    environment: "preview",
    nodeMajor: 24,
    healthPassed: true,
    readinessPassed: true,
    browserSmokePassed: true,
    apiSmokePassed: true,
    safetyBoundariesPassed: true,
    protectedWritesObserved: false,
    productionAliases: ["app.scrimedsolutions.com"],
    acceptedBy: "release-steward",
    acceptedAt: "2026-08-28T02:00:00.000Z"
  }, expected, new Date("2026-08-28T02:01:00.000Z"));
  assert.equal(result.accepted, false);
  assert.ok(result.reasonCodes.includes("PRODUCTION_ALIAS_ATTACHED"));
  assert.equal(result.productionAuthorized, false);
});

check("proposal-pricing-fuzz-remains-nonbinding-and-fingerprinted", () => {
  const fingerprints = new Set();
  for (let index = 0; index < 240; index += 1) {
    const proposal = buildPilotProposalFingerprint({
      proposalId: `proposal-fuzz-${String(index).padStart(3, "0")}`,
      prospectAlias: "prospect-adversarial-001",
      version: `v${index + 1}`,
      scope,
      pricingScenario: {
        proposedPriceUsd: index * 100,
        modelCostUsd: index % 17,
        reviewCostUsd: index % 29
      },
      artifactFingerprint: "9".repeat(64),
      candidateReference,
      expiresAt: "2026-09-10T00:00:00.000Z",
      approvalStatus: index % 2 === 0 ? "DRAFT" : "APPROVED_FOR_DELIVERY"
    }, new Date("2026-08-28T00:00:00.000Z"));
    assert.equal(proposal.agentMaySign, false);
    assert.equal(proposal.agentMayDiscount, false);
    assert.equal(proposal.contractAuthorized, false);
    assert.equal(proposal.protectedPilotAuthorized, false);
    fingerprints.add(proposal.proposalFingerprint);
  }
  assert.equal(fingerprints.size, 240);
});

console.log(`SCRIMED p.34 pilot adversarial tests: ${passed}/${passed} passed (160 manifest + 240 review + 240 proposal fuzz cases)`);
