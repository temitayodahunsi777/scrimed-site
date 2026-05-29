import { NextResponse } from "next/server";
import { getReadinessSummary } from "../../lib/hubOperations";

export async function GET() {
  return NextResponse.json(getReadinessSummary());
}
