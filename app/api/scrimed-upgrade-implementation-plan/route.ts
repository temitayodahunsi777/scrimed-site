import { NextResponse } from "next/server";
import {
  getScrimedUpgradeImplementationPlanSummary,
  scrimedUpgradeImplementationPlanApiRoute,
  scrimedUpgradeImplementationPlanStatus
} from "../../lib/scrimedUpgradeImplementationPlan";
import {
  evaluateScrimedSafetyGate,
  scrimedSafetyHeaders
} from "../../lib/scrimedSafetyGovernance";

export function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: scrimedUpgradeImplementationPlanApiRoute,
    requestedAction:
      "scrimed upgrade implementation plan secure agent runtime contextual policy observability clinical evaluation multi-model router knowledge operating system workflows devsecops edge ai strategic product direction",
    inputText:
      "synthetic no-phi architecture roadmap secure agent runtime policy engine observability model router devsecops edge ai internal testing",
    allowMetadataOnly: true
  });
  const headers = {
    "Cache-Control": "private, no-store",
    "X-SCRIMED-Upgrade-Implementation-Plan": scrimedUpgradeImplementationPlanStatus,
    "X-SCRIMED-Data-Boundary": "synthetic-no-phi-architecture-only",
    ...scrimedSafetyHeaders(safety)
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "scrimed-upgrade-implementation-plan-blocked",
          message: "SCRIMED upgrade implementation plan is blocked by safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return NextResponse.json(getScrimedUpgradeImplementationPlanSummary(), { headers });
}
