import { NextResponse } from "next/server";
import { buildClinicalAuthorityReadinessBrief } from "../../../lib/clinicalAuthorityReadiness";

export async function GET() {
  return new NextResponse(buildClinicalAuthorityReadinessBrief(), {
    headers: {
      "Content-Disposition": 'attachment; filename="scrimed-clinical-authority-readiness-brief.md"',
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Data-Boundary": "synthetic-only",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-Regulatory-Authority": "external-approval-required",
      "X-SCRIMED-Reimbursement-Authority": "no-reimbursement-guarantee",
      "X-SCRIMED-Security-Certification": "not-security-certified"
    }
  });
}
