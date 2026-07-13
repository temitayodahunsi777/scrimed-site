import {
  buildBoundaryReleaseEvidenceWorkQueue,
  type BoundaryReleaseEvidenceWorkItem
} from "./boundaryReleaseApprovalMatrix";
import {
  getProtectedExternalApprovalEvidenceDomain,
  protectedExternalApprovalEvidenceAttestation,
  protectedExternalApprovalEvidenceDataBoundary,
  type ProtectedExternalApprovalEvidenceDomainId,
  type ProtectedExternalApprovalEvidenceInput,
  type ProtectedExternalApprovalEvidenceRecord,
  type ProtectedExternalApprovalEvidenceSystem
} from "./protectedExternalApprovalEvidence";
import type { PilotWorkspaceRecord } from "./protectedPilotWorkspace";

export const boundaryReleaseEvidenceIntakeStatus =
  "protected-boundary-release-evidence-intake-aal2-metadata-only";
export const boundaryReleaseEvidenceIntakePacketProofStackStatus =
  "aal2-audited-boundary-release-evidence-intake-packets-no-phi";
export const boundaryReleaseEvidenceIntakeAttestation =
  "boundary-release-evidence-intake-no-phi";
export const boundaryReleaseEvidenceIntakeStorageAuthority =
  "external-artifact-reference-only-no-raw-evidence-storage";
export const boundaryReleaseEvidenceIntakeReleaseAuthority =
  "not-authorized-boundary-release";
export const boundaryReleaseEvidenceIntakeBoundary =
  "Protected Boundary Release Evidence Intake accepts only tenant-scoped, AAL2-authenticated metadata references to externally retained approval evidence. It does not store PHI, patient identifiers, payer member data, raw clinical records, source contracts, signed BAAs/DPAs, legal opinions, credentials, bearer tokens, raw connector payloads, security reports, certification evidence, customer-confidential artifacts, or release approvals. Intake records cannot relieve preserved SCRIMED boundaries.";

export type BoundaryReleaseEvidenceIntakeHumanReviewStatus =
  | "queued"
  | "metadata-reviewed"
  | "external-review-retained";

export type BoundaryReleaseEvidenceIntakeInput = {
  workItemId: string;
  workItemHash: string;
  externalReferenceLabel: string;
  externalSystem: ProtectedExternalApprovalEvidenceSystem;
  referenceLocator: string;
  referenceOwner: string;
  evidenceRetainedExternally: true;
  rawEvidenceStoredInScrimed?: false;
  boundaryReleaseRequested?: false;
  clinicalAuthorityRequested?: false;
  humanReviewStatus: BoundaryReleaseEvidenceIntakeHumanReviewStatus;
  attestation: typeof boundaryReleaseEvidenceIntakeAttestation;
  reviewNote: string;
};

export type BoundaryReleaseEvidenceIntakeRecord = {
  workItem: BoundaryReleaseEvidenceWorkItem;
  externalApprovalDomainId: ProtectedExternalApprovalEvidenceDomainId;
  externalReferenceLabel: string;
  externalSystem: ProtectedExternalApprovalEvidenceSystem;
  referenceLocator: string;
  referenceOwner: string;
  evidenceRetainedExternally: true;
  rawEvidenceStoredInScrimed: false;
  boundaryReleaseRequested: false;
  clinicalAuthorityRequested: false;
  humanReviewStatus: BoundaryReleaseEvidenceIntakeHumanReviewStatus;
  storageAuthority: typeof boundaryReleaseEvidenceIntakeStorageAuthority;
  releaseAuthority: typeof boundaryReleaseEvidenceIntakeReleaseAuthority;
  attestation: typeof boundaryReleaseEvidenceIntakeAttestation;
  dataBoundary: typeof protectedExternalApprovalEvidenceDataBoundary;
  reviewNote: string;
};

export type BoundaryReleaseEvidenceIntakeQueueItem = BoundaryReleaseEvidenceWorkItem & {
  externalApprovalDomainId: ProtectedExternalApprovalEvidenceDomainId;
  acceptableExternalSystems: ProtectedExternalApprovalEvidenceSystem[];
  referenceLabelPrefix: string;
  linkedReferenceCount: number;
  latestReferenceId: string | null;
  latestReferenceAt: string | null;
  intakeReady: boolean;
  rawEvidenceAccepted: false;
  storageAuthority: typeof boundaryReleaseEvidenceIntakeStorageAuthority;
  releaseAuthority: typeof boundaryReleaseEvidenceIntakeReleaseAuthority;
};

