import { NextResponse } from "next/server";
import {
  buildProtectedExternalApprovalEvidencePacket,
  deriveProtectedExternalApprovalEvidenceWorkflow,
  protectedExternalApprovalEvidenceAuthority,
  protectedExternalApprovalEvidenceBoundary,
  protectedExternalApprovalEvidencePacketProofStackStatus,
  protectedExternalApprovalEvidenceReleaseAuthority,
  protectedExternalApprovalEvidenceStorageAuthority
} from "../../../../../lib/protectedExternalApprovalEvidence";
import {
  protectedFinanceAdvertisingClaimsAuthority,
  protectedFinanceExternalUseAuthority,
  protectedFinanceMethodologyAuthority,
  deriveProtectedFinanceMethodologyWorkflow
} from "../../../../../lib/protectedFinanceMethodology";
import {
  protectedMetricRollupClinicalAuthority,
  protectedMetricRollupFinancialAuthority,
  protectedMetricRollupSecuritiesAuthority
} from "../../../../../lib/protectedMetricRollups";
import {
  getAccessiblePilotWorkspace,
  getAuthenticatedGovernanceContext,
  listProtectedBoardScorecards,
  listProtectedExternalApprovalEvidenceReferences,
  listProtectedFinanceMethodologyGates,
  recordProtectedExternalApprovalEvidencePacketDownload
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
    namespace: "protected-external-approval-evidence-packet-download",
    limit: 15,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message:
            "Protected external approval evidence packet downloads are temporarily rate limited."
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
  const [scorecardsResult, financeRecordsResult, externalRecordsResult] = await Promise.all([
    listProtectedBoardScorecards(context.client, workspace.id),
    listProtectedFinanceMethodologyGates(context.client, workspace.id),
    listProtectedExternalApprovalEvidenceReferences(context.client, workspace.id)
  ]);
  const unavailableSections = [
    scorecardsResult.error
      ? "Protected board scorecards could not be retrieved for this packet."
      : "",
    financeRecordsResult.error
      ? "Protected finance methodology gate history could not be retrieved for this packet."
      : "",
    externalRecordsResult.error
      ? "Protected external approval evidence reference history could not be retrieved for this packet."
      : ""
  ].filter(Boolean);
  const financeWorkflow = deriveProtectedFinanceMethodologyWorkflow({
    records: financeRecordsResult.error ? [] : financeRecordsResult.records,
    scorecards: scorecardsResult.error ? [] : scorecardsResult.scorecards,
    unavailableSections: unavailableSections.filter((section) => section.includes("finance"))
  });
  const workflow = deriveProtectedExternalApprovalEvidenceWorkflow({
    records: externalRecordsResult.error ? [] : externalRecordsResult.records,
    financeGateRecords: financeRecordsResult.error ? [] : financeRecordsResult.records,
    financeWorkflow,
    unavailableSections
  });
  const auditResult = await recordProtectedExternalApprovalEvidencePacketDownload(
    context.client,
    workspace.slug,
    {
      recordedDomainCount: workflow.summary.recordedDomainCount,
      missingDomainCount: workflow.summary.missingDomainCount,
      retainedBlockerCount: workflow.summary.retainedBlockerCount,
      evidenceLinkageState: workflow.evidenceLinkageState,
      releaseReadinessStatus: workflow.releaseReadinessStatus,
      evidenceAuthority: protectedExternalApprovalEvidenceAuthority,
      storageAuthority: protectedExternalApprovalEvidenceStorageAuthority,
      releaseAuthority: protectedExternalApprovalEvidenceReleaseAuthority,
      financeMethodologyAuthority: protectedFinanceMethodologyAuthority,
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
          code: "protected-external-approval-evidence-packet-audit-failed",
          message:
            "The protected external approval evidence packet was not released because the audit event could not be committed."
        },
        boundary: protectedExternalApprovalEvidenceBoundary
      },
      { status: statusForPacketError(message), headers }
    );
  }

  const generatedAt = new Date().toISOString();
  const packet = buildProtectedExternalApprovalEvidencePacket({
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
      "Content-Disposition": `attachment; filename="scrimed-${safeWorkspaceSlug}-external-approval-evidence-links.md"`,
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Proof-Stack": protectedExternalApprovalEvidencePacketProofStackStatus,
      "X-SCRIMED-Evidence-Authority": protectedExternalApprovalEvidenceAuthority,
      "X-SCRIMED-Storage-Authority": protectedExternalApprovalEvidenceStorageAuthority,
      "X-SCRIMED-Release-Authority": protectedExternalApprovalEvidenceReleaseAuthority,
      "X-SCRIMED-Finance-Methodology-Authority": protectedFinanceMethodologyAuthority,
      "X-SCRIMED-Finance-External-Use-Authority": protectedFinanceExternalUseAuthority,
      "X-SCRIMED-Financial-Authority": protectedMetricRollupFinancialAuthority,
      "X-SCRIMED-Securities-Authority": protectedMetricRollupSecuritiesAuthority,
      "X-SCRIMED-Advertising-Claims-Authority": protectedFinanceAdvertisingClaimsAuthority,
      "X-SCRIMED-Clinical-Care-Authority": protectedMetricRollupClinicalAuthority
    }
  });
}
