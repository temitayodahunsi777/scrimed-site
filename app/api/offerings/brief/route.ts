import { NextResponse } from "next/server";
import { buildProductServicePortfolioBrief } from "../../../lib/productServicePortfolio";

export async function GET() {
  return new NextResponse(buildProductServicePortfolioBrief(), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": 'attachment; filename="scrimed-product-service-portfolio-brief.md"',
      "X-SCRIMED-Offerings": "product-service-portfolio-brief",
      "X-SCRIMED-Accounting-Authority": "qualified-accounting-review-required",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Connector-Authority": "not-production-connector-approved",
      "X-SCRIMED-Data-Boundary": "synthetic-business-and-metadata-only",
      "X-SCRIMED-Financial-Authority": "not-audited-financial-report",
      "X-SCRIMED-Legal-Authority": "qualified-review-required",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-Profit-Authority": "not-profit-margin-guarantee",
      "X-SCRIMED-Reimbursement-Authority": "no-reimbursement-guarantee",
      "X-SCRIMED-Revenue-Authority": "not-revenue-guarantee",
      "X-SCRIMED-Securities-Authority": "not-securities-offering-material",
      "X-SCRIMED-Security-Certification": "not-security-certified",
      "X-SCRIMED-Tax-Authority": "qualified-tax-review-required"
    }
  });
}
