import { NextResponse } from "next/server";
import {
  assessProofPacketShareReadiness,
  getProofPacketShareReadinessSummary,
  proofPacketShareReadinessApiRoute,
  proofPacketShareReadinessStatus,
  validateProofPacketShareReadinessInput
} from "../../../lib/proofPacketShareReadiness";
import { enforceRequestRateLimit, rateLimitHeaders } from "../../../lib/requestRateLimit";
import {
  evaluateScrimedSafetyGate,
  scrimedSafetyHeaders
} from "../../../lib/scrimedSafetyGovernance";

export const dynamic = "force-dynamic";

function baseHeaders(safety: ReturnType<typeof evaluateScrimedSafetyGate>) {
  return {
    "Cache-Control": "private, no-store",
    "X-Robots-Tag": "noindex, nofollow",
    "X-SCRIMED-Proof-Share-Readiness": proofPacketShareReadinessStatus,
    "X-SCRIMED-Data-Boundary": "synthetic-no-phi-no-pii-metadata-only",
    "X-SCRIMED-External-Distribution": "not-authorized",
    "X-SCRIMED-Investment-Solicitation": "not-authorized",
    ...scrimedSafetyHeaders(safety)
  };
}

function evaluateSafety() {
  return evaluateScrimedSafetyGate({
    route: proofPacketShareReadinessApiRoute,
    requestedAction:
      "assess metadata-only proof packet protected distribution handoff readiness without sending or approval",
    inputText:
      "synthetic no-phi no-pii packet fingerprint recipient category protected handoff metadata",
    allowMetadataOnly: true
  });
}

export function GET() {
  const safety = evaluateSafety();
  const headers = baseHeaders(safety);

  if (!safety.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "proof-packet-share-readiness-blocked",
          message: "Proof packet share-readiness metadata is blocked by safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return NextResponse.json(
    { ok: true, data: getProofPacketShareReadinessSummary() },
    { headers }
  );
}

export async function POST(request: Request) {
  const safety = evaluateSafety();
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "proof-packet-share-readiness",
    limit: 20,
    windowSeconds: 600
  });
  const headers = {
    ...baseHeaders(safety),
    ...rateLimitHeaders(rateLimit)
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "proof-packet-share-readiness-blocked",
          message: "Proof packet share-readiness metadata is blocked by safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "rate-limit-exceeded",
          message: "Share-readiness assessment is temporarily rate limited."
        }
      },
      { status: 429, headers }
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");

  if (contentLength > 8000) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "payload-too-large",
          message: "Share-readiness input must contain bounded metadata only."
        }
      },
      { status: 413, headers }
    );
  }

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "unsupported-content-type",
          message: "Submit share-readiness input as application/json."
        }
      },
      { status: 415, headers }
    );
  }

  const bodyText = await request.text();

  if (new TextEncoder().encode(bodyText).byteLength > 8000) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "payload-too-large",
          message: "Share-readiness input must contain bounded metadata only."
        }
      },
      { status: 413, headers }
    );
  }

  let payload: unknown;

  try {
    payload = JSON.parse(bodyText);
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "invalid-json",
          message: "Request body must be valid JSON."
        }
      },
      { status: 400, headers }
    );
  }

  const validation = validateProofPacketShareReadinessInput(payload);

  if (!validation.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "invalid-proof-packet-share-readiness-input",
          message:
            "Share-readiness input must use a canonical packet fingerprint and contain no recipient identity or free text.",
          fields: validation.errors
        }
      },
      { status: 400, headers }
    );
  }

  const assessment = assessProofPacketShareReadiness(validation.input);

  return NextResponse.json(
    { ok: assessment.decision !== "BLOCKED", data: assessment },
    { status: assessment.decision === "BLOCKED" ? 422 : 200, headers }
  );
}
