import { NextResponse } from "next/server";
import {
  buildScrimedEnterpriseAccelerationBrief,
  scrimedEnterpriseAccelerationBriefRoute,
  scrimedEnterpriseAccelerationStatus
} from "../../../lib/scrimedEnterpriseAcceleration";
import { evaluateScrimedSafetyGate, scrimedSafetyHeaders } from "../../../lib/scrimedSafetyGovernance";

export function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: scrimedEnterpriseAccelerationBriefRoute,
    requestedAction:
      "scrimed enterprise acceleration brief synthetic metadata investor buyer diligence sales demo revenue internal testing",
    inputText: "synthetic no-phi metadata-only enterprise acceleration brief",
    allowMetadataOnly: true
  });
  const headers = {
    ...scrimedSafetyHeaders(safety),
    "Content-Disposition": "attachment; filename=\"scrimed-enterprise-acceleration.md\"",
    "Content-Type": "text/markdown; charset=utf-8",
    "X-SCRIMED-Enterprise-Acceleration": scrimedEnterpriseAccelerationStatus,
    "X-SCRIMED-Data-Boundary": "synthetic-no-phi-metadata-only"
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "scrimed-enterprise-acceleration-brief-blocked",
          message: "SCRIMED Enterprise Acceleration brief is blocked by safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return new NextResponse(buildScrimedEnterpriseAccelerationBrief(), { headers });
}
