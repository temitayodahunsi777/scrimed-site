import { NextResponse } from "next/server";
import { getAtlasIntelligenceCoreSummary } from "../../../lib/atlasIntelligenceCore";

export async function GET() {
  const summary = getAtlasIntelligenceCoreSummary();

  return NextResponse.json({
    service: "scrimed-trust-card-system",
    route: "/trust",
    apiRoute: "/api/trust/cards",
    status: "trust-cards-ready",
    trustCards: summary.trustCards,
    evidenceSources: summary.atlasEvidenceLayer.sources,
    answerContract: summary.atlasEvidenceLayer.answerContract,
    updated: summary.updated
  });
}
