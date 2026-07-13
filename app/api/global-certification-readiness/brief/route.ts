import { NextResponse } from "next/server";
import { buildGlobalCertificationReadinessBrief } from "../../../lib/globalCertificationReadiness";

export async function GET() {
  return new NextResponse(buildGlobalCertificationReadinessBrief(), {
    headers: {
      "Content-Disposition": 'attachment; filename="scrimed-global-certification-readiness-brief.md"',
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Global-Certification-Readiness": "brief-no-certification-claim",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Data-Boundary": "synthetic-only",
      "X-SCRIMED-Legal-Authority": "external-approval-required",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-Production-Authorization": "not-production-authorized",
      "X-SCRIMED-Regulatory-Authority": "external-review-required",
      "X-SCRIMED-Reimbursement-Authority": "no-reimbursement-guarantee",
      "X-SCRIMED-Security-Certification": "not-security-certified"
    }
  });
}
