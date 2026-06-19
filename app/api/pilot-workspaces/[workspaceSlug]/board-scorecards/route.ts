import { NextResponse } from "next/server";
import {
  buildProtectedBoardScorecardDashboard,
  protectedBoardScorecardBoundary,
  protectedBoardScorecardStatus,
  validateProtectedBoardScorecardInput
} from "../../../../lib/protectedBoardScorecards";
import {
  createProtectedBoardScorecard,
  getAccessiblePilotWorkspace,
  getAuthenticatedGovernanceContext,
  listProtectedBoardScorecards,
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

function statusForBoardScorecardError(message: string) {
  if (
    message.includes("role-denied") ||
    message.includes("authentication-required") ||
    message.includes("aal2-session-required") ||
    message.includes("governance-aal2-session-required") ||
    message.includes("server-authorization-required")
  ) {
    return 403;
  }

  if (message.includes("workspace") || message.includes("trend") || message.includes("scorecard")) {
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
    namespace: "protected-board-scorecards-read",
    limit: 60,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Protected board scorecard reads are temporarily rate limited."
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

  const [trendsResult, scorecardsResult] = await Promise.all([
    listProtectedMetricTrendReviews(authorization.context.client, authorization.workspace.id),
    listProtectedBoardScorecards(authorization.context.client, authorization.workspace.id)
  ]);

  if (trendsResult.error || scorecardsResult.error) {
    const message = trendsResult.error?.message ?? scorecardsResult.error?.message ?? "";

    return NextResponse.json(
      {
        error: {
          code: "protected-board-scorecards-unavailable",
          message:
            "Protected board scorecards could not be retrieved. Use protected trend packets plus external finance-reviewed board materials as the safe temporary workaround."
        },
        boundary: protectedBoardScorecardBoundary
      },
      { status: statusForBoardScorecardError(message), headers }
    );
  }

  return NextResponse.json(
    {
      service: "scrimed-protected-board-scorecards",
      status: protectedBoardScorecardStatus,
      workspace: authorization.workspace,
      scorecardCount: scorecardsResult.scorecards.length,
      scorecards: scorecardsResult.scorecards,
      dashboard: buildProtectedBoardScorecardDashboard(
        trendsResult.reviews,
        scorecardsResult.scorecards
      ),
      boundary: protectedBoardScorecardBoundary
    },
    { headers }
  );
}

export async function POST(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "protected-board-scorecards-create",
    limit: 10,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Protected board scorecard creation is temporarily rate limited."
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
          message: "Protected board scorecard creation requires application/json."
        },
        boundary: protectedBoardScorecardBoundary
      },
      { status: 415, headers }
    );
  }

  const rawBody = await request.text();

  if (rawBody.length > 3200) {
    return NextResponse.json(
      {
        error: {
          code: "payload-too-large",
          message: "Board scorecards accept bounded no-PHI operating review metadata only."
        },
        boundary: protectedBoardScorecardBoundary
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
        boundary: protectedBoardScorecardBoundary
      },
      { status: 400, headers }
    );
  }

  const validation = validateProtectedBoardScorecardInput(payload);

  if (!validation.ok) {
    return NextResponse.json(
      {
        service: "scrimed-protected-board-scorecards",
        status: "validation-failed",
        errors: validation.errors,
        boundary: protectedBoardScorecardBoundary
      },
      { status: 400, headers }
    );
  }

  const result = await createProtectedBoardScorecard(
    authorization.context.client,
    authorization.workspace.slug,
    validation.input
  );

  if (result.error || !result.scorecardId) {
    const message = result.error?.message ?? "";

    return NextResponse.json(
      {
        error: {
          code: "protected-board-scorecard-create-failed",
          message:
            "The protected board scorecard was not created because the tenant-scoped governance write failed."
        },
        boundary: protectedBoardScorecardBoundary
      },
      { status: statusForBoardScorecardError(message), headers }
    );
  }

  const [trendsResult, scorecardsResult] = await Promise.all([
    listProtectedMetricTrendReviews(authorization.context.client, authorization.workspace.id),
    listProtectedBoardScorecards(authorization.context.client, authorization.workspace.id)
  ]);
  const reviews = trendsResult.error ? [] : trendsResult.reviews;
  const scorecards = scorecardsResult.error ? [] : scorecardsResult.scorecards;

  return NextResponse.json(
    {
      service: "scrimed-protected-board-scorecards",
      status: protectedBoardScorecardStatus,
      workspace: authorization.workspace,
      scorecardId: result.scorecardId,
      scorecards,
      dashboard: buildProtectedBoardScorecardDashboard(reviews, scorecards),
      boundary: protectedBoardScorecardBoundary
    },
    {
      status: 201,
      headers: {
        ...headers,
        "X-SCRIMED-Board-Scorecard-Persisted": "true"
      }
    }
  );
}
