import { NextResponse } from "next/server";
import {
  boundaryReleaseEvidenceIntakeBoundary,
  boundaryReleaseEvidenceIntakePacketProofStackStatus,
  boundaryReleaseEvidenceIntakeReleaseAuthority,
  boundaryReleaseEvidenceIntakeStorageAuthority,
  buildBoundaryReleaseEvidenceIntakePacket,
  getBoundaryReleaseEvidenceIntakeSummary
} from "../../../../../lib/boundaryReleaseEvidenceIntake";
import {
  getAccessiblePilotWorkspace,
  getAuthenticatedGovernanceContext,
  listProtectedExternalApprovalEvidenceReferences,
  recordProtectedBoundaryReleaseEvidenceIntakePacketDownload
} from "../../../../../lib/protectedPilotStore";
import {
  protectedPilotBoundary,
  protectedPilotNoStoreHeaders
} from "../../../../../lib/protectedPilotWorkspace";
import { enforceRequestRateLimit, rateLimitHeaders } from "../../../../../lib/requestRateLimit";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ workspaceSlug: string }>;
};

const packetHeaders = {
  ...protectedPilotNoStoreHeaders,
  "X-SCRIMED-Boundary-Release-Evidence-Intake": "aal2-metadata-only",
  "X-SCRIMED-Proof-Stack": boundaryReleaseEvidenceIntakePacketProofStackStatus,
  "X-SCRIMED-Data-Boundary": "synthetic-only",
  "X-SCRIMED-Storage-Authority": boundaryReleaseEvidenceIntakeStorageAuthority,
  "X-SCRIMED-Release-Authority": boundaryReleaseEvidenceIntakeReleaseAuthority,
  "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
  "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
  "X-SCRIMED-Payer-Submission-Authority": "not-authorized",
  "X-SCRIMED-EHR-Writeback-Authority": "not-authorized",
  "X-SCRIMED-Production-Connector-Authority": "not-production-connector-approved",
  "X-SCRIMED-Certification-Authority": "not-certified-readiness-only",
  "X-SCRIMED-Customer-Go-Live-Authority": "not-authorized"
};

function statusForPacketError(message: string) {
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
    namespace: "protected-boundary-release-evidence-intake-packet-download",
    limit: 15,
    windowSeconds: 600
  });
  const headers = { ...packetHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message:
            "Protected boundary release evidence intake packet downloads are temporarily rate limited."
        },
        boundary: boundaryReleaseEvidenceIntakeBoundary
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
  const recordsResult = await listProtectedExternalApprovalEvidenceReferences(
    context.client,
    workspace.id
  );
  const externalReferenceRecords = recordsResult.error ? [] : recordsResult.records;
  const summary = getBoundaryReleaseEvidenceIntakeSummary(externalReferenceRecords);
  const unavailableSections = recordsResult.error
    ? ["Protected external approval evidence reference history could not be retrieved for this packet."]
    : [];
  const auditResult = await recordProtectedBoundaryReleaseEvidenceIntakePacketDownload(
    context.client,
    workspace.slug,
    {
      workItemCount: summary.summary.workItemCount,
      intakeReadyCount: summary.summary.intakeReadyCount,
      missingReferenceCount: summary.summary.missingReferenceCount,
      criticalMissingReferenceCount: summary.summary.criticalMissingReferenceCount,
      externalReferenceRecordCount: externalReferenceRecords.length,
      allWorkItemsRequireHumanApproval: summary.summary.allWorkItemsRequireHumanApproval,
      noWorkItemCanRelieveBoundary: summary.summary.noWorkItemCanRelieveBoundary,
      storageAuthority: boundaryReleaseEvidenceIntakeStorageAuthority,
      releaseAuthority: boundaryReleaseEvidenceIntakeReleaseAuthority,
      proofStackStatus: boundaryReleaseEvidenceIntakePacketProofStackStatus
    }
  );

  if (auditResult.error || !auditResult.eventId) {
    const message = auditResult.error?.message ?? "";

    return NextResponse.json(
      {
        error: {
          code: "protected-boundary-release-evidence-intake-packet-audit-failed",
          message:
            "The protected boundary release evidence intake packet was not released because the audit event could not be committed."
        },
        boundary: boundaryReleaseEvidenceIntakeBoundary
      },
      { status: statusForPacketError(message), headers }
    );
  }

  const generatedAt = new Date().toISOString();
  const packet = buildBoundaryReleaseEvidenceIntakePacket({
    actorUserId: context.user.id,
    auditEventId: auditResult.eventId,
    externalReferenceRecords,
    generatedAt,
    summary,
    unavailableSections,
    workspace
  });
  const safeWorkspaceSlug = workspace.slug.replace(/[^a-z0-9-]/gi, "-").slice(0, 80) || "workspace";

  return new NextResponse(packet, {
    headers: {
      ...headers,
      "Content-Disposition": `attachment; filename="scrimed-${safeWorkspaceSlug}-boundary-release-evidence-intake.md"`,
      "Content-Type": "text/markdown; charset=utf-8"
    }
  });
}
