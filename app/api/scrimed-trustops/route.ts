import { NextResponse } from "next/server";
import {
  getScrimedTrustOpsIntelligenceLayerSummary
} from "../../lib/scrimed/semantic-intelligence-layer";
import {
  scrimedTrustOpsApiRoute,
  scrimedTrustOpsStatus
} from "../../lib/scrimed/trustops-registry";
import {
  evaluateScrimedSafetyGate,
  scrimedSafetyHeaders
} from "../../lib/scrimedSafetyGovernance";

export function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: scrimedTrustOpsApiRoute,
    requestedAction: "scrimed trustops synthetic governance signal detection self healing recommendations",
    inputText: "synthetic no-phi trustops registry signal engine recommendation only human review internal testing",
    allowMetadataOnly: true
  });
  const headers = {
    "Cache-Control": "private, no-store",
    "X-SCRIMED-TrustOps": scrimedTrustOpsStatus,
    "X-SCRIMED-Data-Boundary": "synthetic-no-phi-only",
    ...scrimedSafetyHeaders(safety)
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "scrimed-trustops-blocked",
          message: "SCRIMED TrustOps Intelligence Layer is blocked by safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return NextResponse.json(getScrimedTrustOpsIntelligenceLayerSummary(), { headers });
}
