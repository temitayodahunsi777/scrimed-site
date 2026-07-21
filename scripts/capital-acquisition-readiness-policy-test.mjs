#!/usr/bin/env node

import assert from "node:assert/strict";

import {
  capitalAccessLanes,
  evaluatePublicSectorOpportunity,
  getCapitalAcquisitionReadinessSummary,
  officialReadinessSources,
  publicSectorOpportunityInputTemplate,
  publicSectorReadinessGates
} from "../app/lib/capitalAcquisitionReadiness.ts";
import {
  buildCapitalAcquisitionCapturePacket,
  buildCapitalAcquisitionCapturePacketMarkdown,
  getCapitalAcquisitionCapturePacketSummary
} from "../app/lib/capitalAcquisitionCapturePacket.ts";

const empty = evaluatePublicSectorOpportunity(publicSectorOpportunityInputTemplate);
assert.equal(empty.decision, "input-required");
assert.equal(empty.externalSubmissionAuthorized, false);
assert.equal(empty.completedGateCount, 0);

const unsafeClinicalScope = evaluatePublicSectorOpportunity({
  ...publicSectorOpportunityInputTemplate,
  officialNotice: "verified-current",
  deadline: "open",
  scopeFit: "high",
  applicableRegistration: "verified-current",
  programEligibility: "verified-eligible",
  requiresAutonomousClinicalAction: true
});
assert.equal(unsafeClinicalScope.decision, "blocked-no-bid");
assert.equal(unsafeClinicalScope.hardStops.some((stop) => stop.includes("autonomous clinical")), true);
assert.equal(unsafeClinicalScope.externalSubmissionAuthorized, false);

const staleRegistration = evaluatePublicSectorOpportunity({
  ...publicSectorOpportunityInputTemplate,
  officialNotice: "verified-current",
  deadline: "open",
  scopeFit: "high",
  applicableRegistration: "expired",
  programEligibility: "verified-eligible"
});
assert.equal(staleRegistration.decision, "blocked-no-bid");
assert.equal(staleRegistration.hardStops.some((stop) => stop.includes("registration evidence is expired")), true);

const notEligible = evaluatePublicSectorOpportunity({
  ...publicSectorOpportunityInputTemplate,
  officialNotice: "verified-current",
  deadline: "open",
  scopeFit: "high",
  applicableRegistration: "verified-current",
  programEligibility: "not-eligible"
});
assert.equal(notEligible.decision, "blocked-no-bid");
assert.equal(notEligible.externalSubmissionAuthorized, false);

const coreGatesPass = evaluatePublicSectorOpportunity({
  ...publicSectorOpportunityInputTemplate,
  officialNotice: "verified-current",
  deadline: "open",
  scopeFit: "medium",
  applicableRegistration: "verified-current",
  programEligibility: "verified-eligible"
});
assert.equal(coreGatesPass.decision, "qualified-bid-review-required");
assert.equal(coreGatesPass.missingGateIds.includes("human-bid-approval-retained"), true);
assert.equal(coreGatesPass.externalSubmissionAuthorized, false);

const allInternalGatesPass = evaluatePublicSectorOpportunity({
  ...publicSectorOpportunityInputTemplate,
  officialNotice: "verified-current",
  deadline: "open",
  scopeFit: "high",
  applicableRegistration: "verified-current",
  programEligibility: "verified-eligible",
  solicitationCompliance: "approved",
  securityPrivacyReview: "approved",
  financeDeliveryReview: "approved",
  evidenceReadiness: "approved",
  humanBidApproval: "approved"
});
assert.equal(allInternalGatesPass.decision, "ready-for-human-submission-review");
assert.equal(allInternalGatesPass.completedGateCount, allInternalGatesPass.totalGateCount);
assert.deepEqual(allInternalGatesPass.missingGateIds, []);
assert.equal(allInternalGatesPass.externalSubmissionAuthorized, false);
assert.equal(allInternalGatesPass.contractAwardAuthority, "not-contract-award");
assert.equal(allInternalGatesPass.grantAwardAuthority, "not-grant-award");

