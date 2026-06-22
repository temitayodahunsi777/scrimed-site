import { NextResponse } from "next/server";
import { buildQaExecutionReadinessBrief } from "../../../../lib/qaExecutionReadiness";

export async function GET() {
  return new NextResponse(buildQaExecutionReadinessBrief(), {
    headers: {
      "Content-Disposition": "attachment; filename=\"scrimed-manual-aal2-qa-execution-readiness.md\"",
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-AAL2-Execution": "human-required-not-code-bypass",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Data-Boundary": "synthetic-only",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-QA-Proof": "activation-ready-not-retained-proof",
      "X-SCRIMED-Security-Certification": "not-security-certified"
    }
  });
}
