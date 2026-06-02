import { NextResponse } from "next/server";
import {
  getAgentEvaluationWorkspaceSummary,
  runAgentEvaluation
} from "../../../lib/agentEvaluationWorkspace";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getAgentEvaluationWorkspaceSummary());
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return NextResponse.json(
      {
        error: "unsupported-content-type",
        message: "AgentOS evaluations must use application/json."
      },
      { status: 415 }
    );
  }

  const rawBody = await request.text();

  if (rawBody.length > 18000) {
    return NextResponse.json(
      {
        error: "payload-too-large",
        message: "AgentOS Evaluation Workspace accepts concise synthetic document packets only."
      },
      { status: 413 }
    );
  }

  let payload: unknown;

  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      {
        error: "invalid-json",
        message: "Request body must be valid JSON."
      },
      { status: 400 }
    );
  }

  const evaluation = runAgentEvaluation(payload);

  if (!evaluation.valid) {
    return NextResponse.json(
      {
        error: "invalid-agentos-evaluation",
        errors: evaluation.errors
      },
      { status: 422 }
    );
  }

  return NextResponse.json(
    {
      status: evaluation.record.status,
      evaluation: evaluation.record
    },
    { status: evaluation.record.status === "production-request-denied" ? 423 : 202 }
  );
}
