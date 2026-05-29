import { NextResponse } from "next/server";
import { getEventSummary } from "../../lib/hubOperations";

export async function GET() {
  return NextResponse.json(getEventSummary());
}
