import { NextResponse } from "next/server";
import { getReleaseContinuitySummary } from "../../lib/releaseContinuity";

export async function GET() {
  return NextResponse.json(getReleaseContinuitySummary(), {
    headers: {
      "X-SCRIMED-Approval-Authority": "external-review-required",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Data-Boundary": "synthetic-only",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-Release-Authority": "not-release-approval",
      "X-SCRIMED-Release-Continuity": "live-checkpointed-aal2-boundary",
      "X-SCRIMED-Security-Certification": "not-security-certified",
      "X-SCRIMED-Token-Handling": "no-token-values-exposed-or-retained"
    }
  });
}
