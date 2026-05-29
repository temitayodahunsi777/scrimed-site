import { NextResponse } from "next/server";
import { getHubSummary } from "../../lib/scrimedHub";

export async function GET() {
  const summary = getHubSummary();

  return NextResponse.json({
    service: "scrimed-site",
    status: "ready",
    baseline: summary.baseline,
    modules: summary.modules,
    routes: summary.routes,
    updated: summary.updated
  });
}
