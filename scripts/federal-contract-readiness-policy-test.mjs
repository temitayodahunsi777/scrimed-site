#!/usr/bin/env node

import assert from "node:assert/strict";
import {
  buildFederalContractReadinessPacket,
  buildFederalContractReadinessPacketMarkdown,
  evaluateFederalContractReadiness,
  federalContractCheckpoints,
  federalContractReadinessInputTemplate,
  getFederalContractReadinessSummary
} from "../app/lib/federalContractReadiness.ts";

function inputWithStates(states = {}, reviews = {}) {
  return {
    ...federalContractReadinessInputTemplate,
    checkpointStates: {
      ...federalContractReadinessInputTemplate.checkpointStates,
      ...states
    },
    ...reviews
  };
}

const empty = evaluateFederalContractReadiness(inputWithStates());
assert.equal(empty.ok, true);
assert.equal(empty.assessment.decision, "operator-input-required");
assert.equal(empty.assessment.completedCheckpointCount, 0);
assert.equal(empty.assessment.authority.samRegistrationVerified, false);
assert.equal(empty.assessment.authority.primeOfferAuthorized, false);
assert.equal(empty.assessment.authority.externalSubmissionAuthorized, false);
assert.equal(empty.assessment.controlledNextAction.actionId, "resolve-sam-account-and-authorized-administrator");
assert.equal(empty.assessment.controlledNextAction.executionAuthorized, false);

const impossibleActive = evaluateFederalContractReadiness(inputWithStates({
  "sam-record-active": "evidence-recorded"
}));
assert.equal(impossibleActive.ok, true);
assert.equal(impossibleActive.assessment.decision, "blocked-remediation-required");
assert.equal(
  impossibleActive.assessment.hardStops.some((hardStop) => hardStop.includes("mandatory registration prerequisite")),
  true
);

const inProgress = evaluateFederalContractReadiness(inputWithStates({
  "sam-account-and-authorized-administrator": "evidence-recorded",
  "legal-entity-validation": "in-progress"
}));
assert.equal(inProgress.ok, true);
assert.equal(inProgress.assessment.decision, "sam-registration-in-progress");
assert.equal(inProgress.assessment.controlledNextAction.actionId, "resolve-legal-entity-validation");

const expired = evaluateFederalContractReadiness(inputWithStates({
  "sam-account-and-authorized-administrator": "evidence-recorded",
  "legal-entity-validation": "expired"
}));
assert.equal(expired.ok, true);
assert.equal(expired.assessment.decision, "registration-renewal-required");
assert.deepEqual(expired.assessment.expiredCheckpointIds, ["legal-entity-validation"]);

const allEvidenceStates = Object.fromEntries(
  federalContractCheckpoints.map((checkpoint) => [checkpoint.id, "evidence-recorded"])
);
const allEvidence = evaluateFederalContractReadiness(inputWithStates(allEvidenceStates));
assert.equal(allEvidence.ok, true);
assert.equal(allEvidence.assessment.decision, "qualified-human-review-required");
assert.equal(allEvidence.assessment.completedCheckpointCount, federalContractCheckpoints.length);

const allEvidenceAndReviews = inputWithStates(allEvidenceStates, {
  authorizedAdministratorReview: "approved",
  representationsReview: "approved",
  financeReview: "approved"
});
const readyForMarketReview = evaluateFederalContractReadiness(allEvidenceAndReviews);
assert.equal(readyForMarketReview.ok, true);
assert.equal(readyForMarketReview.assessment.decision, "federal-market-entry-review-ready");
assert.equal(readyForMarketReview.assessment.authority.samRegistrationVerified, false);
assert.equal(readyForMarketReview.assessment.authority.primeOfferAuthorized, false);
assert.equal(readyForMarketReview.assessment.controlledNextAction.actionId, "verify-active-registration-and-select-opportunity");

