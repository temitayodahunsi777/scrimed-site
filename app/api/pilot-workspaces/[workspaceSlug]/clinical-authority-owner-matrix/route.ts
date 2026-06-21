import { NextResponse } from "next/server";
import {
  deriveProtectedClinicalAuthorityOwnerMatrix,
  protectedClinicalAuthorityOwnerMatrixAuthority,
  protectedClinicalAuthorityOwnerMatrixBoundary,
  protectedClinicalAuthorityOwnerMatrixStatus
} from "../../../../lib/protectedClinicalAuthorityOwnerMatrix";
import {
  protectedClinicalAuthorityEvidenceRoomClinicalAuthority,
  protectedClinicalAuthorityEvidenceRoomDataBoundary,
  protectedClinicalAuthorityEvidenceRoomLegalAuthority,
  protectedClinicalAuthorityEvidenceRoomPhiAuthority,
  protectedClinicalAuthorityEvidenceRoomProductionAuthority,
  protectedClinicalAuthorityEvidenceRoomRegulatoryAuthority,
  protectedClinicalAuthorityEvidenceRoomReimbursementAuthority,
  protectedClinicalAuthorityEvidenceRoomSecurityCertification
} from "../../../../lib/protectedClinicalAuthorityEvidenceRoom";
import {
  getAccessiblePilotWorkspace,
  getAuthenticatedGovernanceContext
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

const clinicalAuthorityOwnerMatrixHeaders = {
  "X-SCRIMED-Clinical-Authority-Owner-Matrix":
    protectedClinicalAuthorityOwnerMatrixAuthority,
  "X-SCRIMED-Clinical-Care-Authority":
    protectedClinicalAuthorityEvidenceRoomClinicalAuthority,
  "X-SCRIMED-PHI-Authority": protectedClinicalAuthorityEvidenceRoomPhiAuthority,
  "X-SCRIMED-Legal-Authority": protectedClinicalAuthorityEvidenceRoomLegalAuthority,
  "X-SCRIMED-Regulatory-Authority": protectedClinicalAuthorityEvidenceRoomRegulatoryAuthority,
  "X-SCRIMED-Reimbursement-Authority":
    protectedClinicalAuthorityEvidenceRoomReimbursementAuthority,
  "X-SCRIMED-Security-Certification":
    protectedClinicalAuthorityEvidenceRoomSecurityCertification,
  "X-SCRIMED-Production-Authorization":
    protectedClinicalAuthorityEvidenceRoomProductionAuthority,
  "X-SCRIMED-Data-Boundary": protectedClinicalAuthorityEvidenceRoomDataBoundary
};

export async function GET(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "protected-clinical-authority-owner-matrix-read",
    limit: 45,
    windowSeconds: 600
  });
  const headers = {
    ...protectedPilotNoStoreHeaders,
    ...rateLimitHeaders(rateLimit),
    ...clinicalAuthorityOwnerMatrixHeaders
  };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Protected Clinical Authority Owner Matrix reads are temporarily rate limited."
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
      { status: context.status, headers: protectedPilotNoStoreHeaders }
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

  const { room } = await loadProtectedClinicalAuthorityEvidenceRoom(
    context.client,
    workspaceResult.workspace
  );
  const matrix = deriveProtectedClinicalAuthorityOwnerMatrix({
    room,
    workspace: workspaceResult.workspace
  });

  return NextResponse.json(
    {
      service: matrix.service,
      status: protectedClinicalAuthorityOwnerMatrixStatus,
      workspace: workspaceResult.workspace,
      matrix,
      evidenceRoom: room,
      boundary: protectedClinicalAuthorityOwnerMatrixBoundary
    },
    { headers }
  );
}
