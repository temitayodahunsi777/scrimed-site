#!/usr/bin/env node

import assert from "node:assert/strict";

import {
  assessMarketPricingEvidence,
  buildCommercialScopeDecision,
  calculateCommercialValueScenario,
  commercialReadinessControls,
  competitivePositioningPillars,
  getCommercialStrategySummary,
  globalCommercialProfiles,
  marketPricingBenchmarks,
  pricingTiers
} from "../app/lib/commercialStrategy.ts";

const valueInput = {
  engagementGoal: "synthetic-pilot",
  annualWorkflowVolume: 50_000,
  baselineMinutesPerWorkflow: 25,
  loadedHourlyCostUsd: 75,
  eligibleCaptureRate: 0.8,
  expectedEfficiencyRate: 0.3,
  verifiedTaskRate: 0.8,
  plannedSpendUsd: 237_500
};

const firstResult = calculateCommercialValueScenario(valueInput);
const secondResult = calculateCommercialValueScenario(valueInput);

assert.deepEqual(firstResult, secondResult, "commercial value calculation must be deterministic");
assert.equal(firstResult.annualManualCostBaselineUsd, 1_562_500);
assert.equal(firstResult.estimatedVerifiedCapacityValueUsd, 300_000);
assert.equal(firstResult.estimatedVerifiedWorkflowCount, 32_000);
assert.equal(firstResult.valueToCostRatio, 1.26);
assert.equal(firstResult.estimatedBreakEvenMonths, 9.5);
assert.equal(firstResult.costPerVerifiedWorkflowUsd, 7.42);
assert.equal(firstResult.pricingAuthority, "non-binding-planning-model");
assert.equal(firstResult.humanReviewRequired, true);
assert.ok(firstResult.blockedUses.includes("binding quote or contract"));
assert.ok(firstResult.blockedUses.some((use) => use.includes("ROI")));

assert.throws(
  () => calculateCommercialValueScenario({ ...valueInput, verifiedTaskRate: 1.01 }),
  /verifiedTaskRate must be a finite number between 0 and 1/
);
assert.throws(
  () => calculateCommercialValueScenario({ ...valueInput, annualWorkflowVolume: Number.NaN }),
  /annualWorkflowVolume must be a finite number/
);
assert.throws(
  () => calculateCommercialValueScenario({ ...valueInput, annualWorkflowVolume: 100.5 }),
  /annualWorkflowVolume must be a whole number/
);

const unsupportedValue = calculateCommercialValueScenario({
  ...valueInput,
  eligibleCaptureRate: 0,
  expectedEfficiencyRate: 0,
  verifiedTaskRate: 0
});
assert.equal(unsupportedValue.status, "value-hypothesis-not-yet-supported-by-inputs");
assert.equal(unsupportedValue.estimatedBreakEvenMonths, null);

const boundedAssessment = buildCommercialScopeDecision({
  engagementGoal: "assessment",
  workflowCount: 2,
  siteCount: 1,
  regionCount: 1,
  protectedEnvironmentRequested: false
});
assert.equal(boundedAssessment.status, "ready-for-human-scoping");
assert.equal(boundedAssessment.recommendedTier, "Workflow Intelligence Assessment");
assert.equal(boundedAssessment.bindingQuoteAuthorized, false);
assert.equal(boundedAssessment.productionAuthorityGranted, false);
assert.equal(boundedAssessment.humanReviewRequired, true);
assert.throws(
  () => buildCommercialScopeDecision({
    engagementGoal: "assessment",
    workflowCount: 1.5,
    siteCount: 1,
    regionCount: 1,
    protectedEnvironmentRequested: false
  }),
  /workflowCount must be a whole number/
);

const mismatchedProtectedScope = buildCommercialScopeDecision({
  engagementGoal: "synthetic-pilot",
  workflowCount: 2,
  siteCount: 1,
  regionCount: 1,
  protectedEnvironmentRequested: true
});
assert.equal(mismatchedProtectedScope.status, "scope-mismatch-requires-human-rescoping");
assert.ok(mismatchedProtectedScope.requiredGates.includes("security and privacy review"));
assert.ok(mismatchedProtectedScope.requiredGates.includes("separate production and PHI authorization"));

const multiRegionScope = buildCommercialScopeDecision({
  engagementGoal: "protected-pilot",
  workflowCount: 4,
  siteCount: 8,
  regionCount: 2,
  protectedEnvironmentRequested: true
});
assert.equal(multiRegionScope.status, "ready-for-human-scoping");
assert.ok(multiRegionScope.requiredGates.some((gate) => gate.includes("regional counsel")));

assert.equal(pricingTiers.length, 6);
for (const tier of pricingTiers) {
  assert.ok(tier.priceRange.minimumUsd >= 0);
  assert.ok(tier.priceRange.maximumUsd >= tier.priceRange.minimumUsd);
  assert.ok(tier.proposalGate.length > 20);
  if (tier.priceRange.minimumUsd > 0) {
    assert.notEqual(tier.pricingAuthority, "public-no-charge");
  }
}

