import { NextResponse } from "next/server";
import { deriveProtectedExternalApprovalEvidenceWorkflow } from "../../../../lib/protectedExternalApprovalEvidence";
import { deriveProtectedFinanceMethodologyWorkflow } from "../../../../lib/protectedFinanceMethodology";
import {
  deriveProtectedReleaseDecisionWorkflow
} from "../../../../lib/protectedReleaseDecisionWorkflow";
import {
  deriveProtectedNamedReviewerSignoffWorkflow
} from "../../../../lib/protectedNamedReviewerSignoffs";
import {
  deriveProtectedDistributionLockboxWorkflow,
  protectedDistributionLockboxBoundary,
  protectedDistributionLockboxStatus,
  validateProtectedDistributionLockboxInput
} from "../../../../lib/protectedDistributionLockbox";
import {
  getAccessiblePilotWorkspace,
  getAuthenticatedGovernanceContext,
  listProtectedBoardScorecards,
  listProtectedDistributionLockboxes,
  listProtectedExternalApprovalEvidenceReferences,
  listProtectedFinanceMethodologyGates,
  listProtectedNamedReviewerSignoffs,
  listProtectedReleaseDecisions,
  recordProtectedDistributionLockbox
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

function statusForLockboxError(message: string) {
  if (
    message.includes("role-denied") ||
    message.includes("authentication-required") ||
    message.includes("aal2-session-required") ||
    message.includes("governance-aal2-session-required") ||
    message.includes("server-authorization-required")
  ) {
    return 403;
  }

  if (message.includes("workspace") || message.includes("signoff")) return 404;
  if (message.includes("does not exist") || message.includes("schema cache")) return 503;

  if (
    message.includes("invalid") ||
    message.includes("prohibited") ||
    message.includes("validation") ||
    message.includes("unsupported") ||
    message.includes("expired") ||
    message.includes("mismatch") ||
    message.includes("disabled")
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
    releaseDecisionRecordsResult,
    signoffRecordsResult,
    lockboxRecordsResult
  ] = await Promise.all([
    listProtectedBoardScorecards(context.client, workspaceId),
    listProtectedFinanceMethodologyGates(context.client, workspaceId),
    listProtectedExternalApprovalEvidenceReferences(context.client, workspaceId),
    listProtectedReleaseDecisions(context.client, workspaceId),
    listProtectedNamedReviewerSignoffs(context.client, workspaceId),
    listProtectedDistributionLockboxes(context.client, workspaceId)
  ]);
  const unavailableSections = [
    scorecardsResult.error
      ? "Protected board scorecards could not be retrieved for distribution lockbox context."
      : "",
    financeRecordsResult.error
      ? "Protected finance methodology history could not be retrieved for distribution lockbox context."
      : "",
    externalRecordsResult.error
      ? "Protected external approval evidence references could not be retrieved for distribution lockbox context."
      : "",
    releaseDecisionRecordsResult.error
      ? "Protected release decision history could not be retrieved for distribution lockbox context."
      : "",
    signoffRecordsResult.error
      ? "Protected named reviewer sign-off history could not be retrieved; distribution lockbox review remains blocked."
      : "",
    lockboxRecordsResult.error
      ? "Protected distribution lockbox history could not be retrieved."
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
  const releaseWorkflow = deriveProtectedReleaseDecisionWorkflow({
    externalWorkflow,
    records: releaseDecisionRecordsResult.error ? [] : releaseDecisionRecordsResult.records,
    unavailableSections: unavailableSections.filter((section) => section.includes("release"))
  });
  const signoffWorkflow = deriveProtectedNamedReviewerSignoffWorkflow({
    records: signoffRecordsResult.error ? [] : signoffRecordsResult.records,
    releaseWorkflow,
    unavailableSections: unavailableSections.filter((section) => section.includes("sign-off"))
  });
  const workflow = deriveProtectedDistributionLockboxWorkflow({
    records: lockboxRecordsResult.error ? [] : lockboxRecordsResult.records,
    signoffWorkflow,
    unavailableSections
  });

  return {
    financeWorkflow,
    externalWorkflow,
    releaseWorkflow,
    signoffWorkflow,
    records: lockboxRecordsResult.error ? [] : lockboxRecordsResult.records,
    workflow
  };
}

export async function GET(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "protected-distribution-lockbox-read",
    limit: 60,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Protected distribution lockbox reads are temporarily rate limited."
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
      status: protectedDistributionLockboxStatus,
      workspace: authorization.workspace,
      records: result.records,
      financeWorkflow: result.financeWorkflow,
      externalWorkflow: result.externalWorkflow,
      releaseWorkflow: result.releaseWorkflow,
      signoffWorkflow: result.signoffWorkflow,
      workflow: result.workflow,
      boundary: protectedDistributionLockboxBoundary
    },
    { headers }
  );
}

export async function POST(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "protected-distribution-lockbox-record",
    limit: 10,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Protected distribution lockbox writes are temporarily rate limited."
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
          message: "Protected distribution lockbox records require application/json."
        },
        boundary: protectedDistributionLockboxBoundary
      },
      { status: 415, headers }
    );
  }

  const rawBody = await request.text();

  if (rawBody.length > 4600) {
    return NextResponse.json(
      {
        error: {
          code: "payload-too-large",
          message: "Distribution lockbox records accept bounded no-PHI metadata only."
        },
        boundary: protectedDistributionLockboxBoundary
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
        boundary: protectedDistributionLockboxBoundary
      },
      { status: 400, headers }
    );
  }

  const validation = validateProtectedDistributionLockboxInput(payload);

  if (!validation.ok) {
    return NextResponse.json(
      {
        service: "scrimed-protected-distribution-lockbox",
        status: "validation-failed",
        errors: validation.errors,
        boundary: protectedDistributionLockboxBoundary
      },
      { status: 400, headers }
    );
  }

  const result = await recordProtectedDistributionLockbox(
    authorization.context.client,
    authorization.workspace.slug,
    validation.input
  );

  if (result.error || !result.lockboxId) {
    const message = result.error?.message ?? "";

    return NextResponse.json(
      {
        error: {
          code: "protected-distribution-lockbox-record-failed",
          message:
            "The protected distribution lockbox record was not recorded because the tenant-scoped governance write failed."
        },
        boundary: protectedDistributionLockboxBoundary
      },
      { status: statusForLockboxError(message), headers }
    );
  }

  const workflowResult = await buildWorkflow(authorization.context, authorization.workspace.id);

  return NextResponse.json(
    {
      service: workflowResult.workflow.service,
      status: protectedDistributionLockboxStatus,
      workspace: authorization.workspace,
      lockboxId: result.lockboxId,
      records: workflowResult.records,
      financeWorkflow: workflowResult.financeWorkflow,
      externalWorkflow: workflowResult.externalWorkflow,
      releaseWorkflow: workflowResult.releaseWorkflow,
      signoffWorkflow: workflowResult.signoffWorkflow,
      workflow: workflowResult.workflow,
      boundary: protectedDistributionLockboxBoundary
    },
    {
      status: 201,
      headers: {
        ...headers,
        "X-SCRIMED-Distribution-Lockbox-Persisted": "true",
        "X-SCRIMED-Distribution-State": "external-distribution-disabled"
      }
    }
  );
}
