#!/usr/bin/env node

import { generateKeyPairSync } from "node:crypto";

import {
  createP32CandidateReviewAssignment,
  createP32CandidateReviewerIdentityHash,
  getP32CandidateReviewActorCapabilities,
  getP32CandidateReviewSummary,
  P32CandidateReviewError,
  recordP32CandidateReviewDecision,
  validateP32CandidateReviewAssignmentRequest,
  validateP32CandidateReviewDecisionRequest
} from "../app/lib/scrimedP32CandidateReview.ts";
import { evaluateP32ApprovalEvidence } from "../app/lib/scrimedP32ReleaseGates.ts";
import {
  p32EvidenceTrustRegistryVersion,
  verifyP32SupplementalEvidenceAttestation
} from "./lib/scrimed-p32-evidence-attestation.mjs";
import {
  evaluateScrimedWorkWriteRequestProvenance,
  scrimedWorkOperatorSmokeContext,
  scrimedWorkRequestContextHeader
} from "../app/lib/scrimed-work/csrfProtection.ts";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function expectReviewError(label, expectedCode, operation) {
  let caught = null;
  try {
    await operation();
  } catch (error) {
    caught = error;
  }
  assert(
    caught instanceof P32CandidateReviewError,
    `${label} did not fail with a controlled candidate-review error.`
  );
  assert(
    caught.code === expectedCode,
    `${label} returned ${caught.code}, expected ${expectedCode}.`
  );
}

const now = new Date("2026-07-22T14:00:00.000Z");
const { privateKey, publicKey } = generateKeyPairSync("ed25519");
const assignerUserId = "10000000-0000-4000-8000-000000000001";
const reviewerUserId = "20000000-0000-4000-8000-000000000001";
const tenantId = "30000000-0000-4000-8000-000000000001";
const fingerprints = {
  sourceCommit: "a".repeat(40),
  sourceTreeFingerprint: "b".repeat(64),
  artifactFingerprint: "c".repeat(64),
  validationEvidenceFingerprint: "d".repeat(64),
  reviewPacketFingerprint: "e".repeat(64)
};
const trustedPublicKeysJson = JSON.stringify({
  version: p32EvidenceTrustRegistryVersion,
  keys: {
    "scrimed-p32-review-test-key-2026-07": {
      issuer: "scrimed-p32-candidate-review-issuer",
      status: "active",
      notBefore: "2026-07-22T13:00:00.000Z",
      expiresAt: "2026-07-23T13:00:00.000Z",
      publicKeyPem: publicKey.export({ format: "pem", type: "spki" }).toString(),
      allowedAutomatedEvidenceIds: [],
      allowedApprovalGateIds: ["named-reviewer-approval"],
      allowedIdentityAssurance: ["aal2-protected-workspace"]
    }
  }
});
const env = {
  SCRIMED_P32_CANDIDATE_REVIEW_ENABLED: "true",
  SCRIMED_P32_CANDIDATE_REVIEW_ISSUER_ID: "scrimed-p32-candidate-review-issuer",
  SCRIMED_P32_CANDIDATE_REVIEW_KEY_ID: "scrimed-p32-review-test-key-2026-07",
  SCRIMED_P32_CANDIDATE_REVIEW_PRIVATE_KEY_PEM: privateKey
    .export({ format: "pem", type: "pkcs8" })
    .toString(),
  SCRIMED_P32_CANDIDATE_REVIEW_SOURCE_COMMIT: fingerprints.sourceCommit,
  SCRIMED_P32_CANDIDATE_REVIEW_SOURCE_TREE_FINGERPRINT:
    fingerprints.sourceTreeFingerprint,
  SCRIMED_P32_CANDIDATE_REVIEW_ARTIFACT_FINGERPRINT:
    fingerprints.artifactFingerprint,
  SCRIMED_P32_CANDIDATE_REVIEW_VALIDATION_FINGERPRINT:
    fingerprints.validationEvidenceFingerprint,
  SCRIMED_P32_CANDIDATE_REVIEW_PACKET_FINGERPRINT:
    fingerprints.reviewPacketFingerprint,
  SCRIMED_P32_EVIDENCE_TRUSTED_PUBLIC_KEYS_JSON: trustedPublicKeysJson
};

