import { NextResponse } from "next/server";
import {
  buildProtectedOperatorMetricDashboard,
  protectedOperatorMetricBoundary,
  protectedOperatorMetricCaptureStatus,
  validateProtectedOperatorMetricInput
} from "../../../../lib/protectedOperatorMetrics";
import {
  getAccessiblePilotWorkspace,
  getAuthenticatedGovernanceContext,
  listProtectedOperatorMetrics,
  recordProtectedOperatorMetric
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

function statusForOperatorMetricError(message: string) {
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
    namespace: "protected-operator-metrics-read",
    limit: 60,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Protected operator metric reads are temporarily rate limited."
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

  const result = await listProtectedOperatorMetrics(
    authorization.context.client,
    authorization.workspace.id
  );

  if (result.error) {
    return NextResponse.json(
      {
        error: {
          code: "protected-operator-metrics-unavailable",
          message:
            "Protected operator metrics could not be retrieved. Use the Public Market Readiness KPI definitions as the safe temporary workaround."
        },
        boundary: protectedOperatorMetricBoundary
      },
      { status: statusForOperatorMetricError(result.error.message), headers }
    );
  }

  return NextResponse.json(
    {
      service: "scrimed-protected-operator-metrics",
      status: protectedOperatorMetricCaptureStatus,
      workspace: authorization.workspace,
      metricCount: result.metrics.length,
      metrics: result.metrics,
      dashboard: buildProtectedOperatorMetricDashboard(result.metrics),
      boundary: protectedOperatorMetricBoundary
    },
    { headers }
  );
}

export async function POST(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "protected-operator-metrics-create",
    limit: 20,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Protected operator metric capture is temporarily rate limited."
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
          message: "Protected operator metric capture requires application/json."
        },
        boundary: protectedOperatorMetricBoundary
      },
      { status: 415, headers }
    );
  }

  const rawBody = await request.text();

  if (rawBody.length > 2600) {
    return NextResponse.json(
      {
        error: {
          code: "payload-too-large",
          message: "Operator metric capture accepts bounded no-PHI operating metadata only."
        },
        boundary: protectedOperatorMetricBoundary
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
        boundary: protectedOperatorMetricBoundary
      },
      { status: 400, headers }
    );
  }

  const validation = validateProtectedOperatorMetricInput(payload);

  if (!validation.ok) {
    return NextResponse.json(
      {
        service: "scrimed-protected-operator-metrics",
        status: "validation-failed",
        errors: validation.errors,
        boundary: protectedOperatorMetricBoundary
      },
      { status: 400, headers }
    );
  }

  const result = await recordProtectedOperatorMetric(
    authorization.context.client,
    authorization.workspace.slug,
    validation.input
  );

  if (result.error || !result.metricId) {
    const message = result.error?.message ?? "";

    return NextResponse.json(
      {
        error: {
          code: "protected-operator-metric-capture-failed",
          message:
            "The protected operator metric was not recorded because the tenant-scoped governance write failed."
        },
        boundary: protectedOperatorMetricBoundary
      },
      { status: statusForOperatorMetricError(message), headers }
    );
  }

  const metricsResult = await listProtectedOperatorMetrics(
    authorization.context.client,
    authorization.workspace.id
  );
  const metrics = metricsResult.error ? [] : metricsResult.metrics;

  return NextResponse.json(
    {
      service: "scrimed-protected-operator-metrics",
      status: protectedOperatorMetricCaptureStatus,
      workspace: authorization.workspace,
      metricId: result.metricId,
      metrics,
      dashboard: buildProtectedOperatorMetricDashboard(metrics),
      boundary: protectedOperatorMetricBoundary
    },
    {
      status: 201,
      headers: {
        ...headers,
        "X-SCRIMED-Operator-Metric-Persisted": "true"
      }
    }
  );
}
