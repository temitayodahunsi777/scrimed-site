import { NextResponse } from "next/server";
import { getPilotEvidenceDashboard } from "../../lib/pilotEvidenceDashboard";

export async function GET() {
  return NextResponse.json(getPilotEvidenceDashboard());
}
