import { NextResponse } from "next/server";
import {
  buildProtectedClinicalAuthorityEvidenceRoomPacket,
  protectedClinicalAuthorityEvidenceRoomAuthority,
  protectedClinicalAuthorityEvidenceRoomClinicalAuthority,
  protectedClinicalAuthorityEvidenceRoomDataBoundary,
  protectedClinicalAuthorityEvidenceRoomLegalAuthority,
  protectedClinicalAuthorityEvidenceRoomPacketStatus,
  protectedClinicalAuthorityEvidenceRoomPhiAuthority,
  protectedClinicalAuthorityEvidenceRoomProductionAuthority,
  protectedClinicalAuthorityEvidenceRoomRegulatoryAuthority,
  protectedClinicalAuthorityEvidenceRoomReimbursementAuthority,
  protectedClinicalAuthorityEvidenceRoomSecurityCertification
} from "../../../../../lib/protectedClinicalAuthorityEvidenceRoom";
import {
  getAccessiblePilotWorkspace,
  getAuthenticatedGovernanceContext,
  recordClinicalAuthorityEvidenceRoomPacketDownload
} from "../../../../../lib/protectedPilotStore";
import {
  protectedPilotBoundary,
  protectedPilotNoStoreHeaders
} from "../../../../../lib/protectedPilotWorkspace";
import { enforceRequestRateLimit, rateLimitHeaders } from "../../../../../lib/requestRateLimit";
import { loadProtectedClinicalAuthorityEvidenceRoom } from "../evidenceRoomData";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ workspaceSlug: string }>;
};

function statusForEvidenceRoomPacketError(message: string) {
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
    namespace: "protected-clinical-authority-evidence-room-packet-download",
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
            "Protected Clinical Authority Evidence Room packet downloads are temporarily rate limited."
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
  const audit = await recordClinicalAuthorityEvidenceRoomPacketDownload(
    context.client,
    workspace.slug,
    {
      domainCount: room.summary.domainCount,
      metadataRecordedDomainCount: room.summary.metadataRecordedDomainCount,
      blockedBeforeAuthorityCount: room.summary.blockedBeforeAuthorityCount,
      expiredDomainCount: room.summary.expiredDomainCount,
      evidenceReferenceCount: room.summary.evidenceReferenceCount,
      auditEventCount: room.summary.auditEventCount,
      authorityState: room.authorityState,
      phiState: room.phiState,
      legalState: room.legalState,
      reimbursementState: room.reimbursementState,
      securityState: room.securityState,
      productionState: room.productionState
    }
  );

  if (audit.error || !audit.eventId) {
    const message = audit.error?.message ?? "";

    return NextResponse.json(
      {
        error: {
          code: "clinical-authority-evidence-room-packet-audit-failed",
          message:
            "The Clinical Authority Evidence Room packet was not released because the append-only download audit event could not be committed."
        },
        boundary: room.boundary
      },
      { status: statusForEvidenceRoomPacketError(message), headers }
    );
  }

  const generatedAt = new Date().toISOString();
  const packet = buildProtectedClinicalAuthorityEvidenceRoomPacket({
    actorUserId: context.user.id,
    auditEventId: audit.eventId,
    generatedAt,
    room,
    workspace
  });
  const safeWorkspaceSlug = workspace.slug.replace(/[^a-z0-9-]/gi, "-").slice(0, 80) || "workspace";

  return new NextResponse(packet, {
    headers: {
      ...headers,
      "Content-Disposition": `attachment; filename="scrimed-${safeWorkspaceSlug}-clinical-authority-evidence-room.md"`,
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Proof-Stack": protectedClinicalAuthorityEvidenceRoomPacketStatus,
      "X-SCRIMED-Clinical-Authority-Evidence-Room":
        protectedClinicalAuthorityEvidenceRoomAuthority,
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
