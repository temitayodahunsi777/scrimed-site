import { NextResponse } from "next/server";
import { runAgentEvaluation } from "../../../../lib/agentEvaluationWorkspace";
import {
  getAccessiblePilotWorkspace,
  getAuthenticatedPilotContext,
  getPilotSession,
  listPilotSessions,
  persistPilotSession
} from "../../../../lib/protectedPilotStore";
import { protectedPilotBoundary } from "../../../../lib/protectedPilotWorkspace";
import { enforceRequestRateLimit, rateLimitHeaders } from "../../../../lib/requestRateLimit";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ workspaceSlug: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  const context = await getAuthenticatedPilotContext(request);

  if (!context.ok) {
    return NextResponse.json(
      { error: { code: context.code, message: context.message }, boundary: protectedPilotBoundary },
      { status: context.status }
    );
  }

  const { workspaceSlug } = await params;
  const workspaceResult = await getAccessiblePilotWorkspace(context.client, workspaceSlug);

  if (workspaceResult.error || !workspaceResult.workspace) {
    return NextResponse.json(
      {
        error: {
          code: "pilot-workspace-not-found",
          message: "No tenant-isolated pilot workspace is available for this member and slug."
        }
      },
      { status: 404 }
    );
  }

  const result = await listPilotSessions(context.client, workspaceResult.workspace.id);

  if (result.error) {
    return NextResponse.json(
      {
        error: {
          code: "pilot-session-query-failed",
          message: "Durable synthetic pilot sessions could not be retrieved."
        }
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    service: "scrimed-protected-pilot-sessions",
    boundary: protectedPilotBoundary,
    workspace: workspaceResult.workspace,
    sessions: result.sessions
  });
}

export async function POST(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "protected-pilot-session-create",
    limit: 20,
    windowSeconds: 600
  });
  const headers = rateLimitHeaders(rateLimit);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Protected pilot session creation is temporarily rate limited."
        }
      },
      { status: 429, headers }
    );
  }

  const context = await getAuthenticatedPilotContext(request);

  if (!context.ok) {
    return NextResponse.json(
      { error: { code: context.code, message: context.message }, boundary: protectedPilotBoundary },
      { status: context.status, headers }
    );
  }

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json(
      {
        error: {
          code: "unsupported-content-type",
          message: "Protected pilot evaluations must use application/json."
        }
      },
      { status: 415, headers }
    );
  }

  const rawBody = await request.text();

  if (rawBody.length > 18000) {
    return NextResponse.json(
      {
        error: {
          code: "payload-too-large",
          message: "Protected pilot workspaces accept concise synthetic document packets only."
        }
      },
      { status: 413, headers }
    );
  }

  let payload: unknown;

  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { error: { code: "invalid-json", message: "Request body must be valid JSON." } },
      { status: 400, headers }
    );
  }

  const evaluation = runAgentEvaluation(payload);

  if (!evaluation.valid) {
    return NextResponse.json(
      {
        error: {
          code: "invalid-protected-pilot-evaluation",
          message: "The synthetic evaluation did not satisfy protected pilot boundaries.",
          fields: evaluation.errors
        }
      },
      { status: 422, headers }
    );
  }

  const { workspaceSlug } = await params;
  const persistence = await persistPilotSession(context.client, workspaceSlug, evaluation.record);

  if (persistence.error || !persistence.sessionId) {
    return NextResponse.json(
      {
        error: {
          code: "pilot-session-persistence-failed",
          message:
            "The evaluation was not accepted because the durable tenant session and append-only audit event could not be committed."
        }
      },
      { status: 502, headers }
    );
  }

  const workspaceResult = await getAccessiblePilotWorkspace(context.client, workspaceSlug);
  const sessionResult = workspaceResult.workspace
    ? await getPilotSession(context.client, workspaceResult.workspace.id, persistence.sessionId)
    : { session: null, error: null };

  return NextResponse.json(
    {
      service: "scrimed-protected-pilot-sessions",
      status: evaluation.record.status,
      boundary: protectedPilotBoundary,
      session: sessionResult.session ?? {
        id: persistence.sessionId,
        status: evaluation.record.status
      }
    },
    {
      status: evaluation.record.status === "production-request-denied" ? 423 : 201,
      headers
    }
  );
}
