import { NextResponse } from "next/server";
import {
  buildScrimedUpgradeImplementationPlanBrief,
  scrimedUpgradeImplementationPlanBriefRoute,
  scrimedUpgradeImplementationPlanStatus
} from "../../../lib/scrimedUpgradeImplementationPlan";
import {
  evaluateScrimedSafetyGate,
  scrimedSafetyHeaders
} from "../../../lib/scrimedSafetyGovernance";

export function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: scrimedUpgradeImplementationPlanBriefRoute,
    requestedAction:
      "scrimed upgrade implementation plan brief secure agent runtime contextual policy observability clinical evaluation multi-model router knowledge operating system workflows devsecops edge ai strategic product direction",
    inputText:
      "synthetic no-phi architecture brief secure agent runtime policy engine observability model router devsecops edge ai internal testing",
    allowMetadataOnly: true
  });
  const headers = {
    ...scrimedSafetyHeaders(safety),
    "Content-Disposition": "attachment; filename=\"scrimed-upgrade-implementation-plan.md\"",
    "Content-Type": "text/markdown; charset=utf-8",
    "X-SCRIMED-Upgrade-Implementation-Plan": scrimedUpgradeImplementationPlanStatus,
    "X-SCRIMED-Data-Boundary": "synthetic-no-phi-architecture-only"
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "scrimed-upgrade-implementation-plan-brief-blocked",
          message: "SCRIMED upgrade implementation plan brief is blocked by safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return new NextResponse(buildScrimedUpgradeImplementationPlanBrief(), { headers });
}
