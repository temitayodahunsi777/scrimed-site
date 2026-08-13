import { NextResponse } from "next/server";

import { getScrimedBuildInfo } from "../../lib/release/vercelReleaseAssurance";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getScrimedBuildInfo(), {
    headers: { "Cache-Control": "no-store" }
  });
}
