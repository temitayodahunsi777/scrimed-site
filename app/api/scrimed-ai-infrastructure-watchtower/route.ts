import { NextResponse } from "next/server";
import {
  getScrimedAIInfrastructureWatchtowerSummary,
  scrimedAIInfrastructureWatchtowerApiRoute,
  scrimedAIInfrastructureWatchtowerStatus
} from "../../lib/scrimedAIInfrastructureWatchtower";
import { evaluateScrimedSafetyGate, scrimedSafetyHeaders } from "../../lib/scrimedSafetyGovernance";

export function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: scrimedAIInfrastructureWatchtowerApiRoute,
    requestedAction: "scrimed ai infrastructure watchtower synthetic metadata strategy internal testing",
    inputText: "synthetic no-phi metadata-only infrastructure watchtower strategic signals",
    allowMetadataOnly: true
  });
  const headers = {
    "Cache-Control": "private, no-store",
    "X-SCRIMED-Code-PT-4": scrimedAIInfrastructureWatchtowerStatus,
    "X-SCRIMED-Data-Boundary": "synthetic-no-phi-metadata-only",
    ...scrimedSafetyHeaders(safety)
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "scrimed-ai-infrastructure-watchtower-blocked",
          message: "SCRIMED AI Infrastructure Watchtower is blocked by safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return NextResponse.json(getScrimedAIInfrastructureWatchtowerSummary(), { headers });
}
