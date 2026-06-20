import { NextResponse } from "next/server";
import {
  buildProtectedProcurementEvidenceRegistryPacket,
  deriveProtectedProcurementEvidenceRegistryWorkflow,
  protectedProcurementEvidenceRegistryAuthority,
  protectedProcurementEvidenceRegistryBoundary,
  protectedProcurementEvidenceRegistryPacketProofStackStatus,
  protectedProcurementEvidenceRegistryStorageAuthority
} from "../../../../../lib/protectedProcurementEvidenceRegistry";
import {
  getAccessiblePilotWorkspace,
  getAuthenticatedGovernanceContext,
  listProtectedProcurementEvidenceRegistryRecords,
  listProtectedProviderSecurityReviews,
  recordProtectedProcurementEvidenceRegistryPacketDownload
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
    namespace: "protected-procurement-evidence-packet-download",
    limit: 12,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Protected procurement evidence packet downloads are temporarily rate limited."
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
  const [providerSecurityReviewRecordsResult, procurementRecordsResult] = await Promise.all([
    listProtectedProviderSecurityReviews(context.client, workspace.id),
    listProtectedProcurementEvidenceRegistryRecords(context.client, workspace.id)
  ]);
  const unavailableSections = [
    providerSecurityReviewRecordsResult.error
      ? "Protected provider security review history could not be retrieved for this packet."
      : "",
    procurementRecordsResult.error
      ? "Protected procurement evidence registry history could not be retrieved for this packet."
      : ""
  ].filter(Boolean);
  const workflow = deriveProtectedProcurementEvidenceRegistryWorkflow({
    providerSecurityReviewRecords: providerSecurityReviewRecordsResult.error
      ? []
      : providerSecurityReviewRecordsResult.records,
    records: procurementRecordsResult.error ? [] : procurementRecordsResult.records,
    unavailableSections
  });
  const auditResult = await recordProtectedProcurementEvidenceRegistryPacketDownload(
    context.client,
    workspace.slug,
    {
      registryCount: workflow.summary.registryCount,
      readyRegistryCount: workflow.summary.readyRegistryCount,
      blockedRegistryCount: workflow.summary.blockedRegistryCount,
      availableProviderSecurityReviewCount:
        workflow.summary.availableProviderSecurityReviewCount,
      targetAudienceCount: workflow.summary.targetAudienceCount,
      requiredProcurementControlCount: workflow.summary.requiredProcurementControlCount,
      linkedProcurementControlCount: workflow.summary.linkedProcurementControlCount,
      missingProcurementControlCount: workflow.summary.missingProcurementControlCount,
      registryState: workflow.registryState,
      externalDistributionState: workflow.externalDistributionState,
      legalState: workflow.legalState,
      procurementEvidenceRegistryAuthority: protectedProcurementEvidenceRegistryAuthority,
      storageAuthority: protectedProcurementEvidenceRegistryStorageAuthority,
      clinicalExecutionAuthority: "not-authorized-live-care"
    }
  );

  if (auditResult.error || !auditResult.eventId) {
    const message = auditResult.error?.message ?? "";

    return NextResponse.json(
      {
        error: {
          code: "protected-procurement-evidence-packet-audit-failed",
          message:
            "The protected procurement evidence packet was not released because the audit event could not be committed."
        },
        boundary: protectedProcurementEvidenceRegistryBoundary
      },
      { status: statusForPacketError(message), headers }
    );
  }

  const generatedAt = new Date().toISOString();
  const packet = buildProtectedProcurementEvidenceRegistryPacket({
    actorUserId: context.user.id,
    auditEventId: auditResult.eventId,
    generatedAt,
    workflow,
    workspace
  });
  const safeWorkspaceSlug = workspace.slug.replace(/[^a-z0-9-]/gi, "-").slice(0, 80) || "workspace";

  return new NextResponse(packet, {
    headers: {
      ...headers,
      "Content-Disposition": `attachment; filename="scrimed-${safeWorkspaceSlug}-procurement-evidence-registry.md"`,
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Proof-Stack": protectedProcurementEvidenceRegistryPacketProofStackStatus,
      "X-SCRIMED-Procurement-Evidence-Authority":
        protectedProcurementEvidenceRegistryAuthority,
      "X-SCRIMED-Storage-Authority": protectedProcurementEvidenceRegistryStorageAuthority,
      "X-SCRIMED-External-Distribution-State": "distribution-disabled",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-PHI-State": "phi-processing-disabled",
      "X-SCRIMED-Credential-State": "credential-storage-disabled",
      "X-SCRIMED-Confidential-Answer-State": "confidential-answer-storage-disabled"
    }
  });
}
