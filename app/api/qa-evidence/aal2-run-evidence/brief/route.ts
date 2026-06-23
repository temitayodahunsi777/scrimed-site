import { NextResponse } from "next/server";
import { buildQaAal2RunEvidenceBrief } from "../../../../lib/qaAal2RunEvidence";

export const dynamic = "force-dynamic";

export async function GET() {
  return new NextResponse(buildQaAal2RunEvidenceBrief(), {
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-AAL2-Execution": "human-required-not-code-bypass",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Data-Boundary": "synthetic-only",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-QA-Evidence": "aal2-run-evidence-brief",
      "X-SCRIMED-QA-Proof": "no-buyer-proof-release-without-retained-packet",
      "X-SCRIMED-Security-Certification": "not-security-certified"
    }
  });
}
