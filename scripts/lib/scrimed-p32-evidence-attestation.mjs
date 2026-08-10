import {
  createHash,
  createPublicKey,
  timingSafeEqual,
  verify
} from "node:crypto";

import {
  computeP32SupplementalEvidencePayloadHash,
  p32EvidenceTrustRegistryVersion,
  p32SupplementalEvidenceAttestationVersion
} from "../../app/lib/scrimedP32EvidenceAttestation.ts";

export {
  computeP32SupplementalEvidencePayloadHash,
  p32EvidenceTrustRegistryVersion,
  p32SupplementalEvidenceAttestationVersion
};

const maximumAttestationLifetimeMs = 60 * 60 * 1000;
const maximumFutureClockSkewMs = 5 * 60 * 1000;
const maximumTrustedKeys = 32;
const sha256Pattern = /^[0-9a-f]{64}$/;
const signaturePattern = /^[A-Za-z0-9_-]{86}$/;
const identifierPattern = /^[A-Za-z0-9][A-Za-z0-9._:/-]{2,127}$/;

function reject(reason) {
  throw new Error(`SCRIMED p.32 supplemental evidence attestation rejected: ${reason}`);
}

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function parseTimestamp(value, label) {
  if (typeof value !== "string" || !Number.isFinite(Date.parse(value))) {
    reject(`${label} must be an ISO timestamp`);
  }
  return Date.parse(value);
}

function requireStringArray(value, label) {
  if (
    !Array.isArray(value) ||
    value.some((item) => typeof item !== "string" || !identifierPattern.test(item))
  ) {
    reject(`${label} must be a bounded identifier array`);
  }
  return new Set(value);
}

function parseTrustedRegistry(rawRegistry) {
  if (typeof rawRegistry !== "string" || !rawRegistry.trim()) {
    reject("trusted public-key configuration is required for non-empty evidence");
  }
  if (/-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(rawRegistry)) {
    reject("trusted public-key configuration must never contain private keys");
  }

  let parsed;
  try {
    parsed = JSON.parse(rawRegistry);
  } catch {
    reject("trusted public-key configuration must be valid JSON");
  }
  if (
    !isObject(parsed) ||
    parsed.version !== p32EvidenceTrustRegistryVersion ||
    !isObject(parsed.keys)
  ) {
    reject("trusted public-key configuration has an unsupported schema version");
  }

  const entries = Object.entries(parsed.keys);
  if (entries.length === 0 || entries.length > maximumTrustedKeys) {
    reject("trusted public-key configuration must contain 1 to 32 keys");
  }

  const registry = new Map();
  for (const [keyId, entry] of entries) {
    if (!identifierPattern.test(keyId) || !isObject(entry)) {
      reject("trusted public-key entry is malformed");
    }
    if (typeof entry.issuer !== "string" || !identifierPattern.test(entry.issuer)) {
      reject(`trusted issuer metadata is invalid for key ${keyId}`);
    }
    if (!new Set(["active", "retiring", "revoked"]).has(entry.status)) {
      reject(`trusted key status is invalid for key ${keyId}`);
    }
    if (entry.status === "revoked") {
      registry.set(keyId, { ...entry, revoked: true });
      continue;
    }

    const notBeforeMs = parseTimestamp(entry.notBefore, `notBefore for key ${keyId}`);
    const expiresAtMs = parseTimestamp(entry.expiresAt, `expiresAt for key ${keyId}`);
    if (notBeforeMs >= expiresAtMs) {
      reject(`trusted key validity window is invalid for key ${keyId}`);
    }
    if (typeof entry.publicKeyPem !== "string") {
      reject(`trusted public key is missing for key ${keyId}`);
    }

    let publicKey;
    try {
      publicKey = createPublicKey(entry.publicKeyPem);
    } catch {
      reject(`trusted public key could not be parsed for key ${keyId}`);
    }
    if (publicKey.type !== "public" || publicKey.asymmetricKeyType !== "ed25519") {
      reject(`trusted key ${keyId} must be an Ed25519 public key`);
    }

    registry.set(keyId, {
      issuer: entry.issuer,
      status: entry.status,
      notBeforeMs,
      expiresAtMs,
      publicKey,
      allowedAutomatedEvidenceIds: requireStringArray(
        entry.allowedAutomatedEvidenceIds,
        `allowedAutomatedEvidenceIds for key ${keyId}`
      ),
      allowedApprovalGateIds: requireStringArray(
        entry.allowedApprovalGateIds,
        `allowedApprovalGateIds for key ${keyId}`
      ),
      allowedIdentityAssurance: requireStringArray(
        entry.allowedIdentityAssurance,
        `allowedIdentityAssurance for key ${keyId}`
      ),
      revoked: false
    });
  }
  return registry;
}

