import { NextResponse } from "next/server";
import { getAuthenticatedSalesContext } from "../../../../../lib/protectedPilotStore";
import {
  buildSalesFollowUpDraft,
  salesOperationsBoundary
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
      { status: context.status }
    );
  }

  const { intakeId } = await params;
  const result = await getSalesOpportunity(context.client, intakeId);

  if (result.error || !result.opportunity) {
    return NextResponse.json(
      { error: { code: "sales-opportunity-not-found", message: "No tenant-scoped opportunity is available for this ID." } },
      { status: 404 }
    );
  }

  const audit = await recordSalesArtifactDownload(
    context.client,
    intakeId,
    "follow-up-draft-downloaded",
    { format: "message/rfc822", requiresHumanReview: true, noPhiBoundary: true }
  );

  if (audit.error) {
    return NextResponse.json(
      { error: { code: "follow-up-draft-audit-failed", message: "The follow-up draft was not released because its audit event could not be committed." } },
      { status: 502 }
    );
  }

  const safeIntakeId = intakeId.replace(/[^a-z0-9-]/gi, "-");

  return new NextResponse(buildSalesFollowUpDraft(result.opportunity), {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": `attachment; filename="scrimed-${safeIntakeId}-follow-up.eml"`,
      "Content-Type": "message/rfc822; charset=utf-8",
      "X-SCRIMED-Human-Review-Required": "true",
      "X-SCRIMED-Export-Audited": "true"
    }
  });
}
