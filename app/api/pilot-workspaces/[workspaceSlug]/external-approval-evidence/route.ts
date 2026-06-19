import { NextResponse } from "next/server";
import {
  deriveProtectedExternalApprovalEvidenceWorkflow,
  protectedExternalApprovalEvidenceBoundary,
  protectedExternalApprovalEvidenceStatus,
  validateProtectedExternalApprovalEvidenceInput
} from "../../../../lib/protectedExternalApprovalEvidence";
import { deriveProtectedFinanceMethodologyWorkflow } from "../../../../lib/protectedFinanceMethodology";
import {
  getAccessiblePilotWorkspace,
  getAuthenticatedGovernanceContext,
  listProtectedBoardScorecards,
  listProtectedExternalApprovalEvidenceReferences,
  listProtectedFinanceMethodologyGates,
  recordProtectedExternalApprovalEvidenceReference
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

function statusForExternalApprovalEvidenceError(message: string) {
  if (
    message.includes("role-denied") ||
    message.includes("authentication-required") ||
    message.includes("aal2-session-required") ||
    message.includes("governance-aal2-session-required") ||
    message.includes("server-authorization-required")
  ) {
    return 403;
  }

  if (message.includes("workspace") || message.includes("gate")) return 404;
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

async function buildWorkflow(context: Awaited<ReturnType<typeof getAuthenticatedGovernanceContext>> & { ok: true }, workspaceId: string) {
  const [scorecardsResult, financeRecordsResult, externalRecordsResult] = await Promise.all([
    listProtectedBoardScorecards(context.client, workspaceId),
    listProtectedFinanceMethodologyGates(context.client, workspaceId),
    listProtectedExternalApprovalEvidenceReferences(context.client, workspaceId)
  ]);
  const unavailableSections = [
    scorecardsResult.error
      ? "Protected board scorecards could not be retrieved for finance workflow context."
      : "",
    financeRecordsResult.error
      ? "Protected finance methodology gate history could not be retrieved; keep external evidence references linked to external review systems until restored."
      : "",
    externalRecordsResult.error
      ? "Protected external approval evidence reference history could not be retrieved; external-use remains blocked."
      : ""
  ].filter(Boolean);
  const financeWorkflow = deriveProtectedFinanceMethodologyWorkflow({
    records: financeRecordsResult.error ? [] : financeRecordsResult.records,
    scorecards: scorecardsResult.error ? [] : scorecardsResult.scorecards,
    unavailableSections: unavailableSections.filter((section) => section.includes("finance"))
  });
  const workflow = deriveProtectedExternalApprovalEvidenceWorkflow({
    records: externalRecordsResult.error ? [] : externalRecordsResult.records,
    financeGateRecords: financeRecordsResult.error ? [] : financeRecordsResult.records,
    financeWorkflow,
    unavailableSections
  });

  return {
    scorecards: scorecardsResult.error ? [] : scorecardsResult.scorecards,
    financeRecords: financeRecordsResult.error ? [] : financeRecordsResult.records,
    records: externalRecordsResult.error ? [] : externalRecordsResult.records,
    financeWorkflow,
    workflow
  };
}

export async function GET(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "protected-external-approval-evidence-read",
    limit: 60,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Protected external approval evidence reads are temporarily rate limited."
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
      status: protectedExternalApprovalEvidenceStatus,
      workspace: authorization.workspace,
      records: result.records,
      financeRecords: result.financeRecords,
      financeWorkflow: result.financeWorkflow,
      workflow: result.workflow,
      boundary: protectedExternalApprovalEvidenceBoundary
    },
    { headers }
  );
}

export async function POST(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "protected-external-approval-evidence-record",
    limit: 12,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Protected external approval evidence writes are temporarily rate limited."
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
          message: "Protected external approval evidence references require application/json."
        },
        boundary: protectedExternalApprovalEvidenceBoundary
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
          message: "External approval evidence references accept bounded no-PHI metadata only."
        },
        boundary: protectedExternalApprovalEvidenceBoundary
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
        boundary: protectedExternalApprovalEvidenceBoundary
      },
      { status: 400, headers }
    );
  }

  const validation = validateProtectedExternalApprovalEvidenceInput(payload);

  if (!validation.ok) {
    return NextResponse.json(
      {
        service: "scrimed-protected-external-approval-evidence-links",
        status: "validation-failed",
        errors: validation.errors,
        boundary: protectedExternalApprovalEvidenceBoundary
      },
      { status: 400, headers }
    );
  }

  const result = await recordProtectedExternalApprovalEvidenceReference(
    authorization.context.client,
    authorization.workspace.slug,
    validation.input
  );

  if (result.error || !result.referenceId) {
    const message = result.error?.message ?? "";

    return NextResponse.json(
      {
        error: {
          code: "protected-external-approval-evidence-record-failed",
          message:
            "The protected external approval evidence reference was not recorded because the tenant-scoped governance write failed."
        },
        boundary: protectedExternalApprovalEvidenceBoundary
      },
      { status: statusForExternalApprovalEvidenceError(message), headers }
    );
  }

  const workflowResult = await buildWorkflow(authorization.context, authorization.workspace.id);

  return NextResponse.json(
    {
      service: workflowResult.workflow.service,
      status: protectedExternalApprovalEvidenceStatus,
      workspace: authorization.workspace,
      referenceId: result.referenceId,
      records: workflowResult.records,
      financeRecords: workflowResult.financeRecords,
      financeWorkflow: workflowResult.financeWorkflow,
      workflow: workflowResult.workflow,
      boundary: protectedExternalApprovalEvidenceBoundary
    },
    {
      status: 201,
      headers: {
        ...headers,
        "X-SCRIMED-External-Approval-Evidence-Persisted": "true"
      }
    }
  );
}
