export const scrimedWorkSessionIdPattern = /^work_session_[a-z0-9_]{8,80}$/;

function auditDigest(auditHash: string) {
  const match = /^scrimed-intel-([0-9a-f]{8})$/.exec(auditHash);

  if (!match) {
    throw new Error("SCRIMED Work could not derive a schema-safe session identifier.");
  }

  return match[1];
}

export function buildScrimedWorkSessionId(primaryAuditHash: string, partitionAuditHash: string) {
  const id = `work_session_${auditDigest(primaryAuditHash)}${auditDigest(partitionAuditHash)}`;

  if (!scrimedWorkSessionIdPattern.test(id)) {
    throw new Error("SCRIMED Work generated a session identifier outside the durable schema contract.");
  }

  return id;
}
