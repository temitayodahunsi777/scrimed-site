import { NextResponse } from "next/server";
import {
  deriveProtectedProviderSecurityReviewWorkflow,
  protectedProviderSecurityReviewBoundary,
  protectedProviderSecurityReviewBaaDpaAuthority,
  protectedProviderSecurityReviewStatus,
  validateProtectedProviderSecurityReviewInput
} from "../../../../lib/protectedProviderSecurityReviews";
import {
  getAccessiblePilotWorkspace,
  getAuthenticatedGovernanceContext,
  listProtectedEvidenceRoomProviderAdapters,
  listProtectedProviderSecurityReviews,
  recordProtectedProviderSecurityReview
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

function statusForProviderSecurityReviewError(message: string) {
  if (
    message.includes("role-denied") ||
    message.includes("authentication-required") ||
    message.includes("aal2-session-required") ||
    message.includes("governance-aal2-session-required") ||
    message.includes("server-authorization-required")
  ) {
    return 403;
  }

  if (message.includes("workspace") || message.includes("provider-adapter")) return 404;
  if (message.includes("does not exist") || message.includes("schema cache")) return 503;

  if (
    message.includes("invalid") ||
    message.includes("prohibited") ||
    message.includes("validation") ||
    message.includes("unsupported") ||
    message.includes("expired") ||
    message.includes("mismatch") ||
    message.includes("disabled") ||
    message.includes("forbidden")
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

async function buildWorkflow(
  context: Awaited<ReturnType<typeof getAuthenticatedGovernanceContext>> & { ok: true },
  workspaceId: string
) {
  const [providerAdapterRecordsResult, securityReviewRecordsResult] = await Promise.all([
    listProtectedEvidenceRoomProviderAdapters(context.client, workspaceId),
    listProtectedProviderSecurityReviews(context.client, workspaceId)
  ]);
  const unavailableSections = [
    providerAdapterRecordsResult.error
      ? "Protected evidence-room provider adapter history could not be retrieved; provider security review remains blocked."
      : "",
    securityReviewRecordsResult.error
      ? "Protected provider security review history could not be retrieved."
      : ""
  ].filter(Boolean);
  const workflow = deriveProtectedProviderSecurityReviewWorkflow({
    providerAdapterRecords: providerAdapterRecordsResult.error
      ? []
      : providerAdapterRecordsResult.records,
    records: securityReviewRecordsResult.error ? [] : securityReviewRecordsResult.records,
    unavailableSections
  });

  return {
    providerAdapterRecords: providerAdapterRecordsResult.error
      ? []
      : providerAdapterRecordsResult.records,
    securityReviewRecords: securityReviewRecordsResult.error
      ? []
      : securityReviewRecordsResult.records,
    workflow
  };
}

export async function GET(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "protected-provider-security-reviews-read",
    limit: 60,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Protected provider security review reads are temporarily rate limited."
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

  const result = await buildWorkflow(authorization.context, authorization.workspace.id);

  return NextResponse.json(
    {
      service: result.workflow.service,
      status: protectedProviderSecurityReviewStatus,
      workspace: authorization.workspace,
      records: result.securityReviewRecords,
      providerAdapterRecords: result.providerAdapterRecords,
      workflow: result.workflow,
      boundary: protectedProviderSecurityReviewBoundary
    },
    { headers }
  );
}

export async function POST(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "protected-provider-security-reviews-record",
    limit: 10,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Protected provider security review writes are temporarily rate limited."
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
          message: "Protected provider security reviews require application/json."
        },
        boundary: protectedProviderSecurityReviewBoundary
      },
      { status: 415, headers }
    );
  }

  const rawBody = await request.text();

  if (rawBody.length > 5200) {
    return NextResponse.json(
      {
        error: {
          code: "payload-too-large",
          message: "Provider security reviews accept bounded no-PHI metadata only."
        },
        boundary: protectedProviderSecurityReviewBoundary
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
        boundary: protectedProviderSecurityReviewBoundary
      },
      { status: 400, headers }
    );
  }

  const validation = validateProtectedProviderSecurityReviewInput(payload);

  if (!validation.ok) {
    return NextResponse.json(
      {
        service: "scrimed-protected-provider-security-reviews",
        status: "validation-failed",
        errors: validation.errors,
        boundary: protectedProviderSecurityReviewBoundary
      },
      { status: 400, headers }
    );
  }

  const result = await recordProtectedProviderSecurityReview(
    authorization.context.client,
    authorization.workspace.slug,
    validation.input
  );

  if (result.error || !result.reviewId) {
    const message = result.error?.message ?? "";

    return NextResponse.json(
      {
        error: {
          code: "protected-provider-security-review-record-failed",
          message:
            "The protected provider security review was not recorded because the tenant-scoped governance write failed."
        },
        boundary: protectedProviderSecurityReviewBoundary
      },
      { status: statusForProviderSecurityReviewError(message), headers }
    );
  }

  const workflowResult = await buildWorkflow(authorization.context, authorization.workspace.id);

  return NextResponse.json(
    {
      service: workflowResult.workflow.service,
      status: protectedProviderSecurityReviewStatus,
      workspace: authorization.workspace,
      reviewId: result.reviewId,
      records: workflowResult.securityReviewRecords,
      providerAdapterRecords: workflowResult.providerAdapterRecords,
      workflow: workflowResult.workflow,
      boundary: protectedProviderSecurityReviewBoundary
    },
    {
      status: 201,
      headers: {
        ...headers,
        "X-SCRIMED-Provider-Security-Review-Persisted": "true",
        "X-SCRIMED-BAA-DPA-Authority": protectedProviderSecurityReviewBaaDpaAuthority,
        "X-SCRIMED-Integration-State": "integration-disabled",
        "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care"
      }
    }
  );
}
