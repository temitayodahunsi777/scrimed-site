import { NextResponse } from "next/server";
import { buildGlobalEnterpriseCommandBrief } from "../../../lib/globalEnterpriseCommand";

export async function GET() {
  return new NextResponse(buildGlobalEnterpriseCommandBrief(), {
    headers: {
      "Content-Disposition": 'attachment; filename="scrimed-global-enterprise-command-brief.md"',
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Communication-Authority": "human-reviewed-templates-only",
      "X-SCRIMED-Data-Boundary": "synthetic-only",
      "X-SCRIMED-Global-Authority": "readiness-only-not-legal-approval",
      "X-SCRIMED-Interoperability-Authority": "synthetic-conformance-only",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-Production-Authorization": "not-production-authorized",
      "X-SCRIMED-Security-Certification": "not-security-certified"
    }
  });
}
