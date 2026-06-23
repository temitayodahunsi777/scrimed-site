import { NextResponse } from "next/server";
import {
  buildProtectedBuyerReleaseControlRunPacket,
  protectedBuyerReleaseControlRunBoundary
} from "../../../../../lib/protectedBuyerReleaseControlRun";
import {
  getAccessiblePilotWorkspace,
  getAuthenticatedGovernanceContext,
  recordProtectedBuyerReleaseControlRunPacketDownload
} from "../../../../../lib/protectedPilotStore";
import {
  protectedPilotBoundary,
  protectedPilotNoStoreHeaders
} from "../../../../../lib/protectedPilotWorkspace";
import { enforceRequestRateLimit, rateLimitHeaders } from "../../../../../lib/requestRateLimit";
import { loadProtectedBuyerReleaseControlRun } from "../releaseControlData";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ workspaceSlug: string }>;
};

const releaseControlHeaders = {
  "X-SCRIMED-Buyer-Release-Control": "protected-chain-packet-not-release-approval",
  "X-SCRIMED-Buyer-Share": "qualified-human-review-required",
  "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
  "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
  "X-SCRIMED-Release-Authority": "not-release-approval",
  "X-SCRIMED-Security-Certification": "not-security-certified"
};

function statusForPacketError(message: string) {
  if (
    message.includes("role-denied") ||
    message.includes("authentication-required") ||
    message.includes("governance-aal2-session-required")
  ) {
    return 403;
  }

  if (message.includes("workspace-not-found")) return 404;
  if (message.includes("does not exist") || message.includes("schema cache")) return 503;
  return 502;
}

export async function GET(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "protected-buyer-release-control-run-packet",
    limit: 20,
    windowSeconds: 600
  });
  const headers = {
    ...protectedPilotNoStoreHeaders,
    ...releaseControlHeaders,
    ...rateLimitHeaders(rateLimit)
  };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Protected buyer release-control packets are temporarily rate limited."
        },
        boundary: protectedBuyerReleaseControlRunBoundary
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
  const data = await loadProtectedBuyerReleaseControlRun(context.client, workspace);
  const audit = await recordProtectedBuyerReleaseControlRunPacketDownload(
    context.client,
    workspace.slug,
    {
      chainState: data.run.chainState,
      releaseDecision: data.run.releaseDecision,
      shareState: data.run.shareState,
      score: data.run.score,
      readyGateCount: data.run.readyGateCount,
      reviewGateCount: data.run.reviewGateCount,
      blockedGateCount: data.run.blockedGateCount,
      gateCount: data.run.gateCount,
      latestSignalAt: data.run.latestSignalAt,
      unavailableSections: data.unavailableSections
    }
  );

  if (audit.error || !audit.eventId) {
    const message = audit.error?.message ?? "";

    return NextResponse.json(
      {
        error: {
          code: "buyer-release-control-packet-audit-failed",
          message:
            "The buyer release-control packet was not released because its append-only packet audit event could not be committed."
        },
        boundary: protectedBuyerReleaseControlRunBoundary
      },
      { status: statusForPacketError(message), headers }
    );
  }

  const generatedAt = new Date().toISOString();
  const packet = buildProtectedBuyerReleaseControlRunPacket({
    actorUserId: context.user.id,
    auditEventId: audit.eventId,
    generatedAt,
    run: data.run,
    workspace
  });
  const safeWorkspaceSlug = workspace.slug.replace(/[^a-z0-9-]/gi, "-").slice(0, 80) || "workspace";

  return new NextResponse(packet, {
    headers: {
      ...headers,
      "Content-Disposition": `attachment; filename="scrimed-${safeWorkspaceSlug}-buyer-release-control-chain.md"`,
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Data-Boundary": "synthetic-only",
      "X-SCRIMED-Buyer-Release-Control-Packet-Audited": "true"
    }
  });
}
