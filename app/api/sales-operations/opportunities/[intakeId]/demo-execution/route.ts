import { NextResponse } from "next/server";
import {
  buildBuyerDemoExecutionPath,
  buyerDemoExecutionPathBoundary
} from "../../../../../lib/buyerDemoExecutionPath";
import { getAuthenticatedSalesContext } from "../../../../../lib/protectedPilotStore";
import {
  salesOperationsBoundary,
  salesOperationsNoStoreHeaders
} from "../../../../../lib/salesOperations";
import {
  getSalesOperationsDashboard,
  getSalesOpportunity
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
        boundary: buyerDemoExecutionPathBoundary
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
          code: "sales-demo-execution-dashboard-unavailable",
          message: "The demo execution path could not be generated because the tenant dashboard was unavailable."
        },
        boundary: buyerDemoExecutionPathBoundary
      },
      { status: 502, headers: salesOperationsNoStoreHeaders }
    );
  }

  const opportunityAuditEvents = dashboardResult.dashboard.auditEvents.filter(
    (event) => event.intakeId === intakeId
  );

  return NextResponse.json(
    {
      buyerDemoExecutionPath: buildBuyerDemoExecutionPath({
        opportunity: opportunityResult.opportunity,
        auditEvents: opportunityAuditEvents,
        appBaseUrl: appBaseUrl(request)
      }),
      boundary: buyerDemoExecutionPathBoundary
    },
    {
      headers: {
        ...salesOperationsNoStoreHeaders,
        "X-SCRIMED-Demo-Execution-Path": "authenticated-no-phi-operator-runbook",
        "X-SCRIMED-Source-Of-Truth": "existing-audited-packet-routes"
      }
    }
  );
}
