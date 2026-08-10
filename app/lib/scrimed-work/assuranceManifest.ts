import { createClinicalEvidenceHash } from "../clinicalEvidenceControls";

export const scrimedAssuranceManifestVersion =
  "scrimed-preproduction-assurance-manifest-v1-2026-08-01";

export type BoundEvidenceFingerprint = {
  evidenceId: string;
  fingerprint: string;
  candidateFingerprint: string;
  sourceFingerprint: string;
  status: "passed" | "failed" | "review-required" | "operator-required";
};

export type AssuranceManifestInput = {
  baseCommit: string;
  candidateCommit: string | null;
  candidateMode: "working-tree" | "clean-commit";
  candidateFingerprint: string;
  sourceFingerprint: string;
  artifactFingerprint: string;
  validationFingerprint: string;
  sbomFingerprint: string;
  publicClaimsFingerprint: string;
  gateRegistryFingerprint: string;
  reviewPacketFingerprint: string;
  migrationReportFingerprint: string;
  modelRegistryFingerprint: string;
  operatingModeFingerprint: string;
  evidence: BoundEvidenceFingerprint[];
  buildResult: "passed" | "failed" | "not-run";
  testSummary: { passed: number; failed: number; skipped: number };
  secretScanResult: "passed" | "failed" | "not-run";
  prohibitedCapabilitiesDisabled: boolean;
  environmentTarget: "local" | "test" | "disposable" | "preview";
  generatedAt: string;
  expiresAt: string;
  toolVersions: Record<string, string>;
};

export type AssuranceManifest = AssuranceManifestInput & {
  schemaVersion: typeof scrimedAssuranceManifestVersion;
  immutableCandidate: boolean;
  fingerprintConsistencyPassed: boolean;
  preproductionPackagingAllowed: boolean;
  productionAuthorityGranted: false;
  manifestFingerprint: string;
};

const sha256Pattern = /^[0-9a-f]{64}$/i;
const gitCommitPattern = /^[0-9a-f]{40}$/i;

function requireCondition(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`Assurance manifest rejected: ${message}`);
}

export function buildAssuranceManifest(input: AssuranceManifestInput): AssuranceManifest {
  requireCondition(gitCommitPattern.test(input.baseCommit), "base commit must be an exact SHA");
  requireCondition(
    input.candidateCommit === null || gitCommitPattern.test(input.candidateCommit),
    "candidate commit must be null or an exact SHA"
  );
  for (const [label, fingerprint] of Object.entries({
    candidateFingerprint: input.candidateFingerprint,
    sourceFingerprint: input.sourceFingerprint,
    artifactFingerprint: input.artifactFingerprint,
    validationFingerprint: input.validationFingerprint,
    sbomFingerprint: input.sbomFingerprint,
    publicClaimsFingerprint: input.publicClaimsFingerprint,
    gateRegistryFingerprint: input.gateRegistryFingerprint,
    reviewPacketFingerprint: input.reviewPacketFingerprint,
    migrationReportFingerprint: input.migrationReportFingerprint,
    modelRegistryFingerprint: input.modelRegistryFingerprint,
    operatingModeFingerprint: input.operatingModeFingerprint
  })) {
    requireCondition(sha256Pattern.test(fingerprint), `${label} must be SHA-256`);
  }
  requireCondition(input.evidence.length > 0, "at least one evidence record is required");
  requireCondition(Number.isFinite(Date.parse(input.generatedAt)), "generatedAt is invalid");
  requireCondition(
    Number.isFinite(Date.parse(input.expiresAt)) && Date.parse(input.expiresAt) > Date.parse(input.generatedAt),
    "expiresAt must follow generatedAt"
  );
  const duplicateIds = input.evidence.length !== new Set(input.evidence.map((item) => item.evidenceId)).size;
  requireCondition(!duplicateIds, "evidence identifiers must be unique");

  const fingerprintConsistencyPassed = input.evidence.every(
    (item) =>
      sha256Pattern.test(item.fingerprint) &&
      item.candidateFingerprint === input.candidateFingerprint &&
      item.sourceFingerprint === input.sourceFingerprint
  );
  requireCondition(fingerprintConsistencyPassed, "evidence refers to a different source candidate");

  const immutableCandidate =
    input.candidateMode === "clean-commit" &&
    input.candidateCommit !== null &&
    input.candidateCommit !== input.baseCommit;
  const preproductionPackagingAllowed =
    input.buildResult === "passed" &&
    input.testSummary.failed === 0 &&
    input.secretScanResult === "passed" &&
    input.prohibitedCapabilitiesDisabled &&
    input.evidence.every((item) => item.status === "passed");
  const payload = {
    ...input,
    evidence: [...input.evidence].sort((left, right) => left.evidenceId.localeCompare(right.evidenceId)),
    toolVersions: Object.fromEntries(Object.entries(input.toolVersions).sort(([left], [right]) => left.localeCompare(right))),
    schemaVersion: scrimedAssuranceManifestVersion as typeof scrimedAssuranceManifestVersion,
    immutableCandidate,
    fingerprintConsistencyPassed,
    preproductionPackagingAllowed,
    productionAuthorityGranted: false as const
  };
  return {
    ...payload,
    manifestFingerprint: createClinicalEvidenceHash(payload)
  };
}

