const scrimedAuditHashPattern = /^scrimed-intel-([0-9a-f]{8})$/;

export const scrimedWorkSessionIdPattern = /^work_session_[a-z0-9_]{8,80}$/;
export const scrimedWorkArtifactIdPattern = /^artifact_[a-z0-9_]{8,100}$/;

function auditDigest(auditHash: string) {
  const match = scrimedAuditHashPattern.exec(auditHash);

  if (!match) {
    throw new Error("SCRIMED Work could not derive a schema-safe durable identifier.");
  }

  return match[1];
}

function buildDurableIdentifier(
  prefix: "work_session" | "artifact",
  pattern: RegExp,
  primaryAuditHash: string,
  partitionAuditHash: string
) {
  const id = `${prefix}_${auditDigest(primaryAuditHash)}${auditDigest(partitionAuditHash)}`;

  if (!pattern.test(id)) {
    throw new Error("SCRIMED Work generated an identifier outside the durable schema contract.");
  }

  return id;
}

export function buildScrimedWorkSessionId(primaryAuditHash: string, partitionAuditHash: string) {
  return buildDurableIdentifier(
    "work_session",
    scrimedWorkSessionIdPattern,
    primaryAuditHash,
    partitionAuditHash
  );
}

export function buildScrimedWorkArtifactId(primaryAuditHash: string, partitionAuditHash: string) {
  return buildDurableIdentifier(
    "artifact",
    scrimedWorkArtifactIdPattern,
    primaryAuditHash,
    partitionAuditHash
  );
}
