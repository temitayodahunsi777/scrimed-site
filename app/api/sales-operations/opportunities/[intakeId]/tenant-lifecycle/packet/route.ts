import { NextResponse } from "next/server";
import {
  buildBuyerTenantLifecyclePacket,
  buyerTenantLifecycleBoundary
} from "../../../../../../lib/buyerTenantLifecycle";
import { getAuthenticatedSalesContext } from "../../../../../../lib/protectedPilotStore";
import {
  salesOperationsBoundary,
  salesOperationsNoStoreHeaders
} from "../../../../../../lib/salesOperations";
import {
  getSalesOperationsDashboard,
  getSalesOpportunity,
  recordSalesBuyerTenantLifecyclePacketDownload
} from "../../../../../../lib/salesOperationsStore";

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
        boundary: buyerTenantLifecycleBoundary
      },
      {
        status: opportunityResult.error?.message.includes("sales-operations-admin-required") ? 403 : 404,
        headers: salesOperationsNoStoreHeaders
      }
    );
  }

  if (!opportunityResult.opportunity.buyerTenantLifecycle) {
    return NextResponse.json(
      {
        error: {
          code: "sales-buyer-tenant-lifecycle-not-activated",
          message: "Activate the buyer tenant lifecycle before releasing its lifecycle packet."
        },
        boundary: buyerTenantLifecycleBoundary
      },
      { status: 409, headers: salesOperationsNoStoreHeaders }
    );
  }

  if (dashboardResult.error || !dashboardResult.dashboard) {
    return NextResponse.json(
      {
        error: {
          code: "sales-buyer-tenant-lifecycle-dashboard-unavailable",
          message: "The lifecycle packet could not be generated because the tenant dashboard was unavailable."
        },
        boundary: buyerTenantLifecycleBoundary
      },
      { status: 502, headers: salesOperationsNoStoreHeaders }
    );
  }

  const audit = await recordSalesBuyerTenantLifecyclePacketDownload(context.client, intakeId);

  if (audit.error || !audit.result?.buyerTenantLifecycle) {
    return NextResponse.json(
      {
        error: {
          code: "sales-buyer-tenant-lifecycle-packet-audit-failed",
          message:
            "The lifecycle packet was not released because its append-only audit event could not be committed."
        },
        boundary: buyerTenantLifecycleBoundary
      },
      { status: 502, headers: salesOperationsNoStoreHeaders }
    );
  }

  const opportunityAuditEvents = dashboardResult.dashboard.auditEvents.filter(
    (event) => event.intakeId === intakeId
  );
  const auditEventId = audit.result.auditEventId ?? "committed";
  const safeIntakeId = intakeId.replace(/[^a-z0-9-]/gi, "-");

  return new NextResponse(
    buildBuyerTenantLifecyclePacket({
      generatedAt: new Date().toISOString(),
      auditEventId,
      generatedBy: context.user.id,
      opportunity: opportunityResult.opportunity,
      lifecycle: audit.result.buyerTenantLifecycle,
      appBaseUrl: appBaseUrl(request),
      auditEvents: opportunityAuditEvents
    }),
    {
      headers: {
        ...salesOperationsNoStoreHeaders,
        "Cache-Control": "private, no-store",
        "Content-Disposition": `attachment; filename="scrimed-${safeIntakeId}-buyer-tenant-lifecycle.md"`,
        "Content-Type": "text/markdown; charset=utf-8",
        "X-SCRIMED-Data-Boundary": "business-contact-and-workflow-scope-only",
        "X-SCRIMED-Buyer-Tenant-Lifecycle-Packet-Audited": "true"
      }
    }
  );
}
