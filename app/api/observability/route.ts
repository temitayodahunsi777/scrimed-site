import { NextResponse } from "next/server";
import { getAgentOSSummary } from "../../lib/agentOS";
import { getAtlasIntelligenceCoreSummary } from "../../lib/atlasIntelligenceCore";

export async function GET() {
  const agentOS = getAgentOSSummary();
  const atlas = getAtlasIntelligenceCoreSummary();

  return NextResponse.json({
    service: "scrimed-observability-dashboard",
    route: "/observability",
    status: "continuous-validation-ready",
    observabilitySignals: agentOS.observabilitySignals,
    continuousValidationMetrics: atlas.continuousValidationMetrics,
    productionBoundary: atlas.boundary,
    updated: atlas.updated
  });
}
