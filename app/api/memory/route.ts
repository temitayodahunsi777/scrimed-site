import { NextResponse } from "next/server";
import { getAgentOSSummary } from "../../lib/agentOS";

export async function GET() {
  const summary = getAgentOSSummary();

  return NextResponse.json({
    service: "scrimed-memory-fabric",
    route: "/memory",
    status: "foundation-online",
    boundary: summary.boundary,
    memoryFabric: summary.memoryFabric,
    updated: summary.updated
  });
}
