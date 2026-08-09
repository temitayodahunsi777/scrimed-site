import {
  createHash,
  createPrivateKey,
  createPublicKey,
  randomUUID,
  sign,
  type KeyObject
} from "node:crypto";
import type { QaManualRunEvidencePacketRecord } from "./qaEvidenceLedger";
import {
  computeP32SupplementalEvidencePayloadHash,
  p32SupplementalEvidenceAttestationVersion,
  type P32SupplementalEvidenceFile
} from "./scrimedP32EvidenceAttestation";
import { createP32AutomatedGateEvidence } from "./scrimedP32ReleaseGates";

export const scrimedP32EvidenceIssuerStatus =
  "protected-p32-aal2-evidence-issuer-ready";
export const scrimedP32EvidenceIssuerBoundary =
  "The SCRIMED p.32 Evidence Issuer signs one short-lived, no-PHI AAL2 technical evidence record only after protected tenant authorization, exact candidate fingerprint matching, retained QA packet validation, and append-only receipt persistence. It does not sign human approvals, grant release authority, authorize deployment, process PHI, perform clinical action, or expose private signing material.";

const gitCommitPattern = /^[0-9a-f]{40}$/;
const sha256Pattern = /^[0-9a-f]{64}$/;
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const identifierPattern = /^[A-Za-z0-9][A-Za-z0-9._:/-]{2,127}$/;
const maximumQaEvidenceAgeMs = 14 * 24 * 60 * 60 * 1000;
const maximumFutureClockSkewMs = 5 * 60 * 1000;
const attestationLifetimeMs = 15 * 60 * 1000;

export type P32EvidenceIssuerRequest = {
  sourceCommit: string;
  sourceTreeFingerprint: string;
  artifactFingerprint: string;
  validationEvidenceFingerprint: string;
};

export type P32EvidenceIssuerReceiptInput = {
  issuanceId: string;
  idempotencyKey: string;
  qaEvidencePacketId: string;
  qaEvidencePacketHash: string;
  issuer: string;
  keyId: string;
  evidenceId: "aal2-cli-evidence";
  sourceCommit: string;
  sourceTreeFingerprint: string;
  artifactFingerprint: string;
  validationEvidenceFingerprint: string;
  generatedAt: string;
  checkedAt: string;
  expiresAt: string;
  evidencePointer: string;
  evidenceHash: string;
  payloadHash: string;
  signatureFingerprint: string;
};

export type P32EvidenceIssuerReceipt = {
  issuanceId: string;
  auditHash: string;
  previousAuditHash: string | null;
  recordedAt: string;
};

export type P32EvidenceIssuerPersistenceResult = {
  receipt: P32EvidenceIssuerReceipt | null;
  error: { message: string } | null;
};

type IssuerConfiguration = {
  issuer: string;
  keyId: string;
  privateKey: KeyObject;
  publicKeyFingerprint: string;
  expectedFingerprints: P32EvidenceIssuerRequest;
};

export class P32EvidenceIssuerError extends Error {
  readonly code: string;
  readonly status: 400 | 403 | 409 | 422 | 502 | 503;

  constructor(
    code: string,
    status: 400 | 403 | 409 | 422 | 502 | 503,
    message: string
  ) {
    super(message);
    this.name = "P32EvidenceIssuerError";
    this.code = code;
    this.status = status;
  }
}

