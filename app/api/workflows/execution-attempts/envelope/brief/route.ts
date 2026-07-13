import { NextResponse } from "next/server";
import { buildExecutionAttemptEnvelopeBrief } from "../../../../../lib/executionAttemptEnvelope";
import {
  evaluateScrimedSafetyGate,
  scrimedSafetyHeaders
} from "../../../../../lib/scrimedSafetyGovernance";

export async function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: "/api/workflows/execution-attempts/envelope/brief",
    requestedAction: "execution attempt envelope brief synthetic metadata-only evidence",
    inputText: "synthetic no-phi execution attempt envelope brief",
    allowMetadataOnly: true
  });
  const headers = {
    ...scrimedSafetyHeaders(safety),
    "Content-Disposition": "attachment; filename=\"scrimed-execution-attempt-envelope-brief.md\"",
    "Content-Type": "text/markdown; charset=utf-8",
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
          code: "execution-attempt-envelope-brief-blocked",
          message: "Execution attempt envelope brief is blocked by SCRIMED safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return new NextResponse(buildExecutionAttemptEnvelopeBrief(), {
    headers
  });
}
