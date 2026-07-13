import { NextResponse } from "next/server";
import {
  buildScrimedAgentGovernanceBrief,
  scrimedAgentGovernanceBriefRoute,
  scrimedAgentGovernanceStatus
} from "../../../lib/scrimedAgentGovernance";
import { evaluateScrimedSafetyGate, scrimedSafetyHeaders } from "../../../lib/scrimedSafetyGovernance";

export function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: scrimedAgentGovernanceBriefRoute,
    requestedAction: "scrimed agent governance brief synthetic metadata internal testing",
    inputText: "synthetic no-phi metadata-only governance brief",
    allowMetadataOnly: true
  });
  const headers = {
    ...scrimedSafetyHeaders(safety),
    "Content-Disposition": "attachment; filename=\"scrimed-agent-governance.md\"",
    "Content-Type": "text/markdown; charset=utf-8",
    "X-SCRIMED-Code-PT-4": scrimedAgentGovernanceStatus,
    "X-SCRIMED-Data-Boundary": "synthetic-no-phi-metadata-only"
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "scrimed-agent-governance-brief-blocked",
          message: "SCRIMED Agent Governance brief is blocked by safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return new NextResponse(buildScrimedAgentGovernanceBrief(), { headers });
}
