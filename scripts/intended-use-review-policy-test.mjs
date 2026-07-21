#!/usr/bin/env node

import assert from "node:assert/strict";
import {
  evaluateIntendedUseReview,
  intendedUseActionOptions,
  intendedUseReviewInputTemplate
} from "../app/lib/intendedUseReview.ts";
import {
  buildApprovalsReadinessBrief,
  getApprovalsReadinessSummary
} from "../app/lib/approvalsReadiness.ts";

function proposal(overrides = {}) {
  return {
    ...intendedUseReviewInputTemplate,
    requestedActions: [...intendedUseReviewInputTemplate.requestedActions],
    ...overrides
  };
}

const safe = evaluateIntendedUseReview(proposal());
assert.equal(safe.decision, "qualified-review-packet-ready");
assert.equal(safe.canEnterQualifiedReview, true);
assert.equal(safe.approved, false);
assert.equal(safe.approvalClaimAllowed, false);
assert.equal(safe.externalUseAuthorized, false);
assert.equal(safe.phiAuthority, false);
assert.equal(safe.clinicalAuthority, false);
assert.equal(safe.productionAuthority, false);
assert.deepEqual(safe.blockers, []);
assert.deepEqual(safe.evidenceGaps, []);
assert.ok(safe.requiredReviewers.includes("Founder/CEO"));
assert.ok(safe.requiredReviewers.includes("Qualified legal reviewer"));
assert.ok(safe.requiredReviewers.includes("Clinical governance reviewer"));

const missingAction = evaluateIntendedUseReview(proposal({ requestedActions: [] }));
assert.equal(missingAction.decision, "input-required");
assert.equal(missingAction.canEnterQualifiedReview, false);

for (const dataClassification of ["phi", "restricted-clinical"]) {
  const evaluation = evaluateIntendedUseReview(proposal({ dataClassification }));
  assert.equal(evaluation.decision, "blocked-prohibited-scope");
  assert.equal(evaluation.phiAuthority, false);
  assert.ok(evaluation.blockers.some((blocker) => blocker.includes("current authority boundary")));
}

for (const action of intendedUseActionOptions.filter((option) => option.classification === "prohibited")) {
  const evaluation = evaluateIntendedUseReview(proposal({ requestedActions: [action.id] }));
  assert.equal(evaluation.decision, "blocked-prohibited-scope", `${action.id} must fail closed`);
  assert.equal(evaluation.canEnterQualifiedReview, false);
  assert.equal(evaluation.approved, false);
}

const productionExecution = evaluateIntendedUseReview(proposal({
  operatingMode: "production-live",
  audience: "live-care",
  autonomyLevel: "execute"
}));
assert.equal(productionExecution.decision, "blocked-prohibited-scope");
assert.ok(productionExecution.blockers.length >= 3);

const clinicalEvidenceGap = evaluateIntendedUseReview(proposal({
  workflow: "patient-education-drafting",
  evidencePosture: "source-cited-unverified",
  requestedActions: ["patient-education-draft"]
}));
assert.equal(clinicalEvidenceGap.decision, "evidence-required");
assert.ok(clinicalEvidenceGap.requiredReviewers.includes("Licensed clinical reviewer"));
assert.ok(clinicalEvidenceGap.evidenceGaps.some((gap) => gap.includes("independently verified")));

const protectedPilot = evaluateIntendedUseReview(proposal({
  operatingMode: "protected-no-phi-pilot",
  audience: "customer-workflow",
  autonomyLevel: "prepare"
}));
assert.equal(protectedPilot.decision, "qualified-review-packet-ready");
assert.equal(protectedPilot.externalUseAuthorized, false);
for (const reviewer of ["Security reviewer", "Privacy reviewer", "Buyer sponsor", "Pilot lead"]) {
  assert.ok(protectedPilot.requiredReviewers.includes(reviewer));
}
assert.ok(protectedPilot.requiredEvidence.some((item) => item.includes("AAL2")));

const publicClaim = evaluateIntendedUseReview(proposal({ audience: "public-marketing" }));
assert.equal(publicClaim.decision, "qualified-review-packet-ready");
assert.equal(publicClaim.externalUseAuthorized, false);
assert.ok(publicClaim.requiredReviewers.includes("Claims and communications reviewer"));
assert.ok(publicClaim.requiredReviewers.includes("Release steward"));

const unknownAction = evaluateIntendedUseReview(proposal({ requestedActions: ["unregistered-action"] }));
assert.equal(unknownAction.decision, "blocked-prohibited-scope");
assert.ok(unknownAction.blockers.some((blocker) => blocker.includes("Unknown requested action")));

const summary = getApprovalsReadinessSummary();
assert.equal(summary.intendedUseReview.service, "scrimed-intended-use-review");
assert.equal(summary.intendedUseReview.defaultEvaluation.approved, false);
assert.equal(summary.intendedUseReview.defaultEvaluation.externalUseAuthorized, false);
assert.equal(summary.intendedUseReview.defaultEvaluation.phiAuthority, false);

const brief = buildApprovalsReadinessBrief();
assert.ok(brief.includes("## Intended Use Review Packet"));
assert.ok(brief.includes("External use authorized: false"));
assert.ok(brief.includes("PHI authority: false"));

console.log("pass intended-use review policy");
