import { NextResponse } from "next/server";
import { getStrategicPlatformIntelligenceSummary } from "../../lib/strategicPlatformIntelligence";

export async function GET() {
  return NextResponse.json(getStrategicPlatformIntelligenceSummary());
}
