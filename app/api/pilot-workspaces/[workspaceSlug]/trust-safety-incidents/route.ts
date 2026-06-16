import { NextResponse } from "next/server";
import {
  createTrustSafetyIncident,
  getAuthenticatedGovernanceContext,
  getTrustSafetyIncidentDashboard
} from "../../../../lib/protectedPilotStore";
import {
  protectedPilotBoundary,
  protectedPilotNoStoreHeaders
} from "../../../../lib/protectedPilotWorkspace";
import {
  summarizeDurableTrustSafetyIncidents,
  tenantTrustSafetyIncidentBoundary,
  validateTrustSafetyIncidentCreatePayload
} from "../../../../lib/trustSafetyOperations";
import { enforceRequestRateLimit, rateLimitHeaders } from "../../../../lib/requestRateLimit";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ workspaceSlug: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  const context = await getAuthenticatedGovernanceContext(request);

  if (!context.ok) {
    return NextResponse.json(
      { error: { code: context.code, message: context.message }, boundary: protectedPilotBoundary },
      { status: context.status, headers: protectedPilotNoStoreHeaders }
    );
  }

  const { workspaceSlug } = await params;
  const dashboardResult = await getTrustSafetyIncidentDashboard(context.client, workspaceSlug);

  if (dashboardResult.error || !dashboardResult.dashboard) {
    return NextResponse.json(
      {
        error: {
          code: "trust-safety-incident-dashboard-unavailable",
          message:
            "The tenant TrustOps incident dashboard is not available. Apply the TrustOps incident migration, verify RLS/RPC grants, and retry with an AAL2 tenant session."
        },
        boundary: tenantTrustSafetyIncidentBoundary
      },
      { status: 503, headers: protectedPilotNoStoreHeaders }
    );
  }

  return NextResponse.json(
    {
      service: "scrimed-tenant-trust-safety-incidents",
      boundary: tenantTrustSafetyIncidentBoundary,
      dashboard: summarizeDurableTrustSafetyIncidents(
        dashboardResult.dashboard.incidents,
        dashboardResult.dashboard.events
      ),
      workspace: {
        id: dashboardResult.dashboard.workspaceId,
        slug: dashboardResult.dashboard.workspaceSlug,
        name: dashboardResult.dashboard.workspaceName,
        tenantId: dashboardResult.dashboard.tenantId,
        tenantName: dashboardResult.dashboard.tenantName
      },
      security: dashboardResult.dashboard.security,
      incidents: dashboardResult.dashboard.incidents,
      events: dashboardResult.dashboard.events
    },
    { headers: protectedPilotNoStoreHeaders }
  );
}

export async function POST(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "tenant-trust-safety-incidents",
    limit: 30,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Tenant TrustOps incident creation is temporarily rate limited."
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
          message: "Tenant TrustOps incident creation must use application/json."
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
          message: "Tenant TrustOps incident payloads must remain concise and no-PHI."
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

  const validation = validateTrustSafetyIncidentCreatePayload(payload);

  if (!validation.ok) {
    return NextResponse.json(
      {
        error: {
          code: "invalid-trust-safety-incident",
          message: "The tenant TrustOps incident did not satisfy SCRIMED safety, privacy, and governance boundaries.",
          fields: validation.errors
        },
        boundary: tenantTrustSafetyIncidentBoundary
      },
      { status: 422, headers }
    );
  }

  const { workspaceSlug } = await params;
  const persistence = await createTrustSafetyIncident(context.client, workspaceSlug, validation.value);

  if (persistence.error || !persistence.incidentId) {
    return NextResponse.json(
      {
        error: {
          code: "trust-safety-incident-persistence-failed",
          message:
            "The TrustOps incident was not committed. Confirm the migration, RLS policies, AAL2 session, tenant role, and server runtime token before retrying."
        },
        boundary: tenantTrustSafetyIncidentBoundary
      },
      { status: 503, headers }
    );
  }

  const dashboardResult = await getTrustSafetyIncidentDashboard(context.client, workspaceSlug);
  const incidents = dashboardResult.dashboard?.incidents ?? [];
  const events = dashboardResult.dashboard?.events ?? [];

  return NextResponse.json(
    {
      service: "scrimed-tenant-trust-safety-incidents",
      status: "trust-safety-incident-created",
      boundary: tenantTrustSafetyIncidentBoundary,
      incidentId: persistence.incidentId,
      incident: incidents.find((incident) => incident.id === persistence.incidentId) ?? null,
      dashboard: summarizeDurableTrustSafetyIncidents(incidents, events)
    },
    { status: 201, headers }
  );
}
