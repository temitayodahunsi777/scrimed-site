import { NextResponse } from "next/server";
import {
  getScrimedOSUpgradeBatchSummary,
  scrimedOSUpgradeBatchApiRoute,
  scrimedOSUpgradeBatchStatus
} from "../../../lib/scrimedOSUpgradeBatch";
import {
  evaluateScrimedSafetyGate,
  scrimedSafetyHeaders
} from "../../../lib/scrimedSafetyGovernance";

export function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: scrimedOSUpgradeBatchApiRoute,
    requestedAction: "scrimed os upgrade batch synthetic metadata runtime prompt judge oversight agent lab economics registry governance",
    inputText: "synthetic no-phi metadata-only governance runtime optimization prompt evolution judge scores oversight queue no live model calls",
    allowMetadataOnly: true
  });
  const headers = {
    "Cache-Control": "private, no-store",
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
          code: "scrimed-os-upgrade-batch-blocked",
          message: "SCRIMED OS upgrade batch is blocked by safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return NextResponse.json(getScrimedOSUpgradeBatchSummary(), { headers });
}
