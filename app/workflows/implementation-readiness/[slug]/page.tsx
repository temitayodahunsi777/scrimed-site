import { notFound } from "next/navigation";
import {
  getWorkflowImplementationReadiness,
  getWorkflowImplementationReadinessBySlug
} from "../../../lib/workflowImplementationReadiness";

export function generateStaticParams() {
  return getWorkflowImplementationReadiness().map((workflow) => ({
    slug: workflow.slug
  }));
}

export default async function WorkflowImplementationReadinessDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const workflow = getWorkflowImplementationReadinessBySlug(slug);

  if (!workflow) {
    notFound();
  }

  return (
    <main>
      <section className="page-hero">
        <a className="back-link" href="/workflows/implementation-readiness">Readiness</a>
        <p className="eyebrow">{workflow.module} execution readiness</p>
        <h1>{workflow.name}</h1>
        <p className="hero-text">{workflow.auditDisposition}</p>
      </section>

      <section className="section-band hub-summary" aria-label="Governed execution endpoint summary">
        <article>
          <span>Status</span>
          <strong>{workflow.status}</strong>
        </article>
        <article>
          <span>Mode</span>
          <strong>{workflow.runtimeMode}</strong>
        </article>
        <article>
          <span>Method</span>
          <strong>{workflow.method}</strong>
        </article>
        <article>
          <span>Response</span>
          <strong>{workflow.deniedResponse.statusCode}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Locked endpoint</p>
          <h2>{workflow.guardedEndpoint}</h2>
          <p className="section-copy">{workflow.bodyHandling}</p>
        </div>
        <div className="layer-list">
          {workflow.requiredBeforeExecution.map((requirement, index) => (
            <div className="layer-row" key={requirement}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{requirement}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="section-band principle-grid" aria-label="Implementation prerequisites">
        {workflow.prerequisites.map((prerequisite) => (
          <article key={prerequisite.name}>
            <h3>{prerequisite.name}</h3>
            <p>{prerequisite.state}: {prerequisite.requirement}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
