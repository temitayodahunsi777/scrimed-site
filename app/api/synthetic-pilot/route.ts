import { NextResponse } from "next/server";

import { getSyntheticPilotReadinessSummary } from "../../lib/commercial/syntheticPilotReadiness";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getSyntheticPilotReadinessSummary(), {
    headers: {
      "Cache-Control": "no-store",
      "X-SCRIMED-Data-Class": "public-synthetic",
      "X-SCRIMED-Authority": "no-production-authority"
    }
  });
}
