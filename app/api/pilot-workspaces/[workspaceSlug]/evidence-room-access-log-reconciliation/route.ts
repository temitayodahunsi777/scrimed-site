import { NextResponse } from "next/server";
import { deriveProtectedDistributionLockboxWorkflow } from "../../../../lib/protectedDistributionLockbox";
import {
  deriveProtectedEvidenceRoomAccessLogReconciliationWorkflow,
  protectedEvidenceRoomAccessLogBoundary,
  protectedEvidenceRoomAccessLogReconciliationStatus,
  validateProtectedEvidenceRoomAccessLogReconciliationInput
} from "../../../../lib/protectedEvidenceRoomAccessLogReconciliation";
import {
  deriveProtectedEvidenceRoomRecipientAttestationWorkflow
} from "../../../../lib/protectedEvidenceRoomRecipientAttestations";
import { deriveProtectedExternalApprovalEvidenceWorkflow } from "../../../../lib/protectedExternalApprovalEvidence";
import { deriveProtectedFinanceMethodologyWorkflow } from "../../../../lib/protectedFinanceMethodology";
import { deriveProtectedNamedReviewerSignoffWorkflow } from "../../../../lib/protectedNamedReviewerSignoffs";
import {
  deriveProtectedReleaseAuthorityAttestationWorkflow
} from "../../../../lib/protectedReleaseAuthorityAttestations";
import { deriveProtectedReleaseDecisionWorkflow } from "../../../../lib/protectedReleaseDecisionWorkflow";
import {
  getAccessiblePilotWorkspace,
  getAuthenticatedGovernanceContext,
  listProtectedBoardScorecards,
  listProtectedDistributionLockboxes,
  listProtectedEvidenceRoomAccessLogReconciliations,
  listProtectedEvidenceRoomRecipientAttestations,
  listProtectedExternalApprovalEvidenceReferences,
  listProtectedFinanceMethodologyGates,
  listProtectedNamedReviewerSignoffs,
  listProtectedReleaseAuthorityAttestations,
  listProtectedReleaseDecisions,
  recordProtectedEvidenceRoomAccessLogReconciliation
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

function statusForAccessLogReconciliationError(message: string) {
  if (
    message.includes("role-denied") ||
    message.includes("authentication-required") ||
    message.includes("aal2-session-required") ||
    message.includes("governance-aal2-session-required") ||
    message.includes("server-authorization-required")
  ) {
    return 403;
  }

  if (message.includes("workspace") || message.includes("recipient")) return 404;
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
  const [
    scorecardsResult,
    financeRecordsResult,
    externalRecordsResult,
    releaseDecisionRecordsResult,
    signoffRecordsResult,
    lockboxRecordsResult,
    authorityRecordsResult,
    recipientRecordsResult,
    accessLogRecordsResult
  ] = await Promise.all([
    listProtectedBoardScorecards(context.client, workspaceId),
    listProtectedFinanceMethodologyGates(context.client, workspaceId),
    listProtectedExternalApprovalEvidenceReferences(context.client, workspaceId),
    listProtectedReleaseDecisions(context.client, workspaceId),
    listProtectedNamedReviewerSignoffs(context.client, workspaceId),
    listProtectedDistributionLockboxes(context.client, workspaceId),
    listProtectedReleaseAuthorityAttestations(context.client, workspaceId),
    listProtectedEvidenceRoomRecipientAttestations(context.client, workspaceId),
    listProtectedEvidenceRoomAccessLogReconciliations(context.client, workspaceId)
  ]);
  const unavailableSections = [
    scorecardsResult.error
      ? "Protected board scorecards could not be retrieved for access-log reconciliation context."
      : "",
    financeRecordsResult.error
      ? "Protected finance methodology history could not be retrieved for access-log reconciliation context."
      : "",
    externalRecordsResult.error
      ? "Protected external approval evidence references could not be retrieved for access-log reconciliation context."
      : "",
    releaseDecisionRecordsResult.error
      ? "Protected release decision history could not be retrieved for access-log reconciliation context."
      : "",
    signoffRecordsResult.error
      ? "Protected named reviewer sign-off history could not be retrieved for access-log reconciliation context."
      : "",
    lockboxRecordsResult.error
      ? "Protected distribution lockbox history could not be retrieved for access-log reconciliation context."
      : "",
    authorityRecordsResult.error
      ? "Protected release authority attestations could not be retrieved for access-log reconciliation context."
      : "",
    recipientRecordsResult.error
      ? "Protected evidence-room recipient attestations could not be retrieved; access-log reconciliation remains blocked."
      : "",
    accessLogRecordsResult.error
      ? "Protected evidence-room access-log reconciliation history could not be retrieved."
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
    unavailableSections: unavailableSections.filter((section) => section.includes("release decision"))
  });
  const signoffWorkflow = deriveProtectedNamedReviewerSignoffWorkflow({
    records: signoffRecordsResult.error ? [] : signoffRecordsResult.records,
    releaseWorkflow,
    unavailableSections: unavailableSections.filter((section) => section.includes("sign-off"))
  });
  const lockboxWorkflow = deriveProtectedDistributionLockboxWorkflow({
    records: lockboxRecordsResult.error ? [] : lockboxRecordsResult.records,
    signoffWorkflow,
    unavailableSections: unavailableSections.filter((section) => section.includes("lockbox"))
  });
  const authorityWorkflow = deriveProtectedReleaseAuthorityAttestationWorkflow({
    lockboxWorkflow,
    records: authorityRecordsResult.error ? [] : authorityRecordsResult.records,
    unavailableSections: unavailableSections.filter((section) => section.includes("authority"))
  });
  const recipientWorkflow = deriveProtectedEvidenceRoomRecipientAttestationWorkflow({
    records: recipientRecordsResult.error ? [] : recipientRecordsResult.records,
    releaseAuthorityWorkflow: authorityWorkflow,
    unavailableSections: unavailableSections.filter((section) => section.includes("recipient"))
  });
  const workflow = deriveProtectedEvidenceRoomAccessLogReconciliationWorkflow({
    records: accessLogRecordsResult.error ? [] : accessLogRecordsResult.records,
    recipientWorkflow,
    unavailableSections
  });

  return {
    accessLogRecords: accessLogRecordsResult.error ? [] : accessLogRecordsResult.records,
    authorityWorkflow,
    externalWorkflow,
    financeWorkflow,
    lockboxWorkflow,
    recipientWorkflow,
    releaseWorkflow,
    signoffWorkflow,
    workflow
  };
}

