import { NextResponse } from "next/server";
import { getHealthRecordsSafetyExchangeSummary } from "../../lib/healthRecordsSafetyExchange";

export async function GET() {
  return NextResponse.json(getHealthRecordsSafetyExchangeSummary(), {
    headers: {
      "X-SCRIMED-Health-Records": "safety-exchange-active",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Connector-Authority": "not-production-connector-approved",
      "X-SCRIMED-Data-Boundary": "synthetic-and-metadata-only",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-Record-Mutation": "not-authorized",
      "X-SCRIMED-Security-Certification": "not-security-certified"
    }
  });
}
