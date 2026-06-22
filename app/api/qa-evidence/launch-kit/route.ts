import { NextResponse } from "next/server";
import { getQaLaunchKitSummary } from "../../../lib/qaLaunchKit";

export async function GET() {
  return NextResponse.json(getQaLaunchKitSummary(), {
    headers: {
      "X-SCRIMED-AAL2-Execution": "human-required-not-code-bypass",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Data-Boundary": "synthetic-only",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-QA-Launch-Kit": "no-secret-human-aal2-handoff",
      "X-SCRIMED-QA-Proof": "operator-handoff-ready-not-retained-proof",
      "X-SCRIMED-Security-Certification": "not-security-certified"
    }
  });
}
