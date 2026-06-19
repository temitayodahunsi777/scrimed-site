import { NextResponse } from "next/server";
import {
  buildClinicalActivationApprovalPacket,
  deriveClinicalActivationApprovalWorkflow
} from "../../../../../lib/clinicalActivationApprovals";
import { deriveClinicalActivationDossier } from "../../../../../lib/clinicalActivationDossier";
import {
  getAccessiblePilotWorkspace,
  getAuthenticatedGovernanceContext,
  listClinicalActivationApprovals,
  listCommandIntelligenceSnapshots,
  listPilotAuditEvents,
  listPilotDemoReadinessSnapshots,
  listPilotSessions,
  listQaManualRunEvidencePackets,
  recordClinicalActivationApprovalPacketDownload
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

function statusForApprovalPacketError(message: string) {
  if (
    message.includes("role-denied") ||
    message.includes("authentication-required") ||
    message.includes("governance-aal2-session-required")
  ) {
    return 403;
  }

  if (message.includes("workspace-not-found")) return 404;
  return 502;
}

export async function GET(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "clinical-activation-approval-packet-download",
    limit: 15,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Clinical Activation Approval Workflow packet downloads are temporarily rate limited."
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
    sessionsResult,
    auditResult,
    snapshotsResult,
    manualQaEvidenceResult,
    commandSnapshotsResult,
    approvalsResult
  ] = await Promise.all([
    listPilotSessions(context.client, workspace.id),
    listPilotAuditEvents(context.client, workspace.id),
    listPilotDemoReadinessSnapshots(context.client, workspace.id),
    listQaManualRunEvidencePackets(context.client, workspace.id),
    listCommandIntelligenceSnapshots(context.client, workspace.id),
    listClinicalActivationApprovals(context.client, workspace.id)
  ]);
  const unavailableSections = [
    sessionsResult.error ? "Durable synthetic sessions could not be retrieved." : "",
    auditResult.error ? "Append-only pilot audit events could not be retrieved." : "",
    snapshotsResult.error ? "Demo readiness snapshots could not be retrieved." : "",
    manualQaEvidenceResult.error ? "Manual QA evidence packets could not be retrieved." : "",
    commandSnapshotsResult.error ? "Command Intelligence snapshots could not be retrieved." : "",
    approvalsResult.error
      ? "Clinical activation approval history could not be retrieved; use external signed evidence and the dossier packet as a safe workaround."
      : ""
  ].filter(Boolean);
  const dossier = deriveClinicalActivationDossier({
    workspace,
    sessions: sessionsResult.error ? [] : sessionsResult.sessions,
    auditEvents: auditResult.error ? [] : auditResult.events,
    demoSnapshots: snapshotsResult.error ? [] : snapshotsResult.snapshots,
    manualQaEvidencePackets: manualQaEvidenceResult.error ? [] : manualQaEvidenceResult.packets,
    commandSnapshots: commandSnapshotsResult.error ? [] : commandSnapshotsResult.snapshots,
    unavailableSections: unavailableSections.filter(
      (section) => !section.includes("approval history")
    )
  });
  const workflow = deriveClinicalActivationApprovalWorkflow({
    dossier,
    approvals: approvalsResult.error ? [] : approvalsResult.approvals,
    unavailableSections
  });
  const audit = await recordClinicalActivationApprovalPacketDownload(
    context.client,
    workspace.slug,
    {
      attestedDomainCount: workflow.summary.attestedDomainCount,
      missingDomainCount: workflow.summary.missingDomainCount,
      retainedBlockerCount: workflow.summary.retainedBlockerCount,
      persistenceStatus: workflow.persistenceStatus,
      unavailableSections,
      clinicalGoLiveAuthority: workflow.clinicalGoLiveAuthority
    }
  );

  if (audit.error || !audit.eventId) {
    const message = audit.error?.message ?? "";

    return NextResponse.json(
      {
        error: {
          code: "clinical-activation-approval-packet-audit-failed",
          message:
            "The Clinical Activation Approval Workflow packet was not released because its append-only download audit event could not be committed."
        },
        boundary: protectedPilotBoundary
      },
      { status: statusForApprovalPacketError(message), headers }
    );
  }

  const generatedAt = new Date().toISOString();
  const packet = buildClinicalActivationApprovalPacket({
    actorUserId: context.user.id,
    auditEventId: audit.eventId,
    generatedAt,
    workflow,
    workspace
  });
  const safeWorkspaceSlug = workspace.slug.replace(/[^a-z0-9-]/gi, "-").slice(0, 80) || "workspace";

  return new NextResponse(packet, {
    headers: {
      ...headers,
      "Content-Disposition": `attachment; filename="scrimed-${safeWorkspaceSlug}-clinical-activation-approval-workflow.md"`,
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Clinical-Activation-Approval-Audited": "true",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Data-Boundary": "synthetic-only"
    }
  });
}
