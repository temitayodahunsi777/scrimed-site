import { NextResponse } from "next/server";
import {
  deriveProtectedAuthorityArtifactReferenceWorkflow,
  protectedAuthorityArtifactReferenceAuthority,
  protectedAuthorityArtifactReferenceBoundary,
  protectedAuthorityArtifactReferenceQaHarnessStatus,
  protectedAuthorityArtifactReferenceRenewalQueueStatus,
  protectedAuthorityArtifactReferenceStorageAuthority
} from "../../../../../lib/protectedAuthorityArtifactReferences";
import {
  deriveProtectedClinicalAuthorityArtifactIntakeChecklist
} from "../../../../../lib/protectedClinicalAuthorityArtifactIntake";
import {
  deriveProtectedClinicalAuthorityOwnerMatrix
} from "../../../../../lib/protectedClinicalAuthorityOwnerMatrix";
import {
  getAccessiblePilotWorkspace,
  getAuthenticatedGovernanceContext,
  listProtectedAuthorityArtifactReferences
} from "../../../../../lib/protectedPilotStore";
import {
  protectedPilotBoundary,
  protectedPilotNoStoreHeaders
} from "../../../../../lib/protectedPilotWorkspace";
import { enforceRequestRateLimit, rateLimitHeaders } from "../../../../../lib/requestRateLimit";
import { loadProtectedClinicalAuthorityEvidenceRoom } from "../../clinical-authority-evidence-room/evidenceRoomData";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ workspaceSlug: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "protected-authority-artifact-renewal-queue-read",
    limit: 60,
    windowSeconds: 600
  });
  const headers = {
    ...protectedPilotNoStoreHeaders,
    ...rateLimitHeaders(rateLimit),
    "X-SCRIMED-Proof-Stack": protectedAuthorityArtifactReferenceRenewalQueueStatus,
    "X-SCRIMED-QA-Harness": protectedAuthorityArtifactReferenceQaHarnessStatus,
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
          message:
            "Protected Authority Artifact Reference renewal queue reads are temporarily rate limited."
        },
        boundary: protectedPilotBoundary
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

  const workspace = workspaceResult.workspace;
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
      ? "Protected authority artifact reference history could not be retrieved; renewal queue is derived from checklist gaps only."
      : ""
  ].filter(Boolean);
  const workflow = deriveProtectedAuthorityArtifactReferenceWorkflow({
    checklist,
    records: referenceResult.error ? [] : referenceResult.records,
    unavailableSections,
    workspace
  });

  return NextResponse.json(
    {
      service: "scrimed-protected-authority-artifact-renewal-queue",
      status: protectedAuthorityArtifactReferenceRenewalQueueStatus,
      workspace,
      summary: workflow.summary,
      renewalQueue: workflow.renewalQueue,
      qaHarness: workflow.qaHarness,
      authorities: workflow.authorities,
      safeWorkarounds: workflow.safeWorkarounds,
      nextActions: workflow.nextActions,
      unavailableSections: workflow.unavailableSections,
      boundary: protectedAuthorityArtifactReferenceBoundary
    },
    { headers }
  );
}
