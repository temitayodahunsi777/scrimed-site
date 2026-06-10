import { NextResponse } from "next/server";
import {
  getAccessiblePilotWorkspace,
  getAuthenticatedPilotContext,
  listPilotAuditEvents
} from "../../../../lib/protectedPilotStore";
import { protectedPilotBoundary } from "../../../../lib/protectedPilotWorkspace";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ workspaceSlug: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  const context = await getAuthenticatedPilotContext(request);

  if (!context.ok) {
    return NextResponse.json(
      { error: { code: context.code, message: context.message }, boundary: protectedPilotBoundary },
      { status: context.status }
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
        }
      },
      { status: 404 }
    );
  }

  const result = await listPilotAuditEvents(context.client, workspaceResult.workspace.id);

  if (result.error) {
    return NextResponse.json(
      {
        error: {
          code: "pilot-audit-query-failed",
          message: "The tenant-isolated append-only audit trail could not be retrieved."
        }
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    service: "scrimed-protected-pilot-audit",
    boundary: protectedPilotBoundary,
    workspace: workspaceResult.workspace,
    events: result.events
  });
}
