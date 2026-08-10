import { NextResponse } from "next/server";
import { getCapitalVitalitySummary } from "../../lib/capitalVitality";

export async function GET() {
  return NextResponse.json(getCapitalVitalitySummary(), {
    headers: {
      "Cache-Control": "no-store",
      "X-SCRIMED-Approval-Authority": "external-review-required",
      "X-SCRIMED-Capital-Input-Persistence": "none-local-browser-only",
      "X-SCRIMED-Capture-Packet": "internal-metadata-only-not-release-authority",
      "X-SCRIMED-Capital-Vitality": "capital-vitality-revenue-funding-readiness-active",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Data-Boundary": "synthetic-only",
      "X-SCRIMED-Financial-Authority": "not-audited-financial-report",
      "X-SCRIMED-Investment-Advice": "not-investment-advice",
      "X-SCRIMED-Fundraising-Release": "not-authorized",
      "X-SCRIMED-Federal-Offer-Authority": "not-authorized",
      "X-SCRIMED-Government-Award-Authority": "not-contract-or-grant-award",
      "X-SCRIMED-Government-Registration": "not-verified",
      "X-SCRIMED-Public-Sector-Submission": "not-authorized",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-Reimbursement-Authority": "no-reimbursement-guarantee",
      "X-SCRIMED-SAM-Control": "operator-evidence-required",
      "X-SCRIMED-Securities-Authority": "not-securities-offering-material",
      "X-SCRIMED-Security-Certification": "not-security-certified",
      "X-SCRIMED-Valuation-Authority": "not-valuation-assurance"
    }
  });
}
