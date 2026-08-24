import { createClinicalEvidenceHash } from "../clinicalEvidenceControls";
import { evaluateTrustedTimeWindow, type TrustedClock } from "./trustedClock";

export type P34EvidenceType =
  | "candidate-manifest"
  | "validation-packet"
  | "gate-packet"
  | "security-evidence"
  | "review-packet"
  | "migration-report"
  | "model-qualification"
  | "aal2"
  | "public-claims"
  | "investor-artifact"
  | "preview-validation"
  | "specialist-review";

export type P34EvidenceEnvelope = {
  schemaVersion: "scrimed-p34-evidence-envelope-v2";
  evidenceId: string;
  evidenceType: P34EvidenceType;
  sourceCandidate: string;
  validationVersion: string;
  generatedAt: string;
  expiresAt: string;
  evidenceHash: string;
  issuerIdentityHash: string;
  trustClass: "synthetic-test-only" | "trusted-external";
  signature: string;
};

export type P34EvidenceVerifier = {
  readonly verifierId: string;
  readonly trustClass: "synthetic-test-only" | "trusted-external";
  verify(evidence: P34EvidenceEnvelope): {
    valid: boolean;
    authenticatedIssuerIdentityHash: string;
  };
};

export type P34EvidenceVerificationContext = {
  usage: "synthetic-test-only" | "release-gate";
  expectedValidationVersion: string;
  expectedIssuerIdentityHash: string;
  verifier: P34EvidenceVerifier;
};

export type P34EvidenceFreshnessDecision = {
  decision: "ALLOW" | "BLOCK";
  freshness: "fresh" | "expired" | "candidate-mismatch" | "invalid";
  reasonCodes: string[];
  requiredRegeneration: P34EvidenceType[];
  authenticityVerified: boolean;
  releaseGateEligible: boolean;
  evaluatedAt: string;
  decisionHash: string;
};

const sha256Pattern = /^[0-9a-f]{64}$/i;
const idPattern = /^[A-Za-z0-9][A-Za-z0-9._:-]{2,159}$/;
const evidenceTypes = new Set<P34EvidenceType>([
  "candidate-manifest",
  "validation-packet",
  "gate-packet",
  "security-evidence",
  "review-packet",
  "migration-report",
  "model-qualification",
  "aal2",
  "public-claims",
  "investor-artifact",
  "preview-validation",
  "specialist-review"
]);
const evidenceEnvelopeKeys = [
  "schemaVersion",
  "evidenceId",
  "evidenceType",
  "sourceCandidate",
  "validationVersion",
  "generatedAt",
  "expiresAt",
  "evidenceHash",
  "issuerIdentityHash",
  "trustClass",
  "signature"
] as const satisfies readonly (keyof P34EvidenceEnvelope)[];
const hour = 60 * 60 * 1_000;
const day = 24 * hour;
const evidenceFreshnessPolicies: Record<P34EvidenceType, {
  maximumAgeMs: number;
  maximumWindowMs: number;
  trustedExternalRequired: boolean;
}> = {
  "candidate-manifest": { maximumAgeMs: 48 * hour, maximumWindowMs: 48 * hour, trustedExternalRequired: false },
  "validation-packet": { maximumAgeMs: 48 * hour, maximumWindowMs: 48 * hour, trustedExternalRequired: false },
  "gate-packet": { maximumAgeMs: 48 * hour, maximumWindowMs: 48 * hour, trustedExternalRequired: false },
  "security-evidence": { maximumAgeMs: 48 * hour, maximumWindowMs: 48 * hour, trustedExternalRequired: false },
  "review-packet": { maximumAgeMs: 7 * day, maximumWindowMs: 7 * day, trustedExternalRequired: false },
  "migration-report": { maximumAgeMs: 7 * day, maximumWindowMs: 7 * day, trustedExternalRequired: false },
  "model-qualification": { maximumAgeMs: 30 * day, maximumWindowMs: 30 * day, trustedExternalRequired: true },
  aal2: { maximumAgeMs: 15 * 60 * 1_000, maximumWindowMs: 15 * 60 * 1_000, trustedExternalRequired: true },
  "public-claims": { maximumAgeMs: 30 * day, maximumWindowMs: 30 * day, trustedExternalRequired: false },
  "investor-artifact": { maximumAgeMs: 30 * day, maximumWindowMs: 30 * day, trustedExternalRequired: false },
  "preview-validation": { maximumAgeMs: day, maximumWindowMs: day, trustedExternalRequired: true },
  "specialist-review": { maximumAgeMs: 7 * day, maximumWindowMs: 7 * day, trustedExternalRequired: true }
};

