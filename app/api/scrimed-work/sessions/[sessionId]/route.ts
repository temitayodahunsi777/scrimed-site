import { NextResponse } from "next/server";
import { getSessionOrError, scrimedWorkHeaders } from "../../../../lib/scrimed-work";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const result = getSessionOrError(sessionId);

  return NextResponse.json(result.body, {
    status: result.status,
    headers: scrimedWorkHeaders()
  });
}
