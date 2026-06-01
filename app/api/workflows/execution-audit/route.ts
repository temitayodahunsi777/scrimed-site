import { NextResponse } from "next/server";
import { getWorkflowExecutionAuditSummary } from "../../../lib/workflowExecutionAudit";

export async function GET() {
  return NextResponse.json(getWorkflowExecutionAuditSummary());
}
