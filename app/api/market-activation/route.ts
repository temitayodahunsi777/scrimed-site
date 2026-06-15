import { NextResponse } from "next/server";
import { getMarketActivationSummary } from "../../lib/marketActivation";

export async function GET() {
  return NextResponse.json(getMarketActivationSummary());
}
