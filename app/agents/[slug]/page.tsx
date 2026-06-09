import Link from "next/link";
import { notFound } from "next/navigation";
import {
  agentWorkflows,
  getAgentWorkflowBySlug
} from "../../lib/agentWorkflows";

export function generateStaticParams() {
  return agentWorkflows.map((workflow) => ({
    slug: workflow.slug
  }));
}

export default async function AgentWorkflowPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const workflow = getAgentWorkflowBySlug(slug);

  if (!workflow) {
    notFound();
  }

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/agents">Agents</Link>
        <p className="eyebrow">{workflow.domain}</p>
        <h1>{workflow.name}</h1>
        <p className="hero-text">{workflow.objective}</p>
      </section>

      <section className="section-band hub-summary" aria-label="Agent workflow summary">
        <article>
          <span>Status</span>
          <strong>{workflow.status}</strong>
        </article>
        <article>
          <span>Owner</span>
          <strong>{workflow.owner}</strong>
        </article>
        <article>
          <span>Permissions</span>
          <strong>{workflow.permissions.length}</strong>
        </article>
        <article>
          <span>Audit events</span>
          <strong>{workflow.auditEvents.length}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Human review</p>
          <h2>{workflow.humanReview.trigger}</h2>
          <p className="section-copy">{workflow.humanReview.reviewer}</p>
        </div>
        <div className="layer-list">
          {workflow.guardrails.map((guardrail, index) => (
            <div className="layer-row" key={guardrail}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{guardrail}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="section-band principle-grid" aria-label="Agent workflow inputs and outputs">
        <article>
          <span>Inputs</span>
          <h3>Minimum context required before workflow execution.</h3>
          <ul className="compact-list">
            {workflow.inputs.map((input) => (
              <li key={input}>{input}</li>
            ))}
          </ul>
        </article>
        <article>
          <span>Outputs</span>
          <h3>Reviewable artifacts the agent can produce.</h3>
          <ul className="compact-list">
            {workflow.outputs.map((output) => (
              <li key={output}>{output}</li>
            ))}
          </ul>
        </article>
        <article>
          <span>Interoperability</span>
          <h3>Connector targets this workflow may eventually depend on.</h3>
          <ul className="compact-list">
            {workflow.interoperabilityTargets.map((target) => (
              <li key={target}>{target}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="section-band principle-grid" aria-label="Agent permissions and audit trail">
        <article>
          <span>Permissions</span>
          <h3>Least-privilege capabilities allowed for this workflow.</h3>
          <ul className="compact-list">
            {workflow.permissions.map((permission) => (
              <li key={permission}>{permission}</li>
            ))}
          </ul>
        </article>
        <article>
          <span>Audit events</span>
          <h3>Events that must remain observable and reviewable.</h3>
          <ul className="compact-list">
            {workflow.auditEvents.map((event) => (
              <li key={event}>{event}</li>
            ))}
          </ul>
        </article>
        <article>
          <span>Boundary</span>
          <h3>No SCRIMED agent should operate beyond explicit scope, consent, permissions, and review policy.</h3>
          <p>Workflow promotion remains gated by synthetic validation, integration contracts, readiness checks, and quality gates.</p>
        </article>
      </section>
    </main>
  );
}
