import { NextResponse } from "next/server";
import {
  buildSentinelRegressionPromotionGate,
  scrimedIntelligenceSafetyStackApiRoute,
  scrimedIntelligenceSafetyStackStatus
} from "../../../lib/scrimedIntelligenceSafetyStack";
import {
  evaluateScrimedSafetyGate,
  scrimedSafetyHeaders
} from "../../../lib/scrimedSafetyGovernance";

export const dynamic = "force-dynamic";

export function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: `${scrimedIntelligenceSafetyStackApiRoute}/regression-promotion-gate`,
    requestedAction:
      "synthetic metadata-only Project SENTINEL regression promotion gate audit preparation internal testing no-secret review-only non-execution authority",
    inputText:
      "no-phi metadata-only regression promotion gate human review nonsecret pytest metadata no tool execution no external call",
    allowMetadataOnly: true
  });
  const headers = {
    "Cache-Control": "private, no-store",
    "X-SCRIMED-Intelligence-Safety-Stack": scrimedIntelligenceSafetyStackStatus,
    "X-SCRIMED-Project-SENTINEL": "regression-promotion-gate-read-only",
    "X-SCRIMED-Agent-Execution-Authority": "promotion-gate-review-only-no-execution-authority",
    "X-SCRIMED-Protected-Persistence": "blocked-until-aal2-and-boundary-release",
    "X-SCRIMED-Data-Boundary": "synthetic-no-phi-no-secret-metadata-only",
    ...scrimedSafetyHeaders(safety)
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "sentinel-regression-promotion-gate-blocked",
          message: "Project SENTINEL regression promotion gate is blocked by SCRIMED safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  const gate = buildSentinelRegressionPromotionGate();

  return NextResponse.json(
    {
      service: "scrimed-sentinel-regression-promotion-gate",
      status: "regression-promotion-gate-ready-read-only-metadata",
      protectedPersistence: gate.protectedPersistence,
      caseCount: gate.caseDecisions.length,
      blockedCaseCount: gate.caseDecisions.filter(
        (item) => item.promotionDecision !== "eligible_for_nonsecret_regression_metadata"
      ).length,
      gate,
      allowedPromotionTarget: "nonsecret_pytest_regression_metadata",
      disallowedPromotionTargets: [
        "production execution",
        "clinical authority",
        "payer submission",
        "EHR writeback",
        "protected evidence persistence without AAL2",
        "external communication",
        "secret or PHI fixture"
      ],
      no_execution_authority: true,
      no_tool_execution_performed: true,
      no_external_call_performed: true,
      no_phi_confirmed: true,
      no_secret_fixture_confirmed: true
    },
    { headers }
  );
}
