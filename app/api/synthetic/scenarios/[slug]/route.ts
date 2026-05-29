import { NextResponse } from "next/server";
import { getSyntheticScenarioBySlug } from "../../../../lib/syntheticClinical";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const scenario = getSyntheticScenarioBySlug(slug);

  if (!scenario) {
    return NextResponse.json(
      { error: "synthetic_scenario_not_found", slug },
      { status: 404 }
    );
  }

  return NextResponse.json({
    service: "scrimed-synthetic-scenario",
    scenario
  });
}
