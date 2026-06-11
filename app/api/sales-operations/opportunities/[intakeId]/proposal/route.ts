import { NextResponse } from "next/server";
import { getAuthenticatedSalesContext } from "../../../../../lib/protectedPilotStore";
import {
  buildSalesOpportunityProposal,
  salesOperationsBoundary,
  salesOperationsNoStoreHeaders
} from "../../../../../lib/salesOperations";
import {
  getSalesOpportunity,
  recordSalesProposalDownload
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
      {
        status: result.error?.message.includes("sales-operations-admin-required") ? 403 : 404,
        headers: salesOperationsNoStoreHeaders
      }
    );
  }

  const audit = await recordSalesProposalDownload(context.client, intakeId);

  if (audit.error) {
    return NextResponse.json(
      {
        error: {
          code: "sales-proposal-audit-failed",
          message: "The proposal was not released because its append-only download event could not be committed."
        }
      },
      { status: 502, headers: salesOperationsNoStoreHeaders }
    );
  }

  const safeIntakeId = intakeId.replace(/[^a-z0-9-]/gi, "-");

  return new NextResponse(buildSalesOpportunityProposal(result.opportunity), {
    headers: {
      ...salesOperationsNoStoreHeaders,
      "Cache-Control": "private, no-store",
      "Content-Disposition": `attachment; filename="scrimed-${safeIntakeId}-opportunity-proposal.md"`,
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Data-Boundary": "business-contact-and-workflow-scope-only",
      "X-SCRIMED-Proposal-Audited": "true"
    }
  });
}
