import { NextResponse } from "next/server";
import { getAuthenticatedSalesContext } from "../../../../../lib/protectedPilotStore";
import {
  buildSalesDealRoomPacket,
  defaultDealRoomWorkspaceSlug,
  deriveSalesDealRoomForOpportunity,
  salesDealRoomBoundary
} from "../../../../../lib/salesDealRoom";
import {
  salesOperationsBoundary,
  salesOperationsNoStoreHeaders
} from "../../../../../lib/salesOperations";
import {
  getSalesOperationsDashboard,
  getSalesOpportunity,
  recordSalesArtifactDownload
} from "../../../../../lib/salesOperationsStore";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ intakeId: string }>;
};

function appBaseUrl(request: Request) {
  return process.env.SCRIMED_APP_BASE_URL ?? new URL(request.url).origin;
}

export async function GET(request: Request, { params }: RouteContext) {
  const context = await getAuthenticatedSalesContext(request);

  if (!context.ok) {
    return NextResponse.json(
      { error: { code: context.code, message: context.message }, boundary: salesOperationsBoundary },
      { status: context.status, headers: salesOperationsNoStoreHeaders }
    );
  }

  const { intakeId } = await params;
  const [opportunityResult, dashboardResult] = await Promise.all([
    getSalesOpportunity(context.client, intakeId),
    getSalesOperationsDashboard(context.client)
  ]);

  if (opportunityResult.error || !opportunityResult.opportunity) {
    return NextResponse.json(
      {
        error: {
          code: "sales-opportunity-not-found",
          message: "No tenant-scoped opportunity is available for this ID."
        },
        boundary: salesDealRoomBoundary
      },
      {
        status: opportunityResult.error?.message.includes("sales-operations-admin-required") ? 403 : 404,
        headers: salesOperationsNoStoreHeaders
      }
    );
  }

  if (dashboardResult.error || !dashboardResult.dashboard) {
    return NextResponse.json(
      {
        error: {
          code: "sales-deal-room-dashboard-unavailable",
          message: "The deal-room packet could not be generated because the tenant dashboard was unavailable."
        },
        boundary: salesDealRoomBoundary
      },
      { status: 502, headers: salesOperationsNoStoreHeaders }
    );
  }

  const opportunityAuditEvents = dashboardResult.dashboard.auditEvents.filter(
    (event) => event.intakeId === intakeId
  );
  const workspaceSlug = process.env.SCRIMED_DEFAULT_BUYER_ROOM_WORKSPACE_SLUG ?? defaultDealRoomWorkspaceSlug;
  const packet = deriveSalesDealRoomForOpportunity({
    opportunity: opportunityResult.opportunity,
    auditEvents: opportunityAuditEvents,
    appBaseUrl: appBaseUrl(request),
    workspaceSlug
  });
  const audit = await recordSalesArtifactDownload(
    context.client,
    intakeId,
    "buyer-deal-room-packet-downloaded",
    {
      artifactKind: "buyer-deal-room-packet",
      format: "text/markdown",
      noPhiBoundary: true,
      tenantScoped: true,
      buyerRoomRoute: packet.buyerRoomRoute,
      buyerRoomPacketRoute: packet.buyerRoomPacketRoute,
      readinessScore: packet.readinessScore,
      workspaceSlug,
      workspaceMappingMode: packet.workspaceMappingMode
    }
  );

  if (audit.error) {
    return NextResponse.json(
      {
        error: {
          code: "sales-deal-room-packet-audit-failed",
          message: "The deal-room packet was not released because its append-only audit event could not be committed."
        },
        boundary: salesDealRoomBoundary
      },
      { status: 502, headers: salesOperationsNoStoreHeaders }
    );
  }

  const auditEventId = typeof audit.data === "string" ? audit.data : "committed";
  const safeIntakeId = intakeId.replace(/[^a-z0-9-]/gi, "-");

  return new NextResponse(
    buildSalesDealRoomPacket({
      generatedAt: new Date().toISOString(),
      auditEventId,
      generatedBy: context.user.id,
      opportunity: opportunityResult.opportunity,
      packet,
      auditEvents: opportunityAuditEvents
    }),
    {
      headers: {
        ...salesOperationsNoStoreHeaders,
        "Cache-Control": "private, no-store",
        "Content-Disposition": `attachment; filename="scrimed-${safeIntakeId}-pilot-deal-room.md"`,
        "Content-Type": "text/markdown; charset=utf-8",
        "X-SCRIMED-Data-Boundary": "business-contact-and-workflow-scope-only",
        "X-SCRIMED-Deal-Room-Packet-Audited": "true",
        "X-SCRIMED-Workspace-Mapping": packet.workspaceMappingMode
      }
    }
  );
}
