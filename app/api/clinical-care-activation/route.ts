import { NextResponse } from "next/server";
import { getClinicalCareActivationSummary } from "../../lib/clinicalCareActivation";

export async function GET() {
  return NextResponse.json(getClinicalCareActivationSummary(), {
    headers: {
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Data-Boundary": "synthetic-only"
    }
  });
}
