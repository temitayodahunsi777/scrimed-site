import { NextResponse } from "next/server";
import {
  getScrimedLLMOpsObservabilitySummary,
  scrimedLLMOpsObservabilityApiRoute,
  scrimedLLMOpsObservabilityStatus
} from "../../lib/scrimedLLMOpsObservability";
import { evaluateScrimedSafetyGate, scrimedSafetyHeaders } from "../../lib/scrimedSafetyGovernance";

export function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: scrimedLLMOpsObservabilityApiRoute,
    requestedAction: "scrimed llmops observability synthetic metadata trace internal testing",
    inputText: "synthetic no-phi metadata-only traces latency cost tokens safety events",
    allowMetadataOnly: true
  });
  const headers = {
    "Cache-Control": "private, no-store",
    "X-SCRIMED-Code-PT-4": scrimedLLMOpsObservabilityStatus,
    "X-SCRIMED-Data-Boundary": "synthetic-no-phi-metadata-only",
    ...scrimedSafetyHeaders(safety)
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "scrimed-llmops-observability-blocked",
          message: "SCRIMED LLMOps Observability is blocked by safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return NextResponse.json(getScrimedLLMOpsObservabilitySummary(), { headers });
}
