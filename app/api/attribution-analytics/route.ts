import { NextResponse } from "next/server";
import { getAttributionAnalyticsSummary } from "../../lib/attributionAnalytics";

export async function GET() {
  return NextResponse.json(getAttributionAnalyticsSummary());
}
