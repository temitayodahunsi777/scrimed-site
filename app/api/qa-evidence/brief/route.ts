import { NextResponse } from "next/server";
import { buildQaEvidenceBrief } from "../../../lib/qaEvidenceLedger";

export async function GET() {
  return new NextResponse(buildQaEvidenceBrief(), {
    headers: {
      "Content-Disposition": "attachment; filename=\"scrimed-qa-evidence-ledger-brief.md\"",
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Data-Boundary": "synthetic-only"
    }
  });
}
