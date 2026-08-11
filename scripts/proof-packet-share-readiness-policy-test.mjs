#!/usr/bin/env node

import assert from "node:assert/strict";

import {
  assessProofPacketShareReadiness,
  getProofPacketShareReadinessSummary,
  validateProofPacketShareReadinessInput
} from "../app/lib/proofPacketShareReadiness.ts";
import { createScrimedProofPacketCandidateBinding } from "../app/lib/scrimedProofPacketStudio.ts";

const summary = getProofPacketShareReadinessSummary();
const investorPacket = summary.eligiblePackets.find(
  (packet) => packet.packetId === "investor-platform-packet"
);

assert.ok(investorPacket);
assert.equal(summary.eligiblePackets.length, 5);
assert.equal(summary.requiredReviewerRoles.length, 7);
assert.equal(summary.authorities.externalDistributionAuthorized, false);
assert.equal(summary.authorities.investorSolicitationAuthorized, false);
assert.equal(summary.authorities.phiAuthorized, false);
assert.equal(summary.authorities.liveClinicalExecutionAuthorized, false);

const validInput = {
  packetId: investorPacket.packetId,
  packetAuditHash: investorPacket.auditHash,
  recipientClass: investorPacket.recipientClass,
  purpose: investorPacket.purpose,
  channelControl: investorPacket.allowedChannels[0],
  routeFreshnessConfirmed: true,
  limitationDisclosuresConfirmed: true,
  recipientClassConfirmed: true,
  noSensitiveDataConfirmed: true,
  protectedHandoffOnlyConfirmed: true
};

const validation = validateProofPacketShareReadinessInput(validInput);
assert.equal(validation.ok, true);

if (!validation.ok) {
  throw new Error("Expected canonical share-readiness input to validate.");
}

const ready = assessProofPacketShareReadiness(
  validation.input,
  "2026-08-11T12:00:00.000Z"
);
assert.equal(ready.decision, "READY_FOR_PROTECTED_INTAKE");
assert.deepEqual(ready.reasonCodes, [
  "preflight-complete-protected-review-still-required"
]);
assert.equal(ready.protectedHandoff.distributionDisabled, true);
assert.equal(ready.protectedHandoff.lockboxRecordCreated, false);
assert.equal(ready.protectedHandoff.route, "/pilot-workspace/access");
assert.equal(ready.postMeetingCapture.route, "/sales-operations");
assert.equal(ready.postMeetingCapture.externalSendAuthorized, false);
assert.equal(ready.authorities.externalDistributionAuthorized, false);
assert.equal(ready.authorities.customerPermissionCreated, false);
assert.equal(ready.authorities.productionReleaseAuthorized, false);
assert.equal(ready.authorities.phiAuthorized, false);
assert.equal(ready.authorities.liveClinicalExecutionAuthorized, false);
assert.equal(ready.requiredReviewerRoles.length, 7);
assert.ok(ready.missingExternalEvidence.length >= 5);
assert.match(ready.assessmentHash, /^[0-9a-f]{64}$/);
assert.ok(ready.packet.proofRoutes.length >= investorPacket.proofRouteCount);

const deterministic = assessProofPacketShareReadiness(
  validation.input,
  "2026-08-11T13:00:00.000Z"
);
assert.equal(deterministic.assessmentHash, ready.assessmentHash);
assert.notEqual(deterministic.assessedAt, ready.assessedAt);

const incompleteValidation = validateProofPacketShareReadinessInput({
  ...validInput,
  routeFreshnessConfirmed: false
});
assert.equal(incompleteValidation.ok, true);

if (!incompleteValidation.ok) {
  throw new Error("Expected incomplete confirmations to produce a policy decision.");
}

const blocked = assessProofPacketShareReadiness(incompleteValidation.input);
assert.equal(blocked.decision, "BLOCKED");
assert.ok(blocked.reasonCodes.includes("route-freshness-not-confirmed"));
assert.equal(blocked.authorities.externalDistributionAuthorized, false);

for (const testCase of [
  {
    label: "tampered fingerprint",
    input: { ...validInput, packetAuditHash: "scrimed-intel-deadbeef" },
    expected: /fingerprint/i
  },
  {
    label: "wrong recipient class",
    input: { ...validInput, recipientClass: "health-system-buyer" },
    expected: /recipient class/i
  },
  {
    label: "wrong purpose",
    input: { ...validInput, purpose: "buyer-demo-follow-up" },
    expected: /purpose/i
  },
  {
    label: "disallowed channel",
    input: { ...validInput, channelControl: "pr-release-queue" },
    expected: /channel/i
  },
  {
    label: "recipient PII field",
    input: { ...validInput, recipientEmail: "reviewer@example.com" },
    expected: /recipient names, email addresses/i
  },
  {
    label: "internal packet",
    input: {
      ...validInput,
      packetId: "internal-weekly-execution-packet"
    },
    expected: /not eligible/i
  }
]) {
  const result = validateProofPacketShareReadinessInput(testCase.input);
  assert.equal(result.ok, false, testCase.label);

  if (result.ok) {
    throw new Error(`${testCase.label} unexpectedly validated.`);
  }

  assert.match(result.errors.join(" "), testCase.expected, testCase.label);
}

assert.doesNotMatch(
  JSON.stringify(ready),
  /reviewer@example\.com|patient name|bearer\s+[a-z0-9._-]+/i
);

const candidateBinding = createScrimedProofPacketCandidateBinding(
  {
    packetId: "investor-platform-packet",
    exactCandidateSha: "a".repeat(64),
    sourceFingerprint: "b".repeat(64),
    evidenceFingerprint: "c".repeat(64),
    recipientClass: "investor",
    intendedPurpose: "Controlled investor diligence review",
    evidenceInventory: ["Platform graph", "Validation report", "Risk register"],
    expiresAt: "2026-08-18T12:00:00.000Z",
    approvalsRequired: ["Founder approval", "Finance review", "Legal review", "Distribution authorization"],
    exactArtifactHashes: {
      "Investor packet": "d".repeat(64),
      "Validation evidence": "e".repeat(64)
    }
  },
  "2026-08-11T12:00:00.000Z"
);
assert.match(candidateBinding.packetFingerprint, /^[0-9a-f]{64}$/);
assert.match(candidateBinding.auditHash, /^[0-9a-f]{64}$/);
assert.equal(candidateBinding.distributionStatus, "NOT_AUTHORIZED");
assert.equal(candidateBinding.externalDistributionAuthorized, false);

assert.throws(
  () => createScrimedProofPacketCandidateBinding(
    {
      ...candidateBinding,
      exactCandidateSha: "not-a-hash"
    },
    "2026-08-11T12:00:00.000Z"
  ),
  /exact SHA-256/i
);

assert.throws(
  () => createScrimedProofPacketCandidateBinding(
    {
      packetId: "investor-platform-packet",
      exactCandidateSha: "a".repeat(64),
      sourceFingerprint: "b".repeat(64),
      evidenceFingerprint: "c".repeat(64),
      recipientClass: "investor",
      intendedPurpose: "Controlled investor diligence review",
      evidenceInventory: ["Platform graph"],
      expiresAt: "2026-08-10T12:00:00.000Z",
      approvalsRequired: ["Founder approval"],
      exactArtifactHashes: { "Investor packet": "d".repeat(64) }
    },
    "2026-08-11T12:00:00.000Z"
  ),
  /future expiration/i
);

console.log("pass proof packet share-readiness policy test");
