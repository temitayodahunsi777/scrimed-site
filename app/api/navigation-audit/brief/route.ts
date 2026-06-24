import { NextResponse } from "next/server";
import { buildNavigationAuditBrief } from "../../../lib/navigationAudit";

export async function GET() {
  return new NextResponse(buildNavigationAuditBrief(), {
    headers: {
      "Content-Disposition": "attachment; filename=\"scrimed-navigation-audit-brief.md\"",
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Approval-Authority": "external-review-required",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Data-Boundary": "synthetic-only",
      "X-SCRIMED-Function-Audit": "brief-typecheck-build-smoke-plus-protected-fail-closed",
      "X-SCRIMED-Navigation-Audit": "route-navigation-audit-brief-ready",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-Release-Authority": "not-release-approval",
      "X-SCRIMED-Security-Certification": "not-security-certified"
    }
  });
}
