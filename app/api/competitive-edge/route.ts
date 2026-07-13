import { NextResponse } from "next/server";
import { buyerPilotRoomBoundary, buyerPilotRoomCompetitiveEdges } from "../../lib/buyerPilotRoom";
import { getCommercialStrategySummary } from "../../lib/commercialStrategy";
import { getCompetitiveMarketIntelligenceSummary } from "../../lib/competitiveMarketIntelligence";

export async function GET() {
  const commercial = getCommercialStrategySummary();
  const marketIntelligence = getCompetitiveMarketIntelligenceSummary();

  return NextResponse.json({
    service: "scrimed-competitive-edge",
    status: "public-positioning-ready",
    route: "/competitive-edge",
    boundary:
      "Competitive positioning is for enterprise evaluation and marketing alignment. It does not assert third-party partnership, certified compliance, live clinical execution, production connector authorization, reimbursement guarantee, or autonomous diagnosis.",
    buyerRoomBoundary: buyerPilotRoomBoundary,
    competitiveEdgeCount: buyerPilotRoomCompetitiveEdges.length,
    marketIntelligenceStatus: marketIntelligence.status,
    marketIntelligenceRoute: marketIntelligence.route,
    marketIntelligenceApiRoute: marketIntelligence.apiRoute,
    competitorSourceCount: marketIntelligence.sourceCount,
    competitorBuildPatternCount: marketIntelligence.patternCount,
    competitorInitiativeCount: marketIntelligence.initiativeCount,
    competitorTargetAudienceStrategyCount: marketIntelligence.targetAudienceStrategyCount,
    competitorTargetAudienceProofRouteCount: marketIntelligence.targetAudienceProofRouteCount,
    competitorProofMetricCount: marketIntelligence.proofMetricCount,
    competitorBlockedClaimCount: marketIntelligence.blockedClaimCount,
    pricingModel: commercial.recommendedModel,
    edges: buyerPilotRoomCompetitiveEdges,
    marketIntelligencePatterns: marketIntelligence.patterns,
    targetAudienceStrategies: marketIntelligence.targetAudienceStrategies
  });
}
