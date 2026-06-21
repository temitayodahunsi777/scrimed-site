import { NextResponse } from "next/server";
import {
  deriveProtectedAuthorityArtifactReferenceWorkflow,
  protectedAuthorityArtifactReferenceAuthority,
  protectedAuthorityArtifactReferenceBoundary,
  protectedAuthorityArtifactReferenceStatus,
  protectedAuthorityArtifactReferenceStorageAuthority,
  validateProtectedAuthorityArtifactReferenceInput
} from "../../../../lib/protectedAuthorityArtifactReferences";
import {
  deriveProtectedClinicalAuthorityArtifactIntakeChecklist
} from "../../../../lib/protectedClinicalAuthorityArtifactIntake";
import {
  deriveProtectedClinicalAuthorityOwnerMatrix
} from "../../../../lib/protectedClinicalAuthorityOwnerMatrix";
import {
  getAccessiblePilotWorkspace,
  getAuthenticatedGovernanceContext,
  listProtectedAuthorityArtifactReferences,
  recordProtectedAuthorityArtifactReference
} from "../../../../lib/protectedPilotStore";
import {
  protectedPilotBoundary,
  protectedPilotNoStoreHeaders
} from "../../../../lib/protectedPilotWorkspace";
import { enforceRequestRateLimit, rateLimitHeaders } from "../../../../lib/requestRateLimit";
import { loadProtectedClinicalAuthorityEvidenceRoom } from "../clinical-authority-evidence-room/evidenceRoomData";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ workspaceSlug: string }>;
};

function statusForAuthorityArtifactReferenceError(message: string) {
  if (
    message.includes("role-denied") ||
    message.includes("authentication-required") ||
    message.includes("aal2-session-required") ||
    message.includes("governance-aal2-session-required") ||
    message.includes("server-authorization-required")
  ) {
    return 403;
  }

  if (message.includes("workspace")) return 404;
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

async function buildAuthorityArtifactReferenceWorkflow(
  context: Awaited<ReturnType<typeof getAuthenticatedGovernanceContext>> & { ok: true },
  workspace: NonNullable<Awaited<ReturnType<typeof getAccessiblePilotWorkspace>>["workspace"]>
) {
  const [{ room }, referenceResult] = await Promise.all([
    loadProtectedClinicalAuthorityEvidenceRoom(context.client, workspace),
    listProtectedAuthorityArtifactReferences(context.client, workspace.id)
  ]);
  const matrix = deriveProtectedClinicalAuthorityOwnerMatrix({ room, workspace });
  const checklist = deriveProtectedClinicalAuthorityArtifactIntakeChecklist({
    matrix,
    workspace
  });
  const unavailableSections = [
    referenceResult.error
      ? "Protected authority artifact reference history could not be retrieved; metadata capture remains blocked."
      : ""
  ].filter(Boolean);
  const workflow = deriveProtectedAuthorityArtifactReferenceWorkflow({
    checklist,
    records: referenceResult.error ? [] : referenceResult.records,
    unavailableSections,
    workspace
  });

  return {
    checklist,
    evidenceRoom: room,
    matrix,
    records: referenceResult.error ? [] : referenceResult.records,
    workflow
  };
}

export async function GET(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "protected-authority-artifact-references-read",
    limit: 60,
    windowSeconds: 600
  });
  const headers = {
    ...protectedPilotNoStoreHeaders,
    ...rateLimitHeaders(rateLimit),
    "X-SCRIMED-Authority-Artifact-References":
      protectedAuthorityArtifactReferenceAuthority,
    "X-SCRIMED-Storage-Authority": protectedAuthorityArtifactReferenceStorageAuthority,
    "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care"
  };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Protected Authority Artifact Reference reads are temporarily rate limited."
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

  const result = await buildAuthorityArtifactReferenceWorkflow(
    authorization.context,
    authorization.workspace
  );

  return NextResponse.json(
    {
      service: result.workflow.service,
      status: protectedAuthorityArtifactReferenceStatus,
      workspace: authorization.workspace,
      records: result.records,
      workflow: result.workflow,
      checklist: result.checklist,
      matrix: result.matrix,
      evidenceRoom: result.evidenceRoom,
      boundary: protectedAuthorityArtifactReferenceBoundary
    },
    { headers }
  );
}

export async function POST(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "protected-authority-artifact-references-record",
    limit: 10,
    windowSeconds: 600
  });
  const headers = {
    ...protectedPilotNoStoreHeaders,
    ...rateLimitHeaders(rateLimit),
    "X-SCRIMED-Authority-Artifact-References":
      protectedAuthorityArtifactReferenceAuthority,
    "X-SCRIMED-Storage-Authority": protectedAuthorityArtifactReferenceStorageAuthority,
    "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care"
  };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Protected Authority Artifact Reference writes are temporarily rate limited."
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
          message: "Protected Authority Artifact References require application/json."
        },
        boundary: protectedAuthorityArtifactReferenceBoundary
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
          message: "Authority artifact reference capture accepts bounded metadata only."
        },
        boundary: protectedAuthorityArtifactReferenceBoundary
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
        boundary: protectedAuthorityArtifactReferenceBoundary
      },
      { status: 400, headers }
    );
  }

  const preflight = await buildAuthorityArtifactReferenceWorkflow(
    authorization.context,
    authorization.workspace
  );
  const validation = validateProtectedAuthorityArtifactReferenceInput(
    payload,
    preflight.checklist
  );

  if (!validation.ok) {
    return NextResponse.json(
      {
        service: "scrimed-protected-authority-artifact-references",
        status: "validation-failed",
        errors: validation.errors,
        boundary: protectedAuthorityArtifactReferenceBoundary
      },
      { status: 400, headers }
    );
  }

  const result = await recordProtectedAuthorityArtifactReference(
    authorization.context.client,
    authorization.workspace.slug,
    validation.input
  );

  if (result.error || !result.referenceId) {
    const message = result.error?.message ?? "";

    return NextResponse.json(
      {
        error: {
          code: "protected-authority-artifact-reference-record-failed",
          message:
            "The protected authority artifact reference was not recorded because the tenant-scoped governance write failed."
        },
        boundary: protectedAuthorityArtifactReferenceBoundary
      },
      { status: statusForAuthorityArtifactReferenceError(message), headers }
    );
  }

  const workflowResult = await buildAuthorityArtifactReferenceWorkflow(
    authorization.context,
    authorization.workspace
  );

  return NextResponse.json(
    {
      service: workflowResult.workflow.service,
      status: protectedAuthorityArtifactReferenceStatus,
      workspace: authorization.workspace,
      referenceId: result.referenceId,
      records: workflowResult.records,
      workflow: workflowResult.workflow,
      checklist: workflowResult.checklist,
      matrix: workflowResult.matrix,
      evidenceRoom: workflowResult.evidenceRoom,
      boundary: protectedAuthorityArtifactReferenceBoundary
    },
    {
      status: 201,
      headers: {
        ...headers,
        "X-SCRIMED-Authority-Artifact-Reference-Persisted": "true",
        "X-SCRIMED-PHI-State": "phi-storage-disabled",
        "X-SCRIMED-Artifact-Upload-State": "disabled"
      }
    }
  );
}
