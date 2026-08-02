import { NextResponse } from "next/server";
import {
  getScrimedAgentTeamSummary,
  scrimedWorkAgents,
  scrimedWorkHeaders,
  wrapWorkData
} from "../../../lib/scrimed-work";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    wrapWorkData(
      { agents: scrimedWorkAgents, teams: getScrimedAgentTeamSummary() },
      "scrimed-work-agents"
    ),
    { headers: scrimedWorkHeaders() }
  );
}
