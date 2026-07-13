import { NextResponse } from "next/server";
import {
  getReleaseEvidencePromotionSummary,
  releaseEvidencePromotionStatus
} from "../../../lib/releaseEvidencePromotion";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getReleaseEvidencePromotionSummary(), {
    headers: {
      "Cache-Control": "no-store",
      "X-SCRIMED-Approval-Authority": "external-review-required",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Data-Boundary": "synthetic-only",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-Promotion-Authority": "human-gated-no-secret-metadata-only",
      "X-SCRIMED-Release-Authority": "not-release-approval",
      "X-SCRIMED-Release-Evidence-Promotion": releaseEvidencePromotionStatus,
      "X-SCRIMED-Security-Certification": "not-security-certified",
      "X-SCRIMED-Token-Handling": "no-token-values-exposed-or-retained"
    }
  });
}
