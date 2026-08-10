import { NextResponse } from "next/server";
import { getValidationEvidenceSummary } from "../../lib/validationEvidence";

export function GET() {
  return NextResponse.json(getValidationEvidenceSummary(), {
    headers: {
      "Cache-Control": "public, max-age=0, must-revalidate",
      "X-SCRIMED-Evidence-Boundary": "synthetic-methodology-not-clinical-validation"
    }
  });
}
