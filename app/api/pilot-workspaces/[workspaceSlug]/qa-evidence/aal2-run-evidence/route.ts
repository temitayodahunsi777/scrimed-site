import { NextResponse } from "next/server";
import {
  deriveQaAal2RunEvidencePackage,
  qaAal2RunEvidenceBoundary,
  qaAal2RunEvidenceStatus
} from "../../../../../lib/qaAal2RunEvidence";
import {
  getAccessiblePilotWorkspace,
  getAuthenticatedGovernanceContext,
  listPilotAuditEvents,
  listQaManualRunEvidencePackets
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

export async function GET(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "qa-aal2-run-evidence",
    limit: 30,
    windowSeconds: 600
  });
  const headers = {
    ...protectedPilotNoStoreHeaders,
    ...rateLimitHeaders(rateLimit),
    "X-SCRIMED-AAL2-Execution": "human-required-not-code-bypass",
    "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
    "X-SCRIMED-Data-Boundary": "synthetic-only",
    "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
    "X-SCRIMED-QA-Evidence": "aal2-run-evidence-protected-state",
    "X-SCRIMED-QA-Proof": "retained-packet-gated",
    "X-SCRIMED-Security-Certification": "not-security-certified"
  };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "AAL2 run evidence checks are temporarily rate limited."
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
  const [manualQaEvidenceResult, auditResult] = await Promise.all([
    listQaManualRunEvidencePackets(context.client, workspace.id),
    listPilotAuditEvents(context.client, workspace.id)
  ]);
  const unavailableSections = [
    manualQaEvidenceResult.error ? "Manual QA evidence packets could not be retrieved." : "",
    auditResult.error ? "Append-only pilot audit events could not be retrieved." : ""
  ].filter(Boolean);
  const manualQaEvidencePackets = manualQaEvidenceResult.error
    ? []
    : manualQaEvidenceResult.packets;
  const auditEvents = auditResult.error ? [] : auditResult.events;
  const evidencePackage = deriveQaAal2RunEvidencePackage({
    auditEvents,
    manualQaEvidencePackets,
    workspaceSlug: workspace.slug,
    evidenceUnavailable: unavailableSections.length > 0
  });

  return NextResponse.json(
    {
      service: "scrimed-aal2-synthetic-qa-run-evidence",
      status: qaAal2RunEvidenceStatus,
      workspace,
      evidencePackage,
      packetCount: manualQaEvidencePackets.length,
      auditSignalCount: evidencePackage.auditSignalCount,
      unavailableSections,
      boundary: qaAal2RunEvidenceBoundary
    },
    { headers }
  );
}
