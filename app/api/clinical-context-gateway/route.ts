import { NextResponse } from "next/server";
import {
  clinicalContextGatewayStatus,
  evaluateClinicalContextGatewayRequest,
  getClinicalContextGatewaySummary,
  isClinicalContextGatewayRequest
} from "../../lib/clinicalContextGateway";
import {
  evaluateScrimedSafetyGate,
  scrimedSafetyHeaders
} from "../../lib/scrimedSafetyGovernance";

function clinicalContextGatewayHeaders(safety: ReturnType<typeof evaluateScrimedSafetyGate>) {
  return {
    "Cache-Control": "private, no-store",
    "X-SCRIMED-Clinical-Context-Gateway": clinicalContextGatewayStatus,
    "X-SCRIMED-Data-Boundary": "governed-semantic-context-only-no-live-phi",
    "X-SCRIMED-Raw-Schema-Access": "blocked",
    "X-SCRIMED-Raw-Connector-Payload": "blocked",
    "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
    "X-SCRIMED-Record-Mutation": "not-authorized",
    "X-SCRIMED-Patient-Outreach": "not-authorized",
    "X-SCRIMED-Payer-Submission": "not-authorized",
    ...scrimedSafetyHeaders(safety)
  };
}

export async function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: "/api/clinical-context-gateway",
    requestedAction: "clinical context gateway metadata semantic envelope readiness",
    inputText: "metadata-only semantic context gateway audit readiness no phi no clinical action",
    allowMetadataOnly: true
  });
  const headers = clinicalContextGatewayHeaders(safety);

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: "clinical-context-gateway-blocked",
        safety
      },
      {
        status: safety.statusCode,
        headers
      }
    );
  }

  return NextResponse.json(
    {
      ...getClinicalContextGatewaySummary(),
      safety
    },
    {
      headers
    }
  );
}

export async function POST(request: Request) {
  const safety = evaluateScrimedSafetyGate({
    route: "/api/clinical-context-gateway",
    requestedAction: "clinical context gateway structured semantic context request",
    inputText: "metadata-only semantic context request no raw records no phi no downstream execution",
    allowMetadataOnly: true
  });
  const headers = clinicalContextGatewayHeaders(safety);

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: "clinical-context-gateway-blocked",
        safety
      },
      {
        status: safety.statusCode,
        headers
      }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: "invalid-json",
        message: "Request body must be valid JSON matching the Clinical Context Gateway request contract."
      },
      {
        status: 400,
        headers
      }
    );
  }

  if (!isClinicalContextGatewayRequest(body)) {
    return NextResponse.json(
      {
        error: "invalid-context-gateway-request",
        message:
          "Clinical Context Gateway only accepts strict metadata fields; raw patient text, identifiers, records, schemas, connector payloads, and credentials are not accepted."
      },
      {
        status: 400,
        headers
      }
    );
  }

  const decision = evaluateClinicalContextGatewayRequest(body);

  return NextResponse.json(
    {
      service: "scrimed-clinical-context-gateway",
      decision,
      safety
    },
    {
      status: decision.statusCode,
      headers
    }
  );
}
