#!/usr/bin/env node

import assert from "node:assert/strict";

import {
  buildStrategicInvestorMeetingBrief,
  evaluateInvestorEngagementAction,
  getParallelFundingTrack,
  getStrategicInvestorMeetingProfile,
  strategicFundingReadinessControls,
  strategicInvestorMeetingProfiles
} from "../app/lib/strategicInvestorOutreach.ts";

assert.equal(strategicInvestorMeetingProfiles.length, 4);
assert.equal(new Set(strategicInvestorMeetingProfiles.map((profile) => profile.targetId)).size, 4);

for (const profile of strategicInvestorMeetingProfiles) {
  assert.equal(profile.packetStatus, "internal-meeting-preparation-ready-external-release-review-required");
  assert.equal(profile.fundingPathStatus, "no-public-direct-investment-application-verified");
  assert.equal(profile.externalReleaseAuthorized, false);
  assert.equal(profile.agenda.length >= 6, true);
  assert.equal(profile.demoSequence.length >= 4, true);
  assert.equal(profile.diligenceQuestions.length >= 4, true);
  assert.equal(profile.currentOfficialSignals.length >= 1, true);
  assert.equal(profile.releaseRequirements.length >= 5, true);
  assert.equal(profile.forbiddenClaims.length >= 4, true);

  for (const step of profile.demoSequence) {
    assert.equal(step.route.startsWith("/"), true);
    assert.equal(step.prove.length > 20, true);
    assert.equal(step.boundary.length > 20, true);
  }

  const brief = buildStrategicInvestorMeetingBrief(profile.targetId);
  assert.equal(typeof brief, "string");
  assert.match(brief, /External release authorized: no/);
  assert.match(brief, /No outreach has been sent/);
  assert.match(brief, /## Forbidden Claims/);
}

const openai = getStrategicInvestorMeetingProfile("openai");
assert.ok(openai);
assert.equal(openai.organization, "OpenAI");
assert.equal(openai.currentOfficialSignals.some((signal) => signal.officialSource === "https://openai.com/startups"), true);
assert.equal(
  openai.currentOfficialSignals.some(
    (signal) => signal.officialSource === "https://openai.com/index/openai-for-healthcare/"
  ),
  true
);
assert.match(openai.firstMeetingNonGoal, /direct-investment solicitation/);
assert.match(openai.specificAsk, /technical team/);

assert.equal(getStrategicInvestorMeetingProfile("unknown"), null);
assert.equal(buildStrategicInvestorMeetingBrief("unknown"), null);

assert.equal(strategicFundingReadinessControls.length, 8);
assert.equal(
  strategicFundingReadinessControls.filter((control) => control.blocksFundraisingRelease).length,
  5
);
assert.equal(
  strategicFundingReadinessControls.some(
    (control) => control.id === "immutable-release-provenance" && control.blocksFundraisingRelease
  ),
  true
);
assert.equal(
  strategicFundingReadinessControls.every(
    (control) => control.owner.length > 0 && control.requiredEvidence.length > 0 && control.completionRule.length > 0
  ),
  true
);

const preview = getParallelFundingTrack();
assert.equal(preview.status, "parallel-pre-fundraise-and-candidate-review");
assert.equal(preview.evidenceClass, "synthetic-readiness-preview");
assert.equal(preview.commercialProof.executableDemoCount, 6);
assert.equal(preview.commercialProof.pilotCount, 4);
assert.equal(preview.controls.candidateReviewContinues, true);
assert.equal(preview.controls.externalOutreachSent, false);
assert.equal(preview.controls.investorDeckReleased, false);
assert.equal(
  preview.decisions.find((decision) => decision.action === "prepare-internal-materials")?.decision,
  "ALLOW"
);
assert.equal(
  preview.decisions.find((decision) => decision.action === "public-discovery-conversation")?.decision,
  "REQUIRE_HUMAN"
);
assert.equal(
  preview.decisions.find((decision) => decision.action === "share-investor-deck")?.decision,
  "BLOCK"
);
assert.equal(
  preview.decisions.find((decision) => decision.action === "open-diligence-room")?.readiness,
  "candidate-review-required"
);
assert.equal(
  preview.decisions.every((decision) => decision.externalActionExecuted === false),
  true
);

const verifiedEvidence = {
  evidenceClass: "verified-operator-evidence",
  publicClaimsGuardPassed: true,
  publicMaterialsOnly: true,
  founderApprovalRecorded: true,
  cleanCandidate: true,
  namedReviewerApprovalRecorded: true,
  candidateFingerprint: "a".repeat(64),
  sourceFingerprint: "b".repeat(64),
  reviewPacketFingerprint: "c".repeat(64),
  investorDeckFingerprint: "d".repeat(64),
  investorDeckFounderApproved: true,
  investorDeckCounselApproved: true,
  investorDeckFinanceApproved: true,
  releaseStewardApprovalRecorded: true,
  customerEvidenceIncluded: false,
  customerEvidencePermissionRecorded: false,
  securitiesCounselApprovalRecorded: true
};
const fullyBoundDeck = evaluateInvestorEngagementAction("share-investor-deck", verifiedEvidence);
assert.equal(fullyBoundDeck.decision, "REQUIRE_HUMAN");
assert.equal(fullyBoundDeck.candidateBinding.verified, true);
assert.equal(fullyBoundDeck.externalActionExecuted, false);

const malformedCandidate = evaluateInvestorEngagementAction("share-investor-deck", {
  ...verifiedEvidence,
  candidateFingerprint: "not-a-sha256"
});
assert.equal(malformedCandidate.decision, "BLOCK");
assert.equal(
  malformedCandidate.reasonCodes.includes("CLEAN_CANDIDATE_AND_NAMED_REVIEW_REQUIRED"),
  true
);

const unpermissionedCustomerEvidence = evaluateInvestorEngagementAction("open-diligence-room", {
  ...verifiedEvidence,
  customerEvidenceIncluded: true,
  customerEvidencePermissionRecorded: false
});
assert.equal(unpermissionedCustomerEvidence.decision, "BLOCK");
assert.equal(
  unpermissionedCustomerEvidence.reasonCodes.includes("CUSTOMER_EVIDENCE_PERMISSION_REQUIRED"),
  true
);

const missingCounsel = evaluateInvestorEngagementAction("securities-solicitation", {
  ...verifiedEvidence,
  securitiesCounselApprovalRecorded: false
});
assert.equal(missingCounsel.decision, "BLOCK");
assert.equal(
  missingCounsel.reasonCodes.includes("SECURITIES_COUNSEL_APPROVAL_REQUIRED"),
  true
);

console.log(
  "pass strategic investor meeting policy (parallel discovery, fingerprint-bound diligence, weakest-link funding controls, no implied relationship)"
);
