import { NextResponse } from "next/server";
import {
  getScrimedEnterpriseAccelerationSummary,
  scrimedEnterpriseAccelerationApiRoute,
  scrimedEnterpriseAccelerationStatus
} from "../../lib/scrimedEnterpriseAcceleration";
import { evaluateScrimedSafetyGate, scrimedSafetyHeaders } from "../../lib/scrimedSafetyGovernance";

export function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: scrimedEnterpriseAccelerationApiRoute,
    requestedAction:
      "scrimed enterprise acceleration synthetic metadata investor buyer diligence sales demo revenue systems agents performance internal testing",
    inputText:
      "synthetic no-phi metadata-only investor buyer diligence sales demo revenue acceleration internal testing",
    allowMetadataOnly: true
  });
  const headers = {
    "Cache-Control": "private, no-store",
    "X-SCRIMED-Enterprise-Acceleration": scrimedEnterpriseAccelerationStatus,
    "X-SCRIMED-Data-Boundary": "synthetic-no-phi-metadata-only",
    ...scrimedSafetyHeaders(safety)
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "scrimed-enterprise-acceleration-blocked",
          message: "SCRIMED Enterprise Acceleration is blocked by safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return NextResponse.json(getScrimedEnterpriseAccelerationSummary(), { headers });
}
