import { NextResponse } from "next/server";
import { getSyntheticFixtureBySlug } from "../../../../lib/syntheticFixtures";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const fixture = getSyntheticFixtureBySlug(slug);

  if (!fixture) {
    return NextResponse.json(
      { error: "synthetic_fixture_not_found", slug },
      { status: 404 }
    );
  }

  return NextResponse.json({
    service: "scrimed-synthetic-fixture",
    fixture
  });
}
