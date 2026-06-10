import { NextResponse } from "next/server";
import { getEnterpriseReadinessSummary } from "../../lib/enterpriseReadiness";

export async function GET() {
  return NextResponse.json(getEnterpriseReadinessSummary());
}