function isEvidenceType(value: unknown): value is P34EvidenceType {
  return typeof value === "string" && evidenceTypes.has(value as P34EvidenceType);
}

function isBoundedIdentifier(value: unknown): value is string {
  return typeof value === "string" && idPattern.test(value);
}

function isSha256(value: unknown): value is string {
  return typeof value === "string" && sha256Pattern.test(value);
}

function hasExactOwnKeys(value: unknown, keys: readonly string[]) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
}

function unsignedEvidence(evidence: P34EvidenceEnvelope) {
  return {
    schemaVersion: evidence.schemaVersion,
    evidenceId: evidence.evidenceId,
    evidenceType: evidence.evidenceType,
    sourceCandidate: evidence.sourceCandidate,
    validationVersion: evidence.validationVersion,
    generatedAt: evidence.generatedAt,
    expiresAt: evidence.expiresAt,
    evidenceHash: evidence.evidenceHash,
    issuerIdentityHash: evidence.issuerIdentityHash,
    trustClass: evidence.trustClass
  };
}

export function createSyntheticP34EvidenceSignature(
  evidence: Omit<P34EvidenceEnvelope, "signature">,
  verifierId: string
) {
  return createClinicalEvidenceHash({ type: "p34-synthetic-evidence-signature", verifierId, evidence });
}

export function createSyntheticP34EvidenceVerifier(verifierId: string): P34EvidenceVerifier {
  if (!isBoundedIdentifier(verifierId)) throw new Error("Synthetic evidence verifier ID must be bounded");
  return {
    verifierId,
    trustClass: "synthetic-test-only",
    verify(evidence) {
      return {
        valid: evidence.signature === createSyntheticP34EvidenceSignature(unsignedEvidence(evidence), verifierId),
        authenticatedIssuerIdentityHash: typeof evidence.issuerIdentityHash === "string"
          ? evidence.issuerIdentityHash.toLowerCase()
          : "invalid"
      };
    }
  };
}

export const p34ExpiredEvidenceRegenerationOrder: P34EvidenceType[] = [
  "candidate-manifest",
  "validation-packet",
  "security-evidence",
  "model-qualification",
  "migration-report",
  "aal2",
  "public-claims",
  "investor-artifact",
  "preview-validation",
  "specialist-review",
  "review-packet",
  "gate-packet"
];