for (const [role, expected] of [
  ["tenant-admin", [true, false, "assign-review"]],
  ["pilot-lead", [true, false, "assign-review"]],
  ["reviewer", [false, true, "record-review"]],
  ["observer", [false, false, "read-only"]]
]) {
  const capabilities = getP32CandidateReviewActorCapabilities(role);
  assert(capabilities.canAssignReview === expected[0], `${role} assignment capability drifted.`);
  assert(capabilities.canRecordDecision === expected[1], `${role} decision capability drifted.`);
  assert(capabilities.accessMode === expected[2], `${role} access mode drifted.`);
}

const reviewerIdentityHash = createP32CandidateReviewerIdentityHash(reviewerUserId);
const summary = getP32CandidateReviewSummary({
  env,
  tenantId,
  userId: reviewerUserId,
  now
});
assert(summary.reviewerIdentityHash === reviewerIdentityHash, "Summary lost reviewer identity binding.");
assert(summary.fingerprints.sourceCommit === fingerprints.sourceCommit, "Summary lost candidate binding.");
assert(summary.releaseAuthorityGranted === false, "Summary improperly granted release authority.");

let assignedInput = null;
const assignment = await createP32CandidateReviewAssignment({
  env,
  idempotencyKey: "40000000-0000-4000-8000-000000000001",
  request: validateP32CandidateReviewAssignmentRequest({ reviewerIdentityHash }),
  assignerUserId,
  persistAssignment: async (input) => {
    assignedInput = input;
    return {
      receipt: {
        assignmentId: input.assignmentId,
        auditHash: "f".repeat(64),
        previousAuditHash: null,
        recordedAt: now.toISOString()
      },
      error: null
    };
  },
  now
});
assert(assignment.assignment.reviewerIdentityHash === reviewerIdentityHash, "Assignment lost reviewer binding.");
assert(assignedInput?.reviewPacketFingerprint === fingerprints.reviewPacketFingerprint, "Assignment lost review-packet binding.");
assert(assignment.releaseAuthorityGranted === false, "Assignment improperly granted release authority.");

let decisionInput = null;
const decision = await recordP32CandidateReviewDecision({
  env,
  idempotencyKey: "50000000-0000-4000-8000-000000000001",
  request: validateP32CandidateReviewDecisionRequest({
    assignmentId: assignment.assignment.assignmentId,
    decision: "approved",
    reasonCode: "review-complete-no-material-blockers"
  }),
  reviewerUserId,
  tenantId,
  persistDecision: async (input) => {
    decisionInput = input;
    return {
      receipt: {
        approvalId: input.approvalId,
        assignmentId: input.assignmentId,
        auditHash: "9".repeat(64),
        previousAuditHash: null,
        recordedAt: now.toISOString()
      },
      error: null
    };
  },
  now
});
assert(decision.evidenceFile.automatedEvidence.length === 0, "Candidate review signed automated evidence.");
assert(decision.evidenceFile.approvals.length === 1, "Candidate review did not sign exactly one approval.");
assert(decision.evidenceFile.approvals[0].reviewerId === reviewerIdentityHash, "Decision lost reviewer identity.");
assert(
  decision.evidenceFile.approvals[0].reviewPacketFingerprint ===
    fingerprints.reviewPacketFingerprint,
  "Signed reviewer approval lost review-packet binding."
);
assert(decision.evidenceFile.approvals[0].releaseAuthorityGranted === false, "Decision improperly granted release authority.");
assert(decisionInput?.reviewPacketFingerprint === fingerprints.reviewPacketFingerprint, "Decision receipt lost review-packet binding.");
assert(!JSON.stringify(decision).includes("PRIVATE KEY"), "Candidate review exposed private signing material.");

const verified = verifyP32SupplementalEvidenceAttestation({
  supplementalEvidence: {
    automatedEvidence: decision.evidenceFile.automatedEvidence,
    approvals: decision.evidenceFile.approvals
  },
  attestation: decision.evidenceFile.attestation,
  trustedPublicKeysJson,
  evaluatedAt: "2026-07-22T14:01:00.000Z"
});
assert(verified?.issuer === env.SCRIMED_P32_CANDIDATE_REVIEW_ISSUER_ID, "Verifier rejected reviewer issuer scope.");

