import { NextResponse } from "next/server";
import { buildPersistentAgentWorkspaceBrief } from "../../../lib/persistentAgentWorkspace";

export async function GET() {
  return new NextResponse(buildPersistentAgentWorkspaceBrief(), {
    headers: {
      "Content-Disposition": "attachment; filename=\"scrimed-persistent-agent-workspace-brief.md\"",
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Data-Boundary": "synthetic-only"
    }
  });
}
