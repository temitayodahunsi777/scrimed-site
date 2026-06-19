import { NextResponse } from "next/server";
import {
  deriveProtectedFinanceMethodologyWorkflow,
  protectedFinanceMethodologyBoundary,
  protectedFinanceMethodologyStatus,
  validateProtectedFinanceMethodologyInput
} from "../../../../lib/protectedFinanceMethodology";
import {
  getAccessiblePilotWorkspace,
  getAuthenticatedGovernanceContext,
  listProtectedBoardScorecards,
  listProtectedFinanceMethodologyGates,
  recordProtectedFinanceMethodologyGate
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

function statusForFinanceMethodologyError(message: string) {
  if (
    message.includes("role-denied") ||
    message.includes("authentication-required") ||
    message.includes("aal2-session-required") ||
    message.includes("governance-aal2-session-required") ||
    message.includes("server-authorization-required")
  ) {
    return 403;
  }

  if (message.includes("workspace") || message.includes("scorecard")) return 404;
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
    namespace: "protected-finance-methodology-read",
    limit: 60,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Protected finance methodology reads are temporarily rate limited."
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

  const [scorecardsResult, recordsResult] = await Promise.all([
    listProtectedBoardScorecards(authorization.context.client, authorization.workspace.id),
    listProtectedFinanceMethodologyGates(authorization.context.client, authorization.workspace.id)
  ]);
  const unavailableSections = [
    scorecardsResult.error
      ? "Protected board scorecards could not be retrieved; keep finance gates linked to external board materials until scorecard access is restored."
      : "",
    recordsResult.error
      ? "Protected finance methodology gate history could not be retrieved; use external signed finance/counsel review evidence as the safe workaround."
      : ""
  ].filter(Boolean);
  const workflow = deriveProtectedFinanceMethodologyWorkflow({
    records: recordsResult.error ? [] : recordsResult.records,
    scorecards: scorecardsResult.error ? [] : scorecardsResult.scorecards,
    unavailableSections
  });

  return NextResponse.json(
    {
      service: workflow.service,
      status: protectedFinanceMethodologyStatus,
      workspace: authorization.workspace,
      scorecards: scorecardsResult.error ? [] : scorecardsResult.scorecards,
      records: recordsResult.error ? [] : recordsResult.records,
      workflow,
      boundary: protectedFinanceMethodologyBoundary
    },
    { headers }
  );
}

export async function POST(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "protected-finance-methodology-record",
    limit: 12,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Protected finance methodology gate writes are temporarily rate limited."
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
          message: "Protected finance methodology gates require application/json."
        },
        boundary: protectedFinanceMethodologyBoundary
      },
      { status: 415, headers }
    );
  }

  const rawBody = await request.text();

  if (rawBody.length > 2400) {
    return NextResponse.json(
      {
        error: {
          code: "payload-too-large",
          message: "Finance methodology gates accept bounded no-PHI gate metadata only."
        },
        boundary: protectedFinanceMethodologyBoundary
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
        boundary: protectedFinanceMethodologyBoundary
      },
      { status: 400, headers }
    );
  }

  const validation = validateProtectedFinanceMethodologyInput(payload);

  if (!validation.ok) {
    return NextResponse.json(
      {
        service: "scrimed-protected-finance-methodology-gates",
        status: "validation-failed",
        errors: validation.errors,
        boundary: protectedFinanceMethodologyBoundary
      },
      { status: 400, headers }
    );
  }

  const result = await recordProtectedFinanceMethodologyGate(
    authorization.context.client,
    authorization.workspace.slug,
    validation.input
  );

  if (result.error || !result.gateRecordId) {
    const message = result.error?.message ?? "";

    return NextResponse.json(
      {
        error: {
          code: "protected-finance-methodology-gate-record-failed",
          message:
            "The protected finance methodology gate was not recorded because the tenant-scoped governance write failed."
        },
        boundary: protectedFinanceMethodologyBoundary
      },
      { status: statusForFinanceMethodologyError(message), headers }
    );
  }

  const [scorecardsResult, recordsResult] = await Promise.all([
    listProtectedBoardScorecards(authorization.context.client, authorization.workspace.id),
    listProtectedFinanceMethodologyGates(authorization.context.client, authorization.workspace.id)
  ]);
  const workflow = deriveProtectedFinanceMethodologyWorkflow({
    records: recordsResult.error ? [] : recordsResult.records,
    scorecards: scorecardsResult.error ? [] : scorecardsResult.scorecards,
    unavailableSections: [
      scorecardsResult.error ? "Protected board scorecards could not be refreshed." : "",
      recordsResult.error ? "Protected finance methodology gate history could not be refreshed." : ""
    ].filter(Boolean)
  });

  return NextResponse.json(
    {
      service: workflow.service,
      status: protectedFinanceMethodologyStatus,
      workspace: authorization.workspace,
      gateRecordId: result.gateRecordId,
      scorecards: scorecardsResult.error ? [] : scorecardsResult.scorecards,
      records: recordsResult.error ? [] : recordsResult.records,
      workflow,
      boundary: protectedFinanceMethodologyBoundary
    },
    {
      status: 201,
      headers: {
        ...headers,
        "X-SCRIMED-Finance-Methodology-Gate-Persisted": "true"
      }
    }
  );
}
