import { NextResponse } from "next/server";
import {
  buildScrimedOSImplementationPlanBrief,
  scrimedOSImplementationPlanApiRoute,
  scrimedOSImplementationPlanStatus
} from "../../../../lib/scrimedOSImplementationPlan";
import {
  evaluateScrimedSafetyGate,
  scrimedSafetyHeaders
} from "../../../../lib/scrimedSafetyGovernance";

export function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: `${scrimedOSImplementationPlanApiRoute}/brief`,
    requestedAction: "scrimed os implementation plan brief synthetic architecture roadmap",
    inputText: "synthetic no-phi architecture roadmap brief enterprise diligence internal testing",
    allowMetadataOnly: true
  });
  const headers = {
    ...scrimedSafetyHeaders(safety),
    "Content-Disposition": "attachment; filename=\"scrimed-os-implementation-plan.md\"",
    "Content-Type": "text/markdown; charset=utf-8",
    "X-SCRIMED-OS-Implementation-Plan": scrimedOSImplementationPlanStatus,
    "X-SCRIMED-Data-Boundary": "synthetic-no-phi-only"
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "scrimed-os-implementation-plan-brief-blocked",
          message: "SCRIMED OS implementation plan brief is blocked by safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return new NextResponse(buildScrimedOSImplementationPlanBrief(), { headers });
}
