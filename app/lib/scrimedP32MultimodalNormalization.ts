import { createClinicalEvidenceHash } from "./clinicalEvidenceControls";

export const scrimedP32MultimodalNormalizationVersion =
  "scrimed-p32-multimodal-normalization-v1-2026-07-20";

export const scrimedP32MultimodalNormalizationBoundary =
  "Multimodal normalization accepts synthetic or approved deidentified metadata only. Extracted facts are reviewable candidates, not verified clinical truth, and no imaging, genomics, handwriting, OCR, or document output may finalize a clinical decision.";

export type MultimodalSourceKind =
  | "pdf"
  | "scan"
  | "handwriting"
  | "fhir"
  | "hl7-v2"
  | "x12"
  | "csv"
  | "sftp-manifest"
  | "claim"
  | "imaging-metadata"
  | "genomics-metadata";

export type NormalizedMultimodalFact = {
  factId: string;
  tenantId: string;
  syntheticSubjectId: string;
  source: {
    documentId: string;
    documentDigest: string;
    sourceKind: MultimodalSourceKind;
    receivedAt: string;
  };
  extraction: {
    method: "structured-parser" | "ocr" | "layout-parser" | "manual-review" | "device-metadata-parser";
    version: string;
    location: {
      page: number | null;
      spanStart: number | null;
      spanEnd: number | null;
      geometry: [number, number, number, number] | null;
      path: string | null;
    };
    confidence: number;
    extractedAt: string;
  };
  concept: {
    code: string;
    system: string;
    display: string;
  };
  value: string;
  unit: string | null;
  observedAt: string;
  transformationHistory: Array<{
    stepId: string;
    method: string;
    version: string;
    inputDigest: string;
    outputDigest: string;
    occurredAt: string;
  }>;
  humanCorrectionHistory: Array<{
    correctionId: string;
    reviewerIdentityHash: string;
    priorValueHash: string;
    correctedValueHash: string;
    reasonCode: string;
    correctedAt: string;
  }>;
  verificationStatus: "unverified" | "human-review-required" | "reviewed-synthetic";
  conflictingFactIds: string[];
  clinicalAuthorityGranted: false;
  provenanceHash: string;
};

const sha256Pattern = /^[0-9a-f]{64}$/i;
const sensitivePattern = /(?:\b\d{3}-\d{2}-\d{4}\b|\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b|bearer\s+[A-Za-z0-9._-]+|(?:token|secret|password)\s*[:=])/i;

export function normalizeMultimodalFact(
  input: Omit<NormalizedMultimodalFact, "verificationStatus" | "clinicalAuthorityGranted" | "provenanceHash">
): NormalizedMultimodalFact {
  if (!input.syntheticSubjectId.startsWith("synthetic-") || !input.tenantId || !input.factId) {
    throw new Error("Multimodal normalization requires tenant-bound synthetic subject metadata");
  }
  if (!sha256Pattern.test(input.source.documentDigest)) {
    throw new Error("Multimodal source requires a SHA-256 document digest");
  }
  if (!Number.isFinite(input.extraction.confidence) || input.extraction.confidence < 0 || input.extraction.confidence > 1) {
    throw new Error("Multimodal extraction confidence must be between zero and one");
  }
  if (sensitivePattern.test(JSON.stringify(input))) {
    throw new Error("Multimodal normalization rejected identifier or credential-like material");
  }
  if (input.transformationHistory.some((step) => !sha256Pattern.test(step.inputDigest) || !sha256Pattern.test(step.outputDigest))) {
    throw new Error("Multimodal transformations require digest-bound lineage");
  }
  const verificationStatus = input.extraction.confidence < 0.95 || input.conflictingFactIds.length
    ? "human-review-required" as const
    : input.humanCorrectionHistory.length
      ? "reviewed-synthetic" as const
      : "unverified" as const;
  const withoutHash = {
    ...input,
    conflictingFactIds: [...new Set(input.conflictingFactIds)].sort(),
    verificationStatus,
    clinicalAuthorityGranted: false as const
  };
  return {
    ...withoutHash,
    provenanceHash: createClinicalEvidenceHash({
      version: scrimedP32MultimodalNormalizationVersion,
      fact: withoutHash
    })
  };
}

export function readTenantMultimodalFacts(
  tenantId: string,
  facts: NormalizedMultimodalFact[]
) {
  if (!tenantId || facts.some((fact) => fact.tenantId !== tenantId)) {
    throw new Error("Cross-tenant multimodal fact access is denied");
  }
  return [...facts].sort((left, right) => left.factId.localeCompare(right.factId));
}

export function detectMultimodalFactConflicts(facts: NormalizedMultimodalFact[]) {
  const conflicts: Array<{ conceptKey: string; factIds: string[] }> = [];
  const groups = new Map<string, NormalizedMultimodalFact[]>();
  for (const fact of facts) {
    const key = `${fact.concept.system}|${fact.concept.code}|${fact.observedAt}`;
    groups.set(key, [...(groups.get(key) ?? []), fact]);
  }
  for (const [conceptKey, group] of groups) {
    const values = new Set(group.map((fact) => `${fact.value}|${fact.unit ?? ""}`));
    if (values.size > 1) {
      conflicts.push({ conceptKey, factIds: group.map((fact) => fact.factId).sort() });
    }
  }
  return conflicts.sort((left, right) => left.conceptKey.localeCompare(right.conceptKey));
}
