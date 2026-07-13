import { NextResponse } from "next/server";
import {
  getScrimedProofPacketStudioSummary,
  scrimedProofPacketStudioApiRoute,
  scrimedProofPacketStudioStatus
} from "../../lib/scrimedProofPacketStudio";
import { evaluateScrimedSafetyGate, scrimedSafetyHeaders } from "../../lib/scrimedSafetyGovernance";

export const dynamic = "force-dynamic";

export function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: scrimedProofPacketStudioApiRoute,
    requestedAction:
      "scrimed proof packet studio synthetic metadata investor buyer demo pilot partner operator proof route pricing internal testing",
    inputText:
      "synthetic no-phi metadata-only proof packet investor buyer demo pilot partner operator route pricing evidence internal testing",
    allowMetadataOnly: true
  });
  const headers = {
    "Cache-Control": "private, no-store",
    "X-SCRIMED-Proof-Packet-Studio": scrimedProofPacketStudioStatus,
    "X-SCRIMED-Data-Boundary": "synthetic-and-metadata-only",
    ...scrimedSafetyHeaders(safety)
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "scrimed-proof-packet-studio-blocked",
          message: "SCRIMED Proof Packet Studio is blocked by safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return NextResponse.json(getScrimedProofPacketStudioSummary(), { headers });
}
