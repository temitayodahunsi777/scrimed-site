#!/usr/bin/env node

import assert from "node:assert/strict";

import {
  calculateEconomicUnitModel,
  evaluateCapitalEfficiencyBudget
} from "../app/lib/economicUnitModel.ts";
import { getInvestorReadinessScorecard } from "../app/lib/investorReadinessScorecard.ts";
import {
  buildPostPr25EvidenceGraph,
  verifyPlatformEvidenceGraph
} from "../app/lib/platformEvidenceGraph.ts";
import { getPostPr25PlatformAdvanceSummary } from "../app/lib/postPr25PlatformAdvance.ts";
import { resolvePublicClaim } from "../app/lib/publicClaimResolver.ts";
import { platformMoatRegistry } from "../app/lib/scrimed-control-plane/platformStrategy.ts";
import { buildDevelopmentContinuityPlan } from "../app/lib/scrimed-work/developmentContinuity.ts";
import { getStrategicPartnerReadinessSummary } from "../app/lib/strategicPartnerReadiness.ts";
import {
  buildDocumentationAuthorizationPilot,
  buildSyntheticPilotEvidencePack
} from "../app/lib/syntheticPilotFactory.ts";

const summary = getPostPr25PlatformAdvanceSummary();
assert.equal(summary.frozenReviewBaseline.headSha, "c15a79c76d59a2f94bb7f999469da8bbc1618d8c");
assert.equal(summary.release.currentState, "REVIEW_REQUESTED");
assert.equal(summary.mergeReadiness.status, "NOT_READY_FOR_MERGE");
assert.equal(
  summary.exactHeadReview.bindingVersion,
  "scrimed-exact-head-review-binding-v4-2026-08-10"
);
assert.ok(
  summary.mergeReadiness.reasonCodes.includes("merge-exact-head-approval-missing")
);
assert.equal(summary.productionAuthorityGranted, false);
assert.equal(summary.externalActionsExecuted, false);

const investor = getInvestorReadinessScorecard();
assert.equal(investor.dimensions.length, 14);
assert.ok(investor.dimensions.every((dimension) => dimension.evidenceSources.length > 0));
assert.ok(investor.dimensions.every((dimension) => dimension.deficiencies.length > 0));
assert.match(investor.boundary, /does not imply investment/i);

const partners = getStrategicPartnerReadinessSummary();
assert.equal(partners.profileCount, 13);
assert.ok(
  partners.profiles.every(
    (entry) => entry.disclaimer === "Strategic readiness profile — no partnership implied."
  )
);
assert.equal(partners.externalActionsExecuted, false);

assert.equal(platformMoatRegistry.length, 13);
assert.ok(platformMoatRegistry.every((entry) => entry.replicationDifficulty >= 1));
assert.ok(platformMoatRegistry.every((entry) => entry.evidenceNeeded.length > 0));
assert.ok(platformMoatRegistry.every((entry) => entry.dependencies.length > 0));
assert.ok(platformMoatRegistry.every((entry) => entry.monetizationRelevance.length > 0));

const graph = buildPostPr25EvidenceGraph();
assert.deepEqual(verifyPlatformEvidenceGraph(graph).failures, []);
const tamperedGraph = structuredClone(graph);
tamperedGraph.nodes[0].label = "tampered";
assert.equal(verifyPlatformEvidenceGraph(tamperedGraph).valid, false);

const unsupportedClaim = resolvePublicClaim({
  claim: {
    claimId: "claim:unsupported-denial-result",
    text: "SCRIMED reduces denials by 40%.",
    evidenceIds: ["source:pr25-exact-head"],
    evidenceMaturityRequired: "external-validated",
    owner: "Claims Governance",
    reviewDate: "2026-08-09T21:01:09.000Z",
    publicationAuthorized: false,
    syntheticOrEstimated: false
  },
  graph
});
assert.equal(unsupportedClaim.decision, "BLOCK");
assert.equal(unsupportedClaim.publishable, false);

const unpublishedQualitativeClaim = resolvePublicClaim({
  claim: {
    claimId: "claim:unpublished-internal-narrative",
    text: "SCRIMED is building governed healthcare intelligence infrastructure.",
    evidenceIds: ["claim:investor-platform-narrative", "source:pr25-exact-head"],
    evidenceMaturityRequired: "local-verified",
    owner: "Claims Governance",
    reviewDate: "2026-08-09T21:01:09.000Z",
    publicationAuthorized: false,
    syntheticOrEstimated: false
  },
  graph
});
assert.equal(unpublishedQualitativeClaim.decision, "BLOCK");
assert.equal(unpublishedQualitativeClaim.publishable, false);
assert.ok(
  unpublishedQualitativeClaim.reasonCodes.includes(
    "public-claim-publication-approval-missing"
  )
);

const economics = calculateEconomicUnitModel({
  scenarioId: "policy-test",
  evidenceTag: "SIMULATED",
  attemptedTasks: 10,
  verifiedSuccessfulTasks: 5,
  inferenceCostUsd: 10,
  infrastructureCostUsd: 10,
  reviewCostUsd: 20,
  implementationCostUsd: 40,
  supportCostUsd: 10,
  retryCostUsd: 5,
  correctionCostUsd: 5,
  workflowValuePerVerifiedTaskUsd: null,
  contractedRevenuePerVerifiedTaskUsd: null
});
assert.equal(economics.totalCostUsd, 100);
assert.equal(economics.costPerVerifiedTaskUsd, 20);
assert.equal(economics.grossMarginEstimate, null);
assert.equal(economics.productionMetric, false);

const budget = evaluateCapitalEfficiencyBudget({
  budget: {
    dailyCapUsd: 10,
    monthlyCapUsd: 100,
    taskCapUsd: 4,
    providerConcentrationCap: 0.7
  },
  currentDailySpendUsd: 8,
  currentMonthlySpendUsd: 50,
  proposedTaskCostUsd: 5,
  providerConcentration: 0.8
});
assert.equal(budget.decision, "HARD_STOP");
assert.equal(budget.externalSpendExecuted, false);

const pilot = buildDocumentationAuthorizationPilot();
const pilotPack = buildSyntheticPilotEvidencePack(pilot);
assert.equal(pilot.externalActionsEnabled, false);
assert.equal(pilotPack.label, "SYNTHETIC");
assert.equal(pilotPack.outcomes.length, 0);
assert.equal(pilotPack.cost, "UNAVAILABLE");
assert.equal(pilotPack.productionAuthorityGranted, false);

const continuity = buildDevelopmentContinuityPlan();
assert.ok(continuity.bestNextAction);
assert.ok(continuity.bestLowRiskAction);
assert.ok(continuity.bestMoatAction);
assert.ok(continuity.bestRevenueAction);
assert.ok(continuity.bestInvestorReadinessAction);
assert.ok(continuity.actions.every((action) => action.strategicValueScore >= 0));

console.log(
  "pass post-PR25 platform advancement policy tests (review/release separation, investor and partner truthfulness, moats, evidence integrity, claims, economics, pilots, and strategic planning)"
);
