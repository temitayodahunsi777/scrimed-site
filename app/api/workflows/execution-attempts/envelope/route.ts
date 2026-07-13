import { NextResponse } from "next/server";
import { getExecutionAttemptEnvelopeSummary } from "../../../../lib/executionAttemptEnvelope";
import {
  evaluateScrimedSafetyGate,
  scrimedSafetyHeaders
} from "../../../../lib/scrimedSafetyGovernance";

export async function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: "/api/workflows/execution-attempts/envelope",
    requestedAction: "execution attempt envelope synthetic metadata-only evidence",
    inputText: "synthetic no-phi execution attempt envelope audit evidence",
    allowMetadataOnly: true
  });
  const headers = {
    ...scrimedSafetyHeaders(safety),
    "X-SCRIMED-Agent-Autonomy": "human-review-required-for-protected-actions",
    "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
    "X-SCRIMED-Connector-Authority": "not-production-connector-approved",
    "X-SCRIMED-Data-Boundary": "synthetic-and-metadata-only",
    "X-SCRIMED-Model-Routing-Authority": "telemetry-only-not-production-routing",
    "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
    "X-SCRIMED-Record-Mutation": "not-authorized",
    "X-SCRIMED-Replay-Authority": "metadata-replay-only",
    "X-SCRIMED-Workflow-Execution": "envelope-contract-only-protected-execution-blocked"
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "execution-attempt-envelope-blocked",
          message: "Execution attempt envelope is blocked by SCRIMED safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return NextResponse.json(getExecutionAttemptEnvelopeSummary(), {
    headers
  });
}
