import { NextResponse } from "next/server";
import {
  buildProtectedMetricTrendDashboard,
  protectedMetricTrendBoundary,
  protectedMetricTrendReviewStatus,
  validateProtectedMetricTrendReviewInput
} from "../../../../lib/protectedMetricTrends";
import {
  createProtectedMetricTrendReview,
  getAccessiblePilotWorkspace,
  getAuthenticatedGovernanceContext,
  listProtectedMetricRollupSnapshots,
  listProtectedMetricTrendReviews
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

function statusForMetricTrendError(message: string) {
  if (
    message.includes("role-denied") ||
    message.includes("authentication-required") ||
    message.includes("aal2-session-required") ||
    message.includes("governance-aal2-session-required") ||
    message.includes("server-authorization-required")
  ) {
    return 403;
  }

  if (message.includes("workspace") || message.includes("snapshot") || message.includes("review")) {
    return 404;
  }

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
    namespace: "protected-metric-trends-read",
    limit: 60,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Protected metric trend reads are temporarily rate limited."
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

  const [snapshotsResult, reviewsResult] = await Promise.all([
    listProtectedMetricRollupSnapshots(authorization.context.client, authorization.workspace.id),
    listProtectedMetricTrendReviews(authorization.context.client, authorization.workspace.id)
  ]);

  if (snapshotsResult.error || reviewsResult.error) {
    const message = snapshotsResult.error?.message ?? reviewsResult.error?.message ?? "";

    return NextResponse.json(
      {
        error: {
          code: "protected-metric-trends-unavailable",
          message:
            "Protected metric trend reviews could not be retrieved. Use protected rollup snapshots plus external finance-reviewed variance workbooks as the safe temporary workaround."
        },
        boundary: protectedMetricTrendBoundary
      },
      { status: statusForMetricTrendError(message), headers }
    );
  }

  return NextResponse.json(
    {
      service: "scrimed-protected-metric-trends",
      status: protectedMetricTrendReviewStatus,
      workspace: authorization.workspace,
      reviewCount: reviewsResult.reviews.length,
      reviews: reviewsResult.reviews,
      dashboard: buildProtectedMetricTrendDashboard(
        snapshotsResult.snapshots,
        reviewsResult.reviews
      ),
      boundary: protectedMetricTrendBoundary
    },
    { headers }
  );
}

export async function POST(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "protected-metric-trends-create",
    limit: 12,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Protected metric trend review creation is temporarily rate limited."
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
          message: "Protected metric trend review creation requires application/json."
        },
        boundary: protectedMetricTrendBoundary
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
          message: "Metric trend reviews accept bounded no-PHI operating review metadata only."
        },
        boundary: protectedMetricTrendBoundary
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
        boundary: protectedMetricTrendBoundary
      },
      { status: 400, headers }
    );
  }

  const validation = validateProtectedMetricTrendReviewInput(payload);

  if (!validation.ok) {
    return NextResponse.json(
      {
        service: "scrimed-protected-metric-trends",
        status: "validation-failed",
        errors: validation.errors,
        boundary: protectedMetricTrendBoundary
      },
      { status: 400, headers }
    );
  }

  const result = await createProtectedMetricTrendReview(
    authorization.context.client,
    authorization.workspace.slug,
    validation.input
  );

  if (result.error || !result.reviewId) {
    const message = result.error?.message ?? "";

    return NextResponse.json(
      {
        error: {
          code: "protected-metric-trend-create-failed",
          message:
            "The protected metric trend review was not created because the tenant-scoped governance write failed."
        },
        boundary: protectedMetricTrendBoundary
      },
      { status: statusForMetricTrendError(message), headers }
    );
  }

  const [snapshotsResult, reviewsResult] = await Promise.all([
    listProtectedMetricRollupSnapshots(authorization.context.client, authorization.workspace.id),
    listProtectedMetricTrendReviews(authorization.context.client, authorization.workspace.id)
  ]);
  const snapshots = snapshotsResult.error ? [] : snapshotsResult.snapshots;
  const reviews = reviewsResult.error ? [] : reviewsResult.reviews;

  return NextResponse.json(
    {
      service: "scrimed-protected-metric-trends",
      status: protectedMetricTrendReviewStatus,
      workspace: authorization.workspace,
      reviewId: result.reviewId,
      reviews,
      dashboard: buildProtectedMetricTrendDashboard(snapshots, reviews),
      boundary: protectedMetricTrendBoundary
    },
    {
      status: 201,
      headers: {
        ...headers,
        "X-SCRIMED-Metric-Trend-Persisted": "true"
      }
    }
  );
}
