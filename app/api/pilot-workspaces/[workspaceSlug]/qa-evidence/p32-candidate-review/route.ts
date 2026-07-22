import { NextResponse } from "next/server";
import {
  createP32CandidateReviewAssignment,
  getP32CandidateReviewSummary,
  isP32CandidateReviewEnabled,
  P32CandidateReviewError,
  recordP32CandidateReviewDecision,
  scrimedP32CandidateReviewBoundary,
  scrimedP32CandidateReviewStatus,
  validateP32CandidateReviewAssignmentRequest,
  validateP32CandidateReviewDecisionRequest
} from "../../../../../lib/scrimedP32CandidateReview";
import {
  createP32CandidateReviewAssignmentReceipt,
  getAccessiblePilotWorkspace,
  getAuthenticatedGovernanceContext,
  recordP32CandidateReviewDecisionReceipt
} from "../../../../../lib/protectedPilotStore";
import {
  protectedPilotBoundary,
  protectedPilotNoStoreHeaders
} from "../../../../../lib/protectedPilotWorkspace";
import {
  enforceRequestRateLimit,
  rateLimitHeaders
} from "../../../../../lib/requestRateLimit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ workspaceSlug: string }>;
};

const routeHeaders = {
  ...protectedPilotNoStoreHeaders,
  "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
  "X-SCRIMED-Data-Boundary": "synthetic-metadata-only",
  "X-SCRIMED-P32-Candidate-Review": "exact-candidate-human-review-only",
  "X-SCRIMED-Release-Authority": "not-granted"
};

function controlledError(
  error: P32CandidateReviewError,
  headers: HeadersInit
) {
  return NextResponse.json(
    {
      error: { code: error.code, message: error.message },
      boundary: scrimedP32CandidateReviewBoundary
    },
    { status: error.status, headers }
  );
}

async function authenticatedWorkspace(request: Request, workspaceSlug: string) {
  const context = await getAuthenticatedGovernanceContext(request);
  if (!context.ok) return { context, workspace: null } as const;
  const workspaceResult = await getAccessiblePilotWorkspace(
    context.client,
    workspaceSlug
  );
  if (workspaceResult.error || !workspaceResult.workspace) {
    return { context, workspace: null } as const;
  }
  return { context, workspace: workspaceResult.workspace } as const;
}

