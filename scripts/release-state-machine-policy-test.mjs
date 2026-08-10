#!/usr/bin/env node

import assert from "node:assert/strict";

import {
  currentPr25ReleaseState,
  evaluateReleaseTransition,
  getReleaseStateSummary
} from "../app/lib/releaseStateMachine.ts";

assert.equal(currentPr25ReleaseState, "REVIEW_REQUESTED");
assert.equal(getReleaseStateSummary().mutationAuthorityGranted, false);

const approvalMissing = evaluateReleaseTransition({
  from: "REVIEW_REQUESTED",
  to: "REVIEW_APPROVED"
});
assert.equal(approvalMissing.allowed, false);
assert.deepEqual(approvalMissing.missingEvidence, ["exactHeadReviewApproved"]);

const reviewApproved = evaluateReleaseTransition({
  from: "REVIEW_REQUESTED",
  to: "REVIEW_APPROVED",
  evidence: { exactHeadReviewApproved: true }
});
assert.equal(reviewApproved.allowed, true);
assert.equal(reviewApproved.mergePerformed, false);
assert.equal(reviewApproved.deploymentPerformed, false);

const reviewDoesNotMerge = evaluateReleaseTransition({
  from: "REVIEW_REQUESTED",
  to: "MERGED",
  evidence: { exactHeadReviewApproved: true }
});
assert.equal(reviewDoesNotMerge.allowed, false);

const mergeNeedsSeparateAuthority = evaluateReleaseTransition({
  from: "REVIEW_APPROVED",
  to: "MERGE_AUTHORIZED",
  evidence: { exactHeadReviewApproved: true }
});
assert.equal(mergeNeedsSeparateAuthority.allowed, false);
assert.ok(mergeNeedsSeparateAuthority.missingEvidence.includes("mergeAuthorizationVerified"));

const productionNeedsSeparateAuthority = evaluateReleaseTransition({
  from: "PRODUCTION_AUTHORIZATION_REQUIRED",
  to: "PRODUCTION_DEPLOYED",
  evidence: { previewVerified: true }
});
assert.equal(productionNeedsSeparateAuthority.allowed, false);
assert.ok(
  productionNeedsSeparateAuthority.missingEvidence.includes(
    "productionAuthorizationVerified"
  )
);

const noSkipToProduction = evaluateReleaseTransition({
  from: "MERGED",
  to: "PRODUCTION_DEPLOYED",
  evidence: {
    productionAuthorizationVerified: true,
    productionDeploymentReceiptVerified: true,
    rollbackReady: true
  }
});
assert.equal(noSkipToProduction.allowed, false);

console.log(
  "pass release state-machine tests (bounded transitions, separate review/merge/production authority, rollback evidence, and no skipped states)"
);
