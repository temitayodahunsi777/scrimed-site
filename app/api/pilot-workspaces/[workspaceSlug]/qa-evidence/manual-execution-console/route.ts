import { NextResponse } from "next/server";
import {
  deriveQaManualExecutionConsoleDecision,
  qaManualExecutionConsoleBoundary,
  qaManualExecutionConsoleStatus
} from "../../../../../lib/qaManualExecutionConsole";
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
    namespace: "qa-manual-execution-console",
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
    "X-SCRIMED-QA-Execution-Console": "protected-state-verification",
    "X-SCRIMED-QA-Proof": "retained-packet-gated",
    "X-SCRIMED-Security-Certification": "not-security-certified"
  };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Manual QA Execution Console checks are temporarily rate limited."
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
  const decision = deriveQaManualExecutionConsoleDecision({
    auditEvents,
    manualQaEvidencePackets,
    workspaceSlug: workspace.slug
  });

  return NextResponse.json(
    {
      service: "scrimed-manual-aal2-qa-execution-console",
      status: qaManualExecutionConsoleStatus,
      workspace,
      decision: unavailableSections.length > 0
        ? {
            ...decision,
            state: "blocked-boundary-review",
            protectedExecutionRequired: true,
            buyerProofReleaseReady: false,
            nextAction:
              "Restore protected Manual QA Evidence and audit visibility before dispatching or releasing buyer proof.",
            buyerSafeClaim:
              "SCRIMED cannot operate the Manual QA Execution Console while protected evidence sections are unavailable."
          }
        : decision,
      packetCount: manualQaEvidencePackets.length,
      auditSignalCount: decision.auditSignalCount,
      unavailableSections,
      boundary: qaManualExecutionConsoleBoundary
    },
    { headers }
  );
}
