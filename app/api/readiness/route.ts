import { NextResponse } from "next/server";
import { getScrimedReleaseReadiness } from "../../lib/release/vercelReleaseAssurance";

export const dynamic = "force-dynamic";

export async function GET() {
  const readiness = getScrimedReleaseReadiness();

  return NextResponse.json(readiness, {
    status: readiness.ok ? 200 : 503,
    headers: { "Cache-Control": "no-store" }
  });
}
