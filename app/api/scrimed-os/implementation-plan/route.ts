import { NextResponse } from "next/server";
import {
  getScrimedOSImplementationPlanSummary,
  scrimedOSImplementationPlanApiRoute,
  scrimedOSImplementationPlanStatus
} from "../../../lib/scrimedOSImplementationPlan";
import {
  evaluateScrimedSafetyGate,
  scrimedSafetyHeaders
} from "../../../lib/scrimedSafetyGovernance";

export function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: scrimedOSImplementationPlanApiRoute,
    requestedAction: "scrimed os implementation plan synthetic architecture roadmap",
    inputText: "synthetic no-phi architecture roadmap enterprise diligence internal testing",
    allowMetadataOnly: true
  });
  const headers = {
    "Cache-Control": "private, no-store",
    "X-SCRIMED-OS-Implementation-Plan": scrimedOSImplementationPlanStatus,
    "X-SCRIMED-Data-Boundary": "synthetic-no-phi-only",
    ...scrimedSafetyHeaders(safety)
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "scrimed-os-implementation-plan-blocked",
          message: "SCRIMED OS implementation plan is blocked by safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return NextResponse.json(getScrimedOSImplementationPlanSummary(), { headers });
}
