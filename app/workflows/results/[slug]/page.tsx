import { notFound } from "next/navigation";
import {
  getWorkflowExecutionResultBySlug,
  workflowExecutionResults
} from "../../../lib/workflowExecutionResults";

export function generateStaticParams() {
  return workflowExecutionResults.map((result) => ({
    slug: result.workflowSlug
  }));
}

export default async function WorkflowExecutionResultDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = getWorkflowExecutionResultBySlug(slug);

  if (!result) {
    notFound();
  }

  return (
    <main>
      <section className="page-hero">
        <a className="back-link" href="/workflows/results">Results</a>
        <p className="eyebrow">Synthetic result fixture</p>
        <h1>{result.resultId}</h1>
        <p className="hero-text">
          {result.workflowSlug} is held in {result.reviewState} with {result.reviewerRole} review before any live workflow action.
        </p>
      </section>

      <section className="section-band hub-summary" aria-label="Workflow result summary">
        <article>
          <span>Decision</span>
          <strong>{result.decisionState}</strong>
        </article>
        <article>
          <span>Synthetic</span>
          <strong>{result.syntheticOnly ? "true" : "false"}</strong>
        </article>
        <article>
          <span>Outputs</span>
          <strong>{result.outputSignals.length}</strong>
        </article>
        <article>
          <span>Trace</span>
          <strong>{result.watchtowerTrace.length}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Output signals</p>
          <h2>Expected result payload.</h2>
        </div>
        <div className="layer-list">
          {result.outputSignals.map((signal, index) => (
            <div className="layer-row" key={signal}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{signal}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="section-band principle-grid" aria-label="Workflow result controls">
        {result.qualityEvidence.map((evidence) => (
          <article key={evidence}>
            <h3>{evidence}</h3>
            <p>Required evidence before this workflow can progress toward implementation.</p>
          </article>
        ))}
      </section>
    </main>
  );
}
