import { NextResponse } from "next/server";
import { deriveClinicalActivationDossier } from "../../../../lib/clinicalActivationDossier";
import {
  getAccessiblePilotWorkspace,
  getAuthenticatedGovernanceContext,
  listCommandIntelligenceSnapshots,
  listPilotAuditEvents,
  listPilotDemoReadinessSnapshots,
  listPilotSessions,
  listQaManualRunEvidencePackets
} from "../../../../lib/protectedPilotStore";
import {
  protectedPilotBoundary,
  protectedPilotNoStoreHeaders
} from "../../../../lib/protectedPilotWorkspace";
import { enforceRequestRateLimit, rateLimitHeaders } from "../../../../lib/requestRateLimit";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ workspaceSlug: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "clinical-activation-dossier-read",
    limit: 60,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Clinical Activation Dossier reads are temporarily rate limited."
        },
        boundary: protectedPilotBoundary
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
    snapshotsResult,
    manualQaEvidenceResult,
    commandSnapshotsResult
  ] = await Promise.all([
    listPilotSessions(context.client, workspace.id),
    listPilotAuditEvents(context.client, workspace.id),
    listPilotDemoReadinessSnapshots(context.client, workspace.id),
    listQaManualRunEvidencePackets(context.client, workspace.id),
    listCommandIntelligenceSnapshots(context.client, workspace.id)
  ]);
  const unavailableSections = [
    sessionsResult.error ? "Durable synthetic sessions could not be retrieved." : "",
    auditResult.error ? "Append-only pilot audit events could not be retrieved." : "",
    snapshotsResult.error ? "Demo readiness snapshots could not be retrieved." : "",
    manualQaEvidenceResult.error ? "Manual QA evidence packets could not be retrieved." : "",
    commandSnapshotsResult.error ? "Command Intelligence snapshots could not be retrieved." : ""
  ].filter(Boolean);
  const dossier = deriveClinicalActivationDossier({
    workspace,
    sessions: sessionsResult.error ? [] : sessionsResult.sessions,
    auditEvents: auditResult.error ? [] : auditResult.events,
    demoSnapshots: snapshotsResult.error ? [] : snapshotsResult.snapshots,
    manualQaEvidencePackets: manualQaEvidenceResult.error ? [] : manualQaEvidenceResult.packets,
    commandSnapshots: commandSnapshotsResult.error ? [] : commandSnapshotsResult.snapshots,
    unavailableSections
  });

  return NextResponse.json(
    {
      service: dossier.service,
      boundary: dossier.boundary,
      workspace,
      dossier
    },
    { headers }
  );
}
