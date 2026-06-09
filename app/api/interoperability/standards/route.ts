import { NextResponse } from "next/server";
import { getInteroperabilitySummary } from "../../../lib/interoperabilityStandards";

export async function GET() {
  return NextResponse.json(getInteroperabilitySummary());
}
