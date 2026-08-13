#!/usr/bin/env node

import assert from "node:assert/strict";

import {
  assessInvestorDemoCommandRoom,
  createInvestorDemoCommandRoomReceipt,
  createInvestorDemoOperatorConfirmations,
  getInvestorDemoCommandRoomSummary,
  getInvestorDemoProofRoutes
} from "../app/lib/investorDemoCommandRoom.ts";

function passingProofChecks(mode) {
  return getInvestorDemoProofRoutes(mode).map((route) => ({
    route,
    outcome: "pass",
    httpStatus: 200,
    boundaryHeadersValid: true
  }));
}

const mode = "executive-preview";
const allConfirmations = createInvestorDemoOperatorConfirmations([
  "audience-and-ask-confirmed",
  "meeting-device-ready",
  "claim-boundaries-reviewed",
  "artifact-distribution-contained"
]);
const ready = assessInvestorDemoCommandRoom({
  mode,
  proofChecks: passingProofChecks(mode),
  confirmations: allConfirmations,
  completedChapterIds: [],
  elapsedSeconds: 0
});

assert.equal(ready.stage, "ready-to-present");
assert.equal(ready.eligibleToBegin, true);
assert.equal(ready.presentationComplete, false);
assert.equal(ready.blockers.length, 0);
assert.equal(ready.syntheticOnly, true);
assert.equal(ready.phiAllowed, false);
assert.equal(ready.clinicalExecutionAllowed, false);
assert.equal(ready.externalSendAuthorized, false);
assert.equal(ready.investmentSolicitationAuthorized, false);
assert.equal(ready.productionReleaseAuthorized, false);
assert.equal(ready.independentApprovalRecorded, false);
assert.match(ready.auditHash, /^scrimed-intel-[0-9a-f]{8}$/);
assert.match(ready.proofCheckAuditHash, /^scrimed-intel-[0-9a-f]{8}$/);
assert.match(ready.operatorConfirmationAuditHash, /^scrimed-intel-[0-9a-f]{8}$/);

const pending = assessInvestorDemoCommandRoom({
  mode,
  proofChecks: getInvestorDemoProofRoutes(mode).map((route) => ({
    route,
    outcome: "not-checked",
    httpStatus: null,
    boundaryHeadersValid: false
  })),
  confirmations: createInvestorDemoOperatorConfirmations(),
  completedChapterIds: [],
  elapsedSeconds: 0
});
assert.equal(pending.stage, "setup-required");
assert.equal(pending.eligibleToBegin, false);
assert.ok(pending.blockers.length >= 2);

for (const mutation of [
  {
    label: "failed route",
    proofChecks: passingProofChecks(mode).map((check, index) =>
      index === 0 ? { ...check, outcome: "fail", httpStatus: 500 } : check
    ),
    confirmations: allConfirmations,
    completedChapterIds: []
  },
  {
    label: "missing boundary header",
    proofChecks: passingProofChecks(mode).map((check, index) =>
      index === 0 ? { ...check, boundaryHeadersValid: false } : check
    ),
    confirmations: allConfirmations,
    completedChapterIds: []
  },
  {
    label: "unknown route",
    proofChecks: [
      ...passingProofChecks(mode).slice(1),
      {
        route: "/untrusted-proof-route",
        outcome: "pass",
        httpStatus: 200,
        boundaryHeadersValid: true
      }
    ],
    confirmations: allConfirmations,
    completedChapterIds: []
  },
  {
    label: "out-of-order chapter",
    proofChecks: passingProofChecks(mode),
    confirmations: allConfirmations,
    completedChapterIds: ["governance-moat"]
  },
  {
    label: "tampered operator confirmation",
    proofChecks: passingProofChecks(mode),
    confirmations: allConfirmations.map((confirmation, index) =>
      index === 0
        ? { ...confirmation, label: "Skip current evidence review" }
        : confirmation
    ),
    completedChapterIds: []
  },
  {
    label: "malformed proof status",
    proofChecks: passingProofChecks(mode).map((check, index) =>
      index === 0
        ? { ...check, outcome: "accepted", httpStatus: Number.NaN }
        : check
    ),
    confirmations: allConfirmations,
    completedChapterIds: []
  }
]) {
  const assessment = assessInvestorDemoCommandRoom({
    mode,
    proofChecks: mutation.proofChecks,
    confirmations: mutation.confirmations,
    completedChapterIds: mutation.completedChapterIds,
    elapsedSeconds: 0
  });
  assert.equal(assessment.stage, "blocked", mutation.label);
  assert.equal(assessment.eligibleToBegin, false, mutation.label);
}

const inProgress = assessInvestorDemoCommandRoom({
  mode,
  proofChecks: passingProofChecks(mode),
  confirmations: allConfirmations,
  completedChapterIds: ["workflow-wedge", "governance-moat"],
  elapsedSeconds: 150
});
assert.equal(inProgress.stage, "presentation-in-progress");
assert.equal(inProgress.completedChapterCount, 2);

const complete = assessInvestorDemoCommandRoom({
  mode,
  proofChecks: passingProofChecks(mode),
  confirmations: allConfirmations,
  completedChapterIds: [
    "workflow-wedge",
    "governance-moat",
    "commercial-path"
  ],
  elapsedSeconds: 185
});
assert.equal(complete.stage, "presentation-complete");
assert.equal(complete.presentationComplete, true);
assert.match(complete.warnings.join(" "), /beyond the selected timebox/i);

const receipt = createInvestorDemoCommandRoomReceipt(
  complete,
  "2026-08-10T12:00:00.000Z"
);
assert.match(receipt, /INTERNAL_OPERATOR_REHEARSAL/);
assert.match(receipt, /external-send authority/i);
assert.match(receipt, /not independent review/i);
assert.match(receipt, /Proof-check hash: scrimed-intel-/);
assert.match(receipt, /Operator-confirmation hash: scrimed-intel-/);
assert.doesNotMatch(receipt, /buyer@example\.com|patient|bearer\s+[a-z0-9._-]+/i);

const summary = getInvestorDemoCommandRoomSummary();
assert.deepEqual(
  summary.modes.map(({ id, durationMinutes }) => ({ id, durationMinutes })),
  [
    { id: "executive-preview", durationMinutes: 3 },
    { id: "technical-walkthrough", durationMinutes: 12 },
    { id: "diligence-walkthrough", durationMinutes: 30 }
  ]
);
assert.equal(summary.routeCheckPolicy.method, "HEAD");
assert.equal(summary.routeCheckPolicy.sameOriginOnly, true);
assert.equal(summary.externalSendAuthorized, false);
assert.equal(summary.independentApprovalRecorded, false);

assert.throws(
  () =>
    assessInvestorDemoCommandRoom({
      mode,
      proofChecks: passingProofChecks(mode),
      confirmations: allConfirmations,
      completedChapterIds: [],
      elapsedSeconds: -1
    }),
  /non-negative whole number/
);

console.log("pass investor demo command-room policy test");
