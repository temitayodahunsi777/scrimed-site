import {
  validateProtectedDistributionLockboxInput
} from "./protectedDistributionLockbox";
import {
  validateProtectedEvidenceRoomAccessLogReconciliationInput
} from "./protectedEvidenceRoomAccessLogReconciliation";
import {
  validateProtectedEvidenceRoomRecipientAttestationInput
} from "./protectedEvidenceRoomRecipientAttestations";
import {
  validateProtectedExternalApprovalEvidenceInput
} from "./protectedExternalApprovalEvidence";
import {
  validateProtectedNamedReviewerSignoffInput
} from "./protectedNamedReviewerSignoffs";
import {
  validateProtectedReleaseAuthorityAttestationInput
} from "./protectedReleaseAuthorityAttestations";
import {
  validateProtectedReleaseDecisionInput
} from "./protectedReleaseDecisionWorkflow";
import type {
  ProtectedBuyerReleaseMetadataDraft,
  ProtectedBuyerReleaseMetadataDraftSet
} from "./protectedBuyerReleaseMetadataDrafts";
import type { PilotWorkspaceRecord } from "./protectedPilotWorkspace";

type DraftValidationResult =
  | { ok: true }
  | { ok: false; errors: string[] };

type DraftValidator = (payload: unknown) => DraftValidationResult;

export type ProtectedBuyerReleaseDraftChecklistItem = {
  draftId: string;
  gateId: string;
  gateLabel: string;
  missingItemLabel: string;
  targetProtectedRoute: string;
  packetRoute: string;
  targetWriteSchema: string;
  schemaStatus:
    | "schema-ready-human-review-required"
    | "blocked-on-prerequisite-records"
    | "blocked-on-draft-corrections"
    | "unsupported-gate";
  validatorPassed: boolean;
  canAutoSubmit: false;
  canRecordAfterHumanReview: boolean;
  humanApprovalRequired: true;
  prerequisiteErrors: string[];
  correctionErrors: string[];
  checklist: string[];
  nextAction: string;
  boundary: string;
};

export type ProtectedBuyerReleaseDraftChecklist = {
  service: "scrimed-protected-buyer-release-draft-checklist";
  status:
    | "draft-checklist-action-required"
    | "draft-checklist-ready-for-qualified-human-review";
  proofStackStatus: "aal2-protected-draft-checklist-no-release-approval";
  workspace: {
    name: string;
    slug: string;
    status: string;
  };
  draftCount: number;
  schemaReadyCount: number;
  prerequisiteBlockedCount: number;
  correctionBlockedCount: number;
  unsupportedGateCount: number;
  humanApprovalRequired: true;
  canAutoSubmit: false;
  operatorDecision:
    | "do-not-record-until-draft-checklist-clears"
    | "record-ready-after-qualified-human-review";
  nextAction: string;
  items: ProtectedBuyerReleaseDraftChecklistItem[];
  boundary: string;
  updated: "2026-06-23";
};

export const protectedBuyerReleaseDraftChecklistBoundary =
  "Protected Buyer Release Draft Checklist validates draft-only no-PHI metadata payload guidance against the target protected write-schema before a human records anything. It does not write records, submit approvals, store approval artifacts, store PHI, store secrets, store raw logs, store recipient identifiers, authorize external sharing, certify security or compliance, guarantee reimbursement, authorize production connectors, or permit live clinical execution.";

const validatorsByGate: Record<string, { label: string; validate: DraftValidator }> = {
  "external-approval-evidence": {
    label: "ProtectedExternalApprovalEvidenceInput",
    validate: validateProtectedExternalApprovalEvidenceInput
  },
  "release-decision": {
    label: "ProtectedReleaseDecisionInput",
    validate: validateProtectedReleaseDecisionInput
  },
  "named-reviewer-signoffs": {
    label: "ProtectedNamedReviewerSignoffInput",
    validate: validateProtectedNamedReviewerSignoffInput
  },
  "distribution-lockbox": {
    label: "ProtectedDistributionLockboxInput",
    validate: validateProtectedDistributionLockboxInput
  },
  "release-authority-attestations": {
    label: "ProtectedReleaseAuthorityAttestationInput",
    validate: validateProtectedReleaseAuthorityAttestationInput
  },
  "recipient-attestations": {
    label: "ProtectedEvidenceRoomRecipientAttestationInput",
    validate: validateProtectedEvidenceRoomRecipientAttestationInput
  },
  "access-log-reconciliation": {
    label: "ProtectedEvidenceRoomAccessLogReconciliationInput",
    validate: validateProtectedEvidenceRoomAccessLogReconciliationInput
  }
};

const humanChecklist = [
  "Confirm the draft is still scoped to no-PHI metadata only.",
  "Replace placeholder references with externally retained no-secret locator metadata.",
  "Confirm prerequisite protected record IDs exist before recording dependent gates.",
  "Confirm no signed artifacts, raw logs, recipient identifiers, URLs with secrets, credentials, or source documents are entered.",
  "Record through the target protected route only after qualified human approval."
];

