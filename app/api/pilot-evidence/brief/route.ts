import { NextResponse } from "next/server";
import { buildPilotEvidenceBrief } from "../../../lib/pilotEvidenceDashboard";

export async function GET() {
  return new NextResponse(buildPilotEvidenceBrief(), {
    headers: {
      "Content-Disposition": "attachment; filename=\"scrimed-enterprise-pilot-evidence-brief.md\"",
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Data-Boundary": "synthetic-only"
    }
  });
}
