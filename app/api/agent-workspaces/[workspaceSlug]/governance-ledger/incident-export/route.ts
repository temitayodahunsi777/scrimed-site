import { NextResponse } from "next/server";
import {
  getAccessiblePilotWorkspace,
  getAuthenticatedGovernanceContext,
  listAgentWorkspaceGovernanceLedger,
  listAgentWorkspaceWorkOrders,
  recordAgentWorkspaceGovernanceLedger
} from "../../../../../lib/protectedPilotStore";
import {
  protectedPilotBoundary,
  protectedPilotNoStoreHeaders
} from "../../../../../lib/protectedPilotWorkspace";
import {
  buildAgentWorkspaceIncidentExportPacket,
  validateAgentWorkspaceGovernanceLedgerPayload
} from "../../../../../lib/persistentAgentWorkspace";
import { enforceRequestRateLimit, rateLimitHeaders } from "../../../../../lib/requestRateLimit";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ workspaceSlug: string }>;
};

function getAppBaseUrl(request: Request) {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.VERCEL_PROJECT_PRODUCTION_URL;

  if (configuredUrl) {
    return configuredUrl.startsWith("http") ? configuredUrl : `https://${configuredUrl}`;
  }

  return new URL(request.url).origin;
}

export async function POST(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "agent-workspace-incident-export",
    limit: 20,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Agent Workspace incident exports are temporarily rate limited."
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
          message: "Agent Workspace incident exports must use application/json."
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
          message: "Agent Workspace incident export payloads must remain concise and synthetic-only."
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

  if (!validation.ok || validation.value.actionType !== "incident-export-requested") {
    return NextResponse.json(
      {
        error: {
          code: "invalid-agent-workspace-incident-export",
          message: "Incident export requires actionType incident-export-requested and a concrete severity.",
          fields: validation.ok ? ["actionType must be incident-export-requested"] : validation.errors
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
          code: "agent-workspace-incident-export-audit-failed",
          message:
            "The incident export was not released because its governance-ledger action could not be committed."
        },
        boundary: protectedPilotBoundary
      },
      { status: 502, headers }
    );
  }

  const workspaceResult = await getAccessiblePilotWorkspace(context.client, workspaceSlug);

  if (workspaceResult.error || !workspaceResult.workspace) {
    return NextResponse.json(
      {
        error: {
          code: "pilot-workspace-not-found",
          message: "No tenant-isolated pilot workspace is available for this member and slug."
        }
      },
      { status: 404, headers }
    );
  }

  const [workOrderResult, ledgerResult] = await Promise.all([
    listAgentWorkspaceWorkOrders(context.client, workspaceResult.workspace.id),
    listAgentWorkspaceGovernanceLedger(context.client, workspaceResult.workspace.id)
  ]);

  if (workOrderResult.error || ledgerResult.error) {
    return NextResponse.json(
      {
        error: {
          code: "agent-workspace-incident-export-evidence-unavailable",
          message:
            "The incident export was audited, but the packet was not released because workspace evidence could not be retrieved."
        },
        boundary: protectedPilotBoundary
      },
      { status: 503, headers }
    );
  }

  const recordedLedgerEntry =
    ledgerResult.ledgerRecords.find((record) => record.id === persistence.ledgerId) ?? null;

  if (!recordedLedgerEntry) {
    return NextResponse.json(
      {
        error: {
          code: "agent-workspace-incident-export-ledger-not-visible",
          message:
            "The incident export was audited, but the new ledger entry was not visible through tenant RLS, so the packet was not released."
        },
        boundary: protectedPilotBoundary
      },
      { status: 502, headers }
    );
  }

  const packet = buildAgentWorkspaceIncidentExportPacket({
    workspace: workspaceResult.workspace,
    workOrders: workOrderResult.workOrders,
    ledgerRecords: ledgerResult.ledgerRecords,
    recordedLedgerEntry,
    generatedAt: new Date().toISOString(),
    actorUserId: context.user.id,
    appBaseUrl: getAppBaseUrl(request)
  });
  const safeWorkspaceSlug = workspaceResult.workspace.slug.replace(/[^a-z0-9-]/gi, "-");

  return new NextResponse(packet, {
    headers: {
      ...headers,
      "Content-Disposition": `attachment; filename="scrimed-${safeWorkspaceSlug}-agent-workspace-incident-export.md"`,
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Data-Boundary": "synthetic-only",
      "X-SCRIMED-Incident-Export-Audited": "true",
      "X-SCRIMED-Governance-Ledger-ID": recordedLedgerEntry.id
    }
  });
}
