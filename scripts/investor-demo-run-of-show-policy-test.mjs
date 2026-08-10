#!/usr/bin/env node

import assert from "node:assert/strict";

import {
  assessInvestorDemoRehearsal,
  buildInvestorDemoRunOfShow,
  getInvestorDemoRunOfShowSummary,
  investorDemoModes,
  investorDemoRunOfShowBoundary
} from "../app/lib/investorDemoRunOfShow.ts";

const summary = getInvestorDemoRunOfShowSummary();

assert.equal(summary.status, "guided-synthetic-investor-demo-ready");
assert.equal(summary.modeCount, 2);
assert.equal(summary.proofChapterCount, 3);
assert.equal(summary.plans.length, investorDemoModes.length);
assert.match(investorDemoRunOfShowBoundary, /synthetic/i);
assert.match(investorDemoRunOfShowBoundary, /not investment advice/i);
assert.match(investorDemoRunOfShowBoundary, /not.*solicitation/i);

const expectedDurationSeconds = new Map([
  ["executive-preview", 180],
  ["diligence-walkthrough", 720]
]);

for (const plan of summary.plans) {
  assert.equal(plan.durationSeconds, expectedDurationSeconds.get(plan.mode));
  assert.equal(
    plan.chapters.reduce((total, chapter) => total + chapter.durationSeconds, 0),
    plan.durationSeconds
  );
  assert.deepEqual(
    plan.chapters.map((chapter) => chapter.order),
    [1, 2, 3]
  );
  assert.equal(new Set(plan.chapters.map((chapter) => chapter.id)).size, 3);
  assert.equal(plan.syntheticOnly, true);
  assert.equal(plan.phiAllowed, false);
  assert.equal(plan.clinicalExecutionAllowed, false);
  assert.equal(plan.investmentSolicitationAuthorized, false);
  assert.equal(plan.externalSendAuthorized, false);
  assert.equal(plan.humanReviewRequired, true);
  assert.match(plan.auditHash, /^scrimed-intel-[0-9a-f]{8}$/);
  assert.ok(plan.blockedClaims.length >= 5);

  for (const chapter of plan.chapters) {
    assert.match(chapter.primaryProof.route, /^\/[a-z0-9/-]+$/);
    assert.ok(chapter.supportingProof.length >= 2);
    assert.ok(chapter.retainedBoundary.length > 40);
  }

  const rehearsal = assessInvestorDemoRehearsal(plan.mode);
  assert.equal(rehearsal.status, "ready-for-internal-rehearsal");
  assert.equal(rehearsal.internalRehearsalReady, true);
  assert.equal(rehearsal.automatedChecksPassed, 5);
  assert.equal(rehearsal.automatedCheckCount, 5);
  assert.equal(
    rehearsal.checks.every((check) => check.status === "pass"),
    true
  );
  assert.ok(rehearsal.requiredHumanActions.length >= 4);
  assert.equal(rehearsal.externalArtifactDistributionAuthorized, false);
  assert.equal(rehearsal.investmentSolicitationAuthorized, false);
  assert.match(rehearsal.auditHash, /^scrimed-intel-[0-9a-f]{8}$/);
}

const executivePlan = buildInvestorDemoRunOfShow("executive-preview");
assert.deepEqual(
  executivePlan.chapters.map((chapter) => chapter.primaryProof.route),
  [
    "/documentation-before-authorization",
    "/atlas",
    "/pilot-demo-commercial-readiness"
  ]
);

assert.throws(
  () => buildInvestorDemoRunOfShow("unsupported-mode"),
  /Unsupported investor demo mode/
);

const publicNarrative = JSON.stringify(summary).toLowerCase();
for (const forbidden of [
  "guaranteed investment return",
  "customer deployment confirmed",
  "clinical validation complete",
  "payer submission enabled",
  "ehr writeback enabled",
  "phi processing approved"
]) {
  assert.equal(publicNarrative.includes(forbidden), false);
}

console.log("pass investor demo run-of-show policy test");
