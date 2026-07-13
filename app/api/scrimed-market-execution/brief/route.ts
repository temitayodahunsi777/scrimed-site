import { NextResponse } from "next/server";
import {
  buildScrimedMarketExecutionBrief,
  scrimedMarketExecutionBriefRoute,
  scrimedMarketExecutionStatus
} from "../../../lib/scrimedMarketExecution";
import { evaluateScrimedSafetyGate, scrimedSafetyHeaders } from "../../../lib/scrimedSafetyGovernance";

export const dynamic = "force-dynamic";

export function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: scrimedMarketExecutionBriefRoute,
    requestedAction:
      "scrimed market execution brief synthetic no-phi metadata-only buyer investor diligence sales proof privacy legal internal testing",
    inputText:
      "synthetic no-phi metadata-only clean-room market execution brief buyer investor diligence sales proof privacy legal internal testing",
    allowMetadataOnly: true
  });
  const headers = {
    "Cache-Control": "private, no-store",
    "Content-Disposition": 'inline; filename="scrimed-market-execution.md"',
    "Content-Type": "text/markdown; charset=utf-8",
    "X-SCRIMED-Market-Execution": scrimedMarketExecutionStatus,
    "X-SCRIMED-Data-Boundary": "synthetic-business-and-market-metadata-only",
    "X-SCRIMED-Clean-Room": "public-sources-only-no-proprietary-copying",
    ...scrimedSafetyHeaders(safety)
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "scrimed-market-execution-brief-blocked",
          message: "SCRIMED Market Execution brief is blocked by safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return new NextResponse(buildScrimedMarketExecutionBrief(), { headers });
}
