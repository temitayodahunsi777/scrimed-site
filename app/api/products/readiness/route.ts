import { NextResponse } from "next/server";
import {
  getProductReadinessRegistrySummary,
  productReadinessRegistryApiRoute,
  productReadinessRegistryStatus
} from "../../../lib/productReadinessRegistry";
import {
  evaluateScrimedSafetyGate,
  scrimedSafetyHeaders
} from "../../../lib/scrimedSafetyGovernance";

export function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: productReadinessRegistryApiRoute,
    requestedAction: "synthetic no-phi product readiness registry investor buyer diligence",
    inputText: "synthetic no-phi product registry readiness",
    allowMetadataOnly: true
  });
  const headers = {
    "Cache-Control": "private, no-store",
    "X-SCRIMED-Product-Readiness": productReadinessRegistryStatus,
    "X-SCRIMED-Data-Boundary": "synthetic-no-phi-only",
    ...scrimedSafetyHeaders(safety)
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "product-readiness-blocked",
          message: "SCRIMED product readiness registry is blocked by the safety governance gate."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return NextResponse.json(getProductReadinessRegistrySummary(), { headers });
}
