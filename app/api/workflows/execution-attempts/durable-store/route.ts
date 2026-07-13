import { NextResponse } from "next/server";
import {
  executionAttemptDurableStoreHeaders,
  getExecutionAttemptDurableStoreSummary
} from "../../../../lib/executionAttemptDurableStore";
import {
  evaluateScrimedSafetyGate,
  scrimedSafetyHeaders
} from "../../../../lib/scrimedSafetyGovernance";

export async function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: "/api/workflows/execution-attempts/durable-store",
    requestedAction: "execution attempt durable store synthetic metadata-only evidence",
    inputText: "synthetic no-phi execution attempt durable store evidence",
    allowMetadataOnly: true
  });
  const headers = {
    ...executionAttemptDurableStoreHeaders,
    ...scrimedSafetyHeaders(safety)
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "execution-attempt-durable-store-blocked",
          message: "Execution attempt durable-store summary is blocked by SCRIMED safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return NextResponse.json(getExecutionAttemptDurableStoreSummary(), {
    headers
  });
}