const safeTextPattern = /^[A-Za-z0-9][A-Za-z0-9 ._:/#-]*$/;
const allowedPayloadKeys = new Set([
  "workItemId",
  "workItemHash",
  "externalReferenceLabel",
  "externalSystem",
  "referenceLocator",
  "referenceOwner",
  "evidenceRetainedExternally",
  "rawEvidenceStoredInScrimed",
  "boundaryReleaseRequested",
  "clinicalAuthorityRequested",
  "humanReviewStatus",
  "attestation",
  "reviewNote"
]);

const forbiddenPayloadKeys = new Set([
  "rawEvidence",
  "evidenceText",
  "evidenceBody",
  "artifactBody",
  "artifactContent",
  "file",
  "document",
  "contract",
  "token",
  "secret",
  "password",
  "credential",
  "patient",
  "patientId",
  "mrn",
  "memberId",
  "payerMemberId",
  "connectorPayload",
  "clinicalRecord",
  "legalOpinion",
  "signedBaa",
  "signedDpa"
]);

const forbiddenReferencePatterns = [
  /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/,
  /(^|[^A-Za-z0-9])sk-[A-Za-z0-9_-]{12,}/i,
  /(^|[^A-Za-z0-9])sbp_[A-Za-z0-9_-]{12,}/i,
  /bearer\s+[A-Za-z0-9._-]+/i,
  /token/i,
  /secret/i,
  /password/i,
  /api[ _-]?key/i,
  /access[ _-]?key/i,
  /https?:\/\/\S*[?=]\S*/i,
  /patient[ _-]?(id|identifier|mrn)/i,
  /member[ _-]?(id|identifier)/i,
  /medical record/i,
  /protected health information/i,
  /payer member/i,
  /diagnosis code/i,
  /social security/i,
  /source contract/i,
  /signed[ _-]?(baa|dpa|contract|agreement)/i,
  /legal opinion/i,
  /audited financial/i,
  /investment recommendation/i,
  /securities offering/i,
  /valuation guarantee/i,
  /revenue guarantee/i,
  /reimbursement guarantee/i,
  /advertising substantiation/i,
  /clinical validation/i,
  /compliance certification/i,
  /raw connector/i
];

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function safeShortText(value: unknown, maxLength: number) {
  return typeof value === "string" && value.trim().length <= maxLength ? value.trim() : "";
}

function isSafeReferenceText(value: string, maxLength: number) {
  return value.length >= 3 && value.length <= maxLength && safeTextPattern.test(value);
}

function containsForbiddenContent(...values: string[]) {
  const combined = values.join(" ");
  return forbiddenReferencePatterns.some((pattern) => pattern.test(combined));
}

function workItemToken(value: string, maxLength: number) {
  const token = value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength);

  return token || "item";
}

function domainForWorkItem(item: BoundaryReleaseEvidenceWorkItem): ProtectedExternalApprovalEvidenceDomainId {
  if (item.boundaryId === "live-phi" || item.boundaryId === "ehr-writeback") {
    return "privacy-security-review";
  }

  if (
    item.boundaryId === "clinical-decision-support" ||
    item.boundaryId === "autonomous-clinical-action" ||
    item.boundaryId === "clinical-research-outcomes-learning"
  ) {
    return "clinical-governance-boundary-review";
  }

  if (item.boundaryId === "customer-go-live") {
    return "buyer-permission-review";
  }

  if (item.boundaryId === "security-certification-claims") {
    return "marketing-claims-review";
  }

  return "counsel-external-use-review";
}

export function boundaryReleaseEvidenceReferenceLabelPrefix(item: BoundaryReleaseEvidenceWorkItem) {
  return [
    "BoundaryEvidence",
    workItemToken(item.boundaryId, 30),
    workItemToken(item.sourceId, 28),
    item.workItemHash.slice(0, 12)
  ].join(" ");
}

function buildReferenceLabel(item: BoundaryReleaseEvidenceWorkItem) {
  return boundaryReleaseEvidenceReferenceLabelPrefix(item).slice(0, 120);
}

