import { NextResponse } from "next/server";
import { getAuthenticatedSalesContext } from "../../../../../lib/protectedPilotStore";
import {
  buildAssessmentInvitation,
  salesOperationsBoundary,
  validateSalesAssessmentSchedule
} from "../../../../../lib/salesOperations";
import { scheduleSalesAssessment } from "../../../../../lib/salesOperationsStore";
import {
  enforceRequestRateLimit,
  rateLimitHeaders
} from "../../../../../lib/requestRateLimit";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ intakeId: string }>;
};

export async function POST(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "sales-assessment-invitation",
    limit: 20,
    windowSeconds: 600
  });
  const headers = rateLimitHeaders(rateLimit);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: { code: "rate-limit-exceeded", message: "Assessment invitation generation is temporarily rate limited." } },
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

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json(
      { error: { code: "unsupported-content-type", message: "Assessment schedules must use application/json." } },
      { status: 415, headers }
    );
  }

  const rawBody = await request.text();

  if (rawBody.length > 2000) {
    return NextResponse.json(
      { error: { code: "payload-too-large", message: "Assessment schedule payload exceeds the allowed business-scope length." } },
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

  const validation = validateSalesAssessmentSchedule(payload);

  if (!validation.ok) {
    return NextResponse.json(
      { error: { code: "invalid-assessment-schedule", message: validation.message } },
      { status: 422, headers }
    );
  }

  const { intakeId } = await params;
  const result = await scheduleSalesAssessment(context.client, intakeId, validation.schedule);

  if (result.error || !result.opportunity) {
    return NextResponse.json(
      { error: { code: "assessment-invitation-failed", message: "The assessment invitation and audit event could not be committed." } },
      { status: 502, headers }
    );
  }

  const safeIntakeId = intakeId.replace(/[^a-z0-9-]/gi, "-");

  return new NextResponse(buildAssessmentInvitation(result.opportunity), {
    headers: {
      ...headers,
      "Cache-Control": "private, no-store",
      "Content-Disposition": `attachment; filename="scrimed-${safeIntakeId}-enterprise-assessment.ics"`,
      "Content-Type": "text/calendar; charset=utf-8; method=REQUEST",
      "X-SCRIMED-Data-Boundary": "business-contact-and-workflow-scope-only",
      "X-SCRIMED-Invitation-Audited": "true"
    }
  });
}
