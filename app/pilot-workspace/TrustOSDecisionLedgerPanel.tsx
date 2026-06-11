"use client";

import type { Session } from "@supabase/supabase-js";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import type { PilotWorkspaceRecord } from "../lib/protectedPilotWorkspace";
import type {
  TrustOSDecisionLedgerRecord,
  TrustOSReviewDisposition,
  TrustOSReviewEventRecord,
  TrustOSReviewReasonCode
} from "../lib/trustOSDecisionLedger";

type LedgerResponse = {
  decisions?: TrustOSDecisionLedgerRecord[];
  decision?: TrustOSDecisionLedgerRecord;
  events?: TrustOSReviewEventRecord[];
  error?: { code?: string; message?: string };
};

const safeDecisionScenarios = [
  {
    slug: "prior-authorization-support",
    label: "Commit governed prior authorization review",
    request: {
      mode: "synthetic-pilot",
      workflow: "Prior authorization support",
      objective: "Prepare a synthetic evidence-gap and policy-review packet for an RCM reviewer.",
      requestedAction: "Draft a review-only missing-evidence checklist and policy trace.",
      dataClassification: "synthetic",
      actionRisk: "moderate",
      requestedTools: ["evidence-retrieval", "document-parser", "workflow-planner"],
      requestedModelProfile: "evidence-reasoning",
      evidenceSourceIds: ["cms-interoperability-prior-auth-2024", "buyer-policy-repository"],
      humanReviewRole: "RCM reviewer",
      dataBoundaryAcknowledged: true
    }
  },
  {
    slug: "production-boundary-test",
    label: "Commit production boundary denial",
    request: {
      mode: "production-request",
      workflow: "Production clinical action request",
      objective: "Demonstrate that TrustOS blocks an unsafe live execution request.",
      requestedAction: "Write a final clinical recommendation to a production record.",
      dataClassification: "live-healthcare-data",
      actionRisk: "prohibited",
      requestedTools: ["connector-write"],
      requestedModelProfile: "evidence-reasoning",
      evidenceSourceIds: [],
      humanReviewRole: "",
      dataBoundaryAcknowledged: true
    }
  }
] as const;

