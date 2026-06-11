import { NextResponse } from "next/server";
import {
  getAccessiblePilotWorkspace,
  getAuthenticatedGovernanceContext,
  getTrustOSDecision,
  listTrustOSReviewEvents,
  recordTrustOSReviewEvent
} from "../../../../../../lib/protectedPilotStore";
import { enforceRequestRateLimit, rateLimitHeaders } from "../../../../../../lib/requestRateLimit";
import {
  trustOSDecisionLedgerBoundary,
  trustOSDecisionLedgerNoStoreHeaders,
  validateTrustOSReviewInput
} from "../../../../../../lib/trustOSDecisionLedger";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ workspaceSlug: string; decisionId: string }>;
};

async function getDecisionContext(request: Request, routeContext: RouteContext) {
  const context = await getAuthenticatedGovernanceContext(request);

  if (!context.ok) {
    return { ok: false as const, context };
  }

  const { workspaceSlug, decisionId } = await routeContext.params;
  const workspaceResult = await getAccessiblePilotWorkspace(context.client, workspaceSlug);

  if (workspaceResult.error || !workspaceResult.workspace) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: { code: "pilot-workspace-not-found", message: "No governed tenant workspace is available for this member and slug." } },
        { status: 404, headers: trustOSDecisionLedgerNoStoreHeaders }
      )
    };
  }

  const decisionResult = await getTrustOSDecision(context.client, workspaceResult.workspace.id, decisionId);

  if (decisionResult.error || !decisionResult.decision) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: { code: "trustos-decision-not-found", message: "No tenant-scoped TrustOS decision is available for this ledger ID." } },
        { status: 404, headers: trustOSDecisionLedgerNoStoreHeaders }
      )
    };
  }

  return {
    ok: true as const,
    auth: context,
    workspace: workspaceResult.workspace,
    decision: decisionResult.decision,
    workspaceSlug
  };
}

export async function GET(request: Request, routeContext: RouteContext) {
  const result = await getDecisionContext(request, routeContext);

  if (!result.ok) {
    if ("response" in result) return result.response;
    return NextResponse.json(
      { error: { code: result.context.code, message: result.context.message }, boundary: trustOSDecisionLedgerBoundary },
      { status: result.context.status, headers: trustOSDecisionLedgerNoStoreHeaders }
    );
  }

  const reviews = await listTrustOSReviewEvents(
    result.auth.client,
    result.workspace.id,
    result.decision.id
  );

  if (reviews.error) {
    return NextResponse.json(
      { error: { code: "trustos-review-query-failed", message: "The append-only TrustOS review trail could not be retrieved." } },
      { status: 502, headers: trustOSDecisionLedgerNoStoreHeaders }
    );
  }

  return NextResponse.json(
    {
      service: "scrimed-trustos-decision-reviews",
      boundary: trustOSDecisionLedgerBoundary,
      decision: result.decision,
      events: reviews.events
    },
    { headers: trustOSDecisionLedgerNoStoreHeaders }
  );
}

export async function POST(request: Request, routeContext: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "trustos-review-event-create",
    limit: 60,
    windowSeconds: 600
  });
  const headers = { ...trustOSDecisionLedgerNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: { code: "rate-limit-exceeded", message: "TrustOS review writes are temporarily rate limited." } },
      { status: 429, headers }
    );
  }

  const result = await getDecisionContext(request, routeContext);

  if (!result.ok) {
    if ("response" in result) return result.response;
    return NextResponse.json(
      { error: { code: result.context.code, message: result.context.message }, boundary: trustOSDecisionLedgerBoundary },
      { status: result.context.status, headers }
    );
  }

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json(
      { error: { code: "unsupported-content-type", message: "TrustOS reviews must use application/json." } },
      { status: 415, headers }
    );
  }

  const rawBody = await request.text();

  if (rawBody.length > 5000) {
    return NextResponse.json(
      { error: { code: "payload-too-large", message: "TrustOS reviews must remain concise and metadata-only." } },
      { status: 413, headers }
    );
  }

  let payload: unknown;

  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { error: { code: "invalid-json", message: "Request body must be valid JSON." } },
      { status: 400, headers }
    );
  }

  const validation = validateTrustOSReviewInput(payload);

  if (!validation.ok) {
    return NextResponse.json(
      { error: { code: "invalid-trustos-review", message: validation.message } },
      { status: 422, headers }
    );
  }

  const write = await recordTrustOSReviewEvent(
    result.auth.client,
    result.workspaceSlug,
    result.decision.id,
    validation.review
  );

  if (write.error) {
    return NextResponse.json(
      { error: { code: "trustos-review-persistence-failed", message: "The review and append-only audit event could not be committed." } },
      { status: write.error.message.includes("role-denied") ? 403 : 502, headers }
    );
  }

  const reviews = await listTrustOSReviewEvents(
    result.auth.client,
    result.workspace.id,
    result.decision.id
  );

  return NextResponse.json(
    {
      service: "scrimed-trustos-decision-reviews",
      status: "review-event-committed",
      boundary: trustOSDecisionLedgerBoundary,
      events: reviews.events
    },
    { status: 201, headers }
  );
}
