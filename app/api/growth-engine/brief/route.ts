import { NextResponse } from "next/server";
import { buildGrowthEngineBrief } from "../../../lib/growthEngine";

export async function GET() {
  return new NextResponse(buildGrowthEngineBrief(), {
    headers: {
      "Content-Disposition": 'attachment; filename="scrimed-commercial-growth-engine-brief.md"',
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Approval-Authority": "external-review-required",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Data-Boundary": "synthetic-only",
      "X-SCRIMED-Financial-Authority": "not-audited-financial-report",
      "X-SCRIMED-Growth-Engine": "commercial-growth-engine-brief-ready-no-revenue-guarantee",
      "X-SCRIMED-Investment-Advice": "not-investment-advice",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-Reimbursement-Authority": "no-reimbursement-guarantee",
      "X-SCRIMED-Revenue-Authority": "not-revenue-guarantee",
      "X-SCRIMED-Securities-Authority": "not-securities-offering-material",
      "X-SCRIMED-Security-Certification": "not-security-certified",
      "X-SCRIMED-Valuation-Authority": "not-valuation-assurance"
    }
  });
}
