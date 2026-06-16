import { NextResponse } from "next/server";
import { buyerPilotRoomBoundary, buyerPilotRoomCompetitiveEdges } from "../../lib/buyerPilotRoom";
import { getCommercialStrategySummary } from "../../lib/commercialStrategy";

export async function GET() {
  const commercial = getCommercialStrategySummary();

  return NextResponse.json({
    service: "scrimed-competitive-edge",
    status: "public-positioning-ready",
    route: "/competitive-edge",
    boundary:
      "Competitive positioning is for enterprise evaluation and marketing alignment. It does not assert third-party partnership, certified compliance, live clinical execution, production connector authorization, reimbursement guarantee, or autonomous diagnosis.",
    buyerRoomBoundary: buyerPilotRoomBoundary,
    competitiveEdgeCount: buyerPilotRoomCompetitiveEdges.length,
    pricingModel: commercial.recommendedModel,
    edges: buyerPilotRoomCompetitiveEdges
  });
}
