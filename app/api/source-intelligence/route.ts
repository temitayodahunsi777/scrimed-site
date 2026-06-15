import { NextResponse } from "next/server";
import { getSourceIntelligenceSummary } from "../../lib/sourceIntelligence";

export async function GET() {
  return NextResponse.json(getSourceIntelligenceSummary());
}
