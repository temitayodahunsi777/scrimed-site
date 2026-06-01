import { NextResponse } from "next/server";
import { getWorkflowExecutionContractSummary } from "../../../lib/workflowExecutionContracts";

export async function GET() {
  return NextResponse.json(getWorkflowExecutionContractSummary());
}
