import { NextResponse } from "next/server";
import { getAuthenticatedPilotContext } from "../../../../lib/protectedPilotStore";
import {
  salesOperationsBoundary,
  validateSalesOpportunityUpdate
} from "../../../../lib/salesOperations";
import { updateSalesOpportunity } from "../../../../lib/salesOperationsStore";
import { enforceRequestRateLimit, rateLimitHeaders } from "../../../../lib/requestRateLimit";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ intakeId: string }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "sales-opportunity-update",
    limit: 60,
    windowSeconds: 600
  });
  const headers = rateLimitHeaders(rateLimit);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: { code: "rate-limit-exceeded", message: "Sales opportunity updates are temporarily rate limited." } },
      { status: 429, headers }
    );
  }

  const context = await getAuthenticatedPilotContext(request);

  if (!context.ok) {
    return NextResponse.json(
      { error: { code: context.code, message: context.message }, boundary: salesOperationsBoundary },
      { status: context.status, headers }
    );
  }

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json(
      { error: { code: "unsupported-content-type", message: "Sales updates must use application/json." } },
      { status: 415, headers }
    );
  }

  const rawBody = await request.text();

  if (rawBody.length > 3000) {
    return NextResponse.json(
      { error: { code: "payload-too-large", message: "Sales updates must remain concise and business-scope only." } },
      { status: 413, headers }
    );
  }

  let payload: unknown;

  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { error: { code: "invalid-json", message: "Request body must be valid JSON." } },
      { status: 400, headers }
    );
  }

  const validation = validateSalesOpportunityUpdate(payload);

  if (!validation.ok) {
    return NextResponse.json(
      { error: { code: "invalid-sales-opportunity-update", message: validation.message } },
      { status: 422, headers }
    );
  }

  const { intakeId } = await params;
  const result = await updateSalesOpportunity(context.client, intakeId, validation.update);

  if (result.error || !result.opportunity) {
    return NextResponse.json(
      {
        error: {
          code: "sales-opportunity-update-failed",
          message: "The opportunity update and append-only audit event could not be committed."
        }
      },
      { status: result.error?.message.includes("sales-operations-admin-required") ? 403 : 502, headers }
    );
  }

  return NextResponse.json(
    {
      service: "scrimed-sales-operations",
      status: "opportunity-updated",
      boundary: salesOperationsBoundary,
      opportunity: result.opportunity
    },
    { headers }
  );
}
