#!/usr/bin/env node

import assert from "node:assert/strict";

import {
  capitalPlanningInputTemplate,
  evaluateCapitalPlan,
  evaluateFundraisingReleaseReadiness,
  getInvestorDiligenceManifestSummary,
  investorDiligenceManifest
} from "../app/lib/capitalPlanning.ts";

const inputRequired = evaluateCapitalPlan(capitalPlanningInputTemplate);
assert.equal(inputRequired.status, "input-required");
assert.equal(inputRequired.valid, false);
assert.equal(inputRequired.externalUseAuthorized, false);

const invalid = evaluateCapitalPlan({
  ...capitalPlanningInputTemplate,
  monthlyRecurringRevenueUsd: 1,
  raiseTargetUsd: 100,
  oneTimeRaiseCostsUsd: 101
});
assert.equal(invalid.status, "blocked-invalid-input");
assert.equal(invalid.valid, false);
assert.equal(invalid.externalUseAuthorized, false);
assert.equal(invalid.errors.some((error) => error.code === "raise-cost-exceeds-target"), true);

const modeled = evaluateCapitalPlan({
  monthlyRecurringRevenueUsd: 100_000,
  monthlyServicesRevenueUsd: 50_000,
  monthlyCostOfRevenueUsd: 30_000,
  monthlyOperatingExpenseUsd: 170_000,
  cashOnHandUsd: 600_000,
  raiseTargetUsd: 2_400_000,
  oneTimeRaiseCostsUsd: 100_000,
  targetRunwayMonths: 18,
  estimatedMonthsToClose: 6,
  acceptedWorkflowOutcomesPerMonth: 1_000,
  monthlyModelInfrastructureCostUsd: 10_000,
  monthlyHumanReviewCostUsd: 15_000
});

assert.equal(modeled.status, "modeled-finance-review-required");
assert.equal(modeled.valid, true);
assert.equal(modeled.externalUseAuthorized, false);
assert.equal(modeled.metrics.monthlyRevenueUsd, 150_000);
assert.equal(modeled.metrics.monthlyGrossProfitUsd, 120_000);
assert.equal(modeled.metrics.grossMarginPercent, 80);
assert.equal(modeled.metrics.monthlyNetBurnUsd, 50_000);
assert.equal(modeled.metrics.runwayBeforeRaiseMonths, 12);
assert.equal(modeled.metrics.netRaiseProceedsUsd, 2_300_000);
assert.equal(modeled.metrics.preCloseFundingGapUsd, 0);
assert.equal(modeled.metrics.cashAtCloseUsd, 2_600_000);
assert.equal(modeled.metrics.runwayAfterCloseMonths, 52);
assert.equal(modeled.metrics.minimumGrossRaiseForTargetRunwayUsd, 700_000);
assert.equal(modeled.metrics.additionalFundingGapUsd, 0);
assert.equal(modeled.metrics.recurringRevenueSharePercent, 66.7);
assert.equal(modeled.metrics.costPerAcceptedWorkflowOutcomeUsd, 25);
assert.equal(modeled.scenarios.length, 4);
assert.equal(modeled.completionRequirements.length >= 4, true);

const bridgeCapitalRequired = evaluateCapitalPlan({
  ...capitalPlanningInputTemplate,
  monthlyRecurringRevenueUsd: 100_000,
  monthlyServicesRevenueUsd: 50_000,
  monthlyCostOfRevenueUsd: 30_000,
  monthlyOperatingExpenseUsd: 170_000,
  cashOnHandUsd: 100_000,
  raiseTargetUsd: 2_400_000,
  oneTimeRaiseCostsUsd: 100_000,
  acceptedWorkflowOutcomesPerMonth: 1_000
});
assert.equal(bridgeCapitalRequired.valid, true);
assert.equal(bridgeCapitalRequired.metrics.preCloseFundingGapUsd, 200_000);
assert.equal(bridgeCapitalRequired.metrics.cashAtCloseUsd, 2_100_000);
assert.equal(bridgeCapitalRequired.metrics.minimumGrossRaiseForTargetRunwayUsd, 1_200_000);
assert.equal(
  bridgeCapitalRequired.reviewFlags.some((flag) => flag.includes("shorter than the estimated financing close period")),
  true
);

const manifest = getInvestorDiligenceManifestSummary();
assert.equal(manifest.artifactCount, 6);
assert.equal(manifest.blockingArtifactCount, 5);
assert.equal(manifest.acceptsRawEvidence, false);
assert.equal(manifest.externalReleaseAuthorized, false);

const noEvidence = evaluateFundraisingReleaseReadiness([]);
assert.equal(noEvidence.decision, "blocked-remediation-required");
assert.equal(noEvidence.requiredArtifactCount, 5);
assert.equal(noEvidence.externalReleaseAuthorized, false);

const approvedReferences = investorDiligenceManifest
  .filter((artifact) => artifact.blocksExternalFundraisingRelease)
  .map((artifact, index) => ({
    artifactId: artifact.id,
    artifactReference: `evidence-room/${artifact.id}`,
    artifactSha256: String(index + 1).padStart(64, "a"),
    reviewerRoles: artifact.requiredReviewerRoles,
    approvedAt: "2026-07-01T00:00:00.000Z",
    disposition: "approved-reference-retained"
  }));

const qualifiedReviewReady = evaluateFundraisingReleaseReadiness(approvedReferences);
assert.equal(qualifiedReviewReady.decision, "ready-for-qualified-release-review");
assert.equal(qualifiedReviewReady.reviewedReferenceCount, 5);
assert.deepEqual(qualifiedReviewReady.missingArtifactIds, []);
assert.deepEqual(qualifiedReviewReady.invalidArtifactIds, []);
assert.equal(qualifiedReviewReady.externalReleaseAuthorized, false);

const unsafeReference = evaluateFundraisingReleaseReadiness([
  {
    ...approvedReferences[0],
    artifactReference: "https://example.invalid/document?token=secret"
  }
]);
assert.equal(unsafeReference.decision, "blocked-remediation-required");
assert.deepEqual(unsafeReference.invalidArtifactIds, [approvedReferences[0].artifactId]);
assert.equal(unsafeReference.externalReleaseAuthorized, false);

assert.equal(
  investorDiligenceManifest.every(
    (artifact) =>
      artifact.requiredMetadata.length > 0 &&
      artifact.requiredReviewerRoles.length > 0 &&
      artifact.blockedContent.length > 0 &&
      artifact.nextAction.length > 0
  ),
  true
);

console.log(
  "pass capital planning policy (deterministic scenarios, metadata-only diligence, weakest-link release gate, no external authorization)"
);
