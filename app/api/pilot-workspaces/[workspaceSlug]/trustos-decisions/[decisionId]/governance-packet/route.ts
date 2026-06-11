import { NextResponse } from "next/server";
import {
  getAccessiblePilotWorkspace,
  getAuthenticatedGovernanceContext,
  getTrustOSDecision,
  listTrustOSReviewEvents,
  recordTrustOSGovernancePacketDownload
} from "../../../../../../lib/protectedPilotStore";
import {
  buildTrustOSGovernancePacket,
  trustOSDecisionLedgerBoundary,
  trustOSDecisionLedgerNoStoreHeaders
} from "../../../../../../lib/trustOSDecisionLedger";
import {
  enforceRequestRateLimit,
  rateLimitHeaders
} from "../../../../../../lib/requestRateLimit";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ workspaceSlug: string; decisionId: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "trustos-governance-packet",
    limit: 40,
    windowSeconds: 600
  });
  const headers = { ...trustOSDecisionLedgerNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: { code: "rate-limit-exceeded", message: "TrustOS governance packet downloads are temporarily rate limited." } },
      { status: 429, headers }
    );
  }

  const context = await getAuthenticatedGovernanceContext(request);

  if (!context.ok) {
    return NextResponse.json(
      { error: { code: context.code, message: context.message }, boundary: trustOSDecisionLedgerBoundary },
      { status: context.status, headers }
    );
  }

  const { workspaceSlug, decisionId } = await params;
  const workspaceResult = await getAccessiblePilotWorkspace(context.client, workspaceSlug);

  if (workspaceResult.error || !workspaceResult.workspace) {
    return NextResponse.json(
      { error: { code: "pilot-workspace-not-found", message: "No governed tenant workspace is available for this member and slug." } },
      { status: 404, headers }
    );
  }

  const decisionResult = await getTrustOSDecision(context.client, workspaceResult.workspace.id, decisionId);

  if (decisionResult.error || !decisionResult.decision) {
    return NextResponse.json(
      { error: { code: "trustos-decision-not-found", message: "No tenant-scoped TrustOS decision is available for this ledger ID." } },
      { status: 404, headers }
    );
  }

  const reviews = await listTrustOSReviewEvents(
    context.client,
    workspaceResult.workspace.id,
    decisionResult.decision.id
  );

  if (reviews.error) {
    return NextResponse.json(
      { error: { code: "trustos-review-query-failed", message: "The packet was not released because review evidence could not be retrieved." } },
      { status: 502, headers }
    );
  }

  const audit = await recordTrustOSGovernancePacketDownload(
    context.client,
    workspaceSlug,
    decisionResult.decision.id
  );

  if (audit.error) {
    return NextResponse.json(
      { error: { code: "trustos-packet-audit-failed", message: "The governance packet was not released because its append-only audit event could not be committed." } },
      { status: 502, headers }
    );
  }

  const packet = buildTrustOSGovernancePacket(
    workspaceResult.workspace,
    decisionResult.decision,
    reviews.events
  );
  const safeWorkspaceSlug = workspaceResult.workspace.slug.replace(/[^a-z0-9-]/gi, "-");

  return new NextResponse(packet, {
    headers: {
      ...headers,
      "Content-Disposition": `attachment; filename="scrimed-${safeWorkspaceSlug}-${decisionId}-trustos-governance-packet.md"`,
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Governance-Packet-Audited": "true"
    }
  });
}
