import { NextResponse } from "next/server";
import {
  buildScrimedOSUpgradeBatchBrief,
  scrimedOSUpgradeBatchApiRoute,
  scrimedOSUpgradeBatchStatus
} from "../../../../lib/scrimedOSUpgradeBatch";
import {
  evaluateScrimedSafetyGate,
  scrimedSafetyHeaders
} from "../../../../lib/scrimedSafetyGovernance";

export function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: `${scrimedOSUpgradeBatchApiRoute}/brief`,
    requestedAction: "scrimed os upgrade batch brief synthetic metadata governance",
    inputText: "synthetic no-phi metadata-only upgrade batch brief internal testing buyer diligence",
    allowMetadataOnly: true
  });
  const headers = {
    "Cache-Control": "private, no-store",
    "Content-Disposition": "attachment; filename=\"scrimed-os-upgrade-batch.md\"",
    "Content-Type": "text/markdown; charset=utf-8",
    "X-SCRIMED-OS-Upgrade-Batch": scrimedOSUpgradeBatchStatus,
    "X-SCRIMED-Data-Boundary": "synthetic-metadata-only-no-live-phi",
    "X-SCRIMED-Production-Behavior": "disabled",
    "X-SCRIMED-External-Model-Calls": "disabled",
    "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
    "X-SCRIMED-Record-Mutation": "not-authorized",
    "X-SCRIMED-Patient-Outreach": "not-authorized",
    "X-SCRIMED-Payer-Submission": "not-authorized",
    ...scrimedSafetyHeaders(safety)
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "scrimed-os-upgrade-batch-brief-blocked",
          message: "SCRIMED OS upgrade batch brief is blocked by safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return new NextResponse(buildScrimedOSUpgradeBatchBrief(), { headers });
}
