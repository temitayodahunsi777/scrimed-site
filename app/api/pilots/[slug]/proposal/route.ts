import { NextResponse } from "next/server";
import { buildPilotProposal, getPilotProgramBySlug } from "../../../../lib/demoPilotPrograms";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const pilot = getPilotProgramBySlug(slug);

  if (!pilot) {
    return NextResponse.json({ error: "pilot_program_not_found", slug }, { status: 404 });
  }

  return new NextResponse(buildPilotProposal(pilot), {
    headers: {
      "Content-Disposition": `attachment; filename="scrimed-${pilot.slug}-pilot-proposal.md"`,
      "Content-Type": "text/markdown; charset=utf-8"
    }
  });
}
