#!/usr/bin/env node

import assert from "node:assert/strict";

import {
  authorizeClinicalAssuranceInvocation,
  evaluateConcentrationAdmission,
  evaluateModelPromotion,
  handleSupplierEvent,
  runClinicalAssuranceScenario,
  syntheticClinicalAssuranceRegistry,
  syntheticPayerIqAssuranceRequest
} from "../app/lib/clinicalAssuranceControlPlane.ts";
import { runDocumentationBeforeAuthorizationWorkbench } from "../app/lib/documentationBeforeAuthorization.ts";
import { getScrimedWorkFeatureFlags } from "../app/lib/scrimed-work/featureFlags.ts";
import { routeScrimedWorkModel } from "../app/lib/scrimed-work/modelRouter.ts";

const clone = (value) => structuredClone(value);
const at = "2026-07-18T12:00:00.000Z";

const baseline = authorizeClinicalAssuranceInvocation(
  { ...syntheticPayerIqAssuranceRequest, enforcementEnabled: true },
  clone(syntheticClinicalAssuranceRegistry)
);
assert.equal(baseline.status, "allowed");
assert.equal(baseline.modelInvocationAuthorized, true);
assert.equal(baseline.fallbackMateriallyIndependent, true);
assert.equal(baseline.humanReviewRequired, true);
assert.equal(baseline.externalProviderCallAllowed, false);
assert.equal(baseline.clinicalActionAuthority, false);
assert.equal(baseline.caseEvidenceBinding.toolArtifactDigests.length, 3);

const challengerAsPrimaryRegistry = clone(syntheticClinicalAssuranceRegistry);
challengerAsPrimaryRegistry.modelPassports[0].routeRole = "challenger";
const challengerAsPrimary = authorizeClinicalAssuranceInvocation(
  { ...syntheticPayerIqAssuranceRequest, enforcementEnabled: true },
  challengerAsPrimaryRegistry
);
assert.equal(challengerAsPrimary.status, "blocked");
assert.equal(challengerAsPrimary.blockers.includes("model-passport-exact-version"), true);

const invalidModelDigest = authorizeClinicalAssuranceInvocation(
  {
    ...syntheticPayerIqAssuranceRequest,
    requestedModel: { ...syntheticPayerIqAssuranceRequest.requestedModel, digest: "not-a-digest" },
    enforcementEnabled: true
  },
  clone(syntheticClinicalAssuranceRegistry)
);
assert.equal(invalidModelDigest.status, "blocked");
assert.equal(invalidModelDigest.blockers.includes("request-schema-and-identity"), true);

const unsignedToolRegistry = clone(syntheticClinicalAssuranceRegistry);
unsignedToolRegistry.toolPassports[0].artifactSignature.status = "missing";
const unsignedTool = authorizeClinicalAssuranceInvocation(
  { ...syntheticPayerIqAssuranceRequest, enforcementEnabled: true },
  unsignedToolRegistry
);
assert.equal(unsignedTool.status, "blocked");
assert.equal(unsignedTool.blockers.includes("signed-authorized-tool-artifacts"), true);

for (const assuranceLevel of ["CAL_2_RESTRICTED_CLINICAL", "CAL_3_SOVEREIGN_ISOLATED"]) {
  const registry = clone(syntheticClinicalAssuranceRegistry);
  registry.enclaves[0].assuranceLevel = assuranceLevel;
  registry.enclaves[0].authorizedDataClassifications = ["part-2"];
  registry.enclaves[0].egressPolicy.mode = "default-deny";
  registry.enclaves[0].egressPolicy.internetReachable = true;
  registry.modelPassports[0].artifactSignature.status = "missing";
  const decision = authorizeClinicalAssuranceInvocation(
    {
      ...syntheticPayerIqAssuranceRequest,
      requestedDataClassifications: ["part-2"],
      requestedAssuranceLevel: assuranceLevel,
      sovereignIsolationRequired: assuranceLevel === "CAL_3_SOVEREIGN_ISOLATED",
      enforcementEnabled: true
    },
    registry
  );
  assert.equal(decision.status, "blocked");
  assert.equal(decision.blockers.includes("restricted-egress-and-plane-isolation"), true);
  assert.equal(decision.blockers.includes("signed-scanned-artifact"), true);
}

