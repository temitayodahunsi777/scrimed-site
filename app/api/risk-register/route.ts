import { NextResponse } from "next/server";
import { getEnterpriseRiskRegisterSummary } from "../../lib/enterpriseRiskRegister";
import {
  evaluateScrimedSafetyGate,
  scrimedSafetyHeaders
} from "../../lib/scrimedSafetyGovernance";

export function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: "/api/risk-register",
    requestedAction: "audit preparation investor buyer diligence risk register synthetic no-phi",
    inputText: "synthetic no-phi risk register audit readiness",
    allowMetadataOnly: true
  });
  const headers = {
    "Cache-Control": "private, no-store",
    "X-SCRIMED-Risk-Register": "enterprise-risk-register-active-no-phi",
    "X-SCRIMED-Data-Boundary": "synthetic-no-phi-only",
    ...scrimedSafetyHeaders(safety)
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "risk-register-blocked",
          message: "SCRIMED risk register is blocked by the safety governance gate."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return NextResponse.json(getEnterpriseRiskRegisterSummary(), { headers });
}
