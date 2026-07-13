import { NextResponse } from "next/server";
import {
  getQaAal2SmokeReadinessPacket,
  qaAal2SmokeReadinessBoundary
} from "../../../lib/qaAal2RunEvidence";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getQaAal2SmokeReadinessPacket(), {
    headers: {
      "Cache-Control": "no-store",
      "X-SCRIMED-AAL2-Execution": "human-required-not-code-bypass",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Data-Boundary": "synthetic-only",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-QA-Evidence": "aal2-smoke-readiness-preflight",
      "X-SCRIMED-QA-Proof": "no-secret-operator-readiness-only",
      "X-SCRIMED-Security-Certification": "not-security-certified",
      "X-SCRIMED-Boundary": qaAal2SmokeReadinessBoundary
    }
  });
}
