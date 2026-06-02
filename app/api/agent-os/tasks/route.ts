import { NextResponse } from "next/server";
import {
  buildAgentOSTaskPlan,
  getAgentOSSummary,
  validateAgentOSTaskPayload
} from "../../../lib/agentOS";

export const dynamic = "force-dynamic";

export async function GET() {
  const summary = getAgentOSSummary();

  return NextResponse.json({
    service: "scrimed-agentos-task-execution-engine",
    status: "synthetic-planning-ready",
    route: "/api/agent-os/tasks",
    boundary: summary.boundary,
    taskExecutionEngine: summary.taskExecutionEngine,
    requiredFields: [
      "taskType",
      "mode",
      "workflowTarget",
      "objective",
      "dataBoundaryAcknowledged"
    ],
    updated: summary.updated
  });
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return NextResponse.json(
      {
        error: "unsupported-content-type",
        message: "AgentOS task requests must use application/json."
      },
      { status: 415 }
    );
  }

  const rawBody = await request.text();

  if (rawBody.length > 16000) {
    return NextResponse.json(
      {
        error: "payload-too-large",
        message: "AgentOS v1 accepts concise workflow-scope requests only."
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

  const validation = validateAgentOSTaskPayload(payload);

  if (!validation.valid || !validation.submission) {
    return NextResponse.json(
      {
        error: "invalid-agentos-task",
        errors: validation.errors
      },
      { status: 422 }
    );
  }

  const plan = buildAgentOSTaskPlan(validation.submission);
  const status = plan.status === "denied-production-request" ? 423 : 202;

  return NextResponse.json(
    {
      status: plan.status,
      plan,
      nextActions:
        plan.status === "denied-production-request"
          ? [
              "Use synthetic-pilot or enterprise-assessment mode.",
              "Complete tenant identity, BAA, connector, durable audit, and approval controls before production execution."
            ]
          : [
              "Review the task plan with the enterprise sponsor.",
              "Attach source evidence and Trust Cards before any recommendation is released.",
              "Route to the required human approval checkpoints."
            ]
    },
    { status }
  );
}
