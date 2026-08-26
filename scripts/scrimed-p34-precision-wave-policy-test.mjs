import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  buildSyntheticPilotEvidencePack,
  buildSyntheticPilotCommercialHandoff,
  buildWorkflowIntelligenceAssessment,
  calculateSyntheticPilotEconomics,
  calculateVerifiedIntelligenceYield,
  evaluateSyntheticPilotBudget,
  evaluateSyntheticPilotBuyerFit,
  evaluateSyntheticPilotReadiness,
  getSyntheticPilotReadinessSummary,
  syntheticPilotProfiles,
  transitionSyntheticPilotStage
} from "../app/lib/commercial/syntheticPilotReadiness.ts";
import { getP34ReviewReadinessSummary } from "../app/lib/scrimed-p34/reviewReadiness.ts";
import { getP34AdaptiveGovernanceSummary } from "../app/lib/scrimed-p34/index.ts";
import {
  getProductConsoleApiSummary
} from "../app/lib/productConsole.ts";
import {
  getScrimedHealth,
  getScrimedReleaseReadiness
} from "../app/lib/release/vercelReleaseAssurance.ts";

let passed = 0;
function check(name, run) {
  run();
  passed += 1;
  console.log(`pass ${name}`);
}

const readyInput = {
  workflowClarity: 90,
  syntheticDataAvailability: 90,
  evidenceDesign: 90,
  buyerProblem: 85,
  technicalFit: 88,
  integrationBurden: 20,
  regulatoryExposure: 10,
  implementationEffort: 30,
  measurableOutcome: 90,
  syntheticOnly: true,
  containsPhi: false,
  productionExecutionRequested: false
};

check("synthetic-pilot-ready-with-complete-safe-input", () => {
  const decision = evaluateSyntheticPilotReadiness(readyInput);
  assert.equal(decision.status, "READY");
  assert.equal(decision.productionAuthorityGranted, false);
  assert.match(decision.decisionHash, /^[0-9a-f]{64}$/);
});

check("missing-evidence-fails-closed", () => {
  const decision = evaluateSyntheticPilotReadiness({ ...readyInput, evidenceDesign: undefined });
  assert.equal(decision.status, "NOT_READY");
  assert.ok(decision.hardStops.includes("INVALID_OR_MISSING_EVIDENCEDESIGN"));
});

check("phi-route-is-ineligible", () => {
  const decision = evaluateSyntheticPilotReadiness({ ...readyInput, containsPhi: true });
  assert.equal(decision.status, "NOT_READY");
  assert.ok(decision.hardStops.includes("PHI_PROHIBITED"));
});

check("production-execution-request-is-ineligible", () => {
  const decision = evaluateSyntheticPilotReadiness({ ...readyInput, productionExecutionRequested: true });
  assert.equal(decision.status, "NOT_READY");
  assert.ok(decision.hardStops.includes("PRODUCTION_EXECUTION_PROHIBITED"));
});

check("regulatory-exposure-forces-scope-reduction", () => {
  const decision = evaluateSyntheticPilotReadiness({ ...readyInput, regulatoryExposure: 90 });
  assert.equal(decision.status, "NOT_READY");
  assert.ok(decision.gaps.includes("REGULATORY_EXPOSURE_REQUIRES_SCOPE_REDUCTION"));
});

check("bounded-lifecycle-allows-only-next-stage", () => {
  assert.equal(transitionSyntheticPilotStage("DISCOVERY", "WORKFLOW_MAPPING").allowed, true);
  assert.equal(transitionSyntheticPilotStage("DISCOVERY", "EVALUATION").allowed, false);
  assert.equal(transitionSyntheticPilotStage("EVALUATION", "BASELINE").allowed, false);
});

check("budget-overrun-blocks-execution", () => {
  const budget = syntheticPilotProfiles[0].defaultBudget;
  const decision = evaluateSyntheticPilotBudget(budget, {
    modelCostUsd: budget.maximumModelCostUsd + 1,
    toolCalls: 1,
    runtimeMinutes: 1,
    retries: 0,
    agentDepth: 1
  });
  assert.equal(decision.status, "BLOCK");
  assert.equal(decision.executionAllowed, false);
  assert.ok(decision.exceeded.includes("MODEL_BUDGET_EXCEEDED"));
});

