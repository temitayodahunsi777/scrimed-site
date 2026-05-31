import { NextResponse } from "next/server";
import { getWorkflowResultValidationResults } from "../../../../lib/workflowResultValidation";

export async function GET() {
  return NextResponse.json(getWorkflowResultValidationResults());
}
