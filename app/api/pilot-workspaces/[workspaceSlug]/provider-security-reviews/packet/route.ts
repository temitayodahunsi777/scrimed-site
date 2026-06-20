import { NextResponse } from "next/server";
import {
  buildProtectedProviderSecurityReviewPacket,
  deriveProtectedProviderSecurityReviewWorkflow,
  protectedProviderSecurityReviewAuthority,
  protectedProviderSecurityReviewBaaDpaAuthority,
  protectedProviderSecurityReviewBoundary,
  protectedProviderSecurityReviewPacketProofStackStatus,
  protectedProviderSecurityReviewStorageAuthority
} from "../../../../../lib/protectedProviderSecurityReviews";
import {
  getAccessiblePilotWorkspace,
  getAuthenticatedGovernanceContext,
  listProtectedEvidenceRoomProviderAdapters,
  listProtectedProviderSecurityReviews,
  recordProtectedProviderSecurityReviewPacketDownload
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
    namespace: "protected-provider-security-review-packet-download",
    limit: 12,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Protected provider security review packet downloads are temporarily rate limited."
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
  const [providerAdapterRecordsResult, securityReviewRecordsResult] = await Promise.all([
    listProtectedEvidenceRoomProviderAdapters(context.client, workspace.id),
    listProtectedProviderSecurityReviews(context.client, workspace.id)
  ]);
  const unavailableSections = [
    providerAdapterRecordsResult.error
      ? "Protected evidence-room provider adapter history could not be retrieved for this packet."
      : "",
    securityReviewRecordsResult.error
      ? "Protected provider security review history could not be retrieved for this packet."
      : ""
  ].filter(Boolean);
  const workflow = deriveProtectedProviderSecurityReviewWorkflow({
    providerAdapterRecords: providerAdapterRecordsResult.error
      ? []
      : providerAdapterRecordsResult.records,
    records: securityReviewRecordsResult.error ? [] : securityReviewRecordsResult.records,
    unavailableSections
  });
  const auditResult = await recordProtectedProviderSecurityReviewPacketDownload(
    context.client,
    workspace.slug,
    {
      reviewCount: workflow.summary.reviewCount,
      readyForReviewCount: workflow.summary.readyForReviewCount,
      blockedReviewCount: workflow.summary.blockedReviewCount,
      availableProviderAdapterCount: workflow.summary.availableProviderAdapterCount,
      requiredSecurityControlCount: workflow.summary.requiredSecurityControlCount,
      linkedSecurityControlCount: workflow.summary.linkedSecurityControlCount,
      missingSecurityControlCount: workflow.summary.missingSecurityControlCount,
      reviewState: workflow.reviewState,
      integrationState: workflow.integrationState,
      legalState: workflow.legalState,
      providerSecurityReviewAuthority: protectedProviderSecurityReviewAuthority,
      baaDpaAuthority: protectedProviderSecurityReviewBaaDpaAuthority,
      storageAuthority: protectedProviderSecurityReviewStorageAuthority,
      clinicalExecutionAuthority: "not-authorized-live-care"
    }
  );

  if (auditResult.error || !auditResult.eventId) {
    const message = auditResult.error?.message ?? "";

    return NextResponse.json(
      {
        error: {
          code: "protected-provider-security-review-packet-audit-failed",
          message:
            "The protected provider security review packet was not released because the audit event could not be committed."
        },
        boundary: protectedProviderSecurityReviewBoundary
      },
      { status: statusForPacketError(message), headers }
    );
  }

  const generatedAt = new Date().toISOString();
  const packet = buildProtectedProviderSecurityReviewPacket({
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
      "Content-Disposition": `attachment; filename="scrimed-${safeWorkspaceSlug}-provider-security-reviews.md"`,
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Proof-Stack": protectedProviderSecurityReviewPacketProofStackStatus,
      "X-SCRIMED-Provider-Security-Review-Authority": protectedProviderSecurityReviewAuthority,
      "X-SCRIMED-BAA-DPA-Authority": protectedProviderSecurityReviewBaaDpaAuthority,
      "X-SCRIMED-Storage-Authority": protectedProviderSecurityReviewStorageAuthority,
      "X-SCRIMED-Integration-State": "integration-disabled",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-PHI-State": "phi-processing-disabled",
      "X-SCRIMED-Credential-State": "credential-storage-disabled"
    }
  });
}
