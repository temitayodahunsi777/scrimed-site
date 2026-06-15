import { NextResponse } from "next/server";
import { buildAttributionAnalyticsFromOpportunities } from "../../../lib/attributionAnalytics";
import { getAuthenticatedSalesContext } from "../../../lib/protectedPilotStore";
import {
  salesOperationsBoundary,
  salesOperationsNoStoreHeaders
} from "../../../lib/salesOperations";
import { getSalesOperationsDashboard } from "../../../lib/salesOperationsStore";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const context = await getAuthenticatedSalesContext(request);

  if (!context.ok) {
    return NextResponse.json(
      { error: { code: context.code, message: context.message }, boundary: salesOperationsBoundary },
      { status: context.status, headers: salesOperationsNoStoreHeaders }
    );
  }

  const result = await getSalesOperationsDashboard(context.client);

  if (result.error || !result.dashboard) {
    return NextResponse.json(
      {
        error: {
          code: "sales-attribution-analytics-query-failed",
          message: "The tenant-admin attribution analytics report could not be retrieved."
        },
        boundary: salesOperationsBoundary
      },
      {
        status: result.error?.message.includes("sales-operations-admin-required") ? 403 : 502,
        headers: salesOperationsNoStoreHeaders
      }
    );
  }

  return NextResponse.json(
    {
      authenticatedUserId: context.user.id,
      tenantId: result.dashboard.tenantId,
      report: buildAttributionAnalyticsFromOpportunities(result.dashboard.opportunities)
    },
    { headers: salesOperationsNoStoreHeaders }
  );
}
