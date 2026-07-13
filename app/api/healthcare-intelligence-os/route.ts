import { NextResponse } from "next/server";
import { getHealthcareIntelligenceOSSummary } from "../../lib/healthcareIntelligenceOS";

export async function GET() {
  return NextResponse.json(getHealthcareIntelligenceOSSummary(), {
    headers: {
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
