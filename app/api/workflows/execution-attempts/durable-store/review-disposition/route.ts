import { NextResponse } from "next/server";
import {
  executionAttemptDurableStoreBoundary,
  executionAttemptDurableStoreHeaders,
  executionAttemptDurableStoreReviewDispositionRoute,
  executionAttemptDurableStoreRpcFailure,
  isExecutionAttemptDurableStoreEnabled,
  recordExecutionAttemptReviewDispositionInDurableStore,
  validateExecutionAttemptDurableStoreReviewRequest
} from "../../../../../lib/executionAttemptDurableStore";
import { getAuthenticatedGovernanceContext } from "../../../../../lib/protectedPilotStore";
import { enforceRequestRateLimit, rateLimitHeaders } from "../../../../../lib/requestRateLimit";
import {
  evaluateScrimedSafetyGate,
  scrimedSafetyHeaders
} from "../../../../../lib/scrimedSafetyGovernance";

export const dynamic = "force-dynamic";

async function readBoundedJson(request: Request, headers: HeadersInit) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return {
      error: NextResponse.json(
        {
          error: {
            code: "unsupported-content-type",
            message: "Execution-attempt review dispositions require application/json."
          },
          boundary: executionAttemptDurableStoreBoundary
        },
        { status: 415, headers }
      )
    };
  }

  const rawBody = await request.text();

  if (rawBody.length > 12000) {
    return {
      error: NextResponse.json(
        {
          error: {
            code: "payload-too-large",
            message: "Execution-attempt review-disposition payloads must remain concise and no-PHI."
          },
          boundary: executionAttemptDurableStoreBoundary
        },
        { status: 413, headers }
      )
    };
  }

  try {
    return { payload: JSON.parse(rawBody) as unknown };
  } catch {
    return {
      error: NextResponse.json(
        {
          error: { code: "invalid-json", message: "Request body must be valid JSON." },
          boundary: executionAttemptDurableStoreBoundary
        },
        { status: 400, headers }
      )
    };
  }
}

export async function POST(request: Request) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "execution-attempt-review-disposition",
    limit: 24,
    windowSeconds: 600
  });
  const headers = { ...executionAttemptDurableStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Execution-attempt review dispositions are temporarily rate limited."
        },
        boundary: executionAttemptDurableStoreBoundary
      },
      { status: 429, headers }
    );
  }

  if (!isExecutionAttemptDurableStoreEnabled()) {
    return NextResponse.json(
      {
        error: {
          code: "execution-attempt-durable-store-disabled",
          message:
            "Execution-attempt review dispositions are disabled until the Supabase migration and authenticated AAL2 smoke are approved for this environment."
        },
        boundary: executionAttemptDurableStoreBoundary
      },
      { status: 503, headers }
    );
  }

  const context = await getAuthenticatedGovernanceContext(request);

  if (!context.ok) {
    return NextResponse.json(
      { error: { code: context.code, message: context.message }, boundary: executionAttemptDurableStoreBoundary },
      { status: context.status, headers }
    );
  }

  const body = await readBoundedJson(request, headers);

  if (body.error) {
    return body.error;
  }

  const safety = evaluateScrimedSafetyGate({
    route: executionAttemptDurableStoreReviewDispositionRoute,
    requestedAction: "execution attempt durable store review disposition synthetic metadata-only evidence",
    inputText: JSON.stringify(body.payload),
    allowMetadataOnly: true
  });
  const guardedHeaders = { ...headers, ...scrimedSafetyHeaders(safety) };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "execution-attempt-review-disposition-blocked",
          message: "Execution-attempt review disposition is blocked by SCRIMED safety governance."
        },
        safety,
        boundary: executionAttemptDurableStoreBoundary
      },
      { status: safety.statusCode, headers: guardedHeaders }
    );
  }

  const validation = validateExecutionAttemptDurableStoreReviewRequest(body.payload);

  if (!validation.ok) {
    return NextResponse.json(
      {
        service: "scrimed-execution-attempt-durable-store",
        status: "validation-failed",
        errors: validation.errors,
        boundary: executionAttemptDurableStoreBoundary
      },
      { status: 400, headers: guardedHeaders }
    );
  }

  const result = await recordExecutionAttemptReviewDispositionInDurableStore(
    context.client,
    validation.value
  );

  if (result.error || !result.dispositionId || !result.record) {
    const failure = executionAttemptDurableStoreRpcFailure(
      result.error,
      "execution-attempt-review-disposition-failed"
    );

    return NextResponse.json(
      {
        error: {
          code: failure.code,
          message: failure.message
      },
      boundary: executionAttemptDurableStoreBoundary
    },
      { status: failure.status, headers: guardedHeaders }
    );
  }

  return NextResponse.json(
    {
      service: "scrimed-execution-attempt-durable-store",
      status: "execution-attempt-review-disposition-recorded",
      dispositionId: result.dispositionId,
      eventId: result.eventId,
      record: result.record,
      boundary: result.boundary || executionAttemptDurableStoreBoundary
    },
    { status: 201, headers: guardedHeaders }
  );
}