function buildExternalReviewNote(input: BoundaryReleaseEvidenceIntakeInput) {
  const note = `BoundaryEvidence ${input.humanReviewStatus} ${input.externalReferenceLabel} ${input.reviewNote}`;
  return note.slice(0, 280).trim();
}

function recordsForWorkItem(
  records: ProtectedExternalApprovalEvidenceRecord[],
  item: BoundaryReleaseEvidenceWorkItem
) {
  const prefix = boundaryReleaseEvidenceReferenceLabelPrefix(item);
  return records.filter((record) => record.externalReferenceLabel.startsWith(prefix));
}

export function buildBoundaryReleaseEvidenceIntakeQueue(
  records: ProtectedExternalApprovalEvidenceRecord[] = []
): BoundaryReleaseEvidenceIntakeQueueItem[] {
  return buildBoundaryReleaseEvidenceWorkQueue().map((item) => {
    const externalApprovalDomainId = domainForWorkItem(item);
    const domain = getProtectedExternalApprovalEvidenceDomain(externalApprovalDomainId);
    const linkedRecords = recordsForWorkItem(records, item);
    const latestReference = linkedRecords[0] ?? null;

    return {
      ...item,
      externalApprovalDomainId,
      acceptableExternalSystems: domain?.acceptableExternalSystems ?? [],
      referenceLabelPrefix: boundaryReleaseEvidenceReferenceLabelPrefix(item),
      linkedReferenceCount: linkedRecords.length,
      latestReferenceId: latestReference?.id ?? null,
      latestReferenceAt: latestReference?.recordedAt ?? null,
      intakeReady: linkedRecords.length > 0,
      rawEvidenceAccepted: false,
      storageAuthority: boundaryReleaseEvidenceIntakeStorageAuthority,
      releaseAuthority: boundaryReleaseEvidenceIntakeReleaseAuthority
    };
  });
}

