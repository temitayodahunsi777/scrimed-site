import { NextResponse } from "next/server";
import { getAgentWorkflowSummary } from "../../../lib/agentWorkflows";

export async function GET() {
  return NextResponse.json(getAgentWorkflowSummary());
}
