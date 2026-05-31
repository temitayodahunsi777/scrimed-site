import { getWorkflowExecutionResultSummary } from "../../lib/workflowExecutionResults";

export default function WorkflowExecutionResultsPage() {
  const summary = getWorkflowExecutionResultSummary();

  return (
    <main>
      <section className="page-hero">
        <a className="back-link" href="/workflows">Workflows</a>
        <p className="eyebrow">Execution result fixtures</p>
        <h1>Workflow outputs are captured as deterministic synthetic result fixtures.</h1>
        <p className="hero-text">
          Each staged workflow has a synthetic-only result fixture with output signals, Watchtower traces, review state, blocked actions, and quality evidence before live automation is considered.
        </p>
      </section>

      <section className="section-band hub-summary" aria-label="Workflow result fixture summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Results</span>
          <strong>{summary.resultCount}</strong>
        </article>
        <article>
          <span>Synthetic</span>
          <strong>{summary.syntheticOnly ? "true" : "false"}</strong>
        </article>
      </section>

      <section className="table-section" aria-label="Workflow execution result fixtures">
        {summary.results.map((result) => (
          <article className="module-row" key={result.workflowSlug}>
            <div>
              <span>{result.decisionState}</span>
              <h2>{result.resultId}</h2>
            </div>
            <p>{result.reviewState}</p>
            <a className="module-link" href={result.route}>
              {result.outputSignals.length} outputs, {result.watchtowerTrace.length} trace events
            </a>
          </article>
        ))}
      </section>
    </main>
  );
}
