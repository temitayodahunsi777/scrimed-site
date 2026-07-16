#!/usr/bin/env node

import assert from "node:assert/strict";

import {
  buildScrimedWorkReviewPreparationPayload,
  isScrimedWorkReviewPreparationReady,
  scrimedWorkReviewPreparationChecks,
  scrimedWorkReviewPreparationPolicyVersion
} from "../app/lib/scrimed-work/reviewPreparation.ts";
import { buildWorkSessionFromContract } from "../app/lib/scrimed-work/workSessionStore.ts";
import {
  collectVerificationEvidenceIds,
  verifyScrimedWorkResult
} from "../app/lib/scrimed-work/verificationEngine.ts";

assert.equal(
  scrimedWorkReviewPreparationPolicyVersion,
  "scrimed-work-review-preparation-v2026-07-15.2"
);

const payload = buildScrimedWorkReviewPreparationPayload(
  "atlas-synthetic-evaluation",
  "fixture123456"
);

assert.equal(payload.workspaceSlug, "atlas-synthetic-evaluation");
assert.equal(payload.workspaceDomain, "operations");
assert.equal(payload.riskLevel, "moderate");
assert.equal(payload.requestedAutonomy, "recommend");
assert.equal(payload.definitionOfDone.humanApprovalRequired, true);
assert.equal(payload.definitionOfDone.maximumEstimatedCostUsd, 0);
assert.ok(payload.definitionOfDone.prohibitedActions.includes("live PHI"));
assert.ok(payload.definitionOfDone.prohibitedActions.includes("payer submission"));
assert.ok(payload.definitionOfDone.prohibitedActions.includes("EHR writeback"));
assert.ok(payload.definitionOfDone.prohibitedActions.includes("external distribution"));
assert.ok(payload.definitionOfDone.requiredEvidence.includes("independent reviewer approval"));
assert.deepEqual(payload.definitionOfDone.requiredEvidence.slice(0, 3), [
  "Care coordination review SOP",
  "FHIR R4 preview contract",
  "Board brief evidence template"
]);
assert.ok(!payload.definitionOfDone.requiredEvidence.includes("mandatory verification result"));
assert.ok(payload.definitionOfDone.stoppingConditions.includes("separation of duties unavailable"));

const preparedSession = buildWorkSessionFromContract(payload);
const draftArtifact = preparedSession.artifacts[0];
assert.equal(preparedSession.evidence.length, 3);
assert.equal(collectVerificationEvidenceIds(preparedSession).length, 3);
assert.ok(
  verifyScrimedWorkResult({ session: preparedSession, artifact: draftArtifact })
    .failedCriteria.includes("required-evidence")
);

const approvedSession = {
  ...preparedSession,
  approvalCheckpoints: preparedSession.approvalCheckpoints.map((checkpoint) => ({
    ...checkpoint,
    status: "approved",
    auditHash: "scrimed-work-lifecycle-independent-review-fixture"
  }))
};
const reviewedArtifact = { ...draftArtifact, reviewStatus: "reviewed" };
const approvedVerification = verifyScrimedWorkResult({
  session: approvedSession,
  artifact: reviewedArtifact
});
assert.equal(collectVerificationEvidenceIds(approvedSession).length, 4);
assert.equal(approvedVerification.eligibleForCompletion, true);
assert.ok(
  approvedVerification.evidence.includes(
    "evidence_scrimed-work-lifecycle-independent-review-fixture"
  )
);

const passedChecks = scrimedWorkReviewPreparationChecks.map(() => ({ status: "pass" }));
assert.equal(
  isScrimedWorkReviewPreparationReady({
    checks: passedChecks,
    sessionId: "work_session_review_preparation_fixture",
    artifactId: "artifact_review_preparation_fixture"
  }),
  true
);

assert.equal(
  isScrimedWorkReviewPreparationReady({
    checks: passedChecks.map((check, index) =>
      index === 3 ? { status: "blocked" } : check
    ),
    sessionId: "work_session_review_preparation_fixture",
    artifactId: "artifact_review_preparation_fixture"
  }),
  false
);

assert.equal(
  isScrimedWorkReviewPreparationReady({
    checks: passedChecks,
    sessionId: null,
    artifactId: "artifact_review_preparation_fixture"
  }),
  false
);

assert.equal(
  isScrimedWorkReviewPreparationReady({
    checks: passedChecks,
    sessionId: "work_session_review_preparation_fixture",
    artifactId: "raw-artifact-id"
  }),
  false
);

console.log("pass SCRIMED Work independent review preparation policy behavior");