const prematureReviews = evaluateFederalContractReadiness(inputWithStates({}, {
  authorizedAdministratorReview: "approved",
  representationsReview: "approved",
  financeReview: "approved"
}));
assert.equal(prematureReviews.ok, true);
assert.equal(prematureReviews.assessment.decision, "blocked-remediation-required");
assert.equal(
  prematureReviews.assessment.hardStops.some((hardStop) => hardStop.includes("cannot predate")),
  true
);

const rejected = evaluateFederalContractReadiness(inputWithStates({
  "representations-certifications-complete": "rejected"
}));
assert.equal(rejected.ok, true);
assert.equal(rejected.assessment.decision, "blocked-remediation-required");
assert.deepEqual(rejected.assessment.rejectedCheckpointIds, ["representations-certifications-complete"]);

const unsupportedIdentifierField = evaluateFederalContractReadiness({
  ...inputWithStates(),
  uniqueEntityIdentifier: "synthetic-but-not-accepted"
});
assert.equal(unsupportedIdentifierField.ok, false);
assert.equal(unsupportedIdentifierField.externalSubmissionAuthorized, false);
assert.equal(unsupportedIdentifierField.errors.some((error) => error.includes("unsupported fields")), true);

const tokenLikeInput = evaluateFederalContractReadiness({
  ...inputWithStates(),
  apiToken: "Bearer synthetic-token-value"
});
assert.equal(tokenLikeInput.ok, false);
assert.equal(tokenLikeInput.errors.some((error) => error.includes("rejects credentials")), true);

const phiLikeInput = evaluateFederalContractReadiness({
  ...inputWithStates(),
  contact: "person@example.com"
});
assert.equal(phiLikeInput.ok, false);
assert.equal(phiLikeInput.errors.some((error) => error.includes("direct identifiers")), true);

const packet = buildFederalContractReadinessPacket(allEvidenceAndReviews);
const repeatedPacket = buildFederalContractReadinessPacket(allEvidenceAndReviews);
assert.equal(packet.ok, true);
assert.equal(repeatedPacket.ok, true);
assert.equal(packet.packet.packetHashSha256, repeatedPacket.packet.packetHashSha256);
assert.match(packet.packet.packetHashSha256, /^[a-f0-9]{64}$/);
assert.equal(packet.packet.contentBoundary.containsUei, false);
assert.equal(packet.packet.contentBoundary.containsCageOrNcage, false);
assert.equal(packet.packet.contentBoundary.containsTin, false);
assert.equal(packet.packet.contentBoundary.containsBankingData, false);
assert.equal(packet.packet.contentBoundary.containsCredentials, false);
assert.equal(packet.packet.contentBoundary.containsPhi, false);
assert.equal(packet.packet.externalReleaseAuthorized, false);
assert.equal(packet.packet.externalSubmissionAuthorized, false);

const markdown = buildFederalContractReadinessPacketMarkdown(inputWithStates());
assert.equal(markdown.includes("Internal metadata-only artifact"), true);
assert.equal(markdown.includes("External submission authorized: no"), true);
assert.equal(markdown.includes("Execution authorized by SCRIMED: no"), true);

const summary = getFederalContractReadinessSummary();
assert.equal(summary.status, "sam-far-readiness-active-operator-evidence-required");
assert.equal(summary.checkpointCount, 14);
assert.equal(summary.activeRegistrationCheckpointCount, 10);
assert.equal(summary.marketEntryCheckpointCount, 14);
assert.equal(summary.defaultDecision, "operator-input-required");
assert.equal(summary.entryPaths.length, 2);
assert.equal(summary.authority.samRegistrationVerified, false);
assert.equal(summary.authority.primeOfferAuthorized, false);
assert.equal(summary.authority.externalSubmissionAuthorized, false);

console.log(
  "pass federal contract readiness policy (SAM/FAR checkpoints, fail-closed state consistency, metadata-only packets, operator-controlled external actions)"
);
