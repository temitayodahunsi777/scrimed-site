import { NextResponse } from "next/server";
import { deriveProtectedDistributionLockboxWorkflow } from "../../../../../lib/protectedDistributionLockbox";
import {
  buildProtectedEvidenceRoomAccessLogReconciliationPacket,
  deriveProtectedEvidenceRoomAccessLogReconciliationWorkflow,
  protectedEvidenceRoomAccessLogBoundary,
  protectedEvidenceRoomAccessLogReconciliationAuthority,
  protectedEvidenceRoomAccessLogReconciliationPacketProofStackStatus,
  protectedEvidenceRoomAccessLogReleaseAuthority,
  protectedEvidenceRoomAccessLogStorageAuthority
} from "../../../../../lib/protectedEvidenceRoomAccessLogReconciliation";
import {
  deriveProtectedEvidenceRoomRecipientAttestationWorkflow,
  protectedEvidenceRoomRecipientAttestationAuthority,
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
import { deriveProtectedReleaseAuthorityAttestationWorkflow } from "../../../../../lib/protectedReleaseAuthorityAttestations";
import { deriveProtectedReleaseDecisionWorkflow } from "../../../../../lib/protectedReleaseDecisionWorkflow";
import {
  getAccessiblePilotWorkspace,
  getAuthenticatedGovernanceContext,
  listProtectedBoardScorecards,
  listProtectedDistributionLockboxes,
  listProtectedEvidenceRoomAccessLogReconciliations,
  listProtectedEvidenceRoomRecipientAttestations,
  listProtectedExternalApprovalEvidenceReferences,
  listProtectedFinanceMethodologyGates,
  listProtectedNamedReviewerSignoffs,
  listProtectedReleaseAuthorityAttestations,
  listProtectedReleaseDecisions,
  recordProtectedEvidenceRoomAccessLogReconciliationPacketDownload
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
    namespace: "protected-evidence-room-access-log-reconciliation-packet-download",
    limit: 12,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Protected evidence-room access-log reconciliation packet downloads are temporarily rate limited."
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
    recipientRecordsResult,
    accessLogRecordsResult
  ] = await Promise.all([
    listProtectedBoardScorecards(context.client, workspace.id),
    listProtectedFinanceMethodologyGates(context.client, workspace.id),
    listProtectedExternalApprovalEvidenceReferences(context.client, workspace.id),
    listProtectedReleaseDecisions(context.client, workspace.id),
    listProtectedNamedReviewerSignoffs(context.client, workspace.id),
    listProtectedDistributionLockboxes(context.client, workspace.id),
    listProtectedReleaseAuthorityAttestations(context.client, workspace.id),
    listProtectedEvidenceRoomRecipientAttestations(context.client, workspace.id),
    listProtectedEvidenceRoomAccessLogReconciliations(context.client, workspace.id)
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
      : "",
    accessLogRecordsResult.error
      ? "Protected evidence-room access-log reconciliation history could not be retrieved for this packet."
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
  const recipientWorkflow = deriveProtectedEvidenceRoomRecipientAttestationWorkflow({
    records: recipientRecordsResult.error ? [] : recipientRecordsResult.records,
    releaseAuthorityWorkflow: authorityWorkflow,
    unavailableSections: unavailableSections.filter((section) => section.includes("recipient"))
  });
  const workflow = deriveProtectedEvidenceRoomAccessLogReconciliationWorkflow({
    records: accessLogRecordsResult.error ? [] : accessLogRecordsResult.records,
    recipientWorkflow,
    unavailableSections
  });
  const auditResult = await recordProtectedEvidenceRoomAccessLogReconciliationPacketDownload(
    context.client,
    workspace.slug,
    {
      reconciliationCount: workflow.summary.reconciliationCount,
      readyForReviewCount: workflow.summary.readyForReviewCount,
      exportDisabledCount: workflow.summary.exportDisabledCount,
      requiredAccessLogControlCount: workflow.summary.requiredAccessLogControlCount,
      linkedAccessLogControlCount: workflow.summary.linkedAccessLogControlCount,
      missingAccessLogControlCount: workflow.summary.missingAccessLogControlCount,
      readyRecipientAttestationCount: workflow.summary.readyRecipientAttestationCount,
      anomalyNeedsReviewCount: workflow.summary.anomalyNeedsReviewCount,
      reconciliationState: workflow.reconciliationState,
      exportState: workflow.exportState,
      accessLogReconciliationAuthority: protectedEvidenceRoomAccessLogReconciliationAuthority,
      releaseAuthority: protectedEvidenceRoomAccessLogReleaseAuthority,
      storageAuthority: protectedEvidenceRoomAccessLogStorageAuthority,
      recipientAttestationAuthority: protectedEvidenceRoomRecipientAttestationAuthority,
      recipientReleaseAuthority: protectedEvidenceRoomRecipientReleaseAuthority,
      recipientStorageAuthority: protectedEvidenceRoomRecipientStorageAuthority,
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
          code: "protected-evidence-room-access-log-reconciliation-packet-audit-failed",
          message:
            "The protected evidence-room access-log reconciliation packet was not released because the audit event could not be committed."
        },
        boundary: protectedEvidenceRoomAccessLogBoundary
      },
      { status: statusForPacketError(message), headers }
    );
  }

  const generatedAt = new Date().toISOString();
  const packet = buildProtectedEvidenceRoomAccessLogReconciliationPacket({
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
      "Content-Disposition": `attachment; filename="scrimed-${safeWorkspaceSlug}-evidence-room-access-log-reconciliation.md"`,
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Proof-Stack": protectedEvidenceRoomAccessLogReconciliationPacketProofStackStatus,
      "X-SCRIMED-Access-Log-Reconciliation-Authority": protectedEvidenceRoomAccessLogReconciliationAuthority,
      "X-SCRIMED-Release-Authority": protectedEvidenceRoomAccessLogReleaseAuthority,
      "X-SCRIMED-Storage-Authority": protectedEvidenceRoomAccessLogStorageAuthority,
      "X-SCRIMED-Export-State": "export-disabled",
      "X-SCRIMED-Financial-Authority": protectedMetricRollupFinancialAuthority,
      "X-SCRIMED-Securities-Authority": protectedMetricRollupSecuritiesAuthority,
      "X-SCRIMED-Advertising-Claims-Authority": protectedFinanceAdvertisingClaimsAuthority,
      "X-SCRIMED-Clinical-Care-Authority": protectedMetricRollupClinicalAuthority
    }
  });
}
