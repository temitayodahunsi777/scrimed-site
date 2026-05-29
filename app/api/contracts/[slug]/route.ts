import { NextResponse } from "next/server";
import { getIntegrationContractBySlug } from "../../../lib/integrationContracts";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const contract = getIntegrationContractBySlug(slug);

  if (!contract) {
    return NextResponse.json(
      { error: "contract_not_found", slug },
      { status: 404 }
    );
  }

  return NextResponse.json({
    service: "scrimed-integration-contract",
    contract
  });
}
