import { NextResponse } from "next/server";

import {
  guardedTransitionSession,
  scrimedWorkHeaders,
  wrapWorkData
} from "../../../../../lib/scrimed-work";

export async function POST(
  request: Request,
  context: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await context.params;
  const result = await guardedTransitionSession(
    request,
    sessionId,
    "complete",
    "Completion requested after independent artifact review and mandatory verification."
  );

  if (!result.allowed) {
    return NextResponse.json(result.error, {
      status: result.status,
      headers: scrimedWorkHeaders({
        "X-SCRIMED-Work-Completion": "fail-closed",
        "X-SCRIMED-External-Distribution": "not-authorized",
        "X-SCRIMED-Payer-Submission": "not-authorized"
      })
    });
  }

  return NextResponse.json(wrapWorkData(result.data, `complete-${sessionId}`), {
    status: result.status,
    headers: scrimedWorkHeaders({
      "X-SCRIMED-Work-Completion": "verified-internal-work-complete",
      "X-SCRIMED-External-Distribution": "not-authorized",
      "X-SCRIMED-Payer-Submission": "not-authorized"
    })
  });
}
