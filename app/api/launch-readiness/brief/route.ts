import { NextResponse } from "next/server";
import {
  buildLaunchReadinessBrief,
  launchReadinessBriefStatus
} from "../../../lib/launchReadinessOperations";

export async function GET() {
  return new NextResponse(buildLaunchReadinessBrief(), {
    headers: {
      "Content-Disposition": 'attachment; filename="scrimed-launch-readiness-brief.md"',
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Accounting-Authority": "qualified-review-required",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Connector-Authority": "not-production-connector-approved",
      "X-SCRIMED-Customer-Release-Authority": "customer-permission-and-release-control-required",
      "X-SCRIMED-Data-Boundary": "synthetic-business-and-metadata-only",
      "X-SCRIMED-DNS-Authority": "verification-and-routing-only",
      "X-SCRIMED-Fallback-Authority": "continuity-only-not-launch-approval",
      "X-SCRIMED-Launch-Approval-Authority": "human-launch-review-required",
      "X-SCRIMED-Launch-Readiness": launchReadinessBriefStatus,
      "X-SCRIMED-Legal-Authority": "qualified-review-required",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-Profit-Authority": "not-profit-margin-guarantee",
      "X-SCRIMED-Revenue-Authority": "not-revenue-guarantee",
      "X-SCRIMED-Sandbox-Bypass-Authority": "not-authorized",
      "X-SCRIMED-Security-Certification": "not-security-certified",
      "X-SCRIMED-SLA-Authority": "not-contractual-sla",
      "X-SCRIMED-Tax-Authority": "qualified-review-required"
    }
  });
}
