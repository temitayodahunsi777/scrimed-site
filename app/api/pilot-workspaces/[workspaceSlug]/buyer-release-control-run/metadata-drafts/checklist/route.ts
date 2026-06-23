import { NextResponse } from "next/server";
import {
  deriveProtectedBuyerReleaseDraftChecklist,
  protectedBuyerReleaseDraftChecklistBoundary
} from "../../../../../../lib/protectedBuyerReleaseDraftChecklist";
import {
  deriveProtectedBuyerReleaseGateReconciliation
} from "../../../../../../lib/protectedBuyerReleaseGateReconciliation";
import {
  deriveProtectedBuyerReleaseMetadataDrafts
} from "../../../../../../lib/protectedBuyerReleaseMetadataDrafts";
import {
  protectedBuyerReleaseControlRunStatus
} from "../../../../../../lib/protectedBuyerReleaseControlRun";
import {
  deriveProtectedBuyerReleaseRemediationPlan
} from "../../../../../../lib/protectedBuyerReleaseRemediationPlan";
import {
  getAccessiblePilotWorkspace,
  getAuthenticatedGovernanceContext
} from "../../../../../../lib/protectedPilotStore";
import {
  protectedPilotBoundary,
  protectedPilotNoStoreHeaders
} from "../../../../../../lib/protectedPilotWorkspace";
import { enforceRequestRateLimit, rateLimitHeaders } from "../../../../../../lib/requestRateLimit";
import { loadProtectedBuyerReleaseControlRun } from "../../releaseControlData";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ workspaceSlug: string }>;
};

const checklistHeaders = {
  "X-SCRIMED-Buyer-Release-Control": "protected-draft-checklist-not-release-approval",
  "X-SCRIMED-Buyer-Share": "qualified-human-review-required",
  "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
  "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
  "X-SCRIMED-Release-Authority": "not-release-approval",
  "X-SCRIMED-Security-Certification": "not-security-certified"
};

export async function GET(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "protected-buyer-release-draft-checklist-read",
    limit: 60,
    windowSeconds: 600
  });
  const headers = {
    ...protectedPilotNoStoreHeaders,
    ...checklistHeaders,
    ...rateLimitHeaders(rateLimit)
  };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Protected buyer release draft checklist reads are temporarily rate limited."
        },
        boundary: protectedBuyerReleaseDraftChecklistBoundary
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

  const data = await loadProtectedBuyerReleaseControlRun(
    context.client,
    workspaceResult.workspace
  );
  const remediationPlan = deriveProtectedBuyerReleaseRemediationPlan({
    run: data.run,
    workspace: workspaceResult.workspace
  });
  const reconciliation = deriveProtectedBuyerReleaseGateReconciliation({
    accessLogWorkflow: data.accessLogWorkflow,
    auditEvents: data.auditEvents,
    distributionLockboxWorkflow: data.distributionLockboxWorkflow,
    externalApprovalWorkflow: data.externalApprovalWorkflow,
    namedReviewerWorkflow: data.namedReviewerWorkflow,
    recipientWorkflow: data.recipientWorkflow,
    releaseAuthorityWorkflow: data.releaseAuthorityWorkflow,
    releaseDecisionWorkflow: data.releaseDecisionWorkflow,
    remediationPlan,
    run: data.run,
    workspace: workspaceResult.workspace
  });
  const metadataDrafts = deriveProtectedBuyerReleaseMetadataDrafts({
    generatedAt: new Date().toISOString(),
    reconciliation,
    workspace: workspaceResult.workspace
  });
  const draftChecklist = deriveProtectedBuyerReleaseDraftChecklist({
    metadataDrafts,
    workspace: workspaceResult.workspace
  });

  return NextResponse.json(
    {
      service: "scrimed-protected-buyer-release-draft-checklist",
      status: protectedBuyerReleaseControlRunStatus,
      workspace: workspaceResult.workspace,
      run: data.run,
      remediationPlan,
      reconciliation,
      metadataDrafts,
      draftChecklist,
      unavailableSections: data.unavailableSections,
      boundary: draftChecklist.boundary
    },
    { headers }
  );
}
