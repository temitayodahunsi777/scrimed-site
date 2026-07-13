import { NextResponse } from "next/server";
import {
  buildScrimedAIInfrastructureWatchtowerBrief,
  scrimedAIInfrastructureWatchtowerBriefRoute,
  scrimedAIInfrastructureWatchtowerStatus
} from "../../../lib/scrimedAIInfrastructureWatchtower";
import { evaluateScrimedSafetyGate, scrimedSafetyHeaders } from "../../../lib/scrimedSafetyGovernance";

export function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: scrimedAIInfrastructureWatchtowerBriefRoute,
    requestedAction: "scrimed ai infrastructure watchtower brief synthetic metadata internal testing",
    inputText: "synthetic no-phi infrastructure strategy brief",
    allowMetadataOnly: true
  });
  const headers = {
    ...scrimedSafetyHeaders(safety),
    "Content-Disposition": "attachment; filename=\"scrimed-ai-infrastructure-watchtower.md\"",
    "Content-Type": "text/markdown; charset=utf-8",
    "X-SCRIMED-Code-PT-4": scrimedAIInfrastructureWatchtowerStatus,
    "X-SCRIMED-Data-Boundary": "synthetic-no-phi-metadata-only"
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "scrimed-ai-infrastructure-watchtower-brief-blocked",
          message: "SCRIMED AI Infrastructure Watchtower brief is blocked by safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return new NextResponse(buildScrimedAIInfrastructureWatchtowerBrief(), { headers });
}
