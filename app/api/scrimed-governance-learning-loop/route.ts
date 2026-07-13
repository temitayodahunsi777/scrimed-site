import { NextResponse } from "next/server";
import { getScrimedGovernanceLearningLoopSummary } from "../../lib/scrimed/governanceLearningLoop";
import { evaluateScrimedSafetyGate, scrimedSafetyHeaders } from "../../lib/scrimedSafetyGovernance";

export const dynamic = "force-dynamic";

export function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: "/api/scrimed-governance-learning-loop",
    requestedAction:
      "scrimed governance learning loop synthetic metadata audit policy investor buyer diligence decision support internal testing",
    inputText:
      "synthetic no-phi metadata-only governance learning audit policy value pricing regulatory watch a2a mcp internal testing",
    allowMetadataOnly: true
  });
  const headers = {
    "Cache-Control": "private, no-store",
    "X-SCRIMED-Governance-Learning-Loop": "active-synthetic-no-phi",
    "X-SCRIMED-Data-Boundary": "synthetic-and-metadata-only",
    "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
    "X-SCRIMED-EHR-Writeback": "not-authorized",
    "X-SCRIMED-Payer-Submission": "not-authorized",
    ...scrimedSafetyHeaders(safety)
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "scrimed-governance-learning-loop-blocked",
          message: "SCRIMED Governance + Learning Loop is blocked by safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return NextResponse.json(getScrimedGovernanceLearningLoopSummary(), { headers });
}