const approvalEvaluation = evaluateP32ApprovalEvidence(
  decision.evidenceFile.approvals[0],
  {
    expectedFingerprints: {
      sourceCommit: fingerprints.sourceCommit,
      sourceTree: fingerprints.sourceTreeFingerprint,
      artifact: fingerprints.artifactFingerprint,
      validationEvidence: fingerprints.validationEvidenceFingerprint,
      reviewPacket: fingerprints.reviewPacketFingerprint
    },
    evaluatedAt: "2026-07-22T14:01:00.000Z"
  }
);
assert(approvalEvaluation.valid, "Exact signed reviewer approval did not satisfy the p.32 approval contract.");

const stalePacketApproval = {
  ...decision.evidenceFile.approvals[0],
  reviewPacketFingerprint: "7".repeat(64)
};
assert(
  !evaluateP32ApprovalEvidence(stalePacketApproval, {
    expectedFingerprints: {
      sourceCommit: fingerprints.sourceCommit,
      sourceTree: fingerprints.sourceTreeFingerprint,
      artifact: fingerprints.artifactFingerprint,
      validationEvidence: fingerprints.validationEvidenceFingerprint,
      reviewPacket: fingerprints.reviewPacketFingerprint
    },
    evaluatedAt: "2026-07-22T14:01:00.000Z"
  }).valid,
  "A reviewer approval replayed against a different review packet was accepted."
);

const rejected = await recordP32CandidateReviewDecision({
  env,
  idempotencyKey: "50000000-0000-4000-8000-000000000002",
  request: validateP32CandidateReviewDecisionRequest({
    assignmentId: "60000000-0000-4000-8000-000000000001",
    decision: "rejected",
    reasonCode: "material-changes-required"
  }),
  reviewerUserId,
  tenantId,
  persistDecision: async (input) => ({
    receipt: {
      approvalId: input.approvalId,
      assignmentId: input.assignmentId,
      auditHash: "8".repeat(64),
      previousAuditHash: null,
      recordedAt: now.toISOString()
    },
    error: null
  }),
  now
});
const rejectedEvaluation = evaluateP32ApprovalEvidence(
  rejected.evidenceFile.approvals[0],
  {
    expectedFingerprints: {
      sourceCommit: fingerprints.sourceCommit,
      sourceTree: fingerprints.sourceTreeFingerprint,
      artifact: fingerprints.artifactFingerprint,
      validationEvidence: fingerprints.validationEvidenceFingerprint,
      reviewPacket: fingerprints.reviewPacketFingerprint
    },
    evaluatedAt: "2026-07-22T14:01:00.000Z"
  }
);
assert(!rejectedEvaluation.valid, "A rejected review was treated as approval.");

