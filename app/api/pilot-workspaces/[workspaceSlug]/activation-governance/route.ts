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
import { enforceRequestRateLimit, rateLimitHeaders } from "../../../../lib/requestRateLimit";
import {
  buildWorkspaceActivationGovernanceLedgerSeed,
  buildWorkspaceActivationGovernanceProfile,
  buildWorkspaceActivationGovernanceSummary,
  findWorkspaceActivationGovernanceLedgerRecords,
  resolveWorkspaceActivationGovernancePack
} from "../../../../lib/workspaceActivationGovernance";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ workspaceSlug: string }>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function optionalString(value: unknown, maxLength = 1000) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function containsProhibitedSensitiveHint(value: string) {
  return /\b(mrn|ssn|date of birth|dob|medical record number|member id|patient name)\b/i.test(value);
}

function selectedPackSlugFromRecord(record: { eventMetadata: Record<string, unknown> }) {
  const slug = record.eventMetadata.governanceWorkflowPackSlug;
  return typeof slug === "string" ? slug : "";
}

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
        },
        boundary: protectedPilotBoundary
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
          code: "activation-governance-ledger-unavailable",
          message:
            "Activation governance cannot be inspected until the Agent Workspace governance ledger migration and RLS policies are available."
        },
        boundary: protectedPilotBoundary
      },
      { status: 503, headers: protectedPilotNoStoreHeaders }
    );
  }

  const existingActivationRecords = findWorkspaceActivationGovernanceLedgerRecords(
    ledgerResult.ledgerRecords
  );
  const existingPackSlug = existingActivationRecords[0]
    ? selectedPackSlugFromRecord(existingActivationRecords[0])
    : "";
  const profile = buildWorkspaceActivationGovernanceProfile({
    workspace: workspaceResult.workspace,
    governanceWorkflowPackSlug: existingPackSlug || undefined
  });

  return NextResponse.json(
    buildWorkspaceActivationGovernanceSummary({
      workspace: workspaceResult.workspace,
      profile,
      ledgerRecords: ledgerResult.ledgerRecords
    }),
    { headers: protectedPilotNoStoreHeaders }
  );
}

export async function POST(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "pilot-workspace-activation-governance",
    limit: 20,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Protected pilot activation-governance actions are temporarily rate limited."
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
          message: "Activation-governance actions must use application/json."
        }
      },
      { status: 415, headers }
    );
  }

  const rawBody = await request.text();

  if (rawBody.length > 8000) {
    return NextResponse.json(
      {
        error: {
          code: "payload-too-large",
          message: "Activation-governance payloads must remain concise and metadata-only."
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

  if (!isRecord(payload)) {
    return NextResponse.json(
      { error: { code: "invalid-payload", message: "Request body must be a JSON object." } },
      { status: 422, headers }
    );
  }

  const governanceWorkflowPackSlug = optionalString(payload.governanceWorkflowPackSlug, 96);
  const activationOwner = optionalString(payload.activationOwner, 160);
  const sourceIntakeId = optionalString(payload.sourceIntakeId, 120);
  const sourceOpportunityId = optionalString(payload.sourceOpportunityId, 120);
  const notes = optionalString(payload.notes, 1000);
  const sensitiveText = [activationOwner, sourceIntakeId, sourceOpportunityId, notes].join(" ");

  if (governanceWorkflowPackSlug && !resolveWorkspaceActivationGovernancePack(governanceWorkflowPackSlug)) {
    return NextResponse.json(
      {
        error: {
          code: "unknown-governance-workflow-pack",
          message: "The requested governance workflow pack is not available for activation."
        },
        boundary: protectedPilotBoundary
      },
      { status: 422, headers }
    );
  }

  if (containsProhibitedSensitiveHint(sensitiveText)) {
    return NextResponse.json(
      {
        error: {
          code: "sensitive-metadata-blocked",
          message:
            "Activation governance accepts administrative metadata only. Remove patient identifiers, member identifiers, or clinical details."
        },
        boundary: protectedPilotBoundary
      },
      { status: 422, headers }
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
        },
        boundary: protectedPilotBoundary
      },
      { status: 404, headers }
    );
  }

  const beforeLedger = await listAgentWorkspaceGovernanceLedger(
    context.client,
    workspaceResult.workspace.id
  );

  if (beforeLedger.error) {
    return NextResponse.json(
      {
        error: {
          code: "activation-governance-ledger-unavailable",
          message:
            "Activation governance cannot be recorded until the Agent Workspace governance ledger migration and RLS policies are available."
        },
        boundary: protectedPilotBoundary
      },
      { status: 503, headers }
    );
  }

  const profile = buildWorkspaceActivationGovernanceProfile({
    workspace: workspaceResult.workspace,
    governanceWorkflowPackSlug,
    activationOwner,
    sourceIntakeId,
    sourceOpportunityId,
    notes
  });
  const existingActivationRecords = findWorkspaceActivationGovernanceLedgerRecords(
    beforeLedger.ledgerRecords
  );
  const existingMatchingRecord = existingActivationRecords.find(
    (record) => selectedPackSlugFromRecord(record) === profile.selectedPack.slug
  );

  if (existingMatchingRecord) {
    return NextResponse.json(
      {
        ...buildWorkspaceActivationGovernanceSummary({
          workspace: workspaceResult.workspace,
          profile,
          ledgerRecords: beforeLedger.ledgerRecords
        }),
        status: "activation-governance-already-recorded",
        ledgerId: existingMatchingRecord.id,
        ledgerRecord: existingMatchingRecord
      },
      { status: 200, headers }
    );
  }

  const input = buildWorkspaceActivationGovernanceLedgerSeed(profile);
  const persistence = await recordAgentWorkspaceGovernanceLedger(
    context.client,
    workspaceSlug,
    input
  );

  if (persistence.error || !persistence.ledgerId) {
    return NextResponse.json(
      {
        error: {
          code: "activation-governance-persistence-failed",
          message:
            "The activation governance pack was not committed. Confirm governance-ledger migration, RLS, role, and AAL2 session before retrying."
        },
        boundary: protectedPilotBoundary
      },
      { status: 503, headers }
    );
  }

  const afterLedger = await listAgentWorkspaceGovernanceLedger(
    context.client,
    workspaceResult.workspace.id
  );
  const ledgerRecord =
    afterLedger.ledgerRecords.find((record) => record.id === persistence.ledgerId) ?? null;

  return NextResponse.json(
    {
      ...buildWorkspaceActivationGovernanceSummary({
        workspace: workspaceResult.workspace,
        profile,
        ledgerRecords: afterLedger.ledgerRecords
      }),
      status: "activation-governance-recorded",
      ledgerId: persistence.ledgerId,
      ledgerRecord
    },
    { status: 201, headers }
  );
}
