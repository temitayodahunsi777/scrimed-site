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
};

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
  return createClinicalEvidenceHash({
    automatedEvidence: supplementalEvidence.automatedEvidence,
    approvals: supplementalEvidence.approvals
  });
}
