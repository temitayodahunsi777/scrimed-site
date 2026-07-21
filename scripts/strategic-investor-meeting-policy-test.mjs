#!/usr/bin/env node

import assert from "node:assert/strict";

import {
  buildStrategicInvestorMeetingBrief,
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

console.log(
  "pass strategic investor meeting policy (official-source lanes, internal preparation, weakest-link funding controls, no implied relationship)"
);
