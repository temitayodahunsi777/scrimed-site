import { NextResponse } from "next/server";
import { buildStrategicProblemResolutionBrief } from "../../../lib/strategicProblemResolution";

export async function GET() {
  return new NextResponse(buildStrategicProblemResolutionBrief(), {
    headers: {
      "Content-Disposition": 'attachment; filename="scrimed-strategic-problem-resolution-brief.md"',
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Communication-Authority": "human-review-required-before-send",
      "X-SCRIMED-Data-Boundary": "synthetic-only",
      "X-SCRIMED-Execution-Authority": "recommendation-and-control-plane-only",
      "X-SCRIMED-Payer-Authority": "not-authorized",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-Production-Authorization": "not-production-authorized",
      "X-SCRIMED-Valuation-Authority": "not-valuation-assurance"
    }
  });
}
