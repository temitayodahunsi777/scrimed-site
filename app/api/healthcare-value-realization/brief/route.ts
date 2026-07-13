import { NextResponse } from "next/server";
import { buildHealthcareValueRealizationBrief } from "../../../lib/healthcareValueRealization";

export async function GET() {
  return new NextResponse(buildHealthcareValueRealizationBrief(), {
    headers: {
      "Content-Disposition": 'attachment; filename="scrimed-healthcare-value-realization-brief.md"',
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Data-Boundary": "synthetic-only",
      "X-SCRIMED-EHR-Writeback": "not-authorized",
      "X-SCRIMED-Financial-Authority": "not-audited-financial-report",
      "X-SCRIMED-Imaging-Authority": "not-final-medical-interpretation",
      "X-SCRIMED-Payer-Authority": "not-authorized",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-Production-Authorization": "not-production-authorized",
      "X-SCRIMED-Revenue-Authority": "not-revenue-guarantee",
      "X-SCRIMED-ROI-Authority": "not-roi-guarantee",
      "X-SCRIMED-Valuation-Authority": "not-valuation-assurance"
    }
  });
}