function issuerError(
  code: string,
  status: P32EvidenceIssuerError["status"],
  message: string
): never {
  throw new P32EvidenceIssuerError(code, status, message);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function requireFingerprint(value: string | undefined, label: string) {
  if (!value || !sha256Pattern.test(value)) {
    issuerError(
      "p32-evidence-issuer-configuration-invalid",
      503,
      `The protected issuer ${label} is missing or malformed.`
    );
  }
  return value;
}

function normalizePem(value: string) {
  return value.includes("\\n") ? value.replace(/\\n/g, "\n") : value;
}

export function isP32EvidenceIssuerEnabled(
  env: NodeJS.ProcessEnv = process.env
) {
  return env.SCRIMED_P32_EVIDENCE_ISSUER_ENABLED === "true";
}

function loadIssuerConfiguration(
  env: NodeJS.ProcessEnv = process.env
): IssuerConfiguration {
  if (!isP32EvidenceIssuerEnabled(env)) {
    issuerError(
      "p32-evidence-issuer-disabled",
      503,
      "Protected p.32 evidence issuance is disabled by default."
    );
  }

  const issuer = env.SCRIMED_P32_EVIDENCE_ISSUER_ID?.trim();
  const keyId = env.SCRIMED_P32_EVIDENCE_ISSUER_KEY_ID?.trim();
  const privateKeyPem = env.SCRIMED_P32_EVIDENCE_ISSUER_PRIVATE_KEY_PEM;
  const sourceCommit = env.SCRIMED_P32_EVIDENCE_ISSUER_SOURCE_COMMIT?.trim();

  if (!issuer || !identifierPattern.test(issuer) || !keyId || !identifierPattern.test(keyId)) {
    issuerError(
      "p32-evidence-issuer-configuration-invalid",
      503,
      "The protected issuer identity or key identifier is missing or malformed."
    );
  }
  if (!sourceCommit || !gitCommitPattern.test(sourceCommit)) {
    issuerError(
      "p32-evidence-issuer-configuration-invalid",
      503,
      "The protected issuer source commit is missing or malformed."
    );
  }
  if (!privateKeyPem?.trim()) {
    issuerError(
      "p32-evidence-issuer-key-unavailable",
      503,
      "Protected signing material is unavailable."
    );
  }

  let privateKey: KeyObject;
  try {
    privateKey = createPrivateKey(normalizePem(privateKeyPem));
  } catch {
    issuerError(
      "p32-evidence-issuer-key-invalid",
      503,
      "Protected signing material could not be loaded."
    );
  }
  if (privateKey.type !== "private" || privateKey.asymmetricKeyType !== "ed25519") {
    issuerError(
      "p32-evidence-issuer-key-invalid",
      503,
      "Protected signing material must be an Ed25519 private key."
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
    expectedFingerprints: {
      sourceCommit,
      sourceTreeFingerprint: requireFingerprint(
        env.SCRIMED_P32_EVIDENCE_ISSUER_SOURCE_TREE_FINGERPRINT?.trim(),
        "source-tree fingerprint"
      ),
      artifactFingerprint: requireFingerprint(
        env.SCRIMED_P32_EVIDENCE_ISSUER_ARTIFACT_FINGERPRINT?.trim(),
        "artifact fingerprint"
      ),
      validationEvidenceFingerprint: requireFingerprint(
        env.SCRIMED_P32_EVIDENCE_ISSUER_VALIDATION_FINGERPRINT?.trim(),
        "validation fingerprint"
      )
    }
  };
}

export function validateP32EvidenceIssuerRequest(
  value: unknown
): P32EvidenceIssuerRequest {
  const allowedFields = new Set([
    "sourceCommit",
    "sourceTreeFingerprint",
    "artifactFingerprint",
    "validationEvidenceFingerprint"
  ]);
  if (
    !isObject(value) ||
    Object.keys(value).some((field) => !allowedFields.has(field)) ||
    Object.keys(value).length !== allowedFields.size
  ) {
    issuerError(
      "p32-evidence-issuer-request-invalid",
      400,
      "The issuance request must contain only the four exact candidate fingerprint fields."
    );
  }

  const request = value as Record<keyof P32EvidenceIssuerRequest, unknown>;
  if (
    typeof request.sourceCommit !== "string" ||
    !gitCommitPattern.test(request.sourceCommit) ||
    typeof request.sourceTreeFingerprint !== "string" ||
    !sha256Pattern.test(request.sourceTreeFingerprint) ||
    typeof request.artifactFingerprint !== "string" ||
    !sha256Pattern.test(request.artifactFingerprint) ||
    typeof request.validationEvidenceFingerprint !== "string" ||
    !sha256Pattern.test(request.validationEvidenceFingerprint)
  ) {
    issuerError(
      "p32-evidence-issuer-request-invalid",
      400,
      "Candidate fingerprints must use exact lowercase Git SHA-1 and SHA-256 values."
    );
  }

  return request as P32EvidenceIssuerRequest;
}

function assertExactCandidate(
  request: P32EvidenceIssuerRequest,
  expected: P32EvidenceIssuerRequest
) {
  if (
    request.sourceCommit !== expected.sourceCommit ||
    request.sourceTreeFingerprint !== expected.sourceTreeFingerprint ||
    request.artifactFingerprint !== expected.artifactFingerprint ||
    request.validationEvidenceFingerprint !== expected.validationEvidenceFingerprint
  ) {
    issuerError(
      "p32-evidence-issuer-candidate-mismatch",
      409,
      "The requested fingerprints do not match the candidate configured for this issuer."
    );
  }
}

function selectCurrentQaEvidencePacket(
  packets: QaManualRunEvidencePacketRecord[],
  evaluatedAtMs: number
) {
  const packet = packets.find((candidate) => {
    const executedAtMs = Date.parse(candidate.executedAt);
    const createdAtMs = Date.parse(candidate.createdAt);
    return candidate.workflowKind === "execution-attempt-durable-store-qa" &&
      candidate.qaOutcome === "pass" &&
      candidate.operatorAttestation === "no-secrets-no-phi-aal2-human-run" &&
      candidate.tokenDisposalAttestation === "temporary-token-deleted-or-rotated" &&
      candidate.dataBoundary === "synthetic-business-workflow-only" &&
      sha256Pattern.test(candidate.packetSha256) &&
      Number.isFinite(executedAtMs) &&
      Number.isFinite(createdAtMs) &&
      executedAtMs <= evaluatedAtMs + maximumFutureClockSkewMs &&
      createdAtMs <= evaluatedAtMs + maximumFutureClockSkewMs &&
      evaluatedAtMs - executedAtMs <= maximumQaEvidenceAgeMs &&
      evaluatedAtMs - createdAtMs <= maximumQaEvidenceAgeMs;
  });

  if (!packet) {
    issuerError(
      "p32-evidence-issuer-qa-evidence-required",
      422,
      "No current retained no-PHI durable-store AAL2 QA packet is eligible for issuance."
    );
  }
  return packet;
}

function persistenceError(message: string): never {
  if (message.includes("role-denied") || message.includes("aal2-session-required")) {
    issuerError(
      "p32-evidence-issuer-role-forbidden",
      403,
      "The authenticated workspace role is not authorized to issue p.32 evidence."
    );
  }
  if (message.includes("duplicate") || message.includes("idempotency")) {
    issuerError(
      "p32-evidence-issuer-replay-rejected",
      409,
      "The evidence issuance idempotency key was already used."
    );
  }
  if (message.includes("does not exist") || message.includes("schema cache")) {
    issuerError(
      "p32-evidence-issuer-store-unavailable",
      503,
      "The protected issuance ledger is unavailable."
    );
  }
  issuerError(
    "p32-evidence-issuer-persistence-failed",
    502,
    "The protected issuance receipt could not be persisted."
  );
}

export async function issueP32Aal2Evidence({
  env = process.env,
  idempotencyKey,
  packets,
  persistReceipt,
  request,
  now = new Date()
}: {
  env?: NodeJS.ProcessEnv;
  idempotencyKey: string;
  packets: QaManualRunEvidencePacketRecord[];
  persistReceipt: (
    input: P32EvidenceIssuerReceiptInput
  ) => Promise<P32EvidenceIssuerPersistenceResult>;
  request: P32EvidenceIssuerRequest;
  now?: Date;
}) {
  if (!uuidPattern.test(idempotencyKey)) {
    issuerError(
      "p32-evidence-issuer-idempotency-key-required",
      400,
      "A UUID Idempotency-Key header is required."
    );
  }
  if (!Number.isFinite(now.getTime())) {
    issuerError(
      "p32-evidence-issuer-clock-invalid",
      503,
      "The protected issuer clock is invalid."
    );
  }

  const configuration = loadIssuerConfiguration(env);
  assertExactCandidate(request, configuration.expectedFingerprints);
  const packet = selectCurrentQaEvidencePacket(packets, now.getTime());
  const issuanceId = randomUUID();
  const generatedAt = now.toISOString();
  const expiresAt = new Date(now.getTime() + attestationLifetimeMs).toISOString();
  const evidencePointer = `p32-aal2-issuance:${issuanceId}`;
  const evidence = createP32AutomatedGateEvidence({
    evidenceId: "aal2-cli-evidence",
    status: "passed",
    ...request,
    identityAssurance: "protected-aal2-workspace",
    generatedAt,
    checkedAt: generatedAt,
    expiresAt,
    evidencePointer
  });
  const supplementalEvidence = {
    automatedEvidence: [evidence],
    approvals: [] as []
  };
  const payloadHash = computeP32SupplementalEvidencePayloadHash(supplementalEvidence);
  const signatureBytes = sign(
    null,
    Buffer.from(payloadHash, "hex"),
    configuration.privateKey
  );
  const signature = signatureBytes.toString("base64url");
  const signatureFingerprint = createHash("sha256")
    .update(signatureBytes)
    .digest("hex");
  const evidenceFile: P32SupplementalEvidenceFile = {
    ...supplementalEvidence,
    attestation: {
      version: p32SupplementalEvidenceAttestationVersion,
      issuer: configuration.issuer,
      keyId: configuration.keyId,
      algorithm: "Ed25519",
      signedAt: generatedAt,
      expiresAt,
      payloadHash,
      signature
    }
  };
  const persistence = await persistReceipt({
    issuanceId,
    idempotencyKey,
    qaEvidencePacketId: packet.id,
    qaEvidencePacketHash: packet.packetSha256,
    issuer: configuration.issuer,
    keyId: configuration.keyId,
    evidenceId: "aal2-cli-evidence",
    ...request,
    generatedAt,
    checkedAt: generatedAt,
    expiresAt,
    evidencePointer,
    evidenceHash: evidence.evidenceHash,
    payloadHash,
    signatureFingerprint
  });

  if (persistence.error || !persistence.receipt) {
    persistenceError(persistence.error?.message ?? "receipt-missing");
  }

  return {
    evidenceFile,
    receipt: persistence.receipt,
    issuer: {
      issuer: configuration.issuer,
      keyId: configuration.keyId,
      publicKeyFingerprint: configuration.publicKeyFingerprint
    },
    qaEvidence: {
      packetId: packet.id,
      packetSha256: packet.packetSha256,
      workflowRunId: packet.workflowRunId
    }
  };
}
