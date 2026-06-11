"use client";

import { createClient, type Session, type User } from "@supabase/supabase-js";
import Link from "next/link";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
  salesOperationsBoundary,
  salesPipelineStages,
  type SalesOperationsDashboard,
  type SalesOpportunity,
  type SalesOpportunityUpdate
} from "../lib/salesOperations";

type ConsoleStatus =
  | "infrastructure-required"
  | "signed-out"
  | "sending-link"
  | "loading"
  | "ready"
  | "saving"
  | "syncing"
  | "error";

type DashboardResponse = {
  crmConfigured?: boolean;
  dashboard?: SalesOperationsDashboard;
  error?: { message?: string };
};

type OpportunityResponse = {
  opportunity?: SalesOpportunity;
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

function draftFor(opportunity: SalesOpportunity): SalesOpportunityUpdate {
  return {
    pipelineStage: opportunity.pipelineStage,
    assignedOwner: opportunity.assignedOwner,
    nextAction: opportunity.nextAction
  };
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
              persistSession: true
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
  const [dashboard, setDashboard] = useState<SalesOperationsDashboard | null>(null);
  const [crmConfigured, setCrmConfigured] = useState(false);
  const [selected, setSelected] = useState<SalesOpportunity | null>(null);
  const [draft, setDraft] = useState<SalesOpportunityUpdate | null>(null);

  useEffect(() => {
    const client = supabase;

    if (!client) {
      return;
    }

    const activeClient = client;
    let active = true;

    async function applySession(nextSession: Session | null) {
      if (!active) {
        return;
      }

      setSession(nextSession);

      if (!nextSession) {
        setUser(null);
        setDashboard(null);
        setSelected(null);
        setDraft(null);
        setStatus("signed-out");
        return;
      }

      const { data, error } = await activeClient.auth.getUser(nextSession.access_token);

      if (!active) {
        return;
      }

      if (error || !data.user) {
        setUser(null);
        setStatus("error");
        setMessage("The identity provider could not verify this tenant-admin session.");
        return;
      }

      setUser(data.user);
      await loadDashboard(nextSession);
    }

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
        setStatus("error");
        setMessage(body.error?.message ?? "The tenant-admin sales operations console could not be loaded.");
        return;
      }

      setDashboard(body.dashboard);
      setCrmConfigured(Boolean(body.crmConfigured));
      const nextSelected = body.dashboard.opportunities[0] ?? null;
      setSelected(nextSelected);
      setDraft(nextSelected ? draftFor(nextSelected) : null);
      setStatus("ready");
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

  async function signOut() {
    if (supabase) {
      await supabase.auth.signOut();
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
      setStatus("error");
      setMessage(body.error?.message ?? "Sales operations could not be refreshed.");
      return;
    }

    setDashboard(body.dashboard);
    setCrmConfigured(Boolean(body.crmConfigured));
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

    await refreshDashboard("Opportunity owner, stage, next action, and append-only audit event committed.");
  }

  async function downloadProposal() {
    if (!session || !selected) {
      return;
    }

    setMessage("");
    const response = await fetch(
      `/api/sales-operations/opportunities/${selected.intakeId}/proposal`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      }
    );

    if (!response.ok) {
      const body = (await response.json()) as OpportunityResponse;
      setMessage(body.error?.message ?? "The audited opportunity proposal could not be downloaded.");
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `scrimed-${selected.intakeId}-opportunity-proposal.md`;
    link.click();
    URL.revokeObjectURL(url);
    await refreshDashboard("Buyer proposal downloaded and its append-only audit event committed.");
  }

  async function syncCrm() {
    if (!session || !selected) {
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
            <p className="eyebrow">Tenant-admin authentication</p>
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
              <small>Approved tenant-admin membership is required. Buyer business-contact and workflow-scope data only.</small>
            </label>
          </div>
          {message ? <div className="intake-alert">{message}</div> : null}
          <div className="form-actions">
            <button className="primary-action" disabled={status === "sending-link"} type="submit">
              {status === "sending-link" ? "Sending Secure Link" : "Send Secure Access Link"}
            </button>
            <Link className="secondary-action" href="/pilot">
              Open Buyer Intake
            </Link>
          </div>
        </form>
      </section>
    );
  }

  return (
    <>
      <section className="section-band hub-summary" aria-label="Sales operations summary">
        <article>
          <span>Identity</span>
          <strong>{user.email ?? user.id}</strong>
        </article>
        <article>
          <span>Open opportunities</span>
          <strong>{dashboard?.summary.openCount ?? 0}</strong>
        </article>
        <article>
          <span>Proposal stage</span>
          <strong>{dashboard?.summary.proposalCount ?? 0}</strong>
        </article>
        <article>
          <span>Pilot planning</span>
          <strong>{dashboard?.summary.pilotPlanningCount ?? 0}</strong>
        </article>
        <article>
          <span>Won</span>
          <strong>{dashboard?.summary.wonCount ?? 0}</strong>
        </article>
        <article>
          <span>CRM handoff</span>
          <strong>{crmConfigured ? "configured" : "activation required"}</strong>
        </article>
      </section>

      <section className="section-band sales-workspace" aria-label="Tenant-admin sales opportunity workspace">
        <div className="sales-toolbar">
          <div>
            <p className="eyebrow">Opportunity work queue</p>
            <h2>Assign ownership, advance the buyer decision, and retain proof.</h2>
            <p className="section-copy">{dashboard?.boundary ?? salesOperationsBoundary}</p>
          </div>
          <div className="form-actions">
            <Link className="secondary-action" href="/pilot">Create Buyer Intake</Link>
            <button className="secondary-action" onClick={() => refreshDashboard()} type="button">
              Refresh
            </button>
            <button className="secondary-action" onClick={signOut} type="button">
              Sign Out
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
                  <small>{opportunity.payload.contact.fullName} · {opportunity.payload.scope.timeline}</small>
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
                <strong>{displayValue(selected.payload.scope.offerInterest)}</strong>
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
                <button className="secondary-action" onClick={downloadProposal} type="button">
                  Download Audited Proposal
                </button>
                <button
                  className="secondary-action"
                  disabled={status === "syncing"}
                  onClick={syncCrm}
                  type="button"
                >
                  {status === "syncing" ? "Syncing CRM" : "Sync CRM"}
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
                  <span>Buyer goals</span>
                  <strong>{selected.payload.scope.pilotGoals}</strong>
                </article>
                <article>
                  <span>CRM state</span>
                  <strong>{displayValue(selected.lastCrmSyncStatus)} · {formatDate(selected.lastCrmSyncAt)}</strong>
                </article>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="table-section" aria-label="Sales operations audit events">
        <div className="section-heading">
          <p className="eyebrow">Append-only sales audit</p>
          <h2>Opportunity changes, proposal releases, and CRM outcomes remain inspectable.</h2>
        </div>
        {dashboard?.auditEvents.length ? (
          dashboard.auditEvents.map((event) => (
            <article className="module-row" key={event.id}>
              <div>
                <span>{displayValue(event.eventType)}</span>
                <h2>{event.intakeId}</h2>
              </div>
              <p>{formatDate(event.createdAt)}</p>
              <strong>Actor: {event.actorUserId}</strong>
            </article>
          ))
        ) : (
          <article className="module-row">
            <div>
              <span>no events</span>
              <h2>Sales audit trail is ready.</h2>
            </div>
            <p>Audited activity appears after an opportunity is changed, proposed, or synchronized.</p>
            <strong>Direct table mutation remains denied.</strong>
          </article>
        )}
      </section>
    </>
  );
}
