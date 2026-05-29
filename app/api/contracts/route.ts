import { NextResponse } from "next/server";
import { getIntegrationContractSummary } from "../../lib/integrationContracts";

export async function GET() {
  return NextResponse.json(getIntegrationContractSummary());
}
