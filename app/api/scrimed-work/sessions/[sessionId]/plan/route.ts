import { NextResponse } from "next/server";
import {
  guardedTransitionSession,
  previewOrchestration,
  scrimedWorkHeaders,
  wrapWorkData
} from "../../../../../lib/scrimed-work";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const result = await guardedTransitionSession(request, sessionId, "plan", "Protected planning requested.");

  if (!result.allowed) {
    return NextResponse.json(result.error, {
      status: result.status,
      headers: scrimedWorkHeaders({ "X-SCRIMED-Write-Authority": "fail-closed" }, request)
    });
  }

  return NextResponse.json(wrapWorkData({ ...result.data, orchestration: previewOrchestration(result.data.session) }, sessionId), {
    headers: scrimedWorkHeaders({ "X-SCRIMED-Write-Authority": "authorized-aal2-durable-write" }, request)
  });
}
