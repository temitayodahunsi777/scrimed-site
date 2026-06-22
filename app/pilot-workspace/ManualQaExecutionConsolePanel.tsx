"use client";

import type { Session } from "@supabase/supabase-js";
import { useMemo, useState } from "react";
import type { QaManualRunEvidencePacketRecord } from "../lib/qaEvidenceLedger";
import type { PilotWorkspaceRecord } from "../lib/protectedPilotWorkspace";

type ConsoleStage = {
  id: string;
  name: string;
  status: "passed" | "blocked" | "review";
  owner: string;
  evidence: string;
  action: string;
};

type ConsoleDecision = {
  state: string;
  protectedExecutionRequired: boolean;
  manualRunRequired: boolean;
  retainedPacketVisible: boolean;
  buyerProofReleaseReady: boolean;
  packetCount: number;
  auditSignalCount: number;
  latestPacketHash: string;
  latestWorkflowRunId: string;
  latestWorkflowKind: string;
  latestPacketAuditEventId: string;
  releaseDecisionState: string;
  stages: ConsoleStage[];
  nextAction: string;
  buyerSafeClaim: string;
  hardStops: string[];
  boundary: string;
};

type ConsoleResponse = {
  decision?: ConsoleDecision;
  packetCount?: number;
  auditSignalCount?: number;
  unavailableSections?: string[];
  error?: { message?: string };
};

function statusClass(status: ConsoleStage["status"]) {
  if (status === "passed") return "status-pill status-pill-pass";
  if (status === "review") return "status-pill status-pill-warn";
  return "status-pill status-pill-fail";
}

function fallbackDecision(packets: QaManualRunEvidencePacketRecord[]): ConsoleDecision {
  const latest = packets[0] ?? null;

  return {
    state: latest
      ? "retained-evidence-visible-release-review-required"
      : "operator-aal2-run-required",
    protectedExecutionRequired: true,
    manualRunRequired: !latest,
    retainedPacketVisible: Boolean(latest),
    buyerProofReleaseReady: false,
    packetCount: packets.length,
    auditSignalCount: 0,
    latestPacketHash: latest?.packetSha256 ?? "pending",
    latestWorkflowRunId: latest?.workflowRunId ?? "pending",
    latestWorkflowKind: latest?.workflowKind ?? "pending",
    latestPacketAuditEventId: latest?.packetAuditEventId ?? "pending",
    releaseDecisionState: "protected-refresh-required",
    stages: [
      {
        id: "protected-refresh",
        name: "Protected console refresh",
        status: "review",
        owner: "Tenant governance operator",
        evidence: "Use Refresh Console to read retained packet and audit visibility from the protected API.",
        action: "Refresh before dispatching a new run or releasing buyer proof."
      }
    ],
    nextAction:
      "Refresh the protected console, then use Manual QA Evidence only after the human AAL2 workflow finishes.",
    buyerSafeClaim:
      "SCRIMED protected buyer proof remains locked until retained no-secret packet evidence and Buyer Proof Release pass.",
    hardStops: [
      "Do not paste bearer tokens, credentials, PHI, patient identifiers, payer member data, or production records.",
      "Do not claim clinical, PHI, reimbursement, certification, connector, or production authority from this console."
    ],
    boundary:
      "Protected refresh is required before buyer proof can reference retained manual QA evidence."
  };
}

export default function ManualQaExecutionConsolePanel({
  packets,
  session,
  workspace
}: {
  packets: QaManualRunEvidencePacketRecord[];
  session: Session;
  workspace: PilotWorkspaceRecord;
}) {
  const [decision, setDecision] = useState<ConsoleDecision>(() => fallbackDecision(packets));
  const [status, setStatus] = useState<"idle" | "refreshing">("idle");
  const [message, setMessage] = useState("");
  const protectedRoute = `/api/pilot-workspaces/${workspace.slug}/qa-evidence/manual-execution-console`;
  const latestHash = useMemo(
    () => (decision.latestPacketHash === "pending" ? "pending" : decision.latestPacketHash.slice(0, 12)),
    [decision.latestPacketHash]
  );

  async function refreshConsole() {
    setStatus("refreshing");
    setMessage("");

    const response = await fetch(protectedRoute, {
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    });
    const body = (await response.json()) as ConsoleResponse;
    setStatus("idle");

    if (!response.ok || !body.decision) {
      setMessage(body.error?.message ?? "Manual QA Execution Console could not be refreshed.");
      return;
    }

    setDecision(body.decision);
    setMessage(
      body.unavailableSections?.length
        ? body.unavailableSections.join(" ")
        : "Manual QA Execution Console refreshed from protected packet and audit visibility."
    );
  }

  return (
    <section
      className="table-section"
      id="manual-qa-execution-console"
      aria-label="Manual QA execution console"
    >
      <div className="section-heading">
        <p className="eyebrow">Manual QA Execution Console</p>
        <h2>Run human AAL2 QA from one protected command lane, then release only retained no-secret proof.</h2>
        <p className="section-copy">
          {decision.boundary} The console reads protected evidence state; it does not mint tokens, execute passkeys,
          store credentials, process PHI, or authorize production healthcare activity.
        </p>
      </div>

      <div className="hub-summary verification-summary" aria-label="Manual QA execution console summary">
        <article>
          <span>Console state</span>
          <strong>{decision.state}</strong>
        </article>
        <article>
          <span>Retained packet</span>
          <strong className={decision.retainedPacketVisible ? "status-pill status-pill-pass" : "status-pill status-pill-warn"}>
            {decision.retainedPacketVisible ? "visible" : "pending"}
          </strong>
        </article>
        <article>
          <span>Buyer release</span>
          <strong>{decision.buyerProofReleaseReady ? "ready" : "locked"}</strong>
        </article>
        <article>
          <span>Packet hash</span>
          <strong>{latestHash}</strong>
        </article>
        <article>
          <span>Audit signals</span>
          <strong>{decision.auditSignalCount}</strong>
        </article>
      </div>

      <article className="module-row">
        <div>
          <span>{decision.releaseDecisionState}</span>
          <h2>{decision.buyerSafeClaim}</h2>
        </div>
        <p>{decision.nextAction}</p>
        <div>
          <strong>Latest run: {decision.latestWorkflowRunId}</strong>
          <ul className="compact-list">
            <li>Workflow: {decision.latestWorkflowKind}</li>
            <li>Packet audit event: {decision.latestPacketAuditEventId}</li>
          </ul>
        </div>
      </article>

      <div className="form-actions">
        <button className="primary-action" disabled={status === "refreshing"} onClick={refreshConsole} type="button">
          {status === "refreshing" ? "Refreshing Console" : "Refresh Console"}
        </button>
        <a className="secondary-action" href="/qa-manual-execution-console">
          Public Console
        </a>
        <a className="secondary-action" href="/qa-human-run-packet">
          Human Run Packet
        </a>
        <a className="secondary-action" href="/qa-buyer-proof-release">
          Buyer Proof Release
        </a>
      </div>
      {message ? <div className="intake-alert">{message}</div> : null}

      <div className="demo-runbook" aria-label="Manual QA execution console stages">
        {decision.stages.map((stage) => (
          <article className="module-row" key={stage.id}>
            <div>
              <span className={statusClass(stage.status)}>{stage.status}</span>
              <h2>{stage.name}</h2>
            </div>
            <p>{stage.evidence}</p>
            <div>
              <strong>{stage.owner}</strong>
              <ul className="compact-list">
                <li>{stage.action}</li>
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
