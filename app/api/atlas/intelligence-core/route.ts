import { NextResponse } from "next/server";
import { getAtlasIntelligenceCoreSummary } from "../../../lib/atlasIntelligenceCore";

export async function GET() {
  return NextResponse.json(getAtlasIntelligenceCoreSummary());
}
