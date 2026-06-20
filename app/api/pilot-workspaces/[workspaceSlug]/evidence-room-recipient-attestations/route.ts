import { NextResponse } from "next/server";
import { deriveProtectedDistributionLockboxWorkflow } from "../../../../lib/protectedDistributionLockbox";
import {
  deriveProtectedEvidenceRoomRecipientAttestationWorkflow,
  protectedEvidenceRoomRecipientAttestationStatus,
  protectedEvidenceRoomRecipientBoundary,
  validateProtectedEvidenceRoomRecipientAttestationInput
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
  listProtectedEvidenceRoomRecipientAttestations,
  listProtectedExternalApprovalEvidenceReferences,
  listProtectedFinanceMethodologyGates,
  listProtectedNamedReviewerSignoffs,
  listProtectedReleaseAuthorityAttestations,
  listProtectedReleaseDecisions,
  recordProtectedEvidenceRoomRecipientAttestation
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

function statusForRecipientAttestationError(message: string) {
  if (
    message.includes("role-denied") ||
    message.includes("authentication-required") ||
    message.includes("aal2-session-required") ||
    message.includes("governance-aal2-session-required") ||
    message.includes("server-authorization-required")
  ) {
    return 403;
  }

  if (message.includes("workspace") || message.includes("authority")) return 404;
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
    recipientRecordsResult
  ] = await Promise.all([
    listProtectedBoardScorecards(context.client, workspaceId),
    listProtectedFinanceMethodologyGates(context.client, workspaceId),
    listProtectedExternalApprovalEvidenceReferences(context.client, workspaceId),
    listProtectedReleaseDecisions(context.client, workspaceId),
    listProtectedNamedReviewerSignoffs(context.client, workspaceId),
    listProtectedDistributionLockboxes(context.client, workspaceId),
    listProtectedReleaseAuthorityAttestations(context.client, workspaceId),
    listProtectedEvidenceRoomRecipientAttestations(context.client, workspaceId)
  ]);
  const unavailableSections = [
    scorecardsResult.error
      ? "Protected board scorecards could not be retrieved for evidence-room recipient context."
      : "",
    financeRecordsResult.error
      ? "Protected finance methodology history could not be retrieved for evidence-room recipient context."
      : "",
    externalRecordsResult.error
      ? "Protected external approval evidence references could not be retrieved for evidence-room recipient context."
      : "",
    releaseDecisionRecordsResult.error
      ? "Protected release decision history could not be retrieved for evidence-room recipient context."
      : "",
    signoffRecordsResult.error
      ? "Protected named reviewer sign-off history could not be retrieved for evidence-room recipient context."
      : "",
    lockboxRecordsResult.error
      ? "Protected distribution lockbox history could not be retrieved for evidence-room recipient context."
      : "",
    authorityRecordsResult.error
      ? "Protected release authority attestations could not be retrieved; recipient attestations remain blocked."
      : "",
    recipientRecordsResult.error
      ? "Protected evidence-room recipient attestation history could not be retrieved."
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
  const workflow = deriveProtectedEvidenceRoomRecipientAttestationWorkflow({
    records: recipientRecordsResult.error ? [] : recipientRecordsResult.records,
    releaseAuthorityWorkflow: authorityWorkflow,
    unavailableSections
  });

  return {
    authorityWorkflow,
    externalWorkflow,
    financeWorkflow,
    lockboxWorkflow,
    records: recipientRecordsResult.error ? [] : recipientRecordsResult.records,
    releaseWorkflow,
    signoffWorkflow,
    workflow
  };
}

export async function GET(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "protected-evidence-room-recipient-attestations-read",
    limit: 60,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Protected evidence-room recipient attestation reads are temporarily rate limited."
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
      status: protectedEvidenceRoomRecipientAttestationStatus,
      workspace: authorization.workspace,
      records: result.records,
      financeWorkflow: result.financeWorkflow,
      externalWorkflow: result.externalWorkflow,
      releaseWorkflow: result.releaseWorkflow,
      signoffWorkflow: result.signoffWorkflow,
      lockboxWorkflow: result.lockboxWorkflow,
      authorityWorkflow: result.authorityWorkflow,
      workflow: result.workflow,
      boundary: protectedEvidenceRoomRecipientBoundary
    },
    { headers }
  );
}

export async function POST(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "protected-evidence-room-recipient-attestations-record",
    limit: 10,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Protected evidence-room recipient attestation writes are temporarily rate limited."
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
          message: "Protected evidence-room recipient attestations require application/json."
        },
        boundary: protectedEvidenceRoomRecipientBoundary
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
          message: "Evidence-room recipient attestations accept bounded no-PHI metadata only."
        },
        boundary: protectedEvidenceRoomRecipientBoundary
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
        boundary: protectedEvidenceRoomRecipientBoundary
      },
      { status: 400, headers }
    );
  }

  const validation = validateProtectedEvidenceRoomRecipientAttestationInput(payload);

  if (!validation.ok) {
    return NextResponse.json(
      {
        service: "scrimed-protected-evidence-room-recipient-attestations",
        status: "validation-failed",
        errors: validation.errors,
        boundary: protectedEvidenceRoomRecipientBoundary
      },
      { status: 400, headers }
    );
  }

  const result = await recordProtectedEvidenceRoomRecipientAttestation(
    authorization.context.client,
    authorization.workspace.slug,
    validation.input
  );

  if (result.error || !result.attestationId) {
    const message = result.error?.message ?? "";

    return NextResponse.json(
      {
        error: {
          code: "protected-evidence-room-recipient-attestation-record-failed",
          message:
            "The protected evidence-room recipient attestation was not recorded because the tenant-scoped governance write failed."
        },
        boundary: protectedEvidenceRoomRecipientBoundary
      },
      { status: statusForRecipientAttestationError(message), headers }
    );
  }

  const workflowResult = await buildWorkflow(authorization.context, authorization.workspace.id);

  return NextResponse.json(
    {
      service: workflowResult.workflow.service,
      status: protectedEvidenceRoomRecipientAttestationStatus,
      workspace: authorization.workspace,
      attestationId: result.attestationId,
      records: workflowResult.records,
      financeWorkflow: workflowResult.financeWorkflow,
      externalWorkflow: workflowResult.externalWorkflow,
      releaseWorkflow: workflowResult.releaseWorkflow,
      signoffWorkflow: workflowResult.signoffWorkflow,
      lockboxWorkflow: workflowResult.lockboxWorkflow,
      authorityWorkflow: workflowResult.authorityWorkflow,
      workflow: workflowResult.workflow,
      boundary: protectedEvidenceRoomRecipientBoundary
    },
    {
      status: 201,
      headers: {
        ...headers,
        "X-SCRIMED-Evidence-Room-Recipient-Attestation-Persisted": "true",
        "X-SCRIMED-Export-State": "export-disabled"
      }
    }
  );
}
