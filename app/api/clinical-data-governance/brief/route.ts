import { NextResponse } from "next/server";
import {
  buildClinicalDataGovernanceBrief,
  clinicalDataGovernanceStatus
} from "../../../lib/clinicalDataGovernance";
import {
  evaluateScrimedSafetyGate,
  scrimedSafetyHeaders
} from "../../../lib/scrimedSafetyGovernance";

export async function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: "/api/clinical-data-governance/brief",
    requestedAction: "clinical data governance brief metadata policy evaluation",
    inputText: "metadata control audit readiness policy governance brief no phi",
    allowMetadataOnly: true
  });

  const headers = {
    "Cache-Control": "private, no-store",
    "Content-Disposition": "attachment; filename=\"scrimed-clinical-data-governance.md\"",
    "Content-Type": "text/markdown; charset=utf-8",
    "X-SCRIMED-Clinical-Data-Governance": clinicalDataGovernanceStatus,
    "X-SCRIMED-Data-Boundary": "metadata-and-policy-only-no-live-phi",
    "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
    "X-SCRIMED-Record-Mutation": "not-authorized",
    "X-SCRIMED-Patient-Outreach": "not-authorized",
    "X-SCRIMED-Payer-Submission": "not-authorized",
    "X-SCRIMED-External-Model-PHI": "not-authorized",
    ...scrimedSafetyHeaders(safety)
  };

  if (!safety.allowed) {
    return new NextResponse(
      [
        "# SCRIMED Clinical Data Governance",
        "",
        "Request blocked by SCRIMED safety governance.",
        `Policy: ${safety.policyVersion}`,
        `Reason: ${safety.reason}`
      ].join("\n"),
      {
        status: safety.statusCode,
        headers
      }
    );
  }

  return new NextResponse(buildClinicalDataGovernanceBrief(), {
    headers
  });
}
