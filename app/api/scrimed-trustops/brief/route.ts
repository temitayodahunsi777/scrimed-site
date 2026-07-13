import { NextResponse } from "next/server";
import {
  buildScrimedTrustOpsBrief
} from "../../../lib/scrimed/semantic-intelligence-layer";
import {
  scrimedTrustOpsApiRoute,
  scrimedTrustOpsStatus
} from "../../../lib/scrimed/trustops-registry";
import {
  evaluateScrimedSafetyGate,
  scrimedSafetyHeaders
} from "../../../lib/scrimedSafetyGovernance";

export function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: `${scrimedTrustOpsApiRoute}/brief`,
    requestedAction: "scrimed trustops brief synthetic governance signal detection self healing recommendations",
    inputText: "synthetic no-phi trustops brief registry signal engine recommendation only human review internal testing",
    allowMetadataOnly: true
  });
  const headers = {
    ...scrimedSafetyHeaders(safety),
    "Content-Disposition": "attachment; filename=\"scrimed-trustops-intelligence-layer.md\"",
    "Content-Type": "text/markdown; charset=utf-8",
    "X-SCRIMED-TrustOps": scrimedTrustOpsStatus,
    "X-SCRIMED-Data-Boundary": "synthetic-no-phi-only"
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "scrimed-trustops-brief-blocked",
          message: "SCRIMED TrustOps brief is blocked by safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return new NextResponse(buildScrimedTrustOpsBrief(), { headers });
}
