import { NextResponse } from "next/server";
import { getFixtureChangeReviewSummary } from "../../../lib/fixtureChangeReviews";

export async function GET() {
  return NextResponse.json(getFixtureChangeReviewSummary());
}
