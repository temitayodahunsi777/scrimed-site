import { NextResponse } from "next/server";
import { competitiveDefenseStatus, getCompetitiveDefenseSummary } from "../../lib/competitiveDefense";

export async function GET() {
  return NextResponse.json(getCompetitiveDefenseSummary(), {
    headers: {
      "X-SCRIMED-Attack-Guarantee": "not-protection-guarantee",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Competitive-Defense": competitiveDefenseStatus,
      "X-SCRIMED-Competitor-Partnership": "not-third-party-partnership",
      "X-SCRIMED-Customer-Release-Authority": "customer-permission-and-release-control-required",
      "X-SCRIMED-Data-Boundary": "synthetic-business-and-metadata-only",
      "X-SCRIMED-Legal-Authority": "not-legal-advice-qualified-review-required",
      "X-SCRIMED-Penetration-Test-Authority": "not-penetration-test-authorization",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-Privacy-Authority": "qualified-privacy-review-required",
      "X-SCRIMED-Security-Certification": "not-security-certified"
    }
  });
}
