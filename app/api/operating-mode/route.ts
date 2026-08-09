import { NextResponse } from "next/server";
import { getScrimedOperatingModeSummary } from "../../lib/operatingMode";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(getScrimedOperatingModeSummary(), {
    headers: {
      "Cache-Control": "no-store",
      "X-SCRIMED-Data-Boundary": "synthetic-only-no-phi",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care"
    }
  });
}
