import { NextResponse } from "next/server";
import { getProductConsoleSummary } from "../../../lib/productConsole";

export async function GET() {
  return NextResponse.json(getProductConsoleSummary());
}
