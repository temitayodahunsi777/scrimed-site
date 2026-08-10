import { createClinicalEvidenceHash } from "./clinicalEvidenceControls";
import type { AutomatedGateEvidence } from "./scrimedP32ReleaseGates";
import type { ApprovalEvidence } from "./scrimed-work/p32Contracts";

export const p32EvidenceTrustRegistryVersion =
  "scrimed-p32-evidence-trust-registry-v1";
export const p32SupplementalEvidenceAttestationVersion =
  "scrimed-p32-supplemental-evidence-attestation-v1";

export type P32SupplementalEvidencePayload = {
  automatedEvidence: AutomatedGateEvidence[];
  approvals: ApprovalEvidence[];
  reviewerIdentityMappings?: P32ReviewerIdentityMapping[];
};

export type P32ReviewerIdentityMapping = {
  reviewerIdentityHash: string;
  comparableIdentityHashes: string[];
  evidencePointer: string;
  mappedAt: string;
  expiresAt: string;
  mappingHash: string;
};

export function computeP32ReviewerIdentityMappingHash(
  mapping: Omit<P32ReviewerIdentityMapping, "mappingHash">
) {
  return createClinicalEvidenceHash({
    ...mapping,
    comparableIdentityHashes: [...new Set(mapping.comparableIdentityHashes)].sort()
  });
}

export function createP32ReviewerIdentityMapping(
  mapping: Omit<P32ReviewerIdentityMapping, "mappingHash">
): P32ReviewerIdentityMapping {
  const normalized = {
    ...mapping,
    comparableIdentityHashes: [...new Set(mapping.comparableIdentityHashes)].sort()
  };
  return {
    ...normalized,
    mappingHash: computeP32ReviewerIdentityMappingHash(normalized)
  };
}

export type P32SupplementalEvidenceAttestation = {
  version: typeof p32SupplementalEvidenceAttestationVersion;
  issuer: string;
  keyId: string;
  algorithm: "Ed25519";
  signedAt: string;
  expiresAt: string;
  payloadHash: string;
  signature: string;
};

export type P32SupplementalEvidenceFile = P32SupplementalEvidencePayload & {
  attestation: P32SupplementalEvidenceAttestation;
};

export function computeP32SupplementalEvidencePayloadHash(
  supplementalEvidence: P32SupplementalEvidencePayload
) {
  const payload = {
    automatedEvidence: supplementalEvidence.automatedEvidence,
    approvals: supplementalEvidence.approvals,
    ...(supplementalEvidence.reviewerIdentityMappings === undefined
      ? {}
      : {
          reviewerIdentityMappings:
            supplementalEvidence.reviewerIdentityMappings
        })
  };
  return createClinicalEvidenceHash(payload);
}