const cal0Phi = authorizeClinicalAssuranceInvocation(
  {
    ...syntheticPayerIqAssuranceRequest,
    requestedDataClassifications: ["standard-phi"],
    requestedAssuranceLevel: "CAL_0_PUBLIC_ZERO_PHI",
    enforcementEnabled: true
  },
  clone(syntheticClinicalAssuranceRegistry)
);
assert.equal(cal0Phi.status, "blocked");
assert.equal(cal0Phi.resolvedAssuranceLevel, "CAL_1_STANDARD_PHI");
assert.equal(cal0Phi.modelInvocationAuthorized, false);
assert.equal(cal0Phi.blockers.includes("current-runtime-no-phi-boundary"), true);

const cal1FallbackRegistry = clone(syntheticClinicalAssuranceRegistry);
cal1FallbackRegistry.enclaves[0].assuranceLevel = "CAL_1_STANDARD_PHI";
cal1FallbackRegistry.enclaves[0].authorizedDataClassifications = ["standard-phi"];
for (const passport of cal1FallbackRegistry.modelPassports) {
  passport.authorizedAssuranceLevels = ["CAL_1_STANDARD_PHI"];
  passport.phiAuthorization = "authorized-private-only";
  passport.baaDpaStatus = "approved";
}
for (const tool of cal1FallbackRegistry.toolPassports) {
  tool.authorizedAssuranceLevels = ["CAL_1_STANDARD_PHI"];
}
cal1FallbackRegistry.modelPassports[1].baaDpaStatus = "missing";
const unapprovedPhiFallback = authorizeClinicalAssuranceInvocation(
  {
    ...syntheticPayerIqAssuranceRequest,
    requestedDataClassifications: ["standard-phi"],
    requestedAssuranceLevel: "CAL_1_STANDARD_PHI",
    enforcementEnabled: true
  },
  cal1FallbackRegistry
);
assert.equal(unapprovedPhiFallback.status, "blocked");
assert.equal(unapprovedPhiFallback.blockers.includes("materially-independent-fallback"), true);

const crossTenant = authorizeClinicalAssuranceInvocation(
  { ...syntheticPayerIqAssuranceRequest, tenantId: "synthetic-tenant-b", enforcementEnabled: true },
  clone(syntheticClinicalAssuranceRegistry)
);
assert.equal(crossTenant.status, "blocked");
assert.equal(crossTenant.blockers.includes("enclave-tenant-region-data-scope"), true);
assert.equal(crossTenant.blockers.includes("model-scope-authorized"), true);

for (const passportMutation of [
  (passport) => {
    passport.authorization.expiresAt = "2026-07-18T11:59:59.000Z";
  },
  (passport) => {
    passport.globalKillSwitch = { active: true, reason: "synthetic-drill", changedAt: at };
  },
  (passport) => {
    passport.workflowKillSwitches = [
      { workflowId: "documentation-before-authorization", active: true, reason: "synthetic-drill", changedAt: at }
    ];
  }
]) {
  const registry = clone(syntheticClinicalAssuranceRegistry);
  passportMutation(registry.modelPassports[0]);
  const decision = authorizeClinicalAssuranceInvocation(
    { ...syntheticPayerIqAssuranceRequest, enforcementEnabled: true },
    registry
  );
  assert.equal(decision.status, "blocked");
  assert.equal(decision.modelInvocationAuthorized, false);
}

const sharedFallback = runClinicalAssuranceScenario("shared-fallback-dependency");
assert.equal(sharedFallback.result.status, "blocked");
assert.equal(sharedFallback.result.fallbackMateriallyIndependent, false);
assert.equal(sharedFallback.result.blockers.includes("materially-independent-fallback"), true);

const concentrationBlocked = runClinicalAssuranceScenario("concentration-ceiling");
assert.equal(concentrationBlocked.result.status, "blocked");
assert.equal(concentrationBlocked.result.blockers.includes("concentration-budget"), true);

