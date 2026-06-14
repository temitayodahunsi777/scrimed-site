import { NextResponse } from "next/server";
import { getPersistentAgentWorkspaceSummary } from "../../lib/persistentAgentWorkspace";

export async function GET() {
  return NextResponse.json(getPersistentAgentWorkspaceSummary());
}
