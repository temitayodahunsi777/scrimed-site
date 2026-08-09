import { createClinicalEvidenceHash } from "../clinicalEvidenceControls";
import { interoperabilityStandards } from "../interoperabilityStandards";
import type { PolicyDecision } from "./p32Contracts";

export const scrimedP32InteroperabilityControlsVersion =
  "scrimed-p32-interoperability-controls-v1-2026-07-30";

export const scrimedP32InteroperabilityBoundary =
  "SCRIMED p.32 interoperability controls preserve source data and provenance in synthetic previews. READ_ONLY and DRAFT are the default modes; document posting, structured writes, browser bypass, and production integration remain externally gated.";

export type IntegrationAccessMode =
  | "READ_ONLY"
  | "DRAFT"
  | "DOCUMENT_POST"
  | "STRUCTURED_WRITE";

export type VersionedInteroperabilityMapping = {
  mappingId: string;
  standardSlug: string;
  sourceVersion: string;
  targetVersion: string;
  profileIds: string[];
  fieldMappings: Array<{
    sourcePath: string;
    targetPath: string;
    transformationVersion: string;
  }>;
  unknownFieldPolicy: "preserve-losslessly";
  extensionPolicy: "preserve-losslessly";
  provenanceRoundTripRequired: true;
  featureFlag: string | null;
  draftStandardClaimAllowed: false;
  mappingHash: string;
};

export function buildVersionedInteroperabilityMapping(
  input: Omit<
    VersionedInteroperabilityMapping,
    | "unknownFieldPolicy"
    | "extensionPolicy"
    | "provenanceRoundTripRequired"
    | "draftStandardClaimAllowed"
    | "mappingHash"
  >
): VersionedInteroperabilityMapping {
  if (
    !input.mappingId.trim() ||
    !input.sourceVersion.trim() ||
    !input.targetVersion.trim() ||
    !input.profileIds.length ||
    !input.fieldMappings.length
  ) {
    throw new Error("Interoperability mappings require versions, profiles, and explicit fields");
  }
  if (!interoperabilityStandards.some((standard) => standard.slug === input.standardSlug)) {
    throw new Error("Interoperability mapping must reference the governed standards registry");
  }
  input.fieldMappings.forEach((mapping) => {
    if (
      !mapping.sourcePath.trim() ||
      !mapping.targetPath.trim() ||
      !mapping.transformationVersion.trim() ||
      mapping.sourcePath.includes("*") ||
      mapping.targetPath.includes("*")
    ) {
      throw new Error("Interoperability field mappings must be bounded and versioned");
    }
  });
  const payload = {
    ...input,
    profileIds: [...new Set(input.profileIds)].sort(),
    fieldMappings: [...input.fieldMappings].sort((left, right) =>
      `${left.sourcePath}:${left.targetPath}`.localeCompare(
        `${right.sourcePath}:${right.targetPath}`
      )
    ),
    unknownFieldPolicy: "preserve-losslessly" as const,
    extensionPolicy: "preserve-losslessly" as const,
    provenanceRoundTripRequired: true as const,
    draftStandardClaimAllowed: false as const
  };
  return {
    ...payload,
    mappingHash: createClinicalEvidenceHash({
      type: "interoperability-mapping",
      payload
    })
  };
}

export type InteroperabilitySourceEnvelope = {
  sourceId: string;
  sourceVersion: string;
  sourceFingerprint: string;
  knownFields: Record<string, unknown>;
  unknownFields: Record<string, unknown>;
  extensions: Record<string, unknown>;
  provenance: Array<{
    sourcePath: string;
    sourceTimestamp: string;
    transformationVersion: string;
  }>;
};

export type InteroperabilityRoundTripResult = {
  mappingHash: string;
  sourceFingerprint: string;
  unknownFieldsPreserved: boolean;
  extensionsPreserved: boolean;
  provenancePreserved: boolean;
  lossless: boolean;
  normalized: InteroperabilitySourceEnvelope;
  resultHash: string;
};

