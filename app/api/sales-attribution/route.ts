import { NextResponse } from "next/server";
import { getSalesAttributionSummary } from "../../lib/salesAttribution";

export async function GET() {
  return NextResponse.json(getSalesAttributionSummary());
}
