import { NextResponse } from "next/server";
import { buildGlobalPartnerLocalizationBrief } from "../../../lib/globalPartnerLocalization";

export async function GET() {
  return new NextResponse(buildGlobalPartnerLocalizationBrief(), {
    headers: {
      "Content-Disposition": 'attachment; filename="scrimed-global-partner-localization-brief.md"',
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Data-Boundary": "synthetic-only",
      "X-SCRIMED-Global-Authority": "localization-readiness-not-legal-approval"
    }
  });
}
