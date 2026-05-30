import { NextResponse } from "next/server";
import { getSyntheticFixtureSummary } from "../../../lib/syntheticFixtures";

export async function GET() {
  return NextResponse.json(getSyntheticFixtureSummary());
}
