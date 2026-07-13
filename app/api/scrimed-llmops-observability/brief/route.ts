import { NextResponse } from "next/server";
import {
  buildScrimedLLMOpsObservabilityBrief,
  scrimedLLMOpsObservabilityBriefRoute,
  scrimedLLMOpsObservabilityStatus
} from "../../../lib/scrimedLLMOpsObservability";
import { evaluateScrimedSafetyGate, scrimedSafetyHeaders } from "../../../lib/scrimedSafetyGovernance";

export function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: scrimedLLMOpsObservabilityBriefRoute,
    requestedAction: "scrimed llmops observability brief synthetic metadata internal testing",
    inputText: "synthetic no-phi trace observability brief",
    allowMetadataOnly: true
  });
  const headers = {
    ...scrimedSafetyHeaders(safety),
    "Content-Disposition": "attachment; filename=\"scrimed-llmops-observability.md\"",
    "Content-Type": "text/markdown; charset=utf-8",
    "X-SCRIMED-Code-PT-4": scrimedLLMOpsObservabilityStatus,
    "X-SCRIMED-Data-Boundary": "synthetic-no-phi-metadata-only"
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "scrimed-llmops-observability-brief-blocked",
          message: "SCRIMED LLMOps Observability brief is blocked by safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return new NextResponse(buildScrimedLLMOpsObservabilityBrief(), { headers });
}
