import { NextResponse } from "next/server";
import { getAgentOSSummary } from "../../lib/agentOS";
import { getAtlasIntelligenceCoreSummary } from "../../lib/atlasIntelligenceCore";

export async function GET() {
  const agentOS = getAgentOSSummary();
  const atlas = getAtlasIntelligenceCoreSummary();

  return NextResponse.json({
    service: "scrimed-audit-governance-layer",
    route: "/audit",
    status: "audit-contracts-ready",
    boundary: agentOS.boundary,
    auditChannels: agentOS.auditChannels,
    humanApprovalCheckpoints: agentOS.humanApprovalCheckpoints,
    aiAssetRegistry: atlas.governanceLayer.aiAssetRegistry,
    shadowAiDetection: atlas.governanceLayer.shadowAiDetection,
    updated: agentOS.updated
  });
}