const rejectedReview = evaluatePublicSectorOpportunity({
  ...publicSectorOpportunityInputTemplate,
  officialNotice: "verified-current",
  deadline: "open",
  scopeFit: "high",
  applicableRegistration: "verified-current",
  programEligibility: "verified-eligible",
  solicitationCompliance: "approved",
  securityPrivacyReview: "rejected"
});
assert.equal(rejectedReview.decision, "blocked-no-bid");
assert.equal(rejectedReview.hardStops.some((stop) => stop.includes("mandatory human review rejected")), true);

const emptyCapturePacket = buildCapitalAcquisitionCapturePacket({
  opportunity: publicSectorOpportunityInputTemplate
});
assert.equal(emptyCapturePacket.ok, true);
assert.equal(emptyCapturePacket.packet.readiness, "template-input-required");
assert.equal(emptyCapturePacket.packet.releaseControls.externalReleaseAuthorized, false);
assert.equal(emptyCapturePacket.packet.releaseControls.externalSubmissionAuthorized, false);
assert.equal(emptyCapturePacket.packet.fingerprintBinding, "missing-exact-fingerprints");

const unsafeCapturePacket = buildCapitalAcquisitionCapturePacket({
  opportunity: {
    ...publicSectorOpportunityInputTemplate,
    officialNotice: "verified-current",
    deadline: "open",
    scopeFit: "high",
    applicableRegistration: "verified-current",
    programEligibility: "verified-eligible",
    requiresLivePhi: true
  }
});
assert.equal(unsafeCapturePacket.ok, true);
assert.equal(unsafeCapturePacket.packet.readiness, "blocked-no-bid");
assert.equal(unsafeCapturePacket.packet.assessment.hardStops.some((stop) => stop.includes("live PHI")), true);
assert.equal(unsafeCapturePacket.packet.releaseControls.externalSubmissionAuthorized, false);

const invalidFingerprintPacket = buildCapitalAcquisitionCapturePacket({
  opportunity: publicSectorOpportunityInputTemplate,
  fingerprints: { candidateSha256: "not-a-sha-256" }
});
assert.equal(invalidFingerprintPacket.ok, false);
assert.equal(invalidFingerprintPacket.externalReleaseAuthorized, false);
assert.equal(invalidFingerprintPacket.externalSubmissionAuthorized, false);
assert.equal(invalidFingerprintPacket.errors.some((error) => error.includes("SHA-256")), true);

const exactFingerprint = "a".repeat(64);
const completeInternalCapturePacket = buildCapitalAcquisitionCapturePacket({
  opportunity: {
    ...publicSectorOpportunityInputTemplate,
    officialNotice: "verified-current",
    deadline: "open",
    scopeFit: "high",
    applicableRegistration: "verified-current",
    programEligibility: "verified-eligible",
    solicitationCompliance: "approved",
    securityPrivacyReview: "approved",
    financeDeliveryReview: "approved",
    evidenceReadiness: "approved",
    humanBidApproval: "approved"
  },
  fingerprints: {
    opportunityReferenceSha256: exactFingerprint,
    candidateSha256: "b".repeat(64),
    sourceTreeSha256: "c".repeat(64),
    packetArtifactSha256: "d".repeat(64)
  }
});
assert.equal(completeInternalCapturePacket.ok, true);
assert.equal(
  completeInternalCapturePacket.packet.readiness,
  "internal-human-submission-review-packet-ready"
);
assert.equal(
  completeInternalCapturePacket.packet.fingerprintBinding,
  "complete-unverified-human-review-required"
);
assert.equal(completeInternalCapturePacket.packet.releaseControls.externalReleaseAuthorized, false);
assert.equal(completeInternalCapturePacket.packet.releaseControls.investorSolicitationAuthorized, false);
assert.equal(completeInternalCapturePacket.packet.releaseControls.externalSubmissionAuthorized, false);
assert.equal(completeInternalCapturePacket.packet.releaseControls.containsRawProposal, false);
assert.equal(completeInternalCapturePacket.packet.releaseControls.containsPhi, false);
assert.equal(completeInternalCapturePacket.packet.requiredReviewers.length > 0, true);
assert.equal(completeInternalCapturePacket.packet.complianceMatrix.length, publicSectorReadinessGates.length);
assert.equal(completeInternalCapturePacket.packet.proofArtifacts.some((artifact) => artifact.id === "diligence-share-guard"), true);

