import { NextResponse } from "next/server";
import {
  executionAttemptDurableStoreBoundary,
  executionAttemptDurableStoreHeaders,
  executionAttemptDurableStoreRecordRoute,
  executionAttemptDurableStoreRpcFailure,
  isExecutionAttemptDurableStoreEnabled,
  recordExecutionAttemptEnvelopeInDurableStore,
  validateExecutionAttemptDurableStoreRecordRequest
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
            message: "Execution-attempt durable store writes require application/json."
          },
          boundary: executionAttemptDurableStoreBoundary
        },
        { status: 415, headers }
      )
    };
  }

  const rawBody = await request.text();

  if (rawBody.length > 16000) {
    return {
      error: NextResponse.json(
        {
          error: {
            code: "payload-too-large",
            message: "Execution-attempt durable store payloads must remain concise and no-PHI."
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
    namespace: "execution-attempt-durable-record",
    limit: 20,
    windowSeconds: 600
  });
  const headers = { ...executionAttemptDurableStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Execution-attempt durable-store writes are temporarily rate limited."
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
            "Execution-attempt durable writes are disabled until the Supabase migration and authenticated AAL2 smoke are approved for this environment."
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
    route: executionAttemptDurableStoreRecordRoute,
    requestedAction: "execution attempt durable store record synthetic metadata-only evidence",
    inputText: JSON.stringify(body.payload),
    allowMetadataOnly: true
  });
  const guardedHeaders = { ...headers, ...scrimedSafetyHeaders(safety) };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "execution-attempt-durable-record-blocked",
          message: "Execution-attempt durable-store record is blocked by SCRIMED safety governance."
        },
        safety,
        boundary: executionAttemptDurableStoreBoundary
      },
      { status: safety.statusCode, headers: guardedHeaders }
    );
  }

  const validation = validateExecutionAttemptDurableStoreRecordRequest(body.payload);

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

  const result = await recordExecutionAttemptEnvelopeInDurableStore(context.client, validation.value);

  if (result.error || !result.record) {
    const failure = executionAttemptDurableStoreRpcFailure(
      result.error,
      "execution-attempt-durable-record-failed"
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
      status: result.idempotentReplay ? "execution-attempt-idempotent-replay" : "execution-attempt-recorded",
      persisted: result.persisted,
      eventId: result.eventId,
      record: result.record,
      boundary: result.boundary || executionAttemptDurableStoreBoundary
    },
    { status: result.idempotentReplay ? 200 : 201, headers: guardedHeaders }
  );
}