check("malformed-budget-usage-fails-closed", () => {
  const budget = syntheticPilotProfiles[0].defaultBudget;
  for (const invalid of [Number.NaN, Number.POSITIVE_INFINITY, -1]) {
    const decision = evaluateSyntheticPilotBudget(budget, {
      modelCostUsd: invalid,
      toolCalls: 1,
      runtimeMinutes: 1,
      retries: 0,
      agentDepth: 1
    });
    assert.equal(decision.status, "BLOCK");
    assert.equal(decision.executionAllowed, false);
    assert.ok(decision.exceeded.includes("INVALID_MODEL_COST_USAGE"));
  }
});

check("verified-intelligence-yield-requires-positive-denominator", () => {
  assert.equal(calculateVerifiedIntelligenceYield({
    acceptedUsefulOutputs: 2,
    modelCostUsd: 0,
    retries: 0,
    reviewBurdenMinutes: 0,
    corrections: 0
  }).status, "INSUFFICIENT_INPUT");
});

check("economics-do-not-invent-revenue-or-margin", () => {
  const economics = calculateSyntheticPilotEconomics({
    modelSpendUsd: 10,
    infrastructureUsd: 20,
    implementationUsd: 30,
    reviewEffortUsd: 40,
    supportBurdenUsd: 50
  });
  assert.equal(economics.totalCostUsd, 150);
  assert.equal(economics.nonbindingPriceScenarioUsd, null);
  assert.equal(economics.grossMarginPotentialPercent, null);
  assert.equal(economics.bindingQuoteAuthorized, false);
});

check("buyer-fit-never-authorizes-outreach-or-binding-action", () => {
  const fit = evaluateSyntheticPilotBuyerFit({
    segment: "health-system",
    pain: 90,
    technicalFit: 90,
    dataBurden: 10,
    integrationBurden: 10,
    regulatoryExposure: 10,
    expectedValue: 90,
    pilotFeasibility: 90
  });
  assert.equal(fit.status, "STRONG_FIT");
  assert.equal(fit.automaticOutreachAuthorized, false);
  assert.equal(fit.bindingCommercialActionAuthorized, false);
});

check("evidence-pack-is-reproducible-and-watermarked", () => {
  const profile = syntheticPilotProfiles[0];
  const readiness = evaluateSyntheticPilotReadiness(readyInput);
  const packet = buildSyntheticPilotEvidencePack({
    profile,
    readiness,
    usage: { modelCostUsd: 10, toolCalls: 10, runtimeMinutes: 10, retries: 0, agentDepth: 2 },
    valueHypothesis: {
      baselineWorkflow: "Synthetic baseline",
      pain: "Synthetic rework",
      currentCostAssumptionUsd: 100,
      currentTimeAssumptionMinutes: 100,
      currentErrorOrReworkAssumption: 5,
      expectedMechanismOfImprovement: "Bounded workflow evidence",
      measurementMethod: "Compare declared synthetic baseline and output",
      assumptionsRequired: true
    },
    candidateReference: "synthetic-test-candidate"
  });
  assert.equal(packet.watermark, "SYNTHETIC / NON-PRODUCTION");
  assert.equal(packet.productionAuthorityGranted, false);
  assert.equal(packet.bindingQuoteAuthorized, false);
  assert.equal(packet.evidenceLinks.length, profile.evidenceOutputs.length);
  assert.match(packet.evidenceHash, /^[0-9a-f]{64}$/);
  const handoff = buildSyntheticPilotCommercialHandoff(packet);
  assert.equal(handoff.draftOnly, true);
  assert.equal(handoff.contractAuthorized, false);
  assert.match(handoff.handoffHash, /^[0-9a-f]{64}$/);
  const assessment = buildWorkflowIntelligenceAssessment({ profile, valueHypothesis: packet.valueHypothesis });
  assert.equal(assessment.clinicalDiagnosisAuthorized, false);
  assert.ok(assessment.evidenceNeeds.length > 0);
});

check("profile-boundaries-prohibit-claim-and-write-actions", () => {
  for (const profile of syntheticPilotProfiles) {
    assert.ok(profile.blockedActivities.some((value) => value.includes("payer")));
    assert.ok(profile.blockedActivities.some((value) => value.includes("writeback")));
    assert.ok(profile.blockedActivities.some((value) => value.includes("binding quote")));
  }
});

check("summary-keeps-protected-and-customer-activation-blocked", () => {
  const summary = getSyntheticPilotReadinessSummary();
  assert.equal(summary.commercialReadiness.protectedPilot, "OPERATOR_PREREQUISITES_REQUIRED");
  assert.equal(summary.commercialReadiness.customerActivation, "BLOCKED");
  assert.equal(summary.package.noPhi, true);
  assert.equal(summary.package.nonproduction, true);
});

