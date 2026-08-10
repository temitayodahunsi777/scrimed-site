import { createAuditHash } from "./scrimed-work/audit";
import type { DataPurpose } from "./scrimedP32HealthConversationFabric";

export const scrimedP32PatientRecordsVersion = "scrimed-p32-patient-records-v1-2026-07-28";

export const scrimedP32PatientRecordsBoundary =
  "Ambient documentation and patient-controlled record contracts are synthetic, source-preserving, consent-bound, and review-gated. They do not retain raw audio by default, authorize record writeback, create diagnoses or orders, submit payer actions, or permit training and secondary use without separate governance.";

export type RetentionPolicy = {
  policyId: string;
  rawAudioRetention: "none" | "bounded-encrypted";
  rawAudioTtlMinutes: number;
  transcriptTtlDays: number;
  automaticDeletionRequired: true;
  legalHoldOverrideRequiresSeparateApproval: true;
  policyHash: string;
};

export type AudioConsentRecord = {
  consentId: string;
  tenantId: string;
  syntheticSubjectReferenceHash: string;
  encounterReferenceHash: string;
  consentState: "granted" | "withdrawn";
  grantedAt: string;
  withdrawnAt: string | null;
  purpose: "ambient-documentation-draft";
  retentionPolicyId: string;
  actorIdentityHash: string;
  consentReceiptHash: string;
};

export type AmbientEncounterDraft = {
  draftId: string;
  tenantId: string;
  encounterReferenceHash: string;
  consentId: string;
  sourceAudioDigest: string | null;
  rawAudioStoredInGeneralLogs: false;
  originalDraftDigest: string;
  currentDraftDigest: string;
  clinicianEditDigests: string[];
  rejectionReason: string | null;
  reviewerIdentityHash: string | null;
  reviewedAt: string | null;
  status: "draft" | "rejected" | "clinician-signed";
  recordInclusionAllowed: boolean;
  ehrWritebackAllowed: false;
  autonomousOrdersAllowed: false;
  autonomousDiagnosisAllowed: false;
  billingMutationAllowed: false;
  payerSubmissionAllowed: false;
  createdAt: string;
  auditHash: string;
};

export type AmbientOutcomeLedger = {
  ledgerId: string;
  tenantId: string;
  encounterReferenceHash: string;
  baselineDocumentationMinutes: number;
  assistedDocumentationMinutes: number;
  afterHoursChartingMinutes: number;
  normalizedEditDistance: number;
  disposition: "accepted" | "rejected" | "pending";
  unsupportedStatementCount: number;
  omittedRelevantInformationCount: number;
  clinicianOverrideMinutes: number;
  encounterAdopted: boolean;
  inferenceCostUsd: number;
  reviewCostUsd: number;
  costPerValidatedSuccessfulEncounterUsd: number | null;
  observedAt: string;
  auditHash: string;
};

export type PatientDataGrant = {
  grantId: string;
  tenantId: string;
  subjectReferenceHash: string;
  connectorId: string;
  purpose: DataPurpose;
  permittedSourceIds: string[];
  permittedOperations: Array<"read" | "export-preview" | "delete-request">;
  trainingUseAllowed: false;
  secondaryUseAllowed: false;
  issuedAt: string;
  expiresAt: string;
  revokedAt: string | null;
  state: "active" | "revoked" | "expired";
  grantHash: string;
};

export type ConnectionReceipt = {
  receiptId: string;
  tenantId: string;
  grantId: string;
  connectorId: string;
  operation: "connected" | "read" | "export-preview";
  sourceIds: string[];
  occurredAt: string;
  futureAccessAllowed: boolean;
  rawPayloadLogged: false;
  receiptHash: string;
};

export type RevocationReceipt = {
  receiptId: string;
  tenantId: string;
  grantId: string;
  revokedAt: string;
  reason: string;
  futureConnectorAccessAllowed: false;
  rawPayloadDeletedFromLogs: true;
  receiptHash: string;
};

