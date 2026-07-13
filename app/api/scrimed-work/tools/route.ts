import { NextResponse } from "next/server";
import { getScrimedWorkTools, scrimedWorkHeaders, wrapWorkData } from "../../../lib/scrimed-work";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(wrapWorkData({ tools: getScrimedWorkTools() }, "scrimed-work-tools"), {
    headers: scrimedWorkHeaders()
  });
}
