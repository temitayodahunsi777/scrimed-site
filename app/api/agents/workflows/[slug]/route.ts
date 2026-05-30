import { NextResponse } from "next/server";
import { getAgentWorkflowBySlug } from "../../../../lib/agentWorkflows";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const workflow = getAgentWorkflowBySlug(slug);

  if (!workflow) {
    return NextResponse.json(
      { error: "agent_workflow_not_found", slug },
      { status: 404 }
    );
  }

  return NextResponse.json({
    service: "scrimed-agent-workflow",
    workflow
  });
}
