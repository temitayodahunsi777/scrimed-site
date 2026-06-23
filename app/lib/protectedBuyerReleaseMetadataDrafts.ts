import {
  protectedDistributionLockboxAttestation
} from "./protectedDistributionLockbox";
import {
  protectedEvidenceRoomAccessLogReconciliation
} from "./protectedEvidenceRoomAccessLogReconciliation";
import {
  protectedEvidenceRoomRecipientAttestation
} from "./protectedEvidenceRoomRecipientAttestations";
import {
  protectedExternalApprovalEvidenceAttestation
} from "./protectedExternalApprovalEvidence";
import { protectedMetricRollupDataBoundary } from "./protectedMetricRollups";
import {
  protectedNamedReviewerSignoffAttestation
} from "./protectedNamedReviewerSignoffs";
import {
  protectedReleaseAuthorityAttestationAttestation
} from "./protectedReleaseAuthorityAttestations";
import {
  protectedReleaseDecisionAttestation
} from "./protectedReleaseDecisionWorkflow";
import type {
  ProtectedBuyerReleaseGateMetadataTemplateField,
  ProtectedBuyerReleaseGateMissingItem,
  ProtectedBuyerReleaseGateReconciliation,
  ProtectedBuyerReleaseGateReconciliationItem
} from "./protectedBuyerReleaseGateReconciliation";
import type { PilotWorkspaceRecord } from "./protectedPilotWorkspace";

export type ProtectedBuyerReleaseMetadataDraftField = {
  key: string;
  value: string | number | boolean | string[];
  storageBoundary: "draft-value-only-no-artifact";
};

export type ProtectedBuyerReleaseMetadataDraft = {
  draftId: string;
  gateId: string;
  gateLabel: string;
  missingItemId: string;
  missingItemLabel: string;
  status: "draft-only-not-recorded";
  targetProtectedRoute: string;
  packetRoute: string;
  submissionMethod: "human-reviewed-protected-post-only";
  humanApprovalRequired: true;
  canAutoSubmit: false;
  blockedUntil: "qualified-human-review-and-external-artifact-retention";
  recommendedPayload: Record<string, string | number | boolean | string[]>;
  payloadFields: ProtectedBuyerReleaseMetadataDraftField[];
  sourceTemplate: ProtectedBuyerReleaseGateMetadataTemplateField[];
  operatorSteps: string[];
  blockedData: string[];
  boundary: string;
};

export type ProtectedBuyerReleaseMetadataDraftSet = {
  service: "scrimed-protected-buyer-release-metadata-drafts";
  status: "metadata-drafts-action-required" | "metadata-drafts-ready-for-qualified-human-review";
  proofStackStatus: "aal2-protected-metadata-drafts-no-release-approval";
  workspace: {
    name: string;
    slug: string;
    status: string;
  };
  draftCount: number;
  blockedGateCount: number;
  missingItemCount: number;
  humanApprovalRequired: true;
  canAutoSubmit: false;
  operatorDecision: "draft-only-do-not-share" | "drafts-ready-for-qualified-human-review";
  nextAction: string;
  drafts: ProtectedBuyerReleaseMetadataDraft[];
  boundary: string;
  updated: "2026-06-23";
};

export const protectedBuyerReleaseMetadataDraftsBoundary =
  "Protected Buyer Release Metadata Drafts prepare no-PHI draft-only payload guidance for missing buyer release-control gates. They do not write records, submit approvals, store approval artifacts, store recipient lists, store raw logs, store PHI, store secrets, authorize external sharing, certify security or compliance, guarantee reimbursement, authorize production connectors, or permit live clinical execution.";

const operatorSteps = [
  "Review every draft value before use.",
  "Replace placeholder labels with no-PHI external reference metadata only.",
  "Confirm no PHI, secrets, signed artifacts, raw logs, recipient identifiers, or source documents are entered.",
  "Submit through the target protected route only after qualified human approval.",
  "Download the related packet after recording to preserve the audit trail."
];

function isoDaysFrom(baseIso: string, days: number) {
  const date = new Date(baseIso);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

function safeDraftId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9:-]+/g, "-").replace(/^-|-$/g, "");
}

function externalLocator(
  workspace: PilotWorkspaceRecord,
  gate: ProtectedBuyerReleaseGateReconciliationItem,
  missingItem: ProtectedBuyerReleaseGateMissingItem
) {
  return `external-system:${workspace.slug}:${gate.gateId}:${missingItem.id}`;
}

function draftReviewNote(
  gate: ProtectedBuyerReleaseGateReconciliationItem,
  missingItem: ProtectedBuyerReleaseGateMissingItem
) {
  return `Draft only for ${gate.label} and ${missingItem.label}. Replace placeholders after qualified human review.`;
}

