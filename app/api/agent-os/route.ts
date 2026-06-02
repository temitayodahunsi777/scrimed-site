import { NextResponse } from "next/server";
import { getAgentOSSummary } from "../../lib/agentOS";

export async function GET() {
  return NextResponse.json(getAgentOSSummary());
}
