"use client";

import { createClient, type Session, type User } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import PasskeyManagementPanel from "../components/PasskeyManagementPanel";
import type { AttributionAnalyticsReport } from "../lib/attributionAnalytics";
import {
  salesOperationsBoundary,
  salesPipelineStages,
  type SalesOperationsDashboard,
  type SalesOpportunity,
  type SalesOpportunityUpdate
} from "../lib/salesOperations";
import {
  isProvisioningEligible,
  type SalesOpportunityWorkspaceProvisioningResult
} from "../lib/opportunityWorkspaceProvisioning";
import {
  isTenantLifecycleEligible,
  type SalesBuyerTenantLifecycleResult
} from "../lib/buyerTenantLifecycle";
import {
  isProductionReadinessEligible,
  type SalesProductionActivationReadinessResult
} from "../lib/productionActivationReadiness";
import {
  isCustomerActivationApprovalEligible,
  type SalesCustomerActivationApprovalsResult
} from "../lib/customerActivationApprovals";
import {
  isBuyerDiligenceRoomEligible,
  type SalesBuyerDiligenceRoomResult
} from "../lib/buyerDiligenceRoom";
import {
  isSecureEvidenceVaultReadinessEligible,
  type SalesSecureEvidenceVaultReadinessResult
} from "../lib/secureEvidenceVaultReadiness";
import type {
  SalesBuyerDemoSession,
  SalesBuyerDemoSessionResult
} from "../lib/buyerDemoSessions";
import type { SalesDemoSessionQaRun } from "../lib/salesDemoSessionQa";

type ConsoleStatus =
  | "infrastructure-required"
  | "signed-out"
  | "sending-link"
  | "loading"
  | "mfa-required"
  | "mfa-enrolling"
  | "mfa-verifying"
  | "ready"
  | "saving"
  | "syncing"
  | "scheduling"
  | "provisioning"
  | "activating-lifecycle"
  | "preparing-production-readiness"
  | "recording-activation-approvals"
  | "preparing-buyer-diligence"
  | "preparing-evidence-vault-readiness"
  | "recording-demo-session"
  | "running-demo-session-qa"
  | "completing"
  | "error";

type PasskeyStatus = "idle" | "signing-in" | "registering";

type DashboardResponse = {
  attributionAnalytics?: AttributionAnalyticsReport;
  crmConfigured?: boolean;
  crmMode?: string;
  crmWebhookConfigured?: boolean;
  dashboard?: SalesOperationsDashboard;
  error?: { code?: string; message?: string };
};

type OpportunityResponse = {
  opportunity?: SalesOpportunity;
  workspaceProvisioning?: SalesOpportunityWorkspaceProvisioningResult["workspaceProvisioning"];
  error?: { message?: string };
};

type WorkspaceProvisioningResponse = SalesOpportunityWorkspaceProvisioningResult & {
  error?: { message?: string };
};

type BuyerTenantLifecycleResponse = SalesBuyerTenantLifecycleResult & {
  error?: { message?: string };
};

type ProductionActivationReadinessResponse = SalesProductionActivationReadinessResult & {
  error?: { message?: string };
};

type CustomerActivationApprovalsResponse = SalesCustomerActivationApprovalsResult & {
  error?: { message?: string };
};

type BuyerDiligenceRoomResponse = SalesBuyerDiligenceRoomResult & {
  error?: { message?: string };
};

type SecureEvidenceVaultReadinessResponse = SalesSecureEvidenceVaultReadinessResult & {
  error?: { message?: string };
};

type BuyerDemoSessionsResponse = {
  buyerDemoSessions?: SalesBuyerDemoSession[];
  buyerDemoSession?: SalesBuyerDemoSessionResult["buyerDemoSession"];
  created?: boolean;
  auditEventId?: string | null;
  error?: { message?: string };
};

type BuyerDemoSessionQaResponse = {
  status?: string;
  qaRun?: SalesDemoSessionQaRun;
  error?: { message?: string };
};

