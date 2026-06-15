import { NextResponse } from "next/server";
import {
  getAccessiblePilotWorkspace,
  getAuthenticatedGovernanceContext,
  getAuthenticatedPilotContext,
  listAgentWorkspaceGovernanceLedger,
  recordAgentWorkspaceGovernanceLedger
} from "../../../../lib/protectedPilotStore";
import {
  protectedPilotBoundary,
  protectedPilotNoStoreHeaders
} from "../../../../lib/protectedPilotWorkspace";
import {
  summarizeAgentWorkspaceGovernanceLedger,
  validateAgentWorkspaceGovernanceLedgerPayload
} from "../../../../lib/persistentAgentWorkspace";
import { enforceRequestRateLimit, rateLimitHeaders } from "../../../../lib/requestRateLimit";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ workspaceSlug: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  const context = await getAuthenticatedPilotContext(request);

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
        }
      },
      { status: 404, headers: protectedPilotNoStoreHeaders }
    );
  }

  const ledgerResult = await listAgentWorkspaceGovernanceLedger(
    context.client,
    workspaceResult.workspace.id
  );

  if (ledgerResult.error) {
    return NextResponse.json(
      {
        error: {
          code: "agent-workspace-governance-ledger-unavailable",
          message:
            "The Agent Workspace governance ledger is not available for this environment. Apply the governance-ledger migration and verify RLS before use."
        },
        boundary: protectedPilotBoundary
      },
      { status: 503, headers: protectedPilotNoStoreHeaders }
    );
  }

  return NextResponse.json(
    {
      service: "scrimed-agent-workspace-governance-ledger",
      boundary: protectedPilotBoundary,
      workspace: workspaceResult.workspace,
      dashboard: summarizeAgentWorkspaceGovernanceLedger(ledgerResult.ledgerRecords),
      ledgerRecords: ledgerResult.ledgerRecords
    },
    { headers: protectedPilotNoStoreHeaders }
  );
}

export async function POST(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "agent-workspace-governance-ledger",
    limit: 40,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Agent Workspace governance-ledger actions are temporarily rate limited."
        }
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
          message: "Agent Workspace governance-ledger actions must use application/json."
        }
      },
      { status: 415, headers }
    );
  }

  const rawBody = await request.text();

  if (rawBody.length > 12000) {
    return NextResponse.json(
      {
        error: {
          code: "payload-too-large",
          message: "Agent Workspace governance-ledger payloads must remain concise and synthetic-only."
        }
      },
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

  const validation = validateAgentWorkspaceGovernanceLedgerPayload(payload);

  if (!validation.ok) {
    return NextResponse.json(
      {
        error: {
          code: "invalid-agent-workspace-governance-ledger-action",
          message: "The governance-ledger action did not satisfy SCRIMED Agent Workspace boundaries.",
          fields: validation.errors
        }
      },
      { status: 422, headers }
    );
  }

  const { workspaceSlug } = await params;
  const persistence = await recordAgentWorkspaceGovernanceLedger(
    context.client,
    workspaceSlug,
    validation.value
  );

  if (persistence.error || !persistence.ledgerId) {
    return NextResponse.json(
      {
        error: {
          code: "agent-workspace-governance-ledger-persistence-failed",
          message:
            "The governance-ledger action was not committed. Confirm the migration, RLS policies, role, AAL2 session, and action-specific fields before retrying."
        },
        boundary: protectedPilotBoundary
      },
      { status: 503, headers }
    );
  }

  const workspaceResult = await getAccessiblePilotWorkspace(context.client, workspaceSlug);
  const ledgerResult = workspaceResult.workspace
    ? await listAgentWorkspaceGovernanceLedger(context.client, workspaceResult.workspace.id)
    : { ledgerRecords: [], error: null };
  const ledgerRecord =
    ledgerResult.ledgerRecords.find((record) => record.id === persistence.ledgerId) ??
    null;

  return NextResponse.json(
    {
      service: "scrimed-agent-workspace-governance-ledger",
      status: "governance-ledger-recorded",
      boundary: protectedPilotBoundary,
      ledgerId: persistence.ledgerId,
      ledgerRecord,
      dashboard: summarizeAgentWorkspaceGovernanceLedger(ledgerResult.ledgerRecords)
    },
    { status: 201, headers }
  );
}
