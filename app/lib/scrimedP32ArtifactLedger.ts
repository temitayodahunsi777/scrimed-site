import { createClinicalEvidenceHash } from "./clinicalEvidenceControls";

export const scrimedP32ArtifactLedgerVersion = "scrimed-p32-artifact-ledger-v1-2026-07-20";

export const scrimedP32ArtifactLedgerBoundary =
  "The SCRIMED artifact ledger stores no raw PHI or secrets and grants no distribution, deployment, clinical, payer, or EHR authority. Deletion is recoverable metadata state, never incidental destructive erasure.";

export type ArtifactRevision = {
  documentId: string;
  revisionId: string;
  tenantId: string;
  artifactType: string;
  contentDigest: string;
  parentRevisionId: string | null;
  sourceArtifactIds: string[];
  transformationVersion: string;
  status: "active" | "trashed" | "restored";
  retentionClass: "ephemeral-synthetic" | "internal-evidence" | "legal-hold-reference";
  containsRawPhi: false;
  containsSecrets: false;
  createdByIdentityHash: string;
  createdAt: string;
  previousLedgerHash: string | null;
  revisionHash: string;
};

const sha256Pattern = /^[0-9a-f]{64}$/i;

export function createStableDocumentId(input: {
  tenantId: string;
  sourceIdentity: string;
  artifactType: string;
}) {
  if (!input.tenantId || !input.sourceIdentity || !input.artifactType) {
    throw new Error("Stable document identity requires tenant, source identity, and artifact type");
  }
  return `doc_${createClinicalEvidenceHash({
    version: scrimedP32ArtifactLedgerVersion,
    tenantId: input.tenantId,
    sourceIdentity: input.sourceIdentity,
    artifactType: input.artifactType
  }).slice(0, 32)}`;
}

export function appendArtifactRevision(
  input: Omit<ArtifactRevision, "revisionId" | "containsRawPhi" | "containsSecrets" | "revisionHash">,
  priorRevision: ArtifactRevision | null
): ArtifactRevision {
  if (!sha256Pattern.test(input.contentDigest) || !sha256Pattern.test(input.createdByIdentityHash)) {
    throw new Error("Artifact revision requires content and actor SHA-256 digests");
  }
  if (priorRevision) {
    if (priorRevision.documentId !== input.documentId || priorRevision.tenantId !== input.tenantId) {
      throw new Error("Artifact revision cannot cross tenant or document boundaries");
    }
    if (input.parentRevisionId !== priorRevision.revisionId || input.previousLedgerHash !== priorRevision.revisionHash) {
      throw new Error("Artifact revision parent or ledger chain is invalid");
    }
  } else if (input.parentRevisionId !== null || input.previousLedgerHash !== null) {
    throw new Error("Initial artifact revision cannot reference a parent");
  }
  const base = {
    ...input,
    sourceArtifactIds: [...new Set(input.sourceArtifactIds)].sort(),
    containsRawPhi: false as const,
    containsSecrets: false as const
  };
  const revisionHash = createClinicalEvidenceHash({
    version: scrimedP32ArtifactLedgerVersion,
    revision: base
  });
  return {
    ...base,
    revisionId: `rev_${revisionHash.slice(0, 32)}`,
    revisionHash
  };
}

export function createRecoverableTrashRevision(input: {
  priorRevision: ArtifactRevision;
  actorIdentityHash: string;
  createdAt: string;
}) {
  return appendArtifactRevision({
    documentId: input.priorRevision.documentId,
    tenantId: input.priorRevision.tenantId,
    artifactType: input.priorRevision.artifactType,
    contentDigest: input.priorRevision.contentDigest,
    parentRevisionId: input.priorRevision.revisionId,
    sourceArtifactIds: input.priorRevision.sourceArtifactIds,
    transformationVersion: `${scrimedP32ArtifactLedgerVersion}:recoverable-trash`,
    status: "trashed",
    retentionClass: input.priorRevision.retentionClass,
    createdByIdentityHash: input.actorIdentityHash,
    createdAt: input.createdAt,
    previousLedgerHash: input.priorRevision.revisionHash
  }, input.priorRevision);
}

export function createRecoverableRestoreRevision(input: {
  trashedRevision: ArtifactRevision;
  actorIdentityHash: string;
  createdAt: string;
}) {
  if (input.trashedRevision.status !== "trashed") {
    throw new Error("Only a trashed artifact revision can be restored");
  }
  return appendArtifactRevision({
    documentId: input.trashedRevision.documentId,
    tenantId: input.trashedRevision.tenantId,
    artifactType: input.trashedRevision.artifactType,
    contentDigest: input.trashedRevision.contentDigest,
    parentRevisionId: input.trashedRevision.revisionId,
    sourceArtifactIds: input.trashedRevision.sourceArtifactIds,
    transformationVersion: `${scrimedP32ArtifactLedgerVersion}:recoverable-restore`,
    status: "restored",
    retentionClass: input.trashedRevision.retentionClass,
    createdByIdentityHash: input.actorIdentityHash,
    createdAt: input.createdAt,
    previousLedgerHash: input.trashedRevision.revisionHash
  }, input.trashedRevision);
}

export function verifyArtifactLedger(revisions: ArtifactRevision[]) {
  const reasons: string[] = [];
  for (let index = 0; index < revisions.length; index += 1) {
    const revision = revisions[index];
    const prior = index > 0 ? revisions[index - 1] : null;
    try {
      if (revision.containsRawPhi !== false || revision.containsSecrets !== false) {
        reasons.push(`REVISION_SENSITIVE_CONTENT_INVARIANT_FAILED:${revision.revisionId}`);
      }
      const { revisionId, revisionHash, ...input } = revision;
      const rebuilt = appendArtifactRevision(input, prior);
      if (rebuilt.revisionId !== revisionId || rebuilt.revisionHash !== revisionHash) {
        reasons.push(`REVISION_INTEGRITY_FAILED:${revisionId}`);
      }
    } catch {
      reasons.push(`REVISION_CHAIN_FAILED:${revision.revisionId}`);
    }
  }
  return {
    valid: revisions.length > 0 && reasons.length === 0,
    reasons: reasons.length ? reasons : ["ARTIFACT_LEDGER_VALID"],
    headRevisionId: revisions.at(-1)?.revisionId ?? null,
    headHash: revisions.at(-1)?.revisionHash ?? null
  };
}

export function verifyArtifactBackup(input: {
  ledgerHeadHash: string;
  backupHeadHash: string;
  restoredContentDigest: string;
  expectedContentDigest: string;
}) {
  const verified = [input.ledgerHeadHash, input.backupHeadHash, input.restoredContentDigest, input.expectedContentDigest]
    .every((value) => sha256Pattern.test(value)) &&
    input.ledgerHeadHash === input.backupHeadHash &&
    input.restoredContentDigest === input.expectedContentDigest;
  return {
    verified,
    reasonCode: verified ? "BACKUP_RESTORE_HASH_VERIFIED" : "BACKUP_RESTORE_HASH_MISMATCH"
  };
}
