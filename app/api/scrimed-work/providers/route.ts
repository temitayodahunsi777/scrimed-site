import { NextResponse } from "next/server";
import { scrimedWorkHeaders, scrimedWorkProviderRegistry, wrapWorkData } from "../../../lib/scrimed-work";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(wrapWorkData({ providers: scrimedWorkProviderRegistry }, "scrimed-work-providers"), {
    headers: scrimedWorkHeaders()
  });
}
