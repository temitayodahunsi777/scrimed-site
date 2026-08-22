import { createClinicalEvidenceHash } from "../clinicalEvidenceControls";
import { evaluateTrustedTimeWindow, type TrustedClock } from "./trustedClock";

export type P34EvidenceType =
  | "candidate-manifest"
  | "validation-packet"
  | "gate-packet"
  | "security-evidence"
  | "review-packet"
  | "migration-report"
  | "public-claims"
  | "investor-artifact";

export type P34EvidenceEnvelope = {
  evidenceId: string;
  evidenceType: P34EvidenceType;
  sourceCandidate: string;
  validationVersion: string;
  generatedAt: string;
  expiresAt: string;
  evidenceHash: string;
};

export type P34EvidenceFreshnessDecision = {
  decision: "ALLOW" | "BLOCK";
  freshness: "fresh" | "expired" | "candidate-mismatch" | "invalid";
  reasonCodes: string[];
  requiredRegeneration: P34EvidenceType[];
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
  "public-claims",
  "investor-artifact"
]);

function isEvidenceType(value: unknown): value is P34EvidenceType {
  return typeof value === "string" && evidenceTypes.has(value as P34EvidenceType);
}

function isBoundedIdentifier(value: unknown): value is string {
  return typeof value === "string" && idPattern.test(value);
}

function isSha256(value: unknown): value is string {
  return typeof value === "string" && sha256Pattern.test(value);
}

export const p34ExpiredEvidenceRegenerationOrder: P34EvidenceType[] = [
  "candidate-manifest",
  "validation-packet",
  "security-evidence",
  "review-packet",
  "gate-packet"
];

export function evaluateP34EvidenceFreshness(
  evidence: P34EvidenceEnvelope,
  expectedCandidate: string,
  clock: TrustedClock
): P34EvidenceFreshnessDecision {
  const reasonCodes: string[] = [];
  const record = (evidence && typeof evidence === "object" ? evidence : {}) as Partial<P34EvidenceEnvelope>;
  if (record !== evidence) reasonCodes.push("EVIDENCE_RECORD_INVALID");
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

  const time = evaluateTrustedTimeWindow({
    issuedAt: typeof record.generatedAt === "string" ? record.generatedAt : "",
    expiresAt: typeof record.expiresAt === "string" ? record.expiresAt : ""
  }, clock);
  reasonCodes.push(...time.reasonCodes.map((reason) => `EVIDENCE_${reason}`));

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
  const payload = {
    evidenceId: isBoundedIdentifier(record.evidenceId) ? record.evidenceId : "invalid",
    evidenceType: isEvidenceType(record.evidenceType) ? record.evidenceType : "invalid",
    sourceCandidate: isSha256(record.sourceCandidate) ? record.sourceCandidate : "invalid",
    expectedCandidate,
    validationVersion: typeof record.validationVersion === "string" ? record.validationVersion : "invalid",
    evidenceHash: isSha256(record.evidenceHash) ? record.evidenceHash : "invalid",
    evaluatedAt: time.evaluatedAt,
    freshness,
    reasonCodes: normalizedReasons,
    requiredRegeneration
  };
  return {
    decision: freshness === "fresh" ? "ALLOW" : "BLOCK",
    freshness,
    reasonCodes: normalizedReasons,
    requiredRegeneration,
    evaluatedAt: time.evaluatedAt,
    decisionHash: createClinicalEvidenceHash({ type: "p34-evidence-freshness", payload })
  };
}

export function evaluateP34EvidenceSet(input: {
  evidence: P34EvidenceEnvelope[];
  requiredTypes: P34EvidenceType[];
  expectedCandidate: string;
  clock: TrustedClock;
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
      record.clock as TrustedClock
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
