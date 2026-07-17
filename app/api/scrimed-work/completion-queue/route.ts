import { NextResponse } from "next/server";

import {
  guardedListProtectedCompletionQueue,
  scrimedWorkCompletionEvidencePolicyVersion,
  scrimedWorkCompletionQueuePolicyVersion,
  scrimedWorkHeaders,
  wrapWorkData
} from "../../../lib/scrimed-work";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const result = await guardedListProtectedCompletionQueue(request);
  const completionReadMode = result.allowed ? result.data.mode : "denied";
  const completionPolicy = result.allowed
    ? result.data.policyVersion
    : scrimedWorkCompletionQueuePolicyVersion;
  const headers = scrimedWorkHeaders({
    "X-SCRIMED-Completion-Queue": result.allowed
      ? "operator-only-aal2-tenant-scoped-metadata"
      : "fail-closed",
    "X-SCRIMED-Completion-Read-Mode": completionReadMode,
    "X-SCRIMED-Completion-Queue-Policy": completionPolicy,
    "X-SCRIMED-Completion-Evidence-Policy": scrimedWorkCompletionEvidencePolicyVersion,
    "X-SCRIMED-External-Distribution": "not-authorized",
    "X-SCRIMED-Payer-Submission": "not-authorized",
    "X-SCRIMED-EHR-Writeback": "not-authorized"
  });

  if (!result.allowed) {
    return NextResponse.json(result.error, { status: result.status, headers });
  }

  const auditEventId = result.data.mode === "evidence"
    ? result.data.evidence.auditEventId
    : result.data.queue.auditEventId;

  return NextResponse.json(
    wrapWorkData(result.data, auditEventId),
    { status: result.status, headers }
  );
}
