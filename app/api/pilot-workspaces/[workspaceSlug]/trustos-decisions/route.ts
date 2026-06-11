import { NextResponse } from "next/server";
import {
  getAccessiblePilotWorkspace,
  getAuthenticatedGovernanceContext,
  getTrustOSDecision,
  listTrustOSDecisions,
  persistTrustOSDecision
} from "../../../../lib/protectedPilotStore";
import { enforceRequestRateLimit, rateLimitHeaders } from "../../../../lib/requestRateLimit";
import { evaluateTrustOSRequest, validateTrustOSPayload } from "../../../../lib/trustOS";
import {
  trustOSDecisionLedgerBoundary,
  trustOSDecisionLedgerNoStoreHeaders
} from "../../../../lib/trustOSDecisionLedger";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ workspaceSlug: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  const context = await getAuthenticatedGovernanceContext(request);

  if (!context.ok) {
    return NextResponse.json(
      { error: { code: context.code, message: context.message }, boundary: trustOSDecisionLedgerBoundary },
      { status: context.status, headers: trustOSDecisionLedgerNoStoreHeaders }
    );
  }

  const { workspaceSlug } = await params;
  const workspaceResult = await getAccessiblePilotWorkspace(context.client, workspaceSlug);

  if (workspaceResult.error || !workspaceResult.workspace) {
    return NextResponse.json(
      { error: { code: "pilot-workspace-not-found", message: "No governed tenant workspace is available for this member and slug." } },
      { status: 404, headers: trustOSDecisionLedgerNoStoreHeaders }
    );
  }

  const result = await listTrustOSDecisions(context.client, workspaceResult.workspace.id);

  if (result.error) {
    return NextResponse.json(
      { error: { code: "trustos-ledger-query-failed", message: "The tenant TrustOS Decision Ledger could not be retrieved." } },
      { status: 502, headers: trustOSDecisionLedgerNoStoreHeaders }
    );
  }

  return NextResponse.json(
    {
      service: "scrimed-trustos-decision-ledger",
      boundary: trustOSDecisionLedgerBoundary,
      workspace: workspaceResult.workspace,
      decisions: result.decisions
    },
    { headers: trustOSDecisionLedgerNoStoreHeaders }
  );
}

export async function POST(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "trustos-decision-ledger-create",
    limit: 30,
    windowSeconds: 600
  });
  const headers = { ...trustOSDecisionLedgerNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: { code: "rate-limit-exceeded", message: "TrustOS Decision Ledger writes are temporarily rate limited." } },
      { status: 429, headers }
    );
  }

  const context = await getAuthenticatedGovernanceContext(request);

  if (!context.ok) {
    return NextResponse.json(
      { error: { code: context.code, message: context.message }, boundary: trustOSDecisionLedgerBoundary },
      { status: context.status, headers }
    );
  }

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json(
      { error: { code: "unsupported-content-type", message: "TrustOS decisions must use application/json." } },
      { status: 415, headers }
    );
  }

  const rawBody = await request.text();

  if (rawBody.length > 18000) {
    return NextResponse.json(
      { error: { code: "payload-too-large", message: "TrustOS ledger requests must remain concise and synthetic-safe." } },
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

  const validation = validateTrustOSPayload(payload);

  if (!validation.valid) {
    return NextResponse.json(
      { error: { code: "invalid-trustos-request", message: validation.errors.join(" ") } },
      { status: 422, headers }
    );
  }

  const body = payload as Record<string, unknown>;
  const pilotSessionId =
    typeof body.pilotSessionId === "string" && /^[0-9a-f-]{36}$/i.test(body.pilotSessionId)
      ? body.pilotSessionId
      : null;
  const decisionRecord = evaluateTrustOSRequest(validation.request);
  const { workspaceSlug } = await params;
  const persistence = await persistTrustOSDecision(
    context.client,
    workspaceSlug,
    decisionRecord,
    validation.request.workflow,
    pilotSessionId
  );

  if (persistence.error || !persistence.decisionId) {
    return NextResponse.json(
      {
        error: {
          code: "trustos-decision-persistence-failed",
          message: "The decision was not released because the tenant ledger and append-only audit event could not be committed."
        }
      },
      { status: persistence.error?.message.includes("role-denied") ? 403 : 502, headers }
    );
  }

  const workspaceResult = await getAccessiblePilotWorkspace(context.client, workspaceSlug);
  const decisionResult = workspaceResult.workspace
    ? await getTrustOSDecision(context.client, workspaceResult.workspace.id, persistence.decisionId)
    : { decision: null, error: null };

  return NextResponse.json(
    {
      service: "scrimed-trustos-decision-ledger",
      status: "decision-committed",
      boundary: trustOSDecisionLedgerBoundary,
      decision: decisionResult.decision ?? { id: persistence.decisionId, decisionRecord }
    },
    { status: 201, headers }
  );
}