export function verifyInteroperabilityRoundTrip(input: {
  mapping: VersionedInteroperabilityMapping;
  source: InteroperabilitySourceEnvelope;
  normalized: InteroperabilitySourceEnvelope;
}): InteroperabilityRoundTripResult {
  const stable = (value: unknown) => JSON.stringify(value, Object.keys(value as object).sort());
  const unknownFieldsPreserved =
    stable(input.source.unknownFields) === stable(input.normalized.unknownFields);
  const extensionsPreserved =
    stable(input.source.extensions) === stable(input.normalized.extensions);
  const provenancePreserved =
    input.source.provenance.length === input.normalized.provenance.length &&
    input.source.provenance.every((entry) =>
      input.normalized.provenance.some(
        (candidate) =>
          candidate.sourcePath === entry.sourcePath &&
          candidate.sourceTimestamp === entry.sourceTimestamp &&
          candidate.transformationVersion === entry.transformationVersion
      )
    );
  const payload = {
    mappingHash: input.mapping.mappingHash,
    sourceFingerprint: input.source.sourceFingerprint,
    unknownFieldsPreserved,
    extensionsPreserved,
    provenancePreserved,
    lossless:
      unknownFieldsPreserved && extensionsPreserved && provenancePreserved,
    normalized: input.normalized
  };
  return {
    ...payload,
    resultHash: createClinicalEvidenceHash({
      type: "interoperability-round-trip",
      payload
    })
  };
}

export type MigrationRunbook = {
  runbookId: string;
  migrationFingerprint: string;
  priorSchemaFingerprint: string;
  forwardSteps: string[];
  recoveryStrategy: "rollback" | "snapshot-restore" | "forward-recovery";
  recoverySteps: string[];
  reconciliationChecks: string[];
  tenantIsolationChecks: string[];
  phiCopyAccountingRequired: true;
  disposableDatabaseOnly: true;
  productionExecutionAuthorized: false;
  runbookHash: string;
};

export function buildMigrationRunbook(
  input: Omit<
    MigrationRunbook,
    | "phiCopyAccountingRequired"
    | "disposableDatabaseOnly"
    | "productionExecutionAuthorized"
    | "runbookHash"
  >
): MigrationRunbook {
  if (
    !input.runbookId.trim() ||
    !input.migrationFingerprint.trim() ||
    !input.priorSchemaFingerprint.trim() ||
    !input.forwardSteps.length ||
    !input.recoverySteps.length ||
    !input.reconciliationChecks.length ||
    !input.tenantIsolationChecks.length
  ) {
    throw new Error("Migration runbooks require forward, recovery, reconciliation, and isolation evidence");
  }
  const payload = {
    ...input,
    forwardSteps: [...new Set(input.forwardSteps)],
    recoverySteps: [...new Set(input.recoverySteps)],
    reconciliationChecks: [...new Set(input.reconciliationChecks)].sort(),
    tenantIsolationChecks: [...new Set(input.tenantIsolationChecks)].sort(),
    phiCopyAccountingRequired: true as const,
    disposableDatabaseOnly: true as const,
    productionExecutionAuthorized: false as const
  };
  return {
    ...payload,
    runbookHash: createClinicalEvidenceHash({ type: "migration-runbook", payload })
  };
}

export type ReconciliationReport = {
  reportId: string;
  integrationChangeSetHash: string;
  sourceRecordCount: number;
  targetRecordCount: number;
  unknownFieldLossCount: number;
  provenanceMismatchCount: number;
  duplicateCount: number;
  tenantIsolationPassed: boolean;
  invariantsPassed: boolean;
  decision: PolicyDecision;
  reasonCodes: string[];
  reportHash: string;
};

