import { createClinicalEvidenceHash } from "../clinicalEvidenceControls";
import type { PolicyDecision } from "./p32Contracts";

export const scrimedP32ArtifactAdmissionVersion =
  "scrimed-p32-artifact-admission-v1-2026-07-30";

export const scrimedP32ArtifactAdmissionBoundary =
  "SCRIMED artifact admission is digest-bound, independently attested, revocable, and rollback-ready. Vendor availability, funding, announcements, or leaderboards cannot authorize clinical or production use.";

const sha256Pattern = /^[0-9a-f]{64}$/i;

function requireHash(value: string, label: string) {
  if (!sha256Pattern.test(value)) throw new Error(`${label} must be a SHA-256 digest`);
}

function canonical(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort();
}

export type AIArtifactType =
  | "model"
  | "weights"
  | "tokenizer"
  | "chat-template"
  | "prompt"
  | "tool"
  | "skill"
  | "mcp-server"
  | "container"
  | "runtime"
  | "dataset"
  | "adapter"
  | "dependency";

export type AIArtifactManifest = {
  artifactId: string;
  artifactType: AIArtifactType;
  version: string;
  artifactDigest: string;
  parentArtifactDigests: string[];
  licenseIdentifier: string;
  licenseEvidenceReference: string;
  intendedUse: string[];
  prohibitedUse: string[];
  sbomDigest: string;
  modelBomDigest: string | null;
  dataBomDigest: string | null;
  provenanceReferences: string[];
  vulnerabilityScanDigest: string;
  reproducibilityEvidenceDigest: string;
  sourceAvailability: "open-weights" | "source-available" | "provider-hosted" | "unknown";
  revocationState: "active" | "suspended" | "revoked";
  createdAt: string;
  manifestHash: string;
};

export function buildAIArtifactManifest(
  input: Omit<AIArtifactManifest, "manifestHash">
): AIArtifactManifest {
  if (
    !input.artifactId.trim() ||
    !input.version.trim() ||
    !input.licenseIdentifier.trim() ||
    !input.licenseEvidenceReference.trim() ||
    !input.intendedUse.length ||
    !input.prohibitedUse.length ||
    !input.provenanceReferences.length
  ) {
    throw new Error("Artifact manifests require identity, license, intended use, prohibitions, and provenance");
  }
  [
    ["artifact", input.artifactDigest],
    ["SBOM", input.sbomDigest],
    ["vulnerability scan", input.vulnerabilityScanDigest],
    ["reproducibility evidence", input.reproducibilityEvidenceDigest]
  ].forEach(([label, value]) => requireHash(value, label));
  input.parentArtifactDigests.forEach((digest) => requireHash(digest, "parent artifact"));
  if (input.modelBomDigest) requireHash(input.modelBomDigest, "model BOM");
  if (input.dataBomDigest) requireHash(input.dataBomDigest, "data BOM");
  if (!Number.isFinite(Date.parse(input.createdAt))) {
    throw new Error("Artifact manifest requires an ISO timestamp");
  }
  const payload = {
    ...input,
    parentArtifactDigests: canonical(input.parentArtifactDigests),
    intendedUse: canonical(input.intendedUse),
    prohibitedUse: canonical(input.prohibitedUse),
    provenanceReferences: canonical(input.provenanceReferences)
  };
  return {
    ...payload,
    manifestHash: createClinicalEvidenceHash({ type: "ai-artifact-manifest", payload })
  };
}

export type ArtifactAttestation = {
  attestationId: string;
  artifactManifestHash: string;
  attestorIdentityHash: string;
  attestorRole: string;
  subjectAgentIdentityHash: string | null;
  statementDigest: string;
  signatureDigest: string | null;
  signatureVerification:
    | "unverified"
    | "verified-test-key"
    | "verified-trusted-external-identity";
  independent: boolean;
  issuedAt: string;
  expiresAt: string;
  attestationHash: string;
};

