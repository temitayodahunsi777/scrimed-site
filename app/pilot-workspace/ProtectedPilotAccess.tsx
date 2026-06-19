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
import ProtectedMetricRollupsPanel from "./ProtectedMetricRollupsPanel";
import ProtectedOperatorMetricsPanel from "./ProtectedOperatorMetricsPanel";
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
          loadProtectedMetricRollups(activeSession, nextWorkspaces[0])
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
  }, [resetProtectedMetricRollups, resetProtectedOperatorMetrics, supabase]);

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
      refreshProtectedMetricRollups(session, workspace)
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
