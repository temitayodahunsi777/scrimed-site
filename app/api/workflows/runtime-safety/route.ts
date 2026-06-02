import { NextResponse } from "next/server";
import { getRuntimeSafetyReadinessSummary } from "../../../lib/runtimeSafetyReadiness";

export async function GET() {
  return NextResponse.json(getRuntimeSafetyReadinessSummary());
}
