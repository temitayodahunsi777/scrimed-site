import { NextResponse } from "next/server";
import { getProductConsoleApiSummary } from "../../../lib/productConsole";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getProductConsoleApiSummary(), {
    headers: {
      "Cache-Control": "no-store",
      "X-SCRIMED-Data-Class": "public-synthetic"
    }
  });
}
