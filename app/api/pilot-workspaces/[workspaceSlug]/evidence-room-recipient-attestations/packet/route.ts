import { NextResponse } from "next/server";
import { deriveProtectedDistributionLockboxWorkflow } from "../../../../../lib/protectedDistributionLockbox";
import {
  buildProtectedEvidenceRoomRecipientAttestationPacket,
  deriveProtectedEvidenceRoomRecipientAttestationWorkflow,
  protectedEvidenceRoomRecipientAttestationAuthority,
  protectedEvidenceRoomRecipientBoundary,
  protectedEvidenceRoomRecipientAttestationPacketProofStackStatus,
  protectedEvidenceRoomRecipientReleaseAuthority,
  protectedEvidenceRoomRecipientStorageAuthority
} from "../../../../../lib/protectedEvidenceRoomRecipientAttestations";
import { deriveProtectedExternalApprovalEvidenceWorkflow } from "../../../../../lib/protectedExternalApprovalEvidence";
import {
  protectedFinanceAdvertisingClaimsAuthority,
  protectedFinanceExternalUseAuthority,
  deriveProtectedFinanceMethodologyWorkflow
} from "../../../../../lib/protectedFinanceMethodology";
import {
  protectedMetricRollupClinicalAuthority,
  protectedMetricRollupFinancialAuthority,
  protectedMetricRollupSecuritiesAuthority
} from "../../../../../lib/protectedMetricRollups";
import { deriveProtectedNamedReviewerSignoffWorkflow } from "../../../../../lib/protectedNamedReviewerSignoffs";
import {
  deriveProtectedReleaseAuthorityAttestationWorkflow,
  protectedReleaseAuthorityAttestationAuthority,
  protectedReleaseAuthorityAttestationStorageAuthority,
  protectedReleaseAuthorityReleaseAuthority
} from "../../../../../lib/protectedReleaseAuthorityAttestations";
import { deriveProtectedReleaseDecisionWorkflow } from "../../../../../lib/protectedReleaseDecisionWorkflow";
import {
  getAccessiblePilotWorkspace,
  getAuthenticatedGovernanceContext,
  listProtectedBoardScorecards,
  listProtectedDistributionLockboxes,
  listProtectedEvidenceRoomRecipientAttestations,
  listProtectedExternalApprovalEvidenceReferences,
  listProtectedFinanceMethodologyGates,
  listProtectedNamedReviewerSignoffs,
  listProtectedReleaseAuthorityAttestations,
  listProtectedReleaseDecisions,
  recordProtectedEvidenceRoomRecipientAttestationPacketDownload
} from "../../../../../lib/protectedPilotStore";
import {
  protectedPilotBoundary,
  protectedPilotNoStoreHeaders
} from "../../../../../lib/protectedPilotWorkspace";
import { enforceRequestRateLimit, rateLimitHeaders } from "../../../../../lib/requestRateLimit";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ workspaceSlug: string }>;
};

function statusForPacketError(message: string) {
  if (
    message.includes("role-denied") ||
    message.includes("authentication-required") ||
    message.includes("aal2-session-required") ||
    message.includes("governance-aal2-session-required") ||
    message.includes("server-authorization-required")
  ) {
    return 403;
  }

  if (message.includes("workspace")) return 404;
  if (message.includes("does not exist") || message.includes("schema cache")) return 503;

  return 502;
}

