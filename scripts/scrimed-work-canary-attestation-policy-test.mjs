#!/usr/bin/env node

import assert from "node:assert/strict";

import {
  buildScrimedWorkCanaryAttestation,
  isScrimedWorkCanaryEvidenceId,
  parseScrimedWorkCanaryAttestationPayload,
  scrimedWorkCanaryAttestationPolicyVersion
} from "../app/lib/scrimed-work/canaryAttestation.ts";
import { scrimedWorkCompletionEvidencePolicyVersion } from "../app/lib/scrimed-work/completionEvidence.ts";

const releaseA = "a".repeat(40);
const releaseB = "b".repeat(40);
const signingSecret = "nonsecret-canary-policy-fixture-key";
const evaluatedAt = "2026-07-17T01:06:00.000Z";
const evidence = {
  items: [
    {
      sessionId: "work_session_canary_fixture",
      artifactId: "artifact_canary_fixture",
      artifactType: "executive-report",
      title: "Synthetic release-bound canary evidence",
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
      reviewDecisionHash: `scrimed-work-artifact-review-${"c".repeat(64)}`,
      lifecycleDecisionHash: "scrimed-work-lifecycle-1234abcd",
      evidencePacketHash: `scrimed-work-completion-evidence-${"d".repeat(64)}`,
      reviewedAt: "2026-07-17T01:00:00.000Z",
      completedAt: "2026-07-17T01:05:00.000Z",
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

const first = await buildScrimedWorkCanaryAttestation({
  evidence,
  releaseSha: releaseA,
  signingSecret,
  evaluatedAt
});
const repeated = await buildScrimedWorkCanaryAttestation({
  evidence,
  releaseSha: releaseA,
  signingSecret,
  evaluatedAt
});
const nextRelease = await buildScrimedWorkCanaryAttestation({
  evidence,
  releaseSha: releaseB,
  signingSecret,
  evaluatedAt
});
const nextWorkspace = await buildScrimedWorkCanaryAttestation({
  evidence: { ...evidence, workspaceSlug: "northstar-synthetic-evaluation" },
  releaseSha: releaseA,
  signingSecret,
  evaluatedAt
});

assert.equal(first.status, "verified_release_bound");
assert.equal(first.eligibleForReleaseBinding, true);
assert.equal(first.policyVersion, scrimedWorkCanaryAttestationPolicyVersion);
assert.equal(first.releaseSha, releaseA);
assert.equal(first.releaseShaFingerprint, releaseA.slice(0, 12));
assert.equal(first.evidenceId, repeated.evidenceId);
assert.notEqual(first.evidenceId, nextRelease.evidenceId);
assert.notEqual(first.evidenceId, nextWorkspace.evidenceId);
assert.equal(isScrimedWorkCanaryEvidenceId(first.evidenceId), true);
assert.equal(first.source?.readAuditEventId, evidence.auditEventId);
assert.equal(first.configuration.values?.releaseSha, releaseA);
assert.equal(first.configuration.values?.completedAt, evidence.items[0].completedAt);
assert.equal(first.configuration.values?.workspaceSlug, evidence.workspaceSlug);
assert.equal(first.freshness.fresh, true);
assert.equal(first.freshness.ageHours, 1 / 60);
assert.equal(first.controls.exactWorkspaceRequired, true);
assert.equal(first.controls.freshnessRequired, true);
assert.equal(first.controls.productionAuthorization, false);
assert.ok(parseScrimedWorkCanaryAttestationPayload(first));

const missingRelease = await buildScrimedWorkCanaryAttestation({
  evidence,
  releaseSha: "invalid",
  signingSecret,
  evaluatedAt
});
assert.equal(missingRelease.status, "release_identity_required");
assert.equal(missingRelease.eligibleForReleaseBinding, false);
assert.equal(missingRelease.evidenceId, null);
assert.ok(parseScrimedWorkCanaryAttestationPayload(missingRelease));

const emptyEvidence = await buildScrimedWorkCanaryAttestation({
  evidence: { ...evidence, items: [], count: 0 },
  releaseSha: releaseA,
  signingSecret,
  evaluatedAt
});
assert.equal(emptyEvidence.status, "completion_evidence_required");
assert.equal(emptyEvidence.source, null);
assert.equal(emptyEvidence.configuration.values, null);
assert.ok(parseScrimedWorkCanaryAttestationPayload(emptyEvidence));

const missingSigningAuthority = await buildScrimedWorkCanaryAttestation({
  evidence,
  releaseSha: releaseA,
  evaluatedAt
});
assert.equal(missingSigningAuthority.status, "signing_authority_required");
assert.equal(missingSigningAuthority.eligibleForReleaseBinding, false);
assert.equal(missingSigningAuthority.evidenceId, null);
assert.ok(parseScrimedWorkCanaryAttestationPayload(missingSigningAuthority));

const staleEvidence = await buildScrimedWorkCanaryAttestation({
  evidence,
  releaseSha: releaseA,
  signingSecret,
  evaluatedAt: "2026-07-20T01:05:00.001Z"
});
assert.equal(staleEvidence.status, "completion_evidence_stale");
assert.equal(staleEvidence.eligibleForReleaseBinding, false);
assert.equal(staleEvidence.evidenceId, null);
assert.equal(staleEvidence.freshness.fresh, false);
assert.ok(parseScrimedWorkCanaryAttestationPayload(staleEvidence));

const futureDatedEvidence = await buildScrimedWorkCanaryAttestation({
  evidence,
  releaseSha: releaseA,
  signingSecret,
  evaluatedAt: "2026-07-17T00:59:59.000Z"
});
assert.equal(futureDatedEvidence.status, "completion_evidence_stale");
assert.equal(futureDatedEvidence.freshness.fresh, false);
assert.ok(parseScrimedWorkCanaryAttestationPayload(futureDatedEvidence));

for (const invalid of [
  { ...first, eligibleForReleaseBinding: false },
  { ...first, evidenceId: "scrimed-work-canary-manual" },
  { ...first, releaseShaFingerprint: "mismatch" },
  { ...first, controls: { ...first.controls, noPhi: false } },
  { ...first, controls: { ...first.controls, productionAuthorization: true } },
  { ...first, freshness: { ...first.freshness, fresh: false } },
  { ...first, freshness: { ...first.freshness, ageHours: 73 } },
  { ...first, configuration: { ...first.configuration, values: null } },
  {
    ...first,
    source: { ...first.source, reviewEventId: first.source?.completionEventId }
  }
]) {
  assert.equal(parseScrimedWorkCanaryAttestationPayload(invalid), null);
}

console.log("pass SCRIMED Work release-bound canary attestation policy behavior");
