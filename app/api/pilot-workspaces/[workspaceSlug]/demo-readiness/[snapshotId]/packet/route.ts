import { NextResponse } from "next/server";
import {
  getAccessiblePilotWorkspace,
  getAuthenticatedGovernanceContext,
  getPilotDemoReadinessSnapshot,
  listPilotAuditEvents,
  recordPilotDemoReadinessPacketDownload
} from "../../../../../../lib/protectedPilotStore";
import { buildPilotDemoReadinessPacket } from "../../../../../../lib/pilotDemoReadiness";
import {
  protectedPilotBoundary,
  protectedPilotNoStoreHeaders
} from "../../../../../../lib/protectedPilotWorkspace";
import { enforceRequestRateLimit, rateLimitHeaders } from "../../../../../../lib/requestRateLimit";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ workspaceSlug: string; snapshotId: string }>;
};

function getAppBaseUrl(request: Request) {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.VERCEL_PROJECT_PRODUCTION_URL;

  if (configuredUrl) {
    return configuredUrl.startsWith("http") ? configuredUrl : `https://${configuredUrl}`;
  }

  return new URL(request.url).origin;
}

export async function GET(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "pilot-demo-readiness-packet-download",
    limit: 30,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Demo readiness packet downloads are temporarily rate limited."
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

  const { workspaceSlug, snapshotId } = await params;
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
  const snapshotResult = await getPilotDemoReadinessSnapshot(context.client, workspace.id, snapshotId);

  if (snapshotResult.error || !snapshotResult.snapshot) {
    return NextResponse.json(
      {
        error: {
          code: "demo-readiness-snapshot-not-found",
          message: "No tenant-isolated demo readiness snapshot is available for this member and snapshot ID."
        },
        boundary: protectedPilotBoundary
      },
      { status: 404, headers }
    );
  }

  const audit = await recordPilotDemoReadinessPacketDownload(context.client, workspace.slug, snapshotId);

  if (audit.error || !audit.eventId) {
    return NextResponse.json(
      {
        error: {
          code: "demo-readiness-packet-audit-failed",
          message:
            "The demo readiness packet was not released because its append-only packet audit event could not be committed."
        },
        boundary: protectedPilotBoundary
      },
      { status: 502, headers }
    );
  }

  const auditResult = await listPilotAuditEvents(context.client, workspace.id);
  const generatedAt = new Date().toISOString();
  const packet = buildPilotDemoReadinessPacket({
    generatedAt,
    auditEventId: audit.eventId,
    actorUserId: context.user.id,
    appBaseUrl: getAppBaseUrl(request),
    workspace,
    snapshot: snapshotResult.snapshot,
    recentAuditEvents: auditResult.error ? [] : auditResult.events
  });
  const safeWorkspaceSlug = workspace.slug.replace(/[^a-z0-9-]/gi, "-").slice(0, 80) || "workspace";

  return new NextResponse(packet, {
    headers: {
      ...headers,
      "Content-Disposition": `attachment; filename="scrimed-${safeWorkspaceSlug}-${snapshotId}-demo-readiness-packet.md"`,
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Data-Boundary": "synthetic-only",
      "X-SCRIMED-Demo-Readiness-Packet-Audited": "true"
    }
  });
}