check("canonical-p34-gates-bind-synthetic-pilot-readiness", () => {
  const summary = getP34AdaptiveGovernanceSummary();
  assert.equal(summary.syntheticPilotReadiness.status, "READY");
  assert.equal(summary.gateMatrix.find((gate) => gate.gateId === "P34-39")?.status, "PASS");
  assert.equal(summary.gateMatrix.find((gate) => gate.gateId === "P34-40")?.status, "PASS");
  assert.equal(summary.syntheticPilotReadiness.commercialReadiness.customerActivation, "BLOCKED");
});

check("health-and-readiness-scopes-cannot-imply-production-readiness", () => {
  const safeEnv = { NODE_ENV: "test" };
  const health = getScrimedHealth(safeEnv, "24.19.0");
  const readiness = getScrimedReleaseReadiness(safeEnv, "24.19.0");
  assert.equal(health.scope, "process-and-application-health-only");
  assert.equal(health.productionReadinessClaimed, false);
  assert.equal(readiness.scope, "current-environment-operational-readiness-only");
  assert.equal(readiness.currentEnvironmentOnly, true);
  assert.equal(readiness.productionReadinessClaimed, false);
  assert.equal(readiness.productionReleaseAuthorized, false);
});

check("review-readiness-never-self-approves", () => {
  const head = "a".repeat(40);
  const summary = getP34ReviewReadinessSummary({
    NODE_ENV: "test",
    SCRIMED_BUILD_COMMIT_SHA: head,
    SCRIMED_P34_REVIEW_REQUESTED_HEAD_SHA: head,
    SCRIMED_P34_REVIEW_APPROVED_HEAD_SHA: head,
    SCRIMED_P34_REVIEWER_ID: "independent-reviewer",
    SCRIMED_P34_REVIEW_EXPIRES_AT: "2099-01-01T00:00:00.000Z"
  });
  assert.equal(summary.review.requestCurrent, true);
  assert.equal(summary.review.independentlyVerifiedByRuntime, false);
  assert.equal(summary.mergeAuthority.granted, false);
  assert.equal(summary.productionAuthorityGranted, false);
});

check("review-readiness-matches-current-review-map", () => {
  const map = JSON.parse(readFileSync("artifacts/review/p39-review-map.json", "utf8"));
  const summary = getP34ReviewReadinessSummary({ NODE_ENV: "test" });
  assert.equal(summary.scope.currentMappedFileCount, map.fileCount);
  assert.equal(summary.scope.currentDirectLineageFileCount, map.lineageCounts.P34_DIRECT);
  assert.equal(summary.scope.currentUnexpectedFileCount, map.unexpectedCount);
  assert.equal(summary.scope.currentMapHash, map.mapHash);
});

check("review-request-becomes-stale-when-head-moves", () => {
  const summary = getP34ReviewReadinessSummary({
    NODE_ENV: "test",
    SCRIMED_BUILD_COMMIT_SHA: "a".repeat(40),
    SCRIMED_P34_REVIEW_REQUESTED_HEAD_SHA: "b".repeat(40)
  });
  assert.equal(summary.review.state, "STALE_REVIEW_REQUEST");
  assert.equal(summary.review.requestCurrent, false);
});

check("product-console-refreshes-time-sensitive-review-state", () => {
  const previous = process.env.SCRIMED_P34_REVIEW_EXPIRES_AT;
  try {
    process.env.SCRIMED_P34_REVIEW_EXPIRES_AT = "2099-01-01T00:00:00.000Z";
    const current = getProductConsoleApiSummary().p34ReviewReadiness;
    assert.equal(current.review.evidenceFreshness, "CURRENT");
    process.env.SCRIMED_P34_REVIEW_EXPIRES_AT = "2000-01-01T00:00:00.000Z";
    const expired = getProductConsoleApiSummary().p34ReviewReadiness;
    assert.equal(expired.review.evidenceFreshness, "EXPIRED");
  } finally {
    if (previous === undefined) delete process.env.SCRIMED_P34_REVIEW_EXPIRES_AT;
    else process.env.SCRIMED_P34_REVIEW_EXPIRES_AT = previous;
  }
});

check("fuzzed-governance-inputs-never-throw", () => {
  const corpus = [undefined, null, Number.NaN, Number.POSITIVE_INFINITY, -1, 0, 50, 101, "50", {}, []];
  for (const value of corpus) {
    assert.doesNotThrow(() => evaluateSyntheticPilotReadiness({
      ...readyInput,
      workflowClarity: value,
      evidenceDesign: value
    }));
  }
});

console.log(`SCRIMED p.34 precision-wave policy tests: ${passed}/${passed} passed`);
