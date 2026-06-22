import { NextResponse } from "next/server";
import { buildQaBuyerProofReleaseBrief } from "../../../../lib/qaBuyerProofRelease";

export async function GET() {
  return new NextResponse(buildQaBuyerProofReleaseBrief(), {
    headers: {
      "Content-Disposition": "attachment; filename=\"scrimed-qa-buyer-proof-release-brief.md\"",
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-AAL2-Execution": "human-required-not-code-bypass",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Data-Boundary": "synthetic-only",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-QA-Buyer-Proof-Release": "protected-release-required",
      "X-SCRIMED-QA-Proof": "buyer-proof-release-brief-no-public-release",
      "X-SCRIMED-Security-Certification": "not-security-certified"
    }
  });
}
