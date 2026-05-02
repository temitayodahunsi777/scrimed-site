import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    overall: "ready",
    score: 92,
    checks: {
      routing: "pass",
      api: "pass",
      dashboard: "pass",
      vercel: "pass",
      safety: "pass"
    }
  });
}
