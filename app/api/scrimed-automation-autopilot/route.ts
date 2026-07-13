import { NextResponse } from "next/server";
import {
  getScrimedAutomationAutopilotSummary,
  scrimedAutomationAutopilotApiRoute,
  scrimedAutomationAutopilotStatus
} from "../../lib/scrimedAutomationAutopilot";
import {
  evaluateScrimedSafetyGate,
  scrimedSafetyHeaders
} from "../../lib/scrimedSafetyGovernance";

export const dynamic = "force-dynamic";

export function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: scrimedAutomationAutopilotApiRoute,
    requestedAction:
      "synthetic no-phi automation autonomy readiness audit preparation internal testing investor buyer diligence service delivery proof packet recommendations metadata only",
    inputText:
      "metadata-only synthetic automation recommendations internal readiness proof routing review gates preserved boundaries",
    allowMetadataOnly: true
  });
  const headers = {
    "Cache-Control": "private, no-store",
    "X-SCRIMED-Automation-Autopilot": scrimedAutomationAutopilotStatus,
    "X-SCRIMED-Autonomy-Authority": "synthetic-and-review-gated-only",
    "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
    "X-SCRIMED-Customer-Go-Live": "not-customer-go-live-approval",
    "X-SCRIMED-Data-Boundary": "synthetic-and-metadata-only",
    "X-SCRIMED-EHR-Writeback": "not-authorized",
    "X-SCRIMED-Payer-Submission": "not-authorized",
    "X-SCRIMED-Production-Remediation": "not-authorized",
    "X-SCRIMED-Revenue-Authority": "not-revenue-guarantee",
    "X-SCRIMED-Security-Certification": "not-security-certified",
    ...scrimedSafetyHeaders(safety)
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "scrimed-automation-autopilot-blocked",
          message: "SCRIMED Automation Autopilot is blocked by safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return NextResponse.json(getScrimedAutomationAutopilotSummary(), { headers });
}
