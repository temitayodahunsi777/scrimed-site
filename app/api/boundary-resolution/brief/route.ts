import { NextResponse } from "next/server";
import { buildBoundaryResolutionBrief } from "../../../lib/boundaryResolution";

export async function GET() {
  return new NextResponse(buildBoundaryResolutionBrief(), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
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
