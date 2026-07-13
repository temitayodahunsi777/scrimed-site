import { NextResponse } from "next/server";
import { buildEnterpriseBusinessOpsBrief } from "../../../lib/enterpriseBusinessOperations";

export async function GET() {
  return new NextResponse(buildEnterpriseBusinessOpsBrief(), {
    headers: {
      "Content-Disposition": 'attachment; filename="scrimed-enterprise-business-operations-brief.md"',
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Accounting-Authority": "qualified-accounting-review-required",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Contract-Authority": "human-executive-approval-required",
      "X-SCRIMED-Data-Boundary": "business-and-metadata-only",
      "X-SCRIMED-Enterprise-Business-Ops": "brief-no-legal-accounting-advice",
      "X-SCRIMED-Financial-Authority": "not-audited-financial-report",
      "X-SCRIMED-Investment-Advice": "not-investment-advice",
      "X-SCRIMED-Legal-Authority": "qualified-counsel-review-required",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-Profit-Authority": "not-profit-margin-guarantee",
      "X-SCRIMED-Revenue-Authority": "not-revenue-guarantee",
      "X-SCRIMED-Securities-Authority": "not-securities-offering-material",
      "X-SCRIMED-Security-Certification": "not-security-certified",
      "X-SCRIMED-Tax-Authority": "qualified-tax-review-required",
      "X-SCRIMED-Valuation-Authority": "not-valuation-assurance"
    }
  });
}
