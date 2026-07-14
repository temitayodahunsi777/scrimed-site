#!/usr/bin/env node

import assert from "node:assert/strict";

import {
  documentationBeforeAuthorizationRequirements,
  documentationBeforeAuthorizationSyntheticPackets
} from "../app/lib/documentationBeforeAuthorization.ts";
import {
  createArtifactReviewDecisionHash,
  createArtifactReviewerIdentityHash,
  evaluateArtifactReview,
  parseArtifactReviewInput
} from "../app/lib/scrimed-work/artifactReview.ts";
import {
  buildPayerIqProtectedWorkSession,
  parsePayerIqProtectedHandoffInput
} from "../app/lib/scrimed-work/payerIqHandoff.ts";
import {
  applyWorkSessionTransition,
  evaluateWorkSessionTransition
} from "../app/lib/scrimed-work/sessionLifecycle.ts";
import { detectDoomLoop } from "../app/lib/scrimed-work/verificationEngine.ts";

const sourcePacket = documentationBeforeAuthorizationSyntheticPackets.find(
  (packet) => packet.packetId === "doc-auth-imaging-synthetic-review-ready"
);
assert.ok(sourcePacket);

const protectedInput = {
  workspaceSlug: "atlas-synthetic-evaluation",
  scenarioPacketId: sourcePacket.packetId,
  documentedRequirementIds: documentationBeforeAuthorizationRequirements
    .filter((requirement) => requirement.required)
    .map((requirement) => requirement.id),
  reviewerStatus: "queued",
  requestedAction: "draft_reviewer_packet",
  dataBoundaryAcknowledged: true
};
const parsedHandoff = parsePayerIqProtectedHandoffInput(protectedInput);
assert.equal(parsedHandoff.ok, true);
assert.equal(parsedHandoff.ok && parsedHandoff.packet.status, "review-packet-prepared");

for (const unsafeInput of [
  { ...protectedInput, reviewerStatus: "reviewed_for_demo" },
  { ...protectedInput, requestedAction: "payer_submission_blocked" },
  { ...protectedInput, patientName: "Synthetic Name" },
  { ...protectedInput, accessToken: "not-accepted" }
]) {
  assert.equal(parsePayerIqProtectedHandoffInput(unsafeInput).ok, false);
}

assert.equal(
  parseArtifactReviewInput({
    disposition: "approved_for_internal_use",
    reasonCode: "revision_required"
  }).ok,
  false
);
assert.equal(
  parseArtifactReviewInput({
    disposition: "approved_for_internal_use",
    reasonCode: "evidence_and_boundaries_confirmed",
    reviewerNote: "Free text is not accepted."
  }).ok,
  false
);

assert.equal(parsedHandoff.ok, true);
if (!parsedHandoff.ok) process.exit(1);

const actor = {
  actorId: "operator-fixture-1",
  displayName: "Synthetic operator",
  role: "operator",
  tenantId: "synthetic-tenant"
};
const reviewer = { actorId: "reviewer-fixture-2", role: "reviewer" };
const { session: draftSession, artifact } = buildPayerIqProtectedWorkSession({
  packet: parsedHandoff.packet,
  actor,
  tenantId: actor.tenantId,
  workspaceSlug: protectedInput.workspaceSlug,
  idempotencySeed: "artifact-review-policy-fixture"
});

assert.equal(artifact.reviewStatus, "human_review_required");
assert.equal(artifact.exportMetadata.exportable, false);
assert.equal(draftSession.riskLevel, "high");
assert.equal(draftSession.requestedAutonomy, "prepare");

const reviewInput = {
  disposition: "approved_for_internal_use",
  reasonCode: "evidence_and_boundaries_confirmed"
};
assert.equal(
  evaluateArtifactReview({
    session: draftSession,
    artifactId: artifact.artifactId,
    actor: reviewer,
    review: reviewInput
  }).code,
  "artifact-review-state-conflict"
);

