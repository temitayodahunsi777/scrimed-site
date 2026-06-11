"use client";

import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import type {
  PilotWorkspaceRecord,
  PilotWorkspaceRole,
  TenantAccessDashboard
} from "../lib/protectedPilotWorkspace";

type TenantAccessResponse = {
  dashboard?: TenantAccessDashboard;
  error?: { code?: string; message?: string };
};

type PanelStatus = "loading" | "ready" | "saving" | "unavailable" | "error";

const roles: PilotWorkspaceRole[] = ["tenant-admin", "pilot-lead", "reviewer", "observer"];

function displayRole(role: PilotWorkspaceRole) {
  return role
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export default function TenantAccessAdministrationPanel({
  session,
  workspace
}: {
  session: Session;
  workspace: PilotWorkspaceRecord;
}) {
  const [dashboard, setDashboard] = useState<TenantAccessDashboard | null>(null);
  const [status, setStatus] = useState<PanelStatus>("loading");
  const [message, setMessage] = useState("");
  const [draftRoles, setDraftRoles] = useState<Record<string, PilotWorkspaceRole>>({});

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      setStatus("loading");
      setMessage("");
      const response = await fetch(`/api/pilot-workspaces/${workspace.slug}/tenant-access`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      const body = (await response.json()) as TenantAccessResponse;

      if (!active) {
        return;
      }

      if (!response.ok || !body.dashboard) {
        if (response.status === 403 || response.status === 404) {
          setStatus("unavailable");
          return;
        }

        setStatus("error");
        setMessage(body.error?.message ?? "Tenant access administration could not be loaded.");
        return;
      }

      setDashboard(body.dashboard);
      setDraftRoles(
        Object.fromEntries(body.dashboard.memberships.map((membership) => [membership.userId, membership.role]))
      );
      setStatus("ready");
    }

    void loadDashboard();

    return () => {
      active = false;
    };
  }, [session.access_token, workspace.slug]);

  async function updateRole(userId: string) {
    const role = draftRoles[userId];

    if (!role) {
      return;
    }

    setStatus("saving");
    setMessage("");
    const response = await fetch(`/api/pilot-workspaces/${workspace.slug}/tenant-access`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ userId, role })
    });
    const body = (await response.json()) as TenantAccessResponse;

    if (!response.ok) {
      setStatus("error");
      setMessage(body.error?.message ?? "The governed membership role change could not be committed.");
      return;
    }

    if (!body.dashboard) {
      setDashboard(null);
      setStatus("unavailable");
      return;
    }

    setDashboard(body.dashboard);
    setDraftRoles(
      Object.fromEntries(body.dashboard.memberships.map((membership) => [membership.userId, membership.role]))
    );
    setStatus("ready");
    setMessage("Membership role change committed with an append-only access audit event.");
  }

  if (status === "unavailable") {
    return null;
  }

  return (
    <section className="table-section tenant-access-panel" aria-label="Tenant access administration">
      <div className="section-heading">
        <p className="eyebrow">Tenant access administration</p>
        <h2>Govern existing protected-pilot memberships.</h2>
        <p className="section-copy">
          Tenant-admin actions require fresh AAL2 assurance and create append-only access evidence. This surface
          changes roles for existing approved identities only; it does not create users, send invitations, or
          enable live clinical execution.
        </p>
      </div>

      {message ? <div className="intake-alert">{message}</div> : null}

      {status === "loading" && !dashboard ? (
        <article className="module-row">
          <div>
            <span>loading</span>
            <h2>Verifying tenant-admin authorization.</h2>
          </div>
          <p>Checking fresh-session assurance and tenant scope.</p>
          <strong>Fail-closed access</strong>
        </article>
      ) : null}

      {status === "error" && !dashboard ? (
        <article className="module-row">
          <div>
            <span>access control unavailable</span>
            <h2>Tenant administration remains fail-closed.</h2>
          </div>
          <p>{message}</p>
          <strong>No membership changes were released.</strong>
        </article>
      ) : null}

      {dashboard ? (
        <>
          <div className="tenant-access-list">
            {dashboard.memberships.map((membership) => {
              const draftRole = draftRoles[membership.userId] ?? membership.role;
              const unchanged = draftRole === membership.role;

              return (
                <article key={membership.userId}>
                  <div>
                    <span>{membership.role}</span>
                    <h3>{membership.email}</h3>
                    <p>Approved {formatDate(membership.createdAt)}</p>
                  </div>
                  <label className="form-field">
                    <span>Governed role</span>
                    <select
                      disabled={status === "saving"}
                      onChange={(event) =>
                        setDraftRoles((current) => ({
                          ...current,
                          [membership.userId]: event.target.value as PilotWorkspaceRole
                        }))
                      }
                      value={draftRole}
                    >
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {displayRole(role)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    className="secondary-action"
                    disabled={status === "saving" || unchanged}
                    onClick={() => updateRole(membership.userId)}
                    type="button"
                  >
                    {status === "saving" && !unchanged ? "Committing Role" : "Commit Role Change"}
                  </button>
                </article>
              );
            })}
          </div>

          <div className="section-heading tenant-access-audit-heading">
            <p className="eyebrow">Access audit trail</p>
            <h2>Role-change evidence</h2>
            <p className="section-copy">
              The final tenant-admin cannot be demoted. Direct membership mutation remains denied.
            </p>
          </div>
          {dashboard.auditEvents.length > 0 ? (
            dashboard.auditEvents.map((event) => (
              <article className="module-row" key={event.id}>
                <div>
                  <span>{event.eventType}</span>
                  <h2>
                    {displayRole(event.priorRole)} to {displayRole(event.nextRole)}
                  </h2>
                </div>
                <p>{formatDate(event.createdAt)}</p>
                <strong>Target identity {event.targetUserId.slice(0, 8)}...</strong>
              </article>
            ))
          ) : (
            <article className="module-row">
              <div>
                <span>no role changes</span>
                <h2>Original approved membership state is intact.</h2>
              </div>
              <p>Role-change evidence will appear after the first governed update.</p>
              <strong>Final-admin protection active</strong>
            </article>
          )}
        </>
      ) : null}
    </section>
  );
}
