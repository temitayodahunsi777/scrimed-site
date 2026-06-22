import { NextResponse } from "next/server";
import { buildQaManualExecutionConsoleBrief } from "../../../../lib/qaManualExecutionConsole";

export const dynamic = "force-dynamic";

export async function GET() {
  return new NextResponse(buildQaManualExecutionConsoleBrief(), {
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-AAL2-Execution": "human-required-not-code-bypass",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Data-Boundary": "synthetic-only",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-QA-Execution-Console": "brief-no-secret-no-auth-claim",
      "X-SCRIMED-QA-Proof": "retained-packet-required",
      "X-SCRIMED-Security-Certification": "not-security-certified"
    }
  });
}
