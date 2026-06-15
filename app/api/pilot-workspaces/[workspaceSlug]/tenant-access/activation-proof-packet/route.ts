import { NextResponse } from "next/server";
import {
  getAuthenticatedGovernanceContext,
  listAgentWorkspaceGovernanceLedger,
  recordTenantActivationProofPacketDownload
} from "../../../../../lib/protectedPilotStore";
import {
  buildTenantActivationProofPacket,
  protectedPilotBoundary,
  protectedPilotNoStoreHeaders,
  type TenantActivationProofPacket
} from "../../../../../lib/protectedPilotWorkspace";
import { enforceRequestRateLimit, rateLimitHeaders } from "../../../../../lib/requestRateLimit";
import { findWorkspaceActivationGovernanceLedgerRecords } from "../../../../../lib/workspaceActivationGovernance";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ workspaceSlug: string }>;
};

function statusForActivationPacketError(message: string) {
  if (message.includes("role-denied") || message.includes("admin-required")) return 403;
  if (message.includes("workspace-not-found")) return 404;
  return 502;
}

export async function GET(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "tenant-activation-proof-packet-download",
    limit: 20,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Protected pilot activation proof packet downloads are temporarily rate limited."
        }
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
  const result = await recordTenantActivationProofPacketDownload(context.client, workspaceSlug);

  if (result.error || !result.packet) {
    const message = result.error?.message ?? "";

    return NextResponse.json(
      {
        error: {
          code: "activation-proof-packet-audit-failed",
          message:
            "The activation proof packet was not released because its append-only lifecycle event could not be committed."
        },
        boundary: protectedPilotBoundary
      },
      { status: statusForActivationPacketError(message), headers }
    );
  }

  const packet = result.packet as TenantActivationProofPacket;
  const ledgerResult = await listAgentWorkspaceGovernanceLedger(context.client, packet.workspaceId);
  const activationGovernanceLedgerRecords = ledgerResult.error
    ? []
    : findWorkspaceActivationGovernanceLedgerRecords(ledgerResult.ledgerRecords);
  const markdown = buildTenantActivationProofPacket(
    {
      ...packet,
      activationGovernanceLedgerRecords
    },
    new URL(request.url).origin
  );
  const safeWorkspaceSlug = packet.workspaceSlug.replace(/[^a-z0-9-]/gi, "-").slice(0, 80) || "workspace";

  return new NextResponse(markdown, {
    headers: {
      ...headers,
      "Content-Disposition": `attachment; filename="scrimed-${safeWorkspaceSlug}-activation-proof-packet.md"`,
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Data-Boundary": "synthetic-only",
      "X-SCRIMED-Activation-Proof-Packet-Audited": "true"
    }
  });
}
