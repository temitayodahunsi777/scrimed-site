import { NextResponse } from "next/server";
import {
  getAccessiblePilotWorkspace,
  getAuthenticatedGovernanceContext,
  getTenantAccessDashboard,
  getTrustSafetyIncidentDashboard,
  listAgentWorkspaceGovernanceLedger,
  listAgentWorkspaceWorkOrders,
  listPilotAuditEvents,
  listPilotSessions,
  listTrustOSDecisions,
  recordEnterpriseProofPacketDownload
} from "../../../../lib/protectedPilotStore";
import {
  buildEnterpriseAggregateProofPacket,
  protectedPilotBoundary,
  protectedPilotNoStoreHeaders
} from "../../../../lib/protectedPilotWorkspace";
import { enforceRequestRateLimit, rateLimitHeaders } from "../../../../lib/requestRateLimit";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ workspaceSlug: string }>;
};

function getAppBaseUrl(request: Request) {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.VERCEL_PROJECT_PRODUCTION_URL;

  if (configuredUrl) {
    return configuredUrl.startsWith("http") ? configuredUrl : `https://${configuredUrl}`;
  }

  return new URL(request.url).origin;
}

function statusForEnterprisePacketError(message: string) {
  if (message.includes("role-denied") || message.includes("authentication-required")) return 403;
  if (message.includes("workspace-not-found")) return 404;
  return 502;
}

export async function GET(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "enterprise-proof-packet-download",
    limit: 20,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Enterprise proof packet downloads are temporarily rate limited."
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

  const { workspaceSlug } = await params;
  const workspaceResult = await getAccessiblePilotWorkspace(context.client, workspaceSlug);

  if (workspaceResult.error || !workspaceResult.workspace) {
    return NextResponse.json(
      {
        error: {
          code: "pilot-workspace-not-found",
          message: "No tenant-isolated pilot workspace is available for this member and slug."
        },
        boundary: protectedPilotBoundary
      },
      { status: 404, headers }
    );
  }

  const workspace = workspaceResult.workspace;
  const [
    sessionsResult,
    auditResult,
    decisionsResult,
    workOrdersResult,
    governanceLedgerResult,
    trustSafetyResult,
    tenantAccessResult
  ] = await Promise.all([
    listPilotSessions(context.client, workspace.id),
    listPilotAuditEvents(context.client, workspace.id),
    listTrustOSDecisions(context.client, workspace.id),
    listAgentWorkspaceWorkOrders(context.client, workspace.id),
    listAgentWorkspaceGovernanceLedger(context.client, workspace.id),
    getTrustSafetyIncidentDashboard(context.client, workspace.slug),
    getTenantAccessDashboard(context.client, workspace.slug)
  ]);

  const unavailableSections = [
    sessionsResult.error ? "Durable synthetic sessions could not be retrieved." : "",
    auditResult.error ? "Append-only pilot audit events could not be retrieved." : "",
    decisionsResult.error ? "TrustOS Decision Ledger records could not be retrieved." : "",
    workOrdersResult.error ? "Persistent Agent Workspace work orders could not be retrieved." : "",
    governanceLedgerResult.error ? "Agent Workspace governance ledger records could not be retrieved." : "",
    trustSafetyResult.error ? "Trust Safety incident dashboard could not be retrieved." : "",
    tenantAccessResult.error ? "Tenant access dashboard could not be retrieved." : ""
  ].filter(Boolean);
  const sessions = sessionsResult.error ? [] : sessionsResult.sessions;
  const auditEvents = auditResult.error ? [] : auditResult.events;
  const trustOSDecisions = decisionsResult.error ? [] : decisionsResult.decisions;
  const agentWorkOrders = workOrdersResult.error ? [] : workOrdersResult.workOrders;
  const governanceLedgerRecords = governanceLedgerResult.error ? [] : governanceLedgerResult.ledgerRecords;
  const trustSafetyDashboard = trustSafetyResult.error ? null : trustSafetyResult.dashboard;
  const tenantAccessDashboard = tenantAccessResult.error ? null : tenantAccessResult.dashboard;

  const audit = await recordEnterpriseProofPacketDownload(context.client, workspace.slug, {
    evidenceCounts: {
      sessions: sessions.length,
      auditEvents: auditEvents.length,
      trustOSDecisions: trustOSDecisions.length,
      agentWorkOrders: agentWorkOrders.length,
      governanceLedgerRecords: governanceLedgerRecords.length,
      trustSafetyIncidents: trustSafetyDashboard?.incidents.length ?? 0,
      tenantAccessActiveMembers: tenantAccessDashboard?.summary.activeMembers ?? 0
    },
    unavailableSections
  });

  if (audit.error || !audit.eventId) {
    const message = audit.error?.message ?? "";

    return NextResponse.json(
      {
        error: {
          code: "enterprise-proof-packet-audit-failed",
          message:
            "The enterprise proof packet was not released because its append-only download audit event could not be committed."
        },
        boundary: protectedPilotBoundary
      },
      { status: statusForEnterprisePacketError(message), headers }
    );
  }

  const generatedAt = new Date().toISOString();
  const packet = buildEnterpriseAggregateProofPacket({
    generatedAt,
    auditEventId: audit.eventId,
    actorUserId: context.user.id,
    appBaseUrl: getAppBaseUrl(request),
    workspace,
    sessions,
    auditEvents,
    trustOSDecisions,
    agentWorkOrders,
    governanceLedgerRecords,
    trustSafetyDashboard,
    tenantAccessDashboard,
    unavailableSections
  });
  const safeWorkspaceSlug = workspace.slug.replace(/[^a-z0-9-]/gi, "-").slice(0, 80) || "workspace";

  return new NextResponse(packet, {
    headers: {
      ...headers,
      "Content-Disposition": `attachment; filename="scrimed-${safeWorkspaceSlug}-enterprise-proof-packet.md"`,
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Data-Boundary": "synthetic-only",
      "X-SCRIMED-Enterprise-Proof-Packet-Audited": "true"
    }
  });
}
