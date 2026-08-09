#!/usr/bin/env node

import { generateKeyPairSync } from "node:crypto";

import {
  issueP32Aal2Evidence,
  P32EvidenceIssuerError,
  validateP32EvidenceIssuerRequest
} from "../app/lib/scrimedP32EvidenceIssuer.ts";
import {
  p32EvidenceTrustRegistryVersion,
  verifyP32SupplementalEvidenceAttestation
} from "./lib/scrimed-p32-evidence-attestation.mjs";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function expectIssuerError(label, expectedCode, operation) {
  let caught = null;
  try {
    await operation();
  } catch (error) {
    caught = error;
  }
  assert(caught instanceof P32EvidenceIssuerError, `${label} did not fail with a controlled issuer error.`);
  assert(caught.code === expectedCode, `${label} returned ${caught.code}, expected ${expectedCode}.`);
}

const now = new Date("2026-07-21T18:00:00.000Z");
const { privateKey, publicKey } = generateKeyPairSync("ed25519");
const request = {
  sourceCommit: "a".repeat(40),
  sourceTreeFingerprint: "b".repeat(64),
  artifactFingerprint: "c".repeat(64),
  validationEvidenceFingerprint: "d".repeat(64)
};
const env = {
  SCRIMED_P32_EVIDENCE_ISSUER_ENABLED: "true",
  SCRIMED_P32_EVIDENCE_ISSUER_ID: "scrimed-protected-p32-issuer",
  SCRIMED_P32_EVIDENCE_ISSUER_KEY_ID: "scrimed-p32-test-key-2026-07",
  SCRIMED_P32_EVIDENCE_ISSUER_PRIVATE_KEY_PEM: privateKey.export({
    format: "pem",
    type: "pkcs8"
  }).toString(),
  SCRIMED_P32_EVIDENCE_ISSUER_SOURCE_COMMIT: request.sourceCommit,
  SCRIMED_P32_EVIDENCE_ISSUER_SOURCE_TREE_FINGERPRINT: request.sourceTreeFingerprint,
  SCRIMED_P32_EVIDENCE_ISSUER_ARTIFACT_FINGERPRINT: request.artifactFingerprint,
  SCRIMED_P32_EVIDENCE_ISSUER_VALIDATION_FINGERPRINT:
    request.validationEvidenceFingerprint
};
const packet = {
  id: "10000000-0000-4000-8000-000000000001",
  tenantId: "20000000-0000-4000-8000-000000000001",
  workspaceId: "30000000-0000-4000-8000-000000000001",
  workflowKind: "authority-reference-qa",
  workflowRunId: "123456789",
  workflowRunUrl:
    "https://github.com/temitayodahunsi777/scrimed-site/actions/runs/123456789",
  executedAt: "2026-07-21T17:45:00.000Z",
  baseUrl: "https://app.scrimedsolutions.com",
  intakeId: "atlas-synthetic-evaluation",
  createdSessionId: "40000000-0000-4000-8000-000000000001",
  packetAuditEventId: "50000000-0000-4000-8000-000000000001",
  qaOutcome: "pass",
  operatorAttestation: "no-secrets-no-phi-aal2-human-run",
  tokenDisposalAttestation: "temporary-token-deleted-or-rotated",
  dataBoundary: "synthetic-business-workflow-only",
  packetMarkdown: "Synthetic protected run packet.",
  packetSha256: "e".repeat(64),
  createdBy: "60000000-0000-4000-8000-000000000001",
  createdAt: "2026-07-21T17:50:00.000Z",
  boundary: "synthetic-only"
};
let persistedInput = null;
const successfulPersistence = async (input) => {
  persistedInput = input;
  return {
    receipt: {
      issuanceId: input.issuanceId,
      auditHash: "f".repeat(64),
      previousAuditHash: null,
      recordedAt: now.toISOString()
    },
    error: null
  };
};

const issued = await issueP32Aal2Evidence({
  env,
  idempotencyKey: "70000000-0000-4000-8000-000000000001",
  packets: [packet],
  persistReceipt: successfulPersistence,
  request,
  now
});
assert(issued.evidenceFile.automatedEvidence.length === 1, "Issuer did not create one bounded evidence record.");
assert(issued.evidenceFile.approvals.length === 0, "Issuer must never sign human approvals.");
assert(issued.evidenceFile.automatedEvidence[0].evidenceId === "aal2-cli-evidence", "Issuer created an unsupported evidence type.");
assert(issued.evidenceFile.automatedEvidence[0].identityAssurance === "protected-aal2-workspace", "Issuer lost protected AAL2 identity assurance.");
assert(issued.evidenceFile.automatedEvidence[0].sourceCommit === request.sourceCommit, "Issuer lost source-commit binding.");
assert(persistedInput?.qaEvidencePacketHash === packet.packetSha256, "Issuer receipt did not bind retained QA evidence.");
assert(persistedInput?.payloadHash === issued.evidenceFile.attestation.payloadHash, "Issuer receipt did not bind the signed payload.");
assert(!JSON.stringify(issued).includes("PRIVATE KEY"), "Issuer response exposed private signing material.");

