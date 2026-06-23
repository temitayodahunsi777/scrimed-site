import { NextResponse } from "next/server";
import {
  getAuthenticatedGovernanceContext,
  recordTenantInvitationPacketDownload
} from "../../../../../../../lib/protectedPilotStore";
import {
  buildTenantInvitationOnboardingPacket,
  protectedPilotBoundary,
  protectedPilotNoStoreHeaders,
  type TenantInvitationPacket
} from "../../../../../../../lib/protectedPilotWorkspace";
import { enforceRequestRateLimit, rateLimitHeaders } from "../../../../../../../lib/requestRateLimit";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ workspaceSlug: string; invitationId: string }>;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function statusForPacketError(message: string) {
  if (message.includes("tenant-access-invitation-not-found")) return 404;
  if (message.includes("prohibited-identity-lifecycle-data")) return 422;
  if (message.includes("role-denied") || message.includes("admin-required")) return 403;
  return 502;
}

function packetErrorMessage(message: string) {
  if (message.includes("tenant-access-invitation-not-found")) {
    return "The invitation record was not found, is no longer pending, is expired, or is outside this tenant.";
  }

  if (message.includes("prohibited-identity-lifecycle-data")) {
    return "Invitation onboarding packets cannot include PHI or clinical details.";
  }

  return "The onboarding packet was not released because its append-only audit event could not be committed.";
}

export async function GET(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "tenant-invitation-packet-download",
    limit: 20,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Protected pilot onboarding packet downloads are temporarily rate limited."
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

  const { workspaceSlug, invitationId } = await params;

  if (!uuidPattern.test(invitationId)) {
    return NextResponse.json(
      {
        error: {
          code: "invalid-tenant-invitation",
          message: "A valid invitation identity is required before an onboarding packet can be generated."
        },
        boundary: protectedPilotBoundary
      },
      { status: 422, headers }
    );
  }

  const result = await recordTenantInvitationPacketDownload(context.client, workspaceSlug, invitationId);

  if (result.error || !result.packet) {
    const message = result.error?.message ?? "";

    return NextResponse.json(
      {
        error: {
          code: message.includes("tenant-access-invitation-not-found")
            ? "tenant-access-invitation-not-found"
            : "invitation-packet-audit-failed",
          message: packetErrorMessage(message)
        },
        boundary: protectedPilotBoundary
      },
      { status: statusForPacketError(message), headers }
    );
  }

  const packet = result.packet as TenantInvitationPacket;
  const markdown = buildTenantInvitationOnboardingPacket(packet, new URL(request.url).origin);
  const safeEmailPrefix = packet.email.split("@")[0]?.replace(/[^a-z0-9-]/gi, "-").slice(0, 48) || "invitee";

  return new NextResponse(markdown, {
    headers: {
      ...headers,
      "Content-Disposition": `attachment; filename="scrimed-${safeEmailPrefix}-pilot-onboarding-packet.md"`,
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Data-Boundary": "synthetic-only",
      "X-SCRIMED-Onboarding-Packet-Audited": "true"
    }
  });
}
