import { createHash } from "node:crypto";

export const p34RuntimeEvidencePaths = new Set([
  "artifacts/security/p34-aal2-evidence.json",
  "artifacts/vercel/p34-preview-observability.json"
]);

function stableSerialize(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableSerialize).join(",")}]`;
  return `{${Object.entries(value)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, entry]) => `${JSON.stringify(key)}:${stableSerialize(entry)}`)
    .join(",")}}`;
}
function evidenceHash(value) {
  return createHash("sha256").update(stableSerialize(value)).digest("hex");
}

export function createPendingP34Aal2Evidence(exact) {
  const base = {
    schemaVersion: "scrimed-p34-aal2-redacted-evidence-v1",
    candidate: {
      commitSha: exact.commitSha,
      candidateFingerprint: exact.candidateFingerprint
    },
    target: exact.deploymentUrl,
    assuranceResult: "OPERATOR_ACTION_REQUIRED",
    timestamp: null,
    tests: [
      "nonproduction-target",
      "aal2-token-policy",
      "mfa-method",
      "fresh-step-up",
      "stale-token-policy-rejection",
      "exact-candidate-preview-binding",
      "privileged-endpoint",
      "candidate-replay-guard"
    ].map((id) => ({ id, passed: null })),
    passed: false,
    productionAuthorityGranted: false,
    boundary:
      "Pending runtime-only AAL2 verification. No credential, token, user identifier, or protected response is stored."
  };
  return { ...base, evidenceHash: evidenceHash(base) };
}

export function createPendingP34PreviewObservability(exact) {
  const base = {
    schemaVersion: "scrimed-p34-preview-observability-v1",
    status: "OPERATOR_ACTION_REQUIRED",
    deploymentId: exact.deploymentId,
    deploymentUrl: exact.deploymentUrl,
    commitSha: exact.commitSha,
    candidateFingerprint: exact.candidateFingerprint,
    environment: "preview",
    deploymentReadyObserved: true,
    productionAliasAttached: false,
    routes: [
      "/",
      "/product",
      "/scrimed-p34",
      "/synthetic-pilot",
      "/api/health",
      "/api/readiness",
      "/api/build-info",
      "/api/scrimed-control-plane/review-readiness",
      "/api/synthetic-pilot"
    ],
    checks: {
      http5xxAbsent: null,
      routeErrorsAbsent: null,
      hydrationWarningsAbsent: null,
      consoleErrorsAbsent: null,
      latencyReviewed: null,
      policyDenialsExpectedOnly: null,
      unexpectedWritesAbsent: null,
      desktopPassed: null,
      mobile390Passed: null
    },
    acceptanceState: "RELEASE_STEWARD_ACCEPTANCE_REQUIRED",
    productionAuthorityGranted: false,
    boundary:
      "The platform reports the exact preview READY with no production alias. Route, browser, latency, policy-denial, and write observations remain an operator evidence step; this artifact does not self-accept the preview."
  };
  return { ...base, evidenceHash: evidenceHash(base) };
}
