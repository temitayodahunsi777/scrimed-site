import { NextResponse } from "next/server";
import {
  buildBuyerDemoSessionPacket,
  buyerDemoSessionBoundary
} from "../../../../../../../lib/buyerDemoSessions";
import { getAuthenticatedSalesContext } from "../../../../../../../lib/protectedPilotStore";
import {
  salesOperationsBoundary,
  salesOperationsNoStoreHeaders
} from "../../../../../../../lib/salesOperations";
import {
  getSalesOperationsDashboard,
  getSalesOpportunity,
  recordSalesBuyerDemoSessionPacketDownload
} from "../../../../../../../lib/salesOperationsStore";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ intakeId: string; sessionId: string }>;
};

function packetStatus(message?: string) {
  if (!message) return 502;
  if (message.includes("sales-demo-session-not-found")) return 404;
  if (message.includes("sales-opportunity-not-found")) return 404;
  if (message.includes("sales-operations-admin-required")) return 403;
  if (message.includes("mfa-required")) return 403;
  return 502;
}

export async function GET(request: Request, { params }: RouteContext) {
  const context = await getAuthenticatedSalesContext(request);

  if (!context.ok) {
    return NextResponse.json(
      { error: { code: context.code, message: context.message }, boundary: salesOperationsBoundary },
      { status: context.status, headers: salesOperationsNoStoreHeaders }
    );
  }

  const { intakeId, sessionId } = await params;
  const [opportunityResult, packetResult] = await Promise.all([
    getSalesOpportunity(context.client, intakeId),
    recordSalesBuyerDemoSessionPacketDownload(context.client, intakeId, sessionId)
  ]);

  if (opportunityResult.error || !opportunityResult.opportunity) {
    return NextResponse.json(
      {
        error: {
          code: "sales-opportunity-not-found",
          message: "No tenant-scoped opportunity is available for this ID."
        },
        boundary: buyerDemoSessionBoundary
      },
      {
        status: packetStatus(opportunityResult.error?.message),
        headers: salesOperationsNoStoreHeaders
      }
    );
  }

  if (packetResult.error || !packetResult.result?.buyerDemoSession) {
    return NextResponse.json(
      {
        error: {
          code: "sales-demo-session-packet-failed",
          message:
            packetResult.error?.message.includes("sales-demo-session-not-found")
              ? "The selected buyer demo session was not found for this opportunity."
              : "The buyer demo session packet was not released because its append-only audit event could not be committed."
        },
        boundary: buyerDemoSessionBoundary
      },
      {
        status: packetStatus(packetResult.error?.message),
        headers: salesOperationsNoStoreHeaders
      }
    );
  }

  const dashboardResult = await getSalesOperationsDashboard(context.client);

  if (dashboardResult.error || !dashboardResult.dashboard) {
    return NextResponse.json(
      {
        error: {
          code: "sales-demo-session-dashboard-unavailable",
          message:
            "The buyer demo session packet could not be generated because the tenant dashboard was unavailable."
        },
        boundary: buyerDemoSessionBoundary
      },
      { status: 502, headers: salesOperationsNoStoreHeaders }
    );
  }

  const opportunityAuditEvents = dashboardResult.dashboard.auditEvents.filter(
    (event) => event.intakeId === intakeId
  );
  const auditEventId = packetResult.result.auditEventId ?? "committed";
  const safeIntakeId = intakeId.replace(/[^a-z0-9-]/gi, "-");
  const safeSessionId = sessionId.replace(/[^a-z0-9-]/gi, "-");

  return new NextResponse(
    buildBuyerDemoSessionPacket({
      generatedAt: new Date().toISOString(),
      auditEventId,
      generatedBy: context.user.id,
      opportunity: opportunityResult.opportunity,
      session: packetResult.result.buyerDemoSession,
      auditEvents: opportunityAuditEvents
    }),
    {
      headers: {
        ...salesOperationsNoStoreHeaders,
        "Cache-Control": "private, no-store",
        "Content-Disposition": `attachment; filename="scrimed-${safeIntakeId}-${safeSessionId}-buyer-demo-session.md"`,
        "Content-Type": "text/markdown; charset=utf-8",
        "X-SCRIMED-Data-Boundary": "business-contact-workflow-scope-and-synthetic-demo-metadata-only",
        "X-SCRIMED-Demo-Session-Packet-Audited": "true"
      }
    }
  );
}
