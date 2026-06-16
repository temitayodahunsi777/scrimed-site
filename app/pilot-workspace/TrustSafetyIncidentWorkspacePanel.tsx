"use client";

import type { Session } from "@supabase/supabase-js";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { PilotWorkspaceRecord } from "../lib/protectedPilotWorkspace";
import type {
  DurableTrustSafetyIncidentDashboard,
  DurableTrustSafetyIncidentEventRecord,
  DurableTrustSafetyIncidentRecord,
  TrustSafetyIncidentEventType,
  TrustSafetyIncidentSeverity,
  TrustSafetyIncidentStatus,
  TrustSafetyLegalHoldStatus,
  TrustSafetyNotificationDecision,
  TrustSafetyPostIncidentReviewStatus
} from "../lib/trustSafetyOperations";

type TrustOpsResponse = {
  dashboard?: DurableTrustSafetyIncidentDashboard;
  incidents?: DurableTrustSafetyIncidentRecord[];
  events?: DurableTrustSafetyIncidentEventRecord[];
  incident?: DurableTrustSafetyIncidentRecord | null;
  incidentId?: string;
  eventId?: string;
  status?: string;
  error?: { code?: string; message?: string; fields?: string[] };
};

type PanelStatus = "loading" | "ready" | "saving" | "error";

type CreateFormState = {
  incidentKey: string;
  title: string;
  severity: TrustSafetyIncidentSeverity;
  owner: string;
  accountableAgent: string;
  sourceChannel: string;
  affectedSurface: string;
  triggerSignal: string;
  buyerImpact: string;
  containmentAction: string;
  remediationPlan: string;
  legalHoldStatus: TrustSafetyLegalHoldStatus;
  notificationDecision: TrustSafetyNotificationDecision;
  notificationReason: string;
  retentionUntil: string;
  legalHoldUntil: string;
};

type UpdateFormState = {
  status: TrustSafetyIncidentStatus;
  severity: TrustSafetyIncidentSeverity;
  legalHoldStatus: TrustSafetyLegalHoldStatus;
  notificationDecision: TrustSafetyNotificationDecision;
  notificationReason: string;
  containmentAction: string;
  remediationPlan: string;
  postIncidentReviewStatus: TrustSafetyPostIncidentReviewStatus;
  retentionUntil: string;
  legalHoldUntil: string;
  eventType: TrustSafetyIncidentEventType;
  eventSummary: string;
};

const severityOptions: TrustSafetyIncidentSeverity[] = ["low", "moderate", "high", "critical"];
const statusOptions: TrustSafetyIncidentStatus[] = [
  "new",
  "triaged",
  "contained",
  "remediating",
  "monitoring",
  "closed",
  "production-gated"
];
const legalHoldOptions: TrustSafetyLegalHoldStatus[] = ["not-required", "watch", "recommended", "active"];
const notificationOptions: TrustSafetyNotificationDecision[] = [
  "pending",
  "not-required",
  "internal-only",
  "customer-review",
  "regulatory-review",
  "counsel-escalation"
];
const reviewStatusOptions: TrustSafetyPostIncidentReviewStatus[] = [
  "not-started",
  "in-review",
  "actions-assigned",
  "complete"
];
const eventTypeOptions: TrustSafetyIncidentEventType[] = [
  "status-updated",
  "containment-recorded",
  "remediation-updated",
  "legal-hold-recorded",
  "legal-hold-released",
  "notification-decision-recorded",
  "post-incident-review-recorded",
  "incident-closed"
];

const boundaryControls = [
  {
    area: "Privacy",
    status: "No PHI",
    control: "Incident records are synthetic-pilot and enterprise-readiness metadata only.",
    nextGate: "Customer-specific privacy review, BAA/DPA scope, and processing register."
  },
  {
    area: "Security",
    status: "Fail closed",
    control: "Workspace access requires authenticated tenant membership, fresh AAL2, RPC guards, and rate limits.",
    nextGate: "Buyer-specific incident response plan, alert routing, and monitored escalation owner."
  },
  {
    area: "Legal",
    status: "Review gated",
    control: "Legal hold and notification fields are diligence evidence, not legal advice or breach determination.",
    nextGate: "Qualified counsel, customer policy, jurisdictional review, and approval record."
  },
  {
    area: "Operations",
    status: "Proof ready",
    control: "Review packets write audit events before release so buyer evidence has a retained trail.",
    nextGate: "Authenticated smoke token in CI and customer-approved retention schedule."
  }
];

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