export function buildReconciliationReport(
  input: Omit<ReconciliationReport, "decision" | "reasonCodes" | "reportHash">
): ReconciliationReport {
  const counts = [
    input.sourceRecordCount,
    input.targetRecordCount,
    input.unknownFieldLossCount,
    input.provenanceMismatchCount,
    input.duplicateCount
  ];
  if (counts.some((count) => !Number.isInteger(count) || count < 0)) {
    throw new Error("Reconciliation counts must be nonnegative integers");
  }
  const reasonCodes: string[] = [];
  if (input.sourceRecordCount !== input.targetRecordCount) {
    reasonCodes.push("RECORD_COUNT_MISMATCH");
  }
  if (input.unknownFieldLossCount) reasonCodes.push("UNKNOWN_FIELDS_LOST");
  if (input.provenanceMismatchCount) reasonCodes.push("PROVENANCE_MISMATCH");
  if (input.duplicateCount) reasonCodes.push("DUPLICATE_RECORDS_DETECTED");
  if (!input.tenantIsolationPassed) reasonCodes.push("TENANT_ISOLATION_FAILED");
  if (!input.invariantsPassed) reasonCodes.push("SCHEMA_INVARIANTS_FAILED");
  const payload = {
    ...input,
    decision: reasonCodes.length ? ("BLOCK" as const) : ("ALLOW" as const),
    reasonCodes: reasonCodes.length ? reasonCodes.sort() : ["RECONCILIATION_PASSED"]
  };
  return {
    ...payload,
    reportHash: createClinicalEvidenceHash({
      type: "reconciliation-report",
      payload
    })
  };
}

export type IntegrationChangeSet = {
  changeSetId: string;
  tenantId: string;
  mappingHash: string;
  requestedAccessMode: IntegrationAccessMode;
  sourceSystemId: string;
  targetSystemId: string;
  syntheticFixtureDigests: string[];
  migrationRunbookHash: string;
  reconciliationReportHash: string;
  browserAutomationRequested: boolean;
  browserControlProtocolsRequested: string[];
  externalApprovals: string[];
  decision: PolicyDecision;
  effectiveAccessMode: "READ_ONLY" | "DRAFT";
  productionReachable: false;
  reasonCodes: string[];
  changeSetHash: string;
};

export function evaluateIntegrationChangeSet(input: {
  changeSetId: string;
  tenantId: string;
  mapping: VersionedInteroperabilityMapping;
  requestedAccessMode: IntegrationAccessMode;
  sourceSystemId: string;
  targetSystemId: string;
  syntheticFixtureDigests: string[];
  migrationRunbook: MigrationRunbook;
  reconciliationReport: ReconciliationReport;
  browserAutomationRequested: boolean;
  browserControlProtocolsRequested: string[];
  externalApprovals: string[];
}): IntegrationChangeSet {
  const reasonCodes: string[] = [];
  if (!input.syntheticFixtureDigests.length) {
    reasonCodes.push("SYNTHETIC_INTEGRATION_FIXTURES_REQUIRED");
  }
  if (input.reconciliationReport.decision !== "ALLOW") {
    reasonCodes.push("RECONCILIATION_FAILED");
  }
  if (
    input.requestedAccessMode === "DOCUMENT_POST" ||
    input.requestedAccessMode === "STRUCTURED_WRITE"
  ) {
    reasonCodes.push("CONSEQUENTIAL_INTEGRATION_MODE_EXTERNALLY_GATED");
  }
  if (
    input.browserAutomationRequested ||
    input.browserControlProtocolsRequested.some((protocol) =>
      ["cdp", "webdriver", "browser-extension", "unrestricted-websocket"].includes(
        protocol.toLowerCase()
      )
    )
  ) {
    reasonCodes.push("BROWSER_AUTOMATION_AUTHORIZATION_BYPASS_DENIED");
  }
  const hardBlock = reasonCodes.some((reason) =>
    [
      "RECONCILIATION_FAILED",
      "CONSEQUENTIAL_INTEGRATION_MODE_EXTERNALLY_GATED",
      "BROWSER_AUTOMATION_AUTHORIZATION_BYPASS_DENIED"
    ].includes(reason)
  );
  const decision: PolicyDecision = hardBlock
    ? "BLOCK"
    : reasonCodes.length
      ? "REQUIRE_HUMAN"
      : "ALLOW";
  const payload = {
    changeSetId: input.changeSetId,
    tenantId: input.tenantId,
    mappingHash: input.mapping.mappingHash,
    requestedAccessMode: input.requestedAccessMode,
    sourceSystemId: input.sourceSystemId,
    targetSystemId: input.targetSystemId,
    syntheticFixtureDigests: [...new Set(input.syntheticFixtureDigests)].sort(),
    migrationRunbookHash: input.migrationRunbook.runbookHash,
    reconciliationReportHash: input.reconciliationReport.reportHash,
    browserAutomationRequested: input.browserAutomationRequested,
    browserControlProtocolsRequested: [
      ...new Set(input.browserControlProtocolsRequested)
    ].sort(),
    externalApprovals: [...new Set(input.externalApprovals)].sort(),
    decision,
    effectiveAccessMode:
      input.requestedAccessMode === "READ_ONLY"
        ? ("READ_ONLY" as const)
        : ("DRAFT" as const),
    productionReachable: false as const,
    reasonCodes: reasonCodes.length
      ? [...new Set(reasonCodes)].sort()
      : ["SYNTHETIC_INTEGRATION_PREVIEW_ALLOWED"]
  };
  return {
    ...payload,
    changeSetHash: createClinicalEvidenceHash({
      type: "integration-change-set",
      payload
    })
  };
}

