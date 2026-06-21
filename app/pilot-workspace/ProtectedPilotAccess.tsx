"use client";

import { createClient, type Session, type User } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import type {
  PilotAuditEventRecord,
  PilotSessionRecord,
  PilotWorkspaceRecord
} from "../lib/protectedPilotWorkspace";
import type {
  PilotDemoReadinessSnapshotRecord,
  TenantSessionVerificationReadiness
} from "../lib/pilotDemoReadiness";
import {
  commandIntelligenceSnapshotOperatorAttestation,
  type CommandIntelligenceSnapshotRecord
} from "../lib/commandIntelligenceHub";
import PasskeyManagementPanel from "../components/PasskeyManagementPanel";
import AgentWorkspaceDashboardPanel from "./AgentWorkspaceDashboardPanel";
import BuyerPilotRoomPanel from "./BuyerPilotRoomPanel";
import ClinicalActivationApprovalsPanel from "./ClinicalActivationApprovalsPanel";
import ClinicalActivationDossierPanel from "./ClinicalActivationDossierPanel";
import CommandIntelligenceHubPanel from "./CommandIntelligenceHubPanel";
import ManualQaEvidencePanel from "./ManualQaEvidencePanel";
import PilotDemoReadinessCommandCenter from "./PilotDemoReadinessCommandCenter";
import PilotWorkspaceVerificationPanel from "./PilotWorkspaceVerificationPanel";
import ProtectedBoardScorecardsPanel from "./ProtectedBoardScorecardsPanel";
import ProtectedAuthorityArtifactReferencePanel from "./ProtectedAuthorityArtifactReferencePanel";
import ProtectedClinicalAuthorityArtifactIntakePanel from "./ProtectedClinicalAuthorityArtifactIntakePanel";
import ProtectedClinicalAuthorityEvidenceRoomPanel from "./ProtectedClinicalAuthorityEvidenceRoomPanel";
import ProtectedClinicalAuthorityOwnerMatrixPanel from "./ProtectedClinicalAuthorityOwnerMatrixPanel";
import ProtectedDistributionLockboxPanel from "./ProtectedDistributionLockboxPanel";
import ProtectedEvidenceRoomAccessLogReconciliationPanel from "./ProtectedEvidenceRoomAccessLogReconciliationPanel";
import ProtectedEvidenceRoomProviderAdapterPanel from "./ProtectedEvidenceRoomProviderAdapterPanel";
import ProtectedEvidenceRoomRecipientAttestationPanel from "./ProtectedEvidenceRoomRecipientAttestationPanel";
import ProtectedExternalApprovalEvidencePanel from "./ProtectedExternalApprovalEvidencePanel";
import ProtectedFinanceMethodologyPanel from "./ProtectedFinanceMethodologyPanel";
import ProtectedMetricRollupsPanel from "./ProtectedMetricRollupsPanel";
import ProtectedMetricTrendsPanel from "./ProtectedMetricTrendsPanel";
import ProtectedNamedReviewerSignoffPanel from "./ProtectedNamedReviewerSignoffPanel";
import ProtectedOperatorMetricsPanel from "./ProtectedOperatorMetricsPanel";
import ProtectedProviderSecurityReviewPanel from "./ProtectedProviderSecurityReviewPanel";
import ProtectedProcurementEvidenceRegistryPanel from "./ProtectedProcurementEvidenceRegistryPanel";
import ProtectedReleaseDecisionPanel from "./ProtectedReleaseDecisionPanel";
import ProtectedReleaseAuthorityAttestationPanel from "./ProtectedReleaseAuthorityAttestationPanel";
import TenantAccessAdministrationPanel from "./TenantAccessAdministrationPanel";
import TrustOSDecisionLedgerPanel from "./TrustOSDecisionLedgerPanel";
import TrustSafetyIncidentWorkspacePanel from "./TrustSafetyIncidentWorkspacePanel";
import type { QaManualRunEvidencePacketRecord } from "../lib/qaEvidenceLedger";
import type {
  ClinicalActivationApprovalWorkflow,
} from "../lib/clinicalActivationApprovals";
import { clinicalActivationApprovalAttestation } from "../lib/clinicalActivationApprovals";
import type {
  ProtectedOperatorMetricDashboard,
  ProtectedOperatorMetricInput,
  ProtectedOperatorMetricRecord
} from "../lib/protectedOperatorMetrics";
import type {
  ProtectedMetricRollupDashboard,
  ProtectedMetricRollupInput,
  ProtectedMetricRollupRecord
} from "../lib/protectedMetricRollups";
import type {
  ProtectedMetricTrendDashboard,
  ProtectedMetricTrendReviewInput,
  ProtectedMetricTrendReviewRecord
} from "../lib/protectedMetricTrends";
import type {
  ProtectedBoardScorecardDashboard,
  ProtectedBoardScorecardInput,
  ProtectedBoardScorecardRecord
} from "../lib/protectedBoardScorecards";
import type {
  ProtectedFinanceMethodologyInput,
  ProtectedFinanceMethodologyWorkflow
} from "../lib/protectedFinanceMethodology";
import type {
  ProtectedExternalApprovalEvidenceInput,
  ProtectedExternalApprovalEvidenceWorkflow
} from "../lib/protectedExternalApprovalEvidence";
import type {
  ProtectedReleaseDecisionInput,
  ProtectedReleaseDecisionWorkflow
} from "../lib/protectedReleaseDecisionWorkflow";
import type {
  ProtectedNamedReviewerSignoffInput,
  ProtectedNamedReviewerSignoffWorkflow
} from "../lib/protectedNamedReviewerSignoffs";
import type {
  ProtectedDistributionLockboxInput,
  ProtectedDistributionLockboxWorkflow
} from "../lib/protectedDistributionLockbox";
import type {
  ProtectedReleaseAuthorityAttestationInput,
  ProtectedReleaseAuthorityAttestationWorkflow
} from "../lib/protectedReleaseAuthorityAttestations";
import type {
  ProtectedEvidenceRoomRecipientAttestationInput,
  ProtectedEvidenceRoomRecipientAttestationWorkflow
} from "../lib/protectedEvidenceRoomRecipientAttestations";
import type {
  ProtectedEvidenceRoomAccessLogReconciliationInput,
  ProtectedEvidenceRoomAccessLogReconciliationWorkflow
} from "../lib/protectedEvidenceRoomAccessLogReconciliation";
import type {
  ProtectedEvidenceRoomProviderAdapterInput,
  ProtectedEvidenceRoomProviderAdapterWorkflow
} from "../lib/protectedEvidenceRoomProviderAdapters";
import type {
  ProtectedProviderSecurityReviewInput,
  ProtectedProviderSecurityReviewWorkflow
} from "../lib/protectedProviderSecurityReviews";
import type {
  ProtectedProcurementEvidenceRegistryInput,
  ProtectedProcurementEvidenceRegistryWorkflow
} from "../lib/protectedProcurementEvidenceRegistry";
import type {
  ProtectedAuthorityArtifactReferenceInput,
  ProtectedAuthorityArtifactReferenceWorkflow
} from "../lib/protectedAuthorityArtifactReferences";
import type { ProtectedClinicalAuthorityEvidenceRoom } from "../lib/protectedClinicalAuthorityEvidenceRoom";
import type { ProtectedClinicalAuthorityArtifactIntakeChecklist } from "../lib/protectedClinicalAuthorityArtifactIntake";
import type { ProtectedClinicalAuthorityOwnerMatrix } from "../lib/protectedClinicalAuthorityOwnerMatrix";

type AccessStatus =
  | "infrastructure-required"
  | "signed-out"
  | "sending-link"
  | "loading"
  | "mfa-required"
  | "mfa-enrolling"
  | "mfa-verifying"
  | "ready"
  | "creating-session"
  | "error";

type PasskeyStatus = "idle" | "signing-in" | "registering";

type PilotWorkspaceResponse = {
  workspaces?: PilotWorkspaceRecord[];
  error?: { message?: string };
};

type PilotSessionResponse = {
  sessions?: PilotSessionRecord[];
  session?: PilotSessionRecord;
  error?: { message?: string };
};

type PilotAuditResponse = {
  events?: PilotAuditEventRecord[];
  error?: { message?: string };
};

type ProofPacketResponse = {
  error?: { message?: string };
};

type DemoReadinessSnapshotResponse = {
  snapshots?: PilotDemoReadinessSnapshotRecord[];
  snapshot?: PilotDemoReadinessSnapshotRecord | null;
  error?: { message?: string };
};

type ManualQaEvidenceResponse = {
  packets?: QaManualRunEvidencePacketRecord[];
  error?: { message?: string };
};

type CommandIntelligenceResponse = {
  snapshots?: CommandIntelligenceSnapshotRecord[];
  snapshot?: CommandIntelligenceSnapshotRecord | null;
  error?: { message?: string };
};

type ClinicalActivationApprovalResponse = {
  approvalId?: string;
  workflow?: ClinicalActivationApprovalWorkflow;
  error?: { message?: string };
};

type ProtectedOperatorMetricsResponse = {
  metricId?: string;
  metrics?: ProtectedOperatorMetricRecord[];
  dashboard?: ProtectedOperatorMetricDashboard;
  errors?: string[];
  error?: { message?: string };
};

type ProtectedMetricRollupsResponse = {
  snapshotId?: string;
  snapshots?: ProtectedMetricRollupRecord[];
  dashboard?: ProtectedMetricRollupDashboard;
  errors?: string[];
  error?: { message?: string };
};

type ProtectedMetricTrendsResponse = {
  reviewId?: string;
  reviews?: ProtectedMetricTrendReviewRecord[];
  dashboard?: ProtectedMetricTrendDashboard;
  errors?: string[];
  error?: { message?: string };
};

type ProtectedBoardScorecardsResponse = {
  scorecardId?: string;
  scorecards?: ProtectedBoardScorecardRecord[];
  dashboard?: ProtectedBoardScorecardDashboard;
  errors?: string[];
  error?: { message?: string };
};

type ProtectedFinanceMethodologyResponse = {
  gateRecordId?: string;
  records?: unknown[];
  workflow?: ProtectedFinanceMethodologyWorkflow;
  errors?: string[];
  error?: { message?: string };
};

type ProtectedExternalApprovalEvidenceResponse = {
  referenceId?: string;
  records?: unknown[];
  workflow?: ProtectedExternalApprovalEvidenceWorkflow;
  financeWorkflow?: ProtectedFinanceMethodologyWorkflow;
  errors?: string[];
  error?: { message?: string };
};

type ProtectedReleaseDecisionResponse = {
  decisionId?: string;
  records?: unknown[];
  workflow?: ProtectedReleaseDecisionWorkflow;
  externalWorkflow?: ProtectedExternalApprovalEvidenceWorkflow;
  financeWorkflow?: ProtectedFinanceMethodologyWorkflow;
  errors?: string[];
  error?: { message?: string };
};

type ProtectedNamedReviewerSignoffResponse = {
  signoffId?: string;
  records?: unknown[];
  workflow?: ProtectedNamedReviewerSignoffWorkflow;
  releaseWorkflow?: ProtectedReleaseDecisionWorkflow;
  externalWorkflow?: ProtectedExternalApprovalEvidenceWorkflow;
  financeWorkflow?: ProtectedFinanceMethodologyWorkflow;
  errors?: string[];
  error?: { message?: string };
};

type ProtectedDistributionLockboxResponse = {
  lockboxId?: string;
  records?: unknown[];
  workflow?: ProtectedDistributionLockboxWorkflow;
  signoffWorkflow?: ProtectedNamedReviewerSignoffWorkflow;
  releaseWorkflow?: ProtectedReleaseDecisionWorkflow;
  externalWorkflow?: ProtectedExternalApprovalEvidenceWorkflow;
  financeWorkflow?: ProtectedFinanceMethodologyWorkflow;
  errors?: string[];
  error?: { message?: string };
};

type ProtectedReleaseAuthorityAttestationResponse = {
  attestationId?: string;
  records?: unknown[];
  workflow?: ProtectedReleaseAuthorityAttestationWorkflow;
  lockboxWorkflow?: ProtectedDistributionLockboxWorkflow;
  signoffWorkflow?: ProtectedNamedReviewerSignoffWorkflow;
  releaseWorkflow?: ProtectedReleaseDecisionWorkflow;
  externalWorkflow?: ProtectedExternalApprovalEvidenceWorkflow;
  financeWorkflow?: ProtectedFinanceMethodologyWorkflow;
  errors?: string[];
  error?: { message?: string };
};

type ProtectedEvidenceRoomRecipientAttestationResponse = {
  attestationId?: string;
  records?: unknown[];
  workflow?: ProtectedEvidenceRoomRecipientAttestationWorkflow;
  authorityWorkflow?: ProtectedReleaseAuthorityAttestationWorkflow;
  lockboxWorkflow?: ProtectedDistributionLockboxWorkflow;
  signoffWorkflow?: ProtectedNamedReviewerSignoffWorkflow;
  releaseWorkflow?: ProtectedReleaseDecisionWorkflow;
  externalWorkflow?: ProtectedExternalApprovalEvidenceWorkflow;
  financeWorkflow?: ProtectedFinanceMethodologyWorkflow;
  errors?: string[];
  error?: { message?: string };
};

type ProtectedEvidenceRoomAccessLogReconciliationResponse = {
  reconciliationId?: string;
  records?: unknown[];
  workflow?: ProtectedEvidenceRoomAccessLogReconciliationWorkflow;
  recipientWorkflow?: ProtectedEvidenceRoomRecipientAttestationWorkflow;
  authorityWorkflow?: ProtectedReleaseAuthorityAttestationWorkflow;
  lockboxWorkflow?: ProtectedDistributionLockboxWorkflow;
  signoffWorkflow?: ProtectedNamedReviewerSignoffWorkflow;
  releaseWorkflow?: ProtectedReleaseDecisionWorkflow;
  externalWorkflow?: ProtectedExternalApprovalEvidenceWorkflow;
  financeWorkflow?: ProtectedFinanceMethodologyWorkflow;
  errors?: string[];
  error?: { message?: string };
};

type ProtectedEvidenceRoomProviderAdapterResponse = {
  adapterId?: string;
  records?: unknown[];
  workflow?: ProtectedEvidenceRoomProviderAdapterWorkflow;
  accessLogWorkflow?: ProtectedEvidenceRoomAccessLogReconciliationWorkflow;
  recipientWorkflow?: ProtectedEvidenceRoomRecipientAttestationWorkflow;
  authorityWorkflow?: ProtectedReleaseAuthorityAttestationWorkflow;
  lockboxWorkflow?: ProtectedDistributionLockboxWorkflow;
  signoffWorkflow?: ProtectedNamedReviewerSignoffWorkflow;
  releaseWorkflow?: ProtectedReleaseDecisionWorkflow;
  externalWorkflow?: ProtectedExternalApprovalEvidenceWorkflow;
  financeWorkflow?: ProtectedFinanceMethodologyWorkflow;
  errors?: string[];
  error?: { message?: string };
};

type ProtectedProviderSecurityReviewResponse = {
  reviewId?: string;
  records?: unknown[];
  workflow?: ProtectedProviderSecurityReviewWorkflow;
  providerAdapterRecords?: unknown[];
  errors?: string[];
  error?: { message?: string };
};

type ProtectedProcurementEvidenceRegistryResponse = {
  registryId?: string;
  records?: unknown[];
  workflow?: ProtectedProcurementEvidenceRegistryWorkflow;
  providerSecurityReviewRecords?: unknown[];
  errors?: string[];
  error?: { message?: string };
};

type ProtectedClinicalAuthorityEvidenceRoomResponse = {
  room?: ProtectedClinicalAuthorityEvidenceRoom;
  errors?: string[];
  error?: { message?: string };
};

type ProtectedClinicalAuthorityOwnerMatrixResponse = {
  matrix?: ProtectedClinicalAuthorityOwnerMatrix;
  evidenceRoom?: ProtectedClinicalAuthorityEvidenceRoom;
  errors?: string[];
  error?: { message?: string };
};

type ProtectedClinicalAuthorityArtifactIntakeResponse = {
  checklist?: ProtectedClinicalAuthorityArtifactIntakeChecklist;
  matrix?: ProtectedClinicalAuthorityOwnerMatrix;
  evidenceRoom?: ProtectedClinicalAuthorityEvidenceRoom;
  errors?: string[];
  error?: { message?: string };
};

type ProtectedAuthorityArtifactReferenceResponse = {
  referenceId?: string;
  records?: unknown[];
  workflow?: ProtectedAuthorityArtifactReferenceWorkflow;
  checklist?: ProtectedClinicalAuthorityArtifactIntakeChecklist;
  matrix?: ProtectedClinicalAuthorityOwnerMatrix;
  evidenceRoom?: ProtectedClinicalAuthorityEvidenceRoom;
  errors?: string[];
  error?: { message?: string };
};

const syntheticSessionRequest = {
  scenarioSlug: "enterprise-workflow-assessment",
  organizationId: "tenant-protected-pilot",
  requestedByRole: "enterprise-pilot-lead",
  mode: "synthetic-pilot",
  dataBoundaryAcknowledged: true
} as const;

