import { NextResponse } from "next/server";
import {
  guardedCreateSession,
  listWorkSessions,
  scrimedWorkHeaders,
  wrapWorkData
} from "../../../lib/scrimed-work";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(wrapWorkData({ sessions: listWorkSessions() }, "scrimed-work-sessions"), {
    headers: scrimedWorkHeaders()
  });
}

export async function POST(request: Request) {
  const result = await guardedCreateSession(request);

  if (!result.allowed) {
    return NextResponse.json(result.error, {
      status: result.status,
      headers: scrimedWorkHeaders({ "X-SCRIMED-Write-Authority": "fail-closed" }, request)
    });
  }

  return NextResponse.json(wrapWorkData(result.data, result.data.session.id), {
    status: result.status,
    headers: scrimedWorkHeaders({ "X-SCRIMED-Write-Authority": "authorized-aal2-durable-write" }, request)
  });
}
