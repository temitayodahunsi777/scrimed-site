import { NextResponse } from "next/server";
import { buildScrimedWorkBrief, scrimedWorkHeaders } from "../../../lib/scrimed-work";

export const dynamic = "force-dynamic";

export function GET() {
  return new NextResponse(buildScrimedWorkBrief(), {
    headers: {
      "Content-Disposition": 'attachment; filename="scrimed-work-intelligence-platform.md"',
      "Content-Type": "text/markdown; charset=utf-8",
      ...scrimedWorkHeaders()
    }
  });
}
