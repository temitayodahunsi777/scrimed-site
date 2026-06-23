import { NextResponse } from "next/server";
import {
  buildProtectedBoardScorecardPacket,
  protectedBoardScorecardBoundary,
  protectedBoardScorecardPacketProofStackStatus
} from "../../../../../../lib/protectedBoardScorecards";
import {
  getAccessiblePilotWorkspace,
  getAuthenticatedGovernanceContext,
  getProtectedBoardScorecard,
  recordProtectedBoardScorecardPacketDownload
} from "../../../../../../lib/protectedPilotStore";
import {
  protectedPilotBoundary,
  protectedPilotNoStoreHeaders
} from "../../../../../../lib/protectedPilotWorkspace";
import { enforceRequestRateLimit, rateLimitHeaders } from "../../../../../../lib/requestRateLimit";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ workspaceSlug: string; scorecardId: string }>;
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

  if (message.includes("workspace") || message.includes("scorecard")) return 404;
  if (message.includes("does not exist") || message.includes("schema cache")) return 503;

  return 502;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

export async function GET(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "protected-board-scorecard-packet-download",
    limit: 20,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Protected board scorecard packet downloads are temporarily rate limited."
        },
        boundary: protectedPilotBoundary
      },
      { status: 429, headers }
    );
  }

  const { workspaceSlug, scorecardId } = await params;

  if (!isUuid(scorecardId)) {
    return NextResponse.json(
      {
        error: {
          code: "invalid-scorecard-id",
          message: "Protected board scorecard packet downloads require a valid scorecard id."
        },
        boundary: protectedBoardScorecardBoundary
      },
      { status: 400, headers }
    );
  }

  const context = await getAuthenticatedGovernanceContext(request);

  if (!context.ok) {
    return NextResponse.json(
      { error: { code: context.code, message: context.message }, boundary: protectedPilotBoundary },
      { status: context.status, headers }
    );
  }

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

  const scorecardResult = await getProtectedBoardScorecard(
    context.client,
    workspaceResult.workspace.id,
    scorecardId
  );

  if (scorecardResult.error || !scorecardResult.scorecard) {
    const message = scorecardResult.error?.message ?? "scorecard-not-found";

    return NextResponse.json(
      {
        error: {
          code: "protected-board-scorecard-not-found",
          message:
            "The protected board scorecard could not be found for this tenant workspace."
        },
        boundary: protectedBoardScorecardBoundary
      },
      { status: statusForPacketError(message), headers }
    );
  }

  const auditResult = await recordProtectedBoardScorecardPacketDownload(
    context.client,
    workspaceResult.workspace.slug,
    scorecardResult.scorecard.id
  );

  if (auditResult.error || !auditResult.eventId) {
    const message = auditResult.error?.message ?? "";

    return NextResponse.json(
      {
        error: {
          code: "protected-board-scorecard-packet-audit-failed",
          message:
            "The board scorecard packet was not released because the audit event could not be committed."
        },
        boundary: protectedBoardScorecardBoundary
      },
      { status: statusForPacketError(message), headers }
    );
  }

  const packet = buildProtectedBoardScorecardPacket(scorecardResult.scorecard, {
    workspaceSlug: workspaceResult.workspace.slug,
    workspaceName: workspaceResult.workspace.name,
    auditEventId: auditResult.eventId
  });

  return new NextResponse(packet, {
    headers: {
      ...headers,
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="scrimed-${workspaceResult.workspace.slug}-${scorecardResult.scorecard.id}-board-scorecard-packet.md"`,
      "X-SCRIMED-Proof-Stack": protectedBoardScorecardPacketProofStackStatus,
      "X-SCRIMED-Financial-Authority": scorecardResult.scorecard.financialReportingAuthority,
      "X-SCRIMED-Securities-Authority": scorecardResult.scorecard.securitiesAuthority
    }
  });
}
