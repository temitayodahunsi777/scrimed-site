import { NextResponse } from "next/server";
import { getExecutionAttemptEnvelopeSummary } from "../../../lib/executionAttemptEnvelope";
import { getExecutionAttemptReadinessSummary } from "../../../lib/executionAttemptReadiness";
import {
  evaluateScrimedSafetyGate,
  scrimedSafetyHeaders
} from "../../../lib/scrimedSafetyGovernance";

export async function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: "/api/workflows/execution-attempts",
    requestedAction: "execution attempt metadata-only synthetic readiness",
    inputText: "synthetic no-phi execution attempt metadata-only readiness",
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
          code: "execution-attempts-blocked",
          message: "Execution attempt readiness is blocked by SCRIMED safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return NextResponse.json(
    {
      ...getExecutionAttemptReadinessSummary(),
      envelopeContract: getExecutionAttemptEnvelopeSummary()
    },
    { headers }
  );
}
