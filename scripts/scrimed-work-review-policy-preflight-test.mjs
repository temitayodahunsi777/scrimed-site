#!/usr/bin/env node

import assert from "node:assert/strict";

import {
  buildReviewPolicyPreflight,
  parseReviewPolicyPreflightRequest
} from "../app/lib/scrimed-work/reviewPolicyPreflight.ts";

const candidateFingerprint = "a".repeat(64);
const assuranceManifestFingerprint = "b".repeat(64);
const evaluatedAt = "2026-08-08T16:00:00.000Z";
const safeMode = {
  version: "2026-07-23.synthetic-default-v1",
  syntheticOnly: true,
  allowPHI: false,
  liveClinicalExecution: false,
  productionEHRConnections: false,
  medicalDeviceConnections: false,
  emergencyMonitoring: false,
  autonomousTreatmentActions: false,
  autonomousEligibilityDecisions: false,
  autonomousPayerDecisions: false,
  faithAffectsClinicalLogic: false
};

function request(overrides = {}) {
  return {
    action: "synthetic-demonstration",
    environment: "preview",
    dataClassification: "synthetic",
    intendedUse: "investor-demo",
    candidateFingerprint,
    assuranceManifestFingerprint,
    evidenceReferences: ["preproduction-disclosure", "synthetic-mode-attestation"],
    activeConditions: [],
    workspaceSlug: "atlas-synthetic-evaluation",
    ...overrides
  };
}

function build(overrides = {}) {
  const parsed = parseReviewPolicyPreflightRequest(request(overrides));
  assert.equal(parsed.ok, true, parsed.ok ? undefined : parsed.reason);
  return buildReviewPolicyPreflight({
    request: parsed.value,
    evaluatedAt,
    operatingMode: safeMode
  });
}

const safeDemo = build();
assert.equal(safeDemo.status, "PREFLIGHT_PASSED");
assert.equal(safeDemo.policyGatePassed, true);
assert.equal(safeDemo.authorizationStatus, "NOT_EVALUATED");
assert.equal(safeDemo.callerSuppliedApprovalsAccepted, false);
assert.equal(safeDemo.executionAuthorized, false);
assert.equal(safeDemo.externalMutationAllowed, false);
assert.equal(safeDemo.productionAuthorityGranted, false);
assert.equal(safeDemo.tenantScope, "atlas-synthetic-evaluation");
assert.deepEqual(safeDemo.eligibleToolClassesAfterAuthorization, [
  "read-only",
  "reversible-write"
]);
assert.equal(safeDemo.toolAccessStatus, "NOT_AUTHORIZED");
assert.deepEqual(safeDemo.expectedCost, {
  classification: "low",
  maximumEstimatedCostUsd: 1
});
assert.deepEqual(safeDemo.expectedDuration, {
  classification: "short",
  maximumDurationMinutes: 30
});
assert.deepEqual(safeDemo.blockers, []);
assert.match(safeDemo.auditHash, /^[0-9a-f]{64}$/);
assert.equal(build().auditHash, safeDemo.auditHash);

const missingEvidence = build({ evidenceReferences: [] });
assert.equal(missingEvidence.status, "EVIDENCE_REQUIRED");
assert.equal(missingEvidence.policyGatePassed, false);
assert.deepEqual(missingEvidence.missingEvidence, [
  "preproduction-disclosure",
  "synthetic-mode-attestation"
]);
assert.ok(
  missingEvidence.blockers.some(
    (blocker) =>
      blocker.category === "evidence" &&
      blocker.code === "preproduction-disclosure"
  )
);
assert.ok(
  missingEvidence.blockers.some(
    (blocker) =>
      blocker.category === "evidence" &&
      blocker.code === "synthetic-mode-attestation"
  )
);

const founderGate = build({
  action: "preview-deployment",
  evidenceReferences: [
    "preproduction-disclosure",
    "synthetic-mode-attestation",
    "preview-smoke-plan"
  ]
});
assert.equal(founderGate.status, "FOUNDER_ACCEPTANCE_REQUIRED");
assert.equal(founderGate.founderAcceptanceRequired, true);
assert.equal(founderGate.executionAuthorized, false);
assert.ok(founderGate.approvalsNeeded.includes("founder"));
assert.ok(
  founderGate.blockers.some(
    (blocker) => blocker.category === "human-approval" && blocker.owner === "founder"
  )
);

const productionGate = build({
  action: "production-migration",
  environment: "production",
  dataClassification: "metadata",
  intendedUse: "production-activation",
  evidenceReferences: [
    "migration-dry-run",
    "migration-checksums",
    "rollback-or-forward-recovery",
    "deployment-authorization"
  ]
});
assert.equal(productionGate.status, "PRODUCTION_AUTHORIZATION_REQUIRED");
assert.deepEqual(productionGate.requiredReviewerRoles, [
  "database-owner",
  "release-authority"
]);
assert.equal(productionGate.productionAuthorityGranted, false);

const phiGate = build({
  action: "phi-processing",
  environment: "production",
  dataClassification: "phi",
  intendedUse: "production-activation",
  evidenceReferences: [
    "purpose-of-use",
    "minimum-necessary-scope",
    "retention-policy",
    "security-data-flow-review"
  ]
});
assert.equal(phiGate.status, "BLOCKED_BY_OPERATING_MODE");
assert.equal(phiGate.operatingModeBlockReason, "phi-processing-disabled");

const prohibited = build({
  action: "clinical-alerting",
  environment: "production",
  dataClassification: "phi",
  intendedUse: "production-activation",
  evidenceReferences: []
});
assert.equal(prohibited.status, "PROHIBITED");
assert.equal(prohibited.executionAuthorized, false);

const invalidContext = build({ intendedUse: "customer-go-live" });
assert.equal(invalidContext.status, "CONTEXT_REJECTED");
assert.ok(invalidContext.reasonCodes.includes("INTENDED_USE_OUTSIDE_REGISTERED_SCOPE"));

const blockedCondition = build({ activeConditions: ["contains-phi"] });
assert.equal(blockedCondition.status, "POLICY_CONDITION_BLOCKED");
assert.ok(blockedCondition.reasonCodes.includes("PROHIBITED_CONDITION:contains-phi"));

for (const [label, payload, rejectedField] of [
  [
    "caller approval assertion",
    { ...request(), qualifiedApprovals: [{ signatureVerified: true }] },
    "qualifiedApprovals"
  ],
  ["caller evaluation timestamp", { ...request(), evaluatedAt }, "evaluatedAt"],
  [
    "malformed fingerprint",
    { ...request(), candidateFingerprint: "not-a-fingerprint" },
    "candidateFingerprint"
  ],
  [
    "token-like metadata",
    { ...request(), apiToken: "nonsecret-placeholder" },
    "payload"
  ],
  [
    "invalid workspace scope",
    { ...request(), workspaceSlug: "Atlas Workspace" },
    "workspaceSlug"
  ]
]) {
  const parsed = parseReviewPolicyPreflightRequest(payload);
  assert.equal(parsed.ok, false, `${label} was accepted.`);
  assert.equal(parsed.rejectedField, rejectedField, `${label} rejected the wrong field.`);
}

console.log(
  "pass SCRIMED Work review-policy preflight tests (exact binding, server authority separation, evidence gates, operating-mode blocks, caller approval rejection)"
);
