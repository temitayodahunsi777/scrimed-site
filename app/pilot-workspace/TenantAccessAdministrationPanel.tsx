"use client";

import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import type {
  PilotWorkspaceRecord,
  PilotWorkspaceRole,
  TenantAccessDashboard,
  TenantIdentityProviderStatus,
  TenantIdentityReadiness
} from "../lib/protectedPilotWorkspace";

type TenantAccessResponse = {
  dashboard?: TenantAccessDashboard;
  error?: { code?: string; message?: string };
};

type PanelStatus = "loading" | "ready" | "saving" | "unavailable" | "error";

const roles: PilotWorkspaceRole[] = ["tenant-admin", "pilot-lead", "reviewer", "observer"];
const identityStatuses: TenantIdentityProviderStatus[] = [
  "passwordless-magic-link",
  "sso-readiness",
  "sso-configured"
];

function displayRole(role: PilotWorkspaceRole) {
  return role
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function displayIdentityStatus(status: TenantIdentityProviderStatus) {
  if (status === "passwordless-magic-link") return "Passwordless + MFA";
  if (status === "sso-readiness") return "SSO readiness";
  return "SSO configured";
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

function defaultExpiryDate() {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 14);
  return expiresAt.toISOString().slice(0, 10);
}

function eventMetadataSummary(metadata: Record<string, unknown>) {
  const keys = Object.keys(metadata);
  return keys.length > 0 ? keys.slice(0, 4).join(", ") : "metadata sealed";
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
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<PilotWorkspaceRole>("reviewer");
  const [inviteNote, setInviteNote] = useState("");
  const [inviteExpiresAt, setInviteExpiresAt] = useState(defaultExpiryDate);
  const [cancelReasons, setCancelReasons] = useState<Record<string, string>>({});
  const [deactivationReasons, setDeactivationReasons] = useState<Record<string, string>>({});
  const [reviewNotes, setReviewNotes] = useState("");
  const [identityDraft, setIdentityDraft] = useState<TenantIdentityReadiness | null>(null);

  function applyDashboard(nextDashboard: TenantAccessDashboard) {
    setDashboard(nextDashboard);
    setDraftRoles(
      Object.fromEntries(nextDashboard.memberships.map((membership) => [membership.userId, membership.role]))
    );
    setIdentityDraft(nextDashboard.identityReadiness);
  }

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

      applyDashboard(body.dashboard);
      setStatus("ready");
    }

    void loadDashboard();

    return () => {
      active = false;
    };
  }, [session.access_token, workspace.slug]);

  async function commitAction(payload: Record<string, unknown>, successMessage: string) {
    setStatus("saving");
    setMessage("");
    const response = await fetch(`/api/pilot-workspaces/${workspace.slug}/tenant-access`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    const body = (await response.json()) as TenantAccessResponse;

    if (!response.ok) {
      setStatus("error");
      setMessage(body.error?.message ?? "The governed tenant access lifecycle action could not be committed.");
      return;
    }

    if (body.dashboard) {
      applyDashboard(body.dashboard);
    }

    setStatus("ready");
    setMessage(successMessage);
  }

  async function createInvitation() {
    await commitAction(
      {
        action: "create-invitation",
        email: inviteEmail,
        role: inviteRole,
        expiresAt: inviteExpiresAt,
        note: inviteNote
      },
      "Invitation record created. Email delivery remains disabled until enterprise SMTP is approved."
    );
    setInviteEmail("");
    setInviteNote("");
    setInviteExpiresAt(defaultExpiryDate());
  }

  async function updateRole(userId: string) {
    const role = draftRoles[userId];

    if (!role) {
      return;
    }

    await commitAction(
      {
        action: "update-role",
        userId,
        role
      },
      "Membership role change committed with append-only access evidence."
    );
  }

  async function cancelInvitation(invitationId: string) {
    await commitAction(
      {
        action: "cancel-invitation",
        invitationId,
        reason: cancelReasons[invitationId] ?? ""
      },
      "Invitation record cancelled."
    );
  }

  async function activateInvitation(invitationId: string) {
    await commitAction(
      {
        action: "activate-invitation",
        invitationId
      },
      "Invitation activated for an existing enrolled SCRIMED pilot user."
    );
  }

  async function deactivateMembership(userId: string) {
    await commitAction(
      {
        action: "deactivate-membership",
        userId,
        reason: deactivationReasons[userId] ?? ""
      },
      "Membership deactivated. Final-admin protection remains enforced."
    );
  }

  async function reactivateMembership(userId: string) {
    await commitAction(
      {
        action: "reactivate-membership",
        userId
      },
      "Membership reactivated and access-review due date refreshed."
    );
  }

  async function attestAccessReview() {
    await commitAction(
      {
        action: "attest-access-review",
        notes: reviewNotes
      },
      "Access review attested for active protected-pilot members."
    );
    setReviewNotes("");
  }

  async function updateIdentityReadiness() {
    if (!identityDraft) {
      return;
    }

    await commitAction(
      {
        action: "update-identity-readiness",
        providerStatus: identityDraft.providerStatus,
        ssoProvider: identityDraft.ssoProvider,
        ssoDomain: identityDraft.ssoDomain,
        notes: identityDraft.notes
      },
      "Identity readiness metadata updated."
    );
  }

  if (status === "unavailable") {
    return null;
  }

  return (
    <section className="table-section tenant-access-panel" aria-label="Tenant access administration">
      <div className="section-heading">
        <p className="eyebrow">Tenant access administration</p>
        <h2>Govern protected-pilot identities.</h2>
        <p className="section-copy">
          Tenant-admin lifecycle actions require fresh AAL2 assurance and create append-only access evidence. The
          workspace remains synthetic-only: no PHI intake, no autonomous care, and no invitation email delivery.
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
          <strong>No lifecycle changes were released.</strong>
        </article>
      ) : null}

      {dashboard ? (
        <>
          <div className="tenant-access-summary">
            <article>
              <span>Active members</span>
              <strong>{dashboard.summary.activeMembers}</strong>
            </article>
            <article>
              <span>Pending invites</span>
              <strong>{dashboard.summary.pendingInvitations}</strong>
            </article>
            <article>
              <span>Inactive members</span>
              <strong>{dashboard.summary.inactiveMembers}</strong>
            </article>
            <article>
              <span>Reviews due</span>
              <strong>{dashboard.summary.accessReviewsDue}</strong>
            </article>
          </div>

          <div className="tenant-access-grid">
            <article className="tenant-access-card">
              <div>
                <span>Invitation registry</span>
                <h3>Create governed invitation record</h3>
                <p>Records activation intent only. Approved email delivery comes later through custom SMTP.</p>
              </div>
              <label className="form-field">
                <span>Email</span>
                <input
                  disabled={status === "saving"}
                  onChange={(event) => setInviteEmail(event.target.value)}
                  placeholder="leader@healthsystem.org"
                  type="email"
                  value={inviteEmail}
                />
              </label>
              <div className="tenant-access-two-column">
                <label className="form-field">
                  <span>Role</span>
                  <select
                    disabled={status === "saving"}
                    onChange={(event) => setInviteRole(event.target.value as PilotWorkspaceRole)}
                    value={inviteRole}
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {displayRole(role)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="form-field">
                  <span>Expires</span>
                  <input
                    disabled={status === "saving"}
                    onChange={(event) => setInviteExpiresAt(event.target.value)}
                    type="date"
                    value={inviteExpiresAt}
                  />
                </label>
              </div>
              <label className="form-field">
                <span>Governance note</span>
                <textarea
                  disabled={status === "saving"}
                  onChange={(event) => setInviteNote(event.target.value)}
                  placeholder="Metadata only. No PHI or clinical details."
                  value={inviteNote}
                />
              </label>
              <button
                className="secondary-action"
                disabled={status === "saving" || !inviteEmail}
                onClick={createInvitation}
                type="button"
              >
                Create Invitation Record
              </button>
            </article>

            <article className="tenant-access-card">
              <div>
                <span>Identity readiness</span>
                <h3>{displayIdentityStatus((identityDraft ?? dashboard.identityReadiness).providerStatus)}</h3>
                <p>Last updated {formatDate((identityDraft ?? dashboard.identityReadiness).updatedAt)}</p>
              </div>
              <label className="form-field">
                <span>Identity posture</span>
                <select
                  disabled={status === "saving"}
                  onChange={(event) =>
                    setIdentityDraft((current) => ({
                      ...(current ?? dashboard.identityReadiness),
                      providerStatus: event.target.value as TenantIdentityProviderStatus
                    }))
                  }
                  value={(identityDraft ?? dashboard.identityReadiness).providerStatus}
                >
                  {identityStatuses.map((identityStatus) => (
                    <option key={identityStatus} value={identityStatus}>
                      {displayIdentityStatus(identityStatus)}
                    </option>
                  ))}
                </select>
              </label>
              <div className="tenant-access-two-column">
                <label className="form-field">
                  <span>SSO provider</span>
                  <input
                    disabled={status === "saving"}
                    onChange={(event) =>
                      setIdentityDraft((current) => ({
                        ...(current ?? dashboard.identityReadiness),
                        ssoProvider: event.target.value
                      }))
                    }
                    placeholder="Okta, Entra ID, Google Workspace"
                    value={(identityDraft ?? dashboard.identityReadiness).ssoProvider}
                  />
                </label>
                <label className="form-field">
                  <span>SSO domain</span>
                  <input
                    disabled={status === "saving"}
                    onChange={(event) =>
                      setIdentityDraft((current) => ({
                        ...(current ?? dashboard.identityReadiness),
                        ssoDomain: event.target.value
                      }))
                    }
                    placeholder="healthsystem.org"
                    value={(identityDraft ?? dashboard.identityReadiness).ssoDomain}
                  />
                </label>
              </div>
              <label className="form-field">
                <span>Readiness notes</span>
                <textarea
                  disabled={status === "saving"}
                  onChange={(event) =>
                    setIdentityDraft((current) => ({
                      ...(current ?? dashboard.identityReadiness),
                      notes: event.target.value
                    }))
                  }
                  placeholder="Metadata only. No PHI or clinical details."
                  value={(identityDraft ?? dashboard.identityReadiness).notes}
                />
              </label>
              <button
                className="secondary-action"
                disabled={status === "saving"}
                onClick={updateIdentityReadiness}
                type="button"
              >
                Save Identity Readiness
              </button>
            </article>
          </div>

          <div className="section-heading tenant-access-audit-heading">
            <p className="eyebrow">Membership controls</p>
            <h2>Role, offboarding, and recovery</h2>
            <p className="section-copy">
              The final active tenant-admin cannot be demoted or deactivated.
            </p>
          </div>
          <div className="tenant-access-list">
            {dashboard.memberships.map((membership) => {
              const draftRole = draftRoles[membership.userId] ?? membership.role;
              const unchanged = draftRole === membership.role;

              return (
                <article key={membership.userId}>
                  <div>
                    <span>{membership.status}</span>
                    <h3>{membership.email}</h3>
                    <p>
                      {displayRole(membership.role)} · approved {formatDate(membership.createdAt)}
                    </p>
                    <p>Access review due {formatDate(membership.accessReviewDueAt)}</p>
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
                  <div className="tenant-access-actions">
                    <button
                      className="secondary-action"
                      disabled={status === "saving" || unchanged}
                      onClick={() => updateRole(membership.userId)}
                      type="button"
                    >
                      Commit Role
                    </button>
                    {membership.status === "active" ? (
                      <>
                        <input
                          disabled={status === "saving"}
                          onChange={(event) =>
                            setDeactivationReasons((current) => ({
                              ...current,
                              [membership.userId]: event.target.value
                            }))
                          }
                          placeholder="Offboarding reason"
                          value={deactivationReasons[membership.userId] ?? ""}
                        />
                        <button
                          className="secondary-action"
                          disabled={status === "saving"}
                          onClick={() => deactivateMembership(membership.userId)}
                          type="button"
                        >
                          Deactivate
                        </button>
                      </>
                    ) : (
                      <button
                        className="secondary-action"
                        disabled={status === "saving"}
                        onClick={() => reactivateMembership(membership.userId)}
                        type="button"
                      >
                        Reactivate
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          <div className="tenant-access-grid tenant-access-audit-heading">
            <article className="tenant-access-card">
              <div>
                <span>Access review</span>
                <h3>Attest active pilot access</h3>
                <p>{dashboard.summary.accessReviewsDue} active member review(s) currently due.</p>
              </div>
              <label className="form-field">
                <span>Review notes</span>
                <textarea
                  disabled={status === "saving"}
                  onChange={(event) => setReviewNotes(event.target.value)}
                  placeholder="Metadata only. No PHI or clinical details."
                  value={reviewNotes}
                />
              </label>
              <button
                className="secondary-action"
                disabled={status === "saving"}
                onClick={attestAccessReview}
                type="button"
              >
                Attest Access Review
              </button>
            </article>

            <article className="tenant-access-card">
              <div>
                <span>Security controls</span>
                <h3>AAL2 lifecycle governance</h3>
                <p>{dashboard.boundary}</p>
              </div>
              <ul className="tenant-access-control-list">
                <li>Final-admin protection active</li>
                <li>Offboarding enforced</li>
                <li>Direct invitation email disabled</li>
                <li>Server runtime token required</li>
              </ul>
            </article>
          </div>

          <div className="section-heading tenant-access-audit-heading">
            <p className="eyebrow">Invitation records</p>
            <h2>Pending activation and cancellations</h2>
          </div>
          {dashboard.invitations.length > 0 ? (
            <div className="tenant-access-list">
              {dashboard.invitations.map((invitation) => (
                <article key={invitation.id}>
                  <div>
                    <span>{invitation.status}</span>
                    <h3>{invitation.email}</h3>
                    <p>
                      {displayRole(invitation.proposedRole)} · expires {formatDate(invitation.expiresAt)}
                    </p>
                    <p>Created {formatDate(invitation.createdAt)}</p>
                  </div>
                  <label className="form-field">
                    <span>Cancellation reason</span>
                    <input
                      disabled={status === "saving" || invitation.status !== "pending"}
                      onChange={(event) =>
                        setCancelReasons((current) => ({
                          ...current,
                          [invitation.id]: event.target.value
                        }))
                      }
                      placeholder="Optional"
                      value={cancelReasons[invitation.id] ?? ""}
                    />
                  </label>
                  <div className="tenant-access-actions">
                    <button
                      className="secondary-action"
                      disabled={status === "saving" || invitation.status !== "pending"}
                      onClick={() => activateInvitation(invitation.id)}
                      type="button"
                    >
                      Activate Existing User
                    </button>
                    <button
                      className="secondary-action"
                      disabled={status === "saving" || invitation.status !== "pending"}
                      onClick={() => cancelInvitation(invitation.id)}
                      type="button"
                    >
                      Cancel Record
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <article className="module-row">
              <div>
                <span>no invitations</span>
                <h2>No active invitation records.</h2>
              </div>
              <p>New records appear here before activation or cancellation.</p>
              <strong>Email delivery disabled</strong>
            </article>
          )}

          <div className="section-heading tenant-access-audit-heading">
            <p className="eyebrow">Access evidence</p>
            <h2>Lifecycle and role-change trail</h2>
          </div>
          {dashboard.lifecycleEvents.length > 0 ? (
            dashboard.lifecycleEvents.map((event) => (
              <article className="module-row" key={event.id}>
                <div>
                  <span>{event.eventType}</span>
                  <h2>{formatDate(event.createdAt)}</h2>
                </div>
                <p>{eventMetadataSummary(event.eventMetadata)}</p>
                <strong>Actor {event.actorUserId.slice(0, 8)}...</strong>
              </article>
            ))
          ) : (
            <article className="module-row">
              <div>
                <span>no lifecycle events</span>
                <h2>Original protected-pilot identity state is intact.</h2>
              </div>
              <p>Invitation, offboarding, reactivation, review, and SSO evidence will appear here.</p>
              <strong>Append-only evidence</strong>
            </article>
          )}

          {dashboard.auditEvents.length > 0
            ? dashboard.auditEvents.map((event) => (
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
            : null}
        </>
      ) : null}
    </section>
  );
}
