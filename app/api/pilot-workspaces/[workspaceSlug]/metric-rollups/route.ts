import { NextResponse } from "next/server";
import {
  buildProtectedMetricRollupDashboard,
  protectedMetricRollupBoundary,
  protectedMetricRollupStatus,
  validateProtectedMetricRollupInput
} from "../../../../lib/protectedMetricRollups";
import {
  createProtectedMetricRollupSnapshot,
  getAccessiblePilotWorkspace,
  getAuthenticatedGovernanceContext,
  listProtectedMetricRollupSnapshots,
  listProtectedOperatorMetrics
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

function statusForMetricRollupError(message: string) {
  if (
    message.includes("role-denied") ||
    message.includes("authentication-required") ||
    message.includes("aal2-session-required") ||
    message.includes("governance-aal2-session-required") ||
    message.includes("server-authorization-required")
  ) {
    return 403;
  }

  if (message.includes("workspace")) return 404;
  if (message.includes("does not exist") || message.includes("schema cache")) return 503;
  if (
    message.includes("invalid") ||
    message.includes("prohibited") ||
    message.includes("validation") ||
    message.includes("unsupported")
  ) {
    return 400;
  }

  return 502;
}

async function authorizeWorkspace(request: Request, workspaceSlug: string) {
  const context = await getAuthenticatedGovernanceContext(request);

  if (!context.ok) {
    return {
      response: NextResponse.json(
        { error: { code: context.code, message: context.message }, boundary: protectedPilotBoundary },
        { status: context.status, headers: protectedPilotNoStoreHeaders }
      )
    };
  }

  const workspaceResult = await getAccessiblePilotWorkspace(context.client, workspaceSlug);

  if (workspaceResult.error || !workspaceResult.workspace) {
    return {
      response: NextResponse.json(
        {
          error: {
            code: "pilot-workspace-not-found",
            message: "No tenant-isolated pilot workspace is available for this member and slug."
          },
          boundary: protectedPilotBoundary
        },
        { status: 404, headers: protectedPilotNoStoreHeaders }
      )
    };
  }

  return {
    context,
    workspace: workspaceResult.workspace
  };
}

export async function GET(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "protected-metric-rollups-read",
    limit: 60,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Protected metric rollup reads are temporarily rate limited."
        },
        boundary: protectedPilotBoundary
      },
      { status: 429, headers }
    );
  }

  const { workspaceSlug } = await params;
  const authorization = await authorizeWorkspace(request, workspaceSlug);

  if ("response" in authorization) {
    return authorization.response;
  }

  const [metricsResult, snapshotsResult] = await Promise.all([
    listProtectedOperatorMetrics(authorization.context.client, authorization.workspace.id),
    listProtectedMetricRollupSnapshots(authorization.context.client, authorization.workspace.id)
  ]);

  if (metricsResult.error || snapshotsResult.error) {
    const message = metricsResult.error?.message ?? snapshotsResult.error?.message ?? "";

    return NextResponse.json(
      {
        error: {
          code: "protected-metric-rollups-unavailable",
          message:
            "Protected metric rollups could not be retrieved. Use protected operator metrics plus the Public Market Readiness KPI definitions as the safe temporary workaround."
        },
        boundary: protectedMetricRollupBoundary
      },
      { status: statusForMetricRollupError(message), headers }
    );
  }

  return NextResponse.json(
    {
      service: "scrimed-protected-metric-rollups",
      status: protectedMetricRollupStatus,
      workspace: authorization.workspace,
      snapshotCount: snapshotsResult.snapshots.length,
      snapshots: snapshotsResult.snapshots,
      dashboard: buildProtectedMetricRollupDashboard(
        metricsResult.metrics,
        snapshotsResult.snapshots
      ),
      boundary: protectedMetricRollupBoundary
    },
    { headers }
  );
}

export async function POST(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "protected-metric-rollups-create",
    limit: 12,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Protected metric rollup creation is temporarily rate limited."
        },
        boundary: protectedPilotBoundary
      },
      { status: 429, headers }
    );
  }

  const { workspaceSlug } = await params;
  const authorization = await authorizeWorkspace(request, workspaceSlug);

  if ("response" in authorization) {
    return authorization.response;
  }

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json(
      {
        error: {
          code: "unsupported-content-type",
          message: "Protected metric rollup creation requires application/json."
        },
        boundary: protectedMetricRollupBoundary
      },
      { status: 415, headers }
    );
  }

  const rawBody = await request.text();

  if (rawBody.length > 2200) {
    return NextResponse.json(
      {
        error: {
          code: "payload-too-large",
          message: "Metric rollups accept bounded no-PHI operating review metadata only."
        },
        boundary: protectedMetricRollupBoundary
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
        boundary: protectedMetricRollupBoundary
      },
      { status: 400, headers }
    );
  }

  const validation = validateProtectedMetricRollupInput(payload);

  if (!validation.ok) {
    return NextResponse.json(
      {
        service: "scrimed-protected-metric-rollups",
        status: "validation-failed",
        errors: validation.errors,
        boundary: protectedMetricRollupBoundary
      },
      { status: 400, headers }
    );
  }

  const result = await createProtectedMetricRollupSnapshot(
    authorization.context.client,
    authorization.workspace.slug,
    validation.input
  );

  if (result.error || !result.snapshotId) {
    const message = result.error?.message ?? "";

    return NextResponse.json(
      {
        error: {
          code: "protected-metric-rollup-create-failed",
          message:
            "The protected metric rollup was not created because the tenant-scoped governance write failed."
        },
        boundary: protectedMetricRollupBoundary
      },
      { status: statusForMetricRollupError(message), headers }
    );
  }

  const [metricsResult, snapshotsResult] = await Promise.all([
    listProtectedOperatorMetrics(authorization.context.client, authorization.workspace.id),
    listProtectedMetricRollupSnapshots(authorization.context.client, authorization.workspace.id)
  ]);
  const metrics = metricsResult.error ? [] : metricsResult.metrics;
  const snapshots = snapshotsResult.error ? [] : snapshotsResult.snapshots;

  return NextResponse.json(
    {
      service: "scrimed-protected-metric-rollups",
      status: protectedMetricRollupStatus,
      workspace: authorization.workspace,
      snapshotId: result.snapshotId,
      snapshots,
      dashboard: buildProtectedMetricRollupDashboard(metrics, snapshots),
      boundary: protectedMetricRollupBoundary
    },
    {
      status: 201,
      headers: {
        ...headers,
        "X-SCRIMED-Metric-Rollup-Persisted": "true"
      }
    }
  );
}