export function evaluateP34EvidenceFreshness(
  evidence: P34EvidenceEnvelope,
  expectedCandidate: string,
  clock: TrustedClock,
  context: P34EvidenceVerificationContext
): P34EvidenceFreshnessDecision {
  const reasonCodes: string[] = [];
  const record = (evidence && typeof evidence === "object" ? evidence : {}) as Partial<P34EvidenceEnvelope>;
  if (record !== evidence) reasonCodes.push("EVIDENCE_RECORD_INVALID");
  if (!hasExactOwnKeys(record, evidenceEnvelopeKeys)) reasonCodes.push("EVIDENCE_FIELDS_INVALID");
  if (record.schemaVersion !== "scrimed-p34-evidence-envelope-v2") reasonCodes.push("EVIDENCE_SCHEMA_INVALID");
  if (!isEvidenceType(record.evidenceType)) reasonCodes.push("EVIDENCE_TYPE_INVALID");
  if (!isBoundedIdentifier(record.evidenceId) || typeof record.validationVersion !== "string" ||
      !record.validationVersion.trim() || record.validationVersion.length > 160) {
    reasonCodes.push("EVIDENCE_IDENTITY_INVALID");
  }
  if (!isSha256(record.sourceCandidate) || !isSha256(expectedCandidate)) {
    reasonCodes.push("CANDIDATE_FINGERPRINT_INVALID");
  } else if (record.sourceCandidate?.toLowerCase() !== expectedCandidate.toLowerCase()) {
    reasonCodes.push("EVIDENCE_CANDIDATE_MISMATCH");
  }
  if (!isSha256(record.evidenceHash)) reasonCodes.push("EVIDENCE_HASH_INVALID");
  if (!isSha256(record.issuerIdentityHash) || !isSha256(context?.expectedIssuerIdentityHash)) {
    reasonCodes.push("EVIDENCE_ISSUER_IDENTITY_INVALID");
  } else if (record.issuerIdentityHash.toLowerCase() !== context.expectedIssuerIdentityHash.toLowerCase()) {
    reasonCodes.push("EVIDENCE_ISSUER_IDENTITY_MISMATCH");
  }
  if (typeof context?.expectedValidationVersion !== "string" || !context.expectedValidationVersion.trim() ||
      record.validationVersion !== context.expectedValidationVersion) {
    reasonCodes.push("EVIDENCE_VALIDATION_VERSION_MISMATCH");
  }
  if (!isSha256(record.signature)) reasonCodes.push("EVIDENCE_SIGNATURE_FORMAT_INVALID");
  if (record.trustClass !== "synthetic-test-only" && record.trustClass !== "trusted-external") {
    reasonCodes.push("EVIDENCE_TRUST_CLASS_INVALID");
  }

  const verifier = context?.verifier;
  if (!isBoundedIdentifier(verifier?.verifierId) || typeof verifier?.verify !== "function" ||
      (verifier?.trustClass !== "synthetic-test-only" && verifier?.trustClass !== "trusted-external")) {
    reasonCodes.push("EVIDENCE_VERIFIER_INVALID");
  }
  if (verifier?.trustClass !== record.trustClass) reasonCodes.push("EVIDENCE_TRUST_CLASS_MISMATCH");
  let signatureVerified = false;
  let authenticatedIssuerIdentityHash = "invalid";
  try {
    const verification = typeof verifier?.verify === "function" ? verifier.verify(evidence) : null;
    signatureVerified = verification?.valid === true;
    authenticatedIssuerIdentityHash = isSha256(verification?.authenticatedIssuerIdentityHash)
      ? verification.authenticatedIssuerIdentityHash.toLowerCase()
      : "invalid";
  } catch {
    reasonCodes.push("EVIDENCE_VERIFIER_FAILURE");
  }
  if (!signatureVerified) reasonCodes.push("EVIDENCE_SIGNATURE_INVALID");
  if (authenticatedIssuerIdentityHash === "invalid" ||
      (isSha256(record.issuerIdentityHash) && authenticatedIssuerIdentityHash !== record.issuerIdentityHash.toLowerCase())) {
    reasonCodes.push("EVIDENCE_AUTHENTICATED_ISSUER_MISMATCH");
  }
  const policy = isEvidenceType(record.evidenceType) ? evidenceFreshnessPolicies[record.evidenceType] : null;
  const releaseGateUse = context?.usage === "release-gate";
  if (context?.usage !== "synthetic-test-only" && !releaseGateUse) reasonCodes.push("EVIDENCE_USAGE_INVALID");
  if ((releaseGateUse || policy?.trustedExternalRequired) &&
      (record.trustClass !== "trusted-external" || verifier?.trustClass !== "trusted-external")) {
    reasonCodes.push("EVIDENCE_TRUSTED_EXTERNAL_REQUIRED");
  }

  const time = evaluateTrustedTimeWindow({
    issuedAt: typeof record.generatedAt === "string" ? record.generatedAt : "",
    expiresAt: typeof record.expiresAt === "string" ? record.expiresAt : "",
    maximumAgeMs: policy?.maximumAgeMs,
    maximumWindowMs: policy?.maximumWindowMs
  }, clock);
  reasonCodes.push(...time.reasonCodes.map((reason) => `EVIDENCE_${reason}`));
  if ((releaseGateUse || policy?.trustedExternalRequired) && time.source !== "server-runtime") {
    reasonCodes.push("EVIDENCE_SERVER_RUNTIME_CLOCK_REQUIRED");
  }

  const normalizedReasons = [...new Set(reasonCodes)].sort();
  const freshness = normalizedReasons.includes("EVIDENCE_CANDIDATE_MISMATCH")
    ? "candidate-mismatch" as const
    : normalizedReasons.includes("EVIDENCE_TIME_WINDOW_EXPIRED")
      ? "expired" as const
      : normalizedReasons.length
        ? "invalid" as const
        : "fresh" as const;
  const requiredRegeneration = freshness === "fresh"
    ? []
    : [...p34ExpiredEvidenceRegenerationOrder];
  const authenticityVerified = signatureVerified && authenticatedIssuerIdentityHash !== "invalid" &&
    !normalizedReasons.some((reason) => reason.includes("SIGNATURE") || reason.includes("ISSUER") || reason.includes("TRUST_CLASS"));
  const releaseGateEligible = freshness === "fresh" && releaseGateUse && verifier?.trustClass === "trusted-external" &&
    record.trustClass === "trusted-external";
  const payload = {
    evidenceId: isBoundedIdentifier(record.evidenceId) ? record.evidenceId : "invalid",
    evidenceType: isEvidenceType(record.evidenceType) ? record.evidenceType : "invalid",
    sourceCandidate: isSha256(record.sourceCandidate) ? record.sourceCandidate : "invalid",
    expectedCandidate,
    validationVersion: typeof record.validationVersion === "string" ? record.validationVersion : "invalid",
    evidenceHash: isSha256(record.evidenceHash) ? record.evidenceHash : "invalid",
    issuerIdentityHash: isSha256(record.issuerIdentityHash) ? record.issuerIdentityHash.toLowerCase() : "invalid",
    verifierId: isBoundedIdentifier(verifier?.verifierId) ? verifier.verifierId : "invalid",
    usage: context?.usage ?? "invalid",
    evaluatedAt: time.evaluatedAt,
    freshness,
    authenticityVerified,
    releaseGateEligible,
    reasonCodes: normalizedReasons,
    requiredRegeneration
  };
  return {
    decision: freshness === "fresh" ? "ALLOW" : "BLOCK",
    freshness,
    reasonCodes: normalizedReasons,
    requiredRegeneration,
    authenticityVerified,
    releaseGateEligible,
    evaluatedAt: time.evaluatedAt,
    decisionHash: createClinicalEvidenceHash({ type: "p34-evidence-freshness", payload })
  };
}

