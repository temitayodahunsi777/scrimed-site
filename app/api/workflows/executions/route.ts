import { NextResponse } from "next/server";
import { getWorkflowExecutionSummary } from "../../../lib/workflowExecutions";

export async function GET() {
  return NextResponse.json(getWorkflowExecutionSummary());
}
