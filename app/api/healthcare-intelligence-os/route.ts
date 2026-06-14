import { NextResponse } from "next/server";
import { getHealthcareIntelligenceOSSummary } from "../../lib/healthcareIntelligenceOS";

export async function GET() {
  return NextResponse.json(getHealthcareIntelligenceOSSummary());
}
