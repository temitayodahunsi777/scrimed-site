"use client";

import { createClient, type Session, type User } from "@supabase/supabase-js";
import Link from "next/link";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import type {
  PilotAuditEventRecord,
  PilotSessionRecord,
  PilotWorkspaceRecord
} from "../lib/protectedPilotWorkspace";
import TrustOSDecisionLedgerPanel from "./TrustOSDecisionLedgerPanel";

type AccessStatus =
  | "infrastructure-required"
  | "signed-out"
  | "sending-link"
  | "loading"
  | "ready"
  | "creating-session"
  | "error";

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
              persistSession: true
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
  const [workspaces, setWorkspaces] = useState<PilotWorkspaceRecord[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<PilotWorkspaceRecord | null>(null);
  const [sessions, setSessions] = useState<PilotSessionRecord[]>([]);
  const [auditEvents, setAuditEvents] = useState<PilotAuditEventRecord[]>([]);

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
        setWorkspaces([]);
        setSelectedWorkspace(null);
        setSessions([]);
        setAuditEvents([]);
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
        setMessage("The identity provider could not verify this session.");
        return;
      }

      setUser(data.user);
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
      setStatus("ready");

      if (nextWorkspaces[0]) {
        await Promise.all([
          loadSessions(activeSession, nextWorkspaces[0]),
          loadAuditEvents(activeSession, nextWorkspaces[0])
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

  async function signOut() {
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
  }

  async function selectWorkspace(workspace: PilotWorkspaceRecord) {
    if (!session) {
      return;
    }

    setSelectedWorkspace(workspace);
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
    await refreshAuditEvents(session, workspace);
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
              <small>Access requires an approved tenant membership. Synthetic pilot evidence only.</small>
            </label>
          </div>
          {message ? <div className="intake-alert">{message}</div> : null}
          <div className="form-actions">
            <button className="primary-action" disabled={status === "sending-link"} type="submit">
              {status === "sending-link" ? "Sending Secure Link" : "Send Secure Access Link"}
            </button>
            <Link className="secondary-action" href="/pilot-workspace">
              Review Workspace Controls
            </Link>
          </div>
        </form>
      </section>
    );
  }

  return (
    <>
      <section className="section-band hub-summary" aria-label="Authenticated pilot workspace access">
        <article>
          <span>Identity</span>
          <strong>{user.email ?? user.id}</strong>
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
            Workspace visibility is constrained by authenticated membership and PostgreSQL row-level security.
          </p>
          <div className="form-actions">
            <button className="secondary-action" onClick={signOut} type="button">
              Sign Out
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

      {selectedWorkspace ? (
        <>
          <TrustOSDecisionLedgerPanel
            onAuditChanged={() => refreshAuditEvents(session, selectedWorkspace)}
            session={session}
            workspace={selectedWorkspace}
          />

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
