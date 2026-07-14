import { NextResponse } from "next/server";

import {
  guardedListProtectedArtifactReviewQueue,
  scrimedWorkHeaders,
  scrimedWorkReviewQueuePolicyVersion,
  wrapWorkData
} from "../../../lib/scrimed-work";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const result = await guardedListProtectedArtifactReviewQueue(request);
  const headers = scrimedWorkHeaders({
    "X-SCRIMED-Review-Queue": result.allowed
      ? "reviewer-only-aal2-tenant-scoped-metadata"
      : "fail-closed",
    "X-SCRIMED-Review-Queue-Policy": scrimedWorkReviewQueuePolicyVersion,
    "X-SCRIMED-External-Distribution": "not-authorized",
    "X-SCRIMED-Payer-Submission": "not-authorized"
  });

  if (!result.allowed) {
    return NextResponse.json(result.error, { status: result.status, headers });
  }

  return NextResponse.json(
    wrapWorkData(result.data, result.data.queue.auditEventId),
    { status: result.status, headers }
  );
}