export async function GET(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "protected-evidence-room-recipient-attestation-packet-download",
    limit: 12,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Protected evidence-room recipient attestation packet downloads are temporarily rate limited."
        },
        boundary: protectedPilotBoundary
      },
      { status: 429, headers }
    );
  }

  const context = await getAuthenticatedGovernanceContext(request);

  if (!context.ok) {
    return NextResponse.json(
      { error: { code: context.code, message: context.message }, boundary: protectedPilotBoundary },
      { status: context.status, headers }
    );
  }

  const { workspaceSlug } = await params;
  const workspaceResult = await getAccessiblePilotWorkspace(context.client, workspaceSlug);

  if (workspaceResult.error || !workspaceResult.workspace) {
    return NextResponse.json(
      {
        error: {
          code: "pilot-workspace-not-found",
          message: "No tenant-isolated pilot workspace is available for this member and slug."
        },
        boundary: protectedPilotBoundary
      },
      { status: 404, headers }
    );
  }

  const workspace = workspaceResult.workspace;
  const [
    scorecardsResult,
    financeRecordsResult,
    externalRecordsResult,
    releaseDecisionRecordsResult,
    signoffRecordsResult,
    lockboxRecordsResult,
    authorityRecordsResult,
    recipientRecordsResult
  ] = await Promise.all([
    listProtectedBoardScorecards(context.client, workspace.id),
    listProtectedFinanceMethodologyGates(context.client, workspace.id),
    listProtectedExternalApprovalEvidenceReferences(context.client, workspace.id),
    listProtectedReleaseDecisions(context.client, workspace.id),
    listProtectedNamedReviewerSignoffs(context.client, workspace.id),
    listProtectedDistributionLockboxes(context.client, workspace.id),
    listProtectedReleaseAuthorityAttestations(context.client, workspace.id),
    listProtectedEvidenceRoomRecipientAttestations(context.client, workspace.id)
  ]);
  const unavailableSections = [
    scorecardsResult.error
      ? "Protected board scorecards could not be retrieved for this packet."
      : "",
    financeRecordsResult.error
      ? "Protected finance methodology gate history could not be retrieved for this packet."
      : "",
    externalRecordsResult.error
      ? "Protected external approval evidence references could not be retrieved for this packet."
      : "",
    releaseDecisionRecordsResult.error
      ? "Protected release decision history could not be retrieved for this packet."
      : "",
    signoffRecordsResult.error
      ? "Protected named reviewer sign-off history could not be retrieved for this packet."
      : "",
    lockboxRecordsResult.error
      ? "Protected distribution lockbox history could not be retrieved for this packet."
      : "",
    authorityRecordsResult.error
      ? "Protected release authority attestations could not be retrieved for this packet."
      : "",
    recipientRecordsResult.error
      ? "Protected evidence-room recipient attestations could not be retrieved for this packet."
      : ""
  ].filter(Boolean);
  const financeWorkflow = deriveProtectedFinanceMethodologyWorkflow({
    records: financeRecordsResult.error ? [] : financeRecordsResult.records,
    scorecards: scorecardsResult.error ? [] : scorecardsResult.scorecards,
    unavailableSections: unavailableSections.filter((section) => section.includes("finance"))
  });
  const externalWorkflow = deriveProtectedExternalApprovalEvidenceWorkflow({
    records: externalRecordsResult.error ? [] : externalRecordsResult.records,
    financeGateRecords: financeRecordsResult.error ? [] : financeRecordsResult.records,
    financeWorkflow,
    unavailableSections: unavailableSections.filter((section) => section.includes("external"))
  });
  const releaseWorkflow = deriveProtectedReleaseDecisionWorkflow({
    externalWorkflow,
    records: releaseDecisionRecordsResult.error ? [] : releaseDecisionRecordsResult.records,
    unavailableSections: unavailableSections.filter((section) => section.includes("release decision"))
  });
  const signoffWorkflow = deriveProtectedNamedReviewerSignoffWorkflow({
    records: signoffRecordsResult.error ? [] : signoffRecordsResult.records,
    releaseWorkflow,
    unavailableSections: unavailableSections.filter((section) => section.includes("sign-off"))
  });
  const lockboxWorkflow = deriveProtectedDistributionLockboxWorkflow({
    records: lockboxRecordsResult.error ? [] : lockboxRecordsResult.records,
    signoffWorkflow,
    unavailableSections: unavailableSections.filter((section) => section.includes("lockbox"))
  });
  const authorityWorkflow = deriveProtectedReleaseAuthorityAttestationWorkflow({
    lockboxWorkflow,
    records: authorityRecordsResult.error ? [] : authorityRecordsResult.records,
    unavailableSections: unavailableSections.filter((section) => section.includes("authority"))
  });
  const workflow = deriveProtectedEvidenceRoomRecipientAttestationWorkflow({
    records: recipientRecordsResult.error ? [] : recipientRecordsResult.records,
    releaseAuthorityWorkflow: authorityWorkflow,
    unavailableSections
  });
  const auditResult = await recordProtectedEvidenceRoomRecipientAttestationPacketDownload(
    context.client,
    workspace.slug,
    {
      attestationCount: workflow.summary.attestationCount,
      readyForReviewCount: workflow.summary.readyForReviewCount,
      exportDisabledCount: workflow.summary.exportDisabledCount,
      requiredRecipientControlCount: workflow.summary.requiredRecipientControlCount,
      linkedRecipientControlCount: workflow.summary.linkedRecipientControlCount,
      missingRecipientControlCount: workflow.summary.missingRecipientControlCount,
      readyReleaseAuthorityAttestationCount:
        workflow.summary.readyReleaseAuthorityAttestationCount,
      recipientState: workflow.recipientState,
      exportState: workflow.exportState,
      recipientAttestationAuthority: protectedEvidenceRoomRecipientAttestationAuthority,
      releaseAuthority: protectedEvidenceRoomRecipientReleaseAuthority,
      storageAuthority: protectedEvidenceRoomRecipientStorageAuthority,
      releaseAuthorityAttestationAuthority: protectedReleaseAuthorityAttestationAuthority,
      releaseAuthorityReleaseAuthority: protectedReleaseAuthorityReleaseAuthority,
      releaseAuthorityStorageAuthority: protectedReleaseAuthorityAttestationStorageAuthority,
      financeExternalUseAuthority: protectedFinanceExternalUseAuthority,
      financialReportingAuthority: protectedMetricRollupFinancialAuthority,
      securitiesAuthority: protectedMetricRollupSecuritiesAuthority,
      advertisingClaimsAuthority: protectedFinanceAdvertisingClaimsAuthority,
      clinicalExecutionAuthority: protectedMetricRollupClinicalAuthority
    }
  );

  if (auditResult.error || !auditResult.eventId) {
    const message = auditResult.error?.message ?? "";

    return NextResponse.json(
      {
        error: {
          code: "protected-evidence-room-recipient-attestation-packet-audit-failed",
          message:
            "The protected evidence-room recipient attestation packet was not released because the audit event could not be committed."
        },
        boundary: protectedEvidenceRoomRecipientBoundary
      },
      { status: statusForPacketError(message), headers }
    );
  }

  const generatedAt = new Date().toISOString();
  const packet = buildProtectedEvidenceRoomRecipientAttestationPacket({
    actorUserId: context.user.id,
    auditEventId: auditResult.eventId,
    generatedAt,
    workflow,
    workspace
  });
  const safeWorkspaceSlug = workspace.slug.replace(/[^a-z0-9-]/gi, "-").slice(0, 80) || "workspace";

  return new NextResponse(packet, {
    headers: {
      ...headers,
      "Content-Disposition": `attachment; filename="scrimed-${safeWorkspaceSlug}-evidence-room-recipient-attestations.md"`,
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Proof-Stack": protectedEvidenceRoomRecipientAttestationPacketProofStackStatus,
      "X-SCRIMED-Recipient-Attestation-Authority": protectedEvidenceRoomRecipientAttestationAuthority,
      "X-SCRIMED-Release-Authority": protectedEvidenceRoomRecipientReleaseAuthority,
      "X-SCRIMED-Storage-Authority": protectedEvidenceRoomRecipientStorageAuthority,
      "X-SCRIMED-Export-State": "export-disabled",
      "X-SCRIMED-Financial-Authority": protectedMetricRollupFinancialAuthority,
      "X-SCRIMED-Securities-Authority": protectedMetricRollupSecuritiesAuthority,
      "X-SCRIMED-Advertising-Claims-Authority": protectedFinanceAdvertisingClaimsAuthority,
      "X-SCRIMED-Clinical-Care-Authority": protectedMetricRollupClinicalAuthority
    }
  });
}
