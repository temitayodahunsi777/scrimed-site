import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "scrimed-site",
    status: "ready"
  });
}
