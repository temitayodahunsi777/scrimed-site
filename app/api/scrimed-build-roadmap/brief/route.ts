import { NextResponse } from "next/server";
import {
  buildScrimedBuildRoadmapBrief,
  scrimedBuildRoadmapBriefRoute,
  scrimedBuildRoadmapStatus
} from "../../../lib/scrimedBuildRoadmap";
import {
  evaluateScrimedSafetyGate,
  scrimedSafetyHeaders
} from "../../../lib/scrimedSafetyGovernance";

export function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: scrimedBuildRoadmapBriefRoute,
    requestedAction:
      "scrimed build roadmap brief synthetic world model ontology memory context injection workforce resource benchmark architecture",
    inputText:
      "synthetic no-phi build roadmap brief llm interface world model semantic graph memory audit workforce resource benchmark human review",
    allowMetadataOnly: true
  });
  const headers = {
    ...scrimedSafetyHeaders(safety),
    "Content-Disposition": "attachment; filename=\"scrimed-build-roadmap.md\"",
    "Content-Type": "text/markdown; charset=utf-8",
    "X-SCRIMED-Build-Roadmap": scrimedBuildRoadmapStatus,
    "X-SCRIMED-Data-Boundary": "synthetic-no-phi-only"
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "scrimed-build-roadmap-brief-blocked",
          message: "SCRIMED build roadmap brief is blocked by safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return new NextResponse(buildScrimedBuildRoadmapBrief(), { headers });
}
