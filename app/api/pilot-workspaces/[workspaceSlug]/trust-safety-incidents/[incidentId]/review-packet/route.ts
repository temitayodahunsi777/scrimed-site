import { NextResponse } from "next/server";
import {
  getAccessiblePilotWorkspace,
  getAuthenticatedGovernanceContext,
  getTrustSafetyIncidentDashboard,
  recordTrustSafetyIncidentPacketDownload
} from "../../../../../../lib/protectedPilotStore";
import {
  protectedPilotBoundary,
  protectedPilotNoStoreHeaders
} from "../../../../../../lib/protectedPilotWorkspace";
import {
  buildTenantTrustSafetyIncidentReviewPacket,
  tenantTrustSafetyIncidentBoundary
} from "../../../../../../lib/trustSafetyOperations";
import { enforceRequestRateLimit, rateLimitHeaders } from "../../../../../../lib/requestRateLimit";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ workspaceSlug: string; incidentId: string }>;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getAppBaseUrl(request: Request) {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.VERCEL_PROJECT_PRODUCTION_URL;

  if (configuredUrl) {
    return configuredUrl.startsWith("http") ? configuredUrl : `https://${configuredUrl}`;
  }

  return new URL(request.url).origin;
}

export async function GET(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "tenant-trust-safety-incident-review-packet",
    limit: 30,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Tenant TrustOps incident review packet downloads are temporarily rate limited."
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

  const { workspaceSlug, incidentId } = await params;

  if (!uuidPattern.test(incidentId)) {
    return NextResponse.json(
      { error: { code: "invalid-incident-id", message: "incidentId must be a valid UUID." } },
      { status: 400, headers }
    );
  }

  const [workspaceResult, dashboardResult] = await Promise.all([
    getAccessiblePilotWorkspace(context.client, workspaceSlug),
    getTrustSafetyIncidentDashboard(context.client, workspaceSlug)
  ]);

  if (workspaceResult.error || !workspaceResult.workspace) {
    return NextResponse.json(
      {
        error: {
          code: "pilot-workspace-not-found",
          message: "No tenant-isolated pilot workspace is available for this member and slug."
        }
      },
      { status: 404, headers }
    );
  }

  if (dashboardResult.error || !dashboardResult.dashboard) {
    return NextResponse.json(
      {
        error: {
          code: "trust-safety-incident-dashboard-unavailable",
          message:
            "The tenant TrustOps review packet was not released because the incident dashboard could not be retrieved."
        },
        boundary: tenantTrustSafetyIncidentBoundary
      },
      { status: 503, headers }
    );
  }

  const incident = dashboardResult.dashboard.incidents.find((record) => record.id === incidentId);

  if (!incident) {
    return NextResponse.json(
      { error: { code: "trust-safety-incident-not-found", message: "No incident is visible for this workspace." } },
      { status: 404, headers }
    );
  }

  const audit = await recordTrustSafetyIncidentPacketDownload(
    context.client,
    workspaceSlug,
    incidentId
  );

  if (audit.error || !audit.eventId) {
    return NextResponse.json(
      {
        error: {
          code: "trust-safety-incident-review-packet-audit-failed",
          message:
            "The review packet was not released because its append-only packet-download audit event could not be committed."
        },
        boundary: tenantTrustSafetyIncidentBoundary
      },
      { status: 502, headers }
    );
  }

  const refreshedDashboard = await getTrustSafetyIncidentDashboard(context.client, workspaceSlug);
  const events =
    refreshedDashboard.dashboard?.events.filter((event) => event.incidentId === incidentId) ??
    dashboardResult.dashboard.events.filter((event) => event.incidentId === incidentId);

  const packet = buildTenantTrustSafetyIncidentReviewPacket({
    workspace: {
      slug: workspaceResult.workspace.slug,
      name: workspaceResult.workspace.name,
      tenantName: workspaceResult.workspace.tenantName,
      boundary: workspaceResult.workspace.boundary
    },
    incident,
    events,
    auditEventId: audit.eventId,
    generatedAt: new Date().toISOString(),
    actorUserId: context.user.id,
    appBaseUrl: getAppBaseUrl(request)
  });
  const safeWorkspaceSlug = workspaceResult.workspace.slug.replace(/[^a-z0-9-]/gi, "-");

  return new NextResponse(packet, {
    headers: {
      ...headers,
      "Content-Disposition": `attachment; filename="scrimed-${safeWorkspaceSlug}-${incidentId}-trustops-review-packet.md"`,
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Data-Boundary": "synthetic-only",
      "X-SCRIMED-TrustOps-Packet-Audited": "true",
      "X-SCRIMED-TrustOps-Audit-Event-ID": audit.eventId
    }
  });
}