export async function GET(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "protected-evidence-room-access-log-reconciliation-read",
    limit: 60,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Protected evidence-room access-log reconciliation reads are temporarily rate limited."
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
      status: protectedEvidenceRoomAccessLogReconciliationStatus,
      workspace: authorization.workspace,
      records: result.accessLogRecords,
      financeWorkflow: result.financeWorkflow,
      externalWorkflow: result.externalWorkflow,
      releaseWorkflow: result.releaseWorkflow,
      signoffWorkflow: result.signoffWorkflow,
      lockboxWorkflow: result.lockboxWorkflow,
      authorityWorkflow: result.authorityWorkflow,
      recipientWorkflow: result.recipientWorkflow,
      workflow: result.workflow,
      boundary: protectedEvidenceRoomAccessLogBoundary
    },
    { headers }
  );
}

export async function POST(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "protected-evidence-room-access-log-reconciliation-record",
    limit: 10,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Protected evidence-room access-log reconciliation writes are temporarily rate limited."
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
          message: "Protected evidence-room access-log reconciliation requires application/json."
        },
        boundary: protectedEvidenceRoomAccessLogBoundary
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
          message: "Evidence-room access-log reconciliation accepts bounded no-PHI metadata only."
        },
        boundary: protectedEvidenceRoomAccessLogBoundary
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
        boundary: protectedEvidenceRoomAccessLogBoundary
      },
      { status: 400, headers }
    );
  }

  const validation = validateProtectedEvidenceRoomAccessLogReconciliationInput(payload);

  if (!validation.ok) {
    return NextResponse.json(
      {
        service: "scrimed-protected-evidence-room-access-log-reconciliation",
        status: "validation-failed",
        errors: validation.errors,
        boundary: protectedEvidenceRoomAccessLogBoundary
      },
      { status: 400, headers }
    );
  }

  const result = await recordProtectedEvidenceRoomAccessLogReconciliation(
    authorization.context.client,
    authorization.workspace.slug,
    validation.input
  );

  if (result.error || !result.reconciliationId) {
    const message = result.error?.message ?? "";

    return NextResponse.json(
      {
        error: {
          code: "protected-evidence-room-access-log-reconciliation-record-failed",
          message:
            "The protected evidence-room access-log reconciliation was not recorded because the tenant-scoped governance write failed."
        },
        boundary: protectedEvidenceRoomAccessLogBoundary
      },
      { status: statusForAccessLogReconciliationError(message), headers }
    );
  }

  const workflowResult = await buildWorkflow(authorization.context, authorization.workspace.id);

  return NextResponse.json(
    {
      service: workflowResult.workflow.service,
      status: protectedEvidenceRoomAccessLogReconciliationStatus,
      workspace: authorization.workspace,
      reconciliationId: result.reconciliationId,
      records: workflowResult.accessLogRecords,
      financeWorkflow: workflowResult.financeWorkflow,
      externalWorkflow: workflowResult.externalWorkflow,
      releaseWorkflow: workflowResult.releaseWorkflow,
      signoffWorkflow: workflowResult.signoffWorkflow,
      lockboxWorkflow: workflowResult.lockboxWorkflow,
      authorityWorkflow: workflowResult.authorityWorkflow,
      recipientWorkflow: workflowResult.recipientWorkflow,
      workflow: workflowResult.workflow,
      boundary: protectedEvidenceRoomAccessLogBoundary
    },
    {
      status: 201,
      headers: {
        ...headers,
        "X-SCRIMED-Evidence-Room-Access-Log-Reconciliation-Persisted": "true",
        "X-SCRIMED-Export-State": "export-disabled"
      }
    }
  );
}