export type LongitudinalRecordEntry = {
  entryId: string;
  sourceId: string;
  sourceTimestamp: string;
  originalValueDigest: string;
  normalizedDisplayValue: string;
  normalizationVersion: string;
  provenanceHash: string;
  explanation: string;
  explanationIsDiagnosisOrTreatment: false;
};

export type SourceCoverageManifest = {
  requiredSourceTypes: string[];
  availableSourceIds: string[];
  missingSourceTypes: string[];
  coveragePercent: number;
  freshnessWarnings: string[];
  manifestHash: string;
};

export type LongitudinalRecordManifest = {
  manifestId: string;
  tenantId: string;
  subjectReferenceHash: string;
  entries: LongitudinalRecordEntry[];
  sourceCoverage: SourceCoverageManifest;
  purpose: DataPurpose;
  exportStatus: "not-requested" | "preview-ready";
  deletionStatus: "not-requested" | "request-recorded";
  trainingUseAllowed: false;
  secondaryUseAllowed: false;
  clinicalDecisionAuthority: false;
  createdAt: string;
  manifestHash: string;
};

export type AudioDeletionEvent = {
  eventId: string;
  consentId: string;
  sourceAudioDigest: string | null;
  dueAt: string;
  evaluatedAt: string;
  status: "not-due" | "deletion-required" | "verified-deleted";
  rawAudioPresentAfterDeletion: false;
  eventHash: string;
};

const hashPattern = /^[0-9a-f]{64}$/i;

function validIso(value: string) {
  return Number.isFinite(Date.parse(value));
}

function requireHash(value: string, label: string) {
  if (!hashPattern.test(value)) throw new Error(`${label} must be a SHA-256 digest`);
}

function finiteNonnegative(value: number, label: string) {
  if (!Number.isFinite(value) || value < 0) throw new Error(`${label} must be finite and nonnegative`);
}

function requireActiveAmbientConsent(
  consent: AudioConsentRecord,
  input: Pick<AmbientEncounterDraft, "tenantId" | "encounterReferenceHash" | "consentId">,
  eventAt: string
) {
  if (
    consent.consentId !== input.consentId ||
    consent.tenantId !== input.tenantId ||
    consent.encounterReferenceHash !== input.encounterReferenceHash
  ) {
    throw new Error("Ambient draft is not bound to the supplied consent record");
  }
  if (
    consent.consentState !== "granted" ||
    consent.withdrawnAt !== null ||
    !validIso(eventAt) ||
    Date.parse(eventAt) < Date.parse(consent.grantedAt)
  ) {
    throw new Error("Active ambient documentation consent is required");
  }
}

export function createRetentionPolicy(
  input: Omit<RetentionPolicy, "automaticDeletionRequired" | "legalHoldOverrideRequiresSeparateApproval" | "policyHash">
): RetentionPolicy {
  finiteNonnegative(input.rawAudioTtlMinutes, "raw audio TTL");
  finiteNonnegative(input.transcriptTtlDays, "transcript TTL");
  if (input.rawAudioRetention === "none" && input.rawAudioTtlMinutes !== 0) {
    throw new Error("No-retention audio policy must use a zero-minute TTL");
  }
  const base = {
    ...input,
    automaticDeletionRequired: true as const,
    legalHoldOverrideRequiresSeparateApproval: true as const
  };
  return { ...base, policyHash: createAuditHash({ type: "retention-policy", base }) };
}

export function createAudioConsentRecord(
  input: Omit<AudioConsentRecord, "consentState" | "withdrawnAt" | "purpose" | "consentReceiptHash">
): AudioConsentRecord {
  for (const [label, value] of [
    ["subject reference", input.syntheticSubjectReferenceHash],
    ["encounter reference", input.encounterReferenceHash],
    ["actor identity", input.actorIdentityHash]
  ] as const) requireHash(value, label);
  if (!validIso(input.grantedAt)) throw new Error("Audio consent timestamp is invalid");
  const base = {
    ...input,
    consentState: "granted" as const,
    withdrawnAt: null,
    purpose: "ambient-documentation-draft" as const
  };
  return { ...base, consentReceiptHash: createAuditHash({ type: "audio-consent", base }) };
}

