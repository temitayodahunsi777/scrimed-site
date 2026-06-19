import { NextResponse } from "next/server";
import { getPublicMarketReadinessSummary } from "../../lib/publicMarketReadiness";

export async function GET() {
  return NextResponse.json(getPublicMarketReadinessSummary(), {
    headers: {
      "X-SCRIMED-Data-Boundary": "synthetic-only",
      "X-SCRIMED-Financial-Authority": "not-audited-financial-report",
      "X-SCRIMED-Securities-Authority": "not-securities-offering-material"
    }
  });
}