export function buildArtifactAttestation(
  input: Omit<ArtifactAttestation, "independent" | "attestationHash">
): ArtifactAttestation {
  requireHash(input.artifactManifestHash, "artifact manifest");
  requireHash(input.attestorIdentityHash, "attestor identity");
  requireHash(input.statementDigest, "attestation statement");
  if (input.subjectAgentIdentityHash) {
    requireHash(input.subjectAgentIdentityHash, "subject agent identity");
  }
  if (input.signatureDigest) requireHash(input.signatureDigest, "attestation signature");
  if (
    !input.attestationId.trim() ||
    !input.attestorRole.trim() ||
    !Number.isFinite(Date.parse(input.issuedAt)) ||
    !Number.isFinite(Date.parse(input.expiresAt)) ||
    Date.parse(input.expiresAt) <= Date.parse(input.issuedAt)
  ) {
    throw new Error("Artifact attestation identity, role, or timestamps are invalid");
  }
  const independent =
    input.subjectAgentIdentityHash === null ||
    input.subjectAgentIdentityHash !== input.attestorIdentityHash;
  const payload = { ...input, independent };
  return {
    ...payload,
    attestationHash: createClinicalEvidenceHash({
      type: "artifact-attestation",
      payload
    })
  };
}

export type RollbackPlan = {
  rollbackPlanId: string;
  candidateManifestHash: string;
  lastAdmittedManifestHash: string;
  atomicSwitchReference: string;
  maximumRecoveryTimeMs: number;
  stateRestorationSteps: string[];
  verificationChecks: string[];
  testedAt: string | null;
  testEvidenceDigest: string | null;
  rollbackReady: boolean;
  planHash: string;
};

export function buildRollbackPlan(
  input: Omit<RollbackPlan, "rollbackReady" | "planHash">
): RollbackPlan {
  requireHash(input.candidateManifestHash, "candidate manifest");
  requireHash(input.lastAdmittedManifestHash, "last admitted manifest");
  if (input.testEvidenceDigest) requireHash(input.testEvidenceDigest, "rollback evidence");
  if (
    !input.rollbackPlanId.trim() ||
    !input.atomicSwitchReference.trim() ||
    !input.stateRestorationSteps.length ||
    !input.verificationChecks.length ||
    !Number.isFinite(input.maximumRecoveryTimeMs) ||
    input.maximumRecoveryTimeMs <= 0
  ) {
    throw new Error("Rollback plans require bounded recovery, restoration, and verification");
  }
  if (input.testedAt && !Number.isFinite(Date.parse(input.testedAt))) {
    throw new Error("Rollback test timestamp is invalid");
  }
  const rollbackReady =
    input.testedAt !== null &&
    input.testEvidenceDigest !== null &&
    input.candidateManifestHash !== input.lastAdmittedManifestHash;
  const payload = {
    ...input,
    stateRestorationSteps: canonical(input.stateRestorationSteps),
    verificationChecks: canonical(input.verificationChecks),
    rollbackReady
  };
  return {
    ...payload,
    planHash: createClinicalEvidenceHash({ type: "artifact-rollback-plan", payload })
  };
}

export type ArtifactAdmissionDecision = {
  decisionId: string;
  manifestHash: string;
  attestationHash: string | null;
  rollbackPlanHash: string;
  requestedEnvironment: "local-test" | "shadow" | "preview" | "production";
  decision: PolicyDecision;
  reasonCodes: string[];
  leaderboardOrVendorClaimUsedAsAuthority: false;
  silentSubstitutionAllowed: false;
  productionActivationAllowed: false;
  evaluatedAt: string;
  decisionHash: string;
};

