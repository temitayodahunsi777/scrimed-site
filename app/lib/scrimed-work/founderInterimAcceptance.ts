import { createClinicalEvidenceHash } from "../clinicalEvidenceControls";
import type { FounderAcceptanceReference } from "./reviewPolicyEngine";

export const scrimedFounderInterimAcceptanceVersion =
  "scrimed-founder-interim-acceptance-v1-2026-08-01";

export const founderInterimAcceptanceAcknowledgment =
  "I authorize this exact candidate for bounded, synthetic-only, pre-production activity. This acceptance does not authorize PHI processing, clinical execution, production migration, production deployment, EHR or medical-device connectivity, customer go-live, binding legal adoption, or regulated claims.";

export const founderPermittedActivityCatalog = [
  "source-commit",
  "preview-deployment",
  "synthetic-demonstration",
  "internal-model-evaluation",
  "wix-publication",
  "disposable-migration-dry-run",
  "reversible-platform-configuration",
  "precommercial-development"
] as const;

export const founderProhibitedActivityCatalog = [
  "phi-processing",
  "clinical-execution",
  "production-migration",
  "production-deployment",
  "ehr-connection",
  "device-connection",
  "customer-activation",
  "legal-policy-adoption",
  "regulated-claim"
] as const;

export type FounderInterimAcceptanceInput = {
  acceptanceId: string;
  founderIdentity: string;
  candidateFingerprint: string;
  assuranceManifestFingerprint: string;
  permittedActivities: string[];
  prohibitedActivities: string[];
  acceptanceDate: string;
  expirationDate: string;
  scope: string;
  residualRisks: string[];
  requiredExternalActions: string[];
  acknowledgmentText: string;
  signatureEvidence: {
    method: "trusted-identity-provider" | "detached-signature";
    signerIdentity: string;
    evidenceDigest: string;
    verified: boolean;
  } | null;
};

export type FounderInterimAcceptance = FounderAcceptanceReference &
  Omit<FounderInterimAcceptanceInput, "expirationDate" | "acceptanceDate"> & {
    issuedAt: string;
    expiresAt: string;
    schemaVersion: typeof scrimedFounderInterimAcceptanceVersion;
    productionAuthorityGranted: false;
    acceptanceFingerprint: string;
  };

const sha256Pattern = /^[0-9a-f]{64}$/i;

export function createFounderInterimAcceptance(
  input: FounderInterimAcceptanceInput
): FounderInterimAcceptance {
  if (!input.acceptanceId.trim() || !input.founderIdentity.trim() || !input.scope.trim()) {
    throw new Error("Founder interim acceptance requires identity, scope, and an acceptance ID.");
  }
  if (!sha256Pattern.test(input.candidateFingerprint) || !sha256Pattern.test(input.assuranceManifestFingerprint)) {
    throw new Error("Founder interim acceptance must bind exact SHA-256 fingerprints.");
  }
  const issuedAt = Date.parse(input.acceptanceDate);
  const expiresAt = Date.parse(input.expirationDate);
  if (
    !Number.isFinite(issuedAt) ||
    !Number.isFinite(expiresAt) ||
    expiresAt <= issuedAt ||
    expiresAt - issuedAt > 30 * 24 * 60 * 60 * 1000
  ) {
    throw new Error("Founder interim acceptance must be current and expire within 30 days.");
  }
  if (input.acknowledgmentText !== founderInterimAcceptanceAcknowledgment) {
    throw new Error("Founder interim acceptance acknowledgment does not match the controlled text.");
  }
  if (
    input.permittedActivities.some(
      (activity) => !founderPermittedActivityCatalog.includes(activity as never)
    )
  ) {
    throw new Error("Founder interim acceptance requested an activity outside the preproduction catalog.");
  }
  if (!founderProhibitedActivityCatalog.every((activity) => input.prohibitedActivities.includes(activity))) {
    throw new Error("Founder interim acceptance must preserve every prohibited production activity.");
  }
  if (
    !input.signatureEvidence?.verified ||
    input.signatureEvidence.signerIdentity !== input.founderIdentity ||
    !sha256Pattern.test(input.signatureEvidence.evidenceDigest)
  ) {
    throw new Error("Founder interim acceptance is unsigned or its identity evidence is unverified.");
  }
  const payload = {
    ...input,
    acceptanceDate: undefined,
    expirationDate: undefined,
    issuedAt: input.acceptanceDate,
    expiresAt: input.expirationDate,
    signatureVerified: true as const,
    schemaVersion: scrimedFounderInterimAcceptanceVersion as typeof scrimedFounderInterimAcceptanceVersion,
    productionAuthorityGranted: false as const
  };
  return {
    ...payload,
    acceptanceFingerprint: createClinicalEvidenceHash(payload)
  };
}

export function validateFounderInterimAcceptance(
  acceptance: FounderInterimAcceptance,
  expected: {
    candidateFingerprint: string;
    assuranceManifestFingerprint: string;
    requestedActivity: string;
    evaluatedAt: string;
    requiredControlsPassed: boolean;
    changeEvents: Array<
      | "candidate-fingerprint-change"
      | "architecture-change"
      | "model-change"
      | "database-migration"
      | "intended-use-change"
      | "data-boundary-change"
      | "new-public-claims"
      | "clinical-function-change"
      | "deployment-environment-change"
      | "security-control-regression"
    >;
  }
) {
  const reasonCodes: string[] = [];
  if (acceptance.candidateFingerprint !== expected.candidateFingerprint) reasonCodes.push("CANDIDATE_CHANGED");
  if (acceptance.assuranceManifestFingerprint !== expected.assuranceManifestFingerprint) {
    reasonCodes.push("ASSURANCE_MANIFEST_CHANGED");
  }
  if (!Number.isFinite(Date.parse(expected.evaluatedAt)) || Date.parse(acceptance.expiresAt) <= Date.parse(expected.evaluatedAt)) {
    reasonCodes.push("ACCEPTANCE_EXPIRED");
  }
  if (!acceptance.signatureVerified || !acceptance.signatureEvidence?.verified) reasonCodes.push("ACCEPTANCE_UNSIGNED");
  if (!acceptance.permittedActivities.includes(expected.requestedActivity)) reasonCodes.push("ACTIVITY_OUTSIDE_ACCEPTED_SCOPE");
  if (acceptance.prohibitedActivities.includes(expected.requestedActivity)) reasonCodes.push("PROHIBITED_ACTIVITY_REQUESTED");
  if (!expected.requiredControlsPassed) reasonCodes.push("REQUIRED_CONTROL_FAILED");
  if (expected.changeEvents.length) reasonCodes.push("ACCEPTANCE_INVALIDATING_CHANGE");
  return {
    valid: reasonCodes.length === 0,
    reasonCodes: [...new Set(reasonCodes)].sort(),
    boundedPreproductionAuthority: reasonCodes.length === 0,
    productionAuthorityGranted: false as const
  };
}
