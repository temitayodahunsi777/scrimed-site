import { NextResponse } from "next/server";

import {
  guardedCreatePayerIqProtectedHandoff,
  payerIqProtectedHandoffStatus,
  scrimedWorkHeaders,
  wrapWorkData
} from "../../../lib/scrimed-work";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const result = await guardedCreatePayerIqProtectedHandoff(request);
  const headers = scrimedWorkHeaders({
    "X-SCRIMED-PayerIQ-Handoff": result.allowed ? payerIqProtectedHandoffStatus : "fail-closed",
    "X-SCRIMED-Artifact-Review": "independent-aal2-reviewer-required",
    "X-SCRIMED-External-Distribution": "not-authorized",
    "X-SCRIMED-Payer-Submission": "not-authorized"
  }, request);

  if (!result.allowed) {
    return NextResponse.json(result.error, { status: result.status, headers });
  }

  return NextResponse.json(wrapWorkData(result.data, result.data.session.id), {
    status: result.status,
    headers
  });
}
