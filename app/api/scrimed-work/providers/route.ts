import { NextResponse } from "next/server";
import {
  getScrimedModelQualificationSummary,
  scrimedWorkHeaders,
  scrimedWorkProviderRegistry,
  wrapWorkData
} from "../../../lib/scrimed-work";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    wrapWorkData(
      {
        providers: scrimedWorkProviderRegistry,
        qualification: getScrimedModelQualificationSummary()
      },
      "scrimed-work-providers"
    ),
    { headers: scrimedWorkHeaders() }
  );
}
