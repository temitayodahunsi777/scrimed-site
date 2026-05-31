import { NextResponse } from "next/server";
import { getWorkflowExecutionResultBySlug } from "../../../../lib/workflowExecutionResults";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const result = getWorkflowExecutionResultBySlug(slug);

  if (!result) {
    return NextResponse.json({ error: "Workflow execution result not found" }, { status: 404 });
  }

  return NextResponse.json(result);
}
