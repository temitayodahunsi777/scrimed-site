import { createClinicalEvidenceHash } from "../clinicalEvidenceControls";

export const scrimedControlAttestationVersion =
  "scrimed-preproduction-control-attestations-v1-2026-08-01";

export type PreproductionControlId =
  | "operating:synthetic-only"
  | "operating:no-phi"
  | "clinical:execution-disabled"
  | "connector:ehr-disabled"
  | "connector:device-disabled"
  | "clinical:emergency-monitoring-disabled"
  | "clinical:autonomous-decisions-disabled"
  | "faithcore:clinical-neutrality"
  | "claims:public-policy-compliant"
  | "model:admission-compliant"
  | "agent:delegation-bounded"
  | "authorization:server-enforced"
  | "audit:logging-enabled"
  | "mutation:idempotency-enabled"
  | "database:migrations-not-applied"
  | "customer:go-live-disabled";

export type ControlObservation = {
  controlId: PreproductionControlId;
  expectedState: boolean;
  observedState: boolean;
  evidence: string[];
  testReference: string;
};

export type ControlAttestation = ControlObservation & {
  schemaVersion: typeof scrimedControlAttestationVersion;
  sourceFingerprint: string;
  timestamp: string;
  expiresAt: string;
  status: "PASS" | "FAIL";
  attestationFingerprint: string;
};

export function buildControlAttestations(input: {
  sourceFingerprint: string;
  timestamp: string;
  expiresAt: string;
  observations: ControlObservation[];
}) {
  if (!/^[0-9a-f]{64}$/i.test(input.sourceFingerprint)) {
    throw new Error("Control attestations require an exact SHA-256 source fingerprint.");
  }
  if (
    !Number.isFinite(Date.parse(input.timestamp)) ||
    !Number.isFinite(Date.parse(input.expiresAt)) ||
    Date.parse(input.expiresAt) <= Date.parse(input.timestamp)
  ) {
    throw new Error("Control attestation timestamps are invalid.");
  }
  const ids = input.observations.map((observation) => observation.controlId);
  if (new Set(ids).size !== ids.length) throw new Error("Control attestation IDs must be unique.");

  const attestations = [...input.observations]
    .sort((left, right) => left.controlId.localeCompare(right.controlId))
    .map((observation): ControlAttestation => {
      if (!observation.evidence.length || !observation.testReference.trim()) {
        throw new Error(`Control ${observation.controlId} requires evidence and a test reference.`);
      }
      const payload = {
        ...observation,
        evidence: [...new Set(observation.evidence)].sort(),
        schemaVersion: scrimedControlAttestationVersion as typeof scrimedControlAttestationVersion,
        sourceFingerprint: input.sourceFingerprint,
        timestamp: input.timestamp,
        expiresAt: input.expiresAt,
        status: observation.expectedState === observation.observedState ? "PASS" as const : "FAIL" as const
      };
      return {
        ...payload,
        attestationFingerprint: createClinicalEvidenceHash(payload)
      };
    });

  return {
    schemaVersion: scrimedControlAttestationVersion,
    sourceFingerprint: input.sourceFingerprint,
    timestamp: input.timestamp,
    expiresAt: input.expiresAt,
    attestations,
    requiredControlCount: attestations.length,
    passedControlCount: attestations.filter((item) => item.status === "PASS").length,
    failedControlCount: attestations.filter((item) => item.status === "FAIL").length,
    releasePackagingAllowed: attestations.every((item) => item.status === "PASS"),
    productionAuthorityGranted: false as const,
    bundleFingerprint: createClinicalEvidenceHash(attestations)
  };
}