export function withdrawAudioConsent(
  consent: AudioConsentRecord,
  withdrawnAt: string
): AudioConsentRecord {
  if (!validIso(withdrawnAt) || Date.parse(withdrawnAt) < Date.parse(consent.grantedAt)) {
    throw new Error("Audio consent withdrawal timestamp is invalid");
  }
  const base = { ...consent, consentState: "withdrawn" as const, withdrawnAt };
  delete (base as Partial<AudioConsentRecord>).consentReceiptHash;
  return { ...base, consentReceiptHash: createAuditHash({ type: "audio-consent", base }) };
}

export function buildAmbientEncounterDraft(
  input: Omit<
    AmbientEncounterDraft,
    | "rawAudioStoredInGeneralLogs"
    | "recordInclusionAllowed"
    | "ehrWritebackAllowed"
    | "autonomousOrdersAllowed"
    | "autonomousDiagnosisAllowed"
    | "billingMutationAllowed"
    | "payerSubmissionAllowed"
    | "auditHash"
  >,
  consent: AudioConsentRecord
): AmbientEncounterDraft {
  requireActiveAmbientConsent(consent, input, input.createdAt);
  requireHash(input.encounterReferenceHash, "encounter reference");
  requireHash(input.originalDraftDigest, "original draft");
  requireHash(input.currentDraftDigest, "current draft");
  if (input.sourceAudioDigest !== null) requireHash(input.sourceAudioDigest, "source audio");
  input.clinicianEditDigests.forEach((digest) => requireHash(digest, "clinician edit"));
  if (!validIso(input.createdAt)) throw new Error("Ambient draft timestamp is invalid");
  if (input.status === "clinician-signed" && (!input.reviewerIdentityHash || !input.reviewedAt)) {
    throw new Error("Ambient draft cannot be clinician-signed without named review");
  }
  if (input.reviewerIdentityHash) requireHash(input.reviewerIdentityHash, "reviewer identity");
  if (input.reviewedAt && !validIso(input.reviewedAt)) throw new Error("Ambient review timestamp is invalid");
  const base = {
    ...input,
    rawAudioStoredInGeneralLogs: false as const,
    recordInclusionAllowed: input.status === "clinician-signed",
    ehrWritebackAllowed: false as const,
    autonomousOrdersAllowed: false as const,
    autonomousDiagnosisAllowed: false as const,
    billingMutationAllowed: false as const,
    payerSubmissionAllowed: false as const
  };
  return { ...base, auditHash: createAuditHash({ type: "ambient-encounter-draft", base }) };
}

export function recordAmbientClinicianDecision(
  draft: AmbientEncounterDraft,
  input: {
    reviewerIdentityHash: string;
    decision: "sign" | "reject";
    currentDraftDigest: string;
    clinicianEditDigest?: string;
    rejectionReason?: string;
    reviewedAt: string;
  },
  consent: AudioConsentRecord
): AmbientEncounterDraft {
  requireActiveAmbientConsent(consent, draft, input.reviewedAt);
  requireHash(input.reviewerIdentityHash, "reviewer identity");
  requireHash(input.currentDraftDigest, "current draft");
  if (input.clinicianEditDigest) requireHash(input.clinicianEditDigest, "clinician edit");
  if (!validIso(input.reviewedAt)) throw new Error("Ambient review timestamp is invalid");
  if (input.decision === "reject" && !input.rejectionReason?.trim()) {
    throw new Error("Rejected ambient draft requires a reason");
  }
  return buildAmbientEncounterDraft(
    {
      ...draft,
      currentDraftDigest: input.currentDraftDigest,
      clinicianEditDigests: input.clinicianEditDigest
        ? [...draft.clinicianEditDigests, input.clinicianEditDigest]
        : draft.clinicianEditDigests,
      rejectionReason: input.decision === "reject" ? input.rejectionReason!.trim() : null,
      reviewerIdentityHash: input.reviewerIdentityHash,
      reviewedAt: input.reviewedAt,
      status: input.decision === "sign" ? "clinician-signed" : "rejected"
    },
    consent
  );
}

