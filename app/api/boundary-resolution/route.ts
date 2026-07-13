import { NextResponse } from "next/server";
import { getBoundaryResolutionSummary } from "../../lib/boundaryResolution";

export async function GET() {
  return NextResponse.json(getBoundaryResolutionSummary(), {
    headers: {
      "X-SCRIMED-Boundary-Resolution": "active-control-register",
      "X-SCRIMED-Limitation-Control": "centralized-boundary-register",
      "X-SCRIMED-Autonomy-Authority": "no-autonomous-production-remediation",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Data-Boundary": "synthetic-only",
      "X-SCRIMED-Financial-Authority": "not-audited-financial-report",
      "X-SCRIMED-Legal-Authority": "external-approval-required",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-Quantum-Authority": "internal-research-only-no-public-claim",
      "X-SCRIMED-Reimbursement-Authority": "no-reimbursement-guarantee",
      "X-SCRIMED-Revenue-Authority": "not-revenue-guarantee",
      "X-SCRIMED-Securities-Authority": "not-securities-offering-material",
      "X-SCRIMED-Security-Certification": "not-security-certified"
    }
  });
}
