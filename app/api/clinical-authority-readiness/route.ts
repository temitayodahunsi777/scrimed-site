import { NextResponse } from "next/server";
import { getClinicalAuthorityReadinessSummary } from "../../lib/clinicalAuthorityReadiness";

export async function GET() {
  return NextResponse.json(getClinicalAuthorityReadinessSummary(), {
    headers: {
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Data-Boundary": "synthetic-only",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-Regulatory-Authority": "external-approval-required",
      "X-SCRIMED-Reimbursement-Authority": "no-reimbursement-guarantee",
      "X-SCRIMED-Security-Certification": "not-security-certified"
    }
  });
}
