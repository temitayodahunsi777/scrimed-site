"use client";

import type {
  PilotAuditEventRecord,
  PilotSessionRecord,
  PilotWorkspaceRecord
} from "../lib/protectedPilotWorkspace";
import {
  derivePilotDemoReadiness,
  type PilotDemoReadinessState,
  type TenantSessionVerificationReadiness
} from "../lib/pilotDemoReadiness";

function stateLabel(state: PilotDemoReadinessState) {
  if (state === "ready") return "Ready";
  if (state === "blocked") return "Blocked";
  return "Review";
}

function stateClass(state: PilotDemoReadinessState) {
  if (state === "ready") return "status-pill status-pill-pass";
  if (state === "blocked") return "status-pill status-pill-fail";
  return "status-pill status-pill-warn";
}

export default function PilotDemoReadinessCommandCenter({
  auditEvents,
  enterprisePacketBusy,
  onCreateSession,
  onDownloadEnterprisePacket,
  sessions,
  status,
  verification,
  workspace
}: {
  auditEvents: PilotAuditEventRecord[];
  enterprisePacketBusy: boolean;
  onCreateSession: () => Promise<void>;
  onDownloadEnterprisePacket: () => Promise<void>;
  sessions: PilotSessionRecord[];
  status: "idle" | "creating-session";
  verification: TenantSessionVerificationReadiness | null;
  workspace: PilotWorkspaceRecord;
}) {
  const readiness = derivePilotDemoReadiness({ auditEvents, sessions, verification, workspace });
  const hasDurableSession = sessions.length > 0;

  return (
    <section className="table-section demo-readiness-command" aria-label="Pilot demo readiness command center">
      <div className="section-heading">
        <p className="eyebrow">Pilot demo readiness command center</p>
        <h2>Turn protected pilot evidence into a buyer-ready demo plan.</h2>
        <p className="section-copy">
          This command center converts durable synthetic sessions, append-only audit activity, proof packets, and
          tenant-session verification into a readiness decision for enterprise pilot calls. It remains synthetic-only
          and does not authorize PHI, live clinical execution, payer submission, patient outreach, or autonomous care.
        </p>
        <div className="form-actions">
          <button
            className="primary-action"
            disabled={status === "creating-session"}
            onClick={onCreateSession}
            type="button"
          >
            {status === "creating-session" ? "Creating Session" : "Create Synthetic Session"}
          </button>
          <a className="secondary-action" href="#tenant-session-verification">
            Run Tenant Verification
          </a>
          <button
            className="secondary-action"
            disabled={enterprisePacketBusy}
            onClick={onDownloadEnterprisePacket}
            type="button"
          >
            {enterprisePacketBusy ? "Preparing Packet" : "Download Enterprise Packet"}
          </button>
        </div>
      </div>

      <div className="hub-summary demo-readiness-summary" aria-label="Demo readiness summary">
        <article>
          <span>Readiness</span>
          <strong>{stateLabel(readiness.state)}</strong>
        </article>
        <article>
          <span>Score</span>
          <strong>{readiness.score}%</strong>
        </article>
        <article>
          <span>Passed</span>
          <strong>{readiness.passed}</strong>
        </article>
        <article>
          <span>Review</span>
          <strong>{readiness.review}</strong>
        </article>
        <article>
          <span>Blocked</span>
          <strong>{readiness.blocked}</strong>
        </article>
        <article>
          <span>Last evidence</span>
          <strong>{readiness.lastEvidenceAt}</strong>
        </article>
      </div>

      <div className="agent-readiness-grid demo-readiness-brief" aria-label="Buyer demo brief">
        {readiness.buyerBrief.map((line) => (
          <article key={line}>
            <span>Buyer brief</span>
            <strong>{line}</strong>
            <p>Use this only as enterprise evaluation context, not as a clinical, legal, or compliance claim.</p>
          </article>
        ))}
      </div>

      {readiness.requiredActions.length > 0 ? (
        <div className="intake-alert">
          {readiness.requiredActions.slice(0, 3).map((action) => (
            <p key={action}>{action}</p>
          ))}
        </div>
      ) : null}

      {readiness.checks.map((check) => (
        <article className="module-row" key={check.id}>
          <div>
            <span>{check.owner}</span>
            <h2>{check.label}</h2>
            <p>{check.evidence}</p>
          </div>
          <strong className={stateClass(check.state)}>{stateLabel(check.state)}</strong>
          <p>
            {check.action} {check.boundary}
          </p>
        </article>
      ))}

      <div className="demo-runbook" aria-label="Buyer demo runbook">
        <div className="section-heading">
          <p className="eyebrow">Buyer call runbook</p>
          <h2>Use the same evidence order on every enterprise demo.</h2>
        </div>
        {readiness.runbook.map((step, index) => (
          <article className="module-row" key={step.step}>
            <div>
              <span>{String(index + 1).padStart(2, "0")} / {step.owner}</span>
              <h2>{step.step}</h2>
            </div>
            <strong className={stateClass(step.state)}>{stateLabel(step.state)}</strong>
            <p>{step.proof}</p>
          </article>
        ))}
      </div>

      {!hasDurableSession ? (
        <article className="module-row">
          <div>
            <span>blocked demo path</span>
            <h2>Create at least one retained synthetic session before presenting protected evidence.</h2>
          </div>
          <strong className="status-pill status-pill-fail">Blocked</strong>
          <p>
            Empty workspaces are acceptable for infrastructure review, but buyer product demos need retained,
            auditable synthetic evidence.
          </p>
        </article>
      ) : null}
    </section>
  );
}
