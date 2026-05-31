import { NextResponse } from "next/server";
import { getWorkflowExecutionResultSummary } from "../../../lib/workflowExecutionResults";

export async function GET() {
  return NextResponse.json(getWorkflowExecutionResultSummary());
}
