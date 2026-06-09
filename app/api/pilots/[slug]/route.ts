import { NextResponse } from "next/server";
import {
  getDemosForPilot,
  getPilotProgramBySlug
} from "../../../lib/demoPilotPrograms";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const pilot = getPilotProgramBySlug(slug);

  if (!pilot) {
    return NextResponse.json({ error: "pilot_program_not_found", slug }, { status: 404 });
  }

  return NextResponse.json({
    service: "scrimed-pilot-program",
    pilot,
    includedDemos: getDemosForPilot(pilot)
  });
}
