import { NextResponse } from "next/server";
import { deriveBuyerPilotRoom } from "../../../../lib/buyerPilotRoom";
import {
  getAccessiblePilotWorkspace,
  getAuthenticatedGovernanceContext,
  listQaManualRunEvidencePackets,
  listPilotAuditEvents,
  listPilotDemoReadinessSnapshots,
  listPilotSessions
} from "../../../../lib/protectedPilotStore";
import {
  protectedPilotBoundary,
  protectedPilotNoStoreHeaders
} from "../../../../lib/protectedPilotWorkspace";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ workspaceSlug: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  const context = await getAuthenticatedGovernanceContext(request);

  if (!context.ok) {
    return NextResponse.json(
      { error: { code: context.code, message: context.message }, boundary: protectedPilotBoundary },
      { status: context.status, headers: protectedPilotNoStoreHeaders }
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
      { status: 404, headers: protectedPilotNoStoreHeaders }
    );
  }

  const workspace = workspaceResult.workspace;
  const [sessionsResult, auditResult, snapshotsResult, manualQaEvidenceResult] = await Promise.all([
    listPilotSessions(context.client, workspace.id),
    listPilotAuditEvents(context.client, workspace.id),
    listPilotDemoReadinessSnapshots(context.client, workspace.id),
    listQaManualRunEvidencePackets(context.client, workspace.id)
  ]);
  const unavailableSections = [
    sessionsResult.error ? "Durable synthetic sessions could not be retrieved." : "",
    auditResult.error ? "Append-only pilot audit events could not be retrieved." : "",
    snapshotsResult.error ? "Demo readiness snapshots could not be retrieved." : "",
    manualQaEvidenceResult.error ? "Manual QA evidence packets could not be retrieved." : ""
  ].filter(Boolean);
  const sessions = sessionsResult.error ? [] : sessionsResult.sessions;
  const auditEvents = auditResult.error ? [] : auditResult.events;
  const demoSnapshots = snapshotsResult.error ? [] : snapshotsResult.snapshots;
  const manualQaEvidencePackets = manualQaEvidenceResult.error
    ? []
    : manualQaEvidenceResult.packets;
  const room = deriveBuyerPilotRoom({
    workspace,
    sessions,
    auditEvents,
    demoSnapshots,
    manualQaEvidencePackets,
    unavailableSections
  });

  return NextResponse.json(
    {
      service: "scrimed-buyer-pilot-room",
      boundary: room.boundary,
      workspace,
      room
    },
    { headers: protectedPilotNoStoreHeaders }
  );
}
