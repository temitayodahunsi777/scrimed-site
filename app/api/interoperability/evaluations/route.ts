import { NextResponse } from "next/server";
import { getInteroperabilityConformanceEvaluationSummary } from "../../../lib/interoperabilityConformanceEvaluations";

export async function GET() {
  return NextResponse.json(getInteroperabilityConformanceEvaluationSummary());
}