export function evaluateAudioRetention(input: {
  eventId: string;
  consent: AudioConsentRecord;
  policy: RetentionPolicy;
  sourceAudioDigest: string | null;
  evaluatedAt: string;
  deletionVerified: boolean;
}): AudioDeletionEvent {
  if (input.sourceAudioDigest !== null) requireHash(input.sourceAudioDigest, "source audio");
  if (!validIso(input.evaluatedAt)) throw new Error("Audio retention evaluation timestamp is invalid");
  const dueAt = new Date(
    Date.parse(input.consent.grantedAt) + input.policy.rawAudioTtlMinutes * 60_000
  ).toISOString();
  const withdrawn = input.consent.consentState === "withdrawn";
  const due = input.policy.rawAudioRetention === "none" || withdrawn || Date.parse(input.evaluatedAt) >= Date.parse(dueAt);
  const status: AudioDeletionEvent["status"] = !due
    ? "not-due"
    : input.deletionVerified
      ? "verified-deleted"
      : "deletion-required";
  const base = {
    eventId: input.eventId,
    consentId: input.consent.consentId,
    sourceAudioDigest: input.sourceAudioDigest,
    dueAt,
    evaluatedAt: input.evaluatedAt,
    status,
    rawAudioPresentAfterDeletion: false as const
  };
  return { ...base, eventHash: createAuditHash({ type: "audio-deletion-event", base }) };
}

export function buildAmbientOutcomeLedger(
  input: Omit<AmbientOutcomeLedger, "costPerValidatedSuccessfulEncounterUsd" | "auditHash">
): AmbientOutcomeLedger {
  for (const [label, value] of [
    ["baseline documentation minutes", input.baselineDocumentationMinutes],
    ["assisted documentation minutes", input.assistedDocumentationMinutes],
    ["after-hours charting minutes", input.afterHoursChartingMinutes],
    ["normalized edit distance", input.normalizedEditDistance],
    ["unsupported statement count", input.unsupportedStatementCount],
    ["omitted information count", input.omittedRelevantInformationCount],
    ["clinician override minutes", input.clinicianOverrideMinutes],
    ["inference cost", input.inferenceCostUsd],
    ["review cost", input.reviewCostUsd]
  ] as const) finiteNonnegative(value, label);
  if (input.normalizedEditDistance > 1) throw new Error("Normalized edit distance must be at most one");
  const accepted = input.disposition === "accepted" && input.encounterAdopted;
  const totalCost = input.inferenceCostUsd + input.reviewCostUsd;
  const base = {
    ...input,
    costPerValidatedSuccessfulEncounterUsd: accepted ? totalCost : null
  };
  return { ...base, auditHash: createAuditHash({ type: "ambient-outcome-ledger", base }) };
}

export function createPatientDataGrant(
  input: Omit<PatientDataGrant, "revokedAt" | "state" | "trainingUseAllowed" | "secondaryUseAllowed" | "grantHash">
): PatientDataGrant {
  requireHash(input.subjectReferenceHash, "subject reference");
  if (!validIso(input.issuedAt) || !validIso(input.expiresAt) || Date.parse(input.expiresAt) <= Date.parse(input.issuedAt)) {
    throw new Error("Patient data grant timestamps are invalid");
  }
  if (!input.permittedSourceIds.length || !input.permittedOperations.length) {
    throw new Error("Patient data grants require granular source and operation scopes");
  }
  const base = {
    ...input,
    permittedSourceIds: [...new Set(input.permittedSourceIds)].sort(),
    permittedOperations: [...new Set(input.permittedOperations)].sort(),
    revokedAt: null,
    state: "active" as const,
    trainingUseAllowed: false as const,
    secondaryUseAllowed: false as const
  };
  return { ...base, grantHash: createAuditHash({ type: "patient-data-grant", base }) };
}

