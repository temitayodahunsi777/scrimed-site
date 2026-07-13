import { NextResponse } from "next/server";
import { buildHealthcareIntelligenceOSBrief } from "../../../lib/healthcareIntelligenceOS";

export async function GET() {
  return new NextResponse(buildHealthcareIntelligenceOSBrief(), {
    headers: {
      "Content-Disposition": "attachment; filename=\"scrimed-healthcare-intelligence-os-brief.md\"",
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Clinical-Workflow-Automation": "synthetic-and-review-gated",
      "X-SCRIMED-Connector-Authority": "not-production-connector-approved",
      "X-SCRIMED-Data-Boundary": "synthetic-and-metadata-only",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-Patient-Outreach": "not-authorized",
      "X-SCRIMED-Record-Mutation": "not-authorized"
    }
  });
}
