import { NextResponse } from "next/server";
import {
  getWorkSession,
  scrimedWorkHeaders,
  verifyScrimedWorkResult,
  wrapWorkData
} from "../../../../../lib/scrimed-work";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const session = getWorkSession(sessionId);

  if (!session) {
    return NextResponse.json(
      {
        ok: false,
        error: { code: "scrimed_work_session_not_found", message: "Session not found.", retryable: false },
        meta: { requestId: "req_scrimed_work_verify_missing", traceId: "trace_scrimed_work_verify_missing", timestamp: "2026-07-09T00:00:00.000Z" }
      },
      { status: 404, headers: scrimedWorkHeaders() }
    );
  }

  return NextResponse.json(wrapWorkData(verifyScrimedWorkResult({ session }), sessionId), {
    headers: scrimedWorkHeaders({ "X-SCRIMED-Verification-Authority": "metadata-only" })
  });
}
