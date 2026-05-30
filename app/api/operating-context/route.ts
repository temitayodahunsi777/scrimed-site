import { NextResponse } from "next/server";
import { operatingContext } from "../../lib/operatingContext";

export async function GET() {
  return NextResponse.json({
    service: "scrimed-operating-context",
    context: operatingContext
  });
}
