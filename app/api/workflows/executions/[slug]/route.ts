import { NextResponse } from "next/server";
import {
  getWorkflowExecutionBySlug,
  getWorkflowExecutionReadinessBySlug
} from "../../../../lib/workflowExecutions";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const workflow = getWorkflowExecutionBySlug(slug);
  const readiness = getWorkflowExecutionReadinessBySlug(slug);

  if (!workflow || !readiness) {
    return NextResponse.json({ error: "Workflow execution not found" }, { status: 404 });
  }

  return NextResponse.json({ workflow, readiness });
}
