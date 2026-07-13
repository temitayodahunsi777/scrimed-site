import { NextResponse } from "next/server";
import {
  buildQaAal2SmokeReadinessBrief,
  qaAal2SmokeReadinessBoundary
} from "../../../../lib/qaAal2RunEvidence";

export const dynamic = "force-dynamic";

export async function GET() {
  return new NextResponse(buildQaAal2SmokeReadinessBrief(), {
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-AAL2-Execution": "human-required-not-code-bypass",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Data-Boundary": "synthetic-only",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-QA-Evidence": "aal2-smoke-readiness-brief",
      "X-SCRIMED-QA-Proof": "no-secret-operator-readiness-only",
      "X-SCRIMED-Security-Certification": "not-security-certified",
      "X-SCRIMED-Boundary": qaAal2SmokeReadinessBoundary
    }
  });
}