export function validateBoundaryReleaseEvidenceIntakeInput(value: unknown):
  | { ok: true; intake: BoundaryReleaseEvidenceIntakeRecord; externalInput: ProtectedExternalApprovalEvidenceInput }
  | { ok: false; errors: string[] } {
  const record = asRecord(value);
  const errors: string[] = [];
  const suppliedKeys = Object.keys(record);
  const unsupportedKeys = suppliedKeys.filter((key) => !allowedPayloadKeys.has(key));
  const blockedKeys = suppliedKeys.filter((key) => forbiddenPayloadKeys.has(key));

  if (unsupportedKeys.length > 0) {
    errors.push(`Unsupported boundary evidence intake fields: ${unsupportedKeys.join(", ")}.`);
  }

  if (blockedKeys.length > 0) {
    errors.push("Boundary evidence intake does not accept raw evidence, documents, credentials, PHI, or source artifacts.");
  }

  const workItemId = safeShortText(record.workItemId, 240);
  const workItemHash = safeShortText(record.workItemHash, 64);
  const externalReferenceLabel = safeShortText(record.externalReferenceLabel, 80);
  const externalSystem = safeShortText(record.externalSystem, 60);
  const referenceLocator = safeShortText(record.referenceLocator, 160);
  const referenceOwner = safeShortText(record.referenceOwner, 80);
  const evidenceRetainedExternally = record.evidenceRetainedExternally;
  const rawEvidenceStoredInScrimed = record.rawEvidenceStoredInScrimed;
  const boundaryReleaseRequested = record.boundaryReleaseRequested;
  const clinicalAuthorityRequested = record.clinicalAuthorityRequested;
  const humanReviewStatus = safeShortText(record.humanReviewStatus, 40);
  const attestation = safeShortText(record.attestation, 90);
  const reviewNote = safeShortText(record.reviewNote, 220);
  const workItem = buildBoundaryReleaseEvidenceWorkQueue().find((item) => item.id === workItemId);

  if (!workItem) {
    errors.push("Boundary evidence intake work item must exist in the fail-closed approval matrix.");
  }

  if (workItem && workItem.workItemHash !== workItemHash) {
    errors.push("Boundary evidence intake work item hash does not match the current approval matrix.");
  }

  if (workItem?.acceptsRawEvidence !== false) {
    errors.push("Boundary evidence intake can only target metadata-only work items.");
  }

  if (!isSafeReferenceText(externalReferenceLabel, 80)) {
    errors.push("External reference label must be bounded non-secret metadata.");
  }

  if (!isSafeReferenceText(referenceLocator, 160)) {
    errors.push("Reference locator must be a short non-secret external locator.");
  }

  if (!isSafeReferenceText(referenceOwner, 80)) {
    errors.push("Reference owner must be bounded non-secret metadata.");
  }

  if (evidenceRetainedExternally !== true) {
    errors.push("Approval evidence artifacts must be retained outside SCRIMED.");
  }

  if (rawEvidenceStoredInScrimed !== undefined && rawEvidenceStoredInScrimed !== false) {
    errors.push("Boundary evidence intake cannot store raw evidence in SCRIMED.");
  }

  if (boundaryReleaseRequested !== undefined && boundaryReleaseRequested !== false) {
    errors.push("Boundary evidence intake cannot request or grant boundary release.");
  }

  if (clinicalAuthorityRequested !== undefined && clinicalAuthorityRequested !== false) {
    errors.push("Boundary evidence intake cannot request or grant clinical authority.");
  }

  if (!["queued", "metadata-reviewed", "external-review-retained"].includes(humanReviewStatus)) {
    errors.push("Human review status must remain queued, metadata-reviewed, or external-review-retained.");
  }

  if (attestation !== boundaryReleaseEvidenceIntakeAttestation) {
    errors.push("Boundary evidence intake requires the fixed no-PHI attestation.");
  }

  if (reviewNote.length > 220) {
    errors.push("Review note must stay under 220 characters.");
  }

  if (
    containsForbiddenContent(
      workItemId,
      workItemHash,
      externalReferenceLabel,
      externalSystem,
      referenceLocator,
      referenceOwner,
      humanReviewStatus,
      reviewNote
    )
  ) {
    errors.push(
      "Boundary evidence intake metadata cannot contain PHI, credentials, secrets, patient identifiers, payer member data, source contracts, signed BAAs/DPAs, legal opinions, audited financial claims, securities claims, advertising substantiation, clinical validation, reimbursement guarantees, compliance certification, or raw connector payloads."
    );
  }

  if (!workItem || errors.length > 0) {
    return { ok: false, errors };
  }

  const externalApprovalDomainId = domainForWorkItem(workItem);
  const domain = getProtectedExternalApprovalEvidenceDomain(externalApprovalDomainId);

  if (!domain?.acceptableExternalSystems.includes(externalSystem as ProtectedExternalApprovalEvidenceSystem)) {
    return {
      ok: false,
      errors: [
        "External system must be approved for the boundary evidence domain.",
        `Allowed external systems: ${(domain?.acceptableExternalSystems ?? []).join(", ")}.`
      ]
    };
  }

  const intake: BoundaryReleaseEvidenceIntakeRecord = {
    workItem,
    externalApprovalDomainId,
    externalReferenceLabel: buildReferenceLabel(workItem),
    externalSystem: externalSystem as ProtectedExternalApprovalEvidenceSystem,
    referenceLocator,
    referenceOwner,
    evidenceRetainedExternally: true,
    rawEvidenceStoredInScrimed: false,
    boundaryReleaseRequested: false,
    clinicalAuthorityRequested: false,
    humanReviewStatus: humanReviewStatus as BoundaryReleaseEvidenceIntakeHumanReviewStatus,
    storageAuthority: boundaryReleaseEvidenceIntakeStorageAuthority,
    releaseAuthority: boundaryReleaseEvidenceIntakeReleaseAuthority,
    attestation: boundaryReleaseEvidenceIntakeAttestation,
    dataBoundary: protectedExternalApprovalEvidenceDataBoundary,
    reviewNote
  };

  return {
    ok: true,
    intake,
    externalInput: {
      domainId: externalApprovalDomainId,
      externalReferenceLabel: intake.externalReferenceLabel,
      externalSystem: intake.externalSystem,
      referenceLocator,
      referenceOwner,
      evidenceRetainedExternally: true,
      attestation: protectedExternalApprovalEvidenceAttestation,
      dataBoundary: protectedExternalApprovalEvidenceDataBoundary,
      reviewNote: buildExternalReviewNote({
        workItemId,
        workItemHash,
        externalReferenceLabel,
        externalSystem: intake.externalSystem,
        referenceLocator,
        referenceOwner,
        evidenceRetainedExternally: true,
        rawEvidenceStoredInScrimed: false,
        boundaryReleaseRequested: false,
        clinicalAuthorityRequested: false,
        humanReviewStatus: intake.humanReviewStatus,
        attestation: boundaryReleaseEvidenceIntakeAttestation,
        reviewNote
      })
    }
  };
}

