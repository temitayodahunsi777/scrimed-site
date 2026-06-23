import type { SupabaseClient } from "@supabase/supabase-js";
import {
  deriveProtectedDistributionLockboxWorkflow
} from "../../../../lib/protectedDistributionLockbox";
import {
  deriveProtectedEvidenceRoomAccessLogReconciliationWorkflow
} from "../../../../lib/protectedEvidenceRoomAccessLogReconciliation";
import {
  deriveProtectedEvidenceRoomRecipientAttestationWorkflow
} from "../../../../lib/protectedEvidenceRoomRecipientAttestations";
import {
  deriveProtectedExternalApprovalEvidenceWorkflow
} from "../../../../lib/protectedExternalApprovalEvidence";
import { deriveProtectedFinanceMethodologyWorkflow } from "../../../../lib/protectedFinanceMethodology";
import {
  deriveProtectedBuyerReleaseControlRun
} from "../../../../lib/protectedBuyerReleaseControlRun";
import type { PilotWorkspaceRecord } from "../../../../lib/protectedPilotWorkspace";
import {
  deriveProtectedNamedReviewerSignoffWorkflow
} from "../../../../lib/protectedNamedReviewerSignoffs";
import {
  deriveProtectedReleaseAuthorityAttestationWorkflow
} from "../../../../lib/protectedReleaseAuthorityAttestations";
import {
  deriveProtectedReleaseDecisionWorkflow
} from "../../../../lib/protectedReleaseDecisionWorkflow";
import {
  listPilotAuditEvents,
  listProtectedBoardScorecards,
  listProtectedDistributionLockboxes,
  listProtectedEvidenceRoomAccessLogReconciliations,
  listProtectedEvidenceRoomRecipientAttestations,
  listProtectedExternalApprovalEvidenceReferences,
  listProtectedFinanceMethodologyGates,
  listProtectedNamedReviewerSignoffs,
  listProtectedReleaseAuthorityAttestations,
  listProtectedReleaseDecisions
} from "../../../../lib/protectedPilotStore";

export async function loadProtectedBuyerReleaseControlRun(
  client: SupabaseClient,
  workspace: PilotWorkspaceRecord
) {
  const [
    auditResult,
    scorecardsResult,
    financeRecordsResult,
    externalRecordsResult,
    releaseRecordsResult,
    signoffRecordsResult,
    lockboxRecordsResult,
    authorityRecordsResult,
    recipientRecordsResult,
    accessLogRecordsResult
  ] = await Promise.all([
    listPilotAuditEvents(client, workspace.id),
    listProtectedBoardScorecards(client, workspace.id),
    listProtectedFinanceMethodologyGates(client, workspace.id),
    listProtectedExternalApprovalEvidenceReferences(client, workspace.id),
    listProtectedReleaseDecisions(client, workspace.id),
    listProtectedNamedReviewerSignoffs(client, workspace.id),
    listProtectedDistributionLockboxes(client, workspace.id),
    listProtectedReleaseAuthorityAttestations(client, workspace.id),
    listProtectedEvidenceRoomRecipientAttestations(client, workspace.id),
    listProtectedEvidenceRoomAccessLogReconciliations(client, workspace.id)
  ]);
  const unavailableSections = [
    auditResult.error ? "Append-only pilot audit events could not be retrieved." : "",
    scorecardsResult.error
      ? "Protected board scorecards could not be retrieved for finance context."
      : "",
    financeRecordsResult.error ? "Protected finance methodology gates could not be retrieved." : "",
    externalRecordsResult.error
      ? "Protected external approval evidence references could not be retrieved."
      : "",
    releaseRecordsResult.error ? "Protected release decisions could not be retrieved." : "",
    signoffRecordsResult.error ? "Protected named reviewer signoffs could not be retrieved." : "",
    lockboxRecordsResult.error ? "Protected distribution lockboxes could not be retrieved." : "",
    authorityRecordsResult.error
      ? "Protected release authority attestations could not be retrieved."
      : "",
    recipientRecordsResult.error
      ? "Protected evidence-room recipient attestations could not be retrieved."
      : "",
    accessLogRecordsResult.error
      ? "Protected evidence-room access-log reconciliations could not be retrieved."
      : ""
  ].filter(Boolean);
  const financeWorkflow = deriveProtectedFinanceMethodologyWorkflow({
    records: financeRecordsResult.error ? [] : financeRecordsResult.records,
    scorecards: scorecardsResult.error ? [] : scorecardsResult.scorecards,
    unavailableSections: unavailableSections.filter((section) => section.includes("finance"))
  });
  const externalApprovalWorkflow = deriveProtectedExternalApprovalEvidenceWorkflow({
    records: externalRecordsResult.error ? [] : externalRecordsResult.records,
    financeGateRecords: financeRecordsResult.error ? [] : financeRecordsResult.records,
    financeWorkflow,
    unavailableSections: unavailableSections.filter((section) => section.includes("external"))
  });
  const releaseDecisionWorkflow = deriveProtectedReleaseDecisionWorkflow({
    externalWorkflow: externalApprovalWorkflow,
    records: releaseRecordsResult.error ? [] : releaseRecordsResult.records,
    unavailableSections
  });
  const namedReviewerWorkflow = deriveProtectedNamedReviewerSignoffWorkflow({
    records: signoffRecordsResult.error ? [] : signoffRecordsResult.records,
    releaseWorkflow: releaseDecisionWorkflow,
    unavailableSections
  });
  const distributionLockboxWorkflow = deriveProtectedDistributionLockboxWorkflow({
    records: lockboxRecordsResult.error ? [] : lockboxRecordsResult.records,
    signoffWorkflow: namedReviewerWorkflow,
    unavailableSections
  });
  const releaseAuthorityWorkflow = deriveProtectedReleaseAuthorityAttestationWorkflow({
    lockboxWorkflow: distributionLockboxWorkflow,
    records: authorityRecordsResult.error ? [] : authorityRecordsResult.records,
    unavailableSections
  });
  const recipientWorkflow = deriveProtectedEvidenceRoomRecipientAttestationWorkflow({
    records: recipientRecordsResult.error ? [] : recipientRecordsResult.records,
    releaseAuthorityWorkflow,
    unavailableSections
  });
  const accessLogWorkflow = deriveProtectedEvidenceRoomAccessLogReconciliationWorkflow({
    records: accessLogRecordsResult.error ? [] : accessLogRecordsResult.records,
    recipientWorkflow,
    unavailableSections
  });
  const run = deriveProtectedBuyerReleaseControlRun({
    accessLogWorkflow,
    auditEvents: auditResult.error ? [] : auditResult.events,
    distributionLockboxWorkflow,
    externalApprovalWorkflow,
    namedReviewerWorkflow,
    recipientWorkflow,
    releaseAuthorityWorkflow,
    releaseDecisionWorkflow,
    unavailableSections,
    workspace
  });

  return {
    accessLogWorkflow,
    auditEvents: auditResult.error ? [] : auditResult.events,
    distributionLockboxWorkflow,
    externalApprovalWorkflow,
    financeWorkflow,
    namedReviewerWorkflow,
    recipientWorkflow,
    releaseAuthorityWorkflow,
    releaseDecisionWorkflow,
    run,
    unavailableSections
  };
}
