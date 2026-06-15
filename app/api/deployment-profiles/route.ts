import { NextResponse } from "next/server";
import { getDeploymentProfileSummary } from "../../lib/deploymentProfiles";

export async function GET() {
  return NextResponse.json(getDeploymentProfileSummary());
}
