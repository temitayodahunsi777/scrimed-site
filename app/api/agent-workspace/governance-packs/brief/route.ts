import { NextResponse } from "next/server";
import { buildAgentWorkspaceGovernancePacksBrief } from "../../../../lib/agentWorkspaceGovernancePacks";

export async function GET() {
  return new NextResponse(buildAgentWorkspaceGovernancePacksBrief(), {
    headers: {
      "Content-Disposition": "attachment; filename=\"scrimed-agent-workspace-governance-packs.md\"",
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Data-Boundary": "synthetic-only"
    }
  });
}
