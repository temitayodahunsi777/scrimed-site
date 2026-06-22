import { NextResponse } from "next/server";
import {
  deriveQaBuyerProofReleaseDecision,
  qaBuyerProofReleaseBoundary,
  qaBuyerProofReleaseStatus
} from "../../../../../lib/qaBuyerProofRelease";
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
    namespace: "qa-buyer-proof-release",
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
    "X-SCRIMED-QA-Buyer-Proof-Release": "retained-packet-gated",
    "X-SCRIMED-QA-Proof": "buyer-proof-release-gated",
    "X-SCRIMED-Security-Certification": "not-security-certified"
  };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "QA Buyer Proof Release checks are temporarily rate limited."
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
  const release = deriveQaBuyerProofReleaseDecision({
    auditEvents,
    manualQaEvidencePackets,
    workspaceSlug: workspace.slug
  });

  return NextResponse.json(
    {
      service: "scrimed-qa-buyer-proof-release",
      status: qaBuyerProofReleaseStatus,
      workspace,
      release: unavailableSections.length > 0
        ? {
            ...release,
            state: "release-review-required",
            protectedVerificationRequired: true,
            buyerDiligenceExportAllowed: false,
            missingEvidence: [
              ...release.missingEvidence,
              ...unavailableSections
            ],
            buyerSafeClaim:
              "SCRIMED cannot release retained QA proof while protected evidence sections are unavailable.",
            nextAction:
              "Restore protected evidence visibility, then rerun Buyer Proof Release before Buyer Diligence export."
          }
        : release,
      packetCount: manualQaEvidencePackets.length,
      auditSignalCount: release.auditSignalCount,
      unavailableSections,
      boundary: qaBuyerProofReleaseBoundary
    },
    { headers }
  );
}
