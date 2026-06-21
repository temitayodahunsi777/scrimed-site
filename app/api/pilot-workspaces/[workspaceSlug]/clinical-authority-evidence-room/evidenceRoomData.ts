import type { SupabaseClient } from "@supabase/supabase-js";
import { deriveClinicalActivationApprovalWorkflow } from "../../../../lib/clinicalActivationApprovals";
import { deriveClinicalActivationDossier } from "../../../../lib/clinicalActivationDossier";
import {
  deriveProtectedClinicalAuthorityEvidenceRoom,
  type ProtectedClinicalAuthorityEvidenceRoom
} from "../../../../lib/protectedClinicalAuthorityEvidenceRoom";
import { deriveProtectedExternalApprovalEvidenceWorkflow } from "../../../../lib/protectedExternalApprovalEvidence";
import { deriveProtectedFinanceMethodologyWorkflow } from "../../../../lib/protectedFinanceMethodology";
import {
  listClinicalActivationApprovals,
  listCommandIntelligenceSnapshots,
  listPilotAuditEvents,
  listPilotDemoReadinessSnapshots,
  listPilotSessions,
  listProtectedBoardScorecards,
  listProtectedEvidenceRoomProviderAdapters,
  listProtectedExternalApprovalEvidenceReferences,
  listProtectedFinanceMethodologyGates,
  listProtectedProcurementEvidenceRegistryRecords,
  listProtectedProviderSecurityReviews,
  listQaManualRunEvidencePackets
} from "../../../../lib/protectedPilotStore";
import type { PilotWorkspaceRecord } from "../../../../lib/protectedPilotWorkspace";
import { deriveProtectedProcurementEvidenceRegistryWorkflow } from "../../../../lib/protectedProcurementEvidenceRegistry";
import { deriveProtectedProviderSecurityReviewWorkflow } from "../../../../lib/protectedProviderSecurityReviews";

export type ProtectedClinicalAuthorityEvidenceRoomBundle = {
  room: ProtectedClinicalAuthorityEvidenceRoom;
};

