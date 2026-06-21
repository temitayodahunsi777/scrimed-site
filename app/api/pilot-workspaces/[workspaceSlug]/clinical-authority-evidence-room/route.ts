import { NextResponse } from "next/server";
import {
  protectedClinicalAuthorityEvidenceRoomAuthority,
  protectedClinicalAuthorityEvidenceRoomBoundary,
  protectedClinicalAuthorityEvidenceRoomClinicalAuthority,
  protectedClinicalAuthorityEvidenceRoomDataBoundary,
  protectedClinicalAuthorityEvidenceRoomLegalAuthority,
  protectedClinicalAuthorityEvidenceRoomPhiAuthority,
  protectedClinicalAuthorityEvidenceRoomProductionAuthority,
  protectedClinicalAuthorityEvidenceRoomRegulatoryAuthority,
  protectedClinicalAuthorityEvidenceRoomReimbursementAuthority,
  protectedClinicalAuthorityEvidenceRoomSecurityCertification,
  protectedClinicalAuthorityEvidenceRoomStatus
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
import { loadProtectedClinicalAuthorityEvidenceRoom } from "./evidenceRoomData";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ workspaceSlug: string }>;
};

const clinicalAuthorityEvidenceRoomHeaders = {
  "X-SCRIMED-Clinical-Authority-Evidence-Room":
    protectedClinicalAuthorityEvidenceRoomAuthority,
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

export async function GET(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "protected-clinical-authority-evidence-room-read",
    limit: 45,
    windowSeconds: 600
  });
  const headers = {
    ...protectedPilotNoStoreHeaders,
    ...rateLimitHeaders(rateLimit),
    ...clinicalAuthorityEvidenceRoomHeaders
  };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Protected Clinical Authority Evidence Room reads are temporarily rate limited."
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

  const { room } = await loadProtectedClinicalAuthorityEvidenceRoom(
    authorization.context.client,
    authorization.workspace
  );

  return NextResponse.json(
    {
      service: room.service,
      status: protectedClinicalAuthorityEvidenceRoomStatus,
      workspace: authorization.workspace,
      room,
      boundary: protectedClinicalAuthorityEvidenceRoomBoundary
    },
    { headers }
  );
}
