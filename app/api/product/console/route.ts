import { NextResponse } from "next/server";
import { getProductConsoleApiSummary } from "../../../lib/productConsole";

export async function GET() {
  return NextResponse.json(getProductConsoleApiSummary());
}
