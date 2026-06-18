import { NextResponse } from "next/server";
import { buildBuyerPilotRoomPacket, deriveBuyerPilotRoom } from "../../../../../lib/buyerPilotRoom";
import {
  getAccessiblePilotWorkspace,
  getAuthenticatedGovernanceContext,
  listCommandIntelligenceSnapshots,
  listQaManualRunEvidencePackets,
  listPilotAuditEvents,
  listPilotDemoReadinessSnapshots,
  listPilotSessions,
  recordBuyerPilotRoomPacketDownload
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

function getAppBaseUrl(request: Request) {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.VERCEL_PROJECT_PRODUCTION_URL;

  if (configuredUrl) {
    return configuredUrl.startsWith("http") ? configuredUrl : `https://${configuredUrl}`;
  }

  return new URL(request.url).origin;
}

function statusForBuyerRoomPacketError(message: string) {
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
    namespace: "buyer-pilot-room-packet-download",
    limit: 20,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Buyer Diligence Export downloads are temporarily rate limited."
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
    commandSnapshotsResult
  ] = await Promise.all([
    listPilotSessions(context.client, workspace.id),
    listPilotAuditEvents(context.client, workspace.id),
    listPilotDemoReadinessSnapshots(context.client, workspace.id),
    listQaManualRunEvidencePackets(context.client, workspace.id),
    listCommandIntelligenceSnapshots(context.client, workspace.id)
  ]);
  const unavailableSections = [
    sessionsResult.error ? "Durable synthetic sessions could not be retrieved." : "",
    auditResult.error ? "Append-only pilot audit events could not be retrieved." : "",
    snapshotsResult.error ? "Demo readiness snapshots could not be retrieved." : "",
    manualQaEvidenceResult.error ? "Manual QA evidence packets could not be retrieved." : "",
    commandSnapshotsResult.error ? "Command Intelligence snapshots could not be retrieved." : ""
  ].filter(Boolean);
  const sessions = sessionsResult.error ? [] : sessionsResult.sessions;
  const auditEvents = auditResult.error ? [] : auditResult.events;
  const demoSnapshots = snapshotsResult.error ? [] : snapshotsResult.snapshots;
  const manualQaEvidencePackets = manualQaEvidenceResult.error
    ? []
    : manualQaEvidenceResult.packets;
  const commandSnapshots = commandSnapshotsResult.error ? [] : commandSnapshotsResult.snapshots;
  const room = deriveBuyerPilotRoom({
    workspace,
    sessions,
    auditEvents,
    demoSnapshots,
    commandSnapshots,
    manualQaEvidencePackets,
    unavailableSections
  });
  const audit = await recordBuyerPilotRoomPacketDownload(context.client, workspace.slug, {
    readinessState: room.state,
    readinessScore: room.score,
    latestDemoReadinessSnapshotId: room.latestSnapshot?.id ?? null,
    evidenceCounts: room.evidenceCounts,
    unavailableSections
  });

  if (audit.error || !audit.eventId) {
    const message = audit.error?.message ?? "";

    return NextResponse.json(
      {
        error: {
          code: "buyer-room-packet-audit-failed",
          message:
            "The Buyer Diligence Export was not released because its append-only download audit event could not be committed."
        },
        boundary: protectedPilotBoundary
      },
      { status: statusForBuyerRoomPacketError(message), headers }
    );
  }

  const generatedAt = new Date().toISOString();
  const packet = buildBuyerPilotRoomPacket({
    generatedAt,
    auditEventId: audit.eventId,
    actorUserId: context.user.id,
    appBaseUrl: getAppBaseUrl(request),
    workspace,
    room,
    recentAuditEvents: auditEvents,
    manualQaEvidencePackets
  });
  const safeWorkspaceSlug = workspace.slug.replace(/[^a-z0-9-]/gi, "-").slice(0, 80) || "workspace";

  return new NextResponse(packet, {
    headers: {
      ...headers,
      "Content-Disposition": `attachment; filename="scrimed-${safeWorkspaceSlug}-buyer-diligence-export.md"`,
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Data-Boundary": "synthetic-only",
      "X-SCRIMED-Buyer-Diligence-Export-Audited": "true",
      "X-SCRIMED-Buyer-Room-Packet-Audited": "true"
    }
  });
}
