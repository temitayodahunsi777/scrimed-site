import {
  createHash,
  createPrivateKey,
  createPublicKey,
  randomUUID,
  sign,
  type KeyObject
} from "node:crypto";
import {
  computeP32SupplementalEvidencePayloadHash,
  p32EvidenceTrustRegistryVersion,
  p32SupplementalEvidenceAttestationVersion,
  type P32SupplementalEvidenceFile
} from "./scrimedP32EvidenceAttestation";
import { createP32ApprovalEvidence } from "./scrimedP32ReleaseGates";

export const scrimedP32CandidateReviewStatus =
  "protected-p32-candidate-review-control-plane-ready";
export const scrimedP32CandidateReviewBoundary =
  "SCRIMED p.32 Candidate Review binds one distinct AAL2 workspace reviewer decision to an exact source commit, source tree, artifact, validation record, and review packet. It is metadata-only, append-only, and grants no release, deployment, migration, PHI, clinical, payer, EHR, or customer go-live authority.";

const gitCommitPattern = /^[0-9a-f]{40}$/;
const sha256Pattern = /^[0-9a-f]{64}$/;
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const identifierPattern = /^[A-Za-z0-9][A-Za-z0-9._:/-]{2,127}$/;
const assignmentLifetimeMs = 7 * 24 * 60 * 60 * 1000;
const approvalLifetimeMs = 7 * 24 * 60 * 60 * 1000;
const attestationLifetimeMs = 15 * 60 * 1000;

export type P32CandidateReviewFingerprints = {
  sourceCommit: string;
  sourceTreeFingerprint: string;
  artifactFingerprint: string;
  validationEvidenceFingerprint: string;
  reviewPacketFingerprint: string;
};

export type P32CandidateReviewAssignmentRequest = {
  reviewerIdentityHash: string;
};

export type P32CandidateReviewDecisionRequest = {
  assignmentId: string;
  decision: "approved" | "rejected";
  reasonCode:
    | "review-complete-no-material-blockers"
    | "material-changes-required";
};

export type P32CandidateReviewAssignmentReceiptInput =
  P32CandidateReviewFingerprints & {
    assignmentId: string;
    idempotencyKey: string;
    reviewerIdentityHash: string;
    reviewerRole: "principal-engineer";
    assignedAt: string;
    expiresAt: string;
  };

export type P32CandidateReviewDecisionReceiptInput = {
  assignmentId: string;
  approvalId: string;
  idempotencyKey: string;
  reviewPacketFingerprint: string;
  reasonCode: P32CandidateReviewDecisionRequest["reasonCode"];
  issuer: string;
  keyId: string;
  approvalEvidence: P32SupplementalEvidenceFile["approvals"][number];
  attestation: P32SupplementalEvidenceFile["attestation"];
  payloadHash: string;
  signatureFingerprint: string;
};

export type P32CandidateReviewAssignmentReceipt = {
  assignmentId: string;
  auditHash: string;
  previousAuditHash: string | null;
  recordedAt: string;
};

export type P32CandidateReviewDecisionReceipt = {
  approvalId: string;
  assignmentId: string;
  auditHash: string;
  previousAuditHash: string | null;
  recordedAt: string;
};

export type P32CandidateReviewAssignmentPersistenceResult = {
  receipt: P32CandidateReviewAssignmentReceipt | null;
  error: { message: string } | null;
};

export type P32CandidateReviewDecisionPersistenceResult = {
  receipt: P32CandidateReviewDecisionReceipt | null;
  error: { message: string } | null;
};

type CandidateReviewConfiguration = {
  issuer: string;
  keyId: string;
  privateKey: KeyObject;
  publicKeyFingerprint: string;
  trustedKeyExpiresAt: string;
  fingerprints: P32CandidateReviewFingerprints;
};

export class P32CandidateReviewError extends Error {
  readonly code: string;
  readonly status: 400 | 403 | 409 | 422 | 502 | 503;

  constructor(
    code: string,
    status: 400 | 403 | 409 | 422 | 502 | 503,
    message: string
  ) {
    super(message);
    this.name = "P32CandidateReviewError";
    this.code = code;
    this.status = status;
  }
}

