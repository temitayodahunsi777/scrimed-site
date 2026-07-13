import { NextResponse } from "next/server";
import {
  getScrimedReasoningStabilitySummary,
  scrimedReasoningStabilityApiRoute,
  scrimedReasoningStabilityStatus
} from "../../lib/scrimedReasoningStability";
import { evaluateScrimedSafetyGate, scrimedSafetyHeaders } from "../../lib/scrimedSafetyGovernance";

export function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: scrimedReasoningStabilityApiRoute,
    requestedAction: "scrimed reasoning stability synthetic metadata quality evaluation internal testing",
    inputText: "synthetic no-phi metadata-only loop detector repetition detector consistency review",
    allowMetadataOnly: true
  });
  const headers = {
    "Cache-Control": "private, no-store",
    "X-SCRIMED-Code-PT-4": scrimedReasoningStabilityStatus,
    "X-SCRIMED-Data-Boundary": "synthetic-no-phi-metadata-only",
    ...scrimedSafetyHeaders(safety)
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "scrimed-reasoning-stability-blocked",
          message: "SCRIMED Reasoning Stability is blocked by safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return NextResponse.json(getScrimedReasoningStabilitySummary(), { headers });
}
