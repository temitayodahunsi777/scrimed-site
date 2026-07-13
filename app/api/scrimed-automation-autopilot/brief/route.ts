import { NextResponse } from "next/server";
import {
  buildScrimedAutomationAutopilotBrief,
  scrimedAutomationAutopilotBriefStatus
} from "../../../lib/scrimedAutomationAutopilot";

export const dynamic = "force-dynamic";

export function GET() {
  return new NextResponse(buildScrimedAutomationAutopilotBrief(), {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": 'attachment; filename="scrimed-automation-autopilot-brief.md"',
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Automation-Autopilot": scrimedAutomationAutopilotBriefStatus,
      "X-SCRIMED-Autonomy-Authority": "synthetic-and-review-gated-only",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Customer-Go-Live": "not-customer-go-live-approval",
      "X-SCRIMED-Data-Boundary": "synthetic-and-metadata-only",
      "X-SCRIMED-EHR-Writeback": "not-authorized",
      "X-SCRIMED-Payer-Submission": "not-authorized",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-Production-Remediation": "not-authorized",
      "X-SCRIMED-Revenue-Authority": "not-revenue-guarantee",
      "X-SCRIMED-Security-Certification": "not-security-certified"
    }
  });
}
