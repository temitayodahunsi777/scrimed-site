import { NextResponse } from "next/server";
import { getIntegrationFixtureValidationResults } from "../../../lib/integrationFixtureValidation";

export async function GET() {
  return NextResponse.json(getIntegrationFixtureValidationResults());
}
