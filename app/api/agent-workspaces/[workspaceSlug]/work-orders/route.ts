import { NextResponse } from "next/server";
import {
  createAgentWorkspaceWorkOrder,
  getAccessiblePilotWorkspace,
  getAgentWorkspaceWorkOrder,
  getAuthenticatedGovernanceContext,
  getAuthenticatedPilotContext,
  listAgentWorkspaceWorkOrders
} from "../../../../lib/protectedPilotStore";
import {
  protectedPilotBoundary,
  protectedPilotNoStoreHeaders
} from "../../../../lib/protectedPilotWorkspace";
import {
  filterAgentWorkspaceWorkOrders,
  parseAgentWorkspaceWorkOrderFilters,
  summarizeAgentWorkspaceWorkOrderDashboard,
  validateAgentWorkspaceWorkOrderPayload
} from "../../../../lib/persistentAgentWorkspace";
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
      { status: context.status, headers: protectedPilotNoStoreHeaders }
    );
  }

  const { workspaceSlug } = await params;
  const url = new URL(request.url);
  const filterValidation = parseAgentWorkspaceWorkOrderFilters(url.searchParams);

  if (!filterValidation.ok) {
    return NextResponse.json(
      {
        error: {
          code: "invalid-agent-work-order-filters",
          message: "The work-order dashboard filters are invalid.",
          fields: filterValidation.errors
        },
        boundary: protectedPilotBoundary
      },
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

  const result = await listAgentWorkspaceWorkOrders(context.client, workspaceResult.workspace.id);

  if (result.error) {
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

  const workOrders = filterAgentWorkspaceWorkOrders(result.workOrders, filterValidation.value);
  const dashboard = summarizeAgentWorkspaceWorkOrderDashboard(result.workOrders, workOrders);

  return NextResponse.json(
    {
      service: "scrimed-agent-workspace-work-orders",
      boundary: protectedPilotBoundary,
      workspace: workspaceResult.workspace,
      filters: filterValidation.value,
      dashboard,
      workOrders
    },
    { headers: protectedPilotNoStoreHeaders }
  );
}

export async function POST(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "agent-work-order-create",
    limit: 30,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Persistent Agent Workspace work-order creation is temporarily rate limited."
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

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json(
      {
        error: {
          code: "unsupported-content-type",
          message: "Agent Workspace work-order creation must use application/json."
        }
      },
      { status: 415, headers }
    );
  }

  const rawBody = await request.text();

  if (rawBody.length > 16000) {
    return NextResponse.json(
      {
        error: {
          code: "payload-too-large",
          message: "Agent Workspace work-order payloads must remain concise and synthetic-only."
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

  const validation = validateAgentWorkspaceWorkOrderPayload(payload);

  if (!validation.ok) {
    return NextResponse.json(
      {
        error: {
          code: "invalid-agent-work-order",
          message: "The work-order payload did not satisfy SCRIMED Agent Workspace boundaries.",
          fields: validation.errors
        }
      },
      { status: 422, headers }
    );
  }

  const { workspaceSlug } = await params;
  const persistence = await createAgentWorkspaceWorkOrder(context.client, workspaceSlug, validation.value);

  if (persistence.error || !persistence.workOrderId) {
    return NextResponse.json(
      {
        error: {
          code: "agent-work-order-persistence-failed",
          message:
            "The work order was not committed. Confirm the agent workspace migration, RLS policies, grants, and tenant role before retrying."
        },
        boundary: protectedPilotBoundary
      },
      { status: 503, headers }
    );
  }

  const workspaceResult = await getAccessiblePilotWorkspace(context.client, workspaceSlug);
  const workOrderResult = workspaceResult.workspace
    ? await getAgentWorkspaceWorkOrder(context.client, workspaceResult.workspace.id, persistence.workOrderId)
    : { workOrder: null, error: null };

  return NextResponse.json(
    {
      service: "scrimed-agent-workspace-work-orders",
      status: "work-order-created",
      boundary: protectedPilotBoundary,
      workOrder: workOrderResult.workOrder ?? { id: persistence.workOrderId }
    },
    { status: 201, headers }
  );
}
