import { NextResponse } from "next/server";
import { buildQaActivationSealBrief } from "../../../../lib/qaActivationSeal";

export async function GET() {
  return new NextResponse(buildQaActivationSealBrief(), {
    headers: {
      "Content-Disposition": "attachment; filename=\"scrimed-qa-activation-seal-brief.md\"",
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-AAL2-Execution": "human-required-not-code-bypass",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Data-Boundary": "synthetic-only",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-QA-Activation-Seal": "protected-packet-required",
      "X-SCRIMED-QA-Proof": "activation-seal-ready-not-retained-proof",
      "X-SCRIMED-Security-Certification": "not-security-certified"
    }
  });
}
