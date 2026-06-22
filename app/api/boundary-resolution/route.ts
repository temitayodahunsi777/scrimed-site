import { NextResponse } from "next/server";
import { getBoundaryResolutionSummary } from "../../lib/boundaryResolution";

export async function GET() {
  return NextResponse.json(getBoundaryResolutionSummary(), {
    headers: {
      "X-SCRIMED-Boundary-Resolution": "active-control-register",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Data-Boundary": "synthetic-only",
      "X-SCRIMED-Legal-Authority": "external-approval-required",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-Reimbursement-Authority": "no-reimbursement-guarantee",
      "X-SCRIMED-Security-Certification": "not-security-certified"
    }
  });
}
