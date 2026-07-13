import { NextResponse } from "next/server";
import { buildBoundaryReleaseApprovalMatrixBrief } from "../../../lib/boundaryReleaseApprovalMatrix";
import { evaluateScrimedSafetyGate, scrimedSafetyHeaders } from "../../../lib/scrimedSafetyGovernance";

export async function GET() {
  const decision = evaluateScrimedSafetyGate({
    route: "/api/boundary-release-approvals/brief",
    requestedAction:
      "synthetic metadata-only boundary release approval brief audit preparation investor buyer diligence internal testing",
    inputText:
      "synthetic no-phi approval path documentation only with readiness evidence and retained human gates",
    allowMetadataOnly: true
  });

  return new NextResponse(buildBoundaryReleaseApprovalMatrixBrief(), {
    headers: {
      ...scrimedSafetyHeaders(decision),
      "Cache-Control": "no-store",
      "Content-Type": "text/markdown; charset=utf-8",
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