export function getBoundaryReleaseEvidenceIntakeSummary(records: ProtectedExternalApprovalEvidenceRecord[] = []) {
  const queue = buildBoundaryReleaseEvidenceIntakeQueue(records);

  return {
    service: "scrimed-protected-boundary-release-evidence-intake",
    status: boundaryReleaseEvidenceIntakeStatus,
    queue,
    summary: {
      workItemCount: queue.length,
      intakeReadyCount: queue.filter((item) => item.intakeReady).length,
      missingReferenceCount: queue.filter((item) => !item.intakeReady).length,
      criticalMissingReferenceCount: queue.filter((item) => item.priority === "critical" && !item.intakeReady).length,
      rawEvidenceAccepted: false,
      storageAuthority: boundaryReleaseEvidenceIntakeStorageAuthority,
      releaseAuthority: boundaryReleaseEvidenceIntakeReleaseAuthority,
      allWorkItemsRequireHumanApproval: queue.every((item) => item.requiredBeforeRelease),
      noWorkItemCanRelieveBoundary: queue.every((item) => item.releaseAuthority === boundaryReleaseEvidenceIntakeReleaseAuthority)
    },
    acceptedPayload:
      "workItemId, workItemHash, externalReferenceLabel, externalSystem, referenceLocator, referenceOwner, evidenceRetainedExternally, humanReviewStatus, attestation, reviewNote",
    rejectedPayload:
      "raw evidence, PHI, patient identifiers, payer member data, source contracts, credentials, bearer tokens, signed BAAs/DPAs, legal opinions, raw clinical records, raw connector payloads, and release approvals",
    boundary: boundaryReleaseEvidenceIntakeBoundary
  };
}

export type BoundaryReleaseEvidenceIntakeSummary = ReturnType<
  typeof getBoundaryReleaseEvidenceIntakeSummary
>;

function linesForBoundaryReleaseEvidenceQueueItem(item: BoundaryReleaseEvidenceIntakeQueueItem) {
  return [
    `### ${item.boundaryName}`,
    `- Work item ID: ${item.id}`,
    `- Boundary ID: ${item.boundaryId}`,
    `- Kind: ${item.kind}`,
    `- Source ID: ${item.sourceId}`,
    `- Evidence name: ${item.evidenceName}`,
    `- Owner: ${item.owner}`,
    `- Priority: ${item.priority}`,
    `- Status: ${item.status}`,
    `- Work item hash: ${item.workItemHash}`,
    `- External approval domain: ${item.externalApprovalDomainId}`,
    `- Acceptable external systems: ${item.acceptableExternalSystems.join(", ") || "none configured"}`,
    `- Linked reference count: ${item.linkedReferenceCount}`,
    `- Latest reference ID: ${item.latestReferenceId ?? "not recorded"}`,
    `- Latest reference at: ${item.latestReferenceAt ?? "not recorded"}`,
    `- Intake ready: ${item.intakeReady}`,
    `- Required before release: ${item.requiredBeforeRelease}`,
    `- Raw evidence accepted: ${item.rawEvidenceAccepted}`,
    `- Storage authority: ${item.storageAuthority}`,
    `- Release authority: ${item.releaseAuthority}`,
    `- Evidence storage boundary: ${item.evidenceStorageBoundary}`,
    `- Redaction rule: ${item.redactionRule}`,
    `- Missing because: ${item.missingBecause}`,
    "- Proof routes:",
    ...item.proofRoutes.map((route) => `  - ${route}`)
  ];
}

