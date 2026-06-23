import { NextResponse } from "next/server";
import {
  getAuthenticatedGovernanceContext,
  getTrustSafetyIncidentDashboard,
  updateTrustSafetyIncident
} from "../../../../../lib/protectedPilotStore";
import {
  protectedPilotBoundary,
  protectedPilotNoStoreHeaders
} from "../../../../../lib/protectedPilotWorkspace";
import {
  summarizeDurableTrustSafetyIncidents,
  tenantTrustSafetyIncidentBoundary,
  validateTrustSafetyIncidentUpdatePayload
} from "../../../../../lib/trustSafetyOperations";
import { enforceRequestRateLimit, rateLimitHeaders } from "../../../../../lib/requestRateLimit";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ workspaceSlug: string; incidentId: string }>;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(request: Request, { params }: RouteContext) {
  const context = await getAuthenticatedGovernanceContext(request);

  if (!context.ok) {
    return NextResponse.json(
      { error: { code: context.code, message: context.message }, boundary: protectedPilotBoundary },
      { status: context.status, headers: protectedPilotNoStoreHeaders }
    );
  }

  const { workspaceSlug, incidentId } = await params;

  if (!uuidPattern.test(incidentId)) {
    return NextResponse.json(
      { error: { code: "invalid-incident-id", message: "incidentId must be a valid UUID." } },
      { status: 400, headers: protectedPilotNoStoreHeaders }
    );
  }

  const dashboardResult = await getTrustSafetyIncidentDashboard(context.client, workspaceSlug);

  if (dashboardResult.error || !dashboardResult.dashboard) {
    return NextResponse.json(
      {
        error: {
          code: "trust-safety-incident-dashboard-unavailable",
          message:
            "The tenant TrustOps incident dashboard is not available for this environment."
        },
        boundary: tenantTrustSafetyIncidentBoundary
      },
      { status: 503, headers: protectedPilotNoStoreHeaders }
    );
  }

  const incident = dashboardResult.dashboard.incidents.find((record) => record.id === incidentId);

  if (!incident) {
    return NextResponse.json(
      { error: { code: "trust-safety-incident-not-found", message: "No incident is visible for this workspace." } },
      { status: 404, headers: protectedPilotNoStoreHeaders }
    );
  }

  const events = dashboardResult.dashboard.events.filter((event) => event.incidentId === incident.id);

  return NextResponse.json(
    {
      service: "scrimed-tenant-trust-safety-incident",
      boundary: tenantTrustSafetyIncidentBoundary,
      incident,
      events,
      dashboard: summarizeDurableTrustSafetyIncidents([incident], events)
    },
    { headers: protectedPilotNoStoreHeaders }
  );
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "tenant-trust-safety-incident-updates",
    limit: 40,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Tenant TrustOps incident updates are temporarily rate limited."
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
          message: "Tenant TrustOps incident updates must use application/json."
        }
      },
      { status: 415, headers }
    );
  }

  const { workspaceSlug, incidentId } = await params;

  if (!uuidPattern.test(incidentId)) {
    return NextResponse.json(
      { error: { code: "invalid-incident-id", message: "incidentId must be a valid UUID." } },
      { status: 400, headers }
    );
  }

  const rawBody = await request.text();

  if (rawBody.length > 16000) {
    return NextResponse.json(
      {
        error: {
          code: "payload-too-large",
          message: "Tenant TrustOps incident update payloads must remain concise and no-PHI."
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

  const validation = validateTrustSafetyIncidentUpdatePayload(payload);

  if (!validation.ok) {
    return NextResponse.json(
      {
        error: {
          code: "invalid-trust-safety-incident-update",
          message: "The tenant TrustOps incident update did not satisfy SCRIMED safety and governance boundaries.",
          fields: validation.errors
        },
        boundary: tenantTrustSafetyIncidentBoundary
      },
      { status: 422, headers }
    );
  }

  const persistence = await updateTrustSafetyIncident(
    context.client,
    workspaceSlug,
    incidentId,
    validation.value
  );

  if (persistence.error || !persistence.eventId) {
    return NextResponse.json(
      {
        error: {
          code: "trust-safety-incident-update-failed",
          message:
            "The TrustOps incident update was not committed. Confirm the migration, RLS policies, AAL2 session, tenant role, and event fields before retrying."
        },
        boundary: tenantTrustSafetyIncidentBoundary
      },
      { status: 503, headers }
    );
  }

  const dashboardResult = await getTrustSafetyIncidentDashboard(context.client, workspaceSlug);
  const incidents = dashboardResult.dashboard?.incidents ?? [];
  const events = dashboardResult.dashboard?.events ?? [];
  const incident = incidents.find((record) => record.id === incidentId) ?? null;

  return NextResponse.json(
    {
      service: "scrimed-tenant-trust-safety-incident",
      status: "trust-safety-incident-updated",
      boundary: tenantTrustSafetyIncidentBoundary,
      eventId: persistence.eventId,
      incident,
      events: events.filter((event) => event.incidentId === incidentId),
      dashboard: summarizeDurableTrustSafetyIncidents(incidents, events)
    },
    { headers }
  );
}
