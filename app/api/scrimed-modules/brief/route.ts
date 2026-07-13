import { NextResponse } from "next/server";
import {
  buildScrimedModuleRegistryBrief,
  scrimedModuleRegistryApiRoute,
  scrimedModuleRegistryStatus
} from "../../../lib/scrimedModuleRegistry";
import {
  evaluateScrimedSafetyGate,
  scrimedSafetyHeaders
} from "../../../lib/scrimedSafetyGovernance";

export function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: `${scrimedModuleRegistryApiRoute}/brief`,
    requestedAction: "scrimed module registry brief synthetic architecture product roadmap",
    inputText: "synthetic no-phi scrimed module registry brief enterprise diligence internal testing",
    allowMetadataOnly: true
  });
  const headers = {
    ...scrimedSafetyHeaders(safety),
    "Content-Disposition": "attachment; filename=\"scrimed-module-registry.md\"",
    "Content-Type": "text/markdown; charset=utf-8",
    "X-SCRIMED-Module-Registry": scrimedModuleRegistryStatus,
    "X-SCRIMED-Data-Boundary": "synthetic-no-phi-only"
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "scrimed-module-registry-brief-blocked",
          message: "SCRIMED module registry brief is blocked by safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return new NextResponse(buildScrimedModuleRegistryBrief(), { headers });
}
