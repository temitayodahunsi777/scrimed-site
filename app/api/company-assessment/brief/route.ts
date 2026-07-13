import { NextResponse } from "next/server";
import {
  buildCompanyAssessmentBrief,
  companyAssessmentBriefStatus
} from "../../../lib/companyAssessment";

export async function GET() {
  return new NextResponse(buildCompanyAssessmentBrief(), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": 'attachment; filename="scrimed-company-operating-assessment-brief.md"',
      "X-SCRIMED-Company-Assessment": companyAssessmentBriefStatus,
      "X-SCRIMED-Accounting-Authority": "qualified-accounting-review-required",
      "X-SCRIMED-Approval-Authority": "external-review-required",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Connector-Authority": "not-production-connector-approved",
      "X-SCRIMED-Customer-Permission": "not-customer-permission",
      "X-SCRIMED-Data-Boundary": "synthetic-business-and-metadata-only",
      "X-SCRIMED-Financial-Authority": "not-audited-financial-report",
      "X-SCRIMED-Investment-Advice": "not-investment-advice",
      "X-SCRIMED-Launch-Authority": "human-launch-review-required",
      "X-SCRIMED-Legal-Authority": "qualified-review-required",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-Profit-Authority": "not-profit-margin-guarantee",
      "X-SCRIMED-Reimbursement-Authority": "no-reimbursement-guarantee",
      "X-SCRIMED-Revenue-Authority": "not-revenue-guarantee",
      "X-SCRIMED-Security-Certification": "not-security-certified",
      "X-SCRIMED-Securities-Authority": "not-securities-offering-material",
      "X-SCRIMED-Solicitation-Authority": "not-solicitation",
      "X-SCRIMED-Tax-Authority": "qualified-tax-review-required",
      "X-SCRIMED-Valuation-Authority": "not-valuation-assurance"
    }
  });
}
