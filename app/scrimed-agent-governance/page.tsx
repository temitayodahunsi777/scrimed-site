import Link from "next/link";
import { getScrimedAgentGovernanceSummary } from "../lib/scrimedAgentGovernance";

export const metadata = {
  title: "SCRIMED Agent Governance",
  description:
    "Synthetic-only SCRIMED Agent Governance control plane for contextual policy, session state, identity, dynamic risk, and human approval."
};

export default function ScrimedAgentGovernancePage() {
  const summary = getScrimedAgentGovernanceSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/scrimed-upgrade-implementation-plan">
          Upgrade Plan
        </Link>
        <p className="eyebrow">SCRIMED CODE pt. 4</p>
        <h1>Agent Governance Control Plane</h1>
        <p className="hero-text">{summary.boundary}</p>
        <div className="hero-actions" aria-label="SCRIMED Agent Governance actions">
          <Link href={summary.apiRoute}>Inspect API</Link>
          <Link href={summary.briefRoute}>Download Brief</Link>
          <Link href="/scrimed-intelligence-safety-stack">Safety Stack</Link>
          <Link href="/scrimed-operating-command">Operating Command</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="SCRIMED Agent Governance summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Agents</span>
          <strong>{summary.identityRegistry.length}</strong>
        </article>
        <article>
          <span>Policies</span>
          <strong>{summary.policies.length}</strong>
        </article>
        <article>
          <span>Decision</span>
          <strong>{summary.sampleEvaluation.decision}</strong>
        </article>
        <article>
          <span>Risk</span>
          <strong>{summary.sampleEvaluation.dynamicRiskScore}</strong>
        </article>
        <article>
          <span>Human approval</span>
          <strong>{summary.sampleEvaluation.humanApprovalRequired ? "required" : "not required"}</strong>
        </article>
      </section>

      <section className="table-section" aria-label="Agent identities">
        <div className="section-heading">
          <p className="eyebrow">Identity Registry</p>
          <h2>Every agent has declared scope, allowed tools, blocked tools, and an owner.</h2>
        </div>
        {summary.identityRegistry.map((agent) => (
          <article className="module-row" key={agent.agentId}>
            <div>
              <span>{agent.declaredScope}</span>
              <h2>{agent.name}</h2>
            </div>
            <p>{agent.owner}</p>
            <div>
              <strong>Blocked tools</strong>
              <p>{agent.blockedTools.join(", ")}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Agent governance policies">
        <div className="section-heading">
          <p className="eyebrow">Contextual Policies</p>
          <h2>Session-state flags drive allow, deny, or require-review decisions.</h2>
        </div>
        {summary.policies.map((policy) => (
          <article className="module-row" key={policy.id}>
            <div>
              <span>{policy.decision}</span>
              <h2>{policy.id}</h2>
            </div>
            <p>{policy.trigger}</p>
            <div>
              <strong>{policy.humanApprovalRequired ? "Human review required" : "Metadata only"}</strong>
              <p>{policy.reason}</p>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
