import { NextResponse } from "next/server";
import { getOmegaPlatformAuditSummary } from "../../lib/omegaPlatformAudit";

export async function GET() {
  return NextResponse.json(getOmegaPlatformAuditSummary(), {
    headers: {
      "X-SCRIMED-Omega-Audit": "control-plane-active",
      "X-SCRIMED-Audit-Authority": "readiness-control-only",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Connector-Authority": "not-production-connector-approved",
      "X-SCRIMED-Data-Boundary": "synthetic-metadata-and-no-secret-only",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-Release-Authority": "not-buyer-release-approval",
      "X-SCRIMED-Security-Certification": "not-security-certified"
    }
  });
}
