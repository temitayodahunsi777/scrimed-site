import { NextResponse } from "next/server";
import { getAuthenticatedSalesContext } from "../../../../../lib/protectedPilotStore";
import {
  buildCrmOpportunityCsv,
  salesOperationsBoundary,
  salesOperationsNoStoreHeaders
} from "../../../../../lib/salesOperations";
import {
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
  const result = await getSalesOpportunity(context.client, intakeId);

  if (result.error || !result.opportunity) {
    return NextResponse.json(
      { error: { code: "sales-opportunity-not-found", message: "No tenant-scoped opportunity is available for this ID." } },
      { status: 404, headers: salesOperationsNoStoreHeaders }
    );
  }

  const audit = await recordSalesArtifactDownload(
    context.client,
    intakeId,
    "crm-export-downloaded",
    { format: "text/csv", vendorNeutral: true, noPhiBoundary: true }
  );

  if (audit.error) {
    return NextResponse.json(
      { error: { code: "crm-export-audit-failed", message: "The CRM export was not released because its audit event could not be committed." } },
      { status: 502, headers: salesOperationsNoStoreHeaders }
    );
  }

  const safeIntakeId = intakeId.replace(/[^a-z0-9-]/gi, "-");

  return new NextResponse(buildCrmOpportunityCsv(result.opportunity), {
    headers: {
      ...salesOperationsNoStoreHeaders,
      "Cache-Control": "private, no-store",
      "Content-Disposition": `attachment; filename="scrimed-${safeIntakeId}-crm-import.csv"`,
      "Content-Type": "text/csv; charset=utf-8",
      "X-SCRIMED-Data-Boundary": "business-contact-and-workflow-scope-only",
      "X-SCRIMED-Export-Audited": "true"
    }
  });
}
