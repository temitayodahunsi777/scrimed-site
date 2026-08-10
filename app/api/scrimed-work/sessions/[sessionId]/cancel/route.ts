import { NextResponse } from "next/server";
import { guardedTransitionSession, scrimedWorkHeaders, wrapWorkData } from "../../../../../lib/scrimed-work";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const result = await guardedTransitionSession(request, sessionId, "cancel", "Protected cancellation requested and propagated to planned steps.");

  if (!result.allowed) {
    return NextResponse.json(result.error, {
      status: result.status,
      headers: scrimedWorkHeaders({ "X-SCRIMED-Write-Authority": "fail-closed" }, request)
    });
  }

  return NextResponse.json(wrapWorkData(result.data, sessionId), {
    headers: scrimedWorkHeaders({ "X-SCRIMED-Session-Control": "cancelled-aal2-durable-write" }, request)
  });
}
