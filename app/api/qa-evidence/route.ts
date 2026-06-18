import { NextResponse } from "next/server";
import { getQaEvidenceLedger } from "../../lib/qaEvidenceLedger";

export async function GET() {
  return NextResponse.json(getQaEvidenceLedger(), {
    headers: {
      "X-SCRIMED-Data-Boundary": "synthetic-only"
    }
  });
}
