import Link from "next/link";
import { getWorkflowImplementationReadinessSummary } from "../../lib/workflowImplementationReadiness";

export default function WorkflowImplementationReadinessPage() {
  const summary = getWorkflowImplementationReadinessSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/workflows">Workflows</Link>
        <p className="eyebrow">Implementation readiness</p>
        <h1>Governed execution remains deny-by-default until production boundaries are explicit.</h1>
        <p className="hero-text">
          SCRIMED now exposes locked workflow execution endpoints that reject requests before body parsing, connector access, workflow mutation, or patient-facing action.
        </p>
      </section>

      <section className="section-band hub-summary" aria-label="Workflow implementation readiness summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Mode</span>
          <strong>{summary.runtimeMode}</strong>
        </article>
        <article>
          <span>Ready</span>
          <strong>{summary.ready}</strong>
        </article>
        <article>
          <span>Attention</span>
          <strong>{summary.attentionRequired}</strong>
        </article>
      </section>

      <section className="table-section" aria-label="Governed workflow implementation readiness">
        {summary.workflows.map((workflow) => (
          <article className="module-row" key={workflow.slug}>
            <div>
              <span>{workflow.status}</span>
              <h2>{workflow.name}</h2>
            </div>
            <p>{workflow.deniedResponse.code}</p>
            <Link className="module-link" href={workflow.route}>
              Review locked endpoint and production prerequisites.
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
