import { NextResponse } from "next/server";
import { getPublicReleaseDiagnostics } from "../../lib/publicReleaseDiagnostics";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(getPublicReleaseDiagnostics(), {
    headers: {
      "Cache-Control": "no-store",
      "X-SCRIMED-Release-Authority": "not-authorized",
      "X-SCRIMED-Operating-Boundary": "synthetic-no-phi"
    }
  });
}
