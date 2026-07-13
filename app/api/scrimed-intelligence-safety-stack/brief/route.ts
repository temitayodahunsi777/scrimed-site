import { NextResponse } from "next/server";
import {
  buildScrimedIntelligenceSafetyStackBrief,
  scrimedIntelligenceSafetyStackApiRoute,
  scrimedIntelligenceSafetyStackStatus
} from "../../../lib/scrimedIntelligenceSafetyStack";
import {
  evaluateScrimedSafetyGate,
  scrimedSafetyHeaders
} from "../../../lib/scrimedSafetyGovernance";

export const dynamic = "force-dynamic";

export function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: `${scrimedIntelligenceSafetyStackApiRoute}/brief`,
    requestedAction:
      "synthetic metadata-only intelligence safety stack markdown brief audit preparation internal testing",
    inputText: "no-phi metadata-only Project SENTINEL flight recorder clinical safety governance brief",
    allowMetadataOnly: true
  });
  const headers = {
    "Cache-Control": "private, no-store",
    "Content-Disposition": "attachment; filename=\"scrimed-intelligence-safety-stack.md\"",
    "Content-Type": "text/markdown; charset=utf-8",
    "X-SCRIMED-Intelligence-Safety-Stack": scrimedIntelligenceSafetyStackStatus,
    "X-SCRIMED-Agent-Execution-Authority": "no-irrevocable-actions",
    "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
    "X-SCRIMED-Data-Boundary": "synthetic-no-phi-metadata-only",
    ...scrimedSafetyHeaders(safety)
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "scrimed-intelligence-safety-stack-brief-blocked",
          message: "SCRIMED Intelligence & Safety Stack brief is blocked by safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return new NextResponse(buildScrimedIntelligenceSafetyStackBrief(), { headers });
}
