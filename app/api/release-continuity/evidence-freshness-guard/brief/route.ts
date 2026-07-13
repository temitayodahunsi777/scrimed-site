import { NextResponse } from "next/server";
import {
  buildReleaseEvidenceFreshnessGuardBrief,
  releaseEvidenceFreshnessGuardStatus
} from "../../../../lib/releaseEvidenceFreshnessGuard";

export const dynamic = "force-dynamic";

export async function GET() {
  return new NextResponse(buildReleaseEvidenceFreshnessGuardBrief(), {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": "attachment; filename=\"scrimed-release-evidence-freshness-guard.md\"",
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Approval-Authority": "external-review-required",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Data-Boundary": "synthetic-only",
      "X-SCRIMED-Freshness-Authority": "fresh-rerun-required-before-external-use",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-Public-Distribution-Authority": "not-authorized",
      "X-SCRIMED-Release-Authority": "not-release-approval",
      "X-SCRIMED-Release-Evidence-Freshness-Guard": releaseEvidenceFreshnessGuardStatus,
      "X-SCRIMED-Security-Certification": "not-security-certified",
      "X-SCRIMED-Token-Handling": "no-token-values-exposed-or-retained"
    }
  });
}
