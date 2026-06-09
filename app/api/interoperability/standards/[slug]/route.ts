import { NextResponse } from "next/server";
import { getInteroperabilityStandardBySlug } from "../../../../lib/interoperabilityStandards";
import { integrationContracts } from "../../../../lib/integrationContracts";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const standard = getInteroperabilityStandardBySlug(slug);

  if (!standard) {
    return NextResponse.json({ error: "interoperability_standard_not_found", slug }, { status: 404 });
  }

  return NextResponse.json({
    service: "scrimed-interoperability-standard",
    standard,
    linkedContracts: integrationContracts.filter((contract) => contract.standardIds.includes(slug))
  });
}