const registryWithException = clone(syntheticClinicalAssuranceRegistry);
registryWithException.concentrationBudgets[0].currentExposureBasisPoints = 7_999;
registryWithException.concentrationBudgets[0].exceptions = [
  {
    exceptionId: "exception-synthetic-provider",
    dimension: "provider",
    dependencyId: "synthetic-fallback",
    owner: "scrimed-risk-owner",
    justification: "bounded-synthetic-continuity-drill",
    compensatingControl: "independent-human-handoff",
    alternateRouteId: registryWithException.enclaves[0].independentFallbackRouteId,
    expiresAt: "2026-07-19T00:00:00.000Z",
    approvalEvidenceId: "approval-concentration-exception",
    exitMilestone: "reduce-provider-exposure"
  }
];
const concentrationAllowed = evaluateConcentrationAdmission({
  routeId: registryWithException.enclaves[0].primaryRouteId,
  requestExposureBasisPoints: 25,
  dependencyEdges: registryWithException.dependencyEdges,
  budgets: registryWithException.concentrationBudgets,
  at
});
assert.equal(concentrationAllowed.allowed, true);
registryWithException.concentrationBudgets[0].exceptions[0].alternateRouteId =
  registryWithException.enclaves[0].primaryRouteId;
const nonIndependentException = evaluateConcentrationAdmission({
  routeId: registryWithException.enclaves[0].primaryRouteId,
  requestExposureBasisPoints: 25,
  dependencyEdges: registryWithException.dependencyEdges,
  budgets: registryWithException.concentrationBudgets,
  at
});
assert.equal(nonIndependentException.allowed, false);
registryWithException.concentrationBudgets[0].exceptions[0].alternateRouteId =
  registryWithException.enclaves[0].independentFallbackRouteId;
registryWithException.concentrationBudgets[0].exceptions[0].expiresAt = "2026-07-18T11:59:59.000Z";
const expiredException = evaluateConcentrationAdmission({
  routeId: registryWithException.enclaves[0].primaryRouteId,
  requestExposureBasisPoints: 25,
  dependencyEdges: registryWithException.dependencyEdges,
  budgets: registryWithException.concentrationBudgets,
  at
});
assert.equal(expiredException.allowed, false);
const missingConcentrationDependencies = evaluateConcentrationAdmission({
  routeId: "route-without-material-dependencies",
  requestExposureBasisPoints: 25,
  dependencyEdges: [],
  budgets: [],
  at
});
assert.equal(missingConcentrationDependencies.allowed, false);

const supplierEvent = handleSupplierEvent({
  eventId: "supplier-event-change-control",
  supplierId: "synthetic-fallback",
  type: "change-of-control",
  severity: "high",
  effectiveAt: at,
  evidenceReference: "supplier-event-evidence"
});
assert.equal(supplierEvent.action, "reauthorize-and-simulate-routing");
assert.equal(supplierEvent.newTrafficAllowed, false);
assert.equal(supplierEvent.automaticProductionMutationAllowed, false);

const scarcity = runClinicalAssuranceScenario("capacity-scarcity");
assert.equal(scarcity.result.status, "queued");
assert.equal(scarcity.result.degradationAction, "queue");
assert.equal(scarcity.result.checks.find((check) => check.id === "capacity-admission")?.passed, false);
assert.equal(scarcity.result.caseEvidenceBinding.finalDisposition, "queued");

const versionRegistry = clone(syntheticClinicalAssuranceRegistry);
const wrongVersion = authorizeClinicalAssuranceInvocation(
  {
    ...syntheticPayerIqAssuranceRequest,
    requestedModel: { ...syntheticPayerIqAssuranceRequest.requestedModel, version: "2026-07-19" },
    enforcementEnabled: true
  },
  versionRegistry
);
assert.equal(wrongVersion.status, "blocked");
assert.equal(wrongVersion.modelPassportDigest, null);
assert.equal(wrongVersion.blockers.includes("model-passport-exact-version"), true);

const payerIq = runDocumentationBeforeAuthorizationWorkbench(
  {
    scenarioPacketId: "doc-auth-imaging-synthetic-review-ready",
    documentedRequirementIds: [
      "symptom_language",
      "functional_status",
      "visit_timing",
      "medical_necessity_rationale",
      "prior_therapy_history",
      "diagnosis_specific_evidence",
      "policy_reference",
      "recent_visit_note",
      "contraindication_context",
      "reviewer_attestation"
    ],
    reviewerStatus: "reviewed_for_demo",
    requestedAction: "draft_reviewer_packet",
    dataBoundaryAcknowledged: true
  },
  at
);
assert.equal(payerIq.valid, true);
assert.equal(payerIq.packet.caseEvidence.runtimeAuthorization.policyDecisionId, payerIq.packet.clinicalAssuranceDecision.policyDecisionId);
assert.equal(payerIq.packet.caseEvidence.runtimeAuthorization.assuranceLevel, "CAL_0_PUBLIC_ZERO_PHI");
assert.equal(payerIq.packet.caseEvidence.runtimeAuthorization.toolArtifactDigests.length, 3);
assert.equal(payerIq.packet.caseEvidence.noPhi, true);
assert.equal(payerIq.packet.caseEvidence.humanReviewRequired, true);
const serializedEvidence = JSON.stringify(payerIq.packet.caseEvidence);
assert.equal(serializedEvidence.includes("scrimedsolutions@gmail.com"), false);
assert.equal(serializedEvidence.includes("access_token"), false);
assert.equal(serializedEvidence.includes("patientName"), false);

