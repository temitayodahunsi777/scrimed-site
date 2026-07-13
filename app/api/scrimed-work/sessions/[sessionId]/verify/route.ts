import { NextResponse } from "next/server";
import {
  getWorkSession,
  guardedVerifyProtectedWorkSession,
  scrimedWorkHeaders,
  verifyScrimedWorkResult,
  wrapWorkData
} from "../../../../../lib/scrimed-work";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const session = getWorkSession(sessionId);

  if (session) {
    return NextResponse.json(wrapWorkData(verifyScrimedWorkResult({ session }), sessionId), {
      headers: scrimedWorkHeaders({ "X-SCRIMED-Verification-Authority": "public-synthetic-fixture" })
    });
  }

  const result = await guardedVerifyProtectedWorkSession(request, sessionId);

  if (!result.allowed) {
    return NextResponse.json(result.error, {
      status: result.status,
      headers: scrimedWorkHeaders({ "X-SCRIMED-Verification-Authority": "fail-closed" })
    });
  }

  return NextResponse.json(wrapWorkData(result.data, sessionId), {
    status: result.status,
    headers: scrimedWorkHeaders({ "X-SCRIMED-Verification-Authority": "authorized-aal2-durable-read" })
  });
}
