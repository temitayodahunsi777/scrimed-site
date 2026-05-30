import { NextResponse } from "next/server";
import { getIntegrationFixtureBySlug } from "../../../lib/integrationFixtures";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const fixture = getIntegrationFixtureBySlug(slug);

  if (!fixture) {
    return NextResponse.json(
      { error: "integration_fixture_not_found", slug },
      { status: 404 }
    );
  }

  return NextResponse.json({
    service: "scrimed-integration-fixture",
    fixture
  });
}
