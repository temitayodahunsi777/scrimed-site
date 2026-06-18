import { NextResponse } from "next/server";
import {
  deriveSalesCommandCenter,
  salesCommandCenterBoundary
} from "../../../../../lib/salesCommandCenter";
import {
  getAuthenticatedSalesContext,
  listCommandIntelligenceSnapshots,
  listPilotAuditEvents
} from "../../../../../lib/protectedPilotStore";
import {
  salesOperationsBoundary,
  salesOperationsNoStoreHeaders
} from "../../../../../lib/salesOperations";
import {
  getSalesOperationsDashboard,
  getSalesOpportunity
} from "../../../../../lib/salesOperationsStore";
import { enforceRequestRateLimit, rateLimitHeaders } from "../../../../../lib/requestRateLimit";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ intakeId: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "sales-command-center-read",
    limit: 60,
    windowSeconds: 600
  });
  const headers = { ...salesOperationsNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Sales Command Center reads are temporarily rate limited."
        },
        boundary: salesCommandCenterBoundary
      },
      { status: 429, headers }
    );
  }

  const context = await getAuthenticatedSalesContext(request);

  if (!context.ok) {
    return NextResponse.json(
      { error: { code: context.code, message: context.message }, boundary: salesOperationsBoundary },
      { status: context.status, headers }
    );
  }

  const { intakeId } = await params;
  const opportunityResult = await getSalesOpportunity(context.client, intakeId);

  if (opportunityResult.error || !opportunityResult.opportunity) {
    return NextResponse.json(
      {
        error: {
          code: "sales-opportunity-not-found",
          message: "No tenant-scoped opportunity is available for this ID."
        },
        boundary: salesCommandCenterBoundary
      },
      {
        status: opportunityResult.error?.message.includes("sales-operations-admin-required") ? 403 : 404,
        headers
      }
    );
  }

  const opportunity = opportunityResult.opportunity;
  const workspaceId = opportunity.workspaceProvisioning?.workspaceId ?? null;
  const dashboardResult = await getSalesOperationsDashboard(context.client);
  const salesAuditEvents = dashboardResult.dashboard
    ? dashboardResult.dashboard.auditEvents.filter((event) => event.intakeId === opportunity.intakeId)
    : [];

  let commandSnapshotsResult: Awaited<ReturnType<typeof listCommandIntelligenceSnapshots>> = {
    snapshots: [],
    error: null
  };
  let pilotAuditResult: Awaited<ReturnType<typeof listPilotAuditEvents>> = {
    events: [],
    error: null
  };

  if (workspaceId) {
    [commandSnapshotsResult, pilotAuditResult] = await Promise.all([
      listCommandIntelligenceSnapshots(context.client, workspaceId),
      listPilotAuditEvents(context.client, workspaceId)
    ]);
  }

  const degradedSections = [
    workspaceId ? "" : "Buyer-specific protected workspace is not provisioned yet.",
    dashboardResult.error ? "Sales opportunity audit events could not be retrieved." : "",
    commandSnapshotsResult.error ? "Command Intelligence snapshots could not be retrieved." : "",
    pilotAuditResult.error ? "Protected workspace audit events could not be retrieved." : ""
  ].filter(Boolean);
  const commandCenter = deriveSalesCommandCenter({
    opportunity,
    salesAuditEvents,
    pilotAuditEvents: pilotAuditResult.error ? [] : pilotAuditResult.events,
    commandSnapshots: commandSnapshotsResult.error ? [] : commandSnapshotsResult.snapshots,
    degradedSections
  });

  return NextResponse.json(
    {
      service: commandCenter.service,
      boundary: commandCenter.boundary,
      commandCenter
    },
    { headers }
  );
}
