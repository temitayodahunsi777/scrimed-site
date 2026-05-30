import { agentWorkflows, getAgentWorkflowSummary } from "../lib/agentWorkflows";

export default function AgentsPage() {
  const summary = getAgentWorkflowSummary();

  return (
    <main>
      <section className="page-hero">
        <a className="back-link" href="/hub">Hub</a>
        <p className="eyebrow">Agent workflow registry</p>
        <h1>Specialized healthcare agents need explicit scope before execution.</h1>
        <p className="hero-text">
          SCRIMED agents are organized by owner, permissions, inputs, outputs, audit events, guardrails, interoperability targets, and human-review requirements before live workflow automation.
        </p>
      </section>

      <section className="section-band hub-summary" aria-label="Agent workflow registry summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Agents</span>
          <strong>{summary.count}</strong>
        </article>
        <article>
          <span>Foundation</span>
          <strong>{summary.foundation}</strong>
        </article>
        <article>
          <span>Human review</span>
          <strong>{summary.humanReviewRequired}</strong>
        </article>
      </section>

      <section className="table-section" aria-label="SCRIMED agent workflows">
        {agentWorkflows.map((workflow) => (
          <article className="module-row" key={workflow.slug}>
            <div>
              <span>{workflow.status}</span>
              <h2>{workflow.name}</h2>
            </div>
            <p>{workflow.owner}</p>
            <a className="module-link" href={workflow.route}>{workflow.objective}</a>
          </article>
        ))}
      </section>
    </main>
  );
}
