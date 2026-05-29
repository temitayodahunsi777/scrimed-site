import { NextResponse } from "next/server";
import { getHubSummary } from "../../../lib/scrimedHub";

export async function GET() {
  return NextResponse.json(getHubSummary());
}
