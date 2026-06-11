import { NextResponse } from "next/server";
import { getTrustOSSummary } from "../../lib/trustOS";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getTrustOSSummary(), {
    headers: { "Cache-Control": "public, max-age=0, must-revalidate" }
  });
}
