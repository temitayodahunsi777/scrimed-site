import { NextResponse } from "next/server";
import {
  buildProtectedAuthorityArtifactReferencePacket,
  deriveProtectedAuthorityArtifactReferenceWorkflow,
  protectedAuthorityArtifactReferenceAuthority,
  protectedAuthorityArtifactReferenceBoundary,
  protectedAuthorityArtifactReferencePacketStatus,
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
  listProtectedAuthorityArtifactReferences,
  recordProtectedAuthorityArtifactReferencePacketDownload
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

function statusForAuthorityArtifactReferencePacketError(message: string) {
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

  return 502;
}

export async function GET(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "protected-authority-artifact-references-packet-download",
    limit: 12,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message:
            "Protected Authority Artifact Reference packet downloads are temporarily rate limited."
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
      ? "Protected authority artifact reference history could not be retrieved for this packet."
      : ""
  ].filter(Boolean);
  const workflow = deriveProtectedAuthorityArtifactReferenceWorkflow({
    checklist,
    records: referenceResult.error ? [] : referenceResult.records,
    unavailableSections,
    workspace
  });
  const audit = await recordProtectedAuthorityArtifactReferencePacketDownload(
    context.client,
    workspace.slug,
    {
      referenceRecordCount: workflow.summary.referenceRecordCount,
      referencedItemCount: workflow.summary.referencedItemCount,
      acceptedMetadataOnlyCount: workflow.summary.acceptedMetadataOnlyCount,
      reviewPendingCount: workflow.summary.reviewPendingCount,
      renewalRequiredCount: workflow.summary.renewalRequiredCount,
      rejectedOrExpiredCount: workflow.summary.rejectedOrExpiredCount,
      missingReferenceItemCount: workflow.summary.missingReferenceItemCount,
      referenceState: workflow.referenceState,
      authorityState: workflow.authorityState,
      referenceAuthority: protectedAuthorityArtifactReferenceAuthority,
      storageAuthority: protectedAuthorityArtifactReferenceStorageAuthority,
      clinicalExecutionAuthority: "not-authorized-live-care"
    }
  );

  if (audit.error || !audit.eventId) {
    const message = audit.error?.message ?? "";

    return NextResponse.json(
      {
        error: {
          code: "protected-authority-artifact-reference-packet-audit-failed",
          message:
            "The protected authority artifact reference packet was not released because the audit event could not be committed."
        },
        boundary: protectedAuthorityArtifactReferenceBoundary
      },
      { status: statusForAuthorityArtifactReferencePacketError(message), headers }
    );
  }

  const generatedAt = new Date().toISOString();
  const packet = buildProtectedAuthorityArtifactReferencePacket({
    actorUserId: context.user.id,
    auditEventId: audit.eventId,
    generatedAt,
    workflow,
    workspace
  });
  const safeWorkspaceSlug = workspace.slug.replace(/[^a-z0-9-]/gi, "-").slice(0, 80) || "workspace";

  return new NextResponse(packet, {
    headers: {
      ...headers,
      "Content-Disposition": `attachment; filename="scrimed-${safeWorkspaceSlug}-authority-artifact-references.md"`,
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Proof-Stack": protectedAuthorityArtifactReferencePacketStatus,
      "X-SCRIMED-Authority-Artifact-References":
        protectedAuthorityArtifactReferenceAuthority,
      "X-SCRIMED-Storage-Authority": protectedAuthorityArtifactReferenceStorageAuthority,
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-PHI-State": "phi-storage-disabled",
      "X-SCRIMED-Artifact-Upload-State": "disabled"
    }
  });
}
