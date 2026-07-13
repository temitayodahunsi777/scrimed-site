import { NextResponse } from "next/server";
import {
  executionAttemptDurableStoreBoundary,
  executionAttemptDurableStoreHeaders,
  executionAttemptDurableStoreReplayRoute,
  executionAttemptDurableStoreRpcFailure,
  isExecutionAttemptDurableStoreEnabled,
  replayExecutionAttemptEnvelopeFromDurableStore,
  validateExecutionAttemptDurableStoreReplayRequest
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
            message: "Execution-attempt durable-store replay requires application/json."
          },
          boundary: executionAttemptDurableStoreBoundary
        },
        { status: 415, headers }
      )
    };
  }

  const rawBody = await request.text();

  if (rawBody.length > 8000) {
    return {
      error: NextResponse.json(
        {
          error: {
            code: "payload-too-large",
            message: "Execution-attempt replay payloads must remain concise and no-PHI."
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
    namespace: "execution-attempt-durable-replay",
    limit: 40,
    windowSeconds: 600
  });
  const headers = { ...executionAttemptDurableStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Execution-attempt durable-store replay is temporarily rate limited."
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
            "Execution-attempt durable replay is disabled until the Supabase migration and authenticated AAL2 smoke are approved for this environment."
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
    route: executionAttemptDurableStoreReplayRoute,
    requestedAction: "execution attempt durable store replay synthetic metadata-only evidence",
    inputText: JSON.stringify(body.payload),
    allowMetadataOnly: true
  });
  const guardedHeaders = { ...headers, ...scrimedSafetyHeaders(safety) };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "execution-attempt-durable-replay-blocked",
          message: "Execution-attempt durable-store replay is blocked by SCRIMED safety governance."
        },
        safety,
        boundary: executionAttemptDurableStoreBoundary
      },
      { status: safety.statusCode, headers: guardedHeaders }
    );
  }

  const validation = validateExecutionAttemptDurableStoreReplayRequest(body.payload);

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

  const result = await replayExecutionAttemptEnvelopeFromDurableStore(context.client, validation.value);

  if (result.error || !result.record) {
    const failure = executionAttemptDurableStoreRpcFailure(
      result.error,
      "execution-attempt-durable-replay-failed"
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
      status: "execution-attempt-metadata-replayed",
      replayed: result.replayed,
      eventId: result.eventId,
      record: result.record,
      boundary: result.boundary || executionAttemptDurableStoreBoundary
    },
    { headers: guardedHeaders }
  );
}
