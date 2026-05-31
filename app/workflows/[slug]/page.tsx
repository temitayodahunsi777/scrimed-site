import { notFound } from "next/navigation";
import {
  getWorkflowExecutionBySlug,
  getWorkflowExecutionReadinessBySlug,
  workflowExecutions
} from "../../lib/workflowExecutions";

export function generateStaticParams() {
  return workflowExecutions.map((workflow) => ({
    slug: workflow.slug
  }));
}

export default async function WorkflowExecutionDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const workflow = getWorkflowExecutionBySlug(slug);
  const readiness = getWorkflowExecutionReadinessBySlug(slug);

  if (!workflow || !readiness) {
    notFound();
  }

  return (
    <main>
      <section className="page-hero">
        <a className="back-link" href="/workflows">Workflows</a>
        <p className="eyebrow">{workflow.module} execution</p>
        <h1>{workflow.name}</h1>
        <p className="hero-text">{workflow.objective}</p>
      </section>

      <section className="section-band hub-summary" aria-label="Workflow readiness summary">
        <article>
          <span>Status</span>
          <strong>{readiness.status}</strong>
        </article>
        <article>
          <span>Agent</span>
          <strong>{workflow.agentWorkflowSlug}</strong>
        </article>
        <article>
          <span>Passed</span>
          <strong>{readiness.passed}</strong>
        </article>
        <article>
          <span>Failed</span>
          <strong>{readiness.failed}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Execution steps</p>
          <h2>Synthetic-only workflow sequence.</h2>
        </div>
        <div className="layer-list">
          {workflow.executionSteps.map((step, index) => (
            <div className="layer-row" key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{step}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="section-band principle-grid" aria-label="Workflow readiness checks">
        {readiness.checks.map((check) => (
          <article key={check.id}>
            <h3>{check.label}</h3>
            <p>{check.status}: {check.detail}</p>
          </article>
        ))}
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Human review</p>
          <h2>{workflow.humanReview}</h2>
        </div>
        <div className="layer-list">
          {workflow.prohibitedActions.map((action, index) => (
            <div className="layer-row" key={action}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{action}</strong>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
