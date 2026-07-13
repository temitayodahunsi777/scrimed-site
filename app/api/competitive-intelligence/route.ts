import { NextResponse } from "next/server";
import { getCompetitiveMarketIntelligenceSummary } from "../../lib/competitiveMarketIntelligence";

export async function GET() {
  return NextResponse.json(getCompetitiveMarketIntelligenceSummary());
}
