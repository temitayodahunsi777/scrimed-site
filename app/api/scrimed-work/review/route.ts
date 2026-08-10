import { NextResponse } from "next/server";
import { getPr25ReviewerDashboardSummary } from "../../../lib/postPr25PlatformAdvance";
import {
  scrimedWorkHeaders,
  wrapWorkData
} from "../../../lib/scrimed-work";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    wrapWorkData(
      getPr25ReviewerDashboardSummary(),
      "scrimed-work-pr25-review-summary"
    ),
    {
      headers: scrimedWorkHeaders({
        "X-SCRIMED-Review-Authority": "none-read-only-summary"
      })
    }
  );
}
