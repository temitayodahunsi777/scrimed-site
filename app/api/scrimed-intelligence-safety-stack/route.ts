import { NextResponse } from "next/server";
import {
  getScrimedIntelligenceSafetyStackSummary,
  scrimedIntelligenceSafetyStackApiRoute,
  scrimedIntelligenceSafetyStackStatus
} from "../../lib/scrimedIntelligenceSafetyStack";
import {
  evaluateScrimedSafetyGate,
  scrimedSafetyHeaders
} from "../../lib/scrimedSafetyGovernance";

export const dynamic = "force-dynamic";

export function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: scrimedIntelligenceSafetyStackApiRoute,
    requestedAction:
      "synthetic metadata-only agent security observability clinical safety data infrastructure outcome review orchestration compliance governance audit preparation internal testing",
    inputText:
      "Project SENTINEL deny-by-default no-phi metadata-only flight recorder local wal review queue clinical correctness deidentification scaffold outcomes review",
    allowMetadataOnly: true
  });
  const headers = {
    "Cache-Control": "private, no-store",
    "X-SCRIMED-Intelligence-Safety-Stack": scrimedIntelligenceSafetyStackStatus,
    "X-SCRIMED-Project-SENTINEL": "deny-by-default-metadata-only",
    "X-SCRIMED-Agent-Execution-Authority": "no-irrevocable-actions",
    "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
    "X-SCRIMED-Data-Boundary": "synthetic-no-phi-metadata-only",
    "X-SCRIMED-External-Action-Authority": "not-authorized",
    ...scrimedSafetyHeaders(safety)
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "scrimed-intelligence-safety-stack-blocked",
          message: "SCRIMED Intelligence & Safety Stack is blocked by safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return NextResponse.json(getScrimedIntelligenceSafetyStackSummary(), { headers });
}
