import { NextResponse } from "next/server";
import {
  buildScrimedOperatingCommandCenterBrief,
  scrimedOperatingCommandCenterApiRoute,
  scrimedOperatingCommandCenterStatus
} from "../../../lib/scrimedOperatingCommandCenter";
import {
  evaluateScrimedSafetyGate,
  scrimedSafetyHeaders
} from "../../../lib/scrimedSafetyGovernance";

export const dynamic = "force-dynamic";

export function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: `${scrimedOperatingCommandCenterApiRoute}/brief`,
    requestedAction:
      "synthetic no-phi operating command center markdown brief audit preparation internal testing",
    inputText: "metadata-only synthetic command center brief no-phi",
    allowMetadataOnly: true
  });
  const headers = {
    "Cache-Control": "private, no-store",
    "Content-Disposition": "attachment; filename=\"scrimed-operating-command-center.md\"",
    "Content-Type": "text/markdown; charset=utf-8",
    "X-SCRIMED-Operating-Command": scrimedOperatingCommandCenterStatus,
    "X-SCRIMED-Data-Boundary": "synthetic-no-phi-metadata-only",
    "X-SCRIMED-Execution-Authority": "planning-and-recommendation-only",
    ...scrimedSafetyHeaders(safety)
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "scrimed-operating-command-brief-blocked",
          message: "SCRIMED Operating Command Center brief is blocked by safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return new NextResponse(buildScrimedOperatingCommandCenterBrief(), { headers });
}