function dateInputToIso(value: string) {
  if (!value.trim()) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) ? parsed.toISOString() : value;
}

function defaultIncidentKey() {
  return `trustops-enterprise-readiness-${Date.now().toString(36)}`;
}

function defaultCreateForm(): CreateFormState {
  return {
    incidentKey: defaultIncidentKey(),
    title: "Enterprise readiness TrustOps review",
    severity: "moderate",
    owner: "Tenant trust and safety owner",
    accountableAgent: "Claims And Legal Guard",
    sourceChannel: "Protected pilot workspace",
    affectedSurface: "protected pilot workspace, enterprise readiness review",
    triggerSignal:
      "Synthetic enterprise evaluator requested proof that TrustOps incidents are retained, governed, and reviewable before any production scope.",
    buyerImpact:
      "Gives CIO, CISO, privacy, compliance, and operations buyers concrete evidence that SCRIMED can govern AI workflow incidents without accepting live PHI.",
    containmentAction:
      "Keep all evidence synthetic-only, route any suspected PHI to the PHI Shield boundary, and require human review before external packet release.",
    remediationPlan:
      "Record owner, legal-hold posture, notification review posture, post-incident review status, and proof-packet evidence for enterprise diligence.",
    legalHoldStatus: "watch",
    notificationDecision: "internal-only",
    notificationReason:
      "Synthetic readiness review only. Customer, regulatory, or counsel notification is not triggered by this demo record.",
    retentionUntil: "",
    legalHoldUntil: ""
  };
}

function defaultUpdateForm(incident?: DurableTrustSafetyIncidentRecord | null): UpdateFormState {
  return {
    status: incident?.status ?? "triaged",
    severity: incident?.severity ?? "moderate",
    legalHoldStatus: incident?.legalHoldStatus ?? "watch",
    notificationDecision: incident?.notificationDecision ?? "internal-only",
    notificationReason:
      incident?.notificationReason ||
      "Synthetic readiness update only; no customer, regulatory, or counsel notification determination is being made.",
    containmentAction:
      incident?.containmentAction ||
      "Maintain no-PHI boundary, keep the record in human review, and preserve only enterprise-readiness metadata.",
    remediationPlan:
      incident?.remediationPlan ||
      "Assign owner, document review posture, keep proof packet gated, and record follow-up actions before closure.",
    postIncidentReviewStatus: incident?.postIncidentReviewStatus ?? "in-review",
    retentionUntil: "",
    legalHoldUntil: "",
    eventType: "status-updated",
    eventSummary:
      "Recorded synthetic TrustOps incident review progress for enterprise readiness and human-governed pilot evidence."
  };
}

