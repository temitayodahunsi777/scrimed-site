import { NextResponse } from "next/server";
import { getQaEvidenceActivationPlan } from "../../../lib/qaEvidenceLedger";

export async function GET() {
  return NextResponse.json(getQaEvidenceActivationPlan(), {
    headers: {
      "X-SCRIMED-Data-Boundary": "synthetic-only"
    }
  });
}
