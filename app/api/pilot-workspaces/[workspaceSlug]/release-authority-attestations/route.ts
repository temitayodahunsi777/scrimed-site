import { NextResponse } from "next/server";
import { deriveProtectedExternalApprovalEvidenceWorkflow } from "../../../../lib/protectedExternalApprovalEvidence";
import { deriveProtectedFinanceMethodologyWorkflow } from "../../../../lib/protectedFinanceMethodology";
import { deriveProtectedDistributionLockboxWorkflow } from "../../../../lib/protectedDistributionLockbox";
import {
  protectedReleaseAuthorityAttestationBoundary,
  protectedReleaseAuthorityAttestationStatus,
  deriveProtectedReleaseAuthorityAttestationWorkflow,
  validateProtectedReleaseAuthorityAttestationInput
} from "../../../../lib/protectedReleaseAuthorityAttestations";
import { deriveProtectedReleaseDecisionWorkflow } from "../../../../lib/protectedReleaseDecisionWorkflow";
import { deriveProtectedNamedReviewerSignoffWorkflow } from "../../../../lib/protectedNamedReviewerSignoffs";
import {
  getAccessiblePilotWorkspace,
  getAuthenticatedGovernanceContext,
  listProtectedBoardScorecards,
  listProtectedDistributionLockboxes,
  listProtectedExternalApprovalEvidenceReferences,
  listProtectedFinanceMethodologyGates,
  listProtectedNamedReviewerSignoffs,
  listProtectedReleaseAuthorityAttestations,
  listProtectedReleaseDecisions,
  recordProtectedReleaseAuthorityAttestation
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

function statusForReleaseAuthorityError(message: string) {
  if (
    message.includes("role-denied") ||
    message.includes("authentication-required") ||
    message.includes("aal2-session-required") ||
    message.includes("governance-aal2-session-required") ||
    message.includes("server-authorization-required")
  ) {
    return 403;
  }

  if (message.includes("workspace") || message.includes("lockbox")) return 404;
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
    attestationRecordsResult
  ] = await Promise.all([
    listProtectedBoardScorecards(context.client, workspaceId),
    listProtectedFinanceMethodologyGates(context.client, workspaceId),
    listProtectedExternalApprovalEvidenceReferences(context.client, workspaceId),
    listProtectedReleaseDecisions(context.client, workspaceId),
    listProtectedNamedReviewerSignoffs(context.client, workspaceId),
    listProtectedDistributionLockboxes(context.client, workspaceId),
    listProtectedReleaseAuthorityAttestations(context.client, workspaceId)
  ]);
  const unavailableSections = [
    scorecardsResult.error
      ? "Protected board scorecards could not be retrieved for release authority context."
      : "",
    financeRecordsResult.error
      ? "Protected finance methodology history could not be retrieved for release authority context."
      : "",
    externalRecordsResult.error
      ? "Protected external approval evidence references could not be retrieved for release authority context."
      : "",
    releaseDecisionRecordsResult.error
      ? "Protected release decision history could not be retrieved for release authority context."
      : "",
    signoffRecordsResult.error
      ? "Protected named reviewer sign-off history could not be retrieved for release authority context."
      : "",
    lockboxRecordsResult.error
      ? "Protected distribution lockbox history could not be retrieved; release authority remains blocked."
      : "",
    attestationRecordsResult.error
      ? "Protected release authority attestation history could not be retrieved."
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
  const workflow = deriveProtectedReleaseAuthorityAttestationWorkflow({
    lockboxWorkflow,
    records: attestationRecordsResult.error ? [] : attestationRecordsResult.records,
    unavailableSections
  });

  return {
    financeWorkflow,
    externalWorkflow,
    releaseWorkflow,
    signoffWorkflow,
    lockboxWorkflow,
    records: attestationRecordsResult.error ? [] : attestationRecordsResult.records,
    workflow
  };
}

export async function GET(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "protected-release-authority-attestations-read",
    limit: 60,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Protected release authority attestation reads are temporarily rate limited."
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
      status: protectedReleaseAuthorityAttestationStatus,
      workspace: authorization.workspace,
      records: result.records,
      financeWorkflow: result.financeWorkflow,
      externalWorkflow: result.externalWorkflow,
      releaseWorkflow: result.releaseWorkflow,
      signoffWorkflow: result.signoffWorkflow,
      lockboxWorkflow: result.lockboxWorkflow,
      workflow: result.workflow,
      boundary: protectedReleaseAuthorityAttestationBoundary
    },
    { headers }
  );
}

export async function POST(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "protected-release-authority-attestations-record",
    limit: 10,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Protected release authority attestation writes are temporarily rate limited."
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
          message: "Protected release authority attestations require application/json."
        },
        boundary: protectedReleaseAuthorityAttestationBoundary
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
          message: "Release authority attestations accept bounded no-PHI metadata only."
        },
        boundary: protectedReleaseAuthorityAttestationBoundary
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
        boundary: protectedReleaseAuthorityAttestationBoundary
      },
      { status: 400, headers }
    );
  }

  const validation = validateProtectedReleaseAuthorityAttestationInput(payload);

  if (!validation.ok) {
    return NextResponse.json(
      {
        service: "scrimed-protected-release-authority-attestations",
        status: "validation-failed",
        errors: validation.errors,
        boundary: protectedReleaseAuthorityAttestationBoundary
      },
      { status: 400, headers }
    );
  }

  const result = await recordProtectedReleaseAuthorityAttestation(
    authorization.context.client,
    authorization.workspace.slug,
    validation.input
  );

  if (result.error || !result.attestationId) {
    const message = result.error?.message ?? "";

    return NextResponse.json(
      {
        error: {
          code: "protected-release-authority-attestation-record-failed",
          message:
            "The protected release authority attestation was not recorded because the tenant-scoped governance write failed."
        },
        boundary: protectedReleaseAuthorityAttestationBoundary
      },
      { status: statusForReleaseAuthorityError(message), headers }
    );
  }

  const workflowResult = await buildWorkflow(authorization.context, authorization.workspace.id);

  return NextResponse.json(
    {
      service: workflowResult.workflow.service,
      status: protectedReleaseAuthorityAttestationStatus,
      workspace: authorization.workspace,
      attestationId: result.attestationId,
      records: workflowResult.records,
      financeWorkflow: workflowResult.financeWorkflow,
      externalWorkflow: workflowResult.externalWorkflow,
      releaseWorkflow: workflowResult.releaseWorkflow,
      signoffWorkflow: workflowResult.signoffWorkflow,
      lockboxWorkflow: workflowResult.lockboxWorkflow,
      workflow: workflowResult.workflow,
      boundary: protectedReleaseAuthorityAttestationBoundary
    },
    {
      status: 201,
      headers: {
        ...headers,
        "X-SCRIMED-Release-Authority-Attestation-Persisted": "true",
        "X-SCRIMED-Release-State": "release-disabled"
      }
    }
  );
}
