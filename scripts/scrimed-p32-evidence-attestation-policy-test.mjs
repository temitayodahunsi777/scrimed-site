#!/usr/bin/env node

import assert from "node:assert/strict";
import { generateKeyPairSync, sign } from "node:crypto";

import {
  computeP32SupplementalEvidencePayloadHash,
  p32EvidenceTrustRegistryVersion,
  p32SupplementalEvidenceAttestationVersion,
  verifyP32SupplementalEvidenceAttestation
} from "./lib/scrimed-p32-evidence-attestation.mjs";

const evaluatedAt = "2026-07-21T15:15:00.000Z";
const signedAt = "2026-07-21T15:10:00.000Z";
const expiresAt = "2026-07-21T15:40:00.000Z";
const keyId = "aal2-evidence-key-synthetic-v1";
const issuer = "scrimed-protected-aal2-evidence-synthetic";
const { publicKey, privateKey } = generateKeyPairSync("ed25519");
const supplementalEvidence = {
  automatedEvidence: [
    {
      evidenceId: "aal2-cli-evidence",
      identityAssurance: "protected-aal2-workspace"
    }
  ],
  approvals: []
};
const payloadHash = computeP32SupplementalEvidencePayloadHash(supplementalEvidence);
const signature = sign(null, Buffer.from(payloadHash, "hex"), privateKey).toString("base64url");
const attestation = {
  version: p32SupplementalEvidenceAttestationVersion,
  issuer,
  keyId,
  algorithm: "Ed25519",
  signedAt,
  expiresAt,
  payloadHash,
  signature
};
const trustRegistry = JSON.stringify({
  version: p32EvidenceTrustRegistryVersion,
  keys: {
    [keyId]: {
      issuer,
      publicKeyPem: publicKey.export({ type: "spki", format: "pem" }),
      status: "active",
      notBefore: "2026-07-21T14:00:00.000Z",
      expiresAt: "2026-08-21T14:00:00.000Z",
      allowedAutomatedEvidenceIds: ["aal2-cli-evidence"],
      allowedApprovalGateIds: [],
      allowedIdentityAssurance: ["protected-aal2-workspace"]
    }
  }
});
const trustRegistryWithExpiredSibling = JSON.stringify({
  ...JSON.parse(trustRegistry),
  keys: {
    ...JSON.parse(trustRegistry).keys,
    "expired-rotation-key": {
      ...JSON.parse(trustRegistry).keys[keyId],
      publicKeyPem: publicKey.export({ type: "spki", format: "pem" }),
      notBefore: "2026-06-01T00:00:00.000Z",
      expiresAt: "2026-06-30T00:00:00.000Z"
    }
  }
});

const verified = verifyP32SupplementalEvidenceAttestation({
  supplementalEvidence,
  attestation,
  trustedPublicKeysJson: trustRegistry,
  evaluatedAt
});
assert.equal(verified.issuer, issuer);
assert.equal(verified.keyId, keyId);
assert.equal(verified.payloadHash, payloadHash);
assert.match(verified.signatureFingerprint, /^[0-9a-f]{64}$/);
assert.equal("signature" in verified, false);
assert.equal(
  verifyP32SupplementalEvidenceAttestation({
    supplementalEvidence,
    attestation,
    trustedPublicKeysJson: trustRegistryWithExpiredSibling,
    evaluatedAt
  }).keyId,
  keyId
);

assert.equal(
  verifyP32SupplementalEvidenceAttestation({
    supplementalEvidence: { automatedEvidence: [], approvals: [] },
    attestation: undefined,
    trustedPublicKeysJson: undefined,
    evaluatedAt
  }),
  null
);
assert.throws(
  () => verifyP32SupplementalEvidenceAttestation({
    supplementalEvidence,
    attestation: undefined,
    trustedPublicKeysJson: trustRegistry,
    evaluatedAt
  }),
  /requires an issuer attestation/
);
assert.throws(
  () => verifyP32SupplementalEvidenceAttestation({
    supplementalEvidence: {
      ...supplementalEvidence,
      automatedEvidence: [{ ...supplementalEvidence.automatedEvidence[0], evidenceId: "post-deployment-smoke" }]
    },
    attestation,
    trustedPublicKeysJson: trustRegistry,
    evaluatedAt
  }),
  /does not cover the supplied evidence payload/
);
assert.throws(
  () => verifyP32SupplementalEvidenceAttestation({
    supplementalEvidence,
    attestation: { ...attestation, keyId: "unknown-evidence-key" },
    trustedPublicKeysJson: trustRegistry,
    evaluatedAt
  }),
  /unknown or revoked/
);
assert.throws(
  () => verifyP32SupplementalEvidenceAttestation({
    supplementalEvidence,
    attestation: { ...attestation, expiresAt: "2026-07-21T15:14:59.000Z" },
    trustedPublicKeysJson: trustRegistry,
    evaluatedAt
  }),
  /stale, expired/
);
assert.throws(
  () => verifyP32SupplementalEvidenceAttestation({
    supplementalEvidence,
    attestation,
    trustedPublicKeysJson: JSON.stringify({
      ...JSON.parse(trustRegistry),
      keys: {
        [keyId]: {
          ...JSON.parse(trustRegistry).keys[keyId],
          allowedAutomatedEvidenceIds: ["post-deployment-smoke"]
        }
      }
    }),
    evaluatedAt
  }),
  /not authorized for automated evidence/
);
assert.throws(
  () => verifyP32SupplementalEvidenceAttestation({
    supplementalEvidence,
    attestation,
    trustedPublicKeysJson: JSON.stringify({
      ...JSON.parse(trustRegistry),
      keys: {
        [keyId]: {
          ...JSON.parse(trustRegistry).keys[keyId],
          status: "revoked"
        }
      }
    }),
    evaluatedAt
  }),
  /unknown or revoked/
);

console.log("pass SCRIMED p.32 trusted evidence issuer attestation policy");
