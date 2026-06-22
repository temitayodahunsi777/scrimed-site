import { NextResponse } from "next/server";
import { getQaRunControlSummary } from "../../../lib/qaRunControl";

export async function GET() {
  return NextResponse.json(getQaRunControlSummary(), {
    headers: {
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