function displayValue(value: string) {
  return value
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

export default function TrustOSDecisionLedgerPanel({
  session,
  workspace,
  onAuditChanged
}: {
  session: Session;
  workspace: PilotWorkspaceRecord;
  onAuditChanged: () => Promise<void>;
}) {
  const [decisions, setDecisions] = useState<TrustOSDecisionLedgerRecord[]>([]);
  const [selectedDecision, setSelectedDecision] = useState<TrustOSDecisionLedgerRecord | null>(null);
  const [reviewEvents, setReviewEvents] = useState<TrustOSReviewEventRecord[]>([]);
  const [scenarioSlug, setScenarioSlug] = useState<string>(safeDecisionScenarios[0].slug);
  const [disposition, setDisposition] = useState<TrustOSReviewDisposition>("approved");
  const [reasonCode, setReasonCode] = useState<TrustOSReviewReasonCode>("synthetic-approved");
  const [notes, setNotes] = useState("");
  const [timeSavedMinutes, setTimeSavedMinutes] = useState("18");
  const [reviewDurationMinutes, setReviewDurationMinutes] = useState("7");
  const [workflowOutcome, setWorkflowOutcome] = useState("synthetic-complete");
  const [status, setStatus] = useState<"loading" | "ready" | "saving" | "error">("loading");
  const [message, setMessage] = useState("");
  const scenario = useMemo(
    () => safeDecisionScenarios.find((candidate) => candidate.slug === scenarioSlug) ?? safeDecisionScenarios[0],
    [scenarioSlug]
  );

  useEffect(() => {
    let active = true;

    async function loadLedger() {
      setStatus("loading");
      setMessage("");
      const response = await fetch(`/api/pilot-workspaces/${workspace.slug}/trustos-decisions`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      const body = (await response.json()) as LedgerResponse;

      if (!active) return;

      if (!response.ok) {
        setStatus("error");
        setMessage(
          body.error?.code === "governance-mfa-required"
            ? "TrustOS Decision Ledger access requires the verified authenticator session used by tenant-admin operations."
            : body.error?.message ?? "The TrustOS Decision Ledger could not be loaded."
        );
        return;
      }

      const nextDecisions = body.decisions ?? [];
      setDecisions(nextDecisions);
      setSelectedDecision(nextDecisions[0] ?? null);
      setStatus("ready");

      if (nextDecisions[0]) {
        await loadReviews(nextDecisions[0], active);
      } else {
        setReviewEvents([]);
      }
    }

    async function loadReviews(decision: TrustOSDecisionLedgerRecord, stillActive = true) {
      const response = await fetch(
        `/api/pilot-workspaces/${workspace.slug}/trustos-decisions/${decision.id}/reviews`,
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );
      const body = (await response.json()) as LedgerResponse;

      if (!stillActive) return;

      if (!response.ok) {
        setMessage(body.error?.message ?? "The TrustOS review trail could not be loaded.");
        return;
      }

      setReviewEvents(body.events ?? []);
    }

    void loadLedger();

    return () => {
      active = false;
    };
  }, [session.access_token, workspace.slug]);

  async function refreshLedger(preferredDecisionId?: string, successMessage?: string) {
    const response = await fetch(`/api/pilot-workspaces/${workspace.slug}/trustos-decisions`, {
      headers: { Authorization: `Bearer ${session.access_token}` }
    });
    const body = (await response.json()) as LedgerResponse;

    if (!response.ok) {
      setStatus("error");
      setMessage(body.error?.message ?? "The TrustOS Decision Ledger could not be refreshed.");
      return;
    }

    const nextDecisions = body.decisions ?? [];
    const nextSelected =
      nextDecisions.find((decision) => decision.id === preferredDecisionId) ??
      nextDecisions[0] ??
      null;
    setDecisions(nextDecisions);
    setSelectedDecision(nextSelected);

    if (nextSelected) {
      await selectDecision(nextSelected, false);
    } else {
      setReviewEvents([]);
    }

    setStatus("ready");
    setMessage(successMessage ?? "");
    await onAuditChanged();
  }

  async function selectDecision(decision: TrustOSDecisionLedgerRecord, clearMessage = true) {
    setSelectedDecision(decision);
    if (clearMessage) setMessage("");
    const response = await fetch(
      `/api/pilot-workspaces/${workspace.slug}/trustos-decisions/${decision.id}/reviews`,
      { headers: { Authorization: `Bearer ${session.access_token}` } }
    );
    const body = (await response.json()) as LedgerResponse;

    if (!response.ok) {
      setMessage(body.error?.message ?? "The TrustOS review trail could not be loaded.");
      return;
    }

    setReviewEvents(body.events ?? []);
  }

  async function createDecision() {
    setStatus("saving");
    setMessage("");
    const response = await fetch(`/api/pilot-workspaces/${workspace.slug}/trustos-decisions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(scenario.request)
    });
    const body = (await response.json()) as LedgerResponse;

    if (!response.ok) {
      setStatus("error");
      setMessage(body.error?.message ?? "The governed TrustOS decision could not be committed.");
      return;
    }

    await refreshLedger(
      body.decision?.id,
      "TrustOS decision, Clinical Trace, and append-only pilot audit evidence committed."
    );
  }

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedDecision) return;

    setStatus("saving");
    setMessage("");
    const response = await fetch(
      `/api/pilot-workspaces/${workspace.slug}/trustos-decisions/${selectedDecision.id}/reviews`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          eventType: "review-disposition-recorded",
          disposition,
          reasonCode,
          notes,
          outcomeMetrics: {
            timeSavedMinutes,
            reviewDurationMinutes,
            workflowOutcome,
            overrideAccepted: disposition === "modified",
            escalationResolved: disposition !== "escalated"
          }
        })
      }
    );
    const body = (await response.json()) as LedgerResponse;

    if (!response.ok) {
      setStatus("error");
      setMessage(body.error?.message ?? "The governed reviewer disposition could not be committed.");
      return;
    }

    setReviewEvents(body.events ?? []);
    setNotes("");
    setStatus("ready");
    setMessage("Human review, outcome signals, and append-only audit evidence committed.");
    await onAuditChanged();
  }

  async function downloadGovernancePacket() {
    if (!selectedDecision) return;

    setMessage("");
    const response = await fetch(
      `/api/pilot-workspaces/${workspace.slug}/trustos-decisions/${selectedDecision.id}/governance-packet`,
      { headers: { Authorization: `Bearer ${session.access_token}` } }
    );

    if (!response.ok) {
      const body = (await response.json()) as LedgerResponse;
      setMessage(body.error?.message ?? "The audited TrustOS governance packet could not be downloaded.");
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `scrimed-${workspace.slug}-${selectedDecision.id}-trustos-governance-packet.md`;
    link.click();
    URL.revokeObjectURL(url);
    await selectDecision(selectedDecision, false);
    await onAuditChanged();
    setMessage("Governance packet downloaded and its append-only audit event committed.");
  }

  return (
    <section className="table-section decision-ledger" aria-label="TrustOS Decision Ledger">
      <div className="section-heading">
        <p className="eyebrow">TrustOS Decision Ledger</p>
        <h2>Durable, tenant-isolated governance evidence.</h2>
        <p className="section-copy">
          Every ledger write requires a verified AAL2 session, authorized tenant role, server-held runtime
          authorization, metadata-only evidence, and an append-only audit event.
        </p>
      </div>

      <div className="decision-ledger-summary">
        <article>
          <span>Committed decisions</span>
          <strong>{decisions.length}</strong>
        </article>
        <article>
          <span>Selected review events</span>
          <strong>{reviewEvents.length}</strong>
        </article>
        <article>
          <span>Identity assurance</span>
          <strong>AAL2 required</strong>
        </article>
      </div>

      <div className="evaluation-form decision-commit-form">
        <label className="form-field form-field-wide">
          <span>Governed synthetic scenario</span>
          <select value={scenarioSlug} onChange={(event) => setScenarioSlug(event.target.value)}>
            {safeDecisionScenarios.map((candidate) => (
              <option key={candidate.slug} value={candidate.slug}>
                {candidate.label}
              </option>
            ))}
          </select>
          <small>No raw request context or patient-level data is retained in the ledger.</small>
        </label>
        <div className="form-actions">
          <button className="primary-action" disabled={status === "saving"} onClick={createDecision} type="button">
            {status === "saving" ? "Committing Evidence" : "Run And Commit TrustOS Decision"}
          </button>
        </div>
        {message ? <div className="intake-alert">{message}</div> : null}
      </div>

      <div className="decision-ledger-grid">
        <div className="decision-list" aria-label="Committed TrustOS decisions">
          {decisions.length > 0 ? (
            decisions.map((decision) => (
              <button
                className={`decision-list-item${selectedDecision?.id === decision.id ? " decision-list-item-active" : ""}`}
                key={decision.id}
                onClick={() => selectDecision(decision)}
                type="button"
              >
                <span>{displayValue(decision.decision)}</span>
                <strong>{decision.workflow}</strong>
                <small>{formatDate(decision.createdAt)}</small>
              </button>
            ))
          ) : (
            <div className="decision-list-empty">
              <strong>No TrustOS decisions committed yet.</strong>
              <p>Run the first governed scenario to create durable buyer evidence.</p>
            </div>
          )}
        </div>

        <div className="decision-detail">
          {selectedDecision ? (
            <>
              <div className="decision-detail-heading">
                <div>
                  <span>{displayValue(selectedDecision.decision)}</span>
                  <h3>{selectedDecision.decisionRecord.summary}</h3>
                </div>
                <button className="secondary-action" onClick={downloadGovernancePacket} type="button">
                  Download Governance Packet
                </button>
              </div>
              <div className="decision-metrics">
                <div>
                  <span>Confidence</span>
                  <strong>{selectedDecision.confidence}%</strong>
                </div>
                <div>
                  <span>Uncertainty</span>
                  <strong>{selectedDecision.uncertainty}%</strong>
                </div>
                <div>
                  <span>Trace</span>
                  <strong>{selectedDecision.traceId}</strong>
                </div>
              </div>
              <ul className="compact-list">
                {selectedDecision.decisionRecord.controls.map((control) => (
                  <li key={control.control}>
                    <strong>{control.component}: {displayValue(control.status)}</strong>
                    <br />
                    {control.reason}
                  </li>
                ))}
              </ul>

              <form className="evaluation-form governance-review-form" onSubmit={submitReview}>
                <div className="form-grid">
                  <label className="form-field">
                    <span>Reviewer disposition</span>
                    <select
                      value={disposition}
                      onChange={(event) => setDisposition(event.target.value as TrustOSReviewDisposition)}
                    >
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="modified">Modified / override</option>
                      <option value="escalated">Escalated</option>
                    </select>
                  </label>
                  <label className="form-field">
                    <span>Governance reason</span>
                    <select
                      value={reasonCode}
                      onChange={(event) => setReasonCode(event.target.value as TrustOSReviewReasonCode)}
                    >
                      <option value="synthetic-approved">Synthetic approved</option>
                      <option value="evidence-gap">Evidence gap</option>
                      <option value="policy-exception">Policy exception</option>
                      <option value="boundary-violation">Boundary violation</option>
                      <option value="human-judgment">Human judgment</option>
                      <option value="workflow-completed">Workflow completed</option>
                    </select>
                  </label>
                  <label className="form-field">
                    <span>Time saved, minutes</span>
                    <input
                      min="0"
                      onChange={(event) => setTimeSavedMinutes(event.target.value)}
                      type="number"
                      value={timeSavedMinutes}
                    />
                  </label>
                  <label className="form-field">
                    <span>Review duration, minutes</span>
                    <input
                      min="0"
                      onChange={(event) => setReviewDurationMinutes(event.target.value)}
                      type="number"
                      value={reviewDurationMinutes}
                    />
                  </label>
                  <label className="form-field">
                    <span>Workflow outcome</span>
                    <select value={workflowOutcome} onChange={(event) => setWorkflowOutcome(event.target.value)}>
                      <option value="synthetic-complete">Synthetic complete</option>
                      <option value="held-for-review">Held for review</option>
                      <option value="denied-as-designed">Denied as designed</option>
                    </select>
                  </label>
                  <label className="form-field form-field-wide">
                    <span>Operational review note</span>
                    <textarea
                      maxLength={600}
                      onChange={(event) => setNotes(event.target.value)}
                      placeholder="Metadata-only operational note. Do not enter PHI or patient-level content."
                      value={notes}
                    />
                  </label>
                </div>
                <div className="form-actions">
                  <button className="primary-action" disabled={status === "saving"} type="submit">
                    Commit Reviewer Disposition
                  </button>
                </div>
              </form>

              <div className="review-event-list">
                <h3>Append-only human review and outcome trail</h3>
                {reviewEvents.length > 0 ? (
                  reviewEvents.map((event) => (
                    <article key={event.id}>
                      <span>{displayValue(event.eventType)}</span>
                      <strong>{displayValue(event.disposition)}: {displayValue(event.reasonCode)}</strong>
                      <small>{formatDate(event.createdAt)}</small>
                    </article>
                  ))
                ) : (
                  <p>No human review or governance packet events recorded yet.</p>
                )}
              </div>
            </>
          ) : (
            <div className="decision-list-empty">
              <strong>Select or commit a TrustOS decision.</strong>
              <p>Control evidence, Clinical Trace, human review, outcomes, and packet export will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
