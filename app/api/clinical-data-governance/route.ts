import { NextResponse } from "next/server";
import {
  clinicalDataGovernanceStatus,
  evaluateClinicalDataGovernanceRequest,
  getClinicalDataGovernanceSummary,
  isClinicalDataGovernanceRequest
} from "../../lib/clinicalDataGovernance";
import {
  evaluateScrimedSafetyGate,
  scrimedSafetyHeaders
} from "../../lib/scrimedSafetyGovernance";

function clinicalDataGovernanceHeaders(safety: ReturnType<typeof evaluateScrimedSafetyGate>) {
  return {
    "Cache-Control": "private, no-store",
    "X-SCRIMED-Clinical-Data-Governance": clinicalDataGovernanceStatus,
    "X-SCRIMED-Data-Boundary": "metadata-and-policy-only-no-live-phi",
    "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
    "X-SCRIMED-Record-Mutation": "not-authorized",
    "X-SCRIMED-Patient-Outreach": "not-authorized",
    "X-SCRIMED-Payer-Submission": "not-authorized",
    "X-SCRIMED-External-Model-PHI": "not-authorized",
    ...scrimedSafetyHeaders(safety)
  };
}

export async function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: "/api/clinical-data-governance",
    requestedAction: "clinical data governance metadata policy evaluation",
    inputText: "metadata control audit readiness policy evaluation no phi no action execution",
    allowMetadataOnly: true
  });
  const headers = clinicalDataGovernanceHeaders(safety);

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: "clinical-data-governance-blocked",
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
      ...getClinicalDataGovernanceSummary(),
      safety
    },
    {
      headers
    }
  );
}

export async function POST(request: Request) {
  const safety = evaluateScrimedSafetyGate({
    route: "/api/clinical-data-governance",
    requestedAction: "clinical data governance structured policy evaluation",
    inputText: "metadata policy evaluation only no downstream execution",
    allowMetadataOnly: true
  });
  const headers = clinicalDataGovernanceHeaders(safety);

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: "clinical-data-governance-blocked",
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
        message: "Request body must be valid JSON matching the Clinical Data Governance policy input contract."
      },
      {
        status: 400,
        headers
      }
    );
  }

  if (!isClinicalDataGovernanceRequest(body)) {
    return NextResponse.json(
      {
        error: "invalid-governance-request",
        message:
          "Clinical Data Governance only accepts enum-based metadata policy inputs; raw patient text, identifiers, records, and connector payloads are not accepted."
      },
      {
        status: 400,
        headers
      }
    );
  }

  const decision = evaluateClinicalDataGovernanceRequest(body);

  return NextResponse.json(
    {
      service: "scrimed-clinical-data-governance",
      decision,
      safety
    },
    {
      status: decision.statusCode,
      headers
    }
  );
}
