import { NextResponse } from "next/server";
import {
  getScrimedAgentGovernanceSummary,
  scrimedAgentGovernanceApiRoute,
  scrimedAgentGovernanceStatus
} from "../../lib/scrimedAgentGovernance";
import { evaluateScrimedSafetyGate, scrimedSafetyHeaders } from "../../lib/scrimedSafetyGovernance";

export function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: scrimedAgentGovernanceApiRoute,
    requestedAction: "scrimed agent governance synthetic metadata policy preview internal testing",
    inputText: "synthetic no-phi metadata-only agent governance identity policy risk review",
    allowMetadataOnly: true
  });
  const headers = {
    "Cache-Control": "private, no-store",
    "X-SCRIMED-Code-PT-4": scrimedAgentGovernanceStatus,
    "X-SCRIMED-Data-Boundary": "synthetic-no-phi-metadata-only",
    ...scrimedSafetyHeaders(safety)
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "scrimed-agent-governance-blocked",
          message: "SCRIMED Agent Governance is blocked by safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return NextResponse.json(getScrimedAgentGovernanceSummary(), { headers });
}
