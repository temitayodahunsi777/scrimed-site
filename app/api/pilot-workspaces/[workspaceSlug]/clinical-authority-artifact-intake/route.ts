import { NextResponse } from "next/server";
import {
  deriveProtectedClinicalAuthorityArtifactIntakeChecklist,
  protectedClinicalAuthorityArtifactIntakeAuthority,
  protectedClinicalAuthorityArtifactIntakeBoundary,
  protectedClinicalAuthorityArtifactIntakeStatus
} from "../../../../lib/protectedClinicalAuthorityArtifactIntake";
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
  deriveProtectedClinicalAuthorityOwnerMatrix,
  protectedClinicalAuthorityOwnerMatrixAuthority
} from "../../../../lib/protectedClinicalAuthorityOwnerMatrix";
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

const clinicalAuthorityArtifactIntakeHeaders = {
  "X-SCRIMED-Clinical-Authority-Artifact-Intake":
    protectedClinicalAuthorityArtifactIntakeAuthority,
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
    namespace: "protected-clinical-authority-artifact-intake-read",
    limit: 45,
    windowSeconds: 600
  });
  const headers = {
    ...protectedPilotNoStoreHeaders,
    ...rateLimitHeaders(rateLimit),
    ...clinicalAuthorityArtifactIntakeHeaders
  };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message:
            "Protected Clinical Authority Artifact Intake Checklist reads are temporarily rate limited."
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
  const checklist = deriveProtectedClinicalAuthorityArtifactIntakeChecklist({
    matrix,
    workspace: workspaceResult.workspace
  });

  return NextResponse.json(
    {
      service: checklist.service,
      status: protectedClinicalAuthorityArtifactIntakeStatus,
      workspace: workspaceResult.workspace,
      checklist,
      matrix,
      evidenceRoom: room,
      boundary: protectedClinicalAuthorityArtifactIntakeBoundary
    },
    { headers }
  );
}
