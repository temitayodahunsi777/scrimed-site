import { NextResponse } from "next/server";
import { buildQaRunControlBrief } from "../../../../lib/qaRunControl";

export async function GET() {
  return new NextResponse(buildQaRunControlBrief(), {
    headers: {
      "Content-Disposition": "attachment; filename=\"scrimed-manual-aal2-qa-run-control.md\"",
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-AAL2-Execution": "human-required-not-code-bypass",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Data-Boundary": "synthetic-only",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-QA-Proof": "operator-brief-ready-not-retained-proof",
      "X-SCRIMED-Run-Control": "no-secret-operator-brief",
      "X-SCRIMED-Security-Certification": "not-security-certified"
    }
  });
}
