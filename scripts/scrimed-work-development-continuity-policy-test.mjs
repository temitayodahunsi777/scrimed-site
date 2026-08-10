#!/usr/bin/env node

import assert from "node:assert/strict";

import { buildDevelopmentContinuityPlan } from "../app/lib/scrimed-work/developmentContinuity.ts";

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

const plan = buildDevelopmentContinuityPlan({ operatingMode: safeMode });
assert.equal(plan.authorizationStatus, "NOT_EVALUATED");
assert.equal(plan.policyPostureOnly, true);
assert.equal(plan.mustInvokeReviewPolicyBeforeExecution, true);
assert.equal(plan.productionAuthorityGranted, false);
assert.equal(plan.actionCount, 18);
assert.equal(plan.actions.length, 18);
assert.equal(plan.counts.AUTOMATIC_PREFLIGHT_ELIGIBLE, 1);
assert.equal(plan.counts.EVIDENCE_REQUIRED, 1);
assert.equal(plan.counts.FOUNDER_ACCEPTANCE_REQUIRED, 3);
assert.equal(plan.counts.QUALIFIED_REVIEW_REQUIRED, 1);
assert.equal(plan.counts.PRODUCTION_AUTHORIZATION_REQUIRED, 4);
assert.equal(plan.counts.BLOCKED_BY_OPERATING_MODE, 4);
assert.equal(plan.counts.PROHIBITED, 4);
assert.equal(plan.recommendedAction?.action, "synthetic-demonstration");
assert.equal(plan.bestNextAction?.action, "synthetic-demonstration");
assert.equal(plan.recommendedAction?.automaticExecutionEligible, true);
assert.equal(plan.recommendedAction?.executionAuthorized, false);
assert.equal(plan.recommendedAction?.automationDecision.decision, "allow-synthetic-autopilot");
assert.match(plan.planFingerprint, /^[0-9a-f]{64}$/);

const sourceCommit = plan.actions.find((action) => action.action === "source-commit");
assert.equal(sourceCommit?.status, "FOUNDER_ACCEPTANCE_REQUIRED");
assert.equal(sourceCommit?.policyDecision, "FOUNDER_INTERIM_ACCEPTANCE_REQUIRED");
assert.deepEqual(sourceCommit?.missingEvidence, [
  "clean-source-manifest",
  "validation-summary",
  "secret-scan",
  "sbom"
]);
assert.equal(sourceCommit?.executionAuthorized, false);
assert.equal(sourceCommit?.expectedStrategicImpact, 5);
assert.equal(sourceCommit?.effort, "medium");
assert.equal(sourceCommit?.founderDecisionRequired, true);
assert.ok(sourceCommit?.dependencies.includes("secret scan and SBOM"));
assert.match(sourceCommit?.valueHypothesis ?? "", /immutable candidate/);

const disposableMigration = plan.actions.find(
  (action) => action.action === "disposable-migration-dry-run"
);
assert.equal(disposableMigration?.status, "EVIDENCE_REQUIRED");
assert.equal(disposableMigration?.automaticExecutionEligible, false);
assert.equal(disposableMigration?.expectedStrategicImpact, 5);
assert.equal(disposableMigration?.effort, "medium");

for (const actionName of [
  "clinical-alerting",
  "diagnosis-support",
  "treatment-support",
  "payer-decision"
]) {
  const action = plan.actions.find((candidate) => candidate.action === actionName);
  assert.equal(action?.status, "PROHIBITED");
  assert.equal(action?.preparationAllowed, false);
  assert.equal(action?.executionAuthorized, false);
}

for (const actionName of [
  "phi-processing",
  "ehr-connection",
  "device-connection",
  "clinical-execution"
]) {
  const action = plan.actions.find((candidate) => candidate.action === actionName);
  assert.equal(action?.status, "BLOCKED_BY_OPERATING_MODE");
  assert.ok(action?.operatingModeBlockReason);
  assert.equal(action?.executionAuthorized, false);
}

assert.ok(plan.actions.every((action) => action.executionAuthorized === false));
assert.ok(plan.actions.every((action) => action.externalMutationAllowed === false));
assert.equal(
  buildDevelopmentContinuityPlan({ operatingMode: safeMode }).planFingerprint,
  plan.planFingerprint
);

const evidenceMissing = buildDevelopmentContinuityPlan({
  operatingMode: safeMode,
  evidenceReferences: []
});
assert.equal(evidenceMissing.recommendedAction, null);
assert.equal(
  evidenceMissing.actions.find((action) => action.action === "synthetic-demonstration")?.status,
  "EVIDENCE_REQUIRED"
);
assert.notEqual(evidenceMissing.planFingerprint, plan.planFingerprint);

const unsafeMode = buildDevelopmentContinuityPlan({
  operatingMode: { ...safeMode, allowPHI: true }
});
assert.equal(unsafeMode.operatingMode.safeDefaultsActive, false);
assert.equal(unsafeMode.recommendedAction, null);
assert.ok(
  unsafeMode.actions
    .filter((action) => action.riskTier !== "PROHIBITED")
    .every((action) => action.status === "BLOCKED_BY_OPERATING_MODE")
);

console.log(
  "pass SCRIMED Work development continuity policy tests (authoritative tiers, evidence, operating-mode blocks, deterministic fingerprints)"
);