export function revokePatientDataGrant(
  grant: PatientDataGrant,
  input: { receiptId: string; revokedAt: string; reason: string }
): { grant: PatientDataGrant; receipt: RevocationReceipt } {
  if (!validIso(input.revokedAt) || Date.parse(input.revokedAt) < Date.parse(grant.issuedAt)) {
    throw new Error("Patient data grant revocation timestamp is invalid");
  }
  if (!input.reason.trim()) throw new Error("Patient data grant revocation requires a reason");
  const grantBase = { ...grant, revokedAt: input.revokedAt, state: "revoked" as const };
  delete (grantBase as Partial<PatientDataGrant>).grantHash;
  const revokedGrant = {
    ...grantBase,
    grantHash: createAuditHash({ type: "patient-data-grant", base: grantBase })
  };
  const receiptBase = {
    receiptId: input.receiptId,
    tenantId: grant.tenantId,
    grantId: grant.grantId,
    revokedAt: input.revokedAt,
    reason: input.reason.trim(),
    futureConnectorAccessAllowed: false as const,
    rawPayloadDeletedFromLogs: true as const
  };
  return {
    grant: revokedGrant,
    receipt: {
      ...receiptBase,
      receiptHash: createAuditHash({ type: "patient-data-revocation-receipt", base: receiptBase })
    }
  };
}

export function authorizePatientDataConnection(input: {
  receiptId: string;
  grant: PatientDataGrant;
  tenantId: string;
  connectorId: string;
  operation: ConnectionReceipt["operation"];
  sourceIds: string[];
  evaluatedAt: string;
}): ConnectionReceipt {
  const mappedOperation = input.operation === "connected" ? "read" : input.operation;
  const allowed =
    input.grant.state === "active" &&
    input.grant.revokedAt === null &&
    input.grant.tenantId === input.tenantId &&
    input.grant.connectorId === input.connectorId &&
    Date.parse(input.grant.expiresAt) > Date.parse(input.evaluatedAt) &&
    input.grant.permittedOperations.includes(mappedOperation) &&
    input.sourceIds.every((sourceId) => input.grant.permittedSourceIds.includes(sourceId));
  if (!allowed) throw new Error("Patient data connection is not authorized by an active purpose-bound grant");
  const base = {
    receiptId: input.receiptId,
    tenantId: input.tenantId,
    grantId: input.grant.grantId,
    connectorId: input.connectorId,
    operation: input.operation,
    sourceIds: [...new Set(input.sourceIds)].sort(),
    occurredAt: input.evaluatedAt,
    futureAccessAllowed: true,
    rawPayloadLogged: false as const
  };
  return { ...base, receiptHash: createAuditHash({ type: "patient-data-connection-receipt", base }) };
}

export function buildLongitudinalRecordManifest(
  input: Omit<LongitudinalRecordManifest, "trainingUseAllowed" | "secondaryUseAllowed" | "clinicalDecisionAuthority" | "manifestHash">
): LongitudinalRecordManifest {
  requireHash(input.subjectReferenceHash, "subject reference");
  input.entries.forEach((entry) => {
    requireHash(entry.originalValueDigest, "original value");
    requireHash(entry.provenanceHash, "entry provenance");
    if (!validIso(entry.sourceTimestamp)) throw new Error("Longitudinal entry timestamp is invalid");
  });
  const coverageBase = { ...input.sourceCoverage };
  delete (coverageBase as Partial<SourceCoverageManifest>).manifestHash;
  const sourceCoverage = {
    ...coverageBase,
    manifestHash: createAuditHash({ type: "source-coverage-manifest", base: coverageBase })
  };
  const base = {
    ...input,
    entries: [...input.entries].sort((left, right) => left.sourceTimestamp.localeCompare(right.sourceTimestamp)),
    sourceCoverage,
    trainingUseAllowed: false as const,
    secondaryUseAllowed: false as const,
    clinicalDecisionAuthority: false as const
  };
  return { ...base, manifestHash: createAuditHash({ type: "longitudinal-record-manifest", base }) };
}

export function getPatientRecordsSummary() {
  return {
    version: scrimedP32PatientRecordsVersion,
    ambientMode: "synthetic-draft-only",
    rawAudioDefault: "not-retained",
    clinicianSignoffRequired: true,
    patientGrants: "granular-purpose-bound-revocable",
    trainingUseAllowed: false,
    ehrWritebackAllowed: false,
    clinicalDecisionAuthority: false,
    boundary: scrimedP32PatientRecordsBoundary
  } as const;
}
