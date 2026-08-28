import { createHash } from "node:crypto";

function sha256(value) {
  return createHash("sha256").update(String(value)).digest("hex");
}

export function createRedactedAal2Evidence(report, timestamp = new Date().toISOString()) {
  const base = {
    schemaVersion: "scrimed-p34-aal2-redacted-evidence-v1",
    candidate: {
      commitSha: report.commitSha,
      candidateFingerprint: report.candidateFingerprint
    },
    target: report.targetOrigin,
    assuranceResult: report.status,
    timestamp,
    tests: report.checks.map((check) => ({ id: check.id, passed: check.passed })),
    passed: report.status === "PASS_NONPRODUCTION_AAL2",
    productionAuthorityGranted: false
  };
  return { ...base, evidenceHash: sha256(JSON.stringify(base)) };
}
