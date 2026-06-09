import Link from "next/link";
import { getWorkflowExecutionAuditSummary } from "../../lib/workflowExecutionAudit";

export default function WorkflowExecutionAuditPage() {
  const summary = getWorkflowExecutionAuditSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/workflows">Workflows</Link>
        <p className="eyebrow">Execution audit</p>
        <h1>Denied execution attempts now have a metadata-only audit boundary.</h1>
        <p className="hero-text">
          SCRIMED defines exactly what blocked workflow execution attempts may capture, what must never be captured, and which evidence headers identify the denied event.
        </p>
      </section>

      <section className="section-band hub-summary" aria-label="Workflow execution audit summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Boundaries</span>
          <strong>{summary.boundaryCount}</strong>
        </article>
        <article>
          <span>Ready</span>
          <strong>{summary.ready}</strong>
        </article>
        <article>
          <span>Persistence</span>
          <strong>{summary.persistenceStatus}</strong>
        </article>
      </section>

      <section className="table-section" aria-label="Workflow execution audit boundaries">
        {summary.boundaries.map((boundary) => (
          <article className="module-row" key={boundary.slug}>
            <div>
              <span>{boundary.status}</span>
              <h2>{boundary.name}</h2>
            </div>
            <p>{boundary.eventName}</p>
            <Link className="module-link" href={boundary.route}>
              Review metadata capture and never-capture policy.
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
