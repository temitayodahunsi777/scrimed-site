import { NextResponse } from "next/server";
import {
  getScrimedModuleRegistrySummary,
  scrimedModuleRegistryApiRoute,
  scrimedModuleRegistryStatus
} from "../../lib/scrimedModuleRegistry";
import {
  evaluateScrimedSafetyGate,
  scrimedSafetyHeaders
} from "../../lib/scrimedSafetyGovernance";

export function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: scrimedModuleRegistryApiRoute,
    requestedAction: "scrimed module registry synthetic architecture product roadmap",
    inputText: "synthetic no-phi scrimed module registry enterprise diligence internal testing",
    allowMetadataOnly: true
  });
  const headers = {
    "Cache-Control": "private, no-store",
    "X-SCRIMED-Module-Registry": scrimedModuleRegistryStatus,
    "X-SCRIMED-Data-Boundary": "synthetic-no-phi-only",
    ...scrimedSafetyHeaders(safety)
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "scrimed-module-registry-blocked",
          message: "SCRIMED module registry is blocked by safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return NextResponse.json(getScrimedModuleRegistrySummary(), { headers });
}
