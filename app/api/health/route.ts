import { NextResponse } from "next/server";
import { getScrimedHealth } from "../../lib/release/vercelReleaseAssurance";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getScrimedHealth(), {
    headers: { "Cache-Control": "no-store" }
  });
}
