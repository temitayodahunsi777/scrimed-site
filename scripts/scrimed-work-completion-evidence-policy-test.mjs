#!/usr/bin/env node

import assert from "node:assert/strict";

import {
  parseScrimedWorkCompletionEvidencePayload,
  scrimedWorkCompletionEvidencePolicyVersion
} from "../app/lib/scrimed-work/completionEvidence.ts";

const validEvidence = {
  items: [
    {
      sessionId: "work_session_completion_evidence_fixture",
      artifactId: "artifact_completion_evidence_fixture",
      artifactType: "executive-report",
      title: "Synthetic completed internal evidence",
      workspaceDomain: "operations",
      riskLevel: "moderate",
      sessionStatus: "completed",
      reviewStatus: "reviewed",
      reviewDisposition: "approved_for_internal_use",
      verificationAllPass: true,
      verificationEligible: true,
      verificationPassRate: 100,
      reviewEvidenceBound: true,
      reviewerSeparationEnforced: true,
      completionEvidenceBound: true,
      reviewEventId: "11111111-1111-4111-8111-111111111111",
      completionEventId: "22222222-2222-4222-8222-222222222222",
      reviewDecisionHash: `scrimed-work-artifact-review-${"a".repeat(64)}`,
      lifecycleDecisionHash: "scrimed-work-lifecycle-1234abcd",
      evidencePacketHash: `scrimed-work-completion-evidence-${"b".repeat(64)}`,
      reviewedAt: "2026-07-16T14:10:00.000Z",
      completedAt: "2026-07-16T14:15:00.000Z",
      syntheticOnly: true,
      noPhi: true,
      humanReviewRequired: true,
      internalUseOnly: true,
      externalDistributionAllowed: false,
      payerSubmissionAllowed: false,
      ehrWritebackAllowed: false
    }
  ],
  count: 1,
  limit: 25,
  auditEventId: "33333333-3333-4333-8333-333333333333",
  policyVersion: scrimedWorkCompletionEvidencePolicyVersion,
  workspaceSlug: "atlas-synthetic-evaluation",
  operatorRoleRequired: true,
  allowedMemberRoles: ["tenant-admin", "pilot-lead"],
  completedSessionsOnly: true,
  independentReviewRequired: true,
  verificationRequired: true,
  immutableEvidenceReferences: true,
  internalUseOnly: true,
  syntheticOnly: true,
  noPhi: true,
  externalDistributionAllowed: false,
  payerSubmissionAllowed: false,
  ehrWritebackAllowed: false,
  boundary: "Synthetic/no-PHI immutable completion references for internal use only."
};

const parsed = parseScrimedWorkCompletionEvidencePayload(validEvidence);
assert.ok(parsed);
assert.equal(parsed.count, 1);
assert.equal(parsed.items[0].sessionStatus, "completed");
assert.equal(parsed.items[0].verificationPassRate, 100);
assert.equal(parsed.items[0].internalUseOnly, true);

for (const unsafeEvidence of [
  { ...validEvidence, count: 2 },
  { ...validEvidence, operatorRoleRequired: false },
  { ...validEvidence, allowedMemberRoles: ["reviewer", "pilot-lead"] },
  { ...validEvidence, completedSessionsOnly: false },
  { ...validEvidence, independentReviewRequired: false },
  { ...validEvidence, verificationRequired: false },
  { ...validEvidence, immutableEvidenceReferences: false },
  { ...validEvidence, internalUseOnly: false },
  { ...validEvidence, noPhi: false },
  { ...validEvidence, externalDistributionAllowed: true },
  { ...validEvidence, payerSubmissionAllowed: true },
  { ...validEvidence, ehrWritebackAllowed: true },
  {
    ...validEvidence,
    items: [{ ...validEvidence.items[0], sessionStatus: "verifying" }]
  },
  {
    ...validEvidence,
    items: [{ ...validEvidence.items[0], verificationAllPass: false }]
  },
  {
    ...validEvidence,
    items: [{ ...validEvidence.items[0], verificationPassRate: 99 }]
  },
  {
    ...validEvidence,
    items: [{ ...validEvidence.items[0], reviewerSeparationEnforced: false }]
  },
  {
    ...validEvidence,
    items: [{ ...validEvidence.items[0], reviewDecisionHash: "unsafe" }]
  },
  {
    ...validEvidence,
    items: [{ ...validEvidence.items[0], evidencePacketHash: "unsafe" }]
  },
  {
    ...validEvidence,
    items: [{ ...validEvidence.items[0], completionEventId: validEvidence.items[0].reviewEventId }]
  },
  {
    ...validEvidence,
    items: [
      {
        ...validEvidence.items[0],
        reviewedAt: "2026-07-16T14:20:00.000Z",
        completedAt: "2026-07-16T14:15:00.000Z"
      }
    ]
  }
]) {
  assert.equal(parseScrimedWorkCompletionEvidencePayload(unsafeEvidence), null);
}

console.log("pass SCRIMED Work completion evidence policy behavior");