export function evaluateArtifactAdmission(input: {
  decisionId: string;
  manifest: AIArtifactManifest;
  attestation: ArtifactAttestation | null;
  rollbackPlan: RollbackPlan;
  requestedEnvironment: ArtifactAdmissionDecision["requestedEnvironment"];
  evaluationEvidenceDigests: string[];
  evaluatedAt: string;
}): ArtifactAdmissionDecision {
  input.evaluationEvidenceDigests.forEach((digest) =>
    requireHash(digest, "evaluation evidence")
  );
  const reasonCodes: string[] = [];
  if (input.manifest.revocationState !== "active") {
    reasonCodes.push("ARTIFACT_REVOKED_OR_SUSPENDED");
  }
  if (!input.attestation) reasonCodes.push("INDEPENDENT_ARTIFACT_ATTESTATION_REQUIRED");
  else {
    if (input.attestation.artifactManifestHash !== input.manifest.manifestHash) {
      reasonCodes.push("ATTESTATION_ARTIFACT_MISMATCH");
    }
    if (!input.attestation.independent) reasonCodes.push("ARTIFACT_SELF_ATTESTATION_PROHIBITED");
    if (input.attestation.signatureVerification === "unverified") {
      reasonCodes.push("ARTIFACT_SIGNATURE_UNVERIFIED");
    }
    if (Date.parse(input.attestation.expiresAt) <= Date.parse(input.evaluatedAt)) {
      reasonCodes.push("ARTIFACT_ATTESTATION_EXPIRED");
    }
  }
  if (!input.evaluationEvidenceDigests.length) {
    reasonCodes.push("TASK_SPECIFIC_REVALIDATION_REQUIRED");
  }
  if (
    input.rollbackPlan.candidateManifestHash !== input.manifest.manifestHash ||
    !input.rollbackPlan.rollbackReady
  ) {
    reasonCodes.push("TESTED_ATOMIC_ROLLBACK_REQUIRED");
  }
  if (input.manifest.sourceAvailability === "unknown") {
    reasonCodes.push("ARTIFACT_SOURCE_AND_LICENSE_POSTURE_UNKNOWN");
  }
  if (input.requestedEnvironment === "production") {
    reasonCodes.push("PRODUCTION_ARTIFACT_ADMISSION_EXTERNAL_GATE_REQUIRED");
  }
  const hardBlock = reasonCodes.some((reason) =>
    [
      "ARTIFACT_REVOKED_OR_SUSPENDED",
      "ATTESTATION_ARTIFACT_MISMATCH",
      "ARTIFACT_SELF_ATTESTATION_PROHIBITED",
      "ARTIFACT_SIGNATURE_UNVERIFIED",
      "ARTIFACT_ATTESTATION_EXPIRED",
      "TESTED_ATOMIC_ROLLBACK_REQUIRED",
      "PRODUCTION_ARTIFACT_ADMISSION_EXTERNAL_GATE_REQUIRED"
    ].includes(reason)
  );
  const decision: PolicyDecision = hardBlock
    ? "BLOCK"
    : reasonCodes.length
      ? "REQUIRE_HUMAN"
      : "ALLOW";
  const payload = {
    decisionId: input.decisionId,
    manifestHash: input.manifest.manifestHash,
    attestationHash: input.attestation?.attestationHash ?? null,
    rollbackPlanHash: input.rollbackPlan.planHash,
    requestedEnvironment: input.requestedEnvironment,
    decision,
    reasonCodes: reasonCodes.length
      ? canonical(reasonCodes)
      : ["ARTIFACT_ADMITTED_FOR_NONPRODUCTION_USE"],
    leaderboardOrVendorClaimUsedAsAuthority: false as const,
    silentSubstitutionAllowed: false as const,
    productionActivationAllowed: false as const,
    evaluatedAt: input.evaluatedAt
  };
  return {
    ...payload,
    decisionHash: createClinicalEvidenceHash({
      type: "artifact-admission-decision",
      payload
    })
  };
}

export function getP32ArtifactAdmissionSummary() {
  return {
    version: scrimedP32ArtifactAdmissionVersion,
    artifactTypes: [
      "model",
      "weights",
      "tokenizer",
      "chat-template",
      "prompt",
      "tool",
      "skill",
      "mcp-server",
      "container",
      "runtime",
      "dataset",
      "adapter",
      "dependency"
    ],
    silentSubstitutionAllowed: false,
    leaderboardPromotionAllowed: false,
    productionActivationAllowed: false,
    boundary: scrimedP32ArtifactAdmissionBoundary
  } as const;
}
