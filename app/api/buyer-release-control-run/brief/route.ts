import { NextResponse } from "next/server";
import { buildBuyerReleaseControlRunBrief } from "../../../lib/buyerReleaseControlRun";

export async function GET() {
  return new NextResponse(buildBuyerReleaseControlRunBrief(), {
    headers: {
      "Content-Disposition": "attachment; filename=\"scrimed-buyer-release-control-runbook.md\"",
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Buyer-Share": "runbook-ready-protected-aal2-required",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Data-Boundary": "synthetic-only",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-Release-Authority": "not-release-approval",
      "X-SCRIMED-Security-Certification": "not-security-certified"
    }
  });
}
