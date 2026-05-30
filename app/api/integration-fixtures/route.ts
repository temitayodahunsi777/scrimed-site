import { NextResponse } from "next/server";
import { getIntegrationFixtureSummary } from "../../lib/integrationFixtures";

export async function GET() {
  return NextResponse.json(getIntegrationFixtureSummary());
}
