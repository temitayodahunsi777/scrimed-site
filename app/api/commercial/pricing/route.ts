import { NextResponse } from "next/server";
import { getCommercialStrategySummary } from "../../../lib/commercialStrategy";

export async function GET() {
  const summary = getCommercialStrategySummary();

  return NextResponse.json(summary, {
    headers: {
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Commercial-Authority": "not-binding-commercial-offer",
      "X-SCRIMED-Competitive-Comparison": summary.marketEvidenceReview.competitiveComparisonAllowed
        ? "current-first-party-evidence-only"
        : "blocked-pending-evidence-review",
      "X-SCRIMED-Customer-Activation": "not-customer-go-live-approval",
      "X-SCRIMED-Data-Boundary": "synthetic-only",
      "X-SCRIMED-EHR-Writeback": "not-authorized",
      "X-SCRIMED-Financial-Authority": "not-audited-financial-report",
      "X-SCRIMED-Imaging-Authority": "not-final-medical-interpretation",
      "X-SCRIMED-Market-Evidence": summary.marketEvidenceReview.status,
      "X-SCRIMED-Payer-Authority": "not-authorized",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-Production-Authorization": "not-production-authorized",
      "X-SCRIMED-Revenue-Authority": "not-revenue-guarantee",
      "X-SCRIMED-ROI-Authority": "not-roi-guarantee"
    }
  });
}
