import { NextResponse } from "next/server";
import { buildApprovalsReadinessBrief } from "../../../lib/approvalsReadiness";

export async function GET() {
  return new NextResponse(buildApprovalsReadinessBrief(), {
    headers: {
      "Content-Disposition": 'attachment; filename="scrimed-approvals-readiness-brief.md"',
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Approvals-Readiness": "brief-no-approval-claim",
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
