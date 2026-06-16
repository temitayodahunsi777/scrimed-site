import { NextResponse } from "next/server";
import {
  createPilotDemoReadinessSnapshot,
  getAccessiblePilotWorkspace,
  getAuthenticatedGovernanceContext,
  listPilotAuditEvents,
  listPilotDemoReadinessSnapshots,
  listPilotSessions
} from "../../../../lib/protectedPilotStore";
import { derivePilotDemoReadiness, type TenantSessionVerificationReadiness } from "../../../../lib/pilotDemoReadiness";
import {
  protectedPilotBoundary,
  protectedPilotNoStoreHeaders
} from "../../../../lib/protectedPilotWorkspace";
import { enforceRequestRateLimit, rateLimitHeaders } from "../../../../lib/requestRateLimit";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ workspaceSlug: string }>;
};

function normalizeVerification(value: unknown): TenantSessionVerificationReadiness {
  const record = value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  const status =
    record.status === "running" || record.status === "complete" || record.status === "error"
      ? record.status
      : "not-run";

  return {
    status,
    total: typeof record.total === "number" && Number.isFinite(record.total) ? record.total : 0,
    passed: typeof record.passed === "number" && Number.isFinite(record.passed) ? record.passed : 0,
    warnings: typeof record.warnings === "number" && Number.isFinite(record.warnings) ? record.warnings : 0,
    failed: typeof record.failed === "number" && Number.isFinite(record.failed) ? record.failed : 0,
    updatedAt: typeof record.updatedAt === "string" ? record.updatedAt : null
  };
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
      { status: 404, headers: protectedPilotNoStoreHeaders }
    );
  }

  const snapshotsResult = await listPilotDemoReadinessSnapshots(
    context.client,
    workspaceResult.workspace.id
  );

  if (snapshotsResult.error) {
    return NextResponse.json(
      {
        error: {
          code: "demo-readiness-snapshots-query-failed",
          message: "Demo readiness snapshots could not be retrieved for this protected workspace."
        },
        boundary: protectedPilotBoundary
      },
      { status: 502, headers: protectedPilotNoStoreHeaders }
    );
  }

  return NextResponse.json(
    {
      service: "scrimed-pilot-demo-readiness-snapshots",
      boundary: protectedPilotBoundary,
      workspace: workspaceResult.workspace,
      snapshots: snapshotsResult.snapshots
    },
    { headers: protectedPilotNoStoreHeaders }
  );
}

export async function POST(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "pilot-demo-readiness-snapshot-create",
    limit: 20,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Demo readiness snapshot creation is temporarily rate limited."
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
          message: "Demo readiness snapshots must use application/json."
        },
        boundary: protectedPilotBoundary
      },
      { status: 415, headers }
    );
  }

  const rawBody = await request.text();

  if (rawBody.length > 6000) {
    return NextResponse.json(
      {
        error: {
          code: "payload-too-large",
          message: "Demo readiness snapshot requests accept concise verification metadata only."
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
  const [sessionsResult, auditResult] = await Promise.all([
    listPilotSessions(context.client, workspace.id),
    listPilotAuditEvents(context.client, workspace.id)
  ]);

  if (sessionsResult.error || auditResult.error) {
    return NextResponse.json(
      {
        error: {
          code: "demo-readiness-evidence-query-failed",
          message:
            "Demo readiness was not snapshotted because durable sessions or append-only audit events could not be retrieved."
        },
        boundary: protectedPilotBoundary
      },
      { status: 502, headers }
    );
  }

  const payloadRecord =
    payload && typeof payload === "object" && !Array.isArray(payload) ? (payload as Record<string, unknown>) : {};
  const verification = normalizeVerification(payloadRecord.verification);
  const summary = derivePilotDemoReadiness({
    workspace,
    sessions: sessionsResult.sessions,
    auditEvents: auditResult.events,
    verification
  });
  const evidenceCounts = {
    sessions: sessionsResult.sessions.length,
    auditEvents: auditResult.events.length,
    requiredActions: summary.requiredActions.length,
    checks: summary.checks.length
  };

  const persistence = await createPilotDemoReadinessSnapshot(
    context.client,
    workspace.slug,
    summary,
    verification,
    evidenceCounts
  );

  if (persistence.error || !persistence.snapshotId) {
    return NextResponse.json(
      {
        error: {
          code: "demo-readiness-snapshot-persistence-failed",
          message:
            "The demo readiness snapshot was not committed because durable tenant storage or append-only audit failed."
        },
        boundary: protectedPilotBoundary
      },
      { status: 502, headers }
    );
  }

  const snapshotsResult = await listPilotDemoReadinessSnapshots(context.client, workspace.id);
  const snapshot =
    snapshotsResult.snapshots.find((candidate) => candidate.id === persistence.snapshotId) ??
    snapshotsResult.snapshots[0] ??
    null;

  return NextResponse.json(
    {
      service: "scrimed-pilot-demo-readiness-snapshots",
      boundary: protectedPilotBoundary,
      workspace,
      snapshot,
      snapshots: snapshotsResult.snapshots
    },
    { status: 201, headers }
  );
}