export type ApplicationLifecycleAssessment = {
  assessmentId: string;
  applicationId: string;
  disposition:
    | "retain"
    | "consolidate"
    | "archive"
    | "replace"
    | "retire";
  exportEvidenceDigest: string | null;
  retentionEvidenceDigest: string | null;
  recoveryEvidenceDigest: string | null;
  rollbackEvidenceDigest: string | null;
  replacementValidationDigest: string | null;
  retirementAuthorized: boolean;
  decision: PolicyDecision;
  reasonCodes: string[];
  assessmentHash: string;
};

export function evaluateApplicationLifecycle(
  input: Omit<
    ApplicationLifecycleAssessment,
    "retirementAuthorized" | "decision" | "reasonCodes" | "assessmentHash"
  >
): ApplicationLifecycleAssessment {
  const evidence = [
    input.exportEvidenceDigest,
    input.retentionEvidenceDigest,
    input.recoveryEvidenceDigest,
    input.rollbackEvidenceDigest,
    input.replacementValidationDigest
  ];
  const reasonCodes: string[] = [];
  if (
    input.disposition === "retire" &&
    evidence.some((reference) => reference === null)
  ) {
    reasonCodes.push("RETIREMENT_EVIDENCE_INCOMPLETE");
  }
  const payload = {
    ...input,
    retirementAuthorized:
      input.disposition !== "retire" || reasonCodes.length === 0,
    decision: reasonCodes.length ? ("BLOCK" as const) : ("ALLOW" as const),
    reasonCodes: reasonCodes.length
      ? reasonCodes
      : ["APPLICATION_LIFECYCLE_EVIDENCE_COMPLETE"]
  };
  return {
    ...payload,
    assessmentHash: createClinicalEvidenceHash({
      type: "application-lifecycle-assessment",
      payload
    })
  };
}

export function getP32InteroperabilityControlsSummary() {
  return {
    version: scrimedP32InteroperabilityControlsVersion,
    defaultAccessMode: "READ_ONLY",
    supportedPreviewModes: ["READ_ONLY", "DRAFT"],
    disabledModes: ["DOCUMENT_POST", "STRUCTURED_WRITE"],
    unknownFieldsPreserved: true,
    provenanceRoundTripRequired: true,
    browserAuthorizationBypassAllowed: false,
    productionReachable: false,
    boundary: scrimedP32InteroperabilityBoundary
  } as const;
}
