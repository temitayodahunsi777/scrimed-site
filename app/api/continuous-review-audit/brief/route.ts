import { NextResponse } from "next/server";
import { buildContinuousReviewAuditBrief } from "../../../lib/continuousReviewAudit";

export async function GET() {
  return new NextResponse(buildContinuousReviewAuditBrief(), {
    headers: {
      "Content-Disposition": 'attachment; filename="scrimed-continuous-review-audit-brief.md"',
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Autonomous-Remediation": "human-review-required",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Continuous-Review-Audit": "brief-no-autonomous-claims",
      "X-SCRIMED-Data-Boundary": "synthetic-and-metadata-only",
      "X-SCRIMED-Innovation-Visibility": "internal-research-only",
      "X-SCRIMED-Managed-Coverage": "not-managed-24-7-soc-mdr",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-Quantum-Authority": "internal-research-only-no-production-claims",
      "X-SCRIMED-Regulatory-Authority": "external-review-required",
      "X-SCRIMED-Security-Certification": "not-security-certified"
    }
  });
}
