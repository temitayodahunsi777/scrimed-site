import { NextResponse } from "next/server";
import { buildQaLaunchKitBrief } from "../../../../lib/qaLaunchKit";

export async function GET() {
  return new NextResponse(buildQaLaunchKitBrief(), {
    headers: {
      "Content-Disposition": "attachment; filename=\"scrimed-manual-aal2-qa-launch-kit.md\"",
      "Content-Type": "text/markdown; charset=utf-8",
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