export function validateAssuranceManifest(
  manifest: AssuranceManifest,
  expected: { candidateFingerprint: string; sourceFingerprint: string; evaluatedAt: string }
) {
  const input: AssuranceManifestInput = {
    baseCommit: manifest.baseCommit,
    candidateCommit: manifest.candidateCommit,
    candidateMode: manifest.candidateMode,
    candidateFingerprint: manifest.candidateFingerprint,
    sourceFingerprint: manifest.sourceFingerprint,
    artifactFingerprint: manifest.artifactFingerprint,
    validationFingerprint: manifest.validationFingerprint,
    sbomFingerprint: manifest.sbomFingerprint,
    publicClaimsFingerprint: manifest.publicClaimsFingerprint,
    gateRegistryFingerprint: manifest.gateRegistryFingerprint,
    reviewPacketFingerprint: manifest.reviewPacketFingerprint,
    migrationReportFingerprint: manifest.migrationReportFingerprint,
    modelRegistryFingerprint: manifest.modelRegistryFingerprint,
    operatingModeFingerprint: manifest.operatingModeFingerprint,
    evidence: manifest.evidence,
    buildResult: manifest.buildResult,
    testSummary: manifest.testSummary,
    secretScanResult: manifest.secretScanResult,
    prohibitedCapabilitiesDisabled: manifest.prohibitedCapabilitiesDisabled,
    environmentTarget: manifest.environmentTarget,
    generatedAt: manifest.generatedAt,
    expiresAt: manifest.expiresAt,
    toolVersions: manifest.toolVersions
  };
  const rebuilt = buildAssuranceManifest(input);
  const reasonCodes: string[] = [];
  if (manifest.schemaVersion !== scrimedAssuranceManifestVersion) reasonCodes.push("ASSURANCE_SCHEMA_MISMATCH");
  if (rebuilt.manifestFingerprint !== manifest.manifestFingerprint) reasonCodes.push("ASSURANCE_MANIFEST_TAMPERED");
  if (manifest.candidateFingerprint !== expected.candidateFingerprint) reasonCodes.push("CANDIDATE_FINGERPRINT_MISMATCH");
  if (manifest.sourceFingerprint !== expected.sourceFingerprint) reasonCodes.push("SOURCE_FINGERPRINT_MISMATCH");
  if (!Number.isFinite(Date.parse(expected.evaluatedAt)) || Date.parse(manifest.expiresAt) <= Date.parse(expected.evaluatedAt)) {
    reasonCodes.push("ASSURANCE_MANIFEST_EXPIRED");
  }
  return {
    valid: reasonCodes.length === 0,
    reasonCodes,
    productionAuthorityGranted: false as const
  };
}
