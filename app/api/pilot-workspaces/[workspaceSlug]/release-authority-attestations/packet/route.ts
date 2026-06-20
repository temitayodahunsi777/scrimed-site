import { NextResponse } from "next/server";
import { deriveProtectedExternalApprovalEvidenceWorkflow } from "../../../../../lib/protectedExternalApprovalEvidence";
import {
  protectedFinanceAdvertisingClaimsAuthority,
  protectedFinanceExternalUseAuthority,
  deriveProtectedFinanceMethodologyWorkflow
} from "../../../../../lib/protectedFinanceMethodology";
import {
  protectedMetricRollupClinicalAuthority,
  protectedMetricRollupFinancialAuthority,
  protectedMetricRollupSecuritiesAuthority
} from "../../../../../lib/protectedMetricRollups";
import {
  protectedReleaseDecisionAuthority,
  deriveProtectedReleaseDecisionWorkflow
} from "../../../../../lib/protectedReleaseDecisionWorkflow";
import {
  protectedNamedReviewerSignoffAuthority,
  protectedReviewerSignoffReleaseAuthority,
  protectedReviewerSignoffStorageAuthority,
  deriveProtectedNamedReviewerSignoffWorkflow
} from "../../../../../lib/protectedNamedReviewerSignoffs";
import {
  protectedDistributionLockboxAuthority,
  protectedDistributionLockboxReleaseAuthority,
  protectedDistributionLockboxStorageAuthority,
  deriveProtectedDistributionLockboxWorkflow
} from "../../../../../lib/protectedDistributionLockbox";
import {
  buildProtectedReleaseAuthorityAttestationPacket,
  deriveProtectedReleaseAuthorityAttestationWorkflow,
  protectedReleaseAuthorityAttestationAuthority,
  protectedReleaseAuthorityAttestationBoundary,
  protectedReleaseAuthorityAttestationPacketProofStackStatus,
  protectedReleaseAuthorityAttestationStorageAuthority,
  protectedReleaseAuthorityReleaseAuthority
} from "../../../../../lib/protectedReleaseAuthorityAttestations";
import {
  getAccessiblePilotWorkspace,
  getAuthenticatedGovernanceContext,
  listProtectedBoardScorecards,
  listProtectedDistributionLockboxes,
  listProtectedExternalApprovalEvidenceReferences,
  listProtectedFinanceMethodologyGates,
  listProtectedNamedReviewerSignoffs,
  listProtectedReleaseAuthorityAttestations,
  listProtectedReleaseDecisions,
  recordProtectedReleaseAuthorityAttestationPacketDownload
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

  if (message.includes("workspace")) return 404;
  if (message.includes("does not exist") || message.includes("schema cache")) return 503;

  return 502;
}

