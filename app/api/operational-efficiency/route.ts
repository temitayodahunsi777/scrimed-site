import { NextResponse } from "next/server";
import { getOperationalEfficiencySummary } from "../../lib/operationalEfficiency";

export async function GET() {
  return NextResponse.json(getOperationalEfficiencySummary(), {
    headers: {
      "X-SCRIMED-Operational-Efficiency": "bottleneck-resolution-active",
      "X-SCRIMED-Autonomy-Authority": "no-autonomous-production-remediation",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Data-Boundary": "synthetic-and-metadata-only",
      "X-SCRIMED-Financial-Authority": "not-audited-financial-report",
      "X-SCRIMED-Legal-Authority": "qualified-review-required",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-Profit-Authority": "not-profit-margin-guarantee",
      "X-SCRIMED-Revenue-Authority": "not-revenue-guarantee",
      "X-SCRIMED-Security-Certification": "not-security-certified"
    }
  });
}
