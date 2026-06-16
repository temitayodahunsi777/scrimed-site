import { NextResponse } from "next/server";
import {
  buildAttributionAnalyticsFromOpportunities,
  buildAttributionAnalyticsPacket
} from "../../../../../lib/attributionAnalytics";
import { getAuthenticatedSalesContext } from "../../../../../lib/protectedPilotStore";
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
      { error: { code: "sales-opportunity-not-found", message: "No tenant-scoped opportunity is available for this ID." } },
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
          code: "sales-attribution-packet-dashboard-unavailable",
          message: "The tenant attribution packet could not be generated because the tenant dashboard was unavailable."
        },
        boundary: salesOperationsBoundary
      },
      { status: 502, headers: salesOperationsNoStoreHeaders }
    );
  }

  const report = buildAttributionAnalyticsFromOpportunities(dashboardResult.dashboard.opportunities);
  const audit = await recordSalesArtifactDownload(
    context.client,
    intakeId,
    "crm-export-downloaded",
    {
      artifactKind: "attribution-analytics-packet",
      format: "text/markdown",
      noPhiBoundary: true,
      tenantScoped: true,
      reportStatus: report.status,
      reportMode: report.mode,
      recordCount: report.totals.recordCount,
      cohortCount: report.cohorts.length,
      auditSchemaWorkaround:
        "Recorded under crm-export-downloaded until a dedicated attribution-analytics-packet-downloaded audit event is migrated."
    }
  );

  if (audit.error) {
    return NextResponse.json(
      {
        error: {
          code: "sales-attribution-packet-audit-failed",
          message: "The attribution analytics packet was not released because its append-only audit event could not be committed."
        }
      },
      { status: 502, headers: salesOperationsNoStoreHeaders }
    );
  }

  const safeIntakeId = intakeId.replace(/[^a-z0-9-]/gi, "-");
  const packet = buildAttributionAnalyticsPacket({
    report,
    generatedFor: opportunityResult.opportunity.payload.organization.name,
    generatedBy: context.user.id,
    auditMode: "existing-sales-artifact-event"
  });

  return new NextResponse(packet, {
    headers: {
      ...salesOperationsNoStoreHeaders,
      "Cache-Control": "private, no-store",
      "Content-Disposition": `attachment; filename="scrimed-${safeIntakeId}-attribution-analytics-packet.md"`,
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Data-Boundary": "business-contact-and-workflow-scope-only",
      "X-SCRIMED-Export-Audited": "true",
      "X-SCRIMED-Audit-Event": "crm-export-downloaded",
      "X-SCRIMED-Audit-Workaround": "attribution-analytics-packet"
    }
  });
}
