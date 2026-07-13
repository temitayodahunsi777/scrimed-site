import { NextResponse } from "next/server";
import {
  containsPhiRisk,
  containsTokenLikeField,
  scrimedWorkHeaders,
  searchScrimedWorkContext,
  wrapWorkData
} from "../../../../lib/scrimed-work";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);

  if (!payload || typeof payload !== "object" || containsTokenLikeField(payload) || containsPhiRisk(payload)) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "scrimed_work_context_search_rejected",
          message: "Context search accepts metadata-only, no-secret, no-PHI queries.",
          retryable: false
        },
        meta: { requestId: "req_scrimed_work_context_rejected", traceId: "trace_scrimed_work_context_rejected", timestamp: "2026-07-09T00:00:00.000Z" }
      },
      { status: 400, headers: scrimedWorkHeaders() }
    );
  }

  const body = payload as Record<string, unknown>;
  const result = searchScrimedWorkContext({
    query: typeof body.query === "string" ? body.query : "human review evidence",
    tenant: typeof body.tenant === "string" ? body.tenant : "synthetic-tenant",
    limit: typeof body.limit === "number" ? body.limit : 5
  });

  return NextResponse.json(wrapWorkData(result, "scrimed-work-context-search"), {
    headers: scrimedWorkHeaders({ "X-SCRIMED-Context-Search": "citation-required" })
  });
}