export async function GET(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "protected-p32-candidate-review-read",
    limit: 20,
    windowSeconds: 600
  });
  const headers = { ...routeHeaders, ...rateLimitHeaders(rateLimit) };
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Protected candidate-review readiness is temporarily rate limited."
        },
        boundary: scrimedP32CandidateReviewBoundary
      },
      { status: 429, headers }
    );
  }
  if (!isP32CandidateReviewEnabled()) {
    return NextResponse.json(
      {
        error: {
          code: "p32-candidate-review-disabled",
          message: "Protected p.32 candidate review is disabled by default."
        },
        boundary: scrimedP32CandidateReviewBoundary
      },
      { status: 503, headers }
    );
  }

  const { workspaceSlug } = await params;
  const resolved = await authenticatedWorkspace(request, workspaceSlug);
  if (!resolved.context.ok) {
    return NextResponse.json(
      {
        error: {
          code: resolved.context.code,
          message: resolved.context.message
        },
        boundary: protectedPilotBoundary
      },
      { status: resolved.context.status, headers }
    );
  }
  if (!resolved.workspace) {
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

  try {
    return NextResponse.json(
      {
        service: "scrimed-protected-p32-candidate-review",
        workspace: resolved.workspace,
        ...getP32CandidateReviewSummary({
          tenantId: resolved.workspace.tenantId,
          userId: resolved.context.user.id
        })
      },
      { status: 200, headers }
    );
  } catch (error) {
    if (error instanceof P32CandidateReviewError) {
      return controlledError(error, headers);
    }
    return NextResponse.json(
      {
        error: {
          code: "p32-candidate-review-unavailable",
          message: "Protected candidate-review readiness failed closed."
        },
        boundary: scrimedP32CandidateReviewBoundary
      },
      { status: 503, headers }
    );
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  const requestUrl = new URL(request.url);
  const action = requestUrl.searchParams.get("action");
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: `protected-p32-candidate-review-${action ?? "unknown"}`,
    limit: 6,
    windowSeconds: 600
  });
  const headers = { ...routeHeaders, ...rateLimitHeaders(rateLimit) };
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Protected candidate review is temporarily rate limited."
        },
        boundary: scrimedP32CandidateReviewBoundary
      },
      { status: 429, headers }
    );
  }
  if (!isP32CandidateReviewEnabled()) {
    return NextResponse.json(
      {
        error: {
          code: "p32-candidate-review-disabled",
          message: "Protected p.32 candidate review is disabled by default."
        },
        boundary: scrimedP32CandidateReviewBoundary
      },
      { status: 503, headers }
    );
  }
  if (action !== "assign" && action !== "decide") {
    return NextResponse.json(
      {
        error: {
          code: "p32-candidate-review-action-invalid",
          message: "Candidate review supports only assign or decide actions."
        },
        boundary: scrimedP32CandidateReviewBoundary
      },
      { status: 400, headers }
    );
  }
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json(
      {
        error: {
          code: "unsupported-content-type",
          message: "Protected candidate review requires application/json."
        },
        boundary: scrimedP32CandidateReviewBoundary
      },
      { status: 415, headers }
    );
  }

  const rawBody = await request.text();
  if (rawBody.length > 2048) {
    return NextResponse.json(
      {
        error: {
          code: "payload-too-large",
          message: "Protected candidate review accepts bounded metadata only."
        },
        boundary: scrimedP32CandidateReviewBoundary
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
        boundary: scrimedP32CandidateReviewBoundary
      },
      { status: 400, headers }
    );
  }

  const { workspaceSlug } = await params;
  const resolved = await authenticatedWorkspace(request, workspaceSlug);
  if (!resolved.context.ok) {
    return NextResponse.json(
      {
        error: {
          code: resolved.context.code,
          message: resolved.context.message
        },
        boundary: protectedPilotBoundary
      },
      { status: resolved.context.status, headers }
    );
  }
  if (!resolved.workspace) {
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

  try {
    if (action === "assign") {
      const result = await createP32CandidateReviewAssignment({
        request: validateP32CandidateReviewAssignmentRequest(payload),
        idempotencyKey: request.headers.get("idempotency-key")?.trim() ?? "",
        assignerUserId: resolved.context.user.id,
        persistAssignment: (input) =>
          createP32CandidateReviewAssignmentReceipt(
            resolved.context.client,
            resolved.workspace!.slug,
            input
          )
      });
      return NextResponse.json(
        {
          service: "scrimed-protected-p32-candidate-review",
          status: scrimedP32CandidateReviewStatus,
          workspace: resolved.workspace,
          ...result,
          humanDecisionRecorded: false,
          releaseAuthorityGranted: false,
          boundary: scrimedP32CandidateReviewBoundary
        },
        {
          status: 201,
          headers: {
            ...headers,
            "X-SCRIMED-P32-Candidate-Review": "assignment-recorded"
          }
        }
      );
    }

    const result = await recordP32CandidateReviewDecision({
      request: validateP32CandidateReviewDecisionRequest(payload),
      idempotencyKey: request.headers.get("idempotency-key")?.trim() ?? "",
      reviewerUserId: resolved.context.user.id,
      tenantId: resolved.workspace.tenantId,
      persistDecision: (input) =>
        recordP32CandidateReviewDecisionReceipt(
          resolved.context.client,
          resolved.workspace!.slug,
          input
        )
    });
    return NextResponse.json(
      {
        service: "scrimed-protected-p32-candidate-review",
        status: scrimedP32CandidateReviewStatus,
        workspace: resolved.workspace,
        ...result,
        releaseAuthorityGranted: false,
        boundary: scrimedP32CandidateReviewBoundary
      },
      {
        status: 201,
        headers: {
          ...headers,
          "X-SCRIMED-P32-Candidate-Review": "human-decision-recorded"
        }
      }
    );
  } catch (error) {
    if (error instanceof P32CandidateReviewError) {
      return controlledError(error, headers);
    }
    return NextResponse.json(
      {
        error: {
          code: "p32-candidate-review-unavailable",
          message: "Protected p.32 candidate review failed closed."
        },
        boundary: scrimedP32CandidateReviewBoundary
      },
      { status: 503, headers }
    );
  }
}