function defaultDraftPayload({
  generatedAt,
  gate,
  missingItem,
  workspace
}: {
  generatedAt: string;
  gate: ProtectedBuyerReleaseGateReconciliationItem;
  missingItem: ProtectedBuyerReleaseGateMissingItem;
  workspace: PilotWorkspaceRecord;
}): Record<string, string | number | boolean | string[]> {
  const locator = externalLocator(workspace, gate, missingItem);
  const note = draftReviewNote(gate, missingItem);

  if (gate.gateId === "external-approval-evidence") {
    return {
      domainId: missingItem.id,
      externalReferenceLabel: `${missingItem.label} metadata reference`,
      externalSystem: "external-secure-channel",
      referenceLocator: locator,
      referenceOwner: `${missingItem.label} owner role`,
      evidenceRetainedExternally: true,
      attestation: protectedExternalApprovalEvidenceAttestation,
      dataBoundary: protectedMetricRollupDataBoundary,
      reviewNote: note
    };
  }

  if (gate.gateId === "release-decision") {
    return {
      releaseAudience: "buyer-diligence",
      claimCategory: "governance",
      claimVersion: safeDraftId(`draft-${workspace.slug}-${missingItem.id}`).slice(0, 40),
      claimText:
        "SCRIMED has retained protected no-PHI metadata evidence for qualified human review. Draft only. No external authority is granted.",
      distributionChannel: "protected-buyer-diligence-review",
      externalApprovalEvidenceRecordIds: [],
      attestation: protectedReleaseDecisionAttestation,
      dataBoundary: protectedMetricRollupDataBoundary,
      reviewNote: note
    };
  }

  if (gate.gateId === "named-reviewer-signoffs") {
    return {
      reviewerRole: missingItem.id,
      reviewerDisplayName: `${missingItem.label} reviewer`,
      reviewerOrganization: "external-system-of-record",
      signoffReferenceLabel: `${missingItem.label} metadata signoff reference`,
      signoffReferenceLocator: locator,
      artifactScope: "buyer-release-control-metadata-only",
      approvedClaimVersion: safeDraftId(`draft-${workspace.slug}-claim-version`).slice(0, 40),
      distributionScope: "qualified-human-review-only",
      expiresAt: isoDaysFrom(generatedAt, 30),
      externalSignoffRetained: true,
      attestation: protectedNamedReviewerSignoffAttestation,
      dataBoundary: protectedMetricRollupDataBoundary,
      reviewNote: note
    };
  }

  if (gate.gateId === "distribution-lockbox") {
    return {
      signoffRecordIds: [],
      distributionAudience: "buyer-diligence-room",
      distributionChannelControl: "external-data-room",
      manifestVersion: safeDraftId(`draft-${workspace.slug}-manifest`).slice(0, 40),
      manifestTitle: "SCRIMED buyer release-control metadata manifest",
      artifactManifestLabel: `${missingItem.label} disabled lockbox manifest`,
      artifactManifestLocator: locator,
      customerPermissionReference: "external-customer-permission-reference-required",
      counselReviewReference: "external-counsel-review-reference-required",
      distributionWindowStart: generatedAt,
      distributionWindowEnd: isoDaysFrom(generatedAt, 14),
      recipientScope: "qualified-reviewers-only-no-recipient-list-stored",
      revocationPlan: "revoke external room access through system-of-record before sharing changes",
      externalApprovalsRetained: true,
      distributionDisabled: true,
      attestation: protectedDistributionLockboxAttestation,
      dataBoundary: protectedMetricRollupDataBoundary,
      reviewNote: note
    };
  }

  if (gate.gateId === "release-authority-attestations") {
    return {
      lockboxRecordIds: [],
      authorityDomain: missingItem.id,
      distributionAudience: "buyer-diligence-room",
      releaseAuthorityReferenceLabel: `${missingItem.label} release authority metadata reference`,
      releaseAuthorityReferenceLocator: locator,
      authorityOwnerLabel: `${missingItem.label} owner`,
      attestedManifestVersion: safeDraftId(`draft-${workspace.slug}-manifest`).slice(0, 40),
      authorityWindowStart: generatedAt,
      authorityWindowEnd: isoDaysFrom(generatedAt, 14),
      releaseScope: "qualified-human-review-only-not-release-approval",
      revocationTrigger: "approval-expiry-or-scope-change",
      externalAuthorityRetained: true,
      releaseDisabled: true,
      attestation: protectedReleaseAuthorityAttestationAttestation,
      dataBoundary: protectedMetricRollupDataBoundary,
      reviewNote: note
    };
  }

  if (gate.gateId === "recipient-attestations") {
    return {
      releaseAuthorityAttestationRecordIds: [],
      distributionAudience: "buyer-diligence-room",
      recipientSegment: "named-buyer-reviewers",
      recipientScopeLabel: "qualified-reviewers-only-no-recipient-identifiers",
      evidenceRoomReferenceLabel: `${missingItem.label} evidence room reference`,
      evidenceRoomReferenceLocator: locator,
      packetReferenceLabel: "protected-buyer-release-control-chain-packet",
      packetReferenceLocator: `external-system:${workspace.slug}:buyer-release-control-chain`,
      accessWindowStart: generatedAt,
      accessWindowEnd: isoDaysFrom(generatedAt, 7),
      revocationState: "revocation-ready",
      revocationTrigger: "window-expiry-or-approval-withdrawal",
      externalRecipientAuthorityRetained: true,
      exportDisabled: true,
      attestation: protectedEvidenceRoomRecipientAttestation,
      dataBoundary: protectedMetricRollupDataBoundary,
      reviewNote: note
    };
  }

  if (gate.gateId === "access-log-reconciliation") {
    return {
      recipientAttestationRecordIds: [],
      distributionAudience: "buyer-diligence-room",
      reconciliationScope: "pre-release-access-log-review",
      externalLogSystemLabel: "external-evidence-room-audit-log",
      accessLogReferenceLabel: `${missingItem.label} access log metadata reference`,
      accessLogReferenceLocator: locator,
      reconciliationWindowStart: generatedAt,
      reconciliationWindowEnd: isoDaysFrom(generatedAt, 7),
      observedAccessEventCount: 0,
      expectedRecipientSegmentCount: 1,
      anomalyState: "none-observed",
      revocationExerciseState: "ready",
      anomalyEscalationPath: "escalate-to-security-owner-before-release",
      externalLogAuthorityRetained: true,
      exportDisabled: true,
      attestation: protectedEvidenceRoomAccessLogReconciliation,
      dataBoundary: protectedMetricRollupDataBoundary,
      reviewNote: note
    };
  }

  return {
    gateId: gate.gateId,
    missingItemId: missingItem.id,
    externalReferenceLabel: `${missingItem.label} metadata reference`,
    referenceLocator: locator,
    attestation: "metadata-draft-only-no-phi",
    dataBoundary: protectedMetricRollupDataBoundary,
    reviewNote: note
  };
}

