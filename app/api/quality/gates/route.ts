import { NextResponse } from "next/server";
import { getQualityGateSummary } from "../../../lib/qualityGates";

export async function GET() {
  return NextResponse.json(getQualityGateSummary());
}
