import { NextResponse } from "next/server";
import {
  getSessionOrError,
  guardedGetProtectedWorkSession,
  scrimedWorkHeaders,
  wrapWorkData
} from "../../../../lib/scrimed-work";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const fixture = getSessionOrError(sessionId);

  if (fixture.ok) {
    return NextResponse.json(fixture.body, {
      status: fixture.status,
      headers: scrimedWorkHeaders({ "X-SCRIMED-Read-Authority": "public-synthetic-fixture" })
    });
  }

  const result = await guardedGetProtectedWorkSession(request, sessionId);

  if (!result.allowed) {
    return NextResponse.json(result.error, {
      status: result.status,
      headers: scrimedWorkHeaders({ "X-SCRIMED-Read-Authority": "fail-closed" })
    });
  }

  return NextResponse.json(wrapWorkData(result.data.session, sessionId), {
    status: result.status,
    headers: scrimedWorkHeaders({ "X-SCRIMED-Read-Authority": "authorized-aal2-durable-read" })
  });
}
