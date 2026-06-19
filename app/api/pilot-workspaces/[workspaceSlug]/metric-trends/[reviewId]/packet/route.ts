import { NextResponse } from "next/server";
import {
  buildProtectedMetricTrendPacket,
  protectedMetricTrendBoundary,
  protectedMetricTrendPacketProofStackStatus
} from "../../../../../../lib/protectedMetricTrends";
import {
  getAccessiblePilotWorkspace,
  getAuthenticatedGovernanceContext,
  getProtectedMetricTrendReview,
  recordProtectedMetricTrendPacketDownload
} from "../../../../../../lib/protectedPilotStore";
import {
  protectedPilotBoundary,
  protectedPilotNoStoreHeaders
} from "../../../../../../lib/protectedPilotWorkspace";
import { enforceRequestRateLimit, rateLimitHeaders } from "../../../../../../lib/requestRateLimit";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ workspaceSlug: string; reviewId: string }>;
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

  if (message.includes("workspace") || message.includes("review")) return 404;
  if (message.includes("does not exist") || message.includes("schema cache")) return 503;

  return 502;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

export async function GET(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "protected-metric-trend-packet-download",
    limit: 20,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Protected metric trend packet downloads are temporarily rate limited."
        },
        boundary: protectedPilotBoundary
      },
      { status: 429, headers }
    );
  }

  const { workspaceSlug, reviewId } = await params;

  if (!isUuid(reviewId)) {
    return NextResponse.json(
      {
        error: {
          code: "invalid-review-id",
          message: "Protected metric trend packet downloads require a valid review id."
        },
        boundary: protectedMetricTrendBoundary
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

  const reviewResult = await getProtectedMetricTrendReview(
    context.client,
    workspaceResult.workspace.id,
    reviewId
  );

  if (reviewResult.error || !reviewResult.review) {
    const message = reviewResult.error?.message ?? "review-not-found";

    return NextResponse.json(
      {
        error: {
          code: "protected-metric-trend-review-not-found",
          message:
            "The protected metric trend review could not be found for this tenant workspace."
        },
        boundary: protectedMetricTrendBoundary
      },
      { status: statusForPacketError(message), headers }
    );
  }

  const auditResult = await recordProtectedMetricTrendPacketDownload(
    context.client,
    workspaceResult.workspace.slug,
    reviewResult.review.id
  );

  if (auditResult.error || !auditResult.eventId) {
    const message = auditResult.error?.message ?? "";

    return NextResponse.json(
      {
        error: {
          code: "protected-metric-trend-packet-audit-failed",
          message:
            "The metric trend packet was not released because the audit event could not be committed."
        },
        boundary: protectedMetricTrendBoundary
      },
      { status: statusForPacketError(message), headers }
    );
  }

  const packet = buildProtectedMetricTrendPacket(reviewResult.review, {
    workspaceSlug: workspaceResult.workspace.slug,
    workspaceName: workspaceResult.workspace.name,
    auditEventId: auditResult.eventId
  });

  return new NextResponse(packet, {
    headers: {
      ...headers,
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="scrimed-${workspaceResult.workspace.slug}-${reviewResult.review.id}-metric-trend-packet.md"`,
      "X-SCRIMED-Proof-Stack": protectedMetricTrendPacketProofStackStatus,
      "X-SCRIMED-Financial-Authority": reviewResult.review.financialReportingAuthority,
      "X-SCRIMED-Securities-Authority": reviewResult.review.securitiesAuthority
    }
  });
}
