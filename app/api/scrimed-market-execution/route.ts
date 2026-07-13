import { NextResponse } from "next/server";
import {
  getScrimedMarketExecutionSummary,
  scrimedMarketExecutionApiRoute,
  scrimedMarketExecutionStatus
} from "../../lib/scrimedMarketExecution";
import { evaluateScrimedSafetyGate, scrimedSafetyHeaders } from "../../lib/scrimedSafetyGovernance";

export const dynamic = "force-dynamic";

export function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: scrimedMarketExecutionApiRoute,
    requestedAction:
      "scrimed market execution synthetic no-phi metadata-only buyer investor diligence sales revenue proof public relations privacy legal internal testing",
    inputText:
      "synthetic no-phi metadata-only clean-room competitor research buyer investor diligence sales revenue proof public relations privacy legal internal testing",
    allowMetadataOnly: true
  });
  const headers = {
    "Cache-Control": "private, no-store",
    "X-SCRIMED-Market-Execution": scrimedMarketExecutionStatus,
    "X-SCRIMED-Data-Boundary": "synthetic-business-and-market-metadata-only",
    "X-SCRIMED-Clean-Room": "public-sources-only-no-proprietary-copying",
    "X-SCRIMED-Human-Review": "required-for-sensitive-sales-legal-clinical-payer-or-public-claims",
    ...scrimedSafetyHeaders(safety)
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "scrimed-market-execution-blocked",
          message: "SCRIMED Market Execution is blocked by safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return NextResponse.json(getScrimedMarketExecutionSummary(), { headers });
}