function affectedSurfaceList(value: string) {
  return value
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function TrustSafetyIncidentWorkspacePanel({
  session,
  workspace,
  onAuditChanged
}: {
  session: Session;
  workspace: PilotWorkspaceRecord;
  onAuditChanged: () => Promise<void>;
}) {
  const [status, setStatus] = useState<PanelStatus>("loading");
  const [message, setMessage] = useState("");
  const [dashboard, setDashboard] = useState<DurableTrustSafetyIncidentDashboard | null>(null);
  const [incidents, setIncidents] = useState<DurableTrustSafetyIncidentRecord[]>([]);
  const [events, setEvents] = useState<DurableTrustSafetyIncidentEventRecord[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<DurableTrustSafetyIncidentRecord | null>(null);
  const [createForm, setCreateForm] = useState<CreateFormState>(() => defaultCreateForm());
  const [updateForm, setUpdateForm] = useState<UpdateFormState>(() => defaultUpdateForm());
  const selectedEvents = useMemo(
    () => events.filter((event) => event.incidentId === selectedIncident?.id),
    [events, selectedIncident?.id]
  );

  const fetchDashboardResponse = useCallback(async () => {
    const response = await fetch(`/api/pilot-workspaces/${workspace.slug}/trust-safety-incidents`, {
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    });
    const body = (await response.json()) as TrustOpsResponse;

    return { body, response };
  }, [session.access_token, workspace.slug]);

  const refreshDashboard = useCallback(async (preferredIncidentId?: string, successMessage?: string) => {
    setStatus("loading");
    const { body, response } = await fetchDashboardResponse();

    if (!response.ok) {
      setStatus("error");
      setDashboard(null);
      setIncidents([]);
      setEvents([]);
      setSelectedIncident(null);
      setMessage(
        body.error?.fields?.join(", ") ??
          body.error?.message ??
          "The tenant TrustOps incident workspace could not be loaded."
      );
      return;
    }

    const nextIncidents = body.incidents ?? [];
    const nextEvents = body.events ?? [];

    const nextSelected =
      nextIncidents.find((incident) => incident.id === preferredIncidentId) ??
      nextIncidents.find((incident) => incident.id === selectedIncident?.id) ??
      nextIncidents[0] ??
      null;

    setDashboard(body.dashboard ?? null);
    setIncidents(nextIncidents);
    setEvents(nextEvents);
    setSelectedIncident(nextSelected);
    setUpdateForm(defaultUpdateForm(nextSelected));
    setStatus("ready");
    setMessage(successMessage ?? "");
  }, [fetchDashboardResponse, selectedIncident?.id]);

  useEffect(() => {
    let active = true;

    async function loadInitialDashboard() {
      const { body, response } = await fetchDashboardResponse();

      if (!active) {
        return;
      }

      if (!response.ok) {
        setStatus("error");
        setDashboard(null);
        setIncidents([]);
        setEvents([]);
        setSelectedIncident(null);
        setMessage(
          body.error?.fields?.join(", ") ??
            body.error?.message ??
            "The tenant TrustOps incident workspace could not be loaded."
        );
        return;
      }

      const nextIncidents = body.incidents ?? [];
      const nextEvents = body.events ?? [];
      const nextSelected = nextIncidents[0] ?? null;

      setDashboard(body.dashboard ?? null);
      setIncidents(nextIncidents);
      setEvents(nextEvents);
      setSelectedIncident(nextSelected);
      setUpdateForm(defaultUpdateForm(nextSelected));
      setStatus("ready");
      setMessage("");
    }

    void loadInitialDashboard();

    return () => {
      active = false;
    };
  }, [fetchDashboardResponse]);

  function chooseIncident(incident: DurableTrustSafetyIncidentRecord) {
    setSelectedIncident(incident);
    setUpdateForm(defaultUpdateForm(incident));
    setMessage("");
  }

  async function createIncident() {
    setStatus("saving");
    setMessage("");
    const response = await fetch(`/api/pilot-workspaces/${workspace.slug}/trust-safety-incidents`, {
      body: JSON.stringify({
        ...createForm,
        affectedSurface: affectedSurfaceList(createForm.affectedSurface),
        retentionUntil: dateInputToIso(createForm.retentionUntil),
        legalHoldUntil: dateInputToIso(createForm.legalHoldUntil),
        eventMetadata: {
          syntheticOnly: true,
          createdFrom: "pilot-workspace-trustops-panel",
          workspaceSlug: workspace.slug,
          buyerEvidenceUse: "enterprise-readiness-evaluation"
        }
      }),
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json"
      },
      method: "POST"
    });
    const body = (await response.json()) as TrustOpsResponse;

    if (!response.ok) {
      setStatus("error");
      setMessage(
        body.error?.fields?.join(", ") ??
          body.error?.message ??
          "The TrustOps incident could not be created."
      );
      return;
    }

    setCreateForm(defaultCreateForm());
    await refreshDashboard(body.incidentId ?? body.incident?.id, "TrustOps incident committed with durable audit evidence.");
    await onAuditChanged();
  }

  async function updateIncident() {
    if (!selectedIncident) {
      return;
    }

    setStatus("saving");
    setMessage("");
    const response = await fetch(
      `/api/pilot-workspaces/${workspace.slug}/trust-safety-incidents/${selectedIncident.id}`,
      {
        body: JSON.stringify({
          ...updateForm,
          retentionUntil: dateInputToIso(updateForm.retentionUntil),
          legalHoldUntil: dateInputToIso(updateForm.legalHoldUntil),
          eventMetadata: {
            syntheticOnly: true,
            updatedFrom: "pilot-workspace-trustops-panel",
            workspaceSlug: workspace.slug,
            previousStatus: selectedIncident.status,
            previousSeverity: selectedIncident.severity
          }
        }),
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json"
        },
        method: "PATCH"
      }
    );
    const body = (await response.json()) as TrustOpsResponse;

    if (!response.ok) {
      setStatus("error");
      setMessage(
        body.error?.fields?.join(", ") ??
          body.error?.message ??
          "The TrustOps incident update could not be committed."
      );
      return;
    }

    await refreshDashboard(selectedIncident.id, "TrustOps incident update committed to the event trail.");
    await onAuditChanged();
  }

  async function downloadReviewPacket(incident: DurableTrustSafetyIncidentRecord) {
    setStatus("saving");
    setMessage("");
    const response = await fetch(
      `/api/pilot-workspaces/${workspace.slug}/trust-safety-incidents/${incident.id}/review-packet`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      }
    );

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as TrustOpsResponse;
      setStatus("error");
      setMessage(body.error?.message ?? "The audited TrustOps review packet could not be downloaded.");
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `scrimed-${workspace.slug}-${incident.incidentKey}-trustops-review-packet.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    await refreshDashboard(incident.id, "TrustOps review packet downloaded and audit evidence committed.");
    await onAuditChanged();
  }

  return (
    <section
      className="table-section decision-ledger agent-workspace-dashboard"
      aria-label="Tenant TrustOps incident workspace"
    >
      <div className="section-heading">
        <p className="eyebrow">Tenant TrustOps incident workspace</p>
        <h2>Record incident governance, notification review, and proof-packet evidence.</h2>
        <p className="section-copy">
          Incidents are retained as synthetic-pilot and enterprise-readiness evidence only. This workspace does not
          store PHI, patient identifiers, secrets, live clinical records, production breach determinations, legal
          advice, compliance certification, or managed SOC/MDR coverage.
        </p>
      </div>

      <div className="decision-ledger-summary">
        <article>
          <span>Total incidents</span>
          <strong>{dashboard?.totalIncidents ?? incidents.length}</strong>
        </article>
        <article>
          <span>Open incidents</span>
          <strong>{dashboard?.openIncidents ?? 0}</strong>
        </article>
        <article>
          <span>High / critical</span>
          <strong>{dashboard?.highOrCriticalOpen ?? 0}</strong>
        </article>
        <article>
          <span>Packet downloads</span>
          <strong>{dashboard?.packetDownloads ?? 0}</strong>
        </article>
      </div>

      <div className="agent-readiness-grid" aria-label="TrustOps incident boundary controls">
        {boundaryControls.map((control) => (
          <article key={control.area}>
            <span>{control.area}</span>
            <strong>{control.status}</strong>
            <p>{control.control}</p>
            <small>{control.nextGate}</small>
          </article>
        ))}
      </div>

      <div className="evaluation-form decision-commit-form">
        <div className="form-section">
          <div>
            <p className="eyebrow">Create governed incident</p>
            <h3>Create a no-PHI TrustOps incident record for enterprise diligence.</h3>
          </div>
          <div className="form-grid">
            <label className="form-field">
              <span>Incident key</span>
              <input
                onChange={(event) =>
                  setCreateForm((current) => ({ ...current, incidentKey: event.target.value }))
                }
                value={createForm.incidentKey}
              />
            </label>
            <label className="form-field">
              <span>Severity</span>
              <select
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    severity: event.target.value as TrustSafetyIncidentSeverity
                  }))
                }
                value={createForm.severity}
              >
                {severityOptions.map((option) => (
                  <option key={option} value={option}>
                    {displayValue(option)}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Owner</span>
              <input
                onChange={(event) => setCreateForm((current) => ({ ...current, owner: event.target.value }))}
                value={createForm.owner}
              />
            </label>
            <label className="form-field">
              <span>Accountable agent</span>
              <input
                onChange={(event) =>
                  setCreateForm((current) => ({ ...current, accountableAgent: event.target.value }))
                }
                value={createForm.accountableAgent}
              />
            </label>
            <label className="form-field form-field-wide">
              <span>Title</span>
              <input
                onChange={(event) => setCreateForm((current) => ({ ...current, title: event.target.value }))}
                value={createForm.title}
              />
            </label>
            <label className="form-field">
              <span>Source channel</span>
              <input
                onChange={(event) =>
                  setCreateForm((current) => ({ ...current, sourceChannel: event.target.value }))
                }
                value={createForm.sourceChannel}
              />
            </label>
            <label className="form-field">
              <span>Affected surface</span>
              <input
                onChange={(event) =>
                  setCreateForm((current) => ({ ...current, affectedSurface: event.target.value }))
                }
                value={createForm.affectedSurface}
              />
            </label>
            <label className="form-field">
              <span>Legal-hold status</span>
              <select
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    legalHoldStatus: event.target.value as TrustSafetyLegalHoldStatus
                  }))
                }
                value={createForm.legalHoldStatus}
              >
                {legalHoldOptions.map((option) => (
                  <option key={option} value={option}>
                    {displayValue(option)}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Notification decision</span>
              <select
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    notificationDecision: event.target.value as TrustSafetyNotificationDecision
                  }))
                }
                value={createForm.notificationDecision}
              >
                {notificationOptions.map((option) => (
                  <option key={option} value={option}>
                    {displayValue(option)}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field form-field-wide">
              <span>Trigger signal</span>
              <textarea
                onChange={(event) =>
                  setCreateForm((current) => ({ ...current, triggerSignal: event.target.value }))
                }
                value={createForm.triggerSignal}
              />
            </label>
            <label className="form-field form-field-wide">
              <span>Buyer impact</span>
              <textarea
                onChange={(event) =>
                  setCreateForm((current) => ({ ...current, buyerImpact: event.target.value }))
                }
                value={createForm.buyerImpact}
              />
            </label>
            <label className="form-field form-field-wide">
              <span>Containment action</span>
              <textarea
                onChange={(event) =>
                  setCreateForm((current) => ({ ...current, containmentAction: event.target.value }))
                }
                value={createForm.containmentAction}
              />
            </label>
            <label className="form-field form-field-wide">
              <span>Remediation plan</span>
              <textarea
                onChange={(event) =>
                  setCreateForm((current) => ({ ...current, remediationPlan: event.target.value }))
                }
                value={createForm.remediationPlan}
              />
            </label>
            <label className="form-field form-field-wide">
              <span>Notification reason</span>
              <textarea
                onChange={(event) =>
                  setCreateForm((current) => ({ ...current, notificationReason: event.target.value }))
                }
                value={createForm.notificationReason}
              />
              <small>Do not enter PHI, patient identifiers, payer member IDs, secrets, or live clinical details.</small>
            </label>
          </div>
          <div className="form-actions">
            <button
              className="primary-action"
              disabled={status === "saving"}
              onClick={createIncident}
              type="button"
            >
              Create TrustOps Incident
            </button>
            <button className="secondary-action" onClick={() => refreshDashboard()} type="button">
              Refresh Incidents
            </button>
          </div>
          {message ? <div className="intake-alert">{message}</div> : null}
        </div>
      </div>

      <div className="evaluation-form decision-commit-form">
        <div className="form-section">
          <div>
            <p className="eyebrow">Incident review</p>
            <h3>Update status, review posture, retention, and packet evidence.</h3>
          </div>
          <div className="form-grid">
            <label className="form-field">
              <span>Selected incident</span>
              <select
                disabled={incidents.length === 0}
                onChange={(event) => {
                  const incident = incidents.find((record) => record.id === event.target.value);
                  if (incident) chooseIncident(incident);
                }}
                value={selectedIncident?.id ?? ""}
              >
                <option value="">No incident selected</option>
                {incidents.map((incident) => (
                  <option key={incident.id} value={incident.id}>
                    {incident.incidentKey} - {displayValue(incident.status)}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Status</span>
              <select
                disabled={!selectedIncident}
                onChange={(event) =>
                  setUpdateForm((current) => ({
                    ...current,
                    status: event.target.value as TrustSafetyIncidentStatus
                  }))
                }
                value={updateForm.status}
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {displayValue(option)}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Severity</span>
              <select
                disabled={!selectedIncident}
                onChange={(event) =>
                  setUpdateForm((current) => ({
                    ...current,
                    severity: event.target.value as TrustSafetyIncidentSeverity
                  }))
                }
                value={updateForm.severity}
              >
                {severityOptions.map((option) => (
                  <option key={option} value={option}>
                    {displayValue(option)}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Legal-hold status</span>
              <select
                disabled={!selectedIncident}
                onChange={(event) =>
                  setUpdateForm((current) => ({
                    ...current,
                    legalHoldStatus: event.target.value as TrustSafetyLegalHoldStatus
                  }))
                }
                value={updateForm.legalHoldStatus}
              >
                {legalHoldOptions.map((option) => (
                  <option key={option} value={option}>
                    {displayValue(option)}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Notification decision</span>
              <select
                disabled={!selectedIncident}
                onChange={(event) =>
                  setUpdateForm((current) => ({
                    ...current,
                    notificationDecision: event.target.value as TrustSafetyNotificationDecision
                  }))
                }
                value={updateForm.notificationDecision}
              >
                {notificationOptions.map((option) => (
                  <option key={option} value={option}>
                    {displayValue(option)}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Review status</span>
              <select
                disabled={!selectedIncident}
                onChange={(event) =>
                  setUpdateForm((current) => ({
                    ...current,
                    postIncidentReviewStatus: event.target.value as TrustSafetyPostIncidentReviewStatus
                  }))
                }
                value={updateForm.postIncidentReviewStatus}
              >
                {reviewStatusOptions.map((option) => (
                  <option key={option} value={option}>
                    {displayValue(option)}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Event type</span>
              <select
                disabled={!selectedIncident}
                onChange={(event) =>
                  setUpdateForm((current) => ({
                    ...current,
                    eventType: event.target.value as TrustSafetyIncidentEventType
                  }))
                }
                value={updateForm.eventType}
              >
                {eventTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {displayValue(option)}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Retention until</span>
              <input
                disabled={!selectedIncident}
                onChange={(event) =>
                  setUpdateForm((current) => ({ ...current, retentionUntil: event.target.value }))
                }
                type="datetime-local"
                value={updateForm.retentionUntil}
              />
            </label>
            <label className="form-field">
              <span>Legal hold until</span>
              <input
                disabled={!selectedIncident}
                onChange={(event) =>
                  setUpdateForm((current) => ({ ...current, legalHoldUntil: event.target.value }))
                }
                type="datetime-local"
                value={updateForm.legalHoldUntil}
              />
            </label>
            <label className="form-field form-field-wide">
              <span>Event summary</span>
              <textarea
                disabled={!selectedIncident}
                onChange={(event) =>
                  setUpdateForm((current) => ({ ...current, eventSummary: event.target.value }))
                }
                value={updateForm.eventSummary}
              />
            </label>
            <label className="form-field form-field-wide">
              <span>Notification reason</span>
              <textarea
                disabled={!selectedIncident}
                onChange={(event) =>
                  setUpdateForm((current) => ({ ...current, notificationReason: event.target.value }))
                }
                value={updateForm.notificationReason}
              />
            </label>
            <label className="form-field form-field-wide">
              <span>Containment action</span>
              <textarea
                disabled={!selectedIncident}
                onChange={(event) =>
                  setUpdateForm((current) => ({ ...current, containmentAction: event.target.value }))
                }
                value={updateForm.containmentAction}
              />
            </label>
            <label className="form-field form-field-wide">
              <span>Remediation plan</span>
              <textarea
                disabled={!selectedIncident}
                onChange={(event) =>
                  setUpdateForm((current) => ({ ...current, remediationPlan: event.target.value }))
                }
                value={updateForm.remediationPlan}
              />
              <small>
                Closure requires post-incident review status complete. Legal hold and notification values are
                review evidence only.
              </small>
            </label>
          </div>
          <div className="form-actions">
            <button
              className="primary-action"
              disabled={!selectedIncident || status === "saving"}
              onClick={updateIncident}
              type="button"
            >
              Commit Incident Update
            </button>
            <button
              className="secondary-action"
              disabled={!selectedIncident || status === "saving"}
              onClick={() => selectedIncident && downloadReviewPacket(selectedIncident)}
              type="button"
            >
              Download Audited Review Packet
            </button>
          </div>
        </div>
      </div>

      {selectedIncident ? (
        <article className="module-row">
          <div>
            <span>{displayValue(selectedIncident.status)}</span>
            <h2>{selectedIncident.title}</h2>
          </div>
          <p>
            {displayValue(selectedIncident.severity)} severity · {displayValue(selectedIncident.legalHoldStatus)} hold ·{" "}
            {displayValue(selectedIncident.notificationDecision)} notification
          </p>
          <strong>Updated {formatDate(selectedIncident.updatedAt)}</strong>
        </article>
      ) : (
        <article className="module-row">
          <div>
            <span>empty TrustOps queue</span>
            <h2>No tenant TrustOps incidents are visible yet.</h2>
          </div>
          <p>Create a synthetic enterprise-readiness record to show governed incident handling.</p>
          <strong>Live incident response remains gated.</strong>
        </article>
      )}

      <div className="review-event-list">
        <h3>Selected incident event trail</h3>
        {selectedEvents.length > 0 ? (
          selectedEvents.slice(0, 8).map((event) => (
            <article key={event.id}>
              <span>{displayValue(event.eventType)}</span>
              <strong>
                {displayValue(event.priorStatus ?? "new")} to {displayValue(event.nextStatus)}
              </strong>
              <p>{event.eventSummary}</p>
              <small>{formatDate(event.createdAt)}</small>
            </article>
          ))
        ) : (
          <p>No incident event trail is visible for the selected record yet.</p>
        )}
      </div>
    </section>
  );
}