export function evaluateP34EvidenceSet(input: {
  evidence: P34EvidenceEnvelope[];
  requiredTypes: P34EvidenceType[];
  expectedCandidate: string;
  clock: TrustedClock;
  verificationContext: P34EvidenceVerificationContext;
}) {
  const setReasonCodes: string[] = [];
  const record = (input && typeof input === "object" ? input : {}) as Partial<typeof input>;
  if (record !== input) setReasonCodes.push("EVIDENCE_SET_INPUT_INVALID");
  const rawRequiredTypes = Array.isArray(record.requiredTypes) ? record.requiredTypes : [];
  const requiredTypes = Array.isArray(record.requiredTypes)
    ? record.requiredTypes.filter(isEvidenceType)
    : [];
  if (!Array.isArray(record.requiredTypes) || requiredTypes.length !== rawRequiredTypes.length || requiredTypes.length === 0) {
    setReasonCodes.push("REQUIRED_EVIDENCE_TYPES_INVALID");
  }
  if (new Set(requiredTypes).size !== requiredTypes.length) {
    setReasonCodes.push("REQUIRED_EVIDENCE_TYPES_DUPLICATE");
  }
  const rawEvidenceItems = Array.isArray(record.evidence) ? record.evidence : [];
  const evidenceItems = rawEvidenceItems.filter(
    (item): item is P34EvidenceEnvelope => Boolean(item) && typeof item === "object"
  );
  if (!Array.isArray(record.evidence) || evidenceItems.length !== rawEvidenceItems.length || evidenceItems.length > 128) {
    setReasonCodes.push("EVIDENCE_SET_INVALID");
  }
  const decisions = evidenceItems.map((item) =>
    evaluateP34EvidenceFreshness(
      item,
      typeof record.expectedCandidate === "string" ? record.expectedCandidate : "",
      record.clock as TrustedClock,
      record.verificationContext as P34EvidenceVerificationContext
    )
  );
  const presentTypes = new Set(evidenceItems.filter((item) => isEvidenceType(item.evidenceType)).map((item) => item.evidenceType));
  const duplicateTypes = [...presentTypes].filter(
    (type) => evidenceItems.filter((item) => item.evidenceType === type).length > 1
  );
  if (duplicateTypes.length) setReasonCodes.push("EVIDENCE_TYPE_DUPLICATE");
  const missingTypes = requiredTypes.filter((type) => !presentTypes.has(type));
  const normalizedSetReasons = [...new Set(setReasonCodes)].sort();
  const fresh = normalizedSetReasons.length === 0 && missingTypes.length === 0 &&
    decisions.every((decision) => decision.decision === "ALLOW");
  const requiredRegeneration = [...new Set([
    ...missingTypes,
    ...decisions.flatMap((decision) => decision.requiredRegeneration)
  ])].sort() as P34EvidenceType[];
  const payload = {
    expectedCandidate: typeof record.expectedCandidate === "string" ? record.expectedCandidate : "invalid",
    requiredTypes: [...requiredTypes].sort(),
    evidenceHashes: evidenceItems.map((item) => item.evidenceHash).sort(),
    missingTypes,
    requiredRegeneration,
    reasonCodes: normalizedSetReasons,
    fresh
  };
  return {
    decision: fresh ? "ALLOW" as const : "BLOCK" as const,
    fresh,
    missingTypes,
    requiredRegeneration,
    reasonCodes: normalizedSetReasons,
    decisions,
    setHash: createClinicalEvidenceHash({ type: "p34-evidence-set", payload })
  };
}
