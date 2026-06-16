import { NextResponse } from "next/server";
import { getTrustSafetyOperationsSummary } from "../../lib/trustSafetyOperations";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getTrustSafetyOperationsSummary(), {
    headers: {
      "Cache-Control": "private, no-store",
      "X-SCRIMED-Data-Boundary": "synthetic-evaluation-and-enterprise-readiness-only"
    }
  });
}
