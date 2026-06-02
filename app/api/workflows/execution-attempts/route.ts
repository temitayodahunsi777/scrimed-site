import { NextResponse } from "next/server";
import { getExecutionAttemptReadinessSummary } from "../../../lib/executionAttemptReadiness";

export async function GET() {
  return NextResponse.json(getExecutionAttemptReadinessSummary());
}