const customScopeTiers = [
  "Synthetic Pilot Evaluation",
  "Protected Enterprise Pilot",
  "Enterprise Operating License",
  "Strategic Platform Partnership"
];
for (const tierName of customScopeTiers) {
  const tier = pricingTiers.find((candidate) => candidate.name === tierName);
  assert.ok(tier, `${tierName} must remain in the canonical pricing registry`);
  assert.equal(tier.publicPricingPolicy, "CUSTOM_SCOPE_REQUIRED");
  assert.equal(tier.priceRange.customScope, true);
  assert.equal(tier.priceRange.minimumUsd, 0);
  assert.equal(tier.priceRange.maximumUsd, 0);
  assert.doesNotMatch(tier.recommendedDisplayPrice, /\$|\b\d+(?:\.\d+)?\s*[mk]\b/i);
}
const protectedPilotTier = pricingTiers.find((tier) => tier.name === "Protected Enterprise Pilot");
assert.match(protectedPilotTier?.recommendedDisplayPrice ?? "", /security, privacy, insurance/);
const enterpriseLicenseTier = pricingTiers.find((tier) => tier.name === "Enterprise Operating License");
assert.match(enterpriseLicenseTier?.recommendedDisplayPrice ?? "", /technical, security, legal/);

const approvedMarketHosts = new Set([
  "www.getfreed.ai",
  "www.heidihealth.com",
  "www.abridge.com",
  "redoxengine.com"
]);
assert.equal(marketPricingBenchmarks.length, 4);
for (const benchmark of marketPricingBenchmarks) {
  assert.equal(benchmark.evidenceStatus, "first-party-public");
  assert.equal(benchmark.lastVerified, "2026-08-01");
  assert.equal(benchmark.reviewDue, "2026-10-30");
  assert.ok(approvedMarketHosts.has(new URL(benchmark.sourceUrl).hostname));
  assert.ok(benchmark.comparisonBoundary.length > 40);
}

const currentMarketEvidence = assessMarketPricingEvidence("2026-08-01");
assert.equal(currentMarketEvidence.status, "current");
assert.equal(currentMarketEvidence.currentCount, marketPricingBenchmarks.length);
assert.equal(currentMarketEvidence.reviewDueCount, 0);
assert.equal(currentMarketEvidence.staleCount, 0);
assert.equal(currentMarketEvidence.competitiveComparisonAllowed, true);
assert.equal(currentMarketEvidence.nextReviewDue, "2026-10-30");

const reviewDueMarketEvidence = assessMarketPricingEvidence("2026-10-20");
assert.equal(reviewDueMarketEvidence.reviewDueCount, marketPricingBenchmarks.length);
assert.equal(reviewDueMarketEvidence.staleCount, 0);
assert.equal(reviewDueMarketEvidence.competitiveComparisonAllowed, true);

const staleMarketEvidence = assessMarketPricingEvidence("2026-10-31");
assert.equal(staleMarketEvidence.status, "review-required");
assert.equal(staleMarketEvidence.staleCount, marketPricingBenchmarks.length);
assert.equal(staleMarketEvidence.competitiveComparisonAllowed, false);
assert.ok(staleMarketEvidence.decisionRule.includes("cannot be used"));

assert.throws(() => assessMarketPricingEvidence("2026-02-30"), /valid calendar date/);

assert.ok(competitivePositioningPillars.length >= 6);
assert.ok(
  competitivePositioningPillars.some(
    (pillar) => pillar.pillar === "Optional FaithCore separation" && pillar.blockedClaim.includes("never influences")
  )
);
assert.ok(globalCommercialProfiles.length >= 4);
assert.ok(globalCommercialProfiles.every((profile) => profile.retainedGates.length >= 4));
assert.ok(commercialReadinessControls.some((control) => control.dimension === "safety" && control.status === "enforced-in-code"));
assert.ok(commercialReadinessControls.some((control) => control.dimension === "privacy" && control.status === "enforced-in-code"));
assert.ok(commercialReadinessControls.some((control) => control.dimension === "global-positioning" && control.status === "external-review-required"));

const summary = getCommercialStrategySummary("2026-08-01");
assert.equal(summary.status, "commercial-planning-model-active-pre-commercial");
assert.equal(summary.authority.pricingAuthority, "non-binding-planning-ranges");
assert.equal(summary.authority.contractAuthority, "not-granted");
assert.equal(summary.authority.productionAuthority, "not-production-authorized");
assert.equal(summary.authority.customerActivationAuthority, "not-customer-go-live-approval");
assert.equal(summary.valuePlanner.status, "browser-only-no-data-persistence");
assert.equal(summary.sourceCounts.marketBenchmarkCount, marketPricingBenchmarks.length);
assert.equal(summary.sourceCounts.currentMarketBenchmarkCount, marketPricingBenchmarks.length);
assert.equal(summary.sourceCounts.staleMarketBenchmarkCount, 0);
assert.equal(summary.marketEvidenceReview.competitiveComparisonAllowed, true);
assert.equal(
  summary.pricingTiers.find((tier) => tier.name === "Protected Enterprise Pilot")?.publicPricingPolicy,
  "CUSTOM_SCOPE_REQUIRED"
);
assert.equal(
  summary.pricingTiers.find((tier) => tier.name === "Enterprise Operating License")?.publicPricingPolicy,
  "CUSTOM_SCOPE_REQUIRED"
);

console.log("pass commercial pricing policy");
