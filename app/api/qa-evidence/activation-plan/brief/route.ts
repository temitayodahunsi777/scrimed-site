import { NextResponse } from "next/server";
import { buildQaEvidenceActivationPlanBrief } from "../../../../lib/qaEvidenceLedger";

export async function GET() {
  return new NextResponse(buildQaEvidenceActivationPlanBrief(), {
    headers: {
      "Content-Disposition": "attachment; filename=\"scrimed-qa-evidence-activation-plan.md\"",
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Data-Boundary": "synthetic-only"
    }
  });
}
