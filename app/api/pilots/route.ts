import { NextResponse } from "next/server";
import { getDemoPilotProgramSummary } from "../../lib/demoPilotPrograms";

export async function GET() {
  const summary = getDemoPilotProgramSummary();

  return NextResponse.json({
    service: "scrimed-pilot-programs",
    status: summary.status,
    boundary: summary.boundary,
    count: summary.pilotCount,
    pilots: summary.pilotPrograms,
    updated: summary.updated
  });
}
