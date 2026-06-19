import { NextResponse } from "next/server";
import {
  buildProtectedMetricBoardPacket,
  protectedMetricRollupBoundary,
  protectedMetricRollupFinancialAuthority,
  protectedMetricRollupPacketProofStackStatus,
  protectedMetricRollupSecuritiesAuthority
} from "../../../../../../lib/protectedMetricRollups";
import {
  getAccessiblePilotWorkspace,
  getAuthenticatedGovernanceContext,
  getProtectedMetricRollupSnapshot,
  recordProtectedMetricRollupPacketDownload
} from "../../../../../../lib/protectedPilotStore";
import {
  protectedPilotBoundary,
  protectedPilotNoStoreHeaders
} from "../../../../../../lib/protectedPilotWorkspace";
import { enforceRequestRateLimit, rateLimitHeaders } from "../../../../../../lib/requestRateLimit";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ workspaceSlug: string; snapshotId: string }>;
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

  if (message.includes("workspace") || message.includes("snapshot")) return 404;
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
    namespace: "protected-metric-rollup-packet-download",
    limit: 20,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Protected metric rollup packet downloads are temporarily rate limited."
        },
        boundary: protectedPilotBoundary
      },
      { status: 429, headers }
    );
  }

  const { workspaceSlug, snapshotId } = await params;

  if (!isUuid(snapshotId)) {
    return NextResponse.json(
      {
        error: {
          code: "invalid-snapshot-id",
          message: "Protected metric rollup packet downloads require a valid snapshot id."
        },
        boundary: protectedMetricRollupBoundary
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

  const snapshotResult = await getProtectedMetricRollupSnapshot(
    context.client,
    workspaceResult.workspace.id,
    snapshotId
  );

  if (snapshotResult.error || !snapshotResult.snapshot) {
    const message = snapshotResult.error?.message ?? "snapshot-not-found";

    return NextResponse.json(
      {
        error: {
          code: "protected-metric-rollup-snapshot-not-found",
          message:
            "The protected metric rollup snapshot could not be found for this tenant workspace."
        },
        boundary: protectedMetricRollupBoundary
      },
      { status: statusForPacketError(message), headers }
    );
  }

  const auditResult = await recordProtectedMetricRollupPacketDownload(
    context.client,
    workspaceResult.workspace.slug,
    snapshotResult.snapshot.id
  );

  if (auditResult.error || !auditResult.eventId) {
    const message = auditResult.error?.message ?? "";

    return NextResponse.json(
      {
        error: {
          code: "protected-metric-rollup-packet-audit-failed",
          message:
            "The metric rollup board packet was not released because the audit event could not be committed."
        },
        boundary: protectedMetricRollupBoundary
      },
      { status: statusForPacketError(message), headers }
    );
  }

  const packet = buildProtectedMetricBoardPacket(snapshotResult.snapshot, {
    workspaceSlug: workspaceResult.workspace.slug,
    workspaceName: workspaceResult.workspace.name,
    auditEventId: auditResult.eventId
  });

  return new NextResponse(packet, {
    headers: {
      ...headers,
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="scrimed-${workspaceResult.workspace.slug}-${snapshotResult.snapshot.id}-metric-board-packet.md"`,
      "X-SCRIMED-Proof-Stack": protectedMetricRollupPacketProofStackStatus,
      "X-SCRIMED-Financial-Authority": protectedMetricRollupFinancialAuthority,
      "X-SCRIMED-Securities-Authority": protectedMetricRollupSecuritiesAuthority
    }
  });
}
