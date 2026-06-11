import { NextResponse } from "next/server";
import {
  getAuthenticatedGovernanceContext,
  getTenantAccessDashboard,
  updateTenantMembershipRole
} from "../../../../lib/protectedPilotStore";
import {
  pilotWorkspaceRoles,
  protectedPilotBoundary,
  protectedPilotNoStoreHeaders,
  type PilotWorkspaceRole
} from "../../../../lib/protectedPilotWorkspace";
import { enforceRequestRateLimit, rateLimitHeaders } from "../../../../lib/requestRateLimit";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ workspaceSlug: string }>;
};

const allowedRoles = new Set<PilotWorkspaceRole>(pilotWorkspaceRoles.map((entry) => entry.role));

function statusForTenantAccessError(message: string) {
  if (message.includes("tenant-access-final-admin-protected")) return 409;
  if (message.includes("tenant-access-membership-not-found")) return 404;
  if (message.includes("role-denied") || message.includes("admin-required")) return 403;
  return 502;
}

export async function GET(request: Request, { params }: RouteContext) {
  const context = await getAuthenticatedGovernanceContext(request);

  if (!context.ok) {
    return NextResponse.json(
      { error: { code: context.code, message: context.message }, boundary: protectedPilotBoundary },
      { status: context.status, headers: protectedPilotNoStoreHeaders }
    );
  }

  const { workspaceSlug } = await params;
  const result = await getTenantAccessDashboard(context.client, workspaceSlug);

  if (result.error || !result.dashboard) {
    return NextResponse.json(
      {
        error: {
          code: "tenant-access-query-failed",
          message: "Tenant access administration is unavailable for this workspace and identity."
        },
        boundary: protectedPilotBoundary
      },
      {
        status: statusForTenantAccessError(result.error?.message ?? ""),
        headers: protectedPilotNoStoreHeaders
      }
    );
  }

  return NextResponse.json(
    {
      service: "scrimed-tenant-access-administration",
      boundary: protectedPilotBoundary,
      dashboard: result.dashboard
    },
    { headers: protectedPilotNoStoreHeaders }
  );
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "tenant-access-role-change",
    limit: 20,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Tenant membership role changes are temporarily rate limited."
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
      { error: { code: "unsupported-content-type", message: "Tenant role changes must use application/json." } },
      { status: 415, headers }
    );
  }

  const rawBody = await request.text();

  if (rawBody.length > 1000) {
    return NextResponse.json(
      { error: { code: "payload-too-large", message: "Tenant role change requests must remain concise." } },
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

  const body = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  const userId = typeof body.userId === "string" ? body.userId : "";
  const role = typeof body.role === "string" ? (body.role as PilotWorkspaceRole) : null;

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId) || !role || !allowedRoles.has(role)) {
    return NextResponse.json(
      {
        error: {
          code: "invalid-tenant-role-change",
          message: "A valid existing membership identity and approved SCRIMED pilot role are required."
        }
      },
      { status: 422, headers }
    );
  }

  const { workspaceSlug } = await params;
  const update = await updateTenantMembershipRole(context.client, workspaceSlug, userId, role);

  if (update.error) {
    const finalAdminProtected = update.error.message.includes("tenant-access-final-admin-protected");

    return NextResponse.json(
      {
        error: {
          code: finalAdminProtected ? "tenant-access-final-admin-protected" : "tenant-access-update-failed",
          message: finalAdminProtected
            ? "The final tenant-admin cannot be demoted. Promote another approved member before changing this role."
            : "The governed membership role change could not be committed."
        },
        boundary: protectedPilotBoundary
      },
      { status: statusForTenantAccessError(update.error.message), headers }
    );
  }

  const dashboard = await getTenantAccessDashboard(context.client, workspaceSlug);

  if (dashboard.error || !dashboard.dashboard) {
    return NextResponse.json(
      {
        service: "scrimed-tenant-access-administration",
        status: "membership-role-change-committed",
        boundary: protectedPilotBoundary
      },
      { status: 200, headers }
    );
  }

  return NextResponse.json(
    {
      service: "scrimed-tenant-access-administration",
      status: "membership-role-change-committed",
      boundary: protectedPilotBoundary,
      dashboard: dashboard.dashboard
    },
    { headers }
  );
}