export default function ProtectedPilotAccess({
  supabaseUrl,
  supabasePublishableKey
}: {
  supabaseUrl: string;
  supabasePublishableKey: string;
}) {
  const configured = Boolean(supabaseUrl && supabasePublishableKey);
  const supabase = useMemo(
    () =>
      configured
        ? createClient(supabaseUrl, supabasePublishableKey, {
            auth: {
              detectSessionInUrl: true,
              persistSession: true,
              experimental: { passkey: true }
            }
          })
        : null,
    [configured, supabasePublishableKey, supabaseUrl]
  );
  const [email, setEmail] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AccessStatus>(
    configured ? "loading" : "infrastructure-required"
  );
  const [message, setMessage] = useState("");
  const [passkeyStatus, setPasskeyStatus] = useState<PasskeyStatus>("idle");
  const [enterprisePacketStatus, setEnterprisePacketStatus] = useState<"idle" | "downloading">("idle");
  const [buyerRoomPacketStatus, setBuyerRoomPacketStatus] = useState<"idle" | "downloading">("idle");
  const [clinicalDossierPacketStatus, setClinicalDossierPacketStatus] =
    useState<"idle" | "downloading">("idle");
  const [clinicalApprovalPacketStatus, setClinicalApprovalPacketStatus] =
    useState<"idle" | "downloading">("idle");
  const [clinicalApprovalBusyDomainId, setClinicalApprovalBusyDomainId] = useState<string | null>(
    null
  );
  const [workspaces, setWorkspaces] = useState<PilotWorkspaceRecord[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<PilotWorkspaceRecord | null>(null);
  const [sessions, setSessions] = useState<PilotSessionRecord[]>([]);
  const [auditEvents, setAuditEvents] = useState<PilotAuditEventRecord[]>([]);
  const [demoReadinessSnapshots, setDemoReadinessSnapshots] = useState<PilotDemoReadinessSnapshotRecord[]>([]);
  const [manualQaEvidencePackets, setManualQaEvidencePackets] = useState<QaManualRunEvidencePacketRecord[]>([]);
  const [commandIntelligenceSnapshots, setCommandIntelligenceSnapshots] = useState<CommandIntelligenceSnapshotRecord[]>([]);
  const [clinicalActivationApprovalWorkflow, setClinicalActivationApprovalWorkflow] =
    useState<ClinicalActivationApprovalWorkflow | null>(null);
  const [protectedOperatorMetrics, setProtectedOperatorMetrics] = useState<ProtectedOperatorMetricRecord[]>([]);
  const [protectedOperatorMetricDashboard, setProtectedOperatorMetricDashboard] =
    useState<ProtectedOperatorMetricDashboard | null>(null);
  const [protectedOperatorMetricStatus, setProtectedOperatorMetricStatus] =
    useState<"idle" | "saving">("idle");
  const [protectedMetricRollupSnapshots, setProtectedMetricRollupSnapshots] = useState<
    ProtectedMetricRollupRecord[]
  >([]);
  const [protectedMetricRollupDashboard, setProtectedMetricRollupDashboard] =
    useState<ProtectedMetricRollupDashboard | null>(null);
  const [protectedMetricRollupStatus, setProtectedMetricRollupStatus] =
    useState<"idle" | "saving">("idle");
  const [protectedMetricRollupPacketBusyId, setProtectedMetricRollupPacketBusyId] =
    useState<string | null>(null);
  const [protectedMetricTrendReviews, setProtectedMetricTrendReviews] = useState<
    ProtectedMetricTrendReviewRecord[]
  >([]);
  const [protectedMetricTrendDashboard, setProtectedMetricTrendDashboard] =
    useState<ProtectedMetricTrendDashboard | null>(null);
  const [protectedMetricTrendStatus, setProtectedMetricTrendStatus] =
    useState<"idle" | "saving">("idle");
  const [protectedMetricTrendPacketBusyId, setProtectedMetricTrendPacketBusyId] =
    useState<string | null>(null);
  const [protectedBoardScorecards, setProtectedBoardScorecards] = useState<
    ProtectedBoardScorecardRecord[]
  >([]);
  const [protectedBoardScorecardDashboard, setProtectedBoardScorecardDashboard] =
    useState<ProtectedBoardScorecardDashboard | null>(null);
  const [protectedBoardScorecardStatus, setProtectedBoardScorecardStatus] =
    useState<"idle" | "saving">("idle");
  const [protectedBoardScorecardPacketBusyId, setProtectedBoardScorecardPacketBusyId] =
    useState<string | null>(null);
  const [protectedFinanceMethodologyWorkflow, setProtectedFinanceMethodologyWorkflow] =
    useState<ProtectedFinanceMethodologyWorkflow | null>(null);
  const [protectedFinanceMethodologyBusyGateId, setProtectedFinanceMethodologyBusyGateId] =
    useState<string | null>(null);
  const [protectedFinanceMethodologyPacketStatus, setProtectedFinanceMethodologyPacketStatus] =
    useState<"idle" | "downloading">("idle");
  const [protectedExternalApprovalEvidenceWorkflow, setProtectedExternalApprovalEvidenceWorkflow] =
    useState<ProtectedExternalApprovalEvidenceWorkflow | null>(null);
  const [
    protectedExternalApprovalEvidenceBusyDomainId,
    setProtectedExternalApprovalEvidenceBusyDomainId
  ] = useState<string | null>(null);
  const [
    protectedExternalApprovalEvidencePacketStatus,
    setProtectedExternalApprovalEvidencePacketStatus
  ] = useState<"idle" | "downloading">("idle");
  const [protectedReleaseDecisionWorkflow, setProtectedReleaseDecisionWorkflow] =
    useState<ProtectedReleaseDecisionWorkflow | null>(null);
  const [protectedReleaseDecisionStatus, setProtectedReleaseDecisionStatus] =
    useState<"idle" | "saving">("idle");
  const [protectedReleaseDecisionPacketStatus, setProtectedReleaseDecisionPacketStatus] =
    useState<"idle" | "downloading">("idle");
  const [protectedNamedReviewerSignoffWorkflow, setProtectedNamedReviewerSignoffWorkflow] =
    useState<ProtectedNamedReviewerSignoffWorkflow | null>(null);
  const [protectedNamedReviewerSignoffStatus, setProtectedNamedReviewerSignoffStatus] =
    useState<"idle" | "saving">("idle");
  const [protectedNamedReviewerSignoffPacketStatus, setProtectedNamedReviewerSignoffPacketStatus] =
    useState<"idle" | "downloading">("idle");
  const [protectedDistributionLockboxWorkflow, setProtectedDistributionLockboxWorkflow] =
    useState<ProtectedDistributionLockboxWorkflow | null>(null);
  const [protectedDistributionLockboxStatus, setProtectedDistributionLockboxStatus] =
    useState<"idle" | "saving">("idle");
  const [protectedDistributionLockboxPacketStatus, setProtectedDistributionLockboxPacketStatus] =
    useState<"idle" | "downloading">("idle");
  const [
    protectedReleaseAuthorityAttestationWorkflow,
    setProtectedReleaseAuthorityAttestationWorkflow
  ] = useState<ProtectedReleaseAuthorityAttestationWorkflow | null>(null);
  const [
    protectedReleaseAuthorityAttestationStatus,
    setProtectedReleaseAuthorityAttestationStatus
  ] = useState<"idle" | "saving">("idle");
  const [
    protectedReleaseAuthorityAttestationPacketStatus,
    setProtectedReleaseAuthorityAttestationPacketStatus
  ] = useState<"idle" | "downloading">("idle");
  const [
    protectedEvidenceRoomRecipientAttestationWorkflow,
    setProtectedEvidenceRoomRecipientAttestationWorkflow
  ] = useState<ProtectedEvidenceRoomRecipientAttestationWorkflow | null>(null);
  const [
    protectedEvidenceRoomRecipientAttestationStatus,
    setProtectedEvidenceRoomRecipientAttestationStatus
  ] = useState<"idle" | "saving">("idle");
  const [
    protectedEvidenceRoomRecipientAttestationPacketStatus,
    setProtectedEvidenceRoomRecipientAttestationPacketStatus
  ] = useState<"idle" | "downloading">("idle");
  const [
    protectedEvidenceRoomAccessLogReconciliationWorkflow,
    setProtectedEvidenceRoomAccessLogReconciliationWorkflow
  ] = useState<ProtectedEvidenceRoomAccessLogReconciliationWorkflow | null>(null);
  const [
    protectedEvidenceRoomAccessLogReconciliationStatus,
    setProtectedEvidenceRoomAccessLogReconciliationStatus
  ] = useState<"idle" | "saving">("idle");
  const [
    protectedEvidenceRoomAccessLogReconciliationPacketStatus,
    setProtectedEvidenceRoomAccessLogReconciliationPacketStatus
  ] = useState<"idle" | "downloading">("idle");
  const [
    protectedEvidenceRoomProviderAdapterWorkflow,
    setProtectedEvidenceRoomProviderAdapterWorkflow
  ] = useState<ProtectedEvidenceRoomProviderAdapterWorkflow | null>(null);
  const [
    protectedEvidenceRoomProviderAdapterStatus,
    setProtectedEvidenceRoomProviderAdapterStatus
  ] = useState<"idle" | "saving">("idle");
  const [
    protectedEvidenceRoomProviderAdapterPacketStatus,
    setProtectedEvidenceRoomProviderAdapterPacketStatus
  ] = useState<"idle" | "downloading">("idle");
  const [
    protectedProviderSecurityReviewWorkflow,
    setProtectedProviderSecurityReviewWorkflow
  ] = useState<ProtectedProviderSecurityReviewWorkflow | null>(null);
  const [
    protectedProviderSecurityReviewStatus,
    setProtectedProviderSecurityReviewStatus
  ] = useState<"idle" | "saving">("idle");
  const [
    protectedProviderSecurityReviewPacketStatus,
    setProtectedProviderSecurityReviewPacketStatus
  ] = useState<"idle" | "downloading">("idle");
  const [
    protectedProcurementEvidenceRegistryWorkflow,
    setProtectedProcurementEvidenceRegistryWorkflow
  ] = useState<ProtectedProcurementEvidenceRegistryWorkflow | null>(null);
  const [
    protectedProcurementEvidenceRegistryStatus,
    setProtectedProcurementEvidenceRegistryStatus
  ] = useState<"idle" | "saving">("idle");
  const [
    protectedProcurementEvidenceRegistryPacketStatus,
    setProtectedProcurementEvidenceRegistryPacketStatus
  ] = useState<"idle" | "downloading">("idle");
  const [
    protectedClinicalAuthorityEvidenceRoom,
    setProtectedClinicalAuthorityEvidenceRoom
  ] = useState<ProtectedClinicalAuthorityEvidenceRoom | null>(null);
  const [
    protectedClinicalAuthorityEvidenceRoomPacketStatus,
    setProtectedClinicalAuthorityEvidenceRoomPacketStatus
  ] = useState<"idle" | "downloading">("idle");
  const [
    protectedClinicalAuthorityOwnerMatrix,
    setProtectedClinicalAuthorityOwnerMatrix
  ] = useState<ProtectedClinicalAuthorityOwnerMatrix | null>(null);
  const [
    protectedClinicalAuthorityOwnerMatrixPacketStatus,
    setProtectedClinicalAuthorityOwnerMatrixPacketStatus
  ] = useState<"idle" | "downloading">("idle");
  const [
    protectedClinicalAuthorityArtifactIntake,
    setProtectedClinicalAuthorityArtifactIntake
  ] = useState<ProtectedClinicalAuthorityArtifactIntakeChecklist | null>(null);
  const [
    protectedClinicalAuthorityArtifactIntakePacketStatus,
    setProtectedClinicalAuthorityArtifactIntakePacketStatus
  ] = useState<"idle" | "downloading">("idle");
  const [
    protectedAuthorityArtifactReferenceWorkflow,
    setProtectedAuthorityArtifactReferenceWorkflow
  ] = useState<ProtectedAuthorityArtifactReferenceWorkflow | null>(null);
  const [
    protectedAuthorityArtifactReferenceStatus,
    setProtectedAuthorityArtifactReferenceStatus
  ] = useState<"idle" | "saving">("idle");
  const [
    protectedAuthorityArtifactReferencePacketStatus,
    setProtectedAuthorityArtifactReferencePacketStatus
  ] = useState<"idle" | "downloading">("idle");
  const [demoSnapshotStatus, setDemoSnapshotStatus] = useState<"idle" | "saving">("idle");
  const [demoPacketBusyId, setDemoPacketBusyId] = useState<string | null>(null);
  const [commandSnapshotStatus, setCommandSnapshotStatus] = useState<"idle" | "saving">("idle");
  const [commandPacketBusyId, setCommandPacketBusyId] = useState<string | null>(null);
  const [verificationReadiness, setVerificationReadiness] =
    useState<TenantSessionVerificationReadiness | null>(null);
  const [mfaFactorId, setMfaFactorId] = useState("");
  const [mfaFactorStatus, setMfaFactorStatus] = useState<"verified" | "unverified" | "">("");
  const [mfaQrCode, setMfaQrCode] = useState("");
  const [mfaCode, setMfaCode] = useState("");

  const resetProtectedOperatorMetrics = useCallback(() => {
    setProtectedOperatorMetrics([]);
    setProtectedOperatorMetricDashboard(null);
    setProtectedOperatorMetricStatus("idle");
  }, []);

  const resetProtectedMetricRollups = useCallback(() => {
    setProtectedMetricRollupSnapshots([]);
    setProtectedMetricRollupDashboard(null);
    setProtectedMetricRollupStatus("idle");
    setProtectedMetricRollupPacketBusyId(null);
  }, []);

  const resetProtectedMetricTrends = useCallback(() => {
    setProtectedMetricTrendReviews([]);
    setProtectedMetricTrendDashboard(null);
    setProtectedMetricTrendStatus("idle");
    setProtectedMetricTrendPacketBusyId(null);
  }, []);

  const resetProtectedBoardScorecards = useCallback(() => {
    setProtectedBoardScorecards([]);
    setProtectedBoardScorecardDashboard(null);
    setProtectedBoardScorecardStatus("idle");
    setProtectedBoardScorecardPacketBusyId(null);
  }, []);

  const resetProtectedFinanceMethodology = useCallback(() => {
    setProtectedFinanceMethodologyWorkflow(null);
    setProtectedFinanceMethodologyBusyGateId(null);
    setProtectedFinanceMethodologyPacketStatus("idle");
  }, []);

  const resetProtectedExternalApprovalEvidence = useCallback(() => {
    setProtectedExternalApprovalEvidenceWorkflow(null);
    setProtectedExternalApprovalEvidenceBusyDomainId(null);
    setProtectedExternalApprovalEvidencePacketStatus("idle");
  }, []);

  const resetProtectedReleaseDecision = useCallback(() => {
    setProtectedReleaseDecisionWorkflow(null);
    setProtectedReleaseDecisionStatus("idle");
    setProtectedReleaseDecisionPacketStatus("idle");
  }, []);

  const resetProtectedNamedReviewerSignoff = useCallback(() => {
    setProtectedNamedReviewerSignoffWorkflow(null);
    setProtectedNamedReviewerSignoffStatus("idle");
    setProtectedNamedReviewerSignoffPacketStatus("idle");
  }, []);

  const resetProtectedDistributionLockbox = useCallback(() => {
    setProtectedDistributionLockboxWorkflow(null);
    setProtectedDistributionLockboxStatus("idle");
    setProtectedDistributionLockboxPacketStatus("idle");
  }, []);

  const resetProtectedReleaseAuthorityAttestation = useCallback(() => {
    setProtectedReleaseAuthorityAttestationWorkflow(null);
    setProtectedReleaseAuthorityAttestationStatus("idle");
    setProtectedReleaseAuthorityAttestationPacketStatus("idle");
  }, []);

  const resetProtectedEvidenceRoomRecipientAttestation = useCallback(() => {
    setProtectedEvidenceRoomRecipientAttestationWorkflow(null);
    setProtectedEvidenceRoomRecipientAttestationStatus("idle");
    setProtectedEvidenceRoomRecipientAttestationPacketStatus("idle");
  }, []);

  const resetProtectedEvidenceRoomAccessLogReconciliation = useCallback(() => {
    setProtectedEvidenceRoomAccessLogReconciliationWorkflow(null);
    setProtectedEvidenceRoomAccessLogReconciliationStatus("idle");
    setProtectedEvidenceRoomAccessLogReconciliationPacketStatus("idle");
  }, []);

  const resetProtectedEvidenceRoomProviderAdapter = useCallback(() => {
    setProtectedEvidenceRoomProviderAdapterWorkflow(null);
    setProtectedEvidenceRoomProviderAdapterStatus("idle");
    setProtectedEvidenceRoomProviderAdapterPacketStatus("idle");
  }, []);

  const resetProtectedProviderSecurityReview = useCallback(() => {
    setProtectedProviderSecurityReviewWorkflow(null);
    setProtectedProviderSecurityReviewStatus("idle");
    setProtectedProviderSecurityReviewPacketStatus("idle");
  }, []);

  const resetProtectedProcurementEvidenceRegistry = useCallback(() => {
    setProtectedProcurementEvidenceRegistryWorkflow(null);
    setProtectedProcurementEvidenceRegistryStatus("idle");
    setProtectedProcurementEvidenceRegistryPacketStatus("idle");
  }, []);

  const resetProtectedClinicalAuthorityEvidenceRoom = useCallback(() => {
    setProtectedClinicalAuthorityEvidenceRoom(null);
    setProtectedClinicalAuthorityEvidenceRoomPacketStatus("idle");
  }, []);

  const resetProtectedClinicalAuthorityOwnerMatrix = useCallback(() => {
    setProtectedClinicalAuthorityOwnerMatrix(null);
    setProtectedClinicalAuthorityOwnerMatrixPacketStatus("idle");
  }, []);

  const resetProtectedClinicalAuthorityArtifactIntake = useCallback(() => {
    setProtectedClinicalAuthorityArtifactIntake(null);
    setProtectedClinicalAuthorityArtifactIntakePacketStatus("idle");
  }, []);

  const resetProtectedAuthorityArtifactReferences = useCallback(() => {
    setProtectedAuthorityArtifactReferenceWorkflow(null);
    setProtectedAuthorityArtifactReferenceStatus("idle");
    setProtectedAuthorityArtifactReferencePacketStatus("idle");
  }, []);

  useEffect(() => {
    const client = supabase;

    if (!client) {
      return;
    }

    const activeClient = client;
    let active = true;

    async function initializeAccess() {
      const { data } = await activeClient.auth.getSession();

      if (!active) {
        return;
      }

      await applySession(data.session);
    }

    async function applySession(nextSession: Session | null) {
      if (!active) {
        return;
      }

      setSession(nextSession);

      if (!nextSession) {
        setUser(null);
        setPasskeyStatus("idle");
        setWorkspaces([]);
        setSelectedWorkspace(null);
        setSessions([]);
        setAuditEvents([]);
        setDemoReadinessSnapshots([]);
        setManualQaEvidencePackets([]);
        setCommandIntelligenceSnapshots([]);
        setDemoPacketBusyId(null);
        setDemoSnapshotStatus("idle");
        setCommandPacketBusyId(null);
        setCommandSnapshotStatus("idle");
        setVerificationReadiness(null);
        setEnterprisePacketStatus("idle");
        setBuyerRoomPacketStatus("idle");
        setClinicalDossierPacketStatus("idle");
        setClinicalApprovalPacketStatus("idle");
        setClinicalApprovalBusyDomainId(null);
        setClinicalActivationApprovalWorkflow(null);
        resetProtectedOperatorMetrics();
        resetProtectedMetricRollups();
        resetProtectedMetricTrends();
        resetProtectedBoardScorecards();
        resetProtectedFinanceMethodology();
        resetProtectedExternalApprovalEvidence();
        resetProtectedReleaseDecision();
        resetProtectedNamedReviewerSignoff();
        resetProtectedDistributionLockbox();
        resetProtectedReleaseAuthorityAttestation();
        resetProtectedEvidenceRoomRecipientAttestation();
        resetProtectedEvidenceRoomAccessLogReconciliation();
        resetProtectedEvidenceRoomProviderAdapter();
        resetProtectedProviderSecurityReview();
        resetProtectedProcurementEvidenceRegistry();
        resetProtectedClinicalAuthorityEvidenceRoom();
        resetProtectedClinicalAuthorityOwnerMatrix();
        resetProtectedClinicalAuthorityArtifactIntake();
        resetProtectedAuthorityArtifactReferences();
        setStatus("signed-out");
        return;
      }

      const [{ data, error }, assurance, factors] = await Promise.all([
        activeClient.auth.getUser(nextSession.access_token),
        activeClient.auth.mfa.getAuthenticatorAssuranceLevel(),
        activeClient.auth.mfa.listFactors()
      ]);

      if (!active) {
        return;
      }

      if (error || !data.user || assurance.error || factors.error) {
        setUser(null);
        setStatus("error");
        setMessage("The identity provider could not verify this session.");
        return;
      }

      setUser(data.user);
      const verifiedFactor = factors.data.totp.find((factor) => factor.status === "verified");
      const pendingFactor = factors.data.all.find(
        (factor) => factor.factor_type === "totp" && factor.status === "unverified"
      );
      setMfaFactorId(verifiedFactor?.id ?? pendingFactor?.id ?? "");
      setMfaFactorStatus(verifiedFactor ? "verified" : pendingFactor ? "unverified" : "");

      if (assurance.data.currentLevel !== "aal2") {
        setWorkspaces([]);
        setSelectedWorkspace(null);
        setSessions([]);
        setAuditEvents([]);
        setDemoReadinessSnapshots([]);
        setManualQaEvidencePackets([]);
        setCommandIntelligenceSnapshots([]);
        setDemoPacketBusyId(null);
        setDemoSnapshotStatus("idle");
        setCommandPacketBusyId(null);
        setCommandSnapshotStatus("idle");
        setVerificationReadiness(null);
        setBuyerRoomPacketStatus("idle");
        setClinicalDossierPacketStatus("idle");
        setClinicalApprovalPacketStatus("idle");
        setClinicalApprovalBusyDomainId(null);
        setClinicalActivationApprovalWorkflow(null);
        resetProtectedOperatorMetrics();
        resetProtectedMetricRollups();
        resetProtectedMetricTrends();
        resetProtectedBoardScorecards();
        resetProtectedFinanceMethodology();
        resetProtectedExternalApprovalEvidence();
        resetProtectedReleaseDecision();
        resetProtectedNamedReviewerSignoff();
        resetProtectedDistributionLockbox();
        resetProtectedReleaseAuthorityAttestation();
        resetProtectedEvidenceRoomRecipientAttestation();
        resetProtectedEvidenceRoomAccessLogReconciliation();
        resetProtectedEvidenceRoomProviderAdapter();
        resetProtectedProviderSecurityReview();
        resetProtectedProcurementEvidenceRegistry();
        resetProtectedClinicalAuthorityEvidenceRoom();
        resetProtectedClinicalAuthorityOwnerMatrix();
        resetProtectedClinicalAuthorityArtifactIntake();
        resetProtectedAuthorityArtifactReferences();
        setStatus("mfa-required");
        setMessage(
          verifiedFactor
            ? "Enter the code from the enrolled authenticator to open the protected pilot workspace."
            : pendingFactor
              ? "Finish verifying the authenticator you scanned, or restart setup to generate a new QR code."
              : "Enroll a free authenticator factor before opening the protected pilot workspace."
        );
        return;
      }

      await loadWorkspaces(nextSession);
    }

    async function loadWorkspaces(activeSession: Session) {
      setStatus("loading");
      setMessage("");
      const response = await fetch("/api/pilot-workspaces", {
        headers: {
          Authorization: `Bearer ${activeSession.access_token}`
        }
      });
      const body = (await response.json()) as PilotWorkspaceResponse;

      if (!active) {
        return;
      }

      if (!response.ok) {
        setStatus("error");
        setMessage(body.error?.message ?? "Protected pilot workspaces could not be loaded.");
        return;
      }

      const nextWorkspaces = body.workspaces ?? [];
      setWorkspaces(nextWorkspaces);
      setSelectedWorkspace(nextWorkspaces[0] ?? null);
      setDemoReadinessSnapshots([]);
      setManualQaEvidencePackets([]);
      setCommandIntelligenceSnapshots([]);
      setDemoPacketBusyId(null);
      setDemoSnapshotStatus("idle");
      setCommandPacketBusyId(null);
      setCommandSnapshotStatus("idle");
      setBuyerRoomPacketStatus("idle");
      setClinicalDossierPacketStatus("idle");
      setClinicalApprovalPacketStatus("idle");
      setClinicalApprovalBusyDomainId(null);
      setClinicalActivationApprovalWorkflow(null);
      resetProtectedOperatorMetrics();
      resetProtectedMetricRollups();
      resetProtectedMetricTrends();
      resetProtectedBoardScorecards();
      resetProtectedFinanceMethodology();
      resetProtectedExternalApprovalEvidence();
      resetProtectedReleaseDecision();
      resetProtectedNamedReviewerSignoff();
      resetProtectedDistributionLockbox();
      resetProtectedReleaseAuthorityAttestation();
      resetProtectedEvidenceRoomRecipientAttestation();
      resetProtectedEvidenceRoomAccessLogReconciliation();
      resetProtectedEvidenceRoomProviderAdapter();
      resetProtectedProviderSecurityReview();
      resetProtectedProcurementEvidenceRegistry();
      resetProtectedClinicalAuthorityEvidenceRoom();
      resetProtectedClinicalAuthorityOwnerMatrix();
      resetProtectedClinicalAuthorityArtifactIntake();
      resetProtectedAuthorityArtifactReferences();
      setVerificationReadiness(null);
      setStatus("ready");

      if (nextWorkspaces[0]) {
        await Promise.all([
          loadSessions(activeSession, nextWorkspaces[0]),
          loadAuditEvents(activeSession, nextWorkspaces[0]),
          loadDemoReadinessSnapshots(activeSession, nextWorkspaces[0]),
          loadManualQaEvidencePackets(activeSession, nextWorkspaces[0]),
          loadCommandIntelligenceSnapshots(activeSession, nextWorkspaces[0]),
          loadClinicalActivationApprovals(activeSession, nextWorkspaces[0]),
          loadProtectedOperatorMetrics(activeSession, nextWorkspaces[0]),
          loadProtectedMetricRollups(activeSession, nextWorkspaces[0]),
          loadProtectedMetricTrends(activeSession, nextWorkspaces[0]),
          loadProtectedBoardScorecards(activeSession, nextWorkspaces[0]),
          loadProtectedFinanceMethodology(activeSession, nextWorkspaces[0]),
          loadProtectedExternalApprovalEvidence(activeSession, nextWorkspaces[0]),
          loadProtectedReleaseDecision(activeSession, nextWorkspaces[0]),
          loadProtectedNamedReviewerSignoffs(activeSession, nextWorkspaces[0]),
          loadProtectedDistributionLockboxes(activeSession, nextWorkspaces[0]),
          loadProtectedReleaseAuthorityAttestations(activeSession, nextWorkspaces[0]),
          loadProtectedEvidenceRoomRecipientAttestations(activeSession, nextWorkspaces[0]),
          loadProtectedEvidenceRoomAccessLogReconciliation(activeSession, nextWorkspaces[0]),
          loadProtectedEvidenceRoomProviderAdapters(activeSession, nextWorkspaces[0]),
          loadProtectedProviderSecurityReviews(activeSession, nextWorkspaces[0]),
          loadProtectedProcurementEvidenceRegistry(activeSession, nextWorkspaces[0]),
          loadProtectedClinicalAuthorityEvidenceRoom(activeSession, nextWorkspaces[0]),
          loadProtectedClinicalAuthorityOwnerMatrix(activeSession, nextWorkspaces[0]),
          loadProtectedClinicalAuthorityArtifactIntake(activeSession, nextWorkspaces[0]),
          loadProtectedAuthorityArtifactReferences(activeSession, nextWorkspaces[0])
        ]);
      }
    }

    async function loadSessions(activeSession: Session, workspace: PilotWorkspaceRecord) {
      const response = await fetch(`/api/pilot-workspaces/${workspace.slug}/sessions`, {
        headers: {
          Authorization: `Bearer ${activeSession.access_token}`
        }
      });
      const body = (await response.json()) as PilotSessionResponse;

      if (!active) {
        return;
      }

      if (!response.ok) {
        setMessage(body.error?.message ?? "Protected pilot sessions could not be loaded.");
        return;
      }

      setSessions(body.sessions ?? []);
    }

    async function loadAuditEvents(activeSession: Session, workspace: PilotWorkspaceRecord) {
      const response = await fetch(`/api/pilot-workspaces/${workspace.slug}/audit`, {
        headers: {
          Authorization: `Bearer ${activeSession.access_token}`
        }
      });
      const body = (await response.json()) as PilotAuditResponse;

      if (!active) {
        return;
      }

      if (!response.ok) {
        setMessage(body.error?.message ?? "Protected pilot audit events could not be loaded.");
        return;
      }

      setAuditEvents(body.events ?? []);
    }

    async function loadDemoReadinessSnapshots(activeSession: Session, workspace: PilotWorkspaceRecord) {
      const response = await fetch(`/api/pilot-workspaces/${workspace.slug}/demo-readiness`, {
        headers: {
          Authorization: `Bearer ${activeSession.access_token}`
        }
      });
      const body = (await response.json()) as DemoReadinessSnapshotResponse;

      if (!active) {
        return;
      }

      if (!response.ok) {
        setMessage(body.error?.message ?? "Demo readiness snapshots could not be loaded.");
        return;
      }

      setDemoReadinessSnapshots(body.snapshots ?? []);
    }

    async function loadManualQaEvidencePackets(activeSession: Session, workspace: PilotWorkspaceRecord) {
      const response = await fetch(
        `/api/pilot-workspaces/${workspace.slug}/qa-evidence/manual-run-packets`,
        {
          headers: {
            Authorization: `Bearer ${activeSession.access_token}`
          }
        }
      );
      const body = (await response.json()) as ManualQaEvidenceResponse;

      if (!active) {
        return;
      }

      if (!response.ok) {
        setMessage(body.error?.message ?? "Manual QA evidence packets could not be loaded.");
        return;
      }

      setManualQaEvidencePackets(body.packets ?? []);
    }

    async function loadCommandIntelligenceSnapshots(activeSession: Session, workspace: PilotWorkspaceRecord) {
      const response = await fetch(`/api/pilot-workspaces/${workspace.slug}/command-intelligence`, {
        headers: {
          Authorization: `Bearer ${activeSession.access_token}`
        }
      });
      const body = (await response.json()) as CommandIntelligenceResponse;

      if (!active) {
        return;
      }

      if (!response.ok) {
        setMessage(body.error?.message ?? "Command Intelligence snapshots could not be loaded.");
        return;
      }

      setCommandIntelligenceSnapshots(body.snapshots ?? []);
    }

    async function loadClinicalActivationApprovals(activeSession: Session, workspace: PilotWorkspaceRecord) {
      const response = await fetch(
        `/api/pilot-workspaces/${workspace.slug}/clinical-activation-approvals`,
        {
          headers: {
            Authorization: `Bearer ${activeSession.access_token}`
          }
        }
      );
      const body = (await response.json()) as ClinicalActivationApprovalResponse;

      if (!active) {
        return;
      }

      if (!response.ok) {
        setMessage(body.error?.message ?? "Clinical activation approvals could not be loaded.");
        return;
      }

      setClinicalActivationApprovalWorkflow(body.workflow ?? null);
    }

    async function loadProtectedOperatorMetrics(activeSession: Session, workspace: PilotWorkspaceRecord) {
      const response = await fetch(`/api/pilot-workspaces/${workspace.slug}/operator-metrics`, {
        headers: {
          Authorization: `Bearer ${activeSession.access_token}`
        }
      });
      const body = (await response.json()) as ProtectedOperatorMetricsResponse;

      if (!active) {
        return;
      }

      if (!response.ok) {
        setMessage(body.error?.message ?? "Protected operator metrics could not be loaded.");
        return;
      }

      setProtectedOperatorMetrics(body.metrics ?? []);
      setProtectedOperatorMetricDashboard(body.dashboard ?? null);
    }

    async function loadProtectedMetricRollups(activeSession: Session, workspace: PilotWorkspaceRecord) {
      const response = await fetch(`/api/pilot-workspaces/${workspace.slug}/metric-rollups`, {
        headers: {
          Authorization: `Bearer ${activeSession.access_token}`
        }
      });
      const body = (await response.json()) as ProtectedMetricRollupsResponse;

      if (!active) {
        return;
      }

      if (!response.ok) {
        setMessage(body.error?.message ?? "Protected metric rollups could not be loaded.");
        return;
      }

      setProtectedMetricRollupSnapshots(body.snapshots ?? []);
      setProtectedMetricRollupDashboard(body.dashboard ?? null);
    }

    async function loadProtectedMetricTrends(activeSession: Session, workspace: PilotWorkspaceRecord) {
      const response = await fetch(`/api/pilot-workspaces/${workspace.slug}/metric-trends`, {
        headers: {
          Authorization: `Bearer ${activeSession.access_token}`
        }
      });
      const body = (await response.json()) as ProtectedMetricTrendsResponse;

      if (!active) {
        return;
      }

      if (!response.ok) {
        setMessage(body.error?.message ?? "Protected metric trends could not be loaded.");
        return;
      }

      setProtectedMetricTrendReviews(body.reviews ?? []);
      setProtectedMetricTrendDashboard(body.dashboard ?? null);
    }

    async function loadProtectedBoardScorecards(activeSession: Session, workspace: PilotWorkspaceRecord) {
      const response = await fetch(`/api/pilot-workspaces/${workspace.slug}/board-scorecards`, {
        headers: {
          Authorization: `Bearer ${activeSession.access_token}`
        }
      });
      const body = (await response.json()) as ProtectedBoardScorecardsResponse;

      if (!active) {
        return;
      }

      if (!response.ok) {
        setMessage(body.error?.message ?? "Protected board scorecards could not be loaded.");
        return;
      }

      setProtectedBoardScorecards(body.scorecards ?? []);
      setProtectedBoardScorecardDashboard(body.dashboard ?? null);
    }

    async function loadProtectedFinanceMethodology(activeSession: Session, workspace: PilotWorkspaceRecord) {
      const response = await fetch(`/api/pilot-workspaces/${workspace.slug}/finance-methodology`, {
        headers: {
          Authorization: `Bearer ${activeSession.access_token}`
        }
      });
      const body = (await response.json()) as ProtectedFinanceMethodologyResponse;

      if (!active) {
        return;
      }

      if (!response.ok) {
        setMessage(body.error?.message ?? "Protected finance methodology gates could not be loaded.");
        return;
      }

      setProtectedFinanceMethodologyWorkflow(body.workflow ?? null);
    }

    async function loadProtectedExternalApprovalEvidence(
      activeSession: Session,
      workspace: PilotWorkspaceRecord
    ) {
      const response = await fetch(
        `/api/pilot-workspaces/${workspace.slug}/external-approval-evidence`,
        {
          headers: {
            Authorization: `Bearer ${activeSession.access_token}`
          }
        }
      );
      const body = (await response.json()) as ProtectedExternalApprovalEvidenceResponse;

      if (!active) {
        return;
      }

      if (!response.ok) {
        setMessage(body.error?.message ?? "Protected external approval evidence could not be loaded.");
        return;
      }

      setProtectedExternalApprovalEvidenceWorkflow(body.workflow ?? null);
      if (body.financeWorkflow) {
        setProtectedFinanceMethodologyWorkflow(body.financeWorkflow);
      }
    }

    async function loadProtectedReleaseDecision(
      activeSession: Session,
      workspace: PilotWorkspaceRecord
    ) {
      const response = await fetch(`/api/pilot-workspaces/${workspace.slug}/release-decisions`, {
        headers: {
          Authorization: `Bearer ${activeSession.access_token}`
        }
      });
      const body = (await response.json()) as ProtectedReleaseDecisionResponse;

      if (!active) {
        return;
      }

      if (!response.ok) {
        setMessage(body.error?.message ?? "Protected release decisions could not be loaded.");
        return;
      }

      setProtectedReleaseDecisionWorkflow(body.workflow ?? null);
      if (body.externalWorkflow) {
        setProtectedExternalApprovalEvidenceWorkflow(body.externalWorkflow);
      }
      if (body.financeWorkflow) {
        setProtectedFinanceMethodologyWorkflow(body.financeWorkflow);
      }
    }

    async function loadProtectedNamedReviewerSignoffs(
      activeSession: Session,
      workspace: PilotWorkspaceRecord
    ) {
      const response = await fetch(`/api/pilot-workspaces/${workspace.slug}/reviewer-signoffs`, {
        headers: {
          Authorization: `Bearer ${activeSession.access_token}`
        }
      });
      const body = (await response.json()) as ProtectedNamedReviewerSignoffResponse;

      if (!active) {
        return;
      }

      if (!response.ok) {
        setMessage(body.error?.message ?? "Protected named reviewer sign-offs could not be loaded.");
        return;
      }

      setProtectedNamedReviewerSignoffWorkflow(body.workflow ?? null);
      if (body.releaseWorkflow) {
        setProtectedReleaseDecisionWorkflow(body.releaseWorkflow);
      }
      if (body.externalWorkflow) {
        setProtectedExternalApprovalEvidenceWorkflow(body.externalWorkflow);
      }
      if (body.financeWorkflow) {
        setProtectedFinanceMethodologyWorkflow(body.financeWorkflow);
      }
    }

    async function loadProtectedDistributionLockboxes(
      activeSession: Session,
      workspace: PilotWorkspaceRecord
    ) {
      const response = await fetch(`/api/pilot-workspaces/${workspace.slug}/distribution-lockbox`, {
        headers: {
          Authorization: `Bearer ${activeSession.access_token}`
        }
      });
      const body = (await response.json()) as ProtectedDistributionLockboxResponse;

      if (!active) {
        return;
      }

      if (!response.ok) {
        setMessage(body.error?.message ?? "Protected distribution lockbox records could not be loaded.");
        return;
      }

      setProtectedDistributionLockboxWorkflow(body.workflow ?? null);
      if (body.signoffWorkflow) {
        setProtectedNamedReviewerSignoffWorkflow(body.signoffWorkflow);
      }
      if (body.releaseWorkflow) {
        setProtectedReleaseDecisionWorkflow(body.releaseWorkflow);
      }
      if (body.externalWorkflow) {
        setProtectedExternalApprovalEvidenceWorkflow(body.externalWorkflow);
      }
      if (body.financeWorkflow) {
        setProtectedFinanceMethodologyWorkflow(body.financeWorkflow);
      }
    }

    async function loadProtectedReleaseAuthorityAttestations(
      activeSession: Session,
      workspace: PilotWorkspaceRecord
    ) {
      const response = await fetch(
        `/api/pilot-workspaces/${workspace.slug}/release-authority-attestations`,
        {
          headers: {
            Authorization: `Bearer ${activeSession.access_token}`
          }
        }
      );
      const body = (await response.json()) as ProtectedReleaseAuthorityAttestationResponse;

      if (!active) {
        return;
      }

      if (!response.ok) {
        setMessage(
          body.error?.message ?? "Protected release authority attestations could not be loaded."
        );
        return;
      }

      setProtectedReleaseAuthorityAttestationWorkflow(body.workflow ?? null);
      if (body.lockboxWorkflow) {
        setProtectedDistributionLockboxWorkflow(body.lockboxWorkflow);
      }
      if (body.signoffWorkflow) {
        setProtectedNamedReviewerSignoffWorkflow(body.signoffWorkflow);
      }
      if (body.releaseWorkflow) {
        setProtectedReleaseDecisionWorkflow(body.releaseWorkflow);
      }
      if (body.externalWorkflow) {
        setProtectedExternalApprovalEvidenceWorkflow(body.externalWorkflow);
      }
      if (body.financeWorkflow) {
        setProtectedFinanceMethodologyWorkflow(body.financeWorkflow);
      }
    }

    async function loadProtectedEvidenceRoomRecipientAttestations(
      activeSession: Session,
      workspace: PilotWorkspaceRecord
    ) {
      const response = await fetch(
        `/api/pilot-workspaces/${workspace.slug}/evidence-room-recipient-attestations`,
        {
          headers: {
            Authorization: `Bearer ${activeSession.access_token}`
          }
        }
      );
      const body = (await response.json()) as ProtectedEvidenceRoomRecipientAttestationResponse;

      if (!active) {
        return;
      }

      if (!response.ok) {
        setMessage(
          body.error?.message ??
            "Protected evidence-room recipient attestations could not be loaded."
        );
        return;
      }

      setProtectedEvidenceRoomRecipientAttestationWorkflow(body.workflow ?? null);
      if (body.authorityWorkflow) {
        setProtectedReleaseAuthorityAttestationWorkflow(body.authorityWorkflow);
      }
      if (body.lockboxWorkflow) {
        setProtectedDistributionLockboxWorkflow(body.lockboxWorkflow);
      }
      if (body.signoffWorkflow) {
        setProtectedNamedReviewerSignoffWorkflow(body.signoffWorkflow);
      }
      if (body.releaseWorkflow) {
        setProtectedReleaseDecisionWorkflow(body.releaseWorkflow);
      }
      if (body.externalWorkflow) {
        setProtectedExternalApprovalEvidenceWorkflow(body.externalWorkflow);
      }
      if (body.financeWorkflow) {
        setProtectedFinanceMethodologyWorkflow(body.financeWorkflow);
      }
    }

    async function loadProtectedEvidenceRoomAccessLogReconciliation(
      activeSession: Session,
      workspace: PilotWorkspaceRecord
    ) {
      const response = await fetch(
        `/api/pilot-workspaces/${workspace.slug}/evidence-room-access-log-reconciliation`,
        {
          headers: {
            Authorization: `Bearer ${activeSession.access_token}`
          }
        }
      );
      const body = (await response.json()) as ProtectedEvidenceRoomAccessLogReconciliationResponse;

      if (!active) {
        return;
      }

      if (!response.ok) {
        setMessage(
          body.error?.message ??
            "Protected evidence-room access-log reconciliation could not be loaded."
        );
        return;
      }

      setProtectedEvidenceRoomAccessLogReconciliationWorkflow(body.workflow ?? null);
      if (body.recipientWorkflow) {
        setProtectedEvidenceRoomRecipientAttestationWorkflow(body.recipientWorkflow);
      }
      if (body.authorityWorkflow) {
        setProtectedReleaseAuthorityAttestationWorkflow(body.authorityWorkflow);
      }
      if (body.lockboxWorkflow) {
        setProtectedDistributionLockboxWorkflow(body.lockboxWorkflow);
      }
      if (body.signoffWorkflow) {
        setProtectedNamedReviewerSignoffWorkflow(body.signoffWorkflow);
      }
      if (body.releaseWorkflow) {
        setProtectedReleaseDecisionWorkflow(body.releaseWorkflow);
      }
      if (body.externalWorkflow) {
        setProtectedExternalApprovalEvidenceWorkflow(body.externalWorkflow);
      }
      if (body.financeWorkflow) {
        setProtectedFinanceMethodologyWorkflow(body.financeWorkflow);
      }
    }

    async function loadProtectedEvidenceRoomProviderAdapters(
      activeSession: Session,
      workspace: PilotWorkspaceRecord
    ) {
      const response = await fetch(
        `/api/pilot-workspaces/${workspace.slug}/evidence-room-provider-adapters`,
        {
          headers: {
            Authorization: `Bearer ${activeSession.access_token}`
          }
        }
      );
      const body = (await response.json()) as ProtectedEvidenceRoomProviderAdapterResponse;

      if (!active) {
        return;
      }

      if (!response.ok) {
        setMessage(
          body.error?.message ??
            "Protected evidence-room provider adapters could not be loaded."
        );
        return;
      }

      setProtectedEvidenceRoomProviderAdapterWorkflow(body.workflow ?? null);
      if (body.accessLogWorkflow) {
        setProtectedEvidenceRoomAccessLogReconciliationWorkflow(body.accessLogWorkflow);
      }
      if (body.recipientWorkflow) {
        setProtectedEvidenceRoomRecipientAttestationWorkflow(body.recipientWorkflow);
      }
      if (body.authorityWorkflow) {
        setProtectedReleaseAuthorityAttestationWorkflow(body.authorityWorkflow);
      }
      if (body.lockboxWorkflow) {
        setProtectedDistributionLockboxWorkflow(body.lockboxWorkflow);
      }
      if (body.signoffWorkflow) {
        setProtectedNamedReviewerSignoffWorkflow(body.signoffWorkflow);
      }
      if (body.releaseWorkflow) {
        setProtectedReleaseDecisionWorkflow(body.releaseWorkflow);
      }
      if (body.externalWorkflow) {
        setProtectedExternalApprovalEvidenceWorkflow(body.externalWorkflow);
      }
      if (body.financeWorkflow) {
        setProtectedFinanceMethodologyWorkflow(body.financeWorkflow);
      }
    }

    async function loadProtectedProviderSecurityReviews(
      activeSession: Session,
      workspace: PilotWorkspaceRecord
    ) {
      const response = await fetch(
        `/api/pilot-workspaces/${workspace.slug}/provider-security-reviews`,
        {
          headers: {
            Authorization: `Bearer ${activeSession.access_token}`
          }
        }
      );
      const body = (await response.json()) as ProtectedProviderSecurityReviewResponse;

      if (!active) {
        return;
      }

      if (!response.ok) {
        setMessage(
          body.error?.message ??
            "Protected provider security reviews could not be loaded."
        );
        return;
      }

      setProtectedProviderSecurityReviewWorkflow(body.workflow ?? null);
    }

    async function loadProtectedProcurementEvidenceRegistry(
      activeSession: Session,
      workspace: PilotWorkspaceRecord
    ) {
      const response = await fetch(
        `/api/pilot-workspaces/${workspace.slug}/procurement-evidence`,
        {
          headers: {
            Authorization: `Bearer ${activeSession.access_token}`
          }
        }
      );
      const body = (await response.json()) as ProtectedProcurementEvidenceRegistryResponse;

      if (!active) {
        return;
      }

      if (!response.ok) {
        setMessage(
          body.error?.message ??
            "Protected procurement evidence registry could not be loaded."
        );
        return;
      }

      setProtectedProcurementEvidenceRegistryWorkflow(body.workflow ?? null);
    }

    async function loadProtectedClinicalAuthorityEvidenceRoom(
      activeSession: Session,
      workspace: PilotWorkspaceRecord
    ) {
      const response = await fetch(
        `/api/pilot-workspaces/${workspace.slug}/clinical-authority-evidence-room`,
        {
          headers: {
            Authorization: `Bearer ${activeSession.access_token}`
          }
        }
      );
      const body = (await response.json()) as ProtectedClinicalAuthorityEvidenceRoomResponse;

      if (!active) {
        return;
      }

      if (!response.ok) {
        setMessage(
          body.error?.message ??
            "Protected Clinical Authority Evidence Room could not be loaded."
        );
        return;
      }

      setProtectedClinicalAuthorityEvidenceRoom(body.room ?? null);
    }

    async function loadProtectedClinicalAuthorityOwnerMatrix(
      activeSession: Session,
      workspace: PilotWorkspaceRecord
    ) {
      const response = await fetch(
        `/api/pilot-workspaces/${workspace.slug}/clinical-authority-owner-matrix`,
        {
          headers: {
            Authorization: `Bearer ${activeSession.access_token}`
          }
        }
      );
      const body = (await response.json()) as ProtectedClinicalAuthorityOwnerMatrixResponse;

      if (!active) {
        return;
      }

      if (!response.ok) {
        setMessage(
          body.error?.message ??
            "Protected Clinical Authority Owner Matrix could not be loaded."
        );
        return;
      }

      setProtectedClinicalAuthorityOwnerMatrix(body.matrix ?? null);
      if (body.evidenceRoom) {
        setProtectedClinicalAuthorityEvidenceRoom(body.evidenceRoom);
      }
    }

    async function loadProtectedClinicalAuthorityArtifactIntake(
      activeSession: Session,
      workspace: PilotWorkspaceRecord
    ) {
      const response = await fetch(
        `/api/pilot-workspaces/${workspace.slug}/clinical-authority-artifact-intake`,
        {
          headers: {
            Authorization: `Bearer ${activeSession.access_token}`
          }
        }
      );
      const body = (await response.json()) as ProtectedClinicalAuthorityArtifactIntakeResponse;

      if (!active) {
        return;
      }

      if (!response.ok) {
        setMessage(
          body.error?.message ??
            "Protected Clinical Authority Artifact Intake Checklist could not be loaded."
        );
        return;
      }

      setProtectedClinicalAuthorityArtifactIntake(body.checklist ?? null);
      if (body.matrix) {
        setProtectedClinicalAuthorityOwnerMatrix(body.matrix);
      }
      if (body.evidenceRoom) {
        setProtectedClinicalAuthorityEvidenceRoom(body.evidenceRoom);
      }
    }

    async function loadProtectedAuthorityArtifactReferences(
      activeSession: Session,
      workspace: PilotWorkspaceRecord
    ) {
      const response = await fetch(
        `/api/pilot-workspaces/${workspace.slug}/authority-artifact-references`,
        {
          headers: {
            Authorization: `Bearer ${activeSession.access_token}`
          }
        }
      );
      const body = (await response.json()) as ProtectedAuthorityArtifactReferenceResponse;

      if (!active) {
        return;
      }

      if (!response.ok) {
        setMessage(
          body.error?.message ??
            "Protected Authority Artifact References could not be loaded."
        );
        return;
      }

      setProtectedAuthorityArtifactReferenceWorkflow(body.workflow ?? null);
      if (body.checklist) {
        setProtectedClinicalAuthorityArtifactIntake(body.checklist);
      }
      if (body.matrix) {
        setProtectedClinicalAuthorityOwnerMatrix(body.matrix);
      }
      if (body.evidenceRoom) {
        setProtectedClinicalAuthorityEvidenceRoom(body.evidenceRoom);
      }
    }

    initializeAccess();
    const {
      data: { subscription }
    } = activeClient.auth.onAuthStateChange((_event, nextSession) => {
      void applySession(nextSession);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [
    resetProtectedMetricRollups,
    resetProtectedBoardScorecards,
    resetProtectedExternalApprovalEvidence,
    resetProtectedFinanceMethodology,
    resetProtectedMetricTrends,
    resetProtectedDistributionLockbox,
    resetProtectedEvidenceRoomAccessLogReconciliation,
    resetProtectedEvidenceRoomProviderAdapter,
    resetProtectedEvidenceRoomRecipientAttestation,
    resetProtectedClinicalAuthorityEvidenceRoom,
    resetProtectedClinicalAuthorityOwnerMatrix,
    resetProtectedClinicalAuthorityArtifactIntake,
    resetProtectedAuthorityArtifactReferences,
    resetProtectedProviderSecurityReview,
    resetProtectedProcurementEvidenceRegistry,
    resetProtectedReleaseAuthorityAttestation,
    resetProtectedNamedReviewerSignoff,
    resetProtectedOperatorMetrics,
    resetProtectedReleaseDecision,
    supabase
  ]);

  async function sendMagicLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase || !email.trim()) {
      return;
    }

    setStatus("sending-link");
    setMessage("");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/pilot-workspace/access`,
        shouldCreateUser: false
      }
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("signed-out");
    setMessage("If this identity is approved, check its enterprise email for the protected pilot access link.");
  }

  async function signInWithPasskey() {
    if (!supabase) {
      return;
    }

    setPasskeyStatus("signing-in");
    setStatus("loading");
    setMessage("");

    const { error } = await supabase.auth.signInWithPasskey();

    if (error) {
      setPasskeyStatus("idle");
      setStatus("signed-out");
      setMessage(error.message);
      return;
    }

    setPasskeyStatus("idle");
    setMessage("Passkey verified. Opening the governed workspace session.");
  }

  async function registerPasskey() {
    if (!supabase || !session) {
      return;
    }

    setPasskeyStatus("registering");
    setMessage("");

    const { data, error } = await supabase.auth.registerPasskey();

    setPasskeyStatus("idle");

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage(
      `Passkey registered${data.friendly_name ? `: ${data.friendly_name}` : ""}. Future sign-in can use the passkey button; governed workspace actions still require fresh assurance.`
    );
  }

  async function beginMfaEnrollment() {
    if (!supabase) {
      return;
    }

    setStatus("mfa-enrolling");
    setMessage("");
    setMfaQrCode("");

    const factors = await supabase.auth.mfa.listFactors();

    if (factors.error) {
      setStatus("mfa-required");
      setMessage(factors.error.message);
      return;
    }

    for (const factor of factors.data.all) {
      if (factor.factor_type === "totp" && factor.status === "unverified") {
        const removal = await supabase.auth.mfa.unenroll({ factorId: factor.id });

        if (removal.error) {
          setStatus("mfa-required");
          setMessage(removal.error.message);
          return;
        }
      }
    }

    const result = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "SCRIMED Protected Pilot"
    });

    if (result.error) {
      setStatus("mfa-required");
      setMessage(result.error.message);
      return;
    }

    setMfaFactorId(result.data.id);
    setMfaFactorStatus("unverified");
    setMfaQrCode(result.data.totp.qr_code);
    setStatus("mfa-required");
    setMessage("Scan the QR code with an authenticator app, then enter its current six-digit code.");
  }

  async function verifyMfa() {
    if (!supabase || !mfaFactorId || !mfaCode.trim()) {
      return;
    }

    setStatus("mfa-verifying");
    setMessage("");
    const verification = await supabase.auth.mfa.challengeAndVerify({
      factorId: mfaFactorId,
      code: mfaCode.trim()
    });

    if (verification.error) {
      setStatus("mfa-required");
      setMessage(verification.error.message);
      return;
    }

    setMfaCode("");
    setMfaFactorStatus("verified");
    setMessage("Authenticator verified. Upgrading the protected pilot session to AAL2.");
    window.location.reload();
  }

  async function signOut(scope: "local" | "global" = "local") {
    if (supabase) {
      await supabase.auth.signOut({ scope });
    }
  }

  async function selectWorkspace(workspace: PilotWorkspaceRecord) {
    if (!session) {
      return;
    }

    setSelectedWorkspace(workspace);
    setDemoReadinessSnapshots([]);
    setManualQaEvidencePackets([]);
    setCommandIntelligenceSnapshots([]);
    setDemoPacketBusyId(null);
    setDemoSnapshotStatus("idle");
    setCommandPacketBusyId(null);
    setCommandSnapshotStatus("idle");
    setBuyerRoomPacketStatus("idle");
    setClinicalDossierPacketStatus("idle");
    setClinicalApprovalPacketStatus("idle");
    setClinicalApprovalBusyDomainId(null);
    setClinicalActivationApprovalWorkflow(null);
    resetProtectedOperatorMetrics();
    resetProtectedMetricRollups();
    resetProtectedMetricTrends();
    resetProtectedBoardScorecards();
    resetProtectedFinanceMethodology();
    resetProtectedExternalApprovalEvidence();
    resetProtectedReleaseDecision();
    resetProtectedNamedReviewerSignoff();
    resetProtectedDistributionLockbox();
    resetProtectedReleaseAuthorityAttestation();
    resetProtectedEvidenceRoomRecipientAttestation();
    resetProtectedEvidenceRoomAccessLogReconciliation();
    resetProtectedEvidenceRoomProviderAdapter();
    resetProtectedProviderSecurityReview();
    resetProtectedProcurementEvidenceRegistry();
    resetProtectedClinicalAuthorityEvidenceRoom();
    resetProtectedClinicalAuthorityOwnerMatrix();
    resetProtectedClinicalAuthorityArtifactIntake();
    resetProtectedAuthorityArtifactReferences();
    setVerificationReadiness(null);
    setStatus("loading");
    setMessage("");
    const response = await fetch(`/api/pilot-workspaces/${workspace.slug}/sessions`, {
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    });
    const body = (await response.json()) as PilotSessionResponse;

    if (!response.ok) {
      setStatus("error");
      setMessage(body.error?.message ?? "Protected pilot sessions could not be loaded.");
      return;
    }

    setSessions(body.sessions ?? []);
    await Promise.all([
      refreshAuditEvents(session, workspace),
      refreshDemoReadinessSnapshots(session, workspace),
      refreshManualQaEvidencePackets(session, workspace),
      refreshCommandIntelligenceSnapshots(session, workspace),
      refreshClinicalActivationApprovals(session, workspace),
      refreshProtectedOperatorMetrics(session, workspace),
      refreshProtectedMetricRollups(session, workspace),
      refreshProtectedMetricTrends(session, workspace),
      refreshProtectedBoardScorecards(session, workspace),
      refreshProtectedFinanceMethodology(session, workspace),
      refreshProtectedExternalApprovalEvidence(session, workspace),
      refreshProtectedReleaseDecision(session, workspace),
      refreshProtectedNamedReviewerSignoffs(session, workspace),
      refreshProtectedDistributionLockboxes(session, workspace),
      refreshProtectedReleaseAuthorityAttestations(session, workspace),
      refreshProtectedEvidenceRoomRecipientAttestations(session, workspace),
      refreshProtectedEvidenceRoomAccessLogReconciliation(session, workspace),
      refreshProtectedEvidenceRoomProviderAdapters(session, workspace),
      refreshProtectedProviderSecurityReviews(session, workspace),
      refreshProtectedProcurementEvidenceRegistry(session, workspace),
      refreshProtectedClinicalAuthorityEvidenceRoom(session, workspace),
      refreshProtectedClinicalAuthorityOwnerMatrix(session, workspace),
      refreshProtectedClinicalAuthorityArtifactIntake(session, workspace),
      refreshProtectedAuthorityArtifactReferences(session, workspace)
    ]);
    setStatus("ready");
  }

  async function refreshAuditEvents(activeSession: Session, workspace: PilotWorkspaceRecord) {
    const response = await fetch(`/api/pilot-workspaces/${workspace.slug}/audit`, {
      headers: {
        Authorization: `Bearer ${activeSession.access_token}`
      }
    });
    const body = (await response.json()) as PilotAuditResponse;

    if (!response.ok) {
      setMessage(body.error?.message ?? "Protected pilot audit events could not be loaded.");
      return;
    }

    setAuditEvents(body.events ?? []);
  }

  async function refreshDemoReadinessSnapshots(activeSession: Session, workspace: PilotWorkspaceRecord) {
    const response = await fetch(`/api/pilot-workspaces/${workspace.slug}/demo-readiness`, {
      headers: {
        Authorization: `Bearer ${activeSession.access_token}`
      }
    });
    const body = (await response.json()) as DemoReadinessSnapshotResponse;

    if (!response.ok) {
      setMessage(body.error?.message ?? "Demo readiness snapshots could not be loaded.");
      return;
    }

    setDemoReadinessSnapshots(body.snapshots ?? []);
  }

  async function refreshManualQaEvidencePackets(activeSession: Session, workspace: PilotWorkspaceRecord) {
    const response = await fetch(`/api/pilot-workspaces/${workspace.slug}/qa-evidence/manual-run-packets`, {
      headers: {
        Authorization: `Bearer ${activeSession.access_token}`
      }
    });
    const body = (await response.json()) as ManualQaEvidenceResponse;

    if (!response.ok) {
      setMessage(body.error?.message ?? "Manual QA evidence packets could not be loaded.");
      return;
    }

    setManualQaEvidencePackets(body.packets ?? []);
  }

  async function refreshCommandIntelligenceSnapshots(activeSession: Session, workspace: PilotWorkspaceRecord) {
    const response = await fetch(`/api/pilot-workspaces/${workspace.slug}/command-intelligence`, {
      headers: {
        Authorization: `Bearer ${activeSession.access_token}`
      }
    });
    const body = (await response.json()) as CommandIntelligenceResponse;

    if (!response.ok) {
      setMessage(body.error?.message ?? "Command Intelligence snapshots could not be loaded.");
      return;
    }

    setCommandIntelligenceSnapshots(body.snapshots ?? []);
  }

  async function refreshClinicalActivationApprovals(activeSession: Session, workspace: PilotWorkspaceRecord) {
    const response = await fetch(
      `/api/pilot-workspaces/${workspace.slug}/clinical-activation-approvals`,
      {
        headers: {
          Authorization: `Bearer ${activeSession.access_token}`
        }
      }
    );
    const body = (await response.json()) as ClinicalActivationApprovalResponse;

    if (!response.ok) {
      setMessage(body.error?.message ?? "Clinical activation approvals could not be loaded.");
      return;
    }

    setClinicalActivationApprovalWorkflow(body.workflow ?? null);
  }

  async function refreshProtectedOperatorMetrics(activeSession: Session, workspace: PilotWorkspaceRecord) {
    const response = await fetch(`/api/pilot-workspaces/${workspace.slug}/operator-metrics`, {
      headers: {
        Authorization: `Bearer ${activeSession.access_token}`
      }
    });
    const body = (await response.json()) as ProtectedOperatorMetricsResponse;

    if (!response.ok) {
      setMessage(body.error?.message ?? "Protected operator metrics could not be loaded.");
      return;
    }

    setProtectedOperatorMetrics(body.metrics ?? []);
    setProtectedOperatorMetricDashboard(body.dashboard ?? null);
  }

  async function refreshProtectedMetricRollups(activeSession: Session, workspace: PilotWorkspaceRecord) {
    const response = await fetch(`/api/pilot-workspaces/${workspace.slug}/metric-rollups`, {
      headers: {
        Authorization: `Bearer ${activeSession.access_token}`
      }
    });
    const body = (await response.json()) as ProtectedMetricRollupsResponse;

    if (!response.ok) {
      setMessage(body.error?.message ?? "Protected metric rollups could not be loaded.");
      return;
    }

    setProtectedMetricRollupSnapshots(body.snapshots ?? []);
    setProtectedMetricRollupDashboard(body.dashboard ?? null);
  }

  async function refreshProtectedMetricTrends(activeSession: Session, workspace: PilotWorkspaceRecord) {
    const response = await fetch(`/api/pilot-workspaces/${workspace.slug}/metric-trends`, {
      headers: {
        Authorization: `Bearer ${activeSession.access_token}`
      }
    });
    const body = (await response.json()) as ProtectedMetricTrendsResponse;

    if (!response.ok) {
      setMessage(body.error?.message ?? "Protected metric trends could not be loaded.");
      return;
    }

    setProtectedMetricTrendReviews(body.reviews ?? []);
    setProtectedMetricTrendDashboard(body.dashboard ?? null);
  }

  async function refreshProtectedBoardScorecards(activeSession: Session, workspace: PilotWorkspaceRecord) {
    const response = await fetch(`/api/pilot-workspaces/${workspace.slug}/board-scorecards`, {
      headers: {
        Authorization: `Bearer ${activeSession.access_token}`
      }
    });
    const body = (await response.json()) as ProtectedBoardScorecardsResponse;

    if (!response.ok) {
      setMessage(body.error?.message ?? "Protected board scorecards could not be loaded.");
      return;
    }

    setProtectedBoardScorecards(body.scorecards ?? []);
    setProtectedBoardScorecardDashboard(body.dashboard ?? null);
  }

  async function refreshProtectedFinanceMethodology(activeSession: Session, workspace: PilotWorkspaceRecord) {
    const response = await fetch(`/api/pilot-workspaces/${workspace.slug}/finance-methodology`, {
      headers: {
        Authorization: `Bearer ${activeSession.access_token}`
      }
    });
    const body = (await response.json()) as ProtectedFinanceMethodologyResponse;

    if (!response.ok) {
      setMessage(body.error?.message ?? "Protected finance methodology gates could not be loaded.");
      return;
    }

    setProtectedFinanceMethodologyWorkflow(body.workflow ?? null);
  }

  async function refreshProtectedExternalApprovalEvidence(
    activeSession: Session,
    workspace: PilotWorkspaceRecord
  ) {
    const response = await fetch(
      `/api/pilot-workspaces/${workspace.slug}/external-approval-evidence`,
      {
        headers: {
          Authorization: `Bearer ${activeSession.access_token}`
        }
      }
    );
    const body = (await response.json()) as ProtectedExternalApprovalEvidenceResponse;

    if (!response.ok) {
      setMessage(body.error?.message ?? "Protected external approval evidence could not be loaded.");
      return;
    }

    setProtectedExternalApprovalEvidenceWorkflow(body.workflow ?? null);
    if (body.financeWorkflow) {
      setProtectedFinanceMethodologyWorkflow(body.financeWorkflow);
    }
  }

  async function refreshProtectedReleaseDecision(activeSession: Session, workspace: PilotWorkspaceRecord) {
    const response = await fetch(`/api/pilot-workspaces/${workspace.slug}/release-decisions`, {
      headers: {
        Authorization: `Bearer ${activeSession.access_token}`
      }
    });
    const body = (await response.json()) as ProtectedReleaseDecisionResponse;

    if (!response.ok) {
      setMessage(body.error?.message ?? "Protected release decisions could not be loaded.");
      return;
    }

    setProtectedReleaseDecisionWorkflow(body.workflow ?? null);
    if (body.externalWorkflow) {
      setProtectedExternalApprovalEvidenceWorkflow(body.externalWorkflow);
    }
    if (body.financeWorkflow) {
      setProtectedFinanceMethodologyWorkflow(body.financeWorkflow);
    }
  }

  async function refreshProtectedNamedReviewerSignoffs(
    activeSession: Session,
    workspace: PilotWorkspaceRecord
  ) {
    const response = await fetch(`/api/pilot-workspaces/${workspace.slug}/reviewer-signoffs`, {
      headers: {
        Authorization: `Bearer ${activeSession.access_token}`
      }
    });
    const body = (await response.json()) as ProtectedNamedReviewerSignoffResponse;

    if (!response.ok) {
      setMessage(body.error?.message ?? "Protected named reviewer sign-offs could not be loaded.");
      return;
    }

    setProtectedNamedReviewerSignoffWorkflow(body.workflow ?? null);
    if (body.releaseWorkflow) {
      setProtectedReleaseDecisionWorkflow(body.releaseWorkflow);
    }
    if (body.externalWorkflow) {
      setProtectedExternalApprovalEvidenceWorkflow(body.externalWorkflow);
    }
    if (body.financeWorkflow) {
      setProtectedFinanceMethodologyWorkflow(body.financeWorkflow);
    }
  }

  async function refreshProtectedDistributionLockboxes(
    activeSession: Session,
    workspace: PilotWorkspaceRecord
  ) {
    const response = await fetch(`/api/pilot-workspaces/${workspace.slug}/distribution-lockbox`, {
      headers: {
        Authorization: `Bearer ${activeSession.access_token}`
      }
    });
    const body = (await response.json()) as ProtectedDistributionLockboxResponse;

    if (!response.ok) {
      setMessage(body.error?.message ?? "Protected distribution lockbox records could not be loaded.");
      return;
    }

    setProtectedDistributionLockboxWorkflow(body.workflow ?? null);
    if (body.signoffWorkflow) {
      setProtectedNamedReviewerSignoffWorkflow(body.signoffWorkflow);
    }
    if (body.releaseWorkflow) {
      setProtectedReleaseDecisionWorkflow(body.releaseWorkflow);
    }
    if (body.externalWorkflow) {
      setProtectedExternalApprovalEvidenceWorkflow(body.externalWorkflow);
    }
    if (body.financeWorkflow) {
      setProtectedFinanceMethodologyWorkflow(body.financeWorkflow);
    }
  }

  async function refreshProtectedReleaseAuthorityAttestations(
    activeSession: Session,
    workspace: PilotWorkspaceRecord
  ) {
    const response = await fetch(
      `/api/pilot-workspaces/${workspace.slug}/release-authority-attestations`,
      {
        headers: {
          Authorization: `Bearer ${activeSession.access_token}`
        }
      }
    );
    const body = (await response.json()) as ProtectedReleaseAuthorityAttestationResponse;

    if (!response.ok) {
      setMessage(body.error?.message ?? "Protected release authority attestations could not be loaded.");
      return;
    }

    setProtectedReleaseAuthorityAttestationWorkflow(body.workflow ?? null);
    if (body.lockboxWorkflow) {
      setProtectedDistributionLockboxWorkflow(body.lockboxWorkflow);
    }
    if (body.signoffWorkflow) {
      setProtectedNamedReviewerSignoffWorkflow(body.signoffWorkflow);
    }
    if (body.releaseWorkflow) {
      setProtectedReleaseDecisionWorkflow(body.releaseWorkflow);
    }
    if (body.externalWorkflow) {
      setProtectedExternalApprovalEvidenceWorkflow(body.externalWorkflow);
    }
    if (body.financeWorkflow) {
      setProtectedFinanceMethodologyWorkflow(body.financeWorkflow);
    }
  }

  async function refreshProtectedEvidenceRoomRecipientAttestations(
    activeSession: Session,
    workspace: PilotWorkspaceRecord
  ) {
    const response = await fetch(
      `/api/pilot-workspaces/${workspace.slug}/evidence-room-recipient-attestations`,
      {
        headers: {
          Authorization: `Bearer ${activeSession.access_token}`
        }
      }
    );
    const body = (await response.json()) as ProtectedEvidenceRoomRecipientAttestationResponse;

    if (!response.ok) {
      setMessage(
        body.error?.message ??
          "Protected evidence-room recipient attestations could not be loaded."
      );
      return;
    }

    setProtectedEvidenceRoomRecipientAttestationWorkflow(body.workflow ?? null);
    if (body.authorityWorkflow) {
      setProtectedReleaseAuthorityAttestationWorkflow(body.authorityWorkflow);
    }
    if (body.lockboxWorkflow) {
      setProtectedDistributionLockboxWorkflow(body.lockboxWorkflow);
    }
    if (body.signoffWorkflow) {
      setProtectedNamedReviewerSignoffWorkflow(body.signoffWorkflow);
    }
    if (body.releaseWorkflow) {
      setProtectedReleaseDecisionWorkflow(body.releaseWorkflow);
    }
    if (body.externalWorkflow) {
      setProtectedExternalApprovalEvidenceWorkflow(body.externalWorkflow);
    }
    if (body.financeWorkflow) {
      setProtectedFinanceMethodologyWorkflow(body.financeWorkflow);
    }
  }

  async function refreshProtectedEvidenceRoomAccessLogReconciliation(
    activeSession: Session,
    workspace: PilotWorkspaceRecord
  ) {
    const response = await fetch(
      `/api/pilot-workspaces/${workspace.slug}/evidence-room-access-log-reconciliation`,
      {
        headers: {
          Authorization: `Bearer ${activeSession.access_token}`
        }
      }
    );
    const body = (await response.json()) as ProtectedEvidenceRoomAccessLogReconciliationResponse;

    if (!response.ok) {
      setMessage(
        body.error?.message ??
          "Protected evidence-room access-log reconciliation could not be loaded."
      );
      return;
    }

    setProtectedEvidenceRoomAccessLogReconciliationWorkflow(body.workflow ?? null);
    if (body.recipientWorkflow) {
      setProtectedEvidenceRoomRecipientAttestationWorkflow(body.recipientWorkflow);
    }
    if (body.authorityWorkflow) {
      setProtectedReleaseAuthorityAttestationWorkflow(body.authorityWorkflow);
    }
    if (body.lockboxWorkflow) {
      setProtectedDistributionLockboxWorkflow(body.lockboxWorkflow);
    }
    if (body.signoffWorkflow) {
      setProtectedNamedReviewerSignoffWorkflow(body.signoffWorkflow);
    }
    if (body.releaseWorkflow) {
      setProtectedReleaseDecisionWorkflow(body.releaseWorkflow);
    }
    if (body.externalWorkflow) {
      setProtectedExternalApprovalEvidenceWorkflow(body.externalWorkflow);
    }
    if (body.financeWorkflow) {
      setProtectedFinanceMethodologyWorkflow(body.financeWorkflow);
    }
  }

  async function refreshProtectedEvidenceRoomProviderAdapters(
    activeSession: Session,
    workspace: PilotWorkspaceRecord
  ) {
    const response = await fetch(
      `/api/pilot-workspaces/${workspace.slug}/evidence-room-provider-adapters`,
      {
        headers: {
          Authorization: `Bearer ${activeSession.access_token}`
        }
      }
    );
    const body = (await response.json()) as ProtectedEvidenceRoomProviderAdapterResponse;

    if (!response.ok) {
      setMessage(
        body.error?.message ??
          "Protected evidence-room provider adapters could not be loaded."
      );
      return;
    }

    setProtectedEvidenceRoomProviderAdapterWorkflow(body.workflow ?? null);
    if (body.accessLogWorkflow) {
      setProtectedEvidenceRoomAccessLogReconciliationWorkflow(body.accessLogWorkflow);
    }
    if (body.recipientWorkflow) {
      setProtectedEvidenceRoomRecipientAttestationWorkflow(body.recipientWorkflow);
    }
    if (body.authorityWorkflow) {
      setProtectedReleaseAuthorityAttestationWorkflow(body.authorityWorkflow);
    }
    if (body.lockboxWorkflow) {
      setProtectedDistributionLockboxWorkflow(body.lockboxWorkflow);
    }
    if (body.signoffWorkflow) {
      setProtectedNamedReviewerSignoffWorkflow(body.signoffWorkflow);
    }
    if (body.releaseWorkflow) {
      setProtectedReleaseDecisionWorkflow(body.releaseWorkflow);
    }
    if (body.externalWorkflow) {
      setProtectedExternalApprovalEvidenceWorkflow(body.externalWorkflow);
    }
    if (body.financeWorkflow) {
      setProtectedFinanceMethodologyWorkflow(body.financeWorkflow);
    }
  }

  async function refreshProtectedProviderSecurityReviews(
    activeSession: Session,
    workspace: PilotWorkspaceRecord
  ) {
    const response = await fetch(
      `/api/pilot-workspaces/${workspace.slug}/provider-security-reviews`,
      {
        headers: {
          Authorization: `Bearer ${activeSession.access_token}`
        }
      }
    );
    const body = (await response.json()) as ProtectedProviderSecurityReviewResponse;

    if (!response.ok) {
      setMessage(
        body.error?.message ??
          "Protected provider security reviews could not be loaded."
      );
      return;
    }

    setProtectedProviderSecurityReviewWorkflow(body.workflow ?? null);
  }

  async function refreshProtectedProcurementEvidenceRegistry(
    activeSession: Session,
    workspace: PilotWorkspaceRecord
  ) {
    const response = await fetch(
      `/api/pilot-workspaces/${workspace.slug}/procurement-evidence`,
      {
        headers: {
          Authorization: `Bearer ${activeSession.access_token}`
        }
      }
    );
    const body = (await response.json()) as ProtectedProcurementEvidenceRegistryResponse;

    if (!response.ok) {
      setMessage(
        body.error?.message ??
          "Protected procurement evidence registry could not be loaded."
      );
      return;
    }

    setProtectedProcurementEvidenceRegistryWorkflow(body.workflow ?? null);
  }

  async function refreshProtectedClinicalAuthorityEvidenceRoom(
    activeSession: Session,
    workspace: PilotWorkspaceRecord
  ) {
    const response = await fetch(
      `/api/pilot-workspaces/${workspace.slug}/clinical-authority-evidence-room`,
      {
        headers: {
          Authorization: `Bearer ${activeSession.access_token}`
        }
      }
    );
    const body = (await response.json()) as ProtectedClinicalAuthorityEvidenceRoomResponse;

    if (!response.ok) {
      setMessage(
        body.error?.message ??
          "Protected Clinical Authority Evidence Room could not be loaded."
      );
      return;
    }

    setProtectedClinicalAuthorityEvidenceRoom(body.room ?? null);
  }

  async function refreshProtectedClinicalAuthorityOwnerMatrix(
    activeSession: Session,
    workspace: PilotWorkspaceRecord
  ) {
    const response = await fetch(
      `/api/pilot-workspaces/${workspace.slug}/clinical-authority-owner-matrix`,
      {
        headers: {
          Authorization: `Bearer ${activeSession.access_token}`
        }
      }
    );
    const body = (await response.json()) as ProtectedClinicalAuthorityOwnerMatrixResponse;

    if (!response.ok) {
      setMessage(
        body.error?.message ??
          "Protected Clinical Authority Owner Matrix could not be loaded."
      );
      return;
    }

    setProtectedClinicalAuthorityOwnerMatrix(body.matrix ?? null);
    if (body.evidenceRoom) {
      setProtectedClinicalAuthorityEvidenceRoom(body.evidenceRoom);
    }
  }

  async function refreshProtectedClinicalAuthorityArtifactIntake(
    activeSession: Session,
    workspace: PilotWorkspaceRecord
  ) {
    const response = await fetch(
      `/api/pilot-workspaces/${workspace.slug}/clinical-authority-artifact-intake`,
      {
        headers: {
          Authorization: `Bearer ${activeSession.access_token}`
        }
      }
    );
    const body = (await response.json()) as ProtectedClinicalAuthorityArtifactIntakeResponse;

    if (!response.ok) {
      setMessage(
        body.error?.message ??
          "Protected Clinical Authority Artifact Intake Checklist could not be loaded."
      );
      return;
    }

    setProtectedClinicalAuthorityArtifactIntake(body.checklist ?? null);
    if (body.matrix) {
      setProtectedClinicalAuthorityOwnerMatrix(body.matrix);
    }
    if (body.evidenceRoom) {
      setProtectedClinicalAuthorityEvidenceRoom(body.evidenceRoom);
    }
  }

  async function refreshProtectedAuthorityArtifactReferences(
    activeSession: Session,
    workspace: PilotWorkspaceRecord
  ) {
    const response = await fetch(
      `/api/pilot-workspaces/${workspace.slug}/authority-artifact-references`,
      {
        headers: {
          Authorization: `Bearer ${activeSession.access_token}`
        }
      }
    );
    const body = (await response.json()) as ProtectedAuthorityArtifactReferenceResponse;

    if (!response.ok) {
      setMessage(
        body.error?.message ??
          "Protected Authority Artifact References could not be loaded."
      );
      return;
    }

    setProtectedAuthorityArtifactReferenceWorkflow(body.workflow ?? null);
    if (body.checklist) {
      setProtectedClinicalAuthorityArtifactIntake(body.checklist);
    }
    if (body.matrix) {
      setProtectedClinicalAuthorityOwnerMatrix(body.matrix);
    }
    if (body.evidenceRoom) {
      setProtectedClinicalAuthorityEvidenceRoom(body.evidenceRoom);
    }
  }

  async function createSyntheticSession() {
    if (!session || !selectedWorkspace) {
      return;
    }

    setStatus("creating-session");
    setMessage("");
    const response = await fetch(`/api/pilot-workspaces/${selectedWorkspace.slug}/sessions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(syntheticSessionRequest)
    });
    const body = (await response.json()) as PilotSessionResponse;

    if (!response.ok) {
      setStatus("error");
      setMessage(body.error?.message ?? "The governed synthetic pilot session could not be created.");
      return;
    }

    if (body.session) {
      setSessions((current) => [body.session!, ...current]);
    }
    await refreshAuditEvents(session, selectedWorkspace);
    setStatus("ready");
    setMessage("Governed synthetic pilot session created with durable audit evidence.");
  }

  async function downloadProofPacket(pilotSession: PilotSessionRecord) {
    if (!session || !selectedWorkspace) {
      return;
    }

    setMessage("");
    const response = await fetch(
      `/api/pilot-workspaces/${selectedWorkspace.slug}/sessions/${pilotSession.id}/proof-packet`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      }
    );

    if (!response.ok) {
      const body = (await response.json()) as PilotSessionResponse;
      setMessage(body.error?.message ?? "The audited proof packet could not be downloaded.");
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `scrimed-${selectedWorkspace.slug}-${pilotSession.id}-proof-packet.md`;
    link.click();
    URL.revokeObjectURL(url);
    await refreshAuditEvents(session, selectedWorkspace);
    setMessage("Proof packet downloaded and its audit event was committed.");
  }

  async function downloadEnterpriseProofPacket() {
    if (!session || !selectedWorkspace) {
      return;
    }

    setEnterprisePacketStatus("downloading");
    setMessage("");
    const response = await fetch(
      `/api/pilot-workspaces/${selectedWorkspace.slug}/enterprise-proof-packet`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      }
    );

    setEnterprisePacketStatus("idle");

    if (!response.ok) {
      const body = (await response.json()) as ProofPacketResponse;
      setMessage(body.error?.message ?? "The enterprise proof packet could not be downloaded.");
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `scrimed-${selectedWorkspace.slug}-enterprise-proof-packet.md`;
    link.click();
    URL.revokeObjectURL(url);
    await refreshAuditEvents(session, selectedWorkspace);
    setMessage("Enterprise proof packet downloaded and its audit event was committed.");
  }

  async function createDemoReadinessSnapshot() {
    if (!session || !selectedWorkspace) {
      return;
    }

    setDemoSnapshotStatus("saving");
    setMessage("");
    const response = await fetch(`/api/pilot-workspaces/${selectedWorkspace.slug}/demo-readiness`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ verification: verificationReadiness })
    });
    const body = (await response.json()) as DemoReadinessSnapshotResponse;

    setDemoSnapshotStatus("idle");

    if (!response.ok) {
      setMessage(body.error?.message ?? "The demo readiness snapshot could not be saved.");
      return;
    }

    setDemoReadinessSnapshots(body.snapshots ?? (body.snapshot ? [body.snapshot] : []));
    await refreshAuditEvents(session, selectedWorkspace);
    setMessage("Demo readiness snapshot saved with append-only audit evidence.");
  }

  async function downloadDemoReadinessPacket(snapshot: PilotDemoReadinessSnapshotRecord) {
    if (!session || !selectedWorkspace) {
      return;
    }

    setDemoPacketBusyId(snapshot.id);
    setMessage("");
    const response = await fetch(
      `/api/pilot-workspaces/${selectedWorkspace.slug}/demo-readiness/${snapshot.id}/packet`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      }
    );

    setDemoPacketBusyId(null);

    if (!response.ok) {
      const body = (await response.json()) as ProofPacketResponse;
      setMessage(body.error?.message ?? "The demo readiness packet could not be downloaded.");
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `scrimed-${selectedWorkspace.slug}-${snapshot.id}-demo-readiness-packet.md`;
    link.click();
    URL.revokeObjectURL(url);
    await refreshAuditEvents(session, selectedWorkspace);
    setMessage("Demo readiness packet downloaded and its audit event was committed.");
  }

  async function createCommandIntelligenceSnapshot() {
    if (!session || !selectedWorkspace) {
      return;
    }

    setCommandSnapshotStatus("saving");
    setMessage("");
    const response = await fetch(
      `/api/pilot-workspaces/${selectedWorkspace.slug}/command-intelligence`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          operatorAttestation: commandIntelligenceSnapshotOperatorAttestation
        })
      }
    );
    const body = (await response.json()) as CommandIntelligenceResponse;

    setCommandSnapshotStatus("idle");

    if (!response.ok) {
      setMessage(body.error?.message ?? "The Command Intelligence snapshot could not be saved.");
      return;
    }

    setCommandIntelligenceSnapshots(body.snapshots ?? (body.snapshot ? [body.snapshot] : []));
    await refreshAuditEvents(session, selectedWorkspace);
    await refreshProtectedClinicalAuthorityEvidenceRoom(session, selectedWorkspace);
    await refreshProtectedClinicalAuthorityOwnerMatrix(session, selectedWorkspace);
    await refreshProtectedClinicalAuthorityArtifactIntake(session, selectedWorkspace);
    await refreshProtectedAuthorityArtifactReferences(session, selectedWorkspace);
    setMessage("Command Intelligence snapshot saved with append-only audit evidence.");
  }

  async function downloadCommandIntelligencePacket(snapshot: CommandIntelligenceSnapshotRecord) {
    if (!session || !selectedWorkspace) {
      return;
    }

    setCommandPacketBusyId(snapshot.id);
    setMessage("");
    const response = await fetch(
      `/api/pilot-workspaces/${selectedWorkspace.slug}/command-intelligence/${snapshot.id}/packet`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      }
    );

    setCommandPacketBusyId(null);

    if (!response.ok) {
      const body = (await response.json()) as ProofPacketResponse;
      setMessage(body.error?.message ?? "The Command Intelligence packet could not be downloaded.");
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `scrimed-${selectedWorkspace.slug}-${snapshot.id}-command-intelligence-packet.md`;
    link.click();
    URL.revokeObjectURL(url);
    await refreshAuditEvents(session, selectedWorkspace);
    setMessage("Command Intelligence packet downloaded and its audit event was committed.");
  }

  async function downloadBuyerPilotRoomPacket() {
    if (!session || !selectedWorkspace) {
      return;
    }

    setBuyerRoomPacketStatus("downloading");
    setMessage("");
    const response = await fetch(
      `/api/pilot-workspaces/${selectedWorkspace.slug}/buyer-room/packet`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      }
    );

    setBuyerRoomPacketStatus("idle");

    if (!response.ok) {
      const body = (await response.json()) as ProofPacketResponse;
      setMessage(body.error?.message ?? "The Buyer Diligence Export could not be downloaded.");
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `scrimed-${selectedWorkspace.slug}-buyer-diligence-export.md`;
    link.click();
    URL.revokeObjectURL(url);
    await refreshAuditEvents(session, selectedWorkspace);
    setMessage("Buyer Diligence Export downloaded and its audit event was committed.");
  }

  async function downloadClinicalActivationDossierPacket() {
    if (!session || !selectedWorkspace) {
      return;
    }

    setClinicalDossierPacketStatus("downloading");
    setMessage("");
    const response = await fetch(
      `/api/pilot-workspaces/${selectedWorkspace.slug}/clinical-activation-dossier/packet`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      }
    );

    setClinicalDossierPacketStatus("idle");

    if (!response.ok) {
      const body = (await response.json()) as ProofPacketResponse;
      setMessage(body.error?.message ?? "The Clinical Activation Dossier could not be downloaded.");
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `scrimed-${selectedWorkspace.slug}-clinical-activation-dossier.md`;
    link.click();
    URL.revokeObjectURL(url);
    await refreshAuditEvents(session, selectedWorkspace);
    setMessage("Clinical Activation Dossier downloaded and its audit event was committed.");
  }

  async function recordClinicalActivationApproval(domainId: string) {
    if (!session || !selectedWorkspace) {
      return;
    }

    setClinicalApprovalBusyDomainId(domainId);
    setMessage("");
    const response = await fetch(
      `/api/pilot-workspaces/${selectedWorkspace.slug}/clinical-activation-approvals`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          domainId,
          attestation: clinicalActivationApprovalAttestation
        })
      }
    );
    const body = (await response.json()) as ClinicalActivationApprovalResponse;

    setClinicalApprovalBusyDomainId(null);

    if (!response.ok) {
      setMessage(body.error?.message ?? "The no-PHI clinical activation approval could not be recorded.");
      return;
    }

    setClinicalActivationApprovalWorkflow(body.workflow ?? clinicalActivationApprovalWorkflow);
    await refreshAuditEvents(session, selectedWorkspace);
    await refreshProtectedClinicalAuthorityEvidenceRoom(session, selectedWorkspace);
    await refreshProtectedClinicalAuthorityOwnerMatrix(session, selectedWorkspace);
    await refreshProtectedClinicalAuthorityArtifactIntake(session, selectedWorkspace);
    await refreshProtectedAuthorityArtifactReferences(session, selectedWorkspace);
    setMessage("No-PHI clinical activation readiness attestation recorded with append-only audit evidence.");
  }

  async function downloadClinicalActivationApprovalPacket() {
    if (!session || !selectedWorkspace) {
      return;
    }

    setClinicalApprovalPacketStatus("downloading");
    setMessage("");
    const response = await fetch(
      `/api/pilot-workspaces/${selectedWorkspace.slug}/clinical-activation-approvals/packet`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      }
    );

    setClinicalApprovalPacketStatus("idle");

    if (!response.ok) {
      const body = (await response.json()) as ProofPacketResponse;
      setMessage(body.error?.message ?? "The Clinical Activation Approval Workflow packet could not be downloaded.");
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `scrimed-${selectedWorkspace.slug}-clinical-activation-approval-workflow.md`;
    link.click();
    URL.revokeObjectURL(url);
    await refreshAuditEvents(session, selectedWorkspace);
    setMessage("Clinical Activation Approval Workflow packet downloaded and its audit event was committed.");
  }

  async function recordProtectedOperatorMetric(input: ProtectedOperatorMetricInput) {
    if (!session || !selectedWorkspace) {
      return;
    }

    setProtectedOperatorMetricStatus("saving");
    setMessage("");
    const response = await fetch(`/api/pilot-workspaces/${selectedWorkspace.slug}/operator-metrics`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(input)
    });
    const body = (await response.json()) as ProtectedOperatorMetricsResponse;
    setProtectedOperatorMetricStatus("idle");

    if (!response.ok) {
      setMessage(
        body.errors?.join(" ") ??
          body.error?.message ??
          "The protected operator metric could not be recorded."
      );
      return;
    }

    setProtectedOperatorMetrics(body.metrics ?? []);
    setProtectedOperatorMetricDashboard(body.dashboard ?? null);
    await refreshAuditEvents(session, selectedWorkspace);
    await refreshProtectedMetricRollups(session, selectedWorkspace);
    setMessage(
      `Protected operator metric recorded${body.metricId ? ` with ledger id ${body.metricId}` : ""}.`
    );
  }

  async function createProtectedMetricRollupSnapshot(input: ProtectedMetricRollupInput) {
    if (!session || !selectedWorkspace) {
      return;
    }

    setProtectedMetricRollupStatus("saving");
    setMessage("");
    const response = await fetch(`/api/pilot-workspaces/${selectedWorkspace.slug}/metric-rollups`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(input)
    });
    const body = (await response.json()) as ProtectedMetricRollupsResponse;
    setProtectedMetricRollupStatus("idle");

    if (!response.ok) {
      setMessage(
        body.errors?.join(" ") ??
          body.error?.message ??
          "The protected metric rollup snapshot could not be created."
      );
      return;
    }

    setProtectedMetricRollupSnapshots(body.snapshots ?? []);
    setProtectedMetricRollupDashboard(body.dashboard ?? null);
    await refreshAuditEvents(session, selectedWorkspace);
    await refreshProtectedMetricTrends(session, selectedWorkspace);
    setMessage(
      `Protected metric rollup snapshot created${body.snapshotId ? ` with snapshot id ${body.snapshotId}` : ""}.`
    );
  }

  async function downloadProtectedMetricRollupPacket(snapshot: ProtectedMetricRollupRecord) {
    if (!session || !selectedWorkspace) {
      return;
    }

    setProtectedMetricRollupPacketBusyId(snapshot.id);
    setMessage("");
    const response = await fetch(
      `/api/pilot-workspaces/${selectedWorkspace.slug}/metric-rollups/${snapshot.id}/packet`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      }
    );
    setProtectedMetricRollupPacketBusyId(null);

    if (!response.ok) {
      const body = (await response.json()) as ProofPacketResponse;

      setMessage(body.error?.message ?? "The protected metric rollup board packet could not be downloaded.");
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `scrimed-${selectedWorkspace.slug}-${snapshot.id}-metric-board-packet.md`;
    link.click();
    URL.revokeObjectURL(url);
    await refreshAuditEvents(session, selectedWorkspace);
    setMessage("Protected metric rollup board packet downloaded and its audit event was committed.");
  }

  async function createProtectedMetricTrendReview(input: ProtectedMetricTrendReviewInput) {
    if (!session || !selectedWorkspace) {
      return;
    }

    setProtectedMetricTrendStatus("saving");
    setMessage("");
    const response = await fetch(`/api/pilot-workspaces/${selectedWorkspace.slug}/metric-trends`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(input)
    });
    const body = (await response.json()) as ProtectedMetricTrendsResponse;
    setProtectedMetricTrendStatus("idle");

    if (!response.ok) {
      setMessage(
        body.errors?.join(" ") ??
          body.error?.message ??
          "The protected metric trend review could not be created."
      );
      return;
    }

    setProtectedMetricTrendReviews(body.reviews ?? []);
    setProtectedMetricTrendDashboard(body.dashboard ?? null);
    await refreshAuditEvents(session, selectedWorkspace);
    await refreshProtectedBoardScorecards(session, selectedWorkspace);
    setMessage(
      `Protected metric trend review created${body.reviewId ? ` with review id ${body.reviewId}` : ""}.`
    );
  }

  async function downloadProtectedMetricTrendPacket(review: ProtectedMetricTrendReviewRecord) {
    if (!session || !selectedWorkspace) {
      return;
    }

    setProtectedMetricTrendPacketBusyId(review.id);
    setMessage("");
    const response = await fetch(
      `/api/pilot-workspaces/${selectedWorkspace.slug}/metric-trends/${review.id}/packet`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      }
    );
    setProtectedMetricTrendPacketBusyId(null);

    if (!response.ok) {
      const body = (await response.json()) as ProofPacketResponse;

      setMessage(body.error?.message ?? "The protected metric trend packet could not be downloaded.");
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `scrimed-${selectedWorkspace.slug}-${review.id}-metric-trend-packet.md`;
    link.click();
    URL.revokeObjectURL(url);
    await refreshAuditEvents(session, selectedWorkspace);
    setMessage("Protected metric trend packet downloaded and its audit event was committed.");
  }

  async function createProtectedBoardScorecard(input: ProtectedBoardScorecardInput) {
    if (!session || !selectedWorkspace) {
      return;
    }

    setProtectedBoardScorecardStatus("saving");
    setMessage("");
    const response = await fetch(`/api/pilot-workspaces/${selectedWorkspace.slug}/board-scorecards`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(input)
    });
    const body = (await response.json()) as ProtectedBoardScorecardsResponse;
    setProtectedBoardScorecardStatus("idle");

    if (!response.ok) {
      setMessage(
        body.errors?.join(" ") ??
          body.error?.message ??
          "The protected board scorecard could not be created."
      );
      return;
    }

    setProtectedBoardScorecards(body.scorecards ?? []);
    setProtectedBoardScorecardDashboard(body.dashboard ?? null);
    await refreshAuditEvents(session, selectedWorkspace);
    await refreshProtectedFinanceMethodology(session, selectedWorkspace);
    setMessage(
      `Protected board scorecard created${body.scorecardId ? ` with scorecard id ${body.scorecardId}` : ""}.`
    );
  }

  async function downloadProtectedBoardScorecardPacket(scorecard: ProtectedBoardScorecardRecord) {
    if (!session || !selectedWorkspace) {
      return;
    }

    setProtectedBoardScorecardPacketBusyId(scorecard.id);
    setMessage("");
    const response = await fetch(
      `/api/pilot-workspaces/${selectedWorkspace.slug}/board-scorecards/${scorecard.id}/packet`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      }
    );
    setProtectedBoardScorecardPacketBusyId(null);

    if (!response.ok) {
      const body = (await response.json()) as ProofPacketResponse;

      setMessage(body.error?.message ?? "The protected board scorecard packet could not be downloaded.");
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `scrimed-${selectedWorkspace.slug}-${scorecard.id}-board-scorecard-packet.md`;
    link.click();
    URL.revokeObjectURL(url);
    await refreshAuditEvents(session, selectedWorkspace);
    setMessage("Protected board scorecard packet downloaded and its audit event was committed.");
  }

  async function recordProtectedFinanceMethodologyGate(input: ProtectedFinanceMethodologyInput) {
    if (!session || !selectedWorkspace) {
      return;
    }

    setProtectedFinanceMethodologyBusyGateId(input.gateId);
    setMessage("");
    const response = await fetch(
      `/api/pilot-workspaces/${selectedWorkspace.slug}/finance-methodology`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(input)
      }
    );
    const body = (await response.json()) as ProtectedFinanceMethodologyResponse;
    setProtectedFinanceMethodologyBusyGateId(null);

    if (!response.ok) {
      setMessage(
        body.errors?.join(" ") ??
          body.error?.message ??
          "The protected finance methodology gate could not be recorded."
      );
      return;
    }

    setProtectedFinanceMethodologyWorkflow(body.workflow ?? protectedFinanceMethodologyWorkflow);
    await refreshAuditEvents(session, selectedWorkspace);
    await refreshProtectedExternalApprovalEvidence(session, selectedWorkspace);
    await refreshProtectedClinicalAuthorityEvidenceRoom(session, selectedWorkspace);
    await refreshProtectedClinicalAuthorityOwnerMatrix(session, selectedWorkspace);
    await refreshProtectedClinicalAuthorityArtifactIntake(session, selectedWorkspace);
    await refreshProtectedAuthorityArtifactReferences(session, selectedWorkspace);
    setMessage(
      `Protected finance methodology gate recorded${body.gateRecordId ? ` with gate id ${body.gateRecordId}` : ""}.`
    );
  }

  async function downloadProtectedFinanceMethodologyPacket() {
    if (!session || !selectedWorkspace) {
      return;
    }

    setProtectedFinanceMethodologyPacketStatus("downloading");
    setMessage("");
    const response = await fetch(
      `/api/pilot-workspaces/${selectedWorkspace.slug}/finance-methodology/packet`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      }
    );
    setProtectedFinanceMethodologyPacketStatus("idle");

    if (!response.ok) {
      const body = (await response.json()) as ProofPacketResponse;

      setMessage(body.error?.message ?? "The protected finance methodology packet could not be downloaded.");
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `scrimed-${selectedWorkspace.slug}-finance-methodology-gates.md`;
    link.click();
    URL.revokeObjectURL(url);
    await refreshAuditEvents(session, selectedWorkspace);
    setMessage("Protected finance methodology packet downloaded and its audit event was committed.");
  }

  async function recordProtectedExternalApprovalEvidenceReference(
    input: ProtectedExternalApprovalEvidenceInput
  ) {
    if (!session || !selectedWorkspace) {
      return;
    }

    setProtectedExternalApprovalEvidenceBusyDomainId(input.domainId);
    setMessage("");
    const response = await fetch(
      `/api/pilot-workspaces/${selectedWorkspace.slug}/external-approval-evidence`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(input)
      }
    );
    const body = (await response.json()) as ProtectedExternalApprovalEvidenceResponse;
    setProtectedExternalApprovalEvidenceBusyDomainId(null);

    if (!response.ok) {
      setMessage(
        body.errors?.join(" ") ??
          body.error?.message ??
          "The protected external approval evidence reference could not be recorded."
      );
      return;
    }

    setProtectedExternalApprovalEvidenceWorkflow(
      body.workflow ?? protectedExternalApprovalEvidenceWorkflow
    );
    if (body.financeWorkflow) {
      setProtectedFinanceMethodologyWorkflow(body.financeWorkflow);
    }
    await refreshAuditEvents(session, selectedWorkspace);
    await refreshProtectedReleaseDecision(session, selectedWorkspace);
    await refreshProtectedClinicalAuthorityEvidenceRoom(session, selectedWorkspace);
    await refreshProtectedClinicalAuthorityOwnerMatrix(session, selectedWorkspace);
    await refreshProtectedClinicalAuthorityArtifactIntake(session, selectedWorkspace);
    await refreshProtectedAuthorityArtifactReferences(session, selectedWorkspace);
    setMessage(
      `Protected external approval evidence reference recorded${
        body.referenceId ? ` with reference id ${body.referenceId}` : ""
      }.`
    );
  }

  async function downloadProtectedExternalApprovalEvidencePacket() {
    if (!session || !selectedWorkspace) {
      return;
    }

    setProtectedExternalApprovalEvidencePacketStatus("downloading");
    setMessage("");
    const response = await fetch(
      `/api/pilot-workspaces/${selectedWorkspace.slug}/external-approval-evidence/packet`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      }
    );
    setProtectedExternalApprovalEvidencePacketStatus("idle");

    if (!response.ok) {
      const body = (await response.json()) as ProofPacketResponse;

      setMessage(body.error?.message ?? "The protected external approval evidence packet could not be downloaded.");
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `scrimed-${selectedWorkspace.slug}-external-approval-evidence-links.md`;
    link.click();
    URL.revokeObjectURL(url);
    await refreshAuditEvents(session, selectedWorkspace);
    setMessage("Protected external approval evidence packet downloaded and its audit event was committed.");
  }

  async function recordProtectedReleaseDecision(input: ProtectedReleaseDecisionInput) {
    if (!session || !selectedWorkspace) {
      return;
    }

    setProtectedReleaseDecisionStatus("saving");
    setMessage("");
    const response = await fetch(
      `/api/pilot-workspaces/${selectedWorkspace.slug}/release-decisions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(input)
      }
    );
    const body = (await response.json()) as ProtectedReleaseDecisionResponse;
    setProtectedReleaseDecisionStatus("idle");

    if (!response.ok) {
      setMessage(
        body.errors?.join(" ") ??
          body.error?.message ??
          "The protected release decision could not be recorded."
      );
      return;
    }

    setProtectedReleaseDecisionWorkflow(body.workflow ?? protectedReleaseDecisionWorkflow);
    if (body.externalWorkflow) {
      setProtectedExternalApprovalEvidenceWorkflow(body.externalWorkflow);
    }
    if (body.financeWorkflow) {
      setProtectedFinanceMethodologyWorkflow(body.financeWorkflow);
    }
    await refreshProtectedNamedReviewerSignoffs(session, selectedWorkspace);
    await refreshProtectedDistributionLockboxes(session, selectedWorkspace);
    await refreshAuditEvents(session, selectedWorkspace);
    setMessage(
      `Protected release decision recorded${
        body.decisionId ? ` with decision id ${body.decisionId}` : ""
      }.`
    );
  }

  async function downloadProtectedReleaseDecisionPacket() {
    if (!session || !selectedWorkspace) {
      return;
    }

    setProtectedReleaseDecisionPacketStatus("downloading");
    setMessage("");
    const response = await fetch(
      `/api/pilot-workspaces/${selectedWorkspace.slug}/release-decisions/packet`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      }
    );
    setProtectedReleaseDecisionPacketStatus("idle");

    if (!response.ok) {
      const body = (await response.json()) as ProofPacketResponse;

      setMessage(body.error?.message ?? "The protected release decision packet could not be downloaded.");
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `scrimed-${selectedWorkspace.slug}-release-decision-claim-registry.md`;
    link.click();
    URL.revokeObjectURL(url);
    await refreshAuditEvents(session, selectedWorkspace);
    setMessage("Protected release decision packet downloaded and its audit event was committed.");
  }

  async function recordProtectedNamedReviewerSignoff(input: ProtectedNamedReviewerSignoffInput) {
    if (!session || !selectedWorkspace) {
      return;
    }

    setProtectedNamedReviewerSignoffStatus("saving");
    setMessage("");
    const response = await fetch(
      `/api/pilot-workspaces/${selectedWorkspace.slug}/reviewer-signoffs`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(input)
      }
    );
    const body = (await response.json()) as ProtectedNamedReviewerSignoffResponse;
    setProtectedNamedReviewerSignoffStatus("idle");

    if (!response.ok) {
      setMessage(
        body.errors?.join(" ") ??
          body.error?.message ??
          "The protected named reviewer sign-off could not be recorded."
      );
      return;
    }

    setProtectedNamedReviewerSignoffWorkflow(body.workflow ?? protectedNamedReviewerSignoffWorkflow);
    if (body.releaseWorkflow) {
      setProtectedReleaseDecisionWorkflow(body.releaseWorkflow);
    }
    if (body.externalWorkflow) {
      setProtectedExternalApprovalEvidenceWorkflow(body.externalWorkflow);
    }
    if (body.financeWorkflow) {
      setProtectedFinanceMethodologyWorkflow(body.financeWorkflow);
    }
    await refreshProtectedDistributionLockboxes(session, selectedWorkspace);
    await refreshAuditEvents(session, selectedWorkspace);
    setMessage(
      `Protected named reviewer sign-off metadata recorded${
        body.signoffId ? ` with sign-off id ${body.signoffId}` : ""
      }.`
    );
  }

  async function downloadProtectedNamedReviewerSignoffPacket() {
    if (!session || !selectedWorkspace) {
      return;
    }

    setProtectedNamedReviewerSignoffPacketStatus("downloading");
    setMessage("");
    const response = await fetch(
      `/api/pilot-workspaces/${selectedWorkspace.slug}/reviewer-signoffs/packet`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      }
    );
    setProtectedNamedReviewerSignoffPacketStatus("idle");

    if (!response.ok) {
      const body = (await response.json()) as ProofPacketResponse;

      setMessage(
        body.error?.message ?? "The protected named reviewer sign-off packet could not be downloaded."
      );
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `scrimed-${selectedWorkspace.slug}-named-reviewer-signoffs.md`;
    link.click();
    URL.revokeObjectURL(url);
    await refreshAuditEvents(session, selectedWorkspace);
    setMessage("Protected named reviewer sign-off packet downloaded and its audit event was committed.");
  }

  async function recordProtectedDistributionLockbox(input: ProtectedDistributionLockboxInput) {
    if (!session || !selectedWorkspace) {
      return;
    }

    setProtectedDistributionLockboxStatus("saving");
    setMessage("");
    const response = await fetch(
      `/api/pilot-workspaces/${selectedWorkspace.slug}/distribution-lockbox`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(input)
      }
    );
    const body = (await response.json()) as ProtectedDistributionLockboxResponse;
    setProtectedDistributionLockboxStatus("idle");

    if (!response.ok) {
      setMessage(
        body.errors?.join(" ") ??
          body.error?.message ??
          "The protected distribution lockbox could not be recorded."
      );
      return;
    }

    setProtectedDistributionLockboxWorkflow(body.workflow ?? protectedDistributionLockboxWorkflow);
    if (body.signoffWorkflow) {
      setProtectedNamedReviewerSignoffWorkflow(body.signoffWorkflow);
    }
    if (body.releaseWorkflow) {
      setProtectedReleaseDecisionWorkflow(body.releaseWorkflow);
    }
    if (body.externalWorkflow) {
      setProtectedExternalApprovalEvidenceWorkflow(body.externalWorkflow);
    }
    if (body.financeWorkflow) {
      setProtectedFinanceMethodologyWorkflow(body.financeWorkflow);
    }
    await refreshProtectedReleaseAuthorityAttestations(session, selectedWorkspace);
    await refreshAuditEvents(session, selectedWorkspace);
    setMessage(
      `Protected distribution lockbox metadata recorded${
        body.lockboxId ? ` with lockbox id ${body.lockboxId}` : ""
      }. External distribution remains disabled.`
    );
  }

  async function downloadProtectedDistributionLockboxPacket() {
    if (!session || !selectedWorkspace) {
      return;
    }

    setProtectedDistributionLockboxPacketStatus("downloading");
    setMessage("");
    const response = await fetch(
      `/api/pilot-workspaces/${selectedWorkspace.slug}/distribution-lockbox/packet`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      }
    );
    setProtectedDistributionLockboxPacketStatus("idle");

    if (!response.ok) {
      const body = (await response.json()) as ProofPacketResponse;

      setMessage(
        body.error?.message ?? "The protected distribution lockbox packet could not be downloaded."
      );
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `scrimed-${selectedWorkspace.slug}-distribution-lockbox.md`;
    link.click();
    URL.revokeObjectURL(url);
    await refreshAuditEvents(session, selectedWorkspace);
    setMessage("Protected distribution lockbox packet downloaded and its audit event was committed.");
  }

  async function recordProtectedReleaseAuthorityAttestation(
    input: ProtectedReleaseAuthorityAttestationInput
  ) {
    if (!session || !selectedWorkspace) {
      return;
    }

    setProtectedReleaseAuthorityAttestationStatus("saving");
    setMessage("");
    const response = await fetch(
      `/api/pilot-workspaces/${selectedWorkspace.slug}/release-authority-attestations`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(input)
      }
    );
    const body = (await response.json()) as ProtectedReleaseAuthorityAttestationResponse;
    setProtectedReleaseAuthorityAttestationStatus("idle");

    if (!response.ok) {
      setMessage(
        body.errors?.join(" ") ??
          body.error?.message ??
          "The protected release authority attestation could not be recorded."
      );
      return;
    }

    setProtectedReleaseAuthorityAttestationWorkflow(
      body.workflow ?? protectedReleaseAuthorityAttestationWorkflow
    );
    if (body.lockboxWorkflow) {
      setProtectedDistributionLockboxWorkflow(body.lockboxWorkflow);
    }
    if (body.signoffWorkflow) {
      setProtectedNamedReviewerSignoffWorkflow(body.signoffWorkflow);
    }
    if (body.releaseWorkflow) {
      setProtectedReleaseDecisionWorkflow(body.releaseWorkflow);
    }
    if (body.externalWorkflow) {
      setProtectedExternalApprovalEvidenceWorkflow(body.externalWorkflow);
    }
    if (body.financeWorkflow) {
      setProtectedFinanceMethodologyWorkflow(body.financeWorkflow);
    }
    await refreshProtectedEvidenceRoomRecipientAttestations(session, selectedWorkspace);
    await refreshProtectedEvidenceRoomAccessLogReconciliation(session, selectedWorkspace);
    await refreshProtectedEvidenceRoomProviderAdapters(session, selectedWorkspace);
    await refreshAuditEvents(session, selectedWorkspace);
    setMessage(
      `Protected release authority metadata recorded${
        body.attestationId ? ` with attestation id ${body.attestationId}` : ""
      }. Release remains disabled pending externally executed authority.`
    );
  }

  async function recordProtectedEvidenceRoomRecipientAttestation(
    input: ProtectedEvidenceRoomRecipientAttestationInput
  ) {
    if (!session || !selectedWorkspace) {
      return;
    }

    setProtectedEvidenceRoomRecipientAttestationStatus("saving");
    setMessage("");
    const response = await fetch(
      `/api/pilot-workspaces/${selectedWorkspace.slug}/evidence-room-recipient-attestations`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(input)
      }
    );
    const body = (await response.json()) as ProtectedEvidenceRoomRecipientAttestationResponse;
    setProtectedEvidenceRoomRecipientAttestationStatus("idle");

    if (!response.ok) {
      setMessage(
        body.errors?.join(" ") ??
          body.error?.message ??
          "The protected evidence-room recipient attestation could not be recorded."
      );
      return;
    }

    setProtectedEvidenceRoomRecipientAttestationWorkflow(
      body.workflow ?? protectedEvidenceRoomRecipientAttestationWorkflow
    );
    if (body.authorityWorkflow) {
      setProtectedReleaseAuthorityAttestationWorkflow(body.authorityWorkflow);
    }
    if (body.lockboxWorkflow) {
      setProtectedDistributionLockboxWorkflow(body.lockboxWorkflow);
    }
    if (body.signoffWorkflow) {
      setProtectedNamedReviewerSignoffWorkflow(body.signoffWorkflow);
    }
    if (body.releaseWorkflow) {
      setProtectedReleaseDecisionWorkflow(body.releaseWorkflow);
    }
    if (body.externalWorkflow) {
      setProtectedExternalApprovalEvidenceWorkflow(body.externalWorkflow);
    }
    if (body.financeWorkflow) {
      setProtectedFinanceMethodologyWorkflow(body.financeWorkflow);
    }
    await refreshProtectedEvidenceRoomAccessLogReconciliation(session, selectedWorkspace);
    await refreshProtectedEvidenceRoomProviderAdapters(session, selectedWorkspace);
    await refreshAuditEvents(session, selectedWorkspace);
    setMessage(
      `Protected evidence-room recipient metadata recorded${
        body.attestationId ? ` with attestation id ${body.attestationId}` : ""
      }. Export remains disabled pending externally controlled recipient authority.`
    );
  }

  async function downloadProtectedEvidenceRoomRecipientAttestationPacket() {
    if (!session || !selectedWorkspace) {
      return;
    }

    setProtectedEvidenceRoomRecipientAttestationPacketStatus("downloading");
    setMessage("");
    const response = await fetch(
      `/api/pilot-workspaces/${selectedWorkspace.slug}/evidence-room-recipient-attestations/packet`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      }
    );
    setProtectedEvidenceRoomRecipientAttestationPacketStatus("idle");

    if (!response.ok) {
      const body = (await response.json()) as ProofPacketResponse;

      setMessage(
        body.error?.message ??
          "The protected evidence-room recipient attestation packet could not be downloaded."
      );
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `scrimed-${selectedWorkspace.slug}-evidence-room-recipient-attestations.md`;
    link.click();
    URL.revokeObjectURL(url);
    await refreshAuditEvents(session, selectedWorkspace);
    setMessage(
      "Protected evidence-room recipient attestation packet downloaded and its audit event was committed."
    );
  }

  async function recordProtectedEvidenceRoomAccessLogReconciliation(
    input: ProtectedEvidenceRoomAccessLogReconciliationInput
  ) {
    if (!session || !selectedWorkspace) {
      return;
    }

    setProtectedEvidenceRoomAccessLogReconciliationStatus("saving");
    setMessage("");
    const response = await fetch(
      `/api/pilot-workspaces/${selectedWorkspace.slug}/evidence-room-access-log-reconciliation`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(input)
      }
    );
    const body = (await response.json()) as ProtectedEvidenceRoomAccessLogReconciliationResponse;
    setProtectedEvidenceRoomAccessLogReconciliationStatus("idle");

    if (!response.ok) {
      setMessage(
        body.errors?.join(" ") ??
          body.error?.message ??
          "The protected evidence-room access-log reconciliation could not be recorded."
      );
      return;
    }

    setProtectedEvidenceRoomAccessLogReconciliationWorkflow(
      body.workflow ?? protectedEvidenceRoomAccessLogReconciliationWorkflow
    );
    if (body.recipientWorkflow) {
      setProtectedEvidenceRoomRecipientAttestationWorkflow(body.recipientWorkflow);
    }
    if (body.authorityWorkflow) {
      setProtectedReleaseAuthorityAttestationWorkflow(body.authorityWorkflow);
    }
    if (body.lockboxWorkflow) {
      setProtectedDistributionLockboxWorkflow(body.lockboxWorkflow);
    }
    if (body.signoffWorkflow) {
      setProtectedNamedReviewerSignoffWorkflow(body.signoffWorkflow);
    }
    if (body.releaseWorkflow) {
      setProtectedReleaseDecisionWorkflow(body.releaseWorkflow);
    }
    if (body.externalWorkflow) {
      setProtectedExternalApprovalEvidenceWorkflow(body.externalWorkflow);
    }
    if (body.financeWorkflow) {
      setProtectedFinanceMethodologyWorkflow(body.financeWorkflow);
    }
    await refreshProtectedEvidenceRoomProviderAdapters(session, selectedWorkspace);
    await refreshAuditEvents(session, selectedWorkspace);
    setMessage(
      `Protected evidence-room access-log reconciliation recorded${
        body.reconciliationId ? ` with reconciliation id ${body.reconciliationId}` : ""
      }. Export remains disabled pending externally retained access-log authority.`
    );
  }

  async function downloadProtectedEvidenceRoomAccessLogReconciliationPacket() {
    if (!session || !selectedWorkspace) {
      return;
    }

    setProtectedEvidenceRoomAccessLogReconciliationPacketStatus("downloading");
    setMessage("");
    const response = await fetch(
      `/api/pilot-workspaces/${selectedWorkspace.slug}/evidence-room-access-log-reconciliation/packet`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      }
    );
    setProtectedEvidenceRoomAccessLogReconciliationPacketStatus("idle");

    if (!response.ok) {
      const body = (await response.json()) as ProofPacketResponse;

      setMessage(
        body.error?.message ??
          "The protected evidence-room access-log reconciliation packet could not be downloaded."
      );
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `scrimed-${selectedWorkspace.slug}-evidence-room-access-log-reconciliation.md`;
    link.click();
    URL.revokeObjectURL(url);
    await refreshAuditEvents(session, selectedWorkspace);
    setMessage(
      "Protected evidence-room access-log reconciliation packet downloaded and its audit event was committed."
    );
  }

  async function recordProtectedEvidenceRoomProviderAdapter(
    input: ProtectedEvidenceRoomProviderAdapterInput
  ) {
    if (!session || !selectedWorkspace) {
      return;
    }

    setProtectedEvidenceRoomProviderAdapterStatus("saving");
    setMessage("");
    const response = await fetch(
      `/api/pilot-workspaces/${selectedWorkspace.slug}/evidence-room-provider-adapters`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(input)
      }
    );
    const body = (await response.json()) as ProtectedEvidenceRoomProviderAdapterResponse;
    setProtectedEvidenceRoomProviderAdapterStatus("idle");

    if (!response.ok) {
      setMessage(
        body.errors?.join(" ") ??
          body.error?.message ??
          "The protected evidence-room provider adapter contract could not be recorded."
      );
      return;
    }

    setProtectedEvidenceRoomProviderAdapterWorkflow(
      body.workflow ?? protectedEvidenceRoomProviderAdapterWorkflow
    );
    if (body.accessLogWorkflow) {
      setProtectedEvidenceRoomAccessLogReconciliationWorkflow(body.accessLogWorkflow);
    }
    if (body.recipientWorkflow) {
      setProtectedEvidenceRoomRecipientAttestationWorkflow(body.recipientWorkflow);
    }
    if (body.authorityWorkflow) {
      setProtectedReleaseAuthorityAttestationWorkflow(body.authorityWorkflow);
    }
    if (body.lockboxWorkflow) {
      setProtectedDistributionLockboxWorkflow(body.lockboxWorkflow);
    }
    if (body.signoffWorkflow) {
      setProtectedNamedReviewerSignoffWorkflow(body.signoffWorkflow);
    }
    if (body.releaseWorkflow) {
      setProtectedReleaseDecisionWorkflow(body.releaseWorkflow);
    }
    if (body.externalWorkflow) {
      setProtectedExternalApprovalEvidenceWorkflow(body.externalWorkflow);
    }
    if (body.financeWorkflow) {
      setProtectedFinanceMethodologyWorkflow(body.financeWorkflow);
    }
    await refreshProtectedProviderSecurityReviews(session, selectedWorkspace);
    await refreshAuditEvents(session, selectedWorkspace);
    setMessage(
      `Protected evidence-room provider adapter contract recorded${
        body.adapterId ? ` with adapter id ${body.adapterId}` : ""
      }. Integration, export, raw-log import, and credential storage remain disabled.`
    );
  }

  async function downloadProtectedEvidenceRoomProviderAdapterPacket() {
    if (!session || !selectedWorkspace) {
      return;
    }

    setProtectedEvidenceRoomProviderAdapterPacketStatus("downloading");
    setMessage("");
    const response = await fetch(
      `/api/pilot-workspaces/${selectedWorkspace.slug}/evidence-room-provider-adapters/packet`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      }
    );
    setProtectedEvidenceRoomProviderAdapterPacketStatus("idle");

    if (!response.ok) {
      const body = (await response.json()) as ProofPacketResponse;

      setMessage(
        body.error?.message ??
          "The protected evidence-room provider adapter packet could not be downloaded."
      );
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `scrimed-${selectedWorkspace.slug}-evidence-room-provider-adapters.md`;
    link.click();
    URL.revokeObjectURL(url);
    await refreshAuditEvents(session, selectedWorkspace);
    setMessage(
      "Protected evidence-room provider adapter packet downloaded and its audit event was committed."
    );
  }

  async function recordProtectedProviderSecurityReview(
    input: ProtectedProviderSecurityReviewInput
  ) {
    if (!session || !selectedWorkspace) {
      return;
    }

    setProtectedProviderSecurityReviewStatus("saving");
    setMessage("");
    const response = await fetch(
      `/api/pilot-workspaces/${selectedWorkspace.slug}/provider-security-reviews`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(input)
      }
    );
    const body = (await response.json()) as ProtectedProviderSecurityReviewResponse;
    setProtectedProviderSecurityReviewStatus("idle");

    if (!response.ok) {
      setMessage(
        body.errors?.join(" ") ??
          body.error?.message ??
          "The protected provider security review could not be recorded."
      );
      return;
    }

    setProtectedProviderSecurityReviewWorkflow(
      body.workflow ?? protectedProviderSecurityReviewWorkflow
    );
    await refreshProtectedProcurementEvidenceRegistry(session, selectedWorkspace);
    await refreshAuditEvents(session, selectedWorkspace);
    await refreshProtectedClinicalAuthorityEvidenceRoom(session, selectedWorkspace);
    await refreshProtectedClinicalAuthorityOwnerMatrix(session, selectedWorkspace);
    await refreshProtectedClinicalAuthorityArtifactIntake(session, selectedWorkspace);
    await refreshProtectedAuthorityArtifactReferences(session, selectedWorkspace);
    setMessage(
      `Protected provider security review recorded${
        body.reviewId ? ` with review id ${body.reviewId}` : ""
      }. Security approval, BAA/DPA execution, credential storage, PHI processing, and live integration remain disabled.`
    );
  }

  async function downloadProtectedProviderSecurityReviewPacket() {
    if (!session || !selectedWorkspace) {
      return;
    }

    setProtectedProviderSecurityReviewPacketStatus("downloading");
    setMessage("");
    const response = await fetch(
      `/api/pilot-workspaces/${selectedWorkspace.slug}/provider-security-reviews/packet`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      }
    );
    setProtectedProviderSecurityReviewPacketStatus("idle");

    if (!response.ok) {
      const body = (await response.json()) as ProofPacketResponse;

      setMessage(
        body.error?.message ??
          "The protected provider security review packet could not be downloaded."
      );
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `scrimed-${selectedWorkspace.slug}-provider-security-reviews.md`;
    link.click();
    URL.revokeObjectURL(url);
    await refreshAuditEvents(session, selectedWorkspace);
    setMessage(
      "Protected provider security review packet downloaded and its audit event was committed."
    );
  }

  async function recordProtectedProcurementEvidenceRegistry(
    input: ProtectedProcurementEvidenceRegistryInput
  ) {
    if (!session || !selectedWorkspace) {
      return;
    }

    setProtectedProcurementEvidenceRegistryStatus("saving");
    setMessage("");
    const response = await fetch(
      `/api/pilot-workspaces/${selectedWorkspace.slug}/procurement-evidence`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(input)
      }
    );
    const body = (await response.json()) as ProtectedProcurementEvidenceRegistryResponse;
    setProtectedProcurementEvidenceRegistryStatus("idle");

    if (!response.ok) {
      setMessage(
        body.errors?.join(" ") ??
          body.error?.message ??
          "The protected procurement evidence registry entry could not be recorded."
      );
      return;
    }

    setProtectedProcurementEvidenceRegistryWorkflow(
      body.workflow ?? protectedProcurementEvidenceRegistryWorkflow
    );
    await refreshAuditEvents(session, selectedWorkspace);
    await refreshProtectedClinicalAuthorityEvidenceRoom(session, selectedWorkspace);
    await refreshProtectedClinicalAuthorityOwnerMatrix(session, selectedWorkspace);
    await refreshProtectedClinicalAuthorityArtifactIntake(session, selectedWorkspace);
    await refreshProtectedAuthorityArtifactReferences(session, selectedWorkspace);
    setMessage(
      `Protected procurement evidence routing recorded${
        body.registryId ? ` with registry id ${body.registryId}` : ""
      }. Questionnaire answers, reports, signed artifacts, credentials, PHI, external distribution, procurement approval, and live clinical execution remain disabled.`
    );
  }

  async function downloadProtectedProcurementEvidenceRegistryPacket() {
    if (!session || !selectedWorkspace) {
      return;
    }

    setProtectedProcurementEvidenceRegistryPacketStatus("downloading");
    setMessage("");
    const response = await fetch(
      `/api/pilot-workspaces/${selectedWorkspace.slug}/procurement-evidence/packet`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      }
    );
    setProtectedProcurementEvidenceRegistryPacketStatus("idle");

    if (!response.ok) {
      const body = (await response.json()) as ProofPacketResponse;

      setMessage(
        body.error?.message ??
          "The protected procurement evidence registry packet could not be downloaded."
      );
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `scrimed-${selectedWorkspace.slug}-procurement-evidence-registry.md`;
    link.click();
    URL.revokeObjectURL(url);
    await refreshAuditEvents(session, selectedWorkspace);
    setMessage(
      "Protected procurement evidence registry packet downloaded and its audit event was committed."
    );
  }

  async function downloadProtectedClinicalAuthorityEvidenceRoomPacket() {
    if (!session || !selectedWorkspace) {
      return;
    }

    setProtectedClinicalAuthorityEvidenceRoomPacketStatus("downloading");
    setMessage("");
    const response = await fetch(
      `/api/pilot-workspaces/${selectedWorkspace.slug}/clinical-authority-evidence-room/packet`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      }
    );
    setProtectedClinicalAuthorityEvidenceRoomPacketStatus("idle");

    if (!response.ok) {
      const body = (await response.json()) as ProofPacketResponse;

      setMessage(
        body.error?.message ??
          "The protected Clinical Authority Evidence Room packet could not be downloaded."
      );
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `scrimed-${selectedWorkspace.slug}-clinical-authority-evidence-room.md`;
    link.click();
    URL.revokeObjectURL(url);
    await refreshAuditEvents(session, selectedWorkspace);
    await refreshProtectedClinicalAuthorityEvidenceRoom(session, selectedWorkspace);
    await refreshProtectedClinicalAuthorityOwnerMatrix(session, selectedWorkspace);
    await refreshProtectedClinicalAuthorityArtifactIntake(session, selectedWorkspace);
    await refreshProtectedAuthorityArtifactReferences(session, selectedWorkspace);
    setMessage(
      "Protected Clinical Authority Evidence Room packet downloaded and its audit event was committed."
    );
  }

  async function downloadProtectedClinicalAuthorityOwnerMatrixPacket() {
    if (!session || !selectedWorkspace) {
      return;
    }

    setProtectedClinicalAuthorityOwnerMatrixPacketStatus("downloading");
    setMessage("");
    const response = await fetch(
      `/api/pilot-workspaces/${selectedWorkspace.slug}/clinical-authority-owner-matrix/packet`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      }
    );
    setProtectedClinicalAuthorityOwnerMatrixPacketStatus("idle");

    if (!response.ok) {
      const body = (await response.json()) as ProofPacketResponse;

      setMessage(
        body.error?.message ??
          "The protected Clinical Authority Owner Matrix packet could not be downloaded."
      );
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `scrimed-${selectedWorkspace.slug}-clinical-authority-owner-matrix.md`;
    link.click();
    URL.revokeObjectURL(url);
    await refreshAuditEvents(session, selectedWorkspace);
    await refreshProtectedClinicalAuthorityEvidenceRoom(session, selectedWorkspace);
    await refreshProtectedClinicalAuthorityOwnerMatrix(session, selectedWorkspace);
    await refreshProtectedClinicalAuthorityArtifactIntake(session, selectedWorkspace);
    await refreshProtectedAuthorityArtifactReferences(session, selectedWorkspace);
    setMessage(
      "Protected Clinical Authority Owner Matrix packet downloaded and its audit event was committed."
    );
  }

  async function downloadProtectedClinicalAuthorityArtifactIntakePacket() {
    if (!session || !selectedWorkspace) {
      return;
    }

    setProtectedClinicalAuthorityArtifactIntakePacketStatus("downloading");
    setMessage("");
    const response = await fetch(
      `/api/pilot-workspaces/${selectedWorkspace.slug}/clinical-authority-artifact-intake/packet`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      }
    );
    setProtectedClinicalAuthorityArtifactIntakePacketStatus("idle");

    if (!response.ok) {
      const body = (await response.json()) as ProofPacketResponse;

      setMessage(
        body.error?.message ??
          "The protected Clinical Authority Artifact Intake Checklist packet could not be downloaded."
      );
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `scrimed-${selectedWorkspace.slug}-clinical-authority-artifact-intake-checklist.md`;
    link.click();
    URL.revokeObjectURL(url);
    await refreshAuditEvents(session, selectedWorkspace);
    await refreshProtectedClinicalAuthorityEvidenceRoom(session, selectedWorkspace);
    await refreshProtectedClinicalAuthorityOwnerMatrix(session, selectedWorkspace);
    await refreshProtectedClinicalAuthorityArtifactIntake(session, selectedWorkspace);
    await refreshProtectedAuthorityArtifactReferences(session, selectedWorkspace);
    setMessage(
      "Protected Clinical Authority Artifact Intake Checklist packet downloaded and its audit event was committed."
    );
  }

  async function recordProtectedAuthorityArtifactReference(
    input: ProtectedAuthorityArtifactReferenceInput
  ) {
    if (!session || !selectedWorkspace) {
      return;
    }

    setProtectedAuthorityArtifactReferenceStatus("saving");
    setMessage("");
    const response = await fetch(
      `/api/pilot-workspaces/${selectedWorkspace.slug}/authority-artifact-references`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(input)
      }
    );
    const body = (await response.json()) as ProtectedAuthorityArtifactReferenceResponse;
    setProtectedAuthorityArtifactReferenceStatus("idle");

    if (!response.ok) {
      setMessage(
        body.errors?.join(" ") ??
          body.error?.message ??
          "The protected authority artifact reference could not be recorded."
      );
      return;
    }

    setProtectedAuthorityArtifactReferenceWorkflow(
      body.workflow ?? protectedAuthorityArtifactReferenceWorkflow
    );
    if (body.checklist) {
      setProtectedClinicalAuthorityArtifactIntake(body.checklist);
    }
    if (body.matrix) {
      setProtectedClinicalAuthorityOwnerMatrix(body.matrix);
    }
    if (body.evidenceRoom) {
      setProtectedClinicalAuthorityEvidenceRoom(body.evidenceRoom);
    }
    await refreshAuditEvents(session, selectedWorkspace);
    setMessage(
      `Protected authority artifact reference recorded${
        body.referenceId ? ` with reference id ${body.referenceId}` : ""
      }. Artifacts, URLs, PHI, signed approvals, legal opinions, security reports, production authorization, and live clinical execution remain disabled.`
    );
  }

  async function downloadProtectedAuthorityArtifactReferencePacket() {
    if (!session || !selectedWorkspace) {
      return;
    }

    setProtectedAuthorityArtifactReferencePacketStatus("downloading");
    setMessage("");
    const response = await fetch(
      `/api/pilot-workspaces/${selectedWorkspace.slug}/authority-artifact-references/packet`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      }
    );
    setProtectedAuthorityArtifactReferencePacketStatus("idle");

    if (!response.ok) {
      const body = (await response.json()) as ProofPacketResponse;

      setMessage(
        body.error?.message ??
          "The protected authority artifact reference packet could not be downloaded."
      );
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `scrimed-${selectedWorkspace.slug}-authority-artifact-references.md`;
    link.click();
    URL.revokeObjectURL(url);
    await refreshAuditEvents(session, selectedWorkspace);
    await refreshProtectedAuthorityArtifactReferences(session, selectedWorkspace);
    setMessage(
      "Protected authority artifact reference packet downloaded and its audit event was committed."
    );
  }

  async function downloadProtectedReleaseAuthorityAttestationPacket() {
    if (!session || !selectedWorkspace) {
      return;
    }

    setProtectedReleaseAuthorityAttestationPacketStatus("downloading");
    setMessage("");
    const response = await fetch(
      `/api/pilot-workspaces/${selectedWorkspace.slug}/release-authority-attestations/packet`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      }
    );
    setProtectedReleaseAuthorityAttestationPacketStatus("idle");

    if (!response.ok) {
      const body = (await response.json()) as ProofPacketResponse;

      setMessage(
        body.error?.message ??
          "The protected release authority attestation packet could not be downloaded."
      );
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `scrimed-${selectedWorkspace.slug}-release-authority-attestations.md`;
    link.click();
    URL.revokeObjectURL(url);
    await refreshAuditEvents(session, selectedWorkspace);
    setMessage("Protected release authority attestation packet downloaded and its audit event was committed.");
  }

  if (!configured) {
    return (
      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Activation required</p>
          <h2>Production identity and durable tenant storage are not connected yet.</h2>
          <p className="section-copy">
            Protected access remains fail-closed until the approved Supabase project, database migration, and
            Vercel runtime credentials are active.
          </p>
        </div>
        <div className="layer-list">
          <div className="layer-row">
            <span>01</span>
            <strong>Provision Supabase project</strong>
          </div>
          <div className="layer-row">
            <span>02</span>
            <strong>Apply tenant and audit migration</strong>
          </div>
          <div className="layer-row">
            <span>03</span>
            <strong>Configure approved pilot memberships</strong>
          </div>
        </div>
      </section>
    );
  }

  if (!session || !user) {
    return (
      <section className="section-band evaluation-band">
        <form className="evaluation-form" onSubmit={sendMagicLink}>
          <div className="form-section">
            <p className="eyebrow">Tenant authentication</p>
            <h2>Access an approved SCRIMED protected pilot workspace.</h2>
            <label className="form-field form-field-wide">
              <span>Approved enterprise email</span>
              <input
                autoComplete="email"
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />
              <small>
                Access requires approved tenant membership. Use an enrolled passkey or a secure email link.
                Synthetic pilot evidence only.
              </small>
            </label>
          </div>
          {message ? <div className="intake-alert">{message}</div> : null}
          <div className="form-actions">
            <button
              className="primary-action"
              disabled={status === "sending-link" || passkeyStatus === "signing-in"}
              type="submit"
            >
              {status === "sending-link" ? "Sending Secure Link" : "Send Secure Access Link"}
            </button>
            <button
              className="secondary-action"
              disabled={passkeyStatus === "signing-in" || status === "sending-link"}
              onClick={signInWithPasskey}
              type="button"
            >
              {passkeyStatus === "signing-in" ? "Checking Passkey" : "Use Passkey"}
            </button>
            <Link className="secondary-action" href="/pilot-workspace">
              Review Workspace Controls
            </Link>
          </div>
        </form>
      </section>
    );
  }

  if (status === "mfa-required" || status === "mfa-enrolling" || status === "mfa-verifying") {
    return (
      <section className="section-band evaluation-band">
        <div className="evaluation-form">
          <div className="form-section">
            <p className="eyebrow">Protected pilot assurance gate</p>
            <h2>Verify an authenticator before opening the workspace.</h2>
            <p className="section-copy">
              SCRIMED uses passkey or passwordless magic-link sign-in plus free TOTP verification. Protected sessions
              expire after twelve hours and require activity within two hours.
            </p>
            {mfaQrCode ? (
              <div className="mfa-enrollment">
                <Image
                  alt="SCRIMED protected pilot authenticator enrollment QR code"
                  height={220}
                  src={mfaQrCode}
                  unoptimized
                  width={220}
                />
                <p>Scan this code in an authenticator app. Then enter the current six-digit code below.</p>
              </div>
            ) : null}
            {mfaFactorId ? (
              <label className="form-field">
                <span>Authenticator code</span>
                <input
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  maxLength={8}
                  onChange={(event) => setMfaCode(event.target.value.replace(/\D/g, ""))}
                  value={mfaCode}
                />
              </label>
            ) : null}
          </div>
          {message ? <div className="intake-alert">{message}</div> : null}
          <div className="form-actions">
            {mfaFactorId ? (
              <button
                className="primary-action"
                disabled={status === "mfa-verifying" || mfaCode.length < 6}
                onClick={verifyMfa}
                type="button"
              >
                {status === "mfa-verifying" ? "Verifying Authenticator" : "Verify Authenticator"}
              </button>
            ) : (
              <button
                className="primary-action"
                disabled={status === "mfa-enrolling"}
                onClick={beginMfaEnrollment}
                type="button"
              >
                {status === "mfa-enrolling" ? "Preparing Authenticator" : "Enroll Authenticator"}
              </button>
            )}
            {mfaFactorStatus === "unverified" && !mfaQrCode ? (
              <button
                className="secondary-action"
                disabled={status === "mfa-enrolling"}
                onClick={beginMfaEnrollment}
                type="button"
              >
                Restart Authenticator Setup
              </button>
            ) : null}
            <button
              className="secondary-action"
              disabled={passkeyStatus === "registering"}
              onClick={registerPasskey}
              type="button"
            >
              {passkeyStatus === "registering" ? "Registering Passkey" : "Register Passkey"}
            </button>
            <button className="secondary-action" onClick={() => signOut("local")} type="button">
              Sign Out
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="section-band hub-summary" aria-label="Authenticated pilot workspace access">
        <article>
          <span>Access assurance</span>
          <strong>AAL2 protected pilot</strong>
        </article>
        <article>
          <span>Passkey posture</span>
          <strong>Enabled</strong>
        </article>
        <article>
          <span>Tenant workspaces</span>
          <strong>{workspaces.length}</strong>
        </article>
        <article>
          <span>Selected sessions</span>
          <strong>{sessions.length}</strong>
        </article>
        <article>
          <span>Audit events</span>
          <strong>{auditEvents.length}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Tenant workspaces</p>
          <h2>Select the governed enterprise pilot evidence surface.</h2>
          <p className="section-copy">
            Signed in as {user.email ?? user.id}. Workspace visibility is constrained by authenticated membership,
            fresh AAL2 assurance, and PostgreSQL row-level security.
          </p>
          <div className="form-actions">
            <button className="secondary-action" onClick={() => signOut("local")} type="button">
              Sign Out
            </button>
            <button className="secondary-action" onClick={() => signOut("global")} type="button">
              End All Sessions
            </button>
          </div>
        </div>
        <div className="layer-list">
          {workspaces.length > 0 ? (
            workspaces.map((workspace, index) => (
              <button
                className="layer-row workspace-selector"
                key={workspace.id}
                onClick={() => selectWorkspace(workspace)}
                type="button"
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>
                  {workspace.name}: {workspace.status}
                </strong>
              </button>
            ))
          ) : (
            <div className="layer-row">
              <span>00</span>
              <strong>No approved tenant workspace membership is assigned to this identity.</strong>
            </div>
          )}
        </div>
      </section>

      {supabase ? (
        <PasskeyManagementPanel supabase={supabase} surface="protected pilot workspace" />
      ) : null}

      {selectedWorkspace ? (
        <>
          <PilotDemoReadinessCommandCenter
            auditEvents={auditEvents}
            demoPacketBusyId={demoPacketBusyId}
            demoSnapshotBusy={demoSnapshotStatus === "saving"}
            demoSnapshots={demoReadinessSnapshots}
            enterprisePacketBusy={enterprisePacketStatus === "downloading"}
            onCreateSession={createSyntheticSession}
            onCreateDemoReadinessSnapshot={createDemoReadinessSnapshot}
            onDownloadDemoReadinessPacket={downloadDemoReadinessPacket}
            onDownloadEnterprisePacket={downloadEnterpriseProofPacket}
            sessions={sessions}
            status={status === "creating-session" ? "creating-session" : "idle"}
            verification={verificationReadiness}
            workspace={selectedWorkspace}
          />

          <CommandIntelligenceHubPanel
            auditEvents={auditEvents}
            commandPacketBusyId={commandPacketBusyId}
            commandSnapshotBusy={commandSnapshotStatus === "saving"}
            commandSnapshots={commandIntelligenceSnapshots}
            demoSnapshots={demoReadinessSnapshots}
            manualQaEvidencePackets={manualQaEvidencePackets}
            onCreateCommandSnapshot={createCommandIntelligenceSnapshot}
            onDownloadCommandSnapshotPacket={downloadCommandIntelligencePacket}
            onDownloadBuyerDiligenceExport={downloadBuyerPilotRoomPacket}
            packetBusy={buyerRoomPacketStatus === "downloading"}
            sessions={sessions}
            workspace={selectedWorkspace}
          />

          <ProtectedOperatorMetricsPanel
            busy={protectedOperatorMetricStatus === "saving"}
            dashboard={protectedOperatorMetricDashboard}
            metrics={protectedOperatorMetrics}
            onRecordMetric={recordProtectedOperatorMetric}
          />

          <ProtectedMetricRollupsPanel
            busySnapshot={protectedMetricRollupStatus === "saving"}
            dashboard={protectedMetricRollupDashboard}
            onCreateSnapshot={createProtectedMetricRollupSnapshot}
            onDownloadPacket={downloadProtectedMetricRollupPacket}
            packetBusyId={protectedMetricRollupPacketBusyId}
            snapshots={protectedMetricRollupSnapshots}
          />

          <ProtectedMetricTrendsPanel
            busyReview={protectedMetricTrendStatus === "saving"}
            dashboard={protectedMetricTrendDashboard}
            onCreateReview={createProtectedMetricTrendReview}
            onDownloadPacket={downloadProtectedMetricTrendPacket}
            packetBusyId={protectedMetricTrendPacketBusyId}
            reviews={protectedMetricTrendReviews}
            rollupSnapshots={protectedMetricRollupSnapshots}
          />

          <ProtectedBoardScorecardsPanel
            busyScorecard={protectedBoardScorecardStatus === "saving"}
            dashboard={protectedBoardScorecardDashboard}
            onCreateScorecard={createProtectedBoardScorecard}
            onDownloadPacket={downloadProtectedBoardScorecardPacket}
            packetBusyId={protectedBoardScorecardPacketBusyId}
            scorecards={protectedBoardScorecards}
            trendReviews={protectedMetricTrendReviews}
          />

          <ProtectedFinanceMethodologyPanel
            busyGateId={protectedFinanceMethodologyBusyGateId}
            onDownloadPacket={downloadProtectedFinanceMethodologyPacket}
            onRecordGate={recordProtectedFinanceMethodologyGate}
            packetBusy={protectedFinanceMethodologyPacketStatus === "downloading"}
            scorecards={protectedBoardScorecards}
            workflow={protectedFinanceMethodologyWorkflow}
          />

          <ProtectedExternalApprovalEvidencePanel
            busyDomainId={protectedExternalApprovalEvidenceBusyDomainId}
            financeWorkflow={protectedFinanceMethodologyWorkflow}
            onDownloadPacket={downloadProtectedExternalApprovalEvidencePacket}
            onRecordReference={recordProtectedExternalApprovalEvidenceReference}
            packetBusy={protectedExternalApprovalEvidencePacketStatus === "downloading"}
            workflow={protectedExternalApprovalEvidenceWorkflow}
          />

          <ProtectedReleaseDecisionPanel
            busy={protectedReleaseDecisionStatus === "saving"}
            externalWorkflow={protectedExternalApprovalEvidenceWorkflow}
            onDownloadPacket={downloadProtectedReleaseDecisionPacket}
            onRecordDecision={recordProtectedReleaseDecision}
            packetBusy={protectedReleaseDecisionPacketStatus === "downloading"}
            workflow={protectedReleaseDecisionWorkflow}
          />

          <ProtectedNamedReviewerSignoffPanel
            busy={protectedNamedReviewerSignoffStatus === "saving"}
            onDownloadPacket={downloadProtectedNamedReviewerSignoffPacket}
            onRecordSignoff={recordProtectedNamedReviewerSignoff}
            packetBusy={protectedNamedReviewerSignoffPacketStatus === "downloading"}
            releaseWorkflow={protectedReleaseDecisionWorkflow}
            workflow={protectedNamedReviewerSignoffWorkflow}
          />

          <ProtectedDistributionLockboxPanel
            busy={protectedDistributionLockboxStatus === "saving"}
            onDownloadPacket={downloadProtectedDistributionLockboxPacket}
            onRecordLockbox={recordProtectedDistributionLockbox}
            packetBusy={protectedDistributionLockboxPacketStatus === "downloading"}
            signoffWorkflow={protectedNamedReviewerSignoffWorkflow}
            workflow={protectedDistributionLockboxWorkflow}
          />

          <ProtectedReleaseAuthorityAttestationPanel
            busy={protectedReleaseAuthorityAttestationStatus === "saving"}
            lockboxWorkflow={protectedDistributionLockboxWorkflow}
            onDownloadPacket={downloadProtectedReleaseAuthorityAttestationPacket}
            onRecordAttestation={recordProtectedReleaseAuthorityAttestation}
            packetBusy={protectedReleaseAuthorityAttestationPacketStatus === "downloading"}
            workflow={protectedReleaseAuthorityAttestationWorkflow}
          />

          <ProtectedEvidenceRoomRecipientAttestationPanel
            authorityWorkflow={protectedReleaseAuthorityAttestationWorkflow}
            busy={protectedEvidenceRoomRecipientAttestationStatus === "saving"}
            onDownloadPacket={downloadProtectedEvidenceRoomRecipientAttestationPacket}
            onRecordAttestation={recordProtectedEvidenceRoomRecipientAttestation}
            packetBusy={protectedEvidenceRoomRecipientAttestationPacketStatus === "downloading"}
            workflow={protectedEvidenceRoomRecipientAttestationWorkflow}
          />

          <ProtectedEvidenceRoomAccessLogReconciliationPanel
            busy={protectedEvidenceRoomAccessLogReconciliationStatus === "saving"}
            onDownloadPacket={downloadProtectedEvidenceRoomAccessLogReconciliationPacket}
            onRecordReconciliation={recordProtectedEvidenceRoomAccessLogReconciliation}
            packetBusy={
              protectedEvidenceRoomAccessLogReconciliationPacketStatus === "downloading"
            }
            recipientWorkflow={protectedEvidenceRoomRecipientAttestationWorkflow}
            workflow={protectedEvidenceRoomAccessLogReconciliationWorkflow}
          />

          <ProtectedEvidenceRoomProviderAdapterPanel
            accessLogWorkflow={protectedEvidenceRoomAccessLogReconciliationWorkflow}
            busy={protectedEvidenceRoomProviderAdapterStatus === "saving"}
            onDownloadPacket={downloadProtectedEvidenceRoomProviderAdapterPacket}
            onRecordAdapter={recordProtectedEvidenceRoomProviderAdapter}
            packetBusy={protectedEvidenceRoomProviderAdapterPacketStatus === "downloading"}
            workflow={protectedEvidenceRoomProviderAdapterWorkflow}
          />

          <ProtectedProviderSecurityReviewPanel
            busy={protectedProviderSecurityReviewStatus === "saving"}
            onDownloadPacket={downloadProtectedProviderSecurityReviewPacket}
            onRecordReview={recordProtectedProviderSecurityReview}
            packetBusy={protectedProviderSecurityReviewPacketStatus === "downloading"}
            providerAdapterWorkflow={protectedEvidenceRoomProviderAdapterWorkflow}
            workflow={protectedProviderSecurityReviewWorkflow}
          />

          <ProtectedProcurementEvidenceRegistryPanel
            busy={protectedProcurementEvidenceRegistryStatus === "saving"}
            onDownloadPacket={downloadProtectedProcurementEvidenceRegistryPacket}
            onRecordRegistry={recordProtectedProcurementEvidenceRegistry}
            packetBusy={protectedProcurementEvidenceRegistryPacketStatus === "downloading"}
            providerSecurityWorkflow={protectedProviderSecurityReviewWorkflow}
            workflow={protectedProcurementEvidenceRegistryWorkflow}
          />

          <ProtectedClinicalAuthorityEvidenceRoomPanel
            onDownloadPacket={downloadProtectedClinicalAuthorityEvidenceRoomPacket}
            packetBusy={protectedClinicalAuthorityEvidenceRoomPacketStatus === "downloading"}
            room={protectedClinicalAuthorityEvidenceRoom}
          />

          <ProtectedClinicalAuthorityOwnerMatrixPanel
            matrix={protectedClinicalAuthorityOwnerMatrix}
            onDownloadPacket={downloadProtectedClinicalAuthorityOwnerMatrixPacket}
            packetBusy={protectedClinicalAuthorityOwnerMatrixPacketStatus === "downloading"}
          />

          <ProtectedClinicalAuthorityArtifactIntakePanel
            checklist={protectedClinicalAuthorityArtifactIntake}
            onDownloadPacket={downloadProtectedClinicalAuthorityArtifactIntakePacket}
            packetBusy={protectedClinicalAuthorityArtifactIntakePacketStatus === "downloading"}
          />

          <ProtectedAuthorityArtifactReferencePanel
            busy={protectedAuthorityArtifactReferenceStatus === "saving"}
            onDownloadPacket={downloadProtectedAuthorityArtifactReferencePacket}
            onRecordReference={recordProtectedAuthorityArtifactReference}
            packetBusy={protectedAuthorityArtifactReferencePacketStatus === "downloading"}
            workflow={protectedAuthorityArtifactReferenceWorkflow}
          />

          <BuyerPilotRoomPanel
            auditEvents={auditEvents}
            commandSnapshots={commandIntelligenceSnapshots}
            demoSnapshots={demoReadinessSnapshots}
            manualQaEvidencePackets={manualQaEvidencePackets}
            onDownloadPacket={downloadBuyerPilotRoomPacket}
            packetBusy={buyerRoomPacketStatus === "downloading"}
            sessions={sessions}
            workspace={selectedWorkspace}
          />

          <ClinicalActivationDossierPanel
            auditEvents={auditEvents}
            commandSnapshots={commandIntelligenceSnapshots}
            demoSnapshots={demoReadinessSnapshots}
            manualQaEvidencePackets={manualQaEvidencePackets}
            onDownloadPacket={downloadClinicalActivationDossierPacket}
            packetBusy={clinicalDossierPacketStatus === "downloading"}
            sessions={sessions}
            workspace={selectedWorkspace}
          />

          <ClinicalActivationApprovalsPanel
            busyDomainId={clinicalApprovalBusyDomainId}
            onDownloadPacket={downloadClinicalActivationApprovalPacket}
            onRecordApproval={recordClinicalActivationApproval}
            packetBusy={clinicalApprovalPacketStatus === "downloading"}
            workflow={clinicalActivationApprovalWorkflow}
          />

          <ManualQaEvidencePanel
            onAuditChanged={() => refreshAuditEvents(session, selectedWorkspace)}
            onEvidenceChanged={setManualQaEvidencePackets}
            packets={manualQaEvidencePackets}
            session={session}
            workspace={selectedWorkspace}
          />

          <TrustOSDecisionLedgerPanel
            onAuditChanged={() => refreshAuditEvents(session, selectedWorkspace)}
            session={session}
            workspace={selectedWorkspace}
          />

          <AgentWorkspaceDashboardPanel
            onAuditChanged={() => refreshAuditEvents(session, selectedWorkspace)}
            session={session}
            workspace={selectedWorkspace}
          />

          <TrustSafetyIncidentWorkspacePanel
            onAuditChanged={() => refreshAuditEvents(session, selectedWorkspace)}
            session={session}
            workspace={selectedWorkspace}
          />

          <TenantAccessAdministrationPanel session={session} workspace={selectedWorkspace} />

          <PilotWorkspaceVerificationPanel
            key={selectedWorkspace.id}
            onAuditChanged={() => refreshAuditEvents(session, selectedWorkspace)}
            onVerificationChanged={setVerificationReadiness}
            session={session}
            workspace={selectedWorkspace}
          />

          <section className="table-section" aria-label="Enterprise proof packet">
            <div className="section-heading">
              <p className="eyebrow">Enterprise proof packet</p>
              <h2>Download tenant-admin diligence evidence for this protected pilot workspace.</h2>
              <p className="section-copy">
                The aggregate packet combines synthetic sessions, TrustOS decisions, Agent Workspace work orders,
                Trust Safety incidents, tenant access posture, governance ledger evidence, and recent audit activity.
                Release requires tenant-admin or pilot-lead authorization, fresh AAL2 assurance, and an append-only
                audit event before download.
              </p>
              <div className="form-actions">
                <button
                  className="primary-action"
                  disabled={enterprisePacketStatus === "downloading"}
                  onClick={downloadEnterpriseProofPacket}
                  type="button"
                >
                  {enterprisePacketStatus === "downloading"
                    ? "Preparing Enterprise Packet"
                    : "Download Enterprise Proof Packet"}
                </button>
              </div>
            </div>
            <article className="module-row">
              <div>
                <span>synthetic-only diligence</span>
                <h2>{selectedWorkspace.tenantName} aggregate proof export</h2>
              </div>
              <p>
                {sessions.length} sessions, {auditEvents.length} audit events, governed workspace boundary retained.
              </p>
              <strong>No PHI, autonomous clinical execution, payer submission, or production authorization.</strong>
            </article>
          </section>

          <section className="table-section" aria-label="Durable synthetic pilot sessions">
            <div className="section-heading">
              <p className="eyebrow">Durable pilot sessions</p>
              <h2>{selectedWorkspace.name}</h2>
              <p className="section-copy">{selectedWorkspace.boundary}</p>
              <div className="form-actions">
                <button
                  className="primary-action"
                  disabled={status === "creating-session"}
                  onClick={createSyntheticSession}
                  type="button"
                >
                  {status === "creating-session" ? "Creating Session" : "Create Synthetic Evaluation Session"}
                </button>
              </div>
              {message ? <div className="intake-alert">{message}</div> : null}
            </div>
            {sessions.length > 0 ? (
              sessions.map((pilotSession) => (
                <article className="module-row" key={pilotSession.id}>
                  <div>
                    <span>{pilotSession.status}</span>
                    <h2>{pilotSession.evaluation.scenario.name}</h2>
                  </div>
                  <p>{pilotSession.createdAt}</p>
                  <button
                    className="module-link button-link"
                    onClick={() => downloadProofPacket(pilotSession)}
                    type="button"
                  >
                    Download Audited Proof Packet
                  </button>
                </article>
              ))
            ) : (
              <article className="module-row">
                <div>
                  <span>empty workspace</span>
                  <h2>No durable synthetic sessions yet.</h2>
                </div>
                <p>Create the first governed synthetic evaluation session.</p>
                <strong>Live clinical execution remains denied.</strong>
              </article>
            )}
          </section>

          <section className="table-section" aria-label="Append-only pilot audit trail">
            <div className="section-heading">
              <p className="eyebrow">Append-only audit trail</p>
              <h2>Governance evidence for protected pilot activity.</h2>
              <p className="section-copy">
                Tenant members can inspect committed evidence activity, while direct audit mutation remains denied.
              </p>
            </div>
            {auditEvents.length > 0 ? (
              auditEvents.map((event) => (
                <article className="module-row" key={event.id}>
                  <div>
                    <span>{event.eventType}</span>
                    <h2>{event.sessionId ? "Session evidence activity" : "Workspace evidence activity"}</h2>
                  </div>
                  <p>{event.createdAt}</p>
                  <strong>{event.sessionId ?? "Workspace-level event"}</strong>
                </article>
              ))
            ) : (
              <article className="module-row">
                <div>
                  <span>empty audit trail</span>
                  <h2>No committed pilot activity yet.</h2>
                </div>
                <p>Audit events appear after governed session and proof-packet activity.</p>
                <strong>Direct mutation remains denied.</strong>
              </article>
            )}
          </section>
        </>
      ) : null}
    </>
  );
}
