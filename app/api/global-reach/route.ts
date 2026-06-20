import { NextResponse } from "next/server";
import { getGlobalPartnerLocalizationSummary } from "../../lib/globalPartnerLocalization";

export async function GET() {
  return NextResponse.json(getGlobalPartnerLocalizationSummary(), {
    headers: {
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Data-Boundary": "synthetic-only",
      "X-SCRIMED-Global-Authority": "localization-readiness-not-legal-approval"
    }
  });
}
