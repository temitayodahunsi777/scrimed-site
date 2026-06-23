import { NextResponse } from "next/server";
import { getApprovalsReadinessSummary } from "../../lib/approvalsReadiness";

export async function GET() {
  return NextResponse.json(getApprovalsReadinessSummary(), {
    headers: {
      "X-SCRIMED-Approvals-Readiness": "operating-ladder-active",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Data-Boundary": "synthetic-only",
      "X-SCRIMED-Legal-Authority": "external-approval-required",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-Regulatory-Authority": "external-review-required",
      "X-SCRIMED-Reimbursement-Authority": "no-reimbursement-guarantee",
      "X-SCRIMED-Security-Certification": "not-security-certified"
    }
  });
}
