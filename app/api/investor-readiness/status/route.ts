import { NextResponse } from "next/server";
import { evaluateCostApiGuardrail, costGuardrailHeaders } from "../../../lib/costApiGuardrails";
import {
  getInvestorReadinessCommandCenterSummary,
  investorReadinessCommandCenterApiRoute,
  investorReadinessCommandCenterStatus
} from "../../../lib/investorReadinessCommandCenter";
import {
  evaluateScrimedSafetyGate,
  scrimedSafetyHeaders
} from "../../../lib/scrimedSafetyGovernance";

export function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: investorReadinessCommandCenterApiRoute,
    requestedAction: "investor buyer diligence synthetic readiness status",
    inputText: "synthetic no-phi investor buyer diligence enterprise readiness",
    allowMetadataOnly: true
  });
  const cost = evaluateCostApiGuardrail({
    route: investorReadinessCommandCenterApiRoute,
    projectedCostUsd: 0.01,
    projectedRequestsPerMinute: 1,
    externalProviderCallRequested: false
  });
  const headers = {
    "Cache-Control": "private, no-store",
    "X-SCRIMED-Investor-Readiness": investorReadinessCommandCenterStatus,
    "X-SCRIMED-Data-Boundary": "synthetic-no-phi-only",
    ...scrimedSafetyHeaders(safety),
    ...costGuardrailHeaders(cost)
  };

  if (!safety.allowed || !cost.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "investor-readiness-status-blocked",
          message: "SCRIMED investor readiness status is blocked by safety or cost guardrails."
        },
        safety,
        cost
      },
      { status: safety.allowed ? 429 : safety.statusCode, headers }
    );
  }

  return NextResponse.json(getInvestorReadinessCommandCenterSummary(), { headers });
}
