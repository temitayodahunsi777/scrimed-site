import { NextResponse } from "next/server";
import { getWorkflowImplementationReadinessSummary } from "../../../lib/workflowImplementationReadiness";

export async function GET() {
  return NextResponse.json(getWorkflowImplementationReadinessSummary());
}