await expectReviewError(
  "disabled candidate review",
  "p32-candidate-review-disabled",
  () =>
    createP32CandidateReviewAssignment({
      env: { ...env, SCRIMED_P32_CANDIDATE_REVIEW_ENABLED: "false" },
      idempotencyKey: "40000000-0000-4000-8000-000000000002",
      request: { reviewerIdentityHash },
      assignerUserId,
      persistAssignment: async () => ({ receipt: null, error: null }),
      now
    })
);
await expectReviewError(
  "self assignment",
  "p32-candidate-review-separation-of-duties-required",
  () =>
    createP32CandidateReviewAssignment({
      env,
      idempotencyKey: "40000000-0000-4000-8000-000000000003",
      request: {
        reviewerIdentityHash: createP32CandidateReviewerIdentityHash(assignerUserId)
      },
      assignerUserId,
      persistAssignment: async () => ({ receipt: null, error: null }),
      now
    })
);
await expectReviewError(
  "wrong assignment role",
  "p32-candidate-review-forbidden",
  () =>
    createP32CandidateReviewAssignment({
      env,
      idempotencyKey: "40000000-0000-4000-8000-000000000004",
      request: { reviewerIdentityHash },
      assignerUserId,
      persistAssignment: async () => ({
        receipt: null,
        error: { message: "governance-workspace-or-role-denied" }
      }),
      now
    })
);
await expectReviewError(
  "replayed decision",
  "p32-candidate-review-replay-rejected",
  () =>
    recordP32CandidateReviewDecision({
      env,
      idempotencyKey: "50000000-0000-4000-8000-000000000003",
      request: {
        assignmentId: "60000000-0000-4000-8000-000000000002",
        decision: "approved",
        reasonCode: "review-complete-no-material-blockers"
      },
      reviewerUserId,
      tenantId,
      persistDecision: async () => ({
        receipt: null,
        error: { message: "p32-candidate-review-idempotency-replay" }
      }),
      now
    })
);
await expectReviewError(
  "missing trusted key",
  "p32-candidate-review-trust-registry-invalid",
  () =>
    createP32CandidateReviewAssignment({
      env: { ...env, SCRIMED_P32_EVIDENCE_TRUSTED_PUBLIC_KEYS_JSON: "" },
      idempotencyKey: "40000000-0000-4000-8000-000000000005",
      request: { reviewerIdentityHash },
      assignerUserId,
      persistAssignment: async () => ({ receipt: null, error: null }),
      now
    })
);
await expectReviewError(
  "overbroad trusted key",
  "p32-candidate-review-trust-scope-invalid",
  () =>
    createP32CandidateReviewAssignment({
      env: {
        ...env,
        SCRIMED_P32_EVIDENCE_TRUSTED_PUBLIC_KEYS_JSON: JSON.stringify({
          version: p32EvidenceTrustRegistryVersion,
          keys: {
            [env.SCRIMED_P32_CANDIDATE_REVIEW_KEY_ID]: {
              ...JSON.parse(trustedPublicKeysJson).keys[
                env.SCRIMED_P32_CANDIDATE_REVIEW_KEY_ID
              ],
              allowedApprovalGateIds: [
                "named-reviewer-approval",
                "deployment-authorization"
              ]
            }
          }
        })
      },
      idempotencyKey: "40000000-0000-4000-8000-000000000006",
      request: { reviewerIdentityHash },
      assignerUserId,
      persistAssignment: async () => ({ receipt: null, error: null }),
      now
    })
);
await expectReviewError(
  "unexpected assignment field",
  "p32-candidate-review-assignment-invalid",
  async () =>
    validateP32CandidateReviewAssignmentRequest({
      reviewerIdentityHash,
      reviewerEmail: "not-accepted"
    })
);
await expectReviewError(
  "mismatched reason",
  "p32-candidate-review-decision-invalid",
  async () =>
    validateP32CandidateReviewDecisionRequest({
      assignmentId: "60000000-0000-4000-8000-000000000003",
      decision: "approved",
      reasonCode: "material-changes-required"
    })
);

const candidateReviewEndpoint =
  "https://app.scrimedsolutions.com/api/pilot-workspaces/atlas-synthetic-evaluation/qa-evidence/p32-candidate-review?action=decide";
const sameOriginMutation = evaluateScrimedWorkWriteRequestProvenance(
  new Request(candidateReviewEndpoint, {
    method: "POST",
    headers: {
      origin: "https://app.scrimedsolutions.com",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin"
    }
  })
);
assert(sameOriginMutation.allowed, "Candidate review rejected a valid same-origin browser mutation.");

const crossOriginMutation = evaluateScrimedWorkWriteRequestProvenance(
  new Request(candidateReviewEndpoint, {
    method: "POST",
    headers: {
      origin: "https://untrusted.example",
      [scrimedWorkRequestContextHeader]: scrimedWorkOperatorSmokeContext
    }
  })
);
assert(!crossOriginMutation.allowed, "Candidate review accepted a cross-origin browser mutation.");

const explicitOperatorMutation = evaluateScrimedWorkWriteRequestProvenance(
  new Request(candidateReviewEndpoint, {
    method: "POST",
    headers: {
      [scrimedWorkRequestContextHeader]: scrimedWorkOperatorSmokeContext
    }
  })
);
assert(explicitOperatorMutation.allowed, "Candidate review rejected the explicit non-browser operator context.");

const ambiguousMutation = evaluateScrimedWorkWriteRequestProvenance(
  new Request(candidateReviewEndpoint, { method: "POST" })
);
assert(!ambiguousMutation.allowed, "Candidate review accepted an ambiguous non-browser mutation.");

console.log("pass SCRIMED p.32 protected candidate-review policy behavior");
