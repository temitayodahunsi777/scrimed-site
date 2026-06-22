import { NextResponse } from "next/server";
import { getQaExecutionReadinessSummary } from "../../../lib/qaExecutionReadiness";

export async function GET() {
  return NextResponse.json(getQaExecutionReadinessSummary(), {
    headers: {
      "X-SCRIMED-AAL2-Execution": "human-required-not-code-bypass",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Data-Boundary": "synthetic-only",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-QA-Proof": "activation-ready-not-retained-proof",
      "X-SCRIMED-Security-Certification": "not-security-certified"
    }
  });
}
