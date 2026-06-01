import { NextResponse } from "next/server";
import { getWorkflowExecutionAuditBoundaryBySlug } from "../../../../lib/workflowExecutionAudit";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const boundary = getWorkflowExecutionAuditBoundaryBySlug(slug);

  if (!boundary) {
    return NextResponse.json({ error: "Workflow execution audit boundary not found" }, { status: 404 });
  }

  return NextResponse.json(boundary);
}
