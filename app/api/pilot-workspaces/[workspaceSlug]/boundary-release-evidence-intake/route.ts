import { NextResponse } from "next/server";
import {
  boundaryReleaseEvidenceIntakeBoundary,
  boundaryReleaseEvidenceIntakeReleaseAuthority,
  boundaryReleaseEvidenceIntakeStatus,
  getBoundaryReleaseEvidenceIntakeSummary,
  validateBoundaryReleaseEvidenceIntakeInput
} from "../../../../lib/boundaryReleaseEvidenceIntake";
import {
  getAccessiblePilotWorkspace,
  getAuthenticatedGovernanceContext,
  listProtectedExternalApprovalEvidenceReferences,
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

const intakeHeaders = {
  ...protectedPilotNoStoreHeaders,
  "X-SCRIMED-Boundary-Release-Evidence-Intake": "aal2-metadata-only",
  "X-SCRIMED-Data-Boundary": "synthetic-only",
  "X-SCRIMED-Storage-Authority": "no-raw-evidence-storage",
  "X-SCRIMED-Release-Authority": boundaryReleaseEvidenceIntakeReleaseAuthority,
  "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
  "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
  "X-SCRIMED-Payer-Submission-Authority": "not-authorized",
  "X-SCRIMED-EHR-Writeback-Authority": "not-authorized",
  "X-SCRIMED-Production-Connector-Authority": "not-production-connector-approved",
  "X-SCRIMED-Certification-Authority": "not-certified-readiness-only",
  "X-SCRIMED-Customer-Go-Live-Authority": "not-authorized"
};

function statusForBoundaryReleaseEvidenceIntakeError(message: string) {
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
        { status: context.status, headers: intakeHeaders }
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
        { status: 404, headers: intakeHeaders }
      )
    };
  }

  return {
    context,
    workspace: workspaceResult.workspace
  };
}

export async function GET(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "protected-boundary-release-evidence-intake-read",
    limit: 60,
    windowSeconds: 600
  });
  const headers = { ...intakeHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Protected boundary release evidence intake reads are temporarily rate limited."
        },
        boundary: boundaryReleaseEvidenceIntakeBoundary
      },
      { status: 429, headers }
    );
  }

  const { workspaceSlug } = await params;
  const authorization = await authorizeWorkspace(request, workspaceSlug);

  if ("response" in authorization) {
    return authorization.response;
  }

  const recordsResult = await listProtectedExternalApprovalEvidenceReferences(
    authorization.context.client,
    authorization.workspace.id
  );
  const summary = getBoundaryReleaseEvidenceIntakeSummary(recordsResult.error ? [] : recordsResult.records);

  return NextResponse.json(
    {
      ...summary,
      workspace: authorization.workspace,
      externalReferenceRecords: recordsResult.error ? [] : recordsResult.records,
      unavailableSections: recordsResult.error
        ? ["Protected external approval evidence reference history could not be retrieved; intake remains blocked."]
        : []
    },
    { headers }
  );
}

export async function POST(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "protected-boundary-release-evidence-intake-record",
    limit: 12,
    windowSeconds: 600
  });
  const headers = { ...intakeHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Protected boundary release evidence intake writes are temporarily rate limited."
        },
        boundary: boundaryReleaseEvidenceIntakeBoundary
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
          message: "Protected boundary release evidence intake requires application/json."
        },
        boundary: boundaryReleaseEvidenceIntakeBoundary
      },
      { status: 415, headers }
    );
  }

  const rawBody = await request.text();

  if (rawBody.length > 3600) {
    return NextResponse.json(
      {
        error: {
          code: "payload-too-large",
          message: "Boundary release evidence intake accepts bounded no-PHI metadata only."
        },
        boundary: boundaryReleaseEvidenceIntakeBoundary
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
        boundary: boundaryReleaseEvidenceIntakeBoundary
      },
      { status: 400, headers }
    );
  }

  const validation = validateBoundaryReleaseEvidenceIntakeInput(payload);

  if (!validation.ok) {
    return NextResponse.json(
      {
        service: "scrimed-protected-boundary-release-evidence-intake",
        status: "validation-failed",
        errors: validation.errors,
        boundary: boundaryReleaseEvidenceIntakeBoundary
      },
      { status: 400, headers }
    );
  }

  const result = await recordProtectedExternalApprovalEvidenceReference(
    authorization.context.client,
    authorization.workspace.slug,
    validation.externalInput
  );

  if (result.error || !result.referenceId) {
    const message = result.error?.message ?? "";

    return NextResponse.json(
      {
        error: {
          code: "protected-boundary-release-evidence-intake-record-failed",
          message:
            "The boundary release evidence reference was not recorded because the tenant-scoped governance write failed."
        },
        boundary: boundaryReleaseEvidenceIntakeBoundary
      },
      { status: statusForBoundaryReleaseEvidenceIntakeError(message), headers }
    );
  }

  const recordsResult = await listProtectedExternalApprovalEvidenceReferences(
    authorization.context.client,
    authorization.workspace.id
  );
  const summary = getBoundaryReleaseEvidenceIntakeSummary(recordsResult.error ? [] : recordsResult.records);

  return NextResponse.json(
    {
      ...summary,
      service: "scrimed-protected-boundary-release-evidence-intake",
      status: boundaryReleaseEvidenceIntakeStatus,
      workspace: authorization.workspace,
      referenceId: result.referenceId,
      intake: validation.intake,
      externalInput: {
        ...validation.externalInput,
        reviewNote: "[redacted-metadata-only-review-note]"
      },
      externalReferenceRecords: recordsResult.error ? [] : recordsResult.records,
      unavailableSections: recordsResult.error
        ? ["Protected external approval evidence reference history could not be retrieved after intake."]
        : [],
      boundary: boundaryReleaseEvidenceIntakeBoundary
    },
    {
      status: 201,
      headers: {
        ...headers,
        "X-SCRIMED-Boundary-Release-Evidence-Persisted": "true"
      }
    }
  );
}
