import { NextResponse } from "next/server";
import {
  getAuthenticatedPilotContext,
  listAccessiblePilotWorkspaces
} from "../../lib/protectedPilotStore";
import {
  protectedPilotBoundary,
  protectedPilotNoStoreHeaders
} from "../../lib/protectedPilotWorkspace";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const context = await getAuthenticatedPilotContext(request);

  if (!context.ok) {
    return NextResponse.json(
      {
        error: {
          code: context.code,
          message: context.message
        },
        boundary: protectedPilotBoundary
      },
      { status: context.status, headers: protectedPilotNoStoreHeaders }
    );
  }

  const result = await listAccessiblePilotWorkspaces(context.client);

  if (result.error) {
    return NextResponse.json(
      {
        error: {
          code: "pilot-workspace-query-failed",
          message: "Tenant-isolated pilot workspaces could not be retrieved."
        }
      },
      { status: 502, headers: protectedPilotNoStoreHeaders }
    );
  }

  return NextResponse.json(
    {
      service: "scrimed-protected-pilot-workspaces",
      boundary: protectedPilotBoundary,
      authenticatedUserId: context.user.id,
      workspaces: result.workspaces
    },
    { headers: protectedPilotNoStoreHeaders }
  );
}
