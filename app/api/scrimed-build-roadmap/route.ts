import { NextResponse } from "next/server";
import {
  getScrimedBuildRoadmapSummary,
  scrimedBuildRoadmapApiRoute,
  scrimedBuildRoadmapStatus
} from "../../lib/scrimedBuildRoadmap";
import {
  evaluateScrimedSafetyGate,
  scrimedSafetyHeaders
} from "../../lib/scrimedSafetyGovernance";

export function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: scrimedBuildRoadmapApiRoute,
    requestedAction:
      "scrimed build roadmap synthetic world model ontology memory context injection workforce resource benchmark architecture",
    inputText:
      "synthetic no-phi build roadmap llm interface world model semantic graph memory audit workforce resource benchmark human review",
    allowMetadataOnly: true
  });
  const headers = {
    "Cache-Control": "private, no-store",
    "X-SCRIMED-Build-Roadmap": scrimedBuildRoadmapStatus,
    "X-SCRIMED-Data-Boundary": "synthetic-no-phi-only",
    ...scrimedSafetyHeaders(safety)
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "scrimed-build-roadmap-blocked",
          message: "SCRIMED build roadmap is blocked by safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return NextResponse.json(getScrimedBuildRoadmapSummary(), { headers });
}
