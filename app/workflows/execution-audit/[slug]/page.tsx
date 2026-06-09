import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getWorkflowExecutionAuditBoundaries,
  getWorkflowExecutionAuditBoundaryBySlug
} from "../../../lib/workflowExecutionAudit";

export function generateStaticParams() {
  return getWorkflowExecutionAuditBoundaries().map((boundary) => ({
    slug: boundary.slug
  }));
}

export default async function WorkflowExecutionAuditDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const boundary = getWorkflowExecutionAuditBoundaryBySlug(slug);

  if (!boundary) {
    notFound();
  }

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/workflows/execution-audit">Execution audit</Link>
        <p className="eyebrow">{boundary.module} audit boundary</p>
        <h1>{boundary.name}</h1>
        <p className="hero-text">{boundary.privacyBoundary}</p>
      </section>

      <section className="section-band hub-summary" aria-label="Workflow execution audit detail summary">
        <article>
          <span>Status</span>
          <strong>{boundary.status}</strong>
        </article>
        <article>
          <span>Event</span>
          <strong>{boundary.eventName}</strong>
        </article>
        <article>
          <span>Response</span>
          <strong>{boundary.deniedResponseCode}</strong>
        </article>
        <article>
          <span>Version</span>
          <strong>{boundary.eventVersion}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Evidence headers</p>
          <h2>{boundary.guardedEndpoint}</h2>
        </div>
        <div className="layer-list">
          {boundary.evidenceHeaders.map((header, index) => (
            <div className="layer-row" key={header}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{header}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Capture policy</p>
          <h2>{boundary.capturePolicy.persistenceStatus}</h2>
          <p className="section-copy">{boundary.promotionRequirement}</p>
        </div>
        <div className="layer-list">
          {boundary.capturePolicy.capture.map((field, index) => (
            <div className="layer-row" key={field}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{field}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="section-band principle-grid" aria-label="Never capture policy">
        {boundary.capturePolicy.neverCapture.map((field) => (
          <article key={field}>
            <h3>{field}</h3>
            <p>Excluded from denied execution audit metadata until an approved privacy and persistence model exists.</p>
          </article>
        ))}
      </section>
    </main>
  );
}