function isPrerequisiteError(error: string) {
  return (
    /record id/i.test(error) ||
    /record ids/i.test(error) ||
    /valid protected .* id/i.test(error) ||
    /requires one to fourteen/i.test(error) ||
    /release decision id/i.test(error)
  );
}

function classifyDraft(draft: ProtectedBuyerReleaseMetadataDraft): ProtectedBuyerReleaseDraftChecklistItem {
  const validator = validatorsByGate[draft.gateId];

  if (!validator) {
    return {
      draftId: draft.draftId,
      gateId: draft.gateId,
      gateLabel: draft.gateLabel,
      missingItemLabel: draft.missingItemLabel,
      targetProtectedRoute: draft.targetProtectedRoute,
      packetRoute: draft.packetRoute,
      targetWriteSchema: "unsupported",
      schemaStatus: "unsupported-gate",
      validatorPassed: false,
      canAutoSubmit: false,
      canRecordAfterHumanReview: false,
      humanApprovalRequired: true,
      prerequisiteErrors: [],
      correctionErrors: ["No protected write-schema validator is registered for this gate."],
      checklist: humanChecklist,
      nextAction: "Keep this gate blocked until a protected validator is added.",
      boundary: protectedBuyerReleaseDraftChecklistBoundary
    };
  }

  const result = validator.validate(draft.recommendedPayload);
  const errors = result.ok ? [] : result.errors;
  const prerequisiteErrors = errors.filter(isPrerequisiteError);
  const correctionErrors = errors.filter((error) => !isPrerequisiteError(error));
  const schemaStatus = result.ok
    ? "schema-ready-human-review-required"
    : prerequisiteErrors.length > 0 && correctionErrors.length === 0
      ? "blocked-on-prerequisite-records"
      : "blocked-on-draft-corrections";

  return {
    draftId: draft.draftId,
    gateId: draft.gateId,
    gateLabel: draft.gateLabel,
    missingItemLabel: draft.missingItemLabel,
    targetProtectedRoute: draft.targetProtectedRoute,
    packetRoute: draft.packetRoute,
    targetWriteSchema: validator.label,
    schemaStatus,
    validatorPassed: result.ok,
    canAutoSubmit: false,
    canRecordAfterHumanReview: result.ok,
    humanApprovalRequired: true,
    prerequisiteErrors,
    correctionErrors,
    checklist: humanChecklist,
    nextAction: result.ok
      ? "Schema precheck passed. A qualified human must still review and record through the target protected route."
      : prerequisiteErrors.length > 0 && correctionErrors.length === 0
        ? "Record prerequisite protected metadata first, then rerun the draft checklist."
        : "Correct the draft fields listed by the protected validator before recording.",
    boundary: protectedBuyerReleaseDraftChecklistBoundary
  };
}

export function deriveProtectedBuyerReleaseDraftChecklist({
  metadataDrafts,
  workspace
}: {
  metadataDrafts: ProtectedBuyerReleaseMetadataDraftSet;
  workspace: PilotWorkspaceRecord;
}): ProtectedBuyerReleaseDraftChecklist {
  const items = metadataDrafts.drafts.map(classifyDraft);
  const schemaReadyCount = items.filter(
    (item) => item.schemaStatus === "schema-ready-human-review-required"
  ).length;
  const prerequisiteBlockedCount = items.filter(
    (item) => item.schemaStatus === "blocked-on-prerequisite-records"
  ).length;
  const correctionBlockedCount = items.filter(
    (item) => item.schemaStatus === "blocked-on-draft-corrections"
  ).length;
  const unsupportedGateCount = items.filter((item) => item.schemaStatus === "unsupported-gate").length;
  const ready = items.length > 0 && schemaReadyCount === items.length;

  return {
    service: "scrimed-protected-buyer-release-draft-checklist",
    status: ready
      ? "draft-checklist-ready-for-qualified-human-review"
      : "draft-checklist-action-required",
    proofStackStatus: "aal2-protected-draft-checklist-no-release-approval",
    workspace: {
      name: workspace.name,
      slug: workspace.slug,
      status: workspace.status
    },
    draftCount: items.length,
    schemaReadyCount,
    prerequisiteBlockedCount,
    correctionBlockedCount,
    unsupportedGateCount,
    humanApprovalRequired: true,
    canAutoSubmit: false,
    operatorDecision: ready
      ? "record-ready-after-qualified-human-review"
      : "do-not-record-until-draft-checklist-clears",
    nextAction: ready
      ? "All draft payloads pass target protected schema precheck. Stop for qualified human review before recording."
      : "Resolve prerequisite record IDs and draft corrections before any protected recording attempt.",
    items,
    boundary: protectedBuyerReleaseDraftChecklistBoundary,
    updated: "2026-06-23"
  };
}