function linesForBoundaryReleaseEvidenceReference(record: ProtectedExternalApprovalEvidenceRecord) {
  return [
    `### ${record.externalReferenceLabel}`,
    `- Reference ID: ${record.id}`,
    `- Domain ID: ${record.domainId}`,
    `- Domain label: ${record.domainLabel}`,
    `- Reference status: ${record.referenceStatus}`,
    `- External system: ${record.externalSystem}`,
    `- Reference locator: ${record.referenceLocator}`,
    `- Reference owner: ${record.referenceOwner}`,
    `- Recorded at: ${record.recordedAt}`,
    `- Evidence retained externally: ${record.evidenceRetainedExternally}`,
    `- Storage authority: ${record.storageAuthority}`,
    `- Release authority: ${record.releaseAuthority}`,
    `- Clinical execution authority: ${record.clinicalExecutionAuthority}`,
    `- Data boundary: ${record.dataBoundary}`
  ];
}

export function buildBoundaryReleaseEvidenceIntakePacket({
  actorUserId,
  auditEventId,
  externalReferenceRecords,
  generatedAt,
  summary,
  unavailableSections,
  workspace
}: {
  actorUserId: string;
  auditEventId?: string | null;
  externalReferenceRecords: ProtectedExternalApprovalEvidenceRecord[];
  generatedAt: string;
  summary: BoundaryReleaseEvidenceIntakeSummary;
  unavailableSections: string[];
  workspace: PilotWorkspaceRecord;
}) {
  return [
    "# SCRIMED Protected Boundary Release Evidence Intake Packet",
    "",
    `Workspace: ${workspace.name} (${workspace.slug})`,
    `Generated: ${generatedAt}`,
    `Generated by: ${actorUserId}`,
    `Packet audit event: ${auditEventId ?? "pending"}`,
    `Proof stack: ${boundaryReleaseEvidenceIntakePacketProofStackStatus}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "## Authorities",
    `Storage authority: ${boundaryReleaseEvidenceIntakeStorageAuthority}`,
    `Release authority: ${boundaryReleaseEvidenceIntakeReleaseAuthority}`,
    "PHI authority: not-authorized-production-phi",
    "Clinical care authority: not-authorized-live-care",
    "Payer submission authority: not-authorized",
    "EHR writeback authority: not-authorized",
    "Production connector authority: not-production-connector-approved",
    "Certification authority: not-certified-readiness-only",
    "Customer go-live authority: not-authorized",
    "",
    "## Summary",
    `- Intake service status: ${summary.status}`,
    `- Work items: ${summary.summary.workItemCount}`,
    `- Intake-ready items: ${summary.summary.intakeReadyCount}`,
    `- Missing references: ${summary.summary.missingReferenceCount}`,
    `- Critical missing references: ${summary.summary.criticalMissingReferenceCount}`,
    `- Raw evidence accepted: ${summary.summary.rawEvidenceAccepted}`,
    `- All work items require human approval: ${summary.summary.allWorkItemsRequireHumanApproval}`,
    `- No work item can relieve boundary: ${summary.summary.noWorkItemCanRelieveBoundary}`,
    `- External reference records included: ${externalReferenceRecords.length}`,
    "",
    "## Accepted Payload",
    summary.acceptedPayload,
    "",
    "## Rejected Payload",
    summary.rejectedPayload,
    "",
    "## Evidence Intake Queue",
    ...summary.queue.flatMap(linesForBoundaryReleaseEvidenceQueueItem),
    "",
    "## External Reference Records",
    ...(externalReferenceRecords.length
      ? externalReferenceRecords.flatMap(linesForBoundaryReleaseEvidenceReference)
      : ["- No external reference metadata has been recorded for this workspace."]),
    "",
    "## Unavailable Sections",
    ...(unavailableSections.length
      ? unavailableSections.map((section) => `- ${section}`)
      : ["- None recorded."]),
    "",
    "## Required Next Review",
    "- Qualified reviewers must inspect the externally retained artifacts before any boundary-release decision.",
    "- This packet is metadata-only. It is not a release approval, legal opinion, signed BAA/DPA, clinical validation, security certification, customer authorization, production connector approval, or go-live approval.",
    "- Keep SCRIMED in synthetic, human-reviewed protected-pilot mode until the appropriate external approval artifacts are reviewed, retained, and approved through the documented channels.",
    "",
    "Updated: 2026-07-04"
  ].join("\n");
}
