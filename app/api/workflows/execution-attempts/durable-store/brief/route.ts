import { NextResponse } from "next/server";
import {
  buildExecutionAttemptDurableStoreBrief,
  executionAttemptDurableStoreHeaders
} from "../../../../../lib/executionAttemptDurableStore";
import {
  evaluateScrimedSafetyGate,
  scrimedSafetyHeaders
} from "../../../../../lib/scrimedSafetyGovernance";

export async function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: "/api/workflows/execution-attempts/durable-store/brief",
    requestedAction: "execution attempt durable store brief synthetic metadata-only evidence",
    inputText: "synthetic no-phi execution attempt durable store brief",
    allowMetadataOnly: true
  });
  const headers = {
    ...executionAttemptDurableStoreHeaders,
    "Content-Type": "text/markdown; charset=utf-8",
    ...scrimedSafetyHeaders(safety)
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "execution-attempt-durable-store-brief-blocked",
          message: "Execution attempt durable-store brief is blocked by SCRIMED safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return new NextResponse(buildExecutionAttemptDurableStoreBrief(), {
    headers
  });
}
