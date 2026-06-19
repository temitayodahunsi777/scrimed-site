import { NextResponse } from "next/server";
import { buildClinicalCareActivationBrief } from "../../../lib/clinicalCareActivation";

export async function GET() {
  return new NextResponse(buildClinicalCareActivationBrief(), {
    headers: {
      "Content-Disposition": "attachment; filename=\"scrimed-clinical-care-activation-readiness-brief.md\"",
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Data-Boundary": "synthetic-only"
    }
  });
}
