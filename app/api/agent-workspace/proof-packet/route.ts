import { NextResponse } from "next/server";
import { buildPersistentAgentWorkspaceProofPacket } from "../../../lib/persistentAgentWorkspace";

export async function GET() {
  return new NextResponse(buildPersistentAgentWorkspaceProofPacket(), {
    headers: {
      "Content-Disposition": "attachment; filename=\"scrimed-agent-workspace-proof-packet.md\"",
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Data-Boundary": "synthetic-only"
    }
  });
}
