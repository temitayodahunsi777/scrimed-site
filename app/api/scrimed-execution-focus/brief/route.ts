import { NextResponse } from "next/server";
import {
  buildScrimedExecutionFocusBrief,
  scrimedExecutionFocusBriefRoute,
  scrimedExecutionFocusStatus
} from "../../../lib/scrimedExecutionFocus";
import { evaluateScrimedSafetyGate, scrimedSafetyHeaders } from "../../../lib/scrimedSafetyGovernance";

export const dynamic = "force-dynamic";

export function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: scrimedExecutionFocusBriefRoute,
    requestedAction:
      "scrimed execution focus brief synthetic no-phi metadata-only prioritization proof routes investor buyer diligence audit preparation internal testing",
    inputText:
      "synthetic no-phi metadata-only execution focus brief prioritization proof routes buyer investor diligence audit internal testing",
    allowMetadataOnly: true
  });
  const headers = {
    "Cache-Control": "private, no-store",
    "Content-Disposition": 'inline; filename="scrimed-execution-focus.md"',
    "Content-Type": "text/markdown; charset=utf-8",
    "X-SCRIMED-Execution-Focus": scrimedExecutionFocusStatus,
    "X-SCRIMED-Data-Boundary": "synthetic-prioritization-metadata-only",
    "X-SCRIMED-Execution-Authority": "recommendation-only-human-reviewed",
    ...scrimedSafetyHeaders(safety)
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "scrimed-execution-focus-brief-blocked",
          message: "SCRIMED Execution Focus Engine brief is blocked by safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return new NextResponse(buildScrimedExecutionFocusBrief(), { headers });
}
