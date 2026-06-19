import { NextResponse } from "next/server";
import { buildPublicMarketReadinessBrief } from "../../../lib/publicMarketReadiness";

export async function GET() {
  return new NextResponse(buildPublicMarketReadinessBrief(), {
    headers: {
      "Content-Disposition": 'attachment; filename="scrimed-public-market-readiness-brief.md"',
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Data-Boundary": "synthetic-only",
      "X-SCRIMED-Financial-Authority": "not-audited-financial-report",
      "X-SCRIMED-Securities-Authority": "not-securities-offering-material"
    }
  });
}
