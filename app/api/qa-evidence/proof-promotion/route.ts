import { NextResponse } from "next/server";
import { getQaProofPromotionSummary } from "../../../lib/qaProofPromotion";

export async function GET() {
  return NextResponse.json(getQaProofPromotionSummary(), {
    headers: {
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
