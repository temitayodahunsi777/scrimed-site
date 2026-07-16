import { NextResponse } from "next/server";

import {
  guardedListProtectedCompletionQueue,
  scrimedWorkCompletionQueuePolicyVersion,
  scrimedWorkHeaders,
  wrapWorkData
} from "../../../lib/scrimed-work";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const result = await guardedListProtectedCompletionQueue(request);
  const headers = scrimedWorkHeaders({
    "X-SCRIMED-Completion-Queue": result.allowed
      ? "operator-only-aal2-tenant-scoped-metadata"
      : "fail-closed",
    "X-SCRIMED-Completion-Queue-Policy": scrimedWorkCompletionQueuePolicyVersion,
    "X-SCRIMED-External-Distribution": "not-authorized",
    "X-SCRIMED-Payer-Submission": "not-authorized",
    "X-SCRIMED-EHR-Writeback": "not-authorized"
  });

  if (!result.allowed) {
    return NextResponse.json(result.error, { status: result.status, headers });
  }

  return NextResponse.json(
    wrapWorkData(result.data, result.data.queue.auditEventId),
    { status: result.status, headers }
  );
}
