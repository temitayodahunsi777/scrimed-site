import { NextResponse } from "next/server";
import {
  getAccessiblePilotWorkspace,
  getAgentWorkspaceWorkOrder,
  getAuthenticatedGovernanceContext,
  listAgentWorkspaceWorkOrderEvents,
  recordAgentWorkspaceWorkOrderProofPacketDownload
} from "../../../../../../lib/protectedPilotStore";
import {
  protectedPilotBoundary,
  protectedPilotNoStoreHeaders
} from "../../../../../../lib/protectedPilotWorkspace";
import { buildAgentWorkspaceWorkOrderProofPacket } from "../../../../../../lib/persistentAgentWorkspace";
import { enforceRequestRateLimit, rateLimitHeaders } from "../../../../../../lib/requestRateLimit";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ workspaceSlug: string; workOrderId: string }>;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getAppBaseUrl(request: Request) {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.VERCEL_PROJECT_PRODUCTION_URL;

  if (configuredUrl) {
    return configuredUrl.startsWith("http") ? configuredUrl : `https://${configuredUrl}`;
  }

  return new URL(request.url).origin;
}

export async function GET(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "agent-work-order-proof-packet",
    limit: 40,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Agent Workspace work-order proof packet downloads are temporarily rate limited."
        }
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

  const { workspaceSlug, workOrderId } = await params;

  if (!uuidPattern.test(workOrderId)) {
    return NextResponse.json(
      { error: { code: "invalid-work-order-id", message: "workOrderId must be a valid UUID." } },
      { status: 400, headers }
    );
  }

  const workspaceResult = await getAccessiblePilotWorkspace(context.client, workspaceSlug);

  if (workspaceResult.error || !workspaceResult.workspace) {
    return NextResponse.json(
      {
        error: {
          code: "pilot-workspace-not-found",
          message: "No tenant-isolated pilot workspace is available for this member and slug."
        }
      },
      { status: 404, headers }
    );
  }

  const workOrderResult = await getAgentWorkspaceWorkOrder(
    context.client,
    workspaceResult.workspace.id,
    workOrderId
  );

  if (workOrderResult.error) {
    return NextResponse.json(
      {
        error: {
          code: "agent-work-order-persistence-unavailable",
          message:
            "Persistent Agent Workspace work orders are not available for this environment. Apply the work-order migration and verify RLS before use."
        },
        boundary: protectedPilotBoundary
      },
      { status: 503, headers }
    );
  }

  if (!workOrderResult.workOrder) {
    return NextResponse.json(
      { error: { code: "agent-work-order-not-found", message: "No work order is visible for this workspace." } },
      { status: 404, headers }
    );
  }

  const eventsResult = await listAgentWorkspaceWorkOrderEvents(
    context.client,
    workspaceResult.workspace.id,
    workOrderId
  );

  if (eventsResult.error) {
    return NextResponse.json(
      {
        error: {
          code: "agent-work-order-events-unavailable",
          message:
            "The proof packet was not released because the append-only work-order event trail could not be retrieved."
        },
        boundary: protectedPilotBoundary
      },
      { status: 503, headers }
    );
  }

  const audit = await recordAgentWorkspaceWorkOrderProofPacketDownload(
    context.client,
    workspaceSlug,
    workOrderId
  );

  if (audit.error || !audit.eventId) {
    return NextResponse.json(
      {
        error: {
          code: "work-order-proof-packet-audit-failed",
          message:
            "The proof packet was not released because its append-only download audit event could not be committed."
        },
        boundary: protectedPilotBoundary
      },
      { status: 502, headers }
    );
  }

  const packet = buildAgentWorkspaceWorkOrderProofPacket({
    workspace: workspaceResult.workspace,
    workOrder: workOrderResult.workOrder,
    events: eventsResult.events,
    auditEventId: audit.eventId,
    generatedAt: new Date().toISOString(),
    appBaseUrl: getAppBaseUrl(request)
  });
  const safeWorkspaceSlug = workspaceResult.workspace.slug.replace(/[^a-z0-9-]/gi, "-");

  return new NextResponse(packet, {
    headers: {
      ...headers,
      "Content-Disposition": `attachment; filename="scrimed-${safeWorkspaceSlug}-${workOrderId}-work-order-proof-packet.md"`,
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Data-Boundary": "synthetic-only",
      "X-SCRIMED-Proof-Packet-Audited": "true"
    }
  });
}