export async function loadProtectedClinicalAuthorityEvidenceRoom(
  client: SupabaseClient,
  workspace: PilotWorkspaceRecord
): Promise<ProtectedClinicalAuthorityEvidenceRoomBundle> {
  const [
    sessionsResult,
    auditResult,
    snapshotsResult,
    manualQaEvidenceResult,
    commandSnapshotsResult,
    approvalsResult,
    scorecardsResult,
    financeRecordsResult,
    externalRecordsResult,
    providerAdapterResult,
    providerSecurityResult,
    procurementResult
  ] = await Promise.all([
    listPilotSessions(client, workspace.id),
    listPilotAuditEvents(client, workspace.id),
    listPilotDemoReadinessSnapshots(client, workspace.id),
    listQaManualRunEvidencePackets(client, workspace.id),
    listCommandIntelligenceSnapshots(client, workspace.id),
    listClinicalActivationApprovals(client, workspace.id),
    listProtectedBoardScorecards(client, workspace.id),
    listProtectedFinanceMethodologyGates(client, workspace.id),
    listProtectedExternalApprovalEvidenceReferences(client, workspace.id),
    listProtectedEvidenceRoomProviderAdapters(client, workspace.id),
    listProtectedProviderSecurityReviews(client, workspace.id),
    listProtectedProcurementEvidenceRegistryRecords(client, workspace.id)
  ]);
  const unavailableSections = [
    sessionsResult.error ? "Durable synthetic sessions could not be retrieved." : "",
    auditResult.error ? "Append-only pilot audit events could not be retrieved." : "",
    snapshotsResult.error ? "Demo readiness snapshots could not be retrieved." : "",
    manualQaEvidenceResult.error ? "Manual QA evidence packets could not be retrieved." : "",
    commandSnapshotsResult.error ? "Command Intelligence snapshots could not be retrieved." : "",
    approvalsResult.error
      ? "Clinical activation approval history could not be retrieved; keep live-care authority blocked."
      : "",
    scorecardsResult.error
      ? "Protected board scorecards could not be retrieved for finance methodology context."
      : "",
    financeRecordsResult.error
      ? "Protected finance methodology gates could not be retrieved for reimbursement and claims boundaries."
      : "",
    externalRecordsResult.error
      ? "Protected external approval evidence could not be retrieved; authority remains blocked."
      : "",
    providerAdapterResult.error
      ? "Protected evidence-room provider adapters could not be retrieved for connector readiness."
      : "",
    providerSecurityResult.error
      ? "Protected provider security reviews could not be retrieved; PHI and security authority remain blocked."
      : "",
    procurementResult.error
      ? "Protected procurement evidence registry could not be retrieved; procurement and certification posture remain blocked."
      : ""
  ].filter(Boolean);
  const sessions = sessionsResult.error ? [] : sessionsResult.sessions;
  const auditEvents = auditResult.error ? [] : auditResult.events;
  const demoSnapshots = snapshotsResult.error ? [] : snapshotsResult.snapshots;
  const manualQaEvidencePackets = manualQaEvidenceResult.error
    ? []
    : manualQaEvidenceResult.packets;
  const commandSnapshots = commandSnapshotsResult.error ? [] : commandSnapshotsResult.snapshots;
  const dossier = deriveClinicalActivationDossier({
    workspace,
    sessions,
    auditEvents,
    demoSnapshots,
    manualQaEvidencePackets,
    commandSnapshots,
    unavailableSections: unavailableSections.filter(
      (section) =>
        !section.includes("approval history") &&
        !section.includes("finance methodology") &&
        !section.includes("external approval") &&
        !section.includes("provider") &&
        !section.includes("procurement")
    )
  });
  const approvalWorkflow = deriveClinicalActivationApprovalWorkflow({
    approvals: approvalsResult.error ? [] : approvalsResult.approvals,
    dossier,
    unavailableSections: unavailableSections.filter((section) =>
      section.includes("approval history")
    )
  });
  const financeWorkflow = deriveProtectedFinanceMethodologyWorkflow({
    records: financeRecordsResult.error ? [] : financeRecordsResult.records,
    scorecards: scorecardsResult.error ? [] : scorecardsResult.scorecards,
    unavailableSections: unavailableSections.filter(
      (section) => section.includes("finance") || section.includes("scorecards")
    )
  });
  const externalWorkflow = deriveProtectedExternalApprovalEvidenceWorkflow({
    records: externalRecordsResult.error ? [] : externalRecordsResult.records,
    financeGateRecords: financeRecordsResult.error ? [] : financeRecordsResult.records,
    financeWorkflow,
    unavailableSections: unavailableSections.filter(
      (section) => section.includes("external approval") || section.includes("finance")
    )
  });
  const providerSecurityWorkflow = deriveProtectedProviderSecurityReviewWorkflow({
    providerAdapterRecords: providerAdapterResult.error ? [] : providerAdapterResult.records,
    records: providerSecurityResult.error ? [] : providerSecurityResult.records,
    unavailableSections: unavailableSections.filter((section) =>
      section.includes("provider")
    )
  });
  const procurementWorkflow = deriveProtectedProcurementEvidenceRegistryWorkflow({
    providerSecurityReviewRecords: providerSecurityResult.error ? [] : providerSecurityResult.records,
    records: procurementResult.error ? [] : procurementResult.records,
    unavailableSections: unavailableSections.filter(
      (section) => section.includes("procurement") || section.includes("security")
    )
  });
  const room = deriveProtectedClinicalAuthorityEvidenceRoom({
    approvalWorkflow,
    auditEvents,
    dossier,
    externalWorkflow,
    procurementWorkflow,
    providerSecurityWorkflow,
    unavailableSections,
    workspace
  });

  return { room };
}
