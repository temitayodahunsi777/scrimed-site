import { NextResponse } from "next/server";
import { buildHealthcareOptimizationCommandBrief } from "../../../lib/healthcareOptimizationCommand";

export async function GET() {
  return new NextResponse(buildHealthcareOptimizationCommandBrief(), {
    headers: {
      "Content-Disposition": 'attachment; filename="scrimed-healthcare-optimization-command-brief.md"',
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Data-Boundary": "synthetic-only",
      "X-SCRIMED-EHR-Writeback": "not-authorized",
      "X-SCRIMED-Imaging-Authority": "not-final-medical-interpretation",
      "X-SCRIMED-Interoperability-Authority": "synthetic-conformance-only",
      "X-SCRIMED-Patient-Outreach-Authority": "human-review-and-consent-required",
      "X-SCRIMED-Payer-Authority": "not-authorized",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-Production-Authorization": "not-production-authorized",
      "X-SCRIMED-Valuation-Authority": "not-valuation-assurance"
    }
  });
}
