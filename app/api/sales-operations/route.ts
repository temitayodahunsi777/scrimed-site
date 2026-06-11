import { NextResponse } from "next/server";
import { getAuthenticatedSalesContext } from "../../lib/protectedPilotStore";
import { getSalesOperationsSummary } from "../../lib/salesOperations";
import { getSalesOperationsDashboard } from "../../lib/salesOperationsStore";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const context = await getAuthenticatedSalesContext(request);
  const summary = getSalesOperationsSummary();

  if (!context.ok) {
    return NextResponse.json(
      { error: { code: context.code, message: context.message }, boundary: summary.boundary },
      { status: context.status }
    );
  }

  const result = await getSalesOperationsDashboard(context.client);

  if (result.error || !result.dashboard) {
    return NextResponse.json(
      {
        error: {
          code: "sales-operations-query-failed",
          message: "The tenant-admin sales operations dashboard could not be retrieved."
        },
        boundary: summary.boundary
      },
      { status: result.error?.message.includes("sales-operations-admin-required") ? 403 : 502 }
    );
  }

  return NextResponse.json({
    ...summary,
    authenticatedUserId: context.user.id,
    dashboard: result.dashboard
  });
}
