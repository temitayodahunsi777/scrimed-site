import { NextResponse } from "next/server";
import { enforceRequestRateLimit, rateLimitHeaders } from "../../../lib/requestRateLimit";
import {
  evaluateTrustOSRequest,
  getTrustOSSummary,
  validateTrustOSPayload
} from "../../../lib/trustOS";

export const dynamic = "force-dynamic";

const noStoreHeaders = {
  "Cache-Control": "private, no-store"
} as const;

export async function GET() {
  const summary = getTrustOSSummary();

  return NextResponse.json(
    {
      service: "scrimed-trustos-evaluation-engine",
      status: summary.status,
      boundary: summary.boundary,
      scenarios: summary.scenarios,
      modelRouteProfiles: summary.modelRouteProfiles,
      evidenceSources: summary.evidenceSources,
      requiredFields: [
        "mode",
        "workflow",
        "objective",
        "requestedAction",
        "dataClassification",
        "actionRisk",
        "requestedTools",
        "requestedModelProfile",
        "evidenceSourceIds",
        "humanReviewRole",
        "dataBoundaryAcknowledged"
      ]
    },
    { headers: noStoreHeaders }
  );
}

export async function POST(request: Request) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "trust-os-evaluation",
    limit: 20,
    windowSeconds: 600
  });
  const headers = { ...noStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: "rate-limit-exceeded",
        message: "TrustOS evaluation is temporarily rate limited."
      },
      { status: 429, headers }
    );
  }

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json(
      {
        error: "unsupported-content-type",
        message: "TrustOS evaluations must use application/json."
      },
      { status: 415, headers }
    );
  }

  const rawBody = await request.text();

  if (rawBody.length > 18000) {
    return NextResponse.json(
      {
        error: "payload-too-large",
        message: "TrustOS accepts concise workflow-level evaluation requests only."
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
        error: "invalid-json",
        message: "Request body must be valid JSON."
      },
      { status: 400, headers }
    );
  }

  const validation = validateTrustOSPayload(payload);

  if (!validation.valid) {
    return NextResponse.json(
      {
        error: "invalid-trustos-request",
        errors: validation.errors
      },
      { status: 422, headers }
    );
  }

  const decision = evaluateTrustOSRequest(validation.request);
  const status = decision.decision === "deny" ? 423 : decision.decision === "escalate-human-review" ? 202 : 200;

  return NextResponse.json({ status: decision.decision, decision }, { status, headers });
}