function assertIssuerScope(entry, supplementalEvidence) {
  for (const evidence of supplementalEvidence.automatedEvidence) {
    if (!entry.allowedAutomatedEvidenceIds.has(evidence.evidenceId)) {
      reject(`issuer is not authorized for automated evidence ${evidence.evidenceId}`);
    }
    if (!entry.allowedIdentityAssurance.has(evidence.identityAssurance)) {
      reject(`issuer is not authorized for identity assurance ${evidence.identityAssurance}`);
    }
  }
  for (const approval of supplementalEvidence.approvals) {
    if (!entry.allowedApprovalGateIds.has(approval.gateId)) {
      reject(`issuer is not authorized for approval gate ${approval.gateId}`);
    }
    if (!entry.allowedIdentityAssurance.has(approval.identityAssurance)) {
      reject(`issuer is not authorized for identity assurance ${approval.identityAssurance}`);
    }
  }
}

export function verifyP32SupplementalEvidenceAttestation({
  supplementalEvidence,
  attestation,
  trustedPublicKeysJson,
  evaluatedAt = new Date().toISOString()
}) {
  if (
    !isObject(supplementalEvidence) ||
    !Array.isArray(supplementalEvidence.automatedEvidence) ||
    !Array.isArray(supplementalEvidence.approvals)
  ) {
    reject("supplemental evidence requires automatedEvidence and approvals arrays");
  }
  const payloadHash = computeP32SupplementalEvidencePayloadHash(supplementalEvidence);
  const hasEvidence =
    supplementalEvidence.automatedEvidence.length > 0 ||
    supplementalEvidence.approvals.length > 0;
  if (!hasEvidence && attestation === undefined) return null;
  if (!isObject(attestation)) {
    reject("non-empty evidence requires an issuer attestation");
  }

  const requiredFields = [
    "version",
    "issuer",
    "keyId",
    "algorithm",
    "signedAt",
    "expiresAt",
    "payloadHash",
    "signature"
  ];
  if (
    Object.keys(attestation).some((field) => !requiredFields.includes(field)) ||
    requiredFields.some((field) => !(field in attestation))
  ) {
    reject("issuer attestation fields do not match the supported schema");
  }
  if (
    attestation.version !== p32SupplementalEvidenceAttestationVersion ||
    attestation.algorithm !== "Ed25519" ||
    typeof attestation.issuer !== "string" ||
    !identifierPattern.test(attestation.issuer) ||
    typeof attestation.keyId !== "string" ||
    !identifierPattern.test(attestation.keyId)
  ) {
    reject("issuer attestation identity or algorithm is invalid");
  }
  if (
    typeof attestation.payloadHash !== "string" ||
    !sha256Pattern.test(attestation.payloadHash) ||
    typeof attestation.signature !== "string" ||
    !signaturePattern.test(attestation.signature)
  ) {
    reject("issuer attestation payload hash or signature is malformed");
  }

  const evaluatedAtMs = parseTimestamp(evaluatedAt, "evaluatedAt");
  const signedAtMs = parseTimestamp(attestation.signedAt, "signedAt");
  const expiresAtMs = parseTimestamp(attestation.expiresAt, "expiresAt");
  if (
    signedAtMs > evaluatedAtMs + maximumFutureClockSkewMs ||
    signedAtMs >= expiresAtMs ||
    expiresAtMs <= evaluatedAtMs ||
    expiresAtMs - signedAtMs > maximumAttestationLifetimeMs ||
    evaluatedAtMs - signedAtMs > maximumAttestationLifetimeMs
  ) {
    reject("issuer attestation is stale, expired, future-dated, or overlong");
  }

  const expectedHashBytes = Buffer.from(payloadHash, "hex");
  const suppliedHashBytes = Buffer.from(attestation.payloadHash, "hex");
  if (
    expectedHashBytes.length !== suppliedHashBytes.length ||
    !timingSafeEqual(expectedHashBytes, suppliedHashBytes)
  ) {
    reject("issuer attestation does not cover the supplied evidence payload");
  }

  const trustedRegistry = parseTrustedRegistry(trustedPublicKeysJson);
  const trustedEntry = trustedRegistry.get(attestation.keyId);
  if (!trustedEntry || trustedEntry.revoked) {
    reject("issuer key is unknown or revoked");
  }
  if (trustedEntry.issuer !== attestation.issuer) {
    reject("issuer identity does not match the trusted key registry");
  }
  if (
    evaluatedAtMs < trustedEntry.notBeforeMs ||
    evaluatedAtMs >= trustedEntry.expiresAtMs ||
    signedAtMs < trustedEntry.notBeforeMs ||
    expiresAtMs > trustedEntry.expiresAtMs
  ) {
    reject("issuer attestation falls outside the trusted key validity window");
  }
  assertIssuerScope(trustedEntry, supplementalEvidence);

  const signatureBytes = Buffer.from(attestation.signature, "base64url");
  if (
    signatureBytes.length !== 64 ||
    !verify(null, expectedHashBytes, trustedEntry.publicKey, signatureBytes)
  ) {
    reject("issuer signature verification failed");
  }

  return {
    version: attestation.version,
    issuer: attestation.issuer,
    keyId: attestation.keyId,
    algorithm: "Ed25519",
    signedAt: attestation.signedAt,
    expiresAt: attestation.expiresAt,
    payloadHash,
    signatureFingerprint: createHash("sha256").update(signatureBytes).digest("hex"),
    verifiedAt: new Date(evaluatedAtMs).toISOString(),
    verificationMethod: "ed25519-trusted-issuer"
  };
}
