import { NextResponse } from "next/server";
import { getAuthenticatedSalesContext } from "../../../../../../lib/protectedPilotStore";
import { salesOperationsBoundary } from "../../../../../../lib/salesOperations";
import { completeSalesFollowUp } from "../../../../../../lib/salesOperationsStore";
import {
  enforceRequestRateLimit,
  rateLimitHeaders
} from "../../../../../../lib/requestRateLimit";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ intakeId: string }>;
};

export async function POST(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "sales-follow-up-complete",
    limit: 30,
    windowSeconds: 600
  });
  const headers = rateLimitHeaders(rateLimit);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: { code: "rate-limit-exceeded", message: "Follow-up completion is temporarily rate limited." } },
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
  const result = await completeSalesFollowUp(context.client, intakeId);

  if (result.error || !result.opportunity) {
    return NextResponse.json(
      { error: { code: "sales-follow-up-completion-failed", message: "The follow-up completion and audit event could not be committed." } },
      { status: 502, headers }
    );
  }

  return NextResponse.json(
    { service: "scrimed-sales-operations", status: "follow-up-completed", opportunity: result.opportunity },
    { headers }
  );
}
