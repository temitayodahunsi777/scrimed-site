import { NextResponse } from "next/server";
import { getAgentWorkspaceGovernancePacksSummary } from "../../../lib/agentWorkspaceGovernancePacks";

export async function GET() {
  return NextResponse.json(getAgentWorkspaceGovernancePacksSummary(), {
    headers: {
      "X-SCRIMED-Data-Boundary": "synthetic-only"
    }
  });
}
