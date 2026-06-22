import { NextResponse } from "next/server";
import {
  getQaManualExecutionConsoleSummary,
  qaManualExecutionConsoleBoundary,
  qaManualExecutionConsoleStatus
} from "../../../lib/qaManualExecutionConsole";

export const dynamic = "force-dynamic";

const headers = {
  "Cache-Control": "no-store",
  "X-SCRIMED-AAL2-Execution": "human-required-not-code-bypass",
  "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
  "X-SCRIMED-Data-Boundary": "synthetic-only",
  "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
  "X-SCRIMED-QA-Execution-Console": "public-summary-only",
  "X-SCRIMED-QA-Proof": "retained-packet-required",
  "X-SCRIMED-Security-Certification": "not-security-certified"
};

export async function GET() {
  const summary = getQaManualExecutionConsoleSummary();

  return NextResponse.json(
    {
      service: summary.service,
      status: qaManualExecutionConsoleStatus,
      consoleState: summary.consoleState,
      publicSummaryOnly: true,
      protectedExecutionRequired: true,
      buyerProofReleaseReady: false,
      route: summary.route,
      briefRoute: summary.briefRoute,
      protectedRoute: summary.protectedRoute,
      protectedWorkspaceRoute: summary.protectedWorkspaceRoute,
      workflowCount: summary.workflowCount,
      stageCount: summary.stageCount,
      hardStopCount: summary.hardStopCount,
      blockedAuthorityClaimCount: summary.blockedAuthorityClaimCount,
      workflows: summary.workflows,
      stages: summary.decision.stages,
      hardStops: summary.hardStops,
      blockedAuthorityClaims: summary.blockedAuthorityClaims,
      boundary: qaManualExecutionConsoleBoundary
    },
    { headers }
  );
}
