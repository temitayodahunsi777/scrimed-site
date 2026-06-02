import { NextResponse } from "next/server";
import { getCommercialStrategySummary } from "../../../lib/commercialStrategy";

export async function GET() {
  return NextResponse.json(getCommercialStrategySummary());
}
