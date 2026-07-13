import { NextResponse } from "next/server";
import {
  buildCompetitiveDefenseBrief,
  competitiveDefenseBriefStatus
} from "../../../lib/competitiveDefense";

export async function GET() {
  return new NextResponse(buildCompetitiveDefenseBrief(), {
    headers: {
      "Content-Disposition": 'attachment; filename="scrimed-competitive-defense-brief.md"',
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Attack-Guarantee": "not-protection-guarantee",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Competitive-Defense": competitiveDefenseBriefStatus,
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
