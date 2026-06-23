import { NextResponse } from "next/server";
import { getBuyerReleaseControlRunSummary } from "../../lib/buyerReleaseControlRun";

export async function GET() {
  return NextResponse.json(getBuyerReleaseControlRunSummary(), {
    headers: {
      "X-SCRIMED-Buyer-Share": "runbook-ready-protected-aal2-required",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Data-Boundary": "synthetic-only",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-Release-Authority": "not-release-approval",
      "X-SCRIMED-Security-Certification": "not-security-certified"
    }
  });
}
