import { NextResponse } from "next/server";
import {
  getScrimedExecutionFocusSummary,
  scrimedExecutionFocusApiRoute,
  scrimedExecutionFocusStatus
} from "../../lib/scrimedExecutionFocus";
import { evaluateScrimedSafetyGate, scrimedSafetyHeaders } from "../../lib/scrimedSafetyGovernance";

export const dynamic = "force-dynamic";

export function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: scrimedExecutionFocusApiRoute,
    requestedAction:
      "scrimed execution focus synthetic no-phi metadata-only prioritization proof routes investor buyer diligence audit preparation internal testing",
    inputText:
      "synthetic no-phi metadata-only prioritization proof routes buyer investor diligence audit internal testing",
    allowMetadataOnly: true
  });
  const headers = {
    "Cache-Control": "private, no-store",
    "X-SCRIMED-Execution-Focus": scrimedExecutionFocusStatus,
    "X-SCRIMED-Data-Boundary": "synthetic-prioritization-metadata-only",
    "X-SCRIMED-Execution-Authority": "recommendation-only-human-reviewed",
    ...scrimedSafetyHeaders(safety)
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "scrimed-execution-focus-blocked",
          message: "SCRIMED Execution Focus Engine is blocked by safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return NextResponse.json(getScrimedExecutionFocusSummary(), { headers });
}
