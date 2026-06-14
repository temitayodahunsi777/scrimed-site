"use client";

import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import type {
  PilotWorkspaceRecord,
  PilotWorkspaceRole,
  TenantAccessDashboard,
  TenantAccessInvitation,
  TenantIdentityProviderStatus,
  TenantIdentityReadiness,
  TenantInvitationDeliveryReadiness,
  TenantInvitationDeliveryReadinessStatus,
  TenantInvitationDeliveryStatus
} from "../lib/protectedPilotWorkspace";

type TenantAccessResponse = {
  dashboard?: TenantAccessDashboard;
  error?: { code?: string; message?: string };
};

type PanelStatus = "loading" | "ready" | "saving" | "unavailable" | "error";
type ActivationRunbookStatus = "complete" | "ready" | "waiting" | "blocked";
type ActivationRunbookAction =
  | "create-invitation"
  | "download-packet"
  | "prepare-delivery"
  | "activate-user"
  | "download-proof";

type ActivationRunbookStep = {
  step: string;
  title: string;
  status: ActivationRunbookStatus;
  evidence: string;
  buyerState: string;
  boundary: string;
  action?: ActivationRunbookAction;
  invitation?: TenantAccessInvitation;
};

const roles: PilotWorkspaceRole[] = ["tenant-admin", "pilot-lead", "reviewer", "observer"];
const identityStatuses: TenantIdentityProviderStatus[] = [
  "passwordless-magic-link",
  "sso-readiness",
  "sso-configured"
];
const deliveryReadinessStatuses: TenantInvitationDeliveryReadinessStatus[] = [
  "manual-packet-only",
  "smtp-readiness-review",
  "smtp-approved-send-gated"
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

function displayDeliveryReadinessStatus(status: TenantInvitationDeliveryReadinessStatus) {
  if (status === "manual-packet-only") return "Manual packet only";
  if (status === "smtp-readiness-review") return "SMTP readiness review";
  return "SMTP approved, send gated";
}

function displayInvitationDeliveryStatus(status: TenantInvitationDeliveryStatus) {
  if (status === "record-only") return "Record only";
  if (status === "packet-generated") return "Packet generated";
  if (status === "external-delivery-prepared") return "External delivery prepared";
  return "SMTP ready, send blocked";
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

function displayRunbookStatus(status: ActivationRunbookStatus) {
  if (status === "complete") return "Complete";
  if (status === "ready") return "Ready";
  if (status === "waiting") return "Waiting";
  return "Blocked";
}

function displayRunbookAction(action: ActivationRunbookAction) {
  if (action === "create-invitation") return "Create Invitation";
  if (action === "download-packet") return "Download Packet";
  if (action === "prepare-delivery") return "Prepare Delivery";
  if (action === "activate-user") return "Activate User";
  return "Export Proof";
}

function runbookStatusRank(status: ActivationRunbookStatus) {
  if (status === "complete") return 4;
  if (status === "ready") return 3;
  if (status === "waiting") return 2;
  return 1;
}

function latestEventDate(dashboard: TenantAccessDashboard, eventType: TenantAccessDashboard["lifecycleEvents"][number]["eventType"]) {
  return dashboard.lifecycleEvents.find((event) => event.eventType === eventType)?.createdAt ?? null;
}

function buildActivationRunbook(dashboard: TenantAccessDashboard): ActivationRunbookStep[] {
  const pendingInvitation = dashboard.invitations.find((invitation) => invitation.status === "pending");
  const packetInvitation =
    dashboard.invitations.find((invitation) => Boolean(invitation.lastPacketGeneratedAt)) ?? pendingInvitation;
  const deliveryInvitation =
    dashboard.invitations.find((invitation) => Boolean(invitation.lastDeliveryPreparedAt)) ?? packetInvitation;
  const activatedInvitation = dashboard.invitations.find((invitation) => invitation.status === "activated");
  const invitationCandidate = pendingInvitation ?? activatedInvitation ?? dashboard.invitations[0];
  const packetReady = Boolean(packetInvitation?.lastPacketGeneratedAt);
  const deliveryReady = Boolean(deliveryInvitation?.lastDeliveryPreparedAt);
  const activationReady = Boolean(activatedInvitation?.activatedAt);
  const activationProofReady = Boolean(latestEventDate(dashboard, "activation-proof-packet-downloaded"));
  const invitationCreatedAt = latestEventDate(dashboard, "invitation-created") ?? invitationCandidate?.createdAt ?? null;
  const packetGeneratedAt = latestEventDate(dashboard, "invitation-packet-generated") ?? packetInvitation?.lastPacketGeneratedAt ?? null;
  const deliveryPreparedAt =
    latestEventDate(dashboard, "invitation-delivery-prepared") ?? deliveryInvitation?.lastDeliveryPreparedAt ?? null;
  const activatedAt = latestEventDate(dashboard, "invitation-activated") ?? activatedInvitation?.activatedAt ?? null;
  const proofGeneratedAt = latestEventDate(dashboard, "activation-proof-packet-downloaded");

  return [
    {
      step: "01",
      title: "Create controlled invitation",
      status: invitationCandidate ? "complete" : "ready",
      evidence: invitationCandidate
        ? `${invitationCandidate.email} recorded ${formatDate(invitationCreatedAt)} as ${displayRole(invitationCandidate.proposedRole)}.`
        : "No active invitation record has been created for this tenant workspace.",
      buyerState: invitationCandidate ? "Invitation intent is inspectable." : "Buyer evidence starts with a metadata-only invitation.",
      boundary: "No user creation, no PHI, and no email send.",
      action: invitationCandidate ? undefined : "create-invitation"
    },
    {
      step: "02",
      title: "Download onboarding packet",
      status: packetReady ? "complete" : pendingInvitation ? "ready" : "blocked",
      evidence: packetReady
        ? `${packetInvitation?.email ?? "Invitee"} packet generated ${formatDate(packetGeneratedAt)}.`
        : pendingInvitation
          ? `${pendingInvitation.email} is ready for audited packet generation.`
          : "A pending invitation is required before packet generation.",
      buyerState: packetReady ? "Onboarding packet evidence is available." : "Packet evidence is not yet available.",
      boundary: "Packet supports manual enterprise delivery only.",
      action: packetReady || !pendingInvitation ? undefined : "download-packet",
      invitation: pendingInvitation
    },
    {
      step: "03",
      title: "Prepare external delivery",
      status: deliveryReady ? "complete" : packetReady && pendingInvitation ? "ready" : pendingInvitation ? "waiting" : "blocked",
      evidence: deliveryReady
        ? `${deliveryInvitation?.email ?? "Invitee"} delivery prepared ${formatDate(deliveryPreparedAt)}.`
        : packetReady && pendingInvitation
          ? `${pendingInvitation.email} packet is ready for delivery preparation.`
          : "Packet generation must be recorded before external delivery preparation.",
      buyerState: deliveryReady ? "Manual delivery readiness is evidenced." : "Delivery readiness still needs an audit event.",
      boundary: "Direct SMTP send remains gated.",
      action: deliveryReady || !packetReady || !pendingInvitation ? undefined : "prepare-delivery",
      invitation: pendingInvitation
    },
    {
      step: "04",
      title: "Activate enrolled user",
      status: activationReady ? "complete" : deliveryReady && pendingInvitation ? "ready" : pendingInvitation ? "waiting" : "blocked",
      evidence: activationReady
        ? `${activatedInvitation?.email ?? "Invitee"} activated ${formatDate(activatedAt)}.`
        : deliveryReady && pendingInvitation
          ? `${pendingInvitation.email} can be activated only after SCRIMED authentication enrollment exists.`
          : "Activation waits for prepared delivery and external enrollment.",
      buyerState: activationReady ? "Tenant identity lifecycle has activation evidence." : "Activation evidence is not complete.",
      boundary: "No activation for unknown identities and no bypass of AAL2 governance.",
      action: activationReady || !deliveryReady || !pendingInvitation ? undefined : "activate-user",
      invitation: pendingInvitation
    },
    {
      step: "05",
      title: "Export activation proof",
      status: activationProofReady ? "complete" : activationReady ? "ready" : "waiting",
      evidence: activationProofReady
        ? `Activation proof packet exported ${formatDate(proofGeneratedAt)}.`
        : activationReady
          ? "Activation evidence is ready for final proof export."
          : "Final proof export should follow activation evidence.",
      buyerState: activationProofReady ? "Buyer-ready lifecycle proof is available." : "Buyer-ready lifecycle proof is not finalized.",
      boundary: "Diligence artifact only; no clinical or payer authorization.",
      action: activationProofReady || !activationReady ? undefined : "download-proof"
    }
  ];
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
  const [deliveryNotes, setDeliveryNotes] = useState<Record<string, string>>({});
  const [reviewNotes, setReviewNotes] = useState("");
  const [identityDraft, setIdentityDraft] = useState<TenantIdentityReadiness | null>(null);
  const [deliveryDraft, setDeliveryDraft] = useState<TenantInvitationDeliveryReadiness | null>(null);

  function applyDashboard(nextDashboard: TenantAccessDashboard) {
    setDashboard(nextDashboard);
    setDraftRoles(
      Object.fromEntries(nextDashboard.memberships.map((membership) => [membership.userId, membership.role]))
    );
    setIdentityDraft(nextDashboard.identityReadiness);
    setDeliveryDraft(nextDashboard.deliveryReadiness);
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

  async function downloadInvitationPacket(invitationId: string, email: string) {
    setStatus("saving");
    setMessage("");
    const response = await fetch(
      `/api/pilot-workspaces/${workspace.slug}/tenant-access/invitations/${invitationId}/onboarding-packet`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      }
    );

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as TenantAccessResponse;
      setStatus("error");
      setMessage(body.error?.message ?? "The onboarding packet could not be generated.");
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const safeEmail = email.split("@")[0]?.replace(/[^a-z0-9-]/gi, "-").slice(0, 48) || "invitee";
    const link = document.createElement("a");
    link.href = url;
    link.download = `scrimed-${safeEmail}-pilot-onboarding-packet.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setStatus("ready");
    setMessage("Onboarding packet downloaded and recorded in the identity lifecycle trail.");
  }

  async function downloadActivationProofPacket() {
    if (!dashboard) {
      return;
    }

    setStatus("saving");
    setMessage("");
    const response = await fetch(
      `/api/pilot-workspaces/${workspace.slug}/tenant-access/activation-proof-packet`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      }
    );

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as TenantAccessResponse;
      setStatus("error");
      setMessage(body.error?.message ?? "The activation proof packet could not be generated.");
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const safeWorkspace = dashboard.workspaceSlug.replace(/[^a-z0-9-]/gi, "-").slice(0, 80) || "workspace";
    const link = document.createElement("a");
    link.href = url;
    link.download = `scrimed-${safeWorkspace}-activation-proof-packet.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    const dashboardResponse = await fetch(`/api/pilot-workspaces/${workspace.slug}/tenant-access`, {
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    });
    const body = (await dashboardResponse.json().catch(() => ({}))) as TenantAccessResponse;

    if (dashboardResponse.ok && body.dashboard) {
      applyDashboard(body.dashboard);
    }

    setStatus("ready");
    setMessage("Activation proof packet downloaded and recorded in the identity lifecycle trail.");
  }

  async function prepareInvitationDelivery(invitationId: string) {
    await commitAction(
      {
        action: "prepare-invitation-delivery",
        invitationId,
        note: deliveryNotes[invitationId] ?? ""
      },
      "External invitation delivery prepared. Direct SCRIMED email send remains gated."
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

  async function updateDeliveryReadiness() {
    if (!deliveryDraft) {
      return;
    }

    await commitAction(
      {
        action: "update-delivery-readiness",
        deliveryStatus: deliveryDraft.status,
        smtpProvider: deliveryDraft.smtpProvider,
        smtpFromDomain: deliveryDraft.smtpFromDomain,
        notes: deliveryDraft.notes
      },
      "Invitation delivery readiness metadata updated. Direct send remains gated."
    );
  }

  if (status === "unavailable") {
    return null;
  }

  const activationRunbook = dashboard ? buildActivationRunbook(dashboard) : [];
  const completedRunbookSteps = activationRunbook.filter((step) => step.status === "complete").length;
  const actionableRunbookStep = activationRunbook.find((step) => step.status === "ready") ?? null;
  const runbookEvidenceScore = activationRunbook.reduce(
    (total, step) => total + runbookStatusRank(step.status),
    0
  );
  const runbookEvidenceMax = activationRunbook.length * runbookStatusRank("complete");
  const runbookProgress = runbookEvidenceMax > 0 ? Math.round((runbookEvidenceScore / runbookEvidenceMax) * 100) : 0;

  async function commitRunbookAction(step: ActivationRunbookStep) {
    if (!step.action) {
      return;
    }

    if (step.action === "create-invitation") {
      if (!inviteEmail) {
        setMessage("Enter a business email in the invitation registry before creating the first runbook record.");
        return;
      }

      await createInvitation();
      return;
    }

    if (!step.invitation && step.action !== "download-proof") {
      setMessage("The selected runbook step is waiting for a governed invitation record.");
      return;
    }

    if (step.action === "download-packet" && step.invitation) {
      await downloadInvitationPacket(step.invitation.id, step.invitation.email);
      return;
    }

    if (step.action === "prepare-delivery" && step.invitation) {
      await prepareInvitationDelivery(step.invitation.id);
      return;
    }

    if (step.action === "activate-user" && step.invitation) {
      await activateInvitation(step.invitation.id);
      return;
    }

    await downloadActivationProofPacket();
  }

  return (
    <section className="table-section tenant-access-panel" aria-label="Tenant access administration">
      <div className="section-heading">
        <p className="eyebrow">Tenant access administration</p>
        <h2>Govern protected-pilot identities.</h2>
        <p className="section-copy">
          Tenant-admin lifecycle actions require fresh AAL2 assurance and create append-only access evidence. The
          workspace remains synthetic-only: no PHI intake, no autonomous care, and no direct invitation email delivery.
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
              <span>Packets ready</span>
              <strong>{dashboard.summary.packetGeneratedInvitations}</strong>
            </article>
            <article>
              <span>Delivery prepared</span>
              <strong>{dashboard.summary.deliveryPreparedInvitations}</strong>
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

          <section className="activation-runbook" aria-label="Tenant activation runbook">
            <div className="activation-runbook-heading">
              <div>
                <span>Activation runbook</span>
                <h3>Invitation to buyer-ready proof</h3>
                <p>
                  {actionableRunbookStep
                    ? `Next controlled action: ${actionableRunbookStep.title}.`
                    : "All currently available activation evidence is complete."}
                </p>
              </div>
              <div className="activation-runbook-progress" aria-label={`${runbookProgress}% evidence readiness`}>
                <strong>{runbookProgress}%</strong>
                <span>
                  {completedRunbookSteps}/{activationRunbook.length} complete
                </span>
              </div>
            </div>
            <div className="activation-runbook-list">
              {activationRunbook.map((step) => (
                <article className={`activation-runbook-step is-${step.status}`} key={step.step}>
                  <div className="activation-runbook-index">
                    <span>{step.step}</span>
                  </div>
                  <div>
                    <div className="activation-runbook-title">
                      <h4>{step.title}</h4>
                      <span>{displayRunbookStatus(step.status)}</span>
                    </div>
                    <p>{step.evidence}</p>
                    <p>{step.buyerState}</p>
                    <strong>{step.boundary}</strong>
                  </div>
                  <button
                    className="secondary-action"
                    disabled={status === "saving" || !step.action}
                    onClick={() => commitRunbookAction(step)}
                    type="button"
                  >
                    {step.action ? displayRunbookAction(step.action) : "Evidence Recorded"}
                  </button>
                </article>
              ))}
            </div>
          </section>

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

            <article className="tenant-access-card">
              <div>
                <span>Delivery readiness</span>
                <h3>{displayDeliveryReadinessStatus((deliveryDraft ?? dashboard.deliveryReadiness).status)}</h3>
                <p>Last updated {formatDate((deliveryDraft ?? dashboard.deliveryReadiness).updatedAt)}</p>
              </div>
              <label className="form-field">
                <span>Delivery posture</span>
                <select
                  disabled={status === "saving"}
                  onChange={(event) =>
                    setDeliveryDraft((current) => ({
                      ...(current ?? dashboard.deliveryReadiness),
                      status: event.target.value as TenantInvitationDeliveryReadinessStatus
                    }))
                  }
                  value={(deliveryDraft ?? dashboard.deliveryReadiness).status}
                >
                  {deliveryReadinessStatuses.map((deliveryStatus) => (
                    <option key={deliveryStatus} value={deliveryStatus}>
                      {displayDeliveryReadinessStatus(deliveryStatus)}
                    </option>
                  ))}
                </select>
              </label>
              <div className="tenant-access-two-column">
                <label className="form-field">
                  <span>SMTP provider</span>
                  <input
                    disabled={status === "saving"}
                    onChange={(event) =>
                      setDeliveryDraft((current) => ({
                        ...(current ?? dashboard.deliveryReadiness),
                        smtpProvider: event.target.value
                      }))
                    }
                    placeholder="Postmark, SendGrid, SES"
                    value={(deliveryDraft ?? dashboard.deliveryReadiness).smtpProvider}
                  />
                </label>
                <label className="form-field">
                  <span>From domain</span>
                  <input
                    disabled={status === "saving"}
                    onChange={(event) =>
                      setDeliveryDraft((current) => ({
                        ...(current ?? dashboard.deliveryReadiness),
                        smtpFromDomain: event.target.value
                      }))
                    }
                    placeholder="scrimedsolutions.com"
                    value={(deliveryDraft ?? dashboard.deliveryReadiness).smtpFromDomain}
                  />
                </label>
              </div>
              <label className="form-field">
                <span>Delivery notes</span>
                <textarea
                  disabled={status === "saving"}
                  onChange={(event) =>
                    setDeliveryDraft((current) => ({
                      ...(current ?? dashboard.deliveryReadiness),
                      notes: event.target.value
                    }))
                  }
                  placeholder="Metadata only. No PHI or clinical details."
                  value={(deliveryDraft ?? dashboard.deliveryReadiness).notes}
                />
              </label>
              <button
                className="secondary-action"
                disabled={status === "saving"}
                onClick={updateDeliveryReadiness}
                type="button"
              >
                Save Delivery Readiness
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
                <li>Onboarding packet downloads audited</li>
                <li>Outbound SMTP send gated</li>
                <li>Server runtime token required</li>
              </ul>
              <button
                className="secondary-action"
                disabled={status === "saving"}
                onClick={downloadActivationProofPacket}
                type="button"
              >
                Download Activation Proof Packet
              </button>
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
                    <p>
                      {displayInvitationDeliveryStatus(invitation.deliveryStatus)} · packet{" "}
                      {formatDate(invitation.lastPacketGeneratedAt)}
                    </p>
                    <p>
                      Delivery prepared {formatDate(invitation.lastDeliveryPreparedAt)} · attempts{" "}
                      {invitation.deliveryAttemptCount}
                    </p>
                  </div>
                  <div className="tenant-access-actions">
                    <label className="form-field">
                      <span>Delivery note</span>
                      <input
                        disabled={status === "saving" || invitation.status !== "pending"}
                        onChange={(event) =>
                          setDeliveryNotes((current) => ({
                            ...current,
                            [invitation.id]: event.target.value
                          }))
                        }
                        placeholder="Manual delivery channel, no PHI"
                        value={deliveryNotes[invitation.id] ?? invitation.deliveryNote}
                      />
                    </label>
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
                  </div>
                  <div className="tenant-access-actions">
                    <button
                      className="secondary-action"
                      disabled={status === "saving" || invitation.status !== "pending"}
                      onClick={() => downloadInvitationPacket(invitation.id, invitation.email)}
                      type="button"
                    >
                      Download Packet
                    </button>
                    <button
                      className="secondary-action"
                      disabled={status === "saving" || invitation.status !== "pending"}
                      onClick={() => prepareInvitationDelivery(invitation.id)}
                      type="button"
                    >
                      Prepare Delivery
                    </button>
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
