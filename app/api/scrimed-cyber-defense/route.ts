import { NextResponse } from "next/server";
import {
  getScrimedCyberDefenseSummary,
  scrimedCyberDefenseApiRoute,
  scrimedCyberDefenseStatus
} from "../../lib/scrimedCyberDefenseCommandCenter";
import { evaluateScrimedSafetyGate, scrimedSafetyHeaders } from "../../lib/scrimedSafetyGovernance";

export const dynamic = "force-dynamic";

export function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: scrimedCyberDefenseApiRoute,
    requestedAction:
      "scrimed cyber defense synthetic metadata security readiness audit preparation no-phi internal testing investor buyer diligence",
    inputText:
      "synthetic no-phi metadata-only cyber defense controls audit headers proxy request sanitization incident readiness internal testing",
    allowMetadataOnly: true
  });
  const headers = {
    "Cache-Control": "private, no-store",
    "X-SCRIMED-Cyber-Defense": scrimedCyberDefenseStatus,
    "X-SCRIMED-Data-Boundary": "synthetic-security-metadata-only",
    "X-SCRIMED-Security-Certification": "not-security-certified",
    ...scrimedSafetyHeaders(safety)
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "scrimed-cyber-defense-blocked",
          message: "SCRIMED Cyber Defense Command Center is blocked by safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return NextResponse.json(getScrimedCyberDefenseSummary(), { headers });
}
