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
  const workspaceEligible = selected ? isProvisioningEligible(selected) : false;
  const tenantLifecycleEligible = selected ? isTenantLifecycleEligible(selected) : false;

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
