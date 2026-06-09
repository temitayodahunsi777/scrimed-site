import { NextResponse } from "next/server";
import { getDemoPilotProgramSummary } from "../../lib/demoPilotPrograms";

export async function GET() {
  const summary = getDemoPilotProgramSummary();

  return NextResponse.json({
    service: "scrimed-product-demos",
    status: summary.status,
    boundary: summary.boundary,
    count: summary.demoCount,
    demos: summary.productDemos,
    updated: summary.updated
  });
}