const captureMarkdown = buildCapitalAcquisitionCapturePacketMarkdown({
  opportunity: publicSectorOpportunityInputTemplate
});
assert.equal(captureMarkdown.includes("Internal metadata-only artifact"), true);
assert.equal(captureMarkdown.includes("External submission authorized: no"), true);
assert.equal(captureMarkdown.includes("Contract or grant award authority: no"), true);

const captureSummary = getCapitalAcquisitionCapturePacketSummary();
assert.equal(captureSummary.status, "capital-acquisition-capture-packet-active-internal-metadata-only");
assert.equal(captureSummary.supportedLaneCount, 5);
assert.equal(captureSummary.defaultExternalReleaseAuthorized, false);
assert.equal(captureSummary.defaultExternalSubmissionAuthorized, false);
assert.equal(captureSummary.containsRawProposal, false);
assert.equal(captureSummary.containsRegistrationIdentifiers, false);
assert.equal(captureSummary.containsCredentials, false);
assert.equal(captureSummary.containsPhi, false);

assert.equal(capitalAccessLanes.length, 7);
assert.equal(publicSectorReadinessGates.length >= 10, true);
assert.equal(publicSectorReadinessGates.some((gate) => gate.id === "human-submission-authorization"), true);
assert.equal(publicSectorReadinessGates.some((gate) => gate.blockedClaims.includes("contract awarded")), true);
assert.equal(
  capitalAccessLanes.every(
    (lane) =>
      lane.requiredEvidence.length > 0 &&
      lane.requiredReviewers.length > 0 &&
      lane.blockedClaims.length > 0 &&
      lane.nextAction.length > 0
  ),
  true
);

assert.equal(officialReadinessSources.length >= 12, true);
assert.equal(
  officialReadinessSources.every(
    (source) =>
      source.url.startsWith("https://") &&
      !source.url.includes("example.") &&
      source.reviewedAt.length > 0 &&
      source.freshnessPolicy.length > 0
  ),
  true
);

const summary = getCapitalAcquisitionReadinessSummary();
assert.equal(summary.status, "capital-and-public-sector-readiness-active-evidence-gated");
assert.equal(summary.authority.registrationsVerified, false);
assert.equal(summary.authority.certificationsVerified, false);
assert.equal(summary.authority.eligibilityVerified, false);
assert.equal(summary.authority.pastPerformanceVerified, false);
assert.equal(summary.authority.governmentAwardVerified, false);
assert.equal(summary.authority.externalSubmissionAuthorized, false);
assert.equal(summary.authority.investorSolicitationAuthorized, false);
assert.equal(
  summary.federalContractReadiness.status,
  "sam-far-readiness-active-operator-evidence-required"
);
assert.equal(summary.federalContractReadiness.checkpointCount, 14);
assert.equal(summary.federalContractReadiness.defaultDecision, "operator-input-required");
assert.equal(summary.federalContractReadiness.officialSources.length, 7);
assert.equal(summary.federalContractReadiness.authority.samRegistrationVerified, false);
assert.equal(summary.federalContractReadiness.authority.primeOfferAuthorized, false);
assert.equal(summary.federalContractReadiness.authority.externalSubmissionAuthorized, false);

console.log(
  "pass capital acquisition readiness policy (official-source gates, weakest-link bid review, internal capture packet, clinical hard stops, no release, submission, or award authority)"
);
