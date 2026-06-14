import { NextResponse } from "next/server";
import {
  getAccessiblePilotWorkspace,
  getAgentWorkspaceWorkOrder,
  getAuthenticatedGovernanceContext,
  getAuthenticatedPilotContext,
  listAgentWorkspaceWorkOrderEvents,
  transitionAgentWorkspaceWorkOrder
} from "../../../../../lib/protectedPilotStore";
import {
  protectedPilotBoundary,
  protectedPilotNoStoreHeaders
} from "../../../../../lib/protectedPilotWorkspace";
import { validateAgentWorkspaceTransitionPayload } from "../../../../../lib/persistentAgentWorkspace";
import { enforceRequestRateLimit, rateLimitHeaders } from "../../../../../lib/requestRateLimit";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ workspaceSlug: string; workOrderId: string }>;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(request: Request, { params }: RouteContext) {
  const context = await getAuthenticatedPilotContext(request);

  if (!context.ok) {
    return NextResponse.json(
      { error: { code: context.code, message: context.message }, boundary: protectedPilotBoundary },
      { status: context.status, headers: protectedPilotNoStoreHeaders }
    );
  }

  const { workspaceSlug, workOrderId } = await params;

  if (!uuidPattern.test(workOrderId)) {
    return NextResponse.json(
      { error: { code: "invalid-work-order-id", message: "workOrderId must be a valid UUID." } },
      { status: 400, headers: protectedPilotNoStoreHeaders }
    );
  }

  const workspaceResult = await getAccessiblePilotWorkspace(context.client, workspaceSlug);

  if (workspaceResult.error || !workspaceResult.workspace) {
    return NextResponse.json(
      {
        error: {
          code: "pilot-workspace-not-found",
          message: "No tenant-isolated pilot workspace is available for this member and slug."
        }
      },
      { status: 404, headers: protectedPilotNoStoreHeaders }
    );
  }

  const workOrderResult = await getAgentWorkspaceWorkOrder(
    context.client,
    workspaceResult.workspace.id,
    workOrderId
  );

  if (workOrderResult.error) {
    return NextResponse.json(
      {
        error: {
          code: "agent-work-order-persistence-unavailable",
          message:
            "Persistent Agent Workspace work orders are not available for this environment. Apply the work-order migration and verify RLS before use."
        },
        boundary: protectedPilotBoundary
      },
      { status: 503, headers: protectedPilotNoStoreHeaders }
    );
  }

  if (!workOrderResult.workOrder) {
    return NextResponse.json(
      { error: { code: "agent-work-order-not-found", message: "No work order is visible for this workspace." } },
      { status: 404, headers: protectedPilotNoStoreHeaders }
    );
  }

  const eventsResult = await listAgentWorkspaceWorkOrderEvents(
    context.client,
    workspaceResult.workspace.id,
    workOrderId
  );

  if (eventsResult.error) {
    return NextResponse.json(
      {
        error: {
          code: "agent-work-order-events-unavailable",
          message:
            "The work order is visible, but its append-only event trail could not be retrieved for this environment."
        },
        boundary: protectedPilotBoundary
      },
      { status: 503, headers: protectedPilotNoStoreHeaders }
    );
  }

  return NextResponse.json(
    {
      service: "scrimed-agent-workspace-work-order",
      boundary: protectedPilotBoundary,
      workspace: workspaceResult.workspace,
      workOrder: workOrderResult.workOrder,
      events: eventsResult.events
    },
    { headers: protectedPilotNoStoreHeaders }
  );
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "agent-work-order-transition",
    limit: 60,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Persistent Agent Workspace state transitions are temporarily rate limited."
        }
      },
      { status: 429, headers }
    );
  }

  const context = await getAuthenticatedGovernanceContext(request);

  if (!context.ok) {
    return NextResponse.json(
      { error: { code: context.code, message: context.message }, boundary: protectedPilotBoundary },
      { status: context.status, headers }
    );
  }

  const { workspaceSlug, workOrderId } = await params;

  if (!uuidPattern.test(workOrderId)) {
    return NextResponse.json(
      { error: { code: "invalid-work-order-id", message: "workOrderId must be a valid UUID." } },
      { status: 400, headers }
    );
  }

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json(
      {
        error: {
          code: "unsupported-content-type",
          message: "Agent Workspace work-order transitions must use application/json."
        }
      },
      { status: 415, headers }
    );
  }

  const rawBody = await request.text();

  if (rawBody.length > 12000) {
    return NextResponse.json(
      {
        error: {
          code: "payload-too-large",
          message: "Agent Workspace transition payloads must remain concise and synthetic-only."
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

  const validation = validateAgentWorkspaceTransitionPayload(payload);

  if (!validation.ok) {
    return NextResponse.json(
      {
        error: {
          code: "invalid-agent-work-order-transition",
          message: "The transition payload did not satisfy SCRIMED Agent Workspace boundaries.",
          fields: validation.errors
        }
      },
      { status: 422, headers }
    );
  }

  const transition = await transitionAgentWorkspaceWorkOrder(
    context.client,
    workspaceSlug,
    workOrderId,
    validation.value
  );

  if (transition.error || !transition.eventId) {
    return NextResponse.json(
      {
        error: {
          code: "agent-work-order-transition-failed",
          message:
            "The work-order transition was not committed. Confirm the migration, RLS policies, role, state, and retry limits before retrying."
        },
        boundary: protectedPilotBoundary
      },
      { status: 503, headers }
    );
  }

  const workspaceResult = await getAccessiblePilotWorkspace(context.client, workspaceSlug);
  const workOrderResult = workspaceResult.workspace
    ? await getAgentWorkspaceWorkOrder(context.client, workspaceResult.workspace.id, workOrderId)
    : { workOrder: null, error: null };
  const eventsResult = workspaceResult.workspace
    ? await listAgentWorkspaceWorkOrderEvents(context.client, workspaceResult.workspace.id, workOrderId)
    : { events: [], error: null };

  return NextResponse.json(
    {
      service: "scrimed-agent-workspace-work-order",
      status: "work-order-transition-recorded",
      boundary: protectedPilotBoundary,
      eventId: transition.eventId,
      workOrder: workOrderResult.workOrder ?? { id: workOrderId },
      events: eventsResult.events
    },
    { headers }
  );
}