const withdrawal = runClinicalAssuranceScenario("supplier-withdrawal");
assert.equal(withdrawal.result.status, "drill-passed-review-required");
assert.equal(withdrawal.result.fallbackActivated, true);
assert.equal(withdrawal.result.auditContinuityPreserved, true);
assert.equal(withdrawal.result.productionExecutionPerformed, false);

const defaultFlags = getScrimedWorkFeatureFlags({});
assert.equal(defaultFlags.clinicalAssuranceControlPlaneEnabled, true);
assert.equal(defaultFlags.clinicalAssuranceEnforcementEnabled, false);
assert.equal(defaultFlags.clinicalAssuranceDurableStoreEnabled, false);
assert.equal(defaultFlags.supplierContinuityAutomationEnabled, false);
assert.equal(defaultFlags.consequentialActionsEnabled, false);

const strongAggregateFailingCell = evaluateModelPromotion({
  modelId: "synthetic-challenger",
  artifactSigned: true,
  dependencyScanPassed: true,
  malwareScanPassed: true,
  sbomPresent: true,
  mlBomPresent: true,
  mandatoryCells: [
    {
      ...syntheticClinicalAssuranceRegistry.validatedDomainCells[0],
      modelId: "synthetic-challenger",
      cellId: "high-volume-aggregate-cell",
      qualityScore: 0.99,
      sampleSize: 1_000,
      safetyCritical: false
    },
    {
      ...syntheticClinicalAssuranceRegistry.validatedDomainCells[0],
      modelId: "synthetic-challenger",
      cellId: "sparse-safety-critical-cell",
      status: "restricted",
      qualityScore: 0.8,
      sampleSize: 10,
      minimumSampleSize: 40
    }
  ],
  citationGroundingPassed: true,
  calibrationPassed: true,
  toolReliabilityPassed: true,
  outputBudgetPassed: true,
  privacyPolicyPassed: true,
  reviewerBurdenPassed: true,
  canaryConfigured: true,
  observabilityConfigured: true,
  rollbackTested: true,
  humanApprovalEvidenceId: "approval-synthetic-challenger"
});
assert.equal(strongAggregateFailingCell.approved, false);
assert.equal(strongAggregateFailingCell.aggregateOverrideAllowed, false);
assert.deepEqual(strongAggregateFailingCell.failingCellIds, ["sparse-safety-critical-cell"]);

const independentRoute = routeScrimedWorkModel({
  taskType: "synthetic independent fallback handoff",
  risk: "high",
  requiredCapability: "reasoning",
  dataClassification: "synthetic-no-phi",
  latencyTargetMs: 1_000,
  budgetUsd: 1,
  tenantPolicy: "human review required",
  reasoningRequirement: "high",
  qualityThreshold: 0.95,
  domainCellId: "payeriq-synthetic-documentation-gap",
  validatedDomainCells: [
    {
      cellId: "payeriq-synthetic-documentation-gap",
      modelId: "scrimed-independent-policy-handoff",
      status: "pass",
      qualityScore: 1,
      acceptedOutcomeRate: 0.85,
      sampleSize: 120,
      minimumSampleSize: 40
    }
  ],
  eligibleModelIds: ["scrimed-independent-policy-handoff"],
  blockedModelIds: ["scrimed-synthetic-no-call"]
});
assert.equal(independentRoute.routingStatus, "selected");
assert.equal(independentRoute.provider, "independent-local-rules");
assert.equal(independentRoute.requiresHumanReview, true);

console.log("pass SCRIMED Clinical Assurance Control Plane policy tests");
