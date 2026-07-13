import { NextResponse } from "next/server";
import { getGlobalEnterpriseCommandSummary } from "../../lib/globalEnterpriseCommand";

export async function GET() {
  return NextResponse.json(getGlobalEnterpriseCommandSummary(), {
    headers: {
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
