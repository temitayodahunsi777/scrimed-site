import { NextResponse } from "next/server";
import { getNavigationAuditSummary } from "../../lib/navigationAudit";

export async function GET() {
  return NextResponse.json(getNavigationAuditSummary(), {
    headers: {
      "X-SCRIMED-Approval-Authority": "external-review-required",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Data-Boundary": "synthetic-only",
      "X-SCRIMED-Function-Audit": "typecheck-build-smoke-plus-protected-fail-closed",
      "X-SCRIMED-Navigation-Audit": "route-navigation-audit-active",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-Release-Authority": "not-release-approval",
      "X-SCRIMED-Security-Certification": "not-security-certified"
    }
  });
}
