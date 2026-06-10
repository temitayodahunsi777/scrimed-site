import { NextResponse } from "next/server";
import { getProtectedPilotWorkspaceSummary } from "../../../lib/protectedPilotWorkspace";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getProtectedPilotWorkspaceSummary());
}