function reviewError(
  code: string,
  status: P32CandidateReviewError["status"],
  message: string
): never {
  throw new P32CandidateReviewError(code, status, message);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizePem(value: string) {
  return value.includes("\\n") ? value.replace(/\\n/g, "\n") : value;
}

function requireSha256(value: string | undefined, label: string) {
  if (!value || !sha256Pattern.test(value)) {
    reviewError(
      "p32-candidate-review-configuration-invalid",
      503,
      `The candidate review ${label} is missing or malformed.`
    );
  }
  return value;
}

function hasExactIdentifiers(value: unknown, expected: string[]) {
  return (
    Array.isArray(value) &&
    value.length === expected.length &&
    expected.every((identifier) => value.includes(identifier))
  );
}

function requireTrustedReviewKey({
  env,
  issuer,
  keyId,
  publicKeyFingerprint,
  now
}: {
  env: NodeJS.ProcessEnv;
  issuer: string;
  keyId: string;
  publicKeyFingerprint: string;
  now: Date;
}) {
  const rawRegistry = env.SCRIMED_P32_EVIDENCE_TRUSTED_PUBLIC_KEYS_JSON;
  if (!rawRegistry?.trim() || /-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(rawRegistry)) {
    reviewError(
      "p32-candidate-review-trust-registry-invalid",
      503,
      "The candidate-review public key is not safely configured in the evidence trust registry."
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawRegistry);
  } catch {
    reviewError(
      "p32-candidate-review-trust-registry-invalid",
      503,
      "The candidate-review evidence trust registry is malformed."
    );
  }
  if (
    !isObject(parsed) ||
    parsed.version !== p32EvidenceTrustRegistryVersion ||
    !isObject(parsed.keys) ||
    !isObject(parsed.keys[keyId])
  ) {
    reviewError(
      "p32-candidate-review-trust-registry-invalid",
      503,
      "The candidate-review key is absent from the supported evidence trust registry."
    );
  }

  const entry = parsed.keys[keyId];
  const notBeforeMs = typeof entry.notBefore === "string" ? Date.parse(entry.notBefore) : NaN;
  const expiresAtMs = typeof entry.expiresAt === "string" ? Date.parse(entry.expiresAt) : NaN;
  if (
    entry.issuer !== issuer ||
    (entry.status !== "active" && entry.status !== "retiring") ||
    !Number.isFinite(notBeforeMs) ||
    !Number.isFinite(expiresAtMs) ||
    notBeforeMs > now.getTime() ||
    expiresAtMs <= now.getTime() + attestationLifetimeMs ||
    !hasExactIdentifiers(entry.allowedAutomatedEvidenceIds, []) ||
    !hasExactIdentifiers(entry.allowedApprovalGateIds, ["named-reviewer-approval"]) ||
    !hasExactIdentifiers(entry.allowedIdentityAssurance, ["aal2-protected-workspace"]) ||
    typeof entry.publicKeyPem !== "string"
  ) {
    reviewError(
      "p32-candidate-review-trust-scope-invalid",
      503,
      "The candidate-review key is inactive, expired, or not limited to the required reviewer-approval scope."
    );
  }

  let trustedPublicKey: KeyObject;
  try {
    trustedPublicKey = createPublicKey(normalizePem(entry.publicKeyPem));
  } catch {
    reviewError(
      "p32-candidate-review-trust-key-invalid",
      503,
      "The candidate-review trusted public key could not be loaded."
    );
  }
  if (
    trustedPublicKey.type !== "public" ||
    trustedPublicKey.asymmetricKeyType !== "ed25519" ||
    createHash("sha256")
      .update(trustedPublicKey.export({ format: "der", type: "spki" }))
      .digest("hex") !== publicKeyFingerprint
  ) {
    reviewError(
      "p32-candidate-review-trust-key-mismatch",
      503,
      "The candidate-review signing key does not match its trusted public-key entry."
    );
  }

  return new Date(expiresAtMs).toISOString();
}

export function isP32CandidateReviewEnabled(
  env: NodeJS.ProcessEnv = process.env
) {
  return env.SCRIMED_P32_CANDIDATE_REVIEW_ENABLED === "true";
}

function loadCandidateReviewConfiguration(
  env: NodeJS.ProcessEnv = process.env,
  now = new Date()
): CandidateReviewConfiguration {
  assertClock(now);
  if (!isP32CandidateReviewEnabled(env)) {
    reviewError(
      "p32-candidate-review-disabled",
      503,
      "Protected p.32 candidate review is disabled by default."
    );
  }

  const issuer = env.SCRIMED_P32_CANDIDATE_REVIEW_ISSUER_ID?.trim();
  const keyId = env.SCRIMED_P32_CANDIDATE_REVIEW_KEY_ID?.trim();
  const sourceCommit = env.SCRIMED_P32_CANDIDATE_REVIEW_SOURCE_COMMIT?.trim();
  const privateKeyPem = env.SCRIMED_P32_CANDIDATE_REVIEW_PRIVATE_KEY_PEM;

  if (!issuer || !identifierPattern.test(issuer) || !keyId || !identifierPattern.test(keyId)) {
    reviewError(
      "p32-candidate-review-configuration-invalid",
      503,
      "The candidate review issuer identity or key identifier is missing or malformed."
    );
  }
  if (!sourceCommit || !gitCommitPattern.test(sourceCommit)) {
    reviewError(
      "p32-candidate-review-configuration-invalid",
      503,
      "The candidate review source commit is missing or malformed."
    );
  }
  if (!privateKeyPem?.trim()) {
    reviewError(
      "p32-candidate-review-key-unavailable",
      503,
      "Protected candidate review signing material is unavailable."
    );
  }

  let privateKey: KeyObject;
  try {
    privateKey = createPrivateKey(normalizePem(privateKeyPem));
  } catch {
    reviewError(
      "p32-candidate-review-key-invalid",
      503,
      "Protected candidate review signing material could not be loaded."
    );
  }
  if (privateKey.type !== "private" || privateKey.asymmetricKeyType !== "ed25519") {
    reviewError(
      "p32-candidate-review-key-invalid",
      503,
      "Protected candidate review signing material must be an Ed25519 private key."
    );
  }

  const publicKey = createPublicKey(privateKey);
  const publicKeyFingerprint = createHash("sha256")
    .update(publicKey.export({ format: "der", type: "spki" }))
    .digest("hex");
  return {
    issuer,
    keyId,
    privateKey,
    publicKeyFingerprint,
    trustedKeyExpiresAt: requireTrustedReviewKey({
      env,
      issuer,
      keyId,
      publicKeyFingerprint,
      now
    }),
    fingerprints: {
      sourceCommit,
      sourceTreeFingerprint: requireSha256(
        env.SCRIMED_P32_CANDIDATE_REVIEW_SOURCE_TREE_FINGERPRINT?.trim(),
        "source-tree fingerprint"
      ),
      artifactFingerprint: requireSha256(
        env.SCRIMED_P32_CANDIDATE_REVIEW_ARTIFACT_FINGERPRINT?.trim(),
        "artifact fingerprint"
      ),
      validationEvidenceFingerprint: requireSha256(
        env.SCRIMED_P32_CANDIDATE_REVIEW_VALIDATION_FINGERPRINT?.trim(),
        "validation fingerprint"
      ),
      reviewPacketFingerprint: requireSha256(
        env.SCRIMED_P32_CANDIDATE_REVIEW_PACKET_FINGERPRINT?.trim(),
        "review-packet fingerprint"
      )
    }
  };
}

export function createP32CandidateReviewerIdentityHash(userId: string) {
  if (!uuidPattern.test(userId)) {
    reviewError(
      "p32-candidate-review-identity-invalid",
      403,
      "The authenticated reviewer identity is not eligible for candidate review."
    );
  }
  return createHash("sha256")
    .update(`scrimed-p32-reviewer-v1|${userId}`)
    .digest("hex");
}

export function createP32CandidateTenantScopeHash(tenantId: string) {
  if (!uuidPattern.test(tenantId)) {
    reviewError(
      "p32-candidate-review-tenant-invalid",
      403,
      "The authenticated tenant scope is not eligible for candidate review."
    );
  }
  return createHash("sha256")
    .update(`scrimed-p32-tenant-v1|${tenantId}`)
    .digest("hex");
}

export function validateP32CandidateReviewAssignmentRequest(
  value: unknown
): P32CandidateReviewAssignmentRequest {
  if (
    !isObject(value) ||
    Object.keys(value).length !== 1 ||
    Object.keys(value)[0] !== "reviewerIdentityHash" ||
    typeof value.reviewerIdentityHash !== "string" ||
    !sha256Pattern.test(value.reviewerIdentityHash)
  ) {
    reviewError(
      "p32-candidate-review-assignment-invalid",
      400,
      "Candidate review assignment requires one SHA-256 reviewer identity hash."
    );
  }
  return { reviewerIdentityHash: value.reviewerIdentityHash };
}

export function validateP32CandidateReviewDecisionRequest(
  value: unknown
): P32CandidateReviewDecisionRequest {
  const allowedFields = new Set(["assignmentId", "decision", "reasonCode"]);
  if (
    !isObject(value) ||
    Object.keys(value).length !== allowedFields.size ||
    Object.keys(value).some((field) => !allowedFields.has(field)) ||
    typeof value.assignmentId !== "string" ||
    !uuidPattern.test(value.assignmentId) ||
    (value.decision !== "approved" && value.decision !== "rejected") ||
    (value.reasonCode !== "review-complete-no-material-blockers" &&
      value.reasonCode !== "material-changes-required") ||
    (value.decision === "approved" &&
      value.reasonCode !== "review-complete-no-material-blockers") ||
    (value.decision === "rejected" &&
      value.reasonCode !== "material-changes-required")
  ) {
    reviewError(
      "p32-candidate-review-decision-invalid",
      400,
      "Candidate review decisions require a UUID assignment, a controlled decision, and its matching reason code."
    );
  }
  return value as P32CandidateReviewDecisionRequest;
}

function assertIdempotencyKey(idempotencyKey: string) {
  if (!uuidPattern.test(idempotencyKey)) {
    reviewError(
      "p32-candidate-review-idempotency-key-required",
      400,
      "A UUID Idempotency-Key header is required."
    );
  }
}

function assertClock(now: Date) {
  if (!Number.isFinite(now.getTime())) {
    reviewError(
      "p32-candidate-review-clock-invalid",
      503,
      "The protected candidate review clock is invalid."
    );
  }
}

function persistenceError(message: string): never {
  if (
    message.includes("role-denied") ||
    message.includes("aal2-session-required") ||
    message.includes("reviewer-not-eligible") ||
    message.includes("separation-of-duties")
  ) {
    reviewError(
      "p32-candidate-review-forbidden",
      403,
      "The authenticated workspace identity is not authorized for this candidate-review stage."
    );
  }
  if (
    message.includes("idempotency") ||
    message.includes("already-decided") ||
    message.includes("duplicate")
  ) {
    reviewError(
      "p32-candidate-review-replay-rejected",
      409,
      "The candidate-review assignment, decision, or idempotency key was already used."
    );
  }
  if (
    message.includes("assignment-not-found") ||
    message.includes("assignment-expired") ||
    message.includes("candidate-mismatch")
  ) {
    reviewError(
      "p32-candidate-review-assignment-ineligible",
      422,
      "The candidate-review assignment is missing, expired, or bound to a different candidate."
    );
  }
  if (message.includes("does not exist") || message.includes("schema cache")) {
    reviewError(
      "p32-candidate-review-store-unavailable",
      503,
      "The protected candidate-review ledger is unavailable."
    );
  }
  reviewError(
    "p32-candidate-review-persistence-failed",
    502,
    "The protected candidate-review receipt could not be persisted."
  );
}

export function getP32CandidateReviewSummary({
  env = process.env,
  tenantId,
  userId,
  now = new Date()
}: {
  env?: NodeJS.ProcessEnv;
  tenantId: string;
  userId: string;
  now?: Date;
}) {
  const configuration = loadCandidateReviewConfiguration(env, now);
  return {
    status: scrimedP32CandidateReviewStatus,
    reviewerIdentityHash: createP32CandidateReviewerIdentityHash(userId),
    tenantScopeHash: createP32CandidateTenantScopeHash(tenantId),
    fingerprints: configuration.fingerprints,
    issuer: {
      issuer: configuration.issuer,
      keyId: configuration.keyId,
      publicKeyFingerprint: configuration.publicKeyFingerprint,
      trustedKeyExpiresAt: configuration.trustedKeyExpiresAt
    },
    reviewerRole: "principal-engineer" as const,
    releaseAuthorityGranted: false as const,
    boundary: scrimedP32CandidateReviewBoundary
  };
}

export async function createP32CandidateReviewAssignment({
  env = process.env,
  idempotencyKey,
  request,
  assignerUserId,
  persistAssignment,
  now = new Date()
}: {
  env?: NodeJS.ProcessEnv;
  idempotencyKey: string;
  request: P32CandidateReviewAssignmentRequest;
  assignerUserId: string;
  persistAssignment: (
    input: P32CandidateReviewAssignmentReceiptInput
  ) => Promise<P32CandidateReviewAssignmentPersistenceResult>;
  now?: Date;
}) {
  assertIdempotencyKey(idempotencyKey);
  assertClock(now);
  const configuration = loadCandidateReviewConfiguration(env, now);
  const assignerIdentityHash = createP32CandidateReviewerIdentityHash(assignerUserId);
  if (assignerIdentityHash === request.reviewerIdentityHash) {
    reviewError(
      "p32-candidate-review-separation-of-duties-required",
      403,
      "A candidate owner cannot assign the review to the same identity."
    );
  }

  const assignmentId = randomUUID();
  const assignedAt = now.toISOString();
  const expiresAt = new Date(
    Math.min(
      now.getTime() + assignmentLifetimeMs,
      Date.parse(configuration.trustedKeyExpiresAt) - attestationLifetimeMs
    )
  ).toISOString();
  const persistence = await persistAssignment({
    assignmentId,
    idempotencyKey,
    reviewerIdentityHash: request.reviewerIdentityHash,
    reviewerRole: "principal-engineer",
    ...configuration.fingerprints,
    assignedAt,
    expiresAt
  });
  if (persistence.error || !persistence.receipt) {
    persistenceError(persistence.error?.message ?? "assignment-receipt-missing");
  }

  return {
    assignment: {
      assignmentId,
      reviewerIdentityHash: request.reviewerIdentityHash,
      reviewerRole: "principal-engineer" as const,
      ...configuration.fingerprints,
      assignedAt,
      expiresAt
    },
    receipt: persistence.receipt,
    releaseAuthorityGranted: false as const
  };
}

export async function recordP32CandidateReviewDecision({
  env = process.env,
  idempotencyKey,
  request,
  reviewerUserId,
  tenantId,
  persistDecision,
  now = new Date()
}: {
  env?: NodeJS.ProcessEnv;
  idempotencyKey: string;
  request: P32CandidateReviewDecisionRequest;
  reviewerUserId: string;
  tenantId: string;
  persistDecision: (
    input: P32CandidateReviewDecisionReceiptInput
  ) => Promise<P32CandidateReviewDecisionPersistenceResult>;
  now?: Date;
}) {
  assertIdempotencyKey(idempotencyKey);
  assertClock(now);
  const configuration = loadCandidateReviewConfiguration(env, now);
  const reviewerId = createP32CandidateReviewerIdentityHash(reviewerUserId);
  const approvalId = randomUUID();
  const approvedAt = now.toISOString();
  const approvalExpiresAt = new Date(now.getTime() + approvalLifetimeMs).toISOString();
  const evidencePointer = `p32-candidate-review:${approvalId}`;
  const approvalEvidence = createP32ApprovalEvidence({
    approvalId,
    gateId: "named-reviewer-approval",
    reviewerId,
    reviewerRole: "principal-engineer",
    identityAssurance: "aal2-protected-workspace",
    tenantScopeHash: createP32CandidateTenantScopeHash(tenantId),
    decision: request.decision,
    sourceCommit: configuration.fingerprints.sourceCommit,
    sourceTreeFingerprint: configuration.fingerprints.sourceTreeFingerprint,
    artifactFingerprint: configuration.fingerprints.artifactFingerprint,
    validationEvidenceFingerprint:
      configuration.fingerprints.validationEvidenceFingerprint,
    evidencePointer,
    approvedAt,
    expiresAt: approvalExpiresAt,
    releaseAuthorityGranted: false
  });
  const supplementalEvidence = {
    automatedEvidence: [] as [],
    approvals: [approvalEvidence]
  };
  const payloadHash = computeP32SupplementalEvidencePayloadHash(supplementalEvidence);
  const signatureBytes = sign(
    null,
    Buffer.from(payloadHash, "hex"),
    configuration.privateKey
  );
  const attestationExpiresAt = new Date(
    now.getTime() + attestationLifetimeMs
  ).toISOString();
  const evidenceFile: P32SupplementalEvidenceFile = {
    ...supplementalEvidence,
    attestation: {
      version: p32SupplementalEvidenceAttestationVersion,
      issuer: configuration.issuer,
      keyId: configuration.keyId,
      algorithm: "Ed25519",
      signedAt: approvedAt,
      expiresAt: attestationExpiresAt,
      payloadHash,
      signature: signatureBytes.toString("base64url")
    }
  };

  const persistence = await persistDecision({
    assignmentId: request.assignmentId,
    approvalId,
    idempotencyKey,
    reviewPacketFingerprint: configuration.fingerprints.reviewPacketFingerprint,
    reasonCode: request.reasonCode,
    issuer: configuration.issuer,
    keyId: configuration.keyId,
    approvalEvidence,
    attestation: evidenceFile.attestation,
    payloadHash,
    signatureFingerprint: createHash("sha256")
      .update(signatureBytes)
      .digest("hex")
  });
  if (persistence.error || !persistence.receipt) {
    persistenceError(persistence.error?.message ?? "decision-receipt-missing");
  }

  return {
    evidenceFile,
    receipt: persistence.receipt,
    issuer: {
      issuer: configuration.issuer,
      keyId: configuration.keyId,
      publicKeyFingerprint: configuration.publicKeyFingerprint
    },
    reviewPacketFingerprint: configuration.fingerprints.reviewPacketFingerprint,
    humanDecisionRecorded: true as const,
    releaseAuthorityGranted: false as const
  };
}
