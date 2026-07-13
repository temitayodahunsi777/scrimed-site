import { NextResponse } from "next/server";
import { getGlobalCertificationReadinessSummary } from "../../lib/globalCertificationReadiness";

export async function GET() {
  return NextResponse.json(getGlobalCertificationReadinessSummary(), {
    headers: {
      "X-SCRIMED-Global-Certification-Readiness": "control-plane-active",
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
