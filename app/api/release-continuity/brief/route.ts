import { NextResponse } from "next/server";
import { buildReleaseContinuityBrief } from "../../../lib/releaseContinuity";

export async function GET() {
  return new NextResponse(buildReleaseContinuityBrief(), {
    headers: {
      "Content-Disposition": "attachment; filename=\"scrimed-release-continuity-brief.md\"",
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Approval-Authority": "external-review-required",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Data-Boundary": "synthetic-only",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-Release-Authority": "not-release-approval",
      "X-SCRIMED-Release-Continuity": "brief-operator-boundary",
      "X-SCRIMED-Security-Certification": "not-security-certified",
      "X-SCRIMED-Token-Handling": "no-token-values-exposed-or-retained"
    }
  });
}
