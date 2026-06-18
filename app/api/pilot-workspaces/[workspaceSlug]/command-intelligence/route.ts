import { NextResponse } from "next/server";
import {
  commandIntelligenceSnapshotOperatorAttestation,
  deriveCommandIntelligenceHub
} from "../../../../lib/commandIntelligenceHub";
import {
  createCommandIntelligenceSnapshot,
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

function latestEvidenceTimestamp(timestamps: Array<string | null | undefined>) {
  const latest = timestamps
    .filter((timestamp): timestamp is string => Boolean(timestamp))
    .map((timestamp) => new Date(timestamp).getTime())
    .filter(Number.isFinite)
    .sort((left, right) => right - left)[0];

  return latest ? new Date(latest).toISOString() : null;
}

export async function GET(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "command-intelligence-hub-read",
    limit: 90,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Command Intelligence Hub reads are temporarily rate limited."
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
  const hub = deriveCommandIntelligenceHub({
    workspace,
    sessions,
    auditEvents,
    demoSnapshots,
    manualQaEvidencePackets,
    unavailableSections
  });

  return NextResponse.json(
    {
      service: hub.service,
      boundary: hub.boundary,
      workspace,
      hub,
      snapshots: commandSnapshots
    },
    { headers }
  );
}

export async function POST(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "command-intelligence-snapshot-create",
    limit: 20,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Command Intelligence snapshot creation is temporarily rate limited."
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

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json(
      {
        error: {
          code: "unsupported-content-type",
          message: "Command Intelligence snapshots must use application/json."
        },
        boundary: protectedPilotBoundary
      },
      { status: 415, headers }
    );
  }

  const rawBody = await request.text();

  if (rawBody.length > 2000) {
    return NextResponse.json(
      {
        error: {
          code: "payload-too-large",
          message: "Command Intelligence snapshot requests accept the fixed operator attestation only."
        },
        boundary: protectedPilotBoundary
      },
      { status: 413, headers }
    );
  }

  let payload: unknown;

  try {
    payload = rawBody ? JSON.parse(rawBody) : {};
  } catch {
    return NextResponse.json(
      {
        error: { code: "invalid-json", message: "Request body must be valid JSON." },
        boundary: protectedPilotBoundary
      },
      { status: 400, headers }
    );
  }

  const payloadRecord =
    payload && typeof payload === "object" && !Array.isArray(payload) ? (payload as Record<string, unknown>) : {};

  if (payloadRecord.operatorAttestation !== commandIntelligenceSnapshotOperatorAttestation) {
    return NextResponse.json(
      {
        error: {
          code: "operator-attestation-required",
          message:
            "Command Intelligence snapshots require a human AAL2 operator attestation for synthetic command posture review."
        },
        requiredAttestation: commandIntelligenceSnapshotOperatorAttestation,
        boundary: protectedPilotBoundary
      },
      { status: 400, headers }
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
  const [sessionsResult, auditResult, snapshotsResult, manualQaEvidenceResult] = await Promise.all([
    listPilotSessions(context.client, workspace.id),
    listPilotAuditEvents(context.client, workspace.id),
    listPilotDemoReadinessSnapshots(context.client, workspace.id),
    listQaManualRunEvidencePackets(context.client, workspace.id)
  ]);

  if (
    sessionsResult.error ||
    auditResult.error ||
    snapshotsResult.error ||
    manualQaEvidenceResult.error
  ) {
    return NextResponse.json(
      {
        error: {
          code: "command-intelligence-evidence-query-failed",
          message:
            "Command Intelligence was not snapshotted because one or more tenant evidence sections could not be retrieved."
        },
        boundary: protectedPilotBoundary
      },
      { status: 502, headers }
    );
  }

  const hub = deriveCommandIntelligenceHub({
    workspace,
    sessions: sessionsResult.sessions,
    auditEvents: auditResult.events,
    demoSnapshots: snapshotsResult.snapshots,
    manualQaEvidencePackets: manualQaEvidenceResult.packets,
    unavailableSections: []
  });
  const lastEvidenceAt = latestEvidenceTimestamp([
    ...sessionsResult.sessions.map((session) => session.createdAt),
    ...auditResult.events.map((event) => event.createdAt),
    ...snapshotsResult.snapshots.map((snapshot) => snapshot.createdAt),
    ...manualQaEvidenceResult.packets.map((packet) => packet.createdAt)
  ]);
  const persistence = await createCommandIntelligenceSnapshot(
    context.client,
    workspace.slug,
    hub,
    commandIntelligenceSnapshotOperatorAttestation,
    lastEvidenceAt
  );

  if (persistence.error || !persistence.snapshotId) {
    return NextResponse.json(
      {
        error: {
          code: "command-intelligence-snapshot-persistence-failed",
          message:
            "The Command Intelligence snapshot was not committed because durable tenant storage or append-only audit failed."
        },
        boundary: protectedPilotBoundary
      },
      { status: 502, headers }
    );
  }

  const commandSnapshotsResult = await listCommandIntelligenceSnapshots(context.client, workspace.id);
  const snapshot =
    commandSnapshotsResult.snapshots.find((candidate) => candidate.id === persistence.snapshotId) ??
    commandSnapshotsResult.snapshots[0] ??
    null;

  return NextResponse.json(
    {
      service: hub.service,
      boundary: hub.boundary,
      workspace,
      hub,
      snapshot,
      snapshots: commandSnapshotsResult.snapshots
    },
    { status: 201, headers }
  );
}