export async function GET(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "protected-release-authority-attestation-packet-download",
    limit: 12,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Protected release authority attestation packet downloads are temporarily rate limited."
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
  const [
    scorecardsResult,
    financeRecordsResult,
    externalRecordsResult,
    releaseDecisionRecordsResult,
    signoffRecordsResult,
    lockboxRecordsResult,
    attestationRecordsResult
  ] = await Promise.all([
    listProtectedBoardScorecards(context.client, workspace.id),
    listProtectedFinanceMethodologyGates(context.client, workspace.id),
    listProtectedExternalApprovalEvidenceReferences(context.client, workspace.id),
    listProtectedReleaseDecisions(context.client, workspace.id),
    listProtectedNamedReviewerSignoffs(context.client, workspace.id),
    listProtectedDistributionLockboxes(context.client, workspace.id),
    listProtectedReleaseAuthorityAttestations(context.client, workspace.id)
  ]);
  const unavailableSections = [
    scorecardsResult.error
      ? "Protected board scorecards could not be retrieved for this packet."
      : "",
    financeRecordsResult.error
      ? "Protected finance methodology gate history could not be retrieved for this packet."
      : "",
    externalRecordsResult.error
      ? "Protected external approval evidence references could not be retrieved for this packet."
      : "",
    releaseDecisionRecordsResult.error
      ? "Protected release decision history could not be retrieved for this packet."
      : "",
    signoffRecordsResult.error
      ? "Protected named reviewer sign-off history could not be retrieved for this packet."
      : "",
    lockboxRecordsResult.error
      ? "Protected distribution lockbox history could not be retrieved for this packet."
      : "",
    attestationRecordsResult.error
      ? "Protected release authority attestations could not be retrieved for this packet."
      : ""
  ].filter(Boolean);
  const financeWorkflow = deriveProtectedFinanceMethodologyWorkflow({
    records: financeRecordsResult.error ? [] : financeRecordsResult.records,
    scorecards: scorecardsResult.error ? [] : scorecardsResult.scorecards,
    unavailableSections: unavailableSections.filter((section) => section.includes("finance"))
  });
  const externalWorkflow = deriveProtectedExternalApprovalEvidenceWorkflow({
    records: externalRecordsResult.error ? [] : externalRecordsResult.records,
    financeGateRecords: financeRecordsResult.error ? [] : financeRecordsResult.records,
    financeWorkflow,
    unavailableSections: unavailableSections.filter((section) => section.includes("external"))
  });
  const releaseWorkflow = deriveProtectedReleaseDecisionWorkflow({
    externalWorkflow,
    records: releaseDecisionRecordsResult.error ? [] : releaseDecisionRecordsResult.records,
    unavailableSections: unavailableSections.filter((section) => section.includes("release decision"))
  });
  const signoffWorkflow = deriveProtectedNamedReviewerSignoffWorkflow({
    records: signoffRecordsResult.error ? [] : signoffRecordsResult.records,
    releaseWorkflow,
    unavailableSections: unavailableSections.filter((section) => section.includes("sign-off"))
  });
  const lockboxWorkflow = deriveProtectedDistributionLockboxWorkflow({
    records: lockboxRecordsResult.error ? [] : lockboxRecordsResult.records,
    signoffWorkflow,
    unavailableSections: unavailableSections.filter((section) => section.includes("lockbox"))
  });
  const workflow = deriveProtectedReleaseAuthorityAttestationWorkflow({
    lockboxWorkflow,
    records: attestationRecordsResult.error ? [] : attestationRecordsResult.records,
    unavailableSections
  });
  const auditResult = await recordProtectedReleaseAuthorityAttestationPacketDownload(
    context.client,
    workspace.slug,
    {
      attestationCount: workflow.summary.attestationCount,
      readyForReviewCount: workflow.summary.readyForReviewCount,
      releaseDisabledCount: workflow.summary.releaseDisabledCount,
      requiredAuthorityDomainCount: workflow.summary.requiredAuthorityDomainCount,
      linkedAuthorityDomainCount: workflow.summary.linkedAuthorityDomainCount,
      missingAuthorityDomainCount: workflow.summary.missingAuthorityDomainCount,
      readyLockboxCount: workflow.summary.readyLockboxCount,
      authorityState: workflow.authorityState,
      releaseState: workflow.releaseState,
      attestationAuthority: protectedReleaseAuthorityAttestationAuthority,
      releaseAuthority: protectedReleaseAuthorityReleaseAuthority,
      storageAuthority: protectedReleaseAuthorityAttestationStorageAuthority,
      lockboxAuthority: protectedDistributionLockboxAuthority,
      lockboxReleaseAuthority: protectedDistributionLockboxReleaseAuthority,
      lockboxStorageAuthority: protectedDistributionLockboxStorageAuthority,
      signoffAuthority: protectedNamedReviewerSignoffAuthority,
      signoffReleaseAuthority: protectedReviewerSignoffReleaseAuthority,
      signoffStorageAuthority: protectedReviewerSignoffStorageAuthority,
      releaseDecisionAuthority: protectedReleaseDecisionAuthority,
      financeExternalUseAuthority: protectedFinanceExternalUseAuthority,
      financialReportingAuthority: protectedMetricRollupFinancialAuthority,
      securitiesAuthority: protectedMetricRollupSecuritiesAuthority,
      advertisingClaimsAuthority: protectedFinanceAdvertisingClaimsAuthority,
      clinicalExecutionAuthority: protectedMetricRollupClinicalAuthority
    }
  );

  if (auditResult.error || !auditResult.eventId) {
    const message = auditResult.error?.message ?? "";

    return NextResponse.json(
      {
        error: {
          code: "protected-release-authority-attestation-packet-audit-failed",
          message:
            "The protected release authority attestation packet was not released because the audit event could not be committed."
        },
        boundary: protectedReleaseAuthorityAttestationBoundary
      },
      { status: statusForPacketError(message), headers }
    );
  }

  const generatedAt = new Date().toISOString();
  const packet = buildProtectedReleaseAuthorityAttestationPacket({
    actorUserId: context.user.id,
    auditEventId: auditResult.eventId,
    generatedAt,
    workflow,
    workspace
  });
  const safeWorkspaceSlug = workspace.slug.replace(/[^a-z0-9-]/gi, "-").slice(0, 80) || "workspace";

  return new NextResponse(packet, {
    headers: {
      ...headers,
      "Content-Disposition": `attachment; filename="scrimed-${safeWorkspaceSlug}-release-authority-attestations.md"`,
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Proof-Stack": protectedReleaseAuthorityAttestationPacketProofStackStatus,
      "X-SCRIMED-Attestation-Authority": protectedReleaseAuthorityAttestationAuthority,
      "X-SCRIMED-Release-Authority": protectedReleaseAuthorityReleaseAuthority,
      "X-SCRIMED-Storage-Authority": protectedReleaseAuthorityAttestationStorageAuthority,
      "X-SCRIMED-Release-State": "release-disabled",
      "X-SCRIMED-Financial-Authority": protectedMetricRollupFinancialAuthority,
      "X-SCRIMED-Securities-Authority": protectedMetricRollupSecuritiesAuthority,
      "X-SCRIMED-Advertising-Claims-Authority": protectedFinanceAdvertisingClaimsAuthority,
      "X-SCRIMED-Clinical-Care-Authority": protectedMetricRollupClinicalAuthority
    }
  });
}
