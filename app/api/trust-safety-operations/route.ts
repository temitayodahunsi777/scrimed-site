import { NextResponse } from "next/server";
import { getTrustSafetyOperationsSummary } from "../../lib/trustSafetyOperations";

export async function GET() {
  return NextResponse.json(getTrustSafetyOperationsSummary());
}
