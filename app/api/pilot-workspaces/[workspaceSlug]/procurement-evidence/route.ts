import { NextResponse } from "next/server";
import {
  deriveProtectedProcurementEvidenceRegistryWorkflow,
  protectedProcurementEvidenceRegistryAuthority,
  protectedProcurementEvidenceRegistryBoundary,
  protectedProcurementEvidenceRegistryStatus,
  protectedProcurementEvidenceRegistryStorageAuthority,
  validateProtectedProcurementEvidenceRegistryInput
} from "../../../../lib/protectedProcurementEvidenceRegistry";
import {
  getAccessiblePilotWorkspace,
  getAuthenticatedGovernanceContext,
  listProtectedProcurementEvidenceRegistryRecords,
  listProtectedProviderSecurityReviews,
  recordProtectedProcurementEvidenceRegistry
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

function statusForProcurementEvidenceError(message: string) {
  if (
    message.includes("role-denied") ||
    message.includes("authentication-required") ||
    message.includes("aal2-session-required") ||
    message.includes("governance-aal2-session-required") ||
    message.includes("server-authorization-required")
  ) {
    return 403;
  }

  if (message.includes("workspace") || message.includes("provider-security-review")) return 404;
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
  const [providerSecurityReviewRecordsResult, procurementRecordsResult] = await Promise.all([
    listProtectedProviderSecurityReviews(context.client, workspaceId),
    listProtectedProcurementEvidenceRegistryRecords(context.client, workspaceId)
  ]);
  const unavailableSections = [
    providerSecurityReviewRecordsResult.error
      ? "Protected provider security review history could not be retrieved; procurement evidence routing remains blocked."
      : "",
    procurementRecordsResult.error
      ? "Protected procurement evidence registry history could not be retrieved."
      : ""
  ].filter(Boolean);
  const workflow = deriveProtectedProcurementEvidenceRegistryWorkflow({
    providerSecurityReviewRecords: providerSecurityReviewRecordsResult.error
      ? []
      : providerSecurityReviewRecordsResult.records,
    records: procurementRecordsResult.error ? [] : procurementRecordsResult.records,
    unavailableSections
  });

  return {
    providerSecurityReviewRecords: providerSecurityReviewRecordsResult.error
      ? []
      : providerSecurityReviewRecordsResult.records,
    procurementRecords: procurementRecordsResult.error ? [] : procurementRecordsResult.records,
    workflow
  };
}

export async function GET(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "protected-procurement-evidence-read",
    limit: 60,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Protected procurement evidence registry reads are temporarily rate limited."
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
      status: protectedProcurementEvidenceRegistryStatus,
      workspace: authorization.workspace,
      records: result.procurementRecords,
      providerSecurityReviewRecords: result.providerSecurityReviewRecords,
      workflow: result.workflow,
      boundary: protectedProcurementEvidenceRegistryBoundary
    },
    { headers }
  );
}

export async function POST(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "protected-procurement-evidence-record",
    limit: 10,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Protected procurement evidence registry writes are temporarily rate limited."
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
          message: "Protected procurement evidence registry entries require application/json."
        },
        boundary: protectedProcurementEvidenceRegistryBoundary
      },
      { status: 415, headers }
    );
  }

  const rawBody = await request.text();

  if (rawBody.length > 6200) {
    return NextResponse.json(
      {
        error: {
          code: "payload-too-large",
          message: "Procurement evidence registry accepts bounded metadata only."
        },
        boundary: protectedProcurementEvidenceRegistryBoundary
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
        boundary: protectedProcurementEvidenceRegistryBoundary
      },
      { status: 400, headers }
    );
  }

  const validation = validateProtectedProcurementEvidenceRegistryInput(payload);

  if (!validation.ok) {
    return NextResponse.json(
      {
        service: "scrimed-protected-procurement-evidence-registry",
        status: "validation-failed",
        errors: validation.errors,
        boundary: protectedProcurementEvidenceRegistryBoundary
      },
      { status: 400, headers }
    );
  }

  const result = await recordProtectedProcurementEvidenceRegistry(
    authorization.context.client,
    authorization.workspace.slug,
    validation.input
  );

  if (result.error || !result.registryId) {
    const message = result.error?.message ?? "";

    return NextResponse.json(
      {
        error: {
          code: "protected-procurement-evidence-record-failed",
          message:
            "The protected procurement evidence registry entry was not recorded because the tenant-scoped governance write failed."
        },
        boundary: protectedProcurementEvidenceRegistryBoundary
      },
      { status: statusForProcurementEvidenceError(message), headers }
    );
  }

  const workflowResult = await buildWorkflow(authorization.context, authorization.workspace.id);

  return NextResponse.json(
    {
      service: workflowResult.workflow.service,
      status: protectedProcurementEvidenceRegistryStatus,
      workspace: authorization.workspace,
      registryId: result.registryId,
      records: workflowResult.procurementRecords,
      providerSecurityReviewRecords: workflowResult.providerSecurityReviewRecords,
      workflow: workflowResult.workflow,
      boundary: protectedProcurementEvidenceRegistryBoundary
    },
    {
      status: 201,
      headers: {
        ...headers,
        "X-SCRIMED-Procurement-Evidence-Persisted": "true",
        "X-SCRIMED-Procurement-Evidence-Authority":
          protectedProcurementEvidenceRegistryAuthority,
        "X-SCRIMED-Storage-Authority": protectedProcurementEvidenceRegistryStorageAuthority,
        "X-SCRIMED-External-Distribution-State": "distribution-disabled",
        "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care"
      }
    }
  );
}
