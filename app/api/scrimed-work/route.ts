import { NextResponse } from "next/server";
import {
  getScrimedWorkSummary,
  scrimedWorkHeaders,
  wrapWorkData
} from "../../lib/scrimed-work";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(wrapWorkData(getScrimedWorkSummary(), "scrimed-work-summary"), {
    headers: scrimedWorkHeaders()
  });
}
