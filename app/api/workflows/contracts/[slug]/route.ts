import { NextResponse } from "next/server";
import { getWorkflowExecutionContractBySlug } from "../../../../lib/workflowExecutionContracts";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const contract = getWorkflowExecutionContractBySlug(slug);

  if (!contract) {
    return NextResponse.json({ error: "Workflow execution contract not found" }, { status: 404 });
  }

  return NextResponse.json(contract);
}
