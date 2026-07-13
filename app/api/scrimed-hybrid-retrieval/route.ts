import { NextResponse } from "next/server";
import {
  getScrimedHybridRetrievalSummary,
  scrimedHybridRetrievalApiRoute,
  scrimedHybridRetrievalStatus
} from "../../lib/scrimedHybridRetrieval";
import { evaluateScrimedSafetyGate, scrimedSafetyHeaders } from "../../lib/scrimedSafetyGovernance";

export function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: scrimedHybridRetrievalApiRoute,
    requestedAction: "scrimed hybrid retrieval synthetic metadata ranking evidence internal testing",
    inputText: "synthetic no-phi metadata-only retrieval ranking citations evidence",
    allowMetadataOnly: true
  });
  const headers = {
    "Cache-Control": "private, no-store",
    "X-SCRIMED-Code-PT-4": scrimedHybridRetrievalStatus,
    "X-SCRIMED-Data-Boundary": "synthetic-no-phi-metadata-only",
    ...scrimedSafetyHeaders(safety)
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "scrimed-hybrid-retrieval-blocked",
          message: "SCRIMED Hybrid Retrieval is blocked by safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return NextResponse.json(getScrimedHybridRetrievalSummary(), { headers });
}
