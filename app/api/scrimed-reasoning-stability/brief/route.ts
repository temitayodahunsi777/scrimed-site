import { NextResponse } from "next/server";
import {
  buildScrimedReasoningStabilityBrief,
  scrimedReasoningStabilityBriefRoute,
  scrimedReasoningStabilityStatus
} from "../../../lib/scrimedReasoningStability";
import { evaluateScrimedSafetyGate, scrimedSafetyHeaders } from "../../../lib/scrimedSafetyGovernance";

export function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: scrimedReasoningStabilityBriefRoute,
    requestedAction: "scrimed reasoning stability brief synthetic metadata internal testing",
    inputText: "synthetic no-phi metadata-only stability brief",
    allowMetadataOnly: true
  });
  const headers = {
    ...scrimedSafetyHeaders(safety),
    "Content-Disposition": "attachment; filename=\"scrimed-reasoning-stability.md\"",
    "Content-Type": "text/markdown; charset=utf-8",
    "X-SCRIMED-Code-PT-4": scrimedReasoningStabilityStatus,
    "X-SCRIMED-Data-Boundary": "synthetic-no-phi-metadata-only"
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "scrimed-reasoning-stability-brief-blocked",
          message: "SCRIMED Reasoning Stability brief is blocked by safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return new NextResponse(buildScrimedReasoningStabilityBrief(), { headers });
}
