import { NextResponse } from "next/server";
import { scrimedWorkHeaders, scrimedWorkScheduleDefinitions, wrapWorkData } from "../../../lib/scrimed-work";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    wrapWorkData({ schedules: scrimedWorkScheduleDefinitions }, "scrimed-work-schedules"),
    {
      headers: scrimedWorkHeaders({ "X-SCRIMED-Schedules-Authority": "disabled-by-default" })
    }
  );
}
