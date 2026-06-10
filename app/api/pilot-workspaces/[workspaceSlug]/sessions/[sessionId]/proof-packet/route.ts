import { NextResponse } from "next/server";
import {
  getAccessiblePilotWorkspace,
  getAuthenticatedPilotContext,
  getPilotSession,
  recordProofPacketDownload
} from "../../../../../../lib/protectedPilotStore";
import {
  buildEnterpriseProofPacket,
  protectedPilotBoundary
} from "../../../../../../lib/protectedPilotWorkspace";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ workspaceSlug: string; sessionId: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  const context = await getAuthenticatedPilotContext(request);

  if (!context.ok) {
    return NextResponse.json(
      { error: { code: context.code, message: context.message }, boundary: protectedPilotBoundary },
      { status: context.status }
    );
  }

  const { workspaceSlug, sessionId } = await params;
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

  const sessionResult = await getPilotSession(context.client, workspaceResult.workspace.id, sessionId);

  if (sessionResult.error || !sessionResult.session) {
    return NextResponse.json(
      {
        error: {
          code: "pilot-session-not-found",
          message: "No tenant-isolated pilot session is available for this member and session ID."
        }
      },
      { status: 404 }
    );
  }

  const audit = await recordProofPacketDownload(
    context.client,
    workspaceResult.workspace,
    sessionResult.session,
    context.user.id
  );

  if (audit.error) {
    return NextResponse.json(
      {
        error: {
          code: "proof-packet-audit-failed",
          message: "The proof packet was not released because its append-only download audit event could not be committed."
        }
      },
      { status: 502 }
    );
  }

  const packet = buildEnterpriseProofPacket(workspaceResult.workspace, sessionResult.session);
  const safeWorkspaceSlug = workspaceResult.workspace.slug.replace(/[^a-z0-9-]/gi, "-");

  return new NextResponse(packet, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": `attachment; filename="scrimed-${safeWorkspaceSlug}-${sessionId}-proof-packet.md"`,
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Data-Boundary": "synthetic-only",
      "X-SCRIMED-Proof-Packet-Audited": "true"
    }
  });
}
