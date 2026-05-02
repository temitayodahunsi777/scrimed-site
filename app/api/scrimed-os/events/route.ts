import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    events: [
      "Guardian initialized",
      "ROI Engine online",
      "Spec-to-Agent ready",
      "TrustCore active",
      "Vercel-safe deployment prepared"
    ]
  });
}
