import { NextResponse } from "next/server";

import {
  getDocumentationBeforeAuthorizationSummary,
  runDocumentationBeforeAuthorizationWorkbench
} from "../../lib/documentationBeforeAuthorization";
import {
  evaluateScrimedSafetyGate,
  scrimedSafetyHeaders
} from "../../lib/scrimedSafetyGovernance";

export const dynamic = "force-dynamic";

const route = "/api/documentation-before-authorization";

function workbenchHeaders() {
  const safety = evaluateScrimedSafetyGate({
    route,
    requestedAction: "synthetic no-phi documentation readiness evaluation and human review packet preparation",
    inputText: "synthetic registered fixtures only, decision support, no payer action, no external communication",
    allowMetadataOnly: true
  });

  return {
    safety,
    headers: {
      "Cache-Control": "private, no-store",
      "X-SCRIMED-Product": "payeriq-documentation-before-authorization",
      "X-SCRIMED-Data-Boundary": "synthetic-only",
      "X-SCRIMED-Payer-Submission": "not-authorized",
      "X-SCRIMED-EHR-Writeback": "not-authorized",
      "X-SCRIMED-External-Communication": "not-authorized",
      "X-SCRIMED-Human-Review": "required",
      ...scrimedSafetyHeaders(safety)
    }
  };
}

export function GET() {
  const { safety, headers } = workbenchHeaders();

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "documentation-workbench-safety-blocked",
          message: "PayerIQ documentation readiness is blocked by central safety governance."
        }
      },
      { status: safety.statusCode, headers }
    );
  }

  return NextResponse.json(getDocumentationBeforeAuthorizationSummary(), { headers });
}

export async function POST(request: Request) {
  const { safety, headers } = workbenchHeaders();

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "documentation-workbench-safety-blocked",
          message: "PayerIQ documentation readiness is blocked by central safety governance."
        }
      },
      { status: safety.statusCode, headers }
    );
  }

  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return NextResponse.json(
      {
        error: {
          code: "unsupported-content-type",
          message: "PayerIQ workbench requests must use application/json."
        }
      },
      { status: 415, headers }
    );
  }

  const rawBody = await request.text();

  if (rawBody.length > 8_000) {
    return NextResponse.json(
      {
        error: {
          code: "payload-too-large",
          message: "PayerIQ accepts concise enumerated synthetic metadata only."
        }
      },
      { status: 413, headers }
    );
  }

  let payload: unknown;

  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "invalid-json",
          message: "Request body must be valid JSON."
        }
      },
      { status: 400, headers }
    );
  }

  const result = runDocumentationBeforeAuthorizationWorkbench(payload);

  if (!result.valid) {
    return NextResponse.json(
      {
        error: {
          code: "invalid-documentation-workbench-request",
          message: "The synthetic documentation packet did not pass validation.",
          details: result.errors
        }
      },
      { status: 422, headers }
    );
  }

  if (result.packet.status === "request-blocked") {
    return NextResponse.json(
      {
        status: result.packet.status,
        error: {
          code: "payer-action-denied",
          message: "Payer-facing action is denied. A synthetic review packet was retained as safety evidence."
        },
        packet: result.packet
      },
      { status: 423, headers }
    );
  }

  return NextResponse.json(
    {
      status: result.packet.status,
      packet: result.packet
    },
    { status: 200, headers }
  );
}
