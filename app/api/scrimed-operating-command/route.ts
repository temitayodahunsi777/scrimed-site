import { NextResponse } from "next/server";
import {
  getScrimedOperatingCommandCenterSummary,
  scrimedOperatingCommandCenterApiRoute,
  scrimedOperatingCommandCenterStatus
} from "../../lib/scrimedOperatingCommandCenter";
import {
  evaluateScrimedSafetyGate,
  scrimedSafetyHeaders
} from "../../lib/scrimedSafetyGovernance";

export const dynamic = "force-dynamic";

export function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: scrimedOperatingCommandCenterApiRoute,
    requestedAction:
      "synthetic no-phi operating command center systems agents infrastructure workflows products services ui interface audit preparation internal testing investor buyer diligence",
    inputText:
      "metadata-only synthetic readiness command lanes proof routes no-phi review gates internal testing",
    allowMetadataOnly: true
  });
  const headers = {
    "Cache-Control": "private, no-store",
    "X-SCRIMED-Operating-Command": scrimedOperatingCommandCenterStatus,
    "X-SCRIMED-Data-Boundary": "synthetic-no-phi-metadata-only",
    "X-SCRIMED-Execution-Authority": "planning-and-recommendation-only",
    ...scrimedSafetyHeaders(safety)
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "scrimed-operating-command-blocked",
          message: "SCRIMED Operating Command Center is blocked by safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return NextResponse.json(getScrimedOperatingCommandCenterSummary(), { headers });
}
