import { NextResponse } from "next/server";
import {
  buildSentinelRegressionManifest,
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
    route: `${scrimedIntelligenceSafetyStackApiRoute}/regression-manifest`,
    requestedAction:
      "synthetic metadata-only Project SENTINEL regression manifest audit preparation internal testing no-secret evaluation dataset candidate review",
    inputText:
      "no-phi metadata-only regression manifest failed trace candidate review no tool execution no external call",
    allowMetadataOnly: true
  });
  const headers = {
    "Cache-Control": "private, no-store",
    "X-SCRIMED-Intelligence-Safety-Stack": scrimedIntelligenceSafetyStackStatus,
    "X-SCRIMED-Project-SENTINEL": "regression-manifest-read-only",
    "X-SCRIMED-Agent-Execution-Authority": "regression-review-only-no-tool-execution",
    "X-SCRIMED-Protected-Persistence": "blocked-until-aal2-and-boundary-release",
    "X-SCRIMED-Data-Boundary": "synthetic-no-phi-no-secret-metadata-only",
    ...scrimedSafetyHeaders(safety)
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "sentinel-regression-manifest-blocked",
          message: "Project SENTINEL regression manifest is blocked by SCRIMED safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  const manifest = buildSentinelRegressionManifest();

  return NextResponse.json(
    {
      service: "scrimed-sentinel-regression-manifest",
      status: "regression-manifest-ready-read-only-metadata",
      protectedPersistence: manifest.protectedPersistence,
      caseCount: manifest.cases.length,
      manifest,
      blockedFrom: [
        "production execution",
        "protected persistence without AAL2",
        "PHI fixtures",
        "secret fixtures",
        "external communications",
        "autonomous clinical or payer action"
      ],
      no_tool_execution_performed: true,
      no_external_call_performed: true,
      no_phi_confirmed: true,
      no_secret_fixture_confirmed: true
    },
    { headers }
  );
}