function payloadFields(payload: Record<string, string | number | boolean | string[]>) {
  return Object.entries(payload).map(([key, value]) => ({
    key,
    value,
    storageBoundary: "draft-value-only-no-artifact" as const
  }));
}

export function deriveProtectedBuyerReleaseMetadataDrafts({
  generatedAt,
  reconciliation,
  workspace
}: {
  generatedAt: string;
  reconciliation: ProtectedBuyerReleaseGateReconciliation;
  workspace: PilotWorkspaceRecord;
}): ProtectedBuyerReleaseMetadataDraftSet {
  const drafts = reconciliation.gates.flatMap((gate) =>
    gate.missingItems.map((missingItem) => {
      const recommendedPayload = defaultDraftPayload({ generatedAt, gate, missingItem, workspace });

      return {
        draftId: safeDraftId(`${gate.gateId}:${missingItem.id}:metadata-draft`),
        gateId: gate.gateId,
        gateLabel: gate.label,
        missingItemId: missingItem.id,
        missingItemLabel: missingItem.label,
        status: "draft-only-not-recorded" as const,
        targetProtectedRoute: gate.protectedRoute,
        packetRoute: gate.packetRoute,
        submissionMethod: "human-reviewed-protected-post-only" as const,
        humanApprovalRequired: true as const,
        canAutoSubmit: false as const,
        blockedUntil: "qualified-human-review-and-external-artifact-retention" as const,
        recommendedPayload,
        payloadFields: payloadFields(recommendedPayload),
        sourceTemplate: gate.safeMetadataTemplate,
        operatorSteps,
        blockedData: gate.blockedData,
        boundary: protectedBuyerReleaseMetadataDraftsBoundary
      };
    })
  );

  const ready = drafts.length === 0 && reconciliation.blockedGateCount === 0;

  return {
    service: "scrimed-protected-buyer-release-metadata-drafts",
    status: ready
      ? "metadata-drafts-ready-for-qualified-human-review"
      : "metadata-drafts-action-required",
    proofStackStatus: "aal2-protected-metadata-drafts-no-release-approval",
    workspace: {
      name: workspace.name,
      slug: workspace.slug,
      status: workspace.status
    },
    draftCount: drafts.length,
    blockedGateCount: reconciliation.blockedGateCount,
    missingItemCount: reconciliation.missingItemCount,
    humanApprovalRequired: true,
    canAutoSubmit: false,
    operatorDecision: ready
      ? "drafts-ready-for-qualified-human-review"
      : "draft-only-do-not-share",
    nextAction: ready
      ? "No missing metadata drafts remain. Pause for qualified human release review before any buyer sharing."
      : "Review each draft, replace placeholders with no-PHI external reference metadata, and record through the target protected route only after qualified human approval.",
    drafts,
    boundary: protectedBuyerReleaseMetadataDraftsBoundary,
    updated: "2026-06-23"
  };
}
