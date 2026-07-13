import { NextResponse } from "next/server";
import {
  buildClinicalProductionReadinessBrief,
  clinicalProductionReadinessBriefStatus
} from "../../../lib/clinicalProductionReadiness";

export async function GET() {
  return new NextResponse(buildClinicalProductionReadinessBrief(), {
    headers: {
      "Content-Disposition":
        'attachment; filename="scrimed-clinical-production-readiness-task-ledger.md"',
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Clinical-Production-Readiness": clinicalProductionReadinessBriefStatus,
      "X-SCRIMED-AI-Authority": "no-live-autonomous-ai-authority",
      "X-SCRIMED-Approval-Authority": "external-review-required",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Connector-Authority": "not-production-connector-approved",
      "X-SCRIMED-Customer-Permission": "not-customer-permission",
      "X-SCRIMED-Data-Boundary": "synthetic-no-phi-and-metadata-only",
      "X-SCRIMED-Financial-Authority": "not-audited-financial-report",
      "X-SCRIMED-Investment-Advice": "not-investment-advice",
      "X-SCRIMED-Launch-Authority": "human-launch-review-required",
      "X-SCRIMED-Legal-Authority": "qualified-review-required",
      "X-SCRIMED-Medical-Advice": "not-medical-advice",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-Profit-Authority": "not-profit-margin-guarantee",
      "X-SCRIMED-Regulatory-Authority": "external-review-required",
      "X-SCRIMED-Reimbursement-Authority": "no-reimbursement-guarantee",
      "X-SCRIMED-Revenue-Authority": "not-revenue-guarantee",
      "X-SCRIMED-Security-Certification": "not-security-certified",
      "X-SCRIMED-Securities-Authority": "not-securities-offering-material",
      "X-SCRIMED-Valuation-Authority": "not-valuation-assurance"
    }
  });
}
