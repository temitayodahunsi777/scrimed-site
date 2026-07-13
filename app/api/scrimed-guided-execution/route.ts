import { NextResponse } from "next/server";
import {
  getScrimedGuidedExecutionSummary,
  scrimedGuidedExecutionApiRoute,
  scrimedGuidedExecutionStatus
} from "../../lib/scrimedGuidedExecution";
import { evaluateScrimedSafetyGate, scrimedSafetyHeaders } from "../../lib/scrimedSafetyGovernance";

export const dynamic = "force-dynamic";

export function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: scrimedGuidedExecutionApiRoute,
    requestedAction:
      "scrimed guided execution synthetic metadata buyer investor pilot partner operator proof route pricing motion demo internal testing",
    inputText:
      "synthetic no-phi metadata-only guided execution buyer investor pilot partner operator proof route pricing motion demo internal testing",
    allowMetadataOnly: true
  });
  const headers = {
    "Cache-Control": "private, no-store",
    "X-SCRIMED-Guided-Execution": scrimedGuidedExecutionStatus,
    "X-SCRIMED-Data-Boundary": "synthetic-and-metadata-only",
    ...scrimedSafetyHeaders(safety)
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "scrimed-guided-execution-blocked",
          message: "SCRIMED Guided Execution is blocked by safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return NextResponse.json(getScrimedGuidedExecutionSummary(), { headers });
}
