import { NextResponse } from "next/server";
import {
  containsPhiRisk,
  containsTokenLikeField,
  scrimedWorkHeaders,
  simulateVoiceWorkflow,
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
          code: "scrimed_work_voice_simulation_rejected",
          message: "Voice simulation accepts no-PHI transcript metadata only and never stores raw audio.",
          retryable: false
        },
        meta: { requestId: "req_scrimed_work_voice_rejected", traceId: "trace_scrimed_work_voice_rejected", timestamp: "2026-07-09T00:00:00.000Z" }
      },
      { status: 400, headers: scrimedWorkHeaders() }
    );
  }

  const body = payload as Record<string, unknown>;
  const simulation = simulateVoiceWorkflow({
    transcript: typeof body.transcript === "string" ? body.transcript : "Prepare a synthetic review briefing.",
    language: typeof body.language === "string" ? body.language : "en-US",
    consentAcknowledged: body.consentAcknowledged === true
  });

  return NextResponse.json(wrapWorkData(simulation, "scrimed-work-voice-simulation"), {
    headers: scrimedWorkHeaders({ "X-SCRIMED-Voice-Authority": "simulation-only-no-raw-audio" })
  });
}
