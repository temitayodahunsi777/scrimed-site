import { NextResponse } from "next/server";
import {
  buildProtectedClinicalAuthorityOwnerMatrixPacket,
  deriveProtectedClinicalAuthorityOwnerMatrix,
  protectedClinicalAuthorityOwnerMatrixAuthority,
  protectedClinicalAuthorityOwnerMatrixPacketStatus
} from "../../../../../lib/protectedClinicalAuthorityOwnerMatrix";
import {
  protectedClinicalAuthorityEvidenceRoomClinicalAuthority,
  protectedClinicalAuthorityEvidenceRoomDataBoundary,
  protectedClinicalAuthorityEvidenceRoomLegalAuthority,
  protectedClinicalAuthorityEvidenceRoomPhiAuthority,
  protectedClinicalAuthorityEvidenceRoomProductionAuthority,
  protectedClinicalAuthorityEvidenceRoomRegulatoryAuthority,
  protectedClinicalAuthorityEvidenceRoomReimbursementAuthority,
  protectedClinicalAuthorityEvidenceRoomSecurityCertification
} from "../../../../../lib/protectedClinicalAuthorityEvidenceRoom";
import {
  getAccessiblePilotWorkspace,
  getAuthenticatedGovernanceContext,
  recordClinicalAuthorityOwnerMatrixPacketDownload
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

function statusForOwnerMatrixPacketError(message: string) {
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
    namespace: "protected-clinical-authority-owner-matrix-packet-download",
    limit: 10,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message:
            "Protected Clinical Authority Owner Matrix packet downloads are temporarily rate limited."
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
  const { room } = await loadProtectedClinicalAuthorityEvidenceRoom(context.client, workspace);
  const matrix = deriveProtectedClinicalAuthorityOwnerMatrix({ room, workspace });
  const audit = await recordClinicalAuthorityOwnerMatrixPacketDownload(
    context.client,
    workspace.slug,
    {
      authorityDomainCount: matrix.summary.authorityDomainCount,
      requiredOwnerAssignmentCount: matrix.summary.requiredOwnerAssignmentCount,
      customerOwnerCount: matrix.summary.customerOwnerCount,
      scrimedOwnerCount: matrix.summary.scrimedOwnerCount,
      externalOwnerCount: matrix.summary.externalOwnerCount,
      metadataAssignedCount: matrix.summary.metadataAssignedCount,
      blockedAssignmentCount: matrix.summary.blockedAssignmentCount,
      staleOwnerCount: matrix.summary.staleOwnerCount,
      evidenceRouteCount: matrix.summary.evidenceRouteCount,
      authorityState: matrix.authorityState
    }
  );

  if (audit.error || !audit.eventId) {
    const message = audit.error?.message ?? "";

    return NextResponse.json(
      {
        error: {
          code: "clinical-authority-owner-matrix-packet-audit-failed",
          message:
            "The Clinical Authority Owner Matrix packet was not released because the append-only download audit event could not be committed."
        },
        boundary: matrix.boundary
      },
      { status: statusForOwnerMatrixPacketError(message), headers }
    );
  }

  const generatedAt = new Date().toISOString();
  const packet = buildProtectedClinicalAuthorityOwnerMatrixPacket({
    actorUserId: context.user.id,
    auditEventId: audit.eventId,
    generatedAt,
    matrix,
    workspace
  });
  const safeWorkspaceSlug = workspace.slug.replace(/[^a-z0-9-]/gi, "-").slice(0, 80) || "workspace";

  return new NextResponse(packet, {
    headers: {
      ...headers,
      "Content-Disposition": `attachment; filename="scrimed-${safeWorkspaceSlug}-clinical-authority-owner-matrix.md"`,
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Proof-Stack": protectedClinicalAuthorityOwnerMatrixPacketStatus,
      "X-SCRIMED-Clinical-Authority-Owner-Matrix":
        protectedClinicalAuthorityOwnerMatrixAuthority,
      "X-SCRIMED-Clinical-Care-Authority":
        protectedClinicalAuthorityEvidenceRoomClinicalAuthority,
      "X-SCRIMED-PHI-Authority": protectedClinicalAuthorityEvidenceRoomPhiAuthority,
      "X-SCRIMED-Legal-Authority": protectedClinicalAuthorityEvidenceRoomLegalAuthority,
      "X-SCRIMED-Regulatory-Authority":
        protectedClinicalAuthorityEvidenceRoomRegulatoryAuthority,
      "X-SCRIMED-Reimbursement-Authority":
        protectedClinicalAuthorityEvidenceRoomReimbursementAuthority,
      "X-SCRIMED-Security-Certification":
        protectedClinicalAuthorityEvidenceRoomSecurityCertification,
      "X-SCRIMED-Production-Authorization":
        protectedClinicalAuthorityEvidenceRoomProductionAuthority,
      "X-SCRIMED-Data-Boundary": protectedClinicalAuthorityEvidenceRoomDataBoundary
    }
  });
}
