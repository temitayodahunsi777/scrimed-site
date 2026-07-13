import { NextResponse } from "next/server";
import { buildHealthRecordsSafetyExchangeBrief } from "../../../lib/healthRecordsSafetyExchange";

export async function GET() {
  return new NextResponse(buildHealthRecordsSafetyExchangeBrief(), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Health-Records": "safety-exchange-brief",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Connector-Authority": "not-production-connector-approved",
      "X-SCRIMED-Data-Boundary": "synthetic-and-metadata-only",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-Record-Mutation": "not-authorized",
      "X-SCRIMED-Security-Certification": "not-security-certified"
    }
  });
}
