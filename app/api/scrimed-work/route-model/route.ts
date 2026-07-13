import { NextResponse } from "next/server";
import {
  classifyWorkInput,
  containsPhiRisk,
  containsTokenLikeField,
  routeScrimedWorkModel,
  scrimedWorkHeaders,
  wrapWorkData
} from "../../../lib/scrimed-work";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);

  if (!payload || typeof payload !== "object" || containsTokenLikeField(payload) || containsPhiRisk(payload)) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "scrimed_work_model_route_rejected",
          message: "Model routing accepts metadata-only, no-secret, no-PHI task descriptions.",
          retryable: false
        },
        meta: { requestId: "req_scrimed_work_route_model_rejected", traceId: "trace_scrimed_work_route_model_rejected", timestamp: "2026-07-09T00:00:00.000Z" }
      },
      { status: 400, headers: scrimedWorkHeaders() }
    );
  }

  const body = payload as Record<string, unknown>;
  const taskType = typeof body.taskType === "string" ? body.taskType : "synthetic metadata work routing";
  const decision = routeScrimedWorkModel({
    taskType,
    risk: body.risk === "high" || body.risk === "moderate" || body.risk === "prohibited" ? body.risk : "low",
    requiredCapability:
      body.requiredCapability === "coding" ||
      body.requiredCapability === "vision" ||
      body.requiredCapability === "voice" ||
      body.requiredCapability === "embedding" ||
      body.requiredCapability === "reranking" ||
      body.requiredCapability === "local-private" ||
      body.requiredCapability === "reasoning"
        ? body.requiredCapability
        : "balanced",
    dataClassification: classifyWorkInput(payload),
    latencyTargetMs: typeof body.latencyTargetMs === "number" ? body.latencyTargetMs : 3_000,
    budgetUsd: typeof body.budgetUsd === "number" ? body.budgetUsd : 0.05,
    tenantPolicy: typeof body.tenantPolicy === "string" ? body.tenantPolicy : "synthetic no-phi",
    reasoningRequirement: body.reasoningRequirement === "high" || body.reasoningRequirement === "low" ? body.reasoningRequirement : "medium",
    qualityThreshold: typeof body.qualityThreshold === "number" ? body.qualityThreshold : 0.85
  });

  return NextResponse.json(wrapWorkData(decision, "scrimed-work-route-model"), {
    headers: scrimedWorkHeaders()
  });
}
