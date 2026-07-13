import { NextResponse } from "next/server";
import { getBoundaryReleaseApprovalMatrixSummary } from "../../lib/boundaryReleaseApprovalMatrix";
import { evaluateScrimedSafetyGate, scrimedSafetyHeaders } from "../../lib/scrimedSafetyGovernance";

export async function GET() {
  const decision = evaluateScrimedSafetyGate({
    route: "/api/boundary-release-approvals",
    requestedAction:
      "synthetic metadata-only boundary release approval matrix audit preparation investor buyer diligence internal testing",
    inputText:
      "synthetic no-phi approval path documentation only with readiness evidence and retained human gates",
    allowMetadataOnly: true
  });

  const body = getBoundaryReleaseApprovalMatrixSummary();

  return NextResponse.json(body, {
    headers: {
      ...scrimedSafetyHeaders(decision),
      "Cache-Control": "no-store",
      "X-SCRIMED-Boundary-Release-Approval-Matrix": "active-fail-closed",
      "X-SCRIMED-Data-Boundary": "synthetic-metadata-only-no-live-phi",
      "X-SCRIMED-Release-Authority": "not-authorized-boundary-release",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Payer-Submission-Authority": "not-authorized",
      "X-SCRIMED-EHR-Writeback-Authority": "not-authorized",
      "X-SCRIMED-Production-Connector-Authority": "not-production-connector-approved",
      "X-SCRIMED-Certification-Authority": "not-certified-readiness-only",
      "X-SCRIMED-Customer-Go-Live-Authority": "not-authorized"
    }
  });
}
