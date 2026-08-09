import { NextResponse } from "next/server";
import { getInvestorAudienceReadinessSummary } from "../../lib/investorAudienceReadiness";

export async function GET() {
  return NextResponse.json(getInvestorAudienceReadinessSummary(), {
    headers: {
      "X-SCRIMED-Approval-Authority": "external-review-required",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Data-Boundary": "synthetic-and-business-readiness-only",
      "X-SCRIMED-Faith-Based-Authority": "not-endorsement-or-donor-advice",
      "X-SCRIMED-Financial-Authority": "not-audited-financial-report",
      "X-SCRIMED-Investment-Advice": "not-investment-advice",
      "X-SCRIMED-Investor-Diligence": "candidate-review-required",
      "X-SCRIMED-Investor-Discovery": "human-controlled-public-materials-only",
      "X-SCRIMED-Investor-Audience-Readiness": "investor-audience-readiness-control-plane-active",
      "X-SCRIMED-Legal-Authority": "qualified-review-required",
      "X-SCRIMED-Nonprofit-Authority": "qualified-review-required",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-Profit-Authority": "not-profit-margin-guarantee",
      "X-SCRIMED-Reimbursement-Authority": "no-reimbursement-guarantee",
      "X-SCRIMED-Revenue-Authority": "not-revenue-guarantee",
      "X-SCRIMED-Securities-Authority": "not-securities-offering-material",
      "X-SCRIMED-Security-Certification": "not-security-certified",
      "X-SCRIMED-Solicitation-Authority": "not-solicitation",
      "X-SCRIMED-External-Outreach": "not-sent",
      "X-SCRIMED-Strategic-Relationship": "not-implied",
      "X-SCRIMED-Tax-Authority": "qualified-review-required",
      "X-SCRIMED-Valuation-Authority": "not-valuation-assurance"
    }
  });
}