const plan = evaluateWorkSessionTransition({ session: draftSession, action: "plan" });
assert.equal(plan.allowed, true);
const planning = applyWorkSessionTransition({
  session: draftSession,
  transition: plan,
  reason: "Plan the synthetic PayerIQ evidence packet."
});
const run = evaluateWorkSessionTransition({ session: planning, action: "run" });
assert.equal(run.allowed, true);
const awaitingApproval = applyWorkSessionTransition({
  session: planning,
  transition: run,
  reason: "Prepare-only work stops for independent review."
});
assert.equal(awaitingApproval.statusHistory.at(-1)?.status, "awaiting_approval");

assert.equal(
  evaluateArtifactReview({
    session: awaitingApproval,
    artifactId: artifact.artifactId,
    actor: { actorId: "wrong-role", role: "operator" },
    review: reviewInput
  }).code,
  "artifact-review-state-conflict"
);

const approve = evaluateWorkSessionTransition({
  session: awaitingApproval,
  action: "approve",
  actor: reviewer
});
assert.equal(approve.allowed, true);
const verifying = applyWorkSessionTransition({
  session: awaitingApproval,
  transition: approve,
  reason: "Independent reviewer approved the synthetic session checkpoint."
});
const artifactLoopCheck = detectDoomLoop({
  recentSteps: verifying.statusHistory.map((record) => record.reason),
  toolCallIds: verifying.toolCalls.map((call) => call.toolId),
  outputText: artifact.content
});
assert.equal(artifactLoopCheck.loopDetected, false, JSON.stringify(artifactLoopCheck));

assert.equal(
  evaluateArtifactReview({
    session: verifying,
    artifactId: artifact.artifactId,
    actor: { actorId: actor.actorId, role: "reviewer" },
    review: reviewInput
  }).code,
  "artifact-review-separation-required"
);
assert.equal(
  evaluateArtifactReview({
    session: verifying,
    artifactId: artifact.artifactId,
    actor: { actorId: "wrong-role", role: "operator" },
    review: reviewInput
  }).code,
  "artifact-reviewer-role-required"
);

const reviewDecision = evaluateArtifactReview({
  session: verifying,
  artifactId: artifact.artifactId,
  actor: reviewer,
  review: reviewInput,
  reviewedAt: "2026-07-13T00:00:00.000Z"
});
assert.equal(reviewDecision.allowed, true, JSON.stringify(reviewDecision));
assert.equal(reviewDecision.reviewedArtifact?.reviewStatus, "reviewed");
assert.equal(reviewDecision.reviewedArtifact?.exportMetadata.exportable, false);
assert.equal(reviewDecision.reviewedArtifact?.reviewMetadata?.externalDistributionAllowed, false);
assert.equal(reviewDecision.reviewedArtifact?.reviewMetadata?.payerSubmissionAllowed, false);
assert.equal(reviewDecision.verificationEligible, true);

const expectedReviewerHash = createArtifactReviewerIdentityHash({
  actorId: reviewer.actorId,
  tenantId: actor.tenantId,
  role: reviewer.role
});
assert.equal(reviewDecision.reviewerIdentityHash, expectedReviewerHash);
assert.equal(
  reviewDecision.reviewDecisionHash,
  createArtifactReviewDecisionHash({
    sessionId: verifying.id,
    artifactId: artifact.artifactId,
    disposition: reviewInput.disposition,
    reasonCode: reviewInput.reasonCode,
    reviewerIdentityHash: expectedReviewerHash,
    verificationEligible: true
  })
);

const changeRequest = evaluateArtifactReview({
  session: verifying,
  artifactId: artifact.artifactId,
  actor: reviewer,
  review: { disposition: "changes_requested", reasonCode: "revision_required" }
});
assert.equal(changeRequest.allowed, true);
assert.equal(changeRequest.reviewedArtifact?.reviewStatus, "blocked");

assert.equal(
  detectDoomLoop({
    recentSteps: ["plan evidence", "review evidence"],
    toolCallIds: ["tool-1", "tool-2"],
    outputText: "Evidence review keeps human review active while evidence remains traceable."
  }).loopDetected,
  false
);
assert.equal(
  detectDoomLoop({
    recentSteps: [],
    toolCallIds: [],
    outputText:
      "repeat this exact four word span repeat this exact four word span repeat this exact four word span"
  }).loopDetected,
  true
);

console.log(
  "pass SCRIMED Work artifact review policy (strict input, separation, verification, cryptographic binding, boundaries, loop guard)"
);
