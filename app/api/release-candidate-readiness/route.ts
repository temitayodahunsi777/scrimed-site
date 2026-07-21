import { NextResponse } from "next/server";
import { getReleaseCandidateReadinessSummary } from "../../lib/releaseCandidateReadiness";

export async function GET() {
  return NextResponse.json(getReleaseCandidateReadinessSummary(), {
    headers: {
      "Cache-Control": "no-store",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Commit-Authority": "not-committed-by-this-route",
      "X-SCRIMED-Customer-Go-Live": "not-authorized",
      "X-SCRIMED-Data-Boundary": "synthetic-and-metadata-only",
      "X-SCRIMED-Database-Migration-Authority": "not-applied-by-this-route",
      "X-SCRIMED-Deployment-Authority": "not-deployed-by-this-route",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-Release-Candidate-Readiness":
        "validation-passed-source-provenance-blocked",
      "X-SCRIMED-Release-Candidate-Manifest": "required-before-source-review",
      "X-SCRIMED-Investor-Artifact-Review":
        "automated-review-command-available-human-release-review-required",
      "X-SCRIMED-Candidate-Validation":
        "automated-validation-command-available-human-review-required",
      "X-SCRIMED-Validation-Evidence": "recorded-catalog-revalidation-required",
      "X-SCRIMED-Security-Certification": "not-security-certified"
    }
  });
}
