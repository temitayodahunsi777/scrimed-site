import { NextResponse } from "next/server";
import {
  deriveProtectedExternalApprovalEvidenceWorkflow
} from "../../../../lib/protectedExternalApprovalEvidence";
import { deriveProtectedFinanceMethodologyWorkflow } from "../../../../lib/protectedFinanceMethodology";
import {
  deriveProtectedReleaseDecisionWorkflow,
  protectedReleaseDecisionBoundary,
  protectedReleaseDecisionWorkflowStatus,
  validateProtectedReleaseDecisionInput
} from "../../../../lib/protectedReleaseDecisionWorkflow";
import {
  getAccessiblePilotWorkspace,
  getAuthenticatedGovernanceContext,
  listProtectedBoardScorecards,
  listProtectedExternalApprovalEvidenceReferences,
  listProtectedFinanceMethodologyGates,
  listProtectedReleaseDecisions,
  recordProtectedReleaseDecision
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

function statusForReleaseDecisionError(message: string) {
  if (
    message.includes("role-denied") ||
    message.includes("authentication-required") ||
    message.includes("aal2-session-required") ||
    message.includes("governance-aal2-session-required") ||
    message.includes("server-authorization-required")
  ) {
    return 403;
  }

  if (message.includes("workspace") || message.includes("evidence")) return 404;
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

async function buildWorkflow(
  context: Awaited<ReturnType<typeof getAuthenticatedGovernanceContext>> & { ok: true },
  workspaceId: string
) {
  const [
    scorecardsResult,
    financeRecordsResult,
    externalRecordsResult,
    releaseDecisionRecordsResult
  ] = await Promise.all([
    listProtectedBoardScorecards(context.client, workspaceId),
    listProtectedFinanceMethodologyGates(context.client, workspaceId),
    listProtectedExternalApprovalEvidenceReferences(context.client, workspaceId),
    listProtectedReleaseDecisions(context.client, workspaceId)
  ]);
  const unavailableSections = [
    scorecardsResult.error
      ? "Protected board scorecards could not be retrieved for release workflow context."
      : "",
    financeRecordsResult.error
      ? "Protected finance methodology gate history could not be retrieved; release decisions remain blocked until restored."
      : "",
    externalRecordsResult.error
      ? "Protected external approval evidence references could not be retrieved; release decisions remain blocked."
      : "",
    releaseDecisionRecordsResult.error
      ? "Protected release decision history could not be retrieved; claim registry remains open."
      : ""
  ].filter(Boolean);
  const financeWorkflow = deriveProtectedFinanceMethodologyWorkflow({
    records: financeRecordsResult.error ? [] : financeRecordsResult.records,
    scorecards: scorecardsResult.error ? [] : scorecardsResult.scorecards,
    unavailableSections: unavailableSections.filter((section) => section.includes("finance"))
  });
  const externalWorkflow = deriveProtectedExternalApprovalEvidenceWorkflow({
    records: externalRecordsResult.error ? [] : externalRecordsResult.records,
    financeGateRecords: financeRecordsResult.error ? [] : financeRecordsResult.records,
    financeWorkflow,
    unavailableSections: unavailableSections.filter((section) => section.includes("external"))
  });
  const workflow = deriveProtectedReleaseDecisionWorkflow({
    externalWorkflow,
    records: releaseDecisionRecordsResult.error ? [] : releaseDecisionRecordsResult.records,
    unavailableSections
  });

  return {
    financeRecords: financeRecordsResult.error ? [] : financeRecordsResult.records,
    financeWorkflow,
    externalRecords: externalRecordsResult.error ? [] : externalRecordsResult.records,
    externalWorkflow,
    records: releaseDecisionRecordsResult.error ? [] : releaseDecisionRecordsResult.records,
    workflow
  };
}

export async function GET(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "protected-release-decisions-read",
    limit: 60,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Protected release decision reads are temporarily rate limited."
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
      status: protectedReleaseDecisionWorkflowStatus,
      workspace: authorization.workspace,
      records: result.records,
      externalRecords: result.externalRecords,
      externalWorkflow: result.externalWorkflow,
      financeRecords: result.financeRecords,
      financeWorkflow: result.financeWorkflow,
      workflow: result.workflow,
      boundary: protectedReleaseDecisionBoundary
    },
    { headers }
  );
}

export async function POST(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "protected-release-decisions-record",
    limit: 12,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Protected release decision writes are temporarily rate limited."
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
          message: "Protected release decisions require application/json."
        },
        boundary: protectedReleaseDecisionBoundary
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
          message: "Release decisions accept bounded no-PHI claim registry metadata only."
        },
        boundary: protectedReleaseDecisionBoundary
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
        boundary: protectedReleaseDecisionBoundary
      },
      { status: 400, headers }
    );
  }

  const validation = validateProtectedReleaseDecisionInput(payload);

  if (!validation.ok) {
    return NextResponse.json(
      {
        service: "scrimed-protected-release-decision-workflow",
        status: "validation-failed",
        errors: validation.errors,
        boundary: protectedReleaseDecisionBoundary
      },
      { status: 400, headers }
    );
  }

  const result = await recordProtectedReleaseDecision(
    authorization.context.client,
    authorization.workspace.slug,
    validation.input
  );

  if (result.error || !result.decisionId) {
    const message = result.error?.message ?? "";

    return NextResponse.json(
      {
        error: {
          code: "protected-release-decision-record-failed",
          message:
            "The protected release decision was not recorded because the tenant-scoped governance write failed."
        },
        boundary: protectedReleaseDecisionBoundary
      },
      { status: statusForReleaseDecisionError(message), headers }
    );
  }

  const workflowResult = await buildWorkflow(authorization.context, authorization.workspace.id);

  return NextResponse.json(
    {
      service: workflowResult.workflow.service,
      status: protectedReleaseDecisionWorkflowStatus,
      workspace: authorization.workspace,
      decisionId: result.decisionId,
      records: workflowResult.records,
      externalRecords: workflowResult.externalRecords,
      externalWorkflow: workflowResult.externalWorkflow,
      financeRecords: workflowResult.financeRecords,
      financeWorkflow: workflowResult.financeWorkflow,
      workflow: workflowResult.workflow,
      boundary: protectedReleaseDecisionBoundary
    },
    {
      status: 201,
      headers: {
        ...headers,
        "X-SCRIMED-Release-Decision-Persisted": "true"
      }
    }
  );
}
