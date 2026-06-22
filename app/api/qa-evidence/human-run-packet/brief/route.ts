import { NextResponse } from "next/server";
import { buildQaHumanRunPacketBrief } from "../../../../lib/qaHumanRunPacket";

export async function GET() {
  return new NextResponse(buildQaHumanRunPacketBrief(), {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": 'attachment; filename="scrimed-qa-human-run-packet.md"',
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-AAL2-Execution": "human-required-not-code-bypass",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Data-Boundary": "synthetic-only",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-QA-Human-Run-Packet": "dispatch-ready-human-aal2-required",
      "X-SCRIMED-QA-Proof": "dispatch-ready-not-retained-proof",
      "X-SCRIMED-Security-Certification": "not-security-certified"
    }
  });
}
