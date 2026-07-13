import { NextResponse } from "next/server";
import { scrimedWorkAgents, scrimedWorkHeaders, wrapWorkData } from "../../../lib/scrimed-work";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(wrapWorkData({ agents: scrimedWorkAgents }, "scrimed-work-agents"), {
    headers: scrimedWorkHeaders()
  });
}
