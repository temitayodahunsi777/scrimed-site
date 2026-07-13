import { NextResponse } from "next/server";
import {
  getTrustOpsReviewPacketSummary
} from "../../../lib/scrimed/trustops-review-packets";
import {
  scrimedTrustOpsApiRoute,
  scrimedTrustOpsStatus
} from "../../../lib/scrimed/trustops-registry";
import {
  evaluateScrimedSafetyGate,
  scrimedSafetyHeaders
} from "../../../lib/scrimedSafetyGovernance";

export function GET() {
  const route = `${scrimedTrustOpsApiRoute}/review-packets`;
  const safety = evaluateScrimedSafetyGate({
    route,
    requestedAction: "scrimed trustops synthetic review packets durable evidence binding",
    inputText: "synthetic no-phi trustops review packet durable record replay review disposition recommendation only human review",
    allowMetadataOnly: true
  });
  const headers = {
    "Cache-Control": "private, no-store",
    "X-SCRIMED-TrustOps": scrimedTrustOpsStatus,
    "X-SCRIMED-Data-Boundary": "synthetic-no-phi-only",
    "X-SCRIMED-TrustOps-Persistence": "aal2-protected-durable-store-ready-not-public-write",
    ...scrimedSafetyHeaders(safety)
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "scrimed-trustops-review-packets-blocked",
          message: "SCRIMED TrustOps review packets are blocked by safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return NextResponse.json(getTrustOpsReviewPacketSummary(), { headers });
}