const trustedPublicKeysJson = JSON.stringify({
  version: p32EvidenceTrustRegistryVersion,
  keys: {
    [env.SCRIMED_P32_EVIDENCE_ISSUER_KEY_ID]: {
      issuer: env.SCRIMED_P32_EVIDENCE_ISSUER_ID,
      status: "active",
      notBefore: "2026-07-21T17:00:00.000Z",
      expiresAt: "2026-07-22T17:00:00.000Z",
      publicKeyPem: publicKey.export({ format: "pem", type: "spki" }).toString(),
      allowedAutomatedEvidenceIds: ["aal2-cli-evidence"],
      allowedApprovalGateIds: [],
      allowedIdentityAssurance: ["protected-aal2-workspace"]
    }
  }
});
const verified = verifyP32SupplementalEvidenceAttestation({
  supplementalEvidence: {
    automatedEvidence: issued.evidenceFile.automatedEvidence,
    approvals: issued.evidenceFile.approvals
  },
  attestation: issued.evidenceFile.attestation,
  trustedPublicKeysJson,
  evaluatedAt: "2026-07-21T18:01:00.000Z"
});
assert(verified?.issuer === env.SCRIMED_P32_EVIDENCE_ISSUER_ID, "Verifier rejected the protected issuer identity.");

await expectIssuerError("disabled issuer", "p32-evidence-issuer-disabled", () =>
  issueP32Aal2Evidence({
    env: { ...env, SCRIMED_P32_EVIDENCE_ISSUER_ENABLED: "false" },
    idempotencyKey: "70000000-0000-4000-8000-000000000002",
    packets: [packet],
    persistReceipt: successfulPersistence,
    request,
    now
  })
);
await expectIssuerError("candidate mismatch", "p32-evidence-issuer-candidate-mismatch", () =>
  issueP32Aal2Evidence({
    env,
    idempotencyKey: "70000000-0000-4000-8000-000000000003",
    packets: [packet],
    persistReceipt: successfulPersistence,
    request: { ...request, sourceTreeFingerprint: "9".repeat(64) },
    now
  })
);
await expectIssuerError("missing QA evidence", "p32-evidence-issuer-qa-evidence-required", () =>
  issueP32Aal2Evidence({
    env,
    idempotencyKey: "70000000-0000-4000-8000-000000000004",
    packets: [],
    persistReceipt: successfulPersistence,
    request,
    now
  })
);
await expectIssuerError("stale QA evidence", "p32-evidence-issuer-qa-evidence-required", () =>
  issueP32Aal2Evidence({
    env,
    idempotencyKey: "70000000-0000-4000-8000-000000000005",
    packets: [{ ...packet, executedAt: "2026-06-01T00:00:00.000Z" }],
    persistReceipt: successfulPersistence,
    request,
    now
  })
);
await expectIssuerError("wrong role", "p32-evidence-issuer-role-forbidden", () =>
  issueP32Aal2Evidence({
    env,
    idempotencyKey: "70000000-0000-4000-8000-000000000006",
    packets: [packet],
    persistReceipt: async () => ({
      receipt: null,
      error: { message: "governance-workspace-or-role-denied" }
    }),
    request,
    now
  })
);
await expectIssuerError("replayed issuance", "p32-evidence-issuer-replay-rejected", () =>
  issueP32Aal2Evidence({
    env,
    idempotencyKey: "70000000-0000-4000-8000-000000000007",
    packets: [packet],
    persistReceipt: async () => ({
      receipt: null,
      error: { message: "p32-evidence-attestation-idempotency-replay" }
    }),
    request,
    now
  })
);
await expectIssuerError("invalid idempotency key", "p32-evidence-issuer-idempotency-key-required", () =>
  issueP32Aal2Evidence({
    env,
    idempotencyKey: "not-a-uuid",
    packets: [packet],
    persistReceipt: successfulPersistence,
    request,
    now
  })
);
await expectIssuerError("unexpected request field", "p32-evidence-issuer-request-invalid", async () =>
  validateP32EvidenceIssuerRequest({ ...request, bearerToken: "prohibited" })
);

console.log("pass SCRIMED p.32 protected evidence issuer policy behavior");