function displayValue(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value: string | null) {
  if (!value) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function formatActorId(value: string) {
  return `${value.slice(0, 8)}...${value.slice(-4)}`;
}

function toDateTimeLocal(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const adjusted = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return adjusted.toISOString().slice(0, 16);
}

function defaultAssessmentStart() {
  const date = new Date(Date.now() + 24 * 60 * 60_000);
  date.setMinutes(0, 0, 0);
  return toDateTimeLocal(date.toISOString());
}

function linesFromText(value: string) {
  return value
    .split(/\n|;/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function draftFor(opportunity: SalesOpportunity): SalesOpportunityUpdate {
  return {
    pipelineStage: opportunity.pipelineStage,
    assignedOwner: opportunity.assignedOwner,
    nextAction: opportunity.nextAction,
    nextActionDueAt: opportunity.nextActionDueAt
  };
}

function governancePackFor(opportunity: SalesOpportunity) {
  return opportunity.payload.assessment.governanceWorkflowPack ?? opportunity.payload.governance?.workflowPack ?? null;
}

export default function SalesOperationsConsole({
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
  const [status, setStatus] = useState<ConsoleStatus>(
    configured ? "loading" : "infrastructure-required"
  );
  const [message, setMessage] = useState("");
  const [passkeyStatus, setPasskeyStatus] = useState<PasskeyStatus>("idle");
  const [dashboard, setDashboard] = useState<SalesOperationsDashboard | null>(null);
  const [attributionAnalytics, setAttributionAnalytics] = useState<AttributionAnalyticsReport | null>(null);
  const [crmMode, setCrmMode] = useState("native-export");
  const [crmWebhookConfigured, setCrmWebhookConfigured] = useState(false);
  const [selected, setSelected] = useState<SalesOpportunity | null>(null);
  const [draft, setDraft] = useState<SalesOpportunityUpdate | null>(null);
  const [buyerDemoSessionsByIntake, setBuyerDemoSessionsByIntake] = useState<
    Record<string, SalesBuyerDemoSession[]>
  >({});
  const [buyerDemoQaRunsByIntake, setBuyerDemoQaRunsByIntake] = useState<
    Record<string, SalesDemoSessionQaRun>
  >({});
  const [demoOperatorNotes, setDemoOperatorNotes] = useState("");
  const [demoBuyerQuestions, setDemoBuyerQuestions] = useState("");
  const [demoNextActions, setDemoNextActions] = useState("");
  const [mfaFactorId, setMfaFactorId] = useState("");
  const [mfaFactorStatus, setMfaFactorStatus] = useState<"verified" | "unverified" | "">("");
  const [mfaQrCode, setMfaQrCode] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [assessmentStart, setAssessmentStart] = useState(defaultAssessmentStart);
  const [assessmentDuration, setAssessmentDuration] = useState(45);
  const [assessmentMeetingUrl, setAssessmentMeetingUrl] = useState("");

  useEffect(() => {
    const client = supabase;

    if (!client) {
      return;
    }

    const activeClient = client;
    let active = true;

    async function loadDashboard(activeSession: Session) {
      setStatus("loading");
      setMessage("");
      const response = await fetch("/api/sales-operations", {
        headers: {
          Authorization: `Bearer ${activeSession.access_token}`
        }
      });
      const body = (await response.json()) as DashboardResponse;

      if (!active) {
        return;
      }

      if (!response.ok || !body.dashboard) {
        if (body.error?.code === "sales-operations-mfa-required") {
          setStatus("mfa-required");
          setMessage(body.error.message ?? "Verify the enrolled authenticator factor.");
          return;
        }

        setStatus("error");
        setMessage(body.error?.message ?? "The tenant-admin sales operations console could not be loaded.");
        return;
      }

      setDashboard(body.dashboard);
      setAttributionAnalytics(body.attributionAnalytics ?? null);
      setCrmMode(body.crmMode ?? "native-export");
      setCrmWebhookConfigured(Boolean(body.crmWebhookConfigured));
      const nextSelected = body.dashboard.opportunities[0] ?? null;
      setSelected(nextSelected);
      setDraft(nextSelected ? draftFor(nextSelected) : null);
      setDemoOperatorNotes("");
      setDemoBuyerQuestions("");
      setDemoNextActions("");
      setAssessmentStart(
        nextSelected?.assessmentStartAt
          ? toDateTimeLocal(nextSelected.assessmentStartAt)
          : defaultAssessmentStart()
      );
      setAssessmentDuration(nextSelected?.assessmentDurationMinutes ?? 45);
      setAssessmentMeetingUrl(nextSelected?.assessmentMeetingUrl ?? "");
      setStatus("ready");
    }

    async function applySession(nextSession: Session | null) {
      if (!active) {
        return;
      }

      setSession(nextSession);

      if (!nextSession) {
        setUser(null);
        setPasskeyStatus("idle");
        setDashboard(null);
        setAttributionAnalytics(null);
        setSelected(null);
        setDraft(null);
        setBuyerDemoSessionsByIntake({});
        setBuyerDemoQaRunsByIntake({});
        setDemoOperatorNotes("");
        setDemoBuyerQuestions("");
        setDemoNextActions("");
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
        setMessage("The identity provider could not verify this tenant-admin session.");
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
        setStatus("mfa-required");
        setMessage(
          verifiedFactor
            ? "Enter the code from the enrolled authenticator to continue."
            : pendingFactor
              ? "Finish verifying the authenticator you scanned, or restart setup to generate a new QR code."
              : "Enroll a free authenticator factor before accessing tenant-admin sales operations."
        );
        return;
      }

      await loadDashboard(nextSession);
    }

    async function initializeAccess() {
      const { data } = await activeClient.auth.getSession();

      if (active) {
        await applySession(data.session);
      }
    }

    void initializeAccess();
    const {
      data: { subscription }
    } = activeClient.auth.onAuthStateChange((_event, nextSession) => {
      void applySession(nextSession);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!session || !selected || status !== "ready") {
      return;
    }

    const activeSession = session;
    const activeOpportunity = selected;
    let active = true;

    async function loadSelectedBuyerDemoSessions() {
      const response = await fetch(
        `/api/sales-operations/opportunities/${activeOpportunity.intakeId}/demo-sessions`,
        {
          headers: {
            Authorization: `Bearer ${activeSession.access_token}`
          }
        }
      );
      const body = (await response.json()) as BuyerDemoSessionsResponse;

      if (!active || !response.ok || !body.buyerDemoSessions) {
        return;
      }

      setBuyerDemoSessionsByIntake((current) => ({
        ...current,
        [activeOpportunity.intakeId]: body.buyerDemoSessions ?? []
      }));
    }

    void loadSelectedBuyerDemoSessions();

    return () => {
      active = false;
    };
  }, [selected, session, status]);

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
        emailRedirectTo: `${window.location.origin}/sales-operations`,
        shouldCreateUser: false
      }
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("signed-out");
    setMessage("If this identity is an approved tenant-admin, check its enterprise email for the secure access link.");
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
    setMessage("Passkey verified. Opening tenant-admin operations.");
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
      `Passkey registered${data.friendly_name ? `: ${data.friendly_name}` : ""}. Future sign-in can use the passkey button; tenant-admin changes still require fresh assurance.`
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
      friendlyName: "SCRIMED Sales Operations"
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
    setMessage("Scan the QR code with an authenticator app, then enter its six-digit code.");
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
    setMessage("Authenticator verified. Upgrading the tenant-admin session to AAL2.");
    window.location.reload();
  }

  async function signOut(scope: "local" | "global" = "local") {
    if (supabase) {
      await supabase.auth.signOut({ scope });
    }
  }

  async function refreshDashboard(nextMessage?: string) {
    if (!session) {
      return;
    }

    const response = await fetch("/api/sales-operations", {
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    });
    const body = (await response.json()) as DashboardResponse;

    if (!response.ok || !body.dashboard) {
      setStatus(body.error?.code === "sales-operations-mfa-required" ? "mfa-required" : "error");
      setMessage(body.error?.message ?? "Sales operations could not be refreshed.");
      return;
    }

    setDashboard(body.dashboard);
    setAttributionAnalytics(body.attributionAnalytics ?? null);
    setCrmMode(body.crmMode ?? "native-export");
    setCrmWebhookConfigured(Boolean(body.crmWebhookConfigured));
    const nextSelected =
      body.dashboard.opportunities.find((opportunity) => opportunity.intakeId === selected?.intakeId) ??
      body.dashboard.opportunities[0] ??
      null;
    setSelected(nextSelected);
    setDraft(nextSelected ? draftFor(nextSelected) : null);
    setStatus("ready");
    setMessage(nextMessage ?? "");
  }

  function selectOpportunity(opportunity: SalesOpportunity) {
    setSelected(opportunity);
    setDraft(draftFor(opportunity));
    setDemoOperatorNotes("");
    setDemoBuyerQuestions("");
    setDemoNextActions("");
    setAssessmentStart(
      opportunity.assessmentStartAt
        ? toDateTimeLocal(opportunity.assessmentStartAt)
        : defaultAssessmentStart()
    );
    setAssessmentDuration(opportunity.assessmentDurationMinutes);
    setAssessmentMeetingUrl(opportunity.assessmentMeetingUrl);
    setMessage("");
  }

  async function saveOpportunity() {
    if (!session || !selected || !draft) {
      return;
    }

    setStatus("saving");
    setMessage("");
    const response = await fetch(`/api/sales-operations/opportunities/${selected.intakeId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(draft)
    });
    const body = (await response.json()) as OpportunityResponse;

    if (!response.ok) {
      setStatus("error");
      setMessage(body.error?.message ?? "The opportunity update could not be committed.");
      return;
    }

    await refreshDashboard("Opportunity, next-action cadence, and append-only audit event committed.");
  }

  async function downloadProtectedFile(path: string, fileName: string, successMessage: string) {
    if (!session) {
      return;
    }

    setMessage("");
    const response = await fetch(path, {
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    });

    if (!response.ok) {
      const body = (await response.json()) as OpportunityResponse;
      setMessage(body.error?.message ?? "The audited artifact could not be downloaded.");
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
    await refreshDashboard(successMessage);
  }

  async function downloadProposal() {
    if (!selected) {
      return;
    }

    await downloadProtectedFile(
      `/api/sales-operations/opportunities/${selected.intakeId}/proposal`,
      `scrimed-${selected.intakeId}-opportunity-proposal.md`,
      "Buyer proposal downloaded and its append-only audit event committed."
    );
  }

  async function downloadCrmExport() {
    if (!selected) {
      return;
    }

    await downloadProtectedFile(
      `/api/sales-operations/opportunities/${selected.intakeId}/crm-export`,
      `scrimed-${selected.intakeId}-crm-import.csv`,
      "Vendor-neutral CRM import downloaded and its append-only audit event committed."
    );
  }

  async function downloadAttributionAnalyticsPacket() {
    if (!selected) {
      return;
    }

    await downloadProtectedFile(
      `/api/sales-operations/opportunities/${selected.intakeId}/attribution-analytics-packet`,
      `scrimed-${selected.intakeId}-attribution-analytics-packet.md`,
      "Attribution analytics packet downloaded and its append-only audit event committed."
    );
  }

  async function downloadDealRoomPacket() {
    if (!selected) {
      return;
    }

    await downloadProtectedFile(
      `/api/sales-operations/opportunities/${selected.intakeId}/deal-room-packet`,
      `scrimed-${selected.intakeId}-pilot-deal-room.md`,
      "Pilot deal-room packet downloaded and its append-only audit event committed."
    );
  }

  async function downloadBuyerDemoExecutionBrief() {
    if (!selected) {
      return;
    }

    await downloadProtectedFile(
      `/api/sales-operations/opportunities/${selected.intakeId}/demo-execution/brief`,
      `scrimed-${selected.intakeId}-buyer-demo-execution-brief.md`,
      "Buyer demo execution operator brief downloaded. Existing audited packet routes remain the source of truth."
    );
  }

  async function loadBuyerDemoSessions(opportunity: SalesOpportunity | null = selected) {
    if (!session || !opportunity) {
      return;
    }

    const response = await fetch(
      `/api/sales-operations/opportunities/${opportunity.intakeId}/demo-sessions`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      }
    );
    const body = (await response.json()) as BuyerDemoSessionsResponse;

    if (!response.ok || !body.buyerDemoSessions) {
      return;
    }

    setBuyerDemoSessionsByIntake((current) => ({
      ...current,
      [opportunity.intakeId]: body.buyerDemoSessions ?? []
    }));
  }

  async function recordBuyerDemoSession() {
    if (!session || !selected) {
      return;
    }

    const nextActions = linesFromText(demoNextActions);
    setStatus("recording-demo-session");
    setMessage("");
    const response = await fetch(
      `/api/sales-operations/opportunities/${selected.intakeId}/demo-sessions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          operatorNotes: demoOperatorNotes,
          buyerQuestions: linesFromText(demoBuyerQuestions),
          nextActions,
          followUpPlan: {
            owner: user?.email ?? "SCRIMED sales operator",
            nextStep: nextActions[0] ?? selected.nextAction ?? "Confirm buyer decision path",
            dueAt: selected.nextActionDueAt ?? "",
            commercialMotion: selected.payload.scope.offerInterest || "Synthetic Pilot Evaluation"
          }
        })
      }
    );
    const body = (await response.json()) as BuyerDemoSessionsResponse;

    if (!response.ok || !body.buyerDemoSession) {
      setStatus("ready");
      setMessage(body.error?.message ?? "The buyer demo session could not be recorded.");
      return;
    }

    setDemoOperatorNotes("");
    setDemoBuyerQuestions("");
    setDemoNextActions("");
    await refreshDashboard("Buyer demo session recorded with no-PHI history and append-only audit.");
    await loadBuyerDemoSessions(selected);
  }

  async function downloadBuyerDemoSessionPacket(sessionId: string) {
    if (!selected) {
      return;
    }

    await downloadProtectedFile(
      `/api/sales-operations/opportunities/${selected.intakeId}/demo-sessions/${sessionId}/packet`,
      `scrimed-${selected.intakeId}-${sessionId}-buyer-demo-session.md`,
      "Buyer demo session packet downloaded and its append-only audit event committed."
    );
    await loadBuyerDemoSessions(selected);
  }

  async function runBuyerDemoSessionQa() {
    if (!session || !selected) {
      return;
    }

    const qaTarget = selected;
    setStatus("running-demo-session-qa");
    setMessage("");
    const response = await fetch("/api/sales-operations/qa/buyer-demo-sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        intakeId: qaTarget.intakeId
      })
    });
    const body = (await response.json()) as BuyerDemoSessionQaResponse;

    if (!response.ok || !body.qaRun) {
      setStatus("ready");
      setMessage(body.error?.message ?? "The buyer demo session QA harness did not complete.");
      return;
    }

    setBuyerDemoQaRunsByIntake((current) => ({
      ...current,
      [qaTarget.intakeId]: body.qaRun as SalesDemoSessionQaRun
    }));
    await refreshDashboard(
      `Buyer demo QA passed: session ${body.qaRun.createdSessionId.slice(0, 8)} and packet audit ${
        body.qaRun.packetAuditEventId?.slice(0, 8) ?? "committed"
      } verified.`
    );
    await loadBuyerDemoSessions(qaTarget);
  }

  async function provisionWorkspace() {
    if (!session || !selected) {
      return;
    }

    setStatus("provisioning");
    setMessage("");
    const response = await fetch(
      `/api/sales-operations/opportunities/${selected.intakeId}/workspace-provisioning`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      }
    );
    const body = (await response.json()) as WorkspaceProvisioningResponse;

    if (!response.ok) {
      setStatus("ready");
      setMessage(body.error?.message ?? "The buyer-specific workspace could not be provisioned.");
      return;
    }

    await refreshDashboard(
      body.created
        ? "Buyer-specific protected workspace provisioned and audit event committed."
        : "Buyer-specific protected workspace already exists; dashboard refreshed."
    );
  }

  async function downloadWorkspaceProvisioningPacket() {
    if (!selected) {
      return;
    }

    await downloadProtectedFile(
      `/api/sales-operations/opportunities/${selected.intakeId}/workspace-provisioning/packet`,
      `scrimed-${selected.intakeId}-workspace-provisioning.md`,
      "Opportunity workspace provisioning packet downloaded and its append-only audit event committed."
    );
  }

  async function activateBuyerTenantLifecycle() {
    if (!session || !selected) {
      return;
    }

    setStatus("activating-lifecycle");
    setMessage("");
    const response = await fetch(
      `/api/sales-operations/opportunities/${selected.intakeId}/tenant-lifecycle`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      }
    );
    const body = (await response.json()) as BuyerTenantLifecycleResponse;

    if (!response.ok) {
      setStatus("ready");
      setMessage(body.error?.message ?? "The buyer tenant lifecycle could not be activated.");
      return;
    }

    await refreshDashboard(
      body.created
        ? "Buyer tenant lifecycle controls activated and audit event committed."
        : "Buyer tenant lifecycle controls already exist; dashboard refreshed."
    );
  }

  async function downloadBuyerTenantLifecyclePacket() {
    if (!selected) {
      return;
    }

    await downloadProtectedFile(
      `/api/sales-operations/opportunities/${selected.intakeId}/tenant-lifecycle/packet`,
      `scrimed-${selected.intakeId}-buyer-tenant-lifecycle.md`,
      "Buyer tenant lifecycle packet downloaded and its append-only audit event committed."
    );
  }

  async function prepareProductionActivationReadiness() {
    if (!session || !selected) {
      return;
    }

    setStatus("preparing-production-readiness");
    setMessage("");
    const response = await fetch(
      `/api/sales-operations/opportunities/${selected.intakeId}/production-readiness`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      }
    );
    const body = (await response.json()) as ProductionActivationReadinessResponse;

    if (!response.ok) {
      setStatus("ready");
      setMessage(body.error?.message ?? "Production SSO and invitation readiness could not be prepared.");
      return;
    }

    await refreshDashboard(
      body.created
        ? "Production SSO and invitation readiness prepared and audit event committed."
        : "Production SSO and invitation readiness already exists; dashboard refreshed."
    );
  }

  async function downloadProductionReadinessPacket() {
    if (!selected) {
      return;
    }

    await downloadProtectedFile(
      `/api/sales-operations/opportunities/${selected.intakeId}/production-readiness/packet`,
      `scrimed-${selected.intakeId}-production-readiness.md`,
      "Production readiness packet downloaded and its append-only audit event committed."
    );
  }

  async function recordCustomerActivationApprovals() {
    if (!session || !selected) {
      return;
    }

    setStatus("recording-activation-approvals");
    setMessage("");
    const response = await fetch(
      `/api/sales-operations/opportunities/${selected.intakeId}/activation-approvals`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      }
    );
    const body = (await response.json()) as CustomerActivationApprovalsResponse;

    if (!response.ok) {
      setStatus("ready");
      setMessage(body.error?.message ?? "Customer activation approvals could not be recorded.");
      return;
    }

    await refreshDashboard(
      body.created
        ? "Customer activation approvals recorded for paid pilot setup and audit event committed."
        : "Customer activation approvals already exist; dashboard refreshed."
    );
  }

  async function downloadCustomerActivationApprovalsPacket() {
    if (!selected) {
      return;
    }

    await downloadProtectedFile(
      `/api/sales-operations/opportunities/${selected.intakeId}/activation-approvals/packet`,
      `scrimed-${selected.intakeId}-activation-approvals.md`,
      "Customer activation approval packet downloaded and its append-only audit event committed."
    );
  }

  async function prepareBuyerDiligenceRoom() {
    if (!session || !selected) {
      return;
    }

    setStatus("preparing-buyer-diligence");
    setMessage("");
    const response = await fetch(
      `/api/sales-operations/opportunities/${selected.intakeId}/buyer-diligence`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      }
    );
    const body = (await response.json()) as BuyerDiligenceRoomResponse;

    if (!response.ok) {
      setStatus("ready");
      setMessage(body.error?.message ?? "Buyer evidence diligence room could not be prepared.");
      return;
    }

    await refreshDashboard(
      body.created
        ? "Buyer evidence diligence room prepared and audit event committed."
        : "Buyer evidence diligence room already exists; dashboard refreshed."
    );
  }

  async function downloadBuyerDiligencePacket() {
    if (!selected) {
      return;
    }

    await downloadProtectedFile(
      `/api/sales-operations/opportunities/${selected.intakeId}/buyer-diligence/packet`,
      `scrimed-${selected.intakeId}-buyer-diligence.md`,
      "Buyer diligence packet downloaded and its append-only audit event committed."
    );
  }

  async function prepareSecureEvidenceVaultReadiness() {
    if (!session || !selected) {
      return;
    }

    setStatus("preparing-evidence-vault-readiness");
    setMessage("");
    const response = await fetch(
      `/api/sales-operations/opportunities/${selected.intakeId}/evidence-vault-readiness`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      }
    );
    const body = (await response.json()) as SecureEvidenceVaultReadinessResponse;

    if (!response.ok) {
      setStatus("ready");
      setMessage(body.error?.message ?? "Secure evidence vault readiness could not be prepared.");
      return;
    }

    await refreshDashboard(
      body.created
        ? "Secure evidence vault readiness prepared with storage disabled and audit event committed."
        : "Secure evidence vault readiness already exists; dashboard refreshed."
    );
  }

  async function downloadSecureEvidenceVaultReadinessPacket() {
    if (!selected) {
      return;
    }

    await downloadProtectedFile(
      `/api/sales-operations/opportunities/${selected.intakeId}/evidence-vault-readiness/packet`,
      `scrimed-${selected.intakeId}-evidence-vault-readiness.md`,
      "Secure evidence vault readiness packet downloaded and its append-only audit event committed."
    );
  }

  async function downloadFollowUpDraft() {
    if (!selected) {
      return;
    }

    await downloadProtectedFile(
      `/api/sales-operations/opportunities/${selected.intakeId}/follow-up-draft`,
      `scrimed-${selected.intakeId}-follow-up.eml`,
      "Human-reviewed follow-up draft downloaded and its append-only audit event committed."
    );
  }

  async function completeFollowUp() {
    if (!session || !selected) {
      return;
    }

    setStatus("completing");
    const response = await fetch(
      `/api/sales-operations/opportunities/${selected.intakeId}/follow-up/complete`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      }
    );
    const body = (await response.json()) as OpportunityResponse;
    await refreshDashboard(
      response.ok
        ? "Follow-up marked complete and its append-only audit event committed."
        : body.error?.message ?? "Follow-up completion could not be committed."
    );
  }

  async function downloadAssessmentInvitation() {
    if (!session || !selected || !assessmentStart) {
      return;
    }

    setStatus("scheduling");
    setMessage("");
    const response = await fetch(
      `/api/sales-operations/opportunities/${selected.intakeId}/assessment-invitation`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          startAt: new Date(assessmentStart).toISOString(),
          durationMinutes: assessmentDuration,
          meetingUrl: assessmentMeetingUrl
        })
      }
    );

    if (!response.ok) {
      const body = (await response.json()) as OpportunityResponse;
      setStatus("ready");
      setMessage(body.error?.message ?? "The audited assessment invitation could not be generated.");
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `scrimed-${selected.intakeId}-enterprise-assessment.ics`;
    link.click();
    URL.revokeObjectURL(url);
    await refreshDashboard("Assessment invitation downloaded and its append-only audit event committed.");
  }

  async function syncCrm() {
    if (!session || !selected || !crmWebhookConfigured) {
      return;
    }

    setStatus("syncing");
    setMessage("");
    const response = await fetch(
      `/api/sales-operations/opportunities/${selected.intakeId}/crm-sync`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      }
    );
    const body = (await response.json()) as OpportunityResponse;

    await refreshDashboard(
      response.ok
        ? "The configured CRM accepted this opportunity and the result was audited."
        : body.error?.message ?? "CRM synchronization did not complete; the opportunity remains durably retained."
    );
  }

  if (!configured) {
    return (
      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Activation required</p>
          <h2>Sales operations remains fail-closed until production identity and storage are connected.</h2>
          <p className="section-copy">{salesOperationsBoundary}</p>
        </div>
      </section>
    );
  }

  if (!session || !user) {
    return (
      <section className="section-band evaluation-band">
        <form className="evaluation-form" onSubmit={sendMagicLink}>
          <div className="form-section">
            <p className="eyebrow">Passwordless tenant-admin authentication</p>
            <h2>Access SCRIMED opportunity operations.</h2>
            <label className="form-field form-field-wide">
              <span>Approved SCRIMED tenant-admin email</span>
              <input
                autoComplete="email"
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />
              <small>
                Use an enrolled passkey or a secure email link. Authenticator verification is required for
                tenant-admin operations; password authentication is not used.
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
            <Link className="secondary-action" href="/pilot">
              Open Buyer Intake
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
            <p className="eyebrow">Tenant-admin assurance gate</p>
            <h2>Verify an authenticator before entering Sales Operations.</h2>
            <p className="section-copy">
              SCRIMED uses passkey or passwordless magic-link sign-in plus free TOTP verification. Sales sessions
              expire after twelve hours and require activity within two hours.
            </p>
            {mfaQrCode ? (
              <div className="mfa-enrollment">
                <Image
                  alt="SCRIMED authenticator enrollment QR code"
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

  const selectedGovernancePack = selected ? governancePackFor(selected) : null;
  const selectedAttribution = selected?.payload.attribution ?? null;
  const selectedWorkspaceProvisioning = selected?.workspaceProvisioning ?? null;
  const selectedBuyerTenantLifecycle = selected?.buyerTenantLifecycle ?? null;
  const selectedProductionReadiness = selected?.productionActivationReadiness ?? null;
  const selectedCustomerActivationApprovals = selected?.customerActivationApprovals ?? null;
  const selectedBuyerDiligenceRoom = selected?.buyerDiligenceRoom ?? null;
  const selectedSecureEvidenceVaultReadiness = selected?.secureEvidenceVaultReadiness ?? null;
  const workspaceEligible = selected ? isProvisioningEligible(selected) : false;
  const tenantLifecycleEligible = selected ? isTenantLifecycleEligible(selected) : false;
  const productionReadinessEligible = selected ? isProductionReadinessEligible(selected) : false;
  const activationApprovalEligible = selected ? isCustomerActivationApprovalEligible(selected) : false;
  const buyerDiligenceEligible = selected ? isBuyerDiligenceRoomEligible(selected) : false;
  const secureEvidenceVaultEligible = selected
    ? isSecureEvidenceVaultReadinessEligible(selected)
    : false;
  const selectedAuditEvents =
    dashboard?.auditEvents.filter((event) => event.intakeId === selected?.intakeId) ?? [];
  const hasSelectedAuditEvent = (eventType: string) =>
    selectedAuditEvents.some((event) => event.eventType === eventType);
  const buyerDemoWorkspaceSlug =
    selectedWorkspaceProvisioning?.workspaceSlug ?? "atlas-synthetic-evaluation";
  const buyerDemoWorkspaceMode = selectedWorkspaceProvisioning
    ? "buyer-specific protected workspace"
    : "default synthetic workspace";
  const selectedBuyerDemoSessions = selected
    ? buyerDemoSessionsByIntake[selected.intakeId] ?? []
    : [];
  const latestBuyerDemoSession = selectedBuyerDemoSessions[0] ?? null;
  const latestBuyerDemoQaRun = selected ? buyerDemoQaRunsByIntake[selected.intakeId] ?? null : null;
  const buyerDemoSteps = selected
    ? [
        {
          label: "Proposal",
          status: hasSelectedAuditEvent("proposal-downloaded") ? "complete" : "available",
          evidence: hasSelectedAuditEvent("proposal-downloaded")
            ? "Audited proposal exists"
            : "Ready for human review"
        },
        {
          label: "Attribution packet",
          status:
            hasSelectedAuditEvent("attribution-analytics-packet-downloaded") ||
            Boolean(selected.lastAttributionAnalyticsPacketAt)
              ? "complete"
              : selectedAttribution
                ? "available"
                : "blocked",
          evidence: selectedAttribution ? selectedAttribution.market.revenueStream : "Source signal missing"
        },
        {
          label: "Deal-room packet",
          status:
            hasSelectedAuditEvent("buyer-deal-room-packet-downloaded") ||
            Boolean(selected.lastBuyerDealRoomPacketAt)
              ? "complete"
              : "available",
          evidence: selected.lastBuyerDealRoomPacketAt
            ? `Last released ${formatDate(selected.lastBuyerDealRoomPacketAt)}`
            : "Ready for audit"
        },
        {
          label: "Buyer workspace",
          status: selectedWorkspaceProvisioning ? "complete" : workspaceEligible ? "available" : "blocked",
          evidence: selectedWorkspaceProvisioning
            ? selectedWorkspaceProvisioning.workspaceSlug
            : workspaceEligible
              ? "Qualified for provisioning"
              : "Advance to Qualified"
        },
        {
          label: "Tenant lifecycle",
          status: selectedBuyerTenantLifecycle ? "complete" : tenantLifecycleEligible ? "available" : "blocked",
          evidence: selectedBuyerTenantLifecycle?.lifecycleStatus ?? "Workspace required"
        },
        {
          label: "Production readiness",
          status: selectedProductionReadiness
            ? "complete"
            : productionReadinessEligible
              ? "available"
              : "blocked",
          evidence: selectedProductionReadiness?.readinessStatus ?? "Lifecycle required"
        },
        {
          label: "Setup approvals",
          status: selectedCustomerActivationApprovals
            ? "complete"
            : activationApprovalEligible
              ? "available"
              : "blocked",
          evidence: selectedCustomerActivationApprovals?.approvalStatus ?? "Production readiness required"
        },
        {
          label: "Buyer diligence",
          status: selectedBuyerDiligenceRoom ? "complete" : buyerDiligenceEligible ? "available" : "blocked",
          evidence: selectedBuyerDiligenceRoom?.diligenceStatus ?? "Setup approval required"
        },
        {
          label: "Vault readiness",
          status: selectedSecureEvidenceVaultReadiness
            ? "complete"
            : secureEvidenceVaultEligible
              ? "available"
              : "blocked",
          evidence: selectedSecureEvidenceVaultReadiness?.readinessStatus ?? "Diligence room required"
        },
        {
          label: "Buyer room",
          status: "available",
          evidence: buyerDemoWorkspaceMode
        },
        {
          label: "Enterprise proof packet",
          status: "manual-review-required",
          evidence: "Release after workspace proof review"
        }
      ]
    : [];
  const buyerDemoCompletedSteps = buyerDemoSteps.filter((step) => step.status === "complete").length;
  const buyerDemoWeightedScore = buyerDemoSteps.length
    ? Math.round(
        (buyerDemoSteps.reduce((total, step) => {
          if (step.status === "complete") return total + 1;
          if (step.status === "available") return total + 0.5;
          return total;
        }, 0) /
          buyerDemoSteps.length) *
          100
      )
    : 0;
  const buyerDemoNextStep =
    buyerDemoSteps.find((step) => step.status === "available") ??
    buyerDemoSteps.find((step) => step.status === "blocked") ??
    buyerDemoSteps.find((step) => step.status === "manual-review-required");

  return (
    <>
      <section className="section-band hub-summary" aria-label="Sales operations summary">
        <article>
          <span>Access assurance</span>
          <strong>AAL2 tenant-admin</strong>
        </article>
        <article>
          <span>Passkey posture</span>
          <strong>Enabled</strong>
        </article>
        <article>
          <span>Open opportunities</span>
          <strong>{dashboard?.summary.openCount ?? 0}</strong>
        </article>
        <article>
          <span>Due actions</span>
          <strong>{dashboard?.summary.dueActionCount ?? 0}</strong>
        </article>
        <article>
          <span>Overdue actions</span>
          <strong>{dashboard?.summary.overdueActionCount ?? 0}</strong>
        </article>
        <article>
          <span>Assessments</span>
          <strong>{dashboard?.summary.scheduledAssessmentCount ?? 0}</strong>
        </article>
        <article>
          <span>CRM mode</span>
          <strong>{displayValue(crmMode)}</strong>
        </article>
        <article>
          <span>Attribution cohorts</span>
          <strong>{attributionAnalytics?.cohorts.length ?? 0}</strong>
        </article>
        <article>
          <span>Source coverage</span>
          <strong>{attributionAnalytics ? `${attributionAnalytics.totals.sourceCoveragePercent}%` : "0%"}</strong>
        </article>
      </section>

      {attributionAnalytics ? (
        <section className="section-band split-band" aria-label="Tenant attribution analytics">
          <div>
            <p className="eyebrow">Tenant attribution analytics</p>
            <h2>Source-to-pilot cohorts now live inside Sales Operations.</h2>
            <p className="section-copy">{attributionAnalytics.boundary}</p>
          </div>
          <div className="layer-list">
            {[
              `Mode: ${attributionAnalytics.mode}`,
              `Records: ${attributionAnalytics.totals.recordCount}`,
              `Proof coverage: ${attributionAnalytics.totals.proofPacketCoveragePercent}%`,
              `Open pipeline: ${attributionAnalytics.totals.openPipelineCount}`
            ].map((item, index) => (
              <div className="layer-row" key={item}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{item}</strong>
              </div>
            ))}
            {attributionAnalytics.proofRecommendations.slice(0, 4).map((recommendation, index) => (
              <div className="layer-row" key={recommendation.cohort}>
                <span>{String(index + 5).padStart(2, "0")}</span>
                <strong>{recommendation.cohort}: {recommendation.nextAction}</strong>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {supabase ? (
        <PasskeyManagementPanel supabase={supabase} surface="Sales Operations" />
      ) : null}

      <section className="section-band sales-workspace" aria-label="Tenant-admin sales opportunity workspace">
        <div className="sales-toolbar">
          <div>
            <p className="eyebrow">Opportunity work queue</p>
            <h2>Own the decision path, keep cadence, and retain proof.</h2>
            <p className="section-copy">{dashboard?.boundary ?? salesOperationsBoundary}</p>
          </div>
          <div className="form-actions">
            <Link className="secondary-action" href="/pilot">Create Buyer Intake</Link>
            <button className="secondary-action" onClick={() => refreshDashboard()} type="button">
              Refresh
            </button>
            <button className="secondary-action" onClick={() => signOut("local")} type="button">
              Sign Out
            </button>
            <button className="secondary-action" onClick={() => signOut("global")} type="button">
              End All Sessions
            </button>
          </div>
        </div>

        {message ? <div className="intake-alert">{message}</div> : null}

        <div className="sales-console-grid">
          <div className="sales-opportunity-list">
            {dashboard?.opportunities.length ? (
              dashboard.opportunities.map((opportunity) => (
                <button
                  className={`sales-opportunity-button${selected?.intakeId === opportunity.intakeId ? " sales-opportunity-button-active" : ""}`}
                  key={opportunity.intakeId}
                  onClick={() => selectOpportunity(opportunity)}
                  type="button"
                >
                  <span>{displayValue(opportunity.pipelineStage)}</span>
                  <strong>{opportunity.payload.organization.name}</strong>
                  <small>
                    {opportunity.nextActionDueAt && !opportunity.nextActionCompletedAt
                      ? `Due ${formatDate(opportunity.nextActionDueAt)}`
                      : governancePackFor(opportunity)?.name ?? opportunity.payload.scope.timeline}
                  </small>
                </button>
              ))
            ) : (
              <div className="sales-empty-state">
                <strong>No retained buyer opportunities yet.</strong>
                <p>Submit a clearly synthetic internal demo opportunity or route a qualified buyer through governed intake.</p>
                <Link className="module-link" href="/pilot">Open Buyer Intake</Link>
              </div>
            )}
          </div>

          {selected && draft ? (
            <div className="sales-opportunity-detail">
              <div className="sales-detail-heading">
                <div>
                  <span>{selected.intakeId}</span>
                  <h2>{selected.payload.organization.name}</h2>
                  <p>{selected.payload.contact.fullName} · {selected.payload.contact.role} · {selected.payload.contact.workEmail}</p>
                </div>
                <strong>{selectedGovernancePack?.name ?? displayValue(selected.payload.scope.offerInterest)}</strong>
              </div>

              <div className="form-grid">
                <label className="form-field">
                  <span>Pipeline stage</span>
                  <select
                    onChange={(event) =>
                      setDraft((current) =>
                        current
                          ? { ...current, pipelineStage: event.target.value as SalesOpportunityUpdate["pipelineStage"] }
                          : current
                      )
                    }
                    value={draft.pipelineStage}
                  >
                    {salesPipelineStages.map((stage) => (
                      <option key={stage} value={stage}>{displayValue(stage)}</option>
                    ))}
                  </select>
                </label>
                <label className="form-field">
                  <span>Assigned owner</span>
                  <input
                    onChange={(event) =>
                      setDraft((current) => current ? { ...current, assignedOwner: event.target.value } : current)
                    }
                    placeholder="SCRIMED opportunity owner"
                    value={draft.assignedOwner}
                  />
                </label>
                <label className="form-field form-field-wide">
                  <span>Next business action</span>
                  <textarea
                    onChange={(event) =>
                      setDraft((current) => current ? { ...current, nextAction: event.target.value } : current)
                    }
                    placeholder="Confirm discovery meeting, pilot sponsor, and decision criteria."
                    value={draft.nextAction}
                  />
                  <small>No PHI, patient identifiers, clinical records, diagnosis details, or payer member data.</small>
                </label>
                <label className="form-field">
                  <span>Next-action due</span>
                  <input
                    onChange={(event) =>
                      setDraft((current) =>
                        current
                          ? {
                              ...current,
                              nextActionDueAt: event.target.value
                                ? new Date(event.target.value).toISOString()
                                : null
                            }
                          : current
                      )
                    }
                    type="datetime-local"
                    value={toDateTimeLocal(draft.nextActionDueAt)}
                  />
                </label>
                <div className="form-field">
                  <span>Cadence state</span>
                  <strong>
                    {selected.nextActionCompletedAt
                      ? `Completed ${formatDate(selected.nextActionCompletedAt)}`
                      : selected.nextActionDueAt
                        ? `Open · due ${formatDate(selected.nextActionDueAt)}`
                        : "Set a due date"}
                  </strong>
                </div>
              </div>

              <div className="form-actions">
                <button
                  className="primary-action"
                  disabled={status === "saving"}
                  onClick={saveOpportunity}
                  type="button"
                >
                  {status === "saving" ? "Saving Opportunity" : "Save Opportunity"}
                </button>
                <button className="secondary-action" onClick={downloadFollowUpDraft} type="button">
                  Download Follow-Up Draft
                </button>
                <button
                  className="secondary-action"
                  disabled={!selected.nextAction || Boolean(selected.nextActionCompletedAt) || status === "completing"}
                  onClick={completeFollowUp}
                  type="button"
                >
                  {status === "completing" ? "Completing Follow-Up" : "Mark Follow-Up Complete"}
                </button>
              </div>

              <div className="sales-scope-grid">
                <article>
                  <span>Workflow targets</span>
                  <strong>{selected.payload.scope.workflowTargets.map(displayValue).join(", ")}</strong>
                </article>
                <article>
                  <span>Governance requirements</span>
                  <strong>{selected.payload.scope.governanceRequirements.map(displayValue).join(", ")}</strong>
                </article>
                <article>
                  <span>Governance workflow pack</span>
                  <strong>{selectedGovernancePack?.name ?? "Pack routing pending"}</strong>
                </article>
                <article>
                  <span>Pack routing reason</span>
                  <strong>{selectedGovernancePack?.reason ?? "Legacy opportunity requires repackaging through buyer intake."}</strong>
                </article>
                <article>
                  <span>Buyer goals</span>
                  <strong>{selected.payload.scope.pilotGoals}</strong>
                </article>
                <article>
                  <span>Native CRM export</span>
                  <strong>{selected.lastCrmExportAt ? `Last exported ${formatDate(selected.lastCrmExportAt)}` : "Ready"}</strong>
                </article>
                <article>
                  <span>Deal room packet</span>
                  <strong>
                    {selected.lastBuyerDealRoomPacketAt
                      ? `Last released ${formatDate(selected.lastBuyerDealRoomPacketAt)}`
                      : "Ready for audit"}
                  </strong>
                </article>
                <article>
                  <span>Buyer workspace</span>
                  <strong>
                    {selectedWorkspaceProvisioning
                      ? `${selectedWorkspaceProvisioning.workspaceSlug} · ${selectedWorkspaceProvisioning.provisioningStatus}`
                      : workspaceEligible
                        ? "Ready to provision"
                        : "Advance to Qualified first"}
                  </strong>
                </article>
                <article>
                  <span>Workspace packet</span>
                  <strong>
                    {selectedWorkspaceProvisioning?.lastPacketGeneratedAt
                      ? `Last released ${formatDate(selectedWorkspaceProvisioning.lastPacketGeneratedAt)}`
                      : selectedWorkspaceProvisioning
                        ? "Ready for audit"
                        : "Provision first"}
                  </strong>
                </article>
                <article>
                  <span>Buyer tenant lifecycle</span>
                  <strong>
                    {selectedBuyerTenantLifecycle
                      ? `${selectedBuyerTenantLifecycle.lifecycleStatus} · ${selectedBuyerTenantLifecycle.tenantMode}`
                      : tenantLifecycleEligible
                        ? "Ready to activate"
                        : "Provision workspace first"}
                  </strong>
                </article>
                <article>
                  <span>Access review due</span>
                  <strong>
                    {selectedBuyerTenantLifecycle
                      ? formatDate(selectedBuyerTenantLifecycle.accessReviewPolicy.nextReviewDueAt)
                      : "Lifecycle pending"}
                  </strong>
                </article>
                <article>
                  <span>Lifecycle packet</span>
                  <strong>
                    {selectedBuyerTenantLifecycle?.lastPacketGeneratedAt
                      ? `Last released ${formatDate(selectedBuyerTenantLifecycle.lastPacketGeneratedAt)}`
                      : selectedBuyerTenantLifecycle
                        ? "Ready for audit"
                        : "Activate first"}
                  </strong>
                </article>
                <article>
                  <span>Production readiness</span>
                  <strong>
                    {selectedProductionReadiness
                      ? displayValue(selectedProductionReadiness.readinessStatus)
                      : productionReadinessEligible
                        ? "Ready to prepare"
                        : "Lifecycle first"}
                  </strong>
                </article>
                <article>
                  <span>Transactional send</span>
                  <strong>
                    {selectedProductionReadiness
                      ? selectedProductionReadiness.transactionalDeliveryPolicy.directSendEnabled
                        ? "Enabled"
                        : "Disabled until approved"
                      : "Not prepared"}
                  </strong>
                </article>
                <article>
                  <span>Readiness packet</span>
                  <strong>
                    {selectedProductionReadiness?.lastPacketGeneratedAt
                      ? `Last released ${formatDate(selectedProductionReadiness.lastPacketGeneratedAt)}`
                      : selectedProductionReadiness
                        ? "Ready for audit"
                        : "Prepare first"}
                  </strong>
                </article>
                <article>
                  <span>Source attribution</span>
                  <strong>
                    {selectedAttribution
                      ? `${displayValue(selectedAttribution.sourceCategory)} via ${selectedAttribution.campaign.matchedChannel}`
                      : "Legacy opportunity"}
                  </strong>
                </article>
                <article>
                  <span>Target audience</span>
                  <strong>{selectedAttribution?.market.targetAudience ?? "To be confirmed"}</strong>
                </article>
                <article>
                  <span>Deployment profile</span>
                  <strong>{selectedAttribution?.deployment.profileName ?? "To be confirmed"}</strong>
                </article>
                <article>
                  <span>Follow-up SLA</span>
                  <strong>
                    {selectedAttribution
                      ? `${displayValue(selectedAttribution.cadence.priority)} - ${selectedAttribution.cadence.firstResponseSla}`
                      : "Set manually"}
                  </strong>
                </article>
              </div>

              {selectedAttribution ? (
                <div className="section-band split-band">
                  <div>
                    <p className="eyebrow">Attribution intelligence</p>
                    <h3>{selectedAttribution.market.revenueStream}</h3>
                    <p className="section-copy">{selectedAttribution.cadence.nextActionTemplate}</p>
                  </div>
                  <div className="layer-list">
                    {selectedAttribution.sourceSignals.map((signal, index) => (
                      <div className="layer-row" key={`${signal.sourceName}-${signal.category}`}>
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        <strong>{signal.sourceName}: {signal.scrimedApplication}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="sales-activation-grid">
                <section>
                  <p className="eyebrow">Authenticated buyer demo execution</p>
                  <h3>Run the no-PHI buyer demo path from one protected checklist.</h3>
                  <p className="section-copy">
                    This path sequences the existing audited packets, protected buyer room, and paid
                    implementation gates. The operator brief is a runbook only; audited packet routes remain the
                    source of truth.
                  </p>
                  <div className="layer-list">
                    <div className="layer-row">
                      <span>01</span>
                      <strong>Path score: {buyerDemoWeightedScore}% · {buyerDemoCompletedSteps}/{buyerDemoSteps.length} complete</strong>
                    </div>
                    <div className="layer-row">
                      <span>02</span>
                      <strong>Next action: {buyerDemoNextStep ? `${buyerDemoNextStep.label} (${displayValue(buyerDemoNextStep.status)})` : "Review opportunity"}</strong>
                    </div>
                    <div className="layer-row">
                      <span>03</span>
                      <strong>Workspace: {buyerDemoWorkspaceSlug} · {buyerDemoWorkspaceMode}</strong>
                    </div>
                    <div className="layer-row">
                      <span>04</span>
                      <strong>Boundary: synthetic, business-contact, and workflow-scope metadata only</strong>
                    </div>
                    <div className="layer-row">
                      <span>05</span>
                      <strong>
                        Persisted sessions: {selectedBuyerDemoSessions.length} ·{" "}
                        {latestBuyerDemoSession
                          ? `Latest ${formatDate(latestBuyerDemoSession.createdAt)}`
                          : "Record after the buyer demo"}
                      </strong>
                    </div>
                  </div>
                  <div className="layer-list">
                    {buyerDemoSteps.map((step, index) => (
                      <div className="layer-row" key={`${step.label}-${step.status}`}>
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        <strong>
                          {step.label}: {displayValue(step.status)} · {step.evidence}
                        </strong>
                      </div>
                    ))}
                  </div>
                  <div className="form-grid">
                    <label className="form-field form-field-wide">
                      <span>Operator notes</span>
                      <textarea
                        maxLength={3000}
                        onChange={(event) => setDemoOperatorNotes(event.target.value)}
                        placeholder="No PHI. Capture buyer objections, value signals, approved workarounds, and demo outcome."
                        value={demoOperatorNotes}
                      />
                      <small>
                        No PHI, patient identifiers, live clinical records, payer member data, diagnosis details, or
                        source contract excerpts.
                      </small>
                    </label>
                    <label className="form-field">
                      <span>Buyer questions</span>
                      <textarea
                        maxLength={1200}
                        onChange={(event) => setDemoBuyerQuestions(event.target.value)}
                        placeholder="One no-PHI question per line."
                        value={demoBuyerQuestions}
                      />
                    </label>
                    <label className="form-field">
                      <span>Next actions</span>
                      <textarea
                        maxLength={1200}
                        onChange={(event) => setDemoNextActions(event.target.value)}
                        placeholder="One action per line."
                        value={demoNextActions}
                      />
                    </label>
                  </div>
                  <div className="layer-list">
                    {selectedBuyerDemoSessions.length > 0 ? (
                      selectedBuyerDemoSessions.slice(0, 3).map((demoSession, index) => (
                        <div className="layer-row" key={demoSession.id}>
                          <span>{String(index + 1).padStart(2, "0")}</span>
                          <strong>
                            {displayValue(demoSession.demoStatus)} · {demoSession.readinessScore}% path ·{" "}
                            {demoSession.selectedPacketRoutes.length} packet routes ·{" "}
                            {demoSession.lastPacketGeneratedAt
                              ? `Packet ${formatDate(demoSession.lastPacketGeneratedAt)}`
                              : "Packet ready"}
                          </strong>
                        </div>
                      ))
                    ) : (
                      <div className="layer-row">
                        <span>01</span>
                        <strong>No persisted buyer demo sessions recorded for this opportunity yet.</strong>
                      </div>
                    )}
                  </div>
                  {latestBuyerDemoQaRun ? (
                    <div className="layer-list">
                      <div className="layer-row">
                        <span>QA</span>
                        <strong>
                          Harness passed {formatDate(latestBuyerDemoQaRun.executedAt)} · session{" "}
                          {latestBuyerDemoQaRun.createdSessionId.slice(0, 8)} · packet audit{" "}
                          {latestBuyerDemoQaRun.packetAuditEventId?.slice(0, 8) ?? "committed"}
                        </strong>
                      </div>
                    </div>
                  ) : null}
                  <div className="form-actions">
                    <button
                      className="primary-action"
                      disabled={status === "recording-demo-session" || status === "running-demo-session-qa"}
                      onClick={recordBuyerDemoSession}
                      type="button"
                    >
                      {status === "recording-demo-session" ? "Recording Session" : "Record Demo Session"}
                    </button>
                    <button
                      className="secondary-action"
                      disabled={status === "running-demo-session-qa"}
                      onClick={runBuyerDemoSessionQa}
                      type="button"
                    >
                      {status === "running-demo-session-qa" ? "Running QA Harness" : "Run QA Harness"}
                    </button>
                    <button className="primary-action" onClick={downloadBuyerDemoExecutionBrief} type="button">
                      Download Demo Brief
                    </button>
                    <button
                      className="secondary-action"
                      disabled={!latestBuyerDemoSession}
                      onClick={() =>
                        latestBuyerDemoSession
                          ? downloadBuyerDemoSessionPacket(latestBuyerDemoSession.id)
                          : undefined
                      }
                      type="button"
                    >
                      Download Latest Session Packet
                    </button>
                    <Link className="secondary-action" href="/product">
                      View Product Console
                    </Link>
                    <Link className="secondary-action" href="/pilot-deal-room">
                      Open Deal Room
                    </Link>
                    <Link
                      className="secondary-action"
                      href={`/pilot-workspace/access?workspace=${encodeURIComponent(
                        buyerDemoWorkspaceSlug
                      )}&opportunity=${encodeURIComponent(selected.intakeId)}`}
                    >
                      Open Buyer Room
                    </Link>
                  </div>
                </section>

                <section>
                  <p className="eyebrow">Commercial artifacts</p>
                  <h3>Move the opportunity without a paid CRM dependency.</h3>
                  <div className="form-actions">
                    <button className="secondary-action" onClick={downloadProposal} type="button">
                      Download Audited Proposal
                    </button>
                    <button className="secondary-action" onClick={downloadDealRoomPacket} type="button">
                      Download Deal Room Packet
                    </button>
                    <button className="secondary-action" onClick={downloadCrmExport} type="button">
                      Download CRM Import
                    </button>
                    <button className="secondary-action" onClick={downloadAttributionAnalyticsPacket} type="button">
                      Download Attribution Packet
                    </button>
                    {crmWebhookConfigured ? (
                      <button
                        className="secondary-action"
                        disabled={status === "syncing"}
                        onClick={syncCrm}
                        type="button"
                      >
                        {status === "syncing" ? "Syncing CRM" : "Sync CRM Webhook"}
                      </button>
                    ) : null}
                  </div>
                </section>

                <section>
                  <p className="eyebrow">Protected buyer workspace</p>
                  <h3>Provision the buyer-specific room before deeper diligence.</h3>
                  <p className="section-copy">
                    {selectedWorkspaceProvisioning
                      ? `Workspace ${selectedWorkspaceProvisioning.workspaceSlug} is linked to this opportunity with manual invitation policy and retention controls.`
                      : workspaceEligible
                        ? "This opportunity is qualified for a protected synthetic workspace with manual onboarding policy."
                        : "Move the pipeline stage to Qualified or later before provisioning a buyer-specific workspace."}
                  </p>
                  <div className="form-actions">
                    <button
                      className="primary-action"
                      disabled={
                        status === "provisioning" ||
                        Boolean(selectedWorkspaceProvisioning) ||
                        !workspaceEligible
                      }
                      onClick={provisionWorkspace}
                      type="button"
                    >
                      {status === "provisioning" ? "Provisioning Workspace" : "Provision Buyer Workspace"}
                    </button>
                    <button
                      className="secondary-action"
                      disabled={!selectedWorkspaceProvisioning}
                      onClick={downloadWorkspaceProvisioningPacket}
                      type="button"
                    >
                      Download Workspace Packet
                    </button>
                    {selectedWorkspaceProvisioning ? (
                      <Link
                        className="secondary-action"
                        href={`/pilot-workspace/access?workspace=${encodeURIComponent(
                          selectedWorkspaceProvisioning.workspaceSlug
                        )}&opportunity=${encodeURIComponent(selected.intakeId)}`}
                      >
                        Open Buyer Room
                      </Link>
                    ) : null}
                  </div>
                </section>

                <section>
                  <p className="eyebrow">Tenant-per-buyer lifecycle</p>
                  <h3>Control SSO, invitations, reviews, and archive gates before paid expansion.</h3>
                  <p className="section-copy">
                    {selectedBuyerTenantLifecycle
                      ? `Lifecycle controls are active for ${selectedBuyerTenantLifecycle.workspaceSlug}; next access review is due ${formatDate(selectedBuyerTenantLifecycle.accessReviewPolicy.nextReviewDueAt)}.`
                      : tenantLifecycleEligible
                        ? "Activate a buyer lifecycle plan after workspace provisioning to package SSO policy, manual delivery, access review cadence, and retention controls."
                        : "Provision a buyer-specific workspace before activating tenant lifecycle controls."}
                  </p>
                  {selectedBuyerTenantLifecycle ? (
                    <div className="layer-list">
                      <div className="layer-row">
                        <span>01</span>
                        <strong>SSO domains: {selectedBuyerTenantLifecycle.ssoPolicy.allowedDomains.join(", ")}</strong>
                      </div>
                      <div className="layer-row">
                        <span>02</span>
                        <strong>Invitation delivery: {selectedBuyerTenantLifecycle.invitationDeliveryPolicy.mode}</strong>
                      </div>
                      <div className="layer-row">
                        <span>03</span>
                        <strong>Archive eligible: {formatDate(selectedBuyerTenantLifecycle.retentionArchivePolicy.archiveEligibleAt)}</strong>
                      </div>
                    </div>
                  ) : null}
                  <div className="form-actions">
                    <button
                      className="primary-action"
                      disabled={
                        status === "activating-lifecycle" ||
                        Boolean(selectedBuyerTenantLifecycle) ||
                        !tenantLifecycleEligible
                      }
                      onClick={activateBuyerTenantLifecycle}
                      type="button"
                    >
                      {status === "activating-lifecycle"
                        ? "Activating Lifecycle"
                        : "Activate Tenant Lifecycle"}
                    </button>
                    <button
                      className="secondary-action"
                      disabled={!selectedBuyerTenantLifecycle}
                      onClick={downloadBuyerTenantLifecyclePacket}
                      type="button"
                    >
                      Download Lifecycle Packet
                    </button>
                  </div>
                </section>

                <section>
                  <p className="eyebrow">Production SSO and invitation readiness</p>
                  <h3>Prepare domain, origin, messaging, delivery, review, and archive controls.</h3>
                  <p className="section-copy">
                    {selectedProductionReadiness
                      ? `Readiness controls are prepared for ${selectedProductionReadiness.workspaceSlug}; automated invitation send remains ${
                          selectedProductionReadiness.transactionalDeliveryPolicy.directSendEnabled
                            ? "enabled"
                            : "disabled"
                        } until explicit provider, legal, security, and tenant-admin approval.`
                      : productionReadinessEligible
                        ? "Prepare the production-readiness packet after lifecycle activation to package buyer-domain verification, redirect origins, approved invitation copy, delivery guardrails, access-review attestation, and archive execution."
                        : "Activate the buyer tenant lifecycle before preparing production SSO and invitation readiness."}
                  </p>
                  {selectedProductionReadiness ? (
                    <div className="layer-list">
                      <div className="layer-row">
                        <span>01</span>
                        <strong>
                          Domain verification: {selectedProductionReadiness.domainVerificationPolicy.status}
                        </strong>
                      </div>
                      <div className="layer-row">
                        <span>02</span>
                        <strong>
                          Redirect origins: {selectedProductionReadiness.ssoRedirectPolicy.allowedRedirectOrigins.join(", ")}
                        </strong>
                      </div>
                      <div className="layer-row">
                        <span>03</span>
                        <strong>
                          Template approval: {selectedProductionReadiness.invitationTemplatePolicy.status}
                        </strong>
                      </div>
                      <div className="layer-row">
                        <span>04</span>
                        <strong>
                          Access attestation due: {formatDate(selectedProductionReadiness.accessReviewAutomation.nextAttestationDueAt)}
                        </strong>
                      </div>
                    </div>
                  ) : null}
                  <div className="form-actions">
                    <button
                      className="primary-action"
                      disabled={
                        status === "preparing-production-readiness" ||
                        Boolean(selectedProductionReadiness) ||
                        !productionReadinessEligible
                      }
                      onClick={prepareProductionActivationReadiness}
                      type="button"
                    >
                      {status === "preparing-production-readiness"
                        ? "Preparing Readiness"
                        : "Prepare Production Readiness"}
                    </button>
                    <button
                      className="secondary-action"
                      disabled={!selectedProductionReadiness}
                      onClick={downloadProductionReadinessPacket}
                      type="button"
                    >
                      Download Readiness Packet
                    </button>
                  </div>
                </section>

                <section>
                  <p className="eyebrow">Customer activation approvals</p>
                  <h3>Record paid-pilot setup approval while retaining clinical and privacy hard gates.</h3>
                  <p className="section-copy">
                    {selectedCustomerActivationApprovals
                      ? `Approval is recorded for ${selectedCustomerActivationApprovals.workspaceSlug} with scope ${selectedCustomerActivationApprovals.approvalScope}; live clinical, PHI, payer, patient-facing, customer SSO cutover, and autonomous care actions remain blocked.`
                      : activationApprovalEligible
                        ? "Record the written SCRIMED approval that unblocks paid pilot setup after production readiness, while preserving live clinical, PHI, payer, patient-facing, and autonomous-care hard gates."
                        : "Prepare production readiness before recording paid-pilot setup approval."}
                  </p>
                  {selectedCustomerActivationApprovals ? (
                    <div className="layer-list">
                      <div className="layer-row">
                        <span>01</span>
                        <strong>
                          Final gate: {selectedCustomerActivationApprovals.finalSetupGate.status}
                        </strong>
                      </div>
                      <div className="layer-row">
                        <span>02</span>
                        <strong>
                          Domain evidence: {selectedCustomerActivationApprovals.domainEvidenceApproval.status}
                        </strong>
                      </div>
                      <div className="layer-row">
                        <span>03</span>
                        <strong>
                          Legal, privacy, security:{" "}
                          {selectedCustomerActivationApprovals.legalPrivacySecurityApproval.status}
                        </strong>
                      </div>
                      <div className="layer-row">
                        <span>04</span>
                        <strong>
                          Retained blockers: {selectedCustomerActivationApprovals.retainedBlockers.length}
                        </strong>
                      </div>
                    </div>
                  ) : null}
                  <div className="form-actions">
                    <button
                      className="primary-action"
                      disabled={
                        status === "recording-activation-approvals" ||
                        Boolean(selectedCustomerActivationApprovals) ||
                        !activationApprovalEligible
                      }
                      onClick={recordCustomerActivationApprovals}
                      type="button"
                    >
                      {status === "recording-activation-approvals"
                        ? "Recording Approvals"
                        : "Record Setup Approval"}
                    </button>
                    <button
                      className="secondary-action"
                      disabled={!selectedCustomerActivationApprovals}
                      onClick={downloadCustomerActivationApprovalsPacket}
                      type="button"
                    >
                      Download Approval Packet
                    </button>
                  </div>
                </section>

                <section>
                  <p className="eyebrow">Buyer evidence and signed controls diligence</p>
                  <h3>Prepare metadata-only diligence before SSO, documents, or live-data decisions.</h3>
                  <p className="section-copy">
                    {selectedBuyerDiligenceRoom
                      ? `Diligence room is prepared for ${selectedBuyerDiligenceRoom.workspaceSlug} with ${selectedBuyerDiligenceRoom.evidenceScope} evidence scope; sensitive files, PHI, IdP certificates, private keys, and production credentials remain outside SCRIMED until storage and legal controls are approved.`
                      : buyerDiligenceEligible
                        ? "Prepare the buyer diligence room to track domain proof, IdP metadata status, signed controls, BAA/DPA posture, transactional provider decisions, and production connector readiness without collecting sensitive documents."
                        : "Record customer activation approvals before preparing the buyer evidence diligence room."}
                  </p>
                  {selectedBuyerDiligenceRoom ? (
                    <div className="layer-list">
                      <div className="layer-row">
                        <span>01</span>
                        <strong>Diligence status: {selectedBuyerDiligenceRoom.diligenceStatus}</strong>
                      </div>
                      <div className="layer-row">
                        <span>02</span>
                        <strong>BAA/DPA: {selectedBuyerDiligenceRoom.baaDpaStatus.status}</strong>
                      </div>
                      <div className="layer-row">
                        <span>03</span>
                        <strong>
                          Connector readiness: {selectedBuyerDiligenceRoom.productionConnectorReadiness.status}
                        </strong>
                      </div>
                      <div className="layer-row">
                        <span>04</span>
                        <strong>Next approvals: {selectedBuyerDiligenceRoom.nextRequiredApprovals.length}</strong>
                      </div>
                    </div>
                  ) : null}
                  <div className="form-actions">
                    <button
                      className="primary-action"
                      disabled={
                        status === "preparing-buyer-diligence" ||
                        Boolean(selectedBuyerDiligenceRoom) ||
                        !buyerDiligenceEligible
                      }
                      onClick={prepareBuyerDiligenceRoom}
                      type="button"
                    >
                      {status === "preparing-buyer-diligence"
                        ? "Preparing Diligence"
                        : "Prepare Diligence Room"}
                    </button>
                    <button
                      className="secondary-action"
                      disabled={!selectedBuyerDiligenceRoom}
                      onClick={downloadBuyerDiligencePacket}
                      type="button"
                    >
                      Download Diligence Packet
                    </button>
                  </div>
                </section>

                <section>
                  <p className="eyebrow">Secure evidence vault readiness</p>
                  <h3>Prepare storage controls before sensitive evidence is accepted.</h3>
                  <p className="section-copy">
                    {selectedSecureEvidenceVaultReadiness
                      ? `Vault readiness is prepared for ${selectedSecureEvidenceVaultReadiness.workspaceSlug} in ${selectedSecureEvidenceVaultReadiness.vaultMode} mode; storage remains disabled until DLP, malware scanning, retention, legal hold, access review, regional residency, and legal/privacy/security controls are approved.`
                      : secureEvidenceVaultEligible
                        ? "Prepare the disabled-by-default evidence vault plan to align CIO, CISO, privacy, legal, compliance, procurement, clinical operations, payer, government, and investor diligence without storing sensitive files."
                        : "Prepare the buyer evidence diligence room before preparing secure evidence vault readiness."}
                  </p>
                  {selectedSecureEvidenceVaultReadiness ? (
                    <div className="layer-list">
                      <div className="layer-row">
                        <span>01</span>
                        <strong>
                          Readiness status: {selectedSecureEvidenceVaultReadiness.readinessStatus}
                        </strong>
                      </div>
                      <div className="layer-row">
                        <span>02</span>
                        <strong>
                          Storage provider:{" "}
                          {selectedSecureEvidenceVaultReadiness.storageProviderDecision.status}
                        </strong>
                      </div>
                      <div className="layer-row">
                        <span>03</span>
                        <strong>
                          DLP and malware: {selectedSecureEvidenceVaultReadiness.dlpMalwareScanning.status}
                        </strong>
                      </div>
                      <div className="layer-row">
                        <span>04</span>
                        <strong>
                          Target audiences:{" "}
                          {selectedSecureEvidenceVaultReadiness.targetAudienceSignals.length}
                        </strong>
                      </div>
                    </div>
                  ) : null}
                  <div className="form-actions">
                    <button
                      className="primary-action"
                      disabled={
                        status === "preparing-evidence-vault-readiness" ||
                        Boolean(selectedSecureEvidenceVaultReadiness) ||
                        !secureEvidenceVaultEligible
                      }
                      onClick={prepareSecureEvidenceVaultReadiness}
                      type="button"
                    >
                      {status === "preparing-evidence-vault-readiness"
                        ? "Preparing Vault"
                        : "Prepare Vault Readiness"}
                    </button>
                    <button
                      className="secondary-action"
                      disabled={!selectedSecureEvidenceVaultReadiness}
                      onClick={downloadSecureEvidenceVaultReadinessPacket}
                      type="button"
                    >
                      Download Vault Packet
                    </button>
                  </div>
                </section>

                <section>
                  <p className="eyebrow">Enterprise assessment</p>
                  <h3>Prepare an audited calendar invitation.</h3>
                  <div className="form-grid">
                    <label className="form-field">
                      <span>Start time</span>
                      <input
                        onChange={(event) => setAssessmentStart(event.target.value)}
                        type="datetime-local"
                        value={assessmentStart}
                      />
                    </label>
                    <label className="form-field">
                      <span>Duration</span>
                      <select
                        onChange={(event) => setAssessmentDuration(Number(event.target.value))}
                        value={assessmentDuration}
                      >
                        <option value={30}>30 minutes</option>
                        <option value={45}>45 minutes</option>
                        <option value={60}>60 minutes</option>
                        <option value={90}>90 minutes</option>
                      </select>
                    </label>
                    <label className="form-field form-field-wide">
                      <span>HTTPS meeting link</span>
                      <input
                        onChange={(event) => setAssessmentMeetingUrl(event.target.value)}
                        placeholder="https://meet.google.com/..."
                        type="url"
                        value={assessmentMeetingUrl}
                      />
                    </label>
                  </div>
                  <div className="form-actions">
                    <button
                      className="primary-action"
                      disabled={status === "scheduling" || !assessmentStart}
                      onClick={downloadAssessmentInvitation}
                      type="button"
                    >
                      {status === "scheduling" ? "Preparing Invitation" : "Download Calendar Invitation"}
                    </button>
                  </div>
                </section>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="table-section" aria-label="Sales operations audit events">
        <div className="section-heading">
          <p className="eyebrow">Append-only sales audit</p>
          <h2>Opportunity changes, commercial artifacts, cadence, scheduling, and CRM outcomes remain inspectable.</h2>
        </div>
        {dashboard?.auditEvents.length ? (
          dashboard.auditEvents.map((event) => (
            <article className="module-row" key={event.id}>
              <div>
                <span>{displayValue(event.eventType)}</span>
                <h2>{event.intakeId}</h2>
              </div>
              <p>{formatDate(event.createdAt)}</p>
              <strong title={event.actorUserId}>Actor: {formatActorId(event.actorUserId)}</strong>
            </article>
          ))
        ) : (
          <article className="module-row">
            <div>
              <span>no events</span>
              <h2>Sales audit trail is ready.</h2>
            </div>
            <p>Audited activity appears after an opportunity is changed or an artifact is released.</p>
            <strong>Direct table mutation remains denied.</strong>
          </article>
        )}
      </section>
    </>
  );
}
