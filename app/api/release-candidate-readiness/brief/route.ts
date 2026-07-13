import { NextResponse } from "next/server";
import { buildReleaseCandidateReadinessBrief } from "../../../lib/releaseCandidateReadiness";

export async function GET() {
  return new NextResponse(buildReleaseCandidateReadinessBrief(), {
    headers: {
      "Content-Disposition": "attachment; filename=\"scrimed-release-candidate-readiness.md\"",
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Commit-Authority": "not-committed-by-this-route",
      "X-SCRIMED-Customer-Go-Live": "not-authorized",
      "X-SCRIMED-Data-Boundary": "synthetic-and-metadata-only",
      "X-SCRIMED-Database-Migration-Authority": "not-applied-by-this-route",
      "X-SCRIMED-Deployment-Authority": "not-deployed-by-this-route",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-Release-Candidate-Readiness":
        "validation-passed-source-provenance-blocked",
      "X-SCRIMED-Security-Certification": "not-security-certified"
    }
  });
}
