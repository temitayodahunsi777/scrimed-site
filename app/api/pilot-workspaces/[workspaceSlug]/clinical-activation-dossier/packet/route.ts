import { NextResponse } from "next/server";
import {
  buildClinicalActivationDossierPacket,
  deriveClinicalActivationDossier
} from "../../../../../lib/clinicalActivationDossier";
import {
  getAccessiblePilotWorkspace,
  getAuthenticatedGovernanceContext,
  listCommandIntelligenceSnapshots,
  listPilotAuditEvents,
  listPilotDemoReadinessSnapshots,
  listPilotSessions,
  listQaManualRunEvidencePackets,
  recordClinicalActivationDossierPacketDownload
} from "../../../../../lib/protectedPilotStore";
import {
  protectedPilotBoundary,
  protectedPilotNoStoreHeaders
} from "../../../../../lib/protectedPilotWorkspace";
import { enforceRequestRateLimit, rateLimitHeaders } from "../../../../../lib/requestRateLimit";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ workspaceSlug: string }>;
};

function statusForDossierPacketError(message: string) {
  if (
    message.includes("role-denied") ||
    message.includes("authentication-required") ||
    message.includes("governance-aal2-session-required")
  ) {
    return 403;
  }

  if (message.includes("workspace-not-found")) return 404;
  return 502;
}

export async function GET(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "clinical-activation-dossier-packet-download",
    limit: 15,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Clinical Activation Dossier downloads are temporarily rate limited."
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
  const sessions = sessionsResult.error ? [] : sessionsResult.sessions;
  const auditEvents = auditResult.error ? [] : auditResult.events;
  const demoSnapshots = snapshotsResult.error ? [] : snapshotsResult.snapshots;
  const manualQaEvidencePackets = manualQaEvidenceResult.error
    ? []
    : manualQaEvidenceResult.packets;
  const commandSnapshots = commandSnapshotsResult.error ? [] : commandSnapshotsResult.snapshots;
  const dossier = deriveClinicalActivationDossier({
    workspace,
    sessions,
    auditEvents,
    demoSnapshots,
    manualQaEvidencePackets,
    commandSnapshots,
    unavailableSections
  });
  const audit = await recordClinicalActivationDossierPacketDownload(
    context.client,
    workspace.slug,
    {
      readinessScore: dossier.readiness.score,
      hardGateCount: dossier.readiness.hardGateCount,
      blockedGateCount: dossier.readiness.blockedGateCount,
      unsignedApprovalCount: dossier.readiness.unsignedApprovalCount,
      protectedEvidenceCount: dossier.readiness.protectedEvidenceCount,
      unavailableSections,
      clinicalGoLiveAuthority: dossier.clinicalGoLiveAuthority
    }
  );

  if (audit.error || !audit.eventId) {
    const message = audit.error?.message ?? "";

    return NextResponse.json(
      {
        error: {
          code: "clinical-activation-dossier-audit-failed",
          message:
            "The Clinical Activation Dossier was not released because its append-only download audit event could not be committed."
        },
        boundary: protectedPilotBoundary
      },
      { status: statusForDossierPacketError(message), headers }
    );
  }

  const generatedAt = new Date().toISOString();
  const packet = buildClinicalActivationDossierPacket({
    generatedAt,
    auditEventId: audit.eventId,
    actorUserId: context.user.id,
    workspace,
    dossier
  });
  const safeWorkspaceSlug = workspace.slug.replace(/[^a-z0-9-]/gi, "-").slice(0, 80) || "workspace";

  return new NextResponse(packet, {
    headers: {
      ...headers,
      "Content-Disposition": `attachment; filename="scrimed-${safeWorkspaceSlug}-clinical-activation-dossier.md"`,
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Clinical-Activation-Dossier-Audited": "true",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Data-Boundary": "synthetic-only"
    }
  });
}
