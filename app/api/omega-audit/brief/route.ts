import { NextResponse } from "next/server";
import {
  buildOmegaPlatformAuditBrief,
  omegaPlatformAuditBriefStatus
} from "../../../lib/omegaPlatformAudit";

export async function GET() {
  return new NextResponse(buildOmegaPlatformAuditBrief(), {
    headers: {
      "Content-Disposition": "attachment; filename=\"scrimed-omega-platform-audit-brief.md\"",
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Omega-Audit": omegaPlatformAuditBriefStatus,
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
