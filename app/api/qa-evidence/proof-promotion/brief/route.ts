import { NextResponse } from "next/server";
import { buildQaProofPromotionBrief } from "../../../../lib/qaProofPromotion";

export async function GET() {
  return new NextResponse(buildQaProofPromotionBrief(), {
    headers: {
      "Content-Disposition": "attachment; filename=\"scrimed-manual-qa-proof-promotion.md\"",
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-AAL2-Execution": "human-required-not-code-bypass",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Data-Boundary": "synthetic-only",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-QA-Proof": "promotion-gated-retained-packet-required",
      "X-SCRIMED-QA-Proof-Promotion": "retained-packet-required",
      "X-SCRIMED-Security-Certification": "not-security-certified"
    }
  });
}
