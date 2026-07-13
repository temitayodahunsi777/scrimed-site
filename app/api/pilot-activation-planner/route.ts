import { NextResponse } from "next/server";
import { getPilotActivationPlannerSummary } from "../../lib/pilotActivationPlanner";

export async function GET() {
  return NextResponse.json(getPilotActivationPlannerSummary(), {
    headers: {
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Commercial-Authority": "not-binding-commercial-offer",
      "X-SCRIMED-Customer-Activation": "not-customer-go-live-approval",
      "X-SCRIMED-Data-Boundary": "synthetic-only",
      "X-SCRIMED-EHR-Writeback": "not-authorized",
      "X-SCRIMED-Financial-Authority": "not-audited-financial-report",
      "X-SCRIMED-Legal-Authority": "qualified-review-required",
      "X-SCRIMED-Payer-Authority": "not-authorized",
      "X-SCRIMED-Patient-Outreach-Authority": "human-review-and-consent-required",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-Production-Authorization": "not-production-authorized",
      "X-SCRIMED-Revenue-Authority": "not-revenue-guarantee",
      "X-SCRIMED-ROI-Authority": "not-roi-guarantee"
    }
  });
}
